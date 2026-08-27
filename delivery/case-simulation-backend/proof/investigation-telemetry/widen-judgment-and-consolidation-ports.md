---
implementation: sha256:235f24d87f61d0d7e055e11aa7da55656920e89d864cb9646504f0f1a4d8f0db
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-widen-judgment-and-consolidation-ports-suite-3
title: Proof for widening the judgment and consolidation ports
summary: Tests proving the widened EvaluationOutcome/ConsolidationOutcome shapes, judgment-stage's own
  call-record attachment and its absence for stage-decided fallbacks, both hypothesis-evaluator adapters
  staying untouched, and both consolidator adapters carrying only placeholder zero-valued usage/elapsed_ms
  with no real provider-reading or timing.
tests:
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: carries a seeded usage, elapsed_ms and prompt through unchanged, proving the widened return type
    declares and accepts all three as optional call-record fields
  proves: IHypothesisEvaluator.evaluate()'s return type declares an optional usage ({input_tokens, output_tokens}),
    an optional elapsed_ms and an optional prompt.
  fails_when: EvaluationOutcome stops accepting usage/elapsed_ms/prompt on its confirmed member, or FakeHypothesisEvaluator
    stops answering exactly what was seeded
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: FakeHypothesisEvaluator's own source declares no usage or elapsed_ms field, and no prompt field
    on any answered outcome — proving it was left untouched by the widened port's own new, optional call-record
    fields
  proves: The hypothesis-evaluator adapters (Anthropic and fake) are byte-for-byte unchanged — their optional
    usage/elapsed_ms/prompt fields being absent still satisfies the widened return type.
  fails_when: fake-hypothesis-evaluator.adapter.ts is edited to reference a usage, elapsed_ms or prompt
    field anywhere in its own source
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers a decided verdict carrying no usage, elapsed_ms or prompt property, even when the provider's
    own mocked response itself carries a usage field — this adapter never reads message.usage or reports
    one
  proves: The hypothesis-evaluator adapters (Anthropic and fake) are byte-for-byte unchanged — their optional
    usage/elapsed_ms/prompt fields being absent still satisfies the widened return type.
  fails_when: AnthropicHypothesisEvaluator starts reading the provider response's own usage field or adds
    a usage/elapsed_ms/prompt property to its answered EvaluationOutcome
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: this adapter's own source declares no usage or elapsed_ms field, and no prompt field on any answered
    outcome — proving it was left untouched by the widened port's own new, optional call-record fields
  proves: The hypothesis-evaluator adapters (Anthropic and fake) are byte-for-byte unchanged — their optional
    usage/elapsed_ms/prompt fields being absent still satisfies the widened return type.
  fails_when: anthropic-hypothesis-evaluator.adapter.ts is edited to declare a usage or elapsed_ms field,
    or a prompt property on an answered outcome
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: attaches the usage, elapsed_ms and prompt a first call's own decided, structurally valid answer
    returned, onto the resulting Evaluation
  proves: An Evaluation built from a hypothesis whose judgment call happened carries the usage, elapsed_ms
    and prompt that call's own port response returned.
  fails_when: asEvaluation()/callRecordOf() stop carrying a first call's own usage/elapsed_ms/prompt onto
    a confirmed Evaluation, or invent/alter their values
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: attaches the usage, elapsed_ms and prompt a first call's own inconclusive answer returned, passed
    through unchanged
  proves: An Evaluation built from a hypothesis whose judgment call happened carries the usage, elapsed_ms
    and prompt that call's own port response returned.
  fails_when: an inconclusive first-call answer's own usage/elapsed_ms/prompt stop being carried onto
    the pass-through Evaluation
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's — onto
    the decided answer the retry accepted
  proves: An Evaluation built from a hypothesis whose judgment call happened carries the usage, elapsed_ms
    and prompt that call's own port response returned.
  fails_when: the retry's own accepted Evaluation carries the discarded first call's usage/elapsed_ms/prompt
    instead of, or mixed with, the retry's own
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: a no-data evaluation carries no usage, elapsed_ms or prompt key at all — judgment was never called
    for it
  proves: An Evaluation whose reason is no-data carries no usage, elapsed_ms or prompt.
  fails_when: noDataEvaluation() starts including a usage, elapsed_ms or prompt key, present or set to
    undefined
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: a deadline-exceeded evaluation carries no usage, elapsed_ms or prompt key, for a call that never
    settled before the deadline
  proves: the implementation's own inference that a call that never happened at all (deadline-exceeded
    before any answer arrives) carries none of the three
  fails_when: deadlineExceededEvaluation() starts including a usage, elapsed_ms or prompt key
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: a judgment-failure evaluation carries no usage, elapsed_ms or prompt, even though the discarded
    retry's own decided answer carried all three — a call that happened but whose citations this stage
    itself invalidates is not a call this Evaluation records
  proves: the implementation's own inference that usage/elapsed_ms/prompt attach only where asEvaluation()
    is already threading a kept answer through, never for a call whose decided answer is discarded by
    judgmentFailureEvaluation()'s own structural-validation fallback
  fails_when: judgmentFailureEvaluation()'s own fallback path starts leaking the discarded retry's own
    usage/elapsed_ms/prompt onto the resulting inconclusive Evaluation
- file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  name: answers a defined usage, elapsed_ms and prompt on every call, never leaving any of the three undefined
  proves: IAssessmentConsolidator.consolidate()'s return type declares usage, elapsed_ms and prompt, not
    optional.
  fails_when: FakeAssessmentConsolidator answers a ConsolidationOutcome missing any of usage, elapsed_ms
    or prompt
- file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  name: answers a placeholder zero-valued usage, an elapsed_ms of 0 and an empty-string prompt, regardless
    of what text was seeded
  proves: the fake's placeholder usage of input_tokens 0/output_tokens 0, elapsed_ms of 0, and the implementation's
    own inferred empty-string prompt for the fake
  fails_when: FakeAssessmentConsolidator answers a non-zero usage or elapsed_ms, or a prompt other than
    the empty string
- file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  name: answers the text seeded for the evaluations, evidence and consolidation register a call carries
    (updated to unwrap ConsolidationOutcome's own text field)
  proves: IAssessmentConsolidator.consolidate()'s return type declares usage, elapsed_ms and prompt, not
    optional (the widened, object-shaped ConsolidationOutcome the fake now answers).
  fails_when: FakeAssessmentConsolidator stops answering a ConsolidationOutcome object, or its own text
    field diverges from what was seeded
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: returns exactly the model's own text content, trimmed of surrounding whitespace (updated to unwrap
    ConsolidationOutcome's own text field)
  proves: IAssessmentConsolidator.consolidate()'s return type declares usage, elapsed_ms and prompt, not
    optional (the widened, object-shaped ConsolidationOutcome the Anthropic adapter now answers).
  fails_when: AnthropicAssessmentConsolidator stops answering a ConsolidationOutcome object, or its own
    text field diverges from the model's own trimmed text
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: answers a placeholder zero-valued usage and an elapsed_ms of 0 on a successful call
  proves: the widened, required ConsolidationOutcome return type — a placeholder usage of input_tokens
    0 and output_tokens 0, and elapsed_ms of 0
  fails_when: AnthropicAssessmentConsolidator answers a non-zero usage or a non-zero elapsed_ms
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: answers a usage of zero even when the provider's own mocked response itself carries a non-zero
    usage field — this adapter never reads message.usage
  proves: Neither adapter gains real provider-usage reading here.
  fails_when: AnthropicAssessmentConsolidator starts reading the provider response's own usage field into
    its answered outcome
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: answers an elapsed_ms of 0 even when the provider call itself takes measurable time — this adapter
    never measures the call
  proves: Neither adapter gains real call timing here.
  fails_when: AnthropicAssessmentConsolidator starts measuring the call's own wall-clock duration and
    reporting it as elapsed_ms
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  name: answers a prompt equal to exactly the same data block sent as the call's own user message content
  proves: the implementation's own inference that the Anthropic adapter's prompt is exactly buildDataBlock()'s
    own output, the user-message content alone
  fails_when: AnthropicAssessmentConsolidator's answered prompt diverges from the exact string sent as
    the request's own user message content
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: unwraps the consolidator's own ConsolidationOutcome to its text field, exposing no usage, elapsed_ms
    or prompt property on the answered Assessment
  proves: the implementation's own inference that draft-assessment-text.ts unwraps consolidate()'s own
    text field rather than exposing the whole ConsolidationOutcome on Assessment
  fails_when: draftAssessment starts leaking usage, elapsed_ms or prompt from the consolidator's own answer
    onto the returned Assessment, or stops reading its text field correctly
not_applicable:
- edge_case: a bounded range for usage or elapsed_ms (an upper or lower limit)
  why: this task assigns only fixed placeholder zero values on the consolidator side and passes optional
    call-record values through unchanged on the judgment side — no range or boundary semantics are introduced
    for either field
- edge_case: a duplicate call record where uniqueness is claimed
  why: no node this task implements claims usage, elapsed_ms or prompt are unique in any sense; nothing
    here to test
- edge_case: an operation attempted against state that forbids it
  why: widening a return shape and forwarding an existing call's own answer introduces no new state machine
    or forbidden-state transition
- edge_case: two operations against one subject at once
  why: the pool/deadline concurrency judgment-stage.ts already owns is unchanged by this task and already
    has its own dedicated, unmodified tests; carrying usage/elapsed_ms/prompt onto an Evaluation introduces
    no new concurrent-access surface
- edge_case: absent or empty evaluations/evidence input to consolidate()
  why: pre-existing, unmodified tests already exercise empty evaluations/evidence arrays end to end for
    both consolidator adapters, and this task's widening does not vary usage/elapsed_ms/prompt by input
    size
untested:
- Literal byte-for-byte file identity of anthropic-hypothesis-evaluator.adapter.ts and fake-hypothesis-evaluator.adapter.ts
  against their state before this task — a test has no pre-image or git diff to compare against and can
  only prove the behavioral half of criterion 5 (their answers, and their own source text, carry none
  of the new fields), which is what the tests written here do.
- The retry path's own inconclusive answer (as opposed to a first call's decided-valid answer, a first
  call's inconclusive answer, and a retry's decided-valid answer) is not separately exercised for usage/elapsed_ms/prompt
  pass-through — it runs through the same shared asEvaluation()/callRecordOf() function already exercised
  at the other three call sites, but no test hits that exact fourth one.
- Persisting Evaluation's new optional usage/elapsed_ms/prompt fields through relational-investigation-store.repository.ts's
  write()/read() round-trip — the implementation record itself defers this as outside this epic's inventory
  area, and no test here exercises it.
- assessment-consolidator.port.spec.ts's own pre-existing, already-disclosed gap over domain/knowledge/case's
  default-register clause (its trailing comment explains the withdrawal) is untouched by this delivery
  and remains open.
---

## What it is

Nineteen tests across seven spec files, proving the widened EvaluationOutcome and ConsolidationOutcome shapes, judgment-stage.ts's own call-record forwarding across all four call sites that read a real port answer (first-call decided, first-call inconclusive, retry-decided, and their negative — judgment-failure discarding a retry's own record), the two stage-decided fallbacks (no-data, deadline-exceeded) carrying none of the three, both hypothesis-evaluator adapters left byte-for-byte behaviorally untouched even against a provider mock that itself carries a usage field, and both consolidator adapters answering only placeholder zero-valued usage/elapsed_ms with no real provider-usage reading or call timing.

## Notes

None.
