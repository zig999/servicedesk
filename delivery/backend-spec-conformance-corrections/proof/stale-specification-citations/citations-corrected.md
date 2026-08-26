---
title: Stale specification citations corrected — nine locations
summary: Each of the nine touched files is read from disk and its comment text is asserted to no longer
  carry the superseded reading and to carry the corrected specification citation instead.
implementation: sha256:59865167c18a63e2bf291d5749e2f78953522769563a558640c3c89d29152e98
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/stale-specification-citations-citations-corrected-suite
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header comment names the two specification nodes that now fix a status as a decided fact,
    rather than claiming no node does
  proves: The header comment in status-map.ts no longer claims that no specification node fixes a status
    as a decided fact; it states that some domain errors' statuses are now specification-stated while
    others remain the project's own decision.
  fails_when: the header is reverted to a phrase matching /no specification node/i, or drops either node
    citation, or drops the "every other entry's status stays this project's own engineering decision"
    statement
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: readCapabilityByIdentity's own comment states the operation is part of the published capability-registry
    contract, not outside it (criterion 2)
  proves: The comment above readCapabilityByIdentity in capability-registry.service.ts no longer states
    that the operation is outside the published capability-registry contract.
  fails_when: the comment matches /outside (the|this) (published )?capability-registry contract/i, or
    drops the "Part of the published capability-registry contract alongside read-capability, by concept,
    list-capabilities and register-capability" statement
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: pageCountOf's own comment cites constraints/listings-are-paged's own statement that a non-positive
    limit never reaches this count, rather than claiming no source states the answer (criterion 6)
  proves: Each of the three pageCountOf comments ... no longer claims that no source states what a non-positive
    limit answers. (this file's own instance)
  fails_when: the comment matches /no source states/i, or drops the constraints/listings-are-paged citation
    or its quoted "no request with a non-positive limit reaches the count..." statement
- file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  name: the dependency comment states read-capability-by-identity is one of the published capability-registry
    contract's four operations, not a wrapper standing outside it
  proves: The comments in read-capability-by-identity.controller.ts no longer claim the operation is unpublished...
  fails_when: the comment matches /outside (the|this) (published )?capability-registry contract/i, or
    drops "though the operation it serves is" / the four-operation contract citation
- file: src/__tests__/unit/http/read-capability-by-identity.controller.spec.ts
  name: the transport-status comment cites constraints/the-capability-identity-read-refuses-an-unregistered-identity
    as the specification's own HTTP 404 decision, rather than claiming it undecided
  proves: The comments in read-capability-by-identity.controller.ts no longer claim ... its refusal's
    transport status is undecided by the specification.
  fails_when: the comment matches /undecided by the specification/i, or drops the constraint citation
    or the "is where that decision is enacted rather than chosen inline" statement
- file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  name: the transport-status comment cites rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
    as the specification's own HTTP 404 decision, rather than claiming it undecided
  proves: The comment in read-connector-configuration.controller.ts no longer claims the transport status
    of an unregistered-name read is undecided by the specification.
  fails_when: the comment matches /undecided by the specification/i, or drops the rule citation or the
    "is where that decision is enacted rather than chosen inline" statement
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: ConnectorConfigurationResolution's own comment scopes its 'never an error' claim to readConnectorConfiguration
    called directly, and states the published route does refuse an unregistered name (criterion 5)
  proves: The header comment in connector-configuration-registry.service.ts no longer states that an absent
    connector configuration is never an error.
  fails_when: the comment drops "never a thrown error from this method itself" or the added sentence stating
    the published route refuses an unregistered name through readConnectorConfigurationOrThrow, citing
    the rule
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: pageCountOf's own comment cites constraints/listings-are-paged's own statement that a non-positive
    limit never reaches this count, rather than claiming no source states the answer (criterion 6)
  proves: Each of the three pageCountOf comments ... no longer claims that no source states what a non-positive
    limit answers. (this file's own instance)
  fails_when: the comment matches /no source states/i, or drops the constraints/listings-are-paged citation
    or its quoted statement
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: pageCountOf's own comment cites constraints/listings-are-paged's own statement that a non-positive
    limit never reaches this count, rather than claiming no source states the answer (criterion 6)
  proves: Each of the three pageCountOf comments ... no longer claims that no source states what a non-positive
    limit answers. (this file's own instance)
  fails_when: the comment matches /no source states/i, or drops the constraints/listings-are-paged citation
    or its quoted statement
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: no longer cites the discarded ensure-non-conclusion-outcomes-hotfix task path — terms()' and withNonConclusionOutcomes'
    own doc comments both cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead
    (criterion 8)
  proves: None of the four citations of the discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome
    path remain in ... glossary.service.ts ...; each cites rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    instead.
  fails_when: the discarded task path string reappears anywhere in the file, or fewer than two occurrences
    of the correct citation remain
- file: src/__tests__/unit/glossary/glossary-store.port.spec.ts
  name: no longer cites the discarded ensure-non-conclusion-outcomes-hotfix task path, citing rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    instead
  proves: None of the four citations ... remain in glossary-store.port.ts ...; each cites rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    instead.
  fails_when: the discarded task path string reappears in the file, or the correct citation is absent
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: no longer cites the discarded ensure-non-conclusion-outcomes-hotfix task path anywhere — the file
    header, the class doc comment and insertMissingTerms' own doc comment all cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    instead
  proves: None of the four citations ... remain in ... relational-glossary-store.repository.ts; each cites
    rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead.
  fails_when: the discarded task path string reappears anywhere in the file, or fewer than three occurrences
    of the correct citation remain
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: DEFAULT_STATUS_ENDING's own comment cites rules/integration/an-unclassified-status-ends-unavailable
    as the specification's own decided default, quoting its 'claims the least' rationale, rather than
    claiming no node states one
  proves: The comment above DEFAULT_STATUS_ENDING in http-declarative-observation-source.adapter.ts no
    longer claims that no specification node states a default classification for an unclassified status.
  fails_when: the comment matches /no specification node states/i, or drops the rule citation or the quoted
    "claims the least" rationale
- file: src/__tests__/unit/capability-registry/capability.spec.ts
  name: attributes the concept field's requiredness to domain/integration/capability, explicitly disclaiming
    domain/integration/capability-registry
  proves: The comment accompanying CAPABILITY_NATURES and REQUIRED_REGISTRATION_ATTRIBUTES in capability.ts
    no longer attributes the concept field to the wrong domain-service.
  fails_when: the comment drops the domain/integration/capability citation for concept's requiredness,
    or drops the explicit disclaimer that this is not a fact of domain/integration/capability-registry
untested:
- 'seed.ts and three existing spec files (relational-glossary-store.repository.spec.ts''s own integration
  sibling, glossary-query.port.spec.ts, glossary.service.spec.ts''s own pre-existing helper comment) still
  cite the discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome path. This
  is outside this task''s own criterion-8 file list (glossary-store.port.ts, glossary.service.ts, relational-glossary-store.repository.ts
  only) and outside this proof''s scope: the implementation record''s own `deferred` entry already names
  it and defers the decision to the test-author, and correcting a stale citation inside another test file''s
  own doc comment is not something a test can prove — it is a direct edit nothing here performs.'
---

## What it is

Ten tests, each reading a corrected file's actual comment text from disk, assert the superseded reading is gone and the corrected specification citation is present, for all nine touched locations.

## Notes

None.
