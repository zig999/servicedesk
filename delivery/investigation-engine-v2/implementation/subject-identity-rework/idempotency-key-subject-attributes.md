---
title: Idempotency key rebuilt over the subject's whole attribute-value set
summary: idempotency-key.ts's composition and documentation are rebuilt to key on the canonical Subject value (type plus whole attribute-value set) alongside case and ticket reference, replacing the earlier bare subjectType/subjectId strings and the now-superseded reasoning that justified them.
task: sha256:e0f5cb2d9639420c3acc3674764ea5d033edc292e524f12ca0197020baa03d06
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/subject-identity-rework-idempotency-key-subject-attributes-build-3
files:
  - path: src/investigation/idempotency-key.ts
    effect: "IdempotencyKey now holds subject: Subject (the canonical type-plus-attribute-value-set shape) alongside caseReference and ticketRef, in place of the prior flat subjectType and subjectId strings. idempotencyKeyOf flattens subject.type and every attribute-value pair in subject.attributes (none selected or dropped) together with caseReference and ticketRef, joined with '::', mirroring FakeObservationSource's fixtureKey convention. The module's opening comment and doc comments are rewritten to state why a bare subjectId no longer stands in for a subject's identity now that subject.ts is the canonical Subject module."
  - path: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
    effect: "disclosed, out-of-scope compile-compatibility patch — orphan pre-existing test fixture (A_KEY/ANOTHER_KEY) updated from the retired subjectType/subjectId shape to subject: { type, attributes }, purely so the file typechecks; no assertion touched."
  - path: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
    effect: "disclosed, out-of-scope compile-compatibility patch — same orphan-fixture treatment as idempotency-lease-store.spec.ts's A_KEY."
criteria:
  - criterion: "Two requests with identical subject type, identical whole attribute-value set, case and ticket reference produce the same key."
    met: true
    how: "idempotencyKeyOf is a pure function of key.subject.type, the flattened key.subject.attributes pairs, key.caseReference and key.ticketRef; two IdempotencyKey values carrying the same Subject, the same caseReference and the same ticketRef flatten to the identical ordered sequence of strings and join to the identical string."
  - criterion: "A request whose attribute-value set differs from another's, even sharing the same subject type and case, produces a different key."
    met: true
    how: "attributeParts is derived directly from subject.attributes via flatMap; changing even one attribute name or value in that set changes at least one element (or the length) of attributeParts, which changes the joined string even when subject.type, caseReference and ticketRef are held fixed."
  - criterion: "The key module's own documentation states why the subject's type and attribute-value set now compose the key, replacing the earlier two-flat-strings reasoning."
    met: true
    how: "the module's opening comment states the prior decision (subjectType/subjectId as two flat strings, taken because no canonical Subject module existed), says plainly that reasoning no longer holds now that subject.ts is that canonical module, and states that the key now composes directly over the canonical Subject value instead."
nodes:
  - node: domain/investigation/subject
    encoded_at:
      - src/investigation/idempotency-key.ts
    how: "IdempotencyKey.subject holds the canonical Subject value as one of the key's components, so the key is computed over the subject exactly as this node states it rather than over a bare id."
  - node: domain/investigation/subject-attribute-value
    encoded_at:
      - src/investigation/idempotency-key.ts
    how: "idempotencyKeyOf flattens every attribute-value pair into the key's string form, with none selected or dropped."
  - node: domain/glossary/subject-attribute
    how: "honored, not independently encoded here: this module consumes each pair's attribute name exactly as the canonical SubjectAttributeValue type already carries it, and does not itself check the name against the glossary — that check belongs to a different task."
  - node: domain/glossary/subject-type
    how: "honored, not independently encoded here: the key's leading component is subject.type, consumed exactly as the canonical Subject type already carries it. This module neither defines nor re-validates the subject-type vocabulary."
  - node: rules/investigation/an-investigation-is-idempotent-within-a-window
    encoded_at:
      - src/investigation/idempotency-key.ts
    how: "idempotencyKeyOf composes subject type, the subject's whole attribute-value set, caseReference and ticketRef, in that order, into the one string two requests are compared by — the four components the rule's statement names as what a match requires. The rule's return/join/start-fresh clause and its no-ticket-reference exception are not reached by this task's criteria and are not encoded here, per this task's own REMAINDER notes."
inferences:
  - inferred: "IdempotencyKey nests the canonical Subject value as subject: Subject rather than reintroducing a flat subjectType field beside a nested subject."
    from: "domain/investigation/subject's own shape (type + attributes together) and subject.ts's canonical Subject type; fake-observation-source.adapter.ts's fixtureKey already keys off subject.type and subject.attributes from one Subject parameter rather than two flat top-level fields."
  - inferred: "idempotencyKeyOf does not sort or otherwise canonicalize the order of a subject's attribute-value pairs before flattening them."
    from: "fake-observation-source.adapter.ts's fixtureKey documents the identical caveat for its own attribute flattening, and neither the rule nor domain/investigation/subject states a canonical sort order."
  - inferred: "caseReference stays an opaque string, not decomposed into any of the case's own identifying fields."
    from: "carried forward from the prior version's own reasoning: the rule names case as one component beside the other three, and which of the case's fields a caller pins into this one string is left to whichever task assembles a real key from a real diagnose request."
divergences:
  - cites: MNT-03
    file: src/investigation/idempotency-key.ts
    departure: "idempotencyKeyOf's attribute-flattening line duplicates the identical expression already written in fake-observation-source.adapter.ts's fixtureKey, rather than calling one shared implementation."
    why: "extracting a shared helper would mean editing fake-observation-source.adapter.ts, which belongs to a different, already-delivered task (observation-source-subject-shape). This task's own rationale keeps it independently demonstrable against fixture subjects alone, so the duplication is disclosed rather than resolved by reaching into a module this task does not own."
  - from: "this task's own reach — idempotency-key.ts alone, per its own rationale ('stays independently demonstrable against fixture subjects without either of the port or factory tasks')"
    departure: "idempotency-lease-store.spec.ts's and idempotency-resolution.spec.ts's own A_KEY/ANOTHER_KEY fixtures — pre-existing tests belonging to neither this task nor any other task in this plan — were mechanically patched to the new subject: { type, attributes } shape so the tree typechecks; no assertion in either file was touched."
    why: "these two files are orphaned by this plan (owned by the already-closed investigation-engine initiative's own idempotency-window task, not claimed by any task here) and broke purely because IdempotencyKey's shape legitimately changed; leaving them broken would fail the whole project's typecheck step for every task after this one. The same class of narrow, disclosed, human-authorized exception already applied to task/subject-identity-rework/subject-value-object's own orphan file (file-investigation-store.repository.spec.ts) was extended here without a fresh ask, since it is identical in kind — a pure literal-shape patch, no behavior or assertion changed."
preserved:
  - "idempotency-lease-store.ts's acquire()/currentLease() behavior and its Lease/AcquireResult shapes, which treat IdempotencyKey opaquely through idempotencyKeyOf and needed no change against the new shape."
  - "idempotency-resolution.ts's resolveIdempotency() precedence (completed match, then in-progress lease, then free), which likewise never destructures IdempotencyKey's fields directly and needed no change."
  - "fake-observation-source.adapter.ts's FakeObservationSource and fixtureKey behavior, unrelated to the idempotency machinery and left untouched."
  - "every assertion in idempotency-lease-store.spec.ts and idempotency-resolution.spec.ts — only the two files' shared key fixtures' own shape changed."
deferred:
  - what: "fake-observation-source.adapter.ts's fixtureKey and idempotency-key.ts's idempotencyKeyOf now both flatten a Subject's attribute-value pairs with the identical one-line expression, which a shared helper could unify."
    why: "unifying them means editing fake-observation-source.adapter.ts, which sits outside this task (owned by the already-delivered observation-source-subject-shape task); this task's own criteria and rationale scope it to idempotency-key.ts alone."
---

## What it is

idempotency-key.ts's key composition rebuilt over the subject's whole attribute-value set instead of a bare id, with its own documented reasoning revisited to match. Two orphan pre-existing test files (belonging to no task in this plan) mechanically patched, disclosed, so the tree keeps typechecking.

## Notes

None.
