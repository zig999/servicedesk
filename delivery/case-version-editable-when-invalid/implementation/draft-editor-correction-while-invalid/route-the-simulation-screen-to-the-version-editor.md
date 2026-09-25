---
target: frontend
title: Route the simulation screen to the version's editor on every reading
summary: case-simulation-screen.tsx now carries a route to the named version's own editor in its loading
  and load-error phases, and case-simulation-header.tsx now carries a second, distinctly-labelled route
  to that same version's own editor on a released reading, alongside its existing route to a new sourced
  draft.
task: sha256:d3dd16816613caf1387b6640d5decc2f49cda29379321b66cc5e5b73320cd65b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-route-the-simulation-screen-to-the-version-editor-full-2
files:
- path: src/routes/case-simulation-screen.tsx
  effect: imports CaseVersionEditorLink and renders it (with the screen's own string version param and
    slug) inside both the "loading" phase's <p> and the "load-error" phase's <section>, alongside the
    existing Retry button; the "ready" phase is unchanged
- path: src/routes/case-simulation-header.tsx
  effect: on a released versionState, renders a second Button/Link pair before the existing "Edit version"
    (new-draft) control -- a Link to /cases/$slug/versions/$version (this same released version's own
    editor) labelled "View this version" -- wrapped together with the existing button so both render side
    by side; the draft branch is unchanged
criteria:
- criterion: While the simulation screen's read has not answered, the screen carries a route to the named
    version's editing surface.
  met: true
  how: the "loading" phase of case-simulation-screen.tsx now renders CaseVersionEditorLink, a Link to
    /cases/$slug/versions/$version
- criterion: Where the simulation screen's read did not complete, the screen carries a route to the named
    version's editing surface.
  met: true
  how: the "load-error" phase of case-simulation-screen.tsx now renders CaseVersionEditorLink alongside
    the existing message and Retry button
- criterion: Where the simulation screen's read was refused with CaseVersionNotValidError, the screen
    carries a route to the named version's editing surface.
  met: true
  how: use-case-simulation-version.ts's versionQuery branches only on versionQuery.isError, with no code-specific
    branch -- every ApiError, CaseVersionNotValidError included, resolves to the same "load-error" phase,
    which now carries the route
- criterion: On a reading that answered a draft version, the screen carries a route to the named version's
    editing surface.
  met: true
  how: the existing draft branch's "Edit version" button already links to /cases/$slug/versions/$version,
    unmodified by this task's edits
- criterion: On a reading that answered a released version, the screen carries a route to the named version's
    editing surface.
  met: true
  how: case-simulation-header.tsx's released branch now renders a second control, "View this version",
    linking to /cases/$slug/versions/$version, alongside the pre-existing "Edit version" control (still
    routing to /cases/$slug/versions/new?sourceVersion={version})
- criterion: The route's version number is the version number in the simulation screen's own path.
  met: true
  how: case-simulation-screen.tsx passes its own useParams-sourced string version straight to CaseVersionEditorLink
    in both edited phases; versionParams (built from the same version prop) feeds both header links
nodes:
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  how: the simulation screen for a named version now carries a route to that version's own editing surface
    across every reading the node's expression names -- pending, failed, and answered (both draft and
    released) -- with the route's presence turning on nothing about that reading's outcome
  encoded_at:
  - src/routes/case-simulation-screen.tsx
  - src/routes/case-simulation-header.tsx
inferences:
- inferred: The new released-branch control's accessible name is "View this version".
  from: the task's own Notes state the rule's Description leaves wording to the interface, and instruct
    choosing a label distinct from the existing "Edit version" button to avoid an ambiguous duplicate
    accessible name
- inferred: The loading and load-error phases reuse the existing CaseVersionEditorLink component rather
    than a new bespoke link, since neither phase holds any pre-existing "Edit version" control to collide
    with.
  from: case-version-editor-link.tsx's existing export and the manifest screen's own use of it, the same
    choice its already-delivered sibling task made
preserved:
- the released reading's existing "Edit version" route to /cases/$slug/versions/new?sourceVersion={version}
  -- left unchanged, with the new own-editor route added alongside it rather than replacing it
- the draft reading's existing "Edit version" route to /cases/$slug/versions/$version -- already satisfied
  criterion 4 and was left untouched
- the "ready" phase's delegation to CaseSimulationReadyView, and every other header prop and control --
  unchanged
deferred:
- what: Routing the other version-keyed surfaces the same rule covers (the version's own editing surface
    presenting itself, and any other surface presenting one named version not yet routed).
  why: this task's own Notes mark it REMAINDER -- the route rule covers every version-keyed surface, and
    this task answers it for the simulation screen alone
---

## What it is

case-simulation-screen.tsx's loading and load-error phases, and case-simulation-header.tsx's released-version branch, now carry a route to that same version's own editing surface.

## Notes

None.
