# Scope: Capability Schema Helper — backend

Implement the backend half of the Capability Schema Helper — the new published api
`contracts/integration/capability-schema-draft`, operation `draft-capability-schema-from-openapi`.

It generates a candidate `input_schema` and `output_schema` for a capability from one operation
of a fetched OpenAPI document — the same document-fetch/parse machinery
`contracts/integration/connector-configuration-draft` and
`contracts/integration/openapi-document-operations` already use — per the specification nodes
authored under `knowledge/domain/integration/capability-schema-draft*.md` and
`knowledge/rules/integration/*-schema-draft*.md`, `knowledge/rules/integration/a-capability-authoring-surface-offers-a-schema-helper.md`,
and their surface-facing siblings `knowledge/rules/integration/a-capability-schema-drafts-*.md`,
`knowledge/rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit.md`,
`knowledge/rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes.md`,
and the three refusal rules (`an-unfetchable-openapi-link-refuses-the-schema-draft`,
`a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft`,
`an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft`).

This invocation covers only the backend — the HTTP endpoint, the OpenAPI-document
reading/parsing, the `input_schema`/`output_schema` derivation and the three refusals. The
frontend Schema Helper surface (the screen, the two Apply buttons, the stale marking as
presented to the operator) is a separate, later initiative.
