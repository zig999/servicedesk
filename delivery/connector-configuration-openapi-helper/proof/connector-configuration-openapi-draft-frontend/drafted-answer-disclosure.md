---
title: Disclosure of the answered draft and of a refused request
summary: Unit tests over the pure disclosureStateForOutcome mapping and component
  tests over ConnectorConfigurationHelperFields together prove every disclosure criterion,
  the three UNDERDETERMINED implementation choices, and that the Configuration field
  is never touched by either a draft or a refusal.
implementation: sha256:96f1631e2c26ee69c4d893b2d72575c14c13c65751ee811c33b9102365a7fc3a
standard:
  at: ../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-drafted-answer-disclosure-suite-2
tests:
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: 'maps an idle outcome to exactly {kind: ''none''}'
  proves: The disclosure has its own idle-facing variant carrying nothing else.
  fails_when: An idle outcome maps to any disclosure kind other than 'none', or carries
    an extra field.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: 'maps a pending outcome to exactly {kind: ''pending''}, carrying no draft
    even right after a drafted outcome was mapped'
  proves: UNDERDETERMINED -- clear any prior refusal or draft disclosure the moment
    a new request is dispatched, and do not render a refusal until the operation actually
    answers with one.
  fails_when: A pending outcome's disclosure carries a leftover draft or message from
    a previously mapped drafted outcome, or maps to any kind other than 'pending'.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries the draft's own configuration string into the disclosure state, character
    for character
  proves: An answered draft's configuration text is disclosed in the section while
    the Configuration field's own content stands exactly as it stood.
  fails_when: The mapped disclosure's configuration text differs from the draft's
    own configuration string.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: copies the item's name unmodified and pairs it with a non-empty reason label
  proves: Each item of an answered draft's unresolved list is disclosed with its name
    exactly as the draft gave it and with its reason.
  fails_when: The mapped item's name is altered, the raw reason is dropped, or no
    reason label is produced.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries through an empty array rather than inventing an item
  proves: An answered draft whose unresolved list is empty discloses no unresolved
    item.
  fails_when: An empty unresolved list maps to a non-empty disclosed array.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: produces four pairwise-distinct labels for the four closed-set reason values
  proves: UNDERDETERMINED -- render each of the four reason values as its own distinct
    text, never collapsing two into one label.
  fails_when: Two or more of the four named reasons map to the same label text.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: falls back to the raw reason string for a reason value outside the four named
    ones
  proves: 'inference: unresolvedReasonLabel falls back to the raw reason string for
    a value outside the four named ones.'
  fails_when: A reason value outside the closed set maps to something other than the
    raw reason string.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: maps name and security_scheme to name and securityScheme, one for one
  proves: Each generated credential of an answered draft is disclosed with its generated
    name and with the security scheme's own name.
  fails_when: A generated credential's name or security scheme is dropped, renamed
    incorrectly, or mismatched.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries no value field even when the answered credential smuggles one in
  proves: No credential value appears in the disclosure of a generated credential.
  fails_when: The mapped credential object carries any key other than name and securityScheme.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries through an empty array rather than inventing a credential
  proves: No name, reason, generated name, security-scheme name or method is disclosed
    for an answered draft that the draft's own response did not carry (generated-credentials
    part).
  fails_when: An empty generated-credentials list maps to a non-empty disclosed array.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries registered and operation through as two separate values when a mismatch
    stands
  proves: An answered draft carrying a method mismatch discloses the registered method
    and the drafted operation's method side by side, with neither shown in place of
    the other.
  fails_when: The registered or operation value is dropped, swapped, or merged into
    one field.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries no method mismatch at all
  proves: An answered draft carrying no method mismatch discloses no disagreement
    of methods.
  fails_when: A draft naming no method mismatch maps to a defined methodMismatch value.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: names a network failure
  proves: UNDERDETERMINED -- disclose the kind and, where applicable, the status too.
  fails_when: The fetch-refusal message for a network failure omits the words network
    failure.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: names a timeout, distinctly from a network failure
  proves: Same UNDERDETERMINED note, for the timeout kind, and its distinguishability
    from the network-failure kind.
  fails_when: The message omits timeout or also contains network failure.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: names the status when the fetch failed with a status outside the 2xx range
  proves: Same UNDERDETERMINED note, for the status-outside-2xx kind.
  fails_when: The message omits the numeric status.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: does not echo the operator's own link value back in the message
  proves: 'inference: the refusal sentence for openapi-document-not-fetched does not
    repeat the operator''s own link value back to them.'
  fails_when: The fetch-refusal message contains the operator's own link string.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: states that the document could not be read
  proves: A request refused because the fetched document could not be read discloses
    that the document could not be read.
  fails_when: The document-not-readable message omits could not be read.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: states the operation's own method and path
  proves: A request refused because the document declares no operation at the named
    path and method discloses that pairing.
  fails_when: The operation-not-found message omits the method or the path.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: states an unrecognised reason, reusing none of the three named refusal sentences
  proves: A request refused with none of those three conditions discloses that the
    request failed for an unrecognised reason, never as one of the three.
  fails_when: The unrecognized-failure message reuses text from any of the three named
    refusal sentences.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: maps each of the four refusal cases to disclosure kind 'refused'
  proves: Every one of the four refusal conditions maps to the refused disclosure
    kind, never drafted.
  fails_when: Any refusal outcome maps to a disclosure kind other than 'refused'.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: gives all four refusal conditions pairwise-distinct messages
  proves: Each of the three named refusals and the unrecognised-failure fallback is
    distinguishable from the others.
  fails_when: Two of the four refusal messages are equal.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows no drafting line, no alert and no drafted disclosure while idle
  proves: Idle renders none of the three disclosure branches.
  fails_when: Any of the drafting line, an alert, or a drafted disclosure element
    renders while idle.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the drafting line and neither an alert nor a drafted disclosure while
    pending
  proves: 'inference: a pending outcome renders a Drafting line, rather than nothing.'
  fails_when: The drafting line does not render while pending, or an alert or drafted
    disclosure renders instead.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders the draft's own configuration text unmodified
  proves: An answered draft's configuration text is disclosed in the section (first
    half).
  fails_when: The rendered configuration text differs from the draft's own configuration
    string.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the item's name and a reason label that is not the raw reason string
  proves: Each item of an answered draft's unresolved list is disclosed with its name
    and reason, rendered as a translated label rather than the raw reason.
  fails_when: The item's name is missing, or the raw reason string is rendered verbatim
    in place of a translated label.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders no Unresolved section
  proves: An answered draft whose unresolved list is empty discloses no unresolved
    item.
  fails_when: An Unresolved heading or list renders for a draft with an empty unresolved
    list.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the credential's own name and security scheme
  proves: Each generated credential of an answered draft is disclosed with its generated
    name and with the security scheme's own name.
  fails_when: The rendered list item omits the credential's name or security scheme,
    or shows them in the wrong order/label.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows no leaked value even when the answered credential smuggles one in
  proves: No credential value appears in the disclosure of a generated credential.
  fails_when: The rendered output contains the credential's smuggled value string
    anywhere.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders no Generated credentials section
  proves: No generated-credential fact is disclosed for a draft the response did not
    carry one for.
  fails_when: A Generated credentials heading or list renders for a draft with an
    empty credentials list.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the registered and drafted methods, neither in place of the other
  proves: An answered draft carrying a method mismatch discloses the registered method
    and the drafted operation's method side by side, with neither shown in place of
    the other.
  fails_when: The registered or drafted method is missing, or one is rendered in place
    of the other.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders no Method mismatch section
  proves: An answered draft carrying no method mismatch discloses no disagreement
    of methods.
  fails_when: A Method mismatch heading renders when the draft names no mismatch.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the fetch-refusal message as an alert and no drafted disclosure
  proves: A request refused because its named link could not be fetched discloses
    that, distinguishable from the other two refusals, with no part of a draft disclosed
    beside it.
  fails_when: No alert renders, the alert text omits could not be fetched, or a Drafted
    configuration element renders alongside it.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the document-not-readable message as an alert and no drafted disclosure
  proves: A request refused because the fetched document could not be read discloses
    that, with no part of a draft disclosed beside it.
  fails_when: No alert renders, the alert text omits could not be read, or a Drafted
    configuration element renders alongside it.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows the method and path as an alert and no drafted disclosure
  proves: A request refused because the document declares no operation at the named
    path and method discloses that pairing, with no part of a draft disclosed beside
    it.
  fails_when: No alert renders, the alert omits the method or path, or a Drafted configuration
    element renders alongside it.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: shows a fallback message reusing none of the three named refusal sentences,
    and no drafted disclosure
  proves: A request refused with none of those three conditions discloses that the
    request failed for an unrecognised reason, never as one of the three and never
    as a draft.
  fails_when: The alert reuses text from one of the three named refusal sentences,
    or a Drafted configuration element renders alongside it.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: leaves an independently held Configuration field's value unchanged once a
    draft answers with different configuration text
  proves: An answered draft's configuration text is disclosed while the Configuration
    field's own content stands exactly as it stood (second half).
  fails_when: An independently held Configuration field's value changes after this
    component renders a drafted disclosure carrying different configuration text.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: leaves an independently held Configuration field's value unchanged once a
    request is refused
  proves: No refusal disclosure changes the Configuration field's own content.
  fails_when: An independently held Configuration field's value changes after this
    component renders a refusal.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: stops showing the previous draft's configuration text once the outcome moves
    back to pending
  proves: UNDERDETERMINED -- clear any prior refusal or draft disclosure the moment
    a new request is dispatched (drafted-clearing half, at rendering).
  fails_when: A previously rendered draft's configuration text, or an alert, persists
    once the outcome moves to pending.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: stops showing the previous refusal's alert once the outcome moves back to
    pending
  proves: Same UNDERDETERMINED note, the refusal-clearing half, at rendering.
  fails_when: A previously rendered refusal's alert persists once the outcome moves
    to pending.
not_applicable:
- edge_case: Absent or malformed outcome input (no discriminant, or an unrecognized
    kind value)
  why: DraftConnectorConfigurationRequestOutcome is a closed discriminated union the
    compiler enforces exhaustively over; disclosureStateForOutcome's switch has no
    default/fallthrough case to test.
- edge_case: Boundary values at each end of a numeric range
  why: Nothing in this task's own domain states a numeric range; the one number present
    (an HTTP status) is disclosed verbatim with no boundary condition of its own.
- edge_case: Duplicate unresolved items or generated credentials sharing the same
    name
  why: No criterion in this task claims uniqueness across the unresolved or generated-credentials
    lists; the component's composite React key for such a list is a standard-decided
    rule, not a domain fact this proof asserts.
- edge_case: A dependency that fails or answers slowly, or two dispatches at once
  why: Fetching, timing and de-duplicating a request are the sibling hook's own responsibility,
    already proven by its own existing spec file; this task's own files take the outcome
    as already resolved.
- edge_case: An empty collection where one comes back, for the drafted configuration
    text itself
  why: configuration is a required string on the draft value object, never a collection;
    the empty-collection case is exercised where it actually applies -- the unresolved
    and generated-credentials lists.
untested:
- The exact wording chosen for each of the four unresolved-reason labels, the three
  named refusal sentences and the unrecognised-failure sentence is left unpinned by
  design; tests here prove distinguishability and the presence of the required facts
  (kind, status, method, path) but never assert a full sentence's literal text.
- Whether the specification's Configuration-field-changes-only-on-apply half is honored
  across an actual Apply action is not tested here, per the task's own REMAINDER note
  -- this proof only covers the field standing unchanged on arrival and on refusal.
---

## What it is

Proof of everything the operator reads before deciding whether to apply.

## Notes

First suite run failed lint (2 consistent-type-assertions violations from `as` casts in both new test files); fixed by declaring the fixture object with an explicit intersection type instead of an inline assertion, no assertion changed. The proof also flagged (contested) that the implementation record's inference about not repeating operator input over-generalized to the operation-not-found refusal, which criterion 11 requires disclosing; the implementation record's inference text was corrected to match, no code changed. Re-run clean.
