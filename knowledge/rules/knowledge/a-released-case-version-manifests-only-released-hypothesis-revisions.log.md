---
entries:
- field: statement
  unstated: 'The read material decides that a case version''s release must refuse when any manifest entry still points at a draft hypothesis-revision, and that the refusal must list every such hypothesis, but leaves open (its own §6, point D) which refusal shape carries that: a new HTTP status and error code of its own, or the existing release-refusal aggregation.'
  decided: No new error code. The violation is one more rule CaseVersionNotReleasableError's existing aggregation names together with whatever else the same release attempt violates, exactly as rules/knowledge/a-release-refusal-with-no-named-violation-says-so already generalizes for every structural or coherence rule constraining case-version.
  why: 'The material''s own point D names this precedent directly — "CaseVersionNotReleasableError já lista violações de coerência de forma parecida... o padrão para ''hipóteses do manifest ainda em draft'' deveria seguir esse mesmo formato" — and the release-refusal aggregation mechanism already presupposes exactly this shape: a rule constrains case-version and states its own violation in domain terms, and release names every violated rule together in one HTTP 422 response, never invents a parallel refusal channel per rule.'
---
