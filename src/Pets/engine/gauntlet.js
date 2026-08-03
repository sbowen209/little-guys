/**
 * @file gauntlet.js
 * @description The Stable Gauntlet: a series of matches between the player's
 * stable, divided into squads, and an equal number of opposing squads.
 *
 * Pure logic — no React, no storage, no randomness. The series is a small state
 * machine the UI advances by handing it results.
 *
 * ── TWO HUMANS, ONE SCREEN ─────────────────────────────────────────
 * Nothing here generates an opponent. Player 1 divides their stable into
 * squads; player 2 answers by picking the same number of saved rosters. The
 * gauntlet is a hot-seat format, so both sides are somebody's choices and there
 * is no AI to tune or to argue with.
 *
 * ── THE FORMAT ─────────────────────────────────────────────────────
 *   1 squad   a single match decides it.
 *   2 squads  two matches. A 1-1 split forces a DECIDER, for which each side
 *             builds a third squad from the pets across its own two — so the
 *             pets you spread thin in the first two rounds are exactly the ones
 *             you get to concentrate for the last. Both sides draft.
 *   3 squads  best of three; a 2-0 sweep ends it without a third match.
 *
 * A drawn match counts for neither side and the series simply plays on.
 */

/** How many squads a side fields. */
export const GAUNTLET_FORMATS = [1, 2, 3];

/* ── SERIES STATE ──────────────────────────────────────────────────── */

export const createSeries = (playerTeams, opponentTeams) => ({
  id: `gauntlet_${Date.now().toString(36)}`,
  startedAt: Date.now(),
  format: playerTeams.length,
  playerTeams,
  opponentTeams,
  /** One entry per match played: { winner: 0 | 1 | null, turns, seed }. */
  results: [],
  /** Filled in only when a 2-squad series reaches its decider. */
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
 *   { kind: 'decider' }   the 2-squad format is level and both sides must draft
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

  // Every scheduled match is done and nobody has the target. In the 2-squad
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

/** Every pet a side may draw on for the decider: its own two squads, pooled. */
export const deciderPool = (teams) => teams.flatMap((team) => team.pets);

export const recordResult = (series, result) => ({
  ...series,
  results: [...series.results, result],
});

export const setDecider = (series, playerTeam, opponentTeam) => ({
  ...series,
  decider: [playerTeam, opponentTeam],
});
