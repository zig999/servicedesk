---
title: Replay by slug and version proves its answer whole, unvalidated and digest-free
summary: Rewrites the two pre-existing assertions that held replayCase to its former ReadCaseResult-with-hash
  contract and the structural-failure-through-replay path, and adds new tests proving each of this task's
  six criteria against the bare-Case, no-revalidation, no-digest contract replayCase now answers.
implementation: sha256:10c0742298e18808026491fc44fc151c86dfae486155c23a812d87ca2913d49d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-replay-by-slug-and-version-suite
tests:
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers replayCase with exactly the case readCase answers for the same pinned version, minus the
    content-identity pin read-case alone carries
  proves: 'Criterion 1: the replay read takes a slug and a version and answers with the case version stored
    under them (rewritten from the pre-existing assertion that compared replayed to the whole ReadCaseResult
    — now compared to read.case, its own case).'
  fails_when: replayCase stops answering the exact case content readCase reads for the same pinned slug
    and version, or starts answering a wrapper shape again instead of the bare Case
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: replays a pinned version without running the coherence checks at all, answering the case even
    though the same content would refuse at read-case
  proves: Criterion 4 (coherence half) — the replay answers without running the coherence checks read-case
    runs (rewritten to drop the reference to replayed.case.slug and the store hash assertion, which criterion
    6 now forbids reading at all).
  fails_when: replayCase starts running the coherence checks and refuses, or stops answering the slug
    of the stored document
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a replay from just the case store, with no glossary or capability dependency for it to
    call at all
  proves: replayCase's signature and behavior depend on the case store alone (rewritten from replayed.case.slug
    to replayed.slug for the bare-Case return type)
  fails_when: replayCase stops answering the stored slug, or starts requiring a glossary or capability
    dependency to resolve
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses replay with the same CaseNotFoundError as read-case when the pinned version was never
    stored
  proves: an unstored pinned pair is refused rather than answered as part of a complete case (criterion
    2's "or nothing" half)
  fails_when: replayCase answers something for an unstored version, or refuses with a different error
    type than CaseNotFoundError
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a document that would fail read-case structurally, rather than refusing it, because replay
    skips the structural refusal too
  proves: Criterion 4 (structural half) — replaced the removed test whose premise (replay still running
    the structural parse and refusing) is exactly what this criterion now forbids.
  fails_when: replayCase starts running the structural parse and either refuses the document or fails
    to answer its exact (invalid) stored shape
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers the replay whole, matching exactly what the document holds, including its hypotheses and
    their resolutions and referrals
  proves: 'Criterion 2: the replay answers a complete case — its root, its hypotheses and their resolutions
    and referrals — never a case missing any of them.'
  fails_when: trustedCase or replayCase drops, reorders or alters any attribute of the stored document
    — the root, a hypothesis, its resolution or its referral
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers the version stored under the named slug, never the same version number stored under a
    different slug
  proves: 'Criterion 1: the replay resolves by the exact (slug, version) pair, not by version alone.'
  fails_when: replayCase answers a document stored under a different slug at the same version number
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers the version a replay names, unaffected by a later version stored afterward under the same
    slug
  proves: 'Criterion 3: a version stored before later versions of it were stored is answered when a replay
    names that version.'
  fails_when: replayCase answers the later-stored version instead of the one named, or is affected by
    a later write at all
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: resolves its case without ever reading the store's content-identity digest, even where doing so
    would throw
  proves: 'Criterion 6: the replay resolves its case without reading any digest over the case''s content
    — proved observably by seeding a stored version whose hash field throws if read, and showing replayCase
    still resolves.'
  fails_when: replayCase (through trustedCase or heldVersion) ever accesses the stored version's hash
    field, which would surface as this test's promise rejecting instead of resolving
- file: src/__tests__/integration/factories/case-query.factory.spec.ts
  name: replays the pinned version through the real store, answering it unchanged even after the real
    capability registration the case depends on is edited away (pre-existing test name, one assertion
    rewritten)
  proves: 'Criterion 4, through the real wiring: rewrote the one assertion that compared replayed to the
    whole read (a ReadCaseResult) to compare it to read.case, matching replayCase''s new bare-Case return
    type.'
  fails_when: replayCase through the real store answers anything other than the exact case read-case answered
    before the capability registration was edited away, or the comparison mismatches because replayCase
    reverted to the wrapper shape
not_applicable:
- edge_case: absent or empty slug/version passed to replayCase
  why: no criterion of this task, and no bound node, states a validation replayCase itself must run over
    its own input — criterion 4 states the opposite, that replay is the declared exception to the validation
    read-case runs. Boundary validation of this shape is EDG-01's concern at the transport edge, which
    this task's REMAINDER note assigns elsewhere; asserting a refusal here would state a domain fact no
    node in this task holds.
- edge_case: two replay calls against the same pinned pair at once
  why: replayCase performs one read and no write; nothing in this task's criteria or bound nodes describes
    concurrent-read behavior, and the store's own concurrency guarantees are outside this task's file
    set (case-store.port.ts and its file-backed implementation are untouched).
- edge_case: the case store answering slowly or rejecting
  why: replayCase and heldVersion do not catch or transform a store rejection (unlike the CaseNotFoundError
    path for an absent version, which is already tested); a raw store failure simply propagates, which
    is existing, unchanged behavior of heldVersion shared with readCase and not something this task's
    criteria state a different answer for.
- edge_case: a duplicate version write under one slug
  why: ICaseStore's writeVersion contract ("never overwriting an earlier version's file") governs this,
    and that port and its implementation are outside this task's file set; replayCase only reads whatever
    the store already holds.
untested:
- Criterion 5 (the ordinary read runs that validation at each reading) is proven entirely by pre-existing,
  unmodified tests in case-query.service.spec.ts (the structural- and coherence-refusal tests, and the
  two "refuses at a later read a case that validated earlier" tests) and case-query.factory.spec.ts's
  real-wiring re-validation test, since readCase's own implementation is unchanged by this task. No new
  test was written for it, in line with writing no new behavioral test where a task rearranges what already
  worked.
---

## What it is

The tests proving replay-by-slug-and-version: two pre-existing assertions rewritten off the old ReadCaseResult-with-hash, structural-failure-through-replay contract, plus new tests for each of the six criteria — identity to read-case minus the digest, coherence and structural exemption, completeness, version pinning independent of later writes, and no digest read at all.

## Notes

None.
