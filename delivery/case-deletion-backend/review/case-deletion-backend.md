---
target: backend
title: Review of case-deletion-backend
summary: 'Coverage, conformance, standard and failures passes over the case-deletion-backend delivery:
  case deletion for a versionless case, cascading through hypotheses, hypothesis-revisions and their collects,
  refused for any case holding a version.'
reviewed:
- migrations/0026-a-versionless-case-may-delete-released-collects.sql
- src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
- src/__tests__/integration/http/delete-case.routes.spec.ts
- src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/case/release.operation.spec.ts
- src/__tests__/unit/errors/case-holds-versions.error.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/delete-case.routes.spec.ts
- src/__tests__/unit/http/discard.routes.spec.ts
- src/__tests__/unit/http/update-draft.routes.spec.ts
- src/case/case-store.port.ts
- src/case/delete-case.operation.ts
- src/errors/case-holds-versions.error.ts
- src/errors/status-map.ts
- src/factories/build-app.factory.ts
- src/factories/case-lifecycle.factory.ts
- src/http/build-app.ts
- src/http/delete-case.controller.ts
- src/http/delete-case.routes.ts
- src/http/dto/delete-case.dto.ts
- src/persistence/relational-case-store.repository.ts
tasks:
- task/case-deletion/case-holds-versions-refusal
- task/case-deletion/store-deletes-a-versionless-case
- task/case-deletion/delete-case-over-case-lifecycle
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed; nothing to diagnose
coverage:
- criterion: A CaseHoldsVersionsError raised from a route handler is answered with HTTP 409.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseHoldsVersionsError to 409
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseHoldsVersionsError when the named case holds
      a draft version, carrying that slug in its details
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the identical status, code and details shape when the named case holds a released
      version instead of a draft one
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses that same HTTP delete through
      409 reporting CaseHoldsVersionsError for a case holding a draft version and a released version
- criterion: The response to a CaseHoldsVersionsError carries the error code CaseHoldsVersionsError.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: keeps its class-name string unchanged
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseHoldsVersionsError when the named case holds
      a draft version
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the identical status, code and details shape when the named case holds a released
      version
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses through 409 reporting CaseHoldsVersionsError
      for draft and released versions
- criterion: The message of a CaseHoldsVersionsError names the case slug it was raised for.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: names the case slug in a Brazilian-Portuguese message that calls the case "caso" and never the
      English word "case"
  why: The unit error spec is the only proof; the integration HTTP test's name says the message names
    the slug but no assertion in it checks that.
- criterion: The details of a CaseHoldsVersionsError carry the case slug it was raised for.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: holds exactly the slug it was constructed with, in its context, and no other field
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseHoldsVersionsError when the named case holds
      a draft version, carrying that slug in its details
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the identical status, code and details shape when the named case holds a released
      version
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses through 409 whose details carry
      exactly that slug
- criterion: The details of a CaseHoldsVersionsError carry no field other than the case slug.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: holds exactly the slug it was constructed with, in its context, and no other field
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses through 409 whose details carry
      exactly that slug and no other field
- criterion: The message of a CaseHoldsVersionsError is written in Brazilian Portuguese.
  state: partial
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: names the case slug in a Brazilian-Portuguese message that calls the case "caso" and never the
      English word "case"
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: names the remaining version by its fixed Portuguese noun "versão", unlike an implementation
      that would satisfy criteria 6-8 alone by writing the English word "versions" and the raw lifecycle
      token "draft"
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses through 409 whose message names
      the case slug in Brazilian Portuguese
  why: The tests pin a few Portuguese tokens ("caso", a form of "excluído", "versão") and the absence
    of "case"/"version(s)"/"draft", but nothing asserts the rest of the message is Portuguese, nor that
    it is Brazilian Portuguese specifically. Two of these assertions also over-assert wording the specification
    leaves open (see conformance findings against this file).
- criterion: The message of a CaseHoldsVersionsError names the case by the word "caso".
  state: covered
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: names the case slug in a Brazilian-Portuguese message that calls the case "caso" and never the
      English word "case"
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses through 409 whose message names
      the case in Brazilian Portuguese
- criterion: The message of a CaseHoldsVersionsError contains no occurrence of the English word "case"
    for the case.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: names the case slug in a Brazilian-Portuguese message that calls the case "caso" and never the
      English word "case"
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, and refuses through 409 whose message never
      uses the English word "case"
- criterion: Deleting through the case store a case that holds no case version leaves the store holding
    no case under that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: accepts deleting a case holding no version, removing it together with every hypothesis, every
      hypothesis-revision and every collect, and refuses deleting a case holding a draft or released version
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, removing it together with every hypothesis
      and hypothesis-revision and collect it held
- criterion: Deleting through the case store a case that holds no case version leaves the store holding
    no hypothesis referencing that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: accepts deleting a case holding no version, removing it together with every hypothesis, every
      hypothesis-revision and every collect
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, removing it together with every hypothesis
- criterion: Deleting through the case store a case that holds no case version leaves the store holding
    no hypothesis-revision, draft or released, of a hypothesis that referenced that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: accepts deleting a case holding no version, removing it together with every hypothesis-revision
      (draft and released)
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, removing every hypothesis-revision (released
      included)
- criterion: Deleting through the case store a case that holds no case version leaves the store holding
    no collect of those hypothesis-revisions.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: accepts deleting a case holding no version, removing every collect those revisions held
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, removing every collect it held
  why: Both fixtures put a collect only on a released hypothesis-revision; nothing checks that the collects
    of a draft hypothesis-revision are gone after the delete.
- criterion: Deleting through the case store a case that holds a draft case version is refused with a
    CaseHoldsVersionsError carrying that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses deleting a case holding a draft version through CaseHoldsVersionsError naming that slug,
      leaving it and everything it holds untouched
- criterion: Deleting through the case store a case that holds a released case version is refused with
    a CaseHoldsVersionsError carrying that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses deleting a case holding a released version through CaseHoldsVersionsError naming that
      slug
- criterion: A delete the case store refuses leaves the case still held under its slug.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: accepts deleting a case holding no version and refuses deleting a case holding a draft or a
      released version, leaving it and everything it holds untouched
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: refuses that same HTTP delete for a case holding a draft version and, identically, for one holding
      a released version, leaving each still held
  why: The store spec re-reads the case only after refusing a case with a draft version, not after refusing
    one with a released version; the released-version half of this criterion is unexercised against the
    store directly.
- criterion: A delete the case store refuses leaves every hypothesis referencing that slug, and every
    revision and collect of those hypotheses, still held.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses deleting a case holding a draft or a released version through CaseHoldsVersionsError
      naming that slug, leaving it and everything it holds untouched
  why: Only the refusal of a case with a draft version is followed by a check that hypotheses, revisions
    and collects remain; the released-version fixture creates no hypothesis at all, and the checks only
    count rows as greater than zero rather than checking an exact set.
- criterion: Deleting through the case store a slug no case holds is refused with a CaseNotFoundError
    carrying that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses deleting a slug no case holds, through CaseNotFoundError naming that slug
- criterion: A delete request on the case-lifecycle surface naming a case that holds no case version is
    answered with HTTP 204 and an empty body.
  state: covered
  tests:
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: removes the named case through delete and answers 204 with a wholly empty body
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: given a case whose only draft version was discarded, the deletion is accepted with 204 and an
      empty body
- criterion: A delete request on the case-lifecycle surface naming a case that holds a draft case version
    is answered with HTTP 409 reporting a CaseHoldsVersionsError whose details carry that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: refuses that same HTTP delete for a case holding a draft version through 409 reporting CaseHoldsVersionsError
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseHoldsVersionsError when the named case holds
      a draft version
  why: Only the integration test puts a real draft version in the case; the unit route test's mocked delete
    rejects with CaseHoldsVersionsError regardless of what the case holds, proving only that the route
    forwards the refusal.
- criterion: A delete request on the case-lifecycle surface naming a case that holds a released case version
    is answered with HTTP 409 reporting a CaseHoldsVersionsError whose details carry that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: refuses that same HTTP delete for a case holding a released version through 409 reporting CaseHoldsVersionsError
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the identical status, code and details shape when the named case holds a released
      version instead of a draft one
  why: Only the integration test puts a real released version in the case; the unit route test is identical
    to its draft sibling apart from name and slug.
- criterion: A delete request on the case-lifecycle surface naming a slug no case holds is answered with
    HTTP 404 reporting a CaseNotFoundError whose details carry that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: refuses an HTTP delete naming a slug no case holds, through 404 reporting CaseNotFoundError
      carrying that slug
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError when no case answers an unknown
      slug, carrying that slug in its details
- criterion: A delete request whose slug path segment fails the route's declared shape is answered with
    HTTP 400 with error code VALIDATION_ERROR and a non-empty details list.
  state: covered
  tests:
  - file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: answers 400 via validation for a request with an empty :slug segment, naming the path as what
      failed validation, without ever reaching delete
  why: 'Over-assertion noted, not a coverage gap: the test also requires the message contain "path", which
    the criterion does not state.'
- criterion: After an accepted delete, the case listing holds no entry for the deleted slug.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: given a case whose only draft version was discarded, the case no longer appears in the case
      listing after delete
- criterion: After an accepted delete of a case whose hypotheses included a released hypothesis-revision
    with a collect, no hypothesis, hypothesis-revision or collect of that case remains.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: accepts an HTTP delete of a case holding no version, removing it together with every hypothesis
      and every hypothesis-revision (released included) and collect it held
- criterion: After an accepted delete, a create-draft naming the deleted slug creates a case version numbered
    1.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: a later create-draft naming that same slug creates a new case under it as though the deleted
      one had never existed — a version numbered 1
- criterion: After an accepted delete and a create-draft naming the deleted slug, that case's next_version
    stands at 2.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: that case's next_version left standing at 2
- criterion: After an accepted delete and a create-draft naming the deleted slug, the case listing holds
    exactly one entry for that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/http/delete-case.routes.spec.ts
    name: the listing holding exactly one entry for it
- criterion: The delete operation's domain module imports no framework, driver or provider client package.
  state: uncovered
  why: No test in the set reads delete-case.operation.ts's own imports; the one import check in the set
    (build-app.spec.ts) reads only build-app, the diagnose route/controller/error-handler/DTO, and looks
    only for a second HTTP framework.
unpaired:
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: leaves an update through unrefused on a hypothesis-revision whose own state is draft, even though
      a released case version's manifest references that revision
  asserts: A raw UPDATE of the criterion on a draft-state hypothesis_revisions row succeeds and the new
    criterion reads back. A released case version's manifest references that row.
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: names only hypothesis_revisions' own state column in hypothesis_revisions_refuse_when_released()'s
      body, reading no case_version_hypotheses or case_versions relation
  asserts: The hypothesis_revisions_refuse_when_released() function exists exactly once. Its definition
    contains old.state and mentions neither case_version_hypotheses nor case_versions.
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: reads back a released hypothesis-revision's own collects exactly as they were stored, after
      an ordinary DELETE against those exact rows is attempted, where the revision's own case still holds
      a case-version
  asserts: A raw DELETE of a released revision's hypothesis_revision_collects rows leaves the collect
    reading back unchanged while the case still holds a released version. This is a schema-level check,
    not a delete through the case store.
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released even though no case
      version has ever referenced it, raising ReleasedHypothesisRevisionNotAlterableError
  asserts: A raw UPDATE on a released-state revision that no case version references is rejected with
    P0001 naming ReleasedHypothesisRevisionNotAlterableError, and the criterion is unchanged.
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError,
      rather than silently discarding it, where a released case version's manifest also references that
      revision
  asserts: A raw UPDATE on a released-state revision that a released version's manifest references is
    rejected with P0001 naming ReleasedHypothesisRevisionNotAlterableError, and the criterion is unchanged.
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: removes a draft hypothesis-revision's own collects through an ordinary DELETE, even where a
      released case version's manifest references that revision
  asserts: A raw DELETE removes a draft revision's collects even though a released version's manifest
    references that revision.
- test:
    file: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts
    name: removes a released hypothesis-revision's own collects through an ordinary DELETE, once its case
      holds no case-version at all
  asserts: A raw DELETE removes a released revision's collects once its case holds no case version. This
    is schema-level, not through the case store's delete.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a case exactly once in the page, however many versions it currently holds
  asserts: A case holding three versions appears exactly once in a listCases page.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a hypothesis holding three revisions ordered by revision number descending, the highest
      revision first
  asserts: listHypothesisRevisions answers three revisions as [third, second, first].
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is draft as draft
  asserts: A freshly inserted revision lists with state draft.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision whose own stored state is released as released
  asserts: A revision set to released by raw UPDATE lists with state released.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers a revision's own stored state — draft — even though a released case version's manifest
      still references that revision, reading the state from the revision's own row and not from the referencing
      case version
  asserts: A draft revision placed in a version that is then released still lists with state draft.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers absence, not a rejection, for a slug and version nothing was ever stored under
  asserts: assembleVersion answers undefined for a slug and version that were never stored.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: 'answers an empty page — data: [] — rather than an error or an absent value, for a page far
      beyond anything the table could hold'
  asserts: listCases at offset 100,000,000 answers a defined page whose data is [].
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers an empty page, never CaseNotFoundError, for a case that currently holds no version at
      all because the only one it ever held was discarded — its own identity row survives that, told apart
      here from a slug naming no case at all
  asserts: listCaseVersions on a case whose only draft was discarded answers exactly {data [], total 0,
    limit 20, offset 0, pageCount 0}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers an empty page, never CaseNotFoundError, for a case that has originated no hypothesis
      yet
  asserts: listHypotheses on a case with no hypothesis answers the exact empty envelope.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers an entry carrying exactly the slug and the six domain/knowledge/case-summary attributes
      — current_state, version_count, last_updated, title, when_to_use and released_version — nothing
      more, for a case whose highest-numbered version is released
  asserts: A released case's listCases entry has exactly the keys current_state, last_updated, released_version,
    slug, title, version_count and when_to_use.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers exactly the concepts the replacement carried, once that revision's collects are read
      back after the overwrite
  asserts: After overwriteHypothesisRevision, the revision's collects are exactly the two new concepts.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers none of the concepts the revision collected before the replacement, once the replacement
      drops them all
  asserts: An overwrite with empty collects leaves the revision with no collects.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the PaginatedResponse envelope src/types/pagination.ts declares — the given limit and
      offset echoed back, the page itself held to that limit even though more cases exist, and pageCount
      computed from total and limit rather than hardcoded
  asserts: listCases with limit 1 echoes limit and offset and returns one row. total is at least 2 and
    pageCount equals ceil(total/1).
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named
      case's own hypotheses — the given limit and offset echoed back, the page itself held to that limit
      even though the case holds more hypotheses, and pageCount computed from total and limit
  asserts: listHypotheses with limit 1 echoes limit and offset, returns one row, and reports total 3 and
    pageCount 3.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named
      case's own versions — the given limit and offset echoed back, the page itself held to that limit
      even though the case holds more versions, and pageCount computed from total and limit
  asserts: listCaseVersions with limit 1 echoes limit and offset, returns one row, and reports total 3
    and pageCount 3.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the PaginatedResponse envelope src/types/pagination.ts declares, scoped to the named
      hypothesis's own revisions — the given limit and offset echoed back, the page itself held to that
      limit even though the hypothesis holds more revisions, and pageCount computed from total and limit
  asserts: listHypothesisRevisions with limit 1 echoes limit and offset, returns one row, and reports
    total 3 and pageCount 3.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the page a middle offset selects under descending order — the second- and third-highest
      revisions, not the two most recently inserted
  asserts: Offset 1 and limit 2 over four revisions answers [third, second], with total 4 and limit and
    offset echoed.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the page in ascending slug order, the same order the offset and limit selected before
      the summary fields were derived, regardless of the order the cases were created in
  asserts: Three slugs created out of order list in ascending slug order.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers the replacement's own criterion and resolution, once that revision is read back after
      the overwrite
  asserts: After an overwrite, the revision reads back the new criterion and resolution with state draft.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: 'answers { revision: undefined } rather than raising, for a slug naming no case at all'
  asserts: 'readHighestRevisionReleaseState for an unknown slug answers exactly {revision: undefined}.'
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: assembles one version whole — its own attributes together with its manifest, ordered by position
      regardless of the order entries were placed in, each entry joined to its own adopted hypothesis-revision
      and its collects
  asserts: assembleVersion answers the draft's attributes and its manifest ordered by position, each entry
    carrying its own revision and its collects in sorted order.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: assigns the next version off the durable counter, never reusing a version number even after
      the draft that held it is discarded
  asserts: The sequence create, release, create, discard, create yields versions [1, 2, 3].
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries every answered revision's own state, reading the field as draft for a revision left
      at its schema default across a multi-revision page
  asserts: Three revisions left at their default all list with state draft.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries no state field at all for a hypothesis holding no revision — never defaulting it to
      a state that would route the write side onto the overwrite branch for a hypothesis that must instead
      create revision 1
  asserts: readHighestRevisionReleaseState for a never-originated hypothesis has no state property.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries none of title, when_to_use and released_version, each absent rather than null or empty,
      for a case currently holding no released version at all
  asserts: A never-released case's listCases entry is present and has no title, when_to_use or released_version.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision number a hypothesis currently holds, once it holds more than one
  asserts: readHighestRevisionReleaseState names the second, higher revision.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state as draft still, even once the case version that pins
      it moves to released state — releasing a case version never alters the hypothesis-revision's own
      state column
  asserts: A revision placed in a version that is then released reads {revision, state draft}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state as draft when only a case version in draft state pins
      it
  asserts: A revision placed only in a draft version reads {revision, state draft}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state as released once that row is updated directly, with
      no case version anywhere referencing it — this read never joins to case_version_hypotheses or case_versions
      at all
  asserts: A revision set to released by raw UPDATE, which no version references, reads {revision, state
    released}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the highest revision's own state, ignoring which revision a released case version's
      manifest pins — a released case version referencing only a lower revision of the same hypothesis
      leaves the freshly inserted highest revision reading its own default draft state
  asserts: 'When a released version pins a lower revision, the newer highest revision reads {revision:
    highest, state draft}.'
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: carries the released version's own title, when_to_use and released_version, never the higher-numbered
      draft's, when that case's highest-numbered version is a draft above a released one
  asserts: When a draft sits above a released version, the entry's title, when_to_use and released_version
    are the released version's.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: copies a named source version's manifest into the new draft's own manifest, entry for entry
  asserts: A draft created with source_version holds that version's manifest entry, with its revision
    and collects.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: copies the case's own latest released version's manifest when naming no source version at all
  asserts: A draft created without source_version holds the latest released version's one-entry manifest.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: counts an entry's version_count as the number of versions that case currently holds, across
      every state
  asserts: version_count is 3 for a case holding two released versions and one draft.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: creates a hypothesis's own identity row only the first time its name is used for a case, never
      a second one for a name already held
  asserts: Two revisions inserted under one name leave exactly one hypotheses row.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft,
      even though a released case version's manifest still references that revision
  asserts: Overwriting a draft revision that a released version references succeeds, and the new criterion
    reads back.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: excludes a different case's own revisions of a hypothesis sharing the same name, naming only
      the slug it was asked for
  asserts: listHypothesisRevisions answers only the named slug's revision of a hypothesis name that two
    cases share.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: excludes another case's own hypotheses from the page, naming only the slug it was asked for
  asserts: listHypotheses answers only the named slug's hypothesis.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: excludes another case's own versions from the page, naming only the slug it was asked for
  asserts: listCaseVersions answers only the named slug's version.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: excludes another hypothesis's own revisions from the page, within the same case, naming only
      the hypothesis name it was asked for
  asserts: listHypothesisRevisions answers only the named hypothesis's revision within one case.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
      holding no version at all
  asserts: A case whose only draft was discarded lists with version_count 0 and no current_state or last_updated.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: records the instant of release when release is called against a draft version
  asserts: release sets state to released and a defined released_at.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a second draft for a case that already holds one in draft state
  asserts: A second createDraft while a draft is held rejects with CaseAlreadyHasDraftError whose context
    carries the slug.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a second release call against a version already released, through CaseVersionNotDraftAtReleaseError,
      leaving its recorded released_at unchanged
  asserts: A second release rejects with CaseVersionNotDraftAtReleaseError {slug, version, state released},
    and released_at is unchanged.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a version already released, through CaseVersionNotDraftError, and leaves its five attributes
      exactly as they were — the guard runs before any write is attempted
  asserts: updateDraft on a released version rejects with CaseVersionNotDraftError {state released}, and
    title, when_to_use, subject and fallback are unchanged.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses an overwrite attempt against a revision whose own state is released, through the same
      typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's
      manifest has ever referenced that revision
  asserts: Overwriting a revision set to released by raw UPDATE rejects with ReleasedHypothesisRevisionNotAlterableError,
    which statusForError maps to 409.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses discard, through CaseNotFoundError naming the slug and version, against a version that
      was never stored
  asserts: discard of a never-stored version rejects with CaseNotFoundError {slug, version 1}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses discard, through CaseVersionNotDraftError, against a released version, leaving it —
      its state, its released_at and its manifest — untouched
  asserts: discard of a released version rejects with CaseVersionNotDraftError {state released}. The version
    stays released with its one-entry manifest.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses insertHypothesisRevision, through CaseHoldsNoDraftError naming the slug, against a case
      that currently holds no draft version, inserting no revision
  asserts: insertHypothesisRevision on a case holding only a released version rejects with CaseHoldsNoDraftError
    {slug} and writes no revision row.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses placeHypothesis, through CaseNotFoundError naming the slug and version, against a version
      that was never stored
  asserts: placeHypothesis on a never-stored version rejects with CaseNotFoundError {slug, version 1}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses placeHypothesis, through CaseVersionNotDraftError, against a released version, inserting
      no manifest entry
  asserts: placeHypothesis on a released version rejects with CaseVersionNotDraftError {state released},
    and the manifest stays empty.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses placing a revision at a manifest position already occupied by a different hypothesis
      in the same version
  asserts: Placing a second hypothesis at an occupied position rejects with ManifestPositionOccupiedError
    {slug, version, position 1}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses release, through CaseNotFoundError naming the slug and version, against a version that
      was never stored
  asserts: release of a never-stored version rejects with CaseNotFoundError {slug, version 1}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses releasing a hypothesis-revision already released, through HypothesisRevisionNotDraftAtReleaseError,
      leaving its own stored state exactly as it was
  asserts: A second releaseHypothesisRevision rejects with HypothesisRevisionNotDraftAtReleaseError, and
    the state stays released.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses releasing a hypothesis-revision identity that was never stored at all, through HypothesisRevisionNotDraftAtReleaseError
  asserts: releaseHypothesisRevision on a never-stored identity rejects with HypothesisRevisionNotDraftAtReleaseError.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses removeManifestEntry, through CaseNotFoundError naming the slug and version, against
      a version that was never stored
  asserts: removeManifestEntry on a never-stored version rejects with CaseNotFoundError {slug, version
    1}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses removeManifestEntry, through CaseVersionNotDraftError, against a released version, leaving
      its own manifest entry in place
  asserts: removeManifestEntry on a released version rejects with CaseVersionNotDraftError {state released},
    and the entry stays in place.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming both the slug and the version, a known case that never
      held the given version number
  asserts: updateDraft on a version number a known case never held rejects with CaseNotFoundError {slug,
    version}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a known case that has never originated a
      hypothesis by the given name
  asserts: listHypothesisRevisions for a known case and a hypothesis name it never originated rejects
    with CaseNotFoundError {slug, version 0}.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all (listCaseVersions)
  asserts: An unknown slug rejects with CaseNotFoundError {slug, version 0} on listCaseVersions.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all (listHypotheses)
  asserts: An unknown slug rejects with CaseNotFoundError {slug, version 0} on listHypotheses.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all (listHypothesisRevisions)
  asserts: An unknown slug rejects with CaseNotFoundError {slug, version 0} on listHypothesisRevisions.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all (updateDraft)
  asserts: An unknown slug rejects with CaseNotFoundError {slug, version 1} on updateDraft.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: releases a hypothesis-revision whose currently stored state is draft, reading released back
      afterward
  asserts: After releaseHypothesisRevision on a draft revision, readHypothesisRevisionOwnState answers
    released.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: removes a draft version and its own manifest entries, without deleting any hypothesis-revision
  asserts: After discard, assembleVersion answers undefined, and the hypothesis_revisions row remains.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: removes only the named manifest entry, never the hypothesis-revision it referenced
  asserts: removeManifestEntry empties the manifest, and the hypothesis_revisions row remains.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: resolves the overwrite with undefined rather than echoing back a revision number the way inserting
      one does
  asserts: overwriteHypothesisRevision resolves to undefined.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: resolves without raising, leaving no new row behind, when the named revision does not exist
      for that hypothesis
  asserts: Overwriting a revision number that was never held resolves to undefined and adds no revision.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every case currently held, with no filter narrowing it, so all three freshly created
      cases show up on one wide-enough page
  asserts: A wide listCases page includes three freshly created slugs.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every hypothesis the named case has ever originated, by its own bare name, regardless
      of how many revisions each one holds
  asserts: listHypotheses answers [alpha, beta], each once, although beta holds two revisions.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every revision the named hypothesis currently holds, by its own full content, each revision's
      own collects grouped to it alone and never conflated with another revision of the same hypothesis
  asserts: listHypothesisRevisions answers both revisions, highest first, each with its own criterion,
    collects and draft state.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every version the named case currently holds, by its own number and lifecycle state,
      highest-numbered first, regardless of how many of them have since been released
  asserts: listCaseVersions answers [v2 draft, v1 released].
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: says a hypothesis holds no revision at all, when the case has never originated it
  asserts: readHighestRevisionReleaseState for a never-originated hypothesis answers revision undefined.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: starts a case's very first draft with an empty manifest, since no released version exists yet
      to copy from
  asserts: A case's first draft assembles with an empty manifest.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: still returns a hypothesis originated but never placed into any manifest, and one placed into
      the case's own current version and then removed from it — case membership does not depend on that
      version's own manifest
  asserts: listHypotheses includes both a hypothesis never placed and one placed and then removed from
    the manifest.
- test:
    file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: still shows a case currently holding no version as its own entry in the page
  asserts: A case whose only draft was discarded still has an entry in listCases.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a case with no hash property at all, since read-case no longer pins by content
  asserts: The result of readCase has no hash property.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a document that would fail read-case structurally, rather than refusing it, because
      replay skips the structural refusal too
  asserts: replayCase answers a hypothesis-less version with hypotheses [] where readCase refuses it.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared attributes even though its stored subject names a subject type
      the glossary does not hold
  asserts: readCaseVersion answers a draft whose subject is not in the glossary, with that subject.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared attributes even though its stored title is blank
  asserts: readCaseVersion answers a draft with a blank title, with title ''.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a draft's own declared title, when_to_use, subject and fallback exactly as its stored
      record carries them, even though its manifest holds no entry
  asserts: readCaseVersion answers exactly the draft's title, when_to_use, subject and fallback, although
    its manifest is empty.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a released version's own declared attributes unvalidated, even though the same stored
      content fails read-case's structural validation
  asserts: readCaseVersion answers a released version's attributes where readCase refuses it as structurally
    invalid.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a version written directly to the store as its very next read, with no separate publish
      step anywhere in this composition
  asserts: readCase answers an unreleased version right after it is written, with state draft.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers each version by its own content, never another version's
  asserts: readCase on the second version answers that version's own title.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers each version's own title, never another version's, for the same case
  asserts: readCaseVersion on the second version answers the title 'version two'.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers identical input requirements for a draft version and the same version once released
  asserts: readCaseInputRequirements answers the same result before and after the version is released.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers replayCase with exactly the case readCase answers for the same pinned version, minus
      the content-identity pin read-case alone carries
  asserts: replayCase equals readCase's case for the same version.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the case whole, matching exactly what the document holds, when every structural and
      coherence rule holds for it
  asserts: readCase answers the complete case, including manifest and hypotheses, for a coherent released
    version.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the draft's own declared consolidation_register exactly as its stored record carries
      it, when the draft declares one
  asserts: readCaseVersion answers consolidation_register 'formal' as stored.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the replay whole, matching exactly what the document holds, including its hypotheses
      and their resolutions and referrals
  asserts: replayCase answers the complete case, with hypotheses, resolutions and referrals.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version a replay names, unaffected by a later version stored afterward under the
      same slug
  asserts: replayCase on the first version answers the first version's title after a second version is
    stored.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version stored under the named slug, never the same version number stored under
      a different slug
  asserts: replayCase answers the named slug's version, not another slug's version with the same number.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: derives from the currently registered capabilities read fresh at every call, answering differently
      once a capability is registered between two calls for the same version
  asserts: readCaseInputRequirements answers [] before a capability is registered and ['an-attribute']
    after.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: folds a concept whose answering capability is later forgotten into no attribute for that concept,
      rather than refusing the read
  asserts: Once the answering capability is forgotten, readCaseInputRequirements answers requirements
    [] instead of refusing.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several coherence violations into the one CaseVersionNotValidError
  asserts: A missing action and a missing concept yield one CaseVersionNotValidError that lists both violations
    in order.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several structural violations into the one CaseVersionNotValidError
  asserts: A blank title and no hypotheses yield violations ['o título está em branco', 'o caso não declara
    nenhuma hipótese'].
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: leaves replayCase unrevalidated by this change — a replay still answers the pinned version's
      content even though the same content now fails readCaseInputRequirements's coherence check
  asserts: replayCase answers the version where readCaseInputRequirements refuses it on coherence.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: lets a capability-registry integrity failure reach the caller rather than becoming a coherence
      violation of the case
  asserts: readCase rejects with the same DuplicateConceptAnswerError that the capability query throws.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: names only the structural violations, never a coherence one, when a document fails both a structural
      rule and what would otherwise be a coherence rule
  asserts: A version that fails both a structural and a coherence rule is refused with only ['o título
    está em branco'].
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: raises CaseNotFoundError, carrying the slug and version, when no case version is stored for
      them
  asserts: readCaseVersion on an absent version rejects with CaseNotFoundError {slug, version}.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a case failing one structural rule, naming the violation in a CaseVersionNotValidError
  asserts: readCase on a hypothesis-less version rejects with CaseVersionNotValidError whose violations
    are ['o caso não declara nenhuma hipótese'].
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a draft version's input requirements once a coherence rule stops holding for its collected
      concept, the same CaseVersionNotValidError read-case itself throws for the identical content
  asserts: readCaseInputRequirements rejects with CaseVersionNotValidError naming the missing concept,
    and not with CaseNotFoundError.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a stored case version failing validation at a read through CaseVersionNotValidError
      alone, naming the case slug, the version and the validator rule that fails in Brazilian Portuguese,
      mapped to the 409 the read-by-name rule requires, and never through CaseNotFoundError
  asserts: The CaseVersionNotValidError message contains the slug, the version and the Portuguese violation,
    and statusForError maps the error to 409.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally invalid case version the same way read-case does, naming the violation
      in a CaseVersionNotValidError
  asserts: readCaseInputRequirements on a hypothesis-less version rejects with CaseVersionNotValidError
    carrying the structural violation.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally valid case failing one coherence rule, as the composed CaseVersionNotValidError
      rather than the coherence module's own IncoherentCaseError
  asserts: A missing concept yields CaseVersionNotValidError, not IncoherentCaseError, naming the concept.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the capability registry no longer
      answers a concept it depends on
  asserts: readCase succeeds, then rejects with CaseVersionNotValidError once the capability is forgotten.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the glossary no longer holds a concept
      it depends on
  asserts: readCase succeeds, then rejects with CaseVersionNotValidError once the concept is forgotten.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses replay with the same CaseNotFoundError as read-case when the pinned version was never
      stored
  asserts: replayCase on a never-stored version rejects with CaseNotFoundError.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
      (readCase)
  asserts: An empty store rejects with CaseNotFoundError {slug, version 7} on readCase.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
      (readCaseInputRequirements)
  asserts: An empty store rejects with CaseNotFoundError {slug, version 7} on readCaseInputRequirements.
- test:
    file: src/__tests__/unit/case/case-query.service.spec.ts
    name: replays a pinned version without running the coherence checks at all, answering the case even
      though the same content would refuse at read-case
  asserts: With an empty glossary and no capabilities, readCase refuses but replayCase answers the slug.
- test:
    file: src/__tests__/unit/case/release.operation.spec.ts
    name: names the hypothesis and states that its manifested revision is not released using "liberada",
      never the raw lifecycle token, when release finds a manifested revision whose own state is not released
  asserts: Releasing a version that manifests a draft revision rejects with CaseVersionNotReleasableError.
    It carries one violation, which contains 'h1' and "liberada" and neither "released" nor "draft".
- test:
    file: src/__tests__/unit/case/release.operation.spec.ts
    name: names the structural violation and the manifest-own-state violation together, refusing once,
      when a release attempt fails a structural rule and separately manifests a still-draft hypothesis-revision
  asserts: 'One CaseVersionNotReleasableError carries two violations: the blank title and the h1 "liberada"
    violation.'
- test:
    file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
    name: extends Error directly and carries no status of its own, unlike an implementation that would
      satisfy every stated criterion by subclassing a web framework's own HTTP error type and setting
      status 409 itself
  asserts: CaseHoldsVersionsError's prototype parent is Error, and an instance has no statusCode property.
    This is a structural fact about the error class, which no criterion states.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: maps CaseAlreadyHasDraftError and ManifestPositionOccupiedError to the same non-500 status,
      pinning "distinct" as specific rather than mutually exclusive across all seven
  asserts: statusForError gives CaseAlreadyHasDraftError and ManifestPositionOccupiedError the same status.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: maps OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
      all to 422, pinning "distinct" as specific rather than mutually exclusive across all three
  asserts: statusForError maps all three OpenAPI errors to 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: refuses a subject built with no attribute-value at all with an HTTP 422 response reporting SubjectCarriesNoAttributeError,
      end to end from the refusal buildSubject actually raises
  asserts: buildSubject with no attributes throws SubjectCarriesNoAttributeError, which statusForError
    maps to 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CapabilityIdentityNotFoundError to 404
  asserts: statusForError(CapabilityIdentityNotFoundError) is 404.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseAlreadyHasDraftError to 409
  asserts: statusForError(CaseAlreadyHasDraftError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseHoldsNoDraftError to 409
  asserts: statusForError(CaseHoldsNoDraftError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseNotFoundError to 404
  asserts: statusForError(CaseNotFoundError) is 404.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotDraftAtReleaseError to 409
  asserts: statusForError(CaseVersionNotDraftAtReleaseError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotDraftError to 409
  asserts: statusForError(CaseVersionNotDraftError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotReleasableError to 422
  asserts: statusForError(CaseVersionNotReleasableError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotReleasedError to 409
  asserts: statusForError(CaseVersionNotReleasedError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotValidError to 409, never the generic unmapped-error fallback
  asserts: statusForError(CaseVersionNotValidError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptDescriptionRequiredError to 422
  asserts: statusForError(ConceptDescriptionRequiredError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptNotAnsweredError to 404
  asserts: statusForError(ConceptNotAnsweredError) is 404.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptNotInGlossaryError to 404
  asserts: statusForError(ConceptNotInGlossaryError) is 404.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptRefusesSubjectTypeError to 422
  asserts: statusForError(ConceptRefusesSubjectTypeError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConnectorPlaceholderOutsideInputSchemaError to 422
  asserts: statusForError(ConnectorPlaceholderOutsideInputSchemaError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves DuplicateConceptAnswerError to 500
  asserts: statusForError(DuplicateConceptAnswerError) is 500.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves HypothesisNotInManifestError to 404
  asserts: statusForError(HypothesisNotInManifestError) is 404.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves HypothesisRevisionCollectsNoConceptError to 422
  asserts: statusForError(HypothesisRevisionCollectsNoConceptError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves IncompleteConnectorConfigurationError to 422
  asserts: statusForError(IncompleteConnectorConfigurationError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves InvestigationWriteDeadlineExceededError to 500
  asserts: statusForError(InvestigationWriteDeadlineExceededError) is 500.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves MalformedCapabilityInputSchemaError to 422
  asserts: statusForError(MalformedCapabilityInputSchemaError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ManifestPositionOccupiedError to 409
  asserts: statusForError(ManifestPositionOccupiedError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ManifestWouldHoldNoHypothesisError to 422
  asserts: statusForError(ManifestWouldHoldNoHypothesisError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiDocumentNotFetchedError to 422
  asserts: statusForError(OpenApiDocumentNotFetchedError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiDocumentNotReadableError to 422
  asserts: statusForError(OpenApiDocumentNotReadableError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiOperationNotFoundError to 422
  asserts: statusForError(OpenApiOperationNotFoundError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ReleasedHypothesisRevisionNotAlterableError to 409
  asserts: statusForError(ReleasedHypothesisRevisionNotAlterableError) is 409.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves SubjectDoesNotCoverCaseInputsError to 422
  asserts: statusForError(SubjectDoesNotCoverCaseInputsError) is 422.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: returns undefined for a thrown value that is not an Error at all
  asserts: statusForError on a plain string is undefined.
- test:
    file: src/__tests__/unit/errors/status-map.spec.ts
    name: returns undefined for a typed domain error the table does not name
  asserts: statusForError(IncoherentCaseError) is undefined.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 200 and invokes the diagnose handler for a request whose body sits within the configured
      bodyLimit
  asserts: With bodyLimit 300, a small diagnose request answers 200 and calls runDiagnose once.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  asserts: A diagnose request with no headers answers 200.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 200 with the diagnose call's resolved assessment narrowed to the response DTO's four
      fields, for a request naming an existing case, subject, narrative and requester
  asserts: POST /v1/diagnose answers 200 with exactly outcome, referral and text.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 422 reporting SubjectCarriesNoAttributeError for a simulate-case request whose subject
      carries no attribute at all, now that the DTO admits the empty array through to the domain refusal
  asserts: POST /v1/simulate with empty attributes answers 422 with code SubjectCarriesNoAttributeError.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 500 with a generic message, never the rejected call's own error text, when the diagnose
      call itself rejects
  asserts: A rejected runDiagnose yields 500, and the body does not contain the error text.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers each of two requests naming the same case, subject, narrative and requester with that
      call's own resolved assessment narrowed to the response DTO's four fields, never a cached or joined
      value
  asserts: Two identical diagnose requests each answer their own runDiagnose result.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/capabilities/{name}/{version} through remove-capability and the GET
      to the identical path through read-capability-by-identity, neither one colliding with the other
  asserts: DELETE on the capability path answers 204, and GET on the same path answers 200.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/connectors/{connector} through remove-connector and the PUT to the
      identical path through register-connector, neither one colliding with the other
  asserts: DELETE on the connector path answers 204, and PUT on the same path answers 200.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/glossary/concepts/{name} through remove-concept and the PUT to the
      identical path through register-concept, neither one colliding with the other
  asserts: DELETE on the concept path answers 204, and PUT on the same path answers 200.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the GET to /v1/capabilities/{name}/{version} through read-capability-by-identity and
      the PUT to the identical path through register-capability, neither one colliding with the other
  asserts: GET and PUT on the capability identity path both answer 200.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: carries exactly outcome, referral, determining_hypothesis and text on the wire — never register,
      usage, elapsed_ms or prompt — when the resolved outcome names a determining hypothesis
  asserts: The diagnose response is exactly outcome, referral, determining_hypothesis and text.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: declares no authentication guard, middleware or credential check in any file of the API layer
  asserts: No .ts file under http/ matches the pattern of listed authentication identifiers.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: dispatches every registered route for a request carrying no credential of any kind, refusing
      none of them for lacking one
  asserts: No registered route, the delete-case route included, answers 401 or 403 to a request without
    credentials.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: imports fastify, and no second HTTP or router framework, across build-app, the route, the controller,
      the error handler and the DTO
  asserts: The import specifiers of build-app, the diagnose route, the diagnose controller, the error
    handler and the diagnose DTO include fastify and none of the listed HTTP frameworks. The delete operation
    is not among the files read.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: invokes the diagnose call under a fresh id for each of two requests naming the same case, subject,
      narrative and requester
  asserts: Two diagnose calls receive different ids.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: issues no register-capability call while draft-capability-schema-from-openapi answers a generated
      draft
  asserts: draft-capability-schema-from-openapi answers 200 and the registerCapability spy is never called.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: names no authentication package in any file of the API layer
  asserts: No .ts file under http/ imports a listed authentication package.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: omits determining_hypothesis, register, usage, elapsed_ms and prompt on the wire, and carries
      no verdict, citation or evidence field, when the resolved outcome names no determining hypothesis
  asserts: The diagnose response is exactly outcome, referral and text when there is no determining hypothesis.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: passes a given ticket_ref straight through to the diagnose call, unchanged
  asserts: runDiagnose receives ticket_ref 'TCK-42'.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: passes ticket_ref through as undefined to the diagnose call when the request names none, inventing
      no placeholder
  asserts: runDiagnose receives ticket_ref undefined, and the response is 200.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches its own controller rather than answering 404, for the $description route
  asserts: Each of 23 listed routes answers something other than 404 in the assembled app with stubbed
    dependencies. DELETE /v1/cases/a-slug (delete-case) is one of them; its status, body and error mapping
    are not checked here.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches read-capability-by-identity's own controller on the very first request a freshly built
      app instance ever receives, proving it is registered in routePlugins() with no dependency on any
      prior call to list-capabilities
  asserts: GET /v1/capabilities/a-capability/1.0.0 answers 200 as the first request.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches read-case-input-requirements's own controller through buildApp()'s registration, answering
      the query's own result unchanged, on the very first request a freshly built app instance ever receives
  asserts: The input-requirements route answers 200 with the stubbed query result.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches simulate-case's own controller through the identical routePlugins()/BuildAppDependencies/buildAppDependencies()
      convention every other route in this file is proven through, on the very first request a freshly
      built app instance ever receives, answering exactly the complete record runSimulate resolved — no
      narrative or ticket_ref field
  asserts: POST /v1/simulate answers 200 with exactly the six fields of the simulation record.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: refuses with 400 a request whose body names no narrative
  asserts: A diagnose request without narrative answers 400, and runDiagnose is not called.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: refuses with 400 a request whose subject carries no attribute at all
  asserts: A diagnose request with empty attributes answers 400, and runDiagnose is not called.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: refuses with 413 a request whose body exceeds the configured bodyLimit, invoking no route handler
  asserts: With bodyLimit 300, an oversized diagnose request answers 413, and runDiagnose is not called.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: registers at least one route on the assembled app, so the sweep below is never vacuous
  asserts: The assembled app registers more than 20 routes.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: registers every route plugin through one shared app.register() call site, never one repeated
      per route
  asserts: build-app.ts, with comment lines excluded, contains exactly one app.register( call.
- test:
    file: src/__tests__/unit/http/build-app.spec.ts
    name: runs the diagnose call under exactly the body's own requester, even when the request carries
      an authorization header naming a different identity
  asserts: runDiagnose receives the body's requester despite an authorization header, and the response
    is 200.
- test:
    file: src/__tests__/unit/http/delete-case.routes.spec.ts
    name: forwards CaseNotFoundError's own message through this route unreformatted, still naming the
      case in Brazilian Portuguese ("caso", never the English "case")
  asserts: When a mocked delete rejects with CaseNotFoundError, the delete-case route's response message
    matches \bcaso\b and not \bcase\b. Criteria 6-8 name CaseHoldsVersionsError's message, and criterion
    21 names the 404 status, code and details but not the message.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: accepts a discard of a draft whose stored subject names a subject type the glossary does not
      hold, answering 204 with an empty body, routed through the real controller and the real discard
      operation rather than a mocked dependency
  asserts: DELETE /v1/cases/{slug}/versions/{v} through the real discard operation answers 204 with an
    empty body, and the version no longer assembles.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers 400 for a non-numeric version segment, without ever reaching discard
  asserts: A non-numeric version segment answers 400, and discard is not called.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers 400 via validation for a request with an empty slug segment, without ever reaching discard
  asserts: DELETE /v1/cases//versions/1 answers 400, and discard is not called. This is the discard route,
    not the delete-case route.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers 400 via validation for a request with an empty version segment, without ever reaching
      discard
  asserts: An empty version segment answers 400, and discard is not called.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when discard
      rejects with a generic, non-domain error
  asserts: 'A generic rejection answers 500 with {error: {code INTERNAL_ERROR, message ''an unexpected
    error occurred''}}, and the error text is not leaked.'
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError when no version answers an
      unknown slug
  asserts: A CaseNotFoundError from discard answers 404 with code CaseNotFoundError and details {slug,
    version 9}.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError when the slug is known but
      the named version is not
  asserts: A CaseNotFoundError from discard answers 404 with code CaseNotFoundError and details {slug,
    version 99}.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version
      is not draft
  asserts: A CaseVersionNotDraftError from discard answers 409 with details {slug, version, state released}.
- test:
    file: src/__tests__/unit/http/discard.routes.spec.ts
    name: removes the named draft version through discard and answers 204 with a wholly empty body
  asserts: DELETE of a version answers 204 with an empty body and calls discard('a-slug', 3).
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 200 for a well-formed update-draft whose submitted subject names a subject type the
      glossary does not hold, since this route never checks glossary coherence
  asserts: PATCH with a subject not in the glossary answers 200.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 200 with the body built from caseQuery.readCaseVersion's own stored-record read, dropping
      none of its five declared attributes and carrying no manifest field
  asserts: PATCH answers 200 with exactly the five attributes read back. updateDraft and readCaseVersion
    receive the slug and version.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 400 for a body missing a required attribute, without ever reaching caseStore.updateDraft
  asserts: A body without title answers 400, and updateDraft is not called.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 400 for a non-numeric version segment, without ever reaching caseStore.updateDraft
  asserts: A non-numeric version segment answers 400, and updateDraft is not called.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 400 via validation for a request with an empty version segment, without ever reaching
      caseStore.updateDraft
  asserts: An empty version segment answers 400, and updateDraft is not called.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when updateDraft
      rejects with a generic, non-domain error
  asserts: A generic rejection answers 500 with the INTERNAL_ERROR envelope, and readCaseVersion is not
    called.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: names VALIDATION_ERROR, the body as the part that failed, and a non-empty details list, on that
      same missing-attribute refusal
  asserts: The missing-title refusal carries code VALIDATION_ERROR, a message containing 'body' and a
    non-empty details list. This is the update-draft route, not delete-case.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, and never reads the version
      back, when no version answers the named slug and version
  asserts: A CaseNotFoundError from updateDraft answers 404 with details {slug, version 9}, and readCaseVersion
    is not called.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError, and never reads the
      version back, when the named version is not draft
  asserts: A CaseVersionNotDraftError from updateDraft answers 409 with details {slug, version, state
    released}, and readCaseVersion is not called.
- test:
    file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: succeeds when consolidation_register is omitted from the body entirely, calling updateDraft
      with it absent rather than defaulted to some value
  asserts: PATCH without consolidation_register answers 200, and updateDraft's attributes have no consolidation_register
    property.
findings:
- pass: conformance
  file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  where: line 18, inside the test "names the case slug in a Brazilian-Portuguese message that calls the
    case \"caso\" and never the English word \"case\""
  evidence: expect(error.message).toMatch(/exclu[ií]do/i);
  cost: The node this test otherwise draws from requires only that the refusal name the case slug, write
    it in Brazilian Portuguese, and use "caso" rather than "case" — and its own Description states plainly
    that "how each message is built around these words stays free to be written and rewritten for clarity".
    A future message satisfying every one of those requirements but phrasing the refusal without the literal
    word "excluído"/"excluido" would fail this assertion though nothing the specification states would
    be violated — the suite polices a wording choice the specification explicitly leaves open.
  correction: 'Remove the exclu[ií]do assertion, or narrow it to only the facts the node states: the slug
    present, the fixed noun "caso" present, and the English word "case" absent.'
- pass: conformance
  file: src/__tests__/unit/errors/case-holds-versions.error.spec.ts
  where: line 36, inside the test "names the remaining version by its fixed Portuguese noun \"versão\"..."
  evidence: expect(error.message).toMatch(/\bversão\b/);
  cost: rules/knowledge/a-case-holding-no-version-may-be-deleted states only that the refusal's message
    "names the case slug" — it says nothing about the message needing to also name the version. A refusal
    message that names the slug alone, in Portuguese, without "case", "draft" or "version" — fully satisfying
    every stated requirement — would fail this positive assertion, so the suite requires content the rule
    that governs the message never asked for.
  correction: Drop the requirement that "versão" be present, keeping the negative checks that guard against
    the English word "version" and the raw "draft" token wherever the message does name the version.
- pass: conformance
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the violations arrays pinned for a coherence refusal of CaseVersionNotValidError, at the concept-violation
    assertion (line 533), the joined action-and-concept assertion (lines 547-550), and the readCaseInputRequirements
    coherence assertion (lines 750-754)
  evidence: "violations: [`the concept \"${CONCEPT}\" does not exist in the glossary`],\nviolations: [\n\
    \  `the action \"${ACTION}\" does not exist in the glossary`,\n  `the concept \"${CONCEPT}\" does\
    \ not exist in the glossary`,\n],"
  cost: The same CaseVersionNotValidError whose message this file elsewhere pins in Brazilian Portuguese
    for a missing-hypothesis violation ('o caso não declara nenhuma hipótese', line 502, and asserted
    via .message at lines 850-853) is pinned here, by three separate assertions, to carry an English sentence
    for a coherence violation. An operator reading a refusal that happens to fail on a concept or action
    coherence rule is handed wording the specification's own constraint says a domain refusal never carries,
    while the sibling structural refusal in the same file is correctly Portuguese — the file itself is
    the inconsistency's only record.
  correction: The pinned violation text for a missing concept or action would have to read in Brazilian
    Portuguese, the same as the missing-hypothesis and blank-title violations already pinned elsewhere
    in this file.
- pass: conformance
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the same three violations assertions (lines 533, 549 and 753), specifically the word naming the
    concept noun
  evidence: the concept "${CONCEPT}" does not exist in the glossary
  cost: This file fixes, by hard equality, the exact string the error's message carries — and that string
    names the noun this specification reserves one fixed Portuguese word for ("conceito") by its English
    word instead. A reader comparing this refusal against another that correctly says "conceito" has no
    way to tell whether the two speak of the same thing, which is exactly the confusion the fixed-vocabulary
    rule exists to close off.
  correction: The pinned violation text would have to name the noun "conceito", never "concept", to match
    the fixed Portuguese vocabulary this file already uses correctly for "caso" and "hipótese".
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: the hypothesesPageSelect function, lines 482-487
  evidence: SELECT name FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1 ORDER BY name LIMIT $2 OFFSET $3
  cost: Alphabetical-by-name is a business decision about which of a case's hypotheses a curator reaches
    first when paging list-hypotheses — the same kind of decision the specification made explicitly for
    the case catalog (rules/knowledge/a-case-listing-answers-cases-in-slug-order) and for a hypothesis's
    own revisions (rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first), each
    reasoning that an order "left undeclared... would be whatever the storage's own arrangement returned."
    Here the order is fixed by this SQL alone; a reader auditing what order list-hypotheses answers in
    finds the decision nowhere in the specification and has to reverse-engineer it from this query.
  correction: State the order a case's hypotheses listing answers in as its own invariant over domain/knowledge/hypothesis
    (mirroring the sibling orderings already decided for cases and for hypothesis-revisions), then have
    this SELECT read from that decision rather than fix it here first.
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: the overwriteRevision function, lines 797-804 (contrast with insertRevision, lines 741-751)
  evidence: "async function overwriteRevision(tx: IQueryable, input: OverwriteHypothesisRevisionInput):\
    \ Promise<void> {\n  const key: IRevisionKey = { slug: input.slug, hypothesis_name: input.hypothesis_name,\
    \ revision: input.revision };\n  await runStatement(tx, revisionOverwriteStatement(input), raiseOverwriteFailure(input));\n\
    \  await runStatement(tx, revisionCollectsDeleteStatement(key), raiseWriteFailure);\n  for (const\
    \ conceptName of input.collects) {\n    await runStatement(tx, revisionCollectStatement(key, conceptName),\
    \ raiseWriteFailure);\n  }\n}"
  cost: A hypothesis-revision left in draft state can outlive the one draft that ever revised it — the
    node this finding is about states plainly that a case emptied by discarding its one draft "can still
    be named by hypotheses nothing else can ever take down," and that a-hypothesis-is-revised-only-against-its-cases-draft
    "refuses even that once the case holds no draft." insertRevision, a few lines above in this same file,
    enforces exactly that refusal by calling requireCaseHoldsDraft(tx, input.slug) before writing; overwriteRevision
    performs the equivalent write — replacing an existing revision's content in place — with no such call
    and no table in its statements (hypothesis_revisions, hypothesis_revision_collects) that references
    case_versions at all. A curator who overwrites an orphaned draft-state revision after its case's one
    draft was discarded meets no CaseHoldsNoDraftError here, so the refusal the specification names for
    revising without a draft binds one of this file's two revise paths and not the other.
  correction: overwriteRevision should call requireCaseHoldsDraft(tx, input.slug) before applying revisionOverwriteStatement,
    the same guard insertRevision already applies.
- pass: standard
  file: src/http/delete-case.controller.ts
  where: handleDeleteCaseRequest, lines 8-10
  cites: SEC-01
  evidence: "export async function handleDeleteCaseRequest(dependencies: DeleteCaseControllerDependencies,\
    \ params: DeleteCaseParamsDto): Promise<void> {\n  await dependencies.delete(params.slug);\n}"
  cost: Nothing in this handler checks that the caller is entitled to delete the specific case named by
    params.slug — the slug alone is enough to reach the delete call. build-app.spec.ts's own sweep test
    ("dispatches every registered route for a request carrying no credential of any kind, refusing none
    of them") confirms this DELETE route answers a destructive, irreversible operation for a request carrying
    no credential at all, so any client that can reach the API can remove any case by name.
  correction: Add a resource-specific authorization check in handleDeleteCaseRequest (or the route) that
    verifies the caller may delete this particular case before dependencies.delete is invoked.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: RelationalCaseStore constructor, line 125
  cites: ARC-01
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: DatabaseConnection is imported from persistence/database-connection.ts, where it is a type alias
    for pg's own Pool class rather than an interface this module defines. The constructor therefore requires
    a concrete pg.Pool (or a full structural match of it) to construct RelationalCaseStore at all, so
    exercising this class outside the integration suite means either standing up a real pool or faking
    the whole Pool surface rather than a narrow port.
  correction: Declare a narrow interface for what RelationalCaseStore actually needs from the connection
    (query execution and transaction start) and have the constructor accept that instead of the pg-Pool-aliased
    DatabaseConnection.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: refuseIfCaseHoldsVersions, lines 906-911
  cites: COR-03
  evidence: "async function refuseIfCaseHoldsVersions(tx: IQueryable, slug: string): Promise<void> {\n\
    \  const count = await countCaseVersions(tx, slug);\n  if (count > 0) {\n    throw new CaseHoldsVersionsError(slug);\n\
    \  }\n}\n"
  cost: The business rule "a case holding a version may not be deleted" is decided and raised entirely
    inside the repository. delete-case.operation.ts — the file that stands in for the service in this
    feature — is a one-line pass-through ("await store.delete(slug)") with no rule of its own, so this
    invariant can only be exercised, changed or unit-tested against a real (or fully-scripted) store rather
    than at the layer the standard assigns business errors to.
  correction: Move the "case holds a version" check into the delete-case operation (reading through the
    store's query methods) so it raises CaseHoldsVersionsError there, leaving the repository's delete
    to perform only the writes once the operation has already permitted them.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
reconciliation: siegard-reconcile/case-deletion-backend.md
run: run/case-deletion-backend
---

## What it is

Coverage, conformance, standard-conformance and failures passes over the case-deletion-backend
delivery (tasks case-holds-versions-refusal, store-deletes-a-versionless-case and
delete-case-over-case-lifecycle): deleting a case that holds no case version, cascading through
its hypotheses, hypothesis-revisions and their collects, refused with CaseHoldsVersionsError for
any case holding a version and CaseNotFoundError for an unknown slug.

## Notes

Conformance: 6 findings. Two against src/__tests__/unit/errors/case-holds-versions.error.spec.ts
(over-assertion of wording the specification leaves free). Two against
src/__tests__/unit/case/case-query.service.spec.ts (an English-language coherence-violation
message contradicting the Brazilian-Portuguese constraint, and an English domain noun
contradicting the fixed-vocabulary constraint — both pre-existing, not introduced by this
delivery, but read by this pass because the file was in the reviewed set). Two against
src/persistence/relational-case-store.repository.ts (an unstated hypotheses-listing order, and a
contradicted rule: overwriteRevision does not guard against revising a hypothesis-revision once
its case holds no draft, unlike its sibling insertRevision).

Standard: 3 findings, all pre-existing patterns this delivery followed rather than introduced —
no resource-level authorization on any route (SEC-01), a repository constructor coupled to
pg.Pool directly rather than a narrow port (ARC-01), and a business refusal
(CaseHoldsVersionsError) raised from inside the repository rather than the operation layer
(COR-03).

Coverage: 28 criteria across 3 tasks — 20 covered, 7 partial, 1 uncovered (no test reads the
delete operation module for infra-free imports). 203 tests in the reviewed file set bear on no
criterion any task under this review states (unpaired) — the overwhelming majority are
pre-existing tests of sibling case-lifecycle/case-query behavior, unrelated to case deletion,
caught only because their files were widened to satisfy the ICaseStore interface change and so
entered the reviewed set whole.

Failures: the whole-project suite (install, typecheck, lint, secret-scan, unit tests, full test
suite) was captured green at run/case-deletion-backend; nothing to diagnose.

Trace: trace.py --fold and --bind-record ran over this record; 68 nodes cleared and bound, 14 the
judgment did not clear (left decided by reading, unbound by this act). No orphaned, moved or
proof-class drift was found over the reviewed file set itself; unrelated pre-existing drift
elsewhere in the trace (frontend code-class drift under edits_freely, and drift on files this
review did not touch) stands as it did before this review and is out of this review's scope.
