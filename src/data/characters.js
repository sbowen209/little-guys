// src/data/characters.js

export const ROSTER = {
  gil: {
    id: "gil",
    name: "Gil",
    description: "A balanced explorer ready for any biome.",
    baseHealth: 5,
    baseAttack: 200,
    // Ardenkin: Advantage on plant rolls. Battle Bloom: Recover 1 HP post-fight (Max 5).
    passives: ["ARDENKIN", "BATTLE_BLOOM"], 
    imagePath: "/images/characters/Gil.png",
    altCostumes: {
      coast: "/images/characters/Gil_Coast.png",
      plains: "/images/characters/Gil_Plains.png"
    }
  },
  marinska: {
    id: "marinska",
    name: "Marinska",
    description: "Strikes fast and navigates the shadows with ease.",
    baseHealth: 5,
    baseAttack: 260,
    passives: ["FIRST_STRIKE", "EVASION"],
    imagePath: "/images/characters/Marinska.png"
  },
  tornadowerewolf: {
    id: "tornadowerewolf",
    name: "Tornado Werewolf",
    description: "A chaotic force of nature that tears through enemy lines.",
    baseHealth: 5,
    baseAttack: 280,
    passives: ["CLEAVE", "WIND_AFFINITY"],
    imagePath: "/images/characters/Tornadowerewolf.png"
  },
  crocagator: {
    id: "crocagator",
    name: "Crocagator",
    description: "Thick-scaled and nearly impossible to take down.",
    baseHealth: 5,
    baseAttack: 160,
    passives: ["THICK_SCALES", "SWAMP_NATIVE"],
    imagePath: "/images/characters/Crocagator.png"
  },
  shiva: {
    id: "shiva",
    name: "Shiva",
    description: "A mystical warrior who excels in prolonged encounters.",
    baseHealth: 5,
    baseAttack: 220,
    // Looking For Trouble: Once per level, forced reroll any non-fight exploration.
    passives: ["LOOKING_FOR_TROUBLE"], 
    imagePath: "/images/characters/shiva.png"
  }
};