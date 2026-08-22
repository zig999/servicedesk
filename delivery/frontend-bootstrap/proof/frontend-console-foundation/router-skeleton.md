---
title: Route tree skeleton -- structural proof without rendering
summary: Four tests over src/routes/route-tree.tsx's router instance, read through @tanstack/react-router's own synchronously-populated routesById, proving the ten leaf paths, their pairwise distinctness, and their one-to-one placeholder assignment -- with no render and no DOM.
implementation: sha256:2f35d862fe545879be36e084d6640d4206f78f1acc0bdfe2bb25e6c0687d8506
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/routes/route-tree.spec.ts
    name: registers a route at each of the ten proposal screens' paths, and no other
    proves: Each of the ten screens (2.1 through 2.10) named in the proposal has its own route path defined in the router tree.
    fails_when: the tree is missing any of the ten literal path strings written into the test, or registers a leaf path beyond those ten
  - file: src/routes/route-tree.spec.ts
    name: assigns no two of the ten routes the same path
    proves: the distinctness criterion 1's "its own route path" presupposes
    fails_when: two or more of the leaf routes are registered under the identical fullPath, collapsing the number of distinct paths below the number of routes
  - file: src/routes/route-tree.spec.ts
    name: 'renders each route through exactly its own placeholder, and no route through another''s (component identity)'
    proves: Visiting each defined route renders that route's own placeholder component, distinct from every other route's placeholder. (the component-identity half; the literal act of rendering is not exercised -- see untested)
    fails_when: any leaf route's assigned component is not exactly the placeholder function imported from route-placeholders that names it, or two leaf routes end up assigned the same placeholder function
  - file: src/routes/route-tree.spec.ts
    name: 'renders each route through exactly its own placeholder, and no route through another''s (no layout on the leaf)'
    proves: No route composes a layout beyond its own placeholder content in this task. (the leaf-route half)
    fails_when: any leaf route's component is a wrapper around its placeholder rather than the bare placeholder function reference
not_applicable:
  - edge_case: matching a concrete URL (e.g. "/cases/acme") against a dynamic segment such as "/cases/$slug"
    why: the literal path strings the first test checks already state each route's declared shape; matching a candidate URL would only re-exercise @tanstack/react-router's own parsing engine, and would require router.matchRoute(), which reads router.stores -- never initialized in this "node" environment without a supplied history
  - edge_case: two operations against the route tree at once
    why: the tree is a statically built, read-only structure with no mutable shared state
  - edge_case: a dependency that fails or answers slowly
    why: building and inspecting the route tree involves no I/O and no other module's runtime behavior to wait on
  - edge_case: an empty collection where one is expected back
    why: the criteria fix the count at ten; zero routes is not a state this task's objective admits
untested:
  - "the literal act of rendering a route to its placeholder's own text -- this suite runs under Vitest's \"node\" environment with no DOM, so only the static wiring (which component reference is assigned to which route) is proven, never an actual render"
  - "criterion 4 in full -- that main.tsx mounts a single RouterProvider at the app's entry point, and that package.json pins @tanstack/react-router at ^1.95.0 -- neither main.tsx nor package.json is inspected by this spec file"
  - "whether the root route itself carries a layout component is no longer this proof's to state either way -- app-shell (a later, sibling task under the same epic) gave the root route a component, which is that task's own criterion to satisfy and its own proof's to test; this proof only answers for the ten leaves"
---

## What it is
Four tests over the router instance's own introspection surface (routesById), proving the ten distinct paths and their one-to-one placeholder assignment on the leaves -- all without rendering, since the test environment has no DOM.

## Notes
Rewritten (test count 5 -> 4): the fifth test, "leaves the root route without a layout component of its own", is no longer true. `task/frontend-console-foundation/app-shell`'s own delivery gave the root route a `component` (AppShell), which is that task's own fifth criterion -- "The AppShell wraps every route... so no screen renders outside it" -- and the only way TanStack Router supports wrapping every leaf in one shell on a flat tree is a component on their shared parent. This task's own four stated criteria never claimed the root would stay componentless forever, only that "no route composes a layout beyond its own placeholder content in this task" (scoped to this task, and still true); the dropped test was the original test-author's own stronger, unscoped addition, and it is exactly what app-shell's criteria require to become false. Per implement-task's narrower re-delivery mode, this implementation record is left untouched (its pin above is unchanged) and only this proof was rewritten.

Correction to a prior note: an earlier version of this proof said TST-01's `applies_to` scope was `.spec.tsx`-only and did not reach this `.spec.ts` file. Reading the standard as currently pinned above, TST-01's `applies_to` lists both `.spec.tsx` and `.spec.ts` -- so it does reach this file. The conclusion (no divergence recorded for asserting against `routesById` rather than rendered output) still stands, but for the right reason: TST-01 is `decided_by: tool` (the lint step), and the captured run above's lint step passed with zero findings anywhere in this file -- nothing for this record to disclose, since disclosure is owed for what departs from a rule, not for a rule's applicability being reasoned about here.
