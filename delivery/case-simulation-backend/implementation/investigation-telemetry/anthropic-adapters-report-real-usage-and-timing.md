---
title: Anthropic adapters read the provider's own usage, measure elapsed time and report the materialized prompt
summary: anthropic-hypothesis-evaluator.adapter.ts's evaluate() and anthropic-assessment-consolidator.adapter.ts's consolidate() each measure their own provider call with Date.now(), read the response's own message.usage, and return the exact prompt they already assembled, instead of discarding all three or answering a placeholder.
task: sha256:dfbb0603d942b2c5ccc755d62fbf15cc79b59dd8806b061d069422f50464282b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-anthropic-adapters-report-real-usage-and-timing-build
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: evaluate() now builds the prompt once via buildUserPrompt() before calling the provider, measures
    elapsed time around that one call with Date.now() (this file's own newly-adopted instance of the
    codebase's established startedAt/elapsedMs convention, e.g. connector-http-issuer.ts), and carries the
    result through a new private CallRecord type into whichever of the three outcomes results. requestJudgment()
    now takes the already-built prompt string as its one parameter (down from three) rather than assembling
    it itself. judgmentFailureOutcome() now takes an optional CallRecord, spread onto its returned literal —
    populated with elapsed_ms/prompt alone when the provider call itself failed (no response to read usage
    from), or with the full record (including usage read from message.usage) when the call answered but the
    text could not be parsed into a recognized shape. outcomeFromModelText() now takes a required CallRecord
    (a response always exists by the time it runs) and spreads it onto the confirmed/refuted literals it
    already built, alongside its judgment-failure fallback. noDataOutcome() is unchanged -- no call is ever
    attempted on that path, so it carries none of the three, exactly as before.
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  effect: consolidate() now measures elapsed time around its one provider call with Date.now() (the same
    established convention) and returns response.usage — the provider's own real token counts — instead of
    the fixed PLACEHOLDER_USAGE/PLACEHOLDER_ELAPSED_MS constants, both of which are deleted along with their
    now-unused Usage import. The prompt field is unchanged -- still exactly buildDataBlock()'s own output, the
    same value already sent as the call's user message. No other behavior (prompt assembly, register style,
    granting no tools, the text-extraction/throw-if-no-text-block convention) changed.
criteria:
- criterion: anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns input_tokens and output_tokens
    read from the provider response's own usage, for any call that happened.
  met: true
  how: 'When the provider call answers with a message (requestJudgment() returns something other than
    undefined), evaluate() passes { usage: message.usage, elapsed_ms: elapsedMs, prompt } into
    outcomeFromModelText(), which spreads it onto whichever of confirmed/refuted/judgment-failure results —
    so usage carries message.usage''s own input_tokens/output_tokens, read directly from the SDK''s response,
    for every call that actually came back with an answer. A call that never reaches the provider at all
    (the no-data path) still reports no usage, unchanged; a call that is attempted but throws before any
    response arrives has no response to read usage from, so none is invented for it — the only way this
    criterion''s own "read from the provider response''s own usage" clause can be honored when there is no
    response to read from.'
- criterion: anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns elapsed_ms measured around its
    own provider call.
  met: true
  how: evaluate() reads Date.now() into startedAt immediately before calling this.requestJudgment(prompt) and
    computes elapsedMs as Date.now() minus that value immediately after it resolves — this file's own instance
    of the codebase's established real-wall-clock convention (connector-http-issuer.ts's own
    startedAt/elapsedMs, evidence-collection-stage.ts's own attemptStartedAt/elapsedSince). elapsed_ms is
    carried into both the judgment-failure path (a call that threw) and the outcomeFromModelText path (a call
    that answered), so it is present on every outcome a provider call was actually attempted for, regardless
    of whether that call succeeded.
- criterion: anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns the judgment prompt exactly as
    materialized for that call.
  met: true
  how: evaluate() now calls buildUserPrompt(criterion, evidence, caseContext) itself, once, before the
    provider call, and passes that exact string both to requestJudgment() (as the call's own user-message
    content) and into the call record attached to the outcome — the same string sent to the provider is the
    same string returned, never rebuilt or approximated a second time.
- criterion: anthropic-assessment-consolidator.adapter.ts's consolidate() returns input_tokens, output_tokens
    and elapsed_ms from its own provider call, the same way.
  met: true
  how: consolidate() reads Date.now() into startedAt immediately before this.client.messages.create(...) and
    computes elapsedMs immediately after it resolves, the same measurement discipline as the hypothesis
    evaluator; it returns usage as response.usage directly (the provider's own real input_tokens/output_tokens)
    in place of the former PLACEHOLDER_USAGE, and elapsed_ms as the measured elapsedMs in place of the former
    PLACEHOLDER_ELAPSED_MS of 0. Unlike evaluate(), consolidate() has no path that skips the call
    (domain/investigation/assessment's own consolidation call always runs), so this is unconditional.
- criterion: anthropic-assessment-consolidator.adapter.ts's consolidate() returns the consolidation prompt
    exactly as materialized for that call.
  met: true
  how: prompt is still exactly buildDataBlock(evaluations, evidence, consolidationRegister)'s own output —
    unchanged from before this task, and already the same value sent as the call's user-message content; this
    task's own scope for this adapter was usage and elapsed_ms, and the prompt field already satisfied this
    criterion, carried through unchanged in the returned ConsolidationOutcome.
nodes:
- node: domain/investigation/usage
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: Both adapters now populate the node's own two required attributes (input_tokens, output_tokens) with
    the provider's own real values — message.usage on the judgment call, response.usage on the consolidation
    call — rather than omitting the field (judgment) or answering a fixed zero (consolidation). The Usage type
    itself, declared by the depended-upon widen-judgment-and-consolidation-ports task, is unchanged; this task
    only changes what value each adapter supplies for it.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  how: The node's own usage/elapsed_ms/prompt attributes, already declared on the Evaluation type and already
    threaded through judgment-stage.ts's asEvaluation()/callRecordOf() by the depended-upon task, now carry
    real, provider-measured values rather than being permanently absent — AnthropicHypothesisEvaluator is the
    one adapter this Evaluation's call record can come from in production, and it now actually supplies one
    for every call it attempts. judgment-stage.ts itself is untouched by this task; it already forwards
    whatever the port's own answer carries.
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: 'This node''s own usage/elapsed_ms/prompt attributes are declared on Assessment itself, which this
    task does not touch (diagnose-reports-real-cost-and-durations already recorded that widening Assessment''s
    own shape is deliberately not reached, since draft-assessment-text.spec.ts asserts the answered Assessment
    carries none of the three). What this task does encode against this node is the consolidation call''s own
    record one level below Assessment, at the ConsolidationOutcome the port already requires: usage and
    elapsed_ms are now the real provider-measured values this node''s own text describes ("what the provider
    charged for producing the text", "how long that call took") rather than a zero-valued placeholder, closing
    the gap between what the widened port already required and what this one production adapter actually
    supplied.'
inferences:
- inferred: A provider call that throws before answering (requestJudgment() returns undefined) still carries
    elapsed_ms and the prompt on the resulting judgment-failure outcome, but never a usage field — usage is
    present only where a response actually came back to read message.usage from.
  from: The task's own three criteria are stated separately rather than as one combined "usage, elapsed_ms
    and prompt together" clause — criterion 1 conditions usage specifically on being "read from the provider
    response's own usage" (impossible without a response), while criterion 2 states elapsed_ms is "measured
    around its own provider call" without conditioning on the call's outcome, and criterion 3 makes the same
    unconditional claim about the prompt. The codebase's own established precedent for exactly this shape
    (connector-http-issuer.ts's own IssuedHttpCall) already reports elapsedMs on both its success and its
    timed-out branches, never omitting a measurement merely because the call did not succeed — the same
    structural distinction this adapter now draws between "a call was attempted" (sufficient for elapsed_ms
    and prompt) and "a call answered" (needed for usage).
- inferred: An outcome built from a response this adapter could not parse into one of the three declared
    shapes (outcomeFromModelText's own judgment-failure fallback) still carries usage, since a response did
    come back — only a request that failed outright, before any response arrived, ever omits it.
  from: domain/investigation/evaluation's own text ties presence to whether "a call happened" without
    distinguishing a parsed answer from an unparseable one, and the only fact that ever makes usage physically
    unavailable is the absence of a response — which is true for a thrown request and false for one this
    adapter merely failed to parse.
- inferred: Elapsed time is measured with Date.now(), read once immediately before the provider call and once
    immediately after it settles (success or failure alike), rather than performance.now() or a timer wrapping
    the whole evaluate()/consolidate() call including prompt assembly.
  from: This codebase's own already-established convention for exactly this measurement — Date.now() read
    into a startedAt variable immediately around the one call being timed — appears identically in
    connector-http-issuer.ts, evidence-collection-stage.ts and production-diagnose.factory.ts; no file in this
    project uses performance.now() for a wall-clock elapsed reading domain/investigation/evaluation and
    domain/investigation/assessment both describe in whole milliseconds. Timing only the provider call itself,
    not the surrounding prompt assembly, matches "the call's own measured elapsed time" and "elapsed_ms
    measured around its own provider call" exactly as both nodes and this task's own criterion 2 state it.
preserved:
- AnthropicHypothesisEvaluator's own no-data short-circuit (evidence not all ok, answered without ever
  calling the model), SYSTEM_PROMPT, buildUserPrompt()'s own five-input closed prompt assembly, the
  code-fence-tolerant JSON parsing, and every citation/verdict validation helper — none of these changed;
  only how the already-computed prompt and the already-received (or absent) message feed into the outcome
  changed.
- AnthropicHypothesisEvaluator's own never-throws contract for evaluate() -- a provider failure still becomes
  judgment-failure, an unparseable answer still becomes judgment-failure, a decided answer still requires at
  least one citation by the type itself — unchanged.
- AnthropicAssessmentConsolidator's own prompt assembly (buildSystemPrompt/buildDataBlock), its provider call
  shape (model, max_tokens, system, one user message, no tools), its text-extraction and its throw when no
  text content block is present — unchanged; only the values placed into ConsolidationOutcome's usage and
  elapsed_ms fields changed, from a fixed placeholder to the one real call's own measured/reported values.
- Both classes' construction-time configuration (AnthropicHypothesisEvaluatorOptions,
  AnthropicConsolidatorConfig — model, maxTokens, apiKey, the ANTHROPIC_API_KEY environment fallback) —
  unchanged.
- judgment-stage.ts's own asEvaluation()/callRecordOf() forwarding behavior and run-diagnosis.ts's
  capturingConsolidator wrapper — neither is touched by this task, and both already forward whatever call
  record a port's own answer carries, so they now carry real values through unmodified.
deferred:
- what: Three pre-existing unit-level test files assert the exact prior behavior this task replaces —
    anthropic-hypothesis-evaluator.adapter.spec.ts's own two tests (from
    task/investigation-telemetry/widen-judgment-and-consolidation-ports' own criterion 5, "answers a decided
    verdict carrying no usage, elapsed_ms or prompt property... this adapter never reads message.usage or
    reports one" and the companion source-text scan asserting the words usage/elapsed_ms/prompt never appear
    in this file at all) and anthropic-assessment-consolidator.adapter.spec.ts's own three tests ("answers a
    placeholder zero-valued usage and an elapsed_ms of 0 on a successful call", "answers a usage of zero even
    when the provider's own mocked response itself carries a non-zero usage field", "answers an elapsed_ms of
    0 even when the provider call itself takes measurable time").
  why: These tests exist specifically to prove the prior task's own fifth/sixth criteria (the Anthropic
    adapters unchanged, or changed only to the placeholder minimum) — this task's own declared scope is
    exactly what makes both obsolete by design, the same relationship the depended-upon task's own delivery
    record already named for this task in its own header comments. Rewriting a test's own assertions is the
    test-author's judgment, not this delivery's to make by editing another pass's already-delivered file.
- what: diagnose-server.factory.spec.ts's own integration test "persists cost.calls as the one real
    consolidation call and a real, non-zero collection duration, while judgment usage, writing and judgment
    duration still read zero until the Anthropic adapters themselves report real usage and elapsed_ms" —
    its own header comment names this task by identity as the reason those zeros will stop being zero, and
    its mocked @anthropic-ai/sdk response carries no usage field for either adapter to read (createMock's own
    hoisted mockResolvedValue answers only a content array, no usage field.
  why: Updating this test's own expected values, and its mock's own response shape, is a test-authoring
    judgment this delivery does not make; the mock's own missing usage field is a fixture gap for the
    test-author's next pass, not a source defect — production code reads response.usage exactly as the real
    SDK types declare it, and a test double that omits a required field is the double's own gap to close.
---

## What it is

Both Anthropic adapters now measure their own provider call with Date.now() and report what the provider actually answered, instead of discarding it. The hypothesis-evaluator adapter builds its prompt once, times the call around it, and carries elapsed_ms and prompt onto every outcome a call was attempted for, adding usage only where a response actually came back to read message.usage from. The consolidation adapter, whose one call always runs, reports response.usage and its own measured elapsed_ms unconditionally in place of the fixed placeholders the depended-upon task left there. Neither adapter's prompt assembly, provider call shape, parsing, or error handling changed — only what each already-computed or already-received value feeds into the outcome.

## Notes

Several pre-existing unit tests, written under the depended-upon widen-judgment-and-consolidation-ports task, assert precisely the behavior this task replaces (both adapters answering placeholders or nothing at all for usage/elapsed_ms/prompt) — flagged in `deferred` above for the test-author's own pass, not edited here, the same separation diagnose-reports-real-cost-and-durations' own delivery already followed for its own two stale test files. One integration test's own mocked provider response also omits a usage field entirely for either adapter to read; that mock gap is likewise left for the test-author.
