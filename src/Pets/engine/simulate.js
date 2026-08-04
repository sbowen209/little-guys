/**
 * @file simulate.js
 * @description Runs an entire battle synchronously and returns a timeline of
 * events. It touches no React, no timers and no DOM, so it can be unit tested,
 * replayed from a seed, or run thousands of times for balance passes.
 *
 * The engine never names a pet, a Special or a passive. Everything bespoke lives
 * behind the hook and ability registries in data/, which is what makes adding
 * pets in later versions safe.
 */

import { createRng, randomSeed } from './rng.js';
import {
  createCombatant, snapshotPet, stacksOf, hasStatus, addStacks, removeStacks,
  blocksStatus, immunityLabel, attackDie, defenseDie, rawAttackDie,
  statusesWith, statusDamageFloor, specialBlocked, statusThorns, spcRollPlan, maxSpcDie,
} from './combatant.js';
import { EV } from './events.js';
import {
  RULES, ROLE, STATUS, STATUS_DEFS, statusDef, isDebuff, fieldDef,
  ATTACK_ROLE_ADVANTAGE, DEFENSE_ROLE_ADVANTAGE, affinityVerdict, otherSide,
} from '../data/index.js';


export function simulateBattle({ team1, team2, seed = randomSeed() }) {
  const rng = createRng(seed);

  const sides = [
    team1.map((entry, i) => createCombatant(entry, 0, i)),
    team2.map((entry, i) => createCombatant(entry, 1, i)),
  ];

  if (!sides[0].length || !sides[1].length) {
    throw new Error('Both teams need at least one pet.');
  }

  // Each pet gets a handle on its own side's roster. That is what lets a passive
  // read its team from a *pure* function (Lovey Dovey's Max SPC, Surface
  // Tension's fallen partner) without the derived-stat pipeline needing ctx.
  for (const side of sides) for (const pet of side) pet.team = side;

  const lead = [0, 0];
  const timeline = [];
  const switchInBonus = [null, null];
  /** Arena-wide conditions, once established they run to the final bell. */
  const fields = new Set();

  let eventId = 0;
  let turnCount = 0;
  let stagnationCounter = 0;
  let hpWatermark = 0;
  let priorityOverride = null;

  const active = (side) => sides[side][lead[side]];
  const alive = (side) => sides[side].some((p) => !p.fainted);

  const snapshot = () => ({
    lead: [lead[0], lead[1]],
    teams: [sides[0].map(snapshotPet), sides[1].map(snapshotPet)],
    turn: turnCount,
    fields: [...fields],
    // The stall clock, so the HUD can show how close Stagnation is without
    // re-deriving the rule.
    stagnation: {
      counter: stagnationCounter,
      threshold: stagThreshold(),
      stacks: stacksOf(active(0), STATUS.STAGNATION),
    },
  });

  const emit = (type, payload = {}) => {
    const event = { id: eventId++, type, ...payload, state: snapshot() };
    timeline.push(event);
    return event;
  };

  /* ── PASSIVE PLUMBING ──────────────────────────────────────────── */

  const fire = (pet, hook, payload) => {
    if (!pet) return;
    for (const passive of pet.passives) {
      const fn = passive.hooks?.[hook];
      if (fn) fn({ ctx, self: pet, ...payload });
    }
  };

  const sum = (pet, hook, payload) => {
    if (!pet) return 0;
    let total = 0;
    for (const passive of pet.passives) {
      const fn = passive.hooks?.[hook];
      if (fn) total += fn({ ctx, self: pet, ...payload }) || 0;
    }
    return total;
  };

  const best = (pet, hook, fallback, payload = {}) => {
    if (!pet) return fallback;
    let result = fallback;
    for (const passive of pet.passives) {
      const fn = passive.hooks?.[hook];
      if (fn) result = Math.max(result, fn({ ctx, self: pet, ...payload }) || 0);
    }
    return result;
  };

  /* ── SPECIAL CHARGE ────────────────────────────────────────────── */

  let spcLedger = [];

  const gainSpc = (pet, amount, source) => {
    if (!pet || pet.fainted || amount <= 0) return 0;
    const before = pet.spc;
    pet.spc = Math.min(RULES.SPC_CAP, pet.spc + amount);
    const actual = pet.spc - before;
    if (actual <= 0) return 0;

    spcLedger.push({
      instanceId: pet.instanceId, side: pet.side, slot: pet.slot,
      name: pet.name, amount: actual, total: pet.spc, source,
    });

    // Bond shares never re-propagate, or a bonded pair would feed each other forever.
    if (source !== 'bond') {
      for (const ally of sides[pet.side]) {
        if (ally === pet || ally.fainted) continue;
        fire(ally, 'onAllySpcGain', { ally: pet, amount: actual });
      }
    }
    return actual;
  };

  const setSpc = (pet, value, label) => {
    if (!pet || pet.spc === value) return;
    const delta = value - pet.spc;
    pet.spc = Math.max(0, Math.min(RULES.SPC_CAP, value));
    spcLedger.push({
      instanceId: pet.instanceId, side: pet.side, slot: pet.slot,
      name: pet.name, amount: delta, total: pet.spc, source: label ?? 'adjust',
    });
  };

  const flushSpc = (extra = {}) => {
    if (!spcLedger.length) return;
    const entries = spcLedger;
    spcLedger = [];
    emit(EV.SPC_GAIN, { entries, ...extra });
  };

  /* ── STATUSES ──────────────────────────────────────────────────── */

  const applyStatus = (target, id, stacks = 1, { source = null, label = null, washable = false } = {}) => {
    if (!target || target.fainted || stacks <= 0) return false;

    if (blocksStatus(target, id)) {
      emit(EV.PASSIVE, {
        side: target.side, slot: target.slot, label: immunityLabel(target, id),
        text: 'IMMUNE', tone: 'defend', hold: 420,
      });
      return false;
    }

    const meta = {};
    // Stamped so the end-of-turn decay can spare a curse applied this turn.
    if (id === STATUS.CURSED) meta.appliedOn = turnCount;
    /**
     * Damp comes in two flavours and the applier picks. Wear Down grinds
     * `washable` stacks onto an attacker that rinse off the next time that
     * attacker takes a hit; the soaking a popped Bubble Shield leaves is
     * permanent. Tracking the washable share separately is what lets one status
     * carry both without the HUD showing two near-identical icons.
     */
    if (id === STATUS.DAMP && washable) {
      meta.washable = (target.statuses[id]?.washable ?? 0) + stacks;
    }
    if (id === STATUS.BURN) {
      const potency = best(source, 'burnPotency', STATUS_DEFS[STATUS.BURN].defaultPotency);
      meta.potency = Math.max(target.statuses[id]?.potency ?? 0, potency);
    }
    /**
     * The same idea, generalised to every ticking status: damage is captured
     * from the applier when the status lands, so a stack stays as nasty as
     * whoever inflicted it regardless of who is carrying it later. Burn keeps
     * its own bespoke hook because it predates this.
     */
    const tick = STATUS_DEFS[id]?.tickOnTurn;
    if (tick) {
      const potency = best(source, 'tickPotency', tick.damage ?? 0, { statusId: id });
      meta.potency = Math.max(target.statuses[id]?.potency ?? 0, potency);
    }

    const total = addStacks(target, id, stacks, meta);
    emit(EV.STATUS_APPLY, {
      side: target.side, slot: target.slot, status: id, stacks, total,
      label, name: statusDef(id).name, potency: meta.potency,
    });

    if (id === STATUS.STUN_COUNTER) convertStunCounters(target, source);
    fire(source, 'onStatusApplied', { target, statusId: id, stacks });
    return true;
  };

  const expireStatus = (pet, id, count = 1) => {
    if (!stacksOf(pet, id)) return;
    const left = removeStacks(pet, id, count);
    emit(EV.STATUS_EXPIRE, {
      side: pet.side, slot: pet.slot, status: id, remaining: left,
      name: statusDef(id).name, hold: 160,
    });
  };

  /**
   * Spends the statuses that declare they fall off at this moment. `field` is
   * one of the consume/expire fields documented in data/statuses.js, so the
   * engine never has to know which status is which.
   */
  const consumeStatuses = (pet, field) => {
    if (!pet) return;
    for (const { id, def } of statusesWith(pet, field)) {
      expireStatus(pet, id, def[field]);
    }
  };

  const convertStunCounters = (target, source) => {
    if (stacksOf(target, STATUS.STUN_COUNTER) < RULES.STUN_COUNTERS_TO_STUN) return;
    removeStacks(target, STATUS.STUN_COUNTER, stacksOf(target, STATUS.STUN_COUNTER));
    addStacks(target, STATUS.STUNNED, 1);
    emit(EV.STATUS_APPLY, {
      side: target.side, slot: target.slot, status: STATUS.STUNNED,
      stacks: 1, total: 1, name: 'Stunned', label: 'Stun Counters',
    });
    fire(source, 'onStunned', { target });
  };

  /* ── HEALTH ────────────────────────────────────────────────────── */

  /**
   * Statuses that widen a wound as it lands (Sliced). Rolled once per incoming
   * attack, before the damage is applied, so the extra shows up as one larger
   * number rather than a second hit.
   */
  const amplifyIncoming = (target) => {
    let extra = 0;
    for (const { id, def } of statusesWith(target, 'amplifyOnDamaged')) {
      const spec = def.amplifyOnDamaged;
      const roll = rng.die(spec.dieSize);
      const proc = spec.procValues.includes(roll);

      emit(EV.STATUS_TICK, {
        side: target.side, slot: target.slot, status: id, name: def.name,
        dieSize: spec.dieSize, rolls: [roll], procValues: spec.procValues,
        damage: proc ? spec.damage : 0, cleared: proc ? spec.consume : 0,
      });

      if (!proc) continue;
      removeStacks(target, id, spec.consume);
      extra += spec.damage;
    }
    return extra;
  };

  /** Rinses off only the Damp stacks that were applied as washable. */
  const washDamp = (target) => {
    const entry = target.statuses[STATUS.DAMP];
    if (!entry?.washable) return;
    const count = Math.min(entry.washable, entry.stacks);
    entry.washable = 0;
    if (count > 0) expireStatus(target, STATUS.DAMP, count);
  };

  const dealDamage = (target, amount, { attacker = null, cause = null, fromAttack = false } = {}) => {
    if (!target || target.fainted || amount <= 0) return 0;

    if (fromAttack) amount += amplifyIncoming(target);

    const before = target.hp;
    target.hp = Math.max(0, target.hp - amount);
    const dealt = before - target.hp;
    const downed = target.hp === 0;

    emit(EV.IMPACT, {
      side: target.side, slot: target.slot, amount: dealt,
      hpAfter: target.hp, cause, fromAttack,
      lethal: downed,
    });

    washDamp(target);

    // A popped shield leaves the attacker Damp — permanently, unlike Wear Down's.
    if (hasStatus(target, STATUS.BUBBLE_SHIELD)) {
      expireStatus(target, STATUS.BUBBLE_SHIELD, 1);
      fire(target, 'onShieldPopped', { attacker });
      if (attacker && !attacker.fainted) {
        applyStatus(attacker, STATUS.DAMP, 1, { source: target, label: 'Bubble Shield' });
      }
    }

    // Marked down before the reactions run, so anything a dying pet would apply
    // to ITSELF quietly no-ops (applyStatus, gainSpc and heal all refuse a
    // fainted pet) while everything it aims outward still lands.
    if (downed) {
      target.fainted = true;
      target.killedBy = attacker ?? null;
    }

    /**
     * Reactions fire even when the blow was fatal. "When damaged" means exactly
     * that: Zaptap answers the pet that just killed it, Flame Aura still burns
     * the killer, Bonecrusher still cracks their shell. Skipping all of it on a
     * lethal hit made every on-damage effect quietly unreliable — the last hit
     * of a fight is the one that most needs to be paid for.
     */
    if (fromAttack) {
      fire(target, 'onDamaged', { attacker, amount: dealt });

      // Thorns answer the attacker, then spend a stack. The reflected hit is
      // not itself an attack, so a pair of thorned pets cannot loop.
      if (attacker && !attacker.fainted && statusThorns(target) > 0) {
        for (const { def } of statusesWith(target, 'thorns')) {
          dealDamage(attacker, def.thorns, { cause: def.name });
        }
      }
      consumeStatuses(target, 'consumeOnDamaged');
    }

    // Last, so a killer that got itself killed on the way in (thorns, Parting
    // Quills) does not also collect the bounty.
    if (downed && attacker && !attacker.fainted) fire(attacker, 'onKO', { target });

    return dealt;
  };

  /**
   * `overheal` lets a heal push a pet past its Max HP. The nameplate grows extra
   * hearts to match, so the surplus is visible rather than silently discarded.
   */
  const heal = (target, amount, { label = null, overheal = false } = {}) => {
    if (!target || target.fainted || amount <= 0) return 0;
    const before = target.hp;
    target.hp = overheal ? target.hp + amount : Math.min(target.maxHp, target.hp + amount);
    const healed = target.hp - before;
    if (healed > 0) {
      emit(EV.HEAL, {
        side: target.side, slot: target.slot, amount: healed,
        hpAfter: target.hp, label,
      });
    }
    return healed;
  };

  const modStat = (pet, key, delta, { label = null } = {}) => {
    if (!pet || pet.fainted || delta === 0) return;
    pet.mods[key] += delta;
    emit(EV.STAT_MOD, {
      side: pet.side, slot: pet.slot, key, delta, label,
      atkDie: attackDie(pet), defDie: defenseDie(pet),
    });
  };

  /* ── CONTEXT HANDED TO ABILITIES AND PASSIVES ──────────────────── */

  /** Living pets on a side that are not the one currently on the field. */
  const benchOf = (side) => sides[side].filter((p, i) => !p.fainted && i !== lead[side]);

  const ctx = {
    rng,
    applyStatus,
    expireStatus,
    dealDamage,
    heal,
    modStat,
    gainSpc,
    setSpc,
    rawAttackDie,
    /** Max SPC after passives — what Lifesteal siphons. */
    maxSpc: maxSpcDie,
    activeFoeOf: (pet) => active(otherSide(pet.side)),
    alliesOf: (pet) => sides[pet.side].filter((p) => p !== pet && !p.fainted),
    /** The opposing team's bench — anything that reaches past the active pet. */
    benchedFoesOf: (pet) => benchOf(otherSide(pet.side)),
    benchedAlliesOf: (pet) => benchOf(pet.side),
    /** The whole opposing roster, fainted included — for counting losses. */
    foesOf: (pet) => sides[otherSide(pet.side)],
    queueSwitchInBonus: (side, bonus) => { switchInBonus[side] = bonus; },
    /** Turns on an arena-wide condition for the rest of the match. */
    establishField: (id, label) => establishField(id, label),
    /** Awards Healer charge from outside a successful attack. */
    addHeartCounters: (pet, count, label) => awardHeartCounters(pet, count, label),
    /** Washes off every debuff at once. Buffs and system statuses are left alone. */
    clearDebuffs: (pet, label) => {
      if (!pet || pet.fainted) return 0;
      const ids = Object.keys(pet.statuses).filter((id) => isDebuff(id));
      for (const id of ids) expireStatus(pet, id, stacksOf(pet, id));
      if (ids.length) {
        emit(EV.PASSIVE, {
          side: pet.side, slot: pet.slot, label, text: 'CLEANSED', tone: 'heal', hold: 420,
        });
      }
      return ids.length;
    },
    /** Drags a random benched pet onto the field in place of the active one. */
    forceSwitch: (side, { label = null } = {}) => forceSwitch(side, label),
  };

  /* ── ADVANTAGE ─────────────────────────────────────────────────── */

  const attackAdvantage = (attacker, defender, isSpecial) => {
    const reasons = [];
    let adv = 0;

    if (ATTACK_ROLE_ADVANTAGE[attacker.species.role]?.includes(defender.species.role)) {
      adv += 1;
      reasons.push('Role');
    }

    if (attacker.species.role === ROLE.AFF_ATTACKER) {
      const verdict = affinityVerdict(attacker.species.typing.offensive, defender.species.typing.defensive);
      if (verdict > 0) { adv += 1; reasons.push(`${attacker.species.typing.offensive} > ${defender.species.typing.defensive}`); }
      if (verdict < 0) { adv -= 1; reasons.push(`${attacker.species.typing.offensive} < ${defender.species.typing.defensive}`); }
    }

    for (const passive of attacker.passives) {
      const value = passive.hooks?.attackAdvantage?.({ ctx, self: attacker, target: defender, isSpecial }) || 0;
      if (value) { adv += value; reasons.push(passive.name); }
    }

    // Statuses that grant or impose advantage on the attacker's roll. A stack
    // is one attack's worth, so the count never changes the size of the net.
    for (const { def } of statusesWith(attacker, 'attackAdvantage')) {
      adv += def.attackAdvantage;
      reasons.push(def.name);
    }

    // Net, not clamped: two sources of advantage roll three dice, and an
    // advantage cancels a disadvantage outright.
    return { adv, reasons };
  };

  const defenseAdvantage = (defender, attacker, isSpecial) => {
    const reasons = [];
    let adv = 0;

    if (DEFENSE_ROLE_ADVANTAGE[defender.species.role]?.includes(attacker.species.role)) {
      adv += 1;
      reasons.push('Role');
    }

    for (const passive of defender.passives) {
      const value = passive.hooks?.defenseAdvantage?.({ ctx, self: defender, attacker, isSpecial }) || 0;
      if (value) { adv += value; reasons.push(passive.name); }
    }

    return { adv, reasons };
  };

  /** One die, plus one more for every net step of advantage or disadvantage. */
  const rollWith = (max, advantage) => {
    const rolls = [];
    for (let i = 0; i <= Math.abs(advantage); i += 1) rolls.push(rng.die(max));
    const kept = advantage > 0 ? Math.max(...rolls) : advantage < 0 ? Math.min(...rolls) : rolls[0];
    return { rolls, kept, max, advantage };
  };

  /* ── ACTIONS ───────────────────────────────────────────────────── */

  /**
   * Cursed is a flat 50% to null the damage, however many stacks are on you —
   * stacks are duration, not probability, and are spent by the end-of-turn
   * decay rather than by triggering.
   */
  const curseCheck = (attacker, damage) => {
    if (damage <= 0 || !hasStatus(attacker, STATUS.CURSED)) return damage;

    const roll = rng.die(2);
    const nullified = roll === 1;

    emit(EV.STATUS_TICK, {
      side: attacker.side, slot: attacker.slot,
      status: STATUS.CURSED, name: 'Cursed',
      dieSize: 2, rolls: [roll], procValues: [1],
      damage: 0, cleared: 0, nullified,
    });

    return nullified ? 0 : damage;
  };

  const applyPackets = (source, target, packets, label) => {
    for (const packet of packets ?? []) {
      applyStatus(target, packet.status, packet.stacks ?? 1, { source, label });
    }
  };

  /**
   * Heart Counters, from a landed attack or from a passive. At the threshold
   * they cash in for a heart on the most wounded ally, bench included.
   */
  const awardHeartCounters = (pet, count = 1, label = 'Heart Counter') => {
    if (!pet || pet.fainted || count <= 0) return;
    pet.heartCounters += count;
    emit(EV.PASSIVE, {
      side: pet.side, slot: pet.slot, label,
      text: `♥ ${Math.min(pet.heartCounters, RULES.HEART_COUNTERS_TO_HEAL)}/${RULES.HEART_COUNTERS_TO_HEAL}`,
      tone: 'heal', hold: 380,
    });
    if (pet.heartCounters < RULES.HEART_COUNTERS_TO_HEAL) return;

    pet.heartCounters = 0;
    const wounded = sides[pet.side]
      .filter((p) => !p.fainted && p.hp < p.maxHp)
      .sort((a, b) => a.hp - b.hp)[0];
    if (wounded) heal(wounded, 1, { label: 'Heart Counters' });
  };

  const runHealerCounters = (attacker) => {
    if (attacker.species.role !== ROLE.HEALER) return;
    awardHeartCounters(attacker, 1);
  };

  const resolveEffectSpecial = (attacker, defender, ability) => {
    attacker.mods.atkNext = 0;

    emit(EV.ACTION, {
      side: attacker.side, slot: attacker.slot, kind: 'special', effect: true,
      ability: ability.id, name: ability.name, vfx: ability.vfx,
      element: ability.element, desc: ability.desc,
    });

    applyPackets(attacker, attacker, ability.applyToSelf, ability.name);
    applyPackets(attacker, defender, ability.applyToTarget, ability.name);
    ability.onResolve?.({ ctx, self: attacker, target: defender, hit: true });
    flushSpc();
  };

  const resolveAttack = (attacker, defender, ability) => {
    const isSpecial = Boolean(ability);
    // A passive can multiply the roll on top of whatever the Special asks for.
    const passiveScale = best(attacker, 'attackScale', 1, { target: defender, isSpecial });
    const scale = (isSpecial ? ability.atkScale ?? 1 : 1) * passiveScale;
    const targetFade = hasStatus(defender, STATUS.FADE);
    const trueStrike = Boolean(isSpecial && ability.trueStrike);

    // Flat swings on the attack die come from both sides: the attacker's own
    // passives, and anything the defender does to blunt incoming attacks.
    const flat = sum(attacker, 'attackFlatMod', { target: defender, isSpecial })
      + sum(defender, 'foeAttackMod', { attacker, isSpecial });

    const atkMax = attackDie(attacker, {
      scale, targetFade, flat, fromDef: Boolean(ability?.atkFromDef),
    });
    const defMax = defenseDie(defender);

    const atkAdv = attackAdvantage(attacker, defender, isSpecial);
    const defAdv = defenseAdvantage(defender, attacker, isSpecial);

    emit(EV.ACTION, {
      side: attacker.side, slot: attacker.slot,
      kind: isSpecial ? 'special' : 'standard',
      ability: ability?.id ?? null,
      name: isSpecial ? ability.name : 'Strike',
      vfx: ability?.vfx ?? 'strike',
      element: ability?.element ?? attacker.species.typing.offensive,
      desc: ability?.desc ?? null,
      scale,
      trueStrike,
    });

    const atkRoll = rollWith(atkMax, atkAdv.adv);
    const defRoll = trueStrike ? null : rollWith(defMax, defAdv.adv);
    // Ties go to the attacker.
    const hit = trueStrike || atkRoll.kept >= defRoll.kept;

    emit(EV.ROLL, {
      side: attacker.side,
      attacker: { side: attacker.side, slot: attacker.slot, ...atkRoll, reasons: atkAdv.reasons },
      defender: defRoll
        ? { side: defender.side, slot: defender.slot, ...defRoll, reasons: defAdv.reasons }
        : { side: defender.side, slot: defender.slot, trueStrike: true },
      hit,
      trueStrike,
      fadeApplied: targetFade,
    });

    // Per-attack resources burn off whether or not the strike lands.
    if (hasStatus(attacker, STATUS.SHED)) expireStatus(attacker, STATUS.SHED, 1);
    if (targetFade) expireStatus(defender, STATUS.FADE, 1);
    const damageFloor = statusDamageFloor(attacker);
    consumeStatuses(attacker, 'consumeOnAttack');
    attacker.mods.atkNext = 0;
    defender.mods.defNext = 0;

    if (!hit) {
      emit(EV.BLOCK, { side: defender.side, slot: defender.slot });
      if (isSpecial && ability.selfEffectsOnMiss) {
        applyPackets(attacker, attacker, ability.applyToSelf, ability.name);
      }
      fire(attacker, 'onAttackMiss', { target: defender, isSpecial });
      fire(defender, 'onBlocked', { attacker, isSpecial });
      ability?.onResolve?.({ ctx, self: attacker, target: defender, hit: false });
      flushSpc();
      return;
    }

    consumeStatuses(attacker, 'consumeOnHit');

    // Effects land before damage so Stun conversion (and Capitalize) resolve first.
    applyPackets(attacker, attacker, ability?.applyToSelf, ability?.name);
    if (attacker.species.role === ROLE.STUNNER) {
      applyStatus(defender, STATUS.STUN_COUNTER, 1, { source: attacker, label: 'Stunner' });
    }
    applyPackets(attacker, defender, ability?.applyToTarget, ability?.name);

    fire(attacker, 'onAttackHit', { target: defender, isSpecial });

    let damage = Math.max(ability?.damage ?? 1, damageFloor);
    // A Special can be written to bite harder into particular defending roles.
    if (ability?.bonusVsRoles?.roles?.includes(defender.species.role)) {
      damage += ability.bonusVsRoles.damage;
    }
    damage += sum(attacker, 'damageBonus', { target: defender, damage, advantage: atkAdv.adv });
    damage = curseCheck(attacker, damage);

    if (damage > 0) {
      const dealt = dealDamage(defender, damage, { attacker, cause: ability?.name ?? null, fromAttack: true });
      if (dealt > 0) {
        // Lifesteal returns the damage as health, capped at the attacker's own Max HP.
        if (ability?.lifesteal) heal(attacker, dealt, { label: 'Lifesteal' });
        fire(attacker, 'onDealDamage', { target: defender, amount: dealt });
      }
    }

    runHealerCounters(attacker);
    ability?.onResolve?.({ ctx, self: attacker, target: defender, hit: true });
    flushSpc();
  };

  /* ── TURN PHASES ───────────────────────────────────────────────── */

  const tickBurn = (pet) => {
    const burn = pet.statuses[STATUS.BURN];
    if (!burn) return;

    const potency = burn.potency ?? STATUS_DEFS[STATUS.BURN].defaultPotency;
    const rolls = [];
    let cleared = 0;
    let damage = 0;

    for (let i = 0; i < burn.stacks; i += 1) {
      const roll = rng.die(6);
      rolls.push(roll);
      if (roll === 1) { cleared += 1; damage += potency; }
    }

    emit(EV.STATUS_TICK, {
      side: pet.side, slot: pet.slot, status: STATUS.BURN, name: 'Burn',
      dieSize: 6, rolls, procValues: [1], cleared, damage, potency,
    });

    if (cleared > 0) removeStacks(pet, STATUS.BURN, cleared);
    if (damage > 0) dealDamage(pet, damage, { cause: 'Burn' });
  };

  /**
   * Statuses that roll dice at their owner's turn start. Burn predates this and
   * stays bespoke, because its potency is captured per application.
   */
  const tickTurnStatuses = (pet) => {
    for (const { id, def, stacks } of statusesWith(pet, 'tickOnTurn')) {
      const spec = def.tickOnTurn;
      const potency = pet.statuses[id]?.potency ?? spec.damage ?? 0;
      const rolls = [];
      let procs = 0;

      for (let i = 0; i < stacks; i += 1) {
        const roll = rng.die(spec.dieSize);
        rolls.push(roll);
        if (spec.procValues.includes(roll)) procs += 1;
      }

      const damage = procs * potency;
      const cleared = spec.clearOnProc ? procs : 0;

      emit(EV.STATUS_TICK, {
        side: pet.side, slot: pet.slot, status: id, name: def.name,
        dieSize: spec.dieSize, rolls, procValues: spec.procValues, cleared, damage, potency,
      });

      if (cleared > 0) removeStacks(pet, id, cleared);
      if (damage > 0) dealDamage(pet, damage, { cause: def.name });
      if (pet.fainted) return;
    }
  };

  const generateCharge = (side) => {
    const pet = active(side);

    // Statuses can change how many dice are rolled and how big they are; by
    // default it is one die of the pet's own Max SPC.
    const plan = spcRollPlan(pet);
    let rolled = 0;
    for (let i = 0; i < plan.dice; i += 1) rolled += rng.die(plan.size);
    gainSpc(pet, rolled, 'turn');

    // A benched Support keeps generating. This is a ROLE trait, deliberately
    // not a passive: it is the whole reason to hold one in reserve rather than
    // leading with it. A passive can add more on top via the benchCharge hook.
    for (const benched of sides[side]) {
      if (benched === pet || benched.fainted) continue;

      const fromPassive = sum(benched, 'benchCharge', { active: pet });
      if (fromPassive > 0) gainSpc(benched, fromPassive, 'passive');

      if (benched.species.role === ROLE.SUPPORT) {
        const banked = Math.floor(rng.die(maxSpcDie(benched)) * RULES.SUPPORT_BENCH_SHARE);
        if (banked > 0) gainSpc(benched, banked, 'role');
      }
    }

    flushSpc({ side, slot: pet.slot });
    consumeStatuses(pet, 'consumeOnSpcRoll');
  };

  const totalHp = () =>
    sides[0].reduce((n, p) => n + p.hp, 0) + sides[1].reduce((n, p) => n + p.hp, 0);

  /** 6 turns to the first stack, then every 2 once either side is stagnating. */
  const stagThreshold = () => {
    const engaged = hasStatus(active(0), STATUS.STAGNATION) || hasStatus(active(1), STATUS.STAGNATION);
    return engaged ? RULES.STAGNATION_REPEAT : RULES.STAGNATION_FIRST;
  };

  const tickStagnation = () => {
    const current = totalHp();
    if (current < hpWatermark) {
      hpWatermark = current;
      stagnationCounter = 0;
      return;
    }
    hpWatermark = current;
    stagnationCounter += 1;

    if (stagnationCounter < stagThreshold()) return;

    stagnationCounter = 0;
    addStacks(active(0), STATUS.STAGNATION, 1);
    addStacks(active(1), STATUS.STAGNATION, 1);
    emit(EV.STAGNATION, { stacks: stacksOf(active(0), STATUS.STAGNATION) });
  };

  /* ── FIELD EFFECTS ─────────────────────────────────────────────── */

  /**
   * A field belongs to the arena, not to the pet that set it: it survives that
   * pet leaving or dying, is never cleansed, and applies to both sides. Setting
   * one that is already up is a no-op, so a Legendary passive re-entering the
   * field does not re-announce it.
   */
  const establishField = (id, label) => {
    if (fields.has(id)) return false;
    fields.add(id);
    const def = fieldDef(id);
    emit(EV.FIELD, { field: id, name: def?.name ?? id, icon: def?.icon, desc: def?.desc, label });
    return true;
  };

  const runFieldTurnEnd = (pet) => {
    if (!pet || pet.fainted) return;
    for (const id of fields) fieldDef(id)?.hooks?.onTurnEnd?.({ ctx, pet });
  };

  const clearStagnation = () => {
    stagnationCounter = 0;
    for (const side of sides) for (const pet of side) delete pet.statuses[STATUS.STAGNATION];
  };

  /**
   * Cursed loses a stack at the end of the cursed pet's own turn. A stack
   * applied during this very turn is spared, so a reactive passive such as
   * Vengeful Curse — which lands on the attacker mid-attack — always gets a
   * full turn of effect instead of expiring before it can do anything.
   */
  const decayCurse = (side) => {
    const pet = active(side);
    if (!pet || pet.fainted) return;
    const entry = pet.statuses[STATUS.CURSED];
    if (!entry) return;
    if (entry.appliedOn === turnCount) return;
    expireStatus(pet, STATUS.CURSED, 1);
  };

  /**
   * Puts a pet on the field and runs everything that reacts to arriving: any
   * queued switch-in bonus and the onEnterField hook. A knockout replacement
   * and a forced switch both come through here, so "when entering play" means
   * exactly one thing.
   */
  const enterField = (side, index, { previous = null, inherit = 0, label = null } = {}) => {
    // Close the ledger before the lead moves, or charge owed to the pet leaving
    // the field is reported against whoever replaced it.
    flushSpc();

    const next = sides[side][index];
    lead[side] = index;
    if (inherit > 0) gainSpc(next, inherit, 'inherit');

    const bonus = switchInBonus[side];
    switchInBonus[side] = null;

    emit(EV.SWITCH_IN, { side, slot: index, name: next.name, from: previous?.name ?? null, label });
    flushSpc();
    if (bonus?.heal) heal(next, bonus.heal, { label: bonus.label, overheal: bonus.overheal });
    if (bonus?.spc) gainSpc(next, bonus.spc, bonus.label ?? 'switch-in');
    if (bonus?.status) {
      applyStatus(next, bonus.status.id, bonus.status.stacks ?? 1, {
        source: bonus.source ?? null, label: bonus.label,
      });
    }

    next.hasEntered = true;
    next.turnsInPlay = 0;
    fire(next, 'onEnterField', { previous });
    return next;
  };

  /**
   * Drags a random benched pet onto the field in place of the active one. The
   * pet leaving keeps everything except statuses that declare they do not
   * survive the exit.
   */
  const forceSwitch = (side, label) => {
    const outgoing = active(side);
    const options = sides[side]
      .map((pet, index) => ({ pet, index }))
      .filter(({ pet, index }) => !pet.fainted && index !== lead[side]);
    if (!options.length) return null;

    for (const { id } of statusesWith(outgoing, 'clearOnExit')) {
      expireStatus(outgoing, id, stacksOf(outgoing, id));
    }
    return enterField(side, rng.pick(options).index, { previous: outgoing, label });
  };

  /** Handles every pet that hit 0 HP during the last step. */
  const processFaints = () => {
    let switched = false;
    let avenging = null;
    let anyFainted = false;

    for (let side = 0; side < 2; side += 1) {
      const pet = active(side);
      if (!pet.fainted || pet.faintResolved) continue;
      pet.faintResolved = true;
      anyFainted = true;

      clearStagnation();
      emit(EV.FAINT, { side, slot: pet.slot, name: pet.name });
      fire(pet, 'onFaint', { killer: pet.killedBy ?? null });

      const nextIndex = sides[side].findIndex((p) => !p.fainted);
      if (nextIndex === -1) continue;

      // Charge carries over to whoever steps up.
      enterField(side, nextIndex, { previous: pet, inherit: pet.spc });
      switched = true;
      avenging = side;
    }

    // The side that just lost a pet always acts first. If both went down on the
    // same step, the one resolved last takes it.
    if (avenging !== null) priorityOverride = avenging;

    // Only rebase the stall watermark when a pet actually went down —
    // clearStagnation has already zeroed the counter for that case. Rebasing it
    // on every turn left tickStagnation comparing the current total against
    // itself, so `current < hpWatermark` was never true and the clock never
    // reset on a hit: Stagnation arrived on a fixed schedule regardless of
    // whether the fight was actually stalling.
    if (anyFainted) hpWatermark = totalHp();
    return switched;
  };

  const resolveInitiative = (reason) => {
    const p1 = active(0);
    const p2 = active(1);
    const spc1 = maxSpcDie(p1);
    const spc2 = maxSpcDie(p2);
    const tie = spc1 === spc2;
    const winner = tie ? (rng.coin() ? 0 : 1) : spc1 > spc2 ? 0 : 1;

    emit(EV.INITIATIVE, {
      side: winner, reason, tie,
      spc: [spc1, spc2],
      names: [p1.name, p2.name],
    });
    return winner;
  };

  const takeTurn = (side) => {
    const pet = active(side);
    pet.turnsInPlay += 1;
    emit(EV.TURN_START, { side, slot: pet.slot, name: pet.name, turn: turnCount });

    if (hasStatus(pet, STATUS.STUNNED)) {
      removeStacks(pet, STATUS.STUNNED, 1);
      emit(EV.SKIP, { side, slot: pet.slot, reason: 'stunned', text: 'STUNNED' });
      return;
    }

    fire(pet, 'onTurnStart', {});
    if (pet.fainted) return;

    tickBurn(pet);
    if (pet.fainted) return;

    tickTurnStatuses(pet);
    if (pet.fainted) return;

    generateCharge(side);

    if (hasStatus(pet, STATUS.PARALYZED)) {
      const roll = rng.die(RULES.PARALYZE_SKIP_IN);
      const skipped = roll === 1;
      emit(EV.STATUS_TICK, {
        side, slot: pet.slot, status: STATUS.PARALYZED, name: 'Paralyzed',
        dieSize: RULES.PARALYZE_SKIP_IN, rolls: [roll], procValues: [1],
        damage: 0, cleared: 0, skipped,
      });
      if (skipped) {
        emit(EV.SKIP, { side, slot: pet.slot, reason: 'paralyzed', text: 'PARALYZED' });
        return;
      }
    }

    const foe = active(otherSide(side));
    const ability = pet.ability;
    // A full meter still fires automatically — unless a status has locked it.
    const useSpecial = pet.spc >= (ability?.cost ?? RULES.SPC_CAP) && !specialBlocked(pet);

    if (useSpecial) {
      setSpc(pet, 0, ability.name);
      flushSpc();
      if (ability.kind === 'effect') resolveEffectSpecial(pet, foe, ability);
      else resolveAttack(pet, foe, ability);
    } else {
      resolveAttack(pet, foe, null);
    }
  };

  /* ── MAIN LOOP ─────────────────────────────────────────────────── */

  emit(EV.BATTLE_START, {
    names: [active(0).name, active(1).name],
    rosters: [sides[0].map((p) => p.name), sides[1].map((p) => p.name)],
  });

  // The two leads are entering play as much as any replacement is, so whatever
  // reacts to arriving on the field fires for them as well.
  for (const side of [0, 1]) {
    const pet = active(side);
    pet.hasEntered = true;
    fire(pet, 'onEnterField', { previous: null });
  }

  hpWatermark = totalHp();
  let turnSide = resolveInitiative('opening');

  while (turnCount < RULES.MAX_TURNS) {
    if (!alive(0) || !alive(1)) break;
    turnCount += 1;

    takeTurn(turnSide);
    decayCurse(turnSide);
    // Statuses measured in turns rather than in uses fall off here.
    if (!active(turnSide).fainted) consumeStatuses(active(turnSide), 'expireAtTurnEnd');
    // ...and whatever the arena itself does between turns.
    runFieldTurnEnd(active(turnSide));

    const switched = processFaints();
    if (!alive(0) || !alive(1)) break;

    if (!switched) tickStagnation();

    if (priorityOverride !== null) {
      turnSide = priorityOverride;
      priorityOverride = null;
      emit(EV.INITIATIVE, {
        side: turnSide, reason: 'avenge', tie: false,
        spc: [maxSpcDie(active(0)), maxSpcDie(active(1))],
        names: [active(0).name, active(1).name],
      });
    } else {
      turnSide = otherSide(turnSide);
    }
  }

  const p1Alive = alive(0);
  const p2Alive = alive(1);
  const winner = p1Alive && !p2Alive ? 0 : p2Alive && !p1Alive ? 1 : null;

  const outcome = {
    winner,
    // A draw is not always the turn cap: a reactive passive can take the last
    // pet on the other side down with it, wiping both teams on one beat.
    reason: winner !== null
      ? 'knockout'
      : turnCount >= RULES.MAX_TURNS ? 'timeout' : 'double_knockout',
    turns: turnCount,
    survivors: winner === null ? [] : sides[winner].filter((p) => !p.fainted).map((p) => p.name),
  };

  emit(EV.BATTLE_END, outcome);

  return { seed, timeline, outcome, turns: turnCount };
}
