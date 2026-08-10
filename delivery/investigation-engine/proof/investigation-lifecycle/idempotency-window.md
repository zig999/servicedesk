---
title: Idempotency window proof — key, lease store, and resolution
summary: Tests idempotencyKeyOf's deterministic and collision-free join, IdempotencyLeaseStore's key-and-instant-only lease and its window-bounded blocking, and resolveIdempotency's three-outcome precedence, including both of the task's UNDERDETERMINED entries as the implementation record resolved them.
implementation: sha256:839e12bab3c592a70b02d487dd47a3c3dd91bdbfec7879b7fa032dabfdc41401
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/investigation-lifecycle-idempotency-window-suite
tests:
- file: src/__tests__/unit/investigation/idempotency-key.spec.ts
  name: answers the identical string for two keys carrying the same four field values
  proves: the foundation criteria 2 and 4 depend on, the join is a deterministic function of the four fields, so a repeat of the same request can ever find the lease an earlier one claimed
  fails_when: idempotencyKeyOf answers different strings for two keys whose subjectType, subjectId, caseReference and ticketRef are all equal
- file: src/__tests__/unit/investigation/idempotency-key.spec.ts
  name: answers a different string when only the subject type differs from another key
  proves: the edge case that two different keys never collide
  fails_when: idempotencyKeyOf ignores subjectType or joins two keys differing only in it to the same string
- file: src/__tests__/unit/investigation/idempotency-key.spec.ts
  name: answers a different string when only the subject id differs from another key
  proves: the edge case that two different keys never collide
  fails_when: idempotencyKeyOf ignores subjectId or joins two keys differing only in it to the same string
- file: src/__tests__/unit/investigation/idempotency-key.spec.ts
  name: answers a different string when only the case reference differs from another key
  proves: the edge case that two different keys never collide
  fails_when: idempotencyKeyOf ignores caseReference or joins two keys differing only in it to the same string
- file: src/__tests__/unit/investigation/idempotency-key.spec.ts
  name: answers a different string when only the ticket reference differs from another key
  proves: the edge case that two different keys never collide
  fails_when: idempotencyKeyOf ignores ticketRef or joins two keys differing only in it to the same string
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: holds a lease carrying exactly the key and the acquiring instant, both on acquire and on a later read
  proves: The in-progress marker holds only a key and an instant, never a domain state of the investigation.
  fails_when: acquire()'s or currentLease()'s answer carries any field beyond key and heldAt, or omits either
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: 'answers acquired: true with a fresh lease once the previously held one has fallen outside the configured window'
  proves: A lease outside the configured window no longer blocks a fresh request.
  fails_when: acquire() continues answering acquired:false with the stale lease past the configured window
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: answers the lease as absent exactly at the window's own boundary instant
  proves: A lease outside the configured window no longer blocks a fresh request — the boundary instant itself
  fails_when: currentLease() or acquire() treats the instant where now minus heldAt equals windowMs as still held (an off-by-one on the boundary)
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: still answers the lease as held one instant before the window elapses
  proves: A lease outside the configured window no longer blocks a fresh request — the boundary's complement, so expiry is not premature
  fails_when: the store expires the lease one instant before the configured window has actually elapsed
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: leaves an already-held, unexpired lease untouched on a second concurrent acquire for the same key
  proves: A repeated request whose key matches a currently held lease joins it rather than starting a second investigation — at the store's own level, and the edge case of a second concurrent acquire() call for the same key
  fails_when: a second acquire for an already-held, unexpired key overwrites it with a new lease (a different heldAt) instead of leaving the original in force
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: never lets a lease held for one key answer, block, or be disturbed by an acquire for a different key
  proves: the edge case that two different keys never collide, exercised at the lease store's own level
  fails_when: acquiring for one key answers with, is blocked by, or overwrites the lease held for a distinct key
- file: src/__tests__/unit/investigation/idempotency-lease-store.spec.ts
  name: exports nothing beyond the lease store itself — no stub investigation type or write path is exported from the module backing the in-progress branch
  proves: the implementation record's own inference that the in-progress branch is backed by a separate, in-memory lease store rather than a stub or partial Investigation record a caller would write
  fails_when: idempotency-lease-store.ts exports anything beyond IdempotencyLeaseStore, in particular any function or value that would persist or construct a partial investigation record
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: answers the completed investigation and claims no lease when the key already matches one
  proves: A repeated request whose key matches a completed investigation within the window answers that investigation, never starting a second one.
  fails_when: resolveIdempotency claims or checks a lease before answering, or answers anything other than the exact match findCompleted resolved to
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: answers in-progress joining the exact lease already held for the key, rather than claiming a second one
  proves: A repeated request whose key matches a currently held lease joins it rather than starting a second investigation.
  fails_when: resolveIdempotency claims a fresh lease over an already-held, unexpired one, or answers anything other than in-progress carrying that original lease unchanged
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: answers free with a freshly claimed lease once the previously held lease for the key has fallen outside the window
  proves: A lease outside the configured window no longer blocks a fresh request — through the composition a caller actually calls
  fails_when: resolveIdempotency still answers in-progress with the stale lease once now has moved outside the configured window
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: answers completed even though an unexpired lease happens to be held for the same key, leaving that lease untouched
  proves: the rule's own precedence, encoded in the node mapping, a completed match answers first even where a lease is still held (scenarios/investigation/a-repeated-request-returns-the-same-investigation)
  fails_when: resolveIdempotency answers in-progress instead of completed when both a completed match and a held, unexpired lease exist for the same key, or disturbs that lease while answering
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: claims the lease itself on the free branch, so a second concurrent call for the same key joins it as in-progress rather than also answering free
  proves: the resolution module's own documented behavior, claiming the lease on the free branch so a concurrent duplicate call joins it, reinforcing the in-progress criterion at the composition level, and the edge case of two operations against one subject at once
  fails_when: resolveIdempotency's free branch answers without claiming a lease, so a second concurrent call for the same key also answers free instead of in-progress
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: answers completed no matter how far now sits from when the match might have been reached, since it never itself re-derives within the window from the completed match
  proves: the task's own first UNDERDETERMINED note, resolved by the implementation's inference that the completed-investigation branch is never itself checked against the window by this mechanism
  fails_when: resolveIdempotency begins deriving or enforcing its own window-based check on the completed branch, refusing or altering a match merely because now is large
- file: src/__tests__/unit/investigation/idempotency-resolution.spec.ts
  name: exports nothing beyond the resolution composition itself — no stub investigation write path is exported alongside it
  proves: the implementation record's own inference that the in-progress branch is backed by a separate lease store rather than a stub or partial Investigation record, the composition half of that absence
  fails_when: idempotency-resolution.ts exports anything beyond resolveIdempotency, in particular any function or value that would persist or construct a partial investigation record
not_applicable:
- edge_case: a dependency (findCompleted) that fails, rejects, or answers slowly
  why: this task ships no real findCompleted at all, only a caller-supplied closure, and no criterion or spec node this task implements states how a failing or slow completed-investigation lookup is handled; that behavior belongs to whichever task supplies the real one, named in the implementation record's own deferred entries
- edge_case: absent or empty-string components of an IdempotencyKey
  why: every field is a required string by its own type, so absent cannot occur without a type error, and no criterion or spec node conditions the mechanism's behavior on a field's content beyond equality, idempotencyKeyOf treats every string opaquely regardless of length
- edge_case: an empty collection answered back
  why: none of the three outcomes (completed, in-progress, free) is or carries a collection, so there is nothing here for an empty-collection case to apply to
- edge_case: windowMs configured as zero, negative, or otherwise degenerate
  why: no criterion or spec node names a minimum, a default, or a validation requirement over the configured window value itself; the boundary tests already exercise the comparison at its critical instants for an ordinary positive window, and asserting behavior over a degenerate configuration would assert a guarantee nobody made
untested:
- 'idempotencyKeyOf''s ::-joined string form is unescaped: if any of the four field values itself contains the :: separator, two logically different keys could in principle join to the same string and share a lease that belongs to neither request as intended. No criterion or spec node states an escaping or collision-avoidance requirement over the joined form''s own character set, and no test here exercises a component value containing the separator.'
- Whether the caller-supplied findCompleted itself derives within the configured window from a completed match's own instant once the real completed-investigation lookup is built. resolveIdempotency's signature carries no instant for a completed match to check against, so only that this mechanism itself never adds such a check is proven here, never whether the eventual real system, findCompleted included, honors the rule's window bound on the completed branch. That is outside what these three files implement.
---

## What it is

Unit tests proving the idempotency-window mechanism's four criteria across the key, the lease store and their composition, including the two UNDERDETERMINED behaviors the implementation resolved deliberately.

## Notes

None.
