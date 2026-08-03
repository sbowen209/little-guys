/**
 * @file presets.js
 * @description Named, pre-levelled, pre-natured variants of base species that
 * ship as ready-to-draft units. A preset derives from its base species so any
 * future change to that species' passives or Special is inherited automatically;
 * only the fields listed in the override are its own.
 *
 * These are also, collectively, the player's STABLE — the pets they actually own
 * and divide into teams for the Gauntlet. Order matches the pet cards.
 */

import { SPECIES } from './species.js';

const preset = (id, baseId, overrides) => {
  const base = SPECIES[baseId];
  if (!base) throw new Error(`Preset "${id}" references unknown species "${baseId}".`);
  return {
    ...base,
    ...overrides,
    id,
    isPreset: true,
    baseSpeciesId: baseId,
    typing: { ...base.typing, ...(overrides.typing ?? {}) },
  };
};

export const PRESETS = {
  fluffy: preset('fluffy', 'hellhound_affinity', {
    name: 'Fluffy',
    variant: null,
    level: 5,
    natures: { atk: 4, def: -4, spc: 4 },
    base: { hp: 5, atk: 45, def: 36, spc: 43 },
    art: '/images/pets/HellHound_Fluffy.webp',
    flavor: 'Named optimistically. Sets the arena on fire on turn three.',
  }),

  fuzzy: preset('fuzzy', 'hellhound_physical', {
    name: 'Fuzzy',
    variant: null,
    level: 5,
    natures: { atk: 11, def: 8, spc: -3 },
    // 30 base + 8 Nature + 4 from a level-up.
    base: { hp: 5, atk: 69, def: 42, spc: 29 },
    art: '/images/pets/HellHound_Fuzzy.webp',
    flavor: 'A d69 attack die. Slow to charge, but it rarely needs to.',
  }),

  lovey: preset('lovey', 'bubble_trouble_physical', {
    name: 'Lovey',
    variant: null,
    level: 2,
    natures: { atk: 1, def: 1, spc: 3 },
    base: { hp: 7, atk: 22, def: 51, spc: 33 },
    flavor: 'Runs the shield. Feeds charge to Dovey and takes it right back.',
  }),

  dovey: preset('dovey', 'bubble_trouble_affinity', {
    name: 'Dovey',
    variant: null,
    level: 2,
    natures: { atk: -3, def: -7, spc: -8 },
    base: { hp: 7, atk: 20, def: 43, spc: 22 },
    flavor: 'Weak on paper. Never charges alone.',
  }),

  /* ══ FOURTH WAVE ═══════════════════════════════════════════════════ */

  fish_sticks: preset('fish_sticks', 'decrephin', {
    name: 'Fish Sticks',
    level: 2,
    natures: { atk: -4, def: -6, spc: -2 },
    // 25 base DEF − 6 Nature + 3 from a level-up.
    base: { hp: 4, atk: 46, def: 22, spc: 28 },
    flavor: 'All teeth, no shell. Gets scarier the closer it is to finished.',
  }),

  celery: preset('celery', 'slicer', {
    name: 'Celery',
    level: 3,
    natures: { atk: 16, def: -4, spc: -4 },
    // 45 + 16 Nature + 3 level; 30 − 4 Nature + 2 level.
    base: { hp: 5, atk: 64, def: 28, spc: 26 },
    flavor: 'A d64 attack die on a paper body. Nothing it cuts stops bleeding.',
  }),

  peanut: preset('peanut', 'electrephant', {
    name: 'Peanut',
    level: 2,
    natures: { atk: -4, def: -3, spc: 3 },
    // 25 − 4 Nature + 2 level.
    base: { hp: 7, atk: 23, def: 42, spc: 28 },
    flavor: 'Introduces itself once. Nobody forgets it.',
  }),

  syrup: preset('syrup', 'swamp_fennec', {
    name: 'Syrup',
    level: 1,
    natures: { atk: 0, def: 0, spc: 0 },
    base: { hp: 4, atk: 20, def: 30, spc: 50 },
    flavor: 'Poisons the ground on arrival, then banks charge from the back line.',
  }),
};

/**
 * The player's stable, in card order. The Gauntlet divides exactly these pets
 * into teams, so adding a preset adds it to the stable.
 */
export const STABLE_IDS = Object.keys(PRESETS);
