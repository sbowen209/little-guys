// -----------------------------------------------------------------------------
// EXACT MOUNT SPECIES DATABASE
// -----------------------------------------------------------------------------
export const MOUNTS = {
  tauros: { 
    id: 'tauros', 
    skins: [
      { id: 'default', name: 'Tauros', buttonLabel: 'Default', imagePath: '/images/mounts/Tauros.webp', facing: 'Left' },
      { id: 'college', name: 'Tauros', buttonLabel: 'College', imagePath: '/images/mounts/Tauros_College.webp', facing: 'Left' },
      { id: 'yoked', name: 'Tauros', buttonLabel: 'Yoked', imagePath: '/images/mounts/Tauros_Yoked.webp', facing: 'Right' }
    ],
    baseStats: { speed: 20, jump: 15, turning: 15 } 
  },
  goraffe: { 
    id: 'goraffe', 
    skins: [
      { id: 'default', name: 'Throat Goat', buttonLabel: 'Default', imagePath: '/images/mounts/Goraffe.webp', facing: 'Left' }
    ],
    baseStats: { speed: 24, jump: 16, turning: 8 } 
  },
  warhog: { 
    id: 'warhog', 
    skins: [
      { id: 'default', name: 'Warhog', buttonLabel: 'Default', imagePath: '/images/mounts/Warhog.webp', facing: 'Left' }
    ],
    baseStats: { speed: 18, jump: 10, turning: 20 } 
  },
  tunnel_viper: { 
    id: 'tunnel_viper', 
    skins: [
      { id: 'default', name: 'Tunnel Viper', buttonLabel: 'Default', imagePath: '/images/mounts/TunnelViper.webp', facing: 'Right' }
    ],
    baseStats: { speed: 20, jump: 6, turning: 23 } 
  },
  perseus: { 
    id: 'perseus', 
    skins: [
      { id: 'default', name: 'Perseus', buttonLabel: 'Default', imagePath: '/images/mounts/Perseus.webp', facing: 'Left' }
    ],
    baseStats: { speed: 17, jump: 18, turning: 17 } 
  },
  buoffolaunt: { 
    id: 'buoffolaunt', 
    skins: [
      { id: 'default', name: 'Buoffolaunt', buttonLabel: 'Default', imagePath: '/images/mounts/Buoffolaunt.webp', facing: 'Right' },
      { id: 'plum', name: 'Plum', buttonLabel: 'Plum', imagePath: '/images/mounts/Buoffolaunt_Gil.webp', facing: 'Right' }
    ],
    baseStats: { speed: 21, jump: 12, turning: 15 } 
  },
  mudsdale: { 
    id: 'mudsdale', 
    skins: [
      { id: 'default', name: 'Mudsdale', buttonLabel: 'Default', imagePath: '/images/mounts/Mudsdale.webp', facing: 'Right' },
      { id: 'fudgedale', name: 'Fudgedale', buttonLabel: 'Fudgedale', imagePath: '/images/mounts/Mudsdale_Gil.webp', facing: 'Right' }
    ],
    baseStats: { speed: 17, jump: 10, turning: 23 } 
  },
  bolt_bison: { 
    // Player's Beefcake is preserved, but removed from AI generation pool
    id: 'bolt_bison', 
    skins: [
      { id: 'default', name: 'Bolt Bison', buttonLabel: 'Default', imagePath: '/images/mounts/BoltBison.webp', facing: 'Left' },
      { id: 'beefcake', name: 'Beefcake', buttonLabel: 'Beefcake', imagePath: '/images/mounts/BoltBison_Gil.webp', facing: 'Right' }
    ],
    baseStats: { speed: 26, jump: 13, turning: 12 } 
  },
  harehorse: { 
    id: 'harehorse', 
    skins: [
      { id: 'default', name: 'Harehorse', buttonLabel: 'Default', imagePath: '/images/mounts/HareHorse.webp', facing: 'Right' }
    ],
    baseStats: { speed: 15, jump: 20, turning: 17 } 
  }
};

// Player's Wager Circuit Roster
export const PLAYER_PRESETS = [
  { id: 'plum', mountId: 'buoffolaunt', skinId: 'plum', label: 'Plum (Lvl 5)', speed: 24, jump: 12, turning: 15, level: 5, wins: 4, losses: 2, passives: ['headstrong'] },
  { id: 'fudgedale', mountId: 'mudsdale', skinId: 'fudgedale', label: 'Fudgedale (Lvl 4)', speed: 19, jump: 8, turning: 26, level: 4, wins: 2, losses: 1, passives: [] },
  { id: 'beefcake', mountId: 'bolt_bison', skinId: 'beefcake', label: 'Beefcake (Lvl 1)', speed: 25, jump: 16, turning: 13, level: 1, wins: 0, losses: 1, passives: ['super_charged'] }
];

export const AVAILABLE_PASSIVES = [
  { id: 'headstrong', label: 'Headstrong', desc: 'First failed jump does not result in a crash/daze.' },
  { id: 'super_charged', label: 'Super Charged', desc: 'Rolling a 1 grants advantage on the next roll.' },
  { id: 'corner_demon', label: 'Corner Demon', desc: 'Advantage on first turn.' },
  { id: 'jumper', label: 'Jumper', desc: 'Advantage on first jump.' },
  { id: 'resilient', label: 'Resilient', desc: 'Gain +1 to all dice rolls when behind by 3 or more spaces at the start of the turn.' },
  { id: 'strider', label: 'Strider', desc: '+1 to speed rolls, stacking each consecutive speed roll. Resets on failed jump or hitting a turn.' },
  { id: 'strong_finisher', label: 'Strong Finisher', desc: '+2 to all turn rolls on the final turn of the track.' },
  { id: 'tunneling', label: 'Tunneling', desc: 'Automatically passes the first jump of the race.' },
  { id: 'winged', label: 'Winged', desc: 'Gain an extra 1d2 distance upon successfully clearing a jump.' },
  { id: 'soar', label: 'Soar', desc: 'Advantage on speed rolls while in first place.' }
];

// -----------------------------------------------------------------------------
// PROCEDURAL ENEMY GENERATION MATH
// -----------------------------------------------------------------------------
export const rollDie = (max) => Math.floor(Math.random() * max) + 1;

export const rollNatureModifier = () => {
  const d20 = rollDie(20);
  if (d20 === 20) return rollDie(6);
  if (d20 >= 18) return rollDie(4);
  if (d20 >= 15) return rollDie(2);
  if (d20 >= 11) return 1;
  if (d20 >= 7) return -1;
  if (d20 >= 4) return -rollDie(2);
  if (d20 >= 2) return -rollDie(4);
  return -rollDie(6);
};

export const generateOpponent = (index, isAce = false) => {
  let level;
  if (isAce) {
    level = Math.random() < 0.10 ? 6 : 5;
  } else {
    const lr = Math.random();
    if (lr < 0.20) level = 2;
    else if (lr < 0.50) level = 3;
    else if (lr < 0.80) level = 4;
    else level = 5;
  }

  // Tiered Rarity Pool Generation
  const rarityRoll = Math.random();
  let speciesPool = [];
  
  if (rarityRoll < 0.60) {
     speciesPool = ['tauros', 'harehorse']; // 60% Common
  } else if (rarityRoll < 0.90) {
     speciesPool = ['goraffe', 'mudsdale', 'warhog']; // 30% Uncommon
  } else {
     speciesPool = ['buoffolaunt', 'tunnel_viper', 'perseus']; // 10% Rare
  }
  
  const speciesId = speciesPool[Math.floor(Math.random() * speciesPool.length)];
  const base = MOUNTS[speciesId];
  
  let skinId = 'default';
  if (speciesId === 'tauros') {
    if (level <= 2) skinId = 'college';
    else if (level <= 4) skinId = 'default';
    else if (level >= 5) skinId = 'yoked';
  }
  const skin = base.skins.find(s => s.id === skinId) || base.skins[0];

  let spdMod, jmpMod, trnMod, natureSum;
  do {
    spdMod = rollNatureModifier();
    jmpMod = rollNatureModifier();
    trnMod = rollNatureModifier();
    natureSum = spdMod + jmpMod + trnMod;
  } while (isAce && natureSum < 0);

  let stats = {
    speed: Math.max(1, base.baseStats.speed + spdMod),
    jump: Math.max(1, base.baseStats.jump + jmpMod),
    turning: Math.max(1, base.baseStats.turning + trnMod)
  };

  for (let i = 2; i <= level; i++) {
    const r = rollDie(3);
    if (r === 1) stats.speed++;
    else if (r === 2) stats.jump++;
    else stats.turning++;
  }

  let passives = [];
  
  // Base Passives mapped to Level 1
  if (speciesId === 'perseus') passives.push('winged'); 
  
  // Level 5 Ace Passives
  if (level >= 5) {
    if (speciesId === 'harehorse') passives.push('jumper');
    if (speciesId === 'mudsdale') passives.push('corner_demon');
    if (speciesId === 'buoffolaunt') passives.push('headstrong');
    if (speciesId === 'tauros') passives.push('resilient'); 
    if (speciesId === 'goraffe') passives.push('strider'); 
    if (speciesId === 'warhog') passives.push('strong_finisher'); 
    if (speciesId === 'tunnel_viper') passives.push('tunneling'); 
    if (speciesId === 'perseus') passives.push('jumper'); 
  }

  let winRateBase = 0.5;
  if (natureSum >= 3) winRateBase = 0.65 + (Math.random() * 0.1);
  else if (natureSum <= -3) winRateBase = 0.25 + (Math.random() * 0.1);
  else winRateBase = 0.45 + (Math.random() * 0.15);

  const baseRaces = level * 10;
  const variance = baseRaces * 0.2;
  const totalRaces = Math.max(1, Math.floor(baseRaces + (Math.random() * variance * 2) - variance));
  const wins = Math.round(totalRaces * winRateBase);
  const losses = Math.max(0, totalRaces - wins);

  return {
    id: `opp_${index}_${Math.random().toString(36).substr(2, 5)}`,
    name: `${skin.name} (AI)`,
    speciesId,
    imagePath: skin.imagePath,
    facing: skin.facing,
    level,
    stats,
    wins,
    losses,
    passives,
    isAce
  };
};