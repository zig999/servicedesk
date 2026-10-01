---
entries:
- field: statement
  unstated: No node stated which validation refuses a register-capability request whose nature is a non-empty string outside the capability-nature vocabulary -- the route's own declared-shape check with HTTP 400 VALIDATION_ERROR, or the registry with HTTP 422 -- nor what the route declares as the shape of a supplied nature.
  found: 'work/capability-payload-notes/intake/register-capability-routes-spec-expects-stale-400s.md -- "`src/__tests__/unit/http/register-capability.routes.spec.ts` asserts HTTP 400 for six cases that `register-capability-dto-refusal-order/reaches-the-registry-refusal`''s legitimate delivery now routes to the registry''s own HTTP 422 ... refusal instead: an out-of-vocabulary nature, ... Each of these now reaches registerCapability and is refused there with 422, not intercepted at 400 by the route''s own shape validation."'
---
