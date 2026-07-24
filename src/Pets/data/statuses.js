/**
 * @file statuses.js
 * @description Registry of every status effect. The engine reads these
 * declaratively — it never branches on a status id by name, so a new status is
 * a new entry here plus whatever ability references it.
 *
 * Fields:
 *   kind        'debuff' blocks on debuff immunity (Thick Fur); 'buff' never does.
 *   stackable   false collapses to a single stack.
 *
 * ── DECLARATIVE BEHAVIOUR ──────────────────────────────────────────
 * The engine honours the fields below generically, so a status that only needs
 * these is pure data — no engine file has to change to add it.
 *
 *   attackAdvantage   number folded into the owner's net advantage when it attacks
 *   defBonus          flat Max DEF added per stack
 *   damageFloor       the owner's attacks deal at least this much damage
 *   blocksSpecial     the owner cannot spend its Special meter
 *   thorns            damage reflected at whoever damages the owner with an attack
 *   spcDice           dice rolled for Special charge instead of one; all are summed
 *   spcMult           multiplier on the Special die size for the roll
 *   tickOnTurn        { dieSize, procValues, damage, clearOnProc } rolled per stack
 *                     at the owner's turn start
 *
 * ── DECLARATIVE EXPIRY ─────────────────────────────────────────────
 *   consumeOnAttack   stacks removed after the owner attacks, hit or miss
 *   consumeOnHit      stacks removed only after an attack that lands
 *   consumeOnDamaged  stacks removed when the owner is damaged
 *   consumeOnSpcRoll  stacks removed after the owner rolls for Special charge
 *   expireAtTurnEnd   stacks removed at the end of the owner's own turn
 *   clearOnExit       cleared entirely when the owner leaves the field
 *
 * Burn, Rend, Fade, Cursed, Bubble Shield, Damp, Shed and Stagnation predate
 * this and are still resolved bespoke in the engine — their interactions with
 * the defence pipeline and with Burn potency do not reduce to these fields.
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
  ZAPTAP: 'zaptap',
  ADVANTAGE: 'advantage',
  DISADVANTAGE: 'disadvantage',
  ENERGIZED: 'energized',
  STUNT: 'stunt',
  POWERFUL: 'powerful',
  BLEED: 'bleed',
  BONE_SHIELD: 'bone_shield',
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
    desc: 'Max DEF is halved. Does not wear off.',
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
    desc: 'Max DEF reduced by 5 per stack. Cleared when you take damage.',
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

  /* ── Declarative statuses ───────────────────────────────────────── */

  [STATUS.ZAPTAP]: {
    id: STATUS.ZAPTAP,
    name: 'Zaptap',
    icon: '🌩️',
    kind: 'buff',
    stackable: true,
    tone: '#facc15',
    desc: 'When damaged by an attack, deal 1 damage back to the attacker. One stack is consumed.',
    thorns: 1,
    consumeOnDamaged: 1,
  },
  [STATUS.ADVANTAGE]: {
    id: STATUS.ADVANTAGE,
    name: 'Advantage',
    icon: '🔼',
    kind: 'buff',
    stackable: true,
    tone: '#4ade80',
    desc: 'Your next attack rolls with Advantage. One stack is consumed per attack.',
    attackAdvantage: 1,
    consumeOnAttack: 1,
  },
  [STATUS.DISADVANTAGE]: {
    id: STATUS.DISADVANTAGE,
    name: 'Disadvantage',
    icon: '🔽',
    kind: 'debuff',
    stackable: true,
    tone: '#fb7185',
    desc: 'Your next attack rolls with Disadvantage. One stack is consumed per attack.',
    attackAdvantage: -1,
    consumeOnAttack: 1,
  },
  [STATUS.ENERGIZED]: {
    id: STATUS.ENERGIZED,
    name: 'Energized',
    icon: '🔋',
    kind: 'buff',
    stackable: true,
    tone: '#22d3ee',
    desc: 'Roll your Special die twice and bank both. One stack is consumed per roll.',
    spcDice: 2,
    consumeOnSpcRoll: 1,
  },
  [STATUS.STUNT]: {
    id: STATUS.STUNT,
    name: 'Stunt',
    icon: '🚫',
    kind: 'debuff',
    stackable: true,
    tone: '#f97316',
    desc: 'You cannot cast your Special, even at a full meter. One stack falls off at the end of your turn.',
    blocksSpecial: true,
    expireAtTurnEnd: 1,
  },
  [STATUS.POWERFUL]: {
    id: STATUS.POWERFUL,
    name: 'Powerful',
    icon: '💥',
    kind: 'buff',
    stackable: true,
    tone: '#f59e0b',
    desc: 'Your attacks deal at least 2 damage. One stack is consumed per attack that lands.',
    damageFloor: 2,
    consumeOnHit: 1,
  },
  [STATUS.BLEED]: {
    id: STATUS.BLEED,
    name: 'Bleed',
    icon: '🩹',
    kind: 'debuff',
    stackable: true,
    tone: '#dc2626',
    desc: 'At the start of your turn, roll 1d4 per stack. Each 1 deals 1 damage and clears that stack.',
    tickOnTurn: { dieSize: 4, procValues: [1], damage: 1, clearOnProc: true },
  },
  [STATUS.BONE_SHIELD]: {
    id: STATUS.BONE_SHIELD,
    name: 'Bone Shield',
    icon: '🦴',
    kind: 'buff',
    stackable: true,
    tone: '#e7e5e4',
    desc: 'Grants +5 Max DEF per stack. One stack is stripped whenever an attack damages you.',
    defBonus: 5,
    consumeOnDamaged: 1,
  },
};

export const statusDef = (id) => STATUS_DEFS[id] ?? {
  id, name: id, icon: '❓', kind: 'debuff', stackable: true, tone: '#a8a29e', desc: '',
};

/** Statuses that Thick Fur and similar immunities refuse. */
export const isDebuff = (id) => statusDef(id).kind === 'debuff';
