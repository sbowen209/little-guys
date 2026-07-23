This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/components/RaceBoard.jsx, src/hooks/useRaceEngine.js, src/views/ActiveRace.jsx, src/views/RacingSetup.jsx, src/data/mounts.js
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
src/
  components/
    RaceBoard.jsx
  data/
    mounts.js
  hooks/
    useRaceEngine.js
  views/
    ActiveRace.jsx
    RacingSetup.jsx
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/components/RaceBoard.jsx">
import { assetUrl } from '../utils/assets';

// -----------------------------------------------------------------------------
// TRACK ENVIRONMENT COMPONENTS
// -----------------------------------------------------------------------------
const TrackLabel = ({ cx, cy, text, colorCode = '#fcd34d' }) => (
  <g transform={`translate(${cx}, ${cy})`} filter="url(#drop-shadow)">
    <rect x="-45" y="-12" width="90" height="24" fill="#1c1917" rx="12" opacity="0.85" stroke="#44403c" strokeWidth="2" />
    <text x="0" y="3" fill={colorCode} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
      {text}
    </text>
  </g>
);

const JumpMarker = ({ cx, cy, difficulty }) => {
  const isHigh = difficulty === 15;
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <rect x="5" y="5" width={isHigh ? 18 : 10} height="80" fill="rgba(0,0,0,0.5)" rx="4" filter="url(#light-blur)" />
      <rect x="-15" y="0" width="30" height="80" fill="#855f41" rx="8" opacity="0.6"/>
      <circle cx="0" cy="5" r="6" fill="#29160a" />
      <circle cx="0" cy="75" r="6" fill="#29160a" />
      {isHigh ? (
        <>
          <rect x="-7" y="5" width="14" height="70" fill="#1c1917" rx="3" />
          <rect x="-5" y="5" width="10" height="70" fill="url(#warning-stripes)" rx="2" />
        </>
      ) : (
        <>
          <rect x="-4" y="5" width="8" height="70" fill="#5c3823" rx="3" />
          <rect x="-2" y="5" width="4" height="70" fill="#8a5c3e" rx="1" />
        </>
      )}
    </g>
  )
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function RaceBoard({ racer1, racer2, r1Coords, r2Coords, activeRacerIndex, flash, isRunning, trackData }) {
  
  const getMountScaleX = (racer, coords) => {
    const baseFlip = racer.facing === 'Left' ? -1 : 1; 
    return coords.isFlipped ? -baseFlip : baseFlip;
  };

  const getSafeSideOffset = (coords) => {
    if (coords.x > 950) return -50;  
    if (coords.x < 150) return 90;   
    return coords.isFlipped ? -50 : 90; 
  };

  const getSafePopupY = (coords) => {
    return coords.y < 120 ? coords.y + 80 : coords.y - 70;
  };

  const renderFloatingUI = (rIndex, coords) => {
    if (!flash || flash.racerIndex !== rIndex) return null;
    
    if (flash.type === 'roll') {
      const isSpeed = flash.stat.toLowerCase().includes('speed');
      const isJump = flash.stat.toLowerCase().includes('jump');
      
      const themeColor = isSpeed ? 'bg-sky-400 shadow-[0_0_12px_#38bdf8]' : 
                         isJump ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 
                                  'bg-rose-500 shadow-[0_0_12px_#f43f5e]';
      
      const textColor = isSpeed ? 'text-sky-300' : isJump ? 'text-emerald-300' : 'text-rose-300';
      const maxVal = flash.maxVal || 30;
      
      const offsetX = getSafeSideOffset(coords) - 20;
      const rollsToRender = flash.rolls || [flash.value];

      return (
        <foreignObject x="0" y="0" width="100" height="130" className="overflow-visible pointer-events-none z-50" style={{ transform: `translate(${coords.x + offsetX}px, ${coords.y - 45}px)` }}>
          <div className="flex flex-col items-center h-full w-full justify-end animate-[lootPop_0.3s_ease-out_both] drop-shadow-xl">
            <span className={`font-mono text-[10px] font-black uppercase mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${textColor}`}>{flash.stat}</span>
            <span className={`font-serif text-3xl font-black mb-1.5 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] ${flash.penaltyApplied ? 'text-rose-500' : 'text-white'}`}>
              {flash.value}
            </span>
            
            <div className="flex gap-1.5 h-20 items-end justify-center">
              {rollsToRender.map((rVal, idx) => {
                const heightPct = Math.min(100, Math.max(0, (rVal / maxVal) * 100));
                const isDiscarded = rollsToRender.length === 2 && 
                                    (rVal < flash.value || (rVal === flash.value && idx === 1 && rollsToRender[0] === rVal));
                
                return (
                  <div key={idx} className={`w-5 h-full bg-stone-900/90 rounded-full border border-stone-600 shadow-inner overflow-hidden flex items-end transition-all ${isDiscarded ? 'opacity-40 saturate-50' : ''}`}>
                    <div className={`w-full rounded-full transition-all duration-[800ms] ease-out ${themeColor}`} style={{ height: `${heightPct}%` }} />
                  </div>
                );
              })}
            </div>

            {flash.penaltyApplied && (
               <span className="bg-rose-600 px-1 py-0.5 rounded text-[8px] font-black uppercase text-white animate-pulse mt-1.5 absolute -bottom-4">Slowed</span>
            )}
          </div>
        </foreignObject>
      );
    }
    
    const popupY = getSafePopupY(coords);
    
    if (flash.type === 'jump_success') {
      return (
        <foreignObject x="0" y="0" width="150" height="80" className="overflow-visible pointer-events-none z-50" style={{ transform: `translate(${coords.x - 25}px, ${popupY}px)` }}>
          <div className="flex flex-col items-center animate-[jumpBounce_0.6s_ease-out_both]">
            <span className="text-3xl font-serif font-black text-emerald-400 drop-shadow-[0_5px_10px_rgba(0,0,0,1)]">CLEARED!</span>
          </div>
        </foreignObject>
      );
    }
    if (flash.type === 'crash') {
      return (
        <foreignObject x="0" y="0" width="200" height="80" className="overflow-visible pointer-events-none z-50" style={{ transform: `translate(${coords.x - 50}px, ${popupY}px)` }}>
          <div className="flex flex-col items-center animate-[battleShake_0.4s_ease-out_both]">
            <span className="text-4xl font-serif font-black text-rose-500 drop-shadow-[0_5px_10px_rgba(0,0,0,1)]">WIPEOUT!</span>
          </div>
        </foreignObject>
      );
    }
    if (flash.type === 'hard_brake') {
      return (
        <foreignObject x="0" y="0" width="150" height="80" className="overflow-visible pointer-events-none z-50" style={{ transform: `translate(${coords.x - 25}px, ${popupY}px)` }}>
          <div className="flex flex-col items-center animate-[lootPop_0.4s_ease-out_both]">
            <span className="text-3xl font-serif font-black text-amber-500 drop-shadow-[0_5px_10px_rgba(0,0,0,1)]">SKID!</span>
          </div>
        </foreignObject>
      );
    }
    return null;
  };

  const getLocalPos = (pos) => pos % trackData.length || (pos > 0 ? trackData.length : 0);

  return (
    <div className="w-full h-auto relative">
      <svg viewBox="0 0 1200 500" className="w-full h-auto drop-shadow-[0_35px_55px_rgba(0,0,0,0.95)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-[4px] sm:border-[8px] border-stone-800 bg-[#728f3a]">
        <defs>
          <style>
            {`
              .fire-pulse { animation: firePulse 3s ease-in-out infinite; }
              .fire-spin { animation: fireSpin 10s linear infinite; stroke-dasharray: 60 40; transform-origin: 0 0; }
              .fire-spin-rev { animation: fireSpinRev 7s linear infinite; stroke-dasharray: 30 20 10 20; transform-origin: 0 0; }
              .lightning-spin { animation: fireSpinRev 12s steps(8) infinite; transform-origin: 0 0; }
              .lightning-flash { animation: lightningFlash 1.5s infinite; }
              
              @keyframes firePulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.03); } }
              @keyframes fireSpin { 100% { transform: rotate(360deg); } }
              @keyframes fireSpinRev { 100% { transform: rotate(-360deg); } }
              @keyframes lightningFlash { 
                0%, 88%, 100% { opacity: 0; } 
                90%, 96% { opacity: 1; filter: drop-shadow(0 0 4px #c084fc); } 
                94%, 98% { opacity: 0.4; } 
              }
            `}
          </style>

          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="8" stdDeviation="5" floodColor="#000" floodOpacity="0.55"/>
          </filter>
          
          <filter id="inset-shadow">
            <feOffset dx="0" dy="0"/>
            <feGaussianBlur stdDeviation="15" result="offset-blur"/>
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
            <feFlood floodColor="black" floodOpacity="0.7" result="color"/>
            <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
            <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
          </filter>

          <filter id="heavy-blur"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="med-blur"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="light-blur"><feGaussianBlur stdDeviation="2" /></filter>

          <pattern id="checkers" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#ffffff" />
            <rect x="10" width="10" height="10" fill="#1c1917" />
            <rect y="10" width="10" height="10" fill="#1c1917" />
            <rect x="10" y="10" width="10" height="10" fill="#ffffff" />
          </pattern>
          
          <pattern id="warning-stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="20" height="20" fill="#fbbf24" />
            <rect width="10" height="20" fill="#1c1917" />
          </pattern>

          <pattern id="day-grass" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="#ced873" />
            <path d="M10,20 l5,-10 M20,40 l6,-12 M30,60 l4,-8 M40,80 l5,-10 M50,10 l6,-12 M60,30 l4,-8 M70,50 l5,-10 M80,70 l6,-12" stroke="#b9c656" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
            <path d="M5,15 l-4,-8 M15,35 l-5,-10 M25,55 l-4,-8 M35,75 l-5,-10 M45,5 l-4,-8 M55,25 l-5,-10 M65,45 l-4,-8 M75,65 l-5,-10" stroke="#a7b340" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
            <path d="M15,25 l3,-6 M25,45 l4,-8 M35,65 l3,-6 M45,15 l4,-8 M55,35 l3,-6 M65,55 l4,-8 M75,75 l3,-6" stroke="#e1ea8d" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9"/>
          </pattern>
          
          <pattern id="dirt-track" x="0" y="0" width="100" height="40" patternUnits="userSpaceOnUse">
            <rect width="100" height="40" fill="#d29864" />
            <path d="M 0 10 Q 25 15, 50 10 T 100 10 M 0 30 Q 25 35, 50 30 T 100 30" stroke="#c08252" strokeWidth="2" fill="none" />
            <path d="M 0 20 Q 25 25, 50 20 T 100 20" stroke="#b47444" strokeWidth="1.5" fill="none" opacity="0.6" />
          </pattern>

          <pattern id="stone-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#9ca3af" />
            <path d="M 20 0 L 20 20 L 0 20" fill="none" stroke="#4b5563" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1200" height="500" fill="url(#day-grass)" filter="url(#inset-shadow)" />

        {/* Track Base */}
        <path d="M 250 100 L 950 100 A 150 150 0 0 1 950 400 L 250 400 A 150 150 0 0 1 250 100 Z" fill="none" stroke="#4a3121" strokeWidth="94" strokeLinecap="square" opacity="0.8" filter="url(#drop-shadow)"/>
        <path d="M 250 100 L 950 100 A 150 150 0 0 1 950 400 L 250 400 A 150 150 0 0 1 250 100 Z" fill="none" stroke="#78553a" strokeWidth="86" strokeLinecap="square"/>
        <path d="M 250 100 L 950 100 A 150 150 0 0 1 950 400 L 250 400 A 150 150 0 0 1 250 100 Z" fill="none" stroke="url(#dirt-track)" strokeWidth="82" strokeLinecap="square" />
        
        {/* Outer Rail Base */}
        <path d="M 250 57 L 950 57 A 193 193 0 0 1 1143 250 A 193 193 0 0 1 950 443 L 250 443 A 193 193 0 0 1 57 250 A 193 193 0 0 1 250 57 Z" fill="none" stroke="#332115" strokeWidth="8" opacity="0.9"/>
        <path d="M 250 57 L 950 57 A 193 193 0 0 1 1143 250 A 193 193 0 0 1 950 443 L 250 443 A 193 193 0 0 1 57 250 A 193 193 0 0 1 250 57 Z" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="30 30" opacity="0.85"/>
        <path d="M 250 57 L 950 57 A 193 193 0 0 1 1143 250 A 193 193 0 0 1 950 443 L 250 443 A 193 193 0 0 1 57 250 A 193 193 0 0 1 250 57 Z" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="0 30 30 0" opacity="0.85"/>
        
        {/* Inner Rail Base */}
        <path d="M 250 143 L 950 143 A 107 107 0 0 1 1057 250 A 107 107 0 0 1 950 357 L 250 357 A 107 107 0 0 1 143 250 A 107 107 0 0 1 250 143 Z" fill="none" stroke="#332115" strokeWidth="8" opacity="0.9"/>
        <path d="M 250 143 L 950 143 A 107 107 0 0 1 1057 250 A 107 107 0 0 1 950 357 L 250 357 A 107 107 0 0 1 143 250 A 107 107 0 0 1 250 143 Z" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="25 25" opacity="0.85"/>
        <path d="M 250 143 L 950 143 A 107 107 0 0 1 1057 250 A 107 107 0 0 1 950 357 L 250 357 A 107 107 0 0 1 143 250 A 107 107 0 0 1 250 143 Z" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="0 25 25 0" opacity="0.85"/>

        <g filter="url(#drop-shadow)">
           <rect x="230" y="60" width="40" height="80" fill="url(#checkers)" />
           <rect x="230" y="60" width="40" height="80" fill="none" stroke="#1c1917" strokeWidth="3" />
        </g>

        {/* Jump Markers */}
        <JumpMarker cx={600} cy={60} difficulty={10} />  
        <JumpMarker cx={810} cy={360} difficulty={10} /> 
        <JumpMarker cx={600} cy={360} difficulty={15} /> 
        <JumpMarker cx={390} cy={360} difficulty={10} /> 

        {/* Embedded UI Segment Labels */}
        <TrackLabel cx={600} cy={35} text="10 JUMP" colorCode="#fcd34d" />
        <TrackLabel cx={810} cy={465} text="10 JUMP" colorCode="#fcd34d" />
        <TrackLabel cx={600} cy={465} text="15 JUMP" colorCode="#f87171" />
        <TrackLabel cx={390} cy={465} text="10 JUMP" colorCode="#fcd34d" />

        {/* --- CENTERPIECE STATUE & EFFECTS --- */}
        <g className="statue-centerpiece">
          <g transform="translate(600, 280) scale(1, 0.4)">
            <circle cx="0" cy="0" r="100" fill="#f97316" filter="url(#heavy-blur)" opacity="0.7" className="fire-pulse" />
            <circle cx="0" cy="0" r="85" fill="none" stroke="#ef4444" strokeWidth="10" filter="url(#med-blur)" className="fire-spin" />
            <circle cx="0" cy="0" r="70" fill="none" stroke="#eab308" strokeWidth="5" filter="url(#light-blur)" className="fire-spin-rev" />
            <circle cx="0" cy="0" r="65" fill="url(#stone-grid)" stroke="#4b5563" strokeWidth="4" />
            <circle cx="0" cy="0" r="65" fill="none" stroke="#1f2937" strokeWidth="8" opacity="0.6" />

            <g className="lightning-spin" style={{ mixBlendMode: 'screen' }}>
              <path d="M 0 0 L 15 -25 L 25 -20 L 40 -50 L 55 -45" fill="none" stroke="#a855f7" strokeWidth="5" className="lightning-flash" />
              <path d="M 0 0 L 15 -25 L 25 -20 L 40 -50 L 55 -45" fill="none" stroke="#ffffff" strokeWidth="2" className="lightning-flash" />
              <path d="M 0 0 L -20 15 L -40 40 L -65 35" fill="none" stroke="#c084fc" strokeWidth="5" className="lightning-flash" style={{animationDelay: '0.3s'}} />
              <path d="M 0 0 L 25 15 L 20 40 L 50 60 L 65 45" fill="none" stroke="#d8b4fe" strokeWidth="3" className="lightning-flash" style={{animationDelay: '0.6s'}} />
              <path d="M 0 0 L -20 -25 L -50 -40 L -65 -70" fill="none" stroke="#a855f7" strokeWidth="5" className="lightning-flash" style={{animationDelay: '0.9s'}} />
            </g>
          </g>

          <image 
            href={assetUrl('/images/characters/Reinhart_Statue.webp')} 
            x="530" 
            y="125" 
            width="140" 
            height="170" 
            preserveAspectRatio="xMidYMid meet" 
            filter="url(#drop-shadow)"
          />
        </g>

        {/* Floating Localized UI Overlays */}
        {renderFloatingUI(0, r1Coords)}
        {renderFloatingUI(1, r2Coords)}

        {/* Racer Tokens */}
        <foreignObject 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          overflow="visible" 
          style={{ transform: `translate(${r1Coords.x}px, ${r1Coords.y}px)`, transition: `transform ${racer1.transitionDuration || 0}ms linear`, zIndex: activeRacerIndex === 0 ? 10 : 5 }}
        >
          <div className={`relative h-full w-full origin-bottom transition-all duration-300 ${activeRacerIndex === 0 ? 'scale-[1.15]' : 'scale-[0.9] opacity-80 saturate-50'}`}>
            
            {racer1.striderStacks > 0 && (
               <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 flex h-8 w-16 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[pulse_0.8s_ease-in-out_infinite]">
                     <span className="absolute top-0 right-0 text-xl drop-shadow-[0_0_12px_#38bdf8] font-black text-sky-400">💨{racer1.striderStacks}</span>
                  </div>
               </div>
            )}
            
            {racer1.isResilient && (
               <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 flex h-8 w-16 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[pulse_0.8s_ease-in-out_infinite]">
                     <span className="absolute top-0 right-0 text-2xl drop-shadow-[0_0_12px_#ea580c]">🛡️</span>
                     <span className="absolute bottom-0 left-0 text-2xl drop-shadow-[0_0_12px_#ea580c]">🛡️</span>
                  </div>
               </div>
            )}
            
            {racer1.hasAdvantage && (
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex h-8 w-16 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[pulse_0.8s_ease-in-out_infinite]">
                     <span className="absolute top-0 right-0 text-2xl drop-shadow-[0_0_12px_#fde047]">⚡</span>
                     <span className="absolute bottom-0 left-0 text-2xl drop-shadow-[0_0_12px_#fde047]">⚡</span>
                  </div>
               </div>
            )}
            
            {racer1.isPenalized && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex h-6 w-12 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[spin_2s_linear_infinite]">
                     <span className="absolute top-0 right-0 text-xl drop-shadow-md">⭐</span>
                     <span className="absolute bottom-0 left-0 text-xl drop-shadow-md">⭐</span>
                  </div>
               </div>
            )}
            
            <img 
               src={assetUrl(racer1.imagePath)} 
               alt={racer1.name} 
               className="absolute bottom-0 left-0 z-10 h-full w-full object-contain object-bottom drop-shadow-[0_15px_20px_rgba(0,0,0,1)]" 
               style={{ transform: `scaleX(${getMountScaleX(racer1, r1Coords)})` }} 
               draggable={false} 
            />
          </div>
        </foreignObject>
        
        <foreignObject 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          overflow="visible" 
          style={{ transform: `translate(${r2Coords.x}px, ${r2Coords.y}px)`, transition: `transform ${racer2.transitionDuration || 0}ms linear`, zIndex: activeRacerIndex === 1 ? 10 : 5 }}
        >
          <div className={`relative h-full w-full origin-bottom transition-all duration-300 ${activeRacerIndex === 1 ? 'scale-[1.15]' : 'scale-[0.9] opacity-80 saturate-50'}`}>
            
            {racer2.striderStacks > 0 && (
               <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 flex h-8 w-16 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[pulse_0.8s_ease-in-out_infinite]">
                     <span className="absolute top-0 right-0 text-xl drop-shadow-[0_0_12px_#38bdf8] font-black text-sky-400">💨{racer2.striderStacks}</span>
                  </div>
               </div>
            )}
            
            {racer2.isResilient && (
               <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 flex h-8 w-16 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[pulse_0.8s_ease-in-out_infinite]">
                     <span className="absolute top-0 right-0 text-2xl drop-shadow-[0_0_12px_#ea580c]">🛡️</span>
                     <span className="absolute bottom-0 left-0 text-2xl drop-shadow-[0_0_12px_#ea580c]">🛡️</span>
                  </div>
               </div>
            )}
            
            {racer2.hasAdvantage && (
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex h-8 w-16 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[pulse_0.8s_ease-in-out_infinite]">
                     <span className="absolute top-0 right-0 text-2xl drop-shadow-[0_0_12px_#fde047]">⚡</span>
                     <span className="absolute bottom-0 left-0 text-2xl drop-shadow-[0_0_12px_#fde047]">⚡</span>
                  </div>
               </div>
            )}
            
            {racer2.isPenalized && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex h-6 w-12 items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full animate-[spin_2s_linear_infinite]">
                     <span className="absolute top-0 right-0 text-xl drop-shadow-md">⭐</span>
                     <span className="absolute bottom-0 left-0 text-xl drop-shadow-md">⭐</span>
                  </div>
               </div>
            )}
            
            <img 
               src={assetUrl(racer2.imagePath)} 
               alt={racer2.name} 
               className="absolute bottom-0 left-0 z-10 h-full w-full object-contain object-bottom drop-shadow-[0_15px_20px_rgba(0,0,0,1)]" 
               style={{ transform: `scaleX(${getMountScaleX(racer2, r2Coords)})` }} 
               draggable={false} 
            />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
</file>

<file path="src/data/mounts.js">
// -----------------------------------------------------------------------------
// EXACT MOUNT SPECIES DATABASE
// -----------------------------------------------------------------------------
export const MOUNTS = {
  tauros: { 
    id: 'tauros', 
    skins: [
      { id: 'default', name: 'Tauros', buttonLabel: 'Default', imagePath: '/images/mounts/Tauros.webp', facing: 'Left' },
      { id: 'college', name: 'Tauros', buttonLabel: 'College', imagePath: '/images/mounts/Tauros_College.webp', facing: 'Left' },
      { id: 'yoked', name: 'Tauros', buttonLabel: 'Yoked', imagePath: '/images/mounts/Tauros_Yoked.webp', facing: 'Right' }
    ],
    baseStats: { speed: 20, jump: 15, turning: 15 } 
  },
  goraffe: { 
    id: 'goraffe', 
    skins: [
      { id: 'default', name: 'Throat Goat', buttonLabel: 'Default', imagePath: '/images/mounts/Goraffe.webp', facing: 'Left' }
    ],
    baseStats: { speed: 24, jump: 16, turning: 8 } 
  },
  warhog: { 
    id: 'warhog', 
    skins: [
      { id: 'default', name: 'Warhog', buttonLabel: 'Default', imagePath: '/images/mounts/Warhog.webp', facing: 'Left' }
    ],
    baseStats: { speed: 18, jump: 10, turning: 20 } 
  },
  tunnel_viper: { 
    id: 'tunnel_viper', 
    skins: [
      { id: 'default', name: 'Tunnel Viper', buttonLabel: 'Default', imagePath: '/images/mounts/TunnelViper.webp', facing: 'Right' }
    ],
    baseStats: { speed: 20, jump: 6, turning: 23 } 
  },
  perseus: { 
    id: 'perseus', 
    skins: [
      { id: 'default', name: 'Perseus', buttonLabel: 'Default', imagePath: '/images/mounts/Perseus.webp', facing: 'Left' }
    ],
    baseStats: { speed: 17, jump: 18, turning: 17 } 
  },
  buoffolaunt: { 
    id: 'buoffolaunt', 
    skins: [
      { id: 'default', name: 'Buoffolaunt', buttonLabel: 'Default', imagePath: '/images/mounts/Buoffolaunt.webp', facing: 'Right' },
      { id: 'plum', name: 'Plum', buttonLabel: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', facing: 'Right' }
    ],
    baseStats: { speed: 21, jump: 12, turning: 15 } 
  },
  mudsdale: { 
    id: 'mudsdale', 
    skins: [
      { id: 'default', name: 'Mudsdale', buttonLabel: 'Default', imagePath: '/images/mounts/Mudsdale.webp', facing: 'Right' },
      { id: 'fudgedale', name: 'Fudgedale', buttonLabel: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', facing: 'Right' }
    ],
    baseStats: { speed: 17, jump: 10, turning: 23 } 
  },
  bolt_bison: { 
    // Player's Beefcake is preserved, but removed from AI generation pool
    id: 'bolt_bison', 
    skins: [
      { id: 'default', name: 'Bolt Bison', buttonLabel: 'Default', imagePath: '/images/mounts/BoltBison.webp', facing: 'Left' },
      { id: 'beefcake', name: 'Beefcake', buttonLabel: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', facing: 'Right' }
    ],
    baseStats: { speed: 26, jump: 13, turning: 12 } 
  },
  harehorse: { 
    id: 'harehorse', 
    skins: [
      { id: 'default', name: 'Harehorse', buttonLabel: 'Default', imagePath: '/images/mounts/HareHorse.webp', facing: 'Right' }
    ],
    baseStats: { speed: 15, jump: 20, turning: 17 } 
  }
};

// Player's Wager Circuit Roster
export const PLAYER_PRESETS = [
  { id: 'plum', mountId: 'buoffolaunt', skinId: 'plum', label: 'Plum (Lvl 5)', speed: 24, jump: 12, turning: 15, level: 5, wins: 4, losses: 2, passives: ['headstrong'] },
  { id: 'fudgedale', mountId: 'mudsdale', skinId: 'fudgedale', label: 'Fudgedale (Lvl 4)', speed: 19, jump: 8, turning: 26, level: 4, wins: 2, losses: 1, passives: [] },
  { id: 'beefcake', mountId: 'bolt_bison', skinId: 'beefcake', label: 'Beefcake (Lvl 1)', speed: 25, jump: 16, turning: 13, level: 1, wins: 0, losses: 1, passives: ['super_charged'] }
];

export const AVAILABLE_PASSIVES = [
  { id: 'headstrong', label: 'Headstrong', desc: 'First failed jump does not result in a crash/daze.' },
  { id: 'super_charged', label: 'Super Charged', desc: 'Rolling a 1 grants advantage on the next roll.' },
  { id: 'corner_demon', label: 'Corner Demon', desc: 'Advantage on first turn.' },
  { id: 'jumper', label: 'Jumper', desc: 'Advantage on first jump.' },
  { id: 'resilient', label: 'Resilient', desc: 'Gain +1 to all dice rolls when behind by 3 or more spaces at the start of the turn.' },
  { id: 'strider', label: 'Strider', desc: '+1 to speed rolls, stacking each consecutive speed roll. Resets on failed jump or hitting a turn.' },
  { id: 'strong_finisher', label: 'Strong Finisher', desc: '+2 to all turn rolls on the final turn of the track.' },
  { id: 'tunneling', label: 'Tunneling', desc: 'Automatically passes the first jump of the race.' },
  { id: 'winged', label: 'Winged', desc: 'Gain an extra 1d2 distance upon successfully clearing a jump.' },
  { id: 'soar', label: 'Soar', desc: 'Advantage on speed rolls while in first place.' }
];

// -----------------------------------------------------------------------------
// PROCEDURAL ENEMY GENERATION MATH
// -----------------------------------------------------------------------------
export const rollDie = (max) => Math.floor(Math.random() * max) + 1;

export const rollNatureModifier = () => {
  const d20 = rollDie(20);
  if (d20 === 20) return rollDie(6);
  if (d20 >= 18) return rollDie(4);
  if (d20 >= 15) return rollDie(2);
  if (d20 >= 11) return 1;
  if (d20 >= 7) return -1;
  if (d20 >= 4) return -rollDie(2);
  if (d20 >= 2) return -rollDie(4);
  return -rollDie(6);
};

export const generateOpponent = (index, isAce = false) => {
  let level;
  if (isAce) {
    level = Math.random() < 0.10 ? 6 : 5;
  } else {
    const lr = Math.random();
    if (lr < 0.20) level = 2;
    else if (lr < 0.50) level = 3;
    else if (lr < 0.80) level = 4;
    else level = 5;
  }

  // Tiered Rarity Pool Generation
  const rarityRoll = Math.random();
  let speciesPool = [];
  
  if (rarityRoll < 0.60) {
     speciesPool = ['tauros', 'harehorse']; // 60% Common
  } else if (rarityRoll < 0.90) {
     speciesPool = ['goraffe', 'mudsdale', 'warhog']; // 30% Uncommon
  } else {
     speciesPool = ['buoffolaunt', 'tunnel_viper', 'perseus']; // 10% Rare
  }
  
  const speciesId = speciesPool[Math.floor(Math.random() * speciesPool.length)];
  const base = MOUNTS[speciesId];
  
  let skinId = 'default';
  if (speciesId === 'tauros') {
    if (level <= 2) skinId = 'college';
    else if (level <= 4) skinId = 'default';
    else if (level >= 5) skinId = 'yoked';
  }
  const skin = base.skins.find(s => s.id === skinId) || base.skins[0];

  let spdMod, jmpMod, trnMod, natureSum;
  do {
    spdMod = rollNatureModifier();
    jmpMod = rollNatureModifier();
    trnMod = rollNatureModifier();
    natureSum = spdMod + jmpMod + trnMod;
  } while (isAce && natureSum < 0);

  let stats = {
    speed: Math.max(1, base.baseStats.speed + spdMod),
    jump: Math.max(1, base.baseStats.jump + jmpMod),
    turning: Math.max(1, base.baseStats.turning + trnMod)
  };

  for (let i = 2; i <= level; i++) {
    const r = rollDie(3);
    if (r === 1) stats.speed++;
    else if (r === 2) stats.jump++;
    else stats.turning++;
  }

  let passives = [];
  
  // Base Passives mapped to Level 1
  if (speciesId === 'perseus') passives.push('winged'); 
  
  // Level 5 Ace Passives
  if (level >= 5) {
    if (speciesId === 'harehorse') passives.push('jumper');
    if (speciesId === 'mudsdale') passives.push('corner_demon');
    if (speciesId === 'buoffolaunt') passives.push('headstrong');
    if (speciesId === 'tauros') passives.push('resilient'); 
    if (speciesId === 'goraffe') passives.push('strider'); 
    if (speciesId === 'warhog') passives.push('strong_finisher'); 
    if (speciesId === 'tunnel_viper') passives.push('tunneling'); 
    if (speciesId === 'perseus') passives.push('jumper'); 
  }

  let winRateBase = 0.5;
  if (natureSum >= 3) winRateBase = 0.65 + (Math.random() * 0.1);
  else if (natureSum <= -3) winRateBase = 0.25 + (Math.random() * 0.1);
  else winRateBase = 0.45 + (Math.random() * 0.15);

  const baseRaces = level * 10;
  const variance = baseRaces * 0.2;
  const totalRaces = Math.max(1, Math.floor(baseRaces + (Math.random() * variance * 2) - variance));
  const wins = Math.round(totalRaces * winRateBase);
  const losses = Math.max(0, totalRaces - wins);

  return {
    id: `opp_${index}_${Math.random().toString(36).substr(2, 5)}`,
    name: `${skin.name} (AI)`,
    speciesId,
    imagePath: skin.imagePath,
    facing: skin.facing,
    level,
    stats,
    wins,
    losses,
    passives,
    isAce
  };
};
</file>

<file path="src/hooks/useRaceEngine.js">
import { useState, useCallback } from 'react';

const TRACK_DATA = {
  length: 150,
  jumps: {
    25: 10,
    85: 10,
    100: 15,
    115: 10,
  },
  turns: [
    { start: 50, end: 75 },
    { start: 125, end: 150 },
  ],
};

const ANNOUNCER_LINES = {
  start: [
    "The mounts are at the starting line and they are eager to run!",
    "They're at the post... and they're off! We are underway!",
    "The flag drops! Let's see who handles the dirt best today!",
  ],
  initiative_win: [
    "A blinding reaction time from {name}! They take the early lead!",
    "{name} wins the hole-shot! Fantastic break off the line!",
    "Incredible jump! {name} asserts dominance immediately!",
  ],
  initiative_loss: [
    "{name} was caught sleeping at the gate! They trail early.",
    "A sluggish start for {name}. They have ground to make up.",
  ],
  hard_brake: [
    "SKID OUT! {name} carried way too much speed into the turn and had to slam the brakes!",
    "A massive miscalculation! {name} locks up and wastes critical momentum!",
  ],
  speed_high: [
    "{name} is absolutely flying down this straight!",
    "Look at that top speed! {name} and their mount are perfectly synced!",
  ],
  speed_low: [
    "{name} is struggling to find their rhythm here.",
    "The mount seems a bit sluggish on this stretch. Not ideal.",
  ],
  turn_high: [
    "{name} hits the apex perfectly! What a corner!",
    "Masterful handling through the turn by {name}!",
  ],
  turn_low: [
    "{name} takes it way too wide! They are bleeding time!",
    "Slipping on the dirt! {name} loses all their momentum in the corner.",
  ],
  jump_success: [
    "Incredible air! {name} clears the obstacle flawlessly!",
    "Perfect takeoff, perfect landing for {name}!",
  ],
  jump_crash: [
    "BRUTAL CRASH! {name} clips the hazard and goes down hard!",
    "Disaster! {name} misjudged the leap and wipes out!",
  ],
  recovery: [
    "{name} is back in the saddle, but their speed is crippled right now!",
    "Shaking off the dust, {name} manages a painfully slow recovery.",
  ],
  finish: [
    "AND CROSSING THE FINISH LINE... IT'S {name}! WHAT A HEAT!",
    "INCREDIBLE! {name} takes the victory!",
  ]
};

const getBark = (category, name) => {
  const lines = ANNOUNCER_LINES[category] || ANNOUNCER_LINES['start'];
  return lines[Math.floor(Math.random() * lines.length)].replace(/\{name\}/g, name);
};

const rollDice = (max) => Math.floor(Math.random() * max) + 1;

export function useRaceEngine(initialRacers) {
  const [gameSpeed, setGameSpeed] = useState(1);
  const [activeRacerIndex, setActiveRacerIndex] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const laps = initialRacers[0]?.laps || 1;
  const MAX_DISTANCE = TRACK_DATA.length * laps;

  const [racers, setRacers] = useState(
    initialRacers.map((r, i) => ({
      ...r,
      engineId: `racer_${i}`,
      position: 0,
      turnCount: 0,
      headstrongUsed: false,
      cornerDemonUsed: false,
      jumperUsed: false,
      tunnelingUsed: false,
      strongFinisherLogged: false,
      hasAdvantage: false,
      isPenalized: false,
      isResilient: false,
      striderStacks: 0,
      transitionDuration: 0,
      passives: r.passives || []
    }))
  );

  const addLog = useCallback((msg) => setLogs((prev) => [...prev, msg]), []);
  const sleep = useCallback((ms) => new Promise(resolve => setTimeout(resolve, ms / gameSpeed)), [gameSpeed]);

  const evaluateRoll = (stat, hasAdvantage, flatBonus = 0) => {
    const r1 = rollDice(stat) + flatBonus;
    if (hasAdvantage) {
       const r2 = rollDice(stat) + flatBonus;
       return { value: Math.max(r1, r2), rolls: [r1, r2] };
    }
    return { value: r1, rolls: [r1] };
  };

  const executeInitiative = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    const r1Jump = racers[0].racingStats.jump;
    const r2Jump = racers[1].racingStats.jump;

    addLog(getBark('start', ''));
    await sleep(1500);

    if (r1Jump !== r2Jump) {
      const winnerIdx = r1Jump > r2Jump ? 0 : 1;
      const loserIdx = winnerIdx === 0 ? 1 : 0;
      
      addLog(`${racers[winnerIdx].name} uses their superior Jump advantage to take the lead!`);
      await sleep(1500);
      
      setActiveRacerIndex(winnerIdx);
      setBusy(false);
      return;
    }

    let r1Roll = 0;
    let r2Roll = 0;

    addLog("It's a dead heat at the line! Proceeding to a Jump Roll-Off!");
    
    setFlash({
      type: 'initiative',
      rolls: [0, 0],
      maxRolls: [r1Jump, r2Jump],
      winnerIndex: null,
      isTie: true
    });
    await sleep(2000);

    do {
      r1Roll = rollDice(r1Jump);
      r2Roll = rollDice(r2Jump);

      setFlash({ 
        type: 'initiative', 
        rolls: [r1Roll, r2Roll], 
        maxRolls: [r1Jump, r2Jump], 
        winnerIndex: r1Roll > r2Roll ? 0 : r2Roll > r1Roll ? 1 : null,
        isTie: r1Roll === r2Roll
      });
      await sleep(2000);
      
      if (r1Roll === r2Roll) {
        addLog("Still tied! Rolling again!");
        await sleep(1500);
      }
    } while (r1Roll === r2Roll);
    
    const winnerIdx = r1Roll > r2Roll ? 0 : 1;
    const loserIdx = winnerIdx === 0 ? 1 : 0;
    
    addLog(getBark('initiative_win', racers[winnerIdx].name));
    await sleep(1800);
    addLog(getBark('initiative_loss', racers[loserIdx].name));
    await sleep(1500);

    setFlash(null);
    setActiveRacerIndex(winnerIdx);
    setBusy(false);
  }, [racers, busy, addLog, sleep]);

  const takeTurn = useCallback(async () => {
    if (isFinished || busy) return;
    setBusy(true);

    const currentRacers = racers.map(r => ({ ...r, racingStats: { ...r.racingStats } }));
    const rIndex = activeRacerIndex;
    const racer = currentRacers[rIndex];
    const otherRacer = currentRacers[rIndex === 0 ? 1 : 0];
    const stats = racer.racingStats;
    let pos = racer.position;

    let localPosStart = pos % TRACK_DATA.length;
    if (localPosStart === 0 && pos > 0) localPosStart = TRACK_DATA.length;

    const isInTurn = TRACK_DATA.turns.some((t) => localPosStart >= t.start && localPosStart < t.end);
    const isSpeedRoll = !isInTurn;
    const activeStat = isInTurn ? stats.turning : stats.speed;
    const statName = isInTurn ? 'Turn' : 'Speed';

    // Strider: Hitting a turn resets stacks
    if (isInTurn) {
        racer.striderStacks = 0;
    }

    // Strong Finisher: +2 to Turn rolls in the final turn (125-150)
    let finalTurnBonus = 0;
    const isFinalTurn = isInTurn && localPosStart >= 125 && localPosStart < 150;
    if (isFinalTurn && racer.passives.includes('strong_finisher')) {
        finalTurnBonus = 2;
        if (!racer.strongFinisherLogged) {
            racer.strongFinisherLogged = true;
            addLog(`STRONG FINISHER! ${racer.name} enters the final stretch with a burst of power!`);
        }
    }

    // Resilient
    let isResilient = false;
    if (racer.passives.includes('resilient') && racer.position <= otherRacer.position - 3) {
       isResilient = true;
       if (!racer.isResilient) {
           addLog(`RESILIENT! ${racer.name} is trailing and gains a surge of fighting spirit!`);
       }
    } else if (racer.isResilient) {
       addLog(`${racer.name} has closed the gap. Their resilient surge fades!`);
    }
    racer.isResilient = isResilient;

    let advantageThisRoll = racer.hasAdvantage;
    
    // Corner Demon
    if (racer.passives.includes('corner_demon') && isInTurn && !racer.cornerDemonUsed) {
      advantageThisRoll = true;
      racer.cornerDemonUsed = true;
      addLog(`${racer.name}'s Corner Demon activates! Advantage going into the turn!`);
    }

    // Soar
    if (isSpeedRoll && racer.passives.includes('soar') && racer.position >= otherRacer.position) {
      advantageThisRoll = true;
      addLog(`SOAR! ${racer.name} rides the winds of first place!`);
    }

    if (advantageThisRoll && racer.hasAdvantage) {
      racer.hasAdvantage = false;
    }

    let striderBonus = 0;
    if (isSpeedRoll && racer.passives.includes('strider')) {
        striderBonus = racer.striderStacks || 0;
    }
    const flatBonus = (isResilient ? 1 : 0) + striderBonus + finalTurnBonus;

    let { value: movement, rolls: movementRolls } = evaluateRoll(activeStat, advantageThisRoll, flatBonus);

    if (isSpeedRoll && racer.passives.includes('strider')) {
        racer.striderStacks += 1;
    }

    let penaltyApplied = false;
    let barkCat = '';
    
    if (racer.isPenalized) {
      movement = Math.max(1, Math.floor(movement / 2));
      racer.isPenalized = false;
      penaltyApplied = true;
      barkCat = 'recovery';
    } else {
      const isHigh = movement >= (activeStat * 0.5);
      barkCat = isInTurn ? (isHigh ? 'turn_high' : 'turn_low') : (isHigh ? 'speed_high' : 'speed_low');
    }

    if (movement === 1 && racer.passives.includes('super_charged')) {
       racer.hasAdvantage = true;
       addLog(`SUPER CHARGED! ${racer.name} ${penaltyApplied ? 'struggled recovering from a wipeout' : 'rolled a 1'} and becomes supercharged!`);
    }
    
    addLog(getBark(barkCat, racer.name));
    
    setFlash({ 
      racerIndex: rIndex, 
      type: 'roll', 
      value: movement, 
      rolls: movementRolls, 
      stat: statName, 
      penaltyApplied, 
      maxVal: activeStat + flatBonus
    });
    
    await sleep(1200);
    setFlash(null);

    let movementRemaining = movement;
    let stoppedEarlyReason = null; 

    const baseStepDuration = 60 / gameSpeed;
    const speedMultiplier = movement < 5 ? (5 - movement) * 0.5 + 1 : 1; 
    const stepDuration = baseStepDuration * speedMultiplier;

    while (movementRemaining > 0 && pos < MAX_DISTANCE) {
      let chunk = 0;
      let reason = null;

      let localPos = pos % TRACK_DATA.length;
      if (localPos === 0 && pos > 0) localPos = TRACK_DATA.length;
      let currentlyInTurn = TRACK_DATA.turns.some(t => localPos >= t.start && localPos < t.end);

      for (let i = 1; i <= movementRemaining; i++) {
        let nextPos = pos + i;
        let localNextPos = nextPos % TRACK_DATA.length;
        if (localNextPos === 0 && nextPos > 0) localNextPos = TRACK_DATA.length;

        if (TRACK_DATA.turns.some(t => t.start === localNextPos) && !currentlyInTurn) {
          chunk = i;
          reason = 'turn_boundary';
          break;
        }
        if (TRACK_DATA.jumps[localNextPos]) {
          chunk = i;
          reason = 'jump';
          break;
        }
        if (nextPos >= MAX_DISTANCE) {
          chunk = i;
          reason = 'finish';
          break;
        }
        chunk = i; 
      }

      racer.transitionDuration = stepDuration;

      for(let step = 0; step < chunk; step++) {
         pos += 1;
         racer.position = pos;
         setRacers([...currentRacers]);
         await sleep(stepDuration);
      }
      
      movementRemaining -= chunk;

      if (reason === 'turn_boundary') {
        stoppedEarlyReason = 'turn_boundary';
        break;
      } else if (reason === 'jump') {
        const localPosForJump = pos % TRACK_DATA.length || (pos > 0 ? TRACK_DATA.length : 0);
        const jumpDiff = TRACK_DATA.jumps[localPosForJump];
        await sleep(300);

        // Tunneling logic: Auto-pass the first jump
        if (racer.passives.includes('tunneling') && !racer.tunnelingUsed) {
            racer.tunnelingUsed = true;
            addLog(`TUNNELING! ${racer.name} burrows flawlessly under the obstacle!`);
            setFlash({ racerIndex: rIndex, type: 'jump_success', value: 'AUTO', maxVal: stats.jump });
            await sleep(900);
            setFlash(null);
            
            // Winged logic applied to a successful tunnel bypass
            if (racer.passives.includes('winged')) {
               const extraDist = rollDice(2);
               movementRemaining += extraDist;
               addLog(`WINGED! ${racer.name} bursts from the tunnel and glides an extra ${extraDist} spaces!`);
            }
            continue; 
        }

        let jumpAdvantage = racer.hasAdvantage;

        if (racer.passives.includes('jumper') && !racer.jumperUsed) {
          jumpAdvantage = true;
          racer.jumperUsed = true;
          addLog(`${racer.name}'s Jumper passive activates! Advantage on the jump!`);
        }

        if (jumpAdvantage && racer.hasAdvantage) {
          racer.hasAdvantage = false;
        }

        const { value: jumpRoll, rolls: jumpRolls } = evaluateRoll(stats.jump, jumpAdvantage, isResilient ? 1 : 0);

        setFlash({ 
          racerIndex: rIndex, 
          type: 'roll', 
          value: jumpRoll, 
          rolls: jumpRolls, 
          stat: 'Jump', 
          maxVal: stats.jump + (isResilient ? 1 : 0)
        });
        
        await sleep(1000);

        if (jumpRoll === 1 && racer.passives.includes('super_charged')) {
           racer.hasAdvantage = true;
           addLog(`SUPER CHARGED! ${racer.name} stumbled on the jump and becomes supercharged!`);
        }

        if (jumpRoll >= jumpDiff) {
          addLog(getBark('jump_success', racer.name));
          setFlash({ racerIndex: rIndex, type: 'jump_success', value: jumpRoll });
          await sleep(900);
          setFlash(null);

          // Winged logic on standard jump success
          if (racer.passives.includes('winged')) {
             const extraDist = rollDice(2);
             movementRemaining += extraDist;
             addLog(`WINGED! ${racer.name} glides an extra ${extraDist} spaces after clearing the hazard!`);
          }

        } else {
          if (racer.passives.includes('headstrong') && !racer.headstrongUsed) {
             addLog(`HEADSTRONG! ${racer.name} powers through the hazard without breaking stride!`);
             racer.headstrongUsed = true;
             racer.isPenalized = false; 
             setFlash({ racerIndex: rIndex, type: 'crash', value: jumpRoll });
             await sleep(1300);
             setFlash(null);
             stoppedEarlyReason = 'crash';
             break;
          } else {
             addLog(getBark('jump_crash', racer.name));
             racer.isPenalized = true;
             setFlash({ racerIndex: rIndex, type: 'crash', value: jumpRoll });
             await sleep(1300);
             setFlash(null);
             stoppedEarlyReason = 'crash';
             break; 
          }
        }
      }
    }

    if (stoppedEarlyReason === 'turn_boundary') {
       racer.striderStacks = 0;
       if (movementRemaining >= 5) {
           addLog(getBark('hard_brake', racer.name));
           setFlash({ racerIndex: rIndex, type: 'hard_brake', value: movementRemaining });
           await sleep(1500);
           setFlash(null);
       }
    } else if (stoppedEarlyReason === 'crash') {
       racer.striderStacks = 0;
    }

    racer.turnCount = (racer.turnCount || 0) + 1;

    if (pos >= MAX_DISTANCE) {
      addLog(getBark('finish', racer.name));
      setIsFinished(true);
      setWinner(racer);
    }

    if (!isFinished && pos < MAX_DISTANCE) {
      if (activeRacerIndex === 1) {
        setCurrentTurn(t => t + 1);
      }
      setActiveRacerIndex((prev) => (prev === 0 ? 1 : 0));
    }

    setBusy(false);
  }, [activeRacerIndex, isFinished, busy, racers, addLog, sleep, gameSpeed, MAX_DISTANCE]);

  return { racers, activeRacerIndex, logs, isFinished, winner, takeTurn, executeInitiative, busy, flash, trackData: TRACK_DATA, gameSpeed, setGameSpeed, laps, currentTurn };
}
</file>

<file path="src/views/ActiveRace.jsx">
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
    setHeatResults(prev => [...prev, { ...heatData, heatIndex: heatIndex + 1 }]);

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
</file>

<file path="src/views/RacingSetup.jsx">
import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/assets';
import { MOUNTS, PLAYER_PRESETS, AVAILABLE_PASSIVES, generateOpponent } from '../data/mounts';

export default function RacingSetup({ onBack, onBeginRace }) {
  const [view, setView] = useState('menu'); 

  const [quickRacers, setQuickRacers] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const [quickSkins, setQuickSkins] = useState({});
  const [quickPassives, setQuickPassives] = useState({});

  const [circuitLength, setCircuitLength] = useState(3);
  const [activeTab, setActiveTab] = useState(0);
  const [circuitOpponents, setCircuitOpponents] = useState([]);
  const [heats, setHeats] = useState([]);
  const [isPractice, setIsPractice] = useState(false);
  
  const [playerProfiles, setPlayerProfiles] = useState(() => {
    const saved = localStorage.getItem('playerProfiles');
    if (saved) {
       const parsed = JSON.parse(saved);
       return parsed.map(p => ({
          ...p,
          passives: p.passives || (p.passive && p.passive !== 'none' ? [p.passive] : [])
       }));
    }
    return JSON.parse(JSON.stringify(PLAYER_PRESETS));
  });

  useEffect(() => {
    localStorage.setItem('playerProfiles', JSON.stringify(playerProfiles));
  }, [playerProfiles]);

  useEffect(() => {
    if (view === 'circuit') {
      generateCircuitPool(circuitLength);
    }
  }, [view]);

  const generateCircuitPool = (len) => {
    const aceIndex = Math.floor(Math.random() * len);
    const opps = Array.from({length: len}, (_, i) => generateOpponent(i, i === aceIndex));
    setCircuitOpponents(opps);
    setHeats(Array.from({length: len}, (_, i) => ({
      index: i,
      presetId: 'plum', 
      selectedOppId: null, 
      wager: 100
    })));
  };

  const handleCircuitLengthChange = (len) => {
    setCircuitLength(len);
    generateCircuitPool(len);
    setActiveTab(0);
  };

  const updateHeat = (heatIndex, field, value) => {
    setHeats(prev => {
      const next = [...prev];
      next[heatIndex][field] = value;
      return next;
    });
  };

  const handleProfileEdit = (profileId, field, value) => {
    setPlayerProfiles(prev => prev.map(p => p.id === profileId ? { ...p, [field]: value } : p));
  };

  const assignOpponentToHeat = (heatIndex, oppId) => {
    setHeats(prev => prev.map((heat, idx) => {
      if (idx === heatIndex) return { ...heat, selectedOppId: oppId };
      if (heat.selectedOppId === oppId) return { ...heat, selectedOppId: null };
      return heat;
    }));
  };

  const toggleQuickRacer = (mountId) => {
    setQuickRacers((prev) => {
      if (prev.includes(mountId)) {
        const newStats = { ...quickStats };
        delete newStats[mountId];
        setQuickStats(newStats);
        return prev.filter((id) => id !== mountId);
      }
      if (prev.length < 2) {
        setQuickStats((curr) => ({ ...curr, [mountId]: { ...MOUNTS[mountId].baseStats } }));
        return [...prev, mountId];
      }
      return prev; 
    });
  };

  const startQuickRace = () => {
    const racers = quickRacers.map((id, idx) => {
      const mount = MOUNTS[id];
      const skinId = quickSkins[id] || 'default';
      const skin = mount.skins.find(s => s.id === skinId);
      return {
        isPlayer: true,
        id: `qracer_${idx}`,
        name: skin.name,
        imagePath: skin.imagePath,
        facing: skin.facing,
        racingStats: quickStats[id],
        passives: quickPassives[id] || [],
        level: 1,
        laps: 1
      };
    });
    onBeginRace(racers, 'track_a'); 
  };

  const startCircuit = () => {
    const circuitData = heats.map(heat => {
      const activeProfile = playerProfiles.find(p => p.id === heat.presetId);
      const skin = MOUNTS[activeProfile.mountId].skins.find(s => s.id === activeProfile.skinId);
      const opp = circuitOpponents.find(o => o.id === heat.selectedOppId);

      const pTotal = activeProfile.wins + activeProfile.losses;
      const pW = pTotal > 0 ? activeProfile.wins / pTotal : 0;
      const pS = 2.0 + (activeProfile.level * 1.5) + pW; 

      const oTotal = opp.wins + opp.losses;
      const oW = oTotal > 0 ? opp.wins / oTotal : 0;
      const oS = 2.0 + (opp.level * 1.5) + oW;

      const probPlayer = pS / (pS + oS);
      const payoutMult = 1 / probPlayer;
      const potential = heat.wager * payoutMult;

      const playerRacer = {
        isPlayer: true,
        presetId: activeProfile.id,
        isPractice: isPractice,
        id: `player_heat_${heat.index}`,
        name: activeProfile.label.split(' (')[0], 
        imagePath: skin.imagePath,
        facing: skin.facing,
        racingStats: { speed: activeProfile.speed, jump: activeProfile.jump, turning: activeProfile.turning },
        passives: activeProfile.passives,
        level: activeProfile.level,
        laps: 1,
        wagerInfo: { amount: heat.wager, potential }
      };

      const oppRacer = {
        isPlayer: false,
        id: opp.id,
        name: opp.name,
        imagePath: opp.imagePath,
        facing: opp.facing,
        racingStats: opp.stats,
        passives: opp.passives,
        level: opp.level,
        laps: 1
      };

      return [playerRacer, oppRacer];
    });

    onBeginRace(circuitData, 'track_a');
  };

  if (view === 'menu') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0d1317] font-sans text-stone-200">
        <div className="flex flex-col gap-8 text-center max-w-4xl w-full px-6">
          <h1 className="font-serif text-6xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] tracking-tighter">
            THE GATEWAY
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <button onClick={() => setView('quick')} className="group relative rounded-3xl border-2 border-stone-700 bg-stone-900 p-10 hover:border-sky-500 hover:bg-stone-800 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(56,189,248,0.2)]">
              <h2 className="font-serif text-4xl font-black text-white group-hover:text-sky-400">Quick Heat</h2>
              <p className="mt-4 text-stone-400 font-mono text-sm leading-relaxed">The original unranked layout. Pick any two mounts from the base roster, customize their stats, and hit the dirt. No stakes attached.</p>
            </button>
            <button onClick={() => setView('circuit')} className="group relative rounded-3xl border-2 border-stone-700 bg-stone-900 p-10 hover:border-amber-500 hover:bg-stone-800 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(251,191,36,0.2)]">
               <h2 className="font-serif text-4xl font-black text-white group-hover:text-amber-400">Wagering Circuit</h2>
               <p className="mt-4 text-stone-400 font-mono text-sm leading-relaxed">Compete against generated AI opponents across a multi-heat circuit. Draft from your customized roster profiles, review odds, and place your bets.</p>
            </button>
          </div>
          <button onClick={onBack} className="mt-8 text-stone-500 font-mono text-sm uppercase tracking-widest hover:text-white transition">Return to Home</button>
        </div>
      </div>
    );
  }

  if (view === 'quick') {
    return (
      <div className="min-h-screen w-full bg-[#0d1317] font-sans text-stone-200 p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <header className="flex justify-between items-end border-b border-stone-800 pb-4">
            <div>
              <h1 className="font-serif text-5xl font-black text-sky-400">QUICK HEAT</h1>
              <p className="font-mono text-xs uppercase text-stone-500 tracking-widest mt-2">Standard 1v1 Exhibition</p>
            </div>
            <button onClick={() => setView('menu')} className="border border-stone-700 bg-stone-900 px-6 py-2 rounded text-xs font-mono uppercase text-stone-400 hover:text-white hover:bg-stone-800">Back to Mode Select</button>
          </header>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-stone-300">Roster Overview</h2>
              <span className={`px-4 py-1 rounded text-xs font-mono font-bold ${quickRacers.length === 2 ? 'bg-sky-500/20 text-sky-400' : 'bg-stone-800 text-stone-400'}`}>
                {quickRacers.length} / 2 Selected
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.values(MOUNTS).map(mount => {
                const isSelected = quickRacers.includes(mount.id);
                const isDisabled = !isSelected && quickRacers.length >= 2;
                return (
                  <button 
                    key={mount.id} 
                    onClick={() => toggleQuickRacer(mount.id)} 
                    disabled={isDisabled}
                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center ${isSelected ? 'border-sky-400 bg-stone-800 shadow-[0_0_20px_rgba(56,189,248,0.2)] -translate-y-2' : isDisabled ? 'border-stone-800 bg-stone-900/40 opacity-50 grayscale' : 'border-stone-700 bg-stone-900 hover:border-stone-500 hover:bg-stone-800 hover:-translate-y-1'}`}
                  >
                    <img src={assetUrl(mount.skins[0].imagePath)} alt={mount.id} className="h-24 object-contain mb-3 drop-shadow-md" />
                    <span className={`font-serif font-black ${isSelected ? 'text-sky-400' : 'text-white'}`}>{mount.skins[0].name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {quickRacers.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-900/50 p-6 rounded-2xl border border-stone-800">
              {quickRacers.map((id, index) => {
                const mount = MOUNTS[id];
                const activeSkinId = quickSkins[id] || 'default';
                const activeSkin = mount.skins.find(s => s.id === activeSkinId);

                return (
                  <div key={id} className="flex gap-6 bg-stone-950 p-6 rounded-xl border border-stone-800">
                    <div className="flex flex-col items-center w-1/3 border-r border-stone-800 pr-6">
                      <span className="text-xs font-mono text-stone-500 uppercase tracking-widest mb-4">Racer {index + 1}</span>
                      <img src={assetUrl(activeSkin.imagePath)} alt="mount" className="h-32 object-contain drop-shadow-md mb-4" />
                      
                      {mount.skins.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {mount.skins.map(s => (
                            <button key={s.id} onClick={() => setQuickSkins(prev => ({...prev, [id]: s.id}))} className={`w-8 h-8 rounded-full border-2 bg-stone-900 p-0.5 ${activeSkinId === s.id ? 'border-sky-400 scale-110' : 'border-stone-700 opacity-60 hover:opacity-100'}`}>
                              <img src={assetUrl(s.imagePath)} alt={s.name} className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col w-2/3 pl-2 gap-4">
                      {['speed', 'jump', 'turning'].map(stat => (
                        <div key={stat} className="flex items-center gap-3">
                          <span className="w-16 text-[10px] font-mono font-bold uppercase text-stone-400">{stat}</span>
                          <input 
                            type="range" min="1" max="40" 
                            value={quickStats[id]?.[stat] || 15} 
                            onChange={(e) => setQuickStats(prev => ({...prev, [id]: { ...prev[id], [stat]: parseInt(e.target.value) }}))}
                            className="flex-1 custom-slider h-2 rounded-full appearance-none bg-stone-900 border border-stone-700"
                          />
                          <span className="w-6 text-right font-mono text-sm text-white">{quickStats[id]?.[stat]}</span>
                        </div>
                      ))}
                      
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">Passive Abilities</span>
                        <div className="flex flex-wrap gap-1">
                          {AVAILABLE_PASSIVES.map(p => {
                            const isSelected = (quickPassives[id] || []).includes(p.id);
                            return (
                              <button 
                                key={p.id} 
                                onClick={() => {
                                  setQuickPassives(prev => {
                                    const curr = prev[id] || [];
                                    return { ...prev, [id]: isSelected ? curr.filter(x => x !== p.id) : [...curr, p.id] };
                                  });
                                }}
                                className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border transition-colors ${isSelected ? 'bg-sky-500/20 text-sky-400 border-sky-500/50' : 'bg-stone-900 text-stone-500 border-stone-700 hover:border-stone-500'}`}
                              >
                                {p.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          <div className="flex justify-center mt-8">
            <button disabled={quickRacers.length !== 2} onClick={startQuickRace} className="px-16 py-6 bg-sky-600 hover:bg-sky-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-black text-xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:shadow-none">
              Start Exhibition
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'circuit' && heats.length > 0) {
    const currentHeat = heats[activeTab];
    const activeProfile = playerProfiles.find(p => p.id === currentHeat.presetId);
    const activeSkinData = MOUNTS[activeProfile.mountId].skins.find(s => s.id === activeProfile.skinId);
    const selectedOpp = circuitOpponents.find(o => o.id === currentHeat.selectedOppId);
    const allHeatsReady = heats.every(h => h.selectedOppId !== null);

    let oddsData = null;
    if (selectedOpp) {
      const pW = (activeProfile.wins + activeProfile.losses) > 0 ? activeProfile.wins / (activeProfile.wins + activeProfile.losses) : 0;
      const pS = 2.0 + (activeProfile.level * 1.5) + pW;
      
      const oW = (selectedOpp.wins + selectedOpp.losses) > 0 ? selectedOpp.wins / (selectedOpp.wins + selectedOpp.losses) : 0;
      const oS = 2.0 + (selectedOpp.level * 1.5) + oW;
      const probPlayer = pS / (pS + oS);
      oddsData = { prob: probPlayer, mult: 1 / probPlayer, potential: currentHeat.wager * (1 / probPlayer) };
    }

    return (
      <div className="min-h-screen w-full bg-[#0d1317] font-sans text-stone-200 p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          
          <header className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-stone-800 pb-4 gap-4">
            <div>
              <h1 className="font-serif text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">WAGERING CIRCUIT</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs uppercase text-stone-500 tracking-widest">Total Heats:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(num => (
                      <button key={num} onClick={() => handleCircuitLengthChange(num)} className={`w-8 h-8 rounded border flex items-center justify-center font-black ${circuitLength === num ? 'bg-amber-500 text-stone-950 border-amber-400' : 'bg-stone-900 border-stone-700 text-stone-400 hover:bg-stone-800'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-6 border-l border-stone-800 pl-6">
                  <span className="font-mono text-xs uppercase text-stone-500 tracking-widest">Practice Mode:</span>
                  <button onClick={() => setIsPractice(!isPractice)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isPractice ? 'bg-amber-500' : 'bg-stone-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isPractice ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setView('menu')} className="border border-stone-700 bg-stone-900 px-6 py-3 rounded-lg text-xs font-mono uppercase text-stone-400 hover:text-white hover:bg-stone-800">Back</button>
              <button disabled={!allHeatsReady} onClick={startCircuit} className="bg-amber-500 disabled:bg-stone-800 text-stone-950 disabled:text-stone-600 px-8 py-3 rounded-lg text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.4)] disabled:shadow-none hover:bg-amber-400 transition">Start Circuit</button>
            </div>
          </header>

          <div className="flex gap-2 border-b border-stone-800">
            {heats.map((heat, idx) => (
              <button 
                key={idx} onClick={() => setActiveTab(idx)} 
                className={`px-8 py-4 font-mono font-bold uppercase tracking-widest border-b-4 transition-all ${activeTab === idx ? 'border-amber-400 text-amber-400 bg-stone-900/50' : 'border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900/30'} flex items-center gap-3`}
              >
                Heat {idx + 1}
                {heat.selectedOppId && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 animate-[fadeIn_0.3s_ease-out]">
            
            <section className="lg:col-span-4 flex flex-col gap-4">
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-stone-950 text-[10px]">1</span> Your Mount
              </h2>
              <div className="rounded-2xl border-2 border-stone-700 bg-stone-900/80 p-6 shadow-xl flex flex-col gap-6 relative">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-stone-500">Roster Profile</label>
                  <select 
                    value={currentHeat.presetId}
                    onChange={(e) => updateHeat(activeTab, 'presetId', e.target.value)}
                    className="bg-stone-950 border border-stone-700 rounded-lg p-3 font-serif text-xl text-white outline-none focus:border-amber-500"
                  >
                    {playerProfiles.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>

                <div className="flex justify-center h-32 py-2">
                  <img src={assetUrl(activeSkinData.imagePath)} alt="mount" className="h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 text-center flex flex-col items-center">
                    <span className="text-[10px] font-mono text-stone-500 uppercase mb-2">Record</span>
                    <div className="flex items-center gap-2">
                       <input type="number" min="0" value={activeProfile.wins} onChange={(e)=>handleProfileEdit(activeProfile.id, 'wins', parseInt(e.target.value)||0)} className="w-12 bg-transparent text-emerald-400 font-mono font-bold text-center border-b border-stone-700 focus:border-emerald-400 outline-none"/>
                       <span className="text-stone-500">-</span>
                       <input type="number" min="0" value={activeProfile.losses} onChange={(e)=>handleProfileEdit(activeProfile.id, 'losses', parseInt(e.target.value)||0)} className="w-12 bg-transparent text-rose-400 font-mono font-bold text-center border-b border-stone-700 focus:border-rose-400 outline-none"/>
                    </div>
                  </div>
                  
                  <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 text-center flex flex-col items-center">
                    <span className="text-[10px] font-mono text-stone-500 uppercase mb-2">Passives</span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {AVAILABLE_PASSIVES.map(p => {
                        const isSelected = activeProfile.passives.includes(p.id);
                        return (
                          <button 
                            key={p.id}
                            onClick={() => {
                              const next = isSelected ? activeProfile.passives.filter(x => x !== p.id) : [...activeProfile.passives, p.id];
                              handleProfileEdit(activeProfile.id, 'passives', next);
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border transition-colors ${isSelected ? 'bg-sky-500/20 text-sky-400 border-sky-500/50' : 'bg-stone-900 text-stone-500 border-stone-700 hover:border-stone-500'}`}
                          >
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-stone-950 border border-stone-800 rounded-lg p-4">
                  {['speed', 'jump', 'turning'].map(stat => (
                    <div key={stat} className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-stone-500 uppercase">{stat}</span>
                      <input 
                         type="number" min="1" max="40"
                         value={activeProfile[stat]} 
                         onChange={(e)=>handleProfileEdit(activeProfile.id, stat, Math.max(1, parseInt(e.target.value)||1))}
                         className="w-16 bg-transparent text-center font-serif font-black text-2xl text-white outline-none border-b-2 border-stone-800 focus:border-amber-400 mt-1" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="lg:col-span-4 flex flex-col gap-4">
               <div className="flex justify-between items-end">
                <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-stone-950 text-[10px]">2</span> Select Opponent
                </h2>
                <button onClick={() => generateCircuitPool(circuitLength)} className="text-[10px] font-mono font-bold uppercase text-stone-500 hover:text-white transition">↻ Refresh Pool</button>
              </div>
              
              <div className="flex flex-col gap-3">
                {circuitOpponents.map(opp => {
                  const isSelectedForThisHeat = currentHeat.selectedOppId === opp.id;
                  const assignedHeatIndex = heats.findIndex(h => h.selectedOppId === opp.id);
                  const isAssignedElsewhere = assignedHeatIndex !== -1 && assignedHeatIndex !== activeTab;
                  const totalRaces = opp.wins + opp.losses;
                  const winPct = totalRaces > 0 ? ((opp.wins / totalRaces) * 100).toFixed(0) : 0;

                  return (
                    <button 
                      key={opp.id} 
                      onClick={() => assignOpponentToHeat(activeTab, opp.id)}
                      className={`relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${isSelectedForThisHeat ? 'border-emerald-400 bg-stone-800 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02] z-10' : isAssignedElsewhere ? 'border-stone-800 bg-stone-900/40 opacity-60' : 'border-stone-800 bg-stone-900/60 hover:border-stone-600 hover:bg-stone-800'}`}
                    >
                      <img src={assetUrl(opp.imagePath)} alt={opp.name} className={`h-16 w-16 object-contain drop-shadow-md ${isAssignedElsewhere ? 'grayscale' : ''}`} />
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-serif text-lg font-black ${isSelectedForThisHeat ? 'text-emerald-400' : 'text-white'}`}>{opp.name}</h3>
                          {isAssignedElsewhere && <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-stone-800 border border-stone-600 text-stone-400 px-2 py-0.5 rounded">Heat {assignedHeatIndex + 1}</span>}
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono mt-1 items-center">
                          <span className={`border border-stone-700 rounded px-1.5 bg-stone-950 font-bold ${opp.level >= 6 ? 'text-amber-400' : 'text-stone-400'}`}>Lvl {opp.level}</span>
                          {opp.isAce && <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-amber-900/30 text-amber-400 px-1 rounded border border-amber-800">ACE</span>}
                          <span className="text-emerald-400 ml-1">{opp.wins} W</span>
                          <span className="text-rose-400">{opp.losses} L</span>
                        </div>
                        <div className="flex justify-between mt-1.5 items-end">
                           <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Win Rate: <span className="text-white">{winPct}%</span></span>
                        </div>
                        {opp.passives.length > 0 && (
                           <div className="flex flex-wrap gap-1 mt-2 justify-end">
                             {opp.passives.map(p => (
                               <span key={p} className="text-[8px] font-mono text-sky-400 font-bold uppercase tracking-widest bg-sky-900/30 px-1 rounded border border-sky-800">⭐ {p.replace('_', ' ')}</span>
                             ))}
                           </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="lg:col-span-4 flex flex-col gap-4">
               <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-stone-950 text-[10px]">3</span> Lock Wager
               </h2>
               {selectedOpp && oddsData ? (
                <div className="rounded-2xl border-2 border-amber-500/50 bg-stone-900/90 p-6 shadow-[0_0_30px_rgba(251,191,36,0.1)] flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl border border-stone-800">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono uppercase text-stone-500 mb-1">Win Prob</span>
                      <span className="font-serif text-3xl font-black text-sky-400">{(oddsData.prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-10 w-px bg-stone-700" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono uppercase text-stone-500 mb-1">Payout Mult</span>
                      <span className="font-serif text-3xl font-black text-emerald-400">{oddsData.mult.toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold uppercase text-stone-400 text-center">Wager Amount ($)</label>
                    <input 
                      type="number" min="1" 
                      value={currentHeat.wager} 
                      onChange={(e) => updateHeat(activeTab, 'wager', parseInt(e.target.value) || 0)}
                      className="w-full bg-stone-950 border-2 border-amber-500/50 rounded-xl p-4 text-3xl font-black font-serif text-white text-center focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center border-t border-stone-800 pt-5 mt-2">
                    <span className="text-sm font-mono uppercase text-stone-400">Potential Return:</span>
                    <span className="text-4xl font-serif font-black text-amber-400">${oddsData.potential.toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/30 p-8 text-center">
                  <span className="font-mono text-xs uppercase text-stone-500 leading-relaxed">Select an unassigned opponent from the Matchmaking Pool to view odds and place your wager for Heat {activeTab + 1}.</span>
                </div>
              )}
            </section>

          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn { 0%{opacity:0; transform:translateY(10px)} 100%{opacity:1; transform:translateY(0)} }
          .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; cursor: pointer; background: #fbbf24; border: 2px solid #1c1917; }
          .custom-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; cursor: pointer; background: #fbbf24; border: 2px solid #1c1917; }
        `}} />
      </div>
    );
  }

  return null;
}
</file>

</files>
