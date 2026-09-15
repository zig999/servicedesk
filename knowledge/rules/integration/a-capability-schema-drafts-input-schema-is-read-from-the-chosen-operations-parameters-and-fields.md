---
type: invariant
statement: A capability schema draft's input_schema declares a top-level properties object holding one entry for each parameter the chosen operation declares -- read the way a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs already reads a connector configuration draft's own -- and each request-body field a-connector-configuration-drafts-request-body-fields-are-its-json-schemas-top-level-properties reads from it, each entry keyed by that parameter's or field's own name and holding the type that name's own schema declares where that schema reduces to one JSON Schema type, and a top-level required array listing every such name the operation declares required; a name whose own schema does not reduce to one type declares no properties entry and stands in the draft's unresolved list instead with reason schema-not-reducible-to-a-type.
constrains:
- domain/integration/capability-schema-draft
---

## Description

Reuses the same path-item, $ref and request-body readings the sibling connector configuration draft already holds, because both read one and the same OpenAPI operation and neither specification reads it two different ways.
A parameter or field schema reduces to one type where it states type directly or where every branch of an allOf shares one; a oneOf or an anyOf naming more than one type does not reduce, and the name is disclosed rather than guessed at.
required is drafted from the operation's own declared requirement -- a parameter's own required flag, or a request-body field named in its schema's own top-level required array -- never invented where the operation leaves a name optional.
