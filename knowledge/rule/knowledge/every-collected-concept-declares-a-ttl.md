---
title: Every collected concept declares a ttl
summary: How stale a fact may be is stated by the concept, not assumed by whoever reads it.
ddd: invariant
statement: Every concept a case names that the glossary publishes MUST declare a ttl in the glossary.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/glossary/concept
examples:
  - Given a case naming a concept whose glossary entry has no ttl, when it is published, then publication is refused.
  - Given a case naming a concept whose glossary entry has no ttl, when it is validated, then the refusal carries the text «O conceito «{conceito}» não declara ttl no glossário. Quanto um dado pode estar velho é decisão do conceito — declare o ttl antes de usá-lo em um caso.», with the concept named in place.
  - Given a case naming a concept the glossary does not publish, when it is validated, then this rule refuses nothing, because there is no glossary entry to read a ttl from.
---

## What it is

The ttl is the strictest tolerance among the cases that use the concept, so a case more tolerant than that simply gets less benefit and never a staler fact than it accepts.
This check is safe over a concept the glossary does not publish and simply refuses nothing there, because that absence belongs to the check that owns it.

## Rules

Every term a case names exists in the glossary, and that is the rule an unpublished concept answers to.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
