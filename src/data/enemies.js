// src/data/enemies.js

export const ENEMIES = {
  // --- MAIEV SWAMP (MUD/NATURE ZONES) ---
  bog_bug: {
    id: "bog_bug",
    name: "Bog Bug",
    biome: "swamp",
    zoneType: "mud", // Custom tag to separate from Poison
    baseHealth: 3,
    baseAttack: 80,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1, // 1 HP = 1 Bug
    ability: "SWARM",
    imagePath: "/images/enemies/BogBug.png"
  },
  mire_mantis: {
    id: "mire_mantis",
    name: "Mire Mantis",
    biome: "swamp",
    zoneType: "mud",
    baseHealth: 2,
    baseAttack: 120,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1, // 1 HP = 1 Mantis
    ability: "SCYTHE_STRIKE",
    imagePath: "/images/enemies/MireMantis.png"
  },

  // --- MAIEV SWAMP (POISON ZONES) ---
  salamandar: {
    id: "salamandar",
    name: "Salamandar",
    biome: "swamp",
    zoneType: "poison",
    baseHealth: 2,
    baseAttack: 100,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1, // 1 HP = 1 Salamandar
    ability: "TOXIC_SPIT",
    imagePath: "/images/enemies/Salamandar.jpg"
  },
  mire_man: {
    id: "mire_man",
    name: "Mire Man",
    biome: "swamp",
    zoneType: "poison",
    baseHealth: 4,
    baseAttack: 90,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 2, // 2 HP = 1 Mire Man
    ability: "SLUDGE_GRASP",
    imagePath: "/images/enemies/MireMan.jpg"
  }
};