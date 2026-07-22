/**
 * @file rng.js
 * @description Seeded random number generation. The whole simulation draws from
 * one seeded stream, which makes a battle reproducible from its seed alone —
 * useful for replays, for "rematch with the same rolls", and for testing the
 * engine without stubbing Math.random.
 */

/** mulberry32 — small, fast, and good enough for dice. */
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomSeed = () => (Math.random() * 0xffffffff) >>> 0;

export const createRng = (seed = randomSeed()) => {
  const next = mulberry32(seed);
  let calls = 0;

  const float = () => {
    calls += 1;
    return next();
  };

  return {
    seed,
    /** Number of draws taken so far — handy when debugging desyncs. */
    get calls() { return calls; },
    float,
    /** 1..max inclusive. Guards against a die that debuffs pushed below 1. */
    die: (max) => Math.floor(float() * Math.max(1, Math.floor(max))) + 1,
    /** true with probability 1/n. */
    oneIn: (n) => Math.floor(float() * Math.max(1, n)) === 0,
    coin: () => float() < 0.5,
    pick: (list) => list[Math.floor(float() * list.length)],
  };
};
