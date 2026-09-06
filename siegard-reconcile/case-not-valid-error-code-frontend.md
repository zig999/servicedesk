---
contract_version: siegard-reconcile/3
title: Review rebind over the case-not-valid-error-code-frontend delivery's own files
summary: 'The one task of the case-not-valid-error-code-frontend initiative, task/case-not-valid-error-code/error-code-mapping-keys-on-the-current-name,
  wrote these files: its implementation record names src/services/error-ui-state.ts, and its proof names
  the three spec files beside it.'
target: frontend
files:
- path: src/hooks/use-case-current-version-validity.spec.ts
  change: written by the delivery of task/case-not-valid-error-code/error-code-mapping-keys-on-the-current-name
- path: src/routes/case-detail-screen-current-version-validity.spec.ts
  change: written by the delivery of task/case-not-valid-error-code/error-code-mapping-keys-on-the-current-name
- path: src/services/error-ui-state.spec.ts
  change: written by the delivery of task/case-not-valid-error-code/error-code-mapping-keys-on-the-current-name
- path: src/services/error-ui-state.ts
  change: The one entry in UI_STATE_BY_ERROR_CODE previously keyed CaseNotValidError is now keyed CaseVersionNotValidError,
    the name the backend's error-handler serializes as the wire error code; uiStateForApiError now resolves
    that code to the case-not-valid state instead of falling through to the generic one.
nodes:
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConceptDescriptionRequiredError
    — ConceptDescriptionRequiredError: { kind: "concept-description-required" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for CapabilitySchemaNotWellFormedError
    — CapabilitySchemaNotWellFormedError: { kind: "capability-schema-not-well-formed" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for CapabilityNotReadOnlyError
    — CapabilityNotReadOnlyError: { kind: "capability-not-read-only" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConnectorConfigurationNotWellFormedError
    — ConnectorConfigurationNotWellFormedError: { kind: "connector-configuration-not-well-formed" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConceptAlreadyAnsweredError
    — ConceptAlreadyAnsweredError: { kind: "concept-already-answered" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: false
  how: "src/hooks/use-case-current-version-validity.spec.ts, the errorResponse helper's default status,\
    \ used unmodified at the versionPath(4) and versionPath(5) stubs, lines 18-20 and 52 and 74: function\
    \ errorResponse(code: string, status = 422): Response {\n  return new Response(JSON.stringify({ error:\
    \ { code, message: code } }), { status });\n}\n...\n[versionPath(4)]: () => errorResponse(\"CaseVersionNotValidError\"\
    ),\n...\n[versionPath(5)]: () => errorResponse(\"CaseVersionNotValidError\"), — The fixture models\
    \ a CaseVersionNotValidError refusal as arriving at HTTP 422 in both the criterion-1 and criterion-2\
    \ tests, while the node reserves 422 for a different class of refusal entirely — a well-formed write\
    \ violating an invariant — and fixes this one at 409. A reader taking this spec file as the shape\
    \ of the wire contract, the only place in this file that models the refusal at all, learns the wrong\
    \ status, and nothing else in the file corrects it.\nsrc/routes/case-detail-screen-current-version-validity.spec.ts,\
    \ the errorResponse helper's default status, line 15, applied at lines 28, 47 and 63, and stated explicitly\
    \ again at line 151: function errorResponse(code: string, status = 422, details?: unknown): Response\
    \ { ... [versionDetailPath(2)]: () => errorResponse(\"CaseVersionNotValidError\"), — the fixture is\
    \ the one place in this file that fixes what status code a CaseVersionNotValidError refusal carries\
    \ at read, and it fixes it at 422 — a reader consulting this test to learn the wire contract for this\
    \ refusal, rather than the node, takes away the wrong status, even though the mapping under test,\
    \ uiStateForApiError, never branches on it"
  observed_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for HypothesisRevisionNotDraftAtReleaseError
    — HypothesisRevisionNotDraftAtReleaseError: { kind: "hypothesis-revision-not-draft-at-release" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  conforms: true
  how: "src/services/error-ui-state.ts: held at the fallback branch of uiStateForApiError — const state\
    \ = UI_STATE_BY_ERROR_CODE[error.code];\n  return state ?? GENERIC_ERROR_STATE;"
  encoded_at:
  - src/services/error-ui-state.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConceptDescriptionRequiredError
    — ConceptDescriptionRequiredError: { kind: "concept-description-required" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for HypothesisRevisionNotDraftAtReleaseError
    — HypothesisRevisionNotDraftAtReleaseError: { kind: "hypothesis-revision-not-draft-at-release" },'
  encoded_at:
  - src/services/error-ui-state.ts
unbound:
- src/hooks/use-case-current-version-validity.spec.ts
- src/routes/case-detail-screen-current-version-validity.spec.ts
- src/services/error-ui-state.spec.ts
notes: 'Judged by 4 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-not-valid-error-code-frontend.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case,
  rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 0 opened across 0 of 4 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-not-valid-error-code-frontend.returns/`, which are the evidence behind every entry above.
