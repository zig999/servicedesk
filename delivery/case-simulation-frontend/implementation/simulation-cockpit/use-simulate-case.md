---
title: use-simulate-case mutation hook
summary: A new hook, apiFetch + useMutation over POST /v1/simulate, dispatching the simulate-case operation
  for a given case version and subject and exposing its complete typed record -- evidence, evaluations,
  assessment, cost and durations -- without writing to any query or cache.
task: sha256:6e17155f7654c96e349cbc81d6ccf72bed2b67a41f411c9f6cf49f4a8640e004
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-use-simulate-case-build-3
files:
- path: src/hooks/use-simulate-case.ts
  effect: 'New file. Exports useSimulateCase(), a mutation hook that POSTs {case:{slug,version}, subject:{type,attributes},
    requester} to /v1/simulate through apiFetch and returns {result, isSimulating, simulateError, onSimulate}.
    onSimulate is guarded by a ref against a second overlapping dispatch while one is in flight; a dispatch
    failure is resolved to a message through error-ui-state.ts''s uiStateForApiError, never a hand-checked
    error.code. Also exports the full set of typed request/response shapes this hook uses: SimulateCaseRef,
    SimulateSubjectAttributeValue, SimulateSubject, SimulateCaseRequestBody, SimulateEvidenceResult, SimulateVerdict,
    SimulateEvaluationReason, SimulateUsage, SimulateCitation, SimulateCost, SimulateDurations, SimulateEvidenceItem,
    SimulateEvaluation (discriminated union on verdict), SimulateReferral, SimulateConsolidationRegister,
    SimulateAssessment, SimulateCaseResult, SimulateCaseState. The hook holds no useQueryClient and calls
    no invalidateQueries or any second endpoint.'
criteria:
- criterion: Dispatching the hook against a draft version and against a released version both succeed
    structurally the same way — the operation is open to either state, per contracts/investigation/case-simulation.
  met: true
  how: SimulateCaseRef, the only case-identity shape onSimulate's body carries, is exactly {slug, version}
    -- no `state` field exists anywhere in this file, and nothing in useSimulateCase or its mutationFn
    reads, branches on, or refuses based on a version's own state. The dispatch path for a draft-state
    and a released-state case version is the identical call to apiFetch(SIMULATE_CASE_ENDPOINT, ...) with
    no conditional between them, so the two cannot diverge structurally by construction rather than by
    a branch that happens to answer the same way for both.
- criterion: The hook's typed success response carries one evidence item per collected concept (result,
    capability/connector reference, elapsed_ms, observation, result_detail when present).
  met: true
  how: SimulateCaseResult.evidence is a readonly SimulateEvidenceItem[]. Each SimulateEvidenceItem carries
    result (SimulateEvidenceResult), capability ({name, version} -- the reference domain/investigation/evidence.md's
    own relationships section pins) together with origin (the node's own declared string attribute, the
    connector half of the reference), elapsed_ms, observation, and result_detail as an optional field
    present only when the wire response carries it -- plus every other attribute the node declares (concept,
    inputs, observed_at, ttl).
- criterion: The hook's typed success response carries one evaluation per manifested hypothesis (verdict,
    citations when decided, reason when inconclusive, usage/elapsed_ms/prompt when a judgment call happened).
  met: true
  how: 'SimulateCaseResult.evaluations is a readonly SimulateEvaluation[]. SimulateEvaluation is a discriminated
    union on `verdict`: the confirmed/refuted branch carries citations and no reason; the inconclusive
    branch carries reason and citations (possibly empty). Both branches carry usage, elapsed_ms and prompt
    as optional fields, matching the node''s own "present exactly when a call happened, absent when reason
    no-data means judgment was never called at all".'
- criterion: The hook's typed success response carries the resolved assessment (outcome, referral, determining
    hypothesis when one confirmed, text, register, usage, elapsed_ms, prompt), the total cost, and the
    per-stage durations, matching domain/investigation/assessment, domain/investigation/cost and domain/investigation/durations.
  met: true
  how: 'SimulateCaseResult.assessment is a SimulateAssessment: outcome, referral ({action, recipient}),
    determining_hypothesis (optional), text, register (SimulateConsolidationRegister, required), usage
    (SimulateUsage, required), elapsed_ms (required) and prompt (required) -- all four of the last quartet
    required rather than optional, per domain/investigation/assessment as it now stands ("a consolidation
    call never has a no-data reason to have skipped running, so neither is ever absent"), read fresh rather
    than from the sibling backend''s own still-mid-migration assessment.ts (this file''s own header comment).
    SimulateCaseResult.cost is a SimulateCost {calls, input_tokens, output_tokens}; SimulateCaseResult.durations
    is a SimulateDurations {collection, judgment, writing?, total}, writing optional matching the node''s
    own "present exactly when a consolidation call happened".'
- criterion: Nothing the hook does writes to, or invalidates, any query or endpoint that persists an investigation
    — the dispatch's only observable effect is the mutation's own in-memory result, satisfying rules/investigation/a-simulation-writes-no-investigation.
  met: true
  how: useSimulateCase holds exactly one useMutation and no useQueryClient, no useQuery, no invalidateQueries
    call, and no second apiFetch call to any other endpoint. The only state this hook exposes back is
    mutation.data (as `result`), mutation.isPending (as `isSimulating`) and a local simulateError string
    -- nothing is written to react-query's shared cache under any key another screen's read could observe.
- criterion: A dispatch failure resolves to a UI state through uiStateForApiError rather than a hand-checked
    error code at the call site, and an operation failure (network, 5xx) is never confused with a returned
    verdict.
  met: true
  how: onSimulate's mutation.mutate onError callback calls simulateCaseFailureMessage(error), which for
    an ApiError resolves uiStateForApiError(error) and looks its kind up in SIMULATE_CASE_FAILURE_MESSAGE_BY_KIND
    (empty, since no criterion names a distinct wording -- same convention as use-test-connector-panel.ts's
    own TEST_DISPATCH_FAILURE_MESSAGE_BY_KIND), falling back to one generic message; no error.code is
    read or switched on directly. simulateError (dispatch failure) and result (a successful response's
    own typed evaluation.verdict values) are two structurally separate fields fed by two separate callbacks
    (onError vs. mutation.data), so a network/5xx failure can never populate `result`, and a returned
    "inconclusive"/"refuted" verdict can never populate `simulateError`.
- criterion: The hook exposes a pending status so a caller can gate a second dispatch while one is already
    in flight.
  met: true
  how: SimulateCaseState.isSimulating is mutation.isPending, exposed for a caller to read and disable
    its own trigger. onSimulate additionally guards itself with isDispatchingRef, the same ref-guard pattern
    use-test-connector-panel.ts's own onTest uses, so an overlapping call arriving before a re-render
    has committed the pending state is dropped rather than dispatched twice.
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: The hook dispatches POST /v1/simulate (the simulate-case operation) over a case identity carrying
    no state, matching "open to a case version in either state"; the response type carries evidence, evaluations,
    the resolved assessment, cost and durations, matching "returns the whole record back"; the request
    body carries no narrative and no ticket_ref field, matching "Neither operation carries a narrative
    or a ticket reference".
- node: rules/investigation/a-simulation-writes-no-investigation
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: 'This task''s own REMAINDER note places the cache and never-read-by-a-diagnosis clauses outside
    this task''s reach (they belong to the sibling backend''s no-cache-simulation-composition task). The
    clause this task does reach -- "writes no investigation" -- is honored by the hook holding no useQueryClient,
    no invalidateQueries and no second endpoint call: nothing it does persists or touches an investigation
    record or any cache key another screen''s read depends on.'
- node: scenarios/investigation/a-draft-case-version-is-simulated
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: '"the engine collects, judges, resolves and drafts the assessment" is answered by dispatching the
    one simulate-case call and exposing its whole SimulateCaseResult unmodified; "the response carries
    every evaluation with its verdict and citations, every evidence item with its result, the cost and
    the durations" is exactly what SimulateCaseResult''s fields carry; "no investigation is written" is
    honored the same way as the rule above. The scenario''s own "given a case version exists in draft
    state" is satisfied structurally by this hook never distinguishing draft from any other state (criterion
    1).'
- node: domain/investigation/evidence
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateEvidenceItem declares every one of the node's own attributes (concept, inputs, observation,
    observed_at, ttl, origin, result, result_detail?, elapsed_ms) plus the capability relationship as
    {name, version}.
- node: domain/investigation/evaluation
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateEvaluation is a discriminated union over verdict carrying hypothesis, citations, reason
    (inconclusive only) and the optional usage/elapsed_ms/prompt call-record fields, matching the node's
    own attributes and its own "confirmed and refuted each carry at least one citation ... inconclusive
    carries a reason" description.
- node: domain/investigation/usage
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateUsage declares input_tokens and output_tokens, both required, exactly the node's two attributes.
- node: domain/investigation/cost
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateCost declares calls, input_tokens and output_tokens, all required, exactly the node's three
    attributes.
- node: domain/investigation/durations
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateDurations declares collection, judgment and total as required and writing as optional,
    matching the node's own "writing is present exactly when a consolidation call happened".
- node: domain/investigation/citation
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateCitation declares concept and field, both required, exactly the node's two attributes.
- node: domain/investigation/verdict
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateVerdict is the closed union "confirmed" | "refuted" | "inconclusive", exactly the node's
    three values.
- node: domain/investigation/evidence-result
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateEvidenceResult is the closed union "ok" | "unavailable" | "denied" | "timeout", exactly
    the node's four values.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateEvaluationReason is the closed union "no-data" | "judgment-failure" | "deadline-exceeded",
    exactly the node's three values.
- node: domain/investigation/assessment
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateAssessment declares outcome, referral, determining_hypothesis?, text, register, usage,
    elapsed_ms and prompt -- register/usage/elapsed_ms/prompt all required, matching this task's own Notes
    that the node's shape widened to include them after the task was first bound, and read fresh from
    the node itself rather than from the sibling backend's own current, still-narrower assessment.ts.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateCaseRef carries the version's own pinned identity (slug, version) that identifies which
    case version the operation runs against -- the version's other declared attributes (title, when_to_use,
    manifest, etc.) are not part of the simulate-case request and are out of this hook's own reach.
- node: domain/knowledge/case-version-state
  how: 'Honored by omission, deliberately: no field of SimulateCaseRef or any other type this hook declares
    names or carries a case-version-state value at all, and nothing in useSimulateCase''s own dispatch
    path reads one. This is how criterion 1''s "open to either state" is made structural rather than a
    branch that happens to answer the same way for draft and released -- the node''s own two values are
    simply never consulted.'
- node: domain/knowledge/referral
  encoded_at:
  - src/hooks/use-simulate-case.ts
  how: SimulateReferral declares action and recipient, both required, exactly the node's two attributes.
inferences:
- inferred: 'The POST /v1/simulate request body''s own wire shape is {case: {slug, version}, subject:
    {type, attributes}, requester} -- requester included and required, though no node this task implements
    names the simulate-case request body''s own shape.'
  from: src/src/http/dto/diagnose.dto.ts's own established caseRefSchema/subjectSchema convention for
    this same engine family, minus the narrative/ticket_ref fields contracts/investigation/case-simulation
    explicitly states neither operation carries; requester itself is drawn from domain/investigation/investigation.md's
    own "requester is always given" and from use-test-connector-panel.ts's own established requester field
    on the same kind of dispatch, since the collection stage this operation runs resolves `${requester}`
    placeholders the same way test-connector's own dispatch already needs one for.
- inferred: The success response's top-level envelope field names are evidence, evaluations, assessment,
    cost, durations.
  from: domain/investigation/investigation.md's own attribute names for this exact record -- no node this
    task implements states a distinct envelope shape of its own for the simulate-case response, and this
    is the closest domain-stated vocabulary for it.
- inferred: Evidence's capability reference is carried as {name, version} rather than the whole registered
    capability.
  from: domain/integration/capability.md's own two identifying attributes (name, version), and this app's
    own established convention of pinning a reference by identity rather than embedding it whole (diagnose.dto.ts's
    own caseRefSchema pinning a case the same way).
- inferred: SimulateSubjectAttributeValue is declared locally in this file rather than importing use-test-connector-panel.ts's
    own exported SubjectAttributeValue, despite the two being structurally identical.
  from: src/src/http/dto/diagnose.dto.ts's own independently-declared subjectAttributeValueSchema, kept
    separate from test-connector.dto.ts's own -- the established backend-side convention for this exact
    wire shape within this same engine family, followed here rather than introducing a cross-feature import
    between two otherwise unrelated screens' own dispatch hooks.
- inferred: This hook exposes no computed canX/"can simulate" boolean, unlike use-test-connector-panel.ts's
    own canTest -- only isDispatchingRef's internal overlap guard and the exposed isSimulating pending
    flag.
  from: 'The task''s own objective ("for a given case version and subject") and this epic''s own inventory:
    subject completeness and requester readiness are derived by a separate hook (task/subject-derivation/use-simulation-subject-hook),
    not owned by this one, so this hook has no local form state of its own to gate a dispatch button against.'
---

## What it is

The case-level counterpart of `use-test-connector-panel.ts`'s own dispatch convention, answering `simulate-case`: a new mutation hook, `src/hooks/use-simulate-case.ts`, that POSTs a pinned case version and an assembled subject to `/v1/simulate` and exposes the operation's whole typed record back.

## Notes

The build required two environment fixes this worktree did not carry over from the main tree: initializing the frontend/tui git submodule (git worktree checkouts do not clone submodules automatically) and running npm ci inside frontend/tui/frontend for its own vendored dependencies (react, class-variance-authority, lucide-react, the Radix packages) that its source files import and frontend/app's tsconfig paths resolve straight into. Neither fix touched any file this record's files list names; both fixes are recorded rather than worked around, exactly as the same fix was recorded on delivery/frontend-bootstrap's own seed-new-draft-from-latest-released implementation record for this same project.
No dependency was added to package.json: every import this file uses (react, @tanstack/react-query, and this app's own api-client.ts/error-ui-state.ts) was already authorized and already installed.
