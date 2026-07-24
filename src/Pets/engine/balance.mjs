/**
 * Headless balance + regression harness.
 *
 *   node src/Pets/engine/balance.mjs            # full report
 *   node src/Pets/engine/balance.mjs 5000       # more samples
 *   node src/Pets/engine/balance.mjs 2000 5     # at level 5, so the second
 *                                                passive of every pet is online
 *
 * Because the simulator is pure, thousands of matches resolve in well under a
 * second with no browser involved. Run this after adding a pet: it will surface
 * a crash, an ability that never terminates, or a win rate that is obviously
 * out of line before any of it reaches the arena.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { simulateBattle } from './simulate.js';
import { createCombatant, defenseDie, attackDie, addStacks } from './combatant.js';
import { PET_DB, SPECIES, RULES, ROLE, ABILITIES, PASSIVES, STATUS, STATUS_DEFS } from '../data/index.js';

const SAMPLES = Number(process.argv[2]) || 2000;
/** Level every pet is tested at. Level 5 is where the second passive lands. */
const LEVEL = Math.min(RULES.MAX_LEVEL, Math.max(1, Number(process.argv[3]) || 1));
const ids = Object.keys(SPECIES);

/**
 * Level-ups grant 1d4 to one random die, four times over on the way to level 5.
 * Rolling that per instance would put variance in the table that has nothing to
 * do with the species, so above level 1 every die simply gets a flat +3 — the
 * standing estimate for three stat-ups' worth of growth. No Natures either, so
 * the table measures the species and not a particular roll of one.
 */
const LEVEL_STAT_BONUS = 3;

const entryFor = (speciesId, index, level = LEVEL) => {
  const species = PET_DB[speciesId];
  const at = species.level ?? level;
  const bump = at > 1 ? LEVEL_STAT_BONUS : 0;
  return {
    instanceId: `${speciesId}-${index}`,
    speciesId,
    level: at,
    stats: {
      hp: species.base.hp,
      atk: species.base.atk + bump,
      def: species.base.def + bump,
      spc: species.base.spc + bump,
    },
  };
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const randomTeam = (size, tag, level = LEVEL) =>
  Array.from({ length: size }, (_, i) => entryFor(pick(ids), `${tag}${i}`, level));

/* ── 1. FULL-ROSTER FUZZ ─────────────────────────────────────────── */

let draws = 0;
let capped = 0;
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
  if (result.outcome.reason === 'timeout') capped += 1;
  longest = Math.max(longest, result.turns);
  totalTurns += result.turns;
  totalEvents += result.timeline.length;
}
console.timeEnd('fuzz');

console.log(`\n${SAMPLES} random 5v5 matches`);
console.log(`  avg turns    ${(totalTurns / SAMPLES).toFixed(1)}`);
console.log(`  longest      ${longest}${longest >= RULES.MAX_TURNS ? '  <-- HIT THE TURN CAP' : ''}`);
console.log(`  avg events   ${Math.round(totalEvents / SAMPLES)}`);
console.log(`  draws        ${draws} (${((draws / SAMPLES) * 100).toFixed(1)}%) — ${capped} at the turn cap, ${draws - capped} mutual wipeouts`);

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

console.log(
  `\nSolo win rate (level ${LEVEL}, no Natures${LEVEL > 1 ? `, +${LEVEL_STAT_BONUS} to every die` : ''})`,
);
Object.entries(record)
  .map(([id, { wins, games }]) => ({ id, rate: (wins / games) * 100, games }))
  .sort((a, b) => b.rate - a.rate)
  .forEach(({ id, rate, games }) => {
    const bar = '█'.repeat(Math.round(rate / 2)).padEnd(50, '·');
    console.log(`  ${id.padEnd(26)} ${rate.toFixed(1).padStart(5)}%  ${bar}  n=${games}`);
  });

/* ── 2b. 5v5 ROSTER CONTRIBUTION ─────────────────────────────────── */

/**
 * A 1v1 duel cannot see anything that reads the bench — Support charge, chain
 * damage, ally healing — so the pets built around it look broken in the solo
 * table however well they play. This measures the opposite thing: across random
 * 5v5s, how often does the side holding this species win? Mirrors are skipped so
 * a pet is never scored against itself.
 */
{
  const teamRecord = Object.fromEntries(ids.map((id) => [id, { wins: 0, games: 0 }]));
  const matches = Math.max(2000, SAMPLES);

  for (let i = 0; i < matches; i += 1) {
    const team1 = randomTeam(RULES.TEAM_SIZE, 'w');
    const team2 = randomTeam(RULES.TEAM_SIZE, 'v');
    const { outcome } = simulateBattle({ team1, team2 });
    if (outcome.winner === null) continue;

    const on = [new Set(team1.map((p) => p.speciesId)), new Set(team2.map((p) => p.speciesId))];
    for (const id of ids) {
      const left = on[0].has(id);
      const right = on[1].has(id);
      if (left === right) continue; // absent from both, or on both
      teamRecord[id].games += 1;
      if ((left && outcome.winner === 0) || (right && outcome.winner === 1)) teamRecord[id].wins += 1;
    }
  }

  console.log(`\n5v5 roster win rate — how often the side fielding this pet wins (${matches} matches)`);
  Object.entries(teamRecord)
    .map(([id, { wins, games }]) => ({ id, rate: games ? (wins / games) * 100 : 0, games }))
    .sort((a, b) => b.rate - a.rate)
    .forEach(({ id, rate, games }) => {
      const bar = '█'.repeat(Math.max(0, Math.round((rate - 35) * 2))).padEnd(30, '·');
      console.log(`  ${id.padEnd(26)} ${rate.toFixed(1).padStart(5)}%  ${bar}  n=${games}`);
    });
}

/* ── 3. RULE ASSERTIONS ──────────────────────────────────────────── */

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });

check('Hellhound (Affinity) special rolls at 200% ATK', ABILITIES.hellfire_bolt.atkScale === 2);
check('Hellhound (Physical) special rolls at 200% ATK', ABILITIES.rending_bite.atkScale === 2);
check('Heat Up does not heal', !JSON.stringify(ABILITIES.heat_up).includes('heal'));
check('Bubble Shield does not heal', !JSON.stringify(ABILITIES.bubble_shield).includes('heal'));
// Presets are draftable too and inherit whatever their base species points at,
// so they have to be checked alongside it — a retired passive that only a
// preset still referenced would otherwise slip through.
{
  const units = Object.values(PET_DB);
  check('Every unit has a registered Special', units.every((u) => ABILITIES[u.special]));
  check(
    'Every unit has registered passives',
    units.every((u) => (u.passives ?? []).every((p) => PASSIVES[p])),
  );
}
// Not just "looks like a path" — the file has to be on disk. Renaming artwork
// is otherwise silent until someone opens the builder and sees a broken image.
{
  const units = Object.values(PET_DB);
  const missing = units.filter((u) => !existsSync(join('public', u.art ?? '')));
  check(
    `Every unit's artwork exists on disk (${units.length} files)`,
    units.every((u) => typeof u.art === 'string' && u.art.endsWith('.webp')) && missing.length === 0,
  );
  if (missing.length) for (const u of missing) console.log(`        missing: ${u.id} -> ${u.art}`);
}
// Statuses are read peripherally off each pet's flank, so two of them sharing
// an icon makes the HUD ambiguous at a glance.
{
  const icons = Object.values(STATUS_DEFS).map((d) => d.icon);
  check('No two statuses share an icon', new Set(icons).size === icons.length);
}
check('No match exceeded the turn cap', longest < RULES.MAX_TURNS);
check('No match ended by running out of turns', capped === 0);

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
      const nextTurnIndex = timeline.findIndex((ev, i) => i > e && ev.type === 'turn_start');
      if (nextTurnIndex === -1) continue;

      // If the other side went down on the same step — a reactive passive can
      // take the attacker with it — the rule is that whichever was resolved
      // last takes the turn, so this faint proves nothing either way.
      const tradedOff = timeline
        .slice(e + 1, nextTurnIndex)
        .some((ev) => ev.type === 'faint' && ev.side !== downed);
      if (tradedOff) continue;

      checked += 1;
      if (timeline[nextTurnIndex].side !== downed) wrong += 1;
    }
  }
  check(`Knockout hands the next turn to the downed side (${checked} switch-ins)`, checked > 0 && wrong === 0);
}

// Rule sweep over a big sample of real matches.
{
  let benchGains = 0;      // charge a benched pet had no right to
  let supportBenchGains = 0; // the Support role paying out from the bench
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
          if (entry.slot === lead || entry.amount <= 0) continue;

          const pet = e.state.teams[entry.side][entry.slot];
          const isSupport = SPECIES[pet.speciesId]?.role === ROLE.SUPPORT;

          // Legal ways for a benched pet to gain charge: a passive, a bond
          // share, inheriting a fallen ally's meter, or being a Support.
          const allowed = entry.source === 'bond' || entry.source === 'passive'
            || entry.source === 'inherit' || (entry.source === 'role' && isSupport);
          if (!allowed) benchGains += 1;
          if (entry.source === 'role' && isSupport) supportBenchGains += 1;
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

  check('Benched charge only comes from the Support role, a passive or a bond', benchGains === 0);
  check(
    `A benched Support still generates Special charge (${supportBenchGains} payouts)`,
    supportBenchGains > 0,
  );

  check(`Ties on ATK vs DEF go to the attacker (${sawTie} ties seen)`, sawTie > 0 && tieLosses === 0);
  check(`Dice rolled always equal 1 + |net advantage| (${sawStacked} stacked rolls)`, diceMismatch === 0);
  check('Advantage stacks beyond a single step', sawStacked > 0);
  check('Cursed rolls exactly one die regardless of stacks', curseMultiRoll === 0);
  check(`Thick Fur does not refuse Stagnation (${sawStagnation} applications)`, stagBlocked === 0);
}

/* ── SECOND-WAVE RULES ───────────────────────────────────────────── */
{
  let stuntCasts = 0;     // a Special that fired while its caster held Stunt
  let sawStunt = 0;
  let bleedKept = 0;      // a Bleed stack that proc'd without burning off
  let sawBleedProc = 0;
  let rendConsumed = 0;   // a Rend stack that fell off from being attacked
  let stagAfterDamage = 0; // the stall clock still running after HP fell
  let sawDamageTurn = 0;
  let deadSwitchIns = 0;  // a switch-in that put a fainted pet on the field
  let sawSwitchIn = 0;
  let sawHeartHeal = 0;   // the Healer role cashing counters in
  let sawForced = 0;      // a switch that was not caused by a knockout
  let sawOverheal = 0;    // a pet carrying hearts above its Max HP
  let boneShieldDef = 0;  // Bone Shield actually raising the DEF die
  let sawBoneShield = 0;
  let defBasedRolls = 0;  // a Special that swings with Max DEF instead of Max ATK

  // Advantage and Disadvantage are spent one stack per attack, so every roll
  // that names one must be matched by exactly one expiry.
  const advRolls = { [STATUS.ADVANTAGE]: 0, [STATUS.DISADVANTAGE]: 0 };
  const advExpiries = { [STATUS.ADVANTAGE]: 0, [STATUS.DISADVANTAGE]: 0 };

  const stacksOn = (state, side, slot, id) =>
    state.teams[side][slot].statuses.find((s) => s.id === id)?.stacks ?? 0;

  // Always at level 5, whatever the report is running at: several of these
  // rules only exist once the second passive is online.
  for (let i = 0; i < 200; i += 1) {
    const { timeline } = simulateBattle({
      team1: randomTeam(RULES.TEAM_SIZE, 'm', 5),
      team2: randomTeam(RULES.TEAM_SIZE, 'n', 5),
    });

    let prevHp = null;
    for (let idx = 0; idx < timeline.length; idx += 1) {
      const e = timeline[idx];
      if (e.type === 'action' && e.kind === 'special'
          && stacksOn(e.state, e.side, e.slot, STATUS.STUNT) > 0) stuntCasts += 1;
      if (e.type === 'status_apply' && e.status === STATUS.STUNT) sawStunt += 1;

      // Bleed is Burn-shaped: a stack that fires is spent.
      if (e.type === 'status_tick' && e.status === STATUS.BLEED) {
        const procs = e.rolls.filter((r) => e.procValues.includes(r)).length;
        if (procs > 0) {
          sawBleedProc += 1;
          if (e.cleared !== procs) bleedKept += 1;
        }
      }

      // Rend does not wear off any more. A cleanse may still strip it, and
      // announces itself with a CLEANSED beat on the same pet.
      if (e.type === 'status_expire' && e.status === STATUS.REND) {
        const cleansed = timeline.slice(idx + 1, idx + 8).some(
          (ev) => ev.type === 'passive' && ev.text === 'CLEANSED'
            && ev.side === e.side && ev.slot === e.slot,
        );
        if (!cleansed) rendConsumed += 1;
      }

      // The stall clock must go back to zero on any turn that follows HP loss.
      if (e.type === 'turn_start') {
        const hp = e.state.teams.flat().reduce((n, p) => n + p.hp, 0);
        if (prevHp !== null && hp < prevHp) {
          sawDamageTurn += 1;
          if (e.state.stagnation.counter !== 0) stagAfterDamage += 1;
        }
        prevHp = hp;
      }

      if (e.type === 'switch_in') {
        sawSwitchIn += 1;
        if (e.label) sawForced += 1;
        if (e.state.teams[e.side][e.slot].fainted) deadSwitchIns += 1;
      }

      if (e.type === 'heal' && e.label === 'Heart Counters') sawHeartHeal += 1;

      if (e.type === 'status_apply' && e.status === STATUS.BONE_SHIELD) sawBoneShield += 1;

      // Shell Slam rolls off Max DEF, so a d20-ATK turtle must out-roll its own
      // attack die by a wide margin when it casts.
      if (e.type === 'action' && e.ability === 'shell_slam') {
        const pet = e.state.teams[e.side][e.slot];
        if (pet.baseDefDie > pet.baseAtkDie) defBasedRolls += 1;
      }

      // Bench support can carry an ally past its Max HP; those extra hearts
      // have to survive the trip onto the field.
      for (const team of e.state.teams) {
        for (const pet of team) if (pet.hp > pet.maxHp) sawOverheal += 1;
      }

      if (e.type === 'roll' && e.attacker?.reasons) {
        for (const id of [STATUS.ADVANTAGE, STATUS.DISADVANTAGE]) {
          if (e.attacker.reasons.includes(STATUS_DEFS[id].name)) advRolls[id] += 1;
        }
      }
      if (e.type === 'status_expire' && advExpiries[e.status] !== undefined) advExpiries[e.status] += 1;
    }
  }

  check(`Stunt stops a Special even at a full meter (${sawStunt} applications)`,
    sawStunt > 0 && stuntCasts === 0);
  check(`A Bleed stack that fires is spent (${sawBleedProc} procs)`,
    sawBleedProc > 0 && bleedKept === 0);
  check('Rend only ever leaves via a cleanse, never by being attacked', rendConsumed === 0);
  check(`The stagnation clock resets whenever HP falls (${sawDamageTurn} turns after damage)`,
    sawDamageTurn > 0 && stagAfterDamage === 0);
  check(`A switch-in never fields a fainted pet (${sawSwitchIn} entries)`,
    sawSwitchIn > 0 && deadSwitchIns === 0);
  check(`A Special can drag a benched pet onto the field (${sawForced} forced switches)`,
    sawForced > 0);
  check(`Advantage is spent one stack per attack (${advRolls[STATUS.ADVANTAGE]} rolls)`,
    advRolls[STATUS.ADVANTAGE] > 0 && advExpiries[STATUS.ADVANTAGE] === advRolls[STATUS.ADVANTAGE]);
  check(`Disadvantage is spent one stack per attack (${advRolls[STATUS.DISADVANTAGE]} rolls)`,
    advRolls[STATUS.DISADVANTAGE] > 0 && advExpiries[STATUS.DISADVANTAGE] === advRolls[STATUS.DISADVANTAGE]);
  check(`The Healer role converts counters into hearts (${sawHeartHeal} heals)`, sawHeartHeal > 0);
  check('Bench support can push an ally above its Max HP', sawOverheal > 0);
  check(`Bone Shield reaches the field (${sawBoneShield} applications)`, sawBoneShield > 0);
  check(`A Special can roll off Max DEF instead of Max ATK (${defBasedRolls} casts)`,
    defBasedRolls > 0);
}

// Derived-stat maths, checked directly rather than inferred from a fuzz run,
// where Rend or Damp landing on the same pet would muddy the comparison.
{
  const turtle = createCombatant(entryFor('dragon_turtle', 'unit', 1), 0, 0);
  const plainDef = defenseDie(turtle);
  addStacks(turtle, STATUS.BONE_SHIELD, 2);
  const shieldedDef = defenseDie(turtle);
  check(
    `Bone Shield adds 5 Max DEF per stack (d${plainDef} -> d${shieldedDef})`,
    shieldedDef === plainDef + 10,
  );

  const boar = createCombatant(entryFor('bone_boar', 'unit', 1), 0, 0);
  check(
    'Bone Shield is a buff, so Thick Fur would not refuse it',
    STATUS_DEFS[STATUS.BONE_SHIELD].kind === 'buff' && boar.debuffImmune === false,
  );

  // Shell Slam swings with the shell: 2x Max DEF, not 2x Max ATK. Rolled on a
  // clean pet, because the shielded one above is deliberately inflated.
  const slam = ABILITIES.shell_slam;
  const fresh = createCombatant(entryFor('dragon_turtle', 'slam', 1), 0, 0);
  const slamDie = attackDie(fresh, { scale: slam.atkScale, fromDef: true });
  check(
    `Shell Slam rolls 2x Max DEF (d${slamDie}, against a d${fresh.stats.atk} attack die)`,
    slam.atkFromDef === true && slamDie === fresh.stats.def * 2,
  );

  // ...and Bone Shield feeds that too, since it raises Max DEF.
  check(
    `Bone Shield carries into a DEF-based Special (d${attackDie(turtle, { scale: slam.atkScale, fromDef: true })})`,
    attackDie(turtle, { scale: slam.atkScale, fromDef: true }) === (turtle.stats.def + 10) * 2,
  );
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
