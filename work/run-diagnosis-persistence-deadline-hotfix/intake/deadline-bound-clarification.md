Clarification, added after the execution-contract-binder's first run over this task returned a
BLOCKING note: the scope's own retry wording ("retried ... within whatever of that remaining time
is left") was written loosely enough to read as granting persistence the whole time remaining
before the request's total deadline, uncapped — which exceeds
constraints/the-deadline-is-an-absolute-propagated-instant's own "every stage receives the minimum
of its nominal budget and the remaining time" (min, not the raw remaining time), read together
with rules/investigation/an-answer-arrives-within-the-declared-deadline's own two-second nominal
slice for persistence. The binder's own note: "a returned balance never raises a stage above its
nominal budget," and the original shipped code already respected this shape correctly
(`Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now))`) — the only defect is that
`now` there is stale (the request's entry instant, not the instant persistence actually begins),
not the min()-against-nominal-budget structure itself.

Corrected framing, replacing the scope's retry description: persistence's own stage bound stays
`min(PERSISTENCE_STAGE_BUDGET_MS, time actually remaining before the propagated deadline when
persistence begins)` — the fix corrects only the "time actually remaining" half, computed fresh at
the moment persistence begins rather than against the stale entry instant. The retry is not a
second, independent grant of remaining time up to the total deadline: it shares that same
stage-level bound, using whatever portion of it the first attempt's own elapsed time left
unspent. Persistence's total spend across the first attempt and the retry together never exceeds
`min(PERSISTENCE_STAGE_BUDGET_MS, time remaining before the deadline when persistence began)`.
