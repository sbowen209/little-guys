// src/data/mapConfig.js
import { getCuratedEncounter } from './encounterTables';

export const MAX_HP = 5;
export const ZONES = ['A', 'B', 'C'];

export const ZONE_INFO = {
  A: { type: 'Swamp', img: 'Swamp1A', accent: 'emerald' },
  B: { type: 'Woods', img: 'Swamp1B', accent: 'lime' },
  C: { type: 'Poison', img: 'Swamp1C', accent: 'fuchsia' },
};

export const zoneImg = (zone) =>
  `/images/maps/zones/${(ZONE_INFO[zone] ?? ZONE_INFO.A).img}.webp`;

// ── ZONE AFFIXES ──────────────────────────────────────
export const AFFIX_INFO = {
  Peaceful: { name: 'Peaceful', color: 'text-sky-400', desc: 'Enemies are significantly weaker.' },
  Dangerous: { name: 'Dangerous', color: 'text-rose-500', desc: 'Enemies hit harder and have more HP, but drop double loot.' },
  Fruitful: { name: 'Fruitful', color: 'text-emerald-400', desc: 'Gather nodes yield double resources.' },
};

export function rollAffix() {
  const r = d100();
  if (r <= 15) return 'Peaceful';
  if (r <= 30) return 'Dangerous';
  if (r <= 45) return 'Fruitful';
  return null;
}

export const getEncounterType = (roll) =>
  ({ 1: 'BATTLE', 2: 'GATHER', 3: 'EVENT' }[roll]);

// ── NEW: CURATED SPAWN & HYBRID SCALING ──────────────────────────

export function spawnEnemy(biomeId, level, zone) {
  return getCuratedEncounter(biomeId, level, zone);
}

export function scaleEnemy(enemy, level, affix) {
  const lvl = Math.max(1, level);
  
  // Fallbacks in case the new enemies are missing level scaling variables
  const hpPerLevel = enemy.healthPerLevel ?? 1;
  const atkPerLevel = enemy.attackPerLevel ?? 20;

  // Utilize base stats from the curated table, and apply standard scaling for levels 2+
  let hp = enemy.baseHealth + hpPerLevel * (lvl - 1);
  let atk = enemy.baseAttack + atkPerLevel * (lvl - 1);

  if (affix === 'Dangerous') {
    hp += 1;
    atk += 20;
  } else if (affix === 'Peaceful') {
    hp = Math.max(1, hp - 1);
    atk = Math.floor(atk * 0.6);
  }

  return {
    ...enemy,
    health: hp,
    attack: atk,
    hpPerCount: enemy.hpPerCount ?? 1,
  };
}

/* ── DICE ─────────────────────────────────────────────────────── */
const d3 = () => 1 + Math.floor(Math.random() * 3);
const d100 = () => 1 + Math.floor(Math.random() * 100);

/* ── GATHER LOOT ─────────────────────────────────────── */
const FLOWER_TABLE = [
  { id: 'plant_red', max: 20 },
  { id: 'plant_blue', max: 40 },
  { id: 'plant_green', max: 60 },
  { id: 'plant_yellow', max: 80 },
  { id: 'plant_bramble', max: 90 },
  { id: 'plant_tox', max: 100 },
];

const pickFlower = () => {
  const r = d100();
  return (FLOWER_TABLE.find((p) => r <= p.max) ?? FLOWER_TABLE[0]).id;
};

export function rollGatherLoot(level, { modifyQuantity, affix } = {}) {
  const roll = Math.random() * 100;
  let category = 'plant';

  // Per-Level Gather Tables
  if (level === 1 || level === 2) {
    if (roll <= 60) category = 'plant';
    else if (roll <= 80) category = 'animal_feed';
    else category = 'fish';
  } else if (level === 3) {
    if (roll <= 60) category = 'plant';
    else if (roll <= 80) category = 'animal_feed';
    else category = 'delc';
  } else if (level === 4) {
    if (roll <= 60) category = 'plant';
    else if (roll <= 80) category = 'sigil_dust';
    else category = 'delc';
  } else if (level === 5) {
    if (roll <= 20) category = 'plant';
    else if (roll <= 80) category = 'sigil_dust';
    else category = 'sigil';
  }

  const flowerId = pickFlower();
  const itemId = category === 'plant' ? flowerId : category;
  
  const maxQty = 3 + Math.floor(level / 2);
  const firstRoll = 1 + Math.floor(Math.random() * maxQty);
  
  let qtyCtx = { 
    rollQuantity: firstRoll, 
    max: maxQty, 
    rolls: [firstRoll], 
    advantage: false 
  };
  
  if (category === 'plant' && modifyQuantity) {
    qtyCtx = modifyQuantity(qtyCtx) || qtyCtx;
  }

  const baseGathered = qtyCtx.advantage ? Math.max(...qtyCtx.rolls) : qtyCtx.rolls[0];
  const finalQty = baseGathered * (affix === 'Fruitful' ? 2 : 1);
  const loot = [{ id: itemId, qty: finalQty }];

  return { 
    loot, 
    qtyRolls: qtyCtx.rolls, 
    max: maxQty,
    advantage: qtyCtx.advantage,
    category,
    flowerId: itemId
  };
}

/* ── EVENTS ───────────────────────────────────────────────────── */
export const EVENTS = [
  'A still, black pool reflects a sky you do not recognise. You linger a moment, then move on.',
  'You stumble upon the bones of a previous explorer. Their gear is rust, but you whisper a word of thanks.',
  'Fireflies gather in a slow spiral, lighting the path ahead before scattering into the reeds.',
  'A low croak rolls across the mire. Nothing comes of it — this time.',
  'You find a half-sunken shrine. Touching it, you feel briefly, strangely lighter.',
  'The mud tries to swallow your boots whole. You wrench free, muttering, and press on.',
];
export const pickEvent = () => EVENTS[Math.floor(Math.random() * EVENTS.length)];

/* ── MAP TRAVERSAL ────────────────────────────────────────────── */
export const nodeKey = (level, zone) => `${level}-${zone}`;

export function getMovementOptions(position, visited) {
  const { level } = position;
  const explore = [];
  const ascend = [];

  if (level >= 1 && level <= 5) {
    ZONES.forEach((z) => {
      if (z !== position.zone && !visited.has(nodeKey(level, z))) {
        explore.push({ level, zone: z });
      }
    });
  }

  if (level === 0) {
    ZONES.forEach((z) => ascend.push({ level: 1, zone: z }));
  } else if (level >= 1 && level <= 4) {
    ZONES.forEach((z) => {
      if (!visited.has(nodeKey(level + 1, z))) ascend.push({ level: level + 1, zone: z });
    });
  } else if (level === 5) {
    ascend.push({ level: 6, zone: 'PRIZE' });
  }

  return { explore, ascend };
}