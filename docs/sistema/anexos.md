# Anexos

Quatro tabelas de referência cruzada entre a especificação (`knowledge/`), o código (`src/`) e esta documentação. A. regra de negócio → arquivo que a implementa; B. restrições arquiteturais; C. cenários como casos de teste; D. índice remissivo de entidades e termos.

Método: para A, o nome de cada nó de `knowledge/rules/**` foi procurado nos comentários de `src/` (fora de `__tests__`); quando o nome não aparece, a implementação foi localizada pela classe de erro ou pela função que a regra nomeia, e isso está indicado. Para C, o nome do cenário foi procurado em `src/__tests__/`; quando não aparece, o teste foi localizado pelos valores que o cenário afirma (`deadline-exceeded`, `judgment-failure`, `timeout`), também indicado.

## A. Regras de negócio → implementação

### A.1 Contexto Glossário (`knowledge/rules/glossary/`)

| Regra | Tipo | Implementação | Como foi localizada |
|---|---|---|---|
| `a-glossary-read-by-an-unheld-name-is-refused` | invariante | `src/http/read-vocabulary-term.controller.ts` (`VocabularyTermNotHeldError`), `src/http/read-concept.controller.ts` (`ConceptNotHeldError`); status 404 em `src/errors/status-map.ts` | pela classe de erro (nome do nó não citado no `src/`) |
| `a-recipient-is-a-role` | invariante | Não verificável por código: revisão humana. Nenhuma implementação | — |
| `a-vocabulary-holds-each-name-once` | invariante | `GlossaryService.assertUniqueNames` em `src/glossary/glossary.service.ts` (`DuplicateGlossaryNameError`, 500); PK `name` das cinco tabelas de vocabulário e de `concepts` (`src/migrations/0002-glossary-vocabulary.sql`) | pela classe de erro |
| `an-action-names-what-its-recipient-does` | invariante | Revisão humana. Nenhuma implementação | — |
| `an-outcome-is-contributed-by-a-confirmable-hypothesis` | política | Nenhuma implementação: um `outcome` novo entra por `seed.ts` ou direto no banco; `hypothesis_revisions.resolution_outcome` apenas referencia `outcomes` (FK) | — |
| `the-non-conclusion-outcomes-precede-the-first-case` | política | `NON_CONCLUSION_OUTCOMES` em `src/glossary/terms.ts`; `GlossaryService.withNonConclusionOutcomes` (insere os que faltam em toda leitura de `outcome`); `seedOutcomes` em `src/seed.ts`; `seedNonConclusionOutcomes` em `src/vitest-global-setup.ts` | nome do nó citado |

### A.2 Contexto Integração (`knowledge/rules/integration/`)

| Regra | Tipo | Implementação | Como foi localizada |
|---|---|---|---|
| `a-capability-declares-its-contract` | invariante | `REQUIRED_REGISTRATION_ATTRIBUTES`, `DEFAULT_CAPABILITY_TIMEOUT_MS = 60_000` em `src/capability-registry/capability.ts`; `refuseContractDepartures`/`contractProblems` em `src/capability-registry/capability-registry.service.ts` (`IncompleteCapabilityContractError`, 422); `src/http/dto/register-capability.dto.ts` | nome citado |
| `a-capability-declares-well-formed-schemas` | invariante | `refuseMalformedSchemas`/`isWellFormedJson` em `capability-registry.service.ts` (`CapabilitySchemaNotWellFormedError`, 422) | nome citado |
| `a-capability-is-read-only` | invariante | `READ_ONLY_NATURE` em `capability.ts`; `heldCapability` em `capability-registry.service.ts` (`CapabilityNotReadOnlyError`, 422); CHECK `capabilities_nature_check` em `0003-capability-registry.sql` | nome citado |
| `a-connector-configuration-holds-a-well-formed-object` | invariante | `wellFormedConfiguration` em `src/connector-registry/connector-configuration-registry.service.ts` (`ConnectorConfigurationNotWellFormedError`, 422); `src/http/dto/register-connector.dto.ts`; `toReadConnectorConfigurationResponse` devolve texto | nome citado |
| `a-connector-configuration-is-tested-through-a-registered-capability` | política | `resolveTestedCapability` em `src/http/test-connector.controller.ts` (`CapabilityNotRegisteredForTestError` 404, `CapabilityConnectorMismatchError` 409); `src/http/test-connector.routes.ts` | nome citado |
| `a-connector-configuration-names-its-connector` | invariante | `registrationProblems` em `connector-configuration-registry.service.ts` (`IncompleteConnectorConfigurationError` — **não mapeado, responde 500 em vez do 422 pedido**; o DTO recusa vazio com 400 antes) | pela classe de erro |
| `a-connector-configuration-read-by-an-unregistered-name-is-refused` | invariante | `readConnectorConfigurationOrThrow` em `connector-configuration-registry.service.ts` (`ConnectorConfigurationNotFoundError`, 404) | nome citado |
| `an-http-connector-configuration-declares-its-call` | invariante | `asHttpConnectorCallConfiguration` em `src/investigation/http-declarative-observation-source.adapter.ts` (`MalformedHttpConnectorConfigurationError` → evidência `unavailable`); `HTTP_METHODS`, `HttpConnectorCallConfiguration` em `src/http-connector/http-connector-call-configuration.ts` | pela classe de erro |
| `an-unclassified-status-ends-unavailable` | política | `endingForStatus`/`DEFAULT_STATUS_ENDING = 'unavailable'` em `http-declarative-observation-source.adapter.ts` | pela função |
| `an-unresolvable-observation-ends-unavailable` | política | `http-declarative-observation-source.adapter.ts` (`CapabilityNotResolvedForObservationError`, `DuplicateConceptAnswerError`, `ConnectorConfigurationNotRegisteredError` como `result_detail`) | pelas classes de erro |
| `evidence-arrives-in-the-glossary-vocabulary` | política | `src/http-connector/response-path-extractor.ts` (`responseMap` → campos do glossário); `http-declarative-observation-source.adapter.ts` | nome citado |
| `one-capability-answers-one-concept` | política | `refuseAnsweredConcept` (`ConceptAlreadyAnsweredError`, 409) e `readCapability` (`DuplicateConceptAnswerError`, 500) em `capability-registry.service.ts`; `src/capability-registry/capability-query.port.ts` | nome citado |

### A.3 Contexto Investigação (`knowledge/rules/investigation/`)

| Regra | Tipo | Implementação | Como foi localizada |
|---|---|---|---|
| `a-citation-stays-within-the-hypothesis-collects` | política | `src/investigation/citation-validation.ts`; retry/degradação em `src/investigation/judgment-stage.ts` | nome citado |
| `a-cited-field-exists-in-the-capability-output-schema` | política | `citation-validation.ts`, `src/investigation/citation.ts`, `src/investigation/hypothesis-evaluator.port.ts` (nomes de campo do `output_schema` entram no prompt), `judgment-stage.ts` | nome citado |
| `a-decided-evaluation-cites-evidence` | invariante | Tipo `Evaluation` em `src/investigation/evaluation.ts` (citações não vazias para `confirmed`/`refuted`); `anthropic-hypothesis-evaluator.adapter.ts`; `nonEmptyCitations` em `src/persistence/relational-investigation-store.repository.ts` | nome citado |
| `a-subject-attribute-is-drawn-from-the-glossary` | política | `src/investigation/investigation-factory.ts` (`SubjectAttributeNotInGlossaryError`); `src/investigation/subject.ts`, `subject-attribute-value.ts`; FK `investigation_subject_attribute_values.attribute` | nome citado |
| `a-subject-carries-at-least-one-attribute` | invariante | `buildSubject` em `src/investigation/subject.ts` (`SubjectCarriesNoAttributeError`); `.min(1)` em `src/http/dto/diagnose.dto.ts` e `test-connector.dto.ts` | nome citado |
| `an-answer-arrives-within-the-declared-deadline` | política | `TOTAL_DEADLINE_BUDGET_MS = 20_000` em `src/factories/production-diagnose.factory.ts`; propagação em `src/investigation/run-diagnosis.ts` | nome citado |
| `an-inconclusive-evaluation-declares-its-reason` | invariante | `EVALUATION_REASONS` em `src/investigation/evaluation-reason.ts`; tipo `Evaluation`; `judgment-stage.ts` (`no-data`, `judgment-failure`, `deadline-exceeded`); CHECK `investigation_evaluations_reason_check` | nome citado |
| `an-investigation-is-written-once` | invariante | `RelationalInvestigationStore.write` + PK `investigations_pkey` (`InvestigationAlreadyStoredError`); `src/investigation/investigation-store.port.ts` (só `write`/`read`) | nome citado |
| `collection-has-its-own-budget-within-the-total` | política | `COLLECTION_STAGE_BUDGET_MS = 7_000` e `stageCeilingMs = min(budget, deadline - now)` em `src/investigation/evidence-collection-stage.ts` | nome citado |
| `collection-runs-in-the-requester-scope` | invariante | `requester` propagado em `evidence-collection-stage.ts` → `IObservationSource` (`observation-source.port.ts`) → placeholder `${requester}` em `src/http-connector/connector-request-resolver.ts` | nome citado |
| `judgment-does-not-infer` | invariante | Instrução fixa do prompt em `src/investigation/anthropic-hypothesis-evaluator.adapter.ts`; `judgment-stage.ts` | nome citado |
| `no-stage-aborts-on-its-deadline` | política | `evidence-collection-stage.ts` (resultado `timeout`), `judgment-stage.ts` (`deadline-exceeded`), `run-diagnosis.ts` (persistência é a exceção: `InvestigationWriteDeadlineExceededError`) | nome citado |
| `one-evaluation-per-required-hypothesis` | invariante | `investigation-factory.ts` (`InvestigationNotBuildableError`); PK `(investigation_id, hypothesis)`; `judgment-stage.ts` | nome citado |
| `one-evidence-per-collected-concept` | invariante | `investigation-factory.ts`; `evidence-collection-stage.ts`; PK `(investigation_id, concept)` | nome citado |
| `only-a-released-case-version-is-diagnosed` | política | **Não implementado.** `handleDiagnoseRequest` (`src/http/diagnose.controller.ts`) usa `caseQuery.readCase`, que não distingue `draft` de `released`; nenhum lançamento por estado no caminho de diagnóstico | busca por `state`/`released` em `run-diagnosis.ts` e `diagnose.controller.ts` sem resultado |
| `replay-is-pinned` | invariante | `Investigation.pinned_case`, `model`, `prompt_version` em `src/investigation/investigation.ts`; `run-diagnosis.ts`; `replayCase` em `src/case/case-query.service.ts` (leitura sem revalidação) | nome citado |
| `the-customer-sees-only-the-text` | invariante | Nenhuma imposição em código: `DiagnoseResponseDto` devolve `outcome`, `referral`, `determining_hypothesis` e `text` ao chamador (o atendente); a separação cliente/operação é responsabilidade do front-end | — |
| `the-outcome-comes-from-the-case` | política | `src/case/case-resolution.ts` (resolve pela precedência); `src/investigation/resolve-and-narrow-input.ts`; `draft-assessment-text.ts` e `anthropic-assessment-consolidator.adapter.ts` só redigem `text` | nome citado |
| `the-response-follows-the-record` | invariante | `run-diagnosis.ts` grava antes de devolver; `InvestigationWriteDeadlineExceededError` | nome citado |
| `the-writing-input-is-narrowed` | invariante | `src/investigation/resolve-and-narrow-input.ts`; `assessment-consolidator.port.ts`; `draft-assessment-text.ts` | nome citado |

### A.4 Contexto Conhecimento (`knowledge/rules/knowledge/`)

| Regra | Tipo | Implementação | Como foi localizada |
|---|---|---|---|
| `a-case-has-at-least-one-hypothesis` | invariante | `refuseEmptiedManifest` em `src/case/manifest-composition.operations.ts` (`ManifestWouldHoldNoHypothesisError`, 422); `parseCaseDocument` exige manifesto não vazio; `readCaseResponseSchema.manifest.min(1)` | nome citado |
| `a-case-has-at-most-one-draft` | política | Índice único parcial `case_versions_one_draft_per_case` (`0009`); `raiseCreateDraftFailure` em `src/persistence/relational-case-store.repository.ts` (`CaseAlreadyHasDraftError`, 409) | nome citado |
| `a-case-read-by-an-unknown-slug-or-version-is-refused` | política | `CaseNotFoundError` (404) em `case-query.service.ts`, `release.operation.ts`, `discard.operation.ts`, `manifest-composition.operations.ts`, `relational-case-store.repository.ts` | pela classe de erro |
| `a-case-summary-is-derived-from-its-existing-versions` | política | **Não implementado.** Nenhum tipo `CaseSummary`, `current_state`, `version_count` ou `last_updated` no `src/` | — |
| `a-case-version-is-written-once` | invariante | Regras `case_versions_no_update`, `case_versions_no_delete_when_released`, `case_version_hypotheses_no_*_when_released` (`0006`, `0009`); `CaseVersionNotDraftError` nas operações de rascunho | nome citado |
| `a-case-version-moves-through-its-declared-lifecycle` | máquina de estados | `CASE_VERSION_STATES` em `src/case/case.ts`; `requireDraftVersion` (`CaseVersionNotDraftError`), `refuseNonDraft` em `release.operation.ts` (`CaseVersionNotDraftAtReleaseError`); `releaseStatement` | nome citado |
| `a-case-version-number-is-never-reused` | política | `cases.next_version` + `nextVersionUpdateStatement` em `relational-case-store.repository.ts` | nome citado |
| `a-collected-concept-declares-a-ttl` | política | `DEFAULT_CONCEPT_TTL_SECONDS = 60` em `src/glossary/terms.ts`; `GlossaryService.concepts`/`registerConcept`; coluna `concepts.ttl NOT NULL`. Observação: o `ttl` **não** chega à evidência (`DEFAULT_EVIDENCE_TTL_SECONDS` em `src/investigation/evidence.ts`) | nome citado |
| `a-concept-accepts-the-declared-subject-type` | política | `refuseConceptsRefusingSubject` em `src/case/revise-hypothesis.operation.ts` (`ConceptRefusesSubjectTypeError`); `caseCoherenceViolations` em `src/case/validate-case-coherence.ts` | nome citado |
| `a-hypothesis-collects-at-least-one-concept` | invariante | `refuseEmptyCollects` em `revise-hypothesis.operation.ts` (`HypothesisRevisionCollectsNoConceptError`); `parseCaseDocument` | nome citado |
| `a-hypothesis-declares-a-criterion` | invariante | `parseCaseDocument` (`src/case/parse-case-document.ts`); `criterion: z.string().min(1)` no DTO de revisão | nome citado |
| `a-hypothesis-is-revised-only-against-its-cases-draft` | política | `refuseWithoutDraft` em `revise-hypothesis.operation.ts` (`CaseHoldsNoDraftError`); `findDraftVersion` | nome citado |
| `a-hypothesis-name-is-unique-within-its-case` | política | PK `hypotheses (case_slug, name)` + `INSERT ... ON CONFLICT DO NOTHING` em `hypothesisIdentityStatement` | nome citado |
| `a-hypothesis-position-is-unique-within-its-case` | invariante | `refuseOccupiedByAnother` em `manifest-composition.operations.ts`; `UNIQUE case_version_hypotheses_position_unique` + `raisePlaceHypothesisFailure` (`ManifestPositionOccupiedError`, 409) | nome citado |
| `a-hypothesis-revision-number-is-never-reused` | política | `revisionInsertStatement` (`COALESCE(MAX(revision),0)+1`) em `relational-case-store.repository.ts`; regra `hypothesis_revisions_no_update` | nome citado |
| `a-new-drafts-manifest-is-copied-from-an-existing-version` | política | `resolveSourceVersion` + `manifestCopyStatement` em `relational-case-store.repository.ts`; `source_version` em `CreateDraftInput` | nome citado |
| `a-release-refusal-with-no-named-violation-says-so` | invariante | Agregação: `releaseViolations` em `release.operation.ts` (`CaseVersionNotReleasableError`, 422). **A frase explícita para lista vazia não foi encontrada** — a recusa só acontece se `violations.length > 0` | pela classe de erro |
| `a-released-hypothesis-revision-is-never-altered` | política | Regras `hypothesis_revisions_no_update` (`0009`), `hypothesis_revision_collects_no_update` e `..._no_delete_when_released` (`0010`); `release.operation.ts` | nome citado |
| `a-slug-identifies-one-case` | invariante | PK `cases.slug`; `caseIdentityStatement` (`ON CONFLICT DO NOTHING`); `src/case/case.ts` | nome citado |
| `case-terms-exist-in-the-glossary` | política | `caseCoherenceViolations` em `validate-case-coherence.ts`; `refuseUnknownConcepts` em `revise-hypothesis.operation.ts` (`ConceptNotInGlossaryError`); FKs de `case_versions` e `hypothesis_revisions` para as tabelas de vocabulário | nome citado |
| `every-case-version-remains-readable` | invariante | `CaseQueryService.readCase` aceita qualquer versão; regra `case_versions_no_delete_when_released` | nome citado |
| `every-collected-concept-has-a-read-only-capability` | política | `caseCoherenceViolations` em `validate-case-coherence.ts` consulta `ICapabilityQuery.readCapability` por conceito | nome citado |
| `every-position-declares-a-resolution` | política | `parseCaseDocument`; colunas `NOT NULL` `fallback_*` e `resolution_*` | nome citado |
| `hypotheses-are-ordered-by-precedence` | invariante | `src/case/case-resolution.ts` (primeira confirmada na ordem do manifesto); `manifestSelect ... ORDER BY cvh.position` | nome citado |
| `one-falsifiable-claim-per-criterion` | invariante | Revisão humana. Nenhuma implementação | — |
| `only-a-draft-case-version-may-be-discarded` | invariante | `discardCaseVersion` em `src/case/discard.operation.ts` (`CaseVersionNotDraftError`); regra `case_versions_no_delete_when_released` | nome citado |
| `the-contract-check-reads-the-current-registration` | política | `caseCoherenceViolations` lê o registro a cada chamada, chamado em toda leitura (`CaseQueryService.readCase`) e no `release` | nome citado |
| `validation-runs-at-every-read` | invariante | `CaseQueryService.readCase` (`CaseNotValidError`); `replayCase` (sem revalidação); `src/http/read-case.controller.ts`, `update-draft.controller.ts` | nome citado |

## B. Restrições arquiteturais (`knowledge/constraints/`)

| Restrição | Escopo | Explicação | Onde se materializa |
|---|---|---|---|
| `a-case-is-read-whole` | knowledge | A versão de caso lida para diagnóstico é montada inteira — raiz, manifesto, revisões e `collects` — numa única transação, ou não é lida. Hipóteses e entradas de manifesto podem ser criadas ou removidas isoladamente durante a autoria, mas a leitura nunca devolve um manifesto parcial. | `RelationalCaseStore.assembleVersion` → `assembleWholeVersion` dentro de `runInTransaction` (`src/persistence/relational-case-store.repository.ts`) |
| `a-malformed-request-is-refused-with-a-validation-error` | system | Toda rota recusa path, query ou body fora da forma declarada com 400, código `VALIDATION_ERROR`, mensagem dizendo qual das três partes falhou e `details` listando os problemas. A forma da recusa é única para a superfície toda. | Bloco `safeParse` em cada `src/http/*.routes.ts`; schemas em `src/http/dto/*.dto.ts` |
| `consolidation-runs-behind-a-port` | investigation | A redação do assessment é invocada só pela porta `IAssessmentConsolidator`; o LLM é um adaptador entre vários intercambiáveis (produção, fake, futuro redator por regras). O domínio não importa cliente de LLM. | `src/investigation/assessment-consolidator.port.ts`; adaptadores `anthropic-assessment-consolidator.adapter.ts` e `fake-assessment-consolidator.adapter.ts`; ligação em `src/factories/production-diagnose.factory.ts` |
| `diagnosis-answers-synchronously` | system | O diagnóstico responde na própria requisição — sem job, fila ou polling. É isso que torna o prazo absoluto e as regras de degradação obrigatórios. | `POST /v1/diagnose` devolve o `Assessment` no `200` (`src/http/diagnose.routes.ts`, `diagnose.controller.ts`) |
| `evidence-normalization-is-an-anticorruption-layer` | integration | Observações são traduzidas para o vocabulário do glossário na borda da integração; nenhum nome de campo do sistema-fonte cruza para o domínio. | `responseMap` aplicado por `src/http-connector/response-path-extractor.ts` dentro de `http-declarative-observation-source.adapter.ts`; `Evidence.observation` já normalizada |
| `hypotheses-are-judged-in-isolated-parallel-calls` | investigation | Cada hipótese é julgada numa chamada própria, em paralelo, sob um pool limitado — prompt pequeno, sem viés de ordem, erro contido a uma hipótese. | `src/investigation/judgment-stage.ts` com `poolSize` de `POOL_SIZE` (`src/config/env.ts`) |
| `judgment-runs-behind-a-port` | investigation | O julgamento é invocado só pela porta `IHypothesisEvaluator`; o LLM é um adaptador. | `src/investigation/hypothesis-evaluator.port.ts`; `anthropic-hypothesis-evaluator.adapter.ts`, `fake-hypothesis-evaluator.adapter.ts` |
| `listings-are-paged` | system | Toda listagem responde uma página por `offset` (≥ 0, padrão 0) e `limit` (> 0, padrão configurado, limitado a um máximo configurado), com `data`, `total`, `offset`, `limit` e `pageCount`. Os valores são configuração de deploy, não do domínio. | `src/types/pagination.ts`; `resolvePagination` em cada `src/http/list-*.controller.ts`; `PAGINATION_DEFAULT_LIMIT`/`PAGINATION_MAX_LIMIT` |
| `no-route-enforces-authentication` | system | Nenhuma rota é guardada por autenticação nesta build; toda requisição é aceita com a identidade que afirma. O `requester` é uma afirmação repassada, não uma identidade verificada. | Ausência de hook/guard em `src/http/build-app.ts` e em todos os `*.routes.ts` |
| `the-capability-identity-read-is-rate-limited` | integration | `GET /v1/capabilities/:name/:version` aceita 60 requisições por minuto por IP de origem; a 61ª recebe 429 com `Retry-After`. Confinado a essa única rota. | `src/http/read-capability-by-identity-rate-limit.middleware.ts`, registrado em `read-capability-by-identity.routes.ts` |
| `the-capability-identity-read-refuses-an-unregistered-identity` | integration | Identidade não registrada responde 404 nomeando `CapabilityIdentityNotFoundError`, nunca resposta vazia ou genérica. | `readCapabilityByIdentityOrThrow` em `src/capability-registry/capability-registry.service.ts`; `status-map.ts` |
| `the-concept-read-refuses-an-unanswered-concept` | integration | `GET /v1/capabilities/:concept` para conceito sem capacidade responde 404 nomeando `ConceptNotAnsweredError`. | `src/http/read-capability.controller.ts`; `status-map.ts` |
| `the-consolidation-prompt-is-closed` | investigation | O prompt de consolidação contém só as avaliações das hipóteses exigidas, a evidência citada e o registro do caso, em bloco delimitado, sem tool calling. Dados são dados, nunca instrução. | `src/investigation/anthropic-assessment-consolidator.adapter.ts`; entrada estreitada por `resolve-and-narrow-input.ts` |
| `the-database-is-externally-provisioned` | system | O banco é provisionado fora do deploy e alcançado só por URL de configuração; o deploy não provisiona serviço de banco. | `DATABASE_URL` em `src/config/env.ts`; `src/__tests__/unit/deployment-provisions-no-database-service.spec.ts` |
| `the-deadline-is-an-absolute-propagated-instant` | investigation | Um prazo absoluto é registrado na entrada; cada estágio recebe o mínimo entre seu orçamento nominal e o tempo restante; o total interno fica abaixo do timeout do chamador. Um estágio que termina cedo devolve o saldo ao próximo. | `now`/`deadline` em `production-diagnose.factory.ts`; `Math.min(budget, deadline - now)` em `evidence-collection-stage.ts` e `run-diagnosis.ts` |
| `the-domain-depends-on-no-infrastructure` | system | Os módulos de domínio (caso, fábrica de investigação, avaliação, vocabulário) não importam framework, driver ou cliente de provedor; a infraestrutura os alcança por portas. | Portas `*.port.ts`; fábricas `src/factories/*`; `src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts` |
| `the-evidence-cache-admits-only-ok-results` | investigation | Se existir cache de evidência, sua chave é conceito + tipo de sujeito + atributos + inputs, o `ttl` vem do conceito e só resultados `ok` entram. | **Não implementado**: não há adaptador de cache no `src/` |
| `the-judgment-prompt-is-closed` | investigation | O prompt de julgamento contém só o critério de uma hipótese, sua própria evidência, os nomes de campo do `output_schema` da capacidade produtora, e `title`/`when_to_use` do caso, em bloco delimitado, sem tool calling. | `src/investigation/anthropic-hypothesis-evaluator.adapter.ts`; `hypothesis-evaluator.port.ts` |
| `the-schema-replays-from-its-scripts` | system | O schema é reconstruível num banco vazio aplicando os scripts na ordem numerada, sem passo manual. | `src/persistence/migration-runner.ts`; `src/migrations/0001..0010`; `src/migrate.ts`; `src/vitest-global-setup.ts` |
| `the-stored-schema-mirrors-the-declared-model` | system | Toda coluna que guarda registro pareia com um atributo declarado em `knowledge/domain/`; só a contabilidade de migração é exceção. Impede que o schema vire segunda casa de um fato de domínio. | Pareamento em [Modelo relacional, 21.3](15-modelo-relacional.md); `schema_migrations` como exceção |
| `the-system-persists-to-one-relational-database` | system | Tudo que o sistema guarda (casos, vocabulários, capacidades, investigações) persiste num único store relacional transacional; nada em arquivo. | Um `Pool` (`src/persistence/database-connection.ts`) compartilhado pelos cinco repositórios; `src/__tests__/unit/capability-registry/no-network-persistence.spec.ts` |

## C. Cenários como casos de teste (`knowledge/scenarios/`)

| Cenário | Regra/sujeito | Dado / Quando / Então (resumo) | Teste que o cobre | Localização |
|---|---|---|---|---|
| `investigation/a-collection-timeout-degrades-to-no-data` | `no-stage-aborts-on-its-deadline` | Coleta de `equipment-state` excede o timeout → evidência `timeout`; avaliação `inconclusive` com `no-data` citando essa evidência; investigação responde dentro do prazo | `src/__tests__/unit/investigation/evidence-collection-stage.spec.ts` (resultado `timeout`), `src/__tests__/unit/investigation/judgment-stage.spec.ts` (`no-data`), `src/__tests__/unit/investigation/run-diagnosis.spec.ts` | por palavra-chave |
| `investigation/a-draft-case-version-refuses-diagnosis` | `only-a-released-case-version-is-diagnosed` | Versão em `draft` → pedido de diagnóstico recusado nomeando que não está liberada | **Nenhum teste**; a regra não está implementada (ver A.3) | — |
| `investigation/a-foreign-citation-is-refused` | `a-citation-stays-within-the-hypothesis-collects` | Avaliador cita conceito fora do `collects` → resposta recusada; um retry se o prazo permite, senão `inconclusive` com `judgment-failure` | `src/__tests__/unit/investigation/citation-validation.spec.ts`, `src/__tests__/unit/investigation/judgment-stage.spec.ts`, `src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts` | por palavra-chave (`judgment-failure`) |
| `investigation/a-queued-judgment-is-deadline-exceeded` | `an-inconclusive-evaluation-declares-its-reason` | Pool saturado, hipótese sem slot antes do prazo, evidência `ok` → `inconclusive` com `deadline-exceeded` (nem `no-data`, nem `judgment-failure`) | `src/__tests__/unit/investigation/judgment-stage.spec.ts` (`deadline-exceeded`) | por palavra-chave |
| `investigation/a-slow-capability-yields-to-the-collection-budget` | `collection-has-its-own-budget-within-the-total` | Capacidade com timeout de 10 s, orçamento de coleta 7 s → evidência `timeout` aos 7 s; investigação segue | `src/__tests__/unit/investigation/evidence-collection-stage.spec.ts` | nome do cenário citado |
| `investigation/no-response-without-a-record` | `the-response-follows-the-record` | Assessment pronto, persistência não conclui no prazo → chamador recebe erro, não o assessment | `src/__tests__/unit/investigation/run-diagnosis.spec.ts` (`InvestigationWriteDeadlineExceededError`), `src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts` | por palavra-chave |
| `knowledge/a-case-holding-no-versions-is-told-explicitly` | `contracts/knowledge/case-query` | Caso cuja única versão foi descartada → `list-case-versions` diz explicitamente que não há versão, nunca lista vazia muda | `src/__tests__/unit/http/list-case-versions.routes.spec.ts` ("holds no version": envelope vazio com `total: 0`), `src/__tests__/integration/persistence/relational-case-store.repository.spec.ts` — **cobertura parcial**: o código devolve `200` com `data: []` (slug existente) versus `404 CaseNotFoundError` (slug inexistente); não há mensagem explícita | por palavra-chave |
| `knowledge/a-released-version-keeps-its-original-revision` | `a-case-version-is-written-once` | Versão 1 liberada com revisão 1; versão 2 adota revisão 2 e é liberada → versão 1 ainda referencia revisão 1, conteúdo intacto | `src/__tests__/integration/persistence/relational-case-store.repository.spec.ts`; também `src/__tests__/integration/case/manifest-collects-survive-release.spec.ts`, `src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts` | nome do cenário citado |
| `knowledge/a-subject-mismatch-refuses-the-case` | `a-concept-accepts-the-declared-subject-type` | Caso com sujeito `customer` coleta `equipment-state` que aceita só `contract` → validação recusa nomeando conceito e sujeito | `src/__tests__/unit/case/validate-case-coherence.spec.ts`; `src/__tests__/integration/case/revise-hypothesis.operation.spec.ts` (na revisão) | nome do cenário citado |
| `knowledge/no-confirmation-falls-back` | `domain/knowledge/case-version` | Todas as hipóteses refutadas ou inconclusivas → assessment com `fallback`, sem `determining_hypothesis` | `src/__tests__/unit/case/case-resolution.spec.ts`, `src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts` | nome do cenário citado |
| `knowledge/the-first-confirmed-hypothesis-determines-the-outcome` | `domain/knowledge/case-version` | Manifesto A, B, C, D; A e D confirmadas → assessment de A, com A como determinante; D mantém `confirmed` sem marca | `src/__tests__/unit/case/case-resolution.spec.ts`, `src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts` | nome do cenário citado |

## D. Índice remissivo

Entidades, tipos e termos com o capítulo de `docs/sistema/` onde são definidos e o arquivo de domínio/código que os declara. Os capítulos 1–19 são referenciados pelo índice global; os capítulos 20–23 e os anexos são os deste conjunto.

| Termo | Definido em | Declaração (`knowledge/`, `src/`) |
|---|---|---|
| Action | [02-glossario.md](02-glossario.md) cap. 5 | `knowledge/domain/glossary/action.md`; `src/glossary/terms.ts` |
| API HTTP (rotas, envelope de erro) | [14-api-http.md](14-api-http.md) cap. 20 | `src/http/*` |
| Assessment | [05-investigacao.md](05-investigacao.md) cap. 8 | `knowledge/domain/investigation/assessment.md`; `src/investigation/assessment.ts` |
| AssessmentConsolidator (porta) | [12-portas-adaptadores.md](12-portas-adaptadores.md) cap. 18 | `knowledge/domain/investigation/assessment-consolidator.md`; `src/investigation/assessment-consolidator.port.ts` |
| Capability | [03-integracao.md](03-integracao.md) cap. 6 | `knowledge/domain/integration/capability.md`; `src/capability-registry/capability.ts` |
| CapabilityNature | [03-integracao.md](03-integracao.md) cap. 6 | `knowledge/domain/integration/capability-nature.md`; `CAPABILITY_NATURES` |
| CapabilityRegistry | [03-integracao.md](03-integracao.md) cap. 6 | `knowledge/domain/integration/capability-registry.md`; `src/capability-registry/capability-registry.service.ts` |
| Case | [04-conhecimento.md](04-conhecimento.md) cap. 7 | `knowledge/domain/knowledge/case.md`; `src/case/case.ts` |
| CaseSummary | [04-conhecimento.md](04-conhecimento.md) cap. 7 (não implementado) | `knowledge/domain/knowledge/case-summary.md` |
| CaseVersion / CaseVersionState | [04-conhecimento.md](04-conhecimento.md) cap. 7; ciclo de vida em [14-api-http.md](14-api-http.md) 20.8 | `knowledge/domain/knowledge/case-version.md`, `case-version-state.md`; `CASE_VERSION_STATES` |
| Citation | [05-investigacao.md](05-investigacao.md) cap. 8; validação em [09-julgamento.md](09-julgamento.md) | `knowledge/domain/investigation/citation.md`; `src/investigation/citation.ts` |
| Coleta (estágio) | [08-coleta.md](08-coleta.md) cap. 12 | `src/investigation/evidence-collection-stage.ts` |
| Concept | [02-glossario.md](02-glossario.md) cap. 5 | `knowledge/domain/glossary/concept.md`; `Concept` em `src/glossary/terms.ts` |
| ConnectorConfiguration | [03-integracao.md](03-integracao.md) cap. 6 | `knowledge/domain/integration/connector-configuration.md`; `src/connector-registry/connector-configuration.ts` |
| ConnectorConfigurationRegistry | [03-integracao.md](03-integracao.md) cap. 6 | `knowledge/domain/integration/connector-configuration-registry.md`; `src/connector-registry/connector-configuration-registry.service.ts` |
| ConsolidationRegister (`formal`/`plain`) | [04-conhecimento.md](04-conhecimento.md) cap. 7; [10-resolucao-consolidacao-gravacao.md](10-resolucao-consolidacao-gravacao.md) | `knowledge/domain/knowledge/consolidation-register.md`; `src/investigation/consolidation-register.ts` |
| Cost | [05-investigacao.md](05-investigacao.md) cap. 8 | `knowledge/domain/investigation/cost.md`; `src/investigation/cost.ts` |
| Deadline / orçamentos por estágio | [11-deadlines.md](11-deadlines.md) cap. 17; constantes em [16-configuracao.md](16-configuracao.md) 22.2.2 | `production-diagnose.factory.ts`, `run-diagnosis.ts`, `evidence-collection-stage.ts` |
| Diagramas de classe | [06-diagramas.md](06-diagramas.md) cap. 9 | `knowledge/projections/class-diagram-*.mmd` |
| Diagrama ER | [15-modelo-relacional.md](15-modelo-relacional.md) 21.7 | `src/migrations/*.sql` |
| Durations | [05-investigacao.md](05-investigacao.md) cap. 8 | `knowledge/domain/investigation/durations.md`; `src/investigation/durations.ts` |
| Erros (catálogo) | [17-erros.md](17-erros.md) cap. 23 | `src/errors/*.error.ts`, `src/errors/status-map.ts` |
| Evaluation / Verdict / EvaluationReason | [05-investigacao.md](05-investigacao.md) cap. 8; [09-julgamento.md](09-julgamento.md) cap. 13 | `knowledge/domain/investigation/evaluation.md`, `verdict.md`, `evaluation-reason.md`; `src/investigation/evaluation.ts`, `verdict.ts`, `evaluation-reason.ts` |
| Evidence / EvidenceResult | [05-investigacao.md](05-investigacao.md) cap. 8; [08-coleta.md](08-coleta.md) cap. 12 | `knowledge/domain/investigation/evidence.md`, `evidence-result.md`; `src/investigation/evidence.ts`, `evidence-result.ts` |
| Exemplo ponta a ponta | [13-exemplo.md](13-exemplo.md) cap. 19 | `src/fixtures/*` |
| Fábricas (composição) | [16-configuracao.md](16-configuracao.md) 22.2; [12-portas-adaptadores.md](12-portas-adaptadores.md) cap. 18 | `src/factories/*` |
| Gravação (estágio de persistência) | [10-resolucao-consolidacao-gravacao.md](10-resolucao-consolidacao-gravacao.md) cap. 16 | `src/investigation/run-diagnosis.ts`; `RelationalInvestigationStore` |
| Hypothesis | [04-conhecimento.md](04-conhecimento.md) cap. 7 | `knowledge/domain/knowledge/hypothesis.md`; `HypothesisIdentity` em `src/case/case.ts` |
| HypothesisEvaluator (porta) | [12-portas-adaptadores.md](12-portas-adaptadores.md) cap. 18 | `knowledge/domain/investigation/hypothesis-evaluator.md`; `src/investigation/hypothesis-evaluator.port.ts` |
| HypothesisRevision | [04-conhecimento.md](04-conhecimento.md) cap. 7 | `knowledge/domain/knowledge/hypothesis-revision.md`; `src/case/case.ts` |
| Investigation | [05-investigacao.md](05-investigacao.md) cap. 8 | `knowledge/domain/investigation/investigation.md`; `src/investigation/investigation.ts` |
| Julgamento (estágio) | [09-julgamento.md](09-julgamento.md) cap. 13 | `src/investigation/judgment-stage.ts` |
| Leitura e validação do caso | [07-pipeline.md](07-pipeline.md) cap. 11 | `src/case/case-query.service.ts`, `parse-case-document.ts`, `validate-case-coherence.ts` |
| ManifestEntry | [04-conhecimento.md](04-conhecimento.md) cap. 7 | `knowledge/domain/knowledge/manifest-entry.md`; `src/case/case.ts`; tabela `case_version_hypotheses` |
| Migrações / migration-runner | [15-modelo-relacional.md](15-modelo-relacional.md) 21.4 | `src/persistence/migration-runner.ts`, `src/migrate.ts` |
| Outcome | [02-glossario.md](02-glossario.md) cap. 5 | `knowledge/domain/glossary/outcome.md`; `NON_CONCLUSION_OUTCOMES` |
| ObservationSource (porta) | [12-portas-adaptadores.md](12-portas-adaptadores.md) cap. 18 | `src/investigation/observation-source.port.ts`; `http-declarative-observation-source.adapter.ts` |
| Paginação (`PaginatedResponse`) | [14-api-http.md](14-api-http.md) 20.5 | `src/types/pagination.ts`; `knowledge/constraints/listings-are-paged.md` |
| Pipeline ponta a ponta | [07-pipeline.md](07-pipeline.md) cap. 10 | `src/investigation/run-diagnosis.ts` |
| Rate limit | [14-api-http.md](14-api-http.md) 20.4 | `src/http/read-capability-by-identity-rate-limit.middleware.ts` |
| Recipient | [02-glossario.md](02-glossario.md) cap. 5 | `knowledge/domain/glossary/recipient.md` |
| Referral | [04-conhecimento.md](04-conhecimento.md) cap. 7 | `knowledge/domain/knowledge/referral.md`; `Referral` em `src/case/case.ts` |
| Resolution | [04-conhecimento.md](04-conhecimento.md) cap. 7 | `knowledge/domain/knowledge/resolution.md`; `Resolution` em `src/case/case.ts` |
| Resolução do desfecho | [10-resolucao-consolidacao-gravacao.md](10-resolucao-consolidacao-gravacao.md) cap. 14 | `src/case/case-resolution.ts`, `src/investigation/resolve-and-narrow-input.ts` |
| Restrições arquiteturais | [anexos.md](anexos.md) B | `knowledge/constraints/*.md` |
| Seed / fixtures | [16-configuracao.md](16-configuracao.md) 22.3.4; [15-modelo-relacional.md](15-modelo-relacional.md) 21.9 | `src/seed.ts`, `src/fixtures/*` |
| Subject / SubjectAttributeValue | [05-investigacao.md](05-investigacao.md) cap. 8 | `knowledge/domain/investigation/subject.md`, `subject-attribute-value.md`; `src/investigation/subject.ts`, `subject-attribute-value.ts` |
| SubjectAttribute | [02-glossario.md](02-glossario.md) cap. 5 | `knowledge/domain/glossary/subject-attribute.md` |
| SubjectType | [02-glossario.md](02-glossario.md) cap. 5 | `knowledge/domain/glossary/subject-type.md` |
| Tabelas do banco | [15-modelo-relacional.md](15-modelo-relacional.md) 21.2 | `src/migrations/*.sql` |
| Variáveis de ambiente | [16-configuracao.md](16-configuracao.md) 22.1 | `src/config/env.ts` |
| Visão geral / contextos | [01-visao-geral.md](01-visao-geral.md) caps. 1–4 | `knowledge/projections/context-map.mmd`, `overview.md` |
