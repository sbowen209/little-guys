import { memo } from 'react';

/**
 * The arena itself. Rendered exactly once and then memoised away — it takes no
 * props, so React never re-runs it while the battle plays. All motion in here
 * is CSS on composited layers; the old build animated SVG blur filters every
 * frame, which was the single most expensive thing on screen.
 */
function ArenaBackdrop() {
  return (
    <div className="pb-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1600 900" width="1600" height="900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1b2a" />
            <stop offset="45%" stopColor="#16233a" />
            <stop offset="100%" stopColor="#1c2b1c" />
          </linearGradient>
          <linearGradient id="pbFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b5842" />
            <stop offset="35%" stopColor="#8a6f52" />
            <stop offset="100%" stopColor="#5a4733" />
          </linearGradient>
          <radialGradient id="pbSpot" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pbWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2f3a" />
            <stop offset="100%" stopColor="#161a22" />
          </linearGradient>
          <linearGradient id="pbVignette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#05060a" stopOpacity="0.9" />
            <stop offset="26%" stopColor="#05060a" stopOpacity="0" />
            <stop offset="74%" stopColor="#05060a" stopOpacity="0" />
            <stop offset="100%" stopColor="#05060a" stopOpacity="0.92" />
          </linearGradient>
          <pattern id="pbGrit" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="none" />
            <circle cx="1" cy="2" r="0.6" fill="#000" opacity="0.16" />
            <circle cx="4" cy="5" r="0.5" fill="#fff" opacity="0.05" />
          </pattern>
        </defs>

        {/* Sky and far wall */}
        <rect width="1600" height="900" fill="url(#pbSky)" />
        <rect y="150" width="1600" height="180" fill="url(#pbWall)" />
        <rect y="150" width="1600" height="6" fill="#0a0d13" />

        {/* Crowd suggestion — static dots, no animation cost */}
        <g opacity="0.5">
          {Array.from({ length: 64 }).map((_, i) => (
            <circle
              key={i}
              cx={30 + (i % 32) * 50 + (i > 31 ? 24 : 0)}
              cy={i > 31 ? 250 : 205}
              r={i % 3 === 0 ? 11 : 9}
              fill={['#3b4252', '#4a3f52', '#3f4a3a', '#4a4238'][i % 4]}
            />
          ))}
        </g>

        {/* Arena floor */}
        <rect y="330" width="1600" height="570" fill="url(#pbFloor)" />
        <rect y="330" width="1600" height="570" fill="url(#pbGrit)" opacity="0.7" />
        <ellipse cx="800" cy="700" rx="720" ry="230" fill="#000" opacity="0.16" />
        <ellipse cx="800" cy="690" rx="620" ry="190" fill="none" stroke="#a98d67" strokeWidth="4" opacity="0.28" />
        <ellipse cx="800" cy="690" rx="300" ry="92" fill="none" stroke="#a98d67" strokeWidth="3" opacity="0.2" strokeDasharray="18 14" />

        {/* Centre line */}
        <path d="M800 500 L800 880" stroke="#a98d67" strokeWidth="3" opacity="0.22" strokeDasharray="14 18" />

        {/* Barrier posts */}
        {[90, 300, 800, 1300, 1510].map((x) => (
          <g key={x}>
            <rect x={x - 16} y="286" width="32" height="70" rx="5" fill="#232833" />
            <rect x={x - 16} y="286" width="32" height="10" rx="4" fill="#39404f" />
          </g>
        ))}

        {/* Spotlight and vignette */}
        <rect width="1600" height="900" fill="url(#pbSpot)" />
        <rect width="1600" height="900" fill="url(#pbVignette)" />
      </svg>

      {/* Braziers: cheap composited glows rather than animated SVG filters. */}
      {[110, 1490].map((x) => (
        <div className="pb-brazier" key={x} style={{ left: x }}>
          <div className="pb-brazier__core" />
          <div className="pb-brazier__halo" />
        </div>
      ))}
    </div>
  );
}

export default memo(ArenaBackdrop);
