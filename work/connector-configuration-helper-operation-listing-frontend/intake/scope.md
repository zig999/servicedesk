Implement the Configuration Helper's OpenAPI operation listing on the frontend: once the operator
enters an OpenAPI document link in the Configuration Helper
(frontend/app/src/routes/connector-configuration-helper-fields.tsx,
frontend/app/src/hooks/use-connector-configuration-helper.ts), call the backend's
read-openapi-document-operations operation (contracts/integration/openapi-document-operations)
and replace the current free-text Operation path and Operation method Input fields with a
selection over the returned operations (domain/integration/openapi-document-operations, listing
domain/integration/openapi-operation entries as path/method pairs, method already upper-cased by
the backend). Choosing an entry must set both the path and the method the draft request
(state.path, state.method in useConnectorConfigurationHelper) names, per
rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing --
the operator never types a path or a method directly anymore. Handle the read's own refusals
(rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read,
rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read,
rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document)
by disclosing them to the operator, the same way
a-refused-draft-request-states-its-refusal-to-the-operator already discloses the draft's own
refusals.
