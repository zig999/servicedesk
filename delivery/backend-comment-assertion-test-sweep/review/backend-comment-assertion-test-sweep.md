---
title: Backend comment-assertion test sweep, first review
summary: What four passes found over the removal of 37 comment-assertion tests and three whole test files
  from the backend suite.
reviewed:
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/__tests__/unit/capability-registry/capability.spec.ts
- src/__tests__/unit/case/validate-case-coherence.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/glossary/glossary-store.port.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
- src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
- src/__tests__/unit/http/test-connector.controller.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
tasks:
- task/backend-comment-assertion-test-sweep/remove-comment-assertion-tests
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/backend-comment-assertion-test-sweep) passed every step; there was no
    failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts no longer contains
    the three tests whose assertions read capability-registry.service.ts's own comment prose (readCapabilityByIdentity's
    contract-membership comment, pageCountOf's constraints/listings-are-paged citation, refuseContractDepartures'
    doc comment); every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: 'readCapabilityByIdentity itself still answers a currently held identity as { held: true, capability
      }, unaffected by the wrapper'
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: computes the page count as the ceiling of total over limit when they do not divide evenly
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses an empty registration naming every required attribute
  why: Both halves of the criterion are claims about this spec file's own text, and no test asserts on
    the text of the file it lives in. The three tests named bear only in the weak sense that they exercise
    the same subjects the removed tests nominally touched, so a removal that took collateral there would
    surface as their failure. That no test in the file reads production comment prose is established by
    reading the file, not by a test.
- criterion: src/__tests__/unit/capability-registry/capability.spec.ts, whose sole test asserts domain/integration/capability's
    own doc-comment attribution, is deleted entirely.
  state: uncovered
  why: A file's non-existence is not behavior any test can exercise, and the deleted file contributes
    no test of its own. What establishes the criterion is the diff and the file's absence from the tree,
    both read rather than run.
- criterion: src/__tests__/unit/case/validate-case-coherence.spec.ts no longer contains its three doc-comment-citation
    tests (namedVocabularyTerms' two citations, conceptViolations' one); every other test in the file
    is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case naming a subject type the glossary does not hold, naming the term
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: refuses a case collecting a concept the glossary does not hold, naming the concept
  - file: src/__tests__/unit/case/validate-case-coherence.spec.ts
    name: answers violations in the case's declared order — vocabulary terms, then concepts, then capabilities,
      each in the order named
  why: Nothing exercises the absence of the three named tests, and nothing exercises "unchanged" -- a
    survivor rewritten to assert less still passes. The tests listed exercise the vocabulary-term and
    concept violation paths the removed citations nominally cited, so their failure would signal that
    the removal reached beyond the three tests; that is the whole of what their passing establishes.
- criterion: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts no
    longer contains its three comment-assertion tests (ConnectorConfigurationResolution's scoping comment,
    pageCountOf's citation, wellFormedConfiguration's classification comment); every other test in the
    file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: resolves the absence of a connector nothing has registered, as data rather than a raised error
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is not syntactically valid JSON, naming the
      reason
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: parsedConnectorConfiguration throws ConnectorConfigurationNotWellFormedError, naming the same
      reason the write side raises, for a held configuration whose text does not parse to a plain object
  why: 'The removal of the three named tests, and the untouchedness of the rest, are facts about this
    file''s text that no test asserts on. Of the three subjects the removed tests cited, two have surviving
    behavioral tests and the third (pageCount) has none: the file as it now stands holds no assertion
    on pageCount at all, so a regression there would be caught by nothing in this file.'
- criterion: src/__tests__/unit/errors/status-map.spec.ts no longer contains the six tests asserting the
    header comment's prose (the two-node and eleven-node citations, the top paragraph, the 404/409/422
    group enumeration, the "reached this table" narrative, and the InvestigationWriteDeadlineExceededError
    attribution); every one of the file's remaining behavioral status-mapping tests is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves InvestigationWriteDeadlineExceededError to 500
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: returns undefined for a typed domain error the table does not name
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: maps CaseAlreadyHasDraftError and ManifestPositionOccupiedError to the same non-500 status,
      pinning "distinct" as specific rather than mutually exclusive across all seven
  why: No test can assert that six tests are gone, nor that the remaining behavioral status-mapping tests
    were not weakened -- a status assertion changed from 422 to whatever the code now answers still passes.
    The listed tests exercise the mappings the removed citations were about, so their failure would signal
    collateral damage; their passing says nothing about which tests the file holds.
- criterion: src/__tests__/unit/glossary/glossary-store.port.spec.ts no longer contains its two doc-comment-citation
    tests; every other test in the file is unchanged.
  state: uncovered
  why: 'Nothing bears on this criterion at all: the file is now zero bytes and contributes no test to
    the set, so there is no surviving assertion whose failure could signal anything about the removal,
    and "every other test in the file" names an empty set. Whether a spec file holding no test at all
    is itself something the suite accepts is a question for the captured run, not for any test here.'
- criterion: src/__tests__/unit/glossary/glossary.service.spec.ts no longer contains its two comment-assertion
    tests (pageCountOf's citation and the discarded-task-path doc-comment test); every other test in the
    file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a page of a vocabulary with the full pagination envelope, its page count computed from
      the total and the limit (API-03)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: counts the seeded non-conclusion outcomes toward the outcome vocabulary's total and page count,
      not only toward its returned page (API-03)
  why: The two named tests' absence is not exercisable by a test, and neither is the survivors' being
    unchanged. The listed tests exercise the page-count behavior the removed citation nominally cited;
    nothing in the file bears on the discarded-task-path doc comment the second removed test read, because
    that test's only subject was the comment itself.
- criterion: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts no longer contains
    its two comment-assertion tests (the dependency comment and the transport-status comment); every other
    test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
    name: calls its readCapabilityByIdentity dependency with exactly the given name and version, performing
      no held-check or transformation of the params itself
  - file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
    name: propagates exactly the CapabilityIdentityNotFoundError its readCapabilityByIdentity dependency
      rejects with, raising none of its own
  why: Neither the absence of the two tests nor the untouchedness of the three survivors is something
    a test asserts. The dependency-wiring survivor exercises the subject the removed dependency-comment
    test read about; nothing exercises the transport status, which this controller does not decide --
    the removed test read that fact off a comment, and no surviving test replaces it with an assertion
    on behavior.
- criterion: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts no longer contains
    its one transport-status-comment test; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
    name: answers the wire projection of exactly the configuration its readConnectorConfiguration dependency
      resolves, performing no held-check of its own
  - file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
    name: propagates exactly the ConnectorConfigurationNotFoundError its readConnectorConfiguration dependency
      rejects with, raising none of its own
  why: The removed test's absence is a fact about this file's text; no test asserts on it, and no test
    would fail if it were reinstated. The two listed survivors exercise the controller's projection and
    its propagation of the not-found refusal, so a removal that broke this file's shared fixtures would
    show up there -- that is the limit of what they establish.
- criterion: src/__tests__/unit/http/test-connector.controller.spec.ts no longer contains its one header-comment
    masking-paragraph test; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/http/test-connector.controller.spec.ts
    name: propagates ConnectorPlaceholderNotResolvedError uncaught, issuing no HTTP call, when the named
      connector configuration embeds a Subject-attribute placeholder the given Subject does not carry
  - file: src/__tests__/unit/http/test-connector.controller.spec.ts
    name: imports neither the new required-case-inputs gate function nor the diagnose controller, so its
      own diagnostic call has no path into the gate
  why: Nothing exercises the named test's absence or the survivors' untouchedness. The second test listed
    still reads test-connector.controller.ts's own source text with readFile -- it scans import specifiers,
    not comment prose, so it is not one this criterion names for removal, but it does mean this file continues
    to assert on production source and would fail if that file's imports changed.
- criterion: src/__tests__/unit/investigation/citation-validation.spec.ts no longer contains its one HypothesisCitationContext
    doc-comment test; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a concept outside the judged hypothesis's collects, even though its
      field matches that concept's own cited evidence item's snapshotted fields
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: declares no outputSchemas field, no capabilityOutputSchemaKey helper and no CapabilityOutputSchemas
      type — the field-existence check has no live-resolved capability output-schema map left to build
      or read
  why: The removal itself is unexercisable by test. The first listed test exercises the HypothesisCitationContext
    behavior the removed doc-comment test only cited. The second reads citation-validation.ts's source
    text and asserts three identifiers are absent from it -- source text, not comment prose, so outside
    what this criterion asks removed.
- criterion: src/__tests__/unit/investigation/draft-assessment-text.spec.ts no longer contains its one
    module-header-attribution test; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: answers text equal to what the consolidator returns for narrowedInput's own evaluations and
      evidence together with the given register
  - file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
    name: exposes only outcome, referral, determining_hypothesis and text — never a verdict or evidence
      field — on a confirmed-path answer
  why: A module header's attribution was the removed test's whole subject, and nothing replaces it with
    an assertion on behavior. Neither listed survivor would fail if the removed test returned; they exercise
    draftAssessment's own answer, so their failure would signal only that the removal reached this file's
    fixtures.
- criterion: src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts no longer contains
    its one observeConcept doc-comment-citation test; every other test in the file is unchanged.
  state: uncovered
  why: 'Nothing bears on this criterion: the file is now zero bytes and contributes no test to the set,
    so no surviving assertion could signal anything about the removal, and "every other test in the file"
    names an empty set.'
- criterion: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts no longer
    contains its one DEFAULT_STATUS_ENDING comment-citation test; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: defaults an HTTP status absent from the connector's own status map to the unavailable ending,
      rather than leaving it unclassified
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: carries no observation field on a non-ok ending, resolving exactly to its own result
  why: The named test's absence is not test-exercisable. The first listed test exercises the default-status-ending
    behavior the removed test read off a comment beside DEFAULT_STATUS_ENDING, so the behavior itself
    remains proven -- but that is a fact about the behavior, not evidence that the comment-reading test
    is gone or that the file's other tests are unchanged.
- criterion: src/__tests__/unit/investigation/judgment-stage.spec.ts no longer contains its five doc-comment
    attribution/citation tests; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records deadline-exceeded, never judgment-failure, for a call that has not returned by the stage's
      deadline
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: retries once on a decided answer whose citations fail structural validation, and returns the
      retry's valid decided answer
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: imports no ICapabilityQuery and reads no capability-registry port at all — judgeHypotheses takes
      only evidence already collected, never a registry to resolve live
  why: Five removals and the untouchedness of roughly twenty survivors are claims about this file's text
    that nothing asserts on. The criterion also does not say which five tests were removed -- it names
    a count and a kind, so an audit cannot check the pairing against anything but the diff.
- criterion: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts no longer contains its
    three module-header citation/attribution tests; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: imports no framework, driver or provider client, so infrastructure cannot be reached from it
      directly
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: carries every required hypothesis's own evaluation, not only the one that confirmed, when one
      hypothesis confirms
  why: Nothing exercises the three removals or the survivors' untouchedness, and as with judgment-stage
    the criterion names a count and a kind rather than the three tests, so the pairing is checkable only
    against the diff.
- criterion: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts no longer contains
    its one discarded-task-path doc-comment-citation test; every other test in the file is unchanged.
  state: uncovered
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given
      names either — no matter how many concepts are given
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: runs exactly one statement against concepts per given concept, always the same upsert-by-identity
      INSERT ... ON CONFLICT (name) DO UPDATE, never a SELECT or any other form
  why: The removal is a fact about the file's text and no test asserts on it. The two listed survivors
    exercise the write path the removed doc-comment citation was attached to; the second asserts the exact
    SQL string the repository emits, a pre-existing over-assertion this task did not introduce and did
    not touch.
- criterion: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts, whose
    six tests exist only to test the exemption logic for a comment citing a specification-node identity
    inside a domain-boundary substring scan, is deleted entirely.
  state: uncovered
  why: A deleted file's non-existence is not behavior, and the six deleted tests contribute nothing to
    the set. Nothing here fails if the file returned. The exemption logic those six tests exercised was,
    by the criterion's own description, logic inside a domain-boundary scan -- if any of that logic lives
    in a file the deletion did not remove, nothing in this set now exercises it, and the criterion says
    nothing about where it went.
- criterion: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts is deleted entirely, as
    named for whole removal; only its second test ("explains why fileParallelism is disabled without naming
    any database provider") reads comment prose -- its first test ("declares a testTimeout raised above
    the prior 40000ms value") is behavioral and is deleted along with it, by the same explicit whole-file
    removal, not because it reads a comment.
  state: uncovered
  why: 'No test exercises a file''s non-existence. The criterion also states that a behavioral assertion
    was deleted rather than relocated: nothing in the set now asserts that vitest''s configured testTimeout
    stands above the prior 40000ms value, so a config change lowering it would be caught by nothing here.'
- criterion: No file outside src/__tests__ changes -- no production source, and no production comment,
    is touched by this task.
  state: uncovered
  tests:
  - file: src/__tests__/unit/http/test-connector.controller.spec.ts
    name: imports neither the new required-case-inputs gate function nor the diagnose controller, so its
      own diagnostic call has no path into the gate
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: imports no ICapabilityQuery and reads no capability-registry port at all — judgeHypotheses takes
      only evidence already collected, never a registry to resolve live
  - file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
    name: imports no HTTP client package, reaching the network only through the platform global fetch
  - file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
    name: imports no port file, since a port models an infrastructure boundary this module never reaches
  why: A negative over a whole tree is not something a test set can exercise; it is answered by the diff.
    The tests listed do read production source files and bear incidentally, but none reads comment prose
    -- every one would pass unchanged if a production comment had been edited or deleted. The clause "no
    production comment is touched" is exercised by nothing at all.
- criterion: Running the full backend suite after the removals passes, with no remaining test in any of
    the 19 files above weakened, skipped, or rewritten to tolerate comment content the removed test used
    to check.
  state: uncovered
  why: Neither half is test-exercisable. That the suite passes is a property of a run, evidenced by the
    captured run under the delivery root's run/ and by nothing in the test set. That no survivor was weakened,
    skipped or rewritten is a claim about the text of other tests, which a test never reads about itself
    or its neighbours. Two of the nineteen files (glossary-store.port.spec.ts, fake-observation-source.adapter.spec.ts)
    are now zero-byte files holding no test; whether the runner treats that as a pass is exactly what
    this criterion turns on and nothing in the set answers.
findings:
- pass: conformance
  file: src/__tests__/unit/errors/status-map.spec.ts
  where: line 150, the test name of the CaseAlreadyHasDraftError/ManifestPositionOccupiedError comparison
  evidence: it('maps CaseAlreadyHasDraftError and ManifestPositionOccupiedError to the same non-500 status,
    pinning "distinct" as specific rather than mutually exclusive across all seven', () => {
  cost: The name quotes "distinct" as though quoting a stated requirement and generalises it over "all
    seven" refusals, and neither the quoted word nor the group of seven appears anywhere under the specification
    root -- the phrase traces only to a task objective in delivery/case-management-http-api. The two statuses
    the test actually pins are each stated outright by their own node (rules/knowledge/a-case-has-at-most-one-draft
    and rules/knowledge/a-hypothesis-position-is-unique-within-its-case, both HTTP 409), so the assertion
    is grounded while the reading around it is not. The deletion of this file's node-citation tests removed
    the last thing in the file that pointed anywhere else.
  correction: Say what the two nodes say -- both refusals are stated as HTTP 409 by their own rule --
    and drop the "distinct"/"all seven" reading, which is an interpretation of a task's wording rather
    than anything the specification states.
- pass: conformance
  file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: lines 302-316, the whitespace-only description test
  evidence: 'it(''does not treat a whitespace-only description as naming none: it is stored exactly as
    given, with no trimming and no refusal'', async () => { [...] expect(registered.description).toBe(''   '');'
  cost: 'This pins where the line between "no description" and a description falls: a value of only whitespace
    is a description, accepted and stored untrimmed. The governing node, rules/glossary/a-concept-declares-its-description,
    states only the no-description refusal and does not settle this boundary, and decision-log.md''s entry
    for it decided only the error class''s name. So the boundary is decided in this test file and nowhere
    else, and the next reader asking whether "   " publishes a concept will find only the refusal for
    "no description" in the specification and may conclude the opposite of what the system does.'
  correction: Decide the boundary into rules/glossary/a-concept-declares-its-description -- whether a
    whitespace-only description is "no description" -- and disclose it in decision-log.md; the test then
    pins what the node states rather than being the only statement of it.
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  where: lines 114-125, the manifestEntryOf helper
  evidence: 'function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { return
    { position, hypothesis_revision: { hypothesis: { name: hypothesis.name }, revision: 1, criterion:
    hypothesis.criterion, collects: hypothesis.collects, resolution: hypothesis.resolution } }; }'
  cost: The same twelve lines stand verbatim at judgment-stage.spec.ts:29-40 and resolve-and-narrow-input.spec.ts:22-33.
    When ManifestEntry gains, renames or drops a field, three copies have to be found and changed together;
    the copies nobody edits keep building a stale manifest entry, so their tests keep passing against
    a shape the case module no longer produces.
  correction: Extract one manifest-entry builder into a shared test-helper module under src/__tests__
    and have the three specs import it instead of each declaring its own.
- pass: standard
  cites: TST-01
  file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  where: lines 304-316, the test named "reads the capability registration as it stands at the moment of
    validation, not a remembered one"
  evidence: await expect(validateCaseCoherence(theCase, glossary, capabilities)).rejects.toBeInstanceOf(IncoherentCaseError);
    capabilities.hold(coherentCapability()); await expect(validateCaseCoherence(theCase, glossary, capabilities)).resolves.toBeUndefined();
  cost: The arrangement that makes the second assertion mean anything -- holding the capability -- sits
    between the two assertions, so the test's shape does not say which state each claim is made against;
    a reader has to replay the statements in order before trusting either half, and a later edit that
    moves the hold() line changes what both assertions claim without either assertion changing.
  correction: 'Make the second arrangement a visible phase of its own: capture the pre-registration outcome
    into a variable, hold the capability, capture the post-registration outcome, and assert both at the
    end -- or split the two claims into two tests, each arranging its own registry.'
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/investigation/citation-validation.spec.ts
  where: lines 16-31, the anEvidence fixture builder
  evidence: 'function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence
    { return { inputs: ''an-input'', observation: ''an-observation'', [...] fields: [], concept_description:
    '''', ...overrides }; }'
  cost: This builder is byte-identical in four reviewed files -- here, draft-assessment-text.spec.ts:28-43,
    judgment-stage.spec.ts:76-91 and resolve-and-narrow-input.spec.ts:67-82. Evidence has already grown
    fields this fixture defaults; the next such field has to be added in four places, and any copy left
    behind keeps compiling with a stale default.
  correction: Move one Evidence fixture builder into a shared test-helper module under src/__tests__ and
    import it in the four specs.
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  where: lines 28-43, the anEvidence fixture builder
  evidence: 'function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence
    { return { inputs: ''an-input'', observation: ''an-observation'', [...] fields: [], concept_description:
    '''', ...overrides }; }'
  cost: The same builder stands verbatim at citation-validation.spec.ts:16-31, judgment-stage.spec.ts:76-91
    and resolve-and-narrow-input.spec.ts:67-82; a change to the Evidence shape must be repeated in all
    four, and the copy this file holds is the one a reader of the assessment tests would trust while another
    copy has already moved on.
  correction: Import the shared Evidence fixture builder rather than declaring a fourth copy of it here.
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: lines 29-40, the manifestEntryOf helper
  evidence: 'function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { return
    { position, hypothesis_revision: { hypothesis: { name: hypothesis.name }, revision: 1, criterion:
    hypothesis.criterion, collects: hypothesis.collects, resolution: hypothesis.resolution } }; }'
  cost: Verbatim with validate-case-coherence.spec.ts:114-125 and resolve-and-narrow-input.spec.ts:22-33.
    The judgment tests read the manifest to decide which hypotheses are required, so a manifest-shape
    change applied to only two of the three copies leaves this suite judging a required set assembled
    the old way, and it reports green.
  correction: Import one shared manifest-entry builder instead of holding a third copy.
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: lines 76-91, the anEvidence fixture builder
  evidence: 'function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence
    { return { inputs: ''an-input'', observation: ''an-observation'', [...] fields: [], concept_description:
    '''', ...overrides }; }'
  cost: One of four verbatim copies (citation-validation.spec.ts:16-31, draft-assessment-text.spec.ts:28-43,
    resolve-and-narrow-input.spec.ts:67-82). These tests turn on the snapshotted fields and concept_description
    this builder defaults; if the defaults are corrected in one copy and not here, the suite goes on proving
    that judgment reads a snapshot shape nothing else in the project still builds.
  correction: Import the shared Evidence fixture builder rather than keeping a copy in this file.
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  where: lines 22-33, the manifestEntryOf helper
  evidence: 'function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { return
    { position, hypothesis_revision: { hypothesis: { name: hypothesis.name }, revision: 1, criterion:
    hypothesis.criterion, collects: hypothesis.collects, resolution: hypothesis.resolution } }; }'
  cost: The third verbatim copy, beside validate-case-coherence.spec.ts:114-125 and judgment-stage.spec.ts:29-40.
    The narrowing tests decide which evaluations are "required" from the manifest this helper builds,
    so a divergence between copies changes what "required" means here without changing any assertion in
    the file.
  correction: Import one shared manifest-entry builder instead of holding a third copy.
- pass: standard
  cites: MNT-03
  file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  where: lines 67-82, the anEvidence fixture builder
  evidence: 'function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence
    { return { inputs: ''an-input'', observation: ''an-observation'', [...] fields: [], concept_description:
    '''', ...overrides }; }'
  cost: The fourth verbatim copy (citation-validation.spec.ts:16-31, draft-assessment-text.spec.ts:28-43,
    judgment-stage.spec.ts:76-91). Four builders of one domain type is four places to change and three
    to forget, and the narrowing tests assert on evidence identity by object equality, so a copy that
    drifts fails here for a reason that has nothing to do with narrowing.
  correction: Import the shared Evidence fixture builder rather than declaring it again here.
---

## What it is

The first review of the backend-comment-assertion-test-sweep delivery: coverage, specification
conformance, standard conformance and failures over the file set this task touched, plus the
captured run over the whole change.

## Notes

Every coverage entry reads `uncovered` -- not because a test is missing where one belongs, but
because this task's own criteria are almost entirely claims about absence (a test no longer
existing, a file no longer existing, "every other test unchanged") that no test, new or existing,
can exercise. The coverage-auditor's own findings say this plainly per criterion; a person reading
this record should weigh that against the diff and the captured run, not against a coverage
figure, since none is computed here.

Both conformance findings and all seven standard findings sit in files or lines this task's own
diff did not touch -- they predate the removal and were exposed by it (the comment-assertion
tests that used to sit beside them are gone), not introduced by it.

The standard pass could not read three files this review's file set names, because this task
deleted them: capability.spec.ts, domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts,
vitest-config-migration-replay-headroom.spec.ts.

This review's own captured run sits at run/backend-comment-assertion-test-sweep and passed every
step (install, typecheck, lint, secret-scan, test); it carries no node field here because the
failures pass, which is the only pass this field answers for, did not run over a passing run.
