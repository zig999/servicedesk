---
target: backend
title: Remove the leftover SubjectAttribute type alias
summary: terms.ts no longer exports a SubjectAttribute type, since no governed subject-attribute vocabulary
  exists any more.
task: sha256:98b60f53782fa3d7691d5062c69603a3b7aa5e5ba91263885ffba926910b7429
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
files:
- path: src/glossary/terms.ts
  effect: No longer declares or exports the SubjectAttribute type alias; GlossaryTerm, SubjectType, Outcome,
    Action, Recipient, TERM_VOCABULARIES, TermVocabulary, Concept, ConceptRegistration, DEFAULT_CONCEPT_TTL_SECONDS
    and NON_CONCLUSION_OUTCOMES are unchanged.
criteria:
- criterion: terms.ts no longer declares or exports a SubjectAttribute type.
  met: true
  how: The line export type SubjectAttribute = GlossaryTerm; is removed.
- criterion: No file in src/ imports SubjectAttribute from terms.ts.
  met: true
  how: A whole-tree grep for the word-bounded identifier SubjectAttribute found no import of it from terms.ts
    (only SubjectAttributeValue, a distinct type, and substring matches).
- criterion: TERM_VOCABULARIES and every other export of terms.ts are unchanged.
  met: true
  how: Only the single alias line was removed; every other export reads exactly as before.
- criterion: src's test suite passes.
  met: true
  how: Confirmed by run/backend-corrections-suite-2 — install, typecheck, lint, secret-scan, test-unit
    and test all passed.
---

## What it is

See summary.

## Notes

None.
