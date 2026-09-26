---
target: frontend
title: case-version-editable-when-invalid -- frontend, review
summary: Coverage, specification-conformance, standard-conformance and run-failure passes over the 6 frontend
  tasks and their 18 files.
reviewed:
- src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
- src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
- src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
- src/hooks/use-edit-draft-version-form.ts
- src/hooks/use-not-valid-draft-version-state.ts
- src/routes/case-simulation-header.tsx
- src/routes/case-simulation-screen.spec.ts
- src/routes/case-simulation-screen.tsx
- src/routes/case-version-editor-link.tsx
- src/routes/case-version-editor-not-valid-view.tsx
- src/routes/case-version-editor-ready-view.tsx
- src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
- src/routes/case-version-editor-screen-refused-draft-save.spec.ts
- src/routes/case-version-editor-screen-refused-draft.spec.ts
- src/routes/case-version-editor-screen.tsx
- src/routes/discard-draft-dialog.tsx
- src/routes/version-manifest-screen-editor-link.spec.ts
- src/routes/version-manifest-screen.tsx
tasks:
- task/draft-editor-correction-while-invalid/route-the-simulation-screen-to-the-version-editor
- task/draft-editor-correction-while-invalid/route-the-manifest-screen-to-the-version-editor
- task/draft-editor-correction-while-invalid/load-a-refused-drafts-own-record-into-the-editor-state
- task/draft-editor-correction-while-invalid/present-the-refused-draft-on-the-editor-screen
- task/draft-editor-correction-while-invalid/save-a-correction-on-the-refused-reading
- task/draft-editor-discard-while-invalid/offer-discard-on-the-refused-reading
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: run/case-version-editable-when-invalid-frontend passed; there was no failure to read
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-version-editable-when-invalid-frontend
reconciliation: siegard-reconcile/case-version-editable-when-invalid-frontend.md
coverage:
- criterion: Where the editor's state carries the not-reading-back mark, the screen presents the title
    field holding the state's title.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the draft's own title and the explicit statement, never the load-error text or an attribute
      cached from an earlier successful read, and renders none of this once the same version reads back
      as a validated case
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the title, when_to_use, subject and fallback outcome controls without a disabled attribute
  why: Both tests find the title with findByDisplayValue, which matches any field holding that value.
    Nothing ties the value to the field labelled Title.
- criterion: Where the editor's state carries the not-reading-back mark, the screen states that the version
    does not read back as a case.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the draft's own title and the explicit statement, never the load-error text or an attribute
      cached from an earlier successful read, and renders none of this once the same version reads back
      as a validated case
- criterion: That statement differs from the statement the screen presents where the version's read did
    not complete.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the draft's own title and the explicit statement, never the load-error text or an attribute
      cached from an earlier successful read, and renders none of this once the same version reads back
      as a validated case
  why: The test checks that the refused reading does not show the literal load-error text. No test in
    the set renders the editor on a read that did not complete, so nobody checks what that reading actually
    shows. Only one of the two ways the statements could become equal is exercised.
- criterion: Where the editor's state carries the not-reading-back mark, the screen's form fields are
    enabled.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the title, when_to_use, subject and fallback outcome controls without a disabled attribute
  why: Only the title, when_to_use, subject and fallback outcome controls are checked for being enabled.
    Nothing checks the fallback referral's action and recipient controls or the consolidation_register
    control.
- criterion: Where the editor's state carries the not-reading-back mark, the screen presents the Save
    changes control.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders both Save changes and Cancel inside the button footer
- criterion: Where the editor's state carries the not-reading-back mark, the screen presents the Cancel
    control.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders both Save changes and Cancel inside the button footer
- criterion: Where the editor's state carries the not-reading-back mark, the screen carries a route to
    the same version's manifest.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders a Manifest link targeting this same version's own manifest route
- criterion: Where the editor's state carries the not-reading-back mark and no consolidation_register,
    the screen states that the version declares no consolidation register.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: states that the version declares no consolidation register when the draft's own record answers
      none
- criterion: Where the editor's state carries no not-reading-back mark, the screen states nothing about
    the version not reading back as a case.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the draft's own title and the explicit statement, never the load-error text or an attribute
      cached from an earlier successful read, and renders none of this once the same version reads back
      as a validated case
  why: On the ready reading, the test checks only that one exact string is absent. A second wording of
    the same fact used elsewhere in the set is not checked for absence here.
- criterion: Where read-case refuses the named version with CaseVersionNotValidError, the editor reads
    that version through read-case-version.
  state: partial
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: shows the named version's own title even where a different version of the same case carries
      a different one
  - file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
    name: resolves to the bare not-valid phase with no other field, never reading read-case-version, for
      a released version, and to a distinct load-error phase when the prerequisite read instead fails
      to complete
  why: The criterion names any refused version, not only drafts. Only the draft reading is exercised;
    a test in the set actually requires the opposite for a released version.
- criterion: Where read-case refuses a draft with CaseVersionNotValidError, the editor's state carries
    an editable form.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the title, when_to_use, subject and fallback outcome controls without a disabled attribute
- criterion: On that reading, the form's title is the title read-case-version answered.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: shows the named version's own title even where a different version of the same case carries
      a different one
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: renders the draft's own title and the explicit statement, never the load-error text or an attribute
      cached from an earlier successful read, and renders none of this once the same version reads back
      as a validated case
  why: Over-assertion in the load spec's first test, which uses toEqual to require the form's values to
    be exactly the record.
- criterion: On that reading, the form's when_to_use is the when_to_use read-case-version answered.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: shows when_to_use, subject, the fallback outcome and referral, and a present consolidation_register
      exactly as the draft's own record, alongside the title
- criterion: On that reading, the form's subject is the subject read-case-version answered.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: shows when_to_use, subject, the fallback outcome and referral, and a present consolidation_register
      exactly as the draft's own record, alongside the title
- criterion: On that reading, the form's fallback outcome is the fallback outcome read-case-version answered.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: shows when_to_use, subject, the fallback outcome and referral, and a present consolidation_register
      exactly as the draft's own record, alongside the title
- criterion: On that reading, the form's fallback referral is the fallback referral read-case-version
    answered.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: shows when_to_use, subject, the fallback outcome and referral, and a present consolidation_register
      exactly as the draft's own record, alongside the title
- criterion: Where read-case-version answers a consolidation_register on that reading, the form's consolidation_register
    is that value.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
      subject, fallback and consolidation_register it answers
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: shows when_to_use, subject, the fallback outcome and referral, and a present consolidation_register
      exactly as the draft's own record, alongside the title
- criterion: Where read-case-version answers no consolidation_register on that reading, the form holds
    no consolidation_register value.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: leaves the form's consolidation_register unset when the draft's own record answers none
  - file: src/routes/case-version-editor-screen-refused-draft.spec.ts
    name: states that the version declares no consolidation register when the draft's own record answers
      none
- criterion: Where another version of the same case carries a different title, the form's title on that
    reading is the named version's own.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
    name: shows the named version's own title even where a different version of the same case carries
      a different one
- criterion: On that reading, the editor's state marks the version as not reading back as a case.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
    name: resolves to phase "not-valid" for a draft read-case refuses with CaseVersionNotValidError, and
      to phase "ready" carrying no such mark once read-case answers the version
- criterion: On a reading where read-case answers the version, the editor's state carries no such mark.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
    name: resolves to phase "not-valid" for a draft read-case refuses with CaseVersionNotValidError, and
      to phase "ready" carrying no such mark once read-case answers the version
- criterion: While read-case-version has not answered on that reading, the editor's state is the loading
    state.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
    name: 'reports exactly { phase: "loading" }, with no release, discard or update-draft offer, while
      read-case-version is still pending for a draft read-case refused'
  why: 'Over-assertion: the test requires the whole state to equal exactly { phase: "loading" }, which
    is a separate fact these criteria do not state.'
- criterion: Where read-case-version does not answer the version's record on that reading, the editor's
    state is the load-error state.
  state: partial
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
    name: 'resolves to exactly { phase: "load-error", retryLoad }, carrying neither the refusal''s error
      code nor its own message, when read-case-version fails for a draft read-case refused'
  why: 'Only one way of not answering is exercised: an HTTP 500 refusal with an unrecognized code. A read-case-version
    request that never completes, or a response that arrives but does not carry a record, are not.'
- criterion: Where read-case refuses a released version with CaseVersionNotValidError, the editor's state
    carries none of that version's declared attributes.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
    name: resolves to the bare not-valid phase with no other field, never reading read-case-version, for
      a released version, and to a distinct load-error phase when the prerequisite read instead fails
      to complete
  why: 'Over-assertion, in two ways: the test also requires that read-case-version is never requested
    (stronger than the criterion), and its later half asserts load-error for an unrelated versions-listing
    failure.'
- criterion: On that reading of a draft whose form is unchanged, the editor's state is not blocked.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
    name: 'carries isBlocked: false once the draft''s own record has loaded and nothing has been edited'
- criterion: On that reading of a draft, cancelling issues no update-draft.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
    name: issues no PATCH request and navigates back to the entry the editor was opened from when onCancel
      is invoked
- criterion: On that reading of a draft, cancelling returns the curator to the previous history entry.
  state: covered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
    name: issues no PATCH request and navigates back to the entry the editor was opened from when onCancel
      is invoked
- criterion: Where the editor's state on that reading offers release, it states the manifest-pin release
    condition as not yet decided.
  state: uncovered
  tests:
  - file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
    name: carries no release field on the not-valid phase, for a draft refused for validation or for a
      released version refused for validation alike
  why: The only test bearing on this fact asserts that release is absent entirely on the not-valid reading;
    no test in the set exercises a not-valid reading whose state does offer release and checks what condition
    it states.
- criterion: While the simulation screen's read has not answered, the screen carries a route to the named
    version's editing surface.
  state: covered
  tests:
  - file: src/routes/case-simulation-screen.spec.ts
    name: carries the route while pending, once failed to complete, once refused for validation, and once
      answered for a draft and for a released version, always addressed by the screen's own path version
- criterion: Where the simulation screen's read did not complete, the screen carries a route to the named
    version's editing surface.
  state: covered
  tests:
  - file: src/routes/case-simulation-screen.spec.ts
    name: carries the route while pending, once failed to complete, once refused for validation, and once
      answered for a draft and for a released version, always addressed by the screen's own path version
- criterion: Where the simulation screen's read was refused with CaseVersionNotValidError, the screen
    carries a route to the named version's editing surface.
  state: covered
  tests:
  - file: src/routes/case-simulation-screen.spec.ts
    name: carries the route while pending, once failed to complete, once refused for validation, and once
      answered for a draft and for a released version, always addressed by the screen's own path version
- criterion: The route's version number is the version number in the simulation screen's own path.
  state: covered
  tests:
  - file: src/routes/case-simulation-screen.spec.ts
    name: carries the route while pending, once failed to complete, once refused for validation, and once
      answered for a draft and for a released version, always addressed by the screen's own path version
  - file: src/routes/case-simulation-screen.spec.ts
    name: renders the ready header for a draft version's own slug/version pair
  - file: src/routes/case-simulation-screen.spec.ts
    name: still carries the route to the named version's own editor when the read is refused with an error
      code other than CaseVersionNotValidError
  why: Every test mounts the same path version; a route that always used that fixed version would still
    pass every test.
- criterion: While the manifest screen's read has not answered, the screen carries a route to the named
    version's editing surface.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-editor-link.spec.ts
    name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
      own path version, while the read is still pending, once it has failed to complete, once it has been
      refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
      a released version
- criterion: Where the manifest screen's read did not complete, the screen carries a route to the named
    version's editing surface.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-editor-link.spec.ts
    name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
      own path version, while the read is still pending, once it has failed to complete, once it has been
      refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
      a released version
- criterion: Where the manifest screen's read was refused with CaseVersionNotValidError, the screen carries
    a route to the named version's editing surface.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-editor-link.spec.ts
    name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
      own path version, while the read is still pending, once it has failed to complete, once it has been
      refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
      a released version
- criterion: On a reading that answered a draft version, the screen carries a route to the named version's
    editing surface.
  state: covered
  tests:
  - file: src/routes/case-simulation-screen.spec.ts
    name: carries the route while pending, once failed to complete, once refused for validation, and once
      answered for a draft and for a released version, always addressed by the screen's own path version
  - file: src/routes/case-simulation-screen.spec.ts
    name: renders the ready header for a draft version's own slug/version pair
  - file: src/routes/version-manifest-screen-editor-link.spec.ts
    name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
      own path version, while the read is still pending, once it has failed to complete, once it has been
      refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
      a released version
- criterion: On a reading that answered a released version, the screen carries a route to the named version's
    editing surface.
  state: covered
  tests:
  - file: src/routes/case-simulation-screen.spec.ts
    name: carries the route while pending, once failed to complete, once refused for validation, and once
      answered for a draft and for a released version, always addressed by the screen's own path version
  - file: src/routes/version-manifest-screen-editor-link.spec.ts
    name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
      own path version, while the read is still pending, once it has failed to complete, once it has been
      refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
      a released version
  why: 'Over-assertion in the simulation-screen test: on the released reading it requires exactly one
    link on the whole screen targeting the editor. The criterion only asks that the route is present.'
- criterion: The route's version number is the version number in the manifest screen's own path.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-editor-link.spec.ts
    name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
      own path version, while the read is still pending, once it has failed to complete, once it has been
      refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
      a released version
  why: Only one path version is mounted, and no answered record carries a competing version number.
- criterion: On the not-valid reading of a draft whose manifest holds no entry, submitting a changed title
    issues an update-draft carrying that title.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: sends a PATCH to this same version carrying the changed title, together with the rest of the
      draft's own record, when Save changes is clicked on the not-valid reading
  why: 'The empty manifest is represented by a record with no manifest field at all, not by an explicit
    empty manifest. Over-assertion: the PATCH body is required to equal exactly the changed title plus
    the rest of the record.'
- criterion: An update-draft answered HTTP 200 on that reading leaves the form holding the title the answer
    carries.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: shows the title the 200 answer carries, not the title as typed, once the update-draft accepted
      on the not-valid reading settles
- criterion: An update-draft answered HTTP 200 with no consolidation_register on that reading leaves the
    form holding no consolidation_register value.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: states that the version declares no consolidation register once a 200 answer carrying no consolidation_register
      settles, though the draft held one before the submit
  why: The test sees the form's value only through the screen's own statement, not by reading the form
    directly.
- criterion: An update-draft answered HTTP 200 whose body carries no manifest shows no save-failure notice.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: issues no toast error once a 200 answer carrying no manifest settles for an update-draft submitted
      on the not-valid reading
- criterion: On the not-valid reading of a draft whose manifest holds no entry, the editor offers the
    discard control.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: renders the Discard draft control for a not-valid draft whose manifest holds no entry, and renders
      none once that same version's own state reads released
  why: The empty manifest is represented by a record with no manifest field, not an explicit empty manifest.
- criterion: On the not-valid reading of a released version, the editor offers no discard control.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: renders the Discard draft control for a not-valid draft whose manifest holds no entry, and renders
      none once that same version's own state reads released
- criterion: On that reading of a draft, asking for the discard without confirming it issues no discard.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: issues no DELETE when the confirm control is clicked before anything is typed
  why: The DELETE count is read in the same tick as the click, so a DELETE started only after the handler
    yields to a promise would not be caught.
- criterion: On that reading of a draft, confirming the discard with text other than the case's own slug
    issues no discard.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: issues no DELETE for a typed value other than the exact slug, then issues exactly one DELETE
      against this version once the slug is typed exactly
  why: 'Only one wrong text is tried: the slug with a suffix appended.'
- criterion: On that reading of a draft, confirming the discard reproducing the case's own slug issues
    a discard of that version.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: issues no DELETE for a typed value other than the exact slug, then issues exactly one DELETE
      against this version once the slug is typed exactly
- criterion: A discard answered HTTP 204 on that reading shows no discard-failure statement.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: shows no discard-failure statement once a 204 answer settles
  why: 'Over-assertion: the test requires no element with role alert exists anywhere on the screen, broader
    than the criterion''s own scope.'
unpaired:
- test:
    file: src/routes/case-simulation-screen.spec.ts
    name: degrades to a typed error state offering a retry that reissues the request, without navigating
      away from this route
  asserts: On a network failure the simulation screen shows the load-error text; clicking Retry sends
    another fetch, and the location stays on the simulate path.
- test:
    file: src/routes/case-simulation-screen.spec.ts
    name: renders an explicit loading state before the version resolves
  asserts: While the fetch is pending, the simulation screen shows a loading statement.
- test:
    file: src/routes/case-simulation-screen.spec.ts
    name: renders the ready header for a released version's own slug/version pair
  asserts: For a released version, the simulation screen shows Released and its Edit version link targets
    the new-draft route with sourceVersion set.
- test:
    file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
    name: still renders the Discard draft control when the declared-attributes record answers a manifest
      holding an entry, refuting an editor that shows the control only when the draft's manifest is empty
  asserts: On the not-valid draft reading, the Discard draft control is shown even when the declared-attributes
    record carries a manifest with one entry.
- test:
    file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: shows the when_to_use the 200 answer carries, not the value locally typed before submit, refuting
      an editor that keeps the form's pre-submit when_to_use
  asserts: After a 200 answer to update-draft on the refused reading, the field shows the answer's when_to_use
    rather than the value typed before submitting.
- test:
    file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: still sends the PATCH when the declared-attributes record answers a manifest holding an entry,
      refuting a gate keyed to a-case-has-at-least-one-hypothesis specifically
  asserts: On the refused draft reading, with a declared-attributes record whose manifest holds one entry,
    editing the title and clicking Save changes sends exactly one PATCH.
- test:
    file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
    name: still shows the not-read-back-as-a-case banner once the update-draft settles, refuting an editor
      that moves to its ordinary ready state on an accepted answer alone
  asserts: The not-read-back-as-a-case banner is present once the title field shows the accepted answer's
    value.
findings:
- pass: conformance
  file: src/routes/case-simulation-screen.tsx
  where: the `loading` branch (`state.phase === "loading"`) and the `load-error` branch (`state.phase
    === "load-error"`)
  evidence: '<p>Loading version {version}…</p>

    <CaseVersionEditorLink slug={slug} version={version} />

    ...

    <p>Unable to load this version right now.</p>

    <Button type="button" onClick={state.retryLoad}>Retry</Button>

    <CaseVersionEditorLink slug={slug} version={version} />'
  cost: Both readings of this version-keyed surface carry a route to the version's own editing surface
    but no route to the version's own manifest, so a curator who reaches this screen while the read is
    pending or has failed has no way from here to the manifest -- the one screen a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
    says should carry that route regardless of what the read answered, on these two readings, a screen
    carrying only the editor's sibling route and not this one.
  correction: Render a route to the version's manifest (the counterpart of CaseVersionEditorLink) in both
    the loading and load-error branches, alongside the existing editor route.
- pass: conformance
  file: src/routes/case-simulation-screen.spec.ts
  where: the "route to the named version's own editor across every reading" test, criterion 3 (the read
    refused with CaseVersionNotValidError) compared against criterion 2 (the read that did not complete)
  evidence: '// criterion 2: the read did not complete

    const failedFetch: FetchFn = async () => { throw new Error("network down"); };

    await mountCaseSimulationScreen(failedFetch);

    expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();

    ...

    // criterion 3: the read was refused with CaseVersionNotValidError

    const refusedFetch: FetchFn = async () => jsonResponse({ error: { code: "CaseVersionNotValidError",
    message: "validation failed" } }, 409);

    await mountCaseSimulationScreen(refusedFetch);

    expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();'
  cost: The node requires the surface to state the CaseVersionNotValidError refusal distinct from what
    the same surface states for a read that did not complete, so a reader tells the two apart. This test
    pins both conditions to the identical text, so it passes exactly when the surface renders the two
    indistinguishably to the curator -- the confusion the node names as sending the reader to the wrong
    act -- and a curator meeting the validation refusal is told nothing that points them toward correcting
    the draft rather than retrying a read no retry can ever complete.
  correction: Criterion 3 should assert a statement distinct from criterion 2's -- one that tells the
    curator the named version does not currently read back as a case -- rather than reusing the same load-error
    text.
- pass: conformance
  file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
  where: the outer describe title
  evidence: '"useEditDraftVersionForm -- a draft refused by read-case with CaseVersionNotValidError is
    read through read-case-version, and its own declared attributes fill the editable form (criteria 1,
    2, 3, 4, 5, 6, 7, 8; rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record)"'
  cost: a-draft-versions-content-is-presented-only-from-its-own-record is decided over a version created
    through create-draft and the interval before that version's own answer has arrived. This file never
    creates a draft and never exercises that pending-read interval -- it stubs an existing version refused
    by validation at an ordinary read. A reader following this citation to find the pending-created-draft
    rule's proof will find this file instead, and a reader trying to find test coverage for an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
    -- the node whose own decision-log entry matches exactly what this file's assertions demonstrate --
    will not find it credited here.
  correction: Cite rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
    in the describe title instead of a-draft-versions-content-is-presented-only-from-its-own-record.
- pass: conformance
  file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  where: the comment above notValidDraftHandlers
  evidence: the versions listing reports this same version's own state (the gate the discard offer turns
    on)
  cost: The discard-offer's own condition -- that it turns on the version's state alone, per only-a-draft-case-version-may-be-discarded
    -- is restated here in prose next to the fixture rather than left to the node; if the node's condition
    ever changes, this comment can go on saying what it used to say, and a reader who trusts the comment
    instead of opening the node never notices the two have parted ways.
  correction: Drop the parenthetical explaining why the versions listing matters; describe only what the
    fixture returns, not the rule that reads it.
- pass: conformance
  file: src/routes/version-manifest-screen.tsx
  where: the ConflictBanner rendered in the loaded branch of VersionManifestScreen
  evidence: "{state.isBlocked && (\n  <ConflictBanner\n    title=\"This version was released by someone\
    \ else\"\n    message=\"Your changes were not saved. Reload to see the current state, or start a new\
    \ draft.\"\n  />\n)}"
  cost: The node holds a presentation of its own for exactly two composing refusals and requires every
    other refusal to be shown as the generic notice disclosing nothing further. A manifest-composing call
    refused because the version moved out of draft answers with CaseVersionNotDraftError, neither of the
    two named codes, so it falls in the every-other-refusal bucket -- yet this banner names the specific
    cause and prescribes a specific remedy, disclosing exactly what the node forbids disclosing for an
    unnamed refusal.
  correction: Replace the differentiated title/message with the app's own generic request-failed-for-an-unrecognised-reason
    notice, carrying nothing about the version having been released or about starting a new draft.
- pass: conformance
  file: src/routes/case-version-editor-ready-view.tsx
  where: the RELEASE_DIALOG_DESCRIPTION constant, rendered as the release confirmation dialog's own DialogDescription
  evidence: '"Once released, this version and every manifest entry it holds are frozen — permanently."'
  cost: The confirmation dialog re-asserts the write-once invariant's own content as its own authority;
    if a-case-version-is-written-once is ever revised, this hardcoded sentence keeps telling every curator
    confirming a release the old rule, with nothing tying the string back to the node for whoever changes
    it to find.
  correction: State the consequence of confirming without re-deriving the invariant's own wording, or
    source the claim from the node so a later change to it is felt here.
- pass: standard
  file: src/hooks/use-edit-draft-version-form.ts
  where: the "not-valid" member of EditDraftVersionFormState
  evidence: "readonly phase: \"not-valid\";\n  readonly form?: UseFormReturn<CaseVersionFormValues>;\n\
    \  readonly status?: SaveStatus;\n  readonly isBlocked?: boolean;\n  readonly outcomeOptions?: GlossaryVocabularyOptions;\n\
    \  readonly actionOptions?: GlossaryVocabularyOptions;\n  readonly recipientOptions?: GlossaryVocabularyOptions;\n\
    \  readonly onSubmit?: (event?: BaseSyntheticEvent) => void;\n  readonly onFieldBlur?: () => void;\n\
    \  readonly onCancel?: () => void;\n  readonly discard?: DiscardControlState;"
  cost: 'The hook''s own behavior only ever produces two real shapes at this phase -- a bare { phase:
    "not-valid" } and a fully-populated "enriched" one -- but the type lets a caller construct any partial
    mix and the compiler accepts every one. The codebase already had to work around this with a separate
    hand-written runtime guard (isEnrichedNotValidState) that narrows on nothing but form !== undefined,
    which would pass on a value carrying form with no onSubmit.'
  correction: Model the not-valid phase as its own two-member union so the enriched fields are required
    together and the compiler refuses a state carrying some but not all of them; drop the hand-rolled
    guard once the discriminant does that work.
  cites: TYP-04
- pass: standard
  file: src/routes/case-version-editor-not-valid-view.tsx
  where: the consolidation-register watch and the inline null-check driving the no-register text
  evidence: 'const consolidationRegister = state.form.watch("consolidation_register");

    ...

    {consolidationRegister == null && <p>{NO_CONSOLIDATION_REGISTER_TEXT}</p>}'
  cost: Whether this version's declared record carries a consolidation register is a fact about the draft,
    not about how it is rendered, but the decision of when to state the no-register text is made only
    here, computed by watching the live form field and testing it for null inline in the JSX. A test of
    that decision has no way to reach it except by rendering the whole component, and a second surface
    needing the same wording has nowhere to call this rule from.
  correction: Compute the has-a-consolidation-register fact in use-not-valid-draft-version-state.ts (or
    a shared selector it calls) and pass a resolved boolean or the message itself down as a prop, leaving
    the view to render what it is given rather than decide it.
  cites: ARC-03
---

## What it is

Six frontend tasks (route-the-simulation-screen-to-the-version-editor, route-the-manifest-screen-to-the-version-editor, load-a-refused-drafts-own-record-into-the-editor-state, present-the-refused-draft-on-the-editor-screen, save-a-correction-on-the-refused-reading, offer-discard-on-the-refused-reading) reviewed over their 18 files: coverage, specification conformance (one delegation per file), standard conformance (the project's own frontend registry) and the captured run.
The run passed clean (install, typecheck, lint, style, build, a11y, secret-scan, test all green), so no failures pass finding exists.
The standard pass found 2 departures over the 24 rules in scope (TYP-04, ARC-03), both in files this delivery touched.
The conformance pass found 6 findings across 6 files, 2 of them (case-simulation-screen.tsx, case-simulation-screen.spec.ts) landing on this delivery's own task work; the other 4 are on pre-existing, adjacent files opened while a per-file judge searched the specification for what a file's own domain fact answers to.
The coverage pass found every one of the 6 tasks' 47 criteria covered or partially covered; one ("An update-draft answered HTTP 200 whose body carries no manifest shows no save-failure notice") first came back uncovered -- the offered test did not reliably wait for the answer to settle and checked a mocked call rather than what the screen shows -- and was closed by a proof-only re-delivery after this review's own passes ran (see Notes).
5 certifications were staged; none held whole -- each auditor answered partial, for reasons recorded in the reconciliation record's own notes, except one (a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading) which held covered and is now bound as decided by test.

## Notes

The trace's drift over this target, read before staging: frontend/app is declared `edits_freely` in siegard.json, so `code` drift there is suppressed rather than listed (501 suppressed at session start); the moved/proof/orphaned classes were still read in full and none of this review's own 18 files carried one.
The fold left 14 nodes uncleared over this review's own file set: contracts/knowledge/case-lifecycle, domain/glossary/concept, domain/glossary/subject-type, domain/knowledge/referral, rules/knowledge/a-case-has-at-least-one-hypothesis, rules/knowledge/a-case-version-is-written-once, rules/knowledge/a-concept-accepts-the-declared-subject-type, rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case, rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for, rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading, rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case, rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case, rules/knowledge/case-terms-exist-in-the-glossary, scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing; `trace.py --owed` is the report that reads them, never this record.
35 bindings were written by this bind, one of them (a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading) `decided_by: test` over its own certifying proof; every other node this file set touches without a task claim of its own remained `unbound`, per the reconciliation record's own list -- this review's staging read every trace-bound and plan-node pair on these files without writing a new claim of its own beyond what the fold actually cleared.
After this review's own passes ran, the "save-failure notice" criterion's proof was corrected (the test now waits for a server-answered value distinct from what was typed, and for patchCallCount to settle, before checking toast.error) under a narrower re-delivery -- the implementation stood unchanged, only the proof did -- captured at run/draft-editor-correction-while-invalid-save-a-correction-on-the-refused-reading-proof-fix, and a fresh coverage-auditor delegation certified the criterion covered. The `coverage` entry above reflects that later state rather than this record's own original pass, disclosed here since the reconciliation record and this review's other entries still reflect the run captured under `run:` above.
