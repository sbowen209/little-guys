import { ROSTER } from '../data/characters';
import { ENEMIES } from '../data/enemies';

export default function MainMenu({ onStartRun }) {
  const characters = Object.values(ROSTER);
  const enemies = Object.values(ENEMIES);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="text-center space-y-4 pt-12">
        <h1 className="text-5xl font-black tracking-tight text-emerald-400">Little Guys</h1>
        <p className="text-slate-400 text-lg">Select a character and brave the biomes.</p>
        
        <button 
          onClick={onStartRun}
          className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
        >
          Start New Run
        </button>
      </header>

      {/* ROSTER SECTION */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 mb-6">Your Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div key={char.id} className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col hover:border-emerald-500/50 transition-colors overflow-hidden shadow-lg">
              <div className="h-64 w-full bg-slate-900 overflow-hidden">
                <img 
                  src={`${import.meta.env.BASE_URL}${char.imagePath.slice(1)}`} 
                  alt={char.name} 
                  loading="lazy" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-white">{char.name}</h3>
                  <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-emerald-300">
                    HP: {char.baseHealth} | ATK: {char.baseAttack}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4 flex-grow">{char.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {char.passives.map(passive => (
                    <span key={passive} className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full border border-indigo-700/50">
                      {passive.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BESTIARY SECTION */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold border-b border-rose-900 pb-2 mb-6 text-rose-400">Known Enemies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enemies.map((enemy) => (
            <div key={enemy.id} className="bg-slate-900 rounded-xl border border-rose-900/40 flex flex-col overflow-hidden shadow-md">
              <div className="h-48 w-full bg-black">
                <img 
                  src={`${import.meta.env.BASE_URL}${enemy.imagePath.slice(1)}`} 
                  alt={enemy.name} 
                  loading="lazy"
                  className="w-full h-full object-cover object-center opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-rose-300 text-lg">{enemy.name}</h3>
                <p className="text-xs text-slate-500 mb-3 capitalize">Biome: {enemy.biome} • {enemy.zoneType}</p>
                <div className="flex justify-between items-center text-xs font-mono bg-slate-800 px-2 py-1 rounded text-rose-200">
                  <span>HP: {enemy.baseHealth}</span>
                  <span>ATK: {enemy.baseAttack}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Scaling: +{enemy.healthPerLevel} HP / +{enemy.attackPerLevel} ATK
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}