---
title: Drop the Subject attributes tab from the glossary browser
summary: The glossary browser's browsable-vocabulary tab set, reduced to the vocabularies the glossary publishes.
rationale: The screen and its test support are one task and not two because the ALL_TAB_LABELS/VOCABULARY_TAB_CASES/ALL_TAB_CASES fixtures are shared across every tab's assertions — removing the entry changes array lengths other tabs' own tests read, so the screen and its fixtures cannot be shown correct apart. Cut away from the union narrowing because the tab set is a consumer of the union, and a task changing an interface and its consumer in one breath is two tasks.
sources:
- intake/scope.md
objective: The glossary browser offers exactly the vocabularies the glossary publishes, with no Subject attributes tab and no read of that vocabulary from this screen.
criteria:
- The glossary browser renders exactly five tabs — Concepts, Subject types, Outcomes, Actions, Recipients — and no Subject attributes tab.
- No rendering of the glossary browser issues a glossary read for the vocabulary name "subject-attribute".
- Each of the four surviving vocabulary tabs still renders its own VocabularyPanel with its own empty message and its own load-error message and Retry control.
- The Concepts tab still renders ConceptsPanel unchanged.
- Every vocabulary name this screen reads is one the glossary holds, so this rule refuses none of the screen's own reads.
- The screen's test support holds no Subject attributes entry in its shared tab-label and tab-case fixtures.
- Every surviving tab's own assertion passes against the shortened fixtures, including any that reads a fixture's length or position.
implements:
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- domain/investigation/subject-attribute-value
---

## What it is
The TabsTrigger and TabsContent pair for subject-attribute in glossary-browser-screen.tsx, and the VocabularyPanel instance behind it, go away.
The shared fixtures in glossary-browser-screen.test-support.ts lose their Subject attributes entry, and every other tab's own assertions are shown still to hold against the shortened arrays.

## Notes
VocabularyPanel itself stays: four vocabularies still drive it, and the established one-triple-per-vocabulary pattern is what this task shortens rather than replaces.
ADVISORY, from the specification — criterion 13 cites rules/glossary/a-glossary-read-by-an-unheld-name-is-refused for a scope its statement does not carry exactly: that node refuses a read of a term or a concept by name, where this screen's own reads are whole-vocabulary listings identified by a vocabulary name. No node states what a read naming a vocabulary the glossary does not publish at all answers, but the criterion is satisfiable regardless — it asserts only that this screen never issues such a read, not what one would answer.
REMAINDER, from the specification — both refusal clauses of rules/glossary/a-glossary-read-by-an-unheld-name-is-refused (HTTP 404 VocabularyTermNotHeldError, HTTP 404 ConceptNotHeldError) reach no criterion of this task; this task only narrows which names the screen asks for. Belongs to: the already-delivered published glossary read (subject-attribute-glossary-removal-backend), not this frontend task.
ADVISORY, from the specification — domain/investigation/subject-attribute-value's own governance of which attribute names an interface may offer sits in rules/investigation/a-composed-subject-presents-every-case-input-requirement and a-diagnosed-subject-covers-its-cases-required-attributes, neither in this epic's covers; inert here since this task touches no attribute-input surface.
ADVISORY, from the specification — the "exactly five tabs" criterion is backed only by the constrains enumerations of the five surviving glossary domain nodes (concept, subject-type, outcome, action, recipient), which match the current knowledge/domain/glossary/ tree; no candidate states the browser's own tab set as a fact.
Decision, beyond the covers — stand: rules/investigation/a-composed-subject-presents-every-case-input-requirement governs an attribute-input surface this task does not touch; read here only for the background fact its Description states, never as a claim this task's own criteria need held against it.
