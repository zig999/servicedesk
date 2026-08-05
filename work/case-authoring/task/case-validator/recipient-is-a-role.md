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
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/recipient
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/glossary/recipient-is-a-role
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "No node states where or when a recipient is held to naming an operational role rather than a person. The rule constrains the glossary's recipient entries, declares no consistency point and no aggregate, and no node describes the registration that would apply it, so the base does not say whether this case-side check must itself distinguish a role from a person or whether membership in the published recipients is the whole test."
waived:
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The base models a recipient as a value identified by name and the glossary as the published vocabulary the case is checked against, so this check reads whatever the glossary publishes rather than a list written into it; naming the real operational queues changes the glossary's contents, not whether a case naming an unpublished recipient is refused."
---

## What it is

The check standing behind the base's statement that a referral goes to an operational role and never to a named person.
A refusal decided over every referral a case declares, including the one it declares for when nothing confirms.

## Notes

A case can fail this check and the published-terms check at once, and they remain two checks because the base holds two rules that refuse for two reasons.
The third criterion fixes the reach of the check over all of a case's referrals rather than only those hanging from hypotheses.
BLOCKING, from the binding — no bound node states a case-side test of role-ness, so as the base stands the criteria are demonstrable only by reading publishes as an operational role as publishes as a recipient at all, and an executor reading them literally would have to invent the person-versus-role discrimination.
From the binding — the bound terms rule has five clauses and this task answers the recipient clause only, the action clause being the closest seam since a referral requires both.
From the binding — the check walks the declared structure at both resolution sites rather than running the case's resolving behaviour, which nothing in the base contradicts and nothing states.
