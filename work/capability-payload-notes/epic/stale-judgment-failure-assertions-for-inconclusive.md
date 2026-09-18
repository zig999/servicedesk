---
title: The judgment-failure assertion for a well-formed inconclusive answer is corrected to not-grounded
summary: 'Corrective increment: anthropic-hypothesis-evaluator.adapter.spec.ts''s test for a
  well-formed but inconclusive model answer asserts the now-superseded reason judgment-failure,
  falsified by inconclusive-response-not-judgment-failure/distinct-reason''s legitimate delivery.'
rationale: The wrong assertion was observed in a test file this project already delivered
  (under a now-closed initiative), outside any live task's criteria; the claim is seeded
  mechanically from trace.py --encodes over the one file the human named.
sources:
- work/capability-payload-notes/intake/stale-judgment-failure-assertions-for-inconclusive.md
covers:
- domain/investigation/evaluation
- domain/investigation/evaluation-reason
- rules/investigation/an-inconclusive-evaluation-declares-its-reason
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
uncovered:
- node: domain/investigation/evaluation
  why: This corrective increment answers only the one stale reason value; this node's other
    attributes reach no criterion of this one-behavior correction.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  why: This node governs elapsed_ms measurement, already exercised unchanged by the same test;
    this correction touches only the reason assertion in the same file, which is why the trace
    names the node as encoded here without this correction reaching it.
---
## What it is

anthropic-hypothesis-evaluator.adapter.spec.ts's test "maps the model's own well-formed
inconclusive answer to reason judgment-failure" asserts `reason: 'judgment-failure'` for a
model answer of `{"verdict":"inconclusive"}` — a well-formed inconclusive verdict, not a parse
failure — which the production adapter now answers with `reason: 'not-grounded'` since
task/capability-payload-notes/inconclusive-response-not-judgment-failure/distinct-reason's
delivery.

## Notes

None.
