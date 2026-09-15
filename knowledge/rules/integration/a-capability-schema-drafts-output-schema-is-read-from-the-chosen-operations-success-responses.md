---
type: invariant
statement: A capability schema draft's output_schema declares a top-level properties object holding one entry for each field a-success-response-schemas-single-object-property-is-read-through-as-its-envelope reads from a success response schema of the chosen operation -- a success response schema being the schema a response keyed by a numeric status from 200 through 299 declares under the media type application/json and no other -- each entry keyed by that field's own name and holding the type declared by the schema of the lowest such status that declares it, and a top-level required array listing every name declared required by that same lowest-status schema however differently another success response schema declaring it declares it; an operation from which no such field is read drafts an output_schema whose properties object holds no entry and never without one.
constrains:
- domain/integration/capability-schema-draft
---

## Description

Reuses the same envelope reading the sibling connector configuration draft's own responseMap already holds, for the same document and the same reason: a schema wrapping its fields in one enveloping property is read through it rather than yielding a single field named after the envelope.
Every success response schema contributes, rather than the lowest one alone, because a field one status carries and another does not is still a field the operation answers with; where more than one declares the same name, the lowest status's own declaration of its type and its required standing is the one kept, the same convention a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas already reads its own response fields by.
The properties object is drafted even where it holds no entry, so a reviewing operator reads an operation that answers no field as exactly that rather than as a draft that failed silently.
