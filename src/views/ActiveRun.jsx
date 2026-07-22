// src/views/ActiveRun.jsx
import { useEffect, useRef, useState } from 'react';
import { useRunState } from '../hooks/useRunState';
import { getItemMeta } from '../data/items';
import { rollReward } from '../data/rewards';
import { assetUrl } from '../utils/assets';
import MapGrid from '../components/map/MapGrid';
import EncounterScreen from '../components/combat/EncounterScreen';
import RewardReveal from '../components/combat/RewardReveal';
import Hearts from '../components/combat/Hearts';

function LegacyInventoryBar({ inventory }) {
  const entries = Object.entries(inventory).filter(([, qty]) => qty > 0);
  if (entries.length === 0) return <span className="font-mono text-xs uppercase tracking-widest text-stone-600">Satchel empty</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([id, qty]) => {
        const meta = getItemMeta(id);
        return (
          <span key={id} className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm" style={{ borderColor: `${meta.hex}55`, backgroundColor: `${meta.hex}15` }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.hex }} />
            <span className="text-stone-300">{meta.name}</span>
            <span className="font-mono font-bold text-white">{qty}</span>
          </span>
        );
      })}
    </div>
  );
}

function VerticalInventory({ inventory }) {
  const entries = Object.entries(inventory).filter(([, qty]) => qty > 0);
  if (entries.length === 0) return <span className="font-mono text-xs uppercase tracking-widest text-stone-500 italic">Satchel is currently empty</span>;

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([id, qty]) => {
        const meta = getItemMeta(id);
        return (
          <div key={id} className="flex items-center justify-between rounded-xl border bg-stone-950/50 p-3 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: `${meta.hex}40` }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-inner" style={{ backgroundColor: `${meta.hex}20` }}>
                 {meta.imagePath ? <img src={assetUrl(meta.imagePath)} alt={meta.name} className="h-6 w-6 object-contain" draggable={false} /> : (meta.emoji || '📦')}
              </div>
              <span className="font-bold text-stone-200">{meta.name}</span>
            </div>
            <span className="font-mono text-lg font-black" style={{ color: meta.hex }}>×{qty}</span>
          </div>
        );
      })}
    </div>
  );
}

function BigInventoryGrid({ inventory }) {
  const entries = Object.entries(inventory).filter(([, qty]) => qty > 0);
  if (entries.length === 0) return <p className="text-stone-500 italic">No resources gathered.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map(([id, qty]) => {
        const meta = getItemMeta(id);
        return (
          <div key={id} className="flex flex-col items-center justify-center rounded-xl border bg-stone-900/50 p-4 shadow-inner transition-transform hover:-translate-y-1" style={{ borderColor: `${meta.hex}40` }}>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: `${meta.hex}20` }}>
              {meta.imagePath ? <img src={assetUrl(meta.imagePath)} alt={meta.name} draggable={false} className="h-8 w-8 object-contain" /> : (meta.emoji || '📦')}
            </div>
            <span className="text-center text-xs font-bold text-stone-300">{meta.name}</span>
            <span className="font-mono text-lg font-black" style={{ color: meta.hex }}>×{qty}</span>
          </div>
        );
      })}
    </div>
  );
}

function RunSummary({ phase, inventory, reward, onExit }) {
  const config = {
    VICTORY: { icon: '🏆', title: 'Run Complete!', sub: 'You conquered the Mire. Resources secured.', color: 'text-amber-400', kept: true, bg: 'border-amber-500/30 bg-stone-900/90 shadow-[0_0_40px_rgba(251,191,36,0.15)]' },
    RETREAT: { icon: '⮐', title: 'Tactical Retreat', sub: 'You withdrew safely with your haul. A wise choice.', color: 'text-emerald-400', kept: true, bg: 'border-emerald-500/30 bg-stone-900/90 shadow-[0_0_40px_rgba(52,211,153,0.1)]' },
    DEFEAT: { icon: '💀', title: 'Defeated', sub: 'You fell in the Mire. All gathered resources are lost.', color: 'text-rose-500', kept: false, bg: 'border-rose-500/30 bg-stone-900/90 shadow-[0_0_40px_rgba(244,63,94,0.1)]' },
  }[phase];

  return (
    <div className={`mx-auto max-w-2xl rounded-2xl border p-10 text-center backdrop-blur-md ${config.bg}`}>
      <div className="mb-3 text-6xl">{config.icon}</div>
      <h2 className={`mb-2 font-serif text-4xl font-black ${config.color}`}>{config.title}</h2>
      <p className="mb-8 text-stone-400">{config.sub}</p>

      {phase === 'VICTORY' && reward && (
        <div className="mb-8">
          <div className="mb-5 flex items-center justify-center gap-3 opacity-60">
            <span className="h-px w-12 bg-stone-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-stone-300">Prize Claimed</h3>
            <span className="h-px w-12 bg-stone-400" />
          </div>
          <RewardReveal reward={reward} />
        </div>
      )}

      {config.kept && (
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-center gap-3 opacity-60">
            <span className="h-px w-12 bg-stone-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-stone-300">Secured Haul</h3>
            <span className="h-px w-12 bg-stone-400" />
          </div>
          <BigInventoryGrid inventory={inventory} />
        </div>
      )}

      <button type="button" onClick={onExit} className="rounded-lg bg-stone-200 px-10 py-4 font-black uppercase tracking-wider text-stone-950 transition hover:bg-white">
        Return to Main Menu
      </button>
    </div>
  );
}

function FallbackHeader({ run, onExit }) {
  return (
    <header className="fixed top-4 left-4 right-4 z-[100] flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-700/50 bg-stone-950/60 p-4 shadow-2xl backdrop-blur-md transition-all">
      <div className="flex items-center gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Level {run.position.level}</p>
          <p className="font-serif text-lg font-bold text-white">{run.character.name}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Health</p>
          <Hearts hp={run.hp} max={run.maxHp} />
        </div>
      </div>
      <div className="ml-2 flex-1 border-l border-stone-800 px-4 hidden md:block">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">Satchel</p>
        <LegacyInventoryBar inventory={run.inventory} />
      </div>
      <button type="button" onClick={onExit} className="rounded-lg border border-rose-900/50 px-6 py-2 text-xs font-bold uppercase tracking-wider text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-200">
        Abandon
      </button>
    </header>
  );
}

export default function ActiveRun({ config, meta, metaApi, onExit }) {
const run = useRunState(config.character, config.biome);  const ended = ['VICTORY', 'DEFEAT', 'RETREAT'].includes(run.phase);

  const [prospectiveReward, setProspectiveReward] = useState(null);
  const settledRef = useRef(false);

  useEffect(() => {
    if (!prospectiveReward) {
      setProspectiveReward(rollReward(config.biome, meta));
    }
  }, []); 

  useEffect(() => {
    if (settledRef.current || !ended) return;
    settledRef.current = true;

    const levels = run.phase === 'VICTORY' ? 5 : run.position.level;
    const outcome = run.phase === 'VICTORY' ? 'Victory' : run.phase === 'RETREAT' ? 'Retreat' : 'Defeat';

    if (run.phase === 'VICTORY') {
      metaApi.claimReward(prospectiveReward);
      metaApi.bankResources(run.inventory);
    } else if (run.phase === 'RETREAT') {
      metaApi.bankResources(run.inventory);
    }
    metaApi.recordRun({ hero: run.character.name, biome: config.biome, outcome, levels });
  }, [run.phase, ended, prospectiveReward]);

  if (run.phase === 'ENCOUNTER' || ended) {
    return (
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-stone-950 font-sans text-stone-200">
        <FallbackHeader run={run} onExit={onExit} />
        {run.phase === 'ENCOUNTER' && <EncounterScreen run={run} />}
        {ended && (
           <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <RunSummary phase={run.phase} inventory={run.inventory} reward={prospectiveReward} onExit={onExit} />
           </div>
        )}
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes lootPop { 0% { opacity: 0; transform: scale(0.5) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
          @media (prefers-reduced-motion: reduce) { .animate-\\[lootPop_0\\.5s_cubic-bezier\\(0\\.22\\,1\\.4\\,0\\.6\\,1\\)_both\\], .animate-\\[lootPop_0\\.6s_cubic-bezier\\(0\\.22\\,1\\.4\\,0\\.6\\,1\\)_both\\] { animation: none !important; } }
        `}} />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden bg-stone-950 font-sans text-stone-200 lg:flex-row lg:overflow-hidden selection:bg-amber-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-indigo-900/10 mix-blend-screen blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-900/10 mix-blend-screen blur-[150px]" />

      <div className="relative z-10 flex h-auto min-h-[50vh] w-full flex-col items-center overflow-hidden border-b border-stone-800/50 p-6 text-center lg:h-full lg:w-[30%] lg:min-w-[320px] lg:border-b-0 lg:border-r lg:p-8">
        <div className="z-20 w-full shrink-0">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-500">Level {run.position.level}</p>
          <h2 className="font-serif text-3xl font-black text-white drop-shadow-lg lg:text-4xl">The Maiev Swamp</h2>
        </div>
        
        <div className="relative my-4 flex min-h-[250px] w-full flex-1 items-center justify-center">
           <img 
             src={assetUrl(run.character.imagePath)} 
             alt={run.character.name} 
             className="absolute max-h-[120%] w-[140%] object-contain object-center drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)]" 
           />
        </div>

        <div className="z-20 flex w-full shrink-0 flex-col items-center pb-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Campaign Hero</p>
          <h2 className="mb-3 font-serif text-4xl font-black text-white drop-shadow-lg lg:text-5xl">{run.character.name}</h2>
          <Hearts hp={run.hp} max={run.maxHp} size="text-2xl lg:text-3xl" />
        </div>
      </div>

      <div className="custom-scrollbar z-10 flex w-full flex-1 flex-col items-center justify-center p-4 lg:h-full lg:p-8">
        <div className="w-full max-w-3xl">
          <MapGrid
            position={run.position} visited={run.visited} movement={run.movement}
            mapAffixes={run.mapAffixes} prospectiveReward={prospectiveReward}
            onExplore={run.exploreCurrent} onAscend={run.ascend} onRetreat={run.retreat}
          />
        </div>
      </div>

      <div className="custom-scrollbar z-10 flex w-full flex-col border-t border-stone-800/50 bg-stone-900/60 p-6 backdrop-blur-xl lg:h-full lg:w-[25%] lg:min-w-[300px] lg:border-l lg:border-t-0 lg:p-8">
         <div className="mb-8 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-stone-400">Satchel</h3>
            <button type="button" onClick={onExit} className="rounded-lg border border-rose-900/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 transition hover:bg-rose-500/15 hover:text-rose-300 lg:text-xs">
              Abandon
            </button>
         </div>
         <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
            <VerticalInventory inventory={run.inventory} />
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine { to { transform: translateX(220%) skewX(-12deg); } }
        @keyframes nodePulse { 0%,100% { box-shadow: 0 0 15px rgba(251,191,36,0.3); } 50% { box-shadow: 0 0 35px rgba(251,191,36,0.7); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(120,113,108,0.4); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(120,113,108,0.7); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(120,113,108,0.4) transparent; }
        @media (prefers-reduced-motion: reduce) {
          .group-hover\\:animate-\\[shine_0\\.7s_ease-out\\], .animate-\\[nodePulse_2s_ease-in-out_infinite\\] { animation: none !important; }
        }
      `}} />
    </div>
  );
}