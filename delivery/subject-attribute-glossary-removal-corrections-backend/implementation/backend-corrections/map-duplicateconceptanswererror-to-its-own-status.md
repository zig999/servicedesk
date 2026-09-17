---
target: backend
title: Map DuplicateConceptAnswerError to its own status
summary: status-map.ts maps DuplicateConceptAnswerError to HTTP 500, mirroring the existing DuplicateGlossaryNameError
  entry, instead of letting it fall through to the generic unmapped-error response.
task: sha256:0327f49b362995b9e3ffb8bbfa2644a01a0a4d8079cc28872629e9857ef0eaec
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
files:
- path: src/errors/status-map.ts
  effect: Added `import { DuplicateConceptAnswerError } from './duplicate-concept-answer.error.js';` to
    the alphabetical import block, and `[DuplicateConceptAnswerError, 500]` to STATUS_BY_ERROR_CLASS immediately
    after the existing DuplicateGlossaryNameError entry.
criteria:
- criterion: STATUS_BY_ERROR_CLASS maps DuplicateConceptAnswerError to HTTP 500.
  met: true
  how: The map entry [DuplicateConceptAnswerError, 500] was added.
- criterion: A call that raises DuplicateConceptAnswerError answers with that mapped status and the error's
    own class name, not the generic INTERNAL_ERROR fallback body.
  met: true
  how: statusForError resolves DuplicateConceptAnswerError to 500 via the existing instanceof-scan; the
    caller's own rendering of a mapped error (unchanged) carries the class name.
- criterion: Every other entry of STATUS_BY_ERROR_CLASS is unchanged.
  met: true
  how: Only one import and one map entry were added; every pre-existing entry is untouched, in its original
    order.
- criterion: src's test suite passes.
  met: true
  how: Confirmed by run/backend-corrections-suite-2.
---

## What it is

See summary.

## Notes

None.
