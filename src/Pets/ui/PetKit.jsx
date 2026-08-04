import { memo } from 'react';
import { ROLE, PASSIVES, getSpecies, roleMeta, elementMeta } from '../data/index.js';

/**
 * Who the pet in front of you actually is: its role, its two typings, and the
 * passives it is carrying.
 *
 * None of this changes during a match, which is exactly why it belongs in the
 * corner rather than on the pet. The flank carries what is changing (statuses),
 * the outboard rail carries the live dice, and this card carries the things you
 * need once and then want to be able to re-check without pausing — why an
 * attack rolled with advantage, what the 1/6 chance hanging over you is.
 *
 * The offensive typing is dimmed for every role except the Affinity Attacker,
 * because that is the only role the affinity chart reads on offence. Showing it
 * bright on a Tank would imply a rule that does not exist.
 */

function TypeChip({ element, prefix, inert, title }) {
  const meta = elementMeta(element);
  return (
    <span className={`pb-kit__type ${inert ? 'is-inert' : ''}`} title={title}>
      <span className="pb-kit__typeicon" style={{ color: inert ? undefined : meta.hex }}>
        {prefix}
      </span>
      <span className="pb-kit__typename" style={{ color: inert ? undefined : meta.hex }}>
        {meta.icon} {meta.label}
      </span>
    </span>
  );
}

function PetKit({ pet, side }) {
  const species = getSpecies(pet.speciesId);
  if (!species) return null;

  const role = roleMeta(species);
  const usesChart = species.role === ROLE.AFF_ATTACKER;
  const passives = (species.passives ?? [])
    .map((id) => PASSIVES[id])
    .filter(Boolean);

  return (
    <div className={`pb-kit pb-kit--${side === 0 ? 'p1' : 'p2'}`}>
      <span className="pb-kit__role" style={{ color: role.hex }}>{role.label}</span>

      <div className="pb-kit__types">
        <TypeChip
          element={species.typing.offensive}
          prefix="ATK"
          inert={!usesChart}
          title={usesChart
            ? 'Offensive typing — reads the affinity chart'
            : 'Only Affinity Attackers read the chart on offence, so this typing is inert'}
        />
        <TypeChip
          element={species.typing.defensive}
          prefix="DEF"
          title="Defensive typing — what Affinity Attackers are scored against"
        />
      </div>

      {passives.length > 0 && (
        <ul className="pb-kit__passives">
          {passives.map((passive) => {
            const locked = pet.level < passive.level;
            return (
              <li
                key={passive.id}
                className={`pb-kit__passive ${locked ? 'is-locked' : ''} ${passive.legendary ? 'is-legendary' : ''}`}
              >
                <span className="pb-kit__mark">
                  {locked ? '\u{1F512}' : passive.legendary ? '\u{1F451}' : '✦'}
                </span>
                <span className="pb-kit__pname">{passive.name}</span>

                {/* Built rather than using `title` so it appears instantly and can
                    carry the full rules text, same as the status flank's card. */}
                <span className="pb-kit__tip">
                  <span className="pb-kit__tipname">
                    {passive.name}
                    {passive.legendary && ' · Legendary'}
                    {locked && ` · unlocks at Lv.${passive.level}`}
                  </span>
                  <span className="pb-kit__tipdesc">{passive.desc}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default memo(PetKit);
