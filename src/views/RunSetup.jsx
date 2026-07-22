// src/views/RunSetup.jsx
import { useState } from 'react';
import { HEROES } from '../data/heroes';
import { assetUrl } from '../utils/assets';
import Hearts from '../components/combat/Hearts';

const BIOMES = [
  { id: 'swamp', name: 'The Maiev Swamp', ready: true, desc: 'A toxic, muddy expanse of dangerous flora.' },
  { id: 'plains', name: 'The Elemental Plains', ready: false, desc: 'Coming soon.' },
  { id: 'coast', name: 'The Dongdell Coast', ready: false, desc: 'Coming soon.' },
];

export default function RunSetup({ onBegin, onBack }) {
  const heroes = Object.values(HEROES);
  const [hero, setHero] = useState(heroes[0]);
  const biome = BIOMES[0]; // Only the swamp is playable for now.

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-black text-amber-400">Run Setup</h1>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-stone-400 transition hover:text-stone-200"
        >
          Back
        </button>
      </div>

      <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">1 · Pick Your Hero</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {heroes.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setHero(h)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
              hero.id === h.id ? 'border-amber-400 bg-stone-800' : 'border-stone-800 bg-stone-900/60 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={assetUrl(h.imagePath)} alt={h.name} className="h-20 w-20 object-contain" draggable={false} />
            <span className="text-center text-sm font-bold text-stone-200">{h.name}</span>
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-stone-700 bg-stone-900/70 p-5 md:flex-row md:items-center">
        <img src={assetUrl(hero.imagePath)} alt={hero.name} className="mx-auto h-28 w-28 object-contain md:mx-0" draggable={false} />
        <div className="flex-1">
          <h3 className="font-serif text-2xl font-black text-white">{hero.name}</h3>
          <p className="mb-2 text-stone-400 italic">"{hero.description}"</p>
          <div className="flex items-center gap-4">
            <Hearts hp={hero.baseHealth} max={5} />
            <span className="font-mono text-sm text-stone-300">⚔ {hero.baseAttack} ATK</span>
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-500">2 · Pick Your Biome</h2>
      <div className="mb-10 grid grid-cols-1 gap-3 md:grid-cols-3">
        {BIOMES.map((b) => (
          <div
            key={b.id}
            className={`rounded-xl border-2 p-4 ${b.ready ? 'border-amber-400 bg-stone-800' : 'border-stone-800 bg-stone-900/40 opacity-50'}`}
          >
            <h3 className="font-serif text-lg font-bold text-white">{b.name}</h3>
            <p className="text-sm text-stone-400">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onBegin({ character: hero, biome: biome.id })}
          className="rounded-sm bg-amber-500 px-12 py-4 font-black uppercase tracking-widest text-stone-950 shadow-[0_0_25px_rgba(251,191,36,0.4)] transition hover:bg-amber-400"
        >
          Enter the Mire
        </button>
      </div>
    </div>
  );
}