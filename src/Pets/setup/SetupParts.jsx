import { memo, useState } from 'react';
import { displayName, elementMeta, roleMeta, abilityDef, PASSIVES } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/* ── SMALL PIECES ────────────────────────────────────────────────── */

export function TypeChip({ element, prefix }) {
  const meta = elementMeta(element);
  return (
    <span
      className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
      style={{ color: meta.hex, borderColor: `${meta.hex}55`, background: `${meta.hex}14` }}
    >
      {prefix}: {meta.icon} {element}
    </span>
  );
}

const TONES = {
  hp: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  atk: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  def: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  spc: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
};

export function StatBadge({ icon, label, value, tone, highlighted, editing, onInc, onDec, canDec, nature }) {
  return (
    <div
      className={`relative flex min-w-[92px] flex-col items-center gap-2 rounded-xl border px-2 py-3 shadow-lg backdrop-blur-md transition-all duration-300 ${
        highlighted
          ? 'z-10 scale-110 border-white bg-stone-800 shadow-[0_0_20px_rgba(255,255,255,0.55)]'
          : 'border-stone-700/80 bg-stone-900/70'
      }`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ring-1 ${TONES[tone]}`}>
        {icon}
      </div>
      <div className="w-full text-center">
        <span className="block font-mono text-[9px] uppercase tracking-widest text-stone-500">{label}</span>
        <div className="mt-1 flex items-center justify-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={onDec}
              disabled={!canDec}
              className="flex h-5 w-5 items-center justify-center rounded bg-stone-800 text-stone-400 transition-colors hover:bg-rose-600 hover:text-white disabled:opacity-20 disabled:hover:bg-stone-800"
            >
              −
            </button>
          )}
          <span className={`block font-mono text-xl font-black leading-tight tabular-nums ${highlighted ? 'text-white' : 'text-stone-200'}`}>
            {tone === 'hp' ? '' : 'd'}{value}
          </span>
          {editing && (
            <button
              type="button"
              onClick={onInc}
              className="flex h-5 w-5 items-center justify-center rounded bg-stone-800 text-stone-400 transition-colors hover:bg-emerald-600 hover:text-white"
            >
              +
            </button>
          )}
        </div>
        {nature !== undefined && nature !== null && (
          <span className={`mt-1.5 block font-mono text-[8.5px] uppercase tracking-widest ${
            nature > 0 ? 'text-emerald-400' : nature < 0 ? 'text-rose-400' : 'text-stone-500'
          }`}
          >
            Nature {nature > 0 ? '+' : ''}{nature}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── KIT (SPECIAL + PASSIVES) ────────────────────────────────────── */

function KitRow({ title, body, state }) {
  const styles = {
    special: 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(251,191,36,0.14)]',
    active: 'border-stone-800/60 bg-stone-900/80',
    locked: 'border-stone-800/60 bg-stone-950/50 opacity-60 grayscale-[0.5]',
  };
  const marks = { special: '✨', active: '✦', locked: '🔒' };
  const titleColor = { special: 'text-amber-400', active: 'text-stone-100', locked: 'text-stone-500' };
  const bodyColor = { special: 'text-amber-200/80', active: 'text-stone-400', locked: 'text-stone-600' };

  return (
    <li className={`rounded-lg border px-4 py-3 backdrop-blur-sm transition-all ${styles[state]}`}>
      <div className="flex items-center gap-2">
        <span className={state === 'special' ? 'text-amber-400' : 'text-stone-600'}>{marks[state]}</span>
        <span className={`font-serif font-bold tracking-wide ${titleColor[state]}`}>{title}</span>
      </div>
      <p className={`mt-1 pl-6 text-sm leading-snug ${bodyColor[state]}`}>{body}</p>
    </li>
  );
}

/** Reads straight from the registries, so ability text can never go stale. */
export const KitPanel = memo(function KitPanel({ species, level }) {
  const special = abilityDef(species.special);

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
        Special &amp; Passives
      </h3>
      <ul className="flex max-w-xl flex-col gap-3 pb-8">
        <KitRow
          state="special"
          title={`Special: ${special.name} · ${special.cost} charge · ${special.kind === 'effect' ? 'No roll' : 'Attack'}`}
          body={special.desc}
        />
        {(species.passives ?? []).map((id) => {
          const passive = PASSIVES[id];
          const unlocked = level >= passive.level;
          return (
            <KitRow
              key={id}
              state={unlocked ? 'active' : 'locked'}
              title={unlocked ? passive.name : `${passive.name} — unlocks at Lv.${passive.level}`}
              body={passive.desc}
            />
          );
        })}
      </ul>
    </div>
  );
});

/* ── SHOWCASE ────────────────────────────────────────────────────── */

export function HeroAura({ species }) {
  const off = elementMeta(species.typing.offensive);
  const def = elementMeta(species.typing.defensive);
  const dual = species.typing.offensive !== 'PHYSICAL' && species.typing.offensive !== species.typing.defensive;

  return (
    <div className="pointer-events-none absolute bottom-[20%] left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 mix-blend-screen">
      <div
        className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(circle, ${def.hex}40 0%, transparent 70%)` }}
      />
      {dual && (
        <div
          className="absolute inset-0 animate-[petSpinAura_14s_linear_infinite] rounded-full blur-[70px]"
          style={{ background: `radial-gradient(circle at 65% 35%, ${off.hex}50 0%, transparent 65%)` }}
        />
      )}
      <div
        className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-[50px]"
        style={{ background: `radial-gradient(circle, ${def.hex}60 0%, transparent 80%)` }}
      />
    </div>
  );
}

export function ShowcaseImage({ species }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative z-10 flex h-full w-full animate-[petFloat_7s_ease-in-out_infinite] items-end justify-center pb-12">
      <div className="absolute bottom-[10%] h-10 w-2/3 rounded-full bg-black/80 blur-2xl" />
      <img
        src={assetUrl(species.art)}
        alt={displayName(species)}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`h-full max-h-[480px] w-full origin-bottom select-none object-contain object-bottom drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-[opacity,transform] duration-700 ease-out ${
          loaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      />
    </div>
  );
}

/* ── LIBRARY CARD ────────────────────────────────────────────────── */

export const LibraryCard = memo(function LibraryCard({ species, selected, onSelect }) {
  const off = elementMeta(species.typing.offensive);
  const def = elementMeta(species.typing.defensive);
  const role = roleMeta(species);
  const dual = species.typing.offensive !== 'PHYSICAL' && species.typing.offensive !== species.typing.defensive;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative h-28 w-44 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        selected
          ? '-translate-y-1 scale-105 border-amber-400 shadow-[0_0_22px_-2px_rgba(251,191,36,0.55)]'
          : 'border-stone-800 opacity-60 hover:-translate-y-1 hover:border-stone-600 hover:opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-stone-900" />
      <img
        src={assetUrl(species.art)}
        alt=""
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-30 mix-blend-luminosity transition-all duration-500 group-hover:scale-110 group-hover:opacity-60 group-hover:mix-blend-normal"
      />
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${selected ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}
        style={{ background: dual ? `linear-gradient(135deg, ${def.hex} 30%, ${off.hex} 70%)` : def.hex }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

      <div className="absolute inset-x-3 bottom-2 z-10 flex flex-col text-left">
        <span className={`truncate font-serif text-base font-bold leading-tight ${selected ? 'text-white' : 'text-stone-300'}`}>
          {displayName(species)}
        </span>
        <span className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-widest" style={{ color: role.hex }}>
          {role.label}
        </span>
      </div>

      {species.isPreset && (
        <span className="absolute left-2 top-2 z-10 rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase text-amber-950 shadow-md">
          Preset
        </span>
      )}
      {selected && <span className="absolute right-2 top-2 z-10 h-2 w-2 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />}
    </button>
  );
});

/* ── SHARED KEYFRAMES ────────────────────────────────────────────── */

export const SETUP_STYLES = `
  @keyframes petShine { to { transform: translateX(220%) skewX(-12deg); } }
  @keyframes petFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @keyframes petSpinAura { to { transform: rotate(360deg); } }
  @keyframes petPop { 0% { opacity: 0; transform: scale(0.94) translateY(10px); } 100% { opacity: 1; transform: none; } }

  .pet-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
  .pet-scroll::-webkit-scrollbar-track { background: transparent; }
  .pet-scroll::-webkit-scrollbar-thumb { background: rgba(120,113,108,0.3); border-radius: 9999px; }
  .pet-scroll::-webkit-scrollbar-thumb:hover { background: rgba(120,113,108,0.6); }
  .pet-scroll { scrollbar-width: thin; scrollbar-color: rgba(120,113,108,0.35) transparent; }

  @media (prefers-reduced-motion: reduce) {
    .pet-setup *, .pet-setup *::before, .pet-setup *::after {
      animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    }
  }
`;
