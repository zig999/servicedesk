---
target: backend
title: Connector-configuration draft status/response maps -- backend review
summary: The four independent passes over the nine backend tasks that extended the connector-configuration
  draft with drafted statusMap/responseMap disclosure, closed-vocabulary reading notes, and the response
  schema that surfaces them.
reviewed:
- src/connector-registry/connector-configuration-draft.ts
- src/connector-registry/connector-configuration-draft-generation.ts
- src/connector-registry/connector-configuration-draft-reading-notes.ts
- src/connector-registry/openapi-operation-reader.ts
- src/connector-registry/success-response-field-selection.ts
- src/http/dto/draft-connector-configuration-from-openapi.dto.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
- src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
tasks:
- task/connector-configuration-draft-maps/openapi-responses-reading
- task/connector-configuration-draft-maps/success-response-schema-fields
- task/connector-configuration-draft-maps/success-response-envelope-read-through
- task/connector-configuration-draft-maps/draft-disclosure-type
- task/connector-configuration-draft-maps/drafted-status-map
- task/connector-configuration-draft-maps/drafted-response-map
- task/connector-configuration-draft-maps/draft-reading-notes
- task/connector-configuration-draft-maps/draft-answer-shape
- task/connector-configuration-draft-maps/observation-output-schema-filter-conformance
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run over the whole change passed cleanly, so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: Reading an operation whose responses declare 200, 403 and 503 yields those three keys.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: yields a status entry for each of three declared numeric response keys
- criterion: Each yielded key carries the description the document declares for that response.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: carries the description the document declares for a response
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: follows a response's $ref to its target before reading its description
  why: Only a numeric status key's description is exercised. No test in the set declares a description
    on a default key or on a range key, so a reader that carried the description for numeric keys alone
    would pass every test while leaving "each yielded key" false.
- criterion: A response the document declares with no description is yielded with no description rather
    than with an empty one.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: omits the description property for a response declaring none, rather than carrying an empty
      one
- criterion: A response keyed default is yielded classified apart from any numeric status key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: classifies a response keyed default apart from any numeric status key
- criterion: A response keyed by a range such as 2XX, 4XX or 5XX is yielded classified apart from any
    numeric status key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: classifies a response keyed by an upper-case status range apart from any numeric status key
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: classifies a lower-case status range key the same as its upper-case spelling
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: classifies a digits-only response key outside 100 through 599 as a range key
- criterion: An operation declaring no responses object yields no response key and raises nothing.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: yields no response key and raises nothing when the operation declares no responses object
- criterion: The reading resolves any $ref it meets through the module's existing resolveRef rather than
    through a second resolver.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: follows a response's $ref to its target before reading its description
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses (as OpenApiDocumentNotReadableError) a response whose $ref points nowhere the document
      declares
  why: 'nothing holds the reading to resolving through the module''s one existing resolveRef: a second
    resolver duplicating the same following-and-refusing behavior for responses passes both tests.'
- criterion: A success response whose application/json schema declares three top-level properties yields
    those three field names, each at the path that is its own name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: yields a field named and pathed for each of three top-level properties a success response schema
      declares
- criterion: Each yielded field carries the type its own schema declares, and carries none where the schema
    declares none.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: carries the type each field's own schema declares, and omits declaredType entirely where the
      schema declares none
- criterion: Each yielded field carries whether the schema's required list names it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: carries whether a schema's required list names each field, true for a named field and false
      for one it omits
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: leaves declaredRequired absent, never false, for a field whose success response schema declares
      no required list at all
- criterion: Each yielded field carries the success status it was read from.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: carries the success status of the response each field was read from, distinguishing fields read
      from different statuses
- criterion: A success response whose content declares media types but no application/json yields no field.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: yields no field for a success response whose content declares a media type other than application/json
- criterion: A success response declaring no content yields no field.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: yields no field for a success response declaring no content at all
- criterion: A success response schema reached through a $ref is read through the module's existing resolveRef
    rather than through a second resolver.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads a success response and its schema reached through $refs into fields, the same as if declared
      inline
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses (as OpenApiDocumentNotReadableError) a success response schema whose $ref chain cycles
      back to itself
  why: nothing distinguishes reading through the module's existing resolveRef from reading through a second
    resolver that behaves the same way.
- criterion: A success response schema whose root declares allOf yields the properties of every part merged
    into one set of fields.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: merges the properties of every allOf part into one set of fields
- criterion: A success response schema whose root declares oneOf or anyOf yields the properties of every
    variant united into one set of fields.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: unites the properties of every oneOf variant into one set of fields
  why: Only oneOf is exercised. Nothing in the set presents a success response schema whose root declares
    anyOf.
- criterion: A success response schema declaring no properties object yields no field.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: yields no field for a success response schema declaring no properties object
- criterion: A response keyed by a status outside 200 through 299 contributes no field.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: contributes fields only from response keys within 200 through 299, excluding a status just outside
      the range, a default key and a range key
- criterion: A success schema whose single top-level property is an object explicitly declaring a properties
    keyword, whether empty or not, yields that inner object's properties and not the outer property itself.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
- criterion: Each field yielded through an envelope holds the path made of the outer property's name,
    a dot and the field's own name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
- criterion: Each field yielded through an envelope carries the outer property's name as its envelope.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries the envelope name on a response field read through a single-property envelope
- criterion: A success schema with two or more top-level properties yields those top-level properties
    at their own names and carries no envelope.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: omits the envelope attribute entirely from a field not read through an envelope, rather than
      carrying it as undefined
- criterion: A success schema whose single top-level property's own schema is not an object explicitly
    declaring a properties keyword yields that property itself as one field at its own name, carrying
    no envelope.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
- criterion: An object property declared inside the envelope is not descended into, and its own subproperties
    yield no field.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
- criterion: A single top-level property that is an object declaring an empty properties keyword is read
    through as an envelope and yields no field, and a success schema whose top-level properties keyword
    is absent or empty yields no field.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads through the single-object-property envelope invariant exactly as the rule states it, across
      every branch it distinguishes
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts success-schema-declares-no-properties at the envelope inner level too, alongside the
      envelope-read-through note for that same response
  why: no schema in the set declares a top-level properties keyword that is present but empty, so a reader
    treating an empty top-level properties object differently from an absent one passes.
- criterion: ConnectorConfigurationDraft declares status_readings, response_fields and reading_notes,
    each a required list that may be empty.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: accepts a draft whose unresolved and generated-credentials lists are both empty, since resolving
      every operation reference and declaring no security scheme are each a legitimate outcome
- criterion: A status reading declares status and ending as required and declared_as as optional.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares a status reading as exactly a status, an ending typed by the same evidence-result the
      draft mapped it to, and an optional declared_as
- criterion: A status reading's ending is typed by the four endings ok, unavailable, denied and timeout.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares a status reading as exactly a status, an ending typed by the same evidence-result the
      draft mapped it to, and an optional declared_as
  why: nothing in this set holds EvidenceResult to exactly ok, unavailable, denied and timeout at runtime;
    a fifth ending or a renamed one would not fail any test in the set.
- criterion: A response field declares name, path and status as required and declared_type, declared_required
    and envelope as optional.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares a response field as exactly a name, a path and a status, with declared_type, declared_required
      and envelope optional
- criterion: A reading note declares kind and subject as required and detail as optional.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares a reading note as exactly a kind typed by the reading-note-kind vocabulary and a subject,
      with detail optional
- criterion: A reading note's kind is typed by a closed union holding exactly the nine kinds default-response-not-drafted,
    status-range-not-drafted, non-json-success-content-not-read, envelope-read-through, variants-united,
    repeated-field-name-path-not-taken, no-responses-declared, no-success-response-schema and success-schema-declares-no-properties.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: types a reading note's kind by exactly the nine kinds the specification enumerates, and no other
      value
- criterion: The draft type gains no attribute beyond those three collections.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
- criterion: The drafted configuration object holds a statusMap key for every operation, including one
    declaring no responses, where it holds an empty object.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: always states a statusMap key drafted from the operation's declared responses -- empty when
      it declares none -- always states a responseMap key too, empty when no success response schema field
      is read, and pairs an empty status_readings list with that empty statusMap
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the ok ending for a status at each end of the 200-through-299 range
- criterion: A numeric status from 200 through 299 is drafted with ending ok.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the ok ending for a status at each end of the 200-through-299 range
- criterion: The statuses 401, 403 and 407 are drafted with ending denied.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the denied ending for exactly the statuses 401, 403 and 407
- criterion: A numeric status outside 200 through 299 and other than 401, 403 and 407 is drafted with
    ending unavailable.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the unavailable ending for a status immediately outside each end of the 200-through-299
      range
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the unavailable ending, never timeout, for the statuses HTTP itself names as a timeout
- criterion: No declared status is drafted with ending timeout.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the unavailable ending, never timeout, for the statuses HTTP itself names as a timeout
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries exactly one status reading per drafted statusMap entry, each holding that entry's own
      status and ending
- criterion: A response keyed default produces no statusMap entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: produces no statusMap entry and no status reading for a default-keyed or a range-keyed response
- criterion: A response keyed by a range such as 2XX produces no statusMap entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: produces no statusMap entry and no status reading for a default-keyed or a range-keyed response
- criterion: The draft carries exactly one status reading per drafted statusMap entry, holding that entry's
    status and ending.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries exactly one status reading per drafted statusMap entry, each holding that entry's own
      status and ending
- criterion: A status reading carries the description the document declares for that response, and carries
    none where the document declares none.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries the document's own description as declared_as on a status reading, and omits declared_as
      entirely where the document declares no description
- criterion: The drafted configuration object holds a responseMap key for every operation, including one
    from which no success field is read, where it holds an empty object.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: states an empty responseMap object -- never an absent key -- and no response fields, for a success
      response from which no field is read
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: always states a statusMap key drafted from the operation's declared responses -- empty when
      it declares none -- always states a responseMap key too, empty when no success response schema field
      is read, and pairs an empty status_readings list with that empty statusMap
- criterion: Each field read from a success response schema is drafted as one entry keyed by that field's
    own name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: keys each drafted responseMap entry by the field's own name and values it with the path the
      reading gave it, through an envelope
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries exactly one response field per drafted responseMap entry, holding that entry's own name,
      path and success status
- criterion: Each drafted entry holds the path the reading gave that field as its value.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: keys each drafted responseMap entry by the field's own name and values it with the path the
      reading gave it, through an envelope
- criterion: A field name read under differing paths from more than one success response schema is drafted
    with the path read from the lowest success status.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts the path read from the lowest success status when a field name repeats under differing
      paths
- criterion: A field name read under the same path from more than one success response schema is drafted
    as one entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts one responseMap entry for a field name read under the same path from more than one success
      response schema
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: discloses the lowest success status's own account for a field whose path already agrees across
      success response schemas
- criterion: No drafted key is renamed to any name a capability's output schema declares.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: keeps a drafted responseMap key as the field's own name, never a name a registered capability's
      schema declares instead
  why: no fixture in the set registers a capability declaring an output schema at all, so the criterion's
    own term, a capability's output schema, is unexercised.
- criterion: The draft carries exactly one response field per drafted responseMap entry, holding that
    entry's name and path and the success status it was read from.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries exactly one response field per drafted responseMap entry, holding that entry's own name,
      path and success status
- criterion: A response field carries the declared type and the declared required listing where the schema
    declares them, and carries neither where it does not.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries the declared type and the declared required listing on a response field when the schema
      declares both
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries neither declared_type nor declared_required on a response field when the schema declares
      neither
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries declared_required as false, rather than omitting it, for a field a declared required
      listing exists but does not name
- criterion: A response field carries the envelope name where the field was read through one, and carries
    none where it was not.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries the envelope name on a response field read through a single-property envelope
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries, whole, the response field shape the specification declares -- required name/path/status
      always present, and declared_type, declared_required and envelope present only where the schema
      declares them
- criterion: A responses object declaring a default key yields one note of kind default-response-not-drafted
    whose subject is that key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts a default-response-not-drafted note naming the default key, alongside a valid success
      schema
- criterion: A responses object declaring a range key yields one note of kind status-range-not-drafted
    per such key, whose subject is that key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts one status-range-not-drafted note per range key declared
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: reads a lower-case range key spelling as exhibiting status-range-not-drafted exactly as the
      upper-case wildcard would
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: reads a purely numeric key outside the 100-through-599 status bound as exhibiting status-range-not-drafted
- criterion: A success response whose content declares no application/json media type yields one note
    of kind non-json-success-content-not-read naming that response.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the response's own key as the subject of non-json-success-content-not-read, never its
      description or its media type
- criterion: A success schema read through a single object envelope yields one note of kind envelope-read-through
    whose subject is the envelope property's name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the envelope property as the subject of envelope-read-through
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries exactly one envelope-read-through note when two success response schemas are read through
      an envelope property of the same name
- criterion: A success schema whose oneOf or anyOf variants were united yields one note of kind variants-united
    naming that response.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the response's own key as the subject of variants-united, never its description
  why: only a oneOf schema is presented; nothing in the set unites anyOf variants.
- criterion: A field name read under differing paths from more than one success schema yields one note
    of kind repeated-field-name-path-not-taken whose subject is that field name and whose detail carries
    the path not drafted.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names every not-drafted path for a repeated field name, each beside the ascending success status
      it was read from, none of them left out
- criterion: An operation declaring no responses object yields one note of kind no-responses-declared.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the operation's own method upper-cased followed by its path as the subject of no-responses-declared,
      never the connector's name, an operationId or a lower-cased method
- criterion: An operation whose responses declare no application/json success schema yields one note of
    kind no-success-response-schema.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts a no-success-response-schema note naming the operation itself when the responses declare
      no success response schema under application/json
- criterion: A success schema declaring no properties object at the level it is read at yields one note
    of kind success-schema-declares-no-properties.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the response's own key as the subject of success-schema-declares-no-properties, at the
      top level, never leaving it absent
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts success-schema-declares-no-properties at the envelope inner level too, alongside the
      envelope-read-through note for that same response
- criterion: An operation exhibiting none of these conditions carries an empty reading-notes list.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries an empty reading-notes list for an operation exhibiting none of these conditions
- criterion: No note is carried for a condition the operation does not exhibit.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: drafts a default-response-not-drafted note naming the default key, alongside a valid success
      schema
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the response's own key as the subject of non-json-success-content-not-read, never its
      description or its media type
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: carries an empty reading-notes list for an operation exhibiting none of these conditions
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the operation's own method upper-cased followed by its path as the subject of no-responses-declared,
      never the connector's name, an operationId or a lower-cased method
- criterion: The route's response schema declares a property for status_readings, response_fields and
    reading_notes.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: declares exactly the eight attributes ConnectorConfigurationDraft declares, method_mismatch
      optional and every other attribute required
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries no capability name, version or count anywhere in the response, even though two capabilities
      are registered against the drafted connector
- criterion: The route's response schema declares one property per attribute of the draft type and no
    property the type does not declare.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: declares exactly the eight attributes ConnectorConfigurationDraft declares, method_mismatch
      optional and every other attribute required
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
- criterion: The response schema declares each collection's member fields on the presence terms the draft
    type declares for them.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: declares exactly status, ending and declared_as as status_readings' own attributes, status and
      ending required and declared_as optional
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: declares exactly name, path, status, declared_type, declared_required and envelope as response_fields'
      own attributes, name/path/status required and the rest optional
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: declares exactly kind, subject and detail as reading_notes' own attributes, kind and subject
      required and detail optional
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: 'parses reading_notes.kind %s as valid only when it is one of the declared nine values (expected
      valid: %s)'
- criterion: The answer names, versions and counts no capability registered against the connector.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries no capability name, version or count anywhere in the response, even though two capabilities
      are registered against the drafted connector
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
- criterion: The answer's set of fields is the same whether no capability, one or several are registered
    against the connector.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 200 with exactly connector, configuration, unresolved and generated_credentials — and
      no method_mismatch key at all — for an operation with no parameters, no security scheme and no configuration
      currently registered for the connector
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries no capability name, version or count anywhere in the response, even though two capabilities
      are registered against the drafted connector
  why: the none case and the several case are each exercised, but no route test registers exactly one
    capability, so the middle case the criterion names is unexercised.
- criterion: The controller passes the generated draft's status readings, response fields and reading
    notes through unchanged.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 200 with exactly connector, configuration, unresolved and generated_credentials — and
      no method_mismatch key at all — for an operation with no parameters, no security scheme and no configuration
      currently registered for the connector
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: adds method_mismatch, alongside exactly the same four other fields and no other key, when a
      different method is currently registered for the connector
  why: every route fixture uses a document declaring no responses, so both tests carry status_readings
    and response_fields through as empty lists and reading_notes as a single note with no detail; a controller
    that dropped, truncated or rewrote members of a non-empty collection would not be caught.
- criterion: The DTO's declared response type carries no field the draft type does not declare.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
    name: declares exactly ConnectorConfigurationDraft's own eight attribute names as DraftConnectorConfigurationFromOpenApiResponseDto's
      keys, no field the draft type does not declare
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
- criterion: A test shows that a responseMap key naming no top-level property of the producing capability's
    output schema contributes no field to the observation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: keys the ok observation by the capability's own output_schema property names, dropping a response-map
      field the schema does not declare, and never surfacing the response's own raw field name
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries exactly the field whose name is at once a responseMap key and a declared output-schema
      property with a resolving path, excluding a schema-only property, a responseMap-only key and a key
      whose own path fails to resolve, all present in the same call
- criterion: A test shows that an output schema property no responseMap key names is absent from the observation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: excludes an output-schema property from the ok observation when no responseMap key names it,
      even though the response body happens to carry a same-named field
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries exactly the field whose name is at once a responseMap key and a declared output-schema
      property with a resolving path, excluding a schema-only property, a responseMap-only key and a key
      whose own path fails to resolve, all present in the same call
- criterion: A test shows that a responseMap key whose path does not resolve in the response body contributes
    no field to the observation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries no field for a responseMap key that is itself a declared output-schema property when
      its own path does not resolve in the response body
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries exactly the field whose name is at once a responseMap key and a declared output-schema
      property with a resolving path, excluding a schema-only property, a responseMap-only key and a key
      whose own path fails to resolve, all present in the same call
- criterion: A test shows that a collection whose responseMap reaches no output schema property is not
    refused by this reading and ends ok with an observation carrying no field.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: ends ok with an empty observation, refusing nothing at read time, when every responseMap key
      names no output-schema property at all
- criterion: The delivery changes no behavior of observationOf in src/src/investigation/http-declarative-observation-source.adapter.ts.
  state: uncovered
  why: This is a statement about the delivery's own diff, not about any test's own assertion; the pinning
    tests were written in the same delivery and would pass equally against a changed observationOf they
    were written to match. What would settle it is a fact about the change record (no diff to the adapter
    file), not a test.
findings:
- pass: conformance
  file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  where: the it() title at line 32, `refuses an unresolved item whose reason is not one of the four vocabulary
    values`
  evidence: it('refuses an unresolved item whose reason is not one of the four vocabulary values', ()
    => {
  cost: A reader who takes this test's own title as an account of the vocabulary's size is told it holds
    four values; domain/integration/connector-configuration-draft-unresolved-reason holds exactly three,
    and the file's own preceding test enumerates only three.
  correction: Change 'four' to 'three' in the test title.
- pass: conformance
  file: src/connector-registry/connector-configuration-draft.ts
  where: the local type alias at line 25, feeding the `ending` field of ConnectorConfigurationDraftStatusReading
  evidence: type ConnectorConfigurationDraftStatusReadingEnding = 'ok' | 'unavailable' | 'denied' | 'timeout';
  cost: domain/investigation/evidence-result already names this exact four-value vocabulary with one canonical
    home in code (src/investigation/evidence-result.ts, EVIDENCE_RESULTS/EvidenceResult). This file re-derives
    the same four literals as a private, unexported alias instead of referencing that type, so the vocabulary
    now has two independent declarations that can silently disagree with no type error to catch it.
  correction: Import and use EvidenceResult from src/investigation/evidence-result.ts as the type of `ending`
    instead of declaring ConnectorConfigurationDraftStatusReadingEnding locally.
- pass: conformance
  file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the test "accepts a method field naming no standard HTTP verb, matching it case-insensitively
    against the document's own declared operation key" (lines 194-202)
  evidence: 'built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ openapi: ''3.0.0'', paths:
    { ''/widgets'': { purge: {} } } })); const response = await app.inject({ method: ''POST'', url: ROUTE_URL,
    payload: validBody({ method: ''Purge'' }) }); expect(response.statusCode).toBe(200);'
  cost: The test fixes, as passing behavior, that an operation is looked up by folding the request's method
    and the document's own path-item key to one case before comparing them. No node states how the lookup
    itself compares case; a future change that made operation lookup case-sensitive would break only this
    test, with no specification passage for the next reader to consult over which behavior the business
    actually wants.
  correction: Record an invariant (or extend rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft)
    stating that the requested method is matched against the document's own path-item operation key case-insensitively
    when selecting the operation.
- pass: conformance
  file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the test 'refuses with 400 a request whose connector is an empty string' (lines 236-243)
  evidence: 'const response = await app.inject({ method: ''POST'', url: ROUTE_URL, payload: validBody({
    connector: '''' }) }); expect(response.statusCode).toBe(400);'
  cost: rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation's
    own Description reasons the opposite way about exactly this input -- an empty connector name should
    draft normally, naming every parameter unresolved with reason no-capability-registered, a true statement
    about the wrong cause, which is exactly why withholding the act at the Configuration Helper (not a
    backend refusal) is the surface's job. This test instead fixes a 400 refusal at the API boundary for
    that same input, so a reader learns a connector-name emptiness check the specification's own reasoning
    says does not exist at this route.
  correction: Either the test's expectation changes to a 200 whose unresolved list names every parameter
    with reason no-capability-registered, or the node is amended to state that this route itself refuses
    an empty connector name -- the two currently disagree and only one can be what the business decided.
- pass: conformance
  file: src/connector-registry/openapi-operation-reader.ts
  where: operationEntry's resolution of the requested path (line 113) together with pointerTarget's throw
    for an unresolved segment (lines 431-442)
  evidence: const pathItem = resolveRef(document, paths[path]); ... if (!isPlainObject(node) || !(segment
    in node)) { throw notReadable('unparseable', `the $ref "${pointer}"`); }
  cost: An operator whose document names the requested path through a $ref the document holds no target
    for is answered with an HTTP 422 OpenApiDocumentNotReadableError naming the broken $ref, rather than
    the OpenApiOperationNotFoundError naming their path and method -- sending them to suspect the whole
    document is unreadable when the decided reading is that this case is exactly 'the document declares
    no operation for that path', refused the same way an absent paths[path] entry already is.
  correction: operationEntry should treat a path-item $ref that resolveRef cannot resolve to a plain object
    the same as an absent paths[path] entry, refusing with OpenApiOperationNotFoundError(path, method)
    rather than letting notReadable's OpenApiDocumentNotReadableError propagate.
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: unavailableFor(), lines 52-54, as used for the MalformedHttpConnectorConfigurationError branch
    of resolveHttpConnectorCallConfiguration (line 157)
  evidence: 'function unavailableFor(error: Error): ObservationOutcome { return { result: ''unavailable'',
    result_detail: error.name }; }'
  cost: 'An operator whose connector configuration fails this check sees only result_detail: "MalformedHttpConnectorConfigurationError",
    with no statement of the vocabulary the malformed key was held to -- the accepted HTTP methods or
    evidence-result endings -- unlike unavailableForUnreachableConnector two lines away, which does append
    the connector name beside its own error.'
  correction: result_detail for a MalformedHttpConnectorConfigurationError would need to carry the vocabulary
    beside the error name, the way unavailableForUnreachableConnector already appends the connector name
    beside ConnectorUnreachableError.
- pass: standard
  cites: MNT-03
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: lines 278-280, the local `isPlainObject` helper
  evidence: 'function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> { return
    typeof value === ''object'' && value !== null && !Array.isArray(value); }'
  cost: src/connector-registry/openapi-operation-reader.ts already declares an isPlainObject with the
    identical body at its own lines 464-466. Neither file imports the other's copy, so a later change
    to what counts as a plain object updates one file and silently leaves the other's notion different.
  correction: Export one isPlainObject (from wherever it is first declared, or a small shared module)
    and have both files import it rather than redeclaring the check.
- pass: standard
  cites: STK-08
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: lines 256-288, httpConfigurationProblems and its isHttpMethod / isStringRecord / isStatusEndingMap
    guards
  evidence: 'function isStringRecord(value: unknown): value is Readonly<Record<string, string>> { return
    isPlainObject(value) && Object.values(value).every((entry) => typeof entry === ''string''); }'
  cost: The connector configuration this function receives is externally supplied and validated with four
    hand-written guards rather than a Zod schema. A field added to HttpConnectorCallConfiguration, or
    a change to what counts as a valid statusMap entry, has to be kept in sync by hand across all of them;
    a guard nobody updates lets a malformed configuration reach resolveConnectorRequest and issueConnectorHttpCall
    with a shape nothing actually checked.
  correction: Declare the connector-call configuration's shape as a Zod schema and parse the stored configuration
    with it, deriving HttpConnectorCallConfiguration from the schema instead of the four guards.
- pass: standard
  cites: TST-05
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the httpClient stand-in used throughout the file, e.g. lines 175-182
  evidence: 'const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: ''a-value'' }));
    ... expect(httpClient).toHaveBeenCalledTimes(1);'
  cost: Every test in this file substitutes the network through a mocked httpClient or a mocked globalThis.fetch.
    HttpDeclarativeObservationSource is the adapter implementing IObservationSource against the real HTTP
    protocol, and nothing in this file issues a request over an actual socket, so a change to how issueConnectorHttpCall
    builds or reads a genuine request/response could break against a real server while every test here
    still passes.
  correction: Add one test that starts a real listener (a loopback HTTP server, or equivalent) and asserts
    the adapter's outcome against a response actually returned over it, alongside the existing mocked-httpClient
    tests.
- pass: standard
  cites: TST-01
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: lines 350-369, "does not resolve before a capability's own longer declared timeout elapses..."
    (and four similar tests at 371-390, 392-413, 415-436, 438-459)
  evidence: await vi.advanceTimersByTimeAsync(299); expect(settled).toBe(false); await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);
  cost: The assertion `expect(settled).toBe(false)` sits between two acts, so the test's claim is split
    across three checkpoints rather than arranged, acted on once, and asserted once; the same shape recurs
    across five tests, so a reader has to trace all five interleavings to see they assert the same boundary-crossing
    rule rather than reading one arrange/act/assert block per test.
  correction: Split the pre-boundary and post-boundary checks into two separate tests, each arranging
    its own adapter, advancing time once, and asserting once.
reconciliation: siegard-reconcile/connector-configuration-draft-status-response-maps-backend.md
---

## What it is
The four-pass review of the backend delivery of the connector-configuration-draft-status-response-maps-backend initiative's nine tasks.

## Notes
The failures pass did not run because the captured whole-change run passed cleanly -- there was nothing to diagnose.
Coverage over 6 pre-existing standard-node's own criteria stated by earlier tasks in this epic was not re-audited; only the criteria of the 9 tasks this review names were read.
Trace drift over this review's own file set: the conformance pass's fold cleared 34 of 42 bindings; 8 stayed as they stood, none of them collateral -- each blocked only because the fold found no `encoded_at` for that node in this run (a node honored rather than encoded, or a node this record's judgment did not clear). One binding, domain/integration/connector-configuration-draft-status-reading, is now certified as decided by a test (step `test` over the three files the certification pack named) rather than by reading.
Wider trace drift over the whole backend target (not this review's file set) was reported by the situate step's `trace.py --check`: 95 findings over 294 bindings before this review's own fold and bind -- 15 moved, 80 code over 25 files (213 suppressed under frontend/app's edits_freely declaration). None of that wider drift is this review's to resolve; `/reconcile` is the route for the `code` class outside this review's own files.
Two conformance findings surfaced pre-existing behavior this initiative did not introduce (the empty-connector 400 refusal, and the broken-$ref-in-path-item error type) -- both real disagreements between already-shipped code and the specification's own stated reasoning, not regressions from this delivery.
