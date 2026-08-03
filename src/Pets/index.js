/**
 * @file Pets/index.js
 * @description Public surface of the Pet Battler module. The rest of the app
 * imports from here and nothing else, so the internals can be reorganised
 * without touching App.jsx.
 */

/** The whole module behind one component — it owns its own routing. */
export { default as PetBattler } from './PetBattler.jsx';

export { default as PetSetup } from './setup/PetSetup.jsx';
export { default as BattleArena } from './ui/BattleArena.jsx';
export { simulateBattle } from './engine/simulate.js';
export { PET_DB, listSpecies, getSpecies, displayName, STABLE_IDS } from './data/index.js';
