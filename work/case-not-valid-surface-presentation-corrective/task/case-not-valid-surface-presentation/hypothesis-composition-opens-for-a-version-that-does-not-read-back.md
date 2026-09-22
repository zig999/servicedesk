---
title: Hypothesis composition opens for a version that does not read back as a case
summary: The New Hypothesis and Revise Hypothesis screens presenting their composition
  form for a version whose read is refused because validation does not hold for it
  at that reading.
rationale: 'The decomposition cut the hypothesis-composition screen apart from the
  other two surfaces because its outcome is the corrective act itself — a hypothesis
  composed and landed in the manifest — which is demonstrable on its own route without
  either other screen being delivered, and because its load branch is shared with
  reads of the glossary and of revisions that must stay generic, a reason to change
  the other two surfaces do not carry. The objective and criterion 2 were reworded
  during implement-against, narrowing every occurrence of "that version" to the case''s
  draft version: the prior wording admitted a released version into the same condition,
  which rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft already
  forbids a revise from reaching.'
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-and-hypothesis-composition.md
objective: The hypothesis-composition screen opened for a case's draft version that
  fails a validator rule of validation-runs-at-every-read at that reading presents
  its composition form and lands a composed hypothesis in that draft version's manifest,
  rather than presenting the statement it reserves for a read that did not complete.
criteria:
- Opening the New Hypothesis screen for a case's draft version whose read is refused
  because a validator rule of validation-runs-at-every-read does not hold for that
  draft version at that reading presents the hypothesis composition form.
- A hypothesis composed on that screen and submitted lands in that same draft version's
  manifest, with no read of that draft version having read back as a case first.
- Opening the Revise Hypothesis screen for a case's draft version in that same condition
  presents the composition form on the same terms as the New Hypothesis screen.
- A failure of that screen's read of the glossary, or of its read of the revisions,
  still presents the statement the screen makes for a read that did not complete,
  distinct from what it presents for its read of the draft version.
- A refusal of that screen's read of the draft version carrying an error code the
  screen holds no presentation of its own for still presents exactly what the screen
  states for a read that did not complete, disclosing neither the error code, nor
  the refusal's message, nor any value the refusal carries.
implements:
- rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
- rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
---

## What it is
The New Hypothesis and Revise Hypothesis routes (frontend/app/src/routes/new-hypothesis-screen.tsx and frontend/app/src/routes/revise-hypothesis-screen.tsx) both render frontend/app/src/routes/hypothesis-revision-screen.tsx over frontend/app/src/hooks/use-hypothesis-revision-form.ts, whose versionQuery failure folds into one generic load-error phase (use-hypothesis-revision-form.ts:236-241) together with the glossary and revisions failures.
This task makes that form open for a draft version that does not read back as a case and carry a composed hypothesis through to that version's manifest, which is the act that ends the condition, while the glossary and revisions failure paths keep the generic statement.

## Notes
This is a corrective increment: the survey and the decomposition did not run for the original scope of this epic, per the plan-work skill's own route for one wrong behavior in already-delivered code. This task itself is an evolution of that already-live initiative, adding a task under its existing epic once three of the epic's already-claimed nodes were found still uncovered.
Both named screens render through the one hypothesis-revision-screen.tsx component, so narrowing the case-version branch there reaches New Hypothesis and Revise Hypothesis together.
use-hypothesis-revision-form.ts reads the version both to prefill the form and to supply subject on submit, so this is where the refused read has to be answered without the version's payload.
errorStateKind over error-ui-state.ts's table already resolves CaseVersionNotValidError to kind "case-not-valid" and is the classification to reuse; the case-version branch is the only one to narrow, the glossary and revisions branches staying as they are.
The ["case-version", slug, version] query key is shared with five other hooks outside this scope, so what a failed read on that key means to those consumers is not to change.
Two specification nodes this task answers to were unstated when this task was first cut and were decided during this same plan-work invocation, blind to this task's own cut: rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete and rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case (the latter decided after this task's objective and criterion 2 were reworded to narrow "that version" to the case's draft, per a binding pass returning that wording admitted a released version that rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft already forbids). See knowledge/decision-log.md for the disclosed reasoning behind each.
ADVISORY, from the specification — this screen's own case-version statement is governed by rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case rather than by the version-keyed sibling rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case: a curator here names the case and the hypothesis and no version number, and the version read is the case's draft, which rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version already ties to the case-keyed rule's own reading wherever the case holds a draft.
UNDERDETERMINED, from the specification — criterion 2 requires the composed hypothesis to land in the manifest on submit, but the specification issues only a revise-hypothesis from this screen; the manifest entry is a separate place-hypothesis reached through the manifest builder's own offer (rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions), which this task's criteria do not reach. Passes: a screen whose submit issues revise-hypothesis and then places the entry itself at a position the screen chooses, bypassing the curator's own choice of precedence.
UNDERDETERMINED, from the specification — rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete requires the glossary and revisions statements to name which read failed, to be told apart from one another, to show nothing the failed read would have carried, and to state nothing of the case version; criterion 4 reaches none of those clauses. Passes: one undifferentiated "read did not complete" notice for both reads, naming neither, shown beside previously held terms or revisions as though they had been read.
UNDERDETERMINED, from the specification — no criterion requires the screen to hold the case-keyed statement (explicit, distinguishable from the other two) for the draft version's own refused read at all; criteria 4 and 5 presuppose it without requiring it. Passes: a screen that presents the composition form on the refused reading and says nothing at all about that refusal.
ADVISORY, from the specification — criterion 1 (via rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case) ranges over any failing validator rule including the draft's own subject type; for that specific failure rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case has the submitted revise refused with ConceptRefusesSubjectTypeError, so criterion 2's landing cannot be demonstrated over that one failing rule — it is demonstrated over the others, in particular the empty-manifest case this scope was written for.
