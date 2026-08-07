---
title: "Outcome resolution: the assessment a published case answers with"
summary: "Fourteen behavioral tests plus three inference/edge tests over src/knowledge/outcome-resolution.ts, proving each of the task's eleven criteria, the UNDERDETERMINED exclusion the binding named (three-or-more confirmations still select the earliest-listed hypothesis), and the two inferences the implementation record declared."
implementation: sha256:0afa07787208f02b293878c47c4b18a550f78a3c5d45dd73670e486ed2529cda
tests:
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "names the sole confirmed hypothesis as determining"
    proves: "A case in which exactly one hypothesis confirms answers with an assessment naming that hypothesis as determining."
    fails_when: "resolveOutcome answers with no determining hypothesis, or with a name other than the one hypothesis that confirmed"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "names the confirmed hypothesis the case lists earliest as determining, when two confirm"
    proves: "A case in which two hypotheses confirm answers with an assessment naming as determining the confirmed hypothesis the case lists earliest in its declared order."
    fails_when: "resolveOutcome names the later-listed confirmed hypothesis as determining, or reads precedence from the evaluations' own order instead of the case's declared order (the evaluations list B before A while the case declares A before B)"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "names the confirmed hypothesis the case lists earliest as determining, when three or more confirm"
    proves: "UNDERDETERMINED, from the binding — the case node and the outcome rule say the answer is the first confirmed hypothesis in declared order for any count; this excludes an implementation that special-cases exactly one and two confirmations and picks any other confirmed one once three or more confirm"
    fails_when: "resolveOutcome names B or C as determining instead of A when all three confirm — exactly what an implementation special-cased to one/two confirmations, falling back to an arbitrary confirmed hypothesis at three or more, would do"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries the resolution the case declared for the sole confirmed hypothesis"
    proves: "A case in which exactly one hypothesis confirms answers with an assessment carrying the resolution the case declared for that hypothesis."
    fails_when: "answer.resolution is not deep-equal to the confirmed hypothesis's own declared resolution"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries the resolution declared for the determining hypothesis, not the other confirmed one, when two confirm"
    proves: "A case in which two hypotheses confirm answers with an assessment carrying the resolution the case declared for the hypothesis it names as determining."
    fails_when: "answer.resolution matches B's resolution instead of A's (the determining, earlier-listed one), or matches neither"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries the case's no-data fallback when no hypothesis confirms and the fallback selection yields it"
    proves: "A case in which no hypothesis confirms and whose fallback selection yields its no-data fallback answers with an assessment carrying that fallback."
    fails_when: "answer.resolution is not deep-equal to the case's own noDataFallback (e.g. the hypothesesExhaustedFallback is carried instead, or a value composed anew)"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries the case's hypotheses-exhausted fallback when no hypothesis confirms and the fallback selection yields it"
    proves: "A case in which no hypothesis confirms and whose fallback selection yields its hypotheses-exhausted fallback answers with an assessment carrying that fallback."
    fails_when: "answer.resolution is not deep-equal to the case's own hypothesesExhaustedFallback"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "names no determining hypothesis when no hypothesis confirms"
    proves: "A case in which no hypothesis confirms answers with an assessment naming no determining hypothesis."
    fails_when: "answer.determiningHypothesis carries any value other than undefined when no hypothesis confirmed"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries only the outcome of the resolution that was resolved, and no other outcome the case holds, on the confirmed path"
    proves: "The outcome the assessment carries is the outcome of the one resolution the case resolved for this answer, and no other outcome the case holds appears in it."
    fails_when: "answer.resolution.outcome equals B's, the no-data fallback's, or the hypotheses-exhausted fallback's outcome instead of the confirmed hypothesis A's own"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries only the outcome of the resolution that was resolved, and no other outcome the case holds, on the fallback path"
    proves: "The outcome the assessment carries is the outcome of the one resolution the case resolved for this answer, and no other outcome the case holds appears in it (fallback path)."
    fails_when: "answer.resolution.outcome equals A's, B's, or the no-data fallback's outcome instead of the hypotheses-exhausted fallback's own, when none confirms and every evidence is ok"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries only the referral of the resolution that was resolved, and no other referral the case holds, on the confirmed path"
    proves: "The referral the assessment carries is the referral of that same resolution, and no other referral the case holds appears in it."
    fails_when: "answer.resolution.referral does not deep-equal A's own {action, recipient}, or matches B's or a fallback's referral instead"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "carries only the referral of the resolution that was resolved, and no other referral the case holds, on the fallback path"
    proves: "The referral the assessment carries is the referral of that same resolution, and no other referral the case holds appears in it (fallback path)."
    fails_when: "answer.resolution.referral does not deep-equal the no-data fallback's own {action, recipient}, or matches a hypothesis's or the other fallback's referral instead"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "still reads back the later-listed confirmed hypothesis's evaluation with its confirming verdict, once the answer is produced"
    proves: "In a case in which two hypotheses confirm, the evaluation of the later-listed confirmed hypothesis still reads back its confirming verdict once the answer is produced."
    fails_when: "the evaluations array differs from its pre-call snapshot, or the later-listed confirmed hypothesis's evaluation no longer reads verdict 'confirmed' after resolveOutcome runs"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "marks no hypothesis of the case as superseded when producing the answer"
    proves: "Producing the answer marks no hypothesis of the case as superseded."
    fails_when: "the case's hypotheses array differs from its pre-call snapshot, or any hypothesis gains a 'superseded' own key, after resolveOutcome runs"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "sets determiningHypothesis explicitly to undefined on the fallback path, rather than omitting the key"
    proves: "the implementation's recorded inference that the fallback branch represents an absent determining hypothesis as the key set explicitly to undefined, not omitted from the returned object"
    fails_when: "the returned object on the fallback path has no own 'determiningHypothesis' key at all (Object.prototype.hasOwnProperty returns false)"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "throws rather than silently answering, when an evaluation confirms a hypothesis the case does not declare and so no hypothesis of the case confirms and the fallback selection yields nothing"
    proves: "the implementation's recorded inference that resolveOutcome throws where selectFallback returns undefined despite no hypothesis of the case confirming"
    fails_when: "resolveOutcome returns normally instead of throwing when firstConfirmedHypothesis finds no match among the case's own hypotheses but some evaluation still carries a confirmed verdict, so selectFallback also yields undefined"
  - file: src/__tests__/unit/knowledge/outcome-resolution.spec.ts
    name: "answers with a real resolution rather than throwing or misreading it, when there are no evaluations at all"
    proves: "an empty evaluations list is read the same as an explicit non-confirming verdict on every hypothesis, exercising the same fallback path as criterion 6 and the no-determining-hypothesis criterion under a vacuous input"
    fails_when: "resolveOutcome throws, or answers with anything other than the case's own hypothesesExhaustedFallback and no determining hypothesis, when evaluations is empty and every evidence is ok"
not_applicable:
  - edge_case: "two evaluations naming the same hypothesis (a duplicate verdict), one perhaps confirming and one not"
    why: "rule/investigation/one-evaluation-per-hypothesis guarantees exactly one evaluation per hypothesis upstream, and the task's own binding note leaves that rule deliberately unbound here because this task consumes evaluations and never builds the investigation the rule constrains; a test manufacturing the state that rule forbids would assert behavior over an input the base does not let reach this module"
  - edge_case: "a published case with zero hypotheses"
    why: "a task outside this one (case-has-at-least-one-hypothesis) obliges every published case to declare at least one hypothesis; this task takes a published case as already valid and reads it, so a zero-hypothesis case is a state upstream validation rules out before this module ever runs"
  - edge_case: "two calls to resolveOutcome against the same case and evaluations at once (concurrency)"
    why: "resolveOutcome is a pure, synchronous function reading immutable inputs and returning a new value with no shared mutable state; there is no channel through which two calls could interfere, so no criterion or base node states a concurrent guarantee to test"
  - edge_case: "a numeric boundary (e.g. a limit on how many hypotheses or evaluations may be given)"
    why: "no criterion or bound node states a bounded count for hypotheses or evaluations; the module walks whatever list it is given, and the three-and-more confirmation test already exercises the unbounded-count reasoning the binding raised"
  - edge_case: "the fallback selection's own evidence-interpretation rules (which of the two fallbacks a given evidence shape yields)"
    why: "the binding note is explicit that this task takes selectFallback's yield as given — that choice is task/published-case/fallback-selection's own demonstration, already proved in src/__tests__/unit/knowledge/fallback-selection.spec.ts; retesting it here would give the same rule two homes"
untested:
  - "whether the resolution object returned for a confirmed hypothesis is the very same object reference as the one embedded in the case (rather than a value-equal copy) is not asserted: no criterion requires object identity, only that the assessment 'carries' the resolution the case declared, and a copy with identical fields would still satisfy that wording. Asserting reference identity would over-constrain a criterion-satisfying implementation, so this proof checks values only and leaves the identity question — which the implementation record and the bound rule/investigation/the-outcome-comes-from-the-case do address — unproven at the test level"
  - "the earliest-listed-wins behavior is proven for exactly one, two, and three confirmations; it is not separately exercised at four or more. The three-confirmation test is written to exclude the specific implementation the binding's UNDERDETERMINED note names (one special-cased to counts of one and two), and the general-walk reasoning that follows from Array.prototype.find extends uniformly to any count, but no test pins the fourth data point directly"
---

## What it is

The tests proving `src/knowledge/outcome-resolution.ts` against `task/published-case/outcome-resolution`, exercising precedence over any number of confirmations, both fallback branches, provenance of the outcome and referral, and that no evaluation or hypothesis is disturbed in producing the answer.

## Notes

None.
