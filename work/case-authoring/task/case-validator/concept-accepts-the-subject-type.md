---
title: "A collected concept applies to the declared subject type"
summary: "The check that refuses a case collecting a fact that does not apply to the kind of thing the case investigates."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case collecting a concept that does not accept the subject type the case declares is refused by this check, and a case whose every collected concept accepts that subject type is not refused by it."
criteria:
  - "A case collecting one concept that does not accept the case's declared subject type is refused by this check."
  - "A case whose every collected concept accepts the case's declared subject type is not refused by this check."
  - "A case collecting a concept that accepts several subject types including the declared one is not refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/case-structure
nodes:
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: rule/knowledge/concept-accepts-the-declared-subject-type
    digest: sha256:b34df55dd4731914fe21cc0b8be6110b85b53548258aab68f080ba7da0b29e81
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check reads the declared subject type and the concepts the hypotheses collect; what sets a published case's version bears on publication identity, not on whether a collected concept accepts the subject type."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl says how stale a concept's answer may be; this check consults only the concept's accepts list, and no criterion of this task touches staleness — the ttl check is a sibling rule with its own task."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "The check is a membership comparison by identity between the subject type the case declares and the entries of the concept's accepts list, and it holds unchanged for whatever values the vocabulary comes to hold; which concrete subject types the glossary publishes bears on authoring glossary entries, not on this comparison."
---

## What it is
The vocabulary check standing behind the base's statement that a case cannot ask for a fact that does not apply to what it investigates.
A refusal decided by pairing each collected concept with the one subject type the case declares.

## Notes

The check reads what the glossary records for a concept through the shared lookup rather than restating it.
UNDERDETERMINED, from the binding — the every-refusal rule requires every check to be safe over a malformed case, walking it without failing and refusing nothing, and no criterion of this task poses a malformed case; what passes is an implementation that throws or halts when the case under edit declares no hypotheses, a hypothesis with an empty collects list, or no subject type at all, while meeting every stated criterion.
REMAINDER, from the binding — the every-refusal rule's clauses that a validation runs every check whatever any earlier check decided and answers with every refusal produced reach no criterion of this task; both belong to the validation-run task that composes the checks into one answer.
From the binding — neither the criteria nor the bound rule determine this check's behaviour over a collected concept the glossary does not publish, since such a concept has no accepts list to consult; the refusal for an absent term is owned by the terms-exist check, the every-refusal rule guarantees that check runs regardless, and an implementation that either refuses or ignores an unpublished concept satisfies every criterion, the base excluding neither.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
