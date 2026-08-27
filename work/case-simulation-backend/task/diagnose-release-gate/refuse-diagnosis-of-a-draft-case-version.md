---
title: diagnose refuses a draft-state case version
summary: A new named domain error refuses a diagnose request pinned to a draft-state case version, registered in status-map.ts, before the engine ever runs.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: POST /v1/diagnose over a case version in draft state is refused, naming that the version is not released, instead of running an investigation against it.
criteria:
  - A diagnose request naming a case version in draft state is refused with a new named domain error, following the CaseVersion*Error pattern in src/src/errors/, before collection, judgment or writing runs.
  - The new error is registered in status-map.ts's STATUS_BY_ERROR_CLASS table, mapped to a status this project decides as its own engineering choice.
  - A diagnose request naming a case version in released state is unaffected and proceeds exactly as before.
implements:
  - rules/investigation/only-a-released-case-version-is-diagnosed
  - scenarios/investigation/a-draft-case-version-refuses-diagnosis
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/investigation/investigation
---

## What it is

A refusal that fires on the case version's own state, ahead of the engine, distinct from CaseVersionNotDraftError because the reason it states is specific to diagnosis-time release, not composition-time draft state.

## Notes

A case version that already validates structurally may still be refused here — coherence and release are two different questions.
REMAINDER, from the specification — `rules/investigation/only-a-released-case-version-is-diagnosed`'s "may be read" clause (a draft version may still be read, just never diagnosed against) is not reached by this task's criteria, which answer only the diagnose-refusal half. Belongs to the case-version read path, already delivered and unaffected by this task — `case-query.service.ts`'s `readCase` reads a draft version today and this task does not change that.
