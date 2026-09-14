---
statement: Each of the connection pool's three bounds — the maximum number of simultaneous connections, the idle timeout and the statement timeout — is a positive integer, and a deployment stating a non-integer, a zero or a negative value for any of them is refused at startup instead of starting.
scope: system
fitness: A deployment whose configuration states a non-integer, zero or negative value for any of the three pool bounds fails to start with a configuration error and serves no request, and every value a started deployment holds for the three is a positive integer.
---

## Description

The three bounds are deployment configuration, so this constraint names the shape every value must have and never the values themselves, the same way listings-are-paged names its default and maximum without figures.

A bound outside that shape has no usable reading: zero or a negative maximum admits no connection at all, a zero or negative timeout either fires at once or means nothing to the driver, and a non-integer is not a count of connections or of time units — so a deployment carrying one would run with the driver's own silent fallback and present as healthy while bounded by something nobody stated.

Refusing at startup is what keeps the configuration the single source of the bound: the failure surfaces once, where the deployment is defined, rather than as load-dependent behavior no one traces back to a mistyped value.

This refusal answers configuration read as the deployment starts and is not the request-time refusal a-malformed-request-is-refused-with-a-validation-error states; no caller ever sees it, because a refused deployment answers no request.
