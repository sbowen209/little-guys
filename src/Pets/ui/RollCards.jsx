import { memo } from 'react';

const tagFor = (kind, advantage) => {
  if (advantage > 0) return `ADV ${kind}`;
  if (advantage < 0) return `DIS ${kind}`;
  return kind;
};

function RollCard({ roll, kind, side, color }) {
  const { rolls, kept, max, advantage, reasons } = roll;

  return (
    <div className={`pb-roll pb-roll--${side === 0 ? 'p1' : 'p2'}`} style={{ color }}>
      <span className="pb-roll__tag">{tagFor(kind, advantage)}</span>
      <span className="pb-roll__value">{kept}</span>
      <span className="pb-roll__max">of d{max}</span>
      {reasons?.length > 0 && (
        <span className="pb-roll__reasons">{reasons.join(' · ')}</span>
      )}

      <div className="pb-roll__dice">
        {rolls.map((value, i) => {
          // With advantage or disadvantage the second die is rolled and one is
          // discarded; mark exactly one survivor even when both show the same face.
          const dropped = rolls.length > 1 && !(value === kept && rolls.indexOf(kept) === i);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`pb-roll__bar ${dropped ? 'pb-roll__bar--dropped' : ''}`}>
                <i style={{ height: `${Math.max(4, Math.min(100, (value / max) * 100))}%` }} />
              </div>
              {rolls.length > 1 && (
                <span className={`pb-roll__num ${dropped ? 'pb-roll__num--dropped' : ''}`}>{value}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrueStrikeCard({ side }) {
  return (
    <div className={`pb-roll pb-roll--${side === 0 ? 'p1' : 'p2'}`} style={{ color: '#fde047' }}>
      <span className="pb-roll__tag">No Roll</span>
      <span className="pb-roll__value" style={{ fontSize: 44, marginTop: 14 }}>—</span>
      <span className="pb-roll__max">TRUESTRIKE</span>
    </div>
  );
}

/** The opposed roll: attacker's card over the attacker, defender's over the defender. */
function RollCards({ event }) {
  if (!event) return null;
  const { attacker, defender, hit, trueStrike } = event;

  return (
    <>
      <RollCard roll={attacker} kind="ATK" side={attacker.side} color="#fb7185" />
      {trueStrike
        ? <TrueStrikeCard side={defender.side} />
        : <RollCard roll={defender} kind="DEF" side={defender.side} color="#34d399" />}

      <div
        className="pb-verdict"
        style={{
          color: hit ? '#fff' : '#34d399',
          textShadow: hit
            ? '0 0 30px rgba(251,113,133,0.9), 0 6px 20px rgba(0,0,0,0.9)'
            : '0 0 26px rgba(52,211,153,0.7), 0 6px 20px rgba(0,0,0,0.9)',
        }}
      >
        {trueStrike ? 'Truestrike' : hit ? 'Hit' : 'Blocked'}
      </div>
    </>
  );
}

export default memo(RollCards);
