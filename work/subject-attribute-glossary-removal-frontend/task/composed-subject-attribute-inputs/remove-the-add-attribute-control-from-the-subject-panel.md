---
title: Remove the add-attribute control from the subject panel
summary: The case-simulation subject panel, presenting the pinned case version's own case-input-requirements and nothing beyond them.
rationale: The panel, its test support and its two specs are one task because the control, the attribute rows, the availableAttributeOptions filter and the subject-attribute glossary read are one control's whole surface, and the attributes and json-view specs both assert on that same rendered surface. Separate from the hook's state removal because the panel consumes SimulationSubjectState — changing the state's shape and its consumer in one breath is the seam the four tests forbid.
sources:
- intake/scope.md
objective: The case-simulation subject panel offers exactly one input per requirement the pinned case version's case-input-requirements name, and no way to name any other attribute.
criteria:
- The subject panel renders no "+ attribute" control.
- The subject panel renders no attribute row carrying its own Attribute select, Value input and Remove attribute button.
- The panel issues no glossary read for the vocabulary "subject-attribute", and neither a subject-attribute loading message nor a subject-attribute load-error message with its Retry control is reachable.
- The panel's attribute inputs are exactly one per requirement named by the case-input-requirements read, required and optional alike, each carrying that requirement's own required flag through unchanged.
- Where the read names no requirement at all, the panel still states that emptiness explicitly to the person composing the subject and that the simulate call is unavailable in that state, and the panel offers them no other way to name an attribute.
- The subject-type Select still renders the surviving subject-type vocabulary's own options, with its own loading and load-error branches intact.
- The requester input, each input's own asking-capability attributions and the malformed-input-schema list render as delivered.
- The panel's own specs assert the above without reading state.addedAttributes, state.onAddAttribute, state.onRemoveAttribute or state.onAttributeChange.
implements:
- domain/investigation/subject-attribute-value
- domain/knowledge/case-input-requirement
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
---

## What it is
The "+ attribute" control, the rows it added, the availableAttributeOptions filter and the subject-attribute glossary read all leave case-simulation-subject-panel.tsx.
Its test support and its attributes and json-view specs stop driving the panel through the removed control and assert the requirement-derived inputs alone.

## Notes
This task removes the panel's only way around an empty requirement set, which is what makes the empty-set disclosure already in the panel the whole of what it can say in that state.
ADVISORY, from the specification — criterion 6 (subject-type Select survives) rests on domain/glossary/subject-type and domain/investigation/subject, neither in this epic's covers; a non-regression guard on already-delivered behavior, not a new claim.
ADVISORY, from the specification — criterion 7 (requester input, capability attributions, malformed-input-schema list) rests on rules/investigation/a-simulation-carries-its-requester, rules/investigation/a-composed-subjects-input-names-every-capability-that-asks-for-it and rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability, none in this epic's covers; a non-regression guard, not a new claim. The panel's own capability.inputSchemaHint rendering is display guidance domain/knowledge/case-input-requirement itself places outside what the specification states, so "as delivered" is its only authority.
Decision, beyond the covers — stand: domain/glossary/subject-type, domain/investigation/subject, rules/investigation/a-simulation-carries-its-requester, rules/investigation/a-composed-subjects-input-names-every-capability-that-asks-for-it and rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability each govern pre-existing, unaffected behavior this task's own criteria only guard against regression; none is a fact this task's claim needs held against it.
REMAINDER, from the specification — rules/glossary/a-glossary-read-by-an-unheld-name-is-refused reaches no criterion of this task despite grounding criterion 3's removed read; its constrains list no longer names any subject-attribute vocabulary and states nothing about this criterion. Belongs to: the already-delivered backend published glossary read.
REMAINDER, from the specification — rules/investigation/a-subject-holds-one-value-per-attribute reaches no criterion of this task; this task only removes the surface through which a duplicate could be named. Belongs to: the sibling task removing addedAttributes/mergedAttributes from useSimulationSubject, and the already-delivered backend assembly.
Decision, beyond the covers — stand: the panel's existing "Required by the connectors:" heading is carried over unchanged for both required and optional requirements alike, a pre-existing wording this task's own criteria do not reach and does not introduce.
This task delivers case-simulation-subject-panel.tsx whole under the project's no-comments rule; its existing prose comments (doNotChangeSubjectType note, the required-flag-marker rationale block) are dropped by the rewrite, not refreshed.
