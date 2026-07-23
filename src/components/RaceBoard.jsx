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