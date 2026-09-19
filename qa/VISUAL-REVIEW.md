# Cinder 0.2.0 — revisão visual

Revisão em 18/09/2026 (America/Sao_Paulo), no VS Code Desktop 1.138.0,
Windows, com o VSIX 0.2.0 instalado em um perfil temporário. As imagens são
capturas da janela nativa do editor, não da prévia HTML. A sessão usou dados
de exemplo e uma extensão local de QA para abrir os estados da interface.
As configurações pessoais do usuário não foram alteradas.

## Parecer

O tema está visualmente adequado para uma primeira publicação no VS Code,
com a limitação de sugestões descrita abaixo. Não encontrei defeitos de cores
que bloqueiem os estados inspecionados. Fundos e superfícies mantêm a hierarquia;
comentários ficam presentes sem competir com o texto principal; busca, seleção,
tooltips e diffs preservam a leitura. Isso não equivale a certificar todas as
extensões, fontes, monitores ou necessidades de visão.

## Evidência inspecionada

| Estado | Resultado e captura |
|---|---|
| TypeScript, realce semântico | Hierarquia de sintaxe coerente; [código](screenshots/01-code.png). |
| Seleção de código/comentário | Texto legível sobre preenchimento quente; [seleção](screenshots/02-selection.png). |
| Busca | Resultados distinguíveis e texto claro; [busca](screenshots/03-find.png). |
| Tooltip de função | Superfície e contorno distinguíveis; [hover](screenshots/04-hover.png). |
| JSON | Chaves, strings e literais diferenciados; [JSON](screenshots/06-json.png). |
| Markdown fonte | Títulos, citações, links e código legíveis; [Markdown](screenshots/07-markdown.png). |
| Diff nativo | Adições/remoções discretas, apoiadas em posição e sinais +/-; [diff](screenshots/08-diff.png). |
| Terminal ANSI | Verde/ciano distintos, estados legíveis; [terminal](screenshots/09-terminal.png). O terminal pode ajustar cores por contraste mínimo. |
| Menu de seleção | Item ativo, descrição e placeholder legíveis; [menu](screenshots/10-quickpick.png). |
| Diagnósticos | Sublinhados e lista de problemas visíveis; [problemas](screenshots/11-problems.png). Os diagnósticos são exemplos injetados para QA. |
| Painel inicial do agente | Superfície, texto, input e foco coerentes; [chat](screenshots/12-chat.png). |
| Python, gramática instalada | Decoradores, strings, tipos e TODO legíveis; [Python](screenshots/13-python.png). Nenhuma extensão Python adicional foi instalada. |
| TextMate, 13 px | Leitura preservada sem realce semântico; [13 px](screenshots/14-textmate-13px.png). |
| Semântico, 18 px | Leitura e diferenciação preservadas; [18 px](screenshots/15-semantic-18px.png). |

Fonte: Consolas, normalmente 15 px. As capturas usam larguras de 1800 ou
1936 px. A barra identifica o Extension Development Host porque a extensão
local de QA opera nessa janela; o tema foi instalado a partir do VSIX.

## Achado: opacidade de sugestões com sintaxe

No VS Code 1.138.0 instalado, `editor.inlineSuggest.syntaxHighlightingEnabled`
vem ativado. A regra nativa `.ghost-text-decoration.syntax-highlighted` aplica
`opacity: .7` à sintaxe, em vez de usar diretamente `editorGhostText.foreground`.
A regra foi conferida no CSS distribuído com o editor, build
`7debcd0e2acdea1c52de81bf9ee1620444407dda`.

O comentário sugerido fica mais apagado na [configuração padrão](screenshots/05-ghost.png).
Composição teórica de Linen a 70% sobre a linha ativa: **3,75:1**. Isso não estava
representado nos testes que verificam a cor do token sem a opacidade do host.

Para quem prefere maior legibilidade às cores de sintaxe na sugestão:

```json
"editor.inlineSuggest.syntaxHighlightingEnabled": false
```

A [comparação com a cor do tema](screenshots/16-ghost-theme-color.png) foi
inspecionada. O texto passa a usar Linen diretamente, com **6,19:1** sobre a
linha ativa. A extensão não altera essa preferência global automaticamente.
A recomendação está documentada no README da extensão.

## Limites da revisão

- O chat foi verificado no estado inicial, com input e foco. Conversas em execução,
  chamadas de ferramentas, aprovações, sessões com histórico e next-edit completions
  não foram exercitados com um provedor de IA configurado.
- A sugestão inline foi fornecida por um provedor local de QA, não por um modelo.
- O diff é o comparador nativo de arquivos; não é uma sessão de revisão de agente.
- Cursor, fontes alternativas e simulações de daltonismo não foram avaliados aqui.
- Os 742 testes automatizados validam as combinações definidas, não todas as
  transformações aplicadas em tempo de execução pelo editor.

O publisher foi confirmado pelo proprietário. Esta revisão não publica a extensão.
