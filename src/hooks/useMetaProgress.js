// src/hooks/useMetaProgress.js
import { useState, useCallback } from 'react';

const KEY = 'little-guys-meta-v2';
const DEFAULT = {
  resources: {},
  history: [],
  eevees: [],
  mounts: [],
  pets: [],
  blessed: 0,
  sigils: 0,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}
function persist(meta) {
  try { localStorage.setItem(KEY, JSON.stringify(meta)); } catch { /* ignore */ }
}

export function useMetaProgress() {
  const [meta, setMeta] = useState(load);

  const update = useCallback((fn) => {
    setMeta((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, []);

  const bankResources = useCallback((inv) => {
    update((prev) => {
      const resources = { ...prev.resources };
      Object.entries(inv || {}).forEach(([id, q]) => {
        if (q > 0) resources[id] = (resources[id] || 0) + q;
      });
      return { ...prev, resources };
    });
  }, [update]);

  const recordRun = useCallback((entry) => {
    update((prev) => ({
      ...prev,
      history: [{ ...entry, ts: Date.now() }, ...prev.history].slice(0, 50),
    }));
  }, [update]);

  const claimReward = useCallback((reward) => {
    if (!reward) return;
    update((prev) => {
      const next = { ...prev };
      switch (reward.type) {
        case 'eevee':   next.eevees = [...new Set([...prev.eevees, reward.biome])]; break;
        case 'mount':   next.mounts = [...new Set([...prev.mounts, reward.biome])]; break;
        case 'pet':     next.pets = [...prev.pets, { enemyId: reward.enemyId, biome: reward.biome, name: reward.name }]; break;
        case 'blessed': next.blessed = (prev.blessed || 0) + 1; break;
        case 'sigil':   next.sigils = (prev.sigils || 0) + (reward.qty || 1); break;
        default: break;
      }
      return next;
    });
  }, [update]);

  const reset = useCallback(() => {
    persist(DEFAULT);
    setMeta({ ...DEFAULT });
  }, []);

  return { meta, bankResources, recordRun, claimReward, reset };
}