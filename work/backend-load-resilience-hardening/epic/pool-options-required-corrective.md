---
title: Postgres pool options are mandatory at construction
summary: Corrects createDatabaseConnection so it can never build a Pool without an explicit max/idleTimeoutMillis/statement_timeout,
  closing the path where omitting poolOptions handed the three bounds to the driver's own implicit defaults.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding exactly the one task's own claim, seeded from trace.py --encodes
  over src/persistence/database-connection.ts.
sources:
- work/backend-load-resilience-hardening/intake/corrective-pool-options-required.md
covers:
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-database-is-externally-provisioned
- constraints/the-system-persists-to-one-relational-database
uncovered:
- node: constraints/the-database-is-externally-provisioned
  why: Making poolOptions mandatory changes nothing about the connection URL's source or the deployment's
    own provisioning; this correction touches only the pool-bound options.
- node: constraints/the-system-persists-to-one-relational-database
  why: Making poolOptions mandatory changes nothing about there being one connection or one store; this
    correction touches only the pool-bound options.
---
## What it is
The one corrective task making createDatabaseConnection's poolOptions parameter mandatory,
so the driver's own implicit defaults can never stand in for a declared bound.

## Notes
None.
