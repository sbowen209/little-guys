/**
 * @file describe.js
 * @description Turns engine events into the words and floating text the player
 * sees. Keeping this out of the engine means the simulation stays a pure rules
 * model and the presentation can be reworded freely.
 */

import { EV } from '../engine/events.js';
import { statusDef } from '../data/index.js';

export const TONE = {
  charge: '#7dd3fc',
  damage: '#fb7185',
  heal: '#4ade80',
  block: '#34d399',
  buff: '#38bdf8',
  gold: '#fbbf24',
  curse: '#a855f7',
  burn: '#fb923c',
  mute: '#a8a29e',
  defend: '#facc15',
};

const petAt = (event, side, slot) => event.state?.teams?.[side]?.[slot ?? event.state.lead[side]];
const nameAt = (event, side, slot) => petAt(event, side, slot)?.name ?? 'Pet';

/* ── TICKER: one line describing the current beat ────────────────── */

export function tickerFor(event) {
  if (!event) return null;
  const who = (side = event.side, slot = event.slot) => nameAt(event, side, slot);

  switch (event.type) {
    case EV.BATTLE_START:
      return { text: 'Lineups locked. Initiative is decided by Max SPC.', hot: false };

    case EV.INITIATIVE:
      return {
        text: event.tie
          ? `Max SPC tied at d${event.spc[0]} — coin flip goes to ${event.names[event.side]}.`
          : `${event.names[event.side]} takes initiative (d${event.spc[event.side]} vs d${event.spc[event.side === 0 ? 1 : 0]}).`,
        hot: true,
      };

    case EV.TURN_START:
      return { text: `${who()}'s turn.`, hot: false };

    case EV.STATUS_TICK:
      return {
        text: event.damage > 0
          ? `${who()} burns for ${event.damage} — ${event.cleared} stack${event.cleared === 1 ? '' : 's'} spent.`
          : `${who()} shrugs off the flames.`,
        hot: event.damage > 0,
      };

    case EV.SKIP:
      return { text: `${who()} is ${event.reason} and loses the turn.`, hot: true };

    case EV.SPC_GAIN: {
      const main = event.entries?.[0];
      if (!main) return null;
      if (main.amount < 0) return { text: `${main.name} spends ${Math.abs(main.amount)} charge.`, hot: true };
      const extra = event.entries.length > 1 ? ` (+${event.entries.length - 1} more)` : '';
      return { text: `${main.name} builds ${main.amount} charge → ${main.total}/100${extra}.`, hot: false };
    }

    case EV.ACTION:
      return event.kind === 'special'
        ? { text: `${who()} unleashes ${event.name}!`, hot: true }
        : { text: `${who()} attacks.`, hot: false };

    case EV.ROLL: {
      if (event.trueStrike) return { text: 'TRUESTRIKE — the attack cannot be blocked.', hot: true };
      return {
        text: `ATK ${event.attacker.kept} vs DEF ${event.defender.kept} — ${event.hit ? 'it connects' : 'blocked'}.`,
        hot: event.hit,
      };
    }

    case EV.IMPACT:
      return { text: `${who()} takes ${event.amount}${event.cause ? ` from ${event.cause}` : ''}.`, hot: true };

    case EV.BLOCK:
      return { text: `${who()} turns the strike aside.`, hot: false };

    case EV.HEAL:
      return { text: `${who()} recovers ${event.amount}${event.label ? ` (${event.label})` : ''}.`, hot: false };

    case EV.STATUS_APPLY:
      return { text: `${who()} gains ${event.name}${event.stacks > 1 ? ` x${event.stacks}` : ''}.`, hot: true };

    case EV.STAT_MOD:
      return {
        text: `${who()} ${event.delta < 0 ? 'loses' : 'gains'} ${Math.abs(event.delta)} ${event.key.startsWith('atk') ? 'Max ATK' : 'Max DEF'}${event.label ? ` (${event.label})` : ''}.`,
        hot: false,
      };

    case EV.PASSIVE:
      return { text: `${event.label} triggers.`, hot: false };

    case EV.STAGNATION:
      return { text: 'Stagnation — the crowd turns. Both pets lose defence.', hot: true };

    case EV.FAINT:
      return { text: `${event.name} is knocked out.`, hot: true };

    case EV.SWITCH_IN:
      return { text: `${event.name} takes the field.`, hot: false };

    case EV.BATTLE_END:
      return {
        text: event.winner === null ? 'Time limit reached — the match is a draw.' : 'Match over.',
        hot: true,
      };

    default:
      return null;
  }
}

/* ── LOG: the persistent scrollback ──────────────────────────────── */

const LOGGED = new Set([
  EV.INITIATIVE, EV.ACTION, EV.ROLL, EV.IMPACT, EV.BLOCK, EV.HEAL,
  EV.STATUS_APPLY, EV.STATUS_TICK, EV.SKIP, EV.STAT_MOD, EV.FAINT,
  EV.SWITCH_IN, EV.STAGNATION, EV.PASSIVE, EV.BATTLE_END,
]);

export const isLogged = (event) => LOGGED.has(event.type);

export function logFor(event) {
  const line = tickerFor(event);
  return line?.text ?? null;
}

/* ── FLOATING COMBAT TEXT ────────────────────────────────────────── */

/**
 * Floating combat text.
 *
 * Kept to things that carry a number or a state change you cannot read off the
 * animation. "BLOCKED" is gone — the defender already visibly dodges and the
 * roll card already shows the miss, so the word was pure noise on top of two
 * clearer signals. Same for "RESISTED" and "FIRST STRIKE".
 */
export function floatsFor(event) {
  if (!event) return [];
  const at = (side, slot) => ({ side, slot: slot ?? event.state.lead[side] });

  switch (event.type) {
    case EV.IMPACT:
      return [{
        ...at(event.side, event.slot),
        text: `−${event.amount}`,
        tone: TONE.damage,
        size: event.amount >= 2 ? 'lg' : 'md',
      }];

    case EV.HEAL:
      return [{ ...at(event.side, event.slot), text: `+${event.amount}`, tone: TONE.heal, size: 'md' }];

    case EV.SPC_GAIN: {
      // The charge roll, shown as a number that drifts off the meter. Cheap
      // enough to never hold up the timeline.
      const main = event.entries?.find((e) => e.amount > 0);
      if (!main) return [];
      return [{ ...at(main.side, main.slot), text: `+${main.amount}`, tone: TONE.charge, size: 'chg' }];
    }

    case EV.STATUS_APPLY:
      return [{
        ...at(event.side, event.slot),
        text: event.name.toUpperCase() + (event.stacks > 1 ? ` ×${event.stacks}` : ''),
        tone: statusDef(event.status).tone,
        size: 'sm',
      }];

    case EV.SKIP:
      return [{ ...at(event.side, event.slot), text: event.text, tone: TONE.mute, size: 'md' }];

    case EV.STAT_MOD:
      return [{
        ...at(event.side, event.slot),
        text: `${event.key.startsWith('atk') ? 'ATK' : 'DEF'} ${event.delta > 0 ? '+' : ''}${event.delta}`,
        tone: event.delta > 0 ? TONE.heal : TONE.curse,
        size: 'sm',
      }];

    case EV.FAINT:
      return [{ ...at(event.side, event.slot), text: 'DOWN', tone: TONE.mute, size: 'lg' }];

    default:
      return [];
  }
}

/* ── SPRITE ANIMATION SELECTION ──────────────────────────────────── */

const RANGED_VFX = new Set(['firebolt', 'bolt', 'hex', 'shriek', 'flare', 'shatter']);
const PROJECTILE_COLOR = {
  firebolt: 'radial-gradient(circle, #fff 0%, #fde047 25%, #f97316 55%, rgba(239,68,68,0) 78%)',
  bolt: 'radial-gradient(circle, #fff 0%, #fef08a 28%, #38bdf8 58%, rgba(56,189,248,0) 80%)',
  hex: 'radial-gradient(circle, #fff 0%, #e9d5ff 24%, #a855f7 56%, rgba(168,85,247,0) 80%)',
  shriek: 'radial-gradient(circle, #fff 0%, #ddd6fe 26%, #7c3aed 58%, rgba(124,58,237,0) 80%)',
};

export const isRanged = (vfx) => RANGED_VFX.has(vfx);
export const projectileStyle = (vfx) => PROJECTILE_COLOR[vfx] ?? PROJECTILE_COLOR.firebolt;

/**
 * The most recent ACTION at or before the cursor — the view needs it during the
 * ROLL beat to know whether the attacker should lunge or cast.
 */
export function currentAction(timeline, index) {
  for (let i = index; i >= 0 && i > index - 12; i -= 1) {
    const event = timeline[i];
    if (event.type === EV.ACTION) return event;
    if (event.type === EV.TURN_START && i !== index) return null;
  }
  return null;
}

/** Which side owns the turn at the cursor, for highlighting the HUD. */
export function currentTurnSide(timeline, index) {
  for (let i = index; i >= 0; i -= 1) {
    const event = timeline[i];
    if (event.type === EV.TURN_START || event.type === EV.INITIATIVE) return event.side;
  }
  return null;
}

/** 1-based turn counter for the banner. */
export function currentTurnNumber(timeline, index) {
  for (let i = index; i >= 0; i -= 1) {
    if (timeline[i].type === EV.TURN_START) return timeline[i].turn;
  }
  return 1;
}

/**
 * Per-side sprite animation for the current event.
 *
 * Reserved for moments with weight: throwing an attack, being hit, casting,
 * going down, walking on. Charge ticks and status checks deliberately return
 * nothing — a pet lighting up every time it rolls its charge die made the whole
 * match strobe, and the number that floats off the meter says it better.
 */
export function animationsFor(event, action) {
  if (!event) return {};

  switch (event.type) {
    case EV.ACTION:
      if (event.effect) return { [event.side]: 'channel' };
      return { [event.side]: isRanged(event.vfx) ? 'cast' : 'windup' };

    case EV.ROLL:
      if (!action) return {};
      return { [action.side]: isRanged(action.vfx) ? 'cast' : 'lunge' };

    case EV.IMPACT:
      return { [event.side]: 'hit' };

    case EV.BLOCK:
      return { [event.side]: 'dodge' };

    case EV.FAINT:
      return { [event.side]: 'faint' };

    case EV.SWITCH_IN:
      return { [event.side]: 'enter' };

    default:
      return {};
  }
}
