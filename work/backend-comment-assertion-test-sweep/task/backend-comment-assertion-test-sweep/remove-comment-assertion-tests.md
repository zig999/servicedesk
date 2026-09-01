---
title: Remove every backend test asserting a production comment's literal prose
summary: Deletes the 37 individual tests, across 17 files, that assert the literal wording of a production
  source comment, plus the two files whose only purpose is a now-retired comment convention, leaving every
  behavioral test in each file unchanged.
sources:
- intake/scope.md
objective: The backend unit/integration suite no longer holds any test whose assertion reads a production
  source file's text and checks the literal prose of a comment (a specification-node citation, an explanatory
  header paragraph, or an attribution) -- while every behavioral test in the seventeen files edited in
  place, and all production behavior, is unchanged. The two files named below for whole removal are deleted
  regardless of whether every one of their own tests reads comment prose.
rationale: This task implements no specification node. Every candidate the specification held that a removed
  test's assertion cited inside a production comment states only the runtime behavior its own untouched
  behavioral tests already prove; deleting a test that checked a comment's wording changes no behavior any
  node governs, so none of them is implemented, extended or contradicted by this task's own act.
criteria:
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts no longer contains the three
  tests whose assertions read capability-registry.service.ts's own comment prose (readCapabilityByIdentity's
  contract-membership comment, pageCountOf's constraints/listings-are-paged citation, refuseContractDepartures'
  doc comment); every other test in the file is unchanged.
- src/__tests__/unit/capability-registry/capability.spec.ts, whose sole test asserts domain/integration/capability's
  own doc-comment attribution, is deleted entirely.
- src/__tests__/unit/case/validate-case-coherence.spec.ts no longer contains its three doc-comment-citation
  tests (namedVocabularyTerms' two citations, conceptViolations' one); every other test in the file is
  unchanged.
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts no longer contains
  its three comment-assertion tests (ConnectorConfigurationResolution's scoping comment, pageCountOf's
  citation, wellFormedConfiguration's classification comment); every other test in the file is unchanged.
- src/__tests__/unit/errors/status-map.spec.ts no longer contains the six tests asserting the header comment's
  prose (the two-node and eleven-node citations, the top paragraph, the 404/409/422 group enumeration,
  the "reached this table" narrative, and the InvestigationWriteDeadlineExceededError attribution); every
  one of the file's remaining behavioral status-mapping tests is unchanged.
- src/__tests__/unit/glossary/glossary-store.port.spec.ts no longer contains its two doc-comment-citation
  tests; every other test in the file is unchanged.
- src/__tests__/unit/glossary/glossary.service.spec.ts no longer contains its two comment-assertion tests
  (pageCountOf's citation and the discarded-task-path doc-comment test); every other test in the file
  is unchanged.
- src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts no longer contains its two comment-assertion
  tests (the dependency comment and the transport-status comment); every other test in the file is unchanged.
- src/__tests__/unit/http/read-connector-configuration.controller.spec.ts no longer contains its one transport-status-comment
  test; every other test in the file is unchanged.
- src/__tests__/unit/http/test-connector.controller.spec.ts no longer contains its one header-comment
  masking-paragraph test; every other test in the file is unchanged.
- src/__tests__/unit/investigation/citation-validation.spec.ts no longer contains its one HypothesisCitationContext
  doc-comment test; every other test in the file is unchanged.
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts no longer contains its one module-header-attribution
  test; every other test in the file is unchanged.
- src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts no longer contains its one
  observeConcept doc-comment-citation test; every other test in the file is unchanged.
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts no longer contains
  its one DEFAULT_STATUS_ENDING comment-citation test; every other test in the file is unchanged.
- src/__tests__/unit/investigation/judgment-stage.spec.ts no longer contains its five doc-comment attribution/citation
  tests; every other test in the file is unchanged.
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts no longer contains its three module-header
  citation/attribution tests; every other test in the file is unchanged.
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts no longer contains its one
  discarded-task-path doc-comment-citation test; every other test in the file is unchanged.
- src/__tests__/unit/domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts, whose six tests
  exist only to test the exemption logic for a comment citing a specification-node identity inside a domain-boundary
  substring scan, is deleted entirely.
- src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts is deleted entirely, as named for
  whole removal; only its second test ("explains why fileParallelism is disabled without naming any
  database provider") reads comment prose -- its first test ("declares a testTimeout raised above the
  prior 40000ms value") is behavioral and is deleted along with it, by the same explicit whole-file
  removal, not because it reads a comment.
- No file outside src/__tests__ changes -- no production source, and no production comment, is touched
  by this task.
- Running the full backend suite after the removals passes, with no remaining test in any of the 19 files
  above weakened, skipped, or rewritten to tolerate comment content the removed test used to check.
---

## What it is

A corrective increment: these tests were written to enforce that production comments correctly
cite and explain the specification nodes they touch -- a documentation convention the project's
own rules have since forbidden outright ("Source carries no comments"). This removes the
enforcement, not any behavior: every criterion, refusal and status this suite otherwise proves
stays proved by the tests that remain.

## Notes

Advisory, from the specification -- no candidate node states anything about the test runner's configured
timeout or about migration replay headroom, so nothing in the candidate set settles whether
vitest-config-migration-replay-headroom.spec.ts's first, purely behavioral test should survive; the human's
own explicit whole-file removal settles it, and the criterion above records that explicitly rather than
silently.
Advisory, from the specification -- deleting domain-depends-on-no-infrastructure-bypass-mention-scan.spec.ts
does not retire the exemption logic it tests: that logic is extracted at runtime from
domain-depends-on-no-infrastructure.spec.ts itself (via the markers "const HTTP_CONNECTOR_MENTION" and
"function everyHttpConnectorMentionIsANodeIdentityCitation"), which this task does not touch, and the
production comment the exemption was written to cover -- in src/investigation/observation-source.port.ts,
citing rules/integration/an-http-connector-configuration-declares-its-call -- also remains, unreached by
this task's own candidates. The convention is retired for the tests removed here, not for that comment or
that scan file; both are out of this task's named scope.
Decision, beyond the covers — stand: rules/integration/an-http-connector-configuration-declares-its-call is
named only as where the still-standing comment this task does not touch cites it, never as a node this
task answers to; growing this epic's claim to cover it would claim a node this comment-removal task has no
criterion reaching.
Advisory, from the specification -- this task implements none of its epic's twenty-six covered nodes.
Each was reached only because a deleted test asserted that a production comment cites it; each states
runtime behavior that the behavioral tests remaining in the same files already prove, untouched by this
task. The epic declares all twenty-six uncovered for that reason.
