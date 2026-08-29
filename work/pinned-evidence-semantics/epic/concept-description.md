---
title: Concept vocabulary carries a description
summary: The glossary's concept vocabulary gains a required description — refused
  missing at registration, tolerated absent on a legacy row, and returned wherever
  a concept is read.
rationale: Split from evidence/judgment because it has its own reason to change (the
  glossary's own write-time refusal and read-time surface) and is independently demonstrable
  without either — a concept's description exists and is enforced whether or not anything
  ever collects that concept.
covers:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- scenarios/glossary/a-concept-with-no-description-is-refused
- rules/glossary/a-description-states-meaning-never-policy
- rules/glossary/a-vocabulary-holds-each-name-once
- rules/integration/one-capability-answers-one-concept
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- scenarios/knowledge/a-subject-mismatch-refuses-the-case
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-collected-concept-declares-a-ttl
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
uncovered:
- node: rules/glossary/a-description-states-meaning-never-policy
  why: A description's own content — meaning versus decision — is a content-quality
    convention no code path can check; nothing here validates a string's semantics.
- node: rules/glossary/a-vocabulary-holds-each-name-once
  why: The duplicate-name guarantee (assertUniqueNames) is keyed on name alone; adding
    description touches no code this rule governs.
- node: rules/integration/one-capability-answers-one-concept
  why: The one-capability-per-concept resolution is unaffected by a concept gaining
    a description; no task in this plan touches that binding.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: Subject-type acceptance is unrelated to a concept's description; no task changes
    that check.
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  why: This scenario exercises subject-type mismatch, not description; unaffected
    by this scope.
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  why: The unheld-name refusal mechanism is unchanged; only the shape of a held answer
    grows by one field.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Term-existence validation at case authoring is unrelated to a concept's own
    description.
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  why: The ttl default and requirement are untouched by this scope; only description
    gains a write-time rule.
sources:
- intake/scope.md
---

## What it is
The concept vocabulary's write path refuses a registration naming no description.
The concept vocabulary's persisted store carries that description, tolerant of a row written before this rule existed.
The concept vocabulary's read path returns that description wherever a concept is read.

## Notes
None.
