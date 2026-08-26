---
contract_version: siegard-reconcile/1
title: status-map.ts re-read after the knowledge-context refusals were stated
summary: 'The human''s premise: a especificação passou a declarar as sete recusas do contexto knowledge e do teste
  de conector que a tabela de status já respondia; o código está como entregue. The file is unchanged since the
  previous two reconciliations; the specification moved.'
target: backend
files:
- path: src/errors/status-map.ts
  change: unchanged since siegard-reconcile/post-analyse-refusals-and-endings-drift.md; the specification gained
    the seven refusals (CaseNotFoundError 404, CaseAlreadyHasDraftError 409, ManifestPositionOccupiedError 409,
    CaseVersionNotDraftError 409, CaseVersionNotDraftAtReleaseError 409, CaseVersionNotReleasableError 422, ManifestWouldHoldNoHypothesisError
    422, CapabilityConnectorMismatchError 409) this table already answered
nodes:
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: '[src/errors/status-map.ts] l.3-8 header: `which status each domain error resolves to is this project''s
    own engineering decision, not a fact the specification holds or should hold, so it is written here rather than
    left for a handler to pick inline.` — the bound node states `an HTTP 422 response reporting a ConnectorConfigurationNotWellFormedError`
    as a decided fact, so the comment names the code as the authority over a value the node decides. The node''s
    own fact is honoured at l.102 `[ConnectorConfigurationNotWellFormedError, 422],`.'
  observed_at:
  - src/errors/status-map.ts
notes: 'Judgment shape: one specification-conformance-reviewer delegation over the one file, handed its one bound
  node and, as candidates, the seven nodes the 2026-08-25 analyse amended plus the new rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  and the other refusal-bearing nodes of the integration and glossary contexts. The judge reports the other eighteen
  entries of STATUS_BY_ERROR_CLASS each match the status a candidate node states — so the seven no-node findings
  the previous record carried against this file are closed by the specification, and what remains is the header
  comment alone. Also observed, outside the node set: the table omits IncompleteConnectorConfigurationError (node
  states 422), DuplicateConceptAnswerError and DuplicateGlossaryNameError (nodes state 500), which answer through
  the handler''s unmapped default of 500 — the first is a behavioral departure already recorded in the previous
  reconciliation; the other two coincide with the nodes by default. Nothing binds from this record; the one node
  stays as it stood.'
---
