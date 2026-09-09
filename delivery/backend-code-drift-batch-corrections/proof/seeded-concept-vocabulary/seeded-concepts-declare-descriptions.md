---
target: backend
title: Seeded concepts declare a description, proven at the fixture, the source and the seeded row
summary: Property tests over the concept fixture, the seed script's own source, and a real Postgres run
  prove every seeded concept carries a non-empty, fixture-sourced description that restates neither the
  case's hypothesis criterion nor its resolution.
implementation: sha256:59d791494d799fc489e07a1f7327f4187c7202900d7d43d22f6d1660c5b75532
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/seeded-concept-vocabulary-seeded-concepts-declare-descriptions-suite-2
tests:
- file: src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
  name: declares a non-empty description for every concept it holds
  proves: Criterion 2 -- src/src/fixtures/glossary/concept.json declares a description for every concept
    it holds.
  fails_when: any entry of src/fixtures/glossary/concept.json is missing its description field, or carries
    an empty string
- file: src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
  name: states what each collected concept's named observation means without repeating the curated case's
    own hypothesis criterion or resolution vocabulary
  proves: Criterion 4 -- each seeded description states what the named observation means and names no
    decision a case's own criterion or a specification rule governs, read through the property the task's
    own ADVISORY note authorizes (no literal-match against the case fixture's criterion or resolution
    vocabulary) rather than through a golden-value comparison
  fails_when: a concept's description becomes exactly equal to, or contains, its collecting hypothesis's
    own criterion text, or contains the hypothesis's resolution outcome, referral action or referral recipient
    identifiers verbatim
- file: src/__tests__/unit/seed.spec.ts
  name: passes each concept's description straight through, as the INSERT's third bound parameter, to
    the concepts table
  proves: Criterion 3 (the parameter-binding half) -- the seed passes concept.description, read from the
    parsed fixture, into the INSERT rather than typing the value inline
  fails_when: seedConcepts() stops binding concept.description as the INSERT INTO concepts query's third
    parameter
- file: src/__tests__/unit/seed.spec.ts
  name: embeds none of the fixture's own concept description text as a literal string in its own source
  proves: Criterion 3 (the no-literal half) -- the seed reads each concept description from the fixture
    rather than from a literal written in the seed script
  fails_when: seed.ts is edited to hardcode either fixture concept exact description text directly in
    its own source instead of reading it from the parsed fixture file
- file: src/__tests__/unit/seed.spec.ts
  name: does not redeclare the concept description guard or error that already stand in glossary.service.ts
  proves: Criterion 6 -- the seed does not re-declare the description guard or the description error that
    already stand in glossary.service.ts
  fails_when: seed.ts is edited to add its own namesNoDescription-style guard function, or to import or
    reference ConceptDescriptionRequiredError
- file: src/__tests__/integration/seed.spec.ts
  name: writes the concepts.description column with the fixture's own non-empty description text, for
    every concept the curated case collects
  proves: Criterion 1 -- every concept row the seed inserts carries a non-empty description, verified
    against a real Postgres instance after seed.ts has actually run
  fails_when: seedConcepts() stops publishing concept.description onto the concepts table (whether by
    insert or by its ON CONFLICT DO UPDATE), leaving the description column empty instead of holding the
    fixture's text, or the fixture itself declares an empty description for a concept the seed writes
- file: src/__tests__/integration/seed.spec.ts
  name: writes the concepts.description column with the fixture's own non-empty description text, for
    every concept the curated case collects
  proves: Criterion 5 -- the description requirement of rules/glossary/a-concept-declares-its-description
    refuses none of the concepts the seed writes, evidenced (per the task own ADVISORY note) by the seed
    writes succeeding with a non-empty description stored for every concept, rather than by asserting
    the seed calls through glossary.service.ts registry guard
  fails_when: the seed run leaves any concept row it writes with an empty or missing description
- file: src/__tests__/integration/seed.spec.ts
  name: holds every concept the curated case collects, each with the subject types it accepts and its
    ttl, matching the fixture exactly
  proves: Criterion 7 -- the name, accepts and ttl each seeded concept already carries are unchanged;
    this pre-existing test was not modified by this task and continues to pass unmodified
  fails_when: seedConcepts() stops writing the correct name, ttl or concept_accepts rows, or the fixture
    name/accepts/ttl values change from what this pre-existing assertion expects
not_applicable:
- edge_case: A description consisting only of whitespace.
  why: rules/glossary/a-concept-declares-its-description's own guard (glossary.service.ts namesNoDescription)
    treats only undefined or the exact empty string as no description -- a whitespace-only string is a
    value the specification own guard already accepts, and testing a stricter rule than the guard states
    would assert a rule no node holds
- edge_case: Duplicate concept names, or a concurrent/repeated seed run overwriting an already-written
    description.
  why: seedConcepts() writes name/accepts/ttl through the same insert-only, ON CONFLICT DO NOTHING statements
    it already used before this task, and only the description column is now upserted on a name conflict;
    a pre-existing idempotency test already exercises a second seed run as a no-op for the other columns,
    and the suite's own red-then-green run across build-2/suite-2 is the evidence the upsert corrects
    exactly the one stale case it needs to and no other
- edge_case: A concept fixture entry the curated case never collects, or an empty concept.json array.
  why: concept.json is committed, curated content that this task does not restructure; testing an artificially
    emptied or unreferenced fixture would prove nothing about the seed own behavior
- edge_case: A malformed or missing concept.json file at seed time.
  why: seed.ts's readFile/JSON.parse handling of the fixture file is unchanged by this task; this failure
    mode pre-dates this task's own criteria
untested:
- Whether each seeded description's authored wording actually states meaning rather than policy, beyond
  the mechanical non-restatement checks this proof runs -- the task's own ADVISORY note is explicit that
  this vocabulary is open and authored rather than enumerated, so the exact wording is only evaluable
  by reading against policy, never by comparison with a node, and no test can stand in for that reading
contested:
- what: network-outage-flag's authored description ("Whether an active network outage is currently registered
    for the contract's service area.") is, apart from a prepended "Whether" and a lowercased first letter,
    nearly the same sentence as its collecting hypothesis's own firing criterion in src/fixtures/case/intermittent-connection-outage/1.json
  why: the property tests this proof writes (exact-equality and substring containment, per the task's
    own ADVISORY on how criterion 4 is testable) both pass, because the case differs and the sentence
    gains one leading word -- but a reader judging criterion 4 against rules/glossary/a-description-states-meaning-never-policy
    may reasonably read this as restating the hypothesis's own firing condition rather than independently
    stating what the flag concept means. No mechanical, non-golden-value check the task's own notes authorize
    can distinguish a legitimate 'a flag's meaning is literally whether X holds' rephrasing from a restatement
    of the case's own decision text, so this is flagged for a reader's judgment rather than resolved here
---
## What it is
Seven tests over three files prove the six behavioral criteria and the one unchanged-fields criterion of this task: two over the fixture itself (non-empty description; no restatement of the case own criterion or resolution text), three over the seed script own source (parameter binding, no hardcoded literal, no guard redeclaration), and two over a real seed run against Postgres (every seeded row carries the fixture description; name/accepts/ttl stay as they were).
## Notes
The first suite run (seeded-concept-vocabulary-seeded-concepts-declare-descriptions-suite) failed the integration test over the seeded description column, diagnosed cause: code -- the implementation own ON CONFLICT DO NOTHING never overwrote a stale, description-less concepts row a concurrently-run setup path can leave behind. The implementation was revised (ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description) and the suite was re-run under -suite-2, which passed; no test in this proof was changed to answer that run.
