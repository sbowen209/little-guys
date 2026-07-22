// src/hooks/useCombat.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { scaleEnemy } from '../data/mapConfig';
import { runPassiveHook, runEnemyHook } from '../lib/passiveEngine';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function useCombat({
  enemy,
  character,
  level,
  startingHp,
  affix,
  passiveFlags = {},
  onConsumePassive,
  onHpChange,
}) {
  const scaled = useRef(scaleEnemy(enemy, level, affix)).current;

  const [enemyHp, setEnemyHp] = useState(scaled.health);
  const [playerHp, setPlayerHp] = useState(startingHp);
  const [log, setLog] = useState([
    { id: 0, text: `A ${enemy.name} blocks your path!`, kind: 'info' },
  ]);
  const [outcome, setOutcome] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);
  const [roll, setRoll] = useState(null);
  
  // Expose status effects to the UI so it can render the CSS tints
  const [statuses, setStatuses] = useState({ poison: false, toxic: false, vulnerable: false });

  // Persistent combat state for the engine (buffs, debuffs, trackers)
  const combatState = useRef({});
  const logId = useRef(1);
  
  const count = Math.max(0, Math.ceil(enemyHp / scaled.hpPerCount));
  const maxCount = Math.ceil(scaled.health / scaled.hpPerCount);

  const pushLog = (text, kind) =>
    setLog((prev) => [...prev.slice(-4), { id: logId.current++, text, kind }]);

  useEffect(() => {
    if (onHpChange) {
      onHpChange(playerHp);
    }
  }, [playerHp, onHpChange]);

  const attack = useCallback(async () => {
    if (outcome || busy) return;
    setBusy(true);

    // ==========================================
    // PHASE 1: PRE-ROLL (Stat Modifiers)
    // ==========================================
    let phase1Ctx = {
      combatState: combatState.current,
      enemyAtk: scaled.attack,
      playerAtk: character.baseAttack,
      enemyAdvantage: false,
      enemyHp,
      playerHp
    };

    phase1Ctx = runEnemyHook(enemy, 'modifyEnemyStats', phase1Ctx);
    phase1Ctx = runEnemyHook(enemy, 'modifyPlayerStats', phase1Ctx);

    const activePlayerAtk = Math.max(0, phase1Ctx.playerAtk);
    const activeEnemyAtk = Math.max(0, phase1Ctx.enemyAtk);

    const playerRoll = Math.random() * activePlayerAtk;
    let enemyRoll1 = Math.random() * activeEnemyAtk;
    let enemyRoll2 = null;
    let finalEnemyRoll = enemyRoll1;

    // Apply Advantage if the ability granted it
    if (phase1Ctx.enemyAdvantage) {
      enemyRoll2 = Math.random() * activeEnemyAtk;
      finalEnemyRoll = Math.max(enemyRoll1, enemyRoll2);
    }

    const playerWins = playerRoll >= finalEnemyRoll;

    setRoll({
      player: playerRoll,
      enemy: finalEnemyRoll,
      enemyRolls: phase1Ctx.enemyAdvantage ? [enemyRoll1, enemyRoll2] : null,
      playerMax: activePlayerAtk,
      enemyMax: activeEnemyAtk,
      playerWins,
    });

    await wait(1050);

    let nextEnemyHp = enemyHp;
    let nextPlayerHp = playerHp;
    let matchEnded = false;
    let matchOutcome = null;
    let lingerTime = 1400;

    // ==========================================
    // PHASE 2: RESOLUTION (Winning Hit Hooks)
    // ==========================================
    if (playerWins) {
      let pCtx = runPassiveHook(character, 'onWinningHit', { damage: 1, enemyCount: count });
      let eCtx = runEnemyHook(enemy, 'onPlayerWinningHit', { combatState: combatState.current, damage: pCtx.damage, newLogs: [] });

      const dmg = Math.max(1, eCtx.damage);
      nextEnemyHp = Math.max(0, enemyHp - dmg);

      setEnemyHp(nextEnemyHp);
      setFlash('enemyHit');

      eCtx.newLogs.forEach(l => pushLog(l.text, l.kind));

      if (dmg > 1) {
        pushLog(`Sweeping Wind! You strike for ${dmg}.`, 'player');
        lingerTime = 1800; 
      } else {
        pushLog('You land a clean hit.', 'player');
      }

    } else {
      let eCtx = runEnemyHook(enemy, 'onEnemyWinningHit', { combatState: combatState.current, damage: 1, newLogs: [], enemyRoll: finalEnemyRoll });
      
      const surplus = finalEnemyRoll - playerRoll;
      let pCtx = runPassiveHook(character, 'modifyIncomingDamage', { damage: eCtx.damage, surplus });

      const dmg = Math.max(0, pCtx.damage);
      eCtx.newLogs.forEach(l => pushLog(l.text, l.kind));

      if (dmg <= 0) {
        setFlash('shrug');
        pushLog('Thickhide holds — you shrug off the blow!', 'dodge');
        lingerTime = 1800;
      } else {
        nextPlayerHp = nextPlayerHp - dmg;
        setPlayerHp(Math.max(0, nextPlayerHp));
        setFlash('playerHit');
        pushLog(`The ${enemy.name} strikes you! −${dmg} HP.`, 'enemy');
      }
    }

    // ==========================================
    // PHASE 3: CLEANUP (Turn End hooks)
    // ==========================================
    if (nextEnemyHp > 0 && nextPlayerHp > 0) {
      let cleanupCtx = runEnemyHook(enemy, 'onTurnEnd', {
        combatState: combatState.current,
        enemyHp: nextEnemyHp,
        enemyMaxHp: scaled.health,
        playerHpLoss: 0,
        enemyHpGain: 0,
        newLogs: []
      });

      if (cleanupCtx.enemyHpGain > 0) {
        nextEnemyHp = Math.min(scaled.health, nextEnemyHp + cleanupCtx.enemyHpGain);
        setEnemyHp(nextEnemyHp);
      }
      
      if (cleanupCtx.playerHpLoss > 0) {
        nextPlayerHp -= cleanupCtx.playerHpLoss;
        setPlayerHp(Math.max(0, nextPlayerHp));
        setFlash('playerHit');
      }

      cleanupCtx.newLogs.forEach(l => pushLog(l.text, l.kind));
    }

    // Sync visual status flags so CombatView triggers CSS tints
    setStatuses({
      poison: !!combatState.current.playerPoisoned,
      toxic: !!combatState.current.playerToxic,
      vulnerable: !!combatState.current.playerVulnerable
    });

    // Check Player Death (after both hit resolution and cleanup DoTs)
    if (nextPlayerHp <= 0) {
      let defCtx = runPassiveHook(character, 'onWouldBeDefeated', { prevented: false, newHp: 0, consume: null, runFlags: passiveFlags });

      if (defCtx.prevented) {
        if (defCtx.consume && onConsumePassive) onConsumePassive(defCtx.consume);
        nextPlayerHp = defCtx.newHp;
        setPlayerHp(nextPlayerHp);
        
        if (defCtx.endCombat) {
          setFlash('shrug');
          pushLog('Take Flight triggers! You escape to the skies...', 'dodge');
          lingerTime = 2500;
          matchEnded = true;
          matchOutcome = { escaped: true, remainingHp: defCtx.newHp, loot: [], accumulatedPenalty: combatState.current.playerAtkPenalty || 0 };
        } else {
          setFlash('shrug');
          pushLog('A fatal blow — but you cling to life at 1 HP!', 'dodge');
          lingerTime = 2500;
        }
      } else {
        setPlayerHp(0);
        setFlash('playerHit');
        matchEnded = true;
        matchOutcome = { victory: false, remainingHp: 0, loot: [], accumulatedPenalty: combatState.current.playerAtkPenalty || 0 };
        pushLog('You have fallen...', 'lose');
      }
    }

    // ==========================================
    // PHASE 4: DEATH (Enemy killed)
    // ==========================================
    if (nextEnemyHp <= 0 && !matchEnded) {
      let deathCtx = runEnemyHook(enemy, 'onEnemyDeath', {
        combatState: combatState.current,
        newLogs: [],
        extraEncounter: false
      });

      deathCtx.newLogs.forEach(l => pushLog(l.text, l.kind));

      matchEnded = true;
      matchOutcome = {
        victory: true,
        remainingHp: nextPlayerHp,
        loot: [{ id: enemy.drop || 'monster_parts', qty: (1 + level) * (affix === 'Dangerous' ? 2 : 1) }],
        extraEncounter: deathCtx.extraEncounter,
        accumulatedPenalty: combatState.current.playerAtkPenalty || 0
      };
      
      pushLog(`The ${enemy.name} is defeated!`, 'win');
    }

    await wait(lingerTime);

    setFlash(null);
    setRoll(null);

    if (matchEnded) {
      await wait(400);
      setOutcome(matchOutcome);
    }

    setBusy(false);
  }, [outcome, busy, enemyHp, playerHp, count, level, character, scaled, enemy, passiveFlags, affix, onConsumePassive]);

  // ==========================================
  // DERIVED UI STATS
  // ==========================================
  // Predict current stats for the UI so attack bars dynamically scale 
  // when abilities like Enrage or Weakening Spores trigger mid-fight.
  let liveCtx = {
    combatState: combatState.current,
    enemyAtk: scaled.attack,
    playerAtk: character.baseAttack,
    enemyHp,
    playerHp
  };
  
  liveCtx = runEnemyHook(enemy, 'modifyEnemyStats', liveCtx);
  liveCtx = runEnemyHook(enemy, 'modifyPlayerStats', liveCtx);

  const currentEnemyAtk = Math.max(0, liveCtx.enemyAtk);
  const currentPlayerAtk = Math.max(0, liveCtx.playerAtk);

  return {
    enemyHp,
    maxEnemyHp: scaled.health,
    playerHp,
    count,
    maxCount,
    log,
    outcome,
    busy,
    flash,
    roll,
    statuses,
    attack,
    scaledAttack: currentEnemyAtk,   // <-- Now feeding live dynamic value to UI
    playerAttack: currentPlayerAtk,  // <-- Now feeding live dynamic value to UI
  };
}