---
title: "Every collected concept has a read-only capability"
summary: "The check that refuses a case collecting a concept no read-only capability answers, decided where the case is validated and without calling anything."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-revinculacao-cinco-decisoes.md
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
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/integration/capability
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
base: sha256:d196ce9d9e4ee7f02c9a77beaa94aa21caab7c52084e0cc8cd8179fbb099a411
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check reads what a case collects and refuses before publication assigns a version; how the version is derived never enters the decision."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl belongs to the staleness check, a sibling rule with its own task; this check reads only whether a registered read-only capability answers the concept, and never reads the ttl."
  - gap: definition/integration/capability#attributes.timeout.unit
    why: "This check reads that a timeout is declared, never its value — the unit bears on invoking a capability, which criterion 4 forbids this check to do."
---

## What it is
The check that holds the contract between curated knowledge and integration at the moment a case is validated.
A refusal decided from what is recorded about a capability, never from calling one.

## Notes

The last criterion is what the base's statement that the contract is checked when publishing and not when running amounts to as an observable property of this check.
The capability now declares its output schema as an attribute of its own, so the reading the rule demands has a declared place to read — the earlier question over where the schema lives is settled in the base.
UNDERDETERMINED, from the binding — the bound rule refuses a concept with no registered read-only capability declaring an output schema and a timeout, and no criterion reaches the declaring clauses, criterion 3 accepting any read-only capability; what passes is a check refusing on absence or non-read-only nature and accepting a read-only capability without reading that it declares an output schema and a timeout, which the rule's statement refuses.
UNDERDETERMINED, from the binding — no criterion states the comparison under which a collected concept counts as answered by a capability, while the base binds the capability's concept by identity, identity is the name, and the exact-lookup rule records that the whole system compares names one way; what passes is a check matching concept to capability case-insensitively, which the base's exact-name identity refuses.
REMAINDER, from the binding — the concept's clauses beyond the capability one, glossary existence, the ttl, the declared fields and the subject-type acceptance, reach no criterion of this task; they belong to the sibling validation checks, the declared-fields clause backing the citation check of the answering epic.
From the binding — how this check's refusal is shaped and delivered is governed by nodes left unbound here, the every-refusal rule, the refusal construct and the two-positions rule, all of the validation-run's binding; this check must merely be writable under them.
