---
title: Versions panel states a current version that does not read back as a case
summary: The Versions panel on Case Detail carries the statement that the case's current version does
  not read back as a case, held apart from a read that did not complete and from a case holding no version.
rationale: The scope asked only for the Attributes tab's withdrawal and stated no replacement, so this
  cut is the planning's. It is a task rather than a criterion on unwire-attributes-tab-from-case-detail
  because that task's objective is that the Versions and Hypotheses tabs behave as they did, and this
  one requires the Versions panel to perform a read it does not perform today and to state something it
  does not state today — a second outcome, changing for a second reason, demonstrable on its own. It depends
  on the withdrawal so that the statement has exactly one home on the surface rather than two, and it
  names no criterion over case-version-editor-form-fields.tsx, which answers a route that names a version
  rather than a case-keyed surface. A second binding pass found this task's own criteria did not yet forbid
  a fact derived from the seven withheld attributes (only the attributes themselves), tightened below,
  and surfaced a further silence — whether a read failing validation is answered distinguishably from
  an unanticipated error — now decided into the specification as its own invariant over the backend read,
  which this task depends on without implementing.
sources:
- work/case-detail-attributes-tab-removal/intake/scope.md
objective: The Versions panel reached at /cases/$slug states, whenever the highest-numbered version the
  case currently holds does not read back as a case at that reading, that the case's current version does
  not read back as a case, and states it distinctly from a read that did not complete and from a case
  that currently holds no version.
criteria:
- Where the highest-numbered version a case currently holds does not read back as a case at that reading,
  the Versions panel renders a statement that the case's current version does not read back as a case.
- The version whose reading that statement answers is the highest-numbered version among those the case
  currently holds, including where the case also holds a lower-numbered draft.
- While that statement is rendered, the Versions panel presents no title, when_to_use, subject, fallback,
  consolidation_register, state or manifest of that version, nor any fact derived from them, as the content
  the case currently stands at.
- The text the Versions panel renders for a current version that does not read back as a case differs
  from the text it renders where the case's version timeline could not be read.
- The text the Versions panel renders for a current version that does not read back as a case differs
  from the text it renders where the case currently holds no version.
- The text the Versions panel renders where the case's version timeline could not be read differs from
  the text it renders where the case currently holds no version.
- Where the read of the case's highest-numbered version does not complete for a reason other than that
  version failing validation, the Versions panel renders its read-did-not-complete statement and not the
  current-version-does-not-read-back-as-a-case statement.
- Where the highest-numbered version the case currently holds reads back as a case at that reading, the
  Versions panel renders none of that statement.
- The Versions panel still lists every version the case currently holds with its version number and the
  actions it offered before this task, where the case's versions were read.
depends_on:
- task/case-detail-attributes-tab/unwire-attributes-tab-from-case-detail
implements:
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
---

## What it is
The Versions panel is the surface a reader reaches by naming a case's slug and no version once the Attributes tab is gone, so the disclosure the tab carried belongs on it.
The panel reads the case's version list already; this task gives it the reading of the current version's validation and the branch that states the outcome.
The three states a reader must tell apart — a timeline that could not be read, a case holding no version, and a current version that does not read back as a case — are each rendered differently from the other two.

## Notes
The wording that carries the statement, the control it sits in and where on the panel it appears are the interface's to choose.
The panel today resolves the case's current version as its draft where one exists; criterion 2 holds it to the highest-numbered version instead, which a version's ever-increasing numbering makes the same version in every case, confirmed rather than assumed.
Criterion 9's existing State column is not the "state" criterion 3 withholds: criterion 3's own qualifier, "as the content the case currently stands at," does not reach a version-timeline row, which is not a presentation of the current version's own content.
Criteria 4 through 6 rest on two texts this task must not alter — "Unable to load this case's version timeline." and "This case currently holds no version." — whose own obligations sit outside this task's candidates; only the third text, newly added here, is this task's to write.
Binding this task confirmed a-presented-case-version-states-its-own-declared-attributes is answered by the Version Editor screen, outside this epic's tasks, and surfaced that no node states whether a read failing validation is answered distinguishably from an unanticipated error at all; that fact is now decided as rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, a backend invariant this task depends on without implementing, confirmed already true in practice: the backend's response body already carries a distinguishing error code that frontend/app/src/services/error-ui-state.ts already reads regardless of HTTP status, independent of whether the backend's own status code yet matches that invariant.
