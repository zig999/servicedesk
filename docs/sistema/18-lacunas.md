# Lacunas conhecidas entre especificação e código

Durante a escrita desta documentação, cada capítulo foi verificado contra o código em `src/` e a
especificação em `knowledge/`. Este capítulo consolida, num só lugar, as divergências encontradas.
Cada item já está registrado no capítulo correspondente como "não implementado" ou "descrito
conforme o código"; aqui elas aparecem agrupadas para servir de backlog de conformidade.

> Nada abaixo é conjectura: cada linha aponta o nó da especificação e o ponto do código onde a
> divergência é observável.

## 1. Regras de negócio não implementadas

| Nó da especificação | O que falta | Onde se observa | Cap. |
|---|---|---|---|
| `rules/investigation/only-a-released-case-version-is-diagnosed` | Nenhuma checagem de `state` no caminho do diagnóstico; um `draft` coerente é diagnosticado | `src/http/diagnose.controller.ts` → `case-query.service.ts` → `run-diagnosis.ts` | 11 |
| `constraints/the-evidence-cache-admits-only-ok-results` | Não existe adaptador de cache; única menção é comentário em `evidence-result.ts` | `src/investigation/evidence-collection-stage.ts` | 12 |
| `domain/investigation/evidence` (`ttl`) | `ttl` gravado sempre como `DEFAULT_EVIDENCE_TTL_SECONDS = 60`, ignorando o `ttl` do conceito | `src/investigation/evidence-collection-stage.ts` | 12 |
| `domain/investigation/cost`, `durations` | Nunca medidos; controller grava zeros (`UNMEASURED_COST`, `UNMEASURED_DURATIONS`) | `src/http/diagnose.controller.ts` | 8, 17 |
| Fatia de prazo da consolidação (4 s) | `draftAssessment` é chamado sem `deadline`; único ponto que pode levar o total além de 20 s | `src/investigation/run-diagnosis.ts` | 15, 17 |
| `rules/investigation/no-stage-aborts-on-its-deadline` ("retries within what remains") | `writeWithinDeadline` tenta uma vez | `src/investigation/run-diagnosis.ts` | 16 |
| `rules/knowledge/a-case-summary-is-derived-from-its-existing-versions` | `CaseSummary` não existe; `GET /v1/cases` devolve só `{ slug }` | `src/http/list-cases.controller.ts` | 7 |
| `rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft` | `subject` vem do corpo da requisição, não do rascunho | `src/case/revise-hypothesis.operation.ts`, `src/http/dto` | 7 |
| `rules/knowledge/a-release-refusal-with-no-named-violation-says-so` | Sem texto explícito para lista de violações vazia | `src/case/release.operation.ts` | 7 |
| `rules/integration/an-unresolvable-observation-ends-unavailable` | Só "conceito sem capability" vira `unavailable`; erros do adaptador HTTP (config malformada, placeholder não resolvido) não são convertidos | `src/investigation/evidence-collection-stage.ts` | 12 |
| `contracts/investigation/investigation-completed`, `assessment-reviewed` | Contratos declarados sem publicador | — | 4 |
| `contracts/integration/glossary-vocabulary` | Integração não consome `IGlossaryQuery`; dependência existe só como FK `capabilities.concept` | `src/capability-registry/` | 5, 6 |

## 2. Comportamentos que degradam de forma diferente da especificada

| Situação | Especificação | Código | Cap. |
|---|---|---|---|
| Falha do provedor na consolidação | (sem cenário) | `AnthropicAssessmentConsolidator` não tem `try/catch`; vira 500 sem gravação | 15 |
| Gravação não concluiu no prazo | "erro ao requisitante" | `InvestigationWriteDeadlineExceededError` cai no `500 INTERNAL_ERROR` genérico | 16, 23 |
| Repartição do prazo | Instante absoluto compartilhado | `runDiagnosis` repassa o mesmo `now` inicial e cada temporizador começa no início da etapa; os tetos nominais (7/5/2 s) se somam | 17 |
| Capability reregistrada entre coleta e julgamento | — | `outputSchemasFor` chaveia pela capability atual; chave não bate com a Evidence e toda citação do conceito é recusada | 13.5 |
| Fallback | Distinguir `inconclusive-no-data` de `inconclusive-hypotheses-exhausted` | Devolve o `fallback.outcome` escrito pelo curador; nada escolhe entre os dois | 14 |
| Evidência `unavailable` sem capability | — | Grava `capability_name/version = ''` contra FK para `capabilities`; a gravação falharia com `InvestigationStoreError` | 8, 21 |
| `SubjectAttributeNotInGlossaryError` | — | Só dispara em `buildInvestigation`, depois de coleta e julgamento já pagos | 11 |
| `ticket_ref` | — | Gravado `NULL`, lido de volta como `''` | 16 |

## 3. Erros tipados sem status HTTP mapeado (respondem 500)

Todos ausentes de `src/errors/status-map.ts`; ver capítulo 23 para a tabela completa.

- Investigação: `InvestigationWriteDeadlineExceededError`, `InvestigationAlreadyStoredError`, `InvestigationNotBuildableError`, `InvestigationStoreError`, `SubjectAttributeNotInGlossaryError`, `SubjectCarriesNoAttributeError`.
- Conhecimento: `CaseNotValidError`, `CaseHoldsNoDraftError`, `HypothesisRevisionCollectsNoConceptError`, `ConceptNotInGlossaryError`, `ConceptRefusesSubjectTypeError`.
- Integração: `IncompleteConnectorConfigurationError` (regra pede 422), `MalformedHttpConnectorConfigurationError`, `IncompleteConnectorCallDescriptorError`, `ConnectorPlaceholderNotResolvedError`, `ConnectorConfigurationNotRegisteredError`, `CapabilityNotResolvedForObservationError`.
- Glossário: `DuplicateGlossaryNameError`, `GlossaryStoreError`.

## 4. Código morto ou desalinhado

| Item | Observação |
|---|---|
| `RequesterRequiredError`, `CaseVersionAlreadyStoredError` | Definidos, nunca lançados fora de testes |
| `IncoherentCaseError` / `validateCaseCoherence` | Existem, mas não são usados pelas rotas/operações atuais |
| `VOCABULARY_ROLES['subject-attribute']` em `validate-case-coherence.ts` | Nunca gera violação — um caso não declara atributos |
| Comentário em `citation-validation.ts` | Referencia `src/investigation/idempotency-key.ts`, inexistente |
| Comentário em `glossary-store.error.ts` | Descreve um "file store" substituído pelo adaptador relacional |
| `parse-case-document.ts` | Não pareia presença de `released_at` com `state = 'released'` |
| `prompt_version` | Só metadado; nada verifica correspondência com o `SYSTEM_PROMPT` real |
| Projeções em `knowledge/projections/*.mmd` | Desatualizadas em relação ao código (nomes camelCase vs. snake_case, `Case.nextVersion`, `CaseSummary`, `resolveConcept()` vs. `readCapability()`); divergências anotadas no cap. 9 |

## 5. Regras de governança sem verificação possível em código

`a-recipient-is-a-role`, `an-action-names-what-its-recipient-does`, `one-falsifiable-claim-per-criterion`,
`an-outcome-is-contributed-by-a-confirmable-hypothesis` (decidido no `decision-log.md` como ato de
curadoria), `the-customer-sees-only-the-text` (a API devolve `outcome`/`referral` ao chamador).

## 6. Operações sem rota

- Não há rota de escrita para os cinco vocabulários de termos (só `PUT /v1/glossary/concepts/{name}`); termos entram pelo `seed`.
- Não há seed de `connector_configurations`.
- Nos casos de `docs/cases`, o `1.json` está em `draft` e precisa ser liberado antes de qualquer diagnóstico.
