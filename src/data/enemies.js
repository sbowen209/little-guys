// src/data/enemies.js

const KNOWN_IMAGES = ['BogBug', 'MireMan', 'MireMantis', 'Salamandar', 'Merc', 'Brute'];

/**
 * Resolves the image path for an enemy. 
 * Falls back to a default silhouette/image if the specific artwork isn't in the known list.
 */
function getImagePath(fileName) {
  if (KNOWN_IMAGES.includes(fileName)) {
    return `/images/enemies/${fileName}.webp`;
  }
  return '/images/enemies/Enemy.webp'; // Fallback
}

export const ENEMIES = {
  // --- Level 1 Enemies ---
  bog_bug: {
    id: "bog_bug",
    name: "Bog Bug",
    ability: "poison",
    imagePath: getImagePath("BogBug"),
  },
  bramble_hound: {
    id: "bramble_hound",
    name: "Bramble Hound",
    ability: "advantage_first_attack",
    imagePath: getImagePath("BrambleHound"),
  },
  corpse_flower: {
    id: "corpse_flower",
    name: "Corpse Flower",
    ability: "weakening_spores",
    imagePath: getImagePath("CorpseFlower"),
  },
  moteling: {
    id: "moteling",
    name: "Moteling",
    ability: "vulnerable",
    imagePath: getImagePath("Moteling"),
  },
  brute: {
    id: "brute",
    name: "Brute",
    ability: "enrage",
    imagePath: getImagePath("Brute"),
  },
  poacher: {
    id: "poacher",
    name: "Poacher",
    ability: "death_summon",
    imagePath: getImagePath("Merc"), // Maps the Poacher to your uploaded Merc.webp
  },
  venom_hydra: {
    id: "venom_hydra",
    name: "Venom Hydra",
    ability: "toxic",
    imagePath: getImagePath("VenomHydra"),
  },
  mire_man: {
    id: "mire_man",
    name: "Mire Man",
    ability: "mire_regen",
    imagePath: getImagePath("MireMan"),
  },
  
  // --- Existing / Scaling Enemies (Kept for compatibility) ---
  mire_mantis: {
    id: "mire_mantis",
    name: "Mire Mantis",
    ability: "scythe_strike",
    imagePath: getImagePath("MireMantis"),
  },
  salamandar: {
    id: "salamandar",
    name: "Salamandar",
    ability: "toxic_spit",
    imagePath: getImagePath("Salamandar"),
  }
};