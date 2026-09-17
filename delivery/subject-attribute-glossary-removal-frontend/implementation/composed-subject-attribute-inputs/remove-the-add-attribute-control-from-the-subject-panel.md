---
target: frontend
title: Remove the add-attribute control from the subject panel
summary: Case-simulation-subject-panel.tsx now renders exactly one input per case-input-requirements entry
  and offers no way to name any other attribute.
task: sha256:43b4b2217f27b1235a6a142949c36c9a032096cf2d364d422a3d2bc702b7d472
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-reduction-tab-removal-panel-removal-suite-2
files:
- path: src/routes/case-simulation-subject-panel.tsx
  effect: Renders the subject-type Select (with its own loading/error/Retry branches), the requester input,
    one Label+Input per state.requiredFields entry (each carrying its own required flag through), the
    malformed-input-schema list, and the empty-set disclosure paragraph when requiredFields is empty.
    No longer imports or calls useGlossaryVocabularyOptions("subject-attribute"), no longer defines availableAttributeOptions,
    and no longer reads state.addedAttributes, state.onAddAttribute, state.onRemoveAttribute or state.onAttributeChange.
    Rewritten whole under the no-comments rule.
- path: src/routes/case-simulation-subject-panel.spec.ts
  effect: The pre-existing "renders no disabled control" test switched from screen.getAllByRole("button")
    (which throws when zero buttons exist) to screen.queryAllByRole("button"), since the panel with the
    removed control and no error state now legitimately renders zero buttons.
criteria:
- criterion: The subject panel renders no "+ attribute" control.
  met: true
  how: The Button labelled "+ attribute" and its onClick={state.onAddAttribute} wiring are gone from the
    JSX. Proven by case-simulation-subject-panel-attributes.spec.ts.
- criterion: The subject panel renders no attribute row carrying its own Attribute select, Value input
    and Remove attribute button.
  met: true
  how: The state.addedAttributes.map block rendering the row's three controls is removed. Proven by case-simulation-subject-panel-attributes.spec.ts.
- criterion: The panel issues no glossary read for the vocabulary "subject-attribute", and neither a subject-attribute
    loading message nor a subject-attribute load-error message with its Retry control is reachable.
  met: true
  how: The second useGlossaryVocabularyOptions("subject-attribute") call and its loading/error/Retry branches
    are removed; only the subject-type read remains. Proven by case-simulation-subject-panel-attributes.spec.ts.
- criterion: The panel's attribute inputs are exactly one per requirement named by the case-input-requirements
    read, required and optional alike, each carrying that requirement's own required flag through unchanged.
  met: true
  how: state.requiredFields.map renders exactly one input per requirement, required and optional alike,
    passing field.required through unchanged. Proven by pre-existing case-simulation-subject-panel.spec.ts
    tests, left untouched by this task.
- criterion: Where the read names no requirement at all, the panel still states that emptiness explicitly
    to the person composing the subject and that the simulate call is unavailable in that state, and the
    panel offers them no other way to name an attribute.
  met: true
  how: The state.requiredFields.length === 0 branch keeps stating the emptiness explicitly; with the control
    removed, that statement is also the whole of why the call cannot proceed, since no other control can
    add an attribute. Proven by case-simulation-subject-panel-json-view.spec.ts.
- criterion: The subject-type Select still renders the surviving subject-type vocabulary's own options,
    with its own loading and load-error branches intact.
  met: true
  how: The useGlossaryVocabularyOptions("subject-type") read and its Select/loading/error/Retry branches
    are unchanged. Proven by pre-existing case-simulation-subject-panel.spec.ts and case-simulation-subject-panel-json-view.spec.ts
    tests.
- criterion: The requester input, each input's own asking-capability attributions and the malformed-input-schema
    list render as delivered.
  met: true
  how: The requester Input, the per-field capability attribution list and the malformed-input-schema list
    are left unchanged except for the dropped comments. Proven by pre-existing tests in case-simulation-subject-panel.spec.ts
    and case-simulation-subject-panel-malformed-capabilities.spec.ts.
- criterion: The panel's own specs assert the above without reading state.addedAttributes, state.onAddAttribute,
    state.onRemoveAttribute or state.onAttributeChange.
  met: true
  how: case-simulation-subject-panel.test-support.ts, case-simulation-subject-panel-attributes.spec.ts
    and case-simulation-subject-panel-json-view.spec.ts were updated by the test-author to build/drive
    the panel through state.requiredFields alone; none of the four removed members is referenced by any
    panel spec.
nodes:
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: 'The one remaining place this file presents an {attribute, value} pair is state.requiredFields.map:
    each field carries its own attribute name and its own value/onChange, one pair per requirement, with
    no free-text attribute name left enterable.'
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: Each requiredFields entry's attribute, required flag and capabilities are rendered exactly as this
    node names them, sourced from the case-input-requirements read via useSimulationSubject (untouched
    by this task).
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: With the +attribute control removed, state.requiredFields.map is now the panel's only source of
    attribute inputs, required and optional alike, each carrying its own required flag through unchanged
    — the composer has no way left to add an attribute this set does not name.
- node: rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
  encoded_at:
  - src/routes/case-simulation-subject-panel.tsx
  how: The state.requiredFields.length === 0 branch keeps stating the emptiness explicitly, and — now
    that no other control can add an attribute — that same statement is also the whole of why the call
    cannot proceed.
inferences:
- inferred: The pre-existing empty-set disclosure text is left unchanged rather than reworded to add a
    literal sentence about the simulate call's unavailability.
  from: The task's own Notes frame the existing disclosure as "the whole of what it can say" once the
    +attribute workaround is gone, and the node's own description frames the disclosure's job as stating
    the reason the call cannot proceed rather than mandating a separate literal phrase.
preserved:
- The subject-type Select, its options binding, and its loading/error/Retry branches.
- The requester Input and its onRequesterChange wiring.
- One Label+Input per requiredFields entry, with the required flag driving both the asterisk marker and
  the Input's required attribute.
- The per-field asking-capability attribution list.
- The capabilitiesWithMalformedInputSchema list and its surrounding disclosure text.
- The "Required by the connectors:" heading, carried over unchanged per the task's Notes.
- The empty-set disclosure paragraph's wording.
deferred:
- what: Narrowing GlossaryVocabulary to drop "subject-attribute" in use-glossary-vocabulary.ts, and updating
    use-glossary-vocabulary.spec.ts's literal test cases.
  why: Named by the inventory as a separate touch point of the sibling epic, not reached by this task's
    own criteria.
- what: Removing addedAttributes/mergedAttributes/onAddAttribute/onRemoveAttribute/onAttributeChange from
    useSimulationSubject's own state and SimulationSubjectState type in use-simulation-subject.ts.
  why: The task explicitly names this as a sibling task's own work.
- what: case-simulation-ready-view.test-support.ts, listed by the inventory as a touch point of this epic.
  why: Outside the single file this task's delegation named for writing; the sibling hook task reaches
    it.
---

## What it is

The "+ attribute" control, the attribute rows it rendered, the availableAttributeOptions filter and the subject-attribute glossary read, removed from case-simulation-subject-panel.tsx; its own specs and test support updated to drive the panel through case-input-requirements alone.

## Notes

None.
