## What it is

`src/__tests__/unit/http/register-capability.routes.spec.ts` asserts HTTP 400 for six cases
that `register-capability-dto-refusal-order/reaches-the-registry-refusal`'s legitimate
delivery now routes to the registry's own HTTP 422 IncompleteCapabilityContractError
instead: an out-of-vocabulary nature, a body omitting input_schema outright, a body omitting
output_schema outright, a wholly empty body, an empty `:name` path segment, and an empty
`:version` path segment. Each of these now reaches registerCapability and is refused there
with 422, not intercepted at 400 by the route's own shape validation.

## Notes

None.
