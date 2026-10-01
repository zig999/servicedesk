---
entries:
- field: statement
  unstated: No node stated that the relational store's connection is pooled under bounds the deployment configures — a maximum number of simultaneous connections, an idle timeout and a statement timeout — rather than under the driver's implicit defaults, nor that a deployment stating none of the three still starts.
  found: 'work/backend-load-resilience-hardening/intake/scope.md, section "2. Postgres pool tuning": "Configure explicitly the parameters of the Pool created at src/src/persistence/database-connection.ts — max connections, idleTimeoutMillis, statement_timeout — left today at the pg driver''s implicit default." and "The values'' source of truth should be environment variables, the same pattern src/src/config/env.ts already uses (e.g. POOL_SIZE), with sensible defaults documented in the Env schema itself."'
---
