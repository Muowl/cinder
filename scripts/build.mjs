import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const read = file => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
export const tokens = new Map();
function collect(object, prefix = '') {
  for (const [key, value] of Object.entries(object)) {
    if (!value || typeof value !== 'object') continue;
    const name = prefix + key;
    if ('$value' in value) {
      if (tokens.has(name)) throw new Error(`Duplicate token: ${name}`);
      tokens.set(name, value.$value);
    } else collect(value, `${name}.`);
  }
}
for (const file of ['foundation', 'semantic', 'syntax']) collect(read(`tokens/cinder.${file}.json`));
export function resolve(value, stack = []) {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const key = value.slice(1, -1);
    if (!tokens.has(key)) throw new Error(`Unknown token: ${key}`);
    if (stack.includes(key)) throw new Error(`Cyclic token: ${[...stack, key].join(' -> ')}`);
    return resolve(tokens.get(key), [...stack, key]);
  }
  if (Array.isArray(value)) return value.map(item => resolve(item, stack));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, stack)]));
  return value;
}
export const theme = resolve(read('vscode/theme.template.json'));
export const output = JSON.stringify(theme, null, 2) + '\n';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = path.join(root, 'vscode/themes/cinder-color-theme.json');
  if (process.argv.includes('--check')) {
    if (readFileSync(target, 'utf8') !== output) throw new Error('Theme is stale. Run npm run build.');
    console.log('Generated theme is up to date.');
  } else {
    writeFileSync(target, output);
    console.log(`Built Cinder: ${Object.keys(theme.colors).length} UI colors, ${theme.tokenColors.length} syntax rules.`);
  }
}
