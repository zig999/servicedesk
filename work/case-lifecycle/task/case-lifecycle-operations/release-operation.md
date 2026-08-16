---
title: release operation
summary: Runs the same structural and coherence validation read-case already runs over the assembled case, and only once every rule holds, marks the draft released and records the instant.
rationale: None — the scope's §3.3 release row and §0's validation-runs-at-every-read mapping state this task's behavior directly.
sources:
- work/case-lifecycle/intake/scope.md
objective: A curator may release a draft version only once its assembled manifest holds against every structural and coherence rule, refused otherwise with every violation named and nothing changed.
criteria:
- Releasing a draft whose assembled manifest fails any structural or coherence rule is refused, naming every violated rule together, with nothing stored changed.
- Releasing a draft that holds against every rule marks its state released and records the instant of release.
- Releasing a version that is not in draft state is refused.
- Releasing version 2 of a case with a new hypothesis-revision leaves version 1's own manifest and adopted revisions reading exactly as they read before version 2 ever existed.
depends_on:
- task/case-lifecycle-persistence/relational-case-store-for-lifecycle
- task/case-lifecycle-domain-model/aggregate-types-and-structural-validation
implements:
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/every-collected-concept-has-a-read-only-capability
- rules/knowledge/the-contract-check-reads-the-current-registration
- rules/knowledge/validation-runs-at-every-read
- scenarios/knowledge/a-released-version-keeps-its-original-revision
---

## What it is

The one trigger that ever moves a version out of draft, reusing parse-case-document.ts and validate-case-coherence.ts rather than re-implementing either.
It changes nothing when it refuses.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once states two clauses — a released version and its manifest entries are never altered again (answered by this task's fourth criterion), and revising a case's content composes the next draft version instead. The second clause is not reached by any criterion of this release task. Belongs to: the task implementing case-lifecycle's create-draft / revise-hypothesis operations (originating the next draft when content is revised).
REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read states two clauses — validation runs at every read with no intermediate gate (answered by this task's first, second and third criteria as the gate release runs before transitioning state), and a replay reads the pinned version without revalidation. The replay clause is not reached by any criterion of this release task. Belongs to: the task implementing replay of a pinned case version (reproducing an old investigation) — already an existing, unchanged behavior of replayCase in case-query.service.ts, per the report; not this release operation.
