# deliver-scope case-deletion-backend — orchestration log

Started at HEAD a7aa31f3 (main), target backend. Ask: "pode fazer o plan, implement e review,
para front e backend conforme necessário." Scope: implement the `delete` operation of the `Case`
aggregate, decided in the /analyse increment committed at a7aa31f3 (rule
rules/knowledge/a-case-holding-no-version-may-be-deleted). Slug derived and disclosed:
case-deletion-backend (front and backend are split into two initiatives per this project's own
convention, e.g. subject-attribute-glossary-removal-backend/-frontend; the frontend half, if
warranted, is a separate deliver-scope run under case-deletion-frontend).

- Invoked /plan-work with the ask as scope, target backend, slug case-deletion-backend.
  Decomposed into 1 epic (case-deletion), 3 tasks (case-holds-versions-refusal,
  store-deletes-a-versionless-case, delete-case-over-case-lifecycle). Two unstated-fact-decider
  runs, both "decided": (1) deleting a case with no version also removes every hypothesis
  referencing it, their hypothesis-revisions (released included) and collects — no operation ever
  removes a hypothesis otherwise, so a case emptied by discard would stay permanently
  undeletable; folded into rules/knowledge/a-case-holding-no-version-may-be-deleted's own
  statement and constrains. (2) an accepted delete answers HTTP 204 with no body, matching the
  sibling removal constraints already in the specification; recorded as a new node,
  constraints/a-successful-case-deletion-answers-with-no-content. Both disclosed in
  knowledge/decision-log.md. Epic's covers grew from 12 to 15 nodes to hold the touched/new nodes,
  and all three tasks were re-bound against the grown candidate set — no further unstated facts on
  re-bind. plan.json derived against standards/backend-node-service.yaml: 25 specification-node
  references implemented (15 unique).
  Commit: aae8efa3 "deliver-scope case-deletion-backend: plan".

- Invoked /implement-task over task/case-deletion/case-holds-versions-refusal, target backend,
  slug case-deletion-backend. New CaseHoldsVersionsError domain error, registered at HTTP 409 in
  status-map.ts. Build's first attempt failed on one unrelated pre-existing timing flake
  (anthropic-assessment-consolidator.adapter.spec.ts, elapsed_ms >= 20 got 19); re-run and full
  suite both passed clean. 6 tests written, 8/8 criteria met. Trace bound for 4 nodes; bind left
  42 bindings on status-map.ts stale (this task restamped it under different nodes than earlier
  binds) — left for this initiative's own /review-change to answer, not a standalone /reconcile.
  Commit: de183c21 "deliver-scope case-deletion-backend: deliver case-holds-versions-refusal".

- Invoked /implement-task over task/case-deletion/store-deletes-a-versionless-case, target
  backend, slug case-deletion-backend. ICaseStore.delete + RelationalCaseStore.delete
  implemented; five pre-existing test doubles fixed by the test-authoring role after an
  interface-widening compile break. Suite caught a real FK violation (cause: code) from
  PostgreSQL's own released-collects protection rule (migration 0021) silently defeating the
  cascade delete; fixed with new migration 0026 narrowing that rule for a case holding zero
  case_versions rows. Re-running the suite then surfaced a genuine regression in
  src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts,
  owned by the closed initiative hipotese-release-proprio
  (task/hypothesis-revision-own-state/refuse-altering-a-released-revision) — that test's own
  fixture asserts released-revision collects always survive a DELETE, without ever giving the
  case a case_versions row, which is exactly the shape this initiative's rule now carves an
  exception for. Diagnosed cause: test, confirmed no overlap between this delivery's files and
  the owning task's files. Per /implement-task's own protocol this is not this delivery's test
  to edit; the fix (a proof-only re-delivery over the owning task) is the human's to invoke, and
  is not directly available since that initiative is closed — it needs a corrective increment
  instead. STOPPED HERE: committed the implementation without a proof record (build pins clean,
  suite does not), and handed the situation back to the human rather than improvising past it.
  Commit: 8f3a506a "deliver-scope case-deletion-backend: deliver store-deletes-a-versionless-case
  (implemented, unproven)".

- Resolved the cross-initiative regression via /analyse: rules/knowledge/a-released-revisions-collect-removal-is-accepted-with-no-effect
  gained an exception (no-effect only while the case still holds a version; the case-delete's own
  cascade removes the collect once it holds none), cross-checked and logged. Commit: 445050f3
  "analyse: reconcile released-revision collect no-effect with case delete".
- Resumed test-authoring for task/case-deletion/store-deletes-a-versionless-case: fixed the sibling
  test's fixture and added a case proving the new exception directly. Suite passed
  (run-4). Proof written and validated; delivery.json now holds 2/3 tasks with implementation+proof.
  Commit: 3cf6b13c "deliver-scope case-deletion-backend: prove store-deletes-a-versionless-case".

- Invoked /implement-task over task/case-deletion/delete-case-over-case-lifecycle, target
  backend, slug case-deletion-backend. DELETE /v1/cases/:slug wired through the whole
  operation/controller/route/dto stack into CaseLifecycleOperations and build-app.ts. Two build
  attempts fixed pre-existing test-double compile breaks (test-authoring role). Suite: one
  unrelated flake retried clean; two genuine test-fixture bugs (an accidental "case" substring in
  a test slug; a page-limited listing assertion against the shared long-lived test DB) diagnosed
  cause: test and fixed by the test-authoring role. Suite passed (run-3). All three tasks of this
  initiative now hold implementation + proof; delivery.json: 3/3 tasks, 0 criteria unmet, 0
  unproven. Commit: 28d7ef13 "deliver-scope case-deletion-backend: deliver+prove
  delete-case-over-case-lifecycle".

- Invoked /review-change over the 3 delivered tasks, target backend, slug case-deletion-backend,
  reviewed set: the 23 files the 3 tasks' implementation/proof records wrote, plus
  src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts (named by
  delete-case-over-case-lifecycle's proof as demonstrating
  constraints/the-domain-depends-on-no-infrastructure). Captured a clean whole-suite run at
  run/case-deletion-backend (install, typecheck, lint, secret-scan, unit, full suite — all
  green), so the failures pass has nothing to diagnose. Staged the conformance pass via
  trace.py --stage --review over the 23 files plus 3 certifications (rules/knowledge/a-case-holding-no-version-may-be-deleted,
  scenarios/knowledge/a-case-holding-no-version-is-deleted, constraints/the-domain-depends-on-no-infrastructure);
  delegated 23 specification-conformance-reviewer passes (one per file), 1 standard-conformance-reviewer
  pass, 3 coverage-auditor certifications and 1 coverage-auditor pass over the 3 tasks' 28
  criteria — batched across the 20-concurrent-subagent ceiling in several waves across this
  session (interrupted once by a context compaction; resumed by re-checking which returns were
  already saved and re-launching only what had not completed).
  Findings: conformance pass found 6 (2 over-asserted test wording in
  case-holds-versions.error.spec.ts beyond what the specification states; 2 against
  case-query.service.spec.ts — a pre-existing English-language coherence-violation message and
  an English domain noun, both contradicting fixed-vocabulary/Portuguese-message constraints,
  pre-existing and not introduced by this delivery; 2 against
  relational-case-store.repository.ts — an unstated hypotheses-listing order, and
  overwriteRevision missing the same requireCaseHoldsDraft guard insertRevision already applies).
  Standard pass found 3 (no resource-level authorization on any route, SEC-01; the repository
  constructor coupled directly to pg.Pool rather than a narrow port, ARC-01; the "case holds a
  version" business refusal raised from inside the repository rather than the operation layer,
  COR-03 — all three pre-existing patterns this delivery followed rather than introduced).
  Coverage: 28 criteria — 20 covered, 7 partial, 1 uncovered (no test reads the delete
  operation's own module for infra-free imports); 203 unpaired tests, almost all pre-existing
  tests of sibling behavior caught only because their files were widened to satisfy the
  ICaseStore interface change. Certifications: a-case-holding-no-version-is-deleted covered;
  a-case-holding-no-version-may-be-deleted and the-domain-depends-on-no-infrastructure both
  partial (decided by reading, each with a stated testable remainder). Folded via trace.py
  --fold into siegard-reconcile/case-deletion-backend.md (68 nodes cleared, 14 not), bound via
  trace.py --bind-record (68 bindings written). Composed
  delivery/case-deletion-backend/review/case-deletion-backend.md; deliver.py --check passed and
  delivery.json re-derived (7 nodes, 25 edges, 9 findings, 5 criteria recorded unproven, 0
  unmet).
