---
title: Release a hypothesis-revision directly against its own state — proof
summary: Integration tests over ReleaseHypothesisRevisionOperation and RelationalCaseStore's two
  new methods prove the draft-to-released transition, its refusal, the refusal's empty envelope,
  manifest/case-version independence, and terminality; unit tests pin the error class's shape and
  the two new ports' import discipline.
implementation: sha256:dfe9d3337e61e0b0287ad902cd0d0f7a9154a626200956aa35e514877fcf9386
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-release-release-a-revision-directly-suite
tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "moves a hypothesis-revision from draft to released, reading its own state back as released"
    proves: "Criterion 1 — releasing a draft hypothesis-revision leaves its own state released."
    fails_when: releaseHypothesisRevision does not persist the transition (readHypothesisRevisionOwnState
      keeps answering 'draft', or the write targets the wrong row/columns).
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "refuses a further release against an already-released hypothesis-revision with this operation's
      own HypothesisRevisionNotDraftAtReleaseError, leaving its own state exactly released"
    proves: "Criterion 2 — releasing an already-released revision is refused with
      HypothesisRevisionNotDraftAtReleaseError; also distinguishes the operation's own read-then-refuse
      from a bare write, since an implementation that skipped the read and called the store's write
      directly on the second attempt would surface a raw, untyped store/trigger error instead."
    fails_when: the second releaseHypothesisRevision call either resolves, throws a different error type
      (e.g. a raw CaseStoreError from migration 0021's trigger), or the row's own state changes away from
      'released' as a side effect of the refused attempt.
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "releases a hypothesis-revision that no case version manifest ever references, without refusing
      for that absence"
    proves: "Criterion 4 — a hypothesis-revision no manifest entry names is not refused for that absence."
    fails_when: the operation or the store refuses (throws) because case_version_hypotheses holds no row
      for this revision, or the state does not read back as 'released'.
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "leaves the containing case version's own state and its manifest entry for the revision unchanged
      after the revision is released"
    proves: "Criterion 5 — no case version's own state and no manifest entry changes when a
      hypothesis-revision is released."
    fails_when: assembleVersion's .state or .manifest differs before and after the release (e.g. the case
      version's own state flips, the manifest entry's position or revision changes, or an entry is added
      or removed).
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "decides eligibility solely from the hypothesis-revision's own row, even where the containing case
      version is already released, releasing the still-draft revision rather than reaching its manifest or
      version state"
    proves: "Criterion 6 — the operation reads no case version relation and no manifest relation to decide
      whether the release may proceed; the containing version's own 'released' state must not leak into the
      revision's own eligibility decision."
    fails_when: the operation refuses (or otherwise behaves differently) because the containing case
      version's own state is 'released', showing the decision consulted case_versions or
      case_version_hypotheses rather than the revision's own row alone.
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "refuses releasing a hypothesis-revision identity no row was ever stored for, with the same
      HypothesisRevisionNotDraftAtReleaseError as one that exists but is already released"
    proves: "The implementation record's own inference that an absent (slug, hypothesis_name, revision)
      tuple is refused with the same HypothesisRevisionNotDraftAtReleaseError as a stored-but-released one,
      rather than a distinct not-found identity."
    fails_when: releasing a never-stored identity throws a different error, resolves, or throws no error at
      all.
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: "refuses overwriting a released hypothesis-revision's own content, the one other write path this
      codebase exposes against that row, leaving its own state exactly released"
    proves: "Criterion 7 — no operation this delivery adds or composes with can move a hypothesis-revision's
      own state out of released, exercised against the one other write path (overwriteHypothesisRevision)
      that could otherwise touch a released row, once release() itself produced it."
    fails_when: the overwrite attempt against a revision this operation just released succeeds, throws a
      different error, or leaves the revision's own state read back as anything other than 'released'.
  - file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
    name: "carries no context property at all, taking no constructor argument to build one from"
    proves: "Criterion 3 (and the implementation record's inference) — the error class itself declares no
      context field."
    fails_when: a `context` property is added to the error instance.
  - file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
    name: "answers its own condition through a fixed name and message, unshaped by any argument"
    proves: "Criterion 3 — the refusal reports its own condition (name) and its own message, both fixed,
      independent of any constructor argument."
    fails_when: the constructor is given a parameter that shapes .name or .message, or either value
      changes from the fixed text.
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: "answers a mapped domain error that carries no context property with only its code and its fixed
      message, holding no details key at all"
    proves: "Criterion 3 — the refusal's own condition and message are the whole of what the client-facing
      envelope reports, carrying no further value (no `details` key at all), exercised through the actual
      mechanism (hasContext/domainEnvelope) the implementation record names."
    fails_when: 'the JSON envelope gains a details key (even one set to undefined would fail a strict
      key-for-key toEqual) or the code/message differ from the error''s own name/message.'
  - file: src/__tests__/unit/case/hypothesis-revision-own-state.port.spec.ts
    name: "imports no database driver, HTTP server or web framework, so a caller depending on this port
      alone pulls in neither"
    proves: "The implementation record's own claim that hypothesis-revision-own-state.port.ts imports only
      the HypothesisRevisionState type and no database driver or HTTP framework, supporting the inferred
      narrow-single-method-port shape."
    fails_when: the port file gains an import of any listed driver or framework package.
  - file: src/__tests__/unit/case/hypothesis-revision-own-state.port.spec.ts
    name: "imports no LLM provider client, so a caller depending on this port alone pulls in neither"
    proves: same as above, for the LLM provider client package specifically.
    fails_when: the port file imports the LLM provider client package.
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: "declares no import at all, so a caller depending on this port alone pulls in nothing else"
    proves: "The implementation record's own claim that hypothesis-revision-release.port.ts declares no
      import at all."
    fails_when: any `import` statement is added to the port file.
untested:
  - The HTTP-409 registration status-map.ts adds for HypothesisRevisionNotDraftAtReleaseError is not
    exercised by a dedicated status-map test. The task's own `## Notes` states this UNDERDETERMINED — no
    criterion names the status, and a refusal answered at any status satisfies every criterion as written —
    so asserting 409 here would test a fact this task explicitly declines to claim.
  - The rare concurrent-write race (a write releasing a row between this operation's own read and its own
    UPDATE) is not exercised. The implementation record's own `deferred` section states no criterion or
    node names this race or a required outcome for it; inventing a test would assert a behavior nobody
    decided.
  - The totality of criterion 7 ("no operation the system offers") is proven here only against the two
    write paths this codebase currently exposes against hypothesis_revisions (release itself, and
    overwriteHypothesisRevision) — not against every future write path the system might ever add, which no
    test written today can foresee. The HTTP surface that would let an outside caller attempt this at all is
    explicitly deferred to the sibling task expose-the-release-hypothesis-endpoint and is not built here.
not_applicable:
  - edge_case: a dependency that fails or answers slowly
    why: this task's only dependency is the store itself (real PostgreSQL in the integration tests); no
      external network call or slow collaborator is introduced by this delivery.
  - edge_case: a duplicate where uniqueness is claimed
    why: no criterion of this task claims uniqueness over anything this delivery introduces.
  - edge_case: a boundary at each end of a stated range
    why: no criterion states a numeric range; revision numbers are assigned by the store, not bounded by
      this operation.
  - edge_case: an empty collection where one comes back
    why: releaseHypothesisRevision returns Promise<void> and readHypothesisRevisionOwnState answers a
      single value or undefined — neither returns a collection.
  - edge_case: two operations against one subject at once (the concurrent-release race)
    why: covered under `untested` above per the implementation record's own explicit deferral; no criterion
      or node names a required outcome, so no test asserts one.
---

## What it is

Integration tests over `ReleaseHypothesisRevisionOperation` and `RelationalCaseStore`'s two new methods prove the draft-to-released transition, its refusal, the refusal's empty envelope, manifest/case-version independence, and terminality.

## Notes

None.
