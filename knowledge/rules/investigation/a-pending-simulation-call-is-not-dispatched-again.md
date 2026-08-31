---
type: policy
statement: Where the interface assembling a subject has dispatched a simulate-case or a simulate-hypothesis call for that subject and that call has not yet ended, a further dispatch of that same operation for that subject issues no request at all and leaves the pending call's own run untouched; the guard is keyed by the operation and the subject together, and that operation is dispatchable again as soon as the pending call ends, whether it ended in a returned result or in a refusal.
constrains:
  - domain/investigation/subject
consistency: eventual
---

## Description

A simulation writes no investigation and emits no event (rules/investigation/a-simulation-writes-no-investigation), so two runs of the same operation over one subject leave nothing behind that tells them apart: whichever returns last replaces what the curator is reading, and nothing says which dispatch produced the evaluations in front of them or which composed subject they were produced from. One outstanding dispatch per operation is what keeps the shown result answerable to a run the curator actually asked for.
The block costs a bounded wait rather than a lock — a simulation runs the same collection, judgment, resolution and consolidation a diagnosis runs (contracts/investigation/case-simulation), which answers inside its own declared total (rules/investigation/an-answer-arrives-within-the-declared-deadline) — and the operation is free again the instant the pending call ends, including where it ends in a refusal (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused) rather than a result.
Keyed by the operation and the subject together: simulate-case and simulate-hypothesis answer two different questions about one case version, and a curator watching one has no reason to be shut out of the other; a second subject composed on another screen is a different subject and blocks nothing.
This is not a refusal the contract answers. No request is issued, so nothing at contracts/investigation/case-simulation ever sees the suppressed attempt, and no status or error name belongs to it — unlike a refusal the specification does state, which is always a request that reached the operation.
