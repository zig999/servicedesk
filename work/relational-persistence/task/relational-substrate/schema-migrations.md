---
title: The schema is built by numbered scripts that mirror the declared model
summary: The SQL scripts under migrations/ that create every relation the system records into, each column pairing with an attribute a Domain Model element declares and each key holding an invariant the specification states.
rationale: The scope states the schema is created by ordered SQL migrations under migrations/ whose tables and columns mirror the declared elements; holding that to one task is the planning's, because the whole schema is one artifact and a column split across two tasks is a mirror neither of them owns. The keys are stated one per criterion because each holds a different invariant and each is falsifiable on its own.
sources:
  - intake/scope.md
depends_on:
  - task/relational-substrate/database-connection
objective: Applying the scripts under migrations/ in their numbered order to an empty database produces a schema whose every column pairs with a declared attribute of a Domain Model element.
criteria:
  - The scripts sit under migrations/, and applying every one of them in the order their names number them to an empty database produces the whole schema with no step performed by hand.
  - Every column of every relation that holds a record pairs with one attribute one Domain Model element declares, and only the relation recording which scripts have been applied pairs with none.
  - Every required attribute of case, hypothesis, resolution, referral, consolidation register, investigation, evidence, evaluation, assessment, cost, durations, subject, subject-attribute-value and citation is held by a column that admits no absent value.
  - Every required attribute of concept, subject type, subject attribute, action, outcome, recipient and capability is held by a column that admits no absent value.
  - Each attribute the model declares optional — ticket_ref, result_detail, an evaluation's reason, an assessment's determining hypothesis and a case's consolidation register — is held by a column that admits an absent value.
  - A column holding a verdict, an evidence result, an evaluation reason, a capability nature or a consolidation register admits exactly the values its enumeration declares and refuses any other.
  - The case relation admits one row per slug, so no two cases can be held under one slug.
  - The case version relation carries a unique key over slug and version, so a version already stored cannot be stored a second time.
  - The hypothesis relation carries a unique key over its case and position, so no two hypotheses of one case can share a position.
  - The hypothesis relation carries a unique key over its case and name, so no two hypotheses of one case can share a name.
implements:
  - constraints/the-schema-replays-from-its-scripts
  - constraints/the-stored-schema-mirrors-the-declared-model
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
---

## What it is

The scripts that build the database this system records into.
Read on their own they say what the system keeps, because each column names an attribute the specification declares and nothing else.
The invariants that used to be kept by a file system — one case per slug, one version written once — are keys here, stated where the schema is.

## Notes

The specification exempts the schema's own migration bookkeeping from the pairing and nothing else.
The inventory reports that persisted domain fields are spelled snake_case exactly as the specification spells them.
UNDERDETERMINED, from the specification — rules/knowledge/a-case-version-is-written-once states two things: "written once" and "never altered". Criterion 8's unique key over (slug, version) answers only the first; a schema whose case_version relation carries that key but leaves an already-stored row's non-key columns updatable by ordinary UPDATE would pass every criterion above while the rule's "never altered" clause is refused. A test must exclude an updatable stored row.
ADVISORY, from the specification — criterion 3 lists consolidation register among the elements whose required attributes need a non-absent column, but domain/knowledge/consolidation-register is an enumeration with no attributes at all; that clause is vacuous for it, and its real place is criterion 6, where it is separately named among the enumerations a column must be restricted to.
