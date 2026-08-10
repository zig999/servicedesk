---
title: draft-assessment-text consumes the consolidator's output
summary: draft-assessment-text produces its text by calling the assessment-consolidator instead of assembling it directly from evaluations.
objective: draft-assessment-text's produced text is exactly what the assessment-consolidator port returns for the narrowed input and consolidation register it is given.
criteria:
  - The text draft-assessment-text produces equals the consolidator's returned text for the same narrowed input and register.
  - draft-assessment-text imports nothing from the case module, preserving its existing zero-import fitness guarantee.
  - draft-assessment-text receives the consolidation register as an explicit input parameter, never reading it from a case import.
  - The assessment's outcome, referral and determining hypothesis remain exactly what the case's resolve-outcome returned, unaffected by the consolidator call.
  - The assessment exposes only its text to the customer; outcome, referral, verdicts and evidence stay operational-only.
depends_on:
  - task/assessment-consolidation/assessment-consolidator-port-and-fake
  - task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth
rationale: draft-assessment-text is the consumer of both the narrowed-input shape and the consolidator port; the one-seam rule keeps its rework a separate task from the two interfaces it depends on.
implements:
  - domain/investigation/assessment-consolidator
  - domain/knowledge/consolidation-register
  - constraints/consolidation-runs-behind-a-port
  - rules/investigation/the-writing-input-is-narrowed
  - rules/investigation/the-outcome-comes-from-the-case
  - domain/investigation/assessment
  - domain/knowledge/case
sources:
  - intake/scope.md
---

## What it is

draft-assessment-text.ts's template-based text assembly replaced by a call to the assessment-consolidator port.

## Notes

draft-assessment-text-modules.spec.ts's zero-import-of-case.js guarantee must survive this rework unchanged, per the existing fitness test.
REMAINDER, from the specification — rules/investigation/the-writing-input-is-narrowed's clause on what the narrowed input must contain is not answered by this task's criteria: this task takes the narrowed input as an already-given parameter and only bounds what draft-assessment-text's own input must exclude. Belongs to task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth, which assembles it.
REMAINDER, from the specification — rules/investigation/the-customer-sees-only-the-text's clause on what a presenting channel exposes to the end customer is not something this backend, domain-layer task can demonstrate: draft-assessment-text only produces a text value and calls the consolidator port, never touching a response/serialization boundary. Belongs to nowhere in this plan: epic/assessment-consolidation.md declares this node uncovered, since it governs a presenting channel this scope does not build.
REMAINDER, from the specification — constraints/the-domain-depends-on-no-infrastructure is not exercised by any of this task's five criteria, none of which concern infrastructure imports; draft-assessment-text merely calls an already-defined port and does not itself introduce an adapter. Belongs to task/assessment-consolidation/assessment-consolidator-port-and-fake, which introduces the port and its adapter.
