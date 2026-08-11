---
title: Fixture case, its glossary, its capabilities and its canned observations
summary: One fictitious "intermittent-connection-outage" case, valid against every current knowledge rule,
  ships with the glossary vocabulary, capability registrations and canned per-concept observations its
  two hypotheses need to run the whole diagnose pipeline without a live corporate-records connection.
task: sha256:d938b5841c25bd809c67cfa59f3eae16a3b653311cd2893dd553d456d2e03650
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-fixture-author-diagnose-fixture-case-build
files:
- path: src/fixtures/case/intermittent-connection-outage/1.json
  effect: the one fictitious case document — two hypotheses (customer-equipment-fault, area-network-outage),
    each with a single-sentence falsifiable criterion, one collected concept and its own resolution, plus
    a fallback resolution distinct from both and an explicit "formal" consolidation register; stored as
    the one plain JSON document the case-reading path (parseCaseDocument/validateCaseCoherence) reads
    whole
- path: src/fixtures/glossary/subject-type.json
  effect: declares the one subject type the case names — "contract"
- path: src/fixtures/glossary/concept.json
  effect: declares the two concepts the case's hypotheses collect (equipment-status, network-outage-flag),
    each accepting "contract" and each stating its own explicit ttl
- path: src/fixtures/glossary/outcome.json
  effect: declares the case's two conclusive outcomes plus both non-conclusion outcomes (inconclusive-no-data,
    inconclusive-hypotheses-exhausted)
- path: src/fixtures/glossary/action.json
  effect: declares the three actions every referral in the fixture case names
- path: src/fixtures/glossary/recipient.json
  effect: declares the three recipients every referral in the fixture case names
- path: src/fixtures/capability/capability.json
  effect: registers one read-only capability per collected concept, each declaring its whole contract
    (name, version, nature, both schemas, timeout in milliseconds, connector) and the concept it answers
- path: src/fixtures/observations.json
  effect: one canned observation outcome per collected concept, keyed by concept name and shaped exactly
    as the observation-source port's own ObservationOutcome, usable to seed a stand-in observation source
    without any corporate-system vocabulary crossing in
criteria:
- criterion: The case document validates without a coherence violation when read through the knowledge
    context's own case-reading path against the fixture's own glossary and capability data.
  met: true
  how: 'traced by hand against parseCaseDocument''s structural checks and caseCoherenceViolations''s three
    passes over the exact fixture data: every required attribute is declared and non-empty, both hypotheses
    carry distinct names, and every named subject type, outcome, action, recipient and concept resolves
    against the fixture''s own glossary/capability files with no gap'
- criterion: The case declares at least one hypothesis, each with a non-empty criterion stating exactly
    one falsifiable claim, at least one collected concept, and a resolution pairing one outcome with one
    referral.
  met: true
  how: the case declares two hypotheses; each carries a single-sentence, non-empty criterion, collects
    exactly one concept, and a resolution pairing one outcome with one referral
- criterion: No two of the case's own hypotheses share a name, and the case's declared order is stated
    as its own precedence.
  met: true
  how: the two hypothesis names are distinct; the declared array order is the authored precedence resolveOutcome
    consumes unchanged
- criterion: Every subject type, concept, outcome, action and recipient the case and its hypotheses name
    exists in the fixture's own glossary vocabulary files, and the glossary's outcome vocabulary also
    carries the two non-conclusion outcomes.
  met: true
  how: every term the case names is declared in the matching glossary vocabulary file, and outcome.json
    additionally carries both non-conclusion outcomes
- criterion: Every concept the case's hypotheses collect accepts the case's own declared subject type
    and has a registered read-only capability declaring an output schema and a timeout; at least one concept's
    registration states an explicit ttl.
  met: true
  how: 'both concepts declare accepts: ["contract"], matching the case''s declared subject; capability.json
    registers one read-only capability per concept with a non-empty output_schema and an integer timeout;
    both concepts also state an explicit ttl'
- criterion: The case's fallback declares its own resolution, distinct from any hypothesis's own.
  met: true
  how: the fallback's outcome and referral share no value with either hypothesis's resolution
- criterion: The case declares an explicit consolidation register (formal or plain) rather than leaving
    it undeclared.
  met: true
  how: 'consolidation_register: "formal" is declared explicitly'
- criterion: The case document is stored as one plain JSON document at <directory>/<slug>/1.json, its
    slug equal to the file's own name.
  met: true
  how: the document sits at src/fixtures/case/intermittent-connection-outage/1.json, and its own slug
    field equals the containing directory name
- criterion: For every concept the case's hypotheses collect, a canned observation outcome exists, usable
    to seed a stand-in observation source so the whole pipeline can run against this case without a live
    corporate-records connection.
  met: true
  how: observations.json carries one entry per collected concept, each an 'ok' evidence-result plus a
    glossary-vocabulary observation string — the exact shape FakeObservationSource.seed() expects
nodes:
- node: domain/knowledge/case
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the fixture case document instantiates every declared attribute of the aggregate plus the composed
    hypotheses, in the case's own declared order
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: each of the two hypotheses carries name, criterion, collects and resolution, named uniquely within
    the case
- node: domain/knowledge/resolution
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: every declared position — both hypotheses and the fallback — pairs exactly one outcome with one
    referral
- node: domain/knowledge/referral
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: every referral names exactly one action and one recipient, both drawn from the glossary
- node: domain/knowledge/consolidation-register
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the case declares consolidation_register explicitly as "formal"
- node: constraints/a-case-is-stored-as-one-json-document
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the whole aggregate travels inside this one JSON document; no second store holds any part of it
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the case declares two hypotheses
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  encoded_at:
  - src/fixtures/glossary/concept.json
  how: both collected concepts state an explicit ttl, so the registration's own default-of-sixty clause
    is never exercised here
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/fixtures/glossary/concept.json
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: both concepts' accepts array includes "contract", the case's own declared subject
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: each hypothesis collects exactly one concept
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: each hypothesis's criterion is a non-empty, one-sentence string
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the two hypothesis names are distinct
- node: rules/knowledge/case-terms-exist-in-the-glossary
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  - src/fixtures/glossary/subject-type.json
  - src/fixtures/glossary/outcome.json
  - src/fixtures/glossary/action.json
  - src/fixtures/glossary/recipient.json
  how: every subject type, outcome, action and recipient the case names is declared, spelled identically,
    in the matching glossary vocabulary file
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  encoded_at:
  - src/fixtures/capability/capability.json
  how: capability.json registers one read-only capability per collected concept, each declaring a non-empty
    output_schema and an integer timeout
- node: rules/knowledge/every-position-declares-a-resolution
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: both hypotheses and the fallback each declare an outcome and a referral together
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the declared array order is the authored curator precedence resolveOutcome consumes unchanged
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: each hypothesis's criterion states exactly one falsifiable claim in one sentence
- node: rules/knowledge/the-slug-matches-the-file-name
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
  how: the document's slug equals the directory name it sits under
- node: domain/glossary/subject-type
  encoded_at:
  - src/fixtures/glossary/subject-type.json
  how: declares the one subject kind the case examines — "contract" — exactly once
- node: domain/glossary/concept
  encoded_at:
  - src/fixtures/glossary/concept.json
  how: declares two concepts, each with its name, its accepted subject types and its ttl in seconds
- node: domain/glossary/outcome
  encoded_at:
  - src/fixtures/glossary/outcome.json
  how: declares the case's two conclusive outcomes plus the two non-conclusion outcomes
- node: domain/glossary/action
  encoded_at:
  - src/fixtures/glossary/action.json
  how: declares the three actions every referral in the fixture case names
- node: domain/glossary/recipient
  encoded_at:
  - src/fixtures/glossary/recipient.json
  how: declares the three recipients every referral in the fixture case names
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  encoded_at:
  - src/fixtures/glossary/outcome.json
  how: the two non-conclusion outcomes are checked in directly in the outcome vocabulary file, ahead of
    any read of this fixture case
- node: domain/integration/capability
  encoded_at:
  - src/fixtures/capability/capability.json
  how: each of the two capabilities declares its whole contract completely — name, version, nature, both
    schemas, timeout, connector — plus the concept it answers
- node: domain/integration/capability-registry
  how: 'honored as data, not encoded: this task writes no registry code; the two registrations each answer
    a distinct concept, so the registry''s own one-to-one concept lookup resolves cleanly for both'
- node: domain/integration/capability-nature
  encoded_at:
  - src/fixtures/capability/capability.json
  how: both capabilities declare nature "read-only"
- node: contracts/investigation/observation-source
  encoded_at:
  - src/fixtures/observations.json
  how: the canned entries are shaped exactly as this contract's own ObservationOutcome, one per collected
    concept; no port or adapter code is touched by this task
- node: contracts/integration/corporate-records-source
  encoded_at:
  - src/fixtures/observations.json
  how: the canned observations are keyed by concept name and an evidence-result status alone, with glossary-vocabulary
    prose as the observation text, honoring the confinement statement
- node: domain/investigation/evidence-result
  encoded_at:
  - src/fixtures/observations.json
  how: each canned entry's result value ("ok") is drawn from the closed four-value enumeration this node
    declares
inferences:
- inferred: the fixture directory layout — src/fixtures/case/, src/fixtures/glossary/, src/fixtures/capability/
    as three separate data directories, plus src/fixtures/observations.json
  from: no checked-in fixture directory exists anywhere in the repository today; the internal shape of
    each directory reuses exactly what FileCaseStore, FileGlossaryStore and FileCapabilityStore already
    require
- inferred: the canned observation file's own location and shape — a flat src/fixtures/observations.json
    array of {concept, result, observation?} records
  from: no store or port names a file layout for canned observations; the shape is inferred directly from
    observation-source.port.ts's own ObservationOutcome type plus a concept discriminator
- inferred: every invented business fact in the case and its glossary — the case's slug, title, when_to_use
    and hash; the subject type "contract"; the two concepts, two hypotheses, four outcomes, three actions
    and three recipients; the ttl and timeout values; and the hypotheses' declared order
  from: the scope asks only for "a fictitious case" and no node names any of these values; each value
    is either a documented example, an arbitrary pick within a closed vocabulary, or a curator judgment
    call the specification explicitly leaves to human review
---

## What it is

One authored case, one set of matching vocabulary and capability records, and one set of canned observations.
Nothing here writes new production code; it is data the rest of this plan reads.

## Notes

rules/knowledge/a-collected-concept-declares-a-ttl's own default-of-sixty clause is never exercised here since both concepts state an explicit ttl by construction.
domain/integration/capability-registry is honored as data rather than encoded in new code: this task writes no registry logic, only registrations the existing registry service reads.
