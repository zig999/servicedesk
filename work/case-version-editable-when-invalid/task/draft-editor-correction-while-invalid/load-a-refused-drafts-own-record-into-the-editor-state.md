---
title: Load a refused draft's own record into the editor state
summary: The editor's form hook answers an editable state filled from
  read-case-version when read-case refuses the named version as not valid.
rationale: The scope states the mechanism, which is to fall back to
  read-case-version on a case-not-valid refusal. This task is cut apart from
  rendering because the hook's state union is the interface the screen and the
  ready view consume, and changing it together with those consumers would cross
  one seam. The released-version prohibition and the release-disclosure
  condition are placed here because the hook decides which controls are
  available.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
objective: On a reading where read-case refuses a draft version with
  CaseVersionNotValidError, the editor's state carries an editable form holding
  that draft's own stored declared attributes.
criteria:
  - Where read-case refuses the named version with CaseVersionNotValidError,
    the editor reads that version through read-case-version.
  - Where read-case refuses a draft with CaseVersionNotValidError, the
    editor's state carries an editable form.
  - On that reading, the form's title is the title read-case-version
    answered.
  - On that reading, the form's when_to_use is the when_to_use
    read-case-version answered.
  - On that reading, the form's subject is the subject read-case-version
    answered.
  - On that reading, the form's fallback outcome is the fallback outcome
    read-case-version answered.
  - On that reading, the form's fallback referral is the fallback referral
    read-case-version answered.
  - Where read-case-version answers a consolidation_register on that reading,
    the form's consolidation_register is that value.
  - Where read-case-version answers no consolidation_register on that
    reading, the form holds no consolidation_register value.
  - Where another version of the same case carries a different title, the
    form's title on that reading is the named version's own.
  - On that reading, the editor's state marks the version as not reading back
    as a case.
  - On a reading where read-case answers the version, the editor's state
    carries no such mark.
  - While read-case-version has not answered on that reading, the editor's
    state is the loading state.
  - Where read-case-version does not answer the version's record on that
    reading, the editor's state is the load-error state.
  - Where read-case refuses a released version with CaseVersionNotValidError,
    the editor's state carries none of that version's declared attributes.
  - On that reading of a draft whose form is unchanged, the editor's state
    is not blocked.
  - On that reading of a draft, cancelling issues no update-draft.
  - On that reading of a draft, cancelling returns the curator to the
    previous history entry.
  - Where the editor's state on that reading offers release, it states the
    manifest-pin release condition as not yet decided.
depends_on:
  - task/draft-correction-while-invalid/serve-a-drafts-own-declared-attributes-over-http
implements:
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  - rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  - rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  - rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  - rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  - rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  - rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  - rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  - contracts/knowledge/case-query
  - domain/knowledge/case-version
  - constraints/a-successful-case-version-own-record-read-answers-with-http-200
---

## What it is

This is the change to use-edit-draft-version-form.ts that replaces the dead-end not-valid phase with an editable state filled from the draft's own record.

## Notes

read-case-version's answer carries no state, so how the hook tells a draft from a released version on this reading is left to implementation.
The inventory flags that read-case and read-case-version answer different shapes into one hook. Whether one query or two feed the form is left to implementation.
manifestPinReleaseCondition over the empty manifest a read-case-version answer implies could report the condition as met, which is why the release criterion exists.
UNDERDETERMINED, from the specification — nothing in the criteria requires that the loaded form can be submitted on this reading; a hook that fills the form but disables submission while the not-reading-back mark stands would still pass. Passes despite: a hook that fills the form from read-case-version on the refused reading and marks the version as not reading back as a case, but disables or leaves out submission while the mark stands.
UNDERDETERMINED, from the specification — no criterion says whether the loading and load-error states carry the not-reading-back mark once read-case has already refused with CaseVersionNotValidError. Passes despite: a hook whose loading and load-error states carry no mark, so the mark appears only once the form has loaded.
UNDERDETERMINED, from the specification — the criterion on cancelling naming "the previous history entry" is a navigation mechanism, not always the surface the editing was reached from, which is what an-abandoned-case-version-edit-writes-nothing actually requires. Passes despite: a cancel that goes back one history entry when the editor was opened by a direct URL, a new tab, or a redirect, where the previous entry is not the surface the editing was reached from.
UNDERDETERMINED, from the specification — the load-error state criterion does not stop it from carrying the refusal's error code or message, which a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete forbids disclosing. Passes despite: a load-error state that carries the refusal's error code or message from read-case-version for the surface to display.
UNDERDETERMINED, from the specification — the loading-state criterion does not say that state offers none of release, discard or update-draft, which a-newly-created-draft-offers-no-act-before-its-own-record-arrives withholds while no answer has arrived. Passes despite: a hook whose loading state on the refused reading still exposes the release or discard offer, with the manifest-pin condition stated as not yet decided.
REMAINDER, from the specification — the editing-surface rule's clause requiring an explicit statement when v's consolidation_register is absent reaches no criterion here; this task stops at the form holding no value. Belongs to: the task that renders the editor's form fields from the hook's state.
REMAINDER, from the specification — a-case-version-failing-validation-at-a-read-is-refused-by-name's own wire-answer clauses (HTTP 409, the message naming slug/version/failing rules) are not this task's. Belongs to: the backend read-case refusal.
REMAINDER, from the specification — a-surface-offering-release-states-which-release-conditions-the-draft-meets's met/unmet disclosure for a surface that has read what deciding the condition needs is not covered; this task only covers the refused reading, where the editor reads no manifest. Belongs to: the release-offering surface's disclosure on readings where the draft's manifest and pinned revisions have been read.
REMAINDER, from the specification — a-newly-created-draft-offers-no-act-before-its-own-record-arrives also keeps every route owed from a case's surfaces available during the interval before the record arrives; no criterion here addresses routes. Belongs to: the task rendering the editor's leaving control and routes during its loading state.
REMAINDER, from the specification — a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading governs the version's own presenting surface, not the editor's form state. Belongs to: the version-keyed presentation surface's route to its editing surface.
REMAINDER, from the specification — a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading owes a manifest route on version-keyed surfaces, which is rendering, not the form hook's state. Belongs to: the task rendering routes on version-keyed surfaces, the editor included, on every reading.
ADVISORY, from the specification — the criterion "not blocked" uses a term no candidate defines; it may mean an unsaved-changes navigation guard (backed by an-abandoned-case-version-edit-writes-nothing) or that editing is closed off (backed by the editing-surface rule); the executor has to pick a reading.
