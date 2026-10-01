---
entries:
- field: statement
  unstated: What a read or lifecycle operation answers for a slug, or slug and version, no case version answers.
  decided: Refused with HTTP 404 reporting CaseNotFoundError.
  why: The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. Every other read in this specification now names its miss; the delivered knowledge context answers exactly this, and the scenario for a case holding no versions already carves out the one neighbouring case that is not a miss.
- field: statement
  unstated: What CaseNotFoundError's HTTP 404 response's details payload carries.
  decided: The named slug and version.
  why: The material is the reviewed, delivered CaseNotFoundError class and its own test (src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts, reported by /review-change over hipotese-release-proprio), which already constructs and asserts exactly this details shape, matching the same disclosure the sibling 404s already state for their own misses.
---
