---
implementation: sha256:bc490b581e0230db03bd3bfdbb5b1d28bea46020bab75d9c798c2c6b1dc6c8ce
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-derivation-subject-panel-suite-2
title: Subject region proof
summary: Tests for CaseSimulationSubjectPanel covering all six task criteria, its disclosed inferences,
  and the edge cases its own state shape raises, mounted directly with a built SimulationSubjectState
  against a stubbed global fetch for its two live glossary reads. Split across a shared test-support file
  and three spec files (fields, add-attribute control, JSON view/inferences) to stay under MNT-01's line
  budget.
tests:
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the subject type is drawn from the glossary vocabulary, never typed
    (criterion 1) > renders the Type field as a combobox, never a free-text input
  proves: The subject type is chosen from the glossary's subject-type vocabulary (domain/glossary/subject-type),
    never typed as free text.
  fails_when: the Type field stops being a role=combobox control (e.g. becomes a plain text input the
    operator could type into).
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the subject type is drawn from the glossary vocabulary, never typed
    (criterion 1) > offers exactly the subject-type vocabulary's own current terms as options
  proves: The subject type is chosen from the glossary's subject-type vocabulary (domain/glossary/subject-type),
    never typed as free text.
  fails_when: the Type field's own option list stops matching exactly what GET /v1/glossary/subject-type
    currently returns (missing, extra, or reordered terms).
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the subject type is drawn from the glossary vocabulary, never typed
    (criterion 1) > shows the given state.subject.type as the Type field's own selected value
  proves: The subject type is chosen from the glossary's subject-type vocabulary (domain/glossary/subject-type),
    never typed as free text.
  fails_when: the Type field stops displaying state.subject.type as its own selected value once the vocabulary
    resolves.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the subject type is drawn from the glossary vocabulary, never typed
    (criterion 1) > leaves the displayed subject type unchanged after picking a different vocabulary option,
    since the composed hook exposes no setter for it (disclosed inference)
  proves: the implementation's own disclosed inference that the Type Select's onChange is a documented
    no-op (doNotChangeSubjectType), since SimulationSubjectState exposes no setter for subject.type
  fails_when: picking a different option in the Type dropdown changes the field's own displayed value.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the requester field is part of the region's own state (criterion
    2) > shows state.requester as the Requester field's own value
  proves: The requester field is shown and its value is part of the region's own state.
  fails_when: the Requester field stops reflecting state.requester as its own controlled value.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the requester field is part of the region's own state (criterion
    2) > calls state.onRequesterChange with what was typed, rather than holding requester as its own state
  proves: The requester field is shown and its value is part of the region's own state.
  fails_when: typing into Requester stops calling state.onRequesterChange with the typed value (e.g. the
    component starts holding its own local state instead).
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- each derived required field is labeled and annotated (criterion
    3) > labels a required field with its own attribute name, shows its own value, and calls its own onChange
    when edited
  proves: Each derived required field is labeled with its attribute name and shows, alongside it, the
    connector and the capability that asked for it.
  fails_when: the required field's own label stops matching its attribute name, its Input stops reflecting
    field.value, or editing it stops calling field.onChange with the new value.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- each derived required field is labeled and annotated (criterion
    3) > shows the connector and the capability that asked for a required field, alongside it
  proves: Each derived required field is labeled with its attribute name and shows, alongside it, the
    connector and the capability that asked for it.
  fails_when: the "← connector (capability name version)" annotation stops rendering, or renders a wrong
    connector/capability.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- each derived required field is labeled and annotated (criterion
    3) > renders one row per required field, each carrying its own attribute/connector/capability annotation
  proves: Each derived required field is labeled with its attribute name and shows, alongside it, the
    connector and the capability that asked for it.
  fails_when: the number of rendered rows stops matching state.requiredFields.length, or one row's annotation
    leaks into another's.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- a capability's input_schema hint, where present, is shown as plain
    text (criterion 4) > shows the hint text verbatim next to its own required field, prose included,
    never parsed or reformatted
  proves: A capability's input_schema hint, where present, is shown next to its required field as plain
    text, including where it is prose rather than a schema, per the scope's own perfil-mobile-tecnico-reader
    example.
  fails_when: prose inputSchemaHint text stops rendering verbatim (e.g. is JSON.parsed, dropped, or reformatted)
    next to its own required field.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- a capability's input_schema hint, where present, is shown as plain
    text (criterion 4) > shows no hint paragraph for a required field whose own inputSchemaHint is empty
  proves: A capability's input_schema hint, where present, is shown next to its required field as plain
    text...
  fails_when: an empty inputSchemaHint starts rendering an (empty or otherwise) hint paragraph anyway.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- a capability's input_schema hint, where present, is shown as plain
    text (criterion 4) > treats a whitespace-only inputSchemaHint the same as an empty one
  proves: A capability's input_schema hint, where present, is shown next to its required field as plain
    text... (the "where present" gating specifically)
  fails_when: a whitespace-only inputSchemaHint starts rendering a visible hint paragraph.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > renders each added-attribute row's own Attribute field as a combobox,
    never a free-text input
  proves: The 'add attribute' control offers only attribute names drawn from the subject-attribute glossary
    ... never an arbitrary typed name.
  fails_when: an added-attribute row's own Attribute field stops being a role=combobox control (e.g. becomes
    a free-text input).
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > offers exactly the subject-attribute vocabulary's own current
    terms as options
  proves: The 'add attribute' control offers only attribute names drawn from the subject-attribute glossary
    (domain/glossary/subject-attribute), satisfying rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.
  fails_when: the Attribute field's own option list stops matching exactly what GET /v1/glossary/subject-attribute
    currently returns.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > calls state.onAttributeChange with the row's own id and the picked
    attribute name
  proves: The 'add attribute' control offers only attribute names drawn from the subject-attribute glossary...
  fails_when: picking a glossary option stops calling state.onAttributeChange(rowId, "attribute", pickedValue)
    with the row's own id and the picked value.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > calls state.onAttributeChange with the row's own id and the value
    typed into its own Value field
  proves: an added-attribute row's own Value field is wired to state.onAttributeChange, the other half
    of criterion 5's row
  fails_when: typing into a row's Value field stops calling state.onAttributeChange(rowId, "value", typedValue).
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > calls state.onAddAttribute when '+ attribute' is clicked
  proves: the add-attribute control itself is wired to state.onAddAttribute
  fails_when: clicking "+ attribute" stops calling state.onAddAttribute.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > calls state.onRemoveAttribute with exactly the id of the row
    whose own Remove action was clicked, never by position (edge case)
  proves: a duplicate/multi-row edge case over criterion 5's row list -- removal is keyed by the row's
    own stable id, not its position
  fails_when: clicking one row's own Remove action calls onRemoveAttribute with a different row's id,
    or with a position/index instead of an id.
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names,
    never a typed one (criterion 5...) > renders no Remove-attribute button when the curator has added
    no rows yet (edge case)
  proves: the empty-added-attributes edge case
  fails_when: a "Remove attribute" button renders with zero rows in state.addedAttributes, or "+ attribute"
    stops rendering.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- the view subject JSON control (criterion 6) > shows the currently
    assembled subject's type and its full set of attribute-values, exactly as domain/investigation/subject
    structures it, inside a collapsible details/summary block
  proves: A 'view subject JSON' control shows the currently assembled subject -- its type and its full
    set of attribute-values -- exactly as domain/investigation/subject structures it.
  fails_when: the rendered JSON inside the details/summary block stops parsing back to exactly {type,
    attributes} as given in state.subject (missing a field, dropping an attribute-value, or altering a
    value).
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- an empty required-fields list renders its own explicit message (disclosed
    inference, API-04) > shows 'No connector requires a subject field for this version.' rather than an
    empty list
  proves: the implementation's own disclosed inference that an empty state.requiredFields renders an explicit
    message rather than an empty list
  fails_when: an empty requiredFields array renders nothing, or renders an empty <ul> with no explanatory
    message.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states for the two glossary reads (disclosed inference,
    EDG-01/EDG-02) > shows a loading message while the subject-type vocabulary is still loading
  proves: the implementation's own disclosed EDG-01 inference for the subject-type glossary read
  fails_when: no loading message renders while GET /v1/glossary/subject-type is still pending.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states for the two glossary reads (disclosed inference,
    EDG-01/EDG-02) > shows a loading message while the subject-attribute vocabulary is still loading
  proves: the implementation's own disclosed EDG-01 inference for the subject-attribute glossary read
  fails_when: no loading message renders while GET /v1/glossary/subject-attribute is still pending.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states for the two glossary reads (disclosed inference,
    EDG-01/EDG-02) > shows a load-error message with a Retry control when the subject-type vocabulary
    fails to load, and Retry re-issues the request
  proves: the implementation's own disclosed EDG-02 inference for the subject-type glossary read
  fails_when: a failed subject-type glossary read shows no error message/Retry, or clicking Retry does
    not re-issue the GET.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states for the two glossary reads (disclosed inference,
    EDG-01/EDG-02) > shows a load-error message with a Retry control when the subject-attribute vocabulary
    fails to load, and Retry re-issues the request
  proves: the implementation's own disclosed EDG-02 inference for the subject-attribute glossary read
  fails_when: a failed subject-attribute glossary read shows no error message/Retry, or clicking Retry
    does not re-issue the GET.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states passed through from the composed hook (disclosed
    inference, EDG-01/EDG-02) > shows a loading message when state.isLoadingRegistries is true
  proves: the implementation's own disclosed pass-through inference for state.isLoadingRegistries
  fails_when: state.isLoadingRegistries=true stops rendering its own loading message.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states passed through from the composed hook (disclosed
    inference, EDG-01/EDG-02) > shows a load-error message when state.isRegistriesError is true
  proves: the implementation's own disclosed pass-through inference for state.isRegistriesError
  fails_when: state.isRegistriesError=true stops rendering its own error message.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states passed through from the composed hook (disclosed
    inference, EDG-01/EDG-02) > does not render the required-fields list at all while the registries are
    still loading (edge case)
  proves: the required-fields list and its empty-state message are gated behind the registries-loaded
    state, not shown prematurely or alongside the loading message
  fails_when: the required-fields list or its empty-state message renders while state.isLoadingRegistries
    is still true.
not_applicable:
- edge_case: An assembled subject holding zero attribute-values, rendered and asserted as an accepted
    state.
  why: rules/investigation/a-subject-carries-at-least-one-attribute forbids this state, and it is enforced
    by the composed hook's own readiness gate (task/subject-derivation/use-simulation-subject-hook), not
    by this presentational component. This task's own Notes carry an UNDERDETERMINED entry over exactly
    this gap and explicitly instruct against treating it as a success case here, so every fixture subject
    in this file carries at least one attribute-value.
- edge_case: Two curator interactions racing against each other (e.g. two "add attribute" clicks, or an
    add and a remove, dispatched at once).
  why: every handler this component exposes is a synchronous prop call whose sequencing the composed hook
    owns; no criterion of this task states concurrent-edit behavior, and asserting one would bind this
    proof to the hook's own state machine, already proved separately in use-simulation-subject.spec.ts.
- edge_case: Two required fields, or a required field and a curator-added row, naming the same attribute.
  why: merging/deduplicating into one {attribute, value} pair per name is use-simulation-subject.ts's
    own mergedAttributes, already proved in use-simulation-subject.spec.ts; this component only ever renders
    whatever state.subject.attributes already holds, verbatim.
- edge_case: Keyboard navigation, outside-click and Escape dismissal of a Select's own dropdown.
  why: that behavior belongs to TUI's own shared Select primitive (@tui/ui/select), composed here unchanged
    (ARC-01); no criterion of this task asks this component to behave differently from that primitive's
    own established behavior.
untested:
- Whether a required field's or an added-attribute row's own Input/Select actually re-renders to reflect
  an updated state prop after its own onChange fires. This component holds no state of its own -- every
  value comes from the caller-supplied state -- so every interaction test here asserts only that the correct
  handler was called with the correct argument (the same convention case-simulation-header.spec.ts already
  established for a fully props-driven region). The round trip through a real controlled value living
  in the composed hook is use-simulation-subject.spec.ts's own proof, not this component's, and this file
  leaves that gap open rather than re-deriving it.
---

## What it is

Twenty-six tests across three spec files plus a shared test-support module, proving the Subject region's six criteria -- glossary-drawn subject type (display-only), the requester field, each derived required field's label/annotation, the input_schema hint's verbatim prose rendering, the glossary-restricted add-attribute control, and the raw subject-JSON view -- plus every disclosed inference (the no-op subject-type handler, the empty-required-fields message, and loading/error states for both direct glossary reads and the composed hook's own pass-through flags).

## Notes

The suite's first run (run/subject-derivation-subject-panel-suite) failed lint: two testing-library/no-node-access violations (an eslint-disable comment that covered only the line directly beneath it, leaving a querySelectorAll call unsuppressed) and a max-lines violation (369 lines in one spec file, budget 300). A fresh test-author fixed the two queries (replacing raw DOM traversal with getAllByRole/within/getAllByText) and split the file into this proof's own three spec files plus case-simulation-subject-panel.test-support.ts for shared fixtures, moving every test verbatim with no assertion changed. run/subject-derivation-subject-panel-suite-2 is the resulting clean run.