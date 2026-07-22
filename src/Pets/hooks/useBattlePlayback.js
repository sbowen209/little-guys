/**
 * @file useBattlePlayback.js
 * @description Walks a simulated timeline in real time. One requestAnimationFrame
 * loop drives everything, so speed changes are instant and smooth mid-beat, the
 * loop parks itself when the tab is hidden, and tearing the component down can
 * never leave a timer running against a dead tree.
 *
 * React re-renders once per event, not once per frame.
 *
 * The hook holds no reset path: a rematch is a different battle, so the owner
 * remounts the stage with a new key rather than trying to rewind this state in
 * place. That keeps every cursor and accumulator here write-only from effects.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { holdFor, timelineDuration } from '../engine/events.js';

// A full 5v5 averages ~95 turns, so a high gear matters more here than in a
// shorter format — 8x brings a long match down to about a minute.
export const SPEEDS = [1, 2, 4, 8];

export function useBattlePlayback(result) {
  const timeline = result?.timeline;
  const lastIndex = timeline ? timeline.length - 1 : 0;

  const [index, setIndex] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [paused, setPausedState] = useState(false);
  const [finished, setFinished] = useState(false);

  const indexRef = useRef(0);
  const speedRef = useRef(1);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const accRef = useRef(0);

  useEffect(() => {
    if (!timeline?.length) return undefined;

    let frame = 0;
    let last = performance.now();

    const tick = (now) => {
      frame = requestAnimationFrame(tick);

      // Clamp so returning from a background tab doesn't fast-forward the match.
      const delta = Math.min(now - last, 200);
      last = now;
      if (pausedRef.current || finishedRef.current) return;

      accRef.current += delta * speedRef.current;

      let cursor = indexRef.current;
      let moved = false;

      while (cursor < timeline.length - 1 && accRef.current >= holdFor(timeline[cursor])) {
        accRef.current -= holdFor(timeline[cursor]);
        cursor += 1;
        moved = true;
      }

      if (moved) {
        indexRef.current = cursor;
        setIndex(cursor);
      }

      if (cursor >= timeline.length - 1 && accRef.current >= holdFor(timeline[cursor]) * 0.5) {
        finishedRef.current = true;
        setFinished(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timeline]);

  const setSpeed = useCallback((value) => {
    speedRef.current = value;
    setSpeedState(value);
  }, []);

  const setPaused = useCallback((value) => {
    pausedRef.current = value;
    setPausedState(value);
  }, []);

  const togglePaused = useCallback(() => setPaused(!pausedRef.current), [setPaused]);

  const jumpTo = useCallback((target) => {
    if (!timeline?.length) return;
    const clamped = Math.max(0, Math.min(timeline.length - 1, target));
    indexRef.current = clamped;
    accRef.current = 0;
    finishedRef.current = clamped >= timeline.length - 1;
    setIndex(clamped);
    setFinished(finishedRef.current);
  }, [timeline]);

  const skipToEnd = useCallback(() => jumpTo(lastIndex), [jumpTo, lastIndex]);

  const step = useCallback(() => {
    setPaused(true);
    jumpTo(indexRef.current + 1);
  }, [jumpTo, setPaused]);

  const totalMs = useMemo(() => (timeline ? timelineDuration(timeline) : 0), [timeline]);

  const event = timeline?.[index] ?? null;

  return {
    timeline,
    index,
    event,
    state: event?.state ?? null,
    outcome: result?.outcome ?? null,
    finished,
    paused,
    speed,
    progress: lastIndex ? index / lastIndex : 0,
    totalMs,
    setSpeed,
    setPaused,
    togglePaused,
    jumpTo,
    skipToEnd,
    step,
  };
}
