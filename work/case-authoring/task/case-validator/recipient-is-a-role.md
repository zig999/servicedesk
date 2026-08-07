---
title: "A referral goes to a published role"
summary: "The check that refuses a case whose referral names a recipient the glossary does not publish as an operational role."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case whose referral names a recipient that the glossary does not publish as an operational role is refused by this check, and a case whose every referral names a published operational role is not refused by it."
criteria:
  - "A case whose referral names a recipient the glossary does not publish as an operational role is refused by this check."
  - "A case whose every referral names a recipient the glossary publishes as an operational role is not refused by this check."
  - "A case whose fallback resolution carries a referral is read by this check the same as one carried by a hypothesis's resolution."
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
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/glossary/recipient
    digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
  - node: rule/glossary/recipient-is-a-role
    digest: sha256:f1fb3daab70d9f8582b4e5c1c29ecfb5771b82c915f335f919412f3c0785993d
  - node: rule/knowledge/case-terms-exist-in-the-glossary
    digest: sha256:4f3ff8e59ed4e0d1bc5808b7cc98a98d065e094650e493032a8aa309cdc376a1
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check reads the referrals a case declares and compares each recipient against the glossary; what sets a case's version is nowhere on that path, and no criterion of this task mentions the version or the hash."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "Which real operational queues populate the recipient vocabulary is data the check reads at validation time, never a fact the check encodes — both refusal and non-refusal are demonstrable over any glossary content, so the unnamed values bear on registering recipients, not on this check."
---

## What it is
The check standing behind the base's statement that a referral goes to an operational role and never to a named person.
A refusal decided over every referral a case declares, including the two it declares for when nothing confirms.

## Notes

A case can fail this check and the published-terms check at once, and they remain two checks because the base holds two rules that refuse for two reasons.
The third criterion fixes the reach of the check over all of a case's referrals rather than only those hanging from hypotheses.
UNDERDETERMINED, from the binding — criterion 3 says fallback resolution in the singular while the case and the case under edit both declare two fallback resolutions, each a required resolution carrying a required referral, and the aggregate states the contract checks run over the whole; what passes is a check reading the referral of exactly one fallback and every hypothesis's resolution, shipping unrefused a bad recipient sitting only in the other fallback, which the base refuses.
UNDERDETERMINED, from the binding — no criterion requires this check to be safe over a malformed case while the every-refusal rule requires every check to walk a case another check already refused without failing; what passes is a check that indexes into a well-formed shape and throws over a draft with an empty hypothesis list or a missing fallback.
REMAINDER, from the binding — the terms-exist rule states five clauses and this task answers only the recipient one; the subject-type, concept, outcome and action clauses belong to the sibling checks of the same epic, the action clause being the other half of the referral this check does not read.
REMAINDER, from the binding — the every-refusal rule is bound for its clause that a check must be safe over a malformed case, and both clauses of its statement belong to the validation-run task that composes the checks.
REMAINDER, from the binding — the recipient-is-a-role statement, that a recipient names an operational role and never a person, reaches no criterion and the node itself says whoever registers a recipient asserts it; published as an operational role reduces, for this check, to presence in the recipient vocabulary, and role-ness belongs to the act of registering entries, outside this plan.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
