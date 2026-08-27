# Scope — case-simulation, frontend

Source: section 6 of `temp/plano-cockpit-simulacao.md` (verbatim below), plus decisions D7, D8, D9,
D11 from section 2, handed to `/plan-work` as material — the decomposition, not this document,
decides the actual epics and tasks. The layout wireframe (section 6.2) is persisted separately at
`intake/layout/simulation-screen.md`, apart from this scope, per the plan-node contract's own
`reference` field.

## Route and entry (6.1)

`/cases/$slug/versions/$version/simulate`. Entry: a "Simulate" button on the version screen
(`/cases/$slug/versions/$version`) and on the Versions tab of `/cases/$slug`. Works on both `draft`
and `released`; on `released` the edit links point at "create a draft from this version"
(`/cases/$slug/versions/new?sourceVersion=<n>`, already existing).

## Regions (6.3) — what each part of the screen does

**Header** — version identity and state (colors already conventioned: `draft: bg-warning`,
`released: bg-success`), `when_to_use`, links "Edit version" and "Manifest" (existing screens), the
primary action "Simulate case", the declared deadline.

**Subject (D7)** — one subject per simulation, shared between the single-hypothesis run and the
full-case run. Fields: type (glossary vocabulary), requester (required), attributes. The
**required attributes are pre-derived** before running:
1. The version's `collectionPlan` → concepts (already-published operation on `case-query`/`case-version`).
2. The capability registry → for each concept, the capability that answers it and its connector
   (`/capabilities` and `/connectors`, already published).
3. The connector's configuration → its `address` with `${subject:<attribute>}` placeholders (e.g.
   `…/technicians/${subject:user-id}/profile` needs `user-id`).
4. One field per distinct placeholder, annotated with the connector (and capability) that asks for
   it; the capability's `input_schema` as a hint (it is free text — may be prose, as in the
   `perfil-mobile-tecnico-reader` case). The curator may add free-form attributes. "Simulate" stays
   disabled while a required field is empty or the requester is empty.
All of this derivation happens **in the frontend, from already-published endpoints** — it needs no
new route.

**Hypotheses** — a `StatusTable` in precedence order, **one row per hypothesis in the manifest**,
always all of them. Columns: position, name, number of concepts collected, last run's verdict (with
`reason` when inconclusive), last run's token cost, actions (▶ simulate only this hypothesis; ✎
open the hypothesis's own revision screen with a way back — see "Edit and re-simulate" below).
Below: the determining line → outcome → referral, and a summary of the last run with a segmented
bar of the three stages against the 7 / 5 / 4 s budgets (the `progress` component).

**Detail** — opens on selecting a row. Verdict and citations prominent; the criterion as judged;
evidence per concept (result, capability → connector, `elapsed_ms`, observation as a collapsible
JSON block, `result_detail` when present); judgment data (model, prompt version, tokens, time).
Tabs: **Evidence** (default), **Prompt** (D11 — the `<judgment_input>` exactly as it went to the
model, in a monospace `<pre>`; absent with an explanation when `no-data`, because judgment was
never called), **JSON** (the raw response for that hypothesis).

**Case result** — only after a full-case run. Outcome, referral and determinant on one line; the
customer-facing text in a box labeled with the chosen register (`formal`/`plain`); **this
session's run history, in memory** (nothing persisted — consistent with D10 and with
`rules/investigation/a-simulation-writes-no-investigation`), with a "Compare" side by side,
hypothesis by hypothesis. When the version changes (see "Edit and re-simulate"), the last run is
marked "stale".

## States and vocabularies (6.4) — no creative translation

| Vocabulary | Values | On screen |
|---|---|---|
| `verdict` | confirmed / refuted / inconclusive | green / red / amber pill; `inconclusive` **always** shown with its `reason` |
| `evaluation-reason` | no-data / judgment-failure / deadline-exceeded | text alongside; `no-data` highlights in amber the non-ok evidence that caused it and says "judgment not called · 0 tokens" |
| `evidence-result` | ok / unavailable / denied / timeout | per concept: green / gray / red / amber, with `result_detail` |
| run | idle / running / done / error | `running`: stages lighting up in sequence with time running against the budget; `error` **only** for an operation failure (network, 5xx), never for a verdict |

A partial failure is a result, not an error: an `unavailable` connector → an `inconclusive/no-data`
hypothesis → the case still resolves → `fallback` if nothing confirms. The chain must read at a
glance (amber evidence, amber hypothesis, outcome marked fallback).

One run at a time per screen (buttons disable while `running`). No server-side state.

## Edit and re-simulate (D8)

No editors embedded in the cockpit. ✎ leads to
`/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName` with `?back=simulate`; "Edit
version" leads to `/cases/$slug/versions/$version`; "Manifest" leads to `.../manifest`. On return:
invalidate the version's query, reload the table, mark the last run "stale" (compare a hash/
`updated_at` of the version if one exists; otherwise always mark stale on return). On `released`,
the links lead to creating a draft from the version.

## Construction (6.6)

- Route in `route-tree.tsx` + `ROUTE_LABELS`; screen `case-simulation-screen.tsx` in the
  screen / ready-view / hooks pattern.
- Hooks: `use-simulation-subject` (derives the required attributes — see "Subject" above),
  `use-simulate-case`, `use-simulate-hypothesis` (`useMutation` + `apiFetch`, like
  `use-test-connector-panel`), `use-simulation-history` (in-memory state, comparison).
- Reuse: `StatusTable`, `JsonTextareaField`, the visual pattern of
  `connector-test-panel-result.tsx` (`<pre className="rounded-md border border-border bg-muted p-3
  text-sm font-mono overflow-x-auto">`), and from the TUI catalog: `stat-panel`, `progress`,
  `panel`/`card`, `tabs`, `skeleton`, `empty`, `alert`. Nothing new in the design system.
- Map the new errors in `error-ui-state.ts`.

## Decisions from section 2 in scope here

- **D7** — the subject derived from the connectors' own placeholders (`${subject:<attribute>}` in
  `address`) is the reading of "configure the attributes each external call needs". Per-hypothesis
  attributes are out of this v1.
- **D8** — no editors embedded in the cockpit. Links there and back to the editing screens already
  delivered.
- **D9** — tokens, never currency, on the screen. No price table in any specification node or in
  the backend.
- **D11** — show the prompt sent to the model in a tab of the detail. Safe because
  `constraints/the-judgment-prompt-is-closed` fixes the prompt.

## Verified facts (repository, re-verified 2026-08-27 — reread before trusting; code may have moved)

- Stack: React 19, `@tanstack/react-router`, `@tanstack/react-query`, `zod`, `react-hook-form`,
  `sonner`. Target root: `frontend/app`.
- API client: `frontend/app/src/services/api-client.ts` (`apiFetch<T>`; non-2xx becomes
  `ApiError{code,message,details?}`); `frontend/app/src/services/error-ui-state.ts` maps `code` →
  UI state (closed table; `generic-error` fallback); `frontend/app/src/services/query-client.ts`.
- Screen pattern: *screen* / *ready-view* / *hooks* pair (e.g.
  `frontend/app/src/routes/connector-configuration-detail-screen.tsx`,
  `connector-configuration-detail-ready-view.tsx`, `frontend/app/src/hooks/use-test-connector-panel.ts`).
- Shared components: `frontend/app/src/shared/components/status-table.tsx`
  (`StatusTable{columns, rows, onRowClick}`; a `{color,label}` cell becomes a dot + text),
  `json-textarea-field.tsx`, `conflict-banner.tsx`, `app-shell.tsx` (sidebar Cases | Glossary |
  Capabilities | Connectors; breadcrumb via `ROUTE_LABELS`).
- Status colors already conventioned: `draft: bg-warning`, `released: bg-success`, absence
  `bg-muted` (`cases-list-screen.tsx` ~189-191).
- TUI catalog (alias `@tui/ui/*`, at `frontend/tui/frontend/src/shared/components/ui/`): `alert
  banner breadcrumb button card checkbox date-picker dialog divider empty input kbd label link
  multi-combobox panel person-picker progress radio-group select sheet skeleton stat-panel
  status-bar switch table tabs textarea tooltip`. Not used in the app yet; useful here:
  `stat-panel`, `progress`, `card`, `panel`, `sheet`, `skeleton`, `empty`, `alert`.
- Design tokens: `frontend/app/src/design-system/tokens.css`.
- Routes (`frontend/app/src/routes/route-tree.tsx`): `/cases`, `/cases/$slug`,
  `/cases/$slug/versions/$version`, `/cases/$slug/versions/new?sourceVersion=`,
  `/cases/$slug/versions/$version/manifest`, `.../manifest/hypotheses/$hypothesisName`,
  `.../manifest/hypotheses/new`, `/glossary`, `/capabilities`, `/capabilities/$name/$version`,
  `/connectors`, `/connectors/$connector`. **No investigation/diagnose/simulation route exists
  today.**
- Direct precedent: the "Test connector" panel — `frontend/app/src/hooks/use-test-connector-panel.ts`,
  `frontend/app/src/routes/connector-test-panel-fields.tsx`, `connector-test-panel-result.tsx`;
  backend `src/src/http/dto/test-connector.dto.ts`; contract
  `knowledge/contracts/integration/connector-diagnostics.md`. Already assembles a subject (glossary
  type + attribute/value pairs), picks a capability, shows `input_schema` as a hint, and displays
  the raw request/response with `elapsedMs`.
- `intake/layout/` holds no reference anywhere in the project as of today — this plan's own
  wireframe (`intake/layout/simulation-screen.md`) is the first.
- The backend sibling initiative (`case-simulation-backend`) is being planned in parallel right now
  and is not yet delivered — the API this screen calls does not exist in the tree yet. This
  frontend plan implements against the specification's own contract
  (`contracts/investigation/case-simulation`), not against backend source.
- `work/frontend-spec-conformance-corrections` is fully delivered (`deliver.py --outstanding`:
  "every task has a record, and every record its proof") but not closed (no `closure.md`) — it does
  not block this initiative.
