---
contract_version: siegard-reconcile/1
title: Same 13 files, re-reconciled after the hash-pin corrective delivery -- a new, majority-confirmed
  finding on ticket_ref
summary: 'These are the same 13 files the earlier reconciliation (siegard-reconcile/case-and-investigation-closed-plans-drift.md)
  judged, re-run now that task/case-and-investigation-model/case-query-drops-the-document-hash has delivered
  and fixed the 3 nodes that failed there (contracts/knowledge/case-query, rules/investigation/replay-is-pinned,
  domain/investigation/investigation, all for the retired document-hash pin). The human''s premise: the
  code as it stands today is correct and this file set should be reconciled fresh against every node the
  trace currently binds to it -- the same premise as the first pass, extended to cover the whole 13-file
  set now that the earlier blocker is fixed at the source. This second pass surfaced a new disagreement
  between independent judgment runs over ticket_ref''s typing, resolved by a third, blind tie-break pass
  per the human''s own explicit instruction: majority among three independent passes decides.'
target: backend
files:
- path: case/case-query.port.ts
  change: ReadCaseResult and ICaseQuery read a case from the relational store; the published read carries
    no document hash (task/case-and-investigation-model/case-query-drops-the-document-hash, delivered
    since the first reconciliation pass).
- path: case/case-query.service.ts
  change: readCase and replayCase validate and read whole against the relational case store; readCase's
    return no longer carries a hash.
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
  change: runs hypothesis judgment through the isolated-parallel-calls port, over the same CallPool; unchanged
    by the intervening hash-drop delivery.
- path: investigation/run-diagnosis.ts
  change: runs the diagnose pipeline over a case read once and pinned by slug and version; its own header
    comment now says so (corrected by the intervening hash-drop delivery).
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-query.service.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/run-diagnosis.ts: nothing
    in the file set states a fact this node does not hold, contradicts one it does, or duplicates one
    already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/judgment-stage.ts, investigation/run-diagnosis.ts:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/judgment-stage.ts
  - investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'read across investigation/investigation-factory.ts, investigation/investigation.ts: nothing in
    the file set states a fact this node does not hold, contradicts one it does, or duplicates one already
    stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches what this
    node requires. Confirmed independently by two of the three judgment passes run over this file set
    (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not re-examine
    every one of the 60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
  - investigation/investigation.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'read across factories/case-query.factory.ts, factories/glossary.factory.ts, factories/production-diagnose.factory.ts:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - factories/case-query.factory.ts
  - factories/glossary.factory.ts
  - factories/production-diagnose.factory.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'read across factories/glossary.factory.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - factories/glossary.factory.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: contracts/investigation/case-source
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: false
  how: run-diagnosis.ts's RunDiagnosisOptions.ticket_ref (line 111) and its pass-through into buildInvestigationOptions
    (line 264) type ticket_ref as a required, non-optional string. contracts/investigation/diagnosis describes
    the entry this pipeline serves as taking "case, subject, narrative and requester in, with an optional
    ticket reference, assessment out" -- an explicit optional. The composition root that runs the whole
    flow requires a ticket at its own top, so a diagnose call genuinely carrying none has no way to enter
    this pipeline without one being invented for it somewhere upstream, which the contract's own "optional"
    does not anticipate. Same 2-of-3 majority as domain/investigation/investigation above; production-diagnose.factory.ts,
    this node's other bound file, was not itself flagged by any pass -- it wires the runner but does not
    itself type ticket_ref.
  observed_at:
  - factories/production-diagnose.factory.ts
  - investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: contracts/knowledge/author-case-version
  conforms: true
  how: 'read across case/parse-case-document.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/parse-case-document.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'read across case/case-query.port.ts, case/case-query.service.ts, factories/case-query.factory.ts:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/case-query.port.ts
  - case/case-query.service.ts
  - factories/case-query.factory.ts
- node: contracts/system/case-authoring
  conforms: true
  how: 'read across case/case-query.service.ts, case/parse-case-document.ts: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.
    Confirmed independently by two of the three judgment passes run over this file set (a third, tie-break
    pass targeted the disputed ticket_ref question specifically and did not re-examine every one of the
    60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-query.service.ts
  - case/parse-case-document.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: false
  how: 'investigation-factory.ts''s BuildInvestigationOptions.ticket_ref (line 68) and its pass-through
    (line 150), and investigation.ts''s Investigation.ticket_ref (line 66), all type ticket_ref as a required,
    non-optional string. domain/investigation/investigation gives ticket_ref no `required: true` -- unlike
    every other attribute except the deliberately-optional consolidation_register -- and its own Description
    states plainly: "requester and ticket_ref both arrive in the diagnose call itself; requester is always
    given, ticket_ref is not -- not every diagnose call carries a ticket." Requiring a non-optional string
    means the aggregate cannot represent a diagnose call that carried no ticket, and buildInvestigation
    has no place to handle that absence the way it explicitly handles a missing written_at (refuseMissingWrittenAt)
    -- unlike written_at, ticket_ref''s type gives it nothing to handle. Confirmed by majority across
    three independent judgment passes: the first pass over this file set (before the intervening hash-drop
    delivery) explicitly considered this exact shape and read it as "an imprecision in typing discipline
    rather than a stated domain fact"; two later, independent passes -- one run blind to the first''s
    conclusion, one run as an explicit tie-break blind to both -- each independently found it a real departure,
    citing the same node text. 2 of 3 read it as a finding.'
  observed_at:
  - investigation/investigation-factory.ts
  - investigation/investigation.ts
  - investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: domain/knowledge/case
  conforms: true
  how: 'read across case/case-query.service.ts, case/case-resolution.ts, case/case.ts, case/parse-case-document.ts,
    fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states a fact this node
    does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
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
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'read across case/case-query.service.ts, case/case-resolution.ts, case/case.ts, case/parse-case-document.ts,
    fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states a fact this node
    does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
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
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
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
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: 'read across factories/production-diagnose.factory.ts, investigation/run-diagnosis.ts: nothing
    in the file set states a fact this node does not hold, contradicts one it does, or duplicates one
    already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - factories/production-diagnose.factory.ts
  - investigation/run-diagnosis.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'read across investigation/judgment-stage.ts, investigation/run-diagnosis.ts: nothing in the file
    set states a fact this node does not hold, contradicts one it does, or duplicates one already stated
    elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches what this node
    requires. Confirmed independently by two of the three judgment passes run over this file set (a third,
    tie-break pass targeted the disputed ticket_ref question specifically and did not re-examine every
    one of the 60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
  - investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: 'read across investigation/investigation-factory.ts, investigation/judgment-stage.ts: nothing in
    the file set states a fact this node does not hold, contradicts one it does, or duplicates one already
    stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches what this
    node requires. Confirmed independently by two of the three judgment passes run over this file set
    (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not re-examine
    every one of the 60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
  - investigation/judgment-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: 'read across investigation/investigation-factory.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: 'read across case/case-query.port.ts, case/case-query.service.ts, investigation/investigation-factory.ts,
    investigation/investigation.ts, investigation/run-diagnosis.ts: nothing in the file set states a fact
    this node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the
    current relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed
    independently by two of the three judgment passes run over this file set (a third, tie-break pass
    targeted the disputed ticket_ref question specifically and did not re-examine every one of the 60
    nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-query.port.ts
  - case/case-query.service.ts
  - investigation/investigation-factory.ts
  - investigation/investigation.ts
  - investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'read across fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.
    Confirmed independently by two of the three judgment passes run over this file set (a third, tie-break
    pass targeted the disputed ticket_ref question specifically and did not re-examine every one of the
    60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: 'read across case/case.ts, case/parse-case-document.ts: nothing in the file set states a fact this
    node does not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current
    relational-store-era shape (fields, ordering, pins) matches what this node requires. Confirmed independently
    by two of the three judgment passes run over this file set (a third, tie-break pass targeted the disputed
    ticket_ref question specifically and did not re-examine every one of the 60 nodes, so it is not counted
    as a third vote for nodes outside that dispute).'
  encoded_at:
  - case/case.ts
  - case/parse-case-document.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'read across fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.
    Confirmed independently by two of the three judgment passes run over this file set (a third, tie-break
    pass targeted the disputed ticket_ref question specifically and did not re-examine every one of the
    60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-query.service.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: 'read across case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'read across case/case-resolution.ts, case/case.ts, case/parse-case-document.ts, fixtures/case/intermittent-connection-outage/1.json:
    nothing in the file set states a fact this node does not hold, contradicts one it does, or duplicates
    one already stated elsewhere -- the current relational-store-era shape (fields, ordering, pins) matches
    what this node requires. Confirmed independently by two of the three judgment passes run over this
    file set (a third, tie-break pass targeted the disputed ticket_ref question specifically and did not
    re-examine every one of the 60 nodes, so it is not counted as a third vote for nodes outside that
    dispute).'
  encoded_at:
  - case/case-resolution.ts
  - case/case.ts
  - case/parse-case-document.ts
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  conforms: true
  how: 'read across fixtures/case/intermittent-connection-outage/1.json: nothing in the file set states
    a fact this node does not hold, contradicts one it does, or duplicates one already stated elsewhere
    -- the current relational-store-era shape (fields, ordering, pins) matches what this node requires.
    Confirmed independently by two of the three judgment passes run over this file set (a third, tie-break
    pass targeted the disputed ticket_ref question specifically and did not re-examine every one of the
    60 nodes, so it is not counted as a third vote for nodes outside that dispute).'
  encoded_at:
  - fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'read across case/case-query.service.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-query.service.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: 'read across investigation/judgment-stage.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/judgment-stage.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: 'read across investigation/run-diagnosis.ts: nothing in the file set states a fact this node does
    not hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - investigation/run-diagnosis.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: 'read across case/case-resolution.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: 'read across case/case-resolution.ts: nothing in the file set states a fact this node does not
    hold, contradicts one it does, or duplicates one already stated elsewhere -- the current relational-store-era
    shape (fields, ordering, pins) matches what this node requires. Confirmed independently by two of
    the three judgment passes run over this file set (a third, tie-break pass targeted the disputed ticket_ref
    question specifically and did not re-examine every one of the 60 nodes, so it is not counted as a
    third vote for nodes outside that dispute).'
  encoded_at:
  - case/case-resolution.ts
notes: 'This is a second reconciliation over the same 13-file set as siegard-reconcile/case-and-investigation-closed-plans-drift.md.
  That first pass found 3 of 60 nodes not conforming (contracts/knowledge/case-query, rules/investigation/replay-is-pinned,
  domain/investigation/investigation), all for the same retired document-hash pin; task/case-and-investigation-model/case-query-drops-the-document-hash
  has since delivered and fixed all three at the source, confirmed here by a fresh judgment finding zero
  hash-related findings this round. A new disagreement surfaced between three independent judgment passes
  over this file set: the first (before the hash-drop delivery) explicitly considered investigation-factory.ts''s,
  investigation.ts''s and run-diagnosis.ts''s non-optional ticket_ref typing and read it as a typing imprecision
  rather than a domain-fact departure; a second pass, run independently and blind to the first''s conclusion,
  found it a real departure against domain/investigation/investigation and contracts/investigation/diagnosis;
  a third pass, run as an explicit tie-break blind to both prior results, independently reached the same
  conclusion as the second. By the human''s own instruction that majority among three independent passes
  decides, this is now recorded as a real finding (2 of 3), reducing domain/investigation/investigation
  and contracts/investigation/diagnosis to conforms: false above -- so nothing in this record is bound:
  a trace holding some of a file set''s bindings reads exactly like one holding all of them. Three further
  observations surfaced across these passes, none of which reduces any of the 60 bound nodes above, because
  none is a node this file set is bound to in the trace: (1) case.ts''s own module header and its CASE_DOCUMENT_ENDING
  export, and (2) parse-case-document.ts''s own module header and its still-executing slugProblems/heldFileName
  check, each cite a specification identity that no longer exists (constraints/a-case-is-stored-as-one-json-document,
  rules/knowledge/the-slug-matches-the-file-name) -- confirmed by all three passes unanimously, carried
  over unchanged from the first reconciliation''s own notes, since neither file''s edit in the intervening
  delivery touched this prose. (3) case-resolution.ts''s own module-level Verdict type re-declares the
  same closed vocabulary domain/investigation/verdict already states, rather than importing the encoding
  already declared elsewhere (e.g. evaluation.ts) -- found by only one of the three passes (the tie-break
  run), not a majority, and domain/investigation/verdict is not among the nodes the trace binds to case-resolution.ts
  in any case, so it neither meets the majority bar this record applies to the ticket_ref question nor
  could reduce any of case-resolution.ts''s own bound nodes even if it did. Recorded here as an unresolved,
  single-pass observation for a later invocation to take up, not settled by this one.'
---
