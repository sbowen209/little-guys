/**
 * @file abilities.js
 * @description Registry of Special abilities. Specials are declarative wherever
 * possible so the simulator can resolve them without knowing which pet cast
 * them; `onResolve` is the escape hatch for one-off behaviour.
 *
 * Shape:
 *   kind          'attack' rolls ATK vs DEF; 'effect' resolves immediately, no roll.
 *   cost          Special meter required (always RULES.SPC_CAP today).
 *   atkScale      multiplier applied to Max ATK for this roll (2 = 200% of normal).
 *   trueStrike    skips the opposed roll entirely and always connects.
 *   damage        hearts removed on a hit.
 *   lifesteal     true -> damage dealt is healed back to the attacker, capped at its Max HP.
 *   applyToTarget / applyToSelf  [{ status, stacks }] applied on a hit (or immediately for 'effect').
 *   vfx           key the view uses to pick a projectile / cast animation.
 *   onResolve     ({ ctx, self, target, hit }) for anything the fields can't express.
 *   provisional   true -> the NAME is a placeholder awaiting a real one. The
 *                 mechanics are authored; only the word is temporary.
 */

import { STATUS } from './statuses.js';
import { ELEMENT } from './constants.js';

export const ABILITIES = {
  hellfire_bolt: {
    id: 'hellfire_bolt',
    name: 'Hellfire Bolt',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 1,
    element: ELEMENT.FIRE,
    vfx: 'firebolt',
    desc: 'Rolls at 200% Max ATK. On a hit: 1 Fire damage and inflicts Burn.',
    applyToTarget: [{ status: STATUS.BURN, stacks: 1 }],
  },

  rending_bite: {
    id: 'rending_bite',
    name: 'Rending Bite',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 2,
    element: ELEMENT.PHYSICAL,
    vfx: 'rend_slash',
    desc: 'Rolls at 200% Max ATK. On a hit: 2 damage and 3 stacks of Rend.',
    applyToTarget: [{ status: STATUS.REND, stacks: 3 }],
  },

  heat_up: {
    id: 'heat_up',
    name: 'Heat Up',
    kind: 'effect',
    cost: 100,
    element: ELEMENT.FIRE,
    vfx: 'flare',
    desc: 'Superheats the air, inflicting Burn on the opposing pet.',
    applyToTarget: [{ status: STATUS.BURN, stacks: 1 }],
  },

  terrorize: {
    id: 'terrorize',
    name: 'Terrorize',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 1,
    element: ELEMENT.SHADOW,
    vfx: 'shriek',
    desc: 'Rolls at 200% Max ATK. On a hit: 1 damage and 3 Stun Counters. Always gains 3 stacks of Fade.',
    applyToTarget: [{ status: STATUS.STUN_COUNTER, stacks: 3 }],
    applyToSelf: [{ status: STATUS.FADE, stacks: 3 }],
    /** The Fade is the escape, so it lands whether or not the strike connects. */
    selfEffectsOnMiss: true,
  },

  shed: {
    id: 'shed',
    name: 'Shed',
    kind: 'effect',
    cost: 100,
    element: ELEMENT.EARTH,
    vfx: 'bulwark',
    desc: 'For the next 5 attacks, add your Max DEF to your Max ATK.',
    applyToSelf: [{ status: STATUS.SHED, stacks: 5 }],
  },

  doom_curse: {
    id: 'doom_curse',
    name: 'Doom Curse',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 2,
    element: ELEMENT.SHADOW,
    vfx: 'hex',
    desc: 'Rolls at 200% Max ATK. On a hit: 2 damage and 3 stacks of Cursed.',
    applyToTarget: [{ status: STATUS.CURSED, stacks: 3 }],
  },

  sunder: {
    id: 'sunder',
    name: 'Sunder',
    kind: 'effect',
    cost: 100,
    element: ELEMENT.PHYSICAL,
    vfx: 'shatter',
    desc: 'Permanently strips 1d3 x 10 Max ATK from the opposing pet. If their Max ATK hits 0 they are destroyed outright.',
    onResolve: ({ ctx, self, target }) => {
      if (!target || target.fainted) return;
      const amount = ctx.rng.die(3) * 10;
      ctx.modStat(target, 'atkFlat', -amount, { source: self, label: 'Sunder' });
      if (ctx.rawAttackDie(target) <= 0) {
        ctx.dealDamage(target, target.hp, { source: self, cause: 'Sundered', lethal: true });
      }
    },
  },

  ravenous_bite: {
    id: 'ravenous_bite',
    name: 'Ravenous Bite',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 2,
    element: ELEMENT.PHYSICAL,
    vfx: 'maul',
    desc: 'Rolls at 200% Max ATK. On a hit: 2 damage and immediately regain 50 Special charge.',
    onResolve: ({ ctx, self, hit }) => {
      if (hit) ctx.gainSpc(self, 50, 'Ravenous Bite');
    },
  },

  static_shock: {
    id: 'static_shock',
    name: 'Static Shock',
    kind: 'attack',
    cost: 100,
    atkScale: 3,
    damage: 2,
    element: ELEMENT.AIR,
    vfx: 'bolt',
    desc: 'Rolls at 300% Max ATK. On a hit: 2 damage and inflicts Paralyzed.',
    applyToTarget: [{ status: STATUS.PARALYZED, stacks: 1 }],
  },

  bubble_shield: {
    id: 'bubble_shield',
    name: 'Bubble Shield',
    kind: 'effect',
    cost: 100,
    element: ELEMENT.WATER,
    vfx: 'bubble',
    desc: 'Doubles your Max DEF until you take damage. When it pops, the attacker is left Damp.',
    applyToSelf: [{ status: STATUS.BUBBLE_SHIELD, stacks: 1 }],
  },

  /* ══ SECOND WAVE ═══════════════════════════════════════════════════
   * These pets were designed before the game became an autobattler. Where a
   * card named its Special, that name is used. Where it did not, the name here
   * is marked `provisional: true` and is waiting on a real one — the mechanics
   * are exactly as written on the card either way.
   */

  twin_fangs: {
    id: 'twin_fangs',
    name: 'Twin Fangs',
    provisional: true,
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 2,
    element: ELEMENT.PHYSICAL,
    vfx: 'maul',
    desc: 'Rolls at 200% Max ATK. On a hit: 2 damage and 3 stacks of Advantage.',
    applyToSelf: [{ status: STATUS.ADVANTAGE, stacks: 3 }],
  },

  milk: {
    id: 'milk',
    name: 'Milk',
    kind: 'effect',
    cost: 100,
    element: ELEMENT.SPIRIT,
    vfx: 'bulwark',
    desc: 'Washes off every debuff and grants +10 Max ATK permanently.',
    onResolve: ({ ctx, self }) => {
      ctx.clearDebuffs(self, 'Milk');
      ctx.modStat(self, 'atkFlat', 10, { label: 'Milk' });
    },
  },

  sled_charge: {
    id: 'sled_charge',
    name: 'Sled Charge',
    provisional: true,
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 1,
    element: ELEMENT.PHYSICAL,
    vfx: 'maul',
    desc: 'Rolls at 200% Max ATK. On a hit: 1 damage, then a benched enemy is dragged onto the field and takes 1 damage too.',
    onResolve: ({ ctx, self, target, hit }) => {
      if (!hit || !target || target.fainted) return;
      const dragged = ctx.forceSwitch(target.side, { label: 'Sled Charge' });
      if (dragged) ctx.dealDamage(dragged, 1, { attacker: self, cause: 'Sled Charge' });
    },
  },

  chain_shock: {
    id: 'chain_shock',
    name: 'Chain Shock',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 1,
    element: ELEMENT.AIR,
    vfx: 'bolt',
    desc: 'Rolls at 200% Max ATK. On a hit: 1 damage, and 1 damage to two different benched enemies.',
    onResolve: ({ ctx, self, hit }) => {
      if (!hit) return;
      const bench = [...ctx.benchedFoesOf(self)];
      for (let i = 0; i < 2 && bench.length > 0; i += 1) {
        const [victim] = bench.splice(Math.floor(ctx.rng.float() * bench.length), 1);
        ctx.dealDamage(victim, 1, { attacker: self, cause: 'Chain Shock' });
      }
    },
  },

  quill_guard: {
    id: 'quill_guard',
    name: 'Quill Guard',
    provisional: true,
    kind: 'effect',
    cost: 100,
    element: ELEMENT.EARTH,
    vfx: 'bulwark',
    desc: 'Gain 3 stacks of Zaptap — the next three hits taken are answered with 1 damage each.',
    applyToSelf: [{ status: STATUS.ZAPTAP, stacks: 3 }],
  },

  haymaker: {
    id: 'haymaker',
    name: 'Haymaker',
    provisional: true,
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 1,
    element: ELEMENT.PHYSICAL,
    vfx: 'maul',
    desc: 'Rolls at 200% Max ATK. On a hit: 1 damage and 1 Stun Counter on every enemy, bench included — the one in front takes the Stunner counter on top.',
    applyToTarget: [{ status: STATUS.STUN_COUNTER, stacks: 1 }],
    onResolve: ({ ctx, self, hit }) => {
      if (!hit) return;
      for (const benched of ctx.benchedFoesOf(self)) {
        ctx.applyStatus(benched, STATUS.STUN_COUNTER, 1, { source: self, label: 'Haymaker' });
      }
    },
  },

  verdant_bloom: {
    id: 'verdant_bloom',
    name: 'Verdant Bloom',
    provisional: true,
    kind: 'effect',
    cost: 100,
    element: ELEMENT.EARTH,
    vfx: 'bulwark',
    desc: 'A random benched ally gains 1 heart — which can carry them above their Max HP.',
    onResolve: ({ ctx, self }) => {
      const bench = ctx.benchedAlliesOf(self);
      if (!bench.length) return;
      ctx.heal(ctx.rng.pick(bench), 1, { label: 'Verdant Bloom', overheal: true });
    },
  },

  lifesteal: {
    id: 'lifesteal',
    name: 'Lifesteal',
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 1,
    element: ELEMENT.SHADOW,
    vfx: 'hex',
    lifesteal: true,
    desc: 'Rolls at 200% Max ATK. On a hit: 1 damage healed back to you, then roll your Special die and siphon that much charge off the target.',
    onResolve: ({ ctx, self, target, hit }) => {
      if (!hit || !target || target.fainted) return;
      const stolen = Math.min(ctx.rng.die(self.stats.spc), target.spc);
      if (stolen <= 0) return;
      ctx.setSpc(target, target.spc - stolen, 'Lifesteal');
      ctx.gainSpc(self, stolen, 'Lifesteal');
    },
  },

  talon_flurry: {
    id: 'talon_flurry',
    name: 'Talon Flurry',
    provisional: true,
    kind: 'attack',
    cost: 100,
    atkScale: 2,
    damage: 2,
    element: ELEMENT.AIR,
    vfx: 'rend_slash',
    desc: 'Rolls at 200% Max ATK. On a hit: 2 damage and 2 stacks of Bleed.',
    applyToTarget: [{ status: STATUS.BLEED, stacks: 2 }],
  },
};

export const abilityDef = (id) => ABILITIES[id];
