---
target: frontend
title: Drop the Subject attributes tab from the glossary browser
summary: The glossary browser's browsable-vocabulary tab set is reduced to the five vocabularies the glossary
  publishes; the Subject attributes TabsTrigger/TabsContent/VocabularyPanel instance and its shared test-support
  fixture entries are removed.
task: sha256:83484410f9398179251498a8aa134ddb842f3666607e74e7d917b1a7d71ddf12
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-reduction-tab-removal-panel-removal-suite-2
files:
- path: src/routes/glossary-browser-screen.tsx
  effect: No longer renders a "Subject attributes" TabsTrigger, its TabsContent, or the VocabularyPanel
    instance behind it. The TabsList now holds exactly five triggers (concepts, subject-type, outcome,
    action, recipient) and the Tabs body holds exactly five matching TabsContent blocks, so the screen
    issues no read of the glossary's "subject-attribute" vocabulary. VocabularyPanel's own loading/error/retry/empty
    rendering and the Concepts tab's ConceptsPanel are untouched.
- path: src/routes/glossary-browser-screen.test-support.ts
  effect: SUBJECT_ATTRIBUTE_PATH is removed. VOCABULARY_TAB_CASES and ALL_TAB_LABELS no longer carry a
    "Subject attributes" entry, each holding exactly four and five entries respectively in their original
    order. ALL_TAB_CASES derives from VOCABULARY_TAB_CASES and needed no direct edit.
criteria:
- criterion: The glossary browser renders exactly five tabs — Concepts, Subject types, Outcomes, Actions,
    Recipients — and no Subject attributes tab.
  met: true
  how: The TabsList in glossary-browser-screen.tsx lists exactly those five TabsTrigger values in that
    order; the Subject attributes trigger and its TabsContent were deleted. Proven by glossary-browser-screen.spec.ts's
    own tab-order test.
- criterion: No rendering of the glossary browser issues a glossary read for the vocabulary name "subject-attribute".
  met: true
  how: The only useGlossaryVocabularyOptions("subject-attribute") call was inside the deleted TabsContent
    block. Proven by glossary-browser-screen-subject-attribute-removal.spec.ts.
- criterion: Each of the four surviving vocabulary tabs still renders its own VocabularyPanel with its
    own empty message and its own load-error message and Retry control.
  met: true
  how: The subject-type, outcome, action and recipient TabsContent blocks are untouched. Proven by glossary-browser-screen-vocabulary-tabs.spec.ts's
    listing/empty/error-plus-retry tests.
- criterion: The Concepts tab still renders ConceptsPanel unchanged.
  met: true
  how: The concepts TabsContent block and ConceptsPanel usage were not touched. Proven by glossary-browser-screen.spec.ts's
    Concepts-listing test.
- criterion: Every vocabulary name this screen reads is one the glossary holds, so this rule refuses none
    of the screen's own reads.
  met: true
  how: The screen now reads exactly subject-type, outcome, action, recipient and concepts — the held set
    — and no longer reads subject-attribute. Proven by glossary-browser-screen-subject-attribute-removal.spec.ts's
    held-endpoints assertion.
- criterion: The screen's test support holds no Subject attributes entry in its shared tab-label and tab-case
    fixtures.
  met: true
  how: SUBJECT_ATTRIBUTE_PATH and the "Subject attributes" entries of VOCABULARY_TAB_CASES and ALL_TAB_LABELS
    are removed. Proven by glossary-browser-screen-subject-attribute-removal.spec.ts's fixture-content
    test.
- criterion: Every surviving tab's own assertion passes against the shortened fixtures, including any
    that reads a fixture's length or position.
  met: true
  how: Only the single Subject attributes entry was deleted in place, leaving every surviving entry's
    position and value unchanged relative to its neighbors; the tab-switching test's own stale reference
    to the removed path was updated. Confirmed by the full suite run passing (run/glossary-vocabulary-reduction-tab-removal-panel-removal-suite-2).
nodes:
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  encoded_at:
  - src/routes/glossary-browser-screen.tsx
  how: The node's constrains list names exactly the five vocabularies (concept, subject-type, outcome,
    action, recipient) the screen now reads; the screen issues no read this rule would have to refuse.
    Per the task's own REMAINDER note, this task does not implement either refusal clause (the 404s) —
    those belong to the already-delivered backend task.
- node: domain/investigation/subject-attribute-value
  how: Per the task's Notes, this node's own governance of which attribute names an interface may offer
    is inert here since this task touches no attribute-input surface; no shape or field of this value-object
    is composed, read or rendered in either touched file.
inferences:
- inferred: The removal is exactly the TabsTrigger/TabsContent pair and the VocabularyPanel instance behind
    it, with no adjustment to VocabularyPanel itself, useGlossaryVocabularyOptions, or the GlossaryVocabulary
    union.
  from: The task's own "What it is" and Notes state VocabularyPanel stays and explicitly exclude use-glossary-vocabulary.ts
    as a sibling task's concern.
preserved:
- The four surviving vocabulary tabs each still render their own VocabularyPanel with their own emptyMessage,
  loadErrorMessage, loading state and Retry control, unchanged.
- The Concepts tab still renders ConceptsPanel unchanged.
- The relative order and values of the surviving VOCABULARY_TAB_CASES and ALL_TAB_LABELS entries.
deferred:
- what: The GlossaryVocabulary union in use-glossary-vocabulary.ts (and its .spec.ts) still names "subject-attribute"
    as a member.
  why: The task's own Notes name this a sibling task's cut.
---

## What it is

The TabsTrigger/TabsContent pair for subject-attribute and the VocabularyPanel instance behind it, removed from glossary-browser-screen.tsx; the shared test-support fixtures shortened to match.

## Notes

None.
