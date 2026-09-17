---
target: frontend
title: Narrow the glossary vocabulary union
summary: The GlossaryVocabulary union in use-glossary-vocabulary.ts admits only outcome, action, recipient
  and subject-type; the hook's options mapping, isLoading, isError and refetch shape are unchanged.
task: sha256:ec5b51476d43c0fe1fdcdc5df861b1d77fc15adfbfb5856d987a2846e215e65f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-union-compose-subject-hook-suite-2
files:
- path: src/hooks/use-glossary-vocabulary.ts
  effect: Dropped the "subject-attribute" literal from the GlossaryVocabulary union, leaving exactly "outcome"
    | "action" | "recipient" | "subject-type". The queryKey, fetch path, options mapping, and the isLoading/isError/refetch
    shape returned by useGlossaryVocabularyOptions are unchanged.
- path: src/hooks/use-glossary-vocabulary.spec.ts
  effect: Removed the "subject-attribute" describe block; added a compile-time-rejection test (@ts-expect-error
    passing "subject-attribute") and re-pointed the empty-page and isError cases to "outcome", preserving
    coverage of both states.
criteria:
- criterion: GlossaryVocabulary admits exactly "outcome", "action", "recipient" and "subject-type".
  met: true
  how: The union's type alias now lists exactly those four string literals.
- criterion: Passing the literal "subject-attribute" to useGlossaryVocabularyOptions is a type error rather
    than a call the frontend can express.
  met: true
  how: '"subject-attribute" is no longer a member of GlossaryVocabulary; proven by the spec''s own @ts-expect-error
    test.'
- criterion: The hook's own spec exercises only vocabulary names the narrowed union admits, and no case
    in it names "subject-attribute".
  met: true
  how: The "subject-attribute" describe block was removed; the string appears only inside the compile-error
    test's own assignment, never in a test title.
- criterion: The hook's options mapping, isLoading, isError and refetch shape are unchanged for every
    surviving vocabulary, and no second glossary-options hook is introduced.
  met: true
  how: Only the type declaration was edited; the mapping/loading/error/refetch logic is byte-for-byte
    as before, and frontend/app/src/hooks/ holds no second glossary-options hook.
- criterion: No vocabulary name this hook can be asked for is one the glossary does not hold, so this
    rule refuses no read the hook issues.
  met: true
  how: The four surviving members match exactly the vocabulary-holding domain concepts named in rules/glossary/a-glossary-read-by-an-unheld-name-is-refused's
    constrains list.
- criterion: The hook's own spec still exercises an empty-page case and an isError case, each re-pointed
    to a surviving vocabulary rather than dropped, so no coverage of those two states is lost by the narrowing.
  met: true
  how: Both cases were rewritten against "outcome" rather than removed.
nodes:
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  how: The node describes the attribute-name/value pair as free text rather than a governed vocabulary
    term; the union no longer admits "subject-attribute" as a glossary vocabulary, matching that fact.
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  encoded_at:
  - src/hooks/use-glossary-vocabulary.ts
  how: The narrowed union admits exactly the four names the rule's constrains list holds, so no name the
    hook can request is one the glossary does not hold. Per the task's own REMAINDER note, the rule's
    two refusal clauses reach no criterion here — this hook issues a whole-vocabulary listing, never a
    term-by-name or concept read.
preserved:
- The queryKey shape, the fetch path, the options mapping, and the isLoading/isError/refetch return shape
  of useGlossaryVocabularyOptions.
---

## What it is

The "subject-attribute" member removed from the GlossaryVocabulary union, with its spec's literal cases removed or re-pointed to a surviving vocabulary.

## Notes

None.
