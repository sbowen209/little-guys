import { useState, useEffect } from 'react';
import { ROSTER } from '../data/characters';
import { ENEMIES } from '../data/enemies';

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

  const [activeTab, setActiveTab] = useState('roster');
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const [selectedEnemy, setSelectedEnemy] = useState(enemies[0]);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset image loading state when selection changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [selectedChar, selectedEnemy, activeTab]);

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[95vh] pt-4">
      
      {/* HEADER - Premium Glow Effect */}
      <header className="flex justify-between items-center shrink-0 mb-8 px-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-emerald-300 to-teal-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            LITTLE GUYS
          </h1>
          <p className="text-slate-400 font-mono text-sm tracking-widest uppercase mt-1">Campaign Companion</p>
        </div>
        <button 
          onClick={onStartRun}
          className="relative group px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 rounded-xl font-bold uppercase tracking-widest transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          Initialize Run
        </button>
      </header>

      {/* TABS - Sleek Pill Design */}
      <div className="flex gap-2 mb-6 shrink-0 px-4">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`px-8 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'roster' ? 'bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-slate-700'}`}
        >
          OPERATIVES
        </button>
        <button 
          onClick={() => setActiveTab('bestiary')}
          className={`px-8 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'bestiary' ? 'bg-rose-500 text-slate-900 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-slate-700'}`}
        >
          BESTIARY
        </button>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-grow flex gap-6 overflow-hidden px-4">
        
        {/* LEFT COLUMN: THE LIST (Glassmorphic ID Cards) */}
        <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-4 custom-scrollbar pb-10">
          {activeTab === 'roster' && characters.map((char) => (
            <button 
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className={`relative p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden group ${selectedChar.id === char.id ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-600'} border backdrop-blur-md`}
            >
              <div className="relative z-10">
                <h3 className={`text-xl font-black tracking-wide ${selectedChar.id === char.id ? 'text-emerald-300' : 'text-slate-200'}`}>{char.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{char.description}</p>
              </div>
              {selectedChar.id === char.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] rounded-r-2xl"></div>
              )}
            </button>
          ))}

          {activeTab === 'bestiary' && enemies.map((enemy) => (
            <button 
              key={enemy.id}
              onClick={() => setSelectedEnemy(enemy)}
              className={`relative p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden group ${selectedEnemy.id === enemy.id ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)] scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-600'} border backdrop-blur-md`}
            >
              <div className="relative z-10">
                <h3 className={`text-xl font-black tracking-wide ${selectedEnemy.id === enemy.id ? 'text-rose-300' : 'text-slate-200'}`}>{enemy.name}</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">{enemy.biome} • {enemy.zoneType}</p>
              </div>
              {selectedEnemy.id === enemy.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] rounded-r-2xl"></div>
              )}
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN: THE SPOTLIGHT */}
        <div className="w-2/3 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden flex flex-col relative shadow-2xl">
          
          {/* Active Roster Display */}
          {activeTab === 'roster' && (
            <>
              <div className="h-[60%] w-full relative bg-slate-950 flex items-center justify-center">
                {/* Image Skeleton Loader */}
                {isImageLoading && (
                  <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  key={selectedChar.id} 
                  src={`${import.meta.env.BASE_URL}${selectedChar.imagePath.slice(1)}`} 
                  alt={selectedChar.name} 
                  onLoad={() => setIsImageLoading(false)}
                  className={`w-full h-full object-cover object-top transition-opacity duration-700 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>
              
              <div className="p-8 relative z-20 -mt-20 flex-grow flex flex-col">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-5xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tight">{selectedChar.name}</h2>
                    <p className="text-emerald-400/80 font-mono text-sm tracking-widest mt-2 uppercase">Classified Operative</p>
                  </div>
                  
                  {/* Premium Stats Pill */}
                  <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-2xl shadow-xl">
                    <div className="text-center">
                      <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Health</span>
                      <span className="text-2xl font-black text-emerald-400">{selectedChar.baseHealth}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-700/50"></div>
                    <div className="text-center">
                      <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Attack</span>
                      <span className="text-2xl font-black text-emerald-400">{selectedChar.baseAttack}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Innate Passives</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedChar.passives.map(passive => (
                      <div key={passive} className="relative group cursor-help">
                        <div className="bg-slate-800/80 backdrop-blur-sm text-slate-200 px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg transition-all duration-300 group-hover:border-emerald-500/50 group-hover:bg-slate-800 group-hover:-translate-y-1">
                          <span className="font-mono text-sm text-emerald-300 mr-2">✦</span>
                          {passive.replace(/_/g, ' ')}
                        </div>
                        
                        {/* Enhanced Tooltip */}
                        <div className="absolute bottom-full left-0 mb-3 w-72 bg-slate-900/95 backdrop-blur-xl text-slate-300 text-sm p-4 rounded-xl border border-emerald-500/30 shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-50">
                          {PASSIVE_DESCRIPTIONS[passive] || "Ability description unknown."}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active Bestiary Display */}
          {activeTab === 'bestiary' && (
            <>
              <div className="h-[60%] w-full relative bg-slate-950 flex items-center justify-center">
                {isImageLoading && (
                  <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  key={selectedEnemy.id} 
                  src={`${import.meta.env.BASE_URL}${selectedEnemy.imagePath.slice(1)}`} 
                  alt={selectedEnemy.name} 
                  onLoad={() => setIsImageLoading(false)}
                  className={`w-full h-full object-cover object-center transition-opacity duration-700 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>
              
              <div className="p-8 relative z-20 -mt-20 flex-grow flex flex-col">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-5xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tight">{selectedEnemy.name}</h2>
                    <p className="text-rose-400/80 font-mono text-sm tracking-widest mt-2 uppercase">Hostile Entity</p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-2xl shadow-xl">
                    <div className="text-center">
                      <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Base HP</span>
                      <span className="text-2xl font-black text-rose-400">{selectedEnemy.baseHealth}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-700/50"></div>
                    <div className="text-center">
                      <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Base ATK</span>
                      <span className="text-2xl font-black text-rose-400">{selectedEnemy.baseAttack}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Habitat</span>
                    <span className="text-slate-200 capitalize font-medium">{selectedEnemy.biome} <span className="text-slate-600 mx-2">/</span> {selectedEnemy.zoneType}</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Scaling Threat</span>
                    <span className="text-rose-300 font-medium">+{selectedEnemy.healthPerLevel} HP & +{selectedEnemy.attackPerLevel} ATK / Lvl</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm col-span-2 flex justify-between items-center">
                    <div>
                      <span className="block text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Swarm Density</span>
                      <span className="text-slate-300 font-medium">Visualizes as 1 entity per <span className="text-white font-bold">{selectedEnemy.hpPerCount} HP</span></span>
                    </div>
                    <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-bold tracking-wide">
                      {selectedEnemy.ability.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}