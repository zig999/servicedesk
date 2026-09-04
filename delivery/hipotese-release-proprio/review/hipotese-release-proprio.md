---
title: 'hipotese-release-proprio: release-gate and per-revision release backend delivery — review'
summary: Coverage, specification-conformance, and standard-conformance passes over the 11 delivered tasks of the hipotese-release-proprio initiative and the 44 files they touched; the failures pass did not run because the captured whole-change run passed cleanly.
reviewed:
- migrations/0020-hypothesis-revision-own-state.sql
- migrations/0021-refuse-altering-a-released-revision.sql
- src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
- src/__tests__/integration/case/manifest-composition.operations.spec.ts
- src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
- src/__tests__/integration/case/release.operation.spec.ts
- src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
- src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
- src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/unit/case/hypothesis-revision-own-state.port.spec.ts
- src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
- src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
- src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/error-handler.middleware.spec.ts
- src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
- src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
- src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
- src/case/case-store.port.ts
- src/case/hypothesis-revision-own-state.port.ts
- src/case/hypothesis-revision-release-state.port.ts
- src/case/hypothesis-revision-release.port.ts
- src/case/release-hypothesis-revision.operation.ts
- src/case/release.operation.ts
- src/case/revise-hypothesis.operation.ts
- src/errors/hypothesis-revision-not-draft-at-release.error.ts
- src/errors/status-map.ts
- src/factories/build-app.factory.ts
- src/factories/case-lifecycle.factory.ts
- src/factories/case-store.factory.ts
- src/http/build-app.ts
- src/http/dto/release-hypothesis-revision.dto.ts
- src/http/release-hypothesis-revision.controller.ts
- src/http/release-hypothesis-revision.routes.ts
- src/persistence/relational-case-store.repository.ts
- src/seed.ts
tasks:
- task/case-version-release-gate/refuse-a-release-manifesting-a-draft-revision
- task/fixture-revision-own-state/release-fixture-manifested-revisions
- task/hypothesis-revision-own-release/expose-the-release-hypothesis-endpoint
- task/hypothesis-revision-own-release/release-a-revision-directly
- task/hypothesis-revision-own-state/overwrite-only-while-the-revision-is-draft
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
- task/hypothesis-revision-own-state/store-the-revisions-own-state
- task/obsolete-protection-basis-tests/repoint-the-repository-overwrite-refusal-test
- task/obsolete-protection-basis-tests/retire-case-version-lifecycle-manifest-basis-assertion
- task/obsolete-protection-basis-tests/retire-manifest-basis-schema-specs
- task/revision-listing-state-disclosure/disclose-each-revisions-own-state
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/hipotese-release-proprio) passed cleanly across every step; there was no failure to diagnose
coverage:
- criterion: Releasing a draft case version every manifest entry of which references a hypothesis-revision whose own state is released is not refused by this rule.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: releases a draft case version whose manifest holds two hypothesis-revisions, each pinned at a revision whose own state is already released, not refused by this rule
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: marks a draft that holds against every rule released, recording the instant of release
- criterion: Releasing a draft case version one manifest entry of which references a hypothesis-revision whose own state is draft is refused with a CaseVersionNotReleasableError.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses releasing a draft case version whose one manifest entry references a hypothesis-revision whose own state is draft, through CaseVersionNotReleasableError naming that hypothesis
- criterion: The refusal's violations name the hypothesis of every manifest entry whose referenced revision's own state is draft.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: names every manifest entry's hypothesis whose referenced revision's own state is draft, leaving out the entry already referencing a released revision
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses releasing a draft case version whose one manifest entry references a hypothesis-revision whose own state is draft, through CaseVersionNotReleasableError naming that hypothesis
- criterion: The refusal answers HTTP 422 and introduces no error class and no error code of its own.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotReleasableError to 422
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers a second, differently-mapped domain error with its own distinct status too, showing the map is consulted rather than one error special-cased inline
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses a release violating both this rule and the coherence rule together, naming the coherence violations and the own-state violation in the one CaseVersionNotReleasableError
  why: 'The 422 and the error identity are bound through the error class rather than through a request to the release endpoint: no test in the set issues an HTTP release request whose refusal comes from this rule, so the envelope code for this path is established by the chain (gate raises CaseVersionNotReleasableError; that class maps to 422 and to its own class name as code) rather than observed on the wire.'
- criterion: A release attempt violating this rule and another release rule is refused once, with both violations named in the one CaseVersionNotReleasableError.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: refuses a release violating both this rule and the coherence rule together, naming the coherence violations and the own-state violation in the one CaseVersionNotReleasableError
- criterion: A case version whose release this rule refuses stays in draft state.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: leaves a case version in draft state, recording no release, when this rule alone refuses the release
- criterion: No hypothesis-revision a refused release referenced is altered by that attempt.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: leaves the draft hypothesis-revision a refused release referenced exactly as it read before the attempt, its own state and content unchanged
- criterion: Placing a manifest entry that pins a hypothesis-revision whose own state is draft is not refused by this rule.
  state: covered
  tests:
  - file: src/__tests__/integration/case/manifest-composition.operations.spec.ts
    name: places a hypothesis-revision at a position not yet occupied in a draft manifest
  - file: src/__tests__/integration/case/manifest-composition.operations.spec.ts
    name: does not refuse re-placing the same hypothesis at the position it already occupies, adopting a new revision there instead
- criterion: A hypothesis-revision's own state is unchanged by a manifest entry coming to reference it.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state as draft when only a case version in draft state pins it
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state as draft still, even once the case version that pins it moves to released state — releasing a case version never alters the hypothesis-revision's own state column
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision's own stored state — draft — even though a released case version's manifest still references that revision, reading the state from the revision's own row and not from the referencing case version
- criterion: After the canonical fixture setup runs, every hypothesis-revision row referenced by a manifest entry of a case version in released state reads back with its own state released.
  state: covered
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads back every hypothesis-revision the released case version's manifest references with its own state released
- criterion: After the seed script runs, every hypothesis-revision row referenced by a manifest entry of a case version in released state reads back with its own state released.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run
- criterion: The canonical fixture case reads back as a complete validated case version, with every manifest entry's revision collecting at least one concept.
  state: covered
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the fixture case whole, with no coherence violation, through the real case-query wiring over the fixture's own glossary and capability data
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads every manifest entry's revision back collecting at least one concept
  - file: src/__tests__/integration/seed.spec.ts
    name: reads the seeded version back whole, matching every field the fixture document itself declares — not only the case's root and its hypotheses' names
- criterion: An attempt to remove the collects of a fixture revision that a released case version manifests leaves those collects in place.
  state: covered
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: leaves every manifested hypothesis-revision's own collects in place after an ordinary DELETE against those exact rows is attempted
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: reads back each of two released hypothesis-revisions' own collects exactly as given, never empty, even after an ordinary DELETE against those exact rows is attempted
- criterion: src/case/release.operation.ts writes no hypothesis_revisions state, and the released state is reached through the fixture and seed setup alone.
  state: partial
  tests:
  - file: src/__tests__/integration/case/release.operation.spec.ts
    name: leaves a manifested hypothesis-revision's own state exactly as it read before release, once release() succeeds
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads back every hypothesis-revision the released case version's manifest references with its own state released
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run
  why: 'The second half — the released state arriving from the fixture and seed setup — is exercised: both setups release the manifested revisions themselves and both specs read the state back. The first half is not: on every successful ReleaseOperation.release() path in the set the manifested revisions already read released before release() runs (the release gate forces that), so "leaves a manifested hypothesis-revision''s own state exactly as it read before release" compares released to released and would still pass if release.operation.ts wrote state = released itself. No test in the set drives a successful release with a manifested or unmanifested revision still in draft afterward, and no test reads release.operation.ts''s own writes.'
- criterion: The integration specs reading the canonical fixture — seed.spec.ts, fixtures/case-fixture-reads-clean.spec.ts, the three factory specs and case/manifest-collects-survive-release.spec.ts — pass with no assertion of theirs removed or relaxed.
  state: uncovered
  why: This is a claim about a suite run and about the diff over those files, not a behavior any test asserts; nothing in the set fails if an assertion in those specs is deleted or weakened. Of the named files only seed.spec.ts, fixtures/case-fixture-reads-clean.spec.ts and case/manifest-collects-survive-release.spec.ts were supplied — the "three factory specs" are not identified and were not in the set, so which files the criterion covers cannot be established here either. No file in the supplied set carries a skipped, todo or only-marked test.
- criterion: The route is registered on the built application, so release-hypothesis is reachable with no further wiring.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches its own controller rather than answering 404, for the release-hypothesis-revision route (it.each over REGISTERED_ROUTE_REQUESTS, entry POST /v1/cases/a-slug/hypotheses/a-hypothesis/revisions/1/release)
- criterion: A well-formed release-hypothesis request naming a hypothesis-revision whose own state is draft is not refused, and that revision's own state is released afterward.
  state: partial
  tests:
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: releases a draft revision and answers 204 with a wholly empty body, calling releaseHypothesisRevision with exactly the path slug, name and revision
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: moves a hypothesis-revision from draft to released, reading its own state back as released
  why: 'The "not refused" half is exercised at the route (204, exact delegation) and the state transition is exercised against the operation directly. Nothing exercises a request producing the released state: the route test''s double changes no state, and build-app.spec registers release-hypothesis-revision with a stub dependency, so a built application wired to something other than the real operation would leave both tests passing.'
- criterion: A release-hypothesis request naming a hypothesis-revision whose own state is already released answers HTTP 409, with a body whose error identity is HypothesisRevisionNotDraftAtReleaseError and which carries no further value.
  state: covered
  tests:
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: refuses with 409 and HypothesisRevisionNotDraftAtReleaseError's own code and message, carrying no details field at all, when the named revision is already released
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers a mapped domain error that carries no context property with only its code and its fixed message, holding no details key at all
- criterion: A release-hypothesis request naming no case version and no manifest entry is not refused for their absence, and no case version's own state and no manifest entry changes as a result of the request.
  state: covered
  tests:
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: calls releaseHypothesisRevision with only slug, name and revision — no case-version or manifest identifier — and succeeds even when naming a hypothesis no manifest has ever referenced
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: releases a hypothesis-revision that no case version manifest ever references, without refusing for that absence
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: leaves the containing case version's own state and its manifest entry for the revision unchanged after the revision is released
  why: The non-refusal and the request carrying no case-version or manifest identifier are exercised at the route; the "nothing changes" half is exercised against the operation rather than through a request, since the route test's double performs no database work.
- criterion: A release-hypothesis request whose path or body fails the route's own schema answers HTTP 400, reporting a VALIDATION_ERROR error code, a message naming whether path, query or body failed, and a non-empty details list of the issues found.
  state: covered
  tests:
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: answers 400 with VALIDATION_ERROR naming the path and a non-empty details array, for a non-numeric revision segment, without ever reaching releaseHypothesisRevision
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the route with an empty string param for this segment, and releaseHypothesisRevisionParamsSchema (z.string().min(1)) is what refuses it
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: answers 400 for a revision of zero, which fails releaseHypothesisRevisionParamsSchema's positive-integer requirement, without ever reaching releaseHypothesisRevision
  why: 'Only the path branch is exercised, with the message asserted to contain "path". The body and query branches are not: the same file''s "ignores any request body sent, since the route declares no body schema and parses only its params" shows the route declares neither, so those branches of the criterion have nothing to fail against.'
- criterion: The route refuses no request for want of a credential.
  state: covered
  tests:
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: reaches the handler and answers a real 204 response, not a 401 or 403, for a request carrying no credential header at all
- criterion: Releasing a hypothesis-revision whose own state is draft leaves that revision's own state released.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: moves a hypothesis-revision from draft to released, reading its own state back as released
- criterion: Releasing a hypothesis-revision whose own state is already released is refused with a HypothesisRevisionNotDraftAtReleaseError.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: refuses a further release against an already-released hypothesis-revision with this operation's own HypothesisRevisionNotDraftAtReleaseError, leaving its own state exactly released
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: refuses releasing a hypothesis-revision identity no row was ever stored for, with the same HypothesisRevisionNotDraftAtReleaseError as one that exists but is already released
- criterion: The refusal reports its own condition and its own message as the whole of what it reports, carrying no further value.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
    name: carries no context property at all, taking no constructor argument to build one from
  - file: src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
    name: answers its own condition through a fixed name and message, unshaped by any argument
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers a mapped domain error that carries no context property with only its code and its fixed message, holding no details key at all
- criterion: Releasing a hypothesis-revision that no case version's manifest holds an entry for is not refused for that absence.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: releases a hypothesis-revision that no case version manifest ever references, without refusing for that absence
- criterion: No case version's own state and no manifest entry changes when a hypothesis-revision is released.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: leaves the containing case version's own state and its manifest entry for the revision unchanged after the revision is released
- criterion: The operation reads no case version relation and no manifest relation to decide whether the release may proceed.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: decides eligibility solely from the hypothesis-revision's own row, even where the containing case version is already released, releasing the still-draft revision rather than reaching its manifest or version state
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: releases a hypothesis-revision that no case version manifest ever references, without refusing for that absence
  why: Exercised as decision-independence in both directions — a released containing case version and a wholly absent manifest entry each leave the release proceeding. No test inspects the operation's own reads the way the trigger-body test does for the schema condition, so a read that does not inform the decision would go unnoticed.
- criterion: No operation the system offers moves a hypothesis-revision's own state out of released.
  state: covered
  tests:
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: refuses overwriting a released hypothesis-revision's own content, the one other write path this codebase exposes against that row, leaving its own state exactly released
  - file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
    name: refuses a further release against an already-released hypothesis-revision with this operation's own HypothesisRevisionNotDraftAtReleaseError, leaving its own state exactly released
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError, rather than silently discarding it, where a released case version's manifest also references that revision
  why: 'The two write paths the set exercises (release and overwrite) are both refused against a released row, and the schema-level trigger refuses any UPDATE against one. The criterion''s totality over "no operation the system offers" is not itself established: no test enumerates the operations, and no test attempts a DELETE of a released hypothesis_revisions row (the trigger the set asserts is UPDATE-scoped).'
- criterion: Revising a hypothesis whose highest existing revision's own state is draft replaces that revision's content in place and leaves its number unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: leaves exactly the revision it held before three successive revises of an unreleased highest revision, reading the content of the most recent of them afterward
- criterion: Revising a hypothesis whose highest existing revision's own state is released creates that hypothesis's next revision, in draft state, leaving the released revision's content unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates the next revision rather than overwriting it, and leaves an already-released revision's own state and content exactly as they were, when a further revise is attempted against it
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates no revision at all — leaves the hypothesis holding only the revision it already had — when the highest existing revision's own state is released and no case version's manifest references it, other than the one draft revision the create branch itself just wrote
- criterion: Revising a hypothesis whose highest existing revision's own state is released and which no case version's manifest references creates the next revision rather than replacing that revision.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates no revision at all — leaves the hypothesis holding only the revision it already had — when the highest existing revision's own state is released and no case version's manifest references it, other than the one draft revision the create branch itself just wrote
- criterion: Revising a hypothesis whose highest existing revision's own state is draft replaces that revision in place even where a case version in released state references it.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: replaces the highest existing revision's content in place, leaving its number unchanged, when that revision's own state is draft even though a case version in released state references it
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates no second revision row at all when the highest existing revision's own state is draft, even though a case version in released state references it
- criterion: Revising a hypothesis that holds no revision yet creates revision 1.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: originates a never-named hypothesis's own identity and its first revision, numbered 1
- criterion: The revise answers the number of the revision it wrote in the replace branch and in the create branch alike.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates the next revision rather than overwriting it, and leaves an already-released revision's own state and content exactly as they were, when a further revise is attempted against it
- criterion: The revise's answer holds no field whose value differs between the replace branch and the create branch.
  state: unauditable
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: answers exactly hypothesis_name and revision — no field naming which branch ran — whether the revise replaced a revision in place or created the next one
  why: 'As stated the criterion cannot hold and so cannot be looked for: the answer''s revision field necessarily differs between the branches, and the same file''s own tests show it (1 in the replace branch, 2 in the create branch). Under the reading the named test takes — no field disclosing which branch ran, the two answers carrying identical keys — it is bound by that test. Which of the two the task means is not settled here.'
- criterion: A case version in released state still references the revision its manifest referenced before a later revise of the same hypothesis, and that revision's content reads unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: leaves a released case version's manifest referencing the same revision it referenced before a later revise of the same hypothesis creates the next revision, when the referenced revision's own state was already released
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: leaves that already-referenced revision's own content reading exactly as it did before a later revise of the same hypothesis creates the next revision
- criterion: The port the operation reads the revision's own state through imports no database driver, no HTTP framework and no LLM client.
  state: covered
  tests:
  - file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
    name: imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither
  - file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
    name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
  why: The port held to these two tests is hypothesis-revision-release-state.port.ts, which declares readHighestRevisionReleaseState — the read revise-hypothesis.operation.ts performs. The forbidden set is a fixed list of package names, so an import of an unlisted driver or client would pass.
- criterion: An attempt to alter a stored hypothesis-revision whose own state is released is refused at the point of the attempt, reporting a ReleasedHypothesisRevisionNotAlterableError.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError, rather than silently discarding it, where a released case version's manifest also references that revision
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses an overwrite attempt against a revision whose own state is released, through the same typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's manifest has ever referenced that revision
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError rather than silently succeeding, when the read the write branch acted on had already gone stale — the revision's own state was set to released for real between that read and the write it drove
- criterion: An attempt to alter a stored hypothesis-revision whose own state is draft is not refused by this rule, even where a case version in released state references that revision.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: leaves an update through unrefused on a hypothesis-revision whose own state is draft, even though a released case version's manifest references that revision
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even though a released case version's manifest still references that revision
- criterion: A hypothesis-revision whose own state is released and which no case version's manifest has ever referenced is refused alteration the same way.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released even though no case version has ever referenced it, raising ReleasedHypothesisRevisionNotAlterableError
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses an overwrite attempt against a revision whose own state is released, through the same typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's manifest has ever referenced that revision
- criterion: The condition the refusal fires on names the hypothesis-revision row's own state and reads no case version relation and no manifest relation.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: names only hypothesis_revisions' own state column in hypothesis_revisions_refuse_when_released()'s body, reading no case_version_hypotheses or case_versions relation
- criterion: The collects of a hypothesis-revision whose own state is released read back unchanged after an attempt to remove them.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: reads back a released hypothesis-revision's own collects exactly as they were stored, after an ordinary DELETE against those exact rows is attempted
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: reads back each of two released hypothesis-revisions' own collects exactly as given, never empty, even after an ordinary DELETE against those exact rows is attempted
- criterion: The collects of a hypothesis-revision whose own state is draft may still be removed, even where a case version in released state references that revision.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: removes a draft hypothesis-revision's own collects through an ordinary DELETE, even where a released case version's manifest references that revision
- criterion: Applying every migration script to an empty database in numbered order, with no step performed by hand, produces a hypothesis-revision relation holding a state column.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: gives hypothesis_revisions a state column after applying every migration script, in numbered order, to an empty database
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: applies every migration script, in the order their file names number them, to a fresh empty database and produces every relation the model needs and none it does not
- criterion: The state column admits the values draft and released and refuses any other value.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts draft and released for a hypothesis-revision's own state and refuses a third value through a CHECK violation
- criterion: The state column is not nullable, so every stored hypothesis-revision names exactly one state.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses storing a hypothesis-revision whose state is explicitly null
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the twelve columns the model declares optional
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: defaults a hypothesis-revision's state to draft when an insert names no state at all
- criterion: Every column the migration adds pairs with an attribute domain/knowledge/hypothesis-revision declares.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: adds hypothesis_revisions exactly one new column, state, when migration 0020 runs on top of every migration before it
  why: The test binds the added-column set to exactly [state], so any further column the migration added would fail it. Whether state itself pairs with an attribute the domain node declares is a specification-conformance reading no test in the set makes.
- criterion: A revision revise-hypothesis inserts reads back with its own state draft.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: reads back with its own state draft, the revision revise-hypothesis originates by inserting
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates no revision at all — leaves the hypothesis holding only the revision it already had — when the highest existing revision's own state is released and no case version's manifest references it, other than the one draft revision the create branch itself just wrote
- criterion: A revision whose content revise-hypothesis replaces in place reads back with its own state unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the replacement's own criterion and resolution, once that revision is read back after the overwrite
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite assigns no revision number the hypothesis had already assigned elsewhere
  why: Exercised for a draft revision, where the read-back asserts state draft after the in-place replacement. The released case cannot arise — an in-place replacement against a released revision is refused — so "unchanged" is exercised only at draft.
- criterion: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts holds no test asserting an overwrite is refused because a released case version still references the revision.
  state: uncovered
  why: 'A claim about that spec file''s own content, which no test in the set asserts: reintroducing a manifest-basis overwrite-refusal test there would break nothing. Read directly, the condition holds — the file''s two overwrite-refusal-related tests state the refusal from the revision''s own released state ("...even though no case version''s manifest has ever referenced that revision") and the non-refusal from its own draft state ("...even though a released case version''s manifest still references that revision").'
- criterion: The spec asserts that an overwrite attempted against a hypothesis-revision whose own state is released is refused through a distinguishable error.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses an overwrite attempt against a revision whose own state is released, through the same typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's manifest has ever referenced that revision
- criterion: The spec asserts that an overwrite attempted against a hypothesis-revision whose own state is draft is not refused by this rule, even where a released case version's manifest references that revision.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even though a released case version's manifest still references that revision
- criterion: The spec holds exactly one test asserting the refusal of an overwrite against a revision whose own state is released.
  state: uncovered
  why: A count over the spec file's own tests; nothing in the set fails if a second such test is added. Read directly the count is one — the released-own-state overwrite refusal is asserted once, in "refuses an overwrite attempt against a revision whose own state is released, through the same typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409...".
- criterion: The relational case store repository spec passes in full with no test skipped and no assertion relaxed.
  state: uncovered
  why: A property of a suite run and of the diff over the file, not a behavior any test asserts. The file carries no skipped, todo or only-marked test, but whether an assertion was weakened cannot be read off the file as it stands, and the run record — not this set — is where a pass is evidenced.
- criterion: case-version-lifecycle-schema.spec.ts holds no assertion that an update against a hypothesis-revision's stored columns is refused, or left without effect, because a released case version's manifest references it.
  state: uncovered
  why: 'A claim about that file''s own content, which no test asserts. Read directly the condition holds: its one hypothesis_revisions UPDATE test asserts the update succeeds ("changes an already-stored hypothesis revision''s own columns on an ordinary UPDATE when no released case version references it"), and the refusal assertions the file retains are against case_versions rows and manifest entries, not against a hypothesis-revision''s columns. Worth a reader''s attention that this retained test still frames its own precondition in manifest-basis terms rather than the revision''s own state.'
- criterion: Any test the file retains that asserts this immutability asserts it from the hypothesis-revision row's own released state.
  state: uncovered
  why: 'No test asserts a property of that file. Read directly the criterion is vacuous: the file retains no test asserting a hypothesis-revision''s immutability at all — its only hypothesis_revisions UPDATE test asserts the update goes through — so there is nothing for the own-state basis to hold of, and nothing would fail if a manifest-basis immutability test were added back.'
- criterion: The file's own tests pass in full, with no test skipped and no assertion relaxed.
  state: uncovered
  why: A property of a suite run, not a behavior any test asserts. The file carries no skipped, todo or only-marked test; whether an assertion was relaxed is a diff question the run record answers, not this set.
- criterion: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts holds no assertion that an update is rejected because a released case version's manifest references the revision.
  state: uncovered
  why: 'A claim about that file''s own content, which no test asserts. Read directly it holds: all four retained tests assert an update going through unrefused, none asserts a rejection at all.'
- criterion: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts holds no assertion that a revision's stored content is left unchanged because a released case version's manifest references it.
  state: uncovered
  why: 'A claim about that file''s own content, which no test asserts. Read directly it holds: every retained content read-back in the file asserts the *new* criterion text after a permitted update, never an unchanged one attributed to a released manifest reference.'
- criterion: src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts holds no assertion that a revision's collects survive removal because a released case version's manifest references it.
  state: uncovered
  why: 'A claim about that file''s own content, which no test asserts. Read directly it holds: the file retains two tests — a collects DELETE that succeeds under a still-draft case version''s manifest, and a collects UPDATE left without effect — and neither asserts survival on a released manifest reference.'
- criterion: Every assertion removed from either file has an equivalent assertion, stated against the hypothesis-revision row's own state, standing somewhere in the persistence schema suite.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError, rather than silently discarding it, where a released case version's manifest also references that revision
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released even though no case version has ever referenced it, raising ReleasedHypothesisRevisionNotAlterableError
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: reads back a released hypothesis-revision's own collects exactly as they were stored, after an ordinary DELETE against those exact rows is attempted
  why: The own-state equivalents do stand and are load-bearing — refusal of an update against a released revision, and survival of a released revision's collects under a DELETE. What is unexercised is the "every" — the set of assertions removed from the two files cannot be recovered from the files as they now stand, and no test establishes the mapping, so a removed assertion with no standing equivalent would go unreported.
- criterion: Any test either file retains asserts the refusal from the hypothesis-revision row's own state and names no case_versions and no case_version_hypotheses relation.
  state: uncovered
  why: 'No test asserts a property of those files, so nothing fails if a retained test reaches for a case-version relation. Reading them, the criterion also admits two answers and this audit does not settle which the task means: if the clause binds every retained test, it is departed from — revision-alteration-refused-only-when-released-schema.spec.ts retains tests that insert case_versions rows and case_version_hypotheses manifest entries ("...only a draft-state case version''s manifest references", "...a released case version''s manifest does not reference"), and protect-released-hypothesis-revision-collects-schema.spec.ts retains one that does the same; if it binds only tests asserting the refusal, it is vacuous, because neither file retains a test asserting a refusal at all.'
- criterion: An alteration aimed at a hypothesis-revision whose own state is draft is asserted not to be refused by this rule, even where a released case version's manifest references that revision.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: leaves an update through unrefused on a hypothesis-revision whose own state is draft, even though a released case version's manifest references that revision
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even though a released case version's manifest still references that revision
- criterion: Replaying every migration file in filename order onto an empty schema and running these files' tests passes with no test skipped.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
    name: drops the unconditional hypothesis_revisions_no_update rule and installs the release-conditioned trigger on hypothesis_revisions once every migration script has been applied in its numbered order
  why: 'The replay half is exercised: both files apply every .sql file in sorted filename order onto a freshly created schema in beforeAll, and the named test asserts the post-replay state of pg_rules and pg_trigger. The run half — that these files'' tests pass with no test skipped — is a property of a run no test asserts (neither file carries a skipped, todo or only-marked test). One over-assertion to route: that same test asserts pg_trigger for hypothesis_revisions toEqual exactly [{ tgname: ''hypothesis_revisions_no_update_when_released'' }], a totality over the table''s non-internal triggers that the criterion does not state and that breaks the day any sibling task legitimately adds a second trigger there.'
- criterion: Every revision the listing answers carries its own state.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries every answered revision's own state, reading the field as draft for a revision left at its schema default across a multi-revision page
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data, limit, offset, pageCount and total — and each revision item carrying exactly revision, criterion, collects, resolution and state, never hypothesis_name
- criterion: A revision whose own stored state is released is answered as released.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is released as released
- criterion: A revision whose own stored state is draft is answered as draft.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is draft as draft
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries every answered revision's own state, reading the field as draft for a revision left at its schema default across a multi-revision page
- criterion: The state a revision is answered with is read from that revision's own stored state and from no case version that references it.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision's own stored state — draft — even though a released case version's manifest still references that revision, reading the state from the revision's own row and not from the referencing case version
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is released as released
- criterion: The listing answers a hypothesis's revisions ordered by revision number descending, highest first.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a hypothesis holding three revisions ordered by revision number descending, the highest revision first
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every revision the named hypothesis currently holds, by its own full content, each revision's own collects grouped to it alone and never conflated with another revision of the same hypothesis
- criterion: The listing answers one page selected by the requested offset and limit, together with the total number of revisions that hypothesis holds.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the page a middle offset selects under descending order — the second- and third-highest revisions, not the two most recently inserted
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named hypothesis's own revisions — the given limit and offset echoed back, the page itself held to that limit even though the hypothesis holds more revisions, and pageCount computed from total and limit
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: passes the path's own slug and hypothesis name and the query's own offset and limit through to the case query unchanged, when both are given and within bounds
findings:
- pass: conformance
  file: migrations/0021-refuse-altering-a-released-revision.sql
  where: the CREATE OR REPLACE RULE hypothesis_revision_collects_no_delete_when_released, lines 60-70
  evidence: "CREATE OR REPLACE RULE hypothesis_revision_collects_no_delete_when_released AS\n  ON DELETE TO hypothesis_revision_collects\n  WHERE EXISTS (\n    SELECT 1\n    FROM hypothesis_revisions hr\n    WHERE hr.case_slug = OLD.case_slug\n      AND hr.hypothesis_name = OLD.hypothesis_name\n      AND hr.revision = OLD.revision\n      AND hr.state = 'released'\n  )\n  DO INSTEAD NOTHING;\n"
  cost: A DELETE issued against a released revision's own collects rows completes with no exception and no error at all — the statement simply affects zero rows — so nothing translates it into ReleasedHypothesisRevisionNotAlterableError or an HTTP 409; the same alteration attempt the trigger above refuses loudly is, for the collects half of the revision's own declared content, accepted and left with no effect, which is the exact outcome the node names as what refusal must replace rather than reproduce.
  correction: replace the DO INSTEAD NOTHING rewrite rule with a mechanism that raises 'ReleasedHypothesisRevisionNotAlterableError' (e.g. a BEFORE DELETE trigger mirroring hypothesis_revisions_refuse_when_released()) so a DELETE against a released revision's collects is refused rather than silently absorbed.
- pass: conformance
  file: src/__tests__/integration/case/manifest-composition.operations.spec.ts
  where: the test 'does not refuse removing a hypothesis name that is not part of the manifest, even where the manifest holds only one entry', lines 278-287
  evidence: 'await expect(removeHypothesis(store, { slug, version, hypothesis_name: ''never-placed'' })).resolves.toBeUndefined();'
  cost: the decision that remove-hypothesis silently succeeds (rather than refusing, e.g. with a not-found error) for a hypothesis name never placed in the manifest lives only in this test and in the operation's own implementation; a reader consulting the specification for what remove-hypothesis answers on an absent hypothesis name finds nothing, and a later change making that call refuse instead would break no documented contract
  correction: state, in the node governing remove-hypothesis, whether removing a hypothesis name absent from the manifest succeeds as a no-op or is refused
- pass: conformance
  file: src/__tests__/integration/case/release-hypothesis-revision.operation.spec.ts
  where: the sixth `it` (lines 271-283), 'refuses releasing a hypothesis-revision identity no row was ever stored for, with the same HypothesisRevisionNotDraftAtReleaseError as one that exists but is already released'
  evidence: "const refusal = await operation.releaseHypothesisRevision(slug, 'a-never-stored-hypothesis', 1).catch((error: unknown) => error);\n\n    expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);"
  cost: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle states, as a decided part of its own statement, that the state the revision stood in 'is released whenever this refusal is raised' — a claim its decision-log entry grounds in the state machine holding only draft and released. This test locks in a second trigger the rule never named — an identity no row was ever stored for — so a reader trusting the rule's own text to know what the refusal implies would wrongly conclude the revision was released, when the source's own test proves it may never have existed at all.
  correction: Either the rule is amended to also name a hypothesis-revision identity nothing was ever stored for as a trigger of this same refusal (dropping or qualifying 'released whenever this refusal is raised'), or the operation is changed to answer a never-stored identity differently from an already-released one.
- pass: conformance
  file: src/__tests__/integration/case/release.operation.spec.ts
  where: line 306, the assertion in "refuses releasing a version that is not in draft state..."
  evidence: 'expect((refusal as CaseVersionNotDraftAtReleaseError).context).toEqual({ slug, version, state: ''released'' });'
  cost: the test binds CaseVersionNotDraftAtReleaseError's refusal to a specific context shape — slug, version and the state the version stood in — as a fact of the domain; the specification's own state-machine node for this exact refusal states only the error identity and its HTTP status, and its sibling rule for the analogous hypothesis-revision refusal explicitly decided the refusal carries no further value at all, in particular never the state. A reader who wants to know what a case-version lifecycle refusal discloses will look at the node and find nothing said either way, while this test has already made the decision for it.
  correction: state, for domain/knowledge/case-version's own not-draft-at-release refusal, whether the refusal's context may carry slug, version and state, the way rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle already decided for its sibling refusal
- pass: conformance
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: the it() title at lines 258-260
  evidence: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state
  cost: A reader learning the overwrite/create branch's governing condition from this title concludes it turns on whether a released case version's manifest references the revision — exactly the manifest-reference coupling the node's own description says the domain design removed. The same file states the correct condition ('own state') accurately in five other titles, so this one title is the sole place in the file where the superseded model reads as the rule's actual test subject.
  correction: reword the title to name the actual governing condition exercised — the revision's own state (draft, in this scenario) — rather than whether a case version references it.
- pass: conformance
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: the it() title at lines 307-310, against its own assertion at lines 327-330
  evidence: 'creates no revision at all — leaves the hypothesis holding only the revision it already had — when the highest existing revision''s own state is released and no case version''s manifest references it, other than the one draft revision the create branch itself just wrote ... expect(rows).toEqual([{ revision: 1, criterion: ''the original text'', state: ''released'' }, { revision: 2, criterion: ''the created text'', state: ''draft'' }]);'
  cost: The title asserts the revise 'creates no revision at all' and 'leaves the hypothesis holding only the revision it already had,' while the test's own query proves a second row — revision 2, draft — was created by that same revise. A reader relying on the title rather than the assertion would believe the create-the-next-revision branch never fires in this scenario, when the body is exactly the scenario where it does fire.
  correction: reword the title to state that a revise against a released highest revision creates the hypothesis's next revision (revision 2), matching the assertion.
- pass: conformance
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: the fourth it(...) block, lines 257-278
  evidence: "for (const entry of fixture.manifest) {\n  await connection.query(\n    'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n    [SLUG, entry.hypothesis_name],\n  );\n}\n\nfor (const entry of fixture.manifest) {\n  const { rows } = await connection.query<{ concept_name: string }>(\n    'SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n    [SLUG, entry.hypothesis_name],\n  );\n  expect(rows.map((row) => row.concept_name).sort()).toEqual([...entry.collects].sort());\n}\n"
  cost: 'By this point every revision named in the fixture''s manifest has been released, so this test attempts a DELETE against a released hypothesis-revision''s own stored content — its collects. The query is awaited with no try/catch and no rejection assertion, and the test then asserts the rows are unchanged: it locks in, as verified passing behavior, that this alteration attempt is silently accepted and left with no effect. The decision log for this node records exactly the opposite as decided: refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError, rather than accepted and left with no effect. A reader trusting this suite comes away believing the silent-no-op protection is the correct, specified behavior for altering a released revision''s content, when the specification explicitly rejected that shape.'
  correction: The test should assert that the DELETE attempt is refused (rejects, or otherwise surfaces an explicit error) rather than asserting the rows are silently left unchanged with no error raised.
- pass: conformance
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: the test titled "changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released case version references it", lines 287-302
  evidence: it("changes an already-stored hypothesis revision's own columns on an ordinary UPDATE when no released case version references it", async () => {
  cost: beforeAll applies every migration file in the directory, including 0021, which replaces the trigger's condition from a join against case_version_hypotheses/case_versions to OLD.state = 'released' on the revision's own column — the join this title still names is gone by the time this suite runs. A reader trusting this title to state what actually gates the write learns a mechanism this schema no longer implements; the row is in fact mutable here only because insertHypothesisRevision leaves state at its DEFAULT 'draft', never because any case version does or doesn't reference it.
  correction: state the condition the current trigger actually reads — e.g. "...on an ordinary UPDATE while the revision's own state is draft" — dropping the case-version-reference framing 0021 retired.
- pass: conformance
  file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
  where: the last `it` block (lines 259-276), "reads back a released hypothesis-revision's own collects exactly as they were stored, after an ordinary DELETE against those exact rows is attempted"
  evidence: "await client.query(\n      'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',\n      [slug, 'the-hypothesis'],\n    );\n\n    const collects = await readRevisionCollects(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });\n    expect(collects).toEqual(['a-collected-concept']);\n"
  cost: The suite asserts, without wrapping the DELETE in a rejection expectation the way the two UPDATE tests in the very same file do, that removing a released revision's own collect succeeds silently and simply has no visible effect. A reader of this file learns that a released revision's stored content is protected by silent no-ops for its collects and by an explicit ReleasedHypothesisRevisionNotAlterableError refusal for its criterion — two different answers to the same guarantee, with the silent one going undetected by anything that checks for an error the way the sibling tests do.
  correction: The DELETE should be asserted to fail the same way the UPDATE tests do — rejecting with code P0001 and a message containing ReleasedHypothesisRevisionNotAlterableError — and the trigger/rule enforcing it (hypothesis_revision_collects_no_delete_when_released, currently `DO INSTEAD NOTHING`) would need to raise that error instead of discarding the DELETE silently.
- pass: conformance
  file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  where: the test title (line 12) and its assertion (line 15)
  evidence: it('declares no import at all, so a caller depending on this port alone pulls in nothing else', async () => { ... expect(IMPORT_LINE_PATTERN.test(source)).toBe(false); });
  cost: constraints/the-domain-depends-on-no-infrastructure forbids only framework, driver and provider-client imports and explicitly permits infrastructure to reach the domain layer through ports — a sibling port (hypothesis-revision-release-state.port.ts) legitimately imports a domain type (HypothesisRevisionState) without violating it. This test instead pins a stricter, unstated rule — zero imports of any kind — as if it were the specification's own boundary. If this port ever legitimately needed a domain-internal type import (as its sibling does), this test would fail it even though nothing in the specification forbids that; the next reader who wants to know why 'no import at all' is required will look in the specification and find only the narrower framework/driver/client rule.
  correction: narrow the assertion (and its stated rationale) to check for the absence of framework, driver or provider-client imports specifically — matching constraints/the-domain-depends-on-no-infrastructure — rather than the absence of any import at all; or, if a stricter zero-import rule for ports is truly intended as a business/architecture decision, have it decided into the specification rather than asserted only here.
- pass: conformance
  file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  where: still answers 500 with the unchanged generic envelope for a typed domain error the status map does not name, lines 88-95
  evidence: 'expect(response.statusCode).toBe(500); expect(response.json()).toEqual({ error: { code: ''INTERNAL_ERROR'', message: ''an unexpected error occurred'' } });'
  cost: The exact fallback identity for a domain error the status map does not name — the code INTERNAL_ERROR and the fixed message an unexpected error occurred — is asserted here as a fact of the system's behavior, but no node states it. Every other named refusal this specification declares states its own code and shape as a node; this one lives only in the test and the middleware it exercises, so a reader auditing what an unmapped error tells a caller will not find it in the specification, and a later change to that wording would contradict nothing the specification says.
  correction: state, as a system-scoped constraint alongside constraints/a-malformed-request-is-refused-with-a-validation-error, the shape a domain error the status map does not name is answered with — its code and that it carries a fixed message and no further detail.
- pass: conformance
  file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  where: never lets an unmapped error's own message or context reach the client, lines 105-112
  evidence: expect(response.body).not.toContain('a-secret-slug'); expect(response.body).not.toContain('a sensitive violation');
  cost: Whether an unmapped domain error's own message and constructor context ever reach the caller is an information-disclosure decision that belongs to the specification rather than to code, and no node states it. The guarantee currently exists only as this test's assertion against the middleware; a later change that let such details leak would not visibly contradict anything the specification records.
  correction: state, as part of the same generic-refusal constraint, that a domain error the status map does not name is answered without its own message or constructor context reaching the caller.
- pass: conformance
  file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  where: the CaseNotFoundError-on-unknown-slug test, line 146
  evidence: 'expect(body.error.details).toEqual({ slug: ''an-absent-slug'', version: 0 });'
  cost: This locks the exact payload a case-not-found 404 discloses (a details object naming slug and version) into a test as though the business had decided that shape. rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused — the node governing this exact refusal — only says refused with an HTTP 404 response reporting a CaseNotFoundError, and decision-log.md's entry for that node's statement field records that only the status and the error name were pulled from the delivered code; the details payload was left out of what was decided. A reader checking what a case-not-found refusal is allowed to disclose will find the answer only in this test, not in the node that owns the refusal.
  correction: Either decide, and record against rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused, what a case-not-found refusal's response details must carry, or drop the details-shape assertion here and assert only the code, matching what the node currently states.
- pass: conformance
  file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
  where: the it block at lines 165-178, answers the unchanged generic envelope, never a partial body or leaked detail, when releaseHypothesisRevision rejects with a generic, non-domain error
  evidence: 'expect(response.statusCode).toBe(500); expect(response.json()).toEqual({ error: { code: ''INTERNAL_ERROR'', message: ''an unexpected error occurred'' } });'
  cost: the exact refusal a caller receives for any failure the domain does not name — status 500, code INTERNAL_ERROR, the fixed message an unexpected error occurred, and that no further detail ever leaks — is pinned only here (and in the shared middleware this test exercises); a reader who goes to the specification to learn what any route promises when nothing domain-specific goes wrong finds nothing, even though the sibling case, a malformed request, is written up as its own constraint for exactly this reason.
  correction: state, alongside constraints/a-malformed-request-is-refused-with-a-validation-error, a system-wide constraint for the refusal a route gives when it fails for a reason no domain rule names — the status, the code, the fixed message and the no-leak guarantee.
- pass: conformance
  file: src/case/release-hypothesis-revision.operation.ts
  where: the refuseNonDraft function, lines 25-29, applied to a state read that may be undefined
  evidence: "function refuseNonDraft(state: HypothesisRevisionState | undefined): void {\n  if (state !== DRAFT_STATE) {\n    throw new HypothesisRevisionNotDraftAtReleaseError();\n  }\n}"
  cost: 'The rule''s own statement grounds HypothesisRevisionNotDraftAtReleaseError''s silence about which state the revision stood in on a specific claim: the state the revision stood in is released whenever this refusal is raised — and the decision log ties that to the enumeration holding exactly draft and released, so a caller reading the error by the rule''s own reasoning learns the identity named a revision that exists and is already released. Here state is typed HypothesisRevisionState | undefined, so the identical refusal also fires when readHypothesisRevisionOwnState finds no row at all — a revision that was never released, or ever stored, at that identity. The refusal''s documented meaning stops matching what actually triggers it: a curator who mistyped a hypothesis name or revision number reads the same signal as a curator who is one release too late.'
  correction: Either give the not-found case its own refusal distinct from HypothesisRevisionNotDraftAtReleaseError, or amend the rule's stated invariant so it no longer asserts the revision's state is released whenever this refusal is raised.
- pass: conformance
  file: src/case/revise-hypothesis.operation.ts
  where: refuseWithoutDraft, lines 47-52, together with refuseConceptsRefusingSubject / conceptsRefusingSubjectOf, lines 102-119
  evidence: const draftVersion = await this.caseStore.findDraftVersion(slug); if (draftVersion === undefined) { throw new CaseHoldsNoDraftError(slug); } ... const refusing = conceptsRefusingSubjectOf(resolutions, input.subject);
  cost: the draft version this operation itself fetches is discarded after the undefined check, and the concept-acceptance check is run against input.subject — a value the caller supplies independently on the input DTO — rather than against any attribute read off that draft version; a caller that supplies a subject other than the one the case's own draft actually declares gets a check validated against a fabricated subject type, and nothing in this file would catch the mismatch.
  correction: read the subject type off the draft version returned by findDraftVersion (or otherwise verify input.subject against it) before using it in conceptsRefusingSubjectOf, so the check uses that draft version's own declared subject type rather than an unverified caller-supplied field.
- pass: conformance
  file: src/errors/status-map.ts
  where: the STATUS_BY_ERROR_CLASS entry for CaseVersionNotReleasedError, line 53
  evidence: '[CaseVersionNotReleasedError, 409],'
  cost: the refusal rules/investigation/only-a-released-case-version-is-diagnosed states (a draft version may be read but never diagnosed against) never names a status or an error identity for it; this map is the only place that says the refusal is HTTP 409 and specifically CaseVersionNotReleasedError, so the next reader who wants to know what diagnose answers for a draft-pinned version has to read this file rather than the specification, and the next change to the mapping has no node text to be held to.
  correction: state the HTTP status and the error identity in rules/investigation/only-a-released-case-version-is-diagnosed, the way rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle already names HypothesisRevisionNotDraftAtReleaseError at 409 for its own refusal
- pass: conformance
  file: src/seed.ts
  where: seedCase(), the release ordering at the placeFixtureHypotheses/lifecycle.release/releaseManifestedRevisions sequence
  evidence: "const placed = await placeFixtureHypotheses(fixture.slug, draft.version);\n  await lifecycle.release(fixture.slug, draft.version);\n  await releaseManifestedRevisions(connection, fixture.slug, placed);"
  cost: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions requires a release to be refused whenever the version's manifest still names a draft hypothesis revision. Here the case-version release (lifecycle.release) runs before the manifested revisions are moved to released (releaseManifestedRevisions runs after), so at the moment of release every manifested revision is still draft — the exact state this rule exists to refuse. Either the gate this initiative just delivered does not apply here for a reason nothing in this file states, or the seed script releases a case version the rule says must be refused.
  correction: Release each manifested hypothesis revision before releasing the case version, or otherwise establish (and state) why seedCase()'s ordering is exempt from the rule.
- pass: conformance
  file: src/seed.ts
  where: releaseManifestedRevisions(), the raw SQL UPDATE moving each revision to released
  evidence: UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = $4
  cost: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle governs how a hypothesis revision's state changes; the operation layer already exposes releaseHypothesisRevision() as the declared way to do this transition (delivered by release-a-revision-directly). This function bypasses it with a direct UPDATE, so the seed script and the declared lifecycle operation are two independent homes for the same transition, and a future change to the operation's own guard would not apply here.
  correction: Call lifecycle.releaseHypothesisRevision() (or the equivalent operation-layer method) for each placed revision instead of writing to hypothesis_revisions directly.
- pass: standard
  file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  where: releaseRevisionDirectly (lines 153-158)
  evidence: "async function releaseRevisionDirectly(slug: string, hypothesisName: string, revision: number): Promise<void> {\n  await pool.query(\n    'UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = $4',\n    [RELEASED_REVISION_STATE, slug, hypothesisName, revision],\n  );\n}\n"
  cost: This file still writes the released transition as a bare SQL UPDATE, even though this same change adds RelationalCaseStore.releaseHypothesisRevision (which release.operation.spec.ts and release-hypothesis-revision.operation.spec.ts already call for the identical purpose in this same PR). Any future rule the store's own releaseHypothesisRevision write path grows — a guard, an audit column, an event — silently does not apply to this fixture, and a reader has no way to know the two ever diverged.
  cites: MNT-03
  correction: Replace the raw UPDATE with `await store.releaseHypothesisRevision(slug, hypothesisName, revision)` against the RelationalCaseStore already constructed in this file.
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: releaseHypothesisRevisionOwnState (lines 164-169)
  evidence: "async function releaseHypothesisRevisionOwnState(fixture: IFixture, hypothesisName: string, revision: number): Promise<void> {\n  await pool.query(\n    \"UPDATE hypothesis_revisions SET state = 'released' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3\",\n    [fixture.slug, hypothesisName, revision],\n  );\n}\n"
  cost: The exact write this helper performs is now the RelationalCaseStore's own releaseHypothesisRevision method; this file bypasses it with its own copy of the UPDATE, so a change to the real release write path (e.g. a future guard or side effect) is not exercised by any of this file's fixtures, and the two copies can silently disagree.
  cites: MNT-03
  correction: Use `createCaseStore(pool).releaseHypothesisRevision(fixture.slug, hypothesisName, revision)` (the store this file already constructs via createCaseStore) instead of a hand-written UPDATE.
- pass: standard
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: releaseManifestedRevisions (lines 113-124)
  evidence: "async function releaseManifestedRevisions(\n  connection: DatabaseConnection,\n  slug: string,\n  revisions: readonly PlacedRevision[],\n): Promise<void> {\n  for (const revision of revisions) {\n    await connection.query(\n      'UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = $4',\n      [RELEASED_REVISION_STATE, slug, revision.hypothesis_name, revision.revision],\n    );\n  }\n}\n"
  cost: Same UPDATE this project's own RelationalCaseStore.releaseHypothesisRevision now names, reimplemented here as a loop of raw SQL rather than calling the lifecycle's releaseHypothesisRevision, which this file already imports and uses for every other step of building the fixture.
  cites: MNT-03
  correction: Call `lifecycle.releaseHypothesisRevision(fixture.slug, revision.hypothesis_name, revision.revision)` for each placed revision instead of issuing the UPDATE directly.
- pass: standard
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: releaseRevisionDirectly (lines 127-135)
  evidence: "async function releaseRevisionDirectly(\n  connection: DatabaseConnection,\n  identity: { readonly slug: string; readonly hypothesisName: string; readonly revision: number },\n): Promise<void> {\n  await connection.query(\n    'UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = $4',\n    [RELEASED_REVISION_STATE, identity.slug, identity.hypothesisName, identity.revision],\n  );\n}\n"
  cost: Duplicates the release write the store's own releaseHypothesisRevision now performs, in a file that already builds a createCaseLifecycle(connection) for the surrounding fixture; a future rule added to the real release path (a guard, a side effect) would not be reflected in this fixture's setup.
  cites: MNT-03
  correction: Call `createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug, identity.hypothesisName, identity.revision)` instead of issuing the UPDATE directly.
- pass: standard
  file: src/seed.ts
  where: releaseManifestedRevisions (lines 121-132)
  evidence: "async function releaseManifestedRevisions(\n  connection: DatabaseConnection,\n  slug: string,\n  revisions: readonly PlacedRevision[],\n): Promise<void> {\n  for (const revision of revisions) {\n    await connection.query(\n      'UPDATE hypothesis_revisions SET state = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = $4',\n      [RELEASED_REVISION_STATE, slug, revision.hypothesis_name, revision.revision],\n    );\n  }\n}\n"
  cost: This is production seeding code, not a test fixture, and it reimplements the exact write RelationalCaseStore.releaseHypothesisRevision now performs (exposed on the very CaseLifecycleOperations this file already imports and uses for createDraft, reviseHypothesis, placeHypothesis and release). A future rule added to the real release path is silently skipped every time the demo database is seeded.
  cites: MNT-03
  correction: Call `lifecycle.releaseHypothesisRevision(fixture.slug, revision.hypothesis_name, revision.revision)` for each placed revision instead of issuing the UPDATE directly.
- pass: standard
  file: src/http/release-hypothesis-revision.controller.ts
  where: handleReleaseHypothesisRevisionRequest (lines 8-13)
  evidence: "export async function handleReleaseHypothesisRevisionRequest(\n  dependencies: ReleaseHypothesisRevisionControllerDependencies,\n  params: ReleaseHypothesisRevisionParamsDto,\n): Promise<void> {\n  await dependencies.releaseHypothesisRevision(params.slug, params.name, params.revision);\n}\n"
  cost: The handler moves a hypothesis-revision out of draft into released — per HypothesisRevisionNotDraftAtReleaseError's own wording, "the one trigger that only ever moves a hypothesis-revision out of draft" — using only the path's slug, hypothesis name and revision, with no check of who is calling against that specific case or hypothesis; anyone who can reach the route can release any revision of any case.
  cites: SEC-01
  correction: Add a check in the handler against the specific case/hypothesis being released before calling releaseHypothesisRevision.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/hipotese-release-proprio.md
---

## What it is

Evidence from four independent passes over the hipotese-release-proprio initiative's 11 delivered backend tasks: coverage (whether the tests prove each stated criterion), specification conformance (whether the source states only what the specification holds, read per file against every node the trace binds to it), standard conformance (whether the source follows the project's own registry), and failures (why a captured run failed — absent here, since the captured run passed cleanly).

## Notes

None.
