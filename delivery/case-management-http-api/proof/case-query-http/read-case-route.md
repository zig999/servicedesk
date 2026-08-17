---
title: Proof for GET /v1/cases/{slug}/versions/{version}
summary: Fastify inject()-driven proof, over a locally-assembled app registering createReadCaseRoutesPlugin
  plus the shared error handler, that a valid request returns the case version whole, a not-found slug/version
  is refused at the status status-map assigns CaseNotFoundError, and a version that cannot be assembled
  whole answers nothing partial.
implementation: sha256:7ab27766b89269fe6a25c002ad0cd99812c1ba5ecca2cc3b15fd592a81b03b13
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
tests:
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: answers 200 with the named case version assembled whole — its own attributes, its manifest and
    every manifest entry's own hypothesis-revision
  proves: Criterion 1
  fails_when: the response status is not 200, or the body drops/renames/misprojects any attribute of the
    case, the manifest, or any manifest entry's hypothesis-revision.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: resolves the slug and version exactly as the path names them, the version coerced from its string
    segment into a number
  proves: the implementation record's stated coercion inference.
  fails_when: readCase is called with the version as a string, or with a different slug/version than the
    path named.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: never carries Case.hypotheses — the flattened per-version projection this route's own dto excludes
    — even though the assembled case itself still carries it
  proves: the implementation record's stated exclusion inference.
  fails_when: the response body includes a hypotheses key.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: omits consolidation_register and released_at entirely, rather than as null, when the assembled
    case does not carry them
  proves: criterion 1's 'own attributes' for a version that never declared the two optional attributes.
  fails_when: the response carries either key at all (null included).
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: answers each of two requests naming different slug/version pairs with that request's own resolution,
    never a cached or joined value
  proves: no state leaks across two sequential requests.
  fails_when: either response answers with the other request's slug.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError, when no version answers the
    named slug and version
  proves: Criterion 2
  fails_when: the status is not 404, or the code/details do not match CaseNotFoundError's own name/context.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body, when the named version cannot be
    assembled whole
  proves: Criterion 3
  fails_when: the status is not 500, or the body carries anything other than the fixed generic envelope.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching the case query
  proves: EDG-01/DTO-01 validation boundary for :version.
  fails_when: the status is not 400, or readCase was called.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: answers 400 for a version of zero, one below the positive range the domain declares, without ever
    reaching the case query
  proves: the lower boundary of readCaseParamsSchema's positive() constraint.
  fails_when: the status is not 400, or readCase was called.
- file: src/__tests__/unit/http/read-case.routes.spec.ts
  name: answers 404 for a request naming no version segment at all, never reaching the case query
  proves: absent-input handling for the :version path segment.
  fails_when: the status is not 404, or readCase was called.
not_applicable:
- edge_case: An empty manifest
  why: Case.manifest is typed and constrained upstream to at least one entry; this route neither enforces
    nor can violate that.
- edge_case: A duplicate-uniqueness edge case
  why: no criterion or domain node this task implements claims uniqueness over a read.
- edge_case: An operation against state that forbids it
  why: read-case is a pure read; no domain state forbids reading a stored, valid version.
- edge_case: A slow or unavailable dependency
  why: the shared error-handler's generic-500 fallback is already proved at the seam and exercised structurally
    by criterion-3's own test.
- edge_case: An empty or missing slug segment
  why: Fastify's own router refuses an empty path segment before the route matches at all, the same class
    the no-version-segment test already exercises.
- edge_case: A generic non-domain rejection from the case-query seam
  why: the propagation-without-swallowing behavior is already demonstrated by the criterion-2 and criterion-3
    tests reaching the shared handler unaltered.
---

## What it is

Ten Fastify-injected tests over GET /v1/cases/{slug}/versions/{version}, proving all three criteria plus every disclosed inference.

## Notes

None.
