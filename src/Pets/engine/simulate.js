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
  blocksStatus, attackDie, defenseDie, rawAttackDie,
} from './combatant.js';
import { EV } from './events.js';
import {
  RULES, ROLE, STATUS, STATUS_DEFS, statusDef,
  ATTACK_ROLE_ADVANTAGE, DEFENSE_ROLE_ADVANTAGE, affinityVerdict, otherSide,
} from '../data/index.js';

const clampAdvantage = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);

export function simulateBattle({ team1, team2, seed = randomSeed() }) {
  const rng = createRng(seed);

  const sides = [
    team1.map((entry, i) => createCombatant(entry, 0, i)),
    team2.map((entry, i) => createCombatant(entry, 1, i)),
  ];

  if (!sides[0].length || !sides[1].length) {
    throw new Error('Both teams need at least one pet.');
  }

  const lead = [0, 0];
  const timeline = [];
  const switchInBonus = [null, null];

  let eventId = 0;
  let turnCount = 0;
  let stagnationCounter = 0;
  let hpWatermark = 0;
  let pendingInitiative = false;

  const active = (side) => sides[side][lead[side]];
  const alive = (side) => sides[side].some((p) => !p.fainted);

  const snapshot = () => ({
    lead: [lead[0], lead[1]],
    teams: [sides[0].map(snapshotPet), sides[1].map(snapshotPet)],
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

  const best = (pet, hook, fallback) => {
    if (!pet) return fallback;
    let result = fallback;
    for (const passive of pet.passives) {
      const fn = passive.hooks?.[hook];
      if (fn) result = Math.max(result, fn({ ctx, self: pet }) || 0);
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

  const applyStatus = (target, id, stacks = 1, { source = null, label = null } = {}) => {
    if (!target || target.fainted || stacks <= 0) return false;

    if (blocksStatus(target, id)) {
      emit(EV.PASSIVE, {
        side: target.side, slot: target.slot, label: 'Thick Fur',
        text: 'IMMUNE', tone: 'defend', hold: 420,
      });
      return false;
    }

    const meta = {};
    if (id === STATUS.BURN) {
      const potency = best(source, 'burnPotency', STATUS_DEFS[STATUS.BURN].defaultPotency);
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

  const dealDamage = (target, amount, { attacker = null, cause = null, fromAttack = false } = {}) => {
    if (!target || target.fainted || amount <= 0) return 0;

    const before = target.hp;
    target.hp = Math.max(0, target.hp - amount);
    const dealt = before - target.hp;

    emit(EV.IMPACT, {
      side: target.side, slot: target.slot, amount: dealt,
      hpAfter: target.hp, cause, fromAttack,
      lethal: target.hp === 0,
    });

    // Damp washes off the moment you actually take a hit.
    if (hasStatus(target, STATUS.DAMP)) expireStatus(target, STATUS.DAMP, stacksOf(target, STATUS.DAMP));

    // A popped shield leaves the attacker Damp.
    if (hasStatus(target, STATUS.BUBBLE_SHIELD)) {
      expireStatus(target, STATUS.BUBBLE_SHIELD, 1);
      fire(target, 'onShieldPopped', { attacker });
      if (attacker && !attacker.fainted) {
        applyStatus(attacker, STATUS.DAMP, 1, { source: target, label: 'Bubble Shield' });
      }
    }

    if (target.hp === 0) {
      target.fainted = true;
      if (attacker && !attacker.fainted) fire(attacker, 'onKO', { target });
    } else if (fromAttack) {
      fire(target, 'onDamaged', { attacker, amount: dealt });
    }

    return dealt;
  };

  const heal = (target, amount, { label = null } = {}) => {
    if (!target || target.fainted || amount <= 0) return 0;
    const before = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + amount);
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
    activeFoeOf: (pet) => active(otherSide(pet.side)),
    alliesOf: (pet) => sides[pet.side].filter((p) => p !== pet && !p.fainted),
    queueSwitchInBonus: (side, bonus) => { switchInBonus[side] = bonus; },
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

    return { adv: clampAdvantage(adv), reasons };
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

    return { adv: clampAdvantage(adv), reasons };
  };

  const rollWith = (max, advantage) => {
    const rolls = [rng.die(max)];
    if (advantage !== 0) rolls.push(rng.die(max));
    const kept = advantage > 0 ? Math.max(...rolls) : advantage < 0 ? Math.min(...rolls) : rolls[0];
    return { rolls, kept, max, advantage };
  };

  /* ── ACTIONS ───────────────────────────────────────────────────── */

  const curseCheck = (attacker, damage) => {
    if (damage <= 0) return damage;
    const stacks = stacksOf(attacker, STATUS.CURSED);
    for (let i = 0; i < stacks; i += 1) {
      if (rng.coin()) {
        expireStatus(attacker, STATUS.CURSED, 1);
        emit(EV.PASSIVE, {
          side: attacker.side, slot: attacker.slot, label: 'Cursed',
          text: 'CURSED', tone: 'curse',
        });
        return 0;
      }
    }
    return damage;
  };

  const applyPackets = (source, target, packets, label) => {
    for (const packet of packets ?? []) {
      applyStatus(target, packet.status, packet.stacks ?? 1, { source, label });
    }
  };

  const runHealerCounters = (attacker) => {
    if (attacker.species.role !== ROLE.HEALER) return;
    attacker.heartCounters += 1;
    emit(EV.PASSIVE, {
      side: attacker.side, slot: attacker.slot, label: 'Heart Counter',
      text: `♥ ${attacker.heartCounters}/${RULES.HEART_COUNTERS_TO_HEAL}`, tone: 'heal', hold: 380,
    });
    if (attacker.heartCounters < RULES.HEART_COUNTERS_TO_HEAL) return;

    attacker.heartCounters = 0;
    const wounded = sides[attacker.side]
      .filter((p) => !p.fainted && p.hp < p.maxHp)
      .sort((a, b) => a.hp - b.hp)[0];
    if (wounded) heal(wounded, 1, { label: 'Heart Counters' });
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
    const scale = isSpecial ? ability.atkScale ?? 1 : 1;
    const targetFade = hasStatus(defender, STATUS.FADE);
    const trueStrike = Boolean(isSpecial && ability.trueStrike);

    const atkMax = attackDie(attacker, { scale, targetFade });
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
    const hit = trueStrike || atkRoll.kept > defRoll.kept;

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
    if (hasStatus(defender, STATUS.REND)) expireStatus(defender, STATUS.REND, 1);
    attacker.mods.atkNext = 0;
    defender.mods.defNext = 0;

    if (!hit) {
      emit(EV.BLOCK, { side: defender.side, slot: defender.slot });
      if (isSpecial && ability.selfEffectsOnMiss) {
        applyPackets(attacker, attacker, ability.applyToSelf, ability.name);
      }
      ability?.onResolve?.({ ctx, self: attacker, target: defender, hit: false });
      flushSpc();
      return;
    }

    // Effects land before damage so Stun conversion (and Capitalize) resolve first.
    applyPackets(attacker, attacker, ability?.applyToSelf, ability?.name);
    if (attacker.species.role === ROLE.STUNNER) {
      applyStatus(defender, STATUS.STUN_COUNTER, 1, { source: attacker, label: 'Stunner' });
    }
    applyPackets(attacker, defender, ability?.applyToTarget, ability?.name);

    fire(attacker, 'onAttackHit', { target: defender, isSpecial });

    let damage = ability?.damage ?? 1;
    damage += sum(attacker, 'damageBonus', { target: defender, damage });
    damage = curseCheck(attacker, damage);

    if (damage > 0) {
      const dealt = dealDamage(defender, damage, { attacker, cause: ability?.name ?? null, fromAttack: true });
      if (dealt > 0) fire(attacker, 'onDealDamage', { target: defender, amount: dealt });
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
      rolls, cleared, damage, potency,
    });

    if (cleared > 0) removeStacks(pet, STATUS.BURN, cleared);
    if (damage > 0) dealDamage(pet, damage, { cause: 'Burn' });
  };

  const generateCharge = (side) => {
    const pet = active(side);
    gainSpc(pet, rng.die(pet.stats.spc), 'turn');

    for (const benched of sides[side]) {
      if (benched === pet || benched.fainted) continue;
      if (benched.species.role !== ROLE.SUPPORT) continue;
      const share = Math.floor(rng.die(benched.stats.spc) * RULES.BENCH_SUPPORT_SHARE);
      gainSpc(benched, share, 'support');
    }

    flushSpc({ side, slot: pet.slot });
  };

  const totalHp = () =>
    sides[0].reduce((n, p) => n + p.hp, 0) + sides[1].reduce((n, p) => n + p.hp, 0);

  const tickStagnation = () => {
    const current = totalHp();
    if (current < hpWatermark) {
      hpWatermark = current;
      stagnationCounter = 0;
      return;
    }
    hpWatermark = current;
    stagnationCounter += 1;

    const engaged = hasStatus(active(0), STATUS.STAGNATION) || hasStatus(active(1), STATUS.STAGNATION);
    const threshold = engaged ? RULES.STAGNATION_REPEAT : RULES.STAGNATION_FIRST;
    if (stagnationCounter < threshold) return;

    stagnationCounter = 0;
    addStacks(active(0), STATUS.STAGNATION, 1);
    addStacks(active(1), STATUS.STAGNATION, 1);
    emit(EV.STAGNATION, { stacks: stacksOf(active(0), STATUS.STAGNATION) });
  };

  const clearStagnation = () => {
    stagnationCounter = 0;
    for (const side of sides) for (const pet of side) delete pet.statuses[STATUS.STAGNATION];
  };

  /** Handles every pet that hit 0 HP during the last step. */
  const processFaints = () => {
    let switched = false;

    for (let side = 0; side < 2; side += 1) {
      const pet = active(side);
      if (!pet.fainted || pet.faintResolved) continue;
      pet.faintResolved = true;

      clearStagnation();
      emit(EV.FAINT, { side, slot: pet.slot, name: pet.name });
      fire(pet, 'onFaint', {});

      const nextIndex = sides[side].findIndex((p) => !p.fainted);
      if (nextIndex === -1) continue;

      const next = sides[side][nextIndex];
      // Charge carries over to whoever steps up.
      gainSpc(next, pet.spc, 'inherit');
      lead[side] = nextIndex;

      const bonus = switchInBonus[side];
      switchInBonus[side] = null;

      emit(EV.SWITCH_IN, { side, slot: nextIndex, name: next.name, from: pet.name });
      flushSpc();
      if (bonus?.heal) heal(next, bonus.heal, { label: bonus.label });

      next.hasEntered = true;
      fire(next, 'onEnterField', { previous: pet });
      switched = true;
    }

    if (switched) pendingInitiative = true;
    hpWatermark = totalHp();
    return switched;
  };

  const resolveInitiative = (reason) => {
    const p1 = active(0);
    const p2 = active(1);
    const tie = p1.stats.spc === p2.stats.spc;
    const winner = tie ? (rng.coin() ? 0 : 1) : p1.stats.spc > p2.stats.spc ? 0 : 1;

    emit(EV.INITIATIVE, {
      side: winner, reason, tie,
      spc: [p1.stats.spc, p2.stats.spc],
      names: [p1.name, p2.name],
    });
    return winner;
  };

  const takeTurn = (side) => {
    const pet = active(side);
    emit(EV.TURN_START, { side, slot: pet.slot, name: pet.name, turn: turnCount });

    if (hasStatus(pet, STATUS.STUNNED)) {
      removeStacks(pet, STATUS.STUNNED, 1);
      emit(EV.SKIP, { side, slot: pet.slot, reason: 'stunned', text: 'STUNNED' });
      return;
    }

    tickBurn(pet);
    if (pet.fainted) return;

    generateCharge(side);

    if (hasStatus(pet, STATUS.PARALYZED) && rng.die(RULES.PARALYZE_SKIP_IN) === 1) {
      emit(EV.SKIP, { side, slot: pet.slot, reason: 'paralyzed', text: 'PARALYZED' });
      return;
    }

    const foe = active(otherSide(side));
    const ability = pet.ability;
    const useSpecial = pet.spc >= (ability?.cost ?? RULES.SPC_CAP);

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

  hpWatermark = totalHp();
  let turnSide = resolveInitiative('opening');

  while (turnCount < RULES.MAX_TURNS) {
    if (!alive(0) || !alive(1)) break;
    turnCount += 1;

    takeTurn(turnSide);

    const switched = processFaints();
    if (!alive(0) || !alive(1)) break;

    if (!switched) tickStagnation();

    if (pendingInitiative) {
      pendingInitiative = false;
      turnSide = resolveInitiative('switch');
    } else {
      turnSide = otherSide(turnSide);
    }
  }

  const p1Alive = alive(0);
  const p2Alive = alive(1);
  const winner = p1Alive && !p2Alive ? 0 : p2Alive && !p1Alive ? 1 : null;

  const outcome = {
    winner,
    reason: winner === null ? 'timeout' : 'knockout',
    turns: turnCount,
    survivors: winner === null ? [] : sides[winner].filter((p) => !p.fainted).map((p) => p.name),
  };

  emit(EV.BATTLE_END, outcome);

  return { seed, timeline, outcome, turns: turnCount };
}
