# Scope — corrective increment

Wrong behavior: A register-capability submission missing or leaving empty a required
attribute (name, version, nature, input_schema, output_schema, connector, concept) is
refused by registerCapabilityBodySchema/registerCapabilityParamsSchema's Zod validation
(HTTP 400 VALIDATION_ERROR) before the request ever reaches the capability registry's own
completeness check, so the specification's HTTP 422 IncompleteCapabilityContractError
refusal — stated in rules/integration/a-capability-declares-its-contract — can never be
produced through this route.

Reproduction: submit PUT /v1/capabilities/{name}/{version} with any required field
(e.g. connector) absent or an empty string; the response is a generic 400
VALIDATION_ERROR from the DTO layer, never the 422 IncompleteCapabilityContractError the
capability registry itself would raise for the same condition.

File: src/http/dto/register-capability.dto.ts
