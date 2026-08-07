---
title: One capability answers one concept
summary: The registry holds at most one capability for a concept, so nothing has to choose between two.
ddd: invariant
statement: The capability registry MUST hold at most one registered capability for a concept.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/integration/capability
  - definition/glossary/concept
consistency: immediate
examples:
  - Given a concept with a registered capability, when it is looked up, then one capability answers and nothing has to choose.
  - Given a concept no capability is registered for, when it is looked up, then nothing answers, and a case naming that concept is unpublishable.
---

## What it is

The plan that resolved a concept through a list of sources with fallbacks was cut, and the cost accepted was this — one concept, one capability, until a second source for the same concept appears.
Until then the question of which capability answers a concept does not exist, and nothing in the domain has to hold an answer to it.

## Rules

A capability whose nature is not read-only is refused by the registry.
A lookup in the registry names a concept and matches it character for character.
