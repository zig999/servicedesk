---
title: isCaseVersionState derives membership from the exported canonical CaseVersionState array
summary: The relational case store's isCaseVersionState guard now checks membership against the pre-existing
  exported CASE_VERSION_STATES canonical array from src/case/case.ts, mirroring the Set-based form isHypothesisRevisionState
  already uses, instead of a hand-written literal comparison.
task: sha256:bc161c744019a57ba6cc74cefa385a99b979e1a13450508720913bc070ce1f98
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/case-version-read-and-lifecycle-fidelity-case-version-state-from-canonical-list-build
files:
- path: src/persistence/relational-case-store.repository.ts
  effect: isCaseVersionState now returns CASE_VERSION_STATE_VALUES.has(value) -- a ReadonlySet built from
    the imported CASE_VERSION_STATES array (src/case/case.ts) -- instead of comparing value against the
    literal strings 'draft' and 'released'. The import of Resolution from '../case/case.js' now also brings
    in the value CASE_VERSION_STATES alongside it. No other function in the file changed; DRAFT_STATE,
    RELEASED_STATE, refuseUnlessDraft, refuseUnlessDraftAtRelease, caseVersionStateOf and every read/write
    path that calls them are untouched.
criteria:
- criterion: isCaseVersionState decides membership against an exported canonical array of the case-version-state
    values, in the same form isHypothesisRevisionState already uses.
  met: true
  how: isCaseVersionState (src/persistence/relational-case-store.repository.ts) now reads CASE_VERSION_STATE_VALUES.has(value),
    where CASE_VERSION_STATE_VALUES is `new Set<string>(CASE_VERSION_STATES)` declared beside HYPOTHESIS_REVISION_STATE_VALUES
    -- the exact same declaration-and-check shape isHypothesisRevisionState already uses with HYPOTHESIS_REVISION_STATE_VALUES/HYPOTHESIS_REVISION_STATES.
- criterion: The values the guard accepts are exactly draft and released, spelled as domain/knowledge/case-version-state
    spells them.
  met: true
  how: CASE_VERSION_STATES (src/case/case.ts, line 35) is `['draft', 'released'] as const` -- the same
    two literals, same spelling and same order the domain node's `values` list states.
- criterion: No literal draft or released string remains in isCaseVersionState own condition.
  met: true
  how: The function's body is now `return CASE_VERSION_STATE_VALUES.has(value);` -- no string literal
    appears in it. DRAFT_STATE and RELEASED_STATE remain as named constants used by other functions in
    the file (query params, refusal comparisons), but isCaseVersionState's own condition names neither.
- criterion: A stored state value the enumeration does not hold is still rejected by the guard.
  met: true
  how: Set.has(value) returns false for any value outside {'draft','released'}, exactly as the prior `value
    === DRAFT_STATE || value === RELEASED_STATE` did; caseVersionStateOf still throws through raiseReadFailure
    when isCaseVersionState returns false, unchanged.
- criterion: Every path resolving a case version state through the guard -- assembleVersion, listCases,
    createDraftVersion, releaseVersion, discardDraft and updateDraftVersion -- resolves the same state
    it resolved before.
  met: true
  how: None of the six paths' own logic changed. assembleVersion and listCases still call caseVersionStateOf
    via assembledCaseVersionOf/caseCatalogEntryOf/listCaseVersionsPage; createDraftVersion, releaseVersion,
    discardDraft and updateDraftVersion still resolve state through requireVersionState -> caseVersionStateOf
    -> isCaseVersionState. Only the guard's internal membership check was rewritten, and it accepts the
    identical two values.
- criterion: The canonical array is declared in one place, with no second list of the same values introduced.
  met: true
  how: A new CASE_VERSION_STATES export was first considered for src/case/case-store.port.ts (mirroring
    HYPOTHESIS_REVISION_STATES there), then src/case/case.ts was found to already export an identically
    named and identically valued CASE_VERSION_STATES (its own domain Case type's state field). case-store.port.ts
    was left untouched (still its original literal-union declaration, no diff against the tree), and the
    repository imports the existing CASE_VERSION_STATES from case.js instead, alongside the Resolution
    import already drawn from that file. Exactly one canonical array of these values exists after this
    delivery.
- criterion: The refusals rules/knowledge/a-case-version-moves-through-its-declared-lifecycle states,
    CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError, keep their stated status and name.
  met: true
  how: refuseUnlessDraft and refuseUnlessDraftAtRelease, and the CaseVersionNotDraftError / CaseVersionNotDraftAtReleaseError
    constructors and their call sites, are byte-for-byte unchanged; this task's edit sits entirely inside
    isCaseVersionState and the import list.
nodes:
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: isCaseVersionState's accepted set is now sourced from CASE_VERSION_STATES ['draft', 'released']
    (src/case/case.ts), the same two values and spelling this node declares, rather than a hand-written
    literal comparison inside the guard.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  how: The rule's transition and refusal machinery (refuseUnlessDraft, refuseUnlessDraftAtRelease, CaseVersionNotDraftError,
    CaseVersionNotDraftAtReleaseError, and the HTTP 409 mapping they feed) is not touched by this delivery
    -- only the internal membership test that decides whether a stored value counts as a recognized state
    changed, and it still resolves draft/released exactly as before. The task's own Notes record that
    the refusal payload's final clause (that the refusal carries the state the version stood in, spelled
    per the enumeration) is not reached by any criterion of this task; this delivery leaves that payload
    exactly as it stood, neither confirming nor correcting it.
- node: rules/knowledge/validation-runs-at-every-read
  how: 'This task reaches only the slice this rule states about stored content the declared model does
    not admit failing as a structural rule rather than a condition of its own: criterion 4 keeps the guard
    rejecting any stored value outside the enumeration. The coherence family, the prohibition on treating
    a structural failure as its own condition, and the replay exception are not reached by this task --
    they belong to the sibling tasks in this epic that implement read-time validation and the replay exception,
    as this task''s Notes already state.'
inferences:
- inferred: The canonical array isCaseVersionState now checks against is imported from src/case/case.ts
    rather than declared fresh in src/case/case-store.port.ts, and case-store.port.ts is left untouched.
  from: Criterion 6 ("no second list of the same values introduced") read against what the tree actually
    holds -- case.ts (outside the batch inventory's surveyed area) already exports an exported-const canonical
    array named CASE_VERSION_STATES with the identical two values. The inventory's own convention note
    ("case-store.port.ts ... e o arquivo a conferir primeiro antes de criar uma nova lista") anticipated
    checking the port file first before creating one; having found a canonical array already reachable
    from the repository's existing import of case.js, reusing it rather than adding a second one is what
    the criterion requires once that array is known to exist.
divergences:
- departure: Declined to add a new CASE_VERSION_STATES export to case-store.port.ts, which the inventory's
    convention note suggested checking first before creating a new list -- implying a new one belonged
    there if none existed.
  why: A canonical array of the identical two values already exists and is exported from src/case/case.ts,
    a file the inventory's survey did not cover (it is not in this task's or the batch's listed area).
    Adding a second one in case-store.port.ts, even mirroring the sibling's file-local convention, would
    have produced exactly the second list criterion 6 forbids. Importing the existing one and leaving
    case-store.port.ts untouched satisfies the criterion as stated over following the inventory's suggested
    location.
  from: work/backend-code-drift-batch-corrections/inventory/backend-code-drift-batch-corrections.md convention
    note on CaseVersionState / case-store.port.ts
preserved:
- The two accepted CaseVersionState values (draft, released) and their exact spelling, wherever isCaseVersionState
  is consulted.
- The six paths' resolved state for a given stored row -- assembleVersion, listCases, createDraftVersion,
  releaseVersion, discardDraft, updateDraftVersion.
- CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError, their names, their HTTP 409 mapping
  and the arguments (slug, version, state) each carries.
- DRAFT_STATE and RELEASED_STATE as the constants every SQL statement and refusal comparison in this file
  still uses outside isCaseVersionState's own condition.
deferred:
- what: src/case/case.ts and src/case/case-store.port.ts each independently declare their own CaseVersionState
    type (structurally identical -- both 'draft' | 'released' -- but two separate declarations, one now
    array-derived via the reused CASE_VERSION_STATES, the other still a hand-written literal union in
    case-store.port.ts).
  why: This predates this task, sits in files outside its scope (case.ts and case-store.port.ts are not
    among the batch's touched files for this finding -- only relational-case-store.repository.ts is),
    and is a type-declaration duplication rather than the canonical-array-for-a-guard duplication this
    task's criteria name. Widening this task to unify the two type declarations was not this task's to
    do.
---
## What it is
isCaseVersionState in src/persistence/relational-case-store.repository.ts now decides membership
against CASE_VERSION_STATE_VALUES, a ReadonlySet built from the CASE_VERSION_STATES canonical
array already exported by src/case/case.ts, in the same declaration-and-check shape
isHypothesisRevisionState already uses for HYPOTHESIS_REVISION_STATE_VALUES /
HYPOTHESIS_REVISION_STATES. The prior hand-written comparison against the literal strings 'draft'
and 'released' is gone from the guard's own condition; DRAFT_STATE and RELEASED_STATE remain as
named constants used elsewhere in the file, and every path resolving a case version state through
the guard is unchanged.

## Notes
None.
