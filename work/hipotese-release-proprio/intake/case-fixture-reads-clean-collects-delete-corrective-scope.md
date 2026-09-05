# Corrective increment: case-fixture-reads-clean.spec.ts's own DELETE test permanently corrupts the shared canonical fixture

The file the wrong behavior lives in: `src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts`.

## The wrong behavior

This file's test "leaves every manifested hypothesis-revision's own collects in place after an
ordinary DELETE against those exact rows is attempted" runs a raw, unscoped
`DELETE FROM hypothesis_revision_collects WHERE case_slug = 'intermittent-connection-outage' ...`
directly against the shared canonical fixture's own collects rows, asserting the collects
survive — but the delete actually removes them permanently, corrupting the shared fixture for the
rest of this test file and for every other file that reads the same canonical case (including
this same initiative's own `seed.spec.ts`, which crashed on its second captured run reading the
same corrupted case):

```
CaseNotValidError: the case "intermittent-connection-outage" at version 1 violates its validator
rules: the case declares no hypothesis
```

Confirmed by two independent failure-diagnostician passes over two captured suite runs
(`run/seed-release-ordering-corrective-release-each-manifested-revision-before-the-case-version-suite`
and its `-suite-2` successor), the second of which traced the root cause of a 20-failure cascade
(across 7 files, including this initiative's own `seed.spec.ts`) to this exact test's own DELETE.

**Correction to the original scope, caught by the execution-contract-binder's own fresh reading
during planning:** this file's own `insertFixtureCase` *also* carries the identical
release-ordering defect the sibling corrective increment addresses in
`diagnose-server.factory.spec.ts` — `lifecycle.release(fixture.slug, draft.version)` runs at line
145, *before* `releaseManifestedRevisions(connection, fixture.slug, placed)` at line 146, and that
helper moves each revision to released via a raw SQL `UPDATE hypothesis_revisions SET state = ...`
rather than the declared `lifecycle.releaseHypothesisRevision` operation. Both defects live in the
same file and must be corrected together: the collects-survive assertion cannot be proven at all
if the fixture it depends on cannot be seeded once the release-gate this initiative delivered is
actually enforced.

## The corrective fix

1. Reorder `insertFixtureCase` so every manifested hypothesis-revision is released (via
   `lifecycle.releaseHypothesisRevision`) *before* `lifecycle.release(fixture.slug, draft.version)`
   is called, and remove the raw-SQL `releaseManifestedRevisions` helper in favor of those calls —
   the same fix already delivered for `src/seed.ts` and its sibling increment for
   `diagnose-server.factory.spec.ts`.
2. The collects-survive-DELETE test must not permanently corrupt the shared fixture for every
   other test/file that depends on it — either the deleted collects rows must be
   restored/reinserted after the assertion (within the same test, before any other test or file
   can observe the corrupted state), or the assertion must operate against a fixture instance this
   test owns exclusively rather than the shared canonical one every other file also reads.
