---
title: The surface states a subject placeholder no registered capability declares
summary: For each ${subject:x} the field's well-formed content embeds, the surface says whether every
  capability registered under the connector declares that attribute, and says so cannot be checked where
  none is registered.
rationale: Cut apart from the other readiness statements because it is read from the registered capabilities'
  input schemas, a source none of the others touches, and it changes when that reading changes.
objective: The surface states, for each subject placeholder the Configuration field's well-formed content
  embeds, whether the attribute it names is declared by every capability registered naming the connector.
criteria:
- Where every capability registered naming the connector declares the attribute name among its input schema
  properties, the surface states that the placeholder is declared.
- Where one such capability does not declare the attribute name, the surface states that placeholder and
  names the capability that does not declare it.
- Where no capability is registered naming the connector, the surface states that the field's subject
  placeholders cannot be checked.
- The statement is made over the content the Configuration field currently holds, whether that content
  was typed, applied from a draft or carried by a read.
- The capabilities the statement is read from come from the connector-filterable capability list this
  area already holds, and no second read of the capability registry is added.
sources:
- intake/scope.md
implements:
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
- rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
---

## What it is
The reading the registry makes at the moment of the write, made beside the field while the operator can still correct it.
It hands the operator the correction before the write rather than a round trip after it.

## Notes
The surface's reading and the registry's can differ where a capability is registered between them, which is why the statement withholds nothing.
UNDERDETERMINED, from the specification -- No criterion says the subject-placeholder statement refuses nothing and withholds no act submitting the registration, while rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides states the surface refuses nothing on any of the four statements and withholds no submission beyond the well-formedness one.
A surface that states the undeclared subject placeholder, names the capability that does not declare it, and at the same time withholds or disables the act submitting the registration through register-connector while that statement stands satisfies every criterion above and the readiness-bound rule refuses it.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides binds four statements at once; its clauses covering the HTTP-connector departure statement, the credential-placeholder promise and the response-map key statement reach no criterion of this task. Belongs to the tasks implementing those three sibling readiness statements.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms states three literal forms; only ${subject:<attribute-name>} is reached by this task's criteria. The ${credential:<name>} clause belongs to the credential-placeholder task; the ${requester} clause and the general ${kind}/${kind:argument} form belong to the HTTP-departure and entry-guidance tasks.
ADVISORY, from the specification -- Criteria 1 through 3 are read from a capability's input schema properties and from a capability naming the connector, but domain/integration/capability -- the node holding input_schema and connector -- is not among the candidates.
Decision, beyond the covers — stand: domain/integration/capability is an unrelated, unchanged element this epic does not touch; growing the claim to cover it would be scope creep for a reference this task only reads, never redefines.
ADVISORY, from the specification -- Criterion 5 names the connector-filterable capability list this area already holds as the source of the capabilities. No candidate states a capability read, published or filterable by connector name; the criterion is an arrangement of the existing frontend area rather than anything a candidate governs.
ADVISORY, from the specification -- The statement this task makes is gated on the Configuration field's content being well-formed JSON object text, judged by rules/integration/a-connector-configuration-surface-judges-its-configuration-fields-content, a candidate left unimplemented here since its own statement is another task's. The two tasks must share one judgment of well-formedness.
