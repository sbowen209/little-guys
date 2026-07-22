import { memo } from 'react';
import { getSpecies } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

/**
 * The rest of the lineup, lined up against the arena wall.
 *
 * Carries no HUD at all — a benched pet is scenery until it takes the field.
 * The only thing it needs to say is who is next, which it says by standing
 * closest to the fight, largest and brightest, with the rest queued behind.
 *
 * No cast shadows here: they stand right against the wall, where the backdrop
 * already lays a band of shade along the base, and adding a second shadow under
 * each one made the row read as a set of stickers.
 */

const BASE_HEIGHT = 160;
/* Nearest-the-fight anchor per side, stepping outward along the wall.
 *
 * Four readable sprites cannot fit beside a 300px duellist without touching, so
 * the queue also steps back in depth: each place further down the line sits a
 * little higher, a little smaller and a little dimmer. What overlap remains
 * then reads as one pet standing behind another rather than as a pile. */
const ANCHOR = { 0: 410, 1: 1190 };
const STEP_X = 112;      // horizontal gap between places in the queue
const STEP_Y = 15;       // ...and how much further upstage each one stands
const GROUND = 520;      // front of the queue, on the sand at the wall base

const scaleXFor = (species, side) => {
  const facesLeft = species.facing === 'Left';
  // Benched pets face inward, watching the fight.
  return side === 0 ? (facesLeft ? -1 : 1) : (facesLeft ? 1 : -1);
};

function BenchWings({ team, lead, side }) {
  const waiting = team.filter((pet) => pet.slot !== lead);
  if (!waiting.length) return null;

  const inward = side === 0 ? -1 : 1;

  return (
    <div className={`pb-wing pb-wing--${side === 0 ? 'p1' : 'p2'}`} aria-hidden="true">
      {waiting.map((pet, depth) => {
        const species = getSpecies(pet.speciesId);
        const scale = Math.max(0.7, 1 - depth * 0.09);

        return (
          <div
            key={pet.instanceId}
            className={`pb-wing__unit ${pet.fainted ? 'pb-wing__unit--down' : ''}`}
            style={{
              left: ANCHOR[side] + inward * depth * STEP_X,
              top: GROUND - depth * STEP_Y,
              zIndex: 10 - depth,
              animationDelay: `${depth * 0.6}s`,
            }}
          >
            <img
              className="pb-wing__pet"
              src={assetUrl(species.art)}
              alt=""
              draggable={false}
              style={{
                height: BASE_HEIGHT * scale,
                filter: `brightness(${(0.94 - depth * 0.05).toFixed(2)}) saturate(${(0.92 - depth * 0.04).toFixed(2)})`,
                transform: `scaleX(${scaleXFor(species, side)})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default memo(BenchWings);
