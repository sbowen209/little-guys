/**
 * @file useSavedTeams.js
 * @description Persistence for the 12 saved rosters. Everything read out of
 * localStorage goes through migrateSavedTeams, so a save written by an older
 * version — or one referencing a pet that has since been retired — loads
 * cleanly instead of throwing on a missing species.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { blankTeams, migrateSavedTeams } from '../data/index.js';

const STORAGE_KEY = 'gpb_saved_teams';

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrateSavedTeams(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn('[Pets] Saved teams could not be read, starting fresh.', error);
    return blankTeams();
  }
};

export function useSavedTeams() {
  const [teams, setTeams] = useState(load);
  const first = useRef(true);

  useEffect(() => {
    // Skip the write on mount so a read-only visit never rewrites the save.
    if (first.current) { first.current = false; return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch (error) {
      console.warn('[Pets] Saved teams could not be written.', error);
    }
  }, [teams]);

  const saveTeam = useCallback((index, team) => {
    setTeams((previous) => previous.map((existing, i) => (i === index ? team : existing)));
  }, []);

  const clearTeam = useCallback((index) => {
    setTeams((previous) =>
      previous.map((existing, i) => (i === index ? { ...existing, pets: [] } : existing)));
  }, []);

  return { teams, saveTeam, clearTeam };
}
