---
title: Proof for fix-use-simulate-hypothesis-dispatch
summary: Proves the corrected POST /v1/simulate/hypothesis dispatch (route, body shape, requester forwarding,
  response envelope, and the cockpit's own call-site forwarding), and repairs the six pre-existing test/fixture
  files that modeled the defective dispatch this task replaces.
implementation: sha256:7031cabb9fac5e6aac7b8294625598d805d84fc6c736fa4a713f1bb2c70986f2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulate-hypothesis-endpoint-hotfix-fix-use-simulate-hypothesis-dispatch-suite
tests:
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: 'sends exactly {case: {slug, version}, subject, requester, hypothesis} in the POST body, naming
    the one hypothesis passed to onSimulate'
  proves: 'The dispatched request body is exactly { case: { slug, version }, subject, requester, hypothesis
    }, matching simulateHypothesisRequestSchema''s required fields -- never the case-and-requester-less
    body the hook sent before.'
  fails_when: 'onSimulate dispatches any body other than exactly {case: {slug, version}, subject, requester,
    hypothesis} for the arguments given'
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: issues its POST to exactly /v1/simulate/hypothesis, never a nested /v1/cases/{slug}/versions/{version}/simulate-hypothesis
    path
  proves: The hook's mutation dispatches POST to /v1/simulate/hypothesis, never to /v1/cases/{slug}/versions/{version}/simulate-hypothesis.
  fails_when: the hook dispatches to any URL other than the literal "/v1/simulate/hypothesis", including
    a reversion to the old nested per-case-version path
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries the exact requester value onSimulate received, with no default and no transformation
  proves: onSimulate accepts a requester argument and forwards it unchanged into the dispatched body,
    the same way useSimulateCase's onSimulate already receives one from its caller.
  fails_when: the dispatched body's requester field is absent, defaulted, or differs from the exact string
    passed to onSimulate
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: resolves a single evaluation object -- never an array -- carrying the hypothesis name onSimulate
    was called with
  proves: A dispatch against the live backend route for a case version whose manifest holds the named
    hypothesis returns exactly one evaluation for that hypothesis.
  fails_when: the returned evaluation is an array, or its hypothesis field does not match the name onSimulate
    was called with
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: returns exactly the evidence/evaluation/durations envelope the mocked response carried, with no
    other key present at runtime
  proves: The hook's typed success response models the route's own response shape -- evidence, evaluation,
    durations -- while still exposing no outcome and no assessment field.
  fails_when: the hook's returned result diverges from the response it was sent (dropping, renaming or
    adding fields)
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries evidence's own capability reference as two flat fields, capability_name and capability_version,
    never nested under a capability object (a recorded inference)
  proves: the implementation's recorded inference that Evidence's capability reference travels as two
    flat fields rather than a nested capability object
  fails_when: the returned evidence item nests a capability object instead of carrying capability_name/capability_version
    as flat fields
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries exactly evidence, evaluation and durations at runtime, never an outcome or an assessment
    key
  proves: The hook's typed success response models the route's own response shape -- evidence, evaluation,
    durations -- while still exposing no outcome and no assessment field.
  fails_when: the result object's own key set is anything other than exactly durations, evaluation, evidence
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries a citations array and no reason on a decided (confirmed/refuted) evaluation, matching
    domain/investigation/evaluation's own decided branch
  proves: the Evaluation type's decided branch still carries citations and no reason, unchanged by this
    fix
  fails_when: a confirmed/refuted evaluation is returned without citations, or with a reason field
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: passes usage, elapsed_ms and prompt through unchanged when the response carries them, naming the
    judgment call that actually happened
  proves: judgment-call fields (usage/elapsed_ms/prompt) still pass through unchanged on the decided branch
  fails_when: usage, elapsed_ms or prompt are dropped or altered by the hook when the response carried
    them
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries a reason and a (possibly empty) citations array on an inconclusive evaluation, matching
    the route's own delivered evaluationSchema
  proves: the implementation's recorded inference that an inconclusive evaluation's citations field is
    present (a possibly-empty array) rather than absent
  fails_when: an inconclusive evaluation is returned with no citations key at all
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: type-checks that SimulateHypothesisResult can never carry an outcome or assessment field, and
    that only `reason` stays exclusive to Evaluation's inconclusive branch
  proves: SimulateHypothesisResult never gains an outcome/assessment field, and requester is a required
    (never optional) third onSimulate argument
  fails_when: SimulateHypothesisResult gains an outcome or assessment field, Evaluation's confirmed/refuted
    branch gains a reason field, or onSimulate's requester parameter becomes optional (each checked by
    tsc via @ts-expect-error)
- file: src/hooks/use-simulate-hypothesis-dispatch-safety.spec.ts
  name: existing dispatch-safety assertions, updated to the corrected three-argument onSimulate call sites
  proves: criteria 4-6 of the original use-simulate-hypothesis task (no query invalidation, uiStateForApiError-mapped
    failures, isSimulating gating) continue to hold against the corrected three-argument onSimulate
  fails_when: any of these pre-existing guarantees regresses under the corrected signature
- file: src/hooks/use-case-simulation-cockpit-hypothesis-requester.spec.ts
  name: dispatches the hypothesis-level request carrying the identical requester value the case-level
    dispatch already carried
  proves: use-case-simulation-cockpit.ts's onSimulateHypothesis call site passes subjectState.requester
    through to hypSim.onSimulate, the same value it already passes to caseSim.onSimulate.
  fails_when: the hypothesis-level dispatch's own requester field differs from, or is absent compared
    to, the case-level dispatch's own requester field
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: normalizes an inconclusive hypothesis-level evaluation to an empty citations array, discarding
    whatever the response itself carried for that branch
  proves: fromHypothesisEvaluation still discards an inconclusive branch's own citations, now proven against
    a fixture that actually carries a non-empty citations array (the corrected contract's own shape) rather
    than one omitting the field entirely
  fails_when: fromHypothesisEvaluation passes an inconclusive evaluation's citations through instead of
    normalizing to []
not_applicable:
- edge_case: concurrent dispatch of a case-level and a hypothesis-level simulation at once
  why: canSimulateNow (use-case-simulation-cockpit.ts) already gates both dispatch hooks behind one shared
    flag, proven by task/simulation-cockpit/screen-assembly's own delivered tests; this task's own criteria
    name no new gating behavior, so re-proving it here would duplicate that task's own proof rather than
    this one's
- edge_case: the backend actually refusing a hypothesis absent from the manifest (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused)
  why: this task's own criteria describe the frontend's successful-dispatch shape only; the refusal is
    the backend's own delivered behavior (task/case-simulation-pipeline/simulate-hypothesis-operation),
    and the frontend's only contract with any failure is the existing, unchanged uiStateForApiError mapping
    already proven by use-simulate-hypothesis-dispatch-safety.spec.ts
untested:
- An actual live HTTP round trip against the running backend server (src/src/http/simulate-hypothesis.routes.ts)
  is not exercised by this frontend suite -- every test here mocks apiFetch at the module boundary, the
  same convention every sibling hook in this codebase already follows; the wire contract is instead held
  to the backend's own delivered DTO (simulateHypothesisRequestSchema/simulateHypothesisResponseSchema),
  read fresh by the implementation.
---

## What it is

Proves task/simulate-hypothesis-endpoint-hotfix/fix-use-simulate-hypothesis-dispatch: every
criterion of the corrected dispatch, and the six pre-existing test/fixture files this fix's own
contract change required bringing current.

## Notes

Earlier suite-adjacent attempts were build runs, not suite runs, and none reached the test step:
run/.../build failed on an uninitialized git submodule (environment); run/.../build-2 failed on
that submodule's own missing node_modules (environment); run/.../build-3 failed purely on six
pre-existing test/fixture files this proof repairs below, with zero errors in the implementation's
own two files -- see the implementation record's own Notes for the full account. The first attempt
that reached the test step (run/.../suite, this proof's own pin) passed clean on every step.
This proof updates six pre-existing files the implementation record does not list
(use-case-simulation-cockpit.test-support.ts, use-simulate-hypothesis.test-support.ts,
case-simulation-ready-view.test-support.ts, case-simulation-cockpit-adapters.spec.ts,
use-simulate-hypothesis-dispatch-safety.spec.ts, use-simulate-hypothesis-request.spec.ts), written
by the closed case-simulation-frontend initiative to model the exact defective dispatch (nested
URL, two-argument onSimulate, {evaluation}-only response) this task's own criteria replace -- not
a sibling task's valid guarantee this delivery's legitimate files falsified, but the prior test
surface of the bug itself. Left unrepaired, the target root would never typecheck again. One new
file was added, use-case-simulation-cockpit-hypothesis-requester.spec.ts.
