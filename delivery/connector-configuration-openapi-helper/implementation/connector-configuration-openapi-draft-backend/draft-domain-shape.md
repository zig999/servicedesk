---
title: The connector configuration draft's domain shape
summary: One new domain module declares the draft value object, its unresolved item,
  its closed unresolved-reason vocabulary, its generated-credential and its method-mismatch,
  all as plain readonly TypeScript types with no infrastructure import.
task: sha256:b20095cc3fdb7258c73022268728a4271fccfa2c04536bb27c213cc9308f6623
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:247b750872a938cbf46d5981405859e9690866d43cf9e858cc8b31d62428ac47
run: run/connector-configuration-openapi-draft-backend-draft-domain-shape-build
files:
- path: src/connector-registry/connector-configuration-draft.ts
  effect: 'New module declaring the five domain elements the draft''s shape needs:
    the CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS as-const array and the ConnectorConfigurationDraftUnresolvedReason
    literal union derived from it; the ConnectorConfigurationDraftUnresolvedItem,
    ConnectorConfigurationDraftGeneratedCredential and ConnectorConfigurationDraftMethodMismatch
    value objects; and the ConnectorConfigurationDraft value object composing them,
    with unresolved and generated_credentials as required (possibly-empty) readonly
    arrays and method_mismatch as an optional field. The file imports nothing.'
criteria:
- criterion: The unresolved-reason vocabulary admits exactly no-capability-registered,
    no-matching-input-schema-property, security-scheme-not-reducible-to-a-credential
    and drafted-key-occupied-by-another-security-scheme.
  met: true
  how: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS names exactly these four string
    literals, in the order the specification node lists them, and ConnectorConfigurationDraftUnresolvedReason
    is the union type indexed off that array so the two can never drift apart.
- criterion: A value outside that vocabulary is rejected rather than carried as an
    unresolved reason.
  met: true
  how: ConnectorConfigurationDraftUnresolvedItem.reason is typed as the closed union,
    never as a bare string, so a string outside the four literals fails the strict
    compiler at every point one is constructed; nothing in this module accepts an
    unvalidated string and re-labels it as a reason.
- criterion: A connector configuration draft declares a connector, a configuration,
    an unresolved list and a generated-credentials list, each of the two lists present
    and possibly empty.
  met: true
  how: ConnectorConfigurationDraft declares connector and configuration as required
    strings and unresolved / generated_credentials as required readonly arrays of
    the sibling value objects; a required readonly array type admits a zero-length
    array, so both are present and may be empty without a second, optional variant.
- criterion: A connector configuration draft admits a method mismatch as an optional
    element and is valid without one.
  met: true
  how: method_mismatch is declared with the `?` modifier on ConnectorConfigurationDraft,
    the only optional field on the type, so a draft with it absent is a fully valid
    value of the type.
- criterion: A connector configuration draft admits any number of capability references,
    including none.
  met: true
  how: Per the task's own recorded resolution, the capability relationship is not
    declared as a field of ConnectorConfigurationDraft at all -- nothing on the type
    constrains how many capabilities a later generator reads to resolve it, from none
    to many, and the type has no field through which a capability could be serialized.
- criterion: An unresolved item carries a name and exactly one reason drawn from the
    vocabulary.
  met: true
  how: ConnectorConfigurationDraftUnresolvedItem declares name as a required string
    and reason as a single (non-array) required ConnectorConfigurationDraftUnresolvedReason
    field -- exactly one reason, never a set of them.
- criterion: A generated credential carries the generated name and the security scheme's
    own name.
  met: true
  how: ConnectorConfigurationDraftGeneratedCredential declares name (the generated
    ${credential:<name>} name) and security_scheme (the scheme's own name in the OpenAPI
    document) as two required string fields.
- criterion: A method mismatch carries the registered method and the operation's method
    as two separate named values.
  met: true
  how: ConnectorConfigurationDraftMethodMismatch declares registered and operation
    as two separate required string fields, named after what each one is rather than
    sharing one field.
- criterion: No module of the draft's domain shape imports a framework, a driver or
    a provider client.
  met: true
  how: The one module this task writes, src/connector-registry/connector-configuration-draft.ts,
    has zero import statements, so it cannot import fastify, pg, @anthropic-ai/sdk,
    @modelcontextprotocol/sdk, jose or any other infrastructure package.
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: The module has no imports at all, so the lint step's dependency audit (which
    this standard's `decides` list binds to this constraint) finds no framework, driver
    or client reaching it.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraft declares connector, configuration, unresolved,
    generated_credentials and the optional method_mismatch exactly as the node's attribute
    list states. The node's `capability` relationship (0..*) is deliberately left
    off this type, per the task's own UNDERDETERMINED resolution -- it is realized
    only as an input a later generator reads (over the existing Capability type),
    never as a field this type's own serialization could expose, which is what keeps
    rules/integration/a-connector-configuration-draft-response-carries-no-capability
    answerable by a later task without a change here.
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraftUnresolvedItem declares name and reason exactly
    as the node states, reason typed as the closed vocabulary rather than a bare string.
- node: domain/integration/connector-configuration-draft-unresolved-reason
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS and the ConnectorConfigurationDraftUnresolvedReason
    union it derives declare exactly the closed set of four values the node enumerates,
    in the same order, and nothing else in this task states a reason of its own.
- node: domain/integration/connector-configuration-draft-generated-credential
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraftGeneratedCredential declares name and security_scheme
    exactly as the node states.
- node: domain/integration/connector-configuration-draft-method-mismatch
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraftMethodMismatch declares registered and operation
    exactly as the node states; the type is only ever attached through ConnectorConfigurationDraft's
    optional method_mismatch field, matching the node's presence condition being a
    later task's concern to compute, not this one's to enforce.
inferences:
- inferred: All five domain elements are declared together in one module (connector-configuration-draft.ts)
    rather than one file per type.
  from: The existing codebase's own precedent for a cohesive value-object-plus-vocabulary
    group -- capability.ts bundles CapabilityNature/CAPABILITY_NATURES with Capability,
    and http-connector-call-configuration.ts bundles HTTP_METHODS/HttpMethod with
    HttpConnectorCallConfiguration -- matching this task's own rationale that the
    five elements "are one task because they change for exactly one reason."
- inferred: No runtime type-guard function (e.g. an isConnectorConfigurationDraftUnresolvedReason)
    is declared in this task.
  from: The codebase's established split for a closed vocabulary -- the domain module
    declares only the array and the union (as capability.ts does for CapabilityNature
    and http-connector-call-configuration.ts does for HttpMethod); a runtime guard
    against an untrusted string is added only where a boundary that receives one is
    implemented (isCapabilityNature in persistence/relational-capability-store.repository.ts,
    isHttpMethod in investigation/http-declarative-observation-source.adapter.ts).
    No such boundary exists yet for the draft's unresolved reason, and building one
    is this task's own REMAINDER note pointing to "the later tasks that generate a
    draft's ... unresolved list."
- inferred: Type fields mirror the specification's own attribute names verbatim, including
    the snake_case multi-word ones (generated_credentials, security_scheme, method_mismatch).
  from: The codebase's existing precedent of snake_case fields on a domain type where
    the specification names a multi-word attribute (Capability's input_schema/output_schema,
    ConnectorConfiguration's connector/configuration), read as an established convention
    rather than a violation of the camelCase rule for functions and variables, which
    these type members are not.
deferred:
- what: Everything about how the draft's configuration text and its two lists (unresolved,
    generated_credentials) are actually derived from a chosen OpenAPI operation --
    byte-for-byte property matching, generated-name composition, method upper-casing,
    the two always-absent keys, and address/query/headers/body/Cookie positioning.
  why: This task declares types only; the task's own REMAINDER notes assign this to
    the later tasks that generate a draft's configuration text, unresolved list and
    generated-credentials list from one chosen operation.
- what: The method_mismatch's presence condition and case folding against the currently
    registered connector configuration.
  why: Assigned by the task's own REMAINDER note to the task computing the method
    mismatch (rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered).
- what: The four refusals a later fetch/read/publish path must raise (unfetchable
    link with its 60000ms bound, malformed/unsupported document, no-such-operation,
    and their HTTP status/error values).
  why: Assigned by the task's own REMAINDER note to the tasks that fetch the document,
    read the operation and publish the HTTP surface -- no such module exists yet in
    this task's scope.
- what: A runtime guard validating an untrusted string against ConnectorConfigurationDraftUnresolvedReason.
  why: No boundary reading such a string exists yet; building the guard without a
    caller for it would be structure nobody can point to a trigger for. Left for whichever
    later task first needs to validate one.
---

## What it is

The domain module every later draft task in this epic builds its own shape from -- the draft value object, its unresolved item, its generated credential, its method mismatch, and the one closed vocabulary of unresolved reasons.

## Notes

The capability relationship the specification's domain node declares (0..* reference) is not a field of this type; it is realized only as an input a later generator reads, per the task's own UNDERDETERMINED resolution, so that rules/integration/a-connector-configuration-draft-response-carries-no-capability stays answerable without a change to this module.
