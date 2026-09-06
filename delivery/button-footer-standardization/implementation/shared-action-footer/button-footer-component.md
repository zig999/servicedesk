---
title: Shared ButtonFooter component
summary: Adds the ButtonFooter component that renders any buttons a screen gives it in an end-aligned row, pinned via CSS sticky to the bottom of AppShell's scrollable main region, without touching app-shell.tsx.
task: sha256:3c6643dd2454fe3aa329901b1d27af4e6657411dff04be522aa6a1acd7677b03
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/shared-action-footer-button-footer-component-build
files:
- path: src/shared/components/button-footer.tsx
  effect: Exports ButtonFooter, a component taking children and rendering them, in received order, inside a sticky bottom-0 flex row aligned to the end.
criteria:
- criterion: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end.
  met: true
  how: ButtonFooter renders `{children}` directly with no reordering, inside a div carrying `flex flex-wrap items-center justify-end gap-4`. React preserves the order children were passed in, and `justify-end` aligns the row to the end.
- criterion: The footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled.
  met: true
  how: The footer's own div carries `sticky bottom-0`. AppShell's `<main className="relative flex-1 overflow-y-auto p-4">` is the only scrolling ancestor any screen's content sits inside, rendered through `<Outlet/>`, so a screen rendering ButtonFooter as part of its own content gets it pinned to that region's bottom edge once scrolled, per CSS position sticky against the nearest scrolling ancestor.
- criterion: Content scrolled to its end stays fully readable above the footer rather than covered by it.
  met: true
  how: '`sticky` rather than `fixed` keeps the footer a normal-flow participant reserving its own space in the document, so nothing is removed from the layout to make room for it. Rendered as the last element of a screen''s scrollable content, the preceding content''s flow ends where the footer''s flow position begins, so at the true end of scroll no content sits underneath it.'
- criterion: The footer sits inside the AppShell's existing `<main>` scroll region and frontend/app/src/shared/components/app-shell.tsx is left unmodified by this task.
  met: true
  how: app-shell.tsx does not appear in this delivery's files. ButtonFooter is a plain in-flow div with no portal and no fixed positioning reaching outside its parent, so wherever a screen renders it, always inside `<main>` via `<Outlet/>`, it stays inside that same scroll region.
- criterion: A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
  met: true
  how: The disclosure is rendered by AppShell's own Topbar, structurally outside `<main>` entirely, a sibling of the main and sidebar row rather than a scrolled descendant of it. ButtonFooter never renders outside `<main>` and uses no fixed positioning or portal that could reach the Topbar, so no screen rendering it can cover or hide that statement.
nodes:
- node: constraints/no-route-enforces-authentication
  how: This task's only governance from this constraint is its disclosure clause, answered by the fifth criterion. ButtonFooter states no new fact of the disclosure, that text and its rendering already living in app-shell.tsx which this task leaves unmodified; it only must not defeat the disclosure, and its confinement to `<main>` with no portal and no fixed positioning means it structurally cannot reach the Topbar where the statement lives. The task's own Notes record that the constraint's two perimeter clauses and its route-handler fitness reach no criterion of this task.
inferences:
- inferred: The end-aligned row uses `flex flex-wrap items-center justify-end gap-4`, and the footer bar uses `border-t border-border bg-surface`.
  from: The inventory's own conventions — the same end-aligned flex row pattern repeats with a 4-unit gap when it holds more than a Save button, seen at case-version-editor-ready-view.tsx:128 — and AppShell's own Footer component using the same border and surface tokens for an analogous footer bar.
- inferred: ButtonFooter exposes no `className` or `style` prop.
  from: The existing precedent among this app's own shared components, StatusTable, ConflictBanner and JsonTextareaField, none of which expose a passthrough className; that convention belongs to the TUI catalog's own contract for its primitives, not to this app's shared components.
- inferred: The scenario the task's Notes describe as UNDERDETERMINED, a footer that overlaps and visually obscures the shell's no-authentication disclosure while it stays in the DOM, does not need to be designed for in this codebase.
  from: 'Reading app-shell.tsx: the disclosure sits in the Topbar, a sibling of `<main>` rather than content scrolled inside it, so a footer confined to the scroll region of `<main>` cannot geometrically overlap it regardless of how the footer is styled.'
- inferred: The sticky-without-overlap guarantee depends on ButtonFooter being rendered as the last element of a screen's own scrollable content.
  from: 'How CSS position sticky computes its stuck bound from the element''s own containing block: the property that gives the true-end-of-scroll behaviour holds only when nothing in normal flow follows the footer. This is a constraint for the tasks that later wire ButtonFooter into each screen family, not something this component''s own markup can enforce.'
deferred:
- what: Wiring ButtonFooter into the four consuming screen families and removing the standalone Back to X links.
  why: The task's own rationale states the interface was cut away from its consumers deliberately, defining it and rewriting every consumer in the same task being the seam this decomposition keeps apart. Those screens are covered by other tasks in this plan.
---

## What it is
One shared component, thirteen lines, that renders whatever buttons a screen hands it in an end-aligned row stuck to the bottom of the region the AppShell already scrolls.
It fixes no destination and knows no button: which controls appear and where each one goes is every consuming screen's own.

## Notes
The path spelling in this record was corrected from what the producing agent returned, which spelled it from the repository root rather than from the target source root; the file written is the same file, and the anchor is what the contract holds `produces` and rule scopes against.
The producing agent inferred that the underdetermined note this task carries cannot arise in this codebase, because the no-authentication disclosure sits in the Topbar outside the scrolled region; that is a claim about app-shell.tsx as it now stands, and the proof is written by a different context that is handed the same note and does not inherit this reading.
Sticky was chosen over fixed deliberately, and the reason is the third criterion: a fixed footer leaves the flow and would cover content at the true end of scroll, which the criterion refuses.
