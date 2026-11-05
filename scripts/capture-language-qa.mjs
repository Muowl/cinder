import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { root } from './build.mjs';

// Use Playwright's Chromium by default; an existing compatible binary is optional.
const executablePath = process.env.CINDER_CHROMIUM_PATH;
const browser = await chromium.launch({ headless: true, executablePath,
  args: executablePath ? ['--no-sandbox', '--single-process', '--no-zygote',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [],
});
try {
  const page = await browser.newPage({ viewport: { width: 2200, height: 1100 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'qa/languages/index.html')).href);
  await page.evaluate(() => document.fonts.ready);
  // Inspect rendered glyphs: CSS font-family alone does not detect fallback fonts.
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const { root: document } = await session.send('DOM.getDocument');
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: document.nodeId, selector: '#rust .pane:last-child code .line > span:last-child > span',
  });
  const fontUsage = await Promise.all(nodeIds.map(nodeId =>
    session.send('CSS.getPlatformFontsForNode', { nodeId })));
  const fonts = [...new Map(fontUsage.flatMap(({ fonts }) => fonts)
    .filter(font => font.glyphCount > 0)
    .map(font => [font.postScriptName, {
      family: font.familyName, postScriptName: font.postScriptName,
    }])).values()].sort((a, b) => a.postScriptName.localeCompare(b.postScriptName));
  if (!fonts.length || fonts.some(font => font.family !== 'DejaVu Sans Mono')) {
    throw new Error(`Install DejaVu Sans Mono (regular and oblique) before capturing. Rendered fonts: ${JSON.stringify(fonts)}`);
  }
  const output = path.join(root, 'qa/languages/screenshots');
  mkdirSync(output, { recursive: true });
  let captures = 0;
  for (const size of [15, 13, 18]) {
    await page.evaluate(size => document.documentElement.style.setProperty('--code-size', `${size}px`), size);
    // Keep an explicit before/after comparison at 15 px; inspect the final specimen at 13/18 px.
    if (size !== 15) await page.addStyleTag({ content:
      '.pair{grid-template-columns:1fr}.pane:first-child{display:none}.pane+.pane{border-left:0}' });
    if (size !== 15) await page.setViewportSize({ width: 1200, height: 1100 });
    for (const section of await page.locator('main section').all()) {
      const id = await section.getAttribute('id');
      const overflow = await section.locator('.pane:last-child').evaluate(e => e.scrollWidth > e.clientWidth);
      if (overflow) throw new Error(`${id}: horizontal overflow at ${size}px`);
      await section.screenshot({ path: path.join(output, `${id}-${size}px.png`) });
      captures++;
    }
  }
  writeFileSync(path.join(output, 'environment.json'), JSON.stringify({
    platform: process.platform, browser: browser.version(), fonts, captures,
    sizes: [15, 13, 18], deviceScaleFactor: 1,
  }, null, 2) + '\n');
  console.log(`${captures} specimen captures; browser ${browser.version()}; no horizontal overflow.`);
} finally {
  await browser.close();
}
