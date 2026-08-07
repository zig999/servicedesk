---
title: Read failure
summary: What the reading of a case file answers with when its structured part does not parse — where the parse broke, and the text that says so to the curator.
ddd: domain-error
rationale: The decision states that a file whose structured part does not parse answers with a failure of reading rather than with a refusal, and does not name the construct; recording it as a domain error beside the refusal is the analysis reading which construct a stated thing is.
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
attributes:
  - name: line
    type: integer
    required: true
  - name: column
    type: integer
    required: true
  - name: text
    type: string
    required: true
---

## What it is

A file whose structured part does not parse produces no case under edit, so there is nothing for a check to walk and no position for anything to name.
It says where the parse broke — the line and the column — and the curator sees one error rather than one per check.
It is not a refusal, because a refusal names a rule the case offended, and here there is no case for a rule to be offended by.

## Rules

A case whose structured part does not parse is not validated, and this is what the reading answers with.
What the curator reads is written in Portuguese.
