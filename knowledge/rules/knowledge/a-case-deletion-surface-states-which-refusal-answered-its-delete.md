---
type: invariant
statement: >-
  A surface from which a curator issued a delete of a case states the outcome the case
  lifecycle answered to that delete — that the case was deleted where the delete was
  accepted, and where it was refused, that the case was not deleted together with which
  refusal answered, a refusal carrying CaseHoldsVersionsError told as the case still
  holding at least one case version and a refusal carrying CaseNotFoundError told as no
  case answering the slug the delete named, each of those two told apart from the other.
expression: >-
  For a case slug s and a surface from which a curator issued a delete naming s: where
  the case lifecycle accepts that delete, the surface states that the case s named was
  deleted; where it refuses that delete carrying CaseHoldsVersionsError, the surface
  states that the case was not deleted and that it still holds at least one case
  version; where it refuses that delete carrying CaseNotFoundError, the surface states
  that the case was not deleted and that no case answers s; the statement made for
  CaseHoldsVersionsError and the statement made for CaseNotFoundError can be told apart
  from one another.
constrains:
  - domain/knowledge/case
---

## Description

`a-case-holding-no-version-may-be-deleted` lets the case lifecycle's delete answer in one of two named ways when it refuses. It refuses with CaseHoldsVersionsError where the case holds any version, draft or released. `a-case-read-by-an-unknown-slug-or-version-is-refused` refuses with CaseNotFoundError where no case answers the slug. `constraints/a-successful-case-deletion-answers-with-no-content` states what the delete answers when it is accepted. This rule states what the surface that issued the delete tells the curator about each of those outcomes.

Neither refusal reports a breakage, and in both nothing was removed. They still send the curator to different next acts. A case still holding a version is one whose draft has to be discarded first, or one that was released and so will never reach zero versions, as `only-a-draft-case-version-may-be-discarded` already requires. A slug no case answers names a case that is already gone, or a slug that was never a case, and there is nothing left to delete. If the two tellings could not be told apart, the curator could not choose between those acts. That is the same indistinguishability `scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so` refuses for a refusal that arrives unnamed.

The rule adds no attribute, moves no pin and refuses no call. It says nothing about what the surface tells the curator for a refusal of the delete that carries any other error code. It also says nothing about where the curator is taken after an accepted delete, or how the deleted case leaves the surfaces that listed it. Which control carries each statement, how it is worded and where it sits are form and belong to the interface, as they do everywhere else this specification states what a surface tells a reader.
