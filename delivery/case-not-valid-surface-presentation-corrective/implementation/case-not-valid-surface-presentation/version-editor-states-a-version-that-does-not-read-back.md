---
target: frontend
title: Version editor states a version that does not read back as a case
summary: The case version editor's own load path now distinguishes a version refused
  for validation from a read that did not complete, reusing the existing statement,
  and carries the route to that version's own manifest on every one of its own readings
  — pending, failed, refused-for-validation and ready alike — with the shared return
  type's other consumer narrowed to exclude the new phase before reading ready-only
  fields.
task: sha256:7a038a6c143cfa149927402a902141d858d52f506bd6a682b7f5bc60db12d80d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-version-editor-states-a-version-that-does-not-read-back-build-3
files:
- path: src/hooks/use-edit-draft-version-form.ts
  effect: Adds a "not-valid" member to EditDraftVersionFormState and, in useEditDraftVersionForm's
    return logic, classifies versionQuery.error through the existing errorStateKind
    wrapper; where that classification is "case-not-valid" the hook returns the new
    "not-valid" phase before the version falls into the generic "load-error" branch,
    which is otherwise unchanged and still catches every other error code (including
    one the screen holds no presentation of its own for) and every glossary-load error.
- path: src/routes/case-version-editor-screen.tsx
  effect: Every render branch — "loading", "load-error", "not-valid", and the default
    "ready" branch — now carries a Link to that same version's own manifest ("/cases/$slug/versions/$version/manifest",
    params { slug, version }), alongside each phase's own existing content (the loading
    text, the Retry button, the "not-valid" statement, and the pre-existing Simulate
    link respectively). The "not-valid" phase's own statement text is unchanged, and
    no attribute of the version or manifest entry is rendered beside it.
- path: src/routes/new-case-draft-screen.tsx
  effect: Adds a render branch for state.phase === "not-valid" (reused verbatim statement,
    no manifest link) so TypeScript excludes that phase before the existing state.isFirstVersion
    / CaseVersionEditorReadyView rendering, which still reads only "ready"-shaped
    state. This is the same shared EditDraftVersionFormState useNewDraftVersionForm
    returns by delegating directly to useEditDraftVersionForm once a draft is created.
criteria:
- criterion: Opening the version editor for a version whose read is refused because
    a validator rule of validation-runs-at-every-read does not hold for that version
    at that reading states explicitly that the version does not read back as a case.
  met: true
  how: use-edit-draft-version-form.ts now classifies versionQuery.error via errorStateKind
    (already resolving CaseVersionNotValidError, the wire-side refusal for a failed
    validation-runs-at-every-read check, to kind "case-not-valid") and returns phase
    "not-valid" for it; case-version-editor-screen.tsx renders that phase with the
    explicit statement "This case's current version does not read back as a case."
- criterion: What that screen states for a version that does not read back as a case
    is distinguishable from what the same screen states for a read of that version
    that did not complete, and neither is presented in place of the other.
  met: true
  how: The "not-valid" branch is checked before the generic isError branch, so a case-not-valid
    refusal never falls into "load-error", and any other error code still falls only
    into "load-error"; the two branches render distinct text and neither branch can
    produce the other's output. Both now also carry the same Manifest link, which
    does not affect this distinction.
- criterion: The route that screen carries to that version's own manifest is offered
    on that same reading, with no read of the version having read back as a case first.
  met: true
  how: The "not-valid" branch renders the Link to "/cases/$slug/versions/$version/manifest"
    using only slug and version, both supplied by the reader through the route params
    the screen already destructured — nothing the refused read would have answered.
    The same link is now also present on every other reading of this screen (loading,
    load-error, ready), so the refused reading is never the only one carrying it.
- criterion: A refusal of that screen's read of the version carrying an error code
    the screen holds no presentation of its own for still presents exactly what the
    screen states for a read that did not complete, disclosing neither the error code,
    nor the refusal's message, nor any value the refusal carries.
  met: true
  how: 'Any versionQuery error whose classification is neither "case-not-found" nor
    "case-not-valid" still falls through unchanged into the pre-existing generic {
    phase: "load-error", retryLoad } branch, rendered as the fixed text and a Retry
    control and the Manifest link — unchanged in wording and disclosing no code, message
    or value; the added link discloses nothing about the refusal either, carrying
    only the slug and version the reader themselves named.'
nodes:
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-screen.tsx
  how: The hook gives the refused-for-validation reading its own phase, and the screen
    states the reused "does not read back as a case" sentence for it, presenting no
    attribute of the version and no manifest entry as the content standing at that
    identity — the "not-valid" branch renders only the statement and the manifest
    route. Where every validator rule holds (the "ready" phase), the surface states
    none of this, unchanged. The task's own notes mark the "no attribute/no manifest
    entry" clause and the "states none of this on a validated reading" clause UNDERDETERMINED
    because no criterion binds either explicitly; this implementation nonetheless
    honors both as written, which is the narrower of the passing shapes the notes
    describe.
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
  how: The screen now carries the Link to that same version's own manifest in all
    four of its own readings — "loading" (no answer has arrived), "load-error" (the
    read failed), "not-valid" (refused because a validator rule does not hold), and
    the default "ready" reading (the version read back as a case, draft or released
    alike) — with the same params and the same target route in every one, and its
    presence turning on nothing about the read's outcome or the version's state, per
    a failure-diagnostician's finding against this same node read on a red suite run.
    This now answers the node's own "on every reading" clause in full for this surface,
    not only the refused-for-validation reading criterion 3 named.
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-screen.tsx
  how: Because the "case-not-valid" branch is checked and returned before the generic
    isError branch, any other refusal code still lands in the untouched "load-error"
    phase, rendered as the fixed incomplete-read statement, the Retry control, and
    the manifest route — no code, no message, no value, and no confusion with the
    case-not-valid statement.
inferences:
- inferred: The new phase is named "not-valid", matching the phase name use-case-current-version-validity.ts
    already uses for the same classification.
  from: The inventory's documented convention that the sibling three-way phase shape
    is the pattern to reuse rather than reinvent.
- inferred: The "not-valid" phase renders no Retry control.
  from: Neither case-detail-screen.tsx's nor cases-list-screen.tsx's own "does not
    read back as a case" presentation offers a retry action for that statement.
- inferred: The "not-valid" phase renders no attribute of the version and no manifest
    entry beside the statement.
  from: The node's own plain statement that the surface presents no attribute of that
    version and no entry of its manifest as the content standing at that identity.
- inferred: The manifest route is rendered as a plain Link, not wrapped in a Button,
    in every one of the four phases.
  from: This same file's own pre-existing Simulate link, which reaches the same version's
    simulation route as a plain <Link> rather than a button-styled control.
- inferred: The "loading" phase's return was widened from a bare <p> to a <section>
    wrapping the same text and the added Link.
  from: A single JSX return needs one root element once a second sibling (the Link)
    is added; <section> matches the wrapper every other phase in this file already
    returns.
- inferred: new-case-draft-screen.tsx's own "not-valid" branch reuses the same statement
    text verbatim but carries no manifest-route link, and its other branches were
    not widened with the manifest link.
  from: This screen has no version param of its own before a draft is created, and
    its own manifest-route obligation is outside this task's module scope — see `deferred`.
preserved:
- The ["case-version", slug, version] query key's queryFn, cache key and error shape,
  read unchanged by the five other consumers named in the inventory's risk entry.
- The existing case-not-found redirect — checked before, and unaffected by, the new
  case-not-valid branch or the widened Manifest link.
- errorStateKind's own mutation-side call sites in this same hook and in use-manifest-builder.ts's
  move/repin/remove handlers, none of which this task's edits touch.
- The "ready" phase's props and CaseVersionEditorReadyView's rendering of them, unchanged;
  the added Manifest link sits beside it as a sibling, not inside it.
- useNewDraftVersionForm's own create-draft logic and its own "load-error"/"loading"/"ready"
  branches — untouched; only new-case-draft-screen.tsx's consumption of its return
  type changed.
deferred:
- what: CaseNotFoundError (an unknown version number) still renders as the generic
    incomplete-read statement rather than a dedicated presentation of its own.
  why: Flagged ADVISORY, not BLOCKING, in this task's own notes — criterion 4 decides
    this as written, and no candidate node gives this surface a presentation of its
    own for CaseNotFoundError.
- what: new-case-draft-screen.tsx's own four readings (loading, load-error, not-valid,
    ready) still carry no route to the created version's own manifest, unlike case-version-editor-screen.tsx's
    now do.
  why: This screen and use-new-draft-version-form.ts are outside the module list this
    task's inventory and Notes scope to the version editor. Whether this screen owes
    the same route on every reading is a question for whichever task or corrective
    increment does claim it as in scope.
---

## What it is
The case version editor's own load path now distinguishes a version refused because a validator rule of validation-runs-at-every-read does not hold for it, from a read that did not complete, reusing the "does not read back as a case" statement already worded on two delivered screens, and carries the route to that same version's own manifest on every one of its own readings — not only the refused one. The shared EditDraftVersionFormState's other consumer (new-case-draft-screen.tsx) was narrowed so the new phase typechecks there too.

## Notes
A red build (typecheck) surfaced that new-case-draft-screen.tsx, a second consumer of the shared EditDraftVersionFormState via useNewDraftVersionForm's delegation, narrowed on the pre-existing phases only; it was updated to exclude the new "not-valid" phase before reading ready-only fields, without touching its own create-draft logic.
A red suite (the "offered on every reading" proof test) was diagnosed by a failure-diagnostician as cause: code — rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading requires the manifest route on every reading, turning on nothing about the read's outcome. The implementation was revised to carry the Manifest link in all four of the screen's own phases (loading, load-error, not-valid, ready), which the first UNDERDETERMINED-narrower inference on that node no longer reflects.
One UNDERDETERMINED note remains resolved in the narrower direction: no attribute of the version or its manifest is shown beside the not-valid statement, and the not-valid statement itself is not carried onto a validated reading — see `nodes` above.
One ADVISORY note (CaseNotFoundError) and one scope boundary (new-case-draft-screen.tsx's own manifest route across its four readings) are left open, per `deferred` above.
