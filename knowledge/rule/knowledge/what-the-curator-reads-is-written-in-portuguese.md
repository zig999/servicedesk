---
title: What the curator reads is written in Portuguese
summary: Every text a validation or a publication addresses to the curator is written in the language the cases themselves are written in.
ddd: invariant
statement: The text a refusal, a read failure or an unavailable contract check carries for the curator MUST be written in Portuguese.
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/refusal
  - definition/knowledge/read-failure
  - definition/knowledge/check-unavailable
examples:
  - Given a case refused for declaring no hypothesis, when the curator reads the refusal, then its text is in Portuguese.
  - Given a case file whose structured part does not parse, when the curator reads the read failure, then its text is in Portuguese.
---

## What it is

The domain speaks Portuguese and the case files are the model, so a sentence addressed to the specialist who writes them in another language would be a translation inside the model itself.
English stays where the material puts it, in terms of technical boundary, and nothing a curator is answered with is one of those.

## Rules

The text a refusal carries is the text the rule it names declares.
