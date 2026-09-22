---
type: policy
statement: >-
  A revise-hypothesis is accepted while its case's draft version does not read back as a
  case at that reading — no validator rule failing over that draft version refusing the
  revise, and none of them reaching it as a CaseVersionNotValidError — and the
  concept-acceptance check reads that draft version's declared subject type exactly as the
  draft's own stored record carries it, the case where that declared subject type is itself
  the attribute failing a validator rule included, so that a concept the revision collects
  which does not accept the stored value is refused by the ConceptRefusesSubjectTypeError
  a-concept-accepts-the-declared-subject-type already states and by no refusal of its own.
expression: >-
  For a revise of hypothesis h whose case c holds draft version d: the revise's acceptance
  turns on the checks written over the revision itself — d holding draft state, the glossary
  holding every concept the revision names, and every concept it collects accepting d's
  declared subject type — and on no validator rule of validation-runs-at-every-read over d.
  Any such rule failing over d at that reading, its manifest holding no entry included, is
  never a ground of refusal for the revise and is never answered to the curator as a
  CaseVersionNotValidError. The subject type the concept-acceptance check compares against is
  the value d's own stored record carries in its subject attribute, read whatever that
  value's own standing: where d's subject names a subject type the glossary does not hold, no
  concept declares acceptance of it, and the revise is refused with the HTTP 422
  ConceptRefusesSubjectTypeError rather than by any refusal naming d's validity.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/glossary/concept
consistency: eventual
---

## Description

`a-hypothesis-is-revised-only-against-its-cases-draft` anchors the check to the case's draft version without saying what happens when that draft, at the moment of the revise, is one of the drafts `validation-runs-at-every-read` declines to read back as a case. This states that the anchor holds anyway.

The two readings are different readings. `validation-runs-at-every-read` and `a-case-version-failing-validation-at-a-read-is-refused-by-name` govern a read that names a stored case version to get a case back, and `constraints/a-case-is-read-whole` already holds wholeness there and nowhere else — it says in the same breath that a hypothesis, its revisions and a draft's own manifest entries may otherwise be created, read, revised or removed independently. The concept-acceptance check is that other kind of reading: it needs one declared attribute of the draft's own record, not a case assembled whole.

Gating the revise on the draft's validity would make the correcting act require the correction. A draft whose manifest holds no entry fails a validator rule for exactly that reason, and revising and placing a hypothesis is the one route out of it; `domain/knowledge/case-version` states that a draft's manifest may be freely composed while draft state holds, and `contracts/knowledge/case-lifecycle` puts every validator rule answering together at the single moment of release, before the version stands immutable. A revise refused because the draft is not yet whole would close the only door to making it whole, and would answer a composition step with a refusal the specification reserves for a read asking for a case.

The failing attribute being the subject type itself changes what the check concludes, never where it reads. `a-revise-hypothesis-requests-own-subject-type-is-never-read` keeps the draft version the one source of that value, so there is no second value to fall back to and no reason to skip the check: the stored value is read as it stands. Where that value names a subject type `case-terms-exist-in-the-glossary` finds the glossary does not hold, every concept's declared acceptance is a set of glossary subject types, so no concept accepts it and the check fails of its own accord — answered by the refusal `a-concept-accepts-the-declared-subject-type` already names, with no second refusal invented for a condition the existing one already reaches. Correcting that value stays where `domain/knowledge/case-version` and `update-draft` already put it, and this rule says nothing about it.
