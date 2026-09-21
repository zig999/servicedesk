---
title: Removing a connector configuration
summary: remove-connector end to end — a real deletion in the store, the registry operation that refuses
  nothing, and the DELETE route on the connector name.
rationale: 'Cut as its own epic because its governing rule carries no guard, so it shares neither a reader
  port nor a status-map entry with the other two removals, and because grouping it with them would put
  an unconditional removal and a guarded one under one claim. The split into three tasks is mine: the
  store port is an interface and the operation is its consumer, and the route is a second interface with
  the operation as its consumer. The three system constraints this epic covers alongside the two guarded
  epics are covered in each of them because each new route and each new port method answers to them on
  its own.'
sources:
- intake/scope.md
covers:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration-registry
- constraints/a-successful-connector-configuration-removal-answers-with-no-content
- domain/integration/connector-configuration
- rules/integration/removing-a-connector-configuration-is-unconditional
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/no-route-enforces-authentication
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
- domain/integration/connector-configuration-draft
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/an-unreachable-connector-ends-unavailable
- constraints/listings-are-paged
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
- constraints/the-database-is-externally-provisioned
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-pool-bounds-are-positive-integers
- constraints/every-screen-discloses-that-authentication-is-unenforced
uncovered:
- node: domain/integration/connector-configuration-draft
  why: A draft is generated, never stored and never removed; no task here reads or writes a draft.
- node: rules/integration/a-connector-configuration-names-its-connector
  why: A registration-time completeness refusal over a submitted configuration; a removal names an already-registered
    connector and submits no configuration to complete.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: A gate on both writes; the rule governing removal is unconditional, so no placeholder check runs
    at removal and the existing check on registration is unchanged.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: The path a capability left naming a removed configuration already takes, which is exactly why the
    removal is unconditional; no task alters the observation's own ending.
- node: rules/integration/an-unreachable-connector-ends-unavailable
  why: Observation-time degradation on a call that was issued; no removal issues a connector call.
- node: constraints/listings-are-paged
  why: The list operations are unchanged and a removal answers no page.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  why: Names the draft and operations-listing fetch; no removal fetches a document.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: The three removals delete rows from relations that already exist and declare no new column, so
    no task changes what any column pairs with.
- node: constraints/the-schema-replays-from-its-scripts
  why: No migration script is added or changed by this plan.
- node: constraints/the-database-is-externally-provisioned
  why: The deployment's own provisioning and connection URL are untouched.
- node: constraints/the-connection-pool-is-bounded-by-configuration
  why: No pool bound and no startup configuration is read or changed by a removal.
- node: constraints/the-pool-bounds-are-positive-integers
  why: Same reason; startup validation of the pool bounds is untouched.
- node: constraints/every-screen-discloses-that-authentication-is-unenforced
  why: A frontend obligation, and the scope names the backend target only, deferring every screen to a
    later surface decision.
---

## What it is
The one removal of the three whose governing rule states no condition at all.
Its store method, its registry operation and its route are three tasks because the store port and the route are each an interface whose consumer is the task before it.

## Notes
The specification states no HTTP status for this removal's success and no behavior for a name nothing is registered at; the intake material's 204 convention is the codebase's own pattern rather than something a node holds, so no task's criteria assert either.
