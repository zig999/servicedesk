---
title: Status-map module and the middleware that consults it
summary: A new src/errors/status-map.ts keys seven typed domain errors to a non-500 HTTP status, and error-handler.middleware.ts
  now consults it before falling back to 500.
task: sha256:2fdbffb22b657db204f5b22769b52d33d902513fb3aa95a4738c7375c328f55f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-http-status-map-suite-4
files:
- path: src/errors/status-map.ts
  effect: 'Declares the one COR-04 table: a ReadonlyMap from each of seven typed domain error classes
    (CaseNotFoundError, CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError,
    CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError, ManifestWouldHoldNoHypothesisError)
    to an HTTP status (404, 409, 409, 409, 409, 422, 422 respectively), and exports statusForError(error:
    unknown): number | undefined, which narrows to Error, walks the table with instanceof, and returns
    undefined for anything the table does not name.'
- path: src/http/error-handler.middleware.ts
  effect: 'handleUnexpectedError now imports statusForError and, after the existing Fastify client-range
    check, narrows the thrown value to Error and consults the status map: a match answers with the mapped
    status through a new domainEnvelope() (code = error.name, message = error.message, details = error.context
    where the error carries one, via a new hasContext() type guard and DomainErrorWithContext type); anything
    the map does not name still falls through to the unchanged 500/INTERNAL_ERROR branch.'
criteria:
- criterion: error-handler.middleware.ts consults the status map instead of answering every thrown error
    with 500.
  met: true
  how: handleUnexpectedError calls statusForError(error) for any thrown value that is not already a Fastify
    client-range error, and answers with the status it returns when it returns one, before ever reaching
    the 500 branch.
- criterion: CaseNotFoundError, CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError,
    CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError
    each resolve to a distinct HTTP status other than 500.
  met: true
  how: Each of the seven is a key of STATUS_BY_ERROR_CLASS in status-map.ts, resolving to 404, 409 or
    422 depending on what the refusal means for the caller (see the inference below for how "distinct"
    was read) — every one specific and non-500, distinguishing it from today's uniform 500 answer.
- criterion: An error class the map does not name still answers 500, unchanged from today's behavior.
  met: true
  how: statusForError returns undefined for any Error not instanceof one of the seven mapped classes (and
    for any non-Error thrown value); handleUnexpectedError's existing fallback branch (500/INTERNAL_ERROR)
    is untouched, so an unmapped error still answers exactly as it did.
inferences:
- inferred: 'Each of the seven errors is assigned a status by what its refusal means for the caller, not
    by giving all seven mutually distinct numbers: CaseNotFoundError to 404; CaseAlreadyHasDraftError,
    ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError to 409;
    CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError to 422.'
  from: No specification node and no rule of the project's standard names any numeric status; the standard's
    own elsewhere note states this mapping is the project's own engineering decision. The reading of "distinct"
    as "specific, not 500" rather than "mutually exclusive across all seven" follows from the objective's
    own framing and criterion 3's binary shape, together with ordinary REST practice, where several distinct
    business refusals legitimately share one status class.
- inferred: A mapped domain error's response envelope carries the error's own class name as code and its
    own context object as details.
  from: COR-02 already requires every one of these classes to carry a name and a context field; API-05
    requires the envelope to carry a code, a message and its details. No node or existing code states
    a separate wire-code vocabulary for a domain refusal, so reusing the error's own name was the smallest
    addition consistent with the existing clientEnvelope() convention.
preserved:
- error-handler.middleware.ts's existing behavior for a Fastify-native client-range error (isClientError/clientEnvelope)
  is untouched.
- The 500/INTERNAL_ERROR fallback's fixed, generic message for any error the status map does not name,
  so no stack trace or internal detail reaches the client (SEC-04), exactly as before this task.
- build-app.ts's wiring (app.setErrorHandler(handleUnexpectedError)) needed no change, since the function's
  exported signature is unchanged.
- The existing diagnose route's own 400/200 responses (diagnose.routes.ts) are untouched by this task.
---

## What it is

A new src/errors/status-map.ts module maps seven typed domain error classes to a specific HTTP
status; error-handler.middleware.ts now consults it before falling back to 500. This task
implements no specification node, per its own rationale: which numeric status a refusal answers
with is the standard's own COR-04 concern, not a domain fact.

## Notes

None.
