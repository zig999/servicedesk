---
title: Refuse a case version's release over a draft revision
summary: The gate a case version's release runs over every manifest entry's referenced hypothesis-revision
  state, folded into the existing release refusal.
rationale: The planning cut this as one task because the gate and the refusal that carries it are one
  outcome — a release refused whole, naming everything wrong at once — and splitting the reading of each
  entry's state from the violation it produces would leave a task whose criteria no release attempt could
  show met.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: A case version's release is refused while any of its manifest entries references a hypothesis-revision
  whose own state is draft, naming every such hypothesis among the refusal's violations.
criteria:
- Releasing a draft case version every manifest entry of which references a hypothesis-revision whose
  own state is released is not refused by this rule.
- Releasing a draft case version one manifest entry of which references a hypothesis-revision whose own
  state is draft is refused with a CaseVersionNotReleasableError.
- The refusal's violations name the hypothesis of every manifest entry whose referenced revision's own
  state is draft.
- The refusal answers HTTP 422 and introduces no error class and no error code of its own.
- A release attempt violating this rule and another release rule is refused once, with both violations
  named in the one CaseVersionNotReleasableError.
- A case version whose release this rule refuses stays in draft state.
- No hypothesis-revision a refused release referenced is altered by that attempt.
- Placing a manifest entry that pins a hypothesis-revision whose own state is draft is not refused by
  this rule.
- A hypothesis-revision's own state is unchanged by a manifest entry coming to reference it.
depends_on:
- task/hypothesis-revision-own-state/store-the-revisions-own-state
- task/hypothesis-revision-own-release/release-a-revision-directly
implements:
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
- scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
- scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
---

## What it is

The one act that turns a case version immutable, now demanding that everything its manifest commits to
has itself already stopped changing.
The violation joins the coherence violations the release refusal already aggregates, so a curator learns
every wrong thing about the attempt at once.

## Notes

The task builds on the release operation because a manifest entry referencing a released revision is what the passing case requires the system to be able to produce.
REMAINDER, from the specification — `rules/knowledge/a-release-refusal-with-no-named-violation-says-so` also states the empty-violation branch ("where release finds no rule specifically violated, the refusal says so explicitly"); this task's gate always has at least one hypothesis to name when it fires, so that branch is never exercised by any of its criteria. It belongs to the earlier act that built the existing release refusal aggregation.
ADVISORY, from the specification — the gate this task implements reads a fact of a third aggregate root, `domain/knowledge/hypothesis-revision` (outside this epic's covers), through the policy's `consistency: eventual`; no criterion addresses what a release answers when a referenced revision's own state changes concurrently with the check, which is what that eventual consistency concedes. Nothing is unstated for the criteria as written.
Decision, beyond the covers — stand: the note is informational about the eventual-consistency shape the rule already declares; no task here needs to decide or transition `domain/knowledge/hypothesis-revision`'s own state, only read it.
