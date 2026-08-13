---
title: An investigation carries written_at and pins its case by slug and version
summary: The investigation aggregate and the one place its pinned case is built, brought to the attributes the specification declares.
rationale: The scope names written_at and the reduced pin as two changes; they are cut as one task because both are the same aggregate's declared attribute set changing for one reason, and the inventory names one factory and one type as the home of both.
sources:
  - intake/scope.md
depends_on:
  - task/case-and-investigation-model/replay-by-slug-and-version
objective: A built investigation carries written_at and a pinned case of exactly slug and version.
criteria:
  - The pinned case carries the slug and the version of the case that ran and nothing else.
  - No module derives or reads a digest over a case's content when building an investigation.
  - A built investigation carries written_at as a datetime recording when its one write happened.
  - The factory refuses to build an investigation without written_at.
  - A built investigation carries the model, the prompt version and its evidence beside the pinned slug and version.
implements:
  - domain/investigation/investigation
  - rules/investigation/replay-is-pinned
---

## What it is

The record an audit replays from.
What pins the replay is the case by slug and version, the model, the prompt version and the evidence, and written_at says when the single write happened.

## Notes

The inventory reports pinnedCaseOf in src/src/investigation/investigation-factory.ts is the one place the pinned-case relationship is materialized, and that existing tests assert the written document field by field and by the absence of extra fields.
The inventory reports no field named written_at appears anywhere in source, fixtures or tests today.
UNDERDETERMINED, from the specification — domain/investigation/investigation declares id, requester, narrative, subject, evaluations, assessment, cost and durations as required attributes beside written_at, model, prompt_version and evidence, and no criterion above reaches those eight; a factory storing only written_at, the pinned slug and version, model, prompt_version and evidence would pass every criterion as written, and a test must exclude it.
UNDERDETERMINED, from the specification — domain/investigation/investigation declares ticket_ref optional, and no criterion above distinguishes it from the required attributes; a factory refusing to build an investigation without ticket_ref would pass every criterion as written, and a test must exclude it.
ADVISORY, from the specification — criterion 1 fixes the pin to slug and version, but their field types are declared by domain/knowledge/case, which this task does not implement; the seam is read here and governed by the task that models the case aggregate.
REMAINDER, from the specification — seven candidate Rules of the case aggregate reach no criterion of this task, which builds an investigation and neither authors nor validates a case: rules/knowledge/a-case-has-at-least-one-hypothesis, rules/knowledge/hypotheses-are-ordered-by-precedence, rules/knowledge/a-hypothesis-position-is-unique-within-its-case, rules/knowledge/a-hypothesis-name-is-unique-within-its-case, rules/knowledge/a-hypothesis-collects-at-least-one-concept, rules/knowledge/a-hypothesis-declares-a-criterion and rules/knowledge/every-position-declares-a-resolution; they belong to the task implementing domain/knowledge/case and domain/knowledge/hypothesis.
ADVISORY, from the specification — domain/knowledge/hypothesis and the two resolve-outcome scenarios govern the case's resolution and touch the investigation only through assessment and evaluation, which no criterion of this task states; they are unimplemented neighbors of this task, not scope it drops.
