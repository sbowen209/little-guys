// src/data/elements.js
// Single source of truth for elemental affinities (cosmetic identity + auras).
export const ELEMENTS = {
  spirit: { id: 'spirit', name: 'Spirit', hex: '#ec4899' },
  shadow: { id: 'shadow', name: 'Shadow', hex: '#7c3aed' },
  earth:  { id: 'earth',  name: 'Earth',  hex: '#22c55e' },
  fire:   { id: 'fire',   name: 'Fire',   hex: '#ef4444' },
  water:  { id: 'water',  name: 'Water',  hex: '#3b82f6' },
  air:    { id: 'air',    name: 'Air',    hex: '#eab308' },
};

export const getElement = (id) =>
  ELEMENTS[id] || { id, name: id, hex: '#a8a29e' };

/**
 * Returns a CSS background + animation hint for a hero portrait aura.
 * - 1 element  → single-color radial glow (`mono: true`, pulses)
 * - 2 elements → 2-stop gradient            (`mono: false`, spins)
 * Fixes the previous bug where mono heroes produced an invalid/empty conic.
 */
export function heroAura(elementIds = []) {
  const colors = (elementIds || []).map((e) => getElement(e).hex);
  if (colors.length === 0) return null;

  if (colors.length === 1) {
    return {
      mono: true,
      background: `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, transparent 70%)`,
    };
  }
  return {
    mono: false,
    background: `conic-gradient(from 0deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`,
  };
}