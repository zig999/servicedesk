---
title: Remove backend tests asserting production-comment prose
summary: Deletes the 37 comment-assertion tests across 17 test files (with dead helpers/imports cleaned
  up) and removes three whole test files named for removal, touching no production source.
task: sha256:d7846362683f85a8efbe213e731697784b52ac3c85acf00bb48ebd6961b8a091
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/backend-comment-assertion-test-sweep-remove-comment-assertion-tests-build
files:
- path: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  effect: No longer asserts capability-registry.service.ts's own comment prose (readCapabilityByIdentity's
    contract-membership comment, pageCountOf's citation, refuseContractDepartures' doc comment); dropped
    the now-unused readFile/fileURLToPath imports and the proseOf helper those three tests alone used;
    every other test byte-for-byte unchanged.
- path: src/__tests__/unit/capability-registry/capability.spec.ts
  effect: Deleted entirely, per the task's own criterion. Its sole test asserted domain/integration/capability's
    own doc-comment attribution.
- path: src/__tests__/unit/case/validate-case-coherence.spec.ts
  effect: No longer asserts its three doc-comment-citation tests (namedVocabularyTerms' two citations,
    conceptViolations' one); dropped the now-unused moduleSource/docCommentBefore/normalizedProse helpers
    and readFile/fileURLToPath imports those alone used; every other test unchanged.
- path: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  effect: No longer asserts its three comment-assertion tests (ConnectorConfigurationResolution's scoping
    comment, pageCountOf's citation, wellFormedConfiguration's classification comment); dropped the now-unused
    proseOf helper and readFile/fileURLToPath imports; every other test unchanged.
- path: src/__tests__/unit/errors/status-map.spec.ts
  effect: No longer asserts the header comment's prose (the two-node and eleven-node citations, the top
    paragraph, the 404/409/422 group enumeration, the "reached this table" narrative, and the InvestigationWriteDeadlineExceededError
    attribution) across six removed tests; dropped the now-unused proseOf helper and readFile/fileURLToPath
    imports; every remaining behavioral status-mapping test unchanged.
- path: src/__tests__/unit/glossary/glossary-store.port.spec.ts
  effect: Both of its tests were doc-comment-citation tests; removed along with the now-unused imports
    and MODULE_PATH const. The file now holds zero tests -- not named for whole removal by the task, so
    it stands, relying on the project's own vitest --passWithNoTests.
- path: src/__tests__/unit/glossary/glossary.service.spec.ts
  effect: No longer asserts its two comment-assertion tests (pageCountOf's citation and the discarded-task-path
    doc-comment test); dropped the now-unused proseOf helper and readFile/fileURLToPath imports; every
    other test unchanged.
- path: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  effect: No longer asserts its two comment-assertion tests (the dependency comment and the transport-status
    comment); dropped the now-unused proseOf helper and readFile/fileURLToPath imports; every other test
    unchanged.
- path: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  effect: No longer asserts its one transport-status-comment test; dropped the now-unused proseOf helper
    and readFile/fileURLToPath imports; every other test unchanged.
- path: src/__tests__/unit/http/test-connector.controller.spec.ts
  effect: No longer asserts its one header-comment masking-paragraph test; dropped the now-unused proseOf
    helper. MODULE_PATH/readFile/fileURLToPath kept -- still used by the remaining import-specifier test.
    Every other test unchanged.
- path: src/__tests__/unit/investigation/citation-validation.spec.ts
  effect: No longer asserts its one HypothesisCitationContext doc-comment test; dropped the now-unused
    docCommentBefore/normalizedProse helpers. moduleSource/readFile/fileURLToPath kept -- still used by
    the remaining field-existence test. Every other test unchanged.
- path: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  effect: No longer asserts its one module-header-attribution test; dropped the now-unused moduleSource/moduleHeaderOf/normalizedProse
    helpers and readFile/fileURLToPath imports those alone used; every other test unchanged.
- path: src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts
  effect: Its sole test was the observeConcept doc-comment-citation test; removed along with the now-unused
    proseOf helper, MODULE_PATH and imports. The file now holds zero tests -- not named for whole removal
    by the task, so it stands, relying on the project's own vitest --passWithNoTests.
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  effect: No longer asserts the DEFAULT_STATUS_ENDING comment-citation test; readFile/fileURLToPath/readdir/join
    remain in active use by other tests and were left untouched; every other test unchanged.
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  effect: No longer asserts its five doc-comment attribution/citation tests; dropped the now-unused moduleHeaderOf/docCommentBefore/normalizedProse
    helpers those alone used. moduleSource/readFile/fileURLToPath kept -- still used by the remaining
    ICapabilityQuery-import test. Every other test unchanged.
- path: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  effect: No longer asserts its three module-header citation/attribution tests; dropped the now-unused
    moduleHeader/normalizedProse helpers those alone used. readFile/fileURLToPath/builtinModules/MODULE_PATH
    kept -- still used by the remaining import-audit tests. Every other test unchanged.
- path: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  effect: No longer asserts its one discarded-task-path doc-comment-citation test; dropped the now-unused
    readFile/fileURLToPath imports those alone used; every other test unchanged.
- path: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
  effect: Deleted entirely, per the task's own criterion. Its six tests existed only to test the exemption
    logic for a comment citing a specification-node identity inside a domain-boundary substring scan.
- path: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
  effect: Deleted entirely, per the task's own criterion, including its one behavioral test ("declares
    a testTimeout raised above the prior 40000ms value") alongside the one comment-prose test -- the criterion
    named the whole file for removal regardless of that test's own shape.
criteria:
- criterion: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts no longer contains
    the three tests whose assertions read capability-registry.service.ts's own comment prose (readCapabilityByIdentity's
    contract-membership comment, pageCountOf's constraints/listings-are-paged citation, refuseContractDepartures'
    doc comment); every other test in the file is unchanged.
  met: true
  how: The three tests and their sole-use proseOf helper and readFile/fileURLToPath imports were removed;
    the remaining tests are byte-for-byte unchanged.
- criterion: src/__tests__/unit/capability-registry/capability.spec.ts, whose sole test asserts domain/integration/capability's
    own doc-comment attribution, is deleted entirely.
  met: true
  how: The file was removed from the tree (git rm).
- criterion: src/__tests__/unit/case/validate-case-coherence.spec.ts no longer contains its three doc-comment-citation
    tests (namedVocabularyTerms' two citations, conceptViolations' one); every other test in the file
    is unchanged.
  met: true
  how: The three tests and their sole-use helpers/imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts no
    longer contains its three comment-assertion tests (ConnectorConfigurationResolution's scoping comment,
    pageCountOf's citation, wellFormedConfiguration's classification comment); every other test in the
    file is unchanged.
  met: true
  how: The three tests and their sole-use proseOf helper and imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/errors/status-map.spec.ts no longer contains the six tests asserting the
    header comment's prose (the two-node and eleven-node citations, the top paragraph, the 404/409/422
    group enumeration, the "reached this table" narrative, and the InvestigationWriteDeadlineExceededError
    attribution); every one of the file's remaining behavioral status-mapping tests is unchanged.
  met: true
  how: All six header-comment tests and their sole-use proseOf helper and imports were removed; every
    behavioral status-mapping test unchanged.
- criterion: src/__tests__/unit/glossary/glossary-store.port.spec.ts no longer contains its two doc-comment-citation
    tests; every other test in the file is unchanged.
  met: true
  how: Both tests and the now-unused imports/MODULE_PATH were removed; the file held only these two tests,
    so it now holds none -- vacuously true that every other test is unchanged, and the project's own vitest
    --passWithNoTests keeps the suite green over a zero-test file.
- criterion: src/__tests__/unit/glossary/glossary.service.spec.ts no longer contains its two comment-assertion
    tests (pageCountOf's citation and the discarded-task-path doc-comment test); every other test in the
    file is unchanged.
  met: true
  how: Both tests and their sole-use proseOf helper and imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts no longer contains
    its two comment-assertion tests (the dependency comment and the transport-status comment); every other
    test in the file is unchanged.
  met: true
  how: Both tests and their sole-use proseOf helper and imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts no longer contains
    its one transport-status-comment test; every other test in the file is unchanged.
  met: true
  how: The test and its sole-use proseOf helper and imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/http/test-connector.controller.spec.ts no longer contains its one header-comment
    masking-paragraph test; every other test in the file is unchanged.
  met: true
  how: The test and its sole-use proseOf helper were removed; MODULE_PATH/readFile/fileURLToPath kept
    because the remaining import-specifier test still needs them; every other test unchanged.
- criterion: src/__tests__/unit/investigation/citation-validation.spec.ts no longer contains its one HypothesisCitationContext
    doc-comment test; every other test in the file is unchanged.
  met: true
  how: The test and its sole-use docCommentBefore/normalizedProse helpers were removed; moduleSource/readFile/fileURLToPath
    kept because the remaining field-existence test still needs them; every other test unchanged.
- criterion: src/__tests__/unit/investigation/draft-assessment-text.spec.ts no longer contains its one
    module-header-attribution test; every other test in the file is unchanged.
  met: true
  how: The test and its sole-use helpers/imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts no longer contains
    its one observeConcept doc-comment-citation test; every other test in the file is unchanged.
  met: true
  how: The file's sole test, its sole-use proseOf helper, MODULE_PATH and imports were removed; the file
    now holds no test at all -- vacuously true that every other test is unchanged, relying on the project's
    own vitest --passWithNoTests.
- criterion: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts no longer
    contains its one DEFAULT_STATUS_ENDING comment-citation test; every other test in the file is unchanged.
  met: true
  how: Only that test was removed; the remaining helpers/imports stay in active use by other tests; every
    other test unchanged.
- criterion: src/__tests__/unit/investigation/judgment-stage.spec.ts no longer contains its five doc-comment
    attribution/citation tests; every other test in the file is unchanged.
  met: true
  how: All five tests and their sole-use helpers were removed; moduleSource/readFile/fileURLToPath kept
    because the remaining ICapabilityQuery-import test still needs them; every other test unchanged.
- criterion: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts no longer contains its
    three module-header citation/attribution tests; every other test in the file is unchanged.
  met: true
  how: All three tests and their sole-use helpers were removed; the remaining import-audit tests keep
    their own imports; every other test unchanged.
- criterion: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts no longer contains
    its one discarded-task-path doc-comment-citation test; every other test in the file is unchanged.
  met: true
  how: The test and its sole-use imports were removed; every other test unchanged.
- criterion: src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts, whose
    six tests exist only to test the exemption logic for a comment citing a specification-node identity
    inside a domain-boundary substring scan, is deleted entirely.
  met: true
  how: The file was removed from the tree (git rm).
- criterion: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts is deleted entirely, as
    named for whole removal; only its second test ("explains why fileParallelism is disabled without naming
    any database provider") reads comment prose -- its first test ("declares a testTimeout raised above
    the prior 40000ms value") is behavioral and is deleted along with it, by the same explicit whole-file
    removal, not because it reads a comment.
  met: true
  how: The file was removed from the tree (git rm).
- criterion: No file outside src/__tests__ changes -- no production source, and no production comment,
    is touched by this task.
  met: true
  how: Every path touched sits under src/__tests__; no production source file was read for edit, and no
    production comment was altered.
- criterion: Running the full backend suite after the removals passes, with no remaining test in any of
    the 19 files above weakened, skipped, or rewritten to tolerate comment content the removed test used
    to check.
  met: true
  how: No remaining test's assertions were changed in any of the 16 edited-in-place files -- only whole
    tests, and the helpers/imports left dead by their removal, were deleted; two files reduced to zero
    tests rely on the project's own vitest --passWithNoTests, already configured; confirmed by the suite
    run captured at run/backend-comment-assertion-test-sweep-remove-comment-assertion-tests-suite.
inferences:
- inferred: glossary-store.port.spec.ts and fake-observation-source.adapter.spec.ts are left in place
    holding zero tests, rather than deleted, once their only test(s) were removed.
  from: The task names only capability.spec.ts, domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
    and vitest-config-migration-replay-headroom.spec.ts for whole-file deletion; these two files' own
    criteria ask only for their named tests' removal, and the project's package.json test script already
    runs vitest with --passWithNoTests, which accommodates a spec file with no tests.
- inferred: A local helper (proseOf, docCommentBefore, normalizedProse, moduleHeaderOf, moduleSource)
    or an import (readFile, fileURLToPath) is removed from a file only where deleting the named test(s)
    left it with no remaining caller in that same file.
  from: MNT-02 ("Commented-out code is deleted, and unused imports are removed", decided by lint) in standards/backend-node-service.yaml,
    and the task's own criterion that a file is otherwise unchanged -- a stranded, unused helper left
    behind is not that.
---

## What it is

Removes the 37 individual tests, across 17 files, asserting a production comment's literal
prose -- a specification-node citation, an explanatory header paragraph, or an attribution --
plus three whole files named for removal regardless of their own tests' shape. No production
source or comment changes; every behavioral test dividing the same files stays as it was.

## Notes

The task-implementer subagent's own toolset (Read, Write, Edit, Grep, Glob) has no
file-deletion capability. For the three files this task names for whole removal
(capability.spec.ts, domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts,
vitest-config-migration-replay-headroom.spec.ts), it wrote each to empty content instead of
deleting it, and returned those three criteria as unmet for exactly that reason -- no other
criterion came back unmet. This skill's own orchestration, which holds a shell to run the
registry's declared commands, then removed the three now-empty files from the tree with
`git rm`, completing the deletion the task-implementer had already fully decided and disclosed.
No new judgment was made at that step, only the mechanical action the subagent's tools could
not perform; the criteria above reflect the tree as it now stands, with all three met.
