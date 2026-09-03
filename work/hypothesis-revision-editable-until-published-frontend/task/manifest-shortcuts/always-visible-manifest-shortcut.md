---
title: A manifest shortcut on the hypothesis-editing screen that does not wait for a save
summary: The hypothesis-editing screen carrying a control that reaches the manifest of the case version
  it was opened on at any point while editing.
rationale: Cut apart from the Versions-panel action because the two answer to different specification
  ground -- this screen's route to a draft's manifest is governed by the node stating when a revise offers
  that route, while a listing row's action is governed by nothing about revising -- and because each is
  demonstrable without the other; the criterion preserving today's post-save offer is this planning's
  own, so that the delivered conditional offer is not silently replaced by this addition.
sources:
- intake/scope-history-status-and-manifest-shortcuts.md
- intake/scope-history-status-and-manifest-shortcuts-narrowed.md
objective: The hypothesis-editing screen reaches the manifest of the case version it was opened on through
  a control present while editing, rather than only through the control its save-success surface renders.
criteria:
- The hypothesis-editing screen in its ready phase, before any save has been made on it, renders a control
  whose target is the manifest route of the case version the screen was opened on.
- The control's target is built from the slug and version the screen was opened on, and names no other
  case version.
- The control reuses the navigate-to-manifest call already built in use-hypothesis-revision-form.ts rather
  than a second construction of that route.
- Rendering the control adds no request beyond the two reads the screen already issues.
- After a save whose answered revision equals the revision the draft's manifest entry pinned going into
  it, the screen still renders no post-save manifest-builder offer.
- After a save whose answered revision is higher than the revision the draft's manifest entry pinned going
  into it, the screen still renders the post-save manifest-builder offer.
implements:
- domain/knowledge/case-version
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
---

## What it is
A control on the hypothesis-editing screen that navigates to /cases/$slug/versions/$version/manifest for the case version the screen was opened on, reachable while editing rather than after a save.
It leaves the save-success surface's existing conditional offer exactly as delivered.

## Notes
The survey reports hypothesis-revision-screen.test-support.ts and use-hypothesis-revision-form.test-support.ts already hold SLUG/VERSION/VERSION_PATH/baseHandlers/createFetchStub fixtures wired to the screen's current request shapes, and extending those is the existing pattern.
The survey reports hypothesis-revision-screen.tsx dispatches on the form state's phase and uses no StatusTable, so a control not tied to a phase has no existing slot on that screen.

UNDERDETERMINED, from the specification — criteria 1 and 5 leave open what the screen renders once a save has been answered while the shortcut's summary asks for a control present "at any point while editing"; rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move states that where the revise wrote into the very revision the draft's entry already pins, "no such offer is made", reasoning that "a step that is always available and never necessary teaches a curator to ignore it on the occasions it is necessary" — an implementation could keep the always-present shortcut rendered through and after such a save while rendering no separate post-save offer element, satisfying every criterion here while placing a route to that manifest in front of a curator on exactly the branch the rule says offers none.

UNDERDETERMINED, from the specification — criteria 5 and 6 reach only two of the rule's three branches (written == pinned, no offer; written > pinned, offer); the third ("whenever that draft version's manifest holds no entry for the hypothesis at all") is held by nothing here, since both criteria presuppose a manifest entry already exists to compare against.

ADVISORY, from the specification — criterion 2's requirement that the control's target be "built from the slug and version the screen was opened on, and names no other case version" partly rests on facts outside this task's candidates: the slug's one-case-per-slug guarantee lives in domain/knowledge/case and rules/knowledge/a-slug-identifies-one-case, neither in this epic's covers.
Decision, beyond the covers — stand: the criterion is satisfied by reusing the same slug and version parameters the screen's existing navigate-to-manifest call already takes, so this task asserts nothing new about slug uniqueness; claiming domain/knowledge/case or rules/knowledge/a-slug-identifies-one-case would grow the epic for a citation this task's own criteria do not need.
