---
title: ICapabilityQuery gains listCapabilities
summary: A new query operation returning every capability currently registered.
objective: ICapabilityQuery gains a listCapabilities operation returning every capability currently registered, with its declared contract.
criteria:
  - Calling listCapabilities returns every capability currently registered, with its full declared contract, paginated per src/types/pagination.ts.
  - Calling listCapabilities against a registry holding no capabilities returns an empty page rather than an error.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/integration/capability-registry
  - domain/integration/capability
sources:
  - intake/scope.md
---

## What it is

A new read-only ICapabilityQuery method, listCapabilities.

## Notes

None.
