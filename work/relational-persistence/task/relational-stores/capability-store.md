---
title: ICapabilityStore answers from the database
summary: The relational adapter behind the capability store port, holding each registration's declared contract and resolving one capability per concept.
rationale: "One task per port is the planning's cut, each port being one behaviour demonstrable on its own. The refusal-on-duplicate-write and the unmatched-read mechanisms are dropped from the criteria that used to assert them: neither rule node nor the registry's own Responsibility states what happens on a second registration for a concept already answered or on a read for a concept none answers, so no criterion here may assert either."
sources:
  - intake/scope.md
depends_on:
  - task/relational-stores/database-access-helper
  - task/relational-substrate/schema-migrations
  - task/relational-substrate/integration-test-isolation
objective: ICapabilityStore reads and writes capability registrations against the database, one per concept and read-only.
criteria:
  - A read answers each registration with its name, version, nature, input schema, output schema, timeout and connector.
  - A read answers the registration as the database holds it at that call, never a value held from an earlier call.
  - A registration whose nature is not read-only does not enter the store.
  - A registration whose nature is read-only is not refused on that ground.
  - A registration that states no timeout is held with the default of sixty seconds.
  - The store resolves each concept to exactly one capability as currently registered.
implements:
  - domain/integration/capability
  - domain/integration/capability-registry
  - domain/integration/capability-nature
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - contracts/integration/capability-registry
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-stored-schema-mirrors-the-declared-model
---

## What it is

The registry the contract check reads.
It is the one lookup from a concept to the capability answering it, and validity is a fact about the registration as it stands now.

## Notes

The port at src/src/capability-registry/capability-store.port.ts, with readCapabilities and writeCapabilities, is implemented rather than replaced.
Dropped: "a second registration for a concept already answered is refused." rules/integration/one-capability-answers-one-concept states only the resolved one-to-one invariant and its own Description explicitly defers multiplicity handling — "the fallback resolution plan was cut and stays cut until it hurts" — and domain/integration/capability-registry's Responsibility names exactly two refusal grounds, neither a duplicate concept. What happens on a second registration for a concept already answered is a fact the specification does not state, so no criterion asserts it; settling it is /analyse's and a person's.
Dropped: "a read for a concept no registration answers gives absence as data rather than raising." Both contracts/integration/capability-registry and domain/integration/capability-registry describe only the matched-read case, and neither states an absence contract for a read that matches nothing.
The inventory reports a guard spec asserting the capability-registry directory reaches no service over the network.
UNDERDETERMINED, from the specification — rules/integration/a-capability-declares-its-contract's first clause carries no exception for the schemas the way its second clause exempts the timeout; domain/integration/capability marks input_schema, output_schema and connector required, and no criterion above states that a registration lacking one of them does not enter the store. A test must exclude a registration persisted with an absent schema or connector.
