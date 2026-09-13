---
target: frontend
title: Stale-draft marking for the Configuration Helper's stated draft
summary: A stated draft now carries what it was generated for (link, operation, connector) via the
  request hook's own variables, and the Helper surface computes and shows staleness reactively without
  touching the Apply act.
task: sha256:73e09a7e279f1fd28749b83f67045523c0373a550fd12c061f49c89bf9ef0e1c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-stale-draft-marking-build-2
files:
- path: src/hooks/use-draft-connector-configuration-from-openapi.ts
  effect: Adds an exported ConnectorConfigurationDraftStatedFor type (an alias of the existing internal
    request-body shape { link, path, method, connector }) and a new statedFor field on
    UseDraftConnectorConfigurationFromOpenApiResult, sourced directly from TanStack Query's own
    mutation.variables. DraftConnectorConfigurationRequestOutcome, its "drafted" variant and
    ConnectorConfigurationDraft itself are unchanged -- statedFor is a sibling of outcome, not a field of
    the draft or of the outcome's drafted case.
- path: src/hooks/use-connector-configuration-helper.ts
  effect: 'Adds a private draftIsStale(outcome, statedFor, current) comparison and a new optional
    `stale?: boolean` field on ConnectorConfigurationHelperState, computed on every call from the
    surface''s current link/path/method/connector against the statedFor the draft hook now exposes.
    stale is false whenever no draft currently stands or no statedFor is available yet. Made optional
    (rather than required) so pre-existing spec fixtures that construct this state type without a
    stale field keep compiling, matching the existing convention already used for the connector field.'
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Passes state.stale ?? false into ConnectorConfigurationDraftDisclosure, which renders a
    plain-English staleness statement beside the drafted configuration's header when stale is true. The
    Apply button's rendering, its onClick, and every other section are untouched.
criteria:
- criterion: A stated draft is marked with the link of the request that produced it.
  met: true
  how: statedFor.link on the hook's result holds the link from the exact mutate() call whose success
    produced the currently drafted outcome (TanStack Query's mutation.variables).
- criterion: A stated draft is marked with the operation of the request that produced it.
  met: true
  how: statedFor.path and statedFor.method hold the chosen operation's path and method from that same
    request.
- criterion: A stated draft is marked with the connector name of the request that produced it.
  met: true
  how: statedFor.connector holds the connector name the request body was built with at dispatch time.
- criterion: From the moment the surface's link differs from the one the draft was generated for, the
    draft is stated as stale.
  met: true
  how: draftIsStale compares statedFor.link against the surface's current link state on every render;
    any link edit recomputes stale immediately, with no new request involved.
- criterion: From the moment the surface's chosen operation differs from the one the draft was
    generated for, the draft is stated as stale.
  met: true
  how: Same comparison over statedFor.path/statedFor.method against the surface's current path/method
    state, which onChooseOperation updates the instant a different operation is picked.
- criterion: From the moment the surface's connector name differs from the one the draft was generated
    for, the draft is stated as stale.
  met: true
  how: Same comparison over statedFor.connector against the connector parameter
    useConnectorConfigurationHelper receives on every call.
- criterion: A draft stated as stale is not discarded and nothing here withholds the act applying it.
  met: true
  how: ConnectorConfigurationDraftDisclosure's Apply Button keeps the same unconditional
    onClick={() => onApply(draft.configuration)} regardless of stale; the staleness message is rendered
    as an additional sibling paragraph, never replacing the drafted text, the button, or gating either.
nodes:
- node: domain/integration/connector-configuration-draft
  how: The element's own declared attributes are unchanged by this task; no link or operation field was
    added to ConnectorConfigurationDraft or to pickConnectorConfigurationDraftFields, per the task's own
    UNDERDETERMINED note.
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  encoded_at:
  - src/hooks/use-connector-configuration-helper.ts
  how: Only the clause this task's own Notes say it rests on -- that the draft request names the chosen
    pair's own path and its own method -- is what the staleness comparison reads.
- node: rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  - src/hooks/use-connector-configuration-helper.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Implemented in full -- the stated draft is marked with the link, operation and connector name of
    the request that produced it; it is stated as stale the moment any of the three differs from the
    surface's current values; and the act applying it stays offered unconditionally.
inferences:
- inferred: The mark is held on a new sibling field statedFor of the draft hook's own result object,
    rather than inside the "drafted" variant of DraftConnectorConfigurationRequestOutcome.
  from: Widening the "drafted" outcome variant would have broken existing literal outcome values built
    by other already-delivered tasks' tests; exposing statedFor as an independent field, read directly
    from mutation.variables, leaves outcome's shape exactly as every other delivered task left it.
- inferred: 'The stale field is optional (stale?: boolean) on ConnectorConfigurationHelperState.'
  from: Several pre-existing spec files construct this exported type as an object literal without a
    stale field; a required field would have broken their compilation. Matches the existing convention
    already used for the connector field.
- inferred: The staleness message's exact wording.
  from: The task's own text explicitly leaves the wording to the implementer; phrased to name the same
    three things (link, operation, connector name) the governing rule's statement names.
- inferred: The staleness message is placed inside ConnectorConfigurationDraftDisclosure, beside the
    "Drafted configuration" header, rather than as a sibling element in the parent component.
  from: The governing rule's Description states this task's mark must sit beside the same stated draft
    that rule governs, on the same surface.
preserved:
- Every existing outcome literal and assertion built against DraftConnectorConfigurationRequestOutcome's
  "drafted" variant, ConnectorConfigurationDraft and pickConnectorConfigurationDraftFields (unchanged,
  no link/operation field added).
- The draft-request gate's connector/operation-missing messages and button gating, untouched.
- The Apply button's unconditional onClick, and every disclosure section (Unresolved, Generated
  credentials, Method mismatch, Status readings, Response fields, Reading notes) and their rendering
  order.
deferred:
- what: pt-BR wording for the staleness message.
  why: The task's own instruction states pt-BR wording is a separate sibling task's job; plain English
    used instead.
---

## What it is
The marking that keeps an operator from applying text drafted from an operation they are no longer looking at.

## Notes
Build round 1 failed typecheck: `stale` was declared required on ConnectorConfigurationHelperState,
breaking 6 pre-existing spec files that construct that type without a `stale` field. Fixed by making
`stale` optional (matching the existing `connector?` convention) and defaulting it to `false` at the
one render site that consumes it. Build round 2 green.
