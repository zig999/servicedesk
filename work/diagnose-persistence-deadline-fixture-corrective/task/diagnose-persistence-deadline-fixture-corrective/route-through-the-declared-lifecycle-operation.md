---
title: Route diagnose-persistence-deadline-e2e.spec.ts's own release-transition fixture through the declared lifecycle operation
summary: The fixture's own releaseRevisionDirectly helper writes the hypothesis-revision release transition as raw SQL instead of calling the declared, guarded lifecycle operation this same initiative already delivered — and already uses elsewhere in this exact file.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered.
sources:
- intake/diagnose-persistence-deadline-fixture-corrective-scope.md
objective: diagnose-persistence-deadline-e2e.spec.ts releases each fixture hypothesis-revision through the case lifecycle's guarded releaseHypothesisRevision operation, never a raw SQL UPDATE writing hypothesis_revisions.state directly.
criteria:
- releaseRevisionDirectly's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the operation that reads the revision's own state and refuses a non-draft release with HypothesisRevisionNotDraftAtReleaseError before writing — never a hand-written UPDATE statement against hypothesis_revisions, and never the persistence layer's own unguarded write method called directly.
- Running this file's own full test suite continues to pass with every existing assertion unchanged.
implements:
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
---
## What it is

Fixes diagnose-persistence-deadline-e2e.spec.ts's own releaseRevisionDirectly helper, currently a raw SQL UPDATE, to route through the case lifecycle's guarded releaseHypothesisRevision operation instead — the same fix already delivered for seed.ts, case-fixture-reads-clean.spec.ts, diagnose-server.factory.spec.ts, manifest-collects-survive-release.spec.ts and revise-hypothesis.operation.spec.ts.

## Notes

REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle's HTTP-409 clause, its never-stored-identity trigger and its refusal-carries-no-further-value clause are not exercised by any criterion here, since this fixture calls the lifecycle operation directly on a draft revision and never inspects a refusal; those belong to the tasks that deliver the release operation itself and expose it over HTTP.
ADVISORY, from the specification — criterion 2 asserts no domain fact and is backed by no candidate node; it is a delivery-level regression condition answered by the project's own suite.
