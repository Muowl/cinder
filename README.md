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

### Language QA

The additional language checks use pinned development dependencies:

```sh
npm ci
npm run check:languages
npm run qa:languages
npx playwright install chromium
npm run qa:capture
```

Open `qa/languages/index.html` for tokenized before/after specimens. The checks
cover nine grammars (Rust, C, C++, C#, Python, TypeScript, JavaScript, TSX and JSX)
and theme-side semantic selector matching. They do not run language servers.
See [the language review](qa/LANGUAGE-REVIEW.md) for findings, captures and limits.
`CINDER_CHROMIUM_PATH` can select an existing compatible Chromium binary for captures.
Install [DejaVu Sans Mono 2.37](https://dejavu-fonts.github.io/Download.html),
including its oblique variant, before capturing. The capture script checks the
rendered font and records the browser, platform and fonts in
`qa/languages/screenshots/environment.json`.
The baseline comparison needs Git history containing commit `2241d18`.

## Package for VS Code

```sh
npm --prefix vscode ci
npm run package
code --install-extension vscode/cinder-warm-theme-0.3.2.vsix
```

Choose **Cinder** under **Preferences: Color Theme**. Packaging does not publish
an extension. After installed-theme QA, publish from `vscode/` using the intended
Marketplace account. The prepublish hook rebuilds and validates tokens.
VSIX packages are local build outputs ignored by Git. Attach distributable packages
to GitHub Releases instead of committing them to the repository.
