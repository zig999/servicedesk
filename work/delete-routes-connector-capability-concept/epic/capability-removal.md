---
title: Removing a registered capability
summary: remove-capability end to end — a real deletion keyed by name and version, the operation that
  refuses where collected evidence names that identity, and the DELETE route whose refusal is answered
  by a named status.
rationale: 'Cut as its own epic because its guard reads one thing only, evidence naming a capability identity,
  while the concept guard reads four — one reason to change each. The guard and the removal are kept in
  one task deliberately: they are the two branches of one rule statement, and splitting them would leave
  a task delivering an unguarded destructive removal whose own criteria the guard task would then falsify.'
sources:
- intake/scope.md
covers:
- contracts/integration/capability-registry
- domain/integration/capability-registry
- constraints/a-successful-capability-removal-answers-with-no-content
- domain/integration/capability
- rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/no-route-enforces-authentication
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
- domain/integration/capability-nature
- rules/integration/a-capability-is-read-only
- rules/integration/a-capability-declares-its-contract
- rules/integration/one-capability-answers-one-concept
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-capability-identity-read-is-rate-limited
- constraints/the-concept-read-refuses-an-unanswered-concept
- constraints/the-register-capability-route-defers-completeness-to-the-registry
- constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
- contracts/knowledge/capability-check
- rules/knowledge/the-contract-check-reads-the-current-registration
- rules/knowledge/every-collected-concept-has-a-read-only-capability
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-composed-subjects-input-names-every-capability-that-asks-for-it
- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
- rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
uncovered:
- node: domain/integration/capability-nature
  why: The nature vocabulary is read when a registration is judged; a removal reads no nature.
- node: rules/integration/a-capability-is-read-only
  why: A registration-time refusal over a submitted capability; a removal submits none.
- node: rules/integration/a-capability-declares-its-contract
  why: A registration-time completeness refusal; a removal reads no declared contract.
- node: rules/integration/one-capability-answers-one-concept
  why: Governs registering a second answerer and resolving a doubly-answered concept; a removal frees
    a concept without changing either branch, and no task alters the resolution.
- node: constraints/the-capability-identity-read-is-rate-limited
  why: Names read-capability-by-identity alone; the specification states no limit for the removal route
    and this plan invents none.
- node: constraints/the-concept-read-refuses-an-unanswered-concept
  why: read-capability's own miss behavior, unchanged by a removal.
- node: constraints/the-register-capability-route-defers-completeness-to-the-registry
  why: Governs the register-capability route's declared request shape, which no task here changes.
- node: constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
  why: Same reason; the removal route's shape carries a name and a version, not a nature.
- node: contracts/knowledge/capability-check
  why: The check's own operations are unchanged; a removal is visible to it without any change, because
    it reads the registration as it stands.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  why: Already requires the reading to be current, so a removed registration reads as absent with nothing
    added; no task touches the check.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  why: A curation-time validity requirement over a hypothesis-revision, unchanged by this plan.
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  why: A frontend composed-subject obligation; the scope names the backend target only.
- node: rules/investigation/a-composed-subjects-input-names-every-capability-that-asks-for-it
  why: Same reason.
- node: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
  why: Same reason.
- node: rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
  why: Same reason.
---

## What it is
The removal whose one refusal condition crosses from integration into investigation, which is why its operation depends on the evidence reader rather than owning the investigation store.
Its store method, its guarded operation and its route are three tasks, the store port and the route each being an interface whose consumer is the task before it.

## Notes
The rule's own Description states that nothing other than collected evidence persists a reference to a capability by identity, which is why this guard reads one source and the concept guard reads four.
The specification states no HTTP status and no error name for this refusal; the criteria hold the refusal to being named in the status map rather than to any particular status, so nothing downstream states a fact no node holds.
