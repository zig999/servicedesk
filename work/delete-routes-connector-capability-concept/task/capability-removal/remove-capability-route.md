---
title: DELETE on a capability name and version
summary: The HTTP surface for remove-capability — route, controller and request shape as separate files,
  the refusal named in the status map, wired into the application build.
rationale: Cut apart from the operation because it is a second interface with the operation as its consumer.
  The status-map entry belongs here rather than with the operation because the map is what turns a domain
  error into a response, which is the route's own boundary.
sources:
- intake/scope.md
depends_on:
- task/capability-removal/remove-capability-operation
objective: The published surface answers an HTTP DELETE on a capability's name and version by calling
  the registry's remove-capability, and answers its refusal as a named condition rather than generically.
criteria:
- The route is registered under the DELETE method on the same name-and-version path the existing identity
  read uses.
- A request whose path segments fail the route's declared shape is refused with an HTTP 400 response whose
  error code is VALIDATION_ERROR, whose message names the path as what failed validation, and whose details
  list the issues found.
- The operation's refusal error is named in the status map, so it is not answered with the HTTP 500 INTERNAL_ERROR
  response and fixed message that a domain error the map does not name receives.
- The route declares and invokes no authentication middleware, guard or check.
- A request naming an identity no collected evidence names leaves nothing registered at that identity,
  a subsequent identity read answering as the specification already states it answers for an identity
  nothing is registered at.
- The route, its controller, its request shape and the operation it calls are four separate files, following
  the separation the existing delete routes use.
- The controller re-raises whatever the operation raises rather than mapping it to a response itself.
- The application build registers the route, so a built app answers the method and path.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/http/read-capability-by-identity.routes.ts
- src/src/http/remove-hypothesis.routes.ts
- src/src/http/remove-hypothesis.controller.ts
- src/src/http/dto/remove-hypothesis.dto.ts
- src/src/errors/status-map.ts
- src/src/http/build-app.ts
- src/src/factories/build-app.factory.ts
- src/src/factories/capability-registry.factory.ts
implements:
- contracts/integration/capability-registry
- domain/integration/capability-registry
- domain/integration/capability
- rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/no-route-enforces-authentication
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/a-successful-capability-removal-answers-with-no-content
---

## What it is
The route that makes remove-capability reachable, and the status-map entry that keeps its refusal from being swallowed by the generic internal-error fallback.
The path shape is the identity read's own, name and version together; the success answer is now stated by constraints/a-successful-capability-removal-answers-with-no-content.

## Notes
UNDERDETERMINED, from the specification — constraints/a-successful-capability-removal-answers-with-no-content states HTTP 204 with no body for a successful removal; no criterion names that status or the absent body.
UNDERDETERMINED, from the specification — the rule's absent-identity branch (never refused for that absence, answered exactly as a removal that removed one) reaches no criterion excluding a refusal on that path; an implementation refusing an empty identity with a 404 still satisfies every criterion as written.
UNDERDETERMINED, from the specification — the rule names the refusal's own transport value, HTTP 409 naming CapabilityCitedByEvidenceError; criterion 3 requires only that the error be named in the status map, not what it is named to or what status it carries.
