---
type: invariant
statement: >-
  A connector configuration draft places every part of the chosen operation at the position an
  HTTP call itself carries that part, and at no other: the drafted address is the URL of the
  first entry of the servers array in effect for that operation — the operation's own where it
  declares one, otherwise its path item's, otherwise the document's top-level — exactly as the
  document declares that URL and with any trailing slash removed, followed by the operation's
  own path exactly as the document keys it, and is that path alone where no servers array is in
  effect or the one in effect declares no entry. A path parameter stands inside that address at
  the place the document's own path template holds it, a query parameter at a drafted query key
  named exactly as the parameter declares it, a header parameter at a drafted headers key named
  exactly as the parameter declares it, a cookie parameter — a location the shape
  an-http-connector-configuration-declares-its-call fixes holds no key for — inside the value of
  the one drafted headers key Cookie as its own name, an equals sign and its value, joined to
  any further cookie-carried part of the same call by a semicolon and a space, and a
  request-body field at a top-level key of the drafted body named exactly as the field declares
  it. The parameters one operation declares are every parameter its own operation object declares
  together with every parameter its path item declares that no parameter of the operation's own
  names at the same location under the same name, the operation's own parameter standing where
  the two would otherwise conflict; a $ref a parameter, a request-body schema, or a security
  scheme declares in place of stating itself directly is read through to the declaration it
  targets before this rule reads a name, a location, a schema or a scheme kind from it. One
  operation's request-body schema is the schema its request body declares under the media type
  application/json and under no other, matched as that exact media type name and read that way
  however many media types that request body's content declares. The request-body field names
  one operation declares are the keys of the properties object at the top level of that schema
  and no others — a name nested inside a property's own subschema is never one of them, neither
  by its leaf name nor by its path from the body root — and an operation declaring no request
  body, one whose request body declares no content under application/json, or one whose
  request-body schema is an array or any other non-object, declares no request-body field name
  at all, the draft stating no body key for it. A parameter or field that resolves holds at its
  position the placeholder it resolved to; one named in the draft's unresolved list still stands
  at its position, holding its own name in the document's own brace form {name}, which names no
  placeholder kind and is carried as plain text — except a parameter named unresolved with
  reason drafted-key-occupied-by-another-security-scheme, which stands at no position at all,
  the drafted key it would have occupied being held instead by the security scheme
  a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
  sends there. A generated credential placeholder for a
  security scheme declaring a location of its own stands at that location — an API key carried
  in a header at a drafted headers key named by that header, an API key carried in a query
  parameter at a drafted query key named by that parameter, each holding the bare placeholder —
  and one for a scheme declaring no location of its own stands in the drafted headers: an API
  key carried in a cookie inside the Cookie key's value as its own cookie name, an equals sign
  and the placeholder; an HTTP basic scheme as the Authorization key's whole value
  Basic ${credential:<name>}; and an HTTP bearer scheme as the Authorization key's whole value
  Bearer ${credential:<name>} — the placeholder standing in each for the credential alone and
  never for the text stated beside it.
expression: |-
  For a chosen operation o of a fetched OpenAPI 3.x document and a draft d generated for
  connector c, where servers_in_effect(o) is o's own servers array where o declares one,
  otherwise its path item's where that declares one, otherwise the document's top-level, and
  ref(x) is x where x declares no $ref key and is the declaration $ref points to, followed
  recursively, where it does:

  - parameters(o) = ref(o).parameters union { p in ref(path_item(o)).parameters : no q in
    ref(o).parameters has q.name = p.name and q.in = p.in }, every entry read through ref first.
  - address(d) = strip_trailing_slash(url(first(servers_in_effect(o)))) + path(o), and
    address(d) = path(o) where servers_in_effect(o) is absent or holds no entry.
  - a declared parameter p occupies: p.in = path -> the substring {p.name} inside address(d);
    p.in = query -> d.query[p.name]; p.in = header -> d.headers[p.name]; p.in = cookie -> the
    segment beginning "p.name=" inside the single value d.headers["Cookie"].
  - body_schema(o) = ref(ref(ref(o).requestBody).content["application/json"].schema) where
    ref(ref(o).requestBody) declares a content object holding that exact key, and is absent
    otherwise; no other key of that content object is ever read, whatever keys it holds and
    however many.
  - field_names(o) = keys(body_schema(o).properties) where body_schema(o) declares a
    properties object, otherwise the empty set; a field f in field_names(o) occupies d.body[f];
    d states no body key where field_names(o) is empty.
  - the value at a parameter's or field's position n is "${subject:n}" where n resolved, and
    "{n}" where d.unresolved holds an item naming n — except where that item's reason is
    drafted-key-occupied-by-another-security-scheme, n then occupying no position of d at all,
    the key it would have occupied holding the credential placeholder of the security scheme
    that displaced it.
  - a generated credential name g for security scheme s occupies: s apiKey in header ->
    d.headers[s.name] = "${credential:g}"; s apiKey in query -> d.query[s.name] =
    "${credential:g}"; s apiKey in cookie -> the segment "s.name=${credential:g}" inside
    d.headers["Cookie"]; s http basic -> d.headers["Authorization"] = "Basic ${credential:g}";
    s http bearer -> d.headers["Authorization"] = "Bearer ${credential:g}".
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Every part of an operation already has a place in the HTTP call a connector configuration describes, so the draft reads each position off that call rather than choosing one part by part: a path parameter is part of the path, a header parameter part of the headers, a request-body field part of the body. The shape itself is not the draft's to extend — an-http-connector-configuration-declares-its-call fixes address, query, headers and body for the connector that executes, and a draft an operator applies has to register as one of those, so a fifth key for the one location that shape holds no key for would draft text no connector reads. HTTP carries cookies in a single Cookie request header, so that location already has an honest position inside the stated shape, and a cookie-carried credential sits beside a cookie-carried parameter there for the same reason.

The first entry of the servers array is read because the array's entries are alternative hosts serving the same document — any one of them yields the same call — and the first is the only one nameable without a preference the document never states. Reading the operation's own array before its path item's before the document's top-level is the precedence the document itself declares, not a preference of this specification's. A document declaring no server at all leaves the address as the path alone rather than refusing: a-malformed-or-unsupported-openapi-document-refuses-the-draft names the draft's two refusals and a missing host is neither, it is exactly the gap the reviewing operator closes by hand, and the address still stands as the non-empty string the executing connector requires.

Only the top level of a request-body schema names fields because a-capability-input-schema-holds-a-well-formed-object declares a capability's own names at the top level of properties, one per Subject attribute, and a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability matches a field name against those keys byte for byte. A nested leaf name would equate two different fields wherever a body repeats a name at two depths, and a name rooted from the body would be matched against a key no capability ever declares that way; either produces a placeholder standing for something other than the field it was read from — the exact silent equation that rule refuses. A body schema that is an array or another non-object names nothing to match against, so it honestly declares no field, and the draft states no body rather than inventing a key.

application/json is the one media type whose schema is read because the body an-http-connector-configuration-declares-its-call admits is a value inside the connector configuration's own JSON text, so a JSON object of top-level keys is the only body the executing connector ever carries; field names read off a multipart, form-encoded or XML schema would draft keys for a body that connector never sends in the shape the document declared them for. Where one request body declares content under several media types, naming this one is also the only choice available without a preference the document never states: the entries of a content object are alternative encodings of the same call, keyed rather than ordered, so there is no first entry to read the way a servers array has one. A request body declaring content under no such media type — a JSON-suffixed vendor media type alone among them — leaves the draft stating no body key rather than reading a schema at a name this reader does not recognize: the same honest gap a document declaring no server leaves in the address, and the same one a non-object body schema already leaves, closed by the reviewing operator by hand.

An unresolved parameter or field keeps its position holding the document's own brace text because the unresolved list is the disclosure while the configuration is what the operator actually edits: dropping the key there would leave the edited artifact silently missing a part the operation requires, with nothing in the text to point at. The brace form is the document's own, names no placeholder kind this connector recognizes, and is carried as the plain text an-http-connector-configuration-declares-its-call already makes of anything that is not a ${kind} form, so leaving it in view misuses nothing in the executing connector's vocabulary. The one parameter this cannot hold for is one displaced from its own key by a security scheme the same operation requires: that key is not free to carry the brace text, since a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme puts the scheme's credential placeholder there, so the parameter is left no position and its unresolved item carries the whole of the disclosure.

A path item's own parameters and a $ref in place of a direct declaration are read the way OpenAPI 3.x itself already defines them, not a preference this specification states: a path item's parameters apply to every operation under it unless that operation declares one of its own at the same name and location, and a $ref names a declaration to be read exactly as if it stood written where the reference sits. Reading either any other way would not be a narrower or a stricter reading of the same document — it would be reading a different document than the one the operator named, so both are read here as the format itself already fixes them.

The scheme text beside a credential placeholder is drafted rather than configured because Basic and Bearer are the HTTP authentication scheme's own fixed text and no part of any secret, while the placeholder resolves to exactly one value read from environment configuration. Composing the text in the draft leaves the environment holding the credential alone and keeps the drafted header a value the scheme actually accepts. It is the same division the header-carried API key already stands by, whose header name the draft states while only its value comes from the environment: what the document states goes into the draft, and only the secret is left to be configured.
