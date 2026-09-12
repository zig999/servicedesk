# Corrective increment: subject placeholder resolution still enforces a name match the specification no longer requires

## The wrong behavior

`src/src/connector-registry/subject-placeholder-resolution.ts`, function `outcomeFor()` (lines
67-77), resolves a request parameter or request-body field name to a `${subject:<name>}`
placeholder only where at least one capability is registered for the connector AND every one of
those registered capabilities declares that exact name among its own `input_schema` properties.
Where a capability is registered but does not declare the name, the field is refused with reason
`no-matching-input-schema-property` and placed in the draft's "Unresolved" section.

The specification (`knowledge/`) was revised and committed (commit `3d68f7ea`) to remove this
match requirement: `rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability`
now states that a name resolves as `${subject:<name>}` wherever at least one capability is
currently registered for the connector, regardless of whether any of them declares that name.
The reason `no-matching-input-schema-property` no longer exists in
`domain/integration/connector-configuration-draft-unresolved-reason`. The delivered code still
implements the old rule and can still emit the retired reason — it is out of conformance with
the specification as it now stands.

## Reproduction

1. Register a capability against connector `erp-http` whose `input_schema.properties` holds only
   `customer_id`.
2. Choose the operation `GET /customers/{customerId}/invoices` from a fetched OpenAPI document
   and generate a connector configuration draft for `erp-http`.
3. Observed: `customerId` is named in the draft's `unresolved` list with reason
   `no-matching-input-schema-property`, and the draft's configuration embeds no
   `${subject:customerId}` placeholder.
4. Expected, per the revised specification: the draft's configuration embeds
   `${subject:customerId}`, and `customerId` appears in no unresolved item — the only condition
   that still refuses a name is that no capability at all is registered for `erp-http`
   (`no-capability-registered`).

## The file

`src/src/connector-registry/subject-placeholder-resolution.ts`

## Origin

See `temp/prompt-remover-comparacao-nome-input-schema-subject-placeholder.md` for the original
request that led to the specification revision.
