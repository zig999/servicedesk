---
title: Capability resolution
summary: The published read-capability that answers the capability currently registered for a concept.
rationale: Cut as the seam between the registry and its consumers, so the contract check consumes a contract rather than the registry's store; the scope stated the read without cutting it from registration.
objective: read-capability resolves a concept to exactly one capability, as currently registered, with its declared contract.
criteria:
  - Reading a concept one capability answers returns that capability with its name, version, nature, both schemas, timeout and connector.
  - Reading a concept no capability currently answers reports the absence rather than an invented capability.
  - No concept ever resolves to more than one capability.
  - A read after a registration changes answers the registration as it stands, never a remembered one.
depends_on:
  - task/capability-registry/capability-registration
implements:
  - domain/integration/capability
  - domain/integration/capability-nature
  - domain/integration/capability-registry
  - contracts/integration/capability-registry
  - rules/integration/one-capability-answers-one-concept
  - constraints/the-mvp-persists-to-no-database
sources:
  - intake/scope.md
---
## What it is
The capability-registry contract's one operation, the upstream the case contract check reads through.

## Notes
REMAINDER, from the specification — the single clause of rules/integration/a-capability-is-read-only acts at registration and reaches no criterion of this task. Belongs: the capability-registration task.
REMAINDER, from the specification — both clauses of rules/integration/a-capability-declares-its-contract are registration-time obligations; criterion 1 returns the stored contract but nothing here enforces its declaration or applies the default. Belongs: the capability-registration task.
UNDERDETERMINED, from the specification — domain/integration/capability-registry states the lookup is one to one with no fallback chain, and the fallback resolution plan was cut and stays cut; no criterion excludes fallback machinery. Passes as written: a resolver keeping a priority-ordered chain per concept and answering its head, satisfying all four criteria while shipping the chain the specification refuses.
Advisory — the form of the absence report in criterion 2 is stated by no candidate: the contract declares only the positive answer, and the downstream consumer contracts/knowledge/capability-check presupposes the read distinguishes absence, yet no node states what the read answers on a miss; if the business wants a named refusal or status, the analysis states it before the conformance pass finds one asserted only in code.
Decision, beyond the covers — stand: contracts/knowledge/capability-check is named only as the downstream consumer locating the seam; the fact it presupposes lives in this epic's own published read, and nothing in this task implements the knowledge-context contract.
