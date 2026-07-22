// src/components/MetaOverlay.jsx
import { getItemMeta } from '../../data/items';

const OUTCOME_TONE = {
  VICTORY: 'text-amber-400',
  RETREAT: 'text-sky-400',
  DEFEAT: 'text-rose-500',
};

export default function MetaOverlay({ meta, onReset, onClose }) {
  const resources = Object.entries(meta.resources || {}).filter(([, q]) => q > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-black text-amber-400">Records</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-stone-400 transition hover:text-stone-200">
            Close
          </button>
        </div>

        {/* Aggregate resources */}
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Total Resources Banked</h3>
        {resources.length === 0 ? (
          <p className="mb-6 text-stone-500 italic">Nothing banked yet. Complete a run!</p>
        ) : (
          <div className="mb-6 flex flex-wrap gap-2">
            {resources.map(([id, qty]) => {
              const m = getItemMeta(id);
              return (
                <span key={id} className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm" style={{ borderColor: `${m.hex}55`, backgroundColor: `${m.hex}15` }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.hex }} />
                  <span className="text-stone-300">{m.name}</span>
                  <span className="font-mono font-bold text-white">{qty}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Run history */}
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Expedition History</h3>
        {(!meta.history || meta.history.length === 0) ? (
          <p className="mb-6 text-stone-500 italic">No runs logged yet.</p>
        ) : (
          <div className="mb-6 flex flex-col gap-2">
            {meta.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-950/60 px-4 py-2 text-sm">
                <div>
                  <span className="font-bold text-stone-200">{h.hero}</span>
                  <span className="text-stone-500"> · {h.biome}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-stone-400">Lv {h.levelsCleared}</span>
                  <span className={`font-bold uppercase ${OUTCOME_TONE[h.outcome] || 'text-stone-400'}`}>{h.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => { if (confirm('Erase all saved progress?')) onReset(); }}
            className="rounded-lg border border-rose-500/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-400 transition hover:bg-rose-500/10"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}