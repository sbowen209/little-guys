/**
 * @file passives.js
 * @description Registry of passives. Each passive exposes optional hooks that
 * the simulator calls at fixed points in the turn. The engine has no knowledge
 * of any individual passive — to add one, add an entry here and reference its
 * id from a species.
 *
 * Every hook receives a single object. `ctx` is the battle context (see
 * engine/simulate.js) and `self` is the pet that owns the passive.
 *
 *   attackAdvantage  ({ ctx, self, target, isSpecial })  -> number  summed with every
 *                      other source; the NET decides how many dice are rolled, and
 *                      advantage and disadvantage cancel one another out
 *   defenseAdvantage ({ ctx, self, attacker, isSpecial }) -> number  (as above)
 *   attackScale      ({ ctx, self, target, isSpecial })  -> number  multiplier on your own
 *                      attack die; the largest one wins rather than stacking
 *   attackFlatMod    ({ ctx, self, target, isSpecial })  -> number  added to your attack die
 *   foeAttackMod     ({ ctx, self, attacker, isSpecial }) -> number added to the die of
 *                      whoever is attacking YOU — negative to blunt it
 *   onBlocked        ({ ctx, self, attacker, isSpecial }) -- you turned an attack away
 *   damageBonus      ({ ctx, self, target, damage, advantage }) -> number (added to damage;
 *                      `advantage` is the net the attack rolled with)
 *   burnPotency      ({ ctx, self })                      -> number (damage of Burns THIS pet applies)
 *   tickPotency      ({ ctx, self, statusId })            -> number  damage per tick of any
 *                      ticking status THIS pet applies. Captured when the status lands, so a
 *                      stack stays as nasty as whoever inflicted it. The largest value wins
 *   onTurnStart      ({ ctx, self })                      -- self's turn began (not while Stunned)
 *   onAttackHit      ({ ctx, self, target, isSpecial })   -- landed an attack
 *   onAttackMiss     ({ ctx, self, target, isSpecial })   -- an attack was blocked
 *   onDealDamage     ({ ctx, self, target, amount })      -- damage actually went through
 *   onDamaged        ({ ctx, self, attacker, amount })    -- took damage from an attack
 *   onStatusApplied  ({ ctx, self, target, statusId })    -- self applied a status to target
 *   onStunned        ({ ctx, self, target })              -- self converted counters into Stunned
 *   onShieldPopped   ({ ctx, self, attacker })            -- self's Bubble Shield popped
 *   onEnterField     ({ ctx, self, previous })            -- self took the field. `previous` is the
 *                      pet it replaced, or null when it is the lead at the opening bell
 *   onKO             ({ ctx, self, target })              -- self knocked target out
 *   onFaint          ({ ctx, self, killer })              -- self was knocked out
 *   onAllySpcGain    ({ ctx, self, ally, amount })        -- an ally generated Special charge
 *   benchCharge      ({ ctx, self, active })      -> number  Special charge gained while benched.
 *                                                  Nothing generates bench charge without this.
 *
 * Useful `ctx` members beyond the obvious ones: `activeFoeOf`, `alliesOf`,
 * `benchedFoesOf`, `benchedAlliesOf`, `addHeartCounters`, `forceSwitch`,
 * `clearDebuffs`, `modStat`, `rng`, and
 * `queueSwitchInBonus(side, { heal, overheal, spc, label })` — handed to the
 * next pet that takes the field on that side.
 *
 * `ctx.heal(pet, n, { label, overheal })` — `overheal: true` carries a pet past
 * its Max HP, and the nameplate grows extra hearts to show the surplus.
 *
 * `ctx.establishField(fieldId, label)` — turns on an arena-wide condition from
 * data/fields.js for the rest of the match.
 *
 * `self.memo` is a plain scratch object per combatant. A passive that has to
 * remember something across turns (which enemies it has already hit, say) keeps
 * it there, so the engine never grows a field for one pet's bookkeeping.
 *
 * Flags (not hooks):
 *   debuffImmune  true -> the pet cannot receive statuses of kind 'debuff'
 *   legendary     true -> always online, and labelled as such in the builder
 *   statusImmune  [statusId] -> the pet refuses exactly these statuses
 */

import { STATUS } from './statuses.js';
import { FIELD } from './fields.js';
import { ROLE, RULES } from './constants.js';

export const PASSIVES = {
  /* ── Hellhound (Affinity) ─────────────────────────────────────── */
  hellfire: {
    id: 'hellfire',
    name: 'Hellfire',
    level: 1,
    desc: 'Successful attacks have a 1/6 chance to inflict Burn.',
    hooks: {
      onAttackHit: ({ ctx, self, target }) => {
        if (ctx.rng.die(6) === 1) {
          ctx.applyStatus(target, STATUS.BURN, 1, { source: self, label: 'Hellfire' });
        }
      },
    },
  },
  scorching_flames: {
    id: 'scorching_flames',
    name: 'Hell Flames',
    level: 5,
    desc: 'Burns inflicted by this pet deal 1 extra damage.',
    hooks: {
      burnPotency: () => 3,
    },
  },

  /* ── Hellhound (Physical) ─────────────────────────────────────── */
  intimidating: {
    id: 'intimidating',
    name: 'Intimidating',
    level: 1,
    desc: 'Advantage and +1 damage against enemies at full health.',
    hooks: {
      attackAdvantage: ({ target }) => (target.hp >= target.maxHp ? 1 : 0),
      damageBonus: ({ target }) => (target.hp >= target.maxHp ? 1 : 0),
    },
  },
  smells_weakness: {
    id: 'smells_weakness',
    name: 'Relentless',
    level: 5,
    desc: 'Advantage on attacks against enemies with 2 or fewer hearts.',
    hooks: {
      attackAdvantage: ({ target }) => (target.hp <= 2 ? 1 : 0),
    },
  },

  /* ── Emboar ───────────────────────────────────────────────────── */
  flame_aura: {
    id: 'flame_aura',
    name: 'Flame Aura',
    level: 1,
    desc: 'When damaged by an attack, 25% chance to Burn the attacker.',
    hooks: {
      onDamaged: ({ ctx, self, attacker }) => {
        if (!attacker || attacker.fainted) return;
        if (ctx.rng.die(4) === 1) {
          ctx.applyStatus(attacker, STATUS.BURN, 1, { source: self, label: 'Flame Aura' });
        }
      },
    },
  },
  afterburn: {
    id: 'afterburn',
    name: 'Afterburn',
    level: 5,
    desc: 'When knocked out, Burn the opposing pet.',
    hooks: {
      onFaint: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (foe && !foe.fainted) {
          ctx.applyStatus(foe, STATUS.BURN, 1, { source: self, label: 'Afterburn' });
        }
      },
    },
  },

  /* ── Terror Terrier ───────────────────────────────────────────── */
  ghostly_blur: {
    id: 'ghostly_blur',
    name: 'Ghostly Blur',
    level: 1,
    desc: 'After taking damage, gain 1 stack of Fade.',
    hooks: {
      onDamaged: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.FADE, 1, { source: self, label: 'Ghostly Blur' });
      },
    },
  },
  capitalize: {
    id: 'capitalize',
    name: 'Capitalize',
    level: 5,
    desc: 'When you Stun an opponent they also take 1 damage and lose 50 Special charge.',
    hooks: {
      onStunned: ({ ctx, self, target }) => {
        ctx.dealDamage(target, 1, { attacker: self, cause: 'Capitalize' });
        ctx.setSpc(target, target.spc - 50, 'Capitalize');
      },
    },
  },

  /* ── Scruffy ──────────────────────────────────────────────────── */
  thick_fur: {
    id: 'thick_fur',
    name: 'Thick Fur',
    level: 1,
    desc: 'Immune to debuffs.',
    debuffImmune: true,
  },
  scruffy_resolve: {
    id: 'scruffy_resolve',
    name: 'Scruffy',
    level: 5,
    desc: 'Advantage on DEF rolls at 3 hearts or fewer.',
    hooks: {
      defenseAdvantage: ({ self }) => (self.hp <= 3 ? 1 : 0),
    },
  },

  /* ── Necrodoodle ──────────────────────────────────────────────── */
  hex_claws: {
    id: 'hex_claws',
    name: 'Hex Claws',
    level: 1,
    desc: 'Successful attacks have a 25% chance to inflict 1 stack of Cursed.',
    hooks: {
      onAttackHit: ({ ctx, self, target }) => {
        if (ctx.rng.die(4) === 1) {
          ctx.applyStatus(target, STATUS.CURSED, 1, { source: self, label: 'Hex Claws' });
        }
      },
    },
  },
  vengeful_curse: {
    id: 'vengeful_curse',
    name: 'Vengeful Curse',
    level: 5,
    desc: 'When damaged, 25% chance to inflict 1 stack of Cursed on the attacker.',
    hooks: {
      onDamaged: ({ ctx, self, attacker }) => {
        if (!attacker || attacker.fainted) return;
        if (ctx.rng.die(4) === 1) {
          ctx.applyStatus(attacker, STATUS.CURSED, 1, { source: self, label: 'Vengeful Curse' });
        }
      },
    },
  },

  /* ── Gnollbacabra ─────────────────────────────────────────────── */
  crippling_bite: {
    id: 'crippling_bite',
    name: 'Crippling Bite',
    level: 1,
    desc: 'After damaging an opponent, their Max ATK drops by 1d6 x 10 for their next attack.',
    hooks: {
      onDealDamage: ({ ctx, self, target }) => {
        const amount = ctx.rng.die(6) * 10;
        ctx.modStat(target, 'atkNext', -amount, { source: self, label: 'Crippling Bite' });
      },
    },
  },
  bonecrusher: {
    id: 'bonecrusher',
    name: 'Bonecrusher',
    level: 5,
    desc: 'When damaged, the attacker loses 1d2 x 10 Max DEF until their next turn.',
    hooks: {
      onDamaged: ({ ctx, self, attacker }) => {
        if (!attacker || attacker.fainted) return;
        const amount = ctx.rng.die(2) * 10;
        ctx.modStat(attacker, 'defNext', -amount, { source: self, label: 'Bonecrusher' });
      },
    },
  },

  /* ── Famine Wolf ──────────────────────────────────────────────── */
  crunch: {
    id: 'crunch',
    name: 'Crunch',
    level: 1,
    desc: 'When dealing damage, 25% chance to deal 1 extra.',
    hooks: {
      damageBonus: ({ ctx }) => (ctx.rng.die(4) === 1 ? 1 : 0),
    },
  },
  famine_feast: {
    id: 'famine_feast',
    name: 'Famine Feast',
    level: 5,
    desc: 'After knocking out an opponent, gain +40 Max ATK permanently.',
    hooks: {
      onKO: ({ ctx, self }) => {
        ctx.modStat(self, 'atkFlat', 40, { source: self, label: 'Famine Feast' });
      },
    },
  },

  /* ── Felightning ──────────────────────────────────────────────── */
  get_away: {
    id: 'get_away',
    name: 'Get Away',
    level: 1,
    desc: 'When knocked out, inflict Paralyzed on a random benched opponent.',
    hooks: {
      onFaint: ({ ctx, self }) => {
        const bench = ctx.benchedFoesOf(self);
        if (!bench.length) return;
        ctx.applyStatus(ctx.rng.pick(bench), STATUS.PARALYZED, 1, { source: self, label: 'Get Away' });
      },
    },
  },
  parting_charge: {
    id: 'parting_charge',
    name: 'Parting Charge',
    provisional: true,
    level: 5,
    desc: 'When knocked out, the next ally to take the field arrives with 100 Special charge — a full meter.',
    hooks: {
      /** Queued onto the switch-in rather than banked on the corpse, so the
       *  replacement gets the whole 100 instead of whatever fits under the cap
       *  once the fallen pet's own leftover meter is added. */
      onFaint: ({ ctx, self }) => {
        ctx.queueSwitchInBonus(self.side, { spc: 100, label: 'Parting Charge' });
      },
    },
  },

  /* ── Bubble Trouble pair ──────────────────────────────────────── */
  lovey_dovey: {
    id: 'lovey_dovey',
    name: 'Lovey Dovey',
    level: 1,
    desc: 'While your bonded partner is on the team, your Max SPC is 50% larger.',
    /**
     * Reworked. This used to hand over 50% of any charge the partner generated,
     * which measured out as a trap: it bought more Bubble Shields on a pet that
     * could not convert them. A bigger die is worth the same charge without
     * needing the partner to be the one rolling, and it feeds initiative too.
     *
     * A pure field rather than a hook, so `combatant.js` can fold it into the
     * derived Max SPC and the HUD can never disagree with the simulator.
     */
    maxSpcScale: (self) => {
      const bond = self.species.bond;
      if (!bond || !self.team) return 1;
      return self.team.some((ally) => ally !== self && ally.species.bond === bond) ? 1.5 : 1;
    },
  },
  surface_tension: {
    id: 'surface_tension',
    name: 'Surface Tension',
    level: 5,
    desc: 'Once your bonded partner has been defeated, gain +20 Max ATK for the rest of the match.',
    hooks: {
      /** Counted live off the roster, so it needs no death hook and cannot be
       *  missed if the partner goes down while this pet is benched. */
      attackFlatMod: ({ self }) => {
        const bond = self.species.bond;
        if (!bond || !self.team) return 0;
        return self.team.some((ally) => ally !== self && ally.species.bond === bond && ally.fainted)
          ? 20 : 0;
      },
    },
  },
  /* ══ SECOND WAVE ═══════════════════════════════════════════════════
   * As with the abilities, a passive whose card carried no name is marked
   * `provisional: true`; the behaviour is exactly what the card described.
   */

  /* ── Cerberus ─────────────────────────────────────────────────── */
  twin_bite: {
    id: 'twin_bite',
    name: 'Twin Bite',
    level: 1,
    desc: 'After an attack is blocked, gain 1 stack of Advantage.',
    hooks: {
      onAttackMiss: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.ADVANTAGE, 1, { source: self, label: 'Twin Bite' });
      },
    },
  },
  press_the_advantage: {
    id: 'press_the_advantage',
    name: 'Press the Advantage',
    provisional: true,
    level: 5,
    desc: 'When attacking with net Advantage, 50% chance to deal 1 extra damage.',
    hooks: {
      damageBonus: ({ ctx, advantage }) => (advantage > 0 && ctx.rng.coin() ? 1 : 0),
    },
  },

  /* ── Milk Truck ───────────────────────────────────────────────── */
  milk_shake: {
    id: 'milk_shake',
    name: 'Milk Shake',
    level: 1,
    desc: 'When damaged, gain 1 stack of Energized.',
    hooks: {
      onDamaged: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.ENERGIZED, 1, { source: self, label: 'Milk Shake' });
      },
    },
  },
  second_stomach: {
    id: 'second_stomach',
    name: 'Second Stomach',
    provisional: true,
    level: 5,
    desc: 'At the start of your turn, a 1-in-8 chance to recover 1 heart.',
    hooks: {
      onTurnStart: ({ ctx, self }) => {
        if (ctx.rng.die(8) === 1) ctx.heal(self, 1, { label: 'Second Stomach' });
      },
    },
  },

  /* ── Balto ────────────────────────────────────────────────────── */
  first_light: {
    id: 'first_light',
    name: 'First Light',
    provisional: true,
    level: 1,
    desc: 'Double Max ATK and Advantage on any roll taken during either pet\'s first turn on the field.',
    hooks: {
      attackScale: ({ self, target }) => (self.turnsInPlay <= 1 || target.turnsInPlay <= 1 ? 2 : 1),
      attackAdvantage: ({ self, target }) => (self.turnsInPlay <= 1 || target.turnsInPlay <= 1 ? 1 : 0),
      defenseAdvantage: ({ self, attacker }) => (self.turnsInPlay <= 1 || attacker.turnsInPlay <= 1 ? 1 : 0),
    },
  },
  fresh_legs: {
    id: 'fresh_legs',
    name: 'Fresh Legs',
    provisional: true,
    level: 5,
    desc: 'When you start the match or enter from the bench, gain 1 stack of Powerful.',
    hooks: {
      onEnterField: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.POWERFUL, 1, { source: self, label: 'Fresh Legs' });
      },
    },
  },

  /* ── Watthog ──────────────────────────────────────────────────── */
  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    level: 1,
    desc: 'When you deal damage, a 1-in-6 chance to arc 1 damage to a benched enemy as well.',
    hooks: {
      onDealDamage: ({ ctx, self }) => {
        if (ctx.rng.die(6) !== 1) return;
        const bench = ctx.benchedFoesOf(self);
        if (!bench.length) return;
        ctx.dealDamage(ctx.rng.pick(bench), 1, { attacker: self, cause: 'Chain Lightning' });
      },
    },
  },
  supercharge: {
    id: 'supercharge',
    name: 'Supercharge',
    level: 5,
    desc: 'Gain 15 Special charge whenever you are damaged.',
    hooks: {
      onDamaged: ({ ctx, self }) => {
        ctx.gainSpc(self, 15, 'Supercharge');
      },
    },
  },

  /* ── Quillbacabra ─────────────────────────────────────────────── */
  bristleback: {
    id: 'bristleback',
    name: 'Bristleback',
    provisional: true,
    level: 1,
    desc: 'When damaged, 25% chance to deal 1 damage back to the attacker.',
    hooks: {
      onDamaged: ({ ctx, self, attacker }) => {
        if (!attacker || attacker.fainted) return;
        if (ctx.rng.die(4) === 1) {
          ctx.dealDamage(attacker, 1, { attacker: self, cause: 'Bristleback' });
        }
      },
    },
  },
  parting_quills: {
    id: 'parting_quills',
    name: 'Parting Quills',
    provisional: true,
    level: 5,
    desc: 'When knocked out, the killer takes 1 damage plus 1 for every stack of Zaptap you were holding.',
    hooks: {
      onFaint: ({ ctx, self, killer }) => {
        if (!killer || killer.fainted) return;
        const zaptap = self.statuses[STATUS.ZAPTAP]?.stacks ?? 0;
        ctx.dealDamage(killer, 1 + zaptap, { attacker: self, cause: 'Parting Quills' });
      },
    },
  },

  /* ── Punchadillo ──────────────────────────────────────────────── */
  concussive_blast: {
    id: 'concussive_blast',
    name: 'Concussive Blast',
    provisional: true,
    level: 1,
    desc: 'When you land a third Stun Counter on the enemy in front of you, every benched enemy takes 1 Stun Counter.',
    hooks: {
      /** Only the pet on the field can set this off. Letting a benched Stun
       *  feed the bench again would chain forever. */
      onStunned: ({ ctx, self, target }) => {
        if (target !== ctx.activeFoeOf(self)) return;
        for (const benched of ctx.benchedFoesOf(self)) {
          ctx.applyStatus(benched, STATUS.STUN_COUNTER, 1, { source: self, label: 'Concussive Blast' });
        }
      },
    },
  },
  rolling_guard: {
    id: 'rolling_guard',
    name: 'Rolling Guard',
    provisional: true,
    level: 5,
    desc: 'When you land a third Stun Counter on an enemy, gain 2 stacks of Fade.',
    hooks: {
      onStunned: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.FADE, 2, { source: self, label: 'Rolling Guard' });
      },
    },
  },

  /* ── Mosstiff ─────────────────────────────────────────────────── */
  photosynthesis: {
    id: 'photosynthesis',
    name: 'Photosynthesis',
    provisional: true,
    level: 1,
    desc: 'At the start of your turn, 25% chance to gain a Heart Counter without attacking.',
    hooks: {
      onTurnStart: ({ ctx, self }) => {
        if (ctx.rng.die(4) === 1) ctx.addHeartCounters(self, 1, 'Photosynthesis');
      },
    },
  },
  last_bloom: {
    id: 'last_bloom',
    name: 'Last Bloom',
    provisional: true,
    level: 5,
    desc: 'When knocked out, the next ally to take the field gains 1 heart — which can carry them above their Max HP.',
    hooks: {
      onFaint: ({ ctx, self }) => {
        ctx.queueSwitchInBonus(self.side, { heal: 1, overheal: true, label: 'Last Bloom' });
      },
    },
  },

  /* ── Bellybummer ──────────────────────────────────────────────── */
  spooked: {
    id: 'spooked',
    name: 'Spooked',
    level: 1,
    desc: 'When you take the field, the opposing pet gains 10 stacks of Disadvantage.',
    hooks: {
      onEnterField: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (foe && !foe.fainted) {
          ctx.applyStatus(foe, STATUS.DISADVANTAGE, 10, { source: self, label: 'Spooked' });
        }
      },
    },
  },
  stage_fright: {
    id: 'stage_fright',
    name: 'Stage Fright',
    provisional: true,
    level: 5,
    desc: 'When you take the field, the opposing pet and one random benched enemy each gain 99 stacks of Stunt — their Specials are locked for the rest of the match.',
    hooks: {
      /** Reaching the bench as well is what stops this being spent entirely on
       *  whichever single pet happened to be standing there. */
      onEnterField: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (foe && !foe.fainted) {
          ctx.applyStatus(foe, STATUS.STUNT, 99, { source: self, label: 'Stage Fright' });
        }
        const bench = ctx.benchedFoesOf(self);
        if (bench.length) {
          ctx.applyStatus(ctx.rng.pick(bench), STATUS.STUNT, 99, { source: self, label: 'Stage Fright' });
        }
      },
    },
  },

  /* ══ THIRD WAVE ════════════════════════════════════════════════════ */

  /* ── Thunder Lion ─────────────────────────────────────────────── */
  electrofang: {
    id: 'electrofang',
    name: 'Electrofang',
    level: 1,
    desc: 'Successful attacks have a 1/6 chance to inflict Paralyzed.',
    hooks: {
      onAttackHit: ({ ctx, self, target }) => {
        if (ctx.rng.die(6) === 1) {
          ctx.applyStatus(target, STATUS.PARALYZED, 1, { source: self, label: 'Electrofang' });
        }
      },
    },
  },
  electrocyclone: {
    id: 'electrocyclone',
    name: 'Electrocyclone',
    level: 5,
    desc: 'When damaged, a 1/6 chance to gain 1 stack of Zaptap.',
    hooks: {
      onDamaged: ({ ctx, self }) => {
        if (ctx.rng.die(6) === 1) {
          ctx.applyStatus(self, STATUS.ZAPTAP, 1, { source: self, label: 'Electrocyclone' });
        }
      },
    },
  },

  /* ── Bone Boar ────────────────────────────────────────────────── */
  bone_harvest: {
    id: 'bone_harvest',
    name: 'Bone Harvest',
    provisional: true,
    level: 1,
    desc: 'When you deal damage, gain 1 stack of Bone Shield.',
    hooks: {
      onDealDamage: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.BONE_SHIELD, 1, { source: self, label: 'Bone Harvest' });
      },
    },
  },
  ossuary_guard: {
    id: 'ossuary_guard',
    name: 'Ossuary Guard',
    provisional: true,
    level: 5,
    desc: 'Take the field with 3 stacks of Bone Shield already up.',
    hooks: {
      onEnterField: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.BONE_SHIELD, 3, { source: self, label: 'Ossuary Guard' });
      },
    },
  },

  /* ── Wild Cat ─────────────────────────────────────────────────── */
  ambush_instinct: {
    id: 'ambush_instinct',
    name: 'Ambush Instinct',
    provisional: true,
    level: 1,
    desc: 'Advantage against enemies whose Special meter is at least half full.',
    hooks: {
      attackAdvantage: ({ target }) => (target.spc >= RULES.SPC_CAP / 2 ? 1 : 0),
    },
  },
  scent_of_blood: {
    id: 'scent_of_blood',
    name: 'Scent of Blood',
    provisional: true,
    level: 5,
    desc: 'Gain +5 Max ATK for every pet already defeated on the enemy team.',
    hooks: {
      /** Counted live rather than banked on a knockout, so it credits every
       *  loss on that side and not only the ones this pet caused. */
      attackFlatMod: ({ ctx, self }) => {
        const foes = ctx.foesOf(self);
        return foes.filter((p) => p.fainted).length * 5;
      },
    },
  },

  /* ── Dragon Turtle ────────────────────────────────────────────── */
  wear_down: {
    id: 'wear_down',
    name: 'Wear Down',
    level: 1,
    desc: 'When an attack against you fails, the attacker is left Damp — 5 Max DEF per stack, washed off when they take damage.',
    hooks: {
      onBlocked: ({ ctx, self, attacker }) => {
        if (!attacker || attacker.fainted) return;
        // `washable` is what separates this grinding-down Damp from the
        // permanent soaking a popped Bubble Shield leaves behind.
        ctx.applyStatus(attacker, STATUS.DAMP, 1, { source: self, label: 'Wear Down', washable: true });
      },
    },
  },
  impenetrable: {
    id: 'impenetrable',
    name: 'Impenetrable',
    level: 5,
    desc: 'Attacker-role units roll at 10 less Max ATK against you.',
    hooks: {
      foeAttackMod: ({ attacker }) => (attacker.species.role === ROLE.ATTACKER ? -10 : 0),
    },
  },

  /* ── Mega Chicken ─────────────────────────────────────────────── */
  raking_spurs: {
    id: 'raking_spurs',
    name: 'Raking Spurs',
    provisional: true,
    level: 1,
    desc: 'Successful attacks have a 50% chance to inflict 1 stack of Bleed.',
    hooks: {
      onAttackHit: ({ ctx, self, target }) => {
        if (ctx.rng.coin()) {
          ctx.applyStatus(target, STATUS.BLEED, 1, { source: self, label: 'Raking Spurs' });
        }
      },
    },
  },
  death_throes: {
    id: 'death_throes',
    name: 'Death Throes',
    provisional: true,
    level: 5,
    desc: 'When knocked out, the opposing pet gains 1 stack of Rend.',
    hooks: {
      onFaint: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (foe && !foe.fainted) {
          ctx.applyStatus(foe, STATUS.REND, 1, { source: self, label: 'Death Throes' });
        }
      },
    },
  },

  /* ══ FOURTH WAVE ═══════════════════════════════════════════════════
   * Every card in this wave left its Level 5 passive as "xxx", so each of
   * these pets has a single passive and gains nothing at Lv.5.
   */

  /* ── Decrephin ────────────────────────────────────────────────── */
  dolphangs: {
    id: 'dolphangs',
    name: 'Dolphangs',
    level: 1,
    desc: 'While at 2 hearts or fewer, every successful attack inflicts Bleed.',
    hooks: {
      onAttackHit: ({ ctx, self, target }) => {
        if (self.hp > 2) return;
        ctx.applyStatus(target, STATUS.BLEED, 1, { source: self, label: 'Dolphangs' });
      },
    },
  },

  /* ── Slicer ───────────────────────────────────────────────────── */
  wristblades: {
    id: 'wristblades',
    name: 'Wristblades',
    level: 1,
    desc: 'Successful attacks have a 25% chance to inflict 1 stack of Sliced.',
    hooks: {
      onAttackHit: ({ ctx, self, target }) => {
        if (ctx.rng.die(4) === 1) {
          ctx.applyStatus(target, STATUS.SLICED, 1, { source: self, label: 'Wristblades' });
        }
      },
    },
  },
  open_wounds: {
    id: 'open_wounds',
    name: 'Open Wounds',
    provisional: true,
    level: 5,
    desc: 'Advantage on attacks against an enemy already carrying Sliced.',
    hooks: {
      /** Its own Lv.1 and its Special both hand out Sliced, so this is the
       *  payoff for having done the cutting rather than a separate condition
       *  to chase. */
      attackAdvantage: ({ target }) => ((target.statuses[STATUS.SLICED]?.stacks ?? 0) > 0 ? 1 : 0),
    },
  },

  /* ── Electrephant ─────────────────────────────────────────────── */
  first_impression: {
    id: 'first_impression',
    name: 'First Impression',
    provisional: true,
    level: 1,
    desc: 'The first time you land a hit on any given enemy it takes 2 extra Stun Counters — three in total with the Stunner role\'s own.',
    hooks: {
      /** `self.memo` is scratch space the engine hands every pet precisely so a
       *  passive can remember something without the engine knowing what. */
      onAttackHit: ({ ctx, self, target }) => {
        const seen = self.memo.firstImpression ?? (self.memo.firstImpression = new Set());
        if (seen.has(target.instanceId)) return;
        seen.add(target.instanceId);
        ctx.applyStatus(target, STATUS.STUN_COUNTER, 2, { source: self, label: 'First Impression' });
      },
    },
  },

  /* ── Swamp Fennec ─────────────────────────────────────────────── */
  toxic_terrain: {
    id: 'toxic_terrain',
    name: 'Toxic Terrain',
    level: 1,
    legendary: true,
    desc: 'Legendary — when you take the field the arena turns toxic for the rest of the match: at the end of any pet\'s turn it has a 25% chance to gain 1 stack of Poison.',
    hooks: {
      onEnterField: ({ ctx }) => {
        ctx.establishField(FIELD.TOXIC_TERRAIN, 'Toxic Terrain');
      },
    },
  },
  venom_blood: {
    id: 'venom_blood',
    name: 'Venom Blood',
    provisional: true,
    level: 1,
    desc: 'Immune to Poison. When damaged, a 25% chance to Poison the opposing pet.',
    statusImmune: [STATUS.POISON],
    hooks: {
      onDamaged: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (!foe || foe.fainted) return;
        if (ctx.rng.die(4) === 1) {
          ctx.applyStatus(foe, STATUS.POISON, 1, { source: self, label: 'Venom Blood' });
        }
      },
    },
  },
  septic_burst: {
    id: 'septic_burst',
    name: 'Septic Burst',
    provisional: true,
    level: 5,
    desc: 'When knocked out, strip every stack of Poison off the opposing pet and deal 1 damage for each one taken.',
    hooks: {
      /** Cashes the slow poison in all at once on the way down, which is what
       *  makes laying stacks early worth doing on a 4 HP pet that will not live
       *  to watch them tick. */
      onFaint: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (!foe || foe.fainted) return;
        const stacks = foe.statuses[STATUS.POISON]?.stacks ?? 0;
        if (stacks <= 0) return;
        ctx.expireStatus(foe, STATUS.POISON, stacks);
        ctx.dealDamage(foe, stacks, { attacker: self, cause: 'Septic Burst' });
      },
    },
  },

  /* ── Decrephin (Lv.5) ─────────────────────────────────────────── */
  last_bite: {
    id: 'last_bite',
    name: 'Last Bite',
    provisional: true,
    level: 5,
    desc: 'When knocked out, the opposing pet takes 2 stacks of Stunned.',
    hooks: {
      onFaint: ({ ctx, self }) => {
        const foe = ctx.activeFoeOf(self);
        if (!foe || foe.fainted) return;
        ctx.applyStatus(foe, STATUS.STUNNED, 2, { source: self, label: 'Last Bite' });
      },
    },
  },

  /* ── Electrephant (Lv.5) ──────────────────────────────────────── */
  overcharge: {
    id: 'overcharge',
    name: 'Overcharge',
    provisional: true,
    level: 5,
    desc: 'Whenever you Stun an opponent, gain 3 stacks of Energized.',
    hooks: {
      onStunned: ({ ctx, self }) => {
        ctx.applyStatus(self, STATUS.ENERGIZED, 3, { source: self, label: 'Overcharge' });
      },
    },
  },
};

export const passiveDef = (id) => PASSIVES[id];

/** The passives a pet actually has online at its current level. */
export const activePassives = (species, level) =>
  (species.passives ?? [])
    .map((id) => PASSIVES[id])
    .filter((p) => p && level >= p.level);
