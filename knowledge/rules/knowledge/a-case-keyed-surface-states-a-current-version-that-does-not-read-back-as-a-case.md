---
type: policy
statement: >-
  A surface presenting one case a reader named by its slug alone states explicitly,
  whenever the version that case currently uses does not read back as a case at that
  reading, that the case's current version does not read back as a case right now; it
  presents no attribute of that version as the case's current content, and what it
  states there is distinct from what it states for a read that did not complete and
  from what it states for a case that currently holds no version, so that a reader
  tells the three apart.
expression: >-
  For a case c and a surface presenting c to a reader who named c by its slug and named
  no version of it: let v be the version, among the versions c currently holds, whose
  version number is highest. Where v exists and some validator rule of
  validation-runs-at-every-read does not hold for v at the moment of that reading, the
  surface states of c that the version c currently uses does not read back as a case,
  and states no attribute of v — its title, when_to_use, subject, fallback,
  consolidation_register, state or manifest, nor any fact derived from them — as the
  content c currently stands at. What it states there differs from what the same surface
  states where the read of c did not complete, and from what it states where c currently
  holds no version at all: no two of those three are presented alike. Where v exists and
  every validator rule holds for it at that reading, the surface states none of this.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

`validation-runs-at-every-read` makes this a standing state of the store rather than an edge of it: a stored version, draft or released, is read as a case only while every validator rule holds at that reading, and no field marks one that currently fails a rule. So a reader who reached a surface by naming a case's slug can meet a case that exists, holding a version that exists, where the read yields no case at all.

The neighbouring answers do not reach that state. `a-case-read-by-an-unknown-slug-or-version-is-refused` answers a slug, or a slug and version, that no case version currently answers — a version never written — and its own Description already sets aside the case that exists and holds no version as a different case, answered by `a-case-holding-no-versions-is-told-explicitly`. This is the third member of that family, and neither node states it: the case is there, the version is there, and validation says it is not a case at this reading.

That it is stated at all, and stated apart from the other two, is the reading this specification has already given the same shape twice. `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained empty answer precisely because an absence, a failed read and a pending read then read alike, and `a-cases-current-pins-come-from-its-highest-numbered-version` took that same answer for a hypothesis the current version's manifest holds no entry for. The three states ask different things of the curator who meets them — a case holding no version is one to author a version for, a read that did not complete is one to attempt again, and a current version that does not validate is one to correct — so a surface that renders any of them like another sends the reader to the wrong act.

A read that failed is already answered elsewhere and answered differently: `a-domain-error-unmapped-by-status-is-refused-generically` gives what the system did not anticipate a fixed text that discloses nothing about it. A version that does not validate is anticipated by `validation-runs-at-every-read` itself, so it is never presented as that.

No attribute of the version is presented alongside the statement, because `a-case-is-read-whole` leaves nothing partial to present: the read answers a complete, validated version or nothing. Showing a title, a fallback or a manifest recovered beside that would state as the case's current content exactly what validation has just declined to read back as a case.

Which version "the version the case currently uses" names is decided nowhere new here: `a-cases-current-pins-come-from-its-highest-numbered-version` already fixed it as the highest-numbered version among those the case currently holds, on `a-case-summary-is-derived-from-its-existing-versions`'s own reasoning, and this reads that same version so that one reading of "the case as it currently stands" keeps serving every case-keyed surface.

The rule adds no attribute, moves no pin and refuses no call. It states only that this condition is disclosed and held apart from its two neighbours; the wording that carries it, the control it sits in and where on the surface it appears are the interface's, as they are wherever else this specification states what a surface tells a reader.

Consistency is eventual: the fact spans the case a reader named and the version whose validation is judged, each read separately.
