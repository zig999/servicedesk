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
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/glossary/recipient-is-a-role
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - question: "No node states how a recipient's name is determined to name an operational role rather than a person, so the never-a-person clause reaches no criterion and no construct in the base would let this check decide it \u2014 a recipient carries only a free-string name, and the glossary declares no marker separating a role from any other."
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This check reads the referrals a curator wrote and refuses before publication assigns a version; no criterion turns on what sets it."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "Same path \u2014 the hash is assigned by publication, after this check has decided, and no criterion mentions it."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "The gap names which of the two non-conclusion outcomes the single fallback holds; criterion 3 turns on the fallback's referral, which every resolution requires whatever its outcome, so the recipient this check reads is present either way."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "A recipient is a value object with a free-string name identified by that name rather than an enum, so the case-side test is a lookup in the glossary; which names it holds does not change whether a named recipient is found or absent."
---

## What it is
The check standing behind the base's statement that a referral goes to an operational role and never to a named person.
A refusal decided over every referral a case declares, including the one it declares for when nothing confirms.

## Notes

A case can fail this check and the published-terms check at once, and they remain two checks because the base holds two rules that refuse for two reasons.
The third criterion fixes the reach of the check over all of a case's referrals rather than only those hanging from hypotheses.
From the binding — the reading that makes criteria 1 and 2 demonstrable: the case-side test the base states is existence in the glossary, and role-ness is an invariant over the glossary entry itself, so every recipient the glossary publishes is an operational role and the two phrasings have the same extension. This check delegates role-ness upstream rather than deciding it, and the reading is recorded so a reviewer can reject it.
From the binding — the bound terms rule covers five kinds of term and this task's criteria answer the recipient clause only; the other four reach no criterion here.
From the binding — the thing this check refuses is the case under edit while the rule constrains the published case; both hold the hypotheses and the fallback this check walks, and the task's word case covers both.
