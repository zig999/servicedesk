---
title: Proof for exposing malformed-capability-identities on the simulation subject state
summary: Renders useSimulationSubject directly through renderHook against a stubbed global fetch, proving
  all three criteria and the UNDERDETERMINED note over deriving the list from the read alone, split into
  a sibling .spec.ts file to stay under this project's own max-lines rule.
implementation: sha256:3bb8571d33db080b3018cb60a90aa1ce444666a767fb529613e7f7ab5d8c87f7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-expose-malformed-suite-2
tests:
- file: src/hooks/use-simulation-subject-malformed-capabilities.spec.ts
  name: 'useSimulationSubject -- expose-malformed-capability-identities, criterion 1: every capability
    the read names apart from its requirements is carried on the subject state by its own name and version
    > carries the read''s own capabilities_with_malformed_input_schema entry through to capabilitiesWithMalformedInputSchema,
    unchanged'
  proves: Every capability the read names apart from its requirements is carried on the subject state
    by its own name and version.
  fails_when: capabilitiesWithMalformedInputSchema does not carry the exact {name, version} identity the
    read's own capabilities_with_malformed_input_schema field named, or carries it transformed.
- file: src/hooks/use-simulation-subject-malformed-capabilities.spec.ts
  name: 'useSimulationSubject -- expose-malformed-capability-identities, criterion 2: no such capability
    appears among the state''s exposed fields > adds no field of its own for a malformed capability --
    requiredFields stays exactly one entry, the one requirement the read names, whether or not any capability
    is reported malformed'
  proves: No such capability appears among the state's exposed fields (the requiredFields half of criterion
    2).
  fails_when: requiredFields grows past the one entry the read's own requirements name, or that entry's
    own attribute stops being account-id -- e.g. an implementation that turned a malformed capability
    into an extra pseudo-field of its own.
- file: src/hooks/use-simulation-subject-malformed-capabilities.spec.ts
  name: 'useSimulationSubject -- expose-malformed-capability-identities, criterion 2: no such capability
    appears in any field''s own capability annotation > keeps the malformed capability''s identity out
    of every requiredField''s own resolved capabilities array'
  proves: No such capability appears in any field's own capability annotation (the capability-annotation
    half of criterion 2).
  fails_when: any requiredField's own capabilities array comes to include an entry whose name and version
    match the malformed capability's identity.
- file: src/hooks/use-simulation-subject-malformed-capabilities.spec.ts
  name: 'useSimulationSubject -- expose-malformed-capability-identities, criterion 3: a read naming no
    such capability leaves that list empty rather than absent > resolves capabilitiesWithMalformedInputSchema
    to an empty array, never undefined, when the read names none'
  proves: A read naming no such capability leaves that list empty rather than absent.
  fails_when: capabilitiesWithMalformedInputSchema is undefined, or anything other than an empty array,
    once the read's own capabilities_with_malformed_input_schema is empty (NO_REQUIRED_FIELDS_RESPONSE's
    own case).
- file: src/hooks/use-simulation-subject-malformed-capabilities.spec.ts
  name: 'useSimulationSubject -- expose-malformed-capability-identities, UNDERDETERMINED note: the list
    is derived from the read''s own capabilities_with_malformed_input_schema alone, never re-derived by
    inspecting each resolved capability''s own stored input_schema client-side > still names a capability
    the read itself flags as malformed even though that exact capability''s own currently-registered input_schema
    parses as well-formed JSON'
  proves: the task's own UNDERDETERMINED note -- a passing implementation must derive capabilitiesWithMalformedInputSchema
    from the case-input-requirements read alone, never from a second, client-side inspection of each resolved
    capability's own stored input schema, even where the two would usually agree.
  fails_when: an implementation instead derives capabilitiesWithMalformedInputSchema by inspecting each
    resolved capability's own stored input_schema (rather than passing the read's own field straight through);
    since CAPABILITY's registered input_schema ('{"type":"object"}') parses as well-formed JSON, such
    an implementation would answer an empty list here instead of the one entry the read itself names.
not_applicable:
- edge_case: the case-input-requirements read failing outright (network error, non-2xx) while capabilitiesWithMalformedInputSchema
    would otherwise be non-empty
  why: this task's criteria say nothing about loading/error behavior specific to this field, and useCaseInputRequirements's
    own upstream fallback already yields the same empty-list answer on a failed read as on a successful-but-empty
    one, proven for that hook directly in use-case-input-requirements.spec.ts and, at this hook's own
    level, by the pre-existing isRegistriesError tests this task's implementation record states are preserved
    unchanged.
- edge_case: two independently mounted useSimulationSubject instances (D7's shared-subject scenario) over
    a read naming a malformed capability
  why: capabilitiesWithMalformedInputSchema is a pure pass-through of one query's own resolved data, carrying
    no per-instance state of its own; D7's own shared-instance guarantee is already exercised for the
    derived subject and readiness as a whole by the pre-existing criterion-7 test, and no criterion of
    this task states a distinct multi-instance guarantee over this one field.
untested:
- more than one capability named in a single read's capabilities_with_malformed_input_schema -- every
  test here uses a single-entry array, so an implementation that silently dropped all but the first entry,
  or deduplicated by some other key, would not be caught by any test in this file.
divergences:
- cites: TST-04
  file: src/hooks/use-simulation-subject-malformed-capabilities.spec.ts
  departure: the file's own name carries a -malformed-capabilities suffix beyond use-simulation-subject
    plus .spec, because this task's own three criteria and its UNDERDETERMINED note were split out of
    use-simulation-subject.spec.ts (which the sibling derive-subject-fields task's own proof already populated)
    to stay under this project's own max-lines lint rule (300), which the build step's own lint run enforced
    as a real failure before this split.
  why: the same rule and reasoning already establishes this exact pattern elsewhere in this codebase (use-capability-detail.spec.ts
    / -save.spec.ts / -load-error.spec.ts, and new-case-draft-screen.spec.ts / -save.spec.ts / -conflict.spec.ts,
    whose own header comments cite the identical rule).
---

## What it is
Proof that the case-input-requirements read's own malformed-capability identities reach the simulation subject state unchanged, and stay out of the derived field set entirely.

## Notes
None.
