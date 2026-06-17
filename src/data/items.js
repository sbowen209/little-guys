// src/data/items.js

export const ITEMS = {
  // --- CURRENCY & SHARED MATERIALS ---
  delc: { id: "delc", name: "DELC", type: "currency", value: 1 },
  sigil_dust: { id: "sigil_dust", name: "Sigil Dust", type: "material", rarity: "uncommon" },
  monster_parts: { id: "monster_parts", name: "Monster Parts", type: "material", rarity: "common" },

  // --- SHARED PLANTS ---
  plant_red: { id: "plant_red", name: "Crimson Root (Red)", type: "plant", imagePath: "/images/resources/Flower_Red.jpg" },
  plant_blue: { id: "plant_blue", name: "Azure Leaf (Blue)", type: "plant", imagePath: "/images/resources/Flower_Blue.jpg" },
  plant_yellow: { id: "plant_yellow", name: "Amber Bulb (Gold)", type: "plant", imagePath: "/images/resources/Flower_Gold.jpg" },
  plant_black: { id: "plant_black", name: "Void Spore (Black)", type: "plant", imagePath: "/images/resources/Flower_Black.jpg" },
  plant_green: { id: "plant_green", name: "Verdant Sprout (Green)", type: "plant", imagePath: "/images/resources/Flower_Green.jpg" },
  // --- BIOME: SWAMP ---
  mote_earth: { id: "mote_earth", name: "Earth Mote", type: "mote", biome: "swamp" },
  plant_bramble: { id: "plant_bramble", name: "Bramble Thorn", type: "plant", biome: "swamp" },
  plant_tox: { id: "plant_tox", name: "Tox Petals", type: "plant", biome: "swamp" },

  // --- BIOME: PLAINS ---
  mote_wind: { id: "mote_wind", name: "Wind Mote", type: "mote", biome: "plains" },
  plant_wheat: { id: "plant_wheat", name: "Wheat", type: "plant", biome: "plains" },
  plant_zephyr: { id: "plant_zephyr", name: "Zephyr Bloom", type: "plant", biome: "plains" },

  // --- BIOME: COAST ---
  mote_water: { id: "mote_water", name: "Water Mote", type: "mote", biome: "coast" },
  plant_aqua: { id: "plant_aqua", name: "Aqua Squash", type: "plant", biome: "coast" },
  plant_pearl: { id: "plant_pearl", name: "Pearl-moss", type: "plant", biome: "coast" },
};