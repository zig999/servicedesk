---
title: The relational substrate
summary: The connection the service reaches its database through, the configuration that names it, the numbered scripts that build the schema, and the arrangement that lets the suite run against a database the schema was applied to.
rationale: "The scope names a database, a schema mirroring the declared model and a suite that runs against it, and leaves the division of that work open; it is cut apart from the adapters because a connection and a schema change when the deployment or the declared model changes, while an adapter changes when a port's behaviour does. The claim over the four case and hypothesis invariants is the planning's: the schema's keys are where those invariants are held once the medium is rows, so the epic that writes the keys claims what they hold."
sources:
  - intake/scope.md
covers:
  - constraints/the-database-is-externally-provisioned
  - constraints/the-schema-replays-from-its-scripts
  - constraints/the-stored-schema-mirrors-the-declared-model
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/the-evidence-cache-admits-only-ok-results
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/knowledge/consolidation-register
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/investigation/citation
  - domain/investigation/verdict
  - domain/investigation/evidence-result
  - domain/investigation/evaluation-reason
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/action
  - domain/glossary/outcome
  - domain/glossary/recipient
  - domain/integration/capability
  - domain/integration/capability-nature
  - rules/knowledge/a-slug-identifies-one-case
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
uncovered:
  - node: constraints/the-evidence-cache-admits-only-ok-results
    why: The constraint governs a cache when one exists, and this plan builds none — no relation, adapter or read path here caches evidence, so the schema holds nothing the rule could be applied to.
---

## What it is

The one decision about how this service reaches a database and what shape the data takes inside it.
It holds the driver and the connection module, the connection URL in the single environment schema, the numbered SQL scripts under migrations/ that create every relation, and the step that applies them so a suite can run against a schema the tree records.
Every Domain Model element the system records lands here as relations and columns, and the four invariants a key decides land here as keys.

## Notes

The four context descriptors of the impact set — domain/knowledge/_context, domain/investigation/_context, domain/glossary/_context and domain/integration/_context — carry no identity the plan contract's specification reference admits, so they appear in no covers list here or in any epic below.
Four claims here are held jointly with another epic and are shared scope rather than duplicates: the case and hypothesis elements with epic/case-and-investigation-model, the write-once and slug invariants with epic/relational-stores, the position and name invariants with epic/case-and-investigation-model, and the externally-provisioned constraint with epic/service-on-the-database.
The inventory reports the tree declares exactly three runtime dependencies and a guard spec asserts that exact set, so the driver's arrival moves that assertion with it.
The inventory reports no vitest configuration file exists, so a suite-wide setup has nowhere to hang until one is written.
