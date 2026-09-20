---
type: policy
statement: >-
  A surface on which a curator composes a hypothesis revision states explicitly, where a
  read it made for something other than the case version that composition is anchored to
  — the glossary's terms it offers, or the revisions the hypothesis being revised already
  holds — does not complete, that the read it made for that thing did not complete and
  which of them it was, in terms distinct from what the same surface states where its read
  of the case version did not complete, and presents nothing that read would have carried
  and states nothing of the case version on account of it.
expression: >-
  For a curator composing a revision of hypothesis h anchored to case version v, and a read
  r the composing surface made for something other than v — the glossary's terms the
  composition offers for the revision's collected concepts and for its resolution, or the
  revisions h currently holds — where r does not complete, whether refused or failing to
  answer at all: the surface states that the read of the glossary's terms, or the read of
  h's revisions, whichever r was, did not complete. What it states there differs from what
  the same surface states where its read of v did not complete, so that a curator tells the
  two apart and neither is presented as the other. It states no attribute of v, and nothing
  about whether v reads back as a case, on account of r. Nothing r would have carried — a
  glossary term, or a revision of h — is presented as having been read. Where r completes,
  the surface states none of this for r.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
  - domain/glossary/concept
consistency: eventual
---

## Description

A curator composing a hypothesis revision is served by more than one read, and only one of them is the case version. That version is the anchor `a-hypothesis-is-revised-only-against-its-cases-draft` makes a submitted revise answer to, and what a surface states when its read of a case does not complete is already fixed — held apart from its two neighbours by `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case`, and absorbing a refusal the surface cannot name by `a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete`. The glossary's terms are a second read: `case-terms-exist-in-the-glossary` makes every concept a revision collects, and every outcome, action and recipient its resolution names, a term the published language already holds, so a composition offering them reads them from the glossary through `contracts/glossary/glossary-query`. The revisions the hypothesis already holds are a third, ordered by `a-hypothesis-revisions-listing-answers-highest-revision-first` and carrying each revision's own state under `a-hypothesis-revisions-listing-discloses-each-revisions-own-state`, answered by `list-hypothesis-revisions` of `contracts/knowledge/case-query`. Neither of the two is a read the surface made for the case, so neither node above reaches them, and no node said what the surface states when one of them does not complete.

The statement is not the one the case version's own failed read receives. The three statements `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` holds apart are held apart because each sends the reader to a different act, and its neighbour collapses an uninterpretable refusal into one of them precisely because the act there is the same. Here the act is not the same. A read of the case version that did not complete leaves the curator with no anchor at all — nothing is known about the version the composition would be checked against. A glossary read or a revisions read that did not complete leaves that anchor read and the composition standing, with one part of it unfilled; what the curator attempts again is that read, not the version's. Presenting the two alike names the wrong read as the one to retry, and on a surface whose case-version read did complete it tells the curator that read failed when it answered — a true-sounding statement of a cause that did not occur.

Naming which read is what makes the distinction usable rather than merely drawn, and it is the shape this specification already gives a failed read. `rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` states that the capability at the identity the operator named could not be read, naming the thing read rather than reporting an unattributed failure, and `a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone` keeps one failing read a fact about the one case it is a fact about instead of about the whole listing. Holding the statement to the read it belongs to is that same containment taken across the reads of one screen.

Nothing of the case version is stated on account of either read, for the reason its own rule already gives: each of that rule's three statements asserts something about the case, and a glossary read that did not complete taught the surface nothing about the version. Stating that the current version does not read back would send the curator to correct a version nothing was learned about, and stating that the read of the case version did not complete would report a failure of a read that answered. Nothing the failed read would have carried is presented either — a term or a revision shown beside the statement would be content nobody read, the substitution `a-manifest-entrys-pinned-revision-is-always-shown` refuses for a pin and `a-case-is-read-whole` leaves nothing partial to make.

This decides only what is stated. Which reads a composition makes, and whether composing, or any act on the surface, stays offered while one of these reads has not completed, are not settled here and are not narrowed by anything stated here. Which control carries each statement, how it is worded and where it sits are form and belong to the interface, as they do wherever else this specification states what a surface tells a reader.

Consistency is eventual: the fact spans the glossary's terms, the revisions of the hypothesis and the case version the composition is anchored to, each read separately and one of them in another context.
