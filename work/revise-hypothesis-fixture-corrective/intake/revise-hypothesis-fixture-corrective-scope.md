# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered) — three
findings against one file.

Wrong behaviors, all in `src/__tests__/integration/case/revise-hypothesis.operation.spec.ts`:

1. **Stale title, superseded manifest-reference framing.** The test titled `"overwrites an
   already-named hypothesis's own highest revision in place, keeping its revision number
   unchanged, when that revision is referenced by no case version in released state"` names the
   overwrite/create branch's governing condition as whether a released case version's manifest
   references the revision — exactly the manifest-reference coupling
   `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased` states the domain
   design removed (the branch turns on the revision's own state alone). The same file states the
   correct condition ("own state") accurately in five other titles.

2. **Title contradicts its own assertion.** The test titled to assert the revise `"creates no
   revision at all"` and `"leaves the hypothesis holding only the revision it already had"`
   nonetheless queries and asserts, in its own body, that a second row — revision 2, draft — was
   created by that same revise. The title should state that a revise against a released highest
   revision creates the hypothesis's next revision (revision 2), matching the assertion.

3. **Release-write duplication.** A local helper, `releaseHypothesisRevisionOwnState`, reimplements
   the hypothesis-revision release transition as a raw SQL
   `UPDATE hypothesis_revisions SET state = 'released' ...` instead of calling the case
   lifecycle's guarded `releaseHypothesisRevision` operation — the same fix already delivered for
   seed.ts, case-fixture-reads-clean.spec.ts, diagnose-server.factory.spec.ts and
   manifest-collects-survive-release.spec.ts.

Found by `/review-change`'s specification-conformance and standard-conformance passes over the
`hipotese-release-proprio` initiative
(`delivery/hipotese-release-proprio/review/hipotese-release-proprio.md`, three separate findings
at `src/__tests__/integration/case/revise-hypothesis.operation.spec.ts`).

File: `src/__tests__/integration/case/revise-hypothesis.operation.spec.ts`

Note on this file's own trace history: `trace.py --encodes` reports no existing binding for this
exact file — it has only ever been written as a test, never listed under any implementation
record's own `encoded_at`. This project's own precedent
(`case-fixture-reads-clean-collects-delete-corrective`, and, within this session,
`hypothesis-revision-release-port-test-corrective`) already established that a corrective task may
be the first delivery to bind a test file the trace did not previously know, when the fix
genuinely answers to a specification node governing that file's own content.

Project root: `/home/siegfriedneto/projects/servicedeskn1/.claude/worktrees/hipotese-release-proprio`
Target: backend
Initiative slug: `revise-hypothesis-fixture-corrective` (new slug — `work/hipotese-release-proprio`
holds `closure.md` and is closed)
