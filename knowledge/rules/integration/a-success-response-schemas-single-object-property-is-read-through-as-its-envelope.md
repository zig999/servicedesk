---
type: invariant
statement: >-
  The response fields a connector configuration draft reads from one success response schema are,
  where that schema's top-level properties object holds exactly one property whose own schema is
  an object declaring a properties object, the properties of that inner object, each at the path
  made of the outer property's name, a dot and the field's own name, and otherwise the schema's
  own top-level properties, each at the path that is its own name — the reading never descending
  below that one envelope, and a schema declaring no properties object at the level it is read at
  yielding no field.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Many documents wrap a response's fields in one enveloping property, and read literally such a schema yields a single field named after the envelope, which no capability would read a value from.
Reading through exactly one single-property object envelope is the narrowest reading that reaches the fields such a document declares without guessing at anything deeper: a schema with two or more top-level properties is read as it stands, and nothing below the envelope is ever flattened, since a nested field's path is the operator's own choice to write.
That the envelope was read through, and by what name, is named to the operator as a reading note.
