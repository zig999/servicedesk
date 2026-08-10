---
title: Case admits an optional consolidation register
summary: The case aggregate and its coherence validation admit an optional consolidation_register, formal or plain.
objective: A case document may declare a consolidation_register of formal or plain, parses into the Case with that value when present, and parses successfully with the field absent.
criteria:
  - A case document declaring consolidation_register formal or consolidation_register plain parses into a Case carrying that value.
  - A case document omitting consolidation_register parses successfully, never refused for the field's absence.
  - A consolidation_register value outside formal or plain is refused, collected together with any other structural or coherence violation the same document holds, never thrown on the first violation found.
  - The Case that parse-case-document holds and returns carries consolidation_register through when the raw document declares it, rather than dropping it.
rationale: Case's own field addition and its coherence check change for their own reason — what a case document may declare — independent of the consolidator and drafting tasks, which can be demonstrated against a stub register without this task landing first.
implements:
  - domain/knowledge/case
  - domain/knowledge/consolidation-register
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

case.ts's Case type, parse-case-document.ts and validate-case-coherence.ts each extended for an optional consolidation_register.

## Notes

Any code that spreads or reconstructs a Case verbatim, such as the held case in parse-case-document.ts, must be extended too or the field is silently dropped on parse even when the raw document declares it.
REMAINDER, from the specification — rules/investigation/the-writing-input-is-narrowed's statement is entirely about what data reaches assessment consolidation; no clause of it concerns the Case aggregate's consolidation_register field or its parsing, this task's whole objective. Belongs to task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth.
REMAINDER, from the specification — rules/investigation/the-outcome-comes-from-the-case constrains domain/knowledge/case among its named targets, but its statement is about the resolve-outcome operation, which none of this task's four criteria touch. Belongs to task/assessment-consolidation/draft-assessment-text-consumes-consolidator.
REMAINDER, from the specification — rules/investigation/the-customer-sees-only-the-text states what an assessment exposes to the end customer, unrelated to the Case document's consolidation_register field or its parsing. Belongs to nowhere in this plan: epic/assessment-consolidation.md declares this node uncovered, since it governs a presenting channel this scope does not build.
UNDERDETERMINED, from the specification — constraints/the-domain-depends-on-no-infrastructure governs this task, whose own core is the case schema and its validator, but none of the four stated criteria states that purity requirement. Passes: an implementation that adds consolidation_register support to the Case type and parse-case-document by importing a database driver, an HTTP client or a provider SDK directly, rather than remaining a pure function over the document's own parsed JSON data, while still satisfying criteria 1 through 4 exactly as written.
