---
title: Non-integer capability timeout is refused by the route's declared shape, not the service's contract-completeness
  check
summary: Removes the service-level misclassification of a declared-but-malformed capability timeout as
  an undeclared-attribute (422) refusal, leaving the route's own Zod shape validation (400 VALIDATION_ERROR)
  as the one mechanism that refuses it.
task: sha256:5e459d878e7640a9b25379a1e82268192e7398ab2dce08505d7ff399f585842c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/capability-timeout-contract-refusal-non-integer-timeout-refusal-build
files:
- path: src/capability-registry/capability-registry.service.ts
  effect: contractProblems() now checks only REQUIRED_REGISTRATION_ATTRIBUTES for absence-or-empty-string
    ("undeclared"), exactly as rules/integration/a-capability-declares-its-contract defines that word;
    the prior extra check that pushed 'timeout is not an integer count of milliseconds' and caused refuseContractDepartures
    to throw IncompleteCapabilityContractError (422) for a present, non-integer timeout is removed. refuseContractDepartures's
    doc comment now states, and cites, why that value never reaches this refusal.
- path: src/http/dto/register-capability.dto.ts
  effect: No behavioral change — the pre-existing registerCapabilityBodySchema's timeout:z.number().int().positive().optional()
    already refuses a decimal number and a numeric string alike with this route's own 400 VALIDATION_ERROR
    envelope. The header comment now documents that this is the mechanism answering this corrective task's
    criteria, citing the two nodes it implements, so a reader does not have to infer it from the schema
    alone.
criteria:
- criterion: Registering a capability whose timeout is a decimal number is refused rather than registered.
  met: true
  how: registerCapabilityBodySchema's timeout:z.number().int() fails Number.isInteger for a decimal value;
    registerCapabilityHandler in register-capability.routes.ts (pre-existing, unmodified) answers the
    failed safeParse with 400 {error:{code:'VALIDATION_ERROR',...}} before registerCapability is ever
    called.
- criterion: Registering a capability whose timeout is a numeric string is refused rather than registered.
  met: true
  how: registerCapabilityBodySchema's timeout:z.number() itself rejects a value whose runtime type is
    not number — a JSON string fails the type check independent of .int()/.positive() — producing the
    same 400 VALIDATION_ERROR envelope, again before registerCapability is reached.
- criterion: Every non-integer timeout value tested is refused with the same stated HTTP status and the
    same named error, rather than each falling through to a different or default response.
  met: true
  how: 'Both the decimal and the numeric-string case fail the one registerCapabilityBodySchema.safeParse()
    call, and registerCapabilityHandler answers every such failure through the identical branch — reply.code(400).send({error:{code:''VALIDATION_ERROR'',
    message:''the request body failed validation'', details: issues}}) — so both land on the same status
    and the same named error rather than on different or unmapped responses. Removing capability-registry.service.ts''s
    own conflicting 422 check also closes the one path that could have answered a non-integer timeout
    with a different status/error had it ever been reached.'
- criterion: The refusal is distinct from the registry's response to a capability that declares no timeout
    at all, which still takes the sixty-second default.
  met: true
  how: timeout stays z.number().int().positive().optional() — an absent timeout passes the schema untouched
    (optional() short-circuits before int()/positive() ever run) and reaches capability-registry.service.ts's
    heldCapability(), whose `registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS` defaults it to 60000,
    an entirely different code path from the 400 refusal above and unaffected by this delivery's change.
nodes:
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: The node's own wording — "an attribute that is absent or an empty string is undeclared" — is now
    what contractProblems() checks and nothing more; a present, non-integer timeout is not undeclared
    by that wording, so it no longer trips the node's own HTTP 422 IncompleteCapabilityContractError refusal,
    which stays reserved for the absent/empty case this node names (the already-delivered remainder this
    task's Notes point to).
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/dto/register-capability.dto.ts
  how: registerCapabilityBodySchema's timeout:z.number().int().positive().optional() is exactly this constraint's
    "route's declared shape" for the register-capability route; a decimal or a numeric-string timeout
    fails it and register-capability.routes.ts's registerCapabilityHandler (pre-existing, unmodified,
    so not listed under files) answers with the constraint's own HTTP 400/VALIDATION_ERROR envelope, naming
    which of path/body failed and listing every issue, before registerCapability is ever reached.
inferences:
- inferred: The corrective change this task needed was removing capability-registry.service.ts's own non-integer-timeout
    branch from contractProblems(), not any change to register-capability.dto.ts's validation logic (which
    already refused both tested shapes with 400 before this task).
  from: The task's own "What it is" locates the refusal at "the route's declared shape" (HTTP 400, VALIDATION_ERROR),
    and rules/integration/a-capability-declares-its-contract's own wording restricts "undeclared" — the
    only case its 422 refusal covers — to an absent or empty-string value; a present, non-integer value
    is neither, so the service's pre-existing extra check was applying that node's 422 refusal to a case
    its own text does not cover. Since the route's Zod schema already intercepts every case this task's
    criteria test before the service is ever reached over HTTP, the service's own check was both unreachable
    in the row that matters and wrong per the node's wording for the row it was reachable in (a direct,
    non-HTTP call to registerCapability) — removing it is what makes the service's own behavior conform
    to the node exactly as written, rather than exceeding it.
- inferred: No change to registerCapabilityBodySchema's timeout validator itself was needed — .int().positive().optional()
    already satisfies all four criteria as written, so this task's own work is documentation of that fact
    plus the service-side correction, not a new validation rule.
  from: Direct reading of z.number().int().positive().optional()'s runtime behavior — z.number() alone
    rejects a numeric string by type, and .int() alone rejects a decimal — verified against the existing
    "answers 400 for a timeout of 0" test in register-capability.routes.spec.ts, which already proves
    this same schema field refusing a boundary value with the identical 400/VALIDATION_ERROR shape this
    task's criteria ask for.
preserved:
- capability-registry.service.ts's undeclared-required-attribute refusal (name, version, nature, input_schema,
  output_schema, connector, concept absent-or-empty → 422 IncompleteCapabilityContractError) is unchanged
  in every branch but the removed timeout one.
- The absent-timeout default of 60000ms in heldCapability() is unchanged.
- registerCapabilityBodySchema's other fields (nature enum, input_schema/output_schema non-empty, connector/concept
  non-empty) and its timeout:0 → 400 refusal (the .positive() check) are unchanged.
- CapabilitySchemaNotWellFormedError, CapabilityNotReadOnlyError and ConceptAlreadyAnsweredError's refusal
  order and behavior in registerCapability/heldCapability are unchanged.
deferred:
- what: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts's existing test "refuses
    a stated timeout that is not an integer count of milliseconds" (registering completeRegistration({timeout:0.5})
    directly against the service and asserting IncompleteCapabilityContractError) now asserts behavior
    this delivery deliberately removed — that call now succeeds and registers the capability with timeout:0.5,
    since no node holds a service-level refusal for a declared, non-integer timeout reached other than
    through the route this task's criteria are about.
  why: Writing or rewriting a test is the test-author's own judgment, not this implementation's; flagging
    it here is so the coverage/conformance passes do not read the pre-existing test's continued failure
    as a defect this delivery introduced silently. Whether a direct, non-HTTP caller of registerCapability
    should also be refused for a non-integer timeout is a question no node in this task's implements answers
    — constraints/a-malformed-request-is-refused-with-a-validation-error is scoped to "every route," and
    rules/integration/a-capability-declares-its-contract's own 422 refusal is scoped to "undeclared" —
    so extending either to cover that path is outside what this task was cut to settle.
---

## What it is

A capability registration whose timeout attribute is present but not an integer count of milliseconds is refused by the route's own declared shape (HTTP 400, VALIDATION_ERROR) rather than by the service's contract-completeness check.

## Notes

None.
