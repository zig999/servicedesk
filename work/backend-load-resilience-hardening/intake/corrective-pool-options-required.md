# Corrective increment — poolOptions falls to the driver's defaults when omitted

Source: the conformance finding of `/review-change` (`siegard-reconcile/backend-load-resilience-hardening.md`,
saved at `siegard-reconcile/backend-load-resilience-hardening.returns/src__persistence__database-connection.ts.yaml`),
quoted verbatim below.

## The wrong behavior

> When createDatabaseConnection is called with no poolOptions, the Pool is constructed with no
> max, no idleTimeoutMillis and no statement_timeout at all, so all three bounds fall through to
> pg's own built-in defaults (driver max 10, driver idle timeout, no statement timeout) rather
> than to any declared default — exactly the case constraints/the-connection-pool-is-bounded-by-configuration
> calls out by name, and a reader checking this file for "how do the three bounds get their
> fallback" finds a path that hands the outcome to the driver instead.
>
> correction: make poolOptions (and each of its three fields) required for
> createDatabaseConnection, so a Pool can never be built without an explicit
> max/idleTimeoutMillis/statement_timeout — with any "deployment stated none" case resolved to a
> declared default before this function is called, never inside it.

## The file it lives in

`src/persistence/database-connection.ts`
