# deliver-scope case-deletion-frontend — orchestration log

Started at HEAD 2669fe36 (main), target frontend. Ask: "pode fazer o plan, implement e review,
para front e backend conforme necessário." (the same ask that authorized case-deletion-backend;
this run carries out its frontend half). Slug: case-deletion-frontend (named directly by the
human's /siegard:deliver-scope invocation).

- Invoked /plan-work with the ask as scope, target frontend, slug case-deletion-frontend.
  Surveyed the frontend (cases-list-screen, case-detail-screen, use-cases-list, the
  connector-configuration and glossary-concept removal patterns, error-ui-state.ts,
  api-client.ts, discard-confirmation.ts). Decomposed into 1 epic (case-deletion-surface), 4
  tasks (case-holds-versions-error-state, delete-case-mutation, case-detail-delete-control,
  case-delete-refusal-presentation). Four unstated-fact-decider runs, all "decided": (1) the
  delete needs a further explicit act reproducing the case's own slug before it is issued — new
  node rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug;
  (2) an accepted delete lands the curator on the listing of every case, never a surface keyed on
  the deleted slug — new node rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case;
  (3) the surface states which of the two named refusals answered, told apart — new node
  rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete; (4) any other
  refusal is told as an unrecognised failure disclosing nothing further — new node
  rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure.
  All four disclosed in knowledge/decision-log.md. Epic's covers grew from 13 to 17 nodes to hold
  the new nodes, and all 4 tasks were re-bound against the grown candidate set. plan.json derived
  against standards/frontend-typescript.yaml: 24 specification-node references implemented (11
  unique).
  Commit: 0b48304b "deliver-scope case-deletion-frontend: plan".

- Invoked /implement-task over task/case-deletion-surface/case-holds-versions-error-state,
  target frontend, slug case-deletion-frontend. Added a case-holds-versions kind to
  error-ui-state.ts's closed union and map, following ConceptInUseError's own shape. Suite's
  first attempt failed at lint (max-lines, the new test pushed error-ui-state.spec.ts over 300
  lines); diagnosed cause: test (this delivery's own file), fixed by extracting shared test
  helpers with no assertion weakened; re-run passed clean. 3 tests (1 new, 2 pre-existing
  regression guards), 4/4 criteria met. Trace bound for 2 nodes; left 10 bindings on
  error-ui-state.ts stale (this task restamped it under different nodes than earlier binds) —
  left for this initiative's own /review-change.
  Commit: dfe31037 "deliver-scope case-deletion-frontend: deliver case-holds-versions-error-state".

- Invoked /implement-task over task/case-deletion-surface/delete-case-mutation, target frontend,
  slug case-deletion-frontend. Added useDeleteCase(), a mutation hook DELETEing /v1/cases/:slug
  and invalidating the cases-list query on success, leaving the wire error code unmapped for
  every answer other than 204/409/404 so a later task can still tell an unrecognised refusal
  apart from the two named ones. Build and suite both passed clean on the first attempt. 6 tests
  (5 for the stated criteria, 1 for the task's own UNDERDETERMINED note), 5/5 criteria met. Trace
  bound for 6 nodes; left 11 bindings on other frontend files stale — left for /review-change.
  Commit: d983871c "deliver-scope case-deletion-frontend: deliver delete-case-mutation".

- Invoked /implement-task over task/case-deletion-surface/case-detail-delete-control, target
  frontend, slug case-deletion-frontend. Added a typed-slug-confirmation delete dialog to
  CaseDetailScreen's VersionsPanel, wired to the already-delivered useDeleteCase() mutation, that
  navigates to the cases listing once accepted. Build and suite both passed clean on the first
  attempt. Test-author initially wrote a deliberately-red test asserting the surface must state
  "case was deleted", contradicting the implementer's own disclosed, criterion-satisfying choice
  under the task's fourth UNDERDETERMINED note; caught before the suite ran and re-delegated —
  the test-author removed it and instead recorded the disagreement under `contested` (the node
  rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's accepted
  clause may be unimplemented by a task that lists it whole in `implements`, left for a human to
  settle rather than a test to force). 6 tests, 4/4 criteria met. Trace bound for 6 nodes; left 15
  bindings on other frontend files stale — left for /review-change.
  Commit: c4c072ae "deliver-scope case-deletion-frontend: deliver case-detail-delete-control".

- Invoked /implement-task over task/case-deletion-surface/case-delete-refusal-presentation,
  target frontend, slug case-deletion-frontend. Wired an onError path into the case delete
  control, mapping CaseHoldsVersionsError, CaseNotFoundError and every other refusal to three
  distinguishable, inline-rendered statements (role="alert" beside the slug-confirmation input),
  disclosing nothing for an unrecognised refusal per the note this initiative's own /analyse pass
  decided. Build and suite both passed clean on the first attempt. 5 tests, 5/5 criteria met.
  Instructed the task-implementer to read (never resolve) the case-detail-delete-control proof's
  own `contested` entry before deciding how its own work reaches the accepted branch — it reaches
  only the refused branch, so it neither resolved nor compounded that disagreement. Trace bound
  for 6 nodes; left 16 bindings on other frontend files stale — left for /review-change. All 4
  tasks of this initiative now hold implementation + proof; delivery.json: 4/4 tasks, 0 criteria
  unmet, 0 unproven.
  Commit: b0539dfd "deliver-scope case-deletion-frontend: deliver+prove case-delete-refusal-presentation".
