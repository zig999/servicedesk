---
title: use-simulate-hypothesis hook
summary: A new mutation hook dispatches the simulate-hypothesis operation of contracts/investigation/case-simulation
  for one named hypothesis of a case version and a subject, exposing exactly one typed evaluation and
  resolving no outcome or assessment.
task: sha256:92f716cb011b2e77398325c52453cf16cc9da32af065af639791cafde56b26b8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-use-simulate-hypothesis-build-3
files:
- path: src/hooks/use-simulate-hypothesis.ts
  effect: New file. Exports useSimulateHypothesis(slug, version), a useMutation-backed dispatch hook for
    POST /v1/cases/{slug}/versions/{version}/simulate-hypothesis. Exposes isSimulating (mutation.isPending),
    result (SimulateHypothesisResult | null carrying exactly one Evaluation, no outcome/assessment fields),
    simulationError (resolved through uiStateForApiError), and onSimulate(hypothesisName, subject) which
    re-entrancy-gates a second dispatch through an isDispatchingRef, mirroring use-test-connector-panel.ts's
    own onTest gate. Exports the supporting types SimulateHypothesisSubjectAttribute, SimulateHypothesisSubject,
    Usage, Citation, EvaluationReason, Verdict, Evaluation (a TYP-04 discriminated union on verdict) and
    SimulateHypothesisResult. Imports nothing from @tanstack/react-query beyond useMutation -- no useQueryClient,
    no invalidateQueries anywhere in the file.
criteria:
- criterion: For a version whose manifest holds more than one hypothesis, dispatching the hook against
    one named hypothesis observes only the concepts that hypothesis's own revision collects — never the
    collection plan's full union — per scenarios/investigation/a-single-hypothesis-is-simulated.
  met: true
  how: 'Demonstrated structurally, not against a live backend, per the task''s own Notes ("the sibling
    backend initiative has not delivered this route yet"): the request body onSimulate assembles carries
    exactly one field naming a hypothesis (`hypothesis: hypothesisName`) and one assembled subject --
    never a manifest, a full hypothesis list, or a collection plan. There is no client-side representation
    of the case version''s full manifest or its collection-plan union anywhere in this file for the hook
    to leak into the request; the request shape itself is the one-hypothesis shape the operation''s own
    contract narrows against (contracts/investigation/case-simulation: "simulate-hypothesis narrows the
    same run to what one named hypothesis revision collects and judges, alone"). Which concepts that hypothesis''s
    revision actually collects, and that the engine observes only those, is backend/engine behavior this
    hook has nothing to call and cannot execute or prove -- left untested, disclosed below.'
- criterion: The hook's typed success response carries exactly one evaluation, shaped as domain/investigation/evaluation
    (verdict, citations when decided, reason when inconclusive, usage/elapsed_ms/prompt when a judgment
    call happened).
  met: true
  how: 'SimulateHypothesisResult carries exactly one field, `evaluation: Evaluation`. Evaluation is a
    discriminated union on `verdict`: the confirmed/refuted branch requires `citations` and forbids `reason`;
    the inconclusive branch requires `reason` and carries no citations requirement; both branches carry
    `usage`, `elapsed_ms` and `prompt` as optional fields, matching evaluation.md''s own "present exactly
    when a call happened, absent when reason no-data means judgment was never called at all".'
- criterion: The hook's typed success response carries no outcome and no assessment field.
  met: true
  how: SimulateHypothesisResult's only property is `evaluation`; no `outcome` or `assessment` field is
    declared anywhere on the type, in contrast to what use-simulate-case's own broader response type would
    carry.
- criterion: Nothing the hook does writes to, or invalidates, any query or endpoint that persists an investigation,
    satisfying rules/investigation/a-simulation-writes-no-investigation.
  met: true
  how: The file imports no useQueryClient and calls no invalidateQueries. The only network call the hook
    ever issues is the one apiFetch POST to /v1/cases/{slug}/versions/{version}/simulate-hypothesis, the
    simulation operation itself -- never a route this app uses to persist or read an investigation. The
    mutation's only observable effect is its own in-memory result (mutation.data), read back as `result`.
- criterion: A dispatch failure resolves to a UI state through uiStateForApiError, the same convention
    use-simulate-case follows.
  met: true
  how: simulateHypothesisDispatchFailureMessage(error) checks `error instanceof ApiError`, resolves it
    through uiStateForApiError(error), and looks its `kind` up in SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE_BY_KIND
    (empty today, since no criterion states a distinct wording -- mirrors use-test-connector-panel.ts's
    own empty table and its stated rationale), falling back to one generic message otherwise. `simulationError`
    is derived from `mutation.error` through this function rather than any hand-checked `error.code` at
    a call site.
- criterion: The hook exposes a pending status so a caller can gate a second dispatch while one is already
    in flight.
  met: true
  how: '`isSimulating` is `mutation.isPending`, exposed on the returned state exactly as `isTesting` is
    in use-test-connector-panel.ts. A second dispatch is also actually refused, not just observable as
    pending: onSimulate checks `isDispatchingRef.current` before calling `mutation.mutate`, sets it to
    true before dispatching, and clears it in `onSettled` -- the same isDispatchingRef re-entrancy gate
    onTest uses.'
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: The hook dispatches exactly the simulate-hypothesis operation this contract declares, scoped to
    one case version and narrowed to one named hypothesis, resolving no outcome -- encoded as the request
    shape (hypothesis name + subject only) and the response shape (SimulateHypothesisResult carrying only
    `evaluation`).
- node: domain/investigation/evaluation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: 'Encoded as the Evaluation discriminated union: hypothesis (required string), verdict (required),
    citations (required when decided), reason (required when inconclusive), usage/elapsed_ms/prompt (optional,
    present when a judgment call happened).'
- node: domain/investigation/verdict
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: Encoded as the Verdict type ("confirmed" | "refuted" | "inconclusive") and as Evaluation's own
    discriminant.
- node: domain/investigation/citation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: 'Encoded as the Citation type ({ concept: string; field: string }), attached to the decided branch
    of Evaluation.'
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: Encoded as the EvaluationReason type ("no-data" | "judgment-failure" | "deadline-exceeded"), attached
    to the inconclusive branch of Evaluation.
- node: domain/investigation/usage
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: 'Encoded as the Usage type ({ input_tokens: number; output_tokens: number }), optional on both
    Evaluation branches.'
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: The hook is scoped by (slug, version) -- the case version's own identity -- addressed through the
    URL path this app's other case-version actions already use; the hook does not itself read or represent
    the version's other declared attributes (title, subject, manifest, state, etc.), since dispatching
    simulate-hypothesis needs only that identity plus a named hypothesis and a subject.
- node: domain/knowledge/hypothesis-revision
  how: 'Constrains rather than is encoded as its own type: the hook addresses one named hypothesis revision
    by the hypothesis''s own stable name alone, relying on the addressed case version''s own manifest
    to resolve which revision that name currently maps to -- the hook carries no revision number of its
    own.'
- node: rules/investigation/a-simulation-writes-no-investigation
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  how: 'Honored rather than encoded as a domain fact: the file imports no useQueryClient, calls no invalidateQueries,
    and dispatches to no route this app uses to persist an investigation. The rule''s cache and never-read-by-a-diagnosis
    clauses are backend composition facts this frontend hook cannot reach or honor directly -- the same
    reading the sibling use-simulate-case task''s own Notes already gave that remainder, deferred to work/case-simulation-backend''s
    case-simulation-pipeline epic.'
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  how: 'The delivery could not reach this scenario''s actual runtime behavior -- no live simulate-hypothesis
    backend exists yet to run it against (task''s own Notes). What the hook itself controls is answered
    structurally under criterion 1 above: the request it assembles names exactly one hypothesis and carries
    no full-manifest or collection-plan shape, so the request itself cannot ask the (not-yet-existing)
    engine for more than that hypothesis''s own judgment. Whether the engine actually narrows collection
    to only that revision''s own concepts is untested and unprovable from this side of the contract.'
inferences:
- inferred: The endpoint is POST /v1/cases/{slug}/versions/{version}/simulate-hypothesis, with the case
    version addressed by the path and only { hypothesis, subject } in the body.
  from: This app's own existing action-on-a-case-version convention -- POST /v1/cases/{slug}/versions/{version}/release
    (use-edit-draft-version-form.ts) and PUT/DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName}
    (use-manifest-builder.ts), both addressing the version through the path and the action through one
    trailing kebab-case segment; the sibling use-simulate-case task's own text (work/case-simulation-frontend/task/simulation-cockpit/use-simulate-case.md),
    which names no route of its own either -- read to confirm no live route exists to consult instead;
    and the contract's own operation name `simulate-hypothesis` (contracts/investigation/case-simulation),
    already kebab-case, used verbatim as the trailing segment.
- inferred: The request and response wire field names mirror the specification's own attribute names verbatim
    and in snake_case (hypothesis, verdict, reason, citations, usage, elapsed_ms, prompt, input_tokens,
    output_tokens), rather than a camelCase convention.
  from: No live backend exists to observe an actual wire casing from (task's own Notes); the specification's
    own attribute names (domain/investigation/evaluation.md, domain/investigation/usage.md) are the only
    authoritative naming available, and this app's other case/hypothesis wire types already use snake_case
    for backend-facing fields (e.g. HypothesisRevisionListItem's `hypothesis_name`, `collects` in use-hypothesis-revision-form.ts).
- inferred: Citation.concept is modeled as a plain string (the concept's own glossary name), not a richer
    reference object.
  from: 'domain/investigation/citation.md declares `concept` as a domain/glossary/concept reference, and
    this app''s existing precedent for carrying a concept reference on the wire is already a plain string
    (use-hypothesis-revision-form.ts''s own `collects: readonly string[]`, HypothesisRevisionListItem).'
- inferred: 'The subject shape sent in the request body is { type: string; attributes: readonly { attribute:
    string; value: string }[] }, reusing the same two-field shape use-test-connector-panel.ts''s own TestConnectorRequestBody[''subject'']
    already sends.'
  from: domain/investigation/subject.md (type + attribute-values) and domain/investigation/subject-attribute-value.md
    (attribute + value), and use-test-connector-panel.ts's own established precedent for assembling exactly
    this shape as a one-shot dispatch's subject, per the inventory's own convention statement about that
    file.
divergences:
- from: 'case-simulation-frontend-area inventory convention: "A one-shot dispatch (not a persisted resource)
    holds its subject as plain component state, not react-hook-form, and dispatches through useMutation(...),
    gated by a computed canX boolean" (seen_at use-test-connector-panel.ts).'
  departure: useSimulateHypothesis does not own or expose a persisted subject/hypothesis form state or
    a public canX boolean; the hypothesis name and subject are received as onSimulate's own dispatch arguments,
    and dispatch is gated internally (an unexposed canSimulate check plus the isDispatchingRef re-entrancy
    guard) rather than through an externally readable boolean a caller could disable a button with.
  why: This task names no screen, no reference layout and no hypothesis-picker or subject-attribute form
    for this hook to own -- unlike use-test-connector-panel.ts, which is the Test section of an existing
    screen with named fields (capability, subject type, attribute rows, requester). Inventing that owned
    form state here would be scope this task does not ask for. The convention's substance -- refusing
    a second concurrent dispatch while one is in flight -- is preserved through isDispatchingRef exactly
    as onTest already does; only the externally-exposed canX boolean is not replicated, because there
    is no owned form value left for it to describe from outside the call.
preserved:
- No existing file was modified -- this is a new, standalone hook with no consumers yet, so nothing already
  relies on it.
- error-ui-state.ts's existing UI_STATE_BY_ERROR_CODE table and its existing consumers (use-test-connector-panel.ts,
  use-connector-configuration-detail.ts, use-edit-draft-version-form.ts) are untouched; this hook reads
  uiStateForApiError without adding, removing or renaming any entry.
deferred:
- what: The screen/ready-view/hooks triad that would actually call useSimulateHypothesis (a hypothesis-picker
    UI, a subject-attribute form, and result rendering) -- no such screen exists in this tree yet.
  why: Outside this task's own objective, which is the hook alone; the inventory names case-detail-screen.tsx
    and case-version-editor-screen.tsx as the eventual entry points for a future "Simulate" surface, but
    no task in this delivery builds that surface.
- what: rules/investigation/a-simulation-writes-no-investigation's cache clause ("nothing it collects
    ever enters a cache") and its never-read-by-a-diagnosis clause.
  why: Backend composition facts about how the engine's observation source is built for a simulation --
    not something a frontend dispatch hook can honor or violate. Same reading the sibling use-simulate-case
    task's own Notes already gave this remainder, naming work/case-simulation-backend's case-simulation-pipeline
    epic and its no-cache-simulation-composition task as the place that guarantee belongs.
---

## What it is

The hypothesis-level mutation hook answering `simulate-hypothesis` (contracts/investigation/case-simulation), the direct sibling of `use-test-connector-panel.ts`'s own dispatch convention.
No live backend route exists yet (the sibling backend initiative has not delivered it): the request shape and endpoint path are this delivery's own disclosed inference, not a read of a live contract.
The response type (`SimulateHypothesisResult`) is deliberately narrower than what `use-simulate-case`'s own response carries -- exactly one `evaluation`, never an `outcome` or an `assessment` -- the direct type-level proof of scenarios/investigation/a-single-hypothesis-is-simulated's own "no outcome and no assessment are resolved".

## Notes

Setup required initializing the `frontend/tui` git submodule (uninitialized in this worktree -- `git submodule update --init frontend/tui`) and running `npm ci` inside `frontend/tui/frontend` (its own separate package, with its own lockfile, never installed in this worktree): both are pre-existing environment gaps this delivery's own file did not create, and neither touches `frontend/app`, the delivery root, or the work root. Without them, `tsc` cannot resolve `@tui/ui/*`'s own transitive imports (`react`, `@radix-ui/*`, `lucide-react`, `class-variance-authority`) for every file in this app that already composes the TUI catalog -- not only this task's own new file -- so the first build attempt (`run/simulation-cockpit-use-simulate-hypothesis-build`) failed at `typecheck` across dozens of pre-existing files this task never touched, and the second (`-build-2`) still failed the same way after only the submodule was checked out. `-build-3`, after both were resolved, passed clean.
Criterion 1 and the encoding of scenarios/investigation/a-single-hypothesis-is-simulated are answered structurally rather than by running the scenario: no live `simulate-hypothesis` backend exists (task's own Notes), so what this delivery can show is that the request this hook assembles carries exactly one hypothesis name and a subject, never a manifest or a collection-plan union -- the hook cannot itself ask the engine for more than one hypothesis's own judgment, but that the engine actually narrows its own collection to that hypothesis's own revision is backend behavior outside what a frontend hook can execute or prove.
