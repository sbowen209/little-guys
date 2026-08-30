// src/views/CharacterSheet.jsx
// Gil's interactive character sheet — spellbook & active-loadout manager.
import { useMemo, useState } from 'react';
import { assetUrl } from '../utils/assets';
import { useGilSheet } from '../hooks/useGilSheet';
import {
  SCHOOLS, SCHOOL_BY_ID, AFFINITY_ORDER, AFFINITIES, AFF_STYLE, PAST_LOADOUTS, SCHOOL_BY_NAME,
} from '../data/gil/schools';
import {
  IDENTITY, STATS, BURSTS, RESOURCES, PETAL_AFFINITIES, CORE_KIT, FLOWERS,
  BLESSED_ITEMS, BLOOM_BINGO, CASTING_RULES,
} from '../data/gil/core';

// ───────────────────────────── small pieces ─────────────────────────────

function Counter({ label, value, onDec, onInc, accent = 'text-amber-300' }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-700/70 bg-stone-900/60 px-3 py-2">
      <span className="text-xs font-medium text-stone-300">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onDec}
          className="grid h-6 w-6 place-items-center rounded-md border border-stone-700 bg-stone-800 text-stone-300 transition hover:border-stone-500 hover:text-white active:scale-95"
          aria-label={`decrease ${label}`}
        >−</button>
        <span className={`w-7 text-center font-mono text-base font-bold tabular-nums ${accent}`}>{value}</span>
        <button
          onClick={onInc}
          className="grid h-6 w-6 place-items-center rounded-md border border-stone-700 bg-stone-800 text-stone-300 transition hover:border-stone-500 hover:text-white active:scale-95"
          aria-label={`increase ${label}`}
        >+</button>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  const map = {
    Minor: 'bg-stone-700/60 text-stone-200 border-stone-500/50',
    Inter: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
    Advanced: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
    Passive: 'bg-stone-800 text-stone-400 border-stone-600/50',
    Debuff: 'bg-purple-500/15 text-purple-200 border-purple-500/40',
    Buff: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
    Summon: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
  };
  return (
    <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[level] || map.Passive}`}>
      {level}
    </span>
  );
}

function SpellRow({ level, name, desc, cost }) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-stone-800 bg-stone-900/50 p-2.5">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <LevelBadge level={level} />
        {cost && <span className="text-[10px] font-mono text-stone-500">{cost}</span>}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-stone-100">{name}</div>
        <div className="text-xs leading-relaxed text-stone-400">{desc}</div>
      </div>
    </div>
  );
}

// ───────────────────────────── school detail modal ─────────────────────────────

function SchoolDetail({ school, onClose, inLoadout, canAdd, blockReason, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        className={`flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border bg-stone-950 sm:rounded-3xl ${st.border} ${st.glow}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative flex items-start justify-between gap-3 border-b border-stone-800 bg-gradient-to-b ${st.grad} to-transparent p-4`}>
          <div>
            <div className={`mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${st.text}`}>
              <span>{AFFINITIES[school.affinity].icon}</span>{school.affinity} Affinity
            </div>
            <h3 className="font-serif text-2xl font-black text-white">{school.name}</h3>
            <div className="mt-1 text-xs text-stone-400">
              Minor: 1 Petal · roll d{school.minorDie}
              {school.interDie > 0 && <> &nbsp;·&nbsp; Inter: 2 Petals · roll d{school.interDie}</>}
              {school.advanced && <> &nbsp;·&nbsp; Advanced: 4 Petals · locked</>}
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-stone-700 bg-stone-800 text-stone-300 transition hover:text-white">✕</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {school.note && (
            <div className={`rounded-lg border px-3 py-2 text-xs ${st.chip}`}>{school.note}</div>
          )}
          {school.traits.map((t, i) => (
            <SpellRow key={`t${i}`} level={t.type} name={t.name} desc={t.desc} />
          ))}
          {school.minors.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500">Minors · 1 Petal</div>
              <div className="space-y-2">
                {school.minors.map((s, i) => <SpellRow key={`m${i}`} level="Minor" name={s.name} desc={s.desc} cost={`d${school.minorDie}:${i + 1}`} />)}
              </div>
            </div>
          )}
          {school.inters.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500">Intermediates · 2 Petals</div>
              <div className="space-y-2">
                {school.inters.map((s, i) => <SpellRow key={`i${i}`} level="Inter" name={s.name} desc={s.desc} cost={`d${school.interDie}:${i + 1}`} />)}
              </div>
            </div>
          )}
          {school.advanced && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500">Advanced · 4 Petals</div>
              <SpellRow level="Advanced" name={school.advanced.name} desc={school.advanced.desc} />
            </div>
          )}
        </div>

        <div className="border-t border-stone-800 p-3">
          <button
            onClick={() => onToggle(school.id)}
            disabled={!inLoadout && !canAdd}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              inLoadout
                ? 'border border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                : canAdd
                  ? `${st.solid} text-stone-950 hover:brightness-110`
                  : 'cursor-not-allowed border border-stone-800 bg-stone-900 text-stone-600'
            }`}
          >
            {inLoadout ? 'Remove from Loadout'
              : canAdd ? 'Add to Loadout'
              : blockReason === 'full' ? 'Loadout full (4 schools)'
              : `${school.affinity} slot already taken`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── school card ─────────────────────────────

function SchoolCard({ school, inLoadout, disabled, reason, onOpen, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-stone-900/60 p-3 transition ${
        inLoadout ? `${st.border} ${st.glow} ring-1 ${st.ring}` : `border-stone-800 ${!disabled ? st.hover : ''}`
      } ${disabled && !inLoadout ? 'opacity-45' : ''}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${st.grad} to-transparent opacity-0 transition group-hover:opacity-100`} />
      <button onClick={() => onOpen(school)} className="relative block w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${st.text}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${st.dot}`} />{school.affinity}
          </span>
          {inLoadout && <span className={`rounded-full ${st.solid} px-1.5 py-0.5 text-[9px] font-black text-stone-950`}>ACTIVE</span>}
        </div>
        <div className="mt-1 font-serif text-base font-bold leading-tight text-white">{school.name}</div>
        <div className="mt-0.5 text-[11px] text-stone-500">
          {school.traits[0]?.name} · {school.minors.length + school.inters.length + (school.advanced ? 1 : 0)} spells
        </div>
      </button>
      <button
        onClick={() => onToggle(school.id)}
        disabled={disabled && !inLoadout}
        className={`relative mt-2.5 w-full rounded-lg px-2 py-1.5 text-xs font-bold transition ${
          inLoadout
            ? 'border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
            : disabled
              ? 'cursor-not-allowed border border-stone-800 bg-stone-900 text-stone-600'
              : `${st.chip} hover:brightness-125`
        }`}
      >
        {inLoadout ? '− Remove' : disabled ? (reason === 'full' ? 'Full' : `${school.affinity} taken`) : '+ Add'}
      </button>
    </div>
  );
}

// ───────────────────────────── tabs ─────────────────────────────

const TABS = [
  { id: 'loadout', label: 'Loadout', icon: '📖' },
  { id: 'kit', label: 'Core Kit', icon: '⚔️' },
  { id: 'garden', label: 'Garden & Items', icon: '🌸' },
  { id: 'trackers', label: 'Trackers', icon: '🎯' },
];

// ───────────────────────────── main view ─────────────────────────────

export default function CharacterSheet({ onBack }) {
  const gil = useGilSheet();
  const { state } = gil;
  const [tab, setTab] = useState('loadout');
  const [detail, setDetail] = useState(null);
  const [affFilter, setAffFilter] = useState('All');
  const [saveName, setSaveName] = useState('');

  const loadoutSchools = state.loadout.map((id) => SCHOOL_BY_ID[id]).filter(Boolean);
  const usedAffinities = new Set(loadoutSchools.map((s) => s.affinity));

  const visibleSchools = useMemo(
    () => (affFilter === 'All' ? SCHOOLS : SCHOOLS.filter((s) => s.affinity === affFilter)),
    [affFilter]
  );

  const activeStat = (s) => (state.ardenvale ? s.ardenvale : s.base);

  return (
    <div className="min-h-screen bg-stone-950 pb-24 text-stone-200">
      {/* subtle ambient glows */}
      <div className="pointer-events-none fixed left-[-10%] top-[-15%] h-[50%] w-[50%] rounded-full bg-violet-900/10 blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] h-[55%] w-[55%] rounded-full bg-amber-900/10 blur-[150px]" />

      {/* ── Hero header ── */}
      <header className="relative border-b border-stone-800/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <button
            onClick={onBack}
            className="absolute left-4 top-4 z-10 rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1.5 text-xs font-semibold text-stone-300 backdrop-blur transition hover:border-amber-400 hover:text-amber-300 sm:static sm:order-none"
          >← Back</button>

          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-violet-600/30 to-amber-600/20 blur-xl" />
            <img
              src={assetUrl(IDENTITY.image)}
              alt={IDENTITY.fullName}
              className="relative h-28 w-28 rounded-2xl border-2 border-violet-500/40 object-cover object-top shadow-2xl sm:h-32 sm:w-32"
            />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">{IDENTITY.title}</div>
            <h1 className="bg-gradient-to-br from-white via-stone-200 to-violet-300 bg-clip-text font-serif text-4xl font-black tracking-tight text-transparent sm:text-5xl">
              {IDENTITY.name}
            </h1>
            <div className="mt-0.5 text-sm text-stone-500">{IDENTITY.fullName}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-200">🌑 {IDENTITY.affinity} Affinity</span>
              <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-200">⚠ Weak: {IDENTITY.weakness}</span>
              {IDENTITY.phases.map((p) => (
                <span key={p} className="rounded-full border border-stone-700 bg-stone-800/60 px-2.5 py-0.5 text-xs text-stone-300">{p}</span>
              ))}
            </div>
          </div>

          {/* Ardenvale toggle */}
          <button
            onClick={gil.toggleArdenvale}
            className={`mx-auto flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-left transition sm:mx-0 ${
              state.ardenvale
                ? 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_25px_-6px_rgba(251,191,36,0.5)]'
                : 'border-stone-700 bg-stone-900/60 hover:border-stone-500'
            }`}
          >
            <span className="text-2xl">{state.ardenvale ? '🌟' : '🌙'}</span>
            <div>
              <div className={`text-sm font-bold ${state.ardenvale ? 'text-amber-300' : 'text-stone-300'}`}>Ardenvale</div>
              <div className="text-[11px] text-stone-500">{state.ardenvale ? 'Champion bonus ON' : 'Base stats'}</div>
            </div>
          </button>
        </div>

        {/* Stat strip */}
        <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {STATS.map((s) => {
              const boosted = state.ardenvale && s.ardenvale !== s.base;
              return (
                <div key={s.key} className={`rounded-xl border px-3 py-2 text-center ${boosted ? 'border-amber-500/40 bg-amber-500/5' : 'border-stone-800 bg-stone-900/50'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{s.label}</div>
                  <div className={`font-mono text-xl font-black tabular-nums ${boosted ? 'text-amber-300' : 'text-stone-100'}`}>{activeStat(s)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <nav className="sticky top-0 z-30 border-b border-stone-800 bg-stone-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 py-2 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                tab === t.id ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* ═══════════════════════ LOADOUT ═══════════════════════ */}
        {tab === 'loadout' && (
          <div className="space-y-6">
            {/* Active loadout */}
            <section>
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <h2 className="font-serif text-xl font-black text-white">Active Loadout</h2>
                  <p className="text-xs text-stone-500">Pick 4 spell schools — each a different Affinity.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-bold ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-stone-400'}`}>{state.loadout.length}/4</span>
                  {state.loadout.length > 0 && (
                    <button onClick={gil.clearLoadout} className="rounded-lg border border-stone-700 px-2 py-1 text-xs text-stone-400 hover:border-rose-500/50 hover:text-rose-300">Clear</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => {
                  const s = loadoutSchools[i];
                  if (!s) {
                    return (
                      <div key={i} className="flex min-h-[92px] items-center justify-center rounded-2xl border-2 border-dashed border-stone-800 bg-stone-900/30 text-xs text-stone-600">
                        Empty slot
                      </div>
                    );
                  }
                  const st = AFF_STYLE[s.affinity];
                  return (
                    <div key={i} className={`relative min-h-[92px] rounded-2xl border bg-gradient-to-br ${st.grad} to-stone-900/40 p-3 ${st.border}`}>
                      <button onClick={() => gil.toggleSchool(s.id)} className="absolute right-2 top-2 text-stone-500 hover:text-rose-300" aria-label="remove">✕</button>
                      <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${st.text}`}>{AFFINITIES[s.affinity].icon} {s.affinity}</div>
                      <button onClick={() => setDetail(s)} className="mt-1 block text-left font-serif text-sm font-bold leading-tight text-white hover:underline">{s.name}</button>
                      <div className="mt-1 text-[10px] text-stone-500">1P d{s.minorDie}{s.interDie ? ` · 2P d${s.interDie}` : ''}{s.advanced ? ' · 4P adv' : ''}</div>
                    </div>
                  );
                })}
              </div>

              {/* affinity coverage */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-500">Affinities used:</span>
                {AFFINITY_ORDER.map((a) => {
                  const on = usedAffinities.has(a);
                  const st = AFF_STYLE[a];
                  return (
                    <span key={a} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${on ? st.chip : 'border border-stone-800 text-stone-600'}`}>
                      {AFFINITIES[a].icon} {a}
                    </span>
                  );
                })}
              </div>

              {/* save current */}
              <div className="mt-3 flex gap-2">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Name this loadout…"
                  className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => { gil.saveCurrentLoadout(saveName); setSaveName(''); }}
                  disabled={!state.loadout.length}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-stone-800 disabled:text-stone-600"
                >Save</button>
              </div>
            </section>

            {/* Saved + past loadouts */}
            {(state.saved.length > 0 || PAST_LOADOUTS.length > 0) && (
              <section className="grid gap-4 sm:grid-cols-2">
                {state.saved.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">My Saved Loadouts</h3>
                    <div className="space-y-1.5">
                      {state.saved.map((sv) => (
                        <LoadoutRow key={sv.id} entry={sv} byId onApply={gil.applyLoadout} onDelete={() => gil.deleteSaved(sv.id)} />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">Past Loadouts (from old sheets)</h3>
                  <div className="space-y-1.5">
                    {PAST_LOADOUTS.map((sv) => (
                      <LoadoutRow key={sv.name} entry={sv} onApply={gil.applyLoadout} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* School browser */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-black text-white">Spell Schools <span className="text-sm font-normal text-stone-500">({SCHOOLS.length})</span></h2>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {['All', ...AFFINITY_ORDER].map((a) => {
                  const on = affFilter === a;
                  const st = a !== 'All' ? AFF_STYLE[a] : null;
                  return (
                    <button
                      key={a}
                      onClick={() => setAffFilter(a)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        on
                          ? a === 'All' ? 'bg-stone-100 text-stone-900' : `${st.solid} text-stone-950`
                          : 'border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                      }`}
                    >
                      {a === 'All' ? 'All' : `${AFFINITIES[a].icon} ${a}`}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {visibleSchools.map((s) => {
                  const inLoadout = state.loadout.includes(s.id);
                  const reason = gil.blockReason(s.id);
                  return (
                    <SchoolCard
                      key={s.id}
                      school={s}
                      inLoadout={inLoadout}
                      disabled={!inLoadout && reason != null}
                      reason={reason}
                      onOpen={setDetail}
                      onToggle={gil.toggleSchool}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ═══════════════════════ CORE KIT ═══════════════════════ */}
        {tab === 'kit' && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">Stats</h2>
              <div className="overflow-hidden rounded-2xl border border-stone-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-900 text-stone-400">
                      <th className="px-3 py-2 text-left font-semibold">Stat</th>
                      <th className="px-3 py-2 text-right font-semibold">Base</th>
                      <th className="px-3 py-2 text-right font-semibold text-amber-300">Ardenvale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATS.map((s, i) => (
                      <tr key={s.key} className={i % 2 ? 'bg-stone-900/40' : 'bg-stone-900/10'}>
                        <td className="px-3 py-2 text-stone-200">{s.label}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-stone-300">{s.base}</td>
                        <td className={`px-3 py-2 text-right font-mono font-bold tabular-nums ${s.ardenvale !== s.base ? 'text-amber-300' : 'text-stone-400'}`}>{s.ardenvale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">Passives & Actions</h2>
              <div className="space-y-2">
                {CORE_KIT.map((k, i) => (
                  <div key={i} className="flex gap-2.5 rounded-xl border border-stone-800 bg-stone-900/50 p-3">
                    <div className="shrink-0">
                      <LevelBadge level={['Minor', 'Intermediate', 'Advanced', 'Essential', 'Passive'].includes(k.type)
                        ? (k.type === 'Intermediate' ? 'Inter' : k.type === 'Essential' ? 'Passive' : k.type)
                        : 'Passive'} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-bold text-stone-100">{k.name}</span>
                        <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] text-stone-500">{k.type}{k.tag ? ` (${k.tag})` : ''}</span>
                      </div>
                      <div className="text-xs leading-relaxed text-stone-400">{k.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">How Casting Works</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {CASTING_RULES.map((c) => (
                  <div key={c.cost} className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 text-center">
                    <div className="font-serif text-lg font-black text-amber-300">{c.cost}</div>
                    <div className="mt-1 text-xs text-stone-400">{c.effect}</div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone-500">Loadout: 4 schools, each a different Affinity. 1 Petal = random Minor · 2 Petals = random Intermediate · 4 Petals = the school's Advanced.</p>
            </section>
          </div>
        )}

        {/* ═══════════════════════ GARDEN & ITEMS ═══════════════════════ */}
        {tab === 'garden' && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">The Garden — Flowers</h2>
              <p className="mb-3 text-xs text-stone-500">Flowers roll each turn and bloom on 86+. Cultivation rolls 2d100 (3d100 with a Green Flower) at the end of each turn.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {FLOWERS.map((f) => (
                  <div key={f.name} className="flex gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-3">
                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full border border-stone-600" style={{ backgroundColor: flowerColor(f.color) }} />
                    <div>
                      <div className="text-sm font-bold text-stone-100">{f.name}</div>
                      <div className="text-xs leading-relaxed text-stone-400">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">Blessed Items</h2>
              <div className="space-y-2">
                {BLESSED_ITEMS.map((it) => (
                  <div key={it.name} className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
                    <div className="text-sm font-bold text-amber-200">{it.name}</div>
                    <div className="text-xs leading-relaxed text-stone-400">{it.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-serif text-xl font-black text-white">Bloom Bingo</h2>
                <span className="text-xs text-stone-500">Tap a sin when you trigger it</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {BLOOM_BINGO.map((b) => {
                  const on = !!state.bloom[b.sin];
                  return (
                    <button
                      key={b.sin}
                      onClick={() => gil.toggleBloom(b.sin)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        on ? 'border-rose-500/50 bg-rose-500/10' : 'border-stone-800 bg-stone-900/50 hover:border-stone-600'
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs ${on ? 'border-rose-400 bg-rose-500 text-white' : 'border-stone-600 text-transparent'}`}>✓</span>
                      <div>
                        <div className={`text-sm font-bold ${on ? 'text-rose-200 line-through' : 'text-stone-100'}`}>{b.sin}</div>
                        <div className="text-xs text-stone-500">{b.trigger}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ═══════════════════════ TRACKERS ═══════════════════════ */}
        {tab === 'trackers' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={gil.resetTrackers} className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-rose-500/50 hover:text-rose-300">Reset trackers</button>
            </div>

            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">Petal Pool</h2>
              <p className="mb-3 text-xs text-stone-500">Petals cast your Stolen School spells: 1 = Minor, 2 = Intermediate, 4 = Advanced.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PETAL_AFFINITIES.map((a) => (
                  <Counter
                    key={a}
                    label={`${AFFINITIES[a].icon} ${a}`}
                    value={state.petals[a]}
                    accent={AFF_STYLE[a].text}
                    onDec={() => gil.bump('petals', a, -1)}
                    onInc={() => gil.bump('petals', a, +1)}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">Resources</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {RESOURCES.map((r) => (
                  <Counter key={r.key} label={r.label} value={state.resources[r.key]} onDec={() => gil.bump('resources', r.key, -1)} onInc={() => gil.bump('resources', r.key, +1)} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-serif text-xl font-black text-white">Bursts / Tokens</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BURSTS.map((b) => (
                  <Counter key={b.key} label={b.label} value={state.bursts[b.key]} accent="text-sky-300" onDec={() => gil.bump('bursts', b.key, -1)} onInc={() => gil.bump('bursts', b.key, +1)} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {detail && (
        <SchoolDetail
          school={detail}
          onClose={() => setDetail(null)}
          inLoadout={state.loadout.includes(detail.id)}
          canAdd={gil.blockReason(detail.id) == null}
          blockReason={gil.blockReason(detail.id)}
          onToggle={(id) => { gil.toggleSchool(id); }}
        />
      )}
    </div>
  );
}

// A saved / past loadout row with an Apply button.
function LoadoutRow({ entry, onApply, onDelete }) {
  const ids = entry.schools.map((s) => (SCHOOL_BY_ID[s] ? s : SCHOOL_BY_NAME[s]?.id)).filter(Boolean);
  const schools = ids.map((id) => SCHOOL_BY_ID[id]);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/50 p-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-stone-200">{entry.name}</div>
        <div className="flex flex-wrap gap-1">
          {schools.map((s) => (
            <span key={s.id} className={`rounded px-1.5 py-0.5 text-[10px] ${AFF_STYLE[s.affinity].chip}`}>{s.name}</span>
          ))}
        </div>
      </div>
      <button onClick={() => onApply(ids)} className="shrink-0 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-900 hover:brightness-95">Load</button>
      {onDelete && (
        <button onClick={onDelete} className="shrink-0 rounded-lg border border-stone-700 px-2 py-1.5 text-xs text-stone-500 hover:border-rose-500/50 hover:text-rose-300">✕</button>
      )}
    </div>
  );
}

function flowerColor(c) {
  return {
    red: '#ef4444', blue: '#3b82f6', yellow: '#eab308',
    green: '#22c55e', black: '#3f3f46', oni: '#a855f7',
  }[c] || '#78716c';
}
