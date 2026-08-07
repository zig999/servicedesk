---
title: The contract check reads the current registration
summary: Publication asks the registry for the capability registered now for a concept, and never searches earlier versions of one.
ddd: invariant
statement: The publication check for a concept MUST read the capability registered for that concept at the moment of publication, and MUST NOT consider any earlier version of a capability.
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/integration/capability
  - definition/knowledge/draft-case
consistency: immediate
examples:
  - Given a concept whose registered capability was replaced by a later version, when a case naming it is published, then the check reads the registered one and no earlier one.
  - Given an investigation that recorded an earlier version of a capability, when it is replayed, then it stays legible against what it read, because replay is an act of the investigation and not of publication.
---

## What it is

A case publishes against the contract in force, and what an earlier investigation read stays legible on its own, because its evidence carries the capability by name and version.
Which capability answers a concept is not a question with two answers today, because the registry holds at most one for a concept.

## Rules

A lookup in the registry names a concept and matches it character for character.
One capability answers one concept.
Every concept a case collects has a registered read-only capability.
