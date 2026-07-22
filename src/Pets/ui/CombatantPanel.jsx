import { memo } from 'react';
import { getSpecies, roleMeta, elementMeta, statusDef, RULES } from '../data/index.js';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

function Hearts({ current, max, justLost }) {
  return (
    <div className="pb-hearts">
      {Array.from({ length: max }).map((_, i) => {
        const full = i < current;
        const breaking = justLost && i === current;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`pb-heart ${full ? 'pb-heart--full' : 'pb-heart--empty'} ${breaking ? 'pb-heart--lost' : ''}`}
          >
            <path d={HEART_PATH} />
          </svg>
        );
      })}
    </div>
  );
}

function Die({ label, value, base }) {
  const tone = value > base ? 'pb-die--buffed' : value < base ? 'pb-die--nerfed' : '';
  return (
    <div className={`pb-die ${tone}`}>
      <span className="pb-die__label">{label}</span>
      <span className="pb-die__value">d{value}</span>
    </div>
  );
}

/**
 * The active pet's readout. Everything shown here is read straight from the
 * event snapshot, so the numbers can never drift from what the engine rolled.
 */
function CombatantPanel({ pet, side, isActive, damageFlash }) {
  const species = getSpecies(pet.speciesId);
  const role = roleMeta(species);
  const defence = elementMeta(species.typing.defensive);
  const ready = pet.spc >= RULES.SPC_CAP;
  const accent = side === 0 ? 'var(--p1)' : 'var(--p2)';

  return (
    <div
      className={`pb-panel pb-panel--${side === 0 ? 'p1' : 'p2'} ${isActive ? 'pb-panel--active' : 'pb-panel--idle'}`}
      style={{ color: accent }}
    >
      <div className="pb-panel__top">
        <span className="pb-panel__name" style={{ color: '#fff' }}>{pet.name}</span>
        <span className="pb-panel__lvl">Lv.{pet.level}</span>
        <span className="pb-panel__role" style={{ color: role.hex }}>{role.short}</span>
      </div>

      <Hearts current={pet.hp} max={pet.maxHp} justLost={damageFlash} />

      <div className="pb-meter">
        <div className="pb-meter__row">
          <span>Special</span>
          <span className={ready ? 'pb-ready' : ''}>
            <b>{pet.spc}</b> / {RULES.SPC_CAP}{ready ? ' — READY' : ''}
          </span>
        </div>
        <div className="pb-meter__rail">
          <div
            className={`pb-meter__fill ${ready ? 'pb-meter__fill--ready' : ''}`}
            style={{ width: `${Math.min(100, (pet.spc / RULES.SPC_CAP) * 100)}%` }}
          />
        </div>
      </div>

      <div className="pb-dice">
        <Die label="ATK" value={pet.atkDie} base={pet.baseAtkDie} />
        <Die label="DEF" value={pet.defDie} base={pet.baseDefDie} />
        <Die label="SPC" value={pet.spcDie} base={pet.spcDie} />
        <div className="pb-die" style={{ color: defence.hex }}>
          <span className="pb-die__label">TYPE</span>
          <span className="pb-die__value" style={{ fontSize: 15, color: defence.hex }}>
            {defence.icon} {species.typing.defensive.slice(0, 3)}
          </span>
        </div>
      </div>

      <div className="pb-chips">
        {pet.statuses.map(({ id, stacks }) => {
          const def = statusDef(id);
          return (
            <span key={id} className="pb-chip" style={{ color: def.tone }} title={`${def.name} — ${def.desc}`}>
              {def.icon} {def.name}{stacks > 1 ? ` x${stacks}` : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CombatantPanel);
