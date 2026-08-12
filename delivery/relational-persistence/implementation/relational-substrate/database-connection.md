---
title: The database connection module and the connection URL in the environment schema
summary: A persistence-only module that builds one pg connection pool from a URL the single environment
  schema now requires, with the driver declared in the manifest and nothing else in the tree touching
  it.
task: sha256:f860fe1ff219c82f25b37b734be0bb5087a4f5c66a916c41d4e41dd5fe6632f1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-database-connection-build-3
installed:
- pg
files:
- path: src/config/env.ts
  effect: envSchema now requires DATABASE_URL (a non-empty string) alongside every other boundary field,
    so loadEnv's existing safeParse/aggregate-refusal path also names DATABASE_URL when it is absent or
    empty; the header comment now also documents this addition and the constraint it answers to.
- path: src/persistence/database-connection.ts
  effect: 'new module exporting DatabaseConnection (a type alias for pg''s Pool) and createDatabaseConnection(connectionUrl),
    which builds ''new Pool({ connectionString: connectionUrl })'' from that URL alone — the only file
    in the tree that imports the pg driver.'
- path: src/persistence/pg.d.ts
  effect: new ambient module declaration typing only the pg surface database-connection.ts calls (the
    Pool class and its connectionString-taking constructor), so the strict compiler resolves the pg import
    without @types/pg, which is not on the standard's authorized-dependency list.
- path: src/package.json
  effect: 'dependencies now also declares "pg": "^8.13.0", inserted alphabetically between fastify and
    zod; package-lock.json was regenerated (npm install, an environment fix outside the registry''s declared
    npm-ci install step, run once with the human''s approval) to bring the lockfile back in sync with
    the new dependency.'
criteria:
- criterion: The environment schema requires a database connection URL, and a load with that variable
    absent refuses once, naming it together with every other violated field.
  met: true
  how: 'envSchema declares DATABASE_URL: z.string().min(1); loadEnv() calls envSchema.safeParse(source)
    exactly once and, on failure, maps every issue (path plus message) into one array before throwing
    a single InvalidEnvironmentError — the same aggregated-refusal path that already covers every other
    field now covers DATABASE_URL as well.'
- criterion: The connection is constructed from that configured URL alone, and no host, port, endpoint
    or credential for a database appears in source.
  met: true
  how: 'createDatabaseConnection(connectionUrl: string) in database-connection.ts takes the URL as its
    only parameter and passes it straight through as ''new Pool({ connectionString: connectionUrl })''.
    Neither database-connection.ts, pg.d.ts nor the env.ts edit writes a literal host, port, endpoint
    or credential; the only value in play is the caller-supplied URL, read once by loadEnv from DATABASE_URL.'
- criterion: Nothing in the tree provisions a database service for the deployment.
  met: true
  how: No Dockerfile, compose file, IaC manifest or other deployment declaration exists anywhere in the
    tree before or after this change, and this delivery adds none — the two new files only build a client-side
    connection object from a URL; neither declares a service.
- criterion: The connection module sits with the persistence adapters, and an audit of the case, glossary,
    capability-registry and investigation modules' imports finds no driver and no framework among them.
  met: true
  how: database-connection.ts and pg.d.ts both live at src/persistence/, beside json-file.ts and the four
    file repositories. This delivery makes no change anywhere under src/case, src/glossary, src/capability-registry
    or src/investigation, so none of their modules' imports gained a driver or a framework — the only
    file in the whole tree importing 'pg' is the new persistence module.
- criterion: The manifest declares the driver, and the audit of declared runtime dependencies names it
    among the set it admits.
  met: true
  how: 'package.json''s "dependencies" now lists "pg": "^8.13.0". The project''s standard (standards/backend-node-service.yaml)
    admits exactly this package under its dependencies entry for pg, whose why cites STK-05 — "database
    access goes through the pg driver" — so the declared driver is among the set that registry authorizes.'
nodes:
- node: constraints/the-database-is-externally-provisioned
  encoded_at:
  - src/config/env.ts
  - src/persistence/database-connection.ts
  how: 'The URL half of the constraint is encoded across the two files: env.ts is the one place DATABASE_URL
    is read from configuration, and database-connection.ts constructs the connection from that URL alone,
    reaching no other endpoint. The ''deployment provisions no database service'' half is honored by omission
    — no deployment artifact of any kind exists in the tree, and this delivery introduces none; the migration-application
    step and the actual wiring of this connection into the running application, both named in the constraint''s
    neighborhood, are carried by task/relational-substrate/migration-step and task/service-on-the-database/store-wiring
    respectively, per this task''s own Notes.'
- node: constraints/the-domain-depends-on-no-infrastructure
  how: 'Honored rather than encoded: this task touches no module under src/case, src/glossary, src/capability-registry
    or src/investigation, so none of them import the newly-added driver or any framework, and the one
    file that imports ''pg'' sits in src/persistence. Whether a domain module could still import this
    connection module directly, and whether a provider client is likewise unreached, are the two UNDERDETERMINED
    gaps the task''s own Notes flag as excluded by test rather than by a criterion; this delivery does
    not create either shape, since it wires the connection into no domain module at all.'
inferences:
- inferred: the connection URL's environment variable is named DATABASE_URL.
  from: no candidate node or task names an exact variable key; DATABASE_URL is the conventional name for
    a single relational connection string, and nothing in the inventory or the existing schema suggests
    an alternative.
- inferred: DATABASE_URL is validated as z.string().min(1) rather than with a stricter URL-format schema.
  from: the existing envSchema's own convention for every other required string field, all of which use
    z.string().min(1) with no format validator; a postgres connection string is not itself a strict WHATWG
    URL in every valid form, so matching the schema's own plain-string convention avoids rejecting a value
    the driver would accept.
- inferred: pg is pinned to ^8.13.0.
  from: no node or the standard states a version; the manifest's existing entries are all caret-pinned
    to a current stable major, and ^8.13.0 is pg's own current stable major/minor line, matching that
    style.
- inferred: pg is inserted between fastify and zod in package.json's dependencies.
  from: the existing three entries already sort alphabetically; pg's alphabetical position preserves that
    observed ordering.
- inferred: the connection module exposes a plain factory function, createDatabaseConnection(url), and
    a type alias, rather than a class with its own factory file under src/factories.
  from: the inventory's own convention statement that json-file.ts is a shared low-level module with no
    factory of its own, called directly by the repositories that need it; the connection module is the
    same kind of primitive, not a store port implementation. Wiring env.DATABASE_URL through an actual
    factory is left to the tasks that consume the connection.
- inferred: '''pg'' ships no bundled TypeScript declarations, so importing it under this project''s strict
    compiler requires a local ambient module declaration rather than @types/pg.'
  from: general knowledge of the pg package's npm distribution, combined with the standard's authorized-dependency
    list, which admits pg but not @types/pg — a local ambient declaration, scoped to only the constructor
    surface this module calls, is the smallest way to satisfy strict/noImplicitAny (STK-01) without adding
    an unauthorized package.
divergences:
- from: the skill's own prescribed order (set up, then implement)
  departure: The registry's install step (npm ci) was run only after the implementer had already added
    pg to package.json, rather than before anything was written, because the orchestrating invocation
    ran it out of order.
  why: 'Procedural error by the invocation, not a decision about source; disclosed here because it is
    exactly the kind of thing the review should be able to see rather than infer. It had one concrete
    consequence: the implementer inferred pg''s TypeScript surface from general knowledge rather than
    from an installed node_modules/pg, which is also disclosed as an inference above.'
deferred:
- what: dependency-manifest.spec.ts and the module-audit specs that scan for forbidden packages will need
    their admitted sets updated to include pg.
  why: updating or writing tests is the test-author's judgment, not the task-implementer's; this task
    writes source only, and the inventory's own risk list already anticipated this exact consequence of
    the driver's arrival.
- what: Wiring createDatabaseConnection into the running application — reading env.DATABASE_URL in a factory
    and handing the resulting connection to the four stores — is not done here.
  why: task/service-on-the-database/store-wiring owns that composition, per its own criteria and its depends_on
    chain back through the store and helper tasks; reaching into the factories chain here would widen
    this task past its own criteria.
- what: Removing CASE_DATA_DIRECTORY, GLOSSARY_DATA_DIRECTORY, CAPABILITY_DATA_DIRECTORY and INVESTIGATION_DATA_DIRECTORY
    from envSchema is not done here.
  why: task/service-on-the-database/store-wiring's own criteria state that removal explicitly; this task's
    Notes and criteria only ever ask for DATABASE_URL to be added, never for the directory variables to
    be removed.
- what: The shared statement-running/transaction helper over the connection is not built here.
  why: task/relational-stores/database-access-helper is cut for exactly that, depending on this task;
    building it here would duplicate a decision the plan already assigned to its own task.
- what: The numbered SQL migration scripts under migrations/ and the runnable step that applies them are
    not created here.
  why: task/relational-substrate/schema-migrations and task/relational-substrate/migration-step own that
    work respectively, as this task's own Notes state under their REMAINDER entries.
preserved:
- loadEnv's refuse-once behavior — one safeParse, one InvalidEnvironmentError naming every violated field
  together — continues to hold for every previously-required field, with DATABASE_URL now joining that
  same set rather than being read or checked separately.
- The four store ports and their file-backed implementations are unmodified; no module under src/case,
  src/glossary, src/capability-registry or src/investigation imports a driver or a framework.
- CASE_DATA_DIRECTORY, GLOSSARY_DATA_DIRECTORY, CAPABILITY_DATA_DIRECTORY, INVESTIGATION_DATA_DIRECTORY
  and OBSERVATIONS_FIXTURE_FILE remain declared in envSchema and consumed exactly as before by the rest
  of the wiring chain; nothing in this delivery reads or removes them.
- The whole composed application continues to build and run exactly as before; nothing here wires createDatabaseConnection
  into the running process, so the existing startup path is unchanged.
---

## What it is

One module that holds a pg connection pool, built from one configured URL, plus the environment schema entry that requires and validates that URL.
It sits with the persistence adapters and is the only file in the tree that imports the pg driver.

## Notes

The registry install step ran after the implementer had already added pg to package.json rather than before, a procedural ordering slip of the orchestrating invocation rather than a decision about source; disclosed above as a divergence.
package-lock.json was regenerated once by running npm install outside the registry's declared npm-ci install step, with the human's explicit approval, to bring the lockfile back in sync with the newly authorized pg dependency; the registry's own install step (npm ci) is what every later run in this delivery and every later task's delivery actually exercises.
Two pre-existing tests from the closed live-engine-mvp initiative (env.spec.ts and diagnose-server.factory.spec.ts) construct a full Env value and needed DATABASE_URL added to keep type-checking and passing; that mechanical, assertion-free repair is carried by this task's proof record rather than by this one, with the human's explicit approval, since no assertion in either file changes.
