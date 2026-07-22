export const HEROES = {
  gil: {
    id: 'gil',
    name: 'Gil',
    description: 'The world is unpredictable, but so am I.',
    baseHealth: 5,
    baseAttack: 200,
    elements: ['shadow', 'earth'],
    passives: ['ardenkin', 'battle_bloom'],
    imagePath: '/images/characters/Gil.webp',
    altCostumes: {
      coast: '/images/characters/Gil_Coast.webp',
      plains: '/images/characters/Gil_Plains.webp',
    },
    racingStats: { speed: 20, jump: 15, turning: 10 }, // The Balanced Baseline
  },
  marinska: {
    id: 'marinska',
    name: 'Marinska',
    description: 'Too few look to the skies before it is too late.',
    baseHealth: 5,
    baseAttack: 260,
    elements: ['shadow', 'air'],
    passives: ['take_flight'],
    imagePath: '/images/characters/Marinska.webp',
    racingStats: { speed: 18, jump: 22, turning: 8 }, // High jump, lower turn
  },
  tornadowerewolf: {
    id: 'tornadowerewolf',
    name: 'Garu',
    description: 'The winds of the wild howl through my veins.',
    baseHealth: 5,
    baseAttack: 280,
    elements: ['air'],
    passives: ['sweeping_wind'],
    imagePath: '/images/characters/Tornadowerewolf.webp',
    racingStats: { speed: 25, jump: 12, turning: 6 }, // Blistering speed, awful handling
  },
  crocagator: {
    id: 'crocagator',
    name: 'Crocagator',
    description: 'Thick-scaled and nearly impossible to take down.',
    baseHealth: 5,
    baseAttack: 160,
    elements: ['water'],
    passives: ['thickhide'],
    imagePath: '/images/characters/Crocagator.webp',
    racingStats: { speed: 15, jump: 18, turning: 12 }, // Slower, but clears obstacles well
  },
  shiva: {
    id: 'shiva',
    name: 'Shiva',
    description: 'What are you looking at?',
    baseHealth: 5,
    baseAttack: 220,
    elements: ['earth'],
    passives: ['looking_for_trouble'],
    imagePath: '/images/characters/shiva.webp',
    racingStats: { speed: 19, jump: 13, turning: 18 }, // Excellent cornering
  },
};

export const ROSTER = HEROES;