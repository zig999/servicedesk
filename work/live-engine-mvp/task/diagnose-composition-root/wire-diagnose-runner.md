---
title: Compose the production diagnose pipeline from the real adapters
summary: One factory function assembles createDiagnoseRunner's own dependencies with the real judgment and consolidation adapters always wired, stamps the request's absolute deadline, and calls the pipeline directly.
objective: One production factory wires the real judgment and consolidation adapters, together with a caller-supplied observation source and data directories, into a single callable that runs the whole synchronous pipeline fresh on every call.
criteria:
  - One factory function assembles createDiagnoseRunner's own DiagnoseDependencies with the real Anthropic-backed judgment and consolidation adapters always wired, and the caller's own observation source, pool size, data directories and default consolidation register passed through unchanged.
  - Calling the assembled runner runs collection, judgment, consolidation and writing directly through createDiagnoseRunner/runDiagnosis; it imports nothing from diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts or diagnose-entry-point.factory.ts.
  - Two calls given the same case, subject, narrative and requester each run the whole pipeline again and are each written as their own investigation; neither call returns, reuses or joins the other's result.
  - The factory computes the request's absolute deadline as its own start instant plus the specification's declared total budget, and propagates that same (now, deadline) pair to the wired runner, never leaving a stage to read the system clock itself.
  - The factory passes the caller-given requester straight through to the wired observation source on every call it makes, substituting none of its own.
  - The factory module, and everything it wires, imports no database client or driver — every store behind it is the existing file-backed one.
depends_on:
  - task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator
  - task/assessment-consolidation-adapter/anthropic-assessment-consolidator
produces:
  - src/factories/production-diagnose.factory.ts
implements:
  - contracts/investigation/diagnosis
  - constraints/diagnosis-answers-synchronously
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/the-mvp-persists-to-no-database
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
sources:
  - intake/scope.md
---

## What it is

One factory decides which two concrete adapters answer judgment and consolidation for a real run.
It stamps the deadline once, at the start, and hands the rest to the pipeline that already exists.

## Notes

contracts/investigation/diagnosis's own input shape names an optional ticket reference alongside case, subject, narrative and requester; no criterion of this task mentions it — this factory's own parameters stop at observation source, pool size, data directories and default consolidation register. Belongs to task/http-surface/diagnose-http-endpoint, where the raw HTTP payload (including the optional ticket reference) is received.
constraints/the-deadline-is-an-absolute-propagated-instant's clause that every stage receives the minimum of its nominal budget and the remaining time is not exercised by any criterion here — this task calls directly through the already-delivered createDiagnoseRunner/runDiagnosis pipeline (from a prior initiative) without reimplementing its stages, and that pipeline is where the per-stage propagation already lives, unmodified by this task.
Two clauses converge on a relationship no criterion of this task addresses: the same constraint's "the internal total stays below the caller's timeout with margin," and rules/investigation/an-answer-arrives-within-the-declared-deadline's "that deadline is smaller than the caller's timeout." This factory only computes and propagates the twenty-second deadline; relating it to an HTTP caller's own timeout belongs to task/http-surface/diagnose-http-endpoint, the only remaining task where an HTTP timeout would be configured or checked.
