import { memo } from 'react';
import { statusDef } from '../data/index.js';

/**
 * What is currently stuck to a pet, stacked down its outer flank.
 *
 * These used to be little chips inside the nameplate, which meant checking
 * whether something was burning pulled your eye down and away from the fight.
 * Out here they sit beside the sprite at a size you can read peripherally, and
 * they render *behind* the sprite layer so a big attack animation passes in
 * front of them rather than being cropped by them.
 */

function StatusFlank({ pet, side }) {
  const shown = pet.statuses;
  if (!shown.length) return null;

  return (
    <div className={`pb-flank pb-flank--${side === 0 ? 'p1' : 'p2'}`} aria-hidden="true">
      {shown.slice(0, 5).map(({ id, stacks }) => {
        const def = statusDef(id);
        return (
          <div key={id} className="pb-flank__item" style={{ '--tone': def.tone }}>
            <span className="pb-flank__icon">{def.icon}</span>
            {stacks > 1 && <span className="pb-flank__count">{stacks}</span>}

            {/* Hover card. Built rather than using `title` so it appears
                instantly and can carry the stack count and full rules text. */}
            <div className="pb-flank__tip">
              <span className="pb-flank__tipname">
                {def.name}{stacks > 1 ? ` ×${stacks}` : ''}
              </span>
              <span className="pb-flank__tipdesc">{def.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(StatusFlank);
