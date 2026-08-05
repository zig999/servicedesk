---
title: "A case declares at least one hypothesis"
summary: "The check that refuses a case declaring no hypothesis at all."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case that declares no hypothesis is refused by this check, and a case that declares at least one is not refused by it."
criteria:
  - "A case declaring no hypothesis is refused by this check."
  - "A case declaring exactly one hypothesis is not refused by this check."
  - "A case declaring several hypotheses is not refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/published-case/case-structure
nodes:
  - rule/knowledge/case-has-at-least-one-hypothesis
  - definition/knowledge/draft-case
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - aggregate/knowledge/cases
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "Publication assigns the version; this check counts the hypothesis list of the case under edit, which carries no version at all, and decides without reading one."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "The hash is likewise assigned at publication and is not an input to counting hypotheses; what it is computed over cannot change this check's decision."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "This check reads only the hypothesis list. Which of the two non-conclusion resolutions the fallback carries changes neither the refusal of an empty list nor the acceptance of one or several hypotheses."
---

## What it is
The structural check standing behind the base's statement that a case with no hypothesis investigates nothing.
A refusal decided from the case's own declarations, reading nothing outside the case.

## Notes

The two passing criteria assert only that this check does not refuse, since another check may still refuse the same case for its own reason.
From the binding — the rule constrains the published value while the case under edit is what a publication check refuses, so the base names the checked construct in two places and the executor reads the draft as the one the check reads.
From the binding — the case under edit declares a minimum of one hypothesis, restating this rule inside the shape, so the base does not say whether an empty list is refused by the shape or by this named check.
From the binding — the publication act that runs this check, and its open gap over what a publish refusal is, sit outside this epic's claim.
From the binding — a fixture for criteria 2 and 3 embeds constructs whose own checks belong to other tasks, so it is valid only against this check.
