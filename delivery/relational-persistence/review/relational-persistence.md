---
title: Review of the relational-persistence initiative
summary: Coverage, specification-conformance and standard-conformance passes over all 17 delivered tasks
  and their 89 files; the failures pass did not run because the captured suite passed clean.
reviewed:
- migrations/0001-schema-migrations.sql
- migrations/0002-glossary-vocabulary.sql
- migrations/0003-capability-registry.sql
- migrations/0004-case-and-hypothesis.sql
- migrations/0005-investigation.sql
- migrations/0006-case-version-immutability.sql
- migrations/0007-capability-concept.sql
- package.json
- src/__tests__/integration/factories/author-case-version.factory.spec.ts
- src/__tests__/integration/factories/case-query.factory.spec.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/factories/store-wiring.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/integration/persistence/database-access.spec.ts
- src/__tests__/integration/persistence/isolated-connection.spec.ts
- src/__tests__/integration/persistence/migration-runner.spec.ts
- src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/integration/vitest-global-setup.spec.ts
- src/__tests__/unit/case/author-case-version.service.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/case/case-resolution.spec.ts
- src/__tests__/unit/case/parse-case-document.spec.ts
- src/__tests__/unit/config/env.spec.ts
- src/__tests__/unit/dependency-manifest.spec.ts
- src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
- src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
- src/__tests__/unit/factories/store-wiring.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/migrate.spec.ts
- src/__tests__/unit/no-test-creates-or-alters-a-table.spec.ts
- src/__tests__/unit/persistence/database-access.spec.ts
- src/__tests__/unit/persistence/database-connection.spec.ts
- src/__tests__/unit/persistence/migration-runner.spec.ts
- src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/seed.spec.ts
- src/case/author-case-version.port.ts
- src/case/author-case-version.service.ts
- src/case/case-query.port.ts
- src/case/case-query.service.ts
- src/case/case-resolution.ts
- src/case/case.ts
- src/case/parse-case-document.ts
- src/config/env.ts
- src/errors/case-version-already-stored.error.ts
- src/errors/migration-step.error.ts
- src/errors/written-at-required.error.ts
- src/factories/author-case-version.factory.ts
- src/factories/capability-registry.factory.ts
- src/factories/case-query.factory.ts
- src/factories/case-store.factory.ts
- src/factories/diagnose-server.factory.ts
- src/factories/diagnose.factory.ts
- src/factories/glossary.factory.ts
- src/factories/investigation-store.factory.ts
- src/factories/production-diagnose.factory.ts
- src/fixtures/case/intermittent-connection-outage/1.json
- src/investigation/investigation-factory.ts
- src/investigation/investigation.ts
- src/investigation/run-diagnosis.ts
- src/migrate.ts
- src/package.json
- src/persistence/database-access.ts
- src/persistence/database-connection.ts
- src/persistence/file-capability-store.repository.ts
- src/persistence/file-case-store.repository.ts
- src/persistence/file-glossary-store.repository.ts
- src/persistence/file-investigation-store.repository.ts
- src/persistence/isolated-connection.ts
- src/persistence/json-file.ts
- src/persistence/migration-runner.ts
- src/persistence/pg.d.ts
- src/persistence/relational-capability-store.repository.ts
- src/persistence/relational-case-store.repository.ts
- src/persistence/relational-glossary-store.repository.ts
- src/persistence/relational-investigation-store.repository.ts
- src/seed.ts
- src/vitest-global-setup.ts
- vitest.config.ts
tasks:
- task/case-and-investigation-model/case-aggregate-shape
- task/case-and-investigation-model/investigation-record-shape
- task/case-and-investigation-model/precedence-from-position
- task/case-and-investigation-model/replay-by-slug-and-version
- task/case-authoring/author-case-version-command
- task/case-authoring/curated-data-seeded
- task/relational-stores/capability-store
- task/relational-stores/case-store
- task/relational-stores/database-access-helper
- task/relational-stores/glossary-store
- task/relational-stores/investigation-store
- task/relational-substrate/database-connection
- task/relational-substrate/integration-test-isolation
- task/relational-substrate/migration-step
- task/relational-substrate/schema-migrations
- task/service-on-the-database/diagnose-end-to-end
- task/service-on-the-database/store-wiring
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/review-relational-persistence) passed every step with 0 test failures;
    there was no failure to diagnose
coverage:
- criterion: The case aggregate declares no hash, and no module derives a digest over a case's content.
  state: partial
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: drops a hash the document still declares, carrying it into no part of the parsed aggregate
  why: Only the 'aggregate declares no hash' half is exercised (parseCaseDocument drops a submitted hash,
    and the Case type carries none). Nothing in the test set sweeps for absence of digest derivation over
    a case's content anywhere in the tree, and the persistence layer itself does derive such a digest
    (RelationalCaseStore's content-identity hash, exercised by relational-case-store.repository.spec.ts's
    own 'computes StoredCaseVersion's own hash as sha256 of the assembled document's own JSON serialization')
    — no test in the set draws or checks the boundary between that store-level pin and this criterion's
    'no module derives a digest over a case's content'.
- criterion: A parsed case version carries authored_at as a datetime, and a submission that states none
    is refused naming that field.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: carries the document's declared authored_at unchanged, as the case's own datetime
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document that leaves %s undeclared
- criterion: A parsed hypothesis carries its declared position as an integer, and a submission whose hypothesis
    states none is refused naming that field.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: carries each hypothesis's own declared position unchanged, in the document's own order
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis that declares no position
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis whose position is not an integer, instead of coercing it
- criterion: A submission in which two hypotheses share a position is refused, naming both.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case whose two hypotheses share a position, naming both
- criterion: A submission in which two hypotheses share a name is refused, naming both.
  state: partial
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case whose two hypotheses share a name
  why: The refusal and the shared name are asserted (expect.stringContaining('share the name "incidente-regional"')),
    but the assertion never checks that both hypotheses' locators (e.g. 'hypotheses 1, 2') appear together
    in the message the way the sibling position test does ('hypotheses 1, 2 share the position 1') — a
    message that dropped one of the two locators would still pass this test, so 'naming both' is not exercised
    for the name rule.
- criterion: A submission declaring no hypothesis is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case that declares no hypotheses attribute
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case declaring an empty list of hypotheses
- criterion: A submission whose hypothesis collects no concept is refused, naming the hypothesis.
  state: partial
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis that declares no collects
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis collecting no concept
  why: Both tests assert only expect.stringContaining('collects no concept'); the actual message also
    names the hypothesis locator ('hypothesis 1 collects no concept'), but neither assertion checks for
    it, so a message that dropped the hypothesis locator would still pass — 'naming the hypothesis' is
    unexercised.
- criterion: A submission whose hypothesis carries an empty criterion is refused, naming the hypothesis.
  state: partial
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis carrying an empty criterion
  why: The assertion checks only expect.stringContaining('criterion is empty'); it never checks that the
    hypothesis's own locator is present in the message, so 'naming the hypothesis' is unexercised.
- criterion: A submission in which a hypothesis or the fallback declares no outcome, or no referral, is
    refused naming that position.
  state: partial
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis whose resolution misses its outcome
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis whose resolution misses its referral
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a hypothesis declaring no resolution at all
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a fallback missing its outcome
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a fallback missing its referral
  why: The fallback tests assert the message names 'the fallback' explicitly ('the fallback's outcome
    is undeclared'), so that half of 'naming that position' is exercised. The hypothesis tests assert
    only 'outcome is undeclared' / 'referral is undeclared' / 'resolution is undeclared', never checking
    that the hypothesis's own locator appears — so naming the position is unexercised for the hypothesis
    half.
- criterion: A submission violating several of these conditions is refused once, with every violation
    named together.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a document violating several structural rules once, naming every violation
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: refuses a case whose hypotheses violate both uniqueness rules at once, naming the shared name
      and the shared position together
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: collects a consolidation_register violation together with another structural violation in one
      refusal, never throwing on the first found
- criterion: A submission violating none of these conditions is not refused by this validation.
  state: covered
  tests:
  - file: src/__tests__/unit/case/parse-case-document.spec.ts
    name: parses a document declaring every attribute into the one case aggregate
- criterion: The pinned case carries the slug and the version of the case that ran and nothing else.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: pins the case by exactly slug and version, never a hash and never the whole case
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: pins the case by slug and version, the model, the prompt version and the evidence this run actually
      collected, in the written investigation
- criterion: No module derives or reads a digest over a case's content when building an investigation.
  state: uncovered
  why: 'The test file itself carries only a comment (''record-shape criterion 2: no digest read over the
    case''s content'') explaining that the earlier test proving this was deleted rather than replaced,
    because Case no longer types a hash field at all. No it() call exists for this criterion anywhere
    in the set; nothing exercises investigation-factory.ts''s own freedom from reading or deriving a digest.'
- criterion: A built investigation carries written_at as a datetime recording when its one write happened.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: carries written_at from the given options, unchanged
- criterion: The factory refuses to build an investigation without written_at.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when written_at is missing entirely, rather than building a record with no
      datetime of its own write
- criterion: A built investigation carries the model, the prompt version and its evidence beside the pinned
    slug and version.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: copies model, prompt_version and evidence straight from the given options, unchanged
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: pins the case by exactly slug and version, never a hash and never the whole case
- criterion: Resolve-outcome and collection-plan consult each hypothesis's declared position, and the
    order in which the hypotheses arrive changes neither answer.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: orders and dedupes the collection plan by each hypothesis's own declared position, never by
      the array's own arrangement
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: follows each hypothesis's own declared position alone, so reversing the array arrangement changes
      nothing about which confirmed hypothesis determines
- criterion: Of two confirmed hypotheses, the one standing earlier in the precedence the positions declare
    is the one whose resolution resolve-outcome answers with.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers with the earlier-position hypothesis of two confirmed ones that are neither the first
      nor the last declared position
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: follows each hypothesis's own declared position alone, so reversing the array arrangement changes
      nothing about which confirmed hypothesis determines
- criterion: Given a case declaring regional-incident, order-in-progress, financial-block and onu-offline
    in that precedence, with regional-incident and onu-offline confirmed and the other two refuted, resolve-outcome
    answers with regional-incident's outcome and referral and names regional-incident as the determining
    hypothesis.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers the first confirmed hypothesis in declared order with its outcome, its referral and
      its determining role
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers with regional-incident's own outcome, referral and determining role over the scenario's
      declared precedence even when the hypotheses array does not arrange them that way
- criterion: In that same resolution onu-offline keeps its confirmed verdict and is marked in no way.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: leaves a hypothesis confirmed after the determining one holding its confirmed verdict, unmarked
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: keeps onu-offline confirmed and marks it in no way in that same scrambled-array resolution
- criterion: When every hypothesis was refuted or inconclusive, resolve-outcome answers with the fallback's
    outcome and referral.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers the fallback's outcome and referral when every hypothesis is refuted or inconclusive
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: falls back over a single-hypothesis case whose one claim is refuted
- criterion: In that same resolution no determining hypothesis is named.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: names no determining hypothesis when the fallback answers
- criterion: The collection plan is the deduplicated union of every hypothesis's collected concepts.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers the deduplicated union of every hypothesis's collects, each concept once
  - file: src/__tests__/unit/case/case-resolution.spec.ts
    name: answers a concept one hypothesis collects twice exactly once
- criterion: The replay read takes a slug and a version and answers with the case version stored under
    them.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version stored under the named slug, never the same version number stored under
      a different slug
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version a replay names, unaffected by a later version stored afterward under the
      same slug
- criterion: The replay answers a complete case — its root, its hypotheses and their resolutions and referrals
    — or nothing, never a case missing any of them.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the replay whole, matching exactly what the document holds, including its hypotheses
      and their resolutions and referrals
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses replay with the same CaseNotFoundError as read-case when the pinned version was never
      stored
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: replays the pinned version through the real store, answering it unchanged even after the real
      capability registration the case depends on is deleted directly against the table
- criterion: A version stored under a slug before later versions of it were stored is answered when a
    replay names that version.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers the version a replay names, unaffected by a later version stored afterward under the
      same slug
- criterion: The replay answers without running the validation the ordinary read runs at its reading.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: replays a pinned version without running the coherence checks at all, answering the case even
      though the same content would refuse at read-case
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers a document that would fail read-case structurally, rather than refusing it, because
      replay skips the structural refusal too
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: replays the pinned version through the real store, answering it unchanged even after the real
      capability registration the case depends on is deleted directly against the table
- criterion: The ordinary read of a case by slug and version runs that validation at each reading.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the glossary no longer holds a concept
      it depends on
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses at a later read a case that validated earlier, once the capability registry no longer
      answers a concept it depends on
  - file: src/__tests__/integration/factories/case-query.factory.spec.ts
    name: refuses at a later read, through the real wiring, a case that validated earlier once the glossary
      no longer accepts the subject type it depends on for a collected concept, edited directly against
      the table
- criterion: The replay resolves its case without reading any digest over the case's content.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: resolves its case without ever reading the store's content-identity digest, even where doing
      so would throw
- criterion: A submission of one valid case version stores it and answers with its slug and version.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: stores a submission of one valid case version and answers with its slug and version
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: stores a submission of one valid case version, through the real wiring, and answers with its
      slug and version
- criterion: A submission naming a slug and version already stored is refused rather than merged.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: refuses a submission naming a slug and version already stored, propagating the store's own write-once
      refusal rather than merging
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: refuses a submission naming a slug and version already stored, through the real store's own
      CaseVersionAlreadyStoredError, and leaves the stored version exactly as it was
- criterion: A submission that holds against every validator rule is not refused by this command.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: does not refuse a submission that holds against every validator rule, even carrying an optional
      consolidation register
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: does not refuse, through the real wiring, a submission that holds against every validator rule,
      including a case declaring more than one hypothesis
- criterion: A submission naming a subject type, concept, outcome, action or recipient the glossary does
    not hold is refused, naming the term.
  state: partial
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: refuses a submission whose collected concept the glossary does not hold, naming the concept
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: refuses a submission naming an outcome the glossary does not hold, naming the outcome
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: refuses through the real wiring a submission naming an outcome the glossary does not hold, naming
      the outcome — every other term, the concept and its capability staying coherent
  why: Only 'concept' and 'outcome' are exercised as the missing term. Nothing in the set submits a case
    naming a subject type, an action or a recipient the glossary does not hold, so that half of the criterion
    is unproven for this command (the sibling case-query composition proves 'action' missing at the read
    side, but not through author-case-version).
- criterion: A submission whose hypothesis collects a concept that does not accept the case's declared
    subject type is refused, naming the concept and the subject type.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: refuses a submission whose hypothesis collects a concept that does not accept the case's declared
      subject type, naming the concept and the subject type
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: refuses through the real wiring a submission whose hypothesis collects a concept that does not
      accept the case's declared subject type, naming the concept and the subject type
- criterion: A submission whose hypothesis collects a concept with no registered read-only capability
    declaring an output schema and a timeout is refused, naming the concept.
  state: partial
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: refuses a submission whose collected concept has no registered read-only capability at all,
      naming the concept
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: refuses a submission whose collected concept's capability declares no output schema, naming
      the concept
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: refuses through the real wiring a submission whose collected concept has no registered capability
      at all, naming the concept
  why: No test in the set submits a case whose collected concept's capability lacks a timeout (answerGaps'
    own 'declares no timeout' branch in validate-case-coherence.ts); only 'no capability at all' and 'no
    output schema' are exercised, so the timeout half of this criterion is unproven.
- criterion: A collected concept whose glossary registration states no ttl is read with the default of
    sixty seconds rather than refusing the submission.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: never refuses a submission on account of its collected concept's ttl, whether that ttl is the
      sixty-second default a registration stating none resolves to or a value a registration declares
      explicitly
- criterion: The capability check answers from the registration as it stands at this submission, never
    from one read earlier.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: answers the capability check from the registration as it stands at this submission, refusing
      a later submission once an earlier one's capability is no longer held
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: answers the real capability check from the registration as it stands at this submission, refusing
      a later submission once the real registration's own output schema is edited away directly against
      the table, and storing nothing for that refused version
- criterion: A submission violating several rules is refused once, naming every violation together.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: joins several coherence violations into the one CaseNotValidError, naming every one of them
      together
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: joins several structural violations into the one InvalidCaseDocumentError, propagated unwrapped
      from the delegated structural validator
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: refuses through the real wiring, joining every coherence violation together, when a collected
      concept is absent from the glossary entirely...
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: refuses through the real wiring, joining every structural violation together, before the coherence
      checks or the store are ever reached
- criterion: Nothing is stored when a submission is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: never calls into the store when a submission is refused for a structural violation
  - file: src/__tests__/unit/case/author-case-version.service.spec.ts
    name: never calls into the store when a submission is refused for a coherence violation
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: leaves no row in cases, case_versions, hypotheses or hypothesis_collects when a submission is
      refused structurally
  - file: src/__tests__/integration/factories/author-case-version.factory.spec.ts
    name: leaves no row in cases, case_versions, hypotheses or hypothesis_collects when a submission is
      refused for a coherence violation
- criterion: The glossary holds the two non-conclusion outcomes, inconclusive-no-data and inconclusive-hypotheses-exhausted,
    before any case version is authored against it.
  state: uncovered
  why: 'The file''s own header discloses that the ordering claim is not provable by any test in it: GlossaryService''s
    own withNonConclusionOutcomes tops the two names up on every outcome read, so a seed.ts that wrote
    them in any order (or not at all, relying on the top-up) would leave the same observable end state.
    The one test bearing on this (''holds both non-conclusion outcomes, having run against a database
    this file had itself confirmed lacked them beforehand'') only proves both names exist after a full
    run that started from a database confirmed to lack them and the case beforehand — it never observes
    whether the outcomes were written before the case-authoring step within that run, which is what ''before
    any case version is authored against it'' asks for.'
- criterion: The glossary holds every subject type, subject attribute, outcome, action and recipient the
    curated case names.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
      ones together
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own subject-type name, the one the curated case declares as its
      subject
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own subject-attribute name, even though the curated case document
      names no subject attribute of its own
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
      declare
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and
      fallback declare
- criterion: The glossary holds every concept the curated case collects, each with the subject types it
    accepts and its ttl.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: holds every concept the curated case collects, each with the subject types it accepts and its
      ttl, matching the fixture exactly
- criterion: The registry holds one read-only capability, with its declared contract, for every concept
    the curated case collects.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: registers one read-only capability, with every attribute the fixture declares, for each of the
      two concepts the curated case collects
- criterion: The curated case version enters through the authoring command and by no other write.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: seed.ts's own source enters the case only through the published authoring command, naming createAuthorCaseVersion
      and authorCaseVersion near its case-writing code, and never a direct writeVersion call
- criterion: The seeded case version reads back whole and holds against every validator rule at that read.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: reads the seeded version back whole, matching every field the fixture document itself declares
      — not only the case's root and its hypotheses' names
  - file: src/__tests__/integration/seed.spec.ts
    name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it
      beforehand
- criterion: A read answers each registration with its name, version, nature, input schema, output schema,
    timeout and connector.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: answers a read with every declared attribute — name, version, nature, both schemas, timeout,
      connector and concept
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: persists and reads back a registration exactly as given — name, version, nature, both schemas,
      timeout, connector and concept
- criterion: A read answers the registration as the database holds it at that call, never a value held
    from an earlier call.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: answers the second call's own rows, never a value the first call already answered
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: answers a read as the database holds it right now, never a value an earlier read already answered
- criterion: A registration whose nature is not read-only does not enter the store.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: leaves the table exactly as it stood when a non-read-only registration is refused before ever
      reaching the store
- criterion: A registration whose nature is read-only is not refused on that ground.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: persists a capability whose nature is read-only without refusing it on that ground
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: persists a complete read-only registration, unrefused, when registered against the real store
- criterion: A registration that states no timeout is held with the default of sixty seconds.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: holds a registration that states no timeout with the default of sixty seconds, in what the store
      actually persists
- criterion: The store resolves each concept to exactly one capability as currently registered.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: resolves a concept to the capability the database currently holds, reflecting a registration
      made since an earlier resolution
- criterion: A read answers the case root together with its hypotheses and their resolutions and referrals,
    assembled in one transaction.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: assembles the case root together with its hypotheses and their resolutions and referrals, all
      through the one transaction it opens
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: reads back a case's root together with its hypotheses and their resolutions and referrals, exactly
      as written
- criterion: A read answers either a complete aggregate or nothing, and never a case missing a hypothesis,
    a resolution or a referral.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves nothing behind — no case_versions row, no hypothesis row, no collect row — when a later
      hypothesis in the same write violates a real constraint
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves nothing behind — no case_versions row, no hypothesis row, no collect row — when a hypothesis's
      own collects reference a concept that violates a real foreign key
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: answers undefined and reads no further, when case_versions holds no row for the given slug and
      version
- criterion: A read for a slug and version nothing was written under answers with absence as data rather
    than raising.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: answers undefined and reads no further, when case_versions holds no row for the given slug and
      version
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: answers absence, not a rejection, for a slug and version nothing was ever written under
- criterion: A write of a slug and version already stored is refused through the case store's typed error,
    and the stored version is left exactly as it was.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: raises this store's own CaseVersionAlreadyStoredError, naming the slug and version, and rolls
      back, when a duplicate version violates the primary key
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a second write to the same slug and version through this store's own CaseVersionAlreadyStoredError,
      and leaves the stored version exactly as it was
- criterion: A write of a slug and version not already stored is not refused on that ground.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: does not refuse a write for a slug and version not already stored
- criterion: A version stored earlier remains readable after later versions of the same slug are written,
    and the version list answers every version ever written under that slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: keeps an earlier version readable, and lists every version ever written under one slug, after
      later versions are written
- criterion: Every version the store holds under one slug belongs to one case, and no second case is admitted
    under a slug the store already holds.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: keeps exactly one row in cases for one slug after two versions are written under it, never creating
      a second case
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: runs the case identity insert, the version insert, and each hypothesis immediately followed
      by its own collects, as one unit of work — the identity insert's own idempotent ON CONFLICT never
      refusing an already-held slug
- criterion: A statement run through the helper that matches no row answers with absence as data rather
    than raising.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/database-access.spec.ts
    name: answers undefined, not a rejection, when a statement matches no row
  - file: src/__tests__/integration/persistence/database-access.spec.ts
    name: answers undefined, not a rejection, when a real query matches no row for the slug named
- criterion: A driver failure reaching the helper arrives at its caller as that caller's own typed store
    error, carrying a message, a context object and the driver failure as its cause.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/database-access.spec.ts
    name: raises the caller's own typed error, carrying a message, a context object and the driver failure
      as its cause, when the driver rejects a statement
  - file: src/__tests__/integration/persistence/database-access.spec.ts
    name: raises the caller's own typed error, carrying a message, a context object and the real driver
      failure as its cause, when a statement violates a real database constraint
- criterion: A unit of work run through the helper commits as a whole.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/database-access.spec.ts
    name: commits once the whole unit of work resolves, answering with the value work itself resolved
      to and releasing the connection back to the pool
  - file: src/__tests__/integration/persistence/database-access.spec.ts
    name: commits a unit of work as a whole, leaving every statement it ran visible to a separate connection
      once it resolves
- criterion: A unit of work in which one statement fails leaves none of its earlier statements applied.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/database-access.spec.ts
    name: issues ROLLBACK and never COMMIT — still releasing the connection back to the pool — when a
      later statement inside the unit of work fails
  - file: src/__tests__/integration/persistence/database-access.spec.ts
    name: leaves none of a unit of work's earlier statements applied, when a later statement inside it
      fails against a real constraint
- criterion: A term read answers the five vocabularies — subject types, subject attributes, outcomes,
    actions and recipients — as the database holds them at that read.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: reads %s from its own table, %s, never another vocabulary's
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers each of the five vocabularies with the rows written for it, and no other vocabulary's
      rows
- criterion: A concept read answers each concept with its name, the subject types it accepts and its ttl.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: answers each concept with its name, the subject types it accepts and its ttl
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers each concept with its name, the subject types it accepts and its ttl, as the real tables
      hold them
- criterion: A read answers a term exactly as the glossary currently holds it and adds no term the glossary
    does not hold.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers exactly what a row inserted directly into the real table holds, adding no term of its
      own
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers a later write's own rows, never a row an earlier write already replaced
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: answers the second call's own rows, never a value the first call already answered
- criterion: A term write stores the term.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: persists a term write so a read against the real table, outside the store, finds it
- criterion: A write persists the id, requester, ticket reference when one was given, narrative, subject
    with its whole set of attribute-values, prompt version, model, every evidence item, every evaluation,
    the assessment, the cost, the durations, written_at and the pinned slug and version, in one transaction.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends every declared attribute of the root row — identity, subject type, prompt version, model,
      pinned case, assessment, cost, durations and written_at — as the root insert's own params, in order
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: inserts the root row first, then every subject attribute-value, every evidence item, and each
      evaluation immediately followed by its own citations, all through the one transaction it opens
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction
- criterion: A write that fails part way leaves no part of the record stored.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: rolls back and raises this store's own typed error, carrying the driver failure as its cause,
      when an evidence insert fails after the root row and the subject attribute-values already succeeded
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: leaves nothing behind — no root row, no subject attribute-value row, no evidence row, no evaluation
      row, no citation row — when a second evaluation in the same write collides with an earlier one's
      own hypothesis
- criterion: A second write of an id already stored is refused through the existing typed error, decided
    by a key the database holds rather than by reading before writing.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, mapped
      from the root insert's own unique-violation, without any SELECT ever run before it
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, and
      leaves the already-stored record completely unchanged
- criterion: A write of an id not already stored is not refused on that ground.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: does not refuse a write for an id not already stored
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: does not refuse a write for an id not already stored
- criterion: A read answers the record holding one evidence item for each concept the collection plan
    named and one evaluation for each hypothesis the pinned case required.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: answers one evidence item for every evidence row and one evaluation for every evaluation row
      a read finds, unfiltered
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back one evidence item for each concept and one evaluation for each hypothesis the investigation
      was written with
- criterion: A read answers each evidence item with its concept, inputs, observation, when it was observed,
    its ttl, its origin, the result its collection ended in and the detail it carried when it had one.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles each evidence item with its concept, inputs, observation, observed_at, ttl, origin,
      result and its capability pin, including result_detail when it carried one
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back an evidence item exactly as written when its result is not ok and it carries a result
      detail
- criterion: A read answers each evaluation with its hypothesis, its verdict, the citations it carried
    when decided and the reason it carried when inconclusive.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles a confirmed evaluation with its hypothesis, verdict and citations, and no reason
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles an inconclusive evaluation with its hypothesis, verdict, reason and whatever citations
      it carried
- criterion: A read answers the assessment with its outcome, its referral, its determining hypothesis
    when one was named, and its text.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles the assessment with its outcome, referral, determining_hypothesis and text, when a
      hypothesis was named
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: leaves determining_hypothesis out of the assembled assessment when the fallback answered and
      no hypothesis was named
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back an assessment with no determining_hypothesis when the fallback answered and none
      was named
- criterion: A record already stored is altered by no later write.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: issues no UPDATE statement anywhere while writing a whole investigation
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: refuses a second write of an id already stored through InvestigationAlreadyStoredError, and
      leaves the already-stored record completely unchanged
- criterion: No part of a record is held in a file.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: 'opens no file of any kind: this module names no filesystem import and calls no filesystem function'
- criterion: The environment schema requires a database connection URL, and a load with that variable
    absent refuses once, naming it together with every other violated field.
  state: covered
  tests:
  - file: src/__tests__/unit/config/env.spec.ts
    name: throws InvalidEnvironmentError naming DATABASE_URL when it alone is absent
  - file: src/__tests__/unit/config/env.spec.ts
    name: throws InvalidEnvironmentError naming DATABASE_URL together with another missing field in the
      same refusal, rather than refusing on the first one alone
  - file: src/__tests__/unit/config/env.spec.ts
    name: throws InvalidEnvironmentError naming DATABASE_URL when it is set to an empty string
- criterion: The connection is constructed from that configured URL alone, and no host, port, endpoint
    or credential for a database appears in source.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: builds the pg Pool with exactly the given connection URL as its connectionString, and no other
      configuration key
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: writes no literal database port anywhere in its own source
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: writes no literal IPv4 host anywhere in its own source
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: writes no literal embedded credential anywhere in its own source
  - file: src/__tests__/unit/persistence/database-connection.spec.ts
    name: writes no literal 'localhost' endpoint anywhere in its own source
- criterion: Nothing in the tree provisions a database service for the deployment.
  state: covered
  tests:
  - file: src/__tests__/unit/deployment-provisions-no-database-service.spec.ts
    name: the tree contains no Dockerfile, docker-compose file, Terraform script or Procfile provisioning
      a database service for the deployment
- criterion: The connection module sits with the persistence adapters, and an audit of the case, glossary,
    capability-registry and investigation modules' imports finds no driver and no framework among them.
  state: covered
  tests:
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: the case, glossary, capability-registry and investigation modules import no driver and no framework
  - file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
    name: the connection module sits under persistence/, beside the relational store repositories, rather
      than under any of the four audited domain directories
- criterion: The manifest declares the driver, and the audit of declared runtime dependencies names it
    among the set it admits.
  state: covered
  tests:
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares no database driver beyond the one admitted pg
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares pg as a dependency
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest pins pg to ^8.13.0
- criterion: An integration test that writes leaves the database holding none of the rows it wrote once
    it has finished.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: leaves the cases table holding no row for the slug it wrote, once it releases the isolated connection
      it wrote through
- criterion: Two integration tests writing the same case slug in one suite run both pass.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: lets a first integration test write a case under a slug a second test in this run will also
      write, without a unique-key collision
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: lets a second integration test write a case under the same slug the first one already wrote,
      in the same suite run
- criterion: Two integration tests writing the same investigation id in one suite run both pass.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: lets a first integration test write an investigation under an id a second test in this run will
      also write, without a primary-key collision
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: lets a second integration test write an investigation under the same id the first one already
      wrote, in the same suite run
- criterion: A test observes no row another test wrote.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: writes a case under a slug the next test below reads back — this pair proves criterion 4 and
      is the one place in this file where a test's own pass depends on the previous one having already
      run, disclosed in this file's own header
  - file: src/__tests__/integration/persistence/isolated-connection.spec.ts
    name: observes no row for the slug the previous test wrote, once that test had already released its
      own connection
- criterion: No integration test creates, drops or alters a table to obtain its isolation.
  state: partial
  tests:
  - file: src/__tests__/unit/no-test-creates-or-alters-a-table.spec.ts
    name: no test in the tree writes a table-creating or table-altering statement of its own
  why: This tree-wide scan's own DDL_STATEMENT_LITERAL regex is built from DDL_VERBS = 'CREATE|ALTER'
    — it never matches a DROP TABLE statement. It would fail if an integration test wrote CREATE TABLE
    or ALTER TABLE of its own, but not if one wrote DROP TABLE, so the 'drops' clause of this criterion
    is unexercised.
- criterion: The tree holds a runnable step that applies every script under migrations/ in numbered order
    against the connection the environment names.
  state: partial
  tests:
  - file: src/__tests__/unit/migrate.spec.ts
    name: the manifest declares a "migrate" script that runs the built migrate.js from dist/, mirroring
      "start"'s own precedent
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: applies migration files in ascending filename order, regardless of the order the filesystem
      lists them
  why: migrate.spec.ts's own header discloses that migrate.ts's own top-level composition — reading the
    connection from the environment it names — is left untested, following the same precedent set for
    index.ts. Nothing in the set exercises migrate.ts's own environment-driven connection; only the manifest
    wiring and the ordering logic of applyPendingMigrations itself are exercised.
- criterion: Running that step against an empty database leaves it holding the schema the scripts describe.
  state: covered
  tests:
  - file: src/__tests__/integration/vitest-global-setup.spec.ts
    name: has already recorded every migration file as applied and left the database holding the schema
      those files describe by the time this spec's own first test runs, proving the suite's own setup
      ran before any test
- criterion: Running that step against a database that already holds the schema applies no script twice
    and fails nothing.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/migration-runner.spec.ts
    name: applies no script twice and fails nothing when run again against a database that already holds
      the schema
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: sends no further statement once every migration file is already recorded as applied
- criterion: The suite's setup runs that step before any test runs, and no test in the tree creates or
    alters a table.
  state: covered
  tests:
  - file: src/__tests__/integration/vitest-global-setup.spec.ts
    name: has already recorded every migration file as applied and left the database holding the schema
      those files describe by the time this spec's own first test runs, proving the suite's own setup
      ran before any test
  - file: src/__tests__/unit/no-test-creates-or-alters-a-table.spec.ts
    name: no test in the tree writes a table-creating or table-altering statement of its own
- criterion: The scripts sit under migrations/, and applying every one of them in the order their names
    number them to an empty database produces the whole schema with no step performed by hand.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: applies the five scripts, in the order their file names number them, to a fresh empty database
      and produces every relation the model needs and none it does not
- criterion: Every column of every relation that holds a record pairs with one attribute one Domain Model
    element declares, and only the relation recording which scripts have been applied pairs with none.
  state: uncovered
  why: 'schema-migrations.spec.ts''s own header discloses this directly: ''the pairing of each column
    to a Domain Model attribute is a mapping fact this suite cannot observe by running the schema, and
    is left to the specification-conformance review.'' No test in the set compares a column against a
    specification node.'
- criterion: Every required attribute of case, hypothesis, resolution, referral, consolidation register,
    investigation, evidence, evaluation, assessment, cost, durations, subject, subject-attribute-value
    and citation is held by a column that admits no absent value.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the five columns the model declares optional
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses storing a case version whose title is absent
- criterion: Every required attribute of concept, subject type, subject attribute, action, outcome, recipient
    and capability is held by a column that admits no absent value.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the five columns the model declares optional
- criterion: Each attribute the model declares optional — ticket_ref, result_detail, an evaluation's reason,
    an assessment's determining hypothesis and a case's consolidation register — is held by a column that
    admits an absent value.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the five columns the model declares optional
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts and stores an investigation with no ticket_ref, one of the five attributes the model
      declares optional
- criterion: A column holding a verdict, an evidence result, an evaluation reason, a capability nature
    or a consolidation register admits exactly the values its enumeration declares and refuses any other.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts exactly the three values verdict declares and refuses one it does not
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts exactly the four values evidence-result declares and refuses one it does not
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts exactly the three values evaluation-reason declares and refuses one it does not
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts exactly the two values capability-nature declares and refuses one it does not
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: accepts exactly the two values consolidation-register declares, besides its own absence, and
      refuses one it does not
- criterion: The case relation admits one row per slug, so no two cases can be held under one slug.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses a second case stored under a slug already in use
- criterion: The case version relation carries a unique key over slug and version, so a version already
    stored cannot be stored a second time.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses storing the same case version a second time under its own slug and version
- criterion: The hypothesis relation carries a unique key over its case and position, so no two hypotheses
    of one case can share a position.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses a second hypothesis of one case sharing an already-used position
- criterion: The hypothesis relation carries a unique key over its case and name, so no two hypotheses
    of one case can share a name.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses a second hypothesis of one case sharing an already-used name
- criterion: A diagnose call naming a case, a subject, a narrative and a requester, with an optional ticket
    reference, answers with an assessment carrying an outcome, a referral and a text.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted
      text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the
      seeded canonical subject
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment
- criterion: The assessment returns in that call's own response, with no job, queue or polling between
    the caller and it.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted
      text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the
      seeded canonical subject
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment
- criterion: The assessment's outcome, referral and determining hypothesis are exactly what the pinned
    case's resolve-outcome returned.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not resolve until persistence has actually written the investigation, then resolves with
      the written investigation's own assessment
- criterion: The response leaves whole and only after the investigation has been written.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not resolve until persistence has actually written the investigation, then resolves with
      the written investigation's own assessment
- criterion: When the persistence does not conclude within what remains of the deadline, the requester
    receives an error and not the assessment.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
    name: answers 500, never the assessment, and leaves no investigation readable by its id immediately
      afterward, when the investigation write is slowed past the persistence deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not
      conclude within what remains of the declared deadline
- criterion: The investigation that call produced is readable from the store by its id after the response.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment
- criterion: Every call runs the engine again, and no call answers with, reuses or joins an earlier investigation.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: writes two independent investigation records for two requests naming the same case, subject,
      narrative and requester
- criterion: The case the run executed is the one pinned by slug and version at the start of that request.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: pins the case by slug and version, the model, the prompt version and the evidence this run actually
      collected, in the written investigation
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: pins each call's own written document with its own case's slug and version, independently of
      the other call
- criterion: The subject types and terms the record names are the ones the glossary holds at that run.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: fails fast on an empty subject attribute set before collecting any evidence, judging any hypothesis
      or writing anything
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when the subject names an attribute the glossary does not hold, naming the
      violated policy
- criterion: Each of the four stores — case, glossary, capability registry and investigation — is constructed
    in its own factory from the connection, and no factory receives a data-directory path for any of those
    four.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: each of the four leaf factories' own exported function declares a DatabaseConnection parameter,
      never a data-directory string
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: no store-wiring factory's own source declares a data-directory parameter or field, anywhere
- criterion: The environment schema declares no data-directory variable for the case, glossary, capability-registry
    or investigation store.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: env.ts's own envSchema source declares no *_DATA_DIRECTORY field for the case, glossary, capability-registry
      or investigation store
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: a valid environment parses to an Env value carrying none of the four retired data-directory
      keys
  - file: src/__tests__/unit/config/env.spec.ts
    name: parses a valid environment naming none of the four retired data-directory variables, carrying
      no trace of any of them onto Env
- criterion: No module belonging to the case, glossary, capability-registry or investigation store reads
    or writes a file to hold a record, and the four file repositories and the file helper they shared
    are gone.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: the four file repositories and the file helper they shared no longer exist under persistence/
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: no module anywhere under src imports the four removed file repositories or their shared file
      helper, by any relative path
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: none of the case, glossary, capability-registry or investigation domain modules names a filesystem
      module
- criterion: The composed application builds its four stores from the environment alone.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: the process entry point builds the diagnose HTTP server from the environment alone, passing
      no second argument
  - file: src/__tests__/unit/factories/store-wiring.spec.ts
    name: createDiagnoseHttpServer's own exported function takes exactly one parameter, env, and builds
      its one connection from env.DATABASE_URL alone, naming no data-directory field of Env
- criterion: Every record one of the four stores answers comes from the same connection.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/store-wiring.spec.ts
    name: answers, through createCaseQuery built from one connection, a case written directly through
      createCaseStore built from that same connection — never a second store the write never reached
  - file: src/__tests__/integration/factories/store-wiring.spec.ts
    name: answers, through a second createInvestigationStore built from one connection, an investigation
      written through a first createInvestigationStore built from that same connection
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
findings:
- pass: conformance
  file: src/case/author-case-version.service.ts
  where: the doc comment above the module-private `parsedCase` function
  evidence: That module's own second parameter checks the declared slug against a file name (rules/knowledge/the-slug-matches-the-file-name)
    — a rule about the file-based medium this write does not have ("no file is the medium", contracts/knowledge/author-case-version).
  cost: rules/knowledge/the-slug-matches-the-file-name names no node anywhere under the specification
    root — the only rule that does govern the slug, rules/knowledge/a-slug-identifies-one-case, states
    only that no two cases share one, nothing about a file name. A reader who opens the specification
    to learn why authorCaseVersion has to synthesize a filename from the slug it was just given (`declaredSlugOrEmpty(document)}${CASE_DOCUMENT_ENDING}`)
    finds no such rule, and is left unable to tell whether the citation or the mechanism is the mistake.
  correction: drop the citation to a rule the specification does not hold; if the second parameter exists
    only to satisfy parseCaseDocument's own signature, say that plainly without appeal to a specification
    rule.
- pass: conformance
  file: src/case/case-query.port.ts
  where: the doc comment on `ReadCaseResult`, top of file
  evidence: 'What read-case answers: the case whole, pinned by the content identity of the exact document
    the read found on disk (constraints/a-case-is-stored-as-one-json-document — pinning it is hashing
    one file).'
  cost: 'constraints/a-case-is-stored-as-one-json-document does not exist anywhere in the specification.
    The node that does govern this fact, constraints/the-system-persists-to-one-relational-database —
    one of the nodes this delivery answers to — states the opposite: "no record is held in a file the
    deployment ships or writes." This delivery''s own relational-case-store.repository.ts documents the
    pin as "sha256 of its deterministic JSON serialization ... since there is no file and no disk bytes
    once the content is rows." A consumer of this published port, reading the one doc comment that describes
    what the pin means, is told it is a hash of a file found on disk — the opposite of both the governing
    constraint and the store''s own actual behavior.'
  correction: rewrite the comment to describe the pin as the content identity of the row set the store
    assembled at this read, matching relational-case-store.repository.ts's own contentHash, and remove
    the citation to the nonexistent constraint.
- pass: conformance
  file: src/case/case.ts
  where: the module header comment, and the doc comment on `CASE_DOCUMENT_ENDING`
  evidence: each attribute spelled as the specification declares it so the one JSON document and the node
    read the same (constraints/a-case-is-stored-as-one-json-document); The ending a case's one JSON document
    carries (constraints/a-case-is-stored-as-one-json-document) — the medium's, not the name's, so the
    slug rule reads the file's name without it.
  cost: constraints/a-case-is-stored-as-one-json-document does not exist in the specification. The node
    that does govern the case aggregate's storage, constraints/a-case-is-read-whole — one of the nodes
    this delivery answers to — states that "the one document that used to be it" is superseded, that "hypotheses,
    resolutions and referrals now sit in relations of their own." case.ts is the exact file this delivery's
    own case-aggregate-shape task wrote to state the aggregate's current shape, yet its own comments still
    assert the case is "one JSON document," the precise fact the governing constraint says no longer holds
    — so the file most responsible for stating the current model states the retired one instead.
  correction: remove the "one JSON document" framing and its citation; if CASE_DOCUMENT_ENDING still has
    a purpose once the medium is relational, state that purpose without invoking a document medium the
    case no longer has.
- pass: conformance
  file: src/case/parse-case-document.ts
  where: the module header comment, and the slug/file-name check it introduces (`slugProblems`, `heldFileName`)
  evidence: Parses one case JSON document into the whole aggregate — hypotheses, resolutions and referrals
    all read from the one document, never from a second store (constraints/a-case-is-stored-as-one-json-document).
    The document arrives as its parsed JSON data plus the name of the file that holds it, which the slug
    is held to (rules/knowledge/the-slug-matches-the-file-name);
  cost: neither cited node exists anywhere under the specification root, yet the module builds a real,
    always-run check around the second one — refusing a document whose declared slug does not equal a
    synthesized file name. Because the one write path that has no real file (author-case-version.service.ts)
    must fabricate that name from the slug itself, the check can never fire there at all; a reader is
    left believing a specification rule about file naming governs how every case is parsed, when no such
    rule exists and the mechanism has been hollowed into a self-comparison on the path that would most
    need it.
  correction: remove the fileName parameter and the slug/file-name check from parseCaseDocument, or, if
    some form of it is still wanted, state it as a project convention rather than citing a specification
    rule that is not there.
- pass: standard
  file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  where: the fakeTransactionConnection helper
  cites: MNT-03
  evidence: "function fakeTransactionConnection(\n  handleQuery: (text: string, params?: readonly unknown[])\
    \ => Promise<{ rows: unknown[] }>,\n): { connection: DatabaseConnection; client: IFakeClient } {\n\
    \  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };\n  const connect =\
    \ vi.fn().mockResolvedValue(client);\n  return { connection: { connect } as unknown as DatabaseConnection,\
    \ client };\n}"
  cost: This exact function (and the sibling collapsedTexts helper) is retyped verbatim in database-access.spec.ts
    and again in relational-case-store.repository.spec.ts, relational-glossary-store.repository.spec.ts
    and relational-investigation-store.repository.spec.ts — five copies of one fake. A change to what
    the fake needs to simulate (a checkout failure shape, an extra tracked call) has to be made by hand
    in all five, and a reader who fixes one copy has no way to know the other four are now out of step
    with it.
  correction: Move fakeTransactionConnection and collapsedTexts into one shared test-support module the
    five spec files import, so the block is called once rather than copied five times.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: raiseCaseVersionInsertFailure, and the CaseVersionAlreadyStoredError it constructs (src/errors/case-version-already-stored.error.ts)
  cites: COR-02
  evidence: "function raiseCaseVersionInsertFailure(key: ICaseVersionKey): RaiseStoreError {\n  return\
    \ (cause) =>\n    isUniqueViolation(cause) ? new CaseVersionAlreadyStoredError(key.slug, key.version)\
    \ : raiseWriteFailure(cause);\n}\n// CaseVersionAlreadyStoredError itself:\nexport class CaseVersionAlreadyStoredError\
    \ extends Error {\n  public readonly context: Readonly<{ slug: string; version: number }>;\n  public\
    \ constructor(slug: string, version: number) {\n    super(`the case \"${slug}\" already has a stored\
    \ version ${version}, and a case version is written once and never altered`);\n    this.name = 'CaseVersionAlreadyStoredError';\n\
    \    this.context = { slug, version };\n  }\n}"
  cost: The error this repository raises carries a name, a message and a context — never a status. A caller
    that catches it (author-case-version.service.ts today, any future handler tomorrow) has nothing on
    the error itself to read a status from; whatever maps this refusal to an outcome has to work from
    the class identity alone rather than from a field COR-02 says every such error should carry.
  correction: Add a status field to CaseVersionAlreadyStoredError alongside its name, message and context,
    the way COR-02 requires of every typed error a repository raises.
- pass: standard
  file: src/vitest-global-setup.ts
  where: setup(), reading process.env.DATABASE_URL directly
  cites: STK-08
  evidence: "const connectionUrl = process.env.DATABASE_URL;\nif (!connectionUrl) {\n  throw new MigrationStepError(\n\
    \    'DATABASE_URL must name a reachable PostgreSQL instance for the suite to migrate before its tests\
    \ run',\n    { variable: 'DATABASE_URL' },\n  );\n}"
  cost: DATABASE_URL reaches this step as a bare string checked only for truthiness, never parsed by the
    Zod schema env.ts declares for every other boundary value this process reads — the file's own header
    names this as a departure from STK-08, but the disclosure doesn't change what a reader who trusts
    "boundary input is parsed by a schema" would find here instead.
  correction: Parse DATABASE_URL through a narrow Zod schema local to this file (rather than the whole
    Env shape loadEnv requires), so this one boundary value is validated the same way every other one
    is.
---

## What it is

Four passes over the whole relational-persistence initiative (17 tasks, 89 files): coverage, specification-conformance and standard-conformance ran; the failures pass did not, because the captured suite (run/review-relational-persistence: install, typecheck, lint, secret-scan, 691 tests) passed every step clean — nothing for that pass to diagnose. The specification-conformance pass found four files still citing two specification nodes that do not exist (`constraints/a-case-is-stored-as-one-json-document`, `rules/knowledge/the-slug-matches-the-file-name`) — leftover doc comments from the pre-relational, file-backed architecture, never updated when the case aggregate moved to rows. The standard-conformance pass found one duplicated test helper, one typed error missing a status field the standard's own COR-02 asks every repository error to carry, and one boundary read that bypasses the project's own env-parsing convention. The coverage pass found four criteria uncovered and eleven partially covered, mostly refusal messages whose "naming X" half is asserted with a loose `stringContaining` that would still pass if the named detail were dropped.

## Notes

**Trace drift (not a finding, not settled by this review):** `trace.py --check src` reports 74 drift findings over 102 bindings — 1 `moved`, 73 `code`, 0 `orphaned` — meaning most bindings from earlier tasks in this initiative point at files that have since changed without a rebind. This is expected in a plan this long-lived (many tasks touched shared files like investigation-factory.ts, case.ts, parse-case-document.ts, run-diagnosis.ts and the curated fixture) and is not a conformance problem, but it means the trace's link back to the specification is stale for most of this initiative's own bindings. Route: rebind through the delivery that owns each change, or leave it for a dedicated reconciliation pass — never `--prune`, which only clears `orphaned` drift (there is none here).

**A delivery-record defect, not a source finding:** `task/relational-substrate/database-connection`'s own implementation record spells one of its files `src/package.json`; the real file sits at `package.json` (the manifest is not nested under the target root's own `src/` subdirectory the way the `.ts` source is). Both spellings are listed in `reviewed` above; only `package.json` resolves. This is a bookkeeping slip in an already-delivered record, not a rule departure — noted here so it is not mistaken for a gap in this review's own coverage of the manifest.

**What this review does not cover:** whether any of the four conformance findings' cited-but-absent nodes should instead be added to the specification (a job for `/analyse`, never this review); whether COR-02's own "status" field belongs on a domain error class at all, given the project's own rule that a standard must not state what the system answers — flagged here as a tension worth a person's read, not resolved; and any file this initiative's tasks did not create or modify, including every file the coverage/conformance passes read only for context (e.g. `case-resolution.ts`, `validate-case-coherence.ts`).
