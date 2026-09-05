---
title: Disclose each listed hypothesis-revision's own state
summary: Proves the list-hypothesis-revisions read path answers every revision's own draft-or-released
  state, sourced from its own row rather than any referencing case version, ordered highest-revision-first,
  and reconciles every pre-existing test the state field and the descending order broke.
implementation: sha256:1a29dd93c41fba2b0c2fbfef634ee1e72a3b6797bba1ce893adba7155ef2efdb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revision-listing-state-disclosure-disclose-each-revisions-own-state-suite-2
tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "carries every answered revision's own state, reading the field as draft for a revision left
      at its schema default across a multi-revision page"
    proves: criterion 1 (every revision the listing answers carries its own state) — new test, three
      revisions of one hypothesis, none explicitly released.
    fails_when: an item in the page is missing a state field, or the field is undefined for any item.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is released as released
    proves: criterion 2 — new test; the revision's row is set to released via direct SQL before the list
      call.
    fails_when: the item's state reads anything other than 'released' for a row whose own stored state
      is 'released'.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is draft as draft
    proves: criterion 3 — new test; the revision is left at its schema default with no update.
    fails_when: the item's state reads anything other than 'draft' for a row whose own stored state is
      'draft'.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "answers a revision's own stored state — draft — even though a released case version's manifest
      still references that revision, reading the state from the revision's own row and not from the
      referencing case version"
    proves: criterion 4 — new test, mirroring the sibling fixture technique already established in this
      delivery — the revision's own row is never set to released, only the case version referencing it is.
    fails_when: the item's state reads 'released' because the referencing case version is released,
      rather than 'draft' from the revision's own row.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a hypothesis holding three revisions ordered by revision number descending, the highest
      revision first
    proves: criterion 5 — new test; three sequential revisions inserted, page requested with a limit
      covering all three.
    fails_when: the page answers the revisions in ascending or insertion order instead of descending.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "answers the page a middle offset selects under descending order — the second- and third-highest
      revisions, not the two most recently inserted"
    proves: criterion 6, the part the pre-existing envelope test (cited below) does not already cover —
      that offset and limit select the correct slice of the descending-ordered set, not merely the
      correct count; new test, four revisions, offset 1 limit 2.
    fails_when: the offset/limit slice returns the wrong two revisions once ordering is descending, or
      total/limit/offset are misreported.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named
      hypothesis's own revisions — the given limit and offset echoed back, the page itself held to that
      limit even though the hypothesis holds more revisions, and pageCount computed from total and limit"
    proves: criterion 6's general envelope mechanics — pre-existing, unaffected by this task's edits, cited
      per the task's own instruction rather than duplicated.
    fails_when: limit, offset, total or pageCount are echoed back incorrectly, or the page is not held to
      the given limit.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "returns every revision the named hypothesis currently holds, by its own full content, each
      revision's own collects grouped to it alone and never conflated with another revision of the same
      hypothesis"
    proves: pre-existing coverage of the listing's full-content read, reconciled — the expected array is
      now ordered descending and each expected item now carries its own state, both broken by this task's
      SELECT and ORDER BY changes.
    fails_when: the order reverts to ascending, or either item's state field is dropped from the answer.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "excludes another hypothesis's own revisions from the page, within the same case, naming only
      the hypothesis name it was asked for"
    proves: pre-existing isolation-by-name coverage, reconciled — the expected single item now carries
      state 'draft'.
    fails_when: the answered item's state field is missing.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "excludes a different case's own revisions of a hypothesis sharing the same name, naming only
      the slug it was asked for"
    proves: pre-existing isolation-by-slug coverage, reconciled — the expected single item now carries
      state 'draft'.
    fails_when: the answered item's state field is missing.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "answers the replacement's own criterion and resolution, once that revision is read back after
      the overwrite"
    proves: pre-existing overwrite-read-back coverage, reconciled — the expected item now carries state
      'draft'.
    fails_when: the answered item's state field is missing.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "leaves the hypothesis holding exactly the revisions it held before the overwrite, no more and
      no fewer"
    proves: pre-existing overwrite-count coverage, reconciled — the expected revision-number order is now
      descending.
    fails_when: the order reverts to ascending.
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: "leaves a different existing revision of the same hypothesis exactly as it was, so the overwrite
      assigns no revision number the hypothesis had already assigned elsewhere"
    proves: pre-existing overwrite-isolation coverage, reconciled — the expected array order is now
      descending and both items now carry state 'draft'.
    fails_when: the order reverts to ascending, or either item's state field is missing.
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: "answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse
      declares — data, limit, offset, pageCount and total — and each revision item carrying exactly
      revision, criterion, collects, resolution and state, never hypothesis_name"
    proves: criterion 1 at the HTTP layer — the item's own state reaches the response unreshaped;
      reconciled from a test that previously asserted exactly four keys, which the new field would now
      violate.
    fails_when: the response item carries no state field, or carries a field beyond the five named.
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: "answers each of two requests naming different (slug, hypothesis name) pairs with that request's
      own resolution, never a cached or joined value"
    proves: the pre-existing no-cross-contamination proof still holds once every item carries a state
      field; reconciled — both mocked pages and both expectation blocks now carry state 'draft', required
      both for HypothesisRevisionListItem's type and for the equality check to match the mock's own answer.
    fails_when: a state value from one request's mock leaks into the other request's answered item.
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: defaults offset to 0 when the request names none
    proves: the task's own UNDERDETERMINED note on criterion 6 — pre-existing, unaffected — falsifies the
      named implementation's requiring offset and limit on every call by showing offset alone is optional.
    fails_when: an absent offset is refused or forwarded as anything other than 0.
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: resolves an absent limit against the configured defaultLimit rather than leaving it unbounded
    proves: the same UNDERDETERMINED note — pre-existing, unaffected.
    fails_when: an absent limit is refused or left unbounded instead of resolving to defaultLimit.
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request
    proves: the same UNDERDETERMINED note — pre-existing, unaffected.
    fails_when: an over-limit request is refused, or is forwarded unclamped.
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: passes a limit exactly equal to the configured maxLimit through unclamped
    proves: the same UNDERDETERMINED note, the boundary case — pre-existing, unaffected.
    fails_when: a limit exactly at maxLimit is refused or altered.
untested:
  - "The implementation record's own inference — that the state field is placed after resolution in
    HypothesisRevisionListItem's declaration and as the last property hypothesisRevisionListItemOf's
    object literal sets — names a pure source-arrangement choice with no externally observable
    behavioral consequence, so no test is written for it; a reader wanting confirmation has only the
    source itself to read."
not_applicable:
  - edge_case: A hypothesis that exists but currently holds zero revisions
    why: this store's own write paths never leave a hypothesis in that state — a hypothesis row is
      created implicitly alongside its first revision — so there is no reachable fixture for it, and none
      of this task's six criteria makes a claim about an empty page.
  - edge_case: Two listHypothesisRevisions reads racing a release or overwrite of the same hypothesis
    why: this task's criteria are entirely about what one read answers (state disclosure, ordering,
      paging), not about concurrency semantics; the write-side guarantees are the release and overwrite
      tasks' own criteria, already covered by their own proofs.
  - edge_case: A hypothesis_revisions row whose stored state is outside the draft/released enumeration
    why: unreachable through real Postgres — the CHECK constraint migration 0020 adds restricts the
      column to draft/released, so only a driver-level double could construct this row, and
      hypothesisRevisionStateOf (the validator that would raise CaseStoreError on it) is the identical,
      already-unit-tested function two other callers already exercise this way.
  - edge_case: A dependency (the database) that is unavailable or answers slowly
    why: this task adds a column to an existing SELECT and changes an ORDER BY clause; it introduces no
      new dependency or failure mode beyond the ones the pre-existing read-failure path already covers.
---

## What it is

Integration and unit tests prove the `list-hypothesis-revisions` read path answers every revision's own draft-or-released state, sourced from its own row and never from a referencing case version, ordered highest-revision-first; every pre-existing test the state field and the descending order broke was reconciled.

## Notes

None.
