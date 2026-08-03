/**
 * @file gauntlet.js
 * @description The Stable Gauntlet: a series of matches between the player's
 * stable, divided into teams, and an equal number of generated opponent teams.
 *
 * Pure logic — no React, no storage, no randomness the caller cannot swap out.
 * The series is a small state machine the UI advances by handing it results.
 *
 * ── THE FORMAT ─────────────────────────────────────────────────────
 * The player picks 1, 2 or 3 opposing teams and divides their stable into the
 * same number of teams, with no pet appearing twice. Then:
 *
 *   1 team   a single match decides it.
 *   2 teams  two matches. A 1-1 split forces a DECIDER, for which each side
 *            builds a third team from the pets across its own two teams — so
 *            the pets you spread thin in the first two rounds are exactly the
 *            ones you get to concentrate for the last.
 *   3 teams  best of three; a 2-0 sweep ends it without a third match.
 *
 * A drawn match counts for neither side and the series simply plays on.
 */

import { RULES } from '../data/constants.js';
import { SPECIES } from '../data/species.js';
import { createPetInstance } from '../data/index.js';

/** How many opposing teams the gauntlet supports. */
export const GAUNTLET_FORMATS = [1, 2, 3];

const OPPONENT_NAMES = [
  'Kennel Row', 'The Bramble Pack', 'Ashfall Crew', 'Tidewatch',
  'Gutter Kings', 'The Long Howl', 'Ninth Litter', 'Rust Chapel',
  'Salt & Sinew', 'The Quiet Teeth',
];

const DRAFTABLE = Object.keys(SPECIES);

const pickFrom = (list, random) => list[Math.floor(random() * list.length)];

/**
 * Level-ups the same way the builder rolls them: 1d4 onto one random die each
 * time, so a generated opponent is built by the same rules as a player pet
 * rather than getting a flat bonus the player cannot match.
 */
const levelTo = (instance, level, random) => {
  const keys = ['atk', 'def', 'spc'];
  const stats = { ...instance.stats };
  const gains = [];
  for (let i = instance.level; i < level; i += 1) {
    const key = keys[Math.floor(random() * keys.length)];
    const amount = Math.floor(random() * 4) + 1;
    stats[key] += amount;
    gains.push({ key, amount });
  }
  return { ...instance, level, stats, levelGains: [...(instance.levelGains ?? []), ...gains] };
};

/**
 * One generated team. `size` and `level` are matched to the player's
 * corresponding team so the series is a test of composition, not of who was
 * handed more pets or more level-ups.
 */
export const generateOpponentTeam = (size, level, index, random = Math.random) => {
  const used = new Set();
  const pets = [];

  while (pets.length < size) {
    const speciesId = pickFrom(DRAFTABLE, random);
    // No duplicates inside one generated team — a wall of five identical pets
    // is neither interesting to watch nor a fair read on the player's roster.
    if (used.has(speciesId) && used.size < DRAFTABLE.length) continue;
    used.add(speciesId);
    pets.push(levelTo(createPetInstance(speciesId, random), level, random));
  }

  return {
    id: `ai_${index}_${Math.random().toString(36).slice(2, 8)}`,
    name: OPPONENT_NAMES[Math.floor(random() * OPPONENT_NAMES.length)] ?? `Rival ${index + 1}`,
    pets,
    isOpponent: true,
  };
};

/** The average level of a set of pets, rounded, floored at 1. */
export const averageLevel = (pets) => {
  if (!pets.length) return 1;
  const total = pets.reduce((n, p) => n + (p.level ?? 1), 0);
  return Math.max(1, Math.min(RULES.MAX_LEVEL, Math.round(total / pets.length)));
};

/**
 * Builds the opposing side, one team per player team, each mirroring that
 * team's size and average level. Names are made unique so the scoreboard never
 * shows the same rival twice.
 */
export const generateOpponentSeries = (playerTeams, random = Math.random) => {
  const names = new Set();
  return playerTeams.map((team, i) => {
    let generated = generateOpponentTeam(team.pets.length, averageLevel(team.pets), i, random);
    let guard = 0;
    while (names.has(generated.name) && guard < 12) {
      generated = { ...generated, name: pickFrom(OPPONENT_NAMES, random) };
      guard += 1;
    }
    if (names.has(generated.name)) generated = { ...generated, name: `${generated.name} II` };
    names.add(generated.name);
    return generated;
  });
};

/* ── SERIES STATE ──────────────────────────────────────────────────── */

export const createSeries = (playerTeams, opponentTeams) => ({
  id: `gauntlet_${Date.now().toString(36)}`,
  startedAt: Date.now(),
  format: playerTeams.length,
  playerTeams,
  opponentTeams,
  /** One entry per match played: { winner: 0 | 1 | null, turns, seed }. */
  results: [],
  /** Filled in only when a 2-team series reaches its decider. */
  decider: null,
});

export const seriesScore = (series) => series.results.reduce(
  (score, result) => {
    if (result.winner === 0) score[0] += 1;
    if (result.winner === 1) score[1] += 1;
    return score;
  },
  [0, 0],
);

/** Wins needed to take the series outright. A single match needs just the one. */
export const winsNeeded = (series) => (series.format === 1 ? 1 : 2);

/**
 * What happens next. Returns one of:
 *   { kind: 'match', index, teams: [player, opponent] }
 *   { kind: 'decider' }   the 2-team format is level and both sides must draft
 *   { kind: 'done', winner }
 */
export const nextStep = (series) => {
  const score = seriesScore(series);
  const target = winsNeeded(series);

  if (score[0] >= target) return { kind: 'done', winner: 0 };
  if (score[1] >= target) return { kind: 'done', winner: 1 };

  const played = series.results.length;

  if (played < series.format) {
    return {
      kind: 'match',
      index: played,
      teams: [series.playerTeams[played], series.opponentTeams[played]],
    };
  }

  // Every scheduled match is done and nobody has the target. In the 2-team
  // format that is the cue for the decider; anywhere else it is a drawn series.
  if (series.format === 2) {
    if (!series.decider) return { kind: 'decider' };
    return {
      kind: 'match',
      index: played,
      teams: [series.decider[0], series.decider[1]],
    };
  }

  return { kind: 'done', winner: null };
};

/** Every pet a side may draw on for the decider: its own two teams, pooled. */
export const deciderPool = (teams) => teams.flatMap((team) => team.pets);

/**
 * The opponent's decider team: its strongest pets by a crude power score, so
 * the AI concentrates its pool the same way a player would rather than picking
 * at random.
 */
export const buildOpponentDecider = (teams, size) => {
  const power = (pet) => pet.stats.atk + pet.stats.def + pet.stats.spc + pet.stats.hp * 8;
  const pets = deciderPool(teams)
    .slice()
    .sort((a, b) => power(b) - power(a))
    .slice(0, Math.min(size, RULES.TEAM_SIZE));

  return { id: 'ai_decider', name: 'Rivals · Final Cut', pets, isOpponent: true };
};

export const recordResult = (series, result) => ({
  ...series,
  results: [...series.results, result],
});

export const setDecider = (series, playerTeam, opponentTeam) => ({
  ...series,
  decider: [playerTeam, opponentTeam],
});
