---
title: Refusal
summary: One reason one case did not pass validation — the rule that refused, the position in the case it refused at, and the text written for the curator.
ddd: value-object
rationale: The decision states a refusal's position as a path in the case's own language and gives the path a case with no hypothesis at all is refused at, so the analysis records the position as one required attribute rather than as the two optional parts the earlier reading needed; a refusal is a value because two refusals naming the same rule, position and text are interchangeable.
sources:
  - intake/decisoes-cinco-perguntas-2026-08-06.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
attributes:
  - name: rule
    type: string
    required: true
  - name: position
    type: string
    required: true
  - name: text
    type: string
    required: true
gaps:
  - field: attributes.rule.structural-checks
    why: A refusal names by identifier the rule that refused, and two of the material's thirteen validation checks — that a hypothesis criterion is present, and that an outcome and a referral are present — are held here as required attributes rather than as rule nodes; the material does not say what identifier a refusal names when one of those refuses.
    proposal:
      value: A refusal of either check names a rule node by its identifier, exactly as every other refusal does, because the two checks are rules the analysis recorded as constraints instead of as nodes — one saying a hypothesis declares a criterion, and one saying every resolution of a case declares an outcome and a referral. Each is written as a rule node in the knowledge context, each declares the Portuguese text its refusal carries, and the required attributes on definition/knowledge/hypothesis and definition/knowledge/resolution stay exactly as they stand, a declared constraint and a rule node being two records of one decision rather than two alternatives.
      why: >-
        The material lists all thirteen checks as the validator's rules and says they are all of
        them, and these two sit in the same structural block as the four already recorded as rule
        nodes — the slug, at least one hypothesis, the unique name, at least one collected concept
        — so nothing distinguishes their species from the ones that already refuse by naming a
        rule. rule/knowledge/the-refusal-text-comes-from-the-rule then forces the shape: every rule
        that can refuse declares the text its refusal carries, and this node's text attribute is
        required, so a refusal whose rule is not a node has no text it may carry. The alternative
        reading — that an absent criterion or an absent resolution answers with a read failure — is
        what rule/knowledge/an-unreadable-case-is-not-validated rules out, because that rule turns
        on the structured part not parsing, while a file omitting one field parses, produces a case
        under edit to walk, and leaves a position nameable at the very field that is missing. What
        ratifying this does not settle is the two Portuguese sentences themselves, which the
        material has never stated for a check outside the eight the current plan builds.
---

## What it is

A refusal is one reason one case did not pass validation, addressed so the curator fixes it rather than hunts for it.
It names the rule that refused by its identifier, because the rule is the domain's language and outlives whatever check implements it.
Its position is a path into the case, written in the vocabulary the case itself uses, which is literally where the curator puts the cursor.
A case that declares no hypothesis at all is refused at the path naming the hypothesis list, so no refusal exists with no position to name.
Its text is written for the curator, who is the one who fixes the case, and it is the text the rule that refused declares, instantiated with the position.

## Rules

The same rule refusing at two positions produces two refusals, one per position.
A position indexes a hypothesis by its name, and by its ordinal only where two hypotheses of the case share that name.
The text a refusal carries is the text the rule it names declares.
What the curator reads is written in Portuguese.
A validation answers with every refusal its checks produced.
Where the capability registry cannot be consulted, what publication answers is not a refusal.
