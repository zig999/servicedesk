---
target: frontend
title: Hypothesis revision action footer, with its first Cancel
summary: hypothesis-revision-form-fields renders Save hypothesis and a new Cancel through the shared ButtonFooter, with Cancel returning the curator to whichever screen actually opened the composition and never gating on submission progress or revision state.
task: sha256:a5497dd65fb2bb6a1b55dfb189359ab26e1c3e80ab33c4f82805f46dd08996b0
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/knowledge-authoring-footers-hypothesis-revision-action-footer-build
files:
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: adds a router-backed cancel action to the ready phase of the form state, alongside the existing open-manifest and submit actions; nothing else in the hook changed.
- path: src/routes/hypothesis-revision-form-fields.tsx
  effect: replaces the lone end-aligned flex row around Save with the shared ButtonFooter, and adds an optional trailingActions prop rendered after Save inside that footer, mirroring the slot the two registry form-fields components already expose.
- path: src/routes/hypothesis-revision-screen.tsx
  effect: passes a secondary Cancel button, wired to the state's cancel action, through the form fields' new trailingActions slot in the ready phase.
criteria:
- criterion: hypothesis-revision-form-fields renders its Save hypothesis button through ButtonFooter rather than through its own end-aligned flex row.
  met: true
  how: The div carrying `flex items-center justify-end` around the lone Save button is replaced by ButtonFooter, which wraps that same submit button plus the new trailingActions.
- criterion: The footer carries a Cancel that abandons the composition before it is submitted, writing no revision and leaving the hypothesis's existing revisions and its case's draft version exactly as they were, and returns the curator to the screen the composition was opened from.
  met: true
  how: The screen passes a secondary button wired to the hook's cancel action, which calls the router's own history back and nothing else — no mutation is invoked, so no revision is written and neither the hypothesis's revisions nor the case's draft version are touched. Because a composition here is reachable from three distinct screens, the manifest builder's add link, the simulation's revise link and the revision history's revise link, all siblings in route-tree.tsx rather than nested, the return is answered through the browser's own navigation history rather than one fixed destination.
- criterion: The Cancel is offered for as long as the composition has not been submitted, and neither its presence nor its enablement turns on how much of the composition was filled in.
  met: true
  how: Cancel renders unconditionally whenever the state is in its ready phase, which is exactly while the composition has not been submitted; a successful submit moves the hook to its success phase, at which point the form fields and Cancel with them are no longer rendered. The button carries no disabled prop of any kind, so neither its presence nor its enablement reads validity, dirtiness or how many fields were filled.
- criterion: Submitting the form still saves the hypothesis revision through the same call it made before.
  met: true
  how: 'The submit handler and its mutation are untouched: the same request with the same body.'
- criterion: The form still renders hypothesis name, criterion, collects and resolution, with their validation unchanged.
  met: true
  how: The fields, their bindings and the form schema are unchanged; only the action row beneath them was restructured.
- criterion: The subject type is shown read-only and read from the case's draft version and from nowhere else.
  met: true
  how: 'Unchanged: the subject still comes from the draft version query''s own answer and is rendered disabled and read-only.'
- criterion: While the case's draft version record has not answered, the form states that the version is still being read and states no attribute of it, presenting neither a partial content nor an empty one as the version's.
  met: true
  how: 'Unchanged: the version query not having answered still yields the loading phase, which the screen renders as its own loading statement, stating no attribute of the version.'
- criterion: After a save, the screen states the revision number the revise answered, and states nothing further distinguishing a revise that replaced the highest existing revision in place from one that created the next.
  met: true
  how: 'Unchanged: the success phase states only the hypothesis name and the revision number, with no field naming which branch the revise took.'
- criterion: After a save, the route to the draft's manifest is offered where the draft's manifest held no entry for the hypothesis and where the revision written is higher than the revision that entry pinned immediately before, and is not offered where the revise wrote into the very revision that entry already pins.
  met: true
  how: 'Unchanged: the offer compares the written revision against the pin captured immediately before the revise, offering the route only where the entry was absent or the written revision is higher.'
nodes:
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
  how: 'This is the node this task newly encodes. Cancel is offered whenever the composition has not been submitted, calls the router''s history back alone so no mutation runs, and its presence and enablement are not gated by form fill state. Following the task''s underdetermined note, the implementation deliberately reads no revision-release state at all before rendering Cancel: the rule states abandonment turns on nothing else, including whether a submit would have replaced the highest existing revision in place or created the next, and gating on that is exactly the violation the note names as passing the narrower criterion.'
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: 'Unchanged by this task: the revise request''s subject is still sourced only from the case''s draft version, never from a value the curator supplies. Three clauses of this rule reach no criterion here and belong to the task delivering the revise operation itself, as this task''s remainder note names.'
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
  how: 'Unchanged by this task: the success phase states only the revision number, with no field distinguishing an in-place overwrite from a newly created revision.'
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: 'Unchanged by this task: the offer compares the written revision against the pin held immediately before the revise, captured before the call, and offers the route only where the entry was absent or the written revision is higher.'
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: 'Honoured rather than newly encoded: the form only ever reads the subject from the version query''s own answer, and states that the version is being read, naming no attribute of it, while that query has not answered. The binder disclosed that this node''s statement is scoped to a newly created draft''s content while this form presents the case''s standing draft; the criterion is answered against the node''s broader-quantified expression, as that note anticipates.'
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/hooks/use-hypothesis-revision-form.ts
  how: 'Unchanged by this task: the hypothesis name stays the stable identity field, editable only for a new hypothesis, and never itself carries criterion, collects or resolution.'
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/hooks/use-hypothesis-revision-form.ts
  how: 'Unchanged by this task: criterion, collects and resolution remain the fields submitted and rendered as a revision''s own content, and the form is still seeded from the hypothesis''s own highest existing revision.'
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  how: 'Unchanged by this task: the case version''s own subject and manifest are read through the version query, and the manifest is used only to compute the pin and the offer, never edited from this form.'
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  how: This task changes only the surface, the action row and the new Cancel; the revise operation itself is the pre-existing, unchanged mutation. No operation is added, and none of the contract's other acts is reached.
inferences:
- inferred: Cancel's return destination is resolved through the browser's own navigation history rather than one fixed link destination.
  from: route-tree.tsx shows the manifest-hypothesis routes as top-level siblings of the case-simulation route rather than nested under it, and three files link independently into this composition — the manifest builder's add link, the simulation hypotheses table's revise link and the revision history's revise link — so no single static destination answers the screen the composition was opened from for every entry point, unlike the case version editor's single-origin Cancel.
- inferred: Cancel is threaded into the form fields through a new trailingActions prop owned and populated by the screen, rather than hard-coded inside the form-fields component.
  from: The inventory's must-not-duplicate entry for the same slot already proven on both registry form-fields components, and the capability detail ready view's precedent of passing a Cancel through that slot from the owning screen.
divergences:
- from: The inventory's convention that a new default Cancel reuses the Cancel-as-styled-Link composition proven at case-version-editor-ready-view.tsx:240, departed from in src/hooks/use-hypothesis-revision-form.ts and the screen that renders its action.
  departure: Cancel here is a plain button calling the router's history back, not a link to a fixed route.
  why: The abandonment rule requires returning the curator to the screen the composition was actually opened from, and this composition, unlike the case version editor's, has three distinct opening screens; a static destination would satisfy at most one of them and silently mis-return the curator from the other two.
preserved:
- Submitting the form still calls the same revise request through the same mutation, unchanged.
- Hypothesis name, criterion, collects and resolution fields and their schema validation, unchanged.
- The subject type read-only and sourced only from the case's draft version query, unchanged.
- The loading and load-error phases and the success phase's revision message and manifest offer, unchanged.
- The pre-existing View Manifest button, unchanged.
- ButtonFooter's own contract, children-only with its own role and accessible name, composed rather than modified.
---

## What it is
The hypothesis revision composition reaching its actions through the shared footer, and gaining the Cancel it never had.
It is the one family of the four where both the slot and the Cancel are new, so there was no local pattern to follow and one had to be made.

## Notes
The Cancel departs from the inventory's own convention and the departure is declared: the three sibling deliveries all use a link to a fixed destination, and this composition is opened from three different screens, so a fixed destination would return the curator somewhere they never came from in two of the three cases.
The implementation deliberately reads no revision-release state before rendering Cancel, which is what the task's underdetermined note names as the way to pass every criterion and still violate the rule: abandonment turns on nothing else, and gating the control on whether a submit would overwrite in place or create the next revision is exactly that gate.
This screen carries no content after the form, so no reorder was needed here, unlike the connector configuration ready view.
