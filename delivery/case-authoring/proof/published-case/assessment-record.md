---
title: "Proof that an assessment carries a resolution and reads its parts back"
summary: "What proves task/published-case/assessment-record \u2014 nine tests over createAssessment, covering each criterion, the copy-on-construct and absent-value inferences, and the edge cases the construct does not raise."
implementation: sha256:324bd4f735ef38018d484301069444c881611e00ec416caeca727e01557b32d1
tests:
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the resolution it was constructed with"
    proves: "An assessment reads back the resolution it was constructed with."
    fails_when: "the constructed assessment's resolution differs in any part from the one handed in \u2014 a dropped, renamed, defaulted or rewritten outcome name, action name or recipient name, or a resolution not carried at all"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "carries only one resolution when it is handed a part naming a second one"
    proves: "An assessment carries exactly one resolution."
    fails_when: "a constructed assessment carries any part beyond its resolution, its determining hypothesis and its text \u2014 so a second resolution handed in reaching the value, or the single slot being joined by another, breaks it"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads its resolution back as one resolution and not as a collection of them"
    proves: "An assessment carries exactly one resolution."
    fails_when: "the resolution slot comes to hold a collection rather than one resolution"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the determining hypothesis it was constructed with, by name"
    proves: "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
    fails_when: "the determining hypothesis name is dropped, altered, replaced, or read back as anything other than the name the assessment was constructed with"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "constructs an assessment given no determining hypothesis rather than refusing it"
    proves: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
    fails_when: "construction raises when no determining hypothesis is given \u2014 a refusal path, a required-field check, or anything reading the absent hypothesis and throwing"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back no determining hypothesis when it was constructed without one"
    proves: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none \u2014 and the implementation's inference that absence is read back as the absent value rather than a sentinel or a wrapper."
    fails_when: "the field reads back as a substituted name, an empty string, a sentinel value or a wrapper object instead of the absent value"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the text it was constructed with, character for character"
    proves: "An assessment reads back the text it was constructed with."
    fails_when: "the text is trimmed, its line break normalized or joined, its whitespace collapsed, truncated, escaped or otherwise not the string the assessment was constructed with"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the outcome it was constructed with after the resolution handed in is changed"
    proves: "the implementation's inference that a constructed assessment holds its own copy of the resolution rather than the object it was handed, which is what makes the readback of criterion one hold over time."
    fails_when: "the constructed assessment shares the resolution object it was handed, so a later change to that object changes what the assessment reads back"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the action it was constructed with after the referral handed in is changed"
    proves: "the implementation's inference that a constructed assessment holds its own copy of the referral, not only of the resolution around it."
    fails_when: "the embedded referral is shared rather than copied \u2014 a shallow copy of the resolution that carries the same referral object through breaks this while leaving the outcome test passing"
not_applicable:
  - edge_case: "constructing with no resolution, or with no text"
    why: "both are declared required and the construct has no runtime refusal path at all; reaching such a call would mean defeating the declaration to observe behaviour no bound node states, and what came back could not be checked against anything."
  - edge_case: "constructing with an empty text"
    why: "no bound node states whether an empty text is refused or carried, so a test either way would fix a decision the base has not made \u2014 the construct carries what it is given, and which of the two is right is a fact for the base rather than for this proof."
  - edge_case: "constructing with an empty outcome, action, recipient or hypothesis name"
    why: "each of those is bound by identity and carried as given, with nothing here enumerating or checking a vocabulary, so a test would assert a validation no bound node places at this construct."
  - edge_case: "a boundary at each end of a stated range"
    why: "no bound node states a length, a count or a range for any part an assessment carries, so there is no end to sit at."
  - edge_case: "an empty collection coming back"
    why: "an assessment carries no collection \u2014 one resolution, one optional hypothesis name and one text \u2014 and the resolution's referral is a pair of names rather than a list."
  - edge_case: "a duplicate where uniqueness is claimed"
    why: "the uniqueness claimed is that two hypotheses of one case never share a name, and its scope is the case; this construct holds no case reference and carries one hypothesis name, so no duplicate can be presented to it."
  - edge_case: "an operation against state that forbids it"
    why: "construction is a single pure call over no state and the construct has no lifecycle, so there is no state a call could be attempted against."
  - edge_case: "a dependency that fails or answers slowly"
    why: "the construct calls nothing outside the language runtime \u2014 no store, network, filesystem or external service \u2014 so there is no dependency whose bad day is observable here."
  - edge_case: "two constructions against one subject at once"
    why: "construction returns a new value and mutates nothing shared, so concurrent calls have no common subject; the related risk \u2014 two assessments built from one resolution object sharing it \u2014 is what the two copy-on-construct tests above exercise."
untested:
  - "The repository holds no package manifest, compiler configuration or test harness, so not one of these tests has been executed or type-checked, and a test nobody has watched fail is a test whose failure mode is argued rather than observed."
  - "These tests are written against Node's built-in node:test and node:assert/strict, which is this proof's choice made because no runner exists to follow; whichever runner the project chooses may require every one of these files to be rewritten."
  - "That the assessment declares exactly one required resolution slot, not a list and not optional, is a fact the compiler holds and no compiler runs here \u2014 the runtime tests reach only what a constructed value reads back, so the type-level half of that criterion is unproven."
  - "That a determining hypothesis's name identifies one hypothesis is a claim about the case that scopes it, and this construct holds no case reference, so nothing here proves more than that the name is carried unchanged."
  - "That what an assessment carries is what a case resolved, which the task states belongs to the behaviour that reads the case."
  - "The assessment node's writing-input rules and its open audience gap, both untouched: the text arrives already written and nothing here presents it."
  - "That the returned assessment is frozen \u2014 a mutation of the value read back would be refused or ignored depending on a strict-mode setting nothing in this repository has chosen, so asserting it would prove the setting."
  - "The implementation's inferences about source layout and extensionless relative import specifiers, which these tests exercise only incidentally through their own import path \u2014 a rearrangement or a different module resolution mode breaks the file rather than an assertion in it."
  - "The type-only modules under src/knowledge/ and src/glossary/ declare shapes and no runtime behaviour, so nothing asserts them beyond their use through a constructed assessment."
---

## What it is

Nine tests over `createAssessment`, one file mirroring the path of `src/investigation/assessment.ts` under the standard's unit subtree.
Each of the task's five criteria has at least one test that would fail if the criterion stopped holding, and each of the implementation's two behavioural inferences has a test that pins the choice.
Every value the tests carry is a placeholder chosen to be distinguishable and nothing else, so no member of the open outcome, action or recipient vocabularies is written anywhere in them.

## Notes

The tests arrange, act and assert in that order and visibly, each arranging its own parts, so no test depends on another having run and none leaves state behind.
No stand-in appears anywhere — the construct has no boundary to stand in for, and every assertion is over a value `createAssessment` returned.
The copy-on-construct tests mutate the object handed in through an ordinary mutable binding rather than a type assertion, so the shared-object failure is observed rather than asserted around.
The two tests for exactly one resolution are the runtime half of a criterion whose other half is a type declaration, and the untested entry says so rather than letting the pair read as complete coverage.
Choosing `node:test` was unavoidable and is not a decision the project made — it is recorded so a reader who finds these files unrunnable knows where the choice came from.
Nothing in the implementation was changed and nothing was written to make a test pass.
The author recorded no disagreement with the implementation, so this record carries no contested entry.
