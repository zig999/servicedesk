---
title: The error-code mapping keys CaseVersionNotValidError to the case-not-valid state — proof
summary: Tests over error-ui-state.ts, use-case-current-version-validity.ts and case-detail-screen.tsx
  establish that a CaseVersionNotValidError refusal resolves to the case-not-valid state and its own distinct
  statement, that an unmapped code discloses no code, message, carried value or attribute of the case
  or its version including one left over from an earlier cached read, and that the three case-facing statements
  stay mutually exclusive.
implementation: sha256:353aee5aa059f12c806069e597e674aa1875f2fa91dc48a86293ddb921daacc7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-not-valid-error-code-error-code-mapping-keys-on-the-current-name-suite-3
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseVersionNotValidError, the name the backend's refusal actually carries, to its own
    distinct case-not-valid state, not the shared generic-error fallback
  proves: criterion 1 — an API error whose code is CaseVersionNotValidError resolves through the frontend's
    error-code mapping to the case-not-valid user-facing state, and not to the state the surface shows
    for a read that did not complete.
  fails_when: uiStateForApiError no longer maps CaseVersionNotValidError to kind case-not-valid, whether
    by removing the mapping entry or by keying it under a different string than the wire code the backend
    actually sends.
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseNotValidError, the retired name the mapping no longer keys on, to the shared generic-error
    state rather than case-not-valid
  proves: the implementation record's inference that the wire code the mapping keys on is exactly CaseVersionNotValidError,
    with no dual mapping kept for the retired CaseNotValidError name.
  fails_when: the mapping table still carries an entry keyed CaseNotValidError, or resolves it to case-not-valid
    by any other means, reviving the retired name instead of leaving it to fall through to the generic
    state.
- file: src/services/error-ui-state.spec.ts
  name: resolves a code the table does not name to the generic-error state rather than throwing
  proves: criterion 2's mapping-level half — an unrecognized code resolves to the generic, read-did-not-complete
    state rather than crashing the mapping.
  fails_when: uiStateForApiError throws, returns undefined, or resolves an unrecognized code to anything
    other than the generic-error kind.
- file: src/services/error-ui-state.spec.ts
  name: resolves a code the table does not name to a fallback state carrying only the kind, not the refusal's
    own message
  proves: criterion 2 — the mapping's fallback state discloses no wording of the refusal, closing the
    coverage gap that the prior proof's only carries-no-wording test was written over a mapped code and
    never over the unmapped fallback.
  fails_when: the fallback GENERIC_ERROR_STATE gains a field beyond kind, for instance the refusal's own
    message or code attached for an unmapped error, which this test surfaces as an extra key on the returned
    state.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: resolves to phase "not-valid", carrying the failing version's own number, when reading it as a
    case is refused
  proves: criterion 1 — a CaseVersionNotValidError refusal for the case's version resolves to the not-valid
    phase, distinct from read-failed, carrying the version's own number.
  fails_when: the hook resolves a CaseVersionNotValidError refusal to any phase other than not-valid,
    or drops the version number from that outcome.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: reads the case's highest-numbered version, never the lower-numbered draft, to decide the outcome
  proves: the hook answers criteria 1, 3, 5 and 6 over the case's current version, established here as
    the highest-numbered one, rather than any other version on file.
  fails_when: the hook resolves its outcome, and the version number it carries, from a version other than
    the highest-numbered one on file.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: resolves to phase "read-failed", distinct from "not-valid", when the current version's own read
    fails for any other reason
  proves: criterion 2's phase-level half — a code the mapping holds no presentation of its own for resolves
    to read-failed, not not-valid.
  fails_when: an error whose code is not CaseVersionNotValidError resolves to phase not-valid instead
    of read-failed, or to any phase that does not distinguish it from the not-valid case.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: resolves to phase "valid" once the highest-numbered version reads back as a case
  proves: criterion 6 — a current version that reads back cleanly resolves to a phase distinct from not-valid.
  fails_when: a successful version read resolves to phase not-valid, read-failed, or any phase other than
    valid.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: resolves to phase "no-version" when the version list comes back empty
  proves: an edge case criterion 4's mutual-exclusivity test depends on — a case holding no version resolves
    to its own phase, distinct from not-valid and read-failed.
  fails_when: an empty version list resolves to any phase other than no-version, including one that collides
    with not-valid or read-failed.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: reports phase "pending" while the version list is still in flight
  proves: an edge case, a dependency not yet answered — the hook reports pending rather than a premature
    not-valid or read-failed outcome before the version list itself resolves.
  fails_when: the hook resolves to any phase other than pending before the version list query has data.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: reports phase "checking", carrying the version number, once the version list has resolved but
    its own read has not
  proves: an edge case, a dependency answering slowly — the hook reports checking, not a premature not-valid
    or read-failed outcome, while the version detail read is still in flight.
  fails_when: the hook resolves to not-valid, read-failed or any phase other than checking while the version
    detail read has not yet settled.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the current-version statement when reading the case's only version as a case fails validation
  proves: criterion 3 — a case-keyed surface meeting a CaseVersionNotValidError refusal for the case's
    current version states that the current version does not read back as a case — and criterion 4's first
    mutual-exclusivity direction.
  fails_when: the screen fails to render the not-valid statement for this refusal, or renders the read-failed
    or no-version statement alongside it.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the current-version statement for the case's highest-numbered version, never for a lower-numbered
    draft also on file
  proves: the screen surfaces the hook's highest-numbered-version answer for criterion 3 even when a lower-numbered
    draft is also on file, and still renders the full version list alongside it.
  fails_when: the statement is missing, or the version table stops listing every version once the statement
    renders.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the version-list table's rows unchanged alongside the current-version statement, never
    instead of it
  proves: criterion 3's statement is additive to the existing version list, never a replacement for it
    — the row for the failing version still shows its own version number and state.
  fails_when: the not-valid statement's presence removes or alters the version-list table's own rows.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the read-did-not-complete statement, not the current-version statement, when the current
    version's own read fails for any other reason
  proves: criterion 2's screen-level phase half, and criterion 4's second mutual-exclusivity direction.
  fails_when: an unmapped-code refusal renders the not-valid or no-version statement, or fails to render
    the read-failed statement, or renders more than one of the three at once.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders neither statement once the case's highest-numbered version reads back as a case
  proves: criterion 6 — a current version that reads back with every validator rule holding is presented
    with none of the not-valid statement, and none of the read-failed statement either.
  fails_when: a clean read of the current version still renders the not-valid or the read-failed statement.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the no-version statement, neither the current-version statement nor the read-did-not-complete
    statement
  proves: criterion 4's third mutual-exclusivity direction — the no-version statement is distinct from,
    and never accompanied by, the not-valid or read-failed statement.
  fails_when: a case holding no version renders the not-valid or read-failed statement instead of, or
    alongside, the no-version statement.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders neither statement while the current version's own read has not yet completed, showing
    only the version list
  proves: an edge case, a dependency answering slowly — no case-facing statement is shown prematurely
    while the version detail read is still in flight.
  fails_when: the not-valid or the read-failed statement renders before the version detail read has settled.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the fixed statement, never an attribute of the non-validating version smuggled in
    the refusal's own error details
  proves: criterion 5 — under a CaseVersionNotValidError refusal, none of title, when_to_use, subject,
    fallback, consolidation_register, state or manifest carried in the refusal's own details reaches the
    page, closing the coverage gap that only three of the seven named attributes were exercised here.
  fails_when: any of the seven named attributes, carried in the CaseVersionNotValidError refusal's own
    details, is rendered anywhere on the page.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the fixed did-not-complete statement, never the refusal's own error code, its own
    message, or an attribute of the case or its version, when the current version's own read fails with
    a code the mapping does not recognize
  proves: criterion 2 in full — for a code the mapping holds no presentation of its own for, the surface
    discloses neither that error code, nor the refusal's own message, now given a message distinct from
    the code and closing the gap that the two were previously the same string and neither was queried,
    nor any value the refusal carries.
  fails_when: the read-failed rendering leaks the refusal's own error code or its own message, or any
    of the seven attribute values carried in its details.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the read-did-not-complete statement, never an attribute of the case's current version
    carried over from an earlier successful read still sitting in cache
  proves: the UNDERDETERMINED note's admitted implementation — a mapping that resolves an unrecognized
    code to the did-not-complete state, discloses none of the refusal's own code, message or carried values,
    but still renders the case's title, when_to_use or other attributes from an earlier or cached read
    alongside that statement — is excluded, even though neither criterion 2 nor criterion 5 as literally
    bounded would catch it on its own.
  fails_when: an implementation renders any attribute of the case's current version, here title or when_to_use,
    left in the query cache by an earlier successful read, alongside the read-did-not-complete statement
    for a later failed read of that same version.
not_applicable:
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion of this task claims uniqueness over any collection; the mapping is a pure function
    from one error code to one state, and the version list's own row identity is a different task's concern.
- edge_case: An operation against state that forbids it
  why: This task adds no write path — it is a corrective change to a read-side presentation mapping, and
    none of its six criteria describe an operation a state can forbid.
- edge_case: Two operations against one subject at once
  why: The behavior under test is a synchronous mapping from an already-received API error to a user-facing
    state, and a read of a case's current version; nothing in these criteria describes two concurrent
    operations against the same case or version.
- edge_case: A boundary at each end of a stated numeric range
  why: No criterion states a numeric range — the mapping keys on an exact string match of an error code,
    and highest-numbered version is an existing, unmodified behavior these criteria depend on rather than
    restate.
untested:
- 'Criterion 4''s requirement that no two of the three statements are presented alike is tested here only
  at the level of their text and their mutual exclusivity across every combination of phases. Nothing
  asserts a distinction of role, severity, placement or container among the three — the current markup
  renders all three as plain, unstyled paragraphs differing only in their sentence. The author read presented
  alike as bearing on what is stated, the wording a curator reads, which these tests hold apart in every
  direction, and did not write a test requiring role or container differentiation because no quoted clause
  of the criteria states that requirement. This reading is left open rather than settled: a person weighing
  the underlying specification node''s own wording could reasonably require more than text-level distinction.'
- Criterion 5's closing clause, nor anything derived from them, is untested beyond the seven named attributes
  taken literally. The current implementation renders no derived value — a count, a summary, a truncation
  — anywhere in the not-valid or read-failed branches, so there is no such value in the tree yet to exercise,
  and enumerating every hypothetical derivation a future implementation might add is unbounded. A test
  asserting the literal seven attributes' absence would not catch a future rendering of, say, a hypothesis
  count computed from the failing version's manifest.
---

## What it is
What proves the one-line correction after a review sent it back: twenty-one tests across the mapping, the hook and the screen, holding each of the task's six criteria to the wire code the backend actually sends.

## Notes
This record was rewritten whole for a re-delivery, answering three findings a review of the first proof returned.
Two were the same defect in two files: both spec helpers defaulted a CaseVersionNotValidError refusal to HTTP 422 where the governing node fixes it at 409, and both now carry the status the node states.
The third cited TST-02 over a describe block naming the function rather than the behavior it establishes, and that grouping now names the behavior.
Three coverage entries had come back partial, and two are closed here: a test now asserts the unmapped-code fallback carries only its kind and no wording of the refusal, and another gives the refusal a message distinct from its code so both can be queried absent, while a third holds the cached-attribute implementation the task's UNDERDETERMINED note admits.
Two suite runs were captured before this one and both are on disk: suite-2 failed, on a race in use-connector-configuration-detail.ts that this delivery never touched and that was corrected under its own initiative, and suite-3 is the green run this record points at.
