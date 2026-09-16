---
target: frontend
title: A stated capability schema draft is marked stale once its link or operation
  moves
summary: The Capability Schema Helper computes, on every render, whether its stated
  draft's outcome still matches the helper's current link and chosen operation, and
  states the draft as stale without hiding either apply act.
task: sha256:7d41f88e8bf363e5c948925eb1cdeea731e451b2ea35578fa464a1a0bd053cb4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-draft-applied-to-the-capability-edit-stated-draft-marked-stale-build
files:
- path: src/hooks/use-capability-schema-helper.ts
  effect: Adds a pure draftIsStale(outcome, current) comparing the drafted outcome's
    own recorded link/path/method against the helper's current link and chosenOperation,
    and exposes the result as an optional stale field on CapabilitySchemaHelperState,
    computed inline on every call rather than stored in state.
- path: src/services/capability-schema-messages.ts
  effect: Adds CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE, the copy stated when a drafted
    schema stands stale.
- path: src/routes/capability-schema-helper-fields.tsx
  effect: Threads state.stale into CapabilitySchemaDraftStatement, which renders CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE
    inside the existing aria-live region when stale, leaving both the input_schema
    and output_schema apply buttons rendered exactly as before regardless of staleness.
criteria:
- criterion: A stated draft is marked with the link of the request that produced it,
    exactly as that request named it.
  met: true
  how: Already encoded by the prior task's outcomeFromMutation in use-draft-capability-schema-from-openapi.ts,
    whose 'drafted' case spreads ...mutation.variables (the exact {link, path, method}
    passed to requestDraft) onto the outcome -- outcome.link is exactly the link the
    request named. This task reads that same field in draftIsStale without altering
    how it is produced.
- criterion: A stated draft is marked with the operation of the request that produced
    it, exactly as that request named it.
  met: true
  how: The same spread carries path and method onto the 'drafted' outcome, so outcome.path/outcome.method
    equal exactly the operation the request named; draftIsStale in use-capability-schema-helper.ts
    compares against these two fields.
- criterion: While the helper's link and its chosen operation both equal the ones
    the stated draft was generated for, that draft is not stated as stale.
  met: true
  how: draftIsStale returns false once outcome.link === current.link, outcome.path
    === current.chosenOperation?.path and outcome.method === current.chosenOperation?.method;
    CapabilitySchemaDraftStatement only renders CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE
    when stale is true, so equal values render no stale statement.
- criterion: From the moment the helper's link differs from the one the stated draft
    was generated for, that draft is stated as stale.
  met: true
  how: draftIsStale is a pure function invoked with the helper's current link on every
    call to useCapabilitySchemaHelper, so a changed link flips the comparison to true
    on the very next render and CapabilitySchemaHelperFields renders the message reactively
    -- nothing is cached from before the change.
- criterion: From the moment the helper's chosen operation differs from the one the
    stated draft was generated for, that draft is stated as stale.
  met: true
  how: The same function compares current.chosenOperation?.path and ?.method against
    the outcome's own path and method on every render, so choosing a different operation
    (or none) is reflected the same render it happens.
- criterion: A draft stated as stale still offers the act applying its input_schema
    and the act applying its output_schema.
  met: true
  how: CapabilitySchemaHelperFields renders both Apply buttons inside CapabilitySchemaDraftStatement
    whenever state.outcome.kind === 'drafted'; the stale flag only conditions the
    added message paragraph and never wraps or disables either Button element.
- criterion: Staleness is read by comparing the stated outcome's own recorded request
    against the helper's current link and chosen operation, and no separate stale
    flag is stored.
  met: true
  how: draftIsStale takes outcome (the stated request's own recorded link/path/method)
    and the current {link, chosenOperation} as arguments and returns a boolean computed
    on the spot; useCapabilitySchemaHelper assigns it directly into the returned state
    literal, with no useState or useEffect holding a stale value across renders.
nodes:
- node: rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes
  encoded_at:
  - src/hooks/use-capability-schema-helper.ts
  - src/routes/capability-schema-helper-fields.tsx
  - src/services/capability-schema-messages.ts
  how: The draft's generated-for link and operation are the fields the prior task's
    outcome already carries; this delivery adds the comparison (draftIsStale) that
    turns 'the surface's link or chosen operation differs from either of those two'
    into a stated fact, and the two apply acts remain rendered unconditionally so
    the rule's 'the act applying it still offered' holds even while stale is true.
- node: scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale
  how: This task's own Notes already record that no criterion here reaches the scenario's
    'helper holds no chosen operation at all' clause -- every criterion is phrased
    as the link or operation 'differing from' the one the draft was generated for.
    draftIsStale's comparison (outcome.path !== current.chosenOperation?.path) happens
    to also read true once chosenOperation is undefined, so the scenario's stale-marking
    clause is incidentally produced by the same code; but the two clauses the task's
    Notes mark as REMAINDER -- the helper actually clearing its chosen operation once
    the named link changes, and the draft-request act being withheld with a message
    that it waits on a chosen operation -- are not implemented by this delivery, matching
    what the task assigned it to do.
inferences:
- inferred: An operation the draft was generated for is compared by its path and its
    method taken together, not by object identity of the chosen OpenApiOperation.
  from: use-connector-configuration-helper.ts's own draftIsStale, which compares statedFor.path
    and statedFor.method separately rather than comparing operation objects -- the
    convention the inventory records for the sibling helper's own staleness computation.
- inferred: 'The new stale field on CapabilitySchemaHelperState is optional (stale?:
    boolean) rather than required.'
  from: 'ConnectorConfigurationHelperState''s own `readonly stale?: boolean` declaration
    in use-connector-configuration-helper.ts, the adjacent sibling type this task''s
    Notes point to as already computing its own staleness the same way; keeping it
    optional also leaves capability-schema-helper-fields.spec.ts''s existing stateWith(...)
    literals (which build a CapabilitySchemaHelperState with no stale key) unaffected,
    since that file is not part of this task.'
- inferred: The wording of CAPABILITY_SCHEMA_DRAFT_STALE_MESSAGE and its placement
    as a single paragraph above both schema sections (rather than duplicated per field).
  from: The standard's own convention that a screen's exact wording for a stated outcome
    is the project's own copy where the specification leaves it open, and DRAFT_DISCLOSURE_STALE_MESSAGE
    in connector-configuration-messages.ts as the sibling's already-established phrasing
    and single-message placement for one draft covering more than one rendered field.
preserved:
- Both apply acts (applying input_schema, applying output_schema) remain offered exactly
  as the sibling task left them, whatever the staleness value.
- The existing four-way refusal disclosure and the operations-read disclosure states
  in CapabilitySchemaHelperFields render unchanged.
- The 'drafted' outcome's own recorded link, path and method fields, and how they
  are produced in use-draft-capability-schema-from-openapi.ts, are untouched.
---

## What it is

The marking that keeps an operator from reading a draft as an answer about an operation they have since moved away from, computed on the spot from the drafted outcome's own recorded request and the helper's current link and chosen operation, while leaving the draft itself and the act applying it exactly as they were.

## Notes

None.
