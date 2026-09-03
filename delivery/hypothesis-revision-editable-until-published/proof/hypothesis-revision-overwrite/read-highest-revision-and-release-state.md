---
title: Proof for reading a hypothesis's highest revision and release state
summary: One unit-level pair proving the port module imports no driver, framework or provider
  client, and seven integration-level tests against a real PostgreSQL database proving
  RelationalCaseStore's readHighestRevisionReleaseState answers the highest revision number and
  the released-reference fact exactly as the task's criteria state, including the two
  discriminating cases — draft-only reference, and a released version pinning a lower revision —
  the port's own discriminated-union shape excludes from ever defaulting wrong.
implementation: sha256:8b135ae541bfbc5191633b8924c102b10c6b5336fcf2ef3302c1227767c66c33
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-read-highest-revision-and-release-state-suite-6
tests:
- file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
  name: imports no database driver, HTTP server or web framework, so a caller depending on this
    port alone pulls in neither
  proves: criterion 6's own module-boundary half — the port module a caller depends on carries no
    driver or framework import
  fails_when: hypothesis-revision-release-state.port.ts imports pg, pg-native, postgres, mysql,
    mysql2, sqlite3, better-sqlite3, mongodb, mongoose, redis, ioredis, typeorm, sequelize, knex,
    prisma, @prisma/client, drizzle-orm, fastify, express, koa, @hapi/hapi, @nestjs/common or
    @nestjs/core (or a subpath of any of them)
- file: src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
  name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
  proves: criterion 6's own module-boundary half, extended to the provider client the project
    depends on elsewhere
  fails_when: hypothesis-revision-release-state.port.ts imports @anthropic-ai/sdk or a subpath of it
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: carries the highest revision number a hypothesis currently holds, once it holds more than
    one
  proves: criterion 1 — for a hypothesis holding at least one revision, the answer carries the
    highest revision number that hypothesis currently holds
  fails_when: readHighestRevisionReleaseState answers a revision other than the greater of two
    inserted revisions, against a real database
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: says a hypothesis holds no revision at all, when the case has never originated it
  proves: criterion 2 — for a hypothesis holding no revision at all, the answer says it holds none
  fails_when: readHighestRevisionReleaseState answers a defined revision, or raises, for a
    hypothesis name the case never originated a revision under
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: carries no released_referenced field at all for a hypothesis holding no revision — never
    defaulting it to a boolean that would route the write side onto the frozen branch for a
    hypothesis that must instead create revision 1
  proves: the implementation's own recorded inference — the no-revision answer omits
    released_referenced entirely rather than defaulting it — directly against the task's own
    UNDERDETERMINED note naming a true default as the wrong-but-criterion-satisfying candidate
  fails_when: the answer for a hypothesis holding no revision carries a released_referenced key at
    all, of any value
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers { revision undefined } rather than raising, for a slug naming no case at all
  proves: the implementation's own recorded inference — no existence check is performed for a
    hypothesis (or case) that does not yet exist; the read answers absence as data
  fails_when: readHighestRevisionReleaseState raises, or answers anything other than exactly
    { revision undefined }, for a slug no case was ever created under
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: says the highest revision is referenced by a released case version, when a case version in
    released state pins exactly that revision
  proves: criterion 3 — the answer says the highest revision is referenced by a released case
    version when a released case version's manifest pins it
  fails_when: released_referenced answers false (or the wrong revision) after placing the
    hypothesis at its one revision and releasing the version that manifests it
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: says the highest revision is referenced by no released case version, when only a case
    version in draft state pins it
  proves: criterion 4 — the answer says the highest revision is referenced by no released case
    version when only draft-state case versions pin it
  fails_when: released_referenced answers true after placing the hypothesis's revision in a
    version left in draft state, never released
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: says the highest revision is referenced by no released case version, when a released case
    version pins a lower revision of that same hypothesis and not the highest
  proves: criterion 5 — a released reference to a lower revision of the same hypothesis does not
    make released_referenced true for the current highest revision
  fails_when: released_referenced answers true, or the answered revision is not the higher of the
    two, when a released version's manifest pins the lower of two revisions and a second, higher
    revision was inserted afterward without being placed in any manifest
not_applicable:
- edge_case: an absent or empty-string slug or hypothesis name passed to
    readHighestRevisionReleaseState
  why: both are passed through as ordinary parameterized query values the same way every other
    RelationalCaseStore method already treats its key parameters; behaviorally indistinguishable
    from any other key nothing was written under, which the no-case and no-revision tests already
    cover
- edge_case: a slow or otherwise-unavailable database dependency
  why: readHighestRevisionReleaseState runs through the same runInTransaction/raiseReadFailure
    mechanism every other read on this store already uses; a driver failure here is wrapped
    identically to failures the store's own pre-existing unit tests already exercise, and this
    task adds no new failure-wrapping behavior to prove
- edge_case: two released case versions' manifests both pinning the highest revision
  why: no criterion distinguishes one released reference from more than one; the EXISTS-based
    query answers true on the first match, so a second referencing row changes nothing observable
untested:
- The write-side choice between overwriting the highest revision and creating the next one, and
  the HTTP 409 refusal for altering a released revision — both explicitly out of this task's own
  criteria per its REMAINDER notes, and reached by no test here
---

## What it is

Nine tests: two unit-level, over the port module's own source text, proving it imports no
driver, framework or provider client; seven integration-level, against a real PostgreSQL
database, proving RelationalCaseStore's readHighestRevisionReleaseState answers the highest
revision number a hypothesis holds, answers "holds none" for a hypothesis (or a case) that never
originated one, and answers whether a released case version's manifest references that exact
highest revision — never a lower one a released version happens to pin, and never defaulted for
the no-revision case in the one direction the specification forbids.

## Notes

No divergence from the project's own standard was required, and nothing in the implementation
was contested. The whole-suite run this proof cites (suite-6) was captured after merging
`main`, which had in the meantime carried in a sibling task's migration
(`migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql`) delivered
concurrently in a separate worktree of this same initiative; two earlier suite attempts in this
worktree (recorded as suite and suite-4) failed only on
`vitest-global-setup.spec.ts`'s migration-count parity check, because this worktree's own
`migrations/` directory did not yet hold that file while the shared test database — one physical
instance behind every worktree's `.env.test` — already did. Merging `main` before this run
brought the two back into agreement; no source this task owns was changed to reach the pass.
