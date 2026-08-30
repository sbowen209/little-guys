// src/views/CharacterSheet.jsx
// Gil's live play dashboard — a glanceable second-screen reference for Roll20.
// Emerald-accented. The equipped spells are the focus; each school carries its
// own petal counter, bursts are big, and long text lives in hover tooltips.
import { useMemo, useState } from 'react';
import { assetUrl } from '../utils/assets';
import { useGilSheet } from '../hooks/useGilSheet';
import Tip from '../components/gil/Tip';
import {
  SCHOOLS, SCHOOL_BY_ID, AFFINITY_ORDER, AFFINITIES, AFF_STYLE, PAST_LOADOUTS, SCHOOL_BY_NAME,
} from '../data/gil/schools';
import {
  IDENTITY, STATS, BURSTS, CORE_KIT, FLOWERS,
  BLESSED_ITEMS, BLOOM_BINGO, CASTING_RULES,
} from '../data/gil/core';

const CORE_ACTIONS = CORE_KIT.filter((k) => ['Essential', 'Minor', 'Intermediate', 'Advanced'].includes(k.type));
const CORE_PASSIVES = CORE_KIT.filter((k) => ['Affinity', 'Nile Aura', 'Passive'].includes(k.type));

const flowerColor = (c) => ({
  red: '#ef4444', blue: '#3b82f6', yellow: '#eab308',
  green: '#22c55e', black: '#3f3f46', oni: '#a855f7',
}[c] || '#78716c');

// ───────────────────────────── controls ─────────────────────────────

function Stepper({ value, onDec, onInc, tone = 'text-stone-100', size = 'md' }) {
  const btn = size === 'lg' ? 'h-8 w-8 text-lg' : size === 'sm' ? 'h-5 w-5 text-[13px]' : 'h-6 w-6 text-sm';
  const num = size === 'lg' ? 'w-8 text-2xl' : size === 'sm' ? 'w-5 text-sm' : 'w-6 text-lg';
  return (
    <div className="flex items-center gap-1">
      <button onClick={onDec} className={`grid ${btn} place-items-center rounded-md border border-stone-700 bg-stone-800 leading-none text-stone-400 transition hover:border-stone-500 hover:text-white active:scale-90`} aria-label="decrease">−</button>
      <span className={`${num} text-center font-mono font-black tabular-nums ${tone}`}>{value}</span>
      <button onClick={onInc} className={`grid ${btn} place-items-center rounded-md border border-stone-700 bg-stone-800 leading-none text-stone-400 transition hover:border-stone-500 hover:text-white active:scale-90`} aria-label="increase">+</button>
    </div>
  );
}

function SectionHeader({ children, right }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-serif text-sm font-black uppercase tracking-[0.15em] text-stone-200">
        <span className="inline-block h-4 w-1 rounded-full bg-emerald-400" />{children}
      </h2>
      {right}
    </div>
  );
}

// ───────────────────────────── spell pieces ─────────────────────────────

const TRAIT_ACCENT = {
  Passive: 'text-stone-300', Debuff: 'text-purple-300', Buff: 'text-emerald-300', Summon: 'text-sky-300',
};

// A prominent usable-spell row: number + name, full text on hover.
function SpellPill({ index, name, desc, level, aff }) {
  const st = AFF_STYLE[aff];
  const tint = level === 'Advanced'
    ? 'border-rose-500/40 bg-rose-500/[0.07] hover:bg-rose-500/15'
    : level === 'Inter'
      ? 'border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/12'
      : 'border-stone-700/70 bg-stone-900/70 hover:bg-stone-800';
  return (
    <Tip content={desc} title={name} accent={st.text} className="block">
      <span className={`flex cursor-help items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition ${tint}`}>
        {index != null && (
          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-xs font-black ${st.softBg} ${st.text}`}>{index}</span>
        )}
        <span className="truncate text-sm font-semibold text-stone-50">{name}</span>
      </span>
    </Tip>
  );
}

// Equipped-school panel for the Play tab — its own petal counter in the header.
function EquippedPanel({ school, petals, onPetal, onRemove, onOpen }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-stone-900/50 ${st.border} ${st.glow}`}>
      {/* title */}
      <div className={`flex items-start justify-between gap-2 border-b border-stone-800 bg-gradient-to-b ${st.grad} to-transparent px-3 pb-2 pt-2.5`}>
        <div className="min-w-0">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${st.text}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${st.dot}`} />{AFFINITIES[school.affinity].icon} {school.affinity}
          </div>
          <button onClick={() => onOpen(school)} className="block truncate text-left font-serif text-lg font-black leading-tight text-white hover:underline">{school.name}</button>
        </div>
        <button onClick={() => onRemove(school.id)} className="shrink-0 rounded-md border border-stone-700 px-1.5 py-0.5 text-[10px] text-stone-500 transition hover:border-rose-500/50 hover:text-rose-300" title="Unequip">✕</button>
      </div>

      {/* petal counter for this affinity — right next to the spells */}
      <div className={`flex items-center justify-between border-b border-stone-800 px-3 py-1.5 ${st.softBg}`}>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${st.text}`}>Petals</span>
        <Stepper size="md" tone={st.text} value={petals} onDec={() => onPetal(-1)} onInc={() => onPetal(+1)} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div className="flex flex-wrap gap-1">
          {school.traits.map((t, i) => (
            <Tip key={i} content={t.desc} title={t.name} accent={st.text} className="cursor-help">
              <span className={`rounded-md border border-stone-700/70 bg-stone-900/70 px-1.5 py-0.5 text-[10px] font-semibold ${TRAIT_ACCENT[t.type] || 'text-stone-300'}`}>
                {t.type === 'Passive' ? '◆' : t.type === 'Debuff' ? '▼' : t.type === 'Buff' ? '▲' : '✦'} {t.name}
              </span>
            </Tip>
          ))}
        </div>

        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
            <span className={`rounded px-1 ${st.softBg} ${st.text}`}>1P</span> Minor · d{school.minorDie}
          </div>
          <div className="grid gap-1">{school.minors.map((s, i) => <SpellPill key={i} index={i + 1} name={s.name} desc={s.desc} level="Minor" aff={school.affinity} />)}</div>
        </div>

        {school.inters.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
              <span className="rounded bg-amber-500/15 px-1 text-amber-300">2P</span> Inter · d{school.interDie}
            </div>
            <div className="grid gap-1">{school.inters.map((s, i) => <SpellPill key={i} index={i + 1} name={s.name} desc={s.desc} level="Inter" aff={school.affinity} />)}</div>
          </div>
        )}

        {school.advanced && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
              <span className="rounded bg-rose-500/15 px-1 text-rose-300">4P</span> Advanced
            </div>
            <SpellPill name={school.advanced.name} desc={school.advanced.desc} level="Advanced" aff={school.affinity} />
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── school detail modal ─────────────────────────────

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
  return <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[level] || map.Passive}`}>{level}</span>;
}

function DetailRow({ level, name, desc, cost }) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-stone-800 bg-stone-900/50 p-2.5">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <LevelBadge level={level} />
        {cost && <span className="font-mono text-[10px] text-stone-500">{cost}</span>}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-stone-100">{name}</div>
        <div className="text-xs leading-relaxed text-stone-400">{desc}</div>
      </div>
    </div>
  );
}

function SchoolDetail({ school, onClose, inLoadout, canAdd, blockReason, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className={`flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border bg-stone-950 sm:rounded-3xl ${st.border} ${st.glow}`} onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-start justify-between gap-3 border-b border-stone-800 bg-gradient-to-b ${st.grad} to-transparent p-4`}>
          <div>
            <div className={`mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${st.text}`}><span>{AFFINITIES[school.affinity].icon}</span>{school.affinity} Affinity</div>
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
          {school.note && <div className={`rounded-lg border px-3 py-2 text-xs ${st.chip}`}>{school.note}</div>}
          {school.traits.map((t, i) => <DetailRow key={`t${i}`} level={t.type} name={t.name} desc={t.desc} />)}
          {school.minors.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500">Minors · 1 Petal</div>
              <div className="space-y-2">{school.minors.map((s, i) => <DetailRow key={i} level="Minor" name={s.name} desc={s.desc} cost={`d${school.minorDie}:${i + 1}`} />)}</div>
            </div>
          )}
          {school.inters.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500">Intermediates · 2 Petals</div>
              <div className="space-y-2">{school.inters.map((s, i) => <DetailRow key={i} level="Inter" name={s.name} desc={s.desc} cost={`d${school.interDie}:${i + 1}`} />)}</div>
            </div>
          )}
          {school.advanced && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500">Advanced · 4 Petals</div>
              <DetailRow level="Advanced" name={school.advanced.name} desc={school.advanced.desc} />
            </div>
          )}
        </div>
        <div className="border-t border-stone-800 p-3">
          <button onClick={() => onToggle(school.id)} disabled={!inLoadout && !canAdd}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              inLoadout ? 'border border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                : canAdd ? `${st.solid} text-stone-950 hover:brightness-110`
                : 'cursor-not-allowed border border-stone-800 bg-stone-900 text-stone-600'}`}>
            {inLoadout ? 'Remove from Loadout' : canAdd ? 'Add to Loadout' : blockReason === 'full' ? 'Loadout full (4 schools)' : `${school.affinity} slot already taken`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── schools browser row ─────────────────────────────

function BrowseRow({ school, inLoadout, disabled, reason, onOpen, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition ${
      inLoadout ? `${st.border} ${st.softBg}` : `border-stone-800 bg-stone-900/40 ${!disabled ? st.hover : ''}`
    } ${disabled && !inLoadout ? 'opacity-40' : ''}`}>
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
      <Tip content={school.traits[0]?.desc} title={`${school.traits[0]?.name} · passive`} accent={st.text} className="min-w-0 flex-1 cursor-help">
        <button onClick={() => onOpen(school)} className="block w-full min-w-0 text-left">
          <span className="truncate font-serif text-sm font-bold text-white">{school.name}</span>
          <span className="ml-1.5 text-[10px] text-stone-500">{school.minors.length + school.inters.length + (school.advanced ? 1 : 0)} · d{school.minorDie}{school.interDie ? `/d${school.interDie}` : ''}</span>
        </button>
      </Tip>
      <button onClick={() => onToggle(school.id)} disabled={disabled && !inLoadout}
        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold transition ${
          inLoadout ? 'border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
            : disabled ? 'cursor-not-allowed border border-stone-800 text-stone-600'
            : `${st.chip} hover:brightness-125`}`}>
        {inLoadout ? '−' : disabled ? (reason === 'full' ? 'Full' : 'Taken') : '+ Add'}
      </button>
    </div>
  );
}

function LoadoutRow({ entry, onApply, onDelete }) {
  const ids = entry.schools.map((s) => (SCHOOL_BY_ID[s] ? s : SCHOOL_BY_NAME[s]?.id)).filter(Boolean);
  const schools = ids.map((id) => SCHOOL_BY_ID[id]);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/50 p-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-stone-200">{entry.name}</div>
        <div className="mt-0.5 flex flex-wrap gap-1">{schools.map((s) => <span key={s.id} className={`rounded px-1 py-0.5 text-[9px] ${AFF_STYLE[s.affinity].chip}`}>{s.name}</span>)}</div>
      </div>
      <button onClick={() => onApply(ids)} className="shrink-0 rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-bold text-stone-950 hover:brightness-110">Load</button>
      {onDelete && <button onClick={onDelete} className="shrink-0 rounded-md border border-stone-700 px-1.5 py-1 text-[11px] text-stone-500 hover:border-rose-500/50 hover:text-rose-300">✕</button>}
    </div>
  );
}

const TABS = [
  { id: 'play', label: 'Play', icon: '🎲' },
  { id: 'schools', label: 'Schools', icon: '📖' },
  { id: 'reference', label: 'Reference', icon: '📜' },
];

// ───────────────────────────── main ─────────────────────────────

export default function CharacterSheet({ onBack }) {
  const gil = useGilSheet();
  const { state } = gil;
  const [tab, setTab] = useState('play');
  const [detail, setDetail] = useState(null);
  const [affFilter, setAffFilter] = useState('All');
  const [saveName, setSaveName] = useState('');
  const [showLoadouts, setShowLoadouts] = useState(false);

  const loadoutSchools = state.loadout.map((id) => SCHOOL_BY_ID[id]).filter(Boolean);
  const usedAffinities = new Set(loadoutSchools.map((s) => s.affinity));
  const looseAffinities = AFFINITY_ORDER.filter((a) => !usedAffinities.has(a));
  const groupedSchools = useMemo(() => {
    const order = affFilter === 'All' ? AFFINITY_ORDER : [affFilter];
    return order.map((a) => ({ affinity: a, schools: SCHOOLS.filter((s) => s.affinity === a) }));
  }, [affFilter]);
  const activeStat = (s) => (state.ardenvale ? s.ardenvale : s.base);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <div className="pointer-events-none fixed left-[-10%] top-[-15%] h-[45%] w-[45%] rounded-full bg-emerald-900/10 blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] h-[50%] w-[50%] rounded-full bg-emerald-900/[0.07] blur-[150px]" />

      {/* top bar */}
      <nav className="sticky top-0 z-30 flex items-center gap-2 border-b border-stone-800 bg-stone-950/90 px-3 py-2 backdrop-blur">
        <button onClick={onBack} className="rounded-lg border border-stone-700 bg-stone-900/80 px-2.5 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-emerald-400 hover:text-emerald-300">← Back</button>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === t.id ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={gil.toggleArdenvale} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${state.ardenvale ? 'border-amber-400/60 bg-amber-500/15 text-amber-300 shadow-[0_0_18px_-6px_rgba(251,191,36,0.6)]' : 'border-stone-700 bg-stone-900/60 text-stone-400 hover:border-stone-500'}`} title="Toggle Ardenvale (Champion bonus)">
          {state.ardenvale ? '🌟 Ardenvale' : '🌙 Base'}
        </button>
      </nav>

      <div className="relative mx-auto max-w-[1600px] p-3 sm:p-4">
        {/* ═══════════════ PLAY ═══════════════ */}
        {tab === 'play' && (
          <div className="space-y-4">
            {/* identity + stats */}
            <section className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] via-stone-900/40 to-stone-900/40">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-emerald-500/50 to-emerald-700/20 blur-md" />
                    <img src={assetUrl(IDENTITY.image)} alt={IDENTITY.fullName} className="relative h-24 w-24 rounded-2xl border-2 border-emerald-500/50 object-cover object-top shadow-xl sm:h-28 sm:w-28" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">{IDENTITY.title}</div>
                    <h1 className="bg-gradient-to-br from-white to-emerald-300 bg-clip-text font-serif text-4xl font-black leading-none text-transparent sm:text-5xl">{IDENTITY.name}</h1>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-200">🌑 {IDENTITY.affinity}</span>
                      <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-200">⚠ Weak: {IDENTITY.weakness}</span>
                      {IDENTITY.phases.map((p) => <span key={p} className="rounded-full border border-stone-700 bg-stone-800/50 px-2 py-0.5 text-[10px] text-stone-400">{p}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex-1" />
                {/* stats */}
                <div className="grid grid-cols-5 gap-2">
                  {STATS.map((s) => {
                    const boosted = state.ardenvale && s.ardenvale !== s.base;
                    return (
                      <Tip key={s.key} content={boosted ? `Base ${s.base} → Ardenvale ${s.ardenvale}` : 'Base value'} title={s.label} className="cursor-help">
                        <div className={`min-w-[54px] rounded-xl border px-2 py-1.5 text-center ${boosted ? 'border-amber-500/40 bg-amber-500/10' : 'border-stone-700/70 bg-stone-900/50'}`}>
                          <div className="text-[9px] font-bold uppercase leading-tight text-stone-500">{s.label.replace(' (DM)', '')}</div>
                          <div className={`font-mono text-2xl font-black tabular-nums ${boosted ? 'text-amber-300' : 'text-stone-100'}`}>{activeStat(s)}</div>
                        </div>
                      </Tip>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* bursts + loose petals */}
            <section className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-3">
                <SectionHeader right={<button onClick={gil.resetTrackers} className="rounded-md border border-stone-800 px-2 py-1 text-[10px] text-stone-500 transition hover:border-rose-500/40 hover:text-rose-300">Reset for new fight</button>}>Bursts / Tokens</SectionHeader>
                <div className="grid grid-cols-5 gap-2">
                  {BURSTS.map((b) => (
                    <div key={b.key} className="flex flex-col items-center gap-1 rounded-xl border border-stone-800 bg-stone-950/50 px-2 py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{b.label}</span>
                      <Stepper size="lg" tone="text-sky-300" value={state.bursts[b.key]} onDec={() => gil.bump('bursts', b.key, -1)} onInc={() => gil.bump('bursts', b.key, +1)} />
                    </div>
                  ))}
                </div>
              </div>
              {looseAffinities.length > 0 && (
                <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-3">
                  <SectionHeader>Loose Petals</SectionHeader>
                  <div className="flex gap-2">
                    {looseAffinities.map((a) => (
                      <div key={a} className="flex flex-col items-center gap-1 rounded-xl border border-stone-800 bg-stone-950/50 px-2 py-2">
                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${AFF_STYLE[a].text}`}><span className={`inline-block h-1.5 w-1.5 rounded-full ${AFF_STYLE[a].dot}`} />{a}</span>
                        <Stepper size="lg" tone={AFF_STYLE[a].text} value={state.petals[a]} onDec={() => gil.bump('petals', a, -1)} onInc={() => gil.bump('petals', a, +1)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* signature kit */}
            <section>
              <SectionHeader right={<span className="text-[10px] text-stone-600">hover for full text</span>}>Signature Kit</SectionHeader>
              <div className="flex flex-wrap gap-1.5">
                {CORE_ACTIONS.map((k, i) => (
                  <Tip key={i} content={k.desc} title={`${k.name} · ${k.type}${k.tag ? ` (${k.tag})` : ''}`} className="cursor-help">
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-2.5 py-1.5 text-sm font-semibold text-stone-50 transition hover:border-emerald-400/60 hover:bg-emerald-500/15">{k.name}</span>
                  </Tip>
                ))}
                {CORE_PASSIVES.map((k, i) => (
                  <Tip key={i} content={k.desc} title={`${k.name} · ${k.type}`} className="cursor-help">
                    <span className="rounded-lg border border-stone-800 bg-stone-900/50 px-2 py-1.5 text-xs text-stone-400 transition hover:border-stone-600 hover:text-stone-200">◆ {k.name}</span>
                  </Tip>
                ))}
              </div>
            </section>

            {/* equipped schools — the focus */}
            <section>
              <SectionHeader right={
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-stone-500'}`}>{state.loadout.length}/4</span>
                  <button onClick={() => setTab('schools')} className="rounded-md border border-stone-700 px-2.5 py-1 text-[11px] font-semibold text-stone-300 transition hover:border-emerald-400 hover:text-emerald-300">Manage schools</button>
                </div>
              }>Equipped Spells</SectionHeader>

              {loadoutSchools.length === 0 ? (
                <button onClick={() => setTab('schools')} className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-800 bg-stone-900/30 py-12 text-sm text-stone-500 transition hover:border-emerald-600/50 hover:text-emerald-300">
                  <span className="mb-1 text-3xl">📖</span>No schools equipped — pick 4 (one per affinity)
                </button>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {loadoutSchools.map((s) => (
                    <EquippedPanel key={s.id} school={s} petals={state.petals[s.affinity]} onPetal={(d) => gil.bump('petals', s.affinity, d)} onRemove={gil.toggleSchool} onOpen={setDetail} />
                  ))}
                  {loadoutSchools.length < 4 && (
                    <button onClick={() => setTab('schools')} className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-800 bg-stone-900/20 text-xs text-stone-600 transition hover:border-emerald-600/50 hover:text-emerald-300">+ Add school</button>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ═══════════════ SCHOOLS ═══════════════ */}
        {tab === 'schools' && (
          <div className="space-y-4">
            {/* active loadout — compact */}
            <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <SectionHeader>Active Loadout <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-stone-500">4 schools · one per affinity</span></SectionHeader>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-stone-500'}`}>{state.loadout.length}/4</span>
                  {state.loadout.length > 0 && <button onClick={gil.clearLoadout} className="rounded-md border border-stone-700 px-2 py-1 text-[11px] text-stone-400 hover:border-rose-500/50 hover:text-rose-300">Clear</button>}
                  <button onClick={() => setShowLoadouts((v) => !v)} className="rounded-md border border-stone-700 px-2 py-1 text-[11px] font-semibold text-stone-300 hover:border-emerald-400 hover:text-emerald-300">Saved loadouts {showLoadouts ? '▴' : '▾'}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => {
                  const s = loadoutSchools[i];
                  if (!s) return <div key={i} className="flex min-h-[56px] items-center justify-center rounded-lg border-2 border-dashed border-stone-800 bg-stone-900/30 text-[11px] text-stone-600">Empty</div>;
                  const st = AFF_STYLE[s.affinity];
                  return (
                    <div key={i} className={`relative min-h-[56px] rounded-lg border bg-gradient-to-br ${st.grad} to-stone-900/40 p-2 ${st.border}`}>
                      <button onClick={() => gil.toggleSchool(s.id)} className="absolute right-1.5 top-1 text-stone-500 hover:text-rose-300">✕</button>
                      <div className={`flex items-center gap-1 text-[9px] font-bold uppercase ${st.text}`}>{AFFINITIES[s.affinity].icon} {s.affinity}</div>
                      <button onClick={() => setDetail(s)} className="mt-0.5 block truncate text-left font-serif text-sm font-bold leading-tight text-white hover:underline">{s.name}</button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name this loadout to save…" className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-1.5 text-sm text-stone-100 placeholder-stone-600 outline-none focus:border-emerald-400" />
                <button onClick={() => { gil.saveCurrentLoadout(saveName); setSaveName(''); setShowLoadouts(true); }} disabled={!state.loadout.length} className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-stone-800 disabled:text-stone-600">Save</button>
              </div>

              {showLoadouts && (
                <div className="mt-3 grid gap-3 border-t border-stone-800 pt-3 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">My Saved</h3>
                    {state.saved.length ? <div className="space-y-1.5">{state.saved.map((sv) => <LoadoutRow key={sv.id} entry={sv} onApply={gil.applyLoadout} onDelete={() => gil.deleteSaved(sv.id)} />)}</div> : <p className="text-[11px] text-stone-600">Nothing saved yet.</p>}
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Past (old sheets)</h3>
                    <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">{PAST_LOADOUTS.map((sv) => <LoadoutRow key={sv.name} entry={sv} onApply={gil.applyLoadout} />)}</div>
                  </div>
                </div>
              )}
            </section>

            {/* full school browser — the priority */}
            <section>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <SectionHeader>All Spell Schools <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-stone-500">({SCHOOLS.length}) · click a name for full details</span></SectionHeader>
                <div className="flex-1" />
                <div className="flex flex-wrap gap-1">
                  {['All', ...AFFINITY_ORDER].map((a) => {
                    const on = affFilter === a;
                    const st = a !== 'All' ? AFF_STYLE[a] : null;
                    return <button key={a} onClick={() => setAffFilter(a)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${on ? (a === 'All' ? 'bg-emerald-500 text-stone-950' : `${st.solid} text-stone-950`) : 'border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'}`}>{a === 'All' ? 'All' : `${AFFINITIES[a].icon} ${a}`}</button>;
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                {groupedSchools.map((grp) => (
                  <div key={grp.affinity} className="min-w-0">
                    <div className={`mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${AFF_STYLE[grp.affinity].text}`}>
                      <span className={`inline-block h-2 w-2 rounded-full ${AFF_STYLE[grp.affinity].dot}`} />{AFFINITIES[grp.affinity].icon} {grp.affinity} <span className="font-normal text-stone-600">({grp.schools.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {grp.schools.map((s) => {
                        const inLoadout = state.loadout.includes(s.id);
                        const reason = gil.blockReason(s.id);
                        return <BrowseRow key={s.id} school={s} inLoadout={inLoadout} disabled={!inLoadout && reason != null} reason={reason} onOpen={setDetail} onToggle={gil.toggleSchool} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ═══════════════ REFERENCE ═══════════════ */}
        {tab === 'reference' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <SectionHeader>Passives & Actions</SectionHeader>
              <div className="space-y-1.5">
                {CORE_KIT.map((k, i) => (
                  <div key={i} className="rounded-lg border border-stone-800 bg-stone-900/40 p-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[13px] font-bold text-stone-100">{k.name}</span>
                      <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[9px] uppercase text-stone-500">{k.type}{k.tag ? ` (${k.tag})` : ''}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] leading-relaxed text-stone-400">{k.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-5">
              <section>
                <SectionHeader>How Casting Works</SectionHeader>
                <div className="grid grid-cols-3 gap-1.5">
                  {CASTING_RULES.map((c) => (
                    <div key={c.cost} className="rounded-xl border border-stone-800 bg-stone-900/50 p-2.5 text-center">
                      <div className="font-serif text-sm font-black text-emerald-300">{c.cost}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-stone-400">{c.effect}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionHeader>The Garden — Flowers</SectionHeader>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {FLOWERS.map((f) => (
                    <Tip key={f.name} content={f.desc} title={`${f.name} Flower`} className="cursor-help">
                      <div className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/40 px-2 py-1.5">
                        <span className="h-4 w-4 shrink-0 rounded-full border border-stone-600" style={{ backgroundColor: flowerColor(f.color) }} />
                        <span className="text-[13px] font-semibold text-stone-100">{f.name}</span>
                      </div>
                    </Tip>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-stone-500">Flowers bloom on 86+. Cultivation rolls 2d100 (3d100 with a Green Flower) at end of turn.</p>
              </section>

              <section>
                <SectionHeader>Blessed Items</SectionHeader>
                <div className="flex flex-wrap gap-1.5">
                  {BLESSED_ITEMS.map((it) => (
                    <Tip key={it.name} content={it.desc} title={it.name} className="cursor-help">
                      <span className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-2.5 py-1.5 text-[13px] font-semibold text-amber-200 transition hover:bg-amber-500/12">{it.name}</span>
                    </Tip>
                  ))}
                </div>
              </section>

              <section>
                <SectionHeader right={<span className="text-[10px] text-stone-500">tap when triggered</span>}>Bloom Bingo</SectionHeader>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {BLOOM_BINGO.map((b) => {
                    const on = !!state.bloom[b.sin];
                    return (
                      <button key={b.sin} onClick={() => gil.toggleBloom(b.sin)} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition ${on ? 'border-rose-500/50 bg-rose-500/10' : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'}`}>
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border text-[11px] ${on ? 'border-rose-400 bg-rose-500 text-white' : 'border-stone-600 text-transparent'}`}>✓</span>
                        <span className="min-w-0">
                          <span className={`block text-[13px] font-bold ${on ? 'text-rose-200 line-through' : 'text-stone-100'}`}>{b.sin}</span>
                          <span className="block truncate text-[10px] text-stone-500">{b.trigger}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <SchoolDetail school={detail} onClose={() => setDetail(null)} inLoadout={state.loadout.includes(detail.id)} canAdd={gil.blockReason(detail.id) == null} blockReason={gil.blockReason(detail.id)} onToggle={(id) => gil.toggleSchool(id)} />
      )}
    </div>
  );
}
