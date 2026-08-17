---
title: Status-map resolves seven typed domain errors to non-500 statuses
summary: statusForError() maps each of seven typed domain errors to its assigned status and returns undefined
  for anything else, and error-handler.middleware.ts consults it before its unchanged 500 fallback.
implementation: sha256:2ee724e21321114db7d06dc70653542e1c22d46289b37f456196f8942db4517c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-http-status-map-suite-4
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseNotFoundError to 404
  proves: CaseNotFoundError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 404 for a CaseNotFoundError instance, or throws instead of
    returning
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseAlreadyHasDraftError to 409
  proves: CaseAlreadyHasDraftError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 409 for a CaseAlreadyHasDraftError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ManifestPositionOccupiedError to 409
  proves: ManifestPositionOccupiedError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 409 for a ManifestPositionOccupiedError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseVersionNotDraftError to 409
  proves: CaseVersionNotDraftError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 409 for a CaseVersionNotDraftError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseVersionNotDraftAtReleaseError to 409
  proves: CaseVersionNotDraftAtReleaseError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 409 for a CaseVersionNotDraftAtReleaseError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseVersionNotReleasableError to 422
  proves: CaseVersionNotReleasableError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 422 for a CaseVersionNotReleasableError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ManifestWouldHoldNoHypothesisError to 422
  proves: ManifestWouldHoldNoHypothesisError resolves to a distinct HTTP status other than 500.
  fails_when: statusForError stops returning 422 for a ManifestWouldHoldNoHypothesisError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: maps CaseAlreadyHasDraftError and ManifestPositionOccupiedError to the same non-500 status, pinning
    "distinct" as specific rather than mutually exclusive across all seven
  proves: the implementation's own recorded inference — that 'distinct' in criterion 2 is read as 'specific,
    not 500' rather than 'mutually exclusive across all seven'
  fails_when: statusForError starts returning two different values for CaseAlreadyHasDraftError and ManifestPositionOccupiedError
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: returns undefined for a typed domain error the table does not name
  proves: An error class the map does not name still answers 500, unchanged from today's behavior.
  fails_when: statusForError returns a number instead of undefined for an IncoherentCaseError instance
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: returns undefined for a thrown value that is not an Error at all
  proves: An error class the map does not name still answers 500, unchanged from today's behavior.
  fails_when: statusForError returns a number instead of undefined, or throws, for a plain string value
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: answers a mapped domain error with the status the status map assigns it, not the generic 500
  proves: error-handler.middleware.ts consults the status map instead of answering every thrown error
    with 500.
  fails_when: a Fastify route that rejects with a CaseNotFoundError answers with anything other than HTTP
    404
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: answers a second, differently-mapped domain error with its own distinct status too, showing the
    map is consulted rather than one error special-cased inline
  proves: error-handler.middleware.ts consults the status map instead of answering every thrown error
    with 500.
  fails_when: a Fastify route that rejects with a CaseVersionNotReleasableError answers with anything
    other than HTTP 422
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: answers a mapped domain error with its own class name as the code and its own context as details
  proves: the implementation's own recorded inference — that a mapped domain error's response envelope
    carries the error's own class name as code and its own context object as details
  fails_when: the response body's error.code stops being the literal string 'CaseNotFoundError', or error.details
    stops matching the error's own context object
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: still answers 500 with the unchanged generic envelope for a typed domain error the status map
    does not name
  proves: An error class the map does not name still answers 500, unchanged from today's behavior.
  fails_when: a Fastify route that rejects with an IncoherentCaseError answers with anything other than
    status 500 and the exact envelope {error:{code:INTERNAL_ERROR,message:an unexpected error occurred}}
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: still answers 500 for a rejection whose reason is not an Error instance at all
  proves: An error class the map does not name still answers 500, unchanged from today's behavior.
  fails_when: a Fastify route that rejects with a plain string answers with anything other than status
    500
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: never lets an unmapped error's own message or context reach the client
  proves: the implementation's preserved claim that the 500 fallback's fixed, generic message (SEC-04)
    is unchanged by this task
  fails_when: the response body starts containing the unmapped error's own slug or violation text instead
    of only the fixed generic message
not_applicable:
- edge_case: two concurrent calls racing against statusForError or handleUnexpectedError
  why: both are pure, stateless, per-call table lookups with no shared mutable state to race on.
- edge_case: a mapped error class subclassed by another, exercising the iteration-order caveat status-map.ts's
    own doc comment names
  why: none of the seven classes this table maps extends another, so the scenario never arises with the
    classes this task actually names.
- edge_case: additional non-Error input values beyond one representative (null, a number, a plain object)
    passed to statusForError
  why: the function's only branch condition is instanceof Error; a plain string already exercises the
    false side of that one condition.
- edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
  why: statusForError is a synchronous, dependency-free table lookup, and the middleware's consultation
    of it calls out to nothing external.
- edge_case: a duplicate or a uniqueness violation
  why: this module holds no store and enforces no uniqueness invariant.
- edge_case: an operation attempted against state that forbids it
  why: statusForError and handleUnexpectedError are not state-mutating operations.
untested:
- domainEnvelope()'s branch for a mapped error that carries no context object (the false side of hasContext())
  — every one of the seven currently mapped classes declares a context field, so no test exercises the
  envelope shape {code, message} without a details key; the branch is unreachable with today's status
  map, but nothing prevents an eighth mapped class without context from reaching it in the future.
---

## What it is

Sixteen tests across two files, proving statusForError's own seven-way mapping table and error-handler.middleware.ts's own consultation of it, composed from direct reading of tests already written before a context compaction earlier in this session.

## Notes

None.
