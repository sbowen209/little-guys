/**
 * @file species.js
 * @description The base species directory. A species is pure data: it names the
 * passives and Special it uses by id, and never contains logic.
 *
 * ── ADDING A NEW PET ───────────────────────────────────────────────
 * 1. Drop the artwork in public/images/pets/.
 * 2. If it needs a new Special, add it to abilities.js.
 * 3. If it needs new passives, add them to passives.js.
 * 4. Add an entry below with a NEW, PERMANENT id (saved teams reference ids,
 *    so never rename or reuse one).
 * That is the whole job — no engine or UI file needs to change.
 */

import { ROLE, ELEMENT } from './constants.js';

/** @type {Record<string, object>} */
export const SPECIES = {
  hellhound_affinity: {
    id: 'hellhound_affinity',
    name: 'Hellhound',
    variant: 'Affinity',
    family: 'hellhound',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.FIRE, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 40, def: 40, spc: 30 },
    special: 'hellfire_bolt',
    passives: ['hellfire', 'scorching_flames'],
    art: '/images/pets/HellHound_Affinity.webp',
    facing: 'Right',
    flavor: 'A furnace on four legs. Every bite leaves an ember behind.',
  },

  hellhound_physical: {
    id: 'hellhound_physical',
    name: 'Hellhound',
    variant: 'Physical',
    family: 'hellhound',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 50, def: 30, spc: 30 },
    special: 'rending_bite',
    passives: ['intimidating', 'smells_weakness'],
    art: '/images/pets/HellHound_Physical.webp',
    facing: 'Right',
    flavor: 'Picks the healthiest thing in the room, then the weakest.',
  },

  emboar: {
    id: 'emboar',
    name: 'Emboar',
    family: 'emboar',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.FIRE, defensive: ELEMENT.FIRE },
    base: { hp: 6, atk: 35, def: 40, spc: 33 },
    special: 'heat_up',
    passives: ['flame_aura', 'afterburn'],
    art: '/images/pets/Emboar.webp',
    facing: 'Right',
    flavor: 'Burns anything that touches it, and keeps burning after it falls.',
  },

  terror_terrier: {
    id: 'terror_terrier',
    name: 'Terror Terrier',
    family: 'terrier',
    role: ROLE.STUNNER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 5, atk: 30, def: 45, spc: 25 },
    special: 'terrorize',
    passives: ['ghostly_blur', 'capitalize'],
    art: '/images/pets/TerrorTerrier.webp',
    facing: 'Left',
    flavor: 'Small, loud, and impossible to pin down.',
  },

  scruffy: {
    id: 'scruffy',
    name: 'Scruffy',
    family: 'scruffy',
    role: ROLE.TANK,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 7, atk: 25, def: 50, spc: 25 },
    special: 'shed',
    passives: ['thick_fur', 'scruffy_resolve'],
    art: '/images/pets/Scruffy.webp',
    facing: 'Left',
    flavor: 'Nothing sticks to that coat. Not poison, not curses, not teeth.',
  },

  necrodoodle: {
    id: 'necrodoodle',
    name: 'Necrodoodle',
    family: 'necrodoodle',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.SHADOW, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 40, def: 30, spc: 40 },
    special: 'doom_curse',
    passives: ['hex_claws', 'vengeful_curse'],
    art: '/images/pets/Necrodoodle.webp',
    facing: 'Left',
    flavor: 'Groomed, adorable, and quietly rewriting your fate.',
  },

  gnollbacabra: {
    id: 'gnollbacabra',
    name: 'Gnollbacabra',
    family: 'gnoll',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 4, atk: 40, def: 20, spc: 30 },
    special: 'sunder',
    passives: ['crippling_bite', 'bonecrusher'],
    art: '/images/pets/Gnollbacabra.webp',
    facing: 'Left',
    flavor: 'Does not kill you. Just removes your ability to fight back.',
  },

  famine_wolf: {
    id: 'famine_wolf',
    name: 'Famine Wolf',
    family: 'wolf',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 5, atk: 40, def: 35, spc: 30 },
    special: 'ravenous_bite',
    passives: ['crunch', 'famine_feast'],
    art: '/images/pets/FamineWolf.webp',
    facing: 'Left',
    flavor: 'Gets stronger with every meal. Never stops being hungry.',
  },

  felightning: {
    id: 'felightning',
    name: 'Felightning',
    family: 'felightning',
    role: ROLE.SUPPORT,
    typing: { offensive: ELEMENT.AIR, defensive: ELEMENT.AIR },
    base: { hp: 3, atk: 25, def: 30, spc: 40 },
    special: 'static_shock',
    passives: ['baton_pass', 'overcharge'],
    art: '/images/pets/Felightning.webp',
    facing: 'Right',
    flavor: 'Charges the whole bench from the sidelines. Fragile on the field.',
  },

  bubble_trouble_physical: {
    id: 'bubble_trouble_physical',
    name: 'Bubble Trouble',
    variant: 'Physical',
    family: 'bubble',
    bond: 'bubble',
    role: ROLE.TANK,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.WATER },
    base: { hp: 8, atk: 20, def: 50, spc: 30 },
    special: 'bubble_shield',
    passives: ['lovey_dovey', 'surface_tension'],
    art: '/images/pets/BubbleTrouble_Physical.webp',
    facing: 'Right',
    flavor: 'Half of a pair. Charges faster when its partner is on the roster.',
  },

  bubble_trouble_affinity: {
    id: 'bubble_trouble_affinity',
    name: 'Bubble Trouble',
    variant: 'Affinity',
    family: 'bubble',
    bond: 'bubble',
    role: ROLE.AFF_TANK,
    typing: { offensive: ELEMENT.WATER, defensive: ELEMENT.WATER },
    base: { hp: 8, atk: 20, def: 50, spc: 30 },
    special: 'bubble_shield',
    passives: ['lovey_dovey', 'undertow'],
    art: '/images/pets/BubbleTrouble_Affinity.webp',
    facing: 'Left',
    flavor: 'The other half. Drags attackers under with every popped shield.',
  },
};
