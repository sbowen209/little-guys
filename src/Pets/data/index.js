/**
 * @file data/index.js
 * @description The single entry point to the pet database. Everything outside
 * data/ imports from here, so the shape of the registries can change without
 * touching the engine or the UI.
 */

import { SPECIES } from './species.js';
import { PRESETS } from './presets.js';
import { ABILITIES, abilityDef } from './abilities.js';
import { PASSIVES } from './passives.js';
import { RULES, ROLE_META, ELEMENT_META } from './constants.js';

export * from './constants.js';
export * from './statuses.js';
export { ABILITIES, abilityDef } from './abilities.js';
export { PASSIVES, passiveDef, activePassives } from './passives.js';
export { SPECIES } from './species.js';
export { PRESETS } from './presets.js';

/** Every draftable unit, base species and presets alike, keyed by permanent id. */
export const PET_DB = { ...SPECIES, ...PRESETS };

export const getSpecies = (id) => PET_DB[id] ?? null;

export const listSpecies = () => Object.values(PET_DB);

/** "Hellhound (Affinity)" / "Fluffy" */
export const displayName = (species) =>
  species.variant ? `${species.name} (${species.variant})` : species.name;

export const roleMeta = (species) => ROLE_META[species.role];
export const elementMeta = (element) => ELEMENT_META[element] ?? ELEMENT_META.PHYSICAL;

/** The full ability + passive text for a unit at a given level, for tooltips. */
export const describeKit = (species, level) => ({
  special: abilityDef(species.special),
  passives: (species.passives ?? []).map((id) => ({
    ...PASSIVES[id],
    unlocked: level >= PASSIVES[id].level,
  })),
});

/* ── NATURES & INSTANCING ────────────────────────────────────────── */

/**
 * A Nature is a d20 rolled at capture; distance from the centre selects a
 * second die from d2 up to d16, and that die's result is the flat modifier.
 * 11-20 are positive, 1-10 negative.
 */
export const rollNature = (random = Math.random) => {
  const seed = Math.floor(random() * 20) + 1;
  const positive = seed >= 11;
  const distance = positive ? seed - 11 : 10 - seed;
  const dieSize = Math.round(2 + (distance / 9) * 14);
  const magnitude = Math.floor(random() * dieSize) + 1;
  return positive ? magnitude : -magnitude;
};

let instanceCounter = 0;
const newInstanceId = (speciesId) =>
  `${speciesId}#${Date.now().toString(36)}${(instanceCounter++).toString(36)}`;

/**
 * Builds a roster entry. Presets arrive at their authored level and stat line;
 * everything else rolls fresh Natures.
 */
export const createPetInstance = (speciesId, random = Math.random) => {
  const species = getSpecies(speciesId);
  if (!species) throw new Error(`Unknown species "${speciesId}".`);

  const natures = species.isPreset
    ? { ...(species.natures ?? { atk: 0, def: 0, spc: 0 }) }
    : { atk: rollNature(random), def: rollNature(random), spc: rollNature(random) };

  const stats = species.isPreset
    ? { ...species.base }
    : {
        hp: species.base.hp,
        atk: Math.max(1, species.base.atk + natures.atk),
        def: Math.max(1, species.base.def + natures.def),
        spc: Math.max(1, species.base.spc + natures.spc),
      };

  return {
    instanceId: newInstanceId(speciesId),
    speciesId,
    level: species.level ?? 1,
    stats,
    natures,
  };
};

/** Lowest stat value a pet can be manually tuned down to: species base + Nature. */
export const floorStat = (instance, key) => {
  const species = getSpecies(instance.speciesId);
  if (!species) return 1;
  if (species.isPreset) return Math.max(1, species.base[key]);
  return Math.max(1, species.base[key] + (instance.natures?.[key] ?? 0));
};

/* ── SAVE MIGRATION ──────────────────────────────────────────────── */

const emptyTeam = (i) => ({ id: `team_${i}`, name: `Custom Team ${i + 1}`, pets: [] });

export const blankTeams = () =>
  Array.from({ length: RULES.MAX_SAVED_TEAMS }, (_, i) => emptyTeam(i));

/**
 * Normalises whatever is in localStorage into the current shape. Roster entries
 * pointing at species that no longer exist are dropped rather than crashing the
 * builder, which is what makes it safe to retire or rename artwork later.
 */
export const migrateSavedTeams = (raw) => {
  const teams = blankTeams();
  if (!Array.isArray(raw)) return teams;

  raw.slice(0, RULES.MAX_SAVED_TEAMS).forEach((saved, i) => {
    if (!saved || typeof saved !== 'object') return;
    const pets = Array.isArray(saved.pets) ? saved.pets : [];

    teams[i] = {
      id: saved.id ?? `team_${i}`,
      name: typeof saved.name === 'string' && saved.name.trim() ? saved.name : `Custom Team ${i + 1}`,
      pets: pets
        // `dataId` is the pre-refactor field name; accept both.
        .map((p) => ({ ...p, speciesId: p.speciesId ?? p.dataId }))
        .filter((p) => p.speciesId && PET_DB[p.speciesId])
        .slice(0, RULES.TEAM_SIZE)
        .map((p) => {
          const species = PET_DB[p.speciesId];
          const natures = p.natures ?? { atk: 0, def: 0, spc: 0 };
          const stats = p.stats ?? species.base;
          return {
            instanceId: p.instanceId ?? newInstanceId(p.speciesId),
            speciesId: p.speciesId,
            level: Math.min(RULES.MAX_LEVEL, Math.max(1, Number(p.level) || 1)),
            stats: {
              hp: Math.max(1, Number(stats.hp) || species.base.hp),
              atk: Math.max(1, Number(stats.atk) || species.base.atk),
              def: Math.max(1, Number(stats.def) || species.base.def),
              spc: Math.max(1, Number(stats.spc) || species.base.spc),
            },
            natures,
          };
        }),
    };
  });

  return teams;
};

/* ── DEV SANITY CHECK ────────────────────────────────────────────── */

if (import.meta.env?.DEV) {
  for (const species of Object.values(PET_DB)) {
    if (!ABILITIES[species.special]) {
      console.error(`[Pets] ${species.id} references unknown Special "${species.special}".`);
    }
    for (const p of species.passives ?? []) {
      if (!PASSIVES[p]) console.error(`[Pets] ${species.id} references unknown passive "${p}".`);
    }
  }
}
