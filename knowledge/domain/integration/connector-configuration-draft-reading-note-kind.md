---
type: enumeration
values:
  - default-response-not-drafted
  - status-range-not-drafted
  - non-json-success-content-not-read
  - envelope-read-through
  - variants-united
  - repeated-field-name-path-not-taken
  - no-responses-declared
  - no-success-response-schema
  - success-schema-declares-no-properties
---

## Description

The closed set of conditions a connector configuration draft discloses about how it read the chosen operation's responses.
default-response-not-drafted is a response keyed default, which names no status and is drafted into no statusMap entry.
status-range-not-drafted is a response keyed by a status range such as 2XX, which no observation's own status ever equals and is drafted into no statusMap entry.
non-json-success-content-not-read is a success response whose content declares no application/json media type, from which no field is read.
envelope-read-through is a success response schema whose single object property was read through as an envelope.
variants-united is a success response schema whose oneOf or anyOf variants were united into one set of fields.
repeated-field-name-path-not-taken is a field name read under differing paths from more than one success response schema, of which the path from the lowest status was drafted and this one was not.
no-responses-declared is an operation declaring no responses object at all.
no-success-response-schema is an operation whose responses declare no success response schema under application/json.
success-schema-declares-no-properties is the level a connector configuration draft finally reads — the top level, where no single-property envelope was read through, or the envelope's own inner object, where one was — declaring a properties keyword that is absent or empty, so no field is read from it.

## Responsibility

None.
