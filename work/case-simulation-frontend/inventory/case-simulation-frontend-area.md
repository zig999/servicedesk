---
title: Case simulation screen area
summary: The screen/ready-view/hooks triad, the route tree and app-shell label table, the mutation-hook precedent, the shared/TUI components, and the error-mapping table the new simulate route must extend.
sources:
  - work/case-simulation-frontend/intake/scope.md
area:
  - frontend/app/src/routes
  - frontend/app/src/hooks
  - frontend/app/src/services
  - frontend/app/src/shared/components
  - frontend/tui/frontend/src/shared/components/ui
modules:
  - name: routes
    path: frontend/app/src/routes
    role: touched
  - name: hooks
    path: frontend/app/src/hooks
    role: touched
  - name: services
    path: frontend/app/src/services
    role: touched
  - name: shared-components
    path: frontend/app/src/shared/components
    role: depends-on
  - name: tui-catalog
    path: frontend/tui/frontend/src/shared/components/ui
    role: depends-on
  - name: app-shell
    path: frontend/app/src/shared/components/app-shell.tsx
    role: touched
  - name: case-detail-screen
    path: frontend/app/src/routes/case-detail-screen.tsx
    role: touched
  - name: case-version-editor-screen
    path: frontend/app/src/routes/case-version-editor-screen.tsx
    role: touched
conventions:
  - statement: "A routed detail screen is a screen/ready-view/hooks triad: useParams for route params, one phase-union hook (loading | load-error | ready), one explicit branch per phase, and the ready phase delegated whole to a *-ready-view.tsx component."
    seen_at: frontend/app/src/routes/case-version-editor-screen.tsx
  - statement: "A new leaf route is a createRoute() plus one entry in routeTree.addChildren([...]); a static segment is declared to rank over a dynamic sibling regardless of registration order where the two could collide."
    seen_at: frontend/app/src/routes/route-tree.tsx
  - statement: "Every route the tree declares needs a matching entry in ROUTE_LABELS or the breadcrumb falls back to the raw pathname instead of a readable label."
    seen_at: frontend/app/src/shared/components/app-shell.tsx
  - statement: "A one-shot dispatch (not a persisted resource) holds its subject as plain component state, not react-hook-form, and dispatches through useMutation({ mutationFn: () => apiFetch<T>(path, { method: \"POST\", headers, body: JSON.stringify(body) }) }), gated by a computed canX boolean."
    seen_at: frontend/app/src/hooks/use-test-connector-panel.ts
  - statement: "A dispatch failure resolves to a message through uiStateForApiError (error-ui-state.ts) rather than a hand-checked error.code at the call site; an unmapped code falls back to one generic message/state."
    seen_at: frontend/app/src/hooks/use-test-connector-panel.ts
  - statement: "error-ui-state.ts keys UI states by the backend's thrown domain error class name verbatim, mirrored from status-map.ts, and states no UI wording itself — only that a distinct kind exists."
    seen_at: frontend/app/src/services/error-ui-state.ts
  - statement: "A status-shaped table cell is always {color, label} rendered together as a dot plus text; a cell that is itself a React element (e.g. a router Link) renders exactly as given."
    seen_at: frontend/app/src/shared/components/status-table.tsx
  - statement: "Raw request/response JSON is shown verbatim, never summarized, in <pre className=\"rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto\">, one block per distinct outcome kind."
    seen_at: frontend/app/src/routes/connector-test-panel-result.tsx
  - statement: "A version's state renders through a Record<CaseVersionState, {color,label}> table: draft -> bg-warning, released -> bg-success — not a fact any specification node names a color for, but the convention every state cell in this app already follows."
    seen_at: frontend/app/src/routes/case-detail-screen.tsx
must_not_duplicate:
  - what: "The apiFetch<T> + useMutation dispatch pattern for a one-shot, non-persisted operation, including its canX-gate and error-message resolution through uiStateForApiError"
    at: frontend/app/src/hooks/use-test-connector-panel.ts
  - what: "StatusTable (columns/rows/onRowClick, {color,label} cell convention)"
    at: frontend/app/src/shared/components/status-table.tsx
  - what: "JsonTextareaField and its pure getJsonTextareaMinifiedValue helper"
    at: frontend/app/src/shared/components/json-textarea-field.tsx
  - what: "The capability-registry read (name/version/nature/connector/concept/input_schema/output_schema/timeout)"
    at: frontend/app/src/hooks/use-capabilities.ts
  - what: "The connector-configuration read (connector, configuration as raw JSON string)"
    at: frontend/app/src/hooks/use-connector-configurations.ts
  - what: "The raw-JSON <pre> rendering convention for a request/response block"
    at: frontend/app/src/routes/connector-test-panel-result.tsx
  - what: "The error-to-UI-state central mapping table and its uiStateForApiError resolver"
    at: frontend/app/src/services/error-ui-state.ts
risks:
  - risk: "ROUTE_LABELS is a flat Record<string,string> hand-maintained beside the route tree; adding the new /simulate leaf to route-tree.tsx without a matching entry leaves the breadcrumb silently showing the raw pathname instead of a label."
    consumers:
      - frontend/app/src/shared/components/app-shell.tsx
  - risk: "CaseVersionRecord and CaseVersionManifestEntry (case-version-record.ts) carry no collectionPlan field today; the subject-derivation hook needs a new read this shared type does not yet expose, and widening it risks touching every existing consumer of that type (the Version Editor's edit and read-only flows)."
    consumers:
      - frontend/app/src/hooks/use-edit-draft-version-form.ts
      - frontend/app/src/routes/case-version-editor-ready-view.tsx
  - risk: "ConnectorConfiguration.configuration is an untyped raw JSON string on the wire; a new consumer parsing it for ${subject:<attribute>} placeholders in its address field introduces the first structured read of that string's shape, with no existing type or parser to reuse or diverge from."
    consumers:
      - frontend/app/src/hooks/use-connector-configurations.ts
  - risk: "error-ui-state.ts's table is a single shared module every screen's mutation hooks read; adding simulate-case/simulate-hypothesis error classes to the same Record touches a file use-test-connector-panel.ts, use-connector-configuration-detail.ts and use-edit-draft-version-form.ts all currently depend on for their own unrelated error kinds."
    consumers:
      - frontend/app/src/hooks/use-test-connector-panel.ts
      - frontend/app/src/hooks/use-connector-configuration-detail.ts
      - frontend/app/src/hooks/use-edit-draft-version-form.ts
---

## What it is

The screen/ready-view/hooks triad this plan must follow is established twice in this area: `case-version-editor-screen.tsx` + `case-version-editor-ready-view.tsx` + `use-edit-draft-version-form.ts`, and `connector-configuration-detail-screen.tsx` + `connector-configuration-detail-ready-view.tsx` + `use-connector-configuration-detail-view.ts`.
`frontend/app/src/routes/route-tree.tsx` is a flat, code-based route tree — every leaf a direct child of one root route rendering `AppShell` — and `frontend/app/src/shared/components/app-shell.tsx` holds the `ROUTE_LABELS` table the breadcrumb reads.
`frontend/app/src/hooks/use-test-connector-panel.ts` is the direct mutation-hook precedent the scope names for `use-simulate-case`/`use-simulate-hypothesis`.
`frontend/app/src/services/error-ui-state.ts` is the one central table every mutation hook's dispatch-failure resolution reads, and the file the scope says the new errors must be mapped into.
`frontend/app/src/shared/components/status-table.tsx` and `json-textarea-field.tsx` are the two shared components the scope names for reuse; both are already composed by more than one existing screen.
`frontend/app/src/hooks/use-capabilities.ts` (`GET /v1/capabilities`) and `use-connector-configurations.ts` (`GET /v1/connectors`) already read the full capability registry and every connector configuration, each returning every field its own domain type declares.
All eight TUI catalog components the scope names — `stat-panel`, `progress`, `card`, `panel`, `sheet`, `skeleton`, `empty`, `alert` — exist under `frontend/tui/frontend/src/shared/components/ui/` and are confirmed unused by the app today.
`case-detail-screen.tsx`'s Versions tab and `case-version-editor-screen.tsx` are the two existing screens the scope names as entry points for a new "Simulate" button.
No `collectionPlan` field is read anywhere under `frontend/app` today, and no `/simulate` route, `case-simulation-*` file, or `simulate-case`/`simulate-hypothesis` symbol exists in the tree — this is greenfield construction inside an established pattern, not an extension of existing simulation code.

## Notes

The backend operations `simulate-case`/`simulate-hypothesis` do not exist in the tree yet (the sibling backend initiative is still being planned in parallel) — confirmed absent by search; the two new mutation hooks have nothing on the backend side to call today and are written against `contracts/investigation/case-simulation` per the scope's own instruction, not against backend source.
`ConnectorConfiguration.configuration` (`use-connector-configurations.ts`) is a plain JSON string with no structured type for its `address` field or `${subject:<attribute>}` placeholders — the subject-derivation hook is the first consumer to parse that string's internal shape.
