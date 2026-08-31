---
title: Proof for deriving the Subject region's fields from case-input-requirements
summary: deriveSubjectFields and useSimulationSubject are proved directly against the pure derivation,
  the pinned slug/version threading, and the two composed registry reads, with subjectPlaceholderNamesInConfiguration's
  own pre-existing tests confirmed unchanged.
implementation: sha256:98cf2423ce4d233b012f2ace1abdce931942ee228811bd40d0867fb43b46009a
run: run/subject-input-requirements-derive-and-present-suite-2
tests:
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'simulation-subject-derivation.ts -- criterion 11: deriveRequiredFields and collectionPlanFromManifest
    are gone from the tree > no longer exports deriveRequiredFields or collectionPlanFromManifest'
  proves: criterion 11 -- deriveRequiredFields and collectionPlanFromManifest are gone from the tree rather
    than left as exports with no caller.
  fails_when: either name reappears among the module's own exports.
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'deriveSubjectFields -- criterion 1: one field per requirement, required and optional alike >
    returns exactly one field per requirement, in the read''s own order / returns an empty field list
    for an empty requirements read'
  proves: criterion 1 -- one editable field is exposed per requirement the read names, required and optional
    alike.
  fails_when: the walk filters out an optional requirement, or returns a field count other than the requirements
    array's own length.
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'deriveSubjectFields -- criterion 2: each field''s required flag carried through unchanged > sets
    a field''s own required flag to exactly its source requirement''s required value'
  proves: criterion 2 -- each exposed field carries its own requirement's required flag through unchanged.
  fails_when: 'a required requirement produces required: false or vice versa.'
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'deriveSubjectFields -- criterion 3: naming a resolved capability''s connector, matched by its
    own name-and-version identity > names the connector of the currently-registered capability sharing
    the reference''s exact name and version / does not resolve a capability sharing the reference''s own
    name but not its version'
  proves: criterion 3 -- an exposed field whose requirement names a capability present among those useCapabilities()
    has composed, matched by name-and-version identity, names that capability's connector.
  fails_when: a capability sharing only the name (not the version) resolves, or the resolved entry's connector
    is not the matched capability's own.
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'deriveSubjectFields -- criterion 4: input_schema carried through as a free-text hint > passes
    the resolved capability''s own input_schema through untouched, even where it is not itself valid JSON'
  proves: criterion 4 -- a resolved capability's input_schema is carried through as free text, never parsed
    or validated as structured data.
  fails_when: the derivation throws, drops, or reformats an input_schema string that does not parse as
    JSON.
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'deriveSubjectFields -- criteria 5-6: a requirement naming a capability not currently held > still
    exposes the field, with an empty capabilities list rather than an invented entry / resolves only the
    reference that currently matches and invents no entry for the sibling reference that does not'
  proves: criteria 5 and 6 -- a requirement naming a capability not currently held is exposed as a field
    all the same, with no connector or input-schema hint invented for the unresolved reference.
  fails_when: the field disappears entirely for an unresolved reference, or a partial entry with an invented
    connector appears in its place.
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'deriveSubjectFields -- UNDERDETERMINED notes: every currently-registered asking capability is
    named, each paired with its own identity, never only the first match and never a bare connector >
    names both currently-registered capabilities asking for the same attribute, each carrying its own
    name, version and connector together'
  proves: the task's own UNDERDETERMINED notes -- every currently-registered asking capability is named
    for a multiply-asked attribute, each paired with its own name, version and connector together, never
    a bare connector.
  fails_when: only the first matching capability appears, or an entry carries a connector with no accompanying
    name/version.
- file: src/services/simulation-subject-derivation.spec.ts
  name: 'subjectPlaceholderNamesInConfiguration -- criterion 12: every ''${subject:<attribute>}'' placeholder,
    wherever it sits > the eight pre-existing placeholder-scan cases (address, query, headers, nested
    body, requester/credential exclusion, malformed token, non-JSON text)'
  proves: the placeholder-scan function is kept byte-for-byte in behavior for its one remaining caller,
    use-test-connector-panel.ts -- unmodified by this task's rewrite of the same file.
  fails_when: any of these pre-existing assertions stops holding, meaning the rewrite altered behavior
    this task's own delivery record claims is untouched.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criterion 4: curator-added attributes alongside derived ones > includes
    a curator-added attribute in the assembled subject / lets a curator-added row override a same-named
    derived field / adds no entry for an empty attribute name or value'
  proves: the pre-existing curator-added-attribute merge behavior this task's delivery record states is
    preserved unchanged, now composed over the new field shape.
  fails_when: a curator-added row fails to appear beside a derived field's value, or fails to override
    a same-named derived field.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criteria 5-6: readiness > stays not-ready while the requester or a derived
    required field is empty / turns ready once every derived required field and the requester hold a value
    / never turns ready for a subject holding zero attribute-values'
  proves: isReady's own formula is preserved exactly as this task's delivery record states -- untouched
    by the field-shape change.
  fails_when: isReady turns true while a required field or the requester is still empty, or with the subject
    holding no attributes at all.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criterion 7: one subject and readiness, shared identically between a
    full-case and a single-hypothesis run (D7) > computes the same subject and the same readiness from
    two independently mounted instances'
  proves: the one-shared-subject/readiness guarantee is preserved -- useSimulationSubject is still called
    exactly once per screen and produces no divergence between the case-run and hypothesis-run consumers.
  fails_when: the two instances disagree on subject or readiness given identical inputs.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criterion 9: the field set is derived for the pinned case slug and version
    > derives a different field set once the pinned version changes, same source and registries'
  proves: criterion 9 -- the field set is derived for the case slug and version the cockpit pins, and
    a change to that pinned identity changes the set derived.
  fails_when: the field set stays the same across a version change, meaning the hook read a stale or unpinned
    query key.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criterion 7: an attribute the read names required is exposed even though
    no currently-registered capability''s connector could ever have embedded it as a placeholder > exposes
    a required field for an attribute the read names, with no capability resolving for it at all'
  proves: criterion 7 and scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
    -- an attribute the read names required that no connector configuration's own call ever embedded as
    a placeholder is exposed as a field all the same.
  fails_when: no field is exposed for such an attribute, meaning the field set is still gated by a connector-placeholder
    scan somewhere.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- criteria 8 and 10: the composed reads are exactly case-input-requirements
    and capabilities, never a connector-configuration read > resolves cleanly with its derived field intact
    absent any /v1/connectors handler / isLoadingRegistries stays true until both composed reads settle
    / isRegistriesError turns true if either composed read fails'
  proves: criterion 8 (no field is derived from a connector-configuration read) and criterion 10 (the
    hook's own loading/error state reports exactly the two reads it now composes) together.
  fails_when: the hook throws or hangs absent a connector-configuration stub, or isLoadingRegistries/isRegistriesError
    fails to reflect either composed read's own pending or failed state.
- file: src/hooks/use-simulation-subject.spec.ts
  name: 'useSimulationSubject -- MNT-04: a curator-added row is keyed by a stable id, not by its position
    > keeps a remaining row''s own id and typed values unchanged after an earlier row is removed'
  proves: the pre-existing stable-id keying for curator-added rows is preserved unchanged.
  fails_when: removing one row shifts another row's id or its typed values.
not_applicable:
- edge_case: a requirement whose own capabilities array is itself empty (no capability was ever asked)
  why: already covered by criterion 1's own empty-requirements and populated-requirements cases; an empty
    per-requirement capabilities array is the same code path as an unresolved reference, proved by criteria
    5-6, and does not raise a distinct behavior.
- edge_case: a malformed capability (one whose own input_schema is itself unreadable at the registry level,
    as opposed to a mismatched identity)
  why: belongs to the sibling task disclosing malformed capabilities (expose-malformed-capability-identities
    / disclose-malformed-capabilities-to-the-curator); this derivation only ever reads a resolved capability's
    input_schema as free text and does not classify it.
untested:
- the dispatch-gating effect of a field's own required flag (whether an empty required field blocks simulate-case/simulate-hypothesis)
  -- this task's own Notes assign that clause to the sibling gating task, and no test here exercises dispatch
  at all.
---

## What it is
Proof that the Subject region's field set is now derived from the case version's own case-input-requirements read, one field per requirement with its required flag and every resolvable asking capability's identity, rather than from a connector-configuration placeholder scan.

## Notes
None.
