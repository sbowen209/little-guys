// src/data/items.js

export const ITEMS = {
  // --- CURRENCY & SHARED MATERIALS ---
  delc: { id: "delc", name: "DELC", type: "currency", value: 1, emoji: "🪙", color: "amber" },
  sigil_dust: { id: "sigil_dust", name: "Sigil Dust", type: "material", rarity: "uncommon", emoji: "✨", color: "violet" },
  monster_parts: { id: "monster_parts", name: "Monster Parts", type: "material", rarity: "common", emoji: "🦴", color: "stone" },
  animal_feed: { id: "animal_feed", name: "Animal Feed", type: "material", rarity: "common", emoji: "🌾", color: "amber" },

  // --- SHARED PLANTS (image paths corrected to the real .webp assets) ---
  plant_red: { id: "plant_red", name: "Crimson Root", type: "plant", imagePath: "/images/resources/Flower_Red.webp", color: "rose" },
  plant_blue: { id: "plant_blue", name: "Azure Leaf", type: "plant", imagePath: "/images/resources/Flower_Blue.webp", color: "sky" },
  plant_yellow: { id: "plant_yellow", name: "Amber Bulb", type: "plant", imagePath: "/images/resources/Flower_Gold.webp", color: "amber" },
  plant_black: { id: "plant_black", name: "Void Spore", type: "plant", imagePath: "/images/resources/Flower_Black.webp", color: "fuchsia" },
  plant_green: { id: "plant_green", name: "Verdant Sprout", type: "plant", imagePath: "/images/resources/Flower_Green.webp", color: "emerald" },

  // --- BIOME: SWAMP ---
  mote_earth: { id: "mote_earth", name: "Earth Mote", type: "mote", biome: "swamp", emoji: "🪨", color: "amber" },
  plant_bramble: { id: "plant_bramble", name: "Bramble Thorn", type: "plant", biome: "swamp", emoji: "🌿", color: "emerald" },
  plant_tox: { id: "plant_tox", name: "Tox Petals", type: "plant", biome: "swamp", emoji: "🌸", color: "fuchsia" },

  // --- BIOME: PLAINS ---
  mote_wind: { id: "mote_wind", name: "Wind Mote", type: "mote", biome: "plains", emoji: "🌬️", color: "sky" },
  plant_wheat: { id: "plant_wheat", name: "Wheat", type: "plant", biome: "plains", emoji: "🌾", color: "amber" },
  plant_zephyr: { id: "plant_zephyr", name: "Zephyr Bloom", type: "plant", biome: "plains", emoji: "💮", color: "sky" },

  // --- BIOME: COAST ---
  mote_water: { id: "mote_water", name: "Water Mote", type: "mote", biome: "coast", emoji: "💧", color: "sky" },
  plant_aqua: { id: "plant_aqua", name: "Aqua Squash", type: "plant", biome: "coast", emoji: "🎃", color: "emerald" },
  plant_pearl: { id: "plant_pearl", name: "Pearl-moss", type: "plant", biome: "coast", emoji: "🦪", color: "stone" },

// --- NEW ITEMS ---
  fish: { id: "fish", name: "Fish", type: "material", rarity: "common", emoji: "🐟", color: "sky" },
  rune: { id: "rune", name: "Rune", type: "material", rarity: "rare", emoji: "🪨", color: "stone" },
  sigil: { id: "sigil", name: "Sigil", type: "material", rarity: "rare", emoji: "🔮", color: "violet" },
};

const COLOR_HEX = {
  rose: "#fb7185",
  sky: "#38bdf8",
  amber: "#fbbf24",
  fuchsia: "#e879f9",
  emerald: "#34d399",
  violet: "#a78bfa",
  stone: "#a8a29e",
};

/** Normalised display metadata for any item id (with a safe fallback). */
export function getItemMeta(id) {
  const item = ITEMS[id] || { id, name: id, color: "stone" };
  return { ...item, hex: COLOR_HEX[item.color] || COLOR_HEX.stone };
}