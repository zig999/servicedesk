---
title: Publishing a case
summary: The move from a case under edit to a published case — the contract with integration verified or answered as undecidable, the hash taken over the whole file, and the version counted.
rationale: The decomposition cut publication apart from validation because publication is where the contract with the integration context is verified and where the version and the hash are assigned, and neither changes for the reasons the checks over a case's own content change for. The claim grew a second time to hold what commit a50f278 added about publication — the answer a registry that cannot be consulted produces, the registration the check reads, the counting of the version, the form of the hash, and that nobody approves the act — because each of those governs a task this epic already holds and a task may not bind outside its epic's claim.
sources:
  - intake/scope.md
  - intake/scope-2026-08-07.md
covers:
  - aggregate/knowledge/cases
  - definition/integration/capability
  - definition/knowledge/case
  - definition/knowledge/check-unavailable
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/knowledge/refusal
  - lifecycle/knowledge/case-publication
  - rule/integration/a-capability-is-read-only
  - rule/knowledge/a-case-does-not-publish-without-the-contract-check
  - rule/knowledge/a-case-is-one-file
  - rule/knowledge/a-validation-answers-with-every-refusal
  - rule/knowledge/an-unavailable-check-is-not-a-refusal
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
  - rule/knowledge/nothing-approves-a-publication
  - rule/knowledge/publication-counts-the-version
  - rule/knowledge/the-content-hash-covers-the-whole-file
  - rule/knowledge/the-content-hash-is-a-named-sha-256
  - rule/knowledge/the-contract-check-reads-the-current-registration
  - rule/knowledge/two-positions-are-two-refusals
  - rule/knowledge/what-the-curator-reads-is-written-in-portuguese
---
## What it is

The transition a case makes from being edited to being published, and the three things publication decides.
One is the hash, computed over the whole file and written with its algorithm named inside it.
The second is the version, counted per slug by publication and by nothing a curator writes.
The third is whether every concept the case collects has a registered capability, and what is answered when that question cannot be asked at all.
The claim holds `definition/knowledge/draft-case` because it is the declared subject of the lifecycle this epic covers, and `definition/knowledge/hypothesis` because that is where a case's collected concepts sit.

## Notes

The claim grew by nine nodes, all of them added by commit a50f278, and each because a task this epic already holds cannot be stated without it.
`definition/knowledge/check-unavailable`, `rule/knowledge/an-unavailable-check-is-not-a-refusal` and `rule/knowledge/a-case-does-not-publish-without-the-contract-check` grew the claim because the base now answers what publication does over an unreachable registry, which the plan carried as a question the base did not hold.
`rule/knowledge/publication-counts-the-version` grew it because the version's derivation was an open gap on `definition/knowledge/case` and is now a stated rule, and `rule/knowledge/the-content-hash-is-a-named-sha-256` grew it for the same reason over the hash's form.
`rule/knowledge/the-contract-check-reads-the-current-registration` and `rule/knowledge/nothing-approves-a-publication` grew it because they state what the contract check reads and what the publish trigger waits for, both of which this epic's tasks deliver.
`rule/knowledge/what-the-curator-reads-is-written-in-portuguese` grew it because the unavailable contract check carries a text addressed to the curator, and `rule/knowledge/a-case-is-one-file` because the hash is taken over that one file and the base now states that fact as a node rather than inside the why of a gap.
`definition/integration/capability` and `rule/integration/a-capability-is-read-only` are claimed here as well as by the ports epic, `definition/knowledge/refusal` with its two rules here as well as by the validation epic, and `rule/knowledge/a-case-is-one-file` and `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` here as well as by the shape epic; the overlap is shared scope declared, and each epic reconciles its own claim.
