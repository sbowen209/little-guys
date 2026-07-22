import { memo } from 'react';
import { SPEEDS } from '../hooks/useBattlePlayback.js';

/**
 * Playback transport. The simulation is already resolved; this only paces it.
 * Pared back to icons and a segmented speed control so it reads as a thin strip
 * rather than a second HUD competing with the arena.
 */
function ControlBar({ speed, paused, showLog, onSpeed, onTogglePause, onStep, onSkip, onToggleLog, onExit }) {
  return (
    <div className="pb-controls pb-interactive">
      <button className="pb-btn pb-btn--icon" onClick={onTogglePause} title={paused ? 'Play (Space)' : 'Pause (Space)'}>
        {paused ? '▶' : '❚❚'}
      </button>
      <button className="pb-btn pb-btn--icon" onClick={onStep} title="Step one beat (→)">⇥</button>

      <div className="pb-speed">
        {SPEEDS.map((value) => (
          <button
            key={value}
            className={`pb-speed__opt ${speed === value ? 'pb-speed__opt--on' : ''}`}
            onClick={() => onSpeed(value)}
            title={`${value}x speed`}
          >
            {value}×
          </button>
        ))}
      </div>

      <button className={`pb-btn pb-btn--icon ${showLog ? 'pb-btn--on' : ''}`} onClick={onToggleLog} title="Battle log">☰</button>
      <button className="pb-btn pb-btn--icon" onClick={onSkip} title="Skip to result">⏭</button>
      <button className="pb-btn pb-btn--icon" onClick={onExit} title="Exit (Esc)">✕</button>
    </div>
  );
}

export default memo(ControlBar);
