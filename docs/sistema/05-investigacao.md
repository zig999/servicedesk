# 8. Contexto Investigação — o registro imutável de um diagnóstico

O contexto Investigação é o que **executa** um caso sobre um assunto: coleta evidências, julga cada hipótese, resolve o desfecho, redige o texto do parecer, grava o registro e só então responde. A especificação o descreve como um contexto de suporte, "fino e óbvio por desenho" — a lógica de negócio mora no caso (contexto [Conhecimento](04-conhecimento.md)); este contexto apenas a roda sob um prazo absoluto (`knowledge/domain/investigation/_context.md`).

O produto de uma execução é uma **Investigation**: um registro completo, escrito uma única vez e nunca alterado. Não existe estado intermediário persistido, nem "investigação em andamento" no banco: ou a investigação inteira existe, ou não existe nada (`knowledge/rules/investigation/an-investigation-is-written-once.md`). Este capítulo descreve cada entidade desse registro e as regras que o governam. Como o registro é produzido — a sequência de estágios — é assunto dos capítulos [Pipeline](07-pipeline.md), [Coleta](08-coleta.md), [Julgamento](09-julgamento.md) e [Resolução, consolidação e gravação](10-resolucao-consolidacao-gravacao.md).

Uma observação sobre a forma do código: no contexto Investigação, quase todas as entidades são **tipos de dados puros** (`type` do TypeScript, sem classes nem métodos). O único construtor capaz de produzir uma Investigation válida é a função `buildInvestigation` em `src/investigation/investigation-factory.ts`; o único módulo com comportamento próprio além dela é `src/investigation/subject.ts` (`buildSubject`). Tudo o mais — coleta, julgamento, resolução — vive em módulos de estágio que produzem esses valores e os entregam à fábrica.

### Visão rápida do registro

| Parte | O que é | Cardinalidade dentro da Investigation |
|---|---|---|
| Investigation | A raiz do agregado: uma diagnose de um assunto sob um caso fixado | 1 |
| Subject | O que foi examinado (tipo + atributos identificadores) | 1 |
| SubjectAttributeValue | Um par atributo/valor que identifica a instância | 1..n dentro do Subject |
| Evidence | O que cada conceito coletado devolveu | exatamente 1 por conceito do plano de coleta |
| EvidenceResult | Como uma coleta terminou (`ok`, `unavailable`, `denied`, `timeout`) | 1 por Evidence |
| Evaluation | O julgamento de uma hipótese | exatamente 1 por hipótese exigida pelo caso |
| Verdict | O que o julgamento concluiu (`confirmed`, `refuted`, `inconclusive`) | 1 por Evaluation |
| EvaluationReason | Por que um julgamento foi inconclusivo | 1 quando `inconclusive` |
| Citation | Um ponteiro para o campo da evidência que fundamentou um veredito | 1..n quando decidido |
| Assessment | O parecer: desfecho, encaminhamento, hipótese determinante e texto | 1 |
| Cost | Custo no provedor de LLM (chamadas e tokens) | 1 |
| Durations | Duração de cada estágio, em milissegundos | 1 |

## 8.1 Investigation

**Propósito** — Uma diagnose de um assunto (Subject) sob um caso fixado (pinned case), escrita uma vez e nunca alterada. Guarda o registro completo — narrativa, evidências, avaliações, parecer, custo e durações — para que a resposta ao solicitante siga o registro e uma auditoria possa reproduzi-lo (`knowledge/domain/investigation/investigation.md`).

**Atributos** — tipo `Investigation` em `src/investigation/investigation.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `id` | `string` | sim | Identidade da investigação. Gerada pela rota HTTP com `randomUUID()` (`src/http/diagnose.controller.ts`). É a chave primária da tabela `investigations`; uma segunda escrita com o mesmo `id` é recusada (`an-investigation-is-written-once`). |
| `requester` | `string` | sim | Quem pediu o diagnóstico. Chega no próprio corpo da chamada `POST /v1/diagnose`; a coleta roda no escopo de autorização dele (`collection-runs-in-the-requester-scope`). |
| `ticket_ref` | `string` | não | Correlação com o sistema de tickets, nunca chave de casamento. Ausente quando a chamada não traz ticket — não se inventa um valor de preenchimento. |
| `narrative` | `string` | sim | O relato do problema, como o solicitante o descreveu. |
| `subject` | `Subject` | sim | O que está sendo examinado (ver 8.2). Montado e validado pela fábrica a partir de `subjectType` e `subjectAttributes` crus. |
| `pinned_case` | `PinnedCase` = `{ slug: string; version: number }` | sim | A materialização da relação `pinned-case` (cardinalidade 1, alvo `domain/knowledge/case`). Fixa o caso **por slug e versão**, nunca por um digest do conteúdo: uma versão liberada é escrita uma vez, então o par nomeia um conteúdo único (`replay-is-pinned`). |
| `prompt_version` | `string` | sim | Versão do prompt de julgamento/consolidação em vigor. Um dos quatro pinos de replay. Vem da configuração da rota (`DiagnoseControllerDependencies.promptVersion`). |
| `model` | `string` | sim | Modelo de LLM usado. Um dos quatro pinos de replay. Vem da configuração da rota (`DiagnoseControllerDependencies.model`). |
| `evidence` | `readonly Evidence[]` | sim | Uma evidência por conceito do plano de coleta do caso (ver 8.3). Um dos quatro pinos de replay. |
| `evaluations` | `readonly Evaluation[]` | sim | Uma avaliação por hipótese exigida pelo caso (ver 8.4). |
| `assessment` | `Assessment` | sim | O parecer devolvido ao solicitante (ver 8.6). |
| `cost` | `Cost` | sim | Custo no provedor de LLM (ver 8.7). |
| `durations` | `Durations` | sim | Duração de cada estágio (ver 8.8). |
| `written_at` | `string` (instante ISO-8601) | sim | Quando a única escrita aconteceu. Não é um estado: nada o lê para decidir se a investigação "terminou" e nada o altera depois. Não é um pino de replay. |

Os **quatro pinos de replay** são `pinned_case`, `model`, `prompt_version` e `evidence`: como o julgamento por LLM é não determinístico e modelos e prompts mudam, são eles que permitem a uma auditoria ler o que de fato rodou (`knowledge/rules/investigation/replay-is-pinned.md`).

**Invariantes e regras**

- Só existe um caminho para construir uma Investigation: `buildInvestigation(options)` em `src/investigation/investigation-factory.ts`. A fábrica recusa antes de montar qualquer coisa e, se aceita, monta o valor inteiro de uma vez — não há instância parcial (`knowledge/domain/investigation/investigation.md`: "produzida por uma fábrica que não consegue construir uma instância inválida").
- Ordem das recusas na fábrica: (1) `written_at` ausente → `WrittenAtRequiredError`; (2) subject sem atributo → `SubjectCarriesNoAttributeError` (via `buildSubject`, `a-subject-carries-at-least-one-attribute`); (3) atributo do subject que o glossário não possui → `SubjectAttributeNotInGlossaryError` (`a-subject-attribute-is-drawn-from-the-glossary`, verificado pela porta `IGlossaryQuery.readVocabularyTerm('subject-attribute', nome)`); (4) violações de totalidade → `InvestigationNotBuildableError` com **todas** as violações listadas de uma vez.
- Totalidade das evidências: exatamente uma Evidence por conceito de `collectionPlan(case)`; falta, duplicidade ou evidência de conceito fora do plano são violações (`knowledge/rules/investigation/one-evidence-per-collected-concept.md`; `evidenceTotalityViolations` na fábrica).
- Totalidade das avaliações: exatamente uma Evaluation por hipótese de `requiresEvaluationOf(case)`; falta, duplicidade ou avaliação de hipótese não exigida são violações. "Inconclusiva conta, silêncio não" (`knowledge/rules/investigation/one-evaluation-per-required-hypothesis.md`; `evaluationTotalityViolations`).
- Escrita única: a porta `IInvestigationStore.write` (`src/investigation/investigation-store.port.ts`) recusa em vez de sobrescrever quando o `id` já existe; o repositório relacional traduz a violação de chave primária do Postgres em `InvestigationAlreadyStoredError` e nunca executa `UPDATE` (`src/persistence/relational-investigation-store.repository.ts`; `knowledge/rules/investigation/an-investigation-is-written-once.md`).
- A resposta segue o registro: `runDiagnosis` (`src/investigation/run-diagnosis.ts`) só devolve `investigation.assessment` **depois** de `store.write` concluir. Se a escrita não cabe no orçamento de persistência (`PERSISTENCE_STAGE_BUDGET_MS = 2_000`, limitado ao tempo restante do prazo total), lança `InvestigationWriteDeadlineExceededError` — sem registro não há resposta (`knowledge/rules/investigation/the-response-follows-the-record.md`, `no-stage-aborts-on-its-deadline.md`).
- Prazo total: a fábrica de produção fixa `deadline = now + 20_000 ms` (`TOTAL_DEADLINE_BUDGET_MS` em `src/factories/production-diagnose.factory.ts`; `knowledge/rules/investigation/an-answer-arrives-within-the-declared-deadline.md`). Os orçamentos por estágio estão no capítulo [Deadlines](11-deadlines.md).
- Somente versão liberada: a regra `knowledge/rules/investigation/only-a-released-case-version-is-diagnosed.md` exige que o caso fixado esteja em estado `released`. **Não implementado**: nenhuma verificação de `state` foi encontrada no caminho `diagnose.controller.ts` → `caseQuery.readCase` → `runDiagnosis`; o caso é lido por slug e versão e diagnosticado seja qual for o estado.

**Relacionamentos**

- `pinned_case` → Case (contexto Conhecimento), cardinalidade exatamente 1, por `(slug, version)`. No banco, chave estrangeira composta para `case_versions (slug, version)`.
- Contém 1 Subject, N Evidence, N Evaluation, 1 Assessment, 1 Cost, 1 Durations (composição; todos são value objects sem identidade própria fora da investigação).

**Erros que pode disparar**

| Classe (`src/errors/`) | Quando |
|---|---|
| `WrittenAtRequiredError` | `buildInvestigation` chamado sem `written_at`. |
| `SubjectCarriesNoAttributeError` | Subject com lista de atributos vazia. |
| `SubjectAttributeNotInGlossaryError` | Um ou mais nomes de atributo do subject não existem no vocabulário `subject-attribute` do glossário. |
| `InvestigationNotBuildableError` | Evidências ou avaliações não cobrem exatamente o plano de coleta / as hipóteses exigidas; `context.violations` lista cada violação. |
| `InvestigationAlreadyStoredError` | Escrita de um `id` já armazenado. |
| `InvestigationStoreError` | Falha genérica de leitura/escrita no repositório relacional (carrega a causa do driver). |
| `InvestigationWriteDeadlineExceededError` | A escrita não terminou dentro do orçamento de persistência restante. |
| `RequesterRequiredError` | Definida em `src/errors/requester-required.error.ts` para o caso de `requester` ausente, mas **nenhum módulo em `src/` a lança hoje**; na prática a ausência é recusada pelo esquema Zod da rota (`requester: z.string().min(1)`) com HTTP 400 antes de o domínio ser alcançado. |

Nenhum desses erros consta em `src/errors/status-map.ts`; portanto, se escaparem até a rota, `src/http/error-handler.middleware.ts` responde `500 INTERNAL_ERROR`.

**Onde vive**

- Domínio: `src/investigation/investigation.ts` (tipo), `src/investigation/investigation-factory.ts` (construção), `src/investigation/investigation-store.port.ts` (porta de persistência).
- Banco: tabela `investigations` (`src/migrations/0005-investigation.sql`), com colunas achatadas para subject (`subject_type`), pinned case (`pinned_case_slug`, `pinned_case_version`), assessment (`assessment_outcome`, `assessment_action`, `assessment_recipient`, `assessment_determining_hypothesis`, `assessment_text`), cost (`cost_calls`, `cost_input_tokens`, `cost_output_tokens`), durations (`durations_collection`, `durations_judgment`, `durations_writing`, `durations_total`) e `written_at TIMESTAMPTZ`. FKs: `subject_type → subject_types(name)`, `assessment_outcome → outcomes(name)`, `assessment_action → actions(name)`, `assessment_recipient → recipients(name)`, `(pinned_case_slug, pinned_case_version) → case_versions(slug, version)`. Repositório: `src/persistence/relational-investigation-store.repository.ts` (escrita em transação: linha raiz, depois atributos do subject, evidências, avaliações e citações; leitura devolve `{ document, hash }` com `hash = sha256` do documento remontado).
- HTTP: `POST /v1/diagnose` (`src/http/diagnose.routes.ts`, `src/http/diagnose.controller.ts`, `src/http/dto/diagnose.dto.ts`). A rota devolve apenas o Assessment; a Investigation inteira não é exposta por nenhuma rota de leitura.

### Especificação da rota `POST /v1/diagnose`

Corpo da requisição (`diagnoseRequestSchema`, Zod):

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `case.slug` | string | sim | `min(1)` |
| `case.version` | inteiro | sim | `int().positive()` |
| `subject.type` | string | sim | `min(1)` |
| `subject.attributes[]` | `{ attribute: string; value: string }` | sim, ≥ 1 item | cada campo `min(1)`; `array.min(1)` |
| `narrative` | string | sim | `min(1)` |
| `requester` | string | sim | `min(1)` |
| `ticket_ref` | string | não | `min(1)` quando presente |

Corpo da resposta 200 (`diagnoseResponseSchema`): `{ outcome, referral: { action, recipient }, determining_hypothesis?, text }` — exatamente o Assessment (ver 8.6). Corpo inválido → `400 { error: { code: 'VALIDATION_ERROR', message, details: [...] } }`.

O controlador preenche o que a requisição não traz: `id` novo, `model` e `prompt_version` da configuração, e — como nenhuma porta reporta tokens ou tempo hoje — `cost = { calls: 0, input_tokens: 0, output_tokens: 0 }` e `durations = { collection: 0, judgment: 0, writing: 0, total: 0 }` (`UNMEASURED_COST`, `UNMEASURED_DURATIONS` em `src/http/diagnose.controller.ts`).

## 8.2 Subject e SubjectAttributeValue

### 8.2.1 Subject

**Propósito** — Identificar o que está sob investigação: um tipo de assunto do glossário e o conjunto inteiro de pares atributo/valor que identificam a instância (um id, um telefone — o que o tipo de assunto escolhido pelo caso usar para ser alcançado) (`knowledge/domain/investigation/subject.md`).

**Atributos** — tipo `Subject` em `src/investigation/subject.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `type` | `string` | sim | Nome de um SubjectType do glossário, como string (mesma convenção com que `Case.subject` referencia o tipo). No banco vira `investigations.subject_type`, com FK para `subject_types(name)`. |
| `attributes` | `readonly SubjectAttributeValue[]` | sim, ≥ 1 | O conjunto inteiro de atributo-valores montado pelo ponto de entrada. Nenhum atributo é filtrado por conceito: cada conector recebe o conjunto todo e decide sozinho quais usa. |

**Invariantes e regras**

- Ao menos um atributo-valor: `buildSubject(type, attributes)` lança `SubjectCarriesNoAttributeError` quando `attributes.length === 0` (`knowledge/rules/investigation/a-subject-carries-at-least-one-attribute.md`). A rota reforça na borda com `attributes: z.array(...).min(1)`.
- Atributos vêm do glossário: a fábrica da investigação verifica cada nome distinto via `glossary.readVocabularyTerm('subject-attribute', nome)` e recusa de uma vez com `SubjectAttributeNotInGlossaryError` (`knowledge/rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.md`; `refuseAttributesNotInGlossary` em `src/investigation/investigation-factory.ts`). A regra é de consistência eventual e é checada em tempo de requisição porque um caso nunca declara atributo-valores — só o tipo.
- O caso declara apenas o tipo do assunto; quem resolve "qual instância" e monta o conjunto de atributos é o ponto de entrada, antes da chamada de diagnose (`knowledge/domain/investigation/subject.md`).
- `buildSubject` copia a lista recebida (`[...attributes]`), de modo que mutações posteriores no array do chamador não afetam o valor construído.
- O Subject inteiro, junto com `concept` e `requester`, é serializado em `Evidence.inputs` e entregue a `IObservationSource.observeConcept(concept, subject, requester)` (`src/investigation/evidence-collection-stage.ts`, `src/investigation/observation-source.port.ts`).

**Relacionamentos** — `type` referencia SubjectType (Glossário); contém 1..n SubjectAttributeValue; pertence a exatamente 1 Investigation.

**Erros que pode disparar** — `SubjectCarriesNoAttributeError`; indiretamente `SubjectAttributeNotInGlossaryError` (lançado pela fábrica da investigação, não por `buildSubject`).

**Onde vive** — `src/investigation/subject.ts`; coluna `investigations.subject_type` e tabela `investigation_subject_attribute_values` (`src/migrations/0005-investigation.sql`); campo `subject` do corpo de `POST /v1/diagnose`.

### 8.2.2 SubjectAttributeValue

**Propósito** — Um fato sobre a identidade do assunto: um nome de atributo governado pelo glossário e o valor concreto que ele tem nesta instância (exemplo do material: atributo `id`, valor `12345`). Viaja como um par, e não como duas listas paralelas mantidas em sincronia por convenção (`knowledge/domain/investigation/subject-attribute-value.md`).

**Atributos** — tipo `SubjectAttributeValue` em `src/investigation/subject-attribute-value.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `attribute` | `string` | sim | Nome de um SubjectAttribute do glossário (vocabulário `subject-attribute`). |
| `value` | `string` | sim | O valor livre que o atributo tem para este assunto. |

**Invariantes e regras**

- O nome existe no glossário (`a-subject-attribute-is-drawn-from-the-glossary`), verificado pela fábrica da investigação; no banco, FK `attribute → subject_attributes(name)`.
- Na tabela, a chave primária é `(investigation_id, attribute, value)`: o mesmo atributo pode aparecer com valores distintos, mas o mesmo par não se repete.

**Relacionamentos** — `attribute` referencia SubjectAttribute (Glossário); pertence a 1 Subject.

**Erros que pode disparar** — Nenhum diretamente (é um tipo puro). Violações são apontadas pela fábrica (`SubjectAttributeNotInGlossaryError`).

**Onde vive** — `src/investigation/subject-attribute-value.ts`; tabela `investigation_subject_attribute_values (investigation_id, attribute, value)`; item de `subject.attributes[]` no DTO de diagnose.

## 8.3 Evidence e EvidenceResult

### 8.3.1 Evidence

**Propósito** — O que um conceito coletado devolveu, normalizado ao vocabulário do glossário e identificado dentro da investigação pelo seu conceito. A ausência de dado é um fato registrado — um timeout, uma negação ou uma indisponibilidade chega como *resultado*, nunca como exceção (`knowledge/domain/investigation/evidence.md`).

**Atributos** — tipo `Evidence` em `src/investigation/evidence.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `concept` | `string` | sim | Nome do Concept do glossário coletado. Identifica a evidência dentro da investigação (PK `(investigation_id, concept)`). |
| `inputs` | `string` | sim | A chamada serializada que o estágio de coleta de fato fez: `JSON.stringify({ concept, subject, requester })` — fixada para replay como bytes registrados. |
| `observation` | `string` | sim | A observação normalizada, **somente** quando `result === 'ok'`; string vazia em qualquer outro desfecho. |
| `observed_at` | `string` (ISO-8601) | sim | Quando o estágio resolveu esta evidência (no código atual, o instante `now` recebido pelo estágio). |
| `ttl` | `number` (segundos) | sim | Tolerância de frescor. **Hoje é sempre `DEFAULT_EVIDENCE_TTL_SECONDS = 60`**: o estágio de coleta não tem caminho para ler o `ttl` real do conceito registrado e aplica o padrão uniformemente, seja qual for o resultado (comentário em `src/investigation/evidence.ts`). |
| `origin` | `string` | sim | De onde veio a observação, para auditoria: o `connector` da capability resolvida; string vazia quando nenhuma capability responde ao conceito. |
| `result` | `EvidenceResult` | sim | Como a coleta terminou (ver 8.3.2). |
| `result_detail` | `string` | não | Detalhe do desfecho. Preenchido pelo estágio para `unavailable` por ausência de capability (`no capability is currently registered for concept "…"`) e para `timeout` (`no observation within Nms`). |
| `capability_name` | `string` | sim | Materialização da relação com Capability (Integração): qual capability registrada produziu a observação. String vazia quando nenhuma foi resolvida. |
| `capability_version` | `string` | sim | Versão dessa capability. String vazia quando nenhuma foi resolvida. |

**Invariantes e regras**

- Exatamente uma Evidence por conceito do plano de coleta (`knowledge/rules/investigation/one-evidence-per-collected-concept.md`). O plano é um conjunto, então o conceito já identifica a evidência e não existe id separado. Verificado pela fábrica (`evidenceTotalityViolations`) e pela PK `(investigation_id, concept)`.
- A coleta roda no escopo do solicitante: o `requester` viaja em cada `observeConcept(concept, subject, requester)` e fica gravado em `inputs` (`knowledge/rules/investigation/collection-runs-in-the-requester-scope.md`; `src/investigation/evidence-collection-stage.ts`).
- Nenhum estágio aborta pelo prazo: quando a observação não chega dentro do limite efetivo, o estágio registra `result: 'timeout'` em vez de lançar (`knowledge/rules/investigation/no-stage-aborts-on-its-deadline.md`; `raceObservation`/`settledEvidence`).
- Orçamento próprio da coleta: o teto do estágio é `min(COLLECTION_STAGE_BUDGET_MS = 7_000, deadline - now)`, e o limite de cada chamada é `min(capability.timeout, teto do estágio)` (`knowledge/rules/investigation/collection-has-its-own-budget-within-the-total.md`; `effectiveBoundMsFor`).
- Conceito sem capability registrada → evidência `unavailable` com `origin`, `capability_name` e `capability_version` vazios (`unavailableEvidence`).
- Somente `ok` pode entrar em cache (`knowledge/constraints/the-evidence-cache-admits-only-ok-results.md`) — o cache em si não está implementado neste código; a restrição está registrada na especificação e no comentário de `src/investigation/evidence-result.ts`.
- A relação com Capability tem cardinalidade declarada 1, mas o código a preenche com strings vazias quando nada foi resolvido. A tabela `investigation_evidence` tem FK `(capability_name, capability_version) → capabilities(name, version)`; **uma evidência `unavailable` por conceito sem capability carrega `('', '')` e, portanto, não satisfaz essa FK** — a gravação de tal investigação falharia com `InvestigationStoreError`. Trata-se de divergência entre `src/investigation/evidence-collection-stage.ts` e `src/migrations/0005-investigation.sql`, registrada aqui como lacuna.

**Relacionamentos** — `concept` referencia Concept (Glossário; FK `concept → concepts(name)`); `(capability_name, capability_version)` referencia Capability (Integração); pertence a 1 Investigation; é citada por Citation via `concept`.

**Erros que pode disparar** — Nenhum diretamente. A coleta converte falhas de prazo em `result: 'timeout'`; erros lançados pela fonte de observação (rejeição da promise) propagam-se sem tipo próprio deste contexto. Violações de totalidade são apontadas pela fábrica (`InvestigationNotBuildableError`); violação da FK de capability surge como `InvestigationStoreError`.

**Onde vive** — `src/investigation/evidence.ts` (tipo), `src/investigation/evidence-collection-stage.ts` (produção), `src/investigation/observation-source.port.ts` (porta), `src/investigation/http-declarative-observation-source.adapter.ts` (adaptador HTTP); tabela `investigation_evidence` (`src/migrations/0005-investigation.sql`) com `CHECK (result IN ('ok','unavailable','denied','timeout'))`. Não é exposta por rota HTTP.

### 8.3.2 EvidenceResult

**Propósito** — Como uma coleta terminou. Só `ok` carrega uma observação utilizável; os outros três são fatos sobre a tentativa (`knowledge/domain/investigation/evidence-result.md`).

**Valores** — `EVIDENCE_RESULTS = ['ok', 'unavailable', 'denied', 'timeout']` em `src/investigation/evidence-result.ts`.

| Valor | Significado | Quem o produz no código |
|---|---|---|
| `ok` | A observação chegou e foi normalizada; `observation` está preenchida. | `settledEvidence` quando `outcome.result === 'ok'`; o adaptador HTTP classifica o status via `statusMap` da configuração do conector e extrai a observação pelas propriedades do `output_schema` da capability (`outcomeFromResponse`). |
| `unavailable` | Nada utilizável veio da fonte: nenhuma capability registrada para o conceito, ou status HTTP sem mapeamento reconhecido (`DEFAULT_STATUS_ENDING = 'unavailable'` no adaptador). | `unavailableEvidence`; `endingForStatus` no adaptador HTTP. |
| `denied` | A fonte negou o acesso. | Só quando o `statusMap` do conector mapeia um status para `denied` (adaptador HTTP); nenhum outro módulo o produz. |
| `timeout` | A observação não chegou dentro do limite efetivo (`min(capability.timeout, teto do estágio)`), ou o próprio adaptador HTTP excedeu seu tempo. | `settledEvidence` com `TIMED_OUT`; adaptador HTTP quando `CallResult.kind === 'timed-out'`. |

**Invariantes e regras** — Todo status HTTP resolve para um dos quatro valores; só `ok` carrega observação (`ObservationOutcome` em `src/investigation/observation-source.port.ts` é uma união discriminada: `{ result: 'ok'; observation }` ou `{ result: Exclude<EvidenceResult,'ok'> }`). O repositório recusa na leitura um valor fora da enumeração (`EVIDENCE_RESULT_VALUES`).

**Relacionamentos** — Valor de `Evidence.result`. Uma evidência com resultado diferente de `ok` torna as hipóteses que a coletam inconclusivas por `no-data` (ver 8.4).

**Erros que pode disparar** — Nenhum.

**Onde vive** — `src/investigation/evidence-result.ts`; `CHECK` na coluna `investigation_evidence.result`.

## 8.4 Evaluation, Verdict e EvaluationReason

### 8.4.1 Evaluation

**Propósito** — O julgamento de uma hipótese, identificada pelo **nome** dentro do caso fixado (um nome, e não uma referência de modelo, porque a hipótese vive dentro do agregado do caso). O julgamento é uma operação não determinística; a garantia que o domínio oferece não é correção, mas ser **citado e completo** (`knowledge/domain/investigation/evaluation.md`).

**Atributos** — tipo `Evaluation` em `src/investigation/evaluation.ts`. É uma união discriminada pelo `verdict`:

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `hypothesis` | `string` | sim | Nome da hipótese julgada, dentro do caso fixado. PK `(investigation_id, hypothesis)`. |
| `verdict` | `Verdict` | sim | O que o julgamento concluiu (ver 8.4.2). |
| `citations` | `readonly [Citation, ...Citation[]]` quando `confirmed`/`refuted`; `readonly Citation[]` quando `inconclusive` | sim | Ao menos uma citação quando decidido (o tipo torna a lista não vazia obrigatória); lista possivelmente vazia quando inconclusivo. |
| `reason` | `EvaluationReason` | sim quando `inconclusive`; **inexistente** nos ramos `confirmed`/`refuted` | Por que o julgamento não decidiu (ver 8.4.3). |

**Invariantes e regras**

- Uma avaliação decidida cita evidência: os ramos `confirmed` e `refuted` do tipo exigem `citations` não vazia; o estágio de julgamento recusa uma resposta decidida sem citações (`isStructurallyValid` devolve `false` para lista vazia) (`knowledge/rules/investigation/a-decided-evaluation-cites-evidence.md`).
- Uma avaliação inconclusiva declara a razão: o ramo `inconclusive` do tipo exige `reason`. Para `no-data`, o estágio cita as evidências cujo resultado não é `ok` (`noDataEvaluation` produz uma Citation `{ concept, field: '' }` por evidência não-ok) (`knowledge/rules/investigation/an-inconclusive-evaluation-declares-its-reason.md`).
- O julgamento não infere: o que não pode ser deduzido da evidência é inconclusivo, nunca inferido — a instrução está fixada no prompt de julgamento do adaptador (`knowledge/rules/investigation/judgment-does-not-infer.md`; `src/investigation/anthropic-hypothesis-evaluator.adapter.ts`).
- Uma avaliação por hipótese exigida (`one-evaluation-per-required-hypothesis`): `judgeHypotheses` produz exatamente uma Evaluation por nome em `requiresEvaluationOf(case)`, inclusive quando o julgamento falha ou o prazo estoura; a fábrica verifica a totalidade.
- Nenhum estágio aborta pelo prazo: um julgamento que nunca obteve vaga no pool, ou que começou e não voltou a tempo, vira `inconclusive` / `deadline-exceeded` (`no-stage-aborts-on-its-deadline`).
- Política de retry e falha (detalhada em [Julgamento](09-julgamento.md)): resposta decidida com citação inválida → uma nova tentativa; segunda resposta inválida, ou prazo esgotado antes da nova tentativa → `inconclusive` / `judgment-failure` (`retryOrFail` em `src/investigation/judgment-stage.ts`; cenário `knowledge/scenarios/investigation/a-foreign-citation-is-refused.md`).
- Atalho sem custo: se qualquer evidência da hipótese não é `ok`, a hipótese recebe `inconclusive` / `no-data` sem chamar o avaliador (`judgeOneHypothesis`).
- As avaliações alimentam `resolveOutcome(case, verdicts)` do caso (`src/case/case-resolution.ts`) — o desfecho vem do caso, não deste contexto (`the-outcome-comes-from-the-case`).

**Relacionamentos** — `hypothesis` nomeia uma Hypothesis do caso fixado (por valor, sem FK: a tabela `investigation_evaluations.hypothesis` é texto livre, ver comentário em `src/migrations/0009-case-version-lifecycle-schema.sql`); contém 0..n Citation; pertence a 1 Investigation.

**Erros que pode disparar** — Nenhum tipado. `judgment-stage.ts` lança `Error` genérico em duas condições consideradas impossíveis por construção: hipótese exigida sem entrada em `case.hypotheses` (`hypothesisNamed`) e hipótese exigida sem lista de evidências no mapa (`evidenceFor`). Violações de totalidade → `InvestigationNotBuildableError` (fábrica).

**Onde vive** — `src/investigation/evaluation.ts` (tipo), `src/investigation/judgment-stage.ts` (produção), `src/investigation/hypothesis-evaluator.port.ts` (porta `IHypothesisEvaluator.evaluate(criterion, evidence, caseContext)`); tabela `investigation_evaluations (investigation_id, hypothesis, verdict, reason)` com `CHECK` nos dois enumerados. Não é exposta por rota HTTP.

### 8.4.2 Verdict

**Propósito** — O que o julgamento de uma hipótese concluiu. Toda hipótese exigida recebe um; a precedência do manifesto escolhe a hipótese determinante e as demais mantêm o veredito recebido (`knowledge/domain/investigation/verdict.md`).

**Valores** — `VERDICTS = ['confirmed', 'refuted', 'inconclusive']` em `src/investigation/verdict.ts`.

| Valor | Significado | Consequência |
|---|---|---|
| `confirmed` | A evidência sustenta o critério da hipótese. | Exige citações. Candidata a hipótese determinante em `resolveOutcome`. |
| `refuted` | A evidência contradiz o critério. | Exige citações. Não determina o desfecho. |
| `inconclusive` | Não foi possível decidir. | Exige `reason`. Se nenhuma hipótese confirma, o `fallback` do caso responde. |

**Invariantes e regras** — `confirmed` e `refuted` são decididos e citam; só `inconclusive` declara razão (comentário em `src/investigation/verdict.ts`). O mesmo conjunto de literais é redeclarado em `src/case/case-resolution.ts` (`type Verdict`) para o cálculo do desfecho. O repositório recusa na leitura um valor fora da enumeração (`VERDICT_VALUES`).

**Relacionamentos** — Valor de `Evaluation.verdict`; entrada de `resolveOutcome` (Conhecimento).

**Erros que pode disparar** — Nenhum.

**Onde vive** — `src/investigation/verdict.ts`; `CHECK (verdict IN (...))` em `investigation_evaluations`.

### 8.4.3 EvaluationReason

**Propósito** — Por que uma avaliação é inconclusiva: dado ausente, chamada de julgamento falha, ou prazo expirado antes ou durante a chamada. São três causas distintas e nenhuma é guarda-chuva das outras — confundi-las envenena as projeções e aponta a curadoria para o lugar errado (`knowledge/domain/investigation/evaluation-reason.md`).

**Valores** — `EVALUATION_REASONS = ['no-data', 'judgment-failure', 'deadline-exceeded']` em `src/investigation/evaluation-reason.ts`.

| Valor | Quando o estágio o atribui (`src/investigation/judgment-stage.ts`) | Citações que acompanha |
|---|---|---|
| `no-data` | Ao menos uma evidência coletada pela hipótese tem `result !== 'ok'`. O avaliador não é chamado. | Uma Citation `{ concept, field: '' }` por evidência não-ok (exigido por `an-inconclusive-evaluation-declares-its-reason`). |
| `judgment-failure` | A resposta do avaliador foi decidida mas trouxe citação inválida (fora de `collects` ou campo inexistente no `output_schema`) e a nova tentativa também falhou; ou o prazo já havia expirado quando a nova tentativa seria feita. | Nenhuma (`citations: []`). |
| `deadline-exceeded` | O julgamento nunca obteve vaga no pool antes do prazo, ou começou e não retornou a tempo (primeira chamada ou retry). "Nada falhou e o dado chegou." | Nenhuma (`citations: []`). |

O adaptador de LLM também pode devolver `inconclusive` com uma razão própria (`EvaluationOutcome` em `src/investigation/hypothesis-evaluator.port.ts`); nesse caso o estágio a copia sem alteração (`asEvaluation`).

**Invariantes e regras** — Distinguir falha técnica, fila e ausência de dado é o que impede que uma falha de infraestrutura seja lida como fato de domínio (`an-inconclusive-evaluation-declares-its-reason`). O repositório recusa na leitura um valor fora da enumeração (`EVALUATION_REASON_VALUES`).

**Relacionamentos** — Valor de `Evaluation.reason`.

**Erros que pode disparar** — Nenhum.

**Onde vive** — `src/investigation/evaluation-reason.ts`; `CHECK (reason IN (...))` em `investigation_evaluations`.

## 8.5 Citation

**Propósito** — A rastreabilidade que uma avaliação decidida deve carregar: um conceito e um campo da observação que fundamentou o veredito. Verificável por máquina por construção: o campo tem de existir no `output_schema` da capability que produziu aquela evidência (`knowledge/domain/investigation/citation.md`).

**Atributos** — tipo `Citation` em `src/investigation/citation.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `concept` | `string` | sim | Nome do Concept do glossário cuja evidência fundamenta o veredito. FK `concept → concepts(name)` na tabela. |
| `field` | `string` | sim | Um campo da observação (chave de `properties` no JSON Schema de saída da capability). String vazia nas citações de `no-data`, que apontam para a evidência inteira e não para um campo. |

**Invariantes e regras**

- A citação fica dentro dos `collects` da hipótese: o conceito citado deve pertencer ao `collects` da hipótese julgada — o prompt não continha mais nada, então uma citação fora dele é referência inventada e é recusada (`knowledge/rules/investigation/a-citation-stays-within-the-hypothesis-collects.md`; `citesACollectedConcept` em `src/investigation/citation-validation.ts`).
- O campo existe no `output_schema` da capability que produziu a evidência: `citesADeclaredField` localiza a evidência do conceito citado, monta a chave `capability_name::capability_version` (`capabilityOutputSchemaKey`), e verifica se `field` está entre as chaves de `properties` do schema (`declaredFieldsOf`). Schema ausente, não-JSON ou sem `properties` declara "nenhum campo" e recusa toda citação, sem lançar (`knowledge/rules/investigation/a-cited-field-exists-in-the-capability-output-schema.md`).
- Ambas as regras precisam valer (`isCitationValid`); `acceptedCitations` devolve as que sobrevivem, na ordem proposta. Decidir o que fazer com uma recusa (retry, `judgment-failure`) é orquestração do estágio de julgamento, não desta validação.
- Os schemas são lidos pelo estágio via `ICapabilityQuery.readCapability(concept)` e chaveados por nome e versão da capability — nunca só pelo conceito, porque a regra amarra a citação à capability que de fato produziu a evidência (`outputSchemasFor` em `src/investigation/judgment-stage.ts`).
- O mesmo `declaredFields` é enviado ao avaliador em cada `EvidenceItem`, para que o prompt já enumere os campos citáveis (`toEvidenceItems`).

**Relacionamentos** — `concept` referencia Concept (Glossário) e, por ele, a Evidence homônima da investigação; pertence a 1 Evaluation. No banco, `investigation_evaluation_citations (investigation_id, hypothesis, concept, field)` com FK composta para `investigation_evaluations`.

**Erros que pode disparar** — Nenhum: `citation-validation.ts` é uma verificação pura que responde `true`/`false`.

**Onde vive** — `src/investigation/citation.ts`, `src/investigation/citation-validation.ts`; tabela `investigation_evaluation_citations`. Não é exposta por rota HTTP.

## 8.6 Assessment

**Propósito** — A resposta (o "parecer" do material): desfecho, encaminhamento e hipótese determinante vêm do `resolveOutcome` do caso e nunca são decididos aqui; o texto é o único campo que a redação produz. Carrega o que o solicitante vai agir sobre, inteiro, e só depois de o registro estar gravado (`knowledge/domain/investigation/assessment.md`).

**Atributos** — tipo `Assessment` em `src/investigation/assessment.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `outcome` | `string` | sim | Nome do Outcome do glossário resolvido pelo caso, sem alteração. FK `assessment_outcome → outcomes(name)`. |
| `referral` | `Referral` = `{ action: string; recipient: string }` (de `src/case/case.ts`) | sim | O encaminhamento a executar, inteiro, tal como o caso resolveu. FKs para `actions(name)` e `recipients(name)`. |
| `determining_hypothesis` | `string` | não | Nome da hipótese que determinou desfecho e encaminhamento. Presente exatamente quando uma hipótese confirmou; ausente quando o `fallback` do caso respondeu (`resolved.determining === undefined`). |
| `text` | `string` | sim | O único campo produzido pela redação: um texto que nomeia o desfecho e se apoia apenas na entrada estreitada. |

**Invariantes e regras**

- O desfecho vem do caso: `draftAssessment` copia `resolved.outcome`, `resolved.referral` e `resolved.determining` de `ResolvedOutcome` (retorno de `resolveOutcome(case, verdicts)` em `src/case/case-resolution.ts`) e só acrescenta `text` (`knowledge/rules/investigation/the-outcome-comes-from-the-case.md`; `src/investigation/draft-assessment-text.ts`).
- A entrada da redação é estreitada: `resolveAndNarrow` (`src/investigation/resolve-and-narrow-input.ts`) entrega ao consolidador apenas as avaliações das hipóteses exigidas — veredito, razão quando houver e citações — e as evidências que essas citações nomeiam (uma por conceito citado), em qualquer desfecho. O título do caso, `when_to_use`, os critérios das hipóteses e o corpo do caso **não** entram no prompt de consolidação (`knowledge/rules/investigation/the-writing-input-is-narrowed.md`; `knowledge/constraints/the-consolidation-prompt-is-closed.md`).
- O cliente vê só o texto: `outcome`, `referral`, vereditos e evidências são material operacional (`knowledge/rules/investigation/the-customer-sees-only-the-text.md`). A rota HTTP devolve o Assessment inteiro ao **solicitante** (o atendente), mas nenhuma Evaluation ou Evidence (`diagnoseResponseSchema`).
- Registro de consolidação: o texto é redigido no `ConsolidationRegister` do caso (`case.consolidation_register`) ou, se o caso não declara um, no padrão configurado (`defaultConsolidationRegister`); valores `formal` | `plain` (`src/investigation/consolidation-register.ts`; `src/investigation/run-diagnosis.ts`).
- A redação roda atrás de uma porta: `IAssessmentConsolidator.consolidate(evaluations, evidence, consolidationRegister): Promise<string>` (`src/investigation/assessment-consolidator.port.ts`), com adaptador LLM em produção (`anthropic-assessment-consolidator.adapter.ts`) e fake em teste (`knowledge/constraints/consolidation-runs-behind-a-port.md`).
- A resposta segue o registro: o Assessment só é devolvido após `store.write` (`the-response-follows-the-record`).

**Relacionamentos** — `outcome` referencia Outcome (Glossário); `referral` é o Referral do caso (Conhecimento), cujos `action`/`recipient` referenciam Action e Recipient (Glossário); `determining_hypothesis` nomeia uma Hypothesis do caso fixado; pertence a 1 Investigation.

**Erros que pode disparar** — Nenhum tipado neste contexto. Falhas do adaptador de consolidação propagam-se como erro do adaptador.

**Onde vive** — `src/investigation/assessment.ts`, `src/investigation/draft-assessment-text.ts`, `src/investigation/resolve-and-narrow-input.ts`; colunas `assessment_*` da tabela `investigations`; corpo da resposta 200 de `POST /v1/diagnose` (`diagnoseResponseSchema` em `src/http/dto/diagnose.dto.ts`).

## 8.7 Cost

**Propósito** — O que esta investigação custou no provedor de LLM: N hipóteses custam N chamadas de julgamento mais uma de redação, linear em hipóteses. Registrado para que as projeções respondam "quais casos são caros" com dados, não com opinião (`knowledge/domain/investigation/cost.md`).

**Atributos** — tipo `Cost` em `src/investigation/cost.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `calls` | `number` (inteiro) | sim | Número de chamadas ao provedor. |
| `input_tokens` | `number` (inteiro) | sim | Tokens de entrada consumidos. |
| `output_tokens` | `number` (inteiro) | sim | Tokens de saída consumidos. |

**Invariantes e regras**

- O módulo declara apenas a forma; acumular o custo é responsabilidade de cada estágio chamador — e **nenhuma porta (`IHypothesisEvaluator`, `IAssessmentConsolidator`, `IObservationSource`) reporta contagem de chamadas ou tokens hoje**. A rota HTTP grava `UNMEASURED_COST = { calls: 0, input_tokens: 0, output_tokens: 0 }` (`src/http/diagnose.controller.ts`). A medição real não está implementada.
- A fábrica copia o valor recebido sem alteração (`buildInvestigation`).

**Relacionamentos** — Pertence a 1 Investigation.

**Erros que pode disparar** — Nenhum.

**Onde vive** — `src/investigation/cost.ts`; colunas `cost_calls`, `cost_input_tokens`, `cost_output_tokens` (`INTEGER NOT NULL`) da tabela `investigations`. Não é exposto por rota HTTP.

## 8.8 Durations

**Propósito** — Quanto cada estágio levou, em milissegundos, medido a partir da primeira entrega. É o que diz quem está estourando o orçamento total declarado, por estágio e por capability (`knowledge/domain/investigation/durations.md`).

**Atributos** — tipo `Durations` em `src/investigation/durations.ts`.

| Atributo | Tipo | Obrigatório | Descrição / regra |
|---|---|---|---|
| `collection` | `number` (ms) | sim | Duração do estágio de coleta. |
| `judgment` | `number` (ms) | sim | Duração do estágio de julgamento. |
| `writing` | `number` (ms) | sim | Duração da redação (consolidação). |
| `total` | `number` (ms) | sim | Duração total. |

**Invariantes e regras**

- O módulo declara apenas a forma; medir é responsabilidade de cada estágio — e `runDiagnosis` **nunca lê o relógio do sistema** (recebe `now` e `deadline` prontos), então não mede nada. A rota HTTP grava `UNMEASURED_DURATIONS = { collection: 0, judgment: 0, writing: 0, total: 0 }` (`src/http/diagnose.controller.ts`). A medição real não está implementada.
- Os orçamentos que estas durações deveriam ser comparadas a estão em constantes: `COLLECTION_STAGE_BUDGET_MS = 7_000` (`evidence-collection-stage.ts`), `JUDGMENT_STAGE_BUDGET_MS = 5_000` e `PERSISTENCE_STAGE_BUDGET_MS = 2_000` (`run-diagnosis.ts`), `TOTAL_DEADLINE_BUDGET_MS = 20_000` (`production-diagnose.factory.ts`). Ver [Deadlines](11-deadlines.md).

**Relacionamentos** — Pertence a 1 Investigation.

**Erros que pode disparar** — Nenhum.

**Onde vive** — `src/investigation/durations.ts`; colunas `durations_collection`, `durations_judgment`, `durations_writing`, `durations_total` (`INTEGER NOT NULL`) da tabela `investigations`. Não é exposto por rota HTTP.

## 8.9 Regras do contexto

Todas as regras de `knowledge/rules/investigation/`. **Tipo**: invariante (deve valer sempre, verificado no momento da construção) ou política (consistência eventual, verificada onde a informação está disponível).

| Regra (arquivo em `knowledge/rules/investigation/`) | Tipo | Enunciado | Restringe | Onde está implementada | Estado |
|---|---|---|---|---|---|
| `a-citation-stays-within-the-hypothesis-collects` | política | Todo conceito que uma avaliação cita pertence ao `collects` da revisão de hipótese julgada. | Citation, HypothesisRevision | `citesACollectedConcept` em `src/investigation/citation-validation.ts`; recusa e retry em `src/investigation/judgment-stage.ts` | implementada |
| `a-cited-field-exists-in-the-capability-output-schema` | política | Todo campo que uma citação nomeia existe no `output_schema` da capability que produziu aquela evidência. | Citation, Capability | `citesADeclaredField` / `declaredFieldsOf` em `citation-validation.ts`; schemas lidos por `outputSchemasFor` em `judgment-stage.ts` | implementada |
| `a-decided-evaluation-cites-evidence` | invariante | Toda avaliação `confirmed` ou `refuted` carrega ao menos uma citação. | Evaluation, Citation | Tipo `Evaluation` (tupla não vazia nos ramos decididos); `isStructurallyValid` recusa lista vazia | implementada |
| `a-subject-attribute-is-drawn-from-the-glossary` | política | Todo atributo nomeado pelos atributo-valores do subject existe no glossário. | Subject, SubjectAttributeValue, SubjectAttribute | `refuseAttributesNotInGlossary` em `investigation-factory.ts`; FK `attribute → subject_attributes(name)` | implementada |
| `a-subject-carries-at-least-one-attribute` | invariante | Um subject carrega ao menos um atributo-valor. | Subject | `buildSubject` em `subject.ts`; `attributes.min(1)` no DTO | implementada |
| `an-answer-arrives-within-the-declared-deadline` | política | Um diagnóstico responde dentro do prazo total declarado de 20 s (2 de margem, 7 de coleta, 5 de julgamento, 4 de redação, 2 de persistência), menor que o timeout do chamador. | Investigation | `TOTAL_DEADLINE_BUDGET_MS = 20_000` em `src/factories/production-diagnose.factory.ts`; orçamentos por estágio em `evidence-collection-stage.ts` e `run-diagnosis.ts` | implementada (a redação não tem orçamento próprio em constante; o prazo total ainda a limita apenas via persistência) |
| `an-inconclusive-evaluation-declares-its-reason` | invariante | Toda avaliação inconclusiva declara sua razão, e uma razão `no-data` cita a evidência cujo resultado não é `ok`. | Evaluation | Tipo `Evaluation` (ramo `inconclusive` exige `reason`); `noDataEvaluation` em `judgment-stage.ts` | implementada |
| `an-investigation-is-written-once` | invariante | Uma investigação é escrita uma vez e nunca alterada; nenhum estado intermediário persiste. | Investigation | `IInvestigationStore.write` recusa `id` repetido (`InvestigationAlreadyStoredError`); só `INSERT`, nunca `UPDATE`, em `relational-investigation-store.repository.ts` | implementada |
| `collection-has-its-own-budget-within-the-total` | política | A coleta tem orçamento nominal próprio de 7 s dentro do prazo total; o timeout de uma capability limita uma chamada, mas nunca além do que resta desse orçamento. | Investigation | `COLLECTION_STAGE_BUDGET_MS` e `effectiveBoundMsFor` em `evidence-collection-stage.ts` | implementada |
| `collection-runs-in-the-requester-scope` | invariante | A coleta roda no escopo de autorização do solicitante, nunca do serviço. | Investigation, Evidence | `requester` passado a `observeConcept(concept, subject, requester)` e gravado em `Evidence.inputs` | implementada na interface (o uso efetivo do `requester` depende de cada conector) |
| `judgment-does-not-infer` | invariante | O que não pode ser deduzido da evidência é inconclusivo, nunca inferido. | Evaluation | Instrução fixa no prompt de `anthropic-hypothesis-evaluator.adapter.ts`; `knowledge/constraints/the-judgment-prompt-is-closed.md` | implementada |
| `no-stage-aborts-on-its-deadline` | política | Nenhum estágio aborta por estourar o prazo — a coleta registra `timeout`, o julgamento registra `deadline-exceeded` —, com a persistência como única exceção, cujo estouro é erro ao solicitante. | Investigation, Evidence, Evaluation | `raceObservation` (coleta); `createDeadlineGuard` / `deadlineExceededEvaluation` (julgamento); `writeWithinDeadline` → `InvestigationWriteDeadlineExceededError` (persistência) | implementada |
| `one-evaluation-per-required-hypothesis` | invariante | Uma investigação tem exatamente uma avaliação por hipótese exigida pelo caso; inconclusiva conta, silêncio não. | Investigation, Evaluation | `evaluationTotalityViolations` em `investigation-factory.ts`; PK `(investigation_id, hypothesis)` | implementada |
| `one-evidence-per-collected-concept` | invariante | Uma investigação tem exatamente uma evidência por conceito do plano de coleta. | Investigation, Evidence | `evidenceTotalityViolations` em `investigation-factory.ts`; PK `(investigation_id, concept)` | implementada |
| `only-a-released-case-version-is-diagnosed` | política | Uma investigação só pode ser fixada a uma versão de caso em estado `released`; um rascunho pode ser lido, nunca diagnosticado. | Investigation, CaseVersion | — | **não implementado** (nenhuma verificação de `state` no caminho de diagnose) |
| `replay-is-pinned` | invariante | Uma investigação fixa seu replay: caso por slug e versão, modelo, versão do prompt e evidência. | Investigation | Campos `pinned_case`, `model`, `prompt_version`, `evidence` em `investigation.ts`; `pinnedCaseOf` na fábrica; FK `(pinned_case_slug, pinned_case_version) → case_versions` | implementada |
| `the-customer-sees-only-the-text` | invariante | O que um parecer expõe ao cliente final é só o texto; desfecho, encaminhamento, vereditos e evidências são da operação. | Assessment | `diagnoseResponseSchema` não expõe avaliações nem evidências; a separação texto/resto é responsabilidade do sistema de atendimento que consome a API | implementada no que cabe à API |
| `the-outcome-comes-from-the-case` | política | Desfecho, encaminhamento e hipótese determinante de um parecer são exatamente o que `resolve-outcome` da versão do caso devolve. | Assessment, CaseVersion | `resolveAndNarrow` → `resolveOutcome` (`src/case/case-resolution.ts`); `draftAssessment` copia sem alterar | implementada |
| `the-response-follows-the-record` | invariante | A resposta ao solicitante sai inteira e só depois de a investigação estar gravada. | Investigation | `runDiagnosis`: `await writeWithinDeadline(...)` antes de `return investigation.assessment` | implementada |
| `the-writing-input-is-narrowed` | invariante | A consolidação recebe as avaliações de toda hipótese exigida (veredito, razão e citações) e as evidências que essas citações nomeiam, na mesma forma em qualquer desfecho; hipóteses, critérios e `when_to_use` do caso não entram no prompt. | Investigation, Assessment | `narrowInput` em `resolve-and-narrow-input.ts`; assinatura de `IAssessmentConsolidator.consolidate` não recebe o caso | implementada |

### Restrições correlatas (`knowledge/constraints/`)

| Restrição | Efeito neste contexto | Implementação |
|---|---|---|
| `hypotheses-are-judged-in-isolated-parallel-calls` | Cada hipótese é julgada em uma chamada própria, em paralelo, limitada por um pool. | `CallPool(poolSize)` e `Promise.all` em `judgment-stage.ts` |
| `judgment-runs-behind-a-port` / `consolidation-runs-behind-a-port` | LLM em produção, fake em teste, sem segunda forma de critério no schema. | `IHypothesisEvaluator`, `IAssessmentConsolidator` e seus adaptadores `anthropic-*` / `fake-*` |
| `the-judgment-prompt-is-closed` / `the-consolidation-prompt-is-closed` | O prompt é fixo; só os dados variam. | Adaptadores `anthropic-*.adapter.ts` |
| `the-deadline-is-an-absolute-propagated-instant` | O prazo é um instante absoluto passado adiante, não uma duração recalculada. | `now`/`deadline` em `RunDiagnosisOptions`, `CollectEvidenceOptions`, `JudgeHypothesesOptions` |
| `the-evidence-cache-admits-only-ok-results` | Só `ok` pode entrar em cache. | Cache não implementado; restrição documentada em `evidence-result.ts` |
| `the-domain-depends-on-no-infrastructure` | Os tipos deste contexto importam apenas irmãos do próprio contexto e do caso. | Todos os `src/investigation/*.ts` de domínio |
| `the-stored-schema-mirrors-the-declared-model` | As tabelas espelham os atributos declarados, achatando value objects. | `src/migrations/0005-investigation.sql` |
