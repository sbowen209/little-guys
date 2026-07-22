// src/data/enemyAbilities.js

export const ENEMY_ABILITIES = {
  poison: {
    id: 'poison',
    name: 'Poison',
    hooks: {
      onEnemyWinningHit: (ctx) => {
        // 50% chance to inflict 1 extra damage AND apply the poisoned visual state
        if (Math.random() < 0.5) {
          ctx.damage = (ctx.damage || 1) + 1;
          
          if (!ctx.combatState.playerPoisoned) {
            ctx.newLogs.push({ text: "Poison triggers! You take 1 extra damage and are Poisoned.", kind: "enemy" });
          } else {
            ctx.newLogs.push({ text: "Poison triggers! You take 1 extra damage.", kind: "enemy" });
          }
          
          // Set duration to 2 so it survives this turn's immediate cleanup, 
          // remains visible for the next idle phase, and clears after the next clash.
          ctx.combatState.playerPoisoned = 2; 
        }
        return ctx;
      },
      onTurnEnd: (ctx) => {
        // Tick down the poison duration each turn
        if (ctx.combatState.playerPoisoned > 0) {
          ctx.combatState.playerPoisoned -= 1;
          if (ctx.combatState.playerPoisoned === 0) {
            ctx.newLogs.push({ text: "The poison wears off.", kind: "info" });
          }
        }
        return ctx;
      }
    }
  },
  advantage_first_attack: {
    id: 'advantage_first_attack',
    name: 'Advantage First Attack',
    hooks: {
      modifyEnemyStats: (ctx) => {
        // Boosts the enemy's roll during Phase 1 if they haven't attacked yet
        if (!ctx.combatState.hasAttacked) {
          ctx.enemyAdvantage = true; 
        }
        return ctx;
      },
      onTurnEnd: (ctx) => {
        ctx.combatState.hasAttacked = true;
        return ctx;
      }
    }
  },
  weakening_spores: {
    id: 'weakening_spores',
    name: 'Weakening Spores',
    hooks: {
      onEnemyWinningHit: (ctx) => {
        // Logs penalty in the current combat block to be exported at combat resolution
        ctx.combatState.playerAtkPenalty = (ctx.combatState.playerAtkPenalty || 0) + 10;
        ctx.newLogs.push({ text: "Weakening spores cloud your lungs! -10 ATK for the run.", kind: "enemy" });
        return ctx;
      },
      modifyPlayerStats: (ctx) => {
        // Applies immediately in current fight, useRunState handles persistence later
        if (ctx.combatState.playerAtkPenalty) {
          ctx.playerAtk = Math.max(0, ctx.playerAtk - ctx.combatState.playerAtkPenalty);
        }
        return ctx;
      }
    }
  },
  vulnerable: {
    id: 'vulnerable',
    name: 'Vulnerable',
    hooks: {
      onEnemyWinningHit: (ctx) => {
        // Either applies the debuff, or consumes it if it already exists
        if (!ctx.combatState.playerVulnerable) {
          ctx.combatState.playerVulnerable = true;
          ctx.newLogs.push({ text: "The Moteling exposes your defenses. You are Vulnerable!", kind: "enemy" });
        } else {
          ctx.damage = (ctx.damage || 1) + 1;
          ctx.combatState.playerVulnerable = false; // Automatically clears the visual tint
          ctx.newLogs.push({ text: "Vulnerable triggered! You take 1 extra damage.", kind: "enemy" });
        }
        return ctx;
      }
    }
  },
  enrage: {
    id: 'enrage',
    name: 'Enrage',
    hooks: {
      modifyEnemyStats: (ctx) => {
        if (ctx.enemyHp === 1) {
          ctx.enemyAtk += 50;
        }
        return ctx;
      }
    }
  },
  death_summon: {
    id: 'death_summon',
    name: 'Death Throe Summon',
    hooks: {
      onEnemyDeath: (ctx) => {
        if (Math.random() <= 1.0) {
          ctx.extraEncounter = true;
          ctx.newLogs.push({ text: "The poacher's released beasts attack!", kind: "info" });
        }
        return ctx;
      }
    }
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    hooks: {
      onEnemyWinningHit: (ctx) => {
        if (!ctx.combatState.playerToxic) {
          ctx.combatState.playerToxic = true;
          ctx.newLogs.push({ text: "The Hydra's bite infects you. You are Toxic!", kind: "enemy" });
        }
        return ctx;
      },
      onTurnEnd: (ctx) => {
        if (ctx.combatState.playerToxic && Math.random() < 0.25) {
          ctx.playerHpLoss = (ctx.playerHpLoss || 0) + 1;
          ctx.newLogs.push({ text: "Toxic venom burns your veins! You lose 1 HP.", kind: "enemy" });
        }
        return ctx;
      }
    }
  },
  mire_regen: {
    id: 'mire_regen',
    name: 'Mire Regeneration',
    hooks: {
      onTurnEnd: (ctx) => {
        if (Math.random() < 0.25 && ctx.enemyHp < ctx.enemyMaxHp) {
          ctx.enemyHpGain = (ctx.enemyHpGain || 0) + 1;
          ctx.newLogs.push({ text: "The Mire Man absorbs the swamp and heals 1 HP!", kind: "enemy" });
        }
        return ctx;
      }
    }
  },
  scythe_strike: {
    id: 'scythe_strike',
    name: 'Scythe Strike',
    hooks: {
      onEnemyWinningHit: (ctx) => {
         if (ctx.enemyRoll && ctx.enemyRoll >= 150) {
            ctx.damage = 2;
            ctx.newLogs.push({ text: "Scythe Strike triggers! Massive damage!", kind: "enemy" });
         }
         return ctx;
      }
    }
  },
  toxic_spit: {
    id: 'toxic_spit',
    name: 'Toxic Spit',
    hooks: {
      onPlayerWinningHit: (ctx) => {
        if (!ctx.combatState.playerToxic) {
           ctx.combatState.playerToxic = true;
           ctx.newLogs.push({ text: "Salamandar's blood is venomous! You are afflicted with Toxic.", kind: "enemy" });
        }
        return ctx;
      },
      onTurnEnd: (ctx) => {
        if (ctx.combatState.playerToxic && Math.random() < 0.25) {
          ctx.playerHpLoss = (ctx.playerHpLoss || 0) + 1;
          ctx.newLogs.push({ text: "Toxic venom burns your veins! You lose 1 HP.", kind: "enemy" });
        }
        return ctx;
      }
    }
  }
};