---
title: Compose the subject from case-input-requirements alone
summary: useSimulationSubject's returned state and the composed subject it builds, holding only what the requirement inputs supply.
rationale: The hook, its two specs, the cockpit's missing-requirement spec and the ready-view test support are one task because all four name the same removed members of SimulationSubjectState and the merge that consumed them — split, the state shape would be correct in one file and driven from the removed members in another. Builds on the panel's task rather than containing it, because the panel is this state's consumer and the one seam rule puts the interface and its consumer in separate tasks.
sources:
- intake/scope.md
objective: The composed simulation subject is assembled from the case-input-requirements' own inputs alone, and SimulationSubjectState exposes no curator-added attribute state.
criteria:
- SimulationSubjectState exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange member.
- The composed subject's attributes are exactly the requirement inputs holding a non-empty value, one attribute-value pair each, paired as an attribute name with the value it holds.
- The composed subject carries at most one value per attribute name; where two requirement inputs name the same attribute, the value of the one recorded first stands and the later one's value is dropped.
- A requirement whose input is empty contributes no attribute-value pair to the composed subject.
- isReady is true exactly when the requester is non-empty and the composed subject carries at least one attribute-value pair.
- The requiredFields, capabilitiesWithMalformedInputSchema, requester, isLoadingRegistries and isRegistriesError members are unchanged, and the case-input-requirements read they derive from is not modified.
- The hook's own specs and both missing-requirement specs drive readiness and dispatch-hold through requirement inputs alone, with no call to a removed member, and still assert the dispatch hold they asserted before.
- "The { type, attributes: [{ attribute, value }] } shape reaching use-simulate-case and use-simulate-hypothesis is field-for-field unchanged."
- SubjectAttributeRow stays defined in use-test-connector-panel.ts serving that panel's own placeholder-derived rows, and its row-reconciliation helper there is untouched.
- case-simulation-ready-view.test-support.ts composes its subject fixture without naming any removed member.
depends_on:
- task/composed-subject-attribute-inputs/remove-the-add-attribute-control-from-the-subject-panel
implements:
- domain/investigation/subject-attribute-value
- domain/knowledge/case-input-requirement
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-subject-holds-one-value-per-attribute
- rules/investigation/an-empty-attribute-input-is-no-attribute-value
---

## What it is
The addedAttributes state, the nextRowId reference, the three row handlers and the mergedAttributes merge leave use-simulation-subject.ts, and the subject is built from requiredFields alone.
The hook's two specs, the cockpit's own missing-requirement spec and the ready-view test support stop driving the removed members and keep asserting the readiness and dispatch-hold behaviour that was always the requirements gate's own.

## Notes
The composed-subject shape is repeated with a local type alias in three hooks rather than shared from one place, so this task is held to keeping the attribute/value field contract intact for consumers that do not import the type being changed.
SubjectAttributeValue and SubjectAttributeRow live in the connector-test panel's own module; this task stops the simulation hook importing the row type without removing either type.
REMAINDER, from the specification — the third clause of rules/investigation/a-composed-subject-presents-every-case-input-requirement (only a required flag, never mere presence, gates whether an input blocks the call) reaches no criterion of this task, whose readiness criterion gates on the requester and on at least one attribute-value pair without reading a required flag. Belongs to: the already-delivered task holding the simulate dispatch open for a missing requirement, for simulate; the diagnose-composing interface is untouched by this initiative.
ADVISORY, from the specification — four criteria rest on nodes outside this epic's covers, each already-delivered and preserved rather than reclaimed here: the requester's non-emptiness is rules/investigation/a-simulation-carries-its-requester; "at least one attribute-value pair" is rules/investigation/a-subject-carries-at-least-one-attribute; the payload's own `type` field is domain/investigation/subject; keeping SubjectAttributeRow in use-test-connector-panel.ts is rules/integration/a-connector-configuration-is-tested-through-a-registered-capability.
Decision, beyond the covers — stand: rules/investigation/a-simulation-carries-its-requester, rules/investigation/a-subject-carries-at-least-one-attribute, domain/investigation/subject and rules/integration/a-connector-configuration-is-tested-through-a-registered-capability each govern pre-existing, unaffected behavior this task's own criteria only guard against regression; none is a fact this task's claim needs held against it.
Decided during planning — rules/investigation/an-empty-attribute-input-is-no-attribute-value, a new invariant, closes the specification's own silence over criterion 4 (an empty requirement input contributes no attribute-value pair); logged at knowledge/decision-log.md.
ADVISORY, from the specification — rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set is in the epic's covers but governs no criterion of this task; its coverage rests on the sibling panel task, not this hook.
ADVISORY, from the specification — case-simulation-ready-view.test-support.ts still stubs the retired GLOSSARY_SUBJECT_ATTRIBUTE_PATH fetch handler; no criterion of this task reaches that leftover stub, and rules/glossary/a-glossary-read-by-an-unheld-name-is-refused (which the epic covers for that read) likewise reaches no criterion here.
