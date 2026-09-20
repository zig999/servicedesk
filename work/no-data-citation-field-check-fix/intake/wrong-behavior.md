# Wrong behavior

File: src/investigation/citation-validation.ts (target: backend / src root)

`citesADeclaredField` does:

    citedEvidence.fields.some(field => field.name === citation.field)

unconditionally. When `citation.field` is `undefined` — the no-data-verdict case, where the
cited evidence's `fields` legitimately snapshotted none — `.some()` over an empty array (or any
array lacking an entry literally named `undefined`) returns `false`, so the citation is rejected
as though it cited a field the schema does not declare.

This contradicts the second clause of
`rules/investigation/a-cited-field-exists-in-the-capability-output-schema`: a citation grounding
a no-data verdict carries no field, since the evidence it cites snapshotted none — such a
citation is not held to naming a declared field at all.

Reproduction: an observation whose evidence has `fields: []` (nothing was read, e.g. an
unavailable/errored capability run), cited by a no-data verdict with no `field` set. Expected:
the citation is accepted. Actual: `citesADeclaredField` returns `false` and the citation is
rejected as invalid.

Found as a conformance finding during /review-change of initiative recursive-output-schema-fields
(delivery/recursive-output-schema-fields/review/recursive-output-schema-fields.md finding #1),
confirmed still present in current source.
