---
entries:
- field: statement
  unstated: Whether a release refusal that carries no specific violation must say so explicitly, or may instead surface as an empty, unexplained list.
  decided: A curator refused a release is always told why; where release finds no rule specifically violated, it says so explicitly rather than leaving the curator with an unexplained, empty refusal.
  why: '"What someone is told at an outcome is what the business decided" (a refusal''s wording is never surface) — an empty list with no text leaves the curator unable to tell a genuine absence of findings from a broken response, so the specification must state which reading holds; explicit disclosure is the smaller, strictly more informative statement and costs the domain nothing the aggregation mechanism (contracts/knowledge/case-lifecycle) does not already presuppose.'
- field: statement
  unstated: The status and error name of a release refused over violated rules.
  decided: HTTP 422 reporting CaseVersionNotReleasableError, naming every violated rule together.
  why: The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The rule already required the curator be told why; 422 says the request was well-formed and the content would violate an invariant, the reading the sibling registration refusals took.
- field: statement
  unstated: Whether the refusal answering a release blocked by violated rules names, in its own message, the case slug and the version number of the draft whose release was refused, beside the violated rules it names.
  found: 'work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md, line 20: `case-version-not-releasable.error.ts` — "the case \"{slug}\" version {version} cannot be released: {violations}" — the case slug and the version are already named in the message this class raises today.'
---
