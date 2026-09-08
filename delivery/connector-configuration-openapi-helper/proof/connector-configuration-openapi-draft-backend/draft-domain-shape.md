---
title: The connector configuration draft's domain shape, proven at the type
summary: One new spec file proves the draft's five domain elements -- the closed unresolved-reason
  vocabulary, the draft value object with its two required-but-possibly-empty lists
  and optional method mismatch, the unresolved item, the generated credential and
  the method mismatch -- through exact-shape type assertions, @ts-expect-error refusals,
  and a source-text scan proving the module imports nothing.
implementation: sha256:8f817221f6ba1369fb642714e1e497bcc8f1d1d4153d24a402359b4ea77b4628
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:247b750872a938cbf46d5981405859e9690866d43cf9e858cc8b31d62428ac47
run: run/connector-configuration-openapi-draft-backend-draft-domain-shape-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: admits exactly the four vocabulary reasons the specification enumerates, and
    no other value
  proves: The unresolved-reason vocabulary admits exactly no-capability-registered,
    no-matching-input-schema-property, security-scheme-not-reducible-to-a-credential
    and drafted-key-occupied-by-another-security-scheme.
  fails_when: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS names a different set
    than exactly those four values -- one omitted, one added, or one misspelled.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-reason
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: refuses an unresolved item whose reason is not one of the four vocabulary
    values
  proves: A value outside that vocabulary is rejected rather than carried as an unresolved
    reason.
  fails_when: ConnectorConfigurationDraftUnresolvedItem.reason is widened to a bare
    string (or any type admitting 'not-a-real-reason'), which turns the @ts-expect-error
    above the assignment into an unused directive and fails the project's typecheck
    step.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: accepts a draft whose unresolved and generated-credentials lists are both
    empty, since resolving every operation reference and declaring no security scheme
    are each a legitimate outcome
  proves: 'UNDERDETERMINED, from the specification -- criterion 3 ("declares... each
    of the two lists present and possibly empty") was reworded during binding to close
    a reading where "requires" admitted only non-empty lists; the specification refuses
    a draft that rejects an operation resolving everything (empty unresolved) or declaring
    no security scheme (empty generated_credentials). Implementation: a value object
    where unresolved and generated_credentials are declared arrays that may hold zero
    items.'
  fails_when: unresolved or generated_credentials is narrowed to a non-empty-tuple
    type (or any shape refusing a zero-length array), which is exactly the rejected
    reading the specification refuses -- the assignment above would then fail the
    project's typecheck step, and the runtime assertions on the empty arrays would
    never run.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: refuses a draft that omits its unresolved or generated-credentials list instead
    of declaring it present and empty
  proves: A connector configuration draft declares a connector, a configuration, an
    unresolved list and a generated-credentials list, each of the two lists present
    and possibly empty.
  fails_when: unresolved or generated_credentials is made optional (or removed), which
    turns the @ts-expect-error above the assignment into an unused directive and fails
    the project's typecheck step.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: accepts a draft with no method_mismatch, leaving the field absent rather than
    defaulted
  proves: A connector configuration draft admits a method mismatch as an optional
    element and is valid without one.
  fails_when: method_mismatch is made required, or a default value is assigned somewhere
    so draft.method_mismatch is no longer undefined when omitted.
  demonstrates: domain/integration/connector-configuration-draft-method-mismatch
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares no capability field on the draft, so a generator resolves any number
    of capability references -- including none -- without the type ever exposing the
    count
  proves: 'UNDERDETERMINED, from the specification -- criterion 5 ("admits any number
    of capability references, including none") is satisfiable by a declaration that
    also serializes the capability set, which rules/integration/a-connector-configuration-draft-response-carries-no-capability
    would then refuse once that type reaches an answer. Implementation: declare the
    capability set as a relationship the generator reads to resolve the draft, never
    as a field the type''s own serialization exposes.'
  fails_when: ConnectorConfigurationDraft's declared shape adds a capability field
    of any kind, serializing the capability set the specification's resolution keeps
    off the type -- the exact-shape assertion then disagrees with the type's actual
    member set.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares an unresolved item as exactly a name and a single reason, never a
    set of reasons
  proves: An unresolved item carries a name and exactly one reason drawn from the
    vocabulary.
  fails_when: ConnectorConfigurationDraftUnresolvedItem gains, loses or retypes a
    field -- in particular if reason becomes an array or set of reasons instead of
    exactly one.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a generated credential as exactly the generated name and the security
    scheme's own name
  proves: A generated credential carries the generated name and the security scheme's
    own name.
  fails_when: 'ConnectorConfigurationDraftGeneratedCredential''s field set stops matching
    exactly { name: string; security_scheme: string }.'
  demonstrates: domain/integration/connector-configuration-draft-generated-credential
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a method mismatch as exactly the registered method and the operation's
    method, as two separate fields
  proves: A method mismatch carries the registered method and the operation's method
    as two separate named values.
  fails_when: 'ConnectorConfigurationDraftMethodMismatch''s field set stops matching
    exactly { registered: string; operation: string } -- for instance if the two collapse
    into one shared field.'
  demonstrates: domain/integration/connector-configuration-draft-method-mismatch
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: the draft's domain module carries no import statement at all, naming no framework,
    driver or provider client
  proves: No module of the draft's domain shape imports a framework, a driver or a
    provider client.
  fails_when: connector-configuration-draft.ts gains any import statement -- of a
    framework, a driver, a provider client or anything else.
  demonstrates: constraints/the-domain-depends-on-no-infrastructure
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: the draft's five domain elements sit in one module, with no sibling file splitting
    one of them out
  proves: Inference -- All five domain elements are declared together in one module
    (connector-configuration-draft.ts) rather than one file per type.
  fails_when: a second file appears under src/connector-registry whose name also starts
    with connector-configuration-draft, splitting one of the five elements into its
    own module.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: exports no runtime guard function alongside the closed vocabulary -- only
    the vocabulary array itself carries a runtime value
  proves: Inference -- No runtime type-guard function (e.g. an isConnectorConfigurationDraftUnresolvedReason)
    is declared in this task.
  fails_when: the module's runtime export set grows beyond CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS
    -- for instance if a guard function is added.
not_applicable:
- edge_case: A boundary at each end of a stated numeric range
  why: This task declares plain types with no numeric range, minimum or maximum anywhere
    in its shape.
- edge_case: A duplicate where uniqueness is claimed
  why: None of this task's nine criteria claims a uniqueness invariant over either
    list; a draft's unresolved and generated-credentials lists are declared as plain
    arrays with no stated constraint against repeated entries.
- edge_case: An operation attempted against state that forbids it
  why: This task declares types only, with no operation, method or state transition
    for any state to forbid.
- edge_case: A dependency that fails or answers slowly
  why: A plain domain type performs no I/O and holds no dependency capable of failing
    or being slow.
- edge_case: Two operations against one subject at once
  why: There is no operation in this task's scope to race against itself; the module
    declares static types, not a call any concurrent invocation could contend over.
untested:
- The four REMAINDER notes this task's own author left for later tasks -- how the
  draft's configuration text and its two lists are derived from a chosen operation,
  the method mismatch's presence condition and case folding, the register-nothing
  guarantee, and the four fetch/read/publish refusals -- raise no criterion here and
  so have no test in this record; they remain to be proven by whichever later task
  in the epic implements each.
- 'Whether CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS lists its four values
  in the same order the specification node itself enumerates them is not tested: the
  tests here check membership as a set, since the task''s ninth criterion states only
  that the vocabulary ''admits exactly'' those four values and states nothing about
  their order.'
---

## What it is

One spec file, exercising the draft's five domain elements through exact-shape type assertions and refusal cases, plus a source-text scan proving the module has no dependency.

## Notes

None.
