# CR — Suporte a características gráficas no ciclo analyse → plan-work → implement-task → review-change

| | |
|---|---|
| **Status** | Proposto |
| **Destinatário** | Projeto Siegard Framework (framework, não este consumidor) |
| **Solicitante** | Equipe do projeto `siegardtest` (consumidor do framework) |
| **Escopo** | Skills `/analyse`, `/plan-work`, `/implement-task`, `/review-change`; o standard do projeto; `siegard.json` |
| **Não afeta** | Os cinco tipos de node da especificação, que este CR propõe deixar intocados |

## 1. Resumo executivo

Hoje o framework tem um canal de entrada para **fato de negócio** (`/analyse`) e um canal de entrada
para **escopo de trabalho decomposto em critérios falseáveis** (`/plan-work`). Não existe canal de
entrada para **decisão de design visual** — paleta, tipografia, disposição de tela, comportamento de
componente. O resultado prático: hoje é possível informar *o que* uma tela deve fazer, nunca *como
ela deve se parecer*, e nenhuma revisão do framework audita fidelidade visual contra nada que alguém
decidiu.

Este CR pede que o framework reconheça uma terceira classe de decisão — **decisão de design**, distinta
de fato de negócio e de arranjo de código — com seu próprio artefato declarado, sua própria leitura por
`/implement-task`, e sua própria passagem de revisão em `/review-change`. Ele é modelado deliberadamente
como um **irmão do standard já existente**, não como um sexto tipo de node de especificação, para não
violar o princípio que define a própria especificação: *"the specification is the authority... the
node is what the business decided"* — uma decisão de paleta não é o que o negócio decidiu, e colocá-la
ali contradiria a própria razão de a especificação existir.

## 2. Situação atual (verificada nesta base)

- Os cinco tipos de node (Domain Model, Rule, Scenario, Contract, Architecture Constraint) não têm
  campo para nenhuma característica gráfica; `schemas/spec/*.json` não reserva espaço para isso, e não
  deveria — nenhum deles é fato de negócio.
- `schemas/standard.json` já prevê parcialmente o problema: a rule `MNT-02` do exemplo
  `standards/frontend-typescript.yaml` **presupõe** um arquivo de tokens (`src/design-system/tokens.css`)
  e exige que o código o referencie — mas não valida *os valores* desse arquivo, só a ausência de
  literais soltos. A tabela `elsewhere` do mesmo arquivo nomeia o resto do problema e o devolve sem
  solução:
  > *"Whether a change looks correct pixel by pixel against an approved baseline. lives_in: A dedicated
  > visual-regression tool, named as this registry's own commands step, if the project adopts one."*

  Isto é um **gap declarado**, não um gap silencioso — mas nenhuma ferramenta, node, campo ou agente
  hoje distribuído preenche essa lacuna.
- `task-implementer` lê apenas `Read, Write, Edit, Grep, Glob` sobre a task, a especificação, o
  inventário e o contrato de node de entrega. Não há canal para apontá-lo a um mockup, uma imagem de
  referência ou um registro de decisões visuais — mesmo que esses arquivos existam no repositório, nada
  no contrato da task ou no prompt do agente os torna leitura obrigatória ou reconhecida.
- As seis revisões de `/review-change` (`coverage-auditor`, `specification-conformance-reviewer`,
  `standard-conformance-reviewer`, `failure-diagnostician`, mais os passes de execução) julgam:
  cobertura de critério, conformidade com a especificação, conformidade com o standard de código, e
  causa de falha de suíte. Nenhuma julga fidelidade visual — não porque foi esquecida, mas porque não
  existe artefato de referência contra o qual julgá-la.
- `siegard.json` declara `specification_root`, `targets`, `work_root`, `delivery_root` e `standard`
  (este último, o único campo que aceita override por invocação). Não há campo para um registro de
  design.

## 3. Problema

Uma equipe que decide um layout — como fizemos nesta sessão, produzindo um mockup navegável com
paleta, tipografia, comportamento de componente e catálogo de eventos — **não tem onde depositar essa
decisão dentro do framework** de um jeito que:

1. seja lido por `/implement-task` como entrada reconhecida (não um anexo informal que pode ou não ser
   consultado);
2. seja verificável por `/review-change` como fidelidade, não apenas como comportamento;
3. sobreviva a uma correção — hoje, pedir "ajuste esta tela para bater com o layout decidido" não tem
   skill nem node correspondente; a única correção modelada é a de comportamento incorreto
   (`/plan-work`'s corrective increment, respondendo a um critério que parou de valer).

## 4. Objetivo do CR

Permitir que um projeto informe **características gráficas decididas** como entrada de primeira classe
do ciclo, e que o framework:

- leia essa decisão ao implementar (`/implement-task`);
- julgue conformidade a ela ao revisar (`/review-change`);
- roteie uma divergência visual através de uma correção, do mesmo jeito que já roteia uma divergência
  comportamental.

## 5. Requisitos solicitados

| # | Requisito | Racional |
|---|---|---|
| R1 | Um projeto deve poder declarar um **registro de design** — tokens, inventário de telas, contratos de comportamento por componente, catálogo de eventos — como artefato validado, análogo ao standard. | Hoje esse conteúdo só pode existir como documento avulso, sem verificação de forma nem de presença. |
| R2 | Uma task de `/plan-work` deve poder declarar **quais elementos do registro de design ela realiza**, reconciliado nas duas direções como `covers`/`implements` já são. | Sem isso, não há como uma revisão saber se uma tela foi construída contra uma decisão de design específica ou contra nenhuma. |
| R3 | `/implement-task` deve ler o registro de design (e qualquer referência visual que a task nomeie) com a mesma obrigatoriedade com que lê a especificação e o inventário. | Sem leitura obrigatória, a decisão de design é só um documento que pode ou não ser seguido — o mesmo problema que já existe hoje. |
| R4 | `/review-change` deve ganhar uma passagem de conformidade visual — **decidida por ferramenta** onde uma ferramenta de regressão visual existir (diferença de pixel, contraste computado), e por leitura apenas onde não existir renderização a comparar (ex.: a tela usa os tokens declarados, não um literal). | Consistente com o princípio já em vigor: *"a rule a tool decides is not a review's to read."* Fidelidade de pixel é exatamente o tipo de valor computado que o framework já reconhece como fora do alcance de uma leitura. |
| R5 | Uma divergência visual encontrada por essa passagem deve rotear por uma correção nomeada, do mesmo jeito que uma divergência comportamental roteia pelo incremento corretivo de `/plan-work`. | Sem isso, o achado visual vira uma nota solta sem caminho de resolução formal. |

## 6. Proposta de solução

Desenhada para caber na arquitetura existente sem introduzir um sexto tipo de node de especificação.

### 6.1 Novo artefato: registro de design

Um arquivo (`design/<slug>.json` ou similar, contrato em `schemas/design.json`) irmão do
`schemas/standard.json` — mesma lógica de `decided_by` que o standard já usa (`tool` para o que uma
ferramenta decide, `reading` para o resto), e a mesma seção `presupposes` para nomear os arquivos que a
decisão de design pressupõe (o arquivo de tokens real, uma pasta de referências visuais). Diferente do
standard, seu conteúdo não é regra de arranjo de código — é a decisão em si: paleta nomeada, escala
tipográfica, inventário de telas, contrato de comportamento por componente (o formato "gatilho →
pré-condição → ação → sucesso → falha" que já usamos informalmente nesta sessão), e o catálogo de
eventos.

### 6.2 Extensão de `siegard.json`

Um campo `design` (opcional, como `standard` já é), apontando para esse registro. `design: null`
declara deliberadamente que o projeto não tem um — o mesmo padrão honesto que `standard: null` já
segue, nunca uma omissão silenciosa.

### 6.3 Extensão do modelo de task

Um campo novo (`renders`, paralelo a `implements`) nomeando quais entradas do registro de design a
task constrói. Reconciliação nas duas direções: todo elemento do registro que uma epic cobre é nomeado
por uma task ou declarado descoberto — mesma disciplina que `covers`/`implements` já impõem para a
especificação.

### 6.4 Novo agente de revisão: `visual-conformance-reviewer`

Read-only, como os quatro que já existem. Lê o registro de design, o `renders` de cada task revisada, e
o resultado de qualquer step de regressão visual capturado por `bin/run.py`. Reporta divergência —
nunca veredito, seguindo a mesma regra que rege todas as revisões existentes.

### 6.5 Ferramenta de regressão visual como step declarado

Onde um projeto adota uma (ex.: Percy, Chromatic, Playwright com snapshot), ela entra como qualquer
outro step: nomeada em `commands` do standard, executada por `bin/run.py`, seu resultado capturado em
`run/`. Nenhum agente ganha shell — a regra *"no agent this framework ships holds a shell"* permanece
intacta.

### 6.6 Leitura ampliada de `task-implementer`

Quando a task nomeia entradas em `renders`, `task-implementer` lê o registro de design e qualquer
referência visual nomeada (ex.: um arquivo de mockup) do mesmo jeito que já lê a especificação — nunca
por inferência, sempre por nome explícito na task.

## 7. O que este CR **não** propõe

- **Não** propõe colocar decisão visual dentro da especificação. Paleta e disposição de tela não são o
  que o negócio decidiu; misturá-las violaria a definição da própria especificação.
- **Não** propõe geração automática de código a partir de imagem. `task-implementer` continua sendo um
  escritor deliberado contra critério e especificação — o registro de design é referência que ele lê,
  não um pipeline de reconstrução de pixel.
- **Não** propõe que o framework distribua uma ferramenta de regressão visual. Ele passa a reconhecer o
  slot e a leitura, exatamente como já faz para o standard — a ferramenta em si continua sendo decisão
  e dependência de cada projeto.

## 8. Compatibilidade e adoção incremental

Tudo aqui é opt-in pelo mesmo mecanismo que `standard: null` já estabelece: um projeto sem registro de
design continua funcionando exatamente como hoje, e um relatório honesto diz que a passagem visual não
rodou — nunca uma aprovação silenciosa por ausência.

## 9. Critérios de aceite

- [ ] `schemas/design.json` existe e valida um registro de design mínimo (tokens + um componente).
- [ ] `siegard.json` aceita e valida o campo `design`.
- [ ] Uma task pode declarar `renders`; `plan.py` reconcilia contra o registro nas duas direções.
- [ ] `/implement-task` lê o registro de design quando uma task o nomeia, e o relatório de
      implementação cita o que leu.
- [ ] `/review-change` executa a passagem visual quando um step de regressão está declarado, e reporta
      honestamente a ausência quando não está.
- [ ] Uma divergência visual encontrada tem um caminho de correção nomeado, análogo ao incremento
      corretivo já existente para comportamento.

## 10. Riscos e questões abertas

- Onde exatamente o limite entre "decisão de design" e "fato de negócio" se torna ambíguo — ex.: o
  texto de um erro é às vezes negócio (`/analyse`), às vezes arranjo (`elsewhere` do standard); o mesmo
  atrito vai existir entre design e standard, e precisa de um critério tão explícito quanto o que já
  separa standard de especificação.
- Se `renders` deveria ser um campo de task (delivery, comportamento provável) ou algo mais próximo de
  epic (design, unidade de tela) — este CR sugere task por simetria com `implements`, mas cabe
  discussão.
- Quem audita a *qualidade* de uma decisão de design (se a paleta escolhida é boa) fica
  deliberadamente fora deste CR — o mesmo motivo que já tira severidade e veredito de todo o resto do
  framework: *uma decisão de design tem dono humano, o framework só garante que ela seja lida e
  seguida.*

## 11. Referências consultadas

- `CLAUDE.md` (raiz deste projeto) — definição dos cinco tipos de node, do standard, e das regras que
  ligam analyse/plan-work/implement-task/review-change.
- `standards/frontend-typescript.yaml` — exemplo de standard frontend, sua seção `elsewhere` (fonte
  direta do gap nomeado neste CR) e `presupposes`.
- `standards/frontend-design-tokens.example.css` — forma concreta do arquivo que `MNT-02` presupõe.
- `.claude/schemas/standard.json` — contrato do standard, modelo para o registro de design proposto.
