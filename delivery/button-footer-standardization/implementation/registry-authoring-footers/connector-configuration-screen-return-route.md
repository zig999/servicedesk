---
title: Connector configuration screen return route
summary: The standalone Back to connector configurations links are removed from every phase of both connector-configuration screens, and the detail screen's loading and load-error phases — which carried no footer at all — now offer the route to the listing through the shared ButtonFooter instead.
task: sha256:3d6f5ffe8a31868b6d4509b4e6a2b016ca80c642fbf7770c87b3a7140df0e5fa
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-connector-configuration-screen-return-route-build
files:
- path: src/routes/connector-configuration-create-screen.tsx
  effect: Removes the standalone Back to connector configurations link that sat above the heading. This screen has one reading only — its hook returns no loading or load-error phase — and that reading already carried the route through the form fields' own footer, whose Cancel control is a link to the listing; that footer is now the screen's only route there, untouched by this task.
- path: src/routes/connector-configuration-detail-screen.tsx
  effect: Removes the standalone link from all three returns. The loading return now renders a ButtonFooter carrying a Cancel control, a secondary button wrapping a link to the listing, in place of the removed link; the load-error return's existing Retry now sits inside that same footer alongside the same Cancel, rather than as a bare button beside a bare link. The ready return keeps delegating to the detail ready view unchanged, whose own footer already carries the route.
criteria:
- criterion: No connector-configuration screen renders a link whose accessible name is Back to connector configurations, in any of its phases.
  met: true
  how: 'All four occurrences were removed: one from the create screen, rendered above its single reading, and three from the detail screen, one per return. No other connector-configuration screen source rendered it.'
- criterion: connector-configuration-create-screen offers the operator a route to the connector-configurations listing on every reading.
  met: true
  how: The hook returns one shape only, with no loading or load-error phase, and that one reading always renders the form fields, whose ButtonFooter always carries the Cancel link to the listing beside Save.
- criterion: connector-configuration-detail-screen offers the operator a route to the connector-configurations listing in its loading phase, its load-error phase and its ready phase alike.
  met: true
  how: The loading return's new footer and the load-error return's new footer each carry the same link control, and the ready return's detail view carries it through its own already-delivered footer.
- criterion: connector-configuration-detail-screen's loading phase states that the configuration is still being read and states no value of connector or configuration.
  met: true
  how: The unchanged loading text states the read as still in progress and names the connector only by the route parameter the read is addressed with, which is not a value the read answered; no field of any registered configuration is rendered. Only the text's position relative to the removed link and the added footer changed.
- criterion: connector-configuration-detail-screen's load-error phase states that the configuration could not be read, states no value of connector or configuration, and carries an action that re-issues that same read.
  met: true
  how: The unchanged failure text states the read failed and renders no configuration value, and the unchanged Retry button, now relocated inside that phase's footer rather than sitting bare beside a link, still issues the same read again through the hook's own refetch, the action itself untouched.
- criterion: connector-configuration-detail-screen's loading phase carries no action re-issuing the read, and no read is issued again except by the operator taking that action.
  met: true
  how: The loading phase's footer carries only the route control and no retry; the retry action is invoked from nowhere but the load-error button, so neither phase issues the read again on the screen's own initiative.
- criterion: connector-configuration-detail-screen's ready phase presents the connector name and the configuration exactly as the read answered them.
  met: true
  how: 'Unaffected by this task''s edits: the ready return still delegates to the detail ready view, which renders the connector and the registered configuration from the answered read.'
- criterion: No spec under frontend/app/src/routes queries a Back to connector configurations link.
  met: true
  how: Re-verified directly against the tree as it now stands — a grep for the link's accessible name under frontend/app/src returns no match anywhere, source or spec. The four specs that used to query it — connector-configuration-form-fields-action-footer.spec.ts, connector-configuration-create-screen.spec.ts, connector-configuration-detail-screen-listing-route.spec.ts and connector-configuration-detail-screen.spec.ts — now query the footer's Cancel link instead, and each was read in full to confirm that every phase which previously asserted a route to the listing still asserts one — the create screen's one reading, the detail screen's loading phase, its load-error phase and its ready phase. Route coverage across every phase is unchanged; only the control asserted against moved, from the removed standalone link to the footer's Cancel. The criterion was first recorded unmet, since the implementation writes no test, and re-answered here against the tree once the proof's own pass had run.
nodes:
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  encoded_at:
  - src/routes/connector-configuration-create-screen.tsx
  - src/routes/connector-configuration-detail-screen.tsx
  how: Every reading of both screens now carries the route through a footer control rather than a standalone link above the heading, and carries it unconditionally — not turning on whether the read has answered, failed or is outstanding, and not on how the operator reached the surface. The control is a styled link rather than a submitting control, so taking it registers nothing and alters no registered configuration. The detail screen's loading and load-error phases gained the route through a footer for the first time; the ready phases of both keep carrying it through the footer the sibling task already built.
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  encoded_at:
  - src/routes/connector-configuration-detail-screen.tsx
  how: The loading return keeps stating the read as outstanding and carries no reattempt; the load-error return keeps stating the failure and remains the only phase carrying the reattempt, now inside the same footer as the route rather than beside a bare link. Neither presents a value the read has not answered. The three-way distinction and the reattempt's one-window placement are unchanged, only relocated.
inferences:
- inferred: The route on the create screen and on the detail ready view stays the already-delivered Cancel-as-link control rather than a control that submits register-connector before landing on the listing.
  from: The task's own note offers that submitting shape as one way to answer the underdetermined gap in the route rule, but a-successful-connector-registration-lands-on-the-configurations-own-surface — already implemented by the sibling footer task and out of this task's scope to reopen — refuses the listing as a successful submission's destination on these same screens. The existing Cancel link satisfies the route criterion, satisfies the writes-nothing clause cleanly, and conflicts with no other rule's already-correct behaviour.
- inferred: The route rendered on every phase does not turn on how the operator reached the surface; it is unconditional.
  from: The route rule's own statement, which says the route turns on nothing further and names arrival among the things it does not turn on. That is stronger than what this task's stated criteria require, and the specification's own text takes precedence over the looser reading the task's second note flags as merely criterion-satisfying.
- inferred: The Cancel control added to the loading and load-error phases is composed exactly as the sibling capability-detail-screen's identical footers — a secondary button wrapping a link to the listing, inside ButtonFooter — rather than as a new composition.
  from: The inventory's own documented convention for a Cancel that navigates rather than submits, and the just-delivered capability screen precedent for these same two phases on the sibling registry.
- inferred: No discard control was added to either new phase.
  from: The task's third note names exactly that addition as an implementation the criteria would not catch, and a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface withholds the discard from a surface whose read has not answered and one whose read failed.
preserved:
- The detail ready view's own footer — the discard dialog, the saved status and Cancel — untouched.
- The form fields' own footer, Save plus trailing actions, untouched.
- 'The loading phase''s own text and the load-error phase''s text and its Retry wiring to the hook''s refetch: content unchanged, only wrapped in the new footer.'
- 'The connector-configuration hooks, their query keys, mutations and refusal mapping, untouched: no read or write behaviour changed.'
- The shell's scroll region and the footer's sticky composition, already proven by the component's own delivery, untouched.
---

## What it is
The removal the scope asked for on the second registry, and the substitution that makes it legal.
The detail screen's loading and load-error phases had no footer at all; they have one now, carrying only the route, because the rule owes that route on every reading and those two readings had it only through the link this task removes.
The create screen has one reading and already carried the route in its footer, so there the removal stands alone.

## Notes
This task was read against its own nodes rather than against the sibling capability task, because the two registries are not symmetric and this plan has already paid once for assuming they were.
Two differences held: the create screen here has no loading or load-error phase to give a footer to, and the abandonment destination this registry's rules state is not the listing, so the single control serving as both the abandonment and the route was left exactly as the sibling task delivered it rather than quietly widened.
That conflation is the task's fourth underdetermined note, and this record neither resolves it nor claims to; the proof records it as unproven.
The criterion over the specs was first recorded unmet and re-answered against the tree after the proof's own pass rewrote the four specs, which is what the discipline means by judging a record against the tree at the end rather than against the order its two passes ran in.
