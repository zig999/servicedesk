---
contract_version: siegard-reconcile/3
title: Review of revise-hypothesis-subject-check-corrective's delivered change
summary: 'Written by the delivery of task/revise-hypothesis-subject-check-corrective/read-the-drafts-own-declared-subject
  under its own initiative, as its implementation record states: revise-hypothesis''s concept-acceptance
  check now reads the case''s draft version''s own declared subject type, never the caller-supplied input.subject,
  matching the specification''s decided disposition of that field.'
target: backend
files:
- path: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  change: written by the delivery of task/revise-hypothesis-subject-check-corrective/read-the-drafts-own-declared-subject
- path: src/case/revise-hypothesis.operation.ts
  change: written by the delivery of task/revise-hypothesis-subject-check-corrective/read-the-drafts-own-declared-subject
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at the import block, lines 1-13 — import type {\
    \ ConceptResolution, IGlossaryQuery } from '../glossary/glossary-query.port.js';\nimport type {\n\
    \  DraftVersion,\n  HypothesisRevisionInput,\n  ICaseStore,\n  OverwriteHypothesisRevisionInput,\n\
    } from './case-store.port.js';"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at writeRevision(), lines 43-50 — if (highest.revision\
    \ !== undefined && highest.state === 'draft') {\n  await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ highest.revision));\n  return highest.revision;\n}\nreturn this.caseStore.insertHypothesisRevision(input);"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at reviseHypothesis(), line 38 — await this.refuseInvalidCollects(input,
    draftVersion.subject);'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at reviseHypothesis(), lines 36-41 — public async\
    \ reviseHypothesis(input: ReviseHypothesisInput): Promise<RevisedHypothesis> {\n    const draftVersion\
    \ = await this.requireDraftVersion(input.slug);\n    await this.refuseInvalidCollects(input, draftVersion.subject);\n\
    \    const revision = await this.writeRevision(input);\n    return { hypothesis_name: input.hypothesis_name,\
    \ revision };\n  }"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at overwriteInputOf(), lines 72-81 — return {\n\
    \    slug: input.slug,\n    hypothesis_name: input.hypothesis_name,\n    criterion: input.criterion,\n\
    \    collects: input.collects,\n    resolution: input.resolution,\n    revision,\n  };"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at refuseConceptsRefusingSubject(), lines 116-130\
    \ — const refusing = conceptsRefusingSubjectOf(resolutions, subject);\n  if (refusing.length > 0)\
    \ {\n    throw new ConceptRefusesSubjectTypeError({\n      slug: input.slug,\n      hypothesis_name:\
    \ input.hypothesis_name,\n      subject,\n      concepts: refusing,\n    });\n  }"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at refuseEmptyCollects(), lines 83-87 — if (input.collects.length\
    \ === 0) {\n    throw new HypothesisRevisionCollectsNoConceptError(input.slug, input.hypothesis_name);\n\
    \  }"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at requireDraftVersion(), lines 52-58, feeding reviseHypothesis\
    \ lines 36-38 — const draftVersion = await this.caseStore.findDraftVersion(slug);\n    if (draftVersion\
    \ === undefined) {\n      throw new CaseHoldsNoDraftError(slug);\n    }\n    return draftVersion;"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at writeRevision(), lines 43-50 — if (highest.revision\
    \ !== undefined && highest.state === 'draft') {\n  await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ highest.revision));\n  return highest.revision;\n}\nreturn this.caseStore.insertHypothesisRevision(input);"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/__tests__/integration/case/revise-hypothesis.operation.spec.ts: held at the second-release
    test, lines 336-356 — expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);'
  encoded_at:
  - src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at the overwrite branch preserving the existing\
    \ number, line 46-47; assignment of a genuinely new number is delegated to caseStore.insertHypothesisRevision,\
    \ line 49 — await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input, highest.revision));\n\
    \      return highest.revision;\n    }\n    return this.caseStore.insertHypothesisRevision(input);"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/case/revise-hypothesis.operation.ts: held at the branch condition in writeRevision(), line
    45 — if (highest.revision !== undefined && highest.state === ''draft'') {'
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at RevisedHypothesis type (lines 19-22) and reviseHypothesis's\
    \ return (line 40) — export type RevisedHypothesis = {\n  readonly hypothesis_name: string;\n  readonly\
    \ revision: number;\n};"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at refuseUnknownConcepts(), lines 97-102 — const\
    \ unknown = unknownConceptsOf(resolutions);\n  if (unknown.length > 0) {\n    throw new ConceptNotInGlossaryError(input.slug,\
    \ input.hypothesis_name, unknown);\n  }"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at writeRevision(), lines 43-48 — if (highest.revision\
    \ !== undefined && highest.state === 'draft') {\n  await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ highest.revision));\n  return highest.revision;\n}"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  conforms: false
  how: "no named file holds this fact now: src/case/revise-hypothesis.operation.ts read `nowhere` — public\
    \ async reviseHypothesis(input: ReviseHypothesisInput): Promise<RevisedHypothesis> {\n    const draftVersion\
    \ = await this.requireDraftVersion(input.slug);\n    await this.refuseInvalidCollects(input, draftVersion.subject);\n\
    \    const revision = await this.writeRevision(input);\n    return { hypothesis_name: input.hypothesis_name,\
    \ revision };\n  }"
  observed_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at writeRevision(), lines 43-50 — if (highest.revision\
    \ !== undefined && highest.state === 'draft') {\n  await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ highest.revision));\n  return highest.revision;\n}\nreturn this.caseStore.insertHypothesisRevision(input);"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
unstated:
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: the ConceptRefusesSubjectTypeError refusal tests, lines 611-619 and 797-805
  evidence: "await expect(rejection).rejects.toBeInstanceOf(ConceptRefusesSubjectTypeError);\n    await\
    \ expect(rejection).rejects.toMatchObject({\n      context: {\n        slug: fixture.slug,\n     \
    \   hypothesis_name: 'the-hypothesis',\n        subject: fixture.subjectType,\n        concepts: [fixture.concept],\n\
    \      },\n    });"
  cost: The exact set of fields a ConceptRefusesSubjectTypeError discloses — which concept refused, which
    subject type, which hypothesis, which case — is fixed here in a test rather than in the rule that
    mandates the refusal. As with CaseHoldsNoDraftError, the specification states this class of detail
    for analogous refusals elsewhere (CaseNotFoundError, CaseVersionNotDraftAtReleaseError) but is silent
    for this one, so the next reader of a-concept-accepts-the-declared-subject-type learns only that the
    refusal happens, not what it tells the curator.
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  where: the three CaseHoldsNoDraftError refusal tests, e.g. lines 654-655
  evidence: "await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);\n    await expect(rejection).rejects.toMatchObject({\
    \ context: { slug: fixture.slug } });"
  cost: What a CaseHoldsNoDraftError refusal discloses to the curator is decided here, in a test, rather
    than in the rule that mandates the refusal. The specification does state this level of detail for
    sibling refusals of the same shape — CaseNotFoundError's details 'carry the named slug and version',
    CaseVersionNotDraftAtReleaseError's 'carry the version's own slug, version number and the state it
    stood in' — so a reader who wants to know what this refusal tells the curator will look in a-hypothesis-is-revised-only-against-its-cases-draft
    and find nothing, and will not think to look in this test instead.
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/revise-hypothesis-subject-check-corrective.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/knowledge/case-version,
  rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, rules/knowledge/a-concept-accepts-the-declared-subject-type
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 4 opened across 1 of 2 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 2 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/revise-hypothesis-subject-check-corrective.returns/`, which are the evidence behind every entry above.
