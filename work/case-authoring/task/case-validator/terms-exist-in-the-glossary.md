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
  - definition/knowledge/draft-case
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/subject-type
  - definition/glossary/concept
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/knowledge/case-terms-exist-in-the-glossary
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check runs at publication over the case as the curator wrote it, and the base states the version is what publication adds and nothing a curator writes carries it \u2014 no criterion reads or refuses on a version."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "Same path \u2014 the hash is assigned by publication, not written by the curator, and this check reads only the terms the case names."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "This check verifies that whatever outcome the fallback names is published under the outcome vocabulary; it never selects the fallback, and both non-conclusion outcomes are registered, so either satisfies criterion 6."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "The check decides membership by the vocabulary's name identity against the registry, so it needs no enumerated subject type \u2014 a name absent from the vocabulary is refused and a registered one is not, whatever the vocabulary later holds."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The ttl's unit bears on the separate check that a named concept declares a ttl, not on whether the concept exists in the glossary."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "Membership is by name against the registry, and the vocabulary grows by contribution \u2014 the check does not need it closed, only queried."
  - gap: definition/glossary/action#attributes.name.values
    why: "The check tests presence of the named action in the action vocabulary, which is decidable without any action the base has yet named."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The check tests presence of the named recipient and reads nothing about which queues exist."
---

## What it is
The vocabulary check standing behind the base's statement that a case speaks only the published language.
One refusal covering every position in which a case names a term, so nothing a case names is invented in place.

## Notes

The criteria enumerate the positions a case names terms in, not the terms themselves, because the members of each vocabulary are the glossary's to publish.
The check decides against the glossary it is given through the shared lookup and holds no vocabulary of its own.
From the binding — the rule constrains the published value while the check runs before publication over the case under edit, which the base now states, so the refusal point is reachable from the bound set.
From the binding — the publish trigger and the states this check refuses at sit outside this epic's claim; no criterion needs the trigger named.
From the binding — the glossary context node, which states the four vocabularies grow differently and must not be treated alike, is outside the candidates; the five bound glossary definitions each state their own membership requirement, so the criteria stay backed.
From the binding — seven sibling publication checks and the capability are left unbound, each being a distinct refusal rather than part of this one.
