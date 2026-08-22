---
title: Extend GlossaryVocabulary to accept subject-attribute
summary: The shared GlossaryVocabulary union type and its one hook, useGlossaryVocabularyOptions, accept "subject-attribute" as a fifth vocabulary, exactly as GET /v1/glossary/subject-attribute already answers.
rationale: >-
  Cut as its own task, apart from the Glossary Browser screen, because GlossaryVocabulary and
  useGlossaryVocabularyOptions are a shared interface with real existing consumers outside this
  epic's own screens — use-hypothesis-revision-form.ts, use-edit-draft-version-form.ts,
  use-new-draft-version-form.ts, case-version-editor-form-fields.tsx,
  hypothesis-revision-form-fields.tsx and release-checklist.ts, confirmed by reading the source
  directly. A task changing a shared interface and consuming it in the same breath is two tasks
  joined by a dependency; here the existing consumers make the split sharper still, since none of
  them may observe any behavior change from this widening. This mirrors the plan's own precedent
  for exactly this situation (task/cases-list-and-detail/dev-proxy-for-backend-api's own rationale).
  This is a decomposition choice the scope's prose did not itself spell out at this grain — the
  scope's finding #1 names the technical gap but not the task boundary.
objective: useGlossaryVocabularyOptions can request the glossary's subject-attribute vocabulary, with every existing caller of the hook unaffected.
criteria:
  - GlossaryVocabulary's type declaration includes "subject-attribute" as a fifth member, alongside the existing "outcome", "action", "recipient" and "subject-type".
  - Calling useGlossaryVocabularyOptions("subject-attribute") issues a GET request to /v1/glossary/subject-attribute and returns that page's data as Select options, using the same {value, label} mapping the hook already applies to its other four vocabularies.
  - Every existing call site of useGlossaryVocabularyOptions ("outcome", "action", "recipient", "subject-type") still compiles and behaves unchanged.
implements:
  - domain/glossary/subject-attribute
  - contracts/glossary/glossary-query
sources:
  - intake/onda-6-scope.md
---

## What it is
The one-line type widening the hook's own header comment already anticipates, closing the gap the scope's finding #1 identified: the backend's TERM_VOCABULARIES already serves subject-attribute, but the frontend's own union has never named it.
Nothing in this task renders anything; it only makes the fifth vocabulary requestable through the hook the Glossary Browser screen depends on.

## Notes
None.
