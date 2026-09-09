# Corrective increment: hypothesis-revision release guard

In `src/persistence/relational-case-store.repository.ts`, `releaseHypothesisRevisionRow` (via
`releaseHypothesisRevisionStatement`) performs an unconditional `UPDATE` setting a
`hypothesis_revisions` row's `state` to `'released'`, with no read of that row's current state
beforehand and no refusal thrown.

This means releasing an already-released hypothesis-revision, or a hypothesis-revision identity
nothing was ever stored for, succeeds silently (or silently matches zero rows) instead of being
refused.

The sibling case-version release path in the same file (`releaseVersion` →
`refuseUnlessDraftAtRelease` → `CaseVersionNotDraftAtReleaseError`) already performs this guard
correctly.

The error class `HypothesisRevisionNotDraftAtReleaseError` already exists
(`src/errors/hypothesis-revision-not-draft-at-release.error.ts`) and is already mapped to HTTP 409
in `src/errors/status-map.ts`. `src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts`
already proves the HTTP-layer mapping for this error, but only against a mocked
`releaseHypothesisRevision` function, never against the real repository — so nothing today proves
the repository itself ever throws it.

This was found during a `/reconcile` pass
(`siegard-reconcile/case-lifecycle-code-drift-batch.md` and
`siegard-reconcile/case-lifecycle-test-certification.md`) as a finding against
`rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle`.
