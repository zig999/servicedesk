---
title: remove-concept, refused where anything still names the concept
summary: The glossary's own remove-concept, removing a concept by name unless a registered capability
  answers it, a collected evidence item or its citation names it, or a hypothesis-revision's collects
  lists it.
rationale: 'The guard and the removal are one task on purpose: they are the two branches of one rule statement,
  and a task delivering the removal without the guard would have criteria the guard task then falsifies.
  Cut between the store and the route because it consumes the store port and the reader port and is the
  route''s dependency.'
sources:
- intake/scope.md
depends_on:
- task/concept-removal/concept-store-delete
- task/cross-context-usage-reads/concept-usage-reader
objective: The glossary removes a concept by name unless a registered capability answers it, a collected
  evidence item or an evaluation citation names it, or a hypothesis-revision's collects lists it.
criteria:
- Where nothing answers, records, cites or collects the name, this rule does not refuse the removal, and
  a subsequent read of the glossary by that name answers as the specification already states it answers
  for a name the glossary does not hold.
- Where a registered capability answers the concept, the operation refuses the removal.
- Where a collected evidence item names the concept, the operation refuses the removal.
- Where an evaluation citation names the concept and no collected evidence item names it, the operation
  refuses the removal.
- Where a hypothesis-revision's own collects lists the concept and no case version manifests that revision,
  the operation refuses the removal.
- Where the operation refuses, the concept is still held in the glossary afterwards.
- Where the operation refuses, it does so before any delete statement is issued, so no database constraint
  violation reaches the caller in place of the refusal.
- The refusal is raised as a domain error of its own, distinct from every error already raised by registering
  a concept.
- The guard obtains all four answers through the concept usage reader port, the glossary reading no capability,
  case or investigation store directly.
reference:
- inventory/refusal-guard-rule-evidence.md
- src/src/glossary/glossary.service.ts
- src/src/errors/concept-already-answered.error.ts
- src/src/errors/manifest-would-hold-no-hypothesis.error.ts
implements:
- contracts/glossary/glossary-authoring
- domain/glossary/concept
- rules/glossary/a-registered-concept-is-never-removed
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
---

## What it is
The glossary operation the published contract names, with the four refusal conditions its governing rule states.
It is the one operation that ever removes a registered concept at all; registering a batch of concepts still removes none the batch does not mention.

## Notes
ADVISORY, from the specification — re-bind confirmation: the rule now names the refusal's own error, HTTP 409 ConceptInUseError; criterion 8 is backed as written.
UNDERDETERMINED, from the specification — no criterion excludes an implementation that raises ConceptInUseError but leaves it absent from the route layer's status map, so the caller would receive the generic HTTP 500 INTERNAL_ERROR instead of the stated 409.
UNDERDETERMINED, from the specification — the rule's closing clause (a concept's removal takes its own accepts declaration with it and removes no term of the subject-type vocabulary) reaches no criterion of this task; the fact is settled at the store task this operation consumes, but nothing here holds the operation itself to preserving it end to end.
REMAINDER, from the specification — the rule's registering clause (adding or replacing a concept, removing nothing a batch does not mention) belongs to the register-concept operation, not this remove-concept task.
ADVISORY, from the specification — criterion 1's post-removal read defers to rules/glossary/a-glossary-read-by-an-unheld-name-is-refused, outside this task's candidate set; demonstrated against that neighboring node.
ADVISORY, from the specification — criterion 1's success answer defers to constraints/a-successful-concept-removal-answers-with-no-content, outside this task's candidate set; the epic's covers hold it for the route task instead.
ADVISORY, from the specification — criterion 9's named port is implementation structure constraints/the-domain-depends-on-no-infrastructure already requires without naming; the single-port shape is this task's own design, per the reader task it depends on.
