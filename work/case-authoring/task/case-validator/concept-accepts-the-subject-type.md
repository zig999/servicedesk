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
  - rule/knowledge/concept-accepts-the-declared-subject-type
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/glossary/subject-type
  - aggregate/knowledge/cases
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
waived:
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "This check compares the subject type the case declares against the entries of the collected concept's accepts list, and subject type identity is its name, so the decision is the same whatever names the vocabulary eventually holds."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check reads only the concept's accepts list, and the ttl obligation is a separate check with its own task."
---

## What it is

The vocabulary check standing behind the base's statement that a case cannot ask for a fact that does not apply to what it investigates.
A refusal decided by pairing each collected concept with the one subject type the case declares.

## Notes

The check reads what the glossary records for a concept through the shared lookup rather than restating it.
BLOCKING, from the binding — the base decides that acceptance is a direct match against the concept's declared accepts entries with no derivation between subject types, and all three criteria are satisfiable by an implementation that accepts a concept whose accepts merely holds a type the declared one could be derived from.
From the binding — the refusal this check names is a publication-time refusal, and the publish act itself lives in the publication lifecycle, outside this epic's claim.
