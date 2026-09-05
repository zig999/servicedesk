---
title: Review of case-version-lifecycle-schema-title-corrective
summary: 'Four passes over the one file task/case-version-lifecycle-schema-title-corrective/reword-the-stale-test-title delivered: coverage of its three criteria, per-file specification conformance folded into siegard-reconcile/case-version-lifecycle-schema-title-corrective.md, the backend standard''s reading rules, and the diagnosis of the one failure the captured run reported.'
reviewed:
- src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
tasks:
- task/case-version-lifecycle-schema-title-corrective/reword-the-stale-test-title
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
coverage:
- criterion: The test's own title states that the row is mutable because the hypothesis-revision's own state is draft (the column's default, left there by insertHypothesisRevision), never because of any case version's reference to it or absence of one.
  state: uncovered
  tests:
  - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE while the revision's own state is still draft
  why: 'This test is named here because a reader opening the file will find its title matching the criterion word for word and may conclude the audit missed it: the title is the subject of the criterion, not evidence for it. The block asserts only that criterion reads back as ''A revised criterion.'' after the UPDATE; revert the title to the retired case-version-reference wording and every assertion in the block still passes, so nothing here would fail if the criterion stopped holding. Nothing in the file set reads its own source text, so no test observes the it(...) string literal at all. Separately, the fact the new title asserts is itself unexercised: the arrange calls insertHypothesisRevision without naming state, and no query in the file selects state from hypothesis_revisions, so no assertion establishes that the row is in draft, that draft is the column''s default, or that the column exists. The proof record''s claim that this test proves criteria 1 and 2 is a claim about the file''s
    text, read by a person, not an assertion a run can fail.'
- criterion: The test's arrange, act and assert are byte-for-byte unchanged; only the string literal naming the test changes.
  state: uncovered
  tests:
  - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE while the revision's own state is still draft
  why: 'The criterion is a statement about the difference between two revisions of the file, and no test in this set compares the file against a prior revision: the named block passes identically whether its fixture calls, its UPDATE and its SELECT/expect were preserved byte-for-byte or rewritten to equivalent lines, so it would not fail if the criterion stopped holding. It is named here so a reader who sees the proof record cite it for this criterion knows the audit read it. What evidences the criterion is the implementation record''s own files[].effect entry and the diff it describes, which quotes the old and new title strings and states no other line changed; a record is a disclosure a person checks against git, not a test, and this audit reports its state over the test set it was given. The criterion is plainly readable, so it is uncovered rather than unauditable.'
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    name: stores a draft case_versions row with released_at absent
  - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    name: changes an already-stored hypothesis revision's own columns on an ordinary UPDATE while the revision's own state is still draft
  - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    name: refuses to alter a manifest entry belonging to a released case version
  - file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    name: defaults a newly-inserted case_versions row that does not name its own state to 'released', since the column's own DEFAULT is kept permanently rather than dropped after backfill — every currently-shipped write path that inserts without naming state depends on this
  why: 'The "continues to pass" half is exercised: every it(...) block in the file carries an assertion that fails if its behavior stops holding, so a run of this file would fail if the suite stopped passing (31 blocks total; the four listed are representative). The "with every existing assertion unchanged" half is unexercised — it is a statement about the diff, and no block in the file compares its assertions against a prior revision, so an assertion weakened or deleted alongside the rename would leave the suite green and this criterion silently broken. That half is evidenced only by the implementation record''s statement that no other line changed, which is a disclosure for a person to check against git rather than a test. This file''s whole suite is gated on DATABASE_URL and a reachable PostgreSQL instance, so "continues to pass" is proven only where that environment is present.'
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
failures_counted: 1
run: run/case-version-lifecycle-schema-title-corrective-5
reconciliation: siegard-reconcile/case-version-lifecycle-schema-title-corrective.md
findings:
- pass: standard
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: beforeAll, lines 137-139, and afterAll, line 153 (repeated at lines 544-545 and 563 for the prior-schema client)
  evidence: 'schemaName = `case_version_lifecycle_test_${randomUUID().replace(/-/g, ''_'')}`;

    await client.query(`CREATE SCHEMA "${schemaName}"`);

    await client.query(`SET search_path TO "${schemaName}"`);

    ...

    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);

    '
  cost: The schema name reaches SQL text through template-literal interpolation rather than a bound parameter, at five call sites across this file. A reader auditing the codebase for the parameterization rule by grepping for `${` inside a query string cannot separate this occurrence from an actually risky one without individually reading each; the guarantee the rule exists to give — that no query in the tree builds its text from a runtime value — no longer holds by inspection alone.
  correction: Generate and reuse the identifier the same way, but route the CREATE SCHEMA / SET search_path / DROP SCHEMA text through a single helper the reviewer can audit once, or document the identifier as the one place the rule is understood not to reach — the rule as stated draws no such line itself.
  cites: STK-05
- pass: standard
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: beforeAll, lines 138 and 153 (repeated at lines 544 and 563 for the prior-schema client)
  evidence: 'await client.query(`CREATE SCHEMA "${schemaName}"`);

    ...

    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);

    '
  cost: CREATE SCHEMA and DROP SCHEMA are DDL authored directly in this module rather than read from a versioned file the migration step applies — the same shape the rule forbids, just for a schema the suite manufactures rather than the application's. Nothing outside this file records that this schema definition exists or lets it be replayed independently of the test run.
  correction: Move the isolation-schema DDL into a versioned migration-style file the test applies through the same applyMigrationFiles path already used for the real migrations, or state explicitly (where the standard allows it) that per-test isolation schemas are outside the rule's reach.
  cites: STK-06
- pass: standard
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: lines 376-381, 436-444, 460-465 and 513-518
  evidence: "await client.query('SAVEPOINT before_update');\ntry {\n  await client.query('UPDATE case_versions SET title = $1 WHERE slug = $2 AND version = 1', ['Nothing should have written this.', slug]);\n} catch {\n  await client.query('ROLLBACK TO SAVEPOINT before_update');\n}\n...\nawait client.query('SAVEPOINT before_delete');\ntry {\n  await client.query('DELETE FROM case_versions WHERE slug = $1 AND version = 1', [slug]);\n} catch {\n  await client.query('ROLLBACK TO SAVEPOINT before_delete');\n}\n"
  cost: The same four-line savepoint-guard shape — SAVEPOINT, attempt a write, catch, ROLLBACK TO SAVEPOINT — is copied verbatim four times rather than called from one place, even though every other repeated SQL operation in this file (insertCase, insertCaseVersion, insertHypothesis, insertHypothesisRevision, insertManifestEntry) was factored into a named helper. If the way an expected-refusal is detected or reported ever needs to change, four call sites have to be found and edited in step, and one missed keeps the old behavior silently.
  correction: Factor the pattern into one helper, e.g. attemptAndExpectNoChange(client, sql, params, savepointLabel), and call it from all four tests.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: beforeAll, lines 134-140, and the backfill test, lines 540-548
  evidence: 'client = new Client({ connectionString: requireDatabaseUrl() });

    await client.connect();

    schemaName = `case_version_lifecycle_test_${randomUUID().replace(/-/g, ''_'')}`;

    await client.query(`CREATE SCHEMA "${schemaName}"`);

    await client.query(`SET search_path TO "${schemaName}"`);

    await applyMigrationFiles(client, await migrationFilesInOrder());

    ...

    await priorClient.connect();

    await priorClient.query(`CREATE SCHEMA "${priorSchema}"`);

    await priorClient.query(`SET search_path TO "${priorSchema}"`);

    const files = await migrationFilesInOrder();

    await applyMigrationFiles(priorClient, files.filter((name) => name < TARGET_MIGRATION));

    '
  cost: The connect-create-schema-set-search_path-apply-migrations sequence is written out a second time inside one test rather than called as the same routine beforeAll already performs (with a filtered file list). A change to how an isolated test database is bootstrapped — a new required step, a different naming scheme — has to be made in two places, and the backfill test is the one likely to be missed since it sits far from the setup block that model it copies.
  correction: Extract a bootstrapIsolatedSchema(client, schemaPrefix, fileFilter) helper used by both beforeAll and the backfill test.
  cites: MNT-03
- pass: failures
  file: src/__tests__/integration/seed.spec.ts
  where: holds exactly the fixture's own subject-attribute name, even though the curated case document names no subject attribute of its own (seed.spec.ts:253)
  evidence: "AssertionError: expected [ 'contract-number', …(3) ] to deeply equal [ 'contract-number' ]\n- Expected\n+ Received\n  [\n    \"contract-number\",\n+   \"investigation-store-attribute-09ecfbdf-fca3-498a-8a03-475c1f6c630f\",\n+   \"investigation-store-attribute-b47c9a0a-4f52-44c3-9c0f-5c5fb9ad7525\",\n+   \"investigation-store-attribute-eafd66b1-ccfd-4812-b3e9-7d03017cfc87\",\n  ]\n"
  cost: The run's own pass/fail signal for this task is unreliable — a file the change never touched fails only because this capture ran with --pool=forks --poolOptions.forks.singleFork=true instead of the registry's own npm test, and the same suite passed this exact test clean under the standard pool moments earlier. A reviewer reading only this run would wrongly hold the reviewed task's delivery responsible for a cross-test data leak neither its code nor its test path produces.
  correction: Re-capture the run under the registry's own declared test command (no --pool=forks --poolOptions.forks.singleFork=true substitution); if the memory-guard kill that motivated the substitution recurs, that is a registry/harness-provisioning question to settle separately, not a finding against this task's implementation or test. Nothing in case-version-lifecycle-schema.spec.ts or the task it proves needs to change on the strength of this failure.
  cause: setup
---

## What it is
The review record of the one task the case-version-lifecycle-schema-title-corrective initiative delivered, computed over its one file.

## Notes
The captured run's single failure is in src/__tests__/integration/seed.spec.ts, a file outside the reviewed set; the failures pass diagnosed it as cause setup — cross-test data (leftover investigation-store-attribute rows) reaching a query that expected isolation, best explained by this capture's own deliberate departure (--pool=forks --poolOptions.forks.singleFork=true, used to avoid the harness's repeated memory-guard kills under the default pool) forcing every test file into one shared process rather than the registry's own per-file isolation. Two later captures for other initiatives in this same review batch ran under the identical departure and passed the whole suite clean, so the departure does not reliably cause this; this run's evidence is the one clear case where it did.
The reviewed test file itself passed all 31 of its own assertions in this same run.
Four of the five standard findings and the one conformance-adjacent observation sit in code this task did not introduce — the file's own pre-existing schema-isolation and savepoint-guard helpers, none of which this task's rename touched.
