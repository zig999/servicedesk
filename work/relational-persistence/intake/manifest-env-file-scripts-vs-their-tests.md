Corrective increment — one wrong behavior observed in code already delivered, answering to no task's criteria.

Route: /plan-work's corrective path (no survey, no decomposition). Target: backend (src). Initiative: relational-persistence (live work root).

Scope, as the human stated it:

Before any task of this plan touched it, `package.json`'s `migrate` and `seed` scripts were edited
by hand, outside any task, to `node --env-file=.env dist/migrate.js` and
`node --env-file=.env dist/seed.js` — so those two commands (and `start`, and a new `dev` script)
load `.env` themselves instead of requiring the invoking shell to already export
`DATABASE_URL`, `ANTHROPIC_API_KEY` and the rest of what `config/env.ts` requires. This is the
behavior to keep: it is a real, wanted capability, decided and confirmed by the human, and it does
not revert.

What that hand edit broke: two unit tests delivered by earlier tasks assert the old, literal script
text and now fail against the manifest as it actually stands:

```
FAIL src/__tests__/unit/migrate.spec.ts > the manifest declares a "migrate" script that runs the built migrate.js from dist/, mirroring "start"'s own precedent
  AssertionError: expected 'node --env-file=.env dist/migrate.js' to be 'node dist/migrate.js'

FAIL src/__tests__/unit/seed.spec.ts > the manifest declares a "seed" script that runs the built seed.js from dist/, mirroring "migrate"'s own precedent
  AssertionError: expected 'node --env-file=.env dist/seed.js' to be 'node dist/seed.js'
```

This was discovered running `npm test` as part of delivering
`task/case-authoring/seed-fixtures-resolve-against-a-real-build`: `deliver.py` refuses a proof
record pinned to a run that did not pass, and `npm test`'s own outcome is red until these two
assertions agree with the manifest, independent of anything that other task touches.

The fix updates the two tests to assert the manifest's real, current, wanted text — never the
manifest itself, which already states what is wanted. No test is weakened or narrowed: each keeps
asserting the whole script string exactly, only the literal it compares against changes to match
what the human decided to keep.
