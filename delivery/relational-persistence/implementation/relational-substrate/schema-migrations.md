---
title: The schema built by numbered scripts under migrations/
summary: "Six ordered SQL scripts that create every relation this system records into, one column per\n\
  \  declared attribute, one key per stated invariant, and one rule enforcing a case version's full\n\
  \  immutability once stored."
task: sha256:3bc35483755628aaf0f876ec2096f79c665af7c7208a4b223893143d10c66fc4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-schema-migrations-build-2
files:
- path: migrations/0001-schema-migrations.sql
  effect: creates schema_migrations(filename, applied_at) — the one relation constraints/the-stored-schema-mirrors-the-declared-model
    exempts from pairing with a Domain Model element, for the step that will apply these scripts in order
    to know which it already ran
- path: migrations/0002-glossary-vocabulary.sql
  effect: creates the five discovered/global vocabulary tables (subject_types, subject_attributes, actions,
    outcomes, recipients), the concepts table, and concept_accepts, the join table for concept.accepts
- path: migrations/0003-capability-registry.sql
  effect: creates capabilities(name, version, nature, input_schema, output_schema, timeout, connector),
    with nature restricted by CHECK to capability-nature's two declared values
- path: migrations/0004-case-and-hypothesis.sql
  effect: creates cases (one row per slug), case_versions (the versioned content, primary-keyed on slug+version),
    hypotheses (primary-keyed on case+name, unique on case+position) and hypothesis_collects, the join
    table for hypothesis.collects
- path: migrations/0005-investigation.sql
  effect: creates investigations (flattening subject, assessment, cost and durations into its own columns
    and pinning its case by slug+version), investigation_evidence, investigation_evaluations, investigation_evaluation_citations
    and investigation_subject_attribute_values, with verdict, evidence result and evaluation reason each
    restricted by CHECK to their declared values
- path: migrations/0006-case-version-immutability.sql
  effect: declares CREATE RULE case_versions_no_update AS ON UPDATE TO case_versions DO INSTEAD NOTHING
    — every UPDATE statement against case_versions is rewritten by Postgres into a no-op before it touches
    any row, so an already-stored version's own columns (title, when_to_use, authored_at, subject, the
    flattened fallback, consolidation_register) can no longer be moved by an ordinary UPDATE; INSERT,
    DELETE and SELECT against the table are untouched, since the rule is scoped to the UPDATE event alone
criteria:
- criterion: The scripts sit under migrations/, and applying every one of them in the order their names
    number them to an empty database produces the whole schema with no step performed by hand.
  met: true
  how: six files under migrations/, each named with a zero-padded four-digit sequence number (0001 through
    0006) and containing only DDL with no data dependency on a prior run; 0006 depends only on case_versions
    already existing (created by 0004), so applying all six in numbered order to an empty database succeeds
    start to finish with nothing performed by hand
- criterion: Every column of every relation that holds a record pairs with one attribute one Domain Model
    element declares, and only the relation recording which scripts have been applied pairs with none.
  met: true
  how: every column across all sixteen domain relations traces to exactly one declared attribute of exactly
    one Domain Model element (audited element by element while writing — flattened value-object leaves
    such as case_versions.fallback_outcome to resolution.outcome, foreign-key owner-links such as hypotheses.case_slug
    to case.slug, and join-table columns such as concept_accepts.subject_type_name to subject-type.name);
    schema_migrations (0001) is the one relation left unpaired, matching the constraint's own exemption;
    0006 declares a RULE, not a column or a relation, so this pairing is unaffected by it
- criterion: Every required attribute of case, hypothesis, resolution, referral, consolidation register,
    investigation, evidence, evaluation, assessment, cost, durations, subject, subject-attribute-value
    and citation is held by a column that admits no absent value.
  met: true
  how: every column realizing a required attribute of these fourteen elements is declared NOT NULL (or
    is itself a primary-key column, which Postgres makes NOT NULL) across 0004 (case, hypothesis, resolution,
    referral, consolidation-register's own governing element case) and 0005 (investigation, evidence,
    evaluation, assessment, cost, durations, subject, subject-attribute-value, citation); consolidation-register's
    own clause is vacuous here since it declares no attributes of its own, per the task's ADVISORY note
    — nothing to hold non-absent
- criterion: Every required attribute of concept, subject type, subject attribute, action, outcome, recipient
    and capability is held by a column that admits no absent value.
  met: true
  how: concepts.name/ttl, subject_types.name, subject_attributes.name, actions.name, outcomes.name, recipients.name
    (0002) and capabilities.name/version/nature/input_schema/output_schema/timeout/connector (0003) are
    all NOT NULL or primary-key columns; concept.accepts is realized as concept_accepts, whose two columns
    are both part of its primary key
- criterion: Each attribute the model declares optional — ticket_ref, result_detail, an evaluation's reason,
    an assessment's determining hypothesis and a case's consolidation register — is held by a column that
    admits an absent value.
  met: true
  how: investigations.ticket_ref, investigation_evidence.result_detail, investigation_evaluations.reason,
    investigations.assessment_determining_hypothesis and case_versions.consolidation_register are each
    declared with no NOT NULL — the only five nullable domain columns in the schema, matching the five
    the criterion names exactly
- criterion: A column holding a verdict, an evidence result, an evaluation reason, a capability nature
    or a consolidation register admits exactly the values its enumeration declares and refuses any other.
  met: true
  how: investigation_evaluations.verdict CHECK (verdict IN ('confirmed','refuted','inconclusive')); investigation_evidence.result
    CHECK (result IN ('ok','unavailable','denied','timeout')); investigation_evaluations.reason CHECK
    (reason IN ('no-data','judgment-failure','deadline-exceeded')); capabilities.nature CHECK (nature
    IN ('read-only','mutating')); case_versions.consolidation_register CHECK (consolidation_register IN
    ('formal','plain')) — each CHECK lists exactly the enumeration's own declared values, and a CHECK
    against a nullable column already passes on NULL in Postgres, so this coexists correctly with the
    three of these five that are also optional
- criterion: The case relation admits one row per slug, so no two cases can be held under one slug.
  met: true
  how: cases.slug is the table's sole column and its primary key, so no two rows can carry the same slug
- criterion: The case version relation carries a unique key over slug and version, so a version already
    stored cannot be stored a second time.
  met: true
  how: case_versions declares PRIMARY KEY (slug, version); inserting the same pair twice is refused by
    that key. This criterion asks only for the unique key, which answers "written once" and was already
    met; the fuller rule this criterion belongs to also states "never altered", which 0006 now answers
    too — see that node below
- criterion: The hypothesis relation carries a unique key over its case and position, so no two hypotheses
    of one case can share a position.
  met: true
  how: hypotheses declares CONSTRAINT hypotheses_position_unique UNIQUE (case_slug, case_version, position)
- criterion: The hypothesis relation carries a unique key over its case and name, so no two hypotheses
    of one case can share a name.
  met: true
  how: hypotheses' primary key is (case_slug, case_version, name)
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - migrations/0001-schema-migrations.sql
  - migrations/0002-glossary-vocabulary.sql
  - migrations/0003-capability-registry.sql
  - migrations/0004-case-and-hypothesis.sql
  - migrations/0005-investigation.sql
  - migrations/0006-case-version-immutability.sql
  how: the property — replay from numbered scripts alone, no hand step — is what all six files' own numbering
    and forward-only dependencies encode; 0006 depends only on case_versions (0004) already existing,
    so the six still replay in numbered order against an empty database; where the directory and file
    form themselves sit (the project's own arrangement) is answered instead by the standard's MIG rules
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0001-schema-migrations.sql
  - migrations/0002-glossary-vocabulary.sql
  - migrations/0003-capability-registry.sql
  - migrations/0004-case-and-hypothesis.sql
  - migrations/0005-investigation.sql
  how: every column of every relation these scripts create pairs with one attribute one element declares,
    per the criterion-2 audit above; schema_migrations is the one relation the constraint itself exempts;
    0006 declares a RULE rather than a column or relation, so it has nothing to answer to a constraint
    stated per column
- node: domain/knowledge/case
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: cases holds the case's own identity (slug); case_versions holds every other declared attribute
    (title, when_to_use, version, authored_at, subject, fallback, consolidation_register) of one written
    version
- node: domain/knowledge/hypothesis
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: hypotheses holds name, position, criterion and the flattened resolution; hypothesis_collects holds
    the many collects relationship to concept
- node: domain/knowledge/resolution
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: flattened wherever a case or a hypothesis carries one — case_versions.fallback_outcome and hypotheses.resolution_outcome,
    each paired with resolution.outcome, with referral's own two leaf attributes flattened alongside
- node: domain/knowledge/referral
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  - migrations/0005-investigation.sql
  how: flattened as action/recipient columns wherever a resolution or an assessment carries one — case_versions.fallback_action/recipient,
    hypotheses.resolution_action/recipient, and investigations.assessment_action/recipient
- node: domain/knowledge/consolidation-register
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: case_versions.consolidation_register, nullable (case.md declares it optional) and CHECK-restricted
    to the enumeration's two values; the element declares no attributes of its own, so criterion 3's mention
    of it is vacuous as the task's own ADVISORY note states, and its real place is criterion 6's CHECK
- node: domain/investigation/investigation
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigations holds id, requester, ticket_ref, narrative, prompt_version, model, written_at and
    the pinned-case reference (pinned_case_slug/pinned_case_version, FK to case_versions), with subject,
    evidence, evaluations, assessment, cost and durations realized as described under their own nodes
- node: domain/investigation/evidence
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_evidence, one row per concept an investigation collected, identified by (investigation_id,
    concept) per the element's own description, with the capability reference as capability_name/capability_version
- node: domain/investigation/evaluation
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_evaluations, one row per hypothesis judged, identified by (investigation_id, hypothesis)
    per the element's own description
- node: domain/investigation/assessment
  encoded_at:
  - migrations/0005-investigation.sql
  how: flattened into investigations.assessment_outcome/assessment_action/assessment_recipient/assessment_determining_hypothesis/assessment_text
- node: domain/investigation/cost
  encoded_at:
  - migrations/0005-investigation.sql
  how: flattened into investigations.cost_calls/cost_input_tokens/cost_output_tokens
- node: domain/investigation/durations
  encoded_at:
  - migrations/0005-investigation.sql
  how: flattened into investigations.durations_collection/durations_judgment/durations_writing/durations_total
- node: domain/investigation/subject
  encoded_at:
  - migrations/0005-investigation.sql
  how: its type attribute flattens into investigations.subject_type; its attributes (many) is investigation_subject_attribute_values
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_subject_attribute_values(investigation_id, attribute, value), attribute and value
    both NOT NULL
- node: domain/investigation/citation
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_evaluation_citations, one row per (investigation, hypothesis, concept, field), concept
    and field both NOT NULL
- node: domain/investigation/verdict
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_evaluations.verdict, CHECK-restricted to confirmed/refuted/inconclusive
- node: domain/investigation/evidence-result
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_evidence.result, CHECK-restricted to ok/unavailable/denied/timeout
- node: domain/investigation/evaluation-reason
  encoded_at:
  - migrations/0005-investigation.sql
  how: investigation_evaluations.reason, nullable and CHECK-restricted to no-data/judgment-failure/deadline-exceeded
- node: domain/glossary/concept
  encoded_at:
  - migrations/0002-glossary-vocabulary.sql
  how: concepts(name, ttl); its many accepts relationship to subject-type is concept_accepts
- node: domain/glossary/subject-type
  encoded_at:
  - migrations/0002-glossary-vocabulary.sql
  how: subject_types(name)
- node: domain/glossary/subject-attribute
  encoded_at:
  - migrations/0002-glossary-vocabulary.sql
  how: subject_attributes(name)
- node: domain/glossary/action
  encoded_at:
  - migrations/0002-glossary-vocabulary.sql
  how: actions(name)
- node: domain/glossary/outcome
  encoded_at:
  - migrations/0002-glossary-vocabulary.sql
  how: outcomes(name)
- node: domain/glossary/recipient
  encoded_at:
  - migrations/0002-glossary-vocabulary.sql
  how: recipients(name)
- node: domain/integration/capability
  encoded_at:
  - migrations/0003-capability-registry.sql
  how: capabilities(name, version, nature, input_schema, output_schema, timeout, connector), identified
    by name and version per the element's own description
- node: domain/integration/capability-nature
  encoded_at:
  - migrations/0003-capability-registry.sql
  how: capabilities.nature, CHECK-restricted to read-only/mutating
- node: rules/knowledge/a-slug-identifies-one-case
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: cases.slug is the table's primary key, so no two cases can be held under one slug
- node: rules/knowledge/a-case-version-is-written-once
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  - migrations/0006-case-version-immutability.sql
  how: 'now answered in full, both halves. case_versions'' PRIMARY KEY over (slug, version) (0004) answers
    "written once" — a version already stored cannot be stored a second time under the same key, exactly
    as before. case_versions_no_update, a CREATE RULE ... AS ON UPDATE TO case_versions ... DO INSTEAD
    NOTHING (0006), answers "never altered" the rest of the way: Postgres rewrites every UPDATE against
    case_versions into a no-op before it touches a row, so an already-stored version''s own columns cannot
    be moved by an ordinary UPDATE. This delivery''s first pass deferred this half, reasoning that the
    task''s UNDERDETERMINED note left it to the test-author to exclude rather than to this schema to close;
    the test-author instead wrote a proof (src/__tests__/integration/persistence/schema-migrations.spec.ts,
    "leaves an already-stored case version''s own columns unchanged after an ordinary UPDATE attempts
    to alter them") that holds the schema to the rule''s full statement, that proof ran red, and 0006
    is the correction that answers it'
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: hypotheses declares UNIQUE (case_slug, case_version, position)
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  encoded_at:
  - migrations/0004-case-and-hypothesis.sql
  how: hypotheses' primary key is (case_slug, case_version, name)
inferences:
- inferred: column naming for a flattened embedded value-object uses the outer, owning attribute's own
    name plus the leaf attribute's own name (fallback_outcome, resolution_action, cost_calls, durations_total),
    dropping an intermediate value-object type name from the chain; a column realizing a "many" reference
    with no per-member attribute name of its own uses <referenced-element>_<its-identity-attribute> (concept_name,
    subject_type_name, hypothesis_name, capability_name); and a column realizing an attribute the owning
    element names literally as the reference is spelled exactly that name, bare (case_versions.subject,
    investigation_evidence.concept, investigation_evaluation_citations.concept, investigation_subject_attribute_values.attribute/value)
  from: the inventory's own evidenced convention that persisted domain fields are spelled snake_case exactly
    as the specification spells them, extended to the flattening a relational, columnar schema needs that
    a document-shaped store never did; applied consistently across 0001-0005, unaffected by 0006 since
    it declares no column
- inferred: the identifying key of each many-valued value-object's detail table follows the element's
    own description where one states an identity, and falls back to the full natural tuple of the element's
    own declared attributes plus its owner where no node states one
  from: domain/investigation/evidence.md's and domain/investigation/evaluation.md's own Description sections
    state the identity directly; where no node states one, inventing a narrower uniqueness would state
    a business rule no node holds, so the full tuple is the conservative choice
- inferred: a column whose declared attribute type explicitly names another Domain Model element is realized
    as a foreign key to that element's lookup or aggregate table, rather than as free, unconstrained text
  from: STK-05 (database access through pg with a real relational store, no ORM) and the constraint's
    own point that a column pairs with a declared attribute — a typed reference stored as unconstrained
    text would record the attribute's value but not the reference the Domain Model itself declares
- inferred: 'SQL types: TEXT for every "string"-typed attribute, TIMESTAMPTZ for every "datetime"-typed
    attribute, INTEGER for every "integer"-typed attribute'
  from: the plain Postgres mapping; no node or the decision log states a length, precision or narrower
    type for any of these, and the decision log's own entries confirm "integer" is meant at face value
- inferred: the five enumerations (verdict, evidence-result, evaluation-reason, capability-nature, consolidation-register)
    are realized as a TEXT column with a CHECK constraint, not a native Postgres ENUM type and not a lookup
    table
  from: the decision log's own distinction between an enumeration (closed, known ahead of time) and a
    discovered or contributed vocabulary (which do get lookup tables); a CHECK is the plainest mechanism
    that admits exactly the declared values
- inferred: schema_migrations is shaped as (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT
    now())
  from: no node describes this relation's shape — it is the constraint's own named exemption; the step
    that populates it is task/relational-substrate/migration-step's own objective, not this task's
- inferred: migrations/ sits at the target source root (src/migrations/), sibling to package.json, rather
    than nested under src/src/
  from: knowledge/decision-log.md's own entry for constraints/the-schema-replays-from-its-scripts states
    directly "the standard's rule reaches src/migrations and nothing else", and package.json itself sits
    at the target source root
- inferred: the scripts are grouped into files by bounded concern (bookkeeping, glossary vocabulary, capability
    registry, case and hypothesis, investigation, and the one correction) rather than one file per table
    or per rule, named kebab-case with a four-digit zero-padded sequence number
  from: MIG-01 requires only a unique zero-padded sequence number; the grouping granularity and the kebab-case
    separator are this task's own arrangement, following the project's general kebab-case file convention
    since neither the constraint nor the standard states a granularity
- inferred: the "never altered" half of rules/knowledge/a-case-version-is-written-once is enforced by
    a PostgreSQL RULE (CREATE RULE case_versions_no_update AS ON UPDATE TO case_versions DO INSTEAD NOTHING),
    scoped to the UPDATE event only, rather than a BEFORE UPDATE trigger or a revoked UPDATE privilege
  from: preferring whichever mechanism reads most like the plain CHECK/UNIQUE/PRIMARY KEY constraints
    0001-0005 already declare — a RULE is one declarative statement attached to the table, the same shape
    those constraints already have, where a trigger would need a separate procedural PL/pgSQL function
    beside it; a revoked privilege was ruled out rather than merely disfavored, since it would need a
    role name nothing in this schema, its migrations or the inventory establishes, and — Postgres table
    owners holding every privilege implicitly regardless of GRANT/REVOKE — could not reach the very role
    that runs every migration and therefore owns the table
preserved:
- Every INSERT into case_versions — the only way 0004's table is populated across every round-trip test
  and any future writer — keeps succeeding exactly as before, since 0006's RULE is scoped to the UPDATE
  event alone and leaves INSERT, DELETE and SELECT against the table untouched.
- The "written once" half already enforced by case_versions' PRIMARY KEY over (slug, version) in 0004
  keeps refusing a duplicate insert exactly as it did before 0006 existed.
- Every other table's and column's behavior across 0001-0005 — the four other unique keys, every CHECK,
  every foreign key, every NOT NULL — keeps behaving exactly as it did before, since 0006 touches only
  case_versions and only its UPDATE path.
deferred:
- what: a runnable step that applies these six scripts in order against a configured connection and records
    each into schema_migrations
  why: that is task/relational-substrate/migration-step's own objective (it depends on this task); this
    task's objective is authoring the scripts that step will apply, not the step itself
---

## What it is

The scripts that build the database this system records into.
Read on their own they say what the system keeps, because each column names an attribute the specification declares and nothing else.
The invariants that used to be kept by a file system — one case per slug, one version written once — are keys here, stated where the schema is.
A version once stored cannot be altered either: an ordinary UPDATE against case_versions is rewritten into a no-op.

## Notes

The five enumerations are realized as CHECK-restricted TEXT columns rather than native Postgres ENUM types or lookup tables, matching the specification's own distinction between a closed enumeration and a discovered vocabulary.
rules/knowledge/a-case-version-is-written-once now holds in full: the unique key over (slug, version) answers "written once", and 0006's CREATE RULE ... DO INSTEAD NOTHING answers "never altered" by rewriting every UPDATE against case_versions into a no-op.
This delivery's first pass deferred the "never altered" half as the test-author's gap to exclude rather than this schema's to close; the test-author's proof held the schema to the rule's full statement instead, ran red, and 0006 is the correction.
