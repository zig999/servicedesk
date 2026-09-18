---
type: invariant
statement: A hypothesis's judgment reads the current instant, in UTC, read fresh from the clock at the moment that judgment is requested, never a value carried over from any evidence's own collection and never one instant shared across two separate judgment requests for the same hypothesis.
constrains:
  - domain/investigation/hypothesis-evaluator
---

## Description

A criterion can turn on how recent or how stale an observation is, and answering that needs a "now" to measure every evidence item's own observed_at and ttl against. That "now" is not itself evidence — nothing was collected at it, and no capability answered it — so it stands apart from what rules/investigation/judgment-reads-the-evidence-snapshot fixes at collection: this is read once per judgment, at the instant judgment itself is requested, never at the earlier instant any of that hypothesis's evidence happened to be collected at and never reused from a judgment already answered.
UTC is the same reference rules/investigation/an-evidence-items-observed-at-is-a-utc-instant already fixes for observed_at, so the two sides of a staleness comparison — the evidence's own captured-at and the judgment's own now — read against one clock rather than two.
