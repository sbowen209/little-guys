import { memo } from 'react';
import { getSpecies } from '../data/index.js';
import { assetUrl } from '../../utils/assets.js';

function SplashSide({ side, lead, roster }) {
  return (
    <div className={`pb-splash__side pb-splash__side--${side === 0 ? 'p1' : 'p2'}`}>
      <img src={assetUrl(getSpecies(lead.speciesId).art)} alt="" draggable={false} />
      <span className="pb-splash__name">{lead.name}</span>
      <span className="pb-splash__roster">{roster}</span>
    </div>
  );
}

/** Lineup reveal shown while the opening beat holds. */
export const OpeningSplash = memo(function OpeningSplash({ state }) {
  const sides = [0, 1].map((side) => ({
    lead: state.teams[side][state.lead[side]],
    roster: state.teams[side].map((pet) => pet.name).join(' → '),
  }));

  return (
    <div className="pb-splash">
      <SplashSide side={0} {...sides[0]} />
      <span className="pb-splash__vs">VS</span>
      <SplashSide side={1} {...sides[1]} />
    </div>
  );
});

/** End card: who won, who was left standing, and what to do next. */
export const ResultOverlay = memo(function ResultOverlay({ outcome, state, onRematch, onExit }) {
  const draw = outcome.winner === null;
  const bothWiped = outcome.reason === 'double_knockout';
  const survivors = draw
    ? []
    : state.teams[outcome.winner].filter((pet) => !pet.fainted);

  return (
    <div className="pb-result">
      <span className="pb-result__kicker">
        {draw ? (bothWiped ? 'Nobody left standing' : 'Stalemate') : `Player ${outcome.winner + 1} wins`}
      </span>
      <span className="pb-result__title">{draw ? 'Draw' : 'Victory'}</span>
      <span className="pb-result__stat">
        {outcome.turns} turns · {draw
          ? (bothWiped ? 'both teams wiped out' : 'turn limit reached')
          : `${survivors.length} pet${survivors.length === 1 ? '' : 's'} standing`}
      </span>

      {survivors.length > 0 && (
        <div className="pb-result__survivors">
          {survivors.map((pet) => (
            <div key={pet.instanceId} className="pb-result__pet">
              <img src={assetUrl(getSpecies(pet.speciesId).art)} alt="" draggable={false} />
              <span>{pet.name}<br />{pet.hp}/{pet.maxHp} ♥</span>
            </div>
          ))}
        </div>
      )}

      <div className="pb-result__actions">
        <button className="pb-cta pb-cta--primary" onClick={onRematch}>Rematch</button>
        <button className="pb-cta pb-cta--ghost" onClick={onExit}>Back to Setup</button>
      </div>
    </div>
  );
});
