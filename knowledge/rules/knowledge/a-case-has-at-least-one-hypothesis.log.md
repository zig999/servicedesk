---
entries:
- field: statement
  unstated: The status and error name of a removal that would empty the manifest.
  decided: HTTP 422 reporting ManifestWouldHoldNoHypothesisError.
  why: The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The removal is well-formed and the result would violate the invariant, so 422 for the same reason as the release refusal.
- field: statement
  unstated: What remove-hypothesis answers when asked to remove a hypothesis name the manifest does not currently hold.
  decided: Succeeds with no effect, never refused for the name's absence.
  why: The material is the reviewed, delivered manifest-composition.operations.ts and its own test (src/__tests__/integration/case/manifest-composition.operations.spec.ts, reported by /review-change over hipotese-release-proprio), which calls store.removeManifestEntry unconditionally with no existence check first — a DELETE affecting zero rows completes the same as one affecting one. The delivered, reviewed behavior is the fact stated, rather than inventing a not-found refusal nothing built raises.
- field: statement
  unstated: The node states the removal's refusal by HTTP status and error name alone, and no node states what that refusal discloses -- which values its message names, nor which values its context carries onward to the caller as the error envelope's details.
  decided: The message names the case slug and the version number of the case version whose manifest the removal would have emptied, and the error's context carries exactly those two values, the slug and the version, and nothing else.
  why: A case version's identity in this specification is the slug and the number together, and that pin is the whole of what tells the curator which manifest refused the removal, so confining the context to it makes the structured disclosure exactly the values the message already names and adds no second disclosure -- neither the removed entry nor the manifest the refusal left standing -- that the message itself does not make.
---
