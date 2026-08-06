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
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - definition/integration/capability
  - rule/knowledge/every-collected-concept-has-a-read-only-capability
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
unresolved:
  - question: "The bound rule's statement requires the answering capability to be one declaring an output schema, but the capability node declares no attribute holding an output schema and no gap naming the absence — where a capability's output schema is declared, so a check can read that it exists, is a fact no node holds."
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check decides capability coverage over what a case collects; how publication derives the version identifies the published value and is never read by this decision."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl bears on the check that every collected concept declares a ttl, a separate refusal; deciding whether a read-only capability answers a concept never reads the ttl or its unit."
  - gap: definition/integration/capability#attributes.timeout.unit
    why: "This check at most reads that a registered capability declares a timeout, never its magnitude; the unit bears on invoking the capability, and criterion 4 states this check invokes nothing."
---

## What it is
The check that holds the contract between curated knowledge and integration at the moment a case is validated.
A refusal decided from what is recorded about a capability, never from calling one.

## Notes

The last criterion is what the base's statement that the contract is checked when publishing and not when running amounts to as an observable property of this check.
UNDERDETERMINED, from the binding — the bound rule requires the registered capability to be read-only and to declare an output schema and a timeout, and no criterion reaches the last two clauses; what passes is a check refusing exactly on absence or non-read-only nature and never testing that the capability declares an output schema and a timeout, which the rule's statement refuses.
From the binding — criterion 2 tests a state the base's registry never admits, since the capability's nature enum holds only read-only and its rule says the registry refuses any other; a registered non-read-only capability exists to this check only as data presented as the registry boundary describes it, so the nature test is the base's own belt-and-braces, demonstrable against presented records and never observable through a registry the base holds honest.
From the binding — this check runs inside the validation the every-refusal rule governs, a candidate not bound here; the aggregation and the safety over a malformed case sit with the validation-run task, and this task's implementation meets them as a condition of the seam.
