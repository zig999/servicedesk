---
title: The Postgres pool is built with the configured settings
summary: The connection factory applying maximum connections, idle timeout and statement timeout instead
  of leaving them to the driver.
rationale: Cut as its own task because applying the settings is a different outcome from declaring them
  and is demonstrable on its own once they exist. Binding found this task reaffirms one already-delivered
  clause each of constraints/the-database-is-externally-provisioned and constraints/the-system-persists-to-one-relational-database,
  alongside the new constraints/the-connection-pool-is-bounded-by-configuration this plan's own implement-against
  step decided.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
depends_on:
- task/database-pool-configuration/pool-settings-in-env-schema
objective: The connection pool is constructed with the maximum connections, idle timeout and statement
  timeout taken from environment configuration rather than from the driver's implicit defaults.
criteria:
- The pool is constructed with a maximum-connections option equal to the configured value.
- The pool is constructed with an idle-timeout option equal to the configured value.
- The pool is constructed with a statement-timeout option equal to the configured value.
- None of those three values is written literally in the persistence module.
- The connection URL reaching the pool still comes from environment configuration and from nowhere else.
- The tree holds no assertion that the pool is constructed with the connection string as its only option.
- The deployment check over connection-factory call sites passes against the factory's new call shape.
- Exactly one pool construction exists in the deployed tree.
implements:
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-database-is-externally-provisioned
- constraints/the-system-persists-to-one-relational-database
---
## What it is
The one place a pool is built now passes the three configured options alongside the connection string.
Everything the pool is built from is configuration, still with no endpoint in source.

## Notes
REMAINDER, from the specification — the clause of constraints/the-connection-pool-is-bounded-by-configuration holding that each bound falls back to a declared default where the deployment states none reaches no criterion of this task; every criterion here compares a pool option against an already-configured value.
Belongs to the sibling task that declares the three settings on the environment schema with defaults.
REMAINDER, from the specification — constraints/the-pool-bounds-are-positive-integers reaches no criterion of this task: no criterion concerns the admissible shape of a bound or a deployment that fails to start.
Belongs to the sibling task that declares the three settings on the environment schema with defaults, where the startup-time refusal of a non-integer, zero or negative value is enforced.
REMAINDER, from the specification — the provisioning clauses of constraints/the-database-is-externally-provisioned ("the database is provisioned outside the deployment", "the deployment provisions no database service") reach no criterion of this task; only the connection-URL-from-configuration clause is answered here.
Belongs to the act that defines the deployment manifest, where the absence of a declared database service is what a check reads.
REMAINDER, from the specification — the file-based-storage clause of constraints/the-system-persists-to-one-relational-database ("no record is held in a file the deployment ships or writes") reaches no criterion of this task; only the one-connection-answers-every-record clause is answered here, by the criterion requiring exactly one pool construction in the deployed tree.
Belongs to the acts that moved the cases, the published vocabularies, the capability registrations and the investigations out of file-backed stores into the relational store — already delivered, outside this plan.
An existing unit test asserts the pool receives the connection string and no other key, and an existing deployment test asserts the exact set of connection-factory argument shapes across the tree; both are stated as criteria here because they contradict the new construction rather than merely surviving it.
Whether the settings arrive as further parameters or as one options argument is the delivery's own call, bounded by the call-site check.
