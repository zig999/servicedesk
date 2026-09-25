---
target: backend
title: HTTP route serving a case version's own declared attributes -- proof
summary: Six tests over GET /v1/cases/:slug/versions/:version/declared-attributes, each an obligation
  this task states -- its six criteria and the four UNDERDETERMINED entries the binder named -- with the
  http-200 constraint node demonstrated whole by the test covering both representative calls its own fitness
  names.
implementation: sha256:d733a7ce114fffd5911d4403a457dd8e209f3df0f1416f6bfe112befbc2777be
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-correction-while-invalid-serve-a-drafts-own-declared-attributes-over-http-suite
tests:
- file: src/__tests__/unit/http/read-case-version.routes.spec.ts
  name: answers HTTP 200 both for a draft whose manifest holds no hypothesis and for a version that reads
    back fully as a case, never conditioning the status on the version's validity
  proves: criterion 1 (a draft whose manifest holds no entry is answered 200); constraints/a-successful-case-version-own-record-read-answers-with-http-200's
    own fitness in full -- both representative calls it names; UNDERDETERMINED entry 3 (a validating or
    released version is also answered 200)
  fails_when: either call -- over a draft whose manifest holds no entry, or over a version that reads
    back fully as a case -- answers with a status other than 200
  demonstrates: constraints/a-successful-case-version-own-record-read-answers-with-http-200
- file: src/__tests__/unit/http/read-case-version.routes.spec.ts
  name: answers 200 even when the subject or fallback itself is the declared attribute a validator rule
    would reject, not only when an empty manifest is the failing rule
  proves: UNDERDETERMINED entry 2 -- the route does not distinguish which validator rule is the failing
    one and never refuses with 409 when the subject or fallback is that attribute
  fails_when: the route answers with 409 (or any status other than 200) when the resolved subject is a
    value a validator rule would reject, while still answering 200 when only the manifest's emptiness
    is the failing rule
- file: src/__tests__/unit/http/read-case-version.routes.spec.ts
  name: carries the declared attributes exactly as the draft's own-record read answered them, dropping
    none of the five named attributes and carrying no field beyond them
  proves: criterion 2 (the 200 body carries the declared attributes exactly as the own-record read answered
    them); criterion 4 (the 200 body carries no manifest entry); UNDERDETERMINED entry 1 (the route forwards
    all five attributes)
  fails_when: the body omits, renames or recomputes any of title, when_to_use, subject, fallback or consolidation_register
    from what the own-record read answered, or carries any field beyond those five
- file: src/__tests__/unit/http/read-case-version.routes.spec.ts
  name: carries no consolidation_register key, rather than an empty or null one, when the draft declares
    none
  proves: criterion 3 (where the draft declares no consolidation_register, the 200 body carries no consolidation_register
    value)
  fails_when: the body carries a consolidation_register key, even as null or undefined, when the draft's
    own-record read answered none
- file: src/__tests__/unit/http/read-case-version.routes.spec.ts
  name: refuses with 404 reporting CaseNotFoundError carrying the named slug and version, when no case
    version answers them
  proves: criterion 5 (a request naming a slug and version that no case version answers is answered HTTP
    404 reporting a CaseNotFoundError whose details carry that slug and version)
  fails_when: the response is anything other than HTTP 404 with error code CaseNotFoundError and details
    equal to the named slug and version
- file: src/__tests__/unit/http/read-case-version.routes.spec.ts
  name: refuses with 400 VALIDATION_ERROR naming the path and listing the issue found, when the version
    segment is not an integer
  proves: criterion 6 (a request whose version path segment is not an integer is answered HTTP 400 with
    code VALIDATION_ERROR and a message naming the path); UNDERDETERMINED entry 4 (the 400's details list
    actually enumerates the issue found)
  fails_when: the response is anything other than HTTP 400 with code VALIDATION_ERROR, a message naming
    the request path, and a non-empty details list naming the version field, or the case query is reached
    before the refusal
not_applicable:
- edge_case: a version path segment of zero or a negative integer
  why: no criterion of this task states positivity as an obligation -- criterion 6 names only the "not
    an integer" class, and the schema's .positive() constraint is an implementation detail the task's
    Notes leave to implementation
- edge_case: an absent or empty version path segment
  why: the route pattern requires the segment to be present for Fastify to match it at all; a request
    missing it never reaches this route's handler
- edge_case: a slug that exists at a different version, versus a slug that never existed at all
  why: heldVersion/CaseNotFoundError treats both misses identically -- one representative unwritten slug-and-version
    pair already covers the equivalence class criterion 5 states
- edge_case: the underlying case-query dependency being slow, unavailable, or answering in an unexpected
    shape
  why: that dependency is mocked at this route's own boundary and is owned by the depended-on task's own
    service-level tests; this route performs no retry, timeout or shape-repair logic of its own for a
    criterion to state
untested:
- contracts/knowledge/case-query -- the contract publishes six operations; this task's route exposes only
  read-case-version, and the other five are implemented and tested by their own separate routes. No test
  confined to this one route decides the contract's fact whole.
- constraints/a-malformed-request-is-refused-with-a-validation-error -- stated once for the whole HTTP
  surface; this task's own Notes REMAINDER entry says the query/body clauses reach no criterion here,
  this route taking only path segments; the tests written decide the path-shape clause for this one route
  only.
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused -- the policy also covers a lifecycle
  operation and a read keyed by slug alone; this task's own Notes REMAINDER entry assigns those clauses
  to read-case's own route, the slug-keyed listings, and the case-lifecycle operation routes. The test
  written here decides only the slug-and-version read clause for this one route.
- rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  -- its expression states both presenting the five attributes and accepting an update-draft over them
  on the same refused reading. This task's own Notes REMAINDER entry defers the update-draft-accepting
  clause (and the manifest) to sibling tasks.
- domain/knowledge/case-version -- the aggregate root declares ten attributes and nine operations; this
  task's route encodes only which of its declared attributes this task's own-record read forwards over
  HTTP. No test in this route's proof decides the aggregate's whole fact.
---

## What it is

Six tests in src/__tests__/unit/http/read-case-version.routes.spec.ts, each proving one or more of the task's six criteria and the four UNDERDETERMINED entries the binder named, plus a demonstration of constraints/a-successful-case-version-own-record-read-answers-with-http-200's own fitness (both a manifest-empty draft and a version that reads back fully as a case answer 200).

## Notes

None.
