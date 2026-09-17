---
title: Glossary vocabulary reduction
summary: The frontend's own set of browsable and readable glossary vocabularies, once subject-attribute is no longer one the glossary publishes.
rationale: The scope listed twenty candidate files without cutting epics, so this seam is mine — the browsable-vocabulary set and the vocabulary union typing every read of it change for one reason, which vocabularies the glossary publishes, a different reason from anything about what an operator may put on a simulated subject.
sources:
- intake/scope.md
covers:
- domain/investigation/subject-attribute-value
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- rules/glossary/a-vocabulary-holds-each-name-once
- contracts/investigation/glossary-source
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
uncovered:
- node: rules/glossary/a-vocabulary-holds-each-name-once
  why: The duplicate-name refusal is the published read's own HTTP 500, and nothing in the frontend holds a vocabulary's name set or reads it for duplicates; the node reaches this plan only because its constrains list no longer names a subject-attribute vocabulary, which the frontend observes rather than implements.
- node: contracts/investigation/glossary-source
  why: This contract's one consumed operation is read-concept, and no task of this plan touches a concept read — the glossary browser's Concepts tab and its ConceptsPanel stand exactly as delivered.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: The inventory found the connector-test panel's attribute names come from the registered configuration's own placeholder tokens and its only glossary read is the surviving subject-type vocabulary, so this removal reaches no file that implements the test action.
---

## What it is
The two places the frontend still names subject-attribute as a glossary vocabulary: the glossary browser's own tab set and the vocabulary union every read is typed by.
The surviving vocabularies — concepts, subject types, outcomes, actions, recipients — stay exactly as delivered, including each panel's own empty and load-error message.

## Notes
The connector-test panel and its two specs sit in this epic's subject matter but touch none of its work: the inventory found one of its own test descriptions naming a since-superseded rule id, which is prose rather than evidence of a glossary read.
Both of this epic's tasks stop the frontend from ever asking for a vocabulary the glossary does not hold, which is the non-refusal side of a-glossary-read-by-an-unheld-name-is-refused and never a claim that any read succeeds.
