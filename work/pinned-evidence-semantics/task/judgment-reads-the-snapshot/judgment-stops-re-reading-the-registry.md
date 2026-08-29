---
title: Judgment stops re-reading the capability registry
summary: Citation validation checks a field against its own cited evidence item's
  snapshot, and judgment-stage no longer resolves capabilities to judge a hypothesis.
rationale: Cut apart from the port/prompt task because this is the seam that removes
  judgment's own live dependency on the capability registry — citation-validation.ts
  and judgment-stage.ts change together for that one reason, with investigation-pipeline.ts's
  own one-line wiring following as the same seam's internal consumer, not a second
  one.
sources:
- intake/scope.md
objective: A hypothesis is judged, and its citations checked, using only its evidence's
  own snapshotted semantics — never a live read of the capability registry.
criteria:
- A citation's field is accepted only where it exists among its own cited evidence
  item's own snapshotted fields, never resolved through a live capability-registry
  read.
- judgeHypotheses judges a hypothesis without taking a capability-registry dependency.
- A capability re-registered at the same name and version after an evidence item was
  collected against it does not change what a judgment already computed against that
  item sees.
depends_on:
- task/judgment-reads-the-snapshot/evaluator-port-and-prompt-carry-snapshotted-semantics
- task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics
implements:
- domain/investigation/citation
- domain/investigation/hypothesis-evaluator
- constraints/the-judgment-prompt-is-closed
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/judgment-reads-the-evidence-snapshot
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
---

## What it is
citation-validation.ts's field-existence check reads a cited evidence item's own snapshotted fields, dropping the live-resolved output-schema map.
judgment-stage.ts drops its own outputSchemasFor()/ICapabilityQuery read and builds EvidenceItem and the citation context straight from the evidence.
investigation-pipeline.ts stops threading a capability-registry dependency into judgeHypotheses.

## Notes
REMAINDER, from the specification — rules/investigation/judgment-reads-the-evidence-snapshot's statement has two clauses (never re-reads the glossary; never re-reads the capability registry). This task's criteria answer only the capability-registry half; the glossary half is answered by task/judgment-reads-the-snapshot/evaluator-port-and-prompt-carry-snapshotted-semantics, which already implements scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone.
