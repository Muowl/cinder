import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createHighlighter } from 'shiki';
import { theme, root, resolve, read } from './build.mjs';

// Real TextMate tokenization through Shiki's Oniguruma engine. No hand-colored spans.
const languages = [
  ['rust', 'rs', 'Rust'], ['c', 'c', 'C'], ['cpp', 'cpp', 'C++'],
  ['csharp', 'cs', 'C#'], ['python', 'py', 'Python'],
  ['typescript', 'ts', 'TypeScript'], ['javascript', 'js', 'JavaScript'],
  ['tsx', 'tsx', 'TSX'], ['jsx', 'jsx', 'JSX'],
];
const baselineRef = '2241d180fe5067b90710e34b2d1cc3f9c69bafec';
const beforeTheme = JSON.parse(execFileSync('git', [
  'show', `${baselineRef}:vscode/themes/cinder-color-theme.json`,
], { cwd: root, encoding: 'utf8' }));
const h = await createHighlighter({
  themes: [{ ...theme, name: 'cinder' }, { ...beforeTheme, name: 'before' }],
  langs: languages.map(([id]) => id),
});
const specimens = languages.map(([id, ext, title]) => {
  const code = readFileSync(path.join(root, `qa/fixtures/sample.${ext}`), 'utf8').trimEnd();
  return { id, ext, title, code,
    before: h.codeToTokens(code, { lang: id, theme: 'before', includeExplanation: true }).tokens,
    after: h.codeToTokens(code, { lang: id, theme: 'cinder', includeExplanation: true }).tokens,
  };
});

const cases = read('qa/language-cases.json');
const results = [];
for (const { lang, line: context, needle, role, italic } of cases) {
  const specimen = specimens.find(s => s.id === lang);
  assert(specimen, `Unknown fixture: ${lang}`);
  const lines = specimen.code.split('\n');
  const matchingLines = lines.flatMap((line, i) => line.includes(context) ? [i] : []);
  assert.equal(matchingLines.length, 1, `Ambiguous context: ${lang} / ${context}`);
  const index = matchingLines[0], line = lines[index];
  const from = line.indexOf(needle), to = from + needle.length;
  assert(from >= 0, `Missing target: ${lang} / ${needle}`);
  function inspect(tokens) {
    let col = 0;
    const overlaps = tokens[index].filter(token => {
      const start = col; col += token.content.length;
      return col > from && start < to && token.content.trim();
    });
    assert(overlaps.length, `No tokens: ${lang} / ${needle}`);
    return {
      pass: overlaps.every(t => t.color.toUpperCase() === resolve(`{${role}}`)
        && (italic === undefined || Boolean(t.fontStyle & 1) === italic)),
      colors: [...new Set(overlaps.map(t => t.color))],
      fontStyles: [...new Set(overlaps.map(t => t.fontStyle))],
      scopes: [...new Set(overlaps.flatMap(t => (t.explanation || [])
        .map(e => e.scopes.map(s => s.scopeName).join(' > '))))],
    };
  }
  results.push({ lang, line: index + 1, needle, role, italic,
    before: inspect(specimen.before), after: inspect(specimen.after) });
}

// Theme-side semantic selector checks, NOT language-server executions.
// VS Code matching: exact type 100, ancestor 100-depth, language +10,
// modifier +100 each; each style property is resolved independently.
// Source: microsoft/vscode tokenClassificationRegistry.ts and colorThemeData.ts.
const ra = read('qa/rust-analyzer-tokens.json');
const superTypes = new Map(ra.types.map(t => [t.id, t.superType]));
function semanticStyle(tokens, type, modifiers, language) {
  const hierarchy = [type];
  if (language === 'rust') {
    while (superTypes.get(hierarchy.at(-1))) hierarchy.push(superTypes.get(hierarchy.at(-1)));
  }
  const style = {}, scores = {};
  for (const [selector, value] of Object.entries(tokens)) {
    const [classifier, selectorLang] = selector.split(':');
    const [selectorType, ...required] = classifier.split('.');
    const level = hierarchy.indexOf(selectorType);
    if ((selectorLang && selectorLang !== language)
      || (selectorType !== '*' && level < 0)
      || !required.every(m => modifiers.includes(m))) continue;
    const score = (selectorType === '*' ? 0 : 100 - level)
      + (selectorLang ? 10 : 0) + required.length * 100;
    for (const [key, val] of Object.entries(typeof value === 'string' ? { foreground: value } : value)) {
      if ((scores[key] ?? -1) <= score) { scores[key] = score; style[key] = val; }
    }
  }
  return style;
}
const semanticCases = [
  ...languages.slice(0, 7).flatMap(([lang]) => [
    ['type', [], lang, 'syntax.type'], ['function', [], lang, 'syntax.function'],
    ['variable', [], lang, 'syntax.variable'], ['parameter', [], lang, 'syntax.parameter', true],
    ['enumMember', [], lang, 'syntax.constant'], ['string', [], lang, 'syntax.string'],
    ['comment', ['documentation'], lang, 'syntax.commentDoc', false],
    ['method', ['static', 'deprecated'], lang, 'syntax.method', true],
  ]),
  ['boolean', [], 'rust', 'syntax.boolean'],
  ['builtinType', [], 'rust', 'syntax.type'],
  ['selfTypeKeyword', [], 'rust', 'syntax.type'],
  ['attribute', [], 'rust', 'syntax.decorator', true],
  ['builtinAttribute', [], 'rust', 'syntax.decorator', true],
  ['derive', [], 'rust', 'syntax.decorator', true],
  ['deriveHelper', [], 'rust', 'syntax.decorator', true],
  ['lifetime', [], 'rust', 'syntax.type', true],
  ['constParameter', [], 'rust', 'syntax.constant'],
  ['const', [], 'rust', 'syntax.constant'],
  ['escapeSequence', [], 'rust', 'syntax.stringEscape'],
  ['formatSpecifier', [], 'rust', 'syntax.stringEscape'],
  ['invalidEscapeSequence', [], 'rust', 'syntax.invalid'],
  ['brace', [], 'rust', 'syntax.punctuation'],
  ['macro', [], 'rust', 'syntax.decorator', true],
  ['procMacro', [], 'rust', 'syntax.decorator', true],
  ['arithmetic', [], 'rust', 'syntax.operator'],
  ['selfKeyword', [], 'rust', 'syntax.keyword'],
  // Captured from Pylance 2026.4.1 in the installed VS Code QA profile.
  ['class', ['decorator', 'builtin'], 'python', 'syntax.decorator', true],
  ['function', ['decorator', 'library'], 'python', 'syntax.decorator', true],
  ['class', ['builtin'], 'python', 'syntax.type'],
  ['function', ['library'], 'python', 'syntax.function'],
  ['class', ['decorator'], 'typescript', 'syntax.type'],
];
const semanticResults = semanticCases.map(([type, modifiers, lang, role, italic]) => {
  function inspect(t) {
    const style = semanticStyle(t.semanticTokenColors, type, modifiers, lang);
    return { pass: style.foreground === resolve(`{${role}}`)
      && (italic === undefined || style.italic === italic)
      && (!modifiers.includes('deprecated') || style.strikethrough === true), style };
  }
  return { type, modifiers, lang, role, italic, before: inspect(beforeTheme), after: inspect(theme) };
});
const failed = results.filter(r => !r.after.pass);
const failedSemantic = semanticResults.filter(r => !r.after.pass);
console.log(`${results.length} TextMate probes across ${specimens.length} grammars; ${failed.length} failures.`);
console.log(`${semanticResults.length} semantic selector probes (no live LSP); ${failedSemantic.length} failures.`);
const repaired = results.filter(r => !r.before.pass && r.after.pass);
const repairedSemantic = semanticResults.filter(r => !r.before.pass && r.after.pass);
console.log(`${repaired.length} TextMate and ${repairedSemantic.length} semantic probes repaired versus ${baselineRef.slice(0, 7)}.`);
for (const r of failed) console.error(`${r.lang}:${r.line} ${r.needle}: expected ${r.role}, got ${r.after.colors} / styles ${r.after.fontStyles}`);
for (const r of failedSemantic) console.error(`semantic ${r.lang} ${r.type}: ${JSON.stringify(r.after.style)}`);

if (process.argv.includes('--write')) {
  mkdirSync(path.join(root, 'qa/languages'), { recursive: true });
  const esc = s => String(s).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function pane(s, state) {
    return `<div class="pane"><div class="pane-label">${state === 'before' ? 'Antes · 0.3.1' : 'Após correções'}</div><pre><code>${s[state].map((line, index) => `<div class="line"><span class="number">${index + 1}</span><span>${line.map(t => `<span style="color:${t.color};${t.fontStyle & 1 ? 'font-style:italic;' : ''}${t.fontStyle & 2 ? 'font-weight:700;' : ''}${t.fontStyle & 4 ? 'text-decoration:underline;' : ''}">${esc(t.content)}</span>`).join('')}</span></div>`).join('')}</code></pre></div>`;
  }
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cinder · Validação de linguagens</title><style>
  *{box-sizing:border-box}body{margin:0;background:${theme.colors['editor.background']};color:${theme.colors['editor.foreground']};font:14px system-ui}header{padding:24px 32px;background:${theme.colors['sideBar.background']}}h1{font-size:25px;margin:0 0 8px;color:${resolve('{syntax.keyword}')}}p{margin:8px 0;line-height:1.5;max-width:1100px}nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px}a{color:${resolve('{syntax.type}')}}main{padding:16px 24px}section{margin:16px 0 30px;border:1px solid ${theme.colors['editor.lineHighlightBackground']};break-inside:avoid}h2{font-size:17px;margin:0;padding:14px 18px;background:${theme.colors['sideBar.background']}}.pair{display:grid;grid-template-columns:1fr 1fr}.pane{min-width:0;overflow:auto}.pane+.pane{border-left:1px solid ${theme.colors['editor.lineHighlightBackground']}}.pane-label{padding:9px 16px;color:${resolve('{syntax.comment}')}}pre{font:var(--code-size,15px)/1.6 "DejaVu Sans Mono",monospace;margin:0;padding:12px 14px 18px;tab-size:4}code{font:inherit}.line{display:flex;white-space:pre;min-height:1.6em}.number{min-width:3ch;text-align:right;margin-right:2ch;color:${resolve('{syntax.comment}')}}.legend{display:flex;flex-wrap:wrap;gap:20px;margin-top:14px}.legend span{font-family:monospace}footer{padding:0 32px 32px;color:${resolve('{syntax.comment}')}}
  </style><header><h1>Cinder · Validação de linguagens</h1><p>Gramáticas TextMate reais com Shiki 4.5.0 / Oniguruma. Comparação com o commit ${baselineRef.slice(0, 7)}. Estas são renderizações de código, não capturas do VS Code instalado.</p><p>${results.length} verificações de sintaxe; ${semanticResults.length} verificações de seletores semânticos. Servidores de linguagem e preferências pessoais não são executados nesta página.</p><div class="legend">${[['keyword','Palavras-chave'],['type','Tipos'],['function','Funções'],['string','Strings'],['constant','Literais'],['comment','Comentários']].map(([role,label]) => `<span style="color:${resolve(`{syntax.${role}}`)}">${label}</span>`).join('')}</div><nav>${specimens.map(s => `<a href="#${s.id}">${s.title}</a>`).join('')}</nav></header><main>${specimens.map(s => `<section id="${s.id}"><h2>${s.title} · sample.${s.ext}</h2><div class="pair">${pane(s,'before')}${pane(s,'after')}</div></section>`).join('')}</main><footer>Os tipos que a gramática não identifica dependem do provedor semântico. Os exemplos exercitam sintaxe; não são aplicações de produção.</footer></html>`;
  writeFileSync(path.join(root, 'qa/languages/index.html'), html);
  writeFileSync(path.join(root, 'qa/languages/results.json'), JSON.stringify({
    baselineRef, shikiVersion: '4.5.0', semanticMethod: 'Theme selector model; no live language servers',
    textmate: results, semantic: semanticResults,
  }, null, 2) + '\n');
  console.log('Wrote qa/languages/index.html and results.json.');
}
h.dispose();
if (failed.length || failedSemantic.length) process.exitCode = 1;
