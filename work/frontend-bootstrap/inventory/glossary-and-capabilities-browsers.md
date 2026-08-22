---
title: Glossary and Capabilities browsers — router, hooks, table/tabs primitives already in place
summary: The router, sidebar, both glossary-reading hooks and the reusable row-click table already exist; this onda replaces two placeholders and adds one sibling hook plus new screens, with no established precedent yet for a click-row/detail-panel-below layout.
area:
  - src/routes/route-tree.tsx
  - src/routes/route-placeholders.tsx
  - src/shared/components/app-shell.tsx
  - src/hooks/use-glossary-vocabulary.ts
  - src/hooks/use-concept-options.ts
  - src/shared/components/status-table.tsx
  - src/routes/case-detail-screen.tsx
  - src/routes/cases-list-screen.tsx
  - src/routes/case-hypotheses-tab.tsx
  - src/services/api-client.ts
  - src/services/error-ui-state.ts
sources:
  - work/frontend-bootstrap/intake/onda-6-scope.md
modules:
  - name: route-tree
    path: src/routes/route-tree.tsx
    role: touched
  - name: route-placeholders
    path: src/routes/route-placeholders.tsx
    role: touched
  - name: app-shell
    path: src/shared/components/app-shell.tsx
    role: adjacent
  - name: use-glossary-vocabulary
    path: src/hooks/use-glossary-vocabulary.ts
    role: touched
  - name: use-concept-options
    path: src/hooks/use-concept-options.ts
    role: adjacent
  - name: status-table
    path: src/shared/components/status-table.tsx
    role: depends-on
  - name: api-client
    path: src/services/api-client.ts
    role: depends-on
  - name: error-ui-state
    path: src/services/error-ui-state.ts
    role: depends-on
  - name: case-detail-screen
    path: src/routes/case-detail-screen.tsx
    role: adjacent
  - name: tui-tabs
    path: frontend/tui/frontend/src/shared/components/ui/tabs
    role: depends-on
  - name: tui-table
    path: frontend/tui/frontend/src/shared/components/ui/table
    role: depends-on
  - name: tui-panel
    path: frontend/tui/frontend/src/shared/components/ui/panel/panel.tsx
    role: depends-on
  - name: tui-card
    path: frontend/tui/frontend/src/shared/components/ui/card/card.tsx
    role: adjacent
conventions:
  - statement: "/glossary and /capabilities are already registered as flat, unparented routes on rootRoute, each rendering an import from route-placeholders.tsx (GlossaryPlaceholder, CapabilitiesPlaceholder) with no layout of its own; only the route's `component` needs to change, the route path and its AppShell wrapping stay as they are."
    seen_at: "src/routes/route-tree.tsx"
  - statement: "The sidebar's three entries (Cases, Glossary, Capabilities) and app-shell's ROUTE_LABELS table already map \"/glossary\" to \"Glossary Browser\" and \"/capabilities\" to \"Capabilities Browser\" for the breadcrumb — no nav or label change is needed for this onda."
    seen_at: "src/shared/components/app-shell.tsx"
  - statement: "A glossary-reading hook uses TanStack Query with queryKey [\"glossary\", <sub-key>], calls apiFetch<PageType>(`/v1/glossary/...`), reads only the page's `data` array and deliberately ignores total/limit/offset/pageCount, returning {options|concepts, isLoading, isError, refetch} — refetch always wraps `void query.refetch()`."
    seen_at: "src/hooks/use-glossary-vocabulary.ts"
  - statement: "A vocabulary hook narrows its own read-shape with a private page type naming only the fields it uses, rather than importing a wider DTO type; a sibling hook is written rather than widening an existing one when the fields needed diverge (use-concept-options.ts is an explicit sibling of use-glossary-vocabulary.ts for exactly this reason, and use-glossary-vocabulary.ts's own comment anticipates a later task extending its GlossaryVocabulary union with \"subject-attribute\")."
    seen_at: "src/hooks/use-concept-options.ts"
  - statement: "TUI's Select option list is produced by mapping a glossary term's `name` to both `value` and `label`; a hook returns a plain mutable SelectOption[] (never a readonly array) because Select's own prop type requires it."
    seen_at: "src/hooks/use-glossary-vocabulary.ts"
  - statement: "A tabbed screen composes @tui/ui/tabs' Tabs/TabsList/TabsTrigger/TabsContent directly in the screen component; each tab's body is a separate function component reading its own query, and TabsContent's null-render-when-inactive is relied on so an inactive tab's query never fires on first mount."
    seen_at: "src/routes/case-detail-screen.tsx"
  - statement: "StatusTable is the one reusable, data-driven table: columns/rows come from the caller as plain objects, a `{color, label}`-shaped cell value always renders as a colored dot plus its label, and a JSX-element cell value (e.g. a router Link) renders through unchanged; `onRowClick` is optional and its absence renders every row inert (no role, no tabIndex, no cursor style)."
    seen_at: "src/shared/components/status-table.tsx"
  - statement: "Both existing StatusTable onRowClick consumers use it to navigate to another route (@tanstack/react-router's navigate/Link), not to select a row and swap a same-screen detail panel — no click-row/detail-panel-below composition exists anywhere in this codebase yet."
    seen_at: "src/routes/cases-list-screen.tsx"
  - statement: "apiFetch<T>() is the one fetch wrapper every screen/hook calls the backend through; a non-2xx response is thrown as a typed ApiError{code, message, details?} before it reaches a component, and a 204 response returns undefined without attempting to parse JSON."
    seen_at: "src/services/api-client.ts"
  - statement: "uiStateForApiError() is a closed, class-name-keyed lookup table mapping an ApiError's `code` to one of a fixed UiErrorStateKind union, with every currently-unmapped code (this onda's endpoints will add none, since neither vocabulary nor concept nor capability reads throw a domain error this table names) collapsing onto the shared \"generic-error\" kind."
    seen_at: "src/services/error-ui-state.ts"
must_not_duplicate:
  - what: "The apiFetch/query-key/read-only-`data` convention for a paginated glossary-style GET, including the {options|concepts/list, isLoading, isError, refetch} return shape"
    at: "src/hooks/use-glossary-vocabulary.ts and src/hooks/use-concept-options.ts"
  - what: "StatusTable, including its {color,label} status-cell contract, its element-passthrough cell rendering and its onRowClick keyboard handling"
    at: "src/shared/components/status-table.tsx"
  - what: "The Tabs/TabsList/TabsTrigger/TabsContent composition pattern (one panel function component per tab, each owning its own query)"
    at: "src/routes/case-detail-screen.tsx"
  - what: "ApiError and the apiFetch non-2xx/204 handling"
    at: "src/services/api-client.ts"
  - what: "The ROUTE_LABELS/SIDEBAR_ENTRIES entries already naming /glossary and /capabilities — do not add a second nav entry or breadcrumb label for either route"
    at: "src/shared/components/app-shell.tsx"
risks:
  - risk: "use-glossary-vocabulary.ts's GlossaryVocabulary union currently omits \"subject-attribute\"; if this onda's Concepts/Terms tabs read the union without widening it, the fifth vocabulary the scope requires cannot be requested through the existing hook."
    consumers:
      - "src/hooks/use-glossary-vocabulary.ts (every current caller of useGlossaryVocabularyOptions, which this onda must not silently change the return shape of for)"
  - risk: "use-concept-options.ts's ConceptOption type deliberately omits `ttl`; reusing that hook as-is for the Glossary Browser's Concepts tab (which the scope requires to show TTL) would need either a widened shared type or a new sibling hook — either choice changes what existing callers of useConceptOptions receive if done by widening rather than adding a sibling."
    consumers:
      - "src/hooks/use-hypothesis-revision-form.ts (the current sole consumer of useConceptOptions's `accepts`-only shape)"
  - risk: "Both glossary endpoints are genuinely paginated but the established hooks read only `data`; this onda's new reads (subject-attribute vocabulary, capabilities) inherit the same silent-first-page-only behavior if a real deployment's glossary or capability set grows past one page."
    consumers:
      - "anyone using the Glossary Browser or Capabilities Browser once seed data is replaced by a larger real dataset"
  - risk: "GET /v1/capabilities has no existing frontend integration at all — no hook, no query key convention proven for it yet — so a new use-capabilities.ts that does not mirror the established apiFetch/queryKey/`data`-only shape would introduce a second, inconsistent convention alongside the two glossary hooks."
    consumers:
      - "src/hooks/use-glossary-vocabulary.ts and src/hooks/use-concept-options.ts (the two conventions any reviewer will compare a new hook against)"
---

## What it is
The survey for Onda 6 (Glossary Browser, Capabilities Browser), landing in the router/nav wiring, the two established glossary hooks, the reusable table, the tabs-composing case-detail screen, and TUI's own component catalog.
The route tree and sidebar/breadcrumb already name /glossary and /capabilities; only each route's `component` needs to change from its placeholder to a real screen.
Two glossary hooks already exist and establish the exact conventions (query key shape, apiFetch usage, ignoring pagination fields, Select-option mapping) this onda's new hook and any Concepts-with-TTL read must mirror.
StatusTable already supports an optional onRowClick, but every current user of it navigates to another route rather than swapping an in-page detail panel — the click-row/detail-panel-below pattern the Capabilities Browser wireframe wants has no precedent in this codebase yet.
case-detail-screen.tsx is the one existing composition of TUI's Tabs primitive, and its per-tab, per-query-component pattern is the one worth mirroring for the Glossary Browser's five tabs.
TUI's catalog already ships Table, Tabs, Panel and Card primitives — nothing new needs to be built at that layer.

## Notes
GET /v1/capabilities has zero frontend precedent today; a new hook is unavoidable, and the risk section names exactly what it must match to stay consistent.
The scope's own finding #5 changes the wireframe's implied design: the Capabilities detail panel is client-side selection over an already-loaded row, never a second network call — so no "detail by name" hook is needed for capabilities, unlike a naive reading of the wireframe's two-panel sketch might suggest.
No screen in this codebase currently composes "table row click selects a row and a detail panel below re-renders from that selection" — the Capabilities Browser establishes this pattern for the first time; there is nothing existing to reuse for it beyond StatusTable's onRowClick prop itself.
