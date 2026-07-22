import { useState, useEffect } from 'react';
import LootReveal from './LootReveal';
import { getItemMeta } from '../../data/items';
import { assetUrl } from '../../utils/assets';

function QuantitySlider({ finalValue, max, delay, winner }) {
  const [active, setActive] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setActive(true), 100);
    const t2 = setTimeout(() => setSettled(true), delay);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay]);

  const heightPct = settled ? (finalValue / max) * 100 : (active ? 100 : 0);

  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${settled && winner ? 'scale-110 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]' : ''}`}>
      <span className={`font-mono text-3xl font-black ${settled && winner ? 'text-emerald-400' : 'text-stone-500'}`}>
        {settled ? finalValue : '?'}
      </span>
      <div className="relative h-32 w-8 overflow-hidden rounded-full border-2 border-stone-700 bg-stone-900">
        <div 
          className={`absolute bottom-0 w-full transition-all ease-out ${settled ? 'duration-500' : 'duration-[1.5s]'} ${settled && winner ? 'bg-emerald-500' : 'bg-stone-600'}`} 
          style={{ height: `${heightPct}%` }}
        />
      </div>
    </div>
  );
}

export default function GatherView({ encounter, onAccept }) {
  const { loot, qtyRolls = [], max, advantage, category, flowerId } = encounter;
  const [stage, setStage] = useState('reveal'); 

  useEffect(() => {
    if (stage === 'reveal') {
      const t = setTimeout(() => setStage('slider'), 1500);
      return () => clearTimeout(t);
    }
    if (stage === 'slider') {
      const delay = advantage ? 2300 : 1600;
      const t = setTimeout(() => setStage('loot'), delay);
      return () => clearTimeout(t);
    }
  }, [stage, advantage]);

  const itemId = category === 'plant' ? flowerId : category;
  const itemMeta = getItemMeta(itemId);
  const higher = advantage ? Math.max(...qtyRolls) : qtyRolls[0];

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-500/30 bg-stone-900/85 p-8 text-center shadow-2xl backdrop-blur-md">
      <h3 className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.3em]" style={{ color: itemMeta.hex }}>
        Gathering {itemMeta.name}
      </h3>
      
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full ring-2" style={{ backgroundColor: `${itemMeta.hex}22`, '--tw-ring-color': `${itemMeta.hex}99` }}>
          {itemMeta.imagePath ? <img src={assetUrl(itemMeta.imagePath)} alt={itemMeta.name} draggable={false} className="h-12 w-12 object-contain" /> : <span className="text-4xl">{itemMeta.emoji}</span>}
        </div>
      </div>

      {stage === 'slider' && (
        <div className="animate-[lootPop_0.4s_ease-out_both]">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
            {advantage ? 'Ardenkin — Advantage Roll' : 'Rolling Quantity...'}
          </p>
          <div className="mb-3 flex items-center justify-center gap-8">
            <QuantitySlider finalValue={qtyRolls[0]} max={max} delay={1000} winner={advantage ? qtyRolls[0] >= higher : true} />
            {advantage && (
              <>
                <span className="text-2xl font-black text-stone-600">vs</span>
                <QuantitySlider finalValue={qtyRolls[1]} max={max} delay={1500} winner={qtyRolls[1] >= higher} />
              </>
            )}
          </div>
        </div>
      )}

      {stage === 'loot' && (
        <div className="animate-[lootPop_0.4s_ease-out_both]">
          <h3 className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Resources Gathered</h3>
          <div className="mb-7"><LootReveal loot={loot} /></div>
          <button type="button" onClick={onAccept} className="rounded-lg bg-emerald-500 px-8 py-3 font-bold uppercase tracking-wider text-stone-950 transition hover:bg-emerald-400">
            Take It
          </button>
        </div>
      )}
    </div>
  );
}