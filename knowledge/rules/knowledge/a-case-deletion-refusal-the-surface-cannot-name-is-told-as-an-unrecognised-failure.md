---
type: invariant
statement: >-
  A surface from which a curator issued a delete of a case, meeting a refusal of that
  delete whose error code is neither CaseHoldsVersionsError nor CaseNotFoundError,
  tells the curator that the delete failed for a reason the surface does not recognise,
  told apart from whatever that surface states for either of those two refusals, and
  discloses nothing further about the refusal: neither its error code, nor its own
  message, nor any value it carries.
expression: >-
  For a case c and a surface from which a curator issued a delete of c: where that
  delete is refused and the error code the refusal carries is neither
  CaseHoldsVersionsError nor CaseNotFoundError, the surface states to the curator that
  the delete failed for a reason it does not recognise; that statement is
  distinguishable from the statement the surface makes for a delete of c refused with
  CaseHoldsVersionsError and from the statement it makes for a delete of c refused with
  CaseNotFoundError; and the surface states nothing else about that refusal — not the
  error code, not the refusal's message, not any value the refusal carries. Where the
  refusal carries CaseHoldsVersionsError or CaseNotFoundError, this says nothing about
  what the surface states.
constrains:
  - domain/knowledge/case
---

## Description

`a-case-holding-no-version-may-be-deleted` refuses a delete of a case holding any version by name, as a CaseHoldsVersionsError, and `a-case-read-by-an-unknown-slug-or-version-is-refused` refuses a lifecycle operation naming a slug nothing answers by name, as a CaseNotFoundError. Those are the two conditions a delete can be refused under that this specification has named. Any other code reaching the surface is one nobody anticipated there. Over the wire that is usually the generic answer `constraints/a-domain-error-unmapped-by-status-is-refused-generically` gives an error the status map does not name, which already carries nothing about the error it stands in for.

A delete is a write the curator issued, not a read, so `a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete` does not reach it. The notice owed is the one `a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for` already gives the refused writes that compose a manifest: the notice for a request that failed for a reason the surface does not recognise. `scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so` gives the reason the two named refusals may not share that notice. A curator shown an unrecognised failure learns the outcome is unknown, and retries, reloads or escalates. A curator told the case still holds a version, or that no case answers the slug, learns a condition and the act that follows from it. The three tellings lead to different acts, so each has to be told apart from the others.

Nothing further is disclosed, for the reason the wire-side fallback discloses nothing. The surface cannot state what an unrecognised code means. Showing the raw code, the refusal's message or a value it carries would put a fact in front of the curator in a form no node holds and no act follows from, and a refusal's own message may describe internal state the fallback already keeps from the caller.

This rule decides nothing about what the surface states for CaseHoldsVersionsError or for CaseNotFoundError. It requires only that whatever it states for each is distinguishable from this notice. It adds no attribute, moves no condition either refusal rule decides, and refuses no call. Which control carries the notice, how it is worded and where it sits are form and belong to the interface, as they do everywhere else this specification states what a surface tells a reader.
