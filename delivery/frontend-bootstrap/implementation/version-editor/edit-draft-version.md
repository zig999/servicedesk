---
title: Version Editor over an existing draft — edit-draft-version
summary: Replaces the Case Version route's placeholder with a full-replace PATCH form over an existing draft's title, when_to_use, fixed subject, consolidation_register and glossary-backed fallback outcome/referral, driven by a clean/dirty/saving/conflict save state machine.
task: sha256:2992f98199db618665a1f64d61853c75abb419d5627e373abea43f73dad0af22
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-onda-3-full-suite
files:
  - path: src/services/case-version-form-schema.ts
    effect: >-
      New file. Declares the client-side zod schema (caseVersionFormSchema) mirroring the
      backend's updateDraftBodySchema field-for-field, the CONSOLIDATION_REGISTERS vocabulary, and
      the CaseVersionFormValues type the form and its PATCH body both share.
  - path: src/hooks/use-glossary-vocabulary.ts
    effect: >-
      New file. Reads one glossary term vocabulary (GET /v1/glossary/{vocabulary}) and maps its
      current page of terms to TUI Select options, one place for this mapping.
  - path: src/hooks/use-edit-draft-version-form.ts
    effect: >-
      New file. Loads an existing draft version and the three glossary vocabularies it needs,
      runs the clean/dirty/saving/conflict save state machine, and dispatches the full-replace
      PATCH on Save, handling its 200/409 CaseVersionNotDraftError/404 CaseNotFoundError
      responses (the last also for the initial load).
  - path: src/routes/case-version-editor-form-fields.tsx
    effect: >-
      New file. Renders the field set (title, when_to_use, fixed/disabled subject,
      consolidation_register, fallback outcome, fallback referral action+recipient) wired to the
      hook's form and save state, each field's label wrapping its own control.
  - path: src/routes/case-version-editor-screen.tsx
    effect: >-
      New file. The routed screen composing the hook's loading/load-error/ready states, the field
      markup, and the conflict banner; replaces CaseVersionPlaceholder as the
      "/cases/$slug/versions/$version" route's own component.
  - path: src/routes/route-tree.tsx
    effect: >-
      The "/cases/$slug/versions/$version" route's component now points to
      CaseVersionEditorScreen instead of CaseVersionPlaceholder; no path or wiring change.
  - path: src/routes/route-placeholders.tsx
    effect: >-
      Documents, via a comment, why CaseVersionPlaceholder still sits here unused rather than
      being deleted (matching CasesListPlaceholder/CaseDetailPlaceholder's own precedent above
      it) — no functional change to the file's exports.
  - path: package.json
    effect: adds react-hook-form, zod and @hookform/resolvers to dependencies — the first task in this app to import any of the three.
criteria:
  - criterion: Visiting an existing draft version's own route pre-populates the form's title, when_to_use, subject (shown fixed/disabled), consolidation_register and fallback outcome/referral fields from GET /v1/cases/{slug}/versions/{version}.
    met: true
    how: >-
      useEditDraftVersionForm's versionQuery reads GET /v1/cases/{slug}/versions/{version}; an
      effect calls form.reset() with its title/when_to_use/subject/fallback/consolidation_register
      the moment the query resolves. case-version-editor-form-fields.tsx renders subject through a
      disabled Input.
  - criterion: The fallback outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently returns.
    met: true
    how: >-
      useGlossaryVocabularyOptions("outcome") reads GET /v1/glossary/outcome and maps its
      response's `data` array 1:1 to Select options (value=label=term.name), with no filtering or
      reordering; the fallback-outcome Controller renders exactly that list.
  - criterion: The fallback referral dropdown's action and recipient options each offer exactly the terms GET /v1/glossary/action and GET /v1/glossary/recipient currently return.
    met: true
    how: >-
      the same useGlossaryVocabularyOptions hook, called once for "action" and once for
      "recipient", feeds the two fallback.referral.action/recipient Controller-driven Selects.
  - criterion: Triggering Save, on blur or via the Save button, sends the form's entire current content as one PATCH /v1/cases/{slug}/versions/{version} request body, never a partial field.
    met: true
    how: >-
      a single shared `submit` (form.handleSubmit) is called both by the form's own onSubmit (the
      Save button's native submit) and by the form-level onBlur (bubbling from any field) when
      status is "dirty"; it PATCHes the full validated `values` object as one JSON body, guarded
      by isSubmittingRef against the double-invocation a blur-then-click can otherwise cause.
  - criterion: >-
      A 200 response to that PATCH re-hydrates the form from the response body and marks the save
      with a "saved at HH:mm" indicator.
    met: true
    how: >-
      the mutation's onSuccess calls resetFormFrom(form, data) with the PATCH response body and
      setSavedAt(formatSavedAt(new Date())), rendered as "Last saved HH:mm" beside the Save
      button.
  - criterion: A 409 CaseVersionNotDraftError response to that PATCH blocks further editing of the form and renders the conflict banner with the stated wording, offering to start a new draft.
    met: true
    how: >-
      the mutation's onError resolves the error through the shared error-ui-state table; a
      "case-version-not-draft" kind sets status to "conflict", which
      case-version-editor-form-fields.tsx reads as isBlocked (every field and the Save button
      disabled) and case-version-editor-screen.tsx renders as ConflictBanner with the wireframe's
      own title/message text, sourced from this task's own `sources` per its Notes.
  - criterion: A 404 CaseNotFoundError response, whether loading the version or saving it, navigates to the Cases List route.
    met: true
    how: >-
      both the version-load query's own error and the PATCH mutation's own error are resolved
      through the same error-ui-state table; a "case-not-found" kind calls
      navigate({ to: "/cases" }) in either case.
  - criterion: The form's own state moves clean to dirty on any field change, dirty to saving while the PATCH request is in flight, and saving to clean on a 200 response or saving to conflict on a 409 CaseVersionNotDraftError response.
    met: true
    how: >-
      a `status` state variable ("clean"|"dirty"|"saving"|"conflict") is moved clean->dirty by a
      form.watch subscription filtered to type==="change" (excluding the notifications
      form.reset() itself emits), dirty->saving inside the guarded submit callback right before
      patchMutation.mutate(), saving->clean in onSuccess and saving->conflict in onError for
      CaseVersionNotDraftError.
nodes:
  - node: domain/knowledge/case-version
    encoded_at:
      - src/services/case-version-form-schema.ts
      - src/hooks/use-edit-draft-version-form.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: >-
      the form's own field set and the PATCH/GET body types mirror exactly the subset of this
      aggregate's declared attributes an update-draft correction touches (title, when_to_use,
      subject, fallback, consolidation_register), addressed by the version's own slug+version
      identity in the URL; authored_at, released_at, state and manifest are never read or written
      here, matching the backend's own updateDraftBodySchema scope.
  - node: domain/knowledge/case-version-state
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
    how: >-
      the form never displays or edits state directly; the node's own draft/released distinction
      reaches this code only as the 409 CaseVersionNotDraftError branch, which is exactly "this
      version is no longer draft" surfacing at the one place this task touches it.
  - node: domain/knowledge/consolidation-register
    encoded_at:
      - src/services/case-version-form-schema.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: >-
      CONSOLIDATION_REGISTERS states the node's own two-value closed vocabulary (formal, plain);
      the schema marks the field optional per the node's own "absent, the consolidation step
      keeps whatever register its own adapter defaults to", and the form leaves it unset (Select
      placeholder) when the loaded version carries none.
  - node: domain/knowledge/resolution
    encoded_at:
      - src/services/case-version-form-schema.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: >-
      fallback is modeled as one required {outcome, referral} pair in both the schema and the two
      grouped fallback fields in the form, matching the node's own "pair one outcome with one
      referral so no position can declare one without the other".
  - node: domain/knowledge/referral
    encoded_at:
      - src/services/case-version-form-schema.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: >-
      fallback.referral is modeled as one required {action, recipient} pair, both glossary-backed
      dropdowns, matching the node's own two attributes exactly.
  - node: domain/glossary/outcome
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: >-
      the fallback-outcome dropdown's options are read exclusively from GET /v1/glossary/outcome's
      own current terms, so a submission can only ever name an outcome the glossary currently
      holds.
  - node: domain/glossary/action
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: same treatment as outcome, over GET /v1/glossary/action, for fallback.referral.action.
  - node: domain/glossary/recipient
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: same treatment as outcome, over GET /v1/glossary/recipient, for fallback.referral.recipient.
  - node: contracts/knowledge/case-lifecycle
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
    how: >-
      this task reaches exactly the contract's update-draft operation, dispatched as the
      full-replace PATCH on Save; create-draft, revise-hypothesis, place-hypothesis,
      remove-hypothesis, release and discard are not reached by this task.
  - node: contracts/knowledge/case-query
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
    how: >-
      this task reaches exactly the contract's read-case operation, through GET
      /v1/cases/{slug}/versions/{version}, to pre-populate the form; list-cases,
      list-case-versions, list-hypotheses and list-hypothesis-revisions are not reached by this
      task.
  - node: contracts/glossary/glossary-query
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
    how: >-
      this task reaches exactly the contract's list-vocabulary-terms operation, called three
      times (outcome, action, recipient); read-vocabulary-term, read-concept and list-concepts are
      not reached by this task.
  - node: rules/knowledge/a-case-version-is-written-once
    encoded_at:
      - src/hooks/use-edit-draft-version-form.ts
    how: >-
      the invariant is honored rather than enforced client-side (nothing here could enforce it): a
      409 CaseVersionNotDraftError response is the backend's own answer that this exact rule
      refused the write, and this task's whole conflict flow (blocked form, conflict banner,
      "start a new draft" offer) is what the UI does in response to that refusal, matching the
      rule's own "revising a case's content composes the next draft version instead".
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    encoded_at:
      - src/hooks/use-glossary-vocabulary.ts
      - src/routes/case-version-editor-form-fields.tsx
    how: >-
      honored for the outcome/action/recipient clauses only — the three fallback dropdowns are
      populated exclusively from the glossary's own current terms, so this form can never submit
      a name absent from it. Per this task's own Notes, the subject-type clause is not reached
      (subject is shown fixed/disabled, never selected or validated here) and the concept clause
      is not reached either (no manifest or hypothesis-revision authoring happens in this task);
      both are left to other, already-cut tasks.
inferences:
  - inferred: >-
      a PATCH failure other than 409 CaseVersionNotDraftError or 404 CaseNotFoundError shows a
      plain toast ("Something went wrong while saving. Try again.") and returns the machine to
      "dirty" rather than "clean".
    from: >-
      the inventory's own risk that query-client.ts wires no MutationCache-level onError, so a
      mutation failure has no handler unless one is written at this call site; the wording mirrors
      query-client.ts's own generic, non-domain fallback message rather than inventing a new one,
      and reverting to "dirty" (not "clean") follows directly from the state machine's own
      criterion 8, which never names a third saving-> outcome.
  - inferred: >-
      a successful PATCH fires useTelemetry's caseDraftUpdated({slug, version}), and a 409
      CaseVersionNotDraftError fires uiStaleConflictDetected({slug, version, action: "update-draft"}).
    from: >-
      the task's own "What it is" naming the telemetry hook "already delivered" as reused here,
      and use-telemetry.ts's own event descriptions ("a draft's own attributes ... changed" / "an
      attempted action met data staler than what the UI held") matching this task's own success
      and conflict cases one to one; intake/onda-3-scope.md also names ui.stale_conflict_detected
      as "the event this wave's 409 race is expected to fire".
  - inferred: >-
      404/409 classification is read through error-ui-state.ts's uiStateForApiError() ("case-not-
      found" / "case-version-not-draft" kinds) rather than by comparing ApiError.code strings
      directly at the call site.
    from: >-
      this task's own "What it is" naming the "error-to-UI-state mapping already delivered in
      Onda 1" as reused, and the standard's own API-02 ("every distinct failure response ... maps
      to a user-facing state through one named mapping; a handler does not choose ... inline at
      the call site").
  - inferred: a successful PATCH also invalidates the ["case-versions", slug] query key.
    from: >-
      STA-01 ("data read from the API is read directly from the server-state layer's cache; it is
      never copied into a separate UI store") — case-detail-screen.tsx's own version-timeline list
      reads that same key, and a save changing this version's own content should not leave that
      cache stale.
  - inferred: >-
      every field's Label wraps its own control (rather than a matching htmlFor/id pair) and its
      own text-transform/letter-spacing/font-weight/color are reset for the wrapped control.
    from: >-
      reading TUI's own Select implementation directly (select.tsx/select.types.ts) — it spreads a
      caller's props only onto its outer wrapping div, never its inner `role="combobox"` button,
      so an id or aria-* prop placed on Select never reaches the element a screen reader actually
      announces; native label-wrapping reaches it regardless, because any labelable descendant
      (Select's own button) is a valid target.
  - inferred: CaseVersionPlaceholder is left in route-placeholders.tsx, unused, rather than deleted.
    from: >-
      this exact file's own established precedent — CasesListPlaceholder and
      CaseDetailPlaceholder were left the same way when Onda 2 replaced their own routes with real
      screens.
  - inferred: >-
      "saved at HH:mm" is the browser's local time, 24-hour, zero-padded, computed at the moment
      the 200 response is handled.
    from: >-
      intake/onda-3-scope.md's own trigger text ("marca 'saved at HH:mm'") states the format
      literally; no node or material states a timezone, and no server-supplied timestamp exists
      in the PATCH response to read one from instead.
  - inferred: the load-error phase offers a Retry action (calling refetch on the version query and the three glossary queries).
    from: >-
      the standard's own EDG-02 ("a view that fails to load degrades to a typed error state
      offering a retry, rather than an indefinite loading state or a blank screen"); no criterion
      of this task names this button, but nothing states a retry should be withheld either.
preserved:
  - route-tree.tsx's other nine routes and their components, unaffected by this task's own single-route swap.
  - >-
    case-detail-screen.tsx's "Continue editing" Link, which already navigates into
    "/cases/$slug/versions/$version" and depends on that route rendering something real.
  - "ConflictBanner's existing {title, message} prop contract (shared/components/conflict-banner.tsx) — reused exactly as delivered, not modified."
  - error-ui-state.ts's existing UI_STATE_BY_ERROR_CODE table — reused exactly as delivered, not modified.
  - query-client.ts's shared QueryClient and its query-level cache/toast behavior, which now also covers this task's own four GET queries.
  - use-telemetry.ts's existing eight-callable contract — reused exactly as delivered, not modified.
deferred:
  - what: >-
      "[ Release… ]" and "[ Discard draft ]", both visible in the proposal's own wireframe for
      this screen.
    why: intake/onda-3-scope.md states plainly these are Onda 5's own scope, exactly as the original plan already isolates them.
  - what: the "manifest holds N hypotheses [open →]" navigation link, also visible in the wireframe.
    why: intake/onda-3-scope.md states this is Onda 4's own scope (Manifest Builder), a link only, never editable content here.
  - what: originating a new draft (a blank form whose first Save issues POST /v1/cases) and the 409 CaseAlreadyHasDraftError race that origination can hit.
    why: >-
      this is task/version-editor/new-draft-creation's own objective, an already-cut sibling task
      that depends on this one for the shared field form; widening this task to cover it reaches
      past its own objective, which names editing an existing draft only.
  - what: subject-type selection/validation against the glossary, and hypothesis-revision/manifest concept validation.
    why: >-
      this task's own Notes state both clauses of rules/knowledge/case-terms-exist-in-the-glossary
      belong to other, already-cut tasks (new-draft-creation for subject-type;
      revise-hypothesis/place-hypothesis/remove-hypothesis for concept) — this task shows subject
      fixed/disabled and never touches the manifest.
installed:
  - react-hook-form
  - zod
  - "@hookform/resolvers"
---

## What it is
The section 2.3 Version Editor the task's scope describes, over the real PATCH/GET endpoints and the real glossary vocabularies the inventory confirmed. The first task in this epic issuing a real GET and the first PATCH this app performs at all.

## Notes
This implementation was later widened by its own sibling task, task/version-editor/new-draft-creation: use-glossary-vocabulary.ts gained a fourth vocabulary ("subject-type"), and use-edit-draft-version-form.ts gained a nullable `version` parameter and an optional `seedRecord` parameter so the same hook could be reused unmodified for the origination flow. Neither widening altered this task's own behavior at its own call site (case-version-editor-screen.tsx always passes a real version number and no seedRecord), confirmed by re-running this task's own 17-test proof after the sibling's delivery — all still pass. See delivery/frontend-bootstrap/implementation/version-editor/new-draft-creation.md for that delivery's own record.
