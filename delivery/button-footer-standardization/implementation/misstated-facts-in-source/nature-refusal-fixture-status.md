---
target: frontend
title: Nature-refusal fixture corrected to HTTP 422
summary: The one stand-in in the frontend suite that built CapabilityNotReadOnlyError with a status now carries 422, the value rules/integration/a-capability-is-read-only states.
task: sha256:57e82a099b998d6d207d06d3cb10d2c7d459c9e0b97edbc5ea3856c181f3ff49
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/misstated-facts-in-source-nature-refusal-fixture-status-build
files:
- path: src/routes/capability-detail-screen-outcome.spec.ts
  effect: The fixture at the PUT handler for CAPABILITY_PATH now calls errorResponse("CapabilityNotReadOnlyError", 422) instead of 409, so the stand-in refusal the test drives the screen through carries the status the registry actually answers that refusal with.
criteria:
- criterion: The stand-in refusal carrying CapabilityNotReadOnlyError in the capability detail surface's outcome proof responds with HTTP 422.
  met: true
  how: src/routes/capability-detail-screen-outcome.spec.ts:28 now reads errorResponse("CapabilityNotReadOnlyError", 422), replacing the literal 409 that stood there before.
- criterion: No stand-in in the frontend suite builds CapabilityNotReadOnlyError with a status other than 422.
  met: true
  how: A search across the target for CapabilityNotReadOnlyError found exactly one place pairing it with an HTTP status — the fixture at src/routes/capability-detail-screen-outcome.spec.ts:28, now 422. The other two occurrences, in src/services/error-ui-state.ts and its spec, construct an ApiError, whose constructor in src/services/api-client.ts carries a code and a message and no status field at all, so no other stand-in builds this error with any status.
- criterion: That proof still asserts the refusal reaches the operator as a statement naming the read-only condition, told apart from a refusal whose condition the surface does not recognise.
  met: true
  how: The same describe block in src/routes/capability-detail-screen-outcome.spec.ts still holds both `it` blocks unchanged — one asserting the named-condition message for CapabilityNotReadOnlyError, the other asserting the generic fallback message for an unrecognised SomeUpstreamRefusal code — and neither assertion nor test structure was touched beyond the one literal.
nodes:
- node: rules/integration/a-capability-is-read-only
  encoded_at:
  - src/routes/capability-detail-screen-outcome.spec.ts
  how: The rule states the refusal of a capability whose nature is not read-only as an HTTP 422 response reporting a CapabilityNotReadOnlyError. This delivery brings the one frontend stand-in of that refusal into agreement with that value; it implements no other clause of the rule.
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  encoded_at:
  - src/routes/capability-detail-screen-outcome.spec.ts
  how: Criterion 3 answers the narrow slice of this rule's refused-outcome clause that this task reaches — that the read-only-nature refusal is stated distinguishably from a refusal whose condition the surface does not recognise — which the proof already asserted and continues to assert unchanged. Every other clause of this rule is a remainder this task does not implement, as the task's own Notes record.
preserved:
- The two existing `it` blocks in src/routes/capability-detail-screen-outcome.spec.ts, their names, their toast.error assertions and the SomeUpstreamRefusal fallback case, none of which this fix touched beyond the one literal.
- errorResponse's own default status of 500 and its signature in src/routes/capability-detail-screen.test-support.ts, left untouched since the fixture already passed its status explicitly.
---

## What it is
One literal in one stand-in: the PUT handler that refuses a capability save for a nature that is not read-only answered 409, and the specification states 422 for that refusal.
Nothing else in the file changed, and no other stand-in in the target pairs that error with a status.

## Notes
The one file this task's criteria reach is a spec file, so the source this delivery wrote sits inside a test file, and it was written by the implementer rather than by a test author.
That does not collapse the two producers: what the implementer wrote is the stand-in the criteria name, and the proof over it is a separate judgment in a separate context, which is where the separation actually lives rather than in a file's extension.
The two other occurrences of CapabilityNotReadOnlyError in the target construct an ApiError, whose constructor carries a code and a message and no status field, which is why criterion 2 holds over the whole target after a single edit.
The build run covered every step the registry declares except the suite, and all seven passed.
