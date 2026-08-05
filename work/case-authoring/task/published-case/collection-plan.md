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
  - process/investigation/diagnose
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - gap: definition/knowledge/case#attributes.content_hash.derivation
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "The answer is read from the case's hypotheses and their collects; what sets the version changes which published case is pinned, never which concepts that case's hypotheses collect, and no criterion names the version."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "The fallback is a resolution \u2014 an outcome and a referral \u2014 and collects no concepts, so which of the two non-conclusion outcomes it carries cannot add to or remove from the union, including under criterion 4."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The answer names which concepts are collected, not how stale their facts may be; membership and the once-only rule go by the concept's name, which is its identity, so the ttl's unit is not on this task's path."
---

## What it is
The first of the three behaviours the scope named, computing what an investigation of this case would have to collect.
The answer as a set over the case's hypotheses, so a concept two hypotheses need is collected once.
The demonstration that the case's free text takes no part in the answer.

## Notes

The task survives the amendment as itself, because the blocking note against it was that the union-and-once semantics its criteria already state sat outside the epic's claim, which the grown claim settles.
The criterion about the body is what the base's rule about the body amounts to in a behaviour rather than in a check, since a set computed only from the structured part cannot move when the body moves.
BLOCKING, from the binding — criterion 5 cannot be demonstrated as written until the content hash's derivation is settled, because the published case is identified by slug, version and content hash, so whether two cases with identical structured hypotheses and differing body text are two published cases at all depends on what the hash is computed over. The rule that prose never changes what is collected holds either way; the criterion's two-case framing is what the gap decides.
From the binding — the union-and-once fact the objective states is held only in the body of the diagnose process, and the case declares no such attribute or behaviour, so that node is bound as the sole holder of the objective's own fact.
From the binding — the second clause of the curator prose rule reaches no criterion here, because it governs authoring and the shape a curator writes lives in the case under edit, which this epic declares uncovered.
From the binding — the outcome and judging paths, the vocabularies, the subject type, the capability and the aggregate are left unbound: none determines the union.
