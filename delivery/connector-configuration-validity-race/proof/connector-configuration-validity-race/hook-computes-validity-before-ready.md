---
title: First-reading determinism for the connector-configuration detail hook's validity
summary: New render-log tests in the existing validity spec file assert configuration.isValid at the very
  first commit that reports the ready phase, deterministically over the pre-fix hook's deferred-effect
  race, alongside the pre-existing settled-state assertions this task's criteria also require.
implementation: sha256:182a488289489cfbaf0c7eded821ce5fd2e145f4e168f0b582346a5159d20098
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-validity-race-hook-computes-validity-before-ready-suite
tests:
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — the very first render reporting the ready phase already reflects
    a non-object configuration's invalidity > carries configuration.isValid as false in the render log's
    first ready entry when the loaded configuration parses as $label rather than an object
  proves: Criterion 1, that the isValid the ready outcome first carries reflects the loaded text rather
    than an uncorrected default, and criterion 2, that a non-object-parsing configuration — an array,
    a bare string, a number, true, or null — reads as not valid at the first reading of the ready outcome.
  fails_when: The state object logged for the first commit where phase is ready carries configuration.isValid
    true instead of false for any of the five NON_OBJECT_CONFIGURATIONS cases — which is exactly what
    the pre-fix hook produces, since it defaults configurationValid to true with useState and only corrects
    it inside a useEffect one commit later, after the ready-phase commit this test's log entry captures.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — the very first render reporting the ready phase already reflects
    an object configuration's validity > carries configuration.isValid as true in the render log's first
    ready entry when the loaded configuration parses as a JSON object
  proves: Criterion 1 and criterion 3, that a configuration whose text parses to a plain object reads
    as valid at the first reading of the ready outcome.
  fails_when: The state object logged for the first commit where phase is ready carries configuration.isValid
    false, or anything other than true, for a configuration whose text parses to a plain JSON object.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid rejects a non-object parsed value right after
    load (criterion 1) > reads configuration.isValid as false when the loaded configuration parses as
    $label rather than an object
  proves: Criterion 2, at a reading taken after the async load and any effects have settled. Pre-existing
    test, unmodified.
  fails_when: After waitFor observes the ready phase, result.current's configuration.isValid is not false
    for one of the five non-object configuration texts.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid continues to read true for an object right
    after load (criterion 2) > reads configuration.isValid as true when the loaded configuration parses
    as a JSON object
  proves: Criterion 3, at a reading taken after the async load and any effects have settled. Pre-existing
    test, unmodified.
  fails_when: After waitFor observes the ready phase, result.current's configuration.isValid is not true
    for a configuration whose text parses to a plain object.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid rejects a non-object parsed value once the
    operator edits the field (criterion 1) > reads configuration.isValid as false once the field is edited
    to $label rather than an object
  proves: The implementation record's first inference, that configurationValid must keep tracking the
    operator's own edits via handleConfigurationChange, which the render-time adjustment preserves untouched.
    Pre-existing test, unmodified.
  fails_when: After the operator edits the field to a non-object text, configuration.isValid does not
    read false.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid continues to read true for an object once
    the operator edits the field (criterion 2) > reads configuration.isValid as true once the field is
    edited to a different JSON object
  proves: The same inference, for an edit back to a valid object. Pre-existing test, unmodified.
  fails_when: After the operator edits the field to a different valid JSON object, configuration.isValid
    does not read true.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid continues to read true for an object once
    the operator edits the field (criterion 2) > recovers configuration.isValid to true once a non-object
    edit is corrected back to a JSON object
  proves: The same inference, over a sequence of two edits — invalid then corrected — showing handleConfigurationChange
    keeps driving validity independent of the load-time mechanism. Pre-existing test, unmodified.
  fails_when: After a non-object edit followed by a corrective edit back to a valid object, either intermediate
    isValid reading does not match false then true.
not_applicable:
- edge_case: A boolean literal false, distinct from the true already covered by NON_OBJECT_CONFIGURATIONS.
  why: isValidConfigurationObject's check rejects true and false through the identical branch; there is
    no code path treating the two booleans differently, so a second case would exercise the same line
    the true case already does.
- edge_case: Configuration text that fails to parse at all — malformed or empty text — as opposed to text
    that parses but not to a plain object.
  why: The criterion enumerates parses-but-not-an-object shapes specifically; unparsable text collapses
    into the same false result through getJsonTextareaMinifiedValue returning null, a path this task does
    not change and the criterion does not name.
- edge_case: A dependency, the fetch, that answers slowly.
  why: The render-log technique records the value committed at each real render, not a value read after
    an elapsed delay, so it is insensitive to how long the fetch takes to settle; varying the latency
    changes nothing about which value the first ready-phase log entry holds.
- edge_case: Two operations against the hook at once — a second load, a concurrent refetch, or an edit
    racing the initial load.
  why: No criterion of this task speaks of a second ready outcome or of interaction between an in-flight
    load and a concurrent edit; all three criteria speak of the first reading of one already-loaded configuration.
- edge_case: The query failing to load, the load-error phase.
  why: Criteria 1 through 3 all speak of the ready outcome's isValid; the load-error phase carries no
    configuration and no isValid field to read.
untested:
- 'The implementation record''s second inference — that the render-time guard compares query.data by object
  identity rather than by configuration-text content, so a refetch returning a new object reference with
  unchanged text still re-derives validity — has no test here. Identity- versus content-based comparison
  produces the same isValid outcome whenever the refetched text is unchanged, so no assertion on isValid
  alone can distinguish the two strategies; the only scenario where they would diverge is a refetch overwriting
  an operator''s in-progress, unsaved edit, which is pre-existing, unchanged-by-this-task behavior that
  no criterion of this task names. This absence is a finding, not a dismissal: nothing here excludes the
  possibility that this specific dedupe choice regresses silently in the one scenario that would expose
  it.'
---

## What it is
What proves the race correction: two new render-log tests that read configuration.isValid at the very first commit reporting the ready phase, plus the five pre-existing settled-state tests the task's criteria also require.

## Notes
The pre-existing spec file is the one whose intermittent failure surfaced this defect, and the reason it was intermittent is that it read the outcome only after waitFor had let the effects settle.
The two tests added here read the render log instead, so they fail deterministically over the pre-fix hook rather than whenever the timing happens to expose it — which is the difference between a test that catches this class of defect and one that catches it sometimes.
The suite passed on its first capture, across all eight steps the registry declares.
