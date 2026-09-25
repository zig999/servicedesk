---
target: frontend
title: Route the manifest screen to the version's editor on every reading
summary: version-manifest-screen.tsx now carries an unconditional link to that same version's editing
  surface on every one of its four phases, keyed to the version already in its own path.
task: sha256:48490afe3d08b38642f6fb883e8057ee8b888e405590affdf85dd41a8ac7927a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-route-the-manifest-screen-to-the-version-editor-full
files:
- path: src/routes/case-version-editor-link.tsx
  effect: new small route-link component, CaseVersionEditorLink, taking slug and version and rendering
    a TanStack Router Link to /cases/$slug/versions/$version (the case version editor's own route); extracted
    to its own file since inlining would have pushed version-manifest-screen.tsx over MNT-01's 300-line
    budget
- path: src/routes/version-manifest-screen.tsx
  effect: imports CaseVersionEditorLink and renders it, keyed to the screen's own slug/version params,
    in all four phases (loading, load-error, not-valid, ready) with its presence in the ready phase unconditional,
    not gated by state.isReleased; also compacted the load-error phase's pre-existing three-line Retry
    button to one line to stay within the line budget
criteria:
- criterion: While the manifest screen's read has not answered, the screen carries a route to the named
    version's editing surface.
  met: true
  how: the "loading" phase's return renders CaseVersionEditorLink slug={slug} version={version} unconditionally,
    before any read has answered
- criterion: Where the manifest screen's read did not complete, the screen carries a route to the named
    version's editing surface.
  met: true
  how: the "load-error" phase's return renders CaseVersionEditorLink alongside the existing Retry control
- criterion: Where the manifest screen's read was refused with CaseVersionNotValidError, the screen carries
    a route to the named version's editing surface.
  met: true
  how: the "not-valid" phase's return (reached when useManifestBuilder maps that refusal to this phase)
    renders CaseVersionEditorLink
- criterion: On a reading that answered a draft version, the screen carries a route to the named version's
    editing surface.
  met: true
  how: the final "ready" return renders CaseVersionEditorLink unconditionally, reached alike whether state.isReleased
    is false or true
- criterion: On a reading that answered a released version, the screen carries a route to the named version's
    editing surface.
  met: true
  how: the same unconditional CaseVersionEditorLink in the "ready" return answers this reading too, since
    nothing there branches on isReleased
- criterion: The route's version number is the version number in the manifest screen's own path.
  met: true
  how: VersionManifestScreen reads slug and version via useParams once at the top of the component, and
    that same version string is threaded into every CaseVersionEditorLink call site across all four phases
nodes:
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  how: version-manifest-screen.tsx is reached exactly by slug + version, so it is a surface the rule governs;
    CaseVersionEditorLink now renders in that screen's loading, load-error, not-valid and ready phases
    alike, gated by no state and linking to case-version-editor-screen.tsx's own registered route with
    the version taken from this screen's own path params
  encoded_at:
  - src/routes/case-version-editor-link.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  how: this task does not implement the refusal itself (computed upstream in use-manifest-builder); it
    is honored here in that the route this task adds is present on exactly the "not-valid" phase too,
    which is that refusal's own presentation
inferences:
- inferred: version-manifest-screen.tsx is a surface the route rule governs, since it is reached by the
    case's slug together with the version's own number
  from: the task's own ADVISORY note asking this to be confirmed, confirmed by reading route-tree.tsx
    -- versionManifestRoute's path is literally "/cases/$slug/versions/$version/manifest", carrying both
    identifiers the rule's condition names
- inferred: the new link's placement (a standalone line per phase) and its label text ("Edit version")
    are left to this implementation
  from: the rule's own Description states explicitly that which control carries the route, its wording
    and where it sits are form and belong to the interface, not stated by any node
preserved:
- the loading, load-error and not-valid phases' existing controls (Retry, AddHypothesisLink, placingControl)
  keep their existing behavior and text; only the Retry button's JSX was reformatted to one line, its
  onClick handler and label unchanged
- the ready phase's existing isReleased-gated behavior for AddHypothesisLink, the isBlocked ConflictBanner,
  the StatusTable rows and the isReleased-gated placingControl are all unchanged
- version-manifest-screen.tsx stays within MNT-01's 300-significant-line budget (298, after the edit)
---

## What it is

A new CaseVersionEditorLink component and its use in all four phases of version-manifest-screen.tsx, linking unconditionally to /cases/$slug/versions/$version, keyed to the screen's own path params.

## Notes

The build's first two attempts failed at typecheck for a reason unrelated to this delivery: this worktree's frontend/tui git submodule was never initialized (empty directory), and once initialized, its own package.json had never been npm-installed. Both were fixed as one-time environment setup (git submodule update via a local clone of the main checkout's submodule content, since the pinned commit was not reachable from the submodule's remote; then npm ci inside frontend/tui/frontend) -- not source changes, and not particular to this task; every later frontend task in this initiative benefits from the same fix. The passing build is run/draft-editor-correction-while-invalid-route-the-manifest-screen-to-the-version-editor-build-3, named on this record.
