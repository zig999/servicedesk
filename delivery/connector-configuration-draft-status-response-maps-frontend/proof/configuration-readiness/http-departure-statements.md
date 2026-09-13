---
target: frontend
title: HTTP connector configuration departure statements proof
summary: Proves each of the eight criteria over the pure judgment service, the two rendered
  complements (a departure showing, none showing) plus the governing scenario's own read/write
  pair on the surface, and the two node facts a finite test can decide whole, through two new
  sibling spec files.
implementation: sha256:367c86e298f1fa60dad7909e2939802fa8f9deb99bbcab9cc2c736917edb9050
run: run/configuration-readiness-http-departure-statements-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states one method-outside-vocabulary departure when method is present but not one of the
    five admitted values
  proves: Criterion 1 -- a method outside the vocabulary is stated as a departure naming the
    method key, its declared value and the methods the vocabulary admits.
  fails_when: the departure is missing, names a different value or key, or admittedMethods
    differs from HTTP_CONNECTOR_METHODS.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: returns no departures for an otherwise well-formed configuration declaring no method key
    at all
  proves: The task's own resolved reading of criterion 1 -- an absent method key states no method
    departure.
  fails_when: a departure of any kind is returned for a configuration that omits the method key.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states one status-map-ending-outside-vocabulary departure for a single offending entry
  proves: Criterion 2 -- a statusMap ending outside the vocabulary is stated as a departure naming
    the statusMap key that carries it and the endings the vocabulary admits.
  fails_when: the departure is missing, names a different statusMapKey or value, or
    admittedEndings differs from HTTP_CONNECTOR_STATUS_MAP_ENDINGS.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states one departure per offending entry when two different statusMap entries end outside
    the vocabulary
  proves: Criterion 2, boundary -- distinct offending entries are each named on their own
    departure rather than collapsed into one departure for the whole map.
  fails_when: fewer than two departures are returned, or either fails to name its own
    statusMapKey and value.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: returns no departures for a statusMap entry keyed notAStatus whose value is an admitted
    ending
  proves: The task's own resolved reading -- a statusMap key that is not a valid HTTP-status-shaped
    string draws no departure of its own.
  fails_when: a departure of any kind is returned for this configuration.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states a status-map-not-an-object departure, not any per-entry ending departure, when
    statusMap is absent
  proves: Criterion 3 -- a statusMap that is absent is stated as a departure naming the statusMap
    key, and only that one departure.
  fails_when: no departure is returned, more than one is returned, or the one returned is not
    exactly the status-map-not-an-object shape.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states a response-map-departure when responseMap is absent
  proves: Criterion 4 (absent/not-an-object class).
  fails_when: no departure, more than one, or a departure other than response-map-departure is
    returned.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states a response-map-departure when responseMap is an object holding a non-string value
  proves: Criterion 4 (holds-non-text-value class).
  fails_when: no departure is returned for a responseMap that is an object but whose value is a
    number rather than a string.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states an address-absent-or-empty departure when the address key is absent
  proves: Criterion 5.
  fails_when: no departure, or a departure other than address-absent-or-empty, is returned.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states a query-or-headers-not-object-of-texts departure naming query when query is
    declared as an array
  proves: Criterion 6 (query).
  fails_when: no departure is returned, or the returned departure names headers instead of query.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states a query-or-headers-not-object-of-texts departure naming headers when a headers
    entry holds a non-string value
  proves: Criterion 6 (headers).
  fails_when: no departure is returned, or the returned departure names query instead of headers.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: returns no departures for query or headers when neither key is declared
  proves: Criterion 6, boundary -- query and headers are each optional.
  fails_when: a query-or-headers-not-object-of-texts departure is returned when neither key is
    present at all.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: states one placeholder-outside-forms departure for a malformed placeholder nested deep in
    the body, alongside well-formed subject, requester and credential placeholders held elsewhere
  proves: Criterion 7, and demonstrated whole.
  fails_when: the malformed placeholder draws no departure, any of the three well-formed
    placeholders is wrongly flagged, or more than the one expected departure is returned.
  demonstrates: rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
- file: src/services/connector-configuration-http-departures.spec.ts
  name: returns an empty array when method, statusMap, responseMap, address, query, headers and
    every placeholder are all well-formed
  proves: Criterion 8.
  fails_when: any departure is returned for a configuration that is well-formed by every one of
    the seven conditions at once.
- file: src/services/connector-configuration-http-departures.spec.ts
  name: returns no departures, without throwing, for an empty string, invalid JSON, and a JSON
    array
  proves: Criterion 8's defensive boundary.
  fails_when: any of the three shapes throws, or returns a non-empty array.
- file: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
  name: renders the departures heading and the method departure's own text when the Configuration
    field holds an invalid method
  proves: Criterion 1 as rendered, and the general wiring through to
    HttpConnectorDeparturesStatement.
  fails_when: the heading or the method departure's own text fails to render.
- file: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
  name: renders no departures heading for a fully valid configuration
  proves: Criterion 8 as rendered.
  fails_when: the departures heading (or any departure text) renders for a fully valid
    configuration.
- file: src/routes/connector-configuration-form-fields-http-departure-statements.spec.ts
  name: states the statusMap entry's own departure naming 200 and the four admitted endings, and
    leaves Save enabled while that departure stands
  proves: The governing scenario, decided whole, and the task's own first UNDERDETERMINED entry's
    named implementation (a surface that disables Save while a departure stands) refuted.
  fails_when: the statusMap-ending departure text fails to render for this exact input, or the
    Save button carries the disabled attribute merely because that departure stands.
  demonstrates: scenarios/integration/a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write
not_applicable:
- edge_case: A duplicate key within one side's own JSON object text.
  why: JSON.parse collapses a duplicate key to its last value before the diff logic ever sees the
    parsed object.
- edge_case: An absent or undefined configurationText argument.
  why: computeHttpConnectorDepartures's own signature requires a string.
- edge_case: Concurrent or overlapping computations.
  why: The function is pure, synchronous and side-effect-free with no shared state.
- edge_case: A slow or failing dependency.
  why: The computation touches no network, storage or clock.
- edge_case: Whitespace-only or differently formatted but equivalent JSON text.
  why: JSON.parse normalizes this before any departure check runs.
untested:
- domain/integration/connector-configuration -- honored rather than encoded.
- rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content
  -- a totality over every departure an unbounded-shape JSON object could carry; no single test
  decides it whole.
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary --
  the missing-key-ends-unavailable clause is REMAINDER and not decided here.
- rules/integration/an-http-connector-configuration-declares-its-call -- the placeholder-resolution
  and substitution-as-plain-text clauses are REMAINDER and not decided here.
contested:
- what: Whether an absent method key, and a statusMap key that is not a valid HTTP-status-shaped
    string, ought to be stated as departures under a stricter reading of
    rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary.
  why: The task's own criteria, read literally, permit the implementation's resolved reading (no
    departure in either case), and this proof tests for that reading rather than against it, per
    the task's own UNDERDETERMINED entries. The specification-level tension stands undecided by
    this proof either way.
---

## What it is
The proof of the seven judgment branches, the empty case, and the surface's own rendering, over the governing scenario's own example.

## Notes
Suite round 1 failed one pre-existing test in configuration-entry-guidance.spec.ts: its
guidanceListItems() helper used screen.getByRole("list"), which this task made ambiguous by adding
a second rendered list (the departures list) whenever the guidance test's own well-formed fixture
also happens to carry an address-absent departure. Fixed by locating the specific list carrying the
guidance's own first message instead of assuming there is only one list on the surface. Suite round
2 green.
