---
target: backend
title: Confirm the registry's own 422 is already what these six requests reach
summary: Implementation record confirming register-capability.dto.ts's already-loosened shape
  schemas (delivered by register-capability-dto-refusal-order/reaches-the-registry-refusal) are
  what make all six criteria true, so this corrective task required no further source edit.
task: sha256:f4fbccc06a5c73b9b7664b090a69015cc4605b1723ff0fd2937f038a7ff57e42
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/http/dto/register-capability.dto.ts
  effect: Unchanged by this task. Its schemas already admit an absent/empty required attribute,
    an empty :name/:version path segment, an absent body, and any string nature (including one
    outside the capability-nature vocabulary), reaching registerCapability in every one of the
    six cases these criteria describe, per register-capability-dto-refusal-order/reaches-the-
    registry-refusal's own earlier delivery. No edit was needed or made.
criteria:
- criterion: A request with an out-of-vocabulary nature is asserted to answer 422 with
    CapabilityNotReadOnlyError, reaching registerCapability.
  met: true
  how: nature's schema is z.string().optional() with no enum and no .min(1), so any non-empty
    string reaches registerCapability, which throws CapabilityNotReadOnlyError for any nature
    other than 'read-only', mapped to 422 by the existing status map.
- criterion: A request whose body omits input_schema outright is asserted to answer 422 with
    IncompleteCapabilityContractError naming input_schema, reaching registerCapability.
  met: true
  how: input_schema is .optional(), so an omitted key passes shape validation; registerCapability's
    completeness check names it undeclared and throws IncompleteCapabilityContractError, 422.
- criterion: A request whose body omits output_schema outright is asserted to answer 422 with
    IncompleteCapabilityContractError naming output_schema, reaching registerCapability.
  met: true
  how: Same mechanism as input_schema, for output_schema.
- criterion: A request with a wholly empty body, on an otherwise valid :name and :version path, is
    asserted to answer 422 with IncompleteCapabilityContractError naming nature, input_schema,
    output_schema, connector and concept — every required attribute left undeclared by an empty
    body except timeout, which takes its default rather than being named — reaching
    registerCapability.
  met: true
  how: Every required body attribute is .optional(), so an empty body passes shape validation and
    the registry names every one of them (nature, input_schema, output_schema, connector, concept)
    undeclared; timeout takes its default rather than being named.
- criterion: A request with an empty :name path segment, and an otherwise complete body, is
    asserted to answer 422 with IncompleteCapabilityContractError naming name, reaching
    registerCapability.
  met: true
  how: name's schema dropped .min(1), so an empty path segment passes shape validation and the
    registry names it undeclared.
- criterion: A request with an empty :version path segment, and an otherwise complete body, is
    asserted to answer 422 with IncompleteCapabilityContractError naming version, reaching
    registerCapability.
  met: true
  how: Same mechanism as name, for version.
nodes:
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: Unchanged by this task; already encoded by register-capability-dto-refusal-order's
    delivery, confirmed still holding for the wholly-empty-body and empty-path-segment cases
    these criteria add.
- node: rules/integration/a-capability-is-read-only
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: Unchanged by this task. The DTO no longer intercepts an out-of-vocabulary nature at the
    shape layer, so the rule's own 422 CapabilityNotReadOnlyError refusal (enforced in
    capability-registry.service.ts, not touched by this task) is what actually decides the case.
- node: domain/integration/capability
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: Unchanged by this task; the attribute set and which are required stay exactly as
    register-capability-dto-refusal-order left them.
- node: constraints/the-register-capability-route-defers-completeness-to-the-registry
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: Unchanged by this task; this file is exactly what this constraint's statement describes —
    the route's declared shape requires no capability attribute present or non-empty.
- node: constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: Unchanged by this task; the file's nature schema is exactly what this constraint's
    statement describes — any string, not only the vocabulary, passes shape validation.
deferred:
- what: Rewriting the six now-false 400 assertions in
    src/__tests__/unit/http/register-capability.routes.spec.ts.
  why: The defect this task targets lives in test code, not production code. Fixing those
    assertions is this task's own proof step, not made in this implementation record.
run: run/register-capability-payload-notes-corrections-suite-5
---

## What it is

Confirms register-capability.dto.ts, unchanged, already makes all six criteria true, since
register-capability-dto-refusal-order/reaches-the-registry-refusal's earlier delivery already
loosened its shape schemas past the point these six cases test. No source edit was needed.

## Notes

None.
