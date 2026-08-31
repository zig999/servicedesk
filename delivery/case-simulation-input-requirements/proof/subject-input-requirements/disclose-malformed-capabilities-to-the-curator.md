---
title: Disclosure of a malformed capability's identity in the Subject panel
summary: New spec file proving the four criteria of disclose-malformed-capabilities-to-the-curator over
  CaseSimulationSubjectPanel's new state.capabilitiesWithMalformedInputSchema section.
implementation: sha256:3b70d540698b0861a03e63504d2659fd3cbaedc20e9305fee551bfefe4e6b968
run: run/subject-input-requirements-disclose-malformed-suite
tests:
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- a capability the state carries apart from its field set is disclosed
    by its own name and version (criterion 1) > shows a single malformed capability's own name and version
  proves: Each capability the state carries apart from its field set is disclosed by its own name and
    version where the subject is composed.
  fails_when: no text matching exactly "legacy-lookup 9.9.9" renders anywhere in the panel for a single-entry
    capabilitiesWithMalformedInputSchema array.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- a capability the state carries apart from its field set is disclosed
    by its own name and version (criterion 1) > shows every one of two malformed capabilities, each by
    its own name and version, never mixed
  proves: Each capability the state carries apart from its field set is disclosed by its own name and
    version where the subject is composed.
  fails_when: a two-entry array renders only one entry, drops one, or shows any entry's name paired with
    the other entry's version.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- the disclosed identity carries nothing beside its own name and version
    (UNDERDETERMINED) > renders the disclosed row's own full text as exactly its name and version
  proves: the task's own UNDERDETERMINED note -- domain/knowledge/case-input-requirement states identity
    alone is the whole of what reaches the person composing a subject about it, so an implementation that
    also renders that capability's connector or answered concept beside its name and version satisfies
    criterion 1 as written but is refused by the specification.
  fails_when: the disclosed row's own text includes anything besides "{name} {version}" -- a connector,
    an answered concept, a schema hint, or any other label -- since the exact-text query would then find
    nothing.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- the disclosed set is read straight from state.capabilitiesWithMalformedInputSchema,
    never re-derived from a requirement's own resolved capabilities (UNDERDETERMINED) > discloses nothing
    when capabilitiesWithMalformedInputSchema is empty, even where a requirement's own resolved capability
    carries no input-schema hint of its own
  proves: the task's own UNDERDETERMINED note -- no criterion names where the disclosed set comes from,
    so an implementation that recomputed 'malformed' from a resolved capability's own empty input-schema
    hint (rather than reading the dedicated state field) would disclose that capability even though the
    state names none.
  fails_when: the panel discloses "check-balance 1.0.0" or any "Asking for nothing at all" text despite
    capabilitiesWithMalformedInputSchema being empty, because a resolved requirement capability happened
    to carry an empty inputSchemaHint.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- the presence of a malformed capability removes no input from the
    presented requirement set (criterion 3) > still renders every requirement's own input, each with its
    own required marking held independently, alongside a non-empty malformed-capability disclosure
  proves: The presence of such a capability removes no input from the presented requirement set.
  fails_when: the required or optional requirement's own labeled input disappears, or either one's required
    marking changes, once capabilitiesWithMalformedInputSchema is non-empty.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- a read naming no such capability discloses nothing in its place
    (criterion 4) > renders no disclosure text at all when capabilitiesWithMalformedInputSchema is empty
  proves: A read naming no such capability discloses nothing in its place.
  fails_when: any "Asking for nothing at all" text (or an empty-state message for this section) renders
    while the array is empty.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- the disclosure is gated on the same registry-loading/error flags
    the requirement list above already reads (disclosed inference) > discloses nothing while state.isLoadingRegistries
    is true, even though the array is non-empty
  proves: the implementation's own disclosed inference that the section is gated on the same isLoadingRegistries/isRegistriesError
    flags the requirement list reads, rather than rendered unconditionally on a non-empty array.
  fails_when: the malformed capability's own text renders while state.isLoadingRegistries is true.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- the disclosure is gated on the same registry-loading/error flags
    the requirement list above already reads (disclosed inference) > discloses nothing while state.isRegistriesError
    is true, even though the array is non-empty
  proves: the same disclosed inference, over the error flag.
  fails_when: the malformed capability's own text renders while state.isRegistriesError is true.
- file: src/routes/case-simulation-subject-panel-malformed-capabilities.spec.ts
  name: CaseSimulationSubjectPanel -- two malformed capabilities sharing the same name and version are
    both disclosed, neither dropped as a duplicate (edge case) > renders two separate entries for two
    identical identities
  proves: the disclosure is a straight pass-through render of the array the state carries, never deduplicated
    by identity.
  fails_when: only one entry renders where the array carries two identical {name, version} entries.
not_applicable:
- edge_case: criterion 2 -- the presence of a malformed capability does not refuse the simulate-case or
    simulate-hypothesis dispatch
  why: CaseSimulationSubjectPanel renders no dispatch button of any kind and never reads state.isReady
    anywhere in its own source -- the dispatch-adjacent surface this criterion is about lives in a different
    component. Nothing in this file's own render output could ever fail this criterion, so an assertion
    written here would either be vacuous or bind a component this task did not change. The criterion is
    a real non-regression claim, but its proof site is whichever component actually renders the two dispatches,
    not this one.
- edge_case: two operations against the disclosed set at once
  why: this section is a pure, read-only pass-through render with no handler, no mutation and no user-triggered
    operation of its own -- there is nothing here that could race against a second concurrent operation.
- edge_case: a boundary at each end of a numeric range
  why: nothing in this feature is bounded by a range -- the disclosed set is a list rendered in full regardless
    of its length, with no pagination, truncation or numeric threshold.
- edge_case: absent (undefined) capabilitiesWithMalformedInputSchema
  why: SimulationSubjectState types this field as a non-optional readonly CapabilityReference[]; a conforming
    caller cannot pass undefined, and the type system already refuses that construction at compile time
    rather than leaving it as a runtime case to test.
untested:
- the exact DOM placement of this disclosure section relative to the requirement list above it and the
  '+ attribute' rows below it (an inference the implementation record discloses). No criterion or specification
  node governs the exact position -- only that the disclosure exists and that it removes nothing from
  the requirement set (criterion 3, tested above) -- so a test pinning that exact order would bind an
  arrangement nobody specified rather than prove a stated behavior, and would break on a legitimate future
  reordering that changes nothing a curator is told. Left unproven deliberately rather than guessed at.
---

## What it is
Proof that the malformed-capability identities carried on the subject state reach the curator, by identity alone, without disturbing anything else the panel already shows.

## Notes
None.
