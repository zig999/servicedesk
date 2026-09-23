Observed behavior, from the conformance pass of `/review-change` over this initiative
(`siegard-reconcile/operator-error-messages-ptbr-case-hypothesis-backend-review.md`), confirmed
by the human and approved for correction:

Three of the five case-version-state refusal messages this initiative's `case-version-state-messages`
task delivered interpolate the case version's raw internal lifecycle-state token (`'draft'` /
`'released'`) directly into their Brazilian-Portuguese message, instead of the fixed word that
task's own criteria required (`"rascunho"` for the draft state, `"liberada"` for the released
state). An operator reading the refusal sees, for example, `está no estado "released"` — an
English word standing where `"liberada"` belongs.

Reproduction: construct any of the three classes below with the released state and read `.message`;
the raw token appears verbatim rather than the fixed Portuguese word.

Files:
- `src/errors/case-version-not-draft.error.ts`
- `src/errors/case-version-not-draft-at-release.error.ts`
- `src/errors/case-version-not-released.error.ts`

A fourth file locks the wrong behavior in as if it were correct:
`src/__tests__/unit/errors/case-version-not-draft.error.spec.ts` asserts
`expect(error.message).toContain('released')` — the test the delivered task should have written
to catch this defect instead defends it.
