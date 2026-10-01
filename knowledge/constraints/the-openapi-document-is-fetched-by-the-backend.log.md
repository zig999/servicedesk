---
entries:
- field: statement
  unstated: Whether the backend-only fetch this constraint already gives the draft operation also binds the new read of a document's operations, which fetches the same operator-named link before any operation is chosen.
  decided: Yes — the same link, read for either purpose, is fetched only by the backend; no frontend module issues either fetch directly.
  why: The CORS dependency and the single auditable path this constraint exists for follow from the link being operator-supplied and external, which is equally true of the read that lists a document's operations before a draft is ever requested from one of them.
---
