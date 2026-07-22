// src/data/passives.js
// Declarative, event-driven passive definitions (doc §6).
// Adding a new passive = add a def here + reference its id on a hero.
// NEVER edit combat/run logic to add one.
//
// `scope` controls how a single-use flag is tracked in run state:
//   'run'   → once per run   (Take Flight)
//   'level' → once per level (Looking for Trouble)
//
// Each hook receives (ctx, def). It mutates/returns ctx. Stateful hooks read
// their own used-flag from ctx.runFlags[def.id] / ctx.levelFlags[def.id] and
// signal consumption via ctx.consume = def.id.
export const PASSIVES = {
  ardenkin: {
    id: 'ardenkin',
    name: 'Ardenkin',
    desc: 'Advantage on plant rolls (roll the gather quantity twice, keep the higher).',
    hooks: {
      modifyGatherRoll(ctx) {
        const second = ctx.rng.d3();
        ctx.rolls.push(second);
        ctx.rollQuantity = Math.max(ctx.rollQuantity, second);
        ctx.advantage = true;
        return ctx;
      },
    },
  },

  battle_bloom: {
    id: 'battle_bloom',
    name: 'Battle Bloom',
    desc: 'Recover 1 HP at the end of every fight (max 5 HP).',
    hooks: {
      onFightEnd(ctx) {
        ctx.hp = Math.min(ctx.maxHp, ctx.hp + 1);
        return ctx;
      },
    },
  },

take_flight: {
    id: 'take_flight',
    name: 'Take Flight',
    desc: 'The first time you would be Defeated in a run, you survive at 1 HP instead, immediately escaping combat. Once per run.',
    scope: 'run',
    hooks: {
      onWouldBeDefeated(ctx, def) {
        if (ctx.runFlags?.[def.id]) return ctx;
        ctx.prevented = true;
        ctx.newHp = 1;
        ctx.endCombat = true; // Signal escape
        ctx.consume = def.id;
        return ctx;
      },
    },
  },

  sweeping_wind: {
    id: 'sweeping_wind',
    name: 'Sweeping Wind',
    desc: 'Deals 2 damage instead of 1 on a winning exchange while more than one enemy remains.',
    hooks: {
      onWinningHit(ctx) {
        if (ctx.enemyCount > 1) ctx.damage = 2;
        return ctx;
      },
    },
  },

  thickhide: {
    id: 'thickhide',
    name: 'Thickhide',
    desc: "Only takes damage when the enemy's winning surplus is 50 or greater.",
    hooks: {
      modifyIncomingDamage(ctx) {
        if (ctx.surplus < 50) ctx.damage = 0;
        return ctx;
      },
    },
  },

looking_for_trouble: {
    id: 'looking_for_trouble',
    name: 'Looking for Trouble',
    desc: 'Once per map level, force-reroll any exploration result that is not a Battle (only if no battle has been fought in this zone).',
    scope: 'level',
    hooks: {
      canRerollEncounter(ctx, def) {
        if (ctx.levelFlags?.[def.id]) return ctx;
        if (ctx.hasFought) return ctx; // Restrict if she's already fought here
        if (ctx.encounterType !== 'BATTLE') {
          ctx.shouldReroll = true;
          ctx.consume = def.id;
        }
        return ctx;
      },
    },
  }
}

export const getPassive = (id) => PASSIVES[id] || null;
export const passiveScope = (id) => PASSIVES[id]?.scope || 'run';