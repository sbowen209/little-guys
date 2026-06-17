// src/data/characters.js

export const ROSTER = {
  gil: {
    id: "gil",
    name: "Gil",
    description: "A balanced explorer ready for any biome.",
    baseHealth: 200,
    baseAttack: 40,
    passives: ["RESOURCEFUL"],
    imagePath: "/images/characters/Gil.jpg",
    // Adding the alt costumes feature explicitly for biomes
    altCostumes: {
      coast: "/images/characters/Gil_Coast.jpg",
      plains: "/images/characters/Gil_Plains.jpg"
    }
  },
  marinska: {
    id: "marinska",
    name: "Marinska",
    description: "Strikes fast and navigates the shadows with ease.",
    baseHealth: 160,
    baseAttack: 56,
    passives: ["FIRST_STRIKE", "EVASION"],
    imagePath: "/images/characters/Marinska.jpg"
  },
  tornadowerewolf: {
    id: "tornadowerewolf",
    name: "Tornado Werewolf",
    description: "A chaotic force of nature that tears through enemy lines.",
    baseHealth: 180,
    baseAttack: 64,
    passives: ["CLEAVE", "WIND_AFFINITY"],
    imagePath: "/images/characters/Tornadowerewolf.jpg"
  },
  crocagator: {
    id: "crocagator",
    name: "Crocagator",
    description: "Thick-scaled and nearly impossible to take down.",
    baseHealth: 300,
    baseAttack: 32,
    passives: ["THICK_SCALES", "SWAMP_NATIVE"],
    imagePath: "/images/characters/Crocagator.jpg"
  },
  shiva: {
    id: "shiva",
    name: "Shiva",
    description: "A mystical warrior who excels in prolonged encounters.",
    baseHealth: 220,
    baseAttack: 48,
    passives: ["MYSTIC_AURA"],
    imagePath: "/images/characters/shiva.jpg"
  }
};