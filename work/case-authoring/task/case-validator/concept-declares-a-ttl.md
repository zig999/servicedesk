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
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - rule/knowledge/every-collected-concept-declares-a-ttl
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "Criterion 3 confines the check to the presence of a declared ttl and forbids comparing one ttl against another, so no reading of the value \u2014 and therefore no unit \u2014 is on this task's path."
---

## What it is
The vocabulary check standing behind the base's statement that how stale a fact may be is stated by the concept.
A refusal decided by the presence of the concept's declaration, read through the shared glossary lookup.

## Notes

The third criterion bounds the check to presence, so nothing here interprets or converts a declared duration.
BLOCKING, from the binding — the base now distinguishes the case under edit from the published case and states the first is what a publication check refuses, while criteria 1 and 2 say only a case, so an implementer may write the check over the published value the base says already holds.
From the binding — the published case is left unbound and its three open gaps do not reach this objective.
From the binding — a concept resolves to its glossary entry by identity, which the base does hold; a named concept with no entry at all is refused by a neighbouring check this task does not bind.
From the binding — the capability is left unbound, because its timeout is the capability's deadline and not the concept's ttl.
From the binding — this rule declares neither an aggregate nor a consistency, unlike its sibling publication invariants, while its own example locates the refusal at publication; that asymmetry is the base's to keep or correct.
