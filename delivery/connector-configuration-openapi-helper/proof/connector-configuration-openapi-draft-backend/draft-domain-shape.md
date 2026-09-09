---
title: The connector configuration draft's domain shape -- proof
summary: Nine Vitest tests over connector-configuration-draft.ts prove the closed
  unresolved-reason vocabulary, the draft's required-possibly-empty lists, its optional
  method mismatch, the absent capability field, the three sibling value objects' exact
  shapes, and the module's zero imports and single runtime export, dropping the prior
  directory-totality test that claimed ground this task's criteria never owned.
implementation: sha256:8f817221f6ba1369fb642714e1e497bcc8f1d1d4153d24a402359b4ea77b4628
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-draft-generation-service-suite-2
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: admits exactly the four vocabulary reasons the specification enumerates, and
    no other value
  proves: 'Criterion 1: The unresolved-reason vocabulary admits exactly no-capability-registered,
    no-matching-input-schema-property, security-scheme-not-reducible-to-a-credential
    and drafted-key-occupied-by-another-security-scheme.'
  fails_when: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS holds a different set
    of string literals -- one added, one dropped, or one renamed.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-reason
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: refuses an unresolved item whose reason is not one of the four vocabulary
    values
  proves: 'Criterion 2: A value outside that vocabulary is rejected rather than carried
    as an unresolved reason.'
  fails_when: reason widens to accept an arbitrary string, so the @ts-expect-error
    directive becomes unused and the project's strict typecheck step fails on the
    now-unneeded suppression.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-reason
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: accepts a draft whose unresolved and generated-credentials lists are both
    empty, since resolving every operation reference and declaring no security scheme
    are each a legitimate outcome
  proves: Criterion 3's possibly-empty half, and the UNDERDETERMINED entry over criterion
    3 (a draft resolving everything, or declaring no security scheme, is not rejected
    for having an empty list).
  fails_when: unresolved or generated_credentials stop admitting a zero-length array,
    or the assigned draft's own fields stop equaling the empty arrays given.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: refuses a draft that omits its unresolved or generated-credentials list instead
    of declaring it present and empty
  proves: 'Criterion 3''s present half: each of the two lists present and possibly
    empty -- a draft that omits either list entirely is still refused.'
  fails_when: unresolved or generated_credentials become optional fields, so the object
    without them compiles and the @ts-expect-error directive is left unused, failing
    typecheck.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: accepts a draft with no method_mismatch, leaving the field absent rather than
    defaulted
  proves: 'Criterion 4: A connector configuration draft admits a method mismatch as
    an optional element and is valid without one.'
  fails_when: method_mismatch becomes a required field, or the implementation starts
    filling it with a default value instead of leaving it absent.
  demonstrates: domain/integration/connector-configuration-draft-method-mismatch
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares no capability field on the draft, so a generator resolves any number
    of capability references -- including none -- without the type ever exposing the
    count
  proves: 'Criterion 5, and the UNDERDETERMINED entry over it: the capability relationship
    is realized as an input a generator reads, never as a field the type''s own serialization
    exposes.'
  fails_when: ConnectorConfigurationDraft gains any field beyond connector, configuration,
    unresolved, generated_credentials and the optional method_mismatch -- in particular
    a capability-shaped field of any name.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares an unresolved item as exactly a name and a single reason, never a
    set of reasons
  proves: 'Criterion 6: An unresolved item carries a name and exactly one reason drawn
    from the vocabulary.'
  fails_when: ConnectorConfigurationDraftUnresolvedItem's reason becomes an array/set,
    or the type gains or loses a field.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a generated credential as exactly the generated name and the security
    scheme's own name
  proves: 'Criterion 7: A generated credential carries the generated name and the
    security scheme''s own name.'
  fails_when: ConnectorConfigurationDraftGeneratedCredential's name or security_scheme
    fields are renamed, retyped or joined with another field.
  demonstrates: domain/integration/connector-configuration-draft-generated-credential
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a method mismatch as exactly the registered method and the operation's
    method, as two separate fields
  proves: 'Criterion 8: A method mismatch carries the registered method and the operation''s
    method as two separate named values.'
  fails_when: ConnectorConfigurationDraftMethodMismatch's registered and operation
    collapse into one field, or either is renamed or retyped.
  demonstrates: domain/integration/connector-configuration-draft-method-mismatch
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: the draft's domain module carries no import statement at all, naming no framework,
    driver or provider client
  proves: 'Criterion 9: No module of the draft''s domain shape imports a framework,
    a driver or a provider client -- read against the one module this task writes,
    connector-configuration-draft.ts.'
  fails_when: any import/from specifier is added to connector-configuration-draft.ts.
  demonstrates: constraints/the-domain-depends-on-no-infrastructure
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: exports no runtime guard function alongside the closed vocabulary -- only
    the vocabulary array itself carries a runtime value
  proves: The implementation record's inference that no runtime type-guard function
    is declared in this task. Because this assertion runs against a namespace import
    of the whole module, it also depends on every one of the module's runtime and
    type exports resolving from this one file, which is what backs the implementation
    record's inference that the five elements are declared together in one module
    rather than split across files.
  fails_when: connector-configuration-draft.ts starts exporting a runtime guard function,
    or any other runtime value beyond the vocabulary array, or any of the five domain
    elements stops resolving from this one file.
not_applicable:
- edge_case: A duplicate entry within a collection where uniqueness is claimed.
  why: No criterion of this task claims uniqueness over any collection -- the unresolved
    and generated_credentials arrays are stated only as present and possibly empty,
    never as sets.
- edge_case: An operation attempted against state that forbids it.
  why: This task declares plain, immutable value-object types with no operation, method
    or state transition of their own; there is no state to forbid an operation against.
- edge_case: A dependency that fails, is slow, or answers in an unexpected shape.
  why: The module this task writes has zero imports and performs no I/O; it has no
    dependency to fail or answer slowly.
- edge_case: Two operations against one subject at once.
  why: There is no mutable subject and no operation here to race -- the task declares
    types, not behavior that runs.
- edge_case: A boundary at the upper end of a stated range.
  why: The only stated range is any number of capability references, including none,
    which the type admits by declaring no capability field and thus no upper bound
    at all; the lower boundary is covered by the empty-lists and no-capability-field
    tests.
untested:
- Whether a runtime value assigned to reason, generated_credentials, unresolved or
  method_mismatch outside the type declarations is rejected at runtime rather than
  only at compile time -- these are plain TypeScript types with no parser or guard
  at this task's boundary, so nothing in this task's own scope raises a runtime refusal
  for a malformed value; the task's own REMAINDER notes assign the reasons' actual
  runtime derivation, and any runtime validation at a boundary, to later tasks.
- Whether the field-name choices for the project's camelCase/PascalCase naming rule
  are followed anywhere outside this task's own type members -- this proof only checked
  the domain type members against the specification's own attribute names, not a full
  sweep of the file.
---

## What it is

One spec file, exercising the draft's five domain elements through exact-shape type assertions and refusal cases, plus a source-text scan proving the module has no dependency.

## Notes

Proof-only re-delivery. The prior proof's directory-totality test ('the draft's five domain elements sit in one module, with no sibling file splitting one of them out') was falsified by task/connector-configuration-openapi-draft-backend/draft-generation-service's own legitimate new file, src/connector-registry/connector-configuration-draft-generation.ts, added to the same directory. That test claimed totality over ground this task's own criteria never owned; it is dropped here and replaced by two narrower assertions (zero imports, single runtime export) already scoped to the one file this task owns. The implementation record is unchanged; only this proof was rewritten.
