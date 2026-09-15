---
type: invariant
statement: A capability schema draft's input_schema and its output_schema each declare a top-level required array only where at least one name that schema's own properties object holds is a name the chosen operation declares required, and where none is, that schema declares no required key at all rather than a required array holding no name -- however many names stand in the draft's unresolved list and however the operation declares those required.
constrains:
- domain/integration/capability-schema-draft
---

## Description

a-capability-input-schema-holds-a-well-formed-object owes a registered capability's input schema a top-level properties object unconditionally and a required array only where the schema declares one, and domain/integration/capability-schema-draft gives both drafted schemas that same shape; a draft asking for no name therefore reads as a registered schema asking for none reads, rather than as one an operator would have to tidy before registering it as drafted.

The properties object is drafted even holding no entry for reasons a required array holding no name does not share: a registered capability's input schema declaring no properties object is refused, and a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses keeps the empty object so an operation answering no field is read as exactly that rather than as a draft that failed silently. An absent required states what an empty one would state and nothing besides -- that the draft asks for no name -- so an operation declaring no name required occasions no key at all.

A name standing in the draft's unresolved list never occasions the array on its own: a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields and a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses already leave such a name out of required, so an operation whose every required name stands unresolved drafts a schema with no required key, and that operation's own requirement reaches the reviewing operator through the unresolved item carrying the name.
