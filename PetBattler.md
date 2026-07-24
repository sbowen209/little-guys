# PET BATTLER

**Game Design Document v3.2 — Deterministic Autobattler**

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
| **Match length** | ~92 turns for a full 5v5; roughly 45 seconds at 8x speed |

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
   - **Every benched Support** rolls its own SPC die and banks half of it (§4).
     Other benched pets generate nothing unless a passive grants it via the
     `benchCharge` hook.
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
| **Support** | — | **Generates Special charge from the bench.** Each of its team's turns, a benched Support rolls its own SPC die and banks half the result |

The matchup web is deliberately rock-paper-scissors: physical Attackers punch
through Affinity Tanks, Affinity Attackers punch through Tanks, and each Tank
type walls the attacker it was built for.

### ⚠ PROTECTED RULE — Support bench charge

**A benched Support generates Special charge. This belongs to the role itself,
not to any passive, and must not be moved behind one.**

Each turn its team takes, every benched Support rolls its own SPC die and banks
`floor(roll × 0.5)` — tuned by `RULES.SUPPORT_BENCH_SHARE` in
`data/constants.js`. It is the single reason to hold a Support in reserve rather
than lead with it; without it a benched Support is a dead roster slot and the
role has no identity. A passive may still *add* bench charge on top through the
`benchCharge` hook, but the baseline is the role's.

This was once implemented as a passive (*Backline Current*) and was lost when
that passive was retired in a balance pass. It is now guarded by an assertion in
`balance.mjs` — *"A benched Support still generates Special charge"* — which
fails loudly if the behaviour disappears again. **Do not remove that assertion.**

> **Note:** Mosstiff is the roster's only Healer. The role was fully implemented
> long before a species used it, which is what made adding one pure data.

---

## 5. STATUS EFFECTS

| Status | Kind | Effect |
|---|---|---|
| **Burn** | Debuff | At the start of your turn, roll `1d6` per stack. Each `1` deals 2 damage (3 if the applier had *Hell Flames*) and clears that stack. Potency is captured **when the Burn is applied**, so a Hell Flames burn stays lethal regardless of who is burning |
| **Rend** | Debuff | Max DEF halved. **Does not wear off** — only a cleanse removes it |
| **Fade** | Buff | The next attack against you rolls at half Max ATK. One stack consumed per attack |
| **Cursed** | Debuff | When you would deal damage, a flat **50% chance to null it entirely** — the number of stacks does not change the odds. Stacks are **duration**: one is lost at the end of your own turn, except a stack applied during that same turn, which is spared so a reactive application always gets a live turn |
| **Paralyzed** | Debuff | 25% chance each turn to lose your action, checked after charge is generated. Does not expire |
| **Stun Counter** | Debuff | At 3 counters, they convert into Stunned |
| **Stunned** | Debuff | Skip your next turn. Consumed on use |
| **Bubble Shield** | Buff | Max DEF doubled. Pops the moment you take *any* damage, leaving the attacker Damp |
| **Damp** | Debuff | Max DEF reduced by 5 per stack. Washed off when you take damage |
| **Shed** | Buff | Max ATK increased by your Max DEF. One stack consumed per attack |
| **Zaptap** | Buff | When an attack damages you, deal 1 back to the attacker. One stack consumed |
| **Advantage** | Buff | Your next attack rolls with Advantage. One stack consumed per attack |
| **Disadvantage** | Debuff | Your next attack rolls with Disadvantage. One stack consumed per attack |
| **Energized** | Buff | Roll your SPC die twice and bank both. One stack consumed per roll |
| **Stunt** | Debuff | You cannot cast your Special, even at a full meter. One stack falls off at the end of your turn |
| **Powerful** | Buff | Your attacks deal at least 2 damage. One stack consumed per attack that **lands** |
| **Bleed** | Debuff | At the start of your turn, roll `1d4` per stack. Each `1` deals 1 damage and clears that stack |
| **Bone Shield** | Buff | +5 Max DEF per stack. One stack is stripped whenever an attack damages you |
| **Stagnation** | System | See §8 |

A stack of **Advantage** is one attack's worth, not one step of magnitude:
holding three means three advantaged attacks, never a single roll of four dice.

### Declarative statuses

Everything from Zaptap down is **pure data**. `data/statuses.js` documents a set
of behaviour fields (`attackAdvantage`, `defBonus`, `damageFloor`,
`blocksSpecial`, `thorns`, `spcDice`, `spcMult`, `tickOnTurn`) and expiry fields (`consumeOnAttack`,
`consumeOnHit`, `consumeOnDamaged`, `consumeOnSpcRoll`, `expireAtTurnEnd`,
`clearOnExit`) which the engine honours generically. A new status that fits them
needs no engine change at all. The statuses above Zaptap predate this and are
still resolved bespoke, because their interactions with the defence pipeline and
with Burn potency do not reduce to those fields.

**Debuff immunity** (*Thick Fur*) refuses everything marked Debuff and nothing
marked Buff.

### Defence pipeline

Order matters and is applied exactly once, in `engine/combatant.js`:

```
DEF = base + flat modifiers − (5 × Damp stacks)
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

Names marked *(provisional)* are placeholders awaiting a real one; they carry
`provisional: true` in `data/abilities.js`. The mechanics are authored.

| Pet | Special | Type | Effect |
|---|---|---|---|
| Hellhound (Affinity) | **Hellfire Bolt** | Attack, **200% ATK** | 1 Fire damage and inflicts Burn |
| Hellhound (Physical) | **Rending Bite** | Attack, **200% ATK** | 2 damage and 3 stacks of Rend |
| Emboar | **Heat Up** | Effect | Inflicts Burn on the opposing pet |
| Terror Terrier | **Terrorize** | Attack, 200% ATK | 1 damage and 3 Stun Counters. Gains 3 stacks of Fade **whether or not the strike lands** |
| Scruffy | **Shed** | Effect | 5 stacks of Shed (Max DEF added to Max ATK for 5 attacks) |
| Necrodoodle | **Doom Curse** | Attack, 200% ATK | 2 damage and 3 stacks of Cursed |
| Gnollbacabra | **Sunder** | Effect | Permanently strips `1d3 × 10` Max ATK. If the target's Max ATK reaches 0 they are destroyed outright |
| Famine Wolf | **Ravenous Bite** | Attack, 200% ATK | 2 damage, then immediately regain 50 charge |
| Felightning | **Static Shock** | Attack, **300% ATK** | 2 damage and inflicts Paralyzed |
| Bubble Trouble (both) | **Bubble Shield** | Effect | Doubles Max DEF until you take damage; the attacker who pops it is left Damp |
| Cerberus | **Twin Fangs** *(provisional)* | Attack, 200% ATK | 2 damage and 3 stacks of Advantage |
| Milk Truck | **Milk** | Effect | Washes off every debuff and grants +10 Max ATK permanently |
| Balto | **Sled Charge** *(provisional)* | Attack, 200% ATK | 1 damage, then a benched enemy is dragged onto the field and takes 1 damage too |
| Watthog | **Chain Shock** | Attack, 200% ATK | 1 damage, plus 1 to two different benched enemies |
| Quillbacabra | **Quill Guard** *(provisional)* | Effect | 3 stacks of Zaptap |
| Punchadillo | **Haymaker** *(provisional)* | Attack, 200% ATK | 1 damage and 1 Stun Counter on **every** enemy, bench included — the active one also takes the Stunner role's counter, so it gets 2 |
| Mosstiff | **Verdant Bloom** *(provisional)* | Effect | A random benched ally gains 1 heart, which **can exceed its Max HP** |
| Bellybummer | **Lifesteal** | Attack, 200% ATK | 1 damage healed back to you, then roll SPC and siphon that much charge off the target |
| Mega Chicken | **Talon Flurry** *(provisional)* | Attack, 200% ATK | 2 damage and 2 stacks of Bleed |
| Thunder Lion | **Thunderstorm** | Attack, 200% ATK | 1 damage. Gains 1 Zaptap **whether or not the strike lands** |
| Bone Boar | **Bone Gore** | Attack, 200% ATK | 2 damage, or 3 against a Tank or Affinity Tank |
| Wild Cat | **Rip and Tear** *(provisional)* | Attack, 200% ATK | 1 damage, Rend, and 1 stack of Bleed |
| Dragon Turtle | **Shell Slam** *(provisional)* | Attack, **200% of Max DEF** | 1 damage and inflicts Burn |

**Shell Slam is the only Special that rolls off a stat other than ATK.** The
`atkFromDef` field swaps the basis to Max DEF, which is what lets a `d20`
attacker throw a `d100` swing. Shed is skipped for such an attack, since adding
Max DEF to a die that already *is* Max DEF would count it twice.

**Overhealing.** A few effects carry a pet above its Max HP. Those hearts are
real, survive on the bench, and come onto the field with the pet; the nameplate
grows extra gold hearts rather than hiding the surplus.

---

## 8. STAGNATION (ANTI-STALL)

Two high-DEF tanks with low ATK can theoretically trade blocked attacks forever.
Stagnation is the pressure valve.

- A counter increments every turn in which **total HP across both teams does not fall**.
- **Any turn on which total HP falls resets the counter to zero.** A fight that
  is trading damage never stagnates, however long it runs. (A bug shipped in an
  earlier build rebased the comparison every turn, so the counter was blind to
  damage and Stagnation arrived on a fixed schedule in every match. The rule is
  now guarded by the assertion *"The stagnation clock resets whenever HP falls"*.)
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
| Hellhound (Affinity) | **Hellfire** — standard attacks have a 1/6 chance to inflict Burn | **Hell Flames** — Burns this pet applies deal 1 extra damage |
| Hellhound (Physical) | **Intimidating** — advantage **and +1 damage** against enemies at full health | **Relentless** — advantage against enemies at 2 hearts or fewer |
| Emboar | **Flame Aura** — 25% chance to Burn anyone who damages you with an attack | **Afterburn** — Burn the opposing pet when you are knocked out |
| Terror Terrier | **Ghostly Blur** — gain 1 Fade after taking damage | **Capitalize** — when you Stun someone they take 1 damage and lose all charge |
| Scruffy | **Thick Fur** — immune to debuffs | **Scruffy** — advantage on DEF at 2 hearts or fewer |
| Necrodoodle | **Hex Claws** — standard attacks have a 25% chance to inflict Cursed | **Vengeful Curse** — 25% chance to Curse anyone who damages you |
| Gnollbacabra | **Crippling Bite** — after damaging a target, their next attack rolls at −`1d6 × 10` Max ATK | **Bonecrusher** — anyone who damages you loses `1d2 × 10` Max DEF until their next turn |
| Famine Wolf | **Crunch** — 25% chance to deal 1 extra damage | **Famine Feast** — after a knockout, gain +40 Max ATK permanently |
| Felightning | **Get Away** — when knocked out, Paralyze a random benched enemy | **Parting Charge** *(prov.)* — when knocked out, bank 50 charge, which passes to your replacement |
| Bubble Trouble (both) | **Lovey Dovey** — gain 50% of any charge a bonded ally generates | **Surface Tension** — recover 25 charge when your Bubble Shield pops |
| Cerberus | **Twin Bite** — after an attack is blocked, gain 1 Advantage | **Press the Advantage** *(prov.)* — attacking with net Advantage, 50% chance of +1 damage |
| Milk Truck | **Milk Shake** — gain 1 Energized when damaged | **Second Stomach** *(prov.)* — 1-in-10 chance to recover 1 heart at the start of your turn |
| Balto | **First Light** *(prov.)* — **double Max ATK** and advantage on any roll during either pet's first turn on the field | **Fresh Legs** *(prov.)* — gain 1 Powerful when you start the match or enter from the bench |
| Watthog | **Chain Lightning** — dealing damage has a 1/6 chance to arc 1 damage to a benched enemy | **Supercharge** — gain 15 charge whenever you are damaged |
| Quillbacabra | **Bristleback** *(prov.)* — 25% chance to deal 1 back when damaged | **Parting Quills** *(prov.)* — when knocked out, the killer takes 1 damage plus 1 per Zaptap stack you held |
| Punchadillo | **Concussive Blast** *(prov.)* — landing a third Stun Counter on the active enemy gives every benched enemy 1 Stun Counter | **Rolling Guard** *(prov.)* — landing a third Stun Counter grants 2 Fade |
| Mosstiff | **Photosynthesis** *(prov.)* — 25% chance to gain a Heart Counter at the start of your turn, without attacking | **Last Bloom** *(prov.)* — when knocked out, the next ally to enter gains 1 heart, which can exceed its Max HP |
| Bellybummer | **Spooked** — when you take the field, the opposing pet gains 5 Disadvantage | **Stage Fright** *(prov.)* — when you take the field, the opposing pet gains 5 Stunt |
| Mega Chicken | **Raking Spurs** *(prov.)* — successful attacks have a 50% chance to inflict Bleed | **Death Throes** *(prov.)* — when knocked out, the opposing pet gains 1 Rend |
| Thunder Lion | **Electrofang** — successful attacks have a 1/6 chance to Paralyze | **Electrocyclone** — 25% chance to gain 1 Zaptap when damaged |
| Bone Boar | **Bone Harvest** *(prov.)* — gain 1 Bone Shield when you deal damage | **Ossuary Guard** *(prov.)* — take the field with 2 Bone Shield already up |
| Wild Cat | **Ambush Instinct** *(prov.)* — advantage against enemies whose Special meter is at least half full | **Scent of Blood** *(prov.)* — +5 Max ATK per pet already defeated on the enemy team |
| Dragon Turtle | **Wear Down** — an attack that fails against you leaves the attacker Damp | **Impenetrable** — Attacker-role units roll at 15 less Max ATK against you |

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
| **Fuzzy** | Hellhound (Physical) | 5 | +11 / +8 / −3 | HP 5 · d69 / d42 / d29 |
| **Lovey** | Bubble Trouble (Physical) | 2 | +1 / +1 / +3 | HP 8 · d22 / d51 / d33 |
| **Dovey** | Bubble Trouble (Affinity) | 2 | −3 / −7 / −8 | HP 8 · d20 / d43 / d22 |

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
4. If it needs a new status, add it to `data/statuses.js` using the declarative
   behaviour fields (§5). Give it an **icon no other status uses** — an
   assertion enforces this, because statuses are read peripherally off each
   pet's flank.
5. Add the species to `data/species.js` with a **new, permanent id**.
6. Run `node src/Pets/engine/balance.mjs` at level 1 **and** level 5.

Ids are permanent because saved rosters reference them — never rename or reuse
one; retire it and add a new one. Presets derive from a species, so they inherit
its Special and passives automatically — and are checked by the harness too, so
a retired passive that only a preset still referenced cannot slip through.

### Hooks a passive can use

`attackAdvantage`, `defenseAdvantage`, `attackScale`, `attackFlatMod`,
`foeAttackMod`, `damageBonus`, `burnPotency`, `onTurnStart`, `onAttackHit`,
`onAttackMiss`, `onBlocked`, `onDealDamage`, `onDamaged`, `onStatusApplied`,
`onStunned`, `onShieldPopped`, `onEnterField`, `onKO`, `onFaint`,
`onAllySpcGain`, `benchCharge`. The authoritative list, with signatures, is the
comment block at the top of `data/passives.js`.

`ctx` additionally offers `activeFoeOf`, `alliesOf`, `foesOf`, `benchedFoesOf`,
`benchedAlliesOf`, `addHeartCounters`, `clearDebuffs`, `forceSwitch`,
`queueSwitchInBonus`, and `heal(pet, n, { overheal })`.

Adding a pet should not require touching `engine/` or `ui/`. If it does, the
right move is a new **general** hook rather than a special case — the engine
still names no pet, Special or passive anywhere.

A dev-mode assertion in `data/index.js` fails loudly if a species points at a
Special or passive that does not exist.

### Balance harness

```bash
node src/Pets/engine/balance.mjs 2000        # level 1
node src/Pets/engine/balance.mjs 2000 5      # level 5 — every second passive online
```

Reports average and longest match length, draw rate, a solo win-rate table for
every species, a **5v5 roster contribution table**, and **35 rule assertions**.
Run it at both levels: several rules
only exist once the Lv.5 passives are live, and a pet can be fine at one level
and broken at the other.

**Level-5 testing gives every die a flat +3** rather than rolling the real four
`1d4` level-ups, as a stable estimate of three stat-ups' worth of growth. Rolling
them per instance would put variance in the table that has nothing to do with the
species being measured. HP is never bumped.

Assertions are the memory of this project. Every rule that was ever argued over
or accidentally reverted has one, and a few exist specifically because the
behaviour was lost once already — Support bench charge and the Stagnation reset
in particular. **Add one whenever a rule is added; never delete one to make a
run go green.**

---

## 15. CHANGES IN v3.2

### Third wave

Four more pets: **Thunder Lion** *(provisional name)*, **Bone Boar**,
**Wild Cat** and **Dragon Turtle** — **24 species**. They brought one new
status (Bone Shield), a Special that rolls off Max DEF, and the hooks
`attackFlatMod`, `foeAttackMod` and `onBlocked`.

> **Naming conflict, unresolved.** Thunder Lion's card was headed "Balto", but
> that name already belongs to the Earth Attacker added in v3.1 and that card
> was unchanged in the same spreadsheet. Two pets cannot share a name, so the
> lion ships as `thunder_lion` under a provisional name. Ids are permanent, so
> renaming the display name later is free; the id is not.

---

## 15b. CHANGES IN v3.1

### The roster doubled

Nine pets joined: **Cerberus, Milk Truck, Balto, Watthog, Quillbacabra,
Punchadillo, Mosstiff, Bellybummer** and **Mega Chicken** — 20 species in all.
They were designed before the game became an autobattler, so a few mechanics had
to be adapted; where a card gave no name for a Special or passive, the shipped
name is marked `provisional: true` and is waiting on a real one.

They brought the roster's first **Healer** (Mosstiff) and first **Spirit** typing
(Milk Truck), both of which the role and affinity systems already supported.

### Rules that changed

| Change | Detail |
|---|---|
| **Stagnation resets on damage** | It never did — see §8. This is the single largest behavioural fix in the release |
| **Support bench charge restored** | Now a role trait rather than a passive, and protected — see §4 |
| **Rend no longer wears off** | Only a cleanse removes it |
| **Damp weakened** | −10 → −5 Max DEF per stack |
| **Hellfire Bolt** | 2 → 1 Fire damage |
| **Intimidating** | Now grants advantage **and** +1 damage against full-health enemies |
| **Hex Claws** | 1/6 → 25% |
| **Famine Feast** | +20 ATK and a heart → +40 ATK, no heal |
| **Terrorize** | Grants 3 Fade, up from 2 |
| **Felightning reworked** | Static Shock loses TRUESTRIKE and becomes 300% ATK for 2 damage; all three passives replaced by *Get Away* and *Parting Charge* |
| **Undertow retired** | Both Bubble Troubles now run *Surface Tension* |
| **Overhealing** | Some effects carry a pet past its Max HP; the extra hearts persist and are drawn in gold |
| **Forced switching** | A Special can now drag a benched pet onto the field (Balto) |
| **Double knockout** | A reactive passive can take the last pet on both sides down together. That is a draw, reported as `double_knockout` rather than the turn cap |

### Engine additions

The declarative status system (§5), plus hooks `onTurnStart`, `onAttackMiss`,
`attackScale`, `onEnterField` for opening leads, a `killer` argument on
`onFaint`, and the `ctx` helpers listed in §14. Every one is general: no engine
file names a pet, a Special or a passive.

---

## 16. READING THE BALANCE TABLES

The harness prints two, and **they measure different things**:

- **Solo win rate** — round-robin 1v1. Good for raw stat lines and self-contained
  kits. Structurally blind to anything that reads the bench.
- **5v5 roster win rate** — how often the side fielding a pet wins a random 5v5.
  This is the one that counts for Support, Healer, and anything with a
  bench-facing or death-triggered effect.

The gap between them is the point. At level 5, Mosstiff reads 22.8% solo and
44.7% in a roster; Felightning 7.9% and 34.9%. Neither is a 22-point buff — a
duel simply cannot exercise an ally-healing Special or bench charge. **Never
retune a Support or Healer off the solo table.**

Conversely, Necrodoodle reads 59.6% solo and 48.3% in a roster: a strong duellist
that contributes less to a team.

### Open questions at v3.1

Flagged rather than silently fixed, because they are design calls:

1. **Scruffy leads both tables** (72.8% solo, 69.0% roster — eight points clear
   of second). Making Rend permanent and halving Damp were nerfs to everything
   *except* the one pet whose Thick Fur ignores both, so tightening debuffs
   buffs Scruffy every time. Watch this whenever a debuff is strengthened.
2. **Bellybummer is last at 33.6%** even in a roster, despite 5 stacks each of
   Disadvantage and Stunt. Both fire only on entry, so a lead Bellybummer spends
   them on one pet and has nothing afterwards. It may want an effect that
   recurs.
3. **Hellhound (Physical) at 71.1% solo.** *Intimidating* now doubles the damage
   of every opening attack against a fresh pet, which is worth more in a duel
   than in a roster (53.9%).
4. **Heat Up is still weak for a 100-charge Special** — "inflict one Burn" is
   roughly 1/6 × 2 damage per following turn. Emboar tests fine because *Flame
   Aura* carries it, but the Special is not a payoff.
5. **Mutual wipeouts run ~1.8% of level-5 matches**, all from *Parting Quills*
   killing the killer when both are the last pet standing. Working as written;
   noted because a draw used to be impossible.
6. **A 5v5 averages ~91 turns.** Inherent to small HP pools and a ~50% hit rate.
   8x playback covers it; the levers if it should be shorter are base damage,
   the hit threshold, or an earlier Stagnation trigger.
