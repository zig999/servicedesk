---
title: Scope seed.spec.ts's five vocabulary assertions to the fixture's own declared names
summary: Five it() blocks in seed.spec.ts now select from public.outcomes, subject_types, actions, recipients,
  concepts and concept_accepts filtered by WHERE name = ANY($1) (concept_name = ANY($1) for concept_accepts),
  using each test's own already-computed expected fixture names, instead of reading the whole shared table.
task: sha256:8c70c155c0bd9245cc0280e853ec7c515169cb05143f9c77a072e595d15c0ca2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/seed-vocabulary-assertions-scope-hotfix-scope-to-fixture-names-suite
files:
- path: src/__tests__/integration/seed.spec.ts
  effect: In the five named it() blocks (outcome names, subject-type name, action names, recipient names,
    and the concepts/concept_accepts test), changed the bare SELECT against each shared vocabulary table/pair
    to filter by the fixture's own declared names, reusing the expected value each test already computes.
    No other line, helper, comment, or the untouched subject-attribute/capability tests, was changed.
criteria:
- criterion: Running seed.spec.ts's full test file against a database where an unrelated outcome, subject-type,
    action, recipient, concept or concept_accepts row — one this fixture never declared — already stands
    permanently present (from another test file's own release-blocked cleanup) does not fail any of the
    five vocabulary assertions, and every one of them still confirms the fixture's own rows are exactly
    correct.
  met: true
  how: 'Each of the five assertions now filters its own query by WHERE name = ANY($1) (or WHERE concept_name
    = ANY($1)) built from the fixture''s own already-computed expected names — an unrelated row''s differently-named
    identity structurally cannot match that filter, so it can never appear in the result set the assertion
    compares against. Confirmed empirically: the full 89-file suite, including store-wiring.spec.ts''s
    own real leftover rows in these same tables, passes with all 12 of seed.spec.ts''s own tests green.'
- criterion: Running seed.spec.ts's full test file against a database holding none of this fixture's data
    and nothing unrelated in these tables either still passes exactly as it does today.
  met: true
  how: Postgres' ANY() over the fixture's own names matches exactly those rows whether or not anything
    else is present; an empty-of-everything-else database is the degenerate case of the same filter, unchanged
    in outcome from before this task.
- criterion: No assertion is weakened to tolerate an incorrect outcome for the fixture's own data — each
    of the five still fails if any of the fixture's own declared rows is missing, wrong, or carries an
    extra accepts/subject-type-value the fixture never declared.
  met: true
  how: Each rewritten query still selects every row matching the fixture's own declared names and still
    compares the full set against the fixture's own expected shape via toEqual — a missing, wrong, or
    extra fixture-owned row still fails the same comparison as before; only the possibility of an unrelated
    row's own name being swept into that comparison is removed.
nodes:
- node: domain/glossary/outcome
  how: 'Honored: the outcome vocabulary''s own shared, global nature (this node''s own description) is
    exactly why this test''s assertion can no longer claim exclusive ownership of the table — scoping
    to the fixture''s own names is what lets the test prove the fixture is correct without asserting a
    fact this node never made (that nothing else may ever coexist in the same vocabulary).'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/subject-type
  how: Honored the same way, for the subject-type vocabulary's own discovered, growing nature.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/action
  how: Honored the same way, for the action vocabulary's own global nature.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/recipient
  how: Honored the same way, for the recipient vocabulary's own global, stable nature.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/concept
  how: 'Honored: the concept''s own declared name, accepts and ttl are still verified in full for the
    fixture''s own concepts; only the claim that no other concept coexists in the table is dropped.'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
preserved:
- Every other it() in seed.spec.ts — the case-existence/non-conclusion-outcomes preconditions, the subject-attribute
  test (already unaffected, since nothing pins an unrelated name there), the capability test (already
  scoped), the case-read-back tests, and the two-runs-in-a-row test — is unchanged.
- Each of the five rewritten tests' own `expected` computation, and the toEqual comparison's own strictness
  over the fixture's own data, is unchanged.
---

## What it is

Five whole-table assertions were written when the shared vocabulary tables genuinely held nothing but one file's own fixture at a time — a premise a persistent, shared test database can no longer guarantee once any other file's own release-blocked cleanup leaves a permanent row behind; each is rescoped to prove only what a shared database can still support.

## Notes

This fix and the sibling correction in work/seed-fixture-isolation land in the same file; both are disclosed in each other's own records.
