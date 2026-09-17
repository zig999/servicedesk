---
target: backend
title: capability-payload-notes, first review
summary: Four passes over the five delivered tasks carrying an operator-authored payload_notes field from
  capability registration through evidence collection into the hypothesis judgment prompt.
reviewed:
- migrations/0024-capability-payload-notes.sql
- migrations/0025-investigation-evidence-capability-payload-notes.sql
- src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/__tests__/unit/http/dto/evidence.dto.spec.ts
- src/__tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
- src/__tests__/unit/http/register-capability.routes.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/evidence.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/investigation-pipeline.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/capability-registry/capability-registry.service.ts
- src/capability-registry/capability.ts
- src/http/dto/evidence.dto.ts
- src/http/dto/read-capability-by-identity.dto.ts
- src/http/dto/register-capability.dto.ts
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- src/investigation/evidence-collection-stage.ts
- src/investigation/evidence.ts
- src/investigation/hypothesis-evaluator.port.ts
- src/investigation/judgment-stage.ts
- src/persistence/relational-capability-store.repository.ts
- src/persistence/relational-investigation-store.repository.ts
tasks:
- task/capability-payload-notes/capability-declares-payload-notes
- task/capability-payload-notes/evidence-snapshots-capability-payload-notes
- task/capability-payload-notes/identity-read-states-payload-notes
- task/capability-payload-notes/judgment-call-carries-payload-notes
- task/capability-payload-notes/judgment-prompt-renders-payload-notes
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: A register-capability submission carrying payload_notes is accepted and the capability standing
    at that name and version holds the same payload_notes text.
  state: covered
  tests:
  - file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: declares payload notes exactly where the operator supplies them, and treats an absent declaration
      as a capability that simply has none, never refusing it as an incomplete contract
  - file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: persists a registration's payload_notes exactly as given, holding the same text at the identity
      it was registered under
  - file: __tests__/unit/http/register-capability.routes.spec.ts
    name: passes a stated payload_notes through to registerCapability unchanged
  why: The route test asserts only the argument handed to a mocked registerCapability, so it binds the
    controller's collaborator call rather than the held capability; the registry-service and store round-trip
    tests are what carry the criterion.
- criterion: A register-capability submission carrying no payload_notes is not refused for that absence
    by the contract-completeness check.
  state: covered
  tests:
  - file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: declares payload notes exactly where the operator supplies them, and treats an absent declaration
      as a capability that simply has none, never refusing it as an incomplete contract
  - file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses an empty registration naming every required attribute
  - file: __tests__/unit/http/register-capability.routes.spec.ts
    name: answers 200 with the held capability registerCapability resolved, for a valid registration at
      a (name, version) the path names
- criterion: A registration whose payload_notes is an empty string yields a capability holding no payload
    notes, the same as one stating none at all.
  state: covered
  tests:
  - file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: treats a registration whose payload_notes is an empty string the same as one that states none
      at all — a capability holding no payload notes, not an empty string
  - file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: treats a stored registration whose payload_notes is the empty string as one holding no payload
      notes, never answering payload_notes as ''
  - file: __tests__/unit/http/register-capability.routes.spec.ts
    name: answers 200, without refusing at the request-body boundary, for a registration whose payload_notes
      is an empty string
- criterion: A capability re-registered whole at the same name and version without payload_notes holds
    none afterwards, never the text an earlier registration carried.
  state: covered
  tests:
  - file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: holds no payload_notes after a whole re-registration at the same identity omits it, never the
      text an earlier registration carried
- criterion: The relation holding a registered capability has one column pairing with payload_notes and
    no column pairing with no declared attribute.
  state: covered
  tests:
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: gives capabilities exactly one column per attribute domain/integration/capability declares,
      payload_notes included, and no column pairing with none of them, after every migration script replays
      in numbered order on an empty database
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the thirteen columns the model declares optional
- criterion: A capability row stored before that column existed reads back as a capability holding no
    payload notes, never as a read failure.
  state: covered
  tests:
  - file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: reads back a capability row stored before payload_notes existed as one holding no payload notes,
      never as a read failure
- criterion: An evidence item collected from a capability declaring payload notes carries capability_payload_notes
    holding that same text.
  state: covered
  tests:
  - file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: carries the resolved capability's own declared payload_notes text onto the produced evidence
      item's capability_payload_notes, unchanged
- criterion: An evidence item collected from a capability declaring no payload notes carries capability_payload_notes
    as the empty string.
  state: covered
  tests:
  - file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records capability_payload_notes as the empty string for a capability that declares none, the
      same honest degradation concept_description already carries for a concept with none
  - file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: produces exactly one evidence per concept in the collection plan, deduplicating a concept two
      hypotheses both collect, each carrying its resolved capability and the stage own now as observed_at
- criterion: An evidence item recorded for an observation whose capability never resolved carries capability_payload_notes
    as the empty string rather than ending the collection differently than it already ends.
  state: covered
  tests:
  - file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records capability_payload_notes as the empty string for an observation whose capability never
      resolved, ending exactly as the result itself already records it
  - file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records a concept nothing currently answers as unavailable, carrying result_detail exactly equal
      to "CapabilityNotResolvedForObservationError", and never attempts to call observe-concept for it
      (rules/integration/an-unresolvable-observation-ends-unavailable)
- criterion: Re-registering the producing capability after collection leaves an already-collected evidence
    item's capability_payload_notes unchanged.
  state: covered
  tests:
  - file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: leaves an already-produced evidence item's capability_payload_notes unaffected by a later re-registration
      of the same producing capability, since the value is snapshotted once at collection rather than
      read again
  why: The re-registration happens after collectEvidence has already returned, and the assertion reads
    the value the returned item already holds; it falsifies an item that resolved its notes lazily from
    the registry, but no test re-reads a stored evidence row after a re-registration, so the persisted
    item's immunity is unexercised.
- criterion: The relation holding a collected evidence item has one column pairing with capability_payload_notes
    and no column pairing with no declared attribute.
  state: partial
  tests:
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: adds investigation_evidence exactly one new column, capability_payload_notes, when migration
      0025 runs on top of every migration before it
  why: 'Only the first half is exercised: the 0025 delta test shows exactly one column, capability_payload_notes,
    added and no other. Nothing enumerates investigation_evidence''s whole column list against the attributes
    domain/investigation/evidence declares — the way the capabilities test does for that relation — so
    a column in investigation_evidence pairing with no declared attribute would pass every test in the
    set.'
- criterion: An evidence row stored before that column existed reads capability_payload_notes as the empty
    string, never as a read failure.
  state: covered
  tests:
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: reads an investigation_evidence row inserted before migration 0025 back with capability_payload_notes
      as the empty string once that migration runs, never a read failure
  why: The read is a direct SELECT against the migrated schema rather than a read through RelationalInvestigationStore,
    so the store's own assembly of such a row is not separately exercised; the migration leaves the column
    NOT NULL and backfilled to the empty string, which is the condition the store read would meet.
- criterion: The evidence representation's own validation does not refuse an evidence item carrying capability_payload_notes.
  state: covered
  tests:
  - file: __tests__/unit/http/dto/evidence.dto.spec.ts
    name: validates a well-formed evidence item
  - file: __tests__/unit/http/dto/evidence.dto.spec.ts
    name: validates an evidence item whose capability_payload_notes carries the producing capability's
      own free-text account, not only the empty string
  - file: __tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
    name: validates a production-shaped response with no field stripped from its evidence or its evaluation
  - file: __tests__/unit/http/dto/simulate-case.dto.spec.ts
    name: validates a production-shaped response with no field stripped from its assessment or its evidence
- criterion: The identity read of a capability registered with payload notes answers that same text.
  state: covered
  tests:
  - file: __tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 200 with the capability currently registered under the named (name, version) identity,
      carrying its whole declared contract
  - file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: persists a registration's payload_notes exactly as given, holding the same text at the identity
      it was registered under
- criterion: The identity read of a capability registered without payload notes answers no payload_notes
    value, rather than an empty or substituted one.
  state: covered
  tests:
  - file: __tests__/unit/http/read-capability-by-identity.routes.spec.ts
    name: answers 200 with no payload_notes key in the body when the registered capability carries none,
      never an empty or substituted value
  - file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: holds no payload_notes after a whole re-registration at the same identity omits it, never the
      text an earlier registration carried
- criterion: The answer's own validation does not refuse an answer in which payload_notes stands absent
    and every other declared attribute stands present.
  state: covered
  tests:
  - file: __tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
    name: does not refuse an answer in which payload_notes stands absent and every other declared attribute
      stands present
- criterion: The answer's own validation refuses an answer in which nature, input_schema, output_schema,
    timeout, connector or concept stands absent, so payload_notes is the only attribute admitted absent.
  state: covered
  tests:
  - file: __tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
    name: refuses an answer in which %s stands absent, since payload_notes is the only attribute this
      schema admits absent (it.each over nature, input_schema, output_schema, timeout, connector, concept)
- criterion: The payload_notes the identity read answers is drawn from the registration standing at that
    name and version, never from the content a register-capability submission carried.
  state: covered
  tests:
  - file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: answers the payload_notes the store currently holds at (name, version), never the text an earlier
      register-capability submission carried, once the store has since changed independently of that submission
- criterion: The evidence item the evaluator receives carries capability_payload_notes holding exactly
    the value that item's stored snapshot holds.
  state: covered
  tests:
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: carries the evidence item's own snapshotted, non-empty capability_payload_notes into the EvidenceItem
      the evaluator receives, holding exactly the stored value regardless of a capability re-registered
      under that same name and version after collection
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: calls evaluate() with only the judged hypothesis's own criterion and its own matched evidence,
      never another hypothesis's
  - file: __tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles each evidence item with its concept, inputs, observation, observed_at, ttl, origin,
      result and its capability pin, including result_detail when it carried one
  why: The evidence handed to judgeHypotheses is constructed in the test rather than read back from the
    store, so "that item's stored snapshot" is exercised as two halves in two files — the store read-back
    and the port passthrough — with no test carrying one item through both.
- criterion: An evidence item whose snapshot holds an empty capability_payload_notes reaches the evaluator
    carrying that empty value, never omitting the attribute from the item.
  state: covered
  tests:
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: reaches the evaluator with capability_payload_notes present as an empty string, never omitting
      the attribute, when the evidence item's own snapshot holds none
- criterion: Assembling the judgment call issues no capability-registry read, so the value handed to the
    evaluator comes from the evidence snapshot alone.
  state: partial
  tests:
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: imports no ICapabilityQuery and reads no capability-registry port at all — judgeHypotheses takes
      only evidence already collected, never a registry to resolve live
  - file: __tests__/unit/investigation/citation-validation.spec.ts
    name: declares no outputSchemas field, no capabilityOutputSchemaKey helper and no CapabilityOutputSchemas
      type — the field-existence check has no live-resolved capability output-schema map left to build
      or read
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: refuses a citation naming a field only a capability re-registered after collection would declare
      — a field absent from the evidence item's own snapshot taken at collection, never letting a live-resolved
      schema leak into an already-collected item's judgment
  why: The two tests that assert "no registry read" are regular-expression searches over judgment-stage.ts's
    and citation-validation.ts's own source text for the identifiers ICapabilityQuery, capability-query.port,
    outputSchemasFor and outputSchemas; they bind how the files are spelled, not what runs. No test stands
    up a capability registry that records reads and judges against it, so a read made through a differently
    named port, or from the evaluator adapter the call is handed to, would leave both passing. The third
    test shows snapshot-only behavior for an item's fields, not for its payload notes.
- criterion: A capability re-registered between collection and judgment does not change the capability_payload_notes
    the evaluator receives for an already-collected item.
  state: partial
  tests:
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: carries the evidence item's own snapshotted, non-empty capability_payload_notes into the EvidenceItem
      the evaluator receives, holding exactly the stored value regardless of a capability re-registered
      under that same name and version after collection
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: imports no ICapabilityQuery and reads no capability-registry port at all — judgeHypotheses takes
      only evidence already collected, never a registry to resolve live
  why: 'The passthrough of the snapshot''s value to the evaluator is exercised, but the re-registration
    the criterion names never happens: the named test''s body holds no capability registry at all and
    registers nothing between collection and judgment — the re-registration is stated in the test''s name
    only. What remains unexercised is judgment run after the capability at that name and version has been
    registered again with different payload notes.'
- criterion: The prompt block for an evidence item whose capability_payload_notes holds content states
    that text inside that item's own block.
  state: covered
  tests:
  - file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders an evidence item's own capability_payload_notes inside its own <capability_payload_notes>
      tag, holding exactly that item's snapshotted text
  - file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders each evidence item's own capability_payload_notes into that item's own block alone,
      never another item's in the same prompt
- criterion: The prompt block for an evidence item whose capability_payload_notes is empty states no payload-notes
    tag at all, the same omission the concept description already takes when empty.
  state: covered
  tests:
  - file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: omits the <capability_payload_notes> tag entirely for an item whose capability_payload_notes
      is the empty string, the same omission concept_description already takes when empty, while still
      carrying that item's own fields and observation
  - file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: omits the <concept_description> tag entirely for an item whose concept_description is the empty
      string, naming that item by its concept alone with no stated meaning, while still carrying its own
      fields and observation
- criterion: The payload notes stated in an item's block are that item's own, never another item's in
    the same prompt.
  state: covered
  tests:
  - file: __tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders each evidence item's own capability_payload_notes into that item's own block alone,
      never another item's in the same prompt
- criterion: An evaluation citing a field named only in a capability's payload notes and in no output
    schema is still refused, so the notes reaching the prompt widen no citation vocabulary.
  state: covered
  tests:
  - file: __tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a field that appears only inside the cited evidence item's own capability_payload_notes
      text and in no declared field, so the payload notes reaching the prompt widen no citation vocabulary
  - file: __tests__/unit/investigation/judgment-stage.spec.ts
    name: retries an inconclusive first answer whose citation fails the collects-containment check, and
      falls back to judgment-failure when the retry citation fails it too
  why: The refusal is exercised at isCitationValid, where the cited field appears only in the item's payload-notes
    text; the stage-level consequence of that refusal (retry, then judgment-failure) is exercised only
    for citations invalid for other reasons, never for one drawn from payload notes.
- criterion: Applying the numbered migration scripts in order to an empty database produces that column
    with no step performed by hand.
  state: covered
  tests:
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: gives capabilities exactly one column per attribute domain/integration/capability declares,
      payload_notes included, and no column pairing with none of them, after every migration script replays
      in numbered order on an empty database
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: adds investigation_evidence exactly one new column, capability_payload_notes, when migration
      0025 runs on top of every migration before it
  - file: __tests__/integration/persistence/schema-migrations.spec.ts
    name: reads an investigation_evidence row inserted before migration 0025 back with capability_payload_notes
      as the empty string once that migration runs, never a read failure
  why: The replay is the suite's own beforeAll, which creates a fresh schema and applies every .sql file
    in filename order; the column assertion runs against that schema, so no hand step stands between the
    scripts and the column. No test isolates the single capabilities migration the way the 0025 evidence
    migration is isolated, so which script adds it is unexercised — the criterion does not state it. Both
    tests create an empty schema and apply the .sql files in filename order up to and including 0025,
    with no statement typed by hand. Neither continues past 0025, so a later script dropping or renaming
    the column would not be caught; the criterion as stated is met.
findings:
- pass: conformance
  file: migrations/0024-capability-payload-notes.sql
  where: opening comment block, lines 1-5
  evidence: an operator's own free-text account of what the observation actually returns beneath its declared
    output schema, never enforced and never read by anything that resolves a call or admits a citation.
  cost: This restates domain/integration/capability's own account of what payload_notes is and guarantees
    ("never enforced and never read by anything that resolves a call or admits a citation") as the migration's
    own prose rather than pointing to the node. If that node's description of payload_notes is ever revised,
    this comment keeps stating the old account verbatim, and a reader of the migration would take it as
    current without opening the node it silently duplicates.
  correction: Drop the restated description and keep only the identity citation of domain/integration/capability
    already present in the "Implements, from the specification" block, so the meaning of payload_notes
    has one home.
- pass: conformance
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: the final assertion of the first test ("reads back a whole investigation exactly as written...")
  evidence: expect(answered?.hash).toBe(createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex'));
  cost: This locks the store's read() into answering a hash field alongside document, computed by one
    specific algorithm (SHA-256 over JSON.stringify(document), UTF-8, hex digest). No node anywhere in
    the specification says a stored investigation carries or answers a content hash, let alone how one
    is computed -- a caller relying on this shape, or a future implementer changing the serialization
    or algorithm, will not find this contract in the specification.
  correction: Either state, in domain/investigation/investigation or a governing rule, that a read answer
    carries a content hash and how it is derived, or drop the algorithm-specific assertion if the hash
    is meant to remain an unspecified implementation detail no caller is entitled to depend on.
- pass: conformance
  file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  where: the namedAttributes helper and the assertion in it('refuses an empty registration naming every
    required attribute', ...)
  evidence: "function namedAttributes(refusal: unknown): string[] {\n  if (!(refusal instanceof IncompleteCapabilityContractError))\
    \ {\n    throw new Error('expected the incomplete-contract refusal, got something else');\n  }\n \
    \ return refusal.context.problems.map((problem) => problem.split(' ')[0]);\n}\n...\nexpect(namedAttributes(refusal).sort()).toEqual([\n\
    \  'concept',\n  'connector',\n  'input_schema',\n  'name',\n  'nature',\n  'output_schema',\n  'version',\n\
    ]);"
  cost: rules/integration/a-capability-declares-its-contract says only that an incomplete registration
    is refused with an HTTP 422 IncompleteCapabilityContractError; it never says the refusal names which
    required attribute(s) are missing, unlike the sibling rules for MalformedCapabilityInputSchemaError
    and ConnectorPlaceholderOutsideInputSchemaError, whose own statements explicitly say "naming every
    departure" / "naming every orphaned placeholder". This suite locks in a per-attribute problems entry
    across nine separate tests.
  correction: State, in rules/integration/a-capability-declares-its-contract, that the refusal names every
    attribute left undeclared, the way the analogous schema and placeholder rules already do for their
    own conditions.
- pass: conformance
  file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  where: it('refuses a registration missing a required attribute as IncompleteCapabilityContractError,
    even though the named connector already holds a configuration that would also embed an orphaned placeholder',
    ...)
  evidence: "const refusal = await registry\n  .registerCapability(completeRegistration({ connector: 'erp-http',\
    \ name: undefined }))\n  .catch((error: unknown) => error);\n\nexpect(refusal).toBeInstanceOf(IncompleteCapabilityContractError);\n\
    expect(refusal).not.toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);"
  cost: No node decides which refusal an operator sees when a registration is both incomplete and would
    orphan a connector placeholder; this test fixes IncompleteCapabilityContractError as taking priority
    over ConnectorPlaceholderOutsideInputSchemaError, a business-visible choice that currently lives only
    in this test and the code it pins.
- pass: conformance
  file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  where: it('refuses a registration whose connector holds an orphaning configuration as ConnectorPlaceholderOutsideInputSchemaError
    even though its concept is already answered by another capability, since this check runs before the
    concept-uniqueness refusal', ...)
  evidence: 'expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);

    expect(refusal).not.toBeInstanceOf(ConceptAlreadyAnsweredError);'
  cost: No node decides whether the connector-placeholder-orphan check or the one-capability-answers-one-concept
    check runs first when a registration trips both; the rationale for fixing the placeholder check as
    running first lives only in this test's title.
- pass: conformance
  file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  where: the it("validates a response whose cost.calls is fractional, since domain/investigation/cost
    stays outside this task's scope", ...) block, lines 329-335
  evidence: "it(\"validates a response whose cost.calls is fractional, since domain/investigation/cost\
    \ stays outside this task's scope\", () => {\n  const response = { ...aValidResponse(), cost: { calls:\
    \ 1.5, input_tokens: 1, output_tokens: 1 } };\n\n  const result = simulateCaseResponseSchema.safeParse(response);\n\
    \n  expect(result.success).toBe(true);\n});"
  cost: A reader of domain/investigation/cost sees calls declared as an integer -- a whole count of judgment
    calls made. This test locks the response schema's acceptance of a fractional value (1.5) into the
    suite as correct behavior, so the next person touching this schema sees a passing green test confirming
    that a non-integer call count is valid, and has no reason to treat calls as anything but permissive
    -- the domain model's own typing is the one place that still says otherwise.
  correction: Either the response schema (and this test) enforces calls as an integer, matching domain/investigation/cost's
    declared type, or the node's declaration of calls as type integer is revisited -- the test should
    not assert success true for a fractional calls value while the node stands as written.
- pass: conformance
  file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  where: it('resolves the identity exactly as the path spelled it, case and hyphenation preserved, never
    normalized', ...)
  evidence: "it('resolves the identity exactly as the path spelled it, case and hyphenation preserved,\
    \ never normalized', async () => {\n  const built = buildTestApp();\n  app = built.app;\n  built.readCapabilityByIdentity.mockResolvedValueOnce(\n\
    \    heldCapability({ name: 'Mixed-Case-Capability', version: '1.0.0-RC.1' }),\n  );\n\n  await app.inject({\
    \ method: 'GET', url: '/v1/capabilities/Mixed-Case-Capability/1.0.0-RC.1' });\n\n  expect(built.readCapabilityByIdentity).toHaveBeenCalledWith('Mixed-Case-Capability',\
    \ '1.0.0-RC.1');\n});"
  cost: domain/integration/capability and contracts/integration/capability-registry say a capability is
    "identified by name and version" but never say whether that identity matches case-sensitively and
    without any hyphenation/format normalization. This test is the only place that decision lives; a reader
    checking whether two differently-cased requests for the same name resolve to one capability or two
    will not find the answer in the specification, and a later change to fold case before lookup would
    break only this test rather than anything the business is on record as having decided.
  correction: State, in domain/integration/capability or a rule constraining it, whether the (name, version)
    identity matches case-sensitively and unnormalized, so the test asserts a decision the specification
    already carries rather than being the decision's only home.
- pass: conformance
  file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  where: the test "returns exactly the model's own text content, trimmed of surrounding whitespace"
  evidence: 'create.mockResolvedValueOnce(textResponse(''  The consolidated assessment.\n''));

    ...

    expect(outcome.text).toBe(''The consolidated assessment.'');'
  cost: 'The rule this test locks in -- that an assessment''s text is trimmed of its surrounding whitespace
    before the consolidator hands it back -- is stated nowhere but here: domain/investigation/assessment-consolidator''s
    responsibility says only that the call "return[s] the assessment''s text", and domain/investigation/assessment
    declares text as a plain required string with no normalization rule attached.'
  correction: State, on domain/investigation/assessment-consolidator's responsibility or on domain/investigation/assessment's
    text attribute, that the text a consolidation call answers is trimmed of surrounding whitespace before
    it is carried as the assessment's own text.
- pass: conformance
  file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  where: the test 'defaults the token ceiling to 1024 when the caller configures none'
  evidence: 'expect(createMock.mock.calls[0]?.[0]).toMatchObject({ max_tokens: 1024 });'
  cost: '1024 is a threshold that bounds how much of a judgment call''s answer the provider is allowed
    to return -- exactly the kind of call-shaping figure the specification documents elsewhere for a capability''s
    own timeout (its default of sixty seconds is stated in rules/integration/a-capability-declares-its-contract).
    Here the number lives only in this test (and the adapter it pins): a reader auditing or retuning the
    judgment call''s token budget will look for it in the specification and find nothing, and the day
    someone changes it in code without changing a node, nobody can say whether that was a decision or
    a slip.'
  correction: A node governing the hypothesis-evaluator's provider call would need to declare the default
    token ceiling the adapter falls back to when the caller configures none, the way the capability contract
    rule declares the timeout default.
- pass: conformance
  file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  where: the it.each test description at lines 448–454, for the parametrized cause 'MalformedHttpConnectorConfigurationError'
  evidence: '''carries %s as the evidence result_detail for a held capability whose observation ends unavailable
    for that cause (rules/integration/an-unresolvable-observation-ends-unavailable, rules/integration/an-http-connector-configuration-declares-its-call)'','
  cost: A reader who wants to know why 'MalformedHttpConnectorConfigurationError' is a valid result_detail
    follows this citation to `an-http-connector-configuration-declares-its-call`, whose own statement
    covers only the address, query, headers and body a connector call may declare and never mentions a
    method, a statusMap or this error at all. The node that actually states the required keys and this
    exact error — `an-http-connector-configuration-declares-its-method-and-status-vocabulary`, whose statement
    reads "...an observation reaching a configuration that lacks any of the three issues no call and ends
    unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError..." — is never
    named, so the citation sends the next reader to the wrong page of the specification for three of the
    four causes' shared rule and a fourth cause the cited node does not govern.
  correction: Cite `rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary`
    alongside `rules/integration/an-unresolvable-observation-ends-unavailable` for this test, in place
    of `rules/integration/an-http-connector-configuration-declares-its-call`.
- pass: conformance
  file: src/__tests__/unit/investigation/evidence.spec.ts
  where: the expectTypeOf<Evidence>().toEqualTypeOf<{...}> object literal, the capability reference fields
  evidence: 'readonly capability_name: string;

    readonly capability_version: string;'
  cost: 'domain/investigation/evidence.md states the capability link only as relationships: target: domain/integration/capability,
    type: reference, cardinality: "1" -- it never says the reference is materialized as two flat string
    fields, or names them capability_name and capability_version. A reader who wants to know how this
    required reference is represented has to read this test (or the implementation it type-checks) to
    learn it.'
  correction: Record how the capability relationship materializes on evidence -- e.g. as required capability_name
    and capability_version string attributes -- in domain/investigation/evidence.md, with a decision-log
    entry, the way attributes.inputs.type, attributes.observation.type and attributes.origin.type were
    each decided for this same element.
- pass: conformance
  file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  where: lines 284-289, the test 'builds an Investigation carrying no written_at, rather than refusing...'
  evidence: "it('builds an Investigation carrying no written_at, rather than refusing, when written_at\
    \ is missing entirely from the given options — the store decides that value later, at settle', async\
    \ () => {\n  const options = validOptionsWithout('written_at');\n\n  const investigation = await buildInvestigation(options);\n\
    \n  expect(investigation.written_at).toBeUndefined();\n});"
  cost: 'domain/investigation/investigation.md declares written_at `required: true`, and rules/investigation/written-at-records-when-the-write-settled.md
    states "the domain model declares no second element for an investigation assembled but not yet settled"
    and "an investigation assembled but not yet settled is therefore no element of the domain model" —
    what persistence receives is "the investigation''s own content less written_at", never an Investigation
    with written_at left empty. This test instead asserts that the value `buildInvestigation` itself returns
    — the thing the type test two nodes over locks to the literal `Investigation` type — can carry `written_at`
    as `undefined`. A reader trusting the node''s attribute list would build downstream logic assuming
    an `Investigation` always carries a settled written_at; this test instead proves the pre-settle, no-second-element
    case is represented as an `Investigation` value with that attribute missing, which is exactly the
    representation the rule refuses to let the domain model call by that name.'
  correction: buildInvestigation would need to return a type distinct from Investigation for the pre-settle
    content (e.g. Investigation's own attributes less written_at), leaving written_at to be filled only
    by the settling write, rather than returning an Investigation whose written_at is undefined.
- pass: conformance
  file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  where: lines 396-398, the test 'resolves to an Investigation itself, never to a second hand-declared
    type...'
  evidence: "it('resolves to an Investigation itself, never to a second hand-declared type standing in\
    \ for every attribute but written_at', () => {\n  expectTypeOf(buildInvestigation).returns.toEqualTypeOf<Promise<Investigation>>();\n\
    });"
  cost: 'rules/investigation/written-at-records-when-the-write-settled.md states that what persistence
    is handed "is the investigation''s own content less written_at" and that "the domain model declares
    no second element for an investigation assembled but not yet settled" — a structural distinction between
    the settled Investigation and its pre-settle content. This test asserts, by name, the opposite design
    choice: that buildInvestigation''s return type is exactly `Investigation` and "never a second hand-declared
    type standing in for every attribute but written_at". Locking this in as a type-level contract makes
    the rule''s own prescribed shape ("content less written_at") impossible to introduce later without
    failing this test, and leaves a reader of the domain node believing every Investigation the code holds
    is a settled one with written_at present, when the tested return type says otherwise.'
  correction: Replace the equality check with one that matches the shape the rule calls for (the investigation's
    content less written_at) rather than asserting identity with the domain element's own settled type.
- pass: conformance
  file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  where: the test "refuses a second write of an id already stored through InvestigationAlreadyStoredError,
    mapped from the root insert's own unique-violation, without any SELECT ever run before it" (lines
    276-292)
  evidence: 'const rejection = store.write(anInvestigation({ id: ''an-already-stored-id'' }));


    await expect(rejection).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);

    await expect(rejection).rejects.toMatchObject({ context: { id: ''an-already-stored-id'' } });

    expect(recorded.some((entry) => entry.text.includes(''SELECT''))).toBe(false);'
  cost: 'This is the store''s own pinned contract for the one case rules/investigation/an-investigation-is-written-once
    names directly: a write against an id already holding a record. The node states that outcome "counts
    as a write that settled," but this file pins `write()` to reject with a distinct typed error instead
    — so anyone building against this repository''s own tested contract sees a duplicate write as a failure
    requiring special handling to reach the settled outcome the specification already decided, rather
    than finding that outcome built into the store itself. The decision log entry for this same rule (rules/investigation/an-investigation-is-written-once.md)
    reasons explicitly that reading this case as unsettled "would answer an HTTP 500 ... to a requester
    whose investigation is durably written," which is exactly the shape a rejected promise pushes a caller
    toward unless every caller remembers to special-case this one error.'
  correction: Either `write()` resolves (rather than rejects) when the root insert's own unique-violation
    names an id already stored — matching "persists no second record and counts as a write that settled"
    — or, if `InvestigationAlreadyStoredError` is meant purely as an internal signal for a caller to answer
    from the existing record, this file's own test description should state that handoff rather than calling
    the outcome a refusal.
- pass: conformance
  file: src/http/dto/register-capability.dto.ts
  where: registerCapabilityParamsSchema (name, version) and registerCapabilityBodySchema (nature, input_schema,
    output_schema, connector, concept) — all declared as required, non-optional zod fields, four of them
    additionally with `.min(1)`
  evidence: "export const registerCapabilityParamsSchema = z.object({\n  name: z.string().min(1),\n  version:\
    \ z.string().min(1),\n});\n...\nexport const registerCapabilityBodySchema = z.object({\n  nature:\
    \ z.enum(CAPABILITY_NATURES),\n  input_schema: z.string().min(1),\n  output_schema: z.string().min(1),\n\
    \  timeout: z.number().int().positive().optional(),\n  connector: z.string().min(1),\n  concept: z.string().min(1),\n\
    \  payload_notes: z.string().optional(),\n});"
  cost: 'An empty or missing name, version, nature, input_schema, output_schema, connector or concept
    fails Zod parsing at the boundary and is answered as a generic HTTP 400 VALIDATION_ERROR (the route''s
    declared-shape refusal) before the request ever reaches the capability registry''s own completeness
    check. The specification names a distinct refusal for exactly this condition — a registration leaving
    a required attribute absent or empty is undeclared and is refused with HTTP 422 IncompleteCapabilityContractError
    — and that refusal can never be produced through this route: a reader tracing IncompleteCapabilityContractError
    to find where it fires will not find it reachable from register-capability, because the DTO already
    intercepts every one of those cases as a shape violation first.'
  correction: Let empty or absent values for these required attributes reach the capability registry's
    own completeness check (e.g. do not enforce `.min(1)` or non-optional presence for them at the DTO
    layer), so an incomplete registration is refused there with HTTP 422 IncompleteCapabilityContractError
    rather than with a generic VALIDATION_ERROR at the shape-validation boundary.
- pass: conformance
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: outcomeFromModelText, lines 104-107
  evidence: "if (parsed === undefined || parsed.verdict === 'inconclusive') {\n    return judgmentFailureOutcome(callRecord);\n\
    \  }"
  cost: 'When the model returns the well-formed `{"verdict":"inconclusive"}` response the system prompt
    itself instructs it to give "whenever the evidence does not ground either" verdict — the honest, no-inference
    answer judgment-does-not-infer calls for, with nothing having actually failed — this branch records
    it under reason "judgment-failure", the identical label used when the response could not be parsed
    at all. A reader relying on the reason to separate a broken call from an evidence-grounded "cannot
    decide" will find the two merged under one label, which is the same confusion an-inconclusive-evaluation-declares-its-reason''s
    own rationale warns against ("an infrastructure failure is read as a domain fact — the pathology the
    rest of the system exists to avoid"), here running the other way: a domain conclusion (the evidence
    does not decide it) is read as an infrastructure failure.'
  correction: A distinct reason for "the call completed and the model itself could not ground a verdict"
    — or an explicit decision, recorded in domain/investigation/evaluation-reason or this rule, that such
    a response is folded into judgment-failure on purpose — would have to be stated before this branch's
    choice stops being the adapter's own.
- pass: conformance
  file: src/investigation/evidence-collection-stage.ts
  where: the TIMED_OUT branch of settledEvidence(), line 207
  evidence: 'return evidenceOf(base, { result: ''timeout'', resultDetail: `no observation within ${effectiveBoundMs}ms`,
    elapsedMs });'
  cost: This composes the exact text a timeout's result_detail discloses, including the millisecond bound
    the collection stage computed internally. domain/investigation/evidence-result and rules/investigation/no-stage-aborts-on-its-deadline
    say collection "records a timeout result," and scenarios/investigation/a-collection-timeout-degrades-to-no-data
    says only that "the evidence for equipment-state records result timeout" — neither states what the
    recorded detail says. rules/investigation/no-stage-aborts-on-its-deadline treats this kind of disclosed
    wording as a decision worth stating explicitly for its own persistence-timeout case ("a fact of what
    this system discloses, not an implementation detail nobody outside the code could otherwise learn"),
    yet no node states the collection-timeout wording; a reader checking what a timed-out evidence item
    tells its consumer has nowhere in the specification to look, and the message can drift with no node
    to hold it to.
  correction: State the collection-timeout ending's disclosed result_detail content (and whether it may
    include the effective bound in milliseconds) in a node, e.g. beside rules/investigation/no-stage-aborts-on-its-deadline,
    the way that node already states the persistence-exception's own message and details.
- pass: conformance
  file: src/investigation/evidence.ts
  where: line 4, the module-level constant beside the `Evidence` type
  evidence: export const DEFAULT_EVIDENCE_TTL_SECONDS = 60;
  cost: 'The sixty-second default is a decided fact of rules/knowledge/a-collected-concept-declares-a-ttl
    (per the decision log: "Sixty seconds... one minute keeps any cached observation fresher than the
    investigation deadline by a factor of three"), and it belongs to a concept''s own declared ttl, not
    to evidence''s ttl attribute (domain/investigation/evidence.ttl is required and always populated from
    whatever ttl the concept already resolved at collection). Restating the number here under an evidence-scoped
    name gives the decided default a second, disconnected home: if the specification''s default ever changes,
    nothing ties this constant to that decision, and a reader of this file has no way to tell the number
    is not this file''s own to decide.'
  correction: Remove the locally declared default and, wherever a default ttl is actually needed, read
    it from wherever the concept's own resolved ttl (already defaulted at registration per rules/knowledge/a-collected-concept-declares-a-ttl)
    is obtained, rather than re-stating the number.
- pass: standard
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: isForeignKeyViolation and deleteTolerantly, top of file
  evidence: "function isForeignKeyViolation(error: unknown): boolean {\n  return error instanceof Error\
    \ && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;\n} ... async function deleteTolerantly(text:\
    \ string, params: readonly unknown[]): Promise<void> {\n  try {\n    await pool.query(text, params);\n\
    \  } catch (error) {\n    if (!isForeignKeyViolation(error)) throw error;\n  }\n}"
  cost: The identical pair of helpers is retyped verbatim in src/src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts.
    A fix to how a foreign-key violation is recognized (for example widening it to a second driver error
    shape) has to be made in both files, and nothing signals the second copy when only one is edited —
    the cleanup helper in the untouched file silently goes on tolerating only the old shape.
  cites: MNT-03
  correction: Move isForeignKeyViolation and deleteTolerantly into a shared test-support module both integration
    specs import.
- pass: standard
  file: src/capability-registry/capability-registry.service.ts
  where: listCapabilities(), lines 78-89
  evidence: "public async listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>>\
    \ {\n    const held = await this.store.readCapabilities();\n    const total = held.length;\n    const\
    \ data = held.slice(pagination.offset, pagination.offset + pagination.limit);"
  cost: readCapabilities() (relational-capability-store.repository.ts) issues a plain `SELECT ... FROM
    capabilities` with no LIMIT/OFFSET, so every call to listCapabilities() — however small a page is
    asked for — pulls every registered capability's full contract (both schemas, connector, concept) out
    of the store and discards all but the requested slice in memory. The cost of a page-1 request for
    10,000 registered capabilities is the cost of reading all 10,000.
  cites: PER-02
  correction: Push offset and limit down into a dedicated paginated query in RelationalCapabilityStore
    rather than slicing the full in-memory list in the service.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: holdsNoTicketReference(), lines 173-175
  evidence: "function holdsNoTicketReference(value: string | undefined): boolean {\n  return value ===\
    \ undefined || value === '';\n}"
  cost: capability-registry.service.ts already carries the identical predicate under the name isUndeclared()
    (`return value === undefined || value === '';`). The migration comments name this exact concept —
    "an-empty-ticket-reference-is-no-ticket-reference" — as a rule the store applies; with two independent
    copies, a change to what counts as "no value" (for instance treating a whitespace-only string as absent
    too) has to be made twice, and the second file gives no sign the first was ever touched.
  cites: MNT-03
  correction: Extract one "isDeclared"/"isUndeclared" helper both files import, rather than repeating
    the undefined-or-empty-string check under two different names.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: callRecordOf(), lines 407-419
  evidence: "function callRecordOf(row: IEvaluationRow): { readonly usage?: Usage; readonly elapsed_ms?:\
    \ number; readonly prompt?: string } {\n  const record: { usage?: Usage; elapsed_ms?: number; prompt?:\
    \ string } = {};\n  if (row.input_tokens !== null && row.output_tokens !== null) {\n    record.usage\
    \ = { input_tokens: row.input_tokens, output_tokens: row.output_tokens };\n  }\n  if (row.elapsed_ms\
    \ !== null) {\n    record.elapsed_ms = row.elapsed_ms;\n  }\n  if (row.prompt !== null) {\n    record.prompt\
    \ = row.prompt;\n  }\n  return record;\n}"
  cost: 'judgment-stage.ts already declares a function of the same name, the same return shape (`{ readonly
    usage?: Usage; readonly elapsed_ms?: number; readonly prompt?: string }`) and the same skip-when-absent
    assembly, reading from EvaluationOutcome instead of a row. If a fourth optional call-record field
    is ever added, whoever adds it has two unrelated functions to remember and update, and the review
    that catches only one of them leaves the written and the judged shape of a call record silently diverging.'
  cites: MNT-03
  correction: Factor the optional usage/elapsed_ms/prompt assembly into one shared helper parameterized
    over however the caller reads the three values (undefined vs. null), and have both call sites use
    it.
- pass: failures
  file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  where: answers an elapsed_ms reflecting the real wall-clock time the provider call itself took, rather
    than a fixed value
  evidence: "AssertionError: expected 19 to be greater than or equal to 20\n at src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts:194:30"
  cost: A one-millisecond timer-resolution slip between the mocked provider's setTimeout(20) and the adapter's
    own elapsed-ms measurement fails the assertion nondeterministically; carries no signal about capability-payload-notes.
  cause: setup
  correction: Assert on elapsed_ms with tolerance real timers require, or a fake-timer/performance-hook
    stub that removes host-clock jitter; a test-environment fix, not a change to AnthropicAssessmentConsolidator's
    own computation.
failures_counted: 1
reconciliation: siegard-reconcile/capability-payload-notes.md
run: run/capability-payload-notes
---

## What it is

Four passes over the five delivered `capability-payload-notes` tasks, together carrying an
operator-authored, optional, free-text `payload_notes` attribute from capability registration
through the identity read, through evidence collection's snapshot onto
`capability_payload_notes`, through the judgment stage's pass-through, into the Anthropic
adapter's rendered judgment prompt. Every finding above is evidence, not a verdict: which pass
produced it, where it sits, what was observed, and its cost. The conformance pass's own
reconciliation record, folded into `siegard-reconcile/capability-payload-notes.md` and bound
into `siegard-trace.json`, is the authoritative account of which of the 54 candidate
node/file pairs cleared and which of the 11 remaining nodes still carry an open finding.

## Notes

Two criteria across two different tasks (capability-declares-payload-notes and
evidence-snapshots-capability-payload-notes) share identical wording ("Applying the numbered
migration scripts in order to an empty database produces that column with no step performed
by hand.") for their respective columns; they are merged into one coverage entry above rather
than reported twice under the same text.
