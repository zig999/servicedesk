---
type: policy
statement: No stage aborts on deadline overrun — collection records a timeout result and judgment records deadline-exceeded — with persistence as the single declared exception, whose failure is an error to the requester.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
---

## Description

This rule is what makes the time budget a guarantee instead of an intention.
Persistence cannot degrade because no response exists without a record, which is why it holds its own budget and retries within what remains.
