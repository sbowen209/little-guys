// src/components/GatherReveal.jsx
// Shows Gil's "advantage" slot machine (two rolls, higher wins) before
// revealing the gathered loot. Non-Gil heroes skip straight to the loot.
import { useState, useEffect } from 'react';
import LootReveal from './LootReveal';

function Slot({ final, spinning, dim }) {
  const [display, setDisplay] = useState(1);
  useEffect(() => {
    if (!spinning) { setDisplay(final); return; }
    const id = setInterval(() => setDisplay(1 + Math.floor(Math.random() * 3)), 70);
    return () => clearInterval(id);
  }, [spinning, final]);

  return (
    <div
      className={`flex h-20 w-16 items-center justify-center rounded-xl border-2 font-mono text-4xl font-black transition-all duration-300 ${
        spinning
          ? 'border-stone-600 bg-stone-900 text-stone-300'
          : dim
            ? 'border-stone-700 bg-stone-900/60 text-stone-600 opacity-60'
            : 'border-amber-400 bg-amber-500/15 text-amber-300 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
      }`}
    >
      {display}
    </div>
  );
}

export default function GatherReveal({ encounter }) {
  const { ardenkin, plantRolls } = encounter;
  const useSlots = ardenkin && plantRolls && plantRolls.b != null;
  const [stage, setStage] = useState(useSlots ? 'spin' : 'loot'); // spin | settle | loot

  useEffect(() => {
    if (stage === 'spin') {
      const t = setTimeout(() => setStage('settle'), 1300);
      return () => clearTimeout(t);
    }
    if (stage === 'settle') {
      const t = setTimeout(() => setStage('loot'), 1100);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const higher = useSlots ? Math.max(plantRolls.a, plantRolls.b) : null;

  return (
    <div className="flex flex-col items-center gap-5">
      {useSlots && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400">
            Ardenkin · Advantage Roll
          </p>
          <div className="flex items-center gap-3">
            <Slot final={plantRolls.a} spinning={stage === 'spin'} dim={stage !== 'spin' && plantRolls.a !== higher} />
            <span className="text-2xl text-stone-500">/</span>
            <Slot final={plantRolls.b} spinning={stage === 'spin'} dim={stage !== 'spin' && plantRolls.b !== higher} />
          </div>
          {stage !== 'spin' && (
            <p className="animate-[lootPop_0.4s_ease-out_both] text-sm font-bold text-amber-300">
              Keeping the higher roll: ×{higher}
            </p>
          )}
        </div>
      )}

      {stage === 'loot' && (
        <div className="animate-[lootPop_0.4s_ease-out_both]">
          <LootReveal loot={encounter.loot} />
        </div>
      )}
    </div>
  );
}