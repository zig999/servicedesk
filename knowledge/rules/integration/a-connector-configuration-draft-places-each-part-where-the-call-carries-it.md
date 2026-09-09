---
type: invariant
statement: >-
  A connector configuration draft places every part of the chosen operation at the position an
  HTTP call itself carries that part, and at no other: the drafted address is the URL of the
  first entry of the servers array in effect for that operation — the operation's own where it
  declares one, otherwise its path item's, otherwise the document's top-level — exactly as the
  document declares that URL and with any trailing slash removed, followed by the operation's
  own path exactly as the document keys it, and is that path alone where no servers array is in
  effect or the one in effect declares no entry; a path parameter stands inside that address at
  the place the document's own path template holds it, a query parameter at a drafted query key
  named exactly as the parameter declares it, a header parameter at a drafted headers key named
  exactly as the parameter declares it, a cookie parameter — a location the shape
  an-http-connector-configuration-declares-its-call fixes holds no key for — inside the value of
  the one drafted headers key Cookie as its own name, an equals sign and its value, joined to
  any further cookie-carried part of the same call by a semicolon and a space, and a
  request-body field at a top-level key of the drafted body named exactly as the field declares
  it.
expression: |-
  For a chosen operation o of a fetched OpenAPI 3.x document and a draft d generated for
  connector c, where servers_in_effect(o) is o's own servers array where o declares one,
  otherwise its path item's where that declares one, otherwise the document's top-level:

  - address(d) = strip_trailing_slash(url(first(servers_in_effect(o)))) + path(o), and
    address(d) = path(o) where servers_in_effect(o) is absent or holds no entry.
  - a declared parameter p occupies: p.in = path -> the substring {p.name} inside address(d);
    p.in = query -> d.query[p.name]; p.in = header -> d.headers[p.name]; p.in = cookie -> the
    segment beginning "p.name=" inside the single value d.headers["Cookie"].
  - a field f in field_names(o) occupies d.body[f]; d states no body key where field_names(o)
    is empty.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Every part of an operation already has a place in the HTTP call a connector configuration describes, so the draft reads each position off that call rather than choosing one part by part: a path parameter is part of the path, a header parameter part of the headers, a request-body field part of the body. The shape itself is not the draft's to extend — an-http-connector-configuration-declares-its-call fixes address, query, headers and body for the connector that executes, and a draft an operator applies has to register as one of those, so a fifth key for the one location that shape holds no key for would draft text no connector reads. HTTP carries cookies in a single Cookie request header, so that location already has an honest position inside the stated shape, and a cookie-carried credential sits beside a cookie-carried parameter there for the same reason.

The first entry of the servers array is read because the array's entries are alternative hosts serving the same document — any one of them yields the same call — and the first is the only one nameable without a preference the document never states. Reading the operation's own array before its path item's before the document's top-level is the precedence the document itself declares, not a preference of this specification's. A document declaring no server at all leaves the address as the path alone rather than refusing: a-malformed-or-unsupported-openapi-document-refuses-the-draft names the draft's two refusals and a missing host is neither, it is exactly the gap the reviewing operator closes by hand, and the address still stands as the non-empty string the executing connector requires.

Which parameters an operation declares, and what a $ref resolves to, is `a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs`'s own. Which schema and which field names a request body declares is `a-connector-configuration-drafts-request-body-fields-are-its-json-schemas-top-level-properties`'s own. What value stands at a resolved or an unresolved position is `a-drafted-positions-value-is-the-resolved-placeholder-or-the-documents-own-brace-text`'s own, and where a security scheme's own generated credential stands is `a-generated-credential-placeholder-stands-at-its-security-schemes-own-location`'s own. This states only where each part sits once its value is known.
