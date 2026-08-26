---
contract_version: siegard-reconcile/1
title: Backend files re-checked after the timeout-positivity, malformed-configuration and credential-masking
  analyse
summary: A just-committed /analyse (b6012c3) added a positivity requirement to rules/integration/a-capability-declares-its-contract's
  timeout clause, extended rules/integration/a-connector-configuration-holds-a-well-formed-object to classify
  a null value or an array as not-well-formed and an entirely absent configuration as incomplete, and
  wrote a new node, rules/integration/a-diagnostic-response-masks-a-resolved-credential, for the diagnostic
  route's credential masking. All three facts were confirmed against the current source line-by-line before
  being decided; the code already implements each one exactly.
target: backend
files:
- path: src/http/dto/register-capability.dto.ts
  change: unchanged since the previous reconciliation; re-checked because rules/integration/a-capability-declares-its-contract's
    text moved to add the positivity clause its own .positive() bound already implements
- path: src/capability-registry/capability-registry.service.ts
  change: unchanged; re-checked for the same reason — its own refuseContractDepartures comment describes
    only the non-integer timeout boundary, not the new positivity one
- path: src/capability-registry/capability.ts
  change: unchanged; re-checked for the same reason — carries only vocabulary (types, the default constant),
    states nothing about the positivity check either way
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: unchanged; re-checked because rules/integration/a-connector-configuration-holds-a-well-formed-object's
    text moved to add the null/array-malformed and absent-incomplete classification wellFormedConfiguration/registrationProblems
    already implement
- path: src/http/test-connector.controller.ts
  change: unchanged; re-checked against the brand-new rules/integration/a-diagnostic-response-masks-a-resolved-credential,
    which its own REDACTED_CREDENTIAL_MARKER/redactingEnv mechanism already implements
nodes:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: '[src/http/dto/register-capability.dto.ts] the schema''s own 400 VALIDATION_ERROR envelope covers
    every declared-but-malformed field including the non-integer and (now) non-positive timeout.'
  encoded_at:
  - src/http/dto/register-capability.dto.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: '[src/http/dto/register-capability.dto.ts] wire shapes for the register-capability operation match
    the contract. [src/capability-registry/capability-registry.service.ts] the class exposes all four
    declared operations.'
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  - src/capability-registry/capability-registry.service.ts
- node: constraints/listings-are-paged
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] listCapabilities reads offset/limit from
    the caller''s PaginationRequest, no default/max asserted here. [src/connector-registry/connector-configuration-registry.service.ts]
    listConnectorConfigurations/pageCountOf do the same.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] readCapabilityByIdentityOrThrow throws
    CapabilityIdentityNotFoundError on a miss.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/capability
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] heldCapability returns every declared
    attribute unchanged. [src/capability-registry/capability.ts] the Capability type declares every attribute
    required, none optional.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
- node: domain/integration/capability-registry
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] registerCapability/readCapability implement
    the create-or-replace and one-capability-per-concept resolution.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] refuseMalformedSchemas/isWellFormedJson
    filter both schema attributes.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] heldCapability throws CapabilityNotReadOnlyError
    for a non-read-only nature.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: '[src/capability-registry/capability-registry.service.ts] refuseAnsweredConcept/readCapability
    refuse a second capability answering an already-answered concept.'
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/capability-nature
  conforms: true
  how: '[src/capability-registry/capability.ts] CAPABILITY_NATURES matches the enumeration verbatim.'
  encoded_at:
  - src/capability-registry/capability.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] every import is a relative
    path into this same source tree, no framework or driver.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] the class exposes all three
    published operations by name and behavior.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] heldConfiguration holds exactly
    the two declared attributes, configuration always resolved to JSON object text. [src/http/test-connector.controller.ts]
    resolveTestedConnectorConfiguration reads and parses the same held text.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/test-connector.controller.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] registerConnector replaces
    whole by connector name after well-formedness is checked.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: '[src/connector-registry/connector-configuration-registry.service.ts] readConnectorConfigurationOrThrow
    throws ConnectorConfigurationNotFoundError on a miss.'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: '[src/http/test-connector.controller.ts] no authentication mechanism declared or invoked anywhere
    in the request path.'
  encoded_at:
  - src/http/test-connector.controller.ts
- node: contracts/integration/connector-diagnostics
  conforms: true
  how: '[src/http/test-connector.controller.ts] writes nothing of its own; every dependency called is
    a read, matching the diagnostic-only contract.'
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: '[src/http/test-connector.controller.ts] resolveTestedCapability checks the capability lookup first,
    then compares the found capability''s connector against the request''s named connector.'
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: '[src/http/dto/register-capability.dto.ts] and [src/capability-registry/capability.ts] both conform
    (the DTO''s own .positive() bound matches the node''s new positivity clause exactly; capability.ts
    states no timeout bound at all and so does not contradict it). A finding stands against [src/capability-registry/capability-registry.service.ts]:
    refuseContractDepartures''s own doc comment (lines 192-204) describes only the non-integer timeout
    boundary and cites the schema as `z.number().int()`, naming nothing about positivity — stale now that
    the node''s statement reads "a positive integer count of milliseconds" and pairs the two refusals
    explicitly.'
  observed_at:
  - src/http/dto/register-capability.dto.ts
  - src/capability-registry/capability.ts
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: false
  how: '[src/connector-registry/connector-configuration-registry.service.ts]: two findings stand. First,
    wellFormedConfiguration''s own doc comment (lines 203-209) still says "the node does not clearly decide
    whether an entirely absent configuration is malformed or incomplete" — stale now that the node states
    exactly that classification. Second, and substantively: the node as just written names only null and
    an array as not-well-formed and only an entirely absent value as incomplete: it does not decide what
    a present-but-wrong-typed value (a boolean, a number) is. The code routes that case through the same
    ''configuration is not a plain object'' problem as an absent value, throwing IncompleteConnectorConfigurationError
    — a fact this reconciliation''s own /analyse left undecided.'
  observed_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  conforms: false
  how: '[src/http/test-connector.controller.ts] the masking behavior itself matches the node exactly (REDACTED_CREDENTIAL_MARKER,
    resolveConnectorRequest called a second time with a redacting environment substitute). The finding
    is the file''s own comment (lines 31-43, 62), which still says "no specification node or task criterion
    states" the masking and calls it "this controller''s own inference" — stale now that this node states
    it.'
  observed_at:
  - src/http/test-connector.controller.ts
notes: 'Judgment shape: 5 independent specification-conformance-reviewer delegations, one per file, run
  together. Each was handed its own file''s trace-bound node set plus, as candidates, the union of nodes
  bound across this 5-file batch and the three node identities the preceding /analyse (b6012c3) wrote
  or changed, explicitly named as written-since-bind. Three nodes carry findings and stay unbound this
  round; two of the three findings are comment-only (a stale self-description now contradicted by the
  node it describes) rather than a behavioral divergence, and are queued into the next citations-correction
  task alongside the two comment findings named in the prior report. The third — a present boolean-or-number
  connector-configuration value''s classification — is a genuine remaining gap this /analyse left undecided;
  the next invocation is a small follow-up /analyse over it before this node can close. All other nodes
  bound to these 5 files cleared and are rebound here, healing both the ''moved'' drift the preceding
  /analyse caused on rules/integration/a-capability-declares-its-contract and rules/integration/a-connector-configuration-holds-a-well-formed-object,
  and the ordinary ''code'' drift these files carried from the original 32-file batch.'
---
