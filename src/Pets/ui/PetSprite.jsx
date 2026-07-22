import { memo } from 'react';
import { getSpecies, elementMeta } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/** Sprites are authored facing one way; flip so each side looks at the other. */
const scaleXFor = (species, side) => {
  const facesLeft = species.facing === 'Left';
  return side === 0 ? (facesLeft ? -1 : 1) : (facesLeft ? 1 : -1);
};

const DIRECTIONAL = { lunge: true, cast: true, dodge: true, enter: true };

const animClass = (anim, side) => {
  if (!anim) return 'pb-anim-idle';
  if (DIRECTIONAL[anim]) return `pb-anim-${anim}-${side === 0 ? 'r' : 'l'}`;
  return `pb-anim-${anim}`;
};

/**
 * One combatant on the field.
 *
 * Both pets are always drawn at full brightness. Dimming whoever was not acting
 * meant half the fight sat in shade at any moment and every switch of turn
 * pulsed the whole screen; the nameplate and the turn colour carry that
 * information without touching the artwork.
 *
 * The animated node is never remounted — every pose returns to `pb-anim-idle`
 * between beats, so swapping the class off and on is what restarts a one-shot.
 */
function PetSprite({ pet, side, anim, isActive, fxColor }) {
  const species = getSpecies(pet.speciesId);
  const element = elementMeta(species.typing.defensive);

  return (
    <div
      className={`pb-slot pb-slot--${side === 0 ? 'p1' : 'p2'}`}
      style={{ '--dir': side === 0 ? 1 : -1, zIndex: isActive ? 30 : 20 }}
    >
      <div className="pb-slot__shadow" />
      <div className={`pb-actor ${animClass(anim, side)}`} style={{ '--fx': fxColor ?? element.hex }}>
        <img
          className="pb-sprite"
          src={assetUrl(species.art)}
          alt={pet.name}
          draggable={false}
          style={{ transform: `scaleX(${scaleXFor(species, side)})` }}
        />
      </div>
    </div>
  );
}

export default memo(PetSprite);
