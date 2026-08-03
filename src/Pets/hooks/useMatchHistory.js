/**
 * @file useMatchHistory.js
 * @description Browser-persisted record of finished battles, in the same spirit
 * as the racing module's `raceHistory`.
 *
 * Only what the ledger draws is stored — names, art, levels and the outcome —
 * never a whole timeline. A 5v5 timeline is ~560 events each carrying a full
 * state snapshot, so keeping even a handful would blow the localStorage quota.
 * The seed IS kept, which is enough to reproduce any match exactly.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'gpb_match_history';
/** Enough to browse; old entries fall off the end rather than filling the quota. */
const MAX_ENTRIES = 40;

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    // Anything without the current shape is from an older build; drop it rather
    // than rendering half a card.
    return parsed.filter((entry) => entry && entry.id && Array.isArray(entry.matches));
  } catch (error) {
    console.warn('[Pets] Match history could not be read, starting fresh.', error);
    return [];
  }
};

const persist = (entries) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('[Pets] Match history could not be written.', error);
  }
};

export function useMatchHistory() {
  const [history, setHistory] = useState(load);
  const first = useRef(true);

  useEffect(() => {
    // Skip the write on mount so simply opening the view never rewrites the save.
    if (first.current) { first.current = false; return; }
    persist(history);
  }, [history]);

  /** Adds a finished duel or series to the top of the ledger. */
  const record = useCallback((entry) => {
    setHistory((previous) => [
      { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, date: Date.now(), ...entry },
      ...previous,
    ].slice(0, MAX_ENTRIES));
  }, []);

  const remove = useCallback((id) => {
    setHistory((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  return { history, record, remove, clear };
}

/**
 * Compresses a live team into the handful of fields the ledger renders.
 * `getSpecies` is passed in so this stays free of data-layer imports.
 */
export const summariseTeam = (team, getSpecies) => ({
  name: team.name,
  isOpponent: Boolean(team.isOpponent),
  pets: team.pets.map((pet) => {
    const species = getSpecies(pet.speciesId);
    return {
      name: species?.variant ? `${species.name} (${species.variant})` : species?.name ?? pet.speciesId,
      art: species?.art ?? null,
      level: pet.level ?? 1,
    };
  }),
});
