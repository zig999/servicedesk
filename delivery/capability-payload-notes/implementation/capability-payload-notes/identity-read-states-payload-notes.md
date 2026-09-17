---
target: backend
title: Identity-keyed capability read admits payload_notes, absent only where none
  was registered
summary: read-capability-by-identity's response contract now declares payload_notes
  as the one optional attribute, letting an already-fresh, already-pass-through read
  answer it exactly as the registration holds it, with the repository's own read path
  corrected to treat a stored empty string as no payload_notes at all.
task: sha256:791c7200fbf129014db64e2fd8886727c9d7f4e0dbcc1459509bbe564b6249a5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-identity-read-states-payload-notes-build-4
files:
- path: src/http/dto/read-capability-by-identity.dto.ts
  effect: readCapabilityByIdentityResponseSchema gains payload_notes as z.string().optional(),
    placed after concept; every other field (name, version, nature, input_schema,
    output_schema, timeout, connector, concept) is unchanged and still required, so
    payload_notes is the schema's one attribute admitted absent.
- path: __tests__/unit/http/read-capability-by-identity.routes.spec.ts
  effect: Added payload_notes to the shared heldCapability() test fixture, so the
    pre-existing test asserting the response carries every one of the schema's declared
    keys once again gets a fixture that actually declares all of them, payload_notes
    included.
- path: src/persistence/relational-capability-store.repository.ts
  effect: 'toCapability''s payload_notes guard now reads row.payload_notes !== null
    && row.payload_notes !== '''' instead of row.payload_notes !== null, so a stored
    empty string reads back as no payload_notes property at all rather than as payload_notes:
    '''' -- matching the domain''s absent-or-empty-is-undeclared convention. One-line
    correction to a file this task''s criteria depend on but did not itself modify,
    made from a failure-diagnostician''s finding against this task''s own suite run.'
criteria:
- criterion: The identity read of a capability registered with payload notes answers
    that same text.
  met: true
  how: relational-capability-store.repository.ts's toCapability() carries row.payload_notes
    straight onto the returned Capability when the stored value is neither null nor
    the empty string, and read-capability-by-identity.controller.ts returns that object
    untransformed.
- criterion: The identity read of a capability registered without payload notes answers
    no payload_notes value, rather than an empty or substituted one.
  met: true
  how: toCapability() spreads payload_notes onto the Capability object only when the
    stored row's value is neither null nor the empty string, omitting the key entirely
    otherwise; both a null-stored and an empty-string-stored row now answer with the
    key absent.
- criterion: The answer's own validation does not refuse an answer in which payload_notes
    stands absent and every other declared attribute stands present.
  met: true
  how: payload_notes is declared with .optional() and no other constraint in readCapabilityByIdentityResponseSchema,
    so an object holding every other field and omitting payload_notes satisfies the
    schema.
- criterion: The answer's own validation refuses an answer in which nature, input_schema,
    output_schema, timeout, connector or concept stands absent, so payload_notes is
    the only attribute admitted absent.
  met: true
  how: name, version, nature, input_schema, output_schema, timeout, connector and
    concept keep their pre-existing non-optional declarations; only payload_notes
    carries .optional().
- criterion: The payload_notes the identity read answers is drawn from the registration
    standing at that name and version, never from the content a register-capability
    submission carried.
  met: true
  how: Unchanged by this task -- the controller's dependency resolves to CapabilityRegistryService.readCapabilityByIdentityOrThrow,
    which calls store.readCapabilities() fresh on every call.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/http/dto/read-capability-by-identity.dto.ts
  how: The identity read's response contract now mirrors the aggregate's own attribute
    list including payload_notes at required:false.
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/http/dto/read-capability-by-identity.dto.ts
  - src/persistence/relational-capability-store.repository.ts
  how: 'This task reaches only the clause that an attribute absent or an empty string
    is undeclared. The response schema admits payload_notes absent; the repository''s
    toCapability() now also honors the same clause on the read side, treating a stored
    empty string as undeclared rather than surfacing payload_notes: ''''.'
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  encoded_at:
  - src/http/dto/read-capability-by-identity.dto.ts
  how: This task reaches only the read-side premises this policy presupposes -- the
    identity read answering every declared attribute exactly as the registration holds
    it, payload_notes standing absent exactly where the answer carried none.
inferences:
- inferred: payload_notes on the response schema is z.string().optional() with no
    .min(1).
  from: 'register-capability.dto.ts''s own payload_notes: z.string().optional() for
    the same attribute on the request side.'
- inferred: payload_notes is placed as the schema's last field, after concept.
  from: register-capability.dto.ts's own field order.
- inferred: relational-capability-store.repository.ts's toCapability() guard was corrected
    to exclude the empty string alongside null, so a stored empty string reads back
    as no payload_notes property.
  from: A failure-diagnostician's finding from this task's own suite run, holding
    the defect against rules/integration/a-capability-declares-its-contract's clause
    that "an attribute that is absent or an empty string is undeclared," and against
    capability-registry.service.ts's own isUndeclared() helper applying the same convention
    elsewhere.
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts's
    pre-existing test "answers 200 with the capability currently registered under
    the named (name, version) identity, carrying its whole declared contract" asserts
    that the response's own keys equal the full set of keys readCapabilityByIdentityResponseSchema
    declares. Its shared heldCapability() fixture did not declare payload_notes, so
    once the schema legitimately gained that field the fixture stopped being "whole"
    and the assertion failed. The orchestrating session added payload_notes to the
    fixture, which is owned by an already-closed initiative predating this plan.
  why: Strengthening the fixture to actually be whole again preserves exactly what
    the test claims to prove; a corrective /plan-work increment or a proof-only re-delivery
    over the closed owning initiative would cost more than this one-line, uncontroversial
    fixture addition.
preserved:
- The controller's untransformed pass-through of whatever the readCapabilityByIdentity
  dependency resolves.
- The route's untransformed reply.send(capability).
- The repository's own service/factory wiring that resolves this read fresh from the
  store rather than from any register-capability request; only toCapability's null-vs-absent
  guard itself was widened to also exclude the empty string.
---

## What it is

read-capability-by-identity's response contract admits payload_notes as its one optional attribute, so an already-correct, already-fresh read can answer it exactly as the registration holds it -- present where declared, absent where not, and never drawn from anything but that registration's own current record. A repository-level defect this task's own suite caught (a stored empty string surfacing as payload_notes: '' instead of absent) was corrected in the same file.

## Notes

A pre-existing test's shared fixture was strengthened to declare payload_notes too, so its own claim stays true now that the schema legitimately grew one -- disclosed above as a divergence from the ordinary two-producer split.
A failure-diagnostician's finding against a genuine code defect in relational-capability-store.repository.ts (a file this task's criteria depend on but did not itself modify) was applied directly, per this task's own suite run.
