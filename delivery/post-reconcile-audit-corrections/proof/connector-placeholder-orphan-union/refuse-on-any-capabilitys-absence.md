---
target: backend
title: Any-one-capability orphan refusal, proven and the reversed intersection test rewritten
summary: Tests that the orphaned-placeholder check refuses on a placeholder absent from any one capability
  sharing the connector and succeeds only when every capability declares it, rewriting the one pre-existing
  test that pinned the old intersection semantics this task reverses.
implementation: sha256:98fde80c6dcd8408e8ecfd962e277fab885f7859b3fc14d455ce7bc059940cdf
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-placeholder-orphan-union-refuse-on-any-capabilitys-absence-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration when a placeholder naming a Subject attribute is present in one capability
    registered against the connector and absent from another's
  proves: Registering a connector configuration against a connector with two currently-registered capabilities,
    where a placeholder naming a Subject attribute is present in one capability's input schema properties
    and absent from the other's, is refused.
  fails_when: orphanedAcrossAnyCapability reverts to (or is otherwise implemented as) an intersection
    over the registered capabilities' own orphaned-placeholder sets, so a placeholder absent from one
    capability but declared by another no longer refuses the registration. This is the corrective rewrite
    of the pre-existing test "succeeds when at least one capability registered against the connector declares
    the placeholder attribute, even though another fails to", which asserted the old intersection semantics
    this task reverses (per the implementation record's own deferred entry) and is answered whole here
    rather than trimmed or deleted, since this delivery rewrote the very file that test covers.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: succeeds when every placeholder naming a Subject attribute is present in every capability registered
    against the connector
  proves: Registering a connector configuration whose every placeholder naming a Subject attribute is
    present in every currently-registered capability sharing that connector succeeds.
  fails_when: orphanedAcrossAnyCapability (or the union it builds) treats a placeholder as orphaned even
    though every capability currently registered against the connector declares it in its input schema
    properties, refusing a registration this criterion requires to succeed.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: names the orphaned placeholder together with the capability that fails to declare it
  proves: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused's given/when/then,
    whole -- a capability naming connector erp-http declaring only contract_number, a registration embedding
    a placeholder naming customer_document, refused, naming customer_document paired with the capability
    that does not declare it.
  fails_when: a registration against erp-http whose sole registered capability declares only contract_number,
    and whose own text embeds a customer_document placeholder, stops being refused, or the refusal's orphaned
    entry stops naming customer_document paired with exactly that capability. Pre-existing and unmodified
    by this task -- the single-capability case is unaffected by the union/intersection rewrite (with one
    capability the two agree), so this is the tests-that-exist proof rather than a new behavioral test
    written over a case this task did not change.
  demonstrates: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
not_applicable:
- edge_case: Two registrations against the same connector racing concurrently
  why: 'No criterion or node this task implements states a concurrency guarantee for register-connector;
    rules/integration/a-connector-placeholder-is-declared-by-its-capability''s own consistency: eventual
    already accepts transient disagreement between the two registries rather than requiring a lock this
    task would need to test, and this task changes only which placeholders are computed as orphaned, not
    the registration''s transaction shape.'
- edge_case: A connector-configuration payload above a configured size limit
  why: This task's obligations concern only which placeholders count as orphaned once a well-formed configuration
    is already in hand; a body-size refusal is a validation-boundary concern (EDG-06) untouched by the
    file this task rewrote.
- edge_case: Three or more capabilities registered against the connector, in varied combinations of declaring
    and not declaring the placeholder
  why: One representative of "one declares, one absent" (criterion 1) and one of "all declare" (criterion
    2) already exercise every boundary the any-one-capability union reads; a third capability changes
    nothing the union checks (it still stops at the first absence, or unions to empty when all declare),
    so a dimension the obligation does not read is not multiplied into a further case.
- edge_case: A registered capability whose own input schema is itself malformed
  why: Owned by rules/integration/a-capability-input-schema-holds-a-well-formed-object per the domain
    node's own Description ("a-capability-input-schema-holds-a-well-formed-object fixes what properties
    declares; this is the other half"), which this task does not implement and orphanedPlaceholders/subjectAttributePlaceholderNamesIn
    (unchanged by this task) is where that would be exercised, not the rewritten orphanedAcrossAnyCapability.
untested:
- 'rules/integration/a-connector-placeholder-is-declared-by-its-capability''s fact, whole, is not decided
  by a finite test in this proof: the node states one policy across two directions -- a connector-configuration
  registration held to a currently-registered capability''s declared properties, and a capability registration
  held to an already-registered connector configuration''s embedded placeholders. This task''s own REMAINDER
  note places the second direction outside what it implements (belongs to the capability registry''s register-capability
  act), and no file this task touched carries it, so no test here can exercise both directions together.
  The criterion tests above exercise only the first direction under the any-one-capability reading; that
  is part of the node''s stated fact, not the whole of it.'
- domain/integration/connector-configuration-registry's Responsibility conjoins several duties -- refusing
  a not-well-formed configuration, refusing an orphaned-placeholder registration, holding the current
  configuration per connector name, and removing a configuration unconditionally -- across several operations.
  No single test in the suite asserts that whole conjunction at once (each duty already has its own separate
  tests elsewhere in the file), and this task changes only the orphaned-placeholder sub-clause within
  it, so approximating the node with a test over one clause would assert part of it as the whole. Per
  SPEC-004 R12, the node is left here rather than approximated.
- 'UNDERDETERMINED, from the specification -- no criterion checks what the refusal reports, entry: the
  note observes that rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder
  (not claimed by this task''s implements) is what would settle whether an orphaned entry should pair
  with every capability sharing the connector or only the ones failing to declare it, and whether the
  orphaned list itself may be empty or partial -- and names no candidate implementation of its own to
  fail a test over, since the current code''s own choice (pairing every orphaned entry with the full capabilities
  array, declaring or not) is itself one of the passes the note lists as satisfying this task''s criteria
  without being excluded by them. Per the discipline governing this proof, an entry that names no implementation
  to test against is recorded here rather than answered with an invented one; the gap is the binder''s
  finding to close by claiming that node in a task that implements it, not a fact this proof can pin.'
---

## What it is

Proves the any-one-capability orphaned-placeholder refusal and rewrites the one pre-existing test that pinned the old intersection semantics this task reverses.

## Notes

None.
