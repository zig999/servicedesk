# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered).

Wrong behavior: `src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts`'s own
`releaseRevisionDirectly` helper writes the hypothesis-revision release transition as a bare SQL
statement (`UPDATE hypothesis_revisions SET state = $1 WHERE ...`) instead of calling
`CaseLifecycleOperations.releaseHypothesisRevision()` — the declared way this same initiative
already delivered to perform this exact transition, already called for the identical purpose by
`manifest-collects-survive-release.spec.ts` and `revise-hypothesis.operation.spec.ts` in this same
project, and already available in this exact file: `createCaseLifecycle(connection)` is already
constructed and used (for `placeHypothesis`, `createDraft`, `reviseHypothesis`) in the very function
(`placeAndReleaseRevision`) that calls `releaseRevisionDirectly`.

Found by `/review-change`'s standard-conformance pass over the `hipotese-release-proprio`
initiative (`delivery/hipotese-release-proprio/review/hipotese-release-proprio.md`, finding at
`src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts`).

File: `src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts`

Correction, as the review already stated it: call
`createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug, identity.hypothesisName,
identity.revision)` instead of issuing the `UPDATE` directly.

Note on this file's own trace history: `trace.py --encodes` reports no existing binding for this
exact file — it has only ever been written as a test, never listed under any implementation
record's own `encoded_at`. This project's own precedent (`case-fixture-reads-clean-collects-delete-corrective`,
and, within this session, `hypothesis-revision-release-port-test-corrective` and
`revise-hypothesis-fixture-corrective`) already established that a corrective task may be the
first delivery to bind a test file the trace did not previously know, when the fix genuinely
answers to a specification node governing that file's own content.

Project root: `/home/siegfriedneto/projects/servicedeskn1/.claude/worktrees/hipotese-release-proprio`
Target: backend
Initiative slug: `diagnose-persistence-deadline-fixture-corrective` (new slug —
`work/hipotese-release-proprio` holds `closure.md` and is closed)
