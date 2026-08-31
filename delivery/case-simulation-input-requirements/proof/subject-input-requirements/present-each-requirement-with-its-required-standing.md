---
title: Proof that every requirement's input carries its own required standing and every asking capability
summary: CaseSimulationSubjectPanel's requirement-rendering block is proved against required/optional
  marking, every asking capability's own identity and input-schema hint, the explicit empty state, and
  that the panel recomputes nothing of its own.
implementation: sha256:6863b3b4b19510325c7845bfceec1f9004f82933c4059cb15f8230eb62f528c6
run: run/subject-input-requirements-derive-and-present-suite-2
tests:
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- an input is rendered for every requirement the state exposes, required
    and optional alike (criterion 1) > renders a labeled input for a required requirement and for an optional
    one, neither filtered out
  proves: criterion 1 -- an input is rendered for every requirement the state exposes, required and optional
    alike.
  fails_when: an optional or a required requirement is filtered out of the rendered rows.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- a required requirement's own input is shown as required (criterion
    2) > carries the native required attribute, and a visible asterisk on its own label
  proves: criterion 2 -- a required requirement's own input is shown as required where it is rendered.
  fails_when: a required field's input lacks the native required attribute, or no visible asterisk marker
    is rendered for it.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- an optional requirement's own input is rendered without that marking
    (criterion 3) > carries no required attribute and no asterisk
  proves: criterion 3 -- an optional requirement's own input is rendered without that marking.
  fails_when: an optional field's input carries the required attribute, or an asterisk renders for it.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- a required marking never becomes a client-side dispatch-blocking
    gate (UNDERDETERMINED) > renders no disabled control anywhere in the panel while a required requirement
    is left empty
  proves: the task's own UNDERDETERMINED note -- the composed subject's own required marking must not
    disable or block either dispatch while a required input is empty.
  fails_when: any control in the panel carries the disabled attribute while a required field is empty.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- every asking capability for a requirement is shown by its own name,
    version and connector, never only one (criterion 4) > shows a single asking capability's own connector,
    name and version / shows every one of two or more asking capabilities, each with its own name, version
    and connector / renders no capability list under a requirement whose own capabilities array is empty
  proves: criterion 4's own capability-identity clause -- each requirement's input shows every asking
    capability's own name, version and connector the state exposes for it, never only the first.
  fails_when: only the first of two or more capabilities is rendered, or a capability's own name, version
    or connector is dropped or swapped with another's.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- a capability's own input-schema hint, where present, is shown verbatim
    next to it (criterion 4) > shows the hint text verbatim next to its own capability / shows no hint
    text for an empty or whitespace-only inputSchemaHint / shows each capability's own hint only, never
    mixed with another capability's
  proves: criterion 4's own input-schema-hint clause -- the input-schema text the state already carries
    for a capability is shown where the state carries one, verbatim, and only beside its own capability.
  fails_when: a hint is shown for an empty or whitespace-only inputSchemaHint, or one capability's hint
    appears attached to a sibling capability's entry.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- a pinned version whose read names no requirement at all renders
    an explicit empty state rather than a bare empty list (criterion 5, UNDERDETERMINED) > states, in
    the rule's own terms, that the pinned case version's own case-input-requirements name no attribute
  proves: criterion 5 and its own UNDERDETERMINED note -- an empty requiredFields read renders the rule's
    own explicit wording rather than a generic contentless placeholder, and renders zero list items.
  fails_when: the panel renders a bare empty list with no explanatory text, or renders text other than
    the rule's own closing wording.
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: CaseSimulationSubjectPanel -- the panel recomputes no requirement, no required flag and no annotation,
    reading each from the state it is passed (criterion 6) > renders requirements in the order the state
    gives them, each with its own required marking held independently of the others
  proves: criterion 6 -- the panel performs no filtering, mapping-to-a-new-shape or derivation of its
    own; two requirements in a given order render in that order, each carrying only its own required marking.
  fails_when: the rendered order differs from the state's own order, or one requirement's required marking
    leaks onto a sibling's row.
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: CaseSimulationSubjectPanel -- loading and error states passed through from the composed hook (disclosed
    inference, EDG-01/EDG-02) > does not render the required-fields list at all while the registries are
    still loading
  proves: the pre-existing isLoadingRegistries/isRegistriesError branches wrapping the requirement list
    are preserved unchanged by this task's rewrite of the block they wrap.
  fails_when: a requirement row or the empty-state text renders while state.isLoadingRegistries is true.
not_applicable:
- edge_case: a requirement whose capabilities array holds more than two entries mixing empty and non-empty
    input-schema hints
  why: the two-capability, non-empty-vs-empty case already proved (each capability's own hint only, never
    mixed with another's) is the general case for any count above one; a third entry exercises the same
    per-entry mapping with no new branch.
- edge_case: a native form submission blocked by the required attribute
  why: confirmed by inference (this task's own delivery record) that no <form> wraps the panel or the
    Simulate control anywhere in this tree, so the required attribute has no submission to block; proving
    a non-existent form's behavior would assert nothing about this codebase.
untested:
- whether a screen reader's own accessible-name computation announces the asterisk as part of or apart
  from the label text -- this proof confirms only that getByLabelText resolves to the bare attribute name
  in jsdom/testing-library's own textContent-based algorithm, not real assistive-technology behavior.
---

## What it is
Proof that the Subject panel's requirement rows show every requirement's required standing and every asking capability's own identity, sourced entirely from the state the hook composes.

## Notes
None.
