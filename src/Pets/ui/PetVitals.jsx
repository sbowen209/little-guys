import { memo } from 'react';

/**
 * Live die sizes for a pet, sitting outboard of its status icons.
 *
 * These are the *current* values straight off the engine snapshot, not the
 * printed stat line — Rend halving DEF, Shed adding Max DEF to ATK, Damp,
 * Stagnation and Sunder all show up here the moment they land. Coloured against
 * the pet's base so a debuff is visible without doing arithmetic.
 */

const ROWS = [
  { key: 'atk', icon: '⚔', label: 'ATK' },
  { key: 'def', icon: '🛡', label: 'DEF' },
  { key: 'spc', icon: '⚡', label: 'SPC' },
];

function PetVitals({ pet, side }) {
  const values = {
    atk: { now: pet.atkDie, base: pet.baseAtkDie },
    def: { now: pet.defDie, base: pet.baseDefDie },
    // SPC is never modified in play, so it has no up/down state.
    spc: { now: pet.spcDie, base: pet.spcDie },
  };

  return (
    <div className={`pb-vitals pb-vitals--${side === 0 ? 'p1' : 'p2'}`}>
      {ROWS.map((row) => {
        const { now, base } = values[row.key];
        const trend = now > base ? 'is-up' : now < base ? 'is-down' : '';
        return (
          <div key={row.key} className={`pb-vitals__row ${trend}`}>
            <span className="pb-vitals__icon">{row.icon}</span>
            <span className="pb-vitals__num">d{now}</span>
          </div>
        );
      })}
    </div>
  );
}

export default memo(PetVitals);
