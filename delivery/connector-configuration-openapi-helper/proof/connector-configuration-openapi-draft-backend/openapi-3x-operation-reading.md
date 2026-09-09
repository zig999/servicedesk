---
target: backend
title: OpenAPI 3.x operation reading -- version gate, refusal shapes, and the anti-corruption
  reader's output
summary: Proves the version-gate refusals, the operation-not-found refusal, their
  distinctness and 422 mapping, and that the reader exposes method, parameters, request-body
  field names and security schemes exactly as an OpenAPI 3.x (or equivalent YAML)
  document spells them, for both its stated criteria and the notes' underdetermined
  and inferred decisions.
implementation: sha256:3644212971127fb57c5ccc3e60d18d503192e30bdf0ff26d5def8d5bc0ff8acc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-openapi-3x-operation-reading-suite
tests:
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses a document declaring swagger 2.0, naming the declared version
  proves: 'Criterion 1: a document declaring swagger 2.0 refuses with OpenApiDocumentNotReadableError,
    naming the declared version.'
  fails_when: the reader stops throwing OpenApiDocumentNotReadableError for a swagger-2.0
    document, or the thrown error's context does not carry declaredVersion '2.0'.
  demonstrates: scenarios/integration/a-swagger-2-document-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses a document declaring an openapi version outside 3.x, naming the version
    it declared
  proves: 'Criterion 2: a document declaring a non-3.x version refuses the same way,
    naming the declared version.'
  fails_when: an openapi version string that does not start with '3.' (e.g. '4.0.0')
    is accepted, or the reported declaredVersion differs from what the document declared.
  demonstrates: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses text that parses as neither JSON nor a YAML mapping, naming what failed
    to parse
  proves: 'Criterion 3: text that does not parse as a document at all refuses, naming
    what failed to parse.'
  fails_when: plain prose that parses to a YAML scalar string (not a plain object)
    is accepted as a document, or the error's detail stops naming 'the fetched document
    text'.
  demonstrates: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses an empty document text the same way as any other text that does not
    parse
  proves: the empty-input edge case -- an empty string is refused through the same
    OpenApiDocumentNotReadableError('unparseable') path as any other unparseable text.
  fails_when: an empty document text is accepted, crashes uncaught, or is refused
    through a different error value.
  demonstrates: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses a document that parses to an object declaring neither an openapi nor
    a swagger field, naming that no version was declared
  proves: UNDERDETERMINED entry 1 -- a document parsing to an object with no version
    field at all refuses the same way, naming that none was declared.
  fails_when: a document with no openapi and no swagger field is accepted as readable,
    rather than refused with context {kind:'no-version-declared'}.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses a genuine YAML syntax error the same way as any other unparseable
    text, preserving it as the cause
  proves: the inference that a genuine parse exception (not merely a non-object parse
    result) is folded into the same OpenApiDocumentNotReadableError('unparseable')
    value, with the original exception preserved as its cause.
  fails_when: a tab-indented (syntactically invalid) YAML document crashes uncaught,
    is reported through a different error value, or the underlying YAML exception
    is not preserved as the error's cause.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses when the document declares no entry at all for the requested path,
    naming that path and method
  proves: 'Criterion 4 (path absent): an OpenAPI 3.x document with no entry for the
    requested path refuses with OpenApiOperationNotFoundError, naming that path and
    method.'
  fails_when: a request against a path the document's paths object does not hold is
    not refused, or the reported path/method differ from what was requested.
  demonstrates: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses when the path exists but declares no operation under the requested
    method
  proves: 'Criterion 4 (method absent): a path item present in the document but lacking
    the requested method refuses the same way.'
  fails_when: a request for a method the path item does not declare (here DELETE against
    a path declaring only get) is not refused, or the operation's parameters/body/security
    are read anyway before the refusal.
  demonstrates: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: keeps OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError as
    two distinct values, neither an instance of the other
  proves: 'Criterion 5: the two error values are distinct and never interchanged.'
  fails_when: either class is made to extend the other, or their name values are made
    to coincide.
  demonstrates: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: returns the operation's own method key exactly as the document spells it,
    regardless of the requested method's own casing
  proves: 'Criterion 6: the reader yields the chosen operation''s own HTTP method,
    looked up case-insensitively on the caller''s input but returned as the document''s
    own (lower-case) spelling.'
  fails_when: the returned method is upper-cased, echoes the caller's own casing instead
    of the document's, or a differently-cased request fails to locate the operation
    at all.
  demonstrates: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: merges the path item's own parameters with the operation's own, exposing every
    parameter from both
  proves: 'Criterion 7 (merge): a path item''s own parameter and an operation''s own
    distinct parameter are both exposed, with mixed-case/separator names (''Widget_Id'',
    ''Limit-Count'') preserved verbatim (criterion 10).'
  fails_when: either the path-item-only or the operation-only parameter is dropped
    from the merged list, or either name is altered on the way out.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: follows a parameter's $ref to its target before exposing its name and location
  proves: 'Criterion 7 ($ref resolution): a parameter given only as a $ref is resolved
    to its target''s own name and location (''X-Api-Version''/''header''), preserved
    verbatim (criterion 10).'
  fails_when: the $ref parameter is exposed unresolved (or dropped), or the resolved
    name/location is altered.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: keeps a single parameter when the operation redeclares a path item parameter
    under the same name and location
  proves: 'Criterion 7 (dedup): a parameter declared identically at both the path
    item and the operation is merged into one entry rather than duplicated.'
  fails_when: the merged list holds two entries for the same name+location pair instead
    of one.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: returns an empty parameter list when neither the path item nor the operation
    declares any
  proves: the empty-collection edge case for criterion 7 -- an operation and path
    item with no parameters at all yields an empty list rather than an absent value
    or a thrown error.
  fails_when: the reader throws, returns undefined, or returns a non-empty list when
    no parameter is declared anywhere.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: exposes a parameter as exactly its name and declared location, with no separate
    position field
  proves: the inference that criterion 7's 'position' is read as identical to the
    parameter's declared location rather than exposed as a distinct field.
  fails_when: a returned parameter object carries any key besides name and location
    (e.g. a separate positional index).
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses (as OpenApiDocumentNotReadableError) a parameter whose $ref points
    nowhere the document declares
  proves: the inference that a dangling $ref is folded into the same OpenApiDocumentNotReadableError('unparseable')
    value rather than a distinct one.
  fails_when: a $ref pointing at a path the document holds nothing under is silently
    treated as an absent/empty parameter, crashes uncaught, or is refused through
    a different error value.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses (as OpenApiDocumentNotReadableError) a parameter whose $ref chain
    cycles back to itself
  proves: the inference that a cyclic $ref is folded into the same OpenApiDocumentNotReadableError('unparseable')
    value rather than looping forever or crashing uncaught.
  fails_when: a two-hop $ref cycle (A -> B -> A) causes an infinite loop/stack overflow,
    or is not refused through OpenApiDocumentNotReadableError.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: exposes the top-level property names of the application/json request-body
    schema, in the order the document declares them
  proves: 'Criterion 8 (basic case): the top-level properties keys of the application/json
    schema are exposed verbatim and in declared order (criterion 10 preserves ''Serial_Number'').'
  fails_when: a declared property name is dropped, reordered without cause, or lower-cased/rewritten.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads no request-body field names when the content declares no application/json
    entry
  proves: 'Criterion 8 (no application/json entry): a request body whose content declares
    only a different media type yields no field names.'
  fails_when: field names are read from a non-application/json media type's schema.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads no request-body field names when the application/json schema is an array
    rather than an object
  proves: 'Criterion 8 (non-object schema): an application/json schema of type array
    yields no field names.'
  fails_when: an array schema's items sub-schema is read for property names, or any
    field name is returned.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads only the schema's own top-level property names, never a nested object's
    own properties
  proves: 'Criterion 8 (no nesting): a nested object property''s own inner properties
    (here ''street'') are never exposed, only the top-level key (''Billing_Address'').'
  fails_when: a nested property name leaks into the returned list, or the top-level
    name is dropped or altered.
  demonstrates: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: exposes the scheme names required by the operation's own first security requirement,
    with an API-key scheme's own name and location
  proves: 'Criterion 9 (operation''s own security, apiKey shape): the operation''s
    own security field yields the required scheme''s name, kind ''apiKey'', and its
    own name/location, all preserved verbatim (criterion 10).'
  fails_when: the scheme name, kind, apiKey name or location is dropped, wrong, or
    altered in casing/spelling.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: falls back to the document-level security field when the operation declares
    none at all
  proves: 'Criterion 9 (fallback): when the operation has no security key at all,
    the document''s top-level security field is used instead.'
  fails_when: an operation lacking any security key yields no required schemes instead
    of falling back to the document's top-level field.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: treats the operation's own empty security array as declared and in effect,
    requiring no scheme rather than falling back to the document's top level
  proves: UNDERDETERMINED entry 2 -- an operation's own explicit empty security array
    is read as declared-and-in-effect (yielding no required scheme), rather than as
    absent (which would fall back to a document-level field that does require one).
  fails_when: 'the implementation instead falls back to the document''s top-level
    security whenever the operation''s own security array is empty, so the exact fixture
    used here (top-level requiring ApiKeyAuth, operation declaring security: []) yields
    ApiKeyAuth instead of an empty list.'
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: uses only the first requirement object when the security field lists more
    than one, ignoring the rest
  proves: 'Criterion 9 (first requirement only): only the first object of a multi-entry
    security array is read; a second requirement''s scheme is never included.'
  fails_when: a scheme named only in the security array's second requirement object
    is included in the result.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: exposes an http security scheme's own kind and its own scheme sub-field
  proves: the inference that an http-kind scheme's own scheme sub-field (e.g. 'bearer')
    is exposed as httpScheme alongside kind 'http', needed downstream to distinguish
    basic from bearer.
  fails_when: an http-kind scheme's kind is exposed without its scheme sub-field,
    or the sub-field's value is altered.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: exposes a non-reducible security scheme's own kind (oauth2) rather than dropping
    it
  proves: the ADVISORY note that a non-reducible scheme's own kind (oauth2 among them)
    is exposed by the reader rather than dropped or refused.
  fails_when: an oauth2-typed security scheme is dropped from the result, refused
    as an error, or reported under the wrong kind.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses (as OpenApiDocumentNotReadableError) a security scheme declared with
    a type outside the five OpenAPI recognizes
  proves: the inference that a security scheme declaration with an unrecognized type
    is folded into the same OpenApiDocumentNotReadableError('unparseable') value.
  fails_when: a security scheme of an unrecognized type is silently dropped, silently
    exposed under a made-up kind, or crashes uncaught instead of being refused.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses (as OpenApiDocumentNotReadableError) a security requirement naming
    a scheme the document does not declare
  proves: the inference that a security requirement naming an undeclared scheme is
    folded into the same OpenApiDocumentNotReadableError('unparseable') value.
  fails_when: a security requirement naming a scheme absent from components.securitySchemes
    is silently dropped or crashes uncaught instead of being refused.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads a document served as YAML exactly as one served as JSON, deciding the
    serialization only by parsing the text
  proves: UNDERDETERMINED entry 3 -- an equivalent document served as JSON text and
    as YAML text yields an identical reading, with the serialization decided purely
    by attempting to parse the text (the function receives no content-type at all).
  fails_when: the YAML-served document's reading differs from the JSON-served document's
    reading, or YAML text is refused where the equivalent JSON is accepted.
- file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  name: names itself OpenApiDocumentNotReadableError and carries the detail in context
    for an unparseable document
  proves: the error class's own shape for the 'unparseable' reason -- name and context.detail.
  fails_when: the class's name differs from 'OpenApiDocumentNotReadableError', or
    context drops or alters detail for this reason.
- file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  name: carries the declared version in context for an unsupported-version outcome
  proves: the error class's own shape for the 'unsupported-version' reason -- context.declaredVersion.
  fails_when: context omits or alters declaredVersion for this reason.
- file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  name: carries only the kind in context for a no-version-declared outcome, naming
    no other field
  proves: the error class's own shape for the 'no-version-declared' reason -- no extraneous
    field beyond kind.
  fails_when: context carries an extra field, or drops kind, for this reason.
- file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  name: preserves an underlying parse exception as its own cause when one is given
  proves: the constructor's ErrorOptions parameter attaches a caught parse exception
    as cause.
  fails_when: error.cause is not the exact object passed as the parse exception.
- file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  name: constructs with no cause at all when none is given, rather than requiring
    one
  proves: the cause parameter is optional, not defaulted to some non-undefined value.
  fails_when: constructing without options produces a defined cause instead of undefined.
- file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  name: builds its own message from the reason alone, never embedding the underlying
    parse exception's own text
  proves: no internal detail from a caught exception leaks into the error's own message.
  fails_when: the underlying exception's own message text appears inside this error's
    message.
- file: src/__tests__/unit/errors/openapi-operation-not-found.error.spec.ts
  name: names itself OpenApiOperationNotFoundError and carries the requested path
    and method verbatim in context
  proves: the error class's own shape -- name and context {path, method}.
  fails_when: the class's name differs, or context drops/alters the path or method.
- file: src/__tests__/unit/errors/openapi-operation-not-found.error.spec.ts
  name: builds a message naming both the requested path and method
  proves: Criterion 4's naming that path and that method at the error-object level
    -- the message itself mentions both.
  fails_when: the message omits either the path or the method.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves OpenApiDocumentNotReadableError to 422
  proves: Criteria 1-3's HTTP 422 response -- OpenApiDocumentNotReadableError maps
    to 422 in the one status table.
  fails_when: statusForError stops returning 422 for this class.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves OpenApiOperationNotFoundError to 422
  proves: Criterion 4's HTTP 422 response -- OpenApiOperationNotFoundError maps to
    422 in the one status table.
  fails_when: statusForError stops returning 422 for this class.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: maps OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
    all to 422, pinning distinct as specific rather than mutually exclusive across
    all three
  proves: Criterion 5 and rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
    at the status-map level -- three distinct error values may share one status without
    being conflated.
  fails_when: any of the three classes stops mapping to 422 through this shared table.
  demonstrates: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
not_applicable:
- edge_case: A dependency that fails or answers slowly
  why: readOpenApiOperation is a pure synchronous function over already-fetched text;
    it calls no network, database or clock. The fetch itself, and its failure/timeout
    handling, belongs to the sibling task producing OpenApiDocumentNotFetchedError,
    per this task's own REMAINDER note.
- edge_case: Two operations against one subject at once
  why: the reader holds no shared mutable state and no subject with a lifecycle; concurrent
    calls (over the same or different document text) cannot interact with each other,
    so there is no concurrency behavior of this task's own to exercise.
- edge_case: An operation attempted against state that forbids it
  why: there is no state machine or stored resource here whose prior state could forbid
    a read; every refusal this task raises is about the shape of the input text/document
    itself, not about state left behind by an earlier operation.
- edge_case: A boundary at each end of a stated range
  why: no criterion of this task states a numeric range (a count, a size, a limit).
    The one ordinal boundary in the criteria -- the first requirement object among
    possibly several -- is exercised directly by the security tests above.
untested:
- 'That js-yaml''s load is called directly inside the connector-registry module rather
  than behind a port/adapter (an inference of the implementation record) is a placement
  choice with no behavioral consequence this suite can observe: every document fed
  through readOpenApiOperation, JSON or YAML, produces the same reading whether or
  not a port sits in front of the parser, so no test here proves or disproves where
  the call site sits without asserting an import rather than a behavior.'
- That a local ambient js-yaml.d.ts module declaration was written instead of installing
  @types/js-yaml (an inference of the implementation record) is a compile-time choice
  the project's own typecheck step decides; it has no runtime behavior for a vitest
  test to observe.
---

## What it is

Unit proof of the OpenAPI 3.x anti-corruption reader -- its two refusal shapes, their 422 mapping and distinctness, and every part of a chosen operation it exposes exactly as the document (JSON or YAML) spells it.

## Notes

None.
