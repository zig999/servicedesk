---
title: Capability removal control behind a further explicit act
summary: A removal control on the capability detail screen that asks for confirmation
  and issues remove-capability only when the operator confirms.
rationale: Cut as its own task because the gate the removal-control rule states can
  be shown met without any outcome disclosed or any landing taken, and the disclosure
  and the landing build on the DELETE this task issues.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: The capability's surface offers a removal whose DELETE request is issued
  only on a further explicit act by the operator.
criteria:
- The capability's surface at /capabilities/:name/:version offers a removal control
  for the capability it presents.
- Taking the removal control asks whether the capability's removal is to be performed.
- Taking the removal control issues no DELETE request.
- Confirming the removal in the further act issues one DELETE request to /v1/capabilities/:name/:version
  carrying the presented capability's name and version.
- Declining the further act issues no DELETE request.
- After the further act is declined, the surface still presents the capability unchanged
  under the same name and version.
- The further act does not ask the operator to type the capability's name or version.
implements:
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- domain/integration/capability
---



## What it is
A removal control in the `ButtonFooter` of frontend/app/src/routes/capability-detail-screen.tsx, with its mutation in frontend/app/src/hooks/use-capability-detail.ts and its view state in frontend/app/src/hooks/use-capability-detail-view.ts.

## Notes
ADVISORY, from the specification — The two literal addresses in the criteria — the surface at /capabilities/:name/:version and the request DELETE /v1/capabilities/:name/:version — are stated by no candidate; the specification names the surface only as one addressed by its own identity, and the operation only as remove-capability. The decision log records that only the operation name was decided; the path is the delivered route's own address, to be checked against source rather than against the specification.
REMAINDER, from the specification — The concept and connector-configuration clauses of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act reach no criterion of this task, which answers only the capability branch. It belongs to: The sibling tasks that put the removal control behind a further explicit act on the concept's surface (remove-concept) and on the connector configuration's surface (remove-connector).
REMAINDER, from the specification — No criterion reaches the statement of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator (success stating the identity is no longer registered; refusal stating nothing was removed and naming the condition; nothing stated before the api answers). This task stops once the DELETE is issued. It belongs to: The task that states the outcome of a capability removal on the surface it was issued from, including the HTTP 409 CapabilityCitedByEvidenceError refusal.
REMAINDER, from the specification — No criterion reaches the statement of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing, which sends a successful capability removal to the capabilities listing and never back to /capabilities/:name/:version. It belongs to: The task that lands a successful capability removal on the listing of registered capabilities.
REMAINDER, from the specification — No criterion reaches the statement of rules/integration/a-registered-capability-cited-by-evidence-is-never-removed (the removal succeeding unless evidence cites the capability, the HTTP 409 refusal, and an unregistered-identity removal answered as a success). This task only issues the request that reaches it. It belongs to: The registry's remove-capability route (backend act already delivered); the client side of the refusal belongs to the task that states the removal's outcome to the operator.
