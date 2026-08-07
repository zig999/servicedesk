---
title: "A published case's plan of collection"
summary: "collectionPlan() answers the union of concept names a published case's hypotheses collect, each concept once, read exclusively from the case's structured hypotheses."
task: sha256:6f9b7c03fb1d17a0fe1ac2ae74ca11ea7ee14761d2f522848f17de30abd72ec2
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/collection-plan.ts
    effect: "adds collectionPlan(publishedCase), which walks the case's hypotheses in declared order and each hypothesis's declared collects in declared order, appending a concept name to the answer the first time it is seen and skipping it every time after, then returns the result as a frozen array. It reads only hypotheses[].collects off the given Case and touches no other field of it — no title, no when-to-use text, no curator notes"
criteria:
  - criterion: "A concept collected by exactly one hypothesis appears in the answer."
    met: true
    how: "every concept name found while iterating any hypothesis's collects is appended once, on first sight; a name occurring in exactly one hypothesis's list is appended exactly once and is present in the returned array"
  - criterion: "A concept collected by two hypotheses appears once in the answer."
    met: true
    how: "the !concepts.includes(conceptName) guard skips a name already appended, so a second (or later) hypothesis naming the same concept contributes no further entry — the name still appears, exactly once"
  - criterion: "A case whose hypotheses collect disjoint sets answers with every concept every hypothesis collects."
    met: true
    how: "the function iterates every hypothesis of publishedCase.hypotheses and every concept of each one's collects; where the hypotheses' collected sets are disjoint no name is ever seen twice, so none is skipped and every one every hypothesis names is appended"
  - criterion: "No concept absent from every hypothesis of the case appears in the answer."
    met: true
    how: "the returned array is built exclusively from names encountered while walking publishedCase.hypotheses[].collects; nothing else contributes an entry, so a concept named by none of the case's hypotheses is never pushed and cannot appear in the answer"
  - criterion: "Two cases whose structured hypotheses are identical and whose body text differs answer with the same set of concepts."
    met: true
    how: "collectionPlan reads only publishedCase.hypotheses and, within it, only each hypothesis's collects — never title, whenToUse, curatorNotes or any other field. Two Case values whose hypotheses arrays are identical therefore drive the same walk and produce the same array of names regardless of what their body text holds"
nodes:
  - node: definition/knowledge/case
    encoded_at:
      - src/knowledge/collection-plan.ts
    how: "the parameter is typed as the case's own Case shape, and the function reads exactly the one attribute this task's answer is defined over — hypotheses, in the order the case declares it — touching nothing else the definition lists (slug, title, whenToUse, subjectType, the two fallbacks, curatorNotes, version, contentHash)"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/collection-plan.ts
    how: "each hypothesis's own collects — the list of concept names bound by identity that the definition declares as the hypothesis's structured collection requirement — is the only part of a hypothesis this function reads; confirmsWhen and resolution are never touched"
  - node: definition/glossary/concept
    encoded_at:
      - src/knowledge/collection-plan.ts
    how: "concepts are carried and answered by their identity alone (ConceptName, imported from src/glossary/concept.ts), matching the definition's own identity field; none of the concept's other declared attributes (accepts, ttl, observation_fields) is read, which is consistent with this task's waiver of the ttl-unit gap — no criterion here reads a ttl, and the code reads none"
  - node: rule/knowledge/the-body-does-not-change-what-is-collected
    encoded_at:
      - src/knowledge/collection-plan.ts
    how: "the function never reads curatorNotes or any other free-text field of the case — only the structured hypotheses[].collects — so the answer is structurally incapable of moving when the prose moves, which is the rule's statement demonstrated as behaviour (criterion 5) rather than checked as a refusal. The rule's second clause, that anything changing what is collected must be structured instead, is an authoring/validation obligation the task's own binding notes as outside this task's criteria; nothing here enforces or needs to enforce it"
  - node: rule/knowledge/the-content-hash-covers-the-whole-file
    how: "not reached by this delivery, per the task's own REMAINDER note: the rule grounds criterion 5's premise that two files identical in structure and differing in body text are two distinct published cases, but computing or checking that hash belongs to publishing and identifying a case, outside this task. collectionPlan neither computes nor reads contentHash"
  - node: process/investigation/diagnose
    encoded_at:
      - src/knowledge/collection-plan.ts
    how: "implements exactly the one station the task's binding isolates from this process — the case's plan of collection as the union of what its hypotheses collect, every concept once. The process's other stations (evidence, evaluation, assessment, investigation, investigation-completed) are not reached; per the task's REMAINDER note they belong to the investigation-flow tasks outside this plan"
inferences:
  - inferred: "the answer preserves the order in which concept names are first encountered — the case's declared hypothesis order, then each hypothesis's declared collects order — rather than sorting or otherwise reordering the result"
    from: "no criterion or bound node states an order for this answer, only that each concept appears once; the codebase's existing convention (src/knowledge/required-evaluations.ts, and Case/Hypothesis themselves) is to preserve declared order everywhere a list is read back rather than to impose a new one, so the same habit was followed here as the least-invented choice"
  - inferred: "the file sits at src/knowledge/collection-plan.ts, in the same directory as case.ts and hypothesis.ts, named for the task's own slug rather than for a rule identifier"
    from: "the inventory's convention that src/knowledge/ holds one file per base-derived computation over a Case (e.g. required-evaluations.ts for rule/investigation/one-evaluation-per-hypothesis), and required-evaluations.ts's own shape — a single exported function taking a Case and returning a frozen readonly array — which this module mirrors"
deferred:
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/collection-plan.ts has never been type-checked, the same as every other file in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file under src/, not only this one; the inventory and every sibling implementation record already note the same absence"
---

## What it is

The first of the three behaviours the scope named, computing what an investigation of this case would have to collect — the answer as a set over the case's hypotheses, so a concept two hypotheses need is collected once, and the demonstration that the case's free text takes no part in the answer.

## Notes

The criterion about the body is what the base's rule about the body amounts to in a behaviour rather than in a check, since a set computed only from the structured part cannot move when the body moves.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
