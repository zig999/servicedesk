---
target: frontend
title: payload_notes as an optional attribute in the capability form schema and read type
summary: Proves capabilityFormSchema parses, omits and empty-strings payload_notes without a validation
  issue, and that the Capability read type accepts a read answer with or without payload_notes.
implementation: sha256:cd28383d5a855df5c72b8c50993abba004a9657664c66e1f3b20c0894ee4801f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-payload-notes-surface-payload-notes-declared-in-the-frontend-capability-contract-suite
tests:
- file: src/services/capability-form-schema.spec.ts
  name: capabilityFormSchema -- payload_notes as an optional free-text attribute > yields the supplied
    payload_notes string unchanged on the parsed result
  proves: capabilityFormSchema parses a form value object carrying a payload_notes string and yields that
    same string on the parsed result.
  fails_when: capabilityFormSchema stops declaring payload_notes as a plain pass-through string (e.g.
    it is dropped from the schema, renamed, or transformed), so the parsed result no longer carries the
    exact string supplied.
- file: src/services/capability-form-schema.spec.ts
  name: capabilityFormSchema -- payload_notes as an optional free-text attribute > reports no validation
    issue when payload_notes is left out of the form value
  proves: capabilityFormSchema parses a form value object carrying no payload_notes and reports no validation
    issue for that field.
  fails_when: payload_notes stops being declared optional (e.g. z.string() without .optional()), so a
    form value omitting the key fails safeParse instead of succeeding with payload_notes undefined.
- file: src/services/capability-form-schema.spec.ts
  name: capabilityFormSchema -- payload_notes as an optional free-text attribute > reports no validation
    issue for a payload_notes value that is an empty string
  proves: capabilityFormSchema reports no validation issue for a payload_notes value that is an empty
    string.
  fails_when: a non-emptiness constraint (e.g. .min(1), matching name/version/connector/concept) is added
    to payload_notes, so an empty string fails safeParse instead of succeeding.
- file: src/hooks/use-capabilities.spec.ts
  name: Capability -- payload_notes as a read type attribute a read answer may carry or leave out > typechecks
    and preserves a payload_notes string carried on a read answer
  proves: The Capability read type declares payload_notes, and a read answer carrying a payload_notes
    string typechecks against it.
  fails_when: the Capability type stops declaring payload_notes, so the object literal's explicit payload_notes
    key is rejected as an excess property by the project's typecheck step, or the field is renamed so
    the value read back no longer matches what was supplied.
- file: src/hooks/use-capabilities.spec.ts
  name: Capability -- payload_notes as a read type attribute a read answer may carry or leave out > typechecks
    a read answer that carries no payload_notes
  proves: A read answer carrying no payload_notes typechecks against the Capability read type.
  fails_when: payload_notes is declared as a required field on Capability, so a read answer omitting the
    key is rejected by the project's typecheck step as missing a required property.
not_applicable:
- edge_case: A non-string value (number, boolean, object) supplied for payload_notes to capabilityFormSchema.
  why: No criterion states how a non-string payload_notes is treated. z.string().optional() rejects a
    non-string the same way it already does for every other z.string() field in this schema; asserting
    that here would test generic Zod behavior this task did not introduce, not a fact of payload_notes's
    own declaration.
- edge_case: A read answer carrying payload_notes explicitly set to null rather than omitting the key.
  why: The criteria state only "carrying a payload_notes string" and "carrying no payload_notes"; null
    is neither case, and no criterion or node's fact says what a null payload_notes should typecheck against.
- edge_case: An unusually long or whitespace-only payload_notes string.
  why: The schema applies no length constraint to payload_notes (criterion 3), so string content beyond
    present/absent/empty is a dimension that does not change what the obligation requires and does not
    multiply the set of cases.
- edge_case: A slow or failing dependency, or concurrent access to payload_notes.
  why: Both touched files are pure declarations -- a Zod schema and a TypeScript type -- with no I/O,
    network call, or shared mutable state; this class of edge case has no boundary here to test.
untested:
- 'domain/integration/capability declares nine attributes, each with its own required flag. This task''s
  criteria and encoded_at files (capability-form-schema.ts, use-capabilities.ts) address only the payload_notes
  attribute''s required: false declaration -- the implementation record''s own `how` for this node scopes
  its claim to payload_notes alone. No test here decides the node''s full nine-attribute fact whole; the
  other eight attributes'' declarations predate this task''s files, and re-asserting them here would claim
  ground this task''s own encoded_at list does not establish.'
- rules/integration/a-capability-declares-its-contract's clauses on required-attribute declaration, the
  timeout default/positive-integer bound, and the HTTP 422 IncompleteCapabilityContractError refusal are
  marked REMAINDER by both the task's and the implementation's own Notes, reaching no criterion of this
  task. No fact of this node falls within this task's scope, so no test is written against it.
---
## What it is

Two new spec files (capability-form-schema.spec.ts, use-capabilities.spec.ts) prove the five criteria of this task: the form schema parses, omits and empty-strings payload_notes without a validation issue, and the read type accepts a read answer with or without payload_notes.

## Notes

None.
