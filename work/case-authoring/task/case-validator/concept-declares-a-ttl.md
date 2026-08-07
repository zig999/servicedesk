---
title: "Every collected concept declares a ttl"
summary: "The check that refuses a case collecting a concept that does not state how stale the fact may be."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case collecting a concept that declares no ttl is refused by this check, and a case whose every collected concept declares one is not refused by it."
criteria:
  - "A case collecting one concept that declares no ttl is refused by this check."
  - "A case whose every collected concept declares a ttl is not refused by this check."
  - "The check decides on the presence of the concept's declared ttl and compares no ttl against another."
depends_on:
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/case-structure
nodes:
  - node: rule/knowledge/every-collected-concept-declares-a-ttl
    digest: sha256:31b0203249035edc85ea0986a0544ca512bc7aa238d2732bdc567f85a6795e44
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check decides only whether a concept declares a ttl at all — criterion 3 states it never reads or compares the value — so the unit of the ttl, which is what this gap leaves open, is never reached by any of the task's criteria."
---

## What it is
The vocabulary check standing behind the base's statement that how stale a fact may be is stated by the concept.
A refusal decided by the presence of the concept's declaration, read through the shared glossary lookup.

## Notes

The third criterion bounds the check to presence, so nothing here interprets or converts a declared duration.
REMAINDER, from the binding — the every-refusal rule is bound for its clause that every check must be safe over a malformed case, while its two statement clauses, that a validation runs every check whatever an earlier one decided and answers with every refusal produced, reach no criterion of this task; they belong to the validation-run task that composes the checks.
UNDERDETERMINED, from the binding — an implementation that fails when handed a malformed case, one declaring no hypothesis or a hypothesis whose collects list is absent, satisfies every criterion as written since all three describe cases that do collect; what passes is a check that walks the hypotheses' collects assuming both exist and errors on a malformed case, while correctly refusing and not-refusing the well-formed cases the criteria name.
From the binding — the task says a case collecting a concept while the rule says every concept a case names, and in the bound base the only structured place a case under edit names a concept is the collects list of its hypotheses, so the two readings coincide and no second naming site exists to diverge over.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
