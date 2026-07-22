import { memo } from 'react';
import { statusDef } from '../data/index.js';

/**
 * Every die the game rolls is shown the same way: a card over the pet it
 * belongs to, one bar per die, bar height = roll ÷ scale.
 *
 * Two readability decisions:
 *  - Opposed rolls share one scale (the larger of the two die sizes), so the
 *    ATK and DEF bars are directly comparable and the taller bar is simply the
 *    winner. Scaling each card to its own die made a 30-on-d40 look bigger than
 *    a 45-on-d50, which is backwards.
 *  - Status checks draw a dashed threshold line at the trigger value. A burn
 *    fires on a 1 of d6, so "low bar wins" reads backwards without it; with the
 *    line, at-or-below means it goes off and you need to know nothing else.
 */

function Bar({ value, scale, muted, threshold, lit }) {
  return (
    <div className={`pb-bar ${muted ? 'is-muted' : ''} ${lit ? 'is-lit' : ''}`}>
      <i style={{ height: `${Math.max(4, Math.min(100, (value / scale) * 100))}%` }} />
      {threshold != null && (
        <span className="pb-bar__line" style={{ bottom: `${(threshold / scale) * 100}%` }} />
      )}
    </div>
  );
}

function DiceRow({ dice, scale, threshold }) {
  return (
    <div className="pb-roll__dice">
      {dice.map((die, i) => (
        <div key={i} className="pb-roll__slot">
          <Bar value={die.value} scale={scale} muted={die.muted} threshold={threshold} lit={die.lit} />
          <span className={`pb-roll__num ${die.muted ? 'is-dropped' : ''}`}>{die.value}</span>
          {die.label && <span className={`pb-roll__tick ${die.muted ? 'is-dropped' : ''}`}>{die.label}</span>}
        </div>
      ))}
    </div>
  );
}

/* Advantage stacks, so the tag reports the net number of steps. */
const tagFor = (kind, advantage) => {
  if (advantage > 1) return `${kind} · ADV ×${advantage}`;
  if (advantage === 1) return `${kind} · ADV`;
  if (advantage < -1) return `${kind} · DIS ×${-advantage}`;
  if (advantage === -1) return `${kind} · DIS`;
  return kind;
};

function RollCard({ roll, kind, side, scale }) {
  const { rolls, kept, max, advantage, reasons } = roll;
  const contested = rolls.length > 1;
  const keptIndex = rolls.indexOf(kept);

  const dice = rolls.map((value, i) => ({
    value,
    muted: contested && i !== keptIndex,
    label: contested ? (i === keptIndex ? 'KEPT' : 'DROP') : null,
  }));

  return (
    <div className={`pb-roll pb-roll--${side === 0 ? 'p1' : 'p2'} pb-roll--${kind.toLowerCase()}`}>
      <span className="pb-roll__tag">{tagFor(kind, advantage)}</span>
      <span className="pb-roll__value">{kept}</span>
      <span className="pb-roll__max">d{max}</span>
      {reasons?.length > 0 && <span className="pb-roll__why">{reasons.join(' · ')}</span>}
      <DiceRow dice={dice} scale={scale} />
    </div>
  );
}

/** The opposed roll, both cards on a shared scale. */
export const RollCards = memo(function RollCards({ event }) {
  const { attacker, defender, trueStrike } = event;
  const scale = trueStrike ? attacker.max : Math.max(attacker.max, defender.max);

  return (
    <>
      <RollCard roll={attacker} kind="ATK" side={attacker.side} scale={scale} />
      {trueStrike ? (
        <div className={`pb-roll pb-roll--${defender.side === 0 ? 'p1' : 'p2'} pb-roll--true`}>
          <span className="pb-roll__tag">Truestrike</span>
          <span className="pb-roll__value">—</span>
          <span className="pb-roll__max">cannot block</span>
        </div>
      ) : (
        <RollCard roll={defender} kind="DEF" side={defender.side} scale={scale} />
      )}
    </>
  );
});

/* ── STATUS CHECKS ───────────────────────────────────────────────── */

const SUMMARY = {
  burn: (e) => (e.damage > 0 ? `−${e.damage}` : 'safe'),
  paralyzed: (e) => (e.skipped ? 'seized' : 'clear'),
  cursed: (e) => (e.nullified ? 'nulled' : 'holds'),
};

/**
 * A status rolling against its owner. One bar per stack, so three burn stacks
 * are three bars and you can see at a glance which of them caught.
 */
export const CheckCard = memo(function CheckCard({ event }) {
  const def = statusDef(event.status);
  const procs = new Set(event.procValues ?? [1]);
  const threshold = Math.max(...procs);

  const dice = event.rolls.map((value) => ({
    value,
    lit: procs.has(value),
    muted: !procs.has(value),
    label: procs.has(value) ? '✦' : null,
  }));

  const summary = (SUMMARY[event.status] ?? (() => ''))(event);

  return (
    <div
      className={`pb-roll pb-roll--${event.side === 0 ? 'p1' : 'p2'} pb-roll--check`}
      style={{ '--tone': def.tone }}
    >
      <span className="pb-roll__tag">
        {def.icon} {def.name}{event.rolls.length > 1 ? ` ×${event.rolls.length}` : ''}
      </span>
      <span className="pb-roll__value pb-roll__value--word">{summary}</span>
      <span className="pb-roll__max">{threshold} or less on d{event.dieSize}</span>
      <DiceRow dice={dice} scale={event.dieSize} threshold={threshold} />
    </div>
  );
});
