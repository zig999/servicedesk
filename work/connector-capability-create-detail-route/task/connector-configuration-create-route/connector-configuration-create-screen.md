---
title: Routed connector configuration create screen
summary: A full-page screen at its own route where an operator authors and registers a new connector configuration.
rationale: The scope states the outcome and no cut, so the planning cut the route and the screen as one task -- the screen is not reachable, and therefore not demonstrable, until the route resolves to it, and both change for the same reason.
sources:
- intake/scope.md
objective: An operator registers a new connector configuration from a full-page routed screen, with no popup dialog involved.
criteria:
- Navigating to "/connectors/new" renders the connector configuration create screen inside the app shell.
- Navigating to "/connectors/new" does not render the connector configuration detail screen for a connector named "new".
- The create screen's connector field is editable rather than disabled.
- The create screen composes the existing connector-configuration form-fields component rather than a second copy of that markup.
- The create screen's form state comes from the existing connector-configuration create/edit hook opened in create mode rather than from a second hook re-deriving that state.
- Saving from the create screen dispatches the registry's register-connector request under the connector name typed into the form.
- The create screen does not dispatch a registration while the connector name is empty.
- The create screen does not refuse a connector name that is present and non-empty.
- The create screen does not dispatch a registration while the configuration text is not valid JSON.
- A registration the registry refuses reaches the operator as the shared hook's own distinguishable failure message rather than being swallowed on this screen.
- A save that succeeds leaves the operator on the created connector configuration's own detail route rather than on the create route.
- The create screen renders a link back to the connector configurations list.
- The create screen renders no connector test panel.
implements:
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
- contracts/integration/connector-configuration-registry
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
---

## What it is
A screen that reuses the connector-configuration form fields and the create/edit form hook's create mode, mounted at its own static route beside the existing "/connectors/$connector" detail route.
It is the whole of what the popup dialog offered in create mode, laid out as a page and reached by a URL.

## Notes
The inventory records that "/connectors/new" is a static sibling of the dynamic "/connectors/$connector" segment, and that this router sorts by specificity rather than registration order -- the same convention the "/cases/$slug/versions/new" route already establishes.
Where a save lands the operator is not stated by the scope or by any node in the impact set; the criterion above sends them to the created record's own detail route, which is the same page a subsequent edit of that record already uses and which avoids leaving a create URL loaded after the record exists.
The inventory flags the connector test panel's applicability to a create branch as a question the scope does not answer; the criterion above preserves exactly what the popup create path does today, which is not to render it, and decides nothing new.
The shared create/edit form hook already blocks submission on invalid configuration text and already maps the registry's refusal to a distinguishable message, so the two criteria naming those are conditions on this screen consuming that hook rather than reimplementing either.
UNDERDETERMINED, from the specification -- the criterion "does not dispatch a registration while the configuration text is not valid JSON" is looser than rules/integration/a-connector-configuration-holds-a-well-formed-object, which refuses any syntactically valid JSON that is not an object (a null value or an array included); text such as `null` or `[1,2]` satisfies this criterion as written while the registry refuses the registration it produces.
Passes: a create screen whose dispatch gate is JSON.parse succeeding alone, so configuration text of `null` or `[1,2]` is dispatched as a register-connector request the registry refuses with HTTP 422 reporting ConnectorConfigurationNotWellFormedError.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-holds-a-well-formed-object's HTTP 422 ConnectorConfigurationNotWellFormedError and IncompleteConnectorConfigurationError responses, and its clause that the registry holds and answers the configuration as text whichever way a registration supplied it, reach no criterion here: a routed screen dispatches a request, it does not compose the registry's response.
Belongs: the backend act implementing contracts/integration/connector-configuration-registry's register-connector, already delivered, not this frontend create screen.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-names-its-connector's HTTP 422 IncompleteConnectorConfigurationError response reaches no criterion here; this task's criteria reach only the refusal condition itself, through the screen's own dispatch gate.
Belongs: the backend act implementing contracts/integration/connector-configuration-registry's register-connector refusals, not this frontend create screen.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's two refusal clauses (HTTP 404 CapabilityNotRegisteredForTestError, HTTP 409 CapabilityConnectorMismatchError) reach no criterion here; this task is claimed only for the clause that scopes testing to an already-registered capability, which the "renders no connector test panel" criterion answers by withholding the surface.
Belongs: the task of this epic that delivers the connector test panel and its test-connector dispatch, together with the backend act implementing contracts/integration/connector-diagnostics' test-connector refusals.
Advisory: contracts/integration/connector-diagnostics is a candidate this task does not implement -- it publishes test-connector, which no criterion here dispatches, and the fact scoping when a test is possible is decided at rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's own statement, not at this contract; the epic's covers still needs the task that renders the test panel, or an uncovered entry, to reconcile this contract.
Advisory: a connector configuration registered under the literal name "new" (permitted -- the naming rule refuses only an absent or empty name, and this task's own criterion forbids the screen from blocking a present, non-empty name) has no reachable detail screen at "/connectors/new" once the create route takes precedence there, so a save succeeding under that one name lands the operator back on the create screen rather than a detail route; no candidate reserves the segment, and none is contradicted -- a seam for the caller's awareness, not a defect this task's own criteria state incorrectly.
