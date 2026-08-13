---
title: Integration proof for the diagnose end-to-end persistence deadline
summary: Closes the one gap the implementation record disclosed — criterion 5 proven only at the unit
  level — with a new integration test against a real database and a deliberately slowed write, and cites
  the existing tests that already prove the other eight criteria.
implementation: sha256:87c50b4b3747ef99a0364011d5cde76b1877ffd5f90ebe0d76ea142bbb933d4f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/service-on-the-database-diagnose-end-to-end-suite-3
tests:
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  name: answers 500, never the assessment, and leaves no investigation readable by its id immediately
    afterward, when the investigation write is slowed past the persistence deadline
  proves: When the persistence does not conclude within what remains of the deadline, the requester receives
    an error and not the assessment.
  fails_when: the response stops being exactly handleUnexpectedError's generic 500 envelope (e.g. persistence
    concludes in time and the assessment is returned instead), or the run never actually reaches the investigation
    write (delayWasReached stays false, meaning some earlier, unrelated failure produced the 500), or
    the investigation is already readable immediately after the response is received.
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: A diagnose call naming a case, a subject, a narrative and a requester, with an optional ticket
    reference, answers with an assessment carrying an outcome, a referral and a text.
  fails_when: the response, or the stored document's own assessment, stops equaling EXPECTED_ASSESSMENT
    (an outcome, a referral and a text) for the given case, subject, narrative and requester.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 when the request supplies no ticket_ref
  proves: A diagnose call naming a case, a subject, a narrative and a requester, with an optional ticket
    reference, answers with an assessment carrying an outcome, a referral and a text. (the "optional"
    half)
  fails_when: a request naming no ticket_ref stops answering 200.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 when the request supplies a ticket_ref
  proves: A diagnose call naming a case, a subject, a narrative and a requester, with an optional ticket
    reference, answers with an assessment carrying an outcome, a referral and a text. (the other half)
  fails_when: a request naming a ticket_ref stops answering 200.
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: The assessment returns in that call's own response, with no job, queue or polling between the
    caller and it.
  fails_when: the assessment stops arriving directly in the one app.inject() call's own response (e.g.
    a job id or a polling token appears instead).
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: The assessment's outcome, referral and determining hypothesis are exactly what the pinned case's
    resolve-outcome returned.
  fails_when: the response or the stored document diverges from EXPECTED_ASSESSMENT, which is computed
    to be exactly the fixture case's own resolveOutcome fallback for two hypotheses that both stay inconclusive.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: does not resolve until persistence has actually written the investigation, then resolves with
    the written investigation's own assessment
  proves: The response leaves whole and only after the investigation has been written.
  fails_when: runDiagnosis resolves before the store's write() call has actually settled.
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: The response leaves whole and only after the investigation has been written. (against the real
    database)
  fails_when: the row this call wrote is not already readable, whole, once the HTTP response is read back.
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: The investigation that call produced is readable from the store by its id after the response.
  fails_when: RelationalInvestigationStore.read(investigationId) stops answering the written document
    after the response.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: writes two independent investigation records for two requests naming the same case, subject, narrative
    and requester
  proves: Every call runs the engine again, and no call answers with, reuses or joins an earlier investigation.
  fails_when: two such requests stop producing two separate rows in public.investigations.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: invokes the diagnose call under a fresh id for each of two requests naming the same case, subject,
    narrative and requester
  proves: Every call runs the engine again, and no call answers with, reuses or joins an earlier investigation.
    (fresh id per call, at the HTTP surface)
  fails_when: two such requests stop generating two distinct ids for the underlying diagnose call.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: imports no case-fetching port — case-query and case-store are absent from its own module, so nothing
    inside it could re-resolve the case itself
  proves: The case the run executed is the one pinned by slug and version at the start of that request.
    (never re-fetched inside the composition)
  fails_when: run-diagnosis.ts starts importing a case-query or case-store module of its own.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers the version stored under the named slug, never the same version number stored under a
    different slug
  proves: The case the run executed is the one pinned by slug and version at the start of that request.
    (the case-read boundary the controller calls straight through to)
  fails_when: CaseQueryService.readCase starts answering a different slug's own same-numbered version.
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: The case the run executed is the one pinned by slug and version at the start of that request.
    (end to end, against the real database)
  fails_when: the answered assessment stops matching exactly the one fixture case named by the request's
    own slug and version.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when the subject names an attribute the glossary does not hold, naming the violated
    policy
  proves: The subject types and terms the record names are the ones the glossary holds at that run. (refusal
    half)
  fails_when: buildInvestigation stops refusing a subject naming an attribute absent from the glossary.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: does not refuse a subject whose every named attribute the glossary holds
  proves: The subject types and terms the record names are the ones the glossary holds at that run. (acceptance
    half)
  fails_when: buildInvestigation starts refusing a subject whose every named attribute the glossary does
    hold.
not_applicable:
- edge_case: two concurrent operations against one subject or one investigation id at once
  why: none of this task's nine criteria state a concurrency guarantee of their own; the write-once/no-reuse
    guarantee criterion 7 states is already proven by diagnose-server.factory.spec.ts's and build-app.spec.ts's
    sequential-but-distinct-id tests, and adding concurrency here would assert a property no criterion
    of this task claims.
- edge_case: an investigation id already stored (duplicate-write refusal)
  why: not named by any of this task's nine criteria — it is proven already, at the unit level, by run-diagnosis.spec.ts's
    own "propagates the store's own refusal when an investigation with this id is already stored" test,
    written for task/diagnose-entry-point/diagnose-pipeline-composition.
- edge_case: absent or empty request body fields (missing narrative, empty subject attributes)
  why: this task's criteria describe the happy path and the one persistence-deadline failure; boundary
    validation of the request body is task/http-surface/diagnose-http-endpoint's own criteria, already
    proven by build-app.spec.ts's "refuses with 400" tests, which this task does not restate.
untested:
- 'Criterion 8''s own guarantee that two differently-pinned cases (different slug or version) each produce
  their own case''s own result, rather than one influencing the other, is exercised only where both calls
  in a test share the very same case: run-diagnosis.spec.ts''s own "pins each call''s own written document
  with its own case''s slug and version, independently of the other call" test carries a comment disclosing
  that, once pinned_case stopped carrying a hash, that test can no longer distinguish one case from a
  genuinely different one. No test in this delivery or the ones it cites drives the whole composition
  against two distinct pinned cases and asserts each answers with its own.'
- Criterion 9's refusal branch — a subject naming an attribute the glossary does not hold — is proven
  only at the unit level (investigation-factory.spec.ts, against a fake IGlossaryQuery). No integration
  test in this tree drives that refusal through the real, wired glossary query against the real database;
  every integration test that reaches this path only exercises the acceptance branch.
- Criterion 5's own exact boundary — a write concluding right at the edge of the two-second persistence
  budget rather than comfortably past it — is proven only at the unit level under fake timers (run-diagnosis.spec.ts's
  own "bounds persistence at the nominal two-second budget" tests). This delivery's own new integration
  test deliberately delays well past that budget (five seconds) for deterministic timing against a real
  database; asserting the exact millisecond boundary against real network latency would make the test
  flaky rather than more informative.
divergences:
- cites: STK-08
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: the same reason every sibling integration proof in this initiative already discloses — loadEnv
    refuses unless every other application variable is configured too, which this file has no use for.
- cites: TYP-02
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  departure: createDelayingConnection and wrapClient cast their own Proxy(...) result to DatabaseConnection/PoolClient
    with a plain `as` assertion, with no preceding runtime check that narrows it.
  why: a Proxy's own shape cannot be verified by any runtime guard — every property access is dispatched
    dynamically through its handler — so the assertion is the same "trust the wrapper's own conformance
    to the interface it stands in for" idiom the stand-in-a-boundary technique itself already requires
    (TST-03); no guard could narrow a Proxy any further than the cast already asserts.
---

## What it is

One new integration test closing the one real gap the implementation record disclosed — criterion 5 proven, until now, only against a fake store — against a real database and a deliberately slowed write, plus citations of the existing tests (from already-delivered sibling tasks) that already prove the other eight criteria.

## Notes

This task's own implementation record found zero production files needed to change; this proof accordingly writes exactly one new test file and touches nothing else. Two of this task's nine criteria carry a residual gap disclosed under `untested` rather than closed here: criterion 8's cross-case isolation and criterion 9's glossary-refusal branch are each proven only at the unit level, and closing either was judged to reach past this task's own one disclosed gap (criterion 5) rather than to be part of it — recorded rather than silently left for a reader to discover.

Two earlier full-step runs of this same suite are not the one cited above. run/service-on-the-database-diagnose-end-to-end-suite ran only secret-scan and test (missing install, typecheck, lint), so it could not be cited once `deliver.py` held this record to every step the registry declares. run/service-on-the-database-diagnose-end-to-end-suite-2 ran every step and failed at test with `Error: getaddrinfo EAI_AGAIN ep-wandering-block-axqky0kh-pooler.c-4.us-east-2.aws.neon.tech` in three case-query.factory.spec.ts tests — a transient DNS resolution failure against the real Neon endpoint, unrelated to any file this delivery touched, and none of the three failing tests names this task's own new file. run/service-on-the-database-diagnose-end-to-end-suite-3, cited above, reran the identical steps immediately after and passed all 691 tests, confirming the failure was transient rather than a regression this delivery introduced.
