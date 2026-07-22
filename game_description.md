# Little Guys: Game Design & Mechanics Document — v0.4

## 1. Core Concept
"Little Guys" is a companion web app played alongside a homebrew D&D campaign. Players draft a hero, pick a biome, and embark on roguelite "runs" through scaling zones to gather crafting resources and battle enemies. The app handles all randomness, stat math, meta-progression saving (`useMetaProgress.js`), and run state so the table can focus on play.

## 2. The Gameplay Loop
A run has five phases:

1. **Setup:** Pick a Hero and a Biome.
2. **Entry:** Enter Level 1. Roll a d3 to select the starting Zone (A/B/C).
3. **Encounter Phase (the Zone Loop):**
   - Roll a d3: **1 = Battle**, **2 = Gather**, **3 = Event**.
   - Resolve the encounter. 
   - Roll the d3 again within the same zone.
   - **Unique roll** (different from any prior roll in this zone): trigger that encounter.
   - **Duplicate roll** (a number already rolled in this zone): the zone is "cleared" → unlock the Movement Phase.
4. **Movement Phase — exactly three choices (NO manual zone picking):**
   - **A) Explore Current Level:** advance to a *random unexplored zone on the current level*.
   - **B) Ascend:** advance to a *random unexplored zone on the next level up*.
   - **C) Retreat:** end the run voluntarily, banking all gathered resources.
   - The destination zone is **chosen by the system at random**.
5. **Resolution:**
   - **Win:** Reach and step onto the Level 6 goal node → Dedicated reward screen explicitly highlighting the overall haul and special prizes.
   - **Retreat:** Voluntarily leave → Dedicated retreat screen explicitly highlighting secured resources.
   - **Defeat:** Lose all 5 HP in combat → Run ends forcibly, gathered resources are lost, return to Main Menu.

## 3. Map Architecture & Zone Affixes
- Grid: **5 Levels (rows) × 3 Zones (cols: A/B/C)**, plus Start (Level 0) and Goal (Level 6).
- Each zone has a biome-specific Type (e.g. Maiev Swamp → A: Swamp, B: Woods, C: Poison).
- **Zone Affixes:** Zones can randomly spawn with an affix to alter risk/reward dynamics:
  - **Peaceful:** Combat encounters are replaced by Events or Gather nodes, or enemy stats are significantly reduced.
  - **Dangerous:** Enemy ATK/HP is buffed, but drop quantities are increased.
  - **Fruitful:** Gather nodes yield double the standard base quantity.

## 4. Combat & Stat Mechanics
Lethal and tactical.
- **Player Health (persistent, hard cap 5 HP):** carries between encounters. Visual hearts system.
- **Player Attack:** 160–280 base.
- **Enemy Health & Count:** Visual "Count" = `ceil(currentHP / hpPerCount)`; the pack visually shrinks as HP drops.
  - **Explicit HP Display:** Alongside the visual count, the total exact Enemy HP is displayed numerically to aid player strategy.
- **Enemy Attack:** high (≈80–120 at L1), scales **+20 ATK per level**.
- **Resolution per exchange:** `roll = random() × ATK` for each side. Higher roll wins the exchange and deals **1 HP**. The losing margin is the **surplus** (`winnerRoll − loserRoll`), used by some passives.
- **Combat Pacing:** Battle animations and log updates are spaced out to allow the user to read and process the clash, the numerical rolls, and the resulting damage/passive triggers before the next action becomes available.

## 5. Roster, Passives & Companions
Each hero has a small, well-defined passive set implemented via the Passive Engine. 

| Hero | Affinity | HP | ATK | Passives |
|------|----------|----|-----|----------|
| **Gil** | Shadow + Earth | 5 | 200 | Ardenkin (Double slider on flowers), Battle Bloom |
| **Marinska** | Shadow + Air | 5 | 260 | Take Flight |
| **Tornado Werewolf** | Wind | 5 | 280 | Sweeping Wind |
| **Crocagator** | Water | 5 | 160 | Thickhide |
| **Shiva** | Earth | 5 | 220 | Looking for Trouble |

**Passive Mechanics Updates:**
- **Marinska (Take Flight):** When her passive triggers to save her from defeat, combat immediately ends. She then transitions into a new exploration roll, and the combat encounter for that specific zone is reset.
- **Shiva (Looking for Trouble):** Triggers a maximum of once per level. If her exploration roll lands on anything other than a Battle, she unleashes a "Lion's Roar" and forces a reroll. **Exception:** This passive *does not trigger* if she has already fought a battle in that specific zone.

## 6. Passive Engine (Scalable Architecture)
Passives are **declarative and event-driven**. The engine dispatches events; each hook receives a `ctx` it may mutate and returns it.

## 7. Biomes & Bestiary
### Biome 1: Maiev Swamp (playable)
- Zones — A: Swamp, B: Woods, C: Poison.
- Enemies (L1 base; +1 HP & +20 ATK per level):
  - Bog Bug (A): 3 HP | 80 ATK | hpPerCount 1
  - Mire Mantis (B): 2 HP | 120 ATK | hpPerCount 1
  - Salamandar (C): 2 HP | 100 ATK | hpPerCount 1
  - Mire Man (C): 4 HP | 90 ATK | hpPerCount 2

## 8. Gather Rules & Scaled Economy
The gather phase utilizes a multi-step resolution process rather than a single static drop.

**Gather Stage Mechanics:**
1.  **Reward Reveal Roll:** The first roll determines the *category* of the reward based on the current level's drop table.
2.  **Quantity Slider:** After the reward category is revealed, a dynamic slider (similar to the combat attack bar) appears to determine the exact quantity yielded from that item's specific range.
3.  **Gil's Advantage:** When gathering Plants, Gil receives *two* quantity sliders and automatically keeps the higher result.

**Per-Level Gather Tables:**
* **Level 1:** 60% Plants | 20% Animal Feed | 20% Fish
* **Level 2:** 60% Plants | 20% Animal Feed | 20% Fish
* **Level 3:** 60% Plants | 20% Animal Feed | 20% DELC
* **Level 4:** 60% Plants | 20% Sigil Dust | 20% DELC
* **Level 5:** 20% Plants | 60% Sigil Dust | 20% Sigil

## 9. End-of-Run Prizes (The Maiev Swamp)
Upon successfully completing Level 5 and ascending to the Level 6 goal node in the Maiev Swamp, the player claims a grand prize rolled from the following distribution:
* **50%:** Pet (Drawn from the existing Swamp bestiary table)
* **25%:** Rune
* **10%:** Grass Eevee
* **10%:** Swamp Mount
* **5%:** Blessed Item *(Represented strictly by a Chest Icon; no secondary Blessed Item table generation is created)*

## 10. UI / UX Requirements
- **Hero Select:** Height-locked; columns shrink, portrait uses `object-contain`.
- **Portrait aura:** Dynamic gradients/pulses based on dual- and mono-affinity heroes.
- **Exploration Wheel:** Visual rotation directly matches the resolved d3 logic.
- **Combat View:**
  - Active visual sliders demonstrating the ATK rolls.
  - Pacing adjustments to allow events and logs to linger on screen.
  - Explicit numeric Enemy HP indicator.
- **End of Run Screens:** Victory and Retreat screens must feature a prominent, aggregated "Run Haul" section displaying exactly what resources are being added to the meta-progression bank, alongside any special unlocks.

## 11. Architecture Notes
- `useMetaProgress` — Owns localStorage persistence for run history, bestiary collection, and banked resources.
- `useRunState` — Owns HP, inventory, position, zone loop, movement, resolution, per-run passive flags.
- `useCombat` — Owns one fight; reports `{ victory, remainingHp, loot }`.
- Passive Engine — `data/passives.js` + `lib/passiveEngine.js`.