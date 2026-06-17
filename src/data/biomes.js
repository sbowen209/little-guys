// src/data/biomes.js

export const BIOMES = {
  swamp: {
    id: "swamp",
    name: "The Sunken Mire",
    description: "A toxic, muddy expanse filled with dangerous flora.",
    imagePath: "/images/maps/biomes/swamp_bg.jpg",
    resourcePool: [
      { itemId: "monster_parts", weight: 40 },
      { itemId: "plant_bramble", weight: 20 },
      { itemId: "plant_tox", weight: 20 },
      { itemId: "plant_black", weight: 10 },
      { itemId: "plant_red", weight: 5 },
      { itemId: "mote_earth", weight: 5 } // 5% chance drop
    ]
  },
  plains: {
    id: "plains",
    name: "The Whispering Plains",
    description: "Endless fields of tall grass hiding unseen predators.",
    imagePath: "/images/maps/biomes/plains_bg.jpg",
    resourcePool: [
      { itemId: "monster_parts", weight: 40 },
      { itemId: "plant_wheat", weight: 20 },
      { itemId: "plant_zephyr", weight: 20 },
      { itemId: "plant_yellow", weight: 10 },
      { itemId: "plant_blue", weight: 5 },
      { itemId: "mote_wind", weight: 5 } 
    ]
  },
  coast: {
    id: "coast",
    name: "The Shaded Coast",
    description: "A rocky, treacherous shoreline battered by dark waves.",
    imagePath: "/images/maps/biomes/coast_bg.jpg",
    resourcePool: [
      { itemId: "monster_parts", weight: 40 },
      { itemId: "plant_aqua", weight: 20 },
      { itemId: "plant_pearl", weight: 20 },
      { itemId: "plant_blue", weight: 10 },
      { itemId: "plant_yellow", weight: 5 },
      { itemId: "mote_water", weight: 5 } 
    ]
  }
};