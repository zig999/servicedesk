---
type: invariant
statement: A millisecond duration recorded for a span that actually ran — a durations stage figure, a durations total, an evaluation's elapsed_ms for a judgment call that happened, an evidence item's elapsed_ms for a collection that ran — is the whole number of milliseconds observed for that span, and is 0 where the span settled in under one millisecond; no measured duration is ever raised to one millisecond to avoid recording a zero.
constrains:
  - domain/investigation/durations
  - domain/investigation/evaluation
  - domain/investigation/evidence
---

## Description

The clock these figures are read from resolves whole milliseconds, so a span shorter than one is not a span in which nothing happened -- it is a span the instrument cannot resolve, and recording one millisecond for it would state a duration nothing observed, the invented duration domain/investigation/evidence already refuses when it reads a pre-existing item's elapsed_ms as 0 rather than as a made-up number.
A floor of one millisecond would also corrupt the one question domain/investigation/durations exists to answer -- who is exceeding the declared total budget, per stage and per capability -- by adding to every figure a millisecond the run never spent, and by doing so most where the runs are fastest and the figures smallest.
A measurement is not a bound: rules/integration/a-capability-declares-its-contract refuses a timeout of zero and rules/knowledge/a-collected-concept-declares-a-ttl refuses a ttl of zero because a bound of zero bounds no call and no freshness at all, but a measured zero bounds nothing and only reports what the clock could see, so the reasoning that refuses a declared zero does not reach a measured one.
On domain/investigation/evidence, 0 therefore carries two honest readings -- an item collected before the attribute existed was never measured, and an item collected since resolved in under a millisecond -- and the record separates them by nothing, which costs nothing: both say the same thing to every reader an elapsed_ms has, that no measurable time is attributable to that collection, and neither invents one.
Conditional presence is untouched: an elapsed_ms absent because no call happened at all -- an evaluation whose reason is no-data, a durations writing for a run that never reaches consolidation -- stays absent, and is never recorded as 0 instead.
