# Corrective increment: seed.ts's release ordering and its raw-SQL revision-release bypass

The file the wrong behavior lives in: `src/seed.ts`.

## The wrong behavior

`seed.ts`'s `seedCase()` releases the case version (`lifecycle.release(fixture.slug,
draft.version)`) before releasing the manifested hypothesis-revisions
(`releaseManifestedRevisions(...)` runs after), so at the moment of release every manifested
revision is still in draft state — confirmed by running `seed.spec.ts` against a genuinely
empty database, which throws:

```
CaseVersionNotReleasableError: the case "intermittent-connection-outage" version 1 cannot be
released: the hypothesis "customer-equipment-fault" is manifested at a revision that is not
released; the hypothesis "area-network-outage" is manifested at a revision that is not released
```

This is the exact refusal `rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions`
states, delivered by this same initiative's case-version-release-gate epic. The prior "green"
suite run was a false negative: the shared test database held stale released fixture rows from
an earlier run (since cleaned), which made `seed.ts`'s own `alreadySeeded()` guard skip
`seedCase()` entirely and mask the failure.

A second wrong behavior in the same file, found by the standard-conformance and
specification-conformance passes of the just-completed `/review-change`: `releaseManifestedRevisions()`
in `src/seed.ts` moves each hypothesis-revision to released state via a raw parameterized SQL
UPDATE (`UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name =
$3 AND revision = $4`) instead of calling the already-delivered `lifecycle.releaseHypothesisRevision()`
operation (delivered by this same initiative's `hypothesis-revision-own-release/release-a-revision-directly`
task), contradicting `rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle`.

## The corrective fix

Reorder `seedCase()` so every manifested hypothesis-revision is released via
`lifecycle.releaseHypothesisRevision(fixture.slug, revision.hypothesis_name, revision.revision)`
for each placed revision *before* `lifecycle.release(fixture.slug, draft.version)` is called,
and remove the raw-SQL `releaseManifestedRevisions()` helper entirely in favor of those calls.
