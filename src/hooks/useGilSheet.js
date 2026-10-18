// src/hooks/useGilSheet.js
// Live, persisted state for Gil's interactive character sheet: the active
// loadout (4 schools, each a different affinity), saved loadouts, petal pool,
// resource + burst counters, bloom-bingo flags, and the Ardenvale toggle.
import { useCallback, useEffect, useState } from 'react';
import { SCHOOL_BY_ID, SCHOOLS, AFFINITY_ORDER } from '../data/gil/schools';
import { BURSTS, RESOURCES, PETAL_AFFINITIES, MAX_HP, FLOWERS } from '../data/gil/core';

const KEY = 'gil-sheet-v1';

// Red and Blue are summoned free at the start of every combat.
const FLOWER_START = Object.fromEntries(
  FLOWERS.map((f) => [f.name, f.name === 'Red' || f.name === 'Blue' ? 1 : 0]),
);

const DEFAULT = {
  ardenvale: false,
  loadout: [], // array of school ids (max 4, each distinct affinity)
  saved: [], // [{ id, name, schools: [ids] }]
  petals: Object.fromEntries(PETAL_AFFINITIES.map((a) => [a, 0])),
  resources: Object.fromEntries(RESOURCES.map((r) => [r.key, r.start])),
  bursts: Object.fromEntries(BURSTS.map((b) => [b.key, b.start])),
  vitals: { hp: MAX_HP },
  uses: {}, // { [ability name]: times used this fight }
  flowers: { ...FLOWER_START }, // { [flower name]: count in play }
  bloom: {}, // { [sin]: true }
  ally: { battery: 100, techPoints: 5 }, // Aida's Ether Battery, Kitana's Tech Points
  allyUses: {}, // { [technique name]: times used this fight }
};

// Fisher-Yates, so every ordering is equally likely.
function shuffle(input) {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT),
      ...parsed,
      petals: { ...DEFAULT.petals, ...(parsed.petals || {}) },
      resources: { ...DEFAULT.resources, ...(parsed.resources || {}) },
      bursts: { ...DEFAULT.bursts, ...(parsed.bursts || {}) },
      vitals: { ...DEFAULT.vitals, ...(parsed.vitals || {}) },
      uses: { ...(parsed.uses || {}) },
      flowers: { ...DEFAULT.flowers, ...(parsed.flowers || {}) },
      bloom: { ...(parsed.bloom || {}) },
      ally: { ...DEFAULT.ally, ...(parsed.ally || {}) },
      allyUses: { ...(parsed.allyUses || {}) },
    };
  } catch {
    return structuredClone(DEFAULT);
  }
}

export function useGilSheet() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const setPart = useCallback((fn) => setState((prev) => fn(prev)), []);

  // ── Loadout ──────────────────────────────────────────────────────────
  // Rule: at most 4 schools, and no two may share an affinity.
  const toggleSchool = useCallback((id) => {
    setState((prev) => {
      const school = SCHOOL_BY_ID[id];
      if (!school) return prev;
      if (prev.loadout.includes(id)) {
        return { ...prev, loadout: prev.loadout.filter((x) => x !== id) };
      }
      if (prev.loadout.length >= 4) return prev;
      const affTaken = prev.loadout.some((x) => SCHOOL_BY_ID[x]?.affinity === school.affinity);
      if (affTaken) return prev;
      return { ...prev, loadout: [...prev.loadout, id] };
    });
  }, []);

  // Why a school can't be added right now (for UI hints): null = addable.
  const blockReason = useCallback((id) => {
    const school = SCHOOL_BY_ID[id];
    if (!school) return 'unknown';
    if (state.loadout.includes(id)) return null; // already in → removable
    if (state.loadout.length >= 4) return 'full';
    if (state.loadout.some((x) => SCHOOL_BY_ID[x]?.affinity === school.affinity)) return 'affinity';
    return null;
  }, [state.loadout]);

  const clearLoadout = useCallback(() => setState((p) => ({ ...p, loadout: [] })), []);

  const applyLoadout = useCallback((ids) => {
    // Apply a preset, respecting the distinct-affinity + max-4 rule.
    setState((prev) => {
      const next = [];
      const affs = new Set();
      for (const id of ids) {
        const s = SCHOOL_BY_ID[id];
        if (!s || next.length >= 4 || affs.has(s.affinity)) continue;
        next.push(id);
        affs.add(s.affinity);
      }
      return { ...prev, loadout: next };
    });
  }, []);

  // Roll a fresh legal loadout: 4 schools, each of a different affinity.
  // `guaranteeShadow` forces one of those affinities to be Shadow.
  const randomizeLoadout = useCallback((guaranteeShadow = false) => {
    setState((prev) => {
      const picked = guaranteeShadow
        ? ['Shadow', ...shuffle(AFFINITY_ORDER.filter((a) => a !== 'Shadow')).slice(0, 3)]
        : shuffle(AFFINITY_ORDER).slice(0, 4);
      // Keep the canonical affinity order so the panels read consistently.
      const loadout = AFFINITY_ORDER
        .filter((a) => picked.includes(a))
        .map((a) => {
          const options = SCHOOLS.filter((s) => s.affinity === a);
          return options[Math.floor(Math.random() * options.length)].id;
        });
      return { ...prev, loadout };
    });
  }, []);

  const saveCurrentLoadout = useCallback((name) => {
    setState((prev) => {
      if (!prev.loadout.length) return prev;
      const entry = { id: `${Date.now()}`, name: name?.trim() || 'Untitled', schools: [...prev.loadout] };
      return { ...prev, saved: [entry, ...prev.saved] };
    });
  }, []);

  const deleteSaved = useCallback((id) => {
    setState((prev) => ({ ...prev, saved: prev.saved.filter((s) => s.id !== id) }));
  }, []);

  // ── Counters ─────────────────────────────────────────────────────────
  const bump = useCallback((group, key, delta) => {
    setState((prev) => {
      const cur = prev[group]?.[key] ?? 0;
      const nextVal = Math.max(0, cur + delta);
      return { ...prev, [group]: { ...prev[group], [key]: nextVal } };
    });
  }, []);

  const setCounter = useCallback((group, key, value) => {
    setState((prev) => ({ ...prev, [group]: { ...prev[group], [key]: Math.max(0, value | 0) } }));
  }, []);

  const toggleArdenvale = useCallback(() => setState((p) => ({ ...p, ardenvale: !p.ardenvale })), []);

  const toggleBloom = useCallback((sin) => {
    setState((prev) => ({ ...prev, bloom: { ...prev.bloom, [sin]: !prev.bloom[sin] } }));
  }, []);

  const resetTrackers = useCallback(() => {
    setState((prev) => ({
      ...prev,
      petals: structuredClone(DEFAULT.petals),
      resources: structuredClone(DEFAULT.resources),
      bursts: structuredClone(DEFAULT.bursts),
      vitals: structuredClone(DEFAULT.vitals),
      uses: {},
      flowers: structuredClone(DEFAULT.flowers),
      bloom: {},
      ally: structuredClone(DEFAULT.ally),
      allyUses: {},
      ardenvale: false,
    }));
  }, []);

  return {
    state, setPart,
    toggleSchool, blockReason, clearLoadout, applyLoadout, randomizeLoadout,
    saveCurrentLoadout, deleteSaved,
    bump, setCounter, toggleArdenvale, toggleBloom, resetTrackers,
  };
}
