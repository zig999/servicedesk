---
title: An unreadable case is not validated
summary: A file whose structured part does not parse answers with a read failure, and no check of the validation runs over it.
ddd: invariant
statement: Where the structured part of a case file does not parse, the reading MUST answer with a read failure naming where the parse broke, and the validation MUST NOT run.
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/read-failure
  - definition/knowledge/draft-case
consistency: immediate
examples:
  - Given a case file whose structured part is malformed, when it is read, then a read failure names the line and the column and no refusal is answered.
  - Given the same file, when it is read, then the curator sees one error rather than one per check.
---

## What it is

A file that does not parse produces no case under edit, so there is nothing for a check to walk, no position to name, and nothing for the totality of the validation to be total over.
Modelling this as a refusal would require a case object that does not exist.
A technical failure and a fact of the domain cannot be indistinguishable, which is the same discipline that keeps having no data, a failed judgement and an exhausted deadline three different things.

## Rules

A validation answers with every refusal its checks produced, and here no check runs.
What the curator reads is written in Portuguese.
