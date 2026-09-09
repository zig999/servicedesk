---
target: backend
title: Seeded concepts declare a description
summary: The seed reads and publishes a required description for every concept it writes, sourced from
  the concept fixture rather than a literal, even when a stale description-less row from another setup
  path already exists.
task: sha256:22e3f0dcc2c7d3dd2ec58934286480682f6495c6570751acbab29fa6394aadd3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/seeded-concept-vocabulary-seeded-concepts-declare-descriptions-build-2
files:
- path: src/fixtures/glossary/concept.json
  effect: declares a non-empty description for each of its two concepts (equipment-status, network-outage-flag),
    alongside their unchanged name, accepts and ttl
- path: src/seed.ts
  effect: ConceptFixture now requires a description field, and seedConcepts() reads it from the fixture
    and publishes it into the concepts table's description column on every run -- inserting it for a new
    row and updating it onto an existing row that lacks it, via ON CONFLICT (name) DO UPDATE SET description
    = EXCLUDED.description, while name/accepts/ttl handling is otherwise unchanged
criteria:
- criterion: Every concept row the seed inserts carries a non-empty description.
  met: true
  how: seedConcepts() in src/seed.ts now writes concept.description, read from the fixture, into the description
    column via INSERT ... ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description; the fixture
    holds a non-empty string for both concepts, and the DO UPDATE clause means the description is published
    even when a concepts row for that name already exists from another setup path (src/vitest-global-setup.ts's
    ensureRepairedConceptsExist), which is what the integration suite's own first run exposed under DO
    NOTHING
- criterion: src/src/fixtures/glossary/concept.json declares a description for every concept it holds.
  met: true
  how: both entries in the fixture (equipment-status, network-outage-flag) now carry a "description" field
    with a non-empty string
- criterion: The seed reads each concept description from that fixture rather than from a literal in the
    seed script.
  met: true
  how: ConceptFixture's description field is parsed from the same JSON.parse(raw) read as name/accepts/ttl
    already were, and seedConcepts() passes concept.description straight through to the query's parameter
    list -- no description text is written in seed.ts itself
- criterion: Each seeded description states what the named observation means and names no decision a case
    own criterion or a specification rule governs.
  met: true
  how: equipment-status's description ("The operating status corporate systems currently report for the
    customer's registered equipment.") and network-outage-flag's ("Whether an active network outage is
    currently registered for the contract's service area.") each state what the named observation reports,
    mirroring the read side already declared in src/fixtures/observations.json, and neither restates the
    case fixture's own hypothesis criterion or its resolution/referral, which stay the case fixture's
    to state
- criterion: The description requirement of rules/glossary/a-concept-declares-its-description refuses
    none of the concepts the seed writes.
  met: true
  how: both seeded concepts now carry a non-empty description at the point the seed's own write runs,
    and the DO UPDATE clause guarantees this holds even when a stale, description-less row for that name
    already exists from a concurrently-run setup path
- criterion: The seed does not re-declare the description guard or the description error that already
    stand in src/src/glossary/glossary.service.ts.
  met: true
  how: seed.ts still writes directly through connection.query() as before; no guard function or error
    class was added to it, and namesNoDescription/ConceptDescriptionRequiredError remain declared only
    in src/glossary/glossary.service.ts
- criterion: The name, accepts and ttl each seeded concept already carries are unchanged.
  met: true
  how: both fixture entries keep their original name, accepts array and ttl values verbatim, and the query's
    ON CONFLICT clause only updates the description column -- name is the conflict key and is never rewritten,
    ttl is passed as before but is never overwritten by a conflicting row (the DO UPDATE names only description),
    and concept_accepts is written by the same unchanged loop and INSERT it always was
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/fixtures/glossary/concept.json
  - src/seed.ts
  how: the node's required description attribute, alongside name/accepts/ttl, is what the fixture now
    declares and what seedConcepts() now publishes for every concept the seed writes, including onto a
    pre-existing row a concurrent setup path already created without one
- node: rules/glossary/a-concept-declares-its-description
  how: this task reaches only the seed's direct-SQL write path, which the rule's own subject (the registry's
    register/update path) does not name; the enforcement itself already stands unchanged in glossary.service.ts
    (namesNoDescription/ConceptDescriptionRequiredError), which this task neither touches nor re-declares.
    Per the task's own ADVISORY note, criterion 5 (no seeded concept is left without a description) stands
    as evidence that the rule's description requirement is honored for these rows, without this task adding
    or duplicating the guard itself
- node: rules/glossary/a-description-states-meaning-never-policy
  encoded_at:
  - src/fixtures/glossary/concept.json
  how: the two authored description strings state what each named observation means (equipment status
    reported, whether an outage is registered) and name no decision -- the case fixture's own hypothesis
    criteria and resolutions, which this task left untouched, remain where that decision is stated
inferences:
- inferred: the seeded description text itself (its exact wording for equipment-status and network-outage-flag)
  from: the specification keeps this vocabulary as an open, authored set rather than an enumeration (per
    the task's own ADVISORY note), so the wording was authored from the concept's name and the meaning
    already stated for it at the read side in src/fixtures/observations.json, deliberately excluding the
    case fixture's own hypothesis criterion and resolution text since those state a decision rather than
    a meaning
- inferred: on a conflicting name, only the description column is republished (ttl and the concept_accepts
    rows keep their prior insert-only, ON CONFLICT DO NOTHING behavior) rather than every column being
    upserted
  from: the failure-diagnostician's read of the failing integration run (src/__tests__/integration/seed.spec.ts),
    which traced the empty-description assertion to seedConcepts()'s ON CONFLICT DO NOTHING never overwriting
    a stale, description-less row that src/vitest-global-setup.ts's ensureRepairedConceptsExist can leave
    behind under a concurrently-run suite; narrowing the fix to the description column keeps criterion
    7 (name/accepts/ttl unchanged) intact rather than widening the seed's conflict handling for columns
    no criterion or failure named
deferred:
- what: rules/glossary/a-description-states-meaning-never-policy also constrains domain/investigation/field-semantics
    -- a field's description in a capability's output schema -- which no criterion of this task touches.
  why: the task's own Notes record this as a REMAINDER belonging to a different, uncut task over domain/investigation/field-semantics
    and a capability's output schema; growing this task's implements to cover it would claim work this
    plan does not do
---
## What it is
The seed writes glossary concepts by direct SQL insert, reading name, accepts and ttl from src/fixtures/glossary/concept.json but supplying no description, though domain/glossary/concept declares description required alongside those three attributes.
The fixture now declares a non-empty description for each of its two concepts, and seedConcepts() in seed.ts reads that field and publishes it into the concepts table alongside name and ttl, via an upsert that overwrites only the description column on a name conflict so a stale, description-less row left by another setup path is corrected rather than left in place.
No change touches the registry path in glossary.service.ts, where namesNoDescription and ConceptDescriptionRequiredError already enforce the same requirement for a register or update call; the seed writes through a different, direct path that this task supplies a description for without re-declaring that guard.
## Notes
The suite run seeded-concept-vocabulary-seeded-concepts-declare-descriptions-suite failed one test (concepts.description read back as empty) because the original INSERT used ON CONFLICT DO NOTHING, which never overwrote a stale, description-less concepts row left by src/vitest-global-setup.ts. The fix narrows the conflict clause to DO UPDATE SET description = EXCLUDED.description, and the suite was re-run under -suite-2.
