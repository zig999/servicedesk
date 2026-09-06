# Scope addendum: rename to match the specification

The first cut of this corrective task kept the backend's existing error name (`CaseNotValidError`)
rather than the specification's own decided name (`CaseVersionNotValidError`), to avoid touching
the frontend consumer that already maps the old name. `execution-contract-binder` returned a
`BLOCKING` note over that cut: the node
`rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name` names the error
`CaseVersionNotValidError` explicitly, not incidentally — the decision log entry that settled the
node's own statement records the name as a deliberate choice ("The error name follows the
CaseVersionNot...Error family already in this context and names the condition directly").

The human was asked and chose to rename the code to match the specification, rather than amend the
specification to match the code. This task's own criteria now require the class renamed
`CaseVersionNotValidError` throughout the backend, and no file under the backend target may still
name the old identifier.

The frontend consumer (`error-ui-state.ts`'s mapping, and the two test fixtures a separate
review-change pass already flagged as contradicting this same node) is a different target's fix,
tracked separately.
