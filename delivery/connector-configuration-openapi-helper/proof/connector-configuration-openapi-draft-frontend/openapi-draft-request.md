---
title: Proof for the draft-connector-configuration-from-openapi request hook
summary: Vitest/renderHook coverage over useDraftConnectorConfigurationFromOpenApi
  proving the request body and route, the pass-through of an answered draft (including
  its empty-list, no-mismatch and no-capability-leak shapes), each of the four distinguishable
  refusal outcomes, the three UNDERDETERMINED resolutions the implementation record
  names, and the concurrent-dispatch guard.
implementation: sha256:d104cb9099639459286249d5b7bf5798c6493d3c0e3244b3bcbd44b6c2ab0337
standard:
  at: ../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-openapi-draft-request-suite-2
tests:
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: sends exactly {connector, link, path, method} in the POST body, with the connector
    the hook was constructed with
  proves: A dispatched request names the connector the surface holds, the operator-supplied
    OpenAPI document link, and the operation's own path and HTTP method, in the body
    the published operation's route declares.
  fails_when: The POST body sent to fetch omits, renames, or adds to any of connector/link/path/method,
    or sends the wrong connector value.
  demonstrates: contracts/integration/connector-configuration-draft
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: issues its one network call to the published draft route, never to the operator-supplied
    link or any other route
  proves: A dispatched request goes to the route of the published draft-connector-configuration-from-openapi
    operation and to no other route; no module of this request path issues a request
    to the operator-supplied OpenAPI document link; requesting a draft issues no register-connector
    call and invokes neither screen's save mutation.
  fails_when: A second network call is made, or the sole call targets any URL other
    than /v1/draft-connector-configuration-from-openapi.
  demonstrates: constraints/the-openapi-document-is-fetched-by-the-backend
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: exposes connector, configuration, unresolved, generated_credentials and method_mismatch
    exactly as named, when a mismatch stands
  proves: An answered draft is exposed with its connector, its configuration text,
    its unresolved list, its generated credentials and its method mismatch where one
    stands, each read from the response body without renaming, re-casing or reordering.
  fails_when: The exposed draft renames, re-cases, drops, or otherwise alters any
    of the five fields relative to the response body.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: exposes no method_mismatch field at all when the response named none
  proves: 'Criterion 3''s where-one-stands clause: a method mismatch is present only
    when the response actually names one.'
  fails_when: The hook adds a method_mismatch field when the response body carried
    none.
  demonstrates: domain/integration/connector-configuration-draft-method-mismatch
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: exposes unresolved and generated_credentials as empty arrays when the response
    answered both empty
  proves: An answered draft whose unresolved list or generated credentials came back
    empty is exposed with that list empty rather than absent.
  fails_when: Either list is exposed as undefined, null, or missing rather than an
    empty array when the response answered it empty.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: exposes no name, version or count field even when the response body carries
    them
  proves: An answered draft is never exposed with a capability name, version or count,
    whatever the response body carries.
  fails_when: The exposed draft carries a name, version, or count key when the response
    body included them.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: exposes openapi-document-not-fetched, carrying the link and the status for
    a status-outside-2xx failure
  proves: A request refused with OpenApiDocumentNotFetchedError is exposed as a failure
    distinguishable from the other two refusals, carrying the fetch-failure kind and
    the link the response named; and the UNDERDETERMINED note that this union carries
    the status alongside the kind; and criterion 10 (no draft field).
  fails_when: The outcome's kind, link, or nested failure differs from what the response
    named, the status is dropped, or a draft field is present.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: 'exposes exactly {kind: ''openapi-document-not-readable''}, carrying no data
    from the other two refusals'
  proves: A request refused with OpenApiDocumentNotReadableError is exposed as a failure
    distinguishable from the other two refusals; and criterion 10 (no draft field).
  fails_when: 'The outcome is anything other than exactly {kind: ''openapi-document-not-readable''}.'
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: exposes openapi-operation-not-found, carrying the path and method the response
    named
  proves: A request refused with OpenApiOperationNotFoundError is exposed as a failure
    distinguishable from the other two refusals, carrying the path and method the
    response named; and criterion 10 (no draft field).
  fails_when: The outcome's path or method differ from what the response named, or
    a draft field is present.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: 'exposes exactly {kind: ''unrecognized-failure''} for an error code none of
    the three name'
  proves: A request refused with none of those three error values is exposed as a
    failure distinguishable from all three named ones.
  fails_when: 'An error code outside the three named ones is exposed as anything other
    than exactly {kind: ''unrecognized-failure''}.'
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: 'exposes exactly {kind: ''unrecognized-failure''} for a raw, non-ApiError
    throw'
  proves: Criterion 9's guard against a non-ApiError throw, and the edge case of the
    backend failing outright rather than answering with a structured error.
  fails_when: 'A raw, non-ApiError throw crashes the hook, is left unhandled, or is
    exposed as anything other than exactly {kind: ''unrecognized-failure''}.'
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: sends the same connector value on a second dispatch made with a different
    link, path and method
  proves: The implementation record's own inference that the hook binds connector
    at construction time rather than accepting it per dispatch.
  fails_when: A second dispatch with a different link/path/method sends a different
    connector value than the one the hook was constructed with.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: 'starts as {kind: ''idle''}, then reports exactly {kind: ''pending''} with
    no refusal data while outstanding'
  proves: The task's own UNDERDETERMINED note and the implementation record's inference
    that the outcome union's initial/pending state must be its own variant, distinct
    from every refusal variant.
  fails_when: The idle or pending state carries any refusal-shaped data, or defaults
    to a refusal kind before or during an in-flight request.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: type-checks a reason value outside the closed reason set
  proves: The implementation record's own inference that the unresolved item's reason
    field is typed as a plain string rather than a closed union of the four unresolved-reason
    literal values.
  fails_when: reason is narrowed to a union of the four known literal values, at which
    point this exact assignment no longer type-checks.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: leaves an independently-held configuration field value unchanged after a draft
    answers with different configuration text
  proves: The task's own UNDERDETERMINED note and the implementation record's inference
    that this hook never writes to ConfigurationFieldState.
  fails_when: A configuration field's own local state, held independently beside this
    hook, changes as a result of dispatching or resolving a draft request.
- file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  name: issues exactly one network call when requestDraft is invoked twice before
    the first settles
  proves: The isDispatchingRef double-dispatch guard the inventory's own convention
    states, over the edge case of two operations against one subject at once.
  fails_when: A second requestDraft call made before the first settles issues a second
    network call.
not_applicable:
- edge_case: Absent, empty, or malformed operator-supplied link/path/method values
    passed into requestDraft
  why: Validating what the operator typed is the Configuration Helper surface's own
    concern -- the task's own notes name it as REMAINDER. No criterion here bounds
    what this hook does with a malformed caller input; it is written to forward exactly
    what its caller supplies.
- edge_case: A numeric boundary on the answered status-outside-2xx status value
  why: No criterion bounds what status number the hook may carry; it is passed through
    exactly as the backend answered it.
- edge_case: A duplicate name across two unresolved items or two generated credentials
    in one answered draft
  why: No criterion claims uniqueness among the items of either list; the hook exposes
    each list exactly as answered.
untested:
- Whether some module transitively invoked by this hook issues a request to the operator-supplied
  link through a mechanism other than the global fetch (e.g. XMLHttpRequest) is not
  directly observed -- only the hook's own and api-client.ts's use of the global fetch
  was stubbed and inspected.
---

## What it is

Proof of the one place the frontend speaks to the published draft operation.

## Notes

This proof's first pass found the implementation did not actually enforce criterion 5 (it passed the whole response body through unfiltered rather than picking only the five declared fields) and recorded it as a contested finding, confirmed failing. The implementation was fixed to rebuild the exposed draft from only its five declared fields; all 16 tests, including the one that had failed, now pass with no test weakened or rewritten to accommodate the fix.
