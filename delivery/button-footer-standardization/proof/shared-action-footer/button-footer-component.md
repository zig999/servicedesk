---
title: ButtonFooter component proof
summary: Tests that ButtonFooter renders whatever children it is given in an accessible, end-aligned sticky group, mounted both in isolation and inside the real AppShell, where its containment inside main and the shell's disclosure staying present and structurally outside it are proven against app-shell.tsx itself rather than a fixture.
implementation: sha256:1a54f967eda3bf583ca5ba66753de8f0581010aa0115c93303d2d689f722646c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/shared-action-footer-button-footer-component-suite-4
tests:
- file: src/shared/components/button-footer.spec.ts
  name: renders each given child in the order it received them
  proves: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end. (order clause)
  fails_when: ButtonFooter reorders, drops or duplicates a child instead of rendering exactly what it was given, in the order it was given
- file: src/shared/components/button-footer.spec.ts
  name: exposes its root as an accessible group named Actions
  proves: The implementation record's inference that the root carries role group and aria-label Actions, added on this re-delivery
  fails_when: ButtonFooter's root stops being reachable as a group named Actions
- file: src/shared/components/button-footer.spec.ts
  name: lays its children out as a row aligned to the end
  proves: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end. (row and alignment clause)
  fails_when: the footer's root stops declaring a flex row justified to the end, for instance justify-start, justify-center, or a non-flex layout
- file: src/shared/components/button-footer.spec.ts
  name: carries the border and surface treatment matching the shell's own footer bar
  proves: The implementation record's inference that the footer bar uses the same border and surface tokens as AppShell's own Footer component
  fails_when: the footer's border-t, border-border or bg-surface classes are dropped or changed
- file: src/shared/components/button-footer.spec.ts
  name: pins itself to the bottom of its container through CSS sticky positioning
  proves: The footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled. (CSS declaration half)
  fails_when: the footer's root stops declaring sticky positioning pinned to bottom-0
- file: src/shared/components/button-footer.spec.ts
  name: keeps to the normal document flow instead of fixed positioning, so it reserves its own space rather than covering content
  proves: Content scrolled to its end stays fully readable above the footer rather than covered by it. (CSS declaration half)
  fails_when: the footer switches from sticky to fixed, or another out-of-flow positioning, which would remove it from the document's flow and let it cover content at the true end of scroll
- file: src/shared/components/button-footer.spec.ts
  name: renders without throwing and produces no buttons when given no children
  proves: ButtonFooter handles the empty children case without throwing and without producing phantom controls, the boundary case of rendering every button passed to it as children
  fails_when: ButtonFooter throws, or renders a button that was not given, when it is given no children
- file: src/shared/components/button-footer.spec.ts
  name: rendered by a screen inside the real AppShell > sits inside AppShell's own scrollable main region
  proves: The footer sits inside the AppShell's existing `<main>` scroll region
  fails_when: a screen rendering ButtonFooter no longer places it as a descendant of the real app-shell.tsx's own main landmark, either because ButtonFooter escapes it or because app-shell.tsx's own structure changes
- file: src/shared/components/button-footer.spec.ts
  name: rendered by a screen inside the real AppShell > still shows AppShell's own no-authentication disclosure, present and outside the footer's own group
  proves: A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
  fails_when: the real app-shell.tsx's own disclosure text stops being queryable in the document once a screen renders ButtonFooter alongside it, including if the disclosure were removed from app-shell.tsx, since this test reads it from the real component rather than from a fixture the test builds
- file: src/shared/components/button-footer.spec.ts
  name: rendered by a screen inside the real AppShell > still shows AppShell's own no-authentication disclosure, present and outside the footer's own group
  proves: 'The UNDERDETERMINED note the task carries: a footer pinned over the region carrying the shell''s no-authentication disclosure satisfies a criterion that asks only for the statement to be present, while constraints/no-route-enforces-authentication requires the posture disclosed to every user on every screen.'
  fails_when: the footer's group is found scoped to the real main while the disclosure stops being independently reachable outside that same region; against the real app-shell.tsx rather than a fixture, this is the jsdom-decidable trace of the footer reaching into the region the disclosure occupies
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
- The actual rendered visibility of the footer at the bottom of AppShell's scrollable region while a real scroll happens is not decidable by this suite beyond the CSS declaration itself, jsdom computing no layout, no scroll position and no box geometry. The suite proves the sticky and bottom-0 declaration and that the footer sits inside the real main it is declared against; whether that produces the stated visible pinned behaviour in a browser needs a real rendering engine or a visual-regression check.
- Whether scrolled content at its true end is actually painted unobstructed above the footer is not decidable beyond the CSS mechanism, sticky rather than fixed, that this suite proves; real paint order and coverage need a layout engine jsdom does not have.
- Whether a rendered ButtonFooter visually overlaps or obscures the shell's disclosure in a browser, the exact fact the underdetermined note turns on, remains outside what jsdom can decide even now that the containment test runs against the real app-shell.tsx rather than a fixture. The structural test is the strongest proxy this suite can produce.
- That app-shell.tsx is left unmodified by this task is a static fact about a file, not runtime behaviour a spec test observes; no assertion here can prove an absence of a diff. Verified instead by reading app-shell.tsx directly, which contains no reference to ButtonFooter.
- The implementation record's inference that ButtonFooter exposes no className or style prop is a compile-time fact of its declared props shape, refused by the project's own typecheck and lint steps rather than by this suite.
- The implementation record's inference that the sticky-without-overlap guarantee depends on ButtonFooter being rendered as the last element of a screen's own scrollable content is a constraint on how future consuming screens use it. This suite's own stand-in screen renders it last by construction, so it cannot prove what happens when a real consuming screen does not; that ordering fact belongs to the tasks that wire ButtonFooter into each screen family.
---

## What it is
Ten assertions over ButtonFooter, seven in isolation and three inside the real AppShell, plus the record of what this suite still cannot decide.
The two criteria the previous proof could only assert against a fixture now mount app-shell.tsx itself, so removing the shell's own disclosure breaks them.

## Notes
This is a re-delivery of the same task, and this proof is rewritten whole against the implementation record's new pin rather than amended.
The previous proof's third test asserted a disclosure literal it had rendered itself, which the review's coverage pass reported as a test that could not fail for the criterion it named; that fixture is gone and the assertion now reads the real component.
The addressable root the implementation gained on this pass is what made the difference: `getByRole` reaches it without the class assertions or container access the project's standard refuses, which is what failed the lint twice on the first delivery.
Three criteria still keep an `untested` entry, because jsdom decides a CSS declaration and a DOM structure and never geometry, and naming that is more honest than a test that passes without observing it.
