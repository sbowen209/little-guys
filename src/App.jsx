// src/App.jsx
import { useState } from 'react';
import MainMenu from './views/MainMenu';
import RunSetup from './views/RunSetup';
import ActiveRun from './views/ActiveRun';
import StatsView from './views/StatsView';
import RacingSetup from './views/RacingSetup';
import ActiveRace from './views/ActiveRace';
import { useMetaProgress } from './hooks/useMetaProgress';

import { PetSetup, BattleArena } from './Pets';

function App() {
  const [appMode, setAppMode] = useState('gateway'); // gateway | adventure | racing | petbattler
  const [currentView, setCurrentView] = useState('menu'); // menu | setup | run | stats | race | battle
  const [runConfig, setRunConfig] = useState(null);
  
  const [racingConfig, setRacingConfig] = useState(null); 
  
  // NEW STATE: Hold the drafted teams from PetSetup
  const [battleConfig, setBattleConfig] = useState(null); 
  
  const metaApi = useMetaProgress();

  if (appMode === 'gateway') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 p-6 font-sans text-stone-200 selection:bg-amber-500/30">
        <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-indigo-900/10 mix-blend-screen blur-[150px]" />
        <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-900/10 mix-blend-screen blur-[150px]" />

        <h1 className="z-10 mb-12 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-center font-serif text-5xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)] md:text-7xl">
          LITTLE GUYS
        </h1>

        {/* Updated to a 3-column grid to fit the new module */}
        <div className="z-10 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          
          <button
            onClick={() => {
              setAppMode('adventure');
              setCurrentView('menu');
            }}
            className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 text-center shadow-xl backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-amber-400 hover:bg-stone-800 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/5 transition-all duration-700 group-hover:animate-[shine_0.7s_ease-out]" />
            <span className="mb-4 text-5xl drop-shadow-lg transition-transform group-hover:scale-110">⚔️</span>
            <h2 className="mb-3 font-serif text-2xl font-black text-white transition-colors group-hover:text-amber-400">
              Adventure Mode
            </h2>
            <p className="text-xs leading-relaxed text-stone-400">
              Draft a hero, explore the Mire, and battle deadly foes in the classic roguelite experience.
            </p>
          </button>

          <button
            onClick={() => {
              setAppMode('racing');
              setCurrentView('setup');
            }}
            className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 text-center shadow-xl backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-rose-500 hover:bg-stone-800 hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/5 transition-all duration-700 group-hover:animate-[shine_0.7s_ease-out]" />
            <span className="mb-4 text-5xl drop-shadow-lg transition-transform group-hover:scale-110">🏁</span>
            <h2 className="mb-3 font-serif text-2xl font-black text-white transition-colors group-hover:text-rose-500">
              Racing Mini-Game
            </h2>
            <p className="text-xs leading-relaxed text-stone-400">
              Hit the dirt track. Select your racers, navigate jumps and turns, and race to the finish line.
            </p>
          </button>

          {/* NEW PET BATTLER ENTRY POINT */}
          <button
            onClick={() => {
              setAppMode('petbattler');
              setCurrentView('setup');
            }}
            className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-stone-800 bg-stone-900/60 p-10 text-center shadow-xl backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-sky-500 hover:bg-stone-800 hover:shadow-[0_0_40px_rgba(56,189,248,0.3)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/5 transition-all duration-700 group-hover:animate-[shine_0.7s_ease-out]" />
            <span className="mb-4 text-5xl drop-shadow-lg transition-transform group-hover:scale-110">🐾</span>
            <h2 className="mb-3 font-serif text-2xl font-black text-white transition-colors group-hover:text-sky-400">
              Pet Battler
            </h2>
            <p className="text-xs leading-relaxed text-stone-400">
              Draft tactical rosters and engage in highly active 1v1 turn-based dice combat.
            </p>
          </button>

        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shine { to { transform: translateX(220%) skewX(-12deg); } }
          @media (prefers-reduced-motion: reduce) { .group-hover\\:animate-\\[shine_0\\.7s_ease-out\\] { animation: none !important; } }
        `}} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // NEW PET BATTLER ROUTING LOOP
  // ---------------------------------------------------------------------------
  if (appMode === 'petbattler') {
    return (
      <div className="min-h-screen bg-stone-950 font-sans text-stone-100">
        {currentView === 'setup' && (
          <PetSetup 
            onBack={() => setAppMode('gateway')} 
            onBeginBattle={(config) => {
              setBattleConfig(config);
              setCurrentView('battle');
            }}
          />
        )}
        {currentView === 'battle' && (
          <BattleArena
            battleConfig={battleConfig}
            onExit={() => setCurrentView('setup')}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // EXISTING RACING ROUTING LOOP
  // ---------------------------------------------------------------------------
  if (appMode === 'racing') {
    return (
      <div className="min-h-screen bg-stone-950 font-sans text-stone-100">
        {currentView === 'setup' && (
          <RacingSetup 
            onBack={() => setAppMode('gateway')} 
            onBeginRace={(racers, track) => {
              setRacingConfig({ racers, track });
              setCurrentView('race');
            }}
          />
        )}
        {currentView === 'race' && racingConfig && (
          <ActiveRace 
            racers={racingConfig.racers} 
            trackId={racingConfig.track}
            onAbandon={() => setCurrentView('setup')}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ORIGINAL ADVENTURE ROUTING LOOP
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-900 font-sans text-stone-100">
      {currentView === 'menu' && (
        <MainMenu
          onStartRun={() => setCurrentView('setup')}
          onOpenStats={() => setCurrentView('stats')}
        />
      )}

      {currentView === 'stats' && (
        <StatsView
          meta={metaApi.meta}
          onReset={metaApi.reset}
          onBack={() => setCurrentView('menu')}
        />
      )}

      {currentView === 'setup' && (
        <div className="p-4 md:p-8">
          <RunSetup
            onBack={() => setCurrentView('menu')}
            onBegin={(config) => { setRunConfig(config); setCurrentView('run'); }}
          />
        </div>
      )}

      {currentView === 'run' && runConfig && (
        <ActiveRun
          key={`${runConfig.character.id}-${Date.now()}`}
          config={runConfig}
          meta={metaApi.meta}
          metaApi={metaApi}
          onExit={() => setCurrentView('menu')}
        />
      )}
    </div>
  );
}

export default App;