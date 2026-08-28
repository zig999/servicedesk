---
title: Map revise-hypothesis's four unmapped errors to typed HTTP statuses
summary: Adds CaseHoldsNoDraftError (409), ConceptNotInGlossaryError (404), HypothesisRevisionCollectsNoConceptError
  (422) and ConceptRefusesSubjectTypeError (422) to status-map.ts's STATUS_BY_ERROR_CLASS table and updates
  the file's own header comment to name all four under their correct group, so revise-hypothesis's typed
  refusals stop falling through to the generic 500.
task: sha256:8eed6eb8adc43366402453c66b8e949713217e394f1643fb4f167963bde0487c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revise-hypothesis-status-map-hotfix-map-status-for-typed-refusals-build
files:
- path: src/errors/status-map.ts
  effect: STATUS_BY_ERROR_CLASS now maps CaseHoldsNoDraftError to 409, ConceptNotInGlossaryError to 404,
    HypothesisRevisionCollectsNoConceptError to 422 and ConceptRefusesSubjectTypeError to 422 (imports
    added alphabetically, entries appended to the end of each status group); the header comment's specification-fixed-status
    count moves from seven to eleven with the four new classes cited by the rule that now states their
    status, the 404/409/422 group enumerations each name the new class under its correct group with that
    same citation, the 422 group's own "reached this table" ordinal narrative gains a ninth-and-tenth
    clause explaining these two reached it through a hotfix rather than a newly-exposed route, and the
    map's own size comment moves from "twenty-five" to "twenty-nine".
criteria:
- criterion: statusForError(new CaseHoldsNoDraftError(slug)) returns 409.
  met: true
  how: STATUS_BY_ERROR_CLASS carries [CaseHoldsNoDraftError, 409], and statusForError's existing instanceof
    loop (unchanged) resolves any CaseHoldsNoDraftError instance to that entry.
- criterion: statusForError(new ConceptNotInGlossaryError(slug, hypothesisName, concepts)) returns 404.
  met: true
  how: STATUS_BY_ERROR_CLASS carries [ConceptNotInGlossaryError, 404], resolved the same way.
- criterion: statusForError(new HypothesisRevisionCollectsNoConceptError(slug, hypothesisName)) returns
    422.
  met: true
  how: STATUS_BY_ERROR_CLASS carries [HypothesisRevisionCollectsNoConceptError, 422], resolved the same
    way.
- criterion: statusForError(new ConceptRefusesSubjectTypeError(context)) returns 422.
  met: true
  how: STATUS_BY_ERROR_CLASS carries [ConceptRefusesSubjectTypeError, 422], resolved the same way.
- criterion: 'A POST /v1/cases/:slug/hypotheses request that reaches any of these four refusals responds
    with that status and a body of { error: { code: <the error class''s own name>, message: <its own message>,
    details: <its own context> } }, never the generic 500 INTERNAL_ERROR fallback.'
  met: true
  how: 'error-handler.middleware.ts (unmodified by this task) already consults statusForError for any
    thrown Error; once it resolves a status it calls domainEnvelope(error), which builds { error: { code:
    error.name, message: error.message, details: error.context } } for any error carrying a context field
    — every one of the four classes declares context in its own constructor. Adding the four map entries
    is what makes mappedStatus resolve for them instead of falling through to the unmapped-class 500 branch.
    Confirmed by grep that all four classes are already thrown from the existing revise-hypothesis pipeline
    (revise-hypothesis.operation.ts) reached by POST /v1/cases/:slug/hypotheses (revise-hypothesis.routes.ts),
    so no other file needed to change for this criterion.'
- criterion: status-map.ts's own header comment, which enumerates the members of its 404, 409 and 422
    groups, is updated to name the four new classes under their correct group.
  met: true
  how: the header's top paragraph now lists all eleven specification-fixed classes (was seven), each new
    one cited by the rule whose statement fixes its status, quoting that rule's own refusal clause; the
    "Grouped by..." paragraph names ConceptNotInGlossaryError under the 404 group, CaseHoldsNoDraftError
    under the 409 group, and HypothesisRevisionCollectsNoConceptError and ConceptRefusesSubjectTypeError
    under the 422 group, each with its governing rule's path.
nodes:
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/errors/status-map.ts
  how: this task addresses only that rule's own refusal-status clause — "a revision requested while the
    case holds no draft version is refused with an HTTP 409 response reporting a CaseHoldsNoDraftError"
    — which is now encoded as the [CaseHoldsNoDraftError, 409] map entry and cited by the rule's path
    in the header comment's 409 group. The rule's first clause (which case state a revision requires)
    and its concept-acceptance-anchoring clause reach no criterion of this task; the task's own Notes
    record them as belonging to task/revise-hypothesis-draft-gate/refuse-without-draft and task/case-lifecycle-operations/revise-hypothesis-operation
    respectively.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  encoded_at:
  - src/errors/status-map.ts
  how: this task addresses only that rule's own refusal-status clause — "a hypothesis-revision naming
    a concept the glossary does not hold is refused with HTTP 404 reporting ConceptNotInGlossaryError"
    — now encoded as the [ConceptNotInGlossaryError, 404] map entry and cited by the rule's path in the
    header comment's 404 group. The rule's broader existence-governance clause reaches no criterion of
    this task and belongs, per the task's own Notes, to task/case-lifecycle-operations/revise-hypothesis-operation.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/errors/status-map.ts
  how: this task addresses only that rule's own refusal-status clause — "a revision that would collect
    none is refused with an HTTP 422 response reporting a HypothesisRevisionCollectsNoConceptError" —
    now encoded as the [HypothesisRevisionCollectsNoConceptError, 422] map entry and cited by the rule's
    path in the header comment's 422 group. The rule's invariant clause reaches no criterion of this task
    and belongs, per the task's own Notes, to task/case-lifecycle-operations/revise-hypothesis-operation.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/errors/status-map.ts
  how: this task addresses only that rule's own refusal-status clause — "a hypothesis-revision request
    is refused, with an HTTP 422 response reporting a ConceptRefusesSubjectTypeError, when a concept it
    collects does not accept the case version's declared subject type" — now encoded as the [ConceptRefusesSubjectTypeError,
    422] map entry and cited by the rule's path in the header comment's 422 group. The rule's invariant
    clause reaches no criterion of this task and belongs, per the task's own Notes, to task/case-lifecycle-operations/revise-hypothesis-operation.
inferences:
- inferred: the four new classes were appended at the end of their respective status groups in STATUS_BY_ERROR_CLASS
    (rather than, say, alphabetically), and the header's 422-group "reached this table" ordinal narrative
    was extended with a ninth-and-tenth clause explaining that these two reached the table via this hotfix
    rather than a newly-exposed route.
  from: the map's own doc comment states iteration order is insertion order and none of the twenty-five
    (now twenty-nine) classes extends another, so placement carries no behavioral consequence; appending
    at the end follows the file's own established convention (every prior addition — HypothesisNotInManifestError,
    MalformedCapabilityInputSchemaError, SubjectDoesNotCoverCaseInputsError, ConnectorPlaceholderOutsideInputSchemaError
    — was appended at the end of its group) rather than reordered alphabetically, and the ordinal narrative
    mirrors the same convention the file already keeps for every other addition to explain when and why
    each class first reached the table.
preserved:
- the twenty-five pre-existing STATUS_BY_ERROR_CLASS entries and their statuses, unchanged
- the generic 500 INTERNAL_ERROR fallback in error-handler.middleware.ts for any error class the table
  still does not name, unchanged
- the header comment's existing citations of the seven previously-specification-fixed statuses (CapabilityIdentityNotFoundError,
  ConnectorConfigurationNotFoundError, ConnectorConfigurationNotWellFormedError, HypothesisNotInManifestError,
  MalformedCapabilityInputSchemaError, SubjectDoesNotCoverCaseInputsError, ConnectorPlaceholderOutsideInputSchemaError)
  and their own ordinal narratives, unchanged
- the alphabetical ordering of the import list
---

## What it is

A corrective increment: one wrong behavior observed by running the delivered system (a 500
INTERNAL_ERROR on a legitimate hypothesis-revision request), traced to four typed domain errors
missing from status-map.ts's STATUS_BY_ERROR_CLASS table. The four HTTP-status/error-identity facts
this fix encodes were decided into the four governing rules' own statement fields during this same
plan-work invocation (three found already stated in the human-authorized scope, one decided fresh),
disclosed in knowledge/decision-log.md. Only src/errors/status-map.ts was touched: the envelope
shape, the four error classes themselves, and the route/operation that throws them were all already
correct and unmodified.

## Notes

None.
