---
title: unavailableEvidence reports the rule's own error name
summary: evidence-collection-stage.ts's unavailableEvidence() reports CapabilityNotResolvedForObservationError as its result_detail for a concept nothing currently answers, instead of a free-text sentence.
objective: A concept no registered capability currently answers is recorded with the same result_detail rules/integration/an-unresolvable-observation-ends-unavailable requires for this scenario — the reported error's own class name — regardless of which of the two paths that reach it (the collection stage's own pre-check, or observe-concept's own later resolution) records it.
criteria:
  - Given a case whose collection plan names a concept no registered capability currently answers, the Evidence unavailableEvidence() records for it carries result_detail exactly equal to "CapabilityNotResolvedForObservationError".
  - Given the same scenario reached through the collection stage's own pre-check (capabilities.readCapability(concept) resolving unheld before observe-concept is ever called), the recorded result_detail is identical, character for character, to what http-declarative-observation-source.adapter.ts's own resolveCapability path already records for the same condition.
rationale: A corrective increment answering to no criterion any task holds — the divergence was found by siegard-reconcile/backend-post-corrections-code-drift.md's judgment over evidence-collection-stage.ts, reconciling delivered code against the specification rather than any task's own criteria.
implements:
  - rules/integration/an-unresolvable-observation-ends-unavailable
sources:
  - intake/2026-08-26-evidence-collection-stage-result-detail-fix.md
---

## What it is

A corrective increment: one wrong behavior observed by reconciling delivered code against the specification, answering to no criterion of any task under this initiative's own plan.

## Notes

None.
