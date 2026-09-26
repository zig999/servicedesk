---
target: frontend
title: Capability removal outcome disclosure states success, distinguishes the cited-by-evidence
  refusal, and stays silent while pending
summary: Hook-level tests over useCapabilityDetail establish that a removal answered with
  HTTP 204 states success naming the removed capability's name and version and that the identity
  is no longer registered, that a CapabilityCitedByEvidenceError refusal states both that
  nothing was removed and that collected evidence names the capability, that HTTP 400 VALIDATION_ERROR,
  HTTP 500 INTERNAL_ERROR and an unrecognised error code each state that nothing was removed
  through the identical generic message -- distinct only from the CapabilityCitedByEvidenceError
  statement, never from one another -- and that neither toast fires before the DELETE settles.
implementation: sha256:8d651c0b83ce6d42103135dc455e445adf740635d50436e9e3af1ecf0c178015
tests:
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: calls toast.success with a message naming the removed capability's own name and version
  proves: Criterion -- a removal answered with HTTP 204 is stated as success naming the removed
    capability's name and version.
  fails_when: toast.success is not called once the DELETE resolves 204, or its message omits
    the capability's own name or version.
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: states that the identity is no longer registered, not merely a generic confirmation
    naming it
  proves: UNDERDETERMINED note -- the success statement also states the identity is no longer
    registered, not merely a generic confirmation naming it.
  fails_when: 'The success message names the capability without also stating, in words, that
    the identity is no longer registered (e.g. "Done: some-capability v1").'
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: states both facts in the refusal toast
  proves: Criteria -- a CapabilityCitedByEvidenceError refusal states that nothing was removed
    and that collected evidence names the capability.
  fails_when: The HTTP 409 CapabilityCitedByEvidenceError refusal toast omits either "nothing
    was removed" or a reference to evidence.
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: states nothing was removed with a message distinct from the cited-by-evidence refusal's
    own statement (VALIDATION_ERROR)
  proves: Criteria -- a refusal answered with HTTP 400 VALIDATION_ERROR states that nothing
    was removed, distinct from the CapabilityCitedByEvidenceError statement.
  fails_when: The VALIDATION_ERROR refusal toast omits "nothing was removed", or is textually
    identical to the CapabilityCitedByEvidenceError refusal's own message.
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: states nothing was removed with a message distinct from the cited-by-evidence refusal's
    own statement (INTERNAL_ERROR)
  proves: Criteria -- a refusal answered with HTTP 500 INTERNAL_ERROR states that nothing
    was removed, distinct from the CapabilityCitedByEvidenceError statement.
  fails_when: The INTERNAL_ERROR refusal toast omits "nothing was removed", or is textually
    identical to the CapabilityCitedByEvidenceError refusal's own message.
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: states nothing was removed with a message distinct from the cited-by-evidence refusal's
    own statement (unrecognised code)
  proves: Criteria -- a refusal carrying an error code the surface does not recognise states
    that nothing was removed, distinct from the CapabilityCitedByEvidenceError statement.
  fails_when: The unrecognised-code refusal toast omits "nothing was removed", or is textually
    identical to the CapabilityCitedByEvidenceError refusal's own message.
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: produces one identical statement for all three, distinct only from the CapabilityCitedByEvidenceError
    statement -- fails over a reading that gives each of the three its own distinct statement
  proves: UNDERDETERMINED note, resolved to the implementation's own disclosed reading --
    the refusal statement merges HTTP 400 VALIDATION_ERROR, HTTP 500 INTERNAL_ERROR and an
    unrecognised error code into the identical generic message, kept apart only from the CapabilityCitedByEvidenceError
    statement. This demonstrates the implementation's own actual, legitimate choice under
    the note, as disclosed in the implementation record's own criteria table.
  fails_when: VALIDATION_ERROR, INTERNAL_ERROR and the unrecognised code do not all resolve
    to one identical message, or that shared message equals the CapabilityCitedByEvidenceError
    statement.
- file: src/hooks/use-capability-detail-removal-outcome.spec.ts
  name: calls neither toast.success nor toast.error before the DELETE settles, and states
    the outcome only once it does
  proves: Criterion -- while the removal has not been answered, the surface states neither
    success nor refusal.
  fails_when: Either toast fires before the DELETE promise resolves, or toast.success never
    fires once it resolves 204.
not_applicable:
- edge_case: The removal control's own confirm/cancel dialog and its gating of the DELETE
    call.
  why: Covered by the sibling capability-removal-control proof; this task starts from an already-issued
    DELETE and states only its answered outcome.
- edge_case: Navigation to /capabilities and cache invalidation after a successful removal.
  why: Pre-existing behavior this task preserves, not a criterion of outcome disclosure; no
    criterion requires proving it here.
untested:
- 'rules/integration/a-submitted-removal-states-its-outcome-to-the-operator: the node''s fact
  spans a concept''s, a capability''s and a connector configuration''s own removal; this task
  implements only the capability slice (its own REMAINDER notes assign the concept and connector-configuration
  clauses to sibling tasks), so no test here decides the rule whole. The capability slice
  itself is exercised by the criterion-derived tests above.'
- 'domain/integration/capability: an aggregate-root node declaring nine attributes (name,
  version, nature, both schemas, timeout, connector, concept, payload_notes) across every
  operation the registry publishes over the entity; this task''s tests confirm only that the
  removal-outcome message names the two identity attributes, name and version. No finite test
  decides the node''s whole fact.'
- 'rules/integration/a-registered-capability-cited-by-evidence-is-never-removed: states registry-side
  conditions (the evidence-citation guard, the HTTP 409 status and its own CapabilityCitedByEvidenceError
  value, and the unregistered-identity branch answered as an ordinary removal) that this frontend
  task does not implement; per the task''s own REMAINDER note, this task only reads the refusal
  the api has already answered, which the criterion-derived tests above exercise. The registry
  behavior the rule actually decides is untested here and belongs to the remove-capability
  route''s own backend implementation.'
- 'constraints/a-successful-capability-removal-answers-with-no-content: its own stated fitness
  is a backend-level test (removing a capability no evidence names, then an unregistered name
  and version, asserting each answer is HTTP 204 with an empty body); this frontend task only
  consumes an already-204 answer as its success trigger, and no test here decides the backend''s
  own no-body, whether-registered-or-not answer.'
- 'constraints/a-malformed-request-is-refused-with-a-validation-error: its own stated fitness
  is a backend-level test (a malformed path, a negative offset, a body missing a required
  field, each answered HTTP 400 VALIDATION_ERROR with a non-empty details list); this frontend
  task only maps that error code, once already answered, to a generic message, and does not
  decide what shape the backend itself refuses.'
- 'constraints/a-domain-error-unmapped-by-status-is-refused-generically: its own stated fitness
  is a backend-level test asserting the fixed message and no leaking context on an HTTP 500
  answer; this frontend task only maps INTERNAL_ERROR, once already answered, to its own generic
  message.'
- The exact copy of the generic fallback message and the success message beyond the required
  substrings ("no longer registered", "nothing was removed", "evidence") is the implementation's
  own wording; no criterion pins it further.
- Whether a status code other than 400/500/409/422 combined with a recognised code, or a recognised
  code combined with an unexpected status, resolves through the same generic path -- no criterion
  names that combination and no test isolates it.
run: run/delete-gaps-ui-remaining-six-suite-4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for a capability removal's outcome disclosure -- success, CapabilityCitedByEvidenceError distinguished from every other refusal, silence while pending.

## Notes
One UNDERDETERMINED-derived test originally asserted a three-way-distinct refusal reading the implementation never took; the implementation's own disclosed choice merges HTTP 400/500/unrecognised into one message, kept apart only from CapabilityCitedByEvidenceError. The test was corrected to demonstrate the implementation's actual, legitimate reading rather than assert against it.
