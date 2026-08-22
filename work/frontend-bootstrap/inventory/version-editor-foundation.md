---
title: Version Editor build surface, over the Onda 1/2 foundation and the real backend contract
summary: What the Version Editor (plus the folded-in New Draft form) can reuse from the delivered foundation, and the exact backend shapes, vocabularies and error bodies it must match.
sources:
  - work/frontend-bootstrap/intake/onda-3-scope.md
area:
  - frontend/app/src
modules:
  - name: conflict-banner
    path: frontend/app/src/shared/components/conflict-banner.tsx
    role: touched
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: query-client
    path: frontend/app/src/services/query-client.ts
    role: depends-on
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: touched
  - name: route-placeholders
    path: frontend/app/src/routes/route-placeholders.tsx
    role: touched
  - name: case-detail-screen
    path: frontend/app/src/routes/case-detail-screen.tsx
    role: adjacent
---
## What it is
`ConflictBanner` (frontend/app/src/shared/components/conflict-banner.tsx) takes only `title` and `message` props and renders TUI's `Banner` at its default frame; its own header comment records that it deliberately never uses `Banner`'s `accent` prop -- a divergence already accepted at Onda 1 -- because the notched frame needed to make `accent` render double-renders the heading and swaps the "banner" landmark for a plain "region", and the conflict is already conveyed through title/message text, never color alone. A caller building the Onda 3 conflict banner supplies exactly title/message text, nothing else, and gets no color-accent hook to lean on.
`react-hook-form` and `zod` are named in `standards/frontend-typescript.yaml`'s `dependencies` (with `@hookform/resolvers` conspicuously absent from that same list) but neither package appears in `frontend/app/package.json`'s `dependencies` today -- nothing in this app has used either one yet.
TUI's own `frontend/tui/frontend/package.json` pins `react-hook-form@^7.54.0`, `zod@^3.24.1` and `@hookform/resolvers@^3.9.1` (devDependencies), but a grep of TUI's own `src` for `useForm`/`zodResolver`/`react-hook-form` returns no files -- TUI's CLAUDE.md prose describes a "Zod v4 from `zod/v4`" convention and `z.strictObject()`, but no code anywhere in this repository backs that prose; the only real precedent is TUI's dependency versions, which are Zod v3, not v4.
The real `PATCH /v1/cases/:slug/versions/:version` body schema (`src/src/http/dto/update-draft.dto.ts`, `updateDraftBodySchema`) requires `title`, `when_to_use`, `subject`, `fallback` (`{ outcome, referral: { action, recipient } }`) and leaves `consolidation_register` optional -- full-replace, never a partial patch, and it excludes `authored_at`, `state`, `released_at`, `version` and the manifest entirely.
The real `POST /v1/cases` body schema (`src/src/http/dto/create-draft.dto.ts`, `createDraftBodySchema`) additionally requires `slug` and `authored_at` (both absent from the PATCH schema) and adds an optional `source_version`; every field the PATCH schema also requires is required here too, and `fallback`'s and `subject`'s shapes are identical between the two schemas.
`GET /v1/cases/:slug/versions/:version` (`src/src/http/dto/read-case.dto.ts`, `readCaseResponseSchema`) returns every field a pre-populated edit form needs: `title`, `when_to_use`, `subject`, `fallback`, `consolidation_register` (optional), plus `version`, `authored_at`, `state`, `released_at` and a `manifest` array constrained to `.min(1)` -- the response schema cannot ever describe a version whose manifest holds zero entries.
The glossary's five term vocabularies (`src/src/glossary/terms.ts`'s `TERM_VOCABULARIES`) are each independently registered and readable through `GET /v1/glossary/:vocabulary` (`list-vocabulary-terms.routes.ts`/`.controller.ts`/`.dto.ts`), paginated through the shared `PaginatedResponse<GlossaryTerm>` shape, with no per-vocabulary domain error raised for an unrecognized value -- refused instead by the route's own `z.enum(TERM_VOCABULARIES)` as a plain 400 validation envelope.
The seed fixtures actually registered today (`src/src/fixtures/glossary/*.json`) hold exactly one `subject-type` (`contract`), four `outcome`s, three `action`s and three `recipient`s -- confirming the wireframe's own "(fixed)" subject field and its two live dropdowns for fallback outcome and fallback referral (action+recipient).
`CaseVersionNotDraftError` (`src/src/errors/case-version-not-draft.error.ts`) carries `context: { slug, version, state }` and maps to 409 in `status-map.ts`; `CaseAlreadyHasDraftError` (`src/src/errors/case-already-has-draft.error.ts`) carries `context: { slug }` only and also maps to 409. Both reach the client through `api-client.ts`'s envelope as `ApiError.code` = the class name verbatim, with `details` = that `context` object.
`error-ui-state.ts` already maps both `CaseVersionNotDraftError` -> `case-version-not-draft` and `CaseAlreadyHasDraftError` -> `case-already-has-draft` as distinct `UiErrorStateKind`s; no screen yet consumes either kind.
`route-tree.tsx` already registers `/cases/$slug/versions/$version` against `CaseVersionPlaceholder` (`route-placeholders.tsx`) -- the route the Version Editor replaces -- but registers no route at all for a blank "new draft" entry point; `case-detail-screen.tsx` (delivered, reviewed) has no "New draft" action of any kind today, matching the Onda 2 closure decision that cut it.
`query-client.ts`'s shared `QueryClient` wires only a `QueryCache`-level `onError` toast for query failures; it configures no `MutationCache`-level `onError`, so a `useMutation` call (the Save/POST/PATCH action this screen needs) gets no toast for free -- the mutation's own error handling, including the conflict-banner wiring and the `CaseAlreadyHasDraftError` toast+redirect, has to be written at the call site.

## Notes
The Version Editor's "Save" is the first place this app performs a write (Onda 1/2 were read-only screens); `react-hook-form` and `zod` need adding to `frontend/app/package.json` before any component can import them, and `@hookform/resolvers` needs adding too if `zodResolver` is used, since the standard names the two libraries but not that resolver package.
No real form usage exists anywhere in this repository (app or TUI) to mirror beyond package versions -- TUI's CLAUDE.md description of a Zod v4 / `z.strictObject()` convention is prose with no supporting code, and TUI's own dependency pins are Zod v3 with `@hookform/resolvers` v3 (`zodResolver` from `@hookform/resolvers/zod` against v3, not v4) -- a task building this form is establishing the app's first convention here, not following an existing one.
Reusing `updateDraftBodySchema`'s exact field set and requiredness for the client-side Zod schema, rather than re-deriving it, keeps the form's own full-replace shape aligned with what the backend actually validates; `createDraftBodySchema`'s two extra required fields (`slug`, `authored_at`) are additive over the same shape, so one schema family can plausibly serve both verbs if the task chooses to build it that way.
The manifest's `.min(1)` constraint on `GET /v1/cases/:slug/versions/:version`'s response is a real edge worth naming: a version created with no `source_version` and not yet composed starts with an empty manifest, and the wireframe's "manifest holds N hypotheses [open ->]" line implies reading this same endpoint back after a successful PATCH/POST re-hydration -- a manifest of zero entries would fail that response schema server-side, which is a fact about the backend's own current shape rather than anything this survey should paper over.
