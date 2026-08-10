---
title: Write-once investigation storage
summary: Persists one investigation as its own file, never overwriting or mutating a record once written, mirroring the case module's file-backed store pattern.
objective: A built investigation is persisted exactly once and is retrievable afterwards by its identity, with no operation this store exposes able to mutate or overwrite an already-written record.
criteria:
  - Writing an investigation whose identity is already stored is refused rather than overwriting the earlier file.
  - A written investigation is retrievable afterwards by its identity, whole and unchanged.
  - The store's write reuses the shared JSON-file writer rather than a second file-writing routine.
depends_on:
  - task/investigation-lifecycle/investigation-factory
rationale: Storage mechanics are their own reason to change — the file layout, the write-once guarantee — distinct from the idempotency window's own reason, the repeat-request key and its lease, so the two are cut apart even though both sit behind persistence.
implements:
  - rules/investigation/an-investigation-is-written-once
  - constraints/the-mvp-persists-to-no-database
sources:
  - intake/scope.md
---

## What it is

The file-backed store that gives a written investigation nowhere to be overwritten.
It reuses the same JSON-file read/write helpers every other file store in the tree already shares.

## Notes

ADVISORY, from the specification — domain/investigation/investigation and its attribute value objects are not named in implements: they declare the aggregate's shape, built validly by the sibling investigation-factory task; this store persists that already-whole object as an opaque JSON document, mirroring the split the case module already draws between its store and its model tasks.
REMAINDER, from the specification — an-investigation-is-written-once's clause that no intermediate domain state persists reaches no criterion of this task, whose only stated failure mode is duplicate-identity refusal; the guarantee that this store is invoked exactly once, only after the aggregate is complete, belongs to whichever component composes the stages and calls it. Belongs to task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — no-stage-aborts-on-its-deadline's persistence-exception clause, and no-response-without-a-record's persistence-timeout scenario, reach no criterion of this task, which states no time budget or requester-facing failure. Belongs to task/investigation-lifecycle/diagnose-entry-point.
ADVISORY, from the specification — in-progress-is-a-lease-not-domain-state's "the investigation store holds no record before completion" half is satisfied trivially by exposing no partial-write operation; its other half, the lease of key and instant, is a different store this task does not build. Belongs to task/investigation-lifecycle/idempotency-window.
ADVISORY, from the specification — the-mvp-persists-to-no-database is system-scoped; this task demonstrates it for investigation records only, mirroring the case module's own per-store scoping.
