---
title: DELETE on a concept name
summary: The HTTP surface for remove-concept — route, controller and request shape as separate files,
  the refusal named in the status map, wired into the application build.
rationale: Cut apart from the operation because it is a second interface with the operation as its consumer.
  The status-map entry belongs here rather than with the operation because the map is what turns a domain
  error into a response, which is the route's own boundary.
sources:
- intake/scope.md
depends_on:
- task/concept-removal/remove-concept-operation
objective: The published surface answers an HTTP DELETE on a concept name by calling the glossary's remove-concept,
  and answers its refusal as a named condition rather than generically.
criteria:
- The route is registered under the DELETE method on the same concept-name path the existing concept registration
  route uses.
- A request whose path segment fails the route's declared shape is refused with an HTTP 400 response whose
  error code is VALIDATION_ERROR, whose message names the path as what failed validation, and whose details
  list the issues found.
- The operation's refusal error is named in the status map, so it is not answered with the HTTP 500 INTERNAL_ERROR
  response and fixed message that a domain error the map does not name receives.
- The route declares and invokes no authentication middleware, guard or check.
- A request naming a concept nothing answers, records, cites or collects leaves that name unheld by the
  glossary, a subsequent read of it answering as the specification already states it answers for an unheld
  name.
- The route, its controller, its request shape and the operation it calls are four separate files, following
  the separation the existing delete routes use.
- The controller re-raises whatever the operation raises rather than mapping it to a response itself.
- The application build registers the route, so a built app answers the method and path.
reference:
- inventory/delete-routes-connector-capability-concept.md
- src/src/http/register-concept.routes.ts
- src/src/http/remove-hypothesis.routes.ts
- src/src/http/remove-hypothesis.controller.ts
- src/src/http/dto/remove-hypothesis.dto.ts
- src/src/errors/status-map.ts
- src/src/http/build-app.ts
- src/src/factories/build-app.factory.ts
- src/src/factories/glossary.factory.ts
implements:
- contracts/glossary/glossary-authoring
- domain/glossary/concept
- rules/glossary/a-registered-concept-is-never-removed
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/no-route-enforces-authentication
- constraints/a-successful-concept-removal-answers-with-no-content
---

## What it is
The route that makes remove-concept reachable, and the status-map entry that keeps its refusal from being swallowed by the generic internal-error fallback.
The success answer is now stated by constraints/a-successful-concept-removal-answers-with-no-content: HTTP 204, no body.

## Notes
UNDERDETERMINED, from the specification — constraints/a-successful-concept-removal-answers-with-no-content states HTTP 204 with no body; no criterion names that status or the absent body.
UNDERDETERMINED, from the specification — the rule names the refusal's own transport value, HTTP 409 naming ConceptInUseError; criterion 3 requires only that the error be named in the status map, not what it is named to.
REMAINDER, from the specification — the rule's registering clause belongs to the register-concept surface, not this DELETE route.
REMAINDER, from the specification — the rule's closing clause about what a succeeding removal takes with it (the concept's own accepts declaration) is decided inside remove-concept and its store, not this route.
ADVISORY, from the specification — criterion 5's post-removal read defers to rules/glossary/a-glossary-read-by-an-unheld-name-is-refused, outside this task's candidate set; demonstrated against that neighboring node.
ADVISORY, from the specification — criterion 5's observable outcome is produced by the remove-concept operation and its store, not by this route's four files; the two persistence/domain-import constraints in the candidate set govern that neighboring work.
