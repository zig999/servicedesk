---
title: Postgres pool configuration
summary: The explicit connection-pool settings the persistence layer applies and the environment configuration
  they are read from.
rationale: Cut apart from the rate-limiting epic because the scope's own text names it a technical hardening
  changing for reasons — driver defaults, deployment load — that never move a route's limit. The scope's
  own claim that it holds no business fact did not survive binding — two facts the specification never
  stated surfaced during implement-against and were decided into constraints/the-connection-pool-is-bounded-by-configuration
  and constraints/the-pool-bounds-are-positive-integers. Binding also found the pool-construction task
  reaffirms one clause each of constraints/the-database-is-externally-provisioned and constraints/the-system-persists-to-one-relational-database
  — the connection URL coming from configuration, and one connection answering for every record — so those
  two lose their uncovered entry below without losing their remaining, untouched clauses.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
covers:
- constraints/the-system-persists-to-one-relational-database
- constraints/the-database-is-externally-provisioned
- constraints/the-schema-replays-from-its-scripts
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-domain-depends-on-no-infrastructure
- constraints/a-case-is-read-whole
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-pool-bounds-are-positive-integers
uncovered:
- node: constraints/the-schema-replays-from-its-scripts
  why: No migration script is added, renumbered or applied by this plan.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: No relation and no column is created, dropped or altered.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: The settings stay in the configuration and persistence layers; no domain module gains an import
    and the audit's subject is unchanged.
- node: constraints/a-case-is-read-whole
  why: What a read returns is unchanged; only the connection the read travels on is configured.
---
## What it is
The three pool parameters the scope names — maximum connections, idle timeout and statement timeout — declared as environment configuration and applied where the pool is built.
It claims the persistence slice of the impact set: four standing nodes it leaves fully untouched, two nodes this plan's own binding decided and now implements, and two pre-existing nodes whose one already-delivered clause each the pool-construction task's own criteria reaffirm without touching their remaining clauses.

## Notes
constraints/the-database-is-externally-provisioned and constraints/the-system-persists-to-one-relational-database carry no uncovered entry because a task implements one clause of each; their other clauses stand exactly as delivered, answered by work outside this plan, per the remainder notes on that task.
