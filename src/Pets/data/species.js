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
    base: { hp: 5, atk: 35, def: 40, spc: 30 },
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
    base: { hp: 5, atk: 30, def: 40, spc: 25 },
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
    passives: ['get_away', 'parting_charge'],
    art: '/images/pets/Felightning.webp',
    facing: 'Right',
    flavor: 'Fast, fragile, and vindictive — it leaves the field with the lights still flickering.',
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
    passives: ['lovey_dovey', 'surface_tension'],
    art: '/images/pets/BubbleTrouble_Affinity.webp',
    facing: 'Left',
    flavor: 'The other half. Soaks elemental damage and banks charge off every popped shield.',
  },

  /* ══ SECOND WAVE ═══════════════════════════════════════════════════
   * Stat lines, roles, typings and mechanics are exactly as authored on the
   * cards. Where a card gave only a defensive typing, the offensive one follows
   * the convention of the role: PHYSICAL for Attackers, Tanks and Stunners
   * (which ignore the affinity chart), and the defensive element for the
   * Affinity roles and Support.
   *
   * `flavor` is deliberately absent — none was written, and the setup screen
   * simply renders nothing rather than showing invented text.
   */

  cerberus: {
    id: 'cerberus',
    name: 'Cerberus',
    family: 'cerberus',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 7, atk: 60, def: 15, spc: 20 },
    special: 'twin_fangs',
    passives: ['twin_bite', 'press_the_advantage'],
    art: '/images/pets/Cerberus.webp',
    facing: 'Right',
  },

  milk_truck: {
    id: 'milk_truck',
    name: 'Milk Truck',
    family: 'milktruck',
    role: ROLE.AFF_TANK,
    typing: { offensive: ELEMENT.SPIRIT, defensive: ELEMENT.SPIRIT },
    base: { hp: 10, atk: 20, def: 40, spc: 20 },
    special: 'milk',
    passives: ['milk_shake', 'second_stomach'],
    art: '/images/pets/MilkTruck.webp',
    facing: 'Left',
  },

  balto: {
    id: 'balto',
    name: 'Balto',
    family: 'balto',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 6, atk: 35, def: 35, spc: 35 },
    special: 'sled_charge',
    passives: ['first_light', 'fresh_legs'],
    art: '/images/pets/Balto.webp',
    facing: 'Left',
  },

  watthog: {
    id: 'watthog',
    name: 'Watthog',
    family: 'watthog',
    role: ROLE.AFF_ATTACKER,
    typing: { offensive: ELEMENT.AIR, defensive: ELEMENT.AIR },
    base: { hp: 5, atk: 35, def: 40, spc: 30 },
    special: 'chain_shock',
    passives: ['chain_lightning', 'supercharge'],
    art: '/images/pets/Watthog.webp',
    facing: 'Left',
  },

  quillbacabra: {
    id: 'quillbacabra',
    name: 'Quillbacabra',
    family: 'gnoll',
    role: ROLE.TANK,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 4, atk: 30, def: 40, spc: 40 },
    special: 'quill_guard',
    passives: ['bristleback', 'parting_quills'],
    art: '/images/pets/Quillbacabra.webp',
    facing: 'Right',
  },

  punchadillo: {
    id: 'punchadillo',
    name: 'Punchadillo',
    family: 'punchadillo',
    role: ROLE.STUNNER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 5, atk: 50, def: 30, spc: 20 },
    special: 'haymaker',
    passives: ['concussive_blast', 'rolling_guard'],
    art: '/images/pets/Punchadillo.webp',
    facing: 'Left',
  },

  mosstiff: {
    id: 'mosstiff',
    name: 'Mosstiff',
    family: 'mosstiff',
    role: ROLE.HEALER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.EARTH },
    base: { hp: 5, atk: 30, def: 35, spc: 25 },
    special: 'verdant_bloom',
    passives: ['photosynthesis', 'last_bloom'],
    art: '/images/pets/Mosstiff.webp',
    facing: 'Left',
  },

  bellybummer: {
    id: 'bellybummer',
    name: 'Bellybummer',
    family: 'bellybummer',
    role: ROLE.SUPPORT,
    typing: { offensive: ELEMENT.SHADOW, defensive: ELEMENT.SHADOW },
    base: { hp: 4, atk: 30, def: 30, spc: 40 },
    special: 'lifesteal',
    passives: ['spooked', 'stage_fright'],
    art: '/images/pets/Bellybummer.webp',
    facing: 'Left',
  },

  mega_chicken: {
    id: 'mega_chicken',
    name: 'Mega Chicken',
    family: 'megachicken',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.AIR },
    base: { hp: 4, atk: 50, def: 25, spc: 30 },
    special: 'talon_flurry',
    passives: ['raking_spurs', 'death_throes'],
    art: '/images/pets/MegaChicken.webp',
    facing: 'Left',
  },

  /* ══ THIRD WAVE ════════════════════════════════════════════════════ */

  /**
   * The card for this one was headed "Balto", but that name already belongs to
   * the Earth Attacker above and its card is unchanged — two different pets
   * cannot share it. The artwork is a lightning lion and the whole kit is
   * electric, so it ships under a provisional name with its own permanent id.
   */
  thunder_lion: {
    id: 'thunder_lion',
    name: 'Thunder Lion',
    provisional: true,
    family: 'thunderlion',
    role: ROLE.STUNNER,
    // Stunners ignore the affinity chart, so the offensive typing is inert and
    // set to AIR purely so the kit reads as electric in the UI.
    typing: { offensive: ELEMENT.AIR, defensive: ELEMENT.AIR },
    base: { hp: 6, atk: 35, def: 35, spc: 35 },
    special: 'thunderstorm',
    passives: ['electrofang', 'electrocyclone'],
    art: '/images/pets/ThunderLion.webp',
    facing: 'Left',
  },

  bone_boar: {
    id: 'bone_boar',
    name: 'Bone Boar',
    family: 'boneboar',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.SHADOW },
    base: { hp: 5, atk: 35, def: 40, spc: 30 },
    special: 'bone_gore',
    passives: ['bone_harvest', 'ossuary_guard'],
    art: '/images/pets/BoneBoar.webp',
    facing: 'Right',
  },

  wild_cat: {
    id: 'wild_cat',
    name: 'Wild Cat',
    family: 'wildcat',
    role: ROLE.ATTACKER,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.FIRE },
    base: { hp: 5, atk: 55, def: 30, spc: 25 },
    special: 'rip_and_tear',
    passives: ['ambush_instinct', 'scent_of_blood'],
    art: '/images/pets/WildCat.webp',
    facing: 'Left',
  },

  dragon_turtle: {
    id: 'dragon_turtle',
    name: 'Dragon Turtle',
    family: 'dragonturtle',
    role: ROLE.TANK,
    typing: { offensive: ELEMENT.PHYSICAL, defensive: ELEMENT.WATER },
    base: { hp: 8, atk: 20, def: 50, spc: 20 },
    special: 'shell_slam',
    passives: ['wear_down', 'impenetrable'],
    art: '/images/pets/DragonTurtle.webp',
    facing: 'Left',
  },
};
