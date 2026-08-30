---
title: Snapshot wire types and adapter — proof
summary: New tests prove both wire types accept the optional snapshot fields and toDetailEvidence carries them through unchanged in all three states (present-and-populated, present-but-empty, absent).
implementation: sha256:57233aabac282d8e27d87ad9b68e5b52b531afdcf83508c33aa75072e61087bb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-evidence-snapshot-evidence-snapshot-wire-types-suite-2
tests:
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: constructs without either field, proving neither is required (SimulateEvidenceItem)
  proves: Criterion 1 — SimulateEvidenceItem declares fields and concept_description as optional.
  fails_when: either field becomes required, making this literal fail to typecheck.
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: constructs with both fields present, proving the declared shape accepts them (SimulateEvidenceItem)
  proves: SimulateFieldSemantics' own shape (name required, type/description optional) is assignable to fields.
  fails_when: the declared shape rejects a well-formed field-semantics array or a plain description string.
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: constructs without either field, proving neither is required (Evidence)
  proves: Criterion 2 — the evidence wire type in use-simulate-hypothesis declares the same two optional fields.
  fails_when: either field becomes required on Evidence, making this literal fail to typecheck.
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: constructs with both fields present, using its own independently-declared FieldSemantics
  proves: Evidence's own FieldSemantics (declared independently of the sibling hook's type) is assignable to fields.
  fails_when: FieldSemantics stops accepting a well-formed field-semantics literal.
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: carries a present, non-empty snapshot through unchanged
  proves: Criterion 3 — toDetailEvidence carries fields/concept_description onto fields/conceptDescription for a populated snapshot.
  fails_when: toDetailEvidence drops, renames, or alters either field's value for a populated snapshot.
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: carries a present but empty snapshot through unchanged, never inventing a value
  proves: toDetailEvidence does not special-case or invent a value for an explicitly empty (but present) snapshot.
  fails_when: toDetailEvidence turns an empty array/string into undefined, or into some other invented value.
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: leaves fields and conceptDescription absent, rather than coerced to a value, for a record carrying neither
  proves: 'Criterion 4 — the render type''s own absent reading: toDetailEvidence never coerces an absent wire value to an invented default.'
  fails_when: toDetailEvidence coerces an absent fields/concept_description to [], "", or any other value instead of leaving it undefined.
untested:
- use-simulate-hypothesis.ts's own Evidence[] is never read by any adapter (the implementation record's own deferred entry) — this proof only constructs Evidence literals to prove the type accepts the new fields; no test exercises a consumer reading them, because none exists yet.
---

## What it is
Proof that both wire types accept the new optional snapshot fields and that toDetailEvidence carries them through faithfully in every state the specification distinguishes: populated, explicitly empty, and absent.

## Notes
The first suite run failed one unrelated, pre-existing test (use-capability-detail.spec.ts, criterion 1) that this delivery's files do not touch and could not plausibly affect; it passed cleanly in isolation (`vitest run src/hooks/use-capability-detail.spec.ts`, 9/9), diagnosed as setup/order-dependent flakiness in the full suite rather than code or test this delivery wrote. Suite-2 passed clean, all 129 test files included.
