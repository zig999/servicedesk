---
task: sha256:cd867f65be8dcb54a615e0f49a39cb8fbe1a3af0787bd4b61be67f44551d8afd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-widen-judgment-and-consolidation-ports-build-4
title: Widened judgment and consolidation ports carrying usage, elapsed time and prompt
summary: IHypothesisEvaluator.evaluate() gains an optional call record and IAssessmentConsolidator.consolidate()
  a required one; judgment-stage.ts attaches it onto every Evaluation whose call actually happened.
files:
- path: src/investigation/usage.ts
  effect: new file declaring the Usage value object (input_tokens, output_tokens, both required) — the
    call-level provider-spend shape domain/investigation/usage declares, with no behavior of its own.
- path: src/investigation/evaluation.ts
  effect: widens the Evaluation union with optional usage, elapsed_ms and prompt on all three verdict
    shapes, so a judgment call's own record can travel on the domain record without being required.
- path: src/investigation/hypothesis-evaluator.port.ts
  effect: widens EvaluationOutcome with the same three optional fields (usage/elapsed_ms/prompt), so evaluate()'s
    return shape can carry a call's own record while every existing answer that omits them still satisfies
    the type.
- path: src/investigation/assessment-consolidator.port.ts
  effect: declares a new ConsolidationOutcome type (text plus required usage, elapsed_ms and prompt) and
    changes IAssessmentConsolidator.consolidate()'s return type from Promise<string> to Promise<ConsolidationOutcome>.
- path: src/investigation/judgment-stage.ts
  effect: asEvaluation() now also carries usage/elapsed_ms/prompt from the evaluate() answer it is already
    threading verdict/citations/reason from, through a new callRecordOf() helper that includes each field
    only where the port's own answer actually returned it; the three synthetic fallbacks (no-data, deadline-exceeded,
    judgment-failure) are unchanged and carry none of the three.
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  effect: consolidate() now returns a ConsolidationOutcome — the model's own trimmed text, a placeholder
    zero-valued usage, an elapsed_ms of 0, and prompt set to exactly the data block this adapter already
    assembled and sent as the call's user message; no other behavior changed.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  effect: consolidate() now returns a ConsolidationOutcome wrapping the seeded text with a placeholder
    zero-valued usage, an elapsed_ms of 0 and an empty-string prompt; seed()/fixtureKey() and the unseeded-key
    throw are unchanged.
- path: src/investigation/draft-assessment-text.ts
  effect: unwraps consolidator.consolidate()'s own text field from the now-object ConsolidationOutcome
    it answers, instead of using its return value directly as the text — the minimal, behavior-preserving
    change this port's own required-shape widening forces on its one production caller, so the module
    still compiles and Assessment.text is exactly what it always was.
criteria:
- criterion: IHypothesisEvaluator.evaluate()'s return type declares an optional usage ({input_tokens,
    output_tokens}), an optional elapsed_ms and an optional prompt.
  met: true
  how: 'hypothesis-evaluator.port.ts''s EvaluationOutcome union now declares usage?: Usage, elapsed_ms?:
    number and prompt?: string on all three of its members (confirmed, refuted, inconclusive).'
- criterion: IAssessmentConsolidator.consolidate()'s return type declares usage, elapsed_ms and prompt,
    not optional.
  met: true
  how: 'assessment-consolidator.port.ts declares ConsolidationOutcome with usage: Usage, elapsed_ms: number
    and prompt: string, all required, and consolidate() now returns Promise<ConsolidationOutcome>.'
- criterion: An Evaluation built from a hypothesis whose judgment call happened carries the usage, elapsed_ms
    and prompt that call's own port response returned.
  met: true
  how: judgment-stage.ts's asEvaluation() — the one function that turns an evaluate() answer into an Evaluation,
    called for every first or retry call that actually happened and answered — now also copies that same
    outcome's usage/elapsed_ms/prompt through callRecordOf(), present exactly where the port's own answer
    carried them.
- criterion: An Evaluation whose reason is no-data carries no usage, elapsed_ms or prompt.
  met: true
  how: noDataEvaluation() in judgment-stage.ts builds its literal without a usage/elapsed_ms/prompt key
    at all — it is never reached through asEvaluation(), since a hypothesis whose evidence is not all-ok
    degrades before the pool and evaluate() is never called for it.
- criterion: The hypothesis-evaluator adapters (Anthropic and fake) are byte-for-byte unchanged — their
    optional usage/elapsed_ms/prompt fields being absent still satisfies the widened return type.
  met: true
  how: anthropic-hypothesis-evaluator.adapter.ts and fake-hypothesis-evaluator.adapter.ts are not among
    the files this delivery touches at all; both continue to answer EvaluationOutcome literals without
    usage/elapsed_ms/prompt, which the now-optional fields on the widened type accept without modification.
- criterion: The assessment-consolidator adapters (Anthropic and fake) change only enough to satisfy the
    widened, required ConsolidationOutcome return type — a placeholder usage of input_tokens 0 and output_tokens
    0, and elapsed_ms of 0, with prompt as whatever the adapter already had assembled before this task
    touched it. Neither adapter gains real provider-usage reading or real call timing here — that is task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing's
    and task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own declared scope,
    and duplicating it here is exactly the over-reach this criterion now exists to rule out.
  met: true
  how: 'both adapters'' consolidate() bodies are otherwise unchanged (same provider call, same prompt
    assembly, same fixture lookup) and now return { text, usage: PLACEHOLDER_USAGE, elapsed_ms: 0, prompt
    }, where PLACEHOLDER_USAGE is { input_tokens: 0, output_tokens: 0 }; the Anthropic adapter''s prompt
    is exactly buildDataBlock()''s own already-assembled data block (the same string it always sent as
    the user message), the fake''s prompt is the empty string since it assembles no prompt of its own.
    Neither reads message.usage or measures elapsed time.'
nodes:
- node: domain/investigation/usage
  encoded_at:
  - src/investigation/usage.ts
  how: the node's own two required attributes (input_tokens, output_tokens) are declared verbatim as the
    new Usage type, carried by both widened ports' own call-record fields rather than domain/investigation/cost's
    investigation-wide total.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/judgment-stage.ts
  how: the node's own usage/elapsed_ms/prompt attributes (all optional per its schema) are declared on
    the Evaluation type, and judgment-stage.ts's asEvaluation()/callRecordOf() encode the node's own present-exactly-when-a-call-happened,
    absent-when-reason-no-data rule — extended symmetrically to this stage's other two synthetic fallbacks
    (deadline-exceeded, judgment-failure), which likewise never draw from a call's own answer.
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  how: this node states usage/elapsed_ms/prompt as required (never optional) on the consolidation call's
    own record, because a consolidation call never has a no-data reason to have skipped running; that
    fact is encoded at the port boundary as ConsolidationOutcome's three required fields. Carrying these
    fields onto the Assessment value object itself (and its own register attribute) is not reached by
    this task — deferred to task/investigation-telemetry/diagnose-reports-real-cost-and-durations, which
    lists this same node among its own implements.
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  how: the port's own judged responsibility (evidence in, a cited-and-complete evaluation out) is unchanged;
    only EvaluationOutcome's return shape widens with the three optional call-record fields, so no adapter's
    own existing behavior is disturbed.
- node: domain/investigation/assessment-consolidator
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  how: the port's own judged responsibility (evaluations/evidence/register in, the assessment's text out)
    is unchanged in substance; consolidate() now answers that text together with the call's own required
    usage/elapsed_ms/prompt, and both adapters are updated to the minimum that satisfies the new required
    shape.
inferences:
- inferred: draft-assessment-text.ts, the one production caller of consolidate(), unwraps the new ConsolidationOutcome's
    text field rather than using the return value directly, with no other change to how Assessment is
    assembled.
  from: criterion 2's mandate that consolidate() return a required, non-string ConsolidationOutcome ripples
    to its one caller by simple type propagation; the inventory's own risk note on this port change (breaks
    every current implementer and caller of the port) named this necessity generally, and leaving the
    one production call site unfixed would leave the delivery not compiling, which the task cannot have
    intended.
- inferred: usage/elapsed_ms/prompt attach to an Evaluation only where judgment-stage.ts's own asEvaluation()
    is already threading that same outcome's verdict/citations/reason through unchanged (a first or retry
    call whose answer — decided or the adapter's own inconclusive — is kept), never for a call whose answer
    is discarded by this stage's own synthetic fallback (a retry's citations still failing structural
    validation, falling back to judgment-failure) or for a call that never happened at all (no-data, deadline-exceeded,
    or judgment-failure before a retry is attempted).
  from: domain/investigation/evaluation's own text gives present-exactly-when-a-call-happened with a single
    worked example (no-data, judgment was never called at all) and is silent on a call that did happen
    but whose citations the stage itself later invalidates; the code's own existing structural seam —
    asEvaluation() as the sole pass-through of a port response, versus three separate synthetic-fallback
    functions for every stage-decided reason — is the narrowest, already-established distinction to extend
    rather than inventing a new one.
- inferred: FakeAssessmentConsolidator's placeholder prompt is the empty string, not the fixture key or
    any other locally-computed value.
  from: this fake assembles no prompt of any kind (it answers purely from a fixture map keyed by call
    content), so there is nothing to reuse the way the Anthropic adapter reuses its own already-built
    data block; the empty string follows this codebase's own established nothing-meaningful-to-put-there
    convention (fixtureKey's own comment; judgment-stage.ts's noDataEvaluation for a citation field).
- inferred: AnthropicAssessmentConsolidator's prompt is exactly buildDataBlock()'s own output — the user-message
    content, not the system prompt or the two concatenated.
  from: the task's own wording (prompt as whatever the adapter already had locally assembled) and this
    codebase's own established convention for the judgment/consolidation prompt (constraints/the-consolidation-prompt-is-closed)
    both point at the one closed, delimited data block already sent to the model as the call's own materialized
    prompt.
preserved:
- AnthropicHypothesisEvaluator and FakeHypothesisEvaluator's exact current behavior, byte-for-byte, per
  criterion 5.
- judgment-stage.ts's own pool/deadline/retry/citation-validation control flow and every verdict/citations/reason
  it produces for confirmed, refuted and every inconclusive reason — only the additive usage/elapsed_ms/prompt
  attachment changed.
- draftAssessment's own outcome/referral/determining_hypothesis assembly and its zero-import guarantee
  over the case document module — only how text is extracted from consolidate()'s answer changed.
- AnthropicAssessmentConsolidator's prompt assembly (buildSystemPrompt/buildDataBlock), its provider call
  shape and its granting no tools — only the return value's wrapping shape changed.
- FakeAssessmentConsolidator's seed()/fixtureKey() keying-by-content and its unseeded-key throw.
deferred:
- what: Reading the Anthropic provider's own message.usage and measuring each call's own wall-clock elapsed
    time, for both the hypothesis-evaluator and assessment-consolidator Anthropic adapters.
  why: task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing's own declared scope;
    a prior delivery attempt implemented this here, over-reached into that task and the fake-adapters
    task, and was fully reverted — this delivery's own corrected boundary excludes it.
- what: Giving FakeAssessmentConsolidator and FakeHypothesisEvaluator their own declared, deterministic
    zero-valued usage/elapsed_ms shapes and a placeholder prompt string beyond the minimal empty-string
    one this delivery uses.
  why: task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own declared scope.
- what: Carrying usage, elapsed_ms and prompt (and consolidation register) onto the Assessment value object
    itself, and accumulating cost.calls/cost.input_tokens/cost.output_tokens and durations from every
    judgment and consolidation call's own record.
  why: task/investigation-telemetry/diagnose-reports-real-cost-and-durations's own declared scope; that
    task lists domain/investigation/assessment among its own implements for exactly this reason.
- what: Persisting Evaluation's new optional usage/elapsed_ms/prompt fields through relational-investigation-store.repository.ts's
    write()/read() round-trip — its investigation_evaluations row shape (hypothesis, verdict, reason)
    carries none of the three today.
  why: outside this epic's own inventory area (persistence/ is not among its touched or depends-on modules),
    and no migration or persistence task is named for it; the repository still compiles unchanged since
    the three new fields are optional on Evaluation.
---

## What it is

The judgment port (IHypothesisEvaluator) and consolidation port (IAssessmentConsolidator) both widen their return shape to carry a call's own usage, elapsed time and materialized prompt — optional on the judgment side (a hypothesis's judgment call may never run at all, reason no-data), required on the consolidation side (a consolidation call always runs exactly once). judgment-stage.ts forwards whatever a real evaluate() call answered onto the Evaluation it assembles, unchanged, for every path that actually reads a port response; its three synthetic fallbacks that never call anything stay bare. The two consolidator adapters (Anthropic and the fake) each change only enough to satisfy the new required ConsolidationOutcome shape, with zero-valued placeholder usage and elapsed_ms and no new measurement of either — the real reading and timing belongs to two sibling tasks this one depends into but does not pre-empt. Both hypothesis-evaluator adapters are untouched, since their own new fields are optional and their existing answers already satisfy the widened type without modification.

## Notes

A first delivery attempt against an earlier, internally-contradictory version of this task's fifth criterion ("every existing adapter unchanged") implemented full real usage-reading and call timing into all three adapters, breaking 33 pre-existing tests whose mocks never supplied a provider usage field — squarely two sibling tasks' own declared scope. That attempt was fully reverted before this one began. The task file's own criteria were corrected on composition (before this delivery) to split the single contradictory criterion into the two now in force: hypothesis-evaluator adapters genuinely unchanged, consolidator adapters changed to the type-satisfying minimum only.
Every inference and deferral above is also disclosed in its own field; none is invented here for the first time.
