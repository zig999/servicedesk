---
statement: The registry's read-capability-by-identity route accepts at most 60 requests per minute from one caller; a request beyond that limit is refused with a 429 response naming when the caller may retry.
scope: integration
fitness: An automated test issues more than 60 requests within one minute against read-capability-by-identity from one caller and asserts that the response past the limit is HTTP 429 and carries a value naming when the caller may retry.
---

## Description

Nothing else in this build tells a caller of this route to slow down, so an unbounded loop against it competes for the same registry the rest of the system reads. The limit is confined to this one route rather than every route the api publishes, because this is the one the material names — a system-wide limit is a separate decision this constraint does not make. `no-route-enforces-authentication` already holds that no caller's claimed identity is verified here; this constraint's own caller identity is a distinct, narrower question, decided below.
