import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { theme, resolve, root } from './build.mjs';

const c = theme.colors;
const token = name => resolve(`{${name}}`);
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const span = (role, text) => `<span style="color:${token(`syntax.${role}`)}">${escape(text)}</span>`;
const sample = [
  span('comment', '// Readable comments, including selected lines'),
  `${span('keyword', 'interface')} ${span('type', 'AgentTask')} {`,
  `  title: ${span('type', 'string')};`,
  `  completed: ${span('type', 'boolean')};`,
  '}',
  '',
  `${span('keyword', 'async function')} ${span('function', 'reviewChanges')}(task: ${span('type', 'AgentTask')}) {`,
  `  ${span('keyword', 'const')} attempts = ${span('number', '3')};`,
  `  ${span('keyword', 'const')} message = ${span('string', '"Ready for review"')};`,
  `  ${span('keyword', 'return')} ${span('function', 'summarize')}(task, message);`,
  '}',
];
const swatches = ['keyword', 'function', 'type', 'string', 'constant', 'comment'].map(role =>
  `<div class="swatch"><i style="background:${token(`syntax.${role}`)}"></i>${role}<small>${token(`syntax.${role}`)}</small></div>`).join('');
const ansi = Object.entries(c).filter(([key]) => key.startsWith('terminal.ansi')).map(([key, value]) =>
  `<span style="color:${value}">${key.replace('terminal.ansi', '')}</span>`).join(' ');
const html = `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cinder — prévia de cores</title>
<style>
:root{color-scheme:dark;font:15px/1.6 system-ui,sans-serif;color:${c.foreground};background:${c['sideBar.background']}}
*{box-sizing:border-box}body{margin:0;padding:32px;max-width:1500px;margin-inline:auto}h1{font-size:28px;margin:0}h2{font-size:15px;margin:0 0 18px}p{margin:10px 0}small,.muted{color:${token('text.muted')}}header{margin-bottom:24px}header p{max-width:880px}.palette{display:flex;gap:22px;flex-wrap:wrap;margin:24px 0}.swatch{display:grid;grid-template-columns:16px auto;gap:0 10px}.swatch i{height:14px;width:14px;border-radius:50%;margin-top:6px}.swatch small{grid-column:2;font:12px monospace}.layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr);gap:20px}.panel{background:${c['editor.background']};border:1px solid ${c['panel.border']};border-radius:10px;overflow:hidden}.bar{padding:12px 18px;background:${c['editorGroupHeader.tabsBackground']};border-bottom:1px solid ${c['panel.border']};display:flex;gap:12px;align-items:center;flex-wrap:wrap}.bar strong{color:${token('accent.primary')}}.content{padding:20px}pre,code{font:14px/1.9 Consolas,monospace}pre{margin:0;overflow:auto}.line{display:block;min-height:1.9em;padding:0 12px}.line:before{content:attr(data-line);color:${c['editorLineNumber.foreground']};display:inline-block;width:30px;user-select:none}.selected .line{background:${c['editor.selectionBackground']}}.active .line{background:${c['editor.lineHighlightBackground']}}.search .line span{background:${c['editor.findMatchBackground']};color:${c['editor.findMatchForeground']}!important}.request{padding:14px;border-radius:8px;background:${c['chat.requestBubbleBackground']};border:1px solid ${c['chat.requestBorder']}}.request:hover{background:${c['chat.requestBubbleHoverBackground']}}.status{color:${c['chat.thinkingShimmer']};margin:18px 0}.review{margin:18px 0;border:1px solid ${c['multiDiffEditor.border']};border-radius:6px;overflow:hidden}.review header{margin:0;padding:8px 12px;background:${c['multiDiffEditor.headerBackground']}}.added,.removed{padding:5px 12px;font-family:Consolas,monospace}.added{background:${c['inlineEdit.modifiedChangedLineBackground']};color:${c['chat.linesAddedForeground']}}.removed{background:${c['inlineEdit.originalChangedLineBackground']};color:${c['chat.linesRemovedForeground']}}button,select,input{font:inherit;border-radius:5px;padding:8px 12px}button{cursor:pointer;color:${c['button.foreground']};background:${c['button.background']};border:1px solid transparent}button:hover{background:${c['button.hoverBackground']}}button.secondary{background:${c['button.secondaryBackground']};color:${c['button.secondaryForeground']}}button.secondary:hover{background:${c['button.secondaryHoverBackground']}}:focus-visible{outline:2px solid ${c.focusBorder};outline-offset:3px}select,input{color:${c['input.foreground']};background:${c['input.background']};border:1px solid ${c['input.border']}}input{width:100%;margin:16px 0}input::placeholder{color:${c['input.placeholderForeground']}}.terminal{background:${c['terminal.background']};margin-top:20px}.terminal code{display:flex;flex-wrap:wrap;gap:8px 18px}.ghost{color:${c['editorGhostText.foreground']};font:14px Consolas,monospace;padding:20px}.caption{font-size:13px;margin-top:22px}@media(max-width:900px){body{padding:18px}.layout{grid-template-columns:1fr}}
</style>
<header><h1>Cinder <small>0.2</small></h1><p class="muted">Prévia ilustrativa gerada pelos tokens do tema. Não é uma captura do VS Code ou do Cursor. Use os controles e o teclado para explorar leitura, hover e foco.</p></header>
<div class="palette">${swatches}</div>
<main class="layout"><section class="panel"><div class="bar"><strong>review.ts</strong><label>Estado <select id="state"><option value="">Normal</option><option value="active">Linha ativa</option><option value="selected">Seleção</option><option value="search">Busca</option></select></label></div><div class="content"><pre id="sample">${sample.map((line, i) => `<span class="line" data-line="${i + 1}">${line}</span>`).join('')}</pre></div><div class="ghost">Sugestão: await reviewChanges(task)</div></section>
<section class="panel"><div class="bar"><strong>Agente</strong><span class="muted">Revisão de alterações</span></div><div class="content"><div class="request">Revise as alterações e preserve a legibilidade.</div><p class="status">● Aguardando revisão</p><p>As alterações estão prontas para inspeção. Confira os detalhes antes de aceitar.</p><div class="review"><header>task.ts <span class="muted">· 2 alterações</span></header><div class="removed">− const retries = 1;</div><div class="added">+ const retries = 3;</div></div><input aria-label="Mensagem para o agente" placeholder="Descreva o próximo ajuste…"><button id="accept">Aceitar alterações</button> <button class="secondary" id="reset">Revisar novamente</button><p id="feedback" class="muted" aria-live="polite">Demonstração visual; nenhum arquivo é alterado.</p></div></section></main>
<section class="panel terminal"><div class="content"><h2>Terminal · ANSI 16</h2><code>${ansi}</code><p class="muted">ANSI Black é intencionalmente escuro; programas podem usá-lo como fundo.</p></div></section>
<p class="caption muted">A experiência real depende do host, da fonte e das extensões. A janela independente de agentes do Cursor pode não usar o tema do editor.</p>
<script>document.querySelector('#state').addEventListener('change',e=>document.querySelector('#sample').className=e.target.value);document.querySelector('#accept').addEventListener('click',()=>document.querySelector('#feedback').textContent='Prévia: alterações aceitas.');document.querySelector('#reset').addEventListener('click',()=>document.querySelector('#feedback').textContent='Prévia: aguardando revisão.');</script></html>`;
const directory = path.join(root, 'preview');
mkdirSync(directory, { recursive: true });
writeFileSync(path.join(directory, 'index.html'), html);
console.log('Generated preview/index.html (illustrative specimen, not an editor screenshot).');
