---
title: Expose diagnose over HTTP
summary: A Fastify server and route accept case, subject, narrative, requester and an optional ticket reference in the request body and answer with the assessment, synchronously, within the declared deadline.
rationale: The scope leaves the endpoint's file layout and its observation-source stand-in undecided; this task wires the composition root's production factory with a FakeObservationSource seeded from the fixture task's own canned observations, since no real corporate-records connector exists in this plan, and no authentication or authorization is added, matching the scope's own MVP bound.
objective: A Fastify endpoint runs one diagnose call synchronously from an HTTP request and answers with the resulting assessment in the same response.
criteria:
  - A request whose body names an existing case by slug and version, a subject type, a subject attribute-value set, a narrative and a requester returns, in the same HTTP response, the assessment the diagnose call produced.
  - The response body carries outcome, referral and text — and determining_hypothesis where the resolved outcome names one — and never a verdict, a citation or an evidence item.
  - Two requests naming the same case, subject, narrative and requester each receive their own freshly run assessment; the endpoint returns no cached, joined or reused result.
  - A request whose ticket reference is absent still receives an assessment, and a request that supplies one is accepted the same way.
  - The endpoint reads no authentication or authorization header; the requester named in the request body is exactly the requester the diagnose call runs under.
  - HTTP is served through Fastify and no second HTTP framework.
depends_on:
  - task/diagnose-composition-root/wire-diagnose-runner
  - task/case-fixture/author-diagnose-fixture-case
  - task/hypothesis-judgment-adapter/declare-runtime-dependencies
produces:
  - src/http/server.ts
  - src/http/diagnose.routes.ts
implements:
  - contracts/system/guided-diagnosis
  - contracts/investigation/diagnosis
  - constraints/diagnosis-answers-synchronously
  - domain/investigation/assessment
sources:
  - intake/scope.md
---

## What it is

One route accepts a diagnose request and answers with the assessment the pipeline produced.
Its own server startup seeds a stand-in observation source from the fixture's own canned data.

## Notes

Criterion 1 names the request body's shape precisely — a case by slug and version, a subject type, a subject attribute-value set, a narrative and a requester — and criterion 4 turns on ticket_ref being optional while requester is not. The four implemented nodes establish that case, subject, narrative, requester and an optional ticket reference are the diagnose operation's inputs, but the exact shapes (a case identified by slug and version, a subject as a type plus attribute-values, requester always given and ticket_ref not) are stated by domain/knowledge/case, domain/investigation/subject, domain/investigation/subject-attribute-value and domain/investigation/investigation — all outside this epic's covers, all already implemented by a prior initiative and unchanged by this task. This task passes the request body through to the already-delivered pipeline without re-deriving any of those shapes itself, so it does not claim the nodes that state them.
Decision, beyond the covers — stand: domain/knowledge/case, domain/investigation/subject, domain/investigation/subject-attribute-value and domain/investigation/investigation are already implemented, unchanged, by a prior initiative; this task consumes their shape as a caller and states no fact about them, so it does not grow this epic's claim to include nodes it does not implement.
