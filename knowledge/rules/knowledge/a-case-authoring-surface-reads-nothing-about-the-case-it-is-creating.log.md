---
entries:
- field: statement
  unstated: Whether a case-authoring surface must refuse to read the case being created (by its own typed slug) before submitting create-draft. Surfaced by /review-change's specification-conformance pass over case-creation-screen-corrective, evidence at frontend/app/src/routes/case-creation-screen-submission.spec.ts, which asserts zero reads of /v1/cases/{typedSlug} before the POST.
  decided: A case-authoring surface issues no read against the curator's typed slug before submitting create-draft; the curator's own typed slug is the only thing the surface holds about the case's identity until create-draft answers. Recorded as a new invariant over domain/knowledge/case.
  why: rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug already settles both branches create-draft can take on a typed slug -- creating a case where none holds it, originating the existing case's next draft where one does -- and neither branch is a refusal, so there is no wrong answer for a pre-read to warn the curator away from. A read that confirmed either branch would tell the surface nothing it does not already know how to handle, and would put the surface in the business of judging slug availability, a judgment already placed entirely on create-draft itself.
---
