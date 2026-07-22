// src/views/StatsView.jsx
import { getItemMeta } from '../data/items';

const OUTCOME_TONE = {
  Victory: 'text-amber-400',
  Retreat: 'text-sky-400',
  Defeat: 'text-rose-500',
};

function ResourceChip({ id, qty }) {
  const meta = getItemMeta(id);
  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2"
      style={{ borderColor: `${meta.hex}55`, backgroundColor: `${meta.hex}12` }}
    >
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: meta.hex }} />
      <span className="text-sm text-stone-300">{meta.name}</span>
      <span className="ml-auto font-mono font-black text-white">{qty}</span>
    </div>
  );
}

export default function StatsView({ meta, onReset, onBack }) {
  const resources = Object.entries(meta.resources || {}).filter(([, q]) => q > 0);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-black text-amber-400">Records</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { if (confirm('Wipe all meta progression?')) onReset(); }}
            className="rounded-lg border border-rose-700/50 px-4 py-2 text-sm font-bold uppercase tracking-wider text-rose-400 transition hover:bg-rose-900/20"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-stone-400 transition hover:text-stone-200"
          >
            Back
          </button>
        </div>
      </div>

      {/* Collections */}
      <section className="mb-8">
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Collection</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: 'Eevees', val: (meta.eevees || []).length, emoji: '🦊' },
            { label: 'Mounts', val: (meta.mounts || []).length, emoji: '🐎' },
            { label: 'Pets', val: (meta.pets || []).length, emoji: '🐾' },
            { label: 'Blessed', val: meta.blessed || 0, emoji: '🌟' },
            { label: 'Sigils', val: meta.sigils || 0, emoji: '🔮' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-stone-700 bg-stone-900/60 p-4 text-center">
              <div className="text-3xl">{s.emoji}</div>
              <div className="mt-1 font-mono text-2xl font-black text-white">{s.val}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-stone-500">{s.label}</div>
            </div>
          ))}
        </div>
        {(meta.pets || []).length > 0 && (
          <p className="mt-3 text-sm text-stone-400">
            Tamed: {meta.pets.map((p) => `${p.name} (${p.biome})`).join(', ')}
          </p>
        )}
      </section>

      {/* Aggregate resources */}
      <section className="mb-8">
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
          Total Resources Banked
        </h2>
        {resources.length === 0 ? (
          <p className="text-stone-500">No resources banked yet — complete or retreat from a run.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {resources.map(([id, qty]) => <ResourceChip key={id} id={id} qty={qty} />)}
          </div>
        )}
      </section>

      {/* Run history */}
      <section>
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Run History</h2>
        {(meta.history || []).length === 0 ? (
          <p className="text-stone-500">No runs recorded yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-900/80 font-mono text-[10px] uppercase tracking-widest text-stone-500">
                <tr>
                  <th className="px-4 py-2">Hero</th>
                  <th className="px-4 py-2">Biome</th>
                  <th className="px-4 py-2">Outcome</th>
                  <th className="px-4 py-2">Levels</th>
                  <th className="px-4 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {meta.history.map((h, i) => (
                  <tr key={i} className="border-t border-stone-800 odd:bg-stone-900/30">
                    <td className="px-4 py-2 font-bold text-stone-200">{h.hero}</td>
                    <td className="px-4 py-2 capitalize text-stone-400">{h.biome}</td>
                    <td className={`px-4 py-2 font-bold ${OUTCOME_TONE[h.outcome] || 'text-stone-300'}`}>{h.outcome}</td>
                    <td className="px-4 py-2 text-stone-300">{h.levels}</td>
                    <td className="px-4 py-2 text-stone-500">{new Date(h.ts).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}