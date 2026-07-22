import { memo } from 'react';
import { SPEEDS } from '../hooks/useBattlePlayback.js';

/** Playback transport. The simulation is already resolved; this only paces it. */
function ControlBar({ speed, paused, showLog, progress, onSpeed, onTogglePause, onStep, onSkip, onToggleLog, onExit }) {
  return (
    <>
      <div className="pb-controls pb-interactive">
        <button className="pb-btn" onClick={onTogglePause} title={paused ? 'Resume' : 'Pause'}>
          {paused ? '▶ Play' : '❚❚ Pause'}
        </button>
        <button className="pb-btn pb-btn--ghost" onClick={onStep} title="Advance one beat">
          ⏭ Step
        </button>

        <span className="pb-controls__sep" />
        <span className="pb-controls__label">Speed</span>
        {SPEEDS.map((value) => (
          <button
            key={value}
            className={`pb-btn ${speed === value ? 'pb-btn--on' : ''}`}
            onClick={() => onSpeed(value)}
          >
            {value}x
          </button>
        ))}

        <span className="pb-controls__sep" />
        <button className={`pb-btn ${showLog ? 'pb-btn--on' : 'pb-btn--ghost'}`} onClick={onToggleLog}>
          Log
        </button>
        <button className="pb-btn pb-btn--ghost" onClick={onSkip}>Skip</button>
        <button className="pb-btn pb-btn--ghost" onClick={onExit}>Exit</button>
      </div>

      <div className="pb-scrub">
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </>
  );
}

export default memo(ControlBar);
