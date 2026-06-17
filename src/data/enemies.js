// src/data/enemies.js

export const ENEMIES = {
  // --- SWAMP ENEMIES ---
  sludge_toad: {
    id: "sludge_toad",
    name: "Sludge Toad",
    biome: "swamp",
    baseHealth: 140,
    baseAttack: 28,
    ability: "POISON_SPIT", // Logic hook can read this for damage-over-time
    imagePath: "/images/enemies/sludge_toad.jpg"
  },
  bog_hag: {
    id: "bog_hag",
    name: "Bog Hag",
    biome: "swamp",
    baseHealth: 180,
    baseAttack: 45,
    ability: "LIFE_DRAIN",
    imagePath: "/images/enemies/bog_hag.jpg"
  },

  // --- PLAINS ENEMIES ---
  wind_raptor: {
    id: "wind_raptor",
    name: "Wind Raptor",
    biome: "plains",
    baseHealth: 110,
    baseAttack: 50,
    ability: "SWIFT_STRIKE", // High damage, low health
    imagePath: "/images/enemies/wind_raptor.jpg"
  },
  razor_boar: {
    id: "razor_boar",
    name: "Razor Boar",
    biome: "plains",
    baseHealth: 220,
    baseAttack: 30,
    ability: "TRAMPLE",
    imagePath: "/images/enemies/razor_boar.jpg"
  },

  // --- COAST ENEMIES ---
  tide_crab: {
    id: "tide_crab",
    name: "Iron-shell Crab",
    biome: "coast",
    baseHealth: 260,
    baseAttack: 20,
    ability: "HARDEN", // Very tanky, low damage
    imagePath: "/images/enemies/tide_crab.jpg"
  },
  abyssal_siren: {
    id: "abyssal_siren",
    name: "Abyssal Siren",
    biome: "coast",
    baseHealth: 150,
    baseAttack: 55,
    ability: "CONFUSION_SONG",
    imagePath: "/images/enemies/abyssal_siren.jpg"
  }
};