---
title: ButtonFooter component proof
summary: Tests that ButtonFooter renders whatever children it is given, in order, confined to wherever it is placed with no escape hatch that could reach the shell's disclosure; the three layout-dependent criteria have no test this suite can honestly write and are named in untested instead.
implementation: sha256:09c80b194214d39b875cfceb400d4e5aa863202fd9cc46f3fed9fba85cf40be6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/shared-action-footer-button-footer-component-suite-3
tests:
- file: src/shared/components/button-footer.spec.ts
  name: renders each given child in the order it received them
  proves: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end. (order clause)
  fails_when: ButtonFooter reorders, drops or duplicates a child instead of rendering exactly what it was given, in the order it was given
- file: src/shared/components/button-footer.spec.ts
  name: renders without throwing and produces no buttons when given no children
  proves: ButtonFooter handles the empty children case without throwing and without producing phantom controls, the boundary case of rendering every button passed to it as children
  fails_when: ButtonFooter throws, or renders a button that was not given, when it is given no children
- file: src/shared/components/button-footer.spec.ts
  name: stays inside the region it is given while the shell's disclosure stays outside it and present
  proves: The footer sits inside the AppShell's existing `<main>` scroll region
  fails_when: the footer's own rendered button is no longer found by a Testing Library query scoped to the container it was placed in, having left that container by some means such as a portal
- file: src/shared/components/button-footer.spec.ts
  name: stays inside the region it is given while the shell's disclosure stays outside it and present
  proves: A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
  fails_when: the shell's disclosure text stops being queryable in the document once a screen renders ButtonFooter alongside it
- file: src/shared/components/button-footer.spec.ts
  name: stays inside the region it is given while the shell's disclosure stays outside it and present
  proves: 'The UNDERDETERMINED note the task carries: a footer pinned over the region carrying the shell''s no-authentication disclosure satisfies a criterion that asks only for the statement to be present, while constraints/no-route-enforces-authentication requires the posture disclosed to every user on every screen.'
  fails_when: the footer's button is found by a query scoped to its own container while the disclosure stops being independently reachable outside that container, the only jsdom-decidable trace of ButtonFooter escaping through a portal to reach and cover a disclosure kept structurally outside it, which is the mechanism the implementation the note names would need
not_applicable:
- edge_case: a numeric boundary at either end of a stated range
  why: no criterion states a range or count bound; ButtonFooter accepts arbitrary ReactNode children with no minimum or maximum
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion claims uniqueness over the children; two buttons with identical labels are not a distinguishable state ButtonFooter treats specially
- edge_case: an operation against state that forbids it
  why: ButtonFooter is a pure, stateless render function with no internal state and no operation that state could forbid
- edge_case: a dependency that fails or answers slowly
  why: ButtonFooter calls no network, storage or clock dependency; it only renders the children it is given
- edge_case: two operations against one subject at once
  why: there is no mutable subject or asynchronous operation for two calls to race against; rendering is synchronous and side-effect free
untested:
- The criterion that the footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled has no test in this suite. The fact is a CSS positioning fact on the footer's own wrapping element, which carries no ARIA role, accessible name or test id, and this project's established convention, read from status-table.spec.ts and app-shell.spec.ts, asserts only through role, accessible name and attribute. jsdom also computes no layout, so even a reachable class would prove the declared CSS property rather than the pinned-while-scrolled behaviour the criterion states.
- 'The criterion that content scrolled to its end stays fully readable above the footer rather than covered by it has no test in this suite, for the same reason: the distinguishing fact is the footer''s own positioning class, sticky against fixed, on an element with no accessible query path, and jsdom computes no real layout to observe actual coverage over.'
- The row-alignment half of the first criterion has no test in this suite. The order half is proven; aligned to the end is a CSS alignment fact on the same unreachable wrapping element.
- 'The implementation record''s inference that the footer bar uses the same border and surface tokens as AppShell''s own Footer has no test in this suite, for the same reason: no accessible path to the wrapping element''s own class list.'
- That app-shell.tsx is left unmodified by this task is a static fact about a file, not runtime behaviour a spec test observes; no assertion here can prove an absence of a diff. Verified instead by reading app-shell.tsx directly, which contains no reference to ButtonFooter.
- The implementation record's inference that ButtonFooter exposes no className or style prop is a compile-time fact of its declared props shape, refused by the project's own typecheck and lint steps rather than by this suite.
- The implementation record's inference that the sticky-without-overlap guarantee depends on ButtonFooter being rendered as the last element of a screen's own scrollable content is a constraint on how future consuming screens use this component, and nothing in button-footer.tsx's own markup can be exercised here to prove or violate an ordering fact about a caller that does not yet exist in this task's files.
contested:
- what: ButtonFooter's own wrapping element carries no ARIA role, accessible name or test id; only children is accepted, per the implementation's own recorded inference that it exposes no other prop.
  why: Given this project's established testing convention, a component with no addressable role or name on its own root leaves three of this task's five stated criteria with no test any spec file in this suite can honestly write. A role of group with an accessible label on the footer's own wrapping element would close that gap and would also improve the component's accessibility for a set of grouped action buttons. It was not added, because that is a change to button-footer.tsx, which is the implementer's file.
---

## What it is
Three tests over ButtonFooter, all through role and text queries, plus the record of what this suite cannot decide.
The proof deliberately holds fewer assertions than the task has criteria, and names each gap rather than covering it with a test that would pass without proving anything.

## Notes
Two suite runs failed before this one passed, both at the lint step and both over this same test file, and neither was answered by weakening a test.
run/shared-action-footer-button-footer-component-suite failed with 21 errors, over passing children as props, over type assertions and over direct node access.
run/shared-action-footer-button-footer-component-suite-2 failed with 4 errors, all over container access, which is the route the project's standard refuses for reaching an element no role can reach.
The second failure is what produced this record's shape: the project's own spec files assert by role, accessible name and attribute and never by class, so the class assertions the first two attempts carried were the wrong form for this project rather than a lapse, and the criteria they claimed to prove moved to `untested` instead.
The `contested` entry stands unresolved by design — the test author judges the component should carry an addressable role, and the component is the implementer's file.
