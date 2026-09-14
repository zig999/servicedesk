---
title: Pool settings declared in the environment schema
summary: The three pool parameters as validated environment variables with defaults carried by the schema
  itself.
rationale: The scope states the values' source of truth and the defaults' home but decides no cut; I separated
  declaring the configuration from applying it because the schema is what other configuration readers
  depend on, and a task that changes a shared declaration and its consumer at once is two tasks. Binding
  found this task implements two facts the specification did not hold when the scope was first cut and
  now does, decided during this plan's own implement-against step.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
objective: The environment schema declares the maximum connections, idle timeout and statement timeout
  as validated, defaulted variables, so a deployment may state each and a deployment that states none
  still loads.
criteria:
- Loading the environment with none of the three variables set succeeds and yields a value for each from
  the schema's own default.
- Loading the environment with each of the three variables set yields those values as numbers.
- A non-numeric value for any of the three is refused with the invalid-environment error the schema already
  raises.
- A zero or negative value for any of the three is refused with the invalid-environment error.
- Every default is stated in the schema declaration itself rather than at a reading site.
- The existing environment fixture that enumerates required variables still loads without naming any of
  the three.
implements:
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-pool-bounds-are-positive-integers
---
## What it is
Three new numeric variables on the one environment schema, each with a default the schema declares.
No pool is configured by this task; only the configuration surface exists.

## Notes
UNDERDETERMINED, from the specification — constraints/the-pool-bounds-are-positive-integers refuses a non-integer value, but this task's criteria only refuse a non-numeric or a zero-or-negative value and otherwise ask that a set variable "yields those values as numbers"; a fractional value such as 2.5 is numeric and positive, so no criterion as written excludes it while the constraint does.
Passes: an environment schema that coerces each of the three variables to a number with a positive-value check but no integer check — a fractional value loads and is accepted, satisfying every criterion as written while the constraint refuses that deployment at startup.
REMAINDER, from the specification — the clause of constraints/the-connection-pool-is-bounded-by-configuration holding that the connection is actually pooled under the three bounds, with none left to the driver's own implicit value, reaches no criterion of this task: every criterion here is about loading the environment schema, none about what bound the pool carries.
Belongs to the sibling task under this epic that applies the three settings to the Postgres pool construction.
ADVISORY, from the specification — no candidate names a figure for any of the three defaults, and constraints/the-connection-pool-is-bounded-by-configuration deliberately leaves them unnamed, the same way listings-are-paged leaves its own default and maximum unnamed; the three default figures are an implementation choice the executor makes unguided, and no criterion constrains them.
Only the port variable currently carries a default in this schema, so these three follow that precedent rather than the required-and-undefaulted majority.
The worker-pool size variable already in the schema sizes something else entirely and is not one of these three.
