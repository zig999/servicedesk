---
title: Every term a case names exists in the glossary
summary: A case speaks only the published language, so nothing it names is invented in place.
ddd: invariant
aggregate: cases
statement: Every subject type, concept, outcome, action and recipient a case names MUST exist in the glossary.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a case naming a recipient absent from the glossary, when it is published, then publication is refused.
---

## What it is

The vocabularies are closed so that two cases cannot spell the same thing two ways, and so a report can compare across cases at all.

## Rules

None.
