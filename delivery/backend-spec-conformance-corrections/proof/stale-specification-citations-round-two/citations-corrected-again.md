---
title: Citations corrected, round two — comment-content proofs
summary: Six file-content tests, one per criterion, pin each corrected comment or docstring's exact citation
  text against the specification node it now names, following this codebase's own established convention
  for this exact criterion shape (read source, normalize comment prose, assert the citation and quote
  survive).
implementation: sha256:dd835e7792683a92ac5cf142804e7dd6ad9a4e7e6ba461cb1d0d2ad28d7e0c0b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/stale-specification-citations-round-two-citations-corrected-again-suite-3
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header comment names three specification nodes that now fix a status as a decided fact, and
    states ConnectorConfigurationNotWellFormedError's 422 as a fact rules/integration/a-connector-configuration-holds-a-well-formed-object
    decides rather than as this project's own engineering decision
  proves: The header comment in status-map.ts no longer describes ConnectorConfigurationNotWellFormedError's
    422 status as this project's own engineering decision; it states, consistently with the map entry
    a few lines below it, that this status is a fact rules/integration/a-connector-configuration-holds-a-well-formed-object
    decides.
  fails_when: the header reverts to naming only two specification-fixed statuses, drops ConnectorConfigurationNotWellFormedError's
    own node citation or its quoted "with an HTTP 422 response reporting a ConnectorConfigurationNotWellFormedError"
    clause, or the "every other entry's status stays this project's own engineering decision" framing
    is removed or widened to cover this entry again.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header comment names the two specification nodes that now fix a status as a decided fact,
    rather than claiming no node does
  proves: keeps task/stale-specification-citations/citations-corrected's own round-one criterion-1 proof
    accurate after this task added a third specification-fixed status to the same header paragraph — the
    prior hard-coded "two specification nodes" substring is no longer true text and was dropped from this
    pre-existing assertion, while every other still-true assertion of it is kept unchanged.
  fails_when: the header stops naming either of the two round-one nodes (constraints/the-capability-identity-read-refuses-an-unregistered-identity,
    rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused), reintroduces
    the phrase "no specification node", or drops the "every other entry's status stays this project's
    own engineering decision" framing.
- file: src/__tests__/unit/investigation/fake-observation-source.adapter.spec.ts
  name: observeConcept's own doc comment cites domain/investigation/evidence-result for the four endings
    it names, rather than typing them as unattributed prose
  proves: The observeConcept() docstring in fake-observation-source.adapter.ts no longer types the four
    evidence-result endings as unattributed prose; it cites domain/investigation/evidence-result by identity.
  fails_when: the docstring reverts to "one of the four evidence-result endings" with no citation, or
    drops the domain/investigation/evidence-result identity or any of the four named values (ok, unavailable,
    denied, timeout).
- file: src/__tests__/unit/glossary/glossary-store.port.spec.ts
  name: readConcepts' own doc comment cites rules/knowledge/a-collected-concept-declares-a-ttl for the
    ttl-absent-on-read claim, rather than stating it without attribution
  proves: The readConcepts() docstring in glossary-store.port.ts no longer states the ttl-absent claim
    without attribution; it cites rules/knowledge/a-collected-concept-declares-a-ttl by identity.
  fails_when: the docstring drops the rules/knowledge/a-collected-concept-declares-a-ttl citation or the
    "no default resolved on its behalf" qualifier that scopes the claim to this read.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuseContractDepartures' own doc comment describes both the non-integer and the non-positive
    timeout boundaries, and cites the schema's actual shape rather than z.number().int() alone
  proves: The refuseContractDepartures docstring in capability-registry.service.ts describes both the
    non-integer and the non-positive timeout boundaries, and no longer cites the schema as z.number().int()
    alone.
  fails_when: the docstring stops describing the "zero or less" boundary, stops quoting the node's own
    "a timeout of zero or less bounds nothing" clause, or reverts to citing the schema as z.number().int()
    alone rather than z.number().int().positive().
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: wellFormedConfiguration's own doc comment states the node's own decided classification for an
    entirely absent configuration, rather than claiming the specification leaves it undecided
  proves: The wellFormedConfiguration docstring in connector-configuration-registry.service.ts no longer
    states that the specification does not decide whether an absent configuration is malformed or incomplete;
    it states the decided classification.
  fails_when: the docstring reverts to claiming the node "does not clearly decide" an absent configuration's
    classification, or drops the stated incomplete-vs-not-well-formed distinction (IncompleteConnectorConfigurationError
    for absence, distinct from a present value failing well-formedness).
- file: src/__tests__/unit/http/test-connector.controller.spec.ts
  name: the header comment's masking paragraph cites rules/integration/a-diagnostic-response-masks-a-resolved-credential,
    rather than framing the masking as this controller's own unattributed inference
  proves: The header comment in test-connector.controller.ts no longer describes the credential masking
    as this controller's own inference with no specification node stating it; it cites rules/integration/a-diagnostic-response-masks-a-resolved-credential
    by identity.
  fails_when: the header comment reverts to describing the masking as this controller's own unattributed
    inference, or drops the node's own quoted "a connector configuration's diagnostic call masks whatever
    value a credential placeholder in its own call resolves to..." statement.
not_applicable:
- edge_case: absent or empty input to any of the six touched operations
  why: this task edits comment and docstring text only in six files; none of the six touched functions'
    input handling changed (confirmed against the implementation record's own files/effects and by reading
    each file directly), so no new input-handling behavior exists for this edge case to be raised against.
- edge_case: a boundary at either end of a stated range
  why: no numeric or size boundary changed in any of the six files — the timeout boundaries capability-registry.service.ts's
    docstring now describes were already enforced by registerCapabilityBodySchema before this task and
    are unchanged by it.
- edge_case: a duplicate where uniqueness is claimed
  why: none of the six edits touches identity, registration or uniqueness handling; the connector-configuration
    and capability registries' own replace-by-identity behavior is untouched.
- edge_case: an operation against state that forbids it
  why: no refusal condition or state check changed in any of the six files; the incomplete-vs-not-well-formed
    classification connector-configuration-registry.service.ts's docstring now states was already the
    code's behavior before this task.
- edge_case: a dependency that fails or answers slowly
  why: none of the six files' calls to a store, the network, or another module changed; this task touches
    no dependency wiring or error handling.
- edge_case: two operations against one subject at once
  why: no concurrency-relevant code changed; the six edits are comment and docstring text only.
untested:
- 'Whether each cited specification node''s own text actually substantiates the quote its corrected comment
  now carries. Verified by hand while authoring this proof — rules/integration/a-connector-configuration-holds-a-well-formed-object,
  domain/investigation/evidence-result, rules/knowledge/a-collected-concept-declares-a-ttl, rules/integration/a-capability-declares-its-contract
  and rules/integration/a-diagnostic-response-masks-a-resolved-credential were all read at knowledge/
  and each substantiates the quote beside its citation — but no test in this proof asserts that link mechanically:
  no test in this suite reads from the specification root, and introducing that convention unilaterally
  here would reach past what this task''s criteria state.'
- The pre-existing test comment at src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  (around the 'refuses a registration whose configuration value is entirely undeclared' test) still reads
  '...does not clearly decide what an entirely absent configuration answers', which is now stale given
  criterion 5's own correction to wellFormedConfiguration's docstring. That comment sits in a file this
  task's implementation does not touch and traces to a different task's own criterion (task/connector-configuration-registration-conformance/malformed-object-classification);
  this proof leaves it uncorrected.
- Whether the six comments read coherently as prose beyond the specific spans asserted here. A rewrite
  that reordered or paraphrased the surrounding sentences while preserving every substring this proof
  checks for would not be caught — these tests pin the cited node identity and the quoted clause exactly,
  not the comment's fuller meaning.
---

## What it is

Seven unit tests (two for status-map.ts, one each for the other five files) pinning the exact citation text each corrected comment now carries.

## Notes

The first suite attempt (run/stale-specification-citations-round-two-citations-corrected-again-suite) failed one test: fake-observation-source.adapter.ts still carried the uncited phrase in a second, class-level doc comment the first implementation pass missed. Diagnosed as a code cause; corrected, and the suite ran again.
The second suite attempt (-suite-2) failed on an unrelated integration test (relational-case-store.repository.spec.ts, a database connection-pool hook timing out) in a file this delivery never touches. Diagnosed as a setup cause; the suite ran a third time and passed clean.
