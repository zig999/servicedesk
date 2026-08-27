---
type: policy
statement: A simulation runs the engine over a case version in any state and writes no investigation; nothing it collects ever enters a cache, and nothing it collects or judges is ever read by a diagnosis.
constrains:
  - domain/investigation/investigation
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A curator composing a draft needs to watch the engine judge it before releasing it, and a curator or an auditor needs to see a released version's own verdicts and evidence without writing another investigation over it — neither want is a diagnosis.
`rules/investigation/only-a-released-case-version-is-diagnosed` keeps every diagnosis on a released version; this rule keeps every simulation out of the record that one protects, so the two never meet — what a simulation collected cannot warm a cache a diagnosis later reads from, and what it judged is never the answer anyone was given.
