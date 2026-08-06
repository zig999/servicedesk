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
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/recipient
  - rule/glossary/recipient-is-a-role
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/knowledge/a-validation-answers-with-every-refusal
base: sha256:d196ce9d9e4ee7f02c9a77beaa94aa21caab7c52084e0cc8cd8179fbb099a411
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
