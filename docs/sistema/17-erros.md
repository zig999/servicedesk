# 23. Catálogo de erros

Este capítulo lista **todas** as 49 classes de erro de `src/errors/*.error.ts`, agrupadas por contexto de domínio. Para cada uma: a classe, a causa que a dispara, o status HTTP que `src/errors/status-map.ts` lhe atribui (ou `500` quando não mapeada — ver [API HTTP, 20.3](14-api-http.md)), o campo `context` que viaja como `details` no envelope de erro, e o(s) arquivo(s) de `src/` onde `new <Classe>(` aparece fora de testes.

## 23.1 Forma comum

Toda classe segue o mesmo molde: estende `Error`, fixa `this.name` com o nome da classe (é esse nome que vira `error.code` no envelope HTTP), constrói uma `message` em inglês que já cita a regra violada, e expõe `public readonly context` — um objeto `Readonly<...>` com os dados que identificam a ocorrência. Os cinco `*StoreError` e `MigrationStepError` aceitam ainda `options?: ErrorOptions` para carregar a `cause` original do driver.

Como o tratador único (`src/http/error-handler.middleware.ts`) decide o status:

| Situação | Status | Código no envelope |
|---|---|---|
| Classe listada em `STATUS_BY_ERROR_CLASS` (`src/errors/status-map.ts`) | 404 / 409 / 422 conforme a tabela | `error.name` |
| Classe não listada | 500 | `INTERNAL_ERROR` (mensagem fixa; `context` **não** é exposto) |

A coluna "HTTP" abaixo diz `500 (não mapeado)` para as classes fora da tabela. Quando a especificação pede um status diferente do que o código produz, isso está anotado.

## 23.2 Contexto Conhecimento (caso, versão, hipótese, manifesto)

| Classe | Arquivo | Causa | HTTP | `context` | Onde é lançado |
|---|---|---|---|---|---|
| `CaseNotFoundError` | `case-not-found.error.ts` | Slug/versão sem linha em `case_versions`; ou slug/hipótese desconhecidos numa listagem (`version: 0`) | **404** | `{ slug, version }` | `src/case/case-query.service.ts`, `src/case/release.operation.ts`, `src/case/discard.operation.ts`, `src/case/manifest-composition.operations.ts`, `src/persistence/relational-case-store.repository.ts` (`requireCaseIdentity`, `requireHypothesisIdentity`, `updateDraftVersion`) — `knowledge/rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused.md` |
| `CaseNotValidError` | `case-not-valid.error.ts` | A versão existe mas falha o parser estrutural ou a coerência no momento da leitura | 500 (não mapeado) | `{ slug, version, violations[] }` | `src/case/case-query.service.ts` (`structuralCase`, `refuseIncoherence`) — `knowledge/rules/knowledge/validation-runs-at-every-read.md` |
| `InvalidCaseDocumentError` | `invalid-case-document.error.ts` | Documento de caso viola as regras estruturais (campos, tipos, manifesto vazio, posições) | 500 (não mapeado; em geral convertido em `CaseNotValidError`/`CaseVersionNotReleasableError` antes de escapar) | `{ file, problems[] }` | `src/case/parse-case-document.ts` |
| `IncoherentCaseError` | `incoherent-case.error.ts` | Caso viola regras de coerência (termos fora do glossário, conceito que não aceita o sujeito, conceito sem capacidade) | 500 (não mapeado) | `{ slug, violations[] }` | `src/case/validate-case-coherence.ts` (função lançadora; os chamadores HTTP usam `caseCoherenceViolations`, que devolve a lista em vez de lançar) |
| `CaseAlreadyHasDraftError` | `case-already-has-draft.error.ts` | `create-draft` para um caso que já tem versão `draft` (índice `case_versions_one_draft_per_case`) | **409** | `{ slug }` | `src/persistence/relational-case-store.repository.ts` (`raiseCreateDraftFailure`) — `knowledge/rules/knowledge/a-case-has-at-most-one-draft.md` |
| `CaseHoldsNoDraftError` | `case-holds-no-draft.error.ts` | `revise-hypothesis` para um caso sem rascunho aberto | 500 (não mapeado) | `{ slug }` | `src/case/revise-hypothesis.operation.ts` — `knowledge/rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft.md` |
| `CaseVersionNotDraftError` | `case-version-not-draft.error.ts` | `update-draft`, `discard`, `place-hypothesis` ou `remove-hypothesis` sobre versão que não é `draft` | **409** | `{ slug, version, state }` | `src/case/discard.operation.ts`, `src/case/manifest-composition.operations.ts`, `src/persistence/relational-case-store.repository.ts` (`updateDraftVersion`) — `knowledge/rules/knowledge/a-case-version-moves-through-its-declared-lifecycle.md` |
| `CaseVersionNotDraftAtReleaseError` | `case-version-not-draft-at-release.error.ts` | `release` sobre versão que não é `draft` | **409** | `{ slug, version, state }` | `src/case/release.operation.ts` — mesma regra |
| `CaseVersionNotReleasableError` | `case-version-not-releasable.error.ts` | `release` encontrou violações estruturais ou de coerência | **422** | `{ slug, version, violations[] }` | `src/case/release.operation.ts` — `knowledge/rules/knowledge/a-release-refusal-with-no-named-violation-says-so.md` |
| `CaseVersionAlreadyStoredError` | `case-version-already-stored.error.ts` | Gravar uma versão `(slug, version)` já existente | 500 (não mapeado) | `{ slug, version }` | **Nenhum lançamento fora de testes** — classe remanescente do modelo anterior à migração `0009`; hoje o número vem de `cases.next_version` e a colisão não ocorre |
| `ManifestPositionOccupiedError` | `manifest-position-occupied.error.ts` | `place-hypothesis` numa posição ocupada por outra hipótese (checagem em código e `UNIQUE case_version_hypotheses_position_unique`) | **409** | `{ slug, version, position }` | `src/case/manifest-composition.operations.ts`, `src/persistence/relational-case-store.repository.ts` (`raisePlaceHypothesisFailure`) — `knowledge/rules/knowledge/a-hypothesis-position-is-unique-within-its-case.md` |
| `ManifestWouldHoldNoHypothesisError` | `manifest-would-hold-no-hypothesis.error.ts` | `remove-hypothesis` deixaria o manifesto vazio | **422** | `{ slug, version }` | `src/case/manifest-composition.operations.ts` — `knowledge/rules/knowledge/a-case-has-at-least-one-hypothesis.md` |
| `HypothesisRevisionCollectsNoConceptError` | `hypothesis-revision-collects-no-concept.error.ts` | `revise-hypothesis` com `collects` vazio | 500 (não mapeado) | `{ slug, hypothesis_name }` | `src/case/revise-hypothesis.operation.ts` — `knowledge/rules/knowledge/a-hypothesis-collects-at-least-one-concept.md` |
| `ConceptNotInGlossaryError` | `concept-not-in-glossary.error.ts` | `revise-hypothesis` cita conceito que o glossário não tem | 500 (não mapeado) | `{ slug, hypothesis_name, concepts[] }` | `src/case/revise-hypothesis.operation.ts` — `knowledge/rules/knowledge/case-terms-exist-in-the-glossary.md` |
| `ConceptRefusesSubjectTypeError` | `concept-refuses-subject-type.error.ts` | `revise-hypothesis` cita conceito que não aceita o `subject` do rascunho | 500 (não mapeado) | `{ slug, hypothesis_name, subject, concepts[] }` | `src/case/revise-hypothesis.operation.ts` — `knowledge/rules/knowledge/a-concept-accepts-the-declared-subject-type.md` |
| `CaseStoreError` | `case-store.error.ts` | Qualquer falha do driver em `RelationalCaseStore` não traduzida em erro de domínio (FK violada, `authored_at` inválido, enum desconhecido na leitura) | 500 (não mapeado) | `{ operation: 'read' \| 'write' }` + `cause` | `src/persistence/relational-case-store.repository.ts` (`raiseReadFailure`, `raiseWriteFailure`) |

## 23.3 Contexto Glossário

| Classe | Arquivo | Causa | HTTP | `context` | Onde é lançado |
|---|---|---|---|---|---|
| `VocabularyTermNotHeldError` | `vocabulary-term-not-held.error.ts` | `GET /v1/glossary/:vocabulary/:name` para nome ausente | **404** | `{ vocabulary, name }` | `src/http/read-vocabulary-term.controller.ts` — `knowledge/rules/glossary/a-glossary-read-by-an-unheld-name-is-refused.md` |
| `ConceptNotHeldError` | `concept-not-held.error.ts` | `GET /v1/glossary/concepts/:name` para conceito ausente | **404** | `{ name }` | `src/http/read-concept.controller.ts` — mesma regra |
| `DuplicateGlossaryNameError` | `duplicate-glossary-name.error.ts` | Leitura de um vocabulário ou dos conceitos encontra o mesmo nome duas vezes | 500 (não mapeado — a regra pede exatamente 500) | `{ vocabulary, name }` | `src/glossary/glossary.service.ts` (`assertUniqueNames`) — `knowledge/rules/glossary/a-vocabulary-holds-each-name-once.md` |
| `GlossaryStoreError` | `glossary-store.error.ts` | Falha do driver em `RelationalGlossaryStore` (por exemplo, `writeConcepts` apagando conceito ainda referenciado) | 500 (não mapeado) | `{ operation }` + `cause` | `src/persistence/relational-glossary-store.repository.ts` |

## 23.4 Contexto Integração (capacidades e conectores)

| Classe | Arquivo | Causa | HTTP | `context` | Onde é lançado |
|---|---|---|---|---|---|
| `IncompleteCapabilityContractError` | `incomplete-capability-contract.error.ts` | Registro sem `name`, `version`, `nature`, `input_schema`, `output_schema`, `connector` ou `concept` (ausente ou vazio), ou `timeout` não inteiro | **422** | `{ problems[] }` | `src/capability-registry/capability-registry.service.ts` — `knowledge/rules/integration/a-capability-declares-its-contract.md` |
| `CapabilitySchemaNotWellFormedError` | `capability-schema-not-well-formed.error.ts` | `input_schema` ou `output_schema` não é JSON válido | **422** | `{ attributes[] }` | idem — `knowledge/rules/integration/a-capability-declares-well-formed-schemas.md` |
| `CapabilityNotReadOnlyError` | `capability-not-read-only.error.ts` | `nature` diferente de `read-only` | **422** | `{ nature }` | idem — `knowledge/rules/integration/a-capability-is-read-only.md` |
| `ConceptAlreadyAnsweredError` | `concept-already-answered.error.ts` | Registrar capacidade para conceito já respondido por outra identidade | **409** | `{ concept, answeredBy: {name, version}, registering: {name, version} }` | idem — `knowledge/rules/integration/one-capability-answers-one-concept.md` |
| `DuplicateConceptAnswerError` | `duplicate-concept-answer.error.ts` | Leitura por conceito encontra mais de uma capacidade respondendo | 500 (não mapeado — a regra pede 500) | `{ concept, answers[] }` | idem (`readCapability`) — mesma regra; também vira `result_detail` de evidência `unavailable` no adaptador HTTP |
| `ConceptNotAnsweredError` | `concept-not-answered.error.ts` | `GET /v1/capabilities/:concept` sem capacidade para o conceito | **404** | `{ concept }` | `src/http/read-capability.controller.ts` — `knowledge/constraints/the-concept-read-refuses-an-unanswered-concept.md` |
| `CapabilityIdentityNotFoundError` | `capability-identity-not-found.error.ts` | `GET /v1/capabilities/:name/:version` sem capacidade nessa identidade | **404** | `{ name, version }` | `src/capability-registry/capability-registry.service.ts` (`readCapabilityByIdentityOrThrow`) — `knowledge/constraints/the-capability-identity-read-refuses-an-unregistered-identity.md` |
| `CapabilityNotRegisteredForTestError` | `capability-not-registered-for-test.error.ts` | `POST /v1/test-connector` nomeia identidade não registrada | **404** | `{ name, version }` | `src/http/test-connector.controller.ts` — `knowledge/rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.md` |
| `CapabilityConnectorMismatchError` | `capability-connector-mismatch.error.ts` | `POST /v1/test-connector` nomeia conector diferente do da capacidade | **409** | `{ capabilityConnector, requestedConnector }` | `src/http/test-connector.controller.ts` — mesma regra |
| `CapabilityNotResolvedForObservationError` | `capability-not-resolved-for-observation.error.ts` | Coleta de um conceito sem capacidade registrada | Não chega ao HTTP: vira evidência `unavailable` com `result_detail` | `{ concept }` | `src/investigation/http-declarative-observation-source.adapter.ts` — `knowledge/rules/integration/an-unresolvable-observation-ends-unavailable.md` |
| `CapabilityStoreError` | `capability-store.error.ts` | Falha do driver em `RelationalCapabilityStore` (inclui FK `capabilities.concept` violada e `nature` desconhecida na leitura) | 500 (não mapeado) | `{ operation }` + `cause` | `src/persistence/relational-capability-store.repository.ts` |
| `IncompleteConnectorConfigurationError` | `incomplete-connector-configuration.error.ts` | Registro de conector sem `connector` ou cuja `configuration` não é objeto plano | 500 (não mapeado — `knowledge/rules/integration/a-connector-configuration-names-its-connector.md` pede 422; o DTO recusa `connector` vazio antes, com 400) | `{ problems[] }` | `src/connector-registry/connector-configuration-registry.service.ts` |
| `ConnectorConfigurationNotWellFormedError` | `connector-configuration-not-well-formed.error.ts` | `configuration` textual não é JSON, ou não é objeto | **422** | `{ reason }` | idem — `knowledge/rules/integration/a-connector-configuration-holds-a-well-formed-object.md` |
| `ConnectorConfigurationNotFoundError` | `connector-configuration-not-found.error.ts` | `GET /v1/connectors/:connector` ou `POST /v1/test-connector` para conector sem configuração | **404** | `{ connector }` | `src/connector-registry/connector-configuration-registry.service.ts` (`readConnectorConfigurationOrThrow`), `src/http/test-connector.controller.ts` — `knowledge/rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused.md` |
| `ConnectorConfigurationNotRegisteredError` | `connector-configuration-not-registered.error.ts` | Coleta encontra capacidade cujo conector não tem configuração | Não chega ao HTTP: evidência `unavailable` com `result_detail` | `{ connector }` | `src/investigation/http-declarative-observation-source.adapter.ts` — `knowledge/rules/integration/an-unresolvable-observation-ends-unavailable.md` |
| `MalformedHttpConnectorConfigurationError` | `malformed-http-connector-configuration.error.ts` | Configuração sem `method` válido, `responseMap` ou `statusMap` bem formados | Na coleta: evidência `unavailable`; em `POST /v1/test-connector`: 500 (não mapeado) | `{ connector, problems[] }` | `src/investigation/http-declarative-observation-source.adapter.ts` (`asHttpConnectorCallConfiguration`) — `knowledge/rules/integration/an-http-connector-configuration-declares-its-call.md` |
| `IncompleteConnectorCallDescriptorError` | `incomplete-connector-call-descriptor.error.ts` | Descritor de chamada com `address` vazio, ou `query`/`headers` declarados sem serem objetos planos de strings, ao resolver a requisição | Na coleta: evidência `unavailable`; em `test-connector`: 500 | `{ problems[] }` | `src/http-connector/connector-request-resolver.ts` |
| `ConnectorPlaceholderNotResolvedError` | `connector-placeholder-not-resolved.error.ts` | Placeholder `${subject:<atributo>}` sem atributo no sujeito, ou `${credential:<VAR>}` sem variável de ambiente | Na coleta: evidência `unavailable`; em `test-connector`: 500 | `{ kind: 'subject-attribute' \| 'credential', name }` | `src/http-connector/connector-request-resolver.ts` — `knowledge/rules/investigation/collection-runs-in-the-requester-scope.md` |
| `ConnectorConfigurationStoreError` | `connector-configuration-store.error.ts` | Falha do driver em `RelationalConnectorConfigurationStore` | 500 (não mapeado) | `{ operation }` + `cause` | `src/persistence/relational-connector-configuration-store.repository.ts` |

## 23.5 Contexto Investigação

| Classe | Arquivo | Causa | HTTP | `context` | Onde é lançado |
|---|---|---|---|---|---|
| `SubjectCarriesNoAttributeError` | `subject-carries-no-attribute.error.ts` | `buildSubject` com lista de atributos vazia | 500 (não mapeado; o DTO de `diagnose`/`test-connector` já recusa com 400 antes) | `{ type }` | `src/investigation/subject.ts` — `knowledge/rules/investigation/a-subject-carries-at-least-one-attribute.md` |
| `SubjectAttributeNotInGlossaryError` | `subject-attribute-not-in-glossary.error.ts` | Atributo do sujeito não existe em `subject_attributes` | 500 (não mapeado) | `{ type, attributes[] }` | `src/investigation/investigation-factory.ts` — `knowledge/rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.md` |
| `InvestigationNotBuildableError` | `investigation-not-buildable.error.ts` | A fábrica de investigação encontra evidências ou avaliações que não cobrem o plano do caso (uma por conceito, uma por hipótese) | 500 (não mapeado) | `{ slug, violations[] }` | `src/investigation/investigation-factory.ts` — `knowledge/rules/investigation/one-evidence-per-collected-concept.md`, `one-evaluation-per-required-hypothesis.md` |
| `WrittenAtRequiredError` | `written-at-required.error.ts` | Construir uma investigação sem `written_at` | 500 (não mapeado) | `{ given }` | `src/investigation/investigation-factory.ts` |
| `RequesterRequiredError` | `requester-required.error.ts` | Diagnóstico sem `requester` | 500 (não mapeado) | `{ given }` | **Nenhum lançamento fora de testes** — o DTO (`requester: z.string().min(1)`) recusa antes com 400 |
| `InvestigationWriteDeadlineExceededError` | `investigation-write-deadline-exceeded.error.ts` | A gravação da investigação não conclui dentro do que resta do prazo | 500 (não mapeado) — a resposta ao chamador é um erro, nunca o assessment | `{ id, remainingMs }` | `src/investigation/run-diagnosis.ts` — `knowledge/rules/investigation/the-response-follows-the-record.md`, `no-stage-aborts-on-its-deadline.md` |
| `InvestigationAlreadyStoredError` | `investigation-already-stored.error.ts` | `INSERT investigations` viola a PK | 500 (não mapeado) | `{ id }` | `src/persistence/relational-investigation-store.repository.ts` (`raiseRootInsertFailure`) — `knowledge/rules/investigation/an-investigation-is-written-once.md` |
| `InvestigationStoreError` | `investigation-store.error.ts` | Falha do driver em `RelationalInvestigationStore`, ou linha inconsistente na leitura (enum desconhecido, `inconclusive` sem `reason`, verdito decidido sem citação) | 500 (não mapeado) | `{ operation }` + `cause` | `src/persistence/relational-investigation-store.repository.ts` |

Os erros que o avaliador e o consolidador podem produzir (resposta malformada, citação estranha ao `collects`, campo inexistente no schema) **não** são classes de `src/errors`: são degradados em avaliações `inconclusive` com `reason: 'judgment-failure'` ou `'deadline-exceeded'` pelo estágio de julgamento (`src/investigation/judgment-stage.ts`, `src/investigation/citation-validation.ts`) — ver [Julgamento](09-julgamento.md).

## 23.6 Infraestrutura e processo

| Classe | Arquivo | Causa | HTTP | `context` | Onde é lançado |
|---|---|---|---|---|---|
| `InvalidEnvironmentError` | `invalid-environment.error.ts` | `loadEnv` encontra variável ausente ou malformada | Não há HTTP: o processo não sobe | `{ issues[] }` | `src/config/env.ts` — ver [Configuração](16-configuracao.md) |
| `MigrationStepError` | `migration-step.error.ts` | Um script de migração falha ao ser aplicado; ou `DATABASE_URL` ausente na suíte de testes | Não há HTTP | `{ filename }` ou `{ variable }` + `cause` | `src/persistence/migration-runner.ts`, `src/vitest-global-setup.ts` |

## 23.7 Resumo por status HTTP

| Status | Classes |
|---|---|
| 404 | `CaseNotFoundError`, `ConceptNotAnsweredError`, `ConceptNotHeldError`, `VocabularyTermNotHeldError`, `ConnectorConfigurationNotFoundError`, `CapabilityNotRegisteredForTestError`, `CapabilityIdentityNotFoundError` |
| 409 | `CaseAlreadyHasDraftError`, `ManifestPositionOccupiedError`, `CaseVersionNotDraftError`, `CaseVersionNotDraftAtReleaseError`, `ConceptAlreadyAnsweredError`, `CapabilityConnectorMismatchError` |
| 422 | `CaseVersionNotReleasableError`, `ManifestWouldHoldNoHypothesisError`, `IncompleteCapabilityContractError`, `CapabilityNotReadOnlyError`, `CapabilitySchemaNotWellFormedError`, `ConnectorConfigurationNotWellFormedError` |
| 500 por decisão da especificação | `DuplicateGlossaryNameError`, `DuplicateConceptAnswerError` |
| 500 por ausência no status-map (contexto oculto do cliente) | `CaseNotValidError`, `InvalidCaseDocumentError`, `IncoherentCaseError`, `CaseHoldsNoDraftError`, `HypothesisRevisionCollectsNoConceptError`, `ConceptNotInGlossaryError`, `ConceptRefusesSubjectTypeError`, `IncompleteConnectorConfigurationError`, `MalformedHttpConnectorConfigurationError`, `IncompleteConnectorCallDescriptorError`, `ConnectorPlaceholderNotResolvedError`, `SubjectCarriesNoAttributeError`, `SubjectAttributeNotInGlossaryError`, `InvestigationNotBuildableError`, `WrittenAtRequiredError`, `InvestigationWriteDeadlineExceededError`, `InvestigationAlreadyStoredError`, os cinco `*StoreError` |
| Nunca chegam ao HTTP | `CapabilityNotResolvedForObservationError`, `ConnectorConfigurationNotRegisteredError` (viram `result_detail`), `InvalidEnvironmentError`, `MigrationStepError` |
| Definidos mas não lançados | `CaseVersionAlreadyStoredError`, `RequesterRequiredError` |

Além dessas classes, a superfície HTTP produz dois códigos que não são classes de erro: `VALIDATION_ERROR` (400, forma inválida — `knowledge/constraints/a-malformed-request-is-refused-with-a-validation-error.md`) e `RATE_LIMIT_EXCEEDED` (429 — `knowledge/constraints/the-capability-identity-read-is-rate-limited.md`), ambos descritos em [API HTTP](14-api-http.md).
