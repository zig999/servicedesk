---
title: The version editor states a version that does not read back as a case
summary: The case version editor's own presentation of a version whose read is refused
  because validation does not hold for it at that reading, held apart from the statement
  it makes for a read that did not complete.
rationale: The decomposition cut this scope by surface rather than by root cause,
  because the version editor, the manifest builder and the hypothesis-composition
  screen each deliver a separate falsifiable outcome, each changes for its own reason,
  and each is demonstrable without the other two; the shared classification they all
  reuse already exists (errorStateKind over error-ui-state.ts's table), so the decomposition
  chose reuse in place inside each hook over extracting a new shared classifier hook,
  which would have opened an interface-and-consumers seam and forced dependency edges
  between three otherwise independent changes.
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-and-hypothesis-composition.md
objective: The case version editor opened for a version that fails a validator rule
  of validation-runs-at-every-read at that reading states explicitly that the version
  does not read back as a case and still offers the route onward to that version's
  own manifest, rather than presenting the statement it reserves for a read that did
  not complete.
criteria:
- Opening the version editor for a version whose read is refused because a validator
  rule of validation-runs-at-every-read does not hold for that version at that reading
  states explicitly that the version does not read back as a case.
- What that screen states for a version that does not read back as a case is distinguishable
  from what the same screen states for a read of that version that did not complete,
  and neither is presented in place of the other.
- The route that screen carries to that version's own manifest is offered on that
  same reading, with no read of the version having read back as a case first.
- A refusal of that screen's read of the version carrying an error code the screen
  holds no presentation of its own for still presents exactly what the screen states
  for a read that did not complete, disclosing neither the error code, nor the refusal's
  message, nor any value the refusal carries.
implements:
- rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
---

## What it is
The case version editor (frontend/app/src/routes/case-version-editor-screen.tsx with frontend/app/src/hooks/use-edit-draft-version-form.ts) folds every failure of its GET /v1/cases/:slug/versions/:version read into one generic load-error phase, so a version that fails validation at that reading is presented as a read that did not complete, behind a Retry control and with no way onward.
This task gives that screen its own statement for the version that does not read back as a case, keeps the existing generic statement for the reads it genuinely cannot name, and keeps the route to that version's manifest reachable on the same reading.

## Notes
This is a corrective increment: the survey and the decomposition did not run for the original scope of this epic, per the plan-work skill's own route for one wrong behavior in already-delivered code. This task itself is an evolution of that already-live initiative, adding a task under its existing epic once three of the epic's already-claimed nodes were found still uncovered.
The classification to reuse already exists: errorStateKind (frontend/app/src/hooks/use-edit-draft-version-form.ts:78-80) over error-ui-state.ts's UI_STATE_BY_ERROR_CODE, which already resolves CaseVersionNotValidError to kind "case-not-valid", and this hook already imports it for its own write-side branches.
The "does not read back as a case" statement is already worded verbatim on two delivered screens (frontend/app/src/routes/cases-list-screen.tsx:24-25, frontend/app/src/routes/case-detail-screen.tsx:106) and is to be reused rather than reworded.
The ["case-version", slug, version] query key is shared with use-case-simulation-version.ts, use-case-simulation-cockpit.ts, use-case-hypothesis-current-pin.ts, use-new-draft-version-form.ts and use-case-current-version-validity.ts, so what a failed read on that key means to those consumers is not to change.
A screen keyed by a slug and a named version has no "case holds no version" state to hold apart, which is why only two statements are distinguished here.
Three specification nodes this task answers to were unstated when this task was first cut and were decided during this same plan-work invocation, blind to this task's own cut: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case, rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading, and (shared with the manifest-builder and hypothesis-composition tasks of this same epic) rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions. See knowledge/decision-log.md for the disclosed reasoning behind each.
UNDERDETERMINED, from the specification — rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case states, beside the explicit statement, that the surface presents no attribute of that version and no entry of that version's manifest as the content standing at that identity. No criterion of this task reaches that clause. Passes: a version editor that, on the refused reading, states explicitly that the version does not read back as a case and renders beside it the version's title, when-to-use, subject, fallback, state and its manifest entries — recovered from an earlier successful read, from a cached payload, or from the refusal's own body.
UNDERDETERMINED, from the specification — that same rule closes with "Where every validator rule holds for that version at that reading, the surface states none of this." No criterion binds the reading where the version does read back as a case. Passes: a version editor that carries the "does not read back as a case" statement on every reading, including one whose read answered a validated case.
UNDERDETERMINED, from the specification — rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading requires the manifest route on every reading (pending, failed, released, refused alike), never only the refused one. Criterion 3 reaches only the refused reading. Passes: a version editor that offers the manifest route only on the reading refused for validation, showing no route on a pending read, a failed read, or a read answering a released version.
UNDERDETERMINED, from the specification — rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete also forbids stating, alongside the incomplete-read statement, any attribute of the case or of any version of it; criterion 4 omits that clause. Passes: a version editor that, on an unrecognised refusal, discloses no code, message or value, but leaves the version's previously rendered attributes and manifest entries standing on screen beside the statement.
ADVISORY, from the specification — no candidate gives this surface a presentation of its own for CaseNotFoundError (rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused); under criterion 4 and the fallback rule a curator opening the editor for a version number never written is told the read did not complete rather than sent to correct the identity they named. Flagged as a seam, not a divergence — criterion 4 decides it as written.
