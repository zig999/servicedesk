---
target: backend
title: Proof for the remove-connector HTTP route
summary: A new remove-connector.routes.spec.ts proves the route's own criteria (path/method, malformed-path
  refusal, unmapped-error propagation, unconditional-answer shape), the build-app.spec.ts fixture is repaired
  for the now-required removeConnector dependency, and one added build-app.spec.ts test proves the route's
  path/method share the registration route's own path without colliding, wiring it through the real build.
implementation: sha256:b8a40208281e99370ade7fe425bb0c56db5f7e6e33570a54e1e2da09b144c9e6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-removal-remove-connector-route-suite
tests:
- file: src/__tests__/unit/http/remove-connector.routes.spec.ts
  name: answers 204 with a wholly empty body, identically for a connector name currently registered and
    one nothing is registered under
  proves: Criterion 4 and constraints/a-successful-connector-configuration-removal-answers-with-no-content's
    own stated fitness.
  fails_when: Either call answers a status other than 204, either body is non-empty, removeConnector is
    not invoked with the exact connector name, or the two calls answer differently from one another.
  demonstrates: constraints/a-successful-connector-configuration-removal-answers-with-no-content
- file: src/__tests__/unit/http/remove-connector.routes.spec.ts
  name: answers 400 via validation for a request with an empty :connector segment, never 404
  proves: Criterion 2 (a path segment failing the declared shape is refused with HTTP 400, code VALIDATION_ERROR,
    a message naming the path, and a non-empty details list).
  fails_when: The response is anything other than HTTP 400, the code is not VALIDATION_ERROR, the message
    does not name the path, details is empty, or removeConnector is invoked despite the malformed segment.
- file: src/__tests__/unit/http/remove-connector.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeConnector
    rejects with a generic, non-domain error
  proves: Criterion 6 (the controller re-raises whatever the operation raises rather than mapping it to
    a response itself).
  fails_when: The response carries any status, code or body other than the shared handler's generic 500
    INTERNAL_ERROR envelope, or the rejected error's own message reaches the response.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers the DELETE to /v1/connectors/{connector} through remove-connector and the PUT to the identical
    path through register-connector, neither one colliding with the other
  proves: Criterion 1 together with criterion 7, both exercised through the real buildApp()/BuildAppDependencies
    wiring.
  fails_when: The DELETE answers anything other than 204, the PUT answers anything other than 200, or
    either request is dispatched to the other route's handler or answers 404/405 from a routing collision.
not_applicable:
- edge_case: An entirely absent connector segment (DELETE /v1/connectors with no trailing segment at all)
  why: Fastify's router refuses it before any request is dispatched to this route's handler, so it is
    a routing-level 404 no criterion of this task governs.
- edge_case: A forbidden-state refusal for removal
  why: rules/integration/removing-a-connector-configuration-is-unconditional states the removal succeeds
    regardless of registry state; there is no state this operation forbids.
- edge_case: A slow or unavailable dependency behind removeConnector
  why: No criterion or node names a timeout, retry or degraded-dependency behavior for this route.
- edge_case: Two removal requests against the same connector name at once
  why: Concurrency safety, if any, is the store's own transaction boundary, not this HTTP surface's.
- edge_case: A malformed request body accompanying the DELETE
  why: This route declares no body schema — removeConnectorParamsSchema validates only the path.
untested:
- 'contracts/integration/connector-configuration-registry: the contract''s whole fact spans all four operations
  (read, list, register, remove); this task''s tests exercise only remove-connector.'
- 'domain/integration/connector-configuration-registry: the node''s whole fact spans refuse/hold/remove;
  this task''s files touch only the removal delegation.'
- 'domain/integration/connector-configuration: the value object''s whole fact covers both attributes and
  replace-whole-on-edit semantics; this task''s route carries no configuration attribute at all.'
- 'rules/integration/removing-a-connector-configuration-is-unconditional: at the HTTP/controller layer
  the dependency is a mock that always resolves the same way, so no test at this layer can decide whether
  removal is truly unconditional against a real store — that is the sibling operation task''s own suite.'
- 'constraints/a-malformed-request-is-refused-with-a-validation-error: the constraint''s own scope is
  system-wide; this task''s test decides only the path case for this one route.'
- 'constraints/no-route-enforces-authentication: the constraint''s own scope is system-wide; the pre-existing
  build-app.spec.ts sweep already extends to the new files by scanning at test-run time, but no test this
  proof itself adds decides the whole system fact.'
- Criterion 5 (four separate files) states a file-layout fact, not an observable runtime behavior, so
  no test asserts it directly — it is evidenced by the implementation record's own files list.
---

## What it is
The tests proving remove-connector-route: unconditional 204/no-body answer (registered and unregistered alike), malformed-path 400 refusal, generic-error propagation, and wiring through the real application build alongside register-connector on the same path.

## Notes
run/connector-configuration-removal-remove-connector-route-build failed typecheck, cause: code — build-app.spec.ts's stubBuildAppDependencies() fixture was missing the now-required removeConnector field. Fixed by the test-author's proof pass.
