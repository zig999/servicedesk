---
contract_version: siegard-reconcile/3
title: 'hipotese-release-proprio: three corrective fixes to the same release-ordering bug and its shared-fixture-corruption
  consequence'
summary: Three corrective tasks (seed-release-ordering-corrective, diagnose-server-factory-fixture-release-ordering-corrective,
  case-fixture-reads-clean-collects-delete-corrective) each reorder a fixture-seeding helper to release
  manifested hypothesis-revisions before releasing the case version, and the third also stops a destructive
  DELETE test from corrupting the shared canonical fixture other files depend on.
target: backend
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  change: insertFixtureCase's own fixture-seeding helper reordered the same way as seed.ts; two proof
    tests added confirming the seeded case version and its manifested revisions read back released.
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: insertFixtureCase reordered the same way; the collects-survive-DELETE test rewritten to exercise
    the DELETE against a case this test owns exclusively instead of the shared canonical fixture; three
    proof tests added (release ordering, second-invocation refusal, post-suite shared-fixture coherence).
- path: src/__tests__/integration/seed.spec.ts
  change: 'Proof tests added: the corrected ordering completes without throwing, every manifested revision
    and the case version read back released, and a further run leaves the already-released manifest unaltered.'
- path: src/__tests__/unit/seed.spec.ts
  change: 'Proof tests added: seed.ts''s source contains no raw SQL statement writing hypothesis_revisions.state
    and calls lifecycle.releaseHypothesisRevision.'
- path: src/seed.ts
  change: seedCase() now releases every manifested hypothesis-revision through lifecycle.releaseHypothesisRevision
    before releasing the case version, and the raw-SQL releaseManifestedRevisions helper is removed in
    favor of that call.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts,
    and src/seed.ts read `nowhere` — await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: domain/glossary/action
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it(\"holds exactly the fixture's own action names,\
    \ every one the curated case's hypotheses and fallback declare\", ...) — const { rows } = await connection.query<{\
    \ name: string }>('SELECT name FROM actions WHERE name = ANY($1)', [expected]);\n\n  expect(rows.map((row)\
    \ => row.name).sort()).toEqual([...expected].sort());"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/concept
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it('holds every concept the curated case collects,\
    \ each with the subject types it accepts and its ttl, matching the fixture exactly', ...) — const\
    \ { rows: conceptRows } = await connection.query<{ name: string; ttl: number }>(\n    'SELECT name,\
    \ ttl FROM concepts WHERE name = ANY($1)',\n    [conceptNames],\n  );\n  const { rows: acceptRows\
    \ } = await connection.query<{ concept_name: string; subject_type_name: string }>(\n    'SELECT concept_name,\
    \ subject_type_name FROM concept_accepts WHERE concept_name = ANY($1)',\n    [conceptNames],\n  );"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/outcome
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it('holds both non-conclusion outcomes, having\
    \ run against a database this file had itself confirmed lacked them beforehand', ...) — const nonConclusionNames\
    \ = NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name);\n    const { rows } = await connection.query<{\
    \ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [nonConclusionNames]);\n\n   \
    \ expect(rows.map((row) => row.name).sort()).toEqual([...nonConclusionNames].sort());\nsrc/seed.ts:\
    \ held at seedOutcomes — const known = new Set(fixtureOutcomes.map((outcome) => outcome.name));"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/seed.ts
- node: domain/glossary/recipient
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it(\"holds exactly the fixture's own recipient\
    \ names, every one the curated case's hypotheses and fallback declare\", ...) — const { rows } = await\
    \ connection.query<{ name: string }>('SELECT name FROM recipients WHERE name = ANY($1)', [expected]);\n\
    \n  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/subject-type
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it('holds exactly the fixture''s own subject-type\
    \ name, the one the curated case declares as its subject', ...) — const { rows } = await connection.query<{\
    \ name: string }>('SELECT name FROM subject_types WHERE name = ANY($1)', [expected]);\n\n  expect(rows.map((row)\
    \ => row.name).sort()).toEqual([...expected].sort());"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/investigation/durations
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the IInvestigationRow\
    \ type and the assertions reading durations_collection/durations_judgment/durations_writing/durations_total\
    \ — expect(written?.durations_total).toBeGreaterThanOrEqual(\n  (written?.durations_collection ??\
    \ 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0),\n);\n"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it('the case is stored, once seed.ts has run against\
    \ a database this file had confirmed lacked it beforehand', ...) — const stored = await createCaseStore(connection).assembleVersion(SLUG,\
    \ VERSION);\n\n  expect(stored).toBeDefined();"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at placeFixtureHypotheses,\
    \ calling lifecycle.reviseHypothesis with criterion, collects and resolution, then lifecycle.placeHypothesis\
    \ with the returned revision — const revised = await lifecycle.reviseHypothesis({\n  slug: fixture.slug,\n\
    \  hypothesis_name: entry.hypothesis_name,\n  criterion: entry.criterion,\n  collects: entry.collects,\n\
    \  resolution: entry.resolution,\n  subject: fixture.subject,\n});\n\nsrc/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts:\
    \ held at placeFixtureHypotheses/releaseOwnedHypothesisRevision calling lifecycle.reviseHypothesis\
    \ and lifecycle.releaseHypothesisRevision — const revised = await lifecycle.reviseHypothesis({\n \
    \     slug: fixture.slug,\n      hypothesis_name: entry.hypothesis_name,\n      criterion: entry.criterion,\n\
    \      collects: entry.collects,\n      resolution: entry.resolution,\n      subject: fixture.subject,\n\
    \    });\nsrc/seed.ts: held at placeFixtureHypotheses and releaseManifestedRevisions — const revised\
    \ = await lifecycle.reviseHypothesis({\n      slug: fixture.slug,\n      hypothesis_name: entry.hypothesis_name,\n\
    \      criterion: entry.criterion,\n      collects: entry.collects,\n      resolution: entry.resolution,\n\
    \      subject: fixture.subject,\n    });"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/factories/diagnose-server.factory.spec.ts,
    src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts, and src/seed.ts read `nowhere`
    — no literal draft/released state value appears in this file — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: "src/seed.ts: held at seedOutcomes and the main script's call ordering — const missing = NON_CONCLUSION_OUTCOMES.filter((outcome)\
    \ => !known.has(outcome.name));\n  await store.insertMissingTerms('outcome', [...fixtureOutcomes,\
    \ ...missing]);"
  encoded_at:
  - src/seed.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts, line 414, inside the ''persists
    real, non-zero cost and durations...'' test: expect(written?.durations_collection).toBeGreaterThan(0);
    — If the observation/collection stage ever genuinely completes within one millisecond of wall-clock
    time — a span the specification explicitly says is honestly reported as 0 rather than floored to 1
    — this assertion fails and misreports a correct, spec-conforming measurement as a defect, encoding
    a stricter floor on durations.collection than the domain ever imposes.'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at it('holds no second case version, having run seed.ts\
    \ a second time in a row against the version it already released', ...) — const secondVersion = await\
    \ createCaseStore(connection).assembleVersion(SLUG, VERSION + 1);\n\n  expect(secondVersion).toBeUndefined();\n\
    src/seed.ts: held at the main script's alreadySeeded guard — if (!(await alreadySeeded(connection)))\
    \ {\n    await seedCase(connection);\n  }"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts,
    and src/seed.ts read `nowhere` — collects: entry.collects, — passed through with no length check in
    this file — a binding asserts the file answers for the node, so the pair that stopped holding it is
    released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at releaseManifestedRevisions,\
    \ calling lifecycle.releaseHypothesisRevision directly against each placed revision — await lifecycle.releaseHypothesisRevision(slug,\
    \ revision.hypothesis_name, revision.revision);\n\nsrc/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts:\
    \ held at it(\"refuses releasing an already-released manifested hypothesis-revision a second time\
    \ with HypothesisRevisionNotDraftAtReleaseError\", ...) — const refusal = await lifecycle\n      \
    \  .releaseHypothesisRevision(ownedSlug, released.hypothesisName, released.revision)\n        .catch((error:\
    \ unknown) => error);\n\n      expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);\n\
    src/seed.ts: held at releaseManifestedRevisions — await lifecycle.releaseHypothesisRevision(slug,\
    \ revision.hypothesis_name, revision.revision);"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at insertFixtureCase,\
    \ which places every manifest entry, releases every referenced hypothesis-revision, and only then\
    \ releases the case version — const placed = await placeFixtureHypotheses(lifecycle, fixture, draft.version);\n\
    await releaseManifestedRevisions(lifecycle, fixture.slug, placed);\nawait lifecycle.release(fixture.slug,\
    \ draft.version);\n\nsrc/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at\
    \ it(\"releases a freshly drafted case version without throwing CaseVersionNotReleasableError, once\
    \ its own manifested hypothesis-revision has already been released through the lifecycle operation\"\
    , ...) — await expect(\n        releaseOwnedCaseVersionAfterItsRevision(lifecycle, {\n          slug:\
    \ ownedSlug,\n          hypothesisName,\n          concept: 'equipment-status',\n        }),\n   \
    \   ).resolves.toBeUndefined();\nsrc/seed.ts: held at seedCase's call ordering — const placed = await\
    \ placeFixtureHypotheses(lifecycle, fixture, draft.version);\n  await releaseManifestedRevisions(lifecycle,\
    \ fixture.slug, placed);\n  await lifecycle.release(fixture.slug, draft.version);"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at it(\"leaves a released\
    \ hypothesis-revision's own collects in place after an ordinary DELETE against those exact rows is\
    \ attempted, ...\", ...) — await connection.query(\n        'DELETE FROM hypothesis_revision_collects\
    \ WHERE case_slug = $1 AND hypothesis_name = $2',\n        [ownedSlug, hypothesisName],\n      );\n\
    \n      const { rows } = await connection.query<{ concept_name: string }>(\n        'SELECT concept_name\
    \ FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n        [ownedSlug,\
    \ hypothesisName],\n      );\n      expect(rows.map((row) => row.concept_name)).toEqual([collectedConcept]);"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts,
    and src/seed.ts read `nowhere` — await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
unbound:
- src/__tests__/unit/seed.spec.ts
notes: 'Judged by 5 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/hipotese-release-proprio-corrective-fixtures.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/knowledge/hypothesis-revision,
  domain/knowledge/hypothesis-revision-state, rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle,
  rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions, rules/knowledge/a-released-hypothesis-revision-is-never-altered,
  rules/knowledge/validation-runs-at-every-read were read on every file and answered for, and bound from
  nowhere here — a binding this record writes is one the trace already held.

  Candidates: 1 opened across 1 of 5 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hipotese-release-proprio-corrective-fixtures.returns/`, which are the evidence behind every entry above.
