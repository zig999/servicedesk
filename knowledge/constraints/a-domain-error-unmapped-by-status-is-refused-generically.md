---
statement: A domain error the status map does not name is answered with an HTTP 500 response whose error code is INTERNAL_ERROR and whose message is the fixed text "an unexpected error occurred"; neither the error's own message nor any context it carries reaches the caller.
scope: system
fitness: An automated test raises an error the status map does not name from a route handler and asserts the answer is HTTP 500 with code INTERNAL_ERROR, the fixed message, and no other field.
---

## Description

Stated once for the whole surface so no route decides the shape of this fallback on its own, mirroring constraints/a-malformed-request-is-refused-with-a-validation-error's own system-wide placement for the sibling case of a request the route's own shape already refuses.
A domain error nothing named is exactly the case this system did not anticipate, so the refusal discloses nothing about it: not the error's own message, which may describe internal state, and not any context object a domain error happens to carry — both stay server-side, and the caller learns only that something failed.
