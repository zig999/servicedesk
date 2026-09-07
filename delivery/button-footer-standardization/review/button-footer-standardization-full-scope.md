---
title: The ButtonFooter standardization, all seven tasks
summary: What four passes found over the twenty-one source files and twenty-eight specs the seven tasks of button-footer-standardization delivered, with the failures pass not run because the captured run passed whole.
reviewed:
- src/hooks/use-capability-detail.ts
- src/hooks/use-capability-form.ts
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-connector-configuration-form.ts
- src/hooks/use-edit-draft-version-form.ts
- src/hooks/use-hypothesis-revision-form.ts
- src/hooks/use-manifest-pinned-revision-states.ts
- src/hooks/use-new-draft-version-form.ts
- src/routes/capability-create-screen.tsx
- src/routes/capability-detail-ready-view.tsx
- src/routes/capability-detail-screen.tsx
- src/routes/capability-form-fields.tsx
- src/routes/case-version-editor-ready-view.tsx
- src/routes/connector-configuration-create-screen.tsx
- src/routes/connector-configuration-detail-ready-view.tsx
- src/routes/connector-configuration-detail-screen.tsx
- src/routes/connector-configuration-form-fields.tsx
- src/routes/hypothesis-revision-form-fields.tsx
- src/routes/hypothesis-revision-screen.tsx
- src/services/release-checklist.ts
- src/shared/components/button-footer.tsx
- src/routes/capability-create-screen-actions.spec.ts
- src/routes/capability-create-screen-outcome.spec.ts
- src/routes/capability-create-screen-save.spec.ts
- src/routes/capability-create-screen.spec.ts
- src/routes/capability-detail-screen-cancel.spec.ts
- src/routes/capability-detail-screen-discard-availability.spec.ts
- src/routes/capability-detail-screen-outcome.spec.ts
- src/routes/capability-detail-screen-route.spec.ts
- src/routes/capability-detail-screen.spec.ts
- src/routes/capability-form-fields-action-footer.spec.ts
- src/routes/case-version-editor-screen-action-footer.spec.ts
- src/routes/case-version-editor-screen-cancel.spec.ts
- src/routes/case-version-editor-screen-release-checklist.spec.ts
- src/routes/case-version-editor-screen-release-control.spec.ts
- src/routes/case-version-editor-screen-release-outcomes.spec.ts
- src/routes/connector-configuration-create-screen-cancel.spec.ts
- src/routes/connector-configuration-create-screen-outcome.spec.ts
- src/routes/connector-configuration-create-screen.spec.ts
- src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
- src/routes/connector-configuration-detail-ready-view-order.spec.ts
- src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- src/routes/connector-configuration-detail-screen-outcome.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-form-fields-action-footer.spec.ts
- src/routes/hypothesis-revision-form-fields-footer.spec.ts
- src/routes/hypothesis-revision-screen-cancel.spec.ts
- src/routes/new-case-draft-screen-cancel.spec.ts
- src/shared/components/button-footer.spec.ts
tasks:
- task/shared-action-footer/button-footer-component
- task/registry-authoring-footers/capability-form-action-footer
- task/registry-authoring-footers/capability-screen-return-route
- task/registry-authoring-footers/connector-configuration-form-action-footer
- task/registry-authoring-footers/connector-configuration-screen-return-route
- task/knowledge-authoring-footers/hypothesis-revision-action-footer
- task/knowledge-authoring-footers/case-version-editor-action-footer
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: a captured run that reported a failure — the run this review captured over the whole change, run/button-footer-standardization-full-scope, passed every one of its eight steps, so there was no failure for the pass to read
coverage:
- criterion: case-version-editor-ready-view renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-action-footer.spec.ts
    name: renders Release, Discard, Save changes and Cancel inside one accessible group named Actions
  - file: src/routes/case-version-editor-screen-action-footer.spec.ts
    name: still offers Cancel inside that same group when the version is read-only, even though Save and Release are withheld
  why: 'The first test''s only await is findByRole("group", { name: "Actions" }), a group the ButtonFooter renders identically in every phase, so the anchor identifies no phase; here that is a flake risk rather than a false pass, because the four synchronous getByRole calls that follow throw when the ready phase has not arrived.'
- criterion: Save changes still carries `form={CASE_VERSION_EDITOR_FORM_ID}` and still submits the editor's form from outside the `<form>` element.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-action-footer.spec.ts
    name: renders Release, Discard, Save changes and Cancel inside one accessible group named Actions
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: disables the Release trigger while a Save to the same version is in flight
  why: Nothing asserts that the Save changes control carries form={CASE_VERSION_EDITOR_FORM_ID}. The one test in the set in which Save changes actually submits the editor's form does so on the way to asserting the Release trigger goes disabled mid-flight, and it neither places the control outside the <form> nor shows that the submit still reaches the form from there.
- criterion: Cancel leaves the editing without submitting it, writes no change to the version, leaves the version's declared attributes and every manifest entry exactly as they were, and returns the curator to the surface the editing was reached from.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-cancel.spec.ts
    name: navigates back to the case simulation cockpit it was opened from, rather than a fixed destination such as the case detail route
  - file: src/routes/case-version-editor-screen-cancel.spec.ts
    name: issues no PATCH request when Cancel is clicked after a field was edited
  why: 'Leaving without submitting and returning to the surface the editing was reached from are both exercised. The manifest half is not: patchCallCount counts PATCH calls only, so a write to a manifest entry through any other verb passes unnoticed, and no test reads the version''s declared attributes or its manifest back after the Cancel.'
- criterion: Asking to release issues no release; a release is issued only where the curator, having asked, states in a further act that the release is to be performed.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: closes the Dialog and issues no request when Cancel is clicked
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: issues exactly one POST to .../release with no body when Release is confirmed
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: issues exactly one POST even when Release is confirmed twice in quick succession
- criterion: Asking to discard issues no discard; a discard is issued only where the curator, having asked, states in a further act that the discard is to be performed and reproduces the case's own slug in that act, and an act reproducing no slug or a slug that is not the case's issues no discard.
  state: uncovered
  why: No test in the set activates a Discard draft control. Nothing exercises the ask issuing no discard, an act reproducing the case's own slug issuing one, or an act reproducing no slug or a wrong slug issuing none. The only assertion touching discard anywhere is the presence of a "Discard draft" button inside the Actions group.
- criterion: Before any release is attempted, and without the curator opening any further control, the action surface itself states for every release condition the draft may still fail whether the draft currently meets it, a met condition stated as met and an unmet one as unmet.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states the manifest-pin condition as Met without the curator ever opening the Release dialog
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states the manifest-pin condition as Not met once a manifested hypothesis revision reads back as still a draft (criterion 8)
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: discloses exactly the one manifest-pin condition today, no other item (this task's own inference)
- criterion: A release condition whose inputs the surface has not read is stated as not yet decided for that draft, never as met and never as unmet.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states Not yet decided, neither Met nor Not met, while the manifested revision's own read is still pending
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states Not yet decided rather than Not met when the manifested revision's own read fails outright (this task's own inference)
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states Not met, never Not yet decided, once one manifested entry is confirmed unreleased even while a second entry's own read is still pending
- criterion: The condition the surface states is that every manifest entry of the draft references a released hypothesis revision.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states the manifest-pin condition as Met without the curator ever opening the Release dialog
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states the manifest-pin condition as Not met once a manifested hypothesis revision reads back as still a draft (criterion 8)
  - file: src/routes/case-version-editor-screen-release-checklist.spec.ts
    name: states the manifest-pin condition as Met, vacuously, for a manifest holding no entry (this task's own inference)
- criterion: The Discard draft control is offered only while the version being edited is a draft.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-action-footer.spec.ts
    name: renders Release, Discard, Save changes and Cancel inside one accessible group named Actions
  why: 'Only the draft half is exercised: Discard draft is asserted present for a draft record. The reading of a released version asserts Save changes and Release… are withheld and says nothing at all about Discard draft, so an implementation offering Discard on a non-draft version fails no test in the set.'
- criterion: A version being read in its released state offers no Save changes control and no Release control.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-action-footer.spec.ts
    name: still offers Cancel inside that same group when the version is read-only, even though Save and Release are withheld
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: renders no Release control when the loaded version's own state is released
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: 'moves the loaded version to released: hides the Release control and disables every field and Save'
- criterion: On the new case draft screen, while no answer for the created version's own record has arrived, the surface offers no act issuing a release, a discard or an update-draft over that version, and states that the version is still being read.
  state: covered
  tests:
  - file: src/routes/new-case-draft-screen-cancel.spec.ts
    name: renders no Cancel button, and no button at all, only the still-being-read statement
- criterion: hypothesis-revision-form-fields renders its Save hypothesis button through ButtonFooter rather than through its own end-aligned flex row.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
    name: wraps Save hypothesis inside an accessible group named Actions, rather than a bare flex row
  - file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
    name: renders only Save hypothesis when the form-fields component is used with no trailingActions element passed
- criterion: The footer carries a Cancel that abandons the composition before it is submitted, writing no revision and leaving the hypothesis's existing revisions and its case's draft version exactly as they were, and returns the curator to the screen the composition was opened from.
  state: partial
  tests:
  - file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
    name: renders Cancel inside the same accessible actions group as Save hypothesis, not as a separate control outside it
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: issues no POST to the hypotheses endpoint when clicked, even after every field was filled in
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: navigates back to the case simulation screen it was reached from, rather than a fixed destination such as the manifest builder
  why: 'Writing no revision and returning to the screen the composition was opened from are exercised. Nothing establishes the rest: postCallCount counts POST calls only, no test reads the hypothesis''s existing revisions or the case''s draft version back after the Cancel, so a write to either through another verb — a manifest pin, say — would fail no test.'
- criterion: The Cancel is offered for as long as the composition has not been submitted, and neither its presence nor its enablement turns on how much of the composition was filled in.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: is present and enabled both on a freshly opened, blank form and once every field has been filled in
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: is no longer rendered once a save has succeeded
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: still renders Cancel when the hypothesis's highest existing revision has already been released
- criterion: Submitting the form still saves the hypothesis revision through the same call it made before.
  state: partial
  tests:
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: is no longer rendered once a save has succeeded
  why: The save is exercised only incidentally, on the way to asserting that Cancel disappears once it has succeeded. Nothing in the set asserts the call the submit issues — its path, method or body; the only thing binding it to the call made before is the stub's own routing key, and it will be changed the day that Cancel assertion changes.
- criterion: The form still renders hypothesis name, criterion, collects and resolution, with their validation unchanged.
  state: partial
  tests:
  - file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
    name: wraps Save hypothesis inside an accessible group named Actions, rather than a bare flex row
  - file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
    name: renders Cancel inside the same accessible actions group as Save hypothesis, not as a separate control outside it
  why: Only the hypothesis name field is queried, and there only as a mount anchor. Nothing asserts that criterion, collects or resolution render, and no test in the set submits an invalid composition, so the validation being unchanged is wholly unexercised.
- criterion: The subject type is shown read-only and read from the case's draft version and from nowhere else.
  state: uncovered
  why: 'No test asserts that a subject type is shown, that it is read-only, or where its value came from. The harness in hypothesis-revision-form-fields-footer.spec.ts passes subjectType: "billing-dispute" as a prop and asserts nothing whatever about it, so an implementation reading the subject type from another source, or rendering it editable, fails no test here.'
- criterion: While the case's draft version record has not answered, the form states that the version is still being read and states no attribute of it, presenting neither a partial content nor an empty one as the version's.
  state: uncovered
  why: No test in the set holds the case's draft-version read pending on this form. Neither the still-being-read statement nor the refusal to present a partial or empty content as the version's is exercised.
- criterion: After a save, the screen states the revision number the revise answered, and states nothing further distinguishing a revise that replaced the highest existing revision in place from one that created the next.
  state: partial
  tests:
  - file: src/routes/hypothesis-revision-screen-cancel.spec.ts
    name: is no longer rendered once a save has succeeded
  why: 'The revision number in the post-save statement is asserted incidentally, as the wait condition on the way to asserting Cancel is gone. The second half is unexercised: no test sets up a revise that replaced the highest existing revision in place against one that created the next, so nothing would catch the screen stating something that distinguishes them.'
- criterion: After a save, the route to the draft's manifest is offered where the draft's manifest held no entry for the hypothesis and where the revision written is higher than the revision that entry pinned immediately before, and is not offered where the revise wrote into the very revision that entry already pins.
  state: uncovered
  why: Nothing in the set inspects what the screen offers after a save beyond Cancel's absence. None of the three manifest states the criterion names — no entry for the hypothesis, an entry pinning a lower revision, an entry pinning the very revision written — is set up, so neither the offer nor the withholding is exercised.
- criterion: capability-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-action-footer.spec.ts
    name: renders Save inside a group named Actions
  - file: src/routes/capability-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
- criterion: Whatever a screen passes through the existing `trailingActions` prop is rendered inside the footer beside Save, and no second prop for appending buttons is introduced.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-action-footer.spec.ts
    name: renders the create screen's own Cancel control beside Save, inside the Actions group
  - file: src/routes/capability-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders the create screen's own Cancel control beside Save, inside the Actions group
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  why: 'Two tasks state this criterion in the same words, one over capability-form-fields and one over connector-configuration-form-fields, and the auditor answered each separately; the record answers it once, over both, because the record answers a criterion rather than a task. On both components, that what a screen passes through is rendered inside the footer beside Save is exercised through each screen''s own trailing controls. The second clause is exercised on neither: no test in the set renders either form-fields component directly against its own props, so nothing exercises the absence of a second appending prop — a second such prop, used by no screen, would fail nothing.'
- criterion: Submitting the capability form issues the registration, and where it succeeds the operator is taken to the surface addressed by that capability's own name and version.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-save.spec.ts
    name: issues PUT /v1/capabilities/{name}/{version} at the name and version just typed
  - file: src/routes/capability-create-screen-save.spec.ts
    name: issues the PUT at a different URL when a different name and version are typed, rather than a fixed destination
  - file: src/routes/capability-create-screen-save.spec.ts
    name: navigates to /capabilities/<name>/<version> once the registration succeeds, rather than staying on the create route
- criterion: Where the registry answers a submission, the surface states the outcome — that the capability was registered, naming the name and version submitted, or that nothing was registered and which refusal answered it, a named condition stated apart from a refusal whose condition the surface does not recognise.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-outcome.spec.ts
    name: shows a success statement naming the registered capability's own name and version once the registry answers
  - file: src/routes/capability-create-screen-outcome.spec.ts
    name: shows no success statement while the registration is still pending -- an implementation stating success at the moment of submit would fail this
  - file: src/routes/capability-create-screen-save.spec.ts
    name: shows the registry's own distinguishable message and keeps the operator on the create screen
  - file: src/routes/capability-detail-screen-outcome.spec.ts
    name: shows the registry's own distinguishable refusal message when the edit is refused
  - file: src/routes/capability-detail-screen-outcome.spec.ts
    name: falls back to a generic message for a refusal this surface does not recognise
  why: The named-condition-apart-from-unrecognised distinction is exercised on the detail surface only; on the create surface a named refusal is exercised but a refusal whose condition the surface does not recognise is not.
- criterion: On a capability detail surface whose read answered, the footer offers a control returning every field to the content that read answered, which registers nothing, leaves the operator on that surface, and takes effect only after a further explicit act by the operator.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  - file: src/routes/capability-detail-screen-discard-availability.spec.ts
    name: renders no Discard control while the capability read is still pending -- an implementation offering Discard here would fail this
  - file: src/routes/capability-detail-screen-discard-availability.spec.ts
    name: renders no Discard control once the capability read fails -- an implementation offering Discard here would fail this
  why: Only the control's presence once the read answered, and its withholding in the other two phases, are exercised. No test activates it, so returning every field to the content the read answered, registering nothing, leaving the operator on that surface, and taking effect only after a further explicit act are all unexercised.
- criterion: The capability create surface, having read no registration, offers no such discard control.
  state: covered
  tests:
  - file: src/routes/capability-create-screen-actions.spec.ts
    name: renders no Discard changes control anywhere on the create surface
- criterion: The footer carries a Cancel that leaves the authoring without submitting it, registering nothing and replacing no registered capability, and returns the operator to the surface the authoring was reached from.
  state: partial
  tests:
  - file: src/routes/capability-create-screen-actions.spec.ts
    name: renders Cancel as a link addressed at the capabilities listing
  - file: src/routes/capability-create-screen-actions.spec.ts
    name: navigates to the capabilities listing when Cancel is clicked, issuing no PUT
  - file: src/routes/capability-detail-screen-cancel.spec.ts
    name: renders Cancel as a link addressed at the capabilities listing, distinct from Discard
  - file: src/routes/capability-detail-screen-cancel.spec.ts
    name: navigates to the capabilities listing when Cancel is clicked while an edit is pending, issuing no PUT
  why: 'Leaving without submitting, registering nothing and replacing no registered capability are exercised through a zero PUT count on both surfaces. The destination clause is not: every test mounts the authoring directly at its own route and asserts the fixed /capabilities listing, so no reading reaches the authoring from another surface and returning the operator to the surface it was reached from goes unexercised.'
- criterion: Every reading of the capability create surface, and of the capability detail surface's ready phase, offers the operator a route to the capabilities listing.
  state: covered
  tests:
  - file: src/routes/capability-create-screen.spec.ts
    name: renders Cancel as a link to /capabilities once the form is ready
  - file: src/routes/capability-create-screen.spec.ts
    name: renders the same Cancel route while the concept vocabulary is still loading
  - file: src/routes/capability-create-screen.spec.ts
    name: 'keeps a Cancel route to the capabilities listing available while the load has failed (edge case: a dependency that fails)'
  - file: src/routes/capability-detail-screen.spec.ts
    name: navigates back to the capabilities list when Cancel is clicked
- criterion: No capability screen renders a link whose accessible name is Back to capabilities, in any of its phases.
  state: uncovered
  why: No test in the set queries for a link named "Back to capabilities", and no capability spec bounds how many links a capability screen renders. Every capability assertion about links is a positive one about Cancel, which a Back to capabilities link rendered beside it would leave untouched — unlike the connector specs, which assert exactly one link per phase.
- criterion: capability-create-screen offers the operator a route to the capabilities listing on every reading.
  state: covered
  tests:
  - file: src/routes/capability-create-screen.spec.ts
    name: renders Cancel as a link to /capabilities once the form is ready
  - file: src/routes/capability-create-screen.spec.ts
    name: renders the same Cancel route while the concept vocabulary is still loading
  - file: src/routes/capability-create-screen.spec.ts
    name: 'keeps a Cancel route to the capabilities listing available while the load has failed (edge case: a dependency that fails)'
- criterion: capability-detail-screen offers the operator a route to the capabilities listing in its loading phase, its load-error phase and its ready phase alike.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-route.spec.ts
    name: renders a Cancel route to the capabilities listing while the capability read is still pending -- an implementation withholding the route here would fail this
  - file: src/routes/capability-detail-screen.spec.ts
    name: 'keeps a Cancel route to the capabilities listing available when the load fails (edge case: a dependency that fails)'
  - file: src/routes/capability-detail-screen.spec.ts
    name: keeps a Cancel route to the capabilities listing when the read fails because the identity itself is unregistered -- an implementation rendering a distinct, routeless reading here would fail this
  - file: src/routes/capability-detail-screen.spec.ts
    name: navigates back to the capabilities list when Cancel is clicked
- criterion: capability-detail-screen's loading phase states that the capability at that name and version is still being read.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-route.spec.ts
    name: renders a Cancel route to the capabilities listing while the capability read is still pending -- an implementation withholding the route here would fail this
  - file: src/routes/capability-detail-screen-discard-availability.spec.ts
    name: renders no Discard control while the capability read is still pending -- an implementation offering Discard here would fail this
  why: Both tests reach the statement only as a phase anchor, through findByText(/Loading capability/), a regex that matches whether or not the name and version appear. That the statement names the capability at that name and version — the load-bearing part of the criterion — is unexercised.
- criterion: capability-detail-screen's load-error phase states that the capability at that name and version could not be read, and carries a control whose one effect is to issue that same read again.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen.spec.ts
    name: 'keeps a Cancel route to the capabilities listing available when the load fails (edge case: a dependency that fails)'
  - file: src/routes/capability-detail-screen.spec.ts
    name: keeps a Cancel route to the capabilities listing when the read fails because the identity itself is unregistered -- an implementation rendering a distinct, routeless reading here would fail this
  - file: src/routes/capability-detail-screen-discard-availability.spec.ts
    name: renders no Discard control once the capability read fails -- an implementation offering Discard here would fail this
  why: These tests only await a Retry button as a phase anchor. No test asserts any statement in this phase, so the screen stating that the capability at that name and version could not be read is unexercised; and no test counts reads before and after a Retry click on this screen, so that Retry's one effect is issuing that same read again is unexercised too. The Retry re-issue that is exercised, in capability-create-screen.spec.ts, is the concept vocabulary read on a different screen.
- criterion: capability-detail-screen's loading phase carries no control that issues the read again, and neither phase re-issues that read on the screen's own initiative.
  state: uncovered
  why: Nothing asserts the absence of a Retry control in this screen's loading phase — the loading-phase tests assert only the Cancel route and the absence of Discard. No test counts GETs to the capability path across either phase, so a screen re-issuing the read on its own initiative would fail nothing.
- criterion: Neither the loading phase nor the load-error phase presents any attribute of any capability as the content standing at that identity.
  state: uncovered
  why: No test asserts the absence of capability fields or values in either phase. The loading-phase tests query only Cancel and Discard, the load-error tests only Retry, Cancel and Discard; a phase rendering a stale or half-read capability's attributes would pass every one of them.
- criterion: No spec under frontend/app/src/routes queries a Back to capabilities link.
  state: uncovered
  why: This is a condition over the spec files themselves. Nothing in the set reads or asserts anything about the contents of files under src/routes, so no test in it can fail on the day a spec starts querying such a link.
- criterion: connector-configuration-form-fields renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders Save inside a group named Actions
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  - file: src/routes/connector-configuration-detail-ready-view-order.spec.ts
    name: renders the Test heading outside the Actions group, alongside Save rather than inside it
- criterion: Submitting the connector-configuration form issues the registration, and where it succeeds the operator is taken to the surface addressed by that configuration's own connector name.
  state: partial
  tests:
  - file: src/routes/connector-configuration-create-screen-outcome.spec.ts
    name: shows a success statement naming the registered connector once the registry answers
  - file: src/routes/connector-configuration-create-screen-outcome.spec.ts
    name: shows no success statement while the registration is still pending -- an implementation stating success at the moment Save is pressed would fail this
  why: 'The submission reaching the registration at that connector''s own path is exercised. Where the operator lands afterwards is not: no test in the set reads the router''s location after a successful create, so being taken to the surface addressed by that configuration''s own connector name is unexercised.'
- criterion: Where the registry answers a submission, the surface states the outcome — that the configuration was registered, naming the connector name submitted, or that nothing was registered and which refusal answered it, a named condition stated apart from a refusal whose condition the surface does not recognise.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen-outcome.spec.ts
    name: shows a success statement naming the registered connector once the registry answers
  - file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
    name: shows the registry's own distinguishable refusal message when the edit is refused as not well-formed
  - file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
    name: falls back to a generic message for a refusal this surface does not recognise
  - file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
    name: saves successfully with no toast call at all -- a stray toast.success on this surface would throw against this file's own sonner stub, which declares no success function
  why: Both refusal branches are exercised on the detail surface only; on the create surface no refusal at all is exercised, named or unrecognised.
- criterion: On a connector-configuration detail surface whose read answered, the footer offers a control returning every field to the content that read answered, which registers nothing, leaves the operator on that surface, and takes effect only after a further explicit act by the operator.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders no Discard changes control while the read is still outstanding -- an implementation offering it in the loading window would fail this
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders no Discard changes control once the read fails -- an implementation offering it in the load-error window would fail this
  why: Only the control's presence once the read answered and its withholding in the loading and load-error phases are exercised. No test clicks it, so returning every field to the content the read answered, registering nothing, leaving the operator on that surface, and taking effect only after a further explicit act are all unexercised.
- criterion: The connector-configuration create surface, having read no registration, offers no such discard control.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: renders no Discard changes control
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders no Discard changes control
- criterion: The footer carries a Cancel that leaves the authoring without registering anything, creating no configuration and leaving every registered configuration exactly as it stood, and returns the operator to the surface the authoring was reached from.
  state: partial
  tests:
  - file: src/routes/connector-configuration-create-screen-cancel.spec.ts
    name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in -- a Cancel wired to submit before navigating would fail this
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: navigates to /connectors on Cancel without issuing any PUT request -- an implementation that submits register-connector before navigating would fail this
  - file: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
    name: issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even with unsaved edits -- a Cancel wired to submit before navigating would fail this
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: issues no PUT request when the footer's Cancel link is clicked -- an implementation that submits register-connector before navigating would fail this
  why: 'Registering nothing and creating no configuration are exercised through a zero PUT count, with the form filled in and with unsaved edits. Leaving every registered configuration exactly as it stood is not: no test reads the registry back after the Cancel. The destination clause is unexercised too — every test mounts the authoring at its own address and asserts the fixed /connectors listing, and connector-configuration-create-screen.spec.ts asserts outright that the route does not turn on how the operator arrived, so nothing exercises a return to the surface the authoring was reached from.'
- criterion: Every reading of the connector-configuration create surface, and of the detail surface's ready phase, offers the operator a route to the connector-configurations listing.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the footer's Cancel link to /connectors
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the footer's Cancel link when the screen is loaded directly at /connectors/new, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the form fields immediately on mount rather than gating them behind a loading state
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: navigates back to the connector-configurations list when the footer's Cancel link is clicked
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders exactly one link on the screen, the footer's Cancel, resolving to /connectors
  why: 'The last test claims more than the criterion establishes: the criterion asks that a route to the listing be offered, and the test asserts a totality over the screen''s links — exactly one, and it is that route. It holds today and breaks the day a sibling task legitimately renders a second link on this surface.'
- criterion: No connector-configuration screen renders a link whose accessible name is Back to connector configurations, in any of its phases.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
    name: renders exactly one link on the screen, the footer's Cancel, resolving to /connectors
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders exactly one link, the ready view's Cancel, during the ready phase
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders exactly one link, the footer's Cancel, during the loading phase
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders exactly one link, the footer's Cancel, during the load-error phase
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders the footer's Cancel link to /connectors while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
  why: The create screen and every phase of the detail screen are exercised — one link, and it is the footer's Cancel — so a Back to connector configurations link there would fail. But the criterion is stated over every connector-configuration screen, and the connector-configurations listing screen (its own spec is outside this set) is exercised by nothing here. Separately, the exactly-one-link assertions claim a totality the criterion does not state, which forbids one accessible name rather than every second link.
- criterion: connector-configuration-create-screen offers the operator a route to the connector-configurations listing on every reading.
  state: covered
  tests:
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the footer's Cancel link to /connectors
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the footer's Cancel link when the screen is loaded directly at /connectors/new, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
  - file: src/routes/connector-configuration-create-screen.spec.ts
    name: renders the form fields immediately on mount rather than gating them behind a loading state
- criterion: connector-configuration-detail-screen offers the operator a route to the connector-configurations listing in its loading phase, its load-error phase and its ready phase alike.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders the footer's Cancel link to /connectors while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: navigates back to the connector-configurations list when the footer's Cancel link is clicked
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: renders the footer's Cancel link when the screen is loaded directly at its own address, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this
- criterion: connector-configuration-detail-screen's loading phase states that the configuration is still being read and states no value of connector or configuration.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration is still being read and presents no connector or configuration field
  why: The still-being-read statement is exercised. The second clause is exercised only as the absence of the Connector and Configuration form fields queried by label, so a connector or configuration value stated as plain text in this phase would fail no test — and the statement the test does assert, "Loading connector configuration <connector>…", itself states a connector value taken from the address, which the criterion's own words would not admit.
- criterion: connector-configuration-detail-screen's load-error phase states that the configuration could not be read, states no value of connector or configuration, and carries an action that re-issues that same read.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: states the configuration could not be read and presents no connector or configuration field
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: issues exactly one more GET to the same connector's configuration per Retry click, never zero and never more than one
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
  why: The statement and the action re-issuing that same read are both exercised. Stating no value of connector or configuration is exercised only as the absence of the two fields queried by label; a value rendered as plain text in this phase would fail no test.
- criterion: connector-configuration-detail-screen's loading phase carries no action re-issuing the read, and no read is issued again except by the operator taking that action.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
    name: offers no Retry control while the read is outstanding
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: issues exactly one more GET to the same connector's configuration per Retry click, never zero and never more than one
- criterion: connector-configuration-detail-screen's ready phase presents the connector name and the configuration exactly as the read answered them.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders the connector's own identity and its configuration, both read from the GET this route's own hook issues
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: shows no such warning while the loaded configuration is valid JSON
- criterion: No spec under frontend/app/src/routes queries a Back to connector configurations link.
  state: uncovered
  why: This is a condition over the spec files themselves. Nothing in the set reads or asserts anything about the contents of files under src/routes, so no test in it can fail on the day a spec starts querying such a link.
- criterion: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end.
  state: covered
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: renders each given child in the order it received them
  - file: src/shared/components/button-footer.spec.ts
    name: lays its children out as a row aligned to the end
  - file: src/shared/components/button-footer.spec.ts
    name: renders without throwing and produces no buttons when given no children
- criterion: The footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled.
  state: partial
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: pins itself to the bottom of its container through CSS sticky positioning
  - file: src/shared/components/button-footer.spec.ts
    name: sits inside AppShell's own scrollable main region
  why: The pinning is exercised only as two class tokens, sticky and bottom-0, on the footer's own root in an isolated render where no stylesheet is applied. Nothing scrolls a screen's content, and nothing observes the footer's position relative to the AppShell's scrollable region while it is scrolled, so the criterion's own claim — that the footer stays visible at the bottom during a scroll — is unexercised.
- criterion: Content scrolled to its end stays fully readable above the footer rather than covered by it.
  state: partial
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: keeps to the normal document flow instead of fixed positioning, so it reserves its own space rather than covering content
  why: The one test asserts only that the footer's class list carries no fixed token. No test renders content long enough to scroll, scrolls it to its end, or checks that the last of it remains readable above the footer, so the criterion's own claim is unexercised; the test name states the consequence, which is not evidence that it holds.
- criterion: The footer sits inside the AppShell's existing `<main>` scroll region and frontend/app/src/shared/components/app-shell.tsx is left unmodified by this task.
  state: partial
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: sits inside AppShell's own scrollable main region
  why: 'That the footer''s group renders within the element with role main is exercised. Two things are not: that this main is a scroll region — nothing asserts any overflow behaviour on it — and that app-shell.tsx was left unmodified, which no runtime test in the set can fail on, since nothing here reads that file.'
- criterion: A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
  state: partial
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: still shows AppShell's own no-authentication disclosure, present and outside the footer's own group
  why: 'The test establishes that the disclosure is in the document and outside the main region, through getByText and toBeTruthy. That is presence, which is exactly what the criterion says is not enough: no assertion touches visibility, so a disclosure rendered under display:none, hidden behind the footer, or with the hidden attribute would pass.'
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/button-footer-standardization-full-scope.md
findings:
- pass: conformance
  file: src/hooks/use-capability-detail.ts
  where: the phase-selection guards, lines 121-132
  evidence: "if (query.isError || isConceptsError) {\n    return {\n      phase: \"load-error\",\n      retryLoad: () => {\n        void query.refetch();\n        conceptOptions.refetch();\n      },\n    };\n  }\n  if (query.isLoading || isLoadingConcepts || !query.data) {\n    return { phase: \"loading\" };\n  }"
  cost: A capability read that has already answered — successfully — is still shown as "could not be read" (or "still being read") whenever the unrelated concept-options list is the one that failed or has not yet answered, since both conditions are folded into the same two phases as the capability's own read state. The operator reading this screen cannot tell a capability that loaded fine but whose concept picklist failed from a capability whose own identity-keyed read failed, even though the rule requires the three presentations to be distinguishable and none of them presented as another.
  correction: Key the load-error/loading phases to query.isError/query.isLoading alone for the capability's own read, and let a concept-options failure or pending state be represented as its own, separate condition rather than folded into the capability's read-state phases.
- pass: conformance
  file: src/hooks/use-capability-form.ts
  where: the SAVE_FAILURE_MESSAGE_BY_KIND map, "incomplete-capability-contract" entry (lines 40-41)
  evidence: '"This capability does not declare its contract completely; every field of its contract is required."'
  cost: The rule this message stands for carves timeout out of what a registration must declare — "a registration that states no timeout takes the default of sixty seconds" — so an IncompleteCapabilityContractError is never about a missing timeout. Telling the operator "every field of its contract is required" states the opposite of that carve-out for the one condition this message is shown to explain, and an operator reading it has no way to learn from this surface that timeout is the one field they may leave blank.
  correction: State completeness without claiming every field is mandatory, or state the timeout default alongside it the way the rule does.
- pass: conformance
  file: src/hooks/use-connector-configuration-detail.ts
  where: isValidConfigurationObject, lines 15-22
  evidence: "function isValidConfigurationObject(text: string): boolean {\n  const minified = getJsonTextareaMinifiedValue(text);\n  if (minified === null) {\n    return false;\n  }\n  const parsed: unknown = JSON.parse(minified);\n  return typeof parsed === \"object\" && parsed !== null && !Array.isArray(parsed);\n}\n"
  cost: 'The object/null/array distinction that defines a well-formed connector configuration — the substance rules/integration/a-connector-configuration-holds-a-well-formed-object states for the registry''s own refusal — is hand-encoded here as a client-side gate that decides whether the operator may even submit. If the specification''s definition of well-formed ever moves (what counts as an object, whether null or an array is ever admitted), nothing forces this predicate to move with it: the client would go on admitting or blocking submissions on a criterion the node no longer states, silently diverging from the registry it is supposed to pre-empt.'
  correction: Derive the well-formedness check from one place shared with the specification's own statement of it (or drop the client-side well-formedness gate entirely and let the registry's own refusal, surfaced through saveFailureMessage, be the one place that judges it), rather than re-deriving the object/null/array distinction in this hook.
- pass: conformance
  file: src/hooks/use-connector-configuration-form.ts
  where: '`isValidConfigurationObject` (lines 15-22) and the `configurationValid` gate inside `submit` (lines 96-102)'
  evidence: return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  cost: the registry's own definition of a well-formed connector configuration — an object, never null, never an array — is re-derived here as the frontend's own authoritative gate before the registry ever sees the value; if the registry's own definition of well-formed ever moves (say, to accept an array), nothing here follows it, and this gate keeps refusing what the registry would now accept, with no single place left to read the current definition from
  correction: stop treating this local object/non-null/non-array check as the authoritative definition of well-formed — let the registry's own 422 answer be the one place that judgment is made, and keep this check, if kept at all, as a non-authoritative aid
- pass: conformance
  file: src/hooks/use-connector-configuration-form.ts
  where: '`SAVE_FAILURE_MESSAGE_BY_KIND` (lines 42-45) and `saveFailureMessage` (lines 47-53)'
  evidence: "const SAVE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {\n  \"connector-configuration-not-well-formed\":\n    \"This configuration is not syntactically valid JSON.\",\n};"
  cost: '`rules/integration/a-connector-configuration-holds-a-well-formed-object` (also this file''s own node) names two distinct refusal conditions for this same registration — a configuration that is not well-formed JSON object text, and one that is entirely absent or of the wrong shape (`IncompleteConnectorConfigurationError`) — but only the first gets its own message; an operator refused for the second falls through `saveFailureMessage` to `GENERIC_SAVE_FAILURE_MESSAGE`, the exact same text shown for a refusal this surface does not recognise at all, so the two named conditions the operator-facing rule requires be told apart read alike here'
  correction: give the incomplete-configuration condition its own distinguishable message in this map (which requires a distinct kind carried up from the error mapping), rather than letting it collapse into the same bucket as an unrecognised refusal
- pass: conformance
  file: src/hooks/use-manifest-pinned-revision-states.ts
  where: '`hasReadableHypothesisName` and the `readableEntries` filter it drives, lines 12-14 and 20-49'
  evidence: "function hasReadableHypothesisName(entry: CaseVersionManifestEntry): boolean {\n  return typeof entry.hypothesis_revision?.hypothesis?.name === \"string\";\n}\n...\nconst readableEntries = manifest.filter(hasReadableHypothesisName);\n...\nreadableEntries.forEach((entry, index) => {\n  states.set(\n    entry.position,\n    pinnedRevisionStateOf(...),\n  );\n});\nreturn states;\n"
  cost: A manifest entry whose `hypothesis_revision.hypothesis.name` does not read back as a string never gets an entry in the returned map at all — no `pending`, no `failed`, no `resolved` — so whatever renders the manifest keyed off this map shows that entry with nothing, which is exactly the blank the node refuses ("none of them is the presentation of an entry that carries no state"). The next reader who wants to know what governs an entry with an unreadable hypothesis reference will look in the specification and find no such carve-out.
  correction: Compute a state for every manifest entry unconditionally — where the hypothesis reference itself cannot be read, state that explicitly (a failed read) rather than omitting the entry from the map.
- pass: conformance
  file: src/hooks/use-new-draft-version-form.ts
  where: the useEffect syncing the create form from the source-version query, lines 90-94
  evidence: "useEffect(() => {\n    if (sourceVersionQuery.data) {\n      resetFormFrom(createForm, sourceVersionQuery.data);\n    }\n  }, [sourceVersionQuery.data]);"
  cost: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version names one starting move for a new draft — copying its manifest — and its own description calls creating a draft "never a second decision about what the draft starts holding." Here a curator opening the create form for a case that already holds a released version finds title, when-to-use, subject, fallback and even the consolidation register already filled in with that released version's own content before they have touched anything. Nothing in the node, or anywhere else in the specification, says a new draft's own declared attributes begin as a copy of a prior version — only its manifest does — so a reader who checks that node to learn what a new draft starts holding learns about the manifest alone and has no way to learn the rest of the form arrives pre-written too.
  correction: either stop copying the create form's non-manifest fields from the source version (leaving only the manifest copied, server-side, as the node states), or have the analysis decide and record in the specification that a new draft's own declared attributes also start as a copy of the source version's.
- pass: conformance
  file: src/hooks/use-new-draft-version-form.ts
  where: the createMutation request-body construction, lines 113-129
  evidence: "...(latestReleasedVersionNumber !== undefined\n          ? {\n              consolidation_register: values.consolidation_register,\n              source_version: latestReleasedVersionNumber,\n            }\n          : {}),"
  cost: domain/knowledge/case-version declares consolidation_register as an attribute a case version may carry, with no stated condition on when it may be authored, and the decision log records it as "not required" full stop. Here, a curator authoring a case's very first version — the one case a-new-drafts-manifest-is-copied-from-an-existing-version names no source for — has any consolidation register they chose on the form silently dropped before the request is sent, with nothing telling them so. A reader of domain/knowledge/case-version or domain/knowledge/consolidation-register finds no rule tying this attribute's presence to a prior released version existing.
  correction: 'send `consolidation_register: values.consolidation_register` unconditionally, independent of latestReleasedVersionNumber — or have the analysis decide, and record in the specification, that a case''s first-ever version may not declare a consolidation register.'
- pass: conformance
  file: src/routes/capability-create-screen.tsx
  where: the three `Cancel` links (loading phase line 35, load-error phase line 48, ready phase line 64)
  evidence: <Link to="/capabilities">Cancel</Link>
  cost: an operator who opened this create screen from anywhere other than the capabilities listing — a capability's own detail surface, say, once such a link exists, or a direct navigation — is sent to the listing on Cancel rather than back to where they came from; the decision log records this exact value (returning to the listing) as an earlier reading of this same node that was replaced because it privileged the listing over the reached-from surface, and the code reintroduces precisely that replaced value with no way to recover the original surface.
  correction: make Cancel return to the surface the create screen was reached from (the pattern already used elsewhere in this codebase via the router's own history, e.g. in use-new-draft-version-form.ts and use-hypothesis-revision-form.ts), and, if a standalone route to the listing is still wanted to satisfy the separate listing-route rule, offer it as its own control rather than folding both destinations into one link to /capabilities.
- pass: conformance
  file: src/routes/capability-form-fields.tsx
  where: the help paragraph beneath the Output schema field, lines 183–186
  evidence: Para cada campo em <code>properties</code>, a plataforma lê seu próprio{" "} <code>type</code> e <code>description</code> como o significado declarado desse campo — nenhum outro conteúdo deste schema é lido ou validado.
  cost: Which two attributes of a properties entry are read as a field's declared meaning, and that nothing else in the output schema is read or validated, is domain/investigation/field-semantics' own statement; it now also lives, translated, as hardcoded copy inside this form component. If that node is ever amended — a third attribute read, or the "no other content" boundary narrowed or widened — nothing rebinds this paragraph, and every operator who opens this screen keeps being told the rule as it stood before the change.
  correction: Remove this restatement of field-semantics from the component (or replace it with a pointer to documentation rather than the rule's own words), leaving the fact held only by domain/investigation/field-semantics.
- pass: conformance
  file: src/routes/capability-form-fields.tsx
  where: the same help paragraph, lines 186–190
  evidence: Uma description declara o que um valor significa (&quot;2 = suspenso por inadimplência&quot;), nunca uma decisão (&quot;quando 2, confirme a hipótese&quot;).
  cost: rules/glossary/a-description-states-meaning-never-policy states this same distinction with this same worked example ("2 = suspended for delinquency" / "when 2, confirm the financial-block hypothesis"); the component now carries a translated copy of both the policy and its example. A later change to the node's own wording or example leaves this paragraph exactly as it is, so the two can read apart from the day the node is next edited, with the UI still teaching the retired version.
  correction: Drop the restated policy and example from the component; if operator-facing guidance is wanted at all, phrase it without repeating the node's own words or example.
- pass: conformance
  file: src/routes/case-version-editor-ready-view.tsx
  where: the CONFLICT_BANNER_TITLE / CONFLICT_BANNER_MESSAGE constants (top of file) and their use at `state.status === "conflict"`
  evidence: "const CONFLICT_BANNER_TITLE = \"This version was released by someone else\";\nconst CONFLICT_BANNER_MESSAGE =\n  \"Your changes were not saved. Reload to see the current state, or start a new draft.\";\n...\n{state.status === \"conflict\" && (\n  <ConflictBanner title={CONFLICT_BANNER_TITLE} message={CONFLICT_BANNER_MESSAGE} />\n)}\n"
  cost: The specification states that a lifecycle operation asked of a version no longer in draft is refused (a-case-version-moves-through-its-declared-lifecycle), but it never says what a curator submitting an edit against a version somebody else just released is told, or what recovery is offered. This file decides both — that the cause is named as "released by someone else" and that the offered way forward is to reload or "start a new draft" — as hard-coded copy. A reader who wants to know what the system tells a curator in this situation, or whether starting a new draft is the sanctioned recovery, finds it only here; a later change to what can produce a "conflict" status (e.g. a concurrent discard, not a release) would leave this copy silently naming the wrong cause with no node to catch the disagreement.
  correction: State, alongside a-case-version-moves-through-its-declared-lifecycle or as a sibling surface policy, what a curator editing a draft is told when the save is refused because the version no longer stands in draft, and what recovery the specification intends (reload, start a new draft, or something else).
- pass: conformance
  file: src/routes/connector-configuration-detail-ready-view.tsx
  where: the justSaved status message, lines 82-87
  evidence: "{state.justSaved && (\n\n        <p role=\"status\" className=\"text-sm text-foreground\">\n          Saved.\n        </p>\n      )}"
  cost: An operator who just submitted a replacement registration is told only "Saved." — nothing here names the connector name that now stands registered, and this file states no distinguishable message for a refused submission at all, so an operator relying on this surface cannot tell what was registered nor, on a failure, which condition answered it; they would have to reload or reread the registry to be sure the write they intended is the write that happened.
  correction: State, alongside the success confirmation, the connector name the submission registered, and render a distinguishable statement for a refused submission naming the condition the registry answered.
- pass: conformance
  file: src/routes/connector-configuration-detail-ready-view.tsx
  where: the Cancel control, lines 88-90
  evidence: "<Button variant=\"secondary\" asChild>\n        <Link to=\"/connectors\">Cancel</Link>\n      </Button>"
  cost: An operator who reached this authoring surface from anywhere other than the connectors listing — for instance immediately after a successful registration, which a-successful-connector-registration-lands-on-the-configurations-own-surface lands them on this very surface for — is sent to the fixed /connectors listing rather than back to where they came from, losing the place they were working from with no way back except constructing the address themselves.
  correction: Return the operator to the surface the authoring was reached from rather than a hardcoded /connectors destination.
- pass: conformance
  file: src/routes/connector-configuration-detail-screen.tsx
  where: the ready-state return (lines 41-46), the branch taken once the read has answered
  evidence: "return (\n    <section className=\"flex flex-col gap-4\">\n      <h1 className=\"text-lg font-semibold text-foreground\">Connector {connector}</h1>\n      <ConnectorConfigurationDetailReadyView state={state} connector={connector} />\n    </section>\n  );"
  cost: The node requires the route to the listing on every reading of the surface, turning on nothing about whether the read has completed, failed or answered no configuration — yet the loading branch (line 18) and the load-error branch (line 34) each carry a `<Link to="/connectors">Cancel</Link>` inside a `ButtonFooter`, and this ready branch, the one an operator reaches on a successful read, carries none. `connector-configuration-detail-ready-view.tsx` is not among the files the trace binds this node to, so the responsibility for this reading is this file's own. An operator who opens a configuration successfully is left with no stated way back to the listing, unlike the same operator on either of the surface's other two readings.
  correction: render the same route to the listing (a Cancel link, or any other control reaching "/connectors") in the ready-state branch that the loading and load-error branches already carry.
- pass: conformance
  file: src/routes/connector-configuration-detail-screen.tsx
  where: the loading branch, line 15
  evidence: <p>Loading connector configuration {connector}…</p>
  cost: The node's expression states that while the read has not returned the screen "states no value of connector or configuration" — the sibling capability rule (`a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed`) explicitly permits an outstanding-read message to name the identity being read ("the capability at (n, v) is still being read"), but this node's own text carries no equivalent allowance and instead states the prohibition flatly. Here the connector's own name — one of exactly two attributes `domain/integration/connector-configuration` declares — is asserted in the loading message before the registry has answered whether any configuration is registered under it at all, which is exactly the value this window is stated to withhold.
  correction: state that a configuration is being read without naming the connector value in that sentence (e.g. "Loading connector configuration…"), consistent with the load-error branch, which already states no connector or configuration value.
- pass: conformance
  file: src/routes/connector-configuration-form-fields.tsx
  where: the connector name Input, line 71
  evidence: disabled={isEditingIdentity || isSubmitting}
  cost: the code decides that once an existing connector configuration is loaded for editing, the operator can never change the connector name it is registered under from this surface — a restriction on what the operator may do with a value object's own identity that the specification, thorough elsewhere about this identity (register-connector's create-or-replace keyed on the name, the surfaces addressed by that name, abandonment and discard around it), never states; a reader wanting to know whether renaming a connector configuration through its edit surface is possible has to read this component instead of the specification
  correction: a node constraining domain/integration/connector-configuration (or a policy alongside the other connector-configuration surface rules) would have to state whether an operator editing an existing registration may change the connector name it is registered under
- pass: conformance
  file: src/routes/capability-create-screen-actions.spec.ts
  where: the second `it` block, lines 30-44 (`navigates to the capabilities listing when Cancel is clicked, issuing no PUT`)
  evidence: await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  cost: rules/integration/an-abandoned-capability-registration-entry-registers-nothing requires the abandoned entry's operator to land on "the surface the authoring entry was reached from" and says explicitly that landing on the listing instead "would be wrong on exactly the readings that matter" for an operator who reached the create screen from anywhere other than the listing — the decision log even records an earlier draft of this same rule that fixed the destination to the listing being replaced for exactly that reason. This test locks the suite's certification of Cancel's abandonment behavior to a fixed "/capabilities" pathname regardless of origin, so a reader trusting the suite to enforce the specification's return-to-origin rule finds instead a green test for the destination the specification's own history already rejected.
  correction: Mount the create screen from a non-listing origin (or otherwise track the surface the authoring was reached from) and assert Cancel returns the operator there, rather than asserting a fixed "/capabilities" pathname for every abandonment.
- pass: conformance
  file: src/routes/capability-create-screen-outcome.spec.ts
  where: the second `it` block, lines 58-61 (the `waitFor` on the Save button's `disabled` attribute)
  evidence: 'expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true)'
  cost: the requirement that the Save control disables while a capability registration is in flight lives only in this assertion; a reader checking the specification for what a submitting surface must do before the registry answers finds this question explicitly marked undecided in the decision log for the governing rule, so the next reader who looks in the specification for this behavior does not find it there
  correction: either add the pending-state disclosure/control-disabling behavior as its own decided fact (e.g. extending rules/integration/a-submitted-registration-states-its-outcome-to-the-operator, whose own decision log entry names this as 'not decided here'), or drop the assertion and rely only on the synchronization the test actually needs
- pass: conformance
  file: src/routes/capability-create-screen-save.spec.ts
  where: the two tests inside the 'blocks dispatch while a declared schema is not valid JSON' describe block, lines 74-94
  evidence: 'expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(putCallCount(fetchMock)).toBe(0);

    '
  cost: 'The specification''s own statement on malformed schemas — rules/integration/a-capability-declares-well-formed-schemas — is entirely about the registry: ''The registry refuses to register or update a capability whose input schema or output schema is not syntactically valid JSON, with an HTTP 422 response.'' Nothing in the specification says the operator is blocked from ever submitting such text. This test instead pins a client-side gate (Save disabled, zero PUT calls dispatched) as the required behavior. A reader who wants to know when Save is unavailable will read the well-formed-schemas rule and find only a server-side 422 refusal — the client-side block this test locks in as fact lives nowhere they will look, and a later change relying on the registry''s own refusal (per a-submitted-registration-states-its-outcome-to-the-operator) instead of a client-side gate would fail this test against a rule the specification never wrote.'
  correction: State, in rules/integration/a-capability-declares-well-formed-schemas or a sibling rule, whether an authoring surface must withhold submission of unparseable schema text before the registry is ever called, or drop the disabled-button/zero-dispatch assertions and test only the registry's own 422 refusal path already covered by a-submitted-registration-states-its-outcome-to-the-operator.
- pass: conformance
  file: src/routes/capability-create-screen-save.spec.ts
  where: line 114, inside the 'a concept-already-answered refusal is reported without leaving the screen' test, lines 97-117
  evidence: expect(router.state.location.pathname).toBe("/capabilities/new");
  cost: 'rules/integration/a-submitted-registration-states-its-outcome-to-the-operator''s own Description says exactly the opposite of a decided fact here: ''What follows a stated outcome is no part of this: where the surface goes after a registration was made, whether it stays, reloads or leaves, is not decided here.'' No sibling rule fills that gap for a refused submission the way a-successful-capability-registration-lands-on-the-capabilitys-own-surface fills it for a successful one. This test nonetheless locks the operator''s post-refusal destination to the create route as a hard requirement — a future change that reloads or redirects on a named refusal (something no node forbids) would fail this test on a question the specification explicitly leaves open, and nobody reading the specification would learn this screen must stay put on a refusal.'
  correction: Add an invariant naming where an operator lands after a refused capability (or connector) registration — e.g., that the authoring surface is unchanged — the same way a-successful-capability-registration-lands-on-the-capabilitys-own-surface names the destination for a successful one; or drop the pathname assertion if this destination is not meant to be a decided fact.
- pass: conformance
  file: src/routes/capability-create-screen.spec.ts
  where: the describe blocks "a loading state while the concept vocabulary is pending (criterion 6)" and "a failure state offering a retry when the concept vocabulary fails to load (criterion 7)", lines 103-157
  evidence: 'expect(await screen.findByText("Loading…")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    ...

    expect(await screen.findByText("Unable to load concepts.")).toBeTruthy();

    expect(screen.queryByLabelText("Concept")).toBeNull();

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();

    ...

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByLabelText("Concept")).toBeTruthy();

    '
  cost: The specification already refuses this exact shape — a pending read, a failed read and an answered read reading alike, with the failed one recovered only by the operator's own act — four separate times, for four separate reads (a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed, a-presented-connector-configuration-states-an-outstanding-or-failed-read, a-draft-versions-content-is-presented-only-from-its-own-record, a-presented-manifest-entry-states-its-pinned-revisions-state), and each time as a business decision, not an engineering default. This test pins the identical three-window disclosure and manual-retry discipline for a new read — the concept vocabulary backing capability authoring — that none of those rules, and no other node, names. A reader of the specification who wants to know whether this read is owed a pending statement, a failure statement, and an operator-triggered retry (as opposed to silence, an auto-retry, or a blank interval) will not find that decision anywhere but in this test and the component it locks down.
  correction: A node constraining the concept-vocabulary read (mirroring the shape of a-presented-connector-configuration-states-an-outstanding-or-failed-read, but over domain/glossary/concept's list read) would need to be added to the specification, deciding that this screen states a pending read, states a failed read with a retry the operator alone triggers, and never conflates either with an answered read.
- pass: conformance
  file: src/routes/capability-detail-screen-outcome.spec.ts
  where: the PUT handler stub for CAPABILITY_PATH, lines 26-28
  evidence: "method === \"PUT\"\n            ? errorResponse(\"CapabilityNotReadOnlyError\", 409)"
  cost: A reader treating this fixture as a working example of the registry's own read-only refusal learns that CapabilityNotReadOnlyError answers with HTTP 409; the decision log fixes this refusal at HTTP 422 (rules/integration/a-capability-is-read-only, and decision-log.md's own split — 422 for "a well-formed request whose content would violate an invariant," 409 reserved for "an operation the target's current standing forbids"). Anyone building a mock server, a contract test, or a status-map change against this file's own fixture would embed the wrong status for this exact refusal.
  correction: the fixture's second argument to errorResponse for CapabilityNotReadOnlyError should read 422, matching the node's own statement
- pass: conformance
  file: src/routes/capability-detail-screen.spec.ts
  where: the describe block "a route to the listing is offered even for an identity nothing is registered at (task's own UNDERDETERMINED note)", its one test, lines 73-86
  evidence: "const fetchMock = createFetchStub({\n  [CAPABILITY_PATH]: () => errorResponse(\"CapabilityIdentityNotFoundError\", 404),\n});\nawait mountCapabilityDetailScreen(fetchMock);\n\nawait screen.findByRole(\"button\", { name: \"Retry\" });\n"
  cost: 'rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed is the one node that ever puts a reattempt control on this surface, and its own expression carves this exact refusal out of that window: "the registry''s own refusal of an identity no capability is currently registered at excepted, that refusal being its own answer and not this window." This test locks a "Retry" control onto precisely the refusal the node excepts, and the test''s own title concedes the point ("task''s own UNDERDETERMINED note") rather than citing a node that settles it. A future reader checking what the specification says an operator sees when the identity itself is unregistered finds only an exception, never a presentation to point at, while the running suite now locks in one anyway.'
  correction: Decide, in the specification, what a capability-identity-keyed surface presents when the registry refuses read-capability-by-identity because the name and version are unregistered — whether that reuses the reattempt-carrying failed presentation or is a distinct presentation of its own — and record the decision (and its reasoning) rather than leaving the render locked in by this test alone.
- pass: conformance
  file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  where: the it block "states the manifest-pin condition as Met, vacuously, for a manifest holding no entry (this task's own inference)", lines 55-65
  evidence: '[`GET ${VERSION_PATH}`]: () => jsonResponse({ ...DRAFT_RECORD, manifest: [] }),

    ...

    expect(within(region).getByText(`Met: ${CONDITION_TEXT}`)).toBeTruthy();'
  cost: The test stubs the version's own read endpoint to succeed with a 200 payload carrying an empty manifest, and asserts the screen renders that as an ordinary draft whose manifest-pin condition reads Met. `rules/knowledge/a-case-has-at-least-one-hypothesis` holds `manifest` to at least one entry, `rules/knowledge/validation-runs-at-every-read` makes every stored version — draft or released — read as a case only while every such validator rule holds at that reading, and `rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name` states that a read naming a version failing one of those rules is refused with an HTTP 409 CaseVersionNotValidError rather than answered at all. This test locks in, as passing behavior, a read the specification says can never succeed with this content — a maintainer trusting the suite would believe an empty-manifest draft is a reachable, normally-rendered state, and code written to keep this test green would be normalizing a read the domain refuses outright.
  correction: Either remove this scenario (the state it fixtures — a successful 200 read of a version whose manifest holds no entry — cannot occur per the specification) or restate the fixture as the refusal `a-case-version-failing-validation-at-a-read-is-refused-by-name` describes, and test whatever the screen does with a failed/invalid read instead of asserting a Met checklist over it.
- pass: conformance
  file: src/routes/case-version-editor-screen-release-control.spec.ts
  where: it("disables the Release trigger while a Save to the same version is in flight", ...), lines 51-74
  evidence: "expect(screen.getByRole(\"button\", { name: \"Release…\" }).hasAttribute(\"disabled\")).toBe(\n        true,\n      );"
  cost: The rule that the Release trigger is withheld for the whole span of an in-flight Save to the same version lives only in this assertion; nothing in the specification says these two acts overlap this way, so a reader checking the specification for what a curator may do while a save is pending finds nothing, and a future change dropping the disablement breaks no rule the specification states.
  correction: state, alongside the release-offering rules already in the specification, whether and how a pending update-draft withholds the release act.
- pass: conformance
  file: src/routes/case-version-editor-screen-release-control.spec.ts
  where: it("disables the Dialog's own Cancel control while a confirm is in flight", ...), lines 106-126
  evidence: expect(releaseCancelButton().hasAttribute("disabled")).toBe(true);
  cost: Withholding Cancel for the duration of the confirmed release's own call is a rule this test enforces and no node states; a reader looking to `releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act` for what a curator may do while that further act is outstanding finds nothing about Cancel, so the behavior can drift silently.
  correction: state, alongside rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act, whether the Cancel act stands available or withheld while the confirmed act's own call is in flight.
- pass: conformance
  file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  where: '"a 200 response to Release (criterion 5)" — lines 60-77'
  evidence: "expect(screen.queryByRole(\"button\", { name: \"Release…\" })).toBeNull();\nexpect(screen.getByLabelText(\"Title\").hasAttribute(\"disabled\")).toBe(true);\nexpect(screen.getByRole(\"button\", { name: \"Save changes\" }).hasAttribute(\"disabled\")).toBe(\n  true,\n);\n"
  cost: The specification's own case-version node says the record is never altered again once released, but nothing in the specification says the editor surface must hide the Release control and disable every field and Save the moment a release succeeds — the withholding pattern the specification does state (rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives) covers only the interval before a new draft's record has arrived, not the far end of the lifecycle. A reader who wants to know what a released version's editor screen offers will find that answer only in this test and the component it exercises, never in the specification.
  correction: A rule (or an extension of a-newly-created-draft-offers-no-act-before-its-own-record-arrives's sibling shape) stating what acts a released case version's editor surface offers — none of release, discard, correction or save — would give this behavior a specification home.
- pass: conformance
  file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  where: '"a 409 CaseVersionNotDraftAtReleaseError response (criterion 7)" — lines 140-164'
  evidence: "it(\"closes the Dialog and re-fetches the version rather than showing a violations list, resetting for the next open\", async () => {\n...\n  await waitFor(() => expect(screen.queryByRole(\"dialog\")).toBeNull());\n  await waitFor(() => expect(versionGetCallCount(fetchMock)).toBe(2));\n"
  cost: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle states only the backend's refusal shape for this condition — HTTP 409 reporting CaseVersionNotDraftAtReleaseError — and says nothing about what the editor screen does in response. This test states a specific recovery behavior (the dialog is dismissed and the version is silently re-fetched) that no node governs; the next reader who wants to know what a curator sees when their release attempt turns out stale has nowhere in the specification to look, only this test and its implementation.
  correction: A rule stating what a case-version editor surface does when a release it submitted is refused as CaseVersionNotDraftAtReleaseError — closing the offer and refreshing the surface's own read, as opposed to showing a refusal message — would give this its specification home.
- pass: conformance
  file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  where: '"a Release failure outside 409 and 422" — lines 195-214'
  evidence: "it(\"leaves the Dialog open with no violations shown and the confirm control usable again\", async () => {\n...\n  await waitFor(() => {\n    expect(releaseConfirmButton().hasAttribute(\"disabled\")).toBe(false);\n  });\n  const dialog = screen.getByRole(\"dialog\");\n  expect(within(dialog).queryByRole(\"alert\")).toBeNull();\n});\n"
  cost: constraints/a-domain-error-unmapped-by-status-is-refused-generically fixes only the backend's generic refusal shape (HTTP 500, INTERNAL_ERROR, the fixed message); rules/integration/a-submitted-registration-states-its-outcome-to-the-operator states an analogous 'operator is told the outcome' rule for capability and connector-configuration registrations but is expressly scoped to those two registries, not to case-version release. No node states what a case-version release's own surface does when a submission fails outside 409 and 422 — this test states that specific recovery contract (dialog stays open, no violations rendered, confirm re-enabled) as though it were decided, and it lives only here and in the implementation.
  correction: A rule stating what a case-version release's surface does on a refusal it does not recognise as 409 or 422 — leaving the dialog open with the confirm control usable again, as this test asserts — would give the fact a specification home, the same way a-submitted-registration-states-its-outcome-to-the-operator does for the two registries.
- pass: conformance
  file: src/routes/connector-configuration-create-screen-outcome.spec.ts
  where: the second `it`, lines 55-58 ("shows no success statement while the registration is still pending")
  evidence: 'expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true)'
  cost: 'the test pins a specific behavior of the create screen while a submission is outstanding -- the Save control going disabled -- as a requirement any implementation must satisfy to pass the suite. The specification''s own decision log for rules/integration/a-submitted-registration-states-its-outcome-to-the-operator lists this exactly, in these words: "Not decided here: what the surface presents while the submission is in flight...". A reader who later wants to know what a connector-configuration create screen may show while a registration is outstanding will look in the specification, find it explicitly left open, and have no way to learn that this test already requires an answer.'
  correction: either drop the disabled-attribute assertion (leaving only the toast.success timing check the node does cover), or have the fact decided into the specification -- filling a-submitted-registration-states-its-outcome-to-the-operator's own stated gap, or a new node -- before a test asserts it as behavior owed.
- pass: conformance
  file: src/routes/connector-configuration-create-screen.spec.ts
  where: describe title, line 91
  evidence: '"ConnectorConfigurationCreateScreen -- the footer Cancel link registers nothing before it navigates (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing leaves open whether the route submits before landing on the listing)"'
  cost: A reader trusting this note believes the specification leaves the submit-then-navigate ordering of the Cancel route undetermined, when the node it names already forecloses it in full — "Following that route from s issues no register-connector call and leaves every registered connector configuration exactly as it stood" is unconditional, not partial. A later change made on the strength of this comment could reintroduce a register-connector call ahead of navigation, believing an open question is being resolved rather than a settled one being broken.
  correction: Remove or correct the "UNDERDETERMINED" framing in the describe title; the named node already settles that the route issues no register-connector call, in either order.
- pass: conformance
  file: src/routes/connector-configuration-create-screen.spec.ts
  where: describe title, line 116
  evidence: '"ConnectorConfigurationCreateScreen -- carries no discard control (UNDERDETERMINED note: no criterion distinguishes which controls the shared footer carries on the create screen)"'
  cost: A reader trusting this note believes the specification leaves open whether the create screen's shared footer carries a "Discard changes" control, when the node governing that exact act already forecloses it for this surface — "d is offered on no surface authoring a registration at an identity nothing is currently registered at ... those surfaces holding no read registration for d to return the fields to." A future edit could add the control back to the create screen believing it fills an undecided gap rather than violates a settled exclusion.
  correction: Remove or correct the "UNDERDETERMINED" framing; the node already distinguishes the create/authoring surface (holding no read registration) from a surface that loaded a registration, and excludes the discard-edit act from the former.
- pass: conformance
  file: src/routes/new-case-draft-screen-cancel.spec.ts
  where: describe block "Cancel on a not-yet-created draft returns to the screen it was opened from (criterion 3)", lines 67-92 (both its tests)
  evidence: "fireEvent.click(await screen.findByRole(\"button\", CANCEL_BUTTON));\n\nawait waitFor(() => {\n  expect(router.state.location.pathname).toBe(openedFrom);\n});\n...\nfireEvent.click(screen.getByRole(\"button\", CANCEL_BUTTON));\n\nexpect(postCallCount(fetchMock)).toBe(0);\n"
  cost: The rule enforced here — that canceling out of the new-case-draft screen before create-draft has ever been called returns the curator to the screen the screen was opened from, rather than a fixed destination, and issues no create-draft/POST call — lives only in this test. The four abandonment rules the specification does state (rules/knowledge/an-abandoned-case-version-edit-writes-nothing, rules/knowledge/an-abandoned-revision-composition-writes-nothing, rules/integration/an-abandoned-capability-registration-entry-registers-nothing, rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering) each govern a different act — editing content that already exists, or an entry/composition already opened toward a write that already exists to abandon — never the composition of a not-yet-created case version through create-draft. A reader who checks the specification for what an abandoned new-draft composition costs will not find it decided anywhere but here, and a later change to this navigation or to whether Cancel is wired to issue the call at all would have nothing in the specification to answer to.
  correction: Decide, through the analysis (blind to the task, as the framework's unstated-fact route requires), a rule for abandoning a not-yet-submitted case-version composition — parallel in shape to rules/knowledge/an-abandoned-revision-composition-writes-nothing — stating that leaving before create-draft is called issues no create-draft call and returns the curator to the surface the composition was opened from, and record it in decision-log.md the way the sibling abandonment rules were recorded.
- pass: conformance
  file: src/shared/components/button-footer.spec.ts
  where: the it block "still shows AppShell's own no-authentication disclosure, present and outside the footer's own group", lines 109-117
  evidence: "expect(within(mainRegion).queryByText(\"No auth in this build\")).toBeNull();\n      expect(screen.getByText(\"No auth in this build\")).toBeTruthy();"
  cost: The node holds that the disclosure's substance — telling every user, on every screen, that this build enforces no authentication — is the fact, and states explicitly that "the exact copy is the frontend's own to choose and free to change without this statement moving." This test pins that exact literal string as a pass/fail condition, so a wording change the node explicitly permits (e.g. rephrasing the notice) breaks this suite even though the specification's actual requirement — the substance disclosed on every screen — still holds; the next person who touches that copy has to also chase down this test rather than reading the node and trusting it says the whole story.
  correction: Assert on the presence of some non-authentication disclosure surfaced by AppShell (by role, test id, or a semantic marker naming the concept), rather than on the literal copy "No auth in this build", so the exact wording stays free to change without the test moving.
- pass: standard
  file: src/hooks/use-capability-detail.ts
  where: the `useEffect` at lines 59-77, keyed to `[query.data]`
  evidence: "setInputSchemaValue(query.data.input_schema);\n\n      setInputSchemaValid(getJsonTextareaMinifiedValue(query.data.input_schema) !== null);\n      setInputSchemaBaseline(query.data.input_schema);\n      setOutputSchemaValue(query.data.output_schema);\n      setOutputSchemaValid(getJsonTextareaMinifiedValue(query.data.output_schema) !== null);\n      setOutputSchemaBaseline(query.data.output_schema);\n    }\n  }, [query.data]);\n"
  cost: Every successful refetch of this capability (for instance the invalidateQueries this same hook fires after a save) re-runs the effect and overwrites inputSchemaValue/outputSchemaValue again from query.data; the schema text now lives in two places -- the query cache and this local state -- and only this effect keeps them aligned, so a refetch that races an in-progress edit is a place the two can disagree with nothing left to notice it.
  cites: STA-01
  correction: Read query.data.input_schema/output_schema where the textarea needs the loaded value instead of copying it into its own state kept in sync by an effect, or confine the effect strictly to first-load initialization rather than every query.data change.
- pass: standard
  file: src/hooks/use-edit-draft-version-form.ts
  where: the `ready` member of `EditDraftVersionFormState`, lines 48-57
  evidence: "readonly release?: ReleaseControlState;\n\n      readonly discard?: DiscardControlState;\n\n      readonly isFirstVersion?: boolean;\n\n      readonly isReadOnly?: boolean;\n\n      readonly manifest?: readonly CaseVersionManifestEntry[];\n    };\n"
  cost: useEditDraftVersionForm's ready state carries isReadOnly/manifest/release/discard but never isFirstVersion, while useNewDraftVersionForm's ready state (same file's use-new-draft-version-form.ts) carries isFirstVersion but never the other four; both satisfy this one type, so nothing stops a caller, or a future edit to either hook, from returning a ready value that mixes isFirstVersion with a release control -- a combination CaseVersionEditorReadyView was never written to expect, and the compiler has no way to refuse it.
  cites: TYP-04
  correction: Split the ready phase into two discriminated members (e.g. an editing shape carrying release/discard/manifest/isReadOnly and a creating shape carrying isFirstVersion) instead of one shape with five optional fields.
- pass: standard
  file: src/routes/capability-create-screen.tsx
  where: the `state.phase === "load-error"` branch, lines 40-42
  evidence: "{state.phase === \"load-error\" && (\n        <section>\n          <p>Unable to load concepts.</p>\n"
  cost: When the concept-vocabulary read fails after the loading phase, the screen swaps from the loading paragraph to this failure paragraph with no aria-live region and no focus moved onto it; a screen-reader user who isn't watching the page has no way to learn the load failed, only a sighted user watching the swap notices it.
  cites: ACC-07
  correction: Give the failure paragraph role="alert" (or place the load-error section in a live region), or move focus onto it once the phase becomes load-error.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: lines 81-82, `isSaveDisabled`
  evidence: "const isSaveDisabled =\n  isSubmitting || !inputSchema.isValid || !outputSchema.isValid || isDirty === false;\n"
  cost: The rule for when Save may be pressed -- submitting, either schema invalid, or nothing changed -- is written directly in this component's render body rather than named anywhere; connector-configuration-form-fields.tsx restates its own version of the same rule (submitting, configuration invalid, or nothing changed) inline instead of calling a shared function, so the two forms can silently diverge the next time either gate needs to change.
  cites: ARC-03
  correction: Move the disabled-state decision into a named function (in a hook or service, alongside JsonSchemaFieldState/ConfigurationFieldState) that both form-fields components call.
- pass: standard
  file: src/routes/connector-configuration-form-fields.tsx
  where: line 64, `isSaveDisabled`
  evidence: 'const isSaveDisabled = isSubmitting || !configuration.isValid || isDirty === false;

    '
  cost: This is the second, independently written copy of the same disabled-state rule capability-form-fields.tsx already computes inline; a future change to when Save should be blocked (e.g. a new blocking condition) has two call sites to remember and update, not one shared one.
  cites: ARC-03
  correction: Call the same named disabled-state function capability-form-fields.tsx should expose, rather than recomputing an equivalent condition here.
- pass: standard
  file: src/routes/hypothesis-revision-screen.tsx
  where: the `state.phase === "success"` branch, lines 37-41
  evidence: "return (\n      <section>\n        <p>\n          Hypothesis &quot;{state.hypothesisName}&quot; saved as revision {state.revision}.\n        </p>\n"
  cost: Submitting the form swaps the whole section from the composing form to this outcome statement with no aria-live region and no focus management; a screen-reader user gets no announcement that the save succeeded, unlike this same codebase's own capability/connector 'Saved.' text elsewhere, which is marked role="status".
  cites: ACC-07
  correction: Mark the success paragraph role="status" (or otherwise place it in a live region), or move focus onto it once the phase becomes success.
- pass: standard
  file: src/shared/components/button-footer.tsx
  where: the whole file, and its use as the shared action-row primitive
  evidence: "export function ButtonFooter({ children }: ButtonFooterProps): JSX.Element {\n  return (\n    <div\n      role=\"group\"\n      aria-label=\"Actions\"\n"
  cost: ButtonFooter answers to no single feature -- capability authoring, connector configuration, hypothesis revision and the case-version editor all import it identically from src/shared/components/button-footer.tsx -- yet it was written as a second, app-level shared primitive beside TUI's own catalog at frontend/tui/frontend/src/shared/components/ui/, rather than proposed into that catalog; a later reader now has two 'shared' trees to check before trusting which one actually owns this product's action-bar styling.
  cites: ARC-04
  correction: Propose ButtonFooter to TUI's own shared catalog rather than src/shared/components/, or record that TUI's catalog was asked and declined this kind of layout primitive.
---

## What it is
Four passes over one change of seven tasks, forty-nine files and one hundred and forty-nine specification nodes.
The conformance pass ran as forty-nine separate judgments, one per file, each handed only its own file and its own node pack; the union of what they returned is folded into the reconciliation record this one points at, and the bind restamped only what they cleared.

## Notes
The failures pass did not run, and the entry above says which input was missing: the captured run passed all eight steps, so there was no failure to diagnose.
That is not a statement that the change is correct — it is a statement that the project's own tools, over the rules the registry leaves to them, exited zero.
Whether those tools were configured to decide the rules resting on them is the registry's to know and not this framework's; the report carries the split.
One conformance delegation returned a node set short of its own pack and was refused by the fold rather than repaired; a fresh delegation with the totality requirement stated answered in its place, and found two things the first one had not.
One standard finding arrived citing STA-03 against a .ts hook, a rule whose own scope reaches .tsx alone; the citation was corrected to STA-01, whose subject is exactly what the finding's evidence shows — API-read data copied into local state kept in sync by an effect — and whose scope reaches the file.
The observation, its evidence and its cost are the judge's and were not altered; only the rule the citation resolves against was.
The trace's drift over this target is reported beside this record and is not a finding of any pass: it says whether the link back to the specification still describes this tree, which nothing here asks.
Over the frontend target the `code` class is suppressed by that target's own `edits_freely` declaration, so the rules a reading decides went unread over every file a person changed without a task; the offer of that list belongs to the report, not to this record.
