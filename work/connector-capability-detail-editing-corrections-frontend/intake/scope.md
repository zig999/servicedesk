# Scope — connector-capability-detail-editing-corrections-frontend

Corrective work over code already delivered by the closed initiative
connector-capability-detail-editing (both work/delivery roots -backend and
-frontend, now history), based on findings recorded by /review-change and
reanalysed in temp/2026-08-25-connector-capability-detail-editing-review-findings.md.
This frontend increment covers two corrective facts.

## 1. F1+F2 — configurationValid accepts any syntactically valid JSON, not just a JSON object

File: src/hooks/use-connector-configuration-detail.ts (the load effect's
configurationValid derivation, around lines 168-172), currently:

    setConfigurationValid(getJsonTextareaMinifiedValue(query.data.configuration) !== null)

getJsonTextareaMinifiedValue (json-textarea-field.tsx's own parseJsonText)
only checks that JSON.parse does not throw. A syntactically valid JSON value
that is not an object (an array, a bare string, a number, true, null) reads
configurationValid: true here, which gates both the invalid-JSON warning in
connector-configuration-detail-ready-view.tsx and the Save-disable in
connector-configuration-form-fields.tsx — so an operator can leave a
non-object value with no warning shown and Save enabled, submit it, and have
the registry refuse it for a reason this screen never told them about.

This is a specification-conformance bug against an already-stated rule:
rules/integration/a-connector-configuration-holds-a-well-formed-object.md
already requires the configuration to be a well-formed JSON object, not
merely valid JSON.

Correction: derive configurationValid from a check that also rejects a
syntactically valid non-object JSON value (e.g.
typeof parsed === "object" && parsed !== null && !Array.isArray(parsed), on
top of the existing parse check).

The warning banner in connector-configuration-detail-ready-view.tsx (lines
~24-37, INVALID_CONFIGURATION_WARNING, gated on !state.configuration.isValid)
already cites this same rule in its own header comment but under-covers it
for the same underlying reason; fixing the configurationValid derivation
resolves the banner's under-coverage too, with no separate code change
needed there beyond this one fix.

No new specification node needed — the governing rule already exists and
already states the object requirement; this is purely a conformance bug fix.

## 2. F3+F4 — no confirmation before a destructive "Discard changes" action, on both detail screens

Files: src/routes/capability-detail-ready-view.tsx (lines ~83-90) and
src/routes/connector-configuration-detail-ready-view.tsx (lines ~74-81) — in
both, the "Discard changes" button's onClick runs state.onDiscard directly,
resetting all unsaved form edits in one click, in the same button row as the
form's own Save action, with nothing to catch a slightly-off click between
the two.

This was a deliberate, tested design choice in the original delivery (no
confirmation step), flagged by the standard's EDG-04 rule (a
destructive/irreversible UI control must have a confirmation step). The team
has now decided (see
temp/2026-08-25-connector-capability-detail-editing-review-findings.md's
decision-gathering) to require a confirmation step before Discard on both
screens, using the application's existing design-system modal/dialog
component (not a native window.confirm), with two explicit buttons: one to
discard the changes, one to continue editing.

This "Discard changes" action is purely client-side UI state (it resets
react-hook-form and JSON-schema-field state to the last loaded-or-saved
values) and calls no domain/registry operation — Save is what calls
register-capability / the connector-configuration registry's register
operation, unaffected by this change.

Correction: insert the confirmation modal between the click and the call to
state.onDiscard, on both screens, reusing the same confirmation-dialog shape
for both since they share the exact same control.

## Notes

Target source root note: frontend/app is the target; paths above
(src/routes/..., src/hooks/...) are relative to it.
Standard: standards/frontend-typescript.yaml.

Full original review record for cross-reference:
delivery/connector-capability-detail-editing-frontend/review/connector-capability-detail-editing-frontend.md
and temp/2026-08-25-connector-capability-detail-editing-review-findings.md
(findings F1, F2, F3, F4 — F1/F2 already governed by an existing
specification rule; F3/F4 were analysed separately from a business-decision
standpoint and confirmed to need no new specification node, since the
confirmation step is purely client-side UI interaction over an existing,
already-specified capability, touching no domain fact).
