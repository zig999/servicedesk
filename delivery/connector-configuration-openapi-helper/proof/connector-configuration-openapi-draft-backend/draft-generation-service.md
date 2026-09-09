---
title: Connector configuration draft generation service -- proof
summary: Thirty-seven Vitest cases at src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  exercise generateConnectorConfigurationDraft end to end through fake ports, covering
  every stated criterion, the four inferences the implementation record names, and
  the one UNDERDETERMINED entry that names a candidate implementation the specification
  refuses.
implementation: sha256:51dcfbb76de9512b006e00710f84fc47c695bbcfd762b3abcab0981905ef1d67
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-draft-generation-service-suite-2
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: produces a configuration text that parses as a well-formed JSON object
  proves: The draft's configuration is well-formed JSON object text.
  fails_when: draft.configuration fails to JSON.parse, or parses to something other
    than a plain object.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: upper-cases the operation's own method however the caller requested it
  proves: The draft's configuration declares a method whose value is the chosen operation's
    own HTTP method, upper-cased.
  fails_when: configuration.method is not exactly POST for an operation requested
    with mixed casing.
  demonstrates: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: composes the address from the operation's own first server entry over the
    path item's and the document's, trimming a trailing slash
  proves: Criterion 3, operation-level precedence and trailing-slash removal.
  fails_when: the address is built from the path-item's or document's server instead
    of the operation's own, or the trailing slash is kept.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: falls back to the path item's own first server entry when the operation declares
    none
  proves: Criterion 3, path-item fallback.
  fails_when: the address falls back straight to the document's server or to the path
    alone instead of the path item's.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: falls back to the document's own top-level first server entry when neither
    the operation nor the path item declares one
  proves: Criterion 3, document-level fallback.
  fails_when: the address is the path alone instead of using the document's own top-level
    server.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: composes the address from the path alone when no servers array is in effect
    anywhere
  proves: Criterion 3, the no-servers case.
  fails_when: the address carries any server prefix when none is declared at any level.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: uses only the first entry of the servers array in effect when it lists more
    than one
  proves: Criterion 3, the first entry of the servers array.
  fails_when: the address is built from a server entry other than the first.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: treats the operation's own explicitly empty servers array as in effect, composing
    the path alone rather than falling back to the path item's own servers
  proves: Inference 1 -- an explicitly-declared empty servers array counts as in effect
    and stops the fallback.
  fails_when: an operation declaring servers as [] still falls back to the path item's
    own server instead of yielding the path alone.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: treats a servers entry declaring no url as absent, using the next entry that
    declares one
  proves: the reader's new declaredServerUrls/hasStringUrl helpers skip an invalid
    servers entry rather than using it or throwing.
  fails_when: the address is built from an entry lacking a url, or the valid next
    entry is skipped.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: embeds a resolved path parameter inside the drafted address at its own position
  proves: Criterion 4 (path position) together with criterion 7 (subject placeholder
    embedding).
  fails_when: the address does not carry the substituted path placeholder at the path
    parameter's own position.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: places a resolved query parameter at its own query key
  proves: Criterion 4 (query position).
  fails_when: configuration.query does not carry the placeholder at the parameter's
    own declared key.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: places a resolved header parameter at its own header key
  proves: Criterion 4 (header position).
  fails_when: configuration.headers does not carry the placeholder at the parameter's
    own declared key.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: places a resolved cookie parameter inside the joined Cookie header value
  proves: Criterion 4 (cookie position, joined into one Cookie header).
  fails_when: the cookie parameter's placeholder is missing from the Cookie header,
    or a second cookie-like key appears.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: places a resolved request-body field at its own top-level body key
  proves: Criterion 4 (body position).
  fails_when: configuration.body does not carry the placeholder at the field's own
    top-level key.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: never states a responseMap or a statusMap key, however much of the draft resolves
  proves: 'Criteria 5 and 6: no responseMap key, no statusMap key.'
  fails_when: either key appears on a fully-populated draft's configuration.
  demonstrates: rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: omits the query, headers and body keys entirely when the operation declares
    no parameter or request-body field for any of them
  proves: the empty-collection edge case for criterion 4 -- an absent part is left
    out of the configuration rather than present-but-empty.
  fails_when: query, headers or body appears as a key on the configuration when the
    operation declares none of that kind.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: leaves an unresolved parameter at its own position holding its own name in
    brace form
  proves: 'Criterion 9: an unresolved parameter still stands at its own position,
    holding its own name in the document''s brace form.'
  fails_when: the position holds anything other than the literal {name} brace form.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: lists exactly the parameters, request-body fields and security schemes that
    resolved to no placeholder, and nothing that resolved
  proves: 'Criterion 10: the unresolved list holds every unresolved name with its
    assigned reason, and nothing else.'
  fails_when: a resolved name appears in unresolved, an unresolved name is missing,
    a reason is wrong, or an extra entry appears.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: embeds a header-located security-scheme credential at the header key the scheme
    declares
  proves: Criterion 8 (header-located credential).
  fails_when: the credential placeholder is absent from, or misplaced within, the
    header key the scheme names.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: embeds a query-located security-scheme credential at the query key the scheme
    declares
  proves: Criterion 8 (query-located credential).
  fails_when: the credential placeholder is absent from, or misplaced within, the
    query key the scheme names.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: embeds a cookie-located security-scheme credential inside the Cookie header
    value even when no cookie parameter is declared
  proves: Criterion 8 (cookie-located credential, no-location-of-its-own fallback
    into the headers/Cookie join).
  fails_when: the credential's cookie segment is missing from the Cookie header, or
    a separate cookie-like key is created.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: holds every generated credential paired with its own security scheme's name,
    unmodified from the credential generation
  proves: 'Criterion 11: generated_credentials holds every generated credential paired
    with its own scheme name.'
  fails_when: an entry is missing, reordered incorrectly relative to its scheme, or
    its name/security_scheme pairing is altered.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: states a method_mismatch exactly as the method-comparison task computed it,
    when the operation's method differs from what is registered
  proves: Criterion 12 (mismatch present).
  fails_when: method_mismatch is absent, or its registered/operation values differ
    from what registered-method-comparison would compute.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: states no method_mismatch field at all when nothing is registered for the
    connector
  proves: Criterion 12 (mismatch absent, field left out rather than defaulted).
  fails_when: method_mismatch is present (even as undefined-valued) when nothing is
    registered.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: names the connector it was generated for, exactly as passed in
  proves: 'Criterion 13: the draft names the connector it was generated for.'
  fails_when: draft.connector differs from the connector option passed in.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: generates and returns a draft, rather than refusing, when every parameter
    resolves to nothing and no security scheme reduces to a credential
  proves: Criterion 14, and scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved.
  fails_when: the call throws or refuses instead of returning a draft whose unresolved
    list names every parameter and scheme.
  demonstrates: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: leaves every connector configuration registered before a draft is generated
    byte-identical after it, issuing no register-connector call
  proves: Criteria 15 and 16 together, via a spy store's write-call count and a byte-identical
    re-read.
  fails_when: the store's write method is invoked during draft generation, or the
    re-read configuration text differs from what was registered.
  demonstrates: rules/integration/a-connector-configuration-draft-registers-nothing
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: creates no connector configuration record under any name -- registered or
    not -- merely by generating a draft
  proves: 'UNDERDETERMINED entry 3 (task Notes) -- fails over the implementation it
    names: storing the generated draft as a new connector configuration under a name
    nothing was registered under.'
  fails_when: any record appears in the store after generating a draft for a connector
    nothing was registered under, or the store's write method was invoked at all.
  demonstrates: rules/integration/a-connector-configuration-draft-registers-nothing
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: propagates the fetch failure rather than generating a draft when the document
    link cannot be fetched
  proves: UNDERDETERMINED entry 1 (task Notes) -- the chosen scoping of criterion
    14 to an operation that was found and read, never to a fetch failure.
  fails_when: the call resolves with a draft, or rejects with anything other than
    the exact fetch-failure error the injected fetcher threw.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: propagates the document-reading failure rather than generating a draft when
    the fetched text does not parse as a well-formed OpenAPI 3.x document
  proves: UNDERDETERMINED entry 1 (task Notes) -- same scoping, for the document-not-readable
    refusal.
  fails_when: the call resolves with a draft instead of rejecting with OpenApiDocumentNotReadableError.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: propagates the operation-not-found failure rather than generating a draft
    when the document declares no operation at the requested path and method
  proves: UNDERDETERMINED entry 1 (task Notes) -- same scoping, for the operation-not-found
    refusal.
  fails_when: the call resolves with a draft instead of rejecting with OpenApiOperationNotFoundError.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: embeds a parameter reached only through the operation-reading task's own $ref
    resolution
  proves: this service composes correctly from a $ref-resolved parameter the reader
    already resolved, without a second raw read.
  fails_when: the $ref-resolved parameter's placeholder is absent from, or misplaced
    within, its own declared header key.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: resolves a security-scheme/parameter key collision by replacing whatever the
    subject resolution produced for that name -- a successful placeholder or an unresolved
    entry for a different reason -- with the drafted-key-occupied reason, never duplicating
    either entry
  proves: Inference 2 -- the collision check runs regardless of the parameter's prior
    resolution status, and replaces rather than duplicates the prior entry.
  fails_when: a displaced but previously-resolved parameter's subject value is not
    overwritten by the credential's, a displaced parameter's original unresolved reason
    survives alongside the new one, or either name appears twice in unresolved.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: rebuilds the joined Cookie header from the subject resolution's own segments,
    dropping only a displaced parameter's own segment and appending the credential's
    own segment
  proves: Inference 3 -- the joined Cookie header keeps every non-displaced subject
    segment, drops exactly the displaced one, and appends the credential's own segment.
  fails_when: the surviving segment is lost, the displaced segment survives, or the
    credential's segment is missing or misplaced within the joined value.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: exports generateConnectorConfigurationDraft as a plain function taking one
    options object, not a class
  proves: Inference 4 -- the composing function is a plain exported function over
    an options object, not a class.
  fails_when: the export stops being a callable function, or its parameter shape stops
    being the single options object type.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: propagates a failure the injected capabilities reader raises, rather than
    swallowing it
  proves: the edge case of a dependency that fails -- this composing layer does not
    catch or mask a capabilities-reader failure.
  fails_when: the call resolves instead of rejecting, or rejects with a different
    error than the one the fake reader threw.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: propagates a failure the injected registry raises, rather than swallowing
    it
  proves: the edge case of a dependency that fails -- this composing layer does not
    catch or mask a registry failure.
  fails_when: the call resolves instead of rejecting, or rejects with a different
    error than the one the fake registry threw.
not_applicable:
- edge_case: Absent or empty connector, link, path or method input.
  why: This service receives already-validated typed input; refusal of malformed or
    empty request fields belongs to the HTTP route boundary, and this task's own ADVISORY
    note places constraints/a-malformed-request-is-refused-with-a-validation-error
    over the route rather than this composing service.
- edge_case: A boundary at each end of a stated numeric range.
  why: No criterion of this task states a bounded numeric range (no pagination, no
    size limit) for this composing service to test at either end.
- edge_case: A duplicate parameter occupying the same location twice.
  why: The operation-reading task this service composes from already deduplicates
    a parameter the operation and its path item both declare under the same name and
    location (proven in openapi-operation-reader.spec.ts); this task's own criteria
    state no further dedup rule beyond the union and reconciliation already covered
    by the unresolved-list and collision tests above.
- edge_case: Two operations against one subject running concurrently.
  why: This service performs no write of its own (criteria 15-16) and holds no mutable
    state across invocations; two concurrent calls each read an independent snapshot
    through the injected ports and cannot race against each other.
untested:
- UNDERDETERMINED entry 2 of the task's Notes (whether a $ref's target, or a path-item-level
  parameter an operation does not restate, is read through before this service composes
  the draft) names no implementation the specification refuses -- it only observes
  that criterion 4 defers to the placement rule's identity rather than its reading
  clauses, and states what was implemented without naming a rejected alternative.
  No test is owed for it and none is invented; the $ref test above exercises the chosen
  path incidentally but does not settle the entry's own question.
---

## What it is

Proof, through fake ports, of the one place a draft is assembled and every seam it composes from.

## Notes

An earlier build attempt (run/connector-configuration-openapi-draft-backend-draft-generation-service-suite) failed at lint -- cause code (test), two test bodies over the project's max-lines-per-function limit; fixed by extracting fixture construction into named helper functions, no assertion changed. Re-run passed clean.
