import { ROSTER } from '../data/characters';

export default function MainMenu({ onStartRun }) {
  // Convert our ROSTER object into an array so we can map over it
  const characters = Object.values(ROSTER);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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

      <div className="mt-16">
        <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 mb-6">Your Roster</h2>
        
        {/* Responsive Grid for Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{characters.map((char) => (
  <div key={char.id} className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col hover:border-emerald-500/50 transition-colors overflow-hidden">
    
    {/* Render the default portrait */}
    <div className="h-64 w-full bg-slate-900 overflow-hidden">
      <img 
        src={char.imagePath} 
        alt={char.name} 
        className="w-full h-full object-cover object-top"
      />
    </div>

    {/* The rest of the text content below the image */}
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
            {passive.replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  </div>
))}
        </div>
      </div>
    </div>
  );
}