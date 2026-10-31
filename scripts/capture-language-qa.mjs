import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
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
  console.log(`${captures} specimen captures; browser ${browser.version()}; no horizontal overflow.`);
} finally {
  await browser.close();
}
