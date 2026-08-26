# Plano — Cockpit de Simulação de Investigação (`case-simulation`)

> Documento auto-suficiente. Escrito em 2026-08-26 para ser executado em outra sessão de Claude Code,
> sem acesso ao histórico da conversa que o produziu. Tudo o que a sessão executora precisa saber
> está aqui ou é apontado por caminho de arquivo neste repositório. **Este documento não é um nó
> de especificação, nem plano, nem entrega**: é o material de entrada para `/analyse` e para
> `/plan-work`, e um guia de execução. Ele não substitui nenhuma entry point do framework.

---

## 0. Como usar este documento

1. Leia `CLAUDE.md` na raiz do repositório **antes de tudo**. Ele define o framework Siegard: a
   especificação em `knowledge/` é a autoridade; planos e entregas são nós markdown validados por
   scripts; **nenhuma entry point é feita "à mão"** — invoca-se a skill pelo nome.
2. Execute as fases na ordem da seção 8. Cada fase é uma invocação de skill; cada skill **para**
   antes de escrever quando falta algo, e devolve o que falta. Isso é o framework funcionando.
3. Nunca escreva nós de especificação, plano ou entrega diretamente com base neste documento. Este
   documento é o *material* que se entrega ao `/analyse` e ao `/plan-work`; são eles que escrevem.
4. Onde este documento diz "provável" (epics, nomes de tarefas), é orientação de dimensão. O
   `backlog-decomposer` e o `execution-contract-binder` decidem. Onde diz "decidido", é decisão do
   humano e não se reabre.

---

## 1. O que se quer construir

Um **cockpit de simulação de investigação**: uma tela no frontend onde um curador escolhe uma
versão de caso (rascunho ou publicada), monta o sujeito da investigação, e roda **uma hipótese
isolada** ou **o caso completo** contra os connectors e o modelo de linguagem **reais**, lendo de
volta veredito, citações, evidência por conceito, tempo por estágio e tokens por chamada — **sem
gravar nada, sem produzir uma `investigation`, sem alterar o que `diagnose` faz**.

Isso é uma **capacidade nova** do sistema (o motor de investigação passa a ser executável de um
segundo jeito), e não uma mudança de superfície. Pela tabela "Which route a change takes" do
`CLAUDE.md`, o caminho é `/analyse` → `/plan-work` → `/implement-task` → `/review-change`.

Nome da capacidade: **`case-simulation`**, com duas operações: **`simulate-case`** e
**`simulate-hypothesis`**.

---

## 2. Decisões do humano (fechadas — não reabrir)

| # | Decisão | Consequência |
|---|---|---|
| D1 | A regra `only-a-released-case-version-is-diagnosed` **não se quebra**. `diagnose` continua (passa a) exigir `released`; nasce `POST /v1/simulate` que aceita qualquer estado. | Duas portas para o mesmo motor. |
| D2 | `simulate` devolve o **detalhe por hipótese** (verdicts, citações, evidência) que `diagnose` esconde de propósito. | O contrato de `diagnosis` não muda. |
| D3 | Nasce uma rota para julgar **uma hipótese isolada**. | `POST /v1/simulate/hypothesis`. |
| D4 | **LLM real, sempre.** Sem modo "fake"/sem custo. Um motivo explícito: medir o custo real das simulações. | Custo em tokens deve ser capturado e devolvido. |
| D5 | Hipótese isolada e caso completo **na mesma tela**, entregues juntos. | Uma tela, duas ações. |
| D6 | **O release gate entra no escopo**: `diagnose` passa a recusar `draft` (a regra existe na especificação e nunca foi implementada — ver §3.1). | Um epic pequeno, no plano do backend. |
| D7 | **Sujeito derivado dos placeholders dos connectors** (`${subject:<atributo>}` nos `address`) é a leitura de "configurar os atributos necessários para cada chamada externa". Atributos por hipótese ficam fora do v1. | Ver §6.2. |
| D8 | **Sem editores embutidos** no cockpit. Links de ida e volta às telas de edição já entregues. | Ver §6.5. |
| D9 | **Tokens, não moeda**, na tela. Nenhuma tabela de preço em nó de especificação ou no backend. | Se um dia quiser R$, é config de frontend, fora da especificação. |
| D10 | **Evidência de simulação nunca entra em cache.** Um `diagnose` real nunca lê o que uma simulação trouxe. | Regra e cenário explícitos. |
| D11 | **Mostrar o prompt enviado ao modelo** numa aba do detalhe. Seguro porque `constraints/the-judgment-prompt-is-closed` fixa o prompt. | O port de julgamento devolve o prompt materializado. |

---

## 3. Fatos levantados no repositório (verificados em 2026-08-26)

Caminhos relativos à raiz do repositório. A sessão executora deve **reler** antes de confiar — o
código pode ter movido.

### 3.1 O release gate existe na especificação e não no código

- Regra: `knowledge/rules/investigation/only-a-released-case-version-is-diagnosed.md`
  (`type: policy`, `consistency: eventual`, constrange `domain/investigation/investigation` e
  `domain/knowledge/case-version`). Statement: *"An investigation may only be pinned to a case
  version in released state; a draft version may be read but never diagnosed against."*
- Cenário: `knowledge/scenarios/investigation/a-draft-case-version-refuses-diagnosis.md`.
- **Nenhum código aplica a regra**: não há checagem de estado em `src/src/http/diagnose.controller.ts`,
  `src/src/http/diagnose.routes.ts`, `src/src/investigation/run-diagnosis.ts`,
  `src/src/investigation/investigation-factory.ts` nem `src/src/case/case-query.service.ts`
  (`readCase` lê draft e released igual). Não existe classe de erro para "não released" em
  `src/src/errors/` (existem só `CaseVersionNotDraftError`, `CaseVersionNotDraftAtReleaseError`,
  `CaseHoldsNoDraftError`, `CaseAlreadyHasDraftError`). `siegard-trace.json` tem zero bindings
  para a regra.
- A tarefa que a implementaria está num plano **fechado** e nunca começou:
  `work/case-lifecycle/task/diagnosis-release-gate/diagnosis-refuses-a-draft-pin.md`;
  `work/case-lifecycle/closure.md:4`: *"task/diagnosis-refuses-a-draft-pin carries no record at all
  and was never started under this plan."* Um plano fechado não é evoluído: a tarefa é **recortada
  de novo** na iniciativa nova (D6), nunca referenciada no plano antigo.

### 3.2 Pipeline atual do `diagnose`

`src/src/investigation/run-diagnosis.ts` (por volta das linhas 184-199):

```ts
const subject   = buildSubject(options.subjectType, options.subjectAttributes);
const evidence  = await collectEvidence(...);                                   // etapa 1
const evidenceByHypothesis = evidenceByHypothesisOf(options.case, evidence);
const evaluations = await judgeHypotheses(...);                                 // etapa 2
const { resolved, narrowedInput } = resolveAndNarrow({ case, evaluations, evidenceByHypothesis }); // 3
const assessment = await draftAssessment({ resolved, narrowedInput, consolidationRegister, consolidator }); // 4
const investigation = await buildInvestigation(...);                            // etapa 5
await writeWithinDeadline({ store, investigation, now, deadline });             // etapa 6
return investigation.assessment;
```

| Etapa | Arquivo | Orçamento | Produz |
|---|---|---|---|
| 1 coleta | `src/src/investigation/evidence-collection-stage.ts` | `COLLECTION_STAGE_BUDGET_MS = 7_000`, clamp por `capability.timeout` | `Evidence[]`, um por conceito de `collectionPlan(case)` |
| 2 julgamento | `src/src/investigation/judgment-stage.ts` | `JUDGMENT_STAGE_BUDGET_MS = 5_000`, pool `POOL_SIZE` | `Evaluation[]`, um por `requiresEvaluationOf(case)` |
| 3 resolve+narrow | `src/src/investigation/resolve-and-narrow-input.ts` | síncrono | `{ resolved, narrowedInput }` |
| 4 consolidação | `src/src/investigation/draft-assessment-text.ts` | nominal 4 s, não aplicado (gap documentado em `run-diagnosis.ts:22-25`) | `Assessment` |
| 5 build | `src/src/investigation/investigation-factory.ts` | — | `Investigation` |
| 6 persistência | `run-diagnosis.ts` (~307-314) | `PERSISTENCE_STAGE_BUDGET_MS = 2_000`; única etapa que lança (`InvestigationWriteDeadlineExceededError`) | — |

Composição de produção: `src/src/factories/production-diagnose.factory.ts` — fixa
`AnthropicHypothesisEvaluator` + `AnthropicAssessmentConsolidator`, `TOTAL_DEADLINE_BUDGET_MS = 20_000`.

Controller: `src/src/http/diagnose.controller.ts` — grava placeholders zero:
`UNMEASURED_COST: Cost = { calls: 0, input_tokens: 0, output_tokens: 0 }` e
`UNMEASURED_DURATIONS = { collection: 0, judgment: 0, writing: 0, total: 0 }`.

DTO: `src/src/http/dto/diagnose.dto.ts` — request
`{ case:{slug, version}, subject:{type, attributes:[{attribute, value}]+}, narrative, requester, ticket_ref? }`;
response `Assessment = { outcome, referral, determining_hypothesis?, text }`.

### 3.3 Tipos intermediários (backend)

- `Evidence` (`src/src/investigation/evidence.ts`): `{ concept, inputs, observation, observed_at, ttl, origin, result, result_detail?, capability_name, capability_version }`. **A duração por conceito não é registrada** (comentário em `evidence-collection-stage.ts:16-21`); `ttl` é fixo 60.
- `Evaluation` (`src/src/investigation/evaluation.ts`): união discriminada por `verdict` —
  `confirmed`/`refuted` com `citations: [Citation, ...]` não vazio; `inconclusive` com `reason` e `citations` possivelmente vazio. `Citation = { concept, field }`.
- `ResolvedOutcome` (`src/src/case/case-resolution.ts`): `{ outcome, referral:{action, recipient}, determining? }`.
- `Investigation` (`src/src/investigation/investigation.ts`): `{ id, requester, ticket_ref?, narrative, subject, pinned_case:{slug,version}, prompt_version, model, evidence[], evaluations[], assessment, cost, durations, written_at }`.
- Ports: `src/src/investigation/hypothesis-evaluator.port.ts` (`evaluate(criterion, evidence, caseContext)`), `src/src/investigation/assessment-consolidator.port.ts` (`consolidate(evaluations, evidence, register) → Promise<string>`), `src/src/investigation/observation-source.port.ts` (`ObserveConceptOptions.remainingBudgetMs?`).
- `caseContext` = `{ title: theCase.title, whenToUse: theCase.when_to_use }` (`judgment-stage.ts` ~75). **O subject nunca entra no prompt.** O prompt monta `<judgment_input>` com `<criterion>`, `<evidence>`, `<case_title>`, `<case_when_to_use>` (`src/src/adapters/anthropic-hypothesis-evaluator.adapter.ts` ~225-242).

### 3.4 Vocabulários fechados (nós de especificação)

- `knowledge/domain/investigation/verdict.md`: `confirmed | refuted | inconclusive`.
- `knowledge/domain/investigation/evidence-result.md`: `ok | unavailable | denied | timeout`. *"Only ok carries a usable observation; the other three are facts about the attempt, and only ok may enter a cache."*
- `knowledge/domain/investigation/evaluation-reason.md`: `no-data | judgment-failure | deadline-exceeded`.
- Como cada `reason` surge em `judgment-stage.ts`: `no-data` — alguma evidência da hipótese com `result !== 'ok'`, **o LLM não é chamado**; `deadline-exceeded` — sem slot no pool ou chamada não voltou a tempo; `judgment-failure` — falha do provider, JSON imparseável, citação inválida após um retry, ou modelo respondeu `inconclusive` (o adapter colapsa isso em `judgment-failure`).

### 3.5 Precedência e "hipótese requerida"

`src/src/case/case-resolution.ts`: `byPrecedence` ordena o manifest por `position`; `collectionPlan` é a união dos `collects` em ordem; `requiresEvaluationOf` devolve **todas** as hipóteses do manifest — **não existe hipótese opcional** (regra `rules/investigation/one-evaluation-per-required-hypothesis`: *"inconclusive counts, silence does not"*); `resolveOutcome` escolhe a primeira `confirmed` por posição → `resolution` da revisão + `determining`; nenhuma → `case.fallback`, sem `determining` (regra `rules/investigation/the-outcome-comes-from-the-case`).

### 3.6 Custo de LLM não é medido em lugar nenhum

- `grep -rn "usage" src/src --include=*.ts` (fora de spec) → zero ocorrências.
- `src/src/adapters/anthropic-hypothesis-evaluator.adapter.ts` (~131-136) e `src/src/adapters/anthropic-assessment-consolidator.adapter.ts` (~101-106): `client.messages.create(...)`, lêem só `message.content`, descartam `message.usage`. Sem medição de latência.
- Os ports não têm canal para tokens (documentado em `run-diagnosis.ts:131-139` e `diagnose.controller.ts:22-33`).
- **A especificação exige o dado**: `knowledge/domain/investigation/cost.md` — *"N hypotheses cost N judgment calls plus one writing call… Recorded so the projections answer which cases are expensive with data, not with opinion."* `knowledge/domain/investigation/durations.md` idem para tempos. Preencher isso é **realizar fato existente**, não inventar fato.
- SDK `@anthropic-ai/sdk`; config em `src/src/config/env.ts`: `EVALUATOR_MODEL`, `EVALUATOR_MAX_TOKENS?` (1024), `CONSOLIDATOR_MODEL`, `CONSOLIDATOR_MAX_TOKENS`, `POOL_SIZE`, `DEFAULT_CONSOLIDATION_REGISTER`, `PROMPT_VERSION`, `ANTHROPIC_API_KEY`.

### 3.7 Cache de observação

Em 2026-08-26 **não existe camada de cache de observação no código** (`grep -rl cache src/src` só acha menções em `evidence-result.ts` e repositórios relacionais sem relação). A especificação prevê cache (`evidence-result.md`, atributo `ttl` em `evidence.md`). Logo D10 é, hoje, uma **afirmação de especificação** (regra + cenário) e, no código, uma composição que garante que a simulação nunca receba uma camada de cache quando ela existir. Não há `if` a escrever hoje; há uma composição a nomear.

### 3.8 Endings e budget (trabalho recente que toca os mesmos arquivos)

- Iniciativa **viva** (sem `closure.md`): `work/backend-spec-conformance-corrections/`. Ela toca `evidence-collection-stage.ts` e o adapter HTTP de observação. Tarefas recentes: `observation-port-unavailable-endings` (adapter devolve `unavailable` com `result_detail` para 4 erros de resolução em vez de lançar — regra `rules/integration/an-unresolvable-observation-ends-unavailable`), `observation-port-budget-clamp` (adapter limita a `min(capability.timeout, remainingBudgetMs)`), e **pendente** `collection-stage-propagates-remaining-budget` (o estágio ainda não propaga `effectiveBoundMs` ao port; faz o próprio race e grava `timeout` com `result_detail: "no observation within Nms"`).
- **Implicação**: a iniciativa do cockpit (backend) vai editar `evidence-collection-stage.ts` (para `elapsed_ms`). Verifique com `python3 .claude/bin/deliver.py --outstanding` (ver `--help`) o que resta em `backend-spec-conformance-corrections` antes de planejar; se possível, entregue o que resta ali primeiro, ou aceite o conflito de merge previsto pelo docstring de `deliver.py`.

### 3.9 Frontend — o que existe

- Stack: React 19, `@tanstack/react-router`, `@tanstack/react-query`, `zod`, `react-hook-form`, `sonner`. Raiz do target: `frontend/app` (ver `siegard.json`).
- API: `frontend/app/src/services/api-client.ts` (`apiFetch<T>`; não-2xx vira `ApiError{code,message,details?}`); `frontend/app/src/services/error-ui-state.ts` mapeia `code` → estado de UI (tabela fechada; `generic-error` fallback); `frontend/app/src/services/query-client.ts`.
- Padrão de tela: par *screen* / *ready-view* / *hooks* (ex.: `frontend/app/src/routes/connector-configuration-detail-screen.tsx`, `connector-configuration-detail-ready-view.tsx`, `frontend/app/src/hooks/use-test-connector-panel.ts`).
- Componentes compartilhados: `frontend/app/src/shared/components/status-table.tsx` (`StatusTable{columns, rows, onRowClick}`; célula `{color,label}` vira ponto+texto), `json-textarea-field.tsx`, `conflict-banner.tsx`, `app-shell.tsx` (sidebar Cases | Glossary | Capabilities | Connectors; breadcrumb via `ROUTE_LABELS`).
- Cores de status já convencionadas: `draft: bg-warning`, `released: bg-success`, ausência `bg-muted` (`cases-list-screen.tsx` ~189-191).
- Catálogo TUI (alias `@tui/ui/*`, em `frontend/tui/frontend/src/shared/components/ui/`): `alert banner breadcrumb button card checkbox date-picker dialog divider empty input kbd label link multi-combobox panel person-picker progress radio-group select sheet skeleton stat-panel status-bar switch table tabs textarea tooltip`. Ainda **não usados** no app e úteis aqui: `stat-panel`, `progress`, `card`, `panel`, `sheet`, `skeleton`, `empty`, `alert`.
- Tokens de design: `frontend/app/src/design-system/tokens.css`.
- Rotas (`frontend/app/src/routes/route-tree.tsx`): `/cases`, `/cases/$slug` (Tabs Versions/Hypotheses/Attributes), `/cases/$slug/versions/$version` (editor), `/cases/$slug/versions/new?sourceVersion=`, `/cases/$slug/versions/$version/manifest`, `.../manifest/hypotheses/$hypothesisName` (revisar), `.../manifest/hypotheses/new`, `/glossary`, `/capabilities`, `/capabilities/$name/$version`, `/connectors`, `/connectors/$connector`. **Não existe rota de investigação/diagnose/simulação.**
- Precedente direto: painel "Test connector" — `frontend/app/src/hooks/use-test-connector-panel.ts`, `frontend/app/src/routes/connector-test-panel-fields.tsx`, `connector-test-panel-result.tsx`; backend `src/src/http/dto/test-connector.dto.ts`; contrato `knowledge/contracts/integration/connector-diagnostics.md`. Ele já monta sujeito (tipo do glossário + pares atributo/valor), escolhe capacidade, mostra `input_schema` como referência, e exibe request/response cru com `elapsedMs`.
- `intake/layout/`: **não existe** nenhuma referência de layout no projeto até hoje. O wireframe da §6 deste documento pode virar a primeira, se o `/plan-work` quiser um `reference` (ver `CLAUDE.md` › Plan › `reference`).

### 3.10 Projeto e convenções de iniciativa

- `siegard.json`: `specification_root: knowledge`, `work_root: work`, `delivery_root: delivery`, targets `backend: src`, `frontend: frontend/app`, standards `standards/backend-node-service.yaml` e `standards/frontend-typescript.yaml`. **Sem `telemetry_root` e sem `edits_freely`** declarados.
- Convenção observada: iniciativas são **separadas por target** (`…-backend` / `…-frontend`), porque uma iniciativa tem um work root e um delivery root e um `/implement-task` roda sobre um target. Seguir isso: **duas iniciativas**, `case-simulation-backend` e `case-simulation-frontend`.
- Contextos delimitados (`knowledge/domain/*/_context.md`): `glossary` (supporting), `integration` (generic; hospeda `test-connector`), `investigation` (supporting; hospeda `diagnosis`), `knowledge` (core; casos, versões, hipóteses). **A capacidade nova pertence a `investigation`.**
- Schemas de nó: `.claude/schemas/spec/contract.json` (para `type: api`: obrigatórios `direction ∈ {published, consumed}` e `operations[]` com slugs `^[a-z0-9]+(-[a-z0-9]+)*$`; permitidos só `type, display, direction, operations, upstream`); `.claude/schemas/spec/rule.json` (`type ∈ {invariant, policy, state-machine}` e `statement`; `policy` exige `constrains[]` e `consistency` quando cruza agregado). Sempre reler o schema; não escrever de memória.

### 3.11 Regras existentes que a capacidade nova precisa respeitar sem contradizer

- `rules/investigation/the-customer-sees-only-the-text` — protege o **cliente final**: *"outcome, referral, verdicts and evidence face the operation, never the customer."* O cockpit é a operação; expor tudo ao curador está do lado certo. O contrato deve dizer isso explicitamente.
- `rules/investigation/the-writing-input-is-narrowed` — a consolidação recebe avaliações + evidência citada; nunca critérios/`when_to_use`. Inalterado.
- `rules/investigation/an-answer-arrives-within-the-declared-deadline` — 20 s = 2 + 7 + 5 + 4 + 2. Simulação de caso: sem a etapa de persistência.
- `rules/investigation/an-investigation-is-written-once`, `the-response-follows-the-record`, `replay-is-pinned` — aplicam-se a `investigation`; uma simulação que não cria `investigation` não as viola nem precisa delas.
- `constraints/the-judgment-prompt-is-closed`, `constraints/the-consolidation-prompt-is-closed` — o prompt é fixo; devolvê-lo materializado não o altera.

---

## 4. Incremento de especificação (material para `/analyse`)

Entregar ao `/analyse` como **material**; ele escreve os nós, valida com `bin/spec.py`, deriva as
projeções e registra no `knowledge/decision-log.md` o que decidiu. Os rascunhos abaixo mostram a
intenção; a forma final é a que o schema aceitar. Textos de nó em inglês, como a especificação.

### 4.1 Contrato novo — `knowledge/contracts/investigation/case-simulation.md`

```markdown
---
type: api
direction: published
operations:
  - simulate-case
  - simulate-hypothesis
---

## Description

The curator's entry to the same engine diagnosis runs: a case version in either state, a subject
assembled the way any observation assembles one, and the whole record of what the engine did comes
back — evidence per concept with how long each observation took, evaluation per hypothesis with the
prompt the judgment received and what the provider charged for it, the resolved outcome, the
assessment, durations per stage and cost. Diagnostic only, and it faces the operation, never the
customer: no investigation is written, no event is emitted, nothing it collects enters a cache, and
nothing it returns is evidence any investigation ever reads. `simulate-hypothesis` narrows the run
to what one hypothesis revision collects and to that hypothesis alone, and resolves no outcome —
one hypothesis does not resolve a case.
```

### 4.2 Regra nova — `knowledge/rules/investigation/a-simulation-writes-no-investigation.md`

```markdown
---
type: policy
statement: A simulation runs the engine over a case version in any state and writes no investigation; what it collects and judges is never evidence and never enters a cache.
constrains:
  - domain/investigation/investigation
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A curator composing a draft needs to watch the engine judge it before releasing it, and an
auditor needs to see a released version's verdicts and evidence — neither is a diagnosis. The
release rule keeps every real diagnosis on a released version; this rule keeps every simulation
out of the record, so the two never meet: what a simulation collected cannot warm what a diagnosis
reads, and what it judged is never the answer anyone was given.
```

### 4.3 Cenários novos — `knowledge/scenarios/investigation/`

`a-draft-case-version-is-simulated.md`:
- subject: `rules/investigation/a-simulation-writes-no-investigation`
- given: a case version exists in draft state; a subject with at least one attribute
- when: a simulation of the case is requested
- then: the engine collects, judges, resolves and drafts; the response carries every evaluation with its verdict and citations, every evidence item with its result, the cost and the durations; no investigation is written

`a-simulation-never-enters-the-cache.md`:
- subject: same rule
- given: a simulation collected an evidence item with result `ok`
- when: a diagnosis of the same case and subject runs afterwards
- then: the diagnosis observes the concept again; nothing the simulation collected is read back

`a-single-hypothesis-is-simulated.md`:
- subject: same rule (ou o contrato, se o schema de cenário aceitar contrato como subject — verificar `scenario.json`)
- given: a case version whose manifest holds more than one hypothesis
- when: a simulation of one named hypothesis is requested
- then: only the concepts that hypothesis collects are observed; exactly one evaluation returns; no outcome and no assessment are resolved

### 4.4 Ajustes em nós existentes

- `knowledge/domain/investigation/evidence.md` — atributo novo `elapsed_ms` (`integer`, required): quanto a observação levou. Hoje o estágio não guarda a duração (§3.3); a simulação a exibe por conceito e o `diagnose` grava a mesma coisa.
- `knowledge/domain/investigation/evaluation.md` — a decisão de onde vivem `usage {input_tokens, output_tokens}`, `elapsed_ms` e `prompt` da avaliação é do `/analyse`: como atributos da avaliação (mais simples; `cost.md` agregado continua sendo a soma), ou como um value-object novo. **Não decidir aqui**; entregar o fato: *"each judgment call has a token usage, a duration and the materialized prompt it received, and the simulation exposes them per hypothesis."*
- `knowledge/domain/investigation/hypothesis-evaluator.md` e `assessment-consolidator.md` — se o `/analyse` entender que a responsabilidade do port deve declarar que devolve uso/duração, ajusta; caso contrário isso é forma de código, não fato.
- **Nada a escrever** para o release gate: regra e cenário já existem (§3.1).

### 4.5 Entradas do decision log que o `/analyse` deve registrar

- Tokens são fato do domínio (`cost.md` já o diz); **moeda não é** e fica fora da especificação (D9).
- A simulação **exclui `narrative` e `ticket_ref`**: ambos vão só para a `investigation`, que não existe na simulação; `narrative` não entra no prompt de julgamento.
- Prazo da simulação de caso: o total declarado menos o orçamento de persistência (20 − 2 = 18 s), porque a etapa não corre. Se o `/analyse` preferir manter 20 s como teto único, registrar.

---

## 5. API (material para `/plan-work` — backend)

### 5.1 `POST /v1/simulate` — `simulate-case`

Request:
```json
{
  "case": { "slug": "string", "version": 1 },
  "subject": { "type": "string", "attributes": [{ "attribute": "string", "value": "string" }] },
  "requester": "string",
  "consolidation_register": "formal | plain (opcional; default da config)"
}
```

Response (200):
```json
{
  "case": { "slug": "…", "version": 3, "state": "draft | released" },
  "subject": { "type": "…", "attributes": [ … ] },
  "evidence": [{
    "concept": "…", "capability_name": "…", "capability_version": "…", "origin": "<connector>",
    "result": "ok | unavailable | denied | timeout", "result_detail": "…?",
    "observation": "<string>", "observed_at": "<datetime>", "elapsed_ms": 214
  }],
  "evaluations": [{
    "hypothesis": "…", "position": 1,
    "verdict": "confirmed | refuted | inconclusive", "reason": "no-data | judgment-failure | deadline-exceeded (só em inconclusive)",
    "citations": [{ "concept": "…", "field": "…" }],
    "usage": { "input_tokens": 980, "output_tokens": 212 },
    "elapsed_ms": 1600,
    "prompt": "<judgment_input> materializado, ou ausente quando o julgamento não foi chamado (no-data)"
  }],
  "resolved": { "outcome": "…", "referral": { "action": "…", "recipient": "…" }, "determining": "…?" },
  "assessment": { "outcome": "…", "referral": { … }, "determining_hypothesis": "…?", "text": "…" },
  "cost": { "calls": 3, "input_tokens": 3100, "output_tokens": 800 },
  "durations": { "collection": 1800, "judgment": 1600, "writing": 700, "total": 4100 },
  "model": "…", "prompt_version": "…", "simulated_at": "<datetime>"
}
```

Erros: caso/versão inexistente (reutilizar os erros de `case-query`); sujeito inválido (mesmas regras de `diagnose`: `a-subject-carries-at-least-one-attribute`, `a-subject-attribute-is-drawn-from-the-glossary`). **Nenhum erro por estado da versão.**

### 5.2 `POST /v1/simulate/hypothesis` — `simulate-hypothesis`

Request: `{ case, hypothesis: "<nome no manifest>", subject, requester }`.

Response: `case`, `subject`, `hypothesis: { name, position, criterion, collects: [concept] }`,
`evidence[]` (só os conceitos que ela coleta), `evaluation` (única, mesmo shape acima, com `prompt`),
`cost`, `durations: { collection, judgment, total }`, `model`, `prompt_version`, `simulated_at`.
**Sem `resolved` e sem `assessment`.**

Erro adicional: hipótese não pertence ao manifest da versão.

### 5.3 Release gate em `diagnose` (D6)

`POST /v1/diagnose` sobre versão `draft` → erro nomeado (sugestão `CaseVersionNotReleasedError`,
seguindo o padrão de `src/src/errors/`), mapeado em `error-ui-state.ts` no frontend se alguma tela
chamar diagnose (hoje nenhuma chama). Realiza a regra e o cenário de §3.1.

### 5.4 Comparativo

| | `diagnose` | `simulate-case` | `simulate-hypothesis` |
|---|---|---|---|
| aceita `draft` | não (após D6) | sim | sim |
| escreve `investigation` / emite `investigation-completed` | sim | não | não |
| evidência `ok` entra em cache (quando houver cache) | sim | não | não |
| devolve verdicts, citações, evidência, prompt, usage | não | sim | sim |
| connectors reais / LLM real | sim | sim | sim (1 chamada de julgamento) |
| exige `narrative` / `ticket_ref` | sim / opcional | não | não |
| prazo | 20 s | 18 s | coleta 7 s + 1 julgamento |

---

## 6. A tela (material para `/plan-work` — frontend)

### 6.1 Rota e entrada

`/cases/$slug/versions/$version/simulate`. Entrada: botão "Simular" na tela da versão
(`/cases/$slug/versions/$version`) e na aba Versions de `/cases/$slug`. Funciona em `draft` e
`released`; em `released` os links de edição apontam para "criar rascunho a partir desta versão"
(`/cases/$slug/versions/new?sourceVersion=<n>`, já existente).

### 6.2 Layout (desktop; em telas estreitas empilha nesta ordem)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Cases › <slug> › v<version> › Simular                                                 │
│ <slug> · v<version>  ● draft            [Editar versão]  [Manifest]  [▶ Simular caso] │
│ "<when_to_use>"                                                          ⏱ 18 s prazo │
├───────────────────────────────┬───────────────────────────────────────────────────────┤
│ SUJEITO                       │ HIPÓTESES  (ordem de precedência · N · todas requeridas)│
│ Tipo      [<glossário> ▾]     │ # │ Hipótese │ Coleta │ Veredito │ Custo (tok) │ ▶ ✎   │
│ Requester [__________]        │ 1 │ …        │ 2      │ ● confirmed │ 1.2k    │ ▶ ✎   │
│                               │ 2 │ …        │ 1      │ ◐ inconclusive · no-data │ — │▶ ✎│
│ Exigidos pelos connectors:    │ 3 │ …        │ 1      │ ○ idle     │         │ ▶ ✎   │
│  <attr>  [_______]            │ Determinante: <h> → outcome <o> · referral <a> / <r>  │
│    ← <connector> (<capability>)│ Última execução · há 42 s · 4.1 s · 3 chamadas · 3.9k tok│
│  <attr>  [_______]            │ [coleta 1.8s ▓▓▓░░░░ 7s][julg. 1.6s ▓▓░░░ 5s][escrita 0.7s ▓░░░ 4s]│
│  [+ atributo]                 │                                                       │
│ [Ver JSON do sujeito]         │                                                       │
├───────────────────────────────┴───────────────────────────────────────────────────────┤
│ DETALHE ─ <hipótese selecionada>                        [Evidência] [Prompt] [JSON]   │
│ Veredito ● confirmed     Citações  <concept>.<field> · <concept>.<field>              │
│ Critério "<criterion>"                                                                │
│ Evidência                                                                              │
│  <concept>  ok        <capability> <version> → <connector>              214 ms        │
│   { …observation JSON dobrável… }                                                     │
│  <concept>  timeout   <capability> → <connector>   "no observation within 5000ms"     │
│ Julgamento  <model> · prompt <prompt_version> · 1 chamada · 980 in / 212 out · 1.6 s   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ RESULTADO DO CASO                                                       run #3 · 14:02│
│ Outcome <o>     Referral <a> → <r>     Determinante <h>                               │
│ Texto ao cliente (<register>):  "<assessment.text>"                                   │
│ Execuções nesta sessão   #3 14:02 <o> 3.9k · #2 13:58 fallback 2.1k · #1 …  [Comparar]│
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Regiões

**Cabeçalho** — identidade e estado da versão (cores já convencionadas), `when_to_use`, links
"Editar versão" e "Manifest" (telas existentes), ação principal "Simular caso", prazo declarado.

**Sujeito (D7)** — um sujeito por simulação, compartilhado entre hipótese isolada e caso completo.
Campos: tipo (vocabulário do glossário), requester (obrigatório), atributos. Os **atributos
exigidos são pré-derivados** antes de rodar:
1. `collectionPlan` da versão → conceitos (operação já publicada em `case-query`/`case-version`).
2. Registry de capacidades → para cada conceito, a capacidade que o responde e seu connector
   (`/capabilities` e `/connectors` já publicados).
3. Configuração do connector → `address` com placeholders `${subject:<atributo>}` (ex.:
   `…/technicians/${subject:user-id}/profile` exige `user-id`).
4. Um campo por placeholder distinto, anotado com o connector (e capacidade) que o pede;
   `input_schema` da capacidade como dica (é texto livre — pode ser prosa, como no caso
   `perfil-mobile-tecnico-reader`). O curador pode adicionar atributos livres. "Simular" fica
   desabilitado enquanto um exigido está vazio ou o requester está vazio.
Toda essa derivação é feita **no frontend a partir de endpoints já publicados** — não exige rota nova.
Se o `/plan-work` julgar que a derivação é um fato de domínio ("quais atributos um plano de coleta
exige"), o binder o dirá como nota `unstated` e o decisor cego decide; não antecipar.

**Hipóteses** — `StatusTable` em ordem de precedência, **uma linha por hipótese do manifest**,
sempre todas (§3.5). Colunas: posição, nome, nº de conceitos coletados, veredito da última
execução (com `reason` quando inconclusive), custo em tokens da última execução, ações
(▶ simula só esta hipótese; ✎ abre a revisão da hipótese com retorno — §6.5). Abaixo: linha
determinante → outcome → referral, e sumário da última execução com barra segmentada dos três
estágios contra os orçamentos 7 / 5 / 4 s (componente `progress`).

**Detalhe** — abre ao selecionar uma linha. Veredito e citações em destaque; critério como julgado;
evidência por conceito (resultado, capacidade → connector, `elapsed_ms`, observação em JSON
dobrável, `result_detail` quando houver); dados do julgamento (modelo, versão do prompt, tokens,
tempo). Abas: **Evidência** (padrão), **Prompt** (D11 — o `<judgment_input>` como foi ao modelo,
em `<pre>` mono; ausente com explicação quando `no-data`, porque o julgamento não foi chamado),
**JSON** (a resposta crua da operação para aquela hipótese).

**Resultado do caso** — só após `simulate-case`. Outcome, referral e determinante em uma linha; o
texto ao cliente numa caixa com o registro escolhido (`formal`/`plain`); **histórico das
execuções desta sessão, em memória** (nada persistido — coerente com D10 e com a regra), com
"Comparar" lado a lado, hipótese por hipótese. Quando a versão muda (ver §6.5), a última execução
ganha a marca "desatualizada".

### 6.4 Estados e vocabulários (sem tradução criativa)

| Vocabulário | Valores | Na tela |
|---|---|---|
| `verdict` | confirmed / refuted / inconclusive | pílula verde / vermelha / âmbar; `inconclusive` **sempre** com `reason` |
| `evaluation-reason` | no-data / judgment-failure / deadline-exceeded | texto ao lado; `no-data` destaca em âmbar a evidência não-ok que o causou e diz "julgamento não chamado · 0 tokens" |
| `evidence-result` | ok / unavailable / denied / timeout | por conceito: verde / cinza / vermelho / âmbar, com `result_detail` |
| execução | idle / running / done / error | `running`: estágios acendendo em sequência com tempo correndo contra o orçamento; `error` **só** para falha da operação (rede, 5xx), nunca para um veredito |

Falha parcial é resultado, não erro: connector `unavailable` → hipótese `inconclusive/no-data` → o
caso segue → `fallback` se nada confirmar. A cadeia deve ser legível de um olhar (evidência âmbar,
hipótese âmbar, outcome marcado como fallback).

Uma execução por vez por tela (botões desabilitam durante `running`). Sem estado no servidor.

### 6.5 Editar e re-simular (D8)

Sem formulários de edição no cockpit. ✎ leva a `/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName`
com `?back=simulate`; "Editar versão" a `/cases/$slug/versions/$version`; "Manifest" a `.../manifest`.
Ao voltar: invalidar a query da versão, recarregar a tabela, marcar a última execução como
"desatualizada" (comparar um hash/`updated_at` da versão se existir; senão, marcar sempre ao voltar).
Em `released`, os links levam a criar rascunho a partir da versão.

### 6.6 Construção (frontend)

- Rota em `route-tree.tsx` + `ROUTE_LABELS`; tela `case-simulation-screen.tsx` no padrão
  screen / ready-view / hooks.
- Hooks: `use-simulation-subject` (deriva exigidos — §6.3), `use-simulate-case`,
  `use-simulate-hypothesis` (`useMutation` + `apiFetch`, como `use-test-connector-panel`),
  `use-simulation-history` (estado em memória, comparação).
- Reaproveitar: `StatusTable`, `JsonTextareaField`, padrão visual de `connector-test-panel-result.tsx`
  (`<pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">`),
  e do catálogo TUI: `stat-panel`, `progress`, `panel`/`card`, `tabs`, `skeleton`, `empty`, `alert`.
  Nada novo de design system.
- Mapear os erros novos em `error-ui-state.ts`.

---

## 7. Construção (backend)

- **Um pipeline, duas montagens.** Extrair de `run-diagnosis.ts` as etapas 1-4 numa função que
  devolve o registro completo (`evidence`, `evaluations`, `resolved`, `assessment`, `cost`,
  `durations`, prompts). `diagnose` a chama e acrescenta `buildInvestigation` + `writeWithinDeadline`;
  `simulate` a chama e devolve o registro. **Nenhuma lógica de estágio duplicada.**
- **`simulate-hypothesis`** = `collectEvidence` com o plano restrito aos `collects` da revisão +
  `judgeHypotheses` com uma hipótese requerida. Mesmo código, entrada estreita. Sem etapas 3-4.
- **Composição sem cache (D10)** — uma composição/factory de simulação (paralela a
  `production-diagnose.factory.ts`) que monta o observation source sem qualquer camada de cache,
  hoje e quando ela existir. Composição, não `if`.
- **Ports com usage/duração/prompt (D4, D11)** — `IHypothesisEvaluator` e `IAssessmentConsolidator`
  passam a devolver `{ result, usage: {input_tokens, output_tokens}, elapsed_ms, prompt }`; os
  adapters Anthropic lêem `message.usage` e medem tempo; os fakes
  (`src/src/adapters/fake-hypothesis-evaluator.adapter.ts`, `fake-assessment-consolidator.adapter.ts`)
  devolvem zeros. `diagnose` deixa de gravar `UNMEASURED_*` e passa a gravar custo e durações reais.
  `evidence-collection-stage.ts` grava `elapsed_ms` por conceito.
- **Release gate (D6)** — `diagnose` recusa `draft` com erro nomeado.
- **DTOs** zod em `src/src/http/dto/`, no padrão de `diagnose.dto.ts` / `test-connector.dto.ts`;
  rotas em `src/src/http/` no padrão de `diagnose.routes.ts`.
- **Não escrever fato de domínio no código** que a especificação não tenha: se, ao implementar, algo
  parecer necessário e não estiver em nó, é um stop — volta ao `/plan-work` como nota, nunca se
  inventa no código (regra "Fix form, never knowledge" do `CLAUDE.md`).

---

## 8. Sequência de execução (uma invocação por passo; cada uma pode parar — isso é normal)

Pré-requisitos gerais: árvore git limpa em cada passo que escreve (todo entry point para sobre
mudanças não commitadas — commitar ou descartar é decisão humana); `siegard.json` já declarado
(§3.10). Comandos do framework: `python3 .claude/bin/<script>.py --help` imprime o docstring
completo — ler antes de usar.

### Fase 0 — Estado do terreno

```
/siegard-status
python3 .claude/bin/deliver.py --outstanding   (ver --help para a forma exata; iniciativa viva: backend-spec-conformance-corrections)
python3 .claude/bin/trace.py --check
git status
```
Objetivo: saber o que resta em `backend-spec-conformance-corrections` (§3.8) e se há drift.
Decisão a tomar com o humano: entregar o que resta ali primeiro, ou aceitar conflito previsto em
`evidence-collection-stage.ts`.

### Fase 1 — `/analyse` (um incremento)

Material: **a seção 4 deste documento inteira** (contrato, regra, cenários, ajustes, decision log),
mais as decisões da seção 2. Resultado esperado: nós novos e ajustados em `knowledge/`,
`bin/spec.py` validando, projeções derivadas, `knowledge/decision-log.md` com as entradas de §4.5
(e as que o próprio `/analyse` decidir). **Revisão humana**: `git diff knowledge/`. Commit.

Verificação: `python3 .claude/bin/spec.py knowledge` (forma exata em `--help`) sem violações;
`python3 .claude/bin/terms.py <termo>` para `simulate-case`, `simulate-hypothesis` se quiser
confirmar que o vocabulário existe.

### Fase 2 — `/plan-work` backend: iniciativa `case-simulation-backend`

Escopo a entregar ao `/plan-work` (target `backend`; work root novo `work/case-simulation-backend`,
delivery root novo `delivery/case-simulation-backend`): **§5 e §7 deste documento**, mais D6.
Epics prováveis (o `backlog-decomposer` decide):
- `measured-cost` — ports devolvem usage/duração/prompt; adapters Anthropic e fakes; `diagnose` grava real; `evidence.elapsed_ms`.
- `simulation-api` — pipeline extraído; composição sem cache; `POST /v1/simulate`; `POST /v1/simulate/hypothesis`; DTOs; erros.
- `diagnosis-release-gate` — `diagnose` recusa `draft`; erro nomeado. (Recorte novo; **não** referenciar `work/case-lifecycle`.)

Depois: `python3 .claude/bin/plan.py work/case-simulation-backend knowledge` valida; `plan.json` é
derivado. Ler `## Notes` de cada tarefa: uma nota `BLOCKING` para tudo até um humano resolver; uma
nota `unstated` já foi decidida pelo decisor cego e está no decision log — **revisar
`git diff knowledge/`** de novo, porque o planejamento pode ter escrito na especificação.

### Fase 3 — `/plan-work` frontend: iniciativa `case-simulation-frontend`

Escopo (target `frontend`; roots `work/case-simulation-frontend`, `delivery/case-simulation-frontend`):
**§6 deste documento**, mais D7, D8, D9, D11. Se o `/plan-work` quiser um `reference` de layout,
o wireframe de §6.2 pode ser salvo em `work/case-simulation-frontend/intake/layout/` **pelo
`/plan-work`**, não à mão (ver `CLAUDE.md` › Plan › `reference`: decide forma, nunca fato).
Epic provável: `simulation-cockpit` (rota e entrada; sujeito derivado; tabela de hipóteses;
detalhe com abas; resultado do caso e histórico; estados/erros).

O frontend depende das rotas do backend para os testes de integração, mas a decomposição pode ser
feita em paralelo. Tarefas puramente de derivação do sujeito (§6.3) só dependem de endpoints já
existentes.

### Fase 4 — `/implement-task`, um por tarefa

`python3 .claude/bin/deliver.py --outstanding` (com os roots da iniciativa; ver `--help`) diz a
ordem. Onde reportar um deliverable set com mais de uma tarefa, elas podem ir em worktrees
paralelos — o docstring de `deliver.py` tem as precondições e os dois conflitos a esperar.
Cada `/implement-task` escreve source (`task-implementer`) e testes (`test-author`) em contextos
separados, instala o que o standard autoriza, roda build e suíte, grava `implementation` e `proof`,
valida contra o plano, faz bind no trace, deriva `delivery.json`. **Um teste nunca é enfraquecido
para passar.** Se a suíte falha, o `failure-diagnostician` diz por quê; a correção passa pelo
mesmo `/implement-task` (nova iteração) ou, se for comportamento já entregue, por um corretivo do
`/plan-work`.

Ordem sugerida no backend: `measured-cost` → `simulation-api` → `diagnosis-release-gate` (ou o
gate primeiro, é independente). No frontend, tudo depois de `simulation-api` estar entregue e o
backend rodando localmente (para as provas que batem na API).

### Fase 5 — `/review-change` por frente

Uma revisão para o backend, uma para o frontend (ou por epic). Quatro passes; evidência, não
veredito. Ler os achados; o que for fato de domínio ausente volta para `/analyse` ou `/plan-work`;
o que for standard, corrige-se por nova iteração de `/implement-task`.

### Fase 6 — Verificação manual (humano) e fechamento

- Backend de pé, frontend em `http://localhost:5173`.
- Abrir `/cases/<slug>/versions/<n>/simulate` de um rascunho; conferir que os atributos exigidos
  aparecem anotados com o connector; rodar uma hipótese (▶) e o caso; conferir tokens > 0, tempos por
  estágio, aba Prompt; conferir que `POST /v1/diagnose` sobre o mesmo rascunho é recusado; conferir
  que nenhuma `investigation` foi gravada pela simulação (tabela em `src/migrations/`).
- `python3 .claude/bin/trace.py --check` sem drift `code` nas frentes entregues.
- Quando o humano declarar a iniciativa encerrada: `/plan-work` fecha o plano (`closure.md`); mais
  tarde `/siegard-archive` (fechado a sessões — o humano invoca).

---

## 9. Riscos aceitos e notas

| Tema | O que está em jogo | Postura |
|---|---|---|
| Chamadas reais | Simular bate em IFS/NOC/etc. e gasta LLM de verdade, como `test-connector` já faz. | Aceito (D4). `requester` obrigatório e "diagnostic only" no contrato tornam rastreável. |
| Orçamento da coleta não propagado ao port | `collection-stage-propagates-remaining-budget` pendente em `backend-spec-conformance-corrections`. | Não bloqueia. Os tempos ficam mais fiéis quando entregue; a tela não muda. |
| Conflito de arquivos | Duas iniciativas tocando `evidence-collection-stage.ts`. | Resolver na Fase 0 (entregar o pendente antes) ou aceitar merge com `/reconcile` depois. |
| Cache | Não existe no código hoje (§3.7). | D10 vira regra/cenário + composição nomeada; nada de `if`. |
| Histórico de execuções | Persistir criaria entidade nova. | Memória da sessão. Se um dia quiser histórico, é outro `/analyse`. |
| Moeda | Preço por token não é fato do domínio. | Tokens e modelo na tela (D9). |
| Duas iniciativas | Convenção do projeto separa por target. | `case-simulation-backend` e `case-simulation-frontend`, roots novos, nunca reusar roots fechados. |

---

## 10. Glossário mínimo para quem chega agora

- **case / case-version** — um caso de investigação e suas versões (`draft` editável, `released` imutável). Contexto `knowledge`.
- **hypothesis / hypothesis-revision** — hipótese nomeada; a revisão carrega `criterion` (prosa), `collects` (conceitos) e `resolution` (outcome + referral). O manifest da versão ordena hipóteses por `position` (precedência).
- **concept → capability → connector** — um conceito do glossário é respondido por uma capacidade registrada (com `input_schema`/`output_schema` como strings opacas, `timeout`, `nature`), que executa via um connector configurado (`address` com `${subject:<attr>}`, `method`, `responseMap`, `statusMap`).
- **subject** — o assunto observado: `type` do glossário + pares atributo/valor. Um por investigação/simulação. Nunca armazenado.
- **evidence** — o que um conceito devolveu (`result` ok/unavailable/denied/timeout, `observation`, origem, capacidade). `output_schema` é a lista branca de campos citáveis.
- **evaluation** — veredito de uma hipótese (`confirmed`/`refuted`/`inconclusive`+`reason`) com `citations` `{concept, field}`.
- **resolve-outcome** — primeira `confirmed` por precedência decide `outcome`/`referral`; nenhuma → `fallback` do caso.
- **assessment** — `{outcome, referral, determining_hypothesis?, text}`; só o `text` chega ao cliente final.
- **investigation** — o registro persistido de um `diagnose`. **A simulação nunca cria um.**
- **Siegard** — o framework deste repositório (`CLAUDE.md`): especificação → plano → entrega → trace, cada passo por skill, cada nó validado por script, estado em git.
