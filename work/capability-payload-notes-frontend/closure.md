This initiative is closed.

All 7 tasks — payload-notes-declared-in-the-frontend-capability-contract,
payload-notes-seeded-from-the-read-answer, payload-notes-field-rendered-on-the-capability-form,
payload-notes-carried-in-the-submitted-registration,
payload-notes-dropped-when-untouched/forwarded-unconditionally,
detail-surface-presents-submitted-values-after-save/presents-the-registrys-answer,
save-tests-expect-immediate-reset/asserts-refetch-timed-reset — hold both an implementation
record and a proof record.

`/review-change` ran over the original four tasks (recorded at
delivery/capability-payload-notes-frontend/review/capability-payload-notes-frontend.md). The
three later tasks are corrective increments delivered against that review's findings, including a
real production bug the last one exposed and fixed (a render-phase sync effect that compared
React Query's `query.data` by reference, defeated by the library's own structural sharing) — no
separate review pass ran over them.

The human declared this initiative over, as recorded in intake/close-2026-09-18.md.
