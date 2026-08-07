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
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: rule/knowledge/the-body-does-not-change-what-is-collected
    digest: sha256:484135503755b64ba08db05907a618f768d07c641ae04e73486ce9bb668d1586
  - node: rule/knowledge/the-content-hash-covers-the-whole-file
    digest: sha256:4874d358e10ea040974b075a80a5ef12ff4e9c77dae165ac048df88aa5ae7728
  - node: process/investigation/diagnose
    digest: sha256:25781babbd7341fb729a47fbe394207b61a38b62b92ac9800bd2633cfd3a09a3
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
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
