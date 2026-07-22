import { memo } from 'react';
import { statusDef } from '../data/index.js';

/**
 * Turn number, and how close the match is to Stagnation.
 *
 * Stagnation is the anti-stall valve: a counter ticks up every turn in which
 * neither side loses health, and when it reaches the threshold both active pets
 * take a stack of DEF reduction. It is the one rule whose state is otherwise
 * completely invisible — you cannot read "four more quiet turns and both pets
 * start crumbling" off the board — so it gets a readout.
 *
 * The pips fill as the stall builds and empty the moment anyone takes damage.
 * Once the first stack lands the threshold tightens from 6 turns to 2, and the
 * pip row shortens to match, which shows the screws turning.
 */
function TurnCounter({ turn, stagnation }) {
  const { counter, threshold, stacks } = stagnation;
  const remaining = Math.max(0, threshold - counter);
  const def = statusDef('stagnation');
  const urgent = remaining <= 1;

  return (
    <div className="pb-turn">
      {/* Clamped: the opening beats happen before turn 1 has started. */}
      <span className="pb-turn__n">T{Math.max(1, turn)}</span>

      <div className="pb-turn__stall">
        <div className="pb-turn__pips">
          {Array.from({ length: threshold }).map((_, i) => (
            <span key={i} className={`pb-turn__pip ${i < counter ? 'is-on' : ''}`} />
          ))}
        </div>
        <span className={`pb-turn__label ${urgent ? 'is-urgent' : ''}`}>
          {def.icon} {stacks > 0 ? `×${stacks} · ` : ''}
          {remaining === 0 ? 'NOW' : `IN ${remaining}`}
        </span>
      </div>
    </div>
  );
}

export default memo(TurnCounter);
