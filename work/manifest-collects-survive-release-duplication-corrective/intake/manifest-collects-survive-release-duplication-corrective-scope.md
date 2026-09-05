# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered).

Wrong behavior: `src/__tests__/integration/case/manifest-collects-survive-release.spec.ts` writes
the hypothesis-revision release transition as a bare SQL statement —
`UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND
revision = $4` — instead of calling `RelationalCaseStore.releaseHypothesisRevision()`, the
declared way this same initiative already delivered to perform this exact transition (already
called for the identical purpose by `release.operation.spec.ts` and
`release-hypothesis-revision.operation.spec.ts` in this same project). A future rule the store's
own `releaseHypothesisRevision` write path grows — a guard, an audit column, an event — silently
does not apply to this file's own fixture, and a reader has no way to know the two ever diverge.

Found by `/review-change`'s standard-conformance pass over the `hipotese-release-proprio`
initiative (`delivery/hipotese-release-proprio/review/hipotese-release-proprio.md`, finding at
`src/__tests__/integration/case/manifest-collects-survive-release.spec.ts`).

File: `src/__tests__/integration/case/manifest-collects-survive-release.spec.ts`

Correction, as the review already stated it: replace the raw `UPDATE` with
`await store.releaseHypothesisRevision(slug, hypothesisName, revision)` against the
`RelationalCaseStore` this file already constructs.

Project root: `/home/siegfriedneto/projects/servicedeskn1/.claude/worktrees/hipotese-release-proprio`
Target: backend
Initiative slug: `manifest-collects-survive-release-duplication-corrective` (new slug —
`work/hipotese-release-proprio` holds `closure.md` and is closed)
