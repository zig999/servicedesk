Implement the Configuration Helper's OpenAPI operation listing on the backend: expose
contracts/integration/openapi-document-operations (operation read-openapi-document-operations)
that fetches an operator-named OpenAPI document link server-side and returns every operation it
declares as path/method pairs (domain/integration/openapi-document-operations,
domain/integration/openapi-operation), method upper-cased per
rules/integration/an-openapi-operations-method-is-upper-cased. Refuse per
rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read and
rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read,
mirroring the existing draft-operation refusals. The fetch runs server-side per
constraints/the-openapi-document-is-fetched-by-the-backend (already broadened to cover this
read).
