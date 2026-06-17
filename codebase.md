This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
.gitignore
eslint.config.js
game_description.md
index.html
package.json
public/favicon.svg
public/icons.svg
public/images/characters/Crocagator.png
public/images/characters/Gil_Coast.png
public/images/characters/Gil_Plains.png
public/images/characters/Gil.png
public/images/characters/Marinska.png
public/images/characters/shiva.png
public/images/characters/Tornadowerewolf.png
public/images/enemies/BogBug.png
public/images/enemies/MireMan.png
public/images/enemies/MireMantis.png
public/images/enemies/Salamandar.png
public/images/maps/biomes/Swamp1A.png
public/images/maps/biomes/Swamp1B.png
public/images/maps/biomes/Swamp1C.png
public/images/resources/Flower_Black.png
public/images/resources/Flower_Blue.png
public/images/resources/Flower_Gold.png
public/images/resources/Flower_Green.png
public/images/resources/Flower_Red.png
README.md
src/App.css
src/App.jsx
src/assets/hero.png
src/assets/react.svg
src/assets/vite.svg
src/data/biomes.js
src/data/characters.js
src/data/companions.js
src/data/enemies.js
src/data/items.js
src/index.css
src/main.jsx
src/views/MainMenu.jsx
vite.config.js
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="game_description.md">
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
</file>

<file path=".gitignore">
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
</file>

<file path="eslint.config.js">
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
</file>

<file path="index.html">
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>little-guys</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
</file>

<file path="public/favicon.svg">
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"/><mask id="a" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z" style="fill:#000;fill-opacity:1"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -32.644 -3.334)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -34.34 30.47)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(39.51 .387 8.972)"/></g><g filter="url(#k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 47.523 -6.092)"/></g><g filter="url(#l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 41.412 6.333)"/></g><g filter="url(#m)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#n)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#o)"><ellipse cx="35.651" cy="29.907" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 35.651 29.907)"/></g><g filter="url(#p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 38.418 32.4)"/></g></g><defs><filter id="b" width="60.045" height="41.654" x="-19.77" y="16.149" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-54.613" y="-7.533" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-49.64" y="2.03" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-45.045" y="20.029" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-43.513" y="21.178" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="15.756" y="-17.901" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-27.636" y="-22.853" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="20.116" y="-38.415" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="24.641" y="-11.323" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="8.244" y="-2.416" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="18.713" y="10.588" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter></defs></svg>
</file>

<file path="public/icons.svg">
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="bluesky-icon" viewBox="0 0 16 17">
    <g clip-path="url(#bluesky-clip)"><path fill="#08060d" d="M7.75 7.735c-.693-1.348-2.58-3.86-4.334-5.097-1.68-1.187-2.32-.981-2.74-.79C.188 2.065.1 2.812.1 3.251s.241 3.602.398 4.13c.52 1.744 2.367 2.333 4.07 2.145-2.495.37-4.71 1.278-1.805 4.512 3.196 3.309 4.38-.71 4.987-2.746.608 2.036 1.307 5.91 4.93 2.746 2.72-2.746.747-4.143-1.747-4.512 1.702.189 3.55-.4 4.07-2.145.156-.528.397-3.691.397-4.13s-.088-1.186-.575-1.406c-.42-.19-1.06-.395-2.741.79-1.755 1.24-3.64 3.752-4.334 5.099"/></g>
    <defs><clipPath id="bluesky-clip"><path fill="#fff" d="M.1.85h15.3v15.3H.1z"/></clipPath></defs>
  </symbol>
  <symbol id="discord-icon" viewBox="0 0 20 19">
    <path fill="#08060d" d="M16.224 3.768a14.5 14.5 0 0 0-3.67-1.153c-.158.286-.343.67-.47.976a13.5 13.5 0 0 0-4.067 0c-.128-.306-.317-.69-.476-.976A14.4 14.4 0 0 0 3.868 3.77C1.546 7.28.916 10.703 1.231 14.077a14.7 14.7 0 0 0 4.5 2.306q.545-.748.965-1.587a9.5 9.5 0 0 1-1.518-.74q.191-.14.372-.293c2.927 1.369 6.107 1.369 8.999 0q.183.152.372.294-.723.437-1.52.74.418.838.963 1.588a14.6 14.6 0 0 0 4.504-2.308c.37-3.911-.63-7.302-2.644-10.309m-9.13 8.234c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.894 0 1.614.82 1.599 1.82.001 1-.705 1.82-1.6 1.82m5.91 0c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.893 0 1.614.82 1.599 1.82 0 1-.706 1.82-1.6 1.82"/>
  </symbol>
  <symbol id="documentation-icon" viewBox="0 0 21 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="m15.5 13.333 1.533 1.322c.645.555.967.833.967 1.178s-.322.623-.967 1.179L15.5 18.333m-3.333-5-1.534 1.322c-.644.555-.966.833-.966 1.178s.322.623.966 1.179l1.534 1.321"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M17.167 10.836v-4.32c0-1.41 0-2.117-.224-2.68-.359-.906-1.118-1.621-2.08-1.96-.599-.21-1.349-.21-2.848-.21-2.623 0-3.935 0-4.983.369-1.684.591-3.013 1.842-3.641 3.428C3 6.449 3 7.684 3 10.154v2.122c0 2.558 0 3.838.706 4.726q.306.383.713.671c.76.536 1.79.64 3.581.66"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M3 10a2.78 2.78 0 0 1 2.778-2.778c.555 0 1.209.097 1.748-.047.48-.129.854-.503.982-.982.145-.54.048-1.194.048-1.749a2.78 2.78 0 0 1 2.777-2.777"/>
  </symbol>
  <symbol id="github-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
  </symbol>
  <symbol id="social-icon" viewBox="0 0 20 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M12.5 6.667a4.167 4.167 0 1 0-8.334 0 4.167 4.167 0 0 0 8.334 0"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M2.5 16.667a5.833 5.833 0 0 1 8.75-5.053m3.837.474.513 1.035c.07.144.257.282.414.309l.93.155c.596.1.736.536.307.965l-.723.73a.64.64 0 0 0-.152.531l.207.903c.164.715-.213.991-.84.618l-.872-.52a.63.63 0 0 0-.577 0l-.872.52c-.624.373-1.003.094-.84-.618l.207-.903a.64.64 0 0 0-.152-.532l-.723-.729c-.426-.43-.289-.864.306-.964l.93-.156a.64.64 0 0 0 .412-.31l.513-1.034c.28-.562.735-.562 1.012 0"/>
  </symbol>
  <symbol id="x-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/>
  </symbol>
</svg>
</file>

<file path="README.md">
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
</file>

<file path="src/App.css">
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
</file>

<file path="src/assets/react.svg">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
</file>

<file path="src/assets/vite.svg">
<svg xmlns="http://www.w3.org/2000/svg" width="77" height="47" fill="none" aria-labelledby="vite-logo-title" viewBox="0 0 77 47"><title id="vite-logo-title">Vite</title><style>.parenthesis{fill:#000}@media (prefers-color-scheme:dark){.parenthesis{fill:#fff}}</style><path fill="#9135ff" d="M40.151 45.71c-.663.844-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.493c-.92 0-1.457-1.04-.92-1.788l7.479-10.471c1.07-1.498 0-3.578-1.842-3.578H15.443c-.92 0-1.456-1.04-.92-1.788l9.696-13.576c.213-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.472c-1.07 1.497 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.087.89 1.83L40.153 45.712z"/><mask id="a" width="48" height="47" x="14" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M40.047 45.71c-.663.843-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.389c-.92 0-1.457-1.04-.92-1.788l7.479-10.472c1.07-1.497 0-3.578-1.842-3.578H15.34c-.92 0-1.456-1.04-.92-1.788l9.696-13.575c.213-.297.556-.474.92-.474H53.93c.92 0 1.456 1.04.92 1.788L47.37 13.03c-1.07 1.498 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.088.89 1.831L40.049 45.712z"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#eee6ff" rx="5.508" ry="14.704" transform="rotate(269.814 20.96 11.29)scale(-1 1)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#eee6ff" rx="10.399" ry="29.851" transform="rotate(89.814 -16.902 -8.275)scale(1 -1)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#8900ff" rx="5.508" ry="30.487" transform="rotate(89.814 -19.197 -7.127)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.928 4.177)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.738 5.52)scale(1 -1)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#eee6ff" rx="14.072" ry="22.078" transform="rotate(93.35 31.245 55.578)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx="14.592" cy="9.743" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(39.51 14.592 9.743)"/></g><g filter="url(#k)"><ellipse cx="61.728" cy="-5.321" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 61.728 -5.32)"/></g><g filter="url(#l)"><ellipse cx="55.618" cy="7.104" fill="#00c2ff" rx="5.971" ry="9.665" transform="rotate(37.892 55.618 7.104)"/></g><g filter="url(#m)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#n)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#o)"><ellipse cx="49.857" cy="30.678" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 49.857 30.678)"/></g><g filter="url(#p)"><ellipse cx="52.623" cy="33.171" fill="#00c2ff" rx="5.971" ry="15.297" transform="rotate(37.892 52.623 33.17)"/></g></g><path d="M6.919 0c-9.198 13.166-9.252 33.575 0 46.789h6.215c-9.25-13.214-9.196-33.623 0-46.789zm62.424 0h-6.215c9.198 13.166 9.252 33.575 0 46.789h6.215c9.25-13.214 9.196-33.623 0-46.789" class="parenthesis"/><defs><filter id="b" width="60.045" height="41.654" x="-5.564" y="16.92" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-40.407" y="-6.762" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-35.435" y="2.801" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-30.84" y="20.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-29.307" y="21.949" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="29.961" y="-17.13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-13.43" y="-22.082" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="34.321" y="-37.644" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="38.847" y="-10.552" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="22.45" y="-1.645" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="32.919" y="11.36" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter></defs></svg>
</file>

<file path="src/data/companions.js">
// src/data/companions.js

export const COMPANIONS = {
  pets: {
    dire_pup: {
      id: "dire_pup",
      name: "Dire Pup",
      description: "A vicious companion that distracts your foes.",
      combatEffect: "FLANKING", 
      damageBonus: 10, // Adds 10 damage to your base attack
      imagePath: "/images/pets/dire_pup.jpg"
    },
    swamp_sprite: {
      id: "swamp_sprite",
      name: "Swamp Sprite",
      description: "A glowing orb that mends minor wounds.",
      combatEffect: "REGEN",
      healingBonus: 5, // Heals 5 HP per combat turn
      imagePath: "/images/pets/swamp_sprite.jpg"
    }
  },
  mounts: {
    draft_horse: {
      id: "draft_horse",
      name: "Draft Horse",
      description: "A sturdy steed equipped with saddlebags.",
      passiveEffect: "EXTRA_INVENTORY",
      capacityBonus: 2, // Holds more resources before capping out
      imagePath: "/images/mounts/draft_horse.jpg"
    },
    wind_glider: {
      id: "wind_glider",
      name: "Wind Glider",
      description: "A kite-like contraption that rides the thermal drafts.",
      passiveEffect: "SCOUT_AHEAD",
      scoutBonus: true, // Allows player to see what the next zone is before rolling
      imagePath: "/images/mounts/wind_glider.jpg"
    }
  }
};
</file>

<file path="src/main.jsx">
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
</file>

<file path="package.json">
{
  "name": "little-guys",
  "private": true,
  "version": "0.0.0",
  "type": "module",
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
},
  "dependencies": {
    "@tailwindcss/vite": "^4.3.1",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "tailwindcss": "^4.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "gh-pages": "^6.3.0",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}
</file>

<file path="src/App.jsx">
import { useState } from 'react';
import MainMenu from './views/MainMenu';

function App() {
  // We will expand this later to include 'setup', 'run', and 'battle'
  const [currentView, setCurrentView] = useState('menu');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      {currentView === 'menu' && (
        <MainMenu onStartRun={() => setCurrentView('setup')} />
      )}
      
      {/* Placeholder for the next screen */}
      {currentView === 'setup' && (
        <div className="max-w-4xl mx-auto mt-10">
          <h1 className="text-3xl font-bold mb-4">Run Setup</h1>
          <button 
            onClick={() => setCurrentView('menu')}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
</file>

<file path="src/data/biomes.js">
// src/data/biomes.js

export const BIOMES = {
  swamp: {
    id: "swamp",
    name: "The Sunken Mire",
    description: "A toxic, muddy expanse filled with dangerous flora.",
    imagePath: "/images/maps/biomes/swamp_bg.jpg",
    resourcePool: [
      { itemId: "monster_parts", weight: 40 },
      { itemId: "plant_bramble", weight: 20 },
      { itemId: "plant_tox", weight: 20 },
      { itemId: "plant_black", weight: 10 },
      { itemId: "plant_red", weight: 5 },
      { itemId: "mote_earth", weight: 5 } // 5% chance drop
    ]
  },
  plains: {
    id: "plains",
    name: "The Whispering Plains",
    description: "Endless fields of tall grass hiding unseen predators.",
    imagePath: "/images/maps/biomes/plains_bg.jpg",
    resourcePool: [
      { itemId: "monster_parts", weight: 40 },
      { itemId: "plant_wheat", weight: 20 },
      { itemId: "plant_zephyr", weight: 20 },
      { itemId: "plant_yellow", weight: 10 },
      { itemId: "plant_blue", weight: 5 },
      { itemId: "mote_wind", weight: 5 } 
    ]
  },
  coast: {
    id: "coast",
    name: "The Shaded Coast",
    description: "A rocky, treacherous shoreline battered by dark waves.",
    imagePath: "/images/maps/biomes/coast_bg.jpg",
    resourcePool: [
      { itemId: "monster_parts", weight: 40 },
      { itemId: "plant_aqua", weight: 20 },
      { itemId: "plant_pearl", weight: 20 },
      { itemId: "plant_blue", weight: 10 },
      { itemId: "plant_yellow", weight: 5 },
      { itemId: "mote_water", weight: 5 } 
    ]
  }
};
</file>

<file path="src/index.css">
@import "tailwindcss";
</file>

<file path="vite.config.js">
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/little-guys/', 
})
</file>

<file path="src/data/enemies.js">
// src/data/enemies.js

export const ENEMIES = {
  // --- MAIEV SWAMP (MUD/NATURE ZONES) ---
  bog_bug: {
    id: "bog_bug",
    name: "Bog Bug",
    biome: "swamp",
    zoneType: "mud", // Custom tag to separate from Poison
    baseHealth: 3,
    baseAttack: 80,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1, // 1 HP = 1 Bug
    ability: "SWARM",
    imagePath: "/images/enemies/BogBug.png"
  },
  mire_mantis: {
    id: "mire_mantis",
    name: "Mire Mantis",
    biome: "swamp",
    zoneType: "mud",
    baseHealth: 2,
    baseAttack: 120,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1, // 1 HP = 1 Mantis
    ability: "SCYTHE_STRIKE",
    imagePath: "/images/enemies/MireMantis.png"
  },

  // --- MAIEV SWAMP (POISON ZONES) ---
  salamandar: {
    id: "salamandar",
    name: "Salamandar",
    biome: "swamp",
    zoneType: "poison",
    baseHealth: 2,
    baseAttack: 100,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 1, // 1 HP = 1 Salamandar
    ability: "TOXIC_SPIT",
    imagePath: "/images/enemies/Salamandar.png"
  },
  mire_man: {
    id: "mire_man",
    name: "Mire Man",
    biome: "swamp",
    zoneType: "poison",
    baseHealth: 4,
    baseAttack: 90,
    healthPerLevel: 1,
    attackPerLevel: 20,
    hpPerCount: 2, // 2 HP = 1 Mire Man
    ability: "SLUDGE_GRASP",
    imagePath: "/images/enemies/MireMan.png"
  }
};
</file>

<file path="src/data/items.js">
// src/data/items.js

export const ITEMS = {
  // --- CURRENCY & SHARED MATERIALS ---
  delc: { id: "delc", name: "DELC", type: "currency", value: 1 },
  sigil_dust: { id: "sigil_dust", name: "Sigil Dust", type: "material", rarity: "uncommon" },
  monster_parts: { id: "monster_parts", name: "Monster Parts", type: "material", rarity: "common" },

  // --- SHARED PLANTS ---
  plant_red: { id: "plant_red", name: "Crimson Root (Red)", type: "plant", imagePath: "/images/resources/Flower_Red.jpg" },
  plant_blue: { id: "plant_blue", name: "Azure Leaf (Blue)", type: "plant", imagePath: "/images/resources/Flower_Blue.jpg" },
  plant_yellow: { id: "plant_yellow", name: "Amber Bulb (Gold)", type: "plant", imagePath: "/images/resources/Flower_Gold.jpg" },
  plant_black: { id: "plant_black", name: "Void Spore (Black)", type: "plant", imagePath: "/images/resources/Flower_Black.jpg" },
  plant_green: { id: "plant_green", name: "Verdant Sprout (Green)", type: "plant", imagePath: "/images/resources/Flower_Green.jpg" },
  // --- BIOME: SWAMP ---
  mote_earth: { id: "mote_earth", name: "Earth Mote", type: "mote", biome: "swamp" },
  plant_bramble: { id: "plant_bramble", name: "Bramble Thorn", type: "plant", biome: "swamp" },
  plant_tox: { id: "plant_tox", name: "Tox Petals", type: "plant", biome: "swamp" },

  // --- BIOME: PLAINS ---
  mote_wind: { id: "mote_wind", name: "Wind Mote", type: "mote", biome: "plains" },
  plant_wheat: { id: "plant_wheat", name: "Wheat", type: "plant", biome: "plains" },
  plant_zephyr: { id: "plant_zephyr", name: "Zephyr Bloom", type: "plant", biome: "plains" },

  // --- BIOME: COAST ---
  mote_water: { id: "mote_water", name: "Water Mote", type: "mote", biome: "coast" },
  plant_aqua: { id: "plant_aqua", name: "Aqua Squash", type: "plant", biome: "coast" },
  plant_pearl: { id: "plant_pearl", name: "Pearl-moss", type: "plant", biome: "coast" },
};
</file>

<file path="src/data/characters.js">
// src/data/characters.js

export const ROSTER = {
  gil: {
    id: "gil",
    name: "Gil",
    description: "A balanced explorer ready for any biome.",
    baseHealth: 5,
    baseAttack: 200,
    // Ardenkin: Advantage on plant rolls. Battle Bloom: Recover 1 HP post-fight (Max 5).
    passives: ["ARDENKIN", "BATTLE_BLOOM"], 
    imagePath: "/images/characters/Gil.png",
    altCostumes: {
      coast: "/images/characters/Gil_Coast.png",
      plains: "/images/characters/Gil_Plains.png"
    }
  },
  marinska: {
    id: "marinska",
    name: "Marinska",
    description: "Strikes fast and navigates the shadows with ease.",
    baseHealth: 5,
    baseAttack: 260,
    passives: ["FIRST_STRIKE", "EVASION"],
    imagePath: "/images/characters/Marinska.png"
  },
  tornadowerewolf: {
    id: "tornadowerewolf",
    name: "Tornado Werewolf",
    description: "A chaotic force of nature that tears through enemy lines.",
    baseHealth: 5,
    baseAttack: 280,
    passives: ["CLEAVE", "WIND_AFFINITY"],
    imagePath: "/images/characters/Tornadowerewolf.png"
  },
  crocagator: {
    id: "crocagator",
    name: "Crocagator",
    description: "Thick-scaled and nearly impossible to take down.",
    baseHealth: 5,
    baseAttack: 160,
    passives: ["THICK_SCALES", "SWAMP_NATIVE"],
    imagePath: "/images/characters/Crocagator.png"
  },
  shiva: {
    id: "shiva",
    name: "Shiva",
    description: "A mystical warrior who excels in prolonged encounters.",
    baseHealth: 5,
    baseAttack: 220,
    // Looking For Trouble: Once per level, forced reroll any non-fight exploration.
    passives: ["LOOKING_FOR_TROUBLE"], 
    imagePath: "/images/characters/shiva.png"
  }
};
</file>

<file path="src/views/MainMenu.jsx">
import { useState } from 'react';
import { ROSTER } from '../data/characters';
import { ENEMIES } from '../data/enemies';

// The dictionary for your tooltips
const PASSIVE_DESCRIPTIONS = {
  "RESOURCEFUL": "Can occupy any map without running into Darkstalkers.",
  "ARDENKIN": "Advantage on plant rolls (roll twice, take the higher result).",
  "BATTLE_BLOOM": "Recover 1 HP at the end of every fight (Max 5 HP).",
  "FIRST_STRIKE": "Always attacks first in combat.",
  "EVASION": "Has a chance to completely dodge incoming attacks.",
  "CLEAVE": "Deals spillover damage to the next enemy.",
  "WIND_AFFINITY": "Gains bonus stats in the Plains biome.",
  "THICK_SCALES": "Takes reduced damage from physical attacks.",
  "SWAMP_NATIVE": "Gains bonus stats in the Swamp biome.",
  "MYSTIC_AURA": "Heals slightly after a victorious battle.",
  "LOOKING_FOR_TROUBLE": "Once per level, force-reroll any exploration that is not a fight."
};

export default function MainMenu({ onStartRun }) {
  const characters = Object.values(ROSTER);
  const enemies = Object.values(ENEMIES);

  // State to track tabs and currently selected entities
  const [activeTab, setActiveTab] = useState('roster');
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const [selectedEnemy, setSelectedEnemy] = useState(enemies[0]);

  return (
    <div className="max-w-6xl mx-auto pb-12 flex flex-col h-screen">
      
      {/* HEADER */}
      <header className="text-center space-y-4 pt-8 pb-6 shrink-0">
        <h1 className="text-5xl font-black tracking-tight text-emerald-400">Little Guys</h1>
        <button 
          onClick={onStartRun}
          className="mt-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
        >
          Start New Run
        </button>
      </header>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-6 shrink-0">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'roster' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          Roster
        </button>
        <button 
          onClick={() => setActiveTab('bestiary')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'bestiary' ? 'bg-rose-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          Bestiary
        </button>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-grow flex gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: THE LIST (Scrollable, Fast Loading) */}
        <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 pb-8 custom-scrollbar">
          {activeTab === 'roster' && characters.map((char) => (
            <button 
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedChar.id === char.id ? 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500'}`}
            >
              <h3 className="text-xl font-bold text-white">{char.name}</h3>
              <p className="text-sm text-slate-400 truncate">{char.description}</p>
            </button>
          ))}

          {activeTab === 'bestiary' && enemies.map((enemy) => (
            <button 
              key={enemy.id}
              onClick={() => setSelectedEnemy(enemy)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedEnemy.id === enemy.id ? 'bg-slate-800 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500'}`}
            >
              <h3 className="text-xl font-bold text-rose-300">{enemy.name}</h3>
              <p className="text-sm text-slate-400 capitalize">{enemy.biome} - {enemy.zoneType}</p>
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN: THE SPOTLIGHT (Loads only ONE large image at a time) */}
        <div className="w-2/3 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex flex-col relative">
          
          {/* Active Roster Display */}
          {activeTab === 'roster' && (
            <>
              <div className="h-2/3 w-full bg-black relative">
                {/* Background gradient overlay to make text pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  key={selectedChar.id} // Forces image to rerender when changing characters
                  src={`${import.meta.env.BASE_URL}${selectedChar.imagePath.slice(1)}`} 
                  alt={selectedChar.name} 
                  className="w-full h-full object-cover object-top animate-fade-in"
                />
              </div>
              <div className="p-6 relative z-20 -mt-16">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-4xl font-black text-white drop-shadow-md">{selectedChar.name}</h2>
                  <div className="flex gap-3 text-lg font-mono bg-slate-800/90 border border-slate-600 px-4 py-2 rounded-lg text-emerald-300 shadow-lg">
                    <span>HP: {selectedChar.baseHealth}</span>
                    <span className="text-slate-500">|</span>
                    <span>ATK: {selectedChar.baseAttack}</span>
                  </div>
                </div>
                
                <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Passive Abilities</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedChar.passives.map(passive => (
                    <div key={passive} className="relative group cursor-help">
                      <span className="bg-indigo-900/80 text-indigo-200 px-3 py-1.5 rounded-lg border border-indigo-500/50 shadow-md transition-colors group-hover:bg-indigo-700 group-hover:text-white">
                        {passive.replace(/_/g, ' ')}
                      </span>
                      {/* THE TOOLTIP */}
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {PASSIVE_DESCRIPTIONS[passive] || "Ability description unknown."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Active Bestiary Display */}
          {activeTab === 'bestiary' && (
            <>
              <div className="h-2/3 w-full bg-black relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  key={selectedEnemy.id} 
                  src={`${import.meta.env.BASE_URL}${selectedEnemy.imagePath.slice(1)}`} 
                  alt={selectedEnemy.name} 
                  className="w-full h-full object-cover object-center animate-fade-in"
                />
              </div>
              <div className="p-6 relative z-20 -mt-16">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-4xl font-black text-rose-300 drop-shadow-md">{selectedEnemy.name}</h2>
                  <div className="flex gap-3 text-lg font-mono bg-rose-950/90 border border-rose-800 px-4 py-2 rounded-lg text-rose-200 shadow-lg">
                    <span>Base HP: {selectedEnemy.baseHealth}</span>
                    <span className="text-rose-800/60">|</span>
                    <span>Base ATK: {selectedEnemy.baseAttack}</span>
                  </div>
                </div>
                
                <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Enemy Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p><strong className="text-rose-400">Biome:</strong> <span className="capitalize">{selectedEnemy.biome}</span></p>
                  <p><strong className="text-rose-400">Zone Type:</strong> <span className="capitalize">{selectedEnemy.zoneType}</span></p>
                  <p><strong className="text-rose-400">Scaling:</strong> +{selectedEnemy.healthPerLevel} HP / +{selectedEnemy.attackPerLevel} ATK per level</p>
                  <p><strong className="text-rose-400">Visual Count:</strong> 1 enemy per {selectedEnemy.hpPerCount} HP</p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
</file>

</files>
