---
title: Shared ButtonFooter component
summary: Adds the ButtonFooter component that renders any buttons a screen gives it in an end-aligned, accessibly-grouped row, pinned via CSS sticky to the bottom of AppShell's scrollable main region, without touching app-shell.tsx.
task: sha256:3c6643dd2454fe3aa329901b1d27af4e6657411dff04be522aa6a1acd7677b03
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/shared-action-footer-button-footer-component-build-2
files:
- path: src/shared/components/button-footer.tsx
  effect: Exports ButtonFooter, a component taking children and rendering them, in received order, inside a role=group aria-label=Actions sticky bottom-0 flex row aligned to the end.
criteria:
- criterion: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end.
  met: true
  how: ButtonFooter renders `{children}` directly with no reordering, inside a div carrying role group, aria-label Actions and `flex flex-wrap items-center justify-end gap-4`. React preserves the order children were passed in, and `justify-end` aligns the row to the end. The root is now addressable by role and accessible name, so a test can assert both the DOM order of its children and the row's alignment without reaching for a class selector.
- criterion: The footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled.
  met: true
  how: The group's own div carries `sticky bottom-0`. AppShell's `<main className="relative flex-1 overflow-y-auto p-4">` is the only scrolling ancestor any screen's content sits inside, rendered through `<Outlet/>`, so a screen rendering ButtonFooter as part of its own content gets it pinned to that region's bottom edge once scrolled. The group's role and name make it queryable, so a test can assert its computed position and bottom declarations directly.
- criterion: Content scrolled to its end stays fully readable above the footer rather than covered by it.
  met: true
  how: '`sticky` rather than `fixed` keeps the footer a normal-flow participant reserving its own space in the document, so nothing is removed from the layout to make room for it. Rendered as the last element of a screen''s scrollable content, the preceding content''s flow ends where the footer''s flow position begins, so at the true end of scroll no content sits underneath it. The addressable group lets a test locate the footer relative to sibling content to assert that ordering.'
- criterion: The footer sits inside the AppShell's existing `<main>` scroll region and frontend/app/src/shared/components/app-shell.tsx is left unmodified by this task.
  met: true
  how: app-shell.tsx does not appear in this delivery's files. ButtonFooter is a plain in-flow div with no portal and no fixed positioning reaching outside its parent, so wherever a screen renders it, always inside `<main>` via `<Outlet/>`, it stays inside that same scroll region. A test can render AppShell with a stand-in route mounting ButtonFooter and assert, through the group's role and name, that the group's nearest main ancestor is the one AppShell renders.
- criterion: A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
  met: true
  how: The disclosure is rendered by AppShell's own Topbar, structurally outside `<main>` entirely, a sibling of the main and sidebar row rather than a scrolled descendant of it. ButtonFooter never renders outside `<main>` and uses no fixed positioning or portal that could reach the Topbar, so no screen rendering it can cover or hide that statement. A test can mount AppShell with ButtonFooter and assert both the shell's own disclosure text and the group are present and that neither contains the other.
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
- inferred: The root carries role group and aria-label Actions, added on this re-delivery.
  from: 'The test author''s contested note and the coverage audit it pointed to: three of this task''s five criteria had no addressable target because the root carried no role, name or test id, and this project''s own test convention asserts by role and accessible name, never by class, evidenced by app-shell.spec.ts. Group rather than toolbar was chosen because the buttons inside carry no roving tabindex or arrow-key navigation this task implements, which toolbar would misrepresent; the label is a fixed generic name rather than a per-screen prop, since nothing in the specification or this task names it and every consuming screen is equally described by it. No specification node assigns a role or a name to this container, so this is a testability and accessibility decision about how the row is built, not a fact the row states.'
divergences:
- cites: ARC-01
  file: src/shared/components/button-footer.tsx
  departure: ButtonFooter's root re-implements a bordered, surface-toned footer bar's markup by hand instead of composing TUI's StatusBar primitive, which the standard-conformance pass named as the catalogue equivalent.
  why: 'StatusBar''s root splits into three fixed flex-1 slots joined by justify-between; passing every button through its right slot would cap their available width at roughly a third of the bar, since each slot keeps equal flex-grow whether or not its siblings hold content, and would place them inside that slot''s own gap-2 wrapper rather than the gap-4 this project''s own multi-button action rows use, squeezing exactly the row this task exists to standardize. Its px-4 py-1 text-xs text-muted-foreground styling is a status strip''s typography, not an action row''s. Its typed role is fixed to status, contentinfo or none — a live region or a page-footer landmark, neither the correct semantic for a labelled group of action buttons — and the component''s own types omit the native role attribute from passthrough, so not even the className surface it merges can reach any of these three defects. Composing it would trade one drift, a second footer-shaped markup, for three: wrong available width, wrong spacing, and a wrong or absent semantic role.'
deferred:
- what: Wiring ButtonFooter into the four consuming screen families and removing the standalone Back to X links.
  why: The task's own rationale states the interface was cut away from its consumers deliberately, defining it and rewriting every consumer in the same task being the seam this decomposition keeps apart. Those screens are covered by other tasks in this plan.
---

## What it is
One shared component that renders whatever buttons a screen hands it in an end-aligned row stuck to the bottom of the region the AppShell already scrolls, as a group carrying its own accessible name.
It fixes no destination and knows no button: which controls appear and where each one goes is every consuming screen's own.

## Notes
This is a re-delivery of the same task, decided by the human from the review record, and both records are rewritten whole rather than amended.
The root gained role group and an accessible name on this pass, which is what the test author's contested note and the coverage audit both pointed at: without an addressable root, three of this task's five criteria had no target any spec of this project could reach, because the convention here asserts by role and name and never by class.
The standard pass's ARC-01 finding is disclosed as a divergence rather than followed, and the reason is recorded in that field: composing StatusBar would cap the buttons at a third of the bar's width, impose a status strip's spacing and typography on an action row, and leave the group without a correct semantic role, because StatusBar's own types omit role from passthrough.
A disclosed departure settles nothing, and the review that reads this file next is not shown it.
The path spelling in this record was corrected from what the producing agent returned, which spelled it from the repository root rather than from the target source root.
