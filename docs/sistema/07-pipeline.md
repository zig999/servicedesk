# O pipeline de diagnóstico e a leitura do caso

Este capítulo descreve o caminho completo de uma requisição `POST /v1/diagnose` — do momento em que o corpo HTTP chega até a resposta com a avaliação (Assessment) — e, em seguida, detalha a primeira etapa desse caminho: a leitura e validação do caso pinado, a construção do plano de coleta e o estreitamento do que a redação pode ver. As etapas seguintes têm capítulos próprios: [Coleta](08-coleta.md), [Julgamento](09-julgamento.md), [Resolução, consolidação e gravação](10-resolucao-consolidacao-gravacao.md) e [Deadlines](11-deadlines.md).

## 10. O pipeline `POST /v1/diagnose` de ponta a ponta

### 10.1 A ideia em uma frase

O diagnóstico é **síncrono**: o atendente espera na tela, e a resposta sai na mesma requisição que a pediu — não há fila, job ou polling entre o pedido e a avaliação (`knowledge/constraints/diagnosis-answers-synchronously.md`). É isso que torna obrigatórios o prazo absoluto e as regras de degradação descritas adiante: uma etapa lenta não pode "ficar para depois", ela precisa degradar dentro do prazo ou o atendente vê um erro de rede em vez de um diagnóstico.

Cada chamada é **nova** (`knowledge/contracts/investigation/diagnosis.md`): o motor inteiro roda outra vez — coleta, julgamento, consolidação e gravação — e nenhuma chamada reaproveita, retorna ou se junta a uma investigação anterior. Duas requisições idênticas produzem duas investigações gravadas (`src/factories/production-diagnose.factory.ts`, comentário de `createProductionDiagnoseRunner`).

### 10.2 Diagrama de sequência

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente HTTP
    participant R as diagnose.routes.ts
    participant H as diagnose.controller.ts
    participant Q as CaseQueryService (case-query.service.ts)
    participant P as production-diagnose.factory.ts
    participant D as run-diagnosis.ts
    participant E as evidence-collection-stage.ts
    participant O as IObservationSource
    participant J as judgment-stage.ts
    participant V as IHypothesisEvaluator
    participant N as resolve-and-narrow-input.ts
    participant T as draft-assessment-text.ts
    participant K as IAssessmentConsolidator
    participant F as investigation-factory.ts
    participant S as IInvestigationStore

    C->>R: POST /v1/diagnose {case, subject, narrative, requester, ticket_ref?}
    R->>R: diagnoseRequestSchema.safeParse(body)
    alt corpo inválido
        R-->>C: 400 VALIDATION_ERROR (lista de campos violados)
    end
    R->>H: handleDiagnoseRequest(deps, dto)
    H->>Q: readCase(slug, version)
    Q->>Q: assembleVersion → parseCaseDocument → caseCoherenceViolations
    alt versão inexistente
        Q-->>C: CaseNotFoundError → 404
    else regra estrutural ou de coerência violada
        Q-->>C: CaseNotValidError → 500 (não mapeado no status-map)
    end
    Q-->>H: { case }
    H->>P: runDiagnose({ id: randomUUID(), requester, ticket_ref, narrative, subjectType, subjectAttributes, case, prompt_version, model, cost=0, durations=0 })
    P->>P: now = Date.now(); deadline = now + 20_000
    P->>D: runDiagnosis({ ...call, store, glossary, capabilities, observationSource, evaluator, consolidator, poolSize, defaultConsolidationRegister, now, deadline })
    D->>D: buildSubject(subjectType, subjectAttributes)
    D->>E: collectEvidence({ case, subject, requester, capabilities, observationSource, now, deadline })
    E->>E: collectionPlan(case); teto = min(7_000, deadline − now)
    par um conceito por vez, todos em paralelo
        E->>O: observeConcept(concept, subject, requester)
        O-->>E: { result: ok | unavailable | denied | timeout, observation? }
    end
    E-->>D: Evidence[] (uma por conceito do plano)
    D->>D: evidenceByHypothesisOf(case, evidence)
    D->>J: judgeHypotheses({ case, evidenceByHypothesis, evaluator, capabilities, poolSize, now, deadline: min(deadline, now + 5_000) })
    par uma hipótese por vez, sob pool limitado
        J->>V: evaluate(criterion, evidenceItems, { title, whenToUse })
        V-->>J: EvaluationOutcome
        J->>J: validação de citações; retry único; degradação
    end
    J-->>D: Evaluation[] (uma por hipótese exigida)
    D->>N: resolveAndNarrow({ case, evaluations, evidenceByHypothesis })
    N->>N: resolveOutcome(case, verdicts); narrowInput(...)
    N-->>D: { resolved, narrowedInput }
    D->>T: draftAssessment({ resolved, narrowedInput, consolidationRegister, consolidator })
    T->>K: consolidate(evaluations, evidence, register)
    K-->>T: text
    T-->>D: Assessment { outcome, referral, determining_hypothesis?, text }
    D->>F: buildInvestigation({ ..., evidence, evaluations, assessment, written_at: now, glossary })
    F->>F: valida subject (glossário) e totalidade (plano de coleta, hipóteses exigidas)
    F-->>D: Investigation
    D->>S: write(investigation) — corrida contra min(2_000, deadline − now)
    alt gravação não conclui no prazo
        D-->>C: InvestigationWriteDeadlineExceededError → 500
    end
    S-->>D: ok
    D-->>H: investigation.assessment
    H-->>R: Assessment
    R-->>C: 200 { outcome, referral, determining_hypothesis?, text }
```

Observações sobre o diagrama:

- **A ordem real das etapas** em `src/investigation/run-diagnosis.ts` (função `runDiagnosis`) é: `buildSubject` → `collectEvidence` → `evidenceByHypothesisOf` → `judgeHypotheses` → `resolveAndNarrow` → `draftAssessment` → `buildInvestigation` → `writeWithinDeadline` → retorna `investigation.assessment`. O estreitamento (`resolveAndNarrow`) roda **depois** do julgamento, porque precisa das avaliações; ele é descrito no capítulo 11 porque é onde o caso volta a ser lido (para `resolveOutcome` e `requiresEvaluationOf`).
- A resposta devolvida é **exatamente o `assessment` da investigação gravada**, nunca recalculado (`rules/investigation/an-investigation-is-written-once`, `rules/investigation/replay-is-pinned`), e só é devolvida depois que a gravação concluiu (`rules/investigation/the-response-follows-the-record`, `scenarios/investigation/no-response-without-a-record`).
- `run-diagnosis.ts` **nunca lê o relógio**: `now` e `deadline` chegam como parâmetros, computados uma única vez em `createProductionDiagnoseRunner` (`src/factories/production-diagnose.factory.ts`): `now = Date.now()` e `deadline = now + TOTAL_DEADLINE_BUDGET_MS` (20 000 ms). Cada etapa recebe o mesmo par e intersecta com seu orçamento nominal (`knowledge/constraints/the-deadline-is-an-absolute-propagated-instant.md`).

### 10.3 Composição: quem constrói o quê

O pipeline é montado por três fábricas encadeadas, todas em `src/factories/`:

| Fábrica | Arquivo | O que fixa | O que ainda deixa para o chamador |
|---|---|---|---|
| `createDiagnoseHttpServer(env)` | `src/factories/diagnose-server.factory.ts` | Uma `DatabaseConnection` a partir de `env.DATABASE_URL`; o `HttpDeclarativeObservationSource` (adaptador HTTP real, ver [Coleta](08-coleta.md)); o `CaseQueryService`; o runner de produção; `model = env.EVALUATOR_MODEL` e `promptVersion = env.PROMPT_VERSION` para o controller | Nada — devolve a instância Fastify pronta (sem `listen`) |
| `createProductionDiagnoseRunner(deps)` | `src/factories/production-diagnose.factory.ts` | `AnthropicHypothesisEvaluator` e `AnthropicAssessmentConsolidator` (sempre os adaptadores reais); o par `(now, deadline)` por chamada, com `TOTAL_DEADLINE_BUDGET_MS = 20_000` | `connection`, `observationSource`, `poolSize`, `defaultConsolidationRegister`, `evaluatorModel`, `evaluatorMaxTokens?`, `consolidatorModel`, `consolidatorMaxTokens` |
| `createDiagnoseRunner(deps)` | `src/factories/diagnose.factory.ts` | `createInvestigationStore(connection)`, `createGlossaryQuery(connection)`, `createCapabilityQuery(connection)` — os três lendo da mesma conexão | `observationSource`, `evaluator`, `consolidator`, `poolSize`, `defaultConsolidationRegister`; e, por chamada, tudo o que `DiagnoseCall` declara |

Os valores de configuração vêm de `src/config/env.ts` (validados por Zod na inicialização; ver [Configuração](16-configuracao.md)): `EVALUATOR_MODEL`, `EVALUATOR_MAX_TOKENS` (opcional), `CONSOLIDATOR_MODEL`, `CONSOLIDATOR_MAX_TOKENS`, `POOL_SIZE`, `DEFAULT_CONSOLIDATION_REGISTER`, `PROMPT_VERSION`, `DATABASE_URL`. A credencial `ANTHROPIC_API_KEY` não passa pelo `env.ts`: cada adaptador Anthropic a lê de `process.env` quando não recebe `apiKey` explicitamente.

### 10.4 Orçamentos de tempo por etapa

A regra `knowledge/rules/investigation/an-answer-arrives-within-the-declared-deadline.md` fixa o total em vinte segundos e o divide em: dois de sobrecarga e margem, sete de coleta, cinco de julgamento, quatro de redação e dois de persistência. No código:

| Etapa | Constante | Valor | Onde a interseção com o prazo global acontece |
|---|---|---|---|
| Total | `TOTAL_DEADLINE_BUDGET_MS` | 20 000 ms | `src/factories/production-diagnose.factory.ts` (`deadline = now + 20_000`) |
| Coleta | `COLLECTION_STAGE_BUDGET_MS` | 7 000 ms | Dentro da própria etapa: `src/investigation/evidence-collection-stage.ts` (`stageCeilingMs = max(0, min(7_000, deadline − now))`) |
| Julgamento | `JUDGMENT_STAGE_BUDGET_MS` | 5 000 ms | Feita pelo compositor: `src/investigation/run-diagnosis.ts` (`judgeHypothesesOptions`: `deadline = min(deadline, now + 5_000)`) |
| Redação (consolidação) | — | (4 s na especificação) | **Não implementado**: `draftAssessment` não recebe `deadline` e é chamado sem limite de tempo (comentário de cabeçalho de `run-diagnosis.ts` registra a lacuna) |
| Persistência | `PERSISTENCE_STAGE_BUDGET_MS` | 2 000 ms | `src/investigation/run-diagnosis.ts` (`writeWithinDeadline`: `boundMs = min(2_000, max(0, deadline − now))`) |

Repare que, pela forma como as interseções são calculadas, todas partem do mesmo `now` do início da requisição — não do instante em que cada etapa de fato começa. Isso é uma consequência direta de nenhum módulo ler o relógio; o detalhe completo está em [Deadlines](11-deadlines.md).

### 10.5 Tabela: etapa → arquivo → o que degrada e como

A regra `knowledge/rules/investigation/no-stage-aborts-on-its-deadline.md` diz que nenhuma etapa aborta por estourar o prazo — coleta registra `timeout`, julgamento registra `deadline-exceeded` — com a persistência como única exceção declarada, cuja falha é um erro ao requisitante.

| # | Etapa | Arquivo principal | O que pode dar errado | Como degrada (ou não) |
|---|---|---|---|---|
| 0 | Validação do corpo | `src/http/diagnose.routes.ts`, `src/http/dto/diagnose.dto.ts` | Corpo fora do schema Zod | Não degrada: **400** `VALIDATION_ERROR` com `details` listando `campo: mensagem` para cada violação (`knowledge/constraints/a-malformed-request-is-refused-with-a-validation-error.md`) |
| 1 | Leitura do caso pinado | `src/http/diagnose.controller.ts`, `src/case/case-query.service.ts` | Versão não existe; regra estrutural violada; regra de coerência violada (glossário/registro de capabilities) | Não degrada: `CaseNotFoundError` → **404**; `CaseNotValidError` → **500** `INTERNAL_ERROR` (a classe não consta em `src/errors/status-map.ts`) |
| 2 | Montagem do subject | `src/investigation/subject.ts` (`buildSubject`) | Nenhum atributo-valor | Não degrada: `SubjectCarriesNoAttributeError` → **500** (não mapeado). Na prática o DTO já exige `attributes.min(1)`, então esta refusa só é alcançável por chamadores internos |
| 3 | Coleta de evidências | `src/investigation/evidence-collection-stage.ts` | Conceito sem capability registrada; chamada lenta; conector responde erro; chamada rejeita (exceção) | Degrada para `Evidence` com `result` ∈ {`unavailable`, `timeout`, `denied`} (`scenarios/investigation/a-collection-timeout-degrades-to-no-data`). Uma **rejeição** (erro de rede não-timeout, configuração de conector malformada, placeholder não resolvido) **propaga** e derruba a requisição (**500**) |
| 4 | Julgamento | `src/investigation/judgment-stage.ts` | Evidência não-ok; pool saturado; chamada lenta; provedor falha; resposta ilegível; citação inválida | Degrada para `Evaluation` `inconclusive` com `reason` ∈ {`no-data`, `deadline-exceeded`, `judgment-failure`} — nunca uma lacuna (`rules/investigation/one-evaluation-per-required-hypothesis`) |
| 5 | Resolução do desfecho + estreitamento | `src/investigation/resolve-and-narrow-input.ts`, `src/case/case-resolution.ts` | Nenhuma hipótese confirmou | Não é falha: o `fallback` do caso responde, sem `determining_hypothesis` |
| 6 | Redação do texto | `src/investigation/draft-assessment-text.ts`, `src/investigation/anthropic-assessment-consolidator.adapter.ts` | Provedor falha ou demora | Sem prazo próprio (ver 10.4). O comportamento em falha do provedor é o do adaptador de consolidação (ver [Resolução, consolidação e gravação](10-resolucao-consolidacao-gravacao.md)) |
| 7 | Montagem da Investigation | `src/investigation/investigation-factory.ts` | Atributo do subject não existe no glossário; evidências não cobrem o plano de coleta 1:1; avaliações não cobrem as hipóteses exigidas 1:1; `written_at` ausente | Não degrada: `SubjectAttributeNotInGlossaryError`, `InvestigationNotBuildableError`, `WrittenAtRequiredError` → **500** (não mapeados) |
| 8 | Gravação | `src/investigation/run-diagnosis.ts` (`writeWithinDeadline`), `src/persistence/relational-investigation-store.repository.ts` | Escrita não conclui em `min(2 s, restante)`; id já gravado; falha do banco | **Única etapa que não degrada**: `InvestigationWriteDeadlineExceededError` → **500**; `InvestigationAlreadyStoredError` e `InvestigationStoreError` propagam → **500**. Nenhuma avaliação é devolvida sem registro |
| 9 | Resposta | `src/http/diagnose.routes.ts` | — | **200** com o `Assessment` exatamente como gravado: `outcome`, `referral {action, recipient}`, `determining_hypothesis?`, `text` |

Todos os erros não capturados chegam a `src/http/error-handler.middleware.ts` (`handleUnexpectedError`), registrado em `src/http/build-app.ts` via `app.setErrorHandler`. Ele consulta `src/errors/status-map.ts`: um erro de domínio listado responde com o status atribuído, `code = error.name` e `details = error.context`; qualquer outro responde `500 { error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } }`, sem vazar detalhe interno. Hoje o status-map só conhece `CaseNotFoundError` entre os erros que o pipeline de diagnóstico pode lançar — ver [Erros](17-erros.md).

### 10.6 O que a resposta carrega — e o que não carrega

`diagnoseResponseSchema` (`src/http/dto/diagnose.dto.ts`) espelha `domain/investigation/assessment` com exatamente quatro campos: `outcome`, `referral`, `determining_hypothesis` (opcional) e `text`. Nenhum veredito, citação ou item de evidência cruza para a resposta — esse material é operacional e fica na investigação gravada (`rules/investigation/the-customer-sees-only-the-text`). Quem quiser auditar o que confirmou, o que foi citado e o que a coleta devolveu lê a investigação persistida (ver [Modelo relacional](15-modelo-relacional.md)).

Dois campos da investigação gravada são **placeholders** nesta versão: `cost` (`{ calls: 0, input_tokens: 0, output_tokens: 0 }`) e `durations` (`{ collection: 0, judgment: 0, writing: 0, total: 0 }`), constantes `UNMEASURED_COST` e `UNMEASURED_DURATIONS` em `src/http/diagnose.controller.ts`. Nenhuma porta (`IHypothesisEvaluator`, `IAssessmentConsolidator`, `IObservationSource`) reporta contagem de tokens, de chamadas ou tempo, e `run-diagnosis.ts` não lê relógio — então o controller fornece zero em vez de um valor medido.

## 11. Etapa 1 — leitura e validação do caso pinado, plano de coleta e estreitamento

### 11.1 O que chega pela porta HTTP

A rota `POST /v1/diagnose` é registrada por `createDiagnoseRoutesPlugin` em `src/http/diagnose.routes.ts`, sob o prefixo `API_PREFIX = '/v1'`. A rota não lê nenhum header: o `requester` sob o qual a coleta roda é exatamente `body.requester` (`knowledge/constraints/no-route-enforces-authentication.md`; `rules/investigation/collection-runs-in-the-requester-scope`).

O corpo é validado por `diagnoseRequestSchema` (`src/http/dto/diagnose.dto.ts`):

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `case.slug` | string | sim | não vazio — identifica o caso (`rules/knowledge/a-slug-identifies-one-case`) |
| `case.version` | inteiro | sim | positivo — a versão pinada |
| `subject.type` | string | sim | não vazio — o subject-type do glossário |
| `subject.attributes` | array de `{ attribute, value }` | sim | mínimo 1 par; cada `attribute` e `value` não vazios (`rules/investigation/a-subject-carries-at-least-one-attribute`) |
| `narrative` | string | sim | não vazio — o relato do atendente |
| `requester` | string | sim | não vazio — identidade em cujo escopo a coleta roda |
| `ticket_ref` | string | não | não vazio quando presente — correlação com o sistema de tickets, nunca chave de casamento (`knowledge/contracts/investigation/diagnosis.md`) |

Falha de validação responde `400` com `{ error: { code: 'VALIDATION_ERROR', message: 'the request body failed validation', details: ['campo.sub: mensagem', ...] } }`, listando todas as violações de uma vez.

O controller (`handleDiagnoseRequest`, `src/http/diagnose.controller.ts`) então:

1. Lê o caso via `dependencies.caseQuery.readCase(body.case.slug, body.case.version)`.
2. Monta a `ProductionDiagnoseCall` com `id = randomUUID()`, os campos do corpo, o caso lido, `prompt_version` e `model` vindos da configuração, e os placeholders de custo/duração.
3. Devolve o `Assessment` que o runner respondeu, sem alterar nada.

### 11.2 Leitura do caso: `CaseQueryService.readCase`

O caso chega ao pipeline **inteiro e validado neste instante** — ou não chega (`knowledge/constraints/a-case-is-read-whole.md`). A razão está no próprio nó: uma versão parcialmente montada é um caso "cujo plano de coleta é curto e cuja ordem de precedência tem buracos", e nenhum dos dois se anuncia — `resolveOutcome` responderia a partir das entradas de manifesto que por acaso chegaram. Por isso a leitura nunca para antes do manifesto completo.

`CaseQueryService` (`src/case/case-query.service.ts`) implementa a porta `ICaseQuery` (`src/case/case-query.port.ts`, contrato `knowledge/contracts/knowledge/case-query`) compondo três portas: `ICaseStore`, `IGlossaryQuery` e `ICapabilityQuery`. `readCase(slug, version)` faz, nesta ordem:

| Passo | Função | O que faz | Refusa com |
|---|---|---|---|
| 1 | `heldVersion` | `caseStore.assembleVersion(slug, version)` — monta a versão inteira: atributos próprios, manifesto e, para cada entrada, a hypothesis-revision adotada (achatada na entrada) | `CaseNotFoundError(slug, version)` se `undefined` |
| 2 | `structuralCase` | Projeta a versão montada no formato "documento cru" (`assembledAsRawDocument`) e chama `parseCaseDocument` — todas as regras estruturais (`src/case/parse-case-document.ts`) | `CaseNotValidError(slug, version, problems)` — converte `InvalidCaseDocumentError.context.problems` no erro conjunto que o contrato promete |
| 3 | `refuseIncoherence` | `caseCoherenceViolations(case, glossary, capabilities)` (`src/case/validate-case-coherence.ts`) | `CaseNotValidError(slug, version, violations)` |

As regras de coerência verificadas no passo 3, todas nomeadas juntas numa só refusa:

- **Termos do vocabulário** — cada outcome, action, recipient e subject-type nomeado pelo caso existe no glossário (`glossary.readVocabularyTerm`; `rules/knowledge/case-terms-exist-in-the-glossary`).
- **Conceitos** — cada conceito em algum `collects` existe no glossário e aceita o subject-type do caso.
- **Capabilities** — para cada conceito coletado, `capabilities.readCapability(concept)` responde uma capability que existe, é `read-only`, declara `output_schema` não vazio e declara `timeout` (`rules/knowledge/every-collected-concept-has-a-read-only-capability`).

O resultado é `{ case }` sem hash ou digest: um caso é pinado por `slug` e `version` apenas (`rules/investigation/replay-is-pinned`), porque uma versão liberada — e toda hypothesis-revision que seu manifesto referencia — nunca é alterada depois.

**O que a leitura para diagnóstico não verifica.** A regra `knowledge/rules/investigation/only-a-released-case-version-is-diagnosed.md` e o cenário `knowledge/scenarios/investigation/a-draft-case-version-refuses-diagnosis.md` exigem que uma versão em estado `draft` seja recusada ao ser pinada por uma investigação. **Não implementado**: nem `handleDiagnoseRequest`, nem `readCase`, nem `runDiagnosis` lêem `case.state`; uma versão `draft` que passe nas regras estruturais e de coerência é diagnosticada normalmente.

Existe uma segunda leitura, `replayCase(slug, version, caseStore)` no mesmo arquivo, que devolve o conteúdo pinado **sem** rodar nem a validação estrutural nem a de coerência — é a exceção declarada para reprodução de investigações antigas (reprodutibilidade pina conteúdo, não validade atual). O pipeline de diagnóstico não a usa.

### 11.3 O que do caso o pipeline consome

O tipo `Case` (`src/case/case.ts`) que chega a `runDiagnosis` carrega `slug`, `title`, `when_to_use`, `version`, `authored_at`, `subject` (nome do subject-type), `fallback` (Resolution), `consolidation_register?`, `state`, `released_at?`, `manifest` e `hypotheses` (projeção achatada do manifesto: `name`, `criterion`, `collects`, `resolution`). Cada etapa lê só o que precisa:

| Consumidor | O que lê do caso | Para quê |
|---|---|---|
| `collectEvidence` | `collectionPlan(case)` | Quais conceitos coletar |
| `evidenceByHypothesisOf` (`run-diagnosis.ts`) | `hypotheses[].name`, `hypotheses[].collects` | Distribuir as evidências por hipótese |
| `judgeHypotheses` | `requiresEvaluationOf(case)`, `hypotheses[].criterion`, `hypotheses[].collects`, `title`, `when_to_use` | Quem julgar, com que critério, e o contexto do prompt fechado |
| `resolveAndNarrow` | `requiresEvaluationOf(case)`, `resolveOutcome(case, verdicts)` (manifesto por `position`, `fallback`) | Desfecho e estreitamento |
| `draftAssessment` (via `runDiagnosis`) | `consolidation_register ?? defaultConsolidationRegister` | Registro de escrita |
| `buildInvestigation` | `collectionPlan`, `requiresEvaluationOf`, `slug`, `version` | Totalidade e o pin `pinned_case` |

### 11.4 Construção do plano de coleta

O plano de coleta é comportamento do próprio caso, em `src/case/case-resolution.ts`:

- **`collectionPlan(case)`** — a união deduplicada dos `collects` de cada hypothesis-revision manifestada, cada conceito aparecendo uma vez, na ordem em que a precedência declarada o nomeia primeiro. A precedência é a `position` de cada entrada do manifesto, ordenada ascendentemente (`byPrecedence`), nunca a ordem do array (`rules/knowledge/hypotheses-are-ordered-by-precedence`). É um conjunto: o conceito identifica a evidência, e por isso Evidence não tem id próprio (`rules/investigation/one-evidence-per-collected-concept`).
- **`requiresEvaluationOf(case)`** — um nome por hipótese manifestada, na ordem do array `manifest` (esta função não reordena por `position`, porque nenhum nó da especificação fixa a ordem das avaliações). É a lista que o julgamento percorre e que a fábrica confere na totalidade (`rules/investigation/one-evaluation-per-required-hypothesis`).
- **`resolveOutcome(case, verdicts)`** — a primeira entrada em ordem de `position` cujo veredito é `confirmed` decide: responde `outcome`, `referral` e `determining` da sua hypothesis-revision. Se nenhuma confirma, o `fallback` responde e `determining` fica ausente (`scenarios/knowledge/no-confirmation-falls-back`).

A evidência coletada é uma lista plana por conceito. Quem a redistribui por hipótese é `evidenceByHypothesisOf` em `src/investigation/run-diagnosis.ts`: para cada `hypothesis` de `case.hypotheses`, o `Evidence[]` filtrado por `hypothesis.collects.includes(item.concept)`. Esse mapa `ReadonlyMap<nome, Evidence[]>` é a convenção compartilhada entre o julgamento e o estreitamento — um conceito coletado por duas hipóteses aparece no `Evidence[]` de ambas, mas foi coletado uma só vez.

### 11.5 Montagem do subject

Antes da coleta, `runDiagnosis` chama `buildSubject(subjectType, subjectAttributes)` (`src/investigation/subject.ts`). É o único lugar onde `rules/investigation/a-subject-carries-at-least-one-attribute` é imposta: um conjunto vazio de atributos-valores lança `SubjectCarriesNoAttributeError(type)`. O Subject resultante é `{ type, attributes: [...] }` (cópia do array) e viaja **inteiro** para cada `observeConcept` — nenhum atributo é filtrado antes da chamada; é o conector quem decide quais usar (`domain/investigation/subject`).

A verificação de que cada nome de atributo existe no glossário (`rules/investigation/a-subject-attribute-is-drawn-from-the-glossary`) **não** acontece aqui: ela é feita por `buildInvestigation` (`src/investigation/investigation-factory.ts`, `refuseAttributesNotInGlossary`, via `glossary.readVocabularyTerm('subject-attribute', name)`), ou seja, depois da coleta e do julgamento, ao montar o registro final. Um atributo desconhecido derruba a requisição com `SubjectAttributeNotInGlossaryError` — depois de o custo de coleta e julgamento já ter sido pago.

### 11.6 Estreitamento do input: `resolveAndNarrow`

Arquivo: `src/investigation/resolve-and-narrow-input.ts`. Roda depois do julgamento e decide **o que a consolidação pode ver**. É puro e síncrono: importa apenas tipos de dados do caso, de `case-resolution`, de Evaluation, Citation e Evidence (`knowledge/constraints/the-domain-depends-on-no-infrastructure.md`).

```ts
export function resolveAndNarrow(options: ResolveAndNarrowOptions): ResolveAndNarrowResult {
  const { case: theCase, evaluations, evidenceByHypothesis } = options;
  const resolved = resolveOutcome(theCase, verdictsOf(evaluations));
  const narrowedInput = narrowInput(theCase, evaluations, evidenceByHypothesis);
  return { resolved, narrowedInput };
}
```

Dois resultados:

**`resolved: ResolvedOutcome`** — o que `resolveOutcome(case, verdicts)` respondeu, literalmente, computado em nenhum outro lugar (`rules/investigation/the-outcome-comes-from-the-case`). `verdictsOf` deriva o mapa `{ [hipótese]: verdict }` a partir das avaliações. O desfecho, o encaminhamento e a hipótese determinante de uma avaliação são exatamente o que o caso pinado resolve; a redação só redige.

**`narrowedInput: NarrowedInput`** — o que a consolidação recebe (`rules/investigation/the-writing-input-is-narrowed`):

| Campo | Conteúdo | Regra |
|---|---|---|
| `evaluations` | As avaliações filtradas a exatamente as hipóteses que `requiresEvaluationOf(case)` nomeia, na ordem em que as avaliações chegaram (nunca reordenadas para a precedência) | `requiredEvaluationsOf` — um chamador não consegue contrabandear uma hipótese que o caso não exige |
| `evidence` | Exatamente as evidências que alguma citação dessas avaliações nomeia, uma por conceito (deduplicadas), na ordem da primeira citação | `narrowedEvidenceOf` — lê o `Evidence[]` da própria hipótese citante; um conceito citado sem evidência correspondente é falta de contrato do chamador e lança `Error` |

A amplitude é **incondicional**: nada lê `resolved.determining`, então um desfecho confirmado estreita da mesma forma que um que caiu no fallback — "um desfecho confirmado não significa que toda outra hipótese ficou sem teste, e a redação precisa do que foi descartado ao lado do que foi confirmado" (descrição do nó). A garantia estrutural está no tipo: `NarrowedInput` não declara nenhum campo que possa carregar o `criterion` de uma hipótese ou o `when_to_use` do caso — `Evaluation` e `Evidence` não os têm — de modo que o corpo do caso não entra em nenhum prompt de consolidação por construção.

Como as citações de uma avaliação `inconclusive`/`no-data` apontam para as evidências não-ok (`field: ''`), essas evidências também entram em `narrowedInput.evidence`: a redação vê que um dado não chegou, e por quê (`result`, `result_detail`), sem ver o critério que dependia dele.

### 11.7 Erros desta etapa

| Erro | Origem | Status HTTP hoje |
|---|---|---|
| `VALIDATION_ERROR` (envelope, não classe) | `diagnose.routes.ts` | 400 |
| `CaseNotFoundError` | `case-query.service.ts` (`heldVersion`) | 404 (`status-map.ts`) |
| `CaseNotValidError` | `case-query.service.ts` (`structuralCase`, `refuseIncoherence`) | 500 — não mapeado |
| `SubjectCarriesNoAttributeError` | `subject.ts` (`buildSubject`) | 500 — não mapeado; inalcançável via HTTP pelo `min(1)` do DTO |
| `SubjectAttributeNotInGlossaryError` | `investigation-factory.ts` (após coleta e julgamento) | 500 — não mapeado |
| `Error` genérico ("no evidence was supplied…") | `resolve-and-narrow-input.ts` (`evidenceForCitation`) — falta de contrato interna, não alcançável quando `evidenceByHypothesisOf` cobre todas as hipóteses | 500 |

### 11.8 Nós da especificação que governam esta etapa

- `knowledge/constraints/diagnosis-answers-synchronously.md` — síncrono, sem fila.
- `knowledge/constraints/a-case-is-read-whole.md` — caso inteiro ou nada.
- `knowledge/constraints/a-malformed-request-is-refused-with-a-validation-error.md` — 400 com todas as violações.
- `knowledge/contracts/investigation/diagnosis.md` — entrada e saída da operação `diagnose`.
- `knowledge/contracts/investigation/case-source.md` — a investigação roda exatamente o caso publicado, pinado por slug e versão no início da requisição.
- `knowledge/rules/investigation/replay-is-pinned.md` — pin por slug/versão, modelo, prompt_version e evidência.
- `knowledge/rules/investigation/only-a-released-case-version-is-diagnosed.md` — não implementado no caminho de diagnóstico.
- `knowledge/rules/investigation/the-outcome-comes-from-the-case.md`, `knowledge/rules/investigation/the-writing-input-is-narrowed.md` — resolução e estreitamento.
- `knowledge/rules/investigation/a-subject-carries-at-least-one-attribute.md`, `knowledge/rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.md` — subject.
