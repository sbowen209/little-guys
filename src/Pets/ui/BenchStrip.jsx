import { memo } from 'react';
import { getSpecies, RULES } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/**
 * The rest of the lineup, in the order they will enter. Benched Supports keep
 * generating charge, so their meters stay live down here.
 */
function BenchStrip({ team, lead, side }) {
  const bench = team.filter((pet) => pet.slot !== lead);
  if (!bench.length) return null;

  return (
    <div className={`pb-bench pb-bench--${side === 0 ? 'p1' : 'p2'}`}>
      {bench.map((pet) => {
        const species = getSpecies(pet.speciesId);
        return (
          <div key={pet.instanceId} className={`pb-benchcard ${pet.fainted ? 'pb-benchcard--down' : ''}`}>
            <span className="pb-benchcard__order">{pet.slot + 1}</span>
            <img className="pb-benchcard__art" src={assetUrl(species.art)} alt="" draggable={false} />
            <span className="pb-benchcard__name">{pet.name}</span>
            <div className="pb-benchcard__hp">
              {Array.from({ length: pet.maxHp }).map((_, i) => (
                <span key={i} className={`pb-pip ${i < pet.hp ? 'pb-pip--on' : ''}`} />
              ))}
            </div>
            <div className="pb-benchcard__spc">
              <i style={{ width: `${Math.min(100, (pet.spc / RULES.SPC_CAP) * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(BenchStrip);
