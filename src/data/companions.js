// src/data/companions.js

export const COMPANIONS = {
  pets: {
    dire_pup: {
      id: "dire_pup",
      name: "Dire Pup",
      description: "A vicious companion that distracts your foes.",
      combatEffect: "FLANKING", 
      damageBonus: 10, // Adds 10 damage to your base attack
      imagePath: "/images/pets/dire_pup.jpg"
    },
    swamp_sprite: {
      id: "swamp_sprite",
      name: "Swamp Sprite",
      description: "A glowing orb that mends minor wounds.",
      combatEffect: "REGEN",
      healingBonus: 5, // Heals 5 HP per combat turn
      imagePath: "/images/pets/swamp_sprite.jpg"
    }
  },
  mounts: {
    draft_horse: {
      id: "draft_horse",
      name: "Draft Horse",
      description: "A sturdy steed equipped with saddlebags.",
      passiveEffect: "EXTRA_INVENTORY",
      capacityBonus: 2, // Holds more resources before capping out
      imagePath: "/images/mounts/draft_horse.jpg"
    },
    wind_glider: {
      id: "wind_glider",
      name: "Wind Glider",
      description: "A kite-like contraption that rides the thermal drafts.",
      passiveEffect: "SCOUT_AHEAD",
      scoutBonus: true, // Allows player to see what the next zone is before rolling
      imagePath: "/images/mounts/wind_glider.jpg"
    }
  }
};