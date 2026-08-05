---
title: A capability is read-only
summary: The system diagnoses and refers, and never acts.
ddd: invariant
statement: The registry MUST refuse any capability whose nature is not read-only.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/integration/capability
examples:
  - Given a capability declaring a nature that writes, when it is registered, then the registry refuses it.
---

## What it is

This is a decision rather than a limitation, and it deletes human confirmation of mutation, write scopes, and half of the security surface at once.
It holds because the registry enforces it, not because anybody remembers to.

## Rules

None.
