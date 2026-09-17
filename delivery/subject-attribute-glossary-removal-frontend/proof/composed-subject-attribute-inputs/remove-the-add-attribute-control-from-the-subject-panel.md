---
target: frontend
title: Proof for removing the add-attribute control from the subject panel
summary: Proves the composed subject panel offers exactly one input per case-input-requirement and no
  other way to name an attribute, by asserting the removed control's absence, the dropped subject-attribute
  glossary read, and the pre-existing empty-set disclosure and pass-through rendering.
implementation: sha256:4f460ddc02dabf889a9ea9436307c3ad7f64703be2da10b8adb53d761d63163d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-reduction-tab-removal-panel-removal-suite-2
tests:
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: renders no '+ attribute' control
  proves: The subject panel renders no "+ attribute" control.
  fails_when: an implementation that renders a button labelled "+ attribute" anywhere in the panel
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: renders none of an attribute row's own Attribute select, Value input or Remove-attribute button
  proves: The subject panel renders no attribute row carrying its own Attribute select, Value input and
    Remove attribute button.
  fails_when: an implementation that renders any of the row's three constituent controls anywhere in the
    panel
- file: src/routes/case-simulation-subject-panel-attributes.spec.ts
  name: issues no fetch to the subject-attribute vocabulary and renders neither its loading nor its load-error
    message
  proves: The panel issues no glossary read for the vocabulary "subject-attribute", and neither a subject-attribute
    loading message nor a subject-attribute load-error message with its Retry control is reachable.
  fails_when: an implementation that still calls useGlossaryVocabularyOptions("subject-attribute") or
    renders its loading/error text
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: states, in the rule's own terms, that the pinned case version's own case-input-requirements name
    no attribute
  proves: criterion 5's emptiness-disclosure half.
  fails_when: an implementation that renders a bare empty list or a different, generic contentless placeholder
    when state.requiredFields is empty
  demonstrates: rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: renders a labeled input for a required requirement and for an optional one, neither filtered out
  proves: The panel's attribute inputs are exactly one per requirement named by the case-input-requirements
    read, required and optional alike, each carrying that requirement's own required flag through unchanged.
    (pre-existing, unmodified by this task)
  fails_when: an implementation that renders more or fewer inputs than the requirement count, or drops/misassigns
    a requirement's own required flag
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: renders no disabled control anywhere in the panel while a required requirement is left empty
  proves: the required marking never becomes a client-side dispatch-blocking gate, and (as fixed by this
    delivery) tolerates the panel now legitimately rendering zero buttons.
  fails_when: any control in the panel is disabled while a required requirement is left empty
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: renders the Type field as a combobox, never a free-text input; offers exactly the subject-type
    vocabulary's own current terms as options
  proves: criterion 6 (ADVISORY non-regression guard, pre-existing, unmodified by this task).
  fails_when: the Type field stops being a glossary-drawn combobox or stops offering the subject-type
    vocabulary's own current terms
- file: src/routes/case-simulation-subject-panel-json-view.spec.ts
  name: shows a loading message while the subject-type vocabulary is still loading; shows a load-error
    message with a Retry control when the subject-type vocabulary fails to load, and Retry re-issues the
    request
  proves: criterion 6's loading/error-branch half (ADVISORY non-regression guard, pre-existing, unmodified
    by this task).
  fails_when: the subject-type loading or load-error branch stops rendering, or Retry stops re-issuing
    the request
- file: src/routes/case-simulation-subject-panel.spec.ts
  name: shows state.requester as the Requester field's own value; shows a single asking capability's own
    connector, name and version
  proves: criterion 7's requester and capability-attribution halves (ADVISORY non-regression guard, pre-existing,
    unmodified by this task).
  fails_when: the Requester field stops reflecting state.requester, or a capability's connector/name/version
    stops being shown
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: shows a single malformed capability's own name and version
  proves: criterion 7's malformed-input-schema-list half (ADVISORY non-regression guard, pre-existing,
    unmodified by this task).
  fails_when: the malformed-capability list stops disclosing a capability's own name and version
not_applicable:
- edge_case: a hook state where useSimulationSubject still returns non-empty addedAttributes/onAddAttribute/onRemoveAttribute/onAttributeChange,
    rendered through this panel
  why: criterion 8 forbids the panel's own specs from referencing those fields at all; the removal in
    the panel is structural, so exercising this as a state-dependent edge case would require writing exactly
    the reference the criterion prohibits
- edge_case: two required fields sharing the same attribute name, or a name also present in the hook's
    still-live addedAttributes state, producing a duplicate attribute
  why: no criterion of this task and neither node it implements addresses one-value-per-attribute; the
    task's own Notes place that rule's coverage on the sibling hook-removal task
- edge_case: the simulate call's own disabled/enabled affordance rendered inside this panel when the requirement
    set is empty
  why: the panel renders no simulate control of its own — isReady is computed by useSimulationSubject
    and consumed outside the files this task touches
untested:
- 'domain/investigation/subject-attribute-value: no finite test in the panel''s own specs decides this
  value-object''s fact whole; that shape is assembled by mergedAttributes inside use-simulation-subject.ts,
  outside the files this task''s implementation touched.'
- 'domain/knowledge/case-input-requirement: its compound fact is proven only in pieces, split across several
  pre-existing tests, none asserting the whole compound statement at once.'
- 'rules/investigation/a-composed-subject-presents-every-case-input-requirement: its ''one input per requirement''
  half is proven only in pieces; its ''only a required flag gates the call'' half concerns a door-level
  refusal this panel component does not itself enact.'
---

## What it is

Ten tests (three new, seven pre-existing and left standing or lightly repaired) proving every testable criterion of task/composed-subject-attribute-inputs/remove-the-add-attribute-control-from-the-subject-panel.

## Notes

None.
