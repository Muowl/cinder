// Local QA driver, launched only with --extensionDevelopmentPath.
// Reads requests from the temporary profile's configured control directory.
const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.activate = function (context) {
  const control = vscode.workspace.getConfiguration('cinderQA').get('controlDirectory');
  if (!control) return;
  fs.mkdirSync(control, { recursive: true });
  let busy = false;
  const timer = setInterval(async () => {
    const requestPath = path.join(control, 'request.json');
    if (busy || !fs.existsSync(requestPath)) return;
    busy = true;
    let request;
    try {
      request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
      fs.unlinkSync(requestPath);
      if (!vscode.workspace.isTrusted) throw new Error('Workspace trust must be granted by the person running QA');
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder || path.basename(request.file) !== request.file) throw new Error('Expected a fixture filename');
      const uri = vscode.Uri.joinPath(folder.uri, request.file);
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document, { preview: false });
      const scope = { uri, languageId: document.languageId };
      // Language defaults (notably C/C++) can override an unscoped user setting.
      await vscode.workspace.getConfiguration('editor', scope).update(
        'semanticHighlighting.enabled', request.semantic !== false, vscode.ConfigurationTarget.Global, true);
      if (request.size) await vscode.workspace.getConfiguration('editor').update('fontSize', request.size, vscode.ConfigurationTarget.Global);
      const position = new vscode.Position((request.line || 1) - 1, (request.column || 1) - 1);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
      const result = {
        file: request.file, language: document.languageId, vscode: vscode.version,
        theme: vscode.workspace.getConfiguration('workbench').get('colorTheme'),
        semanticHighlighting: vscode.workspace.getConfiguration('editor', scope).get('semanticHighlighting.enabled'),
        sourceSha256: crypto.createHash('sha256').update(document.getText()).digest('hex'),
      };
      if (request.collect) {
        const deadline = Date.now() + 90000;
        let previous = '';
        do {
          const legend = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri);
          const semantic = legend && await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri);
          if (semantic?.data?.length) {
            const current = Array.from(semantic.data).join(',');
            result.legend = legend;
            result.tokens = [];
            let line = 0, character = 0;
            for (let i = 0; i < semantic.data.length; i += 5) {
              const [deltaLine, deltaStart, length, type, bits] = semantic.data.slice(i, i + 5);
              line += deltaLine;
              character = deltaLine ? deltaStart : character + deltaStart;
              result.tokens.push({ line: line + 1, column: character + 1,
                text: document.lineAt(line).text.slice(character, character + length),
                type: legend.tokenTypes[type],
                modifiers: legend.tokenModifiers.filter((_, index) => bits & (1 << index)),
              });
            }
            if (previous === current) break;
            previous = current;
          }
          await pause(2000);
        } while (Date.now() < deadline);
        if (!result.tokens?.length) throw new Error(`No live semantic tokens for ${request.file} within 90 seconds`);
      }
      result.extensions = vscode.extensions.all.filter(extension => extension.isActive && !extension.id.startsWith('vscode.'))
        .map(extension => ({ id: extension.id, version: extension.packageJSON.version }));
      result.diagnostics = vscode.languages.getDiagnostics(uri).map(diagnostic => ({
        line: diagnostic.range.start.line + 1, severity: diagnostic.severity, message: diagnostic.message,
      }));
      if (request.inspect) await vscode.commands.executeCommand('editor.action.inspectTMScopes');
      fs.writeFileSync(path.join(control, `${request.id}.json`), JSON.stringify(result, null, 2) + '\n');
    } catch (error) {
      fs.writeFileSync(path.join(control, `${request?.id || 'error'}.json`), JSON.stringify({ error: String(error) }, null, 2));
    } finally { busy = false; }
  }, 500);
  context.subscriptions.push({ dispose: () => clearInterval(timer) });
};
