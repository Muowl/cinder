# Changelog

## 0.2.0 — 2026-07-16

Full computed color audit of the design language and theme (see `AUDIT.md` at the
repo root). Highlights:

- **Readability fixes**: find-match now marks the current hit with an Antique Gold
  border over a lighter fill (matched text stays ≥ 4.5:1; was as low as 2.35:1);
  ghost text, inlay hints and CodeLens raised from Dust (3.0:1) to Smoke (4.7:1);
  `terminal.ansiBrightBlack` raised to Smoke so zsh/fish autosuggestions are
  readable; button hover now darkens (Flame could never reach 4.5:1 with light text)
- **Coverage**: ~180 new workbench keys so VS Code's blue defaults never leak
  through — notebooks, symbol icons, testing, terminal find/command decorations,
  debug icons, 3-way merge editor, bracket-pair guides, marker navigation,
  unicode highlight, comment threads, fold/linked-editing/snippets, search editor,
  keybinding table, ports, profiles, extension badges
- **Syntax**: Python function calls now Antique Gold; `=>` reads as an operator;
  `self`/`cls`/`this` take the keyword voice; JSDoc/JavaDoc tags in Sandstone;
  TODO/FIXME codetags in Brass bold (finally implementing `syntax.commentTodo`);
  Output-panel log levels in status hues; Markdown strikethrough

## 0.1.2 — 2026-07-07

- Extension icon: the Cinder "C" monogram with Verdigris/Ember chromatic aberration
- Publisher metadata aligned to `muowl` (repository, homepage, gallery banner)

## 0.1.1 — 2026-07-07

- Lighter editor background: Char `#151312` → `#1A1817`, with the whole dark ramp
  (Soot, Coal, Basalt) shifted to preserve depth hierarchy
- Sandstone and Smoke nudged to keep the documented contrast floors (7:1 / 4.5:1)
- Full theming for the chat/agent UI, inline chat, ghost text, inline edits,
  multi-diff review and command center

## 0.1.0 — 2026-07-07

- Initial release: workbench, TextMate and semantic token colors implementing the
  Cinder design language
