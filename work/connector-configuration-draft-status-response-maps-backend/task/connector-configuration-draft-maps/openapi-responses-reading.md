---
title: Read the chosen operation's declared responses
summary: The extension of the OpenAPI operation reader that exposes every key of an operation's responses
  object with what the document declares it as.
rationale: Cut from the drafting tasks because the reader is the interface the generator consumes, and
  changing a reading and its consumer in one task would join two seams.
sources:
- intake/scope.md
objective: The OpenAPI operation reader exposes, for one chosen operation, every key its responses object
  declares, each classified as a numeric status, a range key or the default key, with the description
  the document declares for it.
criteria:
- Reading an operation whose responses declare 200, 403 and 503 yields those three keys.
- Each yielded key carries the description the document declares for that response.
- A response the document declares with no description is yielded with no description rather than with
  an empty one.
- A response keyed default is yielded classified apart from any numeric status key.
- A response keyed by a range such as 2XX, 4XX or 5XX is yielded classified apart from any numeric status
  key.
- An operation declaring no responses object yields no response key and raises nothing.
- The reading resolves any $ref it meets through the module's existing resolveRef rather than through
  a second resolver.
implements:
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft-reading-note-kind
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
- rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
---


## What it is
The responses half of OpenApiOperationReading, beside the parameters and request-body reading the module already exposes.

## Notes
The module already exposes resolveRef and pointerTarget, which the inventory names as the one place $ref resolution lives.
UNDERDETERMINED, from the specification — The classification criterion for a range key names only upper-case spellings (2XX, 4XX, 5XX). The specification now holds that a lower-case spelling such as 2xx, and any digits-only key outside 100 through 599, is read as a range too. A reader whose range test is case-sensitive and numeric-range-blind (matching only ^[1-5]XX$) satisfies every criterion as written while failing the specification. Add criteria exercising a lower-case range key and a digits-only out-of-range key (e.g. 42, 600), both expected to classify as a range key.
REMAINDER, from the specification — Most of a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits reaches no criterion of this task — the one-note-per-kind-and-subject pairing, the response-key subject for non-json-success-content-not-read/variants-united/success-schema-declares-no-properties, and the repeated-field-name-path-not-taken detail. This task implements that rule only for its range-key classification clauses; the rest belongs to the task naming the draft's reading_notes.
REMAINDER, from the specification — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs is implemented here only for its response-$ref clause. Its path-item-parameter-merge clause and its $ref clauses for a parameter, a request-body schema and a security scheme belong to the tasks reading the operation's parameters, request body and security scheme.
ADVISORY, from the specification — The description read for a default key or a range key reaches no attribute any candidate discloses — domain/integration/connector-configuration-draft-status-reading holds declared_as for a numeric status only, and domain/integration/connector-configuration-draft-reading-note holds no description field. Harmless to carry in the reader, but no downstream task should be expected to disclose it.
