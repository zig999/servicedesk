---
title: A hypothesis declares a criterion
summary: A hypothesis with no criterion collects facts that nothing will ever judge.
ddd: invariant
aggregate: cases
statement: A hypothesis MUST declare a criterion, and that criterion MUST NOT be empty.
expression: hypothesis.confirms_when is present and not empty
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/ratificacao-tres-decisoes-2026-08-07.md
constrains:
  - definition/knowledge/hypothesis
examples:
  - Given a hypothesis declaring no criterion, when its case is validated, then it is refused at the position of that hypothesis's criterion.
  - Given a hypothesis whose criterion is present and empty, when its case is validated, then it is refused the same way, because a criterion nobody wrote decides nothing.
  - Given a case whose two hypotheses each declare no criterion, when it is validated, then two refusals are answered, one at the position of each.
  - Given a hypothesis declaring no criterion, when its case is validated, then the refusal carries the text «A hipótese «{hipotese}» não declara critério. Sem critério ela nunca poderá ser julgada — escreva em confirma_quando a afirmação falsificável que a confirma.», with the hypothesis named in place.
---

## What it is

The criterion is what decides the hypothesis, so a hypothesis without one collects facts that nothing will ever judge and reaches no verdict.
A criterion left blank is the same absence written differently, which is why the check reads the two as one.

## Rules

A criterion states exactly one falsifiable claim.
The criterion sits in the case's frontmatter, because the frontmatter holds everything the case declares.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
