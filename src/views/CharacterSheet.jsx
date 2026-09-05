// src/views/CharacterSheet.jsx
// Gil's play sheet. Black ground, hairline rules, tabular numbers — colour is
// carried by the tier palette (Essential/Minor/Inter/Advanced) and the affinity
// markers. Long rules text lives in tooltips so the page stays scannable.
import { useMemo, useState } from 'react';
import { assetUrl } from '../utils/assets';
import { useGilSheet } from '../hooks/useGilSheet';
import Tip from '../components/gil/Tip';
import AllySheet from '../components/gil/AllySheet';
import { Stepper, Charges, Section, HoverName } from '../components/gil/ui';
import { TIER, SHORT_TYPE } from '../data/gil/tiers';
import { AIDA } from '../data/gil/allies';
import {
  SCHOOLS, SCHOOL_BY_ID, AFFINITY_ORDER, AFF_STYLE, PAST_LOADOUTS, SCHOOL_BY_NAME,
} from '../data/gil/schools';
import {
  IDENTITY, STATS, BURSTS, MAX_HP, ARDEN_HP, CORE_KIT, FLOWERS,
  BLESSED_ITEMS, BLOOM_BINGO, CASTING_RULES,
} from '../data/gil/core';

const ACTION_TYPES = ['Essential', 'Minor', 'Intermediate', 'Advanced'];
const CORE_ACTIONS = CORE_KIT.filter((k) => ACTION_TYPES.includes(k.type));
const CORE_PASSIVES = CORE_KIT.filter((k) => !ACTION_TYPES.includes(k.type));

const FLOWER_HEX = {
  Red: '#dc2626', Blue: '#2563eb', Yellow: '#ca8a04',
  Green: '#16a34a', 'Black Root': '#404040', Oni: '#7c3aed',
};

// ─────────────────────────── core kit ───────────────────────────

function CoreKitTable({ uses, onSet }) {
  return (
    <div className="overflow-hidden rounded border border-neutral-800">
      <div className="grid grid-cols-[68px_92px_1fr] items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        <span>Charges</span><span>Type</span><span>Ability</span>
      </div>
      {CORE_ACTIONS.map((k) => {
        const tier = TIER[k.type];
        const spentOut = k.charges != null && (uses[k.name] || 0) >= k.charges;
        return (
          <div key={k.name + k.type} className="grid grid-cols-[68px_92px_1fr] items-center gap-2 border-b border-neutral-900 px-2.5 py-1.5 transition last:border-b-0 hover:bg-neutral-950">
            <Charges total={k.charges} used={uses[k.name] || 0} tier={tier} onSet={(v) => onSet(k.name, v)} />
            <span className={`text-[11px] ${tier.label} ${spentOut ? 'opacity-40' : ''}`}>
              {SHORT_TYPE[k.type]}{k.charges != null ? ` (${k.charges})` : ''}
            </span>
            <HoverName title={k.name} desc={k.desc} accent={tier.name}
              className={`text-sm font-medium ${tier.name} ${spentOut ? 'opacity-40' : ''}`} />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── equipped school ───────────────────────────

const SPELL_TIER = { min: TIER.Minor, int: TIER.Intermediate, adv: TIER.Advanced };

function SpellRow({ n, name, desc, aff, tier }) {
  const t = SPELL_TIER[tier];
  return (
    <Tip content={desc} title={name} accent={AFF_STYLE[aff].text} className="block cursor-help">
      <span className="flex items-center gap-2 rounded px-1.5 py-1 transition hover:bg-neutral-900">
        <span className="w-3 shrink-0 font-mono text-[10px] text-neutral-600">{n ?? '·'}</span>
        <span className={`truncate text-[13px] ${t.name}`}>{name}</span>
      </span>
    </Tip>
  );
}

function TierLabel({ cost, tier, children }) {
  return (
    <div className="mt-1.5 flex items-center gap-1.5 px-1.5 text-[10px] uppercase tracking-wider text-neutral-600">
      <span className={`font-mono font-semibold ${tier.label}`}>{cost}</span>{children}
    </div>
  );
}

function EquippedSchool({ school, petals, onPetal, onRemove, onOpen }) {
  const st = AFF_STYLE[school.affinity];
  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded border border-neutral-800 bg-neutral-950/40">
      <span className={`absolute inset-y-0 left-0 w-0.5 ${st.dot}`} />
      <div className={`flex items-start justify-between gap-2 border-b border-neutral-800 px-2.5 py-2 ${st.softBg}`}>
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
        <TierLabel cost="1P" tier={TIER.Minor}>Minor · d{school.minorDie}</TierLabel>
        {school.minors.map((s, i) => <SpellRow key={i} n={i + 1} name={s.name} desc={s.desc} aff={school.affinity} tier="min" />)}
        {school.inters.length > 0 && <TierLabel cost="2P" tier={TIER.Intermediate}>Inter · d{school.interDie}</TierLabel>}
        {school.inters.map((s, i) => <SpellRow key={i} n={i + 1} name={s.name} desc={s.desc} aff={school.affinity} tier="int" />)}
        {school.advanced && <>
          <TierLabel cost="4P" tier={TIER.Advanced}>Advanced</TierLabel>
          <SpellRow name={school.advanced.name} desc={school.advanced.desc} aff={school.affinity} tier="adv" />
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────── school detail modal ───────────────────────────

function DetailRow({ level, name, desc, cost, tone }) {
  return (
    <div className="border-b border-neutral-900 py-2 last:border-b-0">
      <div className="flex items-baseline gap-2">
        <span className={`w-14 shrink-0 font-mono text-[10px] uppercase ${tone || 'text-neutral-600'}`}>{cost || level}</span>
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
        <div className={`flex items-start justify-between gap-3 border-b border-neutral-800 p-4 ${st.softBg}`}>
          <div>
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${st.text}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot}`} />{school.affinity} Affinity
            </div>
            <h3 className="mt-1 text-xl font-semibold text-neutral-50">{school.name}</h3>
            <div className="mt-1 font-mono text-[11px] text-neutral-500">
              <span className={TIER.Minor.label}>1P</span> Minor d{school.minorDie}
              {school.interDie > 0 && <> · <span className={TIER.Intermediate.label}>2P</span> Inter d{school.interDie}</>}
              {school.advanced && <> · <span className={TIER.Advanced.label}>4P</span> Advanced</>}
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-neutral-600 transition hover:text-neutral-200">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {school.note && <p className="mt-3 rounded border border-neutral-800 px-3 py-2 text-xs text-neutral-400">{school.note}</p>}
          {school.traits.map((t, i) => <DetailRow key={`t${i}`} cost={t.type} name={t.name} desc={t.desc} />)}
          {school.minors.map((s, i) => <DetailRow key={`m${i}`} cost={`1P · ${i + 1}`} tone={TIER.Minor.label} name={s.name} desc={s.desc} />)}
          {school.inters.map((s, i) => <DetailRow key={`i${i}`} cost={`2P · ${i + 1}`} tone={TIER.Intermediate.label} name={s.name} desc={s.desc} />)}
          {school.advanced && <DetailRow cost="4P" tone={TIER.Advanced.label} name={school.advanced.name} desc={school.advanced.desc} />}
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

// ─────────────────────────── bloom bingo ───────────────────────────

function BloomBingo({ bloom, onToggle }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4">
      {BLOOM_BINGO.map((b) => {
        const on = !!bloom[b.sin];
        return (
          <button key={b.sin} onClick={() => onToggle(b.sin)}
            className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left transition ${on ? 'border-emerald-600/60 bg-emerald-500/10' : 'border-neutral-800 hover:border-neutral-600'}`}>
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-sm border text-[10px] ${on ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-neutral-700 text-transparent'}`}>✓</span>
            <span className="min-w-0">
              <span className={`block text-[12px] ${on ? 'text-emerald-400' : 'text-neutral-200'}`}>{b.sin}</span>
              <span className="block truncate text-[10px] text-neutral-600">{b.trigger}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const TABS = [
  { id: 'play', label: 'Play' },
  { id: 'schools', label: 'Schools' },
  { id: 'allies', label: 'Allies' },
  { id: 'reference', label: 'Reference' },
];

// ─────────────────────────── main ───────────────────────────

export default function CharacterSheet({ onBack }) {
  const gil = useGilSheet();
  const { state } = gil;
  const [tab, setTab] = useState('play');
  const [detail, setDetail] = useState(null);
  const [affFilter, setAffFilter] = useState('All');
  const [saveName, setSaveName] = useState('');
  const [showLoadouts, setShowLoadouts] = useState(false);
  const [rollShadow, setRollShadow] = useState(true);

  const loadoutSchools = state.loadout.map((id) => SCHOOL_BY_ID[id]).filter(Boolean);
  const usedAffinities = new Set(loadoutSchools.map((s) => s.affinity));
  const looseAffinities = AFFINITY_ORDER.filter((a) => !usedAffinities.has(a));
  const grouped = useMemo(() => (affFilter === 'All' ? AFFINITY_ORDER : [affFilter])
    .map((a) => ({ affinity: a, schools: SCHOOLS.filter((s) => s.affinity === a) })), [affFilter]);
  const statValue = (s) => (state.ardenvale ? s.ardenvale : s.base);
  const maxHp = state.ardenvale ? ARDEN_HP : MAX_HP;
  const hp = state.vitals.hp;
  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const hpTone = hpPct <= 30 ? { text: 'text-rose-400', bar: 'bg-rose-500/80' }
    : hpPct <= 60 ? { text: 'text-amber-400', bar: 'bg-amber-500/80' }
      : { text: 'text-emerald-400', bar: 'bg-emerald-500/80' };

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
        <Tip content="While in the Arden Veil, Gil's Health becomes 200 and his Damage / Accuracy / Defense become 10 / 10 / 20." title="Champion of the Arden Veil" accent="text-emerald-400" className="cursor-help">
          <button onClick={gil.toggleArdenvale}
            className={`rounded border px-2.5 py-1 text-xs transition ${state.ardenvale ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
            Arden Veil {state.ardenvale ? 'ON' : 'OFF'}
          </button>
        </Tip>
        <button onClick={gil.resetTrackers} className="rounded border border-neutral-800 px-2.5 py-1 text-xs text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200">New fight</button>
      </header>

      <main className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        {/* ═══════════ PLAY ═══════════ */}
        {tab === 'play' && (
          <div className="grid gap-5 lg:grid-cols-[272px_1fr]">
            {/* left rail — trackers */}
            <aside className="space-y-5 lg:sticky lg:top-14 lg:self-start">
              <div>
                {/* full art, uncropped — Gil.webp is 1805×1947 with alpha */}
                <img
                  src={assetUrl(IDENTITY.image)}
                  alt={IDENTITY.fullName}
                  className="aspect-[1805/1947] w-full rounded border border-neutral-800 bg-neutral-950 object-contain p-1"
                />
                <h1 className="mt-2 text-3xl font-semibold leading-none text-neutral-50">{IDENTITY.name}</h1>
                <p className="mt-1 text-[11px] text-emerald-500/90">{IDENTITY.title}</p>
              </div>

              <Section title="Stats">
                <div className="rounded border border-neutral-800">
                  <div className="border-b border-neutral-900">
                    <div className="flex items-center justify-between px-2.5 py-1.5">
                      <span className="text-[12px] text-neutral-400">Health</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" value={hp}
                          onChange={(e) => gil.setCounter('vitals', 'hp', Number(e.target.value))}
                          className={`w-14 rounded border border-neutral-800 bg-black px-1 py-0.5 text-right font-mono text-sm font-semibold tabular-nums outline-none focus:border-emerald-500 ${hpTone.text}`}
                        />
                        <span className={`font-mono text-[11px] ${state.ardenvale ? 'text-emerald-500' : 'text-neutral-600'}`}>/ {maxHp}</span>
                      </div>
                    </div>
                    <div className="h-0.5 w-full bg-neutral-900">
                      <div className={`h-full transition-[width] duration-300 ${hpTone.bar}`} style={{ width: `${hpPct}%` }} />
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

            {/* right — kit, spells, gear */}
            <div className="min-w-0 space-y-5">
              <Section title="Core Kit" right={<span className="text-[10px] text-neutral-600">click a pip to spend a charge · hover a name for its rules</span>}>
                <CoreKitTable uses={state.uses} onSet={(name, v) => gil.setCounter('uses', name, v)} />
              </Section>

              <Section title="Passives">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {CORE_PASSIVES.map((k) => (
                    <HoverName
                      key={k.name}
                      title={k.name}
                      desc={k.desc}
                      accent={k.type === 'Affinity' ? 'text-violet-300' : undefined}
                      className={`text-[12px] ${k.type === 'Affinity' ? 'text-violet-400' : 'text-neutral-400'}`}
                    />
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

              <div className="grid gap-5 xl:grid-cols-2">
                <Section title="Bloom Bingo" right={<span className="text-[10px] text-neutral-600">click when triggered</span>}>
                  <BloomBingo bloom={state.bloom} onToggle={gil.toggleBloom} />
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
                    <div key={i} className={`relative flex items-start justify-between gap-1 overflow-hidden rounded border border-neutral-800 px-2.5 py-2 ${st.softBg}`}>
                      <span className={`absolute inset-y-0 left-0 w-0.5 ${st.dot}`} />
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
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-900 pt-2">
                <button
                  onClick={() => gil.randomizeLoadout(rollShadow)}
                  className="rounded border border-neutral-700 px-2.5 py-1.5 text-[13px] font-semibold text-neutral-200 transition hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                >
                  Roll 4 random schools
                </button>
                <label className="flex cursor-pointer select-none items-center gap-1.5 text-[11px] text-neutral-500">
                  <input
                    type="checkbox"
                    checked={rollShadow}
                    onChange={(e) => setRollShadow(e.target.checked)}
                    className="h-3.5 w-3.5 accent-violet-500"
                  />
                  always include a <span className="text-violet-400">Shadow</span> school
                </label>
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

        {/* ═══════════ ALLIES ═══════════ */}
        {tab === 'allies' && (
          <AllySheet
            ally={AIDA}
            battery={state.ally.battery}
            onBattery={(v) => gil.setCounter('ally', 'battery', v)}
            uses={state.allyUses}
            onUse={(name, v) => gil.setCounter('allyUses', name, v)}
          />
        )}

        {/* ═══════════ REFERENCE ═══════════ */}
        {tab === 'reference' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Passives & Actions">
              <div className="rounded border border-neutral-800 px-3">
                {CORE_KIT.map((k, i) => {
                  const tier = TIER[k.type];
                  return (
                    <div key={i} className="border-b border-neutral-900 py-2 last:border-b-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`w-20 shrink-0 font-mono text-[10px] uppercase ${tier ? tier.label : 'text-neutral-600'}`}>
                          {SHORT_TYPE[k.type] || k.type}{k.charges != null ? ` (${k.charges})` : ''}
                        </span>
                        <span className={`text-sm font-medium ${tier ? tier.name : 'text-neutral-100'}`}>{k.name}</span>
                      </div>
                      <p className="ml-[88px] mt-0.5 text-xs leading-relaxed text-neutral-400">{k.desc}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            <div className="space-y-6">
              <Section title="Casting">
                <div className="rounded border border-neutral-800">
                  {CASTING_RULES.map((c, i) => (
                    <div key={c.cost} className="flex items-baseline gap-3 border-b border-neutral-900 px-3 py-2 last:border-b-0">
                      <span className={`w-16 shrink-0 font-mono text-xs ${[TIER.Minor, TIER.Intermediate, TIER.Advanced][i].label}`}>{c.cost}</span>
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
