// src/hooks/useRunState.js
import { useState, useCallback, useMemo } from 'react';
import {
  getEncounterType, spawnEnemy, rollGatherLoot, pickEvent,
  getMovementOptions, nodeKey, MAX_HP, rollAffix, ZONES
} from '../data/mapConfig';
import { runPassiveHook } from '../lib/passiveEngine';
import { passiveScope } from '../data/passives';

const rollD3 = () => 1 + Math.floor(Math.random() * 3);

export function useRunState(character, biome = 'swamp') {
  const [hp, setHp] = useState(character?.baseHealth ?? MAX_HP);
  const [phase, setPhase] = useState('MAP'); 
  const [position, setPosition] = useState({ level: 0, zone: 'START', affix: null });
  const [visited, setVisited] = useState(() => new Set());
  const [foughtZones, setFoughtZones] = useState(() => new Set());
  const [inventory, setInventory] = useState({});
  
  // Track run-long penalties (like the Corpse Flower effect)
  const [runAtkPenalty, setRunAtkPenalty] = useState(0);

  const [mapAffixes] = useState(() => {
    const affixes = {};
    for (let l = 1; l <= 5; l++) {
      const affixZone = ZONES[Math.floor(Math.random() * ZONES.length)];
      ZONES.forEach((z) => {
        if (z === affixZone) {
          let chosenAffix = null;
          while (!chosenAffix) chosenAffix = rollAffix();
          affixes[nodeKey(l, z)] = chosenAffix;
        } else {
          affixes[nodeKey(l, z)] = null; 
        }
      });
    }
    return affixes;
  });

  const [rolls, setRolls] = useState([]);
  const [activeEncounter, setActiveEncounter] = useState(null);

  const [usedRunPassives, setUsedRunPassives] = useState({});
  const [usedLevelPassives, setUsedLevelPassives] = useState({});

  const movement = useMemo(() => getMovementOptions(position, visited), [position, visited]);

  // Dynamically apply run-long penalties to the character object injected into encounters
  const activeCharacter = useMemo(() => ({
    ...character,
    baseAttack: Math.max(0, character.baseAttack - runAtkPenalty)
  }), [character, runAtkPenalty]);

  const updateHp = useCallback((newHp) => setHp(newHp), []);

  const consumePassive = useCallback((id) => {
    if (passiveScope(id) === 'level') {
      setUsedLevelPassives((prev) => ({
        ...prev,
        [position.level]: { ...(prev[position.level] || {}), [id]: true },
      }));
    } else {
      setUsedRunPassives((prev) => ({ ...prev, [id]: true }));
    }
  }, [position.level]);

  const addLoot = useCallback((items) => {
    if (!items?.length) return;
    setInventory((prev) => {
      const next = { ...prev };
      items.forEach(({ id, qty }) => { next[id] = (next[id] || 0) + qty; });
      return next;
    });
  }, []);

  const makeEncounter = useCallback((roll) => {
    const type = getEncounterType(roll);
    if (type === 'BATTLE') {
      setFoughtZones((prev) => new Set(prev).add(nodeKey(position.level, position.zone)));
      return { type, roll, enemy: spawnEnemy(biome, position.level, position.zone), level: position.level };
    }
    if (type === 'GATHER') {
      const res = rollGatherLoot(position.level, {
        modifyQuantity: (ctx) => runPassiveHook(activeCharacter, 'modifyGatherRoll', ctx),
        affix: position.affix,
      });
      return { type, roll, loot: res.loot, qtyRolls: res.qtyRolls, max: res.max, advantage: res.advantage, category: res.category, flowerId: res.flowerId };
    }
    return { type, roll, text: pickEvent() };
  }, [position, activeCharacter, biome]);

  const commitRoll = useCallback((roll) => {
    if (rolls.includes(roll)) {
      setActiveEncounter({ type: 'MOVE', roll });
      return;
    }
    setRolls((prev) => [...prev, roll]);
    setActiveEncounter(makeEncounter(roll));
  }, [rolls, makeEncounter]);

  const explore = useCallback((forcedRoll) => {
    const roll = forcedRoll ?? rollD3();
    const encounterType = getEncounterType(roll);

    let rerollCtx = { 
      encounterType, 
      shouldReroll: false, 
      consume: null, 
      levelFlags: usedLevelPassives[position.level] || {},
      hasFought: foughtZones.has(nodeKey(position.level, position.zone))
    };
    rerollCtx = runPassiveHook(activeCharacter, 'canRerollEncounter', rerollCtx);

    if (rerollCtx.shouldReroll) {
      if (rerollCtx.consume) consumePassive(rerollCtx.consume);
      setActiveEncounter({ type: 'SHIVA_REROLL', firstRoll: roll });
      return;
    }
    commitRoll(roll);
  }, [activeCharacter, usedLevelPassives, position.level, foughtZones, consumePassive, commitRoll]);

  const shivaReroll = useCallback(() => { commitRoll(rollD3()); }, [commitRoll]);

  const acceptGather = useCallback(() => {
    if (activeEncounter?.loot) addLoot(activeEncounter.loot);
    setActiveEncounter(null);
  }, [activeEncounter, addLoot]);

  const resolveEvent = useCallback(() => { setActiveEncounter(null); }, []);

  const resolveBattle = useCallback((result) => {
    // Accumulate any permanent stat losses from the fight
    if (result.accumulatedPenalty) {
      setRunAtkPenalty((prev) => prev + result.accumulatedPenalty);
    }

    if (result.escaped) {
      setHp(Math.min(MAX_HP, result.remainingHp));
      setActiveEncounter(null);
      setRolls((prev) => prev.slice(0, -1)); 
      setTimeout(() => explore(), 0); 
    } else if (result.victory) {
      let endCtx = { hp: result.remainingHp, maxHp: MAX_HP, victory: true };
      endCtx = runPassiveHook(activeCharacter, 'onFightEnd', endCtx);
      setHp(Math.min(MAX_HP, endCtx.hp)); 
      addLoot(result.loot);
      
      if (result.extraEncounter && activeEncounter) {
        // Now exclusively pulls from Zone 1A (Swamp) or Zone 1C (Poison)
        const ambushZone = Math.random() < 0.5 ? 'A' : 'C';
        const ambushEnemy = spawnEnemy(biome, position.level, ambushZone);
        
        // CRITICAL FIX: Append a unique timestamp to force EncounterScreen to remount CombatView 
        ambushEnemy.id = `${ambushEnemy.id}-ambush-${Date.now()}`;
        
        setActiveEncounter({ 
          type: 'BATTLE', 
          roll: activeEncounter.roll, 
          enemy: ambushEnemy, 
          level: position.level 
        });
      } else {
        setActiveEncounter(null);
      }
    } else {
      setHp(0);
      setActiveEncounter(null);
      setPhase('DEFEAT');
    }
  }, [activeCharacter, addLoot, explore, activeEncounter, biome, position]);

  const openMap = useCallback(() => {
    setActiveEncounter(null);
    setPhase('MAP');
  }, []);

  const travelTo = useCallback((node) => {
    if (node.level >= 6) {
      setPosition(node);
      setPhase('VICTORY');
      return;
    }
    const affix = mapAffixes[nodeKey(node.level, node.zone)] || null;
    setPosition({ ...node, affix });
    setVisited((prev) => new Set(prev).add(nodeKey(node.level, node.zone)));
    setRolls([]);
    setActiveEncounter(null);
    setPhase('ENCOUNTER');
  }, [mapAffixes]);

  const exploreCurrent = useCallback(() => {
    const opts = movement.explore;
    if (!opts.length) return;
    travelTo(opts[Math.floor(Math.random() * opts.length)]);
  }, [movement, travelTo]);

  const ascend = useCallback(() => {
    const opts = movement.ascend;
    if (!opts.length) return;
    travelTo(opts[Math.floor(Math.random() * opts.length)]);
  }, [movement, travelTo]);

  const retreat = useCallback(() => setPhase('RETREAT'), []);

  return {
    character: activeCharacter, // Inject modified hero into the context
    hp, maxHp: MAX_HP, phase, position, visited, inventory, foughtZones,
    rolls, activeEncounter, movement, mapAffixes,
    runPassives: usedRunPassives, consumePassive,
    explore, shivaReroll, acceptGather, resolveEvent, resolveBattle, openMap,
    exploreCurrent, ascend, retreat, updateHp,
  };
}