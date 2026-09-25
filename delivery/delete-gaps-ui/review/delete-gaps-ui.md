---
target: frontend
title: Review of the delete-gaps-ui delivery
summary: Coverage, specification-conformance (per file, over the trace's own node set), standard-conformance
  and failures passes over the 11 delete-gaps-ui tasks' 18 changed files; the captured run passed clean,
  so the failures pass found nothing to diagnose.
reviewed:
- src/hooks/use-capability-detail-removal-outcome.spec.ts
- src/hooks/use-capability-detail.ts
- src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-glossary-concepts.spec.ts
- src/hooks/use-glossary-concepts.ts
- src/routes/capability-detail-ready-view.tsx
- src/routes/capability-detail-screen-removal-landing.spec.ts
- src/routes/capability-detail-screen-removal.spec.ts
- src/routes/concept-removal-confirmation-dialog.tsx
- src/routes/connector-configuration-detail-ready-view.tsx
- src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
- src/routes/connector-configuration-detail-screen-remove.spec.ts
- src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
- src/routes/glossary-concepts-panel-removal-control.spec.tsx
- src/routes/glossary-concepts-panel.tsx
- src/services/error-ui-state.spec.ts
- src/services/error-ui-state.ts
tasks:
- task/capability-removal/capability-cited-by-evidence-refusal-recognition
- task/capability-removal/capability-removal-control
- task/capability-removal/capability-removal-landing
- task/capability-removal/capability-removal-outcome-disclosure
- task/concept-removal/concept-in-use-refusal-recognition
- task/concept-removal/concept-removal-landing
- task/concept-removal/concept-removal-outcome-disclosure
- task/concept-removal/concept-row-removal-control
- task/connector-configuration-removal/connector-configuration-removal-control
- task/connector-configuration-removal/connector-configuration-removal-landing
- task/connector-configuration-removal/connector-configuration-removal-outcome-disclosure
passes:
- pass: coverage
- pass: conformance
- pass: failures
  missing: run/delete-gaps-ui passed; there was no failure to read
- pass: standard
coverage:
- criterion: An ApiError whose code is CapabilityCitedByEvidenceError is answered with a state kind other
    than generic-error.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves to, distinct
      from the generic fallback
- criterion: The state kind answered for CapabilityCitedByEvidenceError is answered for no other error
    code the map names.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves to, distinct
      from the generic fallback
- criterion: Every error code the map named before this change answers the same state kind it answered
    before.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: leaves every error code named before CapabilityCitedByEvidenceError was added resolving to the
      exact kind it resolved to before
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotFoundError to the case-not-found state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotAnsweredError to the concept-not-answered state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotHeldError to the concept-not-held state
  - file: src/services/error-ui-state.spec.ts
    name: resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseAlreadyHasDraftError to the case-already-has-draft state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ManifestPositionOccupiedError to the manifest-position-occupied state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftError to the case-version-not-draft state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state
  - file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to the hypothesis-revision-not-draft-at-release
      state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotReleasableError to the case-version-not-releasable state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseHoldsNoDraftError to the shared generic-error state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotInGlossaryError to the shared generic-error state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptRefusesSubjectTypeError to the shared generic-error state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotValidError, the name the backend's refusal actually carries, to its own
      distinct case-not-valid state, not the shared generic-error fallback
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptAlreadyAnsweredError to the concept-already-answered state
  - file: src/services/error-ui-state.spec.ts
    name: resolves IncompleteCapabilityContractError to the incomplete-capability-contract state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityNotReadOnlyError to the capability-not-read-only state
  - file: src/services/error-ui-state.spec.ts
    name: resolves CapabilitySchemaNotWellFormedError to the capability-schema-not-well-formed state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConnectorConfigurationNotWellFormedError to its own distinct connector-configuration-not-well-formed
      state, not the shared generic-error fallback
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state,
      not the shared generic-error fallback
- criterion: The capability's surface at /capabilities/:name/:version offers a removal control for the
    capability it presents.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: renders a Remove capability control alongside the capability it presents
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: issues exactly one DELETE request to the presented capability's own resource path once the further
      act is confirmed
- criterion: Taking the removal control asks whether the capability's removal is to be performed.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: opens a confirmation dialog asking whether the capability's removal is to be performed
- criterion: Taking the removal control issues no DELETE request.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: issues no DELETE request merely by opening the confirmation dialog
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: issues no DELETE request merely from opening the confirmation dialog
- criterion: Confirming the removal in the further act issues one DELETE request to /v1/capabilities/:name/:version
    carrying the presented capability's name and version.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: issues exactly one DELETE request to the presented capability's own resource path once the further
      act is confirmed
- criterion: Declining the further act issues no DELETE request.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: issues no DELETE request when Cancel is clicked in the confirmation dialog
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: issues no DELETE request and leaves the row listed unchanged under the same name when Cancel
      is taken
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: issues no DELETE request when Keep configuration is clicked
- criterion: After the further act is declined, the surface still presents the capability unchanged under
    the same name and version.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: still presents the capability under its original name and version once the further act is declined
  why: The Name and Version inputs are captured before the dialog opens, and their values are read after
    the decline from those same element references. A detached input keeps its value. So if declining
    unmounted the capability's surface or re-rendered it with other content, the test would still pass.
    Only name and version are compared. Nothing checks that the rest of the presented capability is unchanged
    after the decline.
- criterion: The further act does not ask the operator to type the capability's name or version.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal.spec.ts
    name: offers no text input inside the confirmation dialog
- criterion: After a removal answered with HTTP 204, the operator is at /capabilities.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal-landing.spec.ts
    name: navigates to /capabilities once the removal answers with HTTP 204
  - file: src/routes/capability-detail-screen-removal-landing.spec.ts
    name: still presents the capability's own surface while the DELETE request is outstanding, navigating
      to /capabilities only once it resolves with HTTP 204
- criterion: After a removal answered with HTTP 204, the operator is at /capabilities even when navigation
    history holds an earlier entry.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal-landing.spec.ts
    name: lands at /capabilities rather than at the origin navigation history holds, once the removal
      answers with HTTP 204
- criterion: After a removal answered with HTTP 204, the capabilities listing shows no row for the removed
    name and version.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-removal-landing.spec.ts
    name: replaces a capabilities-listing cache that still held the removed row with one that no longer
      does, once the removal lands there
- criterion: After a removal answered with HTTP 204, the refusal of a read of the removed name and version
    is never shown.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen-removal-landing.spec.ts
    name: never renders the removed capability's not-registered refusal once the removal lands on the
      listing
  why: The test checks for the absence of "Unable to load this capability right now." once, after the
    path already reads /capabilities. The stub answers a read of the removed identity with 404 from the
    moment of the DELETE, so the window between the 204 and the navigation is where a refusal could appear.
    That window is never observed. A refusal stated through a toast is not observed either, because no
    toaster is mounted and toast is not spied on. "Never shown" is only checked at a single moment after
    landing.
- criterion: A removal answered with HTTP 204 is stated as success naming the removed capability's name
    and version.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: calls toast.success with a message naming the removed capability's own name and version
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: 'states that the identity is no longer registered, not merely a generic confirmation naming
      it -- fails over a reading such as "Done: some-capability v1" that names the identity but never
      says it is no longer registered'
- criterion: A removal refused with CapabilityCitedByEvidenceError states that nothing was removed.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states both facts in the refusal toast
- criterion: A removal refused with CapabilityCitedByEvidenceError states that collected evidence names
    the capability.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states both facts in the refusal toast
  why: The only check is that the refusal contains the word "evidence". A statement that mentions evidence
    without saying that collected evidence names this capability would pass. The fact that evidence names
    the capability is never checked.
- criterion: The statement for a CapabilityCitedByEvidenceError refusal differs from the statement for
    a refusal answered with HTTP 400 VALIDATION_ERROR.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states nothing was removed with a message distinct from the cited-by-evidence refusal's own
      statement
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: produces one identical statement for all three, distinct only from the CapabilityCitedByEvidenceError
      statement -- fails over a reading that gives each of the three its own distinct statement
- criterion: The statement for a CapabilityCitedByEvidenceError refusal differs from the statement for
    a refusal answered with HTTP 500 INTERNAL_ERROR.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states nothing was removed with a message distinct from the cited-by-evidence refusal's own
      statement
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: produces one identical statement for all three, distinct only from the CapabilityCitedByEvidenceError
      statement -- fails over a reading that gives each of the three its own distinct statement
- criterion: A removal refused with HTTP 400 VALIDATION_ERROR states that nothing was removed.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states nothing was removed with a message distinct from the cited-by-evidence refusal's own
      statement
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states that nothing was removed for an HTTP 400 VALIDATION_ERROR refusal (criterion 6)
  - file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: states nothing was removed in the refusal toast
- criterion: A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was removed.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states nothing was removed with a message distinct from the cited-by-evidence refusal's own
      statement
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states that nothing was removed for an HTTP 500 INTERNAL_ERROR refusal (criterion 7)
  - file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: states nothing was removed in the refusal toast
- criterion: A removal refused with an error code the surface does not recognise states that nothing was
    removed.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states nothing was removed with a message distinct from the cited-by-evidence refusal's own
      statement
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states that nothing was removed for a refusal with an error code the surface does not recognise
      (criterion 8)
  - file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: states nothing was removed in the refusal toast
- criterion: The statement for a refusal with an error code the surface does not recognise differs from
    the statement for a CapabilityCitedByEvidenceError refusal.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: states nothing was removed with a message distinct from the cited-by-evidence refusal's own
      statement
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: produces one identical statement for all three, distinct only from the CapabilityCitedByEvidenceError
      statement -- fails over a reading that gives each of the three its own distinct statement
- criterion: While the removal has not been answered, the surface states neither success nor refusal.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-removal-outcome.spec.ts
    name: calls neither toast.success nor toast.error before the DELETE settles, and states the outcome
      only once it does
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states neither success nor refusal while the removal has not been answered (criterion 10)
  - file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: calls neither toast.success nor toast.error before the DELETE settles, and states the outcome
      only once it does
- criterion: An ApiError whose code is ConceptInUseError is answered with a state kind other than generic-error.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptInUseError to a state kind other than the shared generic-error fallback
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptInUseError to a kind no other named code resolves to, distinct from the generic
      fallback
  - file: src/services/error-ui-state.spec.ts
    name: leaves every error code named before CapabilityCitedByEvidenceError was added resolving to the
      exact kind it resolved to before
- criterion: The state kind answered for ConceptInUseError is answered for no other error code the map
    names.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptInUseError to a kind no other named code resolves to, distinct from the generic
      fallback
  - file: src/services/error-ui-state.spec.ts
    name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves to, distinct
      from the generic fallback
- criterion: After a removal answered with HTTP 204, the glossary shows its concepts tab.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
    name: keeps the Concepts tab selected, with the panel's own New concept control still present, once
      a removal answers 204
- criterion: After a removal answered with HTTP 204, the concepts listing shows no row for the removed
    concept's name.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
    name: drops the removed concept's row from the listing once its removal answers 204, while an unrelated
      concept's row stays listed under its own name
  - file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
    name: shows the removed concept's own name nowhere on the screen once its removal answers 204, not
      only absent from the listing's own rows
- criterion: A removal answered with HTTP 204 is stated as success naming the removed concept's name.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states success naming the removed concept's own name when the removal answers with HTTP 204
      (criterion 1)
- criterion: A removal refused with ConceptInUseError states that nothing was removed.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states that nothing was removed and that something still names the concept when refused with
      ConceptInUseError (criteria 2, 3)
- criterion: A removal refused with ConceptInUseError states that something still names the concept.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states that nothing was removed and that something still names the concept when refused with
      ConceptInUseError (criteria 2, 3)
- criterion: The statement for a ConceptInUseError refusal differs from the statement for a refusal answered
    with HTTP 400 VALIDATION_ERROR.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states a different message for a ConceptInUseError refusal than for an HTTP 400 VALIDATION_ERROR
      refusal (criterion 4)
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: produces one identical generic statement for all three, keeping it apart only from ConceptInUseError's
      own statement
- criterion: The statement for a ConceptInUseError refusal differs from the statement for a refusal answered
    with HTTP 500 INTERNAL_ERROR.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states a different message for a ConceptInUseError refusal than for an HTTP 500 INTERNAL_ERROR
      refusal (criterion 5)
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: produces one identical generic statement for all three, keeping it apart only from ConceptInUseError's
      own statement
- criterion: The statement for a refusal with an error code the surface does not recognise differs from
    the statement for a ConceptInUseError refusal.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: states a different message for a refusal with an unrecognised error code than for a ConceptInUseError
      refusal (criterion 9)
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: produces one identical generic statement for all three, keeping it apart only from ConceptInUseError's
      own statement
- criterion: Each row of the concepts listing offers a removal control for that row's concept.
  state: covered
  tests:
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: offers a Remove control on every row the concepts listing shows
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: issues exactly one DELETE to /v1/glossary/concepts/:name carrying the acted-upon row's own concept
      name, not a different row's
- criterion: Taking a row's removal control asks whether that concept's removal is to be performed.
  state: partial
  tests:
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: asks whether the concept's removal is to be performed and issues no DELETE request on that asking
      alone
  why: The test mounts a single concept and only checks that a dialog opens containing text matching /remove
    concept/i. Nothing ties the question to the row that was taken. An ask that does not identify that
    concept, or identifies a different one, would pass.
- criterion: Taking a row's removal control issues no DELETE request.
  state: covered
  tests:
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: asks whether the concept's removal is to be performed and issues no DELETE request on that asking
      alone
- criterion: Confirming the removal in the further act issues one DELETE request to /v1/glossary/concepts/:name
    carrying that row's concept name.
  state: covered
  tests:
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: issues exactly one DELETE to /v1/glossary/concepts/:name carrying the acted-upon row's own concept
      name, not a different row's
- criterion: After the further act is declined, the concept's row is still listed unchanged under the
    same name.
  state: partial
  tests:
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: issues no DELETE request and leaves the row listed unchanged under the same name when Cancel
      is taken
  why: After Cancel, the only check is that the text "billing-dispute" is still on screen. It does not
    check that the text is in a listing row, or that the row's other contents (accepts, ttl, description)
    are unchanged. The "unchanged" half is never checked.
- criterion: The further act does not ask the operator to type the concept's name.
  state: covered
  tests:
  - file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: carries no text input asking the operator to type the concept's name
- criterion: The connector configuration's surface at /connectors/:connector offers a removal control
    for the configuration it presents.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: offers a Remove connector configuration control alongside the presented configuration
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: issues exactly one DELETE request to /v1/connectors/:connector, carrying the presented connector
      name, once the further act confirms
- criterion: Taking the removal control asks whether the configuration's removal is to be performed.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: opens a confirmation dialog stating what taking the control would do, rather than acting immediately
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: offers only Keep configuration and Remove connector configuration buttons in the dialog, with
      no text input
  why: The criterion-2 test checks that a dialog opens stating "Removing this connector configuration
    cannot be undone." That is a warning about the consequence, not a question. The fact that the dialog
    asks, offering a choice to confirm or keep, is only checked in passing by the no-typing test, which
    is about something else. An information-only dialog carrying the same warning would pass the criterion-2
    test.
- criterion: Confirming the removal in the further act issues one DELETE request to /v1/connectors/:connector
    carrying the presented configuration's connector name.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: issues exactly one DELETE request to /v1/connectors/:connector, carrying the presented connector
      name, once the further act confirms
- criterion: After the further act is declined, the surface still presents the configuration unchanged
    under the same connector name.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: still presents the same configuration under the same connector name after Keep configuration
      is clicked
  why: The connector name is re-queried after the decline, so that half is proved. The configuration value
    is read from a textarea reference captured before the dialog opened, and a detached textarea keeps
    its value. If the surface re-rendered with a different configuration in a new element, the test would
    still pass, so "unchanged" is not established for the configuration.
- criterion: The further act does not ask the operator to type the connector's name.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: offers only Keep configuration and Remove connector configuration buttons in the dialog, with
      no text input
- criterion: The removal control is not withheld where a capability names the connector as its own.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: still offers an enabled Remove connector configuration control when a registered capability
      names this connector as its own
- criterion: After a removal answered with HTTP 204, the operator is at /connectors.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: navigates to /connectors once the DELETE answers 204
  - file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: still emits the removal's success statement naming the connector in the same onSuccess that
      also navigates to /connectors -- an implementation dropping the statement in favor of only navigating
      would fail this
- criterion: After a removal answered with HTTP 204, the operator is at /connectors even when navigation
    history holds an earlier entry.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: navigates to /connectors, not back to the origin surface reached from, once the DELETE answers
      204
- criterion: After a removal answered with HTTP 204, the connectors listing shows no row for the removed
    connector's name.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: no longer lists the removed connector's row once the listing refetches on landing, even though
      its row was cached from an earlier visit
- criterion: After a removal answered with HTTP 204, the refusal of a read of the removed connector's
    name is never shown.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: never shows the read-refused message for the removed connector, even where a refetch of its
      own now-unregistered query would answer refused
  why: The test checks for the absence of "Unable to load this connector configuration right now." once,
    immediately after the path reads /connectors. The window between the 204 and the navigation, when
    the stubbed refetch answers ConnectorConfigurationNotFoundError, is never observed. toast.error is
    mocked in this file but never checked to be uncalled, so a refusal stated through a toast would also
    pass. "Never shown" is only checked at a single moment after landing.
- criterion: A removal answered with HTTP 204 is stated as success naming the removed connector's name.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: calls toast.success with a message naming the removed connector's own name
  - file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: states the connector's configuration is no longer registered, not merely a generic confirmation
      naming it -- fails over a reading such as "Request for connector 'some-connector' completed successfully"
      that names the connector but never says its configuration is no longer registered
  - file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: still emits the removal's success statement naming the connector in the same onSuccess that
      also navigates to /connectors -- an implementation dropping the statement in favor of only navigating
      would fail this
unpaired:
- test:
    file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
    name: produces one identical statement across a 400, a 500 and an unrecognised code -- fails over
      a reading that distinguishes any of the three refusal conditions from another
  asserts: The refusal toast text for HTTP 400 VALIDATION_ERROR, HTTP 500 INTERNAL_ERROR and an unrecognised
    code (HTTP 502) is one identical string. It does not check what that string says.
- test:
    file: src/hooks/use-glossary-concepts.spec.ts
    name: caches under its own key, ["glossary", "concepts-with-ttl"], distinct from use-concept-options.ts's
      own ["glossary", "concepts"] key (disclosed inference)
  asserts: After useGlossaryConcepts loads, the query cache holds data under ["glossary", "concepts-with-ttl"]
    and nothing under ["glossary", "concepts"].
- test:
    file: src/hooks/use-glossary-concepts.spec.ts
    name: issues a GET to /v1/glossary/concepts and returns each concept's own name, accepts and ttl intact
  asserts: The first fetch goes to /v1/glossary/concepts, and the concepts returned equal the page's data
    unchanged.
- test:
    file: src/hooks/use-glossary-concepts.spec.ts
    name: reads each concept's own description off the concepts listing verbatim, including an empty string
      for a legacy concept (criterion 1)
  asserts: The concepts returned equal the page's data, with each description kept exactly as sent, including
    an empty string.
- test:
    file: src/hooks/use-glossary-concepts.spec.ts
    name: reports isError, with concepts staying empty, when the request fails
  asserts: When fetch rejects, isError becomes true and concepts equals an empty array.
- test:
    file: src/hooks/use-glossary-concepts.spec.ts
    name: returns an empty concepts array, rather than throwing or leaving it undefined, when the concepts
      page holds none yet
  asserts: A page with empty data yields concepts equal to an empty array.
- test:
    file: src/hooks/use-glossary-concepts.spec.ts
    name: states the identical message for a refusal reporting a capability reference and for one reporting
      an evidence reference
  asserts: Two ConceptInUseError refusals whose details report a capability reference and an evidence
    reference produce the same refusal toast string.
- test:
    file: src/routes/capability-detail-screen-removal-landing.spec.ts
    name: stays at the capability's own detail route when the removal answers with a refusal instead of
      HTTP 204
  asserts: When the DELETE answers a 409 refusal, the trigger becomes enabled again and the path stays
    at /capabilities/some-capability/v1.
- test:
    file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
    name: stays on the connector's own surface while the DELETE is outstanding, and again once it is refused,
      never reaching /connectors without a 204 -- an implementation navigating as soon as the removal
      is issued, or on a refusal, would fail this
  asserts: The path stays at /connectors/some-connector while the DELETE is pending, and still does after
    the DELETE answers a 400 refusal and toast.error has been called.
- test:
    file: src/routes/connector-configuration-detail-screen-remove.spec.ts
    name: issues no DELETE request when the confirmation dialog is dismissed through its own close control
      rather than through Keep configuration or Remove connector configuration -- an implementation that
      treats any dismissal with no explicit choice as confirmation would fail this
  asserts: Closing the dialog with its "Fechar" close control shuts the dialog and issues no DELETE request.
- test:
    file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
    name: issues no DELETE request, neither immediately nor after time passes, when the confirmation is
      dismissed with no explicit choice rather than declined or confirmed
  asserts: With the dialog left open for 60 seconds of fake time, no DELETE is issued and the dialog stays
    open. After Escape closes it, still no DELETE is issued and "billing-dispute" is still on screen.
- test:
    file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
  asserts: Ten listed codes (CaseNotFoundError through ManifestWouldHoldNoHypothesisError) resolve to
    ten distinct kinds.
- test:
    file: src/services/error-ui-state.spec.ts
    name: gives each of these four newly mapped classes a kind distinct from the others and from the shared
      generic-error fallback
  asserts: ConceptAlreadyAnsweredError, IncompleteCapabilityContractError, CapabilityNotReadOnlyError
    and CapabilitySchemaNotWellFormedError resolve to four distinct kinds, none of them generic-error.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotValidError, the retired name the mapping no longer keys on, to the shared generic-error
      state rather than case-not-valid
  asserts: The code CaseNotValidError, which the map does not name, resolves to generic-error.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves ConceptDescriptionRequiredError to a state carrying only the kind, no wording of its
      own
  asserts: The state for ConceptDescriptionRequiredError has exactly one key, kind.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to a kind no other listed code resolves to,
      distinct from the generic fallback
  asserts: HypothesisRevisionNotDraftAtReleaseError's kind is not generic-error and matches none of the
    kinds of 20 listed codes. The list leaves out ConceptInUseError and CapabilityCitedByEvidenceError.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
      to the shared generic-error state rather than a code of their own (capability schema helper's refusal-stated-to-the-operator
      criterion 8)
  asserts: Three codes the map does not name, OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError
    and OpenApiOperationNotFoundError, each resolve to generic-error.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to a fallback state carrying only the kind, not the
      refusal's own message
  asserts: The fallback state for an unnamed code (SomeFutureBackendError) has exactly one key, kind.
- test:
    file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to the generic-error state rather than throwing
  asserts: An unnamed code (SomeFutureBackendError) resolves to generic-error.
findings:
- pass: standard
  file: src/hooks/use-capability-detail.ts
  where: lines 94-114, the `syncedDataUpdatedAt` block inside `useCapabilityDetail`
  cites: STA-01
  evidence: 'const [syncedDataUpdatedAt, setSyncedDataUpdatedAt] = useState(query.dataUpdatedAt); if (query.dataUpdatedAt
    !== syncedDataUpdatedAt) { setSyncedDataUpdatedAt(query.dataUpdatedAt); if (query.data) { form.reset({
    name: query.data.name, version: query.data.version, ... }); setInputSchemaValue(query.data.input_schema);
    setInputSchemaValid(getJsonTextareaMinifiedValue(query.data.input_schema) !== null); setInputSchemaBaseline(query.data.input_schema);
    setOutputSchemaValue(query.data.output_schema); ... } }'
  cost: The query's cache already holds the capability; this block additionally copies input_schema, output_schema,
    and the whole form's field set into five separate useState variables kept "in sync" by comparing dataUpdatedAt
    on every render. If the query refetches in the background while the operator has unsaved edits, the
    cache and this copy now disagree on which value is current, and nothing here guards against the copy
    silently overwriting what the operator typed — exactly the disagreement the rule exists to rule out.
    The nearby use-glossary-concepts.ts in this same file set reads query.data?.data directly with no
    such copy, showing the alternative was available.
  correction: Derive the editable values from query.data at the point of use (or reset the form only through
    react-hook-form's own defaultValues/key-remount mechanism) rather than mirroring each field into its
    own useState kept in sync against dataUpdatedAt.
- pass: standard
  file: src/hooks/use-connector-configuration-detail.ts
  where: lines 94-105, the `syncedConfigurationData` block inside `useConnectorConfigurationDetail`
  cites: STA-01
  evidence: 'const [syncedConfigurationData, setSyncedConfigurationData] = useState<ConnectorConfiguration
    | undefined | typeof UNSYNCED_CONFIGURATION_DATA>(UNSYNCED_CONFIGURATION_DATA); if (query.data !==
    syncedConfigurationData) { setSyncedConfigurationData(query.data); if (query.data) { form.reset({
    connector: query.data.connector }); setConfigurationValue(query.data.configuration); setConfigurationValid(isValidConfigurationObject(query.data.configuration));
    setConfigurationBaseline(query.data.configuration); } }'
  cost: configurationValue/configurationBaseline duplicate query.data.configuration outside the query
    cache, kept aligned only by this reference-equality check. A background refetch that returns a new
    object identity re-triggers the sync and can overwrite an operator's in-progress edit with no warning,
    and the mutation's own onSuccess handler (form.reset({ connector }); setConfigurationBaseline(configurationValue))
    independently re-derives the baseline from the local copy rather than the cache, so the two can drift
    the moment either path runs on its own.
  correction: Read the configuration directly from query.data at render time for anything that is not
    actively being edited, and reset the form via react-hook-form's own defaultValues/remount mechanism
    instead of a second useState copy tracked by reference-equality against the cache.
- pass: standard
  file: src/routes/capability-detail-ready-view.tsx
  where: lines 37-46, the input/output schema warning paragraphs
  cites: EDG-03
  evidence: '{!state.inputSchema.isValid && (<p role="alert" className="text-sm text-destructive">{INVALID_INPUT_SCHEMA_WARNING}</p>)}
    {!state.outputSchema.isValid && (<p role="alert" className="text-sm text-destructive">{INVALID_OUTPUT_SCHEMA_WARNING}</p>)}'
  cost: Both warnings render as standalone alerts stacked above the whole form, with no id for either
    paragraph and nothing wiring them to the input-schema or output-schema field via aria-describedby.
    A screen-reader user tabbing into either field hears nothing tying it to "not valid JSON"; they only
    get a page-level announcement disconnected from the field the rule invalid, which the rule specifically
    says is not enough when several fields could each be the one at fault.
  correction: Move each warning beside its own field (or into that field's description slot) and connect
    it with aria-describedby on the corresponding textarea, rather than rendering it as a free-standing
    alert ahead of the form.
- pass: standard
  file: src/routes/connector-configuration-detail-ready-view.tsx
  where: lines 38-42, the configuration warning paragraph
  cites: EDG-03
  evidence: '{!state.configuration.isValid && (<p role="alert" className="text-sm text-destructive">{INVALID_CONFIGURATION_WARNING}</p>)}'
  cost: 'The same generic, unlinked alert pattern: the paragraph carries no id and is not referenced by
    aria-describedby from the configuration field it warns about, so a screen-reader user has no way to
    associate "must be a JSON object" with the specific control that is invalid.'
  correction: Attach the warning to the configuration field itself via aria-describedby instead of rendering
    it as a page-level alert ahead of the form.
- file: src/hooks/use-capability-detail.ts
  where: the update mutation's onSuccess/onError handlers, lines 134-140
  evidence: "onSuccess: () => {\n      void queryClient.invalidateQueries({ queryKey: [\"capabilities\"\
    ] });\n      void queryClient.invalidateQueries({ queryKey: [\"capability\", name, version] });\n\
    \    },\n    onError: (error) => {\n      toast.error(saveFailureMessage(error));\n    },"
  cost: An operator who submits an edit to this capability learns nothing from this file about whether
    the registration was made or what now stands registered — only a bare `isSubmitSuccessful` boolean
    crosses the hook boundary, carrying no identity and no content — while this same file's removal path,
    a few lines below, states that outcome in full ("`${name} ${version} is no longer registered.`").
    A reader who wants to know what a successful capability edit tells the operator finds it stated for
    delete and not for save.
  correction: onSuccess should state that the registration was made and name what now stands registered
    — the name and version submitted — the way deleteMutation's onSuccess already names the identity removed.
  pass: conformance
- file: src/hooks/use-capability-detail.ts
  where: the "ready"-phase returned state, lines 221-244
  evidence: "isDirty,\n    isSubmitting: mutation.isPending,\n    isSubmitSuccessful: mutation.isSuccess,\n\
    \    onSubmit,\n    onCancel,\n    isDeleting: deleteMutation.isPending,\n    onDelete: () => {\n\
    \      deleteMutation.mutate();\n    },\n  };"
  cost: An operator editing this capability who wants to put an edit down and keep working has only `onCancel`,
    whose whole effect is to leave the surface (back, or to the capabilities listing); there is no act
    here that returns the form and the two schema fields to the content of the surface's own last read
    while keeping the operator on that surface, so recovering a schema an operator has typed over costs
    a full leave-and-return through the listing rather than nothing.
  correction: expose a discard action that resets `form`, `inputSchemaValue` and `outputSchemaValue` to
    `query.data`/`inputSchemaBaseline`/`outputSchemaBaseline` without navigating, taking effect only after
    a further explicit confirmation, distinct from `onCancel`.
  pass: conformance
- file: src/hooks/use-connector-configuration-detail.ts
  where: the `ConnectorConfigurationDetailState` type's `ready` phase (lines 47-59) and the object the
    hook returns for it (lines 188-207)
  evidence: "| {\n    readonly phase: \"ready\";\n    readonly form: UseFormReturn<ConnectorConfigurationFormValues>;\n\
    \    readonly configuration: ConfigurationFieldState;\n    readonly isDirty: boolean;\n    readonly\
    \ isSubmitting: boolean;\n\n    readonly isSubmitSuccessful: boolean;\n    readonly onSubmit: (event?:\
    \ BaseSyntheticEvent) => void;\n    readonly onCancel: () => void;\n    readonly onRemove: () => void;\n\
    \    readonly isRemoving: boolean;\n  };"
  cost: Nothing in this hook collects a test value per Subject attribute named by the presented answer's
    own `${subject:<attribute-name>}` placeholders, and nothing detects or states a divergence between
    the configuration a test would exercise and the one being presented; an operator running the connector's
    test after the registered configuration has changed underneath them gets no signal that the values
    they supplied were collected against a configuration they are no longer looking at.
  correction: Have this hook collect one test value per distinct Subject-attribute name found in the presented
    answer's own configuration text (never from `configurationValue`, which may hold an unsubmitted edit
    or applied draft), and compare that attribute set against the configuration read at the moment of
    the test, exposing a stated divergence to the caller when they differ.
  pass: conformance
- file: src/hooks/use-connector-configuration-detail.ts
  where: the `query.isError` branch, lines 153-161
  evidence: "if (query.isError) {\n    return {\n      phase: \"load-error\",\n      retryLoad: () =>\
    \ {\n        void query.refetch();\n      },\n      onCancel,\n    };\n  }"
  cost: A connector name nothing is registered under and a read that failed for any other reason both
    resolve to the same `load-error` phase, both carrying `retryLoad`; an operator who reaches an unregistered
    connector name is offered a retry that can never succeed instead of being told plainly that nothing
    is registered there. Because `query.isError` returns before the `ready` phase is ever reached, this
    hook can never present the authoring form under an unregistered connector name either, so the create
    side of `register-connector` is unreachable from this screen.
  correction: Distinguish, inside the `query.isError` branch, a refusal naming ConnectorConfigurationNotFoundError
    from any other failure, and return a phase for the former that states nothing is registered under
    the connector name, presents no connector or configuration value, and carries no retry action — separate
    from the `load-error` phase, which keeps `retryLoad` for a read that genuinely failed.
  pass: conformance
- file: src/hooks/use-connector-configuration-detail.ts
  where: the object the `ready` phase returns, lines 188-207
  evidence: "return {\n    phase: \"ready\",\n    form,\n    configuration: {\n      value: configurationValue,\n\
    \      isValid: configurationValid,\n\n      onChange: handleConfigurationChange,\n    },\n    isDirty,\n\
    \    isSubmitting: mutation.isPending,\n    isSubmitSuccessful: mutation.isSuccess,\n    onSubmit,\n\
    \    onCancel,\n    onRemove: () => {\n      removeMutation.mutate();\n    },\n    isRemoving: removeMutation.isPending,\n\
    \  };"
  cost: 'An operator who has edited the connector name or the Configuration field away from what the read
    answered has no act, anywhere in this hook, that returns the fields to that read content without leaving
    the screen: `onCancel` navigates away (`router.history.back()` or to `/connectors`), and no field
    of the returned state resets `configurationValue`/`configurationBaseline` or `form` to `query.data`.
    Recovering from an unwanted edit to opaque configuration text an operator cannot retype from memory
    costs a round trip through another screen instead of the in-place act the rule requires.'
  correction: 'Expose a discard action from the ready phase (e.g. `onDiscard`) whose whole effect is to
    reset `form` to `{ connector: query.data.connector }` and reset `configurationValue`/`configurationBaseline`
    to `query.data.configuration`, available while `isDirty` is true and taking effect only on a further
    explicit act, per the rule.'
  pass: conformance
- file: src/hooks/use-glossary-concepts.spec.ts
  where: lines 311-330, the describe block "useRemoveGlossaryConcept -- the ConceptInUseError statement
    names the concept, never the reported reference (UNDERDETERMINED...)" and its single test
  evidence: "const capabilityMessage = await captureRemovalFailureMessage(\n  refusalResponse(capabilityReference,\
    \ 409),\n);\nconst evidenceMessage = await captureRemovalFailureMessage(\n  refusalResponse(evidenceReference,\
    \ 409),\n);\n\nexpect(evidenceMessage).toBe(capabilityMessage);"
  cost: The test pins, as a passing requirement, that the operator's toast never varies with whether a
    capability or an evidence item is what still names the concept -- rules/glossary/a-registered-concept-is-never-removed
    states that the refusal reports "a reference identifying what names it" precisely "so the person told
    to keep the concept knows what to look at," yet no node decides whether that reference reaches the
    operator-facing surface distinctly or is folded away. The describe block's own title labels this UNDERDETERMINED
    and cites a delivery-record inference rather than a specification decision; the next reader who opens
    the specification to learn why the reference is discarded finds nothing, because the choice was made
    in the test and a proof record, never decided into the specification's own decision log.
  correction: Decide, into the specification (naming rules/glossary/a-registered-concept-is-never-removed
    or the operator-outcome rule it feeds), whether a ConceptInUseError refusal's reported reference must
    reach the operator distinctly or is deliberately folded into one statement, and record that decision
    in knowledge/decision-log.md rather than only in delivery/proof and this test.
  pass: conformance
- file: src/hooks/use-glossary-concepts.ts
  where: the concept-in-use branch of removalFailureMessage, lines 52-57
  evidence: "if (error instanceof ApiError && uiStateForApiError(error).kind === \"concept-in-use\") {\n\
    \  return `Nothing was removed; something else in the glossary still names the concept \"${name}\"\
    .`;\n}"
  cost: 'An operator told the concept is "still named" by something "in the glossary" will look inside
    glossary management — at other concepts or vocabulary terms — to find and clear the reference. The
    rule that actually produces this refusal never fires for anything inside the glossary: it fires because
    a registered capability answers the concept, a collected evidence item or its citation names it, or
    a hypothesis-revision''s own collects lists it — a capability, an investigation record, or a knowledge
    artefact, none of them part of the glossary. The message sends the operator to the wrong bounded context
    to resolve a refusal they cannot act on there.'
  correction: State that the concept is still referenced elsewhere in the system — by a capability, a
    collected evidence item, a citation, or a hypothesis-revision — rather than asserting the reference
    is "in the glossary".
  pass: conformance
- file: src/routes/capability-detail-ready-view.tsx
  where: the trailingActions block, between the Remove capability dialog (lines 87-111) and the Cancel/Capabilities
    controls — the only outcome-disclosure element present is for the save operation, at lines 112-116
  evidence: "{state.justSaved && (\n  <p role=\"status\" className=\"text-sm text-foreground\">\n    Saved.\n\
    \  </p>\n)}"
  cost: 'An operator who confirms "Remove capability" and has the removal refused — for instance because
    a collected evidence item still names the capability — sees the confirmation dialog close and then
    nothing: this surface''s only outcome text is "Saved.", gated on state.justSaved, which reports the
    save operation alone. The operator is left unable to tell whether the further explicit act they just
    took did anything, on the one surface required to tell them.'
  correction: Render the removal's own outcome on this surface — success, or the specific refusal condition
    the api's answer named — the same way state.justSaved already renders the save outcome.
  pass: conformance
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  where: the describe/it block at lines 94-113, "the landing waits for the removal's own answer, never
    taken merely because the removal was issued (an underdetermined note in this task)"
  evidence: "describe(\"CapabilityDetailScreen -- the landing waits for the removal's own answer, never\
    \ taken merely because the removal was issued (an underdetermined note in this task)\", () => {\n\
    \  it(\"still presents the capability's own surface while the DELETE request is outstanding, navigating\
    \ to /capabilities only once it resolves with HTTP 204\", async () => {\n    ...\n    await waitFor(()\
    \ => expect(removeTriggerButton().hasAttribute(\"disabled\")).toBe(true));\n    expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`);"
  cost: 'The test fixes, as a hard requirement of the screen, that the remove control disables and navigation
    is withheld for the whole time the DELETE request is outstanding. No node in this file''s set, and
    none found elsewhere in the specification, decides whether a removal in flight disables its own control
    or what the surface shows meanwhile; the next reader who needs to know that will find only this test
    enforcing it, never a specification node — and the test''s own title concedes the gap it is filling:
    "(an underdetermined note in this task)".'
  correction: Decide, in the specification, whether and how a capability removal in flight is reflected
    on the remove control and the surface, then bring this test back to assert only what was decided.
  pass: conformance
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  where: the describe/it block at lines 115-128, "a refused removal leaves the operator on the capability's
    own surface (an underdetermined note in this task)"
  evidence: "describe(\"CapabilityDetailScreen -- a refused removal leaves the operator on the capability's\
    \ own surface (an underdetermined note in this task)\", () => {\n  it(\"stays at the capability's\
    \ own detail route when the removal answers with a refusal instead of HTTP 204\", async () => {\n\
    \    ...\n    await waitFor(() => expect(removeTriggerButton().hasAttribute(\"disabled\")).toBe(false));\n\
    \    expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`);"
  cost: 'The test fixes, as a hard requirement, that a refused removal leaves the operator on the capability''s
    own detail route with the control usable again. rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
    states what the surface discloses on a refusal but not where the operator is left able to act next,
    and no other node in this set settles it; a reader who needs to know what a refused capability removal
    leaves the operator able to do will find only this assertion, and the test''s own title admits the
    specification does not settle it: "(an underdetermined note in this task)".'
  correction: Decide, in the specification, what a refused capability removal leaves the operator able
    to do — surface, control state — then bring this test back to assert only what was decided.
  pass: conformance
- file: src/routes/connector-configuration-detail-ready-view.tsx
  where: the `state.justSaved` success message, lines 87-92
  evidence: "{state.justSaved && (\n\n  <p role=\"status\" className=\"text-sm text-foreground\">\n  \
    \  Saved.\n  </p>\n)}"
  cost: An operator who submits an edit is told only "Saved.", never which connector configuration now
    stands registered. The node requires the surface to state what was registered — the connector name
    the submission carried — alongside the fact that it registered; this text carries no such content
    even though the connector name (the `connector` prop) is already in scope of this component. An operator
    who has moved between several connectors' detail screens, or returned to this one via the listing,
    has nothing in this confirmation to tie the "Saved." to the connector it was saved for.
  correction: Interpolate the connector name into the confirmation text (e.g. state that the connector
    configuration for `{connector}` is now registered) instead of the bare, unqualified word "Saved."
  pass: conformance
- file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
  where: the third describe block, lines 89-112 ("no surface addressed by the removed identity survives
    the removal (underdetermined, from the specification)")
  evidence: 'describe("GlossaryBrowserScreen — no surface addressed by the removed identity survives the
    removal (underdetermined, from the specification)", () => { it("shows the removed concept''s own name
    nowhere on the screen once its removal answers 204, not only absent from the listing''s own rows",
    ... expect(await screen.findByRole("row", { name: /fraud-flag/i })).toBeTruthy(); expect(screen.queryByText("billing-dispute")).toBeNull();
    });'
  cost: The test asserts, as behavior a caller can depend on, that once a concept's removal answers 204
    no trace of the removed concept's own name survives anywhere on the whole screen — a stronger, more
    general guarantee than the specification decided. The decision log records only that a successful
    removal's destination is the listing and never the removed identity's own surface (rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing);
    it says nothing about every other place the removed name might still appear (a lingering dialog, a
    status message, or any other element). A reader who wants to know what a concept removal is required
    to purge from the screen will look in the specification and find only the narrower, decided fact —
    and the test's own title concedes as much by calling the guarantee it encodes "underdetermined, from
    the specification."
  correction: Either decide the broader guarantee — that no reference to a just-removed identity survives
    anywhere on the presenting screen, not only in the listing's own rows — into the specification (widening
    rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing or a sibling node)
    and record it in the decision log, or narrow this test to what that node and constraints/a-successful-concept-removal-answers-with-no-content
    actually decide.
  pass: conformance
run: run/delete-gaps-ui
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/delete-gaps-ui.md
---

## What it is
Review of the delete-gaps-ui delivery -- coverage, per-file specification conformance, standard conformance, and the captured run's failures (none).

## Notes
None.
