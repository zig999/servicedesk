---
target: backend
title: Recursive path-naming proof for fieldSemanticsOf
summary: Tests pin the walk's full-path naming (including the emitted array-items node itself), its two
  exclusions, its reuse of the shared JSON guards, its freedom from framework imports, and the nested
  field's arrival on a collected evidence item, while leaving the domain-wide dependency shape and the
  untouched parts of Evidence unproven by any single test.
implementation: sha256:409cc0ef4514b8e3627019d389f80380e5a1f817a2a518dcc5ade14a69190d60
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-field-semantics-reads-nested-paths-suite
tests:
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: answers one entry per top-level property key the schema declares, in the order the schema states
    them
  proves: A key at the output schema own root properties object names a field by that key alone, with
    no leading dot.
  fails_when: a root-level property's own field-semantics name differs from that key alone -- gains a
    leading dot, is renamed, or the produced array is reordered or incomplete relative to the schema's
    own declared keys.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: carries only the type, with no description key at all, when the schema declares a type but no
    description
  proves: A node the walk reaches whose schema states a type is read into a field carrying that type.
  fails_when: a node whose schema declares a string type is read into a field that omits that type or
    renders it under another key.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: carries only the description, with no type key at all, when the schema declares a description
    but no type
  proves: A node the walk reaches whose schema states a description is read into a field carrying that
    description.
  fails_when: a node whose schema declares a string description is read into a field that omits that description.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: carries neither type nor description for a key whose own declared value is an empty object
  proves: A node the walk reaches whose schema states neither is read into a field carrying its name alone.
  fails_when: a node whose declared value carries neither a string type nor a string description gains
    either key on its produced field.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: answers an empty array for an undefined output schema
  proves: An output schema that is absent ... is read into no fields at all.
  fails_when: fieldSemanticsOf(undefined) answers anything other than an empty array.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: answers an empty array for a schema that is not parseable JSON at all, rather than throwing
  proves: An output schema that ... does not parse ... is read into no fields at all.
  fails_when: fieldSemanticsOf throws, or answers a non-empty array, for a schema string that is not parseable
    JSON.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: answers an empty array for a schema that parses to valid JSON holding no top-level properties
    object at all
  proves: An output schema that ... holds no object named properties at its root is read into no fields
    at all.
  fails_when: fieldSemanticsOf answers a non-empty array for a schema that parses to an object with no
    top-level properties object at all.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: declares no local parseJsonOrUndefined of its own -- as a function or as a const -- importing
    the binding from citation-validation.ts instead
  proves: The recursive reading reuses the existing JSON-guard helper parseJsonOrUndefined rather than
    declaring its own.
  fails_when: field-semantics.ts declares its own parseJsonOrUndefined, as a function or a const, instead
    of importing the one citation-validation.ts already exports.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: declares no local isPlainObject of its own -- as a function or as a const -- importing the binding
    from citation-validation.ts instead
  proves: The recursive reading reuses the existing JSON-guard helper isPlainObject rather than declaring
    its own.
  fails_when: field-semantics.ts declares its own isPlainObject, as a function or a const, instead of
    importing the one citation-validation.ts already exports.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: imports parseJsonOrUndefined and isPlainObject from citation-validation.ts, per this task's own
    third criterion
  proves: The recursive reading reuses the existing JSON-guard helpers parseJsonOrUndefined and isPlainObject
    rather than declaring its own.
  fails_when: field-semantics.ts stops importing parseJsonOrUndefined or isPlainObject from citation-validation.ts.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: imports no framework, driver or provider-client package directly -- every import specifier is
    a relative path, reaching its two JSON-guard helpers from the sibling domain module alone
  proves: The module performing the reading imports no framework, driver or provider client.
  fails_when: field-semantics.ts imports a bare (non-relative) specifier -- a framework, driver or provider-client
    package -- instead of reaching everything it needs through its one relative import.
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: names every node the walk reaches by its full dot- and bracket-concatenated path, carrying each
    one's own declared type and description, while walking no further beneath a tuple-shaped items, a
    patternProperties or an additionalProperties (rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema)
  proves: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema's own statement,
    whole -- including the task's criteria on tuple-shaped items, patternProperties and additionalProperties.
  fails_when: the walk fails to concatenate a nested object key onto its parent path with '.', fails to
    append an array's own single-schema items onto its parent path with '[]' before descending further,
    emits a field for a leaf only and skips an intermediate node the walk reaches, descends into a tuple-shaped
    items and manufactures a field beneath it, or reads anything out of a node's own patternProperties
    or additionalProperties.
  demonstrates: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
- file: src/__tests__/unit/investigation/field-semantics.spec.ts
  name: names every node the walk reaches by its full dot- and bracket-concatenated path, carrying each
    one's own declared type and description, while walking no further beneath a tuple-shaped items, a
    patternProperties or an additionalProperties (rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema)
  proves: UNDERDETERMINED, from the specification -- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
    states that the path and, where the schema states them at the node the path reaches, that node's own
    type and description, are what one field-semantics element carries, for every node the walk reaches
    and not only its leaves, and appends an array's own items onto its parent's own path with []. An array's
    items schema is itself a node the walk reaches, at path installations[], but no criterion of this
    task says whether that node is read into a field of its own; both an implementation that emits installations[]
    and one that omits it satisfy every criterion as written, and only one of them matches the rule's
    every node the walk reaches.
  fails_when: the implementation swapped in is the one the note declines to name outright but describes
    precisely -- one that treats an array's own items only as a path-building step, so installations and
    installations[].state appear but installations[] itself never does.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: snapshots installations[].state, installations and login among the collected evidence item's own
    fields, and no field named state alone, for a capability whose output schema declares state beneath
    installations' own items (scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path)
  proves: the task's criteria on installations[].state, installations, no bare state, and the evidence-item
    snapshot.
  fails_when: the collected evidence item's own fields omits installations, omits installations[].state,
    or includes a field named state alone, for a capability whose output schema declares state beneath
    installations' own items.
  demonstrates: scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: snapshots installations[].state, installations and login among the collected evidence item's own
    fields, and no field named state alone, for a capability whose output schema declares state beneath
    installations' own items (scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path)
  proves: domain/investigation/field-semantics's own Responsibility -- carrying one field's own name and,
    where the schema declares them, its type and description, snapshotted onto the evidence item that
    names it, and reading no other content of the schema such as minLength or enum.
  fails_when: the installations[].state field snapshotted onto the evidence item loses its own type or
    description, gains an unrelated schema keyword such as minLength or enum that the schema also declared,
    or is absent from the evidence item fields altogether.
  demonstrates: domain/investigation/field-semantics
not_applicable:
- edge_case: a numeric range boundary (a minimum or maximum count, or a maximum walk depth)
  why: Neither the criteria nor the rule bound the walk's depth or the number of fields it may produce;
    there is no stated range with a boundary to test at either end.
- edge_case: two distinct schema nodes whose concatenated paths collide to the same field-semantics name
    -- e.g. a property literally named "a.b" beside a nested properties.a.properties.b
  why: No criterion and no node states what happens when two different nodes the walk reaches produce
    an identical name string; nothing in the specification decides a behavior for that case.
- edge_case: an operation attempted against forbidden state, a slow or failing dependency, or two operations
    against one subject at once
  why: fieldSemanticsOf is a pure, synchronous, side-effect-free function over a string; it holds no state
    to forbid, calls no dependency to fail or delay, and shares no mutable resource a second call could
    race against.
untested:
- constraints/the-domain-depends-on-no-infrastructure's own fact spans every domain module's imports,
  project-wide; this task's own criterion 14 is proven directly and scoped to field-semantics.ts alone,
  but no test in this proof decides the constraint's system-wide fact whole -- the project's own standard
  already assigns that to its lint step's dependency audit, not to a per-file unit test.
- domain/investigation/evidence's own fact spans concept, inputs, observation, observed_at, ttl, origin,
  result, result_detail, elapsed_ms, concept_description, capability_payload_notes and its capability
  relationship, alongside fields; this task touches only fields, and no single test in the tree decides
  the aggregate's whole fact together -- the rest is established piecemeal across the many pre-existing,
  unrelated tests in evidence-collection-stage.spec.ts.
- The implementation record's own second inference -- that a node declaring both a properties object and
  an items schema at once is treated as mutually exclusive, descending into properties and never also
  into items -- is a behavior inference over a shape this project's own material never exercises; per
  the implementation record's own reasoning it is recorded here as unproven rather than pinned by a test.
---

## What it is

The tests proving the recursive field-semantics walk: each of the task's fourteen criteria, the governing rule's own statement, the nested-path scenario traced end to end through evidence collection, and the underdetermined array-items question the implementation resolved by inference.

## Notes

Two tests share one name because they exercise the same test body against two distinct claims (the rule's statement and the underdetermined note it left open); both are listed so the proof's own table names each claim it demonstrates rather than folding them into one entry.
