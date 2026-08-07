---
title: Publishing a case
summary: The move from a case under edit to a published case — the contract with integration verified, the hash taken over the whole file, and the version assigned.
rationale: The decomposition cut publication apart from validation because publication is where the contract with the integration context is verified and where the version and the hash are assigned, and neither changes for the reasons the checks over a case's own content change for. The claim grew to hold the case under edit and its hypotheses, which are the transition's own input, and the refusal and its two rules, which are what this epic's checks answer with.
sources:
  - intake/scope.md
covers:
  - aggregate/knowledge/cases
  - definition/integration/capability
  - definition/knowledge/case
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/knowledge/refusal
  - lifecycle/knowledge/case-publication
  - rule/integration/a-capability-is-read-only
  - rule/knowledge/a-validation-answers-with-every-refusal
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
  - rule/knowledge/the-content-hash-covers-the-whole-file
  - rule/knowledge/two-positions-are-two-refusals
---
## What it is

The transition a case makes from being edited to being published, and the two things publication decides.
One is the hash, computed over the whole file.
The other is whether every concept the case collects has a registered capability declaring an output schema and a timeout.
The claim holds `definition/knowledge/draft-case` because it is the declared subject of the lifecycle this epic covers, and `definition/knowledge/hypothesis` because that is where a case's collected concepts sit.

## Notes

`definition/integration/capability` and `rule/integration/a-capability-is-read-only` are claimed here as well as by the ports epic, and `definition/knowledge/refusal` with its two rules here as well as by the validation epic; the overlap is shared scope declared, and each epic reconciles its own claim.
The version this transition assigns is what the base registers a published case as carrying, and nothing in this plan derives it elsewhere.
The refusal nodes are claimed for the two tasks that answer with refusals; `content-hash` is not one of them, and its criteria were left as cut.
