---
contract_version: siegard-reconcile/1
title: Thirteen files carrying closed-initiative bindings, reconciled against the live specification
summary: 'These 13 files carry trace bindings whose only supporting implementation record sits in a closed
  initiative (case-authoring-mvp, investigation-engine, investigation-engine-v2, or live-engine-mvp);
  the live relational-persistence plan''s own already-reviewed deliveries modified each file again since,
  without anyone rebinding the older nodes. The human''s premise: the code as it stands today -- reading
  and writing the case and investigation aggregates through the relational stores, with position-based
  hypothesis ordering, authored_at/written_at in place of a document hash -- is correct, and asked for
  this file set to be reconciled against every node the trace currently binds to it.'
target: backend
files:
- path: case/case-query.port.ts
  change: ReadCaseResult and ICaseQuery read a case from the relational store; the published read no longer
    carries a document hash.
- path: case/case-query.service.ts
  change: readCase and replayCase validate and read whole against the relational case store, through case-and-investigation-model's
    own read-and-replay service.
- path: case/case-resolution.ts
  change: collectionPlan, requiresEvaluationOf and resolveOutcome read hypothesis precedence from each
    hypothesis's own position field rather than array order.
- path: case/case.ts
  change: Case carries authored_at rather than a document hash; Hypothesis carries a position field the
    resolution logic reads precedence from.
- path: case/parse-case-document.ts
  change: parses a submitted case version into the Case aggregate with position-based hypothesis ordering
    and no document hash, validating every structural rule together.
- path: factories/case-query.factory.ts
  change: wires the relational case store into the published case-query rather than a file repository.
- path: factories/glossary.factory.ts
  change: wires the relational glossary store into the published glossary-query rather than a file repository.
- path: factories/production-diagnose.factory.ts
  change: wires the production diagnose runner from the shared database connection rather than from per-store
    directories.
- path: fixtures/case/intermittent-connection-outage/1.json
  change: the curated fixture case carries authored_at and hypothesis position fields matching the current
    Case/Hypothesis shape.
- path: investigation/investigation-factory.ts
  change: pinnedCaseOf builds an investigation's case pin from slug and version alone, without a document
    hash.
- path: investigation/investigation.ts
  change: PinnedCase carries slug and version only; Investigation carries written_at.
- path: investigation/judgment-stage.ts
  change: 'unchanged in the respect this reconciliation covers: still runs hypothesis judgment through
    the isolated-parallel-calls port, over the same CallPool.'
- path: investigation/run-diagnosis.ts
  change: runs the diagnose pipeline over a case read once and pinned by slug and version; its own header
    comment still describes that pin as content-based.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/run-diagnosis.ts: nothing
    in the file set states a fact this node does not hold, contradicts one it does, or duplicates one
    already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/judgment-stage.ts, investigation/run-diagnosis.ts:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/judgment-stage.ts
  - investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'read across investigation/investigation-factory.ts, investigation/investigation.ts: nothing in
    the file set states a fact this node does not hold, contradicts one it does, or duplicates one already
    stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches what this
    node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
  - investigation/investigation.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'read across factories/case-query.factory.ts, factories/glossary.factory.ts, factories/production-diagnose.factory.ts:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - factories/case-query.factory.ts
  - factories/glossary.factory.ts
  - factories/production-diagnose.factory.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'read across factories/glossary.factory.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - factories/glossary.factory.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: contracts/investigation/case-source
  conforms: false
  how: run-diagnosis.ts's own module header cites this exact node while describing the case as "pinned
    by content"; the node it cites says the investigation runs the case "pinned by slug and version at
    the start of the request" -- not by content. The file's own citation of the node that contradicts
    it is the finding.
  observed_at:
  - investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/run-diagnosis.ts: nothing
    in the file set states a fact this node does not hold, contradicts one it does, or duplicates one
    already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: contracts/knowledge/author-case-version
  conforms: true
  how: 'read across case/parse-case-document.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/parse-case-document.ts
- node: contracts/knowledge/case-query
  conforms: false
  how: 'case-query.port.ts''s own ReadCaseResult still declares `readonly hash: string;`, and case-query.service.ts''s
    readCase still returns `{ case: theCase, hash: stored.hash }` -- but contracts/knowledge/case-query
    promises only "a case by slug and version, validated at this reading, and read whole", no hash and
    no document. The retired constraint case-query.port.ts''s own doc comment cites (constraints/a-case-is-stored-as-one-json-document)
    no longer exists in the specification; the published contract these two files answer to states no
    such field.'
  observed_at:
  - case/case-query.port.ts
  - case/case-query.service.ts
  - factories/case-query.factory.ts
- node: contracts/system/case-authoring
  conforms: true
  how: 'read across case/case-query.service.ts, case/parse-case-document.ts: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
  - case/parse-case-document.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: true
  how: 'read across investigation/investigation-factory.ts, investigation/investigation.ts, investigation/run-diagnosis.ts:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
  - investigation/investigation.ts
  - investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: domain/knowledge/case
  conforms: true
  how: 'read across case/case-query.service.ts, case/case-resolution.ts, case/case.ts, case/parse-case-document.ts,
    fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states a fact this node
    does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/consolidation-register
  conforms: true
  how: 'read across case/case.ts, case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'read across case/case-query.service.ts, case/case-resolution.ts, case/case.ts, case/parse-case-document.ts,
    fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states a fact this node
    does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/referral
  conforms: true
  how: 'read across case/case-resolution.ts, case/case.ts, case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/resolution
  conforms: true
  how: 'read across case/case-resolution.ts, case/case.ts, case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/run-diagnosis.ts: nothing
    in the file set states a fact this node does not hold, contradicts one it does, or duplicates one
    already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/run-diagnosis.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'read across investigation/judgment-stage.ts, investigation/run-diagnosis.ts: nothing in the file
    set states a fact this node does not hold, contradicts one it does, or duplicates one already stated
    elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches what this node
    requires.'
  encoded_at:
  - investigation/judgment-stage.ts
  - investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: 'read across investigation/investigation-factory.ts, investigation/judgment-stage.ts: nothing in
    the file set states a fact this node does not hold, contradicts one it does, or duplicates one already
    stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches what this
    node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
  - investigation/judgment-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: false
  how: the same stored.hash case-query.service.ts still returns, and run-diagnosis.ts's own module header,
    which still describes the case this pipeline runs as "pinned by content" at the start of the request
    -- contradict rules/investigation/replay-is-pinned's own text, bound to both files, which states plainly
    that "slug and version name one content without a digest over it."
  observed_at:
  - case/case-query.service.ts
  - investigation/investigation-factory.ts
  - investigation/investigation.ts
  - investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'read across fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: 'read across case/case.ts, case/parse-case-document.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case.ts
  - case/parse-case-document.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'read across fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'read across case/case-resolution.ts, case/case.ts, case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires.'
  encoded_at:
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  conforms: true
  how: 'read across fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-query.service.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/judgment-stage.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: 'read across case/case-resolution.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: 'read across case/case-resolution.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires.'
  encoded_at:
  - case/case-resolution.ts
notes: 'Three further findings surfaced comments and one still-executing check citing specification node
  identities that no longer exist, none of which is among the nodes this file set is currently bound to,
  so none reduced any node above to conforms: false. (1) case.ts''s own module header and its CASE_DOCUMENT_ENDING
  export cite constraints/a-case-is-stored-as-one-json-document, which the specification''s own decision-log
  records as retired in favor of constraints/a-case-is-read-whole and constraints/the-system-persists-to-one-relational-database
  -- neither bound to this file. (2) parse-case-document.ts''s own module doc cites the same retired constraint,
  framing hypotheses, resolutions and referrals as "read from the one document". (3) parse-case-document.ts''s
  slugProblems/heldFileName still refuses a document whose own declared slug disagrees with a filename
  synthesized from the query''s own slug plus CASE_DOCUMENT_ENDING -- confirmed by direct inspection to
  be exercised on every read-case call, via case-query.service.ts''s `${slug}${CASE_DOCUMENT_ENDING}`
  and author-case-version.service.ts''s own declared-slug-plus-ending construction -- but because the
  compared value is now built from the same slug on both sides, the check is vacuous rather than actively
  wrong: it can no longer observe a real mismatch, it only cites a rule, rules/knowledge/the-slug-matches-the-file-name,
  that the decision-log records as retired together with the file system that used to enforce it. None
  of the three is a node this file set is bound to failing; each is either dead logic or stale prose citing
  a specification identity that is gone. They do not block the bind below, and they are not settled by
  it -- flagged here for a separate corrective /plan-work task (drop the vestigial slug-vs-synthesized-filename
  check and CASE_DOCUMENT_ENDING''s remaining use, rewrite the three comments without the retired citation)
  rather than for /analyse, since none states a fact worth adding to the specification.'
---
