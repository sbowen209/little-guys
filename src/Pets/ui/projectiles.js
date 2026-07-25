/**
 * @file projectiles.js
 * @description The projectile registry and the resolver that decides, for any
 * attacking pet on any beat, whether the strike flies as a projectile or lands
 * as a jumping melee blow — and if it flies, what it looks like.
 *
 * This replaces the two ad-hoc structures that used to live in describe.js
 * (`RANGED_VFX` and `PROJECTILE_COLOR`). Both were flat: every projectile was
 * the same pill, distinguished only by a background gradient, and only a
 * Special ever fired one — a pet's ordinary turns were always melee. That made
 * the affinity casters read as brawlers between their big moves.
 *
 * ── DESIGN RULES (from the art and the kits) ───────────────────────
 * - Affinity Attackers throw their element on EVERY attack, standard or Special.
 *   Slinging fire / water / air / shadow is the whole identity of the role, so
 *   it should not switch off between Specials.
 * - Physical Tanks and physical defenders stay melee — they close the distance
 *   and hit. A projectile on a bulwark pet reads wrong.
 * - Everything else keeps per-ability behaviour: a Special names its own `vfx`,
 *   and a standard attack is melee unless the species says otherwise.
 * - Per-species and per-ability overrides win over the role default, which is
 *   how the Bubble Troubles lob bubbles despite one of them being a Tank.
 *
 * ── SPEC SHAPE ─────────────────────────────────────────────────────
 * Each projectile is pure presentation data. The renderer reads these; nothing
 * here touches the engine.
 *
 *   id        stable key.
 *   element   the ELEMENT it belongs to, for the tint and for grouping.
 *   core      radial-gradient for the projectile head (a hot white centre
 *             fading to the element colour reads best against the bright sand).
 *   size      [width, height] in the 1600x900 authored space.
 *   motion    'straight' flat dart · 'arc' rises then falls · 'float' slow bob ·
 *             'spin' tumbles end over end. Drives which flight keyframe to use.
 *   trail     colour of the streak left behind, or null for a clean shot.
 *   count     how many bodies to emit (a flurry of feathers, a spray of bubbles).
 *   spread    vertical jitter between bodies when count > 1, in authored px.
 *   glow      halo colour used for the muzzle flash and the impact tint.
 *   desc      why this projectile suits the pet — grounding, not rendered.
 */

import { ROLE, ELEMENT } from '../data/index.js';

/* ── ELEMENT PALETTE ──────────────────────────────────────────────── */
/* One tuned colour per element so a new element projectile stays in family. */
const TINT = {
  [ELEMENT.FIRE]: '#f97316',
  [ELEMENT.WATER]: '#38bdf8',
  [ELEMENT.AIR]: '#a5f3fc',
  [ELEMENT.EARTH]: '#d9a441',
  [ELEMENT.SHADOW]: '#a855f7',
  [ELEMENT.SPIRIT]: '#e879f9',
  [ELEMENT.PHYSICAL]: '#e5e0d4',
};

const orb = (element, inner, mid) => ({
  core: `radial-gradient(circle, #fff 0%, ${inner} 26%, ${mid} 56%, ${hexToRgba(mid, 0)} 80%)`,
  glow: mid,
});

/** #rrggbb -> rgba(r,g,b,a). Small helper so the gradients stay readable above. */
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/* ── THE REGISTRY ─────────────────────────────────────────────────── */

export const PROJECTILES = {
  /* Fire — Hellhound (Affinity). A furnace on four legs; every bite an ember. */
  ember: {
    id: 'ember',
    element: ELEMENT.FIRE,
    ...orb(ELEMENT.FIRE, '#fde047', '#f97316'),
    size: [120, 58],
    motion: 'straight',
    trail: 'rgba(249, 115, 22, 0.5)',
    count: 1,
    spread: 0,
    desc: 'A licking bolt of flame with an ash trail.',
  },

  /* Fire — Emboar. Squat and heavy; it coughs up a fat cinder rather than a bolt. */
  cinder: {
    id: 'cinder',
    element: ELEMENT.FIRE,
    ...orb(ELEMENT.FIRE, '#fca5a5', '#ef4444'),
    size: [92, 92],
    motion: 'arc',
    trail: 'rgba(239, 68, 68, 0.45)',
    count: 1,
    spread: 0,
    desc: 'A lobbed coal that arcs and drops — matches a low, front-heavy boar.',
  },

  /* Water — Bubble Trouble (Affinity), the blue half. Slow, floaty, translucent. */
  bubble_blue: {
    id: 'bubble_blue',
    element: ELEMENT.WATER,
    core: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.7) 22%, rgba(56,189,248,0.45) 55%, rgba(14,165,233,0.15) 78%)',
    glow: '#38bdf8',
    size: [76, 76],
    motion: 'float',
    trail: null,
    count: 3,
    spread: 34,
    desc: 'A drifting cluster of blue bubbles — the water half of the pair.',
  },

  /* Water — Bubble Trouble (Physical), the pink half / Lovey. Same body, warm tint. */
  bubble_pink: {
    id: 'bubble_pink',
    element: ELEMENT.WATER,
    core: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.95) 0%, rgba(251,207,232,0.72) 22%, rgba(244,114,182,0.45) 55%, rgba(219,39,119,0.15) 78%)',
    glow: '#f472b6',
    size: [76, 76],
    motion: 'float',
    trail: null,
    count: 3,
    spread: 34,
    desc: 'A drifting cluster of pink bubbles — the physical half / Lovey.',
  },

  /* Water — Dragon Turtle. A heavy pressurised spout, not a playful bubble. */
  spout: {
    id: 'spout',
    element: ELEMENT.WATER,
    ...orb(ELEMENT.WATER, '#bae6fd', '#0ea5e9'),
    size: [132, 46],
    motion: 'straight',
    trail: 'rgba(14, 165, 233, 0.4)',
    count: 1,
    spread: 0,
    desc: 'A flat jet of water fired from behind the shell.',
  },

  /* Air — Thunder Lion, Felightning, Watthog. Jagged, fast, near-instant. */
  spark: {
    id: 'spark',
    element: ELEMENT.AIR,
    core: 'radial-gradient(circle, #fff 0%, #fef08a 28%, #38bdf8 58%, rgba(56,189,248,0) 80%)',
    glow: '#7dd3fc',
    size: [138, 40],
    motion: 'straight',
    trail: 'rgba(125, 211, 252, 0.55)',
    count: 1,
    spread: 0,
    desc: 'A crackling blue-white bolt — the lightning shared by the electric pets.',
  },

  /* Shadow — Necrodoodle. A wobbling hex orb that trails violet motes. */
  hex: {
    id: 'hex',
    element: ELEMENT.SHADOW,
    ...orb(ELEMENT.SHADOW, '#e9d5ff', '#a855f7'),
    size: [88, 88],
    motion: 'float',
    trail: 'rgba(168, 85, 247, 0.4)',
    count: 1,
    spread: 0,
    desc: 'A slow curse-orb that bobs on its way in.',
  },

  /* Shadow — Terror Terrier. A crescent shriek, kept from the old set. */
  shriek: {
    id: 'shriek',
    element: ELEMENT.SHADOW,
    ...orb(ELEMENT.SHADOW, '#ddd6fe', '#7c3aed'),
    size: [116, 64],
    motion: 'straight',
    trail: 'rgba(124, 58, 237, 0.45)',
    count: 1,
    spread: 0,
    desc: 'A visible sound-crescent from a small, loud dog.',
  },

  /* Shadow — Bellybummer. A grinning wisp of spirit-fire, jack-o'-lantern hues. */
  wisp: {
    id: 'wisp',
    element: ELEMENT.SHADOW,
    core: 'radial-gradient(circle, #fff 0%, #fdba74 24%, #7c3aed 60%, rgba(124,58,237,0) 82%)',
    glow: '#c084fc',
    size: [84, 84],
    motion: 'float',
    trail: 'rgba(147, 51, 234, 0.4)',
    count: 1,
    spread: 0,
    desc: 'A haunt-flame that siphons — orange core, shadow shell.',
  },

  /* Air/Physical — Mega Chicken. A fan of stiff feather-darts. */
  feather: {
    id: 'feather',
    element: ELEMENT.AIR,
    core: 'linear-gradient(120deg, #fff 0%, #fca5a5 45%, #ef4444 100%)',
    glow: '#fecaca',
    size: [96, 22],
    motion: 'spin',
    trail: null,
    count: 3,
    spread: 40,
    desc: 'Three red-and-white quills thrown in a spinning fan.',
  },
};

/* ── ROUTING ──────────────────────────────────────────────────────── */

/**
 * Per-species override. Wins over the role default and the per-ability vfx, so
 * a pet whose whole identity is a projectile throws it no matter the beat.
 * Keyed by species id.
 */
const SPECIES_PROJECTILE = {
  bubble_trouble_affinity: 'bubble_blue',
  bubble_trouble_physical: 'bubble_pink',
  emboar: 'cinder',
  necrodoodle: 'hex',
  watthog: 'spark',
  thunder_lion: 'spark',
  felightning: 'spark',
  bellybummer: 'wisp',
  mega_chicken: 'feather',
  dragon_turtle: 'spout',
};

/**
 * Per-ability override, keyed by ability id — for a Special whose look differs
 * from what its caster throws on a normal turn. Terrorize is a shriek even
 * though Terror Terrier otherwise punches.
 */
const ABILITY_PROJECTILE = {
  terrorize: 'shriek',
  hellfire_bolt: 'ember',
  static_shock: 'spark',
  chain_shock: 'spark',
  thunderstorm: 'spark',
  doom_curse: 'hex',
};

/** The default projectile an element throws when nothing more specific applies. */
const ELEMENT_PROJECTILE = {
  [ELEMENT.FIRE]: 'ember',
  [ELEMENT.WATER]: 'bubble_blue',
  [ELEMENT.AIR]: 'spark',
  [ELEMENT.SHADOW]: 'hex',
  [ELEMENT.SPIRIT]: 'wisp',
};

/**
 * The one decision point. Returns a projectile spec to fly it, or `null` to
 * play a jumping melee attack instead.
 *
 * @param {object} species  the attacking pet's species (role, typing, id).
 * @param {object} action   the ACTION event: { ability, vfx, effect }.
 */
export function projectileFor(species, action) {
  if (!species || !action || action.effect) return null;

  // 1. An ability that names its own projectile always wins.
  if (action.ability && ABILITY_PROJECTILE[action.ability]) {
    return PROJECTILES[ABILITY_PROJECTILE[action.ability]];
  }

  // 2. A species that always throws the same thing (the Bubble Troubles).
  if (SPECIES_PROJECTILE[species.id]) {
    return PROJECTILES[SPECIES_PROJECTILE[species.id]];
  }

  // 3. Affinity Attackers sling their element on every attack, standard or not.
  if (species.role === ROLE.AFF_ATTACKER) {
    const byElement = ELEMENT_PROJECTILE[species.typing?.offensive];
    if (byElement) return PROJECTILES[byElement];
  }

  // 4. Otherwise honour a vfx that is itself a registered projectile — this is
  //    how a one-off ranged Special on a melee pet still flies.
  if (action.vfx && PROJECTILES[action.vfx]) return PROJECTILES[action.vfx];

  // 5. Everything else — physical Tanks, brawler Attackers — closes and hits.
  return null;
}

/** True when this attacker+action should read as ranged rather than melee. */
export const isRanged = (species, action) => projectileFor(species, action) !== null;

export const projectileDef = (id) => PROJECTILES[id] ?? null;
export const elementTint = (element) => TINT[element] ?? TINT[ELEMENT.PHYSICAL];
