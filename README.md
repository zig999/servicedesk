# ServiceDeskN1

**Um resolvedor de casos.** Você lhe entrega um caso curado e um sujeito; ele devolve o desfecho
e para quem encaminhar.

Serviço HTTP em Node.js/TypeScript que resolve **um caso por vez**. Um caso é uma ficha de
troubleshooting escrita por quem conhece o problema: hipóteses em ordem de precedência, o que cada
uma precisa observar para ser decidida, e o que fazer se ela se confirmar. O serviço não sabe nada
sobre o domínio do caso — ele resolve qualquer caso que a ficha descreva:

1. lê o caso, validando-o por inteiro no momento da leitura;
2. coleta as observações que as hipóteses pedem, cada uma de um sistema externo por HTTP;
3. julga cada hipótese isoladamente, contra a evidência e mais nada;
4. resolve o desfecho pela primeira hipótese confirmada na ordem da ficha;
5. redige a conclusão e grava a investigação inteira como registro imutável — respondendo somente
   depois que esse registro foi escrito.

**O conhecimento fica na ficha, não no código.** Cadastrar um caso novo, corrigir um critério ou
apontar um conceito para outro sistema é curadoria de dados, não release: nenhuma dessas coisas
recompila nada.

O código-fonte do serviço vive em [`src/`](src/); este README descreve o que está implementado ali.

> O nome anterior deste serviço era *Siegard — Backend de Diagnóstico*. **Siegard** segue sendo o
> nome do processo de desenvolvimento que governa este repositório, descrito em
> [`CLAUDE.md`](CLAUDE.md) — não o da aplicação.

## Sumário

- [O que o serviço faz](#o-que-o-serviço-faz)
- [Arquitetura](#arquitetura)
- [Modelo de dados](#modelo-de-dados)
- [API HTTP](#api-http)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Estado atual e limitações conhecidas](#estado-atual-e-limitações-conhecidas)

## O que o serviço faz

Um **caso** (`Case`) é uma ficha de troubleshooting: um título, um tipo de sujeito, um conjunto de
**hipóteses** ordenadas por precedência — cada uma com um critério em prosa, os conceitos que
precisa observar (`collects`) e a resolução (desfecho + encaminhamento) que segue se ela for
confirmada — e um desfecho padrão (`fallback`) para quando nenhuma confirma.

Ao receber um pedido de diagnóstico (`POST /v1/diagnose`), o serviço:

1. **Lê o caso pinado** por slug e versão, validando-o por inteiro no momento da leitura — tanto
   estruturalmente quanto contra o estado atual do glossário e do registro de capacidades
   (`src/case/case-query.service.ts`).
2. **Coleta uma evidência por conceito** do plano de coleta do caso, em paralelo, dentro de um
   orçamento de tempo próprio (`src/investigation/evidence-collection-stage.ts`).
3. **Julga cada hipótese exigida em paralelo**, cada uma numa chamada isolada a um avaliador,
   sob um limite de concorrência configurável, com uma segunda tentativa quando a citação da
   primeira resposta não se sustenta (`src/investigation/judgment-stage.ts`).
4. **Resolve o desfecho** pela primeira hipótese confirmada na ordem de precedência da ficha, ou
   pelo `fallback` caso nenhuma confirme (`src/case/case-resolution.ts`).
5. **Redige o texto da conclusão** por um consolidador, a partir apenas do que foi de fato citado
   (`src/investigation/draft-assessment-text.ts`).
6. **Grava a investigação inteira** — evidências, julgamentos, citações e o desfecho — como um
   registro imutável, e só então responde (`src/investigation/run-diagnosis.ts`).

Todo o pedido corre contra um prazo absoluto único, repartido entre as etapas; a gravação final é a
única etapa que nunca degrada silenciosamente — se não concluir a tempo, o pedido falha em vez de
responder sem o registro correspondente.

## Arquitetura

Arquitetura hexagonal (portas e adaptadores), com uma regra estrita: **o domínio nunca importa
infraestrutura**. Cada módulo de domínio declara uma interface (`*.port.ts`); quem a implementa —
driver de banco, cliente de LLM, dublê de teste — só é amarrado nas *factories*
(`src/factories/`).

```
HTTP (Fastify)                       src/http/
      │
      ▼
Composição (factories)               src/factories/
      │
      ├── CaseQueryService  ──┬── ICaseStore ──────── RelationalCaseStore
      │   (case-query)        ├── IGlossaryQuery ──── RelationalGlossaryStore
      │                       └── ICapabilityQuery ── RelationalCapabilityStore
      │
      └── runDiagnosis (pipeline)
              │
              ├── collectEvidence ─────── IObservationSource  (produção: HttpDeclarativeObservationSource)
              ├── judgeHypotheses ─────── IHypothesisEvaluator (produção: Anthropic)
              ├── resolveAndNarrow ────── (puro, sobre case-resolution.ts)
              ├── draftAssessment ──────── IAssessmentConsolidator (produção: Anthropic)
              └── write ────────────────── IInvestigationStore ── RelationalInvestigationStore
```

Um único `Pool` do `pg` (`src/persistence/database-connection.ts`) é a única peça do código que
sabe que existe um banco — todo repositório relacional o recebe pronto, e todo helper de
leitura/escrita/transação (`src/persistence/database-access.ts`) roda por cima dele.

Contextos de domínio:

| Contexto | Pasta | Responsabilidade |
|---|---|---|
| **Conhecimento** (`knowledge`) | `src/case/` | O caso curado como versão escrita uma vez, válida enquanto toda regra segue valendo contra o glossário e o registro de capacidades atuais |
| **Glossário** (`glossary`) | `src/glossary/` | A linguagem publicada do sistema: os cinco vocabulários de termos e os conceitos que um caso pode coletar |
| **Integração** (`integration`) | `src/capability-registry/` | O registro de capacidades read-only e a normalização que mantém o vocabulário do sistema-fonte fora do domínio |
| **Investigação** (`investigation`) | `src/investigation/` | A execução de um caso sobre um sujeito: coleta, julgamento, resolução, escrita, sob prazo absoluto |

## Modelo de dados

Persistência 100% relacional (Postgres), uma tabela por elemento do domínio, dez migrações em
`migrations/` aplicadas em ordem:

| Tabela(s) | Contexto | Guarda |
|---|---|---|
| `subject_types`, `subject_attributes`, `outcomes`, `actions`, `recipients` | Glossário | Os cinco vocabulários de termos — nomes válidos, nunca valores |
| `concepts`, `concept_accepts` | Glossário | Conceitos observáveis, seu `ttl` e quais tipos de sujeito cada um aceita |
| `capabilities` | Integração | Capacidades read-only registradas, uma por conceito, com seus dois schemas, timeout e conector |
| `connector_configurations` | Integração | A configuração de chamada de cada conector — endereço, método, mapeamento de resposta e de status — guardada como payload opaco que nenhum módulo de domínio interpreta |
| `cases`, `case_versions` | Conhecimento | Identidade do caso, seu contador durável de versões, e cada versão com seu estado (`draft`/`released`) |
| `hypotheses` | Conhecimento | A identidade da hipótese, única dentro do caso e sem conteúdo próprio |
| `hypothesis_revisions`, `hypothesis_revision_collects` | Conhecimento | O conteúdo de cada revisão — critério, resolução e conceitos coletados — imutável depois que uma versão liberada a manifesta |
| `case_version_hypotheses` | Conhecimento | O manifesto: qual revisão de qual hipótese cada versão usa, e em que posição de precedência |
| `investigations` | Investigação | Uma investigação por pedido, imutável |
| `investigation_evidence` | Investigação | Uma evidência por conceito coletado |
| `investigation_evaluations`, `investigation_evaluation_citations` | Investigação | Um julgamento por hipótese exigida, com as citações que o fundamentam |
| `investigation_subject_attribute_values` | Investigação | Os pares atributo-valor do sujeito de uma investigação |

Toda leitura de um caso inteiro (raiz + manifesto + revisões + coletas) roda numa única transação
(`RelationalCaseStore.assembleVersion`); escrever uma versão já existente é recusado pela própria
chave primária `(slug, version)`, nunca por uma leitura prévia. Uma versão liberada é imutável por
regras do próprio schema, não por checagem em código: `UPDATE` e `DELETE` sobre ela viram no-op.

## API HTTP

Uma única rota, sob prefixo versionado:

```
POST /v1/diagnose
```

**Corpo da requisição:**

```jsonc
{
  "case": { "slug": "perfil-mobile-tecnico-probe", "version": 1 },
  "subject": {
    "type": "technician",
    "attributes": [{ "attribute": "user-id", "value": "RODRIGO.MATIAS" }]
  },
  "narrative": "descrição livre do problema relatado",
  "requester": "identificador de quem está diagnosticando",
  "ticket_ref": "opcional"
}
```

**Resposta (200):**

```jsonc
{
  "outcome": "...",
  "referral": { "action": "...", "recipient": "..." },
  "determining_hypothesis": "presente só quando alguma hipótese confirmou",
  "text": "a conclusão redigida"
}
```

Um corpo que falha a validação responde `400` com todo campo violado nomeado junto
(`{ error: { code: 'VALIDATION_ERROR', message, details } }`); um caso inexistente ou hoje
inválido (estrutural ou de coerência) responde através do mesmo tratador de erro genérico.

## Como rodar

Pré-requisitos: Node.js, e uma instância Postgres alcançável por `DATABASE_URL`
(`constraints/the-database-is-externally-provisioned` — o serviço nunca provisiona seu próprio
banco).

```bash
cd src
npm install
# crie um .env com DATABASE_URL, ANTHROPIC_API_KEY e as demais variáveis da tabela abaixo
npm run build
npm run migrate           # aplica migrations/ pendentes contra DATABASE_URL
npm run seed               # carrega o glossário, as capacidades e um caso de exemplo semeados
npm run start
```

Ou, em um único passo (build + start): `npm run dev`.

## Variáveis de ambiente

Lidas e validadas uma única vez, na subida do processo (`src/config/env.ts`) — uma variável
ausente ou malformada derruba o processo antes de aceitar qualquer requisição:

| Variável | Obrigatória | Papel |
|---|---|---|
| `DATABASE_URL` | sim | A única URL de conexão ao Postgres; toda persistência do serviço passa por ela |
| `PORT` | não (padrão `3000`) | Porta HTTP |
| `EVALUATOR_MODEL` | sim | Modelo Anthropic usado para julgar cada hipótese |
| `EVALUATOR_MAX_TOKENS` | não | Teto de tokens da resposta do avaliador |
| `CONSOLIDATOR_MODEL` | sim | Modelo Anthropic usado para redigir a conclusão |
| `CONSOLIDATOR_MAX_TOKENS` | sim | Teto de tokens da resposta do consolidador |
| `POOL_SIZE` | sim | Quantos julgamentos de hipótese rodam em paralelo ao mesmo tempo |
| `DEFAULT_CONSOLIDATION_REGISTER` | sim | Registro (`formal`/`plain`) usado quando o caso não declara um |
| `PROMPT_VERSION` | sim | Versão do prompt pinada em cada investigação gravada |
| `PAGINATION_DEFAULT_LIMIT` | sim | Limite padrão das consultas paginadas de caso |
| `PAGINATION_MAX_LIMIT` | sim | Limite máximo que uma consulta paginada pode pedir |

`ANTHROPIC_API_KEY` **não** faz parte desse schema — os dois adaptadores Anthropic
(`src/investigation/anthropic-*.adapter.ts`) a lêem diretamente de `process.env` por conta própria.
Os endereços dos sistemas externos também não: cada um vive na linha do seu conector, no banco.

## Scripts

Definidos em `src/package.json`:

| Script | O que faz |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint sobre a árvore |
| `npm run secret-scan` | `secretlint` sobre todo o repositório |
| `npm run test` | Suíte de testes (Vitest) |
| `npm run build` | Compila para `dist/` |
| `npm run migrate` | Aplica as migrações pendentes de `migrations/` contra `DATABASE_URL` |
| `npm run seed` | Semeia glossário, capacidades e um caso de exemplo (`seed.ts`) |
| `npm run start` | Sobe o servidor HTTP a partir de `dist/` |
| `npm run dev` | `build` + `start` |

## Estrutura de pastas

```
src/
├── src/
│   ├── case/                 Contexto de conhecimento: Case, Hypothesis, parsing e coerência
│   ├── glossary/              Os cinco vocabulários de termos e os conceitos
│   ├── capability-registry/   Registro de capacidades read-only
│   ├── investigation/         O pipeline de diagnóstico: coleta, julgamento, resolução, escrita
│   ├── persistence/            Conexão, helpers de acesso e os quatro repositórios relacionais
│   ├── factories/              Composição: liga portas a implementações concretas
│   ├── http/                   Fastify: rotas, DTOs (Zod), tratamento de erro
│   ├── config/                 Leitura e validação do ambiente
│   ├── errors/                 Erros tipados de cada contexto
│   └── __tests__/              Testes unitários e de integração
├── migrations/                 Migrações SQL, aplicadas em ordem por migrate.ts
└── fixtures/                   Dados semeados por seed.ts (glossário, capacidades, um caso)
```

## Estado atual e limitações conhecidas

- **O conector HTTP real existe e roda em produção.** `HttpDeclarativeObservationSource`
  (`src/investigation/http-declarative-observation-source.adapter.ts`) é o que
  `src/factories/diagnose-server.factory.ts` liga: ele lê a linha do conector no banco, resolve os
  placeholders do endereço (`${subject:<atributo>}`, `${requester}`,
  `${credential:<VARIÁVEL>}`), chama, e mapeia a resposta pelos campos que a capacidade declara.
  Uma execução completa contra um sistema externo real está registrada passo a passo em
  [`temp/debug-01/`](temp/debug-01/).
- **Avaliação de hipótese e redação da conclusão usam a Anthropic API de verdade**
  (`AnthropicHypothesisEvaluator`, `AnthropicAssessmentConsolidator`), condicionadas apenas a
  `ANTHROPIC_API_KEY` estar configurada.
- **Não há registro de conector por caminho de produção.** O serviço *lê* a linha do conector, mas
  nada na árvore a *escreve* fora de teste: `registerConnector` só é chamado por especificações.
  Hoje o registro é feito por um comando de pessoa
  ([`docs/cases/_registry/register.mjs`](docs/cases/_registry/register.mjs)); um passo de seed é
  trabalho pendente.
- **Custo e duração são gravados em zero.** Nenhuma das portas reporta contagem de token nem
  tempo de etapa, então a rota grava zero em vez de número inventado
  (`src/http/diagnose.controller.ts`). Uma investigação real gasta e demora; o registro não diz
  quanto.
- **O `ttl` do conceito não chega à evidência.** O estágio de coleta grava um padrão fixo de 60 s
  (`DEFAULT_EVIDENCE_TTL_SECONDS`), porque não tem caminho até o valor registrado do conceito —
  declarado em `src/investigation/evidence.ts`.
- **Nenhum logger está configurado.** O processo não imprime nada; observar uma execução exige
  instrumentação externa, como a de [`temp/debug-01/`](temp/debug-01/).
- O projeto segue um processo de desenvolvimento orientado por especificação, descrito em
  [`CLAUDE.md`](CLAUDE.md) — a especificação em `knowledge/` é a autoridade sobre o que o negócio
  decidiu; este README descreve apenas o que o código, hoje, implementa dela.
