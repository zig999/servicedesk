---
title: Degrade-unresolved-connector-call-to-unavailable — proof
summary: Tests proving http-declarative-observation-source.adapter.ts's own resolveAssembledRequest degrades
  both typed connector-assembly failures to an unavailable evidence outcome naming the failing class,
  that every other concurrently-collected concept settles unaffected, and that test-connector.controller.ts's
  own two direct resolveConnectorRequest calls still propagate either failure uncaught.
implementation: sha256:e3b156bfc2b0a3c21344c1eaa49ee3a528aa33b91071b14381e2530d62bdf22a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-degrade-unresolved-connector-call-to-unavailable-suite-2
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector
    call embeds a Subject-attribute placeholder the given Subject does not carry
  proves: criterion 1 (subject-attribute variant) — a call embedding an unresolvable Subject-attribute
    placeholder degrades to unavailable naming ConnectorPlaceholderNotResolvedError
  fails_when: resolveAssembledRequest stops catching ConnectorPlaceholderNotResolvedError, or the outcome's
    result_detail names anything other than the raised error's own class name, or an HTTP call is issued
    anyway
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector
    call embeds a credential placeholder naming an environment variable that is not set
  proves: criterion 1 (credential variant) — the same catch degrades a credential-placeholder resolution
    failure identically
  fails_when: the catch only handles the subject-attribute variant of ConnectorPlaceholderNotResolvedError,
    or the credential path still propagates as a rejection
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector
    configuration is missing its address
  proves: criterion 2 — a missing address degrades to unavailable naming IncompleteConnectorCallDescriptorError
  fails_when: resolveAssembledRequest stops catching IncompleteConnectorCallDescriptorError for this condition,
    or the outcome names a different result_detail, or a call is issued
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector
    configuration declares headers as an object whose own value is not a string
  proves: criterion 3 (headers variant) — malformed headers degrade to unavailable naming IncompleteConnectorCallDescriptorError
  fails_when: a non-string headers value no longer throws IncompleteConnectorCallDescriptorError, or the
    throw is no longer caught and degraded
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector
    configuration declares query as something other than an object of string values
  proves: criterion 3 (query variant) — a non-object query degrades identically
  fails_when: a malformed query no longer triggers the refusal, or the refusal is no longer caught and
    degraded
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector
    configuration embeds a placeholder naming a kind this connector does not recognize
  proves: criterion 4 (unrecognized kind variant)
  fails_when: an unrecognized placeholder kind no longer throws, or the throw is no longer caught and
    degraded
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector
    configuration embeds a subject placeholder naming no attribute at all
  proves: criterion 4 (missing-argument variant)
  fails_when: a bare '${subject}' placeholder no longer throws, or the throw is no longer caught and degraded
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: proceeds with every other concept unaffected — settling to its own ok ending — when one concept
    collected in the same Promise.all batch degrades to unavailable through this catch
  proves: criterion 5 — one concept's degrade to unavailable does not affect a concurrently observed concept's
    own ok ending
  fails_when: the degrading concept's rejection propagates and rejects the sibling's own Promise.all-collected
    outcome, or the healthy concept's own call is skipped or its own result altered
- file: src/__tests__/unit/http/test-connector.controller.spec.ts
  name: propagates ConnectorPlaceholderNotResolvedError uncaught, issuing no HTTP call, when the named
    connector configuration embeds a Subject-attribute placeholder the given Subject does not carry
  proves: criterion 6 (placeholder variant) — test-connector's own direct resolveConnectorRequest call
    is left untouched by this fix
  fails_when: handleTestConnectorRequest starts catching this error and resolving instead of rejecting,
    or the HTTP client is reached before the rejection
- file: src/__tests__/unit/http/test-connector.controller.spec.ts
  name: propagates IncompleteConnectorCallDescriptorError uncaught, issuing no HTTP call, when the named
    connector configuration is missing its address
  proves: criterion 6 (descriptor-shape variant)
  fails_when: handleTestConnectorRequest starts catching this error, or the HTTP client is reached before
    the rejection
not_applicable:
- edge_case: Range boundaries, empty-collection and duplicate-uniqueness edge cases
  why: none of this task's criteria state a range, a collection cardinality, or a uniqueness constraint
    — there is nothing of that shape to exercise
- edge_case: A slow or hung dependency
  why: the timeout and budget-clamp behaviors this task does not touch are already proven by the pre-existing
    suite in the same file; this task changes no timing behavior
- edge_case: Two operations against one subject at once, beyond what criterion 5 already requires
  why: the criterion-5 test above is exactly this case (two concurrent observeConcept calls against the
    same adapter instance), so no separate test is owed
untested:
- 'The credential variant of ConnectorPlaceholderNotResolvedError triggered by an environment variable
  set to the empty string, rather than unset entirely: both trigger the identical error class through
  the identical catch clause already proven by the two placeholder tests above, and the distinction between
  ''unset'' and ''set empty'' is connector-request-resolver.ts''s own pre-existing behavior, already proven
  directly in connector-request-resolver.spec.ts. No criterion of this task turns on which of the two
  triggered the class.'
- 'An empty-string address (as opposed to a missing address key) as an alternate trigger of IncompleteConnectorCallDescriptorError
  for criterion 2: both paths through descriptorProblems raise the identical error class caught by the
  identical clause already proven by the missing-address test above; the two are not two distinct behaviors
  of this task''s own catch.'
---

## What it is
Tests proving the wrapped resolveConnectorRequest call inside observeConcept degrades every typed connector-assembly failure to an unavailable evidence outcome naming the failing error class, that a degrading concept never affects a sibling concept's own concurrent collection, and that test-connector's own direct call keeps propagating either failure uncaught.

## Notes
Two red suite attempts preceded this one. The first (run/connector-configuration-and-placeholder-contract-degrade-unresolved-connector-call-to-unavailable-suite) failed on two independent findings: `domain-depends-on-no-infrastructure.spec.ts`'s own check for imports of the connector-request-resolver's two error classes was missing the same adapter exemption its sibling check already carried (cause: test, on a test owned by task/http-observation-runtime/descriptor-placeholder-resolver, whose work root work/http-connector-adapter is closed — the human explicitly authorized a direct, minimal fix mirroring the existing exemption); and `anthropic-hypothesis-evaluator.adapter.spec.ts`'s own real-clock threshold flaked by one millisecond of scheduler jitter (cause: setup, unrelated to this task's files). The second attempt passed.
