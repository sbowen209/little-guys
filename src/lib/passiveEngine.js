// src/lib/passiveEngine.js
// The only place that knows how to dispatch passive hooks.
import { PASSIVES } from '../data/passives';
import { ENEMY_ABILITIES } from '../data/enemyAbilities';

/**
 * Folds every matching hook for `event` over `ctx`, in the hero's passive order.
 * Hooks receive (ctx, def) and return the (possibly mutated) ctx.
 */
export function runPassiveHook(hero, event, ctx) {
  const ids = hero?.passives ?? [];
  return ids.reduce((acc, id) => {
    const def = PASSIVES[id];
    const fn = def?.hooks?.[event];
    if (!fn) return acc;
    return fn(acc, def) ?? acc;
  }, ctx);
}

/** True if the hero owns at least one passive that listens for `event`. */
export function heroHasHook(hero, event) {
  return (hero?.passives ?? []).some((id) => PASSIVES[id]?.hooks?.[event]);
}

/**
 * Executes a specific combat event hook for an enemy, passing the combat state in `ctx`.
 */
export function runEnemyHook(enemy, event, ctx) {
  if (!enemy || !enemy.ability) return ctx;
  const def = ENEMY_ABILITIES[enemy.ability];
  const fn = def?.hooks?.[event];
  if (!fn) return ctx;
  return fn(ctx) ?? ctx;
}