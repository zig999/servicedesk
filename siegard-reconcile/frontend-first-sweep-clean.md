---
contract_version: siegard-reconcile/1
title: Frontend first sweep — 13 clean files
summary: 'The human''s premise: the frontend as currently delivered and already reviewed is correct; the
  trace''s 17 ''code'' findings for the frontend target had never been reconciled. This is the first reconciliation
  ever run over this target.'
target: frontend
files:
- path: src/shared/components/app-shell.tsx
  change: never reconciled
- path: src/hooks/use-edit-draft-version-form.ts
  change: never reconciled
- path: src/routes/glossary-browser-screen.tsx
  change: never reconciled
- path: src/hooks/use-capability-detail.ts
  change: never reconciled
- path: src/routes/connector-test-panel-fields.tsx
  change: never reconciled
- path: src/routes/connector-test-panel-result.tsx
  change: never reconciled
- path: src/routes/capability-form-fields.tsx
  change: never reconciled
- path: src/routes/connector-test-panel.tsx
  change: never reconciled
- path: src/routes/capability-detail-ready-view.tsx
  change: never reconciled
- path: src/services/error-ui-state.ts
  change: never reconciled
- path: src/shared/components/json-textarea-field.tsx
  change: never reconciled
- path: src/routes/connector-configuration-form-fields.tsx
  change: never reconciled
- path: src/routes/case-detail-screen.tsx
  change: never reconciled
nodes:
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: app-shell.tsx's Topbar renders 'No auth in this build' in its status slot.
  encoded_at:
  - src/shared/components/app-shell.tsx
- node: contracts/glossary/glossary-query
  conforms: true
  how: use-edit-draft-version-form.ts and glossary-browser-screen.tsx both call useGlossaryVocabularyOptions/useConceptOptions,
    exercising list-vocabulary-terms/list-concepts.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: use-edit-draft-version-form.ts's three mutations (patch, release, discard) exercise the contract's
    declared operations.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: use-edit-draft-version-form.ts's versionQuery reads GET /v1/cases/:slug/versions/:version; case-detail-screen.tsx
    reads the version list via the same contract.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-detail-screen.tsx
- node: domain/glossary/action
  conforms: true
  how: both files source the action vocabulary from useGlossaryVocabularyOptions('action') rather than
    a hardcoded list.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/concept
  conforms: true
  how: use-edit-draft-version-form.ts's useConceptOptions/conceptOptions.concepts; glossary-browser-screen.tsx's
    ConceptsPanel/toConceptRow render the node's declared attributes (name, accepts, ttl).
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/outcome
  conforms: true
  how: both files source the outcome vocabulary from useGlossaryVocabularyOptions('outcome').
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/recipient
  conforms: true
  how: both files source the recipient vocabulary from useGlossaryVocabularyOptions('recipient').
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/subject-attribute
  conforms: true
  how: glossary-browser-screen.tsx's VocabularyPanel for 'subject-attribute' sources its list from the
    same vocabulary hook.
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: use-edit-draft-version-form.ts's resetFormFrom carries subject unchanged; glossary-browser-screen.tsx
    sources the subject-type vocabulary from the same hook.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: domain/integration/capability
  conforms: true
  how: use-capability-detail.ts's query/mutation and capability-form-fields.tsx's eight fields both match
    the node's declared attributes exactly.
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: capability-form-fields.tsx maps CAPABILITY_NATURES (imported, not restated) into select options.
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/connector-configuration
  conforms: true
  how: connector-test-panel.tsx's ConnectorTestPanelProps carries exactly the connector identity attribute.
  encoded_at:
  - src/routes/connector-test-panel.tsx
- node: domain/knowledge/case
  conforms: true
  how: use-edit-draft-version-form.ts's hook signature and query key are keyed by slug/version; case-detail-screen.tsx's
    useParams reads slug.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: use-edit-draft-version-form.ts's resetFormFrom and case-detail-screen.tsx's toRow both carry the
    node's declared attributes unchanged.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: both files' canRelease/isReadOnly/STATE_CELL logic covers exactly the two declared states.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: use-edit-draft-version-form.ts returns record.manifest unchanged.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/referral
  conforms: true
  how: use-edit-draft-version-form.ts's resetFormFrom carries record.fallback (including referral) unchanged.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/resolution
  conforms: true
  how: use-edit-draft-version-form.ts's resetFormFrom carries record.fallback unchanged, matching the
    outcome+referral pairing.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: use-capability-detail.ts's schema-validity gate and capability-form-fields.tsx's isSaveDisabled
    both consume, never restate, the JSON-well-formedness check; capability-detail-ready-view.tsx's warning
    banners state only the consequence, disclosing the exact wording as inference; error-ui-state.ts and
    json-textarea-field.tsx cite the node correctly.
  encoded_at:
  - src/hooks/use-capability-detail.ts
  - src/routes/capability-form-fields.tsx
  - src/routes/capability-detail-ready-view.tsx
  - src/services/error-ui-state.ts
  - src/shared/components/json-textarea-field.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: capability-form-fields.tsx offers both nature values without asserting the registry's refusal;
    error-ui-state.ts cites the node correctly for CapabilityNotReadOnlyError.
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/services/error-ui-state.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: connector-configuration-form-fields.tsx delegates the well-formedness check entirely to a prop
    computed elsewhere, asserting nothing itself; error-ui-state.ts cites the node correctly for ConnectorConfigurationNotWellFormedError.
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  - src/services/error-ui-state.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: connector-test-panel.tsx's header comment quotes the rule verbatim to explain its own connector-identity
    prop.
  encoded_at:
  - src/routes/connector-test-panel.tsx
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: use-edit-draft-version-form.ts never composes or edits the manifest — the invariant constrains
    work this file does not perform.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: case-detail-screen.tsx's VersionsPanel gates the 'New draft' link on hasDraft, computed from the
    version list.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: use-edit-draft-version-form.ts's isBlocked/isReadOnly remove every write path for a released version.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: use-edit-draft-version-form.ts's mutation onError handlers detect the 'case-version-not-draft'
    condition and enter conflict state.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: use-edit-draft-version-form.ts's release checklist is disclosed as best-effort, never a promise,
    consistent with the rule.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: capability-form-fields.tsx's single-select concept field leaves the uniqueness policy to the registry;
    error-ui-state.ts cites the node correctly for ConceptAlreadyAnsweredError.
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/services/error-ui-state.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: use-edit-draft-version-form.ts's release checklist and glossary-browser-screen.tsx both draw every
    glossary-governed value from the supplied vocabulary.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/glossary-browser-screen.tsx
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: case-detail-screen.tsx's VersionsPanel builds one row per every entry the version-list response
    returns.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: use-edit-draft-version-form.ts's discard canDiscard gates on the loaded version's state being draft.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: true
  how: case-detail-screen.tsx's VersionsPanel renders an explicit empty-state message when rows.length
    === 0.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: contracts/integration/capability-registry
  conforms: true
  how: use-capability-detail.ts's query and mutation exercise exactly the identity-keyed read and register
    operations.
  encoded_at:
  - src/hooks/use-capability-detail.ts
- node: contracts/integration/connector-diagnostics
  conforms: true
  how: connector-test-panel-fields.tsx and connector-test-panel-result.tsx together render the diagnostic
    call's assembly and outcome, never storing or forwarding the result.
  encoded_at:
  - src/routes/connector-test-panel-fields.tsx
  - src/routes/connector-test-panel-result.tsx
notes: 'Judgment shape: 13 independent specification-conformance-reviewer delegations, one per file, run
  together as part of a 17-file batch (the other 4 files carry findings and are reconciled in separate
  records — frontend-connector-configuration-detail-drift.md, frontend-use-connector-configuration-detail-drift.md,
  frontend-case-version-subject-field-drift.md, frontend-cases-list-screen-drift.md — to avoid folding
  their findings onto files, in this record, that share the same node and are themselves clean). Each
  was handed its own file''s trace-bound node set plus, as candidates, the union of nodes bound across
  the whole 17-file batch. All node/file pairs in this record cleared.'
---
