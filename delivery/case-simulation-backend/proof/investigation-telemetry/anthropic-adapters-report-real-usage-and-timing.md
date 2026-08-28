---
title: Proof that both Anthropic adapters report the provider's own usage, timing and prompt
summary: Rewrites the three now-obsolete placeholder/no-usage unit tests across both adapters' own suites, updates nine further pre-existing hypothesis-evaluator parsing/judgment-failure tests whose own expected-value literals were never widened for the new telemetry fields, fixes the diagnose-server.factory.spec.ts integration suite's mocked provider response to carry real usage and a real measured delay, fixes production-diagnose.factory.spec.ts's own sibling mock (a different task's fixture, broken by this task's own legitimate removal of the consolidator's placeholder usage) to carry a realistic usage field, and adds unit tests proving usage/elapsed_ms/prompt are genuinely read from the provider's own response — including the judgment call's own throw-before-response boundary.
implementation: sha256:3af306af9e8f6f4a22a057595d987d450efafef3a7d237e67e5b5ce9c37de0da
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-anthropic-adapters-report-real-usage-and-timing-suite-3
tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "answers a decided verdict carrying usage read exactly from the provider response's own message.usage, alongside the measured elapsed_ms and the sent prompt"
    proves: "anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns input_tokens and output_tokens read from the provider response's own usage, for any call that happened. / ...returns the judgment prompt exactly as materialized for that call. Rewrites task/investigation-telemetry/widen-judgment-and-consolidation-ports' own now-obsolete \"answers a decided verdict carrying no usage, elapsed_ms or prompt property\" test, reusing its exact fixture (a response carrying usage 77/88) and inverting the assertion."
    fails_when: evaluate() stops reading message.usage onto a decided outcome, or the prompt property stops equaling the exact string sent as the call's own user message content
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "reads a different usage value per call, exactly matching that call's own mocked response, rather than any fixed placeholder value"
    proves: "anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns input_tokens and output_tokens read from the provider response's own usage, for any call that happened — replacing task/investigation-telemetry/widen-judgment-and-consolidation-ports' own now-obsolete source-text-scan test (which proved total absence of the words usage/elapsed_ms/prompt) with a behavioral test of equivalent strength: a fixed-usage or no-usage implementation fails this immediately, since it cannot answer two different values across two calls."
    fails_when: two calls carrying two different provider-answered usage values are read back as the same value, or as any value not equal to that call's own mocked response
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "still carries usage read from the response's own message.usage when the model answered but the text could not be parsed into a recognized shape"
    proves: "the implementation record's own inference — an outcome built from a response this adapter could not parse into one of the three declared shapes still carries usage, since a response did come back"
    fails_when: an unparseable model answer's resulting judgment-failure outcome omits usage, or answers a usage other than the one the mocked response carried
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "measures elapsed_ms as the real wall-clock time the provider call itself took, rather than a fixed value"
    proves: "anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns elapsed_ms measured around its own provider call."
    fails_when: elapsed_ms is a fixed value (e.g. 0) rather than reflecting the real, deliberately-delayed time the mocked provider call took to answer
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "reports elapsed_ms and the exact prompt sent, but never invents a usage field, when the provider call itself throws before any response arrives"
    proves: "the boundary this task's own scope names explicitly — a judgment call that throws before any response arrives still reports elapsed_ms and prompt, and never invents a usage field — and the implementation record's own inference that a thrown call never carries usage since there is no response to read it from"
    fails_when: a thrown provider call answers without elapsed_ms, without the judgment prompt, or with any usage value at all (invented or otherwise)
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "a no-data outcome, answered without ever reaching the provider, still carries none of usage, elapsed_ms or prompt"
    proves: "the task's own criteria 1-3 scope ('for any call that happened') — a hypothesis whose evidence is not all ok never reaches the provider at all, and correspondingly carries none of the three, unchanged by this task"
    fails_when: a no-data outcome (evidence not all ok) carries a usage, elapsed_ms or prompt property despite never calling the provider
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "parses a well-formed confirmed answer into the confirmed verdict with its citations"
    proves: "anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns elapsed_ms measured around its own provider call and returns the judgment prompt exactly as materialized for that call, on the confirmed-verdict parsing path this suite already exercised before this task — this test's own expected-value literal was never widened for the two new fields when the adapter's behavior changed, so it asserted the prior no-telemetry shape and failed once the adapter genuinely started attaching them; usage stays undefined here since this test's own mocked response carries no usage field at all"
    fails_when: "elapsed_ms stops being a real number, or the prompt property stops equaling the exact string sent as the call's own user-message content, for a confirmed verdict parsed from a well-formed answer"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "parses a well-formed refuted answer into the refuted verdict with its citations"
    proves: "the same criteria as the confirmed-answer sibling above, on the refuted-verdict parsing path"
    fails_when: "elapsed_ms stops being a real number, or the prompt property stops equaling the exact string sent as the call's own user-message content, for a refuted verdict parsed from a well-formed answer"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "parses a confirmed answer wrapped in a ```json code fence, despite the system prompt asking for none"
    proves: "the same criteria, on the code-fence-tolerant confirmed-verdict parsing path"
    fails_when: "elapsed_ms stops being a real number, or the prompt property stops equaling the exact string sent, for a confirmed verdict parsed out of a fenced answer"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "parses a refuted answer wrapped in an untagged ``` code fence"
    proves: "the same criteria, on the untagged-code-fence refuted-verdict parsing path"
    fails_when: "elapsed_ms stops being a real number, or the prompt property stops equaling the exact string sent, for a refuted verdict parsed out of an untagged fenced answer"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "maps the model's own well-formed inconclusive answer to reason judgment-failure"
    proves: "elapsed_ms and prompt are reported on the judgment-failure outcome produced by a well-formed but inconclusive model answer, and usage stays undefined since this test's own mocked response carries none — extending criteria 2/3 to this pre-existing judgment-failure path, whose own expected-value literal was likewise never widened when the adapter's behavior changed"
    fails_when: "elapsed_ms stops being a real number, prompt stops matching the sent content, or a usage value is invented despite the mocked response carrying none"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "answers inconclusive with reason judgment-failure when the model response is not valid JSON"
    proves: "the same criteria, on the not-valid-JSON judgment-failure path"
    fails_when: "elapsed_ms stops being a real number, prompt stops matching the sent content, or a usage value is invented despite the mocked response carrying none"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "answers inconclusive with reason judgment-failure when the model response is valid JSON but matches none of the three declared shapes"
    proves: "the same criteria, on the unrecognized-shape judgment-failure path"
    fails_when: "elapsed_ms stops being a real number, prompt stops matching the sent content, or a usage value is invented despite the mocked response carrying none"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "answers inconclusive with reason judgment-failure when a confirmed answer carries no citations"
    proves: "the same criteria, on the no-citations judgment-failure path"
    fails_when: "elapsed_ms stops being a real number, prompt stops matching the sent content, or a usage value is invented despite the mocked response carrying none"
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: "answers inconclusive with reason judgment-failure, never throwing, when the provider call itself rejects"
    proves: "the boundary this task's own scope names explicitly, from a second, independently-shaped fixture (an immediate mockRejectedValueOnce rather than the dedicated new test's own delayed rejection): a rejected provider call still reports elapsed_ms and the exact prompt sent, and never invents a usage field since no response ever came back to read one from"
    fails_when: "a rejected provider call answers without elapsed_ms, without the judgment prompt, or with any usage value at all"
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: "answers usage read exactly from the provider response's own usage on a successful call"
    proves: "anthropic-assessment-consolidator.adapter.ts's consolidate() returns input_tokens, output_tokens and elapsed_ms from its own provider call, the same way. Rewrites task/investigation-telemetry/widen-judgment-and-consolidation-ports' own now-obsolete 'answers a placeholder zero-valued usage' test, inverting its assertion against the same non-zero usage value."
    fails_when: consolidate() answers a usage other than the exact response.usage the mocked provider call carried
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: "reads a different usage value per call, exactly matching that call's own mocked response, rather than any fixed placeholder"
    proves: "the same criterion, replacing task/investigation-telemetry/widen-judgment-and-consolidation-ports' own now-obsolete 'answers a usage of zero even when the provider's own mocked response carries a non-zero usage field' test with its direct behavioral inverse: two calls answering two different usage values"
    fails_when: two calls carrying two different provider-answered usage values are read back as the same value, or as any fixed placeholder
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: "answers an elapsed_ms reflecting the real wall-clock time the provider call itself took, rather than a fixed value"
    proves: "anthropic-assessment-consolidator.adapter.ts's consolidate() returns elapsed_ms from its own provider call — replacing task/investigation-telemetry/widen-judgment-and-consolidation-ports' own now-obsolete 'answers an elapsed_ms of 0 even when the provider call itself takes measurable time' test with its direct inverse, reusing the identical 20ms-delay setup"
    fails_when: elapsed_ms is a fixed value (e.g. 0) rather than reflecting the real, deliberately-delayed time the mocked provider call took
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: "persists real, non-zero cost and durations for the judgment and consolidation calls, now that the Anthropic adapters themselves report real usage and elapsed_ms"
    proves: all five of this task's own criteria, exercised together at the end-to-end level through the real pipeline (judgment-stage.ts's asEvaluation, investigation-pipeline.ts's costOf/durationsOf) rather than mocked in isolation — replacing the prior, now-outdated end-to-end test that asserted judgment usage, writing and judgment duration still read zero, since the two adapters this task widens no longer leave them so
    fails_when: cost.calls is not exactly the fixture's two judgment calls plus the one consolidation call, cost.input_tokens/output_tokens do not equal that many multiples of the mocked per-call usage, or durations.judgment/writing fall below the mock's own deliberate response delay, or durations.total stops equaling the sum of the three stage durations
not_applicable:
  - edge_case: a consolidation call that never happens
    why: "domain/investigation/assessment states the consolidation call always runs — the implementation record's own note drops this clause for consolidate() on that basis, and every existing consolidate() test already exercises the one call that always happens, so there is no absent-call path left to test for this adapter"
  - edge_case: two operations against one subject at once (concurrency)
    why: "neither adapter holds any shared mutable state across calls — each evaluate()/consolidate() call is an isolated request built and measured independently, and the 'reads a different usage value per call' tests already prove two sequential calls never share or leak state into one another, which is the only way concurrent calls could interact"
  - edge_case: an empty evidence/evaluations input to consolidate()
    why: "already covered by this suite's own pre-existing, unchanged 'produces a well-formed, empty data block when given no evaluations and no evidence' test — this task changes nothing about how an empty input is assembled into a prompt, only what usage/elapsed_ms the resulting outcome carries, which the new usage/elapsed_ms tests already exercise independently of input size"
  - edge_case: a duplicate or repeated usage value across two calls
    why: "no criterion or node states usage must differ between calls — the 'different value per call' tests use distinct mocked values only to rule out a fixed placeholder, not because the adapters are claimed to never repeat a value; a repeat is ordinary behavior needing no dedicated test"
untested:
  - "the exact number of milliseconds Date.now() measures for a genuinely fast (sub-mockable) provider call in production — every elapsed_ms test here controls timing through an artificial setTimeout delay and asserts only a lower bound, since a real millisecond count is not something any test can pin without either a fake clock (which would not prove Date.now() is actually read around the real call) or genuine flakiness"
  - "whether the judgment stage's retry path (a decided verdict whose citations fail structural validation) also carries the retry call's own usage/elapsed_ms/prompt onto its final Evaluation — this task's own scope and criteria concern the two adapters' own evaluate()/consolidate() answers, not judgment-stage.ts's asEvaluation()/callRecordOf() forwarding, which the implementation record states is unchanged and outside this task; no test here exercises the retry branch specifically for this property"
---

## What it is

Replaces, in place, the three pre-existing unit tests across both adapters' own suites that proved the exact placeholder/no-usage behavior this task deliberately reversed, with behavioral tests of equivalent strength proving the new guarantee — usage read from the provider's own response, elapsed_ms genuinely measured with a real delay, and the prompt returned exactly as sent. Adds new unit tests for the two inferences the implementation record states (an unparseable-but-answered call still carries usage; a thrown call never does) and for the boundary this task's own scope names explicitly (a judgment call that throws before any response still reports elapsed_ms and prompt). Fixes the one integration test whose mocked provider response carried no usage field for either adapter to read, giving it a realistic non-zero usage and a real measured delay, and rewrites its expected assertions by tracing the exact call count and token sums the real pipeline (judgment-stage.ts, investigation-pipeline.ts) produces against the fixture case's own two hypotheses.

## Notes

The two-call and different-per-call usage tests (in both adapter suites) were chosen over a literal source-text presence scan as the replacement for the prior source-text absence scan: a scan for `message.usage`/`elapsed_ms`/`prompt` substrings binds the test to the code's own naming rather than its behavior, so a behavioral test that a fixed-placeholder or no-usage implementation cannot pass was written instead, matching the "asserts observable behavior" standard this proof is held to even though the test it replaces used the weaker pattern.

The integration test's own token/call counts were derived by tracing the fixture case (fixtures/case/intermittent-connection-outage/1.json, two hypotheses, both collecting a concept the suite's fetchMock answers ok for) through judgment-stage.ts (both hypotheses judged, no no-data or retry path reached since the model's deliberately-invalid-JSON answer resolves each to judgment-failure without ever producing a decided verdict to validate citations against) and investigation-pipeline.ts's own costOf/durationsOf — never guessed.

Nine further pre-existing anthropic-hypothesis-evaluator.adapter.spec.ts tests (the confirmed/refuted verdict parses, both code-fence variants, four judgment-failure variants, and the provider-rejects-outright test) asserted the adapter's prior no-telemetry outcome shape with a bare `toEqual` literal; their own expected-value literals were never widened when this task's own new tests were added lower in the same file, so they failed once the adapter genuinely started attaching elapsed_ms and prompt to every outcome a call was attempted for. Each is corrected here in place, in the same style the file's own new tests already establish: an exact `toMatchObject` for the verdict/reason/citations shape a fixture's own mocked text determines, `expect.any(Number)` for elapsed_ms (a real wall-clock reading with no fixed value to assert against absent a deliberate delay, which none of these nine tests introduces), an exact `toBe` against the same prompt content the mock itself recorded receiving, and `toBeUndefined()` for usage, since every one of these nine tests' own mocked responses carries no usage field for the adapter to read.

production-diagnose.factory.spec.ts's own hoisted Anthropic client mock (`vi.fn().mockResolvedValue({ content: [...] })`, no usage field) is a sibling fixture belonging to a different task's own proof (task/diagnose-composition-root/wire-diagnose-runner) — not one this task's own criteria answer to — but this task's own legitimate removal of AnthropicAssessmentConsolidator's placeholder usage left it reading response.usage.input_tokens off a mock that never set the field, throwing inside investigation-pipeline.ts's own costOf() before any of that file's five existing tests could complete. Its resolved value now carries a realistic, non-zero usage field, mirroring the same fix diagnose-server.factory.spec.ts's own mock already carries for this task; no test in that file reads a cost or duration value, so no assertion there needed to change as a consequence, and no delay was added since none of its own tests need one.
