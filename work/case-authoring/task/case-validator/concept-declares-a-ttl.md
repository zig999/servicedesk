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
  - rule/knowledge/every-collected-concept-declares-a-ttl
  - definition/glossary/concept
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - rule/knowledge/a-validation-answers-with-every-refusal
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
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
