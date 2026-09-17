---
type: policy
statement: >-
  A surface presenting to a person browsing the glossary the terms one vocabulary currently
  holds states explicitly, where that vocabulary's listing read answers no term at all, that
  the vocabulary currently holds no term, and states explicitly, where that listing read
  fails to answer, that the vocabulary's terms could not be read, offering in that failed
  reading alone a control whose one effect is to issue the same listing read for the same
  vocabulary again — never presenting either reading as a bare absence of terms, and never
  issuing that read again on its own.
constrains:
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
consistency: eventual
---

## Description

`list-vocabulary-terms` of `contracts/glossary/glossary-query` is the read this surface stands on, and it is issued separately from the surface that presents it: between a person naming a vocabulary and the answer arriving there is a window in which no term is held to show, and a read that fails leaves the surface holding none at all.

A vocabulary holding no term at all is a real and reachable state rather than a degenerate one.
`domain/glossary/subject-type` is a discovered vocabulary that grows as cases declare their subjects and is never designed ahead of them, and `the-non-conclusion-outcomes-precede-the-first-case` requires only the recipients, the actions and the two non-conclusion outcomes to exist before the first case version validates — the rest is discovered by writing cases.
So a person browsing subject types before any case has declared one meets a vocabulary that legitimately holds nothing, exactly as a curator meets a case whose sole draft was discarded.

Rows absent with nothing said about why read the same whether the vocabulary holds no term, the read has not answered yet, or the read failed unannounced.
`a-case-holding-no-versions-is-told-explicitly` answered that same question for a case's own versions, and its answer is taken again here for a vocabulary's: a real, reachable zero is stated, never left as an unexplained empty listing.
`a-composed-subjects-interface-discloses-an-empty-requirement-set` took the same answer for a requirement set naming no attribute, and `a-presented-manifest-entry-states-its-pinned-revisions-state` for an entry with nothing to state; the reason does not change with the set.

The failed read is stated in its own right, and the same read is offered with it, because the person's next act differs across the two readings: an emptiness is the vocabulary's own answer and asks nothing further, while a failed read settles only if it is made again.
`a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` and `a-presented-connector-configuration-states-an-outstanding-or-failed-read` both state a failed read and carry that same read with it for exactly this reason — naming the act and withholding it would leave a page reload or a re-navigation as the only route back.
The re-issue is the person's own act and never the surface's, so a failed read never becomes a loop against a published route.

The emptiness stated here is the vocabulary's own and not a page's: every published listing answers one page carrying its total (`constraints/listings-are-paged`), so the surface reads that this vocabulary holds no term off the answer itself rather than off an empty row set alone, and a page selected past the last term of a vocabulary that does hold terms is not this reading.
An unheld name stays `a-glossary-read-by-an-unheld-name-is-refused`'s own: that refusal answers a term read by a name nothing holds, which is a refusal and not an emptiness, and nothing here touches it.
Which control carries each statement, its wording, and where on the surface it sits are form and belong to the interface, exactly as this specification's other surface rules leave them.

Consistency is eventual because the surface never holds the terms it presents: what it states is drawn from a listing read issued separately, and these two readings are precisely where that read answered zero or did not answer at all.
