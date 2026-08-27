---
title: Case-simulation Subject panel
summary: A props-driven Subject region (subject type, requester, derived required fields with connector/capability
  annotations and input_schema hints, a glossary-restricted add-attribute control, and a raw-JSON view)
  for the simulation cockpit, built as one new file under frontend/app/src/routes, wired to nothing yet.
task: sha256:5f5fd157436ee3e2be1edce17bf872284d0bdb5a708cc0b01da993b3b23cf189
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-derivation-subject-panel-build
files:
- path: src/routes/case-simulation-subject-panel.tsx
  effect: 'New file. Exports CaseSimulationSubjectPanelProps ({ state: SimulationSubjectState }) and CaseSimulationSubjectPanel,
    a presentational component rendering the subject-type field (a glossary-populated Select bound to
    state.subject.type with a documented no-op change handler, since the composed hook exposes no setter
    for it), the requester Input bound to state.requester/state.onRequesterChange, one row per state.requiredFields
    entry (attribute name as label, its own Input, the "← connector (capability name version)" annotation,
    and its input_schema hint as unparsed plain text when non-empty), an "add attribute" row list (state.addedAttributes)
    whose attribute name is chosen from a Select populated by useGlossaryVocabularyOptions("subject-attribute")
    rather than typed, an "+ attribute"/"Remove attribute" pair wired to state.onAddAttribute/onRemoveAttribute,
    and a <details>/<summary> "View subject JSON" block rendering JSON.stringify(state.subject, null,
    2). Also composes useGlossaryVocabularyOptions("subject-type") directly for the Type field''s own
    options, and renders EDG-01/EDG-02 loading/error states for both direct glossary reads and for the
    passed-through state.isLoadingRegistries/state.isRegistriesError, plus an API-04 empty state when
    state.requiredFields is empty.'
criteria:
- criterion: The subject type is chosen from the glossary's subject-type vocabulary (domain/glossary/subject-type),
    never typed as free text.
  met: true
  how: The Type field is a @tui/ui/select Select whose options come from useGlossaryVocabularyOptions("subject-type")
    and whose value is state.subject.type — never a free Input. There is no way to type a subject-type
    string anywhere in this component; the value is display-bound (a documented no-op onChange, doNotChangeSubjectType)
    because SimulationSubjectState exposes no setter for it — the version's own declared subject type
    is already fixed to a glossary-governed value before this screen renders (domain/investigation/subject's
    own Description).
- criterion: The requester field is shown and its value is part of the region's own state.
  met: true
  how: The Requester Input's value is state.requester and its onChange calls state.onRequesterChange —
    both held by useSimulationSubject, the Subject region's own hook (task/subject-derivation/use-simulation-subject-hook,
    already delivered and this task's own depends_on), passed into this presentational component as `state`.
- criterion: Each derived required field is labeled with its attribute name and shows, alongside it, the
    connector and the capability that asked for it.
  met: true
  how: Each state.requiredFields entry renders a <Label> holding field.attribute, its own Input, and a
    "← {field.connector} ({field.capability.name} {field.capability.version})" line beneath it — exactly
    DerivedSubjectField's own connector/capability annotation, unchanged.
- criterion: A capability's input_schema hint, where present, is shown next to its required field as plain
    text, including where it is prose rather than a schema, per the scope's own perfil-mobile-tecnico-reader
    example.
  met: true
  how: field.inputSchemaHint is rendered verbatim inside a <p>, gated only on field.inputSchemaHint.trim()
    !== "" ("where present") — never JSON.parse'd or pretty-printed the way connector-test-panel-fields.tsx's
    own formatSchemaForDisplay treats a capability's input_schema, since this criterion explicitly requires
    prose to render unaltered rather than fail a parse.
- criterion: The "add attribute" control offers only attribute names drawn from the subject-attribute
    glossary (domain/glossary/subject-attribute), satisfying rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
    — never an arbitrary typed name.
  met: true
  how: Each added-attribute row's own "Attribute" field is a Select whose options come from useGlossaryVocabularyOptions("subject-attribute")
    — never an Input a curator could type into — departing from use-test-connector-panel.ts's own free-text
    Input for the same-shaped row, because that precedent answers a different contract this task's own
    criterion does not constrain the same way.
- criterion: A "view subject JSON" control shows the currently assembled subject — its type and its full
    set of attribute-values — exactly as domain/investigation/subject structures it.
  met: true
  how: A native <details>/<summary> "View subject JSON" block (this epic's own established collapsible-block
    convention, case-simulation-detail-evidence-tab.tsx) renders JSON.stringify(state.subject, null, 2)
    — state.subject is exactly {type, attributes}, the SimulationSubject the composed hook assembles,
    unchanged.
nodes:
- node: domain/investigation/subject
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: Renders state.subject (already assembled to this value-object's own shape by the composed hook)
    as the Type field's own value and as the JSON view's own content — this component is the display/edit
    surface for it, not its assembly point (that is task/subject-derivation/use-simulation-subject-hook's
    own job).
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: Both the required-fields list and the added-attribute rows edit one {attribute, value} pair per
    row, never two parallel arrays; the JSON view renders state.subject.attributes (readonly SubjectAttributeValue[])
    verbatim.
- node: domain/glossary/subject-type
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: The Type field's own options are exactly useGlossaryVocabularyOptions("subject-type")'s current
    terms — this vocabulary is what the field's value is drawn from, never a free string.
- node: domain/glossary/subject-attribute
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: The add-attribute row's own Attribute Select options are exactly useGlossaryVocabularyOptions("subject-attribute")'s
    current terms.
- node: domain/integration/capability
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: Renders each required field's own capability.name and capability.version (already resolved by the
    composed hook/derivation) in the "← connector (capability)" annotation line.
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: 'Criterion 5''s own control is a Select whose options are exactly useGlossaryVocabularyOptions("subject-attribute")''s
    current terms, so a curator-added attribute name can never be anything the glossary does not currently
    hold — never an arbitrary typed name. This is only the curator-facing half of the rule; a derived
    required field''s own attribute name (sourced from a connector configuration''s own placeholder, not
    curator input) is left unchecked here, the same posture task/subject-derivation/use-simulation-subject-hook''s
    own delivery record already discloses for the derivation itself — consistent with this rule''s own
    stated consistency: eventual.'
inferences:
- inferred: The subject-type field is rendered through a Select bound to useGlossaryVocabularyOptions("subject-type")
    with a documented no-op change handler (doNotChangeSubjectType), rather than a `disabled` prop or
    a plain text node.
  from: SimulationSubjectState (use-simulation-subject.ts, already delivered) exposes no setter for subject.type
    — domain/investigation/subject's own Description states the case itself declares only the subject
    type, fixed before this screen renders. layout/simulation-screen.md's own "[<glossary> ▾]" notation
    decides the Select form (a reference decides form, never fact); frontend/tui is an uninitialized git
    submodule in this worktree, so an unverified `disabled` prop on @tui/ui/select was avoided (the same
    reasoning task/simulation-cockpit/detail-panel's own delivery record already used for its own ARC-01
    departure) in favor of the naming convention case-simulation-ready-view.tsx's own doNotDispatchSimulateCase
    already establishes for a control this delivery renders but cannot wire to a real handler.
- inferred: An empty state.requiredFields renders an explicit "No connector requires a subject field for
    this version." message rather than an empty list.
  from: API-02/API-04's own convention (standards/frontend-typescript.yaml) that a legitimately empty
    derived list renders its own explicit state; this task's own Notes confirm a version deriving zero
    required fields is a real, allowed case.
- inferred: Loading and error states are rendered for useGlossaryVocabularyOptions("subject-type"), useGlossaryVocabularyOptions("subject-attribute"),
    and the passed-through state.isLoadingRegistries/state.isRegistriesError, though no criterion of this
    task names them.
  from: EDG-01/EDG-02 (standards/frontend-typescript.yaml) and this app's own established precedent for
    exactly these signals — glossary-browser-screen.tsx's VocabularyPanel (message plus refetch-bound
    Retry button for a vocabulary read) and connector-test-panel-fields.tsx (message-only for a composed
    hook's own isLoading/isError pass-through, no retry available).
divergences:
- cites: ARC-01
  file: src/routes/case-simulation-subject-panel.tsx
  departure: The "View subject JSON" collapsible block is a native <details>/<summary> element rather
    than a composed TUI catalog primitive.
  why: 'Mirrors task/simulation-cockpit/detail-panel''s own already-disclosed departure for the identical
    situation (case-simulation-detail-evidence-tab.tsx): that task''s own delivery record confirms, having
    since checked out the frontend/tui submodule, that no disclosure/accordion/collapsible primitive exists
    under frontend/tui/frontend/src/shared/components/ui/. Confirmed independently here too, once this
    worktree''s own copy of the submodule was initialized: only dialog exists in that directory, no disclosure/accordion
    primitive.'
deferred:
- what: Composing CaseSimulationSubjectPanel into the simulate route (calling useSimulationSubject once
    and passing its returned state down), and gating "Simulate case"/dispatch actions on state.isReady.
  why: task/simulation-cockpit/screen-assembly owns cross-region wiring and composition, per this epic's
    own established convention (case-simulation-ready-view.tsx's own header comment) — this task's own
    instructions ask for a props-driven component independent of that not-yet-delivered composition.
---

## What it is

The left column of the cockpit's layout, described in the scope's "Subject (D7)" section: subject-type display, requester field, derived required fields with connector/capability annotations, a glossary-restricted add-attribute control, and a raw subject-JSON view.

## Notes

None.
