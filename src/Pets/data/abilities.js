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
 *   applyToTarget / applyToSelf  [{ status, stacks }] applied on a hit (or immediately for 'effect').
 *   vfx           key the view uses to pick a projectile / cast animation.
 *   onResolve     ({ ctx, self, target, hit }) for anything the fields can't express.
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
    damage: 2,
    element: ELEMENT.FIRE,
    vfx: 'firebolt',
    desc: 'Rolls at 200% Max ATK. On a hit: 2 Fire damage and inflicts Burn.',
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
    desc: 'Rolls at 200% Max ATK. On a hit: 1 damage and 3 Stun Counters. Always gains 2 stacks of Fade.',
    applyToTarget: [{ status: STATUS.STUN_COUNTER, stacks: 3 }],
    applyToSelf: [{ status: STATUS.FADE, stacks: 2 }],
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
    atkScale: 1,
    trueStrike: true,
    damage: 1,
    element: ELEMENT.AIR,
    vfx: 'bolt',
    desc: 'TRUESTRIKE — cannot be blocked. Deals 1 damage and inflicts Paralyzed.',
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
};

export const abilityDef = (id) => ABILITIES[id];
