---
target: frontend
title: capability_payload_notes and its unconverted siblings cross the simulate-response
  wire boundary
summary: Two new spec files pin the type-level requiredness of capability_payload_notes
  on both wire-shaped evidence types and the unconverted, unsubstituted pass-through
  of capability_payload_notes, observed_at, ttl and inputs from a mocked response
  to each hook's caller, plus fields/concept_description/result_detail crossing the
  same actual response round-trip.
implementation: sha256:8d7bc25f02815417f774cf2f495836594fad5a41d8a8eb638c238766d1730243
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-evidence-wire-fields-suite
tests:
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: refuses an evidence item literal that omits capability_payload_notes or types
    it as anything but a string
  proves: 'criterion 1: SimulateEvidenceItem declares capability_payload_notes as
    a required string field'
  fails_when: capability_payload_notes is made optional, retyped to something other
    than string, or removed from SimulateEvidenceItem, so the two @ts-expect-error
    lines stop reporting an error
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: carries observed_at as the exact UTC string sent -- never parsed into a Date
    -- and ttl as the exact seconds figure sent -- never converted to milliseconds
  proves: criterion 3 (observed_at/ttl declared and carried) and the UNDERDETERMINED
    entry naming a hook that parses observed_at into a browser-local Date and derives
    ttl in milliseconds
  fails_when: the returned evidence item's observed_at is no longer the identical
    string the response sent or ttl is no longer the identical number of seconds
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: carries inputs as the exact "{}" string the response sent, never a placeholder
    and never an absent field
  proves: the UNDERDETERMINED entry naming a hook that maps an empty-inputs item to
    a placeholder text or an absent field
  fails_when: the returned evidence item's inputs is missing or is not the literal
    "{}" string the response sent
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: carries a non-empty capability_payload_notes value exactly as the response
    sent it
  proves: 'criterion 4: a simulate-case response whose evidence items carry capability_payload_notes
    reaches the hook''s caller with that value intact'
  fails_when: the returned evidence item's capability_payload_notes differs from,
    or is missing relative to, the non-empty string the response sent
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: carries capability_payload_notes as the empty string the response sent, not
    as an absent field and not as substituted text
  proves: 'criterion 5: an evidence item whose capability declared no payload notes
    reaches the caller as the empty string the response sent'
  fails_when: the returned evidence item lacks capability_payload_notes entirely,
    or carries any value other than the empty string, when the response sent the empty
    string
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: carries fields, concept_description and result_detail through unchanged when
    the response sends them, rather than stopping at the four attributes this task's
    own criteria name
  proves: the UNDERDETERMINED entry naming an implementation whose types declare only
    concept, result, inputs, observed_at, ttl and capability_payload_notes
  fails_when: the returned evidence item is missing result_detail, fields or concept_description,
    or any of the three differs from what the mocked response sent
- file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  name: refuses an evidence item literal that omits capability_payload_notes or types
    it as anything but a string
  proves: 'criterion 2: the hypothesis-run Evidence type declares capability_payload_notes
    as a required string field'
  fails_when: capability_payload_notes is made optional, retyped to something other
    than string, or removed from Evidence
- file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  name: carries observed_at as the exact UTC string sent -- never parsed into a Date
    -- and ttl as the exact seconds figure sent -- never converted to milliseconds
  proves: criterion 3 and the UNDERDETERMINED entry naming a hook that converts either
    value
  fails_when: the returned evidence item's observed_at or ttl is converted rather
    than passed through
- file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  name: carries inputs as the exact "{}" string the response sent, never a placeholder
    and never an absent field
  proves: the UNDERDETERMINED entry naming a hook that substitutes empty inputs
  fails_when: the returned evidence item's inputs is missing or is not the literal
    "{}" string the response sent
- file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  name: carries capability_payload_notes as the empty string the response sent, not
    as an absent field and not as substituted text
  proves: criterion 5
  fails_when: the returned evidence item lacks capability_payload_notes entirely,
    or carries any value other than the empty string
- file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  name: carries fields, concept_description and result_detail through unchanged when
    the response sends them, rather than stopping at the four attributes this task's
    own criteria name
  proves: the UNDERDETERMINED entry naming an implementation that stops at four attributes
  fails_when: the returned evidence item is missing result_detail, fields or concept_description,
    or any of the three differs from what the mocked response sent
not_applicable:
- edge_case: two dispatches against one subject at once
  why: already covered by use-simulate-case.spec.ts's and use-simulate-hypothesis-dispatch-safety.spec.ts's
    own pre-existing tests, untouched by this task
- edge_case: a duplicate evidence item in one response
  why: no criterion and no node this task implements states a uniqueness constraint
    over evidence items
- edge_case: a network or backend failure mid-dispatch
  why: already covered by pre-existing tests neither of which this task touches
- edge_case: an empty evidence array in the response
  why: already covered by use-simulate-case-response-shape.spec.ts's pre-existing
    test
- edge_case: a boundary length on the capability_payload_notes string
  why: neither this task's criteria nor domain/investigation/evidence states any length
    or range constraint
untested:
- 'contracts/investigation/case-simulation: its fact spans the whole simulate-case
  and simulate-hypothesis response record; this task''s tests reach only the evidence
  attributes named in its criteria.'
- 'domain/investigation/evidence: concept, observation, origin, result, elapsed_ms
  and the capability reference are untouched by any test here, so the node''s fact
  is not decided whole.'
- 'rules/investigation/presentation-reads-the-evidence-snapshot: this task''s own
  REMAINDER note states its presentation half is unreached by design -- no surface
  reads the snapshot yet.'
- 'rules/investigation/an-evidence-items-observed-at-is-a-utc-instant: tests establish
  only that the instant crosses each hook''s own return path unconverted; the rule
  also reaches where the item is stored, presented and judged, which this task''s
  files do not touch.'
- 'rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation:
  tests establish only that the seconds figure crosses each hook''s own return path
  unconverted; the rule''s meaning wherever ttl is recorded and read is not exhaustively
  covered.'
---

## What it is
The proof for task/evidence-detail/evidence-wire-fields: that both simulate-response evidence types declare capability_payload_notes as required, and that neither hook converts, substitutes or drops any of capability_payload_notes, inputs, observed_at or ttl on the way to its caller.

## Notes
None.
