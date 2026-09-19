# Cinder

A warm dark design language for developer tools: readable code, quiet charcoal
surfaces and restrained ember accents. VS Code is the first release target.
Cursor's Editor Window can use the same extension; other platforms will map to
the shared semantic tokens.

- `tokens/` - foundation, interface/agent and syntax tokens.
- `vscode/theme.template.json` - VS Code adapter; edit this instead of generated hex.
- `vscode/themes/cinder-color-theme.json` - generated theme.
- [DESIGN.md](DESIGN.md) - rationale, contrast scope, compatibility and release QA.

## Build and validate

Requires Node.js 22+ (including the packaging tool). Build and contrast checks have no dependencies.

```sh
npm run build
npm run check
npm run preview
```

Open `preview/index.html` for the illustrative palette and interaction specimen.
It is not an editor screenshot or a substitute for installed-theme QA.

## Package for VS Code

```sh
npm --prefix vscode ci
npm run package
code --install-extension vscode/cinder-0.3.0.vsix
```

Choose **Cinder** under **Preferences: Color Theme**. Packaging does not publish
an extension. After installed-theme QA, publish from `vscode/` using the intended
Marketplace account. The prepublish hook rebuilds and validates tokens.
