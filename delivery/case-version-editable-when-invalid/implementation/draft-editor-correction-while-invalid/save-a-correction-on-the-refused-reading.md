---
target: frontend
title: Save a correction on the refused reading
summary: Wires the editor's not-valid phase to the shared update-draft submit path so a correction submitted
  while a draft does not read back as a case is issued and its accepted answer refills the form.
task: sha256:be2f98dd80cb59d93d90e1b3d7a511dee9a0c7e85c8fa5691dee8502eb91bb38
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-save-a-correction-on-the-refused-reading-full-2
files:
- path: src/hooks/use-edit-draft-version-form.ts
  effect: hoisted patchMutation's construction and the shared submit/onFieldBlur functions above useNotValidDraftVersionState's
    call, so both phases now share one submit path; threaded submit and onFieldBlur through as two new
    arguments to useNotValidDraftVersionState; the ready-phase return now reuses the same submit/onFieldBlur
    values instead of re-declaring them; added onSubmit? and onFieldBlur? to the not-valid union member
    of EditDraftVersionFormState
- path: src/hooks/use-not-valid-draft-version-state.ts
  effect: added onSubmit and onFieldBlur parameters, matching the ready phase's own shapes, and included
    them in the returned enriched not-valid state object
- path: src/routes/case-version-editor-not-valid-view.tsx
  effect: added onSubmit/onFieldBlur to EnrichedNotValidState's type; removed the no-op preventNativeSubmit/ignoreFieldBlur
    handlers and wired CaseVersionEditorFormFields' onSubmit/onFieldBlur to state.onSubmit and state.onFieldBlur;
    changed the Save changes button's disabled condition from a hardcoded disabled to state.isBlocked
    || state.status === "clean", mirroring the ready view's own gate
criteria:
- criterion: On the not-valid reading of a draft whose manifest holds no entry, submitting a changed title
    issues an update-draft carrying that title.
  met: true
  how: the not-valid phase's onSubmit is now the same form.handleSubmit-wrapped submit function the ready
    phase uses, calling patchMutation.mutate(values) with the form's current values (including an edited
    title) as JSON body over PATCH /v1/cases/:slug/versions/:version; reachable because Save changes is
    no longer unconditionally disabled and onSubmit is no longer a no-op
- criterion: An update-draft answered HTTP 200 on that reading leaves the form holding the title the answer
    carries.
  met: true
  how: patchMutation's existing onSuccess calls resetFormFrom(form, data), which sets title from the accepted
    answer's own record; unchanged and now invoked regardless of which phase issued the submit
- criterion: An update-draft answered HTTP 200 with no consolidation_register on that reading leaves the
    form holding no consolidation_register value.
  met: true
  how: resetFormFrom sets consolidation_register directly from record.consolidation_register, optional
    on CaseVersionRecord; where absent, the form field resets to undefined and CaseVersionEditorNotValidView's
    existing consolidationRegister == null check renders the "declares no consolidation register" text
- criterion: An update-draft answered HTTP 200 whose body carries no manifest shows no save-failure notice.
  met: true
  how: patchMutation's onSuccess path never reads or requires a manifest field; toast.error is only reached
    from onError, which an HTTP 200 answer never triggers
nodes:
- node: rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: this task takes the rule's HTTP-200/stored-record/no-manifest answer as given and encodes only
    the editor's reaction to it -- resetFormFrom on patchMutation's onSuccess reads title, when_to_use,
    subject, fallback and consolidation_register from that answer and nothing else, now reachable from
    both the ready and the not-valid phase's submit
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
  how: the rule's "accepts an update-draft over these attributes on this same reading" clause is what
    this task makes functional -- the not-valid phase's Save changes button now submits through the same
    patchMutation as the ready phase, unconditional on which validator rule is failing
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: unchanged by this task -- patchMutation's onSuccess still invalidates only ["case-versions", slug],
    never ["case-version", slug, version], so the cached read-case error driving the not-valid determination
    is undisturbed by a successful correction
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
  how: the scenario's "the curator submits an update-draft correcting the title and it is accepted" step
    is exactly the path this task wires through the not-valid phase's now-functional Save changes button,
    over a draft whose manifest holds no entry
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: update-draft's freedom to correct a version's own declared attributes as many times as curation
    needs while draft state holds is exercised through the same shared submit/patchMutation regardless
    of which reading the editor is on
preserved:
- the ready phase's onSubmit/onFieldBlur behavior and its exact wiring to CaseVersionEditorFormFields,
  unchanged in effect after being factored out of the phase-specific block
- patchMutation's onSuccess and onError, unchanged
- use-not-valid-draft-version-state's existing phase transitions (loading/load-error/not-valid) driven
  by versionsQuery and declaredAttributesQuery
- CaseVersionEditorFormFields' existing onSubmit/onFieldBlur prop contract and its isReadOnly-guarded
  form wiring
---

## What it is

The editor's not-valid phase now shares the same submit path (patchMutation) the ready phase uses, so a correction submitted while a draft does not read back as a case is issued as an update-draft and its accepted answer refills the form.

## Notes

None.
