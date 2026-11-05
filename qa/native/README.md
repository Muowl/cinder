# Revisão no VS Code instalado

O driver local coleta os tokens semânticos emitidos pelas extensões do VS Code.
Ele não cria tokens simulados e não substitui a inspeção visual do editor.
A revisão de 0.3.2 está em andamento, com tokens coletados pelo driver e
capturas fornecidas pelo usuário. Os comentários Rust foram conferidos nos
dois modos de realce. As capturas de Python e C# confirmam as correções nos
decoradores do Pylance e nos tipos semânticos específicos do servidor C#.
O [relatório de linguagens](../LANGUAGE-REVIEW.md) registra o progresso e as
verificações que ainda faltam.

## Preparação

Use um diretório temporário com perfis e extensões separados, selecionados
pelas opções `--user-data-dir` e `--extensions-dir` da CLI `code`. Instale o
VSIX gerado e os provedores de linguagem nesse ambiente. Copie os arquivos
de `qa/fixtures` para uma pasta de trabalho temporária; Rust precisa de um
`Cargo.toml` que declare `sample.rs` como biblioteca, e C# de um projeto `.csproj`.

No perfil de QA, selecione o tema `Cinder`, a fonte `DejaVu Sans Mono` e defina
`cinderQA.controlDirectory` como o caminho absoluto de um diretório temporário.
Abra o workspace com `--extensionDevelopmentPath` apontando para esta pasta
`driver`. A pessoa responsável pela revisão precisa confirmar a confiança na
pasta de exemplos antes de ativar os servidores de linguagem.

## Coleta

Grave `request.json` no diretório de controle, usando UTF-8 sem BOM:

```json
{
  "id": "rust",
  "file": "sample.rs",
  "collect": true,
  "semantic": true,
  "size": 15,
  "line": 15,
  "column": 9
}
```

O driver abre o arquivo, aguarda tokens estáveis e grava `rust.json` no mesmo
diretório. O resultado contém a versão do editor, extensões ativas, hash do
exemplo, legenda, tokens decodificados e diagnósticos. Aguarde a resposta antes
de enviar outra solicitação. Falta de tokens produz um erro após até 90 segundos
de espera entre as chamadas ao provedor; uma chamada travada pode levar mais tempo.

Use `inspect: true` para abrir o inspetor de escopos na posição indicada;
`semantic: false` permite comparar o realce TextMate. Inspecione as cores e
estilos aplicados no editor, registre capturas e confira os tokens relevantes.
Receber tokens de um servidor, sozinho, não aprova o resultado visual do tema.

O driver é uma ferramenta local de QA. Não é incluído no VSIX do tema e só
deve ser carregado no perfil temporário usado para essa revisão.
