// src/data/encounterTables.js
import { ENEMIES } from './enemies';

export const ENCOUNTER_TABLES = {
  swamp: {
    1: {
      // Route A (Swamp)
      A: [
        { enemyId: 'bog_bug', difficulty: 'Hard', baseAttack: 130, baseHealth: 2, drop: 'monster_parts' },
        { enemyId: 'bramble_hound', difficulty: 'Medium', baseAttack: 145, baseHealth: 4, drop: 'monster_parts' },
        { enemyId: 'corpse_flower', difficulty: 'Easy', baseAttack: 120, baseHealth: 3, drop: 'plant_blue' }, 
      ],
      // Route B (Woods)
      B: [
        { enemyId: 'moteling', difficulty: 'Hard', baseAttack: 100, baseHealth: 4, drop: 'mote_earth' }, 
        { enemyId: 'brute', difficulty: 'Medium', baseAttack: 150, baseHealth: 3, drop: 'delc' },
        { enemyId: 'poacher', difficulty: 'Easy', baseAttack: 130, baseHealth: 3, drop: 'delc' }, // Replaced Merc
      ],
      // Route C (Poison)
      C: [
        { enemyId: 'venom_hydra', difficulty: 'Hard', baseAttack: 140, baseHealth: 3, drop: 'monster_parts' },
        { enemyId: 'mire_man', difficulty: 'Medium', baseAttack: 110, baseHealth: 5, drop: 'mote_earth' }, 
        { enemyId: 'corpse_flower', difficulty: 'Easy', baseAttack: 120, baseHealth: 3, drop: 'plant_red' }, 
      ]
    }
  }
};

// For now, duplicate Level 1 tables into Levels 2-5 so the math scalar can handle them
[2, 3, 4, 5].forEach((level) => {
  ENCOUNTER_TABLES.swamp[level] = { ...ENCOUNTER_TABLES.swamp[1] };
});

export function getCuratedEncounter(biomeId, level, zone) {
  const table = ENCOUNTER_TABLES[biomeId]?.[level]?.[zone];
  const encounterList = table || ENCOUNTER_TABLES['swamp'][1]['A']; 
  const roll = Math.floor(Math.random() * encounterList.length);
  const encounterData = encounterList[roll];

  return {
    ...ENEMIES[encounterData.enemyId],
    baseAttack: encounterData.baseAttack,
    baseHealth: encounterData.baseHealth,
    drop: encounterData.drop,
    difficulty: encounterData.difficulty,
  };
}