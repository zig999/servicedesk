---
title: Connector registration
summary: The validated write path that registers and persists an external system's connector descriptor before any call reads it.
rationale: The scope describes two genuinely different reasons to change — how a connector enters the system, and how an already-registered connector is executed at collection time. Splitting them into two epics keeps a change to the registration path from forcing a change to the runtime path, and lets each be demonstrated without the other already being built.
sources:
  - intake/scope.md
covers:
  - contracts/knowledge/capability-check
  - domain/investigation/citation
  - domain/glossary/concept
  - domain/glossary/subject-attribute
  - domain/integration/capability
  - domain/integration/capability-nature
  - rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-stored-schema-mirrors-the-declared-model
uncovered:
  - node: contracts/knowledge/capability-check
    why: The contract check's read of the current capability registration is unrelated to a connector descriptor and untouched by this plan.
  - node: domain/investigation/citation
    why: Citation's own shape and citation-validation.ts are unmodified; this plan only keeps the promise that check already relies on.
  - node: domain/glossary/concept
    why: Concept's own attributes are read to validate a descriptor but never changed by this plan.
  - node: domain/glossary/subject-attribute
    why: Read only where a Subject's attribute-values are assembled and validated at the entry point, unchanged by this plan; the specification ties no subject-attribute reference to a connector's own registration.
  - node: domain/integration/capability
    why: Capability's own attributes and its own registerCapability validation are unchanged; this plan only reads output_schema and connector to validate a descriptor.
  - node: domain/integration/capability-nature
    why: Nature enforcement belongs to registerCapability, already in place; this plan adds no new nature check.
  - node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
    why: This rule binds a citation's field to the output schema of the capability that produced the evidence, at judgment time; it constrains domain/investigation/citation and domain/integration/capability, never a connector descriptor's own registration, so registering how a connector executes claims none of it.
  - node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
    why: This rule binds a Subject's own attribute-values to the glossary at the entry point that assembles them; domain/investigation/subject states that a connector resolves on its own which attributes it needs and how to derive its call from them, so the specification does not check that derivation at a connector's registration.
  - node: rules/integration/a-capability-declares-its-contract
    why: The capability's own contract-declaration invariant is enforced by registerCapability, unchanged here; this plan only reads what that invariant already guarantees exists.
  - node: rules/integration/a-capability-is-read-only
    why: Read-only enforcement happens at registerCapability, unaffected by descriptor registration.
  - node: rules/integration/one-capability-answers-one-concept
    why: Concept-to-capability resolution is unchanged; a connector descriptor attaches to an already-resolved capability.
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    why: This is a knowledge-context check at case-authoring time, unaffected by how a capability's connector is executed.
  - node: rules/knowledge/the-contract-check-reads-the-current-registration
    why: The freshness-of-read guarantee belongs to the knowledge context's existing check, unaffected by this plan.
  - node: constraints/the-stored-schema-mirrors-the-declared-model
    why: Whether a connector descriptor counts as a record this constraint binds, and what column shape would keep every column paired to a declared Domain Model attribute, is left open by the scope's own explicit non-binding illustration; resolving it is the implementer's technical design and the specification-conformance review's to make, not a criterion fixed at planning time.
---

## What it is

The validated write path that registers a connector descriptor for a capability's connector before anything reads it at call time.
The relational persistence of that descriptor, alongside the rest of the system's records.

## Notes

This epic depends on the corporate-records/corporate-records-source generalization already being validated in the specification, per the scope's stated prerequisite.
The exact descriptor format and validation technique are the scope's own explicitly non-binding technical suggestion; the task within this epic is free to choose another technique.
