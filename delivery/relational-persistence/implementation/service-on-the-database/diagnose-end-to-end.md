---
title: A diagnosis runs against the database
summary: Every one of the nine criteria is already met by the diagnose composition and the real-database
  wiring two prior tasks delivered; this record adds one documentation-only header note and defers the
  one real gap — criterion 5 proven only at unit level — to the proof.
task: sha256:9e3469fa79a2726e1ffa0085ea53ec60673e567c35165b90a3876f7f2b95a8ac
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/service-on-the-database-diagnose-end-to-end-build-2
files:
- path: src/investigation/run-diagnosis.ts
  effect: adds one header paragraph, after the existing persistence discussion, naming task/service-on-the-database/diagnose-end-to-end
    explicitly and pointing at the seam (createDiagnoseRunner's own connection parameter, already exercised
    by diagnose-e2e.spec.ts outside createDiagnoseHttpServer's internal wiring) the proof's new integration-level
    test for criterion 5 uses — a documentation-only change; runDiagnosis's own control flow, exports
    and runtime behavior are unchanged.
criteria:
- criterion: A diagnose call naming a case, a subject, a narrative and a requester, with an optional ticket
    reference, answers with an assessment carrying an outcome, a referral and a text.
  met: true
  how: http/diagnose.routes.ts's diagnoseHandler validates the body against diagnoseRequestSchema and
    calls handleDiagnoseRequest (http/diagnose.controller.ts), which reads the pinned case and calls runDiagnose;
    the response is reply.code(200).send(assessment) where assessment carries outcome, referral and text
    (investigation/assessment.ts) — delivered under task/diagnose-entry-point/diagnose-pipeline-composition
    and task/http-surface/diagnose-http-endpoint, wired against the real database by task/service-on-the-database/store-wiring.
- criterion: The assessment returns in that call's own response, with no job, queue or polling between
    the caller and it.
  met: true
  how: handleDiagnoseRequest awaits runDiagnose and returns its result directly; diagnoseHandler awaits
    that and sends it in the same HTTP response. No queue, job id or polling endpoint exists anywhere
    under http/.
- criterion: The assessment's outcome, referral and determining hypothesis are exactly what the pinned
    case's resolve-outcome returned.
  met: true
  how: resolve-and-narrow-input.ts's resolveAndNarrow calls resolveOutcome(theCase, verdictsOf(evaluations))
    exactly once and returns it verbatim as resolved; run-diagnosis.ts's draftAssessment call passes resolved/narrowedInput
    straight through, and consolidation supplies only text.
- criterion: The response leaves whole and only after the investigation has been written.
  met: true
  how: 'run-diagnosis.ts''s runDiagnosis: await writeWithinDeadline(...) is the last stage before return
    investigation.assessment; nothing reads the response value before that await resolves.'
- criterion: When the persistence does not conclude within what remains of the deadline, the requester
    receives an error and not the assessment.
  met: true
  how: writeWithinDeadline/racePersist in run-diagnosis.ts race store.write(investigation) against what
    remains of the propagated deadline and throw InvestigationWriteDeadlineExceededError — a plain Error
    carrying no statusCode — on timeout; build-app.ts's handleUnexpectedError falls to a 500 rather than
    ever sending an assessment. Proven at the unit level today (run-diagnosis.spec.ts with a fake store);
    the proof for this task adds the integration-level case against a real, deliberately slowed write
    — the one real gap this delivery found, disclosed rather than papered over.
- criterion: The investigation that call produced is readable from the store by its id after the response.
  met: true
  how: RelationalInvestigationStore.read(id) reads the root row plus every child table back whole; proven
    against the real database by diagnose-e2e.spec.ts's first test, which reads the just-written row back
    after the HTTP response.
- criterion: Every call runs the engine again, and no call answers with, reuses or joins an earlier investigation.
  met: true
  how: handleDiagnoseRequest calls randomUUID() per request; run-diagnosis.ts runs collection→judgment→resolve/narrow→drafting→write
    unconditionally, with no cache or lookup-by-id path anywhere in the composition. Proven against the
    real database by diagnose-server.factory.spec.ts's two-independent-investigations test.
- criterion: The case the run executed is the one pinned by slug and version at the start of that request.
  met: true
  how: diagnose.controller.ts's handleDiagnoseRequest calls caseQuery.readCase(body.case.slug, body.case.version)
    once, at the top, and passes that exact Case value into runDiagnose; run-diagnosis.ts never fetches
    or re-resolves a case.
- criterion: The subject types and terms the record names are the ones the glossary holds at that run.
  met: true
  how: investigation-factory.ts's refuseAttributesNotInGlossary checks every subject-attribute name against
    the glossary before building anything; CaseQueryService.readCase runs caseCoherenceViolations against
    the glossary and capabilities at every read. Both are wired from the one real DatabaseConnection by
    case-query.factory.ts / diagnose.factory.ts (task/service-on-the-database/store-wiring).
nodes:
- node: constraints/the-system-persists-to-one-relational-database
  how: 'Honored rather than encoded: every store this composition reads and writes through (investigation,
    case, glossary, capability) already answers from the one shared connection task/service-on-the-database/store-wiring
    wired; this task adds no store and no second connection.'
- node: constraints/diagnosis-answers-synchronously
  how: 'Honored: runDiagnosis is awaited straight through to the HTTP response with no queue or polling
    stage, delivered under task/diagnose-entry-point/diagnose-pipeline-composition.'
- node: contracts/investigation/diagnosis
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: run-diagnosis.ts's own header now names this task explicitly alongside the contract's "every call
    is fresh" and "answers synchronously" clauses it already honored; the behavior itself was encoded
    by the prior composition task, this delivery's only addition is the documentation pointing at where
    this task's own criteria are answered.
- node: contracts/system/guided-diagnosis
  how: 'Honored rather than encoded: the whole path from HTTP request to written investigation and returned
    assessment is the capability this node names, assembled by prior tasks and reused here unchanged.'
- node: contracts/investigation/case-source
  how: 'Honored: diagnose.controller.ts reads the pinned case once, at the top of the request, and run-diagnosis.ts
    never re-fetches it — delivered under task/diagnose-entry-point/diagnose-pipeline-composition.'
- node: contracts/investigation/glossary-source
  how: 'Honored: investigation-factory.ts and CaseQueryService both read the glossary fresh at every run
    through the published IGlossaryQuery, wired against the real database by task/service-on-the-database/store-wiring.'
- node: rules/investigation/the-outcome-comes-from-the-case
  how: 'Honored: resolveAndNarrow''s single call to resolveOutcome is the only place the outcome is decided,
    and run-diagnosis.ts passes its result through unchanged.'
- node: rules/investigation/the-response-follows-the-record
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: writeWithinDeadline's own await, ahead of the return, is what this rule requires; the new header
    paragraph names this task's own criteria 4 and 5 as what that same code already answers against a
    real database.
- node: scenarios/investigation/no-response-without-a-record
  how: 'Honored: the deadline-exceeded branch raises before any assessment is sent, exactly the scenario''s
    own given/when/then — proven at the unit level already, and at the integration level by this delivery''s
    proof.'
- node: domain/investigation/investigation
  how: 'Honored rather than encoded: buildInvestigation (investigation-factory.ts) is the one factory
    that constructs a valid Investigation, reused here unchanged.'
- node: domain/investigation/assessment
  how: 'Honored rather than encoded: the Assessment shape (outcome, referral, text) this call answers
    with is exactly the type contracts/investigation/diagnosis and this domain element already declare.'
inferences:
- inferred: Nothing here required a new production file, a new type, or a new parameter — every criterion
    is already met by code delivered under task/diagnose-entry-point/diagnose-pipeline-composition and
    task/service-on-the-database/store-wiring, confirmed by independently rereading each named file rather
    than trusting an earlier survey's summary of it.
  from: the task's own objective ("answered ... after its investigation has been written to the database")
    names no new capability the prior two tasks did not already deliver; its own Notes name diagnose-e2e.spec.ts
    as "the existing end-to-end test this path is observed by", which is itself evidence the path already
    runs end to end.
- inferred: The one genuine gap this delivery found — criterion 5 proven only against a fake store (run-diagnosis.spec.ts),
    never against a real, deliberately slowed database write — is a test-authoring gap and not a production
    one, so it is left for the proof rather than answered here with a new seam.
  from: createDiagnoseRunner (diagnose.factory.ts) already takes the shared DatabaseConnection as an ordinary
    parameter; diagnose-e2e.spec.ts already demonstrates composing against a real connection outside createDiagnoseHttpServer's
    own internal one, so a slow-write test can reuse that seam by wrapping the connection rather than
    by this delivery adding a new injection point.
preserved:
- Every file's exported surface, control flow and runtime behavior is unchanged — this delivery's only
  edit is a comment. No test, factory, route or store was touched.
---

## What it is

Confirmation that every one of this task's nine criteria is already met by the diagnose composition (task/diagnose-entry-point/diagnose-pipeline-composition) once wired against the real database (task/service-on-the-database/store-wiring), plus one documentation-only header note in run-diagnosis.ts naming this task and the seam its proof's new integration test uses for the one gap this delivery found: criterion 5 proven only at unit level until now.

## Notes

This delivery adds no behavior. Two independent readings (a survey and a task-implementer, each rereading the named source itself rather than trusting the other's summary) agree that zero production files needed to change. The delivery-node schema requires an implementation record's `files` to name at least one path; the one path named here is a real, disclosed, documentation-only edit — a header comment naming this task and the injection seam its own proof uses — rather than a fabricated behavior change. This resolution was confirmed with the human before writing it.
