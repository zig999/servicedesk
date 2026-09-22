---
title: PT-br messages for the hypothesis and manifest refusals the backend returns
summary: The eight hypothesis-revision and manifest error classes under src/src/errors whose message text
  the HTTP error envelope hands the operator, rewritten in PT-br.
rationale: These eight refusals speak about a hypothesis revision, the concepts it collects and the manifest
  entry that pins it, and none of them names a case slug or version as the thing refused, so they change
  for reasons the case-domain messages do not share and are held in an epic of their own.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
covers:
- domain/glossary/concept
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
- rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-case-has-at-least-one-hypothesis
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/the-concept-read-refuses-an-unanswered-concept
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/judgment-runs-behind-a-port
- constraints/the-judgment-prompt-is-closed
- constraints/consolidation-runs-behind-a-port
- constraints/the-consolidation-prompt-is-closed
- constraints/diagnosis-answers-synchronously
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/the-evidence-cache-admits-only-ok-results
- constraints/the-deadline-is-an-absolute-propagated-instant
- rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
- rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
uncovered:
- node: domain/glossary/concept
  why: It states what a named observation a hypothesis collects is; no task's final implements needed it
    once case-terms-exist-in-the-glossary, a-concept-accepts-the-declared-subject-type and
    a-hypothesis-collects-at-least-one-concept settled the three concept-collection refusals directly.
- node: domain/knowledge/case-version
  why: The task naming a case version's subject type (ConceptRefusesSubjectTypeError) settled that value's
    disclosure against a-concept-accepts-the-declared-subject-type's own statement instead; no task's
    final implements reached this node directly.
- node: domain/knowledge/manifest-entry
  why: It states a manifest entry's position and revision reference; no task's final implements needed it
    once the three manifest refusals were settled directly against
    a-simulated-hypothesis-absent-from-the-manifest-is-refused, a-hypothesis-position-is-unique-within-its-case
    and a-case-has-at-least-one-hypothesis.
- node: rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  why: It states that this node introduces no refusal of its own — the ConceptRefusesSubjectTypeError
    branch it also answers is governed by a-concept-accepts-the-declared-subject-type, which the task
    implements instead; carried as an advisory in that task's Notes rather than as a second implements
    entry for the same message.
- node: constraints/the-concept-read-refuses-an-unanswered-concept
  why: It names ConceptNotAnsweredError on the registry's read-capability route, which is not one of the
    eight classes the scope lists.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: It decides how judgment is called and raises none of the eight classes.
- node: constraints/judgment-runs-behind-a-port
  why: It places judgment behind a port and names no refusal message.
- node: constraints/the-judgment-prompt-is-closed
  why: It closes a prompt's text, which is not a refusal the envelope carries.
- node: constraints/consolidation-runs-behind-a-port
  why: It places consolidation behind a port and names no refusal message.
- node: constraints/the-consolidation-prompt-is-closed
  why: It closes a prompt's text, which is not a refusal the envelope carries.
- node: constraints/diagnosis-answers-synchronously
  why: It decides when an answer arrives, not what a refusal says.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: It governs evidence normalization, which raises none of the eight classes.
- node: constraints/the-evidence-cache-admits-only-ok-results
  why: It governs what the evidence cache admits and names no refusal message.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  why: It governs how a deadline travels and names no refusal message.
- node: rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
  why: It states what a frontend composing surface tells the curator about a read that did not complete,
    and the frontend is not this scope's target.
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  why: It governs what a listing discloses on a successful read, not the text of a refusal.
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  why: It governs what a presented manifest entry discloses, not the text of a refusal.
- node: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  why: It states what the frontend manifest surface tells the curator for these two refusals and expressly
    forbids it repeating the refusal's own message, so the backend wording is unobservable through it.
- node: rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
  why: It governs what a presented manifest entry discloses, not the text of a refusal.
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  why: It governs what a presented manifest entry discloses, not the text of a refusal.
---
## What it is
The eight hypothesis-revision, concept and manifest error classes named by the scope, each rewritten so the message the envelope hands the operator is PT-br.
One of the eight, HypothesisRevisionNotDraftAtReleaseError, takes no constructor argument and carries a fixed message with no interpolation and no context.
The epic changes message text only: no class name, no status mapping, no context object and no envelope shape.

## Notes
The frontend rules in this slice are the strongest reason none of them reaches a task: two of them state that the surface presents its own wording and discloses neither the error code nor the refusal's message.
The judgment, consolidation and evidence constraints sit in this slice because they speak about hypotheses, not because any of the eight messages reports them.
