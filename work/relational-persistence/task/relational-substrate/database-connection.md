---
title: The service reaches its database through a configured connection
summary: The driver, the connection module beside the persistence adapters, and the connection URL added to the single environment schema.
rationale: The scope states the database is provisioned outside the deployment and reached by a configuration URL; cutting the connection and its configuration as one task is the planning's, because the URL's schema entry and the module that consumes it are one decision about how this service is reached and change together.
sources:
  - intake/scope.md
objective: The service opens its database connection from a URL read from environment configuration, and no domain module reaches the driver.
criteria:
  - The environment schema requires a database connection URL, and a load with that variable absent refuses once, naming it together with every other violated field.
  - The connection is constructed from that configured URL alone, and no host, port, endpoint or credential for a database appears in source.
  - Nothing in the tree provisions a database service for the deployment.
  - The connection module sits with the persistence adapters, and an audit of the case, glossary, capability-registry and investigation modules' imports finds no driver and no framework among them.
  - The manifest declares the driver, and the audit of declared runtime dependencies names it among the set it admits.
implements:
  - constraints/the-database-is-externally-provisioned
  - constraints/the-domain-depends-on-no-infrastructure
---

## What it is

One module that holds a connection, built from one configured URL.
It is what every adapter of this plan is given, and the only place in the tree that knows the database exists as an endpoint.

## Notes

The inventory reports two guard specs that assert the tree declares no database driver and that persistence and factories reach no service over the network, both of which this task's change is observed by.
The environment schema at src/src/config/env.ts refuses once naming every violated field, and the URL is added to it rather than read separately, as the inventory requires.
UNDERDETERMINED, from the specification — the clause "infrastructure reaches it only through ports" of constraints/the-domain-depends-on-no-infrastructure reaches no criterion above: a domain module could import the connection module directly rather than through a port and still pass every criterion as written; a test must exclude that shape.
UNDERDETERMINED, from the specification — the clause "no provider client" of the same constraint's statement reaches no criterion above, which speaks only of a driver and a framework; a domain module importing the LLM provider client directly would still pass, and a test must exclude it.
UNDERDETERMINED, from the specification — constraints/the-system-persists-to-one-relational-database decides that one connection answers for every record and that which driver is the project's own standard to name, and it is outside this task's implements; a connection module constructing a second connection for a second store passes every criterion above as written, and a test must exclude it.
Decision, beyond the covers — stand: constraints/the-system-persists-to-one-relational-database is named only to identify the gap the test must exclude; it is answered by the store-wiring task, not by this task's own criteria.
REMAINDER, from the specification — constraints/the-schema-replays-from-its-scripts reaches no criterion of this task; it belongs to task/relational-substrate/schema-migrations, which applies and orders the scripts.
REMAINDER, from the specification — constraints/the-stored-schema-mirrors-the-declared-model reaches no criterion of this task, which creates no relation and no column; it belongs to task/relational-substrate/schema-migrations.
ADVISORY, from the specification — criterion 1's aggregated-refusal shape and its presupposition of one environment schema answer to no candidate node; the conformance pass will find no specification node to hold that half of the criterion to, and it is form the project's own standard governs instead.
