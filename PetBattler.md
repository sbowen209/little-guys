# PET BATTLER

**Game Design Document v3.0 — Deterministic Autobattler**

This document describes the game *as implemented* in `src/Pets/`. Where v2.0 of
the design differed from what shipped, this version follows the code and calls
out the difference. Section 14 is the contract for adding pets in later versions.

---

## 1. OVERVIEW & VITALS

| | |
|---|---|
| **Genre** | 1v1 turn-based dice autobattler |
| **Player agency** | Entirely pre-combat: roster selection, Nature rolls, level-ups, and lineup order |
| **Combat** | Fully automated. No buttons during a match — only playback controls |
| **Team size** | Up to 5 pets, deployed in a locked order |
| **Health** | A small flat pool shown as hearts (base 3–8 depending on species) |
| **Match length** | ~95 turns for a full 5v5; roughly 45 seconds at 8x speed |

Pet Battles are a preparation game. Every decision is made before the bell; the
match itself is a spectacle you watch resolve. That framing drives the whole
technical design: the match is *simulated to completion the instant you press
Initiate Duel*, and what you watch is a recording of a result that already
exists. See §13.

### Core stats

| Stat | Meaning |
|---|---|
| **ATK** | The offensive die rolled to land strikes |
| **DEF** | The defensive die rolled to block them |
| **SPC** | The resource die rolled each turn to build the Special meter. Its *maximum* also decides the opening turn |
| **HP** | Flat hearts. No regeneration outside specific effects |

All stats are die sizes, not values. A pet with ATK 40 rolls `1d40` when it
attacks. This is why flat modifiers of ±10 matter enormously and why Natures
swing power so hard.

---

## 2. THE TURN

Each turn belongs to exactly one side's active pet and runs these phases in order.
Any phase can end the turn early.

1. **Stun check.** If the pet is `Stunned`, consume it and end the turn.
2. **Burn tick.** Roll `1d6` per Burn stack. Each `1` deals that stack's damage
   and clears it. If this reduces the pet to 0 HP it faints and the turn ends.
3. **Special charge.**
   - The active pet rolls its SPC die and adds the result to its meter.
   - **Benched pets generate nothing by default.** Charge from the bench only
     happens if a passive grants it, via the `benchCharge` hook.
   - Any pet whose passive reacts to allied charge gains resolve now (see
     *Lovey Dovey*). Bond shares do not chain — a share never triggers another share.
   - The meter caps at 100.
4. **Paralysis check.** If `Paralyzed`, 25% chance to lose the action and end the turn.
5. **Action.** If the meter is at 100, the pet **must** cast its Special: the meter
   resets to 0 and the Special resolves. Otherwise it makes a standard attack.
6. **Turn passes** to the opponent — unless a pet fainted, in which case the
   replacement enters and the turn goes to the side that lost it (§6).

### Standard attack

The attacker rolls its ATK die, the defender rolls its DEF die. **The attack
lands if ATK is greater than or equal to DEF — ties go to the attacker.**
A successful attack deals 1 damage plus whatever the attacker's role and
passives add.

### Advantage and disadvantage

Every source of advantage and disadvantage is summed into a **net** value, and
advantage cancels disadvantage one for one. The net decides how many dice are
rolled: `1 + |net|`. A net of +1 rolls two dice and keeps the highest, +2 rolls
three and keeps the highest, −2 rolls three and keeps the lowest, and a net of 0
rolls one die. The arena shows every contributing reason under the roll, and
labels each die KEPT or DROP.

---

## 3. ELEMENTAL AFFINITIES

Every pet has a **defensive typing**. Attacking pets also have an **offensive
typing**, which only matters for the Affinity Attacker role.

Weakness chain — each element is weak to the one that beats it:

```
Fire  ←  Water  ←  Air  ←  Earth  ←  Fire        (cycle)
Shadow ⇄ Spirit                                   (mutual)
```

| Offensive typing | Advantage into | Disadvantage into |
|---|---|---|
| Fire | Earth | Water |
| Water | Fire | Air |
| Air | Water | Earth |
| Earth | Air | Fire |
| Shadow | Spirit | — |
| Spirit | Shadow | — |
| Physical | — | — |

Shadow and Spirit are weak to each other, so each has advantage into the other
and disadvantage into nothing. Physical is inert on this chart by design — that
is what separates the Attacker role from the Affinity Attacker role.

---

## 4. ROLES

| Role | Offence | Defence |
|---|---|---|
| **Attacker** | Advantage vs Healer, Support, Affinity Tank. Ignores the affinity chart | — |
| **Affinity Attacker** | Advantage vs Tank. Gains advantage *or* disadvantage from the affinity chart | — |
| **Tank** | — | Advantage on DEF vs Attacker and Stunner |
| **Affinity Tank** | — | Advantage on DEF vs Affinity Attacker and Healer |
| **Stunner** | Every successful attack also inflicts 1 Stun Counter | — |
| **Healer** | Every successful attack builds 1 Heart Counter. At 3, heal the lowest-health ally (bench included) 1 heart and reset | — |
| **Support** | — | Backline utility. Bench charge comes from a passive, not from the role itself — see *Backline Current* |

The matchup web is deliberately rock-paper-scissors: physical Attackers punch
through Affinity Tanks, Affinity Attackers punch through Tanks, and each Tank
type walls the attacker it was built for.

> **Note:** No Healer pet exists in the current roster. The role is fully
> implemented, so a Healer species can be added as pure data.
>
> **Bench charge is a passive, not a role.** Nothing generates Special charge
> from the bench unless a passive says so. *Backline Current* (Felightning,
> Lv.1) is the one that does, and it carries the original design intent one
> step further: it banks half its own SPC roll **and relays a quarter of that
> same roll to the active ally**, which is what makes parking a Support on the
> bench a real tactical choice rather than a dead slot.

---

## 5. STATUS EFFECTS

| Status | Kind | Effect |
|---|---|---|
| **Burn** | Debuff | At the start of your turn, roll `1d6` per stack. Each `1` deals 2 damage (3 if the applier had *Scorching Flames*) and clears that stack. Potency is captured **when the Burn is applied**, so a Scorching Flames burn stays lethal regardless of who is burning |
| **Rend** | Debuff | Max DEF halved. One stack is consumed each time you are attacked |
| **Fade** | Buff | The next attack against you rolls at half Max ATK. One stack consumed per attack |
| **Cursed** | Debuff | When you would deal damage, a flat **50% chance to null it entirely** — the number of stacks does not change the odds. Stacks are **duration**: one is lost at the end of your own turn, except a stack applied during that same turn, which is spared so a reactive application always gets a live turn |
| **Paralyzed** | Debuff | 25% chance each turn to lose your action, checked after charge is generated. Does not expire |
| **Stun Counter** | Debuff | At 3 counters, they convert into Stunned |
| **Stunned** | Debuff | Skip your next turn. Consumed on use |
| **Bubble Shield** | Buff | Max DEF doubled. Pops the moment you take *any* damage, leaving the attacker Damp |
| **Damp** | Debuff | Max DEF reduced by 10 per stack. Washed off when you take damage |
| **Shed** | Buff | Max ATK increased by your Max DEF. One stack consumed per attack |
| **Stagnation** | System | See §8 |

**Debuff immunity** (*Thick Fur*) refuses everything marked Debuff and nothing
marked Buff.

### Defence pipeline

Order matters and is applied exactly once, in `engine/combatant.js`:

```
DEF = base + flat modifiers − (10 × Damp stacks)
    → ×2 if Bubble Shield
    → ÷2 if Rend
    → ×(1 − 0.1 × Stagnation stacks), floored at 10% of base
    → minimum 1
```

### Attack pipeline

```
ATK = base + permanent modifiers + next-attack modifier
    → + Max DEF if Shed
    → × the Special's scaling (1x for a standard attack)
    → ÷2 if the target has Fade
    → minimum 1
```

---

## 6. LINEUP & INITIATIVE

- Before a match you lock the exact order of up to 5 pets. Slot 1 is the **Lead**.
- **The opening turn is decided by Max SPC** — the higher *die size*, not the
  current meter. An exact tie is a coin flip.
- **After a knockout, the side that lost the pet always acts first.** Losing a
  pet hands you the tempo, so a trade is never purely one-sided and the
  replacement is not walked into immediately. This replaces the older rule of
  recalculating Max SPC initiative on every switch-in.
- A fainting pet **passes its accumulated Special charge** to whoever replaces it.
- Benched pets keep any charge they generated, so a benched Support that never
  fights can still walk on with a full meter.

---

## 7. SPECIALS

Every Special costs the full 100 meter and fires automatically. Specials are
either **Attack** (roll ATK vs DEF as normal, with the listed scaling) or
**Effect** (no roll, resolves immediately).

| Pet | Special | Type | Effect |
|---|---|---|---|
| Hellhound (Affinity) | **Hellfire Bolt** | Attack, **200% ATK** | 2 Fire damage and inflicts Burn |
| Hellhound (Physical) | **Rending Bite** | Attack, **200% ATK** | 2 damage and 3 stacks of Rend |
| Emboar | **Heat Up** | Effect | Inflicts Burn on the opposing pet |
| Terror Terrier | **Terrorize** | Attack, 200% ATK | 1 damage and 3 Stun Counters. Gains 2 stacks of Fade **whether or not the strike lands** |
| Scruffy | **Shed** | Effect | 5 stacks of Shed (Max DEF added to Max ATK for 5 attacks) |
| Necrodoodle | **Doom Curse** | Attack, 200% ATK | 2 damage and 3 stacks of Cursed |
| Gnollbacabra | **Sunder** | Effect | Permanently strips `1d3 × 10` Max ATK. If the target's Max ATK reaches 0 they are destroyed outright |
| Famine Wolf | **Ravenous Bite** | Attack, 200% ATK | 2 damage, then immediately regain 50 charge |
| Felightning | **Static Shock** | Attack, **TRUESTRIKE** | Cannot be blocked. 1 damage and inflicts Paralyzed |
| Bubble Trouble (both) | **Bubble Shield** | Effect | Doubles Max DEF until you take damage; the attacker who pops it is left Damp |

---

## 8. STAGNATION (ANTI-STALL)

Two high-DEF tanks with low ATK can theoretically trade blocked attacks forever.
Stagnation is the pressure valve.

- A counter increments every turn in which **total HP across both teams does not fall**.
- After **6** such turns, both active pets gain 1 stack of Stagnation.
- Once anyone has a stack, the interval tightens to **every 2 turns**.
- Each stack cuts Max DEF by 10%, down to a floor of 10% of the original die.
- Every stack is cleared the moment any pet is knocked out, and the counter resets.

There is also a hard `MAX_TURNS = 400` ceiling in the engine. Reaching it ends
the match as a **draw**. Across 1,500 randomised 5v5 matches, the longest was
196 turns and there were zero draws — the cap exists purely as a guarantee that
a future pet can never hang the simulator.

---

## 9. PASSIVES

Every pet has a passive at Level 1 and a second at Level 5.

| Pet | Lv.1 | Lv.5 |
|---|---|---|
| Hellhound (Affinity) | **Hellfire** — standard attacks have a 1/6 chance to inflict Burn | **Scorching Flames** — Burns this pet applies deal 3 instead of 2 |
| Hellhound (Physical) | **Intimidating** — advantage against enemies at full health | **Smells Weakness** — advantage against enemies at 2 hearts or fewer |
| Emboar | **Flame Aura** — 25% chance to Burn anyone who damages you with an attack | **Afterburn** — Burn the opposing pet when you are knocked out |
| Terror Terrier | **Ghostly Blur** — gain 1 Fade after taking damage | **Capitalize** — when you Stun someone they take 1 damage and lose all charge |
| Scruffy | **Thick Fur** — immune to debuffs | **Scruffy** — advantage on DEF at 2 hearts or fewer |
| Necrodoodle | **Hex Claws** — standard attacks have a 1/6 chance to inflict Cursed | **Vengeful Curse** — 25% chance to Curse anyone who damages you |
| Gnollbacabra | **Crippling Bite** — after damaging a target, their next attack rolls at −`1d6 × 10` Max ATK | **Bonecrusher** — anyone who damages you loses `1d2 × 10` Max DEF until their next turn |
| Famine Wolf | **Crunch** — 25% chance to deal 1 extra damage | **Famine Feast** — after a knockout, gain +20 Max ATK permanently and 1 heart |
| Felightning | **Backline Current** — while benched, bank half your SPC roll and relay a quarter of it to the active ally · **Baton Pass** — when knocked out, the next ally to enter gains 1 heart | **Overcharge** — inflicting Paralyzed also inflicts 3 Stun Counters |
| Bubble Trouble (Physical) | **Lovey Dovey** — gain 50% of any charge a bonded ally generates | **Surface Tension** — recover 25 charge when your Bubble Shield pops |
| Bubble Trouble (Affinity) | **Lovey Dovey** — as above | **Undertow** — Damp you inflict also strips 10 Max ATK until the target's next attack |

**Bonding** is a species tag rather than a hard-coded pairing: both Bubble
Troubles carry `bond: 'bubble'`, and *Lovey Dovey* fires for any ally sharing
your tag. A future bonded pair only needs the tag.

---

## 10. PROGRESSION

### Natures

Rolled once, at capture. A `d20` is rolled; distance from the centre selects a
second die from `d2` up to `d16`, and that die's result is the flat modifier.
Rolls of 11–20 are positive, 1–10 negative. Each of ATK, DEF and SPC gets its own
Nature, and the modifier permanently resizes the base die — an ATK Nature of +11
turns `1d50` into `1d61`.

Presets ship with fixed, authored Natures and never re-roll.

### Levels

Levels run 1 to 7. **Each level grants `1d4` to one random die** (ATK, DEF or SPC).

> **Deviation from v2.0:** the old document specified a flat +1 per level. On dice
> sized 20–70, +1 is statistically invisible, so the shipped rule is `1d4`. The
> code is the source of truth; if the flat +1 is wanted instead, change
> `rollLevelGain` in `setup/PetSetup.jsx`.

Level 5 unlocks the second passive.

### Manual balance

The builder exposes a **Manual Balance** toggle that nudges individual dice up or
down. It cannot push a stat below `species base + Nature`, so it can only ever
give away or spend earned level-ups — it is a tuning aid, not a cheat.

### Presets

Named, pre-levelled variants that derive from a base species, so any future
change to that species' Special or passives is inherited automatically.

| Preset | Base | Lv | Natures (ATK/DEF/SPC) | Final line |
|---|---|---|---|---|
| **Fluffy** | Hellhound (Affinity) | 5 | +4 / −4 / +4 | HP 5 · d45 / d36 / d43 |
| **Fuzzy** | Hellhound (Physical) | 5 | +11 / +8 / −3 | HP 5 · d69 / d40 / d29 |
| **Lovey** | Bubble Trouble (Physical) | 1 | +1 / +1 / +3 | HP 8 · d21 / d51 / d33 |
| **Dovey** | Bubble Trouble (Affinity) | 1 | −3 / −7 / −8 | HP 8 · d17 / d43 / d22 |

---

## 11. TEAM BUILDING

- **12 saved rosters**, persisted to `localStorage` under `gpb_saved_teams`.
- Drafting rolls fresh Natures; each drafted pet is a distinct instance.
- Lineup order is set by dragging roster slots. Slot 1 is flagged **LEAD**.
- Saves are **migrated on load**. Entries referencing a species that no longer
  exists are dropped rather than crashing the builder, and the pre-refactor
  `dataId` field is still accepted. This is what makes it safe to rename or
  retire artwork in a later version.

---

## 12. PRESENTATION & PLAYBACK

The match is a recording, so the controls are transport controls. They sit in a
single strip at the top of the arena with the log docked to their right, keeping
the entire lower two-thirds of the frame clear for the fight.

| Control | Key | Behaviour |
|---|---|---|
| Play / Pause | `Space` | Freeze on any beat |
| Speed | `1` `2` `4` `8` | Scales every hold *and* every CSS animation together, so visuals never desync from pacing |
| Step | `→` | Advance exactly one beat |
| Log | — | Scrollback of the last 16 events |
| Skip | — | Jump to the result |
| Exit | `Esc` | Back to setup |

### Reading the fight

- **Midday, no vignette.** The arena is lit flat and bright. Nothing in the
  scene is dimmed to create focus, which means the pets can be the most
  saturated thing on screen without competing against a darkened backdrop.
- **The duel is downstage**, larger and lower in the frame than anything else.
  The bench lines up against the back wall, the crowd is behind that.
- **Hearts, name and charge** sit under each pet with no panel around them.
- **Statuses live on each pet's outer flank** as large bordered icons with stack
  counts, drawn *behind* the sprites so an attack animation sweeps in front of
  them. They are big enough to read peripherally, so checking whether something
  is burning never pulls your eye off the action.
- **The bench carries no HUD at all.** Who enters next is communicated by
  staging: closest to the fight, largest, brightest, with the rest queued behind.

### The dice

Every die the game rolls uses one visual grammar: a card over the pet it belongs
to, one bar per die, bar height = roll ÷ scale.

- **Opposed rolls share a single scale** (the larger of the two die sizes), so
  the ATK and DEF bars are directly comparable and the taller bar simply wins.
  Scaling each card to its own die made a 30-on-d40 look bigger than a
  45-on-d50, which is backwards.
- **Advantage shows both dice.** The kept die is labelled `KEPT`; the discarded
  one is greyed, shrunk, struck through and labelled `DROP`. Exactly one die is
  ever marked kept, including when both land on the same face.
- **Status checks draw a dashed threshold line.** Three Burn stacks means three
  bars; at or below the line means that stack ignited. Burn fires on a 1 of d6,
  so "low bar wins" reads backwards without the line — with it, no rules
  knowledge is needed. The same card covers the Paralyze and Cursed checks.

### Motion policy

Glows and flashes are reserved for impact: landing a hit, taking one, casting a
Special, going down. Routine beats — charge ticks, status checks — get no sprite
treatment at all, because a pet that lights up several times a turn reads as
strobing rather than as emphasis. Neither pet is ever dimmed for not being the
active one.

Floating combat text owns its own lifetime: a number is queued when its event
fires and removes itself on `animationend`, rather than being tied to the
current event. Previously any event whose hold was shorter than the animation
yanked its own number off screen mid-flight, which was the main source of
jerkiness at higher speeds.

Text is limited to things that carry a number or a state change the animation
cannot show. "BLOCKED" is gone — the defender visibly dodges and the roll card
already shows the miss, so the word was noise on top of two clearer signals.

`prefers-reduced-motion` collapses every animation.

---

## 13. TECHNICAL ARCHITECTURE

```
src/Pets/
├── data/            Pure data. No logic, no React.
│   ├── constants.js   roles, elements, affinity chart, matchup tables, RULES
│   ├── statuses.js    status registry
│   ├── passives.js    passive registry — hooks live here
│   ├── abilities.js   Special registry
│   ├── species.js     the pet directory
│   ├── presets.js     named variants derived from species
│   └── index.js       PET_DB, instancing, Natures, save migration
├── engine/          Pure simulation. No React, no DOM, no timers.
│   ├── rng.js         seeded mulberry32
│   ├── combatant.js   live pet state + the derived-stat pipeline
│   ├── events.js      event vocabulary and the pacing table
│   ├── simulate.js    the rules
│   └── balance.mjs    headless fuzz + win-rate harness
├── hooks/
│   ├── useBattlePlayback.js   rAF transport over a finished timeline
│   └── useSavedTeams.js       localStorage with migration
├── ui/              The arena
└── setup/           Menu, team builder, battle select
```

### Simulate-then-replay

`simulateBattle()` runs the **entire match synchronously** and returns a list of
events, each carrying a full state snapshot. Nothing in the engine awaits, sleeps
or renders.

This is the single most important decision in the codebase and it buys:

- **Smooth playback.** The view renders once per *event*, not once per frame,
  and pacing is a lookup in one table (`events.js: HOLD`).
- **Free transport.** Pause, step, skip and scrub are cursor moves over an array.
- **Safe teardown.** Leaving mid-match cancels one animation frame. There is no
  in-flight async chain that can write to a dead component.
- **Determinism.** A seed reproduces a match exactly, so a rematch can be
  replayed and a bug report can be reduced to a seed.
- **Testability.** `balance.mjs` runs thousands of matches in Node in seconds.

### The pacing table

Every visual beat's duration lives in `engine/events.js`, plus a global `TEMPO`
multiplier. Retuning the entire feel of the game is one file.

### Performance notes

- The arena is authored in a fixed 1600×900 space and fitted with a **single
  transform**, so layout is identical at any window size and nothing reflows on resize.
- The backdrop is a memoised component with no props — React never re-renders it
  mid-match. Ambient motion is CSS on composited layers rather than animated SVG
  filters, which is what the previous build spent most of its frame budget on.
- Sprites are DOM `<img>` elements, never remounted. Poses return to idle between
  beats, so toggling the class is what restarts a one-shot animation — no keys,
  no forced reflow.
- Playback parks itself when the tab is hidden, because `requestAnimationFrame`
  does. A match does not silently run out while you are in another tab.

---

## 14. ADDING A PET

This is the contract. **The engine never names a pet, a Special or a passive**;
everything bespoke lives behind the registries. Adding a pet is:

1. Drop the artwork in `public/images/pets/`.
2. If it needs a new Special, add an entry to `data/abilities.js`. Most are fully
   declarative — `damage`, `atkScale`, `applyToTarget`, `applyToSelf` — and only
   reach for the `onResolve` escape hatch for genuinely odd behaviour like Sunder.
3. If it needs new passives, add them to `data/passives.js` against the hook
   points listed at the top of that file.
4. If it needs a new status, add it to `data/statuses.js`.
5. Add the species to `data/species.js` with a **new, permanent id**.
6. Run `node src/Pets/engine/balance.mjs` and check the win-rate table.

No engine file and no UI file needs to change. Ids are permanent because saved
rosters reference them — never rename or reuse one; retire it and add a new one.

A dev-mode assertion in `data/index.js` fails loudly if a species points at a
Special or passive that does not exist.

### Balance harness

```bash
node src/Pets/engine/balance.mjs 2000
```

Reports average and longest match length, draw rate, a solo win-rate table for
every species, and a set of rule assertions. Current headline numbers (1,500
matches, level 1, no Natures):

| | |
|---|---|
| Average turns | 97 |
| Longest match | 196 (cap is 400) |
| Draws | 0 |

---

## 15. CHANGES FROM v2.0

| Change | Detail |
|---|---|
| **Hellhound specials scale to 200%** | Both *Hellfire Bolt* and *Rending Bite* now roll at 200% Max ATK, up from +50%. This matches how the Fluffy preset was already written and puts the hounds in line with every other attacking Special |
| **Emboar's Heat Up no longer heals** | It now only inflicts Burn |
| **Bubble Shield no longer heals** | It now only grants the doubled DEF and the Damp on the attacker |
| **Bubble Trouble Lv.5 passives filled in** | Both were `xxxx` placeholders. *Surface Tension* and *Undertow* are new content, flagged below |
| **Shadow/Spirit chart corrected** | Now mutually advantaged, matching the written rule |
| **Burn potency is captured on application** | Previously *Scorching Flames* was checked against the pet that was burning rather than the pet that applied the Burn, so the buff could apply to the wrong side |
| **Felightning's Lv.1 passive** | Implemented as *Baton Pass* (the design's name) rather than the shipped *Get Away* |
| **Knockout priority** | The side that just lost a pet acts first. Replaces both the old alternating-turn behaviour and the v3.0 rule of recalculating Max SPC initiative on each switch-in |
| **Level-ups documented as `1d4`** | See §10 |
| **Draw condition** | A match that reaches the turn cap is now an explicit draw rather than undefined |

### Content authored during this pass

Two Level-5 passives were placeholders (`xxxx`) and had to be written to make the
roster complete. Both are cheap to change in `data/passives.js`:

- **Surface Tension** (Bubble Trouble Physical) — recover 25 charge when your
  Bubble Shield pops.
- **Undertow** (Bubble Trouble Affinity) — Damp you inflict also strips 10 Max ATK.

---

## 16. OPEN BALANCE QUESTIONS

Flagged rather than silently fixed, because they are design calls:

1. **Heat Up is now weak for a 100-charge Special.** Removing the heal leaves it
   as "inflict one Burn", which is worth roughly 1/6 × 2 damage per subsequent
   turn. Emboar still tests well because *Flame Aura* and its 6 HP carry it, but
   the Special itself no longer feels like a payoff. Options: raise the Burn to
   2 stacks, or have it also grant Emboar a defensive buff.
2. **Felightning solo win rate is ~1%.** Expected — it is a 3 HP Support whose
   entire value is generating charge from the bench, which a 1v1 test cannot
   measure. Judge it only in full 5v5 lineups.
3. **Gnollbacabra sits at ~37%.** 4 HP and a `d20` DEF is a lot of fragility for
   an attacker whose Special is a slow debuff. It may want a fifth heart.
4. **Necrodoodle leads at ~76%.** `d40 / d30 / d40` with a curse engine and a
   200% Special is a strong package. Worth watching once more Spirit-typed pets
   exist to punish it.
5. **A 5v5 averages ~95 turns.** That is inherent to small HP pools and a ~50%
   hit rate. 8x playback covers it, but if matches should be shorter the levers
   are base damage, the hit threshold, or an earlier Stagnation trigger.
