import { ENEMIES } from './enemies';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const REWARD_INFO = {
  eevee:   { emoji: '🦊', hex: '#c084fc', label: 'Eevee' },
  blessed: { emoji: '🧰', hex: '#fbbf24', label: 'Blessed Item' },
  pet:     { emoji: '🐾', hex: '#34d399', label: 'Pet' },
  mount:   { emoji: '🐎', hex: '#60a5fa', label: 'Mount' },
  rune:    { emoji: '🪨', hex: '#a78bfa', label: 'Rune' },
};

export function rollReward(biome, meta = {}) {
  const roll = Math.random() * 100;
  
  // 5% Blessed Item (Just a basic object with a chest emoji as requested)
  if (roll < 5) return { type: 'blessed', emoji: '🧰', name: 'Blessed Relic' };
  
  // 10% Swamp Mount
  if (roll < 15) return { type: 'mount', biome, name: `Swamp Mount` };
  
  // 10% Grass Eevee
  if (roll < 25) return { type: 'eevee', biome, name: `Grass Eevee`, image: '/images/pets/eevee.webp' };
  
  // 25% Rune
  if (roll < 50) return { type: 'rune', name: 'Ancient Rune', qty: 1 };
  
  // 50% Pet (Fallback to Rune if no pets are available)
  const ownedPets = meta.pets || [];
  const availablePets = Object.values(ENEMIES).filter(
    (e) => e.biome === biome && !ownedPets.some((p) => p.enemyId === e.id && p.biome === biome)
  );

  if (availablePets.length) {
    const e = pick(availablePets);
    return { type: 'pet', biome, enemyId: e.id, name: e.name, image: e.imagePath };
  }
  
  // Failsafe if player owns all pets
  return { type: 'rune', name: 'Ancient Rune', qty: 1 + Math.floor(Math.random() * 2) };
}