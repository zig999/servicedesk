---
title: Review of revise-hypothesis-fixture-corrective
summary: 'Four passes over the one file task/revise-hypothesis-fixture-corrective/correct-titles-and-release-write-duplication delivered: coverage of its four criteria, per-file specification conformance folded into siegard-reconcile/revise-hypothesis-fixture-corrective.md, the backend standard''s reading rules, and the whole-suite run, which passed clean.'
reviewed:
- src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
tasks:
- task/revise-hypothesis-fixture-corrective/correct-titles-and-release-write-duplication
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed whole (152 files, 1883 tests); there was no failure to diagnose
coverage:
- criterion: The test currently titled "overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision is referenced by no case version in released state" is retitled to name the revision's own state (draft — the state this test's own body exercises) as the governing condition, never a case version's reference to it or the revision's released state.
  state: uncovered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number unchanged, when that revision's own state is draft
  why: The retitle is present in the file and the body does exercise the draft condition it now names — two successive revises with no release between them, asserting the second overwrites revision 1 in place. But a vitest title is a free string that no assertion in this set reads. Nothing here submits the file's own titles to an assertion, so a revert to the old wording ("referenced by no case version in released state") would leave the whole suite green, and the title could drift away from the body it now matches without any test failing. The criterion's truth is established by reading the file, not by a test that would fail if it stopped holding.
- criterion: The test currently titled to assert the revise "creates no revision at all" and "leaves the hypothesis holding only the revision it already had" is retitled to state that the revise creates the hypothesis's own next revision, one past its existing highest revision, matching what its own body already asserts and inserts.
  state: uncovered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates the hypothesis's own next revision, one past its existing highest revision, when that highest existing revision's own state is released
  why: 'Same absence as the criterion above: no assertion in the set reads a title, so reverting this one to "creates no revision at all" would fail nothing. Two further facts a reader needs. The criterion names its target by a title that appears nowhere in the set any more, so the pairing rests on the retitled wording matching the wording the criterion demands, and on the body matching it — the body does insert and assert a second row, expecting rows [revision 1 ''the original text'' released, revision 2 ''the created text'' draft]. And a different test in this file still carries "creates no second revision row at all when the highest existing revision''s own state is draft, even though a case version in released state references it"; its body genuinely asserts exactly one row under a draft highest revision, so it is a correct title on a different condition, not a missed retitle.'
- criterion: releaseHypothesisRevisionOwnState's own implementation calls the case lifecycle's releaseHypothesisRevision(slug, hypothesisName, revision) — the guarded operation that reads the revision's own state and refuses a non-draft release before writing — never a hand-written UPDATE statement against hypothesis_revisions.
  state: partial
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: refuses releaseHypothesisRevisionOwnState's own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates the next revision rather than overwriting it, and leaves an already-released revision's own state and content exactly as they were, when a further revise is attempted against it
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: creates the hypothesis's own next revision, one past its existing highest revision, when that highest existing revision's own state is released
  why: 'Both observable halves of the guarded operation are exercised. The write half: two tests read revision 1 back as state ''released'' after the helper ran, so a helper that released nothing would fail. The refusal half: the second-call test expects HypothesisRevisionNotDraftAtReleaseError from a second release of an already-released revision, so a bare hand-written "UPDATE hypothesis_revisions SET state = ''released''" — which would silently succeed a second time and leave the caught value undefined — would fail that assertion. What is unexercised is the criterion''s structural half, "never a hand-written UPDATE": a hand-written UPDATE that reproduced the draft read, the refusal and the same typed error would satisfy every assertion in this set while violating the criterion as written. Which function the helper calls is visible only by reading lines 170-172, and a test binding it would have to assert the internal call, which would prove nothing about behavior.'
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged (the two retitled tests' own arrange/act/assert stay byte-for-byte the same; only their title strings change).
  state: unauditable
  why: This is a claim about a run and about a diff, and neither is a thing a test in this set can bear on. No test fails when the suite fails — the suite passing is established by the run record under run/, not by an assertion. And byte-for-byte identity of the two retitled tests' arrange/act/assert is a relation between two revisions of the file; the set supplied to this audit holds only the post-change file, so the prior bodies are not readable from it and the "unchanged" half cannot be decided here at all. The evidence for this criterion is the captured run and git diff over the file, and a reader should route it there rather than expect a test to prove it.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/revise-hypothesis-fixture-corrective.md
findings:
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: seedReleasedOwnStateReferencedHighestRevision (lines 174-180) against seedReleasedReferencedHighestRevision (lines 159-164)
  evidence: "async function seedReleasedReferencedHighestRevision(fixture: IFixture, criterion: string): Promise<void> {\n  await seedHypothesisRevision(fixture, { hypothesisName: 'the-hypothesis', revision: 1, criterion });\n  await seedCaseVersion(fixture, 1, 'released');\n  await seedManifestEntry(fixture, { version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });\n  await seedCaseVersion(fixture, 2, 'draft');\n}\n...\nasync function seedReleasedOwnStateReferencedHighestRevision(fixture: IFixture, criterion: string): Promise<void> {\n  await seedHypothesisRevision(fixture, { hypothesisName: 'the-hypothesis', revision: 1, criterion });\n  await releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', 1);\n  await seedCaseVersion(fixture, 1, 'released');\n  await seedManifestEntry(fixture, { version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });\n  await seedCaseVersion(fixture, 2, 'draft');\n}\n"
  cost: The second helper repeats four of the first helper's five statements verbatim instead of the shared sequence being factored into one helper that the release step parameterizes; a change to how a released-and-referenced revision is seeded (a new column, a changed ordering) has to be made by hand in both bodies, and a copy the editor missed silently keeps seeding the old shape.
  correction: Factor the shared four statements into one helper that both seedReleasedReferencedHighestRevision and seedReleasedOwnStateReferencedHighestRevision call, parameterized by whether releaseHypothesisRevisionOwnState runs first.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 220-226, repeated verbatim at 244-249, 265-270, 289-294, 314-319, 484-489 and 508-513
  evidence: 'const fixture = freshFixture();

    await persistCase(fixture);

    await persistGlossaryVocabulary(fixture);

    await registerConceptAccepting(fixture, fixture.subjectType);

    await seedDraftCaseVersion(fixture);

    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    '
  cost: At least seven tests copy this identical six-statement arrangement instead of calling one shared "arrange a revisable draft case" helper the file already has the pieces to build; a fix to any one setup step (an added glossary seed, a changed store constructor) has to be hand-applied to every copy, and whichever copy the editor missed keeps testing the old arrangement without anything saying so.
  correction: Extract the six statements into one helper (e.g. arrangeRevisableDraftCase(fixture)) and call it from every test that needs exactly this state.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 271-274 (test opening at line 261)
  evidence: 'const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the first revision text'' }));

    expect(first.revision).toBe(1);


    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the second revision text'' }));

    '
  cost: The assertion on the first call's revision sits between two acts on the operation under test, so the test's shape no longer separates arranging from asserting; a reader cannot tell whether that first expect is a claim under test or a checkpoint on the way to arranging the second call, and a break in either call surfaces inside what reads as still-arranging code.
  correction: Move the interim check out of the assertion phase (assert only after the final act) or split the scenario into two tests, each with a single arrange-act-assert.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 295-299 (test opening at line 285)
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);

    await releaseHypothesisRevisionOwnState(fixture, ''the-hypothesis'', 1);


    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the overwritten text'' }));

    '
  cost: An assert on the first call's revision is followed by more arranging (the release call) and a second act, so arrange, act and assert no longer appear once each in order; a failure in the release step reads as if it broke the assertion just above it rather than the setup that follows.
  correction: Assert only once, after the final act, or split the setup verification into its own test.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 368-371 (test opening at line 358)
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);


    const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the first successive revise text'' }));

    '
  cost: The interim expect sits between the setup call and the three successive revises actually under test, breaking the single arrange-then-act-then-assert shape; a reader has to work out which of the four calls is "the" act and which expect is "the" assertion.
  correction: Drop the interim assertion or move it into a separate, earlier test that only claims the first revision is numbered 1.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 490-494 (test opening at line 480)
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);

    await seedManifestEntry(fixture, { version: 1, hypothesisName: ''the-hypothesis'', revision: 1, position: 1 });


    await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the overwritten text'' }));

    '
  cost: The assert on the initial revision is followed by more arranging (seeding the manifest entry) and the real act, so the test cannot be read top to bottom as arrange, then act, then assert.
  correction: Move the manifest seeding before the first act, and assert only once, after the final act.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 725-729 (test opening at line 714)
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);

    await store.discard(fixture.slug, 1);


    const rejection = operation.reviseHypothesis(reviseInput(fixture, { criterion: ''an attempted overwrite text'' }));

    '
  cost: The same pattern recurs — an assert on setup output precedes further arranging (the discard) and the act the test is named for, so the arrange/act/assert boundary the rule asks for is not visible in this test either.
  correction: Assert only after the final act, moving the interim revision check out or into its own test.
  cites: TST-01
---

## What it is
The review record of the one task the revise-hypothesis-fixture-corrective initiative delivered, computed over its one file.

## Notes
The captured run (run/revise-hypothesis-fixture-corrective-2) passed whole — 152 files, 1883 tests — so the failures pass did not run; there was no failure to diagnose. This capture used --pool=forks --poolOptions.forks.singleFork=true, a deliberate memory-reduction departure from the registry's own npm test command, to avoid the harness's repeated memory-guard kills under the default pool.
Note: this same file was also reviewed, independently, for the sibling revise-hypothesis-subject-check-corrective initiative (review/revise-hypothesis-subject-check-corrective.md), which delivered a different task against the file — its conformance and standard passes read the file fresh, against a different node set, and are recorded separately there; the two reviews' findings do not overlap by design.
All nine findings (2 MNT-03 duplication, 6 TST-01 interleaved-assertion, both pre-existing in this file before this task's own change) sit in code or test structure this task's titling/write fix did not introduce.
