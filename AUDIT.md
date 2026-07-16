# Cinder — Color Audit (v0.2, July 2026)

A full validation of the design language and its VS Code implementation. Every number
below is **computed** (WCAG 2.x relative luminance, OKLab/OKLCH, alpha compositing,
Machado et al. CVD simulation at full severity) — the script lives in the session
notes; re-running it against the token files reproduces every figure.

## 1. What the audit confirmed (no changes needed)

- **Every contrast ratio claimed in DESIGN.md §5 is exact.** All 13 rows of the
  accessibility table match computation to ±0.01 (Parchment 14.00, Coral 7.33,
  Antique Gold 9.67, Steel 7.31, Patina 7.57, Heather 7.00, Garnet 6.52, …).
- **The perceptual-evenness claim holds.** Measured OKLCH lightness of each scale
  tracks the designed curve (≈ .96/.92/.83/.72/.61/.51/.42/.34/.26/.19) within ~0.02
  per step, across all seven families. Hue drift within a family is ≤ 6°.
- **The reading band is real.** The six 300-step reading tones sit at L = 0.71–0.81
  and 6.5–9.7:1 — code genuinely renders as one fabric.
- **Hue spacing of the six reading tones** (OKLCH): 27° (Garnet) → 43° (Coral) →
  90° (Gold) → 169° (Patina) → 251° (Steel) → 332° (Heather). Good coverage of the
  wheel with the warm cluster deliberate.
- **Selection readability claim holds** for all reading tones: over Flame @ 20% every
  6.5:1+ color stays ≥ 5.3:1. (Comments dip to 3.9:1 — transient, acceptable; the
  spec wording was tightened to say exactly this.)
- **Every hex in the VS Code theme traces to a foundation scale** (plus pure-black
  shadows, now written into the contract as the sole sanctioned exception).
- **Theme ↔ token consistency** on all spot-checked critical keys (background,
  cursor, selection, ANSI mapping).
- Depth model (Soot → Char → Coal → Basalt), the four-step text hierarchy, the
  single-accent rule, and the status hue assignments are coherent and consistently
  applied across ~560 UI keys.

## 2. Findings and fixes (v0.2)

### 2.1 Readability defects

| Finding | Measured | Fix |
|---|---|---|
| **Find match (current)**: gold.400 @ 35% fill pushed matched text to 2.4–3.6:1 (comments 2.35). | worst 2.35:1 | Fill reduced to gold.400 @ 20% + solid **Antique Gold border** marks the current match. Matched text now ≥ 4.5:1 for every reading tone (comments 3.3). |
| **Find match (others)**: gold.500 @ 27% → comments 3.18. | 3.18:1 | Reduced to 20%; all reading tones ≥ 4.9:1. |
| **`button.hoverBackground` = Flame `#D34A17`**: max possible text contrast on Flame is 4.12:1 (even pure white). | 3.87:1 | Hover now **darkens** to ember.700 `#852C0C` (7.79:1) — a press affordance instead of an unreachable brightness. |
| **Ghost text (inline AI suggestions) = Dust 3.03:1** — violates the theme's own rule that Dust never carries essential info; suggestions must be read before accepting. | 3.03:1 | Smoke `#8B8378` (4.73:1). Comments are italic, ghost text is not — they stay distinguishable. |
| **Inlay hints = Dust on an ash chip** (2.77:1 effective) — parameter/type hints are real information. | 2.77:1 | Smoke (4.33:1 effective on the chip). |
| **CodeLens = Dust** — "n references" is actionable text. | 3.03:1 | Smoke. |
| **`terminal.ansiBrightBlack` = Dust (3.19:1 on Soot)** — zsh/fish render autosuggestions in brightBlack. | 3.19:1 | Smoke (4.99:1 on Soot). Token `terminal.brightBlack` → ash.400. |

### 2.2 Spec corrections (doc said one thing, physics said another)

- Ash was documented as "hue ~45°, chroma ≤ 0.012"; measured OKLCH is hue 48–79°,
  chroma up to 0.019. Wording corrected — the *design intent* (warm, unnameable) was
  always true; the numbers weren't.
- The CVD paragraph claimed Ember/Garnet are "~30° of hue and one full lightness step"
  apart; the reading tones are actually Δhue ≈ 16°, ΔL ≈ 0.03 (OKLab Δ 0.046).
  Rewritten honestly: they are near neighbours, accepted because errors never rely on
  color alone (squiggle, gutter icon, panel position).
- Selection claim retargeted to what is actually true (reading tones ≥ 5.3:1;
  comments 3.9:1 transiently).

### 2.3 CVD results (OKLab distance; ≥ 0.09 comfortable, ≥ 0.05 marginal)

| Pair | normal | protan | deutan | tritan | verdict |
|---|---|---|---|---|---|
| git added vs deleted | 0.221 | 0.119 | 0.076 | 0.283 | OK — plus shape/position cues |
| diff added vs deleted text | 0.183 | 0.098 | 0.058 | 0.234 | OK — +/- prefixes, line fills |
| warning vs error | 0.162 | 0.161 | 0.113 | 0.128 | OK |
| keyword vs function | 0.120 | 0.113 | 0.072 | 0.105 | OK |
| keyword vs error (Coral/Garnet) | 0.046 | 0.049 | 0.042 | 0.029 | accepted — never color-only |
| constant vs type (Heather/Steel) | 0.073 | 0.030 | 0.017 | 0.095 | known limit — stylistic distinction |

No **semantic** distinction in the system rides on a pair that collapses under CVD;
the two weak pairs are stylistic or always accompanied by non-color cues.

### 2.4 VS Code coverage gaps (the "default blue leaks")

Any key a theme doesn't set falls back to VS Code's built-in dark defaults — cold
blues and saturated greens that puncture Cinder's material world. v0.2 closes the
big leaks, all mapped to existing semantic tokens (~180 new keys):

- **Notebooks** (`notebook.*`) — cells on Char over a Soot canvas, Iron focus
  borders, Ember insertion indicator, status icons in Patina/Garnet/Steel.
- **Symbol icons** (`symbolIcon.*`, 33 keys) — outline & autocomplete icons now
  follow the syntax axes (functions Gold, types Steel, constants Heather, …).
- **Testing** (`testing.*`) — passed Patina, failed Garnet, queued Brass.
- **Terminal find + command decorations** — same gold search language as the
  editor; success/error command dots in Copper Oxide/Rust.
- **Debug icons** (`debugIcon.*`) — run/continue Patina, pause Brass, stop Rust,
  steps Steel.
- **3-way merge editor** (`mergeEditor.*`) — unhandled conflicts ring in Brass,
  handled in Iron.
- **Bracket pair guides** — the six bracket tones at 20% (70% when active), so
  colored guides match colored brackets.
- **Marker navigation, unicode-highlight (Brass, warning semantics), comment
  threads, sticky-scroll border, fold background, linked editing, snippet
  tabstops, list drop/filter/invalid, menu & widget borders, search editor,
  keybinding table, ports, profiles, extension badges/buttons, prominent status
  bar items.**

### 2.5 Syntax/grammar fixes

- **Python function calls** (`meta.function-call.generic.python`) were falling
  through to Parchment — now Antique Gold like every other language.
- **`=>`** was caught by `storage.type` and rendered Coral; arrows now read as
  operators (Sandstone), per "operators are silent".
- **`self` / `cls` / `this`** unified: `variable.language` (and Pylance's
  `selfParameter`/`clsParameter` semantic tokens) take the keyword voice.
- **Doc tags** (`@param`, JSDoc/JavaDoc) — Sandstone, one step above the Smoke doc
  body, so docblocks scan without shouting (new token `syntax.commentDocTag`).
- **TODO/FIXME codetags** — the spec always promised Brass bold
  (`syntax.commentTodo`); the theme never implemented it. Now wired to
  `keyword.codetag`.
- **Log/Output panel** (`token.info/warn/error/debug-token`) — status hues instead
  of defaults.
- Markdown strikethrough, `entity.name.package` (Go/Java) → Gunmetal.

### 2.6 AI chat surfaces (v0.2.1 addendum)

Validated against the official theme-color reference (fetched from
`microsoft/vscode-docs`, July 2026): of the 64 documented AI-surface keys
(`chat.*`, `inlineChat*`, `inlineEdit.*`, `interactive.*`, `gauge.*`, `radio.*`,
ghost text), the theme already covered all 15 `chat.*` keys, the complete
`inlineChat*` set and `interactive.*`. Closed in v0.2.1:

- **`inlineEdit.*` next-edit-suggestion set completed** (12 keys): changed-line and
  changed-text overlays reuse the exact diff alphas; "tab-will-accept" borders are
  Ember (accepting is a primary action); the *successful* gutter indicator is
  Copper Oxide (an applied edit became an addition); indicator borders/backgrounds
  in Ash chrome.
- **`gauge.*`** (7 keys — chat quota meters): each state pairs a family's 800
  step with its 100 step (≥ 8.7:1), chosen to stay correct whichever half the
  widget paints as fill vs. label. The status-bar quota bar itself derives from
  `editorWidget.border` + `focusBorder` (verified in `chatStatus.css` upstream),
  which Cinder already renders as Bark track + Ember fill.
- **`radio.*`** (7 keys — the chat ask/edit/agent mode picker): ordinary
  interactive chrome (Coal → Basalt hover → Bark + Iron ring active).
- `editorGhostText.background`/`.border` are left **deliberately unset** — a chip
  behind ghost text is noise; the transparent default is correct.

Cursor and Antigravity consume VS Code themes: their chat/composer panes are built
from these same keys plus generic chrome (`sideBar`, `input`, `list`, `button`,
`textLink`, `keybindingLabel`), all of which Cinder defines. Their fork-private
surfaces are not themeable by extensions; the mapping rules for those live in
DESIGN.md § "AI chat & inline-edit surfaces" so any port makes the same choices.

## 3. Known, accepted limitations

1. **Heather ↔ Steel under deuteranopia** (Δ 0.017): constants and types converge.
   Fixing it would require raising Heather's chroma beyond the "smoky" brief.
   Accepted: the distinction is navigational, not semantic.
2. **Coral ↔ Garnet** are close even for normal vision (Δ 0.046). Deliberate — both
   are the fire family. Every error surface pairs color with an icon, squiggle, or
   position.
3. **Comments dip below 4.5:1 under selection/search fills.** Transient states;
   comment base contrast (4.73) can't survive any visible warm fill.
4. **Smoke is shared by comments and ghost text** — distinguished by posture
   (italic vs upright). Terminals that force italics off lose nothing semantic.

## 4. Expansion guidance (JetBrains, Obsidian, web, terminals)

The audit validated the token layer precisely so ports stay mechanical:

- Map platform keys to `cinder.semantic.json` / `cinder.syntax.json` only; the
  contract's alpha rule keeps every composite predictable (all blends re-derivable
  from the audit script).
- Terminals: emit the ANSI 16 exactly; brightBlack **must** be Smoke (see §2.1).
- Anywhere a platform offers only one "match highlight" slot, use the *others*
  value (gold.500 @ 20%) — the border trick is editor-specific.
- Light mode does not exist yet; nothing in this audit should be mirrored
  numerically to light — the band logic (4.5–15:1) must be re-derived.
