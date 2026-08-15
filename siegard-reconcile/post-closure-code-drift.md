---
contract_version: siegard-reconcile/1
title: The 17 files rewritten across closed initiatives' deliveries, judged against every node
  the trace binds to them
summary: >-
  Every one of these files was rewritten by an ordinary delivery of a task now closed — the
  case-authoring-mvp, investigation-engine, investigation-engine-v2, relational-persistence and
  http-connector-adapter initiatives, all closed in git history — and each rewrite was validated,
  reviewed or recorded on its own route. The drift exists only because a bind restamps the
  delivering task's own nodes, leaving the bindings other, older tasks held on these same shared
  files stale. The human states the source stands as those deliveries left it; nothing here was
  hand-edited.
target: backend
files:
- path: src/case/case-query.service.ts
  change: >-
    readCase validates the case aggregate at every reading against the glossary and the capability
    registry as they now stand, and answers the whole aggregate in one read; the contract's
    coherence check reads the current registration rather than one cached at authoring time.
- path: src/case/case-resolution.ts
  change: >-
    Resolves a case's outcome from the hypotheses in their declared precedence order, falling back
    to the case's declared fallback when no hypothesis is confirmed.
- path: src/case/case.ts
  change: >-
    Declares the Case/Hypothesis/Resolution/Referral aggregate shapes, with each hypothesis
    carrying a required, case-unique position that fixes its precedence.
- path: src/case/parse-case-document.ts
  change: >-
    Parses and validates an authored case document against every knowledge rule — hypothesis count,
    name and position uniqueness, declared criterion, collected concepts, complete resolutions —
    collecting every violation into one refusal.
- path: src/config/env.ts
  change: >-
    Reads the one relational database connection from the externally-provisioned DATABASE_URL, with
    no default value anywhere in source.
- path: src/factories/case-query.factory.ts
  change: >-
    Wires the relational case store into the published case-query contract.
- path: src/factories/diagnose-server.factory.ts
  change: >-
    Wires the HTTP server against the one relational database connection.
- path: src/factories/glossary.factory.ts
  change: >-
    Wires the relational glossary store into the published glossary-query contract.
- path: src/factories/production-diagnose.factory.ts
  change: >-
    Composes the production diagnose runner from the shared database connection and stamps each
    request's entry instant and total deadline (20s, matching the declared budget breakdown).
- path: src/fixtures/case/intermittent-connection-outage/1.json
  change: >-
    One authored case version, seeded and used as the knowledge base a real build validates
    against — declares its hypotheses' positions, collected concepts, criteria and resolutions in
    the aggregate's current shape.
- path: src/http/diagnose.controller.ts
  change: >-
    The HTTP entry point answering the guided-diagnosis contract — reads the named case, runs the
    diagnosis and returns the assessment.
- path: src/investigation/investigation-factory.ts
  change: >-
    Assembles and validates the subject against the glossary vocabulary, one evaluation per
    required hypothesis and one evidence per collected concept, depending on nothing but ports and
    plain types.
- path: src/investigation/investigation.ts
  change: >-
    Declares the Investigation/PinnedCase shapes, carrying the replay pins the specification
    requires and depending on no infrastructure.
- path: src/investigation/judgment-stage.ts
  change: >-
    Judges one hypothesis and produces exactly one of the three declared evaluation reasons
    (no-data, judgment-failure, deadline-exceeded) or a decided verdict.
- path: src/investigation/run-diagnosis.ts
  change: >-
    Orchestrates the diagnosis stages end to end, synchronously, within the declared deadline;
    writes the investigation once and never aborts the persistence stage on its own deadline.
- path: src/persistence/relational-case-store.repository.ts
  change: >-
    Reads and writes case versions against the relational database — one case read whole per query,
    a version written once under the (slug, version) primary key.
- path: src/seed.ts
  change: >-
    Seeds the glossary and non-conclusion outcomes before any case, then authors the fixture's case
    version through the published authoring command.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: >-
    case-query.service.ts answers the case whole as of one validated reading, and
    relational-case-store.repository.ts reads one version in one transaction.
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: >-
    production-diagnose.factory.ts returns the assessment from the same call, and run-diagnosis.ts
    resolves the request with the written record's own assessment.
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: >-
    env.ts's DATABASE_URL is the one place the connection is read, with no default anywhere in
    source.
  encoded_at:
  - src/config/env.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: >-
    production-diagnose.factory.ts sets TOTAL_DEADLINE_BUDGET_MS = 20_000 matching the rule's
    declared breakdown, and run-diagnosis.ts's stage budgets (JUDGMENT_STAGE_BUDGET_MS = 5_000,
    PERSISTENCE_STAGE_BUDGET_MS = 2_000) are the enforcement of that one propagated instant, not a
    restatement of an unrelated fact.
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: >-
    investigation-factory.ts and investigation.ts import only this context's own plain types and
    ports; infrastructure reaches either only through a port.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: >-
    env.ts states the one connection every store answers from, and diagnose-server.factory.ts wires
    it through with no second data path in source.
  encoded_at:
  - src/config/env.ts
  - src/factories/diagnose-server.factory.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: >-
    glossary.factory.ts's factory answers the glossary-query contract alone, wired to the
    relational store.
  encoded_at:
  - src/factories/glossary.factory.ts
- node: contracts/investigation/case-source
  conforms: true
  how: >-
    run-diagnosis.ts receives the pinned, already-read case from its caller, matching the node as it
    now stands (it moved on the specification side since its bind and was judged as it stands
    today).
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: >-
    production-diagnose.factory.ts, diagnose.controller.ts and run-diagnosis.ts together answer the
    diagnosis contract exactly, ticket_ref travelling through unchanged as correlation.
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/http/diagnose.controller.ts
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: >-
    investigation-factory.ts consumes the glossary-source port the caller supplies and nothing
    else.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: contracts/knowledge/author-case-version
  conforms: true
  how: >-
    parse-case-document.ts refuses a violating document once with every violation named together,
    and seed.ts authors through the published command alone.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/seed.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: >-
    case-query.service.ts's readCase validates at reading and reads whole, and
    case-query.factory.ts's factory answers the contract alone.
  encoded_at:
  - src/case/case-query.service.ts
  - src/factories/case-query.factory.ts
- node: contracts/system/case-authoring
  conforms: true
  how: >-
    parse-case-document.ts refuses once, naming every violated rule together, against the rules the
    specification holds; case-query.service.ts serves the same authored aggregate back unchanged.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
- node: contracts/system/guided-diagnosis
  conforms: true
  how: >-
    diagnose.controller.ts is the guided flow — read the named case, name the subject and
    narrative, receive the assessment.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: >-
    investigation-factory.ts resolves one governed attribute name from the glossary's own
    vocabulary.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: >-
    judgment-stage.ts's three inconclusive-evaluation reasons (no-data, judgment-failure,
    deadline-exceeded) match the enumeration exactly, each produced by a distinct cause.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: true
  how: >-
    investigation.ts holds every declared attribute, investigation-factory.ts is the one factory
    that can build a valid Investigation, and run-diagnosis.ts stamps written_at once.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: >-
    investigation-factory.ts assembles the subject as its whole attribute-value set, exactly as the
    entry point received it.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: >-
    investigation-factory.ts pairs one governed name with one value, travelling as one fact.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/knowledge/case
  conforms: true
  how: >-
    case-query.service.ts and parse-case-document.ts carry the Case aggregate's declared attributes
    faithfully, with no storage-medium fact asserted in source that the specification does not
    hold.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: >-
    case.ts declares consolidation_register optional and closed to its two declared values,
    parse-case-document.ts enforces the closure, and the fixture instantiates one value.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis
  conforms: true
  how: >-
    case-query.service.ts and parse-case-document.ts carry Hypothesis's declared attributes —
    name, position, criterion, collects, resolution — field for field, instantiated in the fixture.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
- node: domain/knowledge/referral
  conforms: true
  how: >-
    case-resolution.ts, case.ts and parse-case-document.ts carry Referral as one whole
    action-and-recipient pair, refused when either half is missing, instantiated in the fixture.
  encoded_at:
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/resolution
  conforms: true
  how: >-
    case-resolution.ts, case.ts and parse-case-document.ts carry Resolution as an outcome paired
    with a referral so neither can be declared without the other, instantiated in the fixture.
  encoded_at:
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: >-
    seed.ts seeds the non-conclusion outcomes before every other vocabulary and authors the case
    last.
  encoded_at:
  - src/seed.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: >-
    investigation-factory.ts refuses an attribute name the glossary does not carry.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: >-
    investigation-factory.ts is the one place this rule is enforced, at subject construction.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: >-
    production-diagnose.factory.ts's total budget and run-diagnosis.ts's stage budgets together
    hold the declared 20s figure, with every stage bounded.
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: >-
    run-diagnosis.ts writes the investigation exactly once, with no intermediate persistence
    anywhere in the pipeline.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: >-
    run-diagnosis.ts's writeWithinDeadline honors the persistence exception verbatim, matching
    scenarios/investigation/no-response-without-a-record.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: >-
    investigation-factory.ts refuses a record where a required hypothesis has no matching
    evaluation, or more than one.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: >-
    investigation-factory.ts refuses a collected concept with no matching evidence or with more
    than one.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: >-
    investigation-factory.ts, investigation.ts and run-diagnosis.ts carry the declared replay pins
    whole, with the store's content hash never consulted by the pinning logic.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: >-
    run-diagnosis.ts returns the response only after the write concluded, and it is the written
    record's own assessment.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: >-
    parse-case-document.ts refuses a case declaring no hypothesis; the fixture declares two.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: >-
    relational-case-store.repository.ts's write-once is held by the (slug, version) primary key,
    a duplicate write mapped to a refusal.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: >-
    the fixture's hypotheses collect concepts that accept the case's declared subject type,
    validated at read.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: >-
    parse-case-document.ts refuses a hypothesis collecting no concept; each fixture hypothesis
    collects at least one.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: >-
    parse-case-document.ts refuses an absent, non-string or empty criterion; the fixture declares
    one per hypothesis.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: >-
    parse-case-document.ts refuses two hypotheses sharing a name; the fixture's names are distinct.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: >-
    case.ts declares position unique within its case, and parse-case-document.ts refuses shared
    positions.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: >-
    relational-case-store.repository.ts holds the slug as the cases table's primary key, refusing a
    second, distinct case under one slug.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: >-
    every subject type, concept, outcome, action and recipient in the fixture is named by glossary
    name, seeded before authoring and re-checked at every read.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: >-
    case-query.service.ts's replay path and relational-case-store.repository.ts's version listing
    together keep every stored version readable; no delete exists.
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: >-
    parse-case-document.ts refuses a fallback or a hypothesis missing its resolution; the fixture's
    fallback and both hypotheses each declare one.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: >-
    case-resolution.ts and case.ts read precedence from each hypothesis's own declared position
    rather than array order; parse-case-document.ts carries positions through parsing; the fixture
    declares them explicitly.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  conforms: true
  how: >-
    each fixture criterion states one claim, in the terms the node leaves to human review.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: >-
    case-query.service.ts's coherence check reads the glossary and capability registry as they
    stand at the moment of this reading, not as they stood at authoring time.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: >-
    case-query.service.ts's read-case path alone runs full validation at every one of its own
    readings, with replay the declared exception.
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: >-
    run-diagnosis.ts raises a write-deadline error rather than answering when the write does not
    conclude in time — the requester receives an error, never an unwritten assessment.
  encoded_at:
  - src/investigation/run-diagnosis.ts
notes: >-
  contracts/investigation/case-source moved on the specification side since its bind and was judged
  as it now stands, consistent with trace.py --check. Three paths bindings still claim no longer
  exist on disk and are outside this record's file set, since no judgment can read them:
  src/persistence/file-capability-store.repository.ts under domain/integration/capability,
  src/persistence/file-investigation-store.repository.ts under
  rules/investigation/an-investigation-is-written-once, and
  src/persistence/file-case-store.repository.ts under rules/knowledge/every-case-version-remains-readable
  — all deleted by the migration to relational stores; their facts moved into the relational
  repositories those tasks bound, and the route for the stale paths is trace.py --replace, a hand
  operation outside this record. Judged against a specification-conformance-reviewer pass over all
  48 nodes the trace binds to these 17 files: no finding survived. Every node above cleared, so this
  record binds all of them.
---
