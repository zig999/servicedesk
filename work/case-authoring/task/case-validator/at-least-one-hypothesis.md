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
  - node: rule/knowledge/case-has-at-least-one-hypothesis
    digest: sha256:ff3df5176e34b2bfdfd59d9a8231b195cc843ffc5d71fa23976715accbb63838
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check counts the hypotheses a case declares; how publication sets the version reaches neither the count nor the refusal, so nothing this task demonstrates depends on what settles it."
---

## What it is
The structural check standing behind the base's statement that a case with no hypothesis investigates nothing.
A refusal decided from the case's own declarations, reading nothing outside the case.

## Notes

The two passing criteria assert only that this check does not refuse, since another check may still refuse the same case for its own reason.
UNDERDETERMINED, from the binding — an implementation that answers its refusal by aborting the validation it runs in satisfies every criterion as written, yet the a-validation-answers-with-every-refusal rule, a candidate this task does not bind, refuses a validation that stops at the first refusal; what passes is a check that raises or exits on the no-hypothesis case, refusing it but preventing every later check from running.
REMAINDER, from the binding — the case node carries clauses this task's criteria never reach, the two written-out fallbacks for none confirming, the content hash covering the whole file and the curator notes never reaching a prompt; they belong to the tasks delivering the published case's structure and its fallback declarations, within the same epic's claim.
REMAINDER, from the binding — the case under edit carries clauses this task never reaches, that a case becomes published only through publication and that publication adds the version and the hash; they belong to the task that delivers publication itself, which this plan does not hold.
From the binding — the hypothesis definition was left unbound deliberately, because this check counts entries of the hypotheses list and inspects none of them, so the hypothesis's own structure governs the neighbouring per-hypothesis checks.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
