// src/views/CharacterSheet.jsx
// Gil's live play dashboard — a glanceable second-screen reference for Roll20.
// Vitals stay pinned in a sidebar; the main panel shows your equipped spells
// with hover tooltips, a school manager, and a full reference.
import { useMemo, useState } from 'react';
import { assetUrl } from '../utils/assets';
import { useGilSheet } from '../hooks/useGilSheet';
import Tip from '../components/gil/Tip';
import {
  SCHOOLS, SCHOOL_BY_ID, AFFINITY_ORDER, AFFINITIES, AFF_STYLE, PAST_LOADOUTS, SCHOOL_BY_NAME,
} from '../data/gil/schools';
import {
  IDENTITY, STATS, BURSTS, RESOURCES, PETAL_AFFINITIES, CORE_KIT, FLOWERS,
  BLESSED_ITEMS, BLOOM_BINGO, CASTING_RULES,
} from '../data/gil/core';

const CORE_ACTIONS = CORE_KIT.filter((k) => ['Essential', 'Minor', 'Intermediate', 'Advanced'].includes(k.type));
const CORE_PASSIVES = CORE_KIT.filter((k) => ['Affinity', 'Nile Aura', 'Passive'].includes(k.type));

const flowerColor = (c) => ({
  red: '#ef4444', blue: '#3b82f6', yellow: '#eab308',
  green: '#22c55e', black: '#3f3f46', oni: '#a855f7',
}[c] || '#78716c');

// ───────────────────────────── tiny controls ─────────────────────────────

function Stepper({ value, onDec, onInc, tone = 'text-stone-100' }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onDec} className="grid h-5 w-5 place-items-center rounded border border-stone-700 bg-stone-800 text-[13px] leading-none text-stone-400 transition hover:border-stone-500 hover:text-white active:scale-90" aria-label="decrease">−</button>
      <span className={`w-5 text-center font-mono text-sm font-bold tabular-nums ${tone}`}>{value}</span>
      <button onClick={onInc} className="grid h-5 w-5 place-items-center rounded border border-stone-700 bg-stone-800 text-[13px] leading-none text-stone-400 transition hover:border-stone-500 hover:text-white active:scale-90" aria-label="increase">+</button>
    </div>
  );
}

function MiniRow({ label, dot, children }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-stone-900/50 px-2 py-1">
      <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-medium text-stone-300">
        {dot && <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />}
        {label}
      </span>
      {children}
    </div>
  );
}

function SideLabel({ children, right }) {
  return (
    <div className="mb-1.5 mt-3 flex items-center justify-between first:mt-0">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{children}</h3>
      {right}
    </div>
  );
}

// ───────────────────────────── spell pieces ─────────────────────────────

const TRAIT_ACCENT = {
  Passive: 'text-stone-400', Debuff: 'text-purple-300', Buff: 'text-emerald-300', Summon: 'text-sky-300',
};

// A compact spell pill: name + roll index; full text on hover.
function SpellPill({ index, name, desc, level, aff }) {
  const st = AFF_STYLE[aff];
  const levelTint = level === 'Advanced'
    ? 'border-rose-500/40 bg-rose-500/10'
    : level === 'Inter'
      ? 'border-amber-500/30 bg-amber-500/5'
      : 'border-stone-700/70 bg-stone-900/60';
  return (
    <Tip content={desc} title={name} accent={st.text} className="block">
      <span className={`flex cursor-help items-center gap-1.5 rounded-lg border px-2 py-1 text-left transition hover:brightness-125 ${levelTint}`}>
        {index != null && (
          <span className={`grid h-4 w-4 shrink-0 place-items-center rounded font-mono text-[10px] font-bold ${st.softBg} ${st.text}`}>{index}</span>
        )}
        <span className="truncate text-[13px] font-semibold text-stone-100">{name}</span>
      </span>
    </Tip>
  );
}

// An equipped-school panel for the Play tab.
function EquippedPanel({ school, onRemove, onOpen }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-stone-900/40 ${st.border}`}>
      <div className={`flex items-center justify-between gap-2 border-b border-stone-800 bg-gradient-to-b ${st.grad} to-transparent px-3 py-2`}>
        <div className="min-w-0">
          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${st.text}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${st.dot}`} />{school.affinity}
          </div>
          <button onClick={() => onOpen(school)} className="block truncate text-left font-serif text-base font-black leading-tight text-white hover:underline">
            {school.name}
          </button>
        </div>
        <button onClick={() => onRemove(school.id)} className="shrink-0 rounded-md border border-stone-700 px-1.5 py-0.5 text-[10px] text-stone-500 transition hover:border-rose-500/50 hover:text-rose-300" title="Unequip">✕</button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        {/* traits */}
        <div className="flex flex-wrap gap-1">
          {school.traits.map((t, i) => (
            <Tip key={i} content={t.desc} title={t.name} accent={st.text} className="cursor-help">
              <span className={`rounded-md border border-stone-700/70 bg-stone-900/70 px-1.5 py-0.5 text-[10px] font-semibold ${TRAIT_ACCENT[t.type] || 'text-stone-400'}`}>
                {t.type === 'Passive' ? '◆' : t.type === 'Debuff' ? '▼' : t.type === 'Buff' ? '▲' : '✦'} {t.name}
              </span>
            </Tip>
          ))}
        </div>

        {/* minors */}
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
            <span className={`rounded px-1 ${st.softBg} ${st.text}`}>1 Petal</span> Minor · roll d{school.minorDie}
          </div>
          <div className="grid grid-cols-1 gap-1">
            {school.minors.map((s, i) => <SpellPill key={i} index={i + 1} name={s.name} desc={s.desc} level="Minor" aff={school.affinity} />)}
          </div>
        </div>

        {/* inters */}
        {school.inters.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
              <span className="rounded bg-amber-500/15 px-1 text-amber-300">2 Petal</span> Inter · roll d{school.interDie}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {school.inters.map((s, i) => <SpellPill key={i} index={i + 1} name={s.name} desc={s.desc} level="Inter" aff={school.affinity} />)}
            </div>
          </div>
        )}

        {/* advanced */}
        {school.advanced && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
              <span className="rounded bg-rose-500/15 px-1 text-rose-300">4 Petal</span> Advanced
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
          <button
            onClick={() => onToggle(school.id)}
            disabled={!inLoadout && !canAdd}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              inLoadout ? 'border border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                : canAdd ? `${st.solid} text-stone-950 hover:brightness-110`
                : 'cursor-not-allowed border border-stone-800 bg-stone-900 text-stone-600'
            }`}
          >
            {inLoadout ? 'Remove from Loadout' : canAdd ? 'Add to Loadout'
              : blockReason === 'full' ? 'Loadout full (4 schools)' : `${school.affinity} slot already taken`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── school manager card ─────────────────────────────

function ManagerCard({ school, inLoadout, disabled, reason, onOpen, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 transition ${
      inLoadout ? `${st.border} ${st.softBg}` : `border-stone-800 bg-stone-900/40 ${!disabled ? st.hover : ''}`
    } ${disabled && !inLoadout ? 'opacity-45' : ''}`}>
      <Tip content={school.traits[0]?.desc} title={`${school.traits[0]?.name} (passive)`} accent={st.text} className="min-w-0 flex-1 cursor-help">
        <button onClick={() => onOpen(school)} className="block w-full min-w-0 text-left">
          <div className="truncate font-serif text-sm font-bold text-white">{school.name}</div>
          <div className="text-[10px] text-stone-500">{school.minors.length + school.inters.length + (school.advanced ? 1 : 0)} spells · d{school.minorDie}{school.interDie ? `/d${school.interDie}` : ''}</div>
        </button>
      </Tip>
      <button
        onClick={() => onToggle(school.id)}
        disabled={disabled && !inLoadout}
        className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
          inLoadout ? 'border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
            : disabled ? 'cursor-not-allowed border border-stone-800 text-stone-600'
            : `${st.chip} hover:brightness-125`
        }`}
      >
        {inLoadout ? '− Remove' : disabled ? (reason === 'full' ? 'Full' : 'Taken') : '+ Add'}
      </button>
    </div>
  );
}

// A saved / past loadout row.
function LoadoutRow({ entry, onApply, onDelete }) {
  const ids = entry.schools.map((s) => (SCHOOL_BY_ID[s] ? s : SCHOOL_BY_NAME[s]?.id)).filter(Boolean);
  const schools = ids.map((id) => SCHOOL_BY_ID[id]);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/50 p-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-stone-200">{entry.name}</div>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {schools.map((s) => <span key={s.id} className={`rounded px-1 py-0.5 text-[9px] ${AFF_STYLE[s.affinity].chip}`}>{s.name}</span>)}
        </div>
      </div>
      <button onClick={() => onApply(ids)} className="shrink-0 rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-900 hover:brightness-95">Load</button>
      {onDelete && <button onClick={onDelete} className="shrink-0 rounded-lg border border-stone-700 px-1.5 py-1 text-[11px] text-stone-500 hover:border-rose-500/50 hover:text-rose-300">✕</button>}
    </div>
  );
}

const TABS = [
  { id: 'play', label: 'Play', icon: '🎲' },
  { id: 'schools', label: 'Schools', icon: '📖' },
  { id: 'reference', label: 'Reference', icon: '📜' },
];

// ───────────────────────────── main view ─────────────────────────────

export default function CharacterSheet({ onBack }) {
  const gil = useGilSheet();
  const { state } = gil;
  const [tab, setTab] = useState('play');
  const [detail, setDetail] = useState(null);
  const [affFilter, setAffFilter] = useState('All');
  const [saveName, setSaveName] = useState('');

  const loadoutSchools = state.loadout.map((id) => SCHOOL_BY_ID[id]).filter(Boolean);
  const usedAffinities = new Set(loadoutSchools.map((s) => s.affinity));
  const visibleSchools = useMemo(
    () => (affFilter === 'All' ? SCHOOLS : SCHOOLS.filter((s) => s.affinity === affFilter)),
    [affFilter],
  );
  const activeStat = (s) => (state.ardenvale ? s.ardenvale : s.base);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {/* ambient */}
      <div className="pointer-events-none fixed left-[-10%] top-[-15%] h-[50%] w-[50%] rounded-full bg-violet-900/10 blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] h-[55%] w-[55%] rounded-full bg-rose-900/10 blur-[150px]" />

      <div className="relative mx-auto max-w-[1600px] lg:grid lg:grid-cols-[290px_1fr]">

        {/* ═══════════════ VITALS SIDEBAR ═══════════════ */}
        <aside className="border-b border-stone-800/80 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="p-3">
            {/* header */}
            <div className="mb-3 flex items-center gap-2">
              <button onClick={onBack} className="rounded-lg border border-stone-700 bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-stone-300 transition hover:border-amber-400 hover:text-amber-300">← Back</button>
              <div className="flex-1" />
              <button
                onClick={gil.toggleArdenvale}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold transition ${
                  state.ardenvale ? 'border-amber-400/60 bg-amber-500/15 text-amber-300 shadow-[0_0_18px_-6px_rgba(251,191,36,0.6)]' : 'border-stone-700 bg-stone-900/60 text-stone-400 hover:border-stone-500'
                }`}
                title="Toggle Ardenvale (Champion bonus)"
              >
                {state.ardenvale ? '🌟 Ardenvale' : '🌙 Base'}
              </button>
            </div>

            {/* identity */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-600/40 to-rose-600/20 blur-md" />
                <img src={assetUrl(IDENTITY.image)} alt={IDENTITY.fullName} className="relative h-16 w-16 rounded-xl border border-violet-500/40 object-cover object-top" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-2xl font-black leading-none text-white">{IDENTITY.name}</h1>
                <div className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-violet-300">{IDENTITY.title}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-200">🌑 {IDENTITY.affinity}</span>
                  <span className="rounded border border-fuchsia-500/40 bg-fuchsia-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-fuchsia-200">⚠ {IDENTITY.weakness}</span>
                </div>
              </div>
            </div>

            {/* phases */}
            <div className="mt-2 flex flex-wrap gap-1">
              {IDENTITY.phases.map((p) => <span key={p} className="rounded border border-stone-700 bg-stone-800/50 px-1.5 py-0.5 text-[9px] text-stone-400">{p}</span>)}
            </div>

            {/* stats */}
            <SideLabel>Stats</SideLabel>
            <div className="grid grid-cols-5 gap-1">
              {STATS.map((s) => {
                const boosted = state.ardenvale && s.ardenvale !== s.base;
                return (
                  <Tip key={s.key} content={boosted ? `Base ${s.base} → Ardenvale ${s.ardenvale}` : `Base value`} title={s.label} className="cursor-help">
                    <div className={`rounded-lg border px-1 py-1.5 text-center ${boosted ? 'border-amber-500/40 bg-amber-500/10' : 'border-stone-800 bg-stone-900/50'}`}>
                      <div className="text-[8px] font-bold uppercase leading-tight text-stone-500">{s.label.replace(' (DM)', '')}</div>
                      <div className={`font-mono text-base font-black tabular-nums ${boosted ? 'text-amber-300' : 'text-stone-100'}`}>{activeStat(s)}</div>
                    </div>
                  </Tip>
                );
              })}
            </div>

            {/* petals */}
            <SideLabel right={<span className="text-[9px] text-stone-600">1·2·4 = M·I·A</span>}>Petal Pool</SideLabel>
            <div className="grid grid-cols-2 gap-1">
              {PETAL_AFFINITIES.map((a) => (
                <MiniRow key={a} label={a} dot={AFF_STYLE[a].dot}>
                  <Stepper value={state.petals[a]} tone={AFF_STYLE[a].text} onDec={() => gil.bump('petals', a, -1)} onInc={() => gil.bump('petals', a, +1)} />
                </MiniRow>
              ))}
            </div>

            {/* tokens */}
            <SideLabel>Bursts / Tokens</SideLabel>
            <div className="grid grid-cols-2 gap-1">
              {BURSTS.map((b) => (
                <MiniRow key={b.key} label={b.label}>
                  <Stepper value={state.bursts[b.key]} tone="text-sky-300" onDec={() => gil.bump('bursts', b.key, -1)} onInc={() => gil.bump('bursts', b.key, +1)} />
                </MiniRow>
              ))}
            </div>

            {/* resources */}
            <SideLabel>Resources</SideLabel>
            <div className="grid grid-cols-1 gap-1">
              {RESOURCES.map((r) => (
                <MiniRow key={r.key} label={r.label}>
                  <Stepper value={state.resources[r.key]} tone="text-amber-300" onDec={() => gil.bump('resources', r.key, -1)} onInc={() => gil.bump('resources', r.key, +1)} />
                </MiniRow>
              ))}
            </div>

            <button onClick={gil.resetTrackers} className="mt-3 w-full rounded-lg border border-stone-800 py-1.5 text-[11px] text-stone-500 transition hover:border-rose-500/40 hover:text-rose-300">Reset trackers for new fight</button>
          </div>
        </aside>

        {/* ═══════════════ MAIN ═══════════════ */}
        <div className="min-w-0">
          {/* tab bar */}
          <nav className="sticky top-0 z-30 flex items-center gap-1 border-b border-stone-800 bg-stone-950/90 px-3 py-2 backdrop-blur">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === t.id ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
            <div className="flex-1" />
            <span className="hidden text-[11px] text-stone-600 sm:block">Hover any spell for its full text</span>
          </nav>

          <div className="p-3 sm:p-4">
            {/* ─────────── PLAY ─────────── */}
            {tab === 'play' && (
              <div className="space-y-4">
                {/* core kit */}
                <section>
                  <div className="mb-1.5 flex items-baseline gap-2">
                    <h2 className="font-serif text-sm font-black uppercase tracking-wide text-stone-300">Signature Kit</h2>
                    <span className="text-[10px] text-stone-600">always available</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CORE_ACTIONS.map((k, i) => (
                      <Tip key={i} content={k.desc} title={`${k.name} · ${k.type}${k.tag ? ` (${k.tag})` : ''}`} className="cursor-help">
                        <span className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/5 px-2 py-1 text-[13px] font-semibold text-stone-100 transition hover:border-violet-400/60 hover:bg-violet-500/10">
                          {k.name}
                        </span>
                      </Tip>
                    ))}
                    {CORE_PASSIVES.map((k, i) => (
                      <Tip key={i} content={k.desc} title={`${k.name} · ${k.type}`} className="cursor-help">
                        <span className="flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900/50 px-2 py-1 text-[11px] text-stone-400 transition hover:border-stone-600 hover:text-stone-200">
                          ◆ {k.name}
                        </span>
                      </Tip>
                    ))}
                  </div>
                </section>

                {/* equipped loadout */}
                <section>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-serif text-sm font-black uppercase tracking-wide text-stone-300">Equipped Schools</h2>
                      <span className={`font-mono text-xs font-bold ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-stone-500'}`}>{state.loadout.length}/4</span>
                    </div>
                    <button onClick={() => setTab('schools')} className="rounded-lg border border-stone-700 px-2.5 py-1 text-[11px] font-semibold text-stone-300 transition hover:border-amber-400 hover:text-amber-300">Manage ⚙</button>
                  </div>

                  {loadoutSchools.length === 0 ? (
                    <button onClick={() => setTab('schools')} className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-800 bg-stone-900/30 py-10 text-sm text-stone-500 transition hover:border-stone-600 hover:text-stone-300">
                      <span className="mb-1 text-2xl">📖</span>
                      No schools equipped — tap to pick 4 (one per affinity)
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                      {loadoutSchools.map((s) => <EquippedPanel key={s.id} school={s} onRemove={gil.toggleSchool} onOpen={setDetail} />)}
                      {loadoutSchools.length < 4 && (
                        <button onClick={() => setTab('schools')} className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-800 bg-stone-900/20 text-xs text-stone-600 transition hover:border-stone-600 hover:text-stone-400">
                          + Add school
                        </button>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ─────────── SCHOOLS ─────────── */}
            {tab === 'schools' && (
              <div className="space-y-5">
                {/* active loadout summary */}
                <section>
                  <div className="mb-2 flex items-end justify-between">
                    <div>
                      <h2 className="font-serif text-lg font-black text-white">Active Loadout</h2>
                      <p className="text-[11px] text-stone-500">Pick 4 schools — each a different Affinity.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-stone-400'}`}>{state.loadout.length}/4</span>
                      {state.loadout.length > 0 && <button onClick={gil.clearLoadout} className="rounded-lg border border-stone-700 px-2 py-1 text-[11px] text-stone-400 hover:border-rose-500/50 hover:text-rose-300">Clear</button>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => {
                      const s = loadoutSchools[i];
                      if (!s) return <div key={i} className="flex min-h-[70px] items-center justify-center rounded-xl border-2 border-dashed border-stone-800 bg-stone-900/30 text-[11px] text-stone-600">Empty</div>;
                      const st = AFF_STYLE[s.affinity];
                      return (
                        <div key={i} className={`relative min-h-[70px] rounded-xl border bg-gradient-to-br ${st.grad} to-stone-900/40 p-2.5 ${st.border}`}>
                          <button onClick={() => gil.toggleSchool(s.id)} className="absolute right-1.5 top-1.5 text-stone-500 hover:text-rose-300">✕</button>
                          <div className={`flex items-center gap-1 text-[9px] font-bold uppercase ${st.text}`}>{AFFINITIES[s.affinity].icon} {s.affinity}</div>
                          <button onClick={() => setDetail(s)} className="mt-0.5 block text-left font-serif text-sm font-bold leading-tight text-white hover:underline">{s.name}</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-stone-500">Affinities:</span>
                    {AFFINITY_ORDER.map((a) => {
                      const on = usedAffinities.has(a);
                      return <span key={a} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${on ? AFF_STYLE[a].chip : 'border border-stone-800 text-stone-600'}`}>{AFFINITIES[a].icon} {a}</span>;
                    })}
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name this loadout…" className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-1.5 text-sm text-stone-100 placeholder-stone-600 outline-none focus:border-amber-400" />
                    <button onClick={() => { gil.saveCurrentLoadout(saveName); setSaveName(''); }} disabled={!state.loadout.length} className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-stone-800 disabled:text-stone-600">Save</button>
                  </div>
                </section>

                {/* saved + past */}
                {(state.saved.length > 0 || PAST_LOADOUTS.length > 0) && (
                  <section className="grid gap-4 lg:grid-cols-2">
                    {state.saved.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">My Saved Loadouts</h3>
                        <div className="space-y-1.5">{state.saved.map((sv) => <LoadoutRow key={sv.id} entry={sv} onApply={gil.applyLoadout} onDelete={() => gil.deleteSaved(sv.id)} />)}</div>
                      </div>
                    )}
                    <div>
                      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">Past Loadouts (old sheets)</h3>
                      <div className="space-y-1.5">{PAST_LOADOUTS.map((sv) => <LoadoutRow key={sv.name} entry={sv} onApply={gil.applyLoadout} />)}</div>
                    </div>
                  </section>
                )}

                {/* browser */}
                <section>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-lg font-black text-white">All Schools <span className="text-sm font-normal text-stone-500">({SCHOOLS.length})</span></h2>
                    <div className="flex flex-wrap gap-1">
                      {['All', ...AFFINITY_ORDER].map((a) => {
                        const on = affFilter === a;
                        const st = a !== 'All' ? AFF_STYLE[a] : null;
                        return <button key={a} onClick={() => setAffFilter(a)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${on ? (a === 'All' ? 'bg-stone-100 text-stone-900' : `${st.solid} text-stone-950`) : 'border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'}`}>{a === 'All' ? 'All' : `${AFFINITIES[a].icon} ${a}`}</button>;
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleSchools.map((s) => {
                      const inLoadout = state.loadout.includes(s.id);
                      const reason = gil.blockReason(s.id);
                      return <ManagerCard key={s.id} school={s} inLoadout={inLoadout} disabled={!inLoadout && reason != null} reason={reason} onOpen={setDetail} onToggle={gil.toggleSchool} />;
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* ─────────── REFERENCE ─────────── */}
            {tab === 'reference' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <section>
                  <h2 className="mb-2 font-serif text-lg font-black text-white">Passives & Actions</h2>
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
                    <h2 className="mb-2 font-serif text-lg font-black text-white">How Casting Works</h2>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CASTING_RULES.map((c) => (
                        <div key={c.cost} className="rounded-xl border border-stone-800 bg-stone-900/50 p-2.5 text-center">
                          <div className="font-serif text-sm font-black text-amber-300">{c.cost}</div>
                          <div className="mt-0.5 text-[10px] leading-tight text-stone-400">{c.effect}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-2 font-serif text-lg font-black text-white">The Garden — Flowers</h2>
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
                    <h2 className="mb-2 font-serif text-lg font-black text-white">Blessed Items</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {BLESSED_ITEMS.map((it) => (
                        <Tip key={it.name} content={it.desc} title={it.name} className="cursor-help">
                          <span className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-[13px] font-semibold text-amber-200 transition hover:bg-amber-500/10">{it.name}</span>
                        </Tip>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="font-serif text-lg font-black text-white">Bloom Bingo</h2>
                      <span className="text-[10px] text-stone-500">tap when triggered</span>
                    </div>
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
        </div>
      </div>

      {detail && (
        <SchoolDetail
          school={detail}
          onClose={() => setDetail(null)}
          inLoadout={state.loadout.includes(detail.id)}
          canAdd={gil.blockReason(detail.id) == null}
          blockReason={gil.blockReason(detail.id)}
          onToggle={(id) => gil.toggleSchool(id)}
        />
      )}
    </div>
  );
}
