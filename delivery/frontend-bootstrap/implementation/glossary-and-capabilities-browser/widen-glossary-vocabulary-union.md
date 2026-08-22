---
title: Widen GlossaryVocabulary to accept subject-attribute
summary: GlossaryVocabulary gains "subject-attribute" as a fifth member, letting useGlossaryVocabularyOptions
  request GET /v1/glossary/subject-attribute through the same {value, label} mapping already used for
  the other four vocabularies, with no change to any existing call site.
task: sha256:d98abacc85ff0f8bd3912f49651120419fe3fb079a5a48876642da5b0fc56e5a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-and-capabilities-browser-onda-6-full-suite
files:
- path: src/hooks/use-glossary-vocabulary.ts
  effect: 'Widened the GlossaryVocabulary union type from "outcome" | "action" | "recipient" | "subject-type"
    to also include "subject-attribute", and rewrote the type''s header comment to name domain/glossary/subject-attribute
    as a fifth vocabulary the route already serves. Nothing else in the file changed: the hook''s query
    function, its GlossaryTermsPage read-shape, its {value, label} option mapping and its {options, isLoading,
    isError, refetch} return shape are untouched, so every existing caller keeps compiling against the
    same runtime behavior.'
criteria:
- criterion: GlossaryVocabulary's type declaration includes "subject-attribute" as a fifth member, alongside
    the existing "outcome", "action", "recipient" and "subject-type".
  met: true
  how: The union literal in use-glossary-vocabulary.ts now lists all five string literals; "subject-attribute"
    is a plain addition, not a replacement of any existing member.
- criterion: Calling useGlossaryVocabularyOptions("subject-attribute") issues a GET request to /v1/glossary/subject-attribute
    and returns that page's data as Select options, using the same {value, label} mapping the hook already
    applies to its other four vocabularies.
  met: true
  how: The hook's queryFn builds its URL as `/v1/glossary/${vocabulary}` and its queryKey as ["glossary",
    vocabulary] for whatever vocabulary is passed; neither the URL template, the query key shape, nor
    the term.name -> {value, label} mapping branches on which vocabulary was requested, so "subject-attribute"
    flows through the identical path the other four vocabularies already use.
- criterion: Every existing call site of useGlossaryVocabularyOptions ("outcome", "action", "recipient",
    "subject-type") still compiles and behaves unchanged.
  met: true
  how: The change only adds a member to a union type and does not alter the function signature, the shape
    of GlossaryVocabularyOptions, or any line of the function body; a caller passing one of the original
    four string literals is still a valid, unchanged call.
nodes:
- node: domain/glossary/subject-attribute
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  how: This task makes the vocabulary itself, already modeled as a value-object with one required name
    attribute, requestable from the frontend by name; the type widening is the frontend's acknowledgment
    that this vocabulary exists and is read the same way as concept, subject-type, outcome, action and
    recipient.
- node: contracts/glossary/glossary-query
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  how: The hook already implements this contract's list-vocabulary-terms operation for four vocabularies
    via GET /v1/glossary/{vocabulary}; widening the union lets the same operation be invoked for the fifth
    vocabulary the backend's route already serves.
preserved:
- useGlossaryVocabularyOptions's function signature, return shape ({options, isLoading, isError, refetch}),
  queryKey shape (['glossary', vocabulary]), URL template (`/v1/glossary/${vocabulary}`), and term.name
  -> {value, label} mapping are all unchanged, so use-hypothesis-revision-form.ts, use-edit-draft-version-form.ts,
  use-new-draft-version-form.ts, case-version-editor-form-fields.tsx, hypothesis-revision-form-fields.tsx
  and release-checklist.ts keep compiling and behaving exactly as before.
---

## What it is
The one-line type widening the hook's own header comment already anticipated, closing the gap the scope's finding #1 identified: the backend's TERM_VOCABULARIES already serves subject-attribute, but the frontend's own union had never named it.
Nothing in this task renders anything; it only makes the fifth vocabulary requestable through the hook the Glossary Browser screen depends on.

## Notes
None.
