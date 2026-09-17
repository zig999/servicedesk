---
target: backend
title: Proof for mapping DuplicateConceptAnswerError to its own status
summary: Tests that DuplicateConceptAnswerError resolves to HTTP 500 through statusForError and through
  the shared error-handler middleware, naming the error rather than falling into the generic fallback.
implementation: sha256:6302ac43c452af26a9eac57a063221f2980fc387d796dea8ae6b20634dc08273
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves DuplicateConceptAnswerError to 500
  proves: STATUS_BY_ERROR_CLASS maps DuplicateConceptAnswerError to HTTP 500.
  fails_when: statusForError(new DuplicateConceptAnswerError(...)) returns anything other than 500
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: answers DuplicateConceptAnswerError with a named 500 envelope, naming the error rather than falling
    back to the generic, unnamed one
  proves: A call that raises DuplicateConceptAnswerError answers with that mapped status and the error's
    own class name.
  fails_when: a request whose handler rejects with DuplicateConceptAnswerError answers with anything but
    HTTP 500, or a generic error code instead of the error's own class name
not_applicable:
- edge_case: varying the arguments passed to DuplicateConceptAnswerError's constructor
  why: statusForError matches purely by instanceof; the constructor's argument values never change the
    mapped status
- edge_case: an instanceof-ordering conflict between DuplicateConceptAnswerError and another mapped class
  why: DuplicateConceptAnswerError extends Error directly and shares no subtype/supertype relationship
    with any other mapped class
untested:
- Criterion 'Every other entry of STATUS_BY_ERROR_CLASS is unchanged' is not decided by one test since
  the map itself is not exported; most entries carry their own pre-existing test, but several other entries
  carry no test asserting their mapped status -- a pre-existing gap this one-line addition does not close.
- Criterion 'src's test suite passes' is decided by the captured run, not by a unit test in this proof.
---

## What it is

See summary.

## Notes

None.
