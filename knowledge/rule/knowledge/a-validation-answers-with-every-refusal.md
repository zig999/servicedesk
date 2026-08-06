---
title: A validation answers with every refusal
summary: A validation of a case runs every check it carries whatever an earlier one decided, and answers with all of them.
ddd: invariant
statement: A validation of a case MUST run every check it carries, whatever any earlier check decided, and MUST answer with every refusal those checks produced.
expression: count(refusals answered) == count(checks that refused)
sources:
  - intake/decisoes-seis-perguntas-2026-08-05.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
constrains:
  - definition/knowledge/draft-case
examples:
  - Given a case that declares no hypothesis and also names a recipient the glossary does not publish, when it is validated, then both refusals are answered.
  - Given a case that two checks refuse, when it is validated, then no refusal is answered that no check produced, and neither is left out.
---

## What it is

The curator sees everything that is wrong with a case in one pass, and fixes it in one pass.
A validation that stopped at the first refusal would cost a publish-and-correct cycle per mistake, and the curator would learn one problem at a time.

## Rules

Every check runs even over a case another check has already refused, which is what makes the whole list reachable.
A check must therefore be safe over a malformed case: the check that a hypothesis collects a concept walks a case with no hypothesis at all without failing, and simply refuses nothing.
What each refusal carries is the refusal construct's — the rule that refused, the position in the case, and the text for the curator — and the same rule refusing at two positions produces two refusals.
