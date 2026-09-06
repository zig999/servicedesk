---
title: rename-and-map-status, first review
summary: What four passes found over the CaseNotValidError-to-CaseVersionNotValidError rename and its
  409 status-map entry.
reviewed:
- src/errors/case-version-not-valid.error.ts
- src/errors/case-not-valid.error.ts
- src/case/case-query.service.ts
- src/errors/status-map.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/read-case.routes.spec.ts
- src/__tests__/unit/http/case-input-requirements.routes.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- src/__tests__/integration/factories/case-query.factory.spec.ts
tasks:
- task/case-not-valid-status-mapping/rename-and-map-status
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/case-not-valid-read-status-hotfix) passed clean; there was no failure
    to diagnose.
coverage:
- criterion: A revalidating read (any read other than a replay) that loads a stored case version whose
    content currently fails a validator rule of validation-runs-at-every-read responds with HTTP status
    409, regardless of which route reached that read or which validator rule failed (a coherence rule
    or a structural one, e.g. the document failing to assemble into a well-formed case).
  state: partial
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotValidError to 409, never the generic unmapped-error fallback
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version cannot be assembled whole
  - file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version fails a structural rule
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a case failing one structural rule, naming the violation in a CaseVersionNotValidError
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally valid case failing one coherence rule, as the composed CaseVersionNotValidError
      rather than the coherence module's own IncoherentCaseError
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally invalid case version the same way read-case does, naming the violation
      in a CaseVersionNotValidError
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft version's input requirements even though the same content currently fails read-case's
      own coherence check
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: reuses case-query's own CaseVersionNotValidError unchanged for an incoherent case version, before
      runSimulate is ever called
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses through the real wiring a case document declaring no hypothesis, naming the structural
      violation
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses at a later read, through the real wiring, a case that validated earlier once the glossary
      no longer accepts the subject type it depends on for a collected concept, edited directly against
      the table
  why: 'Three parts of the ''regardless of which route ... or which validator rule'' quantification go
    unexercised, and one is contradicted. (a) Coherence on the input-requirements read: the only 409 driven
    through that route is a structural failure, and case-query.service.spec''s ''answers a draft version''s
    input requirements even though the same content currently fails read-case''s own coherence check''
    pins that same read answering 200-shaped success while a coherence rule fails — the opposite of what
    this criterion states for a read other than a replay. The gap is marked in that file by an it.todo,
    which is a placeholder that can never fail. (b) The simulate-case route never drives an HTTP response,
    so nothing in this set would fail if that route answered a status other than 409. (c) Both route specs
    that do reach 409 install handleUnexpectedError inside the test''s own Fastify instance, so what is
    proven is route-plugin-plus-that-handler, not the assembled application''s own error wiring.'
- criterion: That response's error body reports the error code "CaseVersionNotValidError".
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version cannot be assembled whole
  - file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version fails a structural rule
  why: The body's error.code is asserted on the read-case and input-requirements routes only. No test
    in the set reads a response body for a revalidating read reached through the simulate-case route;
    simulate-case.controller.spec asserts only the thrown instance, never a serialized body.
- criterion: That response is never HTTP 500.
  state: partial
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotValidError to 409, never the generic unmapped-error fallback
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version cannot be assembled whole
  - file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version fails a structural rule
  why: Asserting 409 on the two exercised routes does exclude 500 there. The unexercised part is the simulate-case
    route, where 500 is precisely the default outcome of a domain error escaping an error handler that
    does not consult the status map, and nothing in the set drives that route to a response. status-map.spec
    proves only the mapping function, not that any given route consults it.
- criterion: That response is never HTTP 404.
  state: partial
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotValidError to 409, never the generic unmapped-error fallback
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseNotFoundError to 404
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version cannot be assembled whole
  - file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
    name: refuses with 409 reporting CaseVersionNotValidError, never the generic 500 envelope, when the
      named version fails a structural rule
  why: 'The 409 assertions on the two exercised routes exclude 404 there, and status-map.spec keeps the
    not-valid and not-found errors on distinct statuses. Unexercised: the simulate-case route, for which
    no test in the set observes an HTTP status at all.'
- criterion: No file under the backend target source root names the identifier CaseNotValidError.
  state: uncovered
  why: Nothing in the set reads the source tree, so no test would fail if a file under the backend target
    source root still named CaseNotValidError. All seven test files import CaseVersionNotValidError by
    its new name, which proves the new identifier exists and is thrown; it says nothing about the absence
    of the old one. The criterion is a whole-tree absence claim and needs a test enumerating files under
    the backend target source root and asserting the identifier appears in none; no such test exists in
    this set.
- criterion: A read naming a slug or version no case version was ever written for still responds with
    HTTP 404 reporting CaseNotFoundError, unchanged by this correction.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseNotFoundError to 404
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, when no version answers the
      named slug and version
  - file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, when no version answers the
      named slug and version
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
      (readCaseInputRequirements)
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses with CaseNotFoundError, through the real wiring, for a slug and version nothing was
      ever created for
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: reuses case-query's own CaseNotFoundError unchanged for an unknown case slug or version, before
      runSimulate is ever called
- criterion: A replay reads its pinned version without revalidation and without this correction's 409
    refusal reaching it, unchanged by this correction.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: replays a pinned version without running the coherence checks at all, answering the case even
      though the same content would refuse at read-case
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a document that would fail read-case structurally, rather than refusing it, because
      replay skips the structural refusal too
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers replayCase with exactly the case readCase answers for the same pinned version, minus
      the content-identity pin read-case alone carries
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses replay with the same CaseNotFoundError as read-case when the pinned version was never
      stored
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: replays the pinned version through the real store, answering it unchanged even after the real
      capability registration the case depends on is deleted directly against the table
findings:
- pass: conformance
  file: src/errors/case-version-not-valid.error.ts
  where: the constructor body, lines 5-10
  evidence: '`the case "${slug}" at version ${version} violates its validator rules: ${violations.join('';
    '')}`, ... this.context = { slug, version, violations };'
  cost: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name states only that
    this read is refused with an HTTP 409 reporting a CaseVersionNotValidError; it says nothing about
    the refusal naming which validator rules failed. This file makes that disclosure decision on its own
    — the error's message and its context.violations list enumerate the failed rules — with no node saying
    whether a caller ever learns which rule failed or only that validation failed. The sibling 422 refusal
    (a-release-refusal-with-no-named-violation-says-so) does state its error 'names every violated rule
    together,' so the silence here reads as an oversight rather than a considered choice.
  correction: state, in rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
    or a sibling node, whether the 409 refusal's details name the validator rules that failed, the way
    a-case-read-by-an-unknown-slug-or-version-is-refused states its details carry the named slug and version.
- pass: conformance
  file: src/case/case-query.service.ts
  where: readCaseInputRequirements(), lines 41-46
  evidence: "const assembled = await heldVersion(this.caseStore, slug, version);\n    const theCase =\
    \ structuralCase(assembled, slug, version);\n    const registeredCapabilities = await everyRegisteredCapability(this.capabilities);\n\
    \    return deriveCaseInputRequirements(theCase, registeredCapabilities);"
  cost: readCase and readCaseInputRequirements read the same stored version, but only readCase follows
    structuralCase with this.refuseIncoherence(theCase, version); readCaseInputRequirements returns derived
    requirements for a case version whose glossary terms, concepts or capabilities may currently be incoherent,
    with no 409/CaseVersionNotValidError refusal at all. A curator composing against a broken draft, or
    any caller of this operation, gets computed input requirements for something the specification says
    is 'not yet readable as a case at all, whether previewed.'
  correction: readCaseInputRequirements should call the same coherence check readCase does (e.g. await
    this.refuseIncoherence(theCase, version)) before deriving requirements, so a validator-rule failure
    at that reading is refused the same way for both operations.
- pass: conformance
  file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  where: the sixth `it`, lines 95-103 ("answers 400 for a version of zero, one below the positive range
    the domain declares, without ever reaching the query")
  evidence: '''answers 400 for a version of zero, one below the positive range the domain declares, without
    ever reaching the query'''
  cost: 'the test''s own title asserts, as settled fact, that the domain declares a positive range for
    a case version number and that zero falls outside it; domain/knowledge/case-version.md declares the
    version attribute only as type: integer, required: true, with no floor, and no rule fixes a starting
    value or excludes zero — a reader who goes to the specification to confirm that a version of zero
    is invalid finds nothing there and is left trusting this test (and the route''s own .positive() schema)
    as if it were the decision.'
  correction: decide, into domain/knowledge/case-version.md or a dedicated rule, whether a case version
    number is bounded below (e.g. positive, or minimum 1), disclosed in the decision log, and have this
    test's title cite that node rather than asserting the range as an already-settled domain fact.
- pass: conformance
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the test "answers a draft version's input requirements even though the same content currently
    fails read-case's own coherence check" (lines 722-735) and the adjacent it.todo (lines 737-742)
  evidence: "await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseVersionNotValidError);\n\
    \n  const result = await service.readCaseInputRequirements(SLUG, version);\n\n  expect(result.requirements.map((requirement)\
    \ => requirement.attribute)).toEqual(['an-attribute']); ... \"readCaseInputRequirements today calls\
    \ only structuralCase and never refuseIncoherence, so this stays a documented gap rather than a criterion\
    \ this task owes\""
  cost: 'the next reader who checks rules/knowledge/a-case-versions-input-requirements-are-derived or
    contracts/knowledge/case-input-requirements to learn whether a case version''s input requirements
    are still answered once the version fails coherence finds nothing either way; the answer exists only
    in this test file and its own it.todo, and the specification stays silent on a business-facing question:
    whether a curator sees input requirements for a case that currently would not read back as a case
    at all.'
  correction: state, at rules/knowledge/a-case-versions-input-requirements-are-derived or contracts/knowledge/case-input-requirements,
    whether this read requires the pinned version to hold coherently or is derived from its structural
    manifest regardless of a coherence failure.
- pass: standard
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: '''refuses at a later read a case that validated earlier, once the glossary no longer holds a
    concept it depends on'' (lines 580-585)'
  evidence: "await expect(service.readCase(SLUG, version)).resolves.toMatchObject({ case: { slug: SLUG\
    \ } });\n\n      glossary.forgetConcept(CONCEPT);\n\n      const refusal = await readAsError(service.readCase(SLUG,\
    \ version));\n      expect(refusal).toBeInstanceOf(CaseVersionNotValidError);"
  cost: A reader following arrange-act-assert has to notice that the first expect is not the test's claim
    but a precondition check, then track a second act (forgetConcept) and a third (readCase again) before
    reaching the real assertion — the test's actual claim is not visible from its shape.
  correction: Move the precondition proof into a separate assertion-free arrangement step (or drop it,
    trusting the fixture), so the file reads as one arrange, one act, one assert.
  cites: TST-01
- pass: standard
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: '''refuses at a later read a case that validated earlier, once the capability registry no longer
    answers a concept it depends on'' (lines 593-598)'
  evidence: "await expect(service.readCase(SLUG, version)).resolves.toMatchObject({ case: { slug: SLUG\
    \ } });\n\n      capabilities.forget(CONCEPT);\n\n      const refusal = await readAsError(service.readCase(SLUG,\
    \ version));\n      expect(refusal).toBeInstanceOf(CaseVersionNotValidError);"
  cost: Same interleaving as the glossary-forgetting case immediately above it — an assertion sits between
    two acts, so the test's single claim is split across a check the reader has to discount as scaffolding.
  correction: Drop or relocate the interim resolves.toMatchObject assertion so arrange, both acts, and
    the one assert run in that order without a check in between.
  cites: TST-01
- pass: standard
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: '''replays a pinned version without running the coherence checks at all, answering the case even
    though the same content would refuse at read-case'' (lines 618-622)'
  evidence: "await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseVersionNotValidError);\n\
    \n      const replayed = await replayCase(SLUG, version, store);\n\n      expect(replayed.slug).toBe(SLUG);"
  cost: The test's claim is about replayCase, but a full assertion about readCase precedes the act being
    tested, so a reader has to separate an unrelated proof from the one this test is named for.
  correction: State the read-case refusal as a comment-free fact assumed by the fixture, or split it into
    its own test, leaving this test as arrange, act (replayCase), assert.
  cites: TST-01
- pass: standard
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: '''answers a document that would fail read-case structurally, rather than refusing it, because
    replay skips the structural refusal too'' (lines 635-639)'
  evidence: "await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseVersionNotValidError);\n\
    \n      const replayed = await replayCase(SLUG, version, store);\n\n      expect(replayed.hypotheses).toEqual([]);"
  cost: Same pattern as the two tests above it in the same describe-less block — an assertion about readCase
    is embedded ahead of the act (replayCase) this test is actually named for.
  correction: Separate the read-case refusal proof from the replay assertion, or state it as an arranged
    fact rather than an expect.
  cites: TST-01
- pass: standard
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: '"answers a draft version''s input requirements even though the same content currently fails
    read-case''s own coherence check" (lines 730-734)'
  evidence: "await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseVersionNotValidError);\n\
    \n      const result = await service.readCaseInputRequirements(SLUG, version);\n\n      expect(result.requirements.map((requirement)\
    \ => requirement.attribute)).toEqual(['an-attribute']);"
  cost: Identical shape to the earlier instances in this file — a full assertion (rejects.toBeInstanceOf)
    sits before the act this test claims to be about (readCaseInputRequirements), so the one-sentence
    name and the test's actual structure disagree about what is being proven.
  correction: Move the read-case refusal check out of this test (it duplicates what the read-case tests
    already assert) so only the input-requirements act and assert remain.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: insertTerms, line 34
  evidence: await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  cost: The table name is spliced into the query text through a template literal instead of being bound
    as a parameter; insertTerms accepts any string for table, so the one caller that ever passes something
    other than a hardcoded literal reopens exactly the injection path parameterized queries exist to close.
  correction: Replace the interpolated call with a fixed per-table query string (a switch or lookup of
    literal INSERT INTO <table> ... texts keyed by the table name) so no value ever reaches the query
    text outside a $n placeholder.
  cites: STK-05
- pass: standard
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: cleanupOwnedInstance, lines 313-319
  evidence: "async function cleanupOwnedInstance(connection: DatabaseConnection, slug: string): Promise<void>\
    \ {\n  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug\
    \ = $1', [slug]);\n  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE\
    \ case_slug = $1', [slug]);\n  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions\
    \ WHERE case_slug = $1', [slug]);\n  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE\
    \ case_slug = $1', [slug]);\n  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE\
    \ slug = $1', [slug]);\n  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1',\
    \ [slug]);\n}"
  cost: This is the same six-statement teardown already written a few dozen lines above it in cleanupFixtureSeeded,
    parameterized only by which slug variable is passed. The day the deletion order has to change because
    a foreign key moves, one of the two copies is the one nobody remembers to touch.
  correction: Factor the six deletes into one helper taking the slug, and call it from both cleanupFixtureSeeded
    and cleanupOwnedInstance.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/factories/case-query.factory.spec.ts
  where: cleanupVocabulary, lines 132-137
  evidence: 'await deleteTolerantly(''DELETE FROM case_version_hypotheses WHERE case_slug = $1'', [vocabulary.slug]);

    await deleteTolerantly(''DELETE FROM hypothesis_revision_collects WHERE case_slug = $1'', [vocabulary.slug]);

    await deleteTolerantly(''DELETE FROM hypothesis_revisions WHERE case_slug = $1'', [vocabulary.slug]);

    await deleteTolerantly(''DELETE FROM hypotheses WHERE case_slug = $1'', [vocabulary.slug]);

    await deleteTolerantly(''DELETE FROM case_versions WHERE slug = $1'', [vocabulary.slug]);

    await deleteTolerantly(''DELETE FROM cases WHERE slug = $1'', [vocabulary.slug]);'
  cost: The same six-statement case-teardown sequence already exists twice in case-fixture-reads-clean.spec.ts
    (cleanupFixtureSeeded and cleanupOwnedInstance); this file copies it a third time rather than calling
    a shared helper, so three places have to be found and fixed together the next time the schema's delete
    order changes.
  correction: Extract the shared six-statement case cleanup into one function both spec files import and
    call, leaving each file's own extra deletes (capabilities, concepts, vocabulary terms) as the only
    per-file part.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/factories/case-query.factory.spec.ts
  where: '''refuses through the real wiring, before the coherence module or CaseVersionNotValidError ever
    runs, a hypothesis-revision whose collected concept the glossary does not hold...'' (lines 197-203)'
  evidence: "const rejection = writeCase(vocabulary);\n\n      await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);\n\
    \n      const refusal = await createCaseQuery(pool).readCase(vocabulary.slug, 1).catch((error: unknown)\
    \ => error);\n      expect(refusal).toBeInstanceOf(CaseVersionNotValidError);\n      expect((refusal\
    \ as CaseVersionNotValidError).context.violations).toEqual(['the case declares no hypothesis']);"
  cost: A full assertion (rejects.toBeInstanceOf(CaseStoreError)) sits between the first act (writeCase)
    and the second act (readCase), so the test reads as two grafted tests rather than one arrange-act-assert
    claim.
  correction: Split into two tests — one asserting writeCase rejects with CaseStoreError, another (seeding
    its own state directly) asserting the later read's CaseVersionNotValidError — or state the write-time
    rejection as an arranged precondition rather than an assertion.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/factories/case-query.factory.spec.ts
  where: '''refuses at a later read, through the real wiring, a case that validated earlier once the glossary
    no longer accepts the subject type...'' (lines 216-221)'
  evidence: "await expect(query.readCase(vocabulary.slug, version)).resolves.toMatchObject({ case: { slug:\
    \ vocabulary.slug } });\n\n      await pool.query('DELETE FROM concept_accepts WHERE concept_name\
    \ = $1', [vocabulary.concept]);\n\n      const refusal = await query.readCase(vocabulary.slug, version).catch((error:\
    \ unknown) => error);\n      expect(refusal).toBeInstanceOf(CaseVersionNotValidError);"
  cost: An assertion proving the initial read succeeds is placed ahead of the DELETE and the second read,
    so the reader has to discount it as scaffolding before finding the assertion the test's name is actually
    about.
  correction: Drop the interim resolves.toMatchObject check or move it to a shared arrangement helper,
    leaving arrange, the DELETE, the second read, and its one assert.
  cites: TST-01
- pass: standard
  file: src/__tests__/integration/factories/case-query.factory.spec.ts
  where: '''replays the pinned version through the real store, answering it unchanged even after the real
    capability registration the case depends on is deleted...'' (lines 234-241)'
  evidence: "const read = await query.readCase(vocabulary.slug, version);\n\n      await pool.query('DELETE\
    \ FROM capabilities WHERE name = $1', [vocabulary.capabilityName]);\n      await expect(query.readCase(vocabulary.slug,\
    \ version)).rejects.toBeInstanceOf(CaseVersionNotValidError);\n\n      const replayed = await replayCase(vocabulary.slug,\
    \ version, createCaseStore(pool));\n\n      expect(replayed).toEqual(read.case);"
  cost: A full assertion about readCase rejecting is embedded between the DELETE and the replayCase act
    this test is named for, so the test's actual claim (about replay) is interleaved with a second, unrelated
    claim about read-case.
  correction: Move the readCase rejection assertion into its own test or an arrangement step, leaving
    this test as arrange, act (replayCase), assert.
  cites: TST-01
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/case-not-valid-read-status-hotfix.md
---

## What it is
Four passes over the delivery of task/case-not-valid-status-mapping/rename-and-map-status: coverage (does the proof exercise every criterion), conformance (does the source state only what the specification holds), standard (does the source follow the project's own registry), and failures (why the captured run failed — it did not, so this pass has nothing to diagnose). The captured run (run/case-not-valid-read-status-hotfix) reran the full registry-declared suite over the whole file set and passed clean: install, typecheck, lint, secret-scan and test all green.

## Notes
The trace over the backend target (src) reports, at the situate step, 164 drift findings over 211 bindings: 5 moved (the specification's own text shifted under an existing bind) and 159 code (a file changed without a rebind) across 31 files, plus 236 code findings over 42 frontend files suppressed by this target's edits_freely declaration. None of this is a finding of this review and none of it is this review's to fix — it says whether the trace still describes the tree, which is a separate fact from whether this change conforms. The conformance pass staged over this review's own 11-file set and 4 plan nodes read 45 total node-file pairs (33 the trace already bound plus each of the 4 plan nodes on every file); 33 cleared and were restamped, 4 did not (contradicts/unstated findings above) and stay exactly as they stood before this review, which is what --owed will report until a later reconciliation or delivery answers them. 6 of the 11 reviewed files carry no prior trace binding at all (every test file in the set) and were judged over the plan's 4 nodes alone, per the staging's own design.
