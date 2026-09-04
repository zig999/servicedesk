# Corrective increment: diagnose-server.factory.spec.ts's own fixture releases the case version before its manifested revisions

The file the wrong behavior lives in: `src/__tests__/integration/factories/diagnose-server.factory.spec.ts`.

## The wrong behavior

This file's own `insertFixtureCase` helper places two hypotheses onto the shared fixture case
`intermittent-connection-outage`/version 1 and then calls `lifecycle.release(...)` **without**
releasing the manifested hypothesis-revisions first — the exact ordering
`rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions` refuses.

Confirmed by two independent failure-diagnostician passes over two captured suite runs
(`run/seed-release-ordering-corrective-release-each-manifested-revision-before-the-case-version-suite`
and its `-suite-2` successor), both thrown from this file's own `beforeAll`, crashing its whole
suite (6 tests never run):

```
CaseVersionNotReleasableError: the case "intermittent-connection-outage" version 1 cannot be
released: the hypothesis "customer-equipment-fault" is manifested at a revision that is not
released; the hypothesis "area-network-outage" is manifested at a revision that is not released
```

This is the same defect `src/seed.ts` carried before its own recent correction
(`task/seed-release-ordering-corrective/release-each-manifested-revision-before-the-case-version`),
independently duplicated here.

## The corrective fix

Reorder this file's own `insertFixtureCase` helper so every manifested hypothesis-revision is
released (via `lifecycle.releaseHypothesisRevision`, or the equivalent already-declared lifecycle
operation this file already imports) *before* `lifecycle.release(fixture.slug, draft.version)` is
called — the same fix already delivered for `src/seed.ts`.
