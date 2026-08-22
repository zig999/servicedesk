---
title: Proof for the Version Editor over an existing draft
summary: Seventeen tests over CaseVersionEditorScreen, split across two files, rendered inside a self-contained test router and QueryClientProvider with a stubbed fetch, proving all eight criteria plus the loading/load-error placeholders, the absent-consolidation-register and empty-vocabulary edges, the blur-and-click double-submission guard, and the recovery path for a save failure the stated criteria do not name.
implementation: sha256:e71873b0b3367f9fee8c4e518d67a5068c742b50d04277059fd17901befcbc14
run: run/version-editor-onda-3-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
  - file: src/routes/case-version-editor-screen.spec.ts
    name: pre-populates title, when_to_use, the fixed/disabled subject, consolidation register and fallback outcome/referral from the loaded version
    proves: Visiting an existing draft version's own route pre-populates the form's title, when_to_use, subject (shown fixed/disabled), consolidation_register and fallback outcome/referral fields from GET /v1/cases/{slug}/versions/{version}.
    fails_when: any of the six pre-populated values (title, when_to_use, subject, consolidation register, fallback outcome, fallback referral action/recipient) fails to render the loaded record's own value, or the subject input is not disabled
  - file: src/routes/case-version-editor-screen.spec.ts
    name: shows the consolidation register as 'Not set' rather than an invented value when the loaded version carries none
    proves: the edge case of criterion 1's own optional consolidation_register field being absent from the loaded record, rather than a stated behavior of any one criterion
    fails_when: loading a version with no consolidation_register crashes the screen, or the select shows any label other than the "Not set" placeholder
  - file: src/routes/case-version-editor-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/outcome currently returns in the fallback outcome dropdown
    proves: The fallback outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently returns.
    fails_when: the opened outcome dropdown's option list differs from ["resolved", "pending", "rejected"] in count, text or order
  - file: src/routes/case-version-editor-screen.spec.ts
    name: renders no options in the fallback outcome dropdown when the glossary currently holds no outcome terms
    proves: the empty-collection edge case for criterion 2's own exactness -- a vocabulary answering zero terms degrades to zero options rather than a stale or invented list
    fails_when: the opened outcome dropdown shows any option when the glossary response carries none
  - file: src/routes/case-version-editor-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/action currently returns in the fallback referral action dropdown
    proves: "The fallback referral dropdown's action ... options ... offer exactly the terms GET /v1/glossary/action ... currently return."
    fails_when: the opened action dropdown's option list differs from ["escalate", "notify"] in count, text or order
  - file: src/routes/case-version-editor-screen.spec.ts
    name: offers exactly the terms GET /v1/glossary/recipient currently returns in the fallback referral recipient dropdown
    proves: "The fallback referral dropdown's ... recipient options ... offer exactly the terms ... GET /v1/glossary/recipient currently return."
    fails_when: the opened recipient dropdown's option list differs from ["supervisor", "customer"] in count, text or order
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: sends the entire form content as one PATCH request when Save is clicked, never only the changed field
    proves: >-
      Triggering Save, on blur or via the Save button, sends the form's entire current content as
      one PATCH ... request body, never a partial field. (the Save-button trigger)
    fails_when: more or fewer than one PATCH request is sent, or the request body omits any field of the loaded record besides the one edited, or carries only the changed field
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: sends the entire form content as one PATCH request when a field is blurred while dirty, never only the changed field
    proves: >-
      Triggering Save, on blur or via the Save button, sends the form's entire current content as
      one PATCH ... request body, never a partial field. (the blur trigger)
    fails_when: blurring a dirty field sends no PATCH, sends more than one, or sends a body missing any field of the loaded record
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: sends exactly one PATCH request when blur and the Save button both fire from one edit
    proves: the edge case of two operations against one subject at once -- a blur-then-click sequence from a single physical edit reaches the shared submit twice, and the implementation's own isSubmittingRef guard is what keeps it to one request
    fails_when: two PATCH requests are sent instead of one when focusout and a Save click both fire after the same edit
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: re-hydrates the form from the PATCH response and shows a 'Last saved HH:mm' indicator on a 200 response
    proves: "A 200 response to that PATCH re-hydrates the form from the response body and marks the save with a \"saved at HH:mm\" indicator."
    fails_when: the title field still shows the client-submitted value instead of the server's response value after a 200, or no text matching "Last saved HH:mm" appears
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: blocks further editing and shows the conflict banner on a 409 CaseVersionNotDraftError response to Save
    proves: A 409 CaseVersionNotDraftError response to that PATCH blocks further editing of the form and renders the conflict banner with the stated wording, offering to start a new draft.
    fails_when: the exact banner title or message text is missing, or the title field or the Save button is not disabled after the 409
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: navigates to the Cases List route when loading the version answers 404 CaseNotFoundError
    proves: >-
      A 404 CaseNotFoundError response, whether loading the version or saving it, navigates to
      the Cases List route. (the load-time case)
    fails_when: the router's location does not become "/cases" after the version load answers 404
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: navigates to the Cases List route when saving answers 404 CaseNotFoundError
    proves: >-
      A 404 CaseNotFoundError response, whether loading the version or saving it, navigates to
      the Cases List route. (the save-time case)
    fails_when: the router's location does not become "/cases" after the PATCH answers 404
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: moves clean to dirty on edit, dirty to saving while the PATCH is in flight, and saving back to clean on a 200 response
    proves: "The form's own state moves clean to dirty on any field change, dirty to saving while the PATCH request is in flight, and saving to clean on a 200 response ..."
    fails_when: the Save button is not disabled before any edit, stays disabled after an edit, is not disabled (or the field is not disabled) while the PATCH is still pending, or the field stays disabled after the 200 response resolves
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: returns the form to dirty, editable and unblocked when Save fails for a reason other than a 409 or 404
    proves: the edge case of a dependency (the PATCH call) failing in a way none of the eight stated criteria name -- the form must not be left permanently stuck in "saving" nor mistaken for the 409 conflict state
    fails_when: the Save button or the title field stays disabled after a non-409/404 failure, or the conflict banner's title text appears
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: shows a loading placeholder before the version and its glossary vocabularies arrive
    proves: the implementation's own inference that a pending load renders "Loading version {version}…" rather than an empty or broken screen (composing EDG-01)
    fails_when: the loading text is absent while the version and glossary requests are still pending, or the Title field renders before they resolve
  - file: src/routes/case-version-editor-screen-save.spec.ts
    name: shows a failure placeholder with a retry action when loading the version fails for a reason other than 404
    proves: the implementation's own inference that a non-404 load failure renders "Unable to load this version right now." with a Retry action rather than an indefinite loading state (composing EDG-02)
    fails_when: the failure text or the Retry button is absent after the version request rejects for a reason other than 404
not_applicable:
  - edge_case: a boundary at either end of a numeric range
    why: no criterion or node this task implements bounds a version number, a count, or any other numeric range; there is no range for a boundary test to sit at
  - edge_case: a duplicate where uniqueness is claimed
    why: none of this task's eight criteria or the domain nodes it implements claim uniqueness over anything this screen renders (a glossary term, a field value) for this proof to test against
untested:
  - clicking Retry after a non-404 load failure actually triggers a refetch of the version and the three glossary vocabularies -- the retry button's presence and label are proven, but the callback's own effect is not exercised
  - the transient render shown while a 404-on-load navigation is in flight (the implementation's own choice to keep showing the loading placeholder rather than the load-error placeholder during that window) -- only the eventual navigation is asserted, per the criterion's own wording, not what renders in between
  - the exact user-facing wording of a save failure that is neither 409 nor 404 (toast.error's own copy) -- untestable from this screen's own render tree in isolation, since the shared Toaster is mounted at the app shell and not part of the router this proof builds; only the form's own recovery to an editable, unblocked state is proven
  - that the four vocabulary/version GET requests and the one PATCH are the only requests this screen ever issues -- the fetch stub throws on any unregistered URL, which is the only way an unexpected extra request would surface here, rather than an explicit assertion of a closed request set
---

## What it is
Proves edit-draft-version's eight criteria over CaseVersionEditorScreen, split across two spec files (case-version-editor-screen.spec.ts for population/glossary-dropdown coverage, case-version-editor-screen-save.spec.ts for save/state-machine/error coverage) to stay under this project's own ESLint max-lines rule, sharing fixtures and mounting helpers through case-version-editor-screen.test-support.ts.

## Notes
React implements `onBlur` exclusively through the native, bubbling `focusout` event, never the native `blur` event (which does not bubble) -- confirmed by reading react-dom's own compiled event registration (`registerSimpleEvent("focusout", "onBlur")`). Testing Library's `fireEvent.blur` dispatches only `blur`, so `fireEvent.focusOut` is used everywhere a test needs to trigger the blur-driven save path.
This proof was re-run, unmodified, after task/version-editor/new-draft-creation's own delivery widened use-glossary-vocabulary.ts and use-edit-draft-version-form.ts (a fourth vocabulary, a nullable `version` parameter, an optional `seedRecord` parameter); all seventeen tests still pass, confirming that sibling delivery's own claim that this task's call site is unaffected.
