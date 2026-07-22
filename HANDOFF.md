# New-chat handoff — adding pets to Pet Battler

Paste the block below into a fresh chat as your first message, then attach your
reference images and stat screenshots. Everything Claude needs to know that is
*not* discoverable by reading the repo is captured here.

---

## THE PROMPT

> I'm adding a batch of new pets to the Pet Battler module in this repo
> (`little-guys`). Read `PetBattler.md` first — it is the design doc and it is
> accurate to the code — then `src/Pets/data/species.js`, which has the
> "adding a new pet" contract at the top.
>
> **Key architecture facts, so you don't have to rediscover them:**
>
> - Combat is **simulate-then-replay**. `simulateBattle()` in
>   `src/Pets/engine/simulate.js` resolves an entire match synchronously and
>   returns a timeline of events with state snapshots; the UI just plays that
>   recording back. Never put game logic in a component.
> - **The engine never names a pet, a Special, or a passive.** Everything
>   bespoke lives behind registries in `src/Pets/data/`. Adding a pet must not
>   require touching `engine/` or `ui/`. If you find yourself wanting to, add a
>   new hook to the passive system instead and say so.
> - A pet is: one entry in `species.js`, plus its Special in `abilities.js`,
>   plus any new passives in `passives.js`, plus artwork in
>   `public/images/pets/`. Abilities are declarative (`damage`, `atkScale`,
>   `applyToTarget`, `applyToSelf`); `onResolve` is the escape hatch for genuinely
>   odd behaviour only.
> - **Species ids are permanent.** Saved rosters in localStorage reference them.
>   Never rename or reuse an id — retire it and add a new one.
> - Passive hooks are documented at the top of `passives.js`. Read that list
>   before inventing a mechanic; most things fit an existing hook.
>
> **Always run the harness after adding pets:**
> ```
> node src/Pets/engine/balance.mjs 2000
> ```
> It fuzzes thousands of matches, prints per-species solo win rates, and asserts
> every core rule. A new pet that crashes, never terminates, or is wildly
> mis-tuned shows up here before it reaches the arena. Add a new assertion to it
> whenever we add a rule. Also run `npx eslint src/Pets` and `npx vite build`.
>
> **Working style I want:**
>
> - Tell me when a stat line or mechanic I give you is clearly over- or
>   under-tuned, with the win-rate number to back it up — then build what I asked
>   anyway and flag it. Don't silently "fix" my numbers.
> - If a mechanic I describe doesn't fit the existing hooks, say so and propose
>   the smallest new hook that makes it data-driven.
> - Don't invent flavour, passives, or stats to fill gaps. Ask, or leave a
>   clearly-marked placeholder.
> - You cannot see rendered frames in this environment. Verify layout
>   numerically via the DOM and say plainly what you could not visually confirm.
>
> For each pet I'll give you: artwork, a name, a role, a defensive (and where
> relevant offensive) typing, HP/ATK/DEF/SPC, a Special, and 1–2 passives. If
> anything is missing from what I give you, ask rather than guess.

---

## CONTEXT WORTH CARRYING (facts, not opinions)

### Rules that differ from older drafts of the design

These were changed deliberately and are all asserted in `balance.mjs`:

- Both Hellhound Specials roll at **200%** Max ATK (not +50%).
- **Emboar's Heat Up and Bubble Shield do not heal.**
- **Ties on ATK vs DEF go to the attacker** (`>=`, not `>`).
- **Advantage/disadvantage stack and cancel.** Every source is summed into a
  net; dice rolled = `1 + |net|`, keeping highest (positive) or lowest
  (negative). It is *not* clamped to one step.
- **Cursed is a flat 50%** to null damage regardless of stack count. Stacks are
  **duration** — one falls off at the end of the cursed pet's own turn, except a
  stack applied during that same turn, which is spared. That exemption is what
  makes reactive appliers like *Vengeful Curse* (which lands on the attacker
  mid-attack) worth having; without it the curse would expire before the victim
  ever acted. Verified: 0 wasted out of 393 applications.
- **After a knockout the side that lost the pet acts first.** Opening turn only
  is decided by Max SPC.
- **Benched pets gain no charge from their role.** It must come from a passive
  using the `benchCharge` hook. *Backline Current* (Felightning) is the only one:
  banks half its SPC roll, relays a quarter to the active ally.
- **Thick Fur does not block Stagnation** (Stagnation is typed `system`, not
  `debuff`).
- Level-ups grant **1d4** to one random die, not +1.

### Content authored by Claude, not by you — review before building on it

- *Surface Tension* and *Undertow* (the two Bubble Trouble Lv.5 passives) filled
  in `xxxx` placeholders.
- *Backline Current*'s quarter-relay-to-ally clause.

### Known balance state (level 1, no Natures, solo duels)

Roughly: Necrodoodle ~76% at the top, Felightning ~4% at the bottom. Felightning
is a 3 HP Support whose value is bench charge, which a 1v1 test cannot measure —
judge it only in full 5v5s. Gnollbacabra (~35%) has 4 HP and a d20 DEF and may
genuinely need a fifth heart. A 5v5 averages ~95 turns.

### Layout facts (if you touch the arena)

Authored in a fixed 1600×900 space, scaled with one transform. Bands: sky/trees
0–106, stands 96–250, parapet 250–272, wall 272–490, sand 490–900. Duel is
downstage at y 480–780; bench stands at the wall base staggered 520→475; side
rails at y 540; nameplates at 792. Named cast (Gil, Castellan, Shiva) sit in the
stands cropped by the parapet.
