---
target: frontend
title: Current-pin read no longer folds a case-not-valid refusal into a load failure
summary: use-case-hypothesis-current-pin.ts distinguishes a CaseVersionNotValidError refusal of the case's
  current version from a generic load failure, and hypothesis-revision-history.tsx presents the hypothesis's
  own successfully-read revisions on that reading, stating no fact derived from the refused version's
  manifest and rendering no status cell for it.
task: sha256:f5d611a77fad748b03907fe87c8eeb63c70ed921fe954038c1e484b6ef8381bb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-current-pin-build
files:
- path: src/hooks/use-case-hypothesis-current-pin.ts
  effect: 'Imports errorStateKind from use-edit-draft-version-form.ts; adds a "not-valid" phase (no payload)
    to CaseHypothesisCurrentPin; the manifestQuery.isError branch now checks errorStateKind(manifestQuery.error)
    and returns { phase: "not-valid" } for a "case-not-valid" kind (a CaseVersionNotValidError refusal,
    whichever validator rule triggered it, since the wire mapping in error-ui-state.ts maps every such
    refusal to that one code), falling back to the existing { phase: "load-error", retryLoad } for every
    other error.'
- path: src/routes/hypothesis-revision-history.tsx
  effect: 'toHistoryRow now takes the full CaseHypothesisCurrentPin union instead of the narrowed "ready"
    shape. It computes isCurrent and the status cell only when currentPin.phase === "ready"; on any other
    phase (including the new "not-valid" phase) the row''s status is null, which StatusTable''s renderCellContent
    renders as nothing (no dot, no label), and the "Revise ->" action is withheld. The route body is otherwise
    unchanged: currentPin.phase === "not-valid" falls through both the loading and the load-error checks,
    so revisionsQuery''s own successfully-read rows render normally, and usesNoRevision (gated on phase
    === "ready") stays false so the "case currently uses no revision of" paragraph does not appear on
    this reading.'
criteria:
- criterion: Opening a hypothesis's revision history for a case whose current (highest-numbered) version
    fails a validator rule of validation-runs-at-every-read presents that hypothesis's own revision history,
    read successfully and independently of the version's own refused read, turning on nothing about which
    validator rule failed over that version.
  met: true
  how: 'The manifestQuery.isError branch in use-case-hypothesis-current-pin.ts now returns { phase: "not-valid"
    } whenever errorStateKind(manifestQuery.error) is "case-not-valid" -- the single kind error-ui-state.ts
    maps every CaseVersionNotValidError to, regardless of which validator rule of validation-runs-at-every-read
    produced it. hypothesis-revision-history.tsx no longer treats that phase as loading or as load-error,
    so it falls through to the same rows it would render had the manifest read succeeded, built entirely
    from revisionsQuery''s own independently-read data.'
- criterion: On that same reading, the screen states neither that some revision it presents is the one
    the case currently uses nor that the case currently uses no revision of that hypothesis — no fact
    derived from that version's manifest is stated at all — and the presence of the revision history
    is distinguishable from the statement the screen makes for a read that did not complete.
  met: true
  how: toHistoryRow only computes isCurrent and only renders the "current"/"frozen" status cell and the
    "Revise ->" action when currentPin.phase === "ready"; on "not-valid" the status cell is null (StatusTable
    renders nothing for it) and the action is withheld, so no fact from the refused manifest is stated
    on any row. The route's usesNoRevision flag is likewise gated on phase === "ready", so the "The case
    currently uses no revision of" paragraph never renders on this reading either. The revision table
    and its heading render in place of the "Unable to load this hypothesis's revision history." paragraph
    and Retry button the load-error branch shows, so the two are visibly distinct.
- criterion: A genuine failure to read the hypothesis's own revisions (not the case's current version)
    still presents the statement the screen already makes for a read that did not complete.
  met: true
  how: Unchanged -- the revisionsQuery.isError || currentPin.phase === "load-error" branch in hypothesis-revision-history.tsx
    still renders the generic "Unable to load" statement whenever revisionsQuery itself errors, independent
    of currentPin's phase (including the new "not-valid" phase, which does not suppress it).
nodes:
- node: rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  - src/routes/hypothesis-revision-history.tsx
  how: The refused reading (case-not-valid) is now told apart from an undifferentiated load failure at
    the hook, and the route presents the hypothesis's own successfully-read revisions on it, stating neither
    that a presented revision is the one in use nor that none is, turning on nothing about which validator
    rule produced the refusal -- matching this node's statement. Whether the read of the revisions itself
    failed is untouched by this change, as the node requires.
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: 'The refusal is now held apart from a read that did not complete at the phase level (distinct "not-valid"
    vs "load-error"), which is what this task''s own Notes UNDERDETERMINED entry 1 identifies as the reachable
    part of this node for this task: no criterion requires an explicit "does not read back as a case"
    statement distinct from the other two states on this surface, and none was added, since the task''s
    own notes disclose that gap as one this task deliberately does not close.'
- node: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: 'Untouched for the "ready" phase -- pinnedRevisionFor still reads the pin from targetVersion''s
    (the highest-numbered version''s) manifest, and a missing manifest entry still yields pinnedRevision:
    null, which the route still states as "The case currently uses no revision of". This task''s own Notes
    UNDERDETERMINED entry 2 discloses that no criterion reaches extending that same marking to the refused
    ("not-valid") reading, and none was added here.'
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: 'manifestQuery errors whose errorStateKind is not "case-not-valid" still fall through to { phase:
    "load-error", retryLoad }, which hypothesis-revision-history.tsx presents as the same "read that did
    not complete" statement, disclosing no code, message or value -- unchanged from before this task and
    matching this node directly. This task''s own Notes UNDERDETERMINED entry 4 discloses that only the
    named CaseVersionNotValidError refusal was narrowed out, leaving every other code on this same generic
    branch rather than adding presentations of its own.'
inferences:
- inferred: errorStateKind (imported from use-edit-draft-version-form.ts rather than reimplemented) is
    the correct way to classify manifestQuery's error as "case-not-valid".
  from: use-hypothesis-revision-form.ts and use-manifest-builder.ts both import the same errorStateKind
    from use-edit-draft-version-form.ts to make this identical classification.
- inferred: The "not-valid" phase carries no payload (no retryLoad, no data) -- same shape as the other
    two hooks' "not-valid" phase.
  from: 'use-edit-draft-version-form.ts''s and use-manifest-builder.ts''s EditDraftVersionFormState /
    ManifestBuilderState both use a bare { readonly phase: "not-valid" } member.'
- inferred: Setting a row's status field to null (rather than omitting the key or using some other placeholder)
    is what satisfies the task's requirement, disclosed in its Notes as already resolved by the binder,
    that the current/frozen cell must not render at all on this reading.
  from: status-table.tsx's renderCellContent/renderPlainValue, which return null (rendering nothing) for
    a null or undefined cell value.
divergences:
- from: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  departure: No explicit "does not read back as a case" statement is rendered on the refused reading,
    distinct from the other two states this node requires told apart.
  why: This task's own Notes carry this exact gap as UNDERDETERMINED entry 1; no criterion this task states
    requires it, and closing it is left to a future increment.
- from: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  departure: The "case currently uses no revision of" marking is not extended to the refused reading.
  why: UNDERDETERMINED entry 2, disclosed in the task's own Notes; no criterion this task states requires
    it.
- from: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  departure: A refusal of the current-version read carrying an error code this hook holds no presentation
    of its own for still falls to the same undifferentiated load-error branch, with no widening or additional
    disclosure.
  why: UNDERDETERMINED entry 4, disclosed in the task's own Notes; no criterion this task states reaches
    it.
preserved:
- 'versionsQuery''s own error and no-versions-at-all branches in use-case-hypothesis-current-pin.ts are
  untouched and still fold into { phase: "load-error" } -- this task''s Notes UNDERDETERMINED entry 3
  discloses this branch as one no criterion of this task reaches.'
- The "ready" phase's pinnedRevision computation, the "current"/"frozen" status cell, the "Revise ->"
  action and the "The case currently uses no revision of" paragraph all keep their prior behavior exactly
  when currentPin.phase === "ready".
- revisionsQuery's own loading, error and empty-revisions branches in hypothesis-revision-history.tsx
  are unchanged.
deferred:
- what: Stating explicitly, on the refused reading, that the case's current version does not read back
    as a case (distinct from the load-error and no-version statements).
  why: UNDERDETERMINED entry 1, disclosed in the task's own Notes; outside this task's criteria.
- what: Extending the "case currently uses no revision of" marking convention to the refused reading.
  why: UNDERDETERMINED entry 2, disclosed in the task's own Notes; outside this task's criteria.
- what: Telling a case holding no version at all apart from a genuine load failure.
  why: UNDERDETERMINED entry 3, disclosed in the task's own Notes -- a separate branch (versionsQuery)
    this task does not reach.
- what: Narrowing the load-error fallback for an unrecognized refusal code of the current-version read,
    or disclosing that code/message.
  why: UNDERDETERMINED entry 4, disclosed in the task's own Notes; outside this task's criteria.
---

## What it is
use-case-hypothesis-current-pin.ts now classifies a CaseVersionNotValidError refusal of the case's current version as its own not-valid phase, distinct from a genuine load failure, and hypothesis-revision-history.tsx presents a hypothesis's own successfully-read revisions on that reading -- stating no fact derived from the refused version's manifest by rendering no status cell and no "case currently uses no revision of" statement.

## Notes
Build (install/typecheck/lint/style/build/a11y/secret-scan) captured clean at run/case-not-valid-surface-presentation-current-pin-build.
