---
title: Proof for task/relational-substrate/database-connection
summary: New tests over env.ts's now-required DATABASE_URL, database-connection.ts's URL-only pg Pool
  construction, a repo-wide absence of deployment-provisioning artifacts, and a cross-directory import
  audit of case/glossary/capability-registry/investigation that closes criterion 4 and excludes all three
  UNDERDETERMINED shapes this task's Notes name; dependency-manifest.spec.ts's own pre-existing admitted/forbidden
  dependency lists are updated so pg -- newly authorized by this task's criterion 5 -- is admitted rather
  than forbidden, since its prior assertions were written against constraints/the-mvp-persists-to-no-database,
  a node the current specification no longer holds (superseded by constraints/the-system-persists-to-one-relational-database
  and constraints/the-database-is-externally-provisioned); and, per the launcher's explicit, narrowly-scoped
  human approval for this delivery only, two pre-existing fixtures from the closed live-engine-mvp initiative
  (env.spec.ts's validEnvSource() helper and diagnose-server.factory.spec.ts's literal Env object) each
  gain a placeholder DATABASE_URL so they keep typechecking and passing against the now-widened Env, with
  no assertion in either file changed.
implementation: sha256:a40cba3703742f1da944edb8fc72d4adca5342d755e7a6c7e50e524ad7e193a3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-database-connection-suite-2
tests:
- file: src/__tests__/unit/config/env.spec.ts
  name: parses a configured DATABASE_URL through onto Env unchanged
  proves: The environment schema requires a database connection URL, and a load with that variable absent
    refuses once, naming it together with every other violated field. (positive half)
  fails_when: loadEnv stops reading DATABASE_URL onto Env, or silently drops/alters the given value
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming DATABASE_URL when it alone is absent
  proves: The environment schema requires a database connection URL, and a load with that variable absent
    refuses once, naming it together with every other violated field.
  fails_when: envSchema stops requiring DATABASE_URL, or loadEnv refuses without naming it
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming DATABASE_URL when it is set to an empty string
  proves: the same criterion's empty-input edge case
  fails_when: an empty-string DATABASE_URL is accepted instead of refused
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming DATABASE_URL together with another missing field in the
    same refusal, rather than refusing on the first one alone
  proves: the criterion's aggregated-refusal half, specifically for DATABASE_URL joining the existing
    set
  fails_when: DATABASE_URL is validated in a separate pass from the rest, or the refusal names only one
    of the two missing fields
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: builds the pg Pool with exactly the given connection URL as its connectionString, and no other
    configuration key
  proves: The connection is constructed from that configured URL alone... (behavioral half)
  fails_when: createDatabaseConnection stops passing the URL as connectionString, calls Pool more than
    once, or adds any other key to the config object
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: passes a different given URL straight through unchanged, never a value fixed in the module itself
  proves: the same criterion, generalized over the argument rather than one fixed sample value
  fails_when: the module ignores its argument or substitutes a value of its own
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: writes no literal database port anywhere in its own source
  proves: '...no host, port, endpoint or credential for a database appears in source. (source-scan half)'
  fails_when: a literal well-known database port number is written into the module's text
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: writes no literal IPv4 host anywhere in its own source
  proves: the same criterion's source-scan half
  fails_when: a literal IPv4 address is written into the module's text
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: writes no literal embedded credential anywhere in its own source
  proves: the same criterion's source-scan half
  fails_when: a literal user:password@ credential is written into the module's text
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: writes no literal 'localhost' endpoint anywhere in its own source
  proves: the same criterion's source-scan half
  fails_when: the literal string "localhost" (any case) is written into the module's text
- file: src/__tests__/unit/persistence/database-connection.spec.ts
  name: constructs exactly one connection in its own source, never a second one for a second store
  proves: UNDERDETERMINED, from the specification -- ...a connection module constructing a second connection
    for a second store passes every criterion above as written... (Notes entry 3)
  fails_when: the module contains a second 'new Pool(' construction site, e.g. a second exported factory
    for a second store
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: the case, glossary, capability-registry and investigation modules import no driver and no framework
  proves: '...an audit of the case, glossary, capability-registry and investigation modules'' imports
    finds no driver and no framework among them.'
  fails_when: any .ts file under one of the four directories imports a database driver, ORM, query builder
    or HTTP/RPC framework
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports the connection module directly, by any relative path
  proves: UNDERDETERMINED, from the specification -- ...a domain module could import the connection module
    directly rather than through a port... (Notes entry 1)
  fails_when: any file under the four directories imports database-connection.ts by any relative path
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports the LLM provider client directly, except the two adapters that implement
    a published port against it
  proves: UNDERDETERMINED, from the specification -- ...a domain module importing the LLM provider client
    directly would still pass... (Notes entry 2)
  fails_when: any file under the four directories, other than the two named production LLM adapters, imports
    @anthropic-ai/sdk
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: the connection module sits under persistence/, beside the file-backed repositories, rather than
    under any of the four audited domain directories
  proves: The connection module sits with the persistence adapters... (placement half of criterion 4)
  fails_when: database-connection.ts is moved out of persistence/, or persistence/ no longer also holds
    a file-backed repository beside it
- file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  name: the tree contains no Dockerfile, docker-compose file, Terraform script or Procfile provisioning
    a database service for the deployment
  proves: Nothing in the tree provisions a database service for the deployment.
  fails_when: any such artifact is added anywhere under the target source root outside node_modules/.git/dist
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest declares no database driver beyond the one admitted pg
  proves: the forbidden-set half of "The manifest declares the driver, and the audit of declared runtime
    dependencies names it among the set it admits."
  fails_when: any other database driver, ORM or query builder is declared in any dependency section
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest declares pg as a dependency
  proves: the admitted-set half of the same criterion
  fails_when: pg is absent from package.json's dependencies
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest pins pg to ^8.13.0
  proves: the implementation's own recorded inference that pg is pinned to ^8.13.0
  fails_when: pg's declared version range changes
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest's dependencies hold exactly @anthropic-ai/sdk, fastify, pg and zod
  proves: the same criterion's totality over this task's own change to the dependencies section
  fails_when: a dependency is added or removed from that section without this test being revisited
- file: src/__tests__/unit/dependency-manifest.spec.ts
  name: the dependency manifest orders @anthropic-ai/sdk, fastify and pg ahead of the pre-existing zod
  proves: the implementation's own recorded inference that pg is inserted alphabetically between fastify
    and zod
  fails_when: pg's position in the dependencies object moves after zod
not_applicable:
- edge_case: concurrent calls to createDatabaseConnection from two callers at once
  why: createDatabaseConnection is a pure, synchronous factory with no shared mutable state; each call
    independently builds its own Pool from its own argument, so concurrency raises no behavior beyond
    what the two URL-passthrough tests already prove
- edge_case: a dependency (the database, or the pg driver itself) that is unavailable, slow, or answers
    in an unexpected shape
  why: createDatabaseConnection never opens a connection itself -- pg's Pool connects lazily -- and wiring
    this module into anything that would actually reach a database, along with handling that failure,
    is explicitly left to task/service-on-the-database/store-wiring per this task's own Notes and the
    implementation record's own deferred section; there is no connecting behavior in this task's delivery
    to exercise against a failing dependency
- edge_case: createDatabaseConnection called with an empty-string URL
  why: createDatabaseConnection performs no validation of its own; DATABASE_URL's non-emptiness is validated
    once, upstream, at the environment boundary (proven by this proof's own empty-string criterion-1 test);
    an empty-string test here would only re-prove the generic passthrough already covered
- edge_case: a uniqueness violation, an operation against forbidden state, or a boundary at either end
    of a numeric range
  why: DATABASE_URL is a plain required string with no numeric range, no uniqueness constraint and no
    state machine; none of these edge cases has a corresponding behavior for this task's criteria to raise
untested:
- That the project's standard (standards/backend-node-service.yaml) itself lists pg among its dependencies
  entries, tied to STK-05 -- verified by directly reading the file while writing this proof, but not asserted
  by an automated test, since no YAML-parsing dependency is available in this project to read it at test
  time; criterion 5's admitted-set half is instead proven through dependency-manifest.spec.ts's own hardcoded
  forbidden/admitted lists, following that file's pre-existing convention.
- That createDatabaseConnection's built Pool actually opens a working connection against a running PostgreSQL
  instance -- out of scope, since wiring the connection into the running application (and so ever exercising
  it against a live database) is left to task/service-on-the-database/store-wiring per this task's own
  Notes and deferred section.
- Whether ESLint's TST-04 rule (a tool-decided rule this record cannot run, having no shell) accepts domain-depends-on-no-infrastructure.spec.ts
  and deployment-provisions-no-database-service.spec.ts sitting directly under __tests__/unit/ without
  mirroring a single unit under test -- disclosed as a divergence below rather than verified.
divergences:
- cites: TST-04
  file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  departure: sits directly under __tests__/unit/ without mirroring the path of one single unit under test,
    since its subject is an import audit spanning four separate source directories (case/, glossary/,
    capability-registry/, investigation/) rather than one module.
  why: the same placement is already established by the pre-existing dependency-manifest.spec.ts, itself
    a cross-cutting audit with no single unit to mirror; nesting under one of the four directories would
    misstate the file's actual scope.
- cites: TST-04
  file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
  departure: sits directly under __tests__/unit/ without mirroring a single unit under test, since its
    subject is the whole tree's absence of a deployment artifact.
  why: same reasoning as the divergence above -- there is no single unit this audit could mirror without
    misstating its scope.
- from: dependency-manifest.spec.ts's own pre-existing assertions ('the dependency manifest declares no
    database driver', forbidding pg outright, and 'holds exactly @anthropic-ai/sdk, fastify and zod'),
    written against constraints/the-mvp-persists-to-no-database
  departure: pg is removed from the forbidden-driver list, the exact-dependency-set assertion now includes
    pg, and two new tests assert pg is declared and pinned to ^8.13.0, all in src/__tests__/unit/dependency-manifest.spec.ts.
  why: constraints/the-mvp-persists-to-no-database is absent from the current specification (superseded
    by constraints/the-system-persists-to-one-relational-database and constraints/the-database-is-externally-provisioned);
    this task's own criterion 5 requires the audit of declared runtime dependencies to admit pg, which
    the pre-existing assertions would otherwise contradict now that pg is a legitimate, criterion-5-required
    dependency. The implementation record's own deferred section names exactly this update as 'the test-author's
    judgment,' which is why it is made here rather than flagged only as a gap.
- from: src/__tests__/unit/config/env.spec.ts's own validEnvSource() helper, from task/http-surface/diagnose-http-endpoint's
    closed initiative
  departure: validEnvSource() now also returns a placeholder DATABASE_URL; no assertion in the file changed.
  why: DATABASE_URL became a required field of envSchema/Env under this task's own criterion 1; without
    this addition every pre-existing test in the file calling loadEnv(validEnvSource()) would fail to
    parse. Purely additive, made under the launcher's explicit human-approved authorization for this delivery
    only.
- from: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts''s own literal ''const env:
    Env = {...}'', from task/http-surface/diagnose-http-endpoint''s closed initiative'
  departure: the literal now also carries a placeholder DATABASE_URL; no assertion in the file changed.
  why: the same widened-Env consequence as above; made under the same explicit human-approved authorization.
---

## What it is

The tests proving database-connection: the env boundary requiring and passing through DATABASE_URL, the connection module building one pg Pool from that URL alone with no other database literal in its source, the absence of any deployment-provisioning artifact, the cross-directory import audit that closes criterion 4 and the three UNDERDETERMINED exclusions, and the dependency-manifest updates that admit pg.

## Notes

None.
