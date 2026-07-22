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
 *   damageBonus      ({ ctx, self, target, damage })      -> number (added to damage)
 *   burnPotency      ({ ctx, self })                      -> number (damage of Burns THIS pet applies)
 *   onAttackHit      ({ ctx, self, target, isSpecial })   -- landed an attack
 *   onDealDamage     ({ ctx, self, target, amount })      -- damage actually went through
 *   onDamaged        ({ ctx, self, attacker, amount })    -- took damage from an attack
 *   onStatusApplied  ({ ctx, self, target, statusId })    -- self applied a status to target
 *   onStunned        ({ ctx, self, target })              -- self converted counters into Stunned
 *   onKO             ({ ctx, self, target })              -- self knocked target out
 *   onFaint          ({ ctx, self, killer })              -- self was knocked out
 *   onAllySpcGain    ({ ctx, self, ally, amount })        -- an ally generated Special charge
 *   benchCharge      ({ ctx, self, active })      -> number  Special charge gained while benched.
 *                                                  Nothing generates bench charge without this.
 *
 * Flags (not hooks):
 *   debuffImmune  true -> the pet cannot receive statuses of kind 'debuff'
 */

import { STATUS } from './statuses.js';

export const PASSIVES = {
  /* ── Hellhound (Affinity) ─────────────────────────────────────── */
  hellfire: {
    id: 'hellfire',
    name: 'Hellfire',
    level: 1,
    desc: 'Successful standard attacks have a 1/6 chance to inflict Burn.',
    hooks: {
      onAttackHit: ({ ctx, self, target, isSpecial }) => {
        if (isSpecial) return;
        if (ctx.rng.die(6) === 1) {
          ctx.applyStatus(target, STATUS.BURN, 1, { source: self, label: 'Hellfire' });
        }
      },
    },
  },
  scorching_flames: {
    id: 'scorching_flames',
    name: 'Scorching Flames',
    level: 5,
    desc: 'Burns inflicted by this pet deal 3 damage instead of 2.',
    hooks: {
      burnPotency: () => 3,
    },
  },

  /* ── Hellhound (Physical) ─────────────────────────────────────── */
  intimidating: {
    id: 'intimidating',
    name: 'Intimidating',
    level: 1,
    desc: 'Advantage on attacks against enemies at full health.',
    hooks: {
      attackAdvantage: ({ target }) => (target.hp >= target.maxHp ? 1 : 0),
    },
  },
  smells_weakness: {
    id: 'smells_weakness',
    name: 'Smells Weakness',
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
    desc: 'When you Stun an opponent they also take 1 damage and lose all Special charge.',
    hooks: {
      onStunned: ({ ctx, self, target }) => {
        ctx.dealDamage(target, 1, { source: self, cause: 'Capitalize' });
        ctx.setSpc(target, 0, 'Capitalize');
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
    desc: 'Advantage on DEF rolls at 2 hearts or fewer.',
    hooks: {
      defenseAdvantage: ({ self }) => (self.hp <= 2 ? 1 : 0),
    },
  },

  /* ── Necrodoodle ──────────────────────────────────────────────── */
  hex_claws: {
    id: 'hex_claws',
    name: 'Hex Claws',
    level: 1,
    desc: 'Successful standard attacks have a 1/6 chance to inflict 1 stack of Cursed.',
    hooks: {
      onAttackHit: ({ ctx, self, target, isSpecial }) => {
        if (isSpecial) return;
        if (ctx.rng.die(6) === 1) {
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
    desc: 'After knocking out an opponent, gain +20 Max ATK permanently and recover 1 heart.',
    hooks: {
      onKO: ({ ctx, self }) => {
        ctx.modStat(self, 'atkFlat', 20, { source: self, label: 'Famine Feast' });
        ctx.heal(self, 1, { source: self, label: 'Famine Feast' });
      },
    },
  },

  /* ── Felightning ──────────────────────────────────────────────── */
  backline_current: {
    id: 'backline_current',
    name: 'Backline Current',
    level: 1,
    desc: 'While benched, roll your SPC die each turn and bank half of it. Your active ally is fed a quarter of the same roll.',
    hooks: {
      /**
       * Bench charge is no longer a property of the Support role — nothing
       * generates it without a passive — so this carries the original design
       * intent instead. Feeding the active ally is what makes parking a Support
       * on the bench a real tactical choice rather than a dead slot.
       */
      benchCharge: ({ ctx, self, active }) => {
        const roll = ctx.rng.die(self.stats.spc);
        const relay = Math.floor(roll * 0.25);
        if (relay > 0 && active && !active.fainted) {
          ctx.gainSpc(active, relay, 'passive');
        }
        return Math.floor(roll * 0.5);
      },
    },
  },
  baton_pass: {
    id: 'baton_pass',
    name: 'Baton Pass',
    level: 1,
    desc: 'When this pet is knocked out, the next ally to take the field gains 1 heart.',
    hooks: {
      onFaint: ({ ctx, self }) => {
        ctx.queueSwitchInBonus(self.side, { heal: 1, label: 'Baton Pass' });
      },
    },
  },
  overcharge: {
    id: 'overcharge',
    name: 'Overcharge',
    level: 5,
    desc: 'When you inflict Paralyzed, also inflict 3 Stun Counters.',
    hooks: {
      onStatusApplied: ({ ctx, self, target, statusId }) => {
        if (statusId !== STATUS.PARALYZED) return;
        ctx.applyStatus(target, STATUS.STUN_COUNTER, 3, { source: self, label: 'Overcharge' });
      },
    },
  },

  /* ── Bubble Trouble pair ──────────────────────────────────────── */
  lovey_dovey: {
    id: 'lovey_dovey',
    name: 'Lovey Dovey',
    level: 1,
    desc: 'When a bonded ally generates Special charge, gain 50% of that amount.',
    hooks: {
      onAllySpcGain: ({ ctx, self, ally, amount }) => {
        if (!self.species.bond || ally.species.bond !== self.species.bond) return;
        const share = Math.floor(amount * 0.5);
        if (share > 0) ctx.gainSpc(self, share, 'bond');
      },
    },
  },
  surface_tension: {
    id: 'surface_tension',
    name: 'Surface Tension',
    level: 5,
    desc: 'When your Bubble Shield pops, recover 25 Special charge.',
    hooks: {
      onShieldPopped: ({ ctx, self }) => {
        ctx.gainSpc(self, 25, 'Surface Tension');
      },
    },
  },
  undertow: {
    id: 'undertow',
    name: 'Undertow',
    level: 5,
    desc: 'Damp you inflict also strips 10 Max ATK until the target\'s next attack.',
    hooks: {
      onStatusApplied: ({ ctx, self, target, statusId }) => {
        if (statusId !== STATUS.DAMP) return;
        ctx.modStat(target, 'atkNext', -10, { source: self, label: 'Undertow' });
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
