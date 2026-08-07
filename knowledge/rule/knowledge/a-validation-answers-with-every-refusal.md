---
title: A validation answers with every refusal
summary: A validation of a case runs every check it carries whatever an earlier one decided, and answers with all of them.
ddd: invariant
statement: A validation of a case MUST run every check it carries, whatever any earlier check decided, and MUST answer with every refusal those checks produced.
expression: count(refusals answered) == count(positions refused)
sources:
  - intake/decisoes-seis-perguntas-2026-08-05.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/draft-case
gaps:
  - field: statement.unavailable-contract-check
    why: >-
      This statement requires every refusal the checks produced to be answered, and
      rule/knowledge/an-unavailable-check-is-not-a-refusal forbids publication any refusal where
      the capability registry cannot be consulted. Both are stated over the same act, and one case
      decides them differently: a case that declares no hypothesis, published while the registry
      cannot be reached. There this statement requires the refusal on hypotheses to be answered and
      the other forbids answering with it, and the material does not say which of the two holds.
examples:
  - Given a case that declares no hypothesis and also names a recipient the glossary does not publish, when it is validated, then both refusals are answered.
  - Given a case that two checks refuse, when it is validated, then no refusal is answered that no check produced, and neither is left out.
  - Given one check refusing one case at two positions, when it is validated, then two refusals are answered, because the count is over positions and not over checks.
---

## What it is

The curator sees everything that is wrong with a case in one pass, and fixes it in one pass.
A validation that stopped at the first refusal would cost a publish-and-correct cycle per mistake, and the curator would learn one problem at a time.

## Rules

Every check runs even over a case another check has already refused, which is what makes the whole list reachable.
A check must therefore be safe over a malformed case: the check that a hypothesis collects a concept walks a case with no hypothesis at all without failing, and simply refuses nothing.
A check leaves what it cannot read to the check that owns it, which is why an unpublished concept is one refusal rather than three at the same position.
What each refusal carries is the refusal construct's — the rule that refused, the position in the case, and the text for the curator — and the same rule refusing at two positions produces two refusals.
A case whose structured part does not parse is not validated at all, and answers with a read failure instead.
