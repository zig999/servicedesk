# 22. Configuração e composição

Este capítulo explica como o ServiceDeskN1 é configurado e montado: as variáveis de ambiente que `src/config/env.ts` lê e valida, o erro que uma configuração inválida dispara, as fábricas de `src/factories/` que ligam portas a implementações (produção contra teste), o que `production-diagnose.factory.ts` fixa por conta própria, e como rodar o serviço, as migrações, a semeadura e a suíte de testes. O leitor não precisa conhecer o código: cada passo aponta o arquivo responsável.

## 22.1 Variáveis de ambiente

Todas as variáveis são lidas **uma única vez**, na subida do processo, por `loadEnv(source = process.env)` em `src/config/env.ts`. A função valida `source` contra um schema Zod (`envSchema`) e devolve um objeto `Env` tipado; nenhuma outra parte do código lê `process.env` para configuração, com duas exceções documentadas em [22.1.2](#2212-o-que-fica-fora-do-schema). Como `process.env` só contém strings, os campos numéricos usam `z.coerce.number()`.

### 22.1.1 Tabela completa

| Variável | Tipo (após coerção) | Obrigatória | Padrão | Validação | Efeito — onde é usada |
|---|---|---|---|---|---|
| `PORT` | inteiro | não | `3000` | `> 0` | Porta em que `src/index.ts` chama `app.listen({ port, host: '0.0.0.0' })` |
| `DATABASE_URL` | string | sim | — | não vazia | A única URL de conexão ao PostgreSQL; `createDatabaseConnection(env.DATABASE_URL)` em `src/factories/diagnose-server.factory.ts`, `src/migrate.ts`, `src/seed.ts`; `knowledge/constraints/the-database-is-externally-provisioned.md` |
| `EVALUATOR_MODEL` | string | sim | — | não vazia | Modelo Anthropic do avaliador de hipóteses (`AnthropicHypothesisEvaluator`); também gravado como `Investigation.model` e devolvido a cada diagnóstico (`DiagnoseControllerDependencies.model`) — `knowledge/rules/investigation/replay-is-pinned.md` |
| `EVALUATOR_MAX_TOKENS` | inteiro | não | (padrão do adaptador) | `> 0` | `maxTokens` do avaliador |
| `CONSOLIDATOR_MODEL` | string | sim | — | não vazia | Modelo Anthropic do consolidador (`AnthropicAssessmentConsolidator`) |
| `CONSOLIDATOR_MAX_TOKENS` | inteiro | sim | — | `> 0` | `maxTokens` do consolidador |
| `POOL_SIZE` | inteiro | sim | — | `> 0` | Quantos julgamentos de hipótese correm em paralelo (`poolSize` de `runDiagnosis`, `knowledge/constraints/hypotheses-are-judged-in-isolated-parallel-calls.md` — "the pool bound is configuration") |
| `DEFAULT_CONSOLIDATION_REGISTER` | `'formal' \| 'plain'` | sim | — | enum `CONSOLIDATION_REGISTERS` (`src/investigation/consolidation-register.ts`) | Registro usado quando a versão do caso não declara `consolidation_register` |
| `PROMPT_VERSION` | string | sim | — | não vazia | Pinada em cada investigação gravada (`Investigation.prompt_version`) via `DiagnoseControllerDependencies.promptVersion` |
| `PAGINATION_DEFAULT_LIMIT` | inteiro | sim | — | `> 0` | `limit` aplicado a uma listagem que não pede um (`knowledge/constraints/listings-are-paged.md`) |
| `PAGINATION_MAX_LIMIT` | inteiro | sim | — | `> 0` | Teto ao qual um `limit` pedido é reduzido |

Não há validação cruzada (por exemplo, `PAGINATION_DEFAULT_LIMIT <= PAGINATION_MAX_LIMIT` não é verificado; um padrão acima do máximo é simplesmente reduzido ao máximo em tempo de requisição por `Math.min`).

### 22.1.2 O que fica fora do schema

| Variável | Quem lê | Por quê |
|---|---|---|
| `ANTHROPIC_API_KEY` | `new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY })` em `src/investigation/anthropic-hypothesis-evaluator.adapter.ts` e `src/investigation/anthropic-assessment-consolidator.adapter.ts` | Credencial do provedor, lida pelo próprio adaptador quando o construtor não recebe `apiKey`. Sua ausência não derruba o processo na subida; falha na primeira chamada ao provedor |
| Variáveis nomeadas em `${credential:<NOME>}` | `resolveConnectorRequest` em `src/http-connector/connector-request-resolver.ts` (`env = process.env` por padrão) | Credenciais de sistemas externos, referenciadas pela configuração do conector guardada no banco; uma variável ausente ou vazia gera `ConnectorPlaceholderNotResolvedError` |

Os endereços dos sistemas externos não são variáveis de ambiente: vivem em `connector_configurations` ([Modelo relacional](15-modelo-relacional.md)).

### 22.1.3 `InvalidEnvironmentError`

Se `envSchema.safeParse` falha, `loadEnv` lança `InvalidEnvironmentError` (`src/errors/invalid-environment.error.ts`) com `context.issues`: uma lista `caminho: mensagem` contendo **todas** as violações de uma vez, não só a primeira. Como `loadEnv()` é a primeira linha de `src/index.ts`, `src/migrate.ts` e `src/seed.ts`, o processo cai antes de abrir porta ou conexão. Mensagem: `the process environment is missing or malformed: <issues>`. Teste: `src/__tests__/unit/config/env.spec.ts`.

Exemplo de `.env` mínimo (valores ilustrativos):

```dotenv
DATABASE_URL=postgres://user:pass@host:5432/servicedeskn1
PORT=3000
EVALUATOR_MODEL=claude-sonnet-4-5
EVALUATOR_MAX_TOKENS=1024
CONSOLIDATOR_MODEL=claude-sonnet-4-5
CONSOLIDATOR_MAX_TOKENS=1024
POOL_SIZE=4
DEFAULT_CONSOLIDATION_REGISTER=formal
PROMPT_VERSION=2026-08-01
PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100
ANTHROPIC_API_KEY=sk-ant-...
```

Dois arquivos de ambiente existem em `src/`: `.env` (usado por `start`, `migrate`, `seed`, `dev`) e `.env.test` (usado por `test`), ambos carregados com `node --env-file=...` (`src/package.json`). Nenhum dos dois é versionado com valores reais.

## 22.2 Fábricas de composição (`src/factories/`)

A arquitetura é hexagonal: módulos de domínio declaram portas (`*.port.ts`) e só as fábricas sabem qual implementação encaixar (`knowledge/constraints/the-domain-depends-on-no-infrastructure.md`, verificado por `src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts`). Toda fábrica recebe `DatabaseConnection` (o `Pool`) e nada constrói por conta própria além do que declara.

| Fábrica | Função | Recebe | Devolve | Liga |
|---|---|---|---|---|
| `case-store.factory.ts` | `createCaseStore` | `connection` | `ICaseStore` | `RelationalCaseStore` |
| `glossary.factory.ts` | `createGlossary`, `createGlossaryQuery` | `connection` | `GlossaryService` / `IGlossaryQuery` | `GlossaryService(new RelationalGlossaryStore)` |
| `capability-registry.factory.ts` | `createCapabilityRegistry`, `createCapabilityQuery` | `connection` | `CapabilityRegistryService` / `ICapabilityQuery` | `CapabilityRegistryService(new RelationalCapabilityStore)` |
| `connector-configuration-registry.factory.ts` | `createConnectorConfigurationRegistry` | `connection` | `ConnectorConfigurationRegistryService` | sobre `RelationalConnectorConfigurationStore` |
| `investigation-store.factory.ts` | `createInvestigationStore` | `connection` | `IInvestigationStore` | `RelationalInvestigationStore` |
| `case-query.factory.ts` | `createCaseQuery` | `connection` | `ICaseQuery` | `CaseQueryService(caseStore, glossaryQuery, capabilityQuery)` |
| `case-lifecycle.factory.ts` | `createCaseLifecycle` | `connection` | `CaseLifecycleOperations` (`createDraft`, `reviseHypothesis`, `placeHypothesis`, `removeHypothesis`, `release`, `discard`) | `CreateDraftOperation`, `ReviseHypothesisOperation(caseStore, glossary)`, `ReleaseOperation(caseStore, glossary, capabilities)`, funções de `manifest-composition.operations.ts` e `discard.operation.ts` |
| `diagnose.factory.ts` | `createDiagnoseRunner` | `DiagnoseDependencies` = `connection`, `observationSource`, `evaluator`, `consolidator`, `poolSize`, `defaultConsolidationRegister` | `(call: DiagnoseCall) => Promise<Assessment>` | `runDiagnosis` com `store`, `glossary`, `capabilities` criados da conexão e as portas recebidas |
| `production-diagnose.factory.ts` | `createProductionDiagnoseRunner` | `ProductionDiagnoseDependencies` | `(call: ProductionDiagnoseCall) => Promise<Assessment>` | ver [22.2.2](#2222-o-que-production-diagnosefactoryts-amarra) |
| `build-app.factory.ts` | `buildAppDependencies` | `env`, `connection`, `caseQuery`, `diagnose` | `BuildAppDependencies` (26 campos) | ver [22.2.3](#2223-build-appfactoryts-as-26-rotas) |
| `diagnose-server.factory.ts` | `createDiagnoseHttpServer` | `Env` | `FastifyInstance` (sem `listen`) | tudo acima, em produção |

### 22.2.1 Produção versus teste

A diferença entre os dois mundos está inteiramente em **quem chama qual fábrica e com quais adaptadores**:

| Aspecto | Produção | Teste |
|---|---|---|
| Ponto de entrada | `src/index.ts` → `createDiagnoseHttpServer(loadEnv())` | Cada spec constrói só o que precisa |
| `IObservationSource` | `HttpDeclarativeObservationSource` (`src/investigation/http-declarative-observation-source.adapter.ts`), com `capabilities` e `connectorConfigurations` vindos do banco | `FakeObservationSource` (`src/investigation/fake-observation-source.adapter.ts`) ou um `vi.fn()` |
| `IHypothesisEvaluator` | `AnthropicHypothesisEvaluator` | `FakeHypothesisEvaluator` (`src/investigation/fake-hypothesis-evaluator.adapter.ts`) |
| `IAssessmentConsolidator` | `AnthropicAssessmentConsolidator` | `FakeAssessmentConsolidator` (`src/investigation/fake-assessment-consolidator.adapter.ts`) |
| Relógio e prazo | `production-diagnose.factory.ts` lê `Date.now()` e soma 20 s | `createDiagnoseRunner` recebe `now` e `deadline` na chamada; specs usam fake timers do Vitest |
| Banco | `DATABASE_URL` do `.env` | `DATABASE_URL` do `.env.test`; schema aplicado por `src/vitest-global-setup.ts`; `checkOutIsolatedConnection` (`src/persistence/isolated-connection.ts`) para transações que fazem `ROLLBACK` |
| Aplicação HTTP | `buildApp(buildAppDependencies(...))` completa | `buildApp` com dependências dubladas por rota (`src/__tests__/unit/http/*.routes.spec.ts`) ou `createDiagnoseHttpServer` real (`src/__tests__/integration/http/diagnose-e2e.spec.ts`) |

Os três adaptadores `fake-*.adapter.ts` vivem em `src/investigation/` (não em `__tests__`) porque implementam as portas e são parte do contrato de teste do domínio; nenhum é referenciado por fábrica de produção.

### 22.2.2 O que `production-diagnose.factory.ts` amarra

`createProductionDiagnoseRunner(dependencies)` é a única fábrica que decide coisas por conta própria em vez de só repassar:

| Decisão | Valor | Origem |
|---|---|---|
| Avaliador | `new AnthropicHypothesisEvaluator({ model: evaluatorModel, maxTokens: evaluatorMaxTokens })` | `EVALUATOR_MODEL`, `EVALUATOR_MAX_TOKENS` |
| Consolidador | `new AnthropicAssessmentConsolidator({ model: consolidatorModel, maxTokens: consolidatorMaxTokens })` | `CONSOLIDATOR_MODEL`, `CONSOLIDATOR_MAX_TOKENS` |
| `poolSize` | repassado | `POOL_SIZE` |
| `defaultConsolidationRegister` | repassado | `DEFAULT_CONSOLIDATION_REGISTER` |
| `observationSource` | repassado (construído por `diagnose-server.factory.ts`) | — |
| **`now`** | `Date.now()` no momento de cada chamada | fixo no código |
| **`deadline`** | `now + TOTAL_DEADLINE_BUDGET_MS`, com `TOTAL_DEADLINE_BUDGET_MS = 20_000` | fixo no código — `knowledge/rules/investigation/an-answer-arrives-within-the-declared-deadline.md` ("twenty seconds") e `knowledge/constraints/the-deadline-is-an-absolute-propagated-instant.md` |

O tipo `ProductionDiagnoseCall` é `DiagnoseCall` sem `now` e `deadline`: quem chama (o controlador de `POST /v1/diagnose`) não pode escolher o prazo. Os orçamentos por estágio também são constantes de código, não de ambiente: coleta 7 000 ms (`COLLECTION_STAGE_BUDGET_MS`, `src/investigation/evidence-collection-stage.ts`), julgamento 5 000 ms (`JUDGMENT_STAGE_BUDGET_MS`) e persistência 2 000 ms (`PERSISTENCE_STAGE_BUDGET_MS`, ambos em `src/investigation/run-diagnosis.ts`) — ver [Deadlines](11-deadlines.md).

### 22.2.3 `build-app.factory.ts`: as 26 rotas

`buildAppDependencies({ env, connection, caseQuery, diagnose })` compõe uma vez os recursos compartilhados (`composeResources`: registro de capacidades, glossário, registro de conectores, `caseStore`, `caseLifecycle`, e `pagination = { defaultLimit: env.PAGINATION_DEFAULT_LIMIT, maxLimit: env.PAGINATION_MAX_LIMIT }`) e distribui fatias para cada rota em cinco grupos:

| Grupo | Rotas | Dependência entregue |
|---|---|---|
| `readDependencies` | `readCapability`, `readCapabilityByIdentity`, `readCase`, `readVocabularyTerm`, `readConcept`, `readConnectorConfiguration` | `capabilityQuery`, `readCapabilityByIdentityOrThrow`, `caseQuery`, `glossaryQuery`, `readConnectorConfigurationOrThrow` |
| `listDependencies` | as 8 listagens | a consulta correspondente + `...pagination` |
| `lifecycleDependencies` | `createDraft`, `updateDraft`, `release`, `discard`, `reviseHypothesis`, `placeHypothesis`, `removeHypothesis` | funções de `CaseLifecycleOperations`; `updateDraft` recebe `caseStore` e `caseQuery` diretamente; `release` recebe também `caseQuery` para reler a versão |
| `registrationDependencies` | `registerCapability`, `registerConcept`, `registerConnector` | métodos dos serviços |
| `testConnectorDependencies` | `testConnector` | `readCapabilityByIdentity`, `readConnectorConfiguration` (as versões que devolvem `held: false` em vez de lançar) e `httpClient: fetch` global |

A rota `diagnose` recebe o objeto `diagnose` pronto de `diagnose-server.factory.ts`: `{ caseQuery, runDiagnose, model: env.EVALUATOR_MODEL, promptVersion: env.PROMPT_VERSION }`.

```mermaid
flowchart TB
  env[".env → loadEnv()<br/>src/config/env.ts"] --> idx[src/index.ts]
  idx --> dsf["createDiagnoseHttpServer(env)<br/>diagnose-server.factory.ts"]
  dsf --> pool["createDatabaseConnection(DATABASE_URL)<br/>persistence/database-connection.ts"]
  dsf --> obs["HttpDeclarativeObservationSource<br/>(capabilities, connectorConfigurations)"]
  dsf --> cq["createCaseQuery(connection)"]
  dsf --> pdf["createProductionDiagnoseRunner<br/>production-diagnose.factory.ts<br/>Anthropic x2, now/deadline 20s"]
  pdf --> df["createDiagnoseRunner<br/>diagnose.factory.ts → runDiagnosis"]
  dsf --> baf["buildAppDependencies({env, connection, caseQuery, diagnose})<br/>build-app.factory.ts"]
  baf --> reg["registries + glossary + caseLifecycle + pagination"]
  baf --> ba["buildApp(deps)<br/>http/build-app.ts"]
  ba --> listen["app.listen({ port: PORT, host: 0.0.0.0 })"]
```

## 22.3 Como rodar

Pré-requisitos (README.md, seção "Como rodar"): Node.js com suporte a `--env-file` e uma instância PostgreSQL alcançável por `DATABASE_URL`. O serviço nunca provisiona o banco (`knowledge/constraints/the-database-is-externally-provisioned.md`).

### 22.3.1 Scripts npm (`src/package.json`)

| Script | Comando | O que faz |
|---|---|---|
| `npm run typecheck` | `tsc --noEmit` | Checagem de tipos |
| `npm run lint` | `eslint .` | Lint (`src/eslint.config.js`) |
| `npm run secret-scan` | `secretlint "**/*"` | Varredura de segredos |
| `npm run test` | `node --env-file=.env.test node_modules/.bin/vitest run --passWithNoTests` | Suíte inteira (unitária e de integração) |
| `npm run build` | `tsc -p tsconfig.build.json` | Compila `src/src/` para `src/dist/` |
| `npm run migrate` | `node --env-file=.env dist/migrate.js` | Aplica migrações pendentes ([22.3.3](#2233-migrações-srcmigratets)) |
| `npm run seed` | `node --env-file=.env dist/seed.js` | Semeia glossário, capacidades e caso de exemplo ([22.3.4](#2234-semeadura-srcseedts)) |
| `npm run start` | `node --env-file=.env dist/index.js` | Sobe o servidor HTTP |
| `npm run dev` | `npm run build && npm run start` | Compila e sobe |

Sequência de primeira execução:

```bash
cd src
npm install
# escreva src/.env com as variáveis de 22.1
npm run build
npm run migrate
npm run seed
npm run start        # ou: npm run dev
```

### 22.3.2 `dev.sh` (raiz do repositório)

Script de conveniência que abre uma sessão `tmux` chamada `servicedeskn1` com duas colunas: à esquerda `npm run dev` em `src/` (backend, porta 3000), à direita `npm run dev` em `frontend/app`. Antes disso: mata uma sessão anterior de mesmo nome; verifica com `ss -ltnp` se a porta 3000 já está ocupada e aborta nomeando o processo; carrega `tmux.conf`; registra um hook `client-detached` que destrói a sessão ao fechar o terminal. Não configura variáveis de ambiente — depende dos `.env` de cada projeto.

### 22.3.3 Migrações (`src/migrate.ts`)

```text
loadEnv() → createDatabaseConnection(env.DATABASE_URL) → applyPendingMigrations(connection, '<pacote>/migrations') → connection.end()
```

Idempotente: só arquivos ausentes de `schema_migrations` são aplicados, em ordem lexicográfica (`src/persistence/migration-runner.ts`; `knowledge/constraints/the-schema-replays-from-its-scripts.md`). Uma falha em um script lança `MigrationStepError` e interrompe; os anteriores permanecem registrados. Teste: `src/__tests__/unit/migrate.spec.ts`.

### 22.3.4 Semeadura (`src/seed.ts`)

Ordem de execução, tudo com `INSERT ... ON CONFLICT DO NOTHING` ou com verificação prévia (idempotente):

1. `seedOutcomes` — `outcome.json` mais os dois desfechos de não-conclusão de `NON_CONCLUSION_OUTCOMES` (`knowledge/rules/glossary/the-non-conclusion-outcomes-precede-the-first-case.md`).
2. `seedRemainingVocabularies` — `subject-type.json`, `subject-attribute.json`, `action.json`, `recipient.json`.
3. `seedConcepts` — `concept.json` em `concepts` e `concept_accepts`.
4. `seedCapabilities` — `capability.json` via `CapabilityRegistryService.registerCapability` (passa pelas regras de registro).
5. `seedCase` — só se `assembleVersion('intermittent-connection-outage', 1)` for `undefined`: `createDraft`, depois `reviseHypothesis` + `placeHypothesis` por entrada do manifesto, depois `release`.
6. `verifySeededCase` — `createCaseQuery(connection).readCase(...)`, que falha se o caso semeado não validar.

Configurações de conector **não** são semeadas; use `PUT /v1/connectors/:connector` ([API HTTP](14-api-http.md)). Testes: `src/__tests__/unit/seed.spec.ts`, `src/__tests__/integration/seed.spec.ts`.

### 22.3.5 Suíte de testes (`src/vitest.config.ts`, `src/vitest-global-setup.ts`)

`vitest.config.ts` declara três coisas: `globalSetup: ['./src/vitest-global-setup.ts']`, `fileParallelism: false` (arquivos de teste correm em sequência, para não multiplicar trocas de backend no pooler PostgreSQL) e `testTimeout: 40000` (o dobro do prazo interno de 20 s, para a limpeza `afterEach` terminar mesmo quando um diagnóstico esgota o orçamento).

`vitest-global-setup.ts` roda uma vez antes de qualquer spec:

1. Exige `DATABASE_URL`; sem ela lança `MigrationStepError` com `{ variable: 'DATABASE_URL' }`.
2. `applyPendingMigrations` contra esse banco — o mesmo runner da produção.
3. `seedNonConclusionOutcomes` — insere `inconclusive-no-data` e `inconclusive-hypotheses-exhausted` em `outcomes`.
4. `repairFixtureManifestCollects` — garante `subject_types.contract`, os conceitos `equipment-status` (ttl 300) e `network-outage-flag` (ttl 60) aceitando `contract`, e preenche `hypothesis_revision_collects` da revisão 1 das duas hipóteses do caso `intermittent-connection-outage`, se a revisão existir e a linha faltar (reparo de bancos de teste anteriores à migração `0009`).

Os testes de integração usam o banco real de `.env.test`; os unitários não tocam rede nem banco (`src/__tests__/unit/capability-registry/no-network-persistence.spec.ts`). A suíte inclui testes de arquitetura que verificam o próprio repositório: `dependency-manifest.spec.ts` (dependências autorizadas: `@anthropic-ai/sdk`, `fastify`, `pg`, `zod`), `domain-depends-on-no-infrastructure.spec.ts`, `deployment-provisions-no-database-service.spec.ts`, `no-test-creates-or-alters-a-table.spec.ts`.

## 22.4 O que não está configurado

- **Logger**: nenhum. `Fastify()` é criado sem opção `logger`; o processo não imprime nada (README.md, "Estado atual").
- **Autenticação, CORS, TLS**: nenhum (`knowledge/constraints/no-route-enforces-authentication.md`).
- **Métricas de custo e duração**: gravadas em zero (`UNMEASURED_COST`, `UNMEASURED_DURATIONS` em `src/http/diagnose.controller.ts`).
- **Cache de evidência**: `knowledge/constraints/the-evidence-cache-admits-only-ok-results.md` descreve como seria; não há adaptador de cache no código.
- **`ttl` do conceito na evidência**: o estágio de coleta grava um padrão fixo (`DEFAULT_EVIDENCE_TTL_SECONDS` em `src/investigation/evidence.ts`), não o `ttl` registrado.
