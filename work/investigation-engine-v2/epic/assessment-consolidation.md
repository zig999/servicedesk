---
title: Assessment consolidation
summary: The assessment-consolidator domain service behind its own port, the narrowed writing input it consumes, and the case's optional consolidation register that reaches it.
rationale: These four modules share one reason to change — how the writing stage produces its text once judgment closes — so they sit under one epic rather than being split by which file each touches.
sources:
  - intake/scope.md
covers:
  - domain/investigation/assessment-consolidator
  - domain/knowledge/consolidation-register
  - constraints/consolidation-runs-behind-a-port
  - constraints/the-domain-depends-on-no-infrastructure
  - rules/investigation/the-writing-input-is-narrowed
  - rules/investigation/the-outcome-comes-from-the-case
  - rules/investigation/the-customer-sees-only-the-text
  - domain/investigation/assessment
  - domain/investigation/evaluation
  - domain/investigation/citation
  - domain/investigation/evidence
  - domain/knowledge/case
uncovered:
  - node: rules/investigation/the-customer-sees-only-the-text
    why: "This backend service returns the whole assessment to its caller, per contracts/investigation/diagnosis — the same boundary the closed investigation-engine plan's own assessment-drafting epic already drew for this rule. Every task binding in this epic reached the same conclusion independently — the rule governs what a presenting channel shows the end customer, which no task here, or in epic/diagnose-entry-point, builds."
---

## What it is

assessment-consolidator as a new domain service behind its own port, with a fake adapter mirroring hypothesis-evaluator's own pattern.
resolve-and-narrow-input reworked to the rule's current unconditional-breadth shape, dropping its confirmed/fallback branching.
draft-assessment-text reworked to consume the consolidator's output instead of assembling the text itself.
The case aggregate and its coherence validation admitting an optional consolidation_register.

## Notes

None.
