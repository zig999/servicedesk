---
statement: Each hypothesis is judged in its own call, in parallel, under a bounded pool.
scope: investigation
fitness: One provider call per hypothesis appears in the recorded cost, and the pool bound is configuration.
---

## Description

Isolation buys three things beyond its cost: a small prompt, no order bias between hypotheses, and an error contained to one hypothesis.
Judging all hypotheses in one call is roughly ten times cheaper and destroys exactly those properties; revisit only with measurement.
