/**
 * @file Pets/index.js
 * @description Public surface of the Pet Battler module. The rest of the app
 * imports from here and nothing else, so the internals can be reorganised
 * without touching App.jsx.
 */

export { default as PetSetup } from './setup/PetSetup.jsx';
export { default as BattleArena } from './ui/BattleArena.jsx';
export { simulateBattle } from './engine/simulate.js';
export { PET_DB, listSpecies, getSpecies, displayName } from './data/index.js';
