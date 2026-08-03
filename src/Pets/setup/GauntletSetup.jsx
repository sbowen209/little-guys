/**
 * @file GauntletSetup.jsx
 * @description Two screens for the Stable Gauntlet: dividing the stable into
 * teams before the series, and drafting the decider team when a 2-team series
 * ends level.
 *
 * The rules live in engine/gauntlet.js; this file only collects choices.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  getSpecies, displayName, roleMeta, elementMeta, STABLE_IDS, RULES,
} from '../data/index.js';
import { GAUNTLET_FORMATS, deciderPool } from '../engine/gauntlet.js';
import { SETUP_STYLES } from './SetupParts.jsx';
import { assetUrl } from '../../utils/assets.js';

/* ── SHARED PIECES ───────────────────────────────────────────────── */

const Shell = ({ children }) => (
  <div className="pet-setup relative min-h-screen w-full overflow-y-auto bg-stone-950 font-sans text-stone-200">
    <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-emerald-900/12 mix-blend-screen blur-[150px]" />
    <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-900/10 mix-blend-screen blur-[150px]" />
    {children}
    <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
  </div>
);

/**
 * One stable pet. Compact enough that all eight fit on screen at once, which is
 * the whole point — dividing a stable is a comparison task.
 */
function StablePet({ pet, assignment, onClick, dimmed, order }) {
  const species = getSpecies(pet.speciesId);
  if (!species) return null;
  const role = roleMeta(species);
  const element = elementMeta(species.typing.defensive);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-all duration-200 ${
        assignment !== null
          ? 'border-emerald-500/70 bg-emerald-950/25 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
          : 'border-stone-700 bg-stone-900/70 hover:border-stone-500 hover:bg-stone-800'
      } ${dimmed ? 'opacity-35' : ''}`}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-stone-950"
        style={{ borderColor: `${element.hex}66` }}
      >
        <img src={assetUrl(species.art)} alt="" className="h-10 origin-bottom scale-125 object-contain" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-serif text-sm font-bold leading-tight text-stone-100">
          {displayName(species)}
        </span>
        <span className="truncate font-mono text-[9px] uppercase tracking-widest" style={{ color: role.hex }}>
          {role.short} · Lv.{pet.level}
        </span>
        <span className="font-mono text-[9px] tabular-nums text-stone-500">
          ♥{pet.stats.hp} d{pet.stats.atk}/d{pet.stats.def}/d{pet.stats.spc}
        </span>
      </div>

      {assignment !== null && (
        // The squad number always shows: a lead marker on its own would hide
        // the one thing you are actually arranging.
        <span className="flex shrink-0 flex-col items-center gap-0.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 font-mono text-xs font-black text-emerald-950">
            {assignment + 1}
          </span>
          {order === 0 && (
            <span className="font-mono text-[7px] font-black uppercase tracking-wider text-amber-400">Lead</span>
          )}
        </span>
      )}
    </button>
  );
}

/* ── DIVIDING THE STABLE ─────────────────────────────────────────── */

export function GauntletSetupView({ onBack, onBegin }) {
  const [format, setFormat] = useState(2);
  /** instanceId -> team index. Absent means benched for this gauntlet. */
  const [assigned, setAssigned] = useState({});
  const [activeTeam, setActiveTeam] = useState(0);

  // The stable is the preset roster: fresh instances each visit, because a
  // gauntlet never edits the pets, it only arranges them.
  const stable = useMemo(
    () => STABLE_IDS.map((id) => {
      const species = getSpecies(id);
      return {
        instanceId: id,
        speciesId: id,
        level: species.level ?? 1,
        stats: { ...species.base },
        natures: { ...(species.natures ?? {}) },
      };
    }),
    [],
  );

  const teams = useMemo(() => {
    const built = Array.from({ length: format }, () => []);
    for (const pet of stable) {
      const index = assigned[pet.instanceId];
      if (index !== undefined && index < format) built[index].push(pet);
    }
    return built;
  }, [assigned, format, stable]);

  const orderIn = useCallback((pet) => {
    const index = assigned[pet.instanceId];
    if (index === undefined || index >= format) return -1;
    return teams[index].findIndex((p) => p.instanceId === pet.instanceId);
  }, [assigned, format, teams]);

  /** Click cycles a pet into the active team, or off it if it is already there. */
  const toggle = useCallback((pet) => {
    setAssigned((previous) => {
      const next = { ...previous };
      if (next[pet.instanceId] === activeTeam) delete next[pet.instanceId];
      else next[pet.instanceId] = activeTeam;
      return next;
    });
  }, [activeTeam]);

  const clearTeam = useCallback((index) => {
    setAssigned((previous) => Object.fromEntries(
      Object.entries(previous).filter(([, value]) => value !== index),
    ));
  }, []);

  /** Spreads the stable round-robin so a first-time player can just hit go. */
  const autoAssign = useCallback(() => {
    const shuffled = [...stable].sort(() => Math.random() - 0.5);
    const next = {};
    shuffled.forEach((pet, i) => {
      const team = i % format;
      const sizeSoFar = Object.values(next).filter((t) => t === team).length;
      if (sizeSoFar < RULES.TEAM_SIZE) next[pet.instanceId] = team;
    });
    setAssigned(next);
  }, [format, stable]);

  const overSized = teams.some((team) => team.length > RULES.TEAM_SIZE);
  const allFilled = teams.every((team) => team.length > 0);
  const ready = allFilled && !overSized;

  const begin = () => {
    if (!ready) return;
    onBegin({
      format,
      teams: teams.map((pets, i) => ({
        id: `player_${i}`,
        name: `Squad ${i + 1}`,
        pets: pets.map((pet) => ({ ...pet, instanceId: `${pet.instanceId}@${i}` })),
      })),
    });
  };

  return (
    <Shell>
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-6 p-6 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <h1 className="font-serif text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] md:text-5xl">
              Stable Gauntlet
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-stone-400">
              Divide your stable · no pet fights in two squads
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

        {/* Format */}
        <section className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            Rival squads
          </span>
          {GAUNTLET_FORMATS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => { setFormat(count); setActiveTeam(0); }}
              className={`rounded-lg border-2 px-6 py-3 font-mono text-sm font-black uppercase tracking-widest transition-all ${
                format === count
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'border-stone-700 bg-stone-900/60 text-stone-500 hover:border-stone-500 hover:text-stone-300'
              }`}
            >
              {count} v {count}
            </button>
          ))}
          <p className="font-mono text-[11px] leading-relaxed text-stone-500">
            {format === 1 && 'One match, winner takes it.'}
            {format === 2 && 'Two matches — a 1–1 split forces a decider, drafted from your own two squads.'}
            {format === 3 && 'Best of three. A 2–0 sweep ends it early.'}
          </p>
          <button
            type="button"
            onClick={autoAssign}
            className="ml-auto rounded-lg border border-stone-700 bg-stone-900/60 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-stone-400 transition-colors hover:border-sky-500 hover:text-sky-300"
          >
            ⚄ Spread evenly
          </button>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* Stable */}
          <section className="flex flex-col gap-3 rounded-2xl border border-stone-800 bg-stone-900/40 p-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Your stable · {stable.length} pets
            </h2>
            <p className="font-mono text-[10px] leading-relaxed text-stone-600">
              Click a pet to add it to <span className="text-emerald-400">Squad {activeTeam + 1}</span>,
              or click it again to pull it back out.
            </p>
            <div className="flex flex-col gap-2">
              {stable.map((pet) => {
                const index = assigned[pet.instanceId];
                const on = index !== undefined && index < format ? index : null;
                return (
                  <StablePet
                    key={pet.instanceId}
                    pet={pet}
                    assignment={on}
                    order={orderIn(pet)}
                    dimmed={on !== null && on !== activeTeam}
                    onClick={() => toggle(pet)}
                  />
                );
              })}
            </div>
          </section>

          {/* Squads */}
          <section className={`grid gap-4 ${format === 1 ? 'grid-cols-1' : format === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {teams.map((pets, index) => {
              const selected = activeTeam === index;
              const full = pets.length >= RULES.TEAM_SIZE;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTeam(index)}
                  className={`flex min-h-[300px] flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    selected
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_24px_rgba(16,185,129,0.18)]'
                      : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-serif text-xl font-black ${selected ? 'text-emerald-300' : 'text-stone-300'}`}>
                      Squad {index + 1}
                    </span>
                    <span className={`font-mono text-[10px] uppercase tracking-widest ${full ? 'text-amber-400' : 'text-stone-500'}`}>
                      {pets.length}/{RULES.TEAM_SIZE}
                    </span>
                  </div>

                  {pets.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-stone-700/60">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-stone-600">Empty</span>
                    </div>
                  ) : (
                    <ol className="flex flex-col gap-2">
                      {pets.map((pet, slot) => {
                        const species = getSpecies(pet.speciesId);
                        return (
                          <li
                            key={pet.instanceId}
                            className="flex items-center gap-2 rounded-lg border border-stone-700/70 bg-stone-950/60 px-2 py-1.5"
                          >
                            <span className={`w-8 shrink-0 font-mono text-[9px] font-black uppercase ${slot === 0 ? 'text-amber-400' : 'text-stone-600'}`}>
                              {slot === 0 ? 'Lead' : `#${slot + 1}`}
                            </span>
                            <img src={assetUrl(species.art)} alt="" className="h-7 w-7 shrink-0 object-contain" />
                            <span className="truncate font-serif text-xs font-bold text-stone-200">
                              {displayName(species)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {pets.length > 0 && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(event) => { event.stopPropagation(); clearTeam(index); }}
                      className="mt-auto self-start rounded font-mono text-[9px] uppercase tracking-widest text-stone-600 transition-colors hover:text-rose-400"
                    >
                      Clear squad
                    </span>
                  )}
                </button>
              );
            })}
          </section>
        </div>

        <div className="flex flex-col items-center gap-3 py-6">
          {!ready && (
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-500/80">
              {overSized
                ? `A squad cannot hold more than ${RULES.TEAM_SIZE} pets`
                : 'Every squad needs at least one pet'}
            </p>
          )}
          <button
            type="button"
            disabled={!ready}
            onClick={begin}
            className="group relative overflow-hidden rounded-sm bg-emerald-500 px-16 py-5 font-mono text-2xl font-black uppercase tracking-widest text-stone-950 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:bg-emerald-400 disabled:grayscale disabled:hover:scale-100"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/30 group-hover:animate-[petShine_0.7s_ease-out]" />
            <span className="relative">Enter the Gauntlet</span>
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ── THE DECIDER ─────────────────────────────────────────────────── */

/**
 * The 2-team format's third match. The pool is exactly the pets across that
 * side's own two squads, so a stable spread thin over two rounds is the same
 * stable you get to concentrate for the last one.
 */
export function DeciderDraftView({ series, onConfirm }) {
  const pool = useMemo(() => deciderPool(series.playerTeams), [series]);
  const [picked, setPicked] = useState([]);

  const limit = Math.min(RULES.TEAM_SIZE, pool.length);
  const toggle = (pet) => {
    setPicked((previous) => (
      previous.includes(pet.instanceId)
        ? previous.filter((id) => id !== pet.instanceId)
        : previous.length < limit ? [...previous, pet.instanceId] : previous
    ));
  };

  const team = picked
    .map((id) => pool.find((pet) => pet.instanceId === id))
    .filter(Boolean);

  return (
    <Shell>
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-6 p-6 md:p-10">
        <header className="border-b border-stone-800 pb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500">Series level at 1–1</p>
          <h1 className="mt-2 font-serif text-4xl font-black text-white md:text-5xl">The Decider</h1>
          <p className="mx-auto mt-3 max-w-xl font-mono text-xs leading-relaxed text-stone-400">
            Build one last squad from every pet across your two. Your rivals are doing the same
            with theirs. Order matters — the first pick leads.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pool.map((pet) => {
            const order = picked.indexOf(pet.instanceId);
            const species = getSpecies(pet.speciesId);
            return (
              <button
                key={pet.instanceId}
                type="button"
                onClick={() => toggle(pet)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                  order >= 0
                    ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                    : 'border-stone-800 bg-stone-900/50 hover:border-stone-600'
                }`}
              >
                {order >= 0 && (
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 font-mono text-[10px] font-black text-amber-950">
                    {order === 0 ? '★' : order + 1}
                  </span>
                )}
                <img src={assetUrl(species.art)} alt="" className="h-16 object-contain" />
                <span className="w-full truncate text-center font-serif text-sm font-bold text-stone-200">
                  {displayName(species)}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">
                  Lv.{pet.level} · ♥{pet.stats.hp}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3 py-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-stone-500">
            {team.length}/{limit} selected
          </span>
          <button
            type="button"
            disabled={team.length === 0}
            onClick={() => onConfirm({
              id: 'player_decider',
              name: 'Final Cut',
              // Fresh ids: the same pet may have fought earlier in the series.
              pets: team.map((pet, i) => ({ ...pet, instanceId: `${pet.instanceId}#final${i}` })),
            })}
            className="rounded-sm bg-amber-500 px-14 py-4 font-mono text-xl font-black uppercase tracking-widest text-stone-950 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:scale-105 hover:bg-amber-400 disabled:grayscale disabled:hover:scale-100"
          >
            Lock the Final Cut
          </button>
        </div>
      </div>
    </Shell>
  );
}
