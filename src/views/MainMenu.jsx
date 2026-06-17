import { useState } from 'react';
import { ROSTER } from '../data/characters';
import { ENEMIES } from '../data/enemies';

// The dictionary for your tooltips
const PASSIVE_DESCRIPTIONS = {
  "RESOURCEFUL": "Can occupy any map without running into Darkstalkers.",
  "ARDENKIN": "Advantage on plant rolls (roll twice, take the higher result).",
  "BATTLE_BLOOM": "Recover 1 HP at the end of every fight (Max 5 HP).",
  "FIRST_STRIKE": "Always attacks first in combat.",
  "EVASION": "Has a chance to completely dodge incoming attacks.",
  "CLEAVE": "Deals spillover damage to the next enemy.",
  "WIND_AFFINITY": "Gains bonus stats in the Plains biome.",
  "THICK_SCALES": "Takes reduced damage from physical attacks.",
  "SWAMP_NATIVE": "Gains bonus stats in the Swamp biome.",
  "MYSTIC_AURA": "Heals slightly after a victorious battle.",
  "LOOKING_FOR_TROUBLE": "Once per level, force-reroll any exploration that is not a fight."
};

export default function MainMenu({ onStartRun }) {
  const characters = Object.values(ROSTER);
  const enemies = Object.values(ENEMIES);

  // State to track tabs and currently selected entities
  const [activeTab, setActiveTab] = useState('roster');
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const [selectedEnemy, setSelectedEnemy] = useState(enemies[0]);

  return (
    <div className="max-w-6xl mx-auto pb-12 flex flex-col h-screen">
      
      {/* HEADER */}
      <header className="text-center space-y-4 pt-8 pb-6 shrink-0">
        <h1 className="text-5xl font-black tracking-tight text-emerald-400">Little Guys</h1>
        <button 
          onClick={onStartRun}
          className="mt-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
        >
          Start New Run
        </button>
      </header>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-6 shrink-0">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'roster' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          Roster
        </button>
        <button 
          onClick={() => setActiveTab('bestiary')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'bestiary' ? 'bg-rose-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          Bestiary
        </button>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-grow flex gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: THE LIST (Scrollable, Fast Loading) */}
        <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 pb-8 custom-scrollbar">
          {activeTab === 'roster' && characters.map((char) => (
            <button 
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedChar.id === char.id ? 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500'}`}
            >
              <h3 className="text-xl font-bold text-white">{char.name}</h3>
              <p className="text-sm text-slate-400 truncate">{char.description}</p>
            </button>
          ))}

          {activeTab === 'bestiary' && enemies.map((enemy) => (
            <button 
              key={enemy.id}
              onClick={() => setSelectedEnemy(enemy)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedEnemy.id === enemy.id ? 'bg-slate-800 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500'}`}
            >
              <h3 className="text-xl font-bold text-rose-300">{enemy.name}</h3>
              <p className="text-sm text-slate-400 capitalize">{enemy.biome} - {enemy.zoneType}</p>
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN: THE SPOTLIGHT (Loads only ONE large image at a time) */}
        <div className="w-2/3 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex flex-col relative">
          
          {/* Active Roster Display */}
          {activeTab === 'roster' && (
            <>
              <div className="h-2/3 w-full bg-black relative">
                {/* Background gradient overlay to make text pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  key={selectedChar.id} // Forces image to rerender when changing characters
                  src={`${import.meta.env.BASE_URL}${selectedChar.imagePath.slice(1)}`} 
                  alt={selectedChar.name} 
                  className="w-full h-full object-cover object-top animate-fade-in"
                />
              </div>
              <div className="p-6 relative z-20 -mt-16">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-4xl font-black text-white drop-shadow-md">{selectedChar.name}</h2>
                  <div className="flex gap-3 text-lg font-mono bg-slate-800/90 border border-slate-600 px-4 py-2 rounded-lg text-emerald-300 shadow-lg">
                    <span>HP: {selectedChar.baseHealth}</span>
                    <span className="text-slate-500">|</span>
                    <span>ATK: {selectedChar.baseAttack}</span>
                  </div>
                </div>
                
                <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Passive Abilities</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedChar.passives.map(passive => (
                    <div key={passive} className="relative group cursor-help">
                      <span className="bg-indigo-900/80 text-indigo-200 px-3 py-1.5 rounded-lg border border-indigo-500/50 shadow-md transition-colors group-hover:bg-indigo-700 group-hover:text-white">
                        {passive.replace(/_/g, ' ')}
                      </span>
                      {/* THE TOOLTIP */}
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {PASSIVE_DESCRIPTIONS[passive] || "Ability description unknown."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Active Bestiary Display */}
          {activeTab === 'bestiary' && (
            <>
              <div className="h-2/3 w-full bg-black relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  key={selectedEnemy.id} 
                  src={`${import.meta.env.BASE_URL}${selectedEnemy.imagePath.slice(1)}`} 
                  alt={selectedEnemy.name} 
                  className="w-full h-full object-cover object-center animate-fade-in"
                />
              </div>
              <div className="p-6 relative z-20 -mt-16">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-4xl font-black text-rose-300 drop-shadow-md">{selectedEnemy.name}</h2>
                  <div className="flex gap-3 text-lg font-mono bg-rose-950/90 border border-rose-800 px-4 py-2 rounded-lg text-rose-200 shadow-lg">
                    <span>Base HP: {selectedEnemy.baseHealth}</span>
                    <span className="text-rose-800/60">|</span>
                    <span>Base ATK: {selectedEnemy.baseAttack}</span>
                  </div>
                </div>
                
                <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Enemy Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p><strong className="text-rose-400">Biome:</strong> <span className="capitalize">{selectedEnemy.biome}</span></p>
                  <p><strong className="text-rose-400">Zone Type:</strong> <span className="capitalize">{selectedEnemy.zoneType}</span></p>
                  <p><strong className="text-rose-400">Scaling:</strong> +{selectedEnemy.healthPerLevel} HP / +{selectedEnemy.attackPerLevel} ATK per level</p>
                  <p><strong className="text-rose-400">Visual Count:</strong> 1 enemy per {selectedEnemy.hpPerCount} HP</p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}