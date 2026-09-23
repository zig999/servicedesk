---
contract_version: siegard-reconcile/5
title: Reconcile status-map.ts against the error-class-to-HTTP-status nodes it binds
summary: This file is asserted correct as it stands on disk; the trace's bindings for it are stale because
  the file changed without a rebind. This reconciliation reads it fresh against every node the trace currently
  binds to it, over one file.
target: backend
files:
- path: src/errors/status-map.ts
  change: The file as committed maps each domain error class to its HTTP status — no further description
    beyond what the judge's own reading reports.
nodes:
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states the connector-configuration-registry''s
    operations (read-connector-configuration, list-connector-configurations, register-connector, remove-connector);
    status-map.ts holds no operation, only a class-to-status lookup for the errors those operations may
    raise — [ConnectorConfigurationNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states the diagnose operation''s own shape;
    status-map.ts holds no operation, only the status for errors diagnose may raise — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states the case-lifecycle operations (create-draft,
    revise-hypothesis, release-hypothesis, place-hypothesis, remove-hypothesis, update-draft, release,
    discard); status-map.ts holds no operation, only the status for errors those operations may raise
    — [CaseVersionNotValidError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 84 — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries at lines 50-51 — [ConceptNotHeldError, 404],

    [VocabularyTermNotHeldError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 65 — [ConceptInUseError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 89 — [DuplicateGlossaryNameError, 500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 75 — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries at lines 76-77 — [ConnectorConfigurationNotWellFormedError,
    422],

    [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries at lines 53, 63 and 81 — [CapabilityNotRegisteredForTestError,
    404],

    [CapabilityConnectorMismatchError, 409],

    [ConnectorCallAddressNotAbsoluteUrlError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 77 — [IncompleteConnectorConfigurationError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 52 — [ConnectorConfigurationNotFoundError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states when a placeholder/schema mismatch
    is refused, not a status or error value; the status for the error this condition raises is a-connector-placeholder-refusal-reports-every-orphaned-placeholder''s
    own, and that node is outside this set — [ConnectorPlaceholderOutsideInputSchemaError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries at lines 85-86 — [OpenApiDocumentNotFetchedError,
    422],

    [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states when the draft is refused for an
    unreadable document, naming no status or error value of its own; that is a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document''s,
    already read above — [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states when the operations read is refused
    for an unreadable document, naming no status or error value of its own; that is an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document''s
    — [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 64 — [CapabilityCitedByEvidenceError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 87 — [OpenApiOperationNotFoundError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries at lines 85-86 — [OpenApiDocumentNotFetchedError,
    422],

    [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at nowhere — this node states the fetch-failure condition and the
    60000ms timeout; status-map.ts holds no timeout and states the fetch-failure''s status through an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
    instead — [OpenApiDocumentNotFetchedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 78 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 79 — [SubjectCarriesNoAttributeError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 88 — [InvestigationWriteDeadlineExceededError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 71 — [ManifestWouldHoldNoHypothesisError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 61, distinct from CaseNotFoundError at
    line 48 — [CaseNotFoundError, 404],

    [CaseVersionNotValidError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 83 — [ConceptRefusesSubjectTypeError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 82 — [HypothesisRevisionCollectsNoConceptError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 67 — [CaseHoldsNoDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 58 — [ManifestPositionOccupiedError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 69 — [HypothesisRevisionNotDraftAtReleaseError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 68 — [ReleasedHypothesisRevisionNotAlterableError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 56 — [ConceptNotInGlossaryError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 84 — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry at line 78 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/status-map-drift: `test-unit` passed (exit 0) over node --env-file=.env.test
    node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair, and the run is the whole
    of what answered it'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/status-map-drift: `test-unit` passed (exit 0) over node --env-file=.env.test
    node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair, and the run is the whole
    of what answered it'
  encoded_at:
  - src/errors/status-map.ts
pairs_omitted:
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/status-map-drift.returns/.

  2 pair(s) over 2 node(s) were decided by run/status-map-drift rather than by a judge — a registry step
  decides the constraint, or a certified test decides the node — with step(s) test-unit. No delegation
  read them; the run''s own log is the evidence, and it sits beside these returns.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/status-map-drift.returns/`, which are the evidence behind every entry above.
