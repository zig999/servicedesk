---
title: Disclose each listed hypothesis-revision's own state
summary: The list-hypothesis-revisions read path now selects and answers each revision's own stored state,
  and orders the page by revision number descending.
task: sha256:a058faa8b4e4e1588124fb614226650464f8906c1c205f359efedd69c585e682
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revision-listing-state-disclosure-disclose-each-revisions-own-state-suite-2
files:
- path: src/case/case-store.port.ts
  effect: HypothesisRevisionListItem gained a readonly state field, typed as the same HypothesisRevisionState
    already exported from this file, alongside its existing revision, criterion, collects and resolution
    fields. No other type in this file changed.
- path: src/persistence/relational-case-store.repository.ts
  effect: IHypothesisRevisionRow gained a readonly state string field. hypothesisRevisionsPageSelect's SQL
    now selects that column alongside revision, criterion, resolution_outcome, resolution_action and resolution_recipient,
    and its ORDER BY clause now reads 'ORDER BY revision DESC' rather than the prior ascending 'ORDER BY
    revision'. hypothesisRevisionListItemOf now sets the item's state field by passing row.state through
    the existing hypothesisRevisionStateOf validator (unchanged, already defined lower in this same file
    and already used by resolveHighestRevisionReleaseState and resolveHypothesisRevisionOwnState for the
    identical raw-string-to-typed-state conversion), so an unrecognized stored value raises the store's
    own read-failure error exactly as it already does for those two callers. No other statement, row shape
    or mapping function in this file changed.
criteria:
- criterion: Every revision the listing answers carries its own state.
  met: true
  how: hypothesisRevisionListItemOf now builds every HypothesisRevisionListItem it returns with a state
    field, set from hypothesisRevisionStateOf(row.state); listHypothesisRevisionsPage maps every row the
    page's SELECT returns through this same function, so no item the listing answers is built any other
    way.
- criterion: A revision whose own stored state is released is answered as released.
  met: true
  how: hypothesisRevisionsPageSelect's SELECT reads the state column directly off hypothesis_revisions
    for the matching case_slug/hypothesis_name; a row whose stored state is 'released' passes that exact
    string through hypothesisRevisionStateOf, which validates it against HYPOTHESIS_REVISION_STATE_VALUES
    and returns it unchanged, so the item's state field reads 'released'.
- criterion: A revision whose own stored state is draft is answered as draft.
  met: true
  how: The same SELECT and the same hypothesisRevisionStateOf conversion apply uniformly to every row;
    a row whose stored state is 'draft' is answered with state 'draft' by the identical path, with no branch
    that treats draft and released differently.
- criterion: The state a revision is answered with is read from that revision's own stored state and from
    no case version that references it.
  met: true
  how: hypothesisRevisionsPageSelect's statement text names only the hypothesis_revisions table in its
    FROM clause, filtered by case_slug and hypothesis_name alone, with no JOIN and no subquery against
    case_versions or case_version_hypotheses anywhere in the statement; the state value each item carries
    comes from that one table's own row.
- criterion: The listing answers a hypothesis's revisions ordered by revision number descending, highest
    first.
  met: true
  how: hypothesisRevisionsPageSelect's ORDER BY clause now reads 'ORDER BY revision DESC', replacing the
    prior ascending order, so the database itself returns rows highest-revision-first before pagination
    is applied, and listHypothesisRevisionsPage maps them in that same order.
- criterion: The listing answers one page selected by the requested offset and limit, together with the
    total number of revisions that hypothesis holds.
  met: true
  how: listHypothesisRevisionsPage was already unchanged by this task's edits — it still calls countHypothesisRevisions
    for the total, runs hypothesisRevisionsPageSelect with pagination.limit and pagination.offset bound
    as $3/$4, and returns a PaginatedResponse carrying data, total, limit, offset and pageCount; verified
    rather than reimplemented, since no criterion here asks for a different paging behavior than the one
    already delivered.
nodes:
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: The rule's statement, that a listing of one hypothesis's revisions states each answered revision's
    own state, draft or released, is exactly what HypothesisRevisionListItem's new state field and hypothesisRevisionListItemOf's
    new assignment together realize.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The rule's expression, that the page at offset 0 carries the hypothesis's highest existing revision
    and every later item's revision number is lower than the one before it, is exactly what hypothesisRevisionsPageSelect's
    'ORDER BY revision DESC' produces before LIMIT/OFFSET apply.
- node: contracts/knowledge/case-query
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: Honored for the one operation this task reaches, list-hypothesis-revisions; the other four operations
    the contract names (read-case, list-cases, list-case-versions, list-hypotheses) belong to earlier increments
    and are untouched by this task.
- node: constraints/listings-are-paged
  how: Not reached by new work. The offset/limit/total/pageCount paging behavior this constraint states
    was already delivered by an earlier task, and this task's own criterion 6 asks only that it be verified,
    not reimplemented; listHypothesisRevisionsPage's paging logic is untouched by this delivery's edits.
inferences:
- inferred: HypothesisRevisionListItem's new state field is placed after resolution in the type's declaration
    order, and hypothesisRevisionListItemOf sets it as the last property in the object literal it returns.
  from: No node or criterion states a field order; the type's existing four fields were left untouched
    in their existing order and the new field was appended, the same shape CaseVersionListItem already
    uses for its own state field alongside a sibling numeric identity field.
- inferred: No new SQL parameter or WHERE clause was added when selecting the state column; it was added
    to the existing SELECT's column list only.
  from: Criterion 4 asks that the value be read from the revision's own row and from no case-version join,
    which the existing WHERE clause (case_slug, hypothesis_name) already scopes correctly; adding a further
    condition would answer a fact no criterion asks for.
preserved:
- listHypothesisRevisionsPage's pagination behavior (offset/limit binding as $3/$4, total via countHypothesisRevisions,
  pageCount via pageCountOf) — untouched, verified against criterion 6 rather than reimplemented.
- collectsByRevision and hypothesisRevisionCollectsSelect, and the collects field they populate on each
  item — untouched.
- hypothesisRevisionStateOf and isHypothesisRevisionState, and their two existing callers resolveHighestRevisionReleaseState
  and resolveHypothesisRevisionOwnState — untouched; reused rather than duplicated for the new caller.
- Every file the task named as out of scope (case-query.port.ts, case-query.service.ts, list-hypothesis-revisions.controller.ts,
  list-hypothesis-revisions.routes.ts, list-hypothesis-revisions.dto.ts) — untouched; the item flows through
  each of them unreshaped, so the new state field reaches the HTTP response with no change to any of them.
---

## What it is

Two edits to the existing, already-working list-hypothesis-revisions read path: `HypothesisRevisionListItem`
gains a `state` field, and `relational-case-store.repository.ts`'s `hypothesisRevisionsPageSelect` now
selects the `hypothesis_revisions.state` column and orders by `revision DESC` instead of ascending.
`hypothesisRevisionListItemOf` converts the raw column through the store's existing `hypothesisRevisionStateOf`
validator, the same one already used for the highest-revision and own-state reads. Every layer above the
repository — service, controller, DTO, routes — is untouched, since none of them reshape the item.

## Notes

None beyond what the task's own Notes already state: criterion 6's pagination behavior was verified as
already correct rather than reimplemented, and the four out-of-scope files the task named were confirmed
to pass the item through unchanged.
