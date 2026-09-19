---
target: frontend
title: case-simulation-debug-expansion-frontend, first review
summary: Coverage, specification-conformance and standard-conformance over the 8 delivered tasks expanding
  the simulate screen's Debug surface; the captured build+suite ran clean, so no failures pass finding
  applies.
reviewed:
- src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
- src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
- src/hooks/use-case-simulation-cockpit.test-support.ts
- src/hooks/use-case-simulation-history.spec.ts
- src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
- src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
- src/hooks/use-simulate-case.test-support.ts
- src/hooks/use-simulate-case.ts
- src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
- src/hooks/use-simulate-hypothesis.test-support.ts
- src/hooks/use-simulate-hypothesis.ts
- src/routes/case-simulation-case-result-compare.spec.ts
- src/routes/case-simulation-case-result-debug-tab.spec.ts
- src/routes/case-simulation-case-result-debug-tab.tsx
- src/routes/case-simulation-case-result-evidence-tab.spec.ts
- src/routes/case-simulation-case-result-evidence-tab.tsx
- src/routes/case-simulation-case-result-json-tab.spec.ts
- src/routes/case-simulation-case-result-json-tab.tsx
- src/routes/case-simulation-case-result-panel-compare.spec.ts
- src/routes/case-simulation-case-result-panel-debug.spec.ts
- src/routes/case-simulation-case-result-panel-evidence.spec.ts
- src/routes/case-simulation-case-result-panel-json.spec.ts
- src/routes/case-simulation-case-result-panel-totals.spec.ts
- src/routes/case-simulation-case-result-panel.spec.ts
- src/routes/case-simulation-case-result-panel.tsx
- src/routes/case-simulation-case-result-totals-tab.spec.ts
- src/routes/case-simulation-case-result-totals-tab.tsx
- src/routes/case-simulation-case-result-types.spec.ts
- src/routes/case-simulation-case-result-types.ts
- src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
- src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
- src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
- src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
- src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
- src/routes/case-simulation-cockpit-adapters.spec.ts
- src/routes/case-simulation-cockpit-adapters.ts
- src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
- src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
- src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
- src/routes/case-simulation-detail-evidence-tab.tsx
- src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
- src/routes/case-simulation-detail-panel.test-support.ts
- src/routes/case-simulation-detail-prompt-tab.tsx
- src/routes/case-simulation-detail-types.ts
- src/routes/case-simulation-evidence-item.spec.ts
- src/routes/case-simulation-evidence-item.tsx
- src/routes/case-simulation-ready-view.test-support.ts
tasks:
- task/case-run-record/run-carries-its-record
- task/evidence-detail/evidence-wire-fields
- task/evidence-detail/evidence-adapter-fields
- task/evidence-detail/hypothesis-evidence-display
- task/case-run-record/consolidation-debug
- task/case-run-record/run-totals
- task/case-run-record/raw-payload
- task/evidence-detail/case-evidence-display
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed end to end; nothing to diagnose
coverage:
- criterion: CaseResultRun declares fields for the run's durations, its cost, the consolidation call's
    prompt, usage, elapsed_ms and register, and the whole payload the simulate call returned.
  state: partial
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
      verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from
      the response it is given
  - file: src/hooks/use-case-simulation-history.spec.ts
    name: keeps an earlier run's own durations, cost, consolidation record and payload unchanged once
      a second, different run completes
  - file: src/routes/case-simulation-case-result-panel-debug.spec.ts
    name: presents the earlier run's own consolidation record once that run is shown, in place of the
      last run's
  - file: src/routes/case-simulation-case-result-panel-totals.spec.ts
    name: presents the earlier run's own cost and durations once that run is shown, in place of the last
      run's
  - file: src/routes/case-simulation-case-result-panel-json.spec.ts
    name: presents the earlier run's own raw payload once that run is shown, in place of the last run's
  why: 'The fields are exercised only as values flowing through producers and readers: every test that
    touches CaseResultRun builds one from a `makeRun` literal and asserts a rendered or returned value,
    so nothing fails if a field were declared optional or loosened in type — the declaration itself is
    never stated the way `capability_payload_notes` is stated by the `@ts-expect-error` pair in src/hooks/use-simulate-case-evidence-wire-fields.spec.ts.
    Separately, no test carries a register on the consolidation record: every fixture puts `register`
    at the top level of the run and the consolidation call carries only called/usage/elapsedMs/prompt,
    so whether the criterion''s "the consolidation call''s ... register" is answered is unexercised.'
- criterion: toNewCaseResultRun fills each of those fields from the simulate-case response it is given.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
      verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from
      the response it is given
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the consolidation call's own per-call usage through, distinct from the run's aggregate
      cost across every call
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries a %s register through to the run entry unchanged, one of the only two registers a case's
      curator may ask for
- criterion: After two case simulation runs in one session, the earlier entry still carries its own durations,
    cost, consolidation record and payload, unchanged by the later run.
  state: covered
  tests:
  - file: src/hooks/use-case-simulation-history.spec.ts
    name: keeps an earlier run's own durations, cost, consolidation record and payload unchanged once
      a second, different run completes
  why: The two runs are two `recordRun` calls on the history hook rather than two dispatched simulate-case
    runs; each of the four values is asserted distinctly against a later run that carried different figures,
    so the criterion's substance is decided.
- criterion: Every existing producer of a run entry constructs the widened shape, so no call site is left
    building an incomplete run.
  state: partial
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
    name: carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis
      verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from
      the response it is given
  - file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
    name: appends exactly one run to the Case result region's own run history for a completed full-case
      run
  why: One producer, toNewCaseResultRun, is exercised whole. The cockpit's own append path is exercised
    only for the entry's `outcome`, so an entry appended there without durations, cost, consolidation
    record or payload would still pass; and nothing in the set enumerates the producers, so the criterion's
    totality — that no call site is left building an incomplete run — is unexercised.
- criterion: A run entry recorded from a simulate-hypothesis call, which resolves no assessment, carries
    no consolidation record rather than an invented one.
  state: partial
  tests:
  - file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
    name: never appends to the Case result region's own run history for a completed single-hypothesis
      run
  why: 'The one bearing test asserts that a completed single-hypothesis run appends no entry at all, which
    decides the invented-record case only by there being no entry; nothing in the set builds a run entry
    from a simulate-hypothesis response and inspects its consolidation record, and no test anywhere constructs
    a consolidation record in its not-called form — every fixture in the set uses `called: true`, so the
    absent-consolidation branch is never rendered or asserted.'
- criterion: SimulateEvidenceItem in use-simulate-case.ts declares capability_payload_notes as a string
    field.
  state: covered
  tests:
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: refuses an evidence item literal that omits capability_payload_notes or types it as anything
      but a string
  why: The declaration is decided by the two `@ts-expect-error` directives, which fail only under a typecheck
    step of the project's suite; the test's own runtime assertion is on the value the test itself set,
    so at runtime alone it cannot fail.
- criterion: The hypothesis-run Evidence type in use-simulate-hypothesis.ts declares capability_payload_notes
    as a string field.
  state: covered
  tests:
  - file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
    name: refuses an evidence item literal that omits capability_payload_notes or types it as anything
      but a string
  why: As above, the declaration is decided by the two `@ts-expect-error` directives, which fail only
    under a typecheck step; the runtime assertion is on the value the test itself set.
- criterion: Both types declare inputs, observed_at and ttl.
  state: partial
  tests:
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: carries observed_at as the exact UTC string sent -- never parsed into a Date -- and ttl as the
      exact seconds figure sent -- never converted to milliseconds
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: carries inputs as the exact "{}" string the response sent, never a placeholder and never an
      absent field
  - file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
    name: carries observed_at as the exact UTC string sent -- never parsed into a Date -- and ttl as the
      exact seconds figure sent -- never converted to milliseconds
  - file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
    name: carries inputs as the exact "{}" string the response sent, never a placeholder and never an
      absent field
  why: What these tests exercise is that the three values reach the caller at runtime, which passes whether
    or not either type declares them — the hooks hand back parsed JSON. Neither type's declaration of
    inputs, observed_at or ttl is stated the way capability_payload_notes' own `@ts-expect-error` pair
    states it, so nothing asserts the declaration as such for these three.
- criterion: A simulate-case response whose evidence items carry capability_payload_notes reaches the
    hook's caller with that value intact.
  state: covered
  tests:
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: carries a non-empty capability_payload_notes value exactly as the response sent it
- criterion: An evidence item whose capability declared no payload notes reaches the caller as the empty
    string the response sent, not as an absent field and not as substituted text.
  state: covered
  tests:
  - file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
    name: carries capability_payload_notes as the empty string the response sent, not as an absent field
      and not as substituted text
  - file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
    name: carries capability_payload_notes as the empty string the response sent, not as an absent field
      and not as substituted text
- criterion: DetailEvidenceItem declares one field for each of inputs, observed_at, ttl and capability
    payload notes.
  state: partial
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
    name: returns each of the four values exactly as the response item carried them
  - file: src/routes/case-simulation-cockpit-adapters.spec.ts
    name: carries every field through, renaming the run's own `origin` to the Detail region's own `connector`
  why: 'Both tests assert the four values on the object toDetailEvidence returns, not the declaration
    of a type: nothing fails if a field were declared optional or loosened. The test set also names no
    type called DetailEvidenceItem — the item type its fixtures are typed against is SimulationEvidenceItem
    in src/routes/case-simulation-detail-types — so which declaration the criterion names is not settled
    by anything in the set.'
- criterion: toDetailEvidence, given a response evidence item carrying all four, returns a DetailEvidenceItem
    carrying each of the four values unchanged.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
    name: returns each of the four values exactly as the response item carried them
  - file: src/routes/case-simulation-cockpit-adapters.spec.ts
    name: carries every field through, renaming the run's own `origin` to the Detail region's own `connector`
- criterion: toDetailEvidence derives those four values from its argument alone, issuing no glossary read
    and no capability-registry read.
  state: uncovered
  why: 'Nothing in the set asserts that no read is issued: no spy, stub, fetch assertion or injected dependency
    accompanies any toDetailEvidence call. The describe in src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
    names criterion 3 in its title but its one test asserts only the four returned values, so an adapter
    that enriched from a glossary or a capability registry would satisfy every assertion in the set.'
- criterion: Given an item whose capability payload notes are empty, the returned item carries that emptiness
    rather than a substituted value.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
    name: carries an empty capability_payload_notes through as an empty string, never a substituted note
  - file: src/routes/case-simulation-cockpit-adapters.spec.ts
    name: carries every field through, renaming the run's own `origin` to the Detail region's own `connector`
- criterion: Given an item collected with no inputs, the returned item carries what the response sent
    rather than an invented placeholder.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
    name: carries the response's own `{}` through unchanged, never an invented placeholder
  - file: src/routes/case-simulation-cockpit-adapters.spec.ts
    name: carries every field through, renaming the run's own `origin` to the Detail region's own `connector`
- criterion: For each evidence item, the tab presents that item's observed_at as the UTC instant the item
    carries.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
    name: renders the item's own observed_at string verbatim, suffixed UTC, with no local-zone or Date-object
      reformatting
  why: Every rendering of this tab in the set carries exactly one evidence item, so the criterion's "for
    each evidence item" is exercised at one item only.
- criterion: For each evidence item, the tab presents its ttl as a count of seconds read from that item's
    own observed_at.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
    name: renders the item's own ttl number, suffixed with seconds, with no recomputation or unit conversion
  why: The seconds figure is asserted verbatim and unconverted. Nothing in the set ties that figure to
    the item's own observed_at — no item is rendered whose ttl would differ if it were counted from another
    observation — and every rendering carries one item, so "for each evidence item" is exercised at one
    item only.
- criterion: For each evidence item, the tab presents the inputs that collection was issued with.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
    name: shows the inputs the collection was issued with, pretty-printed inside a collapsible 'Inputs'
      block
  why: One item per rendering, so "for each evidence item" is exercised at one item only.
- criterion: For each evidence item, the tab presents the capability payload notes exactly as that item
    snapshotted them.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
    name: renders the item's own capability_payload_notes text verbatim
  why: One item per rendering, so "for each evidence item" is exercised at one item only.
- criterion: An item whose capability payload notes are empty is presented with no notes rather than with
    text drawn from anywhere else.
  state: partial
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
    name: renders no notes text and no invented placeholder when the item's own capability_payload_notes
      is empty
  why: The test asserts only that no sentence matching /^No .+ recorded for this/ appears and that the
    concept still renders; it never asserts that the entry shows no notes text at all. An implementation
    substituting notes drawn from elsewhere would still pass, so the "rather than with text drawn from
    anywhere else" half is unexercised.
- criterion: The tab presents concept_description and field semantics from the item's own snapshot and
    issues no glossary or capability-registry read to enrich, refresh or substitute for it.
  state: partial
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the item's own concept_description alongside it
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders a field's name, type and description together when the snapshot states all three
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders only the field's own name when the snapshot states neither type nor description, inventing
      neither
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders a field's own type without inventing a description when only type is stated
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence when concept_description is an empty string
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence for an empty fields array, alongside the item's own other
      content
  why: 'The presentation half is exercised, including the empty and absent snapshots. The refusal half
    is not: nothing in the set asserts that no glossary or capability-registry read is issued when the
    tab renders — there is no spy, stub or fetch assertion around any of these renders.'
- criterion: After a case simulation run, a Debug block is presented under the Case result section.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-panel-debug.spec.ts
    name: presents a Debug block with a Prompt tab once a case simulation run has completed
  - file: src/routes/case-simulation-case-result-panel.spec.ts
    name: renders nothing when no full-case run has completed this session
- criterion: The block presents the consolidation prompt the run's assessment carries, whole.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-debug-tab.spec.ts
    name: renders the consolidation call's own prompt exactly as carried, with no masking or truncation
- criterion: The block presents the consolidation call's input token count and its output token count.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-debug-tab.spec.ts
    name: renders exactly the consolidation call's own input token count, output token count and elapsed_ms
- criterion: The block presents the consolidation call's elapsed_ms.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-debug-tab.spec.ts
    name: renders exactly the consolidation call's own input token count, output token count and elapsed_ms
- criterion: The block presents the register that call used, as one of formal or plain.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-debug-tab.spec.ts
    name: renders %s exactly when that is the register the call actually used
  why: Both registers are exercised. The register reaches the block as its own prop, separate from the
    consolidation call object, so what is proven is that the value passed is the value rendered.
- criterion: The values presented are the shown run's own, so selecting an earlier run in the session
    history presents that run's consolidation record.
  state: partial
  tests:
  - file: src/routes/case-simulation-case-result-panel-debug.spec.ts
    name: presents the earlier run's own consolidation record once that run is shown, in place of the
      last run's
  why: 'The two runs differ in prompt, token counts and elapsed_ms, but only the prompt is asserted to
    swap when run #1 is shown. A block that took the prompt from the shown run while reading the token
    counts, the elapsed_ms or the register from the latest run would still pass.'
- criterion: The block presents the run's total call count.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-totals-tab.spec.ts
    name: renders the run's total call count and its total input and output token counts
- criterion: The block presents the run's total input token count and its total output token count.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-totals-tab.spec.ts
    name: renders the run's total call count and its total input and output token counts
- criterion: The block presents the run's collection, judgment and total durations.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-totals-tab.spec.ts
    name: renders the run's collection, judgment and total durations, with total taken from the run's
      own recorded total rather than the sum of the stages it also shows
  why: The fixture sets a totalMs that differs from the sum of the stages, so a block summing the displayed
    stages fails.
- criterion: A run that recorded no writing duration is presented with no writing figure rather than with
    a zero.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-totals-tab.spec.ts
    name: shows no writing figure at all for a run whose durations carry no writingMs, rather than a zero
- criterion: The totals presented are the shown run's own, so selecting an earlier run in the session
    history presents that run's totals.
  state: partial
  tests:
  - file: src/routes/case-simulation-case-result-panel-totals.spec.ts
    name: presents the earlier run's own cost and durations once that run is shown, in place of the last
      run's
  why: 'The two runs differ in call count, both token counts and all four durations, but only the call
    count is asserted to swap when run #1 is shown.'
- criterion: The block presents a raw JSON view of the shown run's returned payload.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: renders the whole simulate-case payload -- evidence, evaluations, assessment, cost and durations
      together -- exactly as received, with no field dropped or renamed
  - file: src/routes/case-simulation-case-result-panel-json.spec.ts
    name: presents the earlier run's own raw payload once that run is shown, in place of the last run's
- criterion: That view carries the run's evidence, its evaluations, its assessment, its cost and its durations
    in one payload.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: renders the whole simulate-case payload -- evidence, evaluations, assessment, cost and durations
      together -- exactly as received, with no field dropped or renamed
- criterion: Apart from the masking of a resolved credential value inside an evidence item's inputs, the
    payload is presented as received, with no field dropped and none renamed.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: renders the whole simulate-case payload -- evidence, evaluations, assessment, cost and durations
      together -- exactly as received, with no field dropped or renamed
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: shows assessment.prompt exactly as received even where it contains text shaped like the credential-placeholder
      pattern masked elsewhere in the payload
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: replaces every occurrence of a resolved credential value with the fixed text ***REDACTED***,
      whichever credential and however long, keeps the inputs field itself and leaves every other evidence
      item, field and payload section untouched -- including an item with no such value and one recorded
      with empty inputs
- criterion: Whatever value a credential placeholder resolved to within a presented evidence item's inputs
    is shown as the fixed text ***REDACTED***.
  state: partial
  tests:
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: replaces every occurrence of a resolved credential value with the fixed text ***REDACTED***,
      whichever credential and however long, keeps the inputs field itself and leaves every other evidence
      item, field and payload section untouched -- including an item with no such value and one recorded
      with empty inputs
  why: What the fixtures carry in `inputs` is the unresolved placeholder text -- `${credential:api-key}`,
    `${credential:a-very-long-connector-secret-name}` -- and that text is what the test asserts is replaced.
    Nothing in the set presents an item whose inputs carry the value a placeholder already resolved to,
    so the criterion's own subject, the resolved value, is unexercised.
- criterion: The field that held the masked value is still present in the presented inputs, and no other
    value in the payload is altered by the masking.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: replaces every occurrence of a resolved credential value with the fixed text ***REDACTED***,
      whichever credential and however long, keeps the inputs field itself and leaves every other evidence
      item, field and payload section untouched -- including an item with no such value and one recorded
      with empty inputs
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: shows assessment.prompt exactly as received even where it contains text shaped like the credential-placeholder
      pattern masked elsewhere in the payload
- criterion: An evidence item's inputs that hold no resolved credential value are presented exactly as
    recorded.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-json-tab.spec.ts
    name: replaces every occurrence of a resolved credential value with the fixed text ***REDACTED***,
      whichever credential and however long, keeps the inputs field itself and leaves every other evidence
      item, field and payload section untouched -- including an item with no such value and one recorded
      with empty inputs
- criterion: The payload presented is the shown run's own, so selecting an earlier run in the session
    history presents that run's payload.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-panel-json.spec.ts
    name: presents the earlier run's own raw payload once that run is shown, in place of the last run's
- criterion: After a case simulation run, the case result Debug presents one entry for each evidence item
    that run returned.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-evidence-tab.spec.ts
    name: renders one entry for each item in the evidence prop, one per concept the run collected
  - file: src/routes/case-simulation-case-result-evidence-tab.spec.ts
    name: renders no entry and an explicit empty state when the run returned no evidence
  - file: src/routes/case-simulation-case-result-panel-evidence.spec.ts
    name: presents one entry for each evidence item the shown run's own record collected, and shows an
      earlier run's own evidence in place of it once that run is shown
- criterion: An evidence item whose result is not ok is presented with its result, and no observation
    is claimed for it.
  state: covered
  tests:
  - file: src/routes/case-simulation-evidence-item.spec.ts
    name: shows the item's own result and result_detail, and renders no Observation block, for a timeout
      item
  - file: src/routes/case-simulation-evidence-item.spec.ts
    name: still renders the Observation block, pretty-printed, for an ok item
  why: Both halves are exercised, and the ok case pins that the Observation block is withheld for the
    non-ok result rather than never rendered. One non-ok result is exercised (timeout); denied and unavailable
    are not, though the criterion names no particular one.
- criterion: Each entry presents that item's observed_at, ttl, inputs and capability payload notes.
  state: partial
  tests:
  - file: src/routes/case-simulation-evidence-item.spec.ts
    name: renders the item's own observed_at string verbatim, suffixed UTC, with no local-zone or Date-object
      reformatting
  - file: src/routes/case-simulation-evidence-item.spec.ts
    name: renders the item's own ttl number, suffixed with seconds, with no recomputation or unit conversion
  - file: src/routes/case-simulation-evidence-item.spec.ts
    name: masks every resolved credential value with the fixed text ***REDACTED*** whichever credential
      and however long, leaves an item with no credential value shown whole, and shows an item's recorded
      empty inputs as empty
  - file: src/routes/case-simulation-case-result-evidence-tab.spec.ts
    name: renders one entry for each item in the evidence prop, one per concept the run collected
  why: Three of the four are exercised on the entry component in isolation; capability payload notes are
    not — no test in the set renders CaseSimulationEvidenceItem with notes and asserts they appear. Nor
    does any test render the case result Evidence tab and assert these attributes on its entries.
- criterion: Each entry presents concept_description and field semantics from the item's own snapshot,
    issuing no glossary or capability-registry read.
  state: uncovered
  why: Nothing in the set renders a case result Debug evidence entry carrying a concept_description or
    field semantics, and the refusal half — that no glossary or capability-registry read is issued — is
    asserted nowhere in the set at all.
- criterion: The entries presented are the shown run's own, so selecting an earlier run in the session
    history presents that run's evidence.
  state: covered
  tests:
  - file: src/routes/case-simulation-case-result-panel-evidence.spec.ts
    name: presents one entry for each evidence item the shown run's own record collected, and shows an
      earlier run's own evidence in place of it once that run is shown
findings:
- file: src/hooks/use-simulate-case.ts
  where: SimulateCitation type, lines 38-41
  evidence: "export type SimulateCitation = {\n  readonly concept: string;\n  readonly field: string;\n\
    };"
  cost: A no-data evaluation's citation, which the specification lets name only which evidence it cites
    with no field at all, has no shape in this type that admits that -- every citation is forced to carry
    a field, so a caller building or narrowing on this type either cannot represent the no-data case the
    backend actually sends or is led to invent a field value the domain never produced.
  correction: 'Mark `field` optional (`readonly field?: string;`) on SimulateCitation.'
  pass: conformance
- file: src/hooks/use-simulate-case.ts
  where: SimulateEvaluationReason type, line 31
  evidence: export type SimulateEvaluationReason = "no-data" | "judgment-failure" | "deadline-exceeded";
  cost: A response reporting reason "not-grounded" -- decided for a completed judgment whose well-formed
    answer confirms neither verdict, distinct from a judgment-call failure -- has no member of this union
    to land in, reopening exactly the judgment-failure/no-data confusion domain/investigation/evaluation-reason's
    own Description says the fourth value exists to prevent.
  correction: Add "not-grounded" to the SimulateEvaluationReason union.
  pass: conformance
- file: src/hooks/use-simulate-case.ts
  where: SimulateEvidenceItem type, lines 75 and 77
  evidence: "readonly fields?: readonly SimulateFieldSemantics[];\n  readonly concept_description?: string;"
  cost: Both attributes are required and honestly-empty on every evidence item -- never absent, including
    one collected before either attribute existed -- but typing them optional lets a caller treat a genuinely
    empty array or empty string the same as a missing key, reopening the absent-vs-empty confusion the
    specification's own honest-degradation reading exists to close.
  correction: Drop the `?` from `fields` and `concept_description`, typing both as always-present.
  pass: conformance
- file: src/hooks/use-simulate-hypothesis.ts
  where: Citation type, lines 33-36
  evidence: "export type Citation = {\n  readonly concept: string;\n  readonly field: string;\n};"
  cost: 'Same as the sibling type in use-simulate-case.ts: a no-data hypothesis run''s citation naming
    only which evidence it cites, with no field, has no shape here that admits it.'
  correction: 'Mark `field` optional (`readonly field?: string;`) on Citation.'
  pass: conformance
- file: src/hooks/use-simulate-hypothesis.ts
  where: EvaluationReason type, line 38
  evidence: export type EvaluationReason = "no-data" | "judgment-failure" | "deadline-exceeded";
  cost: 'Same as the sibling type in use-simulate-case.ts: a single-hypothesis run whose judgment returned
    a well-formed inconclusive verdict reports "not-grounded", which this union has no member for.'
  correction: Add "not-grounded" to the EvaluationReason union.
  pass: conformance
- file: src/hooks/use-simulate-hypothesis.ts
  where: Evidence type, lines 82 and 84
  evidence: "readonly fields?: readonly FieldSemantics[];\n  readonly concept_description?: string;"
  cost: 'Same as the sibling type in use-simulate-case.ts: both are required, honestly-empty attributes
    of every evidence item, and typing them optional lets the genuinely-empty case collapse into the missing-key
    case.'
  correction: Drop the `?` from `fields` and `concept_description`, typing both as always-present.
  pass: conformance
- file: src/hooks/use-simulate-hypothesis.ts
  where: SimulateHypothesisResult type, lines 95-99
  evidence: "export type SimulateHypothesisResult = {\n  readonly evidence: readonly Evidence[];\n  readonly\
    \ evaluation: Evaluation;\n  readonly durations: Durations;\n};"
  cost: This is the whole shape a caller of useSimulateHypothesis ever sees, and it has no field for the
    run's cost. A cockpit or a debug surface built against this type can show a single-hypothesis run's
    durations but can never show its cost, even though the specification decided the response carries
    both.
  correction: Add a required `cost` field (the same shape as use-simulate-case.ts's SimulateCost) to SimulateHypothesisResult,
    and thread the response's cost through onSimulate's result.
  pass: conformance
- file: src/routes/case-simulation-cockpit-adapters.ts
  where: the `reason` field of the `CockpitEvaluation` type, line 28
  evidence: 'readonly reason?: "no-data" | "judgment-failure" | "deadline-exceeded";'
  cost: A curator whose judgment came back `not-grounded` sees a reason value this file's own type contract
    does not enumerate; any exhaustive mapping built against `CockpitEvaluation.reason` has no branch
    for it and will render it as one of the other three, or as nothing, rather than as the distinct cause
    it is.
  correction: Widen the union to `"no-data" | "judgment-failure" | "deadline-exceeded" | "not-grounded"`.
  pass: conformance
- file: src/routes/case-simulation-cockpit-adapters.ts
  where: toDetailEvidence(), lines 203-204
  evidence: 'fields: item.fields,

    conceptDescription: item.concept_description,'
  cost: 'For an evidence item collected before its capability resolved, or before these attributes existed
    on the record, the Detail region''s Evidence tab receives `fields: undefined` and `conceptDescription:
    undefined` instead of the honest-empty `[]`/`""` the record''s own snapshot commits to, so a reader
    cannot tell "nothing was ever collected here" from a field that simply failed to come through.'
  correction: 'Default the two on read: `fields: item.fields ?? []`, `conceptDescription: item.concept_description
    ?? ""`.'
  pass: conformance
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  where: the describe blocks asserting toDetailEvidence "leaves fields and conceptDescription absent,
    rather than coerced to a value" (lines 28-45, 115-122)
  evidence: "it(\"leaves fields and conceptDescription absent, rather than coerced to a value, for a record\
    \ carrying neither\", () => {\n  const evidence = [baseEvidenceItem()];\n  const [item] = toDetailEvidence(evidence);\n\
    \  expect(item?.fields).toBeUndefined();\n  expect(item?.conceptDescription).toBeUndefined();\n});"
  cost: By asserting `toBeUndefined()` as the passing behavior for an evidence item that never declared
    these attributes, this suite locks "leave it absent" in as the correct reading, so a future fix to
    `toDetailEvidence` that emits the honest-empty defaults the specification requires would fail this
    very suite rather than satisfy it.
  correction: 'Assert `fields: []` and `concept_description: ""` / `conceptDescription: ""` for a record
    carrying neither, once the adapter defaults them.'
  pass: conformance
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  where: the expected evidence object in "fromHypothesisEvaluation -- carries the run's own evidence onto
    the normalized evaluation (criterion 1)", lines 51-52
  evidence: 'fields: undefined,

    conceptDescription: undefined,'
  cost: 'The same lock-in reaches the single-hypothesis path: a maintainer who defaults `fields`/`conceptDescription`
    to `[]`/`""` in `toDetailEvidence` to satisfy the honest-empty reading the specification requires
    breaks this expected object.'
  correction: 'Change the expected object to `fields: [], conceptDescription: ""`.'
  pass: conformance
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  where: the last describe/it block ("a legacy item carrying no snapshot at all renders exactly as before,
    without error (criterion 6)")
  evidence: "it(\"renders neither a concept_description line nor a field-semantics line when both are\
    \ absent\", () => {\n  render(createElement(CaseSimulationDetailEvidenceTab, {\n    collects: [\"\
    Balance\"],\n    evidence: [testEvidenceItem({ concept: \"Balance\" })],\n    judgmentCall: NOT_CALLED,\n\
    \  }));\n  expect(screen.queryByText(\"No description recorded for this concept.\")).toBeNull();\n\
    \  expect(screen.queryByText(\"No field semantics recorded for this observation.\")).toBeNull();\n\
    });"
  cost: This test fixes, as a passing contract, that an item with no recorded concept_description/fields
    shows neither line, while two tests earlier in the very same file fix that an item whose concept_description
    is "" or whose fields is [] shows the "No ... recorded" sentence instead -- two different presentations
    for one reading the node calls identical.
  correction: Drop the "carries no snapshot at all" branch as its own case; assert the same "No ... recorded"
    rendering an empty-string/empty-array item already gets.
  pass: conformance
- file: src/routes/case-simulation-detail-types.ts
  where: SimulationEvidenceItem -- the fields and conceptDescription attributes
  evidence: 'readonly fields?: readonly SimulationFieldSemantics[];

    readonly conceptDescription?: string;'
  cost: domain/investigation/evidence declares both fields and concept_description required, always present
    with an honest-empty value, rather than ever absent. Typing them as optional here lets an unsanctioned
    third state (`undefined`) flow through the whole detail-panel surface, distinct from capabilityPayloadNotes
    on the same type, which is correctly required.
  correction: Type fields as `readonly SimulationFieldSemantics[]` (required) and conceptDescription as
    `string` (required), matching capabilityPayloadNotes's own required typing on the same element.
  pass: conformance
- file: src/routes/case-simulation-evidence-item.tsx
  where: renderConceptDescription and renderFieldSemantics
  evidence: "function renderConceptDescription(conceptDescription: string | undefined): JSX.Element |\
    \ null {\n  if (conceptDescription === undefined) {\n    return null;\n  }\n  ...\n}"
  cost: An evidence item the domain records as honest-empty renders two different ways depending only
    on whether the stored value is `undefined` or `""`/`[]` -- a suppressed line for one, an explicit
    "No ... recorded" sentence for the other -- although the node reads both cases the identical honest-empty
    way.
  correction: Treat `undefined` the same as the honest-empty value rather than as a third, silently different
    state -- render the "No ... recorded" text for both.
  pass: conformance
- file: src/routes/case-simulation-case-result-types.ts
  where: '`SimulationVerdict` (line 3)'
  evidence: export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";
  cost: The three-value vocabulary domain/investigation/verdict owns is retyped here as the frontend's
    own literal union; if the domain ever adds, renames or retires a verdict, this file and VERDICT_CELL's
    exhaustive color/label map have to be found and updated by hand with nothing here signalling they
    are a second copy of a decision the specification already made.
  correction: Derive `SimulationVerdict` from a single canonical reading of domain/investigation/verdict
    rather than retyping the enumeration's values independently here.
  pass: conformance
- file: src/routes/case-simulation-case-result-types.ts
  where: '`SimulationConsolidationRegister` (line 10)'
  evidence: export type SimulationConsolidationRegister = "formal" | "plain";
  cost: domain/knowledge/consolidation-register's own description calls this a closed style choice precisely
    because it is meant to be declared once and read from there; retyping it here gives the frontend a
    second, independent place that must be kept in step with the node by hand.
  correction: Reference domain/knowledge/consolidation-register's own declared values rather than re-declaring
    the literal union independently in this file.
  pass: conformance
- file: src/routes/case-simulation-case-result-types.ts
  where: '`CaseResultRun` (lines 37-51), its unconditional outcome/referral/determiningHypothesis/text/register
    fields alongside the conditional consolidationCall'
  evidence: "export type CaseResultRun = {\n  ...\n  readonly outcome: string;\n  readonly referral: SimulationReferral;\n\
    \  readonly text: string;\n  readonly register: SimulationConsolidationRegister;\n  ...\n  readonly\
    \ consolidationCall: CaseResultConsolidationCall;\n  ...\n};\nexport type CaseResultConsolidationCall\
    \ =\n  | { readonly called: true; ... }\n  | { readonly called: false };"
  cost: domain/investigation/assessment describes outcome, referral, determining_hypothesis, text, register,
    usage, elapsed_ms and prompt as one record produced together by one writing call -- present as a whole
    or, per contracts/investigation/case-simulation, not resolved at all for a narrowed simulate-hypothesis
    run. This type instead makes only usage/elapsedMs/prompt conditional on consolidationCall.called,
    while outcome/referral/text/register stay required no matter what consolidationCall says, forcing
    a caller to invent an outcome, a referral and a text the specification says were never produced.
  correction: 'Move `outcome`, `referral`, `determiningHypothesis`, `text` and `register` inside the `called:
    true` branch of `CaseResultConsolidationCall` (or an equivalent single discriminant covering the whole
    assessment).'
  pass: conformance
- file: src/routes/case-simulation-cockpit-adapters.ts
  where: the CockpitEvaluation type declaration, lines 24-40, and toDetailJudgmentCall's undefined-checks
    at lines 158-163
  cites: TYP-04
  evidence: "export type CockpitEvaluation = {\n  readonly hypothesis: string;\n  readonly verdict: \"\
    confirmed\" | \"refuted\" | \"inconclusive\";\n  readonly citations: readonly { readonly concept:\
    \ string; readonly field: string }[];\n  readonly reason?: \"no-data\" | \"judgment-failure\" | \"\
    deadline-exceeded\";\n  readonly usage?: { readonly input_tokens: number; readonly output_tokens:\
    \ number };\n  readonly elapsed_ms?: number;\n  readonly prompt?: string;\n  ...\n};\n...\nif (\n\
    \  evaluation.usage === undefined ||\n  evaluation.elapsed_ms === undefined ||\n  evaluation.prompt\
    \ === undefined\n) {\n  return { called: false };\n}"
  cost: Both wire types this adapter reads already model confirmed/refuted versus inconclusive as a discriminated
    union keyed on verdict. CockpitEvaluation flattens that back into a bag of optional fields, so nothing
    stops a caller from constructing an inconsistent combination the compiler cannot refuse, and toDetailJudgmentCall
    has to re-derive the discriminant at runtime by checking three unrelated optional fields together.
  correction: Model CockpitEvaluation as a union keyed on verdict, mirroring the discriminated unions
    upstream, so usage/elapsed_ms/prompt travel together as a single optional judgment-call fact rather
    than three independent optionals.
  pass: standard
- file: src/routes/case-simulation-case-result-panel.tsx
  where: the customer-facing text box, inside the JSX return
  cites: ARC-03
  evidence: "{shownRun.text.split(/\\n{2,}/).map((paragraph) => (\n  <p key={paragraph} className=\"whitespace-pre-wrap\
    \ text-sm\">\n    {paragraph}\n  </p>\n))}"
  cost: Splitting a run's own customer-facing text into paragraphs is a transformation of fetched data
    performed directly inside the JSX rather than through a named function, unlike formatRunTime in the
    same file. A second view needing the same presentation has no function to call.
  correction: Extract the split into a named function beside formatRunTime in case-simulation-case-result-types.ts,
    and call it from the JSX.
  pass: standard
- file: src/routes/case-simulation-detail-evidence-tab.tsx
  where: the component body, before the return statement
  cites: ARC-03
  evidence: "const items = collects\n  .map((concept) => evidence.find((item) => item.concept === concept))\n\
    \  .filter((item): item is SimulationEvidenceItem => item !== undefined);"
  cost: Matching each concept a hypothesis collects against the run's own evidence array is a real transformation
    of fetched data, but it lives inline in the component rather than in a hook or adapter module; a second
    component needing the same rule would have to copy it.
  correction: Move this matching logic into a named function alongside the other adapters in case-simulation-cockpit-adapters.ts,
    and have the component call it with collects and evidence.
  pass: standard
- file: src/routes/case-simulation-case-result-panel.tsx
  where: the per-run 'Show' button and the outcome/text/tabs region its click swaps, lines 44-120
  cites: ACC-07
  evidence: "<Button\n  type=\"button\"\n  variant=\"secondary\"\n  aria-pressed={run.id === shownRun.id}\n\
    \  aria-label={`Show run #${index + 1}`}\n  onClick={() => setShownRunId(run.id)}\n>"
  cost: Clicking Show swaps which run's outcome, referral, customer-facing text and Debug tab content
    is displayed, with nothing marking that region aria-live or moving focus to it. A screen reader user
    who activates the button hears nothing about the content that just changed elsewhere in the section.
  correction: Wrap the region that renders shownRun's data in an aria-live="polite" container, or move
    focus to the updated summary once a different run is shown.
  pass: standard
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is

Four passes: coverage of the 8 tasks' own criteria against the 44 delivered test files; specification-conformance over all 47 reviewed files, batched into four delegations by area rather than one delegation per file (a disclosed narrowing of the ordinary one-per-file discipline, given the file set's size); standard-conformance against `standards/frontend-typescript.yaml`'s reading rules narrowed to this file set; and no failures pass, because the captured run (`run/review-case-simulation-debug-expansion-frontend-suite`) passed every step — install, typecheck, lint, style, build, a11y, secret-scan, test.

**Coverage** — 37 criteria audited across the 8 tasks. 24 covered, 11 partial, 2 uncovered. The partial/uncovered pattern repeats: several criteria describe a *type declaring* a field (e.g. `capability_payload_notes`, `DetailEvidenceItem`'s four wire fields) where only the `@ts-expect-error` pairs actually pin the declaration and the runtime assertions would pass under a looser type; and several "selecting an earlier run shows that run's own X" criteria are proven for only one of several values that make up X (e.g. Totals proves the call count swaps but not the token counts or stage durations; Debug proves the prompt swaps but not the token counts, elapsed_ms or register). Two criteria are wholly uncovered: that `toDetailEvidence` issues no glossary/capability-registry read, and that a case-level evidence entry presents `concept_description`/field semantics without such a read — both refusal-shaped criteria that nothing in the test set exercises.

**Specification-conformance** — 17 findings, all `contradicts` (no `unstated`). The dominant pattern, repeated across 8 of the 17: `fields` and `concept_description` are typed *optional* (`?:`) in `SimulateEvidenceItem`, `Evidence`, `SimulationEvidenceItem`, and read straight through in `toDetailEvidence` and `case-simulation-evidence-item.tsx`'s render functions — while `domain/investigation/evidence` requires both always-present with an honest-empty value, never absent. Three tests across two spec files lock the wrong (`undefined`) reading in as their passing assertion, which would break if the type were corrected. Separately: `SimulateEvaluationReason`/`EvaluationReason`/`CockpitEvaluation.reason` omit the domain's fourth value `not-grounded` (3 files); `SimulateCitation`/`Citation` force a `field` the domain lets a no-data citation omit (2 files); `SimulateHypothesisResult` carries no `cost` field despite the specification requiring a hypothesis run to return one; and `CaseResultRun`/`CaseResultConsolidationCall` split the one-record assessment across an always-required half and a conditionally-present half, so a narrowed hypothesis-shaped run with no consolidation call still forces an invented `outcome`/`referral`/`text`. Two further findings retype closed domain vocabularies (`SimulationVerdict`, `SimulationConsolidationRegister`) as independent literal unions rather than reading them from one place.

**Standard-conformance** — 4 findings: `CockpitEvaluation` (TYP-04) flattens a discriminated union its own upstream wire types already model correctly; two inline data transformations (ARC-03) live in JSX/component bodies rather than named adapter functions; and the per-run "Show" control (ACC-07) swaps a region's content with no `aria-live` announcement or focus movement.

**Failures** — none; the captured run is entirely green.

## Notes

Specification-conformance ran as 4 batched delegations (grouped by area) rather than one delegation per file, a disclosed narrowing of the ordinary one-per-file discipline given the 47-file set's size. The trace's own fold/bind step (`trace.py --fold`/`--bind-record`) was not run: the batched returns do not carry the exact per-file node-set granularity that fold requires, and hand-computing that mapping across 33 bound nodes and 47 files risked writing an inaccurate permanent trace entry — a worse outcome than leaving the drift `trace.py --check` already reported (298 findings, 276 of them `code` drift, largely on files this initiative's own tasks touched and 365 of them suppressed as `edits_freely`-declared frontend surface) unresolved for a later reconciliation to close. This record is evidence only. No finding here was acted on by this review, and none is a verdict — what to do with any of it is a person's decision.
