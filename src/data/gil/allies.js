// src/data/gil/allies.js
// Allies who fight alongside Gil. Transcribed from the workbook's Allies tab.

export const AIDA = {
  id: 'aida',
  name: 'Aida',
  role: 'Mechmage',
  // Placeholder art until Aida's own portrait exists.
  image: '/images/characters/Castellan.webp',
  imagePlaceholder: true,
  affinity: 'Spirit',
  weakness: 'Shadow',
  battery: { label: 'Ether Battery', start: 100 },
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

export const ALLIES = [AIDA];
