---
type: invariant
statement: A connector configuration draft never states a value for responseMap or for statusMap — an OpenAPI document names no evidence-result ending for a status and no field path for a response, so both are always absent from the drafted configuration and left for the operator to author directly.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

an-http-connector-configuration-declares-its-call holds statusMap to a mapping of an HTTP status to one evidence-result ending — ok, denied, timeout or unavailable — and holds responseMap to the field paths an evidence result reads a response by. Neither is a fact an OpenAPI document states: its response schemas describe shape, never which of this system's own outcomes a status means, and never which path this system's own evidence reads a field from. Inventing either from a guess would put a fact the business never decided into a drafted configuration silently; leaving both absent is the honest answer, and the drafted configuration still registers, address, query, headers, body and every generated placeholder intact, exactly as incomplete as an operator's own first hand-authored attempt would be.
