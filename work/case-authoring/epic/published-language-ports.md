---
title: The ports into the published language and the capability registry
summary: The read-only interfaces through which the authoring context asks the glossary what a term is and the integration registry what answers a concept.
rationale: The decomposition cut these interfaces into their own epic because the glossary and the integration registry belong to other contexts, and a task that declared one of those interfaces and consumed it in the same breath would be two tasks joined by a dependency anyway. The claim grew by the two rules that decide what each interface may answer — exact matching on a lookup, and the single nature a registered capability may carry.
sources:
  - intake/scope.md
covers:
  - context/glossary
  - context/integration
  - definition/glossary/action
  - definition/glossary/concept
  - definition/glossary/outcome
  - definition/glossary/recipient
  - definition/glossary/subject-type
  - definition/integration/capability
  - rule/glossary/a-lookup-matches-a-published-name-exactly
  - rule/integration/a-capability-is-read-only
---
## What it is

Two declared interfaces the authoring context reads through and does not implement.
One answers what the glossary registers and what a concept declares, matching a name exactly and normalising nothing.
The other answers which capability answers a concept and what that capability declares.

## Notes

The checks that consume these interfaces are cut in the validation and publication epics, so an interface and its consumer never change in one task.
Nothing in this epic reads a store; each interface is exercisable through a stand-in.
