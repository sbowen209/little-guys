import { useCallback, useMemo, useState } from 'react';
import {
  PET_DB, listSpecies, getSpecies, displayName, roleMeta,
  createPetInstance, floorStat, ROLE_META, ROLE_ORDER, RULES,
} from '../data/index.js';
import { useSavedTeams } from '../hooks/useSavedTeams.js';
import {
  HeroAura, KitPanel, LibraryCard, SETUP_STYLES, ShowcaseImage, StatBadge, TypeChip,
} from './SetupParts.jsx';
import { assetUrl } from '../../utils/assets.js';

const STAT_KEYS = ['atk', 'def', 'spc'];

/** Level-ups grant one random die bump of 1d4 across ATK / DEF / SPC. */
const rollLevelGain = () => ({
  key: STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)],
  amount: Math.floor(Math.random() * 4) + 1,
});

const Shell = ({ children }) => (
  <div className="pet-setup relative min-h-screen w-full overflow-hidden bg-stone-950 font-sans text-stone-200">
    <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-indigo-900/15 mix-blend-screen blur-[150px]" />
    <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-900/10 mix-blend-screen blur-[150px]" />
    {children}
    <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
  </div>
);

const TeamThumbs = ({ team, mirrored }) => (
  <div className={`flex gap-2 ${mirrored ? 'flex-row-reverse' : ''}`}>
    {team.pets.length === 0
      ? <span className="font-mono text-xs italic text-stone-600">Empty roster</span>
      : team.pets.map((pet, i) => (
        <div
          key={pet.instanceId}
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-stone-700 bg-stone-950"
          title={displayName(getSpecies(pet.speciesId))}
        >
          {i === 0 && (
            <span className="absolute bottom-0 z-10 w-full bg-amber-500 text-center font-mono text-[7px] font-black leading-tight text-amber-950">
              LEAD
            </span>
          )}
          <img src={assetUrl(getSpecies(pet.speciesId).art)} alt="" className="h-8 origin-bottom scale-110 object-contain" />
        </div>
      ))}
  </div>
);

/* ── MENU ────────────────────────────────────────────────────────── */

function MenuView({ onBattle, onBuild, onBack }) {
  return (
    <Shell>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-4xl flex-col gap-8 text-center">
          <h1 className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text font-serif text-6xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_15px_rgba(251,191,36,0.35)] md:text-8xl">
            PET BATTLER
          </h1>
          <p className="mb-4 font-mono text-sm uppercase tracking-widest text-stone-400">
            Tactical 1v1 dice autobattler
          </p>

          <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
            <button
              type="button"
              onClick={onBattle}
              className="group rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-amber-500 hover:bg-stone-800/80 hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)]"
            >
              <h2 className="font-serif text-4xl font-black text-white transition-colors group-hover:text-amber-400">Battle Arena</h2>
              <p className="mt-4 font-mono text-sm leading-relaxed text-stone-400">
                Pick two saved rosters and watch the match resolve itself.
              </p>
            </button>
            <button
              type="button"
              onClick={onBuild}
              className="group rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-sky-500 hover:bg-stone-800/80 hover:shadow-[0_20px_40px_rgba(56,189,248,0.15)]"
            >
              <h2 className="font-serif text-4xl font-black text-white transition-colors group-hover:text-sky-400">Team Builder</h2>
              <p className="mt-4 font-mono text-sm leading-relaxed text-stone-400">
                Draft pets, roll Natures, level them up and lock in your deployment order.
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 font-mono text-sm uppercase tracking-widest text-stone-500 transition-colors hover:text-white"
          >
            Return to Gateway Hub
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ── ROSTER LIST ─────────────────────────────────────────────────── */

function RosterListView({ teams, onEdit, onBack }) {
  return (
    <Shell>
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 p-6 md:p-10">
        <header className="flex items-end justify-between border-b border-stone-800 pb-6">
          <div>
            <h1 className="font-serif text-4xl font-black text-white drop-shadow-md md:text-5xl">Team Builder</h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-sky-400">
              {RULES.MAX_SAVED_TEAMS} saved rosters · {RULES.TEAM_SIZE} pets each
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-stone-700 bg-stone-900/50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-stone-400 backdrop-blur-sm transition-colors hover:border-stone-500 hover:text-white"
          >
            Back to Menu
          </button>
        </header>

        <div className="pet-scroll grid grid-cols-1 gap-6 overflow-y-auto pb-12 pr-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((team, index) => (
            <button
              key={team.id}
              type="button"
              onClick={() => onEdit(index)}
              className="group flex flex-col items-start rounded-2xl border border-stone-700/80 bg-stone-900/60 p-6 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-sky-500 hover:bg-stone-800 hover:shadow-[0_15px_30px_rgba(56,189,248,0.15)]"
            >
              <span className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500 transition-colors group-hover:text-sky-400/70">
                Slot {index + 1}
              </span>
              <span className="w-full truncate font-serif text-2xl font-black text-white transition-colors group-hover:text-sky-400">
                {team.name}
              </span>
              <div className="mt-6 flex h-10 items-center">
                <TeamThumbs team={team} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ── ROSTER EDITOR ───────────────────────────────────────────────── */

function RosterEditView({ index, initial, onSave, onCancel }) {
  const [team, setTeam] = useState(initial);
  const [selection, setSelection] = useState(null); // { source: 'roster'|'library', id }
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tuning, setTuning] = useState(false);
  const [flash, setFlash] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const library = useMemo(
    () => listSpecies().filter((species) => roleFilter === 'ALL' || species.role === roleFilter),
    [roleFilter],
  );

  const rosterPet = selection?.source === 'roster'
    ? team.pets.find((pet) => pet.instanceId === selection.id) ?? null
    : null;
  const species = rosterPet
    ? getSpecies(rosterPet.speciesId)
    : selection?.source === 'library' ? PET_DB[selection.id] : null;

  const level = rosterPet?.level ?? species?.level ?? 1;
  const stats = rosterPet?.stats ?? species?.base ?? null;
  const natures = rosterPet?.natures ?? species?.natures ?? null;

  const draft = useCallback((speciesId) => {
    if (team.pets.length >= RULES.TEAM_SIZE) return;
    const instance = createPetInstance(speciesId);
    setTeam((previous) => ({ ...previous, pets: [...previous.pets, instance] }));
    setSelection({ source: 'roster', id: instance.instanceId });
    setTuning(false);
  }, [team.pets.length]);

  const release = useCallback((instanceId) => {
    setTeam((previous) => ({ ...previous, pets: previous.pets.filter((pet) => pet.instanceId !== instanceId) }));
    setSelection((current) => (current?.id === instanceId ? null : current));
  }, []);

  const reorder = useCallback((from, to) => {
    if (from === to || from === null) return;
    setTeam((previous) => {
      const pets = [...previous.pets];
      const [moved] = pets.splice(from, 1);
      pets.splice(to, 0, moved);
      return { ...previous, pets };
    });
  }, []);

  const levelUp = useCallback((instanceId) => {
    const gain = rollLevelGain();
    setFlash(gain.key);
    setTimeout(() => setFlash(null), 1100);
    setTeam((previous) => ({
      ...previous,
      pets: previous.pets.map((pet) => (
        pet.instanceId === instanceId && pet.level < RULES.MAX_LEVEL
          ? { ...pet, level: pet.level + 1, stats: { ...pet.stats, [gain.key]: pet.stats[gain.key] + gain.amount } }
          : pet
      )),
    }));
  }, []);

  const tune = useCallback((instanceId, key, delta) => {
    setTeam((previous) => ({
      ...previous,
      pets: previous.pets.map((pet) => {
        if (pet.instanceId !== instanceId) return pet;
        const next = pet.stats[key] + delta;
        if (next < floorStat(pet, key)) return pet;
        return { ...pet, stats: { ...pet.stats, [key]: next } };
      }),
    }));
  }, []);

  return (
    <div className="pet-setup relative flex h-screen w-full flex-col overflow-hidden bg-stone-950 font-sans text-stone-200">
      <header className="relative z-50 flex shrink-0 items-center justify-between gap-6 border-b border-stone-800/60 bg-stone-950/60 p-6 backdrop-blur-md lg:px-8">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Roster slot {index + 1}</span>
          <input
            type="text"
            value={team.name}
            maxLength={24}
            onChange={(event) => setTeam((previous) => ({ ...previous, name: event.target.value }))}
            placeholder="Enter team name"
            className="w-[280px] border-none bg-transparent p-0 font-serif text-3xl font-black text-white outline-none transition-colors placeholder:text-stone-700 focus:text-sky-400"
          />
        </div>

        <div className="flex gap-3">
          {Array.from({ length: RULES.TEAM_SIZE }).map((_, slot) => {
            const pet = team.pets[slot];
            if (!pet) {
              return (
                <div key={`empty-${slot}`} className="flex h-14 w-36 items-center justify-center rounded-xl border-2 border-dashed border-stone-700/50 bg-stone-900/30">
                  <span className="font-mono text-[10px] uppercase text-stone-600">Slot {slot + 1}</span>
                </div>
              );
            }
            const petSpecies = getSpecies(pet.speciesId);
            const selected = selection?.source === 'roster' && selection.id === pet.instanceId;

            return (
              <div
                key={pet.instanceId}
                className="group relative flex cursor-grab items-center active:cursor-grabbing"
                draggable
                onDragStart={() => setDragIndex(slot)}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                onDrop={(event) => { event.preventDefault(); reorder(dragIndex, slot); setDragIndex(null); }}
                onDragEnd={() => setDragIndex(null)}
              >
                <button
                  type="button"
                  onClick={() => { setSelection({ source: 'roster', id: pet.instanceId }); setTuning(false); }}
                  className={`relative flex h-14 w-36 items-center gap-3 rounded-xl border pl-2 pr-3 transition-all duration-300 ${
                    selected
                      ? 'z-10 scale-105 border-sky-400 bg-stone-800 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'border-stone-700 bg-stone-900/80 hover:border-stone-500 hover:bg-stone-800'
                  }`}
                >
                  {slot === 0 && (
                    <span className="absolute -left-2 -top-2 z-20 rounded border border-amber-400 bg-amber-500 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase text-amber-950 shadow-lg">
                      Lead
                    </span>
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-600 bg-stone-950">
                    <img src={assetUrl(petSpecies.art)} alt="" className="h-8 origin-bottom scale-125 object-contain" />
                  </div>
                  <div className="flex min-w-0 flex-col items-start">
                    <span className={`w-full truncate text-left font-serif text-sm font-bold leading-tight ${selected ? 'text-white' : 'text-stone-300'}`}>
                      {displayName(petSpecies)}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-sky-400">Lv.{pet.level}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => release(pet.instanceId)}
                  className="absolute -right-2 -top-2 z-30 flex h-5 w-5 items-center justify-center rounded-full border border-stone-600 bg-stone-800 text-[10px] text-stone-400 opacity-0 shadow-lg transition-all hover:border-rose-500 hover:bg-rose-600 hover:text-white group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="font-mono text-xs uppercase tracking-widest text-stone-500 transition-colors hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(team)}
            className="rounded-sm bg-sky-500 px-8 py-3 font-mono text-sm font-black uppercase tracking-widest text-stone-950 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]"
          >
            Save Roster
          </button>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[55%] items-end justify-center">
          {species && (
            <>
              <HeroAura species={species} />
              <ShowcaseImage key={species.id} species={species} />
            </>
          )}
        </div>

        <div className="pet-scroll absolute inset-y-0 left-0 z-20 flex w-full max-w-[45%] flex-col justify-center overflow-y-auto bg-gradient-to-r from-stone-950 via-stone-950/95 to-transparent px-8 pb-8 lg:px-12">
          {!species ? (
            <div className="flex h-full flex-col items-center justify-center opacity-50">
              <span className="mb-4 text-6xl">🔍</span>
              <h2 className="font-serif text-2xl font-bold text-stone-400">Select a pet</h2>
              <p className="mt-2 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
                Click a roster slot above, or<br />browse the library below.
              </p>
            </div>
          ) : (
            <div className="animate-[petPop_0.3s_ease-out_both] pt-8">
              <div className="mb-2 flex items-center gap-3">
                <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]" style={{ color: roleMeta(species).hex }}>
                  {roleMeta(species).label}
                </p>
                {species.isPreset && (
                  <span className="rounded bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-950">Preset</span>
                )}
              </div>

              <h2 className="mb-2 font-serif text-5xl font-black leading-none tracking-tight text-white drop-shadow-xl lg:text-6xl">
                {displayName(species)}
              </h2>
              {species.flavor && <p className="mb-4 max-w-md text-sm italic leading-relaxed text-stone-500">{species.flavor}</p>}

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <TypeChip element={species.typing.offensive} prefix="ATK" />
                <TypeChip element={species.typing.defensive} prefix="DEF" />
                <span className="rounded-full border border-stone-600 bg-stone-800/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">
                  Lv.{level}
                </span>
                <span
                  className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: roleMeta(species).hex, borderColor: `${roleMeta(species).hex}55` }}
                  title={roleMeta(species).blurb}
                >
                  {roleMeta(species).blurb}
                </span>
              </div>

              <div className="mb-8 flex gap-4">
                <StatBadge icon="♥" label="Health" value={stats.hp} tone="hp" highlighted={flash === 'hp'} />
                {STAT_KEYS.map((key) => (
                  <StatBadge
                    key={key}
                    icon={{ atk: '⚔', def: '🛡', spc: '⚡' }[key]}
                    label={{ atk: 'Attack', def: 'Defense', spc: 'Special' }[key]}
                    value={stats[key]}
                    tone={key}
                    highlighted={flash === key}
                    editing={tuning && Boolean(rosterPet)}
                    onInc={() => tune(rosterPet.instanceId, key, 1)}
                    onDec={() => tune(rosterPet.instanceId, key, -1)}
                    canDec={rosterPet ? rosterPet.stats[key] > floorStat(rosterPet, key) : false}
                    nature={natures?.[key]}
                  />
                ))}
              </div>

              <div className="mb-8 flex items-center gap-4">
                {selection?.source === 'library' ? (
                  <button
                    type="button"
                    onClick={() => draft(species.id)}
                    disabled={team.pets.length >= RULES.TEAM_SIZE}
                    className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {team.pets.length >= RULES.TEAM_SIZE ? 'Roster full' : 'Draft to team'}
                  </button>
                ) : (
                  <>
                    {level < RULES.MAX_LEVEL ? (
                      <button
                        type="button"
                        onClick={() => levelUp(rosterPet.instanceId)}
                        className="rounded-lg bg-white px-8 py-3 font-mono text-sm font-black uppercase tracking-widest text-stone-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-stone-200"
                      >
                        Level up (+1d4 to a die)
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                        <span className="text-xl leading-none text-emerald-400">✓</span>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Max level</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setTuning((value) => !value)}
                      className={`rounded-lg border px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all ${
                        tuning
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                          : 'border-stone-600 bg-stone-800/50 text-stone-400 hover:bg-stone-700 hover:text-white'
                      }`}
                    >
                      {tuning ? 'Done' : 'Manual balance'}
                    </button>
                  </>
                )}
              </div>

              <KitPanel species={species} level={level} />
            </div>
          )}
        </div>
      </main>

      <section className="relative z-30 shrink-0 border-t border-stone-800/60 bg-stone-950/80 px-6 pb-6 backdrop-blur-xl lg:px-8">
        <div className="flex items-center justify-between py-4">
          <h3 className="pl-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            Library · {library.length} pets
          </h3>
          <div className="flex flex-wrap gap-2">
            {['ALL', ...ROLE_ORDER].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`rounded px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors ${
                  roleFilter === role ? 'bg-amber-500 text-stone-950' : 'border border-stone-700 bg-stone-900 text-stone-500 hover:text-stone-300'
                }`}
              >
                {role === 'ALL' ? 'All' : ROLE_META[role].label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-stone-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-stone-950 to-transparent" />
          <div className="pet-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 pt-2">
            {library.map((entry) => (
              <LibraryCard
                key={entry.id}
                species={entry}
                selected={selection?.source === 'library' && selection.id === entry.id}
                onSelect={() => { setSelection({ source: 'library', id: entry.id }); setTuning(false); }}
              />
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
    </div>
  );
}

/* ── BATTLE SELECT ───────────────────────────────────────────────── */

const SIDE_ACCENT = [
  { text: 'text-sky-400', dot: 'bg-sky-400 shadow-[0_0_15px_#38bdf8]', panel: 'bg-sky-950/20 border-sky-900/50', active: 'border-sky-500 bg-sky-900/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]' },
  { text: 'text-rose-400', dot: 'bg-rose-500 shadow-[0_0_15px_#f43f5e]', panel: 'bg-rose-950/20 border-rose-900/50', active: 'border-rose-500 bg-rose-900/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]' },
];

function TeamPicker({ side, teams, picked, onPick }) {
  const accent = SIDE_ACCENT[side];

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-4 rounded-2xl border p-4 shadow-inner backdrop-blur-sm ${accent.panel} ${side === 1 ? 'flex-row-reverse' : ''}`}>
        <div className={`h-4 w-4 rounded-full ${accent.dot}`} />
        <h2 className={`font-serif text-3xl font-black ${accent.text}`}>Player {side + 1}</h2>
      </div>
      <div className="pet-scroll flex max-h-[440px] flex-col gap-3 overflow-y-auto pr-2">
        {teams.map((team, index) => {
          if (team.pets.length === 0) return null;
          const selected = picked === index;
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onPick(index)}
              className={`flex flex-col gap-4 rounded-2xl border-2 p-5 transition-all duration-300 ${side === 1 ? 'items-end' : 'items-start'} ${
                selected ? `scale-[1.02] ${accent.active}` : 'border-stone-800 bg-stone-900/60 hover:border-stone-600'
              }`}
            >
              <span className={`font-serif text-xl font-bold ${selected ? 'text-white' : 'text-stone-300'}`}>{team.name}</span>
              <TeamThumbs team={team} mirrored={side === 1} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BattleSelectView({ teams, onBack, onBuild, onBegin }) {
  const [picks, setPicks] = useState([null, null]);
  const ready = teams.filter((team) => team.pets.length > 0);

  const pick = (side, index) =>
    setPicks((previous) => previous.map((value, i) => (i === side ? index : value)));

  const start = () => {
    if (picks[0] === null || picks[1] === null) return;
    const hydrate = (index) => teams[index].pets.map((pet) => ({
      instanceId: pet.instanceId,
      speciesId: pet.speciesId,
      level: pet.level,
      stats: { ...pet.stats },
    }));
    onBegin({ team1: hydrate(picks[0]), team2: hydrate(picks[1]) });
  };

  return (
    <Shell>
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 p-6 md:p-10">
        <header className="flex items-end justify-between border-b border-stone-800 pb-6">
          <div>
            <h1 className="font-serif text-4xl font-black text-amber-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] md:text-5xl">
              Battle Preparation
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-stone-400">
              Lineup order is locked once the match begins
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-stone-700 bg-stone-900/50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-stone-400 backdrop-blur-sm transition-colors hover:border-stone-500 hover:text-white"
          >
            Back to Menu
          </button>
        </header>

        {ready.length < 2 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-700 bg-stone-900/30 p-10 text-center backdrop-blur-sm">
            <span className="mb-4 text-6xl">⚠️</span>
            <h2 className="mb-2 font-serif text-3xl font-black text-white">Not enough teams</h2>
            <p className="max-w-md font-mono text-sm leading-relaxed text-stone-500">
              Build at least two rosters before entering the arena.
            </p>
            <button
              type="button"
              onClick={onBuild}
              className="mt-8 rounded-sm bg-sky-500 px-8 py-3 font-mono text-sm font-black uppercase tracking-widest text-stone-950 shadow-lg transition-colors hover:bg-sky-400"
            >
              Go to Team Builder
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
              <TeamPicker side={0} teams={teams} picked={picks[0]} onPick={(index) => pick(0, index)} />
              <TeamPicker side={1} teams={teams} picked={picks[1]} onPick={(index) => pick(1, index)} />
            </div>

            <div className="mt-auto flex justify-center py-8">
              <button
                type="button"
                disabled={picks[0] === null || picks[1] === null}
                onClick={start}
                className="group relative overflow-hidden rounded-sm bg-amber-500 px-16 py-5 font-mono text-2xl font-black uppercase tracking-widest text-stone-950 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:scale-105 hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] disabled:grayscale disabled:hover:scale-100"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/30 group-hover:animate-[petShine_0.7s_ease-out]" />
                <span className="relative">Initiate Duel</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ── ROUTER ──────────────────────────────────────────────────────── */

export default function PetSetup({ onBack, onBeginBattle }) {
  const { teams, saveTeam } = useSavedTeams();
  const [view, setView] = useState('menu');
  const [editing, setEditing] = useState(null);

  if (view === 'builder_edit' && editing !== null) {
    return (
      <RosterEditView
        index={editing}
        initial={teams[editing]}
        onCancel={() => setView('builder_list')}
        onSave={(team) => { saveTeam(editing, team); setView('builder_list'); }}
      />
    );
  }

  if (view === 'builder_list') {
    return (
      <RosterListView
        teams={teams}
        onBack={() => setView('menu')}
        onEdit={(index) => { setEditing(index); setView('builder_edit'); }}
      />
    );
  }

  if (view === 'battle_select') {
    return (
      <BattleSelectView
        teams={teams}
        onBack={() => setView('menu')}
        onBuild={() => setView('builder_list')}
        onBegin={onBeginBattle}
      />
    );
  }

  return (
    <MenuView
      onBattle={() => setView('battle_select')}
      onBuild={() => setView('builder_list')}
      onBack={onBack}
    />
  );
}
