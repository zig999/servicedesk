---
title: "Proof that an assessment carries a resolution and reads its parts back, re-delivered"
summary: "What proves task/published-case/assessment-record over the unchanged createAssessment — ten tests covering each criterion and each of the implementation's three recorded inferences, with what neither note's named accident lets a test exclude stated as untested."
implementation: sha256:f72e793ee621a9963358160c34f4e853a8bbfdb598a07fb6a3197309f527452c
tests:
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the resolution it was constructed with"
    proves: "An assessment reads back the resolution it was constructed with."
    fails_when: "the constructed assessment's resolution differs in any part from the one handed in — a dropped, renamed, defaulted or rewritten outcome, action or recipient name, or no resolution carried at all"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "carries only one resolution when it is handed a part naming a second one"
    proves: "An assessment carries exactly one resolution."
    fails_when: "a constructed assessment carries any slot beyond its resolution, its determining hypothesis and its text — so a second resolution handed in reaching the value, or another slot joining the single one, breaks it"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads its resolution back as one resolution and not as a collection of them"
    proves: "An assessment carries exactly one resolution."
    fails_when: "the resolution slot comes to hold a collection rather than one resolution"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the determining hypothesis it was constructed with, by name"
    proves: "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
    fails_when: "the determining hypothesis's name is dropped, altered, replaced or read back as anything other than the name the assessment was constructed with"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "constructs an assessment given no determining hypothesis rather than refusing it"
    proves: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
    fails_when: "construction raises when no determining hypothesis is given — a refusal path, a required-field check, or anything reading the absent hypothesis and throwing"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back no determining hypothesis when it was constructed without one"
    proves: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none — and the implementation's inference that absence is the optional field left undefined, with no sentinel value and no wrapper type."
    fails_when: "the absent hypothesis reads back as a substituted name, an empty string, a sentinel value or a wrapper object instead of the absent value"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "accepts a determining hypothesis and its absence alike beside one and the same resolution"
    proves: "the implementation's inference that the pairing of a determining hypothesis with the kind of resolution beside it is not checked at construction — a hypothesis alongside any resolution, or none alongside any, constructs — so the choice the task's second UNDERDETERMINED note describes is pinned as stated rather than left incidental."
    fails_when: "createAssessment begins to check the pairing — refusing a determining hypothesis beside some resolution, or requiring one beside another — so one of the two constructions over the same resolution throws or reads back a shape other than the one given"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the text it was constructed with, character for character"
    proves: "An assessment reads back the text it was constructed with."
    fails_when: "the text is trimmed, its line break joined or normalized, its whitespace collapsed, or it is truncated, escaped or otherwise not the string the assessment was constructed with"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the outcome it was constructed with after the resolution handed in is changed"
    proves: "the implementation's inference that reading back the resolution unchanged means surviving later mutation of the object handed in, so the resolution is copied whole rather than shared."
    fails_when: "the constructed assessment shares the resolution object it was handed, so a later change to that object changes what the assessment reads back"
  - file: "src/__tests__/unit/investigation/assessment.spec.ts"
    name: "reads back the action it was constructed with after the referral handed in is changed"
    proves: "the same copy-on-construct inference, at the referral embedded inside the resolution — the copy is whole, not shallow."
    fails_when: "the embedded referral is shared rather than copied — a shallow copy of the resolution carrying the same referral object through breaks this while leaving the outcome test passing"
not_applicable:
  - edge_case: "constructing with no resolution, or with no text"
    why: "both are declared required, the construct has no runtime refusal path, and no bound node states what refusing an absent part would answer; a call reaching it would defeat the declaration to observe behaviour nothing specifies."
  - edge_case: "constructing with an empty text, or an empty outcome, action, recipient or hypothesis name"
    why: "each name is bound by identity and the text is carried as given, with no bound node placing a validation at this construct; a test either way would fix a decision the base has not made."
  - edge_case: "a boundary at each end of a stated range"
    why: "no bound node states a length, count or range for any part an assessment carries, so there is no end to sit at."
  - edge_case: "an empty collection where one comes back"
    why: "an assessment carries no collection — one resolution, one optional hypothesis name, one text — and the referral is a pair of names, not a list."
  - edge_case: "a duplicate where uniqueness is claimed"
    why: "the only uniqueness claimed is that two hypotheses of one case never share a name, scoped to the case; this construct holds no case reference and one hypothesis name, so no duplicate can be presented to it."
  - edge_case: "an operation against state that forbids it"
    why: "construction is a single pure call over no state and the construct has no lifecycle, so there is no state a call could be attempted against."
  - edge_case: "a dependency that fails or answers slowly"
    why: "the construct calls nothing outside the language runtime — no store, network, filesystem or external service."
  - edge_case: "two operations against one subject at once"
    why: "construction returns a new value and mutates nothing shared, so concurrent calls have no common subject; the one shared-object risk — two assessments built over one resolution object — is what the two copy-on-construct tests exercise."
untested:
  - "The task's first UNDERDETERMINED note: that the resolution an assessment carries is one a case resolved rather than an outcome-and-referral pair assembled at the call site. The construct never sees a case and a resolution carries no provenance to read back, so a test excluding the named implementation would assert a guarantee this construct does not make; the task's own notes place that guarantee with the behaviour that reads the case and produces the assessment, outside this task."
  - "The task's second UNDERDETERMINED note, in its refusing half: the pairing the base refuses — a determining hypothesis beside a fallback resolution, or none beside a hypothesis-borne one — cannot be presented to this construct, because a resolution carries no marker distinguishing the two kinds. The pairing test above pins the recorded inference that nothing is checked; it records the accident the note names rather than excluding it, and nothing at this construct can exclude it."
  - "The repository holds no package manifest, compiler configuration or test harness, so none of these tests has been executed or type-checked; the standard's STK-10 names Vitest through the project's test script, and with no test script and no Vitest present the rule cannot be followed — the file stays on node:test, the earlier delivery's recorded fallback, rather than importing a runner the project has not installed."
  - "That the assessment declares exactly one required resolution slot — not optional, not a list — is a fact the compiler holds, and no compiler runs here; the two runtime tests reach only what a constructed value reads back."
  - "That the determining hypothesis's name identifies exactly one hypothesis is a claim about the case that scopes it; the construct holds no case reference, so nothing here proves more than that the name is carried unchanged."
  - "That the returned assessment is frozen: mutating the readback would be refused or silently ignored depending on a strict-mode setting nothing in this repository has chosen, and no criterion states holder-side immutability, so asserting Object.isFrozen would pin the freezing mechanism rather than a stated behaviour."
---

## What it is

Ten tests in one file mirroring src/investigation/assessment.ts under the standard's unit subtree, where every criterion and every one of the implementation's three recorded inferences has a test that fails when it stops holding, and both UNDERDETERMINED notes are answered in untested because each names a property this construct cannot itself check.

## Notes

The one change from the earlier proof is the test pinning the unchecked hypothesis–resolution pairing, added because the re-delivered implementation record states that choice as an inference; the nine prior tests were kept as written, the implementation was not touched, and nothing here is contested.
The standard's STK-10 names Vitest through the project's test script, and with no manifest, script or Vitest in the repository the file stays on node:test, the earlier delivery's recorded fallback, disclosed in untested.
