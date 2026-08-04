/**
 * Tier-list measurement pass.
 *
 *   node src/Pets/engine/tierlist.mjs           # default sample sizes
 *   node src/Pets/engine/tierlist.mjs 3         # 3x the samples, tighter bars
 *
 * `balance.mjs` answers "is anything broken". This answers "how good is each
 * pet, and what should I do about it". It prints readable tables and then a
 * single JSON block so a report can quote exact numbers instead of re-deriving
 * them by eye.
 *
 * ── WHAT IS MEASURED ───────────────────────────────────────────────
 *  1. Solo round robin, every ordered pair — raw duelling strength.
 *  2. 5v5 roster contribution — how often the side fielding a pet wins.
 *  3. Head-to-head coverage — how many of the other species it beats.
 *  4. The player's stable, measured AGAINST THE WHOLE POOL rather than against
 *     itself, so a stable pet is scored on the same scale as every species.
 *  5. The investment curve — the same stable pets levelled to the cap, to show
 *     what spending levels on each one actually buys.
 *
 * ── TWO DELIBERATE CONVENTIONS ─────────────────────────────────────
 * SPECIES are tested at level 5 with a flat +3 on every die and no Natures,
 * matching `balance.mjs`, so the table measures the species and not one lucky
 * roll. STABLE pets are tested at their authored level with their authored
 * stat line, and when levelled they roll REAL 1d4 level-ups — because that is a
 * pet you actually own, and the question is what happens if you invest in it.
 *
 * ── THE BLUE BUBBLE ASTERISK ───────────────────────────────────────
 * Bubble Trouble (Affinity) — the blue half, and Dovey with it — has BOTH its
 * passives gated behind its bonded partner: Lovey Dovey wants the partner on the
 * team, Surface Tension wants it dead. On a randomly composed team the partner
 * is almost never there, so both passives read as zero and the measurement is of
 * a pet with no passives at all.
 *
 * It is therefore measured with both assumed ONLINE, folded into the stat line:
 * Max SPC x1.5 (Lovey Dovey) and +20 Max ATK (Surface Tension). Every table
 * marks it with an asterisk. This makes the blue half a *best case* and the pink
 * half a *typical case* — they are not directly comparable, which is the whole
 * reason the asterisk is there.
 */

import { simulateBattle } from './simulate.js';
import { SPECIES, PET_DB, STABLE_IDS, ROLE_META, displayName } from '../data/index.js';

const SCALE = Math.max(1, Number(process.argv[2]) || 1);
const ids = Object.keys(SPECIES);

/* ── THE ASTERISK ──────────────────────────────────────────────────── */

const ASSUMED = 'bubble_trouble_affinity';
/** True for the blue bubble and for any preset derived from it (Dovey). */
const isBlueBubble = (unitId) => {
  const unit = PET_DB[unitId];
  return unitId === ASSUMED || unit?.baseSpeciesId === ASSUMED;
};

/**
 * Folds the blue bubble's two conditional passives into its stat line. Exactly
 * what the passives do — Lovey Dovey scales Max SPC, Surface Tension is a flat
 * Max ATK mod — so the rolls come out the same as if the partner were present
 * and then dead, without having to force a partner into every team.
 */
const applyAssumption = (unitId, stats) => (
  isBlueBubble(unitId)
    ? { ...stats, atk: stats.atk + 20, spc: Math.round(stats.spc * 1.5) }
    : stats
);

/* ── ENTRY BUILDERS ────────────────────────────────────────────────── */

const SPECIES_LEVEL = 5;
const FLAT_BONUS = 3;

/** A species at the comparison standard: level 5, +3 everywhere, no Natures. */
const speciesEntry = (id, tag) => {
  const s = PET_DB[id];
  const level = s.level ?? SPECIES_LEVEL;
  const bump = level > 1 ? FLAT_BONUS : 0;
  return {
    instanceId: `${id}-${tag}`,
    speciesId: id,
    level,
    stats: applyAssumption(id, {
      hp: s.base.hp,
      atk: s.base.atk + bump,
      def: s.base.def + bump,
      spc: s.base.spc + bump,
    }),
  };
};

const rollDie = (n) => Math.floor(Math.random() * n) + 1;
const KEYS = ['atk', 'def', 'spc'];

/**
 * A stable pet, optionally levelled. Level-ups roll a real 1d4 onto a random
 * die, the same as the builder — across thousands of matches the distribution
 * is the true one rather than a flat stand-in.
 */
const stableEntry = (id, tag, level) => {
  const s = PET_DB[id];
  const from = s.level ?? 1;
  const to = Math.max(from, level ?? from);
  const stats = { ...s.base };
  for (let i = from; i < to; i += 1) stats[KEYS[Math.floor(Math.random() * 3)]] += rollDie(4);
  return { instanceId: `${id}-${tag}`, speciesId: id, level: to, stats: applyAssumption(id, stats) };
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const rate = (o) => (o.games ? (o.wins / o.games) * 100 : 0);
const tally = (keys) => Object.fromEntries(keys.map((k) => [k, { wins: 0, games: 0 }]));

/* ── 1 & 3. SOLO ROUND ROBIN + COVERAGE ────────────────────────────── */

const DUELS_PER_PAIR = 22 * SCALE;
const solo = tally(ids);
const head = Object.fromEntries(ids.map((a) => [a, tally(ids)]));

console.error('· solo round robin...');
for (const a of ids) {
  for (const b of ids) {
    if (a === b) continue;
    for (let i = 0; i < DUELS_PER_PAIR; i += 1) {
      const { winner } = simulateBattle({
        team1: [speciesEntry(a, 'x')], team2: [speciesEntry(b, 'y')],
      }).outcome;
      solo[a].games += 1; solo[b].games += 1;
      head[a][b].games += 1; head[b][a].games += 1;
      if (winner === 0) { solo[a].wins += 1; head[a][b].wins += 1; }
      if (winner === 1) { solo[b].wins += 1; head[b][a].wins += 1; }
    }
  }
}

/* ── 2. 5v5 ROSTER CONTRIBUTION ────────────────────────────────────── */

const ROSTER_MATCHES = 7000 * SCALE;
const roster = tally(ids);

console.error('· 5v5 roster contribution...');
for (let m = 0; m < ROSTER_MATCHES; m += 1) {
  const t1 = Array.from({ length: 5 }, (_, i) => speciesEntry(pick(ids), `p${i}`));
  const t2 = Array.from({ length: 5 }, (_, i) => speciesEntry(pick(ids), `q${i}`));
  const { winner } = simulateBattle({ team1: t1, team2: t2 }).outcome;
  if (winner === null) continue;
  const on = [new Set(t1.map((p) => p.speciesId)), new Set(t2.map((p) => p.speciesId))];
  for (const id of ids) {
    const l = on[0].has(id); const r = on[1].has(id);
    if (l === r) continue;               // absent from both, or on both
    roster[id].games += 1;
    if ((l && winner === 0) || (r && winner === 1)) roster[id].wins += 1;
  }
}

/* ── 4 & 5. THE STABLE, AGAINST THE WHOLE POOL ─────────────────────── */

/**
 * A stable pet is put on a team of four random SPECIES and sent against five
 * random species. Measuring the stable against itself only says which of eight
 * is best; this says how each one stands up to the game.
 */
const STABLE_MATCHES = 2600 * SCALE;
const stableNow = tally(STABLE_IDS);
const stableMax = tally(STABLE_IDS);
const MAX_LEVEL = 7;

const runStable = (into, levelFor) => {
  for (const id of STABLE_IDS) {
    for (let m = 0; m < STABLE_MATCHES; m += 1) {
      const mine = [
        stableEntry(id, 'lead', levelFor(id)),
        ...Array.from({ length: 4 }, (_, i) => speciesEntry(pick(ids), `a${i}`)),
      ];
      const foes = Array.from({ length: 5 }, (_, i) => speciesEntry(pick(ids), `b${i}`));
      const { winner } = simulateBattle({ team1: mine, team2: foes }).outcome;
      if (winner === null) continue;
      into[id].games += 1;
      if (winner === 0) into[id].wins += 1;
    }
  }
};

console.error('· stable vs the whole pool (authored levels)...');
runStable(stableNow, (id) => PET_DB[id].level ?? 1);
console.error('· stable vs the whole pool (levelled to the cap)...');
runStable(stableMax, () => MAX_LEVEL);

/* ── REPORT ────────────────────────────────────────────────────────── */

const star = (id) => (isBlueBubble(id) ? '*' : ' ');

const speciesRows = ids.map((id) => ({
  id,
  name: displayName(SPECIES[id]),
  role: ROLE_META[SPECIES[id].role].short,
  hp: SPECIES[id].base.hp,
  solo: rate(solo[id]),
  team: rate(roster[id]),
  gap: rate(roster[id]) - rate(solo[id]),
  beats: ids.filter((o) => o !== id && rate(head[id][o]) > 50).length,
  n: roster[id].games,
  assumed: isBlueBubble(id),
})).sort((a, b) => b.team - a.team);

console.log(`\nLEVEL 5 SPECIES · solo n~${solo[ids[0]].games} · roster n~${speciesRows[0].n} · ${ROSTER_MATCHES} 5v5s`);
console.log('pet                      role     hp    solo    team     gap   beats');
console.log('-'.repeat(72));
for (const r of speciesRows) {
  console.log(
    (r.id + star(r.id)).padEnd(24), r.role.padEnd(8), String(r.hp).padStart(2),
    r.solo.toFixed(1).padStart(6), r.team.toFixed(1).padStart(7),
    ((r.gap >= 0 ? '+' : '−') + Math.abs(r.gap).toFixed(1)).padStart(7),
    `${String(r.beats).padStart(4)}/27`,
  );
}

const stableRows = STABLE_IDS.map((id) => {
  const unit = PET_DB[id];
  const now = rate(stableNow[id]);
  const max = rate(stableMax[id]);
  const level = unit.level ?? 1;
  const levels = MAX_LEVEL - level;
  return {
    id,
    name: unit.name,
    role: ROLE_META[unit.role].short,
    level,
    levels,
    now,
    max,
    gain: max - now,
    perLevel: levels > 0 ? (max - now) / levels : 0,
    n: stableNow[id].games,
    assumed: isBlueBubble(id),
  };
}).sort((a, b) => b.now - a.now);

console.log(`\nSTABLE vs THE WHOLE POOL · n~${stableRows[0].n} per pet per column`);
console.log('pet             role      lv   now%    at Lv.7   gain   per level');
console.log('-'.repeat(72));
for (const r of stableRows) {
  console.log(
    (r.name + star(r.id)).padEnd(16), r.role.padEnd(8), String(r.level).padStart(2),
    r.now.toFixed(1).padStart(6), r.max.toFixed(1).padStart(9),
    ((r.gain >= 0 ? '+' : '−') + Math.abs(r.gain).toFixed(1)).padStart(7),
    (r.levels > 0 ? `${r.perLevel >= 0 ? '+' : '−'}${Math.abs(r.perLevel).toFixed(2)}` : '—').padStart(10),
  );
}

console.log('\n* Bubble Trouble (Affinity) / Dovey measured with BOTH passives assumed'
  + '\n  online (Max SPC x1.5, +20 Max ATK). A best case, not a typical one.\n');

console.log('===JSON===');
console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  scale: SCALE,
  samples: { duelsPerPair: DUELS_PER_PAIR, rosterMatches: ROSTER_MATCHES, stableMatches: STABLE_MATCHES },
  assumption: {
    unit: ASSUMED,
    note: 'Both passives assumed online: Max SPC x1.5 (Lovey Dovey), +20 Max ATK (Surface Tension).',
  },
  species: speciesRows,
  stable: stableRows,
}, null, 2));
