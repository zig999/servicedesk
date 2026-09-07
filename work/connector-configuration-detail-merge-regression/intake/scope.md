# Corrective increment — connector configuration detail / capability detail hook regression after merge

One wrong behavior, observed by running the delivered system after merging
`worktree-buttonfooter` into `main`. The merge combined two independent changes to files in the
`use-connector-configuration-detail` / `use-capability-detail` hook family without any review
reading the union: `main` changed when validity is computed for a connector configuration read,
while the merged branch (`button-footer-standardization`) added the return-to-origin act on the
same surface. No judgment ever read the combined result.

Running the frontend suite (`npm test`) after the merge surfaced two real, reproducible failures:

1. `src/hooks/use-capability-detail.spec.ts` — "resolves the ready phase from its own direct GET,
   not from a capabilities list query the caller's cache already held for this same (name,
   version)" (criterion 1): `readyState(result.current).inputSchema.value` is expected to be the
   loaded input schema JSON but comes back as an empty string once the hook reaches its `ready`
   phase.

2. `src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts` —
   "ConnectorConfigurationDetailReadyView — Add attribute reconciles against the registered
   configuration text, not an unsaved edit" (criterion 3), "keeps reconciling against the last
   registered text after Configuration is edited but not saved": clicking Add attribute is
   expected to add "account-id" to the attribute list but the list stays empty.

`trace.py --check --all` confirms both files carry stale bindings from before the merge:
`frontend/app/src/hooks/use-connector-configuration-detail.ts` (6 bindings) and
`frontend/app/src/hooks/use-capability-detail.ts` (3 bindings) both report "the file changed
without a rebind" — consistent with a real behavioral regression introduced by the unreviewed
merge, not just documentation drift.

The corrective task should identify and fix the actual defect the merge introduced in this hook
family so both tests pass again, without weakening either test.
