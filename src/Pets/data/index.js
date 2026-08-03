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
export * from './fields.js';
export { ABILITIES, abilityDef } from './abilities.js';
export { PASSIVES, passiveDef, activePassives } from './passives.js';
export { SPECIES } from './species.js';
export { PRESETS, STABLE_IDS } from './presets.js';

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
export const rollNature = (random = Math.random, { ace = false } = {}) => {
  // An ACE pet still rolls the full d20 for magnitude, it just never lands on
  // the low half: the roll is folded into 11-20 rather than being re-rolled, so
  // an Ace's spread of outcomes matches the top half of a normal pet's exactly.
  const seed = ace
    ? Math.floor(random() * 10) + 11
    : Math.floor(random() * 20) + 1;
  const positive = seed >= 11;
  const distance = positive ? seed - 11 : 10 - seed;
  const dieSize = Math.round(2 + (distance / 9) * 14);
  const magnitude = Math.floor(random() * dieSize) + 1;
  return positive ? magnitude : -magnitude;
};

export const rollNatures = (random = Math.random, { ace = false } = {}) => ({
  atk: rollNature(random, { ace }),
  def: rollNature(random, { ace }),
  spc: rollNature(random, { ace }),
});

let instanceCounter = 0;
const newInstanceId = (speciesId) =>
  `${speciesId}#${Date.now().toString(36)}${(instanceCounter++).toString(36)}`;

/**
 * Builds a roster entry. Presets arrive at their authored level and stat line;
 * everything else rolls fresh Natures.
 */
export const createPetInstance = (speciesId, random = Math.random, { ace = false } = {}) => {
  const species = getSpecies(speciesId);
  if (!species) throw new Error(`Unknown species "${speciesId}".`);

  // A preset's Natures are authored and already baked into its stat line, so
  // Ace has nothing to do there — its line is fixed by design.
  const natures = species.isPreset
    ? { ...(species.natures ?? { atk: 0, def: 0, spc: 0 }) }
    : rollNatures(random, { ace });

  const instance = {
    instanceId: newInstanceId(speciesId),
    speciesId,
    level: species.level ?? 1,
    natures,
    ace: species.isPreset ? false : ace,
    /** Every 1d4 a level-up granted, so a level can be taken back exactly. */
    levelGains: [],
    /** Manual Balance nudges, kept apart so re-rolling Natures does not lose them. */
    manual: { atk: 0, def: 0, spc: 0 },
    stats: null,
  };

  instance.stats = deriveStats(instance);
  return instance;
};

/**
 * The stat line before level-ups and manual tuning: a preset's authored line, or
 * a base species plus its Natures. This is also the floor Manual Balance cannot
 * push below, which is what keeps it a way to spend earned level-ups rather than
 * a cheat.
 */
export const statBasis = (species, natures = {}) => (
  species.isPreset
    ? { ...species.base }
    : {
        hp: species.base.hp,
        atk: Math.max(1, species.base.atk + (natures.atk ?? 0)),
        def: Math.max(1, species.base.def + (natures.def ?? 0)),
        spc: Math.max(1, species.base.spc + (natures.spc ?? 0)),
      }
);

/**
 * Rebuilds a pet's dice from its parts: basis + level-ups + manual tuning.
 * Because every part is stored, any of them can change — re-rolling Natures,
 * taking a level back — without the others being lost.
 */
export const deriveStats = (instance) => {
  const species = getSpecies(instance.speciesId);
  if (!species) return { ...instance.stats };
  const basis = statBasis(species, instance.natures);
  const stats = { hp: basis.hp };

  for (const key of ['atk', 'def', 'spc']) {
    const levelled = (instance.levelGains ?? [])
      .filter((gain) => gain.key === key)
      .reduce((total, gain) => total + gain.amount, 0);
    stats[key] = Math.max(1, basis[key] + levelled + (instance.manual?.[key] ?? 0));
  }
  return stats;
};

/** Lowest stat value a pet can be manually tuned down to: species base + Nature. */
export const floorStat = (instance, key) => {
  const species = getSpecies(instance.speciesId);
  if (!species) return 1;
  return Math.max(1, statBasis(species, instance.natures)[key]);
};

/* ── EDITING A DRAFTED PET ───────────────────────────────────────────
 * Each of these returns a new instance and re-derives the dice, so the builder
 * never has to do stat arithmetic and every edit can be undone.
 */

const STAT_KEYS = ['atk', 'def', 'spc'];

/** A level grants 1d4 to one random die, and the roll is recorded. */
export const levelUpPet = (instance, random = Math.random) => {
  if (instance.level >= RULES.MAX_LEVEL) return instance;
  const gain = {
    key: STAT_KEYS[Math.floor(random() * STAT_KEYS.length)],
    amount: Math.floor(random() * 4) + 1,
  };
  const next = {
    ...instance,
    level: instance.level + 1,
    levelGains: [...(instance.levelGains ?? []), gain],
  };
  return { ...next, stats: deriveStats(next), lastGain: gain };
};

/**
 * Takes the most recent level back, including its exact die bump. A pet
 * migrated from an older save has no itemised gains, so it can be levelled down
 * but its dice stay where they were — there is nothing recorded to remove.
 */
export const levelDownPet = (instance) => {
  const minimum = getSpecies(instance.speciesId)?.level ?? 1;
  if (instance.level <= minimum) return instance;
  const gains = [...(instance.levelGains ?? [])];
  gains.pop();
  const next = { ...instance, level: instance.level - 1, levelGains: gains };
  return { ...next, stats: deriveStats(next), lastGain: null };
};

/** Re-rolls all three Natures. `ace` forces every one of them positive. */
export const rerollNaturesOn = (instance, { ace = false } = {}, random = Math.random) => {
  const species = getSpecies(instance.speciesId);
  // A preset's line is authored; re-rolling it would make it a different pet.
  if (!species || species.isPreset) return instance;
  const next = { ...instance, natures: rollNatures(random, { ace }), ace };
  return { ...next, stats: deriveStats(next), lastGain: null };
};

/** One step of Manual Balance, refused if it would push below the basis. */
export const tunePet = (instance, key, delta) => {
  const next = {
    ...instance,
    manual: { ...instance.manual, [key]: (instance.manual?.[key] ?? 0) + delta },
  };
  const stats = deriveStats(next);
  if (stats[key] < floorStat(instance, key)) return instance;
  return { ...next, stats };
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
          const saved = {
            hp: Math.max(1, Number(stats.hp) || species.base.hp),
            atk: Math.max(1, Number(stats.atk) || species.base.atk),
            def: Math.max(1, Number(stats.def) || species.base.def),
            spc: Math.max(1, Number(stats.spc) || species.base.spc),
          };

          /**
           * Saves written before level-ups were itemised have only a final stat
           * line. Rather than guess which bumps came from levels and which from
           * Manual Balance, the whole surplus over the basis is booked as
           * manual: the dice come out identical, and every future edit is
           * reversible from here on.
           */
          const basis = statBasis(species, natures);
          const manual = p.manual ?? {
            atk: saved.atk - basis.atk,
            def: saved.def - basis.def,
            spc: saved.spc - basis.spc,
          };

          const instance = {
            instanceId: p.instanceId ?? newInstanceId(p.speciesId),
            speciesId: p.speciesId,
            level: Math.min(RULES.MAX_LEVEL, Math.max(1, Number(p.level) || 1)),
            natures,
            ace: Boolean(p.ace),
            levelGains: Array.isArray(p.levelGains) ? p.levelGains : [],
            manual: {
              atk: Number(manual.atk) || 0,
              def: Number(manual.def) || 0,
              spc: Number(manual.spc) || 0,
            },
          };
          instance.stats = deriveStats(instance);
          return instance;
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
