# Cinder design language

Version 0.3 - dark - September 2026.

Cinder pairs warm charcoal with coral, antique gold, copper green, steel blue
and muted mauve. VS Code is the first release target; other platforms should
consume the same semantic tokens.

## Principles

- Keep variables neutral and reserve color for structure and meaning.
- Ember is the attention accent, not necessarily the most saturated pixel.
- Validate text on its actual background, including interaction overlays.
- Distinguish decorative separators from control and focus indicators.
- Preserve icons, labels, position and +/- markers alongside status colors.
- Reading comfort is a design goal, not a medical guarantee.

## Palette and reading

| Role | Hex | Use |
|---|---|---|
| Soot | `#141211` | Chrome and terminal |
| Char | `#1A1817` | Editor |
| Coal | `#221F1C` | Elevated surfaces |
| Basalt | `#2B2723` | Overlays and requests |
| Parchment | `#EAE4DB` | Prose and variables |
| Sandstone | `#ABA399` | Secondary text and operators |
| Linen | `#A69E93` | Comments, punctuation, hints |
| Smoke | `#8B8378` | Input boundaries |
| Dust | `#6B6459` | Disabled controls |
| Ember | `#E26A38` | Focus and cursor |
| Coral | `#EC8F68` | Keywords |
| Antique Gold | `#DFBC59` | Functions and warnings |
| Patina | `#7DB5A0` | Strings, regex, success |
| Steel | `#92A9C2` | Types, namespaces, links |
| Heather | `#BE97B8` | Literal values |
| Garnet | `#E58177` | Errors |

Foundation steps are curated sRGB values, not a uniform OKLCH scale. Hue and
chroma vary by step. Linen adds reading margin without changing dark surfaces.
Dedicated ANSI cyan tones (`#78B5BC`, `#A5D2D6`) shift toward blue to improve
distinction from green; string and success colors retain their copper identity.

Primary text has 14.00:1 contrast on Char. Comments have 6.68:1 on Char and
5.05:1 on the active line with the 20% Ember selection composited over it.
Namespaces and regex use the same readable steps as types and strings.

Primary buttons use Ember 700 at rest and Ember 600 on hover, with Garnet 50
text: 7.79:1 and 5.47:1. Search results explicitly use Parchment text; the current
match has a gold outline. Peek matches use a lower-alpha fill instead.
CodeLens, hints and ghost text use `text.auxiliary`, never `text.disabled`.
Unused code retains full opacity. Focus uses Ember; checkbox boundaries use
Linen. Decorative pane separators remain quiet.

## Agents

Platform-neutral `agent.*` roles cover requests, working status, pending edits,
additions/removals, focus, badges and review backgrounds. The VS Code adapter
covers chat, inline chat, agent sessions, customization management, next-edit
suggestions, Tab-to-accept borders, successful gutter indicators, minimap markers
and multi-file diffs. Gold marks work in progress; Ember marks focus. Removal
labels on elevated surfaces use Garnet 200 for sufficient contrast. Review fills
stay translucent. Status must also be conveyed by the host's text or icons.

Cursor's Editor Window inherits VS Code theming. Its separate Agents Window
can use another theme engine. This extension does not inject CSS or promise
coverage of private surfaces. Older hosts may ignore newer color IDs.

## Syntax

Shared TextMate and semantic categories use consistent colors. Documentation
comments are upright where the grammar/provider allows; semantic providers can
still override style. Italics are refinements, not a reading requirement.
TODO/FIXME/HACK highlighting depends on grammar-provided task scopes: a theme
cannot detect arbitrary words. Regex anchors consistently use Glow.

## Generation and portability

1. `tokens/cinder.foundation.json` owns base colors and compositing black.
2. `tokens/cinder.semantic.json` owns interface, terminal and agent roles.
3. `tokens/cinder.syntax.json` owns syntax and language roles.
4. `vscode/theme.template.json` maps host keys to named tokens.
5. `npm run build` generates `vscode/themes/cinder-color-theme.json`.

Do not hand-edit the generated theme or add raw hex to the adapter. Alpha values
are named semantic tokens based on foundation RGB. Future adapters reuse roles
and document unsupported features. `npm run check` validates references, palette
membership, generated-file drift, syntax consistency and defined contrast pairs.
`npm run preview` creates an illustrative HTML specimen from the actual tokens.

## Accessibility scope and release QA

The automated matrix uses WCAG 2.x relative luminance: 4.5:1 for tested reading
pairs, 3:1 for tested control/focus indicators. It includes editor, active line,
hover, selection, selection over active line, inactive selection, layered added
and removed review backgrounds, buttons, search, hints, agent text and ANSI.
ANSI black is excluded from the text floor because applications can use it as a
dark background or explicitly request black text. Disabled controls and decorative
separators have different roles from reading content. This is not certification
of all editor states, extensions, arbitrary overlay stacks or terminal programs.

Do not infer color-vision-deficiency support from hue spacing. Garnet 300 and
Patina 300 have similar OKLCH lightness (about 0.710 and 0.728); labels and +/-
markers remain necessary. Protanopia, deuteranopia and tritanopia simulation and
user evaluation remain release QA tasks, not completed accessibility claims.

Before publication, inspect the installed theme with TypeScript, Python, JSON,
Markdown, ANSI output, keyboard focus, search, selections, tool confirmations,
agent sessions and multi-file review. Check semantic highlighting on/off and
multiple font sizes. The HTML preview is not an editor screenshot. Automated
checks do not establish subjective comfort or host-specific rendering correctness.

The first native desktop review is recorded in
[qa/VISUAL-REVIEW.md](qa/VISUAL-REVIEW.md), including actual screenshots.
VS Code 1.138 adds 70% opacity to syntax-highlighted ghost text; its rendered
contrast is therefore lower than a direct token-only check. Users can disable
`editor.inlineSuggest.syntaxHighlightingEnabled` to use the theme's ghost-text
color directly. This is an optional preference, not an extension-wide override.

References: [VS Code colors](https://code.visualstudio.com/api/references/theme-color),
[WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
[Cursor themes](https://docs.cursor.com/en/configuration/themes).
