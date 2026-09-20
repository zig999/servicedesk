---
title: The manifest builder composes a version that does not read back as a case
summary: The manifest builder's own presentation of a version whose read is refused
  because validation does not hold for it, together with the composing acts that reading
  must still offer.
rationale: The decomposition cut the manifest builder apart from the version editor
  and the hypothesis-composition screen because it delivers its own falsifiable outcome
  — the composing acts remaining offered — and carries its own reason to change in
  the write-side refusals it already classifies, which the other two surfaces do not
  hold.
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-and-hypothesis-composition.md
objective: The manifest builder opened for a version that fails a validator rule of
  validation-runs-at-every-read at that reading states explicitly that the version
  does not read back as a case and still offers the acts that compose that version's
  manifest, rather than presenting the statement it reserves for a read that did not
  complete.
criteria:
- Opening the manifest builder for a version whose read is refused because a validator
  rule of validation-runs-at-every-read does not hold for that version at that reading
  states explicitly that the version does not read back as a case.
- What that screen states for a version that does not read back as a case is distinguishable
  from what the same screen states for a read of that version that did not complete,
  and neither is presented in place of the other.
- On that same reading the screen offers the act of adding a hypothesis to that version's
  manifest, including for a version whose manifest currently holds no entry at all.
- A refusal of that screen's read of the version carrying an error code the screen
  holds no presentation of its own for still presents exactly what the screen states
  for a read that did not complete, disclosing neither the error code, nor the refusal's
  message, nor any value the refusal carries.
- A refusal of a move, a repin or a remove made through that screen still presents
  the statement that screen already holds for that named refusal, unchanged by this
  task.
implements:
- rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
- rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
---

## What it is
The manifest builder (frontend/app/src/routes/version-manifest-screen.tsx with frontend/app/src/hooks/use-manifest-builder.ts) returns one generic load-error phase for every failure of its GET /v1/cases/:slug/versions/:version read (use-manifest-builder.ts:162-164) without inspecting the error code, so the one screen a curator composes a manifest through refuses to load exactly for the version whose manifest needs composing.
This task gives that screen its own statement for the version that does not read back as a case and keeps the composing acts offered on that reading, leaving the generic statement to the refusals the screen cannot name.

## Notes
This is a corrective increment: the survey and the decomposition did not run for the original scope of this epic, per the plan-work skill's own route for one wrong behavior in already-delivered code. This task itself is an evolution of that already-live initiative, adding a task under its existing epic once three of the epic's already-claimed nodes were found still uncovered.
use-manifest-builder.ts already calls errorStateKind in its move, repin and remove error handlers for case-version-not-draft, manifest-position-occupied and manifest-would-hold-no-hypothesis; the load-side branch is the site to change and those write-side classifications stand as they are.
The write side is out of this scope's reach by the scope's own statement: PUT/DELETE on the manifest and POST of a hypothesis already refuse correctly by name, so the version's own state continues to be answered by those refusals rather than re-decided on the read.
The "does not read back as a case" statement is already worded verbatim on two delivered screens and is to be reused rather than reworded, and errorStateKind over error-ui-state.ts's table is the classification to reuse rather than a second match on error.code.
The ["case-version", slug, version] query key is shared with five other hooks outside this scope, so what a failed read on that key means to those consumers is not to change.
Four specification nodes this task answers to were unstated when this task was first cut and were decided during this same plan-work invocation, blind to this task's own cut: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case, rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions, and rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for. See knowledge/decision-log.md for the disclosed reasoning behind each.
UNDERDETERMINED, from the specification — rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case forbids presenting any attribute of the version or any entry of its manifest as the content standing at that identity, beside the explicit statement. No criterion of this task reaches that clause, and on a manifest builder it is the clause with the most to bite on, since rendering entries is what that screen ordinarily does. Passes: a manifest builder that states the version does not read back as a case, keeps the add-hypothesis act offered, and still renders the version's manifest entries recovered from the store or a prior read.
UNDERDETERMINED, from the specification — the same rule closes with "Where every validator rule holds for that version at that reading, the surface states none of this." No criterion binds the reading where the version does read back as a case. Passes: a manifest builder that displays the statement on every reading, including one whose read answered the version whole.
UNDERDETERMINED, from the specification — rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions withholds the offer only on a reading answering the version released, and carries it on a pending read too; criterion 3 reaches only the refused reading and the empty manifest. Passes: a manifest builder that offers the act on a reading answering the version released, or withholds it on a reading that has not yet answered.
UNDERDETERMINED, from the specification — rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for requires every place/remove refusal other than the two named ones to be presented as the unrecognised-failure notice, disclosing no code or message; criterion 4 is written over the version read and criterion 5 only preserves what the screen already holds, so neither criterion reaches this clause. Passes: a manifest builder that shows the raw error code or message for a place/remove refused with any other code.
UNDERDETERMINED, from the specification — that same rule also fixes that each of its two named tellings states the manifest stands unchanged, the remove telling naming the entry as still held, and that the two are told apart from each other; criterion 5 only requires the existing statement be left unchanged, not that it carry that content. Passes: a manifest builder whose ManifestWouldHoldNoHypothesisError telling omits that the manifest stands as it stood, or whose two named tellings are not distinguishable from one another.
ADVISORY, from the specification — criterion 5 names "a move, a repin or a remove", but no candidate names a move or a repin as an act distinct from place-hypothesis; the criterion is answerable only by reading a move and a repin as place-hypothesis calls.
