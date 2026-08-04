---
name: pet-tier-report
description: Measure and publish the Pet Battler balance tier list — every species ranked by five-a-side contribution, plus a viability and investment read on the player's stable. Use when asked for a tier list, a balance report, "how are the pets doing", or which stable pets to level.
---

# Pet Battler — tier list & balance report

Produces the shareable balance report for the current state of `src/Pets/`.
Everything in it is **measured, not estimated** — the numbers come from a script
in the repo, and the write-up quotes them.

## 1. Measure

```bash
node src/Pets/engine/tierlist.mjs
```

Takes a few minutes. Pass a multiplier to tighten the bars when a call is close
(`node src/Pets/engine/tierlist.mjs 3` triples every sample).

It prints two readable tables and then a `===JSON===` block. **Quote the JSON,
never retype numbers off the tables** — that is what stops a rounding slip
becoming a wrong claim in the report.

If a specific question comes up that the script does not answer (a head-to-head,
a synergy, an uptime), write a throwaway script next to it and delete it after.
That is how the bubble-bond finding and the Toxic Terrain finding were made.

## 2. Understand what was measured

Two deliberate conventions, both worth restating in the report:

- **Species** — level 5, flat `+3` on every die, no Natures. Matches
  `balance.mjs`, so the table measures a species rather than one lucky roll.
- **Stable pets** — their authored stat line at their authored level, and when
  levelled they roll **real 1d4 level-ups**. They are pets you own; the question
  is what investing in them buys.

Three columns carry most of the meaning:

| Column | Reading |
|---|---|
| `solo` | Raw duelling strength. **Structurally blind** to anything touching the bench |
| `team` | 5v5 contribution — the number that decides the tier |
| `gap` | `team − solo`. A large positive gap means a duel cannot see what this pet does |

**Never rank off `solo`.** A Support or Healer will always look broken there.
`beats` (how many of the other 27 it wins a duel against) separates "beats
everything slightly" from "crushes some, loses to others".

### The blue bubble asterisk

Bubble Trouble (Affinity) — and Dovey — has **both** passives gated behind its
bonded partner, so on a random team both read as zero. It is measured with both
assumed online (Max SPC ×1.5, +20 Max ATK), and is marked `*` everywhere.

This makes the blue half a **best case** and the pink half a **typical case**.
Say so in the report: the two are not directly comparable, and that is the
entire point of the asterisk.

## 3. Sample size discipline

Roster `n` is about 1,900 per pet at scale 1 — roughly **±2.3% at 95%**. Before
calling anything a change or a gap, check it clears that. A 2-point difference
is noise; an 8-point one is not. Re-run at a higher scale rather than reasoning
about a close call, and say in the report what the error bar is.

## 4. Structure of the report

Keep it tight. One ranking table doing the work, then short findings.

1. **Header** — what was measured, sample counts, error bar.
2. **Ruleset note** — a flagged box stating any rule that is *pending or
   contested*, because the numbers are only true under the ruleset as run.
   Check `data/constants.js` for the current role-advantage tables and say what
   would move if a debated rule changed.
3. **The tier list** — every species, ranked by `team`, banded S/A/B/C/D/F, with
   a diverging bar. Tier boundaries should be ~4–5 points wide so a band means
   more than noise. A wide, flat middle tier is a **good** sign, not a filler —
   call that out.
4. **Findings** — 4–6, each one sentence of claim and one of mechanism. Prefer a
   finding you measured over one you inferred. Include anything that got *worse*
   or that a previous pass got wrong.
5. **The stable** — measured against the whole pool, with the investment table
   (§5 below).
6. **Method & caveats** — the two conventions, the asterisk, and the fact that
   random rosters under-measure deliberate synergy.

## 5. The stable read

Stable pets are scored **against the whole species pool**, not against each
other — measuring eight pets against themselves only says which of eight is
best, which is not the question.

**Levels are a staircase, not a ramp.** Never summarise a level curve with an
average — the Lv.5 passive is a cliff, and averaging across the span hides it.
An earlier report did exactly that and mis-ranked the whole investment list: it
smeared a 13-point single-level jump into "+1.21 per level" and recommended the
wrong pet. The script measures **every level separately** for this reason.

Read the curve, not the endpoints:

- **`now%`** is present viability — can you field it today.
- **`jump` / `at`** is the cliff: the biggest single level, and where it lands.
  A jump only counts if it clears the noise floor (see §3) — the script marks the
  ones that do.
- A pet whose curve is flat everywhere is **finished**; levels are wasted on it
  however strong it currently is.
- The best buy is the largest *real* cliff you can actually reach.

**Bonded pets need the pair table.** Lovey and Dovey's passives are gated behind
each other, so measured alone their Lv.5 buys nothing and the curve looks flat.
The script also runs them as a pair, with no assumption, and that is the number
to quote — the cliff only exists if both are fielded. Say so explicitly: this is
an all-or-nothing investment, not a per-pet one.

Rank the stable explicitly by investment priority and say why. If one pet
dominates the stable, say what that does to Gauntlet squad-building — the
squad holding it is close to a decided match.

## 6. Publish

Load the `artifact-design` skill, write the page to a file, then publish with
the `Artifact` tool.

**Update the existing report rather than minting a new URL.** Run
`Artifact` with `action: "list"`, find *Pet Battler — Level 5 Tier List*, and
pass its `url`. Keep the title and the `🎲` favicon stable so it stays the same
document in the user's gallery.

### Design tokens

Already validated for colour-blind separation (protan ΔE ≥ 19) in both modes —
reuse them rather than re-running the validator.

| Token | Light | Dark |
|---|---|---|
| paper / card | `#e8edf1` / `#f6f8fa` | `#0d1317` / `#141d23` |
| ink / secondary / muted | `#101820` / `#4a5a67` / `#778793` |`#e6edf3` / `#a6b6c2` / `#75858f` |
| rule / hairline | `#cbd6df` / `#dde5eb` | `#26343d` / `#1d2930` |
| **above even** | `#0b6ea8` | `#3f93cf` |
| **below even** | `#b5511f` | `#cf7736` |
| midline / flag | `#8c99a4` / `#a52a1e` | `#6d7d88` / `#e8705a` |

Type: display `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
body `system-ui`; **all numbers in `ui-monospace` with `tabular-nums`**.

Win rate is *deviation from even*, so bars **diverge from a 50% midline** —
never grow from zero. Tier chips use a single-hue sequential ramp of the
above-even blue, darkest at S.

Requirements that are easy to miss: no `<!doctype>`/`<html>`/`<body>` tags, both
themes plus the `:root[data-theme]` overrides, and every table inside its own
`overflow-x: auto` container so the page body never scrolls sideways.

## 7. Before calling it done

- Every number in the prose traces to the JSON.
- The asterisk is explained wherever the blue bubble appears.
- Any claim from a previous report that this run contradicts is **corrected out
  loud**, not quietly dropped.
- The page renders: check both themes and a mobile width.
