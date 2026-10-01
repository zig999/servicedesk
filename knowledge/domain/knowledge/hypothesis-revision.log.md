---
entries:
- field: type
  unstated: The material describes a hypothesis's content as revisioned, reused across several case versions, but does not say whether one revision is an entity living inside the hypothesis's own aggregate or a root of its own.
  decided: aggregate-root, referenced both by the hypothesis it belongs to and by the manifest entry that adopts it.
  why: A manifest entry belongs to a different aggregate (case-version) than the hypothesis whose content it adopts, and a reference may only target another aggregate's root, never reach into a sibling aggregate's own entity (SPEC-002 R11); a revision that a manifest entry outside the hypothesis aggregate must address by identity therefore has to stand as a root of its own.
---
