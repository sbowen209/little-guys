// src/components/LootReveal.jsx
import { useState } from 'react';
import { getItemMeta } from '../../data/items';
import { assetUrl } from '../../utils/assets';

function ItemIcon({ meta }) {
  const [err, setErr] = useState(false);
  const showImg = meta.imagePath && !err;
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full ring-2"
      style={{ backgroundColor: `${meta.hex}22`, '--tw-ring-color': `${meta.hex}99` }}
    >
      {showImg ? (
        <img
          src={assetUrl(meta.imagePath)}
          alt={meta.name}
          draggable={false}
          onError={() => setErr(true)}
          className="h-12 w-12 object-contain"
        />
      ) : (
        <span className="text-3xl">{meta.emoji || '🌼'}</span>
      )}
    </div>
  );
}

export default function LootReveal({ loot }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      {loot.map((entry, i) => {
        const meta = getItemMeta(entry.id);
        return (
          <div
            key={i}
            style={{ animationDelay: `${i * 130}ms`, borderColor: `${meta.hex}55` }}
            className="flex w-28 origin-bottom animate-[lootPop_0.5s_cubic-bezier(0.22,1.4,0.6,1)_both] flex-col items-center gap-2 rounded-2xl border bg-stone-900/70 p-4 backdrop-blur-sm"
          >
            <ItemIcon meta={meta} />
            <span className="text-center text-sm font-semibold leading-tight text-stone-200">{meta.name}</span>
            <span className="font-mono text-lg font-black tabular-nums text-amber-400">×{entry.qty}</span>
          </div>
        );
      })}
    </div>
  );
}