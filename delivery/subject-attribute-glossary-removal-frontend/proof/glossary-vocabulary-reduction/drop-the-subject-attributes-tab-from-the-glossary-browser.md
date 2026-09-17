---
target: frontend
title: Proof for dropping the Subject attributes tab from the glossary browser
summary: Tests showing the glossary browser renders exactly five tabs with no Subject attributes tab,
  issues no read of that vocabulary from any tab, and that every surviving tab and test-support fixture
  still holds after the shortening.
implementation: sha256:be93daf72bb0f745a5c7e2e640f8df8766d742fc3093a05a76c5db47822789b3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/glossary-vocabulary-reduction-tab-removal-panel-removal-suite-2
tests:
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders exactly the tabs Concepts, Subject types, Outcomes, Actions and Recipients, in that order,
    with Concepts selected by default
  proves: The glossary browser renders exactly five tabs — Concepts, Subject types, Outcomes, Actions,
    Recipients — and no Subject attributes tab.
  fails_when: the rendered tab bar ever contains a tab other than exactly these five labels in this order,
    or Concepts is not the one selected by default
- file: src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
  name: never requests the subject-attribute vocabulary, and every path it does request is one of the
    glossary's five held endpoints
  proves: No rendering of the glossary browser issues a glossary read for the vocabulary name "subject-attribute",
    and every vocabulary name this screen reads is one the glossary holds.
  fails_when: any fetch call targets "/v1/glossary/subject-attribute", or targets any path outside the
    five held endpoints
- file: src/routes/glossary-browser-screen-subject-attribute-removal.spec.ts
  name: excludes Subject attributes from ALL_TAB_LABELS, VOCABULARY_TAB_CASES and ALL_TAB_CASES
  proves: The screen's test support holds no Subject attributes entry in its shared tab-label and tab-case
    fixtures.
  fails_when: any of the three fixtures gains back a "Subject attributes" label or a path containing "subject-attribute"
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: renders one row per term GET $path returns, by name, in the $tabLabel tab (x4, over VOCABULARY_TAB_CASES)
  proves: Each of the four surviving vocabulary tabs still renders its own VocabularyPanel.
  fails_when: any of Subject types, Outcomes, Actions or Recipients stops rendering one row per term its
    own GET returns
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: renders its own explicit empty-state message and no table when GET $path returns zero terms, in
    the $tabLabel tab (x4)
  proves: Each of the four surviving vocabulary tabs still renders its own empty message.
  fails_when: any of the four surviving tabs stops showing its own empty message, or shows a table, when
    its GET returns zero terms
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: shows $errorMessage plus a Retry button when GET $path fails, and Retry re-issues the same request,
    in the $tabLabel tab (x4)
  proves: Each of the four surviving vocabulary tabs still renders its own load-error message and Retry
    control.
  fails_when: any of the four surviving tabs stops showing its own error message plus a working Retry
    control when its GET fails
- file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
  name: renders the newly active tab's own data in place of the previously active tab's, and issues no
    request for the other four vocabulary paths
  proves: Every surviving tab's own assertion passes against the shortened fixtures, including any that
    reads a fixture's length or position.
  fails_when: switching to Outcomes ever also issues a request for Subject types, Actions or Recipients
- file: src/routes/glossary-browser-screen.spec.ts
  name: renders one row per concept GET /v1/glossary/concepts returns, each showing its own name, accepts
    and ttl
  proves: The Concepts tab still renders ConceptsPanel unchanged.
  fails_when: the Concepts tab stops listing concepts by name, accepts and ttl
not_applicable:
- edge_case: what a read naming a vocabulary the glossary does not publish at all is answered with
  why: the task's own ADVISORY note states this criterion asserts only that this screen never issues such
    a read, not what one would answer; the REMAINDER note places both refusal clauses with the already-delivered
    backend read
- edge_case: two simultaneous renders/mounts of the glossary browser racing on which tabs exist
  why: this task removes one static tab from a fixed, non-mutating tab bar; no criterion or node states
    a concurrency guarantee over mounting
- edge_case: a duplicate "Subject attributes" entry surviving in one fixture but not another
  why: the fixture-content test checks all three shared fixtures directly for the entry; there is no partial-removal
    state a criterion describes beyond "holds no entry"
untested:
- 'rules/glossary/a-glossary-read-by-an-unheld-name-is-refused: no test in this proof decides this node''s
  fact whole. The node''s fact is the backend''s two HTTP 404 refusals; this task''s own tests only observe
  frontend fetch calls against a stubbed fetch. This matches the task''s own REMAINDER note.'
- 'domain/investigation/subject-attribute-value: no test in this proof decides this node''s fact whole.
  This task touches no attribute-input surface, per the task''s own ADVISORY note.'
- the disclosed inference that the surviving five vocabulary/concept endpoints are the complete and correct
  'held' set rests on the current knowledge/domain/glossary/ tree matching that count; no node states
  the browser's own tab set as a fact, so this correspondence is read off the domain tree rather than
  pinned by any test beyond the five-tab count itself.
---

## What it is

Seven tests proving every testable criterion of task/glossary-vocabulary-reduction/drop-the-subject-attributes-tab-from-the-glossary-browser: two new specs (subject-attribute-removal, vocabulary-tabs) plus targeted fixes to the existing glossary-browser-screen.spec.ts tab-order and Concepts tests.

## Notes

None.
