// src/components/combat/EncounterScreen.jsx
import { useState, useEffect, useRef } from 'react';
import { ZONE_INFO, zoneImg, AFFIX_INFO } from '../../data/mapConfig';
import { assetUrl } from '../../utils/assets';
import CombatView from './CombatView';
import GatherView from './GatherView';
import EventModal from '../shared/EventModal';
import ExplorationWheel from '../map/ExplorationWheel';

const ROLL_GLYPH = { 1: '⚔', 2: '🌿', 3: '❔' };
const ROLL_LABEL = { 1: 'Battle', 2: 'Gather', 3: 'Event' };

function ShivaRoar({ firstRoll, onDone }) {
  const [stage, setStage] = useState('roll');
  const fired = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage('roar'), 900);
    const t2 = setTimeout(() => { if (!fired.current) { fired.current = true; onDone(); } }, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-amber-500/40 bg-stone-900/85 p-10 text-center shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-center gap-3 text-5xl">
        <span className="opacity-80">{ROLL_GLYPH[firstRoll]}</span>
      </div>
      {stage === 'roll' ? (
        <p className="font-mono text-xs uppercase tracking-widest text-stone-500">Rolled {ROLL_LABEL[firstRoll]}…</p>
      ) : (
        <>
          <p className="animate-[roar_0.6s_ease-out] font-serif text-4xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
            🦁 LION'S ROAR!
          </p>
          <p className="mt-2 text-sm text-stone-400">Shiva seeks trouble — rolling again…</p>
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes roar { 0%{transform:scale(0.4);opacity:0} 50%{transform:scale(1.25)} 100%{transform:scale(1);opacity:1} }
      `}} />
    </div>
  );
}

export default function EncounterScreen({ run }) {
  const { character, position, activeEncounter, rolls } = run;
  const zone = ZONE_INFO[position.zone] ?? ZONE_INFO.A;
  const affixInfo = position.affix ? AFFIX_INFO[position.affix] : null;
  const isBattle = activeEncounter?.type === 'BATTLE';

  const portrait = (
    <div className="pointer-events-none absolute bottom-0 left-0 z-20 w-[40%] max-w-sm items-end hidden lg:flex">
      <img
        src={assetUrl(character.imagePath)}
        alt={character.name}
        draggable={false}
        className="max-h-[80vh] w-full origin-bottom object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
      />
    </div>
  );

  const renderBody = () => {
if (!activeEncounter) {
      return <ExplorationWheel onExplore={run.explore} />;
    }

    switch (activeEncounter.type) {
case 'BATTLE':
        return (
          <CombatView
            // Binding enemy.id forces CombatView to completely restart its refs when the Ambush hits
            key={`battle-${position.level}-${position.zone}-${rolls.length}-${activeEncounter.enemy.id}`} 
            enemy={activeEncounter.enemy}
            character={character}
            level={activeEncounter.level ?? position.level}
            startingHp={run.hp}
            zone={position.zone}
            affix={position.affix}
            passiveFlags={run.runPassives}
            onConsumePassive={run.consumePassive}
            onResolve={run.resolveBattle}
            onHpChange={run.updateHp} 
          />
        );

      case 'GATHER':
        return <GatherView key={`gather-${position.level}-${position.zone}-${rolls.length}`} encounter={activeEncounter} onAccept={run.acceptGather} />;

      case 'EVENT':
        return <EventModal text={activeEncounter.text} onContinue={run.resolveEvent} canReroll={false} />;

      case 'SHIVA_REROLL':
        return <ShivaRoar key={`shiva-${position.level}-${rolls.length}`} firstRoll={activeEncounter.firstRoll} onDone={run.shivaReroll} />;

      case 'MOVE':
        return (
          <div className="mx-auto max-w-md rounded-2xl border border-amber-500/40 bg-stone-900/85 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="mb-3 text-4xl">🧭</div>
            <h3 className="mb-2 font-serif text-2xl font-black text-amber-400">Zone Cleared</h3>
            <p className="mb-6 text-stone-400">You rolled a repeat ({ROLL_LABEL[activeEncounter.roll]}). The way forward opens.</p>
            <button type="button" onClick={run.openMap} className="rounded-lg bg-amber-500 px-8 py-3 font-bold uppercase tracking-wider text-stone-950 transition hover:bg-amber-400">
              Choose Your Path
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // If battle, let CombatView own the entire viewport.
  if (isBattle) {
    return <div className="absolute inset-0 h-full w-full">{renderBody()}</div>;
  }

  // Otherwise, use a fullscreen background layout for Gather/Events
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-stone-950"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(12,10,9,0.5), rgba(12,10,9,0.92)), url(${assetUrl(zoneImg(position.zone))})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Non-Combat Top Info HUD (Pushed down to accommodate the FallbackHeader) */}
      <div className="absolute left-6 right-6 top-32 z-30 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
            Level {position.level} · Zone {position.zone}
          </p>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-3xl font-black text-white drop-shadow-md">{zone.type}</h2>
            {affixInfo && (
              <span className={`rounded-full border border-stone-700/50 bg-stone-900/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${affixInfo.color}`} title={affixInfo.desc}>
                {affixInfo.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {rolls.map((r, i) => (
            <span key={i} title={ROLL_LABEL[r]} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-600 bg-stone-900/80 text-xl shadow-lg">
              {ROLL_GLYPH[r]}
            </span>
          ))}
        </div>
      </div>

      {portrait}

      <div className="relative z-20 flex w-full justify-center px-4 pt-20 lg:pl-[34%]">
        {renderBody()}
      </div>
    </div>
  );
}