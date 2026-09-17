---
title: Narrow the glossary vocabulary union
summary: The GlossaryVocabulary union and its own spec, holding only the vocabularies the glossary publishes.
rationale: This is the interface both consumer removals sit behind, so it is its own task rather than folded into either — narrowing it alongside one call site would leave the other call site's literal deciding whether the narrowing holds. The hook and its spec are one task because the spec's own cases name the literal being removed, so neither can be shown correct while the other still names it.
sources:
- intake/scope.md
objective: GlossaryVocabulary admits only the vocabularies the glossary publishes, so no frontend read of "subject-attribute" is expressible at all.
criteria:
- GlossaryVocabulary admits exactly "outcome", "action", "recipient" and "subject-type".
- Passing the literal "subject-attribute" to useGlossaryVocabularyOptions is a type error rather than a call the frontend can express.
- The hook's own spec exercises only vocabulary names the narrowed union admits, and no case in it names "subject-attribute".
- The hook's options mapping, isLoading, isError and refetch shape are unchanged for every surviving vocabulary, and no second glossary-options hook is introduced.
- No vocabulary name this hook can be asked for is one the glossary does not hold, so this rule refuses no read the hook issues.
- The hook's own spec still exercises an empty-page case and an isError case, each re-pointed to a surviving vocabulary rather than dropped, so no coverage of those two states is lost by the narrowing.
depends_on:
- task/glossary-vocabulary-reduction/drop-the-subject-attributes-tab-from-the-glossary-browser
- task/composed-subject-attribute-inputs/remove-the-add-attribute-control-from-the-subject-panel
implements:
- domain/investigation/subject-attribute-value
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
---

## What it is
The "subject-attribute" member leaves the GlossaryVocabulary union in use-glossary-vocabulary.ts, and its spec's literal cases leave with it.
The query key, fetch path construction and returned options shape are the reuse this task is held to, not work it redoes.

## Notes
The two edges record what this narrowing builds on — the two call sites that pass the literal today, one in the glossary browser and one in the case-simulation subject panel — and say nothing about when any of the three is done.
REMAINDER, from the specification — both refusal clauses of rules/glossary/a-glossary-read-by-an-unheld-name-is-refused (term-not-held, concept-not-held) reach no criterion of this task; the hook issues a whole-vocabulary listing, never a term-by-name or concept read. Belongs to: the already-delivered backend published glossary read.
ADVISORY, from the specification — the operation this hook actually consumes (the term listing) is stated only by contracts/glossary/glossary-query, outside this epic's covers; the candidate contract in scope, contracts/investigation/glossary-source, declares only read-concept. Criterion 1's enumeration rests on a-glossary-read-by-an-unheld-name-is-refused's constrains list rather than on a node stating the browsable set directly.
Decision, beyond the covers — stand: contracts/glossary/glossary-query is read here only for the background fact its own operations list already states (the term listing this hook consumes); never a claim this task's own criteria need held against it.
