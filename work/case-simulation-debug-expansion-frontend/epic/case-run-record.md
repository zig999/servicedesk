---
title: The case-level run record faced to the curator
summary: What one whole simulate-case run discloses after it finishes, held per run
  in the session history and presented in a Debug block under Case result.
covers:
- contracts/investigation/case-simulation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
- rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- domain/investigation/assessment
- domain/investigation/cost
- domain/investigation/durations
- domain/investigation/usage
- domain/knowledge/consolidation-register
- rules/investigation/the-customer-sees-only-the-text
- contracts/investigation/assessment-reviewed
- domain/glossary/outcome
- domain/knowledge/referral
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
- domain/investigation/assessment-consolidator
- domain/investigation/evaluation
- domain/investigation/investigation
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
- rules/investigation/a-simulation-carries-its-requester
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- rules/investigation/the-consolidation-answer-states-its-register
- rules/investigation/the-outcome-comes-from-the-case
- rules/investigation/the-response-follows-the-record
- rules/investigation/the-writing-input-is-narrowed
- rules/investigation/written-at-records-when-the-write-settled
- scenarios/investigation/a-draft-case-version-is-simulated
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
- scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
- scenarios/investigation/a-single-hypothesis-is-simulated
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
- scenarios/investigation/no-response-without-a-record
- scenarios/knowledge/no-confirmation-falls-back
- scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
- constraints/a-case-is-read-whole
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/consolidation-runs-behind-a-port
- constraints/diagnosis-answers-synchronously
- constraints/every-screen-discloses-that-authentication-is-unenforced
- constraints/listings-are-paged
- constraints/no-route-enforces-authentication
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-consolidation-prompt-is-closed
- constraints/the-database-is-externally-provisioned
- constraints/the-deadline-is-an-absolute-propagated-instant
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-pool-bounds-are-positive-integers
- constraints/the-schema-replays-from-its-scripts
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-system-persists-to-one-relational-database
uncovered:
- node: rules/investigation/the-customer-sees-only-the-text
  why: Every task under this epic builds a curator-facing Debug surface, which contracts/investigation/case-simulation
    already faces the withheld detail at; none of them touches or governs the customer-facing
    assessment delivery this rule bounds, so no task here implements it.
- node: contracts/investigation/assessment-reviewed
  why: A published domain event for an operator's later judgment of an assessment;
    no surface in this plan reviews an assessment or emits anything.
- node: domain/glossary/outcome
  why: The resolved outcome is already presented in the Case result section; this
    plan adds a Debug block beside it and changes nothing about the outcome shown.
- node: domain/knowledge/referral
  why: The referral is already presented in the Case result section and is untouched
    by this plan.
- node: domain/knowledge/case-version
  why: The pinned version this screen simulates against is read as it already is;
    no task here changes a version or how one is selected.
- node: domain/knowledge/hypothesis-revision
  why: A manifested revision is neither read nor written by any task in this plan.
- node: domain/investigation/assessment-consolidator
  why: The consolidation port runs backend-side; the screen displays the answer that
    call already returned.
- node: domain/investigation/evaluation
  why: Per-hypothesis evaluations already reach the hypotheses table and the per-hypothesis
    Debug; this plan adds no field to them and re-renders none of them.
- node: domain/investigation/investigation
  why: A simulation writes no investigation, so no task here reads, assembles or presents
    one.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  why: Binds what a measured span is recorded as, which happens backend-side; this
    plan presents the figures the run returned and measures nothing.
- node: rules/investigation/a-simulation-carries-its-requester
  why: The simulate call already carries its requester; no task here changes what
    the call sends or how a refusal is shown.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Staleness already stands on the run entry and in the cockpit; this plan adds
    fields beside the stale marking and changes nothing about when a result is marked
    stale.
- node: rules/investigation/the-consolidation-answer-states-its-register
  why: Binds what the consolidation call's own answer states, backend-side; the screen
    presents the register that answer already carries.
- node: rules/investigation/the-outcome-comes-from-the-case
  why: Outcome resolution happens in the pinned case version, backend-side; the screen
    presents the resolved outcome unchanged.
- node: rules/investigation/the-response-follows-the-record
  why: Governs a diagnosis answering only after its record is written; a simulation
    writes no record and this screen runs only simulations.
- node: rules/investigation/the-writing-input-is-narrowed
  why: Binds what consolidation receives, backend-side; the Consolidation tab displays
    the prompt that call materialized and assembles none.
- node: rules/investigation/written-at-records-when-the-write-settled
  why: Concerns an investigation's persistence, which a simulation never reaches.
- node: scenarios/investigation/a-draft-case-version-is-simulated
  why: Simulating a draft version already works on this screen; this plan adds no
    state to what a version may be simulated in.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  why: The staleness case is already delivered; no task here changes detection or
    the notice the curator is given.
- node: scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
  why: Concerns the subject composer before a run; this plan touches only what is
    shown after one.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  why: The narrowed hypothesis run already stands; this plan adds no behavior to it
    beyond what a run entry keeps.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: The same already-delivered staleness case, untouched by this plan.
- node: scenarios/investigation/no-response-without-a-record
  why: A diagnosis persistence case; a simulation writes no record and this screen
    runs only simulations.
- node: scenarios/knowledge/no-confirmation-falls-back
  why: Outcome resolution decided backend-side; the fallback outcome is presented
    as it already is.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  why: Outcome resolution decided backend-side; the determining hypothesis is presented
    as it already is.
- node: constraints/a-case-is-read-whole
  why: A backend read obligation over the case aggregate; this plan issues no case
    read.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: A backend refusal shape; no task here changes what a route answers or how the
    screen reports a failure.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: A backend refusal shape for a body failing a declared shape; this plan changes
    no request the screen sends.
- node: constraints/consolidation-runs-behind-a-port
  why: A backend structural obligation about where consolidation is invoked from.
- node: constraints/diagnosis-answers-synchronously
  why: Binds the diagnosis route; this screen runs only simulations and the scope
    excludes diagnosis.
- node: constraints/every-screen-discloses-that-authentication-is-unenforced
  why: The disclosure already stands on this screen and turns on nothing this plan
    changes; no route and no screen is added.
- node: constraints/listings-are-paged
  why: Binds list operations a published api offers; the session run history is held
    in the browser and is no such listing.
- node: constraints/no-route-enforces-authentication
  why: A backend perimeter posture; no task here touches a route or a guard.
- node: constraints/the-connection-pool-is-bounded-by-configuration
  why: Backend infrastructure configuration, outside a frontend-only scope.
- node: constraints/the-consolidation-prompt-is-closed
  why: Binds consolidation prompt assembly backend-side; the Consolidation tab displays
    the prompt the response carries and assembles none.
- node: constraints/the-database-is-externally-provisioned
  why: Backend infrastructure provisioning, outside a frontend-only scope.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  why: A backend propagation obligation; the screen presents the durations a run reported
    and propagates no deadline.
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  why: A backend route obligation; no task here changes how often the screen may call
    simulate or what a refusal looks like.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: A backend layering obligation over the domain package.
- node: constraints/the-pool-bounds-are-positive-integers
  why: Backend infrastructure configuration, outside a frontend-only scope.
- node: constraints/the-schema-replays-from-its-scripts
  why: Database schema management, outside a frontend-only scope.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: Database schema conformance, outside a frontend-only scope.
- node: constraints/the-system-persists-to-one-relational-database
  why: A persistence obligation; nothing in this plan persists anything beyond the
    browser session the run history already holds.
rationale: 'The grouping is mine, not the scope''s: what one whole run discloses changes
  for a different reason than what one evidence item discloses, so the case-level
  record is its own epic. It claims contracts/investigation/case-simulation because
  the contract''s sentence about returning the whole record back to the curator is
  what the Debug block answers to, and claiming it in one epic alone keeps the two
  epics from claiming a node in common.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
---

## What it is
The record one simulate-case run returns, held per run and shown to the curator after the run finishes.
It covers the consolidation call's own prompt, usage, elapsed time and register, the run's cost totals beside its stage durations, and the whole returned payload as raw JSON.
It also covers where that data lives: on each entry of the session run history rather than only on whatever the cockpit hook last held.

## Notes
The inventory records that lastCaseResult is today the only place the whole returned payload is reachable, which is why the run-entry task precedes every presentation task in this epic rather than following them.
The scope's own reading of contracts/investigation/case-simulation is that this screen is the curator-facing surface the contract already commits the whole record to, so nothing here asks the specification for a new fact.
