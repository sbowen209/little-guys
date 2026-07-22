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
