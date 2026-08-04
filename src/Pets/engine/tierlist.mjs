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
const applyAssumption = (unitId, stats, level) => {
  if (!isBlueBubble(unitId)) return stats;
  const out = { ...stats, spc: Math.round(stats.spc * 1.5) };   // Lovey Dovey, Lv.1
  if (level >= 5) out.atk += 20;                                // Surface Tension, Lv.5
  return out;
};

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
    }, level),
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
  return { instanceId: `${id}-${tag}`, speciesId: id, level: to, stats: applyAssumption(id, stats, to) };
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
const STABLE_MATCHES = 2200 * SCALE;
const MAX_LEVEL = 7;

/**
 * Every level from authored to the cap, one measurement each.
 *
 * A straight-line `(cap − now) / levels` average is WRONG for this game and it
 * cost a whole report: level-ups are a staircase, not a ramp, because the Lv.5
 * passive is a cliff. Averaging across the span hid an 11-point single-level
 * jump on the Bubble Troubles and mis-ranked the entire investment list. Price
 * each step and the cliff shows itself.
 */
const measureAt = (members, n = STABLE_MATCHES) => {
  let wins = 0; let games = 0;
  for (let m = 0; m < n; m += 1) {
    const mine = [
      ...members(),
      ...Array.from({ length: 5 - members().length }, (_, i) => speciesEntry(pick(ids), `a${i}`)),
    ];
    const foes = Array.from({ length: 5 }, (_, i) => speciesEntry(pick(ids), `b${i}`));
    const { winner } = simulateBattle({ team1: mine, team2: foes }).outcome;
    if (winner === null) continue;
    games += 1;
    if (winner === 0) wins += 1;
  }
  return { rate: (wins / games) * 100, games };
};

/** Bonded pets are also run as a pair — the only state their kit works in. */
const BONDED = STABLE_IDS.filter((id) => (PET_DB[id].bond));

const curveFor = (label, build, from) => {
  const points = [];
  for (let lv = from; lv <= MAX_LEVEL; lv += 1) {
    const { rate: r, games } = measureAt(() => build(lv));
    const step = points.length ? r - points[points.length - 1].rate : 0;
    points.push({ level: lv, rate: r, step, games });
    console.error(`  ${label} Lv.${lv} → ${r.toFixed(1)}%`);
  }
  return points;
};

console.error('· stable level curves...');
const curves = {};
for (const id of STABLE_IDS) {
  curves[id] = curveFor(PET_DB[id].name, (lv) => [stableEntry(id, 'lead', lv)], PET_DB[id].level ?? 1);
}

console.error('· bonded pair curve...');
const pairFrom = Math.min(...BONDED.map((id) => PET_DB[id].level ?? 1));
const pairCurve = BONDED.length === 2
  ? curveFor('Pair', (lv) => BONDED.map((id, i) => stableEntry(id, `b${i}`, lv)), pairFrom)
  : [];

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

const summarise = (id, points, name, role) => {
  const first = points[0];
  const last = points[points.length - 1];
  const steps = points.slice(1);
  const best = steps.reduce((b, p) => (p.step > (b?.step ?? -Infinity) ? p : b), null);
  return {
    id, name, role,
    level: first.level,
    now: first.rate,
    max: last.rate,
    gain: last.rate - first.rate,
    nextStep: steps[0]?.step ?? 0,
    nextLevel: steps[0]?.level ?? first.level,
    bestStep: best?.step ?? 0,
    bestStepAt: best?.level ?? null,
    points: points.map((p) => ({ level: p.level, rate: p.rate, step: p.step })),
    n: first.games,
    assumed: isBlueBubble(id),
  };
};

const stableRows = STABLE_IDS
  .map((id) => summarise(id, curves[id], PET_DB[id].name, ROLE_META[PET_DB[id].role].short))
  .sort((a, b) => b.bestStep - a.bestStep);

console.log(`\nSTABLE vs THE WHOLE POOL · n~${stableRows[0].n} per level · ranked by biggest single-level jump`);
console.log('pet             role      lv   now%    Lv.7    next lv   BIGGEST JUMP');
console.log('-'.repeat(78));
for (const r of stableRows) {
  console.log(
    (r.name + star(r.id)).padEnd(16), r.role.padEnd(8), String(r.level).padStart(2),
    r.now.toFixed(1).padStart(6), r.max.toFixed(1).padStart(7),
    ((r.nextStep >= 0 ? '+' : '−') + Math.abs(r.nextStep).toFixed(1)).padStart(9),
    (r.bestStepAt ? `${r.bestStep >= 0 ? '+' : '−'}${Math.abs(r.bestStep).toFixed(1)} at Lv.${r.bestStepAt}` : '—').padStart(15),
  );
}

if (pairCurve.length) {
  console.log('\nTHE BONDED PAIR, fielded together (no assumption — the bond is genuinely live)');
  console.log('  level   win%    step');
  for (const p of pairCurve) {
    console.log(`  Lv.${String(p.level).padEnd(3)} ${p.rate.toFixed(1).padStart(6)}  ${p.step ? (p.step >= 0 ? '+' : '−') + Math.abs(p.step).toFixed(1) : '—'}`);
  }
}

console.log('\n* Bubble Trouble (Affinity) / Dovey measured with BOTH passives assumed'
  + '\n  online (Max SPC x1.5, +20 Max ATK). A best case, not a typical one.\n');

console.log('===JSON===');
console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  scale: SCALE,
  samples: { duelsPerPair: DUELS_PER_PAIR, rosterMatches: ROSTER_MATCHES, stableMatchesPerLevel: STABLE_MATCHES },
  assumption: {
    unit: ASSUMED,
    note: 'Both passives assumed online: Max SPC x1.5 (Lovey Dovey), +20 Max ATK (Surface Tension).',
  },
  species: speciesRows,
  stable: stableRows,
  bondedPair: pairCurve.map((p) => ({ level: p.level, rate: p.rate, step: p.step })),
}, null, 2));
