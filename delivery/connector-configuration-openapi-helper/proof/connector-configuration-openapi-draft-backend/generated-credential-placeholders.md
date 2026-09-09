---
title: Generated-credential placeholder generation proof
summary: Every credential-reduction, placement, collision, name-composition, non-reducible
  and empty-input path of generateCredentialPlaceholders is exercised against observed
  output, alongside parameterDisplacedByCredential's scheme-versus-parameter collision
  helper.
implementation: sha256:90d56f757dcbe2ea5308e27ad09b735f941c4d04385807ed904eb60b0bdbb79d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-generated-credential-placeholders-suite
tests:
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: places an API key header scheme's placeholder at its own header key, disclosing
    the generated name in generated_credentials
  proves: An API key scheme carried in a header becomes a ${credential:<name>} placeholder
    at a drafted headers key named by that header -- an API key in header X-Api-Key
    places that placeholder under the headers key X-Api-Key.
  fails_when: apiKeyPlacement stops writing the placeholder to headers[name], writes
    it to the wrong key, or the generated name stops matching connector/scheme composition.
  demonstrates: scenarios/integration/an-api-key-scheme-becomes-a-generated-credential
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: places an API key query scheme's placeholder at its own query key
  proves: An API key scheme carried in a query parameter becomes a ${credential:<name>}
    placeholder at a drafted query key named by that parameter.
  fails_when: apiKeyPlacement stops writing the placeholder to query[name] for a query-located
    scheme.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: appends an API key cookie scheme's placeholder as its own raw cookie segment
    rather than a joined Cookie header value
  proves: An API key scheme carried in a cookie becomes a ${credential:<name>} placeholder
    inside the value of the drafted headers key Cookie, and the implementation's own
    inference that cookieSegments is returned raw and unjoined, deferring the join
    to the composing task.
  fails_when: apiKeyPlacement stops appending <name>=<placeholder> to cookieSegments,
    or the module starts writing a joined headers.Cookie value itself.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: keeps two API key cookie schemes naming different cookies as two separate
    segments rather than colliding
  proves: Two API key cookie schemes with distinct cookie names occupy distinct cookie-namespace
    keys and neither is treated as a collision.
  fails_when: cookie-key collision detection is judged over something other than the
    cookie's own name, wrongly treating two distinct cookie names as one occupant.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: 'places an HTTP basic scheme''s placeholder as the whole Authorization header
    value, prefixed by Basic '
  proves: An HTTP basic scheme becomes exactly one ${credential:<name>} placeholder,
    drafted as the whole value of the headers key Authorization, prefixed by the literal
    text Basic .
  fails_when: httpSchemePlacement stops prefixing the basic placeholder with Basic
    , or stops placing it at headers.Authorization.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: 'places an HTTP bearer scheme''s placeholder as the whole Authorization header
    value, prefixed by Bearer '
  proves: An HTTP bearer scheme becomes exactly one ${credential:<name>} placeholder,
    drafted as the whole value of the headers key Authorization, prefixed by the literal
    text Bearer .
  fails_when: httpSchemePlacement stops prefixing the bearer placeholder with Bearer
    , or stops placing it at headers.Authorization.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: keeps only the first of two schemes colliding on the Authorization header
    key, naming the second unresolved with drafted-key-occupied-by-another-security-scheme
  proves: Where more than one required scheme would occupy the whole value of the
    drafted headers key Authorization, only the first in requirement-object order
    becomes a placeholder and holds that key; every other one is named unresolved,
    generating no placeholder and no generated_credentials entry.
  fails_when: the second scheme in requirement-object order is also placed, or is
    not named unresolved, or a generated_credentials entry is produced for it.
  demonstrates: rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: treats an API key scheme declaring header Authorization as colliding with
    an HTTP basic scheme on that same key
  proves: Criterion 6's third named collision source -- an API key declaring header
    Authorization as its own location -- collides with a basic/bearer scheme on the
    same key exactly as the other two sources do.
  fails_when: an API key scheme naming header Authorization is not recognized as sharing
    the Authorization keyIdentity with a basic/bearer scheme, letting both be placed
    or the wrong one win.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: keeps only the first of two schemes colliding on a non-Authorization header
    key, naming the second unresolved rather than overwriting the first
  proves: UNDERDETERMINED -- the Authorization collision clause is generalized to
    every drafted headers key (byte-for-byte equal names), resolved by the requirement
    object's own order.
  fails_when: an implementation that only detects a collision at the literal headers
    key Authorization would let the second scheme's write silently overwrite the first's,
    add a second generated_credentials entry, and name neither scheme unresolved.
  demonstrates: rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: keeps only the first of two schemes colliding on the same drafted query key,
    naming the second unresolved
  proves: The same UNDERDETERMINED generalization as above, extended to a drafted
    query key.
  fails_when: an implementation that detects collisions only at Authorization would
    let both apiKey query schemes write the same query key, the second overwriting
    the first, with neither named unresolved.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: treats two API key cookie schemes naming the same cookie as colliding, keeping
    only the first and naming the second unresolved
  proves: The same UNDERDETERMINED generalization, extended to a cookie name compared
    inside the Cookie segment list.
  fails_when: an implementation that does not compare cookie names for collision would
    append both schemes' segments to cookieSegments, producing two entries for the
    same cookie name and naming neither unresolved.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: folds case before replacing characters outside A-Z0-9, rather than replacing
    lower-case letters away before the fold
  proves: Criterion 7's name composition, read per this task's own ADVISORY note as
    fold-case-first-then-replace, generalized past the one worked example.
  fails_when: upperSnakeSegment replaces characters outside A-Z0-9 before folding
    case, which would replace every lower-case letter of the input away as well, rather
    than only the punctuation.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: names an OAuth2 scheme and an OpenID Connect scheme unresolved with security-scheme-not-reducible-to-a-credential,
    generating no placeholder for either
  proves: Any security scheme not reducible to one credential value -- an OAuth2 scheme
    and an OpenID Connect scheme among them -- is named unresolved with reason security-scheme-not-reducible-to-a-credential
    and generates no placeholder.
  fails_when: credentialPlacementFor starts returning a placement for kind oauth2
    or openIdConnect, or either stops being named unresolved with the stated reason.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: names a mutualTLS scheme and an HTTP scheme using an unrecognized sub-scheme
    unresolved with the same reason, neither assumed reducible
  proves: The implementation's own inference that a mutualTLS scheme, and an http
    scheme whose httpScheme is neither basic nor bearer, are treated as not reducible
    to a credential.
  fails_when: credentialPlacementFor treats mutualTLS or an unrecognized http sub-scheme
    as reducible, producing a placeholder or a generated_credentials entry for it
    instead of naming it unresolved.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: generates no placeholder and names no scheme unresolved when the operation
    requires no security scheme at all
  proves: Where the security field in effect for the operation is an empty array,
    names no scheme, or is declared at neither the operation nor the document's top
    level, no placeholder is generated and no security scheme is named unresolved,
    as reduced to an empty requiredSecuritySchemes array at this module's own boundary.
  fails_when: reducing over an empty requiredSecuritySchemes array produces any headers,
    query, cookieSegments, generatedCredentials or unresolved entry.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: never carries a value read from environment configuration in the generated
    placeholder or in generated_credentials
  proves: No credential value read from environment configuration appears anywhere
    in the generated placeholder or in generated_credentials.
  fails_when: an environment value matching the generated credential name's own key
    were substituted into the placement instead of the literal ${credential:<name>}
    placeholder text.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: recognizes HTTP basic and bearer schemes case-insensitively
  proves: The implementation's own inference that httpScheme comparison against basic/bearer
    is case-insensitive.
  fails_when: httpSchemePlacement stops normalizing httpScheme before comparison,
    so a document declaring BASIC or Bearer is treated as not reducible.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: reports a query parameter displaced by a security-scheme placeholder as unresolved,
    leaving the scheme's own placeholder untouched
  proves: 'UNDERDETERMINED''s decided scheme-versus-parameter resolution: a required
    security scheme colliding with a parameter always gives the key to the scheme,
    the parameter named unresolved with drafted-key-occupied-by-another-security-scheme
    and standing at no position at all -- implemented here as parameterDisplacedByCredential.'
  fails_when: an implementation silent on the scheme-versus-parameter case would leave
    the parameter positioned instead of unresolved, or would report no displacement
    at all, or would displace the scheme's own placeholder instead of the parameter.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: reports a header parameter displaced by a security-scheme placeholder as unresolved
  proves: The same scheme-versus-parameter resolution generalized to a header-located
    parameter.
  fails_when: parameterDisplacedByCredential fails to detect the collision for a header-located
    parameter sharing the Authorization key with a placed bearer scheme.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: reports a cookie parameter displaced by a security-scheme placeholder as unresolved
  proves: The same scheme-versus-parameter resolution generalized to a cookie-located
    parameter, judged by cookie name.
  fails_when: parameterDisplacedByCredential fails to detect that a cookie parameter's
    own name already appears as a cookie segment.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: reports no displacement for a parameter whose own drafted key holds no security-scheme
    placeholder
  proves: parameterDisplacedByCredential returns undefined, never a false positive,
    when the parameter's own key is not occupied by any placed credential.
  fails_when: parameterDisplacedByCredential returns an unresolved item even though
    no placed credential occupies that parameter's own key.
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  name: never reports a path parameter as displaced, since a credential placeholder
    is never drafted at a path position
  proves: A path-located parameter is never checked against headers/query/cookie occupancy,
    since no credential placeholder is ever drafted at a path position.
  fails_when: credentialOccupiesParameterKey starts matching a path-located parameter
    against headers, query or cookieSegments by name alone.
not_applicable:
- edge_case: A boundary at each end of a stated numeric range.
  why: Nothing in this module's domain is a bounded number -- connector and scheme
    names, header/query/cookie keys and the unresolved-reason enumeration carry no
    range to bound.
- edge_case: A dependency that fails, is unavailable or answers slowly.
  why: generateCredentialPlaceholders and parameterDisplacedByCredential are pure
    synchronous functions over their own arguments; the module performs no I/O and
    calls no adapter, port or external service.
- edge_case: An operation attempted against state that forbids it.
  why: The module holds no persisted or mutable state across calls; each call folds
    only over the requiredSecuritySchemes array it was given.
- edge_case: Two operations against one subject running concurrently.
  why: generateCredentialPlaceholders is a synchronous, side-effect-free reduce with
    no shared or asynchronous state, so no concurrent-call interleaving can occur.
untested:
- 'The full joining of an API key cookie scheme''s segment with any other cookie-carried
  part of the same call (including a subject placeholder) into one Cookie header value
  separated by ''; '' is not proven here: this module returns only the raw cookieSegments
  list, per its own recorded inference, and the actual join happens in the not-yet-delivered
  task assembling the draft''s configuration text. This proof covers only the segment
  this module itself produces, not the composed Cookie header criterion 3 describes
  in full.'
- Calling parameterDisplacedByCredential for every operation parameter to reconcile
  it against subject-placeholder-resolution's own unresolved list (the implementation
  record's own deferred item) is not exercised here, since it composes this module's
  output with a sibling module's not-yet-delivered composing task.
---

## What it is

Proof of the security-scheme half of what a draft can honestly resolve, and the disclosure of every name it generated.

## Notes

None.
