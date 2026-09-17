---
title: Remove the leftover SubjectAttribute type alias
summary: terms.ts no longer exports a SubjectAttribute type, since no governed subject-attribute vocabulary exists any more.
rationale: A one-line removal with no other file affected; its own task because it shares no file and no behavior with the other three corrections. Ungoverned by the specification and implements nothing — no node models a subject-attribute vocabulary any more, so there is no fact for this task to implement; the type alias itself was never a domain fact, only a leftover the original removal missed.
sources:
- intake/scope.md
objective: terms.ts exports no type implying a governed subject-attribute vocabulary still exists.
criteria:
- terms.ts no longer declares or exports a SubjectAttribute type.
- No file in src/ imports SubjectAttribute from terms.ts.
- TERM_VOCABULARIES and every other export of terms.ts are unchanged.
- src's test suite passes.
---

## What it is
`export type SubjectAttribute = GlossaryTerm;` (between SubjectType and Outcome) leaves terms.ts.

## Notes
None.
