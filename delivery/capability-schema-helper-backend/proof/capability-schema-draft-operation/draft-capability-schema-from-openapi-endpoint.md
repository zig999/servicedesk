---
target: backend
title: Proof for the draft-capability-schema-from-openapi HTTP surface
summary: Route-level tests for draft-capability-schema-from-openapi's registration, fetch/derive/answer wiring, validation refusal and no-registration guarantee, plus a source-level check that the fetch/read/lookup reuse the existing machinery.
implementation: sha256:c9a7d89e20a847b3446984cc4ccd5ae1d404bee04b5b3e61bb52d07c491ded20
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-schema-draft-operation-draft-capability-schema-from-openapi-endpoint-suite
tests:
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: fetches the operator-named document through the injected document fetcher, using the request's own link, and answers HTTP 200 for a well-formed request that generates a draft
  proves: the request names the OpenAPI document link, the path, and the HTTP method the draft is generated from; the operator-named document is fetched inside this backend operation; an answered request that carries a generated draft carries HTTP 200; an answered request that carries a generated draft never carries HTTP 201, HTTP 202 or HTTP 204
  fails_when: the route stops fetching the document through the injected documentFetcher with the request's own link, or stops answering exactly HTTP 200 when a draft is generated (an exact-equality assertion, so any of 201/202/204 or anything else fails it identically)
  demonstrates: rules/integration/a-generated-schema-draft-answers-under-http-200
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: answers exactly input_schema, output_schema and unresolved on a generated draft — the value object's three declared attributes and no other key
  proves: the answer body carries input_schema, output_schema and the unresolved list generated from the named operation's parameters, request-body fields and success responses (shape half)
  fails_when: the response carries a different set of keys than exactly input_schema, output_schema and unresolved, or one of the three stops matching its declared type
  demonstrates: domain/integration/capability-schema-draft
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: derives input_schema and output_schema from the named operation's resolvable parameters, request-body field and success response field, for an operation whose document declares a resolvable path parameter and a resolvable response field alongside unresolvable ones
  proves: the answer body carries input_schema and output_schema generated from the named operation's parameters, request-body fields and success responses (content half)
  fails_when: input_schema or output_schema stop reflecting the operation's own resolvable parameter, request-body field or response field
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: names each unresolved item by its own name and its own reason, and no other field, for the same operation declaring an unresolvable parameter, a name claimed by another parameter and an unresolvable response field
  proves: the unresolved list's items each name their own name and their own reason
  fails_when: an unresolved item carries a field other than name and reason, or a name the operation declares unresolved is dropped or renamed
  demonstrates: domain/integration/capability-schema-draft-unresolved-item
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: carries a reason for every unresolved item drawn from exactly schema-not-reducible-to-a-type and name-claimed-by-another-parameter, realizing both from one request
  proves: every reason an unresolved item carries is one of schema-not-reducible-to-a-type and name-claimed-by-another-parameter, and no other value
  fails_when: an unresolved item carries a reason outside those two values, or the response never realizes one of the two declared reasons for input designed to trigger both
  demonstrates: domain/integration/capability-schema-draft-unresolved-reason
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: answers a second request naming a different operation with that operation's own freshly generated draft, never a draft carried over from an earlier request
  proves: the answer stores no record of the draft
  fails_when: a second request answers with a draft reflecting an earlier request's operation instead of its own freshly fetched document
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when link is missing from the body, without reaching the document fetcher
  proves: a request whose body fails the route's declared shape is answered with HTTP 400, code VALIDATION_ERROR, a message naming the body, and a non-empty details list (link required)
  fails_when: a request missing link is not refused with HTTP 400/VALIDATION_ERROR and a non-empty details list, or the document fetcher is invoked anyway
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when path is missing from the body, without reaching the document fetcher
  proves: a request whose body fails the route's declared shape is answered with HTTP 400, code VALIDATION_ERROR, a message naming the body, and a non-empty details list (path required)
  fails_when: a request missing path is not refused with HTTP 400/VALIDATION_ERROR and a non-empty details list, or the document fetcher is invoked anyway
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when method is missing from the body, without reaching the document fetcher
  proves: a request whose body fails the route's declared shape is answered with HTTP 400, code VALIDATION_ERROR, a message naming the body, and a non-empty details list (method required)
  fails_when: a request missing method is not refused with HTTP 400/VALIDATION_ERROR and a non-empty details list, or the document fetcher is invoked anyway
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: refuses with 400 and a non-empty details list for a request whose body is empty entirely
  proves: a request whose body fails the route's declared shape is answered with HTTP 400 and a non-empty details list (absent-body boundary)
  fails_when: an entirely empty body is not refused with HTTP 400 and a non-empty details list
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: refuses with 400 a request whose link is an empty string
  proves: a request whose body fails the route's declared shape is answered with HTTP 400 (empty-string boundary, shared identically by link, path and method)
  fails_when: an empty-string link is accepted rather than refused with HTTP 400
- file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  name: fetches through the injected document-fetcher port and reads the operation via the existing openapi-operation-reader module, declaring no second implementation of either
  proves: the document fetch, the document read and the operation lookup are the existing fetcher and readers rather than a second implementation
  fails_when: capability-schema-draft-generation.ts stops importing readOpenApiOperation from the existing openapi-operation-reader module, or begins parsing the document itself (e.g. via JSON.parse or a YAML library) instead of reusing the existing reader
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches its own controller rather than answering 404, for the draft-capability-schema-from-openapi route
  proves: the route for draft-capability-schema-from-openapi is registered on the application beside the existing OpenAPI-reading routes
  fails_when: the route stops being registered on the assembled application, or answers 404 rather than dispatching to its own controller
  demonstrates: contracts/integration/capability-schema-draft
- file: src/__tests__/unit/http/build-app.spec.ts
  name: issues no register-capability call while draft-capability-schema-from-openapi answers a generated draft
  proves: no register-capability call is issued while the request is answered; every capability registered before the request stands exactly as it stood after it (entailed, since register-capability is the registry's one write path)
  fails_when: registerCapability is invoked at any point while handling a draft-capability-schema-from-openapi request that generates a draft
  demonstrates: rules/integration/a-capability-schema-draft-registers-nothing
not_applicable:
- edge_case: two requests to draft-capability-schema-from-openapi executing concurrently against the same operation
  why: no criterion or node this task implements states any concurrency guarantee for this read-only operation; a test would assert a guarantee nobody made
- edge_case: the injected document fetcher rejecting or timing out, or the fetched document/operation being unreadable or not found
  why: the task's own Notes state its criteria reach no clause of an-unfetchable-openapi-link-refuses-the-schema-draft, a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft, an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft or a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document; that behavior belongs to the deferred sibling task three-refusals-under-http-422
- edge_case: a length or format boundary on link, path or method beyond non-emptiness (a URL shape for link, an HTTP-method enum for method)
  why: no criterion or node states any such constraint; the implementation record itself records the non-empty-string-only validation as an inference, not a stated obligation, so pinning a stricter boundary would test an arrangement nobody required
untested:
- criterion 3's frontend half -- 'no fetch of that link issued from any frontend module' -- is not established by any test in this backend proof; the implementation record notes no frontend file exists in this delivery, but that absence is not itself verified by a test here.
- constraints/the-openapi-document-is-fetched-by-the-backend states a fact spanning both the backend fetch and the absence of any direct frontend fetch. This proof decides the backend half (the fetch-through-the-injected-dependency test) but ships and audits no frontend file, so the node's own fact is not decided whole by any test here.
- 'constraints/a-malformed-request-is-refused-with-a-validation-error is stated system-wide (scope: system, ''every route''). This proof''s validation tests decide only this one route''s compliance; no test here decides the node''s own system-wide totality whole.'
- UNDERDETERMINED, from the specification -- the objective's phrase 'the capability schema draft generated from that operation' has no backing in this task's own candidates for how input_schema and output_schema are derived; that derivation is stated in a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields and a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses, neither a candidate of this task. The entry names no implementation for a test to fail over, so none is written; this absence is a finding about the binder's pass that this proof cannot otherwise recover.
- UNDERDETERMINED, from the specification -- no criterion of this task holds the unresolved list to completeness against a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order and a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason, neither a candidate of this task. The entry names no implementation for a test to fail over, so none is written; the unresolved list's completeness against those two rules stays unproven by this proof.
---

## What it is

Route-level tests for draft-capability-schema-from-openapi: its registration, the happy-path fetch/derive/answer wiring under HTTP 200, its request-shape validation refusal under HTTP 400 VALIDATION_ERROR, its no-registration and no-storage guarantees, and a source-level check that the document fetch, read and operation lookup reuse the existing machinery.

## Notes

None.
