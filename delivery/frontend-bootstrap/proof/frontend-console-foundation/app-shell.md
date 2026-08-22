---
title: Proof for AppShell's sidebar, topbar breadcrumb and no-auth indicator
summary: A self-contained three-route test router exercises AppShell's sidebar, breadcrumb, no-auth indicator and content-wrapping behavior without depending on the production route tree.
implementation: sha256:ae852f85ca0382b14c643a1f5af91f8e7ff2f7bb6ca765ee0cbded2b538655a7
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/shared/components/app-shell.spec.ts
    name: lists exactly the three sidebar entries Cases, Glossary and Capabilities, with no Hypotheses entry
    proves: the sidebar surfaces exactly the three fixed navigation entries and never a Hypotheses entry
    fails_when: the sidebar renders a different set of entries, a different order, an extra entry, or any entry whose text matches /hypothes/i
  - file: src/shared/components/app-shell.spec.ts
    name: links each sidebar entry to its own real route
    proves: each sidebar entry is a real router Link pointing at its own distinct path, not a placeholder or shared href
    fails_when: any of the three links' href attribute is missing, empty, or does not equal its own route's path ("/cases", "/glossary", "/capabilities")
  - file: src/shared/components/app-shell.spec.ts
    name: renders the breadcrumb through TUI's Breadcrumb primitive, reflecting the currently matched route
    proves: with "/cases" as the current route, the breadcrumb navigation region shows the label for that route
    fails_when: no element with role "navigation" and name "breadcrumb" exists, or it does not contain the text "Cases List"
  - file: src/shared/components/app-shell.spec.ts
    name: updates the breadcrumb when a different route is current, rather than a fixed string
    proves: the breadcrumb tracks the currently matched route rather than showing a constant string -- with "/glossary" current it shows that route's own label and not the "/cases" label
    fails_when: the breadcrumb region does not contain "Glossary Browser", or it still contains "Cases List" (a fixed string would satisfy the previous test and this one identically, which this test rules out)
  - file: src/shared/components/app-shell.spec.ts
    name: shows the fixed no-auth indicator regardless of which route is current
    proves: the "No auth in this build" indicator is present both at "/cases" and, independently after unmounting and mounting a fresh router, at "/capabilities"
    fails_when: the indicator text is absent under either route
  - file: src/shared/components/app-shell.spec.ts
    name: wraps the matched route's own content with the sidebar and topbar rather than replacing them
    proves: at "/cases" the matched leaf route's own rendered content ("Screen A content") coexists with the sidebar navigation and the breadcrumb navigation in the same render, rather than AppShell displacing the route's content or the route's content displacing the shell
    fails_when: the route's own content is absent, or either the "Primary" navigation or the "breadcrumb" navigation is absent alongside it
untested:
  - "the production route tree's own ten routes and their real ROUTE_LABELS entries, beyond the two labels (\"Cases List\" for \"/cases\", \"Glossary Browser\" for \"/glossary\") exercised here -- this suite builds a small, self-contained three-route test router rather than the production route-tree.tsx, so AppShell's breadcrumb/sidebar wiring is proven against a stand-in router; the other seven production routes and their labels, and the correctness of the production ROUTE_LABELS table as a whole against all ten real paths, are not exercised by any test here. This is a deliberate simplification to keep the test router small and decoupled from the production route tree's shape, not a defect in AppShell itself -- but it means no test in this file would catch a wrong or missing label entry for any route other than \"/cases\" and \"/glossary\" in the real, ten-route production table."
---

## What it is
Six tests over AppShell rendered inside a small, self-contained three-route test router (not the production ten-route tree): the fixed sidebar entries and their real hrefs, the breadcrumb reflecting whichever route is current across two different routes, the always-visible no-auth indicator across two different routes, and the shell wrapping a matched route's own content rather than displacing it.

## Notes
None.
