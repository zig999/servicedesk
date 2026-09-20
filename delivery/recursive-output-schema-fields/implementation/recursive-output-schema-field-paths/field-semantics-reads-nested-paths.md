---
target: backend
title: Recursive output-schema field-semantics path reading
summary: fieldSemanticsOf now walks a capability output schema's properties and single-schema items recursively,
  naming every node it reaches by its full dotted/bracketed path.
task: sha256:9693ec82db2fb6986d944cd18e4b45e26de79b4294569aff07f80f008638add4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/recursive-output-schema-field-paths-field-semantics-reads-nested-paths-build
files:
- path: src/investigation/field-semantics.ts
  effect: fieldSemanticsOf now delegates to a recursive walk (fieldsFromProperties/fieldsFromNode/descendantFieldsOf/pathWith)
    that emits one FieldSemantics element per node the walk reaches -- root keys named alone, each object
    property appended to its parent path with '.', each array's own single-schema items appended with
    '[]' before anything nested beneath it -- carrying that node's own type/description where the schema
    states them as strings. A tuple-shaped items is not recursed into and produces no field. patternProperties
    and additionalProperties are never inspected. The two JSON-guard helpers are still imported from citation-validation.ts.
criteria:
- criterion: A key at the output schema own root properties object names a field by that key alone, with
    no leading dot.
  met: true
  how: 'field-semantics.ts: pathWith returns the bare key when parentPath is undefined, and the root call
    to fieldsFromProperties passes no parentPath.'
- criterion: A schema whose root properties declares installations, whose items is one object schema declaring
    state under its own properties, is read into a field named installations[].state.
  met: true
  how: 'field-semantics.ts: descendantFieldsOf recurses into a single-schema items with path parent[],
    then fieldsFromProperties appends .state onto that path, producing installations[].state.'
- criterion: That same schema is also read into a field named installations, because the walk names every
    node it reaches and not only its leaves.
  met: true
  how: 'field-semantics.ts: fieldsFromNode emits fieldSemanticsFrom(path, declared) for the installations
    node itself before recursing into descendantFieldsOf.'
- criterion: That same schema is read into no field named state alone.
  met: true
  how: 'field-semantics.ts: state is only ever reached through fieldsFromProperties called with parentPath
    ''installations[]'', so its path is always prefixed.'
- criterion: A node the walk reaches whose schema states a type is read into a field carrying that type.
  met: true
  how: 'field-semantics.ts: fieldSemanticsFrom spreads { type: declared.type } whenever declared.type
    is a string, applied to every node fieldsFromNode visits.'
- criterion: A node the walk reaches whose schema states a description is read into a field carrying that
    description.
  met: true
  how: 'field-semantics.ts: fieldSemanticsFrom spreads { description: declared.description } whenever
    declared.description is a string, applied to every node fieldsFromNode visits.'
- criterion: A node the walk reaches whose schema states neither is read into a field carrying its name
    alone.
  met: true
  how: 'field-semantics.ts: fieldSemanticsFrom''s two spreads are each conditional, so a node with neither
    string leaves the returned object holding only name.'
- criterion: An items declared as more than one schema is walked no further and names no field beneath
    it.
  met: true
  how: 'field-semantics.ts: isPlainObject excludes arrays, so a tuple-shaped items fails both branches
    of descendantFieldsOf and it returns [].'
- criterion: A node's own patternProperties is not walked and names no field of its own, whatever content
    it declares.
  met: true
  how: 'field-semantics.ts: descendantFieldsOf only ever reads declared.properties and declared.items;
    patternProperties is never referenced.'
- criterion: A node's own additionalProperties is not walked and names no field of its own, whatever content
    it declares.
  met: true
  how: 'field-semantics.ts: the same omission as patternProperties -- additionalProperties is never referenced
    anywhere in the walk.'
- criterion: An output schema that is absent, does not parse, or holds no object named properties at its
    root is read into no fields at all.
  met: true
  how: 'field-semantics.ts: fieldSemanticsOf''s unchanged guard returns [] when outputSchema is undefined,
    parseJsonOrUndefined yields no plain object, or parsed.properties is not itself a plain object.'
- criterion: An evidence item collected for a capability whose output schema declares state beneath installations'
    items snapshots installations[].state among its own fields.
  met: true
  how: 'evidence-collection-stage.ts (unchanged): resolvedBaseOf calls fieldSemanticsOf(capability.output_schema)
    and evidenceOf assigns that array to Evidence.fields, so the recursive result is what gets snapshotted,
    with no change needed to that file.'
- criterion: The recursive reading reuses the existing JSON-guard helpers parseJsonOrUndefined and isPlainObject
    rather than declaring its own.
  met: true
  how: field-semantics.ts still imports both from citation-validation.js; no local declaration of either
    name was added.
- criterion: The module performing the reading imports no framework, driver or provider client.
  met: true
  how: field-semantics.ts's only import is from the sibling domain module citation-validation.js.
nodes:
- node: domain/investigation/field-semantics
  encoded_at:
  - src/investigation/field-semantics.ts
  how: FieldSemantics' shape is unchanged; what changed is which node in the schema a given element's
    name and carried type/description are read from.
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/field-semantics.ts
  how: Evidence.fields is populated at collection time from fieldSemanticsOf's output; the recursive walk
    is what lets a nested field such as installations[].state become part of that snapshot.
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  encoded_at:
  - src/investigation/field-semantics.ts
  how: fieldsFromProperties/fieldsFromNode/descendantFieldsOf/pathWith implement the path-building rule
    literally -- root keys alone, '.' concatenation, '[]' concatenation, every reached node emitting an
    element, a multi-schema items and patternProperties/additionalProperties never walked.
- node: scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
  encoded_at:
  - src/investigation/field-semantics.ts
  how: Tracing the scenario's given schema through the new fieldSemanticsOf yields fields named login,
    installations, installations[].state and no bare state, matching the scenario's then-clauses.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/field-semantics.ts
  how: The file's only import remains the sibling domain module citation-validation.js; no framework,
    driver or provider client was introduced.
inferences:
- inferred: An array's own items schema, where it is a single schema, is itself emitted as its own field-semantics
    element at path parent[] -- not only used as a path-building step -- so a schema like installations'
    items also produces an installations[] field alongside installations and installations[].state.
  from: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema's own text, 'for
    every node the walk reaches and not only its leaves', read against the task's own Notes, which flag
    this exact question as underdetermined and state that only the emitting reading matches that clause.
- inferred: Where a node's schema declares both a properties object and an items schema at once (a shape
    this project's material never shows), the walk treats them as mutually exclusive -- it descends into
    properties and not also into items for that same node.
  from: domain/investigation/field-semantics's Description reasoning that a tuple-shaped items and dynamically-keyed
    properties are decided unsupported specifically because no schema in this project's material exercises
    them, extended to this same never-exercised case.
deferred:
- what: Making a citation able to name a nested field (rules/investigation/a-cited-field-exists-in-the-capability-output-schema,
    scenarios/investigation/a-citation-names-a-nested-output-schema-field, domain/investigation/citation,
    rules/investigation/judgment-reads-the-evidence-snapshot, rules/investigation/a-citation-stays-within-the-hypothesis-collects,
    constraints/the-judgment-prompt-is-closed).
  why: The task's own Notes name these as unimplemented neighbors that only consume the snapshotted field
    names this task produces; widening into those files was outside this task's criteria and territory.
---

## What it is

The recursive walk of a capability's output schema, replacing the top-level-only reading, so that every node reachable through properties and single-schema items becomes its own field-semantics element named by its full path.
Existing consumers (Evidence.fields, the judgment prompt, citation validation) are unchanged in shape and read the new names as opaque strings.

## Notes

Every existing field-semantics.spec.ts assertion about flat, top-level-only schemas continues to hold, since none of those fixtures populate a properties or items key beneath a leaf.
citation-validation.ts's declaredFieldsOf stays untouched and top-level-only, still used only by http-declarative-observation-source.adapter.ts for responseMap coverage filtering.
The FieldSemantics type, Evidence.fields, EvidenceItem.fields and their persistence are unchanged in shape; only the string values fieldSemanticsOf produces for name changed.
