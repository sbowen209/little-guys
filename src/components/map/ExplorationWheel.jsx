// src/components/map/ExplorationWheel.jsx
// The wheel rolls the d3 ITSELF, animates so the pointer lands on that exact
// segment, then reports the same roll up (bug E — visual === logic).
import { useState } from 'react';

const SEGMENTS = [
  { glyph: '⚔', label: 'Battle', hex: '#fb7185' }, // roll 1 → 0–120°
  { glyph: '🌿', label: 'Gather', hex: '#34d399' }, // roll 2 → 120–240°
  { glyph: '❔', label: 'Event', hex: '#818cf8' },  // roll 3 → 240–360°
];

// Rotation (mod 360) that brings each segment's CENTER under the top pointer.
// Segment centers are 60° / 180° / 300°; offset = (360 − center) % 360.
const OFFSET = { 1: 300, 2: 180, 3: 60 };

export default function ExplorationWheel({ onExplore }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const roll = 1 + Math.floor(Math.random() * 3);
    const spins = 4 + Math.floor(Math.random() * 3);
    const offset = OFFSET[roll];
    const target = rotation + spins * 360 + (((offset - (rotation % 360)) + 360) % 360);

    setRotation(target);
    setTimeout(() => { setSpinning(false); onExplore(roll); }, 1150);
  };

  const conic = `conic-gradient(
    ${SEGMENTS[0].hex} 0deg 120deg,
    ${SEGMENTS[1].hex} 120deg 240deg,
    ${SEGMENTS[2].hex} 240deg 360deg)`;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <p className="max-w-sm text-stone-300">
        Make an <span className="font-bold text-amber-400">Exploration Roll</span> to reveal this zone.
        A repeat result unlocks the path onward.
      </p>

      <div className="relative h-52 w-52">
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 text-2xl drop-shadow">▼</div>

        <div
          className="ew-wheel relative h-52 w-52 rounded-full border-4 border-stone-700 shadow-[0_0_30px_rgba(0,0,0,0.6)]"
          style={{ background: conic, transform: `rotate(${rotation}deg)` }}
        >
          {SEGMENTS.map((s, i) => (
            <span
              key={s.label}
              className="absolute left-1/2 top-1/2 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
              style={{ transform: `rotate(${i * 120 + 60}deg) translateY(-66px) rotate(${-(i * 120 + 60)}deg) translate(-50%,-50%)` }}
            >
              {s.glyph}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-amber-400 bg-stone-950 font-black uppercase tracking-wider text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition enabled:hover:scale-105 disabled:opacity-70"
        >
          {spinning ? '...' : 'Roll'}
        </button>
      </div>

      <style>{`
        .ew-wheel { transition: transform 1.1s cubic-bezier(0.17, 0.67, 0.21, 1); }
        @media (prefers-reduced-motion: reduce) { .ew-wheel { transition: none; } }
      `}</style>
    </div>
  );
}