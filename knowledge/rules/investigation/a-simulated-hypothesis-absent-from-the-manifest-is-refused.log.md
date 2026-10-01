---
entries:
- field: statement
  unstated: What simulate-hypothesis answers when the hypothesis name it is given is absent from the named case version's manifest — contracts/investigation/case-simulation names the operation but, as an api, cannot declare a refusal itself (that field is command-only per the contract schema), and no rule or constraint anywhere in the specification pairs an HTTP status with this particular miss.
  decided: HTTP 404 reporting HypothesisNotInManifestError.
  why: Mirrors this specification's own established idiom for a name absent from the one set a request itself pinned — a-case-read-by-an-unknown-slug-or-version-is-refused, a-connector-configuration-read-by-an-unregistered-name-is-refused and a-glossary-read-by-an-unheld-name-is-refused all resolve an absent name with HTTP 404 and a distinctly-named …NotFoundError/…NotHeldError value rather than an ordinary empty result; a hypothesis name absent from the one manifest the request names is the same miss, so it takes the same status and the same naming idiom, scoped to what is actually absent (a manifest entry for that name).
---
