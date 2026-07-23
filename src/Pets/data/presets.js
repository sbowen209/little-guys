/**
 * @file presets.js
 * @description Named, pre-levelled, pre-natured variants of base species that
 * ship as ready-to-draft units. A preset derives from its base species so any
 * future change to that species' passives or Special is inherited automatically;
 * only the fields listed in the override are its own.
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
    base: { hp: 8, atk: 22, def: 51, spc: 33 },
    flavor: 'Runs the shield. Feeds charge to Dovey and takes it right back.',
  }),

  dovey: preset('dovey', 'bubble_trouble_affinity', {
    name: 'Dovey',
    variant: null,
    level: 2,
    natures: { atk: -3, def: -7, spc: -8 },
    base: { hp: 8, atk: 20, def: 43, spc: 22 },
    flavor: 'Weak on paper. Never charges alone.',
  }),
};
