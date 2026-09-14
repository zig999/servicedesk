# Corrective increment — test's declared total deadline (30s) diverges from the specification's (20s)

Source: the conformance finding of `/review-change` over `backend-load-resilience-hardening`
(`siegard-reconcile/backend-load-resilience-hardening.md`, saved at
`siegard-reconcile/backend-load-resilience-hardening.returns/src____tests____integration__http__diagnose-persistence-deadline-e2e.spec.ts.yaml`),
quoted verbatim below.

## The wrong behavior

> const TOTAL_DEADLINE_BUDGET_MS = 30_000;
> ...
> const now = Date.now();
> return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });
>
> A reader of this integration test learns the system's declared total deadline for a diagnose
> call is thirty seconds; the specification's own node states it as twenty (two of overhead and
> margin, seven of collection, five of judgment, four of writing and two of persistence). Because
> this file computes and injects the deadline itself rather than exercising the production
> computation, the test keeps passing under either figure, so nobody is alerted if this
> thirty-second belief and the specification's twenty-second decision ever diverge further.
>
> node: rules/investigation/an-answer-arrives-within-the-declared-deadline
>
> correction: derive the injected deadline from the specification's own declared total (twenty
> seconds) instead of a locally chosen thirty.

## The file it lives in

`src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts`
