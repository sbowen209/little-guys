import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { simulateBattle } from '../engine/simulate.js';
import { randomSeed } from '../engine/rng.js';
import { EV } from '../engine/events.js';
import { useBattlePlayback } from '../hooks/useBattlePlayback.js';
import {
  animationsFor, currentAction, currentTurnNumber, currentTurnSide,
  floatsFor, isRanged, projectileStyle, tickerFor,
} from './describe.js';
import ArenaBackdrop from './ArenaBackdrop.jsx';
import PetSprite from './PetSprite.jsx';
import CombatantPanel from './CombatantPanel.jsx';
import BenchStrip from './BenchStrip.jsx';
import RollCards from './RollCards.jsx';
import ControlBar from './ControlBar.jsx';
import BattleLog from './BattleLog.jsx';
import { OpeningSplash, ResultOverlay } from './Overlays.jsx';
import './battle.css';

const STAGE_W = 1600;
const STAGE_H = 900;

/** Fits the fixed 1600x900 stage into whatever space it is given. */
function useStageScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / STAGE_W, height / STAGE_H) || 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, scale];
}

const isShakeEvent = (event) => event?.type === EV.IMPACT && (event.lethal || event.amount >= 2);

/**
 * Owns the seed and nothing else. Each rematch produces a new `result`, and
 * keying the stage on it remounts the playback state instead of unwinding it.
 */
export default function BattleArena({ battleConfig, onExit }) {
  const [seed, setSeed] = useState(() => randomSeed());
  const rematch = useCallback(() => setSeed(randomSeed()), []);

  // The whole match resolves here, synchronously and up front. Everything below
  // this line is presentation replaying a finished recording.
  const result = useMemo(() => {
    if (!battleConfig) return null;
    return simulateBattle({ team1: battleConfig.team1, team2: battleConfig.team2, seed });
  }, [battleConfig, seed]);

  if (!result) return null;
  return <BattleStage key={seed} result={result} onRematch={rematch} onExit={onExit} />;
}

function BattleStage({ result, onRematch, onExit }) {
  const [showLog, setShowLog] = useState(false);
  const [stageRef, scale] = useStageScale();

  const playback = useBattlePlayback(result);
  const { timeline, index, event, state, speed, paused, finished, progress } = playback;

  /* Camera shake. Two identical CSS variants alternate so consecutive hits
     both restart the animation without remounting anything. */
  const [shake, setShake] = useState(null);
  const shakeFlip = useRef(false);
  useEffect(() => {
    if (!isShakeEvent(event)) return;
    shakeFlip.current = !shakeFlip.current;
    setShake(shakeFlip.current ? 'a' : 'b');
  }, [event]);

  const { togglePaused, setSpeed, step, skipToEnd } = playback;
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); togglePaused(); }
      else if (e.key === '1') setSpeed(1);
      else if (e.key === '2') setSpeed(2);
      else if (e.key === '4') setSpeed(4);
      else if (e.key === '8') setSpeed(8);
      else if (e.key === 'ArrowRight') step();
      else if (e.key === 'Escape') onExit?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePaused, setSpeed, step, onExit]);

  const toggleLog = useCallback(() => setShowLog((value) => !value), []);

  const action = useMemo(() => (timeline ? currentAction(timeline, index) : null), [timeline, index]);
  const anims = useMemo(() => animationsFor(event, action), [event, action]);
  const floats = useMemo(() => floatsFor(event), [event]);
  const ticker = useMemo(() => tickerFor(event), [event]);
  const turnSide = useMemo(() => (timeline ? currentTurnSide(timeline, index) : null), [timeline, index]);
  const turnNumber = useMemo(() => (timeline ? currentTurnNumber(timeline, index) : 1), [timeline, index]);

  if (!state) return null;

  const leads = [state.teams[0][state.lead[0]], state.teams[1][state.lead[1]]];
  const showProjectile = event.type === EV.ROLL && action && isRanged(action.vfx) && !action.effect;
  const showSpark = event.type === EV.IMPACT && event.fromAttack;
  const showFlash = event.type === EV.IMPACT && event.lethal;

  return (
    <div className="pb-root" style={{ '--sp': speed }}>
      <div className="pb-stage" ref={stageRef}>
        <div className="pb-canvas" style={{ transform: `scale(${scale})` }}>
          <div className={`pb-shake ${shake ? `pb-shake--${shake}` : ''}`}>

            <ArenaBackdrop />

            {/* ── FIELD ──────────────────────────────────────────── */}
            <div className="pb-layer">
              {[0, 1].map((side) => (
                <PetSprite
                  key={`${side}-${leads[side].instanceId}`}
                  pet={leads[side]}
                  side={side}
                  anim={anims[side]}
                  isActive={turnSide === side}
                />
              ))}

              {showProjectile && (
                <div
                  key={`bolt-${event.id}`}
                  className={`pb-bolt ${action.side === 1 ? 'pb-bolt--l' : ''}`}
                  style={{ background: projectileStyle(action.vfx) }}
                />
              )}

              {showSpark && (
                <div
                  key={`spark-${event.id}`}
                  className={`pb-spark pb-spark--${event.side === 0 ? 'p1' : 'p2'}`}
                />
              )}

              {showFlash && <div key={`flash-${event.id}`} className="pb-flash" />}
            </div>

            {/* ── UI ─────────────────────────────────────────────── */}
            <div className="pb-layer pb-layer--ui">
              {[0, 1].map((side) => (
                <CombatantPanel
                  key={side}
                  pet={leads[side]}
                  side={side}
                  isActive={turnSide === side}
                  damageFlash={event.type === EV.IMPACT && event.side === side}
                />
              ))}

              <div className="pb-banner">
                <div className="pb-banner__turn">
                  <span
                    className={`pb-dot ${turnSide === 0 ? 'pb-dot--on' : ''}`}
                    style={turnSide === 0 ? { background: 'var(--p1)', boxShadow: '0 0 12px var(--p1)' } : undefined}
                  />
                  <span>Turn {turnNumber}</span>
                  <span
                    className={`pb-dot ${turnSide === 1 ? 'pb-dot--on' : ''}`}
                    style={turnSide === 1 ? { background: 'var(--p2)', boxShadow: '0 0 12px var(--p2)' } : undefined}
                  />
                </div>
                {ticker && (
                  <div key={event.id} className={`pb-ticker ${ticker.hot ? 'pb-ticker--hot' : ''}`}>
                    {ticker.text}
                  </div>
                )}
              </div>

              {event.type === EV.ROLL && <RollCards event={event} />}

              {floats.map((float, i) => (
                <div
                  key={`${event.id}-${i}`}
                  className={`pb-float pb-float--${float.side === 0 ? 'p1' : 'p2'} pb-float--${float.size}`}
                  style={{ color: float.tone, textShadow: `0 0 26px ${float.tone}, 0 6px 18px rgba(0,0,0,0.9)` }}
                >
                  {float.text}
                </div>
              ))}

              {[0, 1].map((side) => (
                <BenchStrip key={side} team={state.teams[side]} lead={state.lead[side]} side={side} />
              ))}

              {showLog && <BattleLog timeline={timeline} index={index} />}

              <ControlBar
                speed={speed}
                paused={paused}
                showLog={showLog}
                progress={progress}
                onSpeed={setSpeed}
                onTogglePause={togglePaused}
                onStep={step}
                onSkip={skipToEnd}
                onToggleLog={toggleLog}
                onExit={onExit}
              />

              {event.type === EV.BATTLE_START && <OpeningSplash state={state} />}

              {finished && (
                <ResultOverlay
                  outcome={result.outcome}
                  state={timeline[timeline.length - 1].state}
                  onRematch={onRematch}
                  onExit={onExit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
