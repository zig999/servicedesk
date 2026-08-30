---
title: Routed capability create screen
summary: A full-page screen at its own route where an operator authors and registers a new capability.
rationale: The scope states the outcome and no cut, so the planning cut the route and the screen as one task -- the screen is not reachable, and therefore not demonstrable, until the route resolves to it, and both change for the same reason.
sources:
- intake/scope.md
objective: An operator registers a new capability from a full-page routed screen, with no popup dialog involved.
criteria:
- Navigating to "/capabilities/new" renders the capability create screen inside the app shell.
- A capability named "new" is still reached at "/capabilities/new/<version>" by the capability detail screen.
- The create screen's name and version fields are both editable rather than disabled.
- The create screen composes the existing capability form-fields component rather than a second copy of that markup.
- The create screen's form state comes from the existing capability create/edit hook opened in create mode rather than from a second hook re-deriving that state.
- While the concept vocabulary is still loading, the create screen renders a loading state rather than the form.
- When the concept vocabulary fails to load, the create screen renders a failure state offering a retry rather than the form.
- Saving from the create screen dispatches the registry's register-capability request at the name and version typed into the form.
- The create screen does not dispatch a registration while either declared schema is not valid JSON.
- Registering a capability for a concept another capability already answers leaves the operator on the create screen with the registry's refusal reported to them.
- The create screen does not itself refuse a concept before dispatching the registration.
- A save that succeeds leaves the operator on the created capability's own detail route rather than on the create route.
- The create screen renders a link back to the capabilities list.
implements:
- domain/integration/capability
- domain/integration/capability-registry
- contracts/integration/capability-registry
- rules/integration/one-capability-answers-one-concept
- contracts/glossary/glossary-query
- rules/integration/a-capability-declares-well-formed-schemas
---

## What it is
A screen that reuses the capability form fields and the create/edit form hook's create mode, mounted at its own static route beside the existing "/capabilities/$name/$version" detail route.
It is the whole of what the popup dialog offered in create mode, laid out as a page and reached by a URL.

## Notes
"/capabilities/new" is one path segment where the existing capability detail route is two, so the two never resolve to the same URL; the second criterion is what holds that fact rather than an assumption about it.
Where a save lands the operator is not stated by the scope or by any node in the impact set; the criterion above sends them to the created record's own detail route, which is the same page a subsequent edit of that record already uses and which avoids leaving a create URL loaded after the record exists.
The shared create/edit form hook already carries the loading and load-error phases for the concept vocabulary, already blocks submission on an invalid schema, and already maps the concept-already-answered refusal to its own distinguishable message, so those criteria are conditions on this screen consuming that hook rather than reimplementing any of them.
UNDERDETERMINED, from the specification -- no criterion of this task states what the operator is told when either declared schema is not valid JSON, only that no request leaves the screen; rules/integration/a-capability-declares-well-formed-schemas pairs that condition with a reported HTTP 422 CapabilitySchemaNotWellFormedError refusal, which the criteria as written let the operator meet and be told nothing about.
Passes: a create screen whose save control, while either declared schema is not valid JSON, performs no action at all -- no request dispatched, no message, no field marking, the form simply unchanged -- which satisfies every criterion of this task as written.
REMAINDER, from the specification -- the second clause of rules/integration/one-capability-answers-one-concept's statement (a concept read finding more than one currently registered capability is refused with HTTP 500 reporting DuplicateConceptAnswerError) reaches no criterion of this task, which answers only the registration half (409 ConceptAlreadyAnsweredError).
Belongs: the concept-keyed capability read published by contracts/integration/capability-registry (read-capability) on the backend, not this frontend create screen.
REMAINDER, from the specification -- the "or update" half of rules/integration/a-capability-declares-well-formed-schemas' statement, and the "or replacing whatever already stood at that identity" half of contracts/integration/capability-registry's own Description, reach no criterion of this task, whose screen only registers at a new name and version.
Belongs: the task covering the capability edit/replace surface, not this create screen.
Advisory: the loading and failure-with-retry criteria for the concept vocabulary rest on no stated fact among the candidates -- contracts/glossary/glossary-query states the read exists but not what an operator-facing surface shows while it is pending or after it fails; flagged rather than classed as a silence, since read as form (a screen's rendition of a read that has not yet answered) these criteria need no node.
