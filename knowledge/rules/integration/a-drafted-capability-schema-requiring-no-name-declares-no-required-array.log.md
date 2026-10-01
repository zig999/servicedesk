---
entries:
- field: statement
  unstated: Whether a drafted capability schema's input_schema and output_schema declare a top-level required array holding no name when no name they draft is declared required, or omit the required key altogether — domain/integration/capability-schema-draft states the array is declared where any of their own names is declared required, and the two derivation rules state what required lists without settling the empty case, while both are explicit that the properties object is drafted even holding no entry.
  decided: No required key at all — input_schema and output_schema alike declare a top-level required array only where at least one name their own properties object holds is declared required, and an empty required array is never drafted.
  why: a-capability-input-schema-holds-a-well-formed-object owes a capability's input schema a properties object unconditionally but a required array only where one is declared, and domain/integration/capability-schema-draft gives the drafted schemas that same shape, so an array holding no name would be a key in the text the operator applies that neither the shape it is drafted to nor any name the document declares occasions.
---
