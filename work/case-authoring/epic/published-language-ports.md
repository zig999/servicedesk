---
title: The ports into the published language and the capability registry
summary: The read-only interfaces through which the authoring context asks the glossary what a term is and the integration registry what answers a concept.
rationale: The decomposition cut these interfaces into their own epic because the glossary and the integration registry belong to other contexts, and a task that declared one of those interfaces and consumed it in the same breath would be two tasks joined by a dependency anyway. The claim grew by the two rules that decide what each interface may answer — exact matching on a lookup, and the single nature a registered capability may carry. It grew a second time by the two rules commit a50f278 added over the registry itself, which decide how a concept is named to it and how many capabilities it may answer with.
sources:
  - intake/scope.md
  - intake/scope-2026-08-07.md
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
  - rule/integration/a-registry-lookup-names-a-concept-exactly
  - rule/integration/one-capability-answers-one-concept
---
## What it is

Two declared interfaces the authoring context reads through and does not implement.
One answers what the glossary registers and what a concept declares, matching a name exactly and normalising nothing.
The other answers which capability answers a concept and what that capability declares, matching the concept's name exactly and answering at most one.

## Notes

The claim grew by two nodes, both added by commit a50f278, and both over the capability registry rather than the glossary.
`rule/integration/a-registry-lookup-names-a-concept-exactly` grew it because the capability port carried as an underdetermined seam how a concept name is compared against what the registry holds, and the base now fixes that comparison character for character.
`rule/integration/one-capability-answers-one-concept` grew it because the same port carried as an underdetermined seam whether a concept may answer with several registered capabilities, and the base now states the registry holds at most one.
Nothing the commit added bears on the glossary port, whose criteria stand as cut.
`definition/knowledge/check-unavailable` is `epic/case-publication`'s claim and stays there, although the capability port must tell a concept with no registered capability apart from a registry that could not be consulted; the distinction is stated as a condition on the interface here and the construct it feeds is claimed where publication answers with it.
The checks that consume these interfaces are cut in the validation and publication epics, so an interface and its consumer never change in one task.
Nothing in this epic reads a store; each interface is exercisable through a stand-in.
