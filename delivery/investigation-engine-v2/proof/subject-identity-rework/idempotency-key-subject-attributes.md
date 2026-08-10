---
title: Proof for the idempotency key over the subject's whole attribute-value set
summary: idempotencyKeyOf is proved to answer the same string for two keys sharing subject type, the whole attribute-value set, case reference and ticket reference, and a different string when the attribute-value set, the subject type, the case reference, or the ticket reference each vary on their own — rewriting the pre-existing proof whole against the new subject:Subject shape, in place of the retired flat subjectType/subjectId fields.
implementation: sha256:3a5dee4d197901cbe38b53dd6966db5abdb313614e07a0dc872e274adc145867
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-idempotency-key-subject-attributes-suite
tests:
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers the identical string for two keys carrying the same subject type, the same whole attribute-value set, case reference and ticket reference"
    proves: "Criterion 1 (\"Two requests with identical subject type, identical whole attribute-value set, case and ticket reference produce the same key.\")"
    fails_when: "idempotencyKeyOf answers two different strings for two IdempotencyKey values whose subject type, whole attribute-value set (copied into a fresh array, not the same reference), case reference and ticket reference are all identical"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when a subject attribute-value pair's value differs, even sharing the same subject type and case"
    proves: "Criterion 2, the basic value-changes-within-a-pair form"
    fails_when: "idempotencyKeyOf answers the same string for two keys whose subjects differ in one attribute-value pair's value while subject type, case and ticket reference stay fixed"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when the subject carries an extra attribute-value pair, even sharing the same subject type and case"
    proves: "Criterion 2, the whole-set form — an added pair changes the set even though every previously-present pair still matches"
    fails_when: "idempotencyKeyOf answers the same string when one subject's attribute-value set is a strict superset of the other's, with every original pair unchanged"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when the subject carries only a subset of the seeded attribute-value pairs, even sharing the same subject type and case"
    proves: "Criterion 2, the whole-set form again from the other direction — dropping a pair changes the set"
    fails_when: "idempotencyKeyOf answers the same string for a subject carrying only part of another subject's attribute-value pairs"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when an attribute-value pair's attribute name differs while its value stays the same, even sharing the same subject type and case"
    proves: "Criterion 2 together with domain/investigation/subject-attribute-value's node answer — the attribute name, not only the value, is part of what composes the key"
    fails_when: "idempotencyKeyOf answers the same string for two pairs sharing a value but carrying different attribute names"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when the same attribute-value pairs appear in a different order, since no canonical order is applied before they are joined"
    proves: "the implementation's own recorded inference that idempotencyKeyOf does not sort or otherwise canonicalize a subject's attribute-value pairs before flattening them"
    fails_when: "idempotencyKeyOf starts canonicalizing or sorting the attribute-value pairs before joining"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "carries the subject as one nested Subject value alongside caseReference and ticketRef, not a flat subjectType or subjectId field"
    proves: "the implementation's own recorded inference that IdempotencyKey nests the canonical Subject value as subject: Subject rather than reintroducing a flat subjectType field"
    fails_when: "an IdempotencyKey's own properties are anything other than exactly caseReference, subject and ticketRef"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when only the subject type differs, the whole attribute-value set, case reference and ticket reference held fixed"
    proves: "the task's own UNDERDETERMINED note — a key function hashing only the subject's attribute-value set would satisfy criteria 1 and 2 as literally written; this test fails over exactly that implementation by varying only the subject type"
    fails_when: "idempotencyKeyOf answers the same string for two keys whose subjects differ only in type, everything else held identical"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when only the case reference differs, the subject and ticket reference held fixed"
    proves: "the same UNDERDETERMINED note, for case reference"
    fails_when: "idempotencyKeyOf answers the same string for two keys whose subject and ticket reference are identical and only the case reference differs"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "answers a different string when only the ticket reference differs, the subject and case reference held fixed"
    proves: "the same UNDERDETERMINED note, for ticket reference"
    fails_when: "idempotencyKeyOf answers the same string for two keys whose subject and case reference are identical and only the ticket reference differs"
  - file: src/__tests__/unit/investigation/idempotency-key.spec.ts
    name: "composes a stable key for two keys whose subject carries no attribute-value pair at all"
    proves: "the boundary immediately below one attribute-value pair — idempotencyKeyOf accepts a zero-attribute subject and still composes a deterministic key"
    fails_when: "idempotencyKeyOf throws for a subject carrying no attribute-value pairs, or answers two different strings for two such keys sharing type, case and ticket reference"
not_applicable:
  - edge_case: two concurrent calls to idempotencyKeyOf
    why: "idempotencyKeyOf is a pure, synchronous function of its own arguments with no shared mutable state"
  - edge_case: a dependency that is unavailable, slow to answer, or answers in an unexpected shape
    why: "idempotencyKeyOf calls out to nothing — it is pure, synchronous string composition"
  - edge_case: an operation attempted against state that forbids it
    why: "idempotencyKeyOf holds no persisted or mutable state of its own"
  - edge_case: "absent, malformed or type-violating input"
    why: "IdempotencyKey's fields are a statically typed signature enforced by the compiler at every call site; no runtime boundary parses external input inside idempotencyKeyOf"
  - edge_case: an empty-string subject type, attribute name, attribute value, case reference or ticket reference
    why: "no bound node assigns any of these strings special meaning; an empty-string variant would exercise the same composition path the existing tests already cover"
  - edge_case: a duplicate attribute name within one subject's own attribute-value set
    why: "no bound node states a uniqueness constraint over attribute names within one subject's set"
  - edge_case: "a request carrying no ticket reference, and the completed-returns/in-progress-joins/neither-starts-another matching behavior"
    why: "both are REMAINDER per the task's own Notes, belonging to task/diagnose-entry-point/diagnose-payload-and-window-dedup"
  - edge_case: an attribute name or subject type absent from the governed glossary vocabulary
    why: "honored, not independently encoded; idempotencyKeyOf performs no glossary-membership check, which belongs to investigation-factory-assembles-and-validates-the-subject"
  - edge_case: a boundary at each end of a stated numeric or ordered range
    why: "no numeric or ordered range is stated for any of the four components; the only stated boundary — zero versus one attribute-value pair — is exercised by an actual test"
untested:
  - "Criterion 3 — a claim about the module's own comment text, not a runtime behavior; no test reads idempotency-key.ts's source and asserts on its prose"
  - "that IdempotencyKey.caseReference stays an opaque string never decomposed into any of the case's own identifying fields — no decomposition code path exists to exercise one way or the other"
  - "that idempotency-lease-store.ts and idempotency-resolution.ts, whose orphan fixtures were mechanically patched, still behave correctly against real keys built this way beyond typechecking — their own pre-existing specs, untouched in their assertions, already cover that behavior"
  - "that IdempotencyKey's readonly field declarations actually prevent reassignment at runtime — a compile-time fact the project's own strict typecheck step decides"
---

## What it is

Rewrites idempotency-key.spec.ts whole to prove idempotencyKeyOf's equality/inequality property against the new subject:Subject shape — same key when all four components repeat, different key when any one (type, attribute-value set, case, ticket) varies alone — including the task's own UNDERDETERMINED note, proved as a normal passing test since the shipped implementation includes all four components.

## Notes

None.
