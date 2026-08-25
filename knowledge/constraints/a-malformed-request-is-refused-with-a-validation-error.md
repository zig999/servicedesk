---
statement: Every route refuses a request whose path, query or body fails the route's declared shape with an HTTP 400 response whose error code is VALIDATION_ERROR, whose message names which of the three failed validation, and whose details list the issues found.
scope: system
fitness: An automated test sends a request with a malformed path segment, one with a negative offset, and one with a body missing a required field, and asserts each answer is HTTP 400 with code VALIDATION_ERROR and a non-empty details list.
---

## Description

Stated once for the whole surface so no route decides the shape of this refusal on its own.
A malformed request states nothing about the domain, so the refusal reports the shape violation and never a domain condition; the domain refusals each route may raise are stated in their own rules and constraints.
