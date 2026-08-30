// src/data/gil/core.js
// Gil "Virgil" Bowen — Champion of the Ardenvale. Core kit, garden, items.
// Transcribed from the workbook's Gil tab.

export const IDENTITY = {
  name: 'Gil',
  fullName: 'Virgil "Gil" Bowen',
  title: 'Champion of the Ardenvale',
  affinity: 'Shadow',
  weakness: 'Spirit',
  phases: ['Standard', 'Affinity (Magic)', 'Movement'],
  image: '/images/characters/Gil.webp',
};

// Base vs. Ardenvale (the Champion passive gives +3 to Damage, Accuracy, Defense
// while in the Ardenvale → 10 / 10 / 20).
export const STATS = [
  { key: 'health', label: 'Health', base: 100, ardenvale: 100 },
  { key: 'defense', label: 'Defense', base: 17, ardenvale: 20 },
  { key: 'accuracy', label: 'Accuracy', base: 7, ardenvale: 10 },
  { key: 'damage', label: 'Damage (DM)', base: 7, ardenvale: 10 },
  { key: 'movement', label: 'Movement', base: 5, ardenvale: 5 },
];

// Burst / token counts (starting values).
export const BURSTS = [
  { key: 'dodge', label: 'Dodge', start: 1 },
  { key: 'block', label: 'Block', start: 1 },
  { key: 'coating', label: 'Coating', start: 1 },
  { key: 'resist', label: 'Resist', start: 1 },
  { key: 'luck', label: 'Luck', start: 1 },
];

// Trackable resources (starting values).
export const RESOURCES = [
  { key: 'fertilizer', label: 'Fertilizer', start: 10 },
  { key: 'bait', label: 'Bait', start: 0 },
  { key: 'tech', label: 'Tech Points', start: 0 },
  { key: 'tempAffinity', label: 'Temp Affinity', start: 0 },
  { key: 'shadowPool', label: 'Shadow Pool', start: 0 },
];

export const PETAL_AFFINITIES = ['Earth', 'Water', 'Air', 'Fire', 'Spirit', 'Shadow'];

// Core kit — passives and actions (the "Nile Aura" / essentials / minors / etc.).
export const CORE_KIT = [
  { type: 'Affinity', name: 'Shadow Affinity', desc: 'Weakness to Spirit Affinity damage.' },
  { type: 'Nile Aura', name: 'Stolen Spellweaving', desc: 'Can use Petals to cast spells from the different Stolen Schools.' },
  { type: 'Passive', name: 'Champion of the Ardenvale', desc: "While in the Ardenvale, Gil's Damage, Accuracy and Defense become 10 / 10 / 20 (+3 to each)." },
  { type: 'Passive', name: 'Ardenvale', desc: 'When entering combat, summon 2 Unbloomed Flowers (Red and Blue). Bloomed flowers grant 1 Tech point, generate 1 Petal of a random affinity, and can be collected to restore Health.' },
  { type: 'Passive', name: 'Cultivation', desc: 'At the end of each turn, roll 2d100. Each roll of 86+ grants a Petal. While a Green Flower is in bloom, roll 3d100 instead.' },
  { type: 'Passive', name: 'Nectar', desc: 'Whenever a Flower blooms, gain 10 Temporary Affinity.' },
  { type: 'Passive', name: 'Twisted Thistle', desc: 'Vine Helix may be used as a Standard Action. It cannot be used more than once per turn.' },
  { type: 'Passive', name: 'Battle Blooms', desc: 'Can perform actions during his turn to grant bloom rolls. Successful rolls grant Tech points and Petals of random affinity.' },
  { type: 'Essential', tag: '-', name: 'Vine Helix', desc: 'Attack. 1d6 damage. On a successful hit, choose one effect: pull self to target, pull target to Gil (requires an additional Attack Roll), deal 1d8 Lifesteal, or apply Knockback (1-3). May instead harvest an adjacent plant or conjuration to take its Petal.' },
  { type: 'Essential', tag: '-', name: 'Sow', desc: 'Plant one Unbloomed Flower of any colour he has unlocked within 6.' },
  { type: 'Minor', tag: '2', name: 'Stolen Spellweaving', desc: "Attack. On a successful hit, queue (or immediately cast) a spell associated with the target's affinity. After the spell is cast, gain 1 Petal of a random affinity." },
  { type: 'Minor', tag: '2', name: 'Entangling Vines', desc: 'Attack, Range 6. On a successful hit the target is Rooted — it cannot move away from Gil for 2 turns, ending early if it lands a successful attack on the vines. Vine Helix has Advantage against Rooted targets.' },
  { type: 'Minor', tag: '2', name: 'Yellow Bloom', desc: 'Consume 1 Petal to plant a Yellow Unbloomed Flower. When it Blooms, gain 3 Petals of that affinity.' },
  { type: 'Intermediate', tag: '1', name: 'Helix Bramble', desc: '(Conjuration) Summon a 6-attack Bramble within 6. Each turn it attacks every adjacent enemy twice for 1d12 at half Accuracy (rounded down). Vine Helix may harvest it for 1 Petal, once.' },
  { type: 'Intermediate', tag: '1', name: 'Kokirin Wrath', desc: 'Vine Helix may be used repeatedly this turn, against as many unique targets as are within range.' },
  { type: 'Advanced', tag: '1', name: 'Rainbow Garden', desc: 'Usable only after at least one of each Flower type has bloomed this fight. Plant a Flower for each of the 4 Affinities in his loadout. Each produces Petals of its own Affinity, and is replanted when picked up.' },
];

// The Garden — flowers.
export const FLOWERS = [
  { name: 'Red', color: 'red', desc: 'Free at the start of combat. Blooms 86+. Grants 1 Petal; can be collected to restore Health.' },
  { name: 'Blue', color: 'blue', desc: 'Free at the start of combat. Blooms 86+. Grants 1 Petal; can be collected to restore Health.' },
  { name: 'Yellow', color: 'yellow', desc: 'Planted by spending 1 Petal (Yellow Bloom). Blooms 86+. Grants 3 Petals of that affinity.' },
  { name: 'Green', color: 'green', desc: 'Planted. Blooms 86+. Grants no Petal — instead Cultivation becomes 3d100 instead of 2d100.' },
  { name: 'Black Root', color: 'black', desc: 'Planted. Shadow only. Blooms 86+. Cannot be collected for Health. Keeps generating Petals repeatedly — it does not wither when it blooms.' },
  { name: 'Oni', color: 'oni', desc: 'Planted. Blooms 86+. Lets Gil cast a spell from the Book of Envy.' },
];

// Blessed items.
export const BLESSED_ITEMS = [
  { name: 'Kings Coat', desc: 'May perform a Barrier Burst to prevent lethal damage to Self or an Ally. The GM may reroll any confirmed roll involving Gil (the Coat assists); gain Advantage on that roll if a female is nearby.' },
  { name: 'Belle de Rêve', desc: 'Giant rune-carved wooden broadsword, blunt as a club and wreathed in thorned rose vines. [Effect not yet recorded — fill in.]' },
  { name: 'Baby Carrot', desc: 'Consume to turn into the Wererabbit and to speak Rabbit. Transform back by putting on a hat. The carrot must be replanted to be used again.' },
  { name: 'Leaf', desc: 'All Fire Gil casts is Rose Flame. Once per day, can turn another Fire source into Rose Flame (up to 99 Rose Flame Resistance).' },
  { name: 'Lore', desc: 'Items sketched in this notebook can talk and explain their own lore.' },
];

// Bloom Bingo — the seven sins and their triggers.
export const BLOOM_BINGO = [
  { sin: 'Pride', trigger: 'Critting' },
  { sin: 'Wrath', trigger: 'Downing two enemies' },
  { sin: 'Lust', trigger: 'Touching a woman' },
  { sin: 'Greed', trigger: 'Healing or buffing a woman' },
  { sin: 'Sloth', trigger: 'Inflict 5 Knockback damage' },
  { sin: 'Envy', trigger: '[no trigger recorded]' },
  { sin: 'Gluttony', trigger: '[no trigger recorded]' },
];

// How casting works.
export const CASTING_RULES = [
  { cost: '1 Petal', effect: 'Random Minor from that school.' },
  { cost: '2 Petals', effect: 'Random Intermediate from that school.' },
  { cost: '4 Petals', effect: "That school's Advanced spell (locked — no roll)." },
];
