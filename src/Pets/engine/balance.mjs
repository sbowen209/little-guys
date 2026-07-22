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
