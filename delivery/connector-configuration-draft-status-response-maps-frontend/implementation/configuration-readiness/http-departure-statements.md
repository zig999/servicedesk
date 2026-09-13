---
target: frontend
title: HTTP connector configuration departure statements
summary: A pure judgment service computes, over well-formed Configuration JSON object text, every
  departure from the HTTP connector's method/status/response vocabulary, its call declaration and
  its placeholder forms, and the form-fields route renders one statement per departure found,
  nothing when none, without touching Save.
task: sha256:fb559bf5d39fa430661b45a1b879c14a317621492eab3435545721bdb84de533
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-http-departure-statements-build-2
files:
- path: src/services/connector-configuration-http-departures.ts
  effect: New pure module. Exports HTTP_CONNECTOR_METHODS (GET/POST/PUT/PATCH/DELETE) and
    HTTP_CONNECTOR_STATUS_MAP_ENDINGS (ok/denied/timeout/unavailable) vocabularies, the
    HttpConnectorDeparture discriminated union, and computeHttpConnectorDepartures(configurationText).
    Parses the text with JSON.parse and isPlainRecord (reused from shared/services/plain-record.ts);
    returns [] defensively when it does not parse to a plain object. Computes a
    method-present-but-outside-vocabulary departure; one statusMap-ending-outside-vocabulary
    departure per offending entry (statusMap absent/not-object short-circuits to a single
    status-map-not-an-object departure); a single response-map-departure when responseMap is
    absent, not an object, or holds any non-string value; an address-absent-or-empty departure; a
    query-or-headers-not-object-of-texts departure only when that key is declared and is not a
    plain object of string values; and a placeholder-outside-forms departure (deduplicated) for
    every ${...}-shaped substring reachable anywhere in the parsed configuration that does not
    match one of the three admitted forms.
- path: src/services/connector-configuration-messages.ts
  effect: Adds pt-BR constants/functions for this task -- HTTP_CONNECTOR_DEPARTURES_HEADING,
    HTTP_CONNECTOR_STATUS_MAP_NOT_AN_OBJECT_MESSAGE, HTTP_CONNECTOR_RESPONSE_MAP_DEPARTURE_MESSAGE,
    HTTP_CONNECTOR_ADDRESS_DEPARTURE_MESSAGE, httpConnectorMethodDepartureText,
    httpConnectorStatusMapEndingDepartureText, httpConnectorQueryOrHeadersDepartureText,
    httpConnectorPlaceholderDepartureText, and a private formatting helper.
- path: src/routes/connector-configuration-http-connector-departures-view.tsx
  effect: New sibling file (split out to keep connector-configuration-form-fields.tsx under the
    project's 300-line limit). Exports HttpConnectorDeparturesStatement, which returns null for an
    empty departures array and otherwise renders a heading plus one <li> per departure, each keyed
    by a stable identifier derived from the departure's own content (not array index).
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Imports HttpConnectorDeparturesStatement and computeHttpConnectorDepartures; adds a
    useMemo computing httpConnectorDepartures from configuration.value and renders
    <HttpConnectorDeparturesStatement departures={httpConnectorDepartures} /> immediately after
    ConfigurationEntryGuidance. Nothing else in the file -- the Save button's isSaveDisabled
    expression, the helper mount, the apply-confirmation dialog, or ConfigurationEntryGuidance
    itself -- was touched.
criteria:
- criterion: A method outside the vocabulary is stated as a departure, naming the method key and
    the methods the vocabulary admits.
  met: true
  how: methodDeparture only fires when "method" is present in the parsed configuration and the
    value is not one of HTTP_CONNECTOR_METHODS; the departure carries the offending value and
    admittedMethods, rendered by httpConnectorMethodDepartureText naming both.
- criterion: A statusMap ending outside the vocabulary is stated as a departure, naming the
    statusMap key that carries it and the endings the vocabulary admits.
  met: true
  how: statusMapDepartures iterates every entry of a present, object-shaped statusMap and emits one
    departure per entry whose value is not one of HTTP_CONNECTOR_STATUS_MAP_ENDINGS, carrying that
    entry's own key, its value, and admittedEndings.
- criterion: A statusMap that is absent or is not an object is stated as a departure naming the
    statusMap key.
  met: true
  how: statusMapDepartures returns a single status-map-not-an-object departure when statusMap is
    not a plain object, short-circuiting the per-entry ending check.
- criterion: A responseMap that is absent, is not an object, or holds a value that is not text is
    stated as a departure naming the responseMap key.
  met: true
  how: responseMapDeparture returns one response-map-departure covering all three conditions.
- criterion: An address that is absent or holds no text is stated as a departure naming the
    address key.
  met: true
  how: addressDeparture returns address-absent-or-empty unless address is a non-empty string.
- criterion: A query or headers the content declares that is not an object of texts is stated as a
    departure naming the key that departs.
  met: true
  how: objectOfTextsDeparture returns null immediately when the key is absent; when declared, it
    departs unless the value is a plain object whose every value is a string.
- criterion: A placeholder written in none of the three forms is stated as a departure naming that
    placeholder.
  met: true
  how: collectStrings recursively gathers every string reachable anywhere in the parsed
    configuration; placeholderDepartures extracts every ${...}-shaped substring from each and
    reports (deduplicated) those not matching the three admitted forms.
- criterion: Where the surface's own judgment finds no such departure, no departure is stated
    anywhere on it.
  met: true
  how: computeHttpConnectorDepartures returns an empty array when no branch fires, and
    HttpConnectorDeparturesStatement returns null for an empty array.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  how: The judgment operates over the configuration value object this node's configuration
    attribute holds as JSON object text; no shape beyond well-formedness is assumed.
- node: rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  - src/services/connector-configuration-messages.ts
  - src/routes/connector-configuration-form-fields.tsx
  how: Implements the rule's statement directly.
- node: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  how: The method vocabulary and status-map ending vocabulary are encoded and checked against; the
    clause on an observation issuing no call when a key is entirely missing is REMAINDER per the
    task's own notes and is not implemented here.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  how: address-non-empty-string, and query/headers-optional-object-of-string-values, are checked;
    the clauses on credential resolution and placeholder substitution are REMAINDER.
- node: rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  how: The admitted-placeholder pattern encodes exactly the three admitted literal forms.
- node: scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
  encoded_at:
  - src/services/connector-configuration-http-departures.ts
  - src/routes/connector-configuration-form-fields.tsx
  how: Realized for the statusMap-ending branch; the scenario's second then (the submission act
    stays offered) is honored by leaving Save's gating untouched.
inferences:
- inferred: Criterion 1 only fires when the method key is present.
  from: The task's own first UNDERDETERMINED note.
- inferred: A statusMap key that is not a valid HTTP-status-shaped string is never flagged.
  from: The task's own second UNDERDETERMINED note.
- inferred: Criteria 3 and 4 each produce at most one departure for the whole field, distinguishing
    them from criterion 2's per-entry departures.
  from: The criteria's own wording.
- inferred: Placeholder scanning walks every string value reachable anywhere in the parsed
    configuration, not limited to the four named call parts.
  from: The task's own instruction, read together with the call rule's statement that any of the
    four parts may embed a placeholder.
- inferred: An incomplete ${...} text missing its closing brace produces no placeholder departure.
  from: That case belongs to a different node (an-incomplete-or-unresolvable-connector-call-descriptor-ends-unavailable)
    this task does not implement.
- inferred: A non-string vocabulary value is formatted via JSON.stringify (falling back to String)
    rather than a fixed placeholder.
  from: No node states how a non-text vocabulary value should be displayed.
- inferred: The rendering component and its text/key helpers were split into a new sibling file
    connector-configuration-http-connector-departures-view.tsx.
  from: connector-configuration-form-fields.tsx exceeded the project's 300-line max-lines rule
    once this task's code was added; splitting follows the sibling-file convention already used
    throughout this delivery.
- inferred: A vocabulary-membership check is routed through a small includesString(vocabulary,
    value) helper instead of an inline `as readonly string[]` cast.
  from: The project's @typescript-eslint/consistent-type-assertions rule refuses the cast; a
    helper typed to accept readonly string[] widens the tuple type without an assertion.
preserved:
- The Save button's disabled expression, with no new gate or disabled-reason text.
- The Configuration Helper mount, the Apply-over-unsaved-edit confirmation dialog and its diff
  body, the stale-draft marking, and the fixed ConfigurationEntryGuidance list.
deferred:
- what: Whether a departure this task states withholds the register-connector submission act.
  why: Named by the task's own UNDERDETERMINED note as
    rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides's
    own decision, not this task's.
- what: The corrective "no call issued, ends unavailable" behavior, credential resolution at call
    time, and placeholder substitution as plain text.
  why: REMAINDER per the task's own notes -- belongs to the backend act that executes an HTTP
    connector observation and assembles/issues its call.
---

## What it is
The statement that the registry would take this text and the HTTP connector would end every observation through it unavailable.

## Notes
Build round 1 failed lint: react/no-array-index-key on the departures list, max-lines on the route
file (312/300), and two @typescript-eslint/consistent-type-assertions errors on `as readonly
string[]` casts in the departures service. Fixed by keying each list item on the departure's own
content, splitting the rendering component into a new sibling file
connector-configuration-http-connector-departures-view.tsx, and routing the vocabulary-membership
checks through a small typed helper instead of a cast. Build round 2 green.
