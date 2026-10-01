---
entries:
- field: statement
  unstated: The material named as an open question whether input_schema and output_schema are applied together through one shared draft-request, or independently.
  decided: Applying input_schema and applying output_schema are two independent acts, each touching only its own field.
  why: The two schemas are already validated, entered and read independently elsewhere in this specification (a-capability-declares-well-formed-schemas and a-capability-input-schema-holds-a-well-formed-object each hold one schema's own well-formedness on its own account, never the other's), so an operator who wants to keep a hand-authored output_schema while replacing a drafted input_schema, or the reverse, should not be forced to overwrite both by one act.
---
