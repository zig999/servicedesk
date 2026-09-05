---
type: policy
statement: A case version's release requires every manifest entry it composes to reference a
  hypothesis-revision in released state; placing a manifest entry is never refused for
  referencing one in draft state, but a release attempted while any entry still does is refused,
  naming the hypothesis of every such entry among the CaseVersionNotReleasableError's violations
  (rules/knowledge/a-release-refusal-with-no-named-violation-says-so).
expression: For a case version v released with manifest entries e1..en, every ei's referenced
  hypothesis-revision.state == released; where some ei's referenced hypothesis-revision.state ==
  draft, release is refused and the violation names every such ei's hypothesis, together with
  every other rule the same release attempt violates. place-hypothesis is never refused by this
  rule, whatever state the revision it references is in.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

The manifest is only ever selection: a case version's own release is what a released version's manifest promises to keep answering forever, and that promise now rests on each hypothesis-revision's own release rather than on a case version freezing whatever it happened to reference. This is the other half of the inversion `a-hypothesis-revision-is-overwritten-while-unreleased` and `a-released-hypothesis-revision-is-never-altered` already made: those two rules stopped reading a case version to decide a hypothesis-revision's own fate; this rule is what a case version's own release now reads instead — the hypothesis-revision's own state, never the other way around.
Gating this at release rather than at placement is deliberate: a draft's manifest stays exactly as freely composed as `case-version` already promises, pointing at a draft or a released revision alike, so a curator can place, remove and simulate against an unreleased hypothesis without ever touching this rule. Only the one act that turns a case version immutable also demands that everything it commits to has itself already stopped changing.
This is a policy rather than an invariant because it reads a fact of a third aggregate root, hypothesis-revision, that neither case-version nor manifest-entry itself declares — the same reasoning `a-hypothesis-is-revised-only-against-its-cases-draft` already gives for crossing from case-version to hypothesis.
