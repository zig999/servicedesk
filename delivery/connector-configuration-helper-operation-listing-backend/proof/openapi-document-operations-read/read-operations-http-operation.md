---
target: backend
title: Publish read-openapi-document-operations over HTTP — proof
summary: New unit tests over the routes/controller/dto triplet and one added wiring-reachability row prove
  the read's happy path, its value-object shape, its method-casing invariant, its request validation,
  and its two distinguished 422 refusals; a required plumbing fix to an existing stub is disclosed separately
  from the assertions.
implementation: sha256:fdae7ecab04e265e6eb31171298287d52910095088d2a47e98e302e46a5a7cb7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/openapi-document-operations-read-read-operations-http-operation-suite-3
tests:
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers 200 with exactly the fetched document's every operation, each entry carrying exactly its
    own path and upper-cased method and no other key, and forwards the request's own link unchanged to
    the injected fetcher, for a request naming one OpenAPI document link
  proves: Criterion -- a request naming one link is answered with every operation, path + upper-cased
    method; Criterion -- the controller maps the validated DTO and injected fetcher onto the reading and
    holds no logic of its own; Criterion -- the operation registers nothing (the only dependency supplied
    or referenced is the document fetcher)
  fails_when: the response is not exactly {operations:[{path,method}...]} matching the fetched document's
    own paths/methods, or the injected fetcher was not called with exactly the request body's own link
  demonstrates: domain/integration/openapi-operation
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers each of two requests naming a different link with that call's own complete, freshly-read
    operations list -- never a cached or shortened one -- proving the read is neither cached across calls
    nor paged within one
  proves: node fact -- every operation the fetched document declares is read fresh from the operator-named
    link on every call and answered whole rather than paged
  fails_when: the second call's response echoes the first's operations (a cache) or either response omits
    an operation the document declares (a page)
  demonstrates: domain/integration/openapi-document-operations
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: upper-cases an operation's method whatever case the fetched document's own path-item key names
    it under
  proves: rule -- a listed operation's method is upper-cased whatever case the document's own path-item
    key spells it under
  fails_when: the method comes back spelled as the document's own path-item key rather than upper-cased
  demonstrates: rules/integration/an-openapi-operations-method-is-upper-cased
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request naming no document link at
    all
  proves: Criterion -- a request naming no document link is rejected as VALIDATION_ERROR/400 with no fetch
    issued
  fails_when: the response is not 400 with code VALIDATION_ERROR and a non-empty details list, or the
    fetcher was called
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request whose link is not a string
  proves: Criterion -- a request naming a non-string link is rejected as VALIDATION_ERROR/400 with no
    fetch issued
  fails_when: the response is not 400 with code VALIDATION_ERROR and a non-empty details list, or the
    fetcher was called
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotFetchedError naming the fetch failure -- never swallowing
    it into 200 with an empty operations list, and never falling through to the generic 500 handler --
    when the named link cannot be fetched at all
  proves: Criterion -- every error class this operation raises is already mapped, so no refusal falls
    through to the generic handler; UNDERDETERMINED entry 1 (a handler swallowing every failure into 200
    with an empty array would pass every literal criterion but is refused here)
  fails_when: the response is 200 with an empty (or any) operations list, or 500, instead of 422 naming
    OpenApiDocumentNotFetchedError
  demonstrates: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotReadableError naming its own distinct condition, never
    conflated with either of the other two, reading no operations, when the document text is unparseable,
    declares no version, or declares an unsupported version
  proves: Criterion -- every error class this operation raises is already mapped; UNDERDETERMINED entry
    1 (no silent 200 swallow); UNDERDETERMINED entry 3 (the three namings -- unparseable, no-version-declared,
    unsupported-version -- must stay told apart at the HTTP surface, never one answered as another)
  fails_when: any of the three fetched-text cases is answered as 200, as 500, with the wrong kind/declaredVersion
    value, or with a kind matching one of the other two cases
  demonstrates: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: refuses the read, naming the declared version and reading no operations, when an OpenAPI document
    link answers a document declaring swagger 2.0
  proves: scenario -- a swagger 2.0 document refuses the operations read
  fails_when: operations are read from the swagger-2.0 document, or the refusal does not name the declared
    version 2.0, or no refusal occurs at all
  demonstrates: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers a link that cannot be fetched and a document that cannot be read under their own distinct
    422 error code -- an unfetchable link is never reported as an unreadable document, nor the other way
    round
  proves: rule -- the two refusals map to HTTP 422 under OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    respectively, never interchanged; UNDERDETERMINED entry 2 (no criterion alone fixes which value goes
    with which condition -- the node does, and this test enforces it)
  fails_when: either response is not 422, or the two error codes are identical or swapped relative to
    their own condition
  demonstrates: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches its own controller rather than answering 404, for the read-openapi-document-operations
    route (new row added to the existing REGISTERED_ROUTE_REQUESTS parameterized test)
  proves: Criterion -- the route plugin factory is registered in build-app.ts's routePluginFactories and
    its dependencies composed in build-app.factory.ts, so the operation is reachable on an app built by
    the factory with no further wiring
  fails_when: POST /v1/read-openapi-document-operations answers 404 on an app built through buildApp()/buildAppDependencies()'s
    own convention
not_applicable:
- edge_case: 'an empty-string link (e.g. {link: ''''})'
  why: the task's own criterion names exactly two classes -- a request naming no document link, and one
    naming a link that is not a string. An empty string is present and is of type string, so it falls
    under neither named class; no node states a length requirement either. The DTO's min(1) mirrors the
    sibling draft route's own schema but is not itself an obligation of this task's criteria or of any
    node it implements, so no test pins it.
- edge_case: a duplicate-registration or uniqueness conflict
  why: this operation reads and returns a value; it has no identity that could collide and registers nothing.
- edge_case: an operation attempted against state that forbids it, or two operations racing against one
    shared subject
  why: the read has no persisted state of its own to be in a forbidden condition or to race over; each
    request is answered from its own fresh fetch.
- edge_case: the sixty-second fetch-abandonment (timeout) clause of rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  why: the task's own Notes assign this clause as REMAINDER to task/openapi-document-operations-read/document-operations-reading,
    the reading this task's controller only maps onto; this task's controller has no timeout logic of
    its own to test.
- edge_case: the JSON/YAML-parse-by-content clause of rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  why: the task's own Notes assign this clause as REMAINDER to the same reading task; this task's tests
    exercise only that a refusal propagates and is named correctly at the HTTP surface, not which serialization
    was attempted.
untested:
- contracts/integration/openapi-document-operations -- its own how spans four files (routes, controller,
  build-app.ts, build-app.factory.ts) and its stated fact bundles several distinct claims across that
  whole wiring; no single test decides this identity whole without asserting only part of it, though each
  observable piece (reachability, response-shape purity, no-registration) is individually covered above.
- constraints/the-openapi-document-is-fetched-by-the-backend -- its own fitness is a frontend dependency/network-call
  audit; this task touches no frontend file and the target source root here is backend-only, so no test
  in this proof can decide the frontend half. The backend half is incidentally shown by every test that
  supplies the fetcher as a mock and observes it invoked, but that is not the whole constraint.
- constraints/a-malformed-request-is-refused-with-a-validation-error -- system-wide scope ('every route');
  this task's own two validation tests show this new route conforms to the established pattern, but a
  single new route's test does not decide the system-wide fact whole.
- constraints/a-domain-error-unmapped-by-status-is-refused-generically -- system-wide fallback fact; this
  operation raises no unmapped error, so no scenario in this task's own scope ever reaches that fallback
  path.
- 'inference -- the route is POST /v1/read-openapi-document-operations, named identically to the operation
  itself: an inference about naming, not a stated behavior; not pinned.'
- 'inference -- the DTO file declares only a request schema, with no separate response schema or mapping
  function: an inference about internal shape, not an observable obligation; the observable behavior is
  already proven without pinning the absence of a response schema as a fact in itself.'
- 'inference -- readOpenApiDocumentOperationsDependencies() takes no ComposedResources parameter: an inference
  about the factory function''s own signature, not a criterion or node fact; not pinned.'
---

## What it is
Ten new unit tests over the read-openapi-document-operations HTTP surface plus one added reachability row in build-app.spec.ts, proving the seven criteria and the eight bound specification nodes a finite test can decide.

## Notes
Two build attempts were red before this proof was written (run/..-build and run/..-build-2): the first from an existing test fixture (stubBuildAppDependencies in build-app.spec.ts) missing the newly-required readOpenApiDocumentOperations field -- cause code/plumbing, fixed here rather than by the task-implementer, which correctly declines to edit test files; the second from a max-lines-per-function lint violation that fix introduced -- fixed by extracting a helper, following the file's own stub-naming convention. Two suite attempts (run/..-suite and run/..-suite-2) were also red, both from a self-inflicted npm ci race (two concurrent installs into the same node_modules, cause setup/infrastructure, not diagnosed via failure-diagnostician since the concurrent-install cause was directly observed rather than needing to be inferred from a test failure) -- resolved by waiting for the first to finish and running once more cleanly under -suite-3, which this proof cites.
