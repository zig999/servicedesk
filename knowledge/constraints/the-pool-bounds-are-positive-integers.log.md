---
entries:
- field: statement
  unstated: No node stated what values the three pool bounds may hold or what becomes of a deployment that states an unusable one — the material configures max connections, idle timeout and statement timeout from environment variables and says nothing about their admissible shape or about a deployment carrying a non-integer, zero or negative value.
  decided: Each of the three bounds is a positive integer, and a deployment stating a non-integer, zero or negative value for any of them is refused at startup instead of starting.
  why: A count of connections and a span of time have no reading below one, so the driver would silently substitute its own implicit default and the deployment would run bounded by a figure nobody stated — exactly the unstated bound this hardening set out to close. Refusing at startup keeps the failure at the one place the bound is declared and costs no caller an answer, since a deployment that never starts serves no request; the constraint fixes the shape and leaves the values to the deployment, as listings-are-paged already does for its own configured figures.
---
