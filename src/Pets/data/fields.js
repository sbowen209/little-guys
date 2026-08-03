/**
 * @file fields.js
 * @description Field effects — conditions that belong to the arena rather than
 * to a pet. Once established a field stays for the rest of the match: it is not
 * cleansed, does not leave with the pet that set it, and applies to both sides.
 *
 * A field is established with `ctx.establishField(id, label)` from any passive,
 * and the engine calls the hooks below at fixed points. As with statuses and
 * passives, the engine never names a field — it walks whatever is registered
 * here, so adding one needs no engine change.
 *
 * Hooks:
 *   onTurnEnd  ({ ctx, pet })  -- the pet whose turn just ended, before the
 *                                 turn passes. Skipped if that pet has fainted.
 */

import { STATUS } from './statuses.js';

export const FIELD = {
  TOXIC_TERRAIN: 'toxic_terrain',
};

export const FIELD_DEFS = {
  [FIELD.TOXIC_TERRAIN]: {
    id: FIELD.TOXIC_TERRAIN,
    name: 'Toxic Terrain',
    icon: '🧪',
    tone: '#84cc16',
    desc: 'The ground is poisoned. At the end of a pet\'s turn it has a 25% chance to gain 1 stack of Poison.',
    hooks: {
      onTurnEnd: ({ ctx, pet }) => {
        if (ctx.rng.die(4) !== 1) return;
        ctx.applyStatus(pet, STATUS.POISON, 1, { label: 'Toxic Terrain' });
      },
    },
  },
};

export const fieldDef = (id) => FIELD_DEFS[id] ?? null;
