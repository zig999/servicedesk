---
target: frontend
title: Compose the simulation subject from case-input-requirements alone
summary: use-simulation-subject.ts no longer holds curator-added-attribute state; the composed subject's
  attributes come solely from requiredFields' non-empty inputs, first-recorded-wins per attribute name.
task: sha256:1f4b822f796715a11766ccb32f09dcad335d4b0f58a2bee3f44f8d085475310c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-union-compose-subject-hook-suite-2
files:
- path: src/hooks/use-simulation-subject.ts
  effect: Removed addedAttributes, nextRowIdRef, onAddAttribute/onRemoveAttribute/onAttributeChange and
    mergedAttributes from SimulationSubjectState. Added composedAttributes(requiredFields), which builds
    the attribute map from requiredFields alone, skipping a field whose trimmed value is empty and skipping
    a field whose attribute name is already present (first-recorded-wins). Replaced the SubjectAttributeRow/SubjectAttributeValue
    import from use-test-connector-panel.ts with a new local SimulationSubjectAttribute type. isReady's
    formula is unchanged, now reading only off composedAttributes' output.
- path: src/hooks/use-simulation-subject.spec.ts
  effect: Updated to assert the removed members are absent, the composed-attributes pairing, the empty-input-contributes-nothing
    rule and the first-recorded-wins duplicate rule, through requiredFields alone.
- path: src/hooks/use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
  effect: Updated to drive readiness/dispatch-hold through requirement inputs alone, still asserting the
    dispatch hold and the required flag's own pass-through, with no call to a removed member.
- path: src/hooks/use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts
  effect: Updated to drive the cockpit's own subject through requirement inputs alone, still asserting
    the simulate/simulate-hypothesis dispatch is not refused by the required field's own empty input.
- path: src/routes/case-simulation-subject-panel.test-support.ts
  effect: Removed the now-nonexistent addedAttributes/onAddAttribute/onRemoveAttribute/onAttributeChange
    fields from baseState's SimulationSubjectState fixture (needed once use-simulation-subject.ts's real
    type dropped them).
criteria:
- criterion: SimulationSubjectState exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange
    member.
  met: true
  how: All four are removed from the type and from the returned object. Proven by use-simulation-subject.spec.ts.
- criterion: The composed subject's attributes are exactly the requirement inputs holding a non-empty
    value, one attribute-value pair each, paired as an attribute name with the value it holds.
  met: true
  how: composedAttributes iterates requiredFields only, skips empty-trimmed values, and maps each surviving
    field to {attribute, value}. Proven by use-simulation-subject.spec.ts.
- criterion: The composed subject carries at most one value per attribute name; where two requirement
    inputs name the same attribute, the value of the one recorded first stands and the later one's value
    is dropped.
  met: true
  how: attributeMap.has(field.attribute) check skips a later field naming an attribute already in the
    map. Proven by use-simulation-subject.spec.ts.
- criterion: A requirement whose input is empty contributes no attribute-value pair to the composed subject.
  met: true
  how: The emptiness check skips the field before it reaches the map, per rules/investigation/an-empty-attribute-input-is-no-attribute-value.
    Proven by use-simulation-subject.spec.ts.
- criterion: isReady is true exactly when the requester is non-empty and the composed subject carries
    at least one attribute-value pair.
  met: true
  how: isReady = requester.trim() !== "" && subject.attributes.length > 0, unchanged, now driven by composedAttributes'
    output. Proven by use-simulation-subject.spec.ts.
- criterion: The requiredFields, capabilitiesWithMalformedInputSchema, requester, isLoadingRegistries
    and isRegistriesError members are unchanged, and the case-input-requirements read they derive from
    is not modified.
  met: true
  how: useCaseInputRequirements, useCapabilities and deriveSubjectFields are untouched. Proven by the
    pre-existing use-simulation-subject.spec.ts tests, left standing.
- criterion: The hook's own specs and both missing-requirement specs drive readiness and dispatch-hold
    through requirement inputs alone, with no call to a removed member, and still assert the dispatch
    hold they asserted before.
  met: true
  how: All three spec files were updated to reference requiredFields alone. Proven by use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts
    and use-case-simulation-cockpit-hold-dispatch-open-for-missing-requirement.spec.ts.
- criterion: 'The { type, attributes: [{ attribute, value }] } shape reaching use-simulate-case and use-simulate-hypothesis
    is field-for-field unchanged.'
  met: true
  how: SimulationSubject's field shape is untouched — only the attribute-list element's type name changed
    (SubjectAttributeValue to local SimulationSubjectAttribute), never its fields; use-simulate-case.ts
    and use-simulate-hypothesis.ts each keep their own separate local alias. Preserved by the pre-existing,
    unmodified use-case-simulation-cockpit-gating.spec.ts.
- criterion: SubjectAttributeRow stays defined in use-test-connector-panel.ts serving that panel's own
    placeholder-derived rows, and its row-reconciliation helper there is untouched.
  met: true
  how: use-test-connector-panel.ts was not opened for edit; only use-simulation-subject.ts's import was
    removed. Preserved by the pre-existing, unmodified use-test-connector-panel.spec.ts.
- criterion: case-simulation-ready-view.test-support.ts composes its subject fixture without naming any
    removed member.
  met: true
  how: 'Confirmed by direct reading and grep: the file names none of onAddAttribute, addedAttributes,
    onRemoveAttribute or onAttributeChange; no edit was needed.'
nodes:
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: The attribute-value pair the composed subject carries is now exactly {attribute, value} produced
    by composedAttributes from a non-empty requirement input, with no curator-added source.
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: requiredFields (built from case-input-requirements) is the sole source composedAttributes reads.
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: requiredFields still presents one input per case-input-requirement and nothing beyond that set;
    this task only changed how the subject's attributes are derived from those inputs.
- node: rules/investigation/a-subject-holds-one-value-per-attribute
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: attributeMap.has(field.attribute) keeps the map to one value per attribute name, first-recorded-wins.
- node: rules/investigation/an-empty-attribute-input-is-no-attribute-value
  encoded_at:
  - src/hooks/use-simulation-subject.ts
  how: composedAttributes skips any requiredField whose trimmed value is empty before it can occupy a
    place in the attribute map.
inferences:
- inferred: The removed attribute-value pair type is named SimulationSubjectAttribute, a new local type
    alias, rather than continuing to import SubjectAttributeValue from use-test-connector-panel.ts.
  from: The task's own instruction to stop importing that type, combined with the inventory's documented
    convention that this composed-subject shape is already repeated with a separate local type alias per
    hook.
- inferred: A whitespace-only requirement input is treated as empty (field.value.trim() === ""), extending
    'empty' beyond a literally-empty string.
  from: The specification's standing empty-string idiom applied elsewhere (rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
    and the connector-name reading it transfers from); no criterion or the new node itself states this
    explicitly, so it is disclosed here as an inference rather than a pinned fact.
preserved:
- requiredFields' own derivation (deriveSubjectFields over case-input-requirements and capabilities),
  and its per-field value/onChange wiring.
- capabilitiesWithMalformedInputSchema, requester/onRequesterChange, isLoadingRegistries, isRegistriesError.
- 'The { type, attributes: [{ attribute, value }] } field shape of SimulationSubject.'
- SubjectAttributeRow, SubjectAttributeValue and reconcileAttributeRows in use-test-connector-panel.ts.
---

## What it is

The addedAttributes state, its row handlers and the mergedAttributes merge, removed from useSimulationSubject; the subject is now composed from requiredFields alone.

## Notes

None.
