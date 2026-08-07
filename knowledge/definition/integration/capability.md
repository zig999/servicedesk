---
title: Capability
summary: What answers one concept — read-only, versioned, with a declared output schema and a deadline.
ddd: value-object
identity:
  - name
  - version
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/perguntas-2026-08-05.md
  - intake/decisoes-seis-perguntas-2026-08-05.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
attributes:
  - name: name
    type: string
    required: true
  - name: version
    type: string
    required: true
  - name: concept
    type: ref
    target: definition/glossary/concept
    binding: by-identity
    required: true
  - name: nature
    type: enum
    required: true
    values:
      - read-only
  - name: timeout
    type: integer
    required: true
  - name: output_schema
    type: list
    of: definition/glossary/observation-field
    binding: embedded
    min_items: 1
    required: true
gaps:
  - field: attributes.timeout.unit
    why: The third decision is open — the material states every capability declares a timeout and gives neither its unit nor any value.
---

## What it is

One concept is answered by one capability until a second source for the same concept appears, and no plan with fallbacks exists until then.
A capability resolves internally whatever it must derive from the subject it was given, so the case never carries the derivation.
Its output schema is its own attribute — the list of named fields its answer carries — and the publication check reads that the declaration is present, invoking nothing.
The schema is the adapter's contract with the system it reads, and it is not what a citation is checked against — that is the field list the concept declares, so the authority stays in the glossary.

## Rules

A capability whose nature is not read-only is refused by the registry.
A capability runs in the authorization scope of the requester, never that of the service.
The registry holds at most one registered capability for a concept.
A lookup in the registry names a concept and matches it character for character.
The publication check reads the capability registered at the moment of publication, and no earlier version of one.
