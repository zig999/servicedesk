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
