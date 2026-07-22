// src/components/RewardReveal.jsx
import { useState } from 'react';
import { REWARD_INFO } from '../../data/rewards';
import { assetUrl } from '../../utils/assets';

export default function RewardReveal({ reward }) {
  const [imgErr, setImgErr] = useState(false);
  if (!reward) return null;
  const info = REWARD_INFO[reward.type];
  const showImg = reward.image && !imgErr;

  return (
    <div
      className="mx-auto flex w-64 animate-[lootPop_0.6s_cubic-bezier(0.22,1.4,0.6,1)_both] flex-col items-center gap-3 rounded-2xl border-2 bg-stone-900/80 p-6 text-center shadow-2xl backdrop-blur-md"
      style={{ borderColor: `${info.hex}66`, boxShadow: `0 0 35px -8px ${info.hex}` }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: info.hex }}>
        {info.label}
      </span>
      {showImg ? (
        <img
          src={assetUrl(reward.image)}
          alt={reward.name}
          onError={() => setImgErr(true)}
          draggable={false}
          className="h-28 w-28 object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)]"
        />
      ) : (
        <div className="text-7xl drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)]">{info.emoji}</div>
      )}
      <p className="font-serif text-xl font-black text-white">{reward.name}</p>
      {reward.qty && <p className="font-mono text-amber-400">×{reward.qty}</p>}
    </div>
  );
}