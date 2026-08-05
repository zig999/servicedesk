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
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - rule/knowledge/every-collected-concept-declares-a-ttl
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "The rule's statement ends in the glossary, but no bound node states how a concept a case names is resolved to its glossary entry: a hypothesis binds what it collects by identity, so the case carries names and not entries, and what the check reads the declared ttl from is unstated."
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check decides only on the presence of the concept's declared ttl and compares no ttl against another, and the rule's body states the declared ttl is already the strictest tolerance among the cases that use the concept, so no duration is interpreted, converted or ordered here."
---

## What it is

The vocabulary check standing behind the base's statement that how stale a fact may be is stated by the concept.
A refusal decided by the presence of the concept's declaration, read through the shared glossary lookup.

## Notes

The third criterion bounds the check to presence, so nothing here interprets or converts a declared duration.
BLOCKING, from the binding — the construct a pre-publication check reads is the case under edit, which this epic does not claim and whose shape beyond its slug the base declares absent, so the thing this check refuses is described by no node the task may bind.
From the binding — the concept declares its ttl as required, while criterion 1 needs an input concept declaring none, so the executor must model the check's input as unvalidated glossary data rather than from the definition's required attribute, which would make the check a no-op.
