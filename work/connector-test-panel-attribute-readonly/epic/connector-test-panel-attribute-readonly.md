---
title: Connector test panel attribute name read-only
summary: The Test Panel's Add attribute rows stop letting the operator type an arbitrary
  attribute name, since that name is already derived by reconciliation against Configuration's
  own placeholders.
sources:
- intake/scope.md
covers:
- rules/integration/an-http-connector-configuration-declares-its-call
- domain/integration/connector-configuration
- domain/glossary/subject-attribute
- domain/investigation/subject-attribute-value
- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
uncovered:
- node: domain/integration/connector-configuration
  why: The execution-contract-binder read this fresh and found only the rule it constrains
    (rules/integration/an-http-connector-configuration-declares-its-call) governs the Attribute
    field's derivation; the aggregate itself states no condition this epic's one task holds to.
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  why: The binder returned this as an underdetermined note on the epic's one task -- no criterion
    holds the displayed attribute name to glossary membership, and this epic holds no other task
    to scope it to. Left uncovered rather than answered by a criterion this corrective increment's
    own narrow scope (making the field read-only) does not ask for; the note travels with the task
    for whoever writes its tests.
---

## What it is
Fixes one wrong behavior in the connector Test Panel's own already-delivered Add attribute reconciliation: the row's Attribute field renders as an editable Input, letting the operator type a name that contradicts the name the reconciliation logic already derives from Configuration's placeholders.

## Notes
None.
