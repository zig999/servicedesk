---
statement: The diagnose, simulate-case and simulate-hypothesis routes each accept at most 10 requests per minute from one caller, counted independently per route, where one caller is one source IP address; a request beyond that limit is refused with an HTTP 429 response carrying a Retry-After value naming when the caller may retry.
scope: investigation
fitness: An automated test issues more than 10 requests within one minute against each of diagnose, simulate-case and simulate-hypothesis from one caller and asserts that the response past the limit is HTTP 429 and carries a value naming when the caller may retry, and that a caller over the limit on one route is answered ordinarily on another.
---

## Description

Nothing else in this build tells a caller of diagnose, simulate-case or simulate-hypothesis to slow down, so an unbounded loop against any of the three drives the same collection, judgment and persistence work the engine runs for a legitimate call — the LLM calls and the database writes an attendant or curator would otherwise spend one case at a time. The limit is confined to these three routes rather than every route the api publishes, because these are the ones the material names — a system-wide limit is a separate decision this constraint does not make. `no-route-enforces-authentication` already holds that no caller's claimed identity is verified anywhere in this build, so this constraint's own caller identity is the connection's own source address, counted separately per route: a caller within the minute's window for diagnose is not thereby counted against simulate-case or simulate-hypothesis.
