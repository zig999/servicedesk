---
type: invariant
statement: >-
  One operation's request-body schema is the schema its request body declares under the media
  type application/json and under no other, matched as that exact media type name and read that
  way however many media types that request body's content declares, and the request-body field
  names one operation declares are the keys of the properties object at the top level of that
  schema and no others — a name nested inside a property's own subschema never one of them,
  neither by its leaf name nor by its path from the body root — an operation declaring no
  request body, one whose request body declares no content under application/json, or one whose
  request-body schema is an array or any other non-object, declaring no request-body field name
  at all.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Only the top level of a request-body schema names fields because a-capability-input-schema-holds-a-well-formed-object declares a capability's own names at the top level of properties, one per Subject attribute, and a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability matches a field name against those keys byte for byte. A nested leaf name would equate two different fields wherever a body repeats a name at two depths, and a name rooted from the body would be matched against a key no capability ever declares that way; either produces a placeholder standing for something other than the field it was read from — the exact silent equation that rule refuses. A body schema that is an array or another non-object names nothing to match against, so it honestly declares no field, and the draft states no body rather than inventing a key.

application/json is the one media type whose schema is read because the body an-http-connector-configuration-declares-its-call admits is a value inside the connector configuration's own JSON text, so a JSON object of top-level keys is the only body the executing connector ever carries; field names read off a multipart, form-encoded or XML schema would draft keys for a body that connector never sends in the shape the document declared them for. Where one request body declares content under several media types, naming this one is also the only choice available without a preference the document never states: the entries of a content object are alternative encodings of the same call, keyed rather than ordered, so there is no first entry to read the way a servers array has one. A request body declaring content under no such media type — a JSON-suffixed vendor media type alone among them — leaves the draft stating no body key rather than reading a schema at a name this reader does not recognize: the same honest gap a document declaring no server leaves in the address, and the same one a non-object body schema already leaves, closed by the reviewing operator by hand.
