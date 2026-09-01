---
title: consolidation-call-record-chain-hotfix, review
summary: What four passes found over the source and tests carrying register, usage, elapsed_ms and prompt
  from the consolidation call to the assessment and through persistence.
reviewed:
- src/investigation/assessment.ts
- src/investigation/assessment-consolidator.port.ts
- src/investigation/draft-assessment-text.ts
- src/investigation/investigation-pipeline.ts
- src/investigation/fake-assessment-consolidator.adapter.ts
- src/investigation/anthropic-assessment-consolidator.adapter.ts
- src/persistence/relational-investigation-store.repository.ts
- migrations/0014-assessment-consolidation-call-record.sql
- src/http/diagnose.controller.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/diagnose.controller.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/investigation-pipeline.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
tasks:
- task/consolidation-call-record-chain-hotfix/register-usage-elapsed-ms-and-prompt-reach-the-assessment
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: Every Assessment an investigation-pipeline run returns carries all eight attributes domain/investigation/assessment
    declares, never only outcome, referral, determining_hypothesis and text.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and
      prompts together, for one confirmed hypothesis
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: carries only the consolidation call's own prompt under prompts.writing and on the assessment's
      own prompt field, never merging in a judged hypothesis's own distinct judgment prompt
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: exposes exactly outcome, referral, determining_hypothesis, text, register, usage, elapsed_ms
      and prompt — never a verdict or evidence field — on a confirmed-path answer
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: exposes exactly outcome, referral, text, register, usage, elapsed_ms and prompt — no determining_hypothesis,
      verdict or evidence field — on a fallback-path answer
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: Assessment declares register typed exactly domain/knowledge/consolidation-register and usage
      typed exactly domain/investigation/usage — never a wider string or a looser numeric shape standing
      in for either
- criterion: assessment-consolidator.port.ts's consolidate() operation answers with the register it actually
    used to produce the text, in addition to the usage, elapsed_ms and prompt it already answers with
    — the same call-record shape those three already have.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers a defined register, usage, elapsed_ms and prompt on every call, never leaving any of
      the four undefined
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers register as exactly the consolidationRegister the call itself carried — 'formal' for
      a formal call and 'plain' for a plain one — never a fixed placeholder the way usage, elapsed_ms
      and prompt are
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: ConsolidationOutcome declares register typed exactly domain/knowledge/consolidation-register
      and usage typed exactly domain/investigation/usage — never a wider string or a looser numeric shape
      standing in for either
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers register as exactly the register the call itself carried, for each of the two declared
      registers
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: varies the system prompt with the consolidation register, given the same evaluations and evidence
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers usage read exactly from the provider response's own usage on a successful call
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers an elapsed_ms reflecting the real wall-clock time the provider call itself took, rather
      than a fixed value
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers a prompt equal to exactly the same data block sent as the call's own user message content
- criterion: The register on a returned Assessment equals exactly the register the consolidate() call
    answered with — never a value assumed by the caller in advance, and never a value different from what
    the call actually used.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: copies register, usage, elapsed_ms and prompt from the consolidator's own ConsolidationOutcome
      onto the returned Assessment unchanged — register exactly as the call answered with, never the register
      the caller requested
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: writes an assessment carrying exactly the register, usage, elapsed_ms and prompt the consolidation
      call itself answered with — never the register the caller requested, when the two differ
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and
      prompts together, for one confirmed hypothesis
- criterion: The register and usage values carried onto the assessment are exactly the domain/knowledge/consolidation-register
    enumeration value and domain/investigation/usage integers the consolidate() call answered with — never
    a wider or looser type standing in for either.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: Assessment declares register typed exactly domain/knowledge/consolidation-register and usage
      typed exactly domain/investigation/usage — never a wider string or a looser numeric shape standing
      in for either
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: ConsolidationOutcome declares register typed exactly domain/knowledge/consolidation-register
      and usage typed exactly domain/investigation/usage — never a wider string or a looser numeric shape
      standing in for either
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: copies register, usage, elapsed_ms and prompt from the consolidator's own ConsolidationOutcome
      onto the returned Assessment unchanged — register exactly as the call answered with, never the register
      the caller requested
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: writes an assessment carrying exactly the register, usage, elapsed_ms and prompt the consolidation
      call itself answered with — never the register the caller requested, when the two differ
  why: The values half is asserted at runtime against distinct non-default values. The 'never a wider
    or looser type' half rests entirely on two expectTypeOf().toEqualTypeOf() assertions, which are compile-time
    only and no-ops in an ordinary run — they fail only under a type-checking pass of the suite.
- criterion: The prompt on a returned Assessment is the consolidation prompt as the writing call actually
    materialized it, and is never carried on a field of the pipeline's own result object instead of on
    the assessment.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: carries only the consolidation call's own prompt under prompts.writing and on the assessment's
      own prompt field, never merging in a judged hypothesis's own distinct judgment prompt
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and
      prompts together, for one confirmed hypothesis
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: copies register, usage, elapsed_ms and prompt from the consolidator's own ConsolidationOutcome
      onto the returned Assessment unchanged — register exactly as the call answered with, never the register
      the caller requested
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers a prompt equal to exactly the same data block sent as the call's own user message content
- criterion: A stored and re-read Assessment carries the same register, usage (input_tokens and output_tokens),
    elapsed_ms and prompt values the write recorded — none of the four is dropped or altered by a persistence
    round trip.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back the assessment's own register as 'plain' when that is what was written, rather than
      the column's own 'formal' default surviving from another row or the migration's DEFAULT clause
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends every declared attribute of the root row — identity, subject type, prompt version, model,
      pinned case, assessment, cost, durations and written_at — as the root insert's own params, in order
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles the assessment with its outcome, referral, determining_hypothesis, text, register,
      usage, elapsed_ms and prompt, when a hypothesis was named
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment narrowed to the response DTO's
      four fields
findings:
- pass: conformance
  file: migrations/0014-assessment-consolidation-call-record.sql
  where: lines 1-2, the assessment_register column addition
  evidence: ALTER TABLE investigations ADD COLUMN assessment_register TEXT NOT NULL DEFAULT 'plain';
  cost: domain/investigation/assessment requires register "never absent, because the writing call always
    settles on some one register before it can produce text at all" -- yet every investigation row written
    before this migration now reports 'plain' for a consolidation call that, under this same contract,
    never ran and never settled anything on it. A reader of one of those historical rows learns a specific
    register was used when none in fact was chosen, and no node states what a pre-existing row should
    report for a field it never produced.
  correction: either let the column state that no register was ever recorded for a pre-existing row, or
    have the specification decide what a call-less historical record reports for this required field,
    rather than the migration silently picking a lawful enum value.
- pass: conformance
  file: src/investigation/assessment-consolidator.port.ts
  where: lines 16-20, the consolidate signature
  evidence: 'consolidate(evaluations: readonly Evaluation[], evidence: readonly Evidence[], consolidationRegister:
    ConsolidationRegister): Promise<ConsolidationOutcome>;'
  cost: the third parameter is typed as a required, always-concrete ConsolidationRegister, so the port's
    own contract admits no state in which "the pinned case version declares none" ever reaches an implementation
    -- the very situation rules/investigation/the-consolidation-answer-states-its-register assigns to
    the adapter to resolve. An adapter written to this port alone has no way to discover it was ever meant
    to decide a default; the port always hands it one already chosen.
  correction: state the port's contract so a caller may pass no register at all, leaving the default to
    the implementation that runs, the way the rule describes.
- pass: conformance
  file: src/investigation/investigation-pipeline.ts
  where: line 73, the consolidationRegister passed into draftAssessment
  evidence: 'consolidationRegister: options.case.consolidation_register ?? options.defaultConsolidationRegister,'
  cost: rules/investigation/the-consolidation-answer-states-its-register states the register is "settled
    inside the call" and that, where the pinned case version declares none, "only the adapter that ran
    knows which register it kept" -- unknowable to a caller in advance. Here the pipeline itself resolves
    the substitute value, from its own defaultConsolidationRegister option, before the consolidator is
    ever invoked; neither adapter ever computes a default of its own, so a reader looking for "the adapter's
    own default" will not find it in any adapter -- it lives in the caller, contradicting the rule's own
    premise.
  correction: move the defaulting decision into the consolidator's own call -- accept the case version's
    consolidation_register as possibly absent, let the adapter that runs supply its own default when it
    is, and report back whichever register it actually used -- rather than resolving the substitute value
    in the pipeline ahead of the call.
- pass: standard
  file: src/__tests__/unit/http/diagnose.routes.spec.ts
  where: lines 13-58, the heldResolution / heldManifestEntry / heldCase / noRequirements fixture block
  cites: MNT-03
  evidence: 'function heldResolution(outcome = ''an-outcome''): Resolution { return { outcome, referral:
    { action: ''an-action'', recipient: ''a-recipient'' } }; } ... function noRequirements(): CaseInputRequirementsResult
    { return { requirements: [], capabilities_with_malformed_input_schema: [] }; }'
  cost: 'The Case fixture this suite asserts against is a second copy of the one in diagnose.controller.spec.ts,
    in this same change. The day Case gains a required field, or the released/draft fixture has to change
    shape, one of the two is updated and the other keeps compiling against the shape it was written for.
    The copies have already begun to drift: the controller spec types its REQUEST_BODY as DiagnoseRequestDto,
    this one leaves it untyped.'
  correction: lift heldResolution, heldManifestEntry, heldCase and noRequirements into one shared fixture
    module and have both specs import them.
- pass: standard
  file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  where: lines 28-159, the aHypothesis / manifestEntryOf / aCase / schemaDeclaring / aCapability / FakeCapabilityQuery
    / FakeGlossaryQuery / ImmediateHypothesisEvaluator / CountingHypothesisEvaluator / CountingObservationSource
    / ScriptedAssessmentConsolidator / expectedOkEvidence block
  cites: MNT-03
  evidence: 'class FakeGlossaryQuery implements IGlossaryQuery { public async readVocabularyTerm(...):
    Promise<TermResolution> { return { held: false, vocabulary, name }; } ... class ScriptedAssessmentConsolidator
    implements IAssessmentConsolidator { public async consolidate(): Promise<ConsolidationOutcome> { return
    this.outcome; } }'
  cost: 'Every one of these eleven fixtures and stand-ins exists a second time in run-diagnosis.spec.ts,
    also in this change. Two copies have already diverged: this file''s FakeGlossaryQuery answers held:false
    for every vocabulary term, the other''s answers held:true for a seeded attribute, so the two suites
    now disagree about what the glossary boundary does while claiming to stand in for the same thing.'
  correction: move the shared fixtures and stand-ins into one module both specs import -- the glossary
    stand-in in the form that supports seeding -- and delete the copies.
- pass: standard
  file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  where: lines 199-204, IMPORT_SPECIFIER_PATTERN and runDiagnosisImportSpecifiers
  cites: MNT-03
  evidence: 'const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*[''"]([^''"]+)[''"]/g; async function
    runDiagnosisImportSpecifiers(): Promise<readonly string[]> { ... }'
  cost: 'The same regex and the same matchAll extraction are written out four more times in this change.
    Five tests whose whole claim is "this module imports nothing forbidden" rest on five copies of one
    pattern: an import form the pattern misses makes all five pass while proving nothing.'
  correction: put the specifier pattern and the extraction in one test helper module and have all five
    specs call it.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 506-519, the test 'does not resolve until persistence has actually written the investigation,
    then resolves with the written investigation's own assessment'
  cites: TST-01
  evidence: const store = new DelayedInvestigationStore(500); ... await vi.advanceTimersByTimeAsync(499);
    expect(tracker.settled()).toBe(false); await vi.advanceTimersByTimeAsync(1); const assessment = await
    resultPromise; expect(assessment).toEqual(HAPPY_PATH_ASSESSMENT);
  cost: 'An assertion sits between two acts, so the test''s claim cannot be read off its shape: a reader
    has to reconstruct which act each expectation belongs to. The same assert-then-act-again shape recurs
    at six other places in this file, so the cost is paid on every timing failure this suite reports.'
  correction: where the intermediate check is part of the claim, drive the clock to the boundary, collect
    what is needed into values, then assert on all of them together after the last act; where it is a
    second claim, make it a second test.
- pass: standard
  file: src/http/diagnose.controller.ts
  where: lines 22-25, the released-state gate at the top of handleDiagnoseRequest
  cites: ARC-04
  evidence: 'const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
    if (pinnedCase.state !== ''released'') { throw new CaseVersionNotReleasedError(pinnedCase.slug, pinnedCase.version,
    pinnedCase.state); }'
  cost: 'Whether a pinned case version may be diagnosed against is decided in the HTTP handler, so it
    is a rule that exists only over HTTP: any other caller of dependencies.runDiagnose runs a diagnosis
    against a draft version with nothing refusing it.'
  correction: move the state check into a named refusal in the investigation layer, beside refuseSubjectMissingRequiredCaseInputs,
    and have the diagnosis path itself call it.
- pass: standard
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  where: line 27, the constructor's client construction
  cites: STK-08
  evidence: 'this.client = new Anthropic({ apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY });'
  cost: 'This credential is environment input that reaches the SDK without passing through any schema:
    nothing parses it, nothing refuses its absence. The consequence is a deployment that boots happily
    with the variable unset and fails on the first consolidation call, as a provider error at request
    time, instead of at load as a refusal naming the missing variable.'
  correction: declare ANTHROPIC_API_KEY in the Zod shape loadEnv parses and pass it in through AnthropicConsolidatorConfig.apiKey,
    then drop the process.env fallback.
- pass: failures
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time (line
    373)
  evidence: 'AssertionError: expected 151 to be greater than 151 -- at expect(written?.durations_total).toBeGreaterThan((written?.durations_collection
    ?? 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0))'
  cost: the suite is red on a failure unrelated to the register/usage nodes this task implements; domain/investigation/durations.md
    describes total as measured independently of the stage sum, not as provably strictly greater than
    it on every measurement, so the assertion's strictness is stronger than what the node states -- at
    millisecond resolution the genuine overhead the node describes can round to zero, producing exactly
    the tie observed. This failure sits in a file outside this task's own file set and reproduces a flake
    already identified in an earlier review capture of this same tree.
  correction: loosen the assertion to admit a tie at millisecond resolution -- assert durations_total
    is greater than or equal to the summed stage durations.
  cause: test
failures_counted: 1
run: run/consolidation-call-record-chain-hotfix
---

## What it is

The first review of consolidation-call-record-chain-hotfix: coverage over its six criteria,
specification conformance over the five nodes it implements, standard conformance over the
project's own registry, and diagnosis of the one failure the captured suite run reported.

## Notes

The one captured failure sits outside this task's own file set (a real-wall-clock timing
assertion in diagnose-server.factory.spec.ts, from the later durations-total-real-elapsed-hotfix
task) and reproduces a flake already observed once in this same tree during that task's own
delivery. The specification-conformance pass surfaced a real divergence between this task's own
delivered code and the rule it implements: the register default is resolved by the pipeline
caller rather than by the consolidator adapter that runs, contradicting
rules/investigation/the-consolidation-answer-states-its-register's own premise that only the
adapter knows which register it kept.
