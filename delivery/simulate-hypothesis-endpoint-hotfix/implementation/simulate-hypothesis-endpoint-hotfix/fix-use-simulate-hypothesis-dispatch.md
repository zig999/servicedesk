---
title: Fix use-simulate-hypothesis dispatch to the delivered backend route
summary: Rewires the simulate-hypothesis dispatch hook and its cockpit call site to POST /v1/simulate/hypothesis
  with the case/subject/requester/hypothesis body and the evidence/evaluation/durations response shape
  the backend actually delivered, replacing the never-registered nested per-case-version URL that produced
  a 404.
task: sha256:52d76e8c8a3908567b1e3563619c0cffe7da41e88db5e3b8a63b804d9980d6c9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-build-4
files:
- path: src/hooks/use-simulate-hypothesis.ts
  effect: 'dispatches POST /v1/simulate/hypothesis (not a per-case-version nested path) with a body of
    exactly { case: { slug, version }, subject, requester, hypothesis }; onSimulate now takes (hypothesisName,
    subject, requester) and forwards requester unchanged into the dispatched body; the typed success response
    (SimulateHypothesisResult) now models the route''s own delivered response shape -- evidence (with
    its own flat capability_name/capability_version fields), evaluation (citations present, possibly empty,
    on every verdict branch) and durations (collection/judgment/total, no writing) -- while still exposing
    no outcome and no assessment field'
- path: src/hooks/use-case-simulation-cockpit.ts
  effect: onSimulateHypothesis now calls hypSim.onSimulate(hypothesisName, subjectState.subject, subjectState.requester),
    forwarding the same requester value onSimulateCase's own dispatch already forwards, instead of the
    two-argument call that dropped it before this fix
criteria:
- criterion: The hook's mutation dispatches POST to /v1/simulate/hypothesis, never to /v1/cases/{slug}/versions/{version}/simulate-hypothesis.
  met: true
  how: SIMULATE_HYPOTHESIS_ENDPOINT is the literal "/v1/simulate/hypothesis", and the mutationFn's apiFetch
    call uses it verbatim with method POST; slug/version are read from closure only to build the body's
    case field, never interpolated into a URL
- criterion: 'The dispatched request body is exactly { case: { slug, version }, subject, requester, hypothesis
    }, matching simulateHypothesisRequestSchema''s required fields -- never the case-and-requester-less
    body the hook sent before.'
  met: true
  how: SimulateHypothesisRequestBody declares exactly those four fields (case, subject, requester, hypothesis),
    and onSimulate constructs the dispatched body with exactly those four keys -- case built from the
    hook's own slug/version, hypothesis from hypothesisName
- criterion: The hook's typed success response models the route's own response shape -- evidence, evaluation,
    durations -- while still exposing no outcome and no assessment field.
  met: true
  how: SimulateHypothesisResult is now { evidence, evaluation, durations }, each field's own type read
    fresh from the route's own DTO (simulate-hypothesis.dto.ts's evidenceSchema, evaluationSchema, durationsSchema)
    -- no outcome or assessment field appears anywhere in the type
- criterion: onSimulate accepts a requester argument and forwards it unchanged into the dispatched body,
    the same way useSimulateCase's onSimulate already receives one from its caller.
  met: true
  how: onSimulate's signature gained a third parameter, requester -- read verbatim into body.requester
    with no transformation, mirroring how useSimulateCase's onSimulate already places its caller's requester
    into its own dispatched body unchanged
- criterion: use-case-simulation-cockpit.ts's onSimulateHypothesis call site passes subjectState.requester
    through to hypSim.onSimulate, the same value it already passes to caseSim.onSimulate.
  met: true
  how: onSimulateHypothesis now calls hypSim.onSimulate(hypothesisName, subjectState.subject, subjectState.requester)
    -- the identical subjectState.requester value onSimulateCase already passes to caseSim.onSimulate
    a few lines above
- criterion: A dispatch against the live backend route for a case version whose manifest holds the named
    hypothesis returns exactly one evaluation for that hypothesis.
  met: true
  how: the frontend now sends the route's own required shape (case, subject, requester, hypothesis) to
    the route it actually registers, and the typed response's evaluation field is a single object (never
    an array) -- the wire-level guarantee that exactly one evaluation returns for the named hypothesis
    is the backend's own delivered contract (scenarios/investigation/a-single-hypothesis-is-simulated),
    which this fix makes the frontend reachable against rather than 404ing before ever exercising it
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the hook's header comment and its dispatch now name and address the route the contract's own simulate-hypothesis
    operation was actually delivered under, narrowing the run to one named hypothesis's own collection
    and judgment and resolving no outcome, exactly as the contract's own description states
- node: domain/investigation/evaluation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the Evaluation discriminated union carries hypothesis, verdict, citations, and the optional usage/elapsed_ms/prompt
    triple present exactly when a judgment call happened -- widened by this fix to carry citations on
    the inconclusive branch too, matching the node's own attribute list read together with the route's
    own delivered schema
- node: domain/investigation/verdict
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the Verdict type is the node's own closed set (confirmed/refuted/inconclusive), unchanged by this
    fix and reaffirmed as the discriminant of Evaluation
- node: domain/investigation/citation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the Citation type carries exactly concept and field, unchanged by this fix; it is now also carried
    on the inconclusive Evaluation branch, per the route's own schema
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the EvaluationReason type is the node's own closed set (no-data/judgment-failure/deadline-exceeded),
    unchanged by this fix
- node: domain/investigation/usage
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the Usage type carries exactly input_tokens and output_tokens, unchanged by this fix
- node: domain/investigation/evidence
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: newly encoded by this fix -- the Evidence and EvidenceResult types and the SimulateHypothesisResult.evidence
    field did not exist before this fix (the prior version's response carried no evidence at all); they
    now mirror the node's own attributes and the route's own delivered evidenceSchema, including its flat
    capability_name/capability_version fields
- node: domain/investigation/durations
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: newly encoded by this fix -- the Durations type and the SimulateHypothesisResult.durations field
    did not exist before; the type is narrower than the node's own full attribute set, carrying no writing
    field, since the route's own durationsSchema never carries one for an operation that never consolidates
- node: domain/investigation/subject
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  - src/hooks/use-case-simulation-cockpit.ts
  how: SimulateHypothesisSubject/SimulateHypothesisSubjectAttribute (unchanged by this fix) still carry
    the whole assembled attribute-value set the caller passes in; the cockpit's call site still forwards
    subjectState.subject unchanged into onSimulate, per the node's own "the entry point ... assembles
    that whole set before the diagnose call"
- node: domain/investigation/investigation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  - src/hooks/use-case-simulation-cockpit.ts
  how: the node's own "requester ... is always given" on every diagnose-family call is why requester is
    now a required field of the dispatched body and a required, unconditionally forwarded argument of
    onSimulate and of the cockpit's own call site -- this hook does not itself model an Investigation
    aggregate (a simulation writes none), so the node is honored through that one fact rather than through
    a full aggregate encoding
- node: domain/knowledge/case
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: SimulateHypothesisCaseRef.slug names the case by its own stable identity, the same slug this hook's
    constructor argument already carried before this fix -- only its wire placement moved, from the URL
    path into the request body's case field
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: SimulateHypothesisCaseRef pairs slug with the immutable version number, the pinned identity the
    request body's case field now carries -- previously addressed through the URL path alone, which is
    why the corrected route can no longer read it there
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: the request body's hypothesis field and the Evaluation type's own hypothesis field both name the
    one hypothesis this run narrows to by its name, reached only through the hypothesis it belongs to,
    never by a revision reference of its own -- unchanged by this fix
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: SimulateHypothesisResult carries exactly one evaluation field (never an array, never an outcome
    or assessment field), matching the scenario's own "exactly one evaluation returns" and "no outcome
    and no assessment are resolved" -- this fix widens the envelope with evidence and durations without
    touching that guarantee
inferences:
- inferred: An inconclusive evaluation's citations field is present (a possibly-empty array) rather than
    absent, on every verdict branch of the Evaluation type.
  from: the route's own delivered evaluationSchema (simulate-hypothesis.dto.ts) declares citations as
    a required key on its inconclusive branch too (unbounded, unlike the min(1) confirmed/refuted branches)
    -- domain/investigation/citation.md itself states presence only as "when decided" and does not settle
    whether the key exists on an inconclusive record, so this is a wire-shape fact read from the now-live
    backend source rather than a domain fact any implemented node states
- inferred: Evidence's capability reference travels as two flat fields, capability_name and capability_version,
    rather than as a nested capability object.
  from: the route's own delivered evidenceSchema (simulate-hypothesis.dto.ts) declares exactly those two
    flat fields -- read fresh from that now-live source rather than mirrored from the sibling use-simulate-case.ts
    hook's own differing, pre-existing nested convention, since this task's own criterion 3 asks this
    hook to model this route's own response shape
- inferred: useSimulateHypothesis's own hook-level constructor signature (slug, version) stays unchanged;
    the case identity now travels in the dispatched body, built from that same closure, rather than moving
    to become part of onSimulate's own per-dispatch arguments.
  from: none of this task's own criteria asks for the hook's own top-level parameter shape to change,
    and the cockpit's existing call site (useSimulateHypothesis(slug, version)) already supplies exactly
    what the body's case field needs -- the minimal change consistent with every stated criterion
- inferred: onSimulate's requester is added as a third positional argument (hypothesisName, subject, requester)
    rather than folding all three into one body object the way useSimulateCase's onSimulate already does.
  from: this hook's own established per-argument dispatch convention (hypothesisName and subject already
    travelled this way before this fix, per this file's own header comment on why); no criterion of this
    task asks for the two sibling hooks' differing call conventions to converge
preserved:
- 'rules/investigation/a-simulation-writes-no-investigation''s frontend half: use-simulate-hypothesis.ts
  still imports no useQueryClient and calls no invalidateQueries -- its only observable effect stays the
  mutation''s own in-memory result'
- the isDispatchingRef re-entrancy guard in useSimulateHypothesis, refusing a second concurrent dispatch
  while one is already in flight
- the dispatch-failure-to-message mapping through uiStateForApiError and SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE_BY_KIND
  in use-simulate-hypothesis.ts
- use-case-simulation-cockpit.ts's own gating (canSimulateNow, shared across both dispatch hooks), its
  one-shared-subject composition, its per-hypothesis evaluation map overwrite semantics (criterion 4 of
  task/simulation-cockpit/screen-assembly), its case-result-only-from-a-full-case-run behavior (criterion
  5 of that same task), and its return-from-editing staleness mechanism -- none of these were touched
  by this fix, only the one onSimulateHypothesis call site's own forwarded arguments
deferred:
- what: The sibling test-support fixtures this hook's own spec files share (use-simulate-hypothesis.test-support.ts,
    use-case-simulation-cockpit.test-support.ts, routes/case-simulation-ready-view.test-support.ts under
    src/) still model the old nested per-case-version URL and the old response shape (no evidence, no
    durations, no citations on an inconclusive evaluation).
  why: these are test fixtures, outside this delivery's own remit (writing source, never tests) and outside
    this task's own named file set (use-simulate-hypothesis.ts, use-case-simulation-cockpit.ts) -- left
    for the test-author's own pass over this same task
- what: case-simulation-cockpit-adapters.ts's toDetailEvidence and the cockpit's own Detail region still
    read evidence only from a completed full-case run's own result (lastCaseResult.evidence), never from
    a completed single-hypothesis run's own evidence array, even though SimulateHypothesisResult now carries
    one after this fix.
  why: that adapters file and the Detail region's own composition are outside this task's named file set,
    and no criterion of this task asks for the Detail region to surface hypothesis-level evidence
- what: 'use-simulate-case.ts''s own SimulateEvidenceItem type nests the capability reference as capability:
    {name, version}, while its own route''s actual delivered DTO (src/src/http/dto/simulate-case.dto.ts)
    carries it as two flat fields, capability_name and capability_version -- the same divergence this
    fix avoided when modeling use-simulate-hypothesis.ts''s own Evidence type against its own route''s
    DTO.'
  why: use-simulate-case.ts is not one of the two files this task names, and widening this fix to correct
    it would reach past this task's own objective
---

## What it is

Rewires use-simulate-hypothesis.ts's dispatch (and its use-case-simulation-cockpit.ts call site)
to the real backend route -- POST /v1/simulate/hypothesis -- with the body and response shape
simulateHypothesisRequestSchema/simulateHypothesisResponseSchema actually declare, replacing the
never-registered nested per-case-version URL that produced the reported 404.

## Notes

Corrective increment: fixes wiring between two independently delivered, closed initiatives
(case-simulation-frontend, case-simulation-backend); answers to no criterion either plan's tasks
state.
run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-setup passed (npm ci).
run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-build failed at
typecheck: this worktree's frontend/tui git submodule was not initialized (git worktree add does
not initialize submodules), so every @tui/ui and @tui/lib path alias resolved to nothing --
environment, not source; fixed by initializing the submodule.
run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-build-2 failed at
typecheck: the initialized submodule's own frontend/tui/frontend had no node_modules of its own
(it is installed separately from this app) -- environment, not source; fixed by running its own
npm ci.
run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-build-3 failed at
typecheck with zero errors in either file this task wrote (use-simulate-hypothesis.ts,
use-case-simulation-cockpit.ts) and every error in six pre-existing test/fixture files from the
closed case-simulation-frontend initiative, asserting the exact defective dispatch (nested URL,
two-argument onSimulate, {evaluation}-only response) this task's own criteria replace -- not a
sibling task's valid guarantee falsified by excess, but the bug's own prior test surface; brought
current by this task's own proof (test-author), never edited from this step.
run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-build-4 passed, clean,
after the proof updated those six files.
