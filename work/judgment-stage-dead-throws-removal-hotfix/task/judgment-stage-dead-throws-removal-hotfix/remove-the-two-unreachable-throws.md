---
title: Remove judgment-stage.ts's two throws for conditions the specification already makes unreachable
summary: Removes hypothesisNamed's and evidenceFor's throws in judgment-stage.ts for a hypothesis
  name or evidence entry that the case's own manifest and collection plan already guarantee will
  resolve, as dead defensive code — never replacing them with a new behavior or a silent default.
objective: judgment-stage.ts no longer throws for a required hypothesis name failing to resolve in
  the pinned case's manifest, or for a required hypothesis having no evidence-map entry — both
  conditions the case aggregate and the collection stage's own totality already make unreachable —
  and judgeHypotheses' other observable behavior is unchanged, with no new default, fallback, or
  silent optional value introduced in either branch's place.
criteria:
- Every name requires-evaluation-of(case) returns resolves to a hypothesis in that same case's own
  manifest (rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses);
  judgment-stage.ts's hypothesisNamed no longer contains a throw for the case where it does not.
- The evidence map judgment-stage.ts is given always holds an entry for every hypothesis
  requires-evaluation-of(case) names, given that hypothesis collects at least one concept;
  judgment-stage.ts's evidenceFor no longer contains a throw for the case where it does not.
- Neither hypothesisNamed nor evidenceFor is rewritten to return an optional or undefined value for
  the condition its throw is removed from — their return types stay non-optional (a Hypothesis; an
  evidence array), so a silent fallback cannot type-check in the throw's place.
- Neither removal introduces a new fallback or default value for the condition it removes — the
  code path is deleted because it is unreachable, not replaced with a synthesized hypothesis or an
  empty evidence array standing in for a case the specification does not admit.
- judgeHypotheses' observable behavior over a pinned case's own required hypotheses is unchanged
  by this removal — every existing passing test for the judgment stage still passes.
implements:
- domain/knowledge/case-version
- rules/investigation/one-evaluation-per-required-hypothesis
- rules/investigation/one-evidence-per-collected-concept
- rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
sources:
- intake/scope.md
---

## What it is

The corrective removal of judgment-stage.ts's hypothesisNamed and evidenceFor throws for two
conditions the specification's own guarantees (the case manifest, per
rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses, and the collection
plan's totality) already make unreachable — deleted, never replaced with a new default or a silent
optional fallback.

## Notes

Decided while this task was bound: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
now states explicitly that requires-evaluation-of lists exactly the manifest's own hypothesis
names, and never the case version's fallback — settling that hypothesisNamed's throw condition is
genuinely unreachable.
ADVISORY, from the binder — criterion 2's proviso (a required hypothesis collects at least one
concept) is backed by rules/knowledge/a-hypothesis-collects-at-least-one-concept, which sits
outside this epic's covers; the criterion names that dependency in prose without claiming to
implement the node.
Decision, beyond the covers — stand: rules/knowledge/a-hypothesis-collects-at-least-one-concept is
not claimed in implements; this task authors no hypothesis-revision and changes nothing about the
minimum-one-concept rule itself.
ADVISORY, from the binder — criterion 1 requires only that a name resolve to a hypothesis in the
manifest, not that it resolve to exactly one; rules/knowledge/a-hypothesis-name-is-unique-within-its-case
declares `consistency: eventual`, so a transient collision is tolerated by this wording and by the
removal, and the criterion does not depend on that node.
Decision, beyond the covers — stand: rules/knowledge/a-hypothesis-name-is-unique-within-its-case is
not claimed in implements; this task changes no manifest-composition or name-collision behavior.
REMAINDER, from the specification — both clauses of
rules/investigation/collection-has-its-own-budget-within-the-total (the collection stage's own
seven-second bound; a capability's declared timeout clamped to it) reach no criterion of this
task and belong to the investigation's deadline and per-stage budget work, not this removal.
Decision, beyond the covers — stand: rules/investigation/collection-has-its-own-budget-within-the-total
is not claimed in implements; this task changes no collection-stage time bound.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-collects-at-least-one-concept's
refusal clause (HTTP 422 HypothesisRevisionCollectsNoConceptError) reaches no criterion; it
belongs to the act that authors and validates hypothesis-revisions.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-name-is-unique-within-its-case's
whole statement reaches no criterion; it belongs to the act that authors hypotheses and composes a
manifest, where name collision is refused.
ADVISORY, from the binder — criterion 2's "always holds an entry" survives a collection timeout
only because rules/investigation/one-evidence-per-collected-concept states its totality
unconditionally; the reconciling scenario
(scenarios/investigation/a-collection-timeout-degrades-to-no-data) sits outside this epic's covers
and is not claimed here.
Decision, beyond the covers — stand: scenarios/investigation/a-collection-timeout-degrades-to-no-data
is not claimed in implements; this task's evidence-totality premise rests on the unconditional
invariant alone, and the timeout scenario is unchanged by this removal.
