---
title: Every term a case names exists in the glossary
summary: A case speaks only the published language, so nothing it names is invented in place.
ddd: invariant
aggregate: cases
statement: Every subject type, concept, outcome, action and recipient a case names MUST exist in the glossary.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a case naming a recipient absent from the glossary, when it is published, then publication is refused.
  - Given a case naming a term absent from the glossary, when it is validated, then the refusal carries the text «O termo «{termo}» não está publicado no glossário como {tipo}. O caso só fala a linguagem publicada — registre o termo no glossário ou corrija a grafia.», with the term and the kind it was looked up as in place.
  - Given a case naming a concept the glossary does not publish, when it is validated, then this is the only rule that refuses it, and the ttl and subject-type checks refuse nothing.
---

## What it is

The vocabularies are closed so that two cases cannot spell the same thing two ways, and so a report can compare across cases at all.
This is the rule that owns an unpublished term, so a typo in a concept name is one refusal and one correction rather than three refusals at the same position.

## Rules

A term looked up in the glossary is answered as published only under exact character comparison.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
