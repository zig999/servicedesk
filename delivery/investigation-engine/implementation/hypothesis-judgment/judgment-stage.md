---
title: Isolated, deadline-bounded judgment of every required hypothesis
summary: judgeHypotheses assembles Evaluation, one per hypothesis requiresEvaluationOf(theCase) names, in that order, an immediate no-data for a hypothesis whose evidence is not all ok, otherwise one isolated evaluate() call under a caller-configured in-process pool, racing a single shared deadline signal timed once from now/deadline, retrying exactly once on a structurally invalid citation set where that deadline still admits it, and degrading every other path to deadline-exceeded or judgment-failure, never a gap.
task: sha256:3d78984b271fab0e635c327c92adc18846624357887f6e826309615ed217ec0d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-judgment-stage-build
files:
- path: src/investigation/evaluation.ts
  effect: Declares Evaluation (domain/investigation/evaluation), a discriminated union mirroring hypothesis-evaluator.port.ts's own EvaluationOutcome exactly, adding only the hypothesis field that port deliberately omits. Confirmed and refuted each require a non-empty citations tuple, enforced by the type itself; inconclusive requires a reason and carries whatever citations ground it, possibly none.
- path: src/investigation/judgment-stage.ts
  effect: 'Declares JudgeHypothesesOptions and the exported judgeHypotheses(options), plus its private helpers: CallPool (a small in-process concurrency limiter), createDeadlineGuard (the one shared deadline signal/flag the whole call races against), acquireSlotOrDeadline, judgeOneHypothesis, runIsolatedCall, retryOrFail, raceEvaluateAgainstDeadline, isStructurallyValid, outputSchemasFor (re-resolves each cited concept''s capability to build the CapabilityOutputSchemas map citation-validation needs), toEvidenceItems, hypothesisNamed, evidenceFor, and the four small Evaluation-builders (noDataEvaluation, deadlineExceededEvaluation, judgmentFailureEvaluation, asEvaluation). Together they judge every required hypothesis exactly as the task''s criteria state.'
criteria:
- criterion: Every hypothesis the pinned case requires receives exactly one evaluation, and no hypothesis is silently omitted.
  met: true
  how: judgeHypotheses maps requiresEvaluationOf(theCase), in that order, through Promise.all(...judgeOneHypothesis...); every path inside judgeOneHypothesis, runIsolatedCall and retryOrFail returns exactly one Evaluation (noDataEvaluation, deadlineExceededEvaluation, judgmentFailureEvaluation or asEvaluation of a validated/passthrough answer), no branch returns nothing, skips a name, or produces a second Evaluation for one already answered.
- criterion: Each hypothesis is judged in its own call, isolated from every other hypothesis's prompt, under a configured pool bound.
  met: true
  how: runIsolatedCall calls evaluator.evaluate(hypothesis.criterion, evidenceItems) with only that one hypothesis's own criterion and its own matched evidence, never another's, and never batches two hypotheses into one call. CallPool(poolSize), built fresh per judgeHypotheses call from the caller-supplied poolSize, bounds how many such calls may be in flight at once across every hypothesis this call judges.
- criterion: A response whose citations fail structural validation triggers one retry when the remaining deadline admits it, and otherwise the evaluation falls back to inconclusive with reason judgment-failure.
  met: true
  how: runIsolatedCall checks isStructurallyValid(context, first.citations), built from citation-validation's own acceptedCitations against that hypothesis's collects, its evidence and the re-resolved output schemas, and on failure calls retryOrFail, which checks deadlineGuard.elapsed() first (no retry at all, judgmentFailureEvaluation), otherwise races a second evaluate() call and, on a second structural failure, also falls back to judgmentFailureEvaluation with no citations.
- criterion: A hypothesis that never receives a call slot before the stage's deadline, or whose call has not returned by then, is recorded inconclusive with reason deadline-exceeded, never no-data or judgment-failure.
  met: true
  how: acquireSlotOrDeadline answers deadlineExceededEvaluation for a hypothesis denied a slot (checked synchronously against the already-elapsed flag first, then raced against the shared deadline signal while queued), evaluate() is never called for it. raceEvaluateAgainstDeadline answers the DEADLINE_ELAPSED marker for either the first or the retry call not settling in time, and both map to deadlineExceededEvaluation, never to noDataEvaluation or judgmentFailureEvaluation.
- criterion: A hypothesis whose evidence result is not ok is recorded inconclusive with reason no-data, citing that evidence.
  met: true
  how: judgeOneHypothesis filters the hypothesis's own evidence for item.result !== 'ok' before ever calling acquireSlotOrDeadline or touching the pool; noDataEvaluation cites every one of those non-ok items (concept plus an empty-string field, recorded below as an inference) rather than only the first.
- criterion: A confirmed or refuted evaluation carries at least one citation; an evaluation with none is never confirmed or refuted.
  met: true
  how: isStructurallyValid answers false outright when citations.length === 0, on both the first and the retry call, so a decided answer with zero citations is never accepted as-is, it is retried (if the deadline admits) or degraded to judgment-failure, on top of EvaluationOutcome's and Evaluation's own type-level guarantee that the confirmed/refuted branches carry a non-empty citations tuple.
nodes:
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The port and its fake already ship from task/hypothesis-judgment/hypothesis-evaluator-port; this task is the port's first real consumer, and runIsolatedCall/retryOrFail are where the node's own responsibility, one hypothesis's criterion and evidence only, per call, is actually realized in practice.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/judgment-stage.ts
  how: evaluation.ts declares every attribute the node lists (hypothesis, verdict, reason, citations) as a discriminated union mirroring EvaluationOutcome exactly. judgment-stage.ts is where the full per-hypothesis record is actually assembled, naming the hypothesis on every path, exactly the assembly hypothesis-evaluator.port.ts's own record explicitly deferred here.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The vocabulary itself is already declared at evaluation-reason.ts by the prior task; this task is the one place that assigns each of the three values to its own distinct circumstance, no-data before the pool, judgment-failure on a twice-invalid or unretriable citation set, deadline-exceeded for a denied slot or an unsettled call, never overlapping and never inferred.
- node: domain/investigation/citation
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: Citation is already declared at citation.ts; this task is the first to construct one outside a fixture, in noDataEvaluation, and the first to decide what a no-data citation's field holds where the grounding evidence never observed one.
- node: domain/investigation/verdict
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/judgment-stage.ts
  how: VERDICTS/Verdict are already declared at verdict.ts; evaluation.ts's Evaluation discriminates on this same vocabulary exactly as EvaluationOutcome does, and judgment-stage.ts is where all three values actually get assigned to a real per-hypothesis record for the first time.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The concept-membership check itself lives in citation-validation.ts and is not re-encoded here. This task supplies the real HypothesisCitationContext that check runs against, and is the first to decide what happens on a refusal, one retry where the deadline admits it, otherwise judgment-failure, which is this rule's own consequence, not its check.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The field-existence check itself lives in citation-validation.ts; this task is the first to build the CapabilityOutputSchemas map that check needs, re-resolving each cited concept's capability through the registry and keying by that capability's own current name and version, never by concept, and decides the retry-or-fallback consequence of a refusal.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/judgment-stage.ts
  how: Evaluation's confirmed and refuted branches type citations as a non-empty tuple, the same compiler-enforced guarantee EvaluationOutcome already carries; isStructurallyValid additionally re-checks this at runtime before an answer is ever accepted, so a zero-citation decided answer is never returned as-is by this stage.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: Every inconclusive Evaluation this stage produces carries one of the three declared reasons, and noDataEvaluation specifically cites every non-ok evidence item, exactly the rule's own further clause.
- node: rules/investigation/judgment-does-not-infer
  how: Honored, not encoded. This stage structurally validates a decided answer's citations and passes an already-inconclusive answer through unchanged, but whether the evaluator actually deduced its verdict from the evidence rather than inventing one behind a structurally valid citation is the adapter's own prompt discipline, not something this orchestration can check. This is exactly the task's own UNDERDETERMINED note, deferred below rather than settled in code.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: 'This task answers only its own clause, judgment records deadline-exceeded: the shared deadline guard and deadlineExceededEvaluation never abort the stage or throw on overrun, they degrade to a recorded reason. The collection-side and persistence clauses belong elsewhere, per this task''s own REMAINDER notes.'
- node: rules/investigation/one-evaluation-per-required-hypothesis
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: 'judgeHypotheses''s own totality (criterion 1) is exactly this invariant''s precondition: one Evaluation per requiresEvaluationOf(theCase) name, inconclusive counting, none silently dropped. Enforcing the invariant over a built Investigation aggregate is task/investigation-lifecycle/investigation-factory''s own, not built here.'
- node: scenarios/investigation/a-foreign-citation-is-refused
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: 'retryOrFail reproduces the scenario''s own given/when/then exactly: a refused response triggers one retry where the remaining deadline admits it, and otherwise falls back to inconclusive with reason judgment-failure, the deadline beats the retry, always, is exactly deadlineGuard.elapsed()''s synchronous check before ever starting a second call.'
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: 'acquireSlotOrDeadline reproduces this scenario exactly: a pool that never frees a slot before the shared deadline elapses answers false, and judgeOneHypothesis turns that into deadlineExceededEvaluation, never no-data and never judgment-failure.'
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: 'This task answers only the middle step this task''s own REMAINDER notes leave it: the evaluation of the hypothesis collecting it is inconclusive with reason no-data, citing that evidence. A timeout result is one of the non-ok EvidenceResult values, so judgeOneHypothesis''s own precondition check and noDataEvaluation handle it exactly like any other non-ok result, citing it.'
- node: contracts/integration/capability-registry
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: outputSchemasFor is a new consumer of ICapabilityQuery.readCapability, reading through it exactly as the contract publishes, the capability currently answering a concept, with its declared contract, or its absence as plain data, never a connector or the store directly.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: CallPool is exactly this constraint's own pool, bounded by the caller-supplied poolSize, one evaluate() call per hypothesis, never batched; and a hypothesis denied a slot never calls evaluate() at all, so it costs nothing, the fitness clause's own literal test.
- node: constraints/judgment-runs-behind-a-port
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: judgment-stage.ts depends only on IHypothesisEvaluator, ICapabilityQuery and this module's own sibling types, never a concrete adapter, an LLM client or a provider client.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: now and deadline arrive as explicit JudgeHypothesesOptions fields, never read from the system clock; createDeadlineGuard computes the one ceiling, Math.max(0, deadline - now), exactly once at entry, and every pool-slot wait and every evaluate() call or retry races the single signal built from it, never a value re-derived from a fresh clock read.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/judgment-stage.ts
  how: Both files import only sibling investigation/case/capability-registry module types, or nothing at all, no framework, driver or provider client. The one runtime primitive judgment-stage.ts uses beyond plain data (setTimeout, inside createDeadlineGuard and CallPool.acquire) is a global, never an import.
inferences:
- inferred: A no-data citation's field is the empty string, since the non-ok evidence item it points at never observed one.
  from: The task's own explicit direction to match evidence-collection-stage.ts's established convention for a value with nothing meaningful to put there, and Citation.field's type is a plain string with no other value the specification states for this case.
- inferred: Where more than one of a hypothesis's collected concepts is non-ok, noDataEvaluation cites all of them, not just one.
  from: rules/investigation/an-inconclusive-evaluation-declares-its-reason's own text says a no-data reason cites the evidence whose result is not ok (evidence, not a single item), and domain/investigation/citation's own stated ethos, traceability that is machine-checkable by construction, not a promise, argues against silently dropping a second non-ok concept's trace just because a first one was already cited.
- inferred: evidenceByHypothesis is keyed by hypothesis name (a plain string), never by the Hypothesis value or a synthetic index.
  from: domain/investigation/evaluation's own Description states an evaluation is identified by the hypothesis name within the pinned case, a name and not a model reference, and the task's own instruction leaves how the caller supplies per-hypothesis evidence to this delivery to decide.
- inferred: A hypothesis name requiresEvaluationOf(theCase) answers but theCase.hypotheses does not actually contain, or one evidenceByHypothesis carries no entry for, is a thrown caller-contract fault, never a manufactured domain outcome or a silently substituted empty array.
  from: FakeHypothesisEvaluator's own already-delivered convention, a test setup fault, not one of the three verdicts, extended to this stage's own caller contract, since none of the three EvaluationReason values represents an incomplete composition, and evidence-collection-stage's own totality guarantees this situation never arises under a correctly-composed caller.
- inferred: One shared deadline signal/flag, timed once at judgeHypotheses's own entry from that call's own now and deadline, is raced by every pool-slot wait and every evaluate() call and retry alike, rather than a fresh per-call timer recomputed at the moment each one actually starts.
  from: The never a system clock read internally discipline evidence-collection-stage.ts and idempotency-lease-store.ts already established, combined with the fact that (unlike collection's own calls, which all start in the very same tick) this stage's calls start at whatever moment a pool slot happens to free, recomputing a fresh per-call bound at each of those moments would need either a live clock read or a stale duration reused from stage-entry that would extend a late-starting call's own bound past the true absolute deadline.
- inferred: No separate nominal per-stage judgment budget is layered on top of the propagated remaining time; the pool's whole ceiling, queue wait plus call execution, first call plus any retry combined, is simply Math.max(0, deadline - now).
  from: 'Explicit direction for this task: no node in this task''s own implements states a judgment-specific nominal budget figure, unlike rules/investigation/collection-has-its-own-budget-within-the-total, which exists for collection and has no stated analogue for judgment; decision-log.md''s own entry for the total deadline mentions five of judgment only as reasoning for how the whole twenty-second total was chosen, never as a rule this task implements.'
- inferred: A retry, once started, runs under the same pool slot the first call already holds, rather than releasing it and competing for a fresh acquisition.
  from: The task's own step 3 names one acquisition per hypothesis and step 4's retry discussion never mentions a second acquisition. Since the first and any retry call for one hypothesis are always sequential, at most one evaluate() call for that hypothesis is ever actually in flight at a time, so one slot held across both keeps the pool's own concurrency accounting exactly meaningful.
- inferred: A retry answer that itself comes back inconclusive is passed through unchanged, exactly like the first call's own inconclusive answer, rather than being retried again or having its citations re-validated.
  from: The task's own instruction that an evaluator answer that is already inconclusive is passed through unchanged is stated generically about an evaluator's answer, not scoped to the first call alone, and neither criterion 3/6 nor the scenario distinguishes a retry's own answer from the first's for this purpose.
- inferred: toEvidenceItems always types the reshaped item's result as the literal 'ok', since it is only ever called on a hypothesis's evidence after judgeOneHypothesis's own precondition has already confirmed every item is ok.
  from: hypothesis-evaluator.port.ts's own EvidenceItem/ObservationOutcome shape requires the result discriminant to be one specific literal per branch, and this stage's own no-data precondition is what makes 'ok' the only value ever actually true at this call site.
deferred:
- what: Matching evidence-collection-stage's own per-concept Evidence[] output into the per-hypothesis Evidence[] this task's own evidenceByHypothesis expects.
  why: This task's own scope reads only required hypotheses and their already-matched evidence; the task itself states this stage does not call the collection stage, and that composition belongs to whichever later task assembles both stages together.
- what: Wiring judgeHypotheses into any factory or a production entry point.
  why: No consumer of this stage exists anywhere in the tree yet; task/investigation-lifecycle/diagnose-entry-point is what composes collection, judgment, drafting and persistence, not this task.
- what: Building an Investigation aggregate from this stage's own array of Evaluations, and enforcing rules/investigation/one-evaluation-per-required-hypothesis by refusing a build that fails it.
  why: Belongs to task/investigation-lifecycle/investigation-factory; this task only produces the totality that invariant's own enforcement will need, never the aggregate itself.
- what: The real (LLM) production adapter behind IHypothesisEvaluator and its closed-prompt discipline, and closing the UNDERDETERMINED gap this task's own Notes carry, that a structurally valid citation set does not, by itself, prove the verdict it grounds was actually deduced rather than invented.
  why: Already the epic's own declared remainder per task/hypothesis-judgment/hypothesis-evaluator-port's own delivery record; closing that gap is either the real adapter's own closed-prompt discipline or a human decision through the specification, never this orchestration's to invent, per the task's own UNDERDETERMINED note (not blocking).
- what: Collection's own timeout-recording behavior on its own deadline, and the whole-investigation proceeds and answers within the total deadline guarantee.
  why: Per this task's own REMAINDER notes, the former belongs to task/evidence-collection/evidence-collection-stage and the latter to task/investigation-lifecycle/diagnose-entry-point; neither is this stage's own behavior to demonstrate.
- what: Persistence's own deadline exception (its failure is an error to the requester, unlike every other stage).
  why: Per this task's own REMAINDER note, this clause of rules/investigation/no-stage-aborts-on-its-deadline belongs to task/investigation-lifecycle/investigation-store and task/investigation-lifecycle/diagnose-entry-point.
---

## What it is

The stage that turns required hypotheses and their evidence into one evaluation each. Every degradation path this stage can hit — a foreign citation, a missed pool slot, evidence that never arrived — lands as one of the three declared reasons, never as a gap or an invented inference.

## Notes

The task's own UNDERDETERMINED note — structural citation validity does not itself prove a verdict was actually deduced rather than invented (rules/investigation/judgment-does-not-infer) — is not closed here: this orchestration validates structure and passes an evaluator's own verdict through, and closing that gap belongs to the real adapter's closed-prompt discipline or a human decision, never invented in code.
