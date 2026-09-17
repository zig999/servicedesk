---
target: frontend
title: Proof for narrowing the glossary vocabulary union
summary: Tests pin GlossaryVocabulary to exactly outcome, action, recipient and subject-type, prove subject-attribute
  is a compile-time rejection, and keep the empty-page and isError cases alive on a surviving vocabulary.
implementation: sha256:7cc6ec56ae3d8588e75a75a056ecbff373d2fb348ddbfec994a18427180d1df3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-union-compose-subject-hook-suite-2
tests:
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: refuses a fifth, unheld vocabulary name at compile time
  proves: GlossaryVocabulary admits exactly "outcome", "action", "recipient" and "subject-type"; passing
    "subject-attribute" is a type error; no vocabulary name the hook can be asked for is one the glossary
    does not hold.
  fails_when: the literal "subject-attribute" type-checks as a GlossaryVocabulary again, making the @ts-expect-error
    directive unused and failing the type check
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: it.each — still issues a GET to /v1/glossary/$vocabulary and maps its own terms to {value, label}
    options, unaffected by the fifth vocabulary's removal
  proves: The hook's options mapping and isLoading shape are unchanged for every surviving vocabulary.
  fails_when: the GET path or the mapped options differ from before for any surviving vocabulary
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: returns an empty options array, rather than throwing or leaving it undefined, when the page holds
    no terms yet
  proves: The hook's own spec still exercises an empty-page case, re-pointed to a surviving vocabulary.
  fails_when: useGlossaryVocabularyOptions("outcome") throws or returns non-empty options on an empty
    page
- file: src/hooks/use-glossary-vocabulary.spec.ts
  name: reports isError, with options staying empty, when the request fails
  proves: The hook's own spec still exercises an isError case, re-pointed to a surviving vocabulary.
  fails_when: useGlossaryVocabularyOptions("outcome") does not report isError:true on a rejected fetch
not_applicable:
- edge_case: two concurrent renderHook instances, or a refetch()-triggered overlapping request
  why: no criterion states concurrent or refetch-triggered behavior, and this task did not touch the hook's
    body
- edge_case: a vocabulary literal other than "subject-attribute" that the union also no longer admits
  why: criterion 2 names exactly that literal; TypeScript's exhaustiveness makes every other excluded
    literal behave identically
- edge_case: case or whitespace variants of a vocabulary name
  why: no criterion or node states behavior for such variants
untested:
- Criterion 4's 'no second glossary-options hook is introduced' is a fact about the file set, confirmed
  by direct inspection rather than a test that would fail the day a legitimate sibling hook is added.
- Criterion 3's 'no case in it names subject-attribute' is a fact about the spec file's own test titles,
  confirmed by direct reading rather than a test asserting the file's own source text.
- 'domain/investigation/subject-attribute-value: its full identity spans a value object''s shape and two
  other rules this task does not implement; this task''s own tests decide only the narrower fact that
  the union no longer lists the term.'
- 'rules/glossary/a-glossary-read-by-an-unheld-name-is-refused: both refusal clauses reach no criterion
  of this task per its own REMAINDER note and belong to the already-delivered backend read.'
---

## What it is

Four tests proving every testable criterion of task/glossary-vocabulary-reduction/narrow-the-glossary-vocabulary-union.

## Notes

None.
