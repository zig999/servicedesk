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
  - aggregate/knowledge/cases
  - definition/knowledge/draft-case
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/glossary/subject-type
  - rule/knowledge/concept-accepts-the-declared-subject-type
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check reads the declared subject type and the concepts the case's hypotheses collect; what sets the version is not on that path."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "What the hash is computed over does not enter the acceptance comparison; the check refuses or passes the same case content either way."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "The fallback resolution carries an outcome and a referral, not collected concepts, so which resolution it holds is outside what this check reads."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check reads a concept's accepts list only; the ttl is the subject of a different check."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "Acceptance is decided by comparing the declared subject type with the concept's accepts entries by identity, so the check is indifferent to which names the closed vocabulary holds."
---

## What it is
The vocabulary check standing behind the base's statement that a case cannot ask for a fact that does not apply to what it investigates.
A refusal decided by pairing each collected concept with the one subject type the case declares.

## Notes

The check reads what the glossary records for a concept through the shared lookup rather than restating it.
BLOCKING, from the binding — the base decides acceptance is a direct match against the concept's declared accepts entries, since deriving one subject from another is the anticorruption layer's work and never the case's; no criterion refuses a case whose collected concept accepts only a type derivable from the declared one, so a derivational implementation passes all three.
BLOCKING, from the binding — the contract checks run over the whole case and concepts are collected per hypothesis, yet no criterion places the non-accepting concept in a hypothesis other than the first, so a check reading only the first hypothesis satisfies all three.
From the binding — the case under edit is what this check reads, so the executor reads the curator-written shape and not the version or hash publication assigns.
From the binding — that the named terms exist in the glossary at all is a neighbouring check, deliberately unbound here.
