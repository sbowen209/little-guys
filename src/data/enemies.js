export const ENEMIES = {
  bog_bug: {
    id: "bog_bug",
    name: "Bog Bug",
    biome: "swamp",
    zoneType: "mud",
    baseHealth: 3,
    baseAttack: 80,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1,
    ability: "SWARM",
    imagePath: "/images/enemies/BogBug.webp"
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
    hpPerCount: 1,
    ability: "SCYTHE_STRIKE",
    imagePath: "/images/enemies/MireMantis.webp"
  },
  salamandar: {
    id: "salamandar",
    name: "Salamandar",
    biome: "swamp",
    zoneType: "poison",
    baseHealth: 2,
    baseAttack: 100,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1,
    ability: "TOXIC_SPIT",
    imagePath: "/images/enemies/Salamandar.webp"
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
    hpPerCount: 2,
    ability: "SLUDGE_GRASP",
    imagePath: "/images/enemies/MireMan.webp"
  }
};