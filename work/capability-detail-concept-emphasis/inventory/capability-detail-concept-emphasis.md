---
title: Capability detail screen's concept-field emphasis
summary: The capability detail/edit form's shared field markup, its routed ready-view
  wrapper, and this app's own TUI/token wiring -- where concept currently sits as
  an equal-weight third field in a three-column row.
area:
- frontend/app/src/routes
- frontend/app/src/design-system
- frontend/app/src/hooks
- frontend/tui/frontend/src/theme.css
- frontend/tui/frontend/src/shared/components/ui
modules:
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: capability-detail-ready-view
  path: frontend/app/src/routes/capability-detail-ready-view.tsx
  role: touched
- name: capability-detail-screen
  path: frontend/app/src/routes/capability-detail-screen.tsx
  role: touched
- name: capability-form-dialog
  path: frontend/app/src/routes/capability-form-dialog.tsx
  role: depends-on
- name: design-system-tokens
  path: frontend/app/src/design-system/tokens.css
  role: depends-on
- name: tui-theme
  path: frontend/tui/frontend/src/theme.css
  role: depends-on
- name: tui-ui-components
  path: frontend/tui/frontend/src/shared/components/ui
  role: depends-on
- name: json-textarea-field
  path: frontend/app/src/shared/components/json-textarea-field.tsx
  role: adjacent
- name: connector-configuration-form-fields
  path: frontend/app/src/routes/connector-configuration-form-fields.tsx
  role: adjacent
- name: concept-form-fields
  path: frontend/app/src/routes/concept-form-fields.tsx
  role: adjacent
sources:
- intake/scope.md
---

## What it is
The Capability create/edit form's field markup, one three-column grid row of which currently places `concept` beside `timeout` and `connector` with no distinguishing weight.
Its routed "ready" wrapper, which composes the same field markup for the `/capabilities/$name/$version` detail screen alongside the two JSON schema editors and the discard/save actions.
The app's own token-wiring file and the TUI submodule's semantic-token theme and component catalog the change must draw from rather than fork.

## Notes
`CapabilityFormFields` (`capability-form-fields.tsx`) is the one place the concept field's markup lives; both `capability-detail-ready-view.tsx` (the routed detail screen) and `capability-form-dialog.tsx` (the create/edit dialog opened from `capabilities-browser-screen.tsx`) render it unchanged, so a layout change there reaches both surfaces even though the scope names only the detail screen.
Every visual value in this codebase must come from a semantic token: TUI's `theme.css` defines the palette (`--color-accent`, `--color-primary`, `--color-destructive`, `--color-warning`, `--color-accent-alt`, `--color-border-strong`, among others) and no raw color, radius or border value may be introduced outside it; `tokens.css` additionally forbids a literal px value (its own header comment cites the project's standard, MNT-02) and states font-size as a percentage for that reason.
TUI ships an accent-bordered `Panel` component (`frontend/tui/frontend/src/shared/components/ui/panel/panel.tsx`) with `default`/`success`/`info`/`warning`/`danger`/`alt` border and title-color variants built only from semantic tokens -- an existing, non-forking way to give one field a visually distinct container if the emphasis calls for one, rather than hand-rolling a bordered box.
No `Badge` or similar "highlight chip" component exists under `frontend/tui/frontend/src/shared/components/ui` -- emphasis has to be built from Panel, typography utilities and semantic tokens, not a component that isn't there.
This screen already carries a convention of one dedicated structural proof file per layout-only task rather than folding a DOM-structure assertion into the label-text-driven `capability-detail-screen.spec.ts` -- see `capability-detail-screen-name-version-nature-row.spec.ts` (asserts three fields share one common DOM ancestor via a `closestCommonAncestor` walk) and `capability-detail-screen-schema-editor-height.spec.ts` (asserts a specific `min-h-[...]` class and explicitly excludes the shared component's own default class) -- both built on the shared `mountCapabilityDetailScreen`/`createFetchStub`/`baseHandlers` test-support helpers in `capability-detail-screen.test-support.ts`.
Every form field in this file and its two siblings (`connector-configuration-form-fields.tsx`, `concept-form-fields.tsx`) wraps its own control inside a local `FormField` component (label + control + `aria-describedby`-linked error text) rather than a matching `htmlFor`/`id` pair -- seen at `capability-form-fields.tsx` lines 81-106, identical at `connector-configuration-form-fields.tsx` lines 58-83 -- because TUI's own `Select` forwards a caller's props only to its outer wrapper div, never to the inner combobox button a screen reader announces.
TUI's `Label` component itself renders uppercase, `tracking-wider`, `text-accent` by default (`frontend/tui/frontend/src/shared/components/ui/label/label.tsx`); `FormField`'s inner wrapper deliberately overrides that to `normal-case tracking-normal font-normal text-foreground` for the control itself, so `text-accent`/uppercase styling in this screen today marks a label caption, not a value -- a convention worth knowing before reusing `text-accent` to mark the concept value as prominent.
`concept` is rendered as a single-select TUI `Select` built from `conceptOptions` (`use-concept-options`), disabled while `isSubmitting`, with its own `aria-invalid`/`aria-describedby` wiring -- any layout change must preserve this control's identity and its `Controller`-driven `field.value`/`field.onChange` wiring, not just its visual position.
`FormField` is a local function, duplicated verbatim (not shared) across `capability-form-fields.tsx` and `connector-configuration-form-fields.tsx` already -- the plan must reuse the one already defined in `capability-form-fields.tsx` for this screen rather than adding a third near-duplicate, and should not fold this pre-existing duplication into its own task's scope (out of scope per the surface-only nature of this change).
`capability-form-fields.tsx`'s existing `grid grid-cols-3`/`grid grid-cols-2` structure is asserted only indirectly today -- `capability-detail-screen.spec.ts` locates every field by `getByLabelText` and never inspects grid placement, but `capability-detail-screen-name-version-nature-row.spec.ts` and `capability-detail-screen-schema-editor-height.spec.ts` do inspect structure/classNames directly and would need a new sibling spec for whatever grid change ships here, following that same pattern.
The specification's own grounding for this change (`domain/integration/capability`, `rules/integration/one-capability-answers-one-concept`) lives in the specification root, outside this survey's target source root, and is not re-derived here.
