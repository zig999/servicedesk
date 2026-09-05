---
title: Review of revise-hypothesis-subject-check-corrective
summary: 'Four passes over the two files task/revise-hypothesis-subject-check-corrective/read-the-drafts-own-declared-subject delivered: coverage of its three criteria, per-file specification conformance folded into siegard-reconcile/revise-hypothesis-subject-check-corrective.md, the backend standard''s reading rules, and the whole-suite run, which passed clean.'
reviewed:
- src/case/revise-hypothesis.operation.ts
- src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
tasks:
- task/revise-hypothesis-subject-check-corrective/read-the-drafts-own-declared-subject
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed whole (152 files, 1883 tests); there was no failure to diagnose
coverage:
- criterion: findDraftVersion (or an equivalent read) returns the draft version's own declared subject type, and refuseInvalidCollects/refuseConceptsRefusingSubject use that value — never input.subject — when checking whether a collected concept accepts the subject.
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: accepts a revise whose input.subject disagrees with the case's own draft version's declared subject type, deciding the concept-acceptance check by the draft's own subject alone
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: refuses with ConceptRefusesSubjectTypeError naming the case's own draft version's declared subject type — never the caller-supplied input.subject that disagrees with it — when the collected concept refuses that draft's own subject even though it would accept input.subject
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: refuses revising with a collected concept that does not accept the declared subject type, naming both the concept and the subject type, and never reaches the store
  why: 'The two disagreement tests seed the draft version with fixture.subjectType and pass fixture.otherSubjectType as input.subject, so each fails if the value flowing into the acceptance check reverts to input.subject or ceases to be the draft''s declared subject; the second also asserts the refusal''s context.subject is the draft''s subject. The read itself is pinned only through that end-to-end outcome — nothing in the set calls findDraftVersion and asserts its returned draft version carries the declared subject — which the criterion''s ''or an equivalent read'' allows. The third test cannot distinguish the two sources: its input.subject equals the draft''s declared subject, so it passes with or without the defect.'
- criterion: 'A revise-hypothesis request whose input.subject disagrees with the case''s own draft version''s declared subject type is neither refused nor influenced by that disagreement: the concept-acceptance check''s outcome (refused with ConceptRefusesSubjectTypeError, or accepted) is decided solely by the draft version''s own declared subject type, and input.subject is read nowhere in that decision.'
  state: covered
  tests:
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: accepts a revise whose input.subject disagrees with the case's own draft version's declared subject type, deciding the concept-acceptance check by the draft's own subject alone
  - file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
    name: refuses with ConceptRefusesSubjectTypeError naming the case's own draft version's declared subject type — never the caller-supplied input.subject that disagrees with it — when the collected concept refuses that draft's own subject even though it would accept input.subject
  why: 'Both halves the criterion names are exercised under disagreement, in opposing directions: the concept accepts the draft''s subject and refuses input.subject, and the revise succeeds and writes revision 1; the concept accepts input.subject and refuses the draft''s subject, and the revise is refused with ConceptRefusesSubjectTypeError carrying context.subject equal to the draft''s declared subject and writing no hypothesis row. A decision reading input.subject flips each outcome, so each test fails.'
- criterion: Every existing test of revise-hypothesis.operation.ts and of findDraftVersion's callers continues to pass with every existing assertion unchanged, except where an assertion itself asserted the defect (using input.subject instead of the draft's own subject) as correct — such an assertion is corrected to match the fixed behavior, not preserved.
  state: unauditable
  why: The criterion ranges over two things this audit cannot reach from the set supplied. First, it is a claim about the suite's history — which assertions are unchanged and which were edited — which no assertion inside a test can express; only the diff over the test files plus a passing run record establishes it. Second, it names the tests of findDraftVersion's callers, and the set supplied holds one file, revise-hypothesis.operation.spec.ts; the other callers' test files were not listed, so whether their assertions still pass unchanged is not observable here. What can be said of the file supplied is that its pre-existing subject-check test ('refuses revising with a collected concept that does not accept the declared subject type, naming both the concept and the subject type, and never reaches the store') passes input.subject equal to the draft's declared subject and so needed no correction — but that is one file's reading, not the totality the criterion states.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/revise-hypothesis-subject-check-corrective.md
findings:
- pass: conformance
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: the three CaseHoldsNoDraftError refusal tests, e.g. lines 654-655
  evidence: "await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);\n    await expect(rejection).rejects.toMatchObject({ context: { slug: fixture.slug } });"
  cost: '[a fact the source states and no node holds] What a CaseHoldsNoDraftError refusal discloses to the curator is decided here, in a test, rather than in the rule that mandates the refusal. The specification does state this level of detail for sibling refusals of the same shape — CaseNotFoundError''s details ''carry the named slug and version'', CaseVersionNotDraftAtReleaseError''s ''carry the version''s own slug, version number and the state it stood in'' — so a reader who wants to know what this refusal tells the curator will look in a-hypothesis-is-revised-only-against-its-cases-draft and find nothing, and will not think to look in this test instead.'
  correction: State, in a-hypothesis-is-revised-only-against-its-cases-draft, what details a CaseHoldsNoDraftError refusal carries (the slug alone, or more), the way its sibling rules already state theirs.
- pass: conformance
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: the ConceptRefusesSubjectTypeError refusal tests, lines 611-619 and 797-805
  evidence: "await expect(rejection).rejects.toBeInstanceOf(ConceptRefusesSubjectTypeError);\n    await expect(rejection).rejects.toMatchObject({\n      context: {\n        slug: fixture.slug,\n        hypothesis_name: 'the-hypothesis',\n        subject: fixture.subjectType,\n        concepts: [fixture.concept],\n      },\n    });"
  cost: '[a fact the source states and no node holds] The exact set of fields a ConceptRefusesSubjectTypeError discloses — which concept refused, which subject type, which hypothesis, which case — is fixed here in a test rather than in the rule that mandates the refusal. As with CaseHoldsNoDraftError, the specification states this class of detail for analogous refusals elsewhere (CaseNotFoundError, CaseVersionNotDraftAtReleaseError) but is silent for this one, so the next reader of a-concept-accepts-the-declared-subject-type learns only that the refusal happens, not what it tells the curator.'
  correction: State, in a-concept-accepts-the-declared-subject-type, what details a ConceptRefusesSubjectTypeError refusal carries.
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 31-37, function requireDatabaseUrl
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url) {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');\n  }\n  return url;\n}\n"
  cost: The identical function (same signature, same guard, same message) already exists verbatim in create-draft.operation.spec.ts, release-hypothesis-revision.operation.spec.ts and at least ten other integration spec files. A change to what the suite requires of DATABASE_URL, or to the message it gives a developer running the suite without it, has to be repeated in every copy, and a copy nobody remembers to touch quietly gives a stale message.
  correction: Extract requireDatabaseUrl into a shared test-support module the integration specs import, and call it from here instead of redeclaring it.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 17-29, FOREIGN_KEY_VIOLATION / isForeignKeyViolation / deleteTolerantly
  evidence: "const FOREIGN_KEY_VIOLATION = '23503';\n\nfunction isForeignKeyViolation(error: unknown): boolean {\n  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;\n}\n\nasync function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {\n  try {\n    await pool.query(text, params);\n  } catch (error) {\n    if (!isForeignKeyViolation(error)) throw error;\n  }\n}\n"
  cost: This same three-piece block — the hardcoded Postgres error code, the type guard reading it off the error, and the tolerant-delete wrapper — is copied verbatim into at least a dozen other integration spec files (create-draft, release, release-hypothesis-revision, manifest-composition, discard, seed, both diagnose e2e specs, the relational-*-store repository specs, case-fixture-reads-clean). A change to which cleanup failures the suite should tolerate has to be made in every copy, and any copy missed keeps failing (or keeps silently swallowing) on the old rule.
  correction: Extract the FOREIGN_KEY_VIOLATION constant, isForeignKeyViolation and deleteTolerantly into a shared fixture-cleanup helper and call it from this file instead of redefining it.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 271-274, it("overwrites an already-named hypothesis's own highest revision in place...")
  evidence: 'const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the first revision text'' }));

    expect(first.revision).toBe(1);


    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the second revision text'' }));

    '
  cost: The assertion on the first call's result sits between two acts on the same operation, so a reader has to work out that it is a sanity check on the setup (that revision 1 exists) rather than part of the overwrite behavior this test names — the actual claim is only in the assertions after the second call.
  correction: Seed revision 1 directly (as seedHypothesisRevision already does elsewhere in this file) instead of calling reviseHypothesis and asserting on it, so the test reads as one arrange, one act, one assert block.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 295-299, it("creates the next revision rather than overwriting it...")
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);

    await releaseHypothesisRevisionOwnState(fixture, ''the-hypothesis'', 1);


    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the overwritten text'' }));

    '
  cost: An assertion is embedded in the middle of setting up the precondition (an existing, now-released revision), before the revise call this test is actually about — a reader cannot tell by scanning that this assertion is scaffolding rather than the claim under test.
  correction: Move the precondition check out of the arrange phase or replace the first reviseHypothesis call with direct seeding, leaving one assert block after the real act.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 368-371, it("leaves exactly the revision it held before three successive revises...")
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);


    const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the first successive revise text'' }));

    '
  cost: Same interleaving — an assert on the initial call precedes the three acts (first/second/third) this test claims something about, so the reader has to separate setup-checking from the behavior being tested by tracing execution order rather than reading structure.
  correction: Seed the initial revision directly instead of calling reviseHypothesis and asserting on it before the three successive revises under test.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 490-494, it("leaves a draft manifest entry for the hypothesis...")
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);

    await seedManifestEntry(fixture, { version: 1, hypothesisName: ''the-hypothesis'', revision: 1, position: 1 });


    await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the overwritten text'' }));

    '
  cost: The assertion on the setup call sits ahead of the manifest seeding and the real act, so the test's own claim (that the manifest entry survives the second revise) is separated from an unrelated setup assertion by more setup, which a reader has to sort out before finding what is actually being verified.
  correction: Replace the first reviseHypothesis call and its assertion with direct seeding of revision 1, keeping the assert block only after the act under test.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: lines 725-729, it("leaves an already-existing revision of the hypothesis reading exactly as it did...")
  evidence: 'const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: ''the original text'' }));

    expect(initial.revision).toBe(1);

    await store.discard(fixture.slug, 1);


    const rejection = operation.reviseHypothesis(reviseInput(fixture, { criterion: ''an attempted overwrite text'' }));

    '
  cost: The assertion on the setup call again precedes the discard and the real act (the revise this test is about), forcing the reader to distinguish a scaffolding assertion from the test's actual claim by tracing order rather than by structure.
  correction: Seed revision 1 directly instead of calling reviseHypothesis and asserting on it before discarding the draft and exercising the behavior under test.
  cites: TST-01
---

## What it is
The review record of the one task the revise-hypothesis-subject-check-corrective initiative delivered, computed over its two files — the source it fixed and the test that proves the fix.

## Notes
The captured run (run/revise-hypothesis-subject-check-corrective-2) passed whole — 152 files, 1883 tests — so the failures pass did not run; there was no failure to diagnose. This capture used --pool=forks --poolOptions.forks.singleFork=true, a deliberate memory-reduction departure from the registry's own npm test command, to avoid the harness's repeated memory-guard kills under the default pool.
The test file (revise-hypothesis.operation.spec.ts) was also reviewed, independently, for the sibling revise-hypothesis-fixture-corrective initiative (review/revise-hypothesis-fixture-corrective.md), which delivered a different task against a non-overlapping node set on the same file; the two reviews' passes ran separately, by design, and their findings do not repeat one another.
The two conformance findings (unstated refusal-detail facts for CaseHoldsNoDraftError and ConceptRefusesSubjectTypeError) are pre-existing gaps in the specification the task's own tests surface, not something this task's fix introduced. The seven standard findings (2 MNT-03 duplication, 5 TST-01 interleaved-assertion) sit in the same pre-existing test file structure.
