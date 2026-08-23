# Onda 7 — Case attribute management surface

Adapt the Case Version Editor / Case Detail frontend so a curator can properly manage a case's
own attributes end to end, closing the gap where a released version's fallback,
consolidation_register and other attributes are unreachable in the UI. Three capabilities,
building on what the app already ships (CaseVersionEditorFormFields, CaseVersionEditorReadyView,
useEditDraftVersionForm, useNewDraftVersionForm, case-detail-screen.tsx):

## 1. View a released case version read-only

Case Detail's Versions tab currently renders no action for a released row
(case-detail-screen.tsx's `toRow`, actions cell empty for `state !== "draft"`). Add a "View"
action navigating to the existing version route; the Version Editor screen, on loading a version
whose state is "released", renders the same field set as CaseVersionEditorFormFields /
CaseVersionEditorReadyView but with every control disabled and no Save/Release/Discard rendered,
plus the manifest listed in precedence order (position, hypothesis name, revision, criterion) —
reusing GET /v1/cases/:slug/versions/:version (read-case), which already returns the whole
assembled version including manifest.

## 2. Seed a new draft from the case's latest released version

New Draft (new-case-draft-screen.tsx / use-new-draft-version-form.ts) currently starts from a
fully blank form and POSTs without consolidation_register or source_version, even though the
createDraft store operation and its DTO already accept both and the store already copies the
named source version's manifest (or the latest released, naming none) into the new draft's own
manifest server-side. Change the New Draft flow to read the case's latest released version (via
the existing list-case-versions + read-case reads this app already has hooks for), pre-populate
the blank form's title, when_to_use, subject, fallback and consolidation_register from it, and
pass consolidation_register plus source_version explicitly in the POST body — attribute copying
on top of the manifest the store already copies. Where the case holds no released version yet
(its first draft ever), the form stays blank exactly as today, with copy communicating that this
is the case's first version.

## 3. Case attributes at a glance on Case Detail

Add a third view on Case Detail (either a tab alongside "Versions"/"Hypotheses" or a section
above them) surfacing the current version's own declared attributes — title, when_to_use,
subject, fallback (outcome/action/recipient), consolidation_register — read from whichever
version is "current" (the case's one draft if it has one, otherwise its latest released
version — per rules/knowledge/a-case-summary-is-derived-from-its-existing-versions, the
highest-numbered version a case holds is always the most recently authored one, whichever state
it stands in). A single state-sensitive action: "Continue editing" to the draft if one exists,
"View released vX" if not editing, or "New draft from vX" if the case holds a released version
but no draft. Where the current version's own read (read-case) itself refuses — e.g. a draft
whose manifest currently holds no hypothesis, which read-case's own whole-version validation
rejects — render that refusal as an explicit state ("this draft cannot be read yet — its manifest
holds no hypothesis") rather than treating it as a load error, and offer the same edit link.

## Explicitly open for this plan's own blind judge

Whether a case's subject type may be changed once a draft already exists — the frontend today
disables that field even though updateDraft's own schema accepts a changed subject, and the
specification is not known to state either way either way. Decide it as an unstated fact through
the normal silence-closing route rather than left to this scope's own wording, and disclose it in
the decision log.

## Explicitly not in scope

No backend or specification change is expected: every read/write path above (read-case,
list-case-versions, createDraft with source_version/consolidation_register, updateDraft) already
exists and is already validated against the specification; this is capability surface already
held by the specification (case-version's own already-declared attributes and lifecycle), not a
new domain fact.

## Known trace condition

`bin/trace.py --check frontend/app` currently reports 5 files with unreconciled code drift, three
of which this scope's tasks will touch directly (case-detail-screen.tsx,
case-version-editor-form-fields.tsx, case-version-editor-ready-view.tsx) — a human's own
`/reconcile` pass over those files is expected before or independently of this plan's own
delivery, and does not block this plan-work invocation itself.
