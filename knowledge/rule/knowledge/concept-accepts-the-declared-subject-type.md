---
title: A collected concept accepts the case's subject type
summary: A case cannot ask for a fact that does not apply to the kind of thing it investigates.
ddd: invariant
aggregate: cases
statement: Where the glossary publishes both a concept a case collects and the type of subject that case declares, that concept MUST accept that type.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
  - definition/glossary/concept
consistency: immediate
examples:
  - Given a case whose subject type is customer, when it collects the state of the equipment, then publication is refused.
  - Given a case collecting a concept that does not accept its subject type, when it is validated, then the refusal carries the text «O conceito «{conceito}» não aceita sujeito do tipo «{sujeito}», que é o que este caso investiga. Escolha outro conceito ou outro tipo de sujeito.», with the concept and the subject type in place.
  - Given a case naming a concept the glossary does not publish, when it is validated, then this rule refuses nothing, because there is no glossary entry to read what it accepts.
  - Given a case declaring a subject type the glossary does not publish, when it is validated, then this rule refuses nothing, and the term check is what refuses.
---

## What it is

This is what keeps the subject a dimension of the case rather than a decision fixed for the whole system.
Whatever a capability needs to derive from the subject it derives internally, so the case never carries the derivation.
This check is safe over a term the glossary does not publish and simply refuses nothing there, because that absence belongs to the check that owns it.

## Rules

Every term a case names exists in the glossary, and that is the rule an unpublished term answers to.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
