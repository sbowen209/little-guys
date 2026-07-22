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
  wolf: { 
    id: 'wolf', 
    skins: [
      { id: 'default', name: 'Wolf', buttonLabel: 'Default', imagePath: '/images/mounts/Werewolf.webp', facing: 'Left' }
    ],
    baseStats: { speed: 24, jump: 18, turning: 8 } 
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
  { id: 'resilient', label: 'Resilient', desc: 'Gain +1 to all dice rolls when behind by 3 or more spaces at the start of the turn.' }
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

export const generateOpponent = (index) => {
  const level = rollDie(4) + 1; 

  const rand = Math.random();
  let speciesId = 'tauros';
  if (rand < 0.40) speciesId = 'tauros';
  else if (rand < 0.70) speciesId = 'harehorse'; 
  else if (rand < 0.90) speciesId = 'mudsdale';
  else speciesId = 'buoffolaunt';

  const base = MOUNTS[speciesId];
  
  let skinId = 'default';
  if (speciesId === 'tauros') {
    if (level <= 2) skinId = 'college';
    else if (level <= 4) skinId = 'default';
    else if (level === 5) skinId = 'yoked';
  }
  const skin = base.skins.find(s => s.id === skinId) || base.skins[0];

  const spdMod = rollNatureModifier();
  const jmpMod = rollNatureModifier();
  const trnMod = rollNatureModifier();

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
  if (level === 5) {
    if (speciesId === 'harehorse') passives.push('jumper');
    if (speciesId === 'mudsdale') passives.push('corner_demon');
    if (speciesId === 'buoffolaunt') passives.push('headstrong');
    if (speciesId === 'tauros') passives.push('resilient'); 
  }

  const natureSum = spdMod + jmpMod + trnMod;
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
    passives
  };
};