---
title: Diagnosis refuses to pin a draft case version
summary: Before any evidence collection or judgment runs, the version named by a diagnose request must be released; a draft is refused with its own typed error.
rationale: None — the scope's §3.4 and the scenario a-draft-case-version-refuses-diagnosis state this task's behavior directly; the exact error class name is left to whoever implements, as the scope itself says.
sources:
- work/case-lifecycle/intake/scope.md
objective: An investigation may only be pinned to a case version in released state; a draft version is refused before diagnosis runs.
criteria:
- Attempting to diagnose against a case version whose state is draft is refused, naming that the version is not released, before any evidence is collected or any hypothesis is judged.
- Attempting to diagnose against a case version whose state is released is not refused by this gate.
- The refusal raises a typed error distinct from CaseNotFoundError and CaseNotValidError, carrying a context object naming the identifying values, following this codebase's own named-error convention.
depends_on:
- task/case-lifecycle-persistence/relational-case-store-for-lifecycle
- task/case-lifecycle-domain-model/aggregate-types-and-structural-validation
implements:
- rules/investigation/only-a-released-case-version-is-diagnosed
- domain/investigation/investigation
- domain/knowledge/case-version
- scenarios/investigation/a-draft-case-version-refuses-diagnosis
---

## What it is

The one refusal standing between a coherent draft and a real diagnosis.
A draft may already validate structurally and still be refused here — coherence and release are two different questions.

## Notes

REMAINDER, from the specification — rules/investigation/only-a-released-case-version-is-diagnosed's own statement has a second clause, "a draft version may be read but never diagnosed against," whose "may be read" half is not answered by any criterion of this task, which addresses only the diagnose-time refusal. Belongs to: a task over case-version composition/preview (the operations declared on domain/knowledge/case-version — place-hypothesis, remove-hypothesis, collection-plan, requires-evaluation-of, resolve-outcome — where a draft is composed and previewed), not this investigation-diagnosis task. This half is already answered by the existing, unchanged CaseQueryService.readCase path, per the report — no new task is expected to be needed for it.
