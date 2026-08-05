---
title: "What a published case collects"
summary: "The union of the concepts the case's hypotheses collect, each concept once, answered from the case's structured declarations alone."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A published case answers with the set of concepts its hypotheses collect, each concept present once however many hypotheses collect it."
criteria:
  - "A concept collected by exactly one hypothesis appears in the answer."
  - "A concept collected by two hypotheses appears once in the answer."
  - "A case whose hypotheses collect disjoint sets answers with every concept every hypothesis collects."
  - "No concept absent from every hypothesis of the case appears in the answer."
  - "Two cases whose structured hypotheses are identical and whose body text differs answer with the same set of concepts."
depends_on:
  - task/published-case/case-structure
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - process/investigation/diagnose
  - rule/knowledge/the-body-does-not-change-what-is-collected
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The task answers with which concepts the case collects, identified by name, and a hypothesis binds what it collects by identity, so membership and de-duplication are decidable without the ttl; the ttl states how stale the fact behind a concept may be, which bears on collecting and caching evidence, a path none of the five criteria touches."
---

## What it is

The first of the three behaviours the scope named, computing what an investigation of this case would have to collect.
The answer as a set over the case's hypotheses, so a concept two hypotheses need is collected once.
The demonstration that the case's free text takes no part in the answer.

## Notes

The task survives the amendment as itself, because the blocking note against it was that the union-and-once semantics its criteria already state sat outside the epic's claim, which the grown claim settles.
The criterion about the body is what the base's rule about the body amounts to in a behaviour rather than in a check, since a set computed only from the structured part cannot move when the body moves.
From the binding — the union-and-once semantics is stated only in the body of the diagnose process, which is why that node is bound here despite its remaining stations sitting outside this task.
From the binding — the base decides that resolving is the case's own behaviour rather than a structure something else walks, and no criterion falsifies that, so a caller walking the hypotheses itself would satisfy all five criteria while departing from the bound node.
From the binding — the second clause of the curator prose rule, that anything changing what is collected must be structured instead, is an authoring obligation and reaches no criterion here.
