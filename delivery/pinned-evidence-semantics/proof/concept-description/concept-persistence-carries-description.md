---
title: "Proof for concept persistence carries a description, tolerant of a legacy row"
summary: "Existing, unmodified tests over the migration and RelationalGlossaryStore already prove all three criteria; the implementation record's own deferred item — that the RelationalGlossaryStore spec files disagree with the new behavior — no longer holds, since both files already assert description correctly."
implementation: "sha256:0af795a7306cf51b74f4abbf4a87b3376819c08851fa4108bb9a38be765100f5"
standard:
  at: "../standards/backend-node-service.yaml"
  pin: "sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3"
run: run/pinned-evidence-semantics-full-suite-post-evidence-snapshot-4
tests:
- file: "src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts"
  name: "answers each concept with its name, the subject types it accepts, its ttl and its description"
  proves: "The relational glossary store persists a concept's description and reads it back unchanged."
  fails_when: "readWholeConcepts' SELECT stops naming description, or stops mapping a row's own description into the returned ConceptRegistration, so the answered concept omits or misstates the description a row holds."
- file: "src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts"
  name: "inserts each given concept's own name, ttl and description into concepts, and no concept_accepts row where it accepts nothing"
  proves: "The relational glossary store persists a concept's description and reads it back unchanged."
  fails_when: "insertConceptStatement stops naming description as a third column/param, or stops sourcing it from the given concept, so the INSERT recorded no longer carries the concept's own description exactly as given."
- file: "src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts"
  name: "answers each concept with its name, the subject types it accepts, its ttl and its description, exactly as the real tables hold them"
  proves: "The relational glossary store persists a concept's description and reads it back unchanged."
  fails_when: "a description value written directly into a real concepts row is not the value RelationalGlossaryStore.readConcepts() answers for that concept — the SELECT stops reading the column, or answers anything other than the stored string."
- file: "src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts"
  name: "answers a concept with an empty accepts array when it currently accepts no subject type"
  proves: "A concept row stored before this migration reads back with an honest empty description, never a read failure."
  fails_when: "readConcepts rejects, or answers anything other than the empty string, for a real concepts row that was inserted naming only name and ttl, never a description."
- file: "src/__tests__/integration/persistence/glossary-concept-description-schema.spec.ts"
  name: "reads a concepts row stored before this migration back with an honest empty description, never a read failure — the row's own name, ttl and concept_accepts entries all survive the same way"
  proves: "A concept row stored before this migration reads back with an honest empty description, never a read failure."
  fails_when: "applying migrations/0012 to a schema already holding a concepts row leaves that row's description SQL NULL, or the ALTER TABLE itself raises against existing data, rather than backfilling it to the empty string; or the row's own name, ttl or concept_accepts entries stop surviving unchanged."
- file: "src/__tests__/integration/persistence/glossary-concept-description-schema.spec.ts"
  name: "leaves every pre-existing row of six other tables exactly as it was, altering and removing nothing outside the new column this migration adds to concepts"
  proves: "The migration adding the description column is additive: no existing row of any other table is altered or removed."
  fails_when: "migrations/0012 issues any statement beyond the single ALTER TABLE ADD COLUMN against concepts — one that alters, deletes or otherwise touches a row of subject_types, subject_attributes, outcomes, actions, recipients or cases."
- file: "src/__tests__/integration/persistence/schema-migrations.spec.ts"
  name: "holds every domain column NOT NULL except exactly the six columns the model declares optional"
  proves: "the implementation's own recorded inference that concepts.description is NOT NULL DEFAULT '' rather than nullable"
  fails_when: "migrations/0012 declares description nullable instead of NOT NULL DEFAULT '', which would add concepts.description to this pre-existing, unowned test's own closed list of six nullable columns and fail its exact-list assertion."
- file: "src/__tests__/integration/vitest-global-setup.spec.ts"
  name: "has already recorded every script migrations/ holds as applied, exactly once each, and left the database holding the schema those scripts describe by the time this spec's own first test runs, proving the suite's own setup ran before any test"
  proves: "the implementation's own recorded inference that the DEFAULT '' is kept permanently on the column rather than dropped after a one-time backfill"
  fails_when: "the DEFAULT is dropped once migrations/0012 has run, so vitest-global-setup.ts's own repair statement (INSERT INTO concepts (name, ttl) ... — never naming description) raises a NOT-NULL violation before this suite's global setup completes, and this test — and every other test in the whole suite — never runs at all."
not_applicable:
- edge_case: "An explicitly empty-string description given through writeConcepts, as opposed to a legacy row that never named one"
  why: "insertConceptStatement passes concept.description straight through as a parameter with no special-casing of the empty string; the write test above already proves the same code path for a non-empty value, and the two legacy-row tests above already prove the empty string specifically round-trips correctly through the read half, so a third, empty-string-through-write variant would exercise no code path the two combined do not already reach."
- edge_case: "A description containing characters that could matter to a hand-built SQL string (quotes, semicolons, newlines)"
  why: "description reaches the database only as a bound parameter ($3) of a parameterized statement, never interpolated into SQL text — the same convention every other string column this store writes already uses; no criterion of this task asks for an injection-resistance guarantee distinct from that existing, codebase-wide convention."
- edge_case: "Updating an already-stored concept's description to a new value on a second writeConcepts call"
  why: "writeConcepts' own whole-replace mechanism (DELETE then INSERT, inside one transaction) is the general write shape task/concept-authoring/glossary-store-concept-write's own criteria already establish and prove for concept.name/ttl/accepts; this task adds description to that same, already-proven replace path with no attribute-specific branching, so a dedicated update-then-reread test would exercise nothing beyond what the write and read mapping tests above, and that sibling task's own proof, already cover."
- edge_case: "Two concurrent writeConcepts calls against concepts at once"
  why: "concurrency guarantees belong to writeConcepts' own whole-replace transaction, established and covered by task/concept-authoring/glossary-store-concept-write; this task changes no locking or transaction behavior, only which columns the same INSERT names."
- edge_case: "Applying migrations/0012 a second time against a schema that already holds it"
  why: "no criterion of this task states re-apply behavior, and migration-runner's own idempotent apply-once guarantee (bookkeeping via schema_migrations) is already proven, unmodified by this task, in migration-runner.spec.ts's own 'applies no script twice' test."
untested:
- "No test calls RelationalGlossaryStore.writeConcepts against a real, live database at all, with or without a description. 'concepts' is now referenced by capabilities.concept, hypothesis_revision_collects.concept_name and investigation_evidence.concept (migrations 0004/0005/0007/0009) — the same shape that already makes writeTerms' unconditional DELETE fail with a foreign-key violation against subject_types/outcomes/actions/recipients on this project's real, shared test database, as relational-glossary-store.repository.spec.ts's own integration file documents at length for those four tables. Whether store.writeConcepts against 'concepts' hits that same violation today was not empirically re-checked for this proof. Criterion 1's write half is therefore proven only at the statement level, against a stand-in connection (the unit test asserting the INSERT's own text and params), never end-to-end against a real database. This limitation predates this task's own change — writeConcepts' DELETE-then-INSERT shape belongs to task/concept-authoring/glossary-store-concept-write — and adding a description column neither introduces nor resolves it."
- "The implementation record's own deferred note (that pre-existing RelationalGlossaryStore unit and integration spec files assert pre-description SQL text and description-less object literals) was found, on direct reading, to already be resolved: both files already assert the new SQL text and already carry a description field on every Concept/ConceptRegistration literal. No edit was made to either file, and no record of who resolved it or when exists in this proof's own inputs — only that the files on disk, as read while writing this proof, already match the store's current behavior and were confirmed present and passing (by file-level test count) in the cited whole-suite run."
---

## What it is
Every criterion of this task is proven by tests that already existed and already passed in the cited whole-suite run: the migration's additive shape and its legacy-row tolerance are proven at the schema level by glossary-concept-description-schema.spec.ts, and the store's own persistence of description is proven at the statement level (unit) and against a real database (integration) by relational-glossary-store.repository.spec.ts's own two files.
Both of the implementation record's own recorded inferences are also proven: the NOT NULL DEFAULT '' choice by schema-migrations.spec.ts's pre-existing closed list of nullable columns, and the DEFAULT staying permanently on the column by vitest-global-setup.spec.ts's own first test, whose very execution depends on vitest-global-setup.ts's repair insert (which never names description) still succeeding.

## Notes
The implementation record's own `deferred` section states that the pre-existing RelationalGlossaryStore unit and integration spec files disagree with the store's new behavior and are the test-author's to update. On direct reading, both files already assert the new SQL text (SELECT/INSERT naming description) and already carry a description field on every Concept/ConceptRegistration literal they construct — there was nothing left to update, and no edit was made to either file. This is recorded in `untested` above rather than silently treated as "nothing to report," since the premise the implementation record stated no longer matches what the files hold.
No test in this proof was newly written or edited; every one cited above was read directly from the files on disk, cross-checked for an exact per-file test-count match against delivery/pinned-evidence-semantics/run/pinned-evidence-semantics-full-suite-post-read-concept/test.log, and, where the log's own reporter expands a test's own name (glossary-concept-description-schema.spec.ts, schema-migrations.spec.ts's file-level count, vitest-global-setup.spec.ts), confirmed by that exact name.
