---
title: Capability detail concept emphasis, first review
summary: What four passes found over the concept-field visual-emphasis change to the
  capability create/edit form's shared field markup.
reviewed:
- src/routes/capability-form-fields.tsx
- src/routes/capability-detail-screen-concept-emphasis.spec.ts
tasks:
- task/capability-detail-concept-emphasis/concept-field-visual-emphasis
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/capability-detail-concept-emphasis) passed every
    step cleanly, including all 929 tests; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: Concept's field container carries at least one visual property (border,
    background, or typography weight/size) that none of the form's other seven field
    containers carry, so it reads as visually set apart rather than equal weight.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: wraps only Concept's control in an ancestor carrying the accent-alt border,
      none of the other seven fields' controls sit inside one
- criterion: Concept no longer shares that undistinguished visual weight with timeout
    and connector, the two fields it previously sat beside in one grid-cols-3 row
    with no distinguishing style.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: carries the accent-alt border while Timeout's and Connector's own containers
      still do not
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: keeps Concept, Timeout and Connector as siblings inside one shared grid
      row
- criterion: Every value used to build that visual distinction resolves to a semantic
    token already declared in frontend/tui/frontend/src/theme.css or frontend/app/src/design-system/tokens.css;
    no literal px, hex, or other raw value is introduced.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: carries border-accent-alt and bg-surface, and no raw px, hex or rgb value
  why: Only the negative half is exercised (no literal px/hex/rgba appears in the
    container's className); nothing reads theme.css or tokens.css to confirm border-accent-alt
    and bg-surface actually resolve to tokens declared there rather than an ad hoc
    utility.
- criterion: The emphasis is built only from components already exported under frontend/tui/frontend/src/shared/components/ui
    plus this app's own typography utilities; no new component library is added and
    no existing TUI component's own source is copied or forked.
  state: uncovered
  why: No test inspects what the emphasis is composed from; a rendered-DOM assertion
    cannot distinguish a genuine import of a cataloged component from a hand-copied
    or forked equivalent producing identical markup. The proof record itself discloses
    this as left to the standard's own reading pass (ARC-01/ARC-04).
- criterion: 'The concept Select''s own identity is unchanged: it still resolves its
    options from conceptOptions, stays driven by the same Controller field.value/field.onChange
    wiring, keeps its aria-invalid/aria-describedby wiring, and stays disabled exactly
    while isSubmitting is true.'
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: still lets an operator change the selected concept, nested inside the Panel
      wrap
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: disables Concept's control only for the duration of a pending save, re-enabling
      once it resolves
  why: Options-resolution, value/onChange wiring, and disabled-during-submit are exercised;
    nothing in the test set asserts on the Concept control's aria-invalid or aria-describedby
    wiring under an actual validation error, so that named half of the criterion is
    unexercised.
- criterion: Neither capability-form-dialog.tsx nor capability-detail-ready-view.tsx
    requires a prop or call-site change for the new layout to render, since both compose
    CapabilityFormFields unmodified today.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: wraps only Concept's control in an ancestor carrying the accent-alt border,
      none of the other seven fields' controls sit inside one
  why: Every test mounts CapabilityDetailScreen, which renders through capability-detail-ready-view.tsx
    unmodified, so the new markup rendering correctly there is indirect evidence of
    that half. capability-form-dialog.tsx is never rendered by anything in this test
    set (only capabilities-browser-screen.tsx reaches it, never mounted here), so
    that half has no test bearing on it at all.
- criterion: None of the form's other seven fields (name, version, nature, input_schema,
    output_schema, timeout, connector) changes position, meaning, or validation behavior
    as a result of this change.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: wraps only Concept's control in an ancestor carrying the accent-alt border,
      none of the other seven fields' controls sit inside one
  - file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
    name: keeps Concept, Timeout and Connector as siblings inside one shared grid
      row
  why: Position is exercised only for Timeout and Connector, and only negatively for
    all seven (none gained Concept's distinguishing container). Nothing checks the
    position of name, version, nature, input_schema or output_schema, and nothing
    asserts on any of the seven fields' meaning or validation behavior before versus
    after this change.
findings:
- pass: conformance
  file: src/routes/capability-form-fields.tsx
  where: the hint paragraph rendered beside the output_schema field (added by a different,
    already-delivered task, task/capability-output-schema-guidance/output-schema-field-guidance,
    merged into this same file)
  evidence: For each field under <code>properties</code>, the platform reads its own
    type and description as that field's declared meaning — no other content of this
    schema is read or validated.
  cost: domain/investigation/field-semantics states which attributes are read structurally
    from a schema's properties and that nothing else is read or validated; this JSX
    string restates that same fact as an independently authored sentence. If the node's
    own read set ever changes, nothing ties this string to it, so the UI keeps telling
    operators the old rule while the node states a new one, and neither side is marked
    as wrong.
  correction: state the read set once, in domain/investigation/field-semantics or
    a value this component imports from the same place the schema-reading code itself
    derives from, rather than as an independently authored sentence.
- pass: conformance
  file: src/routes/capability-form-fields.tsx
  where: the same hint paragraph's closing sentence (same other task's own addition)
  evidence: A description states what a value means ("2 = suspended for delinquency"),
    never a decision ("when 2, confirm the hypothesis").
  cost: rules/glossary/a-description-states-meaning-never-policy already states this
    distinction with its own illustrative example ("2 = suspended for delinquency"
    as meaning, "when 2, confirm the financial-block hypothesis" as decision). The
    JSX carries a paraphrase of that same example as its own text; the day the policy's
    wording or example changes, this copy does not follow it.
  correction: have the hint quote or derive from the policy node's own text rather
    than restating its rule and example independently.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: the conceptSelectOptions assignment and its use in the concept Select's options
    prop
  cites: API-01
  evidence: "const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept)\
    \ => ({\n  value: concept.name,\n  label: concept.name,\n}));"
  cost: the ConceptOption-to-SelectOption shape is transformed once, assembled directly
    at this call site rather than through a named adapter function, so a second screen
    needing a concept picker backed by the same Select cannot find this mapping and
    reinvents the same transform by hand.
  correction: extract the mapping into a named adapter function (e.g. toConceptSelectOptions),
    and call it here rather than mapping inline in the component body.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: the isSaveDisabled computation in the component body
  cites: ARC-03
  evidence: "const isSaveDisabled =\n  isSubmitting || !inputSchema.isValid || !outputSchema.isValid\
    \ || isDirty === false;"
  cost: the decision of when Save may be clicked is embedded in this render function
    rather than in use-capability-form.ts, the hook this same component already reads
    inputSchema/outputSchema from; a reader looking for the gate finds it only by
    opening this component, and a second screen needing the identical composite rule
    copies the expression rather than calling a shared value the hook exposes.
  correction: move the disabled-condition into use-capability-form.ts as a value the
    hook computes and returns, and have this component read it rather than recompute
    it.
---

## What it is
The first review of task/capability-detail-concept-emphasis/concept-field-visual-emphasis: the concept field's Panel-based visual emphasis in the capability create/edit form's shared field markup, and the seven-test proof written for it.
Four passes over that task's file set -- coverage, specification conformance, standard conformance, and failures (which did not run, nothing failed).

## Notes
The file set's one source file, capability-form-fields.tsx, also carries an unrelated, already-delivered task's own change merged into it since this task's own delivery: task/capability-output-schema-guidance/output-schema-field-guidance's hint paragraph beside the output_schema field. Both conformance findings above sit in that other task's own addition, not in anything this task's own delivery wrote -- disclosed here so a reader does not mistake them for a defect in the reviewed task's own work, though the findings themselves are reported exactly as observed, against the file as it now stands.
The standard pass narrowed its 29 reading-decided rules to the ones whose scope reaches this file set (src/routes/*.tsx, src/routes/*.spec.ts); rules scoped to src/pages, src/store, src/services, src/features or .css files were excluded as out of scope rather than silently passed.
Both standard-pass findings (API-01, ARC-03) sit in code this task's own delivery did not write (conceptSelectOptions and isSaveDisabled both predate this task, per the implementation record's own preserved list) -- flagged here because the pass reviews the file as it stands, not only the lines one task changed.
The coverage pass's own uncovered/partial states largely trace to one fact the proof record already discloses: no DOM query can prove which component a caller actually imported (criterion 4), and several criteria (6, 7) rest on files this task did not touch continuing to pass unmodified, which the coverage pass could confirm only indirectly through what this task's own tests happen to mount.
