/**
 * @file MatchHistory.jsx
 * @description The battle ledger — every duel and gauntlet series kept in the
 * browser, newest first. Mirrors the racing module's history view so the two
 * games read as parts of the same app.
 */

import { SETUP_STYLES } from './SetupParts.jsx';
import { assetUrl } from '../../utils/assets.js';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
};

const RESULT_TONE = {
  win: { text: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-950/30', label: 'Victory' },
  loss: { text: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-950/30', label: 'Defeat' },
  draw: { text: 'text-stone-400', border: 'border-stone-600/50', bg: 'bg-stone-900/40', label: 'Draw' },
};

const outcomeOf = (winner) => (winner === 0 ? 'win' : winner === 1 ? 'loss' : 'draw');

function TeamStrip({ team, mirrored, dimmed }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${mirrored ? 'items-end' : 'items-start'}`}>
      <span className={`truncate font-serif text-sm font-bold ${dimmed ? 'text-stone-500' : 'text-stone-200'}`}>
        {team.name}
      </span>
      <div className={`flex flex-wrap gap-1 ${mirrored ? 'justify-end' : ''}`}>
        {team.pets.map((pet, i) => (
          <div
            key={`${pet.name}-${i}`}
            title={`${pet.name} · Lv.${pet.level}`}
            className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-stone-950 ${
              dimmed ? 'border-stone-800 opacity-40 grayscale' : 'border-stone-700'
            }`}
          >
            {pet.art
              ? <img src={assetUrl(pet.art)} alt="" className="h-7 origin-bottom scale-110 object-contain" />
              : <span className="font-mono text-[8px] text-stone-500">?</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match, index, showIndex }) {
  const tone = RESULT_TONE[outcomeOf(match.winner)];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-800 bg-stone-900/60 p-3 sm:px-5">
      {showIndex && (
        <span className="w-16 shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500">
          {match.label ?? `Match ${index + 1}`}
        </span>
      )}
      <TeamStrip team={match.teams[0]} dimmed={match.winner === 1} />
      <div className="flex shrink-0 flex-col items-center px-2">
        <span className={`font-mono text-[10px] font-black uppercase tracking-widest ${tone.text}`}>
          {tone.label}
        </span>
        <span className="font-mono text-[9px] text-stone-600">{match.turns} turns</span>
      </div>
      <TeamStrip team={match.teams[1]} mirrored dimmed={match.winner === 0} />
    </div>
  );
}

export default function MatchHistory({ history, onRemove, onClear, onBack }) {
  return (
    <div className="pet-setup min-h-screen w-full bg-stone-950 p-6 font-sans text-stone-200 md:p-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-stone-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-black text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)] md:text-5xl">
              Battle History
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-stone-500">
              {history.length} record{history.length === 1 ? '' : 's'} · stored in this browser
            </p>
          </div>
          <div className="flex gap-3">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-rose-400 transition-colors hover:bg-rose-900/60 hover:text-rose-300"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-stone-700 bg-stone-900 px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
            >
              Back to Menu
            </button>
          </div>
        </header>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-800 py-24">
            <span className="mb-2 text-5xl opacity-40">🐾</span>
            <span className="font-mono text-sm uppercase tracking-widest text-stone-500">No battles recorded yet</span>
            <span className="font-mono text-[10px] text-stone-600">Duels and gauntlets are saved here automatically.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-16">
            {history.map((entry) => {
              const tone = RESULT_TONE[outcomeOf(entry.winner)];
              const isSeries = entry.matches.length > 1 || entry.mode === 'gauntlet';
              return (
                <article
                  key={entry.id}
                  className={`flex flex-col gap-4 rounded-[2rem] border bg-stone-950/80 p-5 shadow-2xl sm:p-8 ${tone.border}`}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-stone-800/80 pb-4">
                    <div className="flex flex-col">
                      <span className="font-serif text-2xl font-black tracking-tight text-amber-400">
                        {isSeries ? `Gauntlet · ${entry.format ?? entry.matches.length}v${entry.format ?? entry.matches.length}` : 'Exhibition Duel'}
                      </span>
                      <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      title="Remove record"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-700 bg-stone-900 text-stone-500 transition-colors hover:border-rose-900/50 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {entry.matches.map((match, i) => (
                      <MatchRow key={i} match={match} index={i} showIndex={isSeries} />
                    ))}
                  </div>

                  <div className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-5 ${tone.bg} ${tone.border}`}>
                    <span className={`font-mono text-[11px] font-bold uppercase tracking-widest ${tone.text}`}>
                      {isSeries ? 'Series result' : 'Result'}
                    </span>
                    <span className={`font-serif text-4xl font-black leading-none sm:text-5xl ${tone.text}`}>
                      {tone.label}
                    </span>
                    {isSeries && (
                      <span className="mt-1 font-mono text-xs tabular-nums text-stone-400">
                        {entry.score?.[0] ?? 0} — {entry.score?.[1] ?? 0}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
    </div>
  );
}
