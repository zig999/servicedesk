---
target: backend
title: Judgment prompt observation semantics and temporal context — proof
summary: New tests on AnthropicHypothesisEvaluator's system prompt and judgment_input assembly prove the
  observation-versus-interpretation wording, multi-item isolation wording, the top-level fresh current_instant,
  and each evidence item's own observed_at/ttl carried unmodified and unmixed; one pre-existing test is
  repaired because fresh-per-call current_instant now legitimately breaks its old byte-identical assertion;
  a further test drives judgment-stage.ts's own retry mechanism to close the gap a review found in the
  earlier current-instant-across-a-retry proof — that gap being that no test drove the actual retry path,
  only two direct evaluate() calls.
implementation: sha256:40ba6265073c76398acfe153cbc0db87c64a9366cd5fa9096c7a02f1f6366441
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/judgment-prompt-temporal-context-judgment-prompt-observation-semantics-and-temporal-context-suite-4
tests:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: sends prompt content that is identical across two calls carrying the same criterion, evidence
    (including its own field semantics and concept description) and case context, apart from each call's
    own freshly-read <current_instant>
  proves: The deferred repair the implementation record names — the pre-existing byte-identical-prompt
    assertion now legitimately conflicts with rules/investigation/judgment-reads-the-current-instant-fresh,
    so it is rewritten to assert determinism of the criterion/evidence/case-context-driven content while
    allowing <current_instant> to vary per call.
  fails_when: The part of the prompt built from the criterion, evidence (fields, concept_description,
    observation, observed_at, ttl) or case context differs between two calls given identical inputs, once
    <current_instant> is stripped from both.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: reads the current instant fresh from the clock on every separate evaluate() call — including the
    call judgment-stage.ts issues as a retry — rather than reusing the value an earlier call already read
  proves: Criterion 4 (judgment_input carries a top-level element stating the current date and time in
    UTC at the moment judgment is requested) by driving two direct evaluate() calls on the real adapter
    and asserting each rebuilds <current_instant> fresh rather than reusing a value the earlier call already
    read — the per-call-freshness half of rules/investigation/judgment-reads-the-current-instant-fresh.
    It does not itself drive judgment-stage.ts's own retry path, which the test below covers.
  fails_when: <current_instant> is absent from the built judgment_input, does not reflect the system clock
    at call time, or carries the same value across two direct evaluate() calls despite the clock having
    advanced between them.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: issues a retry as a genuinely separate evaluate() call happening only after real time has elapsed
    since the first attempt — so an evaluator that reads its own clock fresh at call time reads a later
    instant on the retry, never the first attempt's own reading
  proves: 'The half of rules/investigation/judgment-reads-the-current-instant-fresh''s "never one instant
    shared across two separate judgment requests for the same hypothesis" clause a prior review''s certification
    found unexercised — that judgment-stage.ts''s own retryOrFail, triggered when the first attempt''s
    citations fail citationsAreAcceptable, issues the retry as a second, later-timed evaluate() call on
    the same evaluator (real elapsed time separates it from the first attempt, driven here through the
    actual judgeHypotheses()/retryOrFail path rather than two manually-sequenced direct calls), so an
    evaluator that reads its own clock fresh at call time — as AnthropicHypothesisEvaluator''s evaluate()
    does — necessarily observes a distinct, later instant on that retry, never the first attempt''s own
    reading. Refuses exactly the implementation the certification named: one that resends an already-built
    judgment_input, current-time element included, on the retry rather than issuing a genuinely fresh
    call.'
  fails_when: judgment-stage.ts's retryOrFail does not call evaluator.evaluate() again as a wholly separate
    invocation once the first attempt's citations are rejected, or the retry's own call happens before
    any real time has elapsed since the first attempt's call, such that an evaluator reading its own clock
    fresh at call time would be unable to observe a later instant on the retry than on the first attempt.
  demonstrates: rules/investigation/judgment-reads-the-current-instant-fresh
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: states that only the observation is evidence, and that fields, concept_description and capability_payload_notes
    are reading aids rather than evidence in themselves
  proves: Criterion 1 — the system prompt states that an item's <observation> is the data validated against
    the <criterion>, and that <fields>, <concept_description> and <capability_payload_notes> exist only
    to help read that data, never as evidence in themselves.
  fails_when: The system prompt no longer tells the model that only the parsed observation is evidence,
    or no longer states that fields/concept_description/capability_payload_notes are reading aids rather
    than evidence in themselves.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: states that <observation> is a JSON-encoded string to parse before checking any value against
    the criterion
  proves: Criterion 2 — the system prompt states that <observation> is a JSON-encoded string to parse
    before checking its values against the criterion.
  fails_when: The system prompt no longer instructs the model to parse <observation> as JSON before checking
    its values against the criterion.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: states that multiple evidence items are evaluated in complete isolation, never attributing one
    item's field value to another even where both declare a field of the same name
  proves: Criterion 3 — the system prompt states that where <evidence> carries more than one <item>, each
    is evaluated independently, and a field's value from one item is never attributed to another item,
    even where both declare a field of the same name.
  fails_when: The system prompt no longer instructs the model to evaluate items in isolation, or drops
    the instruction against attributing one item's field value to another item declaring a field of the
    same name.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: states that <current_instant> and each item's own <observed_at>/<ttl> are recency-and-staleness
    context, used together, and are never themselves citable evidence
  proves: Criterion 6 — the system prompt states that the current-time element and each item's own captured-at/freshness
    elements are context for reasoning about recency and staleness, used together whenever the criterion
    depends on either, and are never themselves citable evidence.
  fails_when: The system prompt no longer instructs the model to reason about recency/staleness using
    an item's own <observed_at>/<ttl> together with <current_instant>, or no longer states that none of
    the three is itself citable evidence.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders each evidence item's own observed_at, unmodified, into that item's own <observed_at> element
  proves: Criterion 5's observed_at half — the judgment_input carries, for an evidence item, the UTC instant
    that item's observation was captured, taken from that same item's own already-collected observed_at.
  fails_when: The rendered <observed_at> element for an item does not match exactly the value that item's
    own EvidenceItem carried.
  demonstrates: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: renders each evidence item's own ttl, paired with that same item's own observed_at, into that
    item's own block alone — never mixed with another item's values
  proves: Criterion 5's ttl half — the judgment_input carries, for each evidence item, how many seconds
    it was considered fresh for, taken from that same item's own already-collected ttl, never cross-attributed
    between items.
  fails_when: An item's <ttl> or <observed_at> element is missing, altered, or carries another item's
    value instead of its own.
  demonstrates: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
not_applicable:
- edge_case: A ttl of zero, or an unusually large or negative number of seconds.
  why: The adapter only threads and renders ttl opaquely; no criterion of this task validates, bounds,
    or branches on its value, so this boundary changes nothing the obligation requires.
- edge_case: current_instant landing exactly on an evidence item's own observed_at (judgment requested
    at the same instant collection happened).
  why: No criterion has the adapter itself compute or branch on staleness; that reasoning is left entirely
    to the model reading the prompt, so this boundary changes nothing about the adapter's own behavior.
- edge_case: An empty evidence array reaching buildUserPrompt.
  why: Unchanged by this task — evidenceBlock's map/join over zero items already produces an empty <evidence></evidence>
    block, a pre-existing behavior no criterion here alters.
- edge_case: Concurrent evaluate() calls under judgment-stage's call pool.
  why: Pooling/concurrency is untouched by this task; the fresh-clock requirement is proven per call in
    isolation, and no criterion ties freshness to concurrency.
- edge_case: A retry denied because the stage's deadline has already elapsed (retryOrFail's own deadlineGuard.elapsed()
    branch), never reaching a second evaluate() call at all.
  why: No criterion or node's fact of this task depends on what happens when a retry is refused for lack
    of time; the current-instant-fresh fact concerns only a retry that does occur, which the new test
    exercises with time left on the deadline.
untested:
- 'constraints/the-judgment-prompt-is-closed: its statement is a totality over the whole prompt-assembly
  function (a fixed admitted-content set, no tool calling, no live glossary/capability-registry read).
  No single finite test decides all of this whole; each piece is exercised separately, none of which decides
  the closed statement as a whole.'
- 'domain/investigation/hypothesis-evaluator: its Responsibility text spans the entirety of evaluate()''s
  behavior (cited, complete, never-inferred, no live reads), decided piecemeal across many already-existing
  tests; no single test decides that whole responsibility.'
- 'domain/investigation/evidence: this task only threads two of Evidence''s twelve declared attributes
  (observed_at, ttl) through the downstream EvidenceItem port; the value-object''s full shape is declared
  and exercised in evidence.ts, a file this task does not touch.'
- 'domain/investigation/citation: unaffected by this task (no encoded_at in the implementation record);
  its field-presence rule is split across two pre-existing scenarios with no single test deciding both
  at once.'
- 'domain/investigation/verdict: unaffected by this task; its fact spans the enumeration plus ''every
  hypothesis receives one'' plus precedence choosing the determining hypothesis, the last of which is
  decided in case-resolution.ts, a module this task does not touch.'
- 'rules/investigation/judgment-reads-the-evidence-snapshot: its fact combines a positive property (the
  snapshot''s fields, including the observed_at/ttl this task adds, copied through unchanged) with a negative
  one (no live read of the glossary or capability registry). No single test decides both halves together.'
- 'rules/investigation/an-observation-is-recorded-as-json-object-text: the recording half of this invariant
  is established at evidence collection, in files this task does not touch; this task only adds the model-facing
  instruction to parse it that way.'
- 'rules/investigation/a-cited-field-exists-in-the-capability-output-schema: unaffected by this task (no
  encoded_at); its accept/refuse pairing is split across two pre-existing tests, neither of which decides
  the whole rule alone.'
- 'rules/investigation/a-decided-evaluation-cites-evidence: unaffected by this task (no encoded_at); if
  a finite test decides it whole, that test belongs to whichever delivery originally implemented it, not
  this one.'
- 'rules/investigation/an-inconclusive-evaluation-declares-its-reason: unaffected by this task; the task''s
  own Notes record this as a REMAINDER belonging to the already-delivered judgment-invocation and failure-handling
  increment, not this one.'
- 'Criterion 7 (''existing behavior is unchanged... the response format contract is untouched'') is given
  no new test: it is a rearrangement guarantee, and its evidence is the pre-existing verdict-shape and
  citation-validity suite, which continues to pass unmodified.'
contested:
- what: Whether rules/investigation/judgment-reads-the-current-instant-fresh's whole fact is decided by
    one finite test, as demonstrates on the new judgment-stage.spec.ts test claims, given the fact genuinely
    spans two files — AnthropicHypothesisEvaluator's own per-call clock read, exercised only by the adapter-spec
    tests above (which no longer carry demonstrates for this node), and judgment-stage.ts's retry mechanism
    genuinely issuing a second, later-timed call, exercised only by the new test, which stands in for
    the evaluator with a stub rather than the real adapter.
  why: The demonstrates claim on the new test follows this task's own explicit direction to name it there,
    closing exactly the gap a prior review's certification found (that no test drove judgment-stage.ts's
    actual retry path). Recorded here because, read strictly, the node's fact is only fully covered by
    the adapter-spec test proving per-call freshness on the real adapter together with this new test proving
    the retry mechanism's own timing — two tests in two files, not one test deciding the whole fact alone;
    the demonstrates attribution is a claim for the next audit to weigh, not a settled fact.

---

## What it is

The tests proving judgment-prompt-observation-semantics-and-temporal-context: the system prompt's
observation-versus-interpretation wording, multi-item isolation, and the top-level fresh current_instant
plus each evidence item's own observed_at/ttl carried unmodified and unmixed into the judgment_input.
Revised after a /review-change certification found the earlier current-instant-fresh proof never
drove an actual retry through judgment-stage.ts; a new test now does.

## Notes

run/judgment-prompt-temporal-context-judgment-prompt-observation-semantics-and-temporal-context-suite
failed at test-unit: cause code — <current_instant> was rendered across three separate array entries
instead of one joined string; fixed in the implementation, not here.
run/judgment-prompt-temporal-context-judgment-prompt-observation-semantics-and-temporal-context-suite-2
failed at test (npm test): cause setup — an unrelated integration test's afterEach cleanup hook timed
out talking to the real database; the retry this cause licenses was run once, under -3, and passed clean.
This is a proof-only re-delivery: the implementation record is unchanged (same pin) since a /review-change
found only a proof gap, never a code defect.
