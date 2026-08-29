# Scope

Revise the layout of the capability detail screen (routed at
`/capabilities/$name/$version`, implemented across
`frontend/app/src/routes/capability-detail-screen.tsx`,
`capability-detail-ready-view.tsx`, and `capability-form-fields.tsx`) so that
the `concept` field is the most visually prominent attribute in the form.

Today `concept` is the third field in a three-column row alongside `timeout`
and `connector` (`capability-form-fields.tsx`'s final `grid grid-cols-3`
row) — no more visual weight than `name`, `version`, `nature`, or either JSON
schema editor above it.

Give `concept` clear visual priority over the form's other fields, while
respecting the existing TUI component system (the `frontend/tui` submodule,
consumed as `@tui/ui/*`) and this app's own `design-system/tokens.css` — no
new component library, and no fork of TUI's own components.

This is a surface/layout change: no new field, no new capability, no change
to what an operator can learn or do — only which attribute reads as most
important. The specification itself already grounds why `concept` carries
that weight: `domain/integration/capability` states a capability "answers
exactly one concept, the one the registry resolves it by," and
`rules/integration/one-capability-answers-one-concept` is what the registry
enforces over that identity. The layout should read as truthful to that
fact, not merely as a stylistic preference.

The prior initiative touching this screen,
`work/capability-detail-layout-adjustment`, is closed (holds `closure.md`).
This is a new initiative and must not reuse that work root or its delivery
root.
