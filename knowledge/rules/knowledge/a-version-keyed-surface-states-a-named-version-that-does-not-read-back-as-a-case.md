---
type: invariant
statement: >-
  A surface presenting one case version a reader named by that case's slug and that
  version's number states explicitly, whenever some validator rule of
  validation-runs-at-every-read does not hold for that version at that reading, that
  the version named does not read back as a case right now; it presents no attribute
  of that version and no entry of that version's manifest as the content standing at
  that identity, and what it states there is distinct from what the same surface
  states for a read of that version that did not complete, so that a reader tells the
  two apart.
expression: >-
  For a case slug s, a version number n a reader named, and a surface presenting the
  case version stored at (s, n): where a stored case version answers (s, n) and some
  validator rule of validation-runs-at-every-read does not hold for it at the moment
  of that reading, the surface states that the version at (s, n) does not read back as
  a case at that reading, and states as the content standing at (s, n) no attribute of
  that version — its title, when_to_use, authored_at, subject, fallback,
  consolidation_register, state or released_at — no entry of its manifest, neither an
  entry's position nor the hypothesis revision an entry references, and no fact
  derived from any of them. What it states there is distinguishable by the reader from
  what the same surface states where a read of (s, n) did not complete, and neither of
  those two is presented as the other. Where every validator rule holds for that
  version at that reading, the surface states none of this.
constrains:
  - domain/knowledge/case-version
---

## Description

`validation-runs-at-every-read` makes this a standing state of the store rather than an edge of it: a stored version, draft or released, is read as a case only while every validator rule holds at that reading, and no field marks one that currently fails a rule. So a reader who reached a surface by naming a case's slug together with a version's number can meet a version that is stored, at the identity they named, where the read yields no case at all — the state `a-case-version-failing-validation-at-a-read-is-refused-by-name` answers over the wire with an HTTP 409 reporting a CaseVersionNotValidError.

That refusal states what the read answers and stops there; what the surface rendering it tells its reader is a separate question, and the two nodes that answer it for the neighbouring surfaces do not reach this one. `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` is written over a reader who named a case by its slug and named no version of it, and reads the case's highest-numbered version for that reason; `a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone` is written over a listing whose reader named no case and no version. Here the reader named both, the version they named is the one judged, and neither node's condition is this one.

The statement is owed for the reason this specification has already given it three times. `a-case-holding-no-versions-is-told-explicitly` refuses a silence because an absence, a failed read and a pending read then read alike; `a-cases-current-pins-come-from-its-highest-numbered-version` took that same answer for a hypothesis the current version's manifest holds no entry for; and `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` took it again in the sibling registry for a surface keyed on an identity its operator named. A version that does not validate is one the curator must correct, and a read that did not complete is one the curator must attempt again — different acts, so a surface rendering either like the other sends the reader to the wrong one.

No attribute of the version accompanies the statement, and no entry of its manifest does. `constraints/a-case-is-read-whole` answers a complete, validated version or nothing at all, so there is nothing partial to present honestly: a title, a fallback, a state, or a manifest entry's position and pinned revision shown beside the statement would state as the content standing at that identity exactly what validation has just declined to read back as a case. The manifest is named alongside the version's own attributes because `domain/knowledge/case-version` declares it a required attribute of the version and `domain/knowledge/manifest-entry` is a value object within that same version, so an entry recovered and shown is as much the version's content as its title is — and `a-manifest-entrys-pinned-revision-is-always-shown` already refuses a pin sourced from anything but a record read whole. The slug and the version number the reader themselves named are not attributes presented as that content; they are the identity the reader addressed the surface by.

`a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete` reserves the read-that-did-not-complete statement for a refusal whose error code the surface holds no presentation of its own for, and says nothing about a code the surface does hold one for. This gives the version-keyed surface that presentation for exactly this condition, so the condition never falls to that statement, and the two stay distinguishable to the reader rather than one absorbing the other.

The rule adds no attribute, moves no pin, offers no act and refuses no call; what a surface offers a curator over such a version is decided where this specification decides what surfaces offer, and not here. It is an invariant over `domain/knowledge/case-version` alone because slug-together-with-version-number is that element's own identity, the same reading `a-successful-case-version-creation-lands-on-the-created-versions-own-surface` took for the surface it lands a curator on, and the condition is decidable from that one version and its own manifest without a second aggregate being read. Which control carries the statement, how it is worded and where on the surface it sits are form and belong to the interface, as they do wherever else this specification states what a surface tells a reader.
