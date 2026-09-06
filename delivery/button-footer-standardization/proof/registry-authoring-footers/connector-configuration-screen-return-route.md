---
title: Connector configuration screen return route proof
summary: The four specs that queried the removed Back to connector configurations link are rewritten against the footer's Cancel control, keeping every phase's route assertion, and three of the task's four underdetermined notes gain a test that would fail over the implementation each names.
implementation: sha256:e639fc2b26e05046e8eb805c281937b64b1749aa18cb4f3d6db18a2ed9b77623
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-connector-configuration-screen-return-route-suite-2
tests:
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: renders exactly one link on the screen, the footer's Cancel, resolving to /connectors
  proves: No connector-configuration screen renders a link whose accessible name is Back to connector configurations, in any of its phases, on the create screen; and no spec under frontend/app/src/routes queries that link.
  fails_when: A second link renders anywhere on the create screen — the removed standalone link reappearing among them — or the footer's Cancel link stops resolving to the listing.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: renders the footer's Cancel link to /connectors
  proves: connector-configuration-create-screen offers the operator a route to the connector-configurations listing on every reading.
  fails_when: The footer's Cancel control is removed, or its destination stops being the listing.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: navigates to /connectors on Cancel without issuing any PUT request -- an implementation that submits register-connector before navigating would fail this
  proves: 'The task''s first underdetermined note, over the implementation it names as passing every criterion while still failing the rule: a route carried by a control that submits the registration before landing on the listing. It also pins the implementation record''s own inference that the route stays a plain link.'
  fails_when: Clicking the footer's Cancel issues a PUT before or instead of navigating.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: renders the footer's Cancel link when the screen is loaded directly at /connectors/new, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  proves: The task's second underdetermined note, that both route criteria are satisfiable by a reading varying with arrival, against the rule's own text stating the route turns on nothing further.
  fails_when: The route is rendered only when navigation state records an arrival from the listing, and withheld on a direct load.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: renders no Discard changes control
  proves: The task's third underdetermined note, that no criterion states which controls the footer carries here, while the discard rule withholds that act from a surface authoring at an identity nothing is registered at.
  fails_when: A Discard changes control renders on the create screen.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders the footer's Cancel link to /connectors while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this
  proves: connector-configuration-detail-screen offers the route in its loading phase, a phase that carried no footer at all before this task.
  fails_when: The loading phase's footer stops carrying a Cancel link to the listing, or the route is withheld until the read answers.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders the footer's Cancel link when the screen is loaded directly at its own address, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  proves: The same second underdetermined note, over the detail screen's loading phase.
  fails_when: The loading phase's route is rendered only on an arrival-from-listing state.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders exactly one link, the footer's Cancel, during the loading phase
  proves: No connector-configuration screen renders the removed link in its loading phase, and no spec queries it.
  fails_when: More than one link renders during the loading phase.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: renders exactly one link, the footer's Cancel, during the load-error phase
  proves: The same, in the load-error phase.
  fails_when: More than one link renders during the load-error phase.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: states the configuration is still being read and presents no connector or configuration field
  proves: connector-configuration-detail-screen's loading phase states that the configuration is still being read and states no value of connector or configuration.
  fails_when: A connector or configuration field renders during the loading phase, before the read answers.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: offers no Retry control while the read is outstanding
  proves: connector-configuration-detail-screen's loading phase carries no action re-issuing the read.
  fails_when: A Retry control renders during the loading phase.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: states the configuration could not be read and presents no connector or configuration field
  proves: connector-configuration-detail-screen's load-error phase states that the configuration could not be read and states no value of connector or configuration.
  fails_when: The load-error phase stops stating the failure, or a connector or configuration field renders alongside it.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: navigates back to the connector-configurations list when the footer's Cancel link is clicked
  proves: connector-configuration-detail-screen offers the route in its ready phase, and the click actually navigates.
  fails_when: Clicking the ready phase's Cancel stops navigating to the listing.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
  proves: connector-configuration-detail-screen offers the route in its load-error phase, alongside the Retry action.
  fails_when: The load-error phase's footer stops carrying either the Retry button or the Cancel link.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: issues no PUT request when the footer's Cancel link is clicked -- an implementation that submits register-connector before navigating would fail this
  proves: The first underdetermined note again, over the ready phase's already-delivered Cancel control.
  fails_when: Clicking the ready phase's Cancel issues a PUT before or instead of navigating.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: renders exactly one link, the ready view's Cancel, during the ready phase
  proves: No connector-configuration screen renders the removed link in its ready phase, and no spec queries it.
  fails_when: More than one link renders during the ready phase.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: issues exactly one more GET to the same connector's configuration per Retry click, never zero and never more than one
  proves: connector-configuration-detail-screen's load-error phase carries an action that re-issues that same read, and no read is issued again except by the operator taking that action.
  fails_when: Clicking Retry issues zero, or more than one, additional read of the configuration.
not_applicable:
- edge_case: A duplicate where uniqueness is claimed.
  why: No criterion of this task claims uniqueness over any collection; the route and the phase texts are singular facts, not membership in a set.
- edge_case: A boundary at each end of a stated range.
  why: No criterion states a numeric range; the task concerns which control renders in which phase and where it navigates, not a bounded value.
- edge_case: An empty collection where one comes back.
  why: The listing is a different screen's concern; these criteria describe a single-configuration surface's route and phase text, never a collection this task renders.
- edge_case: Two operations against one subject at once.
  why: No criterion of this task states concurrent-write behaviour; the registration and the discard are both preserved unchanged and outside this task's scope.
untested:
- The task's fourth underdetermined note is left unproven, deliberately. It names one control serving as both the abandonment and the route to the listing, where a-connector-configuration-authoring-may-be-abandoned-without-registering states the reached-from surface as abandonment's destination. The implementation does not separate the two and states no criterion that reaches the abandonment destination, so no test here asserts either the listing or the reached-from surface as Cancel's destination beyond what the route criteria require, which is that it reaches the listing. What an operator who arrived from anywhere other than the listing should be returned to is the gap, and it stands.
- The first suite over this delivery failed on a test of this pass's own writing, which anchored on the shared footer's accessible group and then read a control synchronously, without waiting for the phase transition. The group is carried identically by the loading and the load-error phases, so it does not identify a phase. The one failing test was corrected to wait for the phase itself; whether any other test in this suite that anchors on that group passes for the same accidental reason rather than by identifying its phase was not established, and a test that passes on timing is not a test that proves anything.
---

## What it is
Seventeen assertions, of which the first work is repair: four specs asserted against a link this delivery removed, and they now assert the same route facts against the control that carries them.
No phase lost its assertion — the create screen's one reading, and the detail screen's loading, load-error and ready phases each still hold one.

## Notes
Three of the task's four underdetermined notes gained a test written to fail over exactly the implementation each names: a route that submits before navigating, a route that appears only for an operator who arrived from the listing, and a discard control on a surface the specification withholds it from.
The fourth is the one the implementation did not resolve, and it is recorded as unproven rather than asserted either way.
The suite ran red once, at run/registry-authoring-footers-connector-configuration-screen-return-route-suite, with one failure out of 1247, and the diagnosis returned cause test.
No test was weakened to answer it: what the failing test asserts about the load-error phase is still asserted, and what changed is that it now waits for that phase instead of reading the first footer the group query resolves to.
