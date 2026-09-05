---
title: Route diagnose-persistence-deadline-e2e.spec.ts's release fixture through the declared lifecycle operation
summary: releaseRevisionDirectly in diagnose-persistence-deadline-e2e.spec.ts now calls createCaseLifecycle(connection).releaseHypothesisRevision instead of issuing a raw SQL UPDATE against hypothesis_revisions.
task: sha256:47f9d3285174ffbed95d2416f2cbf1d814e619e736087eaeb4a35e487f14c18c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/diagnose-persistence-deadline-fixture-corrective-route-through-the-declared-lifecycle-operation-build
files:
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: releaseRevisionDirectly now delegates to createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug, identity.hypothesisName, identity.revision) instead of a hand-written UPDATE statement; the now-unused RELEASED_REVISION_STATE constant is removed. No other function in the file changed.
criteria:
- criterion: releaseRevisionDirectly's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the operation that reads the revision's own state and refuses a non-draft release with HypothesisRevisionNotDraftAtReleaseError before writing — never a hand-written UPDATE statement against hypothesis_revisions, and never the persistence layer's own unguarded write method called directly.
  met: true
  how: releaseRevisionDirectly's body is now exactly `await createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug, identity.hypothesisName, identity.revision);` — the same factory this file already constructs in placeAndReleaseRevision and seedFixture. The raw UPDATE and its RELEASED_REVISION_STATE constant are gone; no persistence-layer method is called from this file directly.
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged.
  met: true
  how: The single it() block and every assertion in assertDeadlineExceeded, seedFixture, placeAndReleaseRevision and cleanupFixture are untouched; only releaseRevisionDirectly's implementation body changed, preserving its exact signature and call sites. Confirmed by the build/suite runs below.
nodes:
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  how: The fixture no longer writes hypothesis_revisions.state directly; it reaches the revision only through the lifecycle operation that models the domain object's own state transition.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  how: releaseRevisionDirectly now moves the revision through releaseHypothesisRevision, the guarded operation that enforces the draft-to-released transition, rather than forcing the state column past that rule. Per the task's own REMAINDER note, this fixture only ever calls the operation against a draft revision and never inspects a refusal, so the rule's HTTP-409 clause, its never-stored-identity trigger and its refusal-carries-no-further-value clause are not exercised here.
preserved:
- Every existing assertion in the file's single it() block (status code, error code, error details, remainingMs bounds, message text, and the post-response read-back check).
- The delayed-connection proxy machinery (delayedQuery, wrapClient, delayedConnect, createDelayingConnection) and the deadline/cleanup timing constants — untouched.
- seedFixture's and placeAndReleaseRevision's own call shapes into releaseRevisionDirectly (same three-field identity object), so no caller needed to change.
- cleanupFixture's raw DELETE statements — out of this task's scope, since the task names only releaseRevisionDirectly's own UPDATE.
---
## What it is

Replaces diagnose-persistence-deadline-e2e.spec.ts's own raw-SQL release write with a call to the case lifecycle's guarded releaseHypothesisRevision operation, the same fix already delivered for seed.ts, case-fixture-reads-clean.spec.ts, diagnose-server.factory.spec.ts, manifest-collects-survive-release.spec.ts and revise-hypothesis.operation.spec.ts.

## Notes

None.
