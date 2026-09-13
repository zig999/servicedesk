---
target: frontend
title: 'Review: connector configuration draft, status readings and response-map capability coverage disclosure'
summary: 'Four passes over the 16 tasks of the drafted-answer-disclosure and configuration-readiness epics
  and the 75 files they touched: whether the tests prove the tasks'' own criteria, whether the source
  states only what the specification holds, whether it follows the project''s own standard, and why a
  captured run failed. The whole-delivery suite captured clean, so the failures pass found nothing to
  diagnose.'
reviewed:
- src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
- src/hooks/use-connector-configuration-helper.ts
- src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
- src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
- src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
- src/hooks/use-draft-connector-configuration-from-openapi.ts
- src/hooks/use-response-map-capability-coverage.ts
- src/hooks/use-subject-placeholder-statements.ts
- src/routes/connector-configuration-create-screen-apply-draft.spec.ts
- src/routes/connector-configuration-create-screen-cancel.spec.ts
- src/routes/connector-configuration-create-screen-outcome.spec.ts
- src/routes/connector-configuration-create-screen-save.spec.ts
- src/routes/connector-configuration-create-screen.spec.ts
- src/routes/connector-configuration-credential-placeholder-statements-view.tsx
- src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
- src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
- src/routes/connector-configuration-detail-ready-view-order.spec.ts
- src/routes/connector-configuration-detail-screen-cached-load.spec.ts
- src/routes/connector-configuration-detail-screen-discard.spec.ts
- src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
- src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- src/routes/connector-configuration-detail-screen-outcome.spec.ts
- src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
- src/routes/connector-configuration-detail-screen-save.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-form-fields-action-footer.spec.ts
- src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
- src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
- src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
- src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
- src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
- src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
- src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
- src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
- src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
- src/routes/connector-configuration-form-fields.tsx
- src/routes/connector-configuration-helper-fields-apply.spec.ts
- src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
- src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
- src/routes/connector-configuration-helper-fields-operation-select.spec.ts
- src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
- src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
- src/routes/connector-configuration-helper-fields-response-fields.spec.ts
- src/routes/connector-configuration-helper-fields-response-map-capability-coverage.spec.ts
- src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
- src/routes/connector-configuration-helper-fields-submission-withheld-only-on-well-formedness.spec.ts
- src/routes/connector-configuration-helper-fields.spec.ts
- src/routes/connector-configuration-helper-fields.tsx
- src/routes/connector-configuration-helper.tsx
- src/routes/connector-configuration-http-connector-departures-view.tsx
- src/routes/connector-configuration-response-map-capability-coverage-view.tsx
- src/routes/connector-configuration-subject-placeholder-statements-view.tsx
- src/routes/connector-test-panel-attribute-reconciliation.spec.ts
- src/routes/connector-test-panel-capability-picker.spec.ts
- src/routes/connector-test-panel-fields.spec.ts
- src/routes/connector-test-panel-subject-and-attributes.spec.ts
- src/services/connector-configuration-apply-diff.spec.ts
- src/services/connector-configuration-apply-diff.ts
- src/services/connector-configuration-credential-placeholder-statements.spec.ts
- src/services/connector-configuration-credential-placeholder-statements.ts
- src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
- src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
- src/services/connector-configuration-draft-disclosure.spec.ts
- src/services/connector-configuration-draft-disclosure.ts
- src/services/connector-configuration-http-departures.spec.ts
- src/services/connector-configuration-http-departures.ts
- src/services/connector-configuration-messages-consumption.spec.ts
- src/services/connector-configuration-messages.spec.ts
- src/services/connector-configuration-messages.ts
- src/services/connector-configuration-operations-read-disclosure.spec.ts
- src/services/connector-configuration-operations-read-disclosure.ts
- src/services/connector-configuration-response-map-capability-coverage.spec.ts
- src/services/connector-configuration-response-map-capability-coverage.ts
- src/services/connector-configuration-subject-placeholder-statements.spec.ts
- src/services/connector-configuration-subject-placeholder-statements.ts
tasks:
- task/configuration-readiness/configuration-entry-guidance
- task/configuration-readiness/credential-placeholder-statement
- task/configuration-readiness/http-departure-statements
- task/configuration-readiness/response-map-capability-coverage
- task/configuration-readiness/subject-placeholder-statements
- task/configuration-readiness/submission-withheld-only-on-well-formedness
- task/drafted-answer-disclosure/apply-confirmation-diff
- task/drafted-answer-disclosure/draft-answer-parts-reach-the-surface
- task/drafted-answer-disclosure/draft-request-gate
- task/drafted-answer-disclosure/operations-read-states
- task/drafted-answer-disclosure/pt-br-message-module
- task/drafted-answer-disclosure/reading-notes-stated
- task/drafted-answer-disclosure/response-fields-stated
- task/drafted-answer-disclosure/stale-draft-marking
- task/drafted-answer-disclosure/status-readings-stated
- task/drafted-answer-disclosure/unresolved-reasons-stated-apart
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: 'the whole-delivery run captured clean (outcome: passed) across install, typecheck, lint, style,
    build, a11y, secret-scan and test, so nothing failed to diagnose'
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
coverage:
- criterion: A draft answer carrying status readings yields, on the frontend's reading of it, each status
    reading with its status, its ending and, where the answer carried it, what the document declared that
    status as.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
    name: carries declared_as through when the answer named one, and carries no declared_as key at all
      when it named none
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: carries status and ending through unchanged for every reading, and carries declaredAs as undefined
      for a reading with no declared_as
- criterion: A draft answer carrying response fields yields each response field with its name, its path
    and its status, and with its declared type, its declared required listing and its envelope where the
    answer carried them.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
    name: carries declared_type, declared_required and envelope through when the answer named them, and
      carries none of the three when it named none
  - file: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
    name: carries name, path and status through unchanged for every field, and carries declaredType, declaredRequired
      and envelope as undefined for a field carrying none of them, or as the field's own value where it
      does
- criterion: A draft answer carrying reading notes yields each reading note with its kind and its subject,
    and with its detail where the answer carried one.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
    name: carries detail through when the answer named one, and carries no detail key at all when it named
      none
  - file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
    name: copies kind and subject through unchanged for every note, carries a carried detail through,
      and carries no detail for a note naming none
- criterion: The frontend's reading admits each of the nine kinds the draft's reading-note vocabulary
    holds and no kind outside it.
  state: partial
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-reading-parts.spec.ts
    name: carries all nine kinds through unmodified, in order, and refuses a tenth kind at the type level
  why: 'The admitting half is exercised: all nine kinds pass through in order. The refusing half is not.
    The only thing standing for it is a local builder carrying a @ts-expect-error and a runtime assertion
    on a literal fact of JavaScript that cannot fail whatever the reading admits. No test feeds a draft
    answer carrying a tenth kind through the reading and observes that kind refused or dropped.'
- criterion: The frontend's reading of a draft answer admits one field per attribute the draft element
    declares and no capability name, version or count.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
    name: exposes connector, configuration, unresolved, generated_credentials and method_mismatch exactly
      as named, when a mismatch stands
  - file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
    name: exposes no name, version or count field even when the response body carries them
  - file: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
    name: exposes no link, path or method key on the drafted outcome's draft
- criterion: No module of the frontend issues a request to the OpenAPI document link the operator named;
    the draft and the operations listing are read only through the backend operations that fetch it.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
    name: never calls fetch with the operator's own link, only with the published draft route
  - file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
    name: issues its one network call to the published draft route, never to the operator-supplied link
      or any other route
- criterion: Each status reading the answer carries is stated with the status that reading names.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: renders exactly the given status readings, each by its own status, its own ending and its declared_as
      where carried
- criterion: Each status reading is stated with the ending the draft mapped that status to.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: renders exactly the given status readings, each by its own status, its own ending and its declared_as
      where carried
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: carries status and ending through unchanged for every reading, and carries declaredAs as undefined
      for a reading with no declared_as
- criterion: Where a status reading carries what the document declared that status as, that description
    is stated.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: renders exactly the given status readings, each by its own status, its own ending and its declared_as
      where carried
- criterion: A status reading's status and its ending are distinguishable from one another, neither standing
    for the other.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: renders the status and the ending under their own distinct labels, so neither could be read
      as the other
- criterion: No status the answer did not carry is stated.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: renders no status reading at all
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: carries through an empty array rather than inventing a status reading
- criterion: Each response field the answer carries is stated with the name that field names.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
    name: renders exactly the given response fields, each by its own name, path and status, and the optional
      attributes only where each is carried
- criterion: Each response field is stated with the path drafted as its responseMap value.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
    name: renders exactly the given response fields, each by its own name, path and status, and the optional
      attributes only where each is carried
- criterion: Each response field is stated with the success status it was read from.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
    name: renders exactly the given response fields, each by its own name, path and status, and the optional
      attributes only where each is carried
- criterion: Where a response field carries its declared type, its declared required listing or the envelope
    it was read through, each of those the answer carries is stated.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
    name: renders exactly the given response fields, each by its own name, path and status, and the optional
      attributes only where each is carried
  - file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
    name: 'renders ''declared required: no'' for a field whose declared_required is false, with no declared-type
      or envelope parenthetical it did not carry'
  - file: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
    name: carries declaredRequired as false rather than undefined when the field's own declared_required
      is false
- criterion: No field, path or status the answer did not carry is stated.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
    name: renders no Response fields section
  - file: src/services/connector-configuration-draft-disclosure-response-fields.spec.ts
    name: carries through an empty array rather than inventing a response field
- criterion: Each reading note the answer carries is stated with the kind that note names.
  state: partial
  tests:
  - file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
    name: renders each note's own subject paired with a translated kind label, and the detail only for
      the note that carries one
  - file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
    name: copies kind and subject through unchanged for every note, carries a carried detail through,
      and carries no detail for a note naming none
  why: 'Nothing asserts that the item the surface renders carries that note''s kind at all: a component
    that rendered the subject and detail and dropped the kind label entirely would pass both tests. The
    note''s kind reaching the operator''s eye is unexercised.'
- criterion: Each reading note is stated with the subject that note names, exactly as the answer named
    it.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
    name: renders each note's own subject paired with a translated kind label, and the detail only for
      the note that carries one
  - file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
    name: copies kind and subject through unchanged for every note, carries a carried detail through,
      and carries no detail for a note naming none
- criterion: Where a reading note carries a detail, that detail is stated beside its subject.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
    name: renders each note's own subject paired with a translated kind label, and the detail only for
      the note that carries one
- criterion: Each of the nine kinds the draft's reading-note vocabulary holds is stated distinguishably
    from every other, none presented as another.
  state: partial
  tests:
  - file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
    name: produces nine pairwise-distinct labels for the nine closed-set kind values
  - file: src/services/connector-configuration-messages.spec.ts
    name: gives the nine closed-set kinds nine different texts, none collapsed into a shared message
  why: Distinctness is established of the message module's texts and of the projection's labels, never
    of what the surface states; a surface that stated all nine kinds identically, or stated no kind, would
    leave every test in the set passing.
- criterion: No note the answer did not carry is stated.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
    name: renders no Reading notes section
  - file: src/services/connector-configuration-draft-disclosure-reading-notes.spec.ts
    name: carries through an empty array rather than inventing a reading note
- criterion: Each unresolved item the answer carries is stated with the name that answer gave it.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: shows the item's name and a reason label that is not the raw reason string
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: copies the item's name unmodified and pairs it with a non-empty reason label
- criterion: Each unresolved item is stated with the reason that answer named for it.
  state: partial
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: shows the item's name and a reason label that is not the raw reason string
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: copies the item's name unmodified and pairs it with a non-empty reason label
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: produces three pairwise-distinct labels for the three closed-set reason values
  why: 'Nothing joins a given reason to its own label: a disclosure that paired each item with another
    of the three reasons'' labels keeps the labels pairwise distinct and non-empty, so every test still
    passes while the item is stated with a reason the answer did not name for it.'
- criterion: Each of no-capability-registered, security-scheme-not-reducible-to-a-credential and drafted-key-occupied-by-another-security-scheme
    is stated distinguishably from the other two, none presented as another.
  state: covered
  tests:
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: produces three pairwise-distinct labels for the three closed-set reason values
  - file: src/services/connector-configuration-messages.spec.ts
    name: gives the three closed-set reasons three different texts, none collapsed into a shared message
- criterion: No reason outside those three is named by the surface for any unresolved item.
  state: covered
  tests:
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: falls back to its own raw reason string for a reason outside the three-value vocabulary, including
      the reason this dictionary no longer names
- criterion: No unresolved name the answer did not carry is stated.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields.spec.ts
    name: renders no Unresolved section
  - file: src/services/connector-configuration-draft-disclosure.spec.ts
    name: carries through an empty array rather than inventing an item
- criterion: While the Connector field holds no non-empty connector name, no act requesting a draft is
    offered.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
    name: renders no act and states which precondition is missing for each way the gate can be unmet,
      and renders the enabled act once both stand
- criterion: While no operation stands chosen from the fetched document's listing, no act requesting a
    draft is offered.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
    name: renders no act and states which precondition is missing for each way the gate can be unmet,
      and renders the enabled act once both stand
- criterion: While the connector name is missing, the surface states that the request waits on it, in
    the place the act would stand.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
    name: renders no act and states which precondition is missing for each way the gate can be unmet,
      and renders the enabled act once both stand
  - file: src/services/connector-configuration-messages-consumption.spec.ts
    name: renders the same string CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE holds when no
      connector name stands
- criterion: While the chosen operation is missing, the surface states that the request waits on it, in
    the place the act would stand.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
    name: renders no act and states which precondition is missing for each way the gate can be unmet,
      and renders the enabled act once both stand
- criterion: With a non-empty connector name and a chosen operation both standing, nothing here withholds
    the act.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
    name: renders no act and states which precondition is missing for each way the gate can be unmet,
      and renders the enabled act once both stand
  - file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
    name: still renders the OpenAPI document link input and the Request Draft button, once the request-gate's
      own preconditions stand
- criterion: While the read of the named link's operations has not answered, the surface states that those
    operations are being read.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders the outstanding-read message with no alert role
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: maps the pending outcome to the pending disclosure state
- criterion: Where that read answered with no operation, the surface states that the fetched document
    declares none.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders the no-operations-declared message with no alert role
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: maps an operations outcome carrying zero operations to the empty disclosure state
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: maps an operations outcome carrying one operation to the none disclosure state, not empty
- criterion: Those two statements are distinguishable from one another, neither presented as the other.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders five pairwise-distinct statements across the outstanding read, the no-operations document,
      and the three refusals, only the refusals as alerts
  - file: src/services/connector-configuration-messages.spec.ts
    name: gives the two operations-read states two different texts, neither collapsed into the other
- criterion: Each of those two statements is distinguishable from every refusal reading the operations
    read states, neither presented as one of them.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
    name: renders five pairwise-distinct statements across the outstanding read, the no-operations document,
      and the three refusals, only the refusals as alerts
  - file: src/services/connector-configuration-operations-read-disclosure.spec.ts
    name: states a reason this helper does not recognise, naming neither the fetch nor the readability
      wording
- criterion: A stated draft is marked with the link of the request that produced it.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
    name: exposes statedFor equal to exactly the dispatched link, path and method, and the connector the
      hook was constructed with
- criterion: A stated draft is marked with the operation of the request that produced it.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
    name: exposes statedFor equal to exactly the dispatched link, path and method, and the connector the
      hook was constructed with
- criterion: A stated draft is marked with the connector name of the request that produced it.
  state: covered
  tests:
  - file: src/hooks/use-draft-connector-configuration-from-openapi-stale-draft-marking.spec.ts
    name: exposes statedFor equal to exactly the dispatched link, path and method, and the connector the
      hook was constructed with
- criterion: From the moment the surface's link differs from the one the draft was generated for, the
    draft is stated as stale.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
    name: stays false right after the draft is stated, and becomes true once the link alone changes, with
      no new draft request issued
  - file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
    name: renders a staleness statement when state.stale is true
- criterion: From the moment the surface's chosen operation differs from the one the draft was generated
    for, the draft is stated as stale.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
    name: stays false right after the draft is stated, and becomes true once a different operation is
      chosen, with the link and connector left untouched
  - file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
    name: renders a staleness statement when state.stale is true
- criterion: From the moment the surface's connector name differs from the one the draft was generated
    for, the draft is stated as stale.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-helper-stale-draft-marking.spec.ts
    name: stays false right after the draft is stated, and becomes true once the caller re-renders the
      helper with a different connector
  - file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
    name: renders a staleness statement when state.stale is true
- criterion: A draft stated as stale is not discarded and nothing here withholds the act applying it.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
    name: keeps the drafted configuration visible, offers the Apply act enabled, and applies the draft's
      own unchanged configuration text, even while the draft is stale
  - file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
    name: renders no staleness statement when state.stale is false
- criterion: Where the field's unsubmitted content and the draft's configuration are both well-formed
    JSON object text, the confirmation states each top-level key the apply would add.
  state: covered
  tests:
  - file: src/services/connector-configuration-apply-diff.spec.ts
    name: reports a key only the draft holds as added, a key only the field holds as removed, and a key
      both hold with different values as changed
  - file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
    name: lists the added, removed and changed top-level keys between the unsaved edit and the draft
- criterion: Under the same condition, the confirmation states each top-level key the apply would remove.
  state: covered
  tests:
  - file: src/services/connector-configuration-apply-diff.spec.ts
    name: reports a key only the draft holds as added, a key only the field holds as removed, and a key
      both hold with different values as changed
  - file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
    name: lists the added, removed and changed top-level keys between the unsaved edit and the draft
- criterion: Under the same condition, the confirmation states each top-level key whose value the apply
    would change.
  state: covered
  tests:
  - file: src/services/connector-configuration-apply-diff.spec.ts
    name: reports a key only the draft holds as added, a key only the field holds as removed, and a key
      both hold with different values as changed
  - file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
    name: lists the added, removed and changed top-level keys between the unsaved edit and the draft
- criterion: Under the same condition, the confirmation states each key of the statusMap, responseMap,
    query and headers objects the apply would add, remove or change in value.
  state: partial
  tests:
  - file: src/services/connector-configuration-apply-diff.spec.ts
    name: computes %s's own added, removed and changed keys
  - file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
    name: lists statusMap's own added and removed keys, distinct from any top-level entry
  why: Adding and removing a nested key is exercised for all four nested objects; changing one in value
    is exercised for none of them, since every nested case holds the shared key at the same value. On
    the surface, only statusMap's added and removed keys are shown; responseMap, query and headers are
    never rendered in a confirmation.
- criterion: Where the field's content is not well-formed JSON object text, the confirmation states that
    what would change cannot be itemised.
  state: covered
  tests:
  - file: src/services/connector-configuration-apply-diff.spec.ts
    name: returns kind 'not-itemisable' for %s
  - file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
    name: shows the not-itemisable statement instead of any added, removed or changed key
- criterion: Where the operator does not confirm, the field's content stands exactly as it was.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: keeps the Configuration field's value exactly as it stood, writing none of the draft's text,
      once Keep editing is clicked
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: opens a confirmation dialog and leaves the Configuration field's value exactly as the operator
      left it
- criterion: The route components of the Configuration Helper render no operator-facing wording of their
    own; each is read from the message module.
  state: partial
  tests:
  - file: src/services/connector-configuration-messages-consumption.spec.ts
    name: renders the same string CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE holds when no
      connector name stands
  - file: src/services/connector-configuration-messages-consumption.spec.ts
    name: renders the same string CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON holds as the button's accessible
      name once a connector name and a chosen operation both stand
  - file: src/services/connector-configuration-messages-consumption.spec.ts
    name: renders the same string CONFIGURATION_HELPER_HEADING holds as the section's own heading
  why: Only three strings are tied to the module; no test enumerates the full wording the Helper's route
    components render against the module's exports.
- criterion: The route components of the configuration form render no operator-facing wording of their
    own; each is read from the message module.
  state: partial
  tests:
  - file: src/services/connector-configuration-messages-consumption.spec.ts
    name: titles the dialog with the same string APPLY_CONFIRMATION_DIALOG_TITLE holds, once a draft is
      offered over an unsaved edit
  why: Only one string is tied to the module, and the set's own specs render these same form components
    stating English wording no pt-BR module could be holding ("New connector configuration", "Saved.",
    "Discard changes?", "Cancel", "Connectors", "Retry" and the toast texts), so whether that wording
    is inline is untested.
- criterion: Every message the module holds is written in pt-BR.
  state: partial
  tests:
  - file: src/services/connector-configuration-messages.spec.ts
    name: '%s is non-empty and carries its expected pt-BR wording'
  why: 'The inventory table is hand-maintained and is short of the module: 16 exports the four configuration-readiness
    tasks added appear in no row, so "every message" is not what the test actually checks despite its
    own comment''s claim to the contrary.'
- criterion: No operator-facing wording of this surface is held anywhere under this area but that module.
  state: uncovered
  why: Nothing in the set examines where wording is held; several specs assert operator-facing English
    strings rendered by this area's own components, which is evidence but not a test of the claim — each
    would pass whether the string lived in the component or the module.
- criterion: The entry states that what is entered is a JSON object.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
    name: renders exactly the four guidance messages, in that order, as the guidance list's own items
  why: Only presence and order of the guidance item is exercised; what CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE
    actually says is asserted nowhere and is absent from the message module's own inventory test.
- criterion: The entry states that the HTTP connector reads a configuration's method, address, statusMap
    and responseMap.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
    name: renders exactly the four guidance messages, in that order, as the guidance list's own items
  why: Only presence and position of a second, distinct guidance item is exercised; no test asserts its
    wording names method, address, statusMap and responseMap.
- criterion: The entry states that the HTTP connector reads a query, headers and a body where the configuration
    declares them.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
    name: renders exactly the four guidance messages, in that order, as the guidance list's own items
  why: Only presence and position of a third, distinct guidance item is exercised; no test asserts its
    wording.
- criterion: The entry states that a placeholder is written as ${subject:<attribute-name>}, ${requester}
    or ${credential:<name>}.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
    name: renders exactly the four guidance messages, in that order, as the guidance list's own items
  why: Only presence and position of a fourth, distinct guidance item is exercised; no test asserts it
    spells the three forms.
- criterion: The entry states no claim about a connector configuration beyond those four.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
    name: renders exactly the four guidance messages, in that order, as the guidance list's own items
- criterion: The entry refuses nothing and withholds no act.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
    name: keeps Save disabled while the Configuration field holds text that is not well-formed JSON object
      text, even though the guidance itself renders in full
  - file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
    name: renders neither not-well-formed statement and leaves Save enabled for well-formed JSON object
      text
- criterion: A method outside the vocabulary is stated as a departure, naming the method key and the methods
    the vocabulary admits.
  state: covered
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states one method-outside-vocabulary departure when method is present but not one of the five
      admitted values
  - file: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
    name: renders the departures heading and the method departure's own text when the Configuration field
      holds an invalid method
- criterion: A statusMap ending outside the vocabulary is stated as a departure, naming the statusMap
    key that carries it and the endings the vocabulary admits.
  state: covered
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states one status-map-ending-outside-vocabulary departure for a single offending entry
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states one departure per offending entry when two different statusMap entries end outside the
      vocabulary
  - file: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
    name: states the statusMap entry's own departure naming 200 and the four admitted endings, and leaves
      Save enabled while that departure stands
- criterion: A statusMap that is absent or is not an object is stated as a departure naming the statusMap
    key.
  state: partial
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states a status-map-not-an-object departure, not any per-entry ending departure, when statusMap
      is absent
  why: Only the absent half is exercised, and only at the pure judgment; no content declares a statusMap
    present but not an object, and no test renders this departure on the surface.
- criterion: A responseMap that is absent, is not an object, or holds a value that is not text is stated
    as a departure naming the responseMap key.
  state: partial
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states a response-map-departure when responseMap is absent
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states a response-map-departure when responseMap is an object holding a non-string value
  why: Two of three conditions are exercised; no content declares a responseMap present but not an object,
    and no test renders this departure on the surface.
- criterion: An address that is absent or holds no text is stated as a departure naming the address key.
  state: partial
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states an address-absent-or-empty departure when the address key is absent
  why: Only absence is exercised, not present-but-empty text, and no test renders this departure on the
    surface.
- criterion: A query or headers the content declares that is not an object of texts is stated as a departure
    naming the key that departs.
  state: partial
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states a query-or-headers-not-object-of-texts departure naming query when query is declared
      as an array
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states a query-or-headers-not-object-of-texts departure naming headers when a headers entry
      holds a non-string value
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: returns no departures for query or headers when neither key is declared
  why: The judgment is exercised, but no test puts a query or headers departure on the surface.
- criterion: A placeholder written in none of the three forms is stated as a departure naming that placeholder.
  state: partial
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: states one placeholder-outside-forms departure for a malformed placeholder nested deep in the
      body, alongside well-formed subject, requester and credential placeholders held elsewhere
  why: The judgment is exercised; nothing renders a placeholder departure on the surface.
- criterion: Where the surface's own judgment finds no such departure, no departure is stated anywhere
    on it.
  state: covered
  tests:
  - file: src/services/connector-configuration-http-departures.spec.ts
    name: returns an empty array when method, statusMap, responseMap, address, query, headers and every
      placeholder are all well-formed
  - file: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
    name: renders no departures heading for a fully valid configuration
- criterion: Where every capability registered naming the connector declares the attribute name among
    its input schema properties, the surface states that the placeholder is declared.
  state: covered
  tests:
  - file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
    name: returns a declared statement when every capability in the list declares the placeholder's attribute
      name
  - file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
    name: renders the declared statement when every registered capability declares the placeholder's attribute
- criterion: Where one such capability does not declare the attribute name, the surface states that placeholder
    and names the capability that does not declare it.
  state: covered
  tests:
  - file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
    name: returns an undeclared statement naming the one capability whose input schema properties omit
      the attribute
  - file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
    name: renders the undeclared statement, naming the capability that does not declare the placeholder's
      attribute
- criterion: Where no capability is registered naming the connector, the surface states that the field's
    subject placeholders cannot be checked.
  state: partial
  tests:
  - file: src/services/connector-configuration-subject-placeholder-statements.spec.ts
    name: returns a single cannot-be-checked entry regardless of how many distinct subject placeholders
      the configuration embeds
  - file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
    name: renders the cannot-be-checked message when no capability is registered for the connector
  why: No test registers a capability naming a different connector and shows the surface still reaching
    the cannot-be-checked statement, so the "naming the connector" filter half is unexercised.
- criterion: The statement is made over the content the Configuration field currently holds, whether that
    content was typed, applied from a draft or carried by a read.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
    name: renders the declared statement when every registered capability declares the placeholder's attribute
  why: Only typed content on the create screen is exercised; not content applied from a draft nor content
    carried by a read.
- criterion: The capabilities the statement is read from come from the connector-filterable capability
    list this area already holds, and no second read of the capability registry is added.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
    name: issues a single request to the capability registry despite repeated edits to the Configuration
      field
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: offers the matching capability and omits one registered against a different connector
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: issues a single request to the capability registry despite repeated edits to the Configuration
      field
- criterion: Each ${credential:<name>} the field's well-formed content embeds is named by the statement.
  state: covered
  tests:
  - file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
    name: returns the one name a single credential placeholder carries
  - file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
    name: returns both names, each once, when two distinct credential placeholders are embedded
  - file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
    name: renders the credential statement naming the placeholder, its server-side resolution at a test
      or an observation, and that nothing on this surface checks it
- criterion: The statement says the credential is resolved from the server's own configuration at the
    moment of a test or an observation.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
    name: renders the credential statement naming the placeholder, its server-side resolution at a test
      or an observation, and that nothing on this surface checks it
  why: The assertion compares against the message function's own return value; what that function actually
    says is asserted nowhere else and is absent from the message module's inventory test.
- criterion: The statement says the credential is checked by nothing on this surface.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
    name: renders the credential statement naming the placeholder, its server-side resolution at a test
      or an observation, and that nothing on this surface checks it
  why: Same self-referential comparison; the clause's presence in the message wording is unexercised.
- criterion: No statement on the surface reports a result of having checked whether a credential placeholder
    resolves.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
    name: reports no resolution-check result for the credential placeholder beyond the statement's own
      text
  why: Only the item count of one list is checked; a resolution-check result stated elsewhere on the screen
    would leave that count unchanged.
- criterion: A responseMap key naming a top-level output schema property of a capability registered naming
    the connector is stated as read, naming that capability.
  state: covered
  tests:
  - file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
    name: classifies a matching responseMap key as read by the capability that declares it, and a non-matching
      key as read by none
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: renders all three findings for a representative configuration typed into the field
- criterion: A responseMap key naming no such property of any such capability is stated as read by no
    capability.
  state: covered
  tests:
  - file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
    name: classifies a matching responseMap key as read by the capability that declares it, and a non-matching
      key as read by none
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: renders all three findings for a representative configuration typed into the field
- criterion: Each top-level output schema property of such a capability that no responseMap key names
    is stated, naming the capability that expects it.
  state: covered
  tests:
  - file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
    name: lists only the output-schema property no responseMap key names, excluding the one a key does
      name
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: renders all three findings for a representative configuration typed into the field
- criterion: Where no capability is registered naming the connector, the surface states that which fields
    an observation would carry cannot be read.
  state: partial
  tests:
  - file: src/services/connector-configuration-response-map-capability-coverage.spec.ts
    name: returns cannot-be-read for an empty capability list regardless of the responseMap's own keys
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: renders the cannot-be-read message when no capability is registered for the typed connector
  why: No test registers a capability naming a different connector and shows the surface reaching this
    statement anyway.
- criterion: The statement is made over the content the Configuration field currently holds.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: renders all three findings for a representative configuration typed into the field
- criterion: The statement is made over the configuration of a draft the surface states, as well as over
    the field's content.
  state: covered
  tests:
  - file: src/routes/connector-configuration-helper-fields-response-map-capability-coverage.spec.ts
    name: renders the read statement for a responseMap key the draft's own configuration declares
- criterion: While the surface's own judgment finds the field's content not well-formed JSON object text,
    no act submitting a registration through register-connector is offered.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
    name: withholds Save and states the not-an-object message for a JSON array
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: shows the same plain warning once a valid loaded configuration is edited into unparsable text,
      and disables Save while it stays that way
- criterion: While that act is withheld, the statement that judgment owes stands in the act's place.
  state: partial
  tests:
  - file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
    name: withholds Save and states the not-an-object message for a JSON array
  why: That the statement stands while the act is withheld is exercised; "in the act's place" is not —
    no test compares document position between the statement and the withheld act.
- criterion: A stated departure from what the HTTP connector requires does not withhold the act submitting
    a registration.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-submission-withheld-only-on-well-formedness.spec.ts
    name: leaves Save enabled despite all four sibling readiness statements standing at once over one
      well-formed configuration
- criterion: A stated subject placeholder no registered capability declares does not withhold the act
    submitting a registration.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
    name: leaves Save enabled while the undeclared subject-placeholder statement stands
- criterion: A stated credential placeholder does not withhold the act submitting a registration.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
    name: leaves Save enabled while the credential-placeholder statement stands
- criterion: A stated responseMap key no registered capability reads does not withhold the act submitting
    a registration.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: leaves Save enabled while a key is read by no capability and an expected field stands unnamed
- criterion: A stated output schema property no responseMap key names does not withhold the act submitting
    a registration.
  state: covered
  tests:
  - file: src/routes/connector-configuration-form-fields-response-map-capability-coverage.spec.ts
    name: leaves Save enabled while a key is read by no capability and an expected field stands unnamed
findings:
- pass: conformance
  file: src/hooks/use-connector-configuration-helper.ts
  where: the ConnectorConfigurationHelperState type (lines 21 and 23) and its implementation in the hook's
    return (lines 73 and 75)
  evidence: 'readonly onPathChange: (value: string) => void;

    readonly onMethodChange: (value: string) => void;

    ...

    onPathChange: setPath,

    ...

    onMethodChange: setMethod,'
  cost: a consumer of this hook can set path or method to any typed string through onPathChange/onMethodChange,
    independently of onChooseOperation; the request onRequestDraft then issues — requestDraft({ link,
    path, method }) — would name a path or a method the operator typed rather than one chosen from the
    fetched document's own listing, which the rule states never happens, and nothing else in this file
    withholds that capability. (against rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing)
  correction: drop onPathChange and onMethodChange from the hook's returned state (keep setPath/setMethod
    internal, reachable only through onChooseOperation) so path and method can only ever be set from a
    chosen operation of the fetched listing.
- pass: conformance
  file: src/hooks/use-draft-connector-configuration-from-openapi.spec.ts
  where: the describe/it text and literal fixture value at lines 255-262
  evidence: "describe(\"ConnectorConfigurationDraftUnresolvedItem -- reason is a plain string, not narrowed\
    \ to the closed set of four reason literals (inference)\", () => {\n  it(\"type-checks a reason value\
    \ outside the closed reason set\", () => {\n    const buildItem = (): ConnectorConfigurationDraftUnresolvedItem\
    \ => ({\n      name: \"api-key\",\n      reason: \"a-reason-the-closed-four-value-set-does-not-name\"\
    ,\n    });"
  cost: A reader trusting this test's own description learns the unresolved reason vocabulary has four
    members; the specification's own enumeration has three (no-capability-registered, security-scheme-not-reducible-to-a-credential,
    drafted-key-occupied-by-another-security-scheme), so the next person who adds or checks a fourth reason
    against this test's account is working from a count the specification never gave. (against domain/integration/connector-configuration-draft-unresolved-reason)
  correction: Restate the describe title and the literal fixture value against the three-member set the
    node actually holds, rather than a four-member one.
- pass: conformance
  file: src/hooks/use-draft-connector-configuration-from-openapi.ts
  where: the isDispatchingRef guard inside requestDraft, lines 211-218
  evidence: "const requestDraft = (request: DraftConnectorConfigurationFromOpenApiRequest): void => {\n\
    \    if (isDispatchingRef.current) {\n      return;\n    }\n    isDispatchingRef.current = true;\n\
    \n    mutation.reset();"
  cost: 'An operator who invokes requestDraft again while an earlier draft request for this same helper
    is still outstanding has the second request silently dropped: no call reaches the backend, isDispatchingRef.current
    stays true until the first call''s onSettled fires, and nothing in the returned outcome or statedFor
    changes to tell the operator their second click did nothing. The node this file otherwise implements
    says only that what a surface states while a draft request is outstanding "is not decided here" —
    so the choice to drop rather than queue, replace or refuse a repeated request was made here, in code,
    and the specification is silent on it.'
  correction: Decide, in the specification, what a repeated draft request does while an earlier one for
    the same connector/operation is still outstanding — dropped, queued, or refused — and let this guard
    follow that decision rather than stand as the only place it is made.
- pass: conformance
  file: src/routes/connector-configuration-create-screen.spec.ts
  where: the describe block title, line 91
  evidence: 'describe("ConnectorConfigurationCreateScreen -- the footer Connectors link registers nothing
    before it navigates (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing
    leaves open whether the route submits before landing on the listing)", () => {'
  cost: 'A reader of this suite who trusts the parenthetical will believe the specification leaves open
    whether the Connectors-link route may still issue a register-connector call once it has landed on
    the listing — but the node the comment names, read directly, forecloses any register-connector call
    from this route at all, before or after: "taking that route registers nothing and alters no registered
    configuration" and "Following that route from s issues no register-connector call and leaves every
    registered connector configuration exactly as it stood." Nothing is left open for a later request
    to settle differently. (against rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing)'
  correction: Drop the "UNDERDETERMINED" framing, or correct it to state that rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
    already forecloses any register-connector call tied to this route, not only one issued before navigating.
- pass: conformance
  file: src/routes/connector-configuration-form-fields-subject-placeholder-statements.spec.ts
  where: the third describe block ("the subject-placeholder statement is read from the capability list
    this area already holds, adding no second registry read (criterion 5)") and its single test
  evidence: "it(\"issues a single request to the capability registry despite repeated edits to the Configuration\
    \ field\", async () => {\n  const fetchMock = await mountWithCapabilities([capability()]);\n  await\
    \ typeConnector(CONNECTOR);\n  await typeConfiguration(JSON.stringify({ address: \"${subject:account-id}\"\
    \ }));\n  await screen.findByText(subjectPlaceholderDeclaredText(\"account-id\"));\n  await typeConfiguration(JSON.stringify({\
    \ address: \"${subject:account-id}\", extra: \"x\" }));\n  await screen.findByText(subjectPlaceholderDeclaredText(\"\
    account-id\"));\n  const capabilitiesCalls = fetchMock.mock.calls.filter(\n    ([input]) => (typeof\
    \ input === \"string\" ? input : input.toString()) === CAPABILITIES_PATH,\n  );\n  expect(capabilitiesCalls).toHaveLength(1);\n\
    });"
  cost: This pins a specific caching/consistency guarantee — that the capability registry is read once
    and reused across every edit to the Configuration field — as a binding behavioral contract. Neither
    this node pack nor a specification-wide search surfaces any node that requires this. A future implementer
    who re-reads the registry on each edit would be breaking a guarantee that exists only in this test
    file, with no specification account of why it holds or how far it may be relaxed.
  correction: State, in the governing rule or a sibling node, whether and when the capability list backing
    this statement may be re-read, so this test enforces a decided fact rather than an undocumented one.
- pass: conformance
  file: src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
  where: describe block "a stale drafted disclosure clears the moment a new request begins (UNDERDETERMINED
    note 3)"
  evidence: 'expect(screen.getByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeTruthy();

    expect(screen.queryByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeNull();

    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();

    expect(screen.queryByRole("alert")).toBeNull();'
  cost: The test fixes, as a passing assertion, exactly what the surface presents once a new draft request
    begins over an earlier answered draft. Two nodes touching this file both say this is not decided ("What
    that surface states while a draft request is outstanding is not decided here"). A future node deciding
    this differently would leave this test the one place disagreeing with the specification.
  correction: Decide, in a node constraining domain/integration/connector-configuration-draft, what the
    Configuration Helper states while a new draft request is outstanding over an earlier answered draft,
    then align this test to that decision.
- pass: conformance
  file: src/routes/connector-configuration-helper-fields-independent-content-and-staleness.spec.ts
  where: describe block "a stale refusal clears the moment a new request begins (UNDERDETERMINED note
    3)"
  evidence: 'expect(screen.getByRole("alert")).toBeTruthy();

    expect(screen.queryByRole("alert")).toBeNull();

    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();'
  cost: Same gap as the sibling block above, over a refused rather than an answered draft request.
  correction: Decide, in a node constraining domain/integration/connector-configuration-draft, what the
    Configuration Helper states while a new draft request is outstanding over an earlier refused request,
    then align this test to that decision.
- pass: conformance
  file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  where: the describe block "a listed operation's method is not upper-cased when the state's own entry
    names it lower-case (UNDERDETERMINED, from rules/integration/an-openapi-operations-method-is-upper-cased)"
  evidence: "describe(\"...UNDERDETERMINED, from rules/integration/an-openapi-operations-method-is-upper-cased)\"\
    , () => {\n  it(\"states the method upper-cased on the option regardless of the case the entry itself\
    \ holds\", () => {\n    renderFields(stateWith({ operations: [operation(\"/items\", \"get\")] }));\n\
    \    expect(label).toContain(\"GET\");\n  });\n});"
  cost: The candidate node an-openapi-operations-method-is-upper-cased already settles this as an invariant,
    and this file's own assertion enforces exactly that. The describe title nonetheless calls the behavior
    "UNDERDETERMINED" and says the method "is not upper-cased" — a reader who trusts the label is told
    the specification leaves this open and that the code does the opposite of what it actually does. (against
    rules/integration/an-openapi-operations-method-is-upper-cased)
  correction: Rename the describe title to state the method is upper-cased per the node it cites, removing
    "UNDERDETERMINED" and "is not upper-cased".
- pass: conformance
  file: src/routes/connector-test-panel-fields.spec.ts
  where: the fourth describe/it block's own titles
  evidence: "describe(\"ConnectorTestPanelFields — a subject attribute-value naming an attribute the glossary\
    \ does not hold still reaches the outbound Test call (UNDERDETERMINED, from rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)\"\
    , () => {\n  it(\"dispatches POST /v1/test-connector carrying a subject attribute-value whose name\
    \ is not a glossary-held subject attribute, rather than refusing it\", async () => {"
  cost: A reader who trusts this title over the specification learns that whether a Test-panel subject
    attribute must be glossary-held is unsettled, and goes looking for a decision that was in fact already
    made in a node this title does not cite for this surface. (against rules/integration/a-connector-configuration-is-tested-through-a-registered-capability)
  correction: Remove the "(UNDERDETERMINED, from rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)"
    qualifier and the "rather than refusing it" framing; state instead what rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    already decides.
- pass: conformance
  file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  where: describe block "requester is collected as a plain free-text field (disclosed inference)", its
    one test
  evidence: 'const requesterInput = within(dialog).getByLabelText<HTMLInputElement>("Requester");

    expect(requesterInput.tagName).toBe("INPUT");

    expect(requesterInput.getAttribute("role")).not.toBe("combobox");

    fireEvent.change(requesterInput, { target: { value: "operator@example.com" } });

    expect(requesterInput.value).toBe("operator@example.com");'
  cost: The file fixes, as a fact about the connector-test operation, that a test's requester is collected
    from the operator as an unverified, freely-typed string. The specification closes this exact question
    by name for a diagnose and for a simulation, but rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
    — the one rule that states everything the test-connector action assembles — names only Subject attributes
    and never mentions a requester at all, though an-http-connector-configuration-declares-its-call admits
    a ${requester} placeholder in the same call.
  correction: A node — most naturally an addition to rules/integration/a-connector-configuration-is-tested-through-a-registered-capability,
    or a sibling rule — stating whether test-connector's call carries a requester at all, and if so that
    it is supplied directly by the operator with no further resolution or verification.
- pass: conformance
  file: src/services/connector-configuration-apply-diff.spec.ts
  where: const NESTED_KEYS = ["statusMap", "responseMap", "query", "headers"] as const;
  evidence: const NESTED_KEYS = ["statusMap", "responseMap", "query", "headers"] as const;
  cost: The four-key vocabulary this node names is already exported from the implementation as NESTED_OBJECT_KEYS,
    but this test re-declares the same four literals independently rather than importing that export.
    If the node's set of itemised keys ever changes, the implementation's own constant and this spec's
    local list are two places that both have to be edited in step. (against rules/integration/an-apply-confirmation-states-what-the-draft-would-change)
  correction: Import NESTED_OBJECT_KEYS from ./connector-configuration-apply-diff and iterate over it
    in the it.each, instead of re-declaring the four key names as a local literal array.
- pass: conformance
  file: src/services/connector-configuration-apply-diff.ts
  where: the draftObject === null branch inside computeApplyConfirmationDiff
  evidence: 'const draftObject = parseJsonObject(draftText);

    if (draftObject === null) { return { kind: "not-itemisable" }; }'
  cost: an-apply-confirmation-states-what-the-draft-would-change conditions "cannot be itemized" solely
    on the field's own content failing to be well-formed, and a-connector-configuration-drafts-configuration-is-well-formed-object-text
    declares a draft's configuration is always well-formed — so no node describes what should happen if
    the draft's own text ever failed to parse. This branch folds that unaddressed case into the same "not-itemisable"
    outcome as an ordinary malformed edit. (against rules/integration/an-apply-confirmation-states-what-the-draft-would-change)
  correction: Either extend the node to state what the confirmation shows when the draft's own configuration
    is not well-formed, or drop this branch and trust the invariant that a generated draft's configuration
    is always well-formed.
- pass: conformance
  file: src/services/connector-configuration-draft-disclosure.spec.ts
  where: each status reading is projected into its own status, ending and declared_as, one-to-one and
    unmodified
  evidence: 'status_readings: [{ status: "200", ending: "record-stub-response", declared_as: "Successful
    profile retrieval" }, { status: "403", ending: "skip-endpoint" }],'
  cost: The fixture presents "record-stub-response" and "skip-endpoint" as ordinary drafted statusMap
    endings, but connector-configuration-draft-status-reading types its "ending" attribute as a closed
    enumeration of exactly ok, unavailable, denied and timeout. A reader or later test-writer has no way
    to tell these two strings are not real evidence-result endings a draft could ever carry. (against
    domain/integration/connector-configuration-draft-status-reading)
  correction: Replace "record-stub-response" and "skip-endpoint" with two of the four evidence-result
    values the ending attribute is actually typed against, e.g. "ok" and "denied".
- pass: conformance
  file: src/services/connector-configuration-http-departures.spec.ts
  where: the describe/it block "an absent method key states no method departure (the task's own resolved
    reading of criterion 1)"
  evidence: "describe(\"computeHttpConnectorDepartures -- an absent method key states no method departure\
    \ (the task's own resolved reading of criterion 1)\", () => {\n  it(\"returns no departures for an\
    \ otherwise well-formed configuration declaring no method key at all\", () => { const departures =\
    \ departuresFor(withoutKey(baseConfig(), \"method\")); expect(departures).toEqual([]); });\n});"
  cost: The node states an observation reaching a configuration lacking any of the three (method, responseMap,
    statusMap) issues no call and ends unavailable — treating an absent method exactly as it treats an
    absent responseMap or statusMap, both of which this same file DOES assert as departures. By instead
    asserting zero departures for an absent method, an operator who leaves out statusMap/responseMap/address
    is warned but one who leaves out method is not. (against rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary)
  correction: Either the function (and this test) should state a departure for an absent method key on
    the same footing as absent statusMap/responseMap/address, or the node should say method is treated
    differently — decided into the specification rather than left to the task's own resolved reading.
- pass: conformance
  file: src/services/connector-configuration-http-departures.spec.ts
  where: the describe/it block "a statusMap key that is not a valid HTTP-status-shaped string draws no
    departure of its own"
  evidence: "describe(\"computeHttpConnectorDepartures -- a statusMap key that is not a valid HTTP-status-shaped\
    \ string draws no departure of its own, only its ending value is judged (the task's own resolved reading)\"\
    , () => {\n  it(\"returns no departures for a statusMap entry keyed 'notAStatus' whose value is an\
    \ admitted ending\", () => { const departures = departuresFor(baseConfig({ statusMap: { notAStatus:\
    \ \"ok\" } })); expect(departures).toEqual([]); });\n});"
  cost: The vocabulary node says nothing about what to do when a statusMap key is not itself shaped like
    an HTTP status; this test asserts a specific resolution and its own title concedes it is "the task's
    own resolved reading" rather than something any node states. (against rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary)
  correction: Decide, into the vocabulary node, whether a statusMap key not shaped as an HTTP status is
    itself a departure, and disclose that decision in the decision log.
- pass: conformance
  file: src/services/connector-configuration-http-departures.ts
  where: methodDeparture
  evidence: "function methodDeparture(configuration: Record<string, unknown>): HttpConnectorDeparture\
    \ | null {\n  if (!(\"method\" in configuration)) { return null; }"
  cost: an-http-connector-configuration-declares-its-method-and-status-vocabulary requires method, responseMap
    and statusMap alike, stating that an observation reaching a configuration lacking any of the three
    issues no call and ends unavailable with a MalformedHttpConnectorConfigurationError. statusMapDepartures
    and responseMapDeparture both report a departure when their own key is absent, but methodDeparture
    returns null — no departure — when the method key is missing entirely. (against rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary)
  correction: methodDeparture should treat an absent method key as a departure, as statusMapDepartures
    and responseMapDeparture already do for statusMap and responseMap.
- pass: conformance
  file: src/services/connector-configuration-messages-consumption.spec.ts
  where: the DRAFT_ROUTE fetch stub's mocked draft answer
  evidence: 'jsonResponse({ connector: "deepl-connector", configuration: ''{"distinctive":true}'', unresolved:
    [], generated_credentials: [] }),'
  cost: This is the file's one stand-in for what draft-connector-configuration-from-openapi answers, and
    it models a complete, successful draft with only four of the seven attributes domain/integration/connector-configuration-draft
    declares required (status_readings, response_fields and reading_notes are absent, not even as empty
    arrays).
  correction: Include status_readings, response_fields and reading_notes in the mocked answer (each required,
    so an empty array where the scenario has nothing to disclose).
- pass: conformance
  file: src/services/connector-configuration-messages.spec.ts
  where: the comment claiming criterion-3 coverage and the describe/it block asserting every INVENTORY
    entry
  evidence: '// proving criterion 3 ("every message the module holds is written in pt-BR") over the module''s
    whole, finite inventory, not a sample of it.

    it.each(INVENTORY)("%s is non-empty and carries its expected pt-BR wording", (_label, value, expectedFragment)
    => { expect(value.length).toBeGreaterThan(0); expect(value).toContain(expectedFragment); });'
  cost: Every INVENTORY entry is asserted against a Portuguese fragment, making "the operator-facing vocabulary
    is authored in Brazilian Portuguese" a hard requirement — yet no node in the specification states
    any language or locale requirement for these surfaces.
  correction: State the pt-BR (or whichever locale) requirement as a node the specification holds, and
    let this test verify that node's requirement rather than being its sole record.
- pass: conformance
  file: src/services/connector-configuration-messages.spec.ts
  where: NINE_READING_NOTE_KINDS
  evidence: const NINE_READING_NOTE_KINDS = ["default-response-not-drafted", "status-range-not-drafted",
    "non-json-success-content-not-read", "envelope-read-through", "variants-united", "repeated-field-name-path-not-taken",
    "no-responses-declared", "no-success-response-schema", "success-schema-declares-no-properties"] as
    const;
  cost: The closed set of reading-note kinds is retyped here as a bare string-literal array with no link
    back to the module's own type, so a specification change would not be caught by this test. (against
    domain/integration/connector-configuration-draft-reading-note-kind)
  correction: Derive NINE_READING_NOTE_KINDS from the module's own exported type instead of re-listing
    the nine literal strings.
- pass: conformance
  file: src/services/connector-configuration-messages.spec.ts
  where: THREE_UNRESOLVED_REASONS
  evidence: const THREE_UNRESOLVED_REASONS = ["no-capability-registered", "security-scheme-not-reducible-to-a-credential",
    "drafted-key-occupied-by-another-security-scheme"] as const;
  cost: The closed set of unresolved reasons is retyped here rather than read from the module's own type,
    so a reason added, renamed or removed would not be caught by comparing against it. (against domain/integration/connector-configuration-draft-unresolved-reason)
  correction: Derive THREE_UNRESOLVED_REASONS from the module's own exported type instead of re-listing
    the three literal strings.
- pass: standard
  file: src/routes/connector-configuration-form-fields.tsx
  where: lines 142-161, function configurationTextParsesToNonObject and the component ConfigurationNotAnObjectStatement
    that calls it
  evidence: "function configurationTextParsesToNonObject(text: string): boolean {\n  let parsed: unknown;\n\
    \  try { parsed = JSON.parse(text); } catch { return false; }\n  return !isPlainRecord(parsed);\n}"
  cost: Every sibling computation this same component renders beside it is factored into its own services/*.ts
    module with its own dedicated spec file; this one well-formedness check is the only one of the group
    left inline in the route component, with no unit spec of its own.
  cites: ARC-03
  correction: Extract configurationTextParsesToNonObject into a services/*.ts module (mirroring the parseConfigurationObject
    helper already duplicated across the sibling services) and give it its own unit spec.
- pass: standard
  file: src/routes/connector-configuration-form-fields.tsx
  where: lines 214-232, the three useMemo calls wrapping computeApplyConfirmationDiff, computeHttpConnectorDepartures
    and computeCredentialPlaceholderStatements
  evidence: 'const applyConfirmationDiff = useMemo<ApplyConfirmationDiff | null>(() => pendingApplyText
    === null ? null : computeApplyConfirmationDiff(configuration.value, pendingApplyText), [configuration.value,
    pendingApplyText]);

    const httpConnectorDepartures = useMemo(() => computeHttpConnectorDepartures(configuration.value),
    [configuration.value]);

    const credentialPlaceholderStatements = useMemo(() => computeCredentialPlaceholderStatements(configuration.value),
    [configuration.value]);'
  cost: Three independent computations over one short configuration text are each wrapped in useMemo with
    no recorded measurement showing the work is expensive enough to justify it.
  cites: PRF-02
  correction: Compute these values directly in the render body, or add a recorded measurement justifying
    the memoization for one or more of them.
reconciliation: siegard-reconcile/connector-configuration-draft-status-response-maps-frontend.md
---

## What it is
The four-pass review of the drafted-answer-disclosure and configuration-readiness epics' frontend delivery.

## Notes
None.
