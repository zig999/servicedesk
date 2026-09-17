---
type: invariant
statement: An OpenAPI 3.x document declares each path item's own operations under lower-cased HTTP-method keys, that casing being the document format's own and never a choice this system makes; reading which operation a request's path and method name compares the request's own method against that key case-insensitively, lower-casing the request's method before the comparison.
constrains:
  - domain/integration/openapi-operation
---

## Description

rules/integration/an-openapi-operations-method-is-upper-cased already reads a fetched document's path-item keys as lower-case, stating that the executing connector's own upper-case vocabulary is why a listed operation's method is shown upper-cased rather than in the document's own spelling. That reading rests on a fact about the document this rule now states directly: the OpenAPI 3.x format itself, not this system, fixes a path item's operation keys as lower-case (get, post, put, patch, delete, and the others this system's own vocabulary never lists) — the same way a fetched document's other structural keys (paths, components, securitySchemes) are the format's own and never this system's to decide.

A request naming a path and a method reaches this comparison however the caller cased the method — an operator choosing an entry from the Configuration Helper's own listing, which an-openapi-operations-method-is-upper-cased already states as upper-case, or a caller composing the request some other way. Comparing case-insensitively, by lower-casing the request's own method before it is read as the document's own key, is what lets the same operation be found regardless of which casing named it, since the document's own key is never anything but lower-case to compare against. This decides only the comparison; a-connector-configuration-draft-states-the-chosen-operations-method and an-openapi-operations-method-is-upper-cased already state what the found operation's own method is shown or drafted as afterward.
