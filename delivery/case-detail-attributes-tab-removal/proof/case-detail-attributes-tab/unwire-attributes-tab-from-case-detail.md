---
title: Proof for unwiring the Attributes tab from Case Detail's tab strip
summary: Tests establishing that Case Detail's tab strip now offers exactly Versions and Hypotheses, that
  case-detail-screen.tsx imports nothing from routes/case-attributes-tab, and that no spec anywhere in
  the tree still asserts an Attributes tab on Case Detail.
implementation: sha256:145c551a52de05427c422e20ae185a3183496d7a797e5c20c1508c12584eb0b6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-detail-attributes-tab-unwire-attributes-tab-from-case-detail-suite
tests:
- file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
  name: renders exactly the Versions and Hypotheses tab triggers, with no third trigger
  proves: Case Detail renders exactly two tab triggers, labelled Versions and Hypotheses (and, as a corollary
    of that exact count and those exact labels, case-detail-screen.tsx renders no tab trigger with the
    value "attributes").
  fails_when: a third tab trigger renders alongside Versions and Hypotheses, either of those two is missing,
    or either carries a different accessible name.
- file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
  name: renders no content associated with the case's declared attributes while switching between Versions
    and Hypotheses
  proves: case-detail-screen.tsx renders no tab content with the value "attributes" — there is no reachable
    state, across the tabs the strip actually offers, in which Attributes-tab content (proxied by the
    "Consolidation register" text unique to CaseAttributesTab) appears.
  fails_when: any content unique to CaseAttributesTab (e.g. "Consolidation register") renders at initial
    mount, after selecting Hypotheses, or after selecting Versions again.
- file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
  name: imports nothing from routes/case-attributes-tab
  proves: case-detail-screen.tsx imports nothing from routes/case-attributes-tab.
  fails_when: case-detail-screen.tsx's own source reintroduces any import specifier containing "case-attributes-tab".
- file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
  name: no longer contains the spec file that proved the Attributes tab's presence
  proves: the implementation's own inference that removing case-detail-screen-attributes-tab.spec.ts is
    this task's responsibility, and (as part of) No spec file in the tree asserts that Case Detail presents
    an Attributes tab.
  fails_when: src/routes/case-detail-screen-attributes-tab.spec.ts exists on disk again.
- file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
  name: contains no other spec asserting a tab trigger named or valued Attributes
  proves: No spec file in the tree asserts that Case Detail presents an Attributes tab, over every .spec.ts/.spec.tsx
    file under src rather than only the one file already checked deleted.
  fails_when: 'any .spec.ts or .spec.tsx file under src (other than this one) contains a getByRole/findByRole/queryByRole("tab",
    { name: "Attributes" }) query or a literal TabsTrigger value="attributes".'
not_applicable:
- edge_case: two rapid tab switches racing each other (Versions ↔ Hypotheses)
  why: tab selection is synchronous local state in @tui/ui/tabs, unrelated to any network timing; this
    task neither introduces nor changes that mechanism, and no criterion here names a race guarantee.
- edge_case: a malformed or absent slug route param reaching CaseDetailScreen
  why: slug parsing and its URL-encoding are exercised by the pre-existing, unedited case-detail-screen.spec.ts
    and are untouched by this task, which only removes a TabsTrigger/TabsContent pair and an import.
untested:
- 'the tree-wide scan for a remaining Attributes-tab assertion (criterion 8) is a regex heuristic over
  getByRole/findByRole/queryByRole("tab", {name: "Attributes"}) and raw TabsTrigger value="attributes"
  literals; a spec asserting the same fact through some other phrasing (e.g. a snapshot, or a differently-shaped
  query) would not be caught by it.'
---

## What it is
Five tests in one new file, case-detail-screen-attributes-tab-removed.spec.ts, prove every criterion of the unwiring task: the tab strip's exact trigger count and labels, the absence of Attributes content reachable through either surviving tab, the screen's own import list, and a tree-wide scan confirming no spec anywhere still asserts an Attributes tab.

## Notes
The tree-wide scan (last test) is a regex heuristic rather than a type-checked assertion, disclosed in `untested` above; it is the same kind of scan the implementation record used to confirm criterion 8 by hand, now held up by an automated test.
