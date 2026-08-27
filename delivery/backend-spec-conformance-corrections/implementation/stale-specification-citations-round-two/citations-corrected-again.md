---
title: Six stale citations corrected, round two
summary: Six comments and docstrings across six files now reflect or cite the five specification nodes
  they discuss as those nodes currently read, with no behavior change.
task: sha256:70fd20a9f49b21ee4738cfde34099b5acadc871772519d42ded63c7d4ec3ad03
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/stale-specification-citations-round-two-citations-corrected-again-build
files:
- path: src/errors/status-map.ts
  effect: the header comment's opening paragraph now names ConnectorConfigurationNotWellFormedError's
    HTTP 422 as a third specification-fixed status alongside the existing two (CapabilityIdentityNotFoundError's
    and ConnectorConfigurationNotFoundError's 404s), citing rules/integration/a-connector-configuration-holds-a-well-formed-object
    and quoting its own statement, consistent with the [ConnectorConfigurationNotWellFormedError, 422]
    map entry a few lines below; the table itself, statusForError() and every other line are untouched
- path: src/investigation/fake-observation-source.adapter.ts
  effect: both observeConcept()'s docstring and the class-level doc comment above FakeObservationSource
    now cite domain/investigation/evidence-result by identity and name its four values (ok, unavailable,
    denied, timeout) instead of describing them as "one of the four evidence-result endings" with no
    citation — the class-level comment was found still carrying the uncited phrase by a red suite run
    (run/stale-specification-citations-round-two-citations-corrected-again-suite, diagnosed as a code
    cause) and corrected in a follow-up delegation; the function's own behavior is untouched throughout
- path: src/glossary/glossary-store.port.ts
  effect: readConcepts()'s docstring now cites rules/knowledge/a-collected-concept-declares-a-ttl for
    the "ttl absent where the registration stated none" claim, and states that no default is resolved
    on the store's behalf; the interface's own shape is untouched
- path: src/capability-registry/capability-registry.service.ts
  effect: 'refuseContractDepartures'' docstring now describes both timeout boundaries the schema refuses
    — non-integer and zero-or-less — quoting rules/integration/a-capability-declares-its-contract''s own
    "a timeout of zero or less bounds nothing" clause, and cites the schema''s actual shape, timeout:
    z.number().int().positive(), rather than z.number().int() alone; the function''s own behavior is untouched'
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: wellFormedConfiguration's docstring no longer claims the node leaves an entirely absent configuration's
    classification undecided; it now states the node's own decided classification — refused as incomplete
    (IncompleteConnectorConfigurationError), distinct from a present value that fails well-formedness;
    the function's own behavior (already refusing absence as incomplete via the fall-through into refuseRegistrationDepartures)
    is untouched
- path: src/http/test-connector.controller.ts
  effect: the header comment's masking paragraph now cites rules/integration/a-diagnostic-response-masks-a-resolved-credential
    by identity and quotes its own statement, instead of describing the masking as "this controller's
    own inference over an otherwise-silent point" with no specification node stating it; the masking behavior
    itself (the second resolveConnectorRequest call with a redacting env) is untouched
criteria:
- criterion: The header comment in status-map.ts no longer describes ConnectorConfigurationNotWellFormedError's
    422 status as this project's own engineering decision; it states, consistently with the map entry
    a few lines below it, that this status is a fact rules/integration/a-connector-configuration-holds-a-well-formed-object
    decides.
  met: true
  how: the opening paragraph (lines 1-16) now lists ConnectorConfigurationNotWellFormedError's HTTP 422
    as a third specification-fixed status, citing rules/integration/a-connector-configuration-holds-a-well-formed-object
    and quoting its own '...with an HTTP 422 response reporting a ConnectorConfigurationNotWellFormedError';
    the 'while every other entry's status stays this project's own engineering decision' clause now excludes
    it, matching the [ConnectorConfigurationNotWellFormedError, 422] map entry at line ~111
- criterion: The observeConcept() docstring in fake-observation-source.adapter.ts no longer types the
    four evidence-result endings as unattributed prose; it cites domain/investigation/evidence-result
    by identity.
  met: true
  how: the docstring now reads 'one of the four endings domain/investigation/evidence-result enumerates
    (ok, unavailable, denied, timeout)' instead of 'one of the four evidence-result endings'
- criterion: The readConcepts() docstring in glossary-store.port.ts no longer states the ttl-absent claim
    without attribution; it cites rules/knowledge/a-collected-concept-declares-a-ttl by identity.
  met: true
  how: the docstring now reads '...ttl absent where the registration stated none (rules/knowledge/a-collected-concept-declares-a-ttl),
    as read, with no default resolved on its behalf'
- criterion: The refuseContractDepartures docstring in capability-registry.service.ts describes both the
    non-integer and the non-positive timeout boundaries, and no longer cites the schema as z.number().int()
    alone.
  met: true
  how: 'the docstring now describes ''not an integer count of milliseconds, or an integer that is zero
    or less'', quotes the node''s own ''a timeout of zero or less bounds nothing...'' clause, and names
    the schema as registerCapabilityBodySchema''s own timeout: z.number().int().positive() — verified
    against register-capability.dto.ts line 76, which already declares that exact shape'
- criterion: The wellFormedConfiguration docstring in connector-configuration-registry.service.ts no longer
    states that the specification does not decide whether an absent configuration is malformed or incomplete;
    it states the decided classification.
  met: true
  how: 'the docstring''s closing sentence now reads ''the node decides that classification explicitly:
    a registration whose configuration is entirely absent is refused as incomplete (IncompleteConnectorConfigurationError),
    distinct from a present value that fails the well-formedness check above, the same distinction the
    node draws for the connector name'' — replacing the prior ''the node does not clearly decide...''
    claim'
- criterion: The header comment in test-connector.controller.ts no longer describes the credential masking
    as this controller's own inference with no specification node stating it; it cites rules/integration/a-diagnostic-response-masks-a-resolved-credential
    by identity.
  met: true
  how: the masking paragraph now cites rules/integration/a-diagnostic-response-masks-a-resolved-credential,
    quotes its own statement, and states that the project's standard (SEC-03, SEC-04) forbids the same
    thing independently, rather than framing the masking as the controller's own unattributed inference
nodes:
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/errors/status-map.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  how: this task did not change the behavior encoding this node — status-map.ts's STATUS_BY_ERROR_CLASS
    entry and connector-configuration-registry.service.ts's wellFormedConfiguration/textConfigurationOrThrow
    already enforce the not-well-formed-vs-incomplete distinction and the 422 status the node states —
    it corrected the surrounding prose in both files to cite the node and quote its statement instead
    of misattributing the 422 as an engineering decision or leaving the absent-configuration classification
    as undecided
- node: domain/investigation/evidence-result
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  how: the node's four-value enumeration is defined in observation-source.port.ts's ObservationOutcome
    type, outside this task's reach; this task corrected two locations in fake-observation-source.adapter.ts
    that described the ending set in unattributed prose — observeConcept()'s own docstring, and the
    class-level doc comment above FakeObservationSource — to cite the node by identity in both
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  how: the sixty-second default this node states is resolved by the glossary service, outside this task's
    reach; this task only corrected glossary-store.port.ts's readConcepts() docstring, which stated the
    ttl-absent-on-read claim without attribution, to cite the node by identity
- node: rules/integration/a-capability-declares-its-contract
  how: 'the non-integer and non-positive timeout refusals this node states are enforced by registerCapabilityBodySchema''s
    timeout: z.number().int().positive() in register-capability.dto.ts, unchanged and outside this task''s
    reach; this task only corrected capability-registry.service.ts''s refuseContractDepartures docstring,
    which named the schema as z.number().int() alone and described only the non-integer boundary, to describe
    both boundaries and the schema''s actual shape'
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  encoded_at:
  - src/http/test-connector.controller.ts
  how: the masking behavior this node states — a second resolveConnectorRequest call with a redacting
    environment substitute so the echoed request never carries a credential's real value — is already
    implemented in handleTestConnectorRequest in this same file; this task corrected the header comment,
    which described that behavior as the controller's own unattributed inference, to cite the node by
    identity and quote its statement
---

## What it is

Six comments/docstrings edited to cite or reflect the five specification nodes they discuss, as those nodes currently read.
No behavior changed in any of the six files.

## Notes

The first suite run (run/stale-specification-citations-round-two-citations-corrected-again-suite)
failed one test: fake-observation-source.adapter.ts's class-level doc comment still carried the
uncited "one of the four evidence-result endings" phrase criterion 2 forbids, in a second location
the first pass missed. Diagnosed cause: code. Corrected in a follow-up delegation; the suite ran
again under -suite-2.
