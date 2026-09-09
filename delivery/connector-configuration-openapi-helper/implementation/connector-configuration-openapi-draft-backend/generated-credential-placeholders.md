---
title: Generated-credential placeholder generation for reducible security schemes
summary: Adds a pure connector-registry module that turns an operation's required
  security schemes into ${credential:<name>} placeholders (or unresolved items), resolving
  same-key collisions by requirement-object order and exposing a helper for a later
  task to detect a parameter displaced by one of those placeholders.
task: sha256:8ed98ee8fa2386310bf2c462bef9422e139c3c4fbb95893e910bd529cad1c453
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-generated-credential-placeholders-build
files:
- path: src/connector-registry/generated-credential-placeholders.ts
  effect: 'New module. Exports generateCredentialPlaceholders({ connector, requiredSecuritySchemes
    }), which folds the operation''s required security schemes (in the requirement
    object''s own order, as already produced by openapi-operation-reader''s readOpenApiOperation)
    into a GeneratedCredentialPlacement: a headers record and a query record each
    keyed by the exact parameter/header name a reducible scheme declares, a cookieSegments
    list of "<cookieName>=${credential:<name>}" segments, a generatedCredentials list
    of {name, security_scheme} entries, and an unresolved list of {name, reason} items.
    An API key scheme places its placeholder at its own header/query/cookie key; an
    HTTP basic or bearer scheme places "Basic ${credential:<name>}" / "Bearer ${credential:<name>}"
    as the whole value of the headers key Authorization; any other scheme kind (oauth2,
    openIdConnect, mutualTLS, or an unrecognized http sub-scheme) is unresolved with
    security-scheme-not-reducible-to-a-credential. Same-drafted-key collisions (byte-for-byte
    equal header/query names, cookie names compared inside the Cookie segment list,
    and the Authorization key shared by basic/bearer/apiKey-header-Authorization)
    are resolved by requirement-object order: the first occupant is placed, every
    later one is unresolved with drafted-key-occupied-by-another-security-scheme,
    generating no placeholder and no generated_credentials entry. The generated name
    folds case first (toUpperCase) then replaces every character outside A-Z0-9 with
    _ on the connector name and the scheme''s own name separately, joining the two
    with _. Also exports parameterDisplacedByCredential(parameter, placement), which
    reports whether a given operation parameter''s own drafted key (query, header,
    or cookie name) is already held by a generated credential placeholder in that
    placement, returning the same unresolved item shape with reason drafted-key-occupied-by-another-security-scheme
    when it is -- the piece a later composing task needs to keep the scheme''s placeholder
    and leave the parameter unresolved instead of positioned, per this task''s own
    Notes.'
criteria:
- criterion: An API key scheme carried in a header becomes a ${credential:<name>}
    placeholder at a drafted headers key named by that header -- an API key in header
    X-Api-Key places that placeholder under the headers key X-Api-Key.
  met: true
  how: apiKeyPlacement('header', name) places headers[name] = "${credential:<generatedName>}"
    via placeholderText; verified against the scenario naming X-Api-Key/apiKeyHeader/ERP_HTTP_APIKEYHEADER.
- criterion: An API key scheme carried in a query parameter becomes a ${credential:<name>}
    placeholder at a drafted query key named by that parameter.
  met: true
  how: apiKeyPlacement('query', name) places query[name] = "${credential:<generatedName>}".
- criterion: An API key scheme carried in a cookie becomes a ${credential:<name>}
    placeholder inside the value of the drafted headers key Cookie, as that cookie's
    own name, an equals sign and the placeholder, joined by "; " to any other cookie-carried
    part of the same call.
  met: true
  how: apiKeyPlacement('cookie', name) appends "<name>=${credential:<generatedName>}"
    to cookieSegments. This module cannot itself join those segments to a subject-carried
    cookie part -- it has no visibility into subject-placeholder-resolution's own
    cookie segments -- so it exposes the raw segment list rather than a joined Cookie
    header value; the joining across the whole call's cookie-carried parts is left
    to the task assembling the draft's configuration text, per this task's own REMAINDER
    note.
- criterion: An HTTP basic scheme becomes exactly one ${credential:<name>} placeholder,
    drafted as the whole value of the headers key Authorization, prefixed by the literal
    text "Basic ", unless that key is already claimed per the collision criterion
    below.
  met: true
  how: 'httpSchemePlacement returns {namespace: ''headers'', key: ''Authorization'',
    value: name => "Basic ${credential:name}"} for httpScheme ''basic'' (case-insensitively
    normalized); withResolvedScheme checks occupiedKeys for ''headers:Authorization''
    before placing it.'
- criterion: An HTTP bearer scheme becomes exactly one ${credential:<name>} placeholder,
    drafted as the whole value of the headers key Authorization, prefixed by the literal
    text "Bearer ", unless that key is already claimed per the collision criterion
    below.
  met: true
  how: Same mechanism as basic, with the Bearer prefix, for httpScheme 'bearer'.
- criterion: Where more than one required scheme would occupy the whole value of the
    drafted headers key Authorization (an HTTP basic scheme, an HTTP bearer scheme,
    or an API key declaring header Authorization as its own location), only the first
    of them in the order the requirement object names its schemes becomes a placeholder
    and holds that key; every other one is named unresolved with reason drafted-key-occupied-by-another-security-scheme,
    generating no placeholder and no generated_credentials entry.
  met: true
  how: All three placement kinds that can occupy Authorization resolve to the same
    keyIdentity 'headers:Authorization'; generateCredentialPlaceholders folds over
    requiredSecuritySchemes in the array order openapi-operation-reader already preserves
    from the requirement object's own key order, so the first to reach that key occupies
    it via withPlacedCredential and every later one is turned into an unresolved item
    by withUnresolved, adding no generatedCredentials entry and no headers write.
    Generalized identically to every drafted query key and every drafted headers key
    (byte-for-byte equal names) and to cookie names compared inside cookieSegments,
    per this task's own Notes.
- criterion: The generated name is the connector's own name and the scheme's own name,
    each with every character outside A-Z0-9 replaced by an underscore, joined by
    an underscore, and upper-cased -- connector erp-http with scheme apiKeyHeader
    generates ERP_HTTP_APIKEYHEADER.
  met: true
  how: generatedCredentialName joins upperSnakeSegment(connector) and upperSnakeSegment(schemeName)
    with '_'; upperSnakeSegment folds case first (toUpperCase) and only then replaces
    every character outside A-Z0-9 with '_', per this task's own ADVISORY note reading
    the worked example as authoritative over the literal transform order. erp-http
    -> ERP_HTTP, apiKeyHeader -> APIKEYHEADER, joined -> ERP_HTTP_APIKEYHEADER.
- criterion: Every generated name is disclosed in the draft's generated_credentials
    paired with the security scheme's own name from the document.
  met: true
  how: 'withPlacedCredential pushes {name: generatedName, security_scheme: scheme.schemeName}
    onto generatedCredentials for every scheme that resolves to a placeholder, matching
    ConnectorConfigurationDraftGeneratedCredential''s shape exactly.'
- criterion: No credential value read from environment configuration appears anywhere
    in the generated placeholder or in generated_credentials.
  met: true
  how: The module performs no environment read at all -- every placeholder is composed
    purely from the connector name and the scheme's own document-declared name, and
    generated_credentials carries only the generated name and the scheme's own name,
    never a resolved value.
- criterion: Any security scheme not reducible to one credential value -- an OAuth2
    scheme and an OpenID Connect scheme among them -- is named unresolved with reason
    security-scheme-not-reducible-to-a-credential and generates no placeholder.
  met: true
  how: credentialPlacementFor returns undefined for kind 'oauth2', 'openIdConnect'
    and 'mutualTLS', and for an 'http' scheme whose httpScheme normalizes to neither
    'basic' nor 'bearer'; withResolvedScheme then records it as unresolved with security-scheme-not-reducible-to-a-credential
    and never touches headers/query/cookieSegments/generatedCredentials for it.
- criterion: Where the security field in effect for the operation is an empty array,
    names no scheme, or is declared at neither the operation nor the document's top
    level, no placeholder is generated and no security scheme is named unresolved.
  met: true
  how: openapi-operation-reader's readOpenApiOperation (sibling, already delivered)
    already reduces every one of these three cases to an empty requiredSecuritySchemes
    array before this module ever runs; reduce over an empty array returns emptyAccumulator()
    unchanged, so generateCredentialPlaceholders produces no entries at all.
- criterion: The placeholder text emitted is the existing ${credential:<name>} form,
    produced through the existing placeholder token vocabulary rather than a second
    one.
  met: true
  how: placeholderText builds "${credential:<name>}" using the literal kind string
    'credential', matching connector-request-resolver.ts's own CREDENTIAL_PLACEHOLDER_KIND
    constant and its brace form exactly. Since connector-registry is a domain module
    barred from importing http-connector, the kind string is declared locally rather
    than imported -- the same convention subject-placeholder-resolution.ts already
    follows.
nodes:
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: This task produces the values (generated_credentials entries and unresolved
    items for security schemes) that fill two of this value object's attributes; the
    type declaration itself was already delivered by the draft-domain-shape task and
    is unchanged here.
- node: domain/integration/connector-configuration-draft-generated-credential
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: withPlacedCredential assembles exactly this shape, {name, security_scheme},
    for every reducible security scheme that resolves to a placeholder.
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: withUnresolved and parameterDisplacedByCredential both assemble exactly this
    shape, {name, reason}, naming a security scheme (or, via the exported helper,
    a parameter) the module could not turn into a placeholder.
- node: domain/integration/connector-configuration-draft-unresolved-reason
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: The module uses exactly two of this closed enumeration's four values -- security-scheme-not-reducible-to-a-credential
    and drafted-key-occupied-by-another-security-scheme -- read as typed constants
    from the enumeration's own declaration; it introduces no third value.
- node: rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: 'Implements the whole of this rule''s own statement: which scheme kinds reduce
    to one credential value versus not; the generated-name composition; disclosure
    in generated_credentials without ever carrying a resolved value; and the collision
    resolution generalized from the Authorization special case to every drafted query
    key and every drafted headers key, resolved by the requirement object''s own order.
    Which security field is in effect and what the first requirement object''s schemes
    are is not decided here -- it is read as already-resolved from openapi-operation-reader''s
    requiredSecuritySchemes.'
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: 'Implements only the credential-placement fragment this task''s own criteria
    state: an API key credential stands at its own header/query key or inside the
    Cookie value at its own cookie name; a basic or bearer credential stands as the
    whole value of the headers key Authorization. It also implements this rule''s
    carve-out for a parameter displaced by a security scheme via parameterDisplacedByCredential.
    The address, path, request-body and other-parameter placement this rule also states,
    and the joining of this module''s raw cookie segments with any other cookie-carried
    part of the same call, are REMAINDER, belonging to the task assembling the draft''s
    configuration text.'
- node: scenarios/integration/an-api-key-scheme-becomes-a-generated-credential
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
  how: 'For a required apiKeyHeader scheme in header X-Api-Key and connector erp-http,
    generateCredentialPlaceholders produces headers["X-Api-Key"] = "${credential:ERP_HTTP_APIKEYHEADER}"
    and generatedCredentials = [{name: "ERP_HTTP_APIKEYHEADER", security_scheme: "apiKeyHeader"}],
    matching the scenario''s then-clauses exactly.'
inferences:
- inferred: cookieSegments is returned as a raw, unjoined list of "<name>=<value>"
    segments rather than one joined Cookie header value.
  from: This task's own REMAINDER note assigning the drafted address composition to
    the task assembling the draft's configuration text, and the fact that this module
    has no visibility into subject-placeholder-resolution's own cookie-carried parts,
    which must be joined into the same Cookie value.
- inferred: Added an exported parameterDisplacedByCredential helper (beyond what this
    task's twelve stated criteria name) so a scheme-versus-parameter collision can
    be resolved by a later caller.
  from: This task's own Notes, which explicitly generalize criterion 6's collision
    handling to resolving a scheme-versus-parameter collision by always keeping the
    scheme's placeholder and naming the parameter unresolved with drafted-key-occupied-by-another-security-scheme
    as part of this task's implementation.
- inferred: An 'http' scheme whose httpScheme is neither 'basic' nor 'bearer' (e.g.
    'digest') is treated as not reducible to a credential.
  from: The domain rule's enumeration of the reducible kinds as an API key or an HTTP
    basic or bearer scheme -- exhaustive for the http kind -- and the unresolved-reason
    enumeration's own description naming OAuth2 and OpenID Connect as examples rather
    than an exhaustive list of the non-reducible case.
- inferred: httpScheme comparison against 'basic'/'bearer' is case-insensitive.
  from: HTTP authentication scheme tokens are case-insensitive per the HTTP specification
    itself, the same standing this project's own rule already gives reading OpenAPI's
    own format conventions rather than inventing a stricter one, and neither the rule
    nor openapi-operation-reader normalizes case before this module reads it.
deferred:
- what: Joining this module's raw cookieSegments with any cookie-carried parts subject-placeholder-resolution
    produces, and calling parameterDisplacedByCredential for every operation parameter
    to reconcile it against subject-placeholder-resolution's own unresolved list.
  why: Both require composing this module's output with subject-placeholder-resolution's
    output and the address/body composition into one configuration text -- the REMAINDER
    this task's own Notes assign to the task assembling the draft's configuration
    text, which is not yet delivered.
---

## What it is

The security-scheme half of what a draft can honestly resolve, and the disclosure of every name it generated.

## Notes

None.
