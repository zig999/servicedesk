---
type: policy
statement: No stage aborts on deadline overrun — collection records a timeout result and judgment records deadline-exceeded — with persistence as the single declared exception, which makes at most two write attempts against persistence's own stage bound — where that bound is zero or less at the moment persistence begins, no write attempt is made at all and the store is never called, the failure being raised at once; otherwise a first attempt is held to the whole of that bound and abandoned only once the bound elapses, never truncated to hold time back for what follows, and one retry runs only in whatever of the bound a first attempt that failed before the bound elapsed left unspent — and a persistence that settles no write, in either case, is answered with an HTTP 500 response reporting an InvestigationWriteDeadlineExceededError.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
---

## Description

This rule is what makes the time budget a guarantee instead of an intention.
Persistence cannot degrade because no response exists without a record, which is why it holds its own budget and retries within what remains.
The retry opens no second grant of time: both attempts spend from the one stage bound, so a first attempt that consumes all of it leaves no retry to run.
Truncating the first attempt to reserve a slice for the retry would abandon a write that was about to land, in the one stage that may not degrade, and would put a second attempt in flight behind an abandoned one that an-investigation-is-written-once leaves no room for; so the first attempt spends the bound to its end, and the retry is what answers a write that fails before the bound does.
A bound of zero or less is no window at all: nothing could settle inside it, and a call issued into it would be abandoned the instant it was made and left running past the response, which is the one thing this stage's own discipline refuses — so persistence raises without ever reaching the store, and the requester is answered exactly as it is when both attempts overrun.
