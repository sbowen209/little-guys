import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/assets';
import { MOUNTS, PLAYER_PRESETS, AVAILABLE_PASSIVES, generateOpponent } from '../data/mounts';
import RaceHistory from './RaceHistory';

export default function RacingSetup({ onBack, onBeginRace }) {
  const [view, setView] = useState('menu'); 

  const [quickRacers, setQuickRacers] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const [quickSkins, setQuickSkins] = useState({});
  const [quickPassives, setQuickPassives] = useState({});

  const [circuitLength, setCircuitLength] = useState(3);
  const [activeTab, setActiveTab] = useState(0);
  const [circuitOpponents, setCircuitOpponents] = useState([]);
  const [heats, setHeats] = useState([]);
  const [isPractice, setIsPractice] = useState(false);
  
  const [playerProfiles, setPlayerProfiles] = useState(() => {
    const saved = localStorage.getItem('playerProfiles');
    if (saved) {
       const parsed = JSON.parse(saved);
       return parsed.map(p => ({
          ...p,
          passives: p.passives || (p.passive && p.passive !== 'none' ? [p.passive] : [])
       }));
    }
    return JSON.parse(JSON.stringify(PLAYER_PRESETS));
  });

  useEffect(() => {
    localStorage.setItem('playerProfiles', JSON.stringify(playerProfiles));
  }, [playerProfiles]);

  useEffect(() => {
    if (view === 'circuit') {
      generateCircuitPool(circuitLength);
    }
  }, [view]);

  const generateCircuitPool = (len) => {
    const aceIndex = Math.floor(Math.random() * len);
    const opps = Array.from({length: len}, (_, i) => generateOpponent(i, i === aceIndex));
    setCircuitOpponents(opps);
    setHeats(Array.from({length: len}, (_, i) => ({
      index: i,
      presetId: 'plum', 
      selectedOppId: null, 
      wager: 100
    })));
  };

  const handleCircuitLengthChange = (len) => {
    setCircuitLength(len);
    generateCircuitPool(len);
    setActiveTab(0);
  };

  const updateHeat = (heatIndex, field, value) => {
    setHeats(prev => {
      const next = [...prev];
      next[heatIndex][field] = value;
      return next;
    });
  };

  const handleProfileEdit = (profileId, field, value) => {
    setPlayerProfiles(prev => prev.map(p => p.id === profileId ? { ...p, [field]: value } : p));
  };

  const assignOpponentToHeat = (heatIndex, oppId) => {
    setHeats(prev => prev.map((heat, idx) => {
      if (idx === heatIndex) return { ...heat, selectedOppId: oppId };
      if (heat.selectedOppId === oppId) return { ...heat, selectedOppId: null };
      return heat;
    }));
  };

  const toggleQuickRacer = (mountId) => {
    setQuickRacers((prev) => {
      if (prev.includes(mountId)) {
        const newStats = { ...quickStats };
        delete newStats[mountId];
        setQuickStats(newStats);
        return prev.filter((id) => id !== mountId);
      }
      if (prev.length < 2) {
        setQuickStats((curr) => ({ ...curr, [mountId]: { ...MOUNTS[mountId].baseStats } }));
        return [...prev, mountId];
      }
      return prev; 
    });
  };

  const startQuickRace = () => {
    const racers = quickRacers.map((id, idx) => {
      const mount = MOUNTS[id];
      const skinId = quickSkins[id] || 'default';
      const skin = mount.skins.find(s => s.id === skinId);
      return {
        isPlayer: true,
        id: `qracer_${idx}`,
        name: skin.name,
        imagePath: skin.imagePath,
        facing: skin.facing,
        racingStats: quickStats[id],
        passives: quickPassives[id] || [],
        level: 1,
        laps: 1
      };
    });
    onBeginRace(racers, 'track_a'); 
  };

  const startCircuit = () => {
    const circuitData = heats.map(heat => {
      const activeProfile = playerProfiles.find(p => p.id === heat.presetId);
      const skin = MOUNTS[activeProfile.mountId].skins.find(s => s.id === activeProfile.skinId);
      const opp = circuitOpponents.find(o => o.id === heat.selectedOppId);

      const pTotal = activeProfile.wins + activeProfile.losses;
      const pW = pTotal > 0 ? activeProfile.wins / pTotal : 0;
      const pS = 2.0 + (activeProfile.level * 1.5) + pW; 

      const oTotal = opp.wins + opp.losses;
      const oW = oTotal > 0 ? opp.wins / oTotal : 0;
      const oS = 2.0 + (opp.level * 1.5) + oW;

      const probPlayer = pS / (pS + oS);
      // Payout nerf: House takes an effective 10% edge 
      const payoutMult = (1 / probPlayer) * 0.9;
      const potential = heat.wager * payoutMult;

      const playerRacer = {
        isPlayer: true,
        presetId: activeProfile.id,
        isPractice: isPractice,
        id: `player_heat_${heat.index}`,
        name: activeProfile.label.split(' (')[0], 
        imagePath: skin.imagePath,
        facing: skin.facing,
        racingStats: { speed: activeProfile.speed, jump: activeProfile.jump, turning: activeProfile.turning },
        passives: activeProfile.passives,
        level: activeProfile.level,
        laps: 1,
        wagerInfo: { amount: heat.wager, potential }
      };

      const oppRacer = {
        isPlayer: false,
        id: opp.id,
        name: opp.name,
        imagePath: opp.imagePath,
        facing: opp.facing,
        racingStats: opp.stats,
        passives: opp.passives,
        level: opp.level,
        laps: 1
      };

      return [playerRacer, oppRacer];
    });

    onBeginRace(circuitData, 'track_a');
  };

  if (view === 'menu') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0d1317] font-sans text-stone-200">
        <div className="flex flex-col gap-8 text-center max-w-5xl w-full px-6">
          <h1 className="font-serif text-6xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] tracking-tighter">
            THE GATEWAY
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <button onClick={() => setView('quick')} className="group relative rounded-3xl border-2 border-stone-700 bg-stone-900 p-10 hover:border-sky-500 hover:bg-stone-800 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(56,189,248,0.2)]">
              <h2 className="font-serif text-4xl font-black text-white group-hover:text-sky-400">Quick Heat</h2>
              <p className="mt-4 text-stone-400 font-mono text-sm leading-relaxed">The original unranked layout. Pick any two mounts from the base roster, customize their stats, and hit the dirt. No stakes attached.</p>
            </button>
            <button onClick={() => setView('circuit')} className="group relative rounded-3xl border-2 border-stone-700 bg-stone-900 p-10 hover:border-amber-500 hover:bg-stone-800 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(251,191,36,0.2)]">
               <h2 className="font-serif text-4xl font-black text-white group-hover:text-amber-400">Wagering Circuit</h2>
               <p className="mt-4 text-stone-400 font-mono text-sm leading-relaxed">Compete against generated AI opponents across a multi-heat circuit. Draft from your customized roster profiles, review odds, and place your bets.</p>
            </button>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button onClick={() => setView('history')} className="group relative w-full md:w-2/3 rounded-3xl border-2 border-stone-700 bg-stone-900 px-10 py-6 hover:border-emerald-500 hover:bg-stone-800 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
               <h2 className="font-serif text-3xl font-black text-white group-hover:text-emerald-400">Race History</h2>
               <p className="mt-2 text-stone-400 font-mono text-sm leading-relaxed">Review past wager resolutions and completed circuit ledgers.</p>
            </button>
          </div>

          <button onClick={onBack} className="mt-8 text-stone-500 font-mono text-sm uppercase tracking-widest hover:text-white transition">Return to Home</button>
        </div>
      </div>
    );
  }

  if (view === 'history') {
    return <RaceHistory onBack={() => setView('menu')} />;
  }

  if (view === 'quick') {
    return (
      <div className="min-h-screen w-full bg-[#0d1317] font-sans text-stone-200 p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <header className="flex justify-between items-end border-b border-stone-800 pb-4">
            <div>
              <h1 className="font-serif text-5xl font-black text-sky-400">QUICK HEAT</h1>
              <p className="font-mono text-xs uppercase text-stone-500 tracking-widest mt-2">Standard 1v1 Exhibition</p>
            </div>
            <button onClick={() => setView('menu')} className="border border-stone-700 bg-stone-900 px-6 py-2 rounded text-xs font-mono uppercase text-stone-400 hover:text-white hover:bg-stone-800">Back to Mode Select</button>
          </header>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-stone-300">Roster Overview</h2>
              <span className={`px-4 py-1 rounded text-xs font-mono font-bold ${quickRacers.length === 2 ? 'bg-sky-500/20 text-sky-400' : 'bg-stone-800 text-stone-400'}`}>
                {quickRacers.length} / 2 Selected
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.values(MOUNTS).map(mount => {
                const isSelected = quickRacers.includes(mount.id);
                const isDisabled = !isSelected && quickRacers.length >= 2;
                return (
                  <button 
                    key={mount.id} 
                    onClick={() => toggleQuickRacer(mount.id)} 
                    disabled={isDisabled}
                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center ${isSelected ? 'border-sky-400 bg-stone-800 shadow-[0_0_20px_rgba(56,189,248,0.2)] -translate-y-2' : isDisabled ? 'border-stone-800 bg-stone-900/40 opacity-50 grayscale' : 'border-stone-700 bg-stone-900 hover:border-stone-500 hover:bg-stone-800 hover:-translate-y-1'}`}
                  >
                    <img src={assetUrl(mount.skins[0].imagePath)} alt={mount.id} className="h-24 object-contain mb-3 drop-shadow-md" />
                    <span className={`font-serif font-black ${isSelected ? 'text-sky-400' : 'text-white'}`}>{mount.skins[0].name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {quickRacers.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-900/50 p-6 rounded-2xl border border-stone-800">
              {quickRacers.map((id, index) => {
                const mount = MOUNTS[id];
                const activeSkinId = quickSkins[id] || 'default';
                const activeSkin = mount.skins.find(s => s.id === activeSkinId);

                return (
                  <div key={id} className="flex gap-6 bg-stone-950 p-6 rounded-xl border border-stone-800">
                    <div className="flex flex-col items-center w-1/3 border-r border-stone-800 pr-6">
                      <span className="text-xs font-mono text-stone-500 uppercase tracking-widest mb-4">Racer {index + 1}</span>
                      <img src={assetUrl(activeSkin.imagePath)} alt="mount" className="h-32 object-contain drop-shadow-md mb-4" />
                      
                      {mount.skins.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {mount.skins.map(s => (
                            <button key={s.id} onClick={() => setQuickSkins(prev => ({...prev, [id]: s.id}))} className={`w-8 h-8 rounded-full border-2 bg-stone-900 p-0.5 ${activeSkinId === s.id ? 'border-sky-400 scale-110' : 'border-stone-700 opacity-60 hover:opacity-100'}`}>
                              <img src={assetUrl(s.imagePath)} alt={s.name} className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col w-2/3 pl-2 gap-4">
                      {['speed', 'jump', 'turning'].map(stat => (
                        <div key={stat} className="flex items-center gap-3">
                          <span className="w-16 text-[10px] font-mono font-bold uppercase text-stone-400">{stat}</span>
                          <input 
                            type="range" min="1" max="40" 
                            value={quickStats[id]?.[stat] || 15} 
                            onChange={(e) => setQuickStats(prev => ({...prev, [id]: { ...prev[id], [stat]: parseInt(e.target.value) }}))}
                            className="flex-1 custom-slider h-2 rounded-full appearance-none bg-stone-900 border border-stone-700"
                          />
                          <span className="w-6 text-right font-mono text-sm text-white">{quickStats[id]?.[stat]}</span>
                        </div>
                      ))}
                      
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">Passive Abilities</span>
                        <div className="flex flex-wrap gap-1">
                          {AVAILABLE_PASSIVES.map(p => {
                            const isSelected = (quickPassives[id] || []).includes(p.id);
                            return (
                              <button 
                                key={p.id} 
                                onClick={() => {
                                  setQuickPassives(prev => {
                                    const curr = prev[id] || [];
                                    return { ...prev, [id]: isSelected ? curr.filter(x => x !== p.id) : [...curr, p.id] };
                                  });
                                }}
                                className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border transition-colors ${isSelected ? 'bg-sky-500/20 text-sky-400 border-sky-500/50' : 'bg-stone-900 text-stone-500 border-stone-700 hover:border-stone-500'}`}
                              >
                                {p.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          <div className="flex justify-center mt-8">
            <button disabled={quickRacers.length !== 2} onClick={startQuickRace} className="px-16 py-6 bg-sky-600 hover:bg-sky-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-black text-xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:shadow-none">
              Start Exhibition
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'circuit' && heats.length > 0) {
    const currentHeat = heats[activeTab];
    const activeProfile = playerProfiles.find(p => p.id === currentHeat.presetId);
    const activeSkinData = MOUNTS[activeProfile.mountId].skins.find(s => s.id === activeProfile.skinId);
    const selectedOpp = circuitOpponents.find(o => o.id === currentHeat.selectedOppId);
    const allHeatsReady = heats.every(h => h.selectedOppId !== null);

    let oddsData = null;
    if (selectedOpp) {
      const pW = (activeProfile.wins + activeProfile.losses) > 0 ? activeProfile.wins / (activeProfile.wins + activeProfile.losses) : 0;
      const pS = 2.0 + (activeProfile.level * 1.5) + pW;
      
      const oW = (selectedOpp.wins + selectedOpp.losses) > 0 ? selectedOpp.wins / (selectedOpp.wins + selectedOpp.losses) : 0;
      const oS = 2.0 + (selectedOpp.level * 1.5) + oW;
      const probPlayer = pS / (pS + oS);
      
      // Payout nerf logic implemented here
      const nerfedMult = (1 / probPlayer) * 0.9;
      oddsData = { prob: probPlayer, mult: nerfedMult, potential: currentHeat.wager * nerfedMult };
    }

    return (
      <div className="min-h-screen w-full bg-[#0d1317] font-sans text-stone-200 p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          
          <header className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-stone-800 pb-4 gap-4">
            <div>
              <h1 className="font-serif text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">WAGERING CIRCUIT</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs uppercase text-stone-500 tracking-widest">Total Heats:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(num => (
                      <button key={num} onClick={() => handleCircuitLengthChange(num)} className={`w-8 h-8 rounded border flex items-center justify-center font-black ${circuitLength === num ? 'bg-amber-500 text-stone-950 border-amber-400' : 'bg-stone-900 border-stone-700 text-stone-400 hover:bg-stone-800'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-6 border-l border-stone-800 pl-6">
                  <span className="font-mono text-xs uppercase text-stone-500 tracking-widest">Practice Mode:</span>
                  <button onClick={() => setIsPractice(!isPractice)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isPractice ? 'bg-amber-500' : 'bg-stone-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isPractice ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setView('menu')} className="border border-stone-700 bg-stone-900 px-6 py-3 rounded-lg text-xs font-mono uppercase text-stone-400 hover:text-white hover:bg-stone-800">Back</button>
              <button disabled={!allHeatsReady} onClick={startCircuit} className="bg-amber-500 disabled:bg-stone-800 text-stone-950 disabled:text-stone-600 px-8 py-3 rounded-lg text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.4)] disabled:shadow-none hover:bg-amber-400 transition">Start Circuit</button>
            </div>
          </header>

          <div className="flex gap-2 border-b border-stone-800">
            {heats.map((heat, idx) => (
              <button 
                key={idx} onClick={() => setActiveTab(idx)} 
                className={`px-8 py-4 font-mono font-bold uppercase tracking-widest border-b-4 transition-all ${activeTab === idx ? 'border-amber-400 text-amber-400 bg-stone-900/50' : 'border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900/30'} flex items-center gap-3`}
              >
                Heat {idx + 1}
                {heat.selectedOppId && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 animate-[fadeIn_0.3s_ease-out]">
            
            <section className="lg:col-span-4 flex flex-col gap-4">
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-stone-950 text-[10px]">1</span> Your Mount
              </h2>
              <div className="rounded-2xl border-2 border-stone-700 bg-stone-900/80 p-6 shadow-xl flex flex-col gap-6 relative">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-stone-500">Roster Profile</label>
                  <select 
                    value={currentHeat.presetId}
                    onChange={(e) => updateHeat(activeTab, 'presetId', e.target.value)}
                    className="bg-stone-950 border border-stone-700 rounded-lg p-3 font-serif text-xl text-white outline-none focus:border-amber-500"
                  >
                    {playerProfiles.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>

                <div className="flex justify-center h-32 py-2">
                  <img src={assetUrl(activeSkinData.imagePath)} alt="mount" className="h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] font-mono text-stone-500 uppercase mb-2">Record</span>
                      <div className="flex items-center gap-2">
                         <input type="number" min="0" value={activeProfile.wins} onChange={(e)=>handleProfileEdit(activeProfile.id, 'wins', parseInt(e.target.value)||0)} className="w-10 bg-transparent text-emerald-400 font-mono font-bold text-center border-b border-stone-700 focus:border-emerald-400 outline-none"/>
                         <span className="text-stone-500">-</span>
                         <input type="number" min="0" value={activeProfile.losses} onChange={(e)=>handleProfileEdit(activeProfile.id, 'losses', parseInt(e.target.value)||0)} className="w-10 bg-transparent text-rose-400 font-mono font-bold text-center border-b border-stone-700 focus:border-rose-400 outline-none"/>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] font-mono text-stone-500 uppercase mb-2">Level</span>
                      <div className="flex items-center gap-2">
                         <button onClick={() => handleProfileEdit(activeProfile.id, 'level', Math.max(1, activeProfile.level - 1))} className="w-6 h-6 rounded bg-stone-900 border border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-400 font-bold flex items-center justify-center transition-colors">-</button>
                         <span className="w-8 text-center text-white font-serif font-black text-xl">{activeProfile.level}</span>
                         <button onClick={() => handleProfileEdit(activeProfile.id, 'level', activeProfile.level + 1)} className="w-6 h-6 rounded bg-stone-900 border border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-400 font-bold flex items-center justify-center transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 text-center flex flex-col items-center">
                    <span className="text-[10px] font-mono text-stone-500 uppercase mb-2">Passives</span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {AVAILABLE_PASSIVES.map(p => {
                        const isSelected = activeProfile.passives.includes(p.id);
                        return (
                          <button 
                            key={p.id}
                            onClick={() => {
                              const next = isSelected ? activeProfile.passives.filter(x => x !== p.id) : [...activeProfile.passives, p.id];
                              handleProfileEdit(activeProfile.id, 'passives', next);
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border transition-colors ${isSelected ? 'bg-sky-500/20 text-sky-400 border-sky-500/50' : 'bg-stone-900 text-stone-500 border-stone-700 hover:border-stone-500'}`}
                          >
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-stone-950 border border-stone-800 rounded-lg p-4">
                  {['speed', 'jump', 'turning'].map(stat => (
                    <div key={stat} className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-stone-500 uppercase">{stat}</span>
                      <input 
                         type="number" min="1" max="40"
                         value={activeProfile[stat]} 
                         onChange={(e)=>handleProfileEdit(activeProfile.id, stat, Math.max(1, parseInt(e.target.value)||1))}
                         className="w-16 bg-transparent text-center font-serif font-black text-2xl text-white outline-none border-b-2 border-stone-800 focus:border-amber-400 mt-1" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="lg:col-span-4 flex flex-col gap-4">
               <div className="flex justify-between items-end">
                <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-stone-950 text-[10px]">2</span> Select Opponent
                </h2>
                <button onClick={() => generateCircuitPool(circuitLength)} className="text-[10px] font-mono font-bold uppercase text-stone-500 hover:text-white transition">↻ Refresh Pool</button>
              </div>
              
              <div className="flex flex-col gap-3">
                {circuitOpponents.map(opp => {
                  const isSelectedForThisHeat = currentHeat.selectedOppId === opp.id;
                  const assignedHeatIndex = heats.findIndex(h => h.selectedOppId === opp.id);
                  const isAssignedElsewhere = assignedHeatIndex !== -1 && assignedHeatIndex !== activeTab;
                  const totalRaces = opp.wins + opp.losses;
                  const winPct = totalRaces > 0 ? ((opp.wins / totalRaces) * 100).toFixed(0) : 0;

                  return (
                    <button 
                      key={opp.id} 
                      onClick={() => assignOpponentToHeat(activeTab, opp.id)}
                      className={`relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${isSelectedForThisHeat ? 'border-emerald-400 bg-stone-800 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02] z-10' : isAssignedElsewhere ? 'border-stone-800 bg-stone-900/40 opacity-60' : 'border-stone-800 bg-stone-900/60 hover:border-stone-600 hover:bg-stone-800'}`}
                    >
                      <img src={assetUrl(opp.imagePath)} alt={opp.name} className={`h-16 w-16 object-contain drop-shadow-md ${isAssignedElsewhere ? 'grayscale' : ''}`} />
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-serif text-lg font-black ${isSelectedForThisHeat ? 'text-emerald-400' : 'text-white'}`}>{opp.name}</h3>
                          {isAssignedElsewhere && <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-stone-800 border border-stone-600 text-stone-400 px-2 py-0.5 rounded">Heat {assignedHeatIndex + 1}</span>}
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono mt-1 items-center">
                          <span className={`border border-stone-700 rounded px-1.5 bg-stone-950 font-bold ${opp.level >= 6 ? 'text-amber-400' : 'text-stone-400'}`}>Lvl {opp.level}</span>
                          {opp.isAce && <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-amber-900/30 text-amber-400 px-1 rounded border border-amber-800">ACE</span>}
                          <span className="text-emerald-400 ml-1">{opp.wins} W</span>
                          <span className="text-rose-400">{opp.losses} L</span>
                        </div>
                        <div className="flex justify-between mt-1.5 items-end">
                           <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Win Rate: <span className="text-white">{winPct}%</span></span>
                        </div>
                        {opp.passives.length > 0 && (
                           <div className="flex flex-wrap gap-1 mt-2 justify-end">
                             {opp.passives.map(p => (
                               <span key={p} className="text-[8px] font-mono text-sky-400 font-bold uppercase tracking-widest bg-sky-900/30 px-1 rounded border border-sky-800">⭐ {p.replace('_', ' ')}</span>
                             ))}
                           </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="lg:col-span-4 flex flex-col gap-4">
               <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-stone-950 text-[10px]">3</span> Lock Wager
               </h2>
               {selectedOpp && oddsData ? (
                <div className="rounded-2xl border-2 border-amber-500/50 bg-stone-900/90 p-6 shadow-[0_0_30px_rgba(251,191,36,0.1)] flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl border border-stone-800">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono uppercase text-stone-500 mb-1">Win Prob</span>
                      <span className="font-serif text-3xl font-black text-sky-400">{(oddsData.prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-10 w-px bg-stone-700" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono uppercase text-stone-500 mb-1">Payout Mult</span>
                      <span className="font-serif text-3xl font-black text-emerald-400">{oddsData.mult.toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold uppercase text-stone-400 text-center">Wager Amount ($)</label>
                    <input 
                      type="number" min="1" 
                      value={currentHeat.wager} 
                      onChange={(e) => updateHeat(activeTab, 'wager', parseInt(e.target.value) || 0)}
                      className="w-full bg-stone-950 border-2 border-amber-500/50 rounded-xl p-4 text-3xl font-black font-serif text-white text-center focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center border-t border-stone-800 pt-5 mt-2">
                    <span className="text-sm font-mono uppercase text-stone-400">Potential Return:</span>
                    <span className="text-4xl font-serif font-black text-amber-400">${oddsData.potential.toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/30 p-8 text-center">
                  <span className="font-mono text-xs uppercase text-stone-500 leading-relaxed">Select an unassigned opponent from the Matchmaking Pool to view odds and place your wager for Heat {activeTab + 1}.</span>
                </div>
              )}
            </section>

          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn { 0%{opacity:0; transform:translateY(10px)} 100%{opacity:1; transform:translateY(0)} }
          .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; cursor: pointer; background: #fbbf24; border: 2px solid #1c1917; }
          .custom-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; cursor: pointer; background: #fbbf24; border: 2px solid #1c1917; }
        `}} />
      </div>
    );
  }

  return null;
}