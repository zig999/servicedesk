---
type: invariant
statement: An evaluation inconclusive with reason judgment-failure carries the usage, elapsed_ms and prompt of the last judgment call actually made for that hypothesis — the retry's own record where a retry ran, and the first call's where the remaining deadline admitted no retry — never a superseded first call's record where a retry ran, and never a usage summed across both attempts.
constrains:
  - domain/investigation/evaluation
---

## Description

domain/investigation/evaluation holds the three as one call's own record — what the provider charged, how long that call took, and the judgment prompt as that call actually materialized it — so a usage summed across two attempts, paired with one attempt's elapsed_ms and prompt, would describe a call that never happened and leave a reader unable to hold the tokens against the prompt shown.
Which of two attempts a record names is a question this specification has already answered once, and this answers it the same way: written-at-records-when-the-write-settled dates an investigation by the write that settled it rather than by the first attempt issued, and the call that settles a judgment-failure is the last one made, after which no further attempt follows.
A per-hypothesis record naming one call is not a total and was never meant to be one — what an investigation spent across every call it made is domain/investigation/cost's own to carry.
Where the remaining deadline admitted no retry, the first call is the last call made, so one reading serves the retried and unretried paths alike, and a-foreign-citation-is-refused's two outcomes need no separate answer.
