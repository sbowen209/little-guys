This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/Pets/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
src/
  Pets/
    .claude/
      settings.local.json
    data/
      abilities.js
      constants.js
      index.js
      passives.js
      presets.js
      species.js
      statuses.js
    engine/
      balance.mjs
      combatant.js
      events.js
      rng.js
      simulate.js
    hooks/
      useBattlePlayback.js
      useSavedTeams.js
    setup/
      PetSetup.jsx
      SetupParts.jsx
    ui/
      ArenaBackdrop.jsx
      battle.css
      BattleArena.jsx
      BattleLog.jsx
      BenchWings.jsx
      ControlBar.jsx
      describe.js
      Overlays.jsx
      PetNameplate.jsx
      PetSprite.jsx
      PetVitals.jsx
      RollCards.jsx
      StatusFlank.jsx
      TurnCounter.jsx
    index.js
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/Pets/.claude/settings.local.json">
{
  "permissions": {
    "allow": [
      "Read(//c/Users/bowen/little-guys/**)",
      "Bash(node -e ' *)",
      "Bash(node \"C:/Users/bowen/AppData/Local/Temp/claude/C--Users-bowen-little-guys-src-Pets/dfd413b8-3696-4aeb-99e9-03d3e74dc7f4/scratchpad/describe-patch.mjs\")",
      "Bash(npx eslint *)",
      "Bash(npx vite *)",
      "Bash(node \"C:/Users/bowen/AppData/Local/Temp/claude/C--Users-bowen-little-guys-src-Pets/dfd413b8-3696-4aeb-99e9-03d3e74dc7f4/scratchpad/gdd-patch.mjs\")",
      "Bash(node src/Pets/engine/balance.mjs 400)",
      "Bash(node \"C:/Users/bowen/AppData/Local/Temp/claude/C--Users-bowen-little-guys-src-Pets/dfd413b8-3696-4aeb-99e9-03d3e74dc7f4/scratchpad/css3.mjs\")",
      "Bash(node src/Pets/engine/balance.mjs 300)",
      "Bash(node src/Pets/engine/balance.mjs 500)"
    ]
  }
}
</file>

<file path="src/Pets/data/abilities.js">
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
</file>

<file path="src/Pets/data/index.js">
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
</file>

<file path="src/Pets/data/presets.js">
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
    base: { hp: 5, atk: 69, def: 40, spc: 29 },
    art: '/images/pets/HellHound_Fuzzy.webp',
    flavor: 'A d69 attack die. Slow to charge, but it rarely needs to.',
  }),

  lovey: preset('lovey', 'bubble_trouble_physical', {
    name: 'Lovey',
    variant: null,
    level: 1,
    natures: { atk: 1, def: 1, spc: 3 },
    base: { hp: 8, atk: 21, def: 51, spc: 33 },
    flavor: 'Runs the shield. Feeds charge to Dovey and takes it right back.',
  }),

  dovey: preset('dovey', 'bubble_trouble_affinity', {
    name: 'Dovey',
    variant: null,
    level: 1,
    natures: { atk: -3, def: -7, spc: -8 },
    base: { hp: 8, atk: 17, def: 43, spc: 22 },
    flavor: 'Weak on paper. Never charges alone.',
  }),
};
</file>

<file path="src/Pets/engine/combatant.js">
/**
 * @file combatant.js
 * @description Turning a roster entry into a live combatant, plus the derived
 * stat pipeline. Every "what is this pet's die right now" question is answered
 * here and nowhere else, so the HUD and the simulator can never disagree.
 */

import {
  getSpecies, displayName, abilityDef, PASSIVES,
  STATUS, statusDef, isDebuff, RULES,
} from '../data/index.js';

/* ── CONSTRUCTION ────────────────────────────────────────────────── */

export const createCombatant = (entry, side, slot) => {
  const species = getSpecies(entry.speciesId);
  if (!species) throw new Error(`Roster entry references unknown species "${entry.speciesId}".`);

  const level = entry.level ?? species.level ?? 1;
  const passives = (species.passives ?? [])
    .map((id) => PASSIVES[id])
    .filter((p) => p && level >= p.level);

  return {
    instanceId: entry.instanceId,
    side,
    slot,
    speciesId: species.id,
    species,
    name: displayName(species),
    level,
    stats: { ...entry.stats },
    maxHp: entry.stats.hp,
    hp: entry.stats.hp,
    spc: 0,
    statuses: Object.create(null),
    mods: { atkFlat: 0, atkNext: 0, defFlat: 0, defNext: 0 },
    heartCounters: 0,
    fainted: false,
    hasEntered: false,
    passives,
    ability: abilityDef(species.special),
    debuffImmune: passives.some((p) => p.debuffImmune),
  };
};

/* ── STATUS HELPERS ──────────────────────────────────────────────── */

export const stacksOf = (pet, id) => pet.statuses[id]?.stacks ?? 0;
export const hasStatus = (pet, id) => stacksOf(pet, id) > 0;

export const addStacks = (pet, id, count, meta) => {
  const def = statusDef(id);
  const entry = pet.statuses[id] ?? (pet.statuses[id] = { stacks: 0 });
  entry.stacks = def.stackable ? entry.stacks + count : 1;
  if (meta) Object.assign(entry, meta);
  return entry.stacks;
};

export const removeStacks = (pet, id, count = 1) => {
  const entry = pet.statuses[id];
  if (!entry) return 0;
  entry.stacks -= count;
  if (entry.stacks <= 0) {
    delete pet.statuses[id];
    return 0;
  }
  return entry.stacks;
};

export const clearStatus = (pet, id) => { delete pet.statuses[id]; };

export const blocksStatus = (pet, id) => pet.debuffImmune && isDebuff(id);

/* ── DERIVED STATS ───────────────────────────────────────────────── */

/** Max ATK with only permanent modifiers applied — what Sunder checks against. */
export const rawAttackDie = (pet) => pet.stats.atk + pet.mods.atkFlat;

/** Max DEF before any status maths — the value Shed adds to Max ATK. */
export const baseDefenseDie = (pet) =>
  Math.max(1, pet.stats.def + pet.mods.defFlat + pet.mods.defNext);

/**
 * The die the defender actually rolls.
 * Order: flat modifiers -> Damp -> Bubble Shield -> Rend -> Stagnation.
 */
export const defenseDie = (pet) => {
  let d = Math.max(1, pet.stats.def + pet.mods.defFlat + pet.mods.defNext - 10 * stacksOf(pet, STATUS.DAMP));
  if (hasStatus(pet, STATUS.BUBBLE_SHIELD)) d *= 2;
  if (hasStatus(pet, STATUS.REND)) d = Math.floor(d / 2);

  const stagnation = stacksOf(pet, STATUS.STAGNATION);
  if (stagnation > 0) {
    const multiplier = Math.max(RULES.STAGNATION_FLOOR, 1 - RULES.STAGNATION_STEP * stagnation);
    d = Math.floor(d * multiplier);
  }
  return Math.max(1, d);
};

/**
 * The die the attacker actually rolls.
 * Order: flat modifiers -> Shed -> Special scaling -> target's Fade.
 */
export const attackDie = (pet, { scale = 1, targetFade = false } = {}) => {
  let a = Math.max(1, rawAttackDie(pet) + pet.mods.atkNext);
  if (hasStatus(pet, STATUS.SHED)) a += baseDefenseDie(pet);
  a = Math.floor(a * scale);
  if (targetFade) a = Math.floor(a / 2);
  return Math.max(1, a);
};

/* ── SNAPSHOTS ───────────────────────────────────────────────────── */

const snapshotStatuses = (pet) =>
  Object.entries(pet.statuses).map(([id, entry]) => ({ id, stacks: entry.stacks }));

/** A frozen, plain-object view of a pet for the UI. Cheap enough to store per event. */
export const snapshotPet = (pet) => ({
  instanceId: pet.instanceId,
  speciesId: pet.speciesId,
  slot: pet.slot,
  side: pet.side,
  name: pet.name,
  level: pet.level,
  hp: pet.hp,
  maxHp: pet.maxHp,
  spc: pet.spc,
  spcCap: RULES.SPC_CAP,
  fainted: pet.fainted,
  atkDie: attackDie(pet),
  defDie: defenseDie(pet),
  spcDie: pet.stats.spc,
  baseAtkDie: pet.stats.atk,
  baseDefDie: pet.stats.def,
  heartCounters: pet.heartCounters,
  statuses: snapshotStatuses(pet),
});
</file>

<file path="src/Pets/engine/events.js">
/**
 * @file events.js
 * @description The vocabulary the simulator speaks. A battle is a list of these;
 * the view is a pure function of the list plus a cursor. Adding a new visual
 * beat means adding a type here, not threading another flag through the engine.
 */

export const EV = {
  BATTLE_START: 'battle_start',
  INITIATIVE: 'initiative',
  SWITCH_IN: 'switch_in',
  TURN_START: 'turn_start',
  STATUS_TICK: 'status_tick',
  SKIP: 'skip',
  SPC_GAIN: 'spc_gain',
  ACTION: 'action',
  ROLL: 'roll',
  IMPACT: 'impact',
  BLOCK: 'block',
  HEAL: 'heal',
  STATUS_APPLY: 'status_apply',
  STATUS_EXPIRE: 'status_expire',
  STAT_MOD: 'stat_mod',
  PASSIVE: 'passive',
  STAGNATION: 'stagnation',
  FAINT: 'faint',
  BATTLE_END: 'battle_end',
};

/**
 * Milliseconds each beat holds the screen at 1x. These are the pacing dials —
 * the entire feel of the battle is tunable from this one table.
 */
export const HOLD = {
  [EV.BATTLE_START]: 1500,
  [EV.INITIATIVE]: 1150,
  [EV.SWITCH_IN]: 850,
  [EV.TURN_START]: 340,
  [EV.STATUS_TICK]: 950,
  [EV.SKIP]: 850,
  [EV.SPC_GAIN]: 430,
  [EV.ACTION]: 560,
  [EV.ROLL]: 1050,
  [EV.IMPACT]: 720,
  [EV.BLOCK]: 700,
  [EV.HEAL]: 620,
  [EV.STATUS_APPLY]: 540,
  [EV.STATUS_EXPIRE]: 260,
  [EV.STAT_MOD]: 540,
  [EV.PASSIVE]: 620,
  [EV.STAGNATION]: 900,
  [EV.FAINT]: 1200,
  [EV.BATTLE_END]: 2200,
};

/** Global pacing trim. Below 1 makes the whole match snappier at every speed. */
export const TEMPO = 0.82;

export const holdFor = (event) =>
  Math.round((event.hold ?? HOLD[event.type] ?? 500) * TEMPO);

/** Total 1x runtime of a timeline, in ms — shown on the scrubber. */
export const timelineDuration = (timeline) =>
  timeline.reduce((total, event) => total + holdFor(event), 0);
</file>

<file path="src/Pets/engine/rng.js">
/**
 * @file rng.js
 * @description Seeded random number generation. The whole simulation draws from
 * one seeded stream, which makes a battle reproducible from its seed alone —
 * useful for replays, for "rematch with the same rolls", and for testing the
 * engine without stubbing Math.random.
 */

/** mulberry32 — small, fast, and good enough for dice. */
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomSeed = () => (Math.random() * 0xffffffff) >>> 0;

export const createRng = (seed = randomSeed()) => {
  const next = mulberry32(seed);
  let calls = 0;

  const float = () => {
    calls += 1;
    return next();
  };

  return {
    seed,
    /** Number of draws taken so far — handy when debugging desyncs. */
    get calls() { return calls; },
    float,
    /** 1..max inclusive. Guards against a die that debuffs pushed below 1. */
    die: (max) => Math.floor(float() * Math.max(1, Math.floor(max))) + 1,
    /** true with probability 1/n. */
    oneIn: (n) => Math.floor(float() * Math.max(1, n)) === 0,
    coin: () => float() < 0.5,
    pick: (list) => list[Math.floor(float() * list.length)],
  };
};
</file>

<file path="src/Pets/hooks/useBattlePlayback.js">
/**
 * @file useBattlePlayback.js
 * @description Walks a simulated timeline in real time. One requestAnimationFrame
 * loop drives everything, so speed changes are instant and smooth mid-beat, the
 * loop parks itself when the tab is hidden, and tearing the component down can
 * never leave a timer running against a dead tree.
 *
 * React re-renders once per event, not once per frame.
 *
 * The hook holds no reset path: a rematch is a different battle, so the owner
 * remounts the stage with a new key rather than trying to rewind this state in
 * place. That keeps every cursor and accumulator here write-only from effects.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { holdFor, timelineDuration } from '../engine/events.js';

// A full 5v5 averages ~95 turns, so a high gear matters more here than in a
// shorter format — 8x brings a long match down to about a minute.
export const SPEEDS = [1, 2, 4, 8];

export function useBattlePlayback(result) {
  const timeline = result?.timeline;
  const lastIndex = timeline ? timeline.length - 1 : 0;

  const [index, setIndex] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [paused, setPausedState] = useState(false);
  const [finished, setFinished] = useState(false);

  const indexRef = useRef(0);
  const speedRef = useRef(1);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const accRef = useRef(0);

  useEffect(() => {
    if (!timeline?.length) return undefined;

    let frame = 0;
    let last = performance.now();

    const tick = (now) => {
      frame = requestAnimationFrame(tick);

      // Clamp so returning from a background tab doesn't fast-forward the match.
      const delta = Math.min(now - last, 200);
      last = now;
      if (pausedRef.current || finishedRef.current) return;

      accRef.current += delta * speedRef.current;

      let cursor = indexRef.current;
      let moved = false;

      while (cursor < timeline.length - 1 && accRef.current >= holdFor(timeline[cursor])) {
        accRef.current -= holdFor(timeline[cursor]);
        cursor += 1;
        moved = true;
      }

      if (moved) {
        indexRef.current = cursor;
        setIndex(cursor);
      }

      if (cursor >= timeline.length - 1 && accRef.current >= holdFor(timeline[cursor]) * 0.5) {
        finishedRef.current = true;
        setFinished(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timeline]);

  const setSpeed = useCallback((value) => {
    speedRef.current = value;
    setSpeedState(value);
  }, []);

  const setPaused = useCallback((value) => {
    pausedRef.current = value;
    setPausedState(value);
  }, []);

  const togglePaused = useCallback(() => setPaused(!pausedRef.current), [setPaused]);

  const jumpTo = useCallback((target) => {
    if (!timeline?.length) return;
    const clamped = Math.max(0, Math.min(timeline.length - 1, target));
    indexRef.current = clamped;
    accRef.current = 0;
    finishedRef.current = clamped >= timeline.length - 1;
    setIndex(clamped);
    setFinished(finishedRef.current);
  }, [timeline]);

  const skipToEnd = useCallback(() => jumpTo(lastIndex), [jumpTo, lastIndex]);

  const step = useCallback(() => {
    setPaused(true);
    jumpTo(indexRef.current + 1);
  }, [jumpTo, setPaused]);

  const totalMs = useMemo(() => (timeline ? timelineDuration(timeline) : 0), [timeline]);

  const event = timeline?.[index] ?? null;

  return {
    timeline,
    index,
    event,
    state: event?.state ?? null,
    outcome: result?.outcome ?? null,
    finished,
    paused,
    speed,
    progress: lastIndex ? index / lastIndex : 0,
    totalMs,
    setSpeed,
    setPaused,
    togglePaused,
    jumpTo,
    skipToEnd,
    step,
  };
}
</file>

<file path="src/Pets/hooks/useSavedTeams.js">
/**
 * @file useSavedTeams.js
 * @description Persistence for the 12 saved rosters. Everything read out of
 * localStorage goes through migrateSavedTeams, so a save written by an older
 * version — or one referencing a pet that has since been retired — loads
 * cleanly instead of throwing on a missing species.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { blankTeams, migrateSavedTeams } from '../data/index.js';

const STORAGE_KEY = 'gpb_saved_teams';

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrateSavedTeams(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn('[Pets] Saved teams could not be read, starting fresh.', error);
    return blankTeams();
  }
};

export function useSavedTeams() {
  const [teams, setTeams] = useState(load);
  const first = useRef(true);

  useEffect(() => {
    // Skip the write on mount so a read-only visit never rewrites the save.
    if (first.current) { first.current = false; return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch (error) {
      console.warn('[Pets] Saved teams could not be written.', error);
    }
  }, [teams]);

  const saveTeam = useCallback((index, team) => {
    setTeams((previous) => previous.map((existing, i) => (i === index ? team : existing)));
  }, []);

  const clearTeam = useCallback((index) => {
    setTeams((previous) =>
      previous.map((existing, i) => (i === index ? { ...existing, pets: [] } : existing)));
  }, []);

  return { teams, saveTeam, clearTeam };
}
</file>

<file path="src/Pets/setup/PetSetup.jsx">
import { useCallback, useMemo, useState } from 'react';
import {
  PET_DB, listSpecies, getSpecies, displayName, roleMeta,
  createPetInstance, floorStat, ROLE_META, ROLE_ORDER, RULES,
} from '../data/index.js';
import { useSavedTeams } from '../hooks/useSavedTeams.js';
import {
  HeroAura, KitPanel, LibraryCard, SETUP_STYLES, ShowcaseImage, StatBadge, TypeChip,
} from './SetupParts.jsx';
import { assetUrl } from '../../utils/assets.js';

const STAT_KEYS = ['atk', 'def', 'spc'];

/** Level-ups grant one random die bump of 1d4 across ATK / DEF / SPC. */
const rollLevelGain = () => ({
  key: STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)],
  amount: Math.floor(Math.random() * 4) + 1,
});

const Shell = ({ children }) => (
  <div className="pet-setup relative min-h-screen w-full overflow-hidden bg-stone-950 font-sans text-stone-200">
    <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-indigo-900/15 mix-blend-screen blur-[150px]" />
    <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-900/10 mix-blend-screen blur-[150px]" />
    {children}
    <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
  </div>
);

const TeamThumbs = ({ team, mirrored }) => (
  <div className={`flex gap-2 ${mirrored ? 'flex-row-reverse' : ''}`}>
    {team.pets.length === 0
      ? <span className="font-mono text-xs italic text-stone-600">Empty roster</span>
      : team.pets.map((pet, i) => (
        <div
          key={pet.instanceId}
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-stone-700 bg-stone-950"
          title={displayName(getSpecies(pet.speciesId))}
        >
          {i === 0 && (
            <span className="absolute bottom-0 z-10 w-full bg-amber-500 text-center font-mono text-[7px] font-black leading-tight text-amber-950">
              LEAD
            </span>
          )}
          <img src={assetUrl(getSpecies(pet.speciesId).art)} alt="" className="h-8 origin-bottom scale-110 object-contain" />
        </div>
      ))}
  </div>
);

/* ── MENU ────────────────────────────────────────────────────────── */

function MenuView({ onBattle, onBuild, onBack }) {
  return (
    <Shell>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-4xl flex-col gap-8 text-center">
          <h1 className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text font-serif text-6xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_15px_rgba(251,191,36,0.35)] md:text-8xl">
            PET BATTLER
          </h1>
          <p className="mb-4 font-mono text-sm uppercase tracking-widest text-stone-400">
            Tactical 1v1 dice autobattler
          </p>

          <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
            <button
              type="button"
              onClick={onBattle}
              className="group rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-amber-500 hover:bg-stone-800/80 hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)]"
            >
              <h2 className="font-serif text-4xl font-black text-white transition-colors group-hover:text-amber-400">Battle Arena</h2>
              <p className="mt-4 font-mono text-sm leading-relaxed text-stone-400">
                Pick two saved rosters and watch the match resolve itself.
              </p>
            </button>
            <button
              type="button"
              onClick={onBuild}
              className="group rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-sky-500 hover:bg-stone-800/80 hover:shadow-[0_20px_40px_rgba(56,189,248,0.15)]"
            >
              <h2 className="font-serif text-4xl font-black text-white transition-colors group-hover:text-sky-400">Team Builder</h2>
              <p className="mt-4 font-mono text-sm leading-relaxed text-stone-400">
                Draft pets, roll Natures, level them up and lock in your deployment order.
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 font-mono text-sm uppercase tracking-widest text-stone-500 transition-colors hover:text-white"
          >
            Return to Gateway Hub
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ── ROSTER LIST ─────────────────────────────────────────────────── */

function RosterListView({ teams, onEdit, onBack }) {
  return (
    <Shell>
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 p-6 md:p-10">
        <header className="flex items-end justify-between border-b border-stone-800 pb-6">
          <div>
            <h1 className="font-serif text-4xl font-black text-white drop-shadow-md md:text-5xl">Team Builder</h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-sky-400">
              {RULES.MAX_SAVED_TEAMS} saved rosters · {RULES.TEAM_SIZE} pets each
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-stone-700 bg-stone-900/50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-stone-400 backdrop-blur-sm transition-colors hover:border-stone-500 hover:text-white"
          >
            Back to Menu
          </button>
        </header>

        <div className="pet-scroll grid grid-cols-1 gap-6 overflow-y-auto pb-12 pr-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((team, index) => (
            <button
              key={team.id}
              type="button"
              onClick={() => onEdit(index)}
              className="group flex flex-col items-start rounded-2xl border border-stone-700/80 bg-stone-900/60 p-6 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-sky-500 hover:bg-stone-800 hover:shadow-[0_15px_30px_rgba(56,189,248,0.15)]"
            >
              <span className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500 transition-colors group-hover:text-sky-400/70">
                Slot {index + 1}
              </span>
              <span className="w-full truncate font-serif text-2xl font-black text-white transition-colors group-hover:text-sky-400">
                {team.name}
              </span>
              <div className="mt-6 flex h-10 items-center">
                <TeamThumbs team={team} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ── ROSTER EDITOR ───────────────────────────────────────────────── */

function RosterEditView({ index, initial, onSave, onCancel }) {
  const [team, setTeam] = useState(initial);
  const [selection, setSelection] = useState(null); // { source: 'roster'|'library', id }
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tuning, setTuning] = useState(false);
  const [flash, setFlash] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const library = useMemo(
    () => listSpecies().filter((species) => roleFilter === 'ALL' || species.role === roleFilter),
    [roleFilter],
  );

  const rosterPet = selection?.source === 'roster'
    ? team.pets.find((pet) => pet.instanceId === selection.id) ?? null
    : null;
  const species = rosterPet
    ? getSpecies(rosterPet.speciesId)
    : selection?.source === 'library' ? PET_DB[selection.id] : null;

  const level = rosterPet?.level ?? species?.level ?? 1;
  const stats = rosterPet?.stats ?? species?.base ?? null;
  const natures = rosterPet?.natures ?? species?.natures ?? null;

  const draft = useCallback((speciesId) => {
    if (team.pets.length >= RULES.TEAM_SIZE) return;
    const instance = createPetInstance(speciesId);
    setTeam((previous) => ({ ...previous, pets: [...previous.pets, instance] }));
    setSelection({ source: 'roster', id: instance.instanceId });
    setTuning(false);
  }, [team.pets.length]);

  const release = useCallback((instanceId) => {
    setTeam((previous) => ({ ...previous, pets: previous.pets.filter((pet) => pet.instanceId !== instanceId) }));
    setSelection((current) => (current?.id === instanceId ? null : current));
  }, []);

  const reorder = useCallback((from, to) => {
    if (from === to || from === null) return;
    setTeam((previous) => {
      const pets = [...previous.pets];
      const [moved] = pets.splice(from, 1);
      pets.splice(to, 0, moved);
      return { ...previous, pets };
    });
  }, []);

  const levelUp = useCallback((instanceId) => {
    const gain = rollLevelGain();
    setFlash(gain.key);
    setTimeout(() => setFlash(null), 1100);
    setTeam((previous) => ({
      ...previous,
      pets: previous.pets.map((pet) => (
        pet.instanceId === instanceId && pet.level < RULES.MAX_LEVEL
          ? { ...pet, level: pet.level + 1, stats: { ...pet.stats, [gain.key]: pet.stats[gain.key] + gain.amount } }
          : pet
      )),
    }));
  }, []);

  const tune = useCallback((instanceId, key, delta) => {
    setTeam((previous) => ({
      ...previous,
      pets: previous.pets.map((pet) => {
        if (pet.instanceId !== instanceId) return pet;
        const next = pet.stats[key] + delta;
        if (next < floorStat(pet, key)) return pet;
        return { ...pet, stats: { ...pet.stats, [key]: next } };
      }),
    }));
  }, []);

  return (
    <div className="pet-setup relative flex h-screen w-full flex-col overflow-hidden bg-stone-950 font-sans text-stone-200">
      <header className="relative z-50 flex shrink-0 items-center justify-between gap-6 border-b border-stone-800/60 bg-stone-950/60 p-6 backdrop-blur-md lg:px-8">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Roster slot {index + 1}</span>
          <input
            type="text"
            value={team.name}
            maxLength={24}
            onChange={(event) => setTeam((previous) => ({ ...previous, name: event.target.value }))}
            placeholder="Enter team name"
            className="w-[280px] border-none bg-transparent p-0 font-serif text-3xl font-black text-white outline-none transition-colors placeholder:text-stone-700 focus:text-sky-400"
          />
        </div>

        <div className="flex gap-3">
          {Array.from({ length: RULES.TEAM_SIZE }).map((_, slot) => {
            const pet = team.pets[slot];
            if (!pet) {
              return (
                <div key={`empty-${slot}`} className="flex h-14 w-36 items-center justify-center rounded-xl border-2 border-dashed border-stone-700/50 bg-stone-900/30">
                  <span className="font-mono text-[10px] uppercase text-stone-600">Slot {slot + 1}</span>
                </div>
              );
            }
            const petSpecies = getSpecies(pet.speciesId);
            const selected = selection?.source === 'roster' && selection.id === pet.instanceId;

            return (
              <div
                key={pet.instanceId}
                className="group relative flex cursor-grab items-center active:cursor-grabbing"
                draggable
                onDragStart={() => setDragIndex(slot)}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                onDrop={(event) => { event.preventDefault(); reorder(dragIndex, slot); setDragIndex(null); }}
                onDragEnd={() => setDragIndex(null)}
              >
                <button
                  type="button"
                  onClick={() => { setSelection({ source: 'roster', id: pet.instanceId }); setTuning(false); }}
                  className={`relative flex h-14 w-36 items-center gap-3 rounded-xl border pl-2 pr-3 transition-all duration-300 ${
                    selected
                      ? 'z-10 scale-105 border-sky-400 bg-stone-800 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'border-stone-700 bg-stone-900/80 hover:border-stone-500 hover:bg-stone-800'
                  }`}
                >
                  {slot === 0 && (
                    <span className="absolute -left-2 -top-2 z-20 rounded border border-amber-400 bg-amber-500 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase text-amber-950 shadow-lg">
                      Lead
                    </span>
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-600 bg-stone-950">
                    <img src={assetUrl(petSpecies.art)} alt="" className="h-8 origin-bottom scale-125 object-contain" />
                  </div>
                  <div className="flex min-w-0 flex-col items-start">
                    <span className={`w-full truncate text-left font-serif text-sm font-bold leading-tight ${selected ? 'text-white' : 'text-stone-300'}`}>
                      {displayName(petSpecies)}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-sky-400">Lv.{pet.level}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => release(pet.instanceId)}
                  className="absolute -right-2 -top-2 z-30 flex h-5 w-5 items-center justify-center rounded-full border border-stone-600 bg-stone-800 text-[10px] text-stone-400 opacity-0 shadow-lg transition-all hover:border-rose-500 hover:bg-rose-600 hover:text-white group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="font-mono text-xs uppercase tracking-widest text-stone-500 transition-colors hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(team)}
            className="rounded-sm bg-sky-500 px-8 py-3 font-mono text-sm font-black uppercase tracking-widest text-stone-950 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]"
          >
            Save Roster
          </button>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[55%] items-end justify-center">
          {species && (
            <>
              <HeroAura species={species} />
              <ShowcaseImage key={species.id} species={species} />
            </>
          )}
        </div>

        <div className="pet-scroll absolute inset-y-0 left-0 z-20 flex w-full max-w-[45%] flex-col justify-center overflow-y-auto bg-gradient-to-r from-stone-950 via-stone-950/95 to-transparent px-8 pb-8 lg:px-12">
          {!species ? (
            <div className="flex h-full flex-col items-center justify-center opacity-50">
              <span className="mb-4 text-6xl">🔍</span>
              <h2 className="font-serif text-2xl font-bold text-stone-400">Select a pet</h2>
              <p className="mt-2 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
                Click a roster slot above, or<br />browse the library below.
              </p>
            </div>
          ) : (
            <div className="animate-[petPop_0.3s_ease-out_both] pt-8">
              <div className="mb-2 flex items-center gap-3">
                <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]" style={{ color: roleMeta(species).hex }}>
                  {roleMeta(species).label}
                </p>
                {species.isPreset && (
                  <span className="rounded bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-950">Preset</span>
                )}
              </div>

              <h2 className="mb-2 font-serif text-5xl font-black leading-none tracking-tight text-white drop-shadow-xl lg:text-6xl">
                {displayName(species)}
              </h2>
              {species.flavor && <p className="mb-4 max-w-md text-sm italic leading-relaxed text-stone-500">{species.flavor}</p>}

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <TypeChip element={species.typing.offensive} prefix="ATK" />
                <TypeChip element={species.typing.defensive} prefix="DEF" />
                <span className="rounded-full border border-stone-600 bg-stone-800/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">
                  Lv.{level}
                </span>
                <span
                  className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: roleMeta(species).hex, borderColor: `${roleMeta(species).hex}55` }}
                  title={roleMeta(species).blurb}
                >
                  {roleMeta(species).blurb}
                </span>
              </div>

              <div className="mb-8 flex gap-4">
                <StatBadge icon="♥" label="Health" value={stats.hp} tone="hp" highlighted={flash === 'hp'} />
                {STAT_KEYS.map((key) => (
                  <StatBadge
                    key={key}
                    icon={{ atk: '⚔', def: '🛡', spc: '⚡' }[key]}
                    label={{ atk: 'Attack', def: 'Defense', spc: 'Special' }[key]}
                    value={stats[key]}
                    tone={key}
                    highlighted={flash === key}
                    editing={tuning && Boolean(rosterPet)}
                    onInc={() => tune(rosterPet.instanceId, key, 1)}
                    onDec={() => tune(rosterPet.instanceId, key, -1)}
                    canDec={rosterPet ? rosterPet.stats[key] > floorStat(rosterPet, key) : false}
                    nature={natures?.[key]}
                  />
                ))}
              </div>

              <div className="mb-8 flex items-center gap-4">
                {selection?.source === 'library' ? (
                  <button
                    type="button"
                    onClick={() => draft(species.id)}
                    disabled={team.pets.length >= RULES.TEAM_SIZE}
                    className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {team.pets.length >= RULES.TEAM_SIZE ? 'Roster full' : 'Draft to team'}
                  </button>
                ) : (
                  <>
                    {level < RULES.MAX_LEVEL ? (
                      <button
                        type="button"
                        onClick={() => levelUp(rosterPet.instanceId)}
                        className="rounded-lg bg-white px-8 py-3 font-mono text-sm font-black uppercase tracking-widest text-stone-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-stone-200"
                      >
                        Level up (+1d4 to a die)
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                        <span className="text-xl leading-none text-emerald-400">✓</span>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Max level</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setTuning((value) => !value)}
                      className={`rounded-lg border px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all ${
                        tuning
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                          : 'border-stone-600 bg-stone-800/50 text-stone-400 hover:bg-stone-700 hover:text-white'
                      }`}
                    >
                      {tuning ? 'Done' : 'Manual balance'}
                    </button>
                  </>
                )}
              </div>

              <KitPanel species={species} level={level} />
            </div>
          )}
        </div>
      </main>

      <section className="relative z-30 shrink-0 border-t border-stone-800/60 bg-stone-950/80 px-6 pb-6 backdrop-blur-xl lg:px-8">
        <div className="flex items-center justify-between py-4">
          <h3 className="pl-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            Library · {library.length} pets
          </h3>
          <div className="flex flex-wrap gap-2">
            {['ALL', ...ROLE_ORDER].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`rounded px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors ${
                  roleFilter === role ? 'bg-amber-500 text-stone-950' : 'border border-stone-700 bg-stone-900 text-stone-500 hover:text-stone-300'
                }`}
              >
                {role === 'ALL' ? 'All' : ROLE_META[role].label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-stone-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-stone-950 to-transparent" />
          <div className="pet-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 pt-2">
            {library.map((entry) => (
              <LibraryCard
                key={entry.id}
                species={entry}
                selected={selection?.source === 'library' && selection.id === entry.id}
                onSelect={() => { setSelection({ source: 'library', id: entry.id }); setTuning(false); }}
              />
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
    </div>
  );
}

/* ── BATTLE SELECT ───────────────────────────────────────────────── */

const SIDE_ACCENT = [
  { text: 'text-sky-400', dot: 'bg-sky-400 shadow-[0_0_15px_#38bdf8]', panel: 'bg-sky-950/20 border-sky-900/50', active: 'border-sky-500 bg-sky-900/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]' },
  { text: 'text-rose-400', dot: 'bg-rose-500 shadow-[0_0_15px_#f43f5e]', panel: 'bg-rose-950/20 border-rose-900/50', active: 'border-rose-500 bg-rose-900/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]' },
];

function TeamPicker({ side, teams, picked, onPick }) {
  const accent = SIDE_ACCENT[side];

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-4 rounded-2xl border p-4 shadow-inner backdrop-blur-sm ${accent.panel} ${side === 1 ? 'flex-row-reverse' : ''}`}>
        <div className={`h-4 w-4 rounded-full ${accent.dot}`} />
        <h2 className={`font-serif text-3xl font-black ${accent.text}`}>Player {side + 1}</h2>
      </div>
      <div className="pet-scroll flex max-h-[440px] flex-col gap-3 overflow-y-auto pr-2">
        {teams.map((team, index) => {
          if (team.pets.length === 0) return null;
          const selected = picked === index;
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onPick(index)}
              className={`flex flex-col gap-4 rounded-2xl border-2 p-5 transition-all duration-300 ${side === 1 ? 'items-end' : 'items-start'} ${
                selected ? `scale-[1.02] ${accent.active}` : 'border-stone-800 bg-stone-900/60 hover:border-stone-600'
              }`}
            >
              <span className={`font-serif text-xl font-bold ${selected ? 'text-white' : 'text-stone-300'}`}>{team.name}</span>
              <TeamThumbs team={team} mirrored={side === 1} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BattleSelectView({ teams, onBack, onBuild, onBegin }) {
  const [picks, setPicks] = useState([null, null]);
  const ready = teams.filter((team) => team.pets.length > 0);

  const pick = (side, index) =>
    setPicks((previous) => previous.map((value, i) => (i === side ? index : value)));

  const start = () => {
    if (picks[0] === null || picks[1] === null) return;
    const hydrate = (index) => teams[index].pets.map((pet) => ({
      instanceId: pet.instanceId,
      speciesId: pet.speciesId,
      level: pet.level,
      stats: { ...pet.stats },
    }));
    onBegin({ team1: hydrate(picks[0]), team2: hydrate(picks[1]) });
  };

  return (
    <Shell>
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 p-6 md:p-10">
        <header className="flex items-end justify-between border-b border-stone-800 pb-6">
          <div>
            <h1 className="font-serif text-4xl font-black text-amber-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] md:text-5xl">
              Battle Preparation
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-stone-400">
              Lineup order is locked once the match begins
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-stone-700 bg-stone-900/50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-stone-400 backdrop-blur-sm transition-colors hover:border-stone-500 hover:text-white"
          >
            Back to Menu
          </button>
        </header>

        {ready.length < 2 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-700 bg-stone-900/30 p-10 text-center backdrop-blur-sm">
            <span className="mb-4 text-6xl">⚠️</span>
            <h2 className="mb-2 font-serif text-3xl font-black text-white">Not enough teams</h2>
            <p className="max-w-md font-mono text-sm leading-relaxed text-stone-500">
              Build at least two rosters before entering the arena.
            </p>
            <button
              type="button"
              onClick={onBuild}
              className="mt-8 rounded-sm bg-sky-500 px-8 py-3 font-mono text-sm font-black uppercase tracking-widest text-stone-950 shadow-lg transition-colors hover:bg-sky-400"
            >
              Go to Team Builder
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
              <TeamPicker side={0} teams={teams} picked={picks[0]} onPick={(index) => pick(0, index)} />
              <TeamPicker side={1} teams={teams} picked={picks[1]} onPick={(index) => pick(1, index)} />
            </div>

            <div className="mt-auto flex justify-center py-8">
              <button
                type="button"
                disabled={picks[0] === null || picks[1] === null}
                onClick={start}
                className="group relative overflow-hidden rounded-sm bg-amber-500 px-16 py-5 font-mono text-2xl font-black uppercase tracking-widest text-stone-950 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:scale-105 hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] disabled:grayscale disabled:hover:scale-100"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/30 group-hover:animate-[petShine_0.7s_ease-out]" />
                <span className="relative">Initiate Duel</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ── ROUTER ──────────────────────────────────────────────────────── */

export default function PetSetup({ onBack, onBeginBattle }) {
  const { teams, saveTeam } = useSavedTeams();
  const [view, setView] = useState('menu');
  const [editing, setEditing] = useState(null);

  if (view === 'builder_edit' && editing !== null) {
    return (
      <RosterEditView
        index={editing}
        initial={teams[editing]}
        onCancel={() => setView('builder_list')}
        onSave={(team) => { saveTeam(editing, team); setView('builder_list'); }}
      />
    );
  }

  if (view === 'builder_list') {
    return (
      <RosterListView
        teams={teams}
        onBack={() => setView('menu')}
        onEdit={(index) => { setEditing(index); setView('builder_edit'); }}
      />
    );
  }

  if (view === 'battle_select') {
    return (
      <BattleSelectView
        teams={teams}
        onBack={() => setView('menu')}
        onBuild={() => setView('builder_list')}
        onBegin={onBeginBattle}
      />
    );
  }

  return (
    <MenuView
      onBattle={() => setView('battle_select')}
      onBuild={() => setView('builder_list')}
      onBack={onBack}
    />
  );
}
</file>

<file path="src/Pets/setup/SetupParts.jsx">
import { memo, useState } from 'react';
import { displayName, elementMeta, roleMeta, abilityDef, PASSIVES } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/* ── SMALL PIECES ────────────────────────────────────────────────── */

export function TypeChip({ element, prefix }) {
  const meta = elementMeta(element);
  return (
    <span
      className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
      style={{ color: meta.hex, borderColor: `${meta.hex}55`, background: `${meta.hex}14` }}
    >
      {prefix}: {meta.icon} {element}
    </span>
  );
}

const TONES = {
  hp: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  atk: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  def: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  spc: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
};

export function StatBadge({ icon, label, value, tone, highlighted, editing, onInc, onDec, canDec, nature }) {
  return (
    <div
      className={`relative flex min-w-[92px] flex-col items-center gap-2 rounded-xl border px-2 py-3 shadow-lg backdrop-blur-md transition-all duration-300 ${
        highlighted
          ? 'z-10 scale-110 border-white bg-stone-800 shadow-[0_0_20px_rgba(255,255,255,0.55)]'
          : 'border-stone-700/80 bg-stone-900/70'
      }`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ring-1 ${TONES[tone]}`}>
        {icon}
      </div>
      <div className="w-full text-center">
        <span className="block font-mono text-[9px] uppercase tracking-widest text-stone-500">{label}</span>
        <div className="mt-1 flex items-center justify-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={onDec}
              disabled={!canDec}
              className="flex h-5 w-5 items-center justify-center rounded bg-stone-800 text-stone-400 transition-colors hover:bg-rose-600 hover:text-white disabled:opacity-20 disabled:hover:bg-stone-800"
            >
              −
            </button>
          )}
          <span className={`block font-mono text-xl font-black leading-tight tabular-nums ${highlighted ? 'text-white' : 'text-stone-200'}`}>
            {tone === 'hp' ? '' : 'd'}{value}
          </span>
          {editing && (
            <button
              type="button"
              onClick={onInc}
              className="flex h-5 w-5 items-center justify-center rounded bg-stone-800 text-stone-400 transition-colors hover:bg-emerald-600 hover:text-white"
            >
              +
            </button>
          )}
        </div>
        {nature !== undefined && nature !== null && (
          <span className={`mt-1.5 block font-mono text-[8.5px] uppercase tracking-widest ${
            nature > 0 ? 'text-emerald-400' : nature < 0 ? 'text-rose-400' : 'text-stone-500'
          }`}
          >
            Nature {nature > 0 ? '+' : ''}{nature}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── KIT (SPECIAL + PASSIVES) ────────────────────────────────────── */

function KitRow({ title, body, state }) {
  const styles = {
    special: 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(251,191,36,0.14)]',
    active: 'border-stone-800/60 bg-stone-900/80',
    locked: 'border-stone-800/60 bg-stone-950/50 opacity-60 grayscale-[0.5]',
  };
  const marks = { special: '✨', active: '✦', locked: '🔒' };
  const titleColor = { special: 'text-amber-400', active: 'text-stone-100', locked: 'text-stone-500' };
  const bodyColor = { special: 'text-amber-200/80', active: 'text-stone-400', locked: 'text-stone-600' };

  return (
    <li className={`rounded-lg border px-4 py-3 backdrop-blur-sm transition-all ${styles[state]}`}>
      <div className="flex items-center gap-2">
        <span className={state === 'special' ? 'text-amber-400' : 'text-stone-600'}>{marks[state]}</span>
        <span className={`font-serif font-bold tracking-wide ${titleColor[state]}`}>{title}</span>
      </div>
      <p className={`mt-1 pl-6 text-sm leading-snug ${bodyColor[state]}`}>{body}</p>
    </li>
  );
}

/** Reads straight from the registries, so ability text can never go stale. */
export const KitPanel = memo(function KitPanel({ species, level }) {
  const special = abilityDef(species.special);

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
        Special &amp; Passives
      </h3>
      <ul className="flex max-w-xl flex-col gap-3 pb-8">
        <KitRow
          state="special"
          title={`Special: ${special.name} · ${special.cost} charge · ${special.kind === 'effect' ? 'No roll' : 'Attack'}`}
          body={special.desc}
        />
        {(species.passives ?? []).map((id) => {
          const passive = PASSIVES[id];
          const unlocked = level >= passive.level;
          return (
            <KitRow
              key={id}
              state={unlocked ? 'active' : 'locked'}
              title={unlocked ? passive.name : `${passive.name} — unlocks at Lv.${passive.level}`}
              body={passive.desc}
            />
          );
        })}
      </ul>
    </div>
  );
});

/* ── SHOWCASE ────────────────────────────────────────────────────── */

export function HeroAura({ species }) {
  const off = elementMeta(species.typing.offensive);
  const def = elementMeta(species.typing.defensive);
  const dual = species.typing.offensive !== 'PHYSICAL' && species.typing.offensive !== species.typing.defensive;

  return (
    <div className="pointer-events-none absolute bottom-[20%] left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 mix-blend-screen">
      <div
        className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(circle, ${def.hex}40 0%, transparent 70%)` }}
      />
      {dual && (
        <div
          className="absolute inset-0 animate-[petSpinAura_14s_linear_infinite] rounded-full blur-[70px]"
          style={{ background: `radial-gradient(circle at 65% 35%, ${off.hex}50 0%, transparent 65%)` }}
        />
      )}
      <div
        className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-[50px]"
        style={{ background: `radial-gradient(circle, ${def.hex}60 0%, transparent 80%)` }}
      />
    </div>
  );
}

export function ShowcaseImage({ species }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative z-10 flex h-full w-full animate-[petFloat_7s_ease-in-out_infinite] items-end justify-center pb-12">
      <div className="absolute bottom-[10%] h-10 w-2/3 rounded-full bg-black/80 blur-2xl" />
      <img
        src={assetUrl(species.art)}
        alt={displayName(species)}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`h-full max-h-[480px] w-full origin-bottom select-none object-contain object-bottom drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-[opacity,transform] duration-700 ease-out ${
          loaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      />
    </div>
  );
}

/* ── LIBRARY CARD ────────────────────────────────────────────────── */

export const LibraryCard = memo(function LibraryCard({ species, selected, onSelect }) {
  const off = elementMeta(species.typing.offensive);
  const def = elementMeta(species.typing.defensive);
  const role = roleMeta(species);
  const dual = species.typing.offensive !== 'PHYSICAL' && species.typing.offensive !== species.typing.defensive;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative h-28 w-44 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        selected
          ? '-translate-y-1 scale-105 border-amber-400 shadow-[0_0_22px_-2px_rgba(251,191,36,0.55)]'
          : 'border-stone-800 opacity-60 hover:-translate-y-1 hover:border-stone-600 hover:opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-stone-900" />
      <img
        src={assetUrl(species.art)}
        alt=""
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-30 mix-blend-luminosity transition-all duration-500 group-hover:scale-110 group-hover:opacity-60 group-hover:mix-blend-normal"
      />
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${selected ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}
        style={{ background: dual ? `linear-gradient(135deg, ${def.hex} 30%, ${off.hex} 70%)` : def.hex }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

      <div className="absolute inset-x-3 bottom-2 z-10 flex flex-col text-left">
        <span className={`truncate font-serif text-base font-bold leading-tight ${selected ? 'text-white' : 'text-stone-300'}`}>
          {displayName(species)}
        </span>
        <span className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-widest" style={{ color: role.hex }}>
          {role.label}
        </span>
      </div>

      {species.isPreset && (
        <span className="absolute left-2 top-2 z-10 rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase text-amber-950 shadow-md">
          Preset
        </span>
      )}
      {selected && <span className="absolute right-2 top-2 z-10 h-2 w-2 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />}
    </button>
  );
});

/* ── SHARED KEYFRAMES ────────────────────────────────────────────── */

export const SETUP_STYLES = `
  @keyframes petShine { to { transform: translateX(220%) skewX(-12deg); } }
  @keyframes petFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @keyframes petSpinAura { to { transform: rotate(360deg); } }
  @keyframes petPop { 0% { opacity: 0; transform: scale(0.94) translateY(10px); } 100% { opacity: 1; transform: none; } }

  .pet-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
  .pet-scroll::-webkit-scrollbar-track { background: transparent; }
  .pet-scroll::-webkit-scrollbar-thumb { background: rgba(120,113,108,0.3); border-radius: 9999px; }
  .pet-scroll::-webkit-scrollbar-thumb:hover { background: rgba(120,113,108,0.6); }
  .pet-scroll { scrollbar-width: thin; scrollbar-color: rgba(120,113,108,0.35) transparent; }

  @media (prefers-reduced-motion: reduce) {
    .pet-setup *, .pet-setup *::before, .pet-setup *::after {
      animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    }
  }
`;
</file>

<file path="src/Pets/ui/BattleLog.jsx">
import { memo, useMemo } from 'react';
import { isLogged, logFor } from './describe.js';

const MAX_LINES = 16;

/**
 * Scrollback of what just happened. Built by walking backwards from the cursor
 * until enough loggable events are found, so the cost is bounded no matter how
 * long the match runs.
 */
function BattleLog({ timeline, index }) {
  const lines = useMemo(() => {
    const out = [];
    for (let i = index; i >= 0 && out.length < MAX_LINES; i -= 1) {
      const event = timeline[i];
      if (!isLogged(event)) continue;
      const text = logFor(event);
      if (text) out.push({ id: event.id, text });
    }
    return out;
  }, [timeline, index]);

  return (
    <div className="pb-log pb-interactive">
      {/* column-reverse keeps the newest line pinned to the bottom edge */}
      {lines.map((line) => (
        <div key={line.id} className="pb-log__line">{line.text}</div>
      ))}
    </div>
  );
}

export default memo(BattleLog);
</file>

<file path="src/Pets/ui/BenchWings.jsx">
import { memo } from 'react';
import { getSpecies } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/**
 * The rest of the lineup, lined up against the arena wall.
 *
 * Carries no HUD at all — a benched pet is scenery until it takes the field.
 * The only thing it needs to say is who is next, which it says by standing
 * closest to the fight, largest and brightest, with the rest queued behind.
 *
 * No cast shadows here: they stand right against the wall, where the backdrop
 * already lays a band of shade along the base, and adding a second shadow under
 * each one made the row read as a set of stickers.
 */

const BASE_HEIGHT = 160;
/* Nearest-the-fight anchor per side, stepping outward along the wall.
 *
 * Four readable sprites cannot fit beside a 300px duellist without touching, so
 * the queue also steps back in depth: each place further down the line sits a
 * little higher, a little smaller and a little dimmer. What overlap remains
 * then reads as one pet standing behind another rather than as a pile. */
const ANCHOR = { 0: 410, 1: 1190 };
const STEP_X = 112;      // horizontal gap between places in the queue
const STEP_Y = 15;       // ...and how much further upstage each one stands
const GROUND = 520;      // front of the queue, on the sand at the wall base

const scaleXFor = (species, side) => {
  const facesLeft = species.facing === 'Left';
  // Benched pets face inward, watching the fight.
  return side === 0 ? (facesLeft ? -1 : 1) : (facesLeft ? 1 : -1);
};

function BenchWings({ team, lead, side }) {
  const waiting = team.filter((pet) => pet.slot !== lead);
  if (!waiting.length) return null;

  const inward = side === 0 ? -1 : 1;

  return (
    <div className={`pb-wing pb-wing--${side === 0 ? 'p1' : 'p2'}`} aria-hidden="true">
      {waiting.map((pet, depth) => {
        const species = getSpecies(pet.speciesId);
        const scale = Math.max(0.7, 1 - depth * 0.09);

        return (
          <div
            key={pet.instanceId}
            className={`pb-wing__unit ${pet.fainted ? 'pb-wing__unit--down' : ''}`}
            style={{
              left: ANCHOR[side] + inward * depth * STEP_X,
              top: GROUND - depth * STEP_Y,
              zIndex: 10 - depth,
              animationDelay: `${depth * 0.6}s`,
            }}
          >
            <img
              className="pb-wing__pet"
              src={assetUrl(species.art)}
              alt=""
              draggable={false}
              style={{
                height: BASE_HEIGHT * scale,
                filter: `brightness(${(0.94 - depth * 0.05).toFixed(2)}) saturate(${(0.92 - depth * 0.04).toFixed(2)})`,
                transform: `scaleX(${scaleXFor(species, side)})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default memo(BenchWings);
</file>

<file path="src/Pets/ui/Overlays.jsx">
import { memo } from 'react';
import { getSpecies } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

function SplashSide({ side, lead, roster }) {
  return (
    <div className={`pb-splash__side pb-splash__side--${side === 0 ? 'p1' : 'p2'}`}>
      <img src={assetUrl(getSpecies(lead.speciesId).art)} alt="" draggable={false} />
      <span className="pb-splash__name">{lead.name}</span>
      <span className="pb-splash__roster">{roster}</span>
    </div>
  );
}

/** Lineup reveal shown while the opening beat holds. */
export const OpeningSplash = memo(function OpeningSplash({ state }) {
  const sides = [0, 1].map((side) => ({
    lead: state.teams[side][state.lead[side]],
    roster: state.teams[side].map((pet) => pet.name).join(' → '),
  }));

  return (
    <div className="pb-splash">
      <SplashSide side={0} {...sides[0]} />
      <span className="pb-splash__vs">VS</span>
      <SplashSide side={1} {...sides[1]} />
    </div>
  );
});

/** End card: who won, who was left standing, and what to do next. */
export const ResultOverlay = memo(function ResultOverlay({ outcome, state, onRematch, onExit }) {
  const draw = outcome.winner === null;
  const survivors = draw
    ? []
    : state.teams[outcome.winner].filter((pet) => !pet.fainted);

  return (
    <div className="pb-result">
      <span className="pb-result__kicker">{draw ? 'Stalemate' : `Player ${outcome.winner + 1} wins`}</span>
      <span className="pb-result__title">{draw ? 'Draw' : 'Victory'}</span>
      <span className="pb-result__stat">
        {outcome.turns} turns · {draw ? 'turn limit reached' : `${survivors.length} pet${survivors.length === 1 ? '' : 's'} standing`}
      </span>

      {survivors.length > 0 && (
        <div className="pb-result__survivors">
          {survivors.map((pet) => (
            <div key={pet.instanceId} className="pb-result__pet">
              <img src={assetUrl(getSpecies(pet.speciesId).art)} alt="" draggable={false} />
              <span>{pet.name}<br />{pet.hp}/{pet.maxHp} ♥</span>
            </div>
          ))}
        </div>
      )}

      <div className="pb-result__actions">
        <button className="pb-cta pb-cta--primary" onClick={onRematch}>Rematch</button>
        <button className="pb-cta pb-cta--ghost" onClick={onExit}>Back to Setup</button>
      </div>
    </div>
  );
});
</file>

<file path="src/Pets/ui/PetNameplate.jsx">
import { memo } from 'react';
import { RULES } from '../data/index.js';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/**
 * Name, hearts and charge, sitting on the sand under the pet with no panel
 * around them.
 *
 * The box is gone deliberately: a bordered card at the feet of every pet drew a
 * hard rectangle across the action twice over. Hearts and the charge bar carry
 * their own shape, and a text shadow is enough to hold them against bright
 * sand. Statuses moved out to the flank (see StatusFlank).
 */
function PetNameplate({ pet, side, isActive, damageFlash }) {
  const ready = pet.spc >= RULES.SPC_CAP;

  return (
    <div className={`pb-plate pb-plate--${side === 0 ? 'p1' : 'p2'} ${isActive ? 'is-active' : ''}`}>
      <div className={`pb-plate__hearts ${damageFlash ? 'is-hit' : ''}`}>
        {Array.from({ length: pet.maxHp }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`pb-hp ${i < pet.hp ? 'is-full' : 'is-empty'} ${damageFlash && i === pet.hp ? 'is-lost' : ''}`}
          >
            <path d={HEART_PATH} />
          </svg>
        ))}
      </div>

      <div className="pb-plate__name">{pet.name}</div>

      <div className={`pb-plate__charge ${ready ? 'is-ready' : ''}`}>
        <div className="pb-plate__rail">
          <div
            className="pb-plate__fill"
            style={{ width: `${Math.min(100, (pet.spc / RULES.SPC_CAP) * 100)}%` }}
          />
        </div>
        {ready && <span className="pb-plate__ready">SPECIAL READY</span>}
      </div>
    </div>
  );
}

export default memo(PetNameplate);
</file>

<file path="src/Pets/ui/PetVitals.jsx">
import { memo } from 'react';

/**
 * Live die sizes for a pet, sitting outboard of its status icons.
 *
 * These are the *current* values straight off the engine snapshot, not the
 * printed stat line — Rend halving DEF, Shed adding Max DEF to ATK, Damp,
 * Stagnation and Sunder all show up here the moment they land. Coloured against
 * the pet's base so a debuff is visible without doing arithmetic.
 */

const ROWS = [
  { key: 'atk', icon: '⚔', label: 'ATK' },
  { key: 'def', icon: '🛡', label: 'DEF' },
  { key: 'spc', icon: '⚡', label: 'SPC' },
];

function PetVitals({ pet, side }) {
  const values = {
    atk: { now: pet.atkDie, base: pet.baseAtkDie },
    def: { now: pet.defDie, base: pet.baseDefDie },
    // SPC is never modified in play, so it has no up/down state.
    spc: { now: pet.spcDie, base: pet.spcDie },
  };

  return (
    <div className={`pb-vitals pb-vitals--${side === 0 ? 'p1' : 'p2'}`}>
      {ROWS.map((row) => {
        const { now, base } = values[row.key];
        const trend = now > base ? 'is-up' : now < base ? 'is-down' : '';
        return (
          <div key={row.key} className={`pb-vitals__row ${trend}`}>
            <span className="pb-vitals__icon">{row.icon}</span>
            <span className="pb-vitals__num">d{now}</span>
          </div>
        );
      })}
    </div>
  );
}

export default memo(PetVitals);
</file>

<file path="src/Pets/ui/StatusFlank.jsx">
import { memo } from 'react';
import { statusDef } from '../data/index.js';

/**
 * What is currently stuck to a pet, stacked down its outer flank.
 *
 * These used to be little chips inside the nameplate, which meant checking
 * whether something was burning pulled your eye down and away from the fight.
 * Out here they sit beside the sprite at a size you can read peripherally, and
 * they render *behind* the sprite layer so a big attack animation passes in
 * front of them rather than being cropped by them.
 */

function StatusFlank({ pet, side }) {
  const shown = pet.statuses;
  if (!shown.length) return null;

  return (
    <div className={`pb-flank pb-flank--${side === 0 ? 'p1' : 'p2'}`} aria-hidden="true">
      {shown.slice(0, 5).map(({ id, stacks }) => {
        const def = statusDef(id);
        return (
          <div key={id} className="pb-flank__item" style={{ '--tone': def.tone }}>
            <span className="pb-flank__icon">{def.icon}</span>
            {stacks > 1 && <span className="pb-flank__count">{stacks}</span>}

            {/* Hover card. Built rather than using `title` so it appears
                instantly and can carry the stack count and full rules text. */}
            <div className="pb-flank__tip">
              <span className="pb-flank__tipname">
                {def.name}{stacks > 1 ? ` ×${stacks}` : ''}
              </span>
              <span className="pb-flank__tipdesc">{def.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(StatusFlank);
</file>

<file path="src/Pets/ui/TurnCounter.jsx">
import { memo } from 'react';
import { statusDef } from '../data/index.js';

/**
 * Turn number, and how close the match is to Stagnation.
 *
 * Stagnation is the anti-stall valve: a counter ticks up every turn in which
 * neither side loses health, and when it reaches the threshold both active pets
 * take a stack of DEF reduction. It is the one rule whose state is otherwise
 * completely invisible — you cannot read "four more quiet turns and both pets
 * start crumbling" off the board — so it gets a readout.
 *
 * The pips fill as the stall builds and empty the moment anyone takes damage.
 * Once the first stack lands the threshold tightens from 6 turns to 2, and the
 * pip row shortens to match, which shows the screws turning.
 */
function TurnCounter({ turn, stagnation }) {
  const { counter, threshold, stacks } = stagnation;
  const remaining = Math.max(0, threshold - counter);
  const def = statusDef('stagnation');
  const urgent = remaining <= 1;

  return (
    <div className="pb-turn">
      {/* Clamped: the opening beats happen before turn 1 has started. */}
      <span className="pb-turn__n">T{Math.max(1, turn)}</span>

      <div className="pb-turn__stall">
        <div className="pb-turn__pips">
          {Array.from({ length: threshold }).map((_, i) => (
            <span key={i} className={`pb-turn__pip ${i < counter ? 'is-on' : ''}`} />
          ))}
        </div>
        <span className={`pb-turn__label ${urgent ? 'is-urgent' : ''}`}>
          {def.icon} {stacks > 0 ? `×${stacks} · ` : ''}
          {remaining === 0 ? 'NOW' : `IN ${remaining}`}
        </span>
      </div>
    </div>
  );
}

export default memo(TurnCounter);
</file>

<file path="src/Pets/index.js">
/**
 * @file Pets/index.js
 * @description Public surface of the Pet Battler module. The rest of the app
 * imports from here and nothing else, so the internals can be reorganised
 * without touching App.jsx.
 */

export { default as PetSetup } from './setup/PetSetup.jsx';
export { default as BattleArena } from './ui/BattleArena.jsx';
export { simulateBattle } from './engine/simulate.js';
export { PET_DB, listSpecies, getSpecies, displayName } from './data/index.js';
</file>

<file path="src/Pets/data/constants.js">
/**
 * @file constants.js
 * @description Core taxonomy for the Pet Battler: roles, elements, the affinity
 * chart, and the role matchup tables. Nothing here knows about a specific pet.
 */

/* ── ROLES ───────────────────────────────────────────────────────── */

export const ROLE = {
  ATTACKER: 'ATTACKER',
  AFF_ATTACKER: 'AFF_ATTACKER',
  TANK: 'TANK',
  AFF_TANK: 'AFF_TANK',
  STUNNER: 'STUNNER',
  HEALER: 'HEALER',
  SUPPORT: 'SUPPORT',
};

export const ROLE_META = {
  [ROLE.ATTACKER]:     { label: 'Attacker',       short: 'ATK',     hex: '#f87171', blurb: 'Raw physical damage. Ignores elemental matchups.' },
  [ROLE.AFF_ATTACKER]: { label: 'Affinity Attacker', short: 'AFF ATK', hex: '#fb923c', blurb: 'Elemental damage. Swings hard on the affinity chart.' },
  [ROLE.TANK]:         { label: 'Tank',           short: 'DEF',     hex: '#34d399', blurb: 'Blocks physical pressure and outlasts attackers.' },
  [ROLE.AFF_TANK]:     { label: 'Affinity Tank',  short: 'AFF DEF', hex: '#22d3ee', blurb: 'Blunts elemental damage and sustain.' },
  [ROLE.STUNNER]:      { label: 'Stunner',        short: 'STUN',    hex: '#c084fc', blurb: 'Control specialist. Builds Stun Counters on every hit.' },
  [ROLE.HEALER]:       { label: 'Healer',         short: 'HEAL',    hex: '#4ade80', blurb: 'Builds Heart Counters to top up the wounded.' },
  [ROLE.SUPPORT]:      { label: 'Support',        short: 'SUPP',    hex: '#fbbf24', blurb: 'Backline utility. Builds and relays Special charge from the bench.' },
};

export const ROLE_ORDER = [
  ROLE.ATTACKER, ROLE.AFF_ATTACKER, ROLE.TANK, ROLE.AFF_TANK,
  ROLE.STUNNER, ROLE.HEALER, ROLE.SUPPORT,
];

/* ── ELEMENTS ────────────────────────────────────────────────────── */

export const ELEMENT = {
  FIRE: 'FIRE',
  WATER: 'WATER',
  AIR: 'AIR',
  EARTH: 'EARTH',
  SHADOW: 'SHADOW',
  SPIRIT: 'SPIRIT',
  PHYSICAL: 'PHYSICAL',
};

export const ELEMENT_META = {
  FIRE:     { label: 'Fire',     hex: '#f43f5e', glow: 'rgba(244,63,94,0.55)',   icon: '🔥' },
  WATER:    { label: 'Water',    hex: '#38bdf8', glow: 'rgba(56,189,248,0.55)',  icon: '💧' },
  AIR:      { label: 'Air',      hex: '#a5f3fc', glow: 'rgba(165,243,252,0.5)',  icon: '🌪' },
  EARTH:    { label: 'Earth',    hex: '#d97706', glow: 'rgba(217,119,6,0.5)',    icon: '⛰' },
  SHADOW:   { label: 'Shadow',   hex: '#8b5cf6', glow: 'rgba(139,92,246,0.55)',  icon: '🌑' },
  SPIRIT:   { label: 'Spirit',   hex: '#e879f9', glow: 'rgba(232,121,249,0.5)',  icon: '✧' },
  PHYSICAL: { label: 'Physical', hex: '#a8a29e', glow: 'rgba(168,162,158,0.4)',  icon: '⚔' },
};

/**
 * Offensive chart. `strongVs` lists the DEFENSIVE typings that this offensive
 * typing gains Advantage against; `weakVs` lists the ones it suffers
 * Disadvantage against.
 *
 * Weakness chain: Fire←Water←Air←Earth←Fire. Spirit and Shadow are weak to
 * each other, so each has Advantage into the other and Disadvantage into none.
 */
export const AFFINITY_CHART = {
  FIRE:     { strongVs: ['EARTH'],  weakVs: ['WATER'] },
  WATER:    { strongVs: ['FIRE'],   weakVs: ['AIR'] },
  AIR:      { strongVs: ['WATER'],  weakVs: ['EARTH'] },
  EARTH:    { strongVs: ['AIR'],    weakVs: ['FIRE'] },
  SHADOW:   { strongVs: ['SPIRIT'], weakVs: [] },
  SPIRIT:   { strongVs: ['SHADOW'], weakVs: [] },
  PHYSICAL: { strongVs: [],         weakVs: [] },
};

export const affinityVerdict = (offensive, defensive) => {
  const row = AFFINITY_CHART[offensive];
  if (!row) return 0;
  if (row.strongVs.includes(defensive)) return 1;
  if (row.weakVs.includes(defensive)) return -1;
  return 0;
};

/* ── ROLE MATCHUPS ───────────────────────────────────────────────── */

/** Attacking roles that gain Advantage on their ATK roll into these defending roles. */
export const ATTACK_ROLE_ADVANTAGE = {
  [ROLE.ATTACKER]:     [ROLE.HEALER, ROLE.SUPPORT, ROLE.AFF_TANK],
  [ROLE.AFF_ATTACKER]: [ROLE.TANK],
};

/** Defending roles that gain Advantage on their DEF roll against these attacking roles. */
export const DEFENSE_ROLE_ADVANTAGE = {
  [ROLE.TANK]:     [ROLE.ATTACKER, ROLE.STUNNER],
  [ROLE.AFF_TANK]: [ROLE.AFF_ATTACKER, ROLE.HEALER],
};

/* ── TUNING ──────────────────────────────────────────────────────── */

export const RULES = {
  /** Special meter cap; a pet fires its Special the moment it reaches this. */
  SPC_CAP: 100,
  /** Stun Counters required to inflict Stunned. */
  STUN_COUNTERS_TO_STUN: 3,
  /** Heart Counters a Healer needs before it heals its most wounded ally. */
  HEART_COUNTERS_TO_HEAL: 3,
  /** Turns without any HP loss before Stagnation begins, then every N after. */
  STAGNATION_FIRST: 6,
  STAGNATION_REPEAT: 2,
  /** DEF reduction per Stagnation stack, and the floor it cannot go below. */
  STAGNATION_STEP: 0.1,
  STAGNATION_FLOOR: 0.1,
  /** Chance a Paralyzed pet loses its action (checked after SPC generation). */
  PARALYZE_SKIP_IN: 4,
  /** Hard stop so a pathological matchup can never hang the simulator. */
  MAX_TURNS: 400,
  /** Level ceiling and the stat granted per level above 1. */
  MAX_LEVEL: 7,
  STAT_PER_LEVEL: 1,
  /** Roster size. */
  TEAM_SIZE: 5,
  MAX_SAVED_TEAMS: 12,
};

export const SIDE = { P1: 0, P2: 1 };
export const otherSide = (side) => (side === 0 ? 1 : 0);
</file>

<file path="src/Pets/data/passives.js">
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
</file>

<file path="src/Pets/data/species.js">
/**
 * @file species.js
 * @description The base species directory. A species is pure data: it names the
 * passives and Special it uses by id, and never contains logic.
 *
 * ── ADDING A NEW PET ───────────────────────────────────────────────
 * 1. Drop the artwork in public/images/pets/.
 * 2. If it needs a new Special, add it to abilities.js.
 * 3. If it needs new passives, add them to passives.js.
 * 4. Add an entry below with a NEW, PERMANENT id (saved teams reference ids,
 *    so never rename or reuse one).
 * That is the whole job — no engine or UI file needs to change.
 */

import { ROLE, ELEMENT } from './constants.js';

/** @type {Record<string, object>} */
export const SPECIES = {
  hellhound_affinity: {
    id: 'hellhound_affinity',
    name: 'Hellhound',
    variant: 'Affinity',
    family: 'hellhound',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.FIRE, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 40, def: 40, spc: 30 },
    special: 'hellfire_bolt',
    passives: ['hellfire', 'scorching_flames'],
    art: '/images/pets/HellHound_Affinity.webp',
    facing: 'Right',
    flavor: 'A furnace on four legs. Every bite leaves an ember behind.',
  },

  hellhound_physical: {
    id: 'hellhound_physical',
    name: 'Hellhound',
    variant: 'Physical',
    family: 'hellhound',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 50, def: 30, spc: 30 },
    special: 'rending_bite',
    passives: ['intimidating', 'smells_weakness'],
    art: '/images/pets/HellHound_Physical.webp',
    facing: 'Right',
    flavor: 'Picks the healthiest thing in the room, then the weakest.',
  },

  emboar: {
    id: 'emboar',
    name: 'Emboar',
    family: 'emboar',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.FIRE, defensive: ELEMENT.FIRE },
    base: { hp: 6, atk: 35, def: 40, spc: 33 },
    special: 'heat_up',
    passives: ['flame_aura', 'afterburn'],
    art: '/images/pets/Emboar.webp',
    facing: 'Right',
    flavor: 'Burns anything that touches it, and keeps burning after it falls.',
  },

  terror_terrier: {
    id: 'terror_terrier',
    name: 'Terror Terrier',
    family: 'terrier',
    role: ROLE.STUNNER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 5, atk: 30, def: 45, spc: 25 },
    special: 'terrorize',
    passives: ['ghostly_blur', 'capitalize'],
    art: '/images/pets/TerrorTerrier.webp',
    facing: 'Left',
    flavor: 'Small, loud, and impossible to pin down.',
  },

  scruffy: {
    id: 'scruffy',
    name: 'Scruffy',
    family: 'scruffy',
    role: ROLE.TANK,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 7, atk: 25, def: 50, spc: 25 },
    special: 'shed',
    passives: ['thick_fur', 'scruffy_resolve'],
    art: '/images/pets/Scruffy.webp',
    facing: 'Left',
    flavor: 'Nothing sticks to that coat. Not poison, not curses, not teeth.',
  },

  necrodoodle: {
    id: 'necrodoodle',
    name: 'Necrodoodle',
    family: 'necrodoodle',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.SHADOW, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 40, def: 30, spc: 40 },
    special: 'doom_curse',
    passives: ['hex_claws', 'vengeful_curse'],
    art: '/images/pets/Necrodoodle.webp',
    facing: 'Left',
    flavor: 'Groomed, adorable, and quietly rewriting your fate.',
  },

  gnollbacabra: {
    id: 'gnollbacabra',
    name: 'Gnollbacabra',
    family: 'gnoll',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 4, atk: 40, def: 20, spc: 30 },
    special: 'sunder',
    passives: ['crippling_bite', 'bonecrusher'],
    art: '/images/pets/Gnollbacabra.webp',
    facing: 'Left',
    flavor: 'Does not kill you. Just removes your ability to fight back.',
  },

  famine_wolf: {
    id: 'famine_wolf',
    name: 'Famine Wolf',
    family: 'wolf',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 5, atk: 40, def: 35, spc: 30 },
    special: 'ravenous_bite',
    passives: ['crunch', 'famine_feast'],
    art: '/images/pets/FamineWolf.webp',
    facing: 'Left',
    flavor: 'Gets stronger with every meal. Never stops being hungry.',
  },

  felightning: {
    id: 'felightning',
    name: 'Felightning',
    family: 'felightning',
    role: ROLE.SUPPORT,
    typing: { offensive: ELEMENT.AIR, defensive: ELEMENT.AIR },
    base: { hp: 3, atk: 25, def: 30, spc: 40 },
    special: 'static_shock',
    passives: ['backline_current', 'baton_pass', 'overcharge'],
    art: '/images/pets/Felightning.webp',
    facing: 'Right',
    flavor: 'Feeds the front line with charge from the sidelines. Fragile once it is out there itself.',
  },

  bubble_trouble_physical: {
    id: 'bubble_trouble_physical',
    name: 'Bubble Trouble',
    variant: 'Physical',
    family: 'bubble',
    bond: 'bubble',
    role: ROLE.TANK,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.WATER },
    base: { hp: 8, atk: 20, def: 50, spc: 30 },
    special: 'bubble_shield',
    passives: ['lovey_dovey', 'surface_tension'],
    art: '/images/pets/BubbleTrouble_Physical.webp',
    facing: 'Right',
    flavor: 'Half of a pair. Charges faster when its partner is on the roster.',
  },

  bubble_trouble_affinity: {
    id: 'bubble_trouble_affinity',
    name: 'Bubble Trouble',
    variant: 'Affinity',
    family: 'bubble',
    bond: 'bubble',
    role: ROLE.AFF_TANK,
    typing: { offensive: ELEMENT.WATER, defensive: ELEMENT.WATER },
    base: { hp: 8, atk: 20, def: 50, spc: 30 },
    special: 'bubble_shield',
    passives: ['lovey_dovey', 'undertow'],
    art: '/images/pets/BubbleTrouble_Affinity.webp',
    facing: 'Left',
    flavor: 'The other half. Drags attackers under with every popped shield.',
  },
};
</file>

<file path="src/Pets/data/statuses.js">
/**
 * @file statuses.js
 * @description Registry of every status effect. The engine reads these
 * declaratively — it never branches on a status id by name, so a new status is
 * a new entry here plus whatever ability references it.
 *
 * Fields:
 *   kind        'debuff' blocks on debuff immunity (Thick Fur); 'buff' never does.
 *   stackable   false collapses to a single stack.
 *   defMod      (pet, stacks) => multiplier/flat pipeline entry, see combatant.js
 *   tickOnTurn  rolled at the owner's turn start (Burn).
 */

export const STATUS = {
  BURN: 'burn',
  REND: 'rend',
  FADE: 'fade',
  CURSED: 'cursed',
  PARALYZED: 'paralyzed',
  STUN_COUNTER: 'stun_counter',
  STUNNED: 'stunned',
  BUBBLE_SHIELD: 'bubble_shield',
  DAMP: 'damp',
  SHED: 'shed',
  STAGNATION: 'stagnation',
};

export const STATUS_DEFS = {
  [STATUS.BURN]: {
    id: STATUS.BURN,
    name: 'Burn',
    icon: '🔥',
    kind: 'debuff',
    stackable: true,
    tone: '#fb923c',
    desc: 'At the start of your turn roll 1d6 per stack. Each 1 deals damage and clears that stack.',
    /** Damage is captured per-stack when applied, so the applier\'s passives matter. */
    defaultPotency: 2,
  },
  [STATUS.REND]: {
    id: STATUS.REND,
    name: 'Rend',
    icon: '🩸',
    kind: 'debuff',
    stackable: true,
    tone: '#f43f5e',
    desc: 'Max DEF is halved. One stack is consumed each time you are attacked.',
  },
  [STATUS.FADE]: {
    id: STATUS.FADE,
    name: 'Fade',
    icon: '🌫️',
    kind: 'buff',
    stackable: true,
    tone: '#d6d3d1',
    desc: 'The next attack against you rolls at half Max ATK. One stack is consumed per attack.',
  },
  [STATUS.CURSED]: {
    id: STATUS.CURSED,
    name: 'Cursed',
    icon: '💀',
    kind: 'debuff',
    stackable: true,
    tone: '#a855f7',
    desc: 'When you would deal damage, a flat 50% chance to null it — no matter how many stacks you carry. Loses 1 stack at the end of your turn.',
  },
  [STATUS.PARALYZED]: {
    id: STATUS.PARALYZED,
    name: 'Paralyzed',
    icon: '⚡',
    kind: 'debuff',
    stackable: false,
    tone: '#fde047',
    desc: '25% chance to lose your action each turn, checked after Special charge is generated.',
  },
  [STATUS.STUN_COUNTER]: {
    id: STATUS.STUN_COUNTER,
    name: 'Stun Counter',
    icon: '💫',
    kind: 'debuff',
    stackable: true,
    tone: '#c084fc',
    desc: 'At 3 counters they convert into Stunned.',
  },
  [STATUS.STUNNED]: {
    id: STATUS.STUNNED,
    name: 'Stunned',
    icon: '😵',
    kind: 'debuff',
    stackable: false,
    tone: '#a8a29e',
    desc: 'Skip your next turn entirely.',
  },
  [STATUS.BUBBLE_SHIELD]: {
    id: STATUS.BUBBLE_SHIELD,
    name: 'Bubble Shield',
    icon: '🫧',
    kind: 'buff',
    stackable: false,
    tone: '#38bdf8',
    desc: 'Max DEF is doubled. Pops the moment you take damage, leaving the attacker Damp.',
  },
  [STATUS.DAMP]: {
    id: STATUS.DAMP,
    name: 'Damp',
    icon: '💦',
    kind: 'debuff',
    stackable: true,
    tone: '#60a5fa',
    desc: 'Max DEF reduced by 10 per stack. Cleared when you take damage.',
  },
  [STATUS.SHED]: {
    id: STATUS.SHED,
    name: 'Shed',
    icon: '🛡️',
    kind: 'buff',
    stackable: true,
    tone: '#facc15',
    desc: 'Your Max ATK is increased by your Max DEF. One stack is consumed per attack.',
  },
  [STATUS.STAGNATION]: {
    id: STATUS.STAGNATION,
    name: 'Stagnation',
    icon: '🕸️',
    kind: 'system',
    stackable: true,
    tone: '#c084fc',
    desc: 'Applied to both pets when neither loses health for too long. Each stack cuts Max DEF by 10%.',
  },
};

export const statusDef = (id) => STATUS_DEFS[id] ?? {
  id, name: id, icon: '❓', kind: 'debuff', stackable: true, tone: '#a8a29e', desc: '',
};

/** Statuses that Thick Fur and similar immunities refuse. */
export const isDebuff = (id) => statusDef(id).kind === 'debuff';
</file>

<file path="src/Pets/engine/balance.mjs">
/**
 * Headless balance + regression harness.
 *
 *   node src/Pets/engine/balance.mjs            # full report
 *   node src/Pets/engine/balance.mjs 5000       # more samples
 *
 * Because the simulator is pure, thousands of matches resolve in well under a
 * second with no browser involved. Run this after adding a pet: it will surface
 * a crash, an ability that never terminates, or a win rate that is obviously
 * out of line before any of it reaches the arena.
 */

import { simulateBattle } from './simulate.js';
import { PET_DB, SPECIES, RULES, ABILITIES } from '../data/index.js';

const SAMPLES = Number(process.argv[2]) || 2000;
const ids = Object.keys(SPECIES);

const entryFor = (speciesId, index) => {
  const species = PET_DB[speciesId];
  return {
    instanceId: `${speciesId}-${index}`,
    speciesId,
    level: species.level ?? 1,
    stats: { ...species.base },
  };
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const randomTeam = (size, tag) =>
  Array.from({ length: size }, (_, i) => entryFor(pick(ids), `${tag}${i}`));

/* ── 1. FULL-ROSTER FUZZ ─────────────────────────────────────────── */

let draws = 0;
let longest = 0;
let totalTurns = 0;
let totalEvents = 0;

console.time('fuzz');
for (let i = 0; i < SAMPLES; i += 1) {
  const result = simulateBattle({
    team1: randomTeam(RULES.TEAM_SIZE, 'a'),
    team2: randomTeam(RULES.TEAM_SIZE, 'b'),
  });
  if (result.outcome.winner === null) draws += 1;
  longest = Math.max(longest, result.turns);
  totalTurns += result.turns;
  totalEvents += result.timeline.length;
}
console.timeEnd('fuzz');

console.log(`\n${SAMPLES} random 5v5 matches`);
console.log(`  avg turns    ${(totalTurns / SAMPLES).toFixed(1)}`);
console.log(`  longest      ${longest}${longest >= RULES.MAX_TURNS ? '  <-- HIT THE TURN CAP' : ''}`);
console.log(`  avg events   ${Math.round(totalEvents / SAMPLES)}`);
console.log(`  draws        ${draws} (${((draws / SAMPLES) * 100).toFixed(1)}%)`);

/* ── 2. PER-SPECIES 1v1 WIN RATES ────────────────────────────────── */

const duels = Math.max(200, Math.round(SAMPLES / 4));
const record = Object.fromEntries(ids.map((id) => [id, { wins: 0, games: 0 }]));

for (const a of ids) {
  for (const b of ids) {
    if (a === b) continue;
    for (let i = 0; i < Math.ceil(duels / (ids.length * ids.length)) + 4; i += 1) {
      const result = simulateBattle({ team1: [entryFor(a, 'x')], team2: [entryFor(b, 'y')] });
      record[a].games += 1;
      record[b].games += 1;
      if (result.outcome.winner === 0) record[a].wins += 1;
      if (result.outcome.winner === 1) record[b].wins += 1;
    }
  }
}

console.log('\nSolo win rate (level 1, no Natures)');
Object.entries(record)
  .map(([id, { wins, games }]) => ({ id, rate: (wins / games) * 100, games }))
  .sort((a, b) => b.rate - a.rate)
  .forEach(({ id, rate, games }) => {
    const bar = '█'.repeat(Math.round(rate / 2)).padEnd(50, '·');
    console.log(`  ${id.padEnd(26)} ${rate.toFixed(1).padStart(5)}%  ${bar}  n=${games}`);
  });

/* ── 3. RULE ASSERTIONS ──────────────────────────────────────────── */

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });

check('Hellhound (Affinity) special rolls at 200% ATK', ABILITIES.hellfire_bolt.atkScale === 2);
check('Hellhound (Physical) special rolls at 200% ATK', ABILITIES.rending_bite.atkScale === 2);
check('Heat Up does not heal', !JSON.stringify(ABILITIES.heat_up).includes('heal'));
check('Bubble Shield does not heal', !JSON.stringify(ABILITIES.bubble_shield).includes('heal'));
check('Every species has a registered Special', ids.every((id) => ABILITIES[SPECIES[id].special]));
check('No match exceeded the turn cap', longest < RULES.MAX_TURNS);

// After a knockout, the side that lost the pet must act first.
{
  let checked = 0;
  let wrong = 0;
  for (let i = 0; i < 60; i += 1) {
    const { timeline } = simulateBattle({
      team1: randomTeam(RULES.TEAM_SIZE, 'p'),
      team2: randomTeam(RULES.TEAM_SIZE, 'q'),
    });
    for (let e = 0; e < timeline.length; e += 1) {
      if (timeline[e].type !== 'faint') continue;
      const downed = timeline[e].side;
      // Only meaningful if that side still had someone to send out.
      const switched = timeline.slice(e + 1, e + 6).find((ev) => ev.type === 'switch_in' && ev.side === downed);
      if (!switched) continue;
      const nextTurn = timeline.slice(e + 1).find((ev) => ev.type === 'turn_start');
      if (!nextTurn) continue;
      checked += 1;
      if (nextTurn.side !== downed) wrong += 1;
    }
  }
  check(`Knockout hands the next turn to the downed side (${checked} switch-ins)`, checked > 0 && wrong === 0);
}

// Rule sweep over a big sample of real matches.
{
  let benchGains = 0;      // charge gained by a pet that was not the active one
  let tieLosses = 0;       // an ATK == DEF roll that failed to land
  let diceMismatch = 0;    // dice rolled != 1 + |net advantage|
  let curseMultiRoll = 0;  // a Cursed check that rolled more than one die
  let stagBlocked = 0;     // Thick Fur refusing Stagnation
  let sawStagnation = 0;
  let sawTie = 0;
  let sawStacked = 0;      // a roll with |advantage| > 1

  for (let i = 0; i < 120; i += 1) {
    const { timeline } = simulateBattle({
      team1: randomTeam(RULES.TEAM_SIZE, 'g'),
      team2: randomTeam(RULES.TEAM_SIZE, 'h'),
    });

    for (const e of timeline) {
      if (e.type === 'spc_gain') {
        for (const entry of e.entries ?? []) {
          const lead = e.state.lead[entry.side];
          const fromPassive = entry.source === 'bond' || entry.source === 'passive';
          const onSwitch = entry.source === 'inherit';
          if (entry.slot !== lead && entry.amount > 0 && !fromPassive && !onSwitch) benchGains += 1;
        }
      }

      if (e.type === 'roll') {
        for (const side of [e.attacker, e.defender]) {
          if (!side || side.trueStrike) continue;
          if (side.rolls.length !== 1 + Math.abs(side.advantage)) diceMismatch += 1;
          if (Math.abs(side.advantage) > 1) sawStacked += 1;
        }
        if (!e.trueStrike && e.attacker.kept === e.defender.kept) {
          sawTie += 1;
          if (!e.hit) tieLosses += 1;
        }
      }

      if (e.type === 'status_tick' && e.status === 'cursed' && e.rolls.length !== 1) curseMultiRoll += 1;

      if (e.type === 'stagnation') sawStagnation += 1;
      // Thick Fur belongs to Scruffy; if it ever refused Stagnation the engine
      // would emit an IMMUNE passive event on a stagnation beat.
      if (e.type === 'passive' && e.label === 'Thick Fur' && e.text === 'IMMUNE') {
        const prior = timeline[timeline.indexOf(e) - 1];
        if (prior?.type === 'stagnation') stagBlocked += 1;
      }
    }
  }

  check('Benched charge only ever comes from a passive', benchGains === 0);
  check(`Ties on ATK vs DEF go to the attacker (${sawTie} ties seen)`, sawTie > 0 && tieLosses === 0);
  check(`Dice rolled always equal 1 + |net advantage| (${sawStacked} stacked rolls)`, diceMismatch === 0);
  check('Advantage stacks beyond a single step', sawStacked > 0);
  check('Cursed rolls exactly one die regardless of stacks', curseMultiRoll === 0);
  check(`Thick Fur does not refuse Stagnation (${sawStagnation} applications)`, stagBlocked === 0);
}

// A seed must reproduce a match exactly.
const teamA = randomTeam(3, 'r');
const teamB = randomTeam(3, 's');
const first = simulateBattle({ team1: teamA, team2: teamB, seed: 123456 });
const second = simulateBattle({ team1: teamA, team2: teamB, seed: 123456 });
check(
  'Same seed reproduces the same match',
  first.timeline.length === second.timeline.length && first.outcome.winner === second.outcome.winner,
);

console.log('\nRule checks');
let failed = 0;
for (const { label, ok } of checks) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failed += 1;
}

process.exit(failed > 0 ? 1 : 0);
</file>

<file path="src/Pets/engine/simulate.js">
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
  let priorityOverride = null;

  const active = (side) => sides[side][lead[side]];
  const alive = (side) => sides[side].some((p) => !p.fainted);

  const snapshot = () => ({
    lead: [lead[0], lead[1]],
    teams: [sides[0].map(snapshotPet), sides[1].map(snapshotPet)],
    turn: turnCount,
    // The stall clock, so the HUD can show how close Stagnation is without
    // re-deriving the rule.
    stagnation: {
      counter: stagnationCounter,
      threshold: stagThreshold(),
      stacks: stacksOf(active(0), STATUS.STAGNATION),
    },
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
    // Stamped so the end-of-turn decay can spare a curse applied this turn.
    if (id === STATUS.CURSED) meta.appliedOn = turnCount;
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

    // Net, not clamped: two sources of advantage roll three dice, and an
    // advantage cancels a disadvantage outright.
    return { adv, reasons };
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

    return { adv, reasons };
  };

  /** One die, plus one more for every net step of advantage or disadvantage. */
  const rollWith = (max, advantage) => {
    const rolls = [];
    for (let i = 0; i <= Math.abs(advantage); i += 1) rolls.push(rng.die(max));
    const kept = advantage > 0 ? Math.max(...rolls) : advantage < 0 ? Math.min(...rolls) : rolls[0];
    return { rolls, kept, max, advantage };
  };

  /* ── ACTIONS ───────────────────────────────────────────────────── */

  /**
   * Cursed is a flat 50% to null the damage, however many stacks are on you —
   * stacks are duration, not probability, and are spent by the end-of-turn
   * decay rather than by triggering.
   */
  const curseCheck = (attacker, damage) => {
    if (damage <= 0 || !hasStatus(attacker, STATUS.CURSED)) return damage;

    const roll = rng.die(2);
    const nullified = roll === 1;

    emit(EV.STATUS_TICK, {
      side: attacker.side, slot: attacker.slot,
      status: STATUS.CURSED, name: 'Cursed',
      dieSize: 2, rolls: [roll], procValues: [1],
      damage: 0, cleared: 0, nullified,
    });

    return nullified ? 0 : damage;
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
    // Ties go to the attacker.
    const hit = trueStrike || atkRoll.kept >= defRoll.kept;

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
      dieSize: 6, rolls, procValues: [1], cleared, damage, potency,
    });

    if (cleared > 0) removeStacks(pet, STATUS.BURN, cleared);
    if (damage > 0) dealDamage(pet, damage, { cause: 'Burn' });
  };

  const generateCharge = (side) => {
    const pet = active(side);
    gainSpc(pet, rng.die(pet.stats.spc), 'turn');

    // A benched pet generates nothing by virtue of its role. Charge from the
    // bench has to come from a passive that says so.
    for (const benched of sides[side]) {
      if (benched === pet || benched.fainted) continue;
      const granted = sum(benched, 'benchCharge', { active: pet });
      if (granted > 0) gainSpc(benched, granted, 'passive');
    }

    flushSpc({ side, slot: pet.slot });
  };

  const totalHp = () =>
    sides[0].reduce((n, p) => n + p.hp, 0) + sides[1].reduce((n, p) => n + p.hp, 0);

  /** 6 turns to the first stack, then every 2 once either side is stagnating. */
  const stagThreshold = () => {
    const engaged = hasStatus(active(0), STATUS.STAGNATION) || hasStatus(active(1), STATUS.STAGNATION);
    return engaged ? RULES.STAGNATION_REPEAT : RULES.STAGNATION_FIRST;
  };

  const tickStagnation = () => {
    const current = totalHp();
    if (current < hpWatermark) {
      hpWatermark = current;
      stagnationCounter = 0;
      return;
    }
    hpWatermark = current;
    stagnationCounter += 1;

    if (stagnationCounter < stagThreshold()) return;

    stagnationCounter = 0;
    addStacks(active(0), STATUS.STAGNATION, 1);
    addStacks(active(1), STATUS.STAGNATION, 1);
    emit(EV.STAGNATION, { stacks: stacksOf(active(0), STATUS.STAGNATION) });
  };

  const clearStagnation = () => {
    stagnationCounter = 0;
    for (const side of sides) for (const pet of side) delete pet.statuses[STATUS.STAGNATION];
  };

  /**
   * Cursed loses a stack at the end of the cursed pet's own turn. A stack
   * applied during this very turn is spared, so a reactive passive such as
   * Vengeful Curse — which lands on the attacker mid-attack — always gets a
   * full turn of effect instead of expiring before it can do anything.
   */
  const decayCurse = (side) => {
    const pet = active(side);
    if (!pet || pet.fainted) return;
    const entry = pet.statuses[STATUS.CURSED];
    if (!entry) return;
    if (entry.appliedOn === turnCount) return;
    expireStatus(pet, STATUS.CURSED, 1);
  };

  /** Handles every pet that hit 0 HP during the last step. */
  const processFaints = () => {
    let switched = false;
    let avenging = null;

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
      avenging = side;
    }

    // The side that just lost a pet always acts first. If both went down on the
    // same step, the one resolved last takes it.
    if (avenging !== null) priorityOverride = avenging;
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

    if (hasStatus(pet, STATUS.PARALYZED)) {
      const roll = rng.die(RULES.PARALYZE_SKIP_IN);
      const skipped = roll === 1;
      emit(EV.STATUS_TICK, {
        side, slot: pet.slot, status: STATUS.PARALYZED, name: 'Paralyzed',
        dieSize: RULES.PARALYZE_SKIP_IN, rolls: [roll], procValues: [1],
        damage: 0, cleared: 0, skipped,
      });
      if (skipped) {
        emit(EV.SKIP, { side, slot: pet.slot, reason: 'paralyzed', text: 'PARALYZED' });
        return;
      }
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
    decayCurse(turnSide);

    const switched = processFaints();
    if (!alive(0) || !alive(1)) break;

    if (!switched) tickStagnation();

    if (priorityOverride !== null) {
      turnSide = priorityOverride;
      priorityOverride = null;
      emit(EV.INITIATIVE, {
        side: turnSide, reason: 'avenge', tie: false,
        spc: [active(0).stats.spc, active(1).stats.spc],
        names: [active(0).name, active(1).name],
      });
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
</file>

<file path="src/Pets/ui/ArenaBackdrop.jsx">
import { memo } from 'react';
import { assetUrl } from '../../utils/assets.js';

/**
 * The arena, at midday. Rendered once and memoised away — it takes no props, so
 * React never re-runs it while the battle plays.
 *
 * Design notes:
 *  - Bright and flat on purpose. Nothing in the scene is dimmed to create
 *    focus, so the pets can be the most saturated thing on screen without
 *    competing against a darkened backdrop.
 *  - The wall is four plain courses and one banded frieze. Carved panels were
 *    fighting the sprites at exactly the height the action happens.
 *
 * Vertical bands (1600x900 authoring space):
 *    0-106  sky and the tree line beyond the stadium
 *   96-250  stands
 *  250-272  parapet
 *  272-490  wall
 *  490-900  sand
 */

/* Seated in the stands, cropped at the chest by the parapet — a standing
 * portrait behind a rail reads as a spectator in a seat. Gil and Castellan
 * share a box; they sit close enough to read as a pair but no longer overlap.
 * Shiva is flipped to face in toward the arena. */
const CROWD_CAST = [
  { id: 'gil', src: '/images/characters/Gil.webp', x: 264, y: 154, w: 172, h: 186 },
  { id: 'castellan', src: '/images/characters/Castellan.png', x: 366, y: 146, w: 148, h: 197 },
  { id: 'shiva', src: '/images/characters/shiva.webp', x: 1188, y: 156, w: 165, h: 192, flip: true },
];

/* Two rows of stock spectators, drawn at the same scale as the named cast so a
 * spectator and a character read as the same species at the same distance —
 * they were previously about half size, which made the stands look like a
 * children's gallery. Monochrome: one warm-grey hue, value steps only, so the
 * crowd never competes with the three characters or the fight. */
const CROWD_VALUES = ['#8f8877', '#7c7565', '#6a6354', '#9c9583', '#5b5546'];
const CROWD_SKIN = '#aaa290';
const CROWD_HAIR = '#4c463b';

function ArenaBackdrop() {
  return (
    <div className="pb-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1600 900" width="1600" height="900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6fc4ee" />
            <stop offset="60%" stopColor="#a9dcf2" />
            <stop offset="100%" stopColor="#dcf0f7" />
          </linearGradient>

          <radialGradient id="pbSun" cx="72%" cy="8%" r="46%">
            <stop offset="0%" stopColor="#fffbe8" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#fff3c4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="pbWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6dabb" />
            <stop offset="70%" stopColor="#d4c49f" />
            <stop offset="100%" stopColor="#c0ad86" />
          </linearGradient>

          <linearGradient id="pbSand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcc094" />
            <stop offset="45%" stopColor="#ecd3a9" />
            <stop offset="100%" stopColor="#f5e2c0" />
          </linearGradient>

          <linearGradient id="pbCanopy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5aa544" />
            <stop offset="100%" stopColor="#33682a" />
          </linearGradient>

          <radialGradient id="pbGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8a6b45" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#8a6b45" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── SKY ─────────────────────────────────────────────────── */}
        <rect width="1600" height="270" fill="url(#pbSky)" />
        <rect width="1600" height="270" fill="url(#pbSun)" />

        {/* ── TREE LINE ───────────────────────────────────────────── */}
        {/* A continuous canopy running down behind the stands, rather than a row
            of loose circles hanging in the sky with a gap under them. The solid
            band is what stops them reading as floating leaves. */}
        <rect y="62" width="1600" height="46" fill="url(#pbCanopy)" />
        <g>
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={i}
              cx={i * 41 + (i % 3) * 13}
              cy={64 + (i % 4) * 6}
              r={26 + (i % 5) * 7}
              fill={['#4a8f38', '#5aa544', '#3f7a2e', '#68b84e'][i % 4]}
            />
          ))}
        </g>
        {/* Shaded underside where the canopy meets the stadium rim */}
        <rect y="88" width="1600" height="20" fill="#2c5a24" opacity="0.55" />

        {/* ── STANDS ──────────────────────────────────────────────── */}
        <rect y="96" width="1600" height="160" fill="#a49e88" />
        <rect y="96" width="1600" height="7" fill="#bdb69d" />
        {[142, 190].map((y) => (
          <rect key={y} y={y} width="1600" height="5" fill="#8d8672" opacity="0.55" />
        ))}

        {/* Crowd: two rows of stock figures, sized to the named cast */}
        <g opacity="0.9">
          {Array.from({ length: 42 }).map((_, i) => {
            const row = i % 2;
            const x = 26 + (i % 21) * 76 + row * 34;
            const y = row ? 206 : 170;
            const shirt = CROWD_VALUES[(i * 3) % CROWD_VALUES.length];
            const cheering = i % 5 === 2;

            return (
              <g key={i}>
                {cheering ? (
                  <path
                    d={`M${x - 19} ${y + 34}l-11-26M${x + 19} ${y + 34}l11-26`}
                    stroke={CROWD_SKIN} strokeWidth="8" strokeLinecap="round" fill="none"
                  />
                ) : (
                  <path
                    d={`M${x - 19} ${y + 32}l-8 21M${x + 19} ${y + 32}l8 21`}
                    stroke={shirt} strokeWidth="9" strokeLinecap="round" fill="none"
                  />
                )}
                <path d={`M${x - 23} ${y + 60}c0-26 10-39 23-39s23 13 23 39z`} fill={shirt} />
                <circle cx={x} cy={y} r={16} fill={CROWD_SKIN} />
                <path d={`M${x - 16} ${y - 3}a16 16 0 0 1 32 0z`} fill={CROWD_HAIR} />
              </g>
            );
          })}
        </g>

        {/* The cast, in their boxes. Drawn before the parapet so it crops them. */}
        {CROWD_CAST.map((member) => (
          <image
            key={member.id}
            href={assetUrl(member.src)}
            x={member.x}
            y={member.y}
            width={member.w}
            height={member.h}
            preserveAspectRatio="xMidYMax meet"
            style={{
              filter: 'brightness(0.94) saturate(0.9)',
              ...(member.flip
                ? { transformBox: 'fill-box', transformOrigin: 'center', transform: 'scaleX(-1)' }
                : null),
            }}
          />
        ))}

        {/* ── PARAPET ─────────────────────────────────────────────── */}
        <rect y="250" width="1600" height="22" fill="#c8bd9e" />
        <rect y="250" width="1600" height="5" fill="#ded4b8" />
        <rect y="268" width="1600" height="4" fill="#a1957a" />

        {/* ── WALL: four plain courses and one banded frieze ──────── */}
        <rect y="272" width="1600" height="218" fill="url(#pbWall)" />
        {[272, 316, 360, 404, 448].map((y) => (
          <rect key={y} y={y} width="1600" height="2" fill="#b0a07b" opacity="0.7" />
        ))}
        <g fill="#b0a07b" opacity="0.45">
          {Array.from({ length: 40 }).map((_, i) => (
            <rect key={i} x={i * 100 + (i % 2 ? 50 : 0)} y={272 + (i % 5) * 44} width="2" height="44" />
          ))}
        </g>
        <rect y="352" width="1600" height="14" fill="#2f9c8f" opacity="0.5" />
        <rect y="352" width="1600" height="3" fill="#1f7a70" opacity="0.55" />
        <rect y="363" width="1600" height="3" fill="#1f7a70" opacity="0.55" />
        <rect y="474" width="1600" height="16" fill="#b3a077" />
        <rect y="488" width="1600" height="4" fill="#96855f" />

        {/* ── SAND ────────────────────────────────────────────────── */}
        <path d="M0 900V490h1600v410z" fill="url(#pbSand)" />

        <g stroke="#d8bb8e" fill="none" opacity="0.55">
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const y = 506 + t * t * 380;
            const amp = 4 + t * 11;
            return (
              <path
                key={i}
                d={`M-20 ${y}q200 ${-amp} 400 0t400 0t400 0t440 0`}
                strokeWidth={1.4 + t * 2.2}
              />
            );
          })}
        </g>

        {/* Band of shade at the wall base, so the bench has something to stand
            on rather than hovering over flat colour. */}
        <ellipse cx="800" cy="496" rx="820" ry="26" fill="url(#pbGroundShadow)" />

        <g fill="#c2a67f" opacity="0.5">
          {[[430, 620], [980, 540], [1210, 700], [640, 790]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={7 + (i % 3) * 3} ry={5 + (i % 2) * 3} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default memo(ArenaBackdrop);
</file>

<file path="src/Pets/ui/battle.css">
/*
 * battle.css — everything the arena draws.
 *
 * The stage is authored in a fixed 1600x900 space and scaled to fit with one
 * transform, so every position below is plain pixels. Animation durations
 * divide by --sp (playback speed) so motion stays locked to the simulation.
 *
 * Layout bands:
 *    14-54   transport + log (top)
 *    62-92   ticker
 *  274-490   roll cards, framed against the wall
 *  342-520   bench, standing at the wall base
 *  480-780   the duel, downstage
 *  540-772   side rail: live dice, then statuses
 *  792-870   nameplates
 *
 * Motion policy: glows and flashes are reserved for impact — landing a hit,
 * taking one, casting a Special, going down. Routine beats (charge ticks,
 * status checks) get no sprite treatment at all, because a pet that lights up
 * several times a turn reads as strobing rather than as emphasis.
 */

.pb-root {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0d12;
  color: #1c1917;
  overflow: hidden;
  user-select: none;
  --sp: 1;
  --p1: #1d7fd0;
  --p2: #d0432f;
  --gold: #e0a020;
  --ink: #2a2418;
}

.pb-stage { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.pb-canvas {
  position: relative;
  width: 1600px; height: 900px; flex: none;
  transform-origin: center center;
  background: #a9dcf2;
  overflow: hidden;
}

.pb-layer { position: absolute; inset: 0; pointer-events: none; }
.pb-layer--ui { pointer-events: none; }
.pb-layer--ui button, .pb-layer--ui .pb-interactive { pointer-events: auto; }

.pb-backdrop { position: absolute; inset: 0; overflow: hidden; }
.pb-backdrop svg { position: absolute; inset: 0; width: 1600px; height: 900px; }

/* Camera shake, on its own layer so it never fights the stage scale. Two
   identical variants alternate so back-to-back hits both restart it. */
.pb-shake { position: absolute; inset: 0; }
.pb-shake--a { animation: pbShakeA calc(0.3s / var(--sp)) cubic-bezier(0.36, 0.07, 0.19, 0.97); }
.pb-shake--b { animation: pbShakeB calc(0.3s / var(--sp)) cubic-bezier(0.36, 0.07, 0.19, 0.97); }
@keyframes pbShakeA {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-6px, 3px); }
  55% { transform: translate(5px, -3px); }
  80% { transform: translate(-2px, 1px); }
}
@keyframes pbShakeB {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-6px, 3px); }
  55% { transform: translate(5px, -3px); }
  80% { transform: translate(-2px, 1px); }
}

/* ── DUELLISTS ───────────────────────────────────────────────────── */

.pb-slot {
  position: absolute;
  width: 380px; height: 380px;
  bottom: 120px;
  display: flex; align-items: flex-end; justify-content: center;
}
.pb-slot--p1 { left: 290px; }
.pb-slot--p2 { left: 930px; }

/* Soft midday contact shadow. Not a glow — it only grounds the sprite. */
.pb-slot__shadow {
  position: absolute; bottom: -6px; left: 50%;
  width: 208px; height: 26px; transform: translateX(-50%);
  background: radial-gradient(ellipse at center, rgba(120, 92, 56, 0.5) 0%, rgba(120, 92, 56, 0) 72%);
}

.pb-actor {
  position: relative;
  display: flex; align-items: flex-end; justify-content: center;
  will-change: transform, filter;
}

.pb-sprite {
  position: relative;
  max-width: 300px; max-height: 300px;
  object-fit: contain; object-position: bottom;
  filter: drop-shadow(0 12px 14px rgba(90, 70, 40, 0.35));
}

.pb-anim-idle    { animation: pbIdle calc(3.6s / var(--sp)) ease-in-out infinite; }
.pb-anim-windup  { animation: pbWindup calc(0.42s / var(--sp)) cubic-bezier(0.33, 0, 0.3, 1) both; }
.pb-anim-lunge-r { animation: pbLungeRight calc(0.52s / var(--sp)) cubic-bezier(0.33, 0, 0.25, 1) both; }
.pb-anim-lunge-l { animation: pbLungeLeft calc(0.52s / var(--sp)) cubic-bezier(0.33, 0, 0.25, 1) both; }
.pb-anim-cast-r  { animation: pbCastRight calc(0.66s / var(--sp)) cubic-bezier(0.33, 0, 0.3, 1) both; }
.pb-anim-cast-l  { animation: pbCastLeft calc(0.66s / var(--sp)) cubic-bezier(0.33, 0, 0.3, 1) both; }
.pb-anim-channel { animation: pbChannel calc(0.9s / var(--sp)) ease-in-out both; }
.pb-anim-hit     { animation: pbHit calc(0.46s / var(--sp)) cubic-bezier(0.33, 0, 0.3, 1) both; }
.pb-anim-dodge-r { animation: pbDodgeRight calc(0.5s / var(--sp)) cubic-bezier(0.3, 0.9, 0.35, 1) both; }
.pb-anim-dodge-l { animation: pbDodgeLeft calc(0.5s / var(--sp)) cubic-bezier(0.3, 0.9, 0.35, 1) both; }
.pb-anim-faint   { animation: pbFaint calc(0.95s / var(--sp)) cubic-bezier(0.4, 0, 0.6, 1) both; }
.pb-anim-enter-r { animation: pbEnterRight calc(0.6s / var(--sp)) cubic-bezier(0.25, 1.1, 0.4, 1) both; }
.pb-anim-enter-l { animation: pbEnterLeft calc(0.6s / var(--sp)) cubic-bezier(0.25, 1.1, 0.4, 1) both; }

@keyframes pbIdle {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-7px) scale(1.008); }
}
@keyframes pbWindup {
  0%   { transform: translateX(0) scale(1); }
  100% { transform: translateX(calc(-16px * var(--dir))) scale(1.03); }
}
@keyframes pbLungeRight {
  0%   { transform: translate(-16px, 0) scale(1.03); }
  42%  { transform: translate(118px, -56px) scale(1.12); }
  66%  { transform: translate(188px, 4px) scale(1.09); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes pbLungeLeft {
  0%   { transform: translate(16px, 0) scale(1.03); }
  42%  { transform: translate(-118px, -56px) scale(1.12); }
  66%  { transform: translate(-188px, 4px) scale(1.09); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes pbCastRight {
  0%   { transform: translate(0, 0) scale(1); }
  35%  { transform: translate(-22px, -4px) scale(1.04); }
  60%  { transform: translate(30px, -12px) scale(1.07); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes pbCastLeft {
  0%   { transform: translate(0, 0) scale(1); }
  35%  { transform: translate(22px, -4px) scale(1.04); }
  60%  { transform: translate(-30px, -12px) scale(1.07); }
  100% { transform: translate(0, 0) scale(1); }
}
/* Casting a Special is one of the few things that earns a glow. */
@keyframes pbChannel {
  0%, 100% { transform: scale(1); filter: none; }
  50%      { transform: scale(1.07) translateY(-12px);
             filter: drop-shadow(0 0 38px var(--fx, #e0a020)) brightness(1.2) saturate(1.3); }
}
@keyframes pbHit {
  0%   { transform: translateX(0); filter: none; }
  18%  { transform: translate(calc(-20px * var(--dir)), -4px) rotate(calc(-5deg * var(--dir)));
         filter: drop-shadow(0 0 26px rgba(255, 90, 70, 0.9)) brightness(1.45) saturate(1.6); }
  44%  { transform: translate(calc(12px * var(--dir)), 1px) rotate(calc(3deg * var(--dir)));
         filter: drop-shadow(0 0 16px rgba(255, 90, 70, 0.5)) brightness(1.15); }
  100% { transform: translateX(0); filter: none; }
}
@keyframes pbDodgeRight {
  0%   { transform: translate(0, 0) scale(1); }
  42%  { transform: translate(66px, -20px) scale(0.96); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes pbDodgeLeft {
  0%   { transform: translate(0, 0) scale(1); }
  42%  { transform: translate(-66px, -20px) scale(0.96); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes pbFaint {
  0%   { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
  22%  { transform: translateY(-12px) rotate(calc(-6deg * var(--dir))) scale(1.03); filter: brightness(1.8) saturate(0.3); }
  100% { transform: translateY(62px) rotate(calc(-20deg * var(--dir))) scale(0.84); opacity: 0; filter: grayscale(1) brightness(0.7); }
}
@keyframes pbEnterRight {
  0%   { transform: translate(-230px, 0) scale(0.86); opacity: 0; }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
@keyframes pbEnterLeft {
  0%   { transform: translate(230px, 0) scale(0.86); opacity: 0; }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}

/* ── BENCH, AGAINST THE WALL ─────────────────────────────────────── */

.pb-wing { position: absolute; inset: 0; pointer-events: none; z-index: 8; }

/* Anchored by the feet: `top` is the ground line and the unit is pulled up by
   its own height, so a sprite can never drift off the floor. */
.pb-wing__unit {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex; flex-direction: column; align-items: center;
  animation: pbWingIdle 5s ease-in-out infinite;
  transition: opacity 600ms ease;
}
.pb-wing__unit--down { opacity: 0.2; }
.pb-wing__unit--down .pb-wing__pet { filter: grayscale(1) brightness(0.75) !important; }

.pb-wing__pet { object-fit: contain; object-position: bottom; transform-origin: bottom center; }

@keyframes pbWingIdle {
  0%, 100% { transform: translate(-50%, -100%); }
  50%      { transform: translate(-50%, calc(-100% - 4px)); }
}

/* ── SIDE RAIL: live dice, then statuses ─────────────────────────── */

.pb-vitals {
  position: absolute; top: 540px;
  display: flex; flex-direction: column; gap: 4px;
  z-index: 12;
  padding: 7px 9px;
  border-radius: 12px;
  background: rgba(30, 21, 8, 0.5);
}
.pb-vitals--p1 { left: 186px; }
.pb-vitals--p2 { left: 1348px; }

.pb-vitals__row { display: flex; align-items: center; gap: 6px; }
.pb-vitals__icon { font-size: 13px; line-height: 1; opacity: 0.9; }
.pb-vitals__num {
  font-family: ui-monospace, monospace; font-size: 14px; font-weight: 900;
  color: #fffdf6; text-shadow: 0 1px 3px rgba(35, 24, 8, 0.9);
  min-width: 40px;
}
.pb-vitals__row.is-up .pb-vitals__num { color: #6ee7a0; }
.pb-vitals__row.is-down .pb-vitals__num { color: #ff8f7a; }

.pb-flank {
  position: absolute; top: 540px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 12;   /* behind the duellists (20+), in front of the sand */
}
.pb-flank--p1 { left: 274px; align-items: flex-end; }
.pb-flank--p2 { left: 1274px; align-items: flex-start; }

.pb-flank__item {
  position: relative;
  width: 54px; height: 54px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px;
  background: rgba(255, 252, 244, 0.92);
  border: 3px solid var(--tone);
  box-shadow: 0 4px 12px rgba(80, 60, 30, 0.32);
  animation: pbFlankIn 320ms cubic-bezier(0.25, 1.4, 0.4, 1) both;
  pointer-events: auto;   /* so it can be hovered through the FX layer */
  cursor: help;
}
@keyframes pbFlankIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.pb-flank__icon { font-size: 27px; line-height: 1; }
.pb-flank__count {
  position: absolute; right: -7px; bottom: -7px;
  min-width: 23px; height: 23px; padding: 0 5px;
  border-radius: 999px; background: var(--tone); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: ui-monospace, monospace; font-size: 13px; font-weight: 900;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

/* Hover card. Opens outboard so it never covers the fight. */
.pb-flank__tip {
  position: absolute; top: -6px;
  width: 208px; padding: 9px 11px;
  border-radius: 11px;
  background: rgba(26, 19, 7, 0.96);
  border-left: 4px solid var(--tone);
  box-shadow: 0 8px 22px rgba(30, 20, 6, 0.5);
  display: flex; flex-direction: column; gap: 4px;
  opacity: 0; transform: scale(0.94);
  transition: opacity 130ms ease, transform 130ms ease;
  pointer-events: none;
  z-index: 40;
}
.pb-flank--p1 .pb-flank__tip { right: calc(100% + 10px); }
.pb-flank--p2 .pb-flank__tip { left: calc(100% + 10px); }
.pb-flank__item:hover .pb-flank__tip { opacity: 1; transform: scale(1); }

.pb-flank__tipname {
  font-family: ui-monospace, monospace; font-size: 11px; font-weight: 900;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--tone);
}
.pb-flank__tipdesc {
  font-family: ui-monospace, monospace; font-size: 10.5px; line-height: 1.45;
  color: #efe6d2;
}

/* ── NAMEPLATE (no box) ──────────────────────────────────────────── */

.pb-plate {
  position: absolute; top: 792px;
  width: 360px; margin-left: -180px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  transition: opacity 240ms ease;
  opacity: 0.82;
}
.pb-plate--p1 { left: 480px; }
.pb-plate--p2 { left: 1120px; }
.pb-plate.is-active { opacity: 1; }

.pb-plate__hearts { display: flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: wrap; }
.pb-hp {
  width: 30px; height: 30px; flex: none;
  transition: transform 220ms cubic-bezier(0.25, 1.4, 0.4, 1);
}
.pb-hp.is-full { fill: #e5344b; filter: drop-shadow(0 2px 3px rgba(90, 20, 20, 0.5)); }
.pb-hp.is-empty { fill: rgba(60, 45, 30, 0.28); stroke: rgba(255, 255, 255, 0.65); stroke-width: 1.5px; transform: scale(0.72); }
.pb-hp.is-lost { animation: pbHeartBreak calc(0.5s / var(--sp)) cubic-bezier(0.3, 0, 0.3, 1) both; }
@keyframes pbHeartBreak {
  0%   { transform: scale(1.45); fill: #fff; }
  100% { transform: scale(0.72); }
}
.pb-plate__hearts.is-hit { animation: pbPlateJolt calc(0.36s / var(--sp)) ease-out; }
@keyframes pbPlateJolt {
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(-4px); }
  65% { transform: translateX(3px); }
}

.pb-plate__name {
  font-family: ui-serif, Georgia, serif; font-size: 19px; font-weight: 900;
  color: #fffdf6; letter-spacing: 0.01em;
  text-shadow: 0 2px 5px rgba(50, 35, 15, 0.85), 0 0 2px rgba(50, 35, 15, 0.9);
}

.pb-plate__charge { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 210px; }
.pb-plate__rail {
  width: 100%; height: 9px; border-radius: 999px;
  background: rgba(50, 35, 15, 0.42);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.pb-plate__fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #2f9ee0, #7dd3fc);
  transition: width 420ms cubic-bezier(0.3, 0, 0.2, 1);
}
.pb-plate__charge.is-ready .pb-plate__fill {
  background: linear-gradient(90deg, #e0a020, #ffe07a);
  animation: pbReady calc(1.2s / var(--sp)) ease-in-out infinite;
}
@keyframes pbReady { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.4); } }
.pb-plate__ready {
  font-family: ui-monospace, monospace; font-size: 10px; font-weight: 900;
  letter-spacing: 0.16em; color: #ffe07a;
  text-shadow: 0 1px 4px rgba(50, 35, 15, 0.95);
}

/* ── ROLL CARDS ──────────────────────────────────────────────────── */

/* No panel behind these. A white card under the bars put a hard rectangle over
   the arena every time anything rolled; the bars and numbers carry themselves
   on bright sand with a dark track and text shadows instead. */
.pb-roll {
  position: absolute; top: 274px; width: 280px; margin-left: -140px;
  display: flex; flex-direction: column; align-items: center;
  color: #fffdf6;
  text-shadow: 0 2px 6px rgba(35, 24, 8, 0.9), 0 0 2px rgba(35, 24, 8, 0.8);
  animation: pbRollIn calc(0.3s / var(--sp)) cubic-bezier(0.25, 1.3, 0.4, 1) both;
}
.pb-roll--p1 { left: 604px; }
.pb-roll--p2 { left: 996px; }
@keyframes pbRollIn { from { opacity: 0; transform: translateY(14px) scale(0.88); } to { opacity: 1; transform: none; } }

.pb-roll__tag {
  font-family: ui-monospace, monospace; font-size: 11px; font-weight: 900;
  letter-spacing: 0.16em; text-transform: uppercase;
  padding: 3px 11px; border-radius: 999px;
  background: rgba(28, 20, 8, 0.72); text-shadow: none;
}
.pb-roll--atk .pb-roll__tag { color: #ff9d8a; }
.pb-roll--def .pb-roll__tag { color: #7fe0aa; }
.pb-roll--true .pb-roll__tag { color: #ffe07a; }
.pb-roll--check .pb-roll__tag { color: var(--tone); }

.pb-roll__value {
  font-family: ui-serif, Georgia, serif; font-size: 58px; font-weight: 900; line-height: 1.05;
}
.pb-roll__value--word { font-size: 32px; text-transform: uppercase; letter-spacing: 0.04em; }
.pb-roll__max { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.1em; opacity: 0.9; }
.pb-roll__why { font-family: ui-monospace, monospace; font-size: 10px; margin-top: 2px; text-align: center; opacity: 0.92; }

.pb-roll__dice { display: flex; gap: 14px; margin-top: 10px; align-items: flex-end; }
.pb-roll__slot { display: flex; flex-direction: column; align-items: center; }

.pb-bar {
  position: relative;
  width: 30px; height: 74px;
  border-radius: 8px;
  background: rgba(30, 21, 8, 0.5);
  border: 2px solid rgba(255, 253, 246, 0.55);
  box-shadow: 0 2px 8px rgba(35, 24, 8, 0.45);
  overflow: hidden;
  display: flex; align-items: flex-end;
  transition: opacity 200ms ease, transform 200ms ease;
}
.pb-bar i {
  display: block; width: 100%;
  background: currentColor;
  animation: pbBarFill calc(0.42s / var(--sp)) cubic-bezier(0.25, 0.9, 0.3, 1) both;
}
@keyframes pbBarFill { from { height: 0 !important; } }

.pb-roll--atk .pb-bar { color: #ff6b52; }
.pb-roll--def .pb-bar { color: #3fc47e; }
.pb-roll--check .pb-bar { color: rgba(255, 253, 246, 0.3); }
/* A check die that actually fired. */
.pb-roll--check .pb-bar.is-lit { color: var(--tone); border-color: var(--tone); }

/* The die thrown away under advantage / disadvantage. */
.pb-bar.is-muted { opacity: 0.4; transform: scale(0.84); border-color: rgba(255, 253, 246, 0.3); }

/* Threshold marker: at or below this line, the check triggers. */
.pb-bar__line {
  position: absolute; left: -2px; right: -2px; height: 0;
  border-top: 2px dashed rgba(255, 253, 246, 0.95);
  pointer-events: none;
}

.pb-roll__num { font-family: ui-monospace, monospace; font-size: 14px; font-weight: 900; margin-top: 4px; }
.pb-roll__num.is-dropped { opacity: 0.6; text-decoration: line-through; text-decoration-color: #ff6b52; text-decoration-thickness: 2px; }
.pb-roll__tick { font-family: ui-monospace, monospace; font-size: 8px; font-weight: 900; letter-spacing: 0.1em; opacity: 0.9; }
.pb-roll__tick.is-dropped { opacity: 0.55; }

/* ── FLOATING TEXT ───────────────────────────────────────────────── */

.pb-float {
  position: absolute; top: 430px; width: 420px; margin-left: -210px;
  text-align: center; pointer-events: none;
  font-family: ui-serif, Georgia, serif; font-weight: 900; line-height: 1;
  animation: pbFloat calc(1s / var(--sp)) cubic-bezier(0.2, 0.85, 0.3, 1) both;
  text-shadow: 0 3px 8px rgba(40, 28, 10, 0.7), 0 0 3px rgba(40, 28, 10, 0.55);
}
.pb-float--p1 { left: 480px; }
.pb-float--p2 { left: 1120px; }
.pb-float--lg { font-size: 66px; }
.pb-float--md { font-size: 42px; }
.pb-float--sm { font-size: 25px; }
/* Charge ticks: small, quick, low in the frame near the meter. */
.pb-float--chg { font-size: 24px; top: 690px; animation-duration: calc(0.75s / var(--sp)); }
@keyframes pbFloat {
  0%   { opacity: 0; transform: translateY(22px) scale(0.7); }
  20%  { opacity: 1; transform: translateY(-4px) scale(1.08); }
  36%  { transform: translateY(0) scale(1); }
  74%  { opacity: 1; transform: translateY(-26px); }
  100% { opacity: 0; transform: translateY(-50px); }
}

/* ── VFX ─────────────────────────────────────────────────────────── */

.pb-bolt {
  position: absolute; top: 540px; left: 0;
  width: 118px; height: 56px; margin: -28px 0 0 -59px;
  border-radius: 999px;
  animation: pbBoltFlyR calc(0.52s / var(--sp)) cubic-bezier(0.42, 0, 0.9, 0.55) both;
}
.pb-bolt--l { animation-name: pbBoltFlyL; }
@keyframes pbBoltFlyR {
  0%   { transform: translate(480px, 0) scale(0.4); opacity: 0; }
  18%  { opacity: 1; }
  100% { transform: translate(1120px, 0) scale(1.3); opacity: 0.1; }
}
@keyframes pbBoltFlyL {
  0%   { transform: translate(1120px, 0) scale(0.4); opacity: 0; }
  18%  { opacity: 1; }
  100% { transform: translate(480px, 0) scale(1.3); opacity: 0.1; }
}

.pb-spark {
  position: absolute; top: 520px; width: 250px; height: 250px; margin: -125px 0 0 -125px;
  border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.92) 0%, rgba(255, 190, 90, 0.6) 30%, rgba(255, 140, 60, 0) 66%);
  animation: pbSpark calc(0.44s / var(--sp)) ease-out both;
}
.pb-spark--p1 { left: 480px; }
.pb-spark--p2 { left: 1120px; }
@keyframes pbSpark {
  0%   { opacity: 0.95; transform: scale(0.25); }
  100% { opacity: 0; transform: scale(1.45); }
}

.pb-flash {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.5), rgba(255, 170, 90, 0.16) 45%, transparent 72%);
  animation: pbFlash calc(0.36s / var(--sp)) ease-out both;
}
@keyframes pbFlash { 0% { opacity: 0.55; } 100% { opacity: 0; } }

/* ── TOP BAR: transport, then the log to its right ───────────────── */

.pb-topbar {
  position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: flex-start; gap: 10px;
  z-index: 40;
}

.pb-controls {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 7px; border-radius: 999px;
  background: rgba(255, 252, 244, 0.92);
  box-shadow: 0 4px 14px rgba(70, 52, 26, 0.28);
}

.pb-btn {
  font-family: ui-monospace, monospace; font-size: 12px; font-weight: 800;
  color: #6b5b3e; background: transparent; border: none;
  cursor: pointer; transition: all 150ms ease; border-radius: 999px;
}
.pb-btn--icon { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; }
.pb-btn:hover { background: rgba(60, 45, 25, 0.12); color: var(--ink); }
.pb-btn--on { background: var(--gold); color: #fffdf6; }

.pb-speed { display: flex; gap: 2px; padding: 2px; border-radius: 999px; background: rgba(60, 45, 25, 0.1); }
.pb-speed__opt {
  padding: 4px 9px; border-radius: 999px; border: none; cursor: pointer;
  background: transparent; color: #8a7853;
  font-family: ui-monospace, monospace; font-size: 11px; font-weight: 900;
  transition: all 150ms ease;
}
.pb-speed__opt:hover { color: var(--ink); }
.pb-speed__opt--on { background: var(--gold); color: #fffdf6; }

.pb-scrub {
  position: absolute; top: 0; left: 0; width: 100%; height: 3px;
  background: rgba(255, 255, 255, 0.25); z-index: 45;
}
.pb-scrub i { display: block; height: 100%; background: var(--gold); }

/* ── TURN + STALL CLOCK ──────────────────────────────────────────── */

.pb-turn {
  position: absolute; top: 14px; left: 20px;
  display: flex; flex-direction: column; align-items: flex-start; gap: 5px;
  padding: 7px 12px 9px; border-radius: 12px;
  background: rgba(30, 21, 8, 0.52);
  z-index: 40;
}

.pb-turn__n {
  font-family: ui-monospace, monospace; font-size: 20px; font-weight: 900;
  letter-spacing: 0.04em; color: #fffdf6; line-height: 1;
  text-shadow: 0 2px 5px rgba(35, 24, 8, 0.9);
}

.pb-turn__stall { display: flex; flex-direction: column; gap: 4px; }

.pb-turn__pips { display: flex; gap: 3px; }
.pb-turn__pip {
  width: 11px; height: 5px; border-radius: 2px;
  background: rgba(255, 253, 246, 0.25);
  transition: background 260ms ease;
}
.pb-turn__pip.is-on { background: #c084fc; box-shadow: 0 0 6px rgba(192, 132, 252, 0.8); }

.pb-turn__label {
  font-family: ui-monospace, monospace; font-size: 10px; font-weight: 800;
  letter-spacing: 0.1em; color: #d8cbb4;
  text-shadow: 0 1px 3px rgba(35, 24, 8, 0.9);
}
.pb-turn__label.is-urgent { color: #e9c8ff; animation: pbStallWarn calc(1.1s / var(--sp)) ease-in-out infinite; }
@keyframes pbStallWarn { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

/* ── LOG ─────────────────────────────────────────────────────────── */

.pb-log {
  width: 340px; max-height: 250px;
  padding: 9px 12px; border-radius: 14px; overflow: hidden;
  background: rgba(255, 252, 244, 0.94);
  box-shadow: 0 8px 22px rgba(70, 52, 26, 0.3);
  display: flex; flex-direction: column-reverse; gap: 3px;
}
.pb-log__line {
  font-family: ui-monospace, monospace; font-size: 10.5px; line-height: 1.4; color: #8a7853;
  padding: 1px 0;
}
.pb-log__line:first-child { color: var(--ink); font-weight: 700; }

/* ── OVERLAYS ────────────────────────────────────────────────────── */

.pb-splash {
  position: absolute; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center; gap: 56px;
  background: rgba(20, 16, 8, 0.55);
  animation: pbFade 240ms ease-out both;
}
@keyframes pbFade { from { opacity: 0; } to { opacity: 1; } }
.pb-splash__side { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 420px; }
.pb-splash__side img { width: 250px; height: 230px; object-fit: contain; object-position: bottom; filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.6)); }
.pb-splash__side--p1 { animation: pbSplashL 480ms cubic-bezier(0.25, 1.1, 0.4, 1) both; }
.pb-splash__side--p2 { animation: pbSplashR 480ms cubic-bezier(0.25, 1.1, 0.4, 1) both; }
@keyframes pbSplashL { from { opacity: 0; transform: translateX(-120px); } to { opacity: 1; transform: none; } }
@keyframes pbSplashR { from { opacity: 0; transform: translateX(120px); } to { opacity: 1; transform: none; } }
.pb-splash__name { font-family: ui-serif, Georgia, serif; font-size: 32px; font-weight: 900; color: #fffdf6; text-align: center; text-shadow: 0 3px 10px rgba(0, 0, 0, 0.7); }
.pb-splash__roster { font-family: ui-monospace, monospace; font-size: 11px; color: #e8dcc0; letter-spacing: 0.08em; text-align: center; max-width: 380px; }
.pb-splash__vs {
  font-family: ui-serif, Georgia, serif; font-size: 84px; font-weight: 900;
  color: #ffe07a; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  animation: pbVs 560ms cubic-bezier(0.25, 1.5, 0.4, 1) both;
}
@keyframes pbVs { 0% { opacity: 0; transform: scale(2.6) rotate(-12deg); } 60% { opacity: 1; transform: scale(1); } 100% { transform: scale(1); } }

.pb-result {
  position: absolute; inset: 0; z-index: 60;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;
  background: rgba(20, 16, 8, 0.82);
  animation: pbFade 380ms ease-out both;
  pointer-events: auto;
}
.pb-result__kicker { font-family: ui-monospace, monospace; font-size: 13px; letter-spacing: 0.4em; text-transform: uppercase; color: #d8c79e; }
.pb-result__title {
  font-family: ui-serif, Georgia, serif; font-size: 92px; font-weight: 900; line-height: 1;
  color: #ffe07a; text-shadow: 0 6px 26px rgba(0, 0, 0, 0.6);
  animation: pbResultIn 560ms cubic-bezier(0.25, 1.2, 0.4, 1) both;
}
@keyframes pbResultIn { from { opacity: 0; transform: scale(1.24); } to { opacity: 1; transform: none; } }
.pb-result__survivors { display: flex; gap: 14px; }
.pb-result__pet { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 120px; }
.pb-result__pet img { width: 96px; height: 84px; object-fit: contain; object-position: bottom; filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.6)); }
.pb-result__pet span { font-family: ui-monospace, monospace; font-size: 10px; color: #e8dcc0; text-align: center; }
.pb-result__actions { display: flex; gap: 12px; margin-top: 6px; }
.pb-result__stat { font-family: ui-monospace, monospace; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #c9b98f; }

.pb-cta {
  font-family: ui-monospace, monospace; font-size: 14px; font-weight: 900;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 13px 32px; border-radius: 10px; cursor: pointer; border: 1px solid transparent;
  transition: all 180ms ease;
}
.pb-cta--primary { background: var(--gold); color: #2a2418; }
.pb-cta--primary:hover { background: #ffd166; }
.pb-cta--ghost { background: transparent; border-color: rgba(255, 253, 246, 0.45); color: #e8dcc0; }
.pb-cta--ghost:hover { color: #fff; border-color: #fff; }

/* ── REDUCED MOTION ──────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .pb-canvas *, .pb-canvas *::before, .pb-canvas *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 60ms !important;
  }
}
</file>

<file path="src/Pets/ui/BattleArena.jsx">
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { simulateBattle } from '../engine/simulate.js';
import { randomSeed } from '../engine/rng.js';
import { EV } from '../engine/events.js';
import { useBattlePlayback } from '../hooks/useBattlePlayback.js';
import {
  animationsFor, currentAction, currentTurnSide,
  floatsFor, isRanged, projectileStyle,
} from './describe.js';
import ArenaBackdrop from './ArenaBackdrop.jsx';
import PetSprite from './PetSprite.jsx';
import PetNameplate from './PetNameplate.jsx';
import StatusFlank from './StatusFlank.jsx';
import PetVitals from './PetVitals.jsx';
import BenchWings from './BenchWings.jsx';
import TurnCounter from './TurnCounter.jsx';
import { RollCards, CheckCard } from './RollCards.jsx';
import ControlBar from './ControlBar.jsx';
import BattleLog from './BattleLog.jsx';
import { OpeningSplash, ResultOverlay } from './Overlays.jsx';
import './battle.css';

const STAGE_W = 1600;
const STAGE_H = 900;

/** Fits the fixed 1600x900 stage into whatever space it is given. */
function useStageScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / STAGE_W, height / STAGE_H) || 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, scale];
}

/**
 * Floating text with a lifetime of its own.
 *
 * Previously each float was rendered from the *current* event, so whenever an
 * event's hold was shorter than the float's animation the number was yanked off
 * screen mid-flight — the single biggest source of the jerkiness. Now a float is
 * queued when its event fires and removes itself on `animationend`, so it always
 * completes no matter how fast the timeline is running.
 */
function useFloatingFx(event) {
  const [items, setItems] = useState([]);
  const nextId = useRef(0);

  useEffect(() => {
    const spawned = floatsFor(event);
    if (!spawned.length) return;
    setItems((current) => [
      // Hard cap so a stalled animation can never grow this without bound.
      ...current.slice(-11),
      ...spawned.map((float) => ({ ...float, key: nextId.current++ })),
    ]);
  }, [event]);

  const retire = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  return [items, retire];
}

const isShakeEvent = (event) => event?.type === EV.IMPACT && (event.lethal || event.amount >= 2);

/**
 * Owns the seed and nothing else. Each rematch produces a new `result`, and
 * keying the stage on it remounts the playback state instead of unwinding it.
 */
export default function BattleArena({ battleConfig, onExit }) {
  const [seed, setSeed] = useState(() => randomSeed());
  const rematch = useCallback(() => setSeed(randomSeed()), []);

  // The whole match resolves here, synchronously and up front. Everything below
  // this line is presentation replaying a finished recording.
  const result = useMemo(() => {
    if (!battleConfig) return null;
    return simulateBattle({ team1: battleConfig.team1, team2: battleConfig.team2, seed });
  }, [battleConfig, seed]);

  if (!result) return null;
  return <BattleStage key={seed} result={result} onRematch={rematch} onExit={onExit} />;
}

function BattleStage({ result, onRematch, onExit }) {
  const [showLog, setShowLog] = useState(false);
  const [stageRef, scale] = useStageScale();

  const playback = useBattlePlayback(result);
  const { timeline, index, event, state, speed, paused, finished, progress } = playback;

  const [floats, retireFloat] = useFloatingFx(event);

  /* Camera shake. Two identical CSS variants alternate so back-to-back hits
     both restart the animation without remounting anything. */
  const [shake, setShake] = useState(null);
  const shakeFlip = useRef(false);
  useEffect(() => {
    if (!isShakeEvent(event)) return;
    shakeFlip.current = !shakeFlip.current;
    setShake(shakeFlip.current ? 'a' : 'b');
  }, [event]);

  const { togglePaused, setSpeed, step, skipToEnd } = playback;
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); togglePaused(); }
      else if (e.key === '1') setSpeed(1);
      else if (e.key === '2') setSpeed(2);
      else if (e.key === '4') setSpeed(4);
      else if (e.key === '8') setSpeed(8);
      else if (e.key === 'ArrowRight') step();
      else if (e.key === 'Escape') onExit?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePaused, setSpeed, step, onExit]);

  const toggleLog = useCallback(() => setShowLog((value) => !value), []);

  const action = useMemo(() => (timeline ? currentAction(timeline, index) : null), [timeline, index]);
  const anims = useMemo(() => animationsFor(event, action), [event, action]);
  const turnSide = useMemo(() => (timeline ? currentTurnSide(timeline, index) : null), [timeline, index]);

  if (!state) return null;

  const leads = [state.teams[0][state.lead[0]], state.teams[1][state.lead[1]]];
  const showProjectile = event.type === EV.ROLL && action && isRanged(action.vfx) && !action.effect;
  const showSpark = event.type === EV.IMPACT && event.fromAttack;
  const showFlash = event.type === EV.IMPACT && event.lethal;

  return (
    <div className="pb-root" style={{ '--sp': speed }}>
      <div className="pb-stage" ref={stageRef}>
        <div className="pb-canvas" style={{ transform: `scale(${scale})` }}>
          <div className={`pb-shake ${shake ? `pb-shake--${shake}` : ''}`}>

            <ArenaBackdrop />

            {/* ── FIELD ──────────────────────────────────────────── */}
            <div className="pb-layer">
              {/* Bench, against the wall. Scenery — no HUD. */}
              {[0, 1].map((side) => (
                <BenchWings
                  key={`wing-${side}`}
                  team={state.teams[side]}
                  lead={state.lead[side]}
                  side={side}
                />
              ))}

              {/* Side rail: live dice outboard, status icons inboard of them,
                  both behind the sprites so an attack sweeps in front. */}
              {[0, 1].map((side) => (
                <PetVitals key={`vitals-${side}`} pet={leads[side]} side={side} />
              ))}
              {[0, 1].map((side) => (
                <StatusFlank key={`flank-${side}`} pet={leads[side]} side={side} />
              ))}

              {[0, 1].map((side) => (
                <PetSprite
                  key={`${side}-${leads[side].instanceId}`}
                  pet={leads[side]}
                  side={side}
                  anim={anims[side]}
                  isActive={turnSide === side}
                />
              ))}

              {showProjectile && (
                <div
                  key={`bolt-${event.id}`}
                  className={`pb-bolt ${action.side === 1 ? 'pb-bolt--l' : ''}`}
                  style={{ background: projectileStyle(action.vfx) }}
                />
              )}

              {showSpark && (
                <div key={`spark-${event.id}`} className={`pb-spark pb-spark--${event.side === 0 ? 'p1' : 'p2'}`} />
              )}

              {showFlash && <div key={`flash-${event.id}`} className="pb-flash" />}
            </div>

            {/* ── UI ─────────────────────────────────────────────── */}
            <div className="pb-layer pb-layer--ui">
              {[0, 1].map((side) => (
                <PetNameplate
                  key={side}
                  pet={leads[side]}
                  side={side}
                  isActive={turnSide === side}
                  damageFlash={event.type === EV.IMPACT && event.side === side}
                />
              ))}

              {event.type === EV.ROLL && <RollCards event={event} />}
              {event.type === EV.STATUS_TICK && event.rolls?.length > 0 && <CheckCard event={event} />}

              {floats.map((float) => (
                <div
                  key={float.key}
                  className={`pb-float pb-float--${float.side === 0 ? 'p1' : 'p2'} pb-float--${float.size}`}
                  style={{ color: float.tone }}
                  onAnimationEnd={() => retireFloat(float.key)}
                >
                  {float.text}
                </div>
              ))}


              <TurnCounter turn={state.turn} stagnation={state.stagnation} />

              {/* Transport at the top, log docked to its right. */}
              <div className="pb-topbar">
                <ControlBar
                  speed={speed}
                  paused={paused}
                  showLog={showLog}
                  onSpeed={setSpeed}
                  onTogglePause={togglePaused}
                  onStep={step}
                  onSkip={skipToEnd}
                  onToggleLog={toggleLog}
                  onExit={onExit}
                />
                {showLog && <BattleLog timeline={timeline} index={index} />}
              </div>

              <div className="pb-scrub"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>

              {event.type === EV.BATTLE_START && <OpeningSplash state={state} />}

              {finished && (
                <ResultOverlay
                  outcome={result.outcome}
                  state={timeline[timeline.length - 1].state}
                  onRematch={onRematch}
                  onExit={onExit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
</file>

<file path="src/Pets/ui/ControlBar.jsx">
import { memo } from 'react';
import { SPEEDS } from '../hooks/useBattlePlayback.js';

/**
 * Playback transport. The simulation is already resolved; this only paces it.
 * Pared back to icons and a segmented speed control so it reads as a thin strip
 * rather than a second HUD competing with the arena.
 */
function ControlBar({ speed, paused, showLog, onSpeed, onTogglePause, onStep, onSkip, onToggleLog, onExit }) {
  return (
    <div className="pb-controls pb-interactive">
      <button className="pb-btn pb-btn--icon" onClick={onTogglePause} title={paused ? 'Play (Space)' : 'Pause (Space)'}>
        {paused ? '▶' : '❚❚'}
      </button>
      <button className="pb-btn pb-btn--icon" onClick={onStep} title="Step one beat (→)">⇥</button>

      <div className="pb-speed">
        {SPEEDS.map((value) => (
          <button
            key={value}
            className={`pb-speed__opt ${speed === value ? 'pb-speed__opt--on' : ''}`}
            onClick={() => onSpeed(value)}
            title={`${value}x speed`}
          >
            {value}×
          </button>
        ))}
      </div>

      <button className={`pb-btn pb-btn--icon ${showLog ? 'pb-btn--on' : ''}`} onClick={onToggleLog} title="Battle log">☰</button>
      <button className="pb-btn pb-btn--icon" onClick={onSkip} title="Skip to result">⏭</button>
      <button className="pb-btn pb-btn--icon" onClick={onExit} title="Exit (Esc)">✕</button>
    </div>
  );
}

export default memo(ControlBar);
</file>

<file path="src/Pets/ui/describe.js">
/**
 * @file describe.js
 * @description Turns engine events into the words and floating text the player
 * sees. Keeping this out of the engine means the simulation stays a pure rules
 * model and the presentation can be reworded freely.
 */

import { EV } from '../engine/events.js';
import { statusDef } from '../data/index.js';

export const TONE = {
  charge: '#7dd3fc',
  damage: '#fb7185',
  heal: '#4ade80',
  block: '#34d399',
  buff: '#38bdf8',
  gold: '#fbbf24',
  curse: '#a855f7',
  burn: '#fb923c',
  mute: '#a8a29e',
  defend: '#facc15',
};

const petAt = (event, side, slot) => event.state?.teams?.[side]?.[slot ?? event.state.lead[side]];
const nameAt = (event, side, slot) => petAt(event, side, slot)?.name ?? 'Pet';

/* ── TICKER: one line describing the current beat ────────────────── */

export function tickerFor(event) {
  if (!event) return null;
  const who = (side = event.side, slot = event.slot) => nameAt(event, side, slot);

  switch (event.type) {
    case EV.BATTLE_START:
      return { text: 'Lineups locked. Initiative is decided by Max SPC.', hot: false };

    case EV.INITIATIVE:
      return {
        text: event.tie
          ? `Max SPC tied at d${event.spc[0]} — coin flip goes to ${event.names[event.side]}.`
          : `${event.names[event.side]} takes initiative (d${event.spc[event.side]} vs d${event.spc[event.side === 0 ? 1 : 0]}).`,
        hot: true,
      };

    case EV.TURN_START:
      return { text: `${who()}'s turn.`, hot: false };

    case EV.STATUS_TICK:
      return {
        text: event.damage > 0
          ? `${who()} burns for ${event.damage} — ${event.cleared} stack${event.cleared === 1 ? '' : 's'} spent.`
          : `${who()} shrugs off the flames.`,
        hot: event.damage > 0,
      };

    case EV.SKIP:
      return { text: `${who()} is ${event.reason} and loses the turn.`, hot: true };

    case EV.SPC_GAIN: {
      const main = event.entries?.[0];
      if (!main) return null;
      if (main.amount < 0) return { text: `${main.name} spends ${Math.abs(main.amount)} charge.`, hot: true };
      const extra = event.entries.length > 1 ? ` (+${event.entries.length - 1} more)` : '';
      return { text: `${main.name} builds ${main.amount} charge → ${main.total}/100${extra}.`, hot: false };
    }

    case EV.ACTION:
      return event.kind === 'special'
        ? { text: `${who()} unleashes ${event.name}!`, hot: true }
        : { text: `${who()} attacks.`, hot: false };

    case EV.ROLL: {
      if (event.trueStrike) return { text: 'TRUESTRIKE — the attack cannot be blocked.', hot: true };
      return {
        text: `ATK ${event.attacker.kept} vs DEF ${event.defender.kept} — ${event.hit ? 'it connects' : 'blocked'}.`,
        hot: event.hit,
      };
    }

    case EV.IMPACT:
      return { text: `${who()} takes ${event.amount}${event.cause ? ` from ${event.cause}` : ''}.`, hot: true };

    case EV.BLOCK:
      return { text: `${who()} turns the strike aside.`, hot: false };

    case EV.HEAL:
      return { text: `${who()} recovers ${event.amount}${event.label ? ` (${event.label})` : ''}.`, hot: false };

    case EV.STATUS_APPLY:
      return { text: `${who()} gains ${event.name}${event.stacks > 1 ? ` x${event.stacks}` : ''}.`, hot: true };

    case EV.STAT_MOD:
      return {
        text: `${who()} ${event.delta < 0 ? 'loses' : 'gains'} ${Math.abs(event.delta)} ${event.key.startsWith('atk') ? 'Max ATK' : 'Max DEF'}${event.label ? ` (${event.label})` : ''}.`,
        hot: false,
      };

    case EV.PASSIVE:
      return { text: `${event.label} triggers.`, hot: false };

    case EV.STAGNATION:
      return { text: 'Stagnation — the crowd turns. Both pets lose defence.', hot: true };

    case EV.FAINT:
      return { text: `${event.name} is knocked out.`, hot: true };

    case EV.SWITCH_IN:
      return { text: `${event.name} takes the field.`, hot: false };

    case EV.BATTLE_END:
      return {
        text: event.winner === null ? 'Time limit reached — the match is a draw.' : 'Match over.',
        hot: true,
      };

    default:
      return null;
  }
}

/* ── LOG: the persistent scrollback ──────────────────────────────── */

const LOGGED = new Set([
  EV.INITIATIVE, EV.ACTION, EV.ROLL, EV.IMPACT, EV.BLOCK, EV.HEAL,
  EV.STATUS_APPLY, EV.STATUS_TICK, EV.SKIP, EV.STAT_MOD, EV.FAINT,
  EV.SWITCH_IN, EV.STAGNATION, EV.PASSIVE, EV.BATTLE_END,
]);

export const isLogged = (event) => LOGGED.has(event.type);

export function logFor(event) {
  const line = tickerFor(event);
  return line?.text ?? null;
}

/* ── FLOATING COMBAT TEXT ────────────────────────────────────────── */

/**
 * Floating combat text.
 *
 * Kept to things that carry a number or a state change you cannot read off the
 * animation. "BLOCKED" is gone — the defender already visibly dodges and the
 * roll card already shows the miss, so the word was pure noise on top of two
 * clearer signals. Same for "RESISTED" and "FIRST STRIKE".
 */
export function floatsFor(event) {
  if (!event) return [];
  const at = (side, slot) => ({ side, slot: slot ?? event.state.lead[side] });

  switch (event.type) {
    case EV.IMPACT:
      return [{
        ...at(event.side, event.slot),
        text: `−${event.amount}`,
        tone: TONE.damage,
        size: event.amount >= 2 ? 'lg' : 'md',
      }];

    case EV.HEAL:
      return [{ ...at(event.side, event.slot), text: `+${event.amount}`, tone: TONE.heal, size: 'md' }];

    case EV.SPC_GAIN: {
      // The charge roll, shown as a number that drifts off the meter. Cheap
      // enough to never hold up the timeline.
      const main = event.entries?.find((e) => e.amount > 0);
      if (!main) return [];
      return [{ ...at(main.side, main.slot), text: `+${main.amount}`, tone: TONE.charge, size: 'chg' }];
    }

    case EV.STATUS_APPLY:
      return [{
        ...at(event.side, event.slot),
        text: event.name.toUpperCase() + (event.stacks > 1 ? ` ×${event.stacks}` : ''),
        tone: statusDef(event.status).tone,
        size: 'sm',
      }];

    case EV.SKIP:
      return [{ ...at(event.side, event.slot), text: event.text, tone: TONE.mute, size: 'md' }];

    case EV.STAT_MOD:
      return [{
        ...at(event.side, event.slot),
        text: `${event.key.startsWith('atk') ? 'ATK' : 'DEF'} ${event.delta > 0 ? '+' : ''}${event.delta}`,
        tone: event.delta > 0 ? TONE.heal : TONE.curse,
        size: 'sm',
      }];

    case EV.FAINT:
      return [{ ...at(event.side, event.slot), text: 'DOWN', tone: TONE.mute, size: 'lg' }];

    default:
      return [];
  }
}

/* ── SPRITE ANIMATION SELECTION ──────────────────────────────────── */

const RANGED_VFX = new Set(['firebolt', 'bolt', 'hex', 'shriek', 'flare', 'shatter']);
const PROJECTILE_COLOR = {
  firebolt: 'radial-gradient(circle, #fff 0%, #fde047 25%, #f97316 55%, rgba(239,68,68,0) 78%)',
  bolt: 'radial-gradient(circle, #fff 0%, #fef08a 28%, #38bdf8 58%, rgba(56,189,248,0) 80%)',
  hex: 'radial-gradient(circle, #fff 0%, #e9d5ff 24%, #a855f7 56%, rgba(168,85,247,0) 80%)',
  shriek: 'radial-gradient(circle, #fff 0%, #ddd6fe 26%, #7c3aed 58%, rgba(124,58,237,0) 80%)',
};

export const isRanged = (vfx) => RANGED_VFX.has(vfx);
export const projectileStyle = (vfx) => PROJECTILE_COLOR[vfx] ?? PROJECTILE_COLOR.firebolt;

/**
 * The most recent ACTION at or before the cursor — the view needs it during the
 * ROLL beat to know whether the attacker should lunge or cast.
 */
export function currentAction(timeline, index) {
  for (let i = index; i >= 0 && i > index - 12; i -= 1) {
    const event = timeline[i];
    if (event.type === EV.ACTION) return event;
    if (event.type === EV.TURN_START && i !== index) return null;
  }
  return null;
}

/** Which side owns the turn at the cursor, for highlighting the HUD. */
export function currentTurnSide(timeline, index) {
  for (let i = index; i >= 0; i -= 1) {
    const event = timeline[i];
    if (event.type === EV.TURN_START || event.type === EV.INITIATIVE) return event.side;
  }
  return null;
}

/** 1-based turn counter for the banner. */
export function currentTurnNumber(timeline, index) {
  for (let i = index; i >= 0; i -= 1) {
    if (timeline[i].type === EV.TURN_START) return timeline[i].turn;
  }
  return 1;
}

/**
 * Per-side sprite animation for the current event.
 *
 * Reserved for moments with weight: throwing an attack, being hit, casting,
 * going down, walking on. Charge ticks and status checks deliberately return
 * nothing — a pet lighting up every time it rolls its charge die made the whole
 * match strobe, and the number that floats off the meter says it better.
 */
export function animationsFor(event, action) {
  if (!event) return {};

  switch (event.type) {
    case EV.ACTION:
      if (event.effect) return { [event.side]: 'channel' };
      return { [event.side]: isRanged(event.vfx) ? 'cast' : 'windup' };

    case EV.ROLL:
      if (!action) return {};
      return { [action.side]: isRanged(action.vfx) ? 'cast' : 'lunge' };

    case EV.IMPACT:
      return { [event.side]: 'hit' };

    case EV.BLOCK:
      return { [event.side]: 'dodge' };

    case EV.FAINT:
      return { [event.side]: 'faint' };

    case EV.SWITCH_IN:
      return { [event.side]: 'enter' };

    default:
      return {};
  }
}
</file>

<file path="src/Pets/ui/PetSprite.jsx">
import { memo } from 'react';
import { getSpecies, elementMeta } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/** Sprites are authored facing one way; flip so each side looks at the other. */
const scaleXFor = (species, side) => {
  const facesLeft = species.facing === 'Left';
  return side === 0 ? (facesLeft ? -1 : 1) : (facesLeft ? 1 : -1);
};

const DIRECTIONAL = { lunge: true, cast: true, dodge: true, enter: true };

const animClass = (anim, side) => {
  if (!anim) return 'pb-anim-idle';
  if (DIRECTIONAL[anim]) return `pb-anim-${anim}-${side === 0 ? 'r' : 'l'}`;
  return `pb-anim-${anim}`;
};

/**
 * One combatant on the field.
 *
 * Both pets are always drawn at full brightness. Dimming whoever was not acting
 * meant half the fight sat in shade at any moment and every switch of turn
 * pulsed the whole screen; the nameplate and the turn colour carry that
 * information without touching the artwork.
 *
 * The animated node is never remounted — every pose returns to `pb-anim-idle`
 * between beats, so swapping the class off and on is what restarts a one-shot.
 */
function PetSprite({ pet, side, anim, isActive, fxColor }) {
  const species = getSpecies(pet.speciesId);
  const element = elementMeta(species.typing.defensive);

  return (
    <div
      className={`pb-slot pb-slot--${side === 0 ? 'p1' : 'p2'}`}
      style={{ '--dir': side === 0 ? 1 : -1, zIndex: isActive ? 30 : 20 }}
    >
      <div className="pb-slot__shadow" />
      <div className={`pb-actor ${animClass(anim, side)}`} style={{ '--fx': fxColor ?? element.hex }}>
        <img
          className="pb-sprite"
          src={assetUrl(species.art)}
          alt={pet.name}
          draggable={false}
          style={{ transform: `scaleX(${scaleXFor(species, side)})` }}
        />
      </div>
    </div>
  );
}

export default memo(PetSprite);
</file>

<file path="src/Pets/ui/RollCards.jsx">
import { memo } from 'react';
import { statusDef } from '../data/index.js';

/**
 * Every die the game rolls is shown the same way: a card over the pet it
 * belongs to, one bar per die, bar height = roll ÷ scale.
 *
 * Two readability decisions:
 *  - Opposed rolls share one scale (the larger of the two die sizes), so the
 *    ATK and DEF bars are directly comparable and the taller bar is simply the
 *    winner. Scaling each card to its own die made a 30-on-d40 look bigger than
 *    a 45-on-d50, which is backwards.
 *  - Status checks draw a dashed threshold line at the trigger value. A burn
 *    fires on a 1 of d6, so "low bar wins" reads backwards without it; with the
 *    line, at-or-below means it goes off and you need to know nothing else.
 */

function Bar({ value, scale, muted, threshold, lit }) {
  return (
    <div className={`pb-bar ${muted ? 'is-muted' : ''} ${lit ? 'is-lit' : ''}`}>
      <i style={{ height: `${Math.max(4, Math.min(100, (value / scale) * 100))}%` }} />
      {threshold != null && (
        <span className="pb-bar__line" style={{ bottom: `${(threshold / scale) * 100}%` }} />
      )}
    </div>
  );
}

function DiceRow({ dice, scale, threshold }) {
  return (
    <div className="pb-roll__dice">
      {dice.map((die, i) => (
        <div key={i} className="pb-roll__slot">
          <Bar value={die.value} scale={scale} muted={die.muted} threshold={threshold} lit={die.lit} />
          <span className={`pb-roll__num ${die.muted ? 'is-dropped' : ''}`}>{die.value}</span>
          {die.label && <span className={`pb-roll__tick ${die.muted ? 'is-dropped' : ''}`}>{die.label}</span>}
        </div>
      ))}
    </div>
  );
}

/* Advantage stacks, so the tag reports the net number of steps. */
const tagFor = (kind, advantage) => {
  if (advantage > 1) return `${kind} · ADV ×${advantage}`;
  if (advantage === 1) return `${kind} · ADV`;
  if (advantage < -1) return `${kind} · DIS ×${-advantage}`;
  if (advantage === -1) return `${kind} · DIS`;
  return kind;
};

function RollCard({ roll, kind, side, scale }) {
  const { rolls, kept, max, advantage, reasons } = roll;
  const contested = rolls.length > 1;
  const keptIndex = rolls.indexOf(kept);

  const dice = rolls.map((value, i) => ({
    value,
    muted: contested && i !== keptIndex,
    label: contested ? (i === keptIndex ? 'KEPT' : 'DROP') : null,
  }));

  return (
    <div className={`pb-roll pb-roll--${side === 0 ? 'p1' : 'p2'} pb-roll--${kind.toLowerCase()}`}>
      <span className="pb-roll__tag">{tagFor(kind, advantage)}</span>
      <span className="pb-roll__value">{kept}</span>
      <span className="pb-roll__max">d{max}</span>
      {reasons?.length > 0 && <span className="pb-roll__why">{reasons.join(' · ')}</span>}
      <DiceRow dice={dice} scale={scale} />
    </div>
  );
}

/** The opposed roll, both cards on a shared scale. */
export const RollCards = memo(function RollCards({ event }) {
  const { attacker, defender, trueStrike } = event;
  const scale = trueStrike ? attacker.max : Math.max(attacker.max, defender.max);

  return (
    <>
      <RollCard roll={attacker} kind="ATK" side={attacker.side} scale={scale} />
      {trueStrike ? (
        <div className={`pb-roll pb-roll--${defender.side === 0 ? 'p1' : 'p2'} pb-roll--true`}>
          <span className="pb-roll__tag">Truestrike</span>
          <span className="pb-roll__value">—</span>
          <span className="pb-roll__max">cannot block</span>
        </div>
      ) : (
        <RollCard roll={defender} kind="DEF" side={defender.side} scale={scale} />
      )}
    </>
  );
});

/* ── STATUS CHECKS ───────────────────────────────────────────────── */

const SUMMARY = {
  burn: (e) => (e.damage > 0 ? `−${e.damage}` : 'safe'),
  paralyzed: (e) => (e.skipped ? 'seized' : 'clear'),
  cursed: (e) => (e.nullified ? 'nulled' : 'holds'),
};

/**
 * A status rolling against its owner. One bar per stack, so three burn stacks
 * are three bars and you can see at a glance which of them caught.
 */
export const CheckCard = memo(function CheckCard({ event }) {
  const def = statusDef(event.status);
  const procs = new Set(event.procValues ?? [1]);
  const threshold = Math.max(...procs);

  const dice = event.rolls.map((value) => ({
    value,
    lit: procs.has(value),
    muted: !procs.has(value),
    label: procs.has(value) ? '✦' : null,
  }));

  const summary = (SUMMARY[event.status] ?? (() => ''))(event);

  return (
    <div
      className={`pb-roll pb-roll--${event.side === 0 ? 'p1' : 'p2'} pb-roll--check`}
      style={{ '--tone': def.tone }}
    >
      <span className="pb-roll__tag">
        {def.icon} {def.name}{event.rolls.length > 1 ? ` ×${event.rolls.length}` : ''}
      </span>
      <span className="pb-roll__value pb-roll__value--word">{summary}</span>
      <span className="pb-roll__max">{threshold} or less on d{event.dieSize}</span>
      <DiceRow dice={dice} scale={event.dieSize} threshold={threshold} />
    </div>
  );
});
</file>

</files>
