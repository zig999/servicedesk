## What it is

`use-capability-detail-save.spec.ts`'s "a successful save re-baselines and clears isDirty
(criterion 5)" test and `capability-detail-screen-save.spec.ts`'s "re-disables Save immediately
after the save succeeds, with no further edits" test both assert that isDirty clears (and Save
re-disables) synchronously right after a successful save. Since
`detail-surface-presents-submitted-values-after-save/presents-the-registrys-answer`'s legitimate
delivery removed `onSuccess`'s own `form.reset(values)`/baseline-setting, isDirty now clears
only once the invalidated identity-keyed query's own refetch answers and the existing sync
effect applies it — not synchronously at the registry's answer to the write. Both tests are
falsified and must instead assert the fields hold the submitted content, and isDirty/Save stay
in their submitted state, until that refetch lands.

## Notes

None.
