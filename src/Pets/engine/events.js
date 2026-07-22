/**
 * @file events.js
 * @description The vocabulary the simulator speaks. A battle is a list of these;
 * the view is a pure function of the list plus a cursor. Adding a new visual
 * beat means adding a type here, not threading another flag through the engine.
 */

export const EV = {
  BATTLE_START: 'battle_start',
  INITIATIVE: 'initiative',
  SWITCH_IN: 'switch_in',
  TURN_START: 'turn_start',
  STATUS_TICK: 'status_tick',
  SKIP: 'skip',
  SPC_GAIN: 'spc_gain',
  ACTION: 'action',
  ROLL: 'roll',
  IMPACT: 'impact',
  BLOCK: 'block',
  HEAL: 'heal',
  STATUS_APPLY: 'status_apply',
  STATUS_EXPIRE: 'status_expire',
  STAT_MOD: 'stat_mod',
  PASSIVE: 'passive',
  STAGNATION: 'stagnation',
  FAINT: 'faint',
  BATTLE_END: 'battle_end',
};

/**
 * Milliseconds each beat holds the screen at 1x. These are the pacing dials —
 * the entire feel of the battle is tunable from this one table.
 */
export const HOLD = {
  [EV.BATTLE_START]: 1500,
  [EV.INITIATIVE]: 1150,
  [EV.SWITCH_IN]: 850,
  [EV.TURN_START]: 340,
  [EV.STATUS_TICK]: 950,
  [EV.SKIP]: 850,
  [EV.SPC_GAIN]: 430,
  [EV.ACTION]: 560,
  [EV.ROLL]: 1050,
  [EV.IMPACT]: 720,
  [EV.BLOCK]: 700,
  [EV.HEAL]: 620,
  [EV.STATUS_APPLY]: 540,
  [EV.STATUS_EXPIRE]: 260,
  [EV.STAT_MOD]: 540,
  [EV.PASSIVE]: 620,
  [EV.STAGNATION]: 900,
  [EV.FAINT]: 1200,
  [EV.BATTLE_END]: 2200,
};

/** Global pacing trim. Below 1 makes the whole match snappier at every speed. */
export const TEMPO = 0.82;

export const holdFor = (event) =>
  Math.round((event.hold ?? HOLD[event.type] ?? 500) * TEMPO);

/** Total 1x runtime of a timeline, in ms — shown on the scrubber. */
export const timelineDuration = (timeline) =>
  timeline.reduce((total, event) => total + holdFor(event), 0);
