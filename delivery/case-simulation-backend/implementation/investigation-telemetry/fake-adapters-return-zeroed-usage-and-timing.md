---
task: sha256:bf83004f10cf09e1567fd624df43bd23a67e024fbdd5d08c9d624c418b04b21a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-fake-adapters-return-zeroed-usage-and-timing-build
title: Fake adapters answer deterministic zero-valued usage and timing
summary: FakeHypothesisEvaluator's evaluate() now attaches a deterministic zero-valued usage and
  elapsed_ms to every seeded answer, and FakeAssessmentConsolidator's own already-zeroed shape is
  formalized as this task's own settled behavior rather than a forward reference to it.
files:
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  effect: evaluate() now unconditionally attaches a deterministic zero-valued usage (input_tokens
    0, output_tokens 0) and an elapsed_ms of 0 onto every seeded outcome it answers, through new
    ZEROED_USAGE/ZEROED_ELAPSED_MS constants, overriding whatever a seed itself carries for either
    field rather than reporting it or leaving it absent. Every other seeded field (verdict,
    citations, reason, prompt) and the unseeded-key throw are unchanged.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  effect: renames the file's own PLACEHOLDER_USAGE/PLACEHOLDER_ELAPSED_MS constants to
    ZEROED_USAGE/ZEROED_ELAPSED_MS and rewrites the header and doc comments that forward-referenced
    this task as the owner of the fake's final zero-valued usage/elapsed_ms and placeholder-prompt
    shape, stating that shape as settled rather than pending. consolidate()'s own returned values
    (usage {input_tokens 0, output_tokens 0}, elapsed_ms 0, prompt '') and the unseeded-key throw
    are unchanged.
criteria:
- criterion: "fake-hypothesis-evaluator.adapter.ts's evaluate() returns usage (input_tokens 0,
    output_tokens 0) and elapsed_ms 0 for any seeded call."
  met: true
  how: 'evaluate() now returns `{ ...outcome, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS }`
    once it has found the seeded fixture for the given criterion, where ZEROED_USAGE is
    `{ input_tokens: 0, output_tokens: 0 }` and ZEROED_ELAPSED_MS is 0 — attached unconditionally
    to every answered outcome, for any criterion a test seeded, regardless of what the seed itself
    carries for either field.'
- criterion: fake-assessment-consolidator.adapter.ts's consolidate() returns the same zero-valued
    usage and elapsed_ms, plus a placeholder prompt string.
  met: true
  how: consolidate() already returned, from the depended-upon widen-judgment-and-consolidation-ports
    task's own delivery, a record carrying text, usage=ZEROED_USAGE, elapsed_ms=ZEROED_ELAPSED_MS
    and prompt=PLACEHOLDER_PROMPT — the same zero-valued usage (0,0) and elapsed_ms (0) this task's
    criterion 1 also fixes for the sibling fake, plus PLACEHOLDER_PROMPT, the empty string. This
    task renames the two zero-valued constants (from PLACEHOLDER_USAGE/PLACEHOLDER_ELAPSED_MS) and
    rewrites the surrounding comments to state this shape as this task's own settled answer rather
    than a forward reference to it; the values themselves, and PLACEHOLDER_PROMPT, are unchanged.
- criterion: An unseeded key still throws a plain Error, unchanged from the fakes' own existing
    behavior.
  met: true
  how: Both evaluate() and consolidate() still check `if (outcome === undefined)` /
    `if (text === undefined)` and throw `new Error(...)` with the same message text and in the
    same position in each function's control flow, before any zero-valued usage/elapsed_ms or
    placeholder prompt is ever constructed or returned — neither throw's wording nor its guard
    changed.
nodes:
- node: domain/investigation/usage
  encoded_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  how: The node's own two required attributes (input_tokens, output_tokens) are populated with a
    deterministic zero by both fakes' own ZEROED_USAGE constant — newly, for the hypothesis-evaluator
    fake, which never populated the Usage type at all before this task; unchanged in value, only
    renamed, for the assessment-consolidator fake, which already did from the depended-upon task's
    own delivery.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  how: The node's own usage/elapsed_ms attributes, already declared on Evaluation and already
    threaded through judgment-stage.ts's unmodified asEvaluation()/callRecordOf(), are now
    genuinely present (never omitted) for every judgment call this fake answers, since this fake
    never itself skips a call — judgeOneHypothesis's own no-data pre-check, not this fake, is what
    decides whether evaluate() is ever invoked. judgment-stage.ts itself is untouched by this task;
    it already forwards whatever the port's own answer carries, and it now carries the zero-valued
    usage/elapsed_ms unmodified.
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/fake-assessment-consolidator.adapter.ts
  how: This node's own usage/elapsed_ms/prompt attributes live one level below Assessment itself,
    at the ConsolidationOutcome the port already requires (unchanged by this task, per the
    depended-upon task's own delivery record) — this task keeps that record's zero-valued
    usage/elapsed_ms and empty-string prompt as the fake's own final, settled answer rather than a
    placeholder pending this task's own arrival.
- node: domain/investigation/hypothesis-evaluator
  how: The port's own judged responsibility (evidence in, a cited-and-complete evaluation out) is
    unchanged; this task only fixes what value the one fake adapter behind this port reports for
    usage and elapsed_ms, never touching the port interface or its production adapter, so no new
    fact of this node's own reaches the code beyond what the depended-upon task already encoded at
    hypothesis-evaluator.port.ts.
- node: domain/investigation/assessment-consolidator
  how: The port's own judged responsibility (evaluations/evidence/register in, the assessment's
    text out) is unchanged; this task only renames and re-documents the fake's own already-zeroed
    usage/elapsed_ms constants, never touching the port interface or the Anthropic adapter, so no
    new fact of this node's own reaches the code beyond what the depended-upon task already
    encoded at assessment-consolidator.port.ts and both adapters.
inferences:
- inferred: FakeAssessmentConsolidator's placeholder prompt stays the empty string, not a
    different, non-empty placeholder text, even though the depended-upon task's own delivery
    record and this file's own prior header comment forward-referenced this task as the owner of
    "a placeholder prompt string beyond the minimal empty-string one."
  from: This task's own criterion 2 asks only for "a placeholder prompt string," which the empty
    string already satisfies, and this codebase's own established convention for a value with
    nothing meaningful to put there is exactly the empty string (fixtureKey's own comment;
    judgment-stage.ts's noDataEvaluation for a citation field) — nothing in this task's own
    criteria, the depended-upon node texts, or the inventory names what non-empty content such a
    placeholder should hold, so inventing one would be deciding a fact nothing states rather than
    reading one already settled.
- inferred: FakeHypothesisEvaluator's usage and elapsed_ms are overridden on every seeded outcome,
    replacing whatever a seed itself carries for either field, rather than being filled in only
    where a seed omits them.
  from: This task's own "What it is" names "keeping test doubles deterministic" as the point of
    this change, and criterion 1's own phrasing ("for any seeded call") is unconditional rather
    than "when the seed itself does not specify them" — a fake whose usage/elapsed_ms a test could
    still steer away from zero would not be deterministic in that sense. The sibling
    widen-judgment-and-consolidation-ports task's own delivery already established the identical
    override pattern for FakeAssessmentConsolidator (wrapping the seeded text with a fixed
    zero-valued usage/elapsed_ms regardless of what consolidate()'s own three real arguments would
    otherwise imply), the nearest established convention to extend rather than inventing a
    fill-only-if-absent variant with no precedent in this codebase.
- inferred: FakeHypothesisEvaluator's prompt field is left exactly as the seeded outcome carries
    it (present or absent), never itself fixed to a placeholder the way the assessment-consolidator
    fake's prompt is.
  from: Criterion 1's own text names only usage and elapsed_ms, unlike criterion 2's own text for
    the consolidator fake, which separately names a placeholder prompt string — the two criteria's
    differing scope over the very same three-field call record is the signal that this fake's
    prompt was deliberately left out of criterion 1's own requirement, not an omission to fill in.
preserved:
- Both fakes' own fixture-seeding and lookup behavior — FakeHypothesisEvaluator's seed()-by-criterion
  and FakeAssessmentConsolidator's seed()-by-evaluations/evidence/register triple — unchanged.
- Both fakes' own unseeded-key throw -- the same Error message text, in the same position in each
  function's control flow, before any zero-valued/placeholder wrapping is ever constructed.
- FakeAssessmentConsolidator's own zero-valued usage/elapsed_ms and empty-string prompt values
  themselves (0, 0, 0, '') — unchanged from the depended-upon task's own delivery; only the
  constants' own names and the surrounding doc comments changed.
- judgment-stage.ts's own asEvaluation()/callRecordOf() forwarding logic — untouched, and already
  forwards whatever call record a port's own answer carries, so it now forwards
  FakeHypothesisEvaluator's zero-valued usage/elapsed_ms unmodified, the same way it already
  forwarded the Anthropic adapter's real ones.
deferred:
- what: Six pre-existing tests in src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    assert FakeHypothesisEvaluator's exact prior answer via `toEqual` against an object carrying no
    usage/elapsed_ms key at all — "answers the confirmed verdict with exactly the citations seeded
    for it", "answers the refuted verdict with exactly the citations seeded for it", "answers the
    inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying no
    citations", "answers by criterion alone, ignoring the evidence a call carries, even when the
    evidence array is empty", "answers the outcome seeded for this criterion, not the one seeded
    for a different criterion", and "a later seed for the same criterion replaces the earlier one".
    A seventh, "carries a seeded usage, elapsed_ms and prompt through unchanged, proving the
    widened return type declares and accepts all three as optional call-record fields", asserts the
    fake passes a seeded non-zero usage (12/34) and elapsed_ms (567) through untouched, which this
    task's own criterion 1 now overrides to zero. An eighth, "FakeHypothesisEvaluator's own source
    declares no usage or elapsed_ms field, and no prompt field on any answered outcome — proving it
    was left untouched by the widened port's own new, optional call-record fields", scans this
    file's own source text for the words "usage" and "elapsed_ms" and asserts their absence, which
    this task's own change necessarily introduces.
  why: These eight tests exist to prove the depended-upon widen-judgment-and-consolidation-ports
    task's own criterion 5 (this fake left byte-for-byte unchanged) and its own criterion 1 (a
    seeded call record survives untouched) — this task's own declared scope is exactly what
    supersedes both, the same relationship the sibling anthropic-adapters-report-real-usage-and-timing
    task's own delivery record already named for its own stale spec files. Rewriting a test's own
    assertions is the test-author's judgment, not this delivery's to make by editing another pass's
    already-delivered file.
- what: src/__tests__/integration/http/diagnose-e2e.spec.ts's own EXPECTED_NARROWED_EVALUATIONS
    constant (both hypotheses' evaluations with no usage/elapsed_ms key) and buildConsolidator()'s
    own fixture, keyed by that exact evaluations array. buildEvaluator() seeds an
    inconclusive/no-data answer with no citations for both criteria while
    this test's own FakeObservationSource answers 'ok' for both underlying concepts, so
    judgment-stage.ts's runIsolatedCall actually calls evaluate() for both hypotheses rather than
    short-circuiting to its own noDataEvaluation() — the resulting Evaluation now also carries this
    task's own zero-valued usage/elapsed_ms (a call did happen, per domain/investigation/evaluation's
    own presence rule), which no longer matches EXPECTED_NARROWED_EVALUATIONS or the consolidator's
    own seeded fixture key.
  why: This is a direct, foreseeable consequence of criterion 1 attaching usage/elapsed_ms to every
    answer FakeHypothesisEvaluator gives, including one whose own seeded reason happens to be
    no-data from a call that did happen. Updating this fixture and its expected constant is the
    test-author's own judgment, not this delivery's to make.
- what: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts's buildFakes()
    seeds the same shape — an evaluator answer reasoned no-data, and a consolidator fixture keyed
    by an evaluations array carrying no usage/elapsed_ms — but its own comment marks the
    consolidator fixture "unreachable" (persistence refuses the request before drafting is ever
    read back).
  why: Whether this task's change actually reaches an assertion in this file depends on whether the
    deadline this test configures elapses before or after the evaluator's own call would settle,
    which this delivery has no shell to run and confirm; flagged for the test-author's own check
    rather than asserted here as a confirmed failure.
---

## What it is

FakeHypothesisEvaluator's evaluate() now attaches a deterministic zero-valued usage (input_tokens
0, output_tokens 0) and elapsed_ms of 0 to every seeded outcome it answers, overriding whatever a
seed itself carries for either field — this fake never calls a model, so there is no provider
spend or wall-clock time to report, and criterion 1 fixes both at zero for every answer rather than
leaving them to whatever a test happens to seed. FakeAssessmentConsolidator already answered this
same zero-valued usage/elapsed_ms shape, plus an empty-string placeholder prompt, from the
depended-upon widen-judgment-and-consolidation-ports task's own delivery; this task renames its two
zero-valued constants and rewrites the comments that forward-referenced this task as their eventual
owner, so the file now states that shape as settled rather than pending. Neither fake's own
fixture-seeding, lookup, or unseeded-key throw changed.

## Notes

Attaching usage/elapsed_ms unconditionally to every FakeHypothesisEvaluator answer makes several
pre-existing tests stale by design — they were written under the depended-upon task to prove this
fake was left untouched and that a seeded call record survives unchanged, both of which this task's
own criterion 1 now supersedes. Every one is named in `deferred` above rather than edited here,
following the same separation the sibling anthropic-adapters-report-real-usage-and-timing task's
own delivery record already kept for its own stale spec files.
