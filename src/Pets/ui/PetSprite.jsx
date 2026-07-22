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
 * The animated node is never remounted. Every pose returns to `pb-anim-idle`
 * between beats, and swapping the class off and back on is what restarts a
 * one-shot animation — no key churn, no forced reflow, and the <img> element
 * survives the whole match.
 */
function PetSprite({ pet, side, anim, isActive, fxColor }) {
  const species = getSpecies(pet.speciesId);
  const element = elementMeta(species.typing.defensive);
  const accent = side === 0 ? 'var(--p1)' : 'var(--p2)';

  return (
    <div
      className={`pb-slot pb-slot--${side === 0 ? 'p1' : 'p2'}`}
      style={{ '--dir': side === 0 ? 1 : -1, zIndex: isActive ? 30 : 20 }}
    >
      <div className="pb-slot__aura" style={{ background: `radial-gradient(circle, ${element.glow}, transparent 70%)` }} />
      <div className="pb-slot__shadow" />
      <div
        className={`pb-slot__ring ${isActive ? 'pb-slot__ring--active' : ''}`}
        style={{ color: accent }}
      />
      <div
        className={`pb-actor ${animClass(anim, side)}`}
        style={{ '--fx': fxColor ?? element.hex }}
      >
        <img
          className={`pb-sprite ${isActive ? '' : 'pb-sprite--dim'}`}
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
