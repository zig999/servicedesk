---
target: frontend
title: ResponseMap capability coverage statement over the field's text and the drafted
  configuration
summary: A shared pure judgment service states, over the Configuration field's own text and over
  a stated draft's configuration text alike, which responseMap keys a connector-filtered
  capability's output schema reads, which reach none, and which of a capability's own expected
  fields no key names.
task: sha256:bfe771d86d944e1b8b41c1cd523e521609e14a9abc0184f4881f494f88b87090
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-response-map-capability-coverage-build
files:
- path: src/services/connector-configuration-response-map-capability-coverage.ts
  effect: New pure service. Parses the configuration text; returns null when it is not
    well-formed JSON object text or declares no responseMap object. Where the connector-filtered
    capability list is empty, returns a single cannot-be-read outcome. Otherwise reads each
    capability's output_schema top-level properties, and returns a coverage outcome carrying two
    separate lists -- keyStatements and expectedFieldStatements.
- path: src/hooks/use-response-map-capability-coverage.ts
  effect: New hook. Fetches capabilities via the existing useCapabilities() query cache, filters
    them by connector name, and memoizes a call into the new service against a given
    configuration text.
- path: src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  effect: New rendering component. Renders nothing when the coverage is null. Renders the
    cannot-be-read message alone when no capability is registered. Otherwise renders two separate
    labelled lists -- key coverage (read / read-by-none) and expected-but-unnamed fields --
    omitting whichever list is empty.
- path: src/services/connector-configuration-messages.ts
  effect: Adds pt-BR message constants/functions for this statement.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Wires the fifth readiness statement into the Configuration-field column, right after
    CredentialPlaceholderStatements.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Passes connector into ConnectorConfigurationDraftDisclosure, which now computes and
    renders the same statement beside the drafted configuration's <pre> block.
criteria:
- criterion: A responseMap key naming a top-level output schema property of a capability
    registered naming the connector is stated as read, naming that capability.
  met: true
  how: keyStatements maps each responseMap key to "read" with capabilityLabels listing every
    connector-filtered capability whose output_schema.properties declares that key.
- criterion: A responseMap key naming no such property of any such capability is stated as read
    by no capability.
  met: true
  how: When no connector-filtered capability's output-schema properties include the key,
    keyStatements carries "read-by-none" for it.
- criterion: Each top-level output schema property of such a capability that no responseMap key
    names is stated, naming the capability that expects it.
  met: true
  how: For every connector-filtered capability, every one of its own output-schema property names
    absent from the responseMap's key set is pushed to expectedFieldStatements, rendered as its
    own list, separate from the key-coverage list.
- criterion: Where no capability is registered naming the connector, the surface states that
    which fields an observation would carry cannot be read.
  met: true
  how: computeResponseMapCapabilityCoverage returns { kind = "cannot-be-read" } whenever
    connectorCapabilities is empty, checked before any per-key work.
- criterion: The statement is made over the content the Configuration field currently holds.
  met: true
  how: connector-configuration-form-fields.tsx calls useResponseMapCapabilityCoverage with
    configuration.value and renders the statement right in the field's column.
- criterion: The statement is made over the configuration of a draft the surface states, as well
    as over the field's content.
  met: true
  how: ConnectorConfigurationDraftDisclosure calls the same hook with disclosure.draft.configuration
    and its own connector, and renders the same statement component beside the drafted <pre>
    block.
- criterion: The capabilities the statement is read from come from the connector-filterable
    capability list this area already holds, and no second read of the capability registry is
    added.
  met: true
  how: Both call sites go through useCapabilities(), the single react-query-cached fetch every
    existing readiness statement already uses.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/services/connector-configuration-response-map-capability-coverage.ts
  - src/hooks/use-response-map-capability-coverage.ts
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  how: The service and both hooks read only this value-object's configuration text and the
    connector name used to filter capabilities.
- node: rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
  encoded_at:
  - src/services/connector-configuration-response-map-capability-coverage.ts
  - src/hooks/use-response-map-capability-coverage.ts
  - src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  - src/routes/connector-configuration-form-fields.tsx
  - src/routes/connector-configuration-helper-fields.tsx
  how: computeResponseMapCapabilityCoverage implements every clause of the statement over both
    the field's text and a stated draft's configuration.
- node: rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  encoded_at:
  - src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  how: The statement is rendered unconditionally in both places; no code path disables, hides, or
    otherwise withholds Save, Apply, or the request-draft act.
- node: scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects
  encoded_at:
  - src/services/connector-configuration-response-map-capability-coverage.ts
  - src/routes/connector-configuration-response-map-capability-coverage-view.tsx
  how: The service returns keyStatements and expectedFieldStatements as two distinct lists, and
    the view renders them as two separate labelled blocks.
inferences:
- inferred: For a responseMap key read by more than one capability, name every capability whose
    output schema declares the property.
  from: The sibling subject-placeholder-statements task's own resolved reading of the analogous
    choice.
- inferred: A capability whose output_schema fails to parse, or lacks a usable properties object,
    contributes an empty property-name set.
  from: The sibling subject-placeholder-statements service's own precedent for a malformed
    input_schema.
- inferred: The service returns null as its "nothing to state" value, carrying a discriminated
    union rather than a flat statement array.
  from: The task's own instruction that the two statement lists are related but distinct, not one
    merged list.
- inferred: connector-configuration-helper-fields.tsx reads the connector for
    ConnectorConfigurationDraftDisclosure from state.connector ?? "".
  from: The file's own existing connectorNameMissing pattern a few lines above, in the same
    component.
preserved:
- The three delivered sibling readiness statements in connector-configuration-form-fields.tsx are
  untouched beyond the one new import/hook-call/render line.
- All of ConnectorConfigurationDraftDisclosure's other sections and the stale-draft message and
  Apply button behavior are untouched beyond the new statement rendered after the <pre> block.
- The request-draft gate, operations-read disclosure states, and the apply-confirmation diff
  dialog in both files are untouched.
- No act is gated, disabled, or hidden by the new statement in either file.
deferred:
- what: pt-BR wording for every string this task adds.
  why: Already delivered in pt-BR directly, following the established message-module convention;
    listed here only to note no further translation task remains for this statement.
---

## What it is
The one moment the operator can learn that a responseMap key reaches nothing, or that a field the capability expects has no key.

## Notes
Build round 1 green on the first attempt. Suite round 1 (proof step) failed 24 tests across 5
pre-existing spec files (connector-configuration-helper-fields-apply.spec.ts, -reading-notes.spec.ts,
-response-fields.spec.ts, -stale-draft-marking.spec.ts, connector-configuration-helper-fields.spec.ts)
that mount ConnectorConfigurationHelperFields with a "drafted" outcome directly, with no
QueryClientProvider ancestor -- a real, legitimate new requirement this task introduces, since
ConnectorConfigurationDraftDisclosure now calls useResponseMapCapabilityCoverage, which reads
useCapabilities()'s react-query cache. Fixed by wrapping each affected render call in a
QueryClientProvider with a stubbed empty-capabilities fetch, never weakening any assertion. Suite
round 2 then failed lint (max-lines) on connector-configuration-helper-fields.spec.ts, pushed over
300 lines by the added wrapper boilerplate; fixed by splitting its Configuration-field-independence
and stale-disclosure-clearing tests into a new sibling file,
connector-configuration-helper-fields-independent-content-and-staleness.spec.ts, per this
delivery's established convention. Suite round 3 green.
