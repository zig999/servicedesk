---
title: End-to-end proof of the diagnose flow with faked LLM ports
summary: 'This task''s own deliverable is the test itself, not new production wiring: a task-implementer
  investigated first and found every piece already exported (createDiagnoseRunner already accepts arbitrary
  evaluator/consolidator instances, buildApp is already agnostic to which pipeline produced runDiagnose),
  so no new src/ file was needed — the one file this task delivers is the end-to-end test that assembles
  them.'
task: sha256:7ea56e672211a6e1f3b5b4d6df624254f793f4761ff1453371968c774303ab02
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/http-surface-end-to-end-diagnose-proof-suite
files:
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: drives POST /v1/diagnose against buildApp() with createDiagnoseRunner wired test-locally to
    FakeHypothesisEvaluator/FakeAssessmentConsolidator/FakeObservationSource over the real fixture case,
    proving the whole synchronous flow end to end — this is this task's entire deliverable, per its own
    criteria stating a test's required behavior directly
criteria:
- criterion: The test sends one HTTP request to the diagnose endpoint naming the fixture case, a subject,
    a narrative and a requester, and asserts the HTTP response carries the assessment.
  met: true
  how: 'the test calls app.inject({method: ''POST'', url: ''/v1/diagnose'', payload: {...}}) naming the
    fixture case (intermittent-connection-outage/1), the canonical seeded subject (contract/CTR-0001),
    a narrative and a requester, and asserts the response carries the fixture case''s own resolved fallback
    assessment'
- criterion: The test substitutes fakes behind the published hypothesis-evaluator and assessment-consolidator
    ports, so the run makes no call to the Anthropic API.
  met: true
  how: the test wires createDiagnoseRunner directly (not createProductionDiagnoseRunner) with FakeHypothesisEvaluator
    and FakeAssessmentConsolidator; a static scan confirms no file this composition reaches imports @anthropic-ai/sdk
- criterion: Running the test requires no ANTHROPIC_API_KEY or other live network credential to be present.
  met: true
  how: the suite deliberately deletes process.env.ANTHROPIC_API_KEY in beforeEach and restores it in afterEach,
    so the passing run is real evidence the credential was never needed
- criterion: The test asserts an investigation was written for the request — read back from the file-backed
    investigation store — before it asserts anything about the HTTP response.
  met: true
  how: the test reads the investigation back from the file-backed store via createInvestigationStore against
    a temp data directory, asserting on it before asserting on the HTTP response
nodes:
- node: contracts/system/guided-diagnosis
  how: 'exercised, not newly encoded: the test drives the whole promise (choose a case, name the subject/narrative,
    receive an assessment within the flow) against the already-delivered composition'
- node: contracts/investigation/diagnosis
  how: 'exercised: the test drives the synchronous entry with case/subject/narrative/requester in and
    an assessment out, over the real fixture case'
- node: constraints/diagnosis-answers-synchronously
  how: 'exercised: the test awaits app.inject() and receives the assessment in the same response, no job
    or polling'
- node: domain/investigation/assessment
  how: 'exercised: the response the test asserts on is exactly this value object as returned by the HTTP
    layer'
- node: domain/investigation/hypothesis-evaluator
  how: 'exercised: FakeHypothesisEvaluator, the port''s own fake, judges each hypothesis in this run'
- node: domain/investigation/assessment-consolidator
  how: 'exercised: FakeAssessmentConsolidator, the port''s own fake, writes the text in this run'
- node: constraints/judgment-runs-behind-a-port
  how: 'honored: the resolution this constraint names explicitly ("an LLM in production, a fake in test")
    is exactly what this test demonstrates by construction — judgment runs through the published port
    with a fake wired behind it'
- node: constraints/consolidation-runs-behind-a-port
  how: 'honored: the same resolution, for consolidation — a fake wired behind the published port, never
    the LLM'
inferences:
- inferred: a task-implementer's own investigation, performed first, concluded no new production file
    was needed — createDiagnoseRunner already accepts arbitrary evaluator/consolidator/observationSource,
    buildApp is already agnostic to which pipeline produced runDiagnose, and the now/deadline-stamping
    glue createProductionDiagnoseRunner already contains is reproduced inline in the test rather than
    extracted into a second factory
  from: the inventory's own must_not_duplicate entry naming createDiagnoseRunner as the one place this
    wiring belongs, and the observation that no real deployment would ever call a fake-backed composition,
    so extracting one into src/factories/ would be test-support code misplaced as production wiring
- inferred: the deterministic scenario chosen (both fixture hypotheses judged inconclusive, matching the
    case's own declared fallback) rather than a confirmed-hypothesis path
  from: the fixture case's own fallback is already fully declared and predictable without needing to pin
    evidence bytes end to end through the whole HTTP-to-persistence path; the confirmed path is already
    exercised at the unit level by sibling tasks
preserved:
- every already-delivered production file this test wires (createDiagnoseRunner, buildApp, the controller,
  the case-query and investigation-store factories, the three fake adapters, run-diagnosis and its stages)
  — none modified by this task
- the fixture case and its glossary/capability/observation data (task/case-fixture/author-diagnose-fixture-case's
  own delivery) — read, never modified
deferred:
- what: a confirmed-hypothesis path exercised end to end through this exact faked-port wiring
  why: the deterministic inconclusive/fallback scenario keeps the test tractable without pinning evidence
    bytes; the confirmed path is already proven at the unit level elsewhere
- what: asserting the exact bytes of the written investigation's own evidence array
  why: already proven by evidence-collection-stage.spec.ts and investigation-factory.spec.ts at the unit
    level; this test asserts on the assessment alone
---

## What it is

One test drives the endpoint with fake LLM adapters standing behind the two published ports.
It is the one place this plan proves the whole path runs together, not just each piece alone.

## Notes

A prior task-implementer investigation, run before this record, concluded no new production file was needed — recorded above under inferences. This task's whole deliverable is the test file itself.
