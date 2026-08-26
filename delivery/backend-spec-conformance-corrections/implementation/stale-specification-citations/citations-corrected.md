---
title: Stale specification citations corrected across nine locations
summary: Nine comments and one constant's doc comment across nine files now cite the specification nodes
  they discuss as those nodes currently read, replacing readings the two same-day analysis increments
  superseded.
task: sha256:ec621ae0a6c47efa4d2344b4b710bed92429dbe379e851162d60d255f31d99ca
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/stale-specification-citations-citations-corrected-build
files:
- path: src/errors/status-map.ts
  effect: Rewrote the header comment's opening so it no longer claims no specification node fixes a status
    as a decided fact; it now names the two nodes that do — CapabilityIdentityNotFoundError's HTTP 404
    (constraints/the-capability-identity-read-refuses-an-unregistered-identity) and ConnectorConfigurationNotFoundError's
    HTTP 404 (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused) — while
    stating every other entry's status stays this project's own engineering decision.
- path: src/capability-registry/capability-registry.service.ts
  effect: Corrected the comment above readCapabilityByIdentity to state the operation is part of the published
    capability-registry contract (which now names four operations) rather than outside it; corrected the
    pageCountOf comment to cite constraints/listings-are-paged's own statement that a non-positive limit
    never reaches this count, instead of claiming no source states the answer.
- path: src/http/read-capability-by-identity.controller.ts
  effect: Corrected the dependency comment so it no longer implies the read-capability-by-identity operation
    itself is unpublished (only the plain-function wrapper is outside the ICapabilityQuery interface,
    while the operation is one of the contract's four named operations); corrected the transport-status
    comment to state the propagated CapabilityIdentityNotFoundError's HTTP 404 is the specification's
    own decision (constraints/the-capability-identity-read-refuses-an-unregistered-identity), enacted
    rather than chosen by the shared status map.
- path: src/http/read-connector-configuration.controller.ts
  effect: Corrected the transport-status comment to state the propagated ConnectorConfigurationNotFoundError's
    HTTP 404 is the specification's own decision (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused),
    enacted rather than chosen by the shared status map, instead of claiming it was undecided by the specification.
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: Corrected the header (ConnectorConfigurationResolution) comment so its "never an error" claim
    is scoped to readConnectorConfiguration called directly, and now notes the published read-connector-configuration
    route does refuse an unregistered name through readConnectorConfigurationOrThrow (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused);
    corrected the pageCountOf comment the same way as capability-registry.service.ts's.
- path: src/glossary/glossary.service.ts
  effect: Corrected the pageCountOf comment to cite constraints/listings-are-paged; corrected the terms()
    and withNonConclusionOutcomes doc comments to cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    in place of the discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome path
    (merging a duplicate in-paragraph citation in terms() into the one trailing citation).
- path: src/glossary/glossary-store.port.ts
  effect: Corrected insertMissingTerms' doc comment to cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    in place of the discarded task path.
- path: src/persistence/relational-glossary-store.repository.ts
  effect: Corrected all three citations of the discarded task path (the file header, the class doc comment,
    and insertMissingTerms' own method doc comment) to cite rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
    instead.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: Corrected the DEFAULT_STATUS_ENDING comment to state 'unavailable' is the specification's own
    decided default for an unclassified status (rules/integration/an-unclassified-status-ends-unavailable),
    quoting its statement and its "claims the least" rationale, instead of claiming no specification node
    states a default classification.
- path: src/capability-registry/capability.ts
  effect: Corrected REQUIRED_REGISTRATION_ATTRIBUTES' doc comment so the concept field is attributed to
    domain/integration/capability (the aggregate-root that declares it required) rather than to domain/integration/capability-registry
    (the domain-service that only resolves by it).
criteria:
- criterion: The header comment in status-map.ts no longer claims that no specification node fixes a status
    as a decided fact; it states that some domain errors' statuses are now specification-stated while
    others remain the project's own decision.
  met: true
  how: Rewrote src/errors/status-map.ts's opening comment (lines 1-13) to name the two now-specification-stated
    statuses and state every other entry's status remains the project's own decision.
- criterion: The comment above readCapabilityByIdentity in capability-registry.service.ts no longer states
    that the operation is outside the published capability-registry contract.
  met: true
  how: Rewrote the comment to state the operation is part of the published contract, alongside read-capability,
    list-capabilities and register-capability, per contracts/integration/capability-registry's current
    four-operation list.
- criterion: The comments in read-capability-by-identity.controller.ts no longer claim the operation is
    unpublished or that its refusal's transport status is undecided by the specification.
  met: true
  how: Corrected both comments — the dependency comment now states the operation is one of the contract's
    published four rather than implying it was published only "as this route's own fourth operation";
    the transport-status comment now cites constraints/the-capability-identity-read-refuses-an-unregistered-identity
    as the specification's own HTTP 404 decision, which the shared status map enacts.
- criterion: The comment in read-connector-configuration.controller.ts no longer claims the transport
    status of an unregistered-name read is undecided by the specification.
  met: true
  how: Corrected the comment to cite rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
    as the specification's own HTTP 404 decision, which the shared status map enacts rather than chooses.
- criterion: The header comment in connector-configuration-registry.service.ts no longer states that an
    absent connector configuration is never an error.
  met: true
  how: Rewrote the ConnectorConfigurationResolution comment so the "never an error" claim is scoped to
    readConnectorConfiguration called directly, and added that the published read route does refuse an
    unregistered name through readConnectorConfigurationOrThrow, citing the rule that now states so.
- criterion: Each of the three pageCountOf comments, in capability-registry.service.ts, connector-configuration-registry.service.ts
    and glossary.service.ts, no longer claims that no source states what a non-positive limit answers.
  met: true
  how: Rewrote all three comments to cite constraints/listings-are-paged's own statement that no request
    with a non-positive limit reaches the page count, since validation refuses it first, reframing the
    0-branch as a defensive floor for a call the constraint says never happens.
- criterion: The comment above DEFAULT_STATUS_ENDING in http-declarative-observation-source.adapter.ts
    no longer claims that no specification node states a default classification for an unclassified status.
  met: true
  how: Rewrote the comment to state 'unavailable' is rules/integration/an-unclassified-status-ends-unavailable's
    own decided default, quoting its statement and its "claims the least" rationale from its Description.
- criterion: None of the four citations of the discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome
    path remain in glossary-store.port.ts, glossary.service.ts or relational-glossary-store.repository.ts;
    each cites rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead.
  met: true
  how: Replaced every citation of the discarded task path found in these three files (six occurrences
    total across the three — more than the task's own count of four) with rules/glossary/the-non-conclusion-outcomes-precede-the-first-case,
    so none of the discarded path's citations remain anywhere in these files. seed.ts and the spec files
    also cite the discarded path but are not named by this criterion's file list, so they were left untouched.
- criterion: The comment accompanying CAPABILITY_NATURES and REQUIRED_REGISTRATION_ATTRIBUTES in capability.ts
    no longer attributes the concept field to the wrong domain-service.
  met: true
  how: 'CAPABILITY_NATURES'' own comment never mentions the concept field, so the correction lands entirely
    on REQUIRED_REGISTRATION_ATTRIBUTES'' comment, rewritten so the concept field''s requiredness is attributed
    to domain/integration/capability (the aggregate-root that declares "concept ... required: true") rather
    than to domain/integration/capability-registry (the domain-service that only resolves by it once declared).'
nodes:
- node: contracts/integration/capability-registry
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/read-capability-by-identity.controller.ts
  how: Read as currently naming four published operations (read-capability, read-capability-by-identity,
    list-capabilities, register-capability). Corrected two stale comments that had described read-capability-by-identity
    as outside this contract or published only through the route rather than through the contract itself.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  encoded_at:
  - src/errors/status-map.ts
  - src/http/read-capability-by-identity.controller.ts
  how: Cited in status-map.ts's header and read-capability-by-identity.controller.ts's transport-status
    comment as the specification's own decision that this refusal answers HTTP 404 naming CapabilityIdentityNotFoundError
    — correcting comments that had claimed no node fixed this status.
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  encoded_at:
  - src/errors/status-map.ts
  - src/http/read-connector-configuration.controller.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  how: Cited in status-map.ts's header, read-connector-configuration.controller.ts's transport-status
    comment, and connector-configuration-registry.service.ts's header comment as the specification's own
    decision that an unregistered-name read answers HTTP 404 naming ConnectorConfigurationNotFoundError
    — correcting comments that had claimed this status was undecided by the specification, or that an
    absence was never an error.
- node: constraints/listings-are-paged
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/glossary/glossary.service.ts
  how: Cited in all three pageCountOf comments for its own statement that no request with a non-positive
    limit reaches the page count, correcting comments that had claimed no source states what such a limit
    answers.
- node: rules/integration/an-unclassified-status-ends-unavailable
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: Cited above DEFAULT_STATUS_ENDING as the specification's own decided default classification, correcting
    a comment that had claimed no specification node states one.
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
  how: Cited in place of every discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome
    reference found in the three named files, as the node that now states ensuring the two non-conclusion
    outcomes adds only what is missing and never removes an outcome a released case version or hypothesis
    revision names. Per this task's own REMAINDER note, only the citation was swapped — the ensure/never-remove
    behavior itself was already implemented by the prior corrective task and is unchanged here.
- node: domain/integration/capability
  encoded_at:
  - src/capability-registry/capability.ts
  how: Cited in REQUIRED_REGISTRATION_ATTRIBUTES' comment as the aggregate-root that declares concept
    a required attribute, correcting a comment that had attributed that requiredness to domain/integration/capability-registry,
    a domain-service, instead.
inferences:
- inferred: The "header comment" criterion 5 (connector-configuration-registry.service.ts) names is the
    ConnectorConfigurationResolution type's doc comment (the file's first comment block, before the class),
    not the class-level doc comment beneath it — the class-level comment never made the "never an error"
    claim.
  from: Reading both comment blocks in the file; only the type-level one stated the absence is "never
    an error," which is what the criterion describes.
- inferred: Criterion 8 says "four citations" of the discarded task path across the three named files,
    but the three files together hold six (one in glossary-store.port.ts, two in glossary.service.ts,
    three in relational-glossary-store.repository.ts). Replaced all six, satisfying the criterion's core
    requirement ("none of the... citations... remain") regardless of the stated count.
  from: A grep of the three named files for the exact discarded path, cross-checked against the criterion's
    closing clause ("each cites rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead"),
    which requires every citation gone rather than exactly four.
- inferred: '"The wrong domain-service" criterion 9 names is domain/integration/capability-registry (type:
    domain-service), and the correct attribution is domain/integration/capability (type: aggregate-root)
    — read loosely as "domain-service" in the criterion''s own wording rather than the node''s literal
    type field, since domain/integration/capability is explicitly in this task''s own implements list
    and is the node that actually declares concept as a required attribute.'
  from: Reading both nodes' type fields and descriptions, and the task's own implements list naming domain/integration/capability.
- inferred: In glossary.service.ts's terms() doc comment, the discarded task-path citation sat in the
    same sentence as an existing citation of rules/glossary/the-non-conclusion-outcomes-precede-the-first-case;
    rather than citing the same node twice in one comment, the two citations were merged into one trailing
    citation covering both clauses (added-where-missing, and never-delete-or-rewrite), both of which that
    node's statement covers.
  from: Reading the node's statement, which states both facts in one sentence.
preserved:
- 'No behavior changed in any of the nine files: every edit is confined to comments (and one doc-comment-only
  edit in capability.ts) — no function body, signature, control flow, or exported value changed. The already-delivered
  ensure-two-non-conclusion-outcomes behavior (glossary.service.ts''s withNonConclusionOutcomes, glossary-store.port.ts''s
  insertMissingTerms, relational-glossary-store.repository.ts''s insertMissingTerms implementation) is
  unchanged, per this task''s own REMAINDER note scoping criterion 8 to the citation swap alone.'
deferred:
- what: seed.ts and the test files (relational-glossary-store.repository.spec.ts, glossary-query.port.spec.ts,
    glossary.service.spec.ts) also cite the discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome
    path.
  why: Criterion 8 names only glossary-store.port.ts, glossary.service.ts and relational-glossary-store.repository.ts;
    seed.ts and test files sit outside this task's own file list, and correcting tests is the test-author's
    judgment, not this implementer's.
---

## What it is

Nine files' comments or constants are edited to match the specification nodes they discuss, as those nodes currently read.

## Notes

None.
