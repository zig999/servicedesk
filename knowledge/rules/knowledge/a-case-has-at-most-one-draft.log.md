---
entries:
- field: statement
  unstated: The material's own working-copy metaphor implies a single draft in flight per case, without stating this as a standing rule.
  decided: A case holds at most one version in draft state at a time.
  why: The material's own accepted numbering choice — assign the next version number the moment a draft is created, not at release — only avoids two drafts racing for the same number if at most one draft can exist per case at once; without this as a standing rule, that numbering choice has nothing stopping the collision it was meant to prevent.
- field: statement
  unstated: The status and error name of refusing a second draft.
  decided: HTTP 409 reporting CaseAlreadyHasDraftError.
  why: The material is siegard-reconcile/post-analyse-refusals-and-endings-drift.md, whose judge over src/errors/status-map.ts reported this refusal's status and error name as decided in code alone. The refusal exists in the rule; 409 is the status the backend answers for an operation the resource's current state forbids, the same reading ConceptAlreadyAnsweredError already took.
- field: statement
  unstated: This node settles only the HTTP status and the error name of a second create-draft, and the decision log's earlier entries on it are narrower still; no node states what CaseAlreadyHasDraftError's message names, nor what the refusal's details carry, though the refusal reaches the curator with both.
  decided: The message names the case slug, and the details carry that slug and nothing else -- the error's context property holding exactly the one value.
  why: A curator meeting this refusal must learn which case already holds the draft in order to act on it, and the slug is the whole of that case's identity to them, while the held draft's version number is nothing the one act open to them depends on; the delivered, reviewed error class and its own unit test already fix exactly this message and this single-valued context, so the decision names the caller-facing shape that was built rather than choosing a second one.
---
