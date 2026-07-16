# Cinder — Design Language Specification

**Version 0.2 · Dark · July 2026**

Cinder is a warm, cinematic design language for developer tools: burning embers seen
across a dark room, antique gold under lamp light, oxidized copper, old leather.
It is designed as one system that renders identically across VS Code, JetBrains IDEs,
terminals, Obsidian, web and desktop applications. Platforms implement Cinder by
mapping their native keys to the **semantic tokens** in `tokens/` — never to raw hex.

---

## 1. Design principles

1. **Warmth is an undertone, not a subject.** The reference colors (#BE0E10, #8A130D,
   #DF3602, #D5A418) are fire and gold. Painting code with them directly would be
   exhausting; instead the *atmosphere* lives in a warm-biased neutral scale and the
   fire appears only where meaning demands it.
2. **The background is a room, not a color.** Near-black, neutral to the eye, warm to
   the instrument. Never brown, never tinted enough to name.
3. **One accent owns the screen.** Ember (#E26A38) is the only high-chroma element —
   cursor, focus, selection tint. Everything else is quieter than it. This gives the
   theme a single point of heat, like a coal in ash.
4. **Contrast is a band, not a maximum.** Every reading color sits between ~4.5:1 and
   ~15:1. Below the band text strains; above it (pure white on pure black) halation
   causes fatigue in long sessions. Syntax colors cluster at 6.5–9.7:1.
5. **Hue means the same thing everywhere.** Ember = language, Gold = behavior,
   Slate = structure, Verdigris = data, Heather = literal values, Garnet = danger,
   Ash = prose and chrome. A color never changes meaning between the editor, the
   terminal, and a diff view.
6. **Style degrades gracefully.** Italic/bold are refinements; no semantic distinction
   depends on font style alone (terminals can't be trusted with it).

---

## 2. Foundation — the seven families

Scales run 50 (lightest) → 900/975 (darkest) with perceptually even lightness steps
(designed in OKLCH: L ≈ .95/.90/.80/.70/.60/.50/.42/.34/.26/.19). The 300 step of
every chromatic family is its **reading tone** — the step tuned for text on Char —
which is why all six land in a tight 6.5–9.7:1 contrast window: code reads as one
fabric, not as bright and dim patches.

### Ash — the warm neutral (why it exists)
Every background, border, and text tone. Hue 48–79° (OKLCH), chroma ≤ 0.02 — roughly the color
of paper aged by candlelight, desaturated until only an instrument can tell. A truly
neutral gray next to ember and gold would read *blue* by simultaneous contrast; Ash's
faint warmth cancels that so the neutrals feel like part of the room.

| Step | Name | Hex | vs Char |
|---|---|---|---|
| 50 | — | `#F6F2EC` | 15.9 |
| 100 | **Parchment** | `#EAE4DB` | 14.0 |
| 200 | Sand | `#CFC8BD` | 10.7 |
| 300 | **Sandstone** | `#ABA399` | 7.1 |
| 400 | **Smoke** | `#8B8378` | 4.7 |
| 500 | Dust | `#6B6459` | 3.0 |
| 600 | Iron | `#524C44` | — |
| 700 | Bark | `#3A352F` | — |
| 800 | Basalt | `#2B2723` | — |
| 900 | **Coal** | `#221F1C` | — |
| 950 | **Char** | `#1A1817` | background |
| 975 | Soot | `#141211` | — |

### Ember — orange-red · `#DF3602` preserved in hue
The signature. The source color at full strength is a traffic cone; Cinder keeps its
hue and re-tempers it: **Coral** (300, `#EC8F68`) for reading, **Ember** (400,
`#E26A38`) for the accent, Flame (500, `#D34A17`) only as alpha fills.

### Garnet — deep red · from `#BE0E10` / `#8A130D`
Exists so that *red can mean danger and nothing else*. Pulled toward oxblood/garnet —
saturated reds are the fastest colors to fatigue on dark backgrounds and the first
thing that reads "gaming RGB". **Garnet** (300, `#E58177`) for error text, **Rust**
(400, `#D25A4E`) for deletions. Deliberately hue-separated from Ember (~5° vs ~35°
red-orange) so keywords and errors never blur.

### Gold — antique gold · from `#D5A418`
Aged brass, not lemon. **Antique Gold** (300, `#DFBC59`) is the brightest syntax
color by physics (yellow is inherently light); Cinder spends that brightness on
functions — the tokens programmers scan for. **Brass** (400, `#CBA32D`) sits nearly
on the source color and carries decorators, warnings, and the modified state.

### Verdigris — oxidized copper (supporting)
The palette needs a cool counterweight or the warm hues have nothing to be warm
*against*; strings — the largest colored mass in most files — are where that weight
belongs. Verdigris is the theme's own green: copper roofs and old bronze, hue ~165°,
low chroma. **Patina** (300, `#7DB5A0`) for strings and success, **Copper Oxide**
(400, `#579A82`) for regex and additions.

### Slate — dusty steel blue (supporting)
Structure needs a voice that is neither warm (taken by language and behavior) nor
green (taken by data). Slate is iron and gun-metal — a blue so grayed it belongs in
the same room as leather and brass. **Steel** (300, `#92A9C2`) for types and info,
**Gunmetal** (400, `#6E8CAB`) for namespaces.

### Heather — smoky mauve (supporting)
Literal values (numbers, booleans, constants, enum members) need to be findable
without competing with keywords or functions. A muted violet is the premium-theme
convention (Rosé Pine's iris, Gruvbox's purple) precisely because it is unlike
everything else on screen at low chroma. **Heather** (300, `#BE97B8`).

Full scale values: `tokens/cinder.foundation.json`.

---

## 3. Semantic tokens

Defined in `tokens/cinder.semantic.json`. Highlights and reasoning:

### Backgrounds & surfaces — depth by lightness, not shadow
Four background layers, three surface states, all from Ash. Depth is communicated by
a single rule: **closer to the user = one step lighter.** Soot (975) for recessed
chrome (sidebars, panels) → Char (950) for the editor → Coal (900) elevated →
Basalt (800) overlays. The editor being *lighter than its chrome* frames code as the
subject, the way a matte frames a print.

### Borders
Basalt / Bark / Iron (800/700/600). Borders separate; they should never draw. The
strong step (Iron, ~2.2:1 vs Char) is reserved for focus and manipulation affordances.

### Text — a four-step hierarchy with a floor
Parchment 14.0:1 → Sandstone 7.1:1 → Smoke 4.7:1 → Dust 3.0:1. Primary text stops
at 14.0:1 rather than pure white (~18:1): high-contrast halation on dark screens is
the main driver of eye strain in long sessions. Dust is intentionally sub-AA and is
contractually forbidden from carrying essential information.

### Accents
`accent.primary` **Ember**, `accent.secondary` **Brass**, `accent.tertiary` **Rust** —
the brand triad, all from the reference frame. Cool hues never appear as UI accents;
they exist only where syntax and status semantics need them.

### Status
Garnet / Antique Gold / Patina / Steel (error / warning / success / info). Success is
verdigris-green rather than pure green so even status toasts stay inside the
material world of the theme. All ≥ 6.5:1.

### Editor
- **Cursor = Ember.** The most saturated pixel on screen, always. Nothing else may
  compete with it — that's what makes it findable at a glance.
- **Selection = Flame @ 20%** — warm glass. At 20% alpha over Char every reading tone
  (6.5:1+) stays above 5.3:1 and comments dip only to 3.9:1, so selected code remains
  readable (the classic failure of colored selections).
- **Search = gold alphas** (gold.500 @ 20% other matches / gold.400 @ 20% + an
  Antique Gold border on the current match): search is "panning for gold"; the
  current match is marked by a ring, not a heavier fill — a fill strong enough to
  single it out would push the matched text itself below 4:1.
- **Bracket match**: gold fill @ 15% + Iron border. No color flash — brackets are
  chrome, not content.
- Current line Coal, indent guides Basalt (active: Iron), rulers Basalt,
  scrollbars Bark @ 50%. All structural furniture is Ash: visible on inspection,
  invisible in peripheral vision.

### Git
Added **Copper Oxide** · Modified **Brass** · Deleted **Rust** · Ignored **Dust** ·
Conflict **Ember**. The 400-step versions: gutter marks are glanceable status, not
reading text, so they sit one step dimmer than diff *text* (which uses the 300s).

### Terminal (ANSI 16)
Normal colors are the 400s, brights the 300s/200s — CLI output gets the same voice
as the editor: red errors are Rust, green success is Copper Oxide, yellow warnings
are Brass. One deliberate exception: **brightBlack is Smoke (ash.400), not Dust** —
shells use brightBlack for autosuggestions (zsh, fish) and de-emphasized-but-real
text, so it must clear AA on the terminal background. Mapping in
`cinder.semantic.json → terminal`.

---

## 4. Syntax color system

Defined in `tokens/cinder.syntax.json`. The assignment logic is **one hue per
semantic axis**, chosen by how a programmer actually scans code:

| Axis | Family | Tone | Why |
|---|---|---|---|
| Language (keywords, storage) | Ember | Coral `#EC8F68` | Keywords are the skeleton — they get the signature hue, softened to coral so a keyword-dense page glows rather than burns. Modifiers italicize. |
| Behavior (functions, methods, constructors) | Gold | Antique Gold `#DFBC59` | Functions are what the eye hunts for when reading unfamiliar code; they get the brightest color in the system (9.7:1). Decorators/annotations are Brass italic — *metadata about* behavior, one step dimmer. |
| Structure (types, classes, interfaces, enums) | Slate | Steel `#92A9C2` | Types are architecture: cool, load-bearing, calm. Interfaces italicize (types you can't instantiate); namespaces/modules take Gunmetal — context, quieter than contents. |
| Data (strings, regex) | Verdigris | Patina `#7DB5A0` | The cool counterweight. Escapes are **Glow** `#F3B69C` — a warm spark inside the cool string that cannot be missed. Regex takes the denser 400. |
| Literal values (numbers, booleans, constants, enum members) | Heather | `#BE97B8` | One family for "this value is fixed", unlike anything else on screen. |
| Prose (variables, parameters, properties) | Ash | Parchment `#EAE4DB` | The most important decision in the theme: **variables are not colored.** They are the text of the program; coloring them turns every line into confetti. Parameters italicize. Property chains stay calm. |
| Neutral machinery (operators, punctuation) | Ash | Sandstone / Smoke | Present but silent — the single biggest lever against "overly colorful" syntax. |
| Comments | Ash | Smoke italic, 4.7:1 | Readable when read, invisible when skimmed. Doc comments upright (they're API surface). TODO/FIXME: **Brass bold** — must survive a skim. |

Net effect on a typical file: ~60–70 % of characters render in Ash tones, warm hues
carry the skeleton, and the two cool families (Slate, Verdigris) appear exactly where
long warm passages would otherwise smear together. That ratio — mostly-neutral with
warm structure — is what makes the theme feel restrained at 2 a.m.

**Per-language mappings** (Markdown, HTML, CSS, JSON, YAML, SQL, Shell, Diff) reuse
the same axes — e.g. HTML tags are keywords (Coral), attributes are metadata (Brass
italic), attribute values are strings (Patina); JSON keys are structure (Steel);
Markdown headings are Antique Gold bold, links Steel underlined, inline code Glow.
Full table in `cinder.syntax.json`.

---

## 5. Accessibility summary

All ratios WCAG 2.x, measured against Char `#1A1817` (script: computed, not estimated):

| Role | Token | Ratio | Target |
|---|---|---|---|
| Body/code text | Parchment | 14.00 | 7+ (AAA) |
| Secondary text | Sandstone | 7.10 | 7 (AAA) |
| Comments / muted | Smoke | 4.73 | 4.5 (AA) |
| Keywords | Coral | 7.33 | 4.5+ |
| Functions | Antique Gold | 9.67 | 4.5+ |
| Types | Steel | 7.31 | 4.5+ |
| Strings | Patina | 7.57 | 4.5+ |
| Constants | Heather | 7.00 | 4.5+ |
| Error | Garnet | 6.52 | 4.5+ |
| Warning | Antique Gold | 9.67 | 4.5+ |
| Success | Patina | 7.57 | 4.5+ |
| Info | Steel | 7.31 | 4.5+ |
| Disabled | Dust | 3.03 | decorative only |

Color-vision deficiencies (simulated with Machado et al. matrices at full severity,
distances in OKLab): the system never pairs meaning across red/green alone —
added/deleted differ in lightness and position (gutter shape, +/- prefix, line
fills) as well as hue, and stay distinguishable under protanopia (Δ 0.12) and
deuteranopia (Δ 0.08, plus the non-color cues). Known limits, accepted because no
meaning rides on them alone: Coral vs Garnet are near neighbours (Δ 0.05 — errors
always also carry a squiggle, gutter icon, or panel position), and Heather vs Steel
converge under deuteranopia (constants vs types — a stylistic, not semantic,
distinction).

---

## 6. Implementation contract

1. Map platform keys → **semantic tokens** only (`background.default`, `syntax.keyword`, …).
2. Never introduce a hex that is not in the foundation scales. Sole exception:
   pure black (`#000000`) may appear for drop shadows, always with alpha.
3. Alpha effects are always `foundation color × documented opacity`, never new colors.
4. If a platform lacks a concept (e.g. terminals have no "overlay"), collapse *upward*
   to the nearest darker layer, never invent an intermediate.
5. Font styles are advisory; nothing may depend on them alone.

Token files:

```
tokens/
  cinder.foundation.json   — the seven scales (source of truth)
  cinder.semantic.json     — UI semantics + ANSI 16
  cinder.syntax.json       — syntax semantics + per-language tables
```
