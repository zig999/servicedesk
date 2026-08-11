---
title: Proof for the fictitious diagnose fixture case
summary: Sixteen tests read the authored case, glossary, capability and observation fixtures through the
  real parseCaseDocument, case-resolution, file-backed stores and observation-source adapter — never a
  value re-derived from the fixture's own JSON.parse — and show every one of the task's nine criteria
  holds over the exact files this task shipped.
implementation: sha256:b86deef94e70d972612c07f15b58177c412ea25bbec4496b7742fab46627fdc4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-fixture-author-diagnose-fixture-case-suite
tests:
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: declares at least one hypothesis, each with a non-empty single-sentence criterion, at least one
    collected concept, and a resolution pairing one outcome with one referral
  proves: The case declares at least one hypothesis, each with a non-empty criterion stating exactly one
    falsifiable claim, at least one collected concept, and a resolution pairing one outcome with one referral.
  fails_when: the parsed fixture case holds zero hypotheses, or any hypothesis's criterion is empty or
    spans more than one sentence, or any hypothesis collects no concept, or any hypothesis's resolution
    leaves its outcome, action or recipient empty
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: names no two of its own hypotheses alike
  proves: No two of the case's own hypotheses share a name, and the case's declared order is stated as
    its own precedence. (the name-uniqueness half)
  fails_when: two of the fixture's hypotheses are given the same name
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: resolves to its first-declared hypothesis's own resolution when every hypothesis is confirmed
    at once, proving the fixture's declared array order is its own precedence
  proves: No two of the case's own hypotheses share a name, and the case's declared order is stated as
    its own precedence. (the declared-order-as-precedence half)
  fails_when: the fixture's hypotheses are reordered, or resolveOutcome stops treating declaration order
    as precedence
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: declares a fallback resolution distinct from every one of its hypotheses' own
  proves: The case's fallback declares its own resolution, distinct from any hypothesis's own.
  fails_when: the fixture's fallback resolution is made to equal either hypothesis's own resolution
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: declares an explicit consolidation register rather than leaving it undeclared
  proves: The case declares an explicit consolidation register (formal or plain) rather than leaving it
    undeclared.
  fails_when: consolidation_register is removed from the fixture document, or set to anything outside
    formal/plain
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: is stored as exactly one file under its own slug directory, named 1.json
  proves: The case document is stored as one plain JSON document at <directory>/<slug>/1.json, its slug
    equal to the file's own name. (the one-document half)
  fails_when: a second file appears under the fixture's case slug directory, or the version file is renamed
    away from 1.json
- file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  name: declares a slug equal to the name of the directory that holds it
  proves: The case document is stored as one plain JSON document at <directory>/<slug>/1.json, its slug
    equal to the file's own name. (the slug-matches-directory half)
  fails_when: the document's own slug field is changed
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: names a subject type that exists in the fixture glossary's subject-type vocabulary
  proves: Every subject type, concept, outcome, action and recipient the case and its hypotheses name
    exists in the fixture's own glossary vocabulary files... (the subject-type half)
  fails_when: the fixture case's declared subject is not present in glossary/subject-type.json
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: names only outcomes, actions and recipients that exist in the fixture glossary's matching vocabulary
    files
  proves: Every subject type, concept, outcome, action and recipient the case and its hypotheses name
    exists in the fixture's own glossary vocabulary files... (the outcome/action/recipient half)
  fails_when: any hypothesis's or the fallback's outcome, action or recipient is missing from the matching
    glossary vocabulary file
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: carries both non-conclusion outcomes in its own outcome vocabulary file, ahead of any case reading
  proves: '...and the glossary''s outcome vocabulary also carries the two non-conclusion outcomes.'
  fails_when: glossary/outcome.json stops declaring inconclusive-no-data or inconclusive-hypotheses-exhausted
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: registers every concept the fixture hypotheses collect to accept the case's own declared subject
    type, per the fixture glossary's own concept file
  proves: Every concept the case's hypotheses collect accepts the case's own declared subject type...
    (the accepts half)
  fails_when: a collected concept is missing from glossary/concept.json, or its accepts array no longer
    includes "contract"
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: answers every concept the fixture hypotheses collect with a registered read-only capability declaring
    an output schema and an integer timeout
  proves: '...and has a registered read-only capability declaring an output schema and a timeout...'
  fails_when: a collected concept has no matching entry in capability/capability.json, or that entry's
    nature is not read-only, or its output_schema is empty, or its timeout is not an integer
- file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
  name: states an explicit ttl on at least one collected concept's registration in the fixture glossary
  proves: '...at least one concept''s registration states an explicit ttl.'
  fails_when: every collected concept's entry in glossary/concept.json has its ttl field removed
- file: src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
  name: carries a canned observation outcome, one of the four evidence-result endings, for every concept
    the fixture case's hypotheses collect
  proves: For every concept the case's hypotheses collect, a canned observation outcome exists... (the
    coverage half)
  fails_when: observations.json is missing an entry for equipment-status or network-outage-flag, or an
    entry's result is outside the four evidence-result values
- file: src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
  name: seeds the real stand-in observation source with the canned outcome for every collected concept
    and reads each one back unchanged through observe-concept
  proves: '...usable to seed a stand-in observation source so the whole pipeline can run against this
    case without a live corporate-records connection.'
  fails_when: FakeObservationSource.seed()/observeConcept() stops answering the exact canned outcome for
    a collected concept, or a canned entry's shape no longer matches ObservationOutcome
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: reads the fixture case whole, with no coherence violation, through the real case-query wiring
    over the fixture's own glossary and capability data
  proves: The case document validates without a coherence violation when read through the knowledge context's
    own case-reading path against the fixture's own glossary and capability data.
  fails_when: createCaseQuery(...).readCase('intermittent-connection-outage', 1) rejects with InvalidCaseDocumentError,
    CaseNotValidError or CaseNotFoundError over the real, composed file-backed stores and the fixture's
    own copied data
not_applicable:
- edge_case: absent or empty input reaching a validation boundary
  why: this task authors static data; it introduces no input-handling code path, and the boundary behavior
    of an absent or empty case attribute is already the existing suite's own
- edge_case: a case sitting exactly at the "at least one" boundary (one hypothesis, one collected concept)
  why: the fixture authors two hypotheses, above the boundary, and nothing in its own criteria requires
    it to sit at the boundary; the boundary itself is exercised by parse-case-document's own existing
    suite
- edge_case: an empty collection where one is expected back (zero hypotheses, zero collected concepts)
  why: every criterion here demands a non-empty collection by construction; a case failing that is precisely
    what parseCaseDocument's own existing refusal tests cover
- edge_case: a duplicate glossary term name
  why: uniqueness of glossary term names is GlossaryService's own rule, already proven in its own suite;
    this task authors glossary data, it does not re-decide that rule
- edge_case: an operation attempted against state that forbids it
  why: a static, authored fixture performs no operation against mutable state for this to apply to
- edge_case: a dependency that fails, is unavailable, or answers slowly
  why: the entire purpose of this fixture's canned observations is to let FakeObservationSource stand
    in for the live corporate-records connection; a live dependency's failure or latency is the connector
    task's own concern
- edge_case: two operations against one subject at once
  why: no concurrent operation exists over static, read-only data
untested:
- whether a hypothesis's criterion states a genuinely falsifiable claim, beyond being one non-empty sentence
  — no bound node gives a mechanically checkable predicate for falsifiability, so the tests operationalize
  it as single-sentence, and the epistemic judgment is left to human review
- whether the canned observations' prose stays confined to glossary vocabulary and never leaks source-system
  vocabulary — no bound node supplies a closed, checkable vocabulary list to scan the observation strings
  against, so no test was invented for it and the concern stays open
- rules/knowledge/a-collected-concept-declares-a-ttl's own default-of-sixty clause — deliberately unexercised,
  since both fixture concepts state an explicit ttl
- the capability registry's one-to-one concept lookup under a duplicate registration — the fixture registers
  exactly one capability per concept, so the integration test never drives that branch; it is CapabilityRegistryService's
  own concern, proven in its own suite
---

## What it is

Sixteen tests over four spec files read the fixture through the real case/glossary/capability/observation code paths and hold every one of the nine criteria against it.

## Notes

None.
