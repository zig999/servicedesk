---
title: "Proof for the validation run over one case under edit"
summary: "Thirteen tests holding validate() at src/knowledge/validation.ts to the task's five criteria, the two answers the binding's UNDERDETERMINED notes demanded, and the choices the implementation recorded."
implementation: sha256:b35fed45b368eaed9914c1e3f66e6952aaf290b1e638eb3bedeca53e6c83be2f
tests:
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "answers no refusal for a case when no check is registered"
    proves: "A run with no check registered does not refuse the case it is given."
    fails_when: "validate() over an empty checks list answers anything but an empty refusal list — a refusal it invented, a verdict object, or a non-list"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "answers no refusal when every registered check refuses nothing"
    proves: "A run whose every registered check refuses nothing does not refuse the case it is given."
    fails_when: "a run over only silent checks still answers a refusal, so the case reads as refused where nothing refused it"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "refuses the case it is given when its one registered check refuses it"
    proves: "A run with one registered check that refuses the given case refuses that case."
    fails_when: "the run drops or swallows the only refusal produced and answers empty, so a refused case reads as passing"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "reports both refusals when two registered checks both refuse the case"
    proves: "A run with two registered checks that both refuse the given case reports both refusals."
    fails_when: "the run stops at the first refusing check, or loses one check's refusal behind the other's"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "reports no refusal that no registered check produced"
    proves: "A run reports no refusal that no registered check produced."
    fails_when: "the answer carries anything beyond the one refusal produced — a refusal synthesized by the run, duplicated on the way through, or attributed to a check that refused nothing"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "reports the two refusals one check produced at two positions as two, never one"
    proves: "UNDERDETERMINED, from the binding — the criteria exercise at most one refusal per refusing check, while the every-refusal rule requires the answer to carry every refusal produced, including the two a single check produces at two positions, which the two-positions rule makes two and never one; what passes is a run collapsing the two refusals one check produced at two positions into one, which the base refuses."
    fails_when: "the run merges, deduplicates or collapses the two refusals one check produced at two positions — same rule, same text, two positions — into one, which is exactly the implementation the note names"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "keeps two interchangeable refusals produced by two checks as two, one per production"
    proves: "rule/knowledge/a-validation-answers-with-every-refusal as the implementation record states it — the count answered equals the count produced — over the case the two-positions test cannot reach: two refusals that are field-for-field the same value"
    fails_when: "the run deduplicates refusals by value, answering fewer refusals than its checks produced"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "answers a refusal carrying the rule that refused, the position where it sits, and the text for the curator"
    proves: "UNDERDETERMINED, from the binding — no criterion states what a reported refusal carries, while the bound refusal construct requires the rule's identifier, the position where it sits at one, and the text for the curator; what passes is a run reporting refusals as opaque messages or a bare count, which the refusal definition refuses."
    fails_when: "the run reports refusals as opaque messages or a bare count — the implementation the note names — or answers a refusal missing the rule identifier, the position, or the curator text, or with that text trimmed or normalized on the way through"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "answers the collected refusals themselves as the whole of its answer"
    proves: "the inference the implementation recorded — the run's answer is the collected refusals themselves, the case refused exactly when that answer is non-empty, with no separate verdict value — so the choice is pinned rather than incidental"
    fails_when: "validate() answers a wrapper, a refused flag or any verdict value beside or instead of the refusal list"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "hands each registered check the whole case under edit it was given"
    proves: "the inference the implementation recorded — a registered check is a function from the whole case under edit to the refusals it produced — and the aggregate's clause that checks run over the whole"
    fails_when: "the run hands a check a projection or a different case than the one it was given, or runs a registered check other than exactly once"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "answers refusals in check-registration order and, within one check, in the order produced"
    proves: "the inference the implementation recorded — refusals are answered in check-registration order and, within one check, in the order produced"
    fails_when: "the run sorts, reverses or interleaves refusals — the produced order deliberately disagrees with the lexicographic order of the rule names, so a sorted answer fails on its own"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "reads back the refusal a check produced even after the value the check returned is changed"
    proves: "the inference the implementation recorded — each collected refusal is copied field-for-field on collection, so the answer reads back what was produced even if a returned object is mutated afterwards"
    fails_when: "the run stores the reference a check returned instead of copying on collection, so a later change to the produced value changes what the answer reads back"
  - file: "src/__tests__/unit/knowledge/validation.spec.ts"
    name: "answers the refusal a check produced over a case declaring no hypothesis at all"
    proves: "the divergence the implementation disclosed — DraftCase admits an empty hypotheses list so the malformed case every check must walk is representable as validation input — together with the refusal definition's optional position, a refusal existing with no hypothesis to name"
    fails_when: "the run or the DraftCase shape rejects a case whose hypotheses list is empty, or a positionless refusal is dropped, given an invented position, or altered on the way through"
not_applicable:
  - edge_case: "absent or null case or checks argument"
    why: "the compiler forbids it at every call site, and this run sits behind no parsing boundary — the project's own standard places refusal of absent input at the validation boundary (EDG-01), which this module is not"
  - edge_case: "a boundary at each end of a stated range"
    why: "no criterion and no bound node states a numeric range over the run — any number of checks and any number of refusals are equally lawful"
  - edge_case: "an operation against state that forbids it"
    why: "validate() is a pure function over its arguments and holds no state in which an operation could be forbidden"
  - edge_case: "a dependency that fails or answers slowly"
    why: "the run's only collaborators are the registered checks, and what the run answers when a check itself throws is stated by no bound node — the safe-over-a-malformed-case clause binds each check's own implementation, the binding's REMAINDER — so a test here would pin a guarantee nobody made"
  - edge_case: "two operations against one subject at once"
    why: "the run is a synchronous pure function with no shared state, and no bound node states concurrent behavior"
  - edge_case: "a duplicate where uniqueness is claimed"
    why: "uniqueness of refusals is claimed nowhere — the base claims the opposite, the count answered equals the count produced — so the case applies inverted and is tested by the interchangeable-refusals test"
untested:
  - "the implementation's first inference — that validate() takes the case under edit and not the published Case — is a compile-time fact of the type declarations, erased at runtime, so no runtime assertion exercises it"
  - "that the answered list and its refusals resist mutation by their consumer: the readback test proves copy-on-collection, which is the behavior the inference's own source states, and the Object.freeze itself is a construction detail no bound node states"
---

## What it is

The spec at src/__tests__/unit/knowledge/validation.spec.ts, holding validate() at src/knowledge/validation.ts to the task's five criteria, to the two answers the binding's UNDERDETERMINED notes demanded — no collapsing of refusals and the full refusal construct — and to the ordering, copying, whole-case and empty-hypotheses choices the implementation recorded.

## Notes

Every check the spec registers is written for the demonstration, as the task's notes provide — a parameter of the run standing in for no delivered business logic — and every name is a placeholder because every vocabulary the run touches is open.
The inference that the run's input is the case under edit rather than the published Case is compile-time only and is recorded as untested rather than claimed.
The spec runs under node:test beside the two existing specs, which is the suite this tree actually has; the pinned standard's STK-10 names Vitest and a test script, neither of which exists in this tree, and introducing a runner to satisfy the rule's letter would break its own point — no second runner — so the departure is said here plainly rather than hidden.
