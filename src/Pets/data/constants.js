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
  [ROLE.SUPPORT]:      { label: 'Support',        short: 'SUPP',    hex: '#fbbf24', blurb: 'Backline utility. Banks half its Special charge even while benched.' },
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
  /** Max DEF lost per stack of Damp. */
  DAMP_DEF_PENALTY: 5,
  /**
   * Fraction of its own SPC roll a benched Support banks each of its team's
   * turns. This is a property of the ROLE, not of any passive — it is what
   * makes holding a Support in reserve a real tactical choice instead of a
   * dead roster slot. Do not move it back behind a passive.
   */
  SUPPORT_BENCH_SHARE: 0.5,
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
