// src/components/EventModal.jsx
export default function EventModal({ text, onContinue, onReroll, canReroll }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-indigo-500/30 bg-stone-900/85 p-8 text-center shadow-2xl backdrop-blur-md">
      <div className="mb-4 text-4xl">❔</div>
      <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">A Strange Event</h3>
      <p className="mb-7 text-lg italic leading-relaxed text-stone-300">{text}</p>
      <div className="flex justify-center gap-3">
        {canReroll && (
          <button
            type="button"
            onClick={onReroll}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20"
          >
            🔮 Reroll (Shiva)
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-indigo-500 px-8 py-3 font-bold uppercase tracking-wider text-white transition hover:bg-indigo-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
}