---
target: backend
title: register-capability.dto.ts's required attributes reach the registry's own completeness refusal
summary: Loosened register-capability.dto.ts's shape schemas so an absent or empty required
  attribute (name, version, nature, input_schema, output_schema, connector, concept) passes the
  route's shape validation unchanged and is refused instead by capability-registry.service.ts's
  existing IncompleteCapabilityContractError, mapped to HTTP 422 by the existing status map.
task: sha256:171837a75fb13e77a357c5d98334f6dbcb1dc3e3693a769e6f0e32a32783347d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/register-capability-payload-notes-corrections-suite-5
files:
- path: src/http/dto/register-capability.dto.ts
  effect: >-
    registerCapabilityParamsSchema's name and version drop .min(1), keeping only the string-type
    check. registerCapabilityBodySchema's nature, input_schema, output_schema, connector and
    concept each drop .min(1) and become .optional(), and nature's schema changes from
    z.enum(CAPABILITY_NATURES) to z.string().optional() — so an absent key or an empty string on
    any of these now passes shape validation instead of failing it, letting the request reach
    registerCapability. timeout and payload_notes are unchanged. The now-unused
    CAPABILITY_NATURES import is removed.
criteria:
- criterion: A PUT /v1/capabilities/{name}/{version} submission whose body omits a required
    attribute (e.g. connector) is answered with HTTP 422 IncompleteCapabilityContractError naming
    that attribute, not HTTP 400 VALIDATION_ERROR.
  met: true
  how: connector (and every other loosened attribute) is now .optional() in
    registerCapabilityBodySchema, so an omitted key passes shape validation and reaches
    registerCapability. capability-registry.service.ts's heldCapability calls
    refuseContractDepartures first, whose contractProblems finds connector undeclared and throws
    IncompleteCapabilityContractError naming it; the status map already maps that class to 422.
- criterion: A PUT /v1/capabilities/{name}/{version} submission whose body states a required
    attribute as an empty string is answered with HTTP 422 IncompleteCapabilityContractError
    naming that attribute, not HTTP 400 VALIDATION_ERROR.
  met: true
  how: The attribute's schema is now z.string().optional() with no .min(1), so an empty string is
    a valid string and passes shape validation. isUndeclared(value) treats '' the same as
    undefined, so contractProblems names the attribute exactly as for the absent case.
- criterion: A PUT /v1/capabilities/{name}/{version} submission whose body states every required
    attribute, and whose payload_notes is left undeclared, is accepted and the held capability
    answers with no payload_notes value.
  met: true
  how: payload_notes was already .optional() and is unchanged; when every required attribute is
    declared, shape validation passes exactly as before, and heldCapability's existing
    isUndeclared branch omits the key.
- criterion: The route's shape validation still refuses a submission whose required attribute
    holds the wrong type (e.g. timeout as a non-numeric string), independent of this change.
  met: true
  how: timeout's schema (z.number().int().positive().optional()) is unchanged; a string value
    still fails the z.number() check, so shape validation still fails and the route's existing
    400 VALIDATION_ERROR branch still answers it.
nodes:
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: This node's refusal is enforced by capability-registry.service.ts, unchanged; the DTO
    change removes the shape layer's own competing enforcement of the same undeclared concept, so
    the node's own stated refusal is what decides the case.
- node: domain/integration/capability
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: The DTO change only stops the shape layer from enforcing non-emptiness on the required
    attributes ahead of the registry, so which attributes are required is decided in exactly one
    place, matching this node.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: The route's shape validation still answers 400 VALIDATION_ERROR for any value failing the
    DTO's remaining type checks; this constraint's own fitness demonstration for
    register-capability specifically no longer holds since a missing required attribute is now a
    domain refusal, disclosed as a divergence below.
inferences:
- inferred: Dropped non-emptiness enforcement on name and version, not just the body attribute
    the criteria illustrate with (connector).
  from: The task's own scope names all seven of REQUIRED_REGISTRATION_ATTRIBUTES as the set
    losing non-emptiness enforcement, and REQUIRED_REGISTRATION_ATTRIBUTES treats name and version
    identically to the other five for the completeness check.
- inferred: Replaced nature's z.enum(CAPABILITY_NATURES) with z.string().optional() rather than
    keeping the enum and only relaxing its presence.
  from: capability-registry/capability.ts's CapabilityRegistration already types nature as a
    plain optional string, not the enum, and capability-registry.service.ts's own
    registration.nature !== READ_ONLY_NATURE check already refuses any nature other than exactly
    'read-only' regardless of vocabulary membership, so no protection is lost by deferring the
    value check to that existing line.
- inferred: Left timeout's type and its .optional() unchanged.
  from: The task's own Notes mark the absent-timeout and positive-bound questions as
    UNDERDETERMINED, and criterion 4 exercises only a non-numeric timeout.
divergences:
- from: constraints/a-malformed-request-is-refused-with-a-validation-error
  departure: An absent or empty name, version, nature, input_schema, output_schema, connector or
    concept is no longer refused at this route's validation boundary; it now passes shape
    validation and is refused only once capability-registry.service.ts is reached, contrary to
    that constraint's fitness demonstration ("a body missing a required field" answered 400).
  why: rules/integration/a-capability-declares-its-contract requires the registry itself to
    answer with one refusal naming every undeclared required attribute; duplicating that
    completeness check at the boundary would mean the boundary either reimplements
    REQUIRED_REGISTRATION_ATTRIBUTES and isUndeclared or diverges from the registry's own list the
    day one of the two is edited without the other. The specification's rule takes precedence
    over the standard's boundary rule for this one route, recorded as the new architecture
    constraints the-register-capability-route-defers-completeness-to-the-registry and
    the-register-capability-route-defers-the-nature-vocabulary-to-the-registry.
preserved:
- timeout's type check and lower bound, and its optional presence with the registry's own
  sixty-second default.
- payload_notes's optional presence and its pass-through of an empty string, unchanged.
- CapabilitySchemaNotWellFormedError, MalformedCapabilityInputSchemaError,
  ConnectorPlaceholderOutsideInputSchemaError and ConceptAlreadyAnsweredError refusals, unchanged.
- CapabilityNotReadOnlyError's refusal of any nature other than read-only, unchanged.
- The route's 400 VALIDATION_ERROR envelope for any remaining shape/type failure.
---

## What it is

register-capability.dto.ts's shape schemas no longer enforce non-emptiness on the required
attributes, so an absent or empty one reaches the registry's own completeness refusal instead of
a generic shape refusal.

## Notes

None.
