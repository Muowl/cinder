# Cinder

A warm, cinematic design language for developer tools — burning embers, antique gold,
oxidized copper — tempered for long coding sessions.

- **`DESIGN.md`** — the design language specification (families, semantic tokens, syntax system, accessibility, rationale).
- **`AUDIT.md`** — the computed color audit (contrast, OKLCH, alpha composites, CVD simulation) behind v0.2.
- **`tokens/`** — platform-agnostic design tokens (source of truth).
- **`vscode/`** — the VS Code / Cursor theme, first implementation of the system.

Planned surfaces: JetBrains IDEs, terminals, Obsidian, web and desktop applications —
all bound to the same semantic tokens.

## Try the VS Code theme

```
cd vscode
npm run package
code --install-extension cinder-0.2.0.vsix   # or: cursor --install-extension ...
```

Or for development: open `vscode/` in VS Code and press `F5` (Extension Development Host),
then select **Cinder** in `Preferences: Color Theme`.
