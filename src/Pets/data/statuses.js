/**
 * @file statuses.js
 * @description Registry of every status effect. The engine reads these
 * declaratively — it never branches on a status id by name, so a new status is
 * a new entry here plus whatever ability references it.
 *
 * Fields:
 *   kind        'debuff' blocks on debuff immunity (Thick Fur); 'buff' never does.
 *   stackable   false collapses to a single stack.
 *   defMod      (pet, stacks) => multiplier/flat pipeline entry, see combatant.js
 *   tickOnTurn  rolled at the owner's turn start (Burn).
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
    desc: 'Max DEF is halved. One stack is consumed each time you are attacked.',
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
    desc: 'When you would deal damage, each stack has a 50% chance to null it and be consumed.',
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
    desc: 'Max DEF reduced by 10 per stack. Cleared when you take damage.',
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
};

export const statusDef = (id) => STATUS_DEFS[id] ?? {
  id, name: id, icon: '❓', kind: 'debuff', stackable: true, tone: '#a8a29e', desc: '',
};

/** Statuses that Thick Fur and similar immunities refuse. */
export const isDebuff = (id) => statusDef(id).kind === 'debuff';
