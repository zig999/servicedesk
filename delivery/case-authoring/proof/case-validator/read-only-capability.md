---
title: "Every collected concept has a read-only capability — proof"
summary: "Tests over src/knowledge/every-collected-concept-has-a-read-only-capability.ts proving all four criteria, excluding both UNDERDETERMINED implementations the binding named, and making the no-invocation criterion fail on an actual call rather than on a well-worded assertion."
implementation: sha256:9ec0b67a7e09d19fae21a2a284f0f50e4eed2eece53cabfc07ded1e0a09b3652
tests:
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses a case collecting a concept when no capability is registered at all"
    proves: "A case collecting a concept that no capability answers is refused by this check."
    fails_when: "the check answers no refusal (or throws) when the capabilities list is empty and a hypothesis collects a concept"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses a case collecting a concept that no registered capability names"
    proves: "A case collecting a concept that no capability answers is refused by this check. — the same criterion where the registry is non-empty but names a different concept"
    fails_when: "the check answers no refusal when a registered but unrelated capability is present"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses a case collecting a concept whose only naming capability is not read-only"
    proves: "A case collecting a concept whose answering capability is not read-only is refused by this check."
    fails_when: "the check treats a capability whose nature field is not 'read-only' as answering the concept"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses a case collecting a concept whose only naming capability is read-only but declares no output schema, proving the check reads the rule's full statement rather than the read-only half alone"
    proves: "the task's first UNDERDETERMINED note — excludes the implementation that accepts any read-only capability without reading that it declares an output schema"
    fails_when: "the check accepts a read-only, matching capability that carries no outputSchema field as answering the concept"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses a case collecting a concept whose only naming capability is read-only but declares no timeout, over the other declaring clause the rule states"
    proves: "the same UNDERDETERMINED note, over the timeout declaring clause"
    fails_when: "the check accepts a read-only, matching capability that carries no timeout field as answering the concept"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "does not refuse a case whose every collected concept is answered by a registered read-only capability declaring both an output schema and a timeout"
    proves: "A case whose every collected concept is answered by a read-only capability is not refused by this check."
    fails_when: "the check produces any refusal when every collected concept has a fully-declaring, read-only, matching capability"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "does not refuse a concept whose answering capability declares a timeout of zero, deciding on presence rather than the value"
    proves: "the implementation's own recorded reading of timeout by the `in` operator (presence), never by truthiness"
    fails_when: "the check reads the timeout's truthiness instead of its presence and wrongly refuses a capability declaring timeout 0"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "does not refuse a concept whose answering capability declares an empty output schema, deciding on presence rather than its contents"
    proves: "the implementation's recorded reading of outputSchema by presence, never by its contents"
    fails_when: "the check refuses a capability whose outputSchema is declared but empty"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses a concept differing from a registered capability's declared concept only by letter case, matching by exact character comparison"
    proves: "the task's second UNDERDETERMINED note — excludes the implementation that matches a collected concept to a capability's declared concept case-insensitively"
    fails_when: "the check answers no refusal when the only registered capability's concept differs from the collected one only in letter case"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "answers the refusal naming the rule, the offending hypothesis and concept, and the rule's own stated text"
    proves: "the refusal construct the check produces — rule identifier, hypothesis, offendedTerm and text — matches the rule node's own statement"
    fails_when: "any field of the produced refusal differs from the rule's identifier, the offending hypothesis's name, the offending concept's name, or the rule's stated text"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses only the hypothesis whose collected concept has no answering capability, leaving the hypothesis whose concept is answered unrefused"
    proves: "criteria 1 and 3 together, across two hypotheses of one case"
    fails_when: "the answered hypothesis is also refused, or the unanswered one is not"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "refuses only the concept within one hypothesis that has no answering capability, not the concept that is answered"
    proves: "criteria 1 and 3 together, within one hypothesis collecting two concepts"
    fails_when: "the answered concept is also refused, or the unanswered one is not"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "produces one refusal per offending concept, in the order collected, when a hypothesis collects two concepts that are both unanswered"
    proves: "the check refuses every offending concept rather than stopping at the first, in collection order"
    fails_when: "fewer than two refusals are produced, or their order does not match the collected order"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "produces one refusal per occurrence when a hypothesis collects the same unanswered concept twice"
    proves: "the check does not deduplicate refusals by concept name — each collected position is its own refusal"
    fails_when: "only one refusal is produced for the two duplicate occurrences"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "does not refuse a concept when one of two registered capabilities naming it is not fully declaring but the other is"
    proves: "criterion 3 under duplicate registration — some answering capability among several is enough"
    fails_when: "the check refuses because it inspected only the first matching capability rather than every one"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "walks a case declaring no hypotheses without throwing, answering no refusal"
    proves: "the check is safe over the malformed case (edge case: absent/empty hypotheses), consistent with the case-level refusal belonging to a sibling check"
    fails_when: "the check throws, or answers a non-empty refusal list, for a case declaring no hypotheses"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "walks a hypothesis whose collects list is empty without throwing, answering no refusal for it"
    proves: "the check is safe over a hypothesis collecting nothing (edge case: empty collection)"
    fails_when: "the check throws, or answers a non-empty refusal list, for a hypothesis whose collects list is empty"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "freezes the array it answers with on the refusing path"
    proves: "the check's answer is frozen, matching every sibling check's own contract"
    fails_when: "Object.isFrozen is false on the refusing path's answer"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "freezes the array it answers with on the passing path"
    proves: "the same freezing contract on the empty-answer path"
    fails_when: "Object.isFrozen is false on the passing path's answer"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "decides the check without invoking the capability record, even where the record could be invoked as a function"
    proves: "Deciding this check over a case invokes no capability. — the call half"
    fails_when: "the check calls the capability record as a function; the Proxy's apply trap throws in that case, failing the test on that throw rather than on a wrong answer"
  - file: src/__tests__/unit/knowledge/every-collected-concept-has-a-read-only-capability.spec.ts
    name: "decides the check without reading the case's declared subject type"
    proves: "Deciding this check over a case invokes no capability. — the \"no derivation from the case's subject\" half the implementation record itself cites as evidence for that criterion"
    fails_when: "the check reads draftCase.subjectType for any reason; the guarded getter throws in that case"
not_applicable:
  - edge_case: "a dependency that fails or answers slowly"
    why: "criterion 4 forbids this check from invoking any dependency at all, and the invocation-guard test above proves none is called; there is no dependency here that could fail or answer slowly"
  - edge_case: "two operations against one subject at once"
    why: "the check is a pure synchronous function over immutable inputs with no shared mutable state across calls; there is no state two concurrent decisions could race over"
  - edge_case: "an operation attempted against state that forbids it"
    why: "this is a read-only validation check, not a state transition — it never writes, so there is no forbidden state to attempt against"
  - edge_case: "a boundary at each end of the timeout's numeric range"
    why: "the base leaves the timeout's unit and any bound unstated (the task's own waived gap on attributes.timeout.unit), and this check reads the timeout's presence only, never its value — the zero-value test already proves presence-over-truthiness is the whole of what the check reads"
untested:
  - "whether a capability's own declared name or version ever participates in matching a collected concept to it. The implementation reads only .concept, .nature, and the presence of .timeout/.outputSchema, never .name or .version, but no criterion or inference states this as a decision to pin, so no test asserts on it either way"
  - "the concept's other clauses — glossary existence, ttl, declared fields, subject-type acceptance — named in the task's REMAINDER note as belonging to the sibling checks; this record does not test them because this check does not read them, and their own proof sits under the sibling checks' own test files (e.g. every-collected-concept-declares-a-ttl.spec.ts)"
  - "how this check's own refusal composes with others inside validate() — ordering across checks, the every-refusal guarantee, two-positions-are-two-refusals — which the task's final Notes entry assigns to validation-run's own binding and which validation.spec.ts already proves; not repeated here since this task's own criteria do not reach it"
---

## What it is

The tests proving `src/knowledge/every-collected-concept-has-a-read-only-capability.ts` against `task/case-validator/read-only-capability`, including a Proxy-guarded fixture that fails the no-invocation criterion on an actual call rather than on assertion alone.

## Notes

None.
