---
title: Fix use-simulate-hypothesis dispatch to the delivered backend route
summary: Rewires the frontend simulate-hypothesis dispatch to POST /v1/simulate/hypothesis
  with the body the backend route requires, instead of a nested per-case-version URL
  that was never registered.
sources:
- intake/scope.md
objective: The use-simulate-hypothesis hook (and its call site in use-case-simulation-cockpit.ts)
  dispatch the simulate-hypothesis operation to the backend route the sibling initiative
  actually delivered -- POST /v1/simulate/hypothesis, with the body simulateHypothesisRequestSchema
  requires -- so that simulating a hypothesis on the case simulation screen succeeds
  against the live backend instead of the 404 the nonexistent nested URL produced.
criteria:
- The hook's mutation dispatches POST to /v1/simulate/hypothesis, never to /v1/cases/{slug}/versions/{version}/simulate-hypothesis.
- 'The dispatched request body is exactly { case: { slug, version }, subject, requester,
  hypothesis }, matching simulateHypothesisRequestSchema''s required fields -- never
  the case-and-requester-less body the hook sent before.'
- The hook's typed success response models the route's own response shape -- evidence,
  evaluation, durations -- while still exposing no outcome and no assessment field.
- onSimulate accepts a requester argument and forwards it unchanged into the dispatched
  body, the same way useSimulateCase's onSimulate already receives one from its caller.
- use-case-simulation-cockpit.ts's onSimulateHypothesis call site passes subjectState.requester
  through to hypSim.onSimulate, the same value it already passes to caseSim.onSimulate.
- A dispatch against the live backend route for a case version whose manifest holds
  the named hypothesis returns exactly one evaluation for that hypothesis.
implements:
- contracts/investigation/case-simulation
- domain/investigation/evaluation
- domain/investigation/verdict
- domain/investigation/citation
- domain/investigation/evaluation-reason
- domain/investigation/usage
- domain/investigation/evidence
- domain/investigation/durations
- domain/investigation/subject
- domain/investigation/investigation
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
- scenarios/investigation/a-single-hypothesis-is-simulated
---

## What it is

A corrective increment: one wrong behavior observed by running the delivered system (a 404 on
the case simulation screen), answering to no criterion of any task under the closed
case-simulation-frontend or case-simulation-backend plans -- the two initiatives were delivered
and reviewed independently, before either could observe the other's final wire shape.

## Notes

None.
