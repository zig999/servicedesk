# Scope: Capability Schema Helper — frontend surface

Plan the frontend surface for the Capability Schema Helper, mirroring the existing
Configuration Helper's own screen/flow as its closest precedent.

The backend operation this frontend calls is already fully delivered and committed:
`contracts/integration/capability-schema-draft` (operation `draft-capability-schema-from-openapi`),
at `delivery/capability-schema-helper-backend/`. It is a POST accepting
`{ link, path, method }`, answering HTTP 200 with `{ input_schema, output_schema, unresolved }`
or refusing under HTTP 422 (`OpenApiDocumentNotFetchedError`, `OpenApiDocumentNotReadableError`,
`OpenApiOperationNotFoundError`) or HTTP 500 (`INTERNAL_ERROR`). Read that delivery's
implementation and proof records for the exact request/response shape and error disclosures.

This initiative covers exactly the surface-facing specification nodes already written during
`/analyse` for this feature but deliberately left out of the backend plan (deferred there for
this frontend initiative):

- rules/integration/a-capability-authoring-surface-offers-a-schema-helper
- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
- rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
- rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
- rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
- rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes

Use the existing Configuration Helper's own frontend screen (its own Apply-to-local-edit flow,
its own staleness marking, its own layout) as the direct precedent to survey and mirror.
