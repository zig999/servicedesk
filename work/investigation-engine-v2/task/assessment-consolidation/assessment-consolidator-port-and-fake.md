---
title: assessment-consolidator behind its own port
summary: The consolidate operation, behind a port with a fake adapter, mirroring hypothesis-evaluator's own port-plus-adapter pattern.
objective: A consolidate operation exists behind an assessment-consolidator port, with a fake adapter for tests, returning the assessment's text alone from every required hypothesis's evaluation, the evidence their citations name, and the case's consolidation register.
criteria:
  - The port's consolidate operation takes every required hypothesis's evaluation (verdict, reason when present, citations), the evidence those citations name, and the pinned case's consolidation register, and returns text alone.
  - The consolidator never returns or decides an outcome, a referral or a determining hypothesis.
  - Exactly one concrete class implements the port, matching the existing hypothesis-evaluator-modules.spec.ts fitness pattern.
  - The investigation domain module housing the consolidator imports no LLM client.
rationale: The scope names the pattern to mirror — port plus fake, hypothesis-evaluator's own shape — but not the task boundary; cutting it as one task matches the single interface-plus-implementation unit that pattern already is elsewhere in this codebase.
implements:
  - domain/investigation/assessment-consolidator
  - domain/knowledge/consolidation-register
  - domain/investigation/assessment
  - domain/investigation/evaluation
  - domain/investigation/citation
  - domain/investigation/evidence
  - constraints/consolidation-runs-behind-a-port
  - constraints/the-domain-depends-on-no-infrastructure
  - rules/investigation/the-writing-input-is-narrowed
  - rules/investigation/the-outcome-comes-from-the-case
sources:
  - intake/scope.md
---

## What it is

A new assessment-consolidator.port.ts and its fake adapter, following the hypothesis-evaluator port-plus-fake convention exactly.

## Notes

A file placed under src/investigation/ inherits observation-source-modules.spec.ts's directory-wide import sweep automatically; a new module-scoped fitness test for this port should follow hypothesis-evaluator-modules.spec.ts's own-file-list pattern rather than widen that shared sweep.
REMAINDER, from the specification — rules/investigation/the-writing-input-is-narrowed's second clause, "the case's hypotheses, their criteria and the when_to_use enter no prompt," is not reached by this task's criteria, which fix the port's own input/output shape and never construct or narrow that input from a case's hypotheses. Belongs to task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth, which assembles the narrowed input before any adapter sees it.
REMAINDER, from the specification — rules/investigation/the-customer-sees-only-the-text governs the customer-facing surface of a fully composed assessment record; this task's port is a purely internal domain service (input: evaluations, evidence, register; output: text alone) with no customer-exposure concept in its criteria. Belongs to nowhere in this plan: epic/assessment-consolidation.md declares this node uncovered, since it governs a presenting channel this scope does not build.
UNDERDETERMINED, from the specification — domain/knowledge/case's own description states that when a case's consolidation_register is absent, "the consolidation step keeps whatever register its own adapter defaults to," meaning the adapter itself must supply a default. None of the four criteria require the port or its fake adapter to admit an absent register or apply any default. Passes: a port signature where consolidation_register is a required, always-populated argument, and a fake adapter that simply reads that argument with no internal default logic — satisfying criterion 1's literal wording while the adapter itself never supplies the default domain/knowledge/case says it must supply when the case's own register is absent.
