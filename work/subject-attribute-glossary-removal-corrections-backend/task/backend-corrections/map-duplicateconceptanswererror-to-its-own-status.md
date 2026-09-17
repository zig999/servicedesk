---
title: Map DuplicateConceptAnswerError to its own status
summary: status-map.ts maps DuplicateConceptAnswerError to HTTP 500, instead of letting it fall through to the generic unmapped-error response.
rationale: A one-map-entry fix isolated to status-map.ts; its own task because it shares no file with the other three corrections. Ungoverned by the specification and implements nothing — no node states what status a duplicate concept-answer error carries; the fix restores this already-named error class to the map it should always have been in, a defect in already-delivered code rather than a fact this task states against a node.
sources:
- intake/scope.md
objective: A concept read that finds two capabilities answering it is refused with a named status, not the generic unmapped-error fallback.
criteria:
- STATUS_BY_ERROR_CLASS maps DuplicateConceptAnswerError to HTTP 500.
- A call that raises DuplicateConceptAnswerError answers with that mapped status and the error's own class name, not the generic INTERNAL_ERROR fallback body.
- Every other entry of STATUS_BY_ERROR_CLASS is unchanged.
- src's test suite passes.
---

## What it is
`import { DuplicateConceptAnswerError } from './duplicate-concept-answer.error.js'` and `[DuplicateConceptAnswerError, 500]` are added to status-map.ts, mirroring the existing DuplicateGlossaryNameError entry.

## Notes
None.
