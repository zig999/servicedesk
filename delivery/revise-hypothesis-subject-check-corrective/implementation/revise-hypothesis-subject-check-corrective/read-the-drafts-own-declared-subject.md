---
title: Revise-hypothesis reads the draft version's own declared subject for its concept-acceptance check
summary: revise-hypothesis.operation.ts now anchors its concept-acceptance check on the case's draft version's own declared subject type, fetched through an enhanced findDraftVersion, and never reads or reacts to the caller-supplied input.subject; the widened ICaseStore.findDraftVersion signature is now honored by every fake implementing that port in the unit suite.
task: sha256:15096903d922f861f493307b0b9eaba997b1440185309d042096ccf3a5b12782
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revise-hypothesis-subject-check-corrective-read-the-drafts-own-declared-subject-build-3
files:
- path: src/case/revise-hypothesis.operation.ts
  effect: reviseHypothesis now calls a renamed requireDraftVersion(slug), which still throws CaseHoldsNoDraftError when no draft exists but now also returns the draft's DraftVersion (version and subject). Its subject is threaded explicitly into refuseInvalidCollects, refuseConceptsRefusingSubject and conceptsRefusingSubjectOf as an added parameter, replacing every prior read of input.subject in the concept-acceptance check and in ConceptRefusesSubjectTypeError's context.
- path: src/case/case-store.port.ts
  effect: 'Adds an exported DraftVersion type ({ version: number; subject: string }) and widens ICaseStore.findDraftVersion''s return type from Promise<number | undefined> to Promise<DraftVersion | undefined>.'
- path: src/persistence/relational-case-store.repository.ts
  effect: findDraftVersion now calls a new, dedicated draftVersionWithSubjectSelect ("SELECT version, subject FROM case_versions WHERE slug = $1 AND state = $2") and returns a DraftVersion object instead of a bare number. draftVersionSelect itself is left with its original SQL text ("SELECT version FROM case_versions WHERE slug = $1 AND state = $2") and remains requireCaseHoldsDraft's sole query, untouched by this task.
- path: src/__tests__/unit/case/case-query.service.spec.ts
  effect: FakeCaseStore.findDraftVersion (an ICaseStore implementation this file uses only to satisfy CaseQueryService's constructor, never to exercise revise-hypothesis behavior) now returns Promise<DraftVersion | undefined> instead of Promise<number | undefined>, matching the widened port. Imports DraftVersion from case-store.port.js. The implementation looks up the stored version's own subject column and returns { version, subject }, falling back to the file's SUBJECT constant only in the unreachable case where the stored version itself is missing. No test in this file reads findDraftVersion's return value, calls it directly, or asserts on it, so this value is inert to every existing assertion; every assertion and test title in the file is unchanged.
criteria:
- criterion: findDraftVersion (or an equivalent read) returns the draft version's own declared subject type, and refuseInvalidCollects/refuseConceptsRefusingSubject use that value — never input.subject — when checking whether a collected concept accepts the subject.
  met: true
  how: findDraftVersion's return type now carries subject alongside version. revise-hypothesis.operation.ts's requireDraftVersion returns that DraftVersion, and reviseHypothesis passes draftVersion.subject into refuseInvalidCollects, which passes it into refuseConceptsRefusingSubject and conceptsRefusingSubjectOf. input.subject is read nowhere in revise-hypothesis.operation.ts after this change.
- criterion: 'A revise-hypothesis request whose input.subject disagrees with the case''s own draft version''s declared subject type is neither refused nor influenced by that disagreement: the concept-acceptance check''s outcome (refused with ConceptRefusesSubjectTypeError, or accepted) is decided solely by the draft version''s own declared subject type, and input.subject is read nowhere in that decision.'
  met: true
  how: The concept-acceptance check now receives subject as an explicit parameter sourced exclusively from draftVersion.subject; input.subject plays no part in computing which concepts refuse the subject, in whether ConceptRefusesSubjectTypeError is thrown, or in that error's own context.subject.
- criterion: Every existing test of revise-hypothesis.operation.ts and of findDraftVersion's callers continues to pass with every existing assertion unchanged, except where an assertion itself asserted the defect (using input.subject instead of the draft's own subject) as correct — such an assertion is corrected to match the fixed behavior, not preserved.
  met: true
  how: 'Reviewed the existing integration suite: every fixture seeds the draft version''s subject column with fixture.subjectType and every existing revise-hypothesis call in that file supplies input.subject equal to fixture.subjectType too, so no existing assertion depends on input.subject disagreeing with the draft''s own subject, and none asserts the prior defect. Separately, case-query.service.spec.ts''s own FakeCaseStore needed its findDraftVersion updated to the widened return type to typecheck against the port; that file''s own tests never call or assert on findDraftVersion, so the fix leaves every one of its assertions and titles unchanged. Confirmed green by the build and suite runs.'
nodes:
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: Encodes that subject is the case version's own declared attribute by having findDraftVersion read it from the same case_versions row and table as every other declared attribute, and by exposing it on DraftVersion as a value belonging to the version identity, not to any request.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: 'requireDraftVersion still throws CaseHoldsNoDraftError when no draft exists (unchanged), and now anchors the concept-acceptance check to that same draft''s own subject exclusively: draftVersion.subject is the sole value threaded into the check, and ReviseHypothesisInput''s subject field is left on the wire but read nowhere in the operation, matching the rule''s disposition of a caller-supplied subject as accepted and without effect.'
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
  how: conceptsRefusingSubjectOf/refuseConceptsRefusingSubject still raise ConceptRefusesSubjectTypeError exactly when a collected, held concept's accepts list excludes the subject in force — that subject is now the case version's declared one (draftVersion.subject) rather than a caller-supplied value, which is what this rule requires. The HTTP 422 mapping and the manifest-wide invariant are out of this task's scope per its own Notes.
inferences:
- inferred: ReviseHypothesisInput keeps its subject field on the DTO/type rather than removing it.
  from: The task's own guidance to check whether removal breaks another caller before choosing it. reviseHypothesisBodySchema requires subject and the controller spreads the parsed body straight into the operation's input; removing the field would force also touching the DTO/controller (outside this task's declared file set), while the specification only decided the field's disposition (inert), not its removal from the wire.
- inferred: findDraftVersion's return type is widened in place rather than adding a second method to fetch the subject.
  from: findDraftVersion has exactly one production caller (revise-hypothesis.operation.ts), so widening its own return shape is the minimal change, avoiding a second query per revision and a second port method nothing else would use.
- inferred: FakeCaseStore.findDraftVersion in case-query.service.spec.ts returns the stored version's own subject column rather than a fixed dummy string.
  from: This fake already stores subject per version, so reading it back keeps the fake's own internal state coherent; the value is inert to this file's assertions regardless, since none of them read it.
- inferred: draftVersionSelect and draftVersionWithSubjectSelect are kept as two separate query-builder functions in relational-case-store.repository.ts rather than one parameterized function, even though their SQL differs only in the selected columns.
  from: A failed suite run showed requireCaseHoldsDraft's caller — a pre-existing unit test this delivery does not own — asserts on the exact SQL substring "SELECT version FROM case_versions" that draftVersionSelect must keep producing. Sharing one function between the two callers makes any future change serving findDraftVersion's needs also change requireCaseHoldsDraft's query text; splitting them removes that coupling.
preserved:
- CaseHoldsNoDraftError is still thrown from the same place (now inside requireDraftVersion) under the same condition, before any collects validation or write.
- refuseEmptyCollects, refuseUnknownConcepts, ConceptNotInGlossaryError and HypothesisRevisionCollectsNoConceptError behavior is untouched.
- writeRevision's overwrite-vs-insert logic and overwriteInputOf are untouched.
- 'requireCaseHoldsDraft in relational-case-store.repository.ts is unaffected: it still calls draftVersionSelect, whose SQL text is exactly what it was before this task, and it still reads only the row''s presence.'
- 'The pre-existing unit test in relational-case-store.repository.spec.ts ("finds the case''s own draft first, claims the hypothesis''s own identity idempotently, inserts the revision numbered off its own highest existing revision, and inserts its own collects, as one unit of work") is untouched: neither its mock nor its assertion (both matching the substring ''SELECT version FROM case_versions'') was edited, since draftVersionSelect''s text was restored to match them exactly.'
- ConceptRefusesSubjectTypeError's constructor and context shape are unchanged; only the value passed as context.subject now originates from the draft version instead of the request.
- Every assertion and every test title in src/__tests__/unit/case/case-query.service.spec.ts is unchanged; only FakeCaseStore's findDraftVersion implementation and its import list were touched.
deferred:
- what: Updating any further test doubles that implement ICaseStore.findDraftVersion with the prior signature, and adding a test that exercises input.subject disagreeing with the draft's own declared subject to prove the corrected behavior.
  why: Writing and correcting tests is the test-author's judgment in a separate context; this task-implementer delegation's scope is confined to source files. The one change made to case-query.service.spec.ts is a pure signature-conformance fix demanded by the build, not new test authorship.
- what: rules/knowledge/a-concept-accepts-the-declared-subject-type's HTTP 422 status clause and its manifest-wide invariant clause.
  why: Explicitly out of scope per this task's own Notes — REMAINDER entries route these to the tasks delivering the revise-hypothesis endpoint's error-to-status mapping and to place-hypothesis/release over the manifest, respectively.
---
## What it is

Fixes revise-hypothesis.operation.ts's concept-acceptance check to read the draft version's own declared subject type instead of the caller-supplied input.subject, and updates a fake store implementation the widened port signature affected.

## Notes

The first build attempt (run/revise-hypothesis-subject-check-corrective-read-the-drafts-own-declared-subject-build) failed at typecheck: case-query.service.spec.ts's own FakeCaseStore had fallen out of sync with the widened ICaseStore.findDraftVersion signature. Fixed in place (a signature-conformance fix, not new test authorship).
The first suite attempt (run/revise-hypothesis-subject-check-corrective-read-the-drafts-own-declared-subject-suite, cause: code) failed one pre-existing unit test in relational-case-store.repository.spec.ts, which matches requireCaseHoldsDraft's own SQL by an exact substring; the first attempt had shared draftVersionSelect's modified SQL text between findDraftVersion and requireCaseHoldsDraft. Fixed by splitting them into two separate query functions, leaving requireCaseHoldsDraft's query and the test built around it untouched; this record's own run is the third, passing build attempt.
