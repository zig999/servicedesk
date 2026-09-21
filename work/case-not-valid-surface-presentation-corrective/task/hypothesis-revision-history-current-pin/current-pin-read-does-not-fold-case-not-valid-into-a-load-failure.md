---
title: The hypothesis revision history screen presents a hypothesis's own successfully-read revisions even when the case's current version does not read back as a case
summary: use-case-hypothesis-current-pin.ts and hypothesis-revision-history.tsx stop treating a
  CaseVersionNotValidError refusal of the case's current version as an undifferentiated load
  failure, so a hypothesis's own revision history — read independently and successfully — is no
  longer hidden behind a false "unable to load" statement.
objective: Opening a hypothesis's revision history on the case detail screen presents that
  hypothesis's own revisions whenever the read of them succeeded, whether or not the case's
  current version reads back as a case, disclosing on that reading none of the pin fact that
  would come from the refused read, and never folding that refusal into the same statement the
  screen makes for a read that did not complete.
criteria:
- Opening a hypothesis's revision history for a case whose current (highest-numbered) version
  fails a validator rule of validation-runs-at-every-read presents that hypothesis's own revision
  history, read successfully and independently of the version's own refused read, turning on
  nothing about which validator rule failed over that version.
- On that same reading, the screen states neither that some revision it presents is the one the
  case currently uses nor that the case currently uses no revision of that hypothesis — no fact
  derived from that version's manifest is stated at all — and the presence of the revision
  history is distinguishable from the statement the screen makes for a read that did not
  complete.
- A genuine failure to read the hypothesis's own revisions (not the case's current version) still
  presents the statement the screen already makes for a read that did not complete.
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-hypothesis-revision-history-current-pin.md
implements:
- rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
---

## What it is
Corrects `use-case-hypothesis-current-pin.ts`'s `manifestQuery.isError` branch, which currently
folds a `CaseVersionNotValidError` refusal of the case's current version into the same
`load-error` phase as any other failed read — collapsing into `hypothesis-revision-history.tsx`'s
generic "Unable to load this hypothesis's revision history." even when the hypothesis's own
revisions were read successfully.

## Notes
UNDERDETERMINED, from the specification, entry 1 — no criterion requires the screen, on the
refused reading, to state explicitly that the case's current version does not read back as a
case, distinct from what it states for a read that did not complete and for a case that
currently holds no version, as `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case`
requires; criterion 2 is satisfied by the history's mere presence, so an implementation that says
nothing at all about the refused read of the current version — leaving the withheld pin as an
unexplained blank — would satisfy every criterion as written while the specification refuses it.

UNDERDETERMINED, from the specification, entry 2 — no criterion reaches the reading where the
current version's own read answers, where `a-cases-current-pins-come-from-its-highest-numbered-version`
requires the pin to be stated from that version's manifest and a hypothesis with no entry to be
stated as one the case currently uses no revision of. An implementation could drop that marking
from every reading, including this one, and still satisfy every criterion.

UNDERDETERMINED, from the specification, entry 3 — a case currently holding no version at all
(`versionsQuery.data !== undefined && versions.length === 0`, `use-case-hypothesis-current-pin.ts`
line 60) is folded into the same generic `load-error` phase this task corrects for a
`CaseVersionNotValidError` refusal specifically, and no criterion of this task reaches that
branch; `a-cases-current-pins-come-from-its-highest-numbered-version` and
`a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` both require it
be told apart from a read that did not complete.

UNDERDETERMINED, from the specification, entry 4 — no criterion reaches a refusal of the
current-version read carrying an error code the screen holds no presentation of its own for;
`a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete`
requires such a refusal be presented exactly as a read that did not complete, disclosing neither
the code, the message, nor any value it carries. An implementation could widen the narrowed
branch to every failed read of the current version rather than the named refusal alone, or
disclose the refusal's own code or message, and still satisfy every criterion as written.

The status cell `toHistoryRow` renders ("current" for the pinned revision, "frozen" for every
other) is not a form choice left open by the specification on the refused reading: rendering
"frozen" on every row states, in effect, that the case currently uses no revision of the
hypothesis, and rendering "current" on any row states that revision is the one in use — both are
exactly the two statements criterion 2 (and the node it implements) forbids on that reading. What
the specification leaves to the interface is only the form a cell stating neither takes, not
whether one of the two existing values may still be used.
