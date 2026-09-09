---
title: Draft request hook for draft-connector-configuration-from-openapi
summary: A new apiFetch-backed useMutation hook that dispatches a connector configuration
  draft request to the published draft-connector-configuration-from-openapi route
  and exposes either the answered draft (rebuilt from only its five declared fields)
  or one of four distinguishable classified failures, with no fact of a draft ever
  standing beside a refusal.
task: sha256:03b2de81d7f11f50684135a374205d5e1e07b64ca29b768eb8e27d1e13769413
standard:
  at: ../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-openapi-draft-request-build-5
files:
- path: src/hooks/use-draft-connector-configuration-from-openapi.ts
  effect: 'New hook useDraftConnectorConfigurationFromOpenApi(connector), matching
    the bare apiFetch-backed useMutation convention of use-test-connector-panel.ts
    (no queryKey, mutation.reset() before each dispatch, an isDispatchingRef double-dispatch
    guard). It exposes requestDraft({link, path, method}), which POSTs {connector,
    link, path, method} to /v1/draft-connector-configuration-from-openapi through
    apiFetch, and an outcome value read off the mutation''s own status: idle, pending,
    drafted (carrying a draft rebuilt by pickConnectorConfigurationDraftFields from
    only the five declared ConnectorConfigurationDraft fields -- connector, configuration,
    unresolved, generated_credentials, method_mismatch? -- dropping any other key
    the response body might carry), or one of four failure variants -- openapi-document-not-fetched
    (link + a nested fetch-failure kind, with a status for status-outside-2xx), openapi-document-not-readable,
    openapi-operation-not-found (path + method), and unrecognized-failure for every
    other refusal or non-ApiError throw.'
- path: src/shared/components/button-footer.spec.ts
  effect: 'Fixed a pre-existing lint failure unrelated to this task (two testing-library/no-node-access
    violations and one consistent-type-assertions violation from a raw document.querySelector(''footer'')
    call): replaced with screen.getByRole(''contentinfo''), which the footer element
    already exposes, removing the type assertion entirely. No test assertion or behavior
    changed -- confirmed by re-running the file''s suite (9/9 passing) before and
    after.'
criteria:
- criterion: A dispatched request names the connector the surface holds, the operator-supplied
    OpenAPI document link, and the operation's own path and HTTP method, in the body
    the published operation's route declares.
  met: true
  how: requestDraft's body is { ...request, connector } where request is {link, path,
    method} supplied by the caller and connector is the string the hook was constructed
    with -- exactly the four keys draftConnectorConfigurationFromOpenApiRequestSchema
    declares.
- criterion: A dispatched request goes to the route of the published draft-connector-configuration-from-openapi
    operation and to no other route.
  met: true
  how: The mutationFn's only apiFetch call targets the literal string "/v1/draft-connector-configuration-from-openapi";
    the hook issues no other request.
- criterion: An answered draft is exposed with its connector, its configuration text,
    its unresolved list, its generated credentials and its method mismatch where one
    stands, each read from the response body without renaming, re-casing or reordering.
  met: true
  how: pickConnectorConfigurationDraftFields destructures connector, configuration,
    unresolved, generated_credentials and method_mismatch off the parsed response
    body under exactly those names and rebuilds the exposed draft object from those
    same values, unmodified.
- criterion: An answered draft whose unresolved list or generated credentials came
    back empty is exposed with that list empty rather than absent.
  met: true
  how: pickConnectorConfigurationDraftFields copies unresolved and generated_credentials
    through as destructured, without ever substituting a default or dropping them
    when empty; the backend always answers both as arrays, empty or not.
- criterion: An answered draft is never exposed with a capability name, version or
    count, whatever the response body carries.
  met: true
  how: pickConnectorConfigurationDraftFields rebuilds the exposed draft from a fresh
    object literal holding only the five destructured fields (method_mismatch included
    only when not undefined), so any other key the response body carries -- including
    a capability name, version or count -- is not present on the object the hook exposes,
    regardless of what the parsed JSON held. This holds even where the backend answered
    more than its own contract promises, which is exactly what the criterion's own
    wording requires and what an earlier pass-through of the raw response did not
    guarantee.
- criterion: A request refused with OpenApiDocumentNotFetchedError is exposed as a
    failure distinguishable from the other two refusals, carrying the fetch-failure
    kind and the link the response named.
  met: true
  how: outcomeForRefusal matches error.code === 'OpenApiDocumentNotFetchedError' to
    its own openapi-document-not-fetched variant, carrying link and failure (the nested
    network-failure/timeout/status-outside-2xx kind, with status for the last).
- criterion: A request refused with OpenApiDocumentNotReadableError is exposed as
    a failure distinguishable from the other two refusals.
  met: true
  how: outcomeForRefusal matches that code to its own openapi-document-not-readable
    variant, a distinct member of the discriminated union from every other outcome.
- criterion: A request refused with OpenApiOperationNotFoundError is exposed as a
    failure distinguishable from the other two refusals, carrying the path and method
    the response named.
  met: true
  how: outcomeForRefusal matches that code to its own openapi-operation-not-found
    variant, carrying path and method read from error.details.
- criterion: A request refused with none of those three error values is exposed as
    a failure distinguishable from all three named ones.
  met: true
  how: outcomeForRefusal's default branch, and its guard against a non-ApiError throw,
    both return the unrecognized-failure variant.
- criterion: No failure exposed for a refused request carries any part of a draft.
  met: true
  how: DraftConnectorConfigurationRequestOutcome is a discriminated union; only the
    drafted member carries a draft field, and none of the five failure/pending/idle
    members declares one.
- criterion: No module of this request path issues a request to the operator-supplied
    OpenAPI document link, and nothing it calls does.
  met: true
  how: The hook's only network call is apiFetch against the fixed backend route string;
    the operator-supplied link is placed inside the JSON body sent to that route and
    is never itself passed to fetch or read as a request target anywhere in this file
    or in api-client.ts.
- criterion: Requesting a draft issues no register-connector call and invokes neither
    screen's save mutation.
  met: true
  how: The hook declares one mutation, targeting only the draft route; it imports
    nothing from use-connector-configuration-form.ts or use-connector-configuration-detail.ts
    and calls no other mutate function.
nodes:
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: The hook never fetches the operator-supplied link itself; it forwards link
    as a body field of the one POST it makes to this project's own backend route,
    which is the only network call this module or api-client.ts issues.
- node: contracts/integration/connector-configuration-draft
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: The hook is the frontend's one caller of the published draft-connector-configuration-from-openapi
    operation, dispatching the request and reading its answer, never registering anything.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: 'Modeled as the ConnectorConfigurationDraft type: connector, configuration,
    unresolved (many), generated_credentials (many), method_mismatch (optional) --
    the same required/optional shape this node declares, and the only shape pickConnectorConfigurationDraftFields
    ever exposes as outcome.draft, whatever else the response body carries.'
- node: domain/integration/connector-configuration-draft-generated-credential
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: Modeled as ConnectorConfigurationDraftGeneratedCredential with exactly name
    and security_scheme, both required, matching this node's two attributes.
- node: domain/integration/connector-configuration-draft-method-mismatch
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: Modeled as ConnectorConfigurationDraftMethodMismatch with exactly registered
    and operation, both required, matching this node's two attributes.
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: Modeled as ConnectorConfigurationDraftUnresolvedItem with exactly name and
    reason, both required.
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: 'This task answers only this rule''s requesting-a-draft-issues-no-register-connector-call
    clause: the hook declares one mutation against the draft route alone. The offer/placement
    half of the rule is REMAINDER per the task''s own notes.'
- node: rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator
  encoded_at:
  - src/hooks/use-draft-connector-configuration-from-openapi.ts
  how: 'This task answers only the half reaching one classified, distinguishable failure
    per refusal: the outcome union gives each of the four refusals its own distinct
    variant, none carrying any part of a draft, and idle/pending keep a refusal from
    ever being stated before the operation answers. The operator-facing statement
    itself is REMAINDER, for the task that renders it.'
inferences:
- inferred: The exposed draft is rebuilt from a fresh object literal holding only
    the five declared ConnectorConfigurationDraft fields, dropping any other key the
    response body carries, rather than relying on the backend's own promise never
    to send one.
  from: Criterion 5's own wording, 'whatever the response body carries' -- read as
    holding even where the backend answers more than its contract promises, not only
    as a description of what the backend currently sends. Corrected after the test-author's
    proof recorded a contested finding against an earlier pass-through implementation,
    confirmed failing, then fixed.
- inferred: The openapi-document-not-fetched outcome variant carries the answered
    HTTP status alongside the fetch-failure kind for a status-outside-2xx failure,
    rather than dropping it.
  from: The task's own UNDERDETERMINED note, which permits either choice, and flags
    that a later surface needing to state the status requires this task's union to
    carry it.
- inferred: The unresolved item's reason field is typed as a plain string rather than
    a closed union of the four unresolved-reason literal values.
  from: The task's own ADVISORY note, which reads that node as neighbouring rather
    than governing here.
- inferred: The hook binds connector at construction time (useDraftConnectorConfigurationFromOpenApi(connector))
    rather than accepting it per dispatch.
  from: The inventory's own convention statement about use-test-connector-panel.ts's
    signature, which binds the surface's own connector value the same way.
- inferred: The idle and pending outcome variants carry no data and are members of
    the same discriminated union as every refusal variant, so no refusal can be read
    while a request is outstanding.
  from: The task's own UNDERDETERMINED note, which states this exact bound as its
    implementation.
deferred:
- what: Rendering the Configuration Helper control itself (naming a link and an operation,
    an Apply action, and the operator-facing statement of a refused request).
  why: REMAINDER per the task's own notes -- this task's seam stops at exposing one
    classified outcome; placing the helper and stating its refusal belong to the tasks
    the task's notes name for each.
---

## What it is

The one place the frontend speaks to the published draft operation. It is a read: it sends what the operator named and hands back what the operation answered.

## Notes

Two substrate/environment issues, unrelated to this task, were hit and fixed before this build could pass: (1) frontend/tui is a real design-system package the main checkout holds but git does not track, so a fresh worktree lacks it entirely -- copied over from the main checkout. (2) button-footer.spec.ts (delivered by an earlier, unrelated change) failed lint with a raw document.querySelector call; fixed with screen.getByRole('contentinfo'), no assertion changed, 9/9 tests still passing before and after.
The proof's first pass recorded a contested finding on criterion 5 (a test proving the exposed draft never carries a capability name/version/count even where the response body does) and confirmed it failing against the initial implementation, which passed the raw response through unfiltered. Fixed by rebuilding the exposed draft from only its five declared fields.
