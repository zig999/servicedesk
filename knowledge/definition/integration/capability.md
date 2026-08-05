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
gaps:
  - field: attributes.output_schema
    why: The material states that a citation names a field and that the field must exist in what the capability returns, and never says which fields the answer to a given concept holds — which is the fact a citation is checked against, and the one only whoever knows each corporate system's answer can settle. The format such a declaration is written in is implementation and is not what this gap names.
  - field: attributes.timeout.unit
    why: The third decision is open — the material states every capability declares a timeout and gives neither its unit nor any value.
---

## What it is

One concept is answered by one capability until a second source for the same concept appears, and no plan with fallbacks exists until then.
A capability resolves internally whatever it must derive from the subject it was given, so the case never carries the derivation.
Its output schema is what makes a citation checkable, because a cited field either exists in it or does not.

## Rules

A capability whose nature is not read-only is refused by the registry.
A capability runs in the authorization scope of the requester, never that of the service.
