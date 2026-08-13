---
title: Proof for task/case-authoring/curated-data-seeded
summary: Proves the seed's npm-script wiring at the unit level and its six real-effect criteria against
  a real database at the integration level, running seed.ts's own unexported top-level code via a dynamic
  import rather than reinventing its logic.
implementation: sha256:bc53ffc563c0a5c36cf9b356a263636fc97dbd591c72ee825860a24f0c7431a4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-authoring-curated-data-seeded-suite-3
tests:
- file: src/__tests__/unit/seed.spec.ts
  name: the manifest declares a "seed" script that runs the built seed.js from dist/, mirroring "migrate"'s
    own precedent
  proves: package.json's own new "seed" script entry the implementation record's `files` section states
  fails_when: package.json's scripts.seed is missing or is not exactly 'node dist/seed.js'
- file: src/__tests__/integration/seed.spec.ts
  name: holds both non-conclusion outcomes, having run against a database this file had itself confirmed
    lacked them beforehand
  proves: criterion 1, its falsifiable end-state half (real empty-to-populated transition; see `untested`
    for the ordering half)
  fails_when: either non-conclusion outcome is absent from public.outcomes after a run started from a
    database confirmed to lack both
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
    ones together
  proves: criterion 2 (outcome vocabulary)
  fails_when: public.outcomes holds a name the fixture's outcome.json does not declare, or is missing
    one it does
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-type name, the one the curated case declares as its subject
  proves: criterion 2 (subject-type vocabulary)
  fails_when: public.subject_types diverges from subject-type.json's own names
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-attribute name, even though the curated case document
    names no subject attribute of its own
  proves: criterion 2's subject-attribute half, excluding the UNDERDETERMINED implementation that writes
    none
  fails_when: public.subject_attributes is empty or diverges from subject-attribute.json's own names
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
    declare
  proves: criterion 2 (action vocabulary)
  fails_when: public.actions diverges from action.json's own names
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and fallback
    declare
  proves: criterion 2 (recipient vocabulary)
  fails_when: public.recipients diverges from recipient.json's own names
- file: src/__tests__/integration/seed.spec.ts
  name: holds every concept the curated case collects, each with the subject types it accepts and its
    ttl, matching the fixture exactly
  proves: criterion 3
  fails_when: public.concepts/public.concept_accepts diverge from concept.json's own name/ttl/accepts
- file: src/__tests__/integration/seed.spec.ts
  name: registers one read-only capability, with every attribute the fixture declares, for each of the
    two concepts the curated case collects
  proves: criterion 4, excluding the UNDERDETERMINED implementation that registers a partial contract
  fails_when: a stored capability row omits any attribute capability.json declares, or the count for the
    two fixture concepts is not exactly two
- file: src/__tests__/integration/seed.spec.ts
  name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it
    beforehand
  proves: criterion 5's behavioral half
  fails_when: createCaseStore(connection).readVersion(slug, version) answers undefined after the run
- file: src/__tests__/integration/seed.spec.ts
  name: seed.ts's own source enters the case only through the published authoring command, naming createAuthorCaseVersion
    and authorCaseVersion near its case-writing code, and never a direct writeVersion call
  proves: criterion 5's structural half (no other write) — createCaseStore itself is named once, by the
    idempotency guard's own read (readVersion), which this criterion does not forbid; only a write outside
    the authoring command would
  fails_when: seed.ts's source lacks the createAuthorCaseVersion(...).authorCaseVersion( call, or names
    a .writeVersion( call anywhere
- file: src/__tests__/integration/seed.spec.ts
  name: reads the seeded version back whole, matching every field the fixture document itself declares
    — not only the case's root and its hypotheses' names
  proves: criterion 6, excluding the UNDERDETERMINED implementation that reads back only the case root
    and hypothesis names
  fails_when: any field of the read-back case diverges from the fixture document
- file: src/__tests__/integration/seed.spec.ts
  name: resolves without rejecting when seed.ts is run a second time against a database it has already
    seeded
  proves: this delivery's own disclosed inference — a rerun catches CaseVersionAlreadyStoredError rather
    than crashing
  fails_when: a second run of seed.ts rejects
- file: src/__tests__/integration/seed.spec.ts
  name: seed.ts's own source catches CaseVersionAlreadyStoredError specifically around its case-writing
    call, rather than letting every rejection from it propagate unconditionally
  proves: the same rerun inference, at the source level
  fails_when: seed.ts's catch clause around the authoring call does not name CaseVersionAlreadyStoredError
not_applicable:
- edge_case: absent or empty input
  why: seed.ts's own inputs are the project's fixed, committed fixture files, never user-supplied; no
    criterion invites variable or absent input.
- edge_case: a boundary at each end of a numeric range
  why: no criterion of this task states a numeric range.
- edge_case: an empty collection where one comes back
  why: seed.ts always writes a fixed, non-empty fixture set; no criterion asks what an empty read answers.
- edge_case: a dependency that fails, is slow, or answers unexpectedly
  why: this is a real-effect proof against the real database; no criterion of this task asks for degraded-dependency
    handling, and provoking a real Postgres failure deterministically is outside what this proof can safely
    arrange.
- edge_case: two operations against one subject at once
  why: fileParallelism:false and this is a single-writer deployment script; no criterion describes concurrent
    access to the seed.
untested:
- Criterion 1's strict ordering claim — that the two non-conclusion outcomes are written before the case,
  as distinct from being lazily topped up during the case's own coherence read. GlossaryService.withNonConclusionOutcomes
  re-inserts any missing non-conclusion outcome on every read of the outcome vocabulary, including the
  read authorCaseVersion's own coherence check makes while authoring. A variant of seed.ts that never
  wrote the two names at all, relying entirely on that read-time top-up, would reach the exact same end
  state that any test after one run can observe. Distinguishing 'written before' from 'topped up during'
  requires observing seed.ts's own internal call order, which has no export or hook.
- The 'merge' branch of seedOutcomes — adding a NON_CONCLUSION_OUTCOMES name the fixture's own outcome.json
  does not already declare. The real committed outcome.json already lists both non-conclusion outcome
  names, so that branch is never taken through the real fixture.
- The atomicity of seedConcepts's own per-statement (non-transactional) writes under a genuine mid-sequence
  failure. No criterion of this task asks for it, and provoking a failure deliberately would require corrupting
  the committed concept.json fixture.
- This delivery's own inference that fixtures are located relative to seed.ts's own import.meta.url rather
  than a literal '../fixtures' path. Every other test's successful fixture read after a full run already
  implies the path resolves correctly; there is no externally observable alternative to isolate as its
  own test.
divergences:
- cites: STK-08
  file: src/__tests__/integration/seed.spec.ts
  departure: DATABASE_URL is read directly from process.env via requireDatabaseUrl() rather than through
    config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is configured too, which this file's own
    connection has no use for — the same reason every sibling integration file in this tree already discloses.
- cites: TYP-02
  file: src/__tests__/integration/seed.spec.ts
  departure: readGlossaryFixtureNames, readConceptFixture, readCapabilityFixture and readCaseFixture each
    cast a JSON.parse result with `as`, with no narrowing guard beside the assertion.
  why: mirrors the exact unguarded-cast convention seed.ts's own implementation record already discloses
    (citing TYP-02) and case-fixture-reads-clean.spec.ts's own insertTerms/insertConcepts/insertCapabilities
    already use, over the same committed fixture files, never external input.
---

## What it is

Fourteen tests — one proving the seed's own npm-script wiring, thirteen against a real database —
proving the six real-effect criteria, running seed.ts's own unexported top-level code through a
dynamic import rather than reinventing its logic, and confirming a rerun catches the write-once
refusal rather than crashing.

## Notes

Criterion 1's strict ordering claim (non-conclusion outcomes written before the case, as distinct
from being lazily topped up during the case's own coherence read) is recorded as untested: seed.ts
exports nothing, so its own internal call order cannot be observed from outside, only its end state.

The rerun test found a real bug: seed.ts's own whole-table vocabulary replace failed on a second run
once the case's hypotheses held a live foreign key into it. Fixed in the implementation by gating
the whole sequence on the case not yet standing (disclosed in that record's own inferences); this
proof's own source-text assertion for criterion 5 is adjusted accordingly, since the fix legitimately
introduces one read-only call to createCaseStore that the original assertion had (over-broadly)
forbidden by name rather than by write.
