Feche a iniciativa atual.

Context: all 3 tasks delivered and proven (case-holds-versions-refusal,
store-deletes-a-versionless-case, delete-case-over-case-lifecycle); /review-change ran clean
(delivery.json: 0 criteria unmet). None of the review's 9 findings were judged necessary to fix
before closing — they are either pre-existing (not introduced by this delivery), scoped to
unrelated code the delivery only touched incidentally, or over-assertions in this delivery's own
new tests rather than functional defects. The one finding worth a genuine fix
(RelationalCaseStore.overwriteRevision missing the same requireCaseHoldsDraft guard
insertRevision already applies) predates this initiative and is unrelated to case deletion; it is
left for its own corrective increment rather than reopening this plan.
