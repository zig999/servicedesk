---
title: Derive a case version's input requirements from its collection plan
summary: A published read-case-input-requirements route answers, per case version,
  the union of subject attributes its collection plan's capabilities declare, which
  are required, and which capabilities ask for each.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: A new route, read-case-input-requirements, answers for a case version in
  either state the union of subject attributes the input schemas of the capabilities
  answering its collection plan's concepts declare in properties, marks an attribute
  required where any such capability names it in required, names every capability
  asking for each attribute, and names separately any such capability whose stored
  input_schema does not currently hold a well-formed shape.
criteria:
- For a case version whose collection plan resolves to capabilities declaring input-schema
  properties, the read returns one entry per distinct subject attribute named in any
  of those properties.
- An entry's required is true when any capability answering the plan's concepts names
  that attribute in its own input schema's required.
- An entry names every currently registered capability that answers one of the plan's
  concepts and declares that attribute in properties.
- A concept the collection plan holds that no registered capability currently answers,
  or that more than one currently answers, contributes no attribute to the result.
- A capability whose stored input_schema does not currently hold a well-formed shape
  contributes no attribute and is named separately, apart from the attribute entries.
- The read answers for a case version in draft state exactly as it would for one in
  released state.
- The read is computed fresh from the currently registered capabilities at every call,
  never a stored or cached result.
depends_on:
- task/capability-input-schema-contract/refuse-malformed-capability-input-schema
rationale: This task reuses the shared input-schema shape reader the capability-input-schema-contract
  epic's task builds, per the inventory's note that the reader is a natural sibling
  of declaredFieldsOf shared across both consumers; the dependency records that reuse
  rather than an execution order. The exact placement of the new route beside the
  existing case-query surface is this decomposition's own choice, since the scope
  names only the operation and its answer, not its file.
implements:
- domain/knowledge/case-version
- domain/knowledge/case-input-requirement
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/the-contract-check-reads-the-current-registration
- contracts/knowledge/case-input-requirements
- scenarios/integration/a-legacy-capability-declares-no-input-attributes
---

## What it is
A published read-case-input-requirements route answers, per case version, the union of subject attributes its collection plan's capabilities declare, which are required, and which capabilities ask for each.

## Notes
None.
