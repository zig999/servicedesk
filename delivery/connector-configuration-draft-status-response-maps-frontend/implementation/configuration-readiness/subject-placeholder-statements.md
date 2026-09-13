---
target: frontend
title: Subject-placeholder readiness statement for connector configuration
summary: A new pure judgment service, hook and view state, for each distinct
  ${subject:<attribute-name>} placeholder the Configuration field's well-formed JSON text embeds,
  whether every capability registered under the connector declares that attribute -- naming the
  ones that don't, or stating the check cannot be made when no capability is registered.
task: sha256:57849b368ff5aa5e35d55a2ac394ade1623fee3c3f328b19cf87b0f35223ce69
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-subject-placeholder-statements-build
files:
- path: src/services/connector-configuration-subject-placeholder-statements.ts
  effect: New pure service. Parses the Configuration field's text as a JSON object (returns [] if
    not well-formed), walks it recursively for every string value to extract every distinct
    ${subject:<attribute-name>} placeholder. Returns [] when no subject placeholder is found.
    Where the given connector-filtered capability list is empty, returns a single
    { kind = "cannot-be-checked" } entry. Otherwise, for each distinct attribute name, parses
    every capability's input_schema as JSON and reads its top-level properties object's keys
    (defensively treating a parse failure or a missing/non-object properties as "declares
    nothing"), and returns { kind = "declared" } when every capability declares the attribute or
    { kind = "undeclared", nonDeclaringCapabilityLabels } naming every capability that does not.
- path: src/hooks/use-subject-placeholder-statements.ts
  effect: New hook. Calls useCapabilities() once, filters by connector name, and memoizes the
    call into computeSubjectPlaceholderStatements over the connector name and configuration text
    -- the single point where the capability registry is read for this statement.
- path: src/routes/connector-configuration-subject-placeholder-statements-view.tsx
  effect: New sibling view component SubjectPlaceholderStatements, following the same structural
    pattern as HttpConnectorDeparturesStatement -- renders nothing when the statement list is
    empty, otherwise a heading and a list of pt-BR statement lines.
- path: src/services/connector-configuration-messages.ts
  effect: Adds SUBJECT_PLACEHOLDER_STATEMENTS_HEADING, SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE,
    subjectPlaceholderDeclaredText and subjectPlaceholderUndeclaredText -- all pt-BR.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Reads the connector name once via a single connector = watch("connector") binding
    (reused for both the new hook and the pre-existing ConnectorConfigurationHelper prop),
    calls useSubjectPlaceholderStatements(connector, configuration.value), and renders
    <SubjectPlaceholderStatements /> right after the existing HttpConnectorDeparturesStatement.
criteria:
- criterion: Where every capability registered naming the connector declares the attribute name
    among its input schema properties, the surface states that the placeholder is declared.
  met: true
  how: computeSubjectPlaceholderStatements returns { kind = "declared" } for a placeholder's
    attribute name when nonDeclaringCapabilityLabels is empty; the view renders
    subjectPlaceholderDeclaredText for it.
- criterion: Where one such capability does not declare the attribute name, the surface states
    that placeholder and names the capability that does not declare it.
  met: true
  how: When at least one capability's properties lack the attribute name,
    computeSubjectPlaceholderStatements returns { kind = "undeclared", nonDeclaringCapabilityLabels }
    naming every non-declaring capability, chosen as the more informative of the two equally
    valid readings the task's own notes allow.
- criterion: Where no capability is registered naming the connector, the surface states that the
    field's subject placeholders cannot be checked.
  met: true
  how: computeSubjectPlaceholderStatements checks connectorCapabilities.length === 0 before any
    per-placeholder judgment and returns a single cannot-be-checked entry, not one per placeholder.
- criterion: The statement is made over the content the Configuration field currently holds,
    whether that content was typed, applied from a draft or carried by a read.
  met: true
  how: useSubjectPlaceholderStatements is memoized directly from configuration.value, read live
    on every render exactly like the two existing sibling readiness statements.
- criterion: The capabilities the statement is read from come from the connector-filterable
    capability list this area already holds, and no second read of the capability registry is
    added.
  met: true
  how: useSubjectPlaceholderStatements calls useCapabilities() exactly once and filters by
    capability.connector === connector -- the identical pattern use-test-connector-panel.ts
    already uses.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/services/connector-configuration-subject-placeholder-statements.ts
  how: 'The service treats the Configuration field''s text exactly as this node describes: opaque,
    well-formed JSON object text.'
- node: rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
  encoded_at:
  - src/services/connector-configuration-subject-placeholder-statements.ts
  how: Only the ${subject:<attribute-name>} form is matched; ${requester} and ${credential:<name>}
    are left alone, per this task's REMAINDER note.
- node: rules/integration/a-connector-configuration-surface-states-a-subject-placeholder-no-registered-capability-declares
  encoded_at:
  - src/services/connector-configuration-subject-placeholder-statements.ts
  - src/hooks/use-subject-placeholder-statements.ts
  - src/routes/connector-configuration-subject-placeholder-statements-view.tsx
  - src/services/connector-configuration-messages.ts
  how: This is the rule this task implements directly -- computeSubjectPlaceholderStatements
    answers all three of its clauses, read from the capabilities currently registered naming the
    connector at render time.
- node: rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  how: The statement is rendered unconditionally beside the field; nothing in this change
    disables or hides Save or any other act.
inferences:
- inferred: A capability whose input_schema fails JSON.parse, or whose parsed value is not a
    plain object, or whose properties key is missing or not itself a plain object, is treated as
    declaring no properties at all.
  from: The task's own instruction to handle this defensively, and domain/integration/capability's
    Description that input_schema, once its own shape is declared, names the subject attributes
    it uses -- implying an undeclared shape names none.
- inferred: Named all non-declaring capabilities in an undeclared statement, rather than just one.
  from: The task's explicit note that both readings are equally valid; chose the more
    informative one, consistent with HttpConnectorDeparturesStatement already listing every
    departure rather than only the first.
- inferred: A capability is identified in the statement's text by "name (version)".
  from: use-test-connector-panel.ts's existing capabilityOptions label convention.
- inferred: Extracted the capability-filtering and statement computation into a new hook instead
    of inlining useMemo calls directly in connector-configuration-form-fields.tsx.
  from: The file's near-300-line size constraint; inlining pushed the file to 302 lines, the
    extraction brought it to 293.
preserved:
- The two existing sibling readiness statements (ConfigurationEntryGuidance,
  HttpConnectorDeparturesStatement) and their own useMemo computations, untouched.
- The apply-confirmation diff flow and the Save button's isSaveDisabled/isDirty logic -- none of
  it reads or is gated by the new statement.
- ConnectorConfigurationHelper's own connector prop behavior -- now fed from the same connector
  binding rather than a second watch("connector") call, but the value and its effect are
  unchanged.
- connector-configuration-http-departures.ts's public contract -- not modified; its internal
  string-walk shape was duplicated rather than exported.
deferred:
- what: 'The ${requester} and ${credential:<name>} clauses, and the general ${kind}/${kind:argument}
    form.'
  why: The task's own REMAINDER note assigns these to the HTTP-departure and
    credential-placeholder tasks.
- what: The UNDERDETERMINED conflict the task's Notes record over whether any statement here
    should withhold an act.
  why: Marked UNDERDETERMINED by the task and deferred to scope or specification; this delivery
    states unconditionally and gates nothing.
---

## What it is
The reading the registry makes at the moment of the write, made beside the field while the operator can still correct it.

## Notes
Build round 1 green on the first attempt.
