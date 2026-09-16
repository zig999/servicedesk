---
target: backend
title: Capability Schema Helper -- backend surface, first review
summary: 'The four passes'' findings over the five delivered tasks of capability-schema-helper-backend:
  the input-schema and output-schema drafting functions, the shared OpenAPI operation
  reader, the draft-capability-schema-from-openapi endpoint, and its three named refusals
  under HTTP 422.'
reviewed:
- src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
- src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
- src/connector-registry/capability-schema-draft-generation.ts
- src/connector-registry/capability-schema-draft-input-schema.ts
- src/connector-registry/capability-schema-draft-output-schema.ts
- src/connector-registry/capability-schema-draft.ts
- src/connector-registry/openapi-operation-reader.ts
- src/factories/build-app.factory.ts
- src/http/build-app.ts
- src/http/draft-capability-schema-from-openapi.controller.ts
- src/http/draft-capability-schema-from-openapi.routes.ts
- src/http/dto/draft-capability-schema-from-openapi.dto.ts
tasks:
- task/capability-schema-draft-generation/colliding-names-favor-declared-order
- task/capability-schema-draft-generation/input-schema-from-parameters-and-request-body-fields
- task/capability-schema-draft-generation/output-schema-from-success-responses
- task/capability-schema-draft-operation/draft-capability-schema-from-openapi-endpoint
- task/capability-schema-draft-operation/three-refusals-under-http-422
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed over every step; there was no failure to diagnose
coverage:
- criterion: input_schema's properties object holds exactly one entry for a name two
    or more parts of the operation claim, where the first claimant in declared order
    reduces to one JSON Schema type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: ranks $title as the properties entry, disclosing the other
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: discloses every displaced claimant, not only the first, when three parts
      of the operation share one name
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a single status property from the query parameter, disclosing the
      colliding request-body field, when an operation declares a query parameter and
      a request-body field both named status
- criterion: that entry holds the type of the first claimant in the order path parameter,
    query parameter, header parameter, cookie parameter, request-body field.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: ranks $title as the properties entry, disclosing the other
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: discloses every displaced claimant, not only the first, when three parts
      of the operation share one name
- criterion: that name stands in input_schema's required array where and only where
    that first claimant is itself declared required and holds a properties entry.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: stands the colliding name in required only where $title
  why: Both required cases give the first claimant a schema that reduces to a type,
    so only the "declared required" half is exercised. No case makes the first claimant
    both declared required and unreducible, so the "and holds a properties entry"
    condition -- a colliding name kept out of required because it earned no properties
    entry -- goes unexercised.
- criterion: every claimant other than the first declares no properties entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: ranks $title as the properties entry, disclosing the other
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: discloses every displaced claimant, not only the first, when three parts
      of the operation share one name
- criterion: every claimant other than the first is named in the draft's unresolved
    list with reason name-claimed-by-another-parameter.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: discloses every displaced claimant, not only the first, when three parts
      of the operation share one name
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: ranks $title as the properties entry, disclosing the other
- criterion: an unresolved item for a displaced claimant names the name exactly as
    the OpenAPI document itself gives it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: names a displaced claimant in unresolved exactly as the OpenAPI document
      itself gives its name
- criterion: a name only one part of the operation claims stands in no unresolved
    item with reason name-claimed-by-another-parameter.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: stands no name in unresolved with reason name-claimed-by-another-parameter
      when every parameter and field name is claimed by only one part of the operation
- criterion: where the first claimant in declared order does not itself reduce to
    one JSON Schema type, the name carries no properties entry at all, the first claimant
    is named in unresolved with reason schema-not-reducible-to-a-type, and every other
    claimant is still named in unresolved with reason name-claimed-by-another-parameter.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: leaves no properties entry and promotes no later claimant when the first
      claimant in declared order does not itself reduce to one JSON Schema type
- criterion: an operation declaring a query parameter named status and a request-body
    field also named status drafts an input_schema whose properties object holds exactly
    one entry named status holding the query parameter's own type, and an unresolved
    list naming status with reason name-claimed-by-another-parameter.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a single status property from the query parameter, disclosing the
      colliding request-body field, when an operation declares a query parameter and
      a request-body field both named status
- criterion: two parameters of the chosen operation equal in both name and location
    are ranked between themselves by the position the parameters array declaring them
    gives each, the earlier standing first as the properties entry and the later named
    in unresolved with reason name-claimed-by-another-parameter.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: ranks $title as the properties entry, disclosing the other
- criterion: input_schema is JSON text that parses to an object declaring a top-level
    properties object.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: parses input_schema as a JSON object declaring a top-level properties object
- criterion: properties holds one entry keyed by the name of each parameter the operation
    declares, read through its path item and its $refs, whose name no other parameter
    or request-body field of the operation also claims, and whose own schema reduces
    to one JSON Schema type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: includes a parameter declared only on the shared path item, and one reached
      only through a $ref, each correctly typed, in the drafted properties
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a properties object holding cpf typed string and includeHistory typed
      boolean, and a required array holding exactly cpf, for a required path parameter
      alongside an optional query parameter
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: stands no name in unresolved with reason name-claimed-by-another-parameter
      when every parameter and field name is claimed by only one part of the operation
- criterion: properties holds one entry keyed by the name of each top-level property
    of the operation's application/json request-body schema whose name no other parameter
    or request-body field of the operation also claims, and whose own schema reduces
    to one JSON Schema type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: includes a top-level request-body field, required per the request-body schema's
      own required array, in properties and in required
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: stands no name in unresolved with reason name-claimed-by-another-parameter
      when every parameter and field name is claimed by only one part of the operation
- criterion: each properties entry declares the type that name's own schema declares.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a properties object holding cpf typed string and includeHistory typed
      boolean, and a required array holding exactly cpf, for a required path parameter
      alongside an optional query parameter
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: includes a parameter declared only on the shared path item, and one reached
      only through a $ref, each correctly typed, in the drafted properties
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: includes a top-level request-body field, required per the request-body schema's
      own required array, in properties and in required
- criterion: a schema stating a type directly reduces to that type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a properties object holding cpf typed string and includeHistory typed
      boolean, and a required array holding exactly cpf, for a required path parameter
      alongside an optional query parameter
- criterion: a schema every branch of whose allOf states one and the same type reduces
    to that type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: reduces a schema whose allOf branches all state the same type to that type
- criterion: a schema every branch of whose oneOf or anyOf names one and the same
    type reduces to that type.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: reduces a schema whose oneOf branches all name the same type to that type
  why: Only oneOf is exercised; no document in the set declares an anyOf at all, so
    a schema whose anyOf branches all name one type reducing to that type is unproven.
- criterion: a schema whose oneOf or anyOf names more than one type among its branches
    reduces to no type.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: declares no properties entry for a name whose oneOf branches name more than
      one type
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: names each unresolved item by its own name and its own reason, and no other
      field, for the same operation declaring an unresolvable parameter, a name claimed
      by another parameter and an unresolvable response field
  why: Only oneOf with two differing branch types is exercised; no document declares
    an anyOf, so the anyOf half of the criterion is unexercised.
- criterion: a schema stating no type directly and declaring no allOf, oneOf or anyOf
    reduces to no type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: excludes a name from properties, leaves it out of required even though the
      operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type,
      named exactly as the document gives it, for a schema stating no type and declaring
      no composition
- criterion: input_schema declares a top-level required array, present only where
    at least one name held in properties is declared required, listing every non-colliding
    name the operation declares required that holds a properties entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a properties object holding cpf typed string and includeHistory typed
      boolean, and a required array holding exactly cpf, for a required path parameter
      alongside an optional query parameter
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: includes a top-level request-body field, required per the request-body schema's
      own required array, in properties and in required
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: declares no required key when properties holds entries but the operation
      declares none of them required
- criterion: a name the operation leaves optional is absent from required.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a properties object holding cpf typed string and includeHistory typed
      boolean, and a required array holding exactly cpf, for a required path parameter
      alongside an optional query parameter
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: declares no required key when properties holds entries but the operation
      declares none of them required
- criterion: a name whose own schema does not reduce to one type is absent from required,
    however the operation declares it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: excludes a name from properties, leaves it out of required even though the
      operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type,
      named exactly as the document gives it, for a schema stating no type and declaring
      no composition
- criterion: input_schema declares no required key at all where no name held in properties
    is declared required.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: declares no required key when properties holds entries but the operation
      declares none of them required
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: declares an empty properties object and no required key for an operation
      declaring neither a parameter nor a request-body field
- criterion: a parameter or request-body field not claimed by any other part of the
    operation, whose own schema reduces to no type, declares no properties entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: excludes a name from properties, leaves it out of required even though the
      operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type,
      named exactly as the document gives it, for a schema stating no type and declaring
      no composition
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: declares no properties entry for a name whose oneOf branches name more than
      one type
- criterion: that name stands in the draft's unresolved list with reason schema-not-reducible-to-a-type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: excludes a name from properties, leaves it out of required even though the
      operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type,
      named exactly as the document gives it, for a schema stating no type and declaring
      no composition
- criterion: an unresolved item names the name exactly as the OpenAPI document itself
    gives it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: excludes a name from properties, leaves it out of required even though the
      operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type,
      named exactly as the document gives it, for a schema stating no type and declaring
      no composition
- criterion: an operation declaring a required path parameter cpf of type string and
    an optional query parameter includeHistory of type boolean drafts an input_schema
    whose properties hold cpf typed string and includeHistory typed boolean and whose
    required array holds exactly cpf.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: drafts a properties object holding cpf typed string and includeHistory typed
      boolean, and a required array holding exactly cpf, for a required path parameter
      alongside an optional query parameter
- criterion: the drafted input_schema holds a properties object and, where present,
    a required array every entry of which is a key of properties, the shape a registered
    capability's own input schema must hold.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: produces an input_schema whose required array, wherever present, holds only
      keys properties itself declares -- the shape a registered capability's own input
      schema must hold
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
    name: excludes a name from properties, leaves it out of required even though the
      operation declares it required, and stands it in the unresolved list under schema-not-reducible-to-a-type,
      named exactly as the document gives it, for a schema stating no type and declaring
      no composition
  why: 'Covered, with a note a reader should carry: the shape validator itself is
    run over only the cpf/includeHistory draft. The drafts most able to put a non-properties
    key in required -- a required name excluded for irreducibility, a required displaced
    claimant -- are asserted directly rather than through inputSchemaShapeProblems.'
- criterion: no second implementation of parameter reading, $ref resolution or request-body
    reading is added beside the one in src/src/connector-registry/openapi-operation-reader.ts.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches through the injected document-fetcher port and reads the operation
      via the existing openapi-operation-reader module, declaring no second implementation
      of either
  why: The one test reads a single file, capability-schema-draft-generation.ts, and
    the absences it asserts are JSON.parse and js-yaml -- document parsing, not parameter
    reading, $ref resolution or request-body reading. A second $ref resolver or parameter
    reader in capability-schema-draft-input-schema.ts, the controller or the routes
    module would pass the set untouched.
- criterion: output_schema is JSON text that parses to an object declaring a top-level
    properties object.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: parses output_schema as a JSON object declaring a top-level properties object
- criterion: a response keyed by a numeric status from 200 through 299 declaring a
    schema under the media type application/json contributes its fields.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: includes a field from a 2xx response under application/json, excludes a
      field from a response keyed just outside 200-299, and excludes a success response
      declaring no content at all
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: holds an entry for a field the 201 response declares that the 200 response
      does not
- criterion: a response keyed by a status outside 200 through 299 contributes no entry.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: includes a field from a 2xx response under application/json, excludes a
      field from a response keyed just outside 200-299, and excludes a success response
      declaring no content at all
  why: The only status outside the range submitted anywhere in the set is 300. No
    document declares a 4xx or 5xx response with an application/json schema, so a
    draft that read an error response's fields into properties would pass the set;
    likewise nothing below 200.
- criterion: a success response declaring no content under application/json contributes
    no entry.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: includes a field from a 2xx response under application/json, excludes a
      field from a response keyed just outside 200-299, and excludes a success response
      declaring no content at all
  why: 'The 202 fixture is { description: ''no content'' } -- it declares no fields
    anywhere, so no code path could contribute one from it and the assertion cannot
    fail on its account. The falsifiable instance, a success response declaring a
    schema under a media type other than application/json, is never submitted.'
- criterion: properties holds one entry for each field the single-object-property
    envelope reading reads from a contributing success response schema whose lowest-status
    declaration reduces to one JSON Schema type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: keys an enveloped field's properties entry by the field's own name, never
      by its envelope-qualified path
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: reads an enveloped field's required standing from the envelope's own inner
      schema, keeping the lowest status's own declaration however differently the
      outer schema or a higher status declares it
- criterion: an entry holds the type declared by the schema of the lowest success
    status that declares that name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: drafts an output_schema whose properties object holds exactly one entry
      named id, typed string, from a 200 and 201 both declaring id differently
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: holds an entry for a field the 201 response declares that the 200 response
      does not
- criterion: another success response schema declaring the same name with a different
    type leaves that entry's type as the lowest status's own.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: drafts an output_schema whose properties object holds exactly one entry
      named id, typed string, from a 200 and 201 both declaring id differently
- criterion: a field whose lowest-status declaration does not reduce to one JSON Schema
    type declares no properties entry and stands in the draft's unresolved list with
    reason schema-not-reducible-to-a-type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: excludes a field from properties and from required, and stands it in the
      unresolved list under schema-not-reducible-to-a-type, when its lowest-status
      declaration does not reduce to one type, even though the response declares it
      required
- criterion: output_schema declares a top-level required array, present only where
    at least one name held in properties is declared required, listing every name
    declared required by the lowest-status schema that declares that name and holds
    a properties entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: excludes a field from properties and from required, and stands it in the
      unresolved list under schema-not-reducible-to-a-type, when its lowest-status
      declaration does not reduce to one type, even though the response declares it
      required
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: reads an enveloped field's required standing from the envelope's own inner
      schema, keeping the lowest status's own declaration however differently the
      outer schema or a higher status declares it
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: declares no required key when properties holds entries but no response declares
      any of them required
- criterion: for a name read through a single-object-property envelope, required standing
    is read from the enveloping property's own inner object schema's own required
    array, never from the success response schema's own top-level required array.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: reads an enveloped field's required standing from the envelope's own inner
      schema, keeping the lowest status's own declaration however differently the
      outer schema or a higher status declares it
- criterion: a name whose lowest-status declaration does not reduce to one type is
    absent from required, however that schema declares it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: excludes a field from properties and from required, and stands it in the
      unresolved list under schema-not-reducible-to-a-type, when its lowest-status
      declaration does not reduce to one type, even though the response declares it
      required
- criterion: output_schema declares no required key at all where no name held in properties
    is declared required.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: declares no required key when properties holds entries but no response declares
      any of them required
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: declares an empty properties object and no required key for an operation
      from which no field is read
- criterion: another success response schema declaring that name's required standing
    differently leaves that listing as the lowest status's own.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: reads an enveloped field's required standing from the envelope's own inner
      schema, keeping the lowest status's own declaration however differently the
      outer schema or a higher status declares it
- criterion: a name declared only by a higher success status still holds an entry
    in properties.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: holds an entry for a field the 201 response declares that the 200 response
      does not
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: reads an enveloped field's required standing from the envelope's own inner
      schema, keeping the lowest status's own declaration however differently the
      outer schema or a higher status declares it
- criterion: an operation from which no such field is read drafts an output_schema
    whose properties object is present and holds no entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: declares an empty properties object and no required key for an operation
      from which no field is read
- criterion: an operation declaring a 200 and a 201 response, both under application/json
    and each declaring a top-level properties object naming id, the 200 typed string
    and the 201 typed integer, drafts an output_schema whose properties object holds
    exactly one entry named id, typed string.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
    name: drafts an output_schema whose properties object holds exactly one entry
      named id, typed string, from a 200 and 201 both declaring id differently
- criterion: no second implementation of success-response or envelope reading is added
    beside the one in src/src/connector-registry/openapi-operation-reader.ts.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches through the injected document-fetcher port and reads the operation
      via the existing openapi-operation-reader module, declaring no second implementation
      of either
  why: The one test reads capability-schema-draft-generation.ts alone and asserts
    the absence of JSON.parse and js-yaml -- strings about document parsing, not about
    success-response selection or envelope unwrapping. Nothing inspects capability-schema-draft-output-schema.ts,
    where a second envelope reading would most naturally sit, so such a duplicate
    would pass the set.
- criterion: the route for draft-capability-schema-from-openapi is registered on the
    application beside the existing OpenAPI-reading routes.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches its own controller rather than answering 404, for the $description
      route
- criterion: the request names the OpenAPI document link, the path, and the HTTP method
    the draft is generated from.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when
      %s is missing from the body, without reaching the document fetcher
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches the operator-named document through the injected document fetcher,
      using the request's own link, and answers HTTP 200 for a well-formed request
      that generates a draft
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: derives input_schema and output_schema from the named operation's resolvable
      parameters, request-body field and success response field, for an operation
      whose document declares a resolvable path parameter and a resolvable response
      field alongside unresolvable ones
  why: 'That the request must name all three is exercised, and the link and the path
    are shown to drive the fetch and the draft. The method is not: every drafting
    request names GET, and no document declares two methods at one path, so that the
    draft follows the named method rather than whichever operation the path holds
    is unexercised.'
- criterion: the operator-named document is fetched inside this backend operation,
    with no fetch of that link issued from any frontend module.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches the operator-named document through the injected document fetcher,
      using the request's own link, and answers HTTP 200 for a well-formed request
      that generates a draft
  why: 'The backend half is proven: the request''s own link reaches the injected fetcher.
    The second half names the frontend, and no test in the set reads or asserts anything
    about a frontend module, so a frontend fetch of the same link would go unnoticed
    here.'
- criterion: an answered request that carries a generated draft carries HTTP 200.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches the operator-named document through the injected document fetcher,
      using the request's own link, and answers HTTP 200 for a well-formed request
      that generates a draft
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: issues no register-capability call while draft-capability-schema-from-openapi
      answers a generated draft
- criterion: an answered request that carries a generated draft never carries HTTP
    201, HTTP 202 or HTTP 204.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches the operator-named document through the injected document fetcher,
      using the request's own link, and answers HTTP 200 for a well-formed request
      that generates a draft
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: issues no register-capability call while draft-capability-schema-from-openapi
      answers a generated draft
- criterion: the answer body carries input_schema, output_schema and the unresolved
    list generated from the named operation's parameters, request-body fields and
    success responses, each item naming its own name and its own reason.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers exactly input_schema, output_schema and unresolved on a generated
      draft -- the value object's three declared attributes and no other key
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: derives input_schema and output_schema from the named operation's resolvable
      parameters, request-body field and success response field, for an operation
      whose document declares a resolvable path parameter and a resolvable response
      field alongside unresolvable ones
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: names each unresolved item by its own name and its own reason, and no other
      field, for the same operation declaring an unresolvable parameter, a name claimed
      by another parameter and an unresolvable response field
- criterion: every reason an unresolved item carries is one of schema-not-reducible-to-a-type
    and name-claimed-by-another-parameter, and no other value.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: carries a reason for every unresolved item drawn from exactly schema-not-reducible-to-a-type
      and name-claimed-by-another-parameter, realizing both from one request
  why: 'Covered, with an over-assertion a reader should route: the test''s final line
    asserts the reasons realized by this one request equal the whole CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS
    constant. The criterion only bounds reasons from above; that equality also fails
    the day the constant legitimately gains a third reason, for a fixture that has
    nothing to do with it.'
- criterion: a request whose path, query or body fails the route's declared shape
    is answered with HTTP 400 whose error code is VALIDATION_ERROR, whose message
    names which of the three failed, and whose details list the issues found.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when
      %s is missing from the body, without reaching the document fetcher
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: refuses with 400 and a non-empty details list for a request whose body is
      empty entirely
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: refuses with 400 a request whose link is an empty string
  why: 'Only body failures are submitted, and only the body message (''the request
    body failed validation'') is asserted. The criterion names three sources: nothing
    submits a request whose path or whose query fails the declared shape, so that
    each of those is answered with 400/VALIDATION_ERROR and that the message names
    the path or the query rather than the body is unexercised.'
- criterion: no register-capability call is issued while the request is answered.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: issues no register-capability call while draft-capability-schema-from-openapi
      answers a generated draft
- criterion: every capability registered before the request stands exactly as it stood
    after it.
  state: partial
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: issues no register-capability call while draft-capability-schema-from-openapi
      answers a generated draft
  why: The spy proves the register-capability dependency is not called, which is one
    route to a change. Nothing in the set reads capability state before the request
    and again after it, so a change reaching the registry by any other path -- a direct
    store write, a mutation of a capability the app already holds -- is unexercised.
- criterion: the answer stores no record of the draft.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers a second request naming a different operation with that operation's
      own freshly generated draft, never a draft carried over from an earlier request
  why: The freshness test rules out a draft carried forward into a later answer; it
    does not observe storage. Nothing in the set gives the route a store or persistence
    dependency and asserts it is never written, so a draft written somewhere and simply
    never read back would pass.
- criterion: the document fetch, the document read and the operation lookup are the
    existing fetcher and readers rather than a second implementation.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches through the injected document-fetcher port and reads the operation
      via the existing openapi-operation-reader module, declaring no second implementation
      of either
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: fetches the operator-named document through the injected document fetcher,
      using the request's own link, and answers HTTP 200 for a well-formed request
      that generates a draft
  why: 'That the fetch goes through the injected port is proven behaviorally. The
    "rather than a second implementation" half rests on a source-text read of capability-schema-draft-generation.ts
    alone, asserting one import line''s spelling and the absence of the strings JSON.parse
    and js-yaml. That binds the shape of one file: a second document read or operation
    lookup in the controller, the routes module or either draft module is not looked
    for, and a second read written without those two strings would pass.'
- criterion: a network failure reaching the named link is answered with HTTP 422 reporting
    an OpenApiDocumentNotFetchedError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
- criterion: a response outside the 2xx range from the named link is answered with
    HTTP 422 reporting an OpenApiDocumentNotFetchedError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
- criterion: the fetch is abandoned as a timeout where the named link has not answered
    within 60000 milliseconds of that fetch beginning, and that abandonment is answered
    with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  why: 'The answer half is proven: a fetcher rejecting with outcome kind ''timeout''
    yields 422 and the fetched-error value. The abandonment itself is not -- the fetcher
    is a mock handed a ready-made timeout error, so nothing in the set exercises a
    link that does not answer, and the 60000 millisecond bound appears nowhere. A
    fetcher that waited forever, or abandoned at some other duration, would pass.'
- criterion: no parsing is attempted on a link that could not be fetched.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  why: 'The fetch-failure cases show the answer names the fetch failure rather than
    a readability failure, which bears on the criterion indirectly. But nothing observes
    whether a parse was attempted: no reader or parser is injected or spied, so a
    path that attempted a parse on the failed fetch and then reported the fetch error
    regardless would pass unchanged.'
- criterion: a fetched document that does not parse in either of the two serializations
    OpenAPI 3.x defines is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
  why: The fixture standing for this case is the text 'null', which parses successfully
    in both JSON and YAML (to the null value); it exercises a document that parses
    but is not an object. Text that genuinely parses in neither serialization -- an
    unterminated brace, arbitrary bytes -- is never submitted, so the criterion's
    own condition is unexercised.
- criterion: a fetched document whose declared version is not OpenAPI 3.x is answered
    with HTTP 422 reporting an OpenApiDocumentNotReadableError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: a fetched document declaring no version at all is answered with HTTP
    422 reporting an OpenApiDocumentNotReadableError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: a fetched document that parses and declares OpenAPI 3.x but declares
    no operation at the path and method the request names is answered with HTTP 422
    reporting an OpenApiOperationNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested
      path and method, and no draft field, when the document parses and declares OpenAPI
      3.x but declares no such operation
- criterion: that OpenApiOperationNotFoundError names the path and the method the
    request named.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested
      path and method, and no draft field, when the document parses and declares OpenAPI
      3.x but declares no such operation
- criterion: the fetch refusal and the readability refusal are answered under the
    same HTTP status.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: the fetch refusal and the readability refusal never report one and the
    same error value.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: neither the fetch refusal nor the readability refusal is ever reported
    as the other.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: neither the fetch refusal nor the readability refusal is ever answered
    as a refusal carrying no named condition.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: the OpenApiDocumentNotFetchedError refusal discloses, beside that error
    value, which of the three fetch failures occurred, and, where it named status-outside-2xx,
    the status the link answered, together with the link the request named, exactly
    as it named it.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
- criterion: the OpenApiDocumentNotReadableError refusal discloses, beside that error
    value, the link the request named, exactly as it named it.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
- criterion: no refusal answer carries an input_schema.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested
      path and method, and no draft field, when the document parses and declares OpenAPI
      3.x but declares no such operation
- criterion: no refusal answer carries an output_schema.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested
      path and method, and no draft field, when the document parses and declares OpenAPI
      3.x but declares no such operation
- criterion: no refusal answer carries an unresolved item.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError disclosing exactly
      the link and the failure's own fields, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError disclosing exactly
      its own reason and the operator-named link, and no draft field, for $name
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested
      path and method, and no draft field, when the document parses and declares OpenAPI
      3.x but declares no such operation
- criterion: an error the status map does not name is answered with HTTP 500 whose
    error code is INTERNAL_ERROR and whose message is the fixed text "an unexpected
    error occurred", disclosing neither that error's own message nor any context it
    carries.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
    name: answers 500 with code INTERNAL_ERROR and the fixed message 'an unexpected
      error occurred', disclosing neither an unmapped error's own message nor any
      context it carries, when the document fetch throws an error the status map does
      not name
findings:
- pass: conformance
  file: src/connector-registry/capability-schema-draft-generation.ts
  where: readableErrorDisclosingLink, lines 50-56
  evidence: 'const reason: OpenApiDocumentNotReadableReason & { readonly link: string
    } = { ...error.context, link };

    return new OpenApiDocumentNotReadableError(reason, { cause: error });'
  cost: 'Against rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document:
    the rule fixes that an OpenApiDocumentNotReadableError refusal discloses, beside
    the error value, only the link and "nothing else of the document" -- in particular
    not which of unparseable, unsupported-version or no-version-declared occurred.
    By spreading error.context (which carries kind and, per variant, detail or declaredVersion)
    into the same object that carries link, this is the one point where that boundary
    is drawn, and it draws it wider than the rule allows: whatever downstream layer
    serializes this error''s context now has no way to tell the link apart from the
    document detail the rule says must stay server-side.'
  correction: Construct the propagated reason as { link } alone (discarding kind/detail/declaredVersion),
    so the new error's context carries only what the rule permits disclosed.
- pass: conformance
  file: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  where: the UNREADABLE_DOCUMENT_CASES fixture (lines 321-337) and the assertion consuming
    it
  evidence: 'expectedDetails: { kind: ''unparseable'', detail: ''the fetched document
    text'', link: REFUSAL_LINK }, ... expectedDetails: { kind: ''unsupported-version'',
    declaredVersion: ''2.0'', link: REFUSAL_LINK }, ... expect(body.error.details).toEqual(expectedDetails);'
  cost: 'Against rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document:
    the rule says an OpenApiDocumentNotReadableError refusal discloses "the link ...
    and nothing else of the document." This test fixes the opposite as the correct
    answer -- a kind discriminator plus, for two of the three cases, an extra detail
    or declaredVersion field -- so whichever of the test or the node is trusted, the
    other is read as wrong.'
  correction: 'Either narrow the test''s expectedDetails to { link: REFUSAL_LINK }
    for all three unreadable-document cases to match the node, or amend the node to
    disclose the finer-grained reason this test fixes, with the decision logged.'
- pass: conformance
  file: src/connector-registry/openapi-operation-reader.ts
  where: operationEntry() computing operationKey, and readOpenApiOperation()'s return
    of `method`, lines 94 and 130-139
  evidence: "const operationKey = method.toLowerCase();\n...\nreturn { pathItem, operation:\
    \ rawOperation, operationKey };\n...\nreturn {\n  method: operationKey,"
  cost: 'Against rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method:
    the drafted configuration''s method comes back lower-cased (e.g. "get") instead
    of the upper-cased verb the executing connector''s shape requires ("GET"). A later
    comparison of this drafted method against a currently-registered configuration''s
    own upper-case method disagrees on case alone, reporting a mismatch that isn''t
    one.'
  correction: 'Upper-case the value before assigning it to method (e.g. method: operationKey.toUpperCase()),
    so an operation the document names under get is drafted as method GET exactly
    as the rule states.'
- pass: standard
  file: src/connector-registry/capability-schema-draft-output-schema.ts
  cites: MNT-03
  where: outputSchemaObject, propertiesOf and hasReducedType
  evidence: 'function outputSchemaObject(properties, required) { return required.length
    > 0 ? { properties, required } : { properties }; }

    function propertiesOf(resolved) { return Object.fromEntries(resolved.map((field)
    => [field.name, { type: field.reducedType }])); }

    function hasReducedType(field) { return field.reducedType !== undefined; }'
  cost: The identical three functions already exist, body for body, in capability-schema-draft-input-schema.ts
    (inputSchemaObject / propertiesOf / hasReducedType), differing only in the type
    alias and the variable name each closes over. A change to that convention fixed
    in one copy leaves the other silently disagreeing.
  correction: Factor the shared shape-building and reduced-type predicate into one
    module both files import.
- pass: standard
  file: src/connector-registry/openapi-operation-reader.ts
  cites: MNT-03
  where: responsesOf, successResponseFieldsOf and successResponseReadingsOf
  evidence: 'function responsesOf(document, operation) { const responses = operation.responses;
    if (!isPlainObject(responses)) { return []; } return Object.keys(responses).map(...);
    }

    function successResponseFieldsOf(document, operation) { const responses = operation.responses;
    if (!isPlainObject(responses)) { return []; } return Object.keys(responses).filter(isSuccessStatusKey).flatMap(...);
    }

    function successResponseReadingsOf(document, operation) { const responses = operation.responses;
    if (!isPlainObject(responses)) { return []; } return Object.keys(responses).filter(isSuccessStatusKey).map(...);
    }'
  cost: The same three-line block -- read operation.responses, refuse anything that
    is not a plain object by returning an empty list, otherwise take its keys -- is
    written out three times in one file instead of being called once. A later decision
    about what a malformed or absent responses value should mean, fixed in one of
    the three, leaves the other two answering the same input differently.
  correction: Extract the guarded responses-keys lookup into one helper the three
    callers share.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
reconciliation: siegard-reconcile/capability-schema-helper-backend.md
---

## What it is

The first review of the capability-schema-helper-backend initiative's five delivered tasks: what the coverage, conformance and standard passes found over the fifteen files those tasks wrote or extended, and what the conformance pass's reconciliation cleared or left owed against the target's trace.

## Notes

The failures pass did not run: the captured run (run/capability-schema-helper-backend) passed over every step the registry declares, so there was no failure to diagnose.
The coverage pass found 20 of 77 criteria partial, none uncovered and none unauditable. Every partial entry names, in the criterion's own terms, what remains unexercised.
The certification pass (12 nodes offered a demonstrates test) found 5 nodes fully covered and 7 partial, with a testable remainder recorded for every one that did not read covered -- see the reconciliation record and its returns for the full per-node accounting.
The conformance pass surfaced one finding (openapi-operation-reader.ts's method casing) against a node belonging to the sibling connector-configuration-draft feature rather than to this initiative's own tasks -- it was still recorded, because the file it lives in is shared and staged whole, and the node pack a judge reads always includes every node the trace binds to that file, not only the ones this review's own tasks implement.
