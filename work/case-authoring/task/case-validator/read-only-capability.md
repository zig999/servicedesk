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
  - node: aggregate/knowledge/cases
    digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/integration/capability
    digest: sha256:80676c92ef8286fcfba04996c1672bef02ef9ec1426f7baa9ec4b2a79ed95a3b
  - node: rule/knowledge/every-collected-concept-has-a-read-only-capability
    digest: sha256:a675657d26c23639438a7eb06b4d1204c4ba9898042bd05974251f622f1e4b80
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
