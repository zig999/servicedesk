# Orphaned tests — connector-configuration-helper-fields specs from a closed initiative

## Wrong behavior observed

Delivering task/connector-configuration-helper-operation-listing/operation-choice-fields (this initiative) replaced the Configuration Helper's free-text "Operation path" and "Operation method" Input fields with a Select over the offered operations, per rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing.

Three pre-existing spec files, delivered under the now-closed initiative `connector-configuration-openapi-helper`, still drive the helper through those removed Input fields (`getByLabelText("Operation path")` / `getByLabelText("Operation method")`):

- frontend/app/src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
- frontend/app/src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
- frontend/app/src/routes/connector-configuration-create-screen-apply-draft.spec.ts

19 of their assertions fail against the delivered component. `connector-configuration-openapi-helper` already holds `closure.md` — reopening it is refused by the framework's own tooling, and the trace binds nothing to these spec files directly (bindings are to production source, never to test files), so this is not a corrective increment in the narrow sense (no file the trace already encodes to correct against).

## Decided fix

Rewrite the three spec files' Configuration Helper interactions to drive the Select the same way `operation-choice-fields`'s own new spec already does — choosing an offered entry rather than typing a path or a method — leaving every other assertion in each file untouched.
