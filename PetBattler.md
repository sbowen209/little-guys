# PET BATTLER

**Game Design Document v3.4 — Deterministic Autobattler**

This document describes the game *as implemented* in `src/Pets/`. Where v2.0 of
the design differed from what shipped, this version follows the code and calls
out the difference. Section 14 is the contract for adding pets in later versions.

---

## 1. OVERVIEW & VITALS

| | |
|---|---|
| **Genre** | 1v1 turn-based dice autobattler |
| **Player agency** | Entirely pre-combat: roster selection, Nature rolls, level-ups, lineup order, and — in the Gauntlet — how the stable is divided into squads |
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
   - Any pet whose passive reacts to allied charge gains resolve now, via the
     `onAllySpcGain` hook. A share never triggers another share.
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
| **Tank** | — | Advantage on DEF vs Attacker |
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
| **Bubble Shield** | Buff | Max DEF doubled. Pops the moment you take *any* damage, leaving the attacker Damp. **No ability currently grants it** — the mechanism is kept live for a future pet, the way the Healer role predated Mosstiff |
| **Damp** | Debuff | Max DEF reduced by 5 per stack. **Two flavours:** a soaking from a popped Bubble Shield is *permanent*; the stacks Wear Down grinds onto an attacker are *washable* and rinse off the next time that attacker takes damage. The applier chooses via `washable`, and the engine tracks the washable share of the stack count separately |
| **Stunned** | Debuff | Skip your next turn entirely, Special charge included. **Stacks** — a second Stun costs a second turn rather than being swallowed. One stack is spent per turn lost |
| **Shed** | Buff | Max ATK increased by your Max DEF. One stack consumed per attack |
| **Zaptap** | Buff | When an attack damages you, deal 1 back to the attacker. One stack consumed |
| **Advantage** | Buff | Your next attack rolls with Advantage. One stack consumed per attack |
| **Disadvantage** | Debuff | Your next attack rolls with Disadvantage. One stack consumed per attack |
| **Energized** | Buff | Roll your SPC die twice and bank both. One stack consumed per roll |
| **Stunt** | Debuff | You cannot cast your Special, even at a full meter. One stack falls off at the end of your turn |
| **Powerful** | Buff | Your attacks deal at least 2 damage. One stack consumed per attack that **lands** |
| **Bleed** | Debuff | At the start of your turn, roll `1d4` per stack. Each `1` deals 1 damage and clears that stack |
| **Bone Shield** | Buff | +5 Max DEF per stack. One stack is stripped whenever an attack damages you |
| **Poison** | Debuff | At the start of your turn, roll `1d6` per stack. Each `1` deals its captured potency (1, or 2 from *Virulence*). **The stack is not spent** — poison never wears off |
| **Sliced** | Debuff | When an attack damages you, a flat 50% chance to spend a stack and take 1 more damage. Rolled once per incoming attack, and folded into that hit rather than landing as a second one |
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
| Hellhound (Physical) | **Rending Bite** | Attack, **200% ATK** | 1 damage and 3 stacks of Rend |
| Emboar | **Heat Up** | Effect | Inflicts Burn on the opposing pet |
| Terror Terrier | **Terrorize** | Attack, 200% ATK | 1 damage and 3 Stun Counters. Gains 3 stacks of Fade **whether or not the strike lands** |
| Scruffy | **Shed** | Effect | 4 stacks of Shed (Max DEF added to Max ATK for 4 attacks) |
| Necrodoodle | **Doom Curse** | Attack, 200% ATK | 2 damage and 3 stacks of Cursed |
| Gnollbacabra | **Sunder** | Effect | Permanently strips `1d3 × 10` Max ATK. If the target's Max ATK reaches 0 they are destroyed outright |
| Famine Wolf | **Ravenous Bite** | Attack, 200% ATK | 2 damage, then immediately regain 50 charge |
| Felightning | **Static Shock** | Attack, **400% ATK** | 2 damage and inflicts Paralyzed |
| Bubble Trouble (both) | **Bubble Shield** | Effect | 3 stacks of Damp on the opposing pet — 15 Max DEF, permanently |
| Cerberus | **Twin Fangs** *(provisional)* | Attack, 200% ATK | 2 damage and 3 stacks of Advantage |
| Milk Truck | **Milk** | Effect | Washes off every debuff and grants +10 Max ATK permanently |
| Balto | **Sled Charge** *(provisional)* | Attack, 200% ATK | 1 damage, then a benched enemy is dragged onto the field and takes 1 damage too |
| Watthog | **Chain Shock** | Attack, 200% ATK | 1 damage, plus 1 to two different benched enemies |
| Quillbacabra | **Quill Guard** *(provisional)* | Effect | 2 stacks of Zaptap |
| Punchadillo | **Haymaker** *(provisional)* | Attack, 200% ATK | 1 damage and 1 Stun Counter on **every** enemy, bench included — the active one also takes the Stunner role's counter, so it gets 2 |
| Mosstiff | **Verdant Bloom** *(provisional)* | Effect | A random benched ally gains 1 heart, which **can exceed its Max HP** |
| Bellybummer | **Lifesteal** | Attack, **300% ATK** | 1 damage healed back to you, then siphon your whole Max SPC in charge off the target |
| Mega Chicken | **Talon Flurry** *(provisional)* | Attack, 200% ATK | 2 damage and 2 stacks of Bleed |
| Thunder Lion | **Thunderstorm** | Effect | 2 Stun Counters on the opposing pet, and 1 stack of Zaptap for you |
| Bone Boar | **Bone Gore** | Attack, 200% ATK | 2 damage, or 3 against a Tank or Affinity Tank |
| Wild Cat | **Rip and Tear** *(provisional)* | Attack, 200% ATK | 1 damage, Rend, and 1 stack of Bleed |
| Dragon Turtle | **Shell Slam** *(provisional)* | Attack, **200% of Max DEF** | 1 damage and inflicts Burn |
| Decrephin | **Sonic Boom** | Effect | Stuns a random benched enemy outright; with the bench empty it hits the active one |
| Slicer | **Sever** *(provisional)* | Attack, 200% ATK | 2 damage — and if it finishes the target, the next enemy in arrives with 2 stacks of Sliced |
| Electrephant | **Static Charge** *(provisional)* | Effect | 1 stack of Zaptap and +5 Max ATK permanently |
| Swamp Fennec | **Toxic Spray** *(provisional)* | Effect | 1 Poison on the opposing pet and on a random benched enemy; with the bench empty the active one takes both |

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
| Hellhound (Affinity) | **Hellfire** — successful attacks have a 1/6 chance to inflict Burn | **Hell Flames** — Burns this pet applies deal 1 extra damage |
| Hellhound (Physical) | **Intimidating** — advantage **and +1 damage** against enemies at full health | **Relentless** — advantage against enemies at 2 hearts or fewer |
| Emboar | **Flame Aura** — 25% chance to Burn anyone who damages you with an attack | **Afterburn** — Burn the opposing pet when you are knocked out |
| Terror Terrier | **Ghostly Blur** — gain 1 Fade after taking damage | **Capitalize** — when you Stun someone they take 1 damage and lose 50 charge |
| Scruffy | **Thick Fur** — immune to debuffs | **Scruffy** — advantage on DEF at 3 hearts or fewer |
| Necrodoodle | **Hex Claws** — successful attacks have a 25% chance to inflict Cursed | **Vengeful Curse** — 25% chance to Curse anyone who damages you |
| Gnollbacabra | **Crippling Bite** — after damaging a target, their next attack rolls at −`1d6 × 10` Max ATK | **Bonecrusher** — anyone who damages you loses `1d2 × 10` Max DEF until their next turn |
| Famine Wolf | **Crunch** — 25% chance to deal 1 extra damage | **Famine Feast** — after a knockout, gain +40 Max ATK permanently |
| Felightning | **Get Away** — when knocked out, Paralyze a random benched enemy | **Parting Charge** *(prov.)* — when knocked out, the next ally in arrives with a full 100 charge |
| Bubble Trouble (both) | **Lovey Dovey** — Max SPC is 50% larger while your bonded partner is on the team | **Surface Tension** — +20 Max ATK once your bonded partner has been defeated |
| Cerberus | **Twin Bite** — after an attack is blocked, gain 1 Advantage | **Press the Advantage** *(prov.)* — attacking with net Advantage, 50% chance of +1 damage |
| Milk Truck | **Milk Shake** — gain 1 Energized when damaged | **Second Stomach** *(prov.)* — 1-in-8 chance to recover 1 heart at the start of your turn |
| Balto | **First Light** *(prov.)* — **double Max ATK** and advantage on any roll during either pet's first turn on the field | **Fresh Legs** *(prov.)* — gain 1 Powerful when you start the match or enter from the bench |
| Watthog | **Chain Lightning** — dealing damage has a 1/6 chance to arc 1 damage to a benched enemy | **Supercharge** — gain 15 charge whenever you are damaged |
| Quillbacabra | **Bristleback** *(prov.)* — 25% chance to deal 1 back when damaged | **Parting Quills** *(prov.)* — when knocked out, the killer takes 1 damage plus 1 per Zaptap stack you held |
| Punchadillo | **Concussive Blast** *(prov.)* — landing a third Stun Counter on the active enemy gives every benched enemy 1 Stun Counter | **Rolling Guard** *(prov.)* — landing a third Stun Counter grants 2 Fade |
| Mosstiff | **Photosynthesis** *(prov.)* — 25% chance to gain a Heart Counter at the start of your turn, without attacking | **Last Bloom** *(prov.)* — when knocked out, the next ally to enter gains 1 heart, which can exceed its Max HP |
| Bellybummer | **Spooked** — when you take the field, the opposing pet gains 10 Disadvantage | **Stage Fright** *(prov.)* — when you take the field, the opposing pet **and one benched enemy** each gain 99 Stunt |
| Mega Chicken | **Raking Spurs** *(prov.)* — successful attacks have a 50% chance to inflict Bleed | **Death Throes** *(prov.)* — when knocked out, the opposing pet gains 1 Rend |
| Thunder Lion | **Electrofang** — successful attacks have a 1/6 chance to Paralyze | **Electrocyclone** — 1/6 chance to gain 1 Zaptap when damaged |
| Bone Boar | **Bone Harvest** *(prov.)* — gain 1 Bone Shield when you deal damage | **Ossuary Guard** *(prov.)* — take the field with 3 Bone Shield already up |
| Wild Cat | **Ambush Instinct** *(prov.)* — advantage against enemies whose Special meter is at least half full | **Scent of Blood** *(prov.)* — +5 Max ATK per pet already defeated on the enemy team |
| Dragon Turtle | **Wear Down** — an attack that fails against you leaves the attacker *washable* Damp | **Impenetrable** — Attacker-role units roll at 10 less Max ATK against you |
| Decrephin | **Dolphangs** — at 2 hearts or fewer, every successful attack inflicts Bleed | **Last Bite** *(prov.)* — when knocked out, the opposing pet takes 2 stacks of Stunned |
| Slicer | **Wristblades** — successful attacks have a 25% chance to inflict 1 Sliced | **Open Wounds** *(prov.)* — advantage against an enemy already carrying Sliced |
| Electrephant | **First Impression** *(prov.)* — the first hit on any given enemy adds 2 extra Stun Counters, three with the role's own | **Overcharge** *(prov.)* — gain 3 Energized whenever you Stun someone |
| Swamp Fennec | **Toxic Terrain** *(Legendary)* + **Venom Blood** *(prov.)* — the arena turns toxic on entry; immune to Poison, 25% to Poison the foe when damaged | **Septic Burst** *(prov.)* — when knocked out, strip every Poison stack off the opposing pet and deal 1 damage each |

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
| **Lovey** | Bubble Trouble (Physical) | 2 | +1 / +1 / +3 | HP 7 · d22 / d51 / d33 |
| **Dovey** | Bubble Trouble (Affinity) | 2 | −3 / −7 / −8 | HP 7 · d20 / d43 / d22 |
| **Fish Sticks** | Decrephin | 2 | −4 / −6 / −2 | HP 4 · d46 / d22 / d28 |
| **Celery** | Slicer | 3 | +16 / −4 / −4 | HP 5 · d64 / d28 / d26 |
| **Peanut** | Electrephant | 2 | −4 / −3 / +3 | HP 7 · d23 / d42 / d28 |
| **Syrup** | Swamp Fennec | 1 | 0 / 0 / 0 | HP 4 · d20 / d30 / d50 |

Collectively these eight are the **stable** — the pets the player owns, and the
exact pool the Gauntlet divides into squads. `STABLE_IDS` is derived from the
preset registry, so adding a preset adds it to the stable.

> **Note:** Fuzzy's card gives DEF as `d40`, but its own annotations on the same
> card read *30 base + 8 Nature + 4 Level* = 42, which is what ships. Flagged
> rather than silently picked, because only one of the two can be right.

---

## 11. TEAM BUILDING

- **12 saved rosters**, persisted to `localStorage` under `gpb_saved_teams`.
- Drafting rolls fresh Natures; each drafted pet is a distinct instance.
- Lineup order is set by dragging roster slots. Slot 1 is flagged **LEAD**.
- Saves are **migrated on load**. Entries referencing a species that no longer
  exists are dropped rather than crashing the builder, and the pre-refactor
  `dataId` field is still accepted. This is what makes it safe to rename or
  retire artwork in a later version.

### ACE

A toggle on the library card. A pet drafted as an **Ace** rolls every one of its
three Natures positive. The magnitude still comes from the same `d20` ladder —
the roll is folded into the 11–20 half rather than re-rolled — so an Ace's spread
of outcomes is exactly the top half of a normal pet's, not a different curve.

Ace does not apply to presets: their stat lines are authored, so there is nothing
to roll. On a drafted pet the Ace button re-rolls the Natures immediately, which
makes it a toggle you can flip either way rather than a one-shot at draft time.

### A pet is stored as its parts

`stats` used to be the only record of a pet, so a level-up was irreversible and a
bad Nature meant deleting the pet and drafting a new one. An instance now keeps
`natures`, an itemised `levelGains` list (the exact `1d4` each level granted) and
a `manual` delta from Manual Balance. `deriveStats()` rebuilds the dice from
those parts, which is what makes **level down** and **re-roll Natures** exact
rather than approximate.

Saves written before this have only a final stat line. Rather than guess which
bumps came from levels and which from Manual Balance, migration books the whole
surplus over the basis as `manual`: the dice come out identical, and every edit
from then on is reversible.

---

## 11b. THE STABLE GAUNTLET

A hot-seat series and the only mode where the player's own stable is the roster.

**Nobody is generated.** Player 1 divides the stable into squads; player 2
answers by picking the same number of saved rosters. An earlier build generated
the opposition, which meant the interesting half of the matchup was written by a
random number generator — now both sides are somebody's choices, and there is no
opponent AI to tune or to argue with.

- Pick **1, 2 or 3** squads a side. The stable is divided into that many,
  **with no pet in two squads**. Pets may be left out entirely.
- Player 2 then picks that many saved rosters, **in order** — their first pick
  faces Squad 1, and the fixture list is shown before anyone commits.
- **Lineup order inside a squad is editable.** Squads are stored as ordered lists
  of ids rather than a pet-to-squad map, precisely so the order is state the
  player owns; arrows on each row move a pet up or down, and slot 1 is the Lead.
  It used to be an accident of the order you happened to click in. The decider
  draft has the same controls, since pick order sets that lineup too.
- **1 squad** — a single match settles it.
- **2 squads** — two matches. A **1-1 split forces a decider**: each side drafts
  a third squad from the pets across *its own two squads*, player 1 first and
  player 2 blind to that pick. The pets you spread thin over the first two rounds
  are exactly the ones you get to concentrate for the last.
- **3 squads** — best of three; a 2-0 sweep ends it without a third match.
- A drawn match counts for neither side and the series plays on.

The rules are pure and live in `engine/gauntlet.js` as a small state machine:
`nextStep(series)` returns `match`, `decider` or `done`, and the UI advances it
by handing back results. Nothing about it touches the simulator.

### Why the module routes itself

A series is several matches with two drafts in the middle, and `App.jsx` had
nowhere to keep that across a trip into the arena. `Pets/PetBattler.jsx` now owns
the module's routing — menu, builder, gauntlet, arena, history — and App renders
that one component. It also owns the saved rosters, so the gauntlet's rival
picker sees a roster the moment the builder saves it rather than a copy loaded at
mount.

---

## 11c. MATCH HISTORY

Finished duels and series are written to `localStorage` under
`gpb_match_history`, newest first, capped at 40 entries.

**Only what the ledger draws is stored** — names, art paths, levels and the
outcome. A 5v5 timeline is ~560 events each carrying a full state snapshot, so
keeping even a handful would blow the storage quota. The **seed is kept**, which
is enough to reproduce any match exactly.

A match is recorded when its playback *finishes*, not when it is simulated, so
the ledger reflects what the player actually watched. In a series the result is
parked until Continue is pressed — writing it the instant playback ended would
advance the series and unmount the arena before the end card could be read.

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
- **The kit card sits in the top outer corner** — role, both typings, and the
  pet's passives, with a hover card carrying each passive's full text. It lives
  up there, in the fighting-game position, because *none of it changes during a
  match*: the flank carries what is changing, the outboard rail carries the live
  dice, and this carries what you learn once and then want to re-check without
  pausing. The offensive typing is deliberately dimmed on every role except the
  Affinity Attacker, because that is the only role that reads the chart on
  offence — showing it bright on a Tank would imply a rule that does not exist.

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

### Projectiles

Attacks that fly are **element-driven, not ability-driven**. A single registry
(`ui/projectiles.js`) maps an attacker and its action to a projectile spec, and
one resolver (`projectileFor`) decides on every beat whether the strike flies or
lands as a jumping melee blow. The rule of thumb:

- **Affinity Attackers throw their element on every attack**, standard or
  Special — slinging fire, water, air or shadow is the whole role, so it never
  switches off between big moves. A Hellhound bites embers; a Necrodoodle lobs
  hexes; Watthog and the electric pets crack the same lightning bolt.
- **Physical Tanks and brawlers stay melee** — they close the distance and hit.
  A projectile on a bulwark pet reads wrong, so they lunge instead.
- **Per-species and per-ability overrides win** over the role default. That is
  how both Bubble Troubles lob bubbles (blue for the Affinity half, pink for the
  Physical / Lovey half) even though one of them is a Tank, and how a one-off
  ranged Special on an otherwise-melee pet still flies.

The spec is pure presentation: an element tint, a `core` gradient for the body,
a `motion` (flat dart, lobbed arc, slow bob, or tumbling spin), an optional
`trail`, and a `count`/`spread` for flurries and sprays. The muzzle flash at the
shooter and the impact burst are both recoloured from the same spec, so the shot
and the hit read as one element. Nothing in the registry touches the engine —
the projectile decision is entirely a matter of how a resolved attack is drawn.

### Motion policy

Glows and flashes are reserved for impact: landing a hit, taking one, casting a
Special, going down. Routine beats — charge ticks, status checks — get no sprite
treatment at all, because a pet that lights up several times a turn reads as
strobing rather than as emphasis. Neither pet is ever dimmed for not being the
active one. Projectile flights honour `prefers-reduced-motion`, collapsing to a
quick fade in place rather than streaking across the arena.

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
├── PetBattler.jsx   the module's own router: menu, gauntlet, arena, history
├── data/            Pure data. No logic, no React.
│   ├── constants.js   roles, elements, affinity chart, matchup tables, RULES
│   ├── statuses.js    status registry
│   ├── fields.js      arena-wide condition registry
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
│   ├── gauntlet.js    the series state machine + opponent generation
│   └── balance.mjs    headless fuzz + win-rate harness
├── hooks/
│   ├── useBattlePlayback.js   rAF transport over a finished timeline
│   ├── useMatchHistory.js     the battle ledger
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

Flags a passive can carry: `debuffImmune`, `statusImmune` (a specific list, for
*Venom Blood*), and `legendary` (always online, and labelled as such in the
builder). `self.memo` is per-combatant scratch space for a passive that has to
remember something across turns — *First Impression* keeps the set of enemies it
has already met there, so the engine never grows a field for one pet's
bookkeeping.

`ctx` additionally offers `activeFoeOf`, `alliesOf`, `foesOf`, `benchedFoesOf`,
`benchedAlliesOf`, `addHeartCounters`, `clearDebuffs`, `forceSwitch`,
`queueSwitchInBonus` (which now also carries a `status`), `establishField`, and
`heal(pet, n, { overheal })`.

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
every species, a **5v5 roster contribution table**, and **47 rule assertions**.
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

## 15. CHANGES IN v3.4

A balance pass from the Edits sheet of the pet workbook, plus the role change
that pass was written around.

### Neither Tank walls a Stunner

`DEFENSE_ROLE_ADVANTAGE[TANK]` drops `STUNNER`. A Tank used to roll defensive
advantage against Attackers **and** Stunners — 14 of 28 species — while an
Affinity Tank answered 5. That made the two look like different *qualities* of
role rather than different flavours of one, and it was the single largest reason
Bubble Trouble (Affinity) sat 4 points below its twin. Each Tank now walls
exactly the attacker it was built for, and Stunners get to do their job to
everybody. Guarded by *"No Tank rolls DEF advantage against a Stunner"*.

### Bubble Trouble, reworked end to end

The pair tested as a **trap** in the v3.3 balance report: fielding both was worse
than fielding either alone, because the bond bought more Bubble Shields and
Bubble Shield was pure defence on a pet with a d23 attack. All three pieces
changed.

| | Was | Now |
|---|---|---|
| **Lovey Dovey** | Gain 50% of any charge a bonded ally generates | **Max SPC is 50% larger while your bonded partner is on the team** |
| **Bubble Shield** | Doubles your Max DEF until you take damage | **3 stacks of Damp on the opposing pet** — 15 Max DEF, permanently |
| **Surface Tension** | Recover 25 charge when your shield pops | **+20 Max ATK once your bonded partner has been defeated** |

Lovey Dovey is now a **pure field** on the passive (`maxSpcScale`) rather than a
hook, so `combatant.js` folds it into a derived Max SPC that the charge roll, the
initiative roll and the HUD all read from. That is also why each combatant now
carries a `team` handle: it is what lets a passive read its roster from a pure
function without dragging `ctx` into the derived-stat pipeline.

**Bubble Shield the *status* is now unreferenced.** The engine support stays —
it is general, and the Healer role sat unused for a whole release before Mosstiff
arrived.

### Everything else from the Edits sheet

| Pet | Change |
|---|---|
| **Scruffy** | HP **7 → 5** · Shed 5 → **4** attacks · Lv.5 advantage at **3** hearts, up from 2 |
| **Hellhound (Physical)** | Rending Bite 2 → **1** damage |
| **Milk Truck** | Second Stomach 1/6 → **1/8** |
| **Bellybummer** | Spooked 5 → **10** Disadvantage · Stage Fright also hits **a benched enemy** · Lifesteal siphons **Max SPC flat** instead of a roll of it |
| **Felightning** | Parting Charge → the next ally in arrives with a **full 100** charge |
| **Swamp Fennec** | Toxic Spray hits **the active pet and a benched one** · Lv.5 Virulence replaced by **Septic Burst** — on death, strip every Poison stack off the opposing pet and deal 1 damage each |
| **Decrephin** | Lv.5 **Last Bite** — on death, 2 stacks of Stunned on the opposing pet |
| **Electrephant** | Lv.5 **Overcharge** — 3 Energized whenever you Stun someone |

Virulence was the only user of `tickPotency`. The hook and its assertion stay,
because the machinery is live and the next pet to want it should not have to
rediscover whether it works.

### What it did to the spread

Scruffy **69.9% → 61.4%** and now leads by 2 points instead of 11. The whole
roster compressed from a 30-point spread to 21. Stunners were the big winners of
the role change — Electrephant 47.9 → 54.5, Terror Terrier 52.8 → 56.9,
Punchadillo 49.5 → 52.8 — and the bottom of the table changed hands: the pets
that now need attention are **Gnollbacabra (40.1)** and **Felightning (40.2)**,
both 4 HP and both exactly what a newly unwalled Stunner farms.

### Two new assertions

*No Tank rolls DEF advantage against a Stunner* (checked against real rolls, not
just the table) and *Lovey Dovey grows Max SPC only with the partner present*.
**47 total.**

---

## 15a. CHANGES IN v3.3

### Fourth wave

Four more pets — **Decrephin**, **Slicer**, **Electrephant** and **Swamp
Fennec** — for **28 species**, and four more stable presets (Fish Sticks,
Celery, Peanut, Syrup) for **8**. They brought two statuses (Poison, Sliced),
the game's first **field effect** and its first **Legendary** passive.

Every one of their cards left the Level 5 passive written as `xxx`. Slicer and
Swamp Fennec have since been given one — *Open Wounds* and *Virulence*, both
marked provisional and both built on what their Lv.1 already does. **Decrephin
and Electrephant still gain nothing at Lv.5**; those slots are unwritten, not
lost.

Swamp Fennec is the only pet with **two passives online at Level 1**: a
Legendary is always active, so Toxic Terrain and Venom Blood both run from the
opening bell and Virulence joins them at 5.

### Field effects

A condition that belongs to the arena rather than to a pet: established by a
passive through `ctx.establishField(id)`, never cleansed, unaffected by the
setter leaving or dying, and applying to both sides. `data/fields.js` is the
registry and the engine walks it generically — as with statuses and passives, no
engine file names a field. *Toxic Terrain* is the first.

### The fatal-blow fix

**Reactions to being damaged now fire even when the blow was fatal.** Previously
`dealDamage` ran the whole on-damage phase in an `else` branch, so a killing hit
skipped it entirely: Zaptap did not answer the pet that killed it, Flame Aura did
not burn the killer, Bonecrusher did not crack their shell. The last hit of a
fight is the one that most needs to be paid for, and it was the only one that
never was. Guarded by *"Zaptap answers a killing blow"*.

The target is marked down *before* the reactions run, so anything a dying pet
would apply to itself quietly no-ops while everything it aims outward lands. The
attacker's `onKO` fires last, so a killer that got itself killed on the way in
does not also collect the bounty.

Two knockouts also stopped being credited at all: `Capitalize` and `Sunder` passed
`source` where `dealDamage` reads `attacker`, so a kill by either left `killedBy`
null — *Famine Feast* and *Parting Quills* never saw it.

### Rules brought back in line with the cards

| Change | Detail |
|---|---|
| **Damp has two flavours** | A popped Bubble Shield's soaking is permanent; Wear Down's stacks wash off when the attacker is hit. The cards disagreed on purpose |
| **Stun stacks** | A second Stun costs a second turn instead of being swallowed |
| **Static Shock** | 300% → **400%** Max ATK |
| **Lifesteal** | 200% → **300%** Max ATK |
| **Thunderstorm** | Now an Effect: 2 Stun Counters and 1 Zaptap, rather than a 200% attack |
| **Quill Guard** | 3 → **2** stacks of Zaptap |
| **Ossuary Guard** | 2 → **3** stacks of Bone Shield |
| **Impenetrable** | −15 → **−10** Max ATK |
| **Stage Fright** | 5 → **99** Stunt — the Special is locked for the match |
| **Capitalize** | Charge wiped → **−50** charge |
| **Second Stomach** | 1-in-10 → **1-in-6** |
| **Electrocyclone** | 25% → **1/6** |
| **Hellfire, Hex Claws** | Fire on any successful attack, not only standard ones |
| **Stat lines resynced** | Scruffy SPC d25→d20 · Felightning HP 3→4 · Bubble Trouble HP 8→7, Lovey and Dovey with it · Mosstiff HP 5→6 · Bellybummer ATK d30→d40 · Dragon Turtle HP 8→7 and DEF d50→d40 |

**Cursed was checked and left alone.** The card reads as though a stack is spent
when the null procs; the intent is that stacks are *duration* — three turns at a
flat 50% each, success or failure — which is what already shipped.

### Potency, generalised

Burn has always captured its damage from whoever applied it, so a Hell Flames
burn stays lethal on a pet that has changed hands. That is now true of **every**
ticking status through the `tickPotency` hook — which is what lets *Virulence*
make the Fennec's own Poison bite for 2 without making the Toxic Terrain it laid
down any nastier.

### Reading a status check

All six rolled checks — Burn, Bleed, Poison, Sliced, Paralyzed, Cursed — share
one card, and the wording is derived rather than written per status, so a new
ticking status gets a correct card for free:

- **the headline** is `−2` / `safe` for damage, `seized` / `clear` for Paralyzed,
  `nulled` / `holds` for Cursed;
- **the rule line** always reads *"1 or less on d6"*, plus *"· 2 each"* when the
  stack was applied at raised potency;
- **the stake line** says what the check cost — *"1 stack spent"*, or
  **"stacks stay"** for Poison, which is the one rule the dice cannot show and
  the thing a player staring at four poison bars most needs to know.

### Modes

The **Stable Gauntlet** (§11b) and **Match History** (§11c), plus an **Ace**
draft option and a reversible level/Nature editor in the builder (§11).

### Nine new assertions

Zaptap answering a killing blow · on-damage passives running on a fatal hit ·
Wear Down's Damp washing off · a Bubble Shield soaking staying · Poison never
being spent by ticking · a ticking status biting for the potency it was applied
with · Sliced spending exactly one stack · a field outliving the pet that set it ·
Stunned stacking · First Impression firing once per enemy.
**45 assertions total.**

---

## 15b. CHANGES IN v3.2

### Third wave

Four more pets: **Thunder Lion** *(provisional name)*, **Bone Boar**,
**Wild Cat** and **Dragon Turtle** — **24 species** at the time. They brought one new
status (Bone Shield), a Special that rolls off Max DEF, and the hooks
`attackFlatMod`, `foeAttackMod` and `onBlocked`.

> **Naming conflict, unresolved.** Thunder Lion's card was headed "Balto", but
> that name already belongs to the Earth Attacker added in v3.1 and that card
> was unchanged in the same spreadsheet. Two pets cannot share a name, so the
> lion ships as `thunder_lion` under a provisional name. Ids are permanent, so
> renaming the display name later is free; the id is not.

---

## 15c. CHANGES IN v3.1

### The roster doubled

Nine pets joined: **Cerberus, Milk Truck, Balto, Watthog, Quillbacabra,
Punchadillo, Mosstiff, Bellybummer** and **Mega Chicken** — 20 species at the time.
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

### Open questions at v3.4

Flagged rather than silently fixed, because they are design calls. Rewritten for
v3.4 — items 1 and 2 of the old list are now closed.

1. **Gnollbacabra (40.1%) and Felightning (40.2%) are the new bottom.** Both are
   4 HP, and both got relatively worse when Stunners stopped being walled by
   Tanks. Neither was touched by this pass; they are simply what a freed-up
   Stunner farms.
2. **Bubble Trouble (Affinity) is still the weaker twin.** The role change closed
   most of the structural gap and the rework gave the pair a win condition, but a
   d20 attack is a low ceiling. Worth re-measuring before touching it again.
3. **Scruffy is fixed but still first** (61.4%, +2 on second). The Thick Fur
   interaction has not gone away: it is still the one pet that ignores every new
   debuff, so **watch it whenever a debuff is strengthened.**
4. **Heat Up is still weak for a 100-charge Special** — "inflict one Burn" is
   roughly 1/6 × 2 damage per following turn. Emboar tests fine because *Flame
   Aura* carries it, but the Special is not a payoff.
5. **Mutual wipeouts run ~1.8% of level-5 matches**, all from *Parting Quills*
   killing the killer when both are the last pet standing. Working as written;
   noted because a draw used to be impossible.
6. **A 5v5 averages ~91 turns.** Inherent to small HP pools and a ~50% hit rate.
   8x playback covers it; the levers if it should be shorter are base damage,
   the hit threshold, or an earlier Stagnation trigger.
