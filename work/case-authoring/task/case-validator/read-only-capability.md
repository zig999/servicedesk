---
title: "Every collected concept has a read-only capability"
summary: "The check that refuses a case collecting a concept no read-only capability answers, decided where the case is validated and without calling anything."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case collecting a concept that is not answered by a read-only capability is refused by this check, and a case whose every collected concept is answered by a read-only capability is not refused by it."
criteria:
  - "A case collecting a concept that no capability answers is refused by this check."
  - "A case collecting a concept whose answering capability is not read-only is refused by this check."
  - "A case whose every collected concept is answered by a read-only capability is not refused by this check."
  - "Deciding this check over a case invokes no capability."
depends_on:
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/case-structure
nodes:
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
  - definition/integration/capability
  - definition/glossary/concept
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - aggregate/knowledge/cases
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - gap: definition/integration/capability#attributes.output_schema
  - question: "No node describes the construct this check reads. The rule predicates on a capability being registered and the capability node states the registry refuses one whose nature is not read-only, but nothing says how registry membership for a concept is consulted at case validation, which is exactly what criterion 4 requires be done without invoking a capability."
waived:
  - gap: definition/integration/capability#attributes.timeout.unit
    why: "The check decides whether a capability declares a timeout, which is a required attribute; the unit is never compared or elapsed, because nothing here calls a capability."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check reads only which capability answers a collected concept, and the concept's ttl is the subject of a separate check with its own task."
---

## What it is

The check that holds the contract between curated knowledge and integration at the moment a case is validated.
A refusal decided from what is recorded about a capability, never from calling one.

## Notes

The last criterion is what the base's statement that the contract is checked when publishing and not when running amounts to as an observable property of this check.
BLOCKING, from the binding — the rule refuses a case whose concept has no registered read-only capability declaring an output schema and a timeout, and criterion 3 does not reach either clause, so a case whose answering capability declares no output schema is refused by the base and not refused by the criterion.
From the binding — the capability's nature is an enum whose only value is read-only and the registry refuses anything else, so demonstrating criterion 2 requires a state the base cannot represent, and the node that decides that refusal is outside this task's binding.
From the binding — the refusal this check names is a publication-time refusal, and the publish act itself lives in the publication lifecycle, outside this epic's claim.
