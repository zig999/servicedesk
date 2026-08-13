---
title: A replay resolves its case by slug and version
summary: The replay read that takes the pinned slug and version and answers with that stored version whole, without the validation the ordinary read runs.
rationale: The scope states the replay pin becomes slug and version; this is cut ahead of the pin's own shape because the replay is the consumer that reads the pin, and a consumer stops reading a field in its own task rather than in the one that removes it. The criterion holding the ordinary read to validating is kept here so the replay's exemption is demonstrated against the rule it is the exception to, rather than on its own.
sources:
  - intake/scope.md
objective: A replay names a case version by slug and version and answers with exactly that stored version, read whole and without revalidation.
criteria:
  - The replay read takes a slug and a version and answers with the case version stored under them.
  - The replay answers a complete case — its root, its hypotheses and their resolutions and referrals — or nothing, never a case missing any of them.
  - A version stored under a slug before later versions of it were stored is answered when a replay names that version.
  - The replay answers without running the validation the ordinary read runs at its reading.
  - The ordinary read of a case by slug and version runs that validation at each reading.
  - The replay resolves its case without reading any digest over the case's content.
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/investigation/investigation
  - contracts/knowledge/case-query
  - constraints/a-case-is-read-whole
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/every-case-version-remains-readable
  - rules/investigation/replay-is-pinned
---

## What it is

The half of the case query that reads what an old investigation pinned.
Reproducibility pins content, and a version written once means the pair of slug and version names one content on its own.
Validation deciding whether a stored version is a case is the ordinary read's business, and the replay is the declared exception to it.

## Notes

The composed read-and-replay service at src/src/case/case-query.service.ts already separates the validated read from the pinned replay, and it is changed rather than replaced.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-position-is-unique-within-its-case, rules/knowledge/a-hypothesis-name-is-unique-within-its-case, rules/knowledge/hypotheses-are-ordered-by-precedence, rules/knowledge/a-case-has-at-least-one-hypothesis, rules/knowledge/a-hypothesis-collects-at-least-one-concept, rules/knowledge/a-hypothesis-declares-a-criterion and rules/knowledge/every-position-declares-a-resolution are exactly the content validation criterion 4 says the replay skips and criterion 5 says the ordinary read runs; none of this task's criteria enforces any of their statements. They belong to the task implementing the validation gate itself — the case-authoring write and/or the ordinary read.
REMAINDER, from the specification — rules/investigation/replay-is-pinned pins four things: the case by slug and version, the model, the prompt version and the evidence. This task's criteria address only the case pin; the other three belong to the task implementing how an investigation records its replay pins, under domain/investigation/investigation.
