---
title: The evaluator port and its prompt carry the snapshotted semantics
summary: EvidenceItem widens to carry each item's own snapshotted field semantics
  and concept description, and the production prompt renders them inside the closed
  data block.
rationale: Kept apart from judgment-stage's own removal of the live registry read
  because this task's own reason to change is what the port and the prompt carry,
  demonstrable by calling evaluate() directly against hand-built EvidenceItem fixtures,
  before anything upstream is rewired to stop reading the registry.
sources:
- intake/scope.md
objective: One evaluate() call's evidence, and the prompt built from it, carry each
  item's own snapshotted field semantics and concept description in place of a bare
  field-name list.
criteria:
- EvidenceItem carries each item's own snapshotted field semantics (name, and type
  and description where declared) and its concept's own snapshotted description.
- The judgment prompt's evidence block names, for each item, its own field semantics
  and its concept's own description, inside the closed data block.
- The judgment prompt's evidence block for an item whose concept_description is empty
  names that item by its concept alone, with no stated meaning.
- Prompt assembly remains a pure function of exactly the criterion, the evidence's
  own snapshotted semantics, and the pinned case's title and when_to_use.
- The project's configured PROMPT_VERSION value for judgment differs from its value
  before this change.
depends_on:
- task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics
implements:
- domain/investigation/hypothesis-evaluator
- constraints/the-judgment-prompt-is-closed
- rules/investigation/judgment-reads-the-evidence-snapshot
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
---

## What it is
hypothesis-evaluator.port.ts's EvidenceItem gains the snapshotted field semantics and concept description in place of the bare declared-field list.
anthropic-hypothesis-evaluator.adapter.ts's SYSTEM_PROMPT and prompt-assembly functions extend to render them, and fake-hypothesis-evaluator.adapter.ts's own type carries the same shape.
The configured PROMPT_VERSION for the judgment call changes.

## Notes
None.
