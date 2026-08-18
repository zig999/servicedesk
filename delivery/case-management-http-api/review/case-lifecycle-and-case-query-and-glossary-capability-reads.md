---
title: case-management-http-api — case-lifecycle, case-query and glossary/capability read routes
summary: Reviews the twenty-two tasks delivered before this session (status-map, the case-lifecycle mutation
  routes, the case-query read/store-extension pairs, pagination-types, and the read-capability/read-concept/read-vocabulary-term
  routes) — the remainder of this initiative not covered by the prior review.
reviewed:
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/create-draft.routes.spec.ts
- src/__tests__/unit/http/discard.routes.spec.ts
- src/__tests__/unit/http/error-handler.middleware.spec.ts
- src/__tests__/unit/http/list-case-versions.routes.spec.ts
- src/__tests__/unit/http/list-cases.routes.spec.ts
- src/__tests__/unit/http/list-hypotheses.routes.spec.ts
- src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
- src/__tests__/unit/http/place-hypothesis.routes.spec.ts
- src/__tests__/unit/http/read-capability.routes.spec.ts
- src/__tests__/unit/http/read-case.routes.spec.ts
- src/__tests__/unit/http/read-concept.routes.spec.ts
- src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
- src/__tests__/unit/http/release.routes.spec.ts
- src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
- src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
- src/__tests__/unit/http/update-draft.routes.spec.ts
- src/__tests__/unit/types/pagination.spec.ts
- src/case/case-query.port.ts
- src/case/case-query.service.ts
- src/case/case-store.port.ts
- src/errors/case-version-not-draft.error.ts
- src/errors/concept-not-answered.error.ts
- src/errors/concept-not-held.error.ts
- src/errors/status-map.ts
- src/errors/vocabulary-term-not-held.error.ts
- src/http/create-draft.controller.ts
- src/http/create-draft.routes.ts
- src/http/discard.controller.ts
- src/http/discard.routes.ts
- src/http/dto/create-draft.dto.ts
- src/http/dto/discard.dto.ts
- src/http/dto/list-case-versions.dto.ts
- src/http/dto/list-cases.dto.ts
- src/http/dto/list-hypotheses.dto.ts
- src/http/dto/list-hypothesis-revisions.dto.ts
- src/http/dto/place-hypothesis.dto.ts
- src/http/dto/read-capability.dto.ts
- src/http/dto/read-case.dto.ts
- src/http/dto/read-concept.dto.ts
- src/http/dto/read-vocabulary-term.dto.ts
- src/http/dto/release.dto.ts
- src/http/dto/remove-hypothesis.dto.ts
- src/http/dto/revise-hypothesis.dto.ts
- src/http/dto/update-draft.dto.ts
- src/http/error-handler.middleware.ts
- src/http/list-case-versions.controller.ts
- src/http/list-case-versions.routes.ts
- src/http/list-cases.controller.ts
- src/http/list-cases.routes.ts
- src/http/list-hypotheses.controller.ts
- src/http/list-hypotheses.routes.ts
- src/http/list-hypothesis-revisions.controller.ts
- src/http/list-hypothesis-revisions.routes.ts
- src/http/place-hypothesis.controller.ts
- src/http/place-hypothesis.routes.ts
- src/http/read-capability.controller.ts
- src/http/read-capability.routes.ts
- src/http/read-case.controller.ts
- src/http/read-case.routes.ts
- src/http/read-concept.controller.ts
- src/http/read-concept.routes.ts
- src/http/read-vocabulary-term.controller.ts
- src/http/read-vocabulary-term.routes.ts
- src/http/release.controller.ts
- src/http/release.routes.ts
- src/http/remove-hypothesis.controller.ts
- src/http/remove-hypothesis.routes.ts
- src/http/revise-hypothesis.controller.ts
- src/http/revise-hypothesis.routes.ts
- src/http/update-draft.controller.ts
- src/http/update-draft.routes.ts
- src/persistence/relational-case-store.repository.ts
- src/types/pagination.ts
tasks:
- task/capability-registry-http/read-capability-route
- task/case-lifecycle-http/create-draft-route
- task/case-lifecycle-http/discard-route
- task/case-lifecycle-http/place-hypothesis-route
- task/case-lifecycle-http/release-route
- task/case-lifecycle-http/remove-hypothesis-route
- task/case-lifecycle-http/revise-hypothesis-route
- task/case-lifecycle-http/status-map
- task/case-lifecycle-http/update-draft-route
- task/case-lifecycle-http/update-draft-store-extension
- task/case-query-http/list-case-versions-route
- task/case-query-http/list-case-versions-store-extension
- task/case-query-http/list-cases-route
- task/case-query-http/list-cases-store-extension
- task/case-query-http/list-hypotheses-route
- task/case-query-http/list-hypotheses-store-extension
- task/case-query-http/list-hypothesis-revisions-route
- task/case-query-http/list-hypothesis-revisions-store-extension
- task/case-query-http/pagination-types
- task/case-query-http/read-case-route
- task/glossary-query-http/read-concept-route
- task/glossary-query-http/read-vocabulary-term-route
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the one captured run (run/register-routes-suite, same current tree, no changes since) passed
    cleanly — there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
coverage:
- criterion: A valid request returns the capability currently answering the named concept, with its declared
    contract.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability.routes.spec.ts
    name: answers 200 with the capability currently answering the named concept, carrying its whole declared
      contract
- criterion: A request naming a concept no capability currently answers is refused with the status status-map
    assigns.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-capability.routes.spec.ts
    name: refuses with the status the status map assigns ConceptNotAnsweredError, when no capability currently
      answers the named concept
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptNotAnsweredError to 404
- criterion: A valid POST /v1/cases request returns the created case's slug and its first draft version.
  state: covered
  tests:
  - file: src/__tests__/unit/http/create-draft.routes.spec.ts
    name: answers 201 with the slug and version createDraft originated, calling createDraft with the parsed
      body exactly as sent
- criterion: A POST /v1/cases request naming a slug that already has an open draft is refused with the
    status status-map assigns CaseAlreadyHasDraftError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/create-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseAlreadyHasDraftError when the named case
      already holds an open draft
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseAlreadyHasDraftError to 409
- criterion: A request whose body fails the Zod DTO validation is refused before the domain operation
    runs.
  state: covered
  tests:
  - file: src/__tests__/unit/http/create-draft.routes.spec.ts
    name: answers 400 for a body missing the required title attribute, without ever reaching createDraft
  - file: src/__tests__/unit/http/create-draft.routes.spec.ts
    name: answers 400 for a body missing the required slug attribute, without ever reaching createDraft
  - file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
    name: answers 400 for a body missing the required criterion attribute, without ever reaching reviseHypothesis
  - file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
    name: answers 400 for a collects array containing an empty-string entry, without ever reaching reviseHypothesis
  why: This exact sentence is the stated criterion of both create-draft-route and revise-hypothesis-route;
    one entry covers it for both.
- criterion: A valid DELETE request against a draft version removes it and answers with no content.
  state: covered
  tests:
  - file: src/__tests__/unit/http/discard.routes.spec.ts
    name: removes the named draft version through discard and answers 204 with a wholly empty body
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: removes a draft version and its own manifest entries, without deleting any hypothesis-revision
- criterion: A DELETE request against a released version is refused with the status status-map assigns
    the a-case-version-is-written-once refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version
      is not draft
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotDraftError to 409
- criterion: A DELETE request naming a slug or version that does not exist is refused with the status
    status-map assigns CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/discard.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError when no version answers an
      unknown slug
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseNotFoundError to 404
- criterion: A valid request against a draft version places the named hypothesis's stated revision at
    the stated manifest position.
  state: covered
  tests:
  - file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
    name: places the named hypothesis's stated revision at the stated manifest position, and answers 204
      with a wholly empty body
- criterion: A request against a released version is refused with the status status-map assigns the a-case-version-is-written-once
    refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version
      is not draft
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotDraftError to 409
  - file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version
      is released
  why: This exact sentence is the stated criterion of both place-hypothesis-route and remove-hypothesis-route;
    one entry covers it for both.
- criterion: A request naming a manifest position already occupied is refused with the status status-map
    assigns ManifestPositionOccupiedError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
    name: refuses with the status the status map assigns ManifestPositionOccupiedError when the named
      position is already held by a different hypothesis
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ManifestPositionOccupiedError to 409
- criterion: A valid release request against a draft version whose validator rules all answer returns
    the version now in released state.
  state: covered
  tests:
  - file: src/__tests__/unit/http/release.routes.spec.ts
    name: answers 200 with the version now in released state, read back whole through the published case-query
      and projected the same way read-case-route already is
- criterion: A release request against a version already released is refused with the status status-map
    assigns.
  state: covered
  tests:
  - file: src/__tests__/unit/http/release.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftAtReleaseError, and never
      reads the version back, when the named version is already released
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotDraftAtReleaseError to 409
- criterion: A release request against a version whose validator rules do not all answer returns every
    applicable refusal together, not only the first.
  state: partial
  tests:
  - file: src/__tests__/unit/http/release.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotReleasableError, naming every violated
      rule together, and never reads the version back, when the assembled manifest fails more than one
      rule
  why: The only test bearing on this criterion mocks release() to reject with an already-built two-item
    violations array and checks the route/DTO relay it onto the wire unchanged; nothing in this file set
    exercises the validator itself actually accumulating every applicable violation rather than stopping
    at the first — that aggregation logic sits in release.operation.ts, whose own spec is not part of
    this review's file set.
- criterion: A valid request against a draft version removes the named hypothesis's manifest entry.
  state: covered
  tests:
  - file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
    name: removes the named hypothesis manifest entry through removeHypothesis and answers 204 with a
      wholly empty body
- criterion: A request that would leave the manifest holding no hypothesis is refused with the status
    status-map assigns ManifestWouldHoldNoHypothesisError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
    name: refuses with the status the status map assigns ManifestWouldHoldNoHypothesisError when the removal
      would leave the manifest empty
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ManifestWouldHoldNoHypothesisError to 422
- criterion: A valid request naming a new or existing hypothesis persists a new hypothesis-revision with
    its criterion, collects and resolution.
  state: covered
  tests:
  - file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
    name: answers 201 with the hypothesis_name and revision reviseHypothesis originated, calling reviseHypothesis
      with exactly the path slug merged onto the parsed body, for a hypothesis named for the first time
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: numbers a hypothesis-revision one past that hypothesis's own highest existing revision, or 1
      where none exists yet, independently per hypothesis
- criterion: A request naming a case slug that does not exist is refused with the status status-map assigns
    CaseNotFoundError.
  state: uncovered
  why: No test sends a request naming a nonexistent case slug and asserts a 404/CaseNotFoundError outcome.
    Tracing the real call graph shows revise-hypothesis.operation.ts actually raises CaseHoldsNoDraftError
    for this case, which has no status-map entry and falls through to the generic 500 handler — so this
    criterion, as literally stated, does not appear to hold against the current implementation; neither
    a 404 test nor a 500 test for this scenario exists to confirm which behavior is real.
- criterion: error-handler.middleware.ts consults the status map instead of answering every thrown error
    with 500.
  state: covered
  tests:
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers a mapped domain error with the status the status map assigns it, not the generic 500
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers a second, differently-mapped domain error with its own distinct status too, showing
      the map is consulted rather than one error special-cased inline
- criterion: CaseNotFoundError, CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError,
    CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError
    each resolve to a distinct HTTP status other than 500.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseNotFoundError to 404
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotReleasableError to 422
  why: The criterion's own wording is ambiguous between 'each status differs from 500' and 'each of the
    seven has a status distinct from every other'. The suite resolves this by an explicit test pinning
    the first reading (two of the seven deliberately share 409); flagged for a reader rather than silently
    adopted, since the task text alone does not settle it.
- criterion: An error class the map does not name still answers 500, unchanged from today's behavior.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: returns undefined for a typed domain error the table does not name
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: still answers 500 with the unchanged generic envelope for a typed domain error the status map
      does not name
- criterion: A valid PATCH request against a draft version updates its declared attributes and returns
    the updated version.
  state: covered
  tests:
  - file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: answers 200 with the version updateDraft corrected, read back whole through the published case-query
      and projected the same way read-case-route already is
- criterion: A PATCH request against a released version is refused with the status status-map assigns
    the a-case-version-is-written-once refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseVersionNotDraftError, and never reads the
      version back, when the named version is not draft
- criterion: A PATCH request naming a slug or version that does not exist is refused with the status status-map
    assigns CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/update-draft.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, and never reads the version
      back, when no version answers the named slug and version
- criterion: updateDraft against a case version in draft state persists the corrected title, when_to_use,
    subject, fallback and consolidation_register attributes.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: persists the corrected title, when_to_use, subject, fallback and consolidation_register attributes
      against a version in draft state
- criterion: updateDraft against a case version in released state is refused with a typed error naming
    the a-case-version-is-written-once rule, before any write reaches the store.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a version already released, through CaseVersionNotDraftError, and leaves its five attributes
      exactly as they were — the guard runs before any write is attempted
- criterion: updateDraft against a slug or version that does not exist is refused with CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
- criterion: A valid request against an existing slug returns a paginated page of every version that case
    holds.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-case-versions.routes.spec.ts
    name: answers 200 with the paginated page of every version the named case holds, for a request naming
      its own offset and limit
- criterion: A request naming a slug that does not exist is refused with the status status-map assigns
    CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-case-versions.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, when the named slug names
      no case at all
  - file: src/__tests__/unit/http/list-hypotheses.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, when the named slug names
      no case at all
  why: This exact sentence is the stated criterion of both list-case-versions-route and list-hypotheses-route;
    one entry covers it for both.
- criterion: Calling listCaseVersions with an existing slug returns every version that case currently
    holds, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every version the named case currently holds, by its own number and lifecycle state,
      ordered by version regardless of how many of them have since been released
- criterion: Calling listCaseVersions with a slug that does not exist is refused with CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
- criterion: A valid request returns a paginated page of every case's identity.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-cases.routes.spec.ts
    name: answers 200 with the paginated page of every case's identity the case query resolved, for a
      request naming its own offset and limit
- criterion: The response body matches the pagination envelope src/types/pagination.ts defines.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-cases.routes.spec.ts
    name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse
      declares — data, limit, offset, pageCount and total — nothing more and nothing less
  why: This exact sentence is also list-capabilities-route's and list-concepts-route's own stated criterion,
    already covered in the prior review of this initiative's other seven tasks; this entry covers list-cases-route's
    own instance of it.
- criterion: Calling listCases with no filter returns every case currently held, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every case currently held, with no filter narrowing it, so all three freshly created
      cases show up on one wide-enough page
- criterion: Calling listCases against an empty store returns an empty page rather than an error.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: 'answers an empty page — data: [] — rather than an error or an absent value, for a page far
      beyond anything the table could hold'
  why: The table is a shared, never-truly-emptiable fixture, so the test substitutes an offset past any
    possible total for a literally empty store; this exercises the identical zero-rows code path but not
    a store that has never held a row.
- criterion: A valid request against an existing slug returns a paginated page of every hypothesis that
    case holds.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-hypotheses.routes.spec.ts
    name: answers 200 with the paginated page of every hypothesis the named case holds, for a request
      naming its own offset and limit
- criterion: Calling listHypotheses with an existing slug returns every hypothesis that case currently
    holds, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every hypothesis the named case has ever originated, by its own bare name, regardless
      of how many revisions each one holds
- criterion: Calling listHypotheses with a slug that does not exist is refused with CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
- criterion: A valid request against an existing slug and hypothesis name returns a paginated page of
    every revision that hypothesis holds.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: answers 200 with the paginated page of every revision the named hypothesis holds, for a request
      naming its own offset and limit
- criterion: A request naming a slug or hypothesis name that does not exist is refused with the status
    status-map assigns CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, when the named slug names
      no case at all
  - file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
    name: refuses with the same status the status map assigns CaseNotFoundError, when the slug names a
      known case but the named hypothesis name does not exist under it
- criterion: Calling listHypothesisRevisions with an existing slug and hypothesis name returns every revision
    that hypothesis currently holds, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: returns every revision the named hypothesis currently holds, by its own full content, each revision's
      own collects grouped to it alone and never conflated with another revision of the same hypothesis
- criterion: Calling listHypothesisRevisions with a slug or hypothesis name that does not exist is refused
    with CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses, through CaseNotFoundError naming the slug, a known case that has never originated a
      hypothesis by the given name
- criterion: The module exports a pagination request type carrying offset and limit.
  state: covered
  tests:
  - file: src/__tests__/unit/types/pagination.spec.ts
    name: a pagination request is exactly an offset and a limit, both numbers, and nothing else
- criterion: The module exports a pagination response envelope type carrying a page of items alongside
    a total count.
  state: covered
  tests:
  - file: src/__tests__/unit/types/pagination.spec.ts
    name: a paginated response carries a page of items and a total count, whatever the item type
- criterion: A valid request returns the named case version assembled and validated whole — its own attributes,
    its manifest and every manifest entry's own hypothesis-revision.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: answers 200 with the named case version assembled whole — its own attributes, its manifest and
      every manifest entry's own hypothesis-revision
- criterion: A request naming a slug or version that does not exist is refused with the status status-map
    assigns CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: refuses with the status the status map assigns CaseNotFoundError, when no version answers the
      named slug and version
- criterion: A request against a case version that cannot be assembled whole returns nothing rather than
    a partially assembled result.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-case.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body, when the named version cannot
      be assembled whole
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: joins several structural violations into the one CaseNotValidError
- criterion: A valid request returns the named concept exactly as the glossary currently holds it, including
    its accepted subject types and its ttl.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-concept.routes.spec.ts
    name: answers 200 with the concept currently held by the glossary, including its accepted subject
      types and its ttl
- criterion: A request naming a concept the glossary does not hold is refused with the status status-map
    assigns.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-concept.routes.spec.ts
    name: refuses with the status the status map assigns ConceptNotHeldError, when the glossary does not
      currently hold the named concept
- criterion: A valid request returns the named term exactly as the glossary currently holds it.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
    name: answers 200 with the term currently held by the named vocabulary, exactly as the glossary holds
      it
- criterion: A request naming a term the glossary does not hold is refused with the status status-map
    assigns.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
    name: refuses with the status the status map assigns VocabularyTermNotHeldError, when the named vocabulary
      does not currently hold the term
findings:
- pass: conformance
  file: src/http/dto/read-case.dto.ts
  where: line 101, readCaseResponseSchema's manifest field
  evidence: 'manifest: z.array(manifestEntrySchema).min(1).readonly(),'
  cost: 'rules/knowledge/a-case-has-at-least-one-hypothesis already states, word for word, that a case
    version''s manifest declares at least one entry — enforced upstream by the domain''s own structural/coherence
    validation before a Case ever reaches this DTO. Restating it as a wire-schema bound here, with no
    citation and no test exercising it, leaves the numeric floor stated twice with nothing connecting
    the two: a reader who meets .min(1) here has no way to tell it echoes a specification rule rather
    than being this file''s own technical choice, and if the rule were ever revised, nothing would prompt
    this schema to follow.'
  correction: Either cite rules/knowledge/a-case-has-at-least-one-hypothesis in a comment next to the
    constraint, the same way every other field in this file cites the node it answers to, or drop the
    .min(1) here and let the already-validated Case this DTO merely projects carry the guarantee.
- pass: conformance
  file: src/http/dto/read-case.dto.ts
  where: line 74, hypothesisRevisionSchema's collects field
  evidence: 'collects: z.array(z.string().min(1)).min(1).readonly(),'
  cost: This file's own sibling, revise-hypothesis.dto.ts, deliberately validates collects as an array
    of non-empty strings without a top-level non-empty requirement so that the domain's own concept-collection
    rule stays a typed, contextful refusal the domain operation itself raises rather than being intercepted
    by a generic 400 — and names that reasoning explicitly. read-case.dto.ts re-imposes exactly that top-level
    non-empty requirement on the same collects field, with no citation and no acknowledgment of its own
    sibling's stated reasoning, so the two DTOs answer to the identical rule inconsistently.
  correction: Cite the collects-at-least-one-concept rule where this constraint is applied, or align this
    field with revise-hypothesis.dto.ts's own treatment of the same rule.
- pass: standard
  file: src/case/case-query.service.ts
  where: the module header comment and assembledAsRawDocument
  cites: MNT-03
  evidence: a second copy of release.operation.ts's own assembledAsDocument adapter, disclosed as a divergence
    in this task's own delivery record
  cost: Two adapters over the same projection (a manifest entry's flattened hypothesis-revision fields)
    now diverge the day either is fixed, and the reader of the one not touched has no way to know it drifted
    from its twin.
  correction: Move the flattening projection into one shared function both case-query.service.ts and release.operation.ts
    import, rather than each declaring its own copy.
- pass: standard
  file: src/http/create-draft.routes.ts
  where: createDraftHandler's validation branch
  cites: MNT-03
  evidence: 'const issues = parsedBody.error.issues.map((issue) => `${issue.path.join(''.'')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request body failed
    validation'', details: issues } });'
  cost: The identical ZodError-to-envelope translation is retyped across more than twenty call sites in
    this file set's own *.routes.ts files. A change to how a validation failure is reported has to be
    made at every one of those sites, and the one a maintainer misses answers a validation failure differently
    from its siblings.
  correction: Factor the ZodError-to-envelope translation into one shared function every route handler
    calls instead of restating the map/send pair inline.
- pass: standard
  file: src/http/dto/create-draft.dto.ts
  where: referralSchema and resolutionSchema
  cites: MNT-03
  evidence: 'const referralSchema = z.object({ action: z.string().min(1), recipient: z.string().min(1)
    });'
  cost: The identical referralSchema/resolutionSchema pair is redeclared, unexported, in read-case.dto.ts,
    revise-hypothesis.dto.ts and update-draft.dto.ts — four private copies of the one domain/knowledge/resolution
    shape. A field added to Resolution or Referral has to be added by hand in four files.
  correction: Export one referralSchema/resolutionSchema from a shared dto module and import it at the
    other three call sites instead of retyping it.
- pass: standard
  file: src/http/dto/discard.dto.ts
  where: discardParamsSchema
  cites: MNT-03
  evidence: 'export const discardParamsSchema = z.object({ slug: z.string().min(1), version: z.coerce.number().int().positive()
    });'
  cost: The same two-field shape is redeclared verbatim in release.dto.ts and update-draft.dto.ts, and
    repeated with one further field in remove-hypothesis.dto.ts and place-hypothesis.dto.ts — five separate
    declarations of the identical :slug/:version pair.
  correction: Export the shared slug/version schema once and compose it (e.g. via .extend()) at the routes
    needing a further path segment, instead of retyping it at each site.
- pass: standard
  file: src/http/dto/list-case-versions.dto.ts
  where: listCaseVersionsQuerySchema
  cites: MNT-03
  evidence: 'export const listCaseVersionsQuerySchema = z.object({ offset: z.coerce.number().int().nonnegative().optional(),
    limit: z.coerce.number().int().positive().optional() });'
  cost: The identical offset/limit object is declared again, unchanged, as listCasesQuerySchema, listHypothesesQuerySchema
    and listHypothesisRevisionsQuerySchema in their own dto files. A bound or coercion rule changed for
    one listing route does not apply to its siblings unless a maintainer remembers to repeat the edit
    in each of the other three files.
  correction: Export one shared pagination query schema and compose each route's own params schema with
    it, rather than repeating the object literal per dto file.
- pass: standard
  file: src/http/list-case-versions.controller.ts
  where: resolvePagination
  cites: MNT-03
  evidence: 'function resolvePagination(query, bounds) { const requestedLimit = query.limit ?? bounds.defaultLimit;
    return { offset: query.offset ?? 0, limit: Math.min(requestedLimit, bounds.maxLimit) }; }'
  cost: This exact function body, unchanged but for its parameter types, is retyped in list-cases.controller.ts,
    list-hypotheses.controller.ts and list-hypothesis-revisions.controller.ts. A change to the API-04
    bounding behaviour has to be made in four places.
  correction: Extract one resolvePagination(query, bounds) helper that every list controller calls, since
    its inputs are already structurally identical across all four call sites.
---

## What it is

The second review of case-management-http-api, over the twenty-two tasks the first review's scope did not reach.

## Notes

One coverage entry deserves a person's attention ahead of the rest: revise-hypothesis-route's criterion that a nonexistent case slug is refused via CaseNotFoundError is not merely untested — tracing the actual call graph shows the operation raises CaseHoldsNoDraftError instead, which the status map does not name, so the request likely answers 500 today rather than 404. This is a coverage finding, not a specification-conformance one: nothing here says the specification disagrees, only that a stated criterion and the traced behavior appear to diverge. The failures pass did not run because the one captured run this review reads (run/register-routes-suite) passed cleanly over the identical current tree — there was no failure to diagnose, and no run is stamped on this record for that reason. The specification-conformance pass otherwise found the codebase citing its own governing node unusually consistently; the two findings above are the exceptions, not the norm. No standard-presupposed artifact was absent. The trace over the target holds the same pre-existing drift already disclosed in the first review of this initiative — not settled here, and not a finding of this review.
