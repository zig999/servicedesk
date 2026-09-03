Three window/disclosure additions to the case-authoring frontend, none requiring a new
specification fact (all read facts the specification already states):

1. Status on the hypothesis-editing screen -- the screen at
   frontend/app/src/routes/hypothesis-revision-screen.tsx (and its underlying hook
   use-hypothesis-revision-form.ts) should show whether the hypothesis revision being edited is
   currently "Draft (editable in place)" or "Released (frozen -- next save creates a new
   revision)". The fact already exists in the domain (domain/knowledge/hypothesis-revision's own
   frozen/not-yet-frozen distinction, decided by whether any case version in released state
   manifests the revision) and is already read internally by the backend's
   readHighestRevisionReleaseState / released_referenced answer that drives the overwrite-vs-create
   decision; this task is pure disclosure of a fact the system already computes, onto a screen that
   today shows nothing about it.

2. Manifest shortcut on the hypothesis-editing screen -- a persistent, always-visible link/button
   on hypothesis-revision-screen.tsx (not conditional on having just saved, unlike the existing
   "Open Manifest Builder" success-only button) that navigates to
   /cases/$slug/versions/$version/manifest for the case version the screen was opened on, reachable
   at any point while editing, not only after a save.

3. Manifest shortcut on the case-detail screen -- frontend/app/src/routes/case-detail-screen.tsx's
   "Versions" panel (case-detail-screen.tsx, the VersionsPanel/actionsForRow function) lists each
   case version with actions "Continue editing"/"View" and "Simulate"; add a "Manifest" action per
   row, linking to /cases/$slug/versions/$version/manifest for that row's own version.
