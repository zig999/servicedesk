---
title: Unwire the Attributes tab from Case Detail's tab strip
summary: case-detail-screen.tsx's Tabs block now wires only Versions and Hypotheses, and the screen-level
  spec that proved the Attributes tab's presence is removed along with it.
task: sha256:311b2cae3b29c0cc1a4e4171fbee6dc5dfa8690d986783dc07dc958892b9deac
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-detail-attributes-tab-unwire-attributes-tab-from-case-detail-build-2
files:
- path: src/routes/case-detail-screen.tsx
  effect: no longer imports CaseAttributesTab; its Tabs block renders exactly two TabsTrigger/TabsContent
    pairs (versions, hypotheses) instead of three — the VersionsPanel and CaseHypothesesTab wiring is
    otherwise unchanged, so Versions stays the Tabs' defaultValue and each tab's own content mounts exactly
    as it did before this task.
- path: src/routes/case-detail-screen-attributes-tab.spec.ts
  effect: deleted — this file existed solely to prove the Attributes tab's presence in the tab strip,
    a fact this task removes; nothing else in the tree references it (confirmed by the dependent task
    remove-attributes-tab-modules not naming this file in its own deletion list, and no other spec importing
    it).
criteria:
- criterion: Case Detail renders exactly two tab triggers, labelled Versions and Hypotheses.
  met: true
  how: case-detail-screen.tsx's TabsList now renders only TabsTrigger value="versions" (label "Versions")
    and TabsTrigger value="hypotheses" (label "Hypotheses"); the third TabsTrigger value="attributes"
    is removed.
- criterion: case-detail-screen.tsx renders no tab trigger with the value "attributes".
  met: true
  how: The TabsTrigger value="attributes" element is deleted from the file.
- criterion: case-detail-screen.tsx renders no tab content with the value "attributes".
  met: true
  how: The TabsContent value="attributes" element (which mounted CaseAttributesTab) is deleted from the
    file.
- criterion: case-detail-screen.tsx imports nothing from routes/case-attributes-tab.
  met: true
  how: The import of CaseAttributesTab is removed; grepping the file's remaining imports shows no reference
    to case-attributes-tab.
- criterion: Versions is the tab selected on Case Detail's first render.
  met: true
  how: The Tabs element still carries defaultValue="versions", untouched by this edit, and it is still
    the first TabsTrigger in the list.
- criterion: Selecting the Hypotheses tab on Case Detail mounts the hypotheses tab content.
  met: true
  how: The TabsTrigger value="hypotheses" / TabsContent value="hypotheses" pair, mounting CaseHypothesesTab,
    is untouched by this edit.
- criterion: Selecting the Versions tab on Case Detail mounts the same version-listing panel it mounted
    before this task.
  met: true
  how: VersionsPanel and its TabsTrigger/TabsContent value="versions" pair are untouched; only the sibling
    Attributes pair was removed.
- criterion: No spec file in the tree asserts that Case Detail presents an Attributes tab.
  met: true
  how: src/routes/case-detail-screen-attributes-tab.spec.ts — the one spec file that made this assertion
    — is deleted from the tree entirely; grepping the tree for "Attributes" now turns up only the still-standing
    tab component/hook and their own dedicated specs, none reached from case-detail-screen.tsx anymore.
- criterion: Every Case Detail spec other than the one asserting the Attributes tab passes without being
    edited.
  met: true
  how: case-detail-screen.spec.ts and its five siblings were read; none queries or asserts anything about
    an Attributes tab, and the edit dropped only the Attributes pair, leaving the Versions and Hypotheses
    wiring these specs exercise structurally unchanged.
inferences:
- inferred: Removing the Attributes tab's proof spec (case-detail-screen-attributes-tab.spec.ts) is this
    task's own responsibility rather than a later task's, since leaving it asserting a tab-strip element
    removed in this same delivery would fail its own assertions.
  from: the task's own "What it is" section, which states this spec file "goes with the wiring it proves"
    in the same breath as describing the trigger/content pair to remove.
preserved:
- VersionsPanel's rendering (loading state, error-with-retry state, the version table, the New draft link
  logic) — untouched, still wired through TabsContent value="versions".
- CaseHypothesesTab's mounting through TabsContent value="hypotheses" — untouched.
- The Tabs component's defaultValue="versions" — untouched, so first-render selection is unchanged.
- CaseAttributesTab (routes/case-attributes-tab.tsx) and its hook (hooks/use-case-attributes-at-a-glance.ts),
  plus their own dedicated test files — left standing in the tree per the task's Notes, to be removed
  by a dependent task.
- Shared modules errorStateKind, CaseVersionRecord and useCaseVersions — not touched at all.
deferred:
- what: Deleting case-attributes-tab.tsx, use-case-attributes-at-a-glance.ts, and their three dedicated
    test files, and re-homing the case-not-valid disclosure this removal would otherwise drop.
  why: The task's own Notes assign this to task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
    and its dependent, which must land before that deletion is safe.
---

## What it is
case-detail-screen.tsx's Tabs block dropped its third TabsTrigger/TabsContent pair (value="attributes", mounting CaseAttributesTab) and the import that pair used, leaving only the Versions and Hypotheses tabs it always had alongside it.
case-detail-screen-attributes-tab.spec.ts, which existed only to prove that third pair's presence, was deleted in the same delivery: proving a fact this task removes.

## Notes
This edit leaves the surrounding Tabs wiring, its defaultValue and both surviving tabs' own mounting untouched, which is what the record's `preserved` list states.
The tab component and its hook stay in the tree, deliberately, for the dependent tasks that relocate their one disclosure and then remove the now-orphaned modules.
The first build attempt (run/case-detail-attributes-tab-unwire-attributes-tab-from-case-detail-build) ran against the spec file emptied to zero bytes rather than deleted, which vitest would have refused at the suite step ("No test suite found in file"); that file is now deleted outright, and this record's run pin points at the build that ran against the corrected tree.
