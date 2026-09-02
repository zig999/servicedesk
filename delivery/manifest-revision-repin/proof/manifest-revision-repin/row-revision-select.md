---
title: The manifest row's revision Select
summary: Proves the seven criteria of row-revision-select plus its own disclosed inferences and both UNDERDETERMINED
  gaps its Notes named, against the revised implementation.
implementation: sha256:2ee5b602f0122298470cfeae9fff3d2431f8bab0fcbbb39574d79a3ab24d4dde
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-row-revision-select-suite-5
tests:
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: renders one option per revision obtained for that row, each labelled by its own bare revision
    number
  proves: 'Criterion 1: "The cell renders a Select holding one option per revision obtained for that row,
    each labelled by its revision number."'
  fails_when: The Select's options stop being a 1:1 map of useManifestRowRevisions' own `revisions` array
    into {value,label} pairs labelled by the bare revision number.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: shows the row's currently pinned revision as the Select's own value before any choice is made
  proves: 'Criterion 2: "The Select''s value is the revision the row''s manifest entry currently pins,
    shown before any choice is made."'
  fails_when: The Select's `value` stops being read from the row's own pinned revision before any interaction.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: invokes the row's own repin action with the chosen revision
  proves: 'Criterion 3: "Choosing a revision other than the row''s pinned revision invokes the repin action
    for that row with the chosen revision."'
  fails_when: Choosing a different revision stops calling row.onRepin with the chosen number.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: issues no manifest request when the revision chosen is the one the row already pins
  proves: 'Criterion 4: "Choosing the revision the row already pins issues no manifest request."'
  fails_when: repinIfChanged's own guard stops gating the call to row.onRepin, so choosing the already-pinned
    value issues a PUT.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: disables the Select on every row while an earlier repin request is still pending, exactly like
    the row's own move and remove controls
  proves: 'Criterion 5 (the isBusy half): "The Select is disabled exactly when that row''s existing move
    and remove actions are disabled."'
  fails_when: The Select's `disabled` prop stops tracking the same rowsDisabled value RowActions reads.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: disables the Select once a repin's own PUT answers 409 CaseVersionNotDraftError, exactly like
    the row's own move and remove controls
  proves: Criterion 5 (the isBlocked half).
  fails_when: The Select stops disabling once state.isBlocked turns true, while RowActions' move/remove
    controls still do.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: exhibits the Select's own combobox/listbox interaction contract (click-to-open, Escape-to-close)
  proves: 'Criterion 6''s controlled-component half: the row''s picker exhibits @tui/ui/select''s own
    role=combobox/listbox/option interaction contract.'
  fails_when: The trigger stops carrying role=combobox, or clicking it stops opening a role=listbox of
    role=option items.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: leaves every other row's own shown revision unchanged, and issues no request for them, when one
    row is repinned
  proves: 'Criterion 7: "Choosing a revision on one row leaves every other row''s shown revision unchanged."'
  fails_when: Repinning one row changes another row's own displayed value, or issues a second PUT beyond
    the repinned row's own.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: keeps the hypothesis's own name as the Select's caption and accessible name
  proves: The implementation's own inference that the Hypothesis cell keeps showing row.hypothesisName
    as the Select's own label text and accessible name.
  fails_when: The hypothesis's own name stops being rendered as the Label wrapping the Select.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: marks the Select itself invalid and links the error message to it through aria-describedby when
    a repin fails for an unnamed reason
  proves: The implementation's own inference that row.revisionErrorMessage is linked to the Select's actual
    trigger via aria-invalid/aria-describedby, attached imperatively through a ref since @tui/ui/select
    does not forward those props to its combobox button.
  fails_when: The rendered error paragraph's id stops matching `revision-error-${hypothesisName}`, or
    the combobox itself stops carrying aria-invalid="true" and a matching aria-describedby.
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: disables the Select before any repin is even attempted on a row whose case version is released
  proves: 'The UNDERDETERMINED note: criterion 5 ties the Select''s disabled state only to the row''s
    existing move/remove flag, never to the case version''s own draft/released state; domain/knowledge/case-version
    settles this in favor of proactive disabling.'
  fails_when: The trigger is not disabled on load for a row whose case version's own state is "released".
- file: src/routes/version-manifest-screen-revision-select.spec.ts
  name: still states the row's own pinned revision as the Select's shown value when that revision is absent
    from the page useManifestRowRevisions answered
  proves: 'The second UNDERDETERMINED note: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
    requires the entry to still state its pinned revision even when absent from the answered page.'
  fails_when: The Select's `value` stops carrying the true pinned number, falling back to the placeholder
    instead.
not_applicable:
- edge_case: A numeric boundary at either end of a stated range of revisions.
  why: No criterion of this task states a minimum or maximum revision count or value.
- edge_case: A duplicate revision number among a row's own options.
  why: No criterion of this task claims option uniqueness, and a hypothesis's own revision numbering is
    useManifestRowRevisions's own concern.
- edge_case: The manifest's own initial GET failing or staying pending.
  why: Covered by the sibling load task's own criteria and its own spec file; this task only changes what
    an already-loaded row's Hypothesis cell renders.
- edge_case: Removing or reordering a row while its own revision Select is open.
  why: No criterion of this task states an interaction between the Select's open state and the already-delivered
    move/remove actions.
untested:
- The pre-existing sibling suites (load/remove/reorder/conflict) had their row locators updated in a separate,
  directly-authorized edit outside this delivery once this task's own presentation change broke them;
  that edit is not part of this proof and carries its own commit.
- That no second select implementation exists anywhere in the codebase is a static fact about the diff,
  not a runtime behavior; this proof demonstrates only that the row's own picker exhibits @tui/ui/select's
  own combobox/listbox contract.
divergences:
- from: the task's own second UNDERDETERMINED note's own test fixture
  departure: 'The "possibly-already-released row" test''s fixture originally omitted `state` entirely,
    identical to three other describe blocks requiring the trigger enabled — no implementation could satisfy
    both readings from that fixture. With the human''s authorization, the fixture for this one test was
    corrected to set `state: "released"` explicitly, closing the disagreement the task-implementer disclosed
    rather than leaving it as a standing conflict.'
  why: Two independent failure-diagnostician passes agreed the fixture, not the implementation, was incomplete;
    correcting it (rather than the implementation) is what the specification's own case-version.md already
    settles, and the human authorized this specific, narrow fixture correction.
---

## What it is
Twelve tests over the manifest row's revision Select, proving all 7 criteria, 2 disclosed inferences (accessible name, aria error linkage), and both UNDERDETERMINED gaps the task's own Notes named.

## Notes
The aria-invalid/aria-describedby test initially failed because @tui/ui/select forwards unknown props only to its outer wrapping div, never its combobox button; the implementation was revised to attach both attributes imperatively via a ref, and this test now passes against that fix.
The "possibly-already-released row" test's own fixture was corrected (with the human's authorization) to set `state: "released"` explicitly, after two independent diagnoses found the fixture, not the implementation, incomplete — disclosed above as a divergence.
