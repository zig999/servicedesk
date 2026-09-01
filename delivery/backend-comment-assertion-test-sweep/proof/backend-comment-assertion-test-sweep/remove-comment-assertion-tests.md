---
title: Existing behavioral tests continuing to pass over the comment-assertion removals
summary: Cites, per edited-in-place file with at least one surviving test, one pre-existing behavioral
  test that already runs unmodified and would fail on any regression the removal could have caused; this
  removal-only task authorizes no new test.
implementation: sha256:7a52cd8b04deb923bcb05215eb3d06ee9ef582ad51d8c2783721b175e2c84188
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/backend-comment-assertion-test-sweep-remove-comment-assertion-tests-suite
tests:
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: computes the page count as the ceiling of total over limit when they do not divide evenly
  proves: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts no longer contains
    the three tests whose assertions read capability-registry.service.ts's own comment prose (readCapabilityByIdentity's
    contract-membership comment, pageCountOf's constraints/listings-are-paged citation, refuseContractDepartures'
    doc comment); every other test in the file is unchanged.
  fails_when: listCapabilities' pageCountOf stops taking the ceiling of total over limit -- this is the
    behavior the removed pageCountOf citation-test pointed at without asserting, and this surviving test
    is what actually fails if that behavior regresses.
- file: src/__tests__/unit/case/validate-case-coherence.spec.ts
  name: does not refuse a case that violates no coherence rule
  proves: src/__tests__/unit/case/validate-case-coherence.spec.ts no longer contains its three doc-comment-citation
    tests (namedVocabularyTerms' two citations, conceptViolations' one); every other test in the file
    is unchanged.
  fails_when: validateCaseCoherence starts rejecting a coherent case -- if editing the file to drop the
    three doc-comment-citation tests had disturbed the vocabulary or concept coherence checks those comments
    cited, this test would fail because the promise would reject instead of resolving to undefined.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: resolves the absence of a connector nothing has registered, as data rather than a raised error
  proves: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts no longer
    contains its three comment-assertion tests (ConnectorConfigurationResolution's scoping comment, pageCountOf's
    citation, wellFormedConfiguration's classification comment); every other test in the file is unchanged.
  fails_when: 'readConnectorConfiguration starts throwing instead of answering { held: false, connector
    } for an unregistered connector -- the ConnectorConfigurationResolution behavior the removed scoping-comment
    test cited without asserting.'
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves InvestigationWriteDeadlineExceededError to 500
  proves: src/__tests__/unit/errors/status-map.spec.ts no longer contains the six tests asserting the
    header comment's prose (the two-node and eleven-node citations, the top paragraph, the 404/409/422
    group enumeration, the "reached this table" narrative, and the InvestigationWriteDeadlineExceededError
    attribution); every one of the file's remaining behavioral status-mapping tests is unchanged.
  fails_when: statusForError stops mapping InvestigationWriteDeadlineExceededError to 500 -- the exact
    mapping the removed attribution-comment test cited without asserting the mapping itself.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: answers a page count of zero for a non-positive limit, rather than dividing by it (API-03)
  proves: src/__tests__/unit/glossary/glossary.service.spec.ts no longer contains its two comment-assertion
    tests (pageCountOf's citation and the discarded-task-path doc-comment test); every other test in the
    file is unchanged.
  fails_when: listVocabularyTerms' pageCountOf stops answering 0 for a non-positive limit -- the same
    pageCountOf the removed citation-test pointed at without asserting its behavior.
- file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  name: returns exactly the capability its readCapabilityByIdentity dependency resolves, unwrapped and
    untransformed
  proves: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts no longer contains its
    two comment-assertion tests (the dependency comment and the transport-status comment); every other
    test in the file is unchanged.
  fails_when: handleReadCapabilityByIdentityRequest stops returning the dependency's resolved capability
    unwrapped -- e.g. it wraps, transforms or drops it -- regressing the handler the removed dependency-comment
    test named without exercising it.
- file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  name: answers the wire projection of exactly the configuration its readConnectorConfiguration dependency
    resolves, performing no held-check of its own
  proves: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts no longer contains its
    one transport-status-comment test; every other test in the file is unchanged.
  fails_when: handleReadConnectorConfigurationRequest stops answering the dependency's resolved configuration
    as { connector, configuration } -- e.g. it re-adds a held-check or alters the wire shape -- regressing
    the behavior the removed transport-status-comment test named without exercising it.
- file: src/__tests__/unit/http/test-connector.controller.spec.ts
  name: imports neither the new required-case-inputs gate function nor the diagnose controller, so its
    own diagnostic call has no path into the gate
  proves: src/__tests__/unit/http/test-connector.controller.spec.ts no longer contains its one header-comment
    masking-paragraph test; every other test in the file is unchanged.
  fails_when: the controller starts importing subject-covers-case-input-requirements.js or diagnose.controller.js,
    or the MODULE_PATH/readFile/fileURLToPath imports this test alone still needs (kept per the implementation
    record) were wrongly stripped alongside the removed masking-paragraph test.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: declares no outputSchemas field, no capabilityOutputSchemaKey helper and no CapabilityOutputSchemas
    type -- the field-existence check has no live-resolved capability output-schema map left to build
    or read
  proves: src/__tests__/unit/investigation/citation-validation.spec.ts no longer contains its one HypothesisCitationContext
    doc-comment test; every other test in the file is unchanged.
  fails_when: citation-validation.ts reintroduces an outputSchemas field, a capabilityOutputSchemaKey
    helper or a CapabilityOutputSchemas type, or the moduleSource/readFile/fileURLToPath helpers this
    test alone still needs (kept per the implementation record) were wrongly stripped alongside the removed
    HypothesisCitationContext test.
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: answers text equal to what the consolidator returns for narrowedInput's own evaluations and evidence
    together with the given register
  proves: src/__tests__/unit/investigation/draft-assessment-text.spec.ts no longer contains its one module-header-attribution
    test; every other test in the file is unchanged.
  fails_when: draftAssessment stops forwarding narrowedInput's evaluations and evidence and the given
    consolidationRegister to the consolidator, or stops returning exactly its text -- regressing behavior
    left untouched by removing the module-header-attribution test and its sole-use helpers/imports.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: is imported by no domain module, so the domain layer reaches this adapter only through the IObservationSource
    port
  proves: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts no longer
    contains its one DEFAULT_STATUS_ENDING comment-citation test; every other test in the file is unchanged.
  fails_when: a file under case/, glossary/ or investigation/ (excluding another .adapter.ts) starts importing
    http-declarative-observation-source.adapter.ts directly, or the readdir/join/readFile/fileURLToPath
    imports this test needs (left untouched per the implementation record) were wrongly stripped alongside
    the removed DEFAULT_STATUS_ENDING test.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: imports no ICapabilityQuery and reads no capability-registry port at all -- judgeHypotheses takes
    only evidence already collected, never a registry to resolve live
  proves: src/__tests__/unit/investigation/judgment-stage.spec.ts no longer contains its five doc-comment
    attribution/citation tests; every other test in the file is unchanged.
  fails_when: judgment-stage.ts reintroduces an ICapabilityQuery import or a capability-query.port reference,
    or the moduleSource/readFile/fileURLToPath imports this test alone still needs (kept per the implementation
    record) were wrongly stripped alongside the five removed tests.
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: imports no framework, driver or provider client, so infrastructure cannot be reached from it directly
  proves: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts no longer contains its three
    module-header citation/attribution tests; every other test in the file is unchanged.
  fails_when: resolve-and-narrow-input.ts starts importing a forbidden infrastructure package (fastify,
    pg, @anthropic-ai/sdk, etc.), or the readFile/fileURLToPath/builtinModules/MODULE_PATH imports this
    test needs (kept per the implementation record) were wrongly stripped alongside them.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: deletes every existing row and inserts exactly the given terms, in that order, inside one transaction
  proves: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts no longer contains
    its one discarded-task-path doc-comment-citation test; every other test in the file is unchanged.
  fails_when: writeTerms stops running its DELETE-then-INSERT sequence inside one BEGIN/COMMIT transaction,
    or stops inserting each given term in order -- regressing the transactional write behavior left untouched
    by removing the one discarded-task-path doc-comment-citation test.
not_applicable:
- edge_case: Absent or empty input to a newly-introduced code path
  why: This task introduces no production code path and no new input-accepting behavior; it only deletes
    test files and dead test-only helpers/imports. There is no absent/empty-input case for a test to raise.
- edge_case: A boundary at each end of a stated range
  why: No range-bounded behavior is added or changed; the surviving pageCountOf/limit-boundary tests cited
    above (e.g. the non-positive-limit test) already cover the ranges that exist, unmodified.
- edge_case: A duplicate where uniqueness is claimed
  why: No uniqueness rule is added, removed or altered by deleting comment-assertion tests; the existing
    duplicate-name/duplicate-concept tests in the untouched files continue to run unmodified.
- edge_case: An operation attempted against state that forbids it
  why: No state machine or refusal rule is touched; every refusal this suite already asserts (e.g. incomplete-registration,
    malformed-schema, orphaned-placeholder refusals) is still exercised by the untouched tests surrounding
    the removed comment-assertion ones.
- edge_case: A dependency that fails or answers slowly
  why: No dependency-facing code changed; the existing failure-propagation and timeout tests (e.g. in
    http-declarative-observation-source.adapter.spec.ts and judgment-stage.spec.ts) are untouched and
    continue to cover this.
- edge_case: Two operations against one subject at once
  why: No concurrency-sensitive code changed; the existing concurrent-observeConcept test in http-declarative-observation-source.adapter.spec.ts
    is untouched and continues to cover this.
- edge_case: A spec file reduced to holding zero tests
  why: glossary-store.port.spec.ts and fake-observation-source.adapter.spec.ts are left in the tree holding
    no tests at all once their sole comment-assertion test(s) were removed. Whether the suite stays green
    over an empty spec file is a fact about the project's own vitest configuration (--passWithNoTests),
    not a behavior this proof can assert with a test written inside those files -- there is nothing left
    in them to run.
untested:
- src/__tests__/unit/capability-registry/capability.spec.ts, whose sole test asserted domain/integration/capability's
  own doc-comment attribution, is deleted entirely -- the file no longer exists, so no test can be cited;
  the deletion itself is verifiable only from the tree and the implementation record's own account of
  it, not from a test.
- src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts, whose six tests
  existed only to test the exemption logic for a comment citing a specification-node identity inside a
  domain-boundary substring scan, is deleted entirely -- nothing runs in a deleted file, and the task's
  own Notes record that the exemption logic it tested lives on, untested by this removal, inside domain-depends-on-no-infrastructure.spec.ts,
  which this task does not touch and this proof does not reach either.
- src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts is deleted entirely, including its
  one behavioral test ("declares a testTimeout raised above the prior 40000ms value") alongside its one
  comment-prose test -- both are gone, and neither can be cited.
- src/__tests__/unit/glossary/glossary-store.port.spec.ts no longer contains its two doc-comment-citation
  tests; every other test in the file is unchanged -- both of the file's only tests were the doc-comment-citation
  ones, so the file now holds zero tests and the claim holds vacuously with nothing remaining to cite.
- src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts no longer contains its one
  observeConcept doc-comment-citation test; every other test in the file is unchanged -- that was the
  file's only test; it now holds zero, so the claim holds vacuously with nothing remaining to cite.
- No file outside src/__tests__ changes -- no production source, and no production comment, is touched
  by this task -- this is a claim about which files this delivery touched at all, verifiable only against
  the implementation record's own files list and a diff of the tree, not by a test written inside src/__tests__.
- Running the full backend suite after the removals passes, with no remaining test in any of the 19 files
  above weakened, skipped, or rewritten to tolerate comment content the removed test used to check --
  every test cited above would individually fail on a regression in its own file, but no single test establishes
  that no test anywhere in the 19 files was weakened or rewritten; that totality rests on the captured
  suite run this proof points to, and on a line-by-line diff review of each file.
---

## What it is

Proves the backend comment-assertion test sweep by citing, per edited-in-place file that still
holds tests, one pre-existing behavioral test that continues to pass unmodified -- the test that
would actually fail if the removal had regressed that file. No new test is written: this task
adds no runtime behavior, and a test scanning test files for comment-prose absence would recreate
the exact convention this task retires.

## Notes

None.
