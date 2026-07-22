// src/components/map/MapGrid.jsx
import { ZONES, ZONE_INFO, zoneImg, nodeKey } from '../../data/mapConfig';
import { REWARD_INFO } from '../../data/rewards';
import { assetUrl } from '../../utils/assets';

function ZoneNode({ zone, here, seen, affix }) {
  const info = ZONE_INFO[zone];
  let ring = 'border-stone-800';
  let overlay = 'bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent';
  let affixLabel = null;
  let extraClasses = '';
  let imgClasses = 'opacity-70';

  if (seen && !here) {
    ring = 'border-stone-700/50';
    imgClasses = 'opacity-20 grayscale saturate-0';
    overlay = 'bg-stone-950/60';
  }

  // Premium Affix Glows
  if (affix === 'Peaceful') {
    overlay = 'bg-gradient-to-t from-sky-600/50 via-sky-900/40 to-transparent mix-blend-hard-light';
    ring = 'border-sky-500/60 shadow-[inset_0_0_20px_rgba(56,189,248,0.3)]';
    affixLabel = <span className="absolute left-1.5 top-1.5 z-20 rounded border border-sky-400 bg-sky-950/90 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.6)] sm:text-[9px]">Peaceful</span>;
  } else if (affix === 'Dangerous') {
    overlay = 'bg-gradient-to-t from-rose-600/50 via-rose-900/40 to-transparent mix-blend-hard-light';
    ring = 'border-rose-500/60 shadow-[inset_0_0_20px_rgba(244,63,94,0.3)]';
    affixLabel = <span className="absolute left-1.5 top-1.5 z-20 rounded border border-rose-400 bg-rose-950/90 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.6)] sm:text-[9px]">Dangerous</span>;
  } else if (affix === 'Fruitful') {
    overlay = 'bg-gradient-to-t from-emerald-600/50 via-emerald-900/40 to-transparent mix-blend-hard-light';
    ring = 'border-emerald-500/60 shadow-[inset_0_0_20px_rgba(52,211,153,0.3)]';
    affixLabel = <span className="absolute left-1.5 top-1.5 z-20 rounded border border-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)] sm:text-[9px]">Fruitful</span>;
  }

  // Active / Not Active styling override
  if (here) {
    ring = 'border-amber-400 ring-4 ring-amber-500/40 shadow-[0_0_30px_rgba(251,191,36,0.5)]';
    extraClasses = 'scale-110 z-30 animate-[nodePulse_2s_ease-in-out_infinite]';
    imgClasses = 'opacity-100';
    overlay = 'bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent'; 
  } else if (!seen) {
    extraClasses = 'hover:scale-105 hover:border-stone-500 hover:shadow-lg transition-all duration-300';
  }

  return (
    <div className={`relative w-full aspect-[2/1] sm:aspect-[21/9] overflow-hidden rounded-xl border-2 transition-all duration-300 ${ring} ${extraClasses}`}>
      <img
        src={assetUrl(zoneImg(zone))}
        alt={info.type}
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${imgClasses}`}
      />
      <div className={`absolute inset-0 ${overlay}`} />

      <div className="absolute inset-x-1 bottom-1.5 z-10 text-center">
        <span className={`block font-serif text-sm font-black leading-none drop-shadow-md sm:text-base ${here ? 'text-amber-400' : 'text-white'}`}>{info.type}</span>
      </div>

      {(!seen || here) && affixLabel}
      {here && <span className="absolute right-1.5 top-1.5 z-20 rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-stone-950 shadow-[0_0_10px_rgba(251,191,36,0.8)]">You</span>}
      
      {/* Checkmark overlay for cleared stages */}
      {seen && !here && (
         <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/40 backdrop-blur-[1px]">
            <span className="text-3xl text-emerald-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">✓</span>
         </div>
      )}
    </div>
  );
}

export default function MapGrid({ position, visited, movement, mapAffixes, prospectiveReward, onExplore, onAscend, onRetreat }) {
  const canExplore = movement.explore.length > 0;
  const canAscend = movement.ascend.length > 0;

  const ascendLabel =
    position.level === 0 ? '🚩 Start'
      : position.level === 5 ? '👑 Claim Prize'
      : '⬆ Ascend';

  const rInfo = prospectiveReward ? REWARD_INFO[prospectiveReward.type] : null;

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4">
      
      {/* The Crown / Reward Node */}
      <div className={`flex h-14 items-center justify-center gap-3 rounded-xl border-2 font-serif text-lg font-black transition-all duration-500 ${
          position.level === 6 
            ? 'scale-105 border-amber-400 bg-amber-500/20 text-white shadow-[0_0_30px_rgba(251,191,36,0.4)]' 
            : 'border-stone-800 bg-stone-900/60'
        }`}
      >
        {prospectiveReward ? (
          <>
             {prospectiveReward.image ? (
               <img src={assetUrl(prospectiveReward.image)} className={`h-8 w-8 object-contain drop-shadow-md ${position.level !== 6 ? 'opacity-60 saturate-50 grayscale' : ''}`} alt="" />
             ) : (
               <span className={`text-2xl drop-shadow-md ${position.level !== 6 ? 'opacity-60 grayscale' : ''}`}>{rInfo?.emoji || '👑'}</span>
             )}
             <span className={position.level === 6 ? 'text-amber-200' : 'text-stone-500'}>
               {prospectiveReward.name}
             </span>
          </>
        ) : (
          <span className="text-stone-600">👑 The Prize</span>
        )}
      </div>

      {/* Grid Levels */}
      {[5, 4, 3, 2, 1].map((level) => (
        <div key={level} className="flex items-center gap-3 sm:gap-5">
          <span className="w-10 shrink-0 text-right font-mono text-xs font-bold text-stone-500 sm:w-12 sm:text-sm">Lv {level}</span>
          <div className="grid flex-1 grid-cols-3 gap-3 sm:gap-5">
            {ZONES.map((zone) => {
              const key = nodeKey(level, zone);
              return (
                <ZoneNode
                  key={zone}
                  zone={zone}
                  here={position.level === level && position.zone === zone}
                  seen={visited.has(key)}
                  affix={mapAffixes[key]}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Premium Navigation Buttons */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
        <button
          type="button"
          disabled={!canExplore}
          onClick={onExplore}
          className="group relative overflow-hidden rounded-xl border border-emerald-500/50 bg-emerald-500/20 px-4 py-4 font-black uppercase tracking-widest text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all enabled:hover:-translate-y-1 enabled:hover:bg-emerald-500/30 enabled:hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/20 transition-all group-hover:animate-[shine_0.7s_ease-out]" />
          <span className="relative">⇄ Explore</span>
        </button>

        <button
          type="button"
          disabled={!canAscend}
          onClick={onAscend}
          className={`group relative overflow-hidden rounded-xl border px-4 py-4 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale ${
            position.level === 0
              ? 'border-amber-400 bg-amber-500 text-stone-950 hover:-translate-y-1 hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.6)]'
              : 'border-amber-400/60 bg-amber-500/20 text-amber-100 hover:-translate-y-1 hover:bg-amber-500/30 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]'
          }`}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/20 transition-all group-hover:animate-[shine_0.7s_ease-out]" />
          <span className="relative">{ascendLabel}</span>
        </button>

        <button
          type="button"
          onClick={onRetreat}
          className="group relative overflow-hidden rounded-xl border border-stone-600 bg-stone-800/40 px-4 py-4 font-black uppercase tracking-widest text-stone-300 transition-all hover:-translate-y-1 hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-rose-200 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-white/10 transition-all group-hover:animate-[shine_0.7s_ease-out]" />
          <span className="relative">⮐ Retreat</span>
        </button>
      </div>
    </div>
  );
}