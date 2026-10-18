// src/data/gil/allies.js
// Allies who fight alongside Gil. Transcribed from the workbook's Allies tab.
import { SPIRIT_TIER, SHADOW_TIER } from './tiers';

export const AIDA = {
  id: 'aida',
  name: 'Aida',
  role: 'Mechmage',
  // Placeholder art until Aida's own portrait exists.
  image: '/images/characters/Castellan.webp',
  imagePlaceholder: true,
  affinity: 'Spirit',
  weakness: 'Shadow',
  tier: SPIRIT_TIER,
  resource: { key: 'battery', label: 'Ether Battery', start: 100 },
  // Health / Defense / Accuracy / Damage were never filled in on the sheet.
  statsNote: 'Health, Defense, Accuracy and Damage are not recorded on the sheet yet.',

  passives: [
    { type: 'Affinity', name: 'Spirit Affinity', desc: 'Weakness to Shadow Affinity damage.' },
    { type: 'Aura', name: 'Anti-Virus', desc: 'When a Drone is destroyed, next turn add +1d10 Spirit dmg to Basic Attacks. These Attacks can be Range 10.' },
    { type: 'Racial', name: 'Mechmage', desc: 'When destroyed, has a 50% chance to instead survive at 1 HP. Each stack of Protocol raises this to 100%.' },
    { type: 'Passive', name: 'Ether Battery', desc: 'Starts combat with 100 Ether Battery. Can use Battery to do various Actions.' },
    { type: 'Passive', name: 'Inevitability Protocol', desc: 'Each turn, gain 1 stack of Inevitability Protocol. At 10 stacks may destroy a Corrupted Mechmage.' },
    { type: 'Passive', name: 'Ether Vorpalblade', desc: 'Basic Attacks have dmg Advantage on Mechmages. Can also hit targets that are incorporeal.' },
    { type: 'Passive', name: 'Drone Coding', desc: 'When Basic Attacks deal dice dmg, gain X Drone Points. At 20, consume all and summon a Halo Drone.' },
  ],

  // Spend Ether Battery to use. "X" means a variable amount you choose.
  batterySpends: [
    { cost: 'X', name: 'Ether Shield', desc: 'Gain X/2 All Reduction against an Attack. Can be used on an Ally.' },
    { cost: 'X', name: 'Ether Patch', desc: 'Target reduces their Ether Corruption by X.' },
    { cost: 'X', name: 'Ether Blade', desc: 'Add +X/2 Ether dmg to an Attack. This Attack can also be Range X.' },
    { cost: 'X', name: 'System Lock', desc: 'Prevent X/3 Knockback from self or Ally.' },
    { cost: '10', name: 'Retarget Subroutine', desc: '(Defensive) Redirect Attack to this target. Use after Attack has Hit.' },
    { cost: '25', name: 'Purge.exe', desc: 'Remove all Debuffs from target.' },
    { cost: '25', name: 'Aimbot', desc: '(Instant) An Attack gains Truestrike.' },
    { cost: '30', name: 'Ether Charge', desc: 'Target gains +1d3 unique Actions.' },
    { cost: '30', name: 'Ether Recharge', desc: 'Target regains a Burst.' },
  ],

  // Techniques — `charges` is uses per fight.
  techniques: [
    { charges: 3, name: 'Ether Battery', desc: 'Regain 1dX Ether Battery, where X is how much Ether Battery is missing.' },
    { charges: 2, name: 'Sensing Field', desc: 'This turn, all Allies gain +5 Accuracy and +5 Defense.' },
    { charges: 2, name: 'Magnetic Judgement', desc: '(Hex) Pull Target to caster.' },
    { charges: 4, name: 'Halo Drones', desc: '(Conjuration) Summon 1 Halo Drone.' },
    { charges: 2, name: 'Custom Model', desc: '(Conjuration) Summon 1 Halo Drone. Choose the 3 effects.' },
    { charges: 1, name: 'Nova Drone', desc: '(Conjuration) Summon 1 Nova Drone. It has all 8 effects.' },
    { charges: 1, name: 'Seres Protocol', desc: 'Redistribute Ally HP.' },
    { charges: 1, name: 'Ether Overcharge', desc: '(Enhance) Gain 100 Ether Battery. For the next 3 turns, Attacks deal +2d10 Spirit dmg. Afterwards, lower Ether Battery to 0 and it cannot recover for the remainder of the battle.' },
  ],

  droneNote: 'A Halo Drone has 3 random abilities. Each ability has one use. Damage removes a random remaining ability.',
  droneAbilities: [
    { n: 1, name: 'Restore', desc: 'Target regains 3d10 HP.' },
    { n: 2, name: 'Judgement', desc: 'Attack, Range 10, deals 3d10 Spirit dmg.' },
    { n: 3, name: 'Chains of Absolution', desc: '(Debuff) Immobilize.' },
    { n: 4, name: 'Truelight', desc: '(Debuff) Attacks on target have Truestrike.' },
    { n: 5, name: 'Interception Interpolation', desc: '(Defensive) Intercept an Attack.' },
    { n: 6, name: 'Purge Protocol', desc: 'Remove a Debuff or Buff.' },
    { n: 7, name: 'Save State', desc: '(Instant) Luck Burst.' },
    { n: 8, name: 'Virgil 3:16', desc: 'Grant a random Affinity Petal and +2d10 dmg to Basic Attacks this turn, of a random Affinity type.' },
  ],
};

export const KITANA = {
  id: 'kitana',
  name: 'Kitana',
  role: 'Grassmoon',
  image: '/images/characters/Kitana.webp',
  affinity: 'Shadow',
  weakness: 'Spirit',
  tier: SHADOW_TIER,
  // Technical: begin combat with 5 Tech Points, +1 per Basic Attack.
  resource: { key: 'techPoints', label: 'Tech Points', start: 5, note: 'Begin combat with 5. Gain 1 when using a Basic Attack.' },
  stats: [
    { label: 'Health', value: 150 },
    { label: 'Defense', value: 18 },
    { label: 'Accuracy', value: 8 },
    { label: 'Damage', value: '1d12+8' },
    { label: 'Dodge', value: 3 },
    { label: 'Resist', value: 2 },
    { label: 'Restore', value: 1 },
  ],

  passives: [
    { type: 'Affinity', name: 'Shadow Affinity', desc: 'Weakness to Spirit Affinity damage.' },
    { type: 'Aura', name: 'Occular Ward', desc: 'Dodge Checks automatically pass.' },
    { type: 'Legendary Armor', name: 'Bunny Suit', desc: 'Gain +1 Movement and the ability to cast Super Jump once per day.' },
    { type: 'Blessed Item', name: 'Ruby Slippers', desc: 'May use Movement phase to Teleport behind a unit within sight.' },
    { type: 'Passive', name: 'Strider', desc: 'Can move through units.' },
    { type: 'Passive', name: 'Technical', desc: 'Begin Combat with 5 Tech Points. Gain a Tech Point when using a Basic Attack.' },
    { type: 'Passive', name: 'Sentinel Swiftness', desc: 'Movement 6, never suffers from movement penalties to Accuracy.' },
    { type: 'Passive', name: 'Perfect Dodge', desc: 'The first time damage would reduce this unit to 0 HP, may perform a dodge check. This can be used against critical hits.' },
  ],

  // Techniques — `charges` is the number from the sheet; null ("-") has no limit.
  techniques: [
    { group: 'Chakram', charges: 1, name: 'Throw Chakram', desc: 'Attack, Range 6, deal an additional 1d12 damage.' },
    { group: 'Chakram', charges: 1, name: 'Bounce', desc: '(Instant) When Throw Chakram hits a target, can attack an additional target within Range. Repeatable once.' },
    { group: 'Chakram', charges: 1, name: 'Hookshot', desc: '(Free Action) Range 4, pull target 4 spaces or pull towards target 4 spaces.' },
    { group: 'Chakram', charges: 3, name: 'Chakram Rotation', desc: 'Attack, Wave 1.' },
    { group: 'Chakram', charges: null, name: 'Marked for Demise', desc: 'Attack, inflict Marked for Death. The next instance of dmg deals max dmg.' },
    { group: 'Eyes', charges: null, name: 'All Seeing Eye', desc: '(Enhance) The next Attack this turn has Truestrike.' },
    { group: 'Eyes', charges: null, name: 'Occular Ward', desc: '(Debuff) After landing a melee attack, inflict 1 stack of Occular Ward. Gain +1 Defense against this unit for each stack. Max 3 stacks. Cannot be resisted.' },
    { group: 'Eyes', charges: 3, name: '6th Sense', desc: '(Defensive) Use a Dodge Burst.' },
    { group: 'Eyes', charges: 3, name: 'Evil Eyes', desc: 'Make X+3 Evil Eye Attacks, where X = amount of Occular Ward stacks. Each Attack is Range 20 and deals 1d10 Shadow dmg.' },
    { group: 'Eyes', charges: 1, name: 'Cold Stare', desc: '(Debuff) Inflict 4d4 Water dmg, Immobilize, and Expose.' },
    { group: 'Eyes', charges: 1, name: 'Glare', desc: '(Debuff) Inflict Paralyze.' },
    { group: 'Eyes', charges: 1, name: 'Shadow Stare', desc: '(Hex) 1d40 Shadow dmg. If 20+, Shake; 30+, Stagger; 39+, Stun.' },
    { group: 'Eyes', charges: 1, name: 'Ultra Instinct', desc: '(Enhance) For the next 3 turns, gain Truestrike and Truedodge. Dodges do not return Attacks.' },
  ],
};

export const ALLIES = [AIDA, KITANA];
