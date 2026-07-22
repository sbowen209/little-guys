import { memo } from 'react';
import { assetUrl } from '../../utils/assets.js';

/**
 * The arena, at midday. Rendered once and memoised away — it takes no props, so
 * React never re-runs it while the battle plays.
 *
 * Design notes:
 *  - Bright and flat on purpose. Nothing in the scene is dimmed to create
 *    focus, so the pets can be the most saturated thing on screen without
 *    competing against a darkened backdrop.
 *  - The wall is four plain courses and one banded frieze. Carved panels were
 *    fighting the sprites at exactly the height the action happens.
 *
 * Vertical bands (1600x900 authoring space):
 *    0-106  sky and the tree line beyond the stadium
 *   96-250  stands
 *  250-272  parapet
 *  272-490  wall
 *  490-900  sand
 */

/* Seated in the stands, cropped at the chest by the parapet — a standing
 * portrait behind a rail reads as a spectator in a seat. Gil and Castellan
 * share a box; they sit close enough to read as a pair but no longer overlap.
 * Shiva is flipped to face in toward the arena. */
const CROWD_CAST = [
  { id: 'gil', src: '/images/characters/Gil.webp', x: 264, y: 154, w: 172, h: 186 },
  { id: 'castellan', src: '/images/characters/Castellan.png', x: 366, y: 146, w: 148, h: 197 },
  { id: 'shiva', src: '/images/characters/shiva.webp', x: 1188, y: 156, w: 165, h: 192, flip: true },
];

/* Two rows of stock spectators, drawn at the same scale as the named cast so a
 * spectator and a character read as the same species at the same distance —
 * they were previously about half size, which made the stands look like a
 * children's gallery. Monochrome: one warm-grey hue, value steps only, so the
 * crowd never competes with the three characters or the fight. */
const CROWD_VALUES = ['#8f8877', '#7c7565', '#6a6354', '#9c9583', '#5b5546'];
const CROWD_SKIN = '#aaa290';
const CROWD_HAIR = '#4c463b';

function ArenaBackdrop() {
  return (
    <div className="pb-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1600 900" width="1600" height="900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6fc4ee" />
            <stop offset="60%" stopColor="#a9dcf2" />
            <stop offset="100%" stopColor="#dcf0f7" />
          </linearGradient>

          <radialGradient id="pbSun" cx="72%" cy="8%" r="46%">
            <stop offset="0%" stopColor="#fffbe8" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#fff3c4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="pbWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6dabb" />
            <stop offset="70%" stopColor="#d4c49f" />
            <stop offset="100%" stopColor="#c0ad86" />
          </linearGradient>

          <linearGradient id="pbSand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcc094" />
            <stop offset="45%" stopColor="#ecd3a9" />
            <stop offset="100%" stopColor="#f5e2c0" />
          </linearGradient>

          <linearGradient id="pbCanopy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5aa544" />
            <stop offset="100%" stopColor="#33682a" />
          </linearGradient>

          <radialGradient id="pbGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8a6b45" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#8a6b45" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── SKY ─────────────────────────────────────────────────── */}
        <rect width="1600" height="270" fill="url(#pbSky)" />
        <rect width="1600" height="270" fill="url(#pbSun)" />

        {/* ── TREE LINE ───────────────────────────────────────────── */}
        {/* A continuous canopy running down behind the stands, rather than a row
            of loose circles hanging in the sky with a gap under them. The solid
            band is what stops them reading as floating leaves. */}
        <rect y="62" width="1600" height="46" fill="url(#pbCanopy)" />
        <g>
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={i}
              cx={i * 41 + (i % 3) * 13}
              cy={64 + (i % 4) * 6}
              r={26 + (i % 5) * 7}
              fill={['#4a8f38', '#5aa544', '#3f7a2e', '#68b84e'][i % 4]}
            />
          ))}
        </g>
        {/* Shaded underside where the canopy meets the stadium rim */}
        <rect y="88" width="1600" height="20" fill="#2c5a24" opacity="0.55" />

        {/* ── STANDS ──────────────────────────────────────────────── */}
        <rect y="96" width="1600" height="160" fill="#a49e88" />
        <rect y="96" width="1600" height="7" fill="#bdb69d" />
        {[142, 190].map((y) => (
          <rect key={y} y={y} width="1600" height="5" fill="#8d8672" opacity="0.55" />
        ))}

        {/* Crowd: two rows of stock figures, sized to the named cast */}
        <g opacity="0.9">
          {Array.from({ length: 42 }).map((_, i) => {
            const row = i % 2;
            const x = 26 + (i % 21) * 76 + row * 34;
            const y = row ? 206 : 170;
            const shirt = CROWD_VALUES[(i * 3) % CROWD_VALUES.length];
            const cheering = i % 5 === 2;

            return (
              <g key={i}>
                {cheering ? (
                  <path
                    d={`M${x - 19} ${y + 34}l-11-26M${x + 19} ${y + 34}l11-26`}
                    stroke={CROWD_SKIN} strokeWidth="8" strokeLinecap="round" fill="none"
                  />
                ) : (
                  <path
                    d={`M${x - 19} ${y + 32}l-8 21M${x + 19} ${y + 32}l8 21`}
                    stroke={shirt} strokeWidth="9" strokeLinecap="round" fill="none"
                  />
                )}
                <path d={`M${x - 23} ${y + 60}c0-26 10-39 23-39s23 13 23 39z`} fill={shirt} />
                <circle cx={x} cy={y} r={16} fill={CROWD_SKIN} />
                <path d={`M${x - 16} ${y - 3}a16 16 0 0 1 32 0z`} fill={CROWD_HAIR} />
              </g>
            );
          })}
        </g>

        {/* The cast, in their boxes. Drawn before the parapet so it crops them. */}
        {CROWD_CAST.map((member) => (
          <image
            key={member.id}
            href={assetUrl(member.src)}
            x={member.x}
            y={member.y}
            width={member.w}
            height={member.h}
            preserveAspectRatio="xMidYMax meet"
            style={{
              filter: 'brightness(0.94) saturate(0.9)',
              ...(member.flip
                ? { transformBox: 'fill-box', transformOrigin: 'center', transform: 'scaleX(-1)' }
                : null),
            }}
          />
        ))}

        {/* ── PARAPET ─────────────────────────────────────────────── */}
        <rect y="250" width="1600" height="22" fill="#c8bd9e" />
        <rect y="250" width="1600" height="5" fill="#ded4b8" />
        <rect y="268" width="1600" height="4" fill="#a1957a" />

        {/* ── WALL: four plain courses and one banded frieze ──────── */}
        <rect y="272" width="1600" height="218" fill="url(#pbWall)" />
        {[272, 316, 360, 404, 448].map((y) => (
          <rect key={y} y={y} width="1600" height="2" fill="#b0a07b" opacity="0.7" />
        ))}
        <g fill="#b0a07b" opacity="0.45">
          {Array.from({ length: 40 }).map((_, i) => (
            <rect key={i} x={i * 100 + (i % 2 ? 50 : 0)} y={272 + (i % 5) * 44} width="2" height="44" />
          ))}
        </g>
        <rect y="352" width="1600" height="14" fill="#2f9c8f" opacity="0.5" />
        <rect y="352" width="1600" height="3" fill="#1f7a70" opacity="0.55" />
        <rect y="363" width="1600" height="3" fill="#1f7a70" opacity="0.55" />
        <rect y="474" width="1600" height="16" fill="#b3a077" />
        <rect y="488" width="1600" height="4" fill="#96855f" />

        {/* ── SAND ────────────────────────────────────────────────── */}
        <path d="M0 900V490h1600v410z" fill="url(#pbSand)" />

        <g stroke="#d8bb8e" fill="none" opacity="0.55">
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const y = 506 + t * t * 380;
            const amp = 4 + t * 11;
            return (
              <path
                key={i}
                d={`M-20 ${y}q200 ${-amp} 400 0t400 0t400 0t440 0`}
                strokeWidth={1.4 + t * 2.2}
              />
            );
          })}
        </g>

        {/* Band of shade at the wall base, so the bench has something to stand
            on rather than hovering over flat colour. */}
        <ellipse cx="800" cy="496" rx="820" ry="26" fill="url(#pbGroundShadow)" />

        <g fill="#c2a67f" opacity="0.5">
          {[[430, 620], [980, 540], [1210, 700], [640, 790]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={7 + (i % 3) * 3} ry={5 + (i % 2) * 3} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default memo(ArenaBackdrop);
