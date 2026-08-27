---
implementation: sha256:0d535330bebfce5cd8799f3c4e8e66977ea5a4ca3020b628351c7e3f2803a9b8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-use-simulate-hypothesis-suite-4
title: Proof for the use-simulate-hypothesis hook
summary: Tests over useSimulateHypothesis's request shape, response shape, no-invalidation guarantee,
  failure resolution and pending/re-entrancy gating, extending two already-existing spec files with the
  one gap found (the judgment-call-carrying evaluation fields) rather than duplicating what was already
  proven.
tests:
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: sends only {hypothesis, subject} in the POST body, naming the one hypothesis passed to onSimulate
  proves: Criterion 1 (the request observes only one named hypothesis and its subject, never a manifest
    or collection-plan union — proven structurally per the task's own Notes) and the inferred endpoint/body
    shape (POST /v1/cases/{slug}/versions/{version}/simulate-hypothesis with {hypothesis, subject}) and
    the inferred subject wire shape ({type, attributes:[{attribute,value}]}).
  fails_when: onSimulate dispatches more than one request, or the POST body carries any field beyond hypothesis
    and subject (e.g. a manifest, a hypothesis list, or a differently-shaped subject).
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: returns exactly the evaluation the mocked response carried, with no other key present at runtime
  proves: Criteria 2 and 3 (the success response carries exactly one evaluation and no outcome/assessment
    field) and, incidentally, the inferred plain-string modeling of Citation.concept, since the fixture's
    concept value flows through the deep-equality check unaltered.
  fails_when: result carries anything other than exactly { evaluation }, or the evaluation returned differs
    from what the mocked response sent (a field added, dropped, or renamed).
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries a citations array and no reason on a decided (confirmed/refuted) evaluation, matching
    domain/investigation/evaluation's own decided branch
  proves: Criterion 2's decided-branch shape (citations present, reason absent) for domain/investigation/evaluation,
    domain/investigation/verdict and domain/investigation/citation.
  fails_when: a confirmed/refuted evaluation is returned without a citations key, or carries a reason
    key.
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: passes usage, elapsed_ms and prompt through unchanged when the response carries them, naming the
    judgment call that actually happened (criterion 2's own "usage/elapsed_ms/prompt when a judgment call
    happened")
  proves: Criterion 2's optional-fields clause (usage/elapsed_ms/prompt present exactly when a judgment
    call happened) for domain/investigation/evaluation and domain/investigation/usage, and the inferred
    snake_case wire naming (input_tokens, output_tokens, elapsed_ms, prompt) for the response side.
  fails_when: usage, elapsed_ms or prompt are dropped, renamed, or altered between the mocked response
    and the value the hook exposes as result.evaluation.
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries a reason and no citations on an inconclusive evaluation, matching domain/investigation/evaluation's
    own inconclusive branch
  proves: Criterion 2's inconclusive-branch shape (reason present, citations absent) for domain/investigation/evaluation
    and domain/investigation/evaluation-reason.
  fails_when: an inconclusive evaluation is returned without a reason key, or carries a citations key.
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: type-checks that SimulateHypothesisResult can never carry an outcome or assessment field, and
    that Evaluation's own two branches stay mutually exclusive (checked by this project's own typecheck
    step, TYP-04)
  proves: Criterion 3 (no outcome/assessment field) and TYP-04's discriminated-union shape for Evaluation,
    at the type level rather than only the runtime level.
  fails_when: SimulateHypothesisResult gains an outcome or assessment property, or Evaluation stops being
    modeled as a discriminated union that forbids citations on the inconclusive branch or reason on the
    decided branch — any of which would make the ts-expect-error assertions fail to error, which the project's
    own typecheck step reports.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: never calls invalidateQueries on the surrounding QueryClient across a full successful dispatch
  proves: Criterion 4 and rules/investigation/a-simulation-writes-no-investigation's frontend half, on
    the success path.
  fails_when: the hook calls queryClient.invalidateQueries (or otherwise triggers it) after a successful
    simulate-hypothesis dispatch.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: never calls invalidateQueries when the dispatch fails either
  proves: Criterion 4 and rules/investigation/a-simulation-writes-no-investigation's frontend half, on
    the failure path.
  fails_when: the hook calls queryClient.invalidateQueries after a failed simulate-hypothesis dispatch.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: resolves the same fallback message for two backend error codes that map to different uiStateForApiError
    kinds, since neither is hand-checked at this call site
  proves: Criterion 5 (a dispatch failure resolves through uiStateForApiError's own convention rather
    than a hand-checked error.code at the call site).
  fails_when: the two distinct error codes resolve to different messages (which would mean some call-site
    branching on error.code exists), or either message stops being the one convention's generic fallback.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: resolves simulationError to a non-null message even for a failure that never reached the backend
    as an ApiError at all
  proves: Criterion 5's non-ApiError branch (a network-level failure still resolves to a UI-facing message
    rather than surfacing a raw error or staying null).
  fails_when: simulationError stays null, throws, or exposes something other than the generic fallback
    message after a fetch-level (non-ApiError) failure.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: starts at false, becomes true while the dispatch is in flight, and returns to false once it settles
  proves: Criterion 6 (the hook exposes a pending status reflecting an in-flight dispatch).
  fails_when: isSimulating does not start false, does not become true once onSimulate is called, or does
    not return to false once the mutation settles.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: 'dispatches only one POST when onSimulate is called twice before the first call settles (edge
    case: two operations against one subject at once)'
  proves: Criterion 6's re-entrancy gate (a second concurrent dispatch is actually refused, not merely
    observable as pending).
  fails_when: a second onSimulate call issues a second POST while the first is still in flight.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: allows a fresh dispatch once a previous one has failed, rather than staying permanently gated
  proves: Criterion 6's gate is scoped to one in-flight dispatch rather than latching permanently after
    a failure — the isDispatchingRef re-entrancy guard clears in onSettled regardless of outcome.
  fails_when: a dispatch after a prior failure is silently swallowed (fetchMock never reaches a second
    call), leaving the hook permanently unable to dispatch again.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: 'issues no request when the hypothesis name is blank (edge case: an operation against a state
    that forbids it)'
  proves: The hook refuses to dispatch an incomplete request (no hypothesis named) rather than sending
    a request with an empty hypothesis field.
  fails_when: a fetch call is issued for a blank hypothesis name, or isSimulating becomes true for a call
    that should have been refused.
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: 'issues no request when the subject carries no attributes (edge case: an operation against a state
    that forbids it)'
  proves: The hook refuses to dispatch an incomplete request (no subject attributes) rather than sending
    an empty-subject request.
  fails_when: a fetch call is issued for a subject with an empty attributes array.
not_applicable:
- edge_case: A subject carrying a blank type but at least one attribute
  why: No criterion or the implementation record's own inferences single out type in isolation from attributes
    in the dispatch guard; the blank-hypothesis and no-attributes tests already establish that onSimulate
    refuses an incomplete dispatch, and a third variant on the same guard would repeat that assertion
    under a different input without testing anything new.
- edge_case: A slug containing characters requiring URL-encoding
  why: No criterion or inference states a fact about slug encoding, and every existing test already constructs
    SIMULATE_PATH from the exact encoded slug the hook is expected to produce — stubFetch's own thrown
    guard would already fail any test loudly if encodeURIComponent were dropped or altered, so encoding
    is exercised as a byproduct of every dispatch test.
- edge_case: Two separate useSimulateHypothesis hook instances (e.g. two case versions) dispatching concurrently
  why: Each call owns its own useRef and useMutation instance — cross-instance isolation is React's own
    per-call-site state guarantee, not a fact this task's criteria or inferences state anything about,
    and no bound node asks for cross-instance coordination.
- edge_case: A response whose evaluation carries an unrecognized verdict value outside the closed vocabulary
  why: domain/investigation/verdict.md's vocabulary is closed to confirmed/refuted/inconclusive and no
    criterion asks the hook to validate or refuse an out-of-vocabulary wire value at runtime; TYP-01's
    strict compiler is what a caller narrowing on verdict is protected by, not a runtime guard this hook
    is asked to add.
- edge_case: An empty or missing evaluation in an otherwise-200 response
  why: SimulateHypothesisResult's only field is a required evaluation; no criterion states a partial-success
    shape, and there is no runtime collection here to render empty the way a list-returning hook would
    — unlike API-04's concern, this hook resolves to one value or none (null before a dispatch), never
    an empty list.
untested:
- Whether the (not-yet-existing) simulate-hypothesis backend engine actually narrows its own concept collection
  to only the named hypothesis's own revision — scenarios/investigation/a-single-hypothesis-is-simulated's
  actual runtime behavior — is unprovable from a frontend hook test; no live backend exists to dispatch
  against (the task's own Notes), so only the request shape this hook assembles is shown, never the engine's
  own observation.
- Whether the inferred endpoint path (POST /v1/cases/{slug}/versions/{version}/simulate-hypothesis) and
  the inferred snake_case wire field names actually match a real backend's contract once one exists —
  no live route exists to compare against; every test here exercises the hook against its own mocked stand-in
  of that inferred shape.
- rules/investigation/a-simulation-writes-no-investigation's cache clause ('nothing it collects ever enters
  a cache') and its never-read-by-a-diagnosis clause — backend composition facts about how the engine's
  own observation source is built, which no frontend hook test can exercise or violate.
- domain/knowledge/hypothesis-revision's own resolution of a hypothesis name to the case version's current
  revision for that name — the hook sends only the stable name and relies on the addressed version's own
  manifest, server-side, to resolve it; nothing here can prove that resolution happens correctly, since
  no live backend performs it.
---

## What it is

Fifteen tests across two spec files, proving useSimulateHypothesis's request shape (one hypothesis, one subject, nothing else), its typed response shape across both evaluation branches (decided with citations, inconclusive with reason, and the judgment-call-carrying usage/elapsed_ms/prompt fields), the no-cache-invalidation guarantee on both success and failure, failure resolution through the shared uiStateForApiError convention, and pending/re-entrancy gating including the incomplete-dispatch guards.

## Notes

None.
