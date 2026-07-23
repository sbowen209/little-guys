import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/assets';
import { useRaceEngine } from '../hooks/useRaceEngine';
import RaceBoard from '../components/RaceBoard';

// -----------------------------------------------------------------------------
// MATH & POSITION HELPERS
// -----------------------------------------------------------------------------
function getRacerCoordinates(pos, laneIndex) {
  const normalizedPos = (pos % 150 === 0 && pos > 0) ? 150 : pos % 150;
  const isInner = laneIndex === 0;

  let x, y, isFlipped = false;
  if (normalizedPos <= 50) {
    const progress = normalizedPos / 50;
    x = 250 + progress * 700;
    y = isInner ? 120 : 80;
  } else if (normalizedPos <= 75) {
    const progress = (normalizedPos - 50) / 25;
    const angle = -Math.PI / 2 + (progress * Math.PI);
    const r = isInner ? 130 : 170;
    x = 950 + Math.cos(angle) * r;
    y = 250 + Math.sin(angle) * r;
    if (normalizedPos >= 62.5) isFlipped = true; 
  } else if (normalizedPos <= 125) {
    const progress = (normalizedPos - 75) / 50;
    x = 950 - progress * 700;
    y = isInner ? 380 : 420;
    isFlipped = true; 
  } else {
    const progress = (normalizedPos - 125) / 25;
    const angle = Math.PI / 2 + (progress * Math.PI);
    const r = isInner ? 130 : 170;
    x = 250 + Math.cos(angle) * r;
    y = 250 + Math.sin(angle) * r;
    if (normalizedPos < 137.5) isFlipped = true; 
  }

  return { x: x - 50, y: y - 50, isFlipped };
}

const formatMoney = (val) => val < 0 ? `-$${Math.abs(val).toFixed(0)}` : `$${val.toFixed(0)}`;

// -----------------------------------------------------------------------------
// UI COMPONENTS
// -----------------------------------------------------------------------------
const THEME_MAP = {
  sky: { text: 'text-sky-400', bg: 'bg-sky-500', shadow: 'shadow-sky-500/80' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/80' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500', shadow: 'shadow-rose-500/80' },
  stone: { text: 'text-stone-400', bg: 'bg-stone-500', shadow: 'shadow-stone-500/80' },
};

function LabeledStat({ label, val = 0, max = 30, colorTheme }) {
  const pct = Math.min(100, Math.max(0, (val / max) * 100));
  const classes = THEME_MAP[colorTheme] || THEME_MAP.stone;
  return (
    <div className="flex w-full items-center gap-2">
       <span className={`w-8 text-left font-mono text-[11px] font-black uppercase drop-shadow-sm ${classes.text}`}>{label}</span>
       <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-stone-900/80 shadow-inner">
         <div className={`h-full rounded-full shadow-[0_0_8px_var(--tw-shadow-color)] ${classes.bg} ${classes.shadow}`} style={{ width: `${pct}%` }} />
       </div>
       <span className="w-5 text-right font-mono text-[11px] font-bold text-stone-300">{val}</span>
    </div>
  );
}

function RacerHUD({ racer, racerIndex, isActive, laps, maxPos }) {
  const avatarRing = racerIndex === 0 ? 'border-amber-500' : 'border-purple-500';
  const currentLap = racer.position === 0 ? 1 : Math.min(laps, Math.ceil(racer.position / 150));

  return (
    <div className={`relative flex w-full sm:w-64 shrink-0 flex-col rounded-[1.5rem] border-2 bg-stone-900/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 ${isActive ? `border-stone-500 shadow-[0_0_35px_rgba(0,0,0,0.6)] sm:-translate-y-2 sm:scale-[1.03] z-20` : 'border-stone-800/60 opacity-70 grayscale-[0.3] z-10'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`relative flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-full border-b-4 ${avatarRing} bg-stone-800 shadow-inner`}>
          {racer.isPenalized && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-rose-950/70 backdrop-blur-[1px]"><span className="text-xl font-black drop-shadow-md">💥</span></div>
          )}
          <img src={assetUrl(racer.imagePath)} alt={racer.name} draggable={false} className="h-12 w-12 object-contain origin-bottom drop-shadow-md" />
        </div>
        <div className="flex flex-1 flex-col justify-center overflow-hidden">
          <h3 className="font-serif text-xl font-black leading-none tracking-tight text-white drop-shadow-md truncate">{racer.name}</h3>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-1 flex flex-col gap-0.5">
            <span>Lap {currentLap}/{laps}</span>
            <span>Pos: <span className="text-stone-300">{racer.position} <span className="text-stone-600 text-[9px]">/ {maxPos}</span></span></span>
          </span>
        </div>
      </div>
      
      <div className="flex w-full flex-col gap-2.5 border-t border-stone-700/60 pt-3">
        <LabeledStat label="Spd" val={racer.racingStats.speed} max={30} colorTheme="sky" />
        <LabeledStat label="Jmp" val={racer.racingStats.jump} max={30} colorTheme="emerald" />
        <LabeledStat label="Trn" val={racer.racingStats.turning} max={30} colorTheme="rose" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// HEAT LEDGER ROW COMPONENT
// -----------------------------------------------------------------------------
function HeatLedgerRow({ heat }) {
  const pWon = heat.winner.id === heat.player.id;
  const oWon = heat.winner.id === heat.opp.id;
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
    <div className="flex items-center justify-between bg-stone-900/80 border border-stone-700 p-3 sm:px-5 rounded-2xl shadow-inner w-full">
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
// CORE RACE VIEW (Single Heat)
// -----------------------------------------------------------------------------
function ActiveRaceView({ racers: initialRacers, onAbandon, isCircuit, circuitState, onNextHeat }) {
  const { racers, activeRacerIndex, logs, isFinished, winner, takeTurn, executeInitiative, busy, flash, trackData, gameSpeed, setGameSpeed, laps, currentTurn } = useRaceEngine(initialRacers);

  const [raceState, setRaceState] = useState('ready');
  const [count, setCount] = useState(3);

  const [racer1, racer2] = racers;
  const r1Coords = getRacerCoordinates(racer1.position, 0); 
  const r2Coords = getRacerCoordinates(racer2.position, 1); 
  const maxPos = trackData.length * laps; 

  useEffect(() => {
    if (raceState === 'countdown') {
      if (count > 0) {
        const t = setTimeout(() => setCount(count - 1), 1000);
        return () => clearTimeout(t);
      } else {
        setRaceState('initiative');
        executeInitiative().then(() => setRaceState('running'));
      }
    }
  }, [raceState, count, executeInitiative]);

  useEffect(() => {
    let t;
    if (raceState === 'running' && !busy && !isFinished) {
      t = setTimeout(() => { takeTurn(); }, 700 / gameSpeed); 
    }
    if (isFinished && raceState === 'running') {
      setRaceState('finished');
    }
    return () => clearTimeout(t);
  }, [raceState, busy, isFinished, takeTurn, gameSpeed]);

  const profitThisHeat = isCircuit && winner ? (
    winner.isPlayer && winner.wagerInfo 
      ? (winner.wagerInfo.potential - winner.wagerInfo.amount) 
      : (!winner.isPlayer && racer1.wagerInfo ? -racer1.wagerInfo.amount : 0)
  ) : 0;
  
  const newTotal = isCircuit ? (circuitState.winnings + profitThisHeat) : 0;
  const heatWinner = racer1.position >= maxPos ? racer1 : racer2;

  const allHeats = isCircuit ? [
    ...(circuitState.history || []),
    { heatIndex: circuitState.current, player: racer1, opp: racer2, winner: heatWinner, profit: profitThisHeat, maxPos }
  ] : [];

  const handleFinishAction = () => {
    if (!isCircuit) {
      onAbandon();
      return;
    }
    onNextHeat({
      profit: profitThisHeat,
      player: racer1,
      opp: racer2,
      winner: heatWinner,
      maxPos
    });
  };
  
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#060c14] via-[#091512] to-[#12080a] text-stone-200">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(5,7,10,0.95)_100%)]" />
      <div className="pointer-events-none fixed -left-[5%] -top-[5%] z-0 h-[60vh] w-[60vh] rounded-full bg-emerald-600/20 mix-blend-screen blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-[5%] -right-[5%] z-0 h-[60vh] w-[60vh] rounded-full bg-rose-600/20 mix-blend-screen blur-[140px]" />

      {/* Circuit Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-30 p-4 pointer-events-none flex justify-between px-8 items-start">
        <div className="flex flex-col gap-2">
          {isCircuit && (
            <div className="bg-stone-900/80 border border-stone-800 px-4 py-2 rounded-lg backdrop-blur shadow-xl font-mono text-xs uppercase tracking-widest text-stone-300 w-max pointer-events-auto">
               Heat <span className="text-amber-400 font-bold">{circuitState.current}</span> / {circuitState.total}
            </div>
          )}
          <div className="bg-stone-900/80 border border-stone-800 px-4 py-2 rounded-lg backdrop-blur shadow-xl font-mono text-xs uppercase tracking-widest text-stone-300 w-max pointer-events-auto">
             Turn <span className="text-sky-400 font-bold">{currentTurn}</span>
          </div>
        </div>
        {isCircuit && (
          <div className="bg-stone-900/80 border border-stone-800 px-4 py-2 rounded-lg backdrop-blur shadow-xl font-mono text-xs uppercase tracking-widest text-stone-300 w-max pointer-events-auto">
             Current Profit: <span className={`font-black ${circuitState.winnings >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{formatMoney(circuitState.winnings)}</span>
          </div>
        )}
      </div>

      {/* Victory Sequence Popup */}
      {raceState === 'finished' && winner && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stone-950/95 p-6 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out] overflow-y-auto">
           <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_70%)] animate-[pulse_2s_ease-in-out_infinite]" />
           <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full py-10">
             
             <h1 className="font-serif text-[4rem] sm:text-[6rem] font-black text-amber-400 tracking-tight drop-shadow-[0_0_50px_rgba(251,191,36,0.6)] animate-[lootPop_0.6s_ease-out_both]">VICTORY!</h1>
             
             <div className="relative my-4 h-[12rem] w-[12rem] sm:my-6 sm:h-[18rem] sm:w-[18rem]">
               <img src={assetUrl(winner.imagePath)} alt={winner.name} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-[jumpBounce_1.2s_ease-in-out_infinite]" />
             </div>
             
             <h2 className="text-2xl sm:text-4xl font-serif font-black text-white drop-shadow-lg mb-6 animate-[fadeIn_1s_ease-out_0.5s_both]">
               {winner.name} takes the crown!
             </h2>
             
             <div className="flex flex-col w-full max-w-md mb-6 animate-[fadeIn_1s_ease-out_0.8s_both]">
               
               {isCircuit ? (
                 <div className="w-full">
                    <h3 className="text-left font-mono text-xs uppercase tracking-widest text-stone-500 border-b border-stone-800 pb-2 mb-3">Circuit Ledger</h3>
                    <div className="flex flex-col gap-2 w-full max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                       {allHeats.map(heat => <HeatLedgerRow key={heat.heatIndex} heat={heat} />)}
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-3 border-t border-stone-800 px-4 bg-stone-950/50 rounded-b-xl">
                       <span className="text-sm font-bold font-mono uppercase text-stone-400">Total Net Profit:</span>
                       <span className={`font-serif text-3xl font-black ${newTotal >= 0 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'text-rose-500'}`}>
                          {formatMoney(newTotal)}
                       </span>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col rounded-xl border border-stone-700 bg-stone-900/80 shadow-inner w-full overflow-hidden">
                    <div className="bg-stone-950 py-2 border-b border-stone-700 text-stone-400 font-mono text-[10px] uppercase tracking-widest">Exhibition Complete</div>
                    <div className="flex items-center justify-center px-6 py-8">
                       <span className="font-serif text-3xl font-black text-amber-400">{heatWinner.name} Wins!</span>
                    </div>
                 </div>
               )}

             </div>

             <button onClick={handleFinishAction} className="w-full max-w-md rounded-xl border-2 border-amber-500 bg-amber-500/20 px-8 py-5 font-mono text-lg font-black uppercase tracking-widest text-amber-400 hover:bg-amber-400 hover:text-stone-950 transition-all hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-[fadeIn_1s_ease-out_1s_both]">
               {isCircuit ? (circuitState.current === circuitState.total ? "Complete Circuit" : "Proceed to Next Heat ➔") : "Return to Gateway"}
             </button>
           </div>
        </div>
      )}

      {/* Initiation & Roll-Off Overlays */}
      {flash?.type === 'initiative' && raceState === 'initiative' && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-stone-950/85 backdrop-blur-md p-6 animate-[fadeIn_0.3s_ease-out]">
           <h2 className="relative z-10 font-serif text-3xl sm:text-5xl font-black text-emerald-400 tracking-widest uppercase mb-2 animate-[lootPop_0.4s_ease-out]">Jump Roll-Off</h2>
           {flash.isTie && <h3 className="relative z-10 font-serif text-2xl font-black text-rose-500 tracking-widest uppercase mb-8 animate-pulse">Dead Heat! Rerolling...</h3>}
           <div className="relative z-10 flex w-full max-w-5xl justify-center items-center gap-8 sm:gap-20 mt-8">
              <div className={`flex flex-col items-center flex-1 transition-all duration-700 ${flash.winnerIndex === 0 ? 'scale-110 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]' : flash.isTie ? 'scale-100' : 'scale-90 opacity-50 grayscale-[0.5]'}`}>
                 <img src={assetUrl(racer1.imagePath)} alt={racer1.name} draggable={false} className="h-32 sm:h-48 object-contain drop-shadow-xl" />
                 <div className="mt-4 flex flex-col items-center w-full max-w-[200px]">
                   <span className="font-serif text-5xl sm:text-7xl font-black text-white">{flash.rolls[0]}</span>
                 </div>
              </div>
              <span className="font-serif text-4xl sm:text-6xl text-stone-700 italic font-black">VS</span>
              <div className={`flex flex-col items-center flex-1 transition-all duration-700 ${flash.winnerIndex === 1 ? 'scale-110 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]' : flash.isTie ? 'scale-100' : 'scale-90 opacity-50 grayscale-[0.5]'}`}>
                 <img src={assetUrl(racer2.imagePath)} alt={racer2.name} draggable={false} className="h-32 sm:h-48 object-contain drop-shadow-xl" style={{ transform: 'scaleX(-1)' }}/>
                 <div className="mt-4 flex flex-col items-center w-full max-w-[200px]">
                   <span className="font-serif text-5xl sm:text-7xl font-black text-white">{flash.rolls[1]}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {raceState === 'ready' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-6 backdrop-blur-sm">
           <button onClick={() => setRaceState('countdown')} className="w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-amber-400 bg-amber-500/10 px-8 py-6 sm:px-16 sm:py-8 font-serif text-3xl sm:text-5xl font-black uppercase tracking-widest text-amber-400 transition-all hover:scale-105 hover:bg-amber-400 hover:text-stone-950">Start Heat</button>
        </div>
      )}

      {raceState === 'countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm">
           <span key={count} className="animate-[lootPop_0.5s_ease-out] font-serif text-[8rem] sm:text-[12rem] font-black text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]">{count > 0 ? count : 'GO!'}</span>
        </div>
      )}

      {/* Main Board UI */}
      <div className="relative z-10 flex w-full flex-1 flex-col justify-between p-3 sm:p-6 lg:p-8 h-full max-h-screen">
        <div className="flex w-full flex-1 items-center justify-center pb-4 min-h-[50vh]">
          <div className="w-full max-w-[1700px] h-full flex items-center justify-center drop-shadow-2xl">
            <RaceBoard racer1={racer1} racer2={racer2} r1Coords={r1Coords} r2Coords={r2Coords} activeRacerIndex={activeRacerIndex} flash={flash} isRunning={raceState === 'running'} trackData={trackData} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between pb-2">
          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:items-end">
            <RacerHUD racer={racer1} racerIndex={0} isActive={activeRacerIndex === 0 && !isFinished && (raceState === 'running' || raceState === 'initiative')} laps={laps} maxPos={maxPos} />
            <RacerHUD racer={racer2} racerIndex={1} isActive={activeRacerIndex === 1 && !isFinished && (raceState === 'running' || raceState === 'initiative')} laps={laps} maxPos={maxPos} />

            <div className="flex w-full sm:w-auto flex-row items-center gap-4 rounded-[1.5rem] border border-stone-700 bg-stone-900/95 px-5 py-3 shadow-2xl backdrop-blur-xl">
               <div className="flex flex-col">
                 <h2 className="font-serif text-xl font-black leading-none text-rose-500">THE OVAL</h2>
                 <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">Circuit Heat</span>
               </div>
               <div className="h-10 w-px bg-stone-700/80" />
               <div className="flex flex-col gap-1">
                 <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-stone-500">Speed</span>
                 <div className="flex gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                    {[1, 2, 4].map(spd => (
                       <button key={spd} onClick={() => setGameSpeed(spd)} className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded transition-colors ${gameSpeed === spd ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:bg-stone-800'}`}>{spd}x</button>
                    ))}
                 </div>
               </div>
               <button type="button" onClick={onAbandon} className="ml-auto hidden sm:block rounded-lg border border-rose-900/50 bg-rose-950/40 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20">Abandon</button>
            </div>
          </div>
          <div className="hidden lg:block shrink-0 transition-all duration-300 lg:w-[14rem]" />
        </div>
      </div>

      {/* Cinematic Announcer Character Only */}
      {(raceState === 'running' || raceState === 'finished' || raceState === 'initiative') && (
        <div className="pointer-events-none fixed bottom-0 right-0 z-40 flex w-full max-w-full flex-col items-end justify-end pr-3 pb-3 sm:pr-8 sm:pb-6">
          <div className="relative flex flex-col items-end justify-end">
             <div className="transition-all duration-500 origin-bottom animate-[fadeIn_0.5s_ease-out]">
               <img src={assetUrl('/images/characters/Juri.webp')} alt="Announcer" draggable={false} className="h-24 sm:h-32 lg:h-[18rem] xl:h-[22rem] w-auto object-contain object-bottom drop-shadow-[0_-10px_35px_rgba(0,0,0,0.9)] lg:-mr-6" />
             </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes lootPop { 0% { opacity: 0; transform: scale(0.5) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeIn { 0%{opacity:0} 100%{opacity:1} }
        @keyframes battleShake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-10px,5px)} 40%{transform:translate(10px,-5px)} 60%{transform:translate(-6px,4px)} 80%{transform:translate(6px,-3px)} }
        @keyframes jumpBounce { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-40px) scale(1.05)} }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #44403c; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #57534e; }
      `}} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN RACE MANAGER (Handles Circuit Wrapping seamlessly)
// -----------------------------------------------------------------------------
export default function RaceManager({ racers, track, onAbandon }) {
  const [heatIndex, setHeatIndex] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [heatResults, setHeatResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  // The critical fix: Detect multi-heat array structure directly
  const isCircuit = Array.isArray(racers[0]);
  const circuitData = isCircuit ? racers : null;
  const currentRacers = isCircuit ? circuitData[heatIndex] : racers;

  if (!isCircuit) {
    return <ActiveRaceView key="quick-race" racers={currentRacers} track={track} onAbandon={onAbandon} isCircuit={false} />;
  }

  const handleNextHeat = (heatData) => {
    const newTotal = winnings + heatData.profit;
    setWinnings(newTotal);
    
    const nextHeatResult = { ...heatData, heatIndex: heatIndex + 1 };
    const updatedHeats = [...heatResults, nextHeatResult];
    setHeatResults(updatedHeats);

    if (!heatData.player.isPractice) {
       const saved = localStorage.getItem('playerProfiles');
       if (saved) {
         const profiles = JSON.parse(saved);
         const profileIndex = profiles.findIndex(p => p.id === heatData.player.presetId);
         if (profileIndex > -1) {
           if (heatData.winner.id === heatData.player.id) profiles[profileIndex].wins += 1;
           else profiles[profileIndex].losses += 1;
           localStorage.setItem('playerProfiles', JSON.stringify(profiles));
         }
       }
    }
    
    if (heatIndex + 1 < circuitData.length) {
      setHeatIndex(prev => prev + 1);
    } else {
      // --- RACE HISTORY CACHE (Circuit Save) ---
      if (!heatData.player.isPractice) {
        const savedHistory = localStorage.getItem('raceHistory');
        let history = [];
        
        if (savedHistory) {
           const parsed = JSON.parse(savedHistory);
           // Handle smooth cache reset if data is from the old single-heat iteration
           if (parsed.length > 0 && !parsed[0].heats) history = []; 
           else history = parsed;
        }

        history.unshift({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          date: new Date().toLocaleString(),
          totalProfit: newTotal,
          heats: updatedHeats.map(h => ({
            heatIndex: h.heatIndex,
            profit: h.profit,
            maxPos: h.maxPos,
            winnerId: h.winner.id,
            player: {
              id: h.player.id,
              name: h.player.name,
              imagePath: h.player.imagePath,
              level: h.player.level,
              position: h.player.position,
              isPlayer: true
            },
            opp: {
              id: h.opp.id,
              name: h.opp.name,
              imagePath: h.opp.imagePath,
              level: h.opp.level,
              position: h.opp.position,
              isPlayer: false
            }
          }))
        });
        localStorage.setItem('raceHistory', JSON.stringify(history));
      }
      // ------------------------------------------

      setShowSummary(true);
    }
  };

  if (showSummary) {
    const isProfit = winnings >= 0;
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stone-950 text-white p-6 animate-[fadeIn_0.5s_ease-out] overflow-y-auto custom-scrollbar">
         <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(5,5,5,0.9)_0%,rgba(10,10,10,1)_100%)]" />
         <div className="relative z-10 flex flex-col items-center bg-stone-900 border border-stone-800 p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-2xl text-center my-auto">
           <h1 className="font-serif text-5xl sm:text-6xl font-black text-amber-400 tracking-tighter mb-2">CIRCUIT COMPLETE</h1>
           <span className="font-mono text-sm text-stone-400 uppercase tracking-widest mb-8">Total Wager Resolution</span>
           
           <div className="flex flex-col gap-3 w-full mb-8">
              {heatResults.map(heat => <HeatLedgerRow key={heat.heatIndex} heat={heat} />)}
           </div>

           <div className={`p-8 rounded-2xl border-4 flex flex-col items-center w-full mb-10 shadow-2xl ${isProfit ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-500/20' : 'bg-rose-950/30 border-rose-500/50 shadow-rose-500/20'}`}>
              <span className={`font-mono text-sm font-bold uppercase tracking-widest mb-2 ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isProfit ? 'Total Net Profit' : 'Total Net Loss'}
              </span>
              <span className={`font-serif text-[4rem] sm:text-[5rem] font-black leading-none ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? '+' : ''}{formatMoney(winnings)}
              </span>
           </div>

           <button onClick={onAbandon} className="px-12 py-5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-lg font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 border border-stone-600 shadow-xl w-full sm:w-auto">
             Return to Gateway
           </button>
         </div>
      </div>
    );
  }

  return (
    <ActiveRaceView 
      key={`heat-${heatIndex}`} 
      racers={currentRacers} 
      track={track} 
      onAbandon={onAbandon} 
      isCircuit={true}
      circuitState={{ current: heatIndex + 1, total: circuitData.length, winnings, history: heatResults }}
      onNextHeat={handleNextHeat}
    />
  );
}