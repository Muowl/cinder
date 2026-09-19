import assert from 'node:assert/strict';
import { theme, tokens, resolve, read } from './build.mjs';

export const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
export function composite(front, back) {
  const alpha = front.length === 9 ? parseInt(front.slice(7), 16) / 255 : 1;
  const background = typeof back === 'string' ? rgb(back) : back;
  return rgb(front).map((v, i) => v * alpha + background[i] * (1 - alpha));
}
export function contrast(front, back) {
  const luminance = value => (typeof value === 'string' ? rgb(value) : value)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const a = luminance(front), b = luminance(back);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const c = theme.colors;
let checks = 0;
const failures = [];
function check(label, foreground, background, minimum = 4.5) {
  const value = contrast(foreground, background);
  checks++;
  if (value < minimum) failures.push(`${label}: ${value.toFixed(3)} < ${minimum}`);
  return value;
}
// Reference values protect the math from accidental changes.
assert.equal(contrast('#000000', '#FFFFFF'), 21);
assert.equal(contrast('#123456', '#123456'), 1);
assert.deepEqual(composite('#FFFFFF00', '#123456'), rgb('#123456'));
for (const [key, value] of tokens) assert.match(resolve(value), /^#[0-9A-F]{6}([0-9A-F]{2})?$/, key);
const foundation = new Set([...tokens].filter(([key]) => key.startsWith('color.')).map(([, value]) => value));
for (const [key, value] of tokens) assert(foundation.has(resolve(value).slice(0, 7)), `${key} is outside the foundation palette`);
const template = read('vscode/theme.template.json');
for (const [key, value] of Object.entries(template.colors)) {
  assert.match(value, /^\{(?!color\.).+\}$/, `${key} must reference a semantic token`);
}
const surfaces = {
  editor: c['editor.background'],
  activeLine: c['editor.lineHighlightBackground'],
  hover: c['editorHoverWidget.background'],
  selection: composite(c['editor.selectionBackground'], c['editor.background']),
  selectedActiveLine: composite(c['editor.selectionBackground'], c['editor.lineHighlightBackground']),
  inactiveSelection: composite(c['editor.inactiveSelectionBackground'], c['editor.background']),
  addedReview: composite(c['inlineEdit.modifiedChangedTextBackground'], composite(c['inlineEdit.modifiedChangedLineBackground'], c['inlineEdit.modifiedBackground'])),
  removedReview: composite(c['inlineEdit.originalChangedTextBackground'], composite(c['inlineEdit.originalChangedLineBackground'], c['inlineEdit.originalBackground'])),
};
for (const rule of theme.tokenColors) {
  if (rule.scope.includes('meta.separator.markdown')) continue; // Decorative horizontal rule.
  for (const [surface, bg] of Object.entries(surfaces)) check(`${rule.name} / ${surface}`, rule.settings.foreground, bg);
}
for (const [key, style] of Object.entries(theme.semanticTokenColors)) {
  const foreground = typeof style === 'string' ? style : style.foreground;
  if (foreground) for (const [surface, bg] of Object.entries(surfaces)) check(`semantic ${key} / ${surface}`, foreground, bg);
}
const pairs = [
  ['button.foreground', 'button.background'], ['button.foreground', 'button.hoverBackground'],
  ['button.secondaryForeground', 'button.secondaryHoverBackground'],
  ['input.placeholderForeground', 'input.background'], ['inlineChatInput.placeholderForeground', 'inlineChatInput.background'],
  ['editorCodeLens.foreground', 'editor.background'], ['editorGhostText.foreground', 'editor.lineHighlightBackground'],
  ['list.activeSelectionForeground', 'list.activeSelectionBackground'],
  ['chat.linesAddedForeground', 'chat.requestBubbleHoverBackground'], ['chat.linesRemovedForeground', 'chat.requestBubbleHoverBackground'],
  ['chat.slashCommandForeground', 'chat.requestBubbleBackground'],
  ['chat.thinkingShimmer', 'panel.background'], ['inlineChat.foreground', 'inlineChat.background'],
  ['agentSessionReadIndicator.foreground', 'list.activeSelectionBackground'],
  ['inlineEdit.gutterIndicator.primaryForeground', 'inlineEdit.gutterIndicator.primaryBackground'],
  ['inlineEdit.gutterIndicator.successfulForeground', 'inlineEdit.gutterIndicator.successfulBackground'],
];
for (const [fg, bg] of pairs) check(`${fg} / ${bg}`, c[fg], c[bg]);
check('Inlay hints', c['editorInlayHint.foreground'], composite(c['editorInlayHint.background'], c['editor.background']));
for (const bg of ['editor.background', 'editor.lineHighlightBackground']) {
  for (const [fg, fill] of [['editor.findMatchForeground', 'editor.findMatchBackground'], ['editor.findMatchHighlightForeground', 'editor.findMatchHighlightBackground']]) {
    check(`${fg} / ${bg}`, c[fg], composite(c[fill], c[bg]));
  }
}
for (const [fg, bg] of [['list.focusOutline', 'list.focusBackground'], ['checkbox.border', 'checkbox.background'], ['checkbox.selectBorder', 'list.activeSelectionBackground'], ['input.border', 'input.background'], ['input.border', 'editorWidget.background']]) {
  check(`${fg} / ${bg}`, c[fg], c[bg], 3);
}
for (const [key, value] of Object.entries(c)) {
  if (key.startsWith('terminal.ansi') && key !== 'terminal.ansiBlack') check(key, value, c['terminal.background']);
  if (key.startsWith('gitDecoration.')) {
    check(key, value, c['sideBar.background']);
    check(`${key} selected`, value, c['list.activeSelectionBackground']);
  }
}
check('Terminal selected text', c['terminal.selectionForeground'], composite(c['terminal.selectionBackground'], c['terminal.background']));
for (const [semantic, index] of [['comment', 0], ['namespace', 11], ['regexp', 17]]) {
  const value = theme.semanticTokenColors[semantic];
  assert.equal(typeof value === 'string' ? value : value.foreground, theme.tokenColors[index].settings.foreground);
}
assert.equal(theme.tokenColors[59].settings.foreground, resolve('{language.regexDetail.anchor}'));
console.log(`${checks} contrast checks. ${tokens.size} resolved tokens. ANSI black excluded: intended dark ANSI background slot.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All tested reading pairs >= 4.5:1; tested focus/control boundaries >= 3:1.');
  for (const [name, fg, bg] of [
    ['Comments', resolve('{syntax.comment}'), c['editor.background']],
    ['Comments, active-line selection', resolve('{syntax.comment}'), surfaces.selectedActiveLine],
    ['Primary button hover', c['button.foreground'], c['button.hoverBackground']],
    ['Search match', c['editor.findMatchForeground'], composite(c['editor.findMatchBackground'], c['editor.background'])],
  ]) console.log(`${name}: ${contrast(fg, bg).toFixed(2)}:1`);
}
