---
title: "A decided evaluation's citations, proved"
summary: "Tests over Evaluation.citations (src/investigation/evaluation.ts) and isRefusedForItsCitations (src/investigation/a-decided-evaluation-cites-evidence.ts), covering every criterion of task/published-case/evaluation-citations, every inference the implementation record states, and the binding's asymmetry and identity notes; plus a check that the pre-existing key-enumeration assertion in evaluation.spec.ts still holds unchanged."
implementation: sha256:d501b869296c36e049220c0813aab095fe8492ae25ffc6ebfe2534c380355c18
tests:
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back at least one citation given to a confirmed evaluation"
    proves: "An evaluation that confirms its hypothesis reads back at least one citation."
    fails_when: "createEvaluation drops a given citation, or a confirmed construction with citations reads back none"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back at least one citation given to a refuted evaluation"
    proves: "An evaluation that refutes its hypothesis reads back at least one citation."
    fails_when: "createEvaluation drops a given citation, or a refuted construction with citations reads back none"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back the concept and the field of a citation, each by the exact name given"
    proves: "A citation reads back the concept and the field it cites, each by name."
    fails_when: "the concept or the field read back differs from the exact name given at construction"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back every citation given, in the order given"
    proves: "the round-trip the citations slot offers extends past a single citation: a list of several is read back whole and in order"
    fails_when: "one citation of several is dropped, duplicated or reordered on the way through construction"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back an empty list of citations when a construction gives one, refusing nothing for it"
    proves: "the recorded inference that the citation-count obligation is enforced entirely by the standalone check, never by createEvaluation itself"
    fails_when: "createEvaluation throws, or silently drops the empty list, for a confirmed or refuted construction giving citations: []"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "constructs a confirmed evaluation giving no citations without refusing it"
    proves: "the same inference from its other side: createEvaluation adds no new refusal for the missing-citations case either"
    fails_when: "createEvaluation starts throwing for a confirmed or refuted construction that gives no citations"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "omits the citations key entirely when a construction gives none"
    proves: "the recorded inference that a construction giving no citations omits the key rather than setting it to the absent value"
    fails_when: "the frozen evaluation carries a 'citations' key (even set to undefined) when none was given"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back the citations key when a construction gives citations"
    proves: "the same inference's contrasting half: the key is present exactly when citations are given"
    fails_when: "the frozen evaluation omits 'citations' even though citations were given"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back its citations unchanged after the array handed in for them is mutated"
    proves: "the files entry's stated copy-on-construct guarantee for the citations list"
    fails_when: "the evaluation's citations reflect a mutation made to the array handed in after construction"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "reads back a citation unchanged after the object handed in for it is mutated"
    proves: "the same guarantee one level deeper: each citation is copied, not referenced"
    fails_when: "the evaluation's citation reflects a mutation made to the citation object handed in after construction"
  - file: src/__tests__/unit/investigation/evaluation.spec.ts
    name: "refuses a mutation attempt on a citation read back, keeping the value it was constructed with"
    proves: "a citation is a frozen value object embedded in the evaluation, per definition/investigation/citation"
    fails_when: "a citation read back from an evaluation can be mutated in place, or the evaluation reflects such a mutation"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "refuses a confirmed evaluation carrying no citation"
    proves: "An evaluation that confirms or refutes and carries no citation is refused."
    fails_when: "isRefusedForItsCitations answers false for a confirmed evaluation with no citations"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "refuses a refuted evaluation carrying no citation"
    proves: "An evaluation that confirms or refutes and carries no citation is refused. (refuted half)"
    fails_when: "isRefusedForItsCitations answers false for a refuted evaluation with no citations"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "refuses a confirmed evaluation whose citations list is explicitly empty, the same as one carrying none at all"
    proves: "the no-citation refusal reaches the empty-list case as well as the absent one — the boundary at zero citations"
    fails_when: "isRefusedForItsCitations treats an explicitly empty citations array differently from an absent one"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "does not refuse an inconclusive evaluation carrying no citation"
    proves: "An evaluation whose verdict is inconclusive is not refused for carrying no citation."
    fails_when: "isRefusedForItsCitations answers true for an inconclusive evaluation with no citations"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "does not refuse an inconclusive evaluation for this rule, whatever its citations hold, proving the obligation is asymmetric"
    proves: "the Notes entry that the inconclusive-verdict criterion asserts only that this obligation does not refuse it — the exemption holds regardless of what an inconclusive evaluation's citations contain, not only where it carries none"
    fails_when: "isRefusedForItsCitations refuses an inconclusive evaluation carrying a citation that would fail the cross-referencing checks were the verdict decided"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "refuses an evaluation citing a concept its hypothesis does not collect"
    proves: "An evaluation citing a concept its hypothesis does not collect is refused. — and, per the binding's own note, the same mechanism criterion 6 (a refused non-name reference) relies on"
    fails_when: "isRefusedForItsCitations does not refuse an evaluation citing a concept the given hypothesis's collects list excludes"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "refuses an evaluation citing a field the cited concept does not declare"
    proves: "An evaluation citing a field the cited concept does not declare is refused. — and, per the binding's own note, the same mechanism criterion 6 relies on for the field half"
    fails_when: "isRefusedForItsCitations does not refuse an evaluation citing a field the concept's declared observationFields excludes"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "is not refused by this rule when every citation names a collected concept and a field that concept declares"
    proves: "An evaluation whose every citation names a collected concept and a field that concept declares is not refused by this rule."
    fails_when: "isRefusedForItsCitations refuses an evaluation none of whose citations names an uncollected concept or an undeclared field"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "refuses an evaluation where only one of several citations is invalid, one bad citation being enough"
    proves: "the doc comment's own stated behavior that one bad citation among several is enough to refuse the whole evaluation — an edge case of criteria 7/8 over a multi-citation evaluation"
    fails_when: "isRefusedForItsCitations answers false for an evaluation carrying one valid and one invalid citation"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "is not refused by this rule for citing a concept the given glossary does not publish"
    proves: "the recorded inference that a citation naming a concept the given glossary does not publish is not refused by this rule, following the sibling case-validator checks' own convention"
    fails_when: "isRefusedForItsCitations refuses a citation whose concept the given glossary does not publish, rather than leaving that refusal to the terms-exist-in-the-glossary check"
  - file: src/__tests__/unit/investigation/a-decided-evaluation-cites-evidence.spec.ts
    name: "reads the given hypothesis parameter for its collects list rather than checking its name against the evaluation"
    proves: "the recorded inference that isRefusedForItsCitations trusts the given hypothesis rather than checking hypothesis.name against evaluation.hypothesis"
    fails_when: "isRefusedForItsCitations starts refusing (or otherwise treats differently) an evaluation whose given hypothesis parameter is named differently from evaluation.hypothesis but still collects the cited concept"
not_applicable:
  - edge_case: "two citations of one evaluation naming the same concept and field"
    why: "no bound node — the citation, hypothesis or evaluation definitions — states a uniqueness requirement over an evaluation's own citations, unlike the base's explicit uniqueness rule for hypothesis names within a case; asserting a refusal or an acceptance here would state a domain fact no node holds"
  - edge_case: "two calls to isRefusedForItsCitations against overlapping state, or one evaluation checked concurrently against two glossaries"
    why: "isRefusedForItsCitations is a pure function of its three given arguments with no shared or mutable state of its own — every argument it reads is frozen by createEvaluation or built fresh per test — so concurrent calls cannot interfere with one another; there is nothing here a concurrency test could observe"
  - edge_case: "the glossary or hypothesis dependency being slow, unavailable, or answering in an unexpected shape"
    why: "the implementation's own doc comment states plainly that nothing here calls anything to obtain a fact — the citation is read as recorded, never produced — and both the hypothesis and the glossary are given in-memory values with no I/O, retry or timeout involved anywhere in this module"
  - edge_case: "a citation naming a concept or field that differs from a published name only by letter case or by leading/trailing whitespace"
    why: "exact-character comparison for a glossary term is rule/glossary/a-lookup-matches-a-published-name-exactly, encoded and proved once in src/glossary/lookup.ts and src/__tests__/unit/glossary/lookup.spec.ts; this rule's own citesADeclaredField and citesACollectedConcept read through that same shared lookup and a direct === comparison, so retesting case-sensitivity here would duplicate a proof that already exists rather than prove anything this rule adds"
untested:
  - "that a false answer from isRefusedForItsCitations is read as non-refusal by this rule alone and never as acceptance by any other rule (criterion 9's second half) is not independently observable in the delivered code: no other refusal check composes with this one anywhere in the tree yet — the diagnose process's judging act that would call it is explicitly deferred by this task's own binding — so there is nothing yet for a test to exercise beyond the boolean this function already returns about itself"
---

## What it is

The tests proving `src/investigation/citation.ts`, `src/investigation/evaluation.ts` and `src/investigation/a-decided-evaluation-cites-evidence.ts` against `task/published-case/evaluation-citations`, extending the already-delivered `evaluation.spec.ts` and adding a new spec for the standalone check.

## Notes

None.
