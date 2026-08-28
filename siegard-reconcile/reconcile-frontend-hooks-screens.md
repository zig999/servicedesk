---
contract_version: siegard-reconcile/1
title: Frontend hooks/screens rebind, case-simulation cockpit and surrounding routes
summary: 7 frontend files (the case-simulation cockpit's two dispatch hooks, the connector-configuration
  detail hook, three routes and the app shell) report code drift against 28 unique bound specification
  nodes -- pre-existing, unrelated to this session's own two deliveries. The human asked to reconcile
  this file set as it now stands, holding each file to every node the trace currently binds it to.
target: frontend
files:
- path: src/hooks/use-case-simulation-cockpit.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/hooks/use-connector-configuration-detail.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/hooks/use-simulate-hypothesis.ts
  change: rewired by a prior corrective delivery (fix-use-simulate-hypothesis-dispatch) to dispatch to
    the delivered backend route; unchanged since in the facts these nodes govern
- path: src/routes/case-detail-screen.tsx
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/routes/case-simulation-hypotheses-table.tsx
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/routes/route-tree.tsx
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/shared/components/app-shell.tsx
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
nodes:
- node: contracts/investigation/case-simulation
  conforms: false
  how: 'use-simulate-hypothesis.ts, case-detail-screen.tsx, case-simulation-hypotheses-table.tsx and route-tree.tsx
    all restate or reuse this contract''s own operations, states and disclosed detail correctly and consistently,
    each with the citation explicit. But use-case-simulation-cockpit.ts''s own header comment (criterion
    6) states, as settled: ''a curator returning from an editing screen always has the last simulation
    run marked stale'' -- citing ''D8'' as its own authority. D8 is a decision recorded in work/case-simulation-frontend/intake/scope.md,
    part of the plan''s own material, never written into the specification. No node this contract holds,
    nor any other node bound to this file set, states when a shown simulation result counts as stale relative
    to the case version it was run against; the code (and the intake document behind it) is the only place
    this fact lives.'
  observed_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-detail-screen.tsx
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/route-tree.tsx
- node: domain/investigation/assessment
  conforms: true
  how: Both files carry only outcome/referral/determining_hypothesis, with the fallback label matching
    the node's own 'a disguised default hypothesis, explicit on purpose', e.g. case-simulation-hypotheses-table.tsx's
    SummaryLine.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/investigation/investigation
  conforms: true
  how: Both files forward requester unconditionally and never send ticket_ref, matching the node's own
    'requester is always given, ticket_ref is not'.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/investigation/subject
  conforms: true
  how: Both files receive/pass the subject (type + attribute-values) through unaltered rather than deriving
    or reshaping it themselves, matching the node.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/hooks/use-simulate-hypothesis.ts
- node: scenarios/investigation/a-draft-case-version-is-simulated
  conforms: true
  how: use-case-simulation-cockpit.ts's case-run effect never writes an investigation, matching the scenario's
    own 'no investigation is written'; case-simulation-hypotheses-table.tsx is presentational and honors
    the scenario by not gating on case-version state itself.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: All three files match the scenario's own 'no outcome and no assessment are resolved' -- use-simulate-hypothesis.ts's
    SimulateHypothesisResult carries a single evaluation with no outcome/assessment field, and the other
    two files expose the one-hypothesis action without ever resolving one.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: The hook's query and mutation call exactly the registry's own read/write endpoints for one connector
    configuration.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: The loaded/saved ConnectorConfiguration value is carried through state and the save payload unchanged,
    matching the node's shape.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: isValidConfigurationObject correctly encodes the well-formedness definition (a plain object, not
    an array or null); the rule's own enforcement (the registry's HTTP 422 refusal) is explicitly left
    to the backend by this file's own comment. A known, pre-existing React-timing bug (configurationValid
    seeded true, corrected only in an effect) can delay this client-side flag's own update by one render,
    but does not misstate this node's fact and does not let a malformed configuration reach or be accepted
    by the registry -- confirmed as outside what this node governs, not a conformance finding.
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
- node: domain/investigation/citation
  conforms: true
  how: export type Citation = { concept, field } matches the node's two required attributes exactly.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/investigation/durations
  conforms: true
  how: Both files' Durations shape/rendering (collection, judgment, optional writing, total) matches the
    node, including the node's own 'writing is present exactly when a consolidation call happened' for
    the optional field.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/investigation/evaluation
  conforms: true
  how: The discriminated union (hypothesis, verdict, reason, citations, usage?, elapsed_ms?, prompt?)
    matches the node's attribute list and order verbatim, per the file's own header comment quoting it.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: export type EvaluationReason = 'no-data' | 'judgment-failure' | 'deadline-exceeded' matches the
    node's three enumerated values exactly.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/investigation/evidence
  conforms: true
  how: The Evidence type carries all nine of the node's attributes in the order its own header comment
    quotes them.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/investigation/usage
  conforms: true
  how: export type Usage = { input_tokens, output_tokens } matches both required attributes.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/investigation/verdict
  conforms: true
  how: export type Verdict = 'confirmed' | 'refuted' | 'inconclusive' matches the node's three enumerated
    values exactly.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: domain/knowledge/case
  conforms: true
  how: Both files use slug alone as the case's own stable identity, matching the node's own Description
    verbatim in use-simulate-hypothesis.ts's own comment.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version
  conforms: false
  how: case-detail-screen.tsx and case-simulation-hypotheses-table.tsx both correctly cite and honor this
    node (version identity, manifest composition in precedence order, the fallback-hypothesis note). But
    use-simulate-hypothesis.ts's own JSDoc attributes the sentence 'a version is written once, so the
    pair names one content' to domain/knowledge/case-version.md -- that exact sentence is domain/investigation/investigation.md's
    own words (also bound to this same file), not this node's. The fact itself is genuinely held by the
    specification; the citation just points a verifier at the wrong node.
  observed_at:
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-detail-screen.tsx
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: The file's own comment fairly paraphrases the node's 'referencing the hypothesis it belongs to'
    for how a revision is reached only through its owning hypothesis.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: rules/investigation/a-simulation-writes-no-investigation
  conforms: true
  how: The hook never imports useQueryClient and never calls invalidateQueries; its only observable effect
    is the mutation's own in-memory result, matching the rule.
  encoded_at:
  - src/hooks/use-simulate-hypothesis.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: The Versions and Attributes tabs' source comments cite exactly the contract's own list-case-versions
    and read-case operations, matching what each tab actually calls.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: The two-branch state-cell mapping is exhaustive over exactly the node's two values (draft, released),
    with no further fallback, matching the node.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: The 'New draft' link is shown only when no version in the list is currently in draft state, matching
    the rule directly.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: The screen renders every version the list carries, never only the latest, matching the rule.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: true
  how: The empty-state paragraph ('This case currently holds no version.') matches the scenario's own
    explicit-statement outcome.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: The table's row id/position fields match the node's own precedence-position attribute.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/integration/capability
  conforms: true
  how: The capability-detail route's path shape (/capabilities/$name/$version) encodes exactly the node's
    own name+version identification, stating nothing else about the aggregate.
  encoded_at:
  - src/routes/route-tree.tsx
- node: constraints/no-route-enforces-authentication
  conforms: false
  how: 'The file''s Topbar renders a permanent, user-facing banner -- ''No auth in this build'' -- on
    every screen. This is what the system tells every user about its own authentication posture: new information
    a person using the system learns, not a label or a colour. No specification node states that this
    disclosure should exist, let alone its exact wording; it is a static literal, not read off any bound
    fact, so a change to the backend''s authentication posture would not be noticed here. The node this
    file is otherwise bound to states a backend fact (no API route enforces authentication) that this
    frontend file''s text is consistent with in substance but cannot itself confirm or falsify -- the
    finding is that the disclosure and its wording are an undisclosed business decision, not that the
    banner''s content contradicts the node.'
  observed_at:
  - src/shared/components/app-shell.tsx
notes: '7 delegations ran, one per file. Two new, substantive findings surfaced, both a specification
  silence rather than a misreading: use-case-simulation-cockpit.ts encodes a ''staleness'' rule (a curator
  returning from editing always has the last simulation run marked stale) whose own authority is ''D8'',
  a decision recorded only in work/case-simulation-frontend/intake/scope.md -- plan material, never written
  into the specification. app-shell.tsx renders a permanent ''No auth in this build'' banner to every
  user of every screen, a business disclosure and its exact wording that no specification node authorizes.
  Both are the human''s to route -- most naturally through /analyse, since each is a fact of the business
  (what the system tells someone) the specification does not yet hold, not a wrong behavior in delivered
  code and not a code-comment slip. One smaller citation-only finding also surfaced: use-simulate-hypothesis.ts
  attributes a sentence to domain/knowledge/case-version.md that is actually domain/investigation/investigation.md''s
  own words (both nodes bound to the same file); the fact itself holds, only the citation is wrong. use-connector-configuration-detail.ts
  was independently re-confirmed as carrying a known, pre-existing React-timing bug (configurationValid''s
  stale-true window) that does not reach any of its three bound nodes'' own domain facts -- a UI-layer
  bug, not a conformance finding, consistent with what an earlier review already surfaced.'
---
