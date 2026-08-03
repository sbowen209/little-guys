/**
 * @file PetBattler.jsx
 * @description The module's own router. Everything that used to be split
 * between App.jsx and PetSetup lives here, because the Gauntlet needs state
 * that outlives a single trip into the arena — a series is several matches with
 * a draft in the middle, and App had no place to keep that.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PetSetup from './setup/PetSetup.jsx';
import BattleArena from './ui/BattleArena.jsx';
import MatchHistory from './setup/MatchHistory.jsx';
import { GauntletSetupView, DeciderDraftView } from './setup/GauntletSetup.jsx';
import { useMatchHistory, summariseTeam } from './hooks/useMatchHistory.js';
import { useSavedTeams } from './hooks/useSavedTeams.js';
import { getSpecies } from './data/index.js';
import {
  createSeries, nextStep, recordResult, setDecider, seriesScore,
} from './engine/gauntlet.js';
import { SETUP_STYLES } from './setup/SetupParts.jsx';

/** Strips a saved roster entry down to what the simulator needs. */
const hydrate = (team) => team.pets.map((pet) => ({
  instanceId: pet.instanceId,
  speciesId: pet.speciesId,
  level: pet.level,
  stats: { ...pet.stats },
}));

/**
 * Folds a finished match into the series. Shared by the Continue handler and by
 * the label logic, which needs to know what the series will look like *after*
 * this result to name the next step honestly.
 */
const applyResult = (series, result) => {
  if (!series || !result) return series;
  const at = nextStep(series);
  if (at.kind !== 'match') return series;
  return recordResult(series, {
    winner: result.outcome.winner,
    turns: result.outcome.turns,
    seed: result.seed,
    label: at.index >= series.format ? 'Decider' : `Match ${at.index + 1}`,
    teams: [summariseTeam(at.teams[0], getSpecies), summariseTeam(at.teams[1], getSpecies)],
  });
};

/** What the Continue button should say, given where the series lands next. */
const continueLabelFor = (series, pending) => {
  if (!pending) return 'Continue';
  const step = nextStep(applyResult(series, pending));
  if (step.kind === 'done') return 'See the result';
  if (step.kind === 'decider') return 'Draft the decider';
  return 'Next match';
};

/* ── SERIES SUMMARY ──────────────────────────────────────────────── */

function SeriesSummary({ series, onRematch, onExit }) {
  const score = seriesScore(series);
  const won = score[0] > score[1];
  const drawn = score[0] === score[1];
  const tone = won ? 'text-emerald-400' : drawn ? 'text-stone-300' : 'text-rose-400';

  return (
    <div className="pet-setup flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-stone-950 p-6 font-sans text-stone-200">
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
          Gauntlet · {series.format} v {series.format}
        </span>
        <h1 className={`font-serif text-6xl font-black md:text-7xl ${tone}`}>
          {won ? 'Stable Triumphant' : drawn ? 'Honours Even' : 'Stable Falls'}
        </h1>
        <span className="font-mono text-2xl font-black tabular-nums text-stone-400">
          {score[0]} — {score[1]}
        </span>
      </div>

      <ol className="flex w-full max-w-2xl flex-col gap-2">
        {series.results.map((result, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/60 px-5 py-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
              {result.label ?? `Match ${i + 1}`}
            </span>
            <span className="font-serif text-sm font-bold text-stone-300">
              {result.teams[0].name} vs {result.teams[1].name}
            </span>
            <span className={`font-mono text-[10px] font-black uppercase tracking-widest ${
              result.winner === 0 ? 'text-emerald-400' : result.winner === 1 ? 'text-rose-400' : 'text-stone-500'
            }`}
            >
              {result.winner === 0 ? 'Won' : result.winner === 1 ? 'Lost' : 'Draw'} · {result.turns}t
            </span>
          </li>
        ))}
      </ol>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onRematch}
          className="rounded-sm bg-emerald-500 px-10 py-4 font-mono text-sm font-black uppercase tracking-widest text-stone-950 transition-colors hover:bg-emerald-400"
        >
          New Gauntlet
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-sm border border-stone-700 px-10 py-4 font-mono text-sm font-bold uppercase tracking-widest text-stone-400 transition-colors hover:text-white"
        >
          Back to Menu
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: SETUP_STYLES }} />
    </div>
  );
}

/* ── ROUTER ──────────────────────────────────────────────────────── */

export default function PetBattler({ onBack }) {
  const [view, setView] = useState('setup');
  const [duel, setDuel] = useState(null);
  const [series, setSeries] = useState(null);
  /**
   * The match that has finished playing but has not been folded into the score
   * yet. Held back deliberately: writing the result the instant playback ends
   * would advance the series and unmount the arena before the player had a
   * chance to read the end card.
   */
  const [pending, setPending] = useState(null);
  /** Player 1's decider squad, held while player 2 drafts theirs. */
  const [deciderDraft, setDeciderDraft] = useState(null);
  const { history, record, remove, clear } = useMatchHistory();
  // Lifted out of PetSetup so the gauntlet's rival picker sees a roster the
  // moment the builder saves it, rather than a copy loaded at mount.
  const { teams: savedTeams, saveTeam } = useSavedTeams();

  const step = useMemo(() => (series ? nextStep(series) : null), [series]);

  /* ── One-off duel from the classic Battle Arena screen ──────────── */

  const beginDuel = useCallback((config) => {
    setDuel(config);
    setView('battle');
  }, []);

  const recordDuel = useCallback((result) => {
    if (!duel) return;
    record({
      mode: 'duel',
      winner: result.outcome.winner,
      matches: [{
        winner: result.outcome.winner,
        turns: result.outcome.turns,
        seed: result.seed,
        teams: [
          summariseTeam(duel.teams?.[0] ?? { name: 'Player 1', pets: duel.team1 }, getSpecies),
          summariseTeam(duel.teams?.[1] ?? { name: 'Player 2', pets: duel.team2 }, getSpecies),
        ],
      }],
    });
  }, [duel, record]);

  /* ── Gauntlet ───────────────────────────────────────────────────── */

  const beginGauntlet = useCallback(({ teams, opponentTeams }) => {
    setSeries(createSeries(teams, opponentTeams));
    setDeciderDraft(null);
    setView('gauntlet');
  }, []);

  /** Playback finished — park the result until the player asks to move on. */
  const holdGauntletResult = useCallback((result) => setPending(result), []);

  /** Continue was clicked: fold the parked result into the score. */
  const advanceGauntlet = useCallback(() => {
    setSeries((current) => applyResult(current, pending));
    setPending(null);
  }, [pending]);

  /**
   * Both sides draft their decider, one after the other. Player 1's squad is
   * parked until player 2 has locked theirs, so neither is drafting against a
   * known answer.
   */
  const confirmDecider = useCallback((team) => {
    setDeciderDraft((first) => {
      if (!first) return team;
      setSeries((current) => setDecider(current, first, team));
      return null;
    });
  }, []);

  /**
   * Writes a finished series to the ledger, exactly once. The guard is a ref
   * rather than a flag on the series, so noting that it has been written does
   * not itself cause a re-render.
   */
  const ledgered = useRef(new Set());
  useEffect(() => {
    if (!series || ledgered.current.has(series.id)) return;
    if (nextStep(series).kind !== 'done') return;
    ledgered.current.add(series.id);
    const score = seriesScore(series);
    record({
      mode: 'gauntlet',
      format: series.format,
      score,
      winner: score[0] > score[1] ? 0 : score[1] > score[0] ? 1 : null,
      matches: series.results,
    });
  }, [series, record]);

  const leaveGauntlet = useCallback(() => {
    setSeries(null);
    setPending(null);
    setDeciderDraft(null);
    setView('setup');
  }, []);

  /* ── VIEWS ──────────────────────────────────────────────────────── */

  if (view === 'history') {
    return (
      <MatchHistory
        history={history}
        onRemove={remove}
        onClear={clear}
        onBack={() => setView('setup')}
      />
    );
  }

  if (view === 'gauntlet_setup') {
    return (
      <GauntletSetupView
        savedTeams={savedTeams}
        onBack={() => setView('setup')}
        onBuild={() => setView('setup')}
        onBegin={beginGauntlet}
      />
    );
  }

  if (view === 'gauntlet' && series && step) {
    if (step.kind === 'decider') {
      return (
        <DeciderDraftView
          key={deciderDraft ? 'rival' : 'player'}
          series={series}
          side={deciderDraft ? 1 : 0}
          onConfirm={confirmDecider}
        />
      );
    }

    if (step.kind === 'done') {
      return (
        <SeriesSummary
          series={series}
          onRematch={() => { setSeries(null); setDeciderDraft(null); setView('gauntlet_setup'); }}
          onExit={leaveGauntlet}
        />
      );
    }

    const [playerTeam, rivalTeam] = step.teams;

    return (
      <BattleArena
        key={`${series.id}-${series.results.length}`}
        battleConfig={{ team1: hydrate(playerTeam), team2: hydrate(rivalTeam) }}
        sideNames={[playerTeam.name, rivalTeam.name]}
        playerSide={0}
        continueLabel={continueLabelFor(series, pending)}
        exitLabel="Abandon gauntlet"
        onResolved={holdGauntletResult}
        onComplete={advanceGauntlet}
        onExit={leaveGauntlet}
      />
    );
  }

  if (view === 'battle' && duel) {
    return (
      <BattleArena
        battleConfig={duel}
        onResolved={recordDuel}
        onExit={() => setView('setup')}
      />
    );
  }

  return (
    <PetSetup
      teams={savedTeams}
      saveTeam={saveTeam}
      onBack={onBack}
      onBeginBattle={beginDuel}
      onGauntlet={() => setView('gauntlet_setup')}
      onHistory={() => setView('history')}
    />
  );
}
