---
statement: The connection to the relational store is pooled under three bounds supplied as deployment configuration — a maximum number of simultaneous connections, an idle timeout and a statement timeout — each falling back to a declared default where the deployment states none, and none of the three left to the driver's own implicit value.
scope: system
fitness: An automated test opens the pool with none of the three configured and asserts each bound is the declared default; opens it with each configured and asserts the configured value is the bound the pool carries, with no bound taken from the driver.
---

## Description

The store is operated by somebody else and reached over a link a network can slow or drop, so how many connections stand open at once, how long an idle one is kept and how long a single statement may run are properties of the environment a deployment meets rather than anything the business decided.
They are deployment configuration and not business figures, so this names that the three exist and never their values, for the same reason the page default and maximum go unnamed.
What it refuses is the driver's implicit value: a bound no environment declared is one no review saw, and it moves when the driver is upgraded, which is precisely the kind of change the specification is supposed to survive.
A deployment that states none of the three still starts, because requiring a bound to exist is not requiring every environment to hold an opinion about it.
