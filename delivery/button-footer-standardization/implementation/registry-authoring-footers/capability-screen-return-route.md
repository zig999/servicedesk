---
target: frontend
title: Capability screen return route
summary: The standalone Back to capabilities links are removed from both capability screens, and every phase of both — including the loading and load-error phases that had no footer at all — now offers the route to the listing through the shared ButtonFooter instead.
task: sha256:2ba66cdbe6050789812939ea454049c3fa0c87d070e856ed7431f530ee38413c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/registry-authoring-footers-capability-screen-return-route-build
files:
- path: src/routes/capability-create-screen.tsx
  effect: Removes the standalone Back to capabilities link that sat above the heading on every phase. The loading phase now renders a ButtonFooter carrying a Cancel control, a secondary button wrapping a link to the listing; the load-error phase's existing Retry now sits inside that same footer alongside the same Cancel. The ready phase is untouched, its route already reaching the operator through the form fields' own footer.
- path: src/routes/capability-detail-screen.tsx
  effect: Removes the standalone Back to capabilities link from all three returns. The loading return now renders a ButtonFooter carrying a Cancel control in place of the removed link; the load-error return's existing Retry now sits inside a ButtonFooter alongside the same Cancel, rather than as a bare button beside a bare link. The ready return keeps rendering the detail ready view unchanged, whose own footer already carries the route.
criteria:
- criterion: No capability screen renders a link whose accessible name is Back to capabilities, in any of its phases.
  met: true
  how: 'All four occurrences were removed: one from the create screen, rendered unconditionally above every phase, and three from the detail screen, one per return. No other capability screen source ever rendered it.'
- criterion: capability-create-screen offers the operator a route to the capabilities listing on every reading.
  met: true
  how: The loading and load-error phases each render a ButtonFooter whose Cancel control is a secondary button wrapping a link to the listing; the ready phase's form fields already carry the same control through the existing trailing-actions slot, untouched by this task.
- criterion: capability-detail-screen offers the operator a route to the capabilities listing in its loading phase, its load-error phase and its ready phase alike.
  met: true
  how: The loading return's new footer and the load-error return's new footer each carry the same link control, and the ready return's detail view carries it through its own already-delivered footer.
- criterion: capability-detail-screen's loading phase states that the capability at that name and version is still being read.
  met: true
  how: The unchanged loading text names the identity by name and version and states the read as still in progress; only its position relative to the removed link and the added footer changed.
- criterion: capability-detail-screen's load-error phase states that the capability at that name and version could not be read, and carries a control whose one effect is to issue that same read again.
  met: true
  how: The unchanged failure text states the read failed, and the unchanged retry button, now relocated inside that phase's footer rather than sitting bare beside a link, still has issuing the read again as its one effect, the retry action itself untouched.
- criterion: capability-detail-screen's loading phase carries no control that issues the read again, and neither phase re-issues that read on the screen's own initiative.
  met: true
  how: The loading phase's footer carries only the route control and no retry; the retry action is invoked from nowhere but the load-error button, so neither phase issues it on the screen's own initiative.
- criterion: Neither the loading phase nor the load-error phase presents any attribute of any capability as the content standing at that identity.
  met: true
  how: Both phases render only their own status text and the footer's controls; neither renders any field of the form or any other capability attribute.
- criterion: No spec under frontend/app/src/routes queries a Back to capabilities link.
  met: true
  how: 'Verified by grep over the routes directory and, as a broader check, over the whole source tree: no occurrence of that accessible name remains anywhere. The source removed the four occurrences it rendered, and the proof''s own pass over this task rewrote the three specs that used to query the link against the Cancel control that now carries the route in its place, with the suite green over all eight steps. No route coverage was dropped: each phase that asserted a route to the listing still asserts one, against the new control.'
nodes:
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  encoded_at:
  - src/routes/capability-create-screen.tsx
  - src/routes/capability-detail-screen.tsx
  how: Every phase of both screens now carries the route through a footer control rather than a standalone link above the heading. The loading and load-error phases of both gained the route for the first time, and the ready phase of both keeps carrying it through the footer the sibling task already built.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  encoded_at:
  - src/routes/capability-detail-screen.tsx
  how: The loading return keeps stating the read as still in progress and carries no reattempt; the load-error return keeps stating the read failed and remains the only phase carrying the reattempt, now inside the same footer as the route rather than beside a bare link. The three-way distinction and the reattempt's one-window placement are unchanged, only relocated.
inferences:
- inferred: The route control added to the loading and load-error phases of both screens is labelled Cancel and composed as a secondary button wrapping a link to the listing, the same control and label already standing in each screen's ready phase.
  from: The inventory's own convention for a Cancel that navigates rather than submits, and the identical control the sibling delivery already placed in both screens' ready phases; reusing rather than deriving a second labelled route control for the same destination.
- inferred: The shared footer component carries no destination and was left untouched; each screen supplies its own link target as the footer's children.
  from: The task's own note that a destination fixed inside the shared footer would leave connector-configuration surfaces routed at the wrong listing, and the component's own signature, which accepts only children and states no destination.
- inferred: No discard control was added to either screen's new phases.
  from: The discard rule's own text, which withholds that act from a surface authoring at an unregistered identity, one whose read has not answered, and one whose read failed; the task's own note names exactly this addition as an implementation the criteria would not catch but the specification refuses.
- inferred: The registry's refusal of an unregistered identity continues to render through the existing load-error branch, stating the same could-not-be-read text and the same retry as any other failed read, rather than as a newly built separate reading.
  from: The task's own notes naming both a distinct-but-routeless reading and a folded-but-conflating reading as implementations the stated criteria would pass and the fuller specification would refuse; leaving the existing fold in place, now with the route added to its phase, avoids the routeless hazard without this task inventing hook logic or wording no criterion asks for.
preserved:
- The form fields' own footer, Save plus trailing actions, untouched.
- The detail ready view's own footer, the discard dialog, the saved status and Cancel, untouched.
- 'The capability hooks and the error-state mapping, untouched: no query key, mutation, retry mechanism or refusal mapping changed.'
- The Cancel added to the two screens' new phases lands on the same fixed listing route the sibling delivery already established for each screen's ready phase, not on wherever the operator arrived from.
- The create screen's own concept-vocabulary failure wording, a different failure ungoverned by either node this task implements.
- The shell's scroll region and the footer's sticky composition, already proven by the component's own delivery, untouched.
deferred:
- what: The capability hooks continue to present the registry's refusal of an unregistered identity identically to any other failed read, rather than as its own distinct answer.
  why: The read-window rule excepts that refusal from the failed window as its own answer, and this task's notes name the conflation as a hazard, but no criterion here names a fourth reading at all, the conflation predates this task, and the hooks carrying it sit outside the two screen files this task's objective reaches.
- what: The connector configuration screens' own return route and footer.
  why: Their rule governs a different family of surfaces and is the sibling return-route task's own remainder.
---

## What it is
The removal the scope asked for, and the substitution that makes it legal.
The loading and load-error phases of both screens had no footer at all; they have one now, carrying only the route, because the rule owes that route on every reading and those two readings had it only through the link this task removes.

## Notes
The criterion over the specs was first recorded unmet and re-answered against the tree after the proof's own pass rewrote the three specs, which is what the discipline means by judging a record against the tree at the end rather than against the order its two passes ran in.
That criterion is the one thing in this plan an implementation could not satisfy alone, since it is written over test files and the implementation writes no test.
The task carries five underdetermined notes, the largest set in this plan, and two of them shaped what was deliberately not done: no discard control was added to any new phase, and no fourth reading was invented for an identity nothing is registered at.
That second one leaves a conflation standing, recorded in deferred: the registry's refusal of an unregistered identity still renders as an ordinary failed read, which the read-window rule excepts from that window as its own answer.
