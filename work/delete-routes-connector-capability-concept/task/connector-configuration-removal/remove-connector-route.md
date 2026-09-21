---
title: DELETE on a connector name
summary: The HTTP surface for remove-connector — route, controller and request shape as separate files,
  wired into the application build alongside the other connector-registry routes.
rationale: Cut apart from the operation because it is a second interface with the operation as its consumer,
  and because its criteria — the request shape's refusal, the absence of an authentication guard, the
  wiring — are demonstrable over the running app without reopening the service.
sources:
- intake/scope.md
depends_on:
- task/connector-configuration-removal/remove-connector-operation
objective: The published surface answers an HTTP DELETE on a connector name by calling the registry's
  remove-connector.
criteria:
- The route is registered under the DELETE method on the same connector-name path the existing registration
  route uses.
- A request whose path segment fails the route's declared shape is refused with an HTTP 400 response whose
  error code is VALIDATION_ERROR, whose message names the path as what failed validation, and whose details
  list the issues found.
- The route declares and invokes no authentication middleware, guard or check.
- A request naming a registered connector leaves that connector unregistered, a subsequent read of the
  name answering as the specification already states it answers for a name nothing is registered at.
- The route, its controller, its request shape and the operation it calls are four separate files, following
  the separation the existing delete routes use.
- The controller re-raises whatever the operation raises rather than mapping it to a response itself.
- The application build registers the route, so a built app answers the method and path.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/http/register-connector.routes.ts
- src/src/http/discard.routes.ts
- src/src/http/discard.controller.ts
- src/src/http/dto/discard.dto.ts
- src/src/http/build-app.ts
- src/src/factories/build-app.factory.ts
- src/src/factories/connector-configuration-registry.factory.ts
implements:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration-registry
- domain/integration/connector-configuration
- rules/integration/removing-a-connector-configuration-is-unconditional
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/no-route-enforces-authentication
- constraints/a-successful-connector-configuration-removal-answers-with-no-content
---

## What it is
The route that makes remove-connector reachable, mirroring the two delete routes this codebase already has.
constraints/a-successful-connector-configuration-removal-answers-with-no-content now states the success answer this route gives.

## Notes
UNDERDETERMINED, from the specification — constraints/a-successful-connector-configuration-removal-answers-with-no-content states HTTP 204 with no body; no criterion names that status or the absent body, so nothing holds the route to it as written.
UNDERDETERMINED, from the specification — the rule's absent-name branch (never refused, answered exactly as a removal that removed one) reaches no criterion; criterion 4 speaks only of "a request naming a registered connector".
UNDERDETERMINED, from the specification — the rule's capability-naming branch (removal succeeds whether or not a capability currently names the connector) is likewise reached only if criterion 4 is read as universally quantified; no criterion names that case explicitly.
ADVISORY, from the specification — the post-removal read's own answer for an unregistered name is held by rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused, outside this task's candidate set; criterion 4's second half is demonstrated against that neighboring node rather than anything this task implements.
Decision, beyond the covers — stand: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused governs the existing read-connector-configuration route, a surface no task of this plan changes; naming it here is a demonstration reference, not a claim this task's own delivery makes, so the reference stands without growing this task's implements.
ADVISORY, from the specification — criterion 1's method and path anchor to the codebase's existing registration route rather than to any candidate, since no candidate states an HTTP method or path; the decision log records that the specification deliberately took the operation's name (remove-connector) from the material rather than its route shape.
REMAINDER, from the specification — constraints/the-domain-depends-on-no-infrastructure governs the domain-service task's own imports, not this HTTP surface's four files.
REMAINDER, from the specification — constraints/the-system-persists-to-one-relational-database governs the store task's own transaction, not this HTTP surface.
