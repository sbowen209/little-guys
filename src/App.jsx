import { useState } from 'react';
import MainMenu from './views/MainMenu';

function App() {
  // We will expand this later to include 'setup', 'run', and 'battle'
  const [currentView, setCurrentView] = useState('menu');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      {currentView === 'menu' && (
        <MainMenu onStartRun={() => setCurrentView('setup')} />
      )}
      
      {/* Placeholder for the next screen */}
      {currentView === 'setup' && (
        <div className="max-w-4xl mx-auto mt-10">
          <h1 className="text-3xl font-bold mb-4">Run Setup</h1>
          <button 
            onClick={() => setCurrentView('menu')}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;