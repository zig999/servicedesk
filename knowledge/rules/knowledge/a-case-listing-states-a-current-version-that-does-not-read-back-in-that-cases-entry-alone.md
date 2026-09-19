---
type: policy
statement: >-
  A listing of every case answers an entry for every case it carries whether or not each
  case's current version reads back as a case at that reading, every entry whose own
  case's current version reads back carrying that case's own summary unaffected by any
  other case, and an entry whose case's highest-numbered version fails some validator
  rule of validation-runs-at-every-read at that reading carrying, in place of the whole
  summary it would otherwise have carried, the explicit statement that this case's
  current version does not read back as a case at that reading.
expression: >-
  For a listing of every case answering cases c1..cn and any c_i among them: let v_i be
  the version, among the versions c_i currently holds, whose version number is highest.
  Where v_i exists and some validator rule of validation-runs-at-every-read does not hold
  for v_i at the moment of that reading, the listing still answers an entry for c_i; that
  entry carries c_i's own slug and states that the version c_i currently uses does not
  read back as a case at that reading; it states no fact of c_i's summary — none of
  current_state, version_count, last_updated, title, when_to_use or released_version —
  and no other attribute of v_i nor any fact derived from one; and every entry c_j for j
  other than i answers exactly as it would where every validator rule held for v_i,
  carrying c_j's own summary. Where every validator rule holds for v_i at that reading,
  the entry for c_i carries c_i's summary and states none of this.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-summary
consistency: eventual
---

## Description

`validation-runs-at-every-read` makes a stored version read back as a case only while every validator rule holds at that reading, and no field marks one that currently fails a rule. So a curator opening the catalog can hold a case whose highest-numbered version — the version `a-cases-current-pins-come-from-its-highest-numbered-version` already fixed as the one a case currently uses — yields no case at that moment. The listing owes an answer for that case and an answer for every other, and no node stated either.

Every other case's entry stands because nothing about those cases changed. `a-case-summary-is-derived-from-its-existing-versions` computes each summary from that case's own versions alone, and `a-slug-identifies-one-case` keeps the cases disjoint, so one case's version failing a validator rule is a fact about that case and about no other. Withholding the catalog for it would hide every case needing no correction while telling the curator nothing about the one that does. `a-case-listing-answers-cases-in-slug-order` also fixes which cases a page carries from their slugs alone, so a page that dropped such a case, or refused over it, would make the page a reader reaches turn on a fact no slug carries.

`a-case-version-failing-validation-at-a-read-is-refused-by-name` answers a read naming a stored case version, and answers it with nothing partial. This listing names no version: it answers the cases currently held, and what it learns about one case's current version bears on that case's own entry. The refusal by name is therefore not what the listing becomes.

What the entry carries instead is the state `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` already owes a reader who named that one case by its slug. That node does not reach here — its reader named a case and this listing's reader named none — but the state is the same state and the act it sends the curator to, correcting that version, is the same act.

The summary cannot stand beside the statement. current_state, last_updated, title and when_to_use are read off the case's versions, and `a-case-is-read-whole` leaves nothing partial to present, so showing any of them would state as the case's current content exactly what validation has just declined to read back as a case. version_count counts the versions the case holds rather than reading an attribute off the failing one, but it is a fact of the summary and the summary is what the statement stands in place of; an entry showing one summary field while withholding the rest is the partly-derived answer this specification refuses everywhere else. The slug stays, because `domain/knowledge/case` declares it on the case's own identity rather than on any version, and it is what orders the entry and what the reader addresses the case by.

This is not the absence a case holding no version shows. There, `a-case-summary-is-derived-from-its-existing-versions` answers version_count zero with current_state and last_updated simply absent; here the entry states a fact about a version that exists and does not currently read back, so the two entries differ in what they carry, not only in degree.

The rule adds no attribute, moves no pin and refuses no call. Which control carries the statement, how it is worded and where in the entry it sits are form and belong to the interface, as they do wherever else this specification states what a surface tells a reader. Consistency is eventual: the fact spans the case listed and the version whose validation is judged, each read separately.
