// src/views/CharacterSheet.jsx
// Gil's play sheet. Deliberately restrained: black ground, thin rules, tabular
// numbers. Names are visible; every long rules paragraph lives in a tooltip so
// the page stays scannable at a glance on a second monitor.
import { useMemo, useState } from 'react';
import { assetUrl } from '../utils/assets';
import { useGilSheet } from '../hooks/useGilSheet';
import Tip from '../components/gil/Tip';
import {
  SCHOOLS, SCHOOL_BY_ID, AFFINITY_ORDER, AFF_STYLE, PAST_LOADOUTS, SCHOOL_BY_NAME,
} from '../data/gil/schools';
import {
  IDENTITY, STATS, BURSTS, MAX_HP, CORE_KIT, FLOWERS,
  BLESSED_ITEMS, BLOOM_BINGO, CASTING_RULES,
} from '../data/gil/core';

const ACTION_TYPES = ['Essential', 'Minor', 'Intermediate', 'Advanced'];
const CORE_ACTIONS = CORE_KIT.filter((k) => ACTION_TYPES.includes(k.type));
const CORE_PASSIVES = CORE_KIT.filter((k) => !ACTION_TYPES.includes(k.type));

const FLOWER_HEX = {
  Red: '#dc2626', Blue: '#2563eb', Yellow: '#ca8a04',
  Green: '#16a34a', 'Black Root': '#404040', Oni: '#7c3aed',
};

// ─────────────────────────── primitives ───────────────────────────

function Stepper({ value, onDec, onInc, tone = 'text-neutral-100', wide }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onDec} className="grid h-6 w-6 place-items-center rounded border border-neutral-800 text-sm leading-none text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200 active:scale-90" aria-label="decrease">−</button>
      <span className={`${wide ? 'w-8' : 'w-6'} text-center font-mono text-sm font-semibold tabular-nums ${value === 0 ? 'text-neutral-600' : tone}`}>{value}</span>
      <button onClick={onInc} className="grid h-6 w-6 place-items-center rounded border border-neutral-800 text-sm leading-none text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200 active:scale-90" aria-label="increase">+</button>
    </div>
  );
}

// Section heading: small, uppercase, hairline rule. No decoration.
function Section({ title, right, children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-neutral-800 pb-1.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

// A name you can hover for its rules text — dotted underline signals it.
function HoverName({ title, desc, accent, className = '' }) {
  return (
    <Tip content={desc} title={title} accent={accent} className="inline-block cursor-help">
      <span className={`border-b border-dotted border-neutral-700 transition hover:border-neutral-400 ${className}`}>{title}</span>
    </Tip>
  );
}

const TYPE_LABEL = {
  Essential: 'text-neutral-300', Minor: 'text-neutral-400',
  Intermediate: 'text-amber-400/80', Advanced: 'text-rose-400/80',
};

// ─────────────────────────── core kit table ───────────────────────────

function CoreKitTable({ uses, onUse }) {
  return (
    <div className="overflow-hidden rounded border border-neutral-800">
      <div className="grid grid-cols-[86px_84px_1fr] items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        <span>Used</span><span>Type</span><span>Ability</span>
      </div>
      {CORE_ACTIONS.map((k) => (
        <div key={k.name + k.type} className="grid grid-cols-[86px_84px_1fr] items-center gap-2 border-b border-neutral-900 px-2.5 py-1.5 transition last:border-b-0 hover:bg-neutral-950">
          <Stepper value={uses[k.name] || 0} tone="text-emerald-400" onDec={() => onUse(k.name, -1)} onInc={() => onUse(k.name, +1)} />
          <span className={`text-[11px] ${TYPE_LABEL[k.type] || 'text-neutral-400'}`}>
            {k.type === 'Intermediate' ? 'Int' : k.type}{k.tag && k.tag !== '-' ? ` (${k.tag})` : ''}
          </span>
          <HoverName title={k.name} desc={k.desc} className="text-sm font-medium text-neutral-100" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────── equipped school ───────────────────────────

function SpellRow({ n, name, desc, aff, tier }) {
  const st = AFF_STYLE[aff];
  const tierTone = tier === 'adv' ? 'text-rose-300' : tier === 'int' ? 'text-amber-200' : 'text-neutral-100';
  return (
    <Tip content={desc} title={name} accent={st.text} className="block cursor-help">
      <span className="flex items-center gap-2 rounded px-1.5 py-1 transition hover:bg-neutral-900">
        <span className="w-3 shrink-0 font-mono text-[10px] text-neutral-600">{n ?? '·'}</span>
        <span className={`truncate text-[13px] ${tierTone}`}>{name}</span>
      </span>
    </Tip>
  );
}

function TierLabel({ cost, children }) {
  return (
    <div className="mt-1.5 flex items-center gap-1.5 px-1.5 text-[10px] uppercase tracking-wider text-neutral-600">
      <span className="font-mono text-neutral-500">{cost}</span>{children}
    </div>
  );
}

function EquippedSchool({ school, petals, onPetal, onRemove, onOpen }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className="flex min-w-0 flex-col rounded border border-neutral-800 bg-neutral-950/40">
      <div className="flex items-start justify-between gap-2 border-b border-neutral-800 px-2.5 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${st.text}`}>{school.affinity}</span>
          </div>
          <button onClick={() => onOpen(school)} className="mt-0.5 block truncate text-left text-sm font-semibold text-neutral-50 hover:text-emerald-400">{school.name}</button>
        </div>
        <button onClick={() => onRemove(school.id)} className="shrink-0 text-xs text-neutral-700 transition hover:text-rose-400" title="Unequip">✕</button>
      </div>

      {/* petals for this affinity, right where its spells are */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-2.5 py-1.5">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500">Petals</span>
        <Stepper value={petals} tone={st.text} onDec={() => onPetal(-1)} onInc={() => onPetal(+1)} />
      </div>

      <div className="px-1 pb-2">
        {school.traits.length > 0 && (
          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 px-1.5 pt-1.5">
            {school.traits.map((t, i) => (
              <HoverName key={i} title={t.name} desc={t.desc} accent={st.text} className="text-[10px] text-neutral-500" />
            ))}
          </div>
        )}
        <TierLabel cost="1P">Minor · d{school.minorDie}</TierLabel>
        {school.minors.map((s, i) => <SpellRow key={i} n={i + 1} name={s.name} desc={s.desc} aff={school.affinity} tier="min" />)}
        {school.inters.length > 0 && <TierLabel cost="2P">Inter · d{school.interDie}</TierLabel>}
        {school.inters.map((s, i) => <SpellRow key={i} n={i + 1} name={s.name} desc={s.desc} aff={school.affinity} tier="int" />)}
        {school.advanced && <>
          <TierLabel cost="4P">Advanced</TierLabel>
          <SpellRow name={school.advanced.name} desc={school.advanced.desc} aff={school.affinity} tier="adv" />
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────── school detail modal ───────────────────────────

function DetailRow({ level, name, desc, cost }) {
  return (
    <div className="border-b border-neutral-900 py-2 last:border-b-0">
      <div className="flex items-baseline gap-2">
        <span className="w-14 shrink-0 font-mono text-[10px] uppercase text-neutral-600">{cost || level}</span>
        <span className="text-sm font-medium text-neutral-100">{name}</span>
      </div>
      <p className="ml-16 mt-0.5 text-xs leading-relaxed text-neutral-400">{desc}</p>
    </div>
  );
}

function SchoolDetail({ school, onClose, inLoadout, canAdd, blockReason, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-neutral-800 bg-black sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 p-4">
          <div>
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${st.text}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot}`} />{school.affinity} Affinity
            </div>
            <h3 className="mt-1 text-xl font-semibold text-neutral-50">{school.name}</h3>
            <div className="mt-1 font-mono text-[11px] text-neutral-500">
              1P Minor d{school.minorDie}
              {school.interDie > 0 && ` · 2P Inter d${school.interDie}`}
              {school.advanced && ' · 4P Advanced'}
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-neutral-600 transition hover:text-neutral-200">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {school.note && <p className="mt-3 rounded border border-neutral-800 px-3 py-2 text-xs text-neutral-400">{school.note}</p>}
          {school.traits.map((t, i) => <DetailRow key={`t${i}`} cost={t.type} name={t.name} desc={t.desc} />)}
          {school.minors.map((s, i) => <DetailRow key={`m${i}`} cost={`1P · ${i + 1}`} name={s.name} desc={s.desc} />)}
          {school.inters.map((s, i) => <DetailRow key={`i${i}`} cost={`2P · ${i + 1}`} name={s.name} desc={s.desc} />)}
          {school.advanced && <DetailRow cost="4P" name={school.advanced.name} desc={school.advanced.desc} />}
        </div>
        <div className="border-t border-neutral-800 p-3">
          <button onClick={() => onToggle(school.id)} disabled={!inLoadout && !canAdd}
            className={`w-full rounded px-4 py-2 text-sm font-semibold transition ${
              inLoadout ? 'border border-neutral-700 text-neutral-300 hover:border-rose-500/60 hover:text-rose-300'
                : canAdd ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'cursor-not-allowed border border-neutral-900 text-neutral-700'}`}>
            {inLoadout ? 'Remove from loadout' : canAdd ? 'Add to loadout'
              : blockReason === 'full' ? 'Loadout full — remove one first' : `${school.affinity} slot taken`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── schools browser ───────────────────────────

function BrowseRow({ school, inLoadout, disabled, reason, onOpen, onToggle }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className={`flex items-center gap-2 border-b border-neutral-900 py-1.5 pl-1 pr-1 transition hover:bg-neutral-950 ${disabled && !inLoadout ? 'opacity-40' : ''}`}>
      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`} />
      <button onClick={() => onOpen(school)} className="min-w-0 flex-1 truncate text-left">
        <span className={`text-[13px] ${inLoadout ? 'font-semibold text-emerald-400' : 'text-neutral-200'} hover:underline`}>{school.name}</span>
        <span className="ml-1.5 font-mono text-[10px] text-neutral-600">d{school.minorDie}{school.interDie ? `/d${school.interDie}` : ''}</span>
      </button>
      <button onClick={() => onToggle(school.id)} disabled={disabled && !inLoadout}
        className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] transition ${
          inLoadout ? 'border border-neutral-700 text-neutral-400 hover:border-rose-500/60 hover:text-rose-300'
            : disabled ? 'cursor-not-allowed text-neutral-700'
            : 'border border-neutral-700 text-neutral-300 hover:border-emerald-500 hover:text-emerald-400'}`}>
        {inLoadout ? 'Remove' : disabled ? (reason === 'full' ? 'Full' : 'Taken') : 'Add'}
      </button>
    </div>
  );
}

function LoadoutRow({ entry, onApply, onDelete }) {
  const ids = entry.schools.map((s) => (SCHOOL_BY_ID[s] ? s : SCHOOL_BY_NAME[s]?.id)).filter(Boolean);
  return (
    <div className="flex items-center gap-2 border-b border-neutral-900 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] text-neutral-300">{entry.name}</div>
        <div className="truncate text-[10px] text-neutral-600">{ids.map((id) => SCHOOL_BY_ID[id].name).join(' · ')}</div>
      </div>
      <button onClick={() => onApply(ids)} className="shrink-0 rounded border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-300 transition hover:border-emerald-500 hover:text-emerald-400">Load</button>
      {onDelete && <button onClick={onDelete} className="shrink-0 text-[11px] text-neutral-700 hover:text-rose-400">✕</button>}
    </div>
  );
}

const TABS = [{ id: 'play', label: 'Play' }, { id: 'schools', label: 'Schools' }, { id: 'reference', label: 'Reference' }];

// ─────────────────────────── main ───────────────────────────

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
  const grouped = useMemo(() => (affFilter === 'All' ? AFFINITY_ORDER : [affFilter])
    .map((a) => ({ affinity: a, schools: SCHOOLS.filter((s) => s.affinity === a) })), [affFilter]);
  const statValue = (s) => (state.ardenvale ? s.ardenvale : s.base);
  const hp = state.vitals.hp;

  return (
    <div className="min-h-screen bg-black text-neutral-300">
      {/* top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-800 bg-black px-3 py-2">
        <button onClick={onBack} className="rounded border border-neutral-800 px-2.5 py-1 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-100">← Back</button>
        <div className="flex gap-0.5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded px-3 py-1 text-[13px] transition ${tab === t.id ? 'bg-neutral-100 font-semibold text-black' : 'text-neutral-500 hover:text-neutral-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Tip content="Champion of the Ardenvale: while in the Ardenvale, Damage / Accuracy / Defense become 10 / 10 / 20." title="Ardenvale" accent="text-emerald-400" className="cursor-help">
          <button onClick={gil.toggleArdenvale}
            className={`rounded border px-2.5 py-1 text-xs transition ${state.ardenvale ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
            {state.ardenvale ? 'Ardenvale ON' : 'Ardenvale OFF'}
          </button>
        </Tip>
        <button onClick={gil.resetTrackers} className="rounded border border-neutral-800 px-2.5 py-1 text-xs text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200">New fight</button>
      </header>

      <main className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        {/* ═══════════ PLAY ═══════════ */}
        {tab === 'play' && (
          <div className="grid gap-5 lg:grid-cols-[248px_1fr]">
            {/* left rail — trackers */}
            <aside className="space-y-5 lg:sticky lg:top-14 lg:self-start">
              {/* identity */}
              <div className="flex items-center gap-3">
                <img src={assetUrl(IDENTITY.image)} alt={IDENTITY.fullName} className="h-24 w-24 shrink-0 rounded border border-neutral-800 object-cover object-top" />
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold leading-none text-neutral-50">{IDENTITY.name}</h1>
                  <p className="mt-1 text-[11px] leading-tight text-neutral-500">{IDENTITY.title}</p>
                  <p className="mt-1.5 text-[11px] text-neutral-400">
                    <span className="text-violet-400">Shadow</span> · weak to <span className="text-fuchsia-400">Spirit</span>
                  </p>
                </div>
              </div>

              {/* stats */}
              <Section title="Stats">
                <div className="rounded border border-neutral-800">
                  {/* HP is the one you actually change mid-fight */}
                  <div className="flex items-center justify-between border-b border-neutral-900 px-2.5 py-1.5">
                    <span className="text-[12px] text-neutral-400">Health</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" value={hp}
                        onChange={(e) => gil.setCounter('vitals', 'hp', Number(e.target.value))}
                        className="w-12 rounded border border-neutral-800 bg-black px-1 py-0.5 text-right font-mono text-sm font-semibold tabular-nums text-emerald-400 outline-none focus:border-emerald-500"
                      />
                      <span className="font-mono text-[11px] text-neutral-600">/ {MAX_HP}</span>
                    </div>
                  </div>
                  {STATS.filter((s) => s.key !== 'health').map((s) => {
                    const boosted = state.ardenvale && s.ardenvale !== s.base;
                    return (
                      <div key={s.key} className="flex items-center justify-between border-b border-neutral-900 px-2.5 py-1.5 last:border-b-0">
                        <span className="text-[12px] text-neutral-400">{s.label}</span>
                        <span className={`font-mono text-sm font-semibold tabular-nums ${boosted ? 'text-emerald-400' : 'text-neutral-200'}`}>{statValue(s)}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* tokens */}
              <Section title="Tokens">
                <div className="rounded border border-neutral-800">
                  {BURSTS.map((b) => (
                    <div key={b.key} className="flex items-center justify-between border-b border-neutral-900 px-2.5 py-1 last:border-b-0">
                      <span className="text-[12px] text-neutral-400">{b.label}</span>
                      <Stepper value={state.bursts[b.key]} tone="text-sky-400" onDec={() => gil.bump('bursts', b.key, -1)} onInc={() => gil.bump('bursts', b.key, +1)} />
                    </div>
                  ))}
                </div>
              </Section>

              {/* flowers */}
              <Section title="Flowers" right={<span className="text-[10px] text-neutral-600">bloom 86+</span>}>
                <div className="rounded border border-neutral-800">
                  {FLOWERS.map((f) => (
                    <div key={f.name} className="flex items-center justify-between border-b border-neutral-900 px-2.5 py-1 last:border-b-0">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-neutral-700" style={{ backgroundColor: FLOWER_HEX[f.name] }} />
                        <HoverName title={f.name} desc={f.desc} className="text-[12px] text-neutral-400" />
                      </span>
                      <Stepper value={state.flowers[f.name] ?? 0} tone="text-neutral-100" onDec={() => gil.bump('flowers', f.name, -1)} onInc={() => gil.bump('flowers', f.name, +1)} />
                    </div>
                  ))}
                </div>
              </Section>

              {/* petals not covered by an equipped school */}
              {looseAffinities.length > 0 && (
                <Section title="Other Petals">
                  <div className="rounded border border-neutral-800">
                    {looseAffinities.map((a) => (
                      <div key={a} className="flex items-center justify-between border-b border-neutral-900 px-2.5 py-1 last:border-b-0">
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${AFF_STYLE[a].dot}`} />
                          <span className="text-[12px] text-neutral-400">{a}</span>
                        </span>
                        <Stepper value={state.petals[a]} tone={AFF_STYLE[a].text} onDec={() => gil.bump('petals', a, -1)} onInc={() => gil.bump('petals', a, +1)} />
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </aside>

            {/* right — kit and spells */}
            <div className="min-w-0 space-y-5">
              <Section title="Core Kit" right={<span className="text-[10px] text-neutral-600">hover a name for its rules</span>}>
                <CoreKitTable uses={state.uses} onUse={(name, d) => gil.bump('uses', name, d)} />
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {CORE_PASSIVES.map((k) => (
                    <HoverName key={k.name} title={k.name} desc={k.desc} className="text-[11px] text-neutral-500" />
                  ))}
                </div>
              </Section>

              <Section title="Equipped Schools" right={
                <span className="flex items-center gap-2">
                  <span className={`font-mono text-[11px] ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-neutral-600'}`}>{state.loadout.length}/4</span>
                  <button onClick={() => setTab('schools')} className="text-[11px] text-neutral-500 underline-offset-2 transition hover:text-emerald-400 hover:underline">manage</button>
                </span>
              }>
                {loadoutSchools.length === 0 ? (
                  <button onClick={() => setTab('schools')} className="w-full rounded border border-dashed border-neutral-800 py-10 text-xs text-neutral-600 transition hover:border-neutral-600 hover:text-neutral-400">
                    No schools equipped — pick 4, one per affinity
                  </button>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {loadoutSchools.map((s) => (
                      <EquippedSchool key={s.id} school={s} petals={state.petals[s.affinity]}
                        onPetal={(d) => gil.bump('petals', s.affinity, d)} onRemove={gil.toggleSchool} onOpen={setDetail} />
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Blessed Items">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {BLESSED_ITEMS.map((it) => (
                    <HoverName key={it.name} title={it.name} desc={it.desc} accent="text-amber-300" className="text-[13px] text-amber-200/90" />
                  ))}
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* ═══════════ SCHOOLS ═══════════ */}
        {tab === 'schools' && (
          <div className="space-y-5">
            <Section title="Active Loadout" right={
              <span className="flex items-center gap-2">
                <span className={`font-mono text-[11px] ${state.loadout.length === 4 ? 'text-emerald-400' : 'text-neutral-600'}`}>{state.loadout.length}/4</span>
                {state.loadout.length > 0 && <button onClick={gil.clearLoadout} className="text-[11px] text-neutral-500 hover:text-rose-400">clear</button>}
                <button onClick={() => setShowLoadouts((v) => !v)} className="text-[11px] text-neutral-500 hover:text-emerald-400">saved {showLoadouts ? '▴' : '▾'}</button>
              </span>
            }>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => {
                  const s = loadoutSchools[i];
                  if (!s) return <div key={i} className="rounded border border-dashed border-neutral-800 px-2.5 py-2 text-[11px] text-neutral-700">Empty</div>;
                  const st = AFF_STYLE[s.affinity];
                  return (
                    <div key={i} className="flex items-start justify-between gap-1 rounded border border-neutral-800 px-2.5 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          <span className={`text-[10px] uppercase tracking-wider ${st.text}`}>{s.affinity}</span>
                        </div>
                        <button onClick={() => setDetail(s)} className="mt-0.5 block truncate text-left text-[13px] text-neutral-100 hover:text-emerald-400">{s.name}</button>
                      </div>
                      <button onClick={() => gil.toggleSchool(s.id)} className="shrink-0 text-xs text-neutral-700 hover:text-rose-400">✕</button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name this loadout…"
                  className="min-w-0 flex-1 rounded border border-neutral-800 bg-black px-2.5 py-1.5 text-[13px] text-neutral-200 placeholder-neutral-700 outline-none focus:border-emerald-500" />
                <button onClick={() => { gil.saveCurrentLoadout(saveName); setSaveName(''); setShowLoadouts(true); }} disabled={!state.loadout.length}
                  className="rounded bg-emerald-500 px-3 py-1.5 text-[13px] font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-700">Save</button>
              </div>
              {showLoadouts && (
                <div className="mt-3 grid gap-x-6 border-t border-neutral-800 pt-2 lg:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-600">Mine</div>
                    {state.saved.length ? state.saved.map((sv) => <LoadoutRow key={sv.id} entry={sv} onApply={gil.applyLoadout} onDelete={() => gil.deleteSaved(sv.id)} />)
                      : <p className="text-[11px] text-neutral-700">Nothing saved yet.</p>}
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-600">Past fights</div>
                    <div className="max-h-48 overflow-y-auto pr-1">{PAST_LOADOUTS.map((sv) => <LoadoutRow key={sv.name} entry={sv} onApply={gil.applyLoadout} />)}</div>
                  </div>
                </div>
              )}
            </Section>

            <Section title={`All Spell Schools · ${SCHOOLS.length}`} right={
              <div className="flex flex-wrap gap-1">
                {['All', ...AFFINITY_ORDER].map((a) => (
                  <button key={a} onClick={() => setAffFilter(a)}
                    className={`rounded px-2 py-0.5 text-[11px] transition ${affFilter === a ? 'bg-neutral-100 font-semibold text-black' : 'text-neutral-500 hover:text-neutral-200'}`}>{a}</button>
                ))}
              </div>
            }>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                {grouped.map((g) => (
                  <div key={g.affinity} className="min-w-0">
                    <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${AFF_STYLE[g.affinity].text}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${AFF_STYLE[g.affinity].dot}`} />{g.affinity}
                      <span className="font-normal text-neutral-700">({g.schools.length})</span>
                    </div>
                    {g.schools.map((s) => {
                      const inLoadout = state.loadout.includes(s.id);
                      const reason = gil.blockReason(s.id);
                      return <BrowseRow key={s.id} school={s} inLoadout={inLoadout} disabled={!inLoadout && reason != null} reason={reason} onOpen={setDetail} onToggle={gil.toggleSchool} />;
                    })}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ═══════════ REFERENCE ═══════════ */}
        {tab === 'reference' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Passives & Actions">
              <div className="rounded border border-neutral-800 px-3">
                {CORE_KIT.map((k, i) => (
                  <div key={i} className="border-b border-neutral-900 py-2 last:border-b-0">
                    <div className="flex items-baseline gap-2">
                      <span className="w-20 shrink-0 font-mono text-[10px] uppercase text-neutral-600">{k.type === 'Intermediate' ? 'Int' : k.type}</span>
                      <span className="text-sm font-medium text-neutral-100">{k.name}</span>
                    </div>
                    <p className="ml-[88px] mt-0.5 text-xs leading-relaxed text-neutral-400">{k.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <div className="space-y-6">
              <Section title="Casting">
                <div className="rounded border border-neutral-800">
                  {CASTING_RULES.map((c) => (
                    <div key={c.cost} className="flex items-baseline gap-3 border-b border-neutral-900 px-3 py-2 last:border-b-0">
                      <span className="w-16 shrink-0 font-mono text-xs text-emerald-400">{c.cost}</span>
                      <span className="text-xs text-neutral-400">{c.effect}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-600">Loadout is 4 schools, each a different affinity.</p>
              </Section>

              <Section title="Blessed Items">
                <div className="rounded border border-neutral-800 px-3">
                  {BLESSED_ITEMS.map((it) => (
                    <div key={it.name} className="border-b border-neutral-900 py-2 last:border-b-0">
                      <div className="text-sm font-medium text-amber-200/90">{it.name}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{it.desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="The Garden">
                <div className="rounded border border-neutral-800 px-3">
                  {FLOWERS.map((f) => (
                    <div key={f.name} className="flex gap-2.5 border-b border-neutral-900 py-2 last:border-b-0">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-neutral-700" style={{ backgroundColor: FLOWER_HEX[f.name] }} />
                      <div>
                        <div className="text-sm font-medium text-neutral-100">{f.name}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Bloom Bingo" right={<span className="text-[10px] text-neutral-600">click when triggered</span>}>
                <div className="grid grid-cols-2 gap-1.5">
                  {BLOOM_BINGO.map((b) => {
                    const on = !!state.bloom[b.sin];
                    return (
                      <button key={b.sin} onClick={() => gil.toggleBloom(b.sin)}
                        className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left transition ${on ? 'border-emerald-600/60 bg-emerald-500/5' : 'border-neutral-800 hover:border-neutral-600'}`}>
                        <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-sm border text-[10px] ${on ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-neutral-700 text-transparent'}`}>✓</span>
                        <span className="min-w-0">
                          <span className={`block text-[12px] ${on ? 'text-emerald-400' : 'text-neutral-200'}`}>{b.sin}</span>
                          <span className="block truncate text-[10px] text-neutral-600">{b.trigger}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>
            </div>
          </div>
        )}
      </main>

      {detail && (
        <SchoolDetail school={detail} onClose={() => setDetail(null)} inLoadout={state.loadout.includes(detail.id)}
          canAdd={gil.blockReason(detail.id) == null} blockReason={gil.blockReason(detail.id)} onToggle={(id) => gil.toggleSchool(id)} />
      )}
    </div>
  );
}
