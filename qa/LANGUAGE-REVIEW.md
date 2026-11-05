# Cinder 0.3.2 — validação de linguagens

Revisão de 31/10/2026; capturas atualizadas em 04/11/2026 (America/Sao_Paulo).
Base: Cinder 0.3.1,
commit `2241d180fe5067b90710e34b2d1cc3f9c69bafec`.

## Parecer

As amostras revisadas preservam a leitura e a hierarquia de cores do Cinder.
Havia lacunas de mapeamento em C/C++, C#, Python e Rust; foram corrigidas sem
alterar a paleta, os fundos ou as cores de interface. TypeScript e JavaScript
mantiveram o comportamento esperado nas amostras, incluindo TSX/JSX, regex,
templates, async/await, genéricos e campos privados.

Esta etapa aprova as amostras tokenizadas e as regras semânticas testadas.
Não certifica um resultado perfeito para toda construção ou extensão: a validação
integrada com os servidores de linguagem ainda não foi concluída.
O pacote 0.3.2 foi gerado para essa verificação posterior, sem publicação no Marketplace.

## Achados e correções

| Linguagem | Achado e comportamento após o ajuste | Comparação visual |
|---|---|---|
| Rust | `derive` ganha Brass; macros seguem o papel de metadados; lifetimes usam Steel em itálico. Seletores próprios do rust-analyzer cobrem booleanos, atributos, `Self`, constantes, escapes, formatação e pontuação. Operadores preservam Sandstone apesar da herança de pontuação do provedor. Comentários `///` ficam sem itálico também sem o rust-analyzer. | [Antes/depois](languages/screenshots/rust-15px.png) |
| C | `char`, `bool`, `int`, `void` e `size_t` deixam Coral e passam a Steel. Definições de macros usam Brass. Delimitadores de comentários de documentação ficam sem itálico. | [Antes/depois](languages/screenshots/c-15px.png) |
| C++ | Tipos básicos e retornos de lambdas passam a Steel; `[[nodiscard]]` recebe Brass. Definições de macros seguem o papel de metadados. Documentação `///` fica sem itálico quando a gramática a distingue. | [Antes/depois](languages/screenshots/cpp-15px.png) |
| C# | Membros de enum recebem Heather; parâmetros recebem o mesmo itálico das outras linguagens; chaves de interpolação recebem Glow. O marcador `///` acompanha o estilo sem itálico da documentação. | [Antes/depois](languages/screenshots/csharp-15px.png) |
| Python | Chamadas como `append`, `field` e `TypeVar` passam a Antique Gold. `@property` e o `@` acompanham os decoradores em Brass. Delimitadores e formato de f-strings passam a Glow. | [Antes/depois](languages/screenshots/python-15px.png) |
| TypeScript | Mantidos os papéis de classes, interfaces, funções, tipos básicos, constantes, regex e interpolação. Ajustado o marcador de documentação junto à regra compartilhada. | [Antes/depois](languages/screenshots/typescript-15px.png) |
| JavaScript | Mantidos os papéis de funções, constantes, campos privados, regex e interpolação. Ajustado o marcador de documentação junto à regra compartilhada. | [Antes/depois](languages/screenshots/javascript-15px.png) |
| TSX / JSX | Tags, atributos, entidades, texto e expressões JavaScript/TypeScript permanecem separados. Sem regressão nos alvos testados. | [TSX](languages/screenshots/tsx-15px.png), [JSX](languages/screenshots/jsx-15px.png) |

## Método e evidências

- **106 verificações TextMate**, usando Shiki 4.5.0 com Oniguruma e nove gramáticas
  fixadas no lockfile. Cada verificação identifica um trecho do arquivo de exemplo
  e confere a cor efetivamente produzida e, quando pertinente, o itálico.
- **93 verificações de seletores semânticos**, com tipos comuns às sete linguagens,
  tipos personalizados do rust-analyzer e C# e modificadores de decoradores do Pylance.
  O modelo reproduz a pontuação de
  seletores, a herança de tipos e a resolução independente de propriedades do
  VS Code. Não executa um servidor de linguagem nem reproduz todo o serviço de temas.
- **966 verificações de contraste**: mínimo de 4,5:1 para os pares de leitura
  definidos e de 3:1 para os indicadores testados. Comentários: 6,68:1 no editor
  e 5,05:1 sobre a seleção da linha ativa. Os limites já descritos em
  [DESIGN.md](../DESIGN.md) continuam aplicáveis.
- **27 capturas de espécimes**, nas nove gramáticas com 13, 15 e 18 px, renderizadas
  em Windows com Chromium 151.0.7922.34 e DejaVu Sans Mono 2.37. A geração confere
  a fonte usada nos glifos de Rust e registra o [ambiente](languages/screenshots/environment.json).
  Também verifica ausência
  de rolagem horizontal. Foram inspecionados os nove comparativos em 15 px e
  amostras densas de Rust/Python em 13 px e C++/C# em 18 px.
- **Pacote VSIX 0.3.2** gerado com o hook de build/validação.

Os testes passam após as correções. Na mesma matriz, a versão base falhava em
29 alvos TextMate e 37 alvos semânticos. São alvos de teste afetados, não uma
contagem de defeitos independentes.

[Resultados com cores, estilos e escopos](languages/results.json) ·
[Comparativo HTML](languages/index.html) ·
[Arquivos de exemplo](fixtures/) ·
[Matriz de alvos](language-cases.json).

As imagens são renderizações dos tokens produzidos pelas gramáticas, não
capturas do editor instalado. A [revisão nativa anterior](VISUAL-REVIEW.md)
tem outro ambiente e outro escopo; ela não substitui esta evidência nem constitui
uma validação nativa da versão 0.3.2.

## O que depende do editor e da extensão

O tema recebe classificações de sintaxe; ele não identifica nomes pelo texto.
Isso deixa limites concretos nas gramáticas básicas testadas:

- A gramática de C não distingue todos os nomes de `typedef` e membros de enum.
- A gramática de C++ usada no espécime não classifica `requires` como palavra-chave
  e não identifica toda chamada de macro como macro. Não foi criada uma regra
  que pintaria chamadas comuns incorretamente para contornar isso.
- Em Rust, a gramática básica usa o mesmo escopo para `self` e `Self` e não
  distingue o comentário `//!` do comentário comum. Os papéis próprios do
  rust-analyzer permitem uma classificação mais precisa quando disponíveis.
- Python não classifica todos os tipos personalizados e nomes de tipos em
  subscritos como `list[T]` sem assistência semântica. Docstrings continuam
  com a cor de string porque a gramática as emite assim.
- Em C#, o atributo `Obsolete` é classificado como tipo pela gramática testada;
  por isso mantém Steel. Pintar todos os tipos como decoradores prejudicaria o restante.
- Com o servidor C# 2.160.4, `int` e `bool` chegam como `keyword`, sem indicação
  de tipo básico, e usam Coral. As chaves de interpolação chegam como
  `punctuation`, assim como a pontuação comum: a regra TextMate de Glow não
  garante a mesma cor com esse provedor. Não foram criadas regras amplas que
  mudariam todas as palavras-chave ou toda a pontuação para contornar esses casos.

Os testes automatizados de seletores modelam regras do tema; eles não executam
servidores de linguagem. A revisão integrada começou em 04/11/2026 no VS Code
1.144.1, em um perfil separado no Windows, com capturas fornecidas pelo usuário.
O modelo não substitui essa revisão nem mede conforto durante sessões longas.

- Rust: foram coletados [121 tokens do rust-analyzer 0.3.3105](native/results/rust-semantic.json).
  As capturas com realce semântico [ligado](native/screenshots/rust-semantic-comments.png)
  e [desligado](native/screenshots/rust-textmate-comments.png) confirmam `///` sem itálico e o comentário
  comum em itálico. Essa aprovação se limita aos comentários inspecionados.
- Python: foram coletados [67 tokens do Pylance 2026.4.1](native/results/python-semantic.json).
  A [captura inicial](native/screenshots/python-before-decorator-fix.png) revelou
  `@property` azul e `@dataclass` com a cor de função: o provedor emite tipos
  `class` e `function` com o modificador `decorator`. A regra
  `*.decorator:python` corrige esses casos nos testes. A [captura após a correção](native/screenshots/python-after-decorator-fix.png)
  confirma os dois decoradores em Brass e itálico com o Pylance ativo.
- C#: foram coletados [169 tokens do servidor 2.160.4](native/results/csharp-semantic.json).
  A [captura inicial](native/screenshots/csharp-before-native-fixes.png) confirma
  parâmetros em itálico e membros de enum em Heather, mas revelou documentação
  XML em itálico. Os tipos específicos do provedor também faziam `Limit` herdar
  a cor de variável, `Action<T>` a de método e `\n` a de string. Foram adicionadas
  regras para documentação XML, constantes, delegates e escapes, com testes
  baseados nas [contribuições da extensão instalada](csharp-tokens.json).
  A [captura após a correção](native/screenshots/csharp-after-native-fixes.png),
  feita após o carregamento do servidor, confirma documentação sem itálico,
  `Limit` em Heather, `Action<T>` em Steel e `\n` em Glow. Parâmetros e membros
  de enum preservam o estilo esperado.

Faltam as verificações nativas de C/C++ e TypeScript/JavaScript, incluindo
TSX/JSX. O PR e a Release 0.3.2 permanecem
em rascunho até a conclusão dessa revisão.

## Reprodução

```sh
npm ci
npm run build
npm run check
npm run check:languages
npm run qa:languages
npx playwright install chromium
npm run qa:capture
npm --prefix vscode ci
npm run package
```

O comparativo usa o histórico Git com o commit base acima. `qa:languages` gera
HTML e JSON determinísticos; `qa:capture` precisa de um navegador compatível.
`CINDER_CHROMIUM_PATH` permite selecionar um Chromium já instalado.
Instale [DejaVu Sans Mono 2.37](https://dejavu-fonts.github.io/Download.html),
incluindo a variante oblíqua, antes de gerar as capturas. O script interrompe a
execução se detectar substituição da fonte. As imagens atuais incluem a linha
`/// Creates an empty queue` adicionada ao espécime Rust.

Os VSIX são saídas locais ignoradas pelo Git; os comandos de empacotamento e
instalação continuam válidos. A distribuição dos binários usa GitHub Releases.

Referências primárias usadas para o modelo semântico:

- [Guia de realce semântico do VS Code](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide).
- [Seletores e herança no VS Code](https://github.com/microsoft/vscode/blob/main/src/vs/platform/theme/common/tokenClassificationRegistry.ts), blob inspecionado `f3503dea201c3717e542973104bb5f50595c9d65`.
- [Resolução de propriedades de estilo no VS Code](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/colorThemeData.ts), blob inspecionado `a15f7d01fecf98e8bbe6734a57c92ec04d6278ca`.
- [Contribuições semânticas do rust-analyzer](https://github.com/rust-lang/rust-analyzer/blob/master/editors/code/package.json), [recorte com proveniência](rust-analyzer-tokens.json).
