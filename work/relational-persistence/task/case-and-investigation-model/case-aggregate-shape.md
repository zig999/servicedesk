---
title: The case aggregate carries the attributes the model declares
summary: The Case and Hypothesis types and the structural validator, with authored_at and position admitted, hash gone, and every structural refusal of one submission arriving together.
rationale: The scope names hash leaving the case, authored_at arriving and the hypothesis declaring a position; they are one task because they are one element's declared attribute set changing, admitted or refused in the one validator the inventory says must not be duplicated. The criteria are written over a submitted case version rather than over a document, because a submission is the medium the specification states and the file the tree used is not one.
sources:
  - intake/scope.md
depends_on:
  - task/case-and-investigation-model/investigation-record-shape
objective: A case version submitted whole parses into an aggregate carrying authored_at and each hypothesis's declared position, and carrying no digest over its content.
criteria:
  - The case aggregate declares no hash, and no module derives a digest over a case's content.
  - A parsed case version carries authored_at as a datetime, and a submission that states none is refused naming that field.
  - A parsed hypothesis carries its declared position as an integer, and a submission whose hypothesis states none is refused naming that field.
  - A submission in which two hypotheses share a position is refused, naming both.
  - A submission in which two hypotheses share a name is refused, naming both.
  - A submission declaring no hypothesis is refused.
  - A submission whose hypothesis collects no concept is refused, naming the hypothesis.
  - A submission whose hypothesis carries an empty criterion is refused, naming the hypothesis.
  - A submission in which a hypothesis or the fallback declares no outcome, or no referral, is refused naming that position.
  - A submission violating several of these conditions is refused once, with every violation named together.
  - A submission violating none of these conditions is not refused by this validation.
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - contracts/knowledge/author-case-version
  - contracts/system/case-authoring
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/every-position-declares-a-resolution
---

## What it is

The aggregate the whole knowledge context is, and the validator that decides whether a submission is one.
A version is identified by slug and version, carries when it was authored, and declares its hypotheses at positions rather than by arrangement.
Every refusal a submission earns arrives at once, so a curator sees the whole of what is wrong.

## Notes

The inventory names ten consumers of the hash field and seven of the hypothesis ordering, which observe this change together.
The validator at src/src/case/parse-case-document.ts collects every violation in one pass and throws one error naming them all, which this task keeps.
This task stays in this epic rather than moving to epic/case-authoring because it changes the aggregate and its validator, which the authoring command calls rather than contains.
REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read's illustration "at each load by the engine" is not addressed by this task's criteria, which cover only the authoring-write instance; it belongs to the task implementing contracts/knowledge/case-query.
REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read's second clause, "a replay reads the pinned version without revalidation," reaches no criterion here; it belongs to the task implementing rules/investigation/replay-is-pinned.
REMAINDER, from the specification — rules/knowledge/hypotheses-are-ordered-by-precedence's statement is a domain fact its own description says is verified by human review rather than the validator, so no criterion of this structural task answers it; it belongs to the task implementing resolve-outcome, covered by scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome and scenarios/knowledge/no-confirmation-falls-back.
REMAINDER, from the specification — rules/investigation/replay-is-pinned describes investigation's own pinning obligation, not an attribute or refusal of the case aggregate; it reaches no criterion here and belongs to the task implementing domain/investigation/investigation.
