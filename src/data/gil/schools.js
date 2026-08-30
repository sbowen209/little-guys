// src/data/gil/schools.js
// Gil's "Stolen Schools" — every spell school across the six affinities.
// Transcribed from the Gil Bowen character workbook (Earth/Water/Air/Fire/Spirit/Shadow tabs).
//
// Casting: 1 Petal = a random Minor from the school, 2 Petals = a random
// Intermediate, 4 Petals = that school's (locked) Advanced spell with no roll.
// Loadout rule: pick 4 schools, each of a DIFFERENT affinity.

export const AFFINITIES = {
  Earth:  { icon: '🌿', blurb: '4 schools' },
  Water:  { icon: '💧', blurb: '5 schools' },
  Air:    { icon: '🌪️', blurb: '3 schools' },
  Fire:   { icon: '🔥', blurb: '2 schools' },
  Spirit: { icon: '✨', blurb: '4 schools' },
  Shadow: { icon: '🌑', blurb: '5 schools' },
};

export const AFFINITY_ORDER = ['Earth', 'Water', 'Air', 'Fire', 'Spirit', 'Shadow'];

// Literal Tailwind class strings per affinity (kept literal so Tailwind's
// scanner never purges them).
export const AFF_STYLE = {
  Earth: {
    text: 'text-lime-300', ring: 'ring-lime-400/60', border: 'border-lime-500/50',
    solid: 'bg-lime-500', softBg: 'bg-lime-500/10', hover: 'hover:border-lime-400',
    chip: 'bg-lime-500/15 text-lime-200 border border-lime-500/40',
    glow: 'shadow-[0_0_35px_-8px_rgba(132,204,22,0.55)]', grad: 'from-lime-500/20',
    dot: 'bg-lime-400',
  },
  Water: {
    text: 'text-sky-300', ring: 'ring-sky-400/60', border: 'border-sky-500/50',
    solid: 'bg-sky-500', softBg: 'bg-sky-500/10', hover: 'hover:border-sky-400',
    chip: 'bg-sky-500/15 text-sky-200 border border-sky-500/40',
    glow: 'shadow-[0_0_35px_-8px_rgba(14,165,233,0.55)]', grad: 'from-sky-500/20',
    dot: 'bg-sky-400',
  },
  Air: {
    text: 'text-cyan-300', ring: 'ring-cyan-400/60', border: 'border-cyan-500/50',
    solid: 'bg-cyan-500', softBg: 'bg-cyan-500/10', hover: 'hover:border-cyan-400',
    chip: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40',
    glow: 'shadow-[0_0_35px_-8px_rgba(6,182,212,0.55)]', grad: 'from-cyan-500/20',
    dot: 'bg-cyan-400',
  },
  Fire: {
    text: 'text-orange-300', ring: 'ring-orange-400/60', border: 'border-orange-500/50',
    solid: 'bg-orange-500', softBg: 'bg-orange-500/10', hover: 'hover:border-orange-400',
    chip: 'bg-orange-500/15 text-orange-200 border border-orange-500/40',
    glow: 'shadow-[0_0_35px_-8px_rgba(249,115,22,0.55)]', grad: 'from-orange-500/20',
    dot: 'bg-orange-400',
  },
  Spirit: {
    text: 'text-fuchsia-300', ring: 'ring-fuchsia-400/60', border: 'border-fuchsia-500/50',
    solid: 'bg-fuchsia-500', softBg: 'bg-fuchsia-500/10', hover: 'hover:border-fuchsia-400',
    chip: 'bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/40',
    glow: 'shadow-[0_0_35px_-8px_rgba(217,70,239,0.55)]', grad: 'from-fuchsia-500/20',
    dot: 'bg-fuchsia-400',
  },
  Shadow: {
    text: 'text-violet-300', ring: 'ring-violet-400/60', border: 'border-violet-500/50',
    solid: 'bg-violet-500', softBg: 'bg-violet-500/10', hover: 'hover:border-violet-400',
    chip: 'bg-violet-500/15 text-violet-200 border border-violet-500/40',
    glow: 'shadow-[0_0_35px_-8px_rgba(139,92,246,0.55)]', grad: 'from-violet-500/20',
    dot: 'bg-violet-400',
  },
};

// Each school: id, name, affinity, minorDie, interDie, traits[] (passive/debuff/
// buff/summon lines), minors[], inters[], advanced ({name,desc} | null).
export const SCHOOLS = [
  // ────────────────────────────── EARTH ──────────────────────────────
  {
    id: 'quills', name: 'Quills', affinity: 'Earth', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Quillburback', desc: 'Each time an Earth Petal is used, gain 1 Quillburback stack. When next damaged in melee range, the attacker takes 5X dmg and all Quillburback stacks are consumed.' },
      { type: 'Debuff', name: 'Quilled', desc: 'For each stack of Quilled, target suffers X dmg at the start of each turn. May spend Standard + Affinity phases to remove all stacks. When pushed into an object, suffer the Quilled damage twice.' },
    ],
    minors: [
      { name: 'Quill Shield', desc: '(Defensive) Gain +10 Reduction against an Attack, then inflict 1d10 dmg to the attacker. Inflict a Quilled stack on 6+.' },
      { name: 'Quillbolt', desc: 'Attack, Range 6, deals 1 dmg 2d10 times. Inflict 1 stack of Quilled for each 5 dmg done.' },
      { name: 'Affinity Quill', desc: 'Attack, Range 6, 1d4 dmg, inflict 1 stack of Quilled. Based on the damage roll also inflict — 1: Toxic, 2: Immobilize, 3: Paralyze, 4: Burning.' },
    ],
    inters: [
      { name: 'Quilled Mallet', desc: 'Attack, Range 1, 3d10 dmg, Knockback 4 in a cardinal direction (other than self). Inflict 3 stacks of Quilled.' },
      { name: 'Quill Cross', desc: 'Attack, Cross 5, 3d4 dmg, inflict 3 stacks of Quilled. If only a single target is hit, inflict 6 stacks of Quilled.' },
    ],
    advanced: { name: 'Quilltastrophe', desc: 'Attack, Wave 2, 3d10 dmg, inflict Quilled on rolls of 6+. Gain 5 stacks of Quillburback. When damaged, the attacker takes 5 dmg and the stacks decrease by 1.' },
  },
  {
    id: 'rock-solid', name: 'Rock Solid', affinity: 'Earth', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Earthen Shield', desc: 'When casting a spell, gain 1 / 2 / 4 Physical Damage Shields (by spell level).' },
    ],
    minors: [
      { name: 'Quake Pulse', desc: 'Attack, Wave 1, 1d8 Earth dmg, inflict Shake.' },
      { name: 'Useless Rock', desc: 'Summon a 50 HP, 10 Reduction, 2x2 Rock. Can be targeted with Vine Helix to gain 1 Earth Petal (one time only).' },
      { name: 'Rock Fist', desc: 'Attack, Range 6, 2d10 Earth dmg, inflict Stagger.' },
    ],
    inters: [
      { name: 'Stone Shards', desc: 'Perform 3 attacks, Range 6, each dealing 2d4 Earth dmg. If one hits: Shake. If two: Stagger. If three: Stun.' },
      { name: 'Stone Shell', desc: 'Gain 2 Temporary Block Bursts.' },
    ],
    advanced: { name: 'Boulder Buster', desc: 'Attack, Range 1, 6d8 Earth dmg, Knockback 6. If the target collides with a SOLID object, they suffer 6d8 more dmg.' },
  },
  {
    id: 'natures-wrath', name: "Nature's Wrath", affinity: 'Earth', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Bloom', desc: 'When casting a spell, add 1 / 2 / 4 stacks to the Green Flower roll at the end of the turn.' },
    ],
    minors: [
      { name: 'Rose Whip', desc: 'Attack, Range 6, 1d6+DM Earth dmg, inflict Bleed. May pull self to target or vice-versa. May double the range, but this reduces the damage to 1.' },
      { name: 'Useful Tree', desc: 'Summon a 2x2 Tree with 100 HP. Can be targeted with Vine Helix to gain 1 Earth Petal (one time only).' },
      { name: 'Thorn Barrage', desc: 'Attack, Range 6, 4d4 dmg, inflict Bleed for each 4 rolled. May split this into smaller attacks against different targets.' },
    ],
    inters: [
      { name: 'Prehistoric Poppy', desc: '(Conjuration) Summon a Prehistoric Poppy within sight. When summoned it deals 3d6 Earth dmg to adjacent enemies and heals adjacent allies 3d6 HP. In both cases, 6\'s inflict Toxic / Lifebloom.' },
      { name: 'Rejuvenate', desc: 'For 3 turns, gain 3d6 HP at the start of each turn.' },
    ],
    advanced: { name: 'Wood Hammer', desc: 'Attack, hits on a natural 15+, gains +1 to hit for each Conjuration, 20d6 Earth dmg, Knockback 10, Knockdown.' },
  },
  {
    id: 'diggin', name: "Diggin' uh-ah-uh Diggin'", affinity: 'Earth', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Molerat', desc: 'All spells are cast via the Molerat. When a spell is cast he surfaces. He can make attacks for 2d8 dmg. Gil takes 50% of the damage he takes. He goes underground at the end of the next turn. Gil can\'t cast Molerat spells while he is above ground.' },
    ],
    minors: [
      { name: 'Molar Maul', desc: 'Attack, Range 1, 2d8 dmg, inflict Expose.' },
      { name: 'Fissure', desc: 'Attack, Wave 1, 1d10 Earth dmg, Knockdown.' },
      { name: 'Diggin\' Daze', desc: '(Debuff) Inflict Blind and Expose.' },
    ],
    inters: [
      { name: 'Dig', desc: 'Caster tunnels underground. Next turn, can emerge within 10, dealing 1d10 Earth dmg in Wave 1 and Knockdown.' },
      { name: 'Incursion', desc: 'Molerat surfaces for an Attack. Afterwards he gains 40 Temp HP and remains above ground. He can cast spells while in this state.' },
    ],
    advanced: { name: 'Earthquake', desc: '(Molerat does not surface) Attack, Wave 4, 4d10 Earth dmg, Knockdown.' },
  },

  // ────────────────────────────── WATER ──────────────────────────────
  {
    id: 'frogadiers', name: 'Frogadiers', affinity: 'Water', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Swap Frog', desc: 'When rolling a frog, may reroll once within the same spell level (or spell levels below).' },
    ],
    minors: [
      { name: 'Treeborn Frog', desc: 'Remains on the field for 3 turns. During that time he can be sacrificed to take the damage for an Attack. When he does, he grants 1 damage shield.' },
      { name: 'Quiz Toad', desc: 'Stays on the field until a guess is made. Offers three prizes: 3d6 HP, +3d6 dmg on Basic Attacks, +1 Petal. Plays a round of the Balloon game. Within 5: 1 prize. Within 3: 2 prizes. On the dot: all three.' },
      { name: 'Toxi-Toad', desc: 'When summoned, applies Toxic to an enemy. Stays on the field until dismissed to remove a Debuff, but inflicts Toxic.' },
    ],
    inters: [
      { name: 'Ronintoadin', desc: 'Each turn may hop 10. Stays on the field until he makes an Attack, Lance 15, dealing 3d8 Pierce dmg to all units passed through.' },
      { name: 'Shadow Light Succutoad', desc: 'Stays on the field until an Angel\'s Luck Reroll and a Devil\'s Luck Reroll are both used.' },
    ],
    advanced: { name: 'Toadally Awesome', desc: 'He\'s Toadally Awesome.' },
  },
  {
    id: 'rinse-and-wash', name: 'Rinse and Wash', affinity: 'Water', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Rinse Cycle', desc: 'When targeting allies, may inflict Wet to remove a debuff. This is not optional on female allies, even if they have no debuffs.' },
      { type: 'Debuff', name: 'Wet', desc: 'Target suffers disadvantage on all attacks during their turn.' },
    ],
    minors: [
      { name: 'Rinse', desc: '(Hex) Target loses all debuffs / buffs at the Minor level or below. If used on an ally, heal 1d6 for each removed effect.' },
      { name: 'Slip\'n\'Slide', desc: 'Shift 10 spaces in a lance, moving units you collide with.' },
      { name: 'Water Lash', desc: 'Attack, Range 7, 2d8 Water dmg, inflict Wet.' },
    ],
    inters: [
      { name: 'Group Revitalize', desc: 'A target within 10 regains 3d6 HP. Repeats to all allies within Range 10 of the previous target. If it only affects 1 ally, they regain 5d6 instead.' },
      { name: 'Bubble Shield', desc: '(Enchant) Target gains 20 Temporary Hit Points. When the bubble breaks, provides +30 All Reduction against whatever damage is remaining.' },
    ],
    advanced: { name: 'Revitalize', desc: '(Enchant) Target within Range 7 regains 12d6 HP.' },
  },
  {
    id: 'ice-is-nice', name: 'Ice is Nice', affinity: 'Water', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Cold Focus', desc: 'When casting an Ice spell, gain advantage on all attacks made this turn.' },
      { type: 'Debuff', name: 'Vulnerable', desc: 'The next damage source has advantage. Attacks that inflict Vulnerable do not proc Vulnerable.' },
    ],
    minors: [
      { name: 'Frost Nova', desc: 'Attack, Wave 1, 2d4 Water dmg, Immobilize.' },
      { name: 'Ice Wall', desc: 'Gain a temporary Block Burst. When used on an Attack, inflicts Vulnerable.' },
      { name: 'Ice Shards', desc: 'Make two attacks, Range 8, each dealing 2d4 Water dmg and inflicting 1 stack of Vulnerable.' },
    ],
    inters: [
      { name: 'Frozen Armor', desc: 'Gain 30 Reduction. Each time this reduction prevents damage, lower it by that amount. Inflict Vulnerable on attackers in melee range.' },
      { name: 'Shatter', desc: '(Hex) 7d4 Water dmg, inflict Vulnerable. If the target is Vulnerable or Immobilized, deals double damage.' },
    ],
    advanced: { name: 'Absolute Zero', desc: 'Attack, Range 1, 12d4 Water dmg, inflict Stun. If the target has less HP remaining than the damage done, they are Frozen Solid.' },
  },
  {
    id: 'suplex-city', name: 'Suplex City', affinity: 'Water', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Roar of the Crowd', desc: 'Attacks from this school gain +1 Accuracy for each non-enemy watching.' },
    ],
    minors: [
      { name: 'Vulpirin Whiptoss', desc: 'Attack, Range 1, Knockback 7. If they collide with a hard obstacle they come back. When adjacent, make a Basic Attack with Knockdown if successful.' },
      { name: 'No-Sell', desc: '(Defensive) Gain a temporary Block / Coating Burst. When used, the rest of the enemy\'s turn is skipped.' },
      { name: 'Suplex', desc: 'Attack, Range 1, 3d6 dmg. They are moved to the space 180° behind the attacker and inflicted with Knockdown. If they collide with an enemy, that enemy is Knocked Down too.' },
    ],
    inters: [
      { name: 'Sweet Chin Music', desc: 'Attack, Range 1. Shift 5 before making the Attack. 3d10 dmg, inflict Stagger.' },
      { name: 'Suplex City', desc: 'Attempt to cast Suplex on a target 3 times. If any of those attempts miss, do not perform the remaining Attacks.' },
    ],
    advanced: { name: 'Dongdell Dive', desc: '(Consumes all Actions except Movement) Attack, Range 1, 10d10 dmg, inflict Knocked Down and Stun.' },
  },
  {
    id: 'water-spirits', name: 'Water Spirits', affinity: 'Water', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Water Spirits', desc: 'All healing done to Gil is +1. Casting a Water spell generates 1d4 Water Spirits. When Water Spirits reach 10, reset back to 10 and randomly summon either Droplets, Wet Bone, or Big Drop.' },
    ],
    minors: [
      { name: 'Spiritual Attunement', desc: 'Gain +1d4 Water Spirits and heal for twice that amount.' },
      { name: 'Droplets', desc: 'All allies regain 1d6 HP. On a 4+ they can remove a debuff.' },
      { name: 'Mouse', desc: '(Conjuration) Searches for 3 turns. Each turn roll 1d6. On a 5+, gain an Affinity Petal and regain 1 HP.' },
    ],
    inters: [
      { name: 'Spiritual Attunement Plus', desc: 'Gain +1d4 Water Spirits and +1d4 Water Petals.' },
      { name: 'Big Drop', desc: '(Conjuration) Summon Big Drop within 5. If summoned on an occupied square, push the target 5. It can then move 5, pushing targets it collides with. Push damage is tripled.' },
    ],
    advanced: { name: 'Spiritual Assault', desc: '(Conjuration) Summon Droplets, Wet Bone, and Big Drop for 3 turns.' },
  },

  // ─────────────────────────────── AIR ───────────────────────────────
  {
    id: 'gale-kicks', name: 'Gale Kicks', affinity: 'Air', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Gale Gale', desc: 'After casting an Air Affinity ability, gain 1 Gale Point for each Air Petal used.' },
      { type: 'Buff', name: 'Gale Points', desc: 'After a successful Attack, may spend a Gale Point to dash to the target and make an attack, inflicting 1d8 Air dmg with Knockback 1.' },
    ],
    minors: [
      { name: 'Gale Kicks', desc: 'Attack, 2d8 Air dmg, gain 1 Gale Point.' },
      { name: 'Whirlwind Kick', desc: 'Shift up to 2, then Attack, Wave 1, 1d8 Air dmg, Knockback 2. Gain a Gale Point if only 1 target is damaged.' },
      { name: 'Wind Tunnel Roundhouse', desc: 'Attack, 1d8 Air dmg, Knockback 10. Gain a Gale Point if they collide with an object.' },
    ],
    inters: [
      { name: 'Cyclotron', desc: 'Attack, Range 8. Dash to the target and make 6 Attacks, each dealing 1d8 Air dmg.' },
      { name: 'Vacuum Wave', desc: 'Attack, Wave 1, 2d8 Air dmg, Knockback 3. Can pull any number of targets up to 5 before attacking (if the pull would move them into Wave 1).' },
    ],
    advanced: { name: '10 Trigrams Cyclonic Fury', desc: 'Only usable if the target is exactly 8 spaces away. Make 10 attacks, each dealing 1d8 Air dmg with Knockback 1. Gain a Gale Point for each attack that hits.' },
  },
  {
    id: 'wind-cutting', name: 'Wind Cutting', affinity: 'Air', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Wind Blade', desc: 'Each Air Petal used grants 1 stack of Windblade. They can be used to make a Basic Attack with Range 10 + Pierce.' },
      { type: 'Buff', name: 'Airborne', desc: 'Gain +5 Defense, cannot be targeted by melee. When damaged, roll 1d20 with advantage. If the roll is less than half the damage dealt, fall from the sky — 10 dmg and Knockdown.' },
    ],
    minors: [
      { name: 'Super Jump', desc: '(Enhance) Gain Airborne. Next turn, can begin up to 10 spaces away.' },
      { name: 'Wind Sheers', desc: 'Make 3 attacks, Range 10, 1d8 Air dmg, Pierce.' },
      { name: 'Blowback', desc: 'Attack, Range 10, 1d10 Air dmg, Pierce, Knockback = damage inflicted.' },
    ],
    inters: [
      { name: 'Wind Barrier', desc: 'Gain a temporary Barrier Burst.' },
      { name: 'Sweeping Wind', desc: 'Attack, Range 10, Sweep, 3d8 Air dmg with Pierce.' },
    ],
    advanced: { name: 'Wind Blade', desc: '(Enhance) Upgrade all current Windblade stacks to Hurricane Windblades, which deal +10 Air dmg when used. The final stack used has Runthrough.' },
  },
  {
    id: 'lightning-fury', name: 'Lightning Fury', affinity: 'Air', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Flashstep', desc: 'When casting a Lightning spell, may shift 7 spaces before or after the spell.' },
    ],
    minors: [
      { name: 'Marked by Lightning', desc: '(Debuff) Inflict Paralyze. When their turn is skipped, they instead suffer 1d10 dmg.' },
      { name: 'Volt Switch', desc: 'Attack, Range 10, 1d10 Air dmg. Gain either 1 extra action or 1 Affinity Petal.' },
      { name: 'Lightning Strikes Twice', desc: 'Gain a temporary Luck Burst.' },
    ],
    inters: [
      { name: 'Rolling Thunder', desc: 'Using the line tool, make an Attack on all targets dealing 1d20 Air dmg.' },
      { name: 'Chain Lightning', desc: 'Attack, Range 10, 1d30 Air dmg. On a high roll, repeat the attack on a different target.' },
    ],
    advanced: { name: 'Lightning Bolt', desc: 'Attack. Target suffers 1d40 Air dmg. Make a line tool from the target. Each enemy in this lance suffers 1d20 Air dmg.' },
  },

  // ─────────────────────────────── FIRE ──────────────────────────────
  {
    id: 'rose-flame', name: 'Rose Flame', affinity: 'Fire', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Rose Flamme', desc: 'Casting a Rose Flame spell summons a Rose Flame in an unoccupied area. If Vine Helix passes through it, it deals +2d6 Fire dmg. If a unit steps in the flame, or attacks it, it is snuffed (stepping in it inflicts 2d6 dmg as well).' },
    ],
    minors: [
      { name: 'Rose Bolt', desc: 'Attack, Range 7, 3d6 Fire dmg. If it passes through a Rose Flame, deals 5d6 instead.' },
      { name: 'Helix Ignition', desc: '(Enhance) This turn Vine Helix gains the effect of passing through a Rose Flame, even if it does not. May cast Vine Helix as a Free Action this turn.' },
      { name: 'Rose Flash', desc: '(Debuff) Splash 1, inflict Blind. If centered on a Rose Flame, lowers Defense to 8 as well.' },
    ],
    inters: [
      { name: 'Rose Bloom', desc: '(Hex) Inflict 4d6 Fire dmg. Can then Bloom an unbloomed Flower.' },
      { name: 'Rose Vineflame', desc: 'Attack, Range 7, 4d6 Fire dmg, Immobilize.' },
    ],
    advanced: { name: 'Rose Garden', desc: 'Summon a Blue and a Red flower within 10. Then make a triangle with the caster. All units, including allies, within the triangle are Attacked for 4d6 Fire dmg.' },
  },
  {
    id: 'scorch', name: 'Scorch', affinity: 'Fire', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Ignition', desc: 'All 6\'s rolled when rolling Fire damage have Chain.' },
    ],
    minors: [
      { name: 'Firebolt', desc: 'Attack, Range 7, 4d6 Fire dmg.' },
      { name: 'Flame Shield', desc: 'Gain a Temporary Flame Shield Burst. When attacked in melee range, the attacker suffers 2d6 Fire dmg and Burning.' },
      { name: 'Burning Point', desc: '(Enhance) The next Basic Attack deals +2d6 Fire dmg in Splash 1 of the target.' },
    ],
    inters: [
      { name: 'Flame Sword', desc: '(Enchant) The next 3 Basic Attacks deal an additional 3d6 Fire dmg.' },
      { name: 'Fireball', desc: 'Attack, Range 7, Splash 1, 5d6 Fire dmg.' },
    ],
    advanced: { name: 'Scorching Ray', desc: 'Attack, Lance 8, 8d6 Fire dmg, inflict Burning.' },
  },

  // ────────────────────────────── SPIRIT ─────────────────────────────
  {
    id: 'tea-time', name: 'Tea Time', affinity: 'Spirit', minorDie: 6, interDie: 0,
    note: 'Special: roll d6 for a Minor. No Intermediate or Advanced — the six teas ARE the school.',
    traits: [
      { type: 'Passive', name: 'Tea is Served', desc: 'Teapots can be summoned anywhere. When consumed they grant +1d6 HP and +1d6 dmg on the next Basic Attack. Each turn they sit, they gain additional bonuses. If they sit for too long they get cold and lose their bonuses.' },
    ],
    minors: [
      { name: 'Earl Grey', desc: '(T1 +1d6 HP) (T2 1 Dmg Shield) (T3 10 Reduction Block Burst) (T4 +2d6 HP) (T5 COLD)' },
      { name: 'Butterfly', desc: '(T1 Remove Debuff) (T2 Cultivate Roll) (T3 Cultivate Roll) (T4 COLD)' },
      { name: 'Oolong', desc: '(T1 Next BA is Wave 1) (T2 Teleport 10) (T3 COLD)' },
      { name: 'Chai', desc: '(T1 +1d6 dmg) (T2 +2d6 dmg) (T3 Power Attack Burst) (T4 Fire Petal) (T5 +2d6 dmg) (T6 Next Attack inflicts Burn) (T7 COLD)' },
      { name: 'Jasmine', desc: '(T1 Can reroll a Petal) (T2 +1d6 HP) (T3 Extra Action) (T4 Can reroll a Petal) (T5 Extra Action) (T6 COLD)' },
      { name: 'Tea Butler', desc: 'Choose any tea. The Butler prepares it starting from Turn 1. Each turn he can move 5.' },
    ],
    inters: [],
    advanced: null,
  },
  {
    id: 'hugs-and-kisses', name: 'Hugs and Kisses', affinity: 'Spirit', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Horny', desc: 'Gain 1 stack of Lustful whenever a spell is cast.' },
      { type: 'Buff', name: 'Lustful', desc: 'Remove a token to reroll a missed Attack. This effect is mandatory when an Attack misses.' },
    ],
    minors: [
      { name: 'Hungry Eyes', desc: '(Debuff) Inflict Pacifism.' },
      { name: 'Flirt', desc: '(Hex) Each of the target\'s actions has a 50% chance to be transferred to the caster.' },
      { name: 'Cuddle', desc: 'Attack, Range 1, 1d10 dmg. Caster and target make attack rolls until the target wins, suffering 1d10 dmg for each loss.' },
    ],
    inters: [
      { name: 'Big Hug', desc: 'Attack, Range 1, 5d10 dmg. Can shift the target to any other adjacent space.' },
      { name: 'Smooch', desc: '(Hex) Range 1, inflict 3d6 Spirit dmg and gain 2 stacks of Lustful.' },
    ],
    advanced: { name: 'Love Machine', desc: 'Regain all Bursts, then replace each Burst with a "Walking on Sunshine" Burst. These bursts act as Block + Coating + Resist.' },
  },
  {
    id: 'bewitch', name: 'Bewitch', affinity: 'Spirit', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Mirror Image', desc: 'Casting a Spirit spell summons 1 Mirror Image. These have 1 HP, may only Basic Attack, and do not deal DM.' },
    ],
    minors: [
      { name: 'Angel\'s Luck', desc: '(Enchant) Gain 1 stack of Angel\'s Luck. If the reroll fails, gain 1 Spirit Petal.' },
      { name: 'Counterspell', desc: 'Gain a temporary Counterspell Burst. Can be used to counter the casting of a Minor level spell.' },
      { name: 'Translocate', desc: '(Hex) Target shifts 8 spaces.' },
    ],
    inters: [
      { name: 'Despell', desc: '(Enchant) Gain a temporary Resist Burst. May be used as a Hex to remove a buff from an enemy.' },
      { name: 'Deconstruct', desc: '(Hex) Deals 10d10 Spirit dmg to a target made of Affinity. The spell may instead provide 1 Spirit Petal.' },
    ],
    advanced: { name: 'Haste', desc: '(Enchant) Gain 4 extra actions, with no phase being used by more than two actions. May reroll 1 dice during these free actions.' },
  },
  {
    id: 'mesmerizing-mist', name: 'Mesmerizing Mist', affinity: 'Spirit', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Mist Elements', desc: 'When casting a spell, may reroll the affinity on up to 1 / 2 / 4 Affinity Petals. When rerolling, may roll two dice and choose which option is preferred.' },
    ],
    minors: [
      { name: 'Phantom Mist Duplication', desc: 'Gain a Phantom Mist Duplication Burst, which can be used to duplicate the cast of a Minor level spell.' },
      { name: 'Lost in the Mist', desc: 'Shift 1. Ally becomes invisible for 1 turn and leaves behind a 1 HP Mist Entity.' },
      { name: 'Makyo Mist', desc: '(Enhance) Gain a Temporary Makyo Mist Burst. Can be used to nullify a *reasonable* ranged projectile.' },
    ],
    inters: [
      { name: 'Mistform Barrier', desc: '(Enhance) Gain a Temporary Burst of the user\'s wish (within reason).' },
      { name: 'Mistform Changeling', desc: '(Conjuration) Summon a 30 HP duplicate of a target. It may only perform Basic Attacks. Cannot target Gil.' },
    ],
    advanced: { name: 'Rainbow Mist', desc: 'Cast 4 Minor spells of your choosing from among any spell schools.' },
  },

  // ────────────────────────────── SHADOW ─────────────────────────────
  {
    id: 'augmented-armor', name: 'Augmented Armor', affinity: 'Shadow', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Shadow Armor', desc: 'When casting a Shadow spell from this school, summon a Shadow Armor for 3 turns. It gains whatever augmentations it is given. New augmentations add on and re-extend the duration to 3 turns. The armor has Gil\'s stats, but no DM.' },
    ],
    minors: [
      { name: 'Augment: Attack', desc: 'The armor gains +5 DM.' },
      { name: 'Augment: Defense', desc: 'The armor gains +3 Reduction. The armor gains 3 damage shields that either it or the caster may use.' },
      { name: 'Augment: Speed', desc: 'The armor gains +5 Movement and Truestrike.' },
    ],
    inters: [
      { name: 'Augment: Pulse', desc: 'Each turn the armor may make an Attack, Wave 1, dealing 1d10 Shadow dmg and inflicting Spell-lock if a 6+ is rolled.' },
      { name: 'Augment: Duration', desc: 'Add +4 to the turn duration. While affected by this, new augmentations add +3 turns instead of setting the duration to 3 turns.' },
    ],
    advanced: { name: 'Augment: Cannon', desc: 'May make an attack, Range 10, Splash 1, dealing 4d10 Shadow dmg. Doubled if only a single target is in the blast radius. Takes 4 turns to recharge (4 turns of not using it).' },
  },
  {
    id: 'green-shift-necromancy', name: 'Green Shift Necromancy', affinity: 'Shadow', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Shadow Pooling', desc: 'Whenever a Shadow Petal is used, add +1d20 to the Shadow Pool. 70 points may be used to conjure the Gemini.' },
      { type: 'Summon', name: 'Supergrass Skeleton', desc: '20 HP, 10 Defense, 3 Accuracy, 1d6+3 dmg. When destroyed, the summoner regains 2d6 HP.' },
      { type: 'Summon', name: 'Gemini', desc: '70 HP, 10 Defense, 7 Accuracy, 3d6 Shadowbolt Basic Attack. Has the Skeleton passive and Conjoined Skeleton. So long as there is no Supergrass Skeleton, may cast Green Shift OPT.' },
    ],
    minors: [
      { name: 'Green Skele Summon', desc: '(Conjuration) Summon a SG Skeleton. It may immediately attempt a Basic Attack.' },
      { name: 'Green Shift', desc: '(Enhance) Gain a Green Shift Burst. When taking damage, may use that Burst to conjure a SG Skeleton that takes the damage instead. If the Skeleton dies from this damage, all that damage is also taken by the caster.' },
      { name: 'Conjoined Skeleton', desc: '(Buff) Target gains a Conjoined Skeleton. It has the stats of a SG Skeleton but cannot move. When the host takes damage, this has a 50% chance to take the damage instead. Overkill is dealt to the host.' },
    ],
    inters: [
      { name: 'Twin Skele Summon', desc: 'Cast Green Skele Summon twice. This turn, for each of their successful Attacks, regain 2d6 HP.' },
      { name: 'Aggressive Twin', desc: '(Debuff) Cast Conjoined Skeleton on an enemy. It can make an Attack each turn, has 20 HP, and does not take damage for the host. It has Truestrike attacking the host.' },
    ],
    advanced: { name: 'Gemini', desc: '(Necromancy) Summon the Gemini. This does not proc Shadow Pooling. Convert all current Shadow Pool points into Max HP for the Gemini.' },
  },
  {
    id: 'bramble-shadows', name: 'Bramble Shadows', affinity: 'Shadow', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Elastic Shadow', desc: 'Before or after casting a Shadow spell, may perform an Elastic Shadow that turn. This is a Range 6 attack that can pull a target (but must successfully "Attack" the target to pull them).' },
    ],
    minors: [
      { name: 'Poisoned Shadow', desc: 'Attack, Range 8, 1d8 Shadow dmg. They take it again at the start of their next turn. Each time it ticks it has a 50% chance to be removed.' },
      { name: 'Bramble Shadow', desc: '(Conjuration) Summon a 6-attack Bramble Shadow. It can perform 2 attacks a turn at half accuracy (rounded down).' },
      { name: 'Shadow Strike', desc: 'Teleport up to 10 spaces. Any Basic Attacks made this turn deal +1d10 Shadow dmg.' },
    ],
    inters: [
      { name: 'Shadow Chakram', desc: 'Attack, Range 6, 1d12+10 dmg. Cannot be used in melee range. Can Bounce to one additional target.' },
      { name: 'Stronger Shadow', desc: 'Perform a Minor of choice at Intermediate level (Poisoned Shadow deals 2d8, Bramble has 12 attacks, Shadow Strike can teleport an ally as well and deals +2d10 Shadow dmg).' },
    ],
    advanced: { name: 'Avatar of Vengeance', desc: '(Conjuration) Summon a 50 HP Avatar of Vengeance. It can make the summoner\'s Basic Attack each turn, and Teleport 10 as Movement.' },
  },
  {
    id: 'shadow-power', name: 'Shadow Power', affinity: 'Shadow', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Black Blade', desc: 'Whenever a Shadow spell is queued or cast, Basic Attacks that turn gain Blackblade, dealing +1d10 Shadow dmg with Lifesteal (on the Shadow damage only).' },
    ],
    minors: [
      { name: 'Devil\'s Luck', desc: '(Debuff) Target gains 1 stack of Devil\'s Luck. If they succeed in their reroll, gain 1 Shadow Petal.' },
      { name: 'Thought Seize', desc: '(Hex) Inflict 2d4 Shadow dmg and Silence. The target may take 4d4 additional damage to change Silence to Spell-locked.' },
      { name: 'Agony', desc: '(Debuff) Target suffers 1d6 dmg at the start of each turn. If a 1 is rolled, this effect is removed and the target skips their turn.' },
    ],
    inters: [
      { name: 'Shadow Bolt', desc: 'Attack, Range 7, 6d6 Shadow dmg, chain 6\'s.' },
      { name: 'Shadow Strike', desc: 'Three shadow copies of the caster are conjured to make Basic Attacks on three unique targets. Alternatively, may summon 2 to attack the same target.' },
    ],
    advanced: { name: 'Darksaber', desc: 'The next Basic Attack deals +6d10 dmg, Lifesteal, Truestrike.' },
  },
  {
    id: 'void', name: 'Void', affinity: 'Shadow', minorDie: 3, interDie: 2,
    traits: [
      { type: 'Passive', name: 'Black Garden', desc: 'Upon casting the first Shadow spell of the fight, summon a Black Garden Plant. Each spell cast increases its HP by 10 per spell level. Can choose to summon the Black Rose undead, with HP equal to the Black Garden\'s HP.' },
      { type: 'Summon', name: 'Zombie', desc: '1 HP, 8 Def, 0 Accuracy, 4d4 dmg. Automatically hits attacks of opportunity.' },
      { type: 'Summon', name: 'Black Rose', desc: 'X HP, 15 Def, 10 Accuracy, 1d10+10 dmg. Attacks inflict Toxic. Melee attackers suffer 1d4 dmg. (Pandemic) Units that begin their turn next to this unit suffer 2d4 dmg.' },
    ],
    minors: [
      { name: 'Grave Assault', desc: '(Hex) 1d10 Shadow dmg. Summon a Zombie which immediately attacks the target.' },
      { name: 'Void Sphere', desc: 'Attack, Range 7, ignores adjacency, 1d10+DM, Spell-lock.' },
      { name: 'Zombie Master', desc: 'Summon two Zombies. For the remainder of combat, Zombies have the caster\'s Accuracy and Defense.' },
    ],
    inters: [
      { name: 'Army of the Dead', desc: 'Summon 1d12 + Advantage Zombies. They may perform actions this turn.' },
      { name: 'Pandemic', desc: '(Debuff) Inflict Toxic on up to 4 enemies and summon a Zombie next to each. The Zombies inflict Toxic with their Basic Attacks.' },
    ],
    advanced: { name: 'Black Rose', desc: 'Add 40 HP to the Black Garden, then summon the Black Rose. She can act this turn, has +5 DM, gains the Pandemic passive, and has 17 Def.' },
  },
];

// Historical loadouts recovered from the old per-fight tabs (reference only).
export const PAST_LOADOUTS = [
  { name: 'Glitch', schools: ["Nature's Wrath", 'Lightning Fury', 'Tea Time', 'Green Shift Necromancy'] },
  { name: 'Maev Woods 1', schools: ["Diggin' uh-ah-uh Diggin'", 'Water Spirits', 'Wind Cutting', 'Scorch', 'Augmented Armor'] },
  { name: 'Namora Fight', schools: ["Diggin' uh-ah-uh Diggin'", 'Water Spirits', 'Wind Cutting', 'Shadow Power'] },
  { name: 'Plains', schools: ['Rock Solid', 'Frogadiers', 'Lightning Fury'] },
  { name: 'Coast', schools: ['Quills', 'Frogadiers', 'Hugs and Kisses', 'Green Shift Necromancy'] },
  { name: 'Weirgrove', schools: ['Gale Kicks', 'Tea Time', 'Augmented Armor'] },
  { name: 'Zuulamon', schools: ['Scorch', 'Wind Cutting', 'Tea Time', 'Augmented Armor'] },
  { name: 'Lancaster 1', schools: ["Nature's Wrath", 'Frogadiers', 'Hugs and Kisses', 'Bramble Shadows'] },
  { name: 'Lancaster 2', schools: ['Suplex City', 'Gale Kicks', 'Scorch', 'Green Shift Necromancy'] },
  { name: 'Hunt 4 Gilbo', schools: ["Nature's Wrath", 'Wind Cutting', 'Hugs and Kisses', 'Bramble Shadows'] },
  { name: 'Hunt 4 Gilbo 3', schools: ['Rinse and Wash', 'Wind Cutting', 'Scorch', 'Tea Time'] },
];

export const SCHOOL_BY_ID = Object.fromEntries(SCHOOLS.map((s) => [s.id, s]));
export const SCHOOL_BY_NAME = Object.fromEntries(SCHOOLS.map((s) => [s.name, s]));
