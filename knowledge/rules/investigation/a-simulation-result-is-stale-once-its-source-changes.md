---
type: policy
statement: A case-simulation result — its evaluations and, where one was produced, its assessment — is
  stale once the case version it was produced from, or a hypothesis-revision that version manifests, changes
  after the result was produced.
constrains:
- domain/investigation/assessment
- domain/investigation/evaluation
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A curator judges a simulation result against the case content it was run against, not against whatever that content has since become; editing the version or a hypothesis it manifests, after a result was already shown, is exactly the gap this closes. The rule names no mechanism for detecting the change — hashing, timestamps, a version counter — because none of those is a fact the specification decides; it is free to name the coarsest safe answer (every return from editing) or a finer one, provided a real change is never missed.
