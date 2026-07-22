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
