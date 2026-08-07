---
title: A registry lookup names a concept exactly
summary: The capability registry is consulted by the name of a concept, compared character for character, the comparison the whole published language already gets.
ddd: invariant
statement: A lookup in the capability registry MUST name a concept, and MUST answer a registered capability only where that capability's concept name equals the term character for character.
expression: registry(term) answers a capability iff some registered capability's concept name compares equal to term character for character
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/integration/capability
  - definition/glossary/concept
consistency: immediate
examples:
  - Given a registry holding a capability for the concept onu-offline, when onu-offline is looked up, then that capability answers.
  - Given the same registry, when ONU-Offline is looked up, then nothing answers, because the comparison is exact.
---

## What it is

A concept is named once for the whole system, and the registry is one more place that name is spoken, so it is spoken the one way the rest of the system speaks it.
A term differing only in letter case is another term here too, and a case naming it finds nothing rather than being silently matched.

## Rules

A term looked up in the glossary is answered as published only under exact character comparison.
One capability answers one concept.
