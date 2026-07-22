import React, { useState, useEffect } from 'react';
import { assetUrl } from '../utils/assets';

const formatMoney = (val) => val < 0 ? `-$${Math.abs(val).toFixed(0)}` : `$${val.toFixed(0)}`;

// -----------------------------------------------------------------------------
// HISTORY LEDGER ROW COMPONENT
// -----------------------------------------------------------------------------
function HistoryLedgerRow({ heat }) {
  const pWon = heat.winnerId === heat.player.id;
  const oWon = heat.winnerId === heat.opp.id;
  const maxP = heat.maxPos || 150;

  const renderRacerInfo = (racer, isWinner) => (
    <div className="flex flex-col items-center gap-1 w-24">
       <div className={`relative flex items-end justify-center w-12 h-12 rounded-full border-b-4 ${isWinner ? (racer.isPlayer ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]') : 'border-stone-700 bg-stone-900 opacity-40 grayscale'} overflow-visible transition-all`}>
         {isWinner && <span className="absolute -top-3 -right-2 text-xl drop-shadow-md z-10">👑</span>}
         <img src={assetUrl(racer.imagePath)} className="w-10 h-10 object-contain origin-bottom" style={{transform: racer.isPlayer ? 'none' : 'scaleX(-1)'}} draggable={false} />
       </div>
       <div className="flex flex-col items-center w-full mt-0.5">
         <span className="font-mono text-[10px] font-bold text-stone-200 truncate w-full text-center leading-none mb-1.5">{racer.name}</span>
         <div className="flex items-center gap-1">
           <span className="text-[8px] font-mono font-bold text-sky-400 bg-sky-950/40 px-1 py-0.5 rounded border border-sky-900/50 uppercase tracking-widest leading-none">Lv.{racer.level || 1}</span>
           <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded border uppercase tracking-widest leading-none ${isWinner ? 'text-amber-400 bg-amber-950/40 border-amber-900/50' : 'text-stone-500 bg-stone-900/80 border-stone-700'}`}>Pos:{Math.min(racer.position || 0, maxP)}</span>
         </div>
       </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between bg-stone-900/80 border border-stone-700 p-3 sm:px-5 rounded-2xl shadow-inner w-full hover:border-stone-600 transition-colors">
      <div className="font-mono text-[10px] text-stone-400 font-bold w-12 sm:w-16 text-left tracking-widest uppercase">Heat {heat.heatIndex}</div>
      <div className="flex items-center gap-2 sm:gap-6">
        {renderRacerInfo(heat.player, pWon)}
        <span className="font-mono text-[9px] text-stone-600 font-black italic mb-6">VS</span>
        {renderRacerInfo(heat.opp, oWon)}
      </div>
      <div className={`font-mono text-lg sm:text-xl font-black w-20 sm:w-24 text-right ${heat.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        {heat.profit >= 0 ? '+' : ''}{formatMoney(heat.profit)}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN RACE HISTORY VIEW
// -----------------------------------------------------------------------------
export default function RaceHistory({ onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('raceHistory');
    let needsReset = false;
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure the history schema reflects multi-heats and is not the old single-heat schema.
      // We also check for exactly 5 items to prevent resetting if they've started accumulating real data,
      // while still safely populating all 5 dummy records if they only had the 2 from the previous step.
      if (parsed.length > 0 && !parsed[0].heats) {
         needsReset = true;
      } else if (parsed.length === 2 && parsed[0].id === 'dummy-circuit-2') {
         needsReset = true;
      } else {
         setHistory(parsed);
      }
    } else {
      needsReset = true;
    }

    if (needsReset) {
      const initial = [
        {
          id: 'dummy-circuit-2',
          date: new Date(Date.now() - 3600000).toLocaleString(),
          totalProfit: 210, 
          heats: [
            { heatIndex: 1, maxPos: 150, winnerId: 'p1', profit: 207,
              player: { id: 'p1', name: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', level: 1, position: 150, isPlayer: true },
              opp: { id: 'opp_1', name: 'Harehorse (AI)', imagePath: '/images/mounts/HareHorse.webp', level: 4, position: 89, isPlayer: false }
            },
            { heatIndex: 2, maxPos: 150, winnerId: 'opp_2', profit: -100,
              player: { id: 'p2', name: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', level: 4, position: 115, isPlayer: true },
              opp: { id: 'opp_2', name: 'Tauros (AI)', imagePath: '/images/mounts/Tauros.webp', level: 4, position: 150, isPlayer: false }
            },
            { heatIndex: 3, maxPos: 150, winnerId: 'p3', profit: 103,
              player: { id: 'p3', name: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', level: 5, position: 150, isPlayer: true },
              opp: { id: 'opp_3', name: 'Tauros (AI)', imagePath: '/images/mounts/Tauros.webp', level: 5, position: 125, isPlayer: false }
            }
          ]
        },
        {
          id: 'dummy-circuit-1',
          date: new Date(Date.now() - 86400000).toLocaleString(),
          totalProfit: -23,
          heats: [
            { heatIndex: 1, maxPos: 150, winnerId: 'p1', profit: 79,
              player: { id: 'p1', name: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', level: 4, position: 150, isPlayer: true },
              opp: { id: 'opp_1', name: 'Goraffe (AI)', imagePath: '/images/mounts/Goraffe.webp', level: 3, position: 125, isPlayer: false }
            },
            { heatIndex: 2, maxPos: 150, winnerId: 'p2', profit: 98,
              player: { id: 'p2', name: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', level: 5, position: 150, isPlayer: true },
              opp: { id: 'opp_2', name: 'Tauros (AI)', imagePath: '/images/mounts/Tauros.webp', level: 5, position: 130, isPlayer: false }
            },
            { heatIndex: 3, maxPos: 150, winnerId: 'opp_3', profit: -200,
              player: { id: 'p3', name: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', level: 1, position: 125, isPlayer: true },
              opp: { id: 'opp_3', name: 'Harehorse (AI)', imagePath: '/images/mounts/HareHorse.webp', level: 5, position: 150, isPlayer: false }
            }
          ]
        },
        {
          id: 'dummy-circuit-3',
          date: new Date(Date.now() - 250000000).toLocaleString(),
          totalProfit: 0,
          heats: [
            { heatIndex: 1, maxPos: 150, winnerId: 'opp_1', profit: -100,
              player: { id: 'p1', name: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', level: 5, position: 135, isPlayer: true },
              opp: { id: 'opp_1', name: 'Harehorse (AI)', imagePath: '/images/mounts/HareHorse.webp', level: 5, position: 150, isPlayer: false }
            },
            { heatIndex: 2, maxPos: 150, winnerId: 'opp_2', profit: -100,
              player: { id: 'p2', name: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', level: 4, position: 128, isPlayer: true },
              opp: { id: 'opp_2', name: 'Tauros (AI)', imagePath: '/images/mounts/Tauros.webp', level: 5, position: 150, isPlayer: false }
            },
            { heatIndex: 3, maxPos: 150, winnerId: 'p3', profit: 200,
              player: { id: 'p3', name: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', level: 1, position: 150, isPlayer: true },
              opp: { id: 'opp_3', name: 'Tauros (AI)', imagePath: '/images/mounts/Tauros.webp', level: 5, position: 142, isPlayer: false }
            }
          ]
        },
        {
          id: 'dummy-circuit-4',
          date: new Date(Date.now() - 400000000).toLocaleString(),
          totalProfit: 85,
          heats: [
            { heatIndex: 1, maxPos: 150, winnerId: 'p1', profit: 83,
              player: { id: 'p1', name: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', level: 4, position: 150, isPlayer: true },
              opp: { id: 'opp_1', name: 'Goraffe (AI)', imagePath: '/images/mounts/Goraffe.webp', level: 3, position: 110, isPlayer: false }
            },
            { heatIndex: 2, maxPos: 150, winnerId: 'p2', profit: 202,
              player: { id: 'p2', name: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', level: 1, position: 150, isPlayer: true },
              opp: { id: 'opp_2', name: 'Harehorse (AI)', imagePath: '/images/mounts/HareHorse.webp', level: 4, position: 136, isPlayer: false }
            },
            { heatIndex: 3, maxPos: 150, winnerId: 'opp_3', profit: -200,
              player: { id: 'p3', name: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', level: 5, position: 139, isPlayer: true },
              opp: { id: 'opp_3', name: 'Warhog (AI)', imagePath: '/images/mounts/Warhog.webp', level: 5, position: 150, isPlayer: false }
            }
          ]
        },
        {
          id: 'dummy-circuit-5',
          date: new Date(Date.now() - 500000000).toLocaleString(),
          totalProfit: -187,
          heats: [
            { heatIndex: 1, maxPos: 150, winnerId: 'opp_1', profit: -100,
              player: { id: 'p1', name: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', level: 1, position: 143, isPlayer: true },
              opp: { id: 'opp_1', name: 'Warhog (AI)', imagePath: '/images/mounts/Warhog.webp', level: 5, position: 150, isPlayer: false }
            },
            { heatIndex: 2, maxPos: 150, winnerId: 'p2', profit: 113,
              player: { id: 'p2', name: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', level: 4, position: 150, isPlayer: true },
              opp: { id: 'opp_2', name: 'Tauros (AI)', imagePath: '/images/mounts/Tauros.webp', level: 5, position: 123, isPlayer: false }
            },
            { heatIndex: 3, maxPos: 150, winnerId: 'opp_3', profit: -200,
              player: { id: 'p3', name: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', level: 5, position: 141, isPlayer: true },
              opp: { id: 'opp_3', name: 'Harehorse (AI)', imagePath: '/images/mounts/HareHorse.webp', level: 5, position: 150, isPlayer: false }
            }
          ]
        }
      ];
      setHistory(initial);
      localStorage.setItem('raceHistory', JSON.stringify(initial));
    }
  }, []);

  const removeEntry = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('raceHistory', JSON.stringify(updated));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.setItem('raceHistory', JSON.stringify([]));
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1317] font-sans text-stone-200 p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out]">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-stone-800 pb-4 gap-4">
          <div>
            <h1 className="font-serif text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">RACE HISTORY</h1>
            <p className="font-mono text-xs uppercase text-stone-500 tracking-widest mt-2">Wager Resolution Ledger</p>
          </div>
          <div className="flex gap-4">
            <button onClick={clearAll} className="border border-rose-900/50 bg-rose-950/40 text-rose-400 px-6 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest hover:bg-rose-900/60 hover:text-rose-300 transition-colors shadow-inner">
              Clear All
            </button>
            <button onClick={onBack} className="border border-stone-700 bg-stone-900 px-6 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shadow-inner">
              Back to Gateway
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-12 pb-16">
          {history.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 bg-stone-900/30 rounded-2xl border-2 border-dashed border-stone-700">
                <span className="font-mono text-sm uppercase text-stone-500 tracking-widest">No race history found.</span>
                <span className="font-mono text-[10px] text-stone-600 mt-2">Complete circuit wagers to build your legacy.</span>
             </div>
          ) : (
            history.map((circuit) => {
              const isProfit = circuit.totalProfit >= 0;
              
              return (
                <div key={circuit.id} className="flex flex-col items-center bg-stone-950/80 border border-stone-800 p-6 sm:p-10 rounded-[2rem] shadow-2xl relative gap-6">
                  
                  <div className="flex justify-between items-start border-b border-stone-800/80 pb-4 w-full">
                     <div className="flex flex-col">
                        <span className="font-serif text-3xl font-black text-amber-400 tracking-tight">CIRCUIT RESOLVED</span>
                        <span className="font-mono text-xs text-stone-500 uppercase tracking-widest mt-1">{circuit.date}</span>
                     </div>
                     <button onClick={() => removeEntry(circuit.id)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-stone-900 border border-stone-700 text-stone-500 hover:text-rose-500 hover:border-rose-900/50 transition-colors" title="Remove Record">
                        ✕
                     </button>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                     {circuit.heats.map(heat => (
                        <HistoryLedgerRow key={heat.heatIndex} heat={heat} />
                     ))}
                  </div>

                  <div className={`mt-4 p-6 sm:p-8 rounded-2xl border-4 flex flex-col items-center w-full shadow-2xl ${isProfit ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-500/20' : 'bg-rose-950/30 border-rose-500/50 shadow-rose-500/20'}`}>
                     <span className={`font-mono text-sm font-bold uppercase tracking-widest mb-2 ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                       {isProfit ? 'Total Net Profit' : 'Total Net Loss'}
                     </span>
                     <span className={`font-serif text-[4rem] sm:text-[5rem] font-black leading-none ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {isProfit ? '+' : ''}{formatMoney(circuit.totalProfit)}
                     </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { 0%{opacity:0; transform:translateY(10px)} 100%{opacity:1; transform:translateY(0)} }
      `}} />
    </div>
  );
}