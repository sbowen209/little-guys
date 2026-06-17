# Little Guys: Game Design & Mechanics Document

## 1. Core Concept
"Little Guys" is a companion web app designed to be played alongside a homebrew D&D campaign. Players draft characters, equip companions, and embark on roguelite "runs" through various biomes to gather unique crafting resources and battle scaling enemies.

## 2. The Gameplay Loop
A standard run consists of five distinct phases:

1. **Setup:** Pick a Character, a Biome, and Companions (Pet/Mount).
2. **Entry:** Enter Level 1 of the Biome. Roll a d3 to select the starting Zone (**A**, **B**, or **C**).
3. **The Zone Loop (Encounter Phase):**
   - Roll a d3 for the encounter: **1 (Battle)**, **2 (Gather Resource)**, **3 (Event)**.
   - Resolve the encounter.
   - Roll the d3 again.
   - *Unique Roll:* If the number is different from the previous roll in this zone, trigger that new encounter.
   - *Duplicate Roll:* If you roll a number you have already rolled in this specific zone, you unlock the Movement Phase.
4. **The Movement Phase:**
   - **Choice A:** Roll a d3 to move to a random *unexplored* Zone on the current level.
   - **Choice B:** Roll a d3 to advance to a random Zone on the *next* level up.
   - **Choice C (Retreat):** End the run early voluntarily to keep all gathered resources and return to base.
5. **Resolution:**
   - **Win:** Reach the end of Level 5 and step onto the final goal node for a reward.
   - **Defeat:** Lose all 5 HP in combat. The run ends forcibly, and all resources gathered during this run are lost.

## 3. Map Architecture
- The map is a grid of **5 Rows (Levels)** and **3 Columns (Zones A, B, and C)**.
- There is a Starting Cell at the bottom (Level 0) and an Ending Cell at the top (Level 6).
- Every zone belongs to a specific "Type" based on the Biome (e.g., in the Maiev Swamp, Zone A is Swamp, Zone B is Woods, Zone C is Poison).

## 4. Combat & Stat Mechanics
Combat is designed to be highly lethal and tactical. 
- **Player Health (Persistent):** Hard-capped at **5 HP** for all characters. Health carries over between encounters. If a hero ends a fight with 2 HP, they enter the next fight with 2 HP.
- **Player Attack:** Base attack ranges from 160 to 280.
- **Enemy Health & "Count":** Enemies have very low HP (1 to 8). Enemy UI displays a visual "Count" (a swarm or pack size) based on their current health divided by their specific `hpPerCount` stat. As they lose HP, the visual count of enemies decreases.
- **Enemy Attack:** Extremely high (starts around 80-120 at Level 1 and scales by +20 per map level).
- **Goal:** Defeat the enemy before they land a hit, or use passives to mitigate damage and survive the attrition of the run.

## 5. Roster & Passives
*Characters have alt-costume support depending on the biome.*

* **Gil (Balanced):** HP 5 | ATK 200
  * *Ardenkin:* Advantage on plant rolls (roll twice, take the higher result).
  * *Battle Bloom:* Recover 1 HP at the end of every fight (Max 5 HP).
* **Marinska (Assassin):** HP 5 | ATK 260
  * *First Strike:* Always attacks first.
  * *Evasion:* Chance to dodge incoming attacks.
* **Tornado Werewolf (Brawler):** HP 5 | ATK 280
  * *Cleave:* Deals 2 DMG per enemy if the current enemy count is > 1.
  * *Wind Affinity:* Bonus stats in Elemental Plains biome.
* **Crocagator (Tank):** HP 5 | ATK 160
  * *Thick Scales:* Takes reduced physical damage.
  * *Swamp Native:* Bonus stats in Maiev Swamp biome.
* **Shiva (Mystic):** HP 5 | ATK 220
  * *Looking For Trouble:* Once per map level, force-reroll any exploration that is not a fight.
  * *Chakra Flow:* Restore 1 HP whenever an Event zone is resolved.

## 6. Biomes & Bestiary
### Biome 1: Maiev Swamp
* **Zones:** A: Swamp, B: Woods, C: Poison.
* **Loot:** Earth Motes, Bramble Thorn, Tox Petals.
* **Enemies (Level 1 Base Stats):**
  * *Bog Bug (Zone A - Swamp):* 3 HP | 80 ATK | 1 HP = 1 Count
  * *Mire Mantis (Zone B - Woods):* 2 HP | 120 ATK | 1 HP = 1 Count
  * *Salamandar (Zone C - Poison):* 2 HP | 100 ATK | 1 HP = 1 Count
  * *Mire Man (Zone C - Poison):* 4 HP | 90 ATK | 2 HP = 1 Count
* *Enemy Scaling:* +1 HP and +20 ATK per Map Level.

### Biome 2: The Elemental Plains
* **Zones:** A: Heat, B: Wind, C: Rain.
* **Loot:** Wind Motes, Wheat, Zephyr Bloom.

### Biome 3: The Dongdell Coast
* **Zones:** A: (TBD), B: (TBD), C: (TBD).
* **Loot:** Water Motes, Aqua Squash, Pearl-moss.

## 7. Global Economy & Resources
Resources are deposited into a persistent global stash after a successful run (or a tactical retreat).
* **Currency:** DELC
* **Shared Materials:** Sigil Dust, Monster Parts.
* **Shared Plants:** Crimson Root (Red), Azure Leaf (Blue), Amber Bulb (Gold), Void Spore (Black), Verdant Sprout (Green).

## 8. Companions (Future Scope)
* **Pets:** Provide active combat bonuses (e.g., extra damage, healing).
* **Mounts:** Provide passive run bonuses (e.g., extra inventory slots, scouting ahead).