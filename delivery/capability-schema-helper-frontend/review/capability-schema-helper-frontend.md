---
target: frontend
title: Capability Schema Helper -- frontend surface, first review
summary: 'The four passes'' findings over the six delivered tasks of capability-schema-helper-frontend:
  the draft request/outcome hook, the Schema Helper''s offer and placement, the drafted
  and refused disclosures, the two apply acts, and the staleness marking.'
reviewed:
- src/hooks/use-apply-to-json-schema-field.ts
- src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
- src/hooks/use-capability-schema-helper.spec.ts
- src/hooks/use-capability-schema-helper.ts
- src/hooks/use-draft-capability-schema-from-openapi.spec.ts
- src/hooks/use-draft-capability-schema-from-openapi.ts
- src/routes/capability-form-fields-schema-apply.spec.ts
- src/routes/capability-form-fields-schema-draft-staleness.spec.ts
- src/routes/capability-form-fields-schema-helper-detail-placement.spec.ts
- src/routes/capability-form-fields-schema-helper-offer.spec.ts
- src/routes/capability-form-fields.tsx
- src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
- src/routes/capability-schema-helper-fields.spec.ts
- src/routes/capability-schema-helper-fields.tsx
- src/services/capability-schema-draft-disclosure.spec.ts
- src/services/capability-schema-draft-disclosure.ts
- src/services/capability-schema-messages.spec.ts
- src/services/capability-schema-messages.ts
- src/services/error-ui-state.spec.ts
tasks:
- task/schema-helper-request-and-statement/draft-request-outcome
- task/schema-helper-request-and-statement/helper-offered-on-the-authoring-surface
- task/schema-helper-request-and-statement/answered-draft-stated-to-the-operator
- task/schema-helper-request-and-statement/refusal-stated-to-the-operator
- task/schema-draft-applied-to-the-capability-edit/schema-fields-written-only-by-applying
- task/schema-draft-applied-to-the-capability-edit/stated-draft-marked-stale
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed over every step; there was no failure to diagnose
coverage:
- criterion: The hook dispatches a POST to draft-capability-schema-from-openapi carrying
    a body of exactly link, path and method, taken from the link the operator named
    and the operation they chose.
  state: partial
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: sends exactly {link, path, method} in the POST body, taken from the request
      passed to requestDraft
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: sends exactly {link, path, method} from the chosen operation, and exposes
      the drafted outcome once it resolves
  why: 'The body''s exact three fields and their origin in the operator''s link and
    chosen operation are both asserted, but the verb is not: the fetch stubs capture
    init and never assert init.method is "POST", so a dispatch issued as GET or PUT
    to the same route with the same body would satisfy every assertion in the set.'
- criterion: The request is issued through the existing apiFetch client in frontend/app/src/services/api-client.ts,
    and no module added by this task builds a fetch of its own or parses a response
    envelope of its own.
  state: uncovered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: issues exactly one network call, to the published draft route, never to
      the operator-named link itself or to any other operation
  why: The test labelled for this criterion asserts only the URL the single call went
    to. Every test in the set stubs the global fetch, so a module that built its own
    fetch call to the same relative route and decoded the {error:{code}} envelope
    itself would pass unchanged; nothing exercises apiFetch as the path taken, and
    nothing exercises the ApiError the shared client would raise as the value the
    refusal mapping reads.
- criterion: No module added by this task issues a request to an OpenAPI document's
    own URL; the document is reached only through a backend operation.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: issues exactly one network call, to the published draft route, never to
      the operator-named link itself or to any other operation
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: never issues a request whose URL is the operator-named link itself, once
      that link is named
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: lists the operations the shared hook's own read answers for the link, touching
      no other operations route
- criterion: An HTTP 200 answer resolves to a drafted outcome carrying that answer's
    input_schema, its output_schema, and each unresolved item's name and reason, with
    no name and no reason the answer did not carry.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: carries the link, path and method of the request answered, and a draft holding
      exactly input_schema, output_schema and unresolved -- no field the answer's
      top level did not carry
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: strips any field an unresolved item carried beyond name and reason
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: exposes unresolved as an empty array when the answer carried none
- criterion: An answer reporting OpenApiDocumentNotFetchedError resolves to an outcome
    distinct from the outcome either other refusal code resolves to.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: resolves $label to $expectedKind, carrying the link, path and method of
      the request it answered
- criterion: An answer reporting OpenApiDocumentNotReadableError resolves to an outcome
    distinct from the outcome either other refusal code resolves to.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: resolves $label to $expectedKind, carrying the link, path and method of
      the request it answered
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: starts idle before any dispatch, stays pending -- neither drafted nor any
      refusal -- while the request is unanswered, and only reports a refusal once
      the operation actually answers
- criterion: An answer reporting OpenApiOperationNotFoundError resolves to an outcome
    distinct from the outcome either other refusal code resolves to.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: resolves $label to $expectedKind, carrying the link, path and method of
      the request it answered
- criterion: An answer carrying any other error code resolves to an unrecognised-failure
    outcome that is neither a drafted outcome nor any of the three named refusal outcomes.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: resolves $label to unrecognized-failure, distinct from drafted and the three
      named refusals
- criterion: While a dispatched request stands unanswered, the outcome is the pending
    one and is neither a drafted outcome nor any refusal outcome.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: starts idle before any dispatch, stays pending -- neither drafted nor any
      refusal -- while the request is unanswered, and only reports a refusal once
      the operation actually answers
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: issues exactly one network call when requestDraft is invoked twice before
      the first settles
- criterion: Where no request has been dispatched, the outcome is the idle one and
    is neither a drafted outcome nor any refusal outcome.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: starts idle before any dispatch, stays pending -- neither drafted nor any
      refusal -- while the request is unanswered, and only reports a refusal once
      the operation actually answers
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: issues no network request when onRequestDraft is called with no chosen operation
- criterion: A drafted or refused outcome carries the link, the path and the method
    of the request it answers, exactly as that request named them.
  state: partial
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: carries the link, path and method of the request answered, and a draft holding
      exactly input_schema, output_schema and unresolved -- no field the answer's
      top level did not carry
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: resolves $label to $expectedKind, carrying the link, path and method of
      the request it answered
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: sends exactly {link, path, method} from the chosen operation, and exposes
      the drafted outcome once it resolves
  why: The drafted outcome and the three named refusal outcomes are each asserted
    to carry the answered request's link, path and method. The unrecognized-failure
    outcome is exercised only for its kind, and the fixtures elsewhere in the set
    construct it as {kind:"unrecognized-failure"} with no link, path or method at
    all; whether that outcome is one of the "refused" outcomes this criterion binds
    is not settled by the criterion's wording, and no test in the set decides it either
    way.
- criterion: A dispatch attempted while a request is in flight issues no second request
    to the operation.
  state: covered
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: issues exactly one network call when requestDraft is invoked twice before
      the first settles
- criterion: The capability create screen presents the Schema Helper beneath its Input
    schema and Output schema fields, on the surface the capability is authored from
    and not on a separate screen or a dialog of its own.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
    name: walks from no operation chosen to a dispatched draft request, touching no
      register-capability call throughout
- criterion: The capability detail screen presents the Schema Helper beneath its Input
    schema and Output schema fields, on the surface the capability is edited from
    and not on a separate screen or a dialog of its own.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-helper-detail-placement.spec.ts
    name: renders the Schema Helper positioned after the Output schema field, with
      no dialog on the page
- criterion: The helper takes an OpenAPI document link from the operator and lists
    that document's own declared operations, read through the existing use-openapi-document-operations
    hook rather than through a second operations reader.
  state: partial
  tests:
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: lists the operations the shared hook's own read answers for the link, touching
      no other operations route
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: opens onto exactly one option per entry in state.operations, both entries
      represented
  - file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
    name: walks from no operation chosen to a dispatched draft request, touching no
      register-capability call throughout
  why: That the operator's link drives a read and that every listed operation comes
    from the answer is exercised. The "rather than through a second operations reader"
    half is asserted only at the level of the route requested -- every captured URL
    starts with the operations-read prefix -- so a second reader module issuing the
    same request to the same route would pass; nothing in the set exercises the shared
    hook as the one reader involved.
- criterion: The helper offers no free-hand entry of a path and no free-hand entry
    of an HTTP method; an operation is named only by choosing one of the listed operations.
  state: partial
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: invokes onChooseOperation once with the exact chosen entry, not a distractor
      sharing the same path
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders no textbox whose accessible name refers to a path
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders no textbox whose accessible name refers to a method
  - file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
    name: walks from no operation chosen to a dispatched draft request, touching no
      register-capability call throughout
  why: The positive half -- an operation named only by choosing a listed entry, the
    exact entry reaching onChooseOperation -- is exercised. The two negative assertions
    query for a textbox named /path/i and /method/i, English names on a surface whose
    own labels are Portuguese ("Operação", "Link do documento OpenAPI"); a free-hand
    entry labelled "Caminho" or "Método" would satisfy both queries, so the absence
    of free-hand entry is not exercised in the terms the surface actually uses.
- criterion: Where no operation stands chosen, the helper states in the request act's
    own place that it waits on a chosen operation.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders the waiting message and no request button while unchosen, and an
      enabled request button dispatching onRequestDraft once an operation is chosen
  - file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
    name: walks from no operation chosen to a dispatched draft request, touching no
      register-capability call throughout
- criterion: Where no operation stands chosen, no draft request is dispatched by any
    act the helper offers.
  state: covered
  tests:
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: issues no network request when onRequestDraft is called with no chosen operation
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders the waiting message and no request button while unchosen, and an
      enabled request button dispatching onRequestDraft once an operation is chosen
- criterion: Where an operation stands chosen, the act requesting a capability schema
    draft is offered.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders the waiting message and no request button while unchosen, and an
      enabled request button dispatching onRequestDraft once an operation is chosen
  - file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
    name: walks from no operation chosen to a dispatched draft request, touching no
      register-capability call throughout
- criterion: Requesting a draft issues no register-capability call, and the capability
    registry stands exactly as it stood.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
    name: walks from no operation chosen to a dispatched draft request, touching no
      register-capability call throughout
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
- criterion: Where the outcome is a drafted one, the surface states that answer's
    input_schema text.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns inputSchema and outputSchema equal, character for character, to
      the draft's own fields, and no key beyond inputSchema, outputSchema and unresolved
- criterion: Where the outcome is a drafted one, the surface states that answer's
    output_schema text.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns inputSchema and outputSchema equal, character for character, to
      the draft's own fields, and no key beyond inputSchema, outputSchema and unresolved
- criterion: Every unresolved item the answer carried is stated, each by the name
    that answer gave it.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: maps every unresolved entry in order, preserving each one's own name and
      reason and adding nothing beyond a reasonLabel
- criterion: Each stated unresolved item carries the reason the answer named for it.
  state: partial
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: maps every unresolved entry in order, preserving each one's own name and
      reason and adding nothing beyond a reasonLabel
  - file: src/services/capability-schema-messages.spec.ts
    name: gives schema-not-reducible-to-a-type and name-claimed-by-another-parameter
      two distinct, non-empty labels, and returns a value outside the two-value vocabulary
      unchanged
  why: The disclosure preserves each entry's own reason value, and the rendered labels
    are asserted to be non-empty, per-item, and distinct between the two reasons.
    No test in the set pins either reason to the wording actually stated for it --
    the label assertions compare labels to each other, never to an expected text --
    so an implementation that stated the schema-not-reducible wording against a name-claimed-by-another-parameter
    item, and vice versa, would satisfy every assertion. The half unexercised is that
    the reason stated is that item's own reason rather than the other one.
- criterion: An item whose reason is schema-not-reducible-to-a-type is stated apart
    from an item whose reason is name-claimed-by-another-parameter, neither read as
    the other and neither collapsed into a single undifferentiated reason.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/services/capability-schema-messages.spec.ts
    name: gives schema-not-reducible-to-a-type and name-claimed-by-another-parameter
      two distinct, non-empty labels, and returns a value outside the two-value vocabulary
      unchanged
- criterion: Where the answer carries one name under both reasons, both items are
    stated, each under its own reason.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
- criterion: The surface states no unresolved name the answer did not carry.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders no unresolved list item when the answer's unresolved list is empty
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: strips any field an unresolved item carried beyond name and reason
- criterion: The surface states no unresolved reason the answer did not carry for
    the item it is stated against.
  state: partial
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders both schema texts verbatim and exactly the three unresolved items
      the answer carried, each labeled under its own reason
  - file: src/services/capability-schema-messages.spec.ts
    name: gives schema-not-reducible-to-a-type and name-claimed-by-another-parameter
      two distinct, non-empty labels, and returns a value outside the two-value vocabulary
      unchanged
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: maps every unresolved entry in order, preserving each one's own name and
      reason and adding nothing beyond a reasonLabel
  why: 'That a reason label is not invented out of nothing is exercised -- an unknown
    reason falls back to itself, and each item''s reason survives the disclosure unaltered.
    What is unexercised is the "for the item it is stated against" half: no assertion
    ties a specific reason to the specific wording stated for it, so a mapping that
    rendered each of the two reasons under the other''s wording would state, against
    each item, a reason the answer did not carry for it, and every test in the set
    would still pass.'
- criterion: Where the answer carried no unresolved item, no unresolved name and no
    reason stands stated.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders no unresolved list item when the answer's unresolved list is empty
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns an empty unresolved array for a draft carrying none
- criterion: Where the answer reports OpenApiDocumentNotFetchedError, the surface
    states that no draft was generated and states that condition apart from the other
    two.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders the not-fetched refusal as an alert stating no draft was generated
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders a pairwise-distinct alert for each of the four refusal outcomes,
      none of them alongside a drafted input schema, output schema or unresolved-item
      section
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns the not-fetched message for an openapi-document-not-fetched outcome
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: produces four pairwise-distinct messages, one per refusal outcome kind
- criterion: Where the answer reports OpenApiDocumentNotReadableError, the surface
    states that no draft was generated and states that condition apart from the other
    two.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders the not-readable refusal as an alert stating no draft was generated
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders a pairwise-distinct alert for each of the four refusal outcomes,
      none of them alongside a drafted input schema, output schema or unresolved-item
      section
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns the not-readable message for an openapi-document-not-readable outcome
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: produces four pairwise-distinct messages, one per refusal outcome kind
- criterion: Where the answer reports OpenApiOperationNotFoundError, the surface states
    that no draft was generated and states that condition apart from the other two.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders the operation-not-found refusal as an alert stating no draft was
      generated and naming the method and path
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders a pairwise-distinct alert for each of the four refusal outcomes,
      none of them alongside a drafted input schema, output schema or unresolved-item
      section
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns a message naming the outcome's own method and path
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: produces four pairwise-distinct messages, one per refusal outcome kind
- criterion: Where the answer names none of those three conditions, the surface states
    that the request failed for a reason it does not recognise, and states it neither
    as one of the three conditions nor as a draft.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders a fallback alert stating no draft was generated for a reason the
      surface does not recognise
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders a pairwise-distinct alert for each of the four refusal outcomes,
      none of them alongside a drafted input schema, output schema or unresolved-item
      section
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns the unrecognized-failure message, matching none of the three named
      conditions
- criterion: No input_schema, no output_schema and no unresolved item stands stated
    beside any of those four statements.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders a pairwise-distinct alert for each of the four refusal outcomes,
      none of them alongside a drafted input schema, output schema or unresolved-item
      section
- criterion: While a dispatched request stands unanswered, none of those four statements
    stands stated.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders no alert for an idle outcome and none for a pending outcome
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns undefined for an idle outcome and for a pending outcome
- criterion: Where no request has been dispatched, none of those four statements stands
    stated.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields.spec.ts
    name: renders no alert for an idle outcome and none for a pending outcome
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: returns undefined for an idle outcome and for a pending outcome
- criterion: Each of the four statements is produced from the answer's own error code
    by this helper's own disclosure service, and the shared generic error-state table
    is not extended with these codes.
  state: covered
  tests:
  - file: src/services/capability-schema-draft-disclosure.spec.ts
    name: produces four pairwise-distinct messages, one per refusal outcome kind
  - file: src/services/error-ui-state.spec.ts
    name: resolves OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError
      and OpenApiOperationNotFoundError to the shared generic-error state rather than
      a code of their own (capability schema helper's refusal-stated-to-the-operator
      criterion 8)
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: resolves $label to $expectedKind, carrying the link, path and method of
      the request it answered
- criterion: When a drafted outcome arrives, the Input schema field's content stands
    exactly as it stood before the request was dispatched.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: keeps both fields at whatever the operator had typed, both once a drafted
      outcome arrives and once a refusal statement arrives
- criterion: When a drafted outcome arrives, the Output schema field's content stands
    exactly as it stood before the request was dispatched.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: keeps both fields at whatever the operator had typed, both once a drafted
      outcome arrives and once a refusal statement arrives
- criterion: When any of the four refusal statements arrives, both fields' content
    stand exactly as they stood before the request was dispatched.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: keeps both fields at whatever the operator had typed, both once a drafted
      outcome arrives and once a refusal statement arrives
  why: Only one of the four refusal statements is exercised -- the answer is stubbed
    as OpenApiDocumentNotFetchedError -- and the test's own comment asserting that
    the mechanism does not vary by which of the four fires is prose, not evidence.
    The not-readable, operation-not-found and unrecognised-failure arrivals are unexercised
    against both fields' content.
- criterion: Applying the draft's input_schema writes that text into the Input schema
    field.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: writes the drafted input schema straight into the empty Input schema field
      with no dialog
  - file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
    name: keeps both Apply buttons rendered and enabled while the draft is stale,
      each applying its own schema text unchanged
- criterion: Applying the draft's input_schema leaves the Output schema field's content
    exactly as it stood.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
- criterion: Applying the draft's output_schema writes that text into the Output schema
    field.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
  - file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
    name: keeps both Apply buttons rendered and enabled while the draft is stale,
      each applying its own schema text unchanged
- criterion: Applying the draft's output_schema leaves the Input schema field's content
    exactly as it stood.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
- criterion: An applied write reaches the field through the same onChange value-and-validity
    contract the field's own typing uses, so save-gating and Discard read applied
    text exactly as they read typed text.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: writes the drafted input schema through the field's own state, turning on
      Discard, which reads it back to the loaded baseline exactly as it would a typed
      edit
  why: 'The Discard half is exercised: applying enables Discard and discarding restores
    the loaded baseline. The save-gating half is not -- no test in the set reads the
    save act''s state after an applied write, and every applied text in the set is
    well-formed JSON, so the validity side of the value-and-validity contract goes
    unexercised: an applied write carrying malformed schema text that left save enabled
    would pass every assertion here.'
- criterion: Where the field applied to holds an edit the operator has not submitted,
    the write is offered only once the operator confirms it, and what is offered for
    confirmation states the drafted text against what currently stands in that field.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: writes the drafted input schema straight into the empty Input schema field
      with no dialog
  why: 'The gating half is exercised in both directions -- over an unsaved edit a
    dialog opens and nothing is written until confirmation, over a field holding no
    edit the write lands with no dialog. The second half is unexercised: no assertion
    reads the dialog''s content, so nothing establishes that what is offered for confirmation
    states the drafted text against what currently stands in that field; a dialog
    showing neither text, or the wrong field''s text, would pass.'
- criterion: Where such a confirmation has not been given, that field's content stands
    exactly as it stood.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
- criterion: The confirmation and its diff are the existing apply-over-unsaved-edit
    dialog and diff computation, not a second implementation of either.
  state: uncovered
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
  why: The only assertions touching the confirmation are that a dialog appears and
    carries buttons named "Aplicar" and "Continuar editando". A second dialog implementation
    rendering those two labels, computing its own diff, would satisfy every one of
    them; nothing in the set exercises the existing apply-over-unsaved-edit dialog
    or its diff computation as the one reached, and no assertion reads the diff at
    all.
- criterion: Applying either schema issues no register-capability call, and the capability
    registered at the identity being edited stands exactly as it stood.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: writes the drafted input schema through the field's own state, turning on
      Discard, which reads it back to the loaded baseline exactly as it would a typed
      edit
  why: The no-register assertion (putCallCount of zero) is made only on the create
    screen, where no capability stands registered at any identity. The detail-screen
    test -- the one place an identity is actually being edited -- applies a drafted
    input schema and never counts PUT calls, so the criterion's second half, that
    the capability registered at the identity being edited stands exactly as it stood,
    is unexercised.
- criterion: The act applying each schema is offered on the capability create screen
    and on the capability detail screen alike.
  state: partial
  tests:
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: gates each field's own apply behind its own confirm, writes only the confirmed
      field, and leaves the other field and the registry untouched
  - file: src/routes/capability-form-fields-schema-apply.spec.ts
    name: writes the drafted input schema through the field's own state, turning on
      Discard, which reads it back to the loaded baseline exactly as it would a typed
      edit
  - file: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
    name: states no staleness right after the draft is stated, states it once the
      link alone changes, and still applies the same drafted input_schema afterward
  why: 'Both apply acts are exercised on the create screen. On the detail screen only
    the input-schema apply is reached: the test awaits findAllByRole for "Aplicar"
    without asserting a count and clicks the first button, so the act applying the
    output_schema is never shown to be offered there, and the "alike" half of the
    criterion is unexercised for that screen.'
- criterion: A stated draft is marked with the link of the request that produced it,
    exactly as that request named it.
  state: partial
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: carries the link, path and method of the request answered, and a draft holding
      exactly input_schema, output_schema and unresolved -- no field the answer's
      top level did not carry
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: sends exactly {link, path, method} from the chosen operation, and exposes
      the drafted outcome once it resolves
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once the
      link alone changes, with the chosen operation left untouched
  why: 'Read as the outcome recording its request, this is exercised: the drafted
    outcome is asserted to carry the request''s own link. Read as the surface marking
    the stated draft with that link for the operator, nothing exercises it -- no test
    asserts the link appears anywhere beside the stated draft. The criterion''s word
    "marked" admits both readings and this audit does not settle which was meant.'
- criterion: A stated draft is marked with the operation of the request that produced
    it, exactly as that request named it.
  state: partial
  tests:
  - file: src/hooks/use-draft-capability-schema-from-openapi.spec.ts
    name: carries the link, path and method of the request answered, and a draft holding
      exactly input_schema, output_schema and unresolved -- no field the answer's
      top level did not carry
  - file: src/hooks/use-capability-schema-helper.spec.ts
    name: sends exactly {link, path, method} from the chosen operation, and exposes
      the drafted outcome once it resolves
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once a different
      operation is chosen, with the link left untouched
  why: 'As with the link: the drafted outcome is asserted to carry the request''s
    own path and method, so the recording reading is exercised. No test asserts that
    the operation is stated to the operator beside the stated draft, so the surface-marking
    reading is unexercised, and the criterion''s "marked" admits both.'
- criterion: While the helper's link and its chosen operation both equal the ones
    the stated draft was generated for, that draft is not stated as stale.
  state: covered
  tests:
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once the
      link alone changes, with the chosen operation left untouched
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once a different
      operation is chosen, with the link left untouched
  - file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
    name: renders the stale statement when state.stale is true, and renders none when
      state.stale is false
  - file: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
    name: states no staleness right after the draft is stated, states it once the
      link alone changes, and still applies the same drafted input_schema afterward
- criterion: From the moment the helper's link differs from the one the stated draft
    was generated for, that draft is stated as stale.
  state: covered
  tests:
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once the
      link alone changes, with the chosen operation left untouched
  - file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
    name: renders the stale statement when state.stale is true, and renders none when
      state.stale is false
  - file: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
    name: states no staleness right after the draft is stated, states it once the
      link alone changes, and still applies the same drafted input_schema afterward
- criterion: From the moment the helper's chosen operation differs from the one the
    stated draft was generated for, that draft is stated as stale.
  state: covered
  tests:
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once a different
      operation is chosen, with the link left untouched
  - file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
    name: renders the stale statement when state.stale is true, and renders none when
      state.stale is false
- criterion: A draft stated as stale still offers the act applying its input_schema
    and the act applying its output_schema.
  state: covered
  tests:
  - file: src/routes/capability-schema-helper-fields-stale-draft-marking.spec.ts
    name: keeps both Apply buttons rendered and enabled while the draft is stale,
      each applying its own schema text unchanged
  - file: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
    name: states no staleness right after the draft is stated, states it once the
      link alone changes, and still applies the same drafted input_schema afterward
- criterion: Staleness is read by comparing the stated outcome's own recorded request
    against the helper's current link and chosen operation, and no separate stale
    flag is stored.
  state: partial
  tests:
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once the
      link alone changes, with the chosen operation left untouched
  - file: src/hooks/use-capability-schema-helper-stale-draft-marking.spec.ts
    name: reads stale as false right after the draft is stated, and true once a different
      operation is chosen, with the link left untouched
  why: 'Both tests move the link or the operation away once and read stale as true,
    which a stored flag set on those same change events would also satisfy. What would
    distinguish a comparison from a stored flag is unexercised: nothing returns the
    helper''s link or chosen operation to the ones the stated draft was generated
    for and reads stale back to false, and nothing exercises a change that leaves
    link and operation equal to the recorded request.'
findings:
- pass: conformance
  file: src/hooks/use-capability-schema-helper.ts
  where: onLinkChange (setLink) alongside the chosenOperation state, lines ~49-55
  evidence: "const [chosenOperation, setChosenOperation] = useState<OpenApiOperation\
    \ | undefined>(undefined);\n\nreturn {\n  link,\n  onLinkChange: setLink,\n  ...\n\
    };"
  cost: 'Against scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale:
    changing the named link only updates `link`; nothing clears `chosenOperation`,
    so the hook keeps exposing the operation chosen under the previous document even
    once the listing for the new link has replaced it. A caller reading `chosenOperation`
    is shown a choice that names no entry of the current link''s listing, and an operator
    who types the original link back is handed a stale selection rather than the "waits
    on one" state the surface owes until a fresh choice is made.'
  correction: Reset chosenOperation to undefined whenever link changes away from the
    link it was chosen under, matching the scenario's given/when/then.
- pass: conformance
  file: src/routes/capability-form-fields-schema-draft-staleness.spec.ts
  where: the comment above the link-change step, lines 61-62
  evidence: '// only the link moves away from the one the draft was generated for;
    the chosen operation

    // is left untouched (criterion 4)'
  cost: 'Against scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale:
    the comment claims the chosen operation survives a link change untouched, which
    the scenario states is the opposite of the governed behavior -- the choice should
    stand cleared from the moment the named link ceases to be the one it was chosen
    from. Nothing in this test queries the operation select after the link changes,
    so this false claim is the only place in the file that speaks to that behavior
    at all, and it records it backwards for the next reader.'
  correction: Remove the comment's claim about the chosen operation, or replace it
    (and add the matching assertion) with the actual governed behavior.
- pass: conformance
  file: src/routes/capability-form-fields-schema-apply.spec.ts
  where: the comment above the second draft-request dispatch, lines 134-137
  evidence: '// requesting again from the same chosen operation resolves this time
    to a refusal (one

    // representative of the four -- the mechanism does not vary by which of the four
    fires,

    // since none of them ever renders the section that offers Apply)

    fireEvent.click(screen.getByRole("button", { name: "Solicitar rascunho de schema"
    }));

    await screen.findByRole("alert");'
  cost: 'Against rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator:
    the comment states as settled fact exactly what the node requires (no input_schema/output_schema/unresolved
    item beside a refusal), but the code that follows only awaits a generic alert
    role and checks the two field values -- it never queries for the Apply buttons
    to confirm none render. A regression that kept an Apply button visible after a
    refusal would pass this test unnoticed, leaving the comment as the only place
    this guarantee is recorded.'
  correction: 'Add an assertion (e.g. expect(screen.queryAllByRole("button", { name:
    "Aplicar" })).toHaveLength(0)) immediately after the refusal, so the fact is checked
    by code rather than asserted only in prose.'
- pass: conformance
  file: src/services/capability-schema-messages.spec.ts
  where: lines 8 and 13, the outsideVocabulary case
  evidence: 'const outsideVocabulary = capabilitySchemaDraftUnresolvedReasonMessage("some-future-reason");

    ...

    expect(outsideVocabulary).toBe("some-future-reason");'
  cost: 'Against domain/integration/capability-schema-draft-unresolved-reason: no
    node decides what a surface displays for an unresolved-item reason outside the
    two named values. The specification does have a stated convention for a value
    outside a vocabulary a surface must present (a refusal condition the surface does
    not recognise is stated as exactly that), but nothing extends or excludes that
    convention here, so whether echoing the raw value or stating it as unrecognised
    is correct is a decision this test makes on its own, with nothing in the specification
    for the next reader to check it against.'
  correction: Add to domain/integration/capability-schema-draft-unresolved-reason,
    or a new rule constraining it, a statement of what a surface displays for a reason
    outside the two named values.
- pass: conformance
  file: src/services/capability-schema-messages.ts
  where: lines 8-13, the CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASON_MESSAGES record
  evidence: "const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASON_MESSAGES: Readonly<Record<string,\
    \ string>> = {\n  \"schema-not-reducible-to-a-type\": \"...\",\n  \"name-claimed-by-another-parameter\"\
    : \"...\",\n};"
  cost: 'Against domain/integration/capability-schema-draft-unresolved-reason: that
    node declares the closed set of reasons once; this record retypes the same set
    as Record<string, string> rather than a type tied to that enumeration. If the
    specification''s enumeration ever gains, renames or drops a reason, nothing here
    fails to compile or warns -- the lookup simply falls through to the raw code for
    the operator to read -- and the next maintainer has no link back to the node that
    owns the set.'
  correction: Key this record by the specification's own enumeration rather than by
    two independently retyped string literals, so the two sets cannot diverge without
    a compile-time signal.
- pass: conformance
  file: src/services/error-ui-state.spec.ts
  where: the test at lines 219-227
  evidence: 'const kinds = ["OpenApiDocumentNotFetchedError", "OpenApiDocumentNotReadableError",
    "OpenApiOperationNotFoundError"].map((code) => uiStateForApiError(new ApiError(code,
    "message")).kind);


    expect(kinds).toEqual(["generic-error", "generic-error", "generic-error"]);'
  cost: 'Against rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator:
    a caller of uiStateForApiError cannot tell an unfetchable link, an unreadable
    document and a missing operation apart through this classification -- all three
    collapse into the same kind a code it does not recognise at all also gets. The
    test''s own citation of the schema-helper refusal rule as its reason makes this
    read as proof of compliance rather than the opposite; the actual distinguishing
    happens in use-draft-capability-schema-from-openapi.ts''s own classification prior
    to this table, which this test does not reach.'
  correction: Give each of the three conditions a kind of its own if this table is
    meant to carry the disclosure, or assert the distinction this table is cited for
    rather than the three codes' identity.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  cites: ARC-03
  where: the two useApplyToJsonSchemaField calls in the CapabilityFormFields body
  evidence: "const inputSchemaApply = useApplyToJsonSchemaField(\n  inputSchema,\n\
    \  isDirty ?? inputSchema.value !== \"\",\n);\nconst outputSchemaApply = useApplyToJsonSchemaField(\n\
    \  outputSchema,\n  isDirty ?? outputSchema.value !== \"\",\n);"
  cost: The decision of what counts as "an unsaved edit" for a schema field is typed
    out twice, once per field, inside the component's own render body rather than
    named once in a hook or service. A third schema field, or a second screen needing
    the same guard, has no name to call and rewrites the same ternary with no guarantee
    it lands on the same fallback.
  correction: Extract the fallback (isDirty ?? fieldValue !== "") into a named function
    in a hook or service and call it from both sites.
- pass: standard
  file: src/routes/capability-schema-helper-fields.tsx
  cites: EDG-01
  where: the Solicitar rascunho de schema button, gated only by disabled={state.outcome.kind
    === "pending"}
  evidence: "<Button\n  type=\"button\"\n  onClick={state.onRequestDraft}\n  disabled={state.outcome.kind\
    \ === \"pending\"}\n>\n  {SCHEMA_HELPER_REQUEST_DRAFT_BUTTON}\n</Button>"
  cost: While the draft request is in flight the only visible change is that the button
    stops responding to clicks; its label and appearance are otherwise unchanged,
    so the screen gives no explicit sign a network call is underway. The same file
    implements an explicit pending message for the sibling operations-read call, so
    the operator sees busy feedback for one request and none for the other, on the
    same screen.
  correction: Render an explicit pending statement (or a loading affordance on the
    button itself) while state.outcome.kind === "pending", matching the treatment
    already given to the operations-read call.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/capability-schema-helper-frontend.md
---

## What it is

The first review of the capability-schema-helper-frontend initiative's six delivered tasks: what the coverage, conformance and standard passes found over the nineteen files those tasks wrote or extended, and what the conformance pass's reconciliation cleared or left owed against the target's trace.

## Notes

The failures pass did not run: the captured run (run/capability-schema-helper-frontend) passed over every step the registry declares, so there was no failure to diagnose.
The coverage pass found 18 of 57 criteria partial and 2 uncovered; none unauditable. Every partial or uncovered entry names, in the criterion's own terms, what remains unexercised.
Two coverage entries (rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit's confirmation-content clause, and the detail-screen no-register-capability clause) overlap with gaps the certification pass separately confirmed against specification nodes -- the same underexercised ground, read from two different obligations (a task's criterion and a node's fact).
The certification pass (12 nodes offered a `demonstrates` test) found 1 node fully covered, 9 partial and 2 uncovered, with a testable remainder recorded for every one that did not read `covered` -- see the reconciliation record and its returns for the full per-node accounting.
