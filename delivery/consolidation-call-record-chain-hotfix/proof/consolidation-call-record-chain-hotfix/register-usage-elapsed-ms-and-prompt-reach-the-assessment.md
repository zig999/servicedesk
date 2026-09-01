---
implementation: sha256:04fdd03ec298505dc2401fa1f1f8c99174c65c253b946271adac2e0b3b90f7ee
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/consolidation-call-record-chain-hotfix-register-usage-elapsed-ms-and-prompt-reach-the-assessment-suite-3
title: Proof for register/usage/elapsed_ms/prompt reaching the assessment
summary: Proves the consolidation call's register, usage, elapsed_ms and prompt now reach the Assessment
  an investigation-pipeline run returns and a diagnosis persists and reads back, with register always
  exactly what consolidate() answered rather than what the caller requested, and that the HTTP wire response
  stays narrowed to the four legacy DiagnoseResponseDto fields.
tests:
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and prompts
    together, for one confirmed hypothesis
  proves: Every Assessment an investigation-pipeline run returns carries all eight attributes domain/investigation/assessment
    declares, never only outcome, referral, determining_hypothesis and text.
  fails_when: runInvestigationPipeline's returned assessment lacks register, usage, elapsed_ms or prompt,
    or any of the four differs from what the scripted consolidator answered with
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: carries only the consolidation call's own prompt under prompts.writing and on the assessment's
    own prompt field, never merging in a judged hypothesis's own distinct judgment prompt
  proves: The prompt on a returned Assessment is the consolidation prompt as the writing call actually
    materialized it, and is never carried on a field of the pipeline's own result object instead of on
    the assessment.
  fails_when: result.assessment.prompt is not the consolidation prompt, or prompts.writing diverges from
    result.assessment.prompt
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: exposes exactly outcome, referral, determining_hypothesis, text, register, usage, elapsed_ms and
    prompt -- never a verdict or evidence field -- on a confirmed-path answer
  proves: Every Assessment an investigation-pipeline run returns carries all eight attributes domain/investigation/assessment
    declares (confirmed-path shape)
  fails_when: draftAssessment's returned key set omits register, usage, elapsed_ms or prompt, or adds
    an unexpected key, on the confirmed path
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: exposes exactly outcome, referral, text, register, usage, elapsed_ms and prompt -- no determining_hypothesis,
    verdict or evidence field -- on a fallback-path answer
  proves: Every Assessment an investigation-pipeline run returns carries all eight attributes domain/investigation/assessment
    declares (fallback-path shape)
  fails_when: draftAssessment's returned key set omits register, usage, elapsed_ms or prompt, or adds
    an unexpected key, on the fallback path
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: copies register, usage, elapsed_ms and prompt from the consolidator's own ConsolidationOutcome
    onto the returned Assessment unchanged -- register exactly as the call answered with, never the register
    the caller requested
  proves: The register on a returned Assessment equals exactly the register the consolidate() call answered
    with -- never a value assumed by the caller in advance, and never a value different from what the
    call actually used. / The prompt on a returned Assessment is the consolidation prompt as the writing
    call actually materialized it.
  fails_when: draftAssessment assumes/echoes the caller-given consolidationRegister rather than reading
    outcome.register, or drops/mutates usage, elapsed_ms or prompt from the ConsolidationOutcome
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: Assessment declares register typed exactly domain/knowledge/consolidation-register and usage typed
    exactly domain/investigation/usage -- never a wider string or a looser numeric shape standing in for
    either
  proves: The register and usage values carried onto the assessment are exactly the domain/knowledge/consolidation-register
    enumeration value and domain/investigation/usage integers the consolidate() call answered with --
    never a wider or looser type standing in for either.
  fails_when: Assessment's register field widens beyond ConsolidationRegister (e.g. to string) or its
    usage field widens beyond Usage (e.g. to a looser numeric shape), as caught by expectTypeOf's structural
    comparison
- file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  name: answers a defined register, usage, elapsed_ms and prompt on every call, never leaving any of the
    four undefined
  proves: assessment-consolidator.port.ts's consolidate() operation answers with the register it actually
    used to produce the text, in addition to the usage, elapsed_ms and prompt it already answers with
    -- the same call-record shape those three already have.
  fails_when: any of register, usage, elapsed_ms or prompt is undefined on a successful consolidate()
    call
- file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  name: answers register as exactly the consolidationRegister the call itself carried -- 'formal' for
    a formal call and 'plain' for a plain one -- never a fixed placeholder the way usage, elapsed_ms and
    prompt are
  proves: assessment-consolidator.port.ts's consolidate() operation answers with the register it actually
    used / The register on a returned Assessment equals exactly the register the consolidate() call answered
    with.
  fails_when: consolidate()'s own outcome.register does not match the register it was actually called
    with, for either 'formal' or 'plain'
- file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  name: ConsolidationOutcome declares register typed exactly domain/knowledge/consolidation-register and
    usage typed exactly domain/investigation/usage -- never a wider string or a looser numeric shape standing
    in for either
  proves: The register and usage values carried onto the assessment are exactly the domain/knowledge/consolidation-register
    enumeration value and domain/investigation/usage integers the consolidate() call answered with --
    never a wider or looser type standing in for either.
  fails_when: ConsolidationOutcome's register or usage field widens beyond ConsolidationRegister/Usage,
    as caught by expectTypeOf's structural comparison
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: answers register as exactly the register the call itself carried, for each of the two declared
    registers
  proves: assessment-consolidator.port.ts's consolidate() operation answers with the register it actually
    used, for the real Anthropic-backed adapter specifically.
  fails_when: AnthropicAssessmentConsolidator's answered register differs from the register it was actually
    called with, for either 'formal' or 'plain'
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: writes an assessment carrying exactly the register, usage, elapsed_ms and prompt the consolidation
    call itself answered with -- never the register the caller requested, when the two differ
  proves: The register on a returned Assessment equals exactly the register the consolidate() call answered
    with / A stored and re-read Assessment carries the same register, usage, elapsed_ms and prompt values
    the write recorded, exercised end to end through runDiagnosis's own build-and-persist chain.
  fails_when: the persisted assessment's register, usage, elapsed_ms or prompt diverge from what the consolidation
    call answered, or the register matches the caller's requested default ('plain') instead of what the
    call actually answered ('formal')
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back a whole investigation exactly as written -- root, subject attribute-values, evidence
    with its capability pin, evaluations with their citations, assessment, cost and durations -- through
    one transaction
  proves: A stored and re-read Assessment carries the same register, usage (input_tokens and output_tokens),
    elapsed_ms and prompt values the write recorded -- none of the four is dropped or altered by a persistence
    round trip.
  fails_when: any of assessment.register ('formal'), usage ({77,41}), elapsed_ms (1234) or prompt (a distinct
    string) is dropped, defaulted or altered by the real Postgres write/read round trip
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: reads back the assessment's own register as 'plain' when that is what was written, rather than
    the column's own 'formal' default surviving from another row or the migration's DEFAULT clause
  proves: A stored and re-read Assessment carries the same register value the write recorded -- specifically
    that the non-default enum value round-trips too, not only the fixture's usual 'formal'.
  fails_when: an investigation written with register 'plain' reads back with any other register
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends every declared attribute of the root row -- identity, subject type, prompt version, model,
    pinned case, assessment, cost, durations and written_at -- as the root insert's own params, in order
  proves: A stored Assessment's register, usage, elapsed_ms and prompt are sent as the root insert's own
    params, in the position the migration's five new columns occupy -- the write half of the persistence
    round trip.
  fails_when: register, assessment_usage_input_tokens, assessment_usage_output_tokens, assessment_elapsed_ms
    or assessment_prompt are missing from the INSERT's params array or appear out of the migration's declared
    column order
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: assembles the assessment with its outcome, referral, determining_hypothesis, text, register, usage,
    elapsed_ms and prompt, when a hypothesis was named
  proves: A stored and re-read Assessment carries the same register, usage, elapsed_ms and prompt values
    the write recorded -- the read half of the persistence round trip, at the unit level against a scripted
    row.
  fails_when: assessmentOf() drops register, usage, elapsed_ms or prompt, or reads a column's value into
    the wrong Assessment field
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: 'proceeds exactly as before for a released-state pinned version: calls runDiagnose once with every
    field assembled unchanged, and answers with the resolved Assessment narrowed to the response DTO''s
    four fields'
  proves: handleDiagnoseRequest's own contract narrows the returned Assessment to the DiagnoseResponseDto's
    four wire fields before answering, per the deferred note that the HTTP transport contract stays at
    outcome/referral/determining_hypothesis/text.
  fails_when: handleDiagnoseRequest's return value carries register, usage, elapsed_ms or prompt, or drops
    outcome, referral or text, or the call-assembly assertions on runDiagnose's own argument stop holding
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: does not refuse a subject missing only an attribute the derived requirements leave optional, and
    answers with the resolved Assessment narrowed to the response DTO's four fields
  proves: the controller's return value is the narrow DTO shape even on the not-refused path that reaches
    runDiagnose after a case-input-requirements check
  fails_when: the returned value carries register, usage, elapsed_ms or prompt, or the four DTO fields
    do not match the resolved Assessment's own outcome/referral/text
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: reaches runDiagnose when the subject covers every required attribute the derived requirements
    name, and answers with the resolved Assessment narrowed to the response DTO's four fields
  proves: the controller's return value stays the narrow DTO shape on the ordinary covered-requirements
    path
  fails_when: the returned value carries register, usage, elapsed_ms or prompt, or the four DTO fields
    do not match the resolved Assessment's own outcome/referral/text
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: answers 200 with the resolved assessment narrowed to the response DTO's four fields, for a released-state
    pinned version
  proves: the wired route (Fastify app.inject over the real diagnose.routes.ts plugin) answers with the
    narrow four-field wire shape, not the full Assessment the mocked runDiagnose resolved
  fails_when: response.json() carries register, usage, elapsed_ms or prompt, or does not equal the resolved
    Assessment's own outcome/referral/text
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: answers 200 with the resolved assessment narrowed to the response DTO's four fields, when the
    subject covers every required attribute the derived requirements name
  proves: the wired route answers with the narrow four-field wire shape on the covered-requirements path
    too
  fails_when: response.json() carries register, usage, elapsed_ms or prompt, or does not equal the resolved
    Assessment's own outcome/referral/text
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the real, relational store for the request, readable back through RelationalInvestigationStore,
    before asserting anything about the HTTP response -- and the response then carries the fixture case's
    own resolved fallback assessment narrowed to the response DTO's four fields
  proves: over the full real stack (real Postgres store, real pipeline, fake evaluator/consolidator),
    the persisted document still carries the full eight-field Assessment while the HTTP response carries
    only the narrow four-field DTO -- the two assertions now diverge in shape on purpose, which is exactly
    the fix under test
  fails_when: response.json() carries register, usage, elapsed_ms or prompt, or the stored document.assessment
    stops carrying all eight fields
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers 200 with the diagnose call's resolved assessment narrowed to the response DTO's four fields,
    for a request naming an existing case, subject, narrative and requester
  proves: build-app.ts's own wiring of the diagnose route answers with the narrow wire shape end to end
    through the full app
  fails_when: response.json() carries register, usage, elapsed_ms or prompt, or does not equal the resolved
    Assessment's own outcome/referral/text
- file: src/__tests__/unit/http/build-app.spec.ts
  name: carries exactly outcome, referral, determining_hypothesis and text on the wire -- never register,
    usage, elapsed_ms or prompt -- when the resolved outcome names a determining hypothesis
  proves: repurposed from the test that used to assert the wire carries all eight fields; now proves the
    opposite -- that the optional determining_hypothesis is preserved by the narrowing while the four
    call-record fields are dropped, so the fix does not accidentally drop an intentionally-present optional
    field along with the ones that must go
  fails_when: response.json() carries register, usage, elapsed_ms or prompt, or omits determining_hypothesis,
    or any of the four remaining values differs from what runDiagnose resolved
- file: src/__tests__/unit/http/build-app.spec.ts
  name: omits determining_hypothesis, register, usage, elapsed_ms and prompt on the wire, and carries
    no verdict, citation or evidence field, when the resolved outcome names no determining hypothesis
  proves: the narrowing also drops determining_hypothesis when the assessment does not carry it, alongside
    register/usage/elapsed_ms/prompt, on the fallback-outcome path
  fails_when: response.json() carries any field beyond outcome, referral and text, or one of those three
    does not match the resolved Assessment
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers each of two requests naming the same case, subject, narrative and requester with that
    call's own resolved assessment narrowed to the response DTO's four fields, never a cached or joined
    value
  proves: the narrowing is applied per-request rather than to some shared or memoized value, and each
    response's narrow shape still tracks its own request's own resolved Assessment
  fails_when: either response carries register, usage, elapsed_ms or prompt, or the two responses' outcome/text
    swap or otherwise fail to track their own call's resolved Assessment
not_applicable:
- edge_case: Absent or undefined register, usage, elapsed_ms or prompt on a ConsolidationOutcome or an
    Assessment
  why: all four are declared required (never optional) on both types; TypeScript refuses any object literal
    lacking them at every construction site in the tree, so there is no reachable 'absent' runtime path
    beyond the definedness test already written
- edge_case: Two concurrent consolidate() calls racing under different registers
  why: no criterion or bound node claims a concurrency guarantee specific to the register a call's own
    answer carries; the pipeline's judgment-concurrency behavior is already proven, unchanged, by pre-existing
    tests this task does not touch
- edge_case: A duplicate or uniqueness constraint over register values
  why: register is a two-value enumeration (formal/plain); 'duplicate' has no meaning over it, and no
    criterion claims one
- edge_case: Boundary values for usage's integer fields (zero, a very large value)
  why: zero is already exercised (FakeAssessmentConsolidator's placeholder usage, and several run-diagnosis
    fixtures); no criterion states a lower or upper bound beyond 'integer'
- edge_case: An operation attempted against state that forbids it
  why: this task widens a value object's shape and threads it through existing call chains; it introduces
    no new state transition, write-guard or refusal path of its own
- edge_case: The consolidation dependency answering in an unexpected shape, specifically omitting a register
  why: register is derived from the call's own input parameter (consolidationRegister), never read out
    of the provider's response, so there is no provider-shape failure mode for it distinct from the pre-existing
    provider-failure tests, unchanged by this task
- edge_case: A fifth call site asserting the wide wire shape somewhere else in the four HTTP-facing test
    files
  why: a grep across all four files for the wide-Assessment comparison pattern found none remaining outside
    the ten call sites now narrowed; the one surviving full-Assessment comparison (diagnose-e2e.spec.ts's
    stored-document assertion) is deliberate, since the persisted record still carries all eight fields
untested:
- Whether the diagnose HTTP endpoint's wire response was meant, by design, to expose all eight Assessment
  fields or only the historical four is not settled by any criterion or specification node this task implements;
  this proof only establishes what the code now does (narrow, per the fix-forward) and that it matches
  the deferred decision, not that the deferred decision itself is the right one.
- simulate-case.dto.ts's assessmentSchema was never audited for the same wire-leak this task's fix-forward
  closed on the diagnose route; whether handleSimulateCaseRequest has the identical gap is unconfirmed
  and untested here.
- The Anthropic adapter's real network behavior under a genuinely concurrent pair of formal/plain calls
  is unproven -- the adapter test doubles the SDK client, so only the request/response mapping is exercised,
  not the live provider's own concurrency handling.
---

## What it is

The proof for the consolidation call-record chain fix: register, usage, elapsed_ms and prompt
reaching the returned and persisted Assessment, and the HTTP wire response staying narrowed to
the four legacy DiagnoseResponseDto fields after a fix-forward closed a leak this task's own
widening caused.

## Notes

Three suite runs were needed before the whole tree passed clean. suite (the first): one real
failure, cause code per a failure-diagnostician -- the widened Assessment reached the /v1/diagnose
wire response unfiltered, contradicting the implementation's own deferred note; closed by a
task-implementer fix-forward (toDiagnoseResponse) plus a test-author pass realigning four test
files that had asserted the leaked shape. suite-2: one new failure -- a pre-existing test
(diagnose.controller.spec.ts, its own case-input-requirements test) never mocked runDiagnose's
resolved value, which the new narrowing helper now dereferences; closed by a one-line test-author
fix giving that test a minimal Assessment fixture. suite-3: clean, 141 files / 1664 tests passing.
