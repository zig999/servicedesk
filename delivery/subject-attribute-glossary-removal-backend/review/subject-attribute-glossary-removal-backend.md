---
target: backend
title: Subject-attribute glossary removal, four passes over the whole change
summary: 'Coverage, conformance, standard and failures over the 36 files the four tasks of subject-attribute-glossary-removal-backend
  wrote or touched: the glossary vocabulary''s own reduction, the check removed from both simulate controllers
  and from investigation building, and the subject_attributes table''s own drop.'
reviewed:
- migrations/0023-drop-subject-attributes.sql
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/factories/production-diagnose.factory.spec.ts
- src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
- src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/glossary/terms.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
- src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
- src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-case.routes.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/case/validate-case-coherence.ts
- src/errors/status-map.ts
- src/factories/diagnose-server.factory.ts
- src/glossary/terms.ts
- src/http/simulate-case.controller.ts
- src/http/simulate-hypothesis.controller.ts
- src/investigation/investigation-factory.ts
- src/investigation/run-diagnosis.ts
- src/persistence/relational-glossary-store.repository.ts
- src/seed.ts
tasks:
- task/subject-attribute-check-removal/stop-checking-simulate-subject-attributes-against-the-glossary
- task/subject-attribute-check-removal/remove-the-glossary-check-from-investigation-building
- task/subject-attribute-vocabulary-removal/drop-subject-attribute-from-the-glossary-vocabularies
- task/subject-attribute-vocabulary-removal/drop-the-subject-attributes-table-and-its-foreign-key
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so there was nothing to diagnose
coverage:
- criterion: A simulate-case request whose subject carries an attribute name no glossary vocabulary holds
    is not refused for that reason.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and
      answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations
      — for a released-state pinned case version
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: answers 200 with the complete record likewise for a draft-state pinned case version, never released
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: answers exactly what runSimulate resolved, calling neither a store nor any other dependency
      beyond caseQuery.readCase
  - file: src/__tests__/unit/http/simulate-case.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
  why: 'The integration proof runs the real composition against the real database with the attribute name
    ''contract-number'', which no remaining vocabulary holds (only subject-type, outcome, action, recipient
    and concept fixtures are seeded), and asserts 200 — a glossary refusal on that name would fail it.
    Worth a reader''s attention: the constant is still spelled SEEDED_SUBJECT_ATTRIBUTE_NAME, which now
    names nothing the glossary seeds.'
- criterion: A simulate-hypothesis request whose subject carries an attribute name no glossary vocabulary
    holds is not refused for that reason.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition
      and answers 200 with exactly evidence, one evaluation and durations — collecting only the named
      hypothesis's own revision's concept, never the case's other hypothesis's own concept
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: collects the other hypothesis's own concept instead when that one is named, proving the real
      composition's narrowing follows the given hypothesis rather than a fixed one
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: answers exactly what runSimulateHypothesis resolved, calling neither a store nor any other dependency
      beyond caseQuery.readCase
  - file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
  why: 'Same shape as the simulate-case entry: ''contract-number'' is held by no seeded vocabulary and
    the real composition answers 200.'
- criterion: SimulateCaseControllerDependencies declares exactly caseQuery and runSimulate.
  state: partial
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: SimulateCaseControllerDependencies declares exactly caseQuery and runSimulate — no store, event
      bus or other write-capable dependency the controller could call
  - file: src/__tests__/unit/http/simulate-case.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment narrowed to the response DTO's
      four fields
  why: 'The only test asserting the "exactly" is an expectTypeOf assertion, and it cannot fail as the
    suite is configured: vitest.config.ts enables no typecheck and `npm test` runs `vitest run` alone,
    so expectTypeOf is a runtime no-op (the type is enforced only by the separate `npm run typecheck`).
    What the runtime tests do establish is weaker: every dependency object in the set is built with exactly
    caseQuery and runSimulate and the controller works, so no third *required* field exists; an additional
    optional field — a glossary among them — would go unexercised.'
- criterion: SimulateHypothesisControllerDependencies declares exactly caseQuery and runSimulateHypothesis.
  state: partial
  tests:
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: SimulateHypothesisControllerDependencies declares exactly caseQuery and runSimulateHypothesis
      — no store, event bus or other write-capable dependency the controller could call
  - file: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
    name: answers every one of the first 10 requests within a minute from one source address with its
      ordinary 200 response, none of them refused
  - file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
    name: answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment,
      and leaves no investigation readable by its id immediately afterward, when the investigation write
      is slowed past the persistence deadline
  why: 'Identical to the simulate-case case: the "exactly" rests on an expectTypeOf assertion that is
    a runtime no-op under this suite''s configuration, so only the absence of a third *required* dependency
    is exercised.'
- criterion: Neither controller imports refuseAttributesNotInGlossary or IGlossaryQuery.
  state: uncovered
  why: 'No test in the set reads the import list of simulate-case.controller.ts or simulate-hypothesis.controller.ts.
    The three import-scanning tests present scan for something else: build-app.spec.ts scans http/*.ts
    for HTTP frameworks and authentication packages, diagnose-e2e.spec.ts scans its composition files
    for @anthropic-ai/sdk, and run-diagnosis.spec.ts scans run-diagnosis.ts for case-query/case-store.
    Reinstating either import in a controller would fail nothing.'
- criterion: Neither controller gains a case-input-requirements coverage refusal in place of the removed
    check.
  state: partial
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: answers exactly what runSimulate resolved, calling neither a store nor any other dependency
      beyond caseQuery.readCase
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: answers exactly what runSimulateHypothesis resolved, calling neither a store nor any other dependency
      beyond caseQuery.readCase
  why: Those two tests assert only that readCase and the run function are each called once; they would
    not notice a refusal decided from the case document already in hand. Nothing in the set submits, to
    either simulate controller, a subject that fails to cover the pinned version's own input requirements,
    so a coverage refusal on that path is unexercised. The dependency-type assertions that would exclude
    a requirements query are the same expectTypeOf no-ops named above.
- criterion: diagnose-server.factory.ts constructs both controller dependency objects with no glossary
    field.
  state: partial
  tests:
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and
      answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations
      — for a released-state pinned case version
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition
      and answers 200 with exactly evidence, one evaluation and durations — collecting only the named
      hypothesis's own revision's concept, never the case's other hypothesis's own concept
  why: 'That the factory constructs both objects well enough for both routes to answer is exercised through
    the real composition. That it constructs them with *no glossary field* is not: an extra field the
    controllers ignore would change no response, and no test reads diagnose-server.factory.ts''s source.'
- criterion: A simulate-case request whose subject carries no attribute at all is still refused with an
    HTTP 422 response reporting SubjectCarriesNoAttributeError.
  state: partial
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
      before runSimulate is ever called
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: refuses a subject built with no attribute-value at all with an HTTP 422 response reporting SubjectCarriesNoAttributeError,
      end to end from the refusal buildSubject actually raises
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: refuses with 400 a simulate-case request whose subject carries no attribute at all, at the wire,
      before the route ever reaches its own controller
  why: The refusal is exercised in two separate pieces — the controller throws the typed error, and the
    status map assigns that error 422 — but nothing exercises an HTTP 422 *response* for a simulate-case
    request. On the contrary, build-app.spec.ts asserts that the assembled app answers 400 for exactly
    that body, at the wire, before the controller is reached, so on the composed path the 422 the criterion
    names is unreachable for an empty attributes array.
- criterion: A simulate-hypothesis request whose subject carries no attribute at all is still refused
    with an HTTP 422 response reporting SubjectCarriesNoAttributeError.
  state: partial
  tests:
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
      before runSimulateHypothesis is ever called
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: refuses a subject built with no attribute-value at all with an HTTP 422 response reporting SubjectCarriesNoAttributeError,
      end to end from the refusal buildSubject actually raises
  why: 'Same split as simulate-case, and thinner: no test at all sends an attribute-less subject to /v1/simulate/hypothesis.
    The only wire-level refusal exercised for that route is the 400 for a body naming no hypothesis (simulate-hypothesis-server.factory.spec.ts),
    so the HTTP 422 reporting SubjectCarriesNoAttributeError is unexercised end to end.'
- criterion: status-map.ts maps SubjectCarriesNoAttributeError to HTTP 422.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: refuses a subject built with no attribute-value at all with an HTTP 422 response reporting SubjectCarriesNoAttributeError,
      end to end from the refusal buildSubject actually raises
- criterion: No spec in src/ constructs a simulate-case or simulate-hypothesis controller dependency object
    carrying a glossary, and none stubs a vocabulary-term read for either controller.
  state: uncovered
  why: 'Nothing asserts this; a glossary stub reintroduced into any of these files would fail no test.
    As a fact about the files supplied it does hold — every simulate dependency object in the set (simulate-case.controller.spec.ts,
    simulate-hypothesis.controller.spec.ts, both routes specs, build-app.spec.ts, route-rate-limiting-cross-route-independence.spec.ts,
    diagnose-e2e.spec.ts, diagnose-persistence-deadline-e2e.spec.ts) carries exactly caseQuery plus its
    run function. Two vocabulary-term stubs do exist in the set but neither is wired to a simulate controller:
    build-app.spec.ts''s stubGlossaryQuery feeds the readVocabularyTerm and listVocabularyTerms dependencies,
    and run-diagnosis.spec.ts''s FakeGlossaryQuery feeds the diagnosis pipeline. The criterion''s scope
    is every spec under src/, which is wider than the set audited here, so the claim cannot be settled
    from this set.'
- criterion: src's test suite passes.
  state: unauditable
  why: This is a property of executing the suite, not a behavior any test asserts, and a read-only audit
    cannot establish it — many of the files named here require a reachable PostgreSQL through DATABASE_URL
    (`npm test` runs `vitest run` under `--env-file=.env.test`). Nothing in the set bears on it.
- criterion: buildInvestigation returns an investigation for a subject whose attribute names no glossary
    vocabulary holds, refusing it for no glossary reason.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: carries a subject whose type and every attribute-value pair are valid, unchanged, into the built
      Investigation
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: does not throw when the subject is valid, the evidence covers the collection plan and the evaluations
      cover the required hypotheses exactly once each
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: writes the investigation successfully even though the glossary the pipeline still carries holds
      none of the subject's own attribute names — buildInvestigationOptions no longer copies glossary
      into the literal it hands to buildInvestigation
  why: 'The run-diagnosis test is the load-bearing one: it drives the whole pipeline with an empty FakeGlossaryQuery
    (glossaryHolding()) and asserts the investigation is written, so any glossary refusal over the subject''s
    ''id'' attribute would fail it.'
- criterion: refuseAttributesNotInGlossary is gone from the tree rather than left exported with no caller.
  state: uncovered
  why: Nothing in the set names the function or scans for it. run-diagnosis.spec.ts does assert an export
    list, but only of run-diagnosis.ts ("exports exactly RunDiagnosisOptions and runDiagnosis"); a module
    elsewhere still exporting refuseAttributesNotInGlossary with no caller would fail no test.
- criterion: BuildInvestigationOptions declares no glossary field.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: declares no glossary field on BuildInvestigationOptions at all, required or optional, now that
      the check it fed is gone
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: does not throw when the subject is valid, the evidence covers the collection plan and the evaluations
      cover the required hypotheses exactly once each
  why: The dedicated test is an expectTypeOf assertion over a conditional type, and it cannot fail under
    this suite's configuration (no typecheck in vitest.config.ts; `npm test` is `vitest run`) — it is
    a runtime no-op enforced only by the separate `npm run typecheck`. What runs is that validOptions()
    supplies no glossary and buildInvestigation resolves, which excludes a *required* glossary field but
    not an optional one.
- criterion: run-diagnosis's buildInvestigationOptions builds its literal with no glossary line.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: writes the investigation successfully even though the glossary the pipeline still carries holds
      none of the subject's own attribute names — buildInvestigationOptions no longer copies glossary
      into the literal it hands to buildInvestigation
  why: 'The behavioral consequence — no glossary refusal reaches the build — is genuinely proven. The
    source-level fact is not: run-diagnosis.ts is read by that file''s own scans only for imports, exported
    names and clock calls, so a glossary line still copied into the literal and ignored downstream would
    fail nothing at runtime (only `tsc --noEmit` would object, and the suite does not run it).'
- criterion: InvestigationPipelineOptions.glossary and SimulateHypothesisPipelineOptions.glossary remain
    declared and are still supplied by simulate.factory.ts, production-simulate-hypothesis.factory.ts
    and diagnose.factory.ts.
  state: partial
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment narrowed to the response DTO's
      four fields
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and
      answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations
      — for a released-state pinned case version
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition
      and answers 200 with exactly evidence, one evaluation and durations — collecting only the named
      hypothesis's own revision's concept, never the case's other hypothesis's own concept
  why: 'These runs exercise each of the three factories'' real composition, so a glossary that the pipelines
    still *consume* going missing would surface as a failure there. Neither half of the criterion is asserted
    directly: nothing reads either pipeline options type (the declarations), and nothing observes what
    those three factories pass (the supply). If the remaining glossary is consumed on no path these tests
    reach, dropping it would be invisible.'
- criterion: src/src/errors/subject-attribute-not-in-glossary.error.ts no longer exists.
  state: uncovered
  why: No test in the set asserts the absence of that file. status-map.spec.ts imports twenty-odd error
    classes by path but not this one, and its unmapped-error test uses IncoherentCaseError; the file surviving
    in the tree would fail nothing.
- criterion: No file in src/ imports or names SubjectAttributeNotInGlossaryError.
  state: uncovered
  why: Nothing in the set scans for that identifier. The import scans present look for HTTP frameworks
    and authentication packages (build-app.spec.ts), @anthropic-ai/sdk (diagnose-e2e.spec.ts) and case-query/case-store
    (run-diagnosis.spec.ts).
- criterion: A diagnose whose subject omits an attribute the pinned case version's own requirements name
    required is still refused with an HTTP 422 response reporting a SubjectDoesNotCoverCaseInputsError.
  state: partial
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves SubjectDoesNotCoverCaseInputsError to 422
  why: 'Only the status mapping is exercised. No test in the set submits a diagnose request whose subject
    omits a required attribute: every diagnose path here either stubs caseInputRequirementsQuery to answer
    `{ requirements: [], capabilities_with_malformed_input_schema: [] }` (build-app.spec.ts, route-rate-limiting-cross-route-independence.spec.ts)
    or names the attribute the fixture case wants (diagnose-e2e.spec.ts, diagnose-server.factory.spec.ts).
    The refusal itself, and the HTTP response reporting it, go unexercised.'
- criterion: buildInvestigation's own totality refusal over evidence and evaluations is unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a collection-plan concept has no matching evidence
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when an evidence entry names a concept the collection plan does not hold
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a collection-plan concept has more than one matching evidence entry
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a required hypothesis has no matching evaluation
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when an evaluation names a hypothesis the case does not require
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses to build when a required hypothesis has more than one matching evaluation
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: refuses once, naming every violation from both the evidence and the evaluation totality checks
      together
- criterion: investigation-factory.spec.ts asserts no glossary refusal and constructs no glossary stub.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: does not throw when the subject is valid, the evidence covers the collection plan and the evaluations
      cover the required hypotheses exactly once each
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: carries a subject whose type and every attribute-value pair are valid, unchanged, into the built
      Investigation
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: declares no glossary field on BuildInvestigationOptions at all, required or optional, now that
      the check it fed is gone
  why: 'The first half holds and is self-enforcing: those tests resolve, and a glossary refusal would
    fail them. The second half is not exercised — the file today builds no glossary stub, but a stub reintroduced
    and passed in options would be caught only by `tsc --noEmit`, not by the suite, since the expectTypeOf
    test that guards the options type is a runtime no-op here.'
- criterion: TERM_VOCABULARIES lists exactly subject-type, outcome, action and recipient.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/terms.spec.ts
    name: lists exactly the four term vocabularies subject-type, outcome, action and recipient, in that
      order, holding no fifth entry
- criterion: A GET of /v1/glossary/subject-attribute is answered 400 for a :vocabulary segment naming
    none of the term vocabularies, without reaching listVocabularyTerms.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
    name: answers 400 for a GET of /v1/glossary/subject-attribute, the vocabulary this reduction dropped,
      never reaching listVocabularyTerms
  - file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
    name: answers 400 for a :vocabulary segment naming none of the four term vocabularies, never reaching
      listVocabularyTerms
- criterion: relational-glossary-store.repository.ts's vocabulary-to-table map names no subject_attributes
    table.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: reads %s from its own table, %s, never another vocabulary's
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers each of the four vocabularies with the rows written for it, and no other vocabulary's
      rows
  why: 'The it.each table asserts the four surviving mappings (subject-type→subject_types, outcome→outcomes,
    action→actions, recipient→recipients) and the integration test reads all four back, so each entry
    is pinned. Nothing asserts what the map does *not* hold: no test reads a ''subject-attribute'' vocabulary
    through the store or asserts the map''s key set, so a leftover subject_attributes entry would fail
    nothing at runtime.'
- criterion: VOCABULARY_ROLES in validate-case-coherence.ts holds no subject-attribute entry.
  state: partial
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the fixture case whole, with no coherence violation, through the real case-query wiring
      over the fixture's own glossary and capability data
  why: Nothing in the set reads VOCABULARY_ROLES or exercises validate-case-coherence directly; no test
    file for it is in the set. The one bearing test runs coherence validation over the canonical fixture
    through the real wiring, so a retained subject-attribute role would fail it only if that role were
    actually consulted against the now-absent vocabulary. A retained-but-unconsulted entry is unexercised.
- criterion: Case coherence validation reports the same violations for every case fixture as it did before
    this change.
  state: partial
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the fixture case whole, with no coherence violation, through the real case-query wiring
      over the fixture's own glossary and capability data
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the shared canonical fixture case whole with no CaseVersionNotValidError, and with every
      hypothesis still collecting at least one concept, once this file's own collects-survive-DELETE test
      has already run
  - file: src/__tests__/integration/seed.spec.ts
    name: reads the seeded version back whole, matching every field the fixture document itself declares
      — not only the case's root and its hypotheses' names
  why: Only one fixture case is read (intermittent-connection-outage, version 1) and only in the case
    where the answer is "no violations"; "the same violations" is therefore exercised only as "still none".
    No test in the set drives a fixture that does report violations, and nothing compares a violation
    set against a recorded before-state, so a changed violation *text* or a newly reported violation on
    any other fixture would go unnoticed here.
- criterion: seed.ts calls insertMissingTerms for exactly the four remaining vocabularies.
  state: partial
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own subject-type name, the one the curated case declares as its
      subject
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
      ones together
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
      declare
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and
      fallback declare
  why: 'Each of the four calls is exercised by its own read-back after a real seed run, so dropping one
    would fail. The "exactly" is not: seed.spec.ts spies on nothing and asserts no call set, so a fifth
    insertMissingTerms call for some other vocabulary that happened to resolve would leave every assertion
    passing.'
- criterion: src/src/fixtures/glossary/subject-attribute.json is gone from the tree, and the other five
    fixture files under src/src/fixtures/glossary are still read by seed.ts.
  state: partial
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own subject-type name, the one the curated case declares as its
      subject
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
      ones together
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
      declare
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and
      fallback declare
  - file: src/__tests__/integration/seed.spec.ts
    name: holds every concept the curated case collects, each with the subject types it accepts and its
      ttl, matching the fixture exactly
  why: 'The second half is covered: each of the five surviving fixture files is read by the spec and its
    contents asserted present in the database after seed.ts runs, so a file seed.ts stopped reading would
    fail. The first half is not exercised — nothing asserts subject-attribute.json''s absence, and seed.ts
    ignoring a file that still sat in the tree would fail nothing.'
- criterion: A read of a vocabulary term by a name the named vocabulary does not hold is still refused
    with an HTTP 404 response reporting a VocabularyTermNotHeldError, for each of the four remaining vocabularies.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
    name: refuses with the status the status map assigns VocabularyTermNotHeldError, when the named vocabulary
      does not currently hold the term
  - file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
    name: resolves a term of the %s vocabulary through readVocabularyTerm, and answers with what it holds
  why: 'The 404 refusal is exercised for one vocabulary only — the not-held resolution is scripted as
    `{ held: false, vocabulary: ''recipient'', ... }`. The it.each over TERM_VOCABULARIES covers all four,
    but only for a term the vocabulary *does* hold. So the refusal half goes unexercised for subject-type,
    outcome and action, which is exactly the "for each of the four" the criterion states.'
- criterion: A read over a vocabulary holding one name more than once is still refused with an HTTP 500
    response reporting a DuplicateGlossaryNameError, for each of the four remaining vocabularies.
  state: partial
  tests:
  - file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
    name: answers a listing whose vocabulary holds one name twice with an HTTP 500 response reporting
      DuplicateGlossaryNameError
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a vocabulary whose records hold one name twice
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a duplicated outcome vocabulary before seeding writes anything
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses listing a vocabulary whose records hold one name twice, the same typed error reading
      a single term already raises
  why: The HTTP 500 is exercised for 'action' alone, and on the list route only; read-vocabulary-term.routes.spec.ts
    has no duplicate-name test at all, so a single-term read over a duplicated vocabulary is unexercised
    end to end. At the service level the refusal is exercised for 'action' and 'outcome' only — subject-type
    and recipient are untouched by any duplicate-name case, so the criterion's "for each of the four"
    goes unproven for them.
- criterion: seed.spec.ts asserts a seeded glossary holding four vocabularies and reads no subject-attribute
    fixture.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own subject-type name, the one the curated case declares as its
      subject
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
      ones together
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
      declare
  - file: src/__tests__/integration/seed.spec.ts
    name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and
      fallback declare
  why: 'Each of the four vocabularies has its own read-back assertion, and the file reads only subject-type,
    outcome, action, recipient, concept and capability fixtures — a read of the deleted subject-attribute.json
    would throw in beforeAll and fail the whole file. One limit worth naming: the four claims are four
    separate tests, not an assertion over the vocabulary set, so a fifth seeded vocabulary would pass
    unremarked.'
- criterion: The new migration is the next file in filename order after 0022-case-version-authored-at-default.sql.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: places the subject_attributes-dropping migration immediately after 0022-case-version-authored-at-default.sql
      in filename order
- criterion: Applying every migration in filename order leaves no subject_attributes table in the schema.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: applies every migration script, in the order their file names number them, to a fresh empty
      database and produces every relation the model needs and none it does not
  why: 'Covered, and over-asserting: EXPECTED_TABLES is compared with toEqual against the whole information_schema
    table list of a freshly migrated schema, so the test claims totality over every relation in the database
    where the criterion names only the absence of subject_attributes. It holds today and will break the
    day a sibling task legitimately adds a table. Worth a reader''s routing, not the auditor''s settling.'
- criterion: Applying every migration in filename order leaves investigation_subject_attribute_values
    with no foreign key referencing subject_attributes.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: removes investigation_subject_attribute_values' own foreign key on attribute, so no constraint
      still ties it to a vocabulary table
  why: The probe asserts no FOREIGN KEY constraint over the attribute column at all, which is slightly
    broader than the criterion's "no foreign key referencing subject_attributes" — equivalent while that
    table does not exist, and the broader form is what fails if the constraint returns.
- criterion: A row whose attribute is a name no glossary table holds can be inserted into investigation_subject_attribute_values
    after the migration.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: persists and reads back a full investigation together with its evidence, evaluation, citation
      and subject-attribute-value
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses a second subject-attribute-value row sharing one investigation, attribute and value
      already stored, through investigation_subject_attribute_values' own unchanged primary key
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction, with written_at assigned by the store itself at settle rather than the literal
      the fixture supplied
  - file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
    name: writes two independent investigation records for two calls sharing the same case, subject, narrative
      and requester
  why: In the migrated schema 'an-attribute' is held by no table (the suite seeds only subject_types,
    outcomes, actions, recipients, concepts and capabilities), and the store specs write freshly generated
    attribute names that are inserted nowhere, so a restored foreign key would fail all four. None of
    these tests is named for this criterion, but the insert is the mechanism each depends on.
- criterion: investigation_subject_attribute_values' primary key over (investigation_id, attribute, value)
    is unchanged by the migration.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: refuses a second subject-attribute-value row sharing one investigation, attribute and value
      already stored, through investigation_subject_attribute_values' own unchanged primary key
  why: 'Uniqueness over the full triple is exercised, but that tells apart no candidate key narrower than
    it: a primary key over (investigation_id, attribute) alone would refuse that same insert and pass.
    Nothing inserts two rows sharing one investigation and attribute with *different* values, and no information_schema
    probe reads the key''s column list, so that `value` is part of the key — the part the criterion names
    — goes unexercised.'
- criterion: investigation_subject_attribute_values' foreign key to investigations (id) is unchanged by
    the migration.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: still refuses a subject-attribute-value row whose investigation_id names no stored investigation,
      through investigation_subject_attribute_values' own foreign key to investigations
- criterion: Rows present in investigation_subject_attribute_values before the migration are all present
    after it.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: preserves an already-stored subject-attribute-value row when migration 0023 runs on top of every
      migration before it
  why: The test applies every migration up to 0023, stores a row, then applies 0023 and asserts the row's
    attribute and value survive — a drop-and-recreate would fail it. It exercises one row rather than
    several, so "all" is proven only in the sense that preservation is not selective on anything the test
    varies.
- criterion: schema-migrations.spec.ts's expected table list omits subject_attributes.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: applies every migration script, in the order their file names number them, to a fresh empty
      database and produces every relation the model needs and none it does not
  why: 'Self-enforcing: EXPECTED_TABLES is compared with toEqual against the migrated schema, so a list
    that still named subject_attributes would fail this test.'
- criterion: schema-migrations.spec.ts's foreign-key probe over investigation_subject_attribute_values
    asserts the dropped constraint rather than the enforced one.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: removes investigation_subject_attribute_values' own foreign key on attribute, so no constraint
      still ties it to a vocabulary table
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: still refuses a subject-attribute-value row whose investigation_id names no stored investigation,
      through investigation_subject_attribute_values' own foreign key to investigations
  why: 'Also self-enforcing: the probe asserts the attribute-column foreign key is absent, and a probe
    rewritten to assert it enforced would fail against the migrated schema. The separate investigations
    foreign key is asserted by its own test, so the two are not conflated.'
- criterion: No test in src/ reads from or writes to the subject_attributes table.
  state: uncovered
  why: 'Nothing asserts this, and the set contradicts it: schema-migrations.spec.ts writes to the table
    in seedMinimalPreMigrationVocabulary — `INSERT INTO subject_attributes (name) VALUES (''an-attribute'')`
    — which the test "preserves an already-stored subject-attribute-value row when migration 0023 runs
    on top of every migration before it" calls after applying only the migrations before 0023, while the
    table still exists. Whether a pre-0023 write is within the criterion''s intent is a reader''s call,
    not this audit''s; as the criterion is written, it does not hold over this set, and no test would
    report it either way.'
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
reconciliation: siegard-reconcile/subject-attribute-glossary-removal-backend.md
findings:
- pass: conformance
  file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  where: the `consolidation_register` field of the `CaseFixtureDocument` type, line 117
  evidence: 'readonly consolidation_register?: ''formal'' | ''plain'';'
  cost: The register's closed vocabulary — formal or plain — is spelled out a second time here instead
    of being read from the domain type that already carries it. If domain/knowledge/consolidation-register's
    enumeration ever changed, this literal union would not change with it.
  correction: Type this field from the shared consolidation-register type the domain module already exposes
    instead of restating the literal union 'formal' | 'plain' locally.
- pass: conformance
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: the title string of the third `it()` block, lines 472-476
  evidence: "\"declares TOTAL_DEADLINE_BUDGET_MS, the total deadline this file injects into the diagnose\
    \ runner, equal to \" +\n  \"rules/investigation/an-answer-arrives-within-the-declared-deadline's\
    \ own declared total of 20000ms \" +\n  '(2000 overhead/margin + 7000 collection + 5000 judgment +\
    \ 4000 writing + 2000 persistence), never a locally ' +\n  'chosen figure that diverges from it'"
  cost: The only assertion this test makes is `expect(declared).toBe(20_000)` — it never reads back or
    checks the per-stage split. If the specification's own breakdown of the twenty-second budget changes,
    this title keeps stating the old split as fact and nothing here would catch the drift; a reader who
    trusts this title for the breakdown reads a business decision that may no longer be the one the node
    holds.
  correction: Drop the parenthetical breakdown from the title (or state it without the specific numbers),
    leaving the title tied only to the figure the test actually verifies — the 20000ms total.
- pass: conformance
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  where: the IGlossary interface (lines 39-46) and its use to build the `glossary` fixture (lines 250-264,
    288-296)
  evidence: "interface IGlossary {\n  subjectType: string;\n  outcome: string;\n  action: string;\n  recipient:\
    \ string;\n  subjectAttribute: string;\n  concept: string;\n}"
  cost: 'Five of the six fields this type groups together — subjectType, outcome, action, recipient, concept
    — are governed vocabulary terms this same suite still enforces through a foreign key to a vocabulary
    table (subject_types, outcomes, actions, recipients, concepts). subjectAttribute is bundled into the
    same "glossary" shape and populated the same way (`subjectAttribute: ''an-attribute''` in seedMinimalPreMigrationVocabulary
    and in the shared `glossary` fixture), even after migration 0023 — verified by this very file — drops
    the vocabulary table and the foreign key that once tied attribute to it. A reader relying on this
    type to learn which subject facts remain glossary-checked after the drop will read subject-attribute
    as still belonging to that governed set, when the specification holds the opposite.'
  correction: Drop subjectAttribute from IGlossary (or rename the type so it no longer implies every member
    is a governed vocabulary term) and carry the attribute name as a plain, separately named string wherever
    a fixture needs one.
- pass: conformance
  file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: the test 'does not treat a whitespace-only description as naming none...', lines 302-316
  evidence: "const registered = await glossary.registerConcept({\n  name: 'a-whitespace-description-concept',\n\
    \  accepts: ['a-subject-type'],\n  description: '   ',\n});\n\nexpect(registered.description).toBe('\
    \   ');"
  cost: No node decides whether a whitespace-only description counts as "no description" for rules/glossary/a-concept-declares-its-description's
    own refusal, yet this test fixes the answer as "no, it is a real description, stored verbatim" — the
    opposite of the idiom the specification applies everywhere else a required text field is checked (a
    connector name, a case's slug/title/subject/fallback), where "whitespace alone holds none" is the
    decided reading.
  correction: Decide, into rules/glossary/a-concept-declares-its-description (or a sibling node), whether
    a whitespace-only description is read as no description, and record the decision in the decision log.
- pass: conformance
  file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: the test 'answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)',
    lines 513-521
  evidence: 'const page = await glossary.listVocabularyTerms(''subject-type'', { offset: 0, limit: 0 });


    expect(page.pageCount).toBe(0);'
  cost: constraints/listings-are-paged states a limit is "an optional positive integer" and that "no request
    with a non-positive limit reaches the count, because a-malformed-request-is-refused-with-a-validation-error
    refuses it first" — this case is never supposed to reach this computation, yet this test fixes a defined
    answer for it.
  correction: Either remove the test (a non-positive limit is refused before reaching the service), or
    record in the specification that listVocabularyTerms is also required to tolerate a non-positive limit
    and answer a zero page count.
- pass: conformance
  file: src/__tests__/unit/http/build-app.spec.ts
  where: the test "refuses with 400 a request whose subject carries no attribute at all" (diagnose route),
    around line 612-624
  evidence: "const response = await app.inject({\n  method: 'POST',\n  url: '/v1/diagnose',\n  payload:\
    \ validRequestBody({ subject: { type: 'a-subject-type', attributes: [] } }),\n});\n\nexpect(response.statusCode).toBe(400);\n\
    expect(built.runDiagnose).not.toHaveBeenCalled();"
  cost: 'The specification''s own decision for this exact condition (decision-log.md, location rules/investigation/a-subject-carries-at-least-one-attribute.md:
    "A call whose subject carries no attribute-value is refused with an HTTP 422 response reporting a
    SubjectCarriesNoAttributeError", precisely because "400 being reserved by a-malformed-request-is-refused-with-a-validation-error
    for the route''s declared shape") calls for HTTP 422 and a named domain error here, not the generic
    400 this test locks in with no error-class assertion at all.'
  correction: assert HTTP 422 and a SubjectCarriesNoAttributeError body for this request, matching the
    node's statement
- pass: conformance
  file: src/__tests__/unit/http/build-app.spec.ts
  where: the test "refuses with 400 a simulate-case request whose subject carries no attribute at all,
    at the wire, before the route ever reaches its own controller", around line 696-707
  evidence: "const response = await app.inject({\n  method: 'POST',\n  url: '/v1/simulate',\n  payload:\
    \ { ...validSimulateRequestBody(), subject: { type: 'a-subject-type', attributes: [] } },\n});\n\n\
    expect(response.statusCode).toBe(400);"
  cost: 'Same rule, same decided response: rules/investigation/a-subject-carries-at-least-one-attribute
    names no exception for simulate. This test''s own title frames the 400 as a wire-level shape check,
    but the node''s decided fact is a domain refusal (422, SubjectCarriesNoAttributeError), not a shape
    violation.'
  correction: assert HTTP 422 and a SubjectCarriesNoAttributeError body for this request, matching the
    node's statement
- pass: conformance
  file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  where: line 103, inside the 404-refusal test (lines 93-104)
  evidence: 'expect(body.error.details).toEqual({ vocabulary: ''recipient'', name: ''an-absent-term''
    });'
  cost: The specification's own governing node for this refusal states only the status and the error class;
    this test additionally fixes, as a guaranteed contract, that the response body's error.details carries
    {vocabulary, name}, a fact no node holds.
  correction: Decide, and record in rules/glossary/a-glossary-read-by-an-unheld-name-is-refused (or a
    decision-log entry locating it there), what a VocabularyTermNotHeldError refusal's details payload
    carries.
- pass: conformance
  file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  where: line 60, inside the case/hyphenation-preservation test (lines 53-61)
  evidence: expect(built.readVocabularyTerm).toHaveBeenCalledWith('outcome', 'Mixed-Case-Term');
  cost: Whether a vocabulary-term name is looked up exactly as spelled or normalized before resolution
    is fixed here as "never normalized" for one route's own test, with no node stating this matching semantics
    either way.
  correction: Decide, in a node describing how the published glossary read resolves a vocabulary-term
    name, whether the name is matched exactly as given or normalized before lookup.
- pass: conformance
  file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  where: line 11 (EXPECTED_DEADLINE_BUDGET_MS) and the test titled 'computes now and a deadline the specification-declared
    twenty seconds later...' (lines 152-165)
  evidence: 'const EXPECTED_DEADLINE_BUDGET_MS = 20_000;

    it(''computes now and a deadline the specification-declared twenty seconds later, immediately before
    calling runSimulateHypothesis, and includes both in the call it sends'', async () => {

    expect(call?.deadline).toBe((call?.now ?? 0) + EXPECTED_DEADLINE_BUDGET_MS);'
  cost: rules/investigation/an-answer-arrives-within-the-declared-deadline constrains domain/investigation/investigation,
    a record neither simulate operation ever creates; its twenty-second breakdown even spends time on
    writing and persistence stages simulate-hypothesis never reaches. The 20,000ms figure this controller
    is held to lives only in this test.
  correction: A node stating simulate-hypothesis's own deadline budget (or extending an existing deadline
    rule's scope to cover it) would have to exist before this test could cite one as specification-declared.
- pass: conformance
  file: src/errors/status-map.ts
  where: the STATUS_BY_ERROR_CLASS map, lines 43-83 (and its import list, lines 1-39)
  evidence: "[InvestigationWriteDeadlineExceededError, 500],\n  [DuplicateGlossaryNameError, 500],\n]);"
  cost: DuplicateConceptAnswerError is a fully implemented, named error carrying its own concept and answers
    context, but it is imported and named nowhere in this map. A concept read that finds two capabilities
    answering it throws this class, statusForError finds no matching entry and falls through to a generic
    500/INTERNAL_ERROR, indistinguishable from any other unanticipated server fault.
  correction: import DuplicateConceptAnswerError from './duplicate-concept-answer.error.js' and add [DuplicateConceptAnswerError,
    500] to STATUS_BY_ERROR_CLASS.
- pass: conformance
  file: src/glossary/terms.ts
  where: line 7 — `export type SubjectAttribute = GlossaryTerm;`, sitting between SubjectType (line 5)
    and Outcome (line 9)
  evidence: export type SubjectAttribute = GlossaryTerm;
  cost: TERM_VOCABULARIES already lists exactly the four vocabularies the glossary publishes, with no
    'subject-attribute' entry. Leaving SubjectAttribute typed as a GlossaryTerm — the same governed-name
    shape as SubjectType, Outcome, Action and Recipient — tells the next reader that a fifth governed
    vocabulary still exists, exactly the fact domain/investigation/subject-attribute-value says is no
    longer true.
  correction: Remove the SubjectAttribute type alias; no node models a governed subject-attribute vocabulary
    any longer.
- pass: conformance
  file: src/http/simulate-hypothesis.controller.ts
  where: the module-level constant TOTAL_DEADLINE_BUDGET_MS and its use in the deadline field passed to
    runSimulateHypothesis
  evidence: 'const TOTAL_DEADLINE_BUDGET_MS = 20_000;

    deadline: now + TOTAL_DEADLINE_BUDGET_MS,'
  cost: rules/investigation/an-answer-arrives-within-the-declared-deadline is scoped explicitly to "a
    diagnosis" and includes writing/persistence stages simulate-hypothesis never runs. This controller
    nonetheless binds simulate-hypothesis to the same 20,000ms ceiling with no node naming that figure
    for this operation.
  correction: Add a node (or extend an existing one) stating simulate-hypothesis's own total deadline
    budget explicitly, with a decision-log entry disclosing the value.
- pass: conformance
  file: src/investigation/run-diagnosis.ts
  where: the throw in writeWithinDeadline, line 89, reusing stageBoundMs
  evidence: "const stageBoundMs = persistenceStageBoundMs(now, deadline, elapsedBeforePersistenceMs);\n\
    const settled = stageBoundMs > 0 && (await persistWithinBound(store, investigation, stageBoundMs));\n\
    if (!settled) {\n  throw new InvestigationWriteDeadlineExceededError(investigation.id, stageBoundMs);\n\
    }"
  cost: The node requires remainingMs to be the milliseconds that remained of the declared deadline when
    persistence gave up. stageBoundMs is instead the bound persistence was granted at entry, fixed before
    any write attempt runs. A requester who meets this refusal is told a number that is never the actual
    deadline slack left when persistence stopped trying — sometimes overstating it as nonzero when in
    fact none was left.
  correction: Compute the milliseconds actually remaining of the declared deadline at the instant persistence
    gives up and pass that value — not the pre-computed stageBoundMs — as the error's remainingMs.
- pass: conformance
  file: src/seed.ts
  where: seedConcepts(), lines 74-84
  evidence: "await connection.query(\n  `INSERT INTO concepts (name, ttl, description) VALUES ($1, $2,\
    \ $3)\n   ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,\n  [concept.name,\
    \ concept.ttl, concept.description],\n);\nfor (const subjectType of concept.accepts) {\n  await connection.query('INSERT\
    \ INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',\
    \ [concept.name, subjectType]);\n}"
  cost: 'Re-seeding an environment where a concept''s fixture already exists but its ttl changed, or a
    subject type was removed from its accepts list, leaves the stored ttl and the stale concept_accepts
    row exactly as they were: the UPDATE clause touches only description, and the concept_accepts insert
    only adds pairs, never removes one the fixture no longer names.'
  correction: On conflict, update ttl (not only description) from the fixture, and reconcile concept_accepts
    to the fixture's own accepts list — removing a pair the fixture no longer names.
- pass: standard
  file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  where: lines 36-89 — requireDatabaseUrl, readTermNames, insertTerms, insertConcepts, insertCapabilities
  cites: MNT-03
  evidence: "async function insertConcepts(connection: DatabaseConnection): Promise<void> {\n  const raw\
    \ = await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8');\n  const concepts = JSON.parse(raw)\
    \ as ReadonlyArray<{ name: string; accepts: readonly string[]; ttl: number }>;\n  for (const concept\
    \ of concepts) {\n    await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2) ON\
    \ CONFLICT DO NOTHING', [concept.name, concept.ttl]);\n    for (const subjectType of concept.accepts)\
    \ {\n      await connection.query(\n        'INSERT INTO concept_accepts (concept_name, subject_type_name)\
    \ VALUES ($1, $2) ON CONFLICT DO NOTHING',\n        [concept.name, subjectType],\n      );\n    }\n\
    \  }\n}"
  cost: This same cluster of helpers — requireDatabaseUrl, readTermNames, insertTerms, insertConcepts,
    insertCapabilities, insertConnectorConfigurations, isForeignKeyViolation, deleteTolerantly, baseEnv
    — is retyped byte-for-byte in src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    and src/__tests__/integration/factories/simulate-case-server.factory.spec.ts (both in this same changeset),
    and again in case-fixture-reads-clean.spec.ts and the two diagnose e2e specs. A change to how a concept
    or capability row is seeded — e.g. a new NOT NULL column the fixture must now supply — has to be found
    and fixed in each copy separately, and whichever copy the author does not think to touch keeps seeding
    the old shape silently until its own test happens to expose it.
  correction: Extract this fixture-seeding cluster into one shared helper module under src/__tests__ that
    every integration spec imports, rather than each spec file defining its own copy.
---

## What it is

Four passes over the whole delivered change: whether the tests prove each task's own criteria, whether the source states only what the specification holds, whether the source follows the project's own standard, and (skipped, since the captured run passed clean) why a run failed.

## Notes

None.
