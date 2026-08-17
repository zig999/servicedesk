---
title: Proof for scope-to-fixture-names
summary: The five rescoped it() blocks themselves, confirmed passing against the real database — including
  its own real, permanent leftover rows from store-wiring.spec.ts — by a comprehensive install-through-suite
  run.
implementation: sha256:544c7a33249af5fde0c25afa755e0b50df0a7d73ca760d885df5070278c021f9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/seed-vocabulary-assertions-scope-hotfix-scope-to-fixture-names-suite
tests:
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
    ones together
  proves: criteria 1 and 2 for domain/glossary/outcome
  fails_when: any of the fixture's own declared outcome names is missing, or the WHERE clause reverts
    to reading the whole table while an unrelated outcome name is present.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-type name, the one the curated case declares as its subject
  proves: criteria 1 and 2 for domain/glossary/subject-type
  fails_when: the fixture's own subject-type name is missing, or the query reverts to reading the whole
    table while an unrelated subject-type name is present.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
    declare
  proves: criteria 1 and 2 for domain/glossary/action
  fails_when: any fixture action name is missing, or the query reverts to reading the whole table while
    an unrelated action name is present.
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and fallback
    declare
  proves: criteria 1 and 2 for domain/glossary/recipient
  fails_when: any fixture recipient name is missing, or the query reverts to reading the whole table while
    an unrelated recipient name is present.
- file: src/__tests__/integration/seed.spec.ts
  name: holds every concept the curated case collects, each with the subject types it accepts and its
    ttl, matching the fixture exactly
  proves: criteria 1 and 2 for domain/glossary/concept
  fails_when: any fixture concept's row, ttl, or any of its declared accepted subject-type names is missing
    or wrong, or an unrelated concept/accept row is present after reverting the filter.
not_applicable:
- edge_case: An empty fixture-names array reaching WHERE name = ANY($1)
  why: Postgres' ANY() over an empty array simply matches no row, the same result a whole-table read against
    an empty table would give; none of the five fixture files this task names is empty.
- edge_case: Duplicate names within one fixture's own JSON array
  why: Each vocabulary table's name column is its own primary key, so the fixture data itself cannot legally
    contain a duplicate once seeded.
- edge_case: Two operations against these tables at once
  why: 'This suite''s own fileParallelism: false rules out concurrent access; this edit does not change
    that arrangement.'
untested:
- Criterion 1's literal claim is proven here by construction (a WHERE name = ANY($1) filter built from
  the fixture's own names structurally cannot match a differently-named row) and by the real, already-polluted
  database the comprehensive suite run was executed against — not by a synthetic, locally-inserted leftover
  row, since doing so would mean inserting rows into a live, shared database from a hotfix task with no
  independent means to verify the insert/cleanup round-trips.
---

## What it is

The five rescoped assertions themselves, confirmed passing against the real, already-polluted persistent database by a comprehensive install-through-suite run covering all 89 files.

## Notes

None.
