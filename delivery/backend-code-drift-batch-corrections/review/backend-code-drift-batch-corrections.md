---
title: Review of backend-code-drift-batch-corrections
summary: Reviews the six delivered tasks of the backend-code-drift-batch-corrections initiative -- case-version-state-from-canonical-list, input-requirements-validates-at-read, malformed-configuration-vocabularies, simulation-response-integer-fields, written-at-is-required, and seeded-concepts-declare-descriptions -- against their criteria, the specification, the project's own standard, and one captured run over the whole change.
reviewed:
- src/persistence/relational-case-store.repository.ts
- src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
- src/case/case-query.service.ts
- src/case/validate-case-coherence.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/http/dto/simulate-case.dto.ts
- src/http/dto/simulate-hypothesis.dto.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
- src/investigation/investigation.ts
- src/investigation/investigation-factory.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/investigation.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/fixtures/glossary/concept.json
- src/seed.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
- src/__tests__/unit/seed.spec.ts
tasks:
- task/case-version-read-and-lifecycle-fidelity/case-version-state-from-canonical-list
- task/case-version-read-and-lifecycle-fidelity/input-requirements-validates-at-read
- task/connector-and-registry-fidelity/malformed-configuration-vocabularies
- task/investigation-record-declared-types/simulation-response-integer-fields
- task/investigation-record-declared-types/written-at-is-required
- task/seeded-concept-vocabulary/seeded-concepts-declare-descriptions
passes:
- pass: conformance
- pass: coverage
- pass: standard
- pass: failures
  missing: the captured run (run/backend-code-drift-batch-corrections) passed every step -- install, typecheck, lint, secret-scan, test -- so there was no failure for this pass to diagnose
coverage:
- criterion: isCaseVersionState decides membership against an exported canonical array of the case-version-state values, in the same form isHypothesisRevisionState already uses.
  state: uncovered
  why: Nothing in the set reads the guard's own declaration or names an exported canonical array. The two store specs exercise only the guard's behaviour -- draft and released accepted, archived refused -- which passes identically for a condition written against inline literals.
- criterion: The values the guard accepts are exactly draft and released, spelled as domain/knowledge/case-version-state spells them.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: leaves released_at out of the assembled version entirely when the stored row is a draft with no released_at
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: raises this store's own typed error rather than answering a row whose state is outside the declared enumeration
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: records the instant of release when release is called against a draft version
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: assembles one version whole -- its own attributes together with its manifest, ordered by position regardless of the order entries were placed in, each entry joined to its own adopted hypothesis-revision and its collects
- criterion: No literal draft or released string remains in isCaseVersionState own condition.
  state: uncovered
  why: No test in the set reads the source of isCaseVersionState or of the module declaring it. Every test bearing on the guard asserts its outcome, which is the same whether the condition names literals or the canonical array.
- criterion: A stored state value the enumeration does not hold is still rejected by the guard.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: raises this store's own typed error rather than answering a row whose state is outside the declared enumeration
- criterion: Every path resolving a case version state through the guard -- assembleVersion, listCases, createDraftVersion, releaseVersion, discardDraft and updateDraftVersion -- resolves the same state it resolved before.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: leaves released_at out of the assembled version entirely when the stored row is a draft with no released_at
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: assembles one version whole -- its own attributes together with its manifest, ordered by position regardless of the order entries were placed in, each entry joined to its own adopted hypothesis-revision and its collects
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: records the instant of release when release is called against a draft version
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a second release call against a version already released, through CaseVersionNotDraftAtReleaseError, leaving its recorded released_at unchanged
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: removes a draft version and its own manifest entries, without deleting any hypothesis-revision
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses discard, through CaseVersionNotDraftError, against a released version, leaving it -- its state, its released_at and its manifest -- untouched
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: leaves everything beyond its own five declared attributes untouched -- the manifest, the version number and the draft state itself
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: reads an entry's current_state and last_updated off the case's highest-numbered version whatever its own state, even though that same case's released fields still come from the earlier released version
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: refuses updateDraft with CaseVersionNotDraftError, naming the slug, version and state, and writes no attribute, when the version is not in draft state
  why: listCases is exercised resolving the draft state only -- the one catalog test asserting current_state names a case whose highest-numbered version is a draft, and no entry in the set asserts current_state for a case whose highest-numbered version is released, so that resolution through listCases is unexercised.
- criterion: The canonical array is declared in one place, with no second list of the same values introduced.
  state: uncovered
  why: Nothing in the set inspects declarations across the tree; a second list of draft and released declared anywhere would leave every test in the set passing.
- criterion: The refusals rules/knowledge/a-case-version-moves-through-its-declared-lifecycle states, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError, keep their stated status and name.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: refuses removeManifestEntry with CaseVersionNotDraftError, naming the slug, version and state, and deletes no manifest entry, when the version is not in draft state
  - file: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
    name: refuses release with CaseVersionNotDraftAtReleaseError, naming the slug, version and state, changing neither its state nor its released_at, when the version is not in draft state
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses a second release call against a version already released, through CaseVersionNotDraftAtReleaseError, leaving its recorded released_at unchanged
  - file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
    name: refuses discard, through CaseVersionNotDraftError, against a released version, leaving it -- its state, its released_at and its manifest -- untouched
  why: 'The name half is bound by the instanceof assertions on both error classes. The stated status half is unexercised: nothing in the set resolves a status for either error -- the one statusForError assertion in the set is over ReleasedHypothesisRevisionNotAlterableError, a different refusal.'
- criterion: readCaseInputRequirements runs over the named stored version the same validator-rule check readCase runs over it.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a draft version's input requirements once a coherence rule stops holding for its collected concept, the same CaseVersionNotValidError read-case itself throws for the identical content
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally invalid case version the same way read-case does, naming the violation in a CaseVersionNotValidError
- criterion: A read naming a stored version for which a validator rule does not hold at that reading answers no input requirements at all.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a draft version's input requirements once a coherence rule stops holding for its collected concept, the same CaseVersionNotValidError read-case itself throws for the identical content
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a structurally invalid case version the same way read-case does, naming the violation in a CaseVersionNotValidError
- criterion: That refusal is an HTTP 409 response reporting a CaseVersionNotValidError.
  state: uncovered
  why: No test in the set reaches the HTTP layer or the status map for this refusal; it is exercised only as a CaseVersionNotValidError thrown out of readCaseInputRequirements, so the status it answers with is unexercised.
- criterion: That refusal is not the generic refusal a domain error the status map does not name receives.
  state: uncovered
  why: Nothing in the set resolves a status for the refusal at all, so neither the 409 nor its distinctness from the generic fallback for an unnamed domain error is exercised.
- criterion: That refusal is not a CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses a draft version's input requirements once a coherence rule stops holding for its collected concept, the same CaseVersionNotValidError read-case itself throws for the identical content
- criterion: A read naming a slug, or a slug and version, that no stored case version answers is still refused as a CaseNotFoundError.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
  why: The file holds two tests under this exact title -- one over readCase, one over readCaseInputRequirements; the latter is the one bearing here. The named slug and version are both absent in that test, so the variant where the slug is stored and only the version is not goes unexercised for this read.
- criterion: A read naming a stored draft version every validator rule holds for is not refused by this check.
  state: covered
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers identical input requirements for a draft version and the same version once released
- criterion: A read naming a stored version every validator rule holds for still answers one case-input-requirement per subject attribute that a capability answering a concept in the version collection plan names in properties.
  state: partial
  tests:
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: answers identical input requirements for a draft version and the same version once released
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: derives from the currently registered capabilities read fresh at every call, answering differently once a capability is registered between two calls for the same version
  - file: src/__tests__/unit/case/case-query.service.spec.ts
    name: folds a concept whose answering capability is later forgotten into no attribute for that concept, rather than refusing the read -- the derivation node's own carve-out for capability availability, which this method's gate deliberately leaves to deriveCaseInputRequirements instead of refusing over
  why: The one-per-attribute totality is exercised only over a single capability whose input schema names one property, answering a plan holding one concept. Nothing submits a schema naming two properties, or two capabilities answering two concepts, so a derivation answering only the first attribute, or collapsing two concepts' attributes into one requirement, would pass.
- criterion: A read naming a stored version every validator rule holds for still names separately each resolved capability whose own stored input schema does not currently hold a well-formed shape.
  state: uncovered
  why: No test in the set reads input requirements over a version whose resolved capability carries a malformed input schema while every validator rule holds -- the tests that hold such a capability all end in a refusal on other grounds -- and no assertion anywhere reads the separately named capabilities the answer is meant to carry.
- criterion: The problem message for a method outside the accepted set names those methods by deriving them from HTTP_METHODS.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: names the accepted methods, derived from HTTP_METHODS, in the refusal thrown for a method outside the accepted set
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: states neither the HTTP methods nor the evidence-result endings as literal enumerated text, naming each vocabulary only through the HTTP_METHODS and EVIDENCE_RESULTS it imports
  why: 'The derivation is bound only by the pair: the message assertion builds its expectation from HTTP_METHODS and so would also pass for a literal spelling the same list, and the source check rules out just that one comma-space joined spelling.'
- criterion: The problem message for a malformed statusMap names the accepted endings by deriving them from EVIDENCE_RESULTS.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: names the accepted evidence-result endings, derived from EVIDENCE_RESULTS, in the refusal thrown for a statusMap not mapping to an accepted ending
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: states neither the HTTP methods nor the evidence-result endings as literal enumerated text, naming each vocabulary only through the HTTP_METHODS and EVIDENCE_RESULTS it imports
  why: As with the method message, the derivation is established only by the message assertion together with the source check; the message assertion alone builds its expectation from EVIDENCE_RESULTS and would pass for a literal spelling the same endings.
- criterion: No string literal in src/src/investigation/http-declarative-observation-source.adapter.ts enumerates the HTTP methods or the evidence-result endings.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: states neither the HTTP methods nor the evidence-result endings as literal enumerated text, naming each vocabulary only through the HTTP_METHODS and EVIDENCE_RESULTS it imports
  why: The check rules out only the exact comma-space joined spellings of the two vocabularies. A string literal enumerating the same methods or endings in any other form -- an array literal, an or-joined phrase, or separate literals in a condition -- passes it, so "no string literal enumerates" is not established.
- criterion: A configuration declaring a method HTTP_METHODS does not hold issues no call and ends unavailable with a result detail reporting a MalformedHttpConnectorConfigurationError.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a recognized method
- criterion: A configuration whose statusMap is not an object mapping an HTTP status to one evidence-result ending issues no call and ends unavailable with a result detail reporting a MalformedHttpConnectorConfigurationError.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a statusMap
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: names the accepted evidence-result endings, derived from EVIDENCE_RESULTS, in the refusal thrown for a statusMap not mapping to an accepted ending
  why: Through observeConcept only an absent statusMap is submitted. Nothing submits, through observeConcept, a statusMap that is an object mapping a status to a value outside the evidence-result endings -- that shape is exercised only against the exported narrowing function, where the assertion is on the problem message rather than on issuing no call and ending unavailable.
- criterion: A configuration declaring a method HTTP_METHODS holds, a responseMap of string paths, and a statusMap of evidence-result endings is not refused by this well-formedness check.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries an observation on the ok ending
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: issues exactly one outbound call per observeConcept invocation
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: issues the connector's own declared HTTP method rather than defaulting to GET, for a read-only capability whose own endpoint requires POST
  why: No test asserts non-refusal as its own subject; the criterion is carried by the ok-ending outcome assertions over the well-formed default configuration, which would read unavailable with a MalformedHttpConnectorConfigurationError detail if the check refused it.
- criterion: A response whose usage.input_tokens is fractional fails validation in the simulate-case response schema and in the simulate-hypothesis response schema.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose assessment usage carries a fractional input_tokens
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects a response whose evaluation usage carries a fractional input_tokens
  why: In the simulate-case schema only the assessment's own usage is submitted fractional; the usage an evaluation may carry there is never submitted fractional, so that occurrence is unproven unless the two share one usage schema within the file.
- criterion: A response whose usage.output_tokens is fractional fails validation in both response schemas.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose assessment usage carries a fractional output_tokens
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects a response whose evaluation usage carries a fractional output_tokens
  why: As with input_tokens, the simulate-case case is submitted only through the assessment's usage; the usage an evaluation may carry in that same schema is not submitted fractional.
- criterion: A response whose evaluation elapsed_ms is fractional fails validation in both response schemas.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose evaluation elapsed_ms is fractional, on the confirmed branch
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects a response whose evaluation elapsed_ms is fractional
- criterion: A response whose durations.collection is fractional fails validation in both response schemas.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose durations.collection is fractional
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects a response whose durations.collection is fractional
- criterion: A response whose durations.judgment is fractional fails validation in both response schemas.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose durations.judgment is fractional
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects a response whose durations.judgment is fractional
- criterion: A response whose durations.total is fractional fails validation in both response schemas.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose durations.total is fractional
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: rejects a response whose durations.total is fractional
- criterion: A simulate-case response whose durations.writing is present and fractional fails validation.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: rejects a response whose durations.writing is present and fractional
- criterion: A response carrying integers in all of those fields, otherwise shaped as the simulation pipeline produces it, passes validation unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: validates a response whose evaluation carries usage and elapsed_ms and whose durations carries writing, all as integers, matching a completed simulation that made a model call and reached consolidation
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: validates a production-shaped response with no field stripped from its assessment or its evidence
  - file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: validates a response whose durations.collection is zero, matching a stage measured below one millisecond
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a response whose evaluation carries usage and elapsed_ms as integers, matching a completed simulation that made a model call
  - file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a production-shaped response with no field stripped from its evidence or its evaluation
- criterion: Each of the two files continues to declare its own usage and durations schemas, with no shared schema module introduced.
  state: uncovered
  why: Nothing in the set reads either dto file's own declarations or its imports; both files are exercised only through safeParse, so extracting the usage and durations schemas into a shared module would leave every test in the set passing.
- criterion: The Investigation type declares written_at without an optional marker.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation.spec.ts
    name: declares written_at as a required string, matching domain/investigation/investigation's own required attribute
  why: 'The assertion is a type-level one, decided by a TypeScript compile rather than by the runner: vitest.config.ts declares no typecheck block, so under vitest''s own run expectTypeOf is erased and this test asserts nothing at runtime. Which step decides it lies outside this set.'
- criterion: An object lacking written_at is rejected by the compiler where an Investigation is expected.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation.spec.ts
    name: refuses an object literal omitting written_at as an Investigation, even though every other declared attribute is present
  - file: src/__tests__/unit/investigation/investigation.spec.ts
    name: assigns to Investigation once written_at is supplied alongside every other declared attribute, proving the refusal above is written_at and nothing else
  why: The first test's whole assertion is its @ts-expect-error, and its body carries no runtime expectation; with no typecheck block in vitest.config.ts it cannot fail under vitest alone, and is decided only by a TypeScript compile the project's own steps run.
- criterion: No producer of an Investigation acquires a written_at assignment it did not already make.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: builds an Investigation carrying no written_at, rather than refusing, when written_at is missing entirely from the given options -- the store decides that value later, at settle
  - file: src/__tests__/unit/investigation/investigation-factory.spec.ts
    name: carries written_at from the given options, unchanged
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends every declared attribute of the root row -- identity, subject type, prompt version, model, pinned case, assessment, cost and durations -- as the root insert's own params, in order, with written_at never among them
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written -- root, subject attribute-values, evidence with its capability pin, evaluations with their citations, assessment, cost and durations -- through one transaction, with written_at assigned by the store itself at settle rather than the literal the fixture supplied
  why: Two producers are exercised -- buildInvestigation, shown to acquire no written_at when the options carry none, and the store, whose settle-time assignment is shown to be the one that stands. Nothing in the set enumerates the producers of an Investigation, so a third producer that began assigning written_at would leave every test here passing.
- criterion: The declared type of written_at remains the datetime representation it already carries.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation.spec.ts
    name: declares written_at as a required string, matching domain/investigation/investigation's own required attribute
  - file: src/__tests__/unit/investigation/investigation.spec.ts
    name: refuses a written_at value that is not the string datetime representation the domain model already declares
  why: Both assertions are type-level and are decided by a TypeScript compile rather than by vitest, which declares no typecheck block. What is bound is the string type; no assertion in the set holds a written_at value to a datetime format.
- criterion: Every concept row the seed inserts carries a non-empty description.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: writes the concepts.description column with the fixture's own non-empty description text, for every concept the curated case collects
  why: The totality is read off src/fixtures/glossary/concept.json -- every concept named there is checked against its stored row -- so a concept row the seed inserts from any other source carries no assertion.
- criterion: src/src/fixtures/glossary/concept.json declares a description for every concept it holds.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
    name: declares a non-empty description for every concept it holds
- criterion: The seed reads each concept description from that fixture rather than from a literal in the seed script.
  state: covered
  tests:
  - file: src/__tests__/unit/seed.spec.ts
    name: passes each concept's description straight through, as the INSERT's third bound parameter, to the concepts table
  - file: src/__tests__/unit/seed.spec.ts
    name: embeds none of the fixture's own concept description text as a literal string in its own source
  - file: src/__tests__/integration/seed.spec.ts
    name: writes the concepts.description column with the fixture's own non-empty description text, for every concept the curated case collects
  why: The first of those asserts against the seed's own source text -- a regex over the INSERT and its bound params -- rather than over behaviour, and would break on a rearrangement that kept the criterion true. What binds the criterion is the integration test's fixture-to-column agreement together with the absence of the description text as a literal in the seed.
- criterion: Each seeded description states what the named observation means and names no decision a case own criterion or a specification rule governs.
  state: partial
  tests:
  - file: src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
    name: states what each collected concept's named observation means without repeating the curated case's own hypothesis criterion or resolution vocabulary
  why: 'Only the negative half is exercised, and only against the one curated case. Nothing decides that a description states what the named observation means -- the test''s own title claims it and its assertions do not reach it -- and a description naming a decision another case''s criterion or a specification rule governs would pass. The visited set is also narrower than the criterion''s: only the concepts the fixture case''s hypotheses collect are read, so a fixture concept no hypothesis collects goes unchecked.'
- criterion: The description requirement of rules/glossary/a-concept-declares-its-description refuses none of the concepts the seed writes.
  state: partial
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: writes the concepts.description column with the fixture's own non-empty description text, for every concept the curated case collects
  - file: src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
    name: declares a non-empty description for every concept it holds
  why: 'Nothing in the set puts a seeded concept through the guard that enforces the requirement: the seed writes its concept rows by raw INSERT, and no test registers a seeded concept through the glossary service the description guard stands in. What is exercised is the proxy -- that each seeded description is non-empty and equal to the fixture''s -- so the requirement itself is never run against these concepts.'
- criterion: The seed does not re-declare the description guard or the description error that already stand in src/src/glossary/glossary.service.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/seed.spec.ts
    name: does not redeclare the concept description guard or error that already stand in glossary.service.ts
  why: The check is by two identifier names alone -- namesNoDescription and ConceptDescriptionRequiredError -- so a re-declaration of the same guard or the same error under any other name passes it.
- criterion: The name, accepts and ttl each seeded concept already carries are unchanged.
  state: partial
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: holds every concept the curated case collects, each with the subject types it accepts and its ttl, matching the fixture exactly
  why: 'What is bound is agreement between the stored rows and the fixture as it now stands, not that name, accepts and ttl are unchanged from what they were: a change made to those three in the fixture and carried into the seeded rows leaves the assertion passing, so the no-change half of the criterion is unexercised.'
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
reconciliation: siegard-reconcile/backend-code-drift-batch-corrections.md
findings:
- pass: conformance
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: the concurrent-writes test, lines 302-318 ('lets only one of two concurrent writes to the same id succeed, the other refused through InvestigationAlreadyStoredError')
  evidence: "const results = await Promise.allSettled([store.write(investigation), store.write(investigation)]);\n\n    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);\n    const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;\n    expect(rejected?.reason).toBeInstanceOf(InvestigationAlreadyStoredError);"
  cost: Against rules/investigation/written-at-records-when-the-write-settled (contradicts). written-at-records-when-the-write-settled's own text says a later attempt that finds the record already present 'settles by finding the record already present', unchanged by not being the one that persisted — the specification's own account of the losing side of a race is success, not an error. This test instead requires the store to reject the losing write with InvestigationAlreadyStoredError, and the sequential write-once test two blocks above (lines 281-300) enforces the same rejection for a repeat write under an existing id. Anyone implementing to this suite builds a store that raises a caller-visible failure for exactly the case the specification calls a settled write, and the next reader who trusts the passing suite over the node will reproduce that failure rather than the settling the specification actually asks for.
  correction: the losing concurrent write should be asserted to settle (fulfill), not reject — e.g. both promises fulfilled, with the losing one answering from the record the other one persisted — matching written-at-records-when-the-write-settled's 'an attempt that settles by finding the record already present persists nothing and changes nothing'.
- pass: conformance
  file: src/__tests__/unit/case/case-query.service.spec.ts
  where: the expect(result.case).toEqual({...}) block, lines 428-447, and the identical expect(replayed).toEqual({...}) block, lines 648-667
  evidence: "expect(result.case).toEqual({\n  slug: SLUG,\n  title: 'A case',\n  when_to_use: 'when a curator needs a case to test read-case composition over',\n  version,\n  authored_at: '2024-01-01T00:00:00.000Z',\n  subject: SUBJECT,\n  fallback: { outcome: FALLBACK_OUTCOME, referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT } },\n  state: 'released',\n  released_at: expect.any(String),\n  manifest: expectedDefaultManifest(),\n  hypotheses: [ ... ],\n});"
  cost: Against rules/knowledge/a-presented-case-version-states-its-own-declared-attributes (contradicts). Both exact-match assertions fix the whole shape readCase and replayCase answer for a version, and neither carries any consolidation_register-related key — not a value, not an explicit "no register" marker. A reader of rules/knowledge/a-presented-case-version-states-its-own-declared-attributes goes to case-query.service's read-case expecting every reading to say explicitly whether a version declares a consolidation register, and this test locks in a response that says nothing about it at all — indistinguishable from the blank the rule's own text names and refuses ("never leaving a blank in place of the statement").
  correction: The seeded version, the FakeCaseStore's returned shape, and both toEqual expectations would need a consolidation_register-bearing field (or the explicit "declares no consolidation register" statement the rule requires) for both the draft and the released case seeded here, which currently authors no register at all.
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  where: the test at lines 52-63, "validates a confirmed evaluation's citation that carries no field key at all, since the shared citation schema now leaves field optional for every verdict branch, not narrowed to the inconclusive branch alone" (repeated at lines 274-293 and 303-314, each with a confirmed-verdict citation carrying only concept)
  evidence: '{ hypothesis: ''a-hypothesis'', verdict: ''confirmed'', citations: [{ concept: ''a-concept'' }] } ... expect(result.success).toBe(true)'
  cost: Against domain/investigation/citation (contradicts). domain/investigation/citation ties field's presence to the verdict — required for confirmed or refuted, absent only for a no-data citation — but this suite asserts a confirmed citation with no field validates and titles the assertion as the schema's own current rule; the next reader who trusts the suite over the node ships a confirmed verdict with no traceable evidence field and the tests will not catch it.
  correction: the confirmed/refuted fixtures would need to carry a field, and the field-optional claim narrowed back to the no-data citation the node actually describes
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  where: lines 303-314, "validates a response whose evaluation carries neither usage nor elapsed_ms and whose durations carries no writing, matching a run that made no model call and reached no consolidation"
  evidence: '{ hypothesis: ''a-hypothesis'', verdict: ''confirmed'', citations: [{ concept: ''a-concept'' }] } ... expect(result.success).toBe(true)'
  cost: Against domain/investigation/evaluation (contradicts). domain/investigation/evaluation states usage, elapsed_ms and prompt are present exactly when a call happened and absent only when reason is no-data — a state only an inconclusive verdict carries — yet this test names a confirmed verdict as the case of "a run that made no model call"; a reader of the suite comes away believing a confirmed verdict can exist without a judgment call ever having run, which the node rules out.
  correction: the no-call fixture would need an inconclusive verdict with reason no-data, not a confirmed one, to match what the node allows to lack usage/elapsed_ms/prompt
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  where: lines 316-322, "validates a response whose cost.calls is fractional, since domain/investigation/cost stays outside this task's scope"
  evidence: 'cost: { calls: 1.5, input_tokens: 1, output_tokens: 1 } ... expect(result.success).toBe(true)'
  cost: Against domain/investigation/cost (contradicts). domain/investigation/cost types calls as a required integer; this test names that very node and then asserts a fractional calls value is valid, so anything downstream that compares call counts (billing, load analysis) can silently receive a fractional count the domain model was written to exclude, and the suite itself is the place recording that this is acceptable.
  correction: the fixture's cost.calls would need to stay an integer, or the schema and this test both narrowed to reject a fractional value, matching the node's own type
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  where: the test titled "validates a response whose evaluation carries usage and elapsed_ms as integers, matching a completed simulation that made a model call" (lines 159-170) and the test titled "validates a response whose evaluation carries neither usage nor elapsed_ms, matching a run that made no model call" (lines 180-186)
  evidence: it('validates a response whose evaluation carries usage and elapsed_ms as integers, matching a completed simulation that made a model call'
  cost: Against domain/investigation/evaluation (contradicts). domain/investigation/evaluation already states that usage, elapsed_ms and prompt are "present exactly when a call happened, absent when reason no-data means judgment was never called at all"; these two test titles restate that same conditional-presence rule in their own words as the reason the fixtures are shaped this way, rather than only asserting that the schema accepts or omits the fields. If that conditional-presence rule is later refined in the node, these titles keep asserting the old pairing without the specification changing, so a reader trusts the test's own wording for a fact the node, not the test, is supposed to be the one home for.
  correction: title the two tests by what they check structurally — e.g. "validates a response whose evaluation carries both usage and elapsed_ms" / "carries neither usage nor elapsed_ms" — and leave why a call did or did not happen to the node.
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  where: the test titled "validates a response whose durations.collection is zero, matching a stage measured below one millisecond" (lines 172-178)
  evidence: it('validates a response whose durations.collection is zero, matching a stage measured below one millisecond'
  cost: Against rules/investigation/a-measured-duration-below-one-millisecond-is-zero (contradicts). rules/investigation/a-measured-duration-below-one-millisecond-is-zero is the node that states a millisecond duration is 0 exactly "where the span settled in under one millisecond," with the reasoning for why a floor of one millisecond would be wrong. The test title restates that specific business rule, almost verbatim, as its own explanation for why zero is a valid durations.collection, rather than only asserting that the schema accepts zero. That rule lives in a node this file's own set does not name, so a reader of this test who trusts its title has no reason to go open the rule that actually governs it, and if the rule's own reasoning is ever revised the title carries the old rationale forward untouched.
  correction: title the test structurally — e.g. "validates a response whose durations.collection is zero" — and leave the sub-millisecond rationale solely in the rule node.
- pass: conformance
  file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the it() block at lines 854-865, "treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the ok path"
  evidence: 'expect(outcome).toEqual({ result: ''ok'', observation: JSON.stringify({}) });'
  cost: Unstated -- no specification node holds this fact. The choice to answer an ok-status response whose body does not parse as JSON with an empty, usable-looking observation — rather than ending unavailable, or some other classification — is fixed only in this test. A reader checking what the specification says a malformed corporate-system payload does to an otherwise-successful call finds nothing, and anyone changing this behavior later (e.g. to end unavailable, matching how every other malformed-input case in this same file already degrades) has no node to update or be held to.
  correction: State, in a node governing the HTTP connector's own reading of its response (an-http-connector-configuration-declares-its-call or a sibling node), what an ok-classified status whose body does not parse as JSON yields.
- pass: conformance
  file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  where: the aDurations fixture, line 141-143 (its default is reused by validOptions() across nearly every test in the file)
  evidence: 'return { collection: 10, judgment: 20, writing: 5, total: 35, ...overrides };'
  cost: Against domain/investigation/durations (contradicts). the one default durations value every test in the file draws on embodies total as exactly collection + judgment + writing (10+20+5=35); a reader treating this fixture as an example of a valid Durations value — the way test fixtures ordinarily are read — takes away that total is the sum of the stages, the opposite of what the specification states, and may carry that assumption into a load-test comparison or a new fixture that actually depends on the relationship
  correction: give the fixture a total that is not the sum of its own collection, judgment and writing (e.g. one that includes overhead/gaps), so the default no longer models the relationship the node forbids
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: the verdict literals inside evaluationSchema's discriminated union, lines 42, 50, 58
  evidence: 'verdict: z.literal(''confirmed''), / verdict: z.literal(''refuted''), / verdict: z.literal(''inconclusive''),'
  cost: Against domain/investigation/verdict (contradicts). the sibling src/http/dto/simulate-hypothesis.dto.ts imports the same vocabulary — import { VERDICTS } from '../../investigation/verdict.js'; and const [CONFIRMED_VERDICT, REFUTED_VERDICT, INCONCLUSIVE_VERDICT] = VERDICTS; — so this file hardcodes a second copy of the same three strings; if a verdict value is ever added or renamed at its one declared source, this schema has no dependency on that source and can silently drift out of sync while still looking correct.
  correction: import VERDICTS from '../../investigation/verdict.js' and build the three literals from it, matching simulate-hypothesis.dto.ts's own pattern.
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: citations on the confirmed and refuted branches of evaluationSchema, lines 43 and 51
  evidence: 'citations: z.array(citationSchema).min(1).readonly(),'
  cost: Against rules/investigation/a-decided-evaluation-cites-evidence (contradicts). the "at least one citation" threshold is stated once, by rules/investigation/a-decided-evaluation-cites-evidence ("Every confirmed or refuted evaluation carries at least one citation"), which is not among the nodes domain/investigation/evaluation and domain/investigation/citation state as this file's own shape; re-deriving the number here as this schema's own .min(1) gives the rule a second home, and the day the business changes that threshold nobody can tell from this file alone which value is the decided one.
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: usage, elapsed_ms and prompt on the confirmed and refuted branches of evaluationSchema, lines 44-46 and 52-54
  evidence: "usage: usageSchema.optional(),\n    elapsed_ms: z.int().optional(),\n    prompt: z.string().optional(),"
  cost: Against domain/investigation/evaluation (contradicts). domain/investigation/evaluation states these three are "present exactly when a call happened, absent when reason no-data means judgment was never called at all" — a state only the inconclusive branch can reach, since deciding confirmed or refuted always required the judgment call to run; marking them optional here too means a response missing usage/elapsed_ms/prompt on a confirmed or refuted evaluation validates as if the specification allowed that combination, though it never does, and a consumer reading this schema alone would not learn that these are actually mandatory there.
  correction: require usage, elapsed_ms and prompt in the confirmed and refuted branches; keep them optional only in the inconclusive branch where reason is no-data.
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: costSchema, lines 89-93
  evidence: "const costSchema = z.object({\n  calls: z.number(),\n  input_tokens: z.number(),\n  output_tokens: z.number(),\n});"
  cost: Against domain/investigation/cost (contradicts). domain/investigation/cost declares calls, input_tokens and output_tokens as integers; z.number() accepts any finite value including fractions, so a malformed cost (e.g. an averaged or miscomputed count) passes this response validation though the specification's own shape never allows a non-integer here — and usageSchema, four lines above in the same file, validates the identically-named input_tokens/output_tokens as z.int(), so the same fact is checked two different ways in one file.
  correction: use z.int() for calls, input_tokens and output_tokens, matching usageSchema and durationsSchema's own convention in this file.
- pass: conformance
  file: src/http/dto/simulate-hypothesis.dto.ts
  where: the third branch of the evaluationSchema discriminated union (lines 59-67), covering all three inconclusive reasons
  evidence: "z.object({\n  hypothesis: z.string().min(1),\n  verdict: z.literal(INCONCLUSIVE_VERDICT),\n  reason: z.enum(EVALUATION_REASONS),\n  citations: z.array(citationSchema).readonly(),\n  usage: usageSchema.optional(),\n  elapsed_ms: z.int().optional(),\n  prompt: z.string().optional(),\n}),"
  cost: Against rules/investigation/an-inconclusive-evaluation-declares-its-reason (contradicts). citations carries no .min(1) here, so an evaluation with reason no-data and an empty citations array validates successfully through this response schema — the same branch already applies .min(1) to citations for the confirmed and refuted verdicts two blocks above, so the omission reads as a gap rather than a choice; a no-data verdict produced with nothing cited would pass this boundary instead of being caught, and a reader checking this schema for how a no-data reason is bound to its evidence finds no such constraint.
  correction: split the inconclusive branch by reason so citations carries .min(1) where reason is 'no-data' (mirroring the confirmed/refuted branches), while judgment-failure and deadline-exceeded keep citations as currently unconstrained.
- pass: conformance
  file: src/investigation/http-declarative-observation-source.adapter.ts
  where: unavailableFor, lines 52-54, as invoked from the MalformedHttpConnectorConfigurationError catch in resolveHttpConnectorCallConfiguration, lines 155-157
  evidence: 'if (!isHttpMethod(configuration.method)) { problems.push(`method is not one of ${HTTP_METHODS.join('', '')}`); } ... if (!isStatusEndingMap(configuration.statusMap)) { problems.push(`statusMap is not a plain object mapping a status to one of ${EVIDENCE_RESULTS.join('', '')}`); } ... throw new MalformedHttpConnectorConfigurationError(connector, problems); ... if (error instanceof MalformedHttpConnectorConfigurationError) { return { ok: false, outcome: unavailableFor(error) }; } ... function unavailableFor(error: Error): ObservationOutcome { return { result: ''unavailable'', result_detail: error.name }; }'
  cost: Against rules/integration/an-http-connector-configuration-declares-its-call (contradicts). An operator reading result_detail for a malformed method or statusMap sees only the literal string "MalformedHttpConnectorConfigurationError" — the accepted HTTP methods or evidence-result endings httpConfigurationProblems computed are discarded before the outcome is built, so the operator has to go elsewhere (source, logs) to learn what value was expected, defeating the rule's own stated reason for carrying the vocabulary in the detail at all.
  correction: unavailableFor's caller for this error (or a dedicated function) would need to fold error.message (already problems.join('; ')) or error.context.problems into result_detail alongside error.name, so the vocabulary httpConfigurationProblems assembled reaches the returned ObservationOutcome.
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: releaseHypothesisRevisionRow and releaseHypothesisRevisionStatement, lines 615-625
  evidence: "async function releaseHypothesisRevisionRow(tx: IQueryable, key: IRevisionKey): Promise<void> {\n  await runStatement(tx, releaseHypothesisRevisionStatement(key), raiseWriteFailure);\n}\n\nfunction releaseHypothesisRevisionStatement(key: IRevisionKey): IStatement {\n  return {\n    text: `UPDATE hypothesis_revisions SET state = $4\n           WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3`,\n    params: [key.slug, key.hypothesis_name, key.revision, HYPOTHESIS_REVISION_RELEASED_STATE],\n  };\n}"
  cost: 'Against rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle (contradicts). A release call against a revision already in released state, or against a hypothesis-revision identity nothing was ever stored for, matches zero or one row and is answered as a silent success instead of the required HTTP 409 — a caller (or a test) built against the documented refusal gets no signal at all that the release was a no-op or named nothing real. The gap is also inconsistent within this same file: releaseVersion (case-version release) reads the current state and refuses via refuseUnlessDraftAtRelease before writing, and insertManifestEntry, deleteManifestEntry, updateDraftVersion and discardDraft all guard the same way; releaseHypothesisRevisionRow alone performs its UPDATE unconditionally, with no read-then-refuse step and no import of a HypothesisRevisionNotDraftAtReleaseError class at all.'
  correction: releaseHypothesisRevisionRow would need to read the revision's own current state first — resolveHypothesisRevisionOwnState already does this — and refuse with HypothesisRevisionNotDraftAtReleaseError before issuing the UPDATE wherever that state is not draft or no row answers the key, mirroring the requireVersionState + refuseUnlessDraftAtRelease pattern releaseVersion already uses for the case-version's own release.
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: 'line 123, `public constructor(private readonly connection: DatabaseConnection) {}`'
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: 'DatabaseConnection is declared as `export type DatabaseConnection = Pool;` -- the pg driver''s own concrete class -- rather than the project''s own IConnectableQueryable interface database-access.ts already exports for this purpose. Bound to the concrete driver type, this store''s own unit spec cannot supply a plain object typed to an interface and instead fabricates a fake client forced past the type checker with `{ connection: { connect } as unknown as DatabaseConnection }`, defeating the type-safety the constructor''s own signature exists to provide.'
  correction: Declare the constructor parameter as IConnectableQueryable (exported from ./database-access.js) instead of the concrete DatabaseConnection/Pool alias.
  cites: ARC-01
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: refuseUnlessDraft / refuseUnlessDraftAtRelease, called from insertManifestEntry, deleteManifestEntry, releaseVersion, discardDraft and updateDraftVersion
  evidence: "function refuseUnlessDraft(key: ICaseVersionKey, state: CaseVersionState): void {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftError(key.slug, key.version, state);\n  }\n}"
  cost: Whether a case version may still be mutated is a case-lifecycle business rule decided entirely inside the repository. Any other write path against these same tables -- a script, a migration back-fill, a second repository implementation -- has to reimplement this exact check to stay correct, and a future change to when a manifest may be edited means patching the persistence layer rather than the one place a reader would expect the case's lifecycle policy to live.
  correction: Move the draft/released-state decision into the case-lifecycle service that calls this repository; have the repository perform the write (or a conditional UPDATE ... WHERE state = 'draft' whose zero-rows result the service turns into the refusal) without deciding the rule itself.
  cites: ARC-04
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: refuseUnlessDraft and refuseUnlessDraftAtRelease, throwing CaseVersionNotDraftError / CaseVersionNotDraftAtReleaseError directly from the repository
  evidence: throw new CaseVersionNotDraftError(key.slug, key.version, state);
  cost: CaseVersionNotDraftError is a business refusal, not a data error reporting what the driver refused, yet the repository raises it directly rather than a calling service. Any caller of this repository other than the current case-lifecycle service inherits the same lifecycle policing whether or not it wants it, because the policy is baked into the store instead of owned by one service.
  correction: Have the repository surface the row's state (or a boolean/void result) and let the calling service raise CaseVersionNotDraftError / CaseVersionNotDraftAtReleaseError, reserving the repository's own throws for genuine data errors such as CaseStoreError wrapping a driver failure.
  cites: COR-03
- pass: standard
  file: src/http/dto/simulate-case.dto.ts
  where: the discriminated-union verdict literals in evaluationSchema, lines 39-65
  evidence: z.literal('confirmed'), ... z.literal('refuted'), ... z.literal('inconclusive')
  cost: The verdict vocabulary already exists as VERDICTS = ['confirmed', 'refuted', 'inconclusive'] in investigation/verdict.ts, and the sibling simulate-hypothesis.dto.ts in this same file set imports it and derives its own literals from it. simulate-case.dto.ts instead retypes the same three strings by hand, so if a verdict name ever changes or a fourth is added, this schema silently drifts from the enumeration every other consumer derives from.
  correction: Import VERDICTS from ../../investigation/verdict.js in simulate-case.dto.ts and build the discriminated union's literals from it, the same way simulate-hypothesis.dto.ts already does.
  cites: MNT-03
---

## What it is
This review covers the six tasks of the backend-code-drift-batch-corrections initiative, merged into main across five deliveries, over the 23 files (10 source, 13 test) those deliveries wrote.
The conformance pass ran over the trace's own node set per file plus the plan's 15 nodes, staged and folded through siegard-reconcile/backend-code-drift-batch-corrections.md, which also restamped 77 bindings; 19 nodes the judgment did not clear stand as they did.
The coverage pass ran over 42 criteria across the six tasks' proof test files.
The standard pass ran the 33 reading-decided rules of standards/backend-node-service.yaml whose scope reaches this file set.
The failures pass did not run: the captured run (run/backend-code-drift-batch-corrections) passed every step -- install, typecheck, lint, secret-scan, test -- so there was no failure to diagnose.

## Notes
None.
