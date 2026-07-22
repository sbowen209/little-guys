import { memo } from 'react';
import { RULES } from '../data/index.js';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/**
 * Name, hearts and charge, sitting on the sand under the pet with no panel
 * around them.
 *
 * The box is gone deliberately: a bordered card at the feet of every pet drew a
 * hard rectangle across the action twice over. Hearts and the charge bar carry
 * their own shape, and a text shadow is enough to hold them against bright
 * sand. Statuses moved out to the flank (see StatusFlank).
 */
function PetNameplate({ pet, side, isActive, damageFlash }) {
  const ready = pet.spc >= RULES.SPC_CAP;

  return (
    <div className={`pb-plate pb-plate--${side === 0 ? 'p1' : 'p2'} ${isActive ? 'is-active' : ''}`}>
      <div className={`pb-plate__hearts ${damageFlash ? 'is-hit' : ''}`}>
        {Array.from({ length: pet.maxHp }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`pb-hp ${i < pet.hp ? 'is-full' : 'is-empty'} ${damageFlash && i === pet.hp ? 'is-lost' : ''}`}
          >
            <path d={HEART_PATH} />
          </svg>
        ))}
      </div>

      <div className="pb-plate__name">{pet.name}</div>

      <div className={`pb-plate__charge ${ready ? 'is-ready' : ''}`}>
        <div className="pb-plate__rail">
          <div
            className="pb-plate__fill"
            style={{ width: `${Math.min(100, (pet.spc / RULES.SPC_CAP) * 100)}%` }}
          />
        </div>
        {ready && <span className="pb-plate__ready">SPECIAL READY</span>}
      </div>
    </div>
  );
}

export default memo(PetNameplate);
