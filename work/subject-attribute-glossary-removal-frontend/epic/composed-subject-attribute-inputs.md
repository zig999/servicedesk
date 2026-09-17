---
title: Composed subject attribute inputs
summary: What the case-simulation interface offers a person composing a subject, once the case version's own case-input-requirements are the whole of it.
rationale: The scope left this cut to the inventory and binding steps, and I separate it from the vocabulary reduction because nothing about the glossary vocabulary governs whether an operator may freely add an attribute name — the panel's "+ attribute" control answers to what the interface may present, and would have to go even if the vocabulary had stayed.
sources:
- intake/scope.md
covers:
- domain/investigation/subject-attribute-value
- domain/knowledge/case-input-requirement
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
- rules/investigation/a-subject-holds-one-value-per-attribute
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- rules/investigation/an-empty-attribute-input-is-no-attribute-value
uncovered:
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  why: Both of this node's refusal clauses (term-not-held, concept-not-held) reach no task of this epic; the panel task only removes the read the control issued, and the hook task never issued one. The refusals themselves belong to the already-delivered backend published glossary read.
---

## What it is
The case-simulation subject panel's "+ attribute" control, the attribute rows it rendered, and the addedAttributes/mergedAttributes state in useSimulationSubject that fed them.
After this epic the panel presents one input per named requirement and nothing else, and the composed subject is assembled from those inputs alone.

## Notes
This epic also covers a-glossary-read-by-an-unheld-name-is-refused because the panel itself issues a subject-attribute glossary read that goes with the control, which is shared scope with the vocabulary-reduction epic rather than a second claim on the same work.
The already-delivered case-input-requirements coverage gate is the named consumer every task here verifies against and none extends.
