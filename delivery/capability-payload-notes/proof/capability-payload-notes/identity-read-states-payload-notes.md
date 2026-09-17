---
target: backend
title: Identity-keyed capability read admits and answers payload_notes correctly
summary: Tests establishing that read-capability-by-identity answers payload_notes
  exactly as the registration holds it -- present as declared text, absent (never
  empty or substituted) where none was declared -- including a stored empty string,
  once a code defect the suite caught was corrected -- and drawn from the current
  store rather than a register-capability submission; and that its response schema
  admits payload_notes alone as optional while still refusing every other declared
  attribute absent.
implementation: sha256:b5734fd254277b5a5c704dcb15b8b4ecaed7c724ce9ff8fbe702b1eed220ff05
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-identity-read-states-payload-notes-suite-2
tests:
- file: __tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 200 with the capability currently registered under the named (name,
    version) identity, carrying its whole declared contract
  proves: The identity read of a capability registered with payload notes answers
    that same text.
  fails_when: The route or controller drops, empties, or substitutes the registered
    payload_notes text (or any other declared attribute) instead of echoing exactly
    what the resolved capability holds.
- file: __tests__/unit/http/read-capability-by-identity.routes.spec.ts
  name: answers 200 with no payload_notes key in the body when the registered capability
    carries none, never an empty or substituted value
  proves: The identity read of a capability registered without payload notes answers
    no payload_notes value, rather than an empty or substituted one.
  fails_when: The answered JSON body carries a payload_notes key at all (empty string,
    null, or any other value) for a capability registered without payload notes.
- file: __tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
  name: does not refuse an answer in which payload_notes stands absent and every other
    declared attribute stands present
  proves: The answer's own validation does not refuse an answer in which payload_notes
    stands absent and every other declared attribute stands present.
  fails_when: readCapabilityByIdentityResponseSchema.safeParse rejects an otherwise-complete
    answer object solely because it omits payload_notes.
- file: __tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
  name: refuses an answer in which %s stands absent, since payload_notes is the only
    attribute this schema admits absent (one case per nature, input_schema, output_schema,
    timeout, connector, concept)
  proves: The answer's own validation refuses an answer in which nature, input_schema,
    output_schema, timeout, connector or concept stands absent, so payload_notes is
    the only attribute admitted absent.
  fails_when: readCapabilityByIdentityResponseSchema.safeParse accepts an answer missing
    any one of nature, input_schema, output_schema, timeout, connector or concept.
- file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers the payload_notes the store currently holds at (name, version), never
    the text an earlier register-capability submission carried, once the store has
    since changed independently of that submission
  proves: The payload_notes the identity read answers is drawn from the registration
    standing at that name and version, never from the content a register-capability
    submission carried.
  fails_when: readCapabilityByIdentityOrThrow answers the payload_notes text originally
    submitted through register-capability instead of the text the store currently
    holds at that identity.
- file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: treats a stored registration whose payload_notes is the empty string as one
    holding no payload notes, never answering payload_notes as ''
  proves: rules/integration/a-capability-declares-its-contract's clause that an attribute
    absent or an empty string is undeclared, applied to a read of a row whose stored
    payload_notes is literally the empty string -- originally recorded as demonstrating
    an UNDERDETERMINED gap, and now passing once a failure-diagnostician's finding
    against that same clause was applied to toCapability()'s guard.
  fails_when: toCapability() spreads a stored empty-string payload_notes onto the
    returned Capability instead of omitting the key, regressing the fix applied to
    this task's own implementation.
untested:
- 'domain/integration/capability: no test in this proof decides the node''s fact whole.
  This task''s own tests exercise only the payload_notes-optional fragment of the
  identity-read response DTO; the rest of the aggregate''s shape and behavior is established
  by sibling tasks'' own tests.'
- 'rules/integration/a-capability-declares-its-contract: no test in this proof decides
  the invariant whole. Per the task''s own REMAINDER note, this task reaches only
  the absent-or-empty-string-is-undeclared clause; the timeout default, the positive-integer
  bound and the 422 refusal belong to the sibling registration task.'
- 'rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them:
  no test in this proof decides the policy whole. Per the task''s own REMAINDER note,
  almost the entirety of this policy governs an operator-facing surface''s own rendering,
  which no backend-only test can reach.'
- The inference that payload_notes on readCapabilityByIdentityResponseSchema is z.string().optional()
  with no .min(1) is a decision the implementation recorded as an inference, not a
  criterion; no test pins that specific choice of shape.
not_applicable:
- edge_case: A boundary or range value (e.g., the sixty-second timeout default, the
    positive-integer millisecond bound)
  why: These clauses of rules/integration/a-capability-declares-its-contract are explicitly
    named in this task's own REMAINDER note as reaching only the sibling registration
    task.
- edge_case: A duplicate registration or a uniqueness violation
  why: No criterion of this task concerns uniqueness.
- edge_case: An operation attempted against state that forbids it
  why: The identity read has no state machine of its own to forbid an operation against.
- edge_case: Two operations against one subject at once (concurrency)
  why: No criterion states a compare-and-swap or locking requirement for the identity
    read.
- edge_case: A dependency that is unavailable, slow, or answers in an unexpected shape
  why: Already covered by a pre-existing, unmodified test on the not-found path.
- edge_case: An empty collection where one comes back
  why: The identity read answers a single resource keyed by (name, version), never
    a collection.
- edge_case: Absent or empty :name/:version path segments
  why: Governed by pre-existing, unmodified request-side validation; unrelated to
    payload_notes.
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts's
    pre-existing test asserting the response carries every one of the schema's declared
    keys had its shared fixture strengthened to declare payload_notes too, disclosed
    on the implementation record.
  why: Recorded here as well since this proof's own first test relies on that fixture.
---

## What it is

Tests prove read-capability-by-identity answers payload_notes exactly as the registration holds it -- present where declared, absent (never empty or substituted) where not, including the empty-string-stored edge case once corrected, and drawn from the current store rather than a stale submission -- and that the response schema admits payload_notes alone as optional while still refusing every other declared attribute absent.

## Notes

The test originally written to demonstrate an UNDERDETERMINED gap now passes: a failure-diagnostician judged the gap resolvable directly from rules/integration/a-capability-declares-its-contract's existing "absent or empty is undeclared" clause, and the one-line correction was applied to the implementation rather than left open.
