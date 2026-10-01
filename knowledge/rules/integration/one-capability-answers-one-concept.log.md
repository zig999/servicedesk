---
entries:
- field: statement
  unstated: What register-capability answers when the concept is already answered by a capability of another identity, and what a concept read answers over a holding with two capabilities for one concept.
  decided: Registration is refused with HTTP 409 reporting ConceptAlreadyAnsweredError; the read is refused with HTTP 500 reporting DuplicateConceptAnswerError rather than choosing one.
  why: The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The policy already says one to one with no fallback, so a second registration must be refused rather than silently replace or coexist; 409 is the status the backend already answers for a conflicting write. A holding answering twice is a state the registry itself promised never to produce, so a read meeting it reports a server-side fault rather than a caller error, which is what 500 says and what the backend answers for an unmapped class today.
---
