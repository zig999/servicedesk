---
title: Detail hook computes configuration validity synchronously, not after an effect
summary: useConnectorConfigurationDetail derives configurationValid from the loaded configuration's own
  text at render time, so the ready outcome's isValid is already correct the first time a consumer reads
  it, rather than a default an effect corrects one render later.
task: sha256:e240a45ff19229c109b49b93edd8d163dcbec441b33d1d42d03d03ceb44368e2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-validity-race-hook-computes-validity-before-ready-build
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Adds a small piece of state, syncedConfigurationData, tracking the last query.data object the
    hook derived validity from. A guarded conditional right after the query calls setConfigurationValid(isValidConfigurationObject(query.data.configuration))
    synchronously during render — React's own documented adjust-state-while-rendering technique — instead
    of inside the existing useEffect. Because a conditional setState made during render causes React to
    re-render with the updated state before the function returns anything a caller can read, the corrected
    isValid is already present in the very commit that first reports the ready phase, for the initial
    load and for any later refetch. The pre-existing useEffect keeps syncing configurationValue, configurationBaseline
    and form.reset exactly as before; only the setConfigurationValid call was removed from inside it.
    handleConfigurationChange and the mutation logic are unchanged.
criteria:
- criterion: At the moment the hook's outcome first reports the ready phase, the isValid it carries reflects
    the loaded configuration's own text rather than a value the hook has not yet corrected.
  met: true
  how: configurationValid is set from isValidConfigurationObject(query.data.configuration) in the same
    render that query.data first becomes defined and the ready phase is about to be returned, via the
    render-time state adjustment described in files. There is no longer a render in which phase is ready
    and isValid still holds the pre-load default.
- criterion: A loaded connector configuration whose text does not parse to a plain object — a bare string,
    an array, a number, a boolean or null among them — is reported as not valid at every reading of the
    ready outcome, including the first.
  met: true
  how: isValidConfigurationObject, unchanged, already returns false for a bare string, an array, a number,
    a boolean or null once it minifies and parses the text; the fix makes that function run against the
    loaded text before the first ready reading rather than after, so its answer is already what the first
    reading carries.
- criterion: A loaded connector configuration whose text parses to a plain object is reported as valid
    at every reading of the ready outcome, including the first.
  met: true
  how: 'The same mechanism: isValidConfigurationObject returns true for a plain object, computed and committed
    to configurationValid before the first ready reading, so the first reading carries true rather than
    relying on the previous default coinciding with the right answer.'
nodes:
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: 'Per this task''s own REMAINDER note, only the rule''s well-formed definition — JSON object text,
    a null value and an array excluded — is in scope here, not the write-side refusal clauses. That definition
    is encoded by isValidConfigurationObject, unchanged by this task. What this task changes is when that
    definition is applied to the loaded text: synchronously as the ready phase is produced rather than
    after an effect, so a reader of the ready outcome''s isValid never observes a value the rule''s own
    definition has not yet been checked against.'
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The domain node states the configuration is held and answered as JSON object text. The hook reads
    that text and answers its own well-formedness as isValid at the moment the ready phase is entered,
    rather than at a later, effect-deferred moment.
inferences:
- inferred: 'The correction uses React''s adjust-state-while-rendering idiom — compare the current query.data
    reference against the last one validity was derived from, and call setConfigurationValid conditionally
    before any return — rather than a useMemo, because configurationValid is not a pure function of query.data
    alone throughout the hook''s life: it must also track the operator''s own edits via handleConfigurationChange,
    which a memo keyed on query.data could not express.'
  from: React's own documented pattern for deriving state from a changed query without an effect, and
    the standard's STA-03, whose stated concern is specifically a value kept in sync by an effect — the
    fix removes exactly that mechanism for this one field.
- inferred: The guard compares query.data by object identity, matching the pre-existing effect's own dependency
    array, rather than by comparing configuration text content, so a refetch returning a new object with
    unchanged text still re-derives validity, preserving the original effect's resync-on-every-fetch behavior
    rather than introducing a new dedupe.
  from: The useEffect this replaces the setConfigurationValid call inside, which already resynced on every
    new query.data reference regardless of content.
preserved:
- The useEffect syncing configurationValue, configurationBaseline and form.reset from query.data on every
  load and refetch — untouched, still firing post-commit exactly as before; only the setConfigurationValid
  call was removed from inside it.
- handleConfigurationChange's behavior on operator edits — unchanged, still setting configurationValue
  and configurationValid together from the edited text.
- The submit gate that returns early while the configuration is not valid, and the mutation and onSuccess
  re-baselining logic — unchanged.
- src/hooks/use-connector-configuration-detail-view.ts, which reads detail.configuration.isValid to capture
  configurationBaseline.isValid whenever isDirty is false, and restores it through onDiscard.
- src/routes/connector-configuration-detail-ready-view.tsx, which reads state.configuration.isValid to
  show the must-be-a-JSON-object warning banner.
- src/routes/connector-configuration-form-fields.tsx, which reads configuration.isValid to compute isSaveDisabled.
deferred:
- what: configurationValue itself — the loaded configuration's raw text exposed as configuration.value
    — still lags one render behind query.data on first load, because it continues to be set inside the
    pre-existing useEffect rather than at render time.
  why: No criterion of this task speaks of configuration.value, only of isValid; the task's own objective
    names validity specifically, and widening the fix to the value's own timing was not asked for.
---

## What it is
The correction that moves one computation out of an effect and into the render that produces the ready phase, so a consumer reading the connector configuration's validity never observes a default the hook has not yet corrected.
The wrong behavior was a race, observed intermittently in a captured suite run of an unrelated delivery, and it answers to no criterion any delivered task holds.

## Notes
The defect was a race and not a wrong constant, which is why it survived its own delivery's review: four of the five cases in the pre-existing it.each pass on most runs, and only the timing of one made it visible.
What is left deferred is the same shape one field over: configuration.value still lags a render behind query.data on first load, because no criterion of this task reaches it.
