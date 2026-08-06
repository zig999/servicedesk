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
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - rule/knowledge/the-body-does-not-change-what-is-collected
  - rule/knowledge/the-content-hash-covers-the-whole-file
  - process/investigation/diagnose
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "The answer this task demonstrates is the set of concepts read from the case's structured hypotheses; how the version value is set does not change which concepts those declarations name, and criterion 5's two-case distinctness rests on the content hash, which the content-hash rule settles without the version."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl's unit governs how stale a collected fact may be during an investigation, not whether a concept is a member of the set the case's hypotheses collect; no criterion of this task reads a ttl."
---

## What it is
The first of the three behaviours the scope named, computing what an investigation of this case would have to collect.
The answer as a set over the case's hypotheses, so a concept two hypotheses need is collected once.
The demonstration that the case's free text takes no part in the answer.

## Notes

The criterion about the body is what the base's rule about the body amounts to in a behaviour rather than in a check, since a set computed only from the structured part cannot move when the body moves.
REMAINDER, from the binding — the curator prose rule's second clause, that anything changing what is collected must be structured instead, is an obligation on how a case is authored and validated, and no criterion of this task exercises it; it belongs to the authoring and validating of a case's structured form.
REMAINDER, from the binding — the content-hash rule grounds criterion 5's premise, two files identical in structure and differing in body text being two published cases, but the clause requiring the hash to be computed over the whole file reaches no criterion here; it belongs to the act of publishing and identifying a case, which this plan does not hold.
REMAINDER, from the binding — the diagnose process holds the exact fact the objective states, the plan of collection as the union of what the hypotheses collect with every concept once, and its other stations reach no criterion of this task; they belong to the investigation-flow tasks outside this plan.
From the binding — the evidence definition, unbound, independently states exactly one evidence per concept in an investigation, the downstream mirror of this task's each-concept-once answer; the two agree and nothing here depends on the evidence side.
