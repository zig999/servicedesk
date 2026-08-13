---
title: Every store is wired from the connection and no file holds a record
summary: The factories and the environment rebuilt around one connection for the four persistence stores, with their file repositories and file helper gone from the tree.
rationale: The scope asks for the system working end to end against the database; the wiring is cut as one task because every factory changing from a directory to a connection is one decision, and the removal of the file repositories is what makes that decision observable. The criteria now name the four stores' own data directories rather than every file path the environment schema declares, because the scope names casos, glossário, registro de capacidades and investigações and nothing else — a different capability's fixture sits outside that list.
sources:
  - intake/scope.md
depends_on:
  - task/relational-stores/case-store
  - task/relational-stores/glossary-store
  - task/relational-stores/capability-store
  - task/relational-stores/investigation-store
objective: The composed application builds its four persistence stores — case, glossary, capability registry and investigation — from the one configured connection, and nothing in them reads or writes a file to hold a record.
criteria:
  - Each of the four stores — case, glossary, capability registry and investigation — is constructed in its own factory from the connection, and no factory receives a data-directory path for any of those four.
  - The environment schema declares no data-directory variable for the case, glossary, capability-registry or investigation store.
  - No module belonging to the case, glossary, capability-registry or investigation store reads or writes a file to hold a record, and the four file repositories and the file helper they shared are gone.
  - The composed application builds its four stores from the environment alone.
  - Every record one of the four stores answers comes from the same connection.
implements:
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-database-is-externally-provisioned
---

## What it is

The composition a deployment enters through, for the four things this initiative's scope names.
One connection answers for every case, vocabulary, capability registration and investigation, so no fact among those four is split across two media.

## Notes

The inventory names the wiring chain — diagnose-server.factory.ts, case-query.factory.ts and production-diagnose.factory.ts — and the convention that a store's location arrives as a constructor argument rather than being written in source.
Out of scope, untouched: OBSERVATIONS_FIXTURE_FILE in src/src/config/env.ts backs FakeObservationSource, a stand-in for contracts/integration/corporate-records-source — a different capability's fixture, not one of the four stores casos, glossário, registro de capacidades and investigações this initiative's scope names. Nothing in this task removes it, reads it, or asserts anything about it.
Decision, beyond the covers — stand: contracts/integration/corporate-records-source is named only to say this task leaves it untouched; it answers to no store this initiative's scope names and is claimed by no epic here.
The inventory names ten consumers of the four data-directory variables and the fixture path; the ten this task is observed by are the four stores' own, not the observation-source fixture.
REMAINDER, from the specification — "persists in one transactional relational store" of constraints/the-system-persists-to-one-relational-database reaches no criterion here; the transactional half is demonstrated per store, by task/relational-stores/investigation-store and task/relational-stores/database-access-helper.
REMAINDER, from the specification — "the database is provisioned outside the deployment" and "the deployment provisions no database service" of constraints/the-database-is-externally-provisioned reach no criterion here; that clause is carried by task/relational-substrate/database-connection, whose criterion 3 states it.
