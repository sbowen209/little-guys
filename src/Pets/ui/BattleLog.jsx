import { memo, useMemo } from 'react';
import { isLogged, logFor } from './describe.js';

const MAX_LINES = 16;

/**
 * Scrollback of what just happened. Built by walking backwards from the cursor
 * until enough loggable events are found, so the cost is bounded no matter how
 * long the match runs.
 */
function BattleLog({ timeline, index }) {
  const lines = useMemo(() => {
    const out = [];
    for (let i = index; i >= 0 && out.length < MAX_LINES; i -= 1) {
      const event = timeline[i];
      if (!isLogged(event)) continue;
      const text = logFor(event);
      if (text) out.push({ id: event.id, text });
    }
    return out;
  }, [timeline, index]);

  return (
    <div className="pb-log pb-interactive">
      {/* column-reverse keeps the newest line pinned to the bottom edge */}
      {lines.map((line) => (
        <div key={line.id} className="pb-log__line">{line.text}</div>
      ))}
    </div>
  );
}

export default memo(BattleLog);
