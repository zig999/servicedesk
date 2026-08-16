---
title: The released-only diagnosis gate
summary: The one new check on the diagnosis path — a case version pinned for investigation must be released, never a draft.
rationale: I kept this as its own epic, separate from the operations that author a case version, because it constrains a different aggregate's own entry point (investigation) rather than anything the case-lifecycle contract itself declares.
sources:
- work/case-lifecycle/intake/scope.md
covers:
- rules/investigation/only-a-released-case-version-is-diagnosed
- domain/investigation/investigation
- domain/knowledge/case-version
- scenarios/investigation/a-draft-case-version-refuses-diagnosis
- contracts/investigation/case-source
uncovered:
- node: contracts/investigation/case-source
  why: Already satisfied by the existing, unchanged case-source read (CaseQueryService.readCase, consumed via run-diagnosis.ts) — this epic adds a gate before that consumption is used to pin a new investigation, but changes nothing about the read contract itself.
---

## What it is

The single gate standing between a read case version and a diagnosis run.
It reads the version's own state; it does not decide what that state is.

## Notes

None.
