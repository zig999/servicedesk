---
title: Route manifest-collects-survive-release.spec.ts's release fixture through releaseHypothesisRevision
summary: releaseRevisionDirectly now calls the case lifecycle's guarded releaseHypothesisRevision operation instead of writing hypothesis_revisions.state with a raw SQL UPDATE.
task: sha256:bd82409178eb3f905faa46c8a46506f71e8ec556fe33d8db0a7245ec7fc8f390
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/manifest-collects-survive-release-duplication-corrective-route-through-the-declared-lifecycle-operation-build
files:
- path: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  effect: Imports createCaseLifecycle (and its CaseLifecycleOperations type) from ../../../factories/case-lifecycle.factory.js, adds a wireLifecycle() helper that calls createCaseLifecycle(pool), and rewrites releaseRevisionDirectly(slug, hypothesisName, revision) to call wireLifecycle().releaseHypothesisRevision(slug, hypothesisName, revision) instead of issuing a raw UPDATE hypothesis_revisions SET state=... statement. The now-unused RELEASED_REVISION_STATE constant is removed. Both call sites still release each fixture revision exactly once, before ReleaseOperation.release runs.
criteria:
- criterion: releaseRevisionDirectly's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the operation that reads the revision's own state and refuses a non-draft release with HypothesisRevisionNotDraftAtReleaseError before writing — never a hand-written UPDATE statement against hypothesis_revisions, and never the persistence layer's own unguarded write method called directly.
  met: true
  how: 'releaseRevisionDirectly''s body is now exactly: await wireLifecycle().releaseHypothesisRevision(slug, hypothesisName, revision). wireLifecycle() returns createCaseLifecycle(pool)''s CaseLifecycleOperations, whose releaseHypothesisRevision delegates to case/release-hypothesis-revision.operation.ts''s ReleaseHypothesisRevisionOperation — the same class release.operation.spec.ts, case-fixture-reads-clean.spec.ts, diagnose-server.factory.spec.ts and seed.ts already route through — which reads the revision''s own state via readHypothesisRevisionOwnState and throws HypothesisRevisionNotDraftAtReleaseError before calling the store''s own releaseHypothesisRevision write. No raw SQL UPDATE against hypothesis_revisions remains in this file, and the persistence layer''s RelationalCaseStore.releaseHypothesisRevision is never called directly from this fixture.'
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged.
  met: true
  how: Neither test's assertions, arrange/act ordering, or expected values were touched; only releaseRevisionDirectly's internal implementation and the file's import list changed. Both call sites release each revision exactly once while it is still in draft (the precondition the task's own ADVISORY note calls out), so the guarded operation's own-state check passes and neither test observes a refusal.
nodes:
- node: domain/knowledge/hypothesis-revision
  how: The node states a revision holds its own release — draft until a curator releases it, released and immutable from then on. This fix makes the fixture that readies a revision for the release-survives-collects scenario go through the one release trigger the domain holds — releaseHypothesisRevision — rather than writing the revision's state column directly, so the fixture no longer bypasses this node's own description of how a revision's release happens. This task states no new fact about the node; it only stops the fixture from contradicting it in a side channel.
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  how: 'The rule''s transition table (draft to released via release) is the lifecycle this task''s criterion routes the fixture through by name. The HTTP-409 clause and the refusal-carries-no-further-value clause are not exercised here, per the task''s own REMAINDER notes — this fixture calls releaseHypothesisRevision directly and never crosses HTTP, and never inspects a refusal payload. What this fixture does exercise is the forward transition itself: releaseRevisionDirectly now performs release as this rule declares it (through the guarded operation that checks draft state before writing), not as an unguarded UPDATE that could move a revision to released regardless of its prior state.'
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
inferences:
- inferred: wireLifecycle() calls createCaseLifecycle(pool) fresh per invocation (mirroring wireRelease's existing per-call construction) rather than caching one lifecycle instance in a module-level or per-test variable.
  from: 'The file''s existing convention: wireRelease(store) is itself called once per test and returns a fresh ReleaseOperation each time; no shared/cached wiring helper exists in this file. createCaseLifecycle(connection) is stateless, so constructing it once per releaseRevisionDirectly call is behaviorally identical to caching it and keeps the diff minimal.'
preserved:
- Both existing tests' assertions that a released hypothesis-revision's collects survive a direct DELETE, and that a case-version's release proceeds when its manifest inherits an already-released revision.
---
## What it is

Replaces manifest-collects-survive-release.spec.ts's own raw-SQL release write with a call to the case lifecycle's guarded releaseHypothesisRevision operation, the same fix already delivered for seed.ts, case-fixture-reads-clean.spec.ts and diagnose-server.factory.spec.ts.

## Notes

None.
