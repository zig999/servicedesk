---
title: "A case names only published terms"
summary: "The check that refuses a case naming a term the glossary does not publish under the kind the case uses it as."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case naming any term the published glossary does not publish under the kind the case uses it as is refused by this check, and a case whose every named term is so published is not refused by it."
criteria:
  - "A case collecting a concept the glossary does not publish is refused by this check."
  - "A case whose resolution names an outcome the glossary does not publish is refused by this check."
  - "A case whose referral names an action the glossary does not publish is refused by this check."
  - "A case whose referral names a recipient the glossary does not publish is refused by this check."
  - "A case declaring a subject type the glossary does not publish is refused by this check."
  - "A case whose every named term the glossary publishes under the kind the case uses it as is not refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/case-structure
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/concept
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/knowledge/case-terms-exist-in-the-glossary
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "Membership of a concept name in the registry is decided without reading its ttl, and the ttl is the subject of a separate check with its own task."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "This check decides whether the subject type a case declares is among whatever the vocabulary publishes, never comparing against a base-stated list."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The check decides membership of a named outcome in the vocabulary the glossary holds, and the node states the vocabulary is contributed to and registers each new outcome, so the unenumerated remainder changes no case it refuses."
  - gap: definition/glossary/action#attributes.name.values
    why: "The check decides whether the action a referral names is among whatever the vocabulary publishes; which actions exist is the vocabulary's content rather than an input to the comparison."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The check decides whether the recipient a referral names is among whatever the vocabulary publishes; the unnamed operational queues are the vocabulary's content."
---

## What it is

The vocabulary check standing behind the base's statement that a case speaks only the published language.
One refusal covering every position in which a case names a term, so nothing a case names is invented in place.

## Notes

The criteria enumerate the positions a case names terms in, not the terms themselves, because the members of each vocabulary are the glossary's to publish.
The check decides against the glossary it is given through the shared lookup and holds no vocabulary of its own.
BLOCKING, from the binding — the construct a pre-publication check reads is the case under edit, which this epic does not claim and whose shape beyond its slug the base declares absent, so the thing this check refuses is described by no node the task may bind.
From the binding — a resolution is required in two places, on every hypothesis and as the case's fallback, and the criteria distinguish neither, so a check inspecting only hypothesis resolutions would satisfy all six while the fallback goes unchecked.
From the binding — the base says a term must exist in the glossary and gives no term a publication state of its own, so does not publish must be read as holds no entry for.
