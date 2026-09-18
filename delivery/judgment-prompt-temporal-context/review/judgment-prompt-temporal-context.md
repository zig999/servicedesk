---
target: backend
title: Judgment prompt observation semantics and temporal context — review
summary: 'The four review passes over judgment-prompt-temporal-context: two partial-coverage criteria,
  two conformance-verified certifications short of covered, one unstated-fact finding, one contradicted-node
  finding, and two standard departures.'
reviewed:
- src/investigation/hypothesis-evaluator.port.ts
- src/investigation/judgment-stage.ts
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
tasks:
- task/judgment-prompt-temporal-context/judgment-prompt-observation-semantics-and-temporal-context
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (suite-3) passed with 0 failures, so nothing was diagnosed
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: The system prompt states that an evidence item's <observation> is the data validated against
    the <criterion>, and that its <fields>, <concept_description> and <capability_payload_notes> exist
    only to help read that data, never as evidence in themselves.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: states that only the observation is evidence, and that fields, concept_description and capability_payload_notes
      are reading aids rather than evidence in themselves
- criterion: The system prompt states that <observation> is a JSON-encoded string to parse before checking
    its values against the criterion.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: states that <observation> is a JSON-encoded string to parse before checking any value against
      the criterion
- criterion: The system prompt states that when <evidence> carries more than one <item>, each is evaluated
    independently, and a field's value from one item is never attributed to another item, even where both
    declare a field of the same name.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: states that multiple evidence items are evaluated in complete isolation, never attributing one
      item's field value to another even where both declare a field of the same name
- criterion: The judgment_input the evaluator builds carries a top-level element stating the current date
    and time in UTC at the moment the judgment is requested.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: reads the current instant fresh from the clock on every separate evaluate() call — including
      the call judgment-stage.ts issues as a retry — rather than reusing the value an earlier call already
      read
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: sends prompt content that is identical across two calls carrying the same criterion, evidence
      (including its own field semantics and concept description) and case context, apart from each call's
      own freshly-read <current_instant>
  why: 'That the element carries the current UTC instant, read afresh at the moment each judgment is requested,
    is exercised: the fake-timer test pins two different clock readings to two calls. What is unexercised
    is that it is a top-level element. Both tests assert only content.toContain(''<current_instant>…''),
    so a build rendering <current_instant> once inside each <item> block — or nested anywhere else under
    <judgment_input> — would pass every assertion in the set.'
- criterion: The judgment_input the evaluator builds carries, for each evidence item, the UTC instant
    that item's observation was captured and how many seconds it was considered fresh for, both taken
    from that same evidence item's own already-collected observed_at and ttl.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders each evidence item's own observed_at, unmodified, into that item's own <observed_at>
      element
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders each evidence item's own ttl, paired with that same item's own observed_at, into that
      item's own block alone — never mixed with another item's values
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: calls evaluate() with only the judged hypothesis's own criterion and its own matched evidence,
      never another hypothesis's
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: passes each evidence item's own snapshotted field semantics and concept description to evaluate()
      — read straight from the evidence it was given, never resolved live — before the first call is ever
      made, never only after a decided answer
- criterion: The system prompt states that the current-time element and each item's own captured-at/freshness
    elements are context for reasoning about recency and staleness, used together whenever the criterion
    depends on either, and are never themselves citable evidence.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: states that <current_instant> and each item's own <observed_at>/<ttl> are recency-and-staleness
      context, used together, and are never themselves citable evidence
  why: 'Two of three parts are pinned (read together; never citable). Unexercised: that the prompt states
    they are context for recency and staleness, used whenever the criterion depends on either — neither
    assertion contains the words recency or staleness, nor the depends-on condition.'
- criterion: 'Existing behavior is unchanged for a criterion that does not depend on recency or staleness:
    the response format contract (the three verdict shapes, and citation validity against an item''s own
    <field> elements) is untouched by this task.'
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: parses a well-formed confirmed answer into the confirmed verdict with its citations
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: parses a well-formed refuted answer into the refuted verdict with its citations
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: retries once on a decided answer whose citations fail structural validation, and returns the
      retry's valid decided answer
findings:
- pass: conformance
  file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  where: the test 'defaults the token ceiling to 1024 when the caller configures none', lines 687-694
  evidence: 'expect(createMock.mock.calls[0]?.[0]).toMatchObject({ max_tokens: 1024 });'
  cost: 'max_tokens: 1024 bounds how much the provider may spend answering a judgment call — enough to
    turn a real confirmed/refuted answer into a spurious judgment-failure if the answer is cut off mid-JSON
    — and no specification node names this figure or any ceiling; it lives only in this test expectation.'
- pass: conformance
  file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  where: the test asserting a confirmed outcome carries zero-valued usage/elapsed_ms with no prompt key
    at all, lines 132-143
  evidence: 'expect(outcome.usage).toEqual(ZEROED_USAGE);

    expect(outcome.elapsed_ms).toBe(ZEROED_ELAPSED_MS);

    expect(outcome).not.toHaveProperty(''prompt'');'
  cost: domain/investigation/evaluation holds usage, elapsed_ms and prompt together as one completed call's
    own record; this test asserts a confirmed (completed) outcome that has usage/elapsed_ms but no prompt
    as a valid shape, contradicting the node.
- pass: standard
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: parseJudgment and its helpers isVerdict/isCitation/isCitationArray/isNonEmpty (lines 132-145,
    236-250)
  cites: STK-08
  evidence: "function isCitation(value: unknown): value is Citation {\n  return isPlainObject(value) &&\
    \ typeof value.concept === 'string' && typeof value.field === 'string';\n}"
  cost: The model's JSON answer is boundary input parsed with hand-written type guards instead of one
    Zod schema; the guards do not even reject an empty string, and a future field has to be added correctly
    across several scattered guards.
  correction: Replace parseJudgment's hand-written guards with a Zod schema describing the three declared
    answer shapes.
- pass: standard
  file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  where: line 78
  cites: TST-01
  evidence: await expect(evaluator.evaluate('an-unseeded-criterion', SOME_EVIDENCE, A_CASE_CONTEXT)).rejects.toThrow(/an-unseeded-criterion/);
  cost: The act is folded directly inside the assertion, with no visible act step separate from assert,
    unlike sibling tests in the same codebase.
  correction: Assign the call to a variable first, then assert on it.
reconciliation: siegard-reconcile/judgment-prompt-temporal-context.md

---

## What it is

The review of task/judgment-prompt-temporal-context/judgment-prompt-observation-semantics-and-temporal-context's
delivery, over the six files it wrote — 4 passes, findings kept apart from a computed verdict.

## Notes

The captured run this review's own conformance and standard passes read against is
run/judgment-prompt-temporal-context-judgment-prompt-observation-semantics-and-temporal-context-suite-3,
already captured by /implement-task's suite step and reused here rather than re-run: it passed clean
(2374 tests, 0 failures), which is exactly why the failures pass does not run.
The certification pass over the 3 nodes offered as test-decided (judgment-reads-the-current-instant-fresh,
an-evidence-items-observed-at-is-a-utc-instant, an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation)
each came back partial, not covered — none rode a certification into the trace bind; all three stay decided
by reading. The current-instant certification's gap matches exactly the task's own UNDERDETERMINED note:
the offered test drives two direct evaluate() calls, never an actual retry through judgment-stage.ts, so
the 'never shared across two separate judgment requests' half of the rule is still unproven against a real retry.
domain/investigation/citation, domain/investigation/verdict, rules/investigation/a-cited-field-exists-in-the-capability-output-schema,
rules/investigation/a-decided-evaluation-cites-evidence and rules/investigation/an-inconclusive-evaluation-declares-its-reason
were read clean across every file that held candidates for them and are not repeated here past the conformance
returns saved under siegard-reconcile/judgment-prompt-temporal-context.returns/.
The whole-target trace check (run before staging) reports 288 pre-existing drift findings over 349 bindings
(0 orphaned, 15 moved, 5 proof, 268 code) plus 347 code findings suppressed under frontend/app's edits_freely
declaration — none of this is a finding of this review; it is unrelated pre-existing drift this review's
own trace.py --check surfaced while situating, reported here because the situate step requires it.
