---
target: frontend
title: Credential placeholder readiness statement proof
summary: Proves the pure extraction service's dedup/scope/well-formedness behavior at the service
  layer, and the surface's rendering of the statement, its absence, its non-gating of Save and its
  silence over any resolution-check result, through one new pure-service spec and one new sibling
  rendered spec file.
implementation: sha256:d491f3f91af0ad15be084f4f3417980ac9d4384a9ca2ad2001127ce1f24b4621
run: run/configuration-readiness-credential-placeholder-statement-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  name: returns the one name a single credential placeholder carries
  proves: Criterion 1 -- a single ${credential:<name>} placeholder is named.
  fails_when: the returned array is not exactly ["api-key"].
- file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  name: returns both names, each once, when two distinct credential placeholders are embedded
  proves: Criterion 1, boundary -- distinct credential names are each named, none dropped or
    merged.
  fails_when: fewer than two names are returned, either expected name is missing, or a name is
    duplicated.
- file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  name: returns a repeated credential name only once despite it being embedded in more than one
    place
  proves: Criterion 1, boundary -- the same credential name appearing at more than one location
    is named once, not once per occurrence.
  fails_when: the returned array carries the name more than once, or omits it.
- file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  name: 'ignores ${requester} and ${subject:...} placeholders, returning only the ${credential:...}
    one present alongside them'
  proves: The task's own scope -- only the credential form is judged.
  fails_when: the returned array carries anything other than exactly the one credential name, or
    throws.
- file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  name: returns no names when the configuration embeds no credential placeholder at all
  proves: The objective's own "for each credential placeholder" quantifier -- zero placeholders
    means zero names.
  fails_when: a non-empty array is returned for a configuration that embeds no
    ${credential:...} placeholder.
- file: src/services/connector-configuration-credential-placeholder-statements.spec.ts
  name: returns no names, without throwing, for an empty string, invalid JSON, and a JSON array
  proves: The objective's own gating on well-formed JSON object text.
  fails_when: any of the three shapes throws, or returns a non-empty array.
- file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
  name: renders the credential statement naming the placeholder, its server-side resolution at a
    test or an observation, and that nothing on this surface checks it
  proves: Criteria 1 through 3 as rendered, decided whole.
  fails_when: the heading fails to render, the statement's own exact text fails to render for
    this placeholder, or the rendered text departs from credentialPlaceholderStatementText's own
    sentence.
  demonstrates: rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution
- file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
  name: renders no credential-placeholder heading or statement when the Configuration field
    embeds none
  proves: The objective's own zero-quantifier as rendered.
  fails_when: the heading (or any credential statement) renders for a configuration that embeds
    no credential placeholder.
- file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
  name: leaves Save enabled while the credential-placeholder statement stands
  proves: The task's own UNDERDETERMINED entry -- refutes an implementation that also withholds
    or disables Save merely because the content embeds a credential placeholder.
  fails_when: the Save button carries the disabled attribute merely because the
    credential-placeholder statement stands.
- file: src/routes/connector-configuration-form-fields-credential-placeholder-statement.spec.ts
  name: reports no resolution-check result for the credential placeholder beyond the statement's
    own text
  proves: Criterion 4 -- no statement anywhere on the surface reports a result of having checked
    whether the credential placeholder resolves.
  fails_when: a second list item appears alongside the credential statement, or the statement's
    own rendered text carries anything beyond credentialPlaceholderStatementText's exact sentence.
not_applicable:
- edge_case: Concurrent or overlapping computations.
  why: computeCredentialPlaceholderStatements is pure, synchronous and side-effect-free with no
    shared state.
- edge_case: An absent or undefined configurationText argument.
  why: computeCredentialPlaceholderStatements's own signature requires a string.
- edge_case: A slow or failing dependency.
  why: the computation touches no network, storage or clock.
- edge_case: Whitespace-only or differently formatted but equivalent JSON text.
  why: JSON.parse normalizes this before any placeholder extraction runs.
- edge_case: A duplicate key within one side's own JSON object text.
  why: JSON.parse collapses a duplicate key to its last value before the extraction logic ever
    sees the parsed object.
- edge_case: A malformed credential placeholder (e.g. an empty name, or a form missing its
    closing brace).
  why: judged by the separate placeholder-forms departure statement, a sibling task's own
    criterion; this task's criteria reach only a well-formed occurrence.
untested:
- rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  -- binds four statements at once; only this task's own slice is protected here.
- The task's own REMAINDER note -- the remaining clauses of that same shared rule bind the three
  sibling readiness statements and reach no criterion of this task.
---

## What it is
The proof of the extraction, the silence over checking, and the unconditional statement.

## Notes
Suite round 1 failed lint: testing-library/no-node-access on `.closest("ul")`/`.children` in the
criterion-4 test. Fixed by locating the specific list carrying the credential statement via
`screen.getAllByRole("list")` + `within(...).queryByText(...)` and asserting its item count via
`within(...).getAllByRole("listitem")`, matching the same recipe already used elsewhere in this
delivery. Suite round 2 green.
