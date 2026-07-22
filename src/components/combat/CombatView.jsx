// src/components/combat/CombatView.jsx
import { useState, useEffect } from 'react';
import { useCombat } from '../../hooks/useCombat';
import { assetUrl } from '../../utils/assets';
import { zoneImg } from '../../data/mapConfig';
import Hearts from './Hearts';
import LootReveal from './LootReveal';

const LOG_TONE = {
  info: 'text-stone-400',
  player: 'text-emerald-400',
  enemy: 'text-rose-400',
  dodge: 'text-sky-400',
  win: 'text-amber-400 drop-shadow-md',
  lose: 'text-rose-500 drop-shadow-md',
};

function useAnimatedValue(target, active, duration = 950) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) { setV(0); return; }
    let raf, start;
    const tick = (t) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setV(target * p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

function VerticalAtkMeter({ label, atk, maxGlobalAtk, value, mine, win, dim }) {
  const active = value != null;
  const animated = useAnimatedValue(value || 0, active);
  const displayVal = Math.round(animated);

  const heightPct = Math.max(40, (atk / maxGlobalAtk) * 100);
  const fillPct = active ? (animated / atk) * 100 : 0;

  const glowColor = mine ? 'rgba(52,211,153,0.8)' : 'rgba(244,63,94,0.8)';
  const barGradient = mine ? 'from-emerald-600 via-emerald-500 to-emerald-300' : 'from-rose-700 via-rose-500 to-rose-300';

  return (
    <div className={`flex h-full w-14 sm:w-16 md:w-20 shrink-0 flex-col items-center justify-end drop-shadow-2xl transition-all duration-500 ${dim ? 'opacity-40 scale-90 saturate-0' : 'opacity-100'}`}>
      <div className="mb-6 flex h-20 flex-col items-center justify-end text-center">
        <span className={`mb-1 font-mono text-[9px] md:text-[10px] font-black uppercase tracking-widest ${mine ? 'text-emerald-400' : 'text-rose-400'}`}>
          {label}
        </span>
        <span className="font-mono text-2xl md:text-3xl font-black leading-none text-white drop-shadow-md">
          {active ? displayVal : '—'}
        </span>
        <span className="mt-1 font-mono text-lg md:text-xl font-black text-stone-400 drop-shadow-sm">
          {atk}
        </span>
      </div>

      <div 
        className="relative flex w-6 sm:w-8 flex-col justify-end overflow-hidden rounded-full border-2 border-stone-800 bg-stone-950/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-all duration-500" 
        style={{ height: `${heightPct}%` }}
      >
        <div
          className={`w-full bg-gradient-to-t transition-all duration-100 ease-out ${barGradient}`}
          style={{ 
             height: `${fillPct}%`,
             boxShadow: win && active ? `0 0 35px ${glowColor}` : 'none'
          }}
        />
        {win && active && (
          <div className="absolute inset-0 animate-pulse bg-white/20 mix-blend-overlay" />
        )}
      </div>
    </div>
  );
}

export default function CombatView({ enemy, character, level, startingHp, zone, affix, passiveFlags, onConsumePassive, onResolve, onHpChange }) {
  const c = useCombat({ enemy, character, level, startingHp, affix, passiveFlags, onConsumePassive, onHpChange });

  const bg = {
    backgroundImage: `radial-gradient(circle at 50% 35%, rgba(12,10,9,0.3) 0%, rgba(12,10,9,0.95) 100%), url(${assetUrl(zoneImg(zone))})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const maxGlobalAtk = Math.max(c.playerAttack, c.scaledAttack);

  // Derive CSS Filters for Player Status Tints (Subdued)
  let portraitTint = 'drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]';
  if (c.statuses?.toxic) {
    portraitTint = 'drop-shadow-[0_15px_35px_rgba(168,85,247,0.5)] sepia-[0.3] hue-rotate-[250deg] saturate-[1.2] brightness-[0.9]';
  } else if (c.statuses?.poison) {
    portraitTint = 'drop-shadow-[0_15px_35px_rgba(34,197,94,0.5)] sepia-[0.3] hue-rotate-[70deg] saturate-[1.2]';
  } else if (c.statuses?.vulnerable) {
    portraitTint = 'drop-shadow-[0_15px_35px_rgba(56,189,248,0.5)] sepia-[0.3] hue-rotate-[180deg] saturate-[1.2]';
  }

  if (c.outcome) {
    const win = c.outcome.victory;
    const isAmbush = c.outcome.extraEncounter;
    
    let title = win ? 'Victory!' : 'Defeated';
    let icon = win ? '🏆' : '💀';
    let desc = win ? `The ${enemy.name} falls.` : `The ${enemy.name} was too much...`;
    let btnText = 'Continue';
    let borderBg = win ? 'border-amber-500/40 bg-stone-900/90' : 'border-rose-500/40 bg-stone-900/90';
    let titleColor = win ? 'text-amber-400' : 'text-rose-500';
    let btnStyle = win ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(251,191,36,0.6)]' : 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-[0_0_35px_rgba(225,29,72,0.6)]';
    
    if (isAmbush) {
      title = 'Ambush!';
      icon = '⚠️';
      desc = "The poacher's released beasts attack!";
      borderBg = 'border-rose-500/40 bg-stone-900/90';
      titleColor = 'text-rose-500';
      btnStyle = 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-[0_0_35px_rgba(225,29,72,0.6)]';
      btnText = 'Brace Yourself';
    }

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md transition-all duration-700">
        <div className={`mx-auto max-w-lg animate-[lootPop_0.5s_ease-out_both] rounded-3xl border p-10 text-center shadow-2xl backdrop-blur-xl ${borderBg}`}>
          <div className="mb-4 text-7xl drop-shadow-lg">{icon}</div>
          <h3 className={`mb-2 font-serif text-5xl font-black drop-shadow-md ${titleColor}`}>
            {title}
          </h3>
          <p className="mb-8 text-lg text-stone-400">
            {desc}
          </p>
          {win && !isAmbush && c.outcome.loot.length > 0 && (
            <div className="mb-8"><LootReveal loot={c.outcome.loot} /></div>
          )}
          <button
            type="button"
            onClick={() => onResolve(c.outcome)}
            className={`rounded-xl px-12 py-5 text-lg font-black uppercase tracking-widest transition-all ${btnStyle}`}
          >
            {btnText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-stone-950">
      <div className="absolute inset-0 z-0" style={bg} />

      {(c.flash === 'enemyHit' || c.flash === 'playerHit') && (
        <div className={`pointer-events-none absolute inset-0 z-50 animate-[hitFlash_0.35s_ease-out] ${
          c.flash === 'enemyHit' ? 'bg-emerald-400/20' : 'bg-rose-500/25'
        }`} />
      )}

      <div className="absolute left-2 top-1/2 z-30 h-[60vh] -translate-y-1/2 md:left-6">
        <VerticalAtkMeter label="You" atk={c.playerAttack} maxGlobalAtk={maxGlobalAtk} value={c.roll?.player} mine win={c.roll?.playerWins} />
      </div>

      <div className="absolute right-2 top-1/2 z-30 flex h-[60vh] -translate-y-1/2 items-center justify-center gap-1 md:right-6 md:gap-4">
        {c.roll?.enemyRolls ? (
          <>
            <VerticalAtkMeter 
              label="Roll 1" 
              atk={c.scaledAttack} 
              maxGlobalAtk={maxGlobalAtk} 
              value={c.roll.enemyRolls[0]} 
              dim={c.roll.enemyRolls[0] < Math.max(c.roll.enemyRolls[0], c.roll.enemyRolls[1])} 
              win={!c.roll.playerWins && c.roll.enemyRolls[0] >= c.roll.enemyRolls[1]} 
            />
            <VerticalAtkMeter 
              label="Roll 2" 
              atk={c.scaledAttack} 
              maxGlobalAtk={maxGlobalAtk} 
              value={c.roll.enemyRolls[1]} 
              dim={c.roll.enemyRolls[1] < Math.max(c.roll.enemyRolls[0], c.roll.enemyRolls[1])} 
              win={!c.roll.playerWins && c.roll.enemyRolls[1] > c.roll.enemyRolls[0]} 
            />
          </>
        ) : (
          <VerticalAtkMeter 
            label="Foe" 
            atk={c.scaledAttack} 
            maxGlobalAtk={maxGlobalAtk} 
            value={c.roll?.enemy} 
            win={c.roll && !c.roll.playerWins} 
          />
        )}
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center pb-32 pointer-events-none">
        <div className="flex w-full flex-wrap items-center justify-center pointer-events-auto">
           {Array.from({ length: c.count }).map((_, i) => {
             const isSwarm = c.count >= 3;
             const overlap = isSwarm && i > 0 ? '-ml-12 md:-ml-24' : 'mx-3';
             const stagger = isSwarm && i % 2 !== 0 ? 'translate-y-6 md:translate-y-12' : '';
             const scale = c.count > 4 ? 'max-h-[30vh] md:max-h-[35vh]' : 'max-h-[40vh] md:max-h-[50vh]';
             
             return (
               <img
                 key={i}
                 src={assetUrl(enemy.imagePath)}
                 alt={enemy.name}
                 draggable={false}
                 style={{ zIndex: i }}
                 className={`relative w-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)] animate-[lootPop_0.35s_ease-out_both] ${overlap} ${stagger} ${scale} ${c.flash === 'enemyHit' ? 'animate-[battleShake_0.35s]' : ''}`}
               />
             );
           })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-2 z-50 flex h-[55vh] w-[45vw] items-end justify-start md:left-12">
         <img
           src={assetUrl(character.imagePath)}
           alt={character.name}
           draggable={false}
           className={`max-h-full w-auto object-contain object-bottom transition-all duration-500 ${portraitTint} ${
             c.flash === 'shrug' ? 'animate-[shrugOff_0.6s_ease-in-out]' : c.flash === 'playerHit' ? 'animate-[battleShake_0.35s]' : ''
           }`}
         />
      </div>

      <div className="absolute bottom-6 right-4 z-40 flex w-[95%] max-w-4xl flex-row items-center justify-between rounded-[2rem] border border-stone-700/50 bg-stone-950/85 px-8 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl md:bottom-8 md:right-[10%]">
        
        <div className="flex shrink-0 flex-col items-center gap-3">
          {c.roll ? (
             <span className="animate-[lootPop_0.3s_ease-out] font-serif text-3xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] md:text-4xl">⚔</span>
           ) : (
             <span className="font-serif text-2xl font-black text-stone-500 drop-shadow-md md:text-3xl">VS</span>
           )}
          <button
            type="button"
            onClick={c.attack}
            disabled={c.busy}
            className="group relative overflow-hidden rounded-xl border border-rose-500/50 bg-rose-600 px-8 py-3 font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all enabled:hover:-translate-y-1 enabled:hover:bg-rose-500 enabled:hover:shadow-[0_0_45px_rgba(225,29,72,0.8)] disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale md:px-10 md:py-4"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/20 transition-all group-hover:animate-[shine_0.7s_ease-out]" />
            <span className="relative text-sm tracking-[0.2em] md:text-base">Attack</span>
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-4 text-center">
          {c.log.slice(-3).map((l, idx, arr) => {
            const isLatest = idx === arr.length - 1;
            const opacity = isLatest ? 'opacity-100' : idx === arr.length - 2 ? 'opacity-60' : 'opacity-20';
            const scale = isLatest ? 'scale-100' : idx === arr.length - 2 ? 'scale-[0.97]' : 'scale-95';
            
            return (
              <p 
                key={l.id} 
                className={`text-sm md:text-base font-bold leading-relaxed transition-all duration-500 ${opacity} ${scale} ${isLatest ? LOG_TONE[l.kind] : 'text-stone-400'}`}
              >
                {l.text}
              </p>
            );
          })}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-2 border-l border-stone-700/50 pl-6">
          <span className="font-serif text-2xl font-black tracking-widest text-rose-300 drop-shadow-md md:text-3xl">
            {enemy.name}
          </span>
          <div className="mt-1 flex h-10 w-full min-w-[160px] items-center justify-center rounded-xl border border-rose-900/50 bg-stone-950/80 px-4 shadow-inner md:min-w-[180px]">
            <Hearts hp={c.enemyHp} max={c.maxEnemyHp} size="text-lg md:text-xl" />
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine { to { transform: translateX(220%) skewX(-12deg); } }
        @keyframes battleShake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-10px,5px)} 40%{transform:translate(10px,-5px)} 60%{transform:translate(-6px,4px)} 80%{transform:translate(6px,-3px)} }
        @keyframes hitFlash { 0%{opacity:0.9} 100%{opacity:0} }
        @keyframes shrugOff { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-9deg)} 40%{transform:rotate(9deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(4deg)} }
        @keyframes lootPop { 0% { opacity: 0; transform: scale(0.5) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[battleShake_0\\.35s\\], .animate-\\[shrugOff_0\\.6s_ease-in-out\\], .animate-\\[hitFlash_0\\.35s_ease-out\\], .group-hover\\:animate-\\[shine_0\\.7s_ease-out\\] { animation: none !important; }
        }
      `}} />
    </div>
  );
}